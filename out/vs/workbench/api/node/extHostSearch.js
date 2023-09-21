/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/base/node/pfs", "vs/platform/log/common/log", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostSearch", "vs/workbench/api/common/extHostUriTransformerService", "vs/workbench/services/search/common/search", "vs/workbench/services/search/node/rawSearchService", "vs/workbench/services/search/node/ripgrepSearchProvider", "vs/workbench/services/search/node/ripgrepSearchUtils", "vs/workbench/services/search/node/textSearchManager"], function (require, exports, lifecycle_1, network_1, uri_1, pfs, log_1, extHostInitDataService_1, extHostRpcService_1, extHostSearch_1, extHostUriTransformerService_1, search_1, rawSearchService_1, ripgrepSearchProvider_1, ripgrepSearchUtils_1, textSearchManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeExtHostSearch = void 0;
    let NativeExtHostSearch = class NativeExtHostSearch extends extHostSearch_1.ExtHostSearch {
        constructor(extHostRpc, initData, _uriTransformer, _logService) {
            super(extHostRpc, _uriTransformer, _logService);
            this._pfs = pfs; // allow extending for tests
            this._internalFileSearchHandle = -1;
            this._internalFileSearchProvider = null;
            this._registeredEHSearchProvider = false;
            this._disposables = new lifecycle_1.DisposableStore();
            const outputChannel = new ripgrepSearchUtils_1.OutputChannel('RipgrepSearchUD', this._logService);
            this._disposables.add(this.registerTextSearchProvider(network_1.Schemas.vscodeUserData, new ripgrepSearchProvider_1.RipgrepSearchProvider(outputChannel)));
            if (initData.remote.isRemote && initData.remote.authority) {
                this._registerEHSearchProviders();
            }
        }
        dispose() {
            this._disposables.dispose();
        }
        $enableExtensionHostSearch() {
            this._registerEHSearchProviders();
        }
        _registerEHSearchProviders() {
            if (this._registeredEHSearchProvider) {
                return;
            }
            this._registeredEHSearchProvider = true;
            const outputChannel = new ripgrepSearchUtils_1.OutputChannel('RipgrepSearchEH', this._logService);
            this._disposables.add(this.registerTextSearchProvider(network_1.Schemas.file, new ripgrepSearchProvider_1.RipgrepSearchProvider(outputChannel)));
            this._disposables.add(this.registerInternalFileSearchProvider(network_1.Schemas.file, new rawSearchService_1.SearchService('fileSearchProvider')));
        }
        registerInternalFileSearchProvider(scheme, provider) {
            const handle = this._handlePool++;
            this._internalFileSearchProvider = provider;
            this._internalFileSearchHandle = handle;
            this._proxy.$registerFileSearchProvider(handle, this._transformScheme(scheme));
            return (0, lifecycle_1.toDisposable)(() => {
                this._internalFileSearchProvider = null;
                this._proxy.$unregisterProvider(handle);
            });
        }
        $provideFileSearchResults(handle, session, rawQuery, token) {
            const query = (0, extHostSearch_1.reviveQuery)(rawQuery);
            if (handle === this._internalFileSearchHandle) {
                return this.doInternalFileSearch(handle, session, query, token);
            }
            return super.$provideFileSearchResults(handle, session, rawQuery, token);
        }
        doInternalFileSearch(handle, session, rawQuery, token) {
            const onResult = (ev) => {
                if ((0, search_1.isSerializedFileMatch)(ev)) {
                    ev = [ev];
                }
                if (Array.isArray(ev)) {
                    this._proxy.$handleFileMatch(handle, session, ev.map(m => uri_1.URI.file(m.path)));
                    return;
                }
                if (ev.message) {
                    this._logService.debug('ExtHostSearch', ev.message);
                }
            };
            if (!this._internalFileSearchProvider) {
                throw new Error('No internal file search handler');
            }
            return this._internalFileSearchProvider.doFileSearch(rawQuery, onResult, token);
        }
        $clearCache(cacheKey) {
            this._internalFileSearchProvider?.clearCache(cacheKey);
            return super.$clearCache(cacheKey);
        }
        createTextSearchManager(query, provider) {
            return new textSearchManager_1.NativeTextSearchManager(query, provider, undefined, 'textSearchProvider');
        }
    };
    exports.NativeExtHostSearch = NativeExtHostSearch;
    exports.NativeExtHostSearch = NativeExtHostSearch = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostInitDataService_1.IExtHostInitDataService),
        __param(2, extHostUriTransformerService_1.IURITransformerService),
        __param(3, log_1.ILogService)
    ], NativeExtHostSearch);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFNlYXJjaC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvbm9kZS9leHRIb3N0U2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW1CekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSw2QkFBYTtRQVdyRCxZQUNxQixVQUE4QixFQUN6QixRQUFpQyxFQUNsQyxlQUF1QyxFQUNsRCxXQUF3QjtZQUVyQyxLQUFLLENBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQztZQWZ2QyxTQUFJLEdBQWUsR0FBRyxDQUFDLENBQUMsNEJBQTRCO1lBRXRELDhCQUF5QixHQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLGdDQUEyQixHQUF5QixJQUFJLENBQUM7WUFFekQsZ0NBQTJCLEdBQUcsS0FBSyxDQUFDO1lBRTNCLGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFVckQsTUFBTSxhQUFhLEdBQUcsSUFBSSxrQ0FBYSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsaUJBQU8sQ0FBQyxjQUFjLEVBQUUsSUFBSSw2Q0FBcUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekgsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtnQkFDMUQsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7YUFDbEM7UUFDRixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVRLDBCQUEwQjtZQUNs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