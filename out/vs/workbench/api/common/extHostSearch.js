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
define(["require", "exports", "vs/base/common/lifecycle", "../common/extHost.protocol", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/search/common/fileSearchManager", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostUriTransformerService", "vs/platform/log/common/log", "vs/base/common/uri", "vs/workbench/services/search/common/textSearchManager"], function (require, exports, lifecycle_1, extHost_protocol_1, instantiation_1, fileSearchManager_1, extHostRpcService_1, extHostUriTransformerService_1, log_1, uri_1, textSearchManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reviveQuery = exports.ExtHostSearch = exports.IExtHostSearch = void 0;
    exports.IExtHostSearch = (0, instantiation_1.createDecorator)('IExtHostSearch');
    let ExtHostSearch = class ExtHostSearch {
        constructor(extHostRpc, _uriTransformer, _logService) {
            this.extHostRpc = extHostRpc;
            this._uriTransformer = _uriTransformer;
            this._logService = _logService;
            this._proxy = this.extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadSearch);
            this._handlePool = 0;
            this._textSearchProvider = new Map();
            this._textSearchUsedSchemes = new Set();
            this._fileSearchProvider = new Map();
            this._fileSearchUsedSchemes = new Set();
            this._fileSearchManager = new fileSearchManager_1.FileSearchManager();
        }
        _transformScheme(scheme) {
            return this._uriTransformer.transformOutgoingScheme(scheme);
        }
        registerTextSearchProvider(scheme, provider) {
            if (this._textSearchUsedSchemes.has(scheme)) {
                throw new Error(`a text search provider for the scheme '${scheme}' is already registered`);
            }
            this._textSearchUsedSchemes.add(scheme);
            const handle = this._handlePool++;
            this._textSearchProvider.set(handle, provider);
            this._proxy.$registerTextSearchProvider(handle, this._transformScheme(scheme));
            return (0, lifecycle_1.toDisposable)(() => {
                this._textSearchUsedSchemes.delete(scheme);
                this._textSearchProvider.delete(handle);
                this._proxy.$unregisterProvider(handle);
            });
        }
        registerFileSearchProvider(scheme, provider) {
            if (this._fileSearchUsedSchemes.has(scheme)) {
                throw new Error(`a file search provider for the scheme '${scheme}' is already registered`);
            }
            this._fileSearchUsedSchemes.add(scheme);
            const handle = this._handlePool++;
            this._fileSearchProvider.set(handle, provider);
            this._proxy.$registerFileSearchProvider(handle, this._transformScheme(scheme));
            return (0, lifecycle_1.toDisposable)(() => {
                this._fileSearchUsedSchemes.delete(scheme);
                this._fileSearchProvider.delete(handle);
                this._proxy.$unregisterProvider(handle);
            });
        }
        $provideFileSearchResults(handle, session, rawQuery, token) {
            const query = reviveQuery(rawQuery);
            const provider = this._fileSearchProvider.get(handle);
            if (provider) {
                return this._fileSearchManager.fileSearch(query, provider, batch => {
                    this._proxy.$handleFileMatch(handle, session, batch.map(p => p.resource));
                }, token);
            }
            else {
                throw new Error('unknown provider: ' + handle);
            }
        }
        $clearCache(cacheKey) {
            this._fileSearchManager.clearCache(cacheKey);
            return Promise.resolve(undefined);
        }
        $provideTextSearchResults(handle, session, rawQuery, token) {
            const provider = this._textSearchProvider.get(handle);
            if (!provider || !provider.provideTextSearchResults) {
                throw new Error(`Unknown provider ${handle}`);
            }
            const query = reviveQuery(rawQuery);
            const engine = this.createTextSearchManager(query, provider);
            return engine.search(progress => this._proxy.$handleTextMatch(handle, session, progress), token);
        }
        $enableExtensionHostSearch() { }
        createTextSearchManager(query, provider) {
            return new textSearchManager_1.TextSearchManager(query, provider, {
                readdir: resource => Promise.resolve([]),
                toCanonicalName: encoding => encoding
            }, 'textSearchProvider');
        }
    };
    exports.ExtHostSearch = ExtHostSearch;
    exports.ExtHostSearch = ExtHostSearch = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostUriTransformerService_1.IURITransformerService),
        __param(2, log_1.ILogService)
    ], ExtHostSearch);
    function reviveQuery(rawQuery) {
        return {
            ...rawQuery,
            ...{
                folderQueries: rawQuery.folderQueries && rawQuery.folderQueries.map(reviveFolderQuery),
                extraFileResources: rawQuery.extraFileResources && rawQuery.extraFileResources.map(components => uri_1.URI.revive(components))
            }
        };
    }
    exports.reviveQuery = reviveQuery;
    function reviveFolderQuery(rawFolderQuery) {
        return {
            ...rawFolderQuery,
            folder: uri_1.URI.revive(rawFolderQuery.folder)
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFNlYXJjaC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RTZWFyY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJuRixRQUFBLGNBQWMsR0FBRyxJQUFBLCtCQUFlLEVBQWlCLGdCQUFnQixDQUFDLENBQUM7SUFFekUsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYTtRQVl6QixZQUNxQixVQUFzQyxFQUNsQyxlQUFpRCxFQUM1RCxXQUFrQztZQUZuQixlQUFVLEdBQVYsVUFBVSxDQUFvQjtZQUN4QixvQkFBZSxHQUFmLGVBQWUsQ0FBd0I7WUFDbEQsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFiN0IsV0FBTSxHQUEwQixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDaEcsZ0JBQVcsR0FBVyxDQUFDLENBQUM7WUFFakIsd0JBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQXFDLENBQUM7WUFDbkUsMkJBQXNCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUMzQyx3QkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBcUMsQ0FBQztZQUNuRSwyQkFBc0IsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBRTNDLHVCQUFrQixHQUFHLElBQUkscUNBQWlCLEVBQUUsQ0FBQztRQU0xRCxDQUFDO1FBRUssZ0JBQWdCLENBQUMsTUFBYztZQUN4QyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVELDBCQUEwQixDQUFDLE1BQWMsRUFBRSxRQUFtQztZQUM3RSxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzVDLE1B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