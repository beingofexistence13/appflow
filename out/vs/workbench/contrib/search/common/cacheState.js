/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/idGenerator", "vs/base/common/objects"], function (require, exports, idGenerator_1, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileQueryCacheState = void 0;
    var LoadingPhase;
    (function (LoadingPhase) {
        LoadingPhase[LoadingPhase["Created"] = 1] = "Created";
        LoadingPhase[LoadingPhase["Loading"] = 2] = "Loading";
        LoadingPhase[LoadingPhase["Loaded"] = 3] = "Loaded";
        LoadingPhase[LoadingPhase["Errored"] = 4] = "Errored";
        LoadingPhase[LoadingPhase["Disposed"] = 5] = "Disposed";
    })(LoadingPhase || (LoadingPhase = {}));
    class FileQueryCacheState {
        get cacheKey() {
            if (this.loadingPhase === LoadingPhase.Loaded || !this.previousCacheState) {
                return this._cacheKey;
            }
            return this.previousCacheState.cacheKey;
        }
        get isLoaded() {
            const isLoaded = this.loadingPhase === LoadingPhase.Loaded;
            return isLoaded || !this.previousCacheState ? isLoaded : this.previousCacheState.isLoaded;
        }
        get isUpdating() {
            const isUpdating = this.loadingPhase === LoadingPhase.Loading;
            return isUpdating || !this.previousCacheState ? isUpdating : this.previousCacheState.isUpdating;
        }
        constructor(cacheQuery, loadFn, disposeFn, previousCacheState) {
            this.cacheQuery = cacheQuery;
            this.loadFn = loadFn;
            this.disposeFn = disposeFn;
            this.previousCacheState = previousCacheState;
            this._cacheKey = idGenerator_1.defaultGenerator.nextId();
            this.query = this.cacheQuery(this._cacheKey);
            this.loadingPhase = LoadingPhase.Created;
            if (this.previousCacheState) {
                const current = Object.assign({}, this.query, { cacheKey: null });
                const previous = Object.assign({}, this.previousCacheState.query, { cacheKey: null });
                if (!(0, objects_1.equals)(current, previous)) {
                    this.previousCacheState.dispose();
                    this.previousCacheState = undefined;
                }
            }
        }
        load() {
            if (this.isUpdating) {
                return this;
            }
            this.loadingPhase = LoadingPhase.Loading;
            this.loadPromise = (async () => {
                try {
                    await this.loadFn(this.query);
                    this.loadingPhase = LoadingPhase.Loaded;
                    if (this.previousCacheState) {
                        this.previousCacheState.dispose();
                        this.previousCacheState = undefined;
                    }
                }
                catch (error) {
                    this.loadingPhase = LoadingPhase.Errored;
                    throw error;
                }
            })();
            return this;
        }
        dispose() {
            if (this.loadPromise) {
                (async () => {
                    try {
                        await this.loadPromise;
                    }
                    catch (error) {
                        // ignore
                    }
                    this.loadingPhase = LoadingPhase.Disposed;
                    this.disposeFn(this._cacheKey);
                })();
            }
            else {
                this.loadingPhase = LoadingPhase.Disposed;
            }
            if (this.previousCacheState) {
                this.previousCacheState.dispose();
                this.previousCacheState = undefined;
            }
        }
    }
    exports.FileQueryCacheState = FileQueryCacheState;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGVTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC9jb21tb24vY2FjaGVTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsSUFBSyxZQU1KO0lBTkQsV0FBSyxZQUFZO1FBQ2hCLHFEQUFXLENBQUE7UUFDWCxxREFBVyxDQUFBO1FBQ1gsbURBQVUsQ0FBQTtRQUNWLHFEQUFXLENBQUE7UUFDWCx1REFBWSxDQUFBO0lBQ2IsQ0FBQyxFQU5JLFlBQVksS0FBWixZQUFZLFFBTWhCO0lBRUQsTUFBYSxtQkFBbUI7UUFHL0IsSUFBSSxRQUFRO1lBQ1gsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLFlBQVksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzFFLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQzthQUN0QjtZQUVELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQztRQUN6QyxDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1gsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksS0FBSyxZQUFZLENBQUMsTUFBTSxDQUFDO1lBRTNELE9BQU8sUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUM7UUFDM0YsQ0FBQztRQUVELElBQUksVUFBVTtZQUNiLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLEtBQUssWUFBWSxDQUFDLE9BQU8sQ0FBQztZQUU5RCxPQUFPLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDO1FBQ2pHLENBQUM7UUFPRCxZQUNTLFVBQTRDLEVBQzVDLE1BQTJDLEVBQzNDLFNBQThDLEVBQzlDLGtCQUFtRDtZQUhuRCxlQUFVLEdBQVYsVUFBVSxDQUFrQztZQUM1QyxXQUFNLEdBQU4sTUFBTSxDQUFxQztZQUMzQyxjQUFTLEdBQVQsU0FBUyxDQUFxQztZQUM5Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQWlDO1lBOUIzQyxjQUFTLEdBQUcsOEJBQWdCLENBQUMsTUFBTSxFQUFFLENBQUM7WUFxQnRDLFVBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVqRCxpQkFBWSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUM7WUFTM0MsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzVCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDbEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RixJQUFJLENBQUMsSUFBQSxnQkFBTSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRTtvQkFDL0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNsQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsU0FBUyxDQUFDO2lCQUNwQzthQUNEO1FBQ0YsQ0FBQztRQUVELElBQUk7WUFDSCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3BCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUM7WUFFekMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUM5QixJQUFJO29CQUNILE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBRTlCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztvQkFFeEMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7d0JBQzVCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDbEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFNBQVMsQ0FBQztxQkFDcEM7aUJBQ0Q7Z0JBQUMsT0FBTyxLQUFLLEVBQUU7b0JBQ2YsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDO29CQUV6QyxNQUFNLEtBQUssQ0FBQztpQkFDWjtZQUNGLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFTCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNyQixDQUFDLEtBQUssSUFBSSxFQUFFO29CQUNYLElBQUk7d0JBQ0gsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDO3FCQUN2QjtvQkFBQyxPQUFPLEtBQUssRUFBRTt3QkFDZixTQUFTO3FCQUNUO29CQUVELElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQztvQkFDMUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2hDLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDTDtpQkFBTTtnQkFDTixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUM7YUFDMUM7WUFFRCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNsQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsU0FBUyxDQUFDO2FBQ3BDO1FBQ0YsQ0FBQztLQUNEO0lBNUZELGtEQTRGQyJ9