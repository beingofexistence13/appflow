/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors"], function (require, exports, arrays_1, cancellation_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapPager = exports.DelayedPagedModel = exports.PagedModel = exports.singlePagePager = void 0;
    function createPage(elements) {
        return {
            isResolved: !!elements,
            promise: null,
            cts: null,
            promiseIndexes: new Set(),
            elements: elements || []
        };
    }
    function singlePagePager(elements) {
        return {
            firstPage: elements,
            total: elements.length,
            pageSize: elements.length,
            getPage: (pageIndex, cancellationToken) => {
                return Promise.resolve(elements);
            }
        };
    }
    exports.singlePagePager = singlePagePager;
    class PagedModel {
        get length() { return this.pager.total; }
        constructor(arg) {
            this.pages = [];
            this.pager = Array.isArray(arg) ? singlePagePager(arg) : arg;
            const totalPages = Math.ceil(this.pager.total / this.pager.pageSize);
            this.pages = [
                createPage(this.pager.firstPage.slice()),
                ...(0, arrays_1.range)(totalPages - 1).map(() => createPage())
            ];
        }
        isResolved(index) {
            const pageIndex = Math.floor(index / this.pager.pageSize);
            const page = this.pages[pageIndex];
            return !!page.isResolved;
        }
        get(index) {
            const pageIndex = Math.floor(index / this.pager.pageSize);
            const indexInPage = index % this.pager.pageSize;
            const page = this.pages[pageIndex];
            return page.elements[indexInPage];
        }
        resolve(index, cancellationToken) {
            if (cancellationToken.isCancellationRequested) {
                return Promise.reject((0, errors_1.canceled)());
            }
            const pageIndex = Math.floor(index / this.pager.pageSize);
            const indexInPage = index % this.pager.pageSize;
            const page = this.pages[pageIndex];
            if (page.isResolved) {
                return Promise.resolve(page.elements[indexInPage]);
            }
            if (!page.promise) {
                page.cts = new cancellation_1.CancellationTokenSource();
                page.promise = this.pager.getPage(pageIndex, page.cts.token)
                    .then(elements => {
                    page.elements = elements;
                    page.isResolved = true;
                    page.promise = null;
                    page.cts = null;
                }, err => {
                    page.isResolved = false;
                    page.promise = null;
                    page.cts = null;
                    return Promise.reject(err);
                });
            }
            const listener = cancellationToken.onCancellationRequested(() => {
                if (!page.cts) {
                    return;
                }
                page.promiseIndexes.delete(index);
                if (page.promiseIndexes.size === 0) {
                    page.cts.cancel();
                }
            });
            page.promiseIndexes.add(index);
            return page.promise.then(() => page.elements[indexInPage])
                .finally(() => listener.dispose());
        }
    }
    exports.PagedModel = PagedModel;
    class DelayedPagedModel {
        get length() { return this.model.length; }
        constructor(model, timeout = 500) {
            this.model = model;
            this.timeout = timeout;
        }
        isResolved(index) {
            return this.model.isResolved(index);
        }
        get(index) {
            return this.model.get(index);
        }
        resolve(index, cancellationToken) {
            return new Promise((c, e) => {
                if (cancellationToken.isCancellationRequested) {
                    return e((0, errors_1.canceled)());
                }
                const timer = setTimeout(() => {
                    if (cancellationToken.isCancellationRequested) {
                        return e((0, errors_1.canceled)());
                    }
                    timeoutCancellation.dispose();
                    this.model.resolve(index, cancellationToken).then(c, e);
                }, this.timeout);
                const timeoutCancellation = cancellationToken.onCancellationRequested(() => {
                    clearTimeout(timer);
                    timeoutCancellation.dispose();
                    e((0, errors_1.canceled)());
                });
            });
        }
    }
    exports.DelayedPagedModel = DelayedPagedModel;
    /**
     * Similar to array.map, `mapPager` lets you map the elements of an
     * abstract paged collection to another type.
     */
    function mapPager(pager, fn) {
        return {
            firstPage: pager.firstPage.map(fn),
            total: pager.total,
            pageSize: pager.pageSize,
            getPage: (pageIndex, token) => pager.getPage(pageIndex, token).then(r => r.map(fn))
        };
    }
    exports.mapPager = mapPager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vcGFnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXdCaEcsU0FBUyxVQUFVLENBQUksUUFBYztRQUNwQyxPQUFPO1lBQ04sVUFBVSxFQUFFLENBQUMsQ0FBQyxRQUFRO1lBQ3RCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsR0FBRyxFQUFFLElBQUk7WUFDVCxjQUFjLEVBQUUsSUFBSSxHQUFHLEVBQVU7WUFDakMsUUFBUSxFQUFFLFFBQVEsSUFBSSxFQUFFO1NBQ3hCLENBQUM7SUFDSCxDQUFDO0lBWUQsU0FBZ0IsZUFBZSxDQUFJLFFBQWE7UUFDL0MsT0FBTztZQUNOLFNBQVMsRUFBRSxRQUFRO1lBQ25CLEtBQUssRUFBRSxRQUFRLENBQUMsTUFBTTtZQUN0QixRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU07WUFDekIsT0FBTyxFQUFFLENBQUMsU0FBaUIsRUFBRSxpQkFBb0MsRUFBZ0IsRUFBRTtnQkFDbEYsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xDLENBQUM7U0FDRCxDQUFDO0lBQ0gsQ0FBQztJQVRELDBDQVNDO0lBRUQsTUFBYSxVQUFVO1FBS3RCLElBQUksTUFBTSxLQUFhLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRWpELFlBQVksR0FBb0I7WUFKeEIsVUFBSyxHQUFlLEVBQUUsQ0FBQztZQUs5QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBRWhFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVyRSxJQUFJLENBQUMsS0FBSyxHQUFHO2dCQUNaLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDeEMsR0FBRyxJQUFBLGNBQUssRUFBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLFVBQVUsRUFBSyxDQUFDO2FBQ25ELENBQUM7UUFDSCxDQUFDO1FBRUQsVUFBVSxDQUFDLEtBQWE7WUFDdkIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRW5DLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDMUIsQ0FBQztRQUVELEdBQUcsQ0FBQyxLQUFhO1lBQ2hCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUQsTUFBTSxXQUFXLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQ2hELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFbkMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRCxPQUFPLENBQUMsS0FBYSxFQUFFLGlCQUFvQztZQUMxRCxJQUFJLGlCQUFpQixDQUFDLHVCQUF1QixFQUFFO2dCQUM5QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBQSxpQkFBUSxHQUFFLENBQUMsQ0FBQzthQUNsQztZQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUQsTUFBTSxXQUFXLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQ2hELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFbkMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNwQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2FBQ25EO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDO2dCQUN6QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztxQkFDMUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztvQkFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO29CQUNwQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztnQkFDakIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO29CQUNSLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO29CQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztvQkFDcEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7b0JBQ2hCLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDNUIsQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUVELE1BQU0sUUFBUSxHQUFHLGlCQUFpQixDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRTtnQkFDL0QsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ2QsT0FBTztpQkFDUDtnQkFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFbEMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7b0JBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQ2xCO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUUvQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQ3hELE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNyQyxDQUFDO0tBQ0Q7SUEvRUQsZ0NBK0VDO0lBRUQsTUFBYSxpQkFBaUI7UUFFN0IsSUFBSSxNQUFNLEtBQWEsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFbEQsWUFBb0IsS0FBcUIsRUFBVSxVQUFrQixHQUFHO1lBQXBELFVBQUssR0FBTCxLQUFLLENBQWdCO1lBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBYztRQUFJLENBQUM7UUFFN0UsVUFBVSxDQUFDLEtBQWE7WUFDdkIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsR0FBRyxDQUFDLEtBQWE7WUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQsT0FBTyxDQUFDLEtBQWEsRUFBRSxpQkFBb0M7WUFDMUQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0IsSUFBSSxpQkFBaUIsQ0FBQyx1QkFBdUIsRUFBRTtvQkFDOUMsT0FBTyxDQUFDLENBQUMsSUFBQSxpQkFBUSxHQUFFLENBQUMsQ0FBQztpQkFDckI7Z0JBRUQsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDN0IsSUFBSSxpQkFBaUIsQ0FBQyx1QkFBdUIsRUFBRTt3QkFDOUMsT0FBTyxDQUFDLENBQUMsSUFBQSxpQkFBUSxHQUFFLENBQUMsQ0FBQztxQkFDckI7b0JBRUQsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRWpCLE1BQU0sbUJBQW1CLEdBQUcsaUJBQWlCLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFO29CQUMxRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3BCLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUM5QixDQUFDLENBQUMsSUFBQSxpQkFBUSxHQUFFLENBQUMsQ0FBQztnQkFDZixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNEO0lBcENELDhDQW9DQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLFFBQVEsQ0FBTyxLQUFnQixFQUFFLEVBQWU7UUFDL0QsT0FBTztZQUNOLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDbEMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO1lBQ2xCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtZQUN4QixPQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ25GLENBQUM7SUFDSCxDQUFDO0lBUEQsNEJBT0MifQ==