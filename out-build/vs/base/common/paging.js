/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors"], function (require, exports, arrays_1, cancellation_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jn = exports.$In = exports.$Hn = exports.$Gn = void 0;
    function createPage(elements) {
        return {
            isResolved: !!elements,
            promise: null,
            cts: null,
            promiseIndexes: new Set(),
            elements: elements || []
        };
    }
    function $Gn(elements) {
        return {
            firstPage: elements,
            total: elements.length,
            pageSize: elements.length,
            getPage: (pageIndex, cancellationToken) => {
                return Promise.resolve(elements);
            }
        };
    }
    exports.$Gn = $Gn;
    class $Hn {
        get length() { return this.a.total; }
        constructor(arg) {
            this.b = [];
            this.a = Array.isArray(arg) ? $Gn(arg) : arg;
            const totalPages = Math.ceil(this.a.total / this.a.pageSize);
            this.b = [
                createPage(this.a.firstPage.slice()),
                ...(0, arrays_1.$Qb)(totalPages - 1).map(() => createPage())
            ];
        }
        isResolved(index) {
            const pageIndex = Math.floor(index / this.a.pageSize);
            const page = this.b[pageIndex];
            return !!page.isResolved;
        }
        get(index) {
            const pageIndex = Math.floor(index / this.a.pageSize);
            const indexInPage = index % this.a.pageSize;
            const page = this.b[pageIndex];
            return page.elements[indexInPage];
        }
        resolve(index, cancellationToken) {
            if (cancellationToken.isCancellationRequested) {
                return Promise.reject((0, errors_1.$4)());
            }
            const pageIndex = Math.floor(index / this.a.pageSize);
            const indexInPage = index % this.a.pageSize;
            const page = this.b[pageIndex];
            if (page.isResolved) {
                return Promise.resolve(page.elements[indexInPage]);
            }
            if (!page.promise) {
                page.cts = new cancellation_1.$pd();
                page.promise = this.a.getPage(pageIndex, page.cts.token)
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
    exports.$Hn = $Hn;
    class $In {
        get length() { return this.a.length; }
        constructor(a, b = 500) {
            this.a = a;
            this.b = b;
        }
        isResolved(index) {
            return this.a.isResolved(index);
        }
        get(index) {
            return this.a.get(index);
        }
        resolve(index, cancellationToken) {
            return new Promise((c, e) => {
                if (cancellationToken.isCancellationRequested) {
                    return e((0, errors_1.$4)());
                }
                const timer = setTimeout(() => {
                    if (cancellationToken.isCancellationRequested) {
                        return e((0, errors_1.$4)());
                    }
                    timeoutCancellation.dispose();
                    this.a.resolve(index, cancellationToken).then(c, e);
                }, this.b);
                const timeoutCancellation = cancellationToken.onCancellationRequested(() => {
                    clearTimeout(timer);
                    timeoutCancellation.dispose();
                    e((0, errors_1.$4)());
                });
            });
        }
    }
    exports.$In = $In;
    /**
     * Similar to array.map, `mapPager` lets you map the elements of an
     * abstract paged collection to another type.
     */
    function $Jn(pager, fn) {
        return {
            firstPage: pager.firstPage.map(fn),
            total: pager.total,
            pageSize: pager.pageSize,
            getPage: (pageIndex, token) => pager.getPage(pageIndex, token).then(r => r.map(fn))
        };
    }
    exports.$Jn = $Jn;
});
//# sourceMappingURL=paging.js.map