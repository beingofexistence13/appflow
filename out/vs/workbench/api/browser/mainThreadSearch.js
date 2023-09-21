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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/search/common/search", "../common/extHost.protocol"], function (require, exports, cancellation_1, lifecycle_1, uri_1, configuration_1, telemetry_1, extHostCustomers_1, search_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadSearch = void 0;
    let MainThreadSearch = class MainThreadSearch {
        constructor(extHostContext, _searchService, _telemetryService, _configurationService) {
            this._searchService = _searchService;
            this._telemetryService = _telemetryService;
            this._searchProvider = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostSearch);
            this._proxy.$enableExtensionHostSearch();
        }
        dispose() {
            this._searchProvider.forEach(value => value.dispose());
            this._searchProvider.clear();
        }
        $registerTextSearchProvider(handle, scheme) {
            this._searchProvider.set(handle, new RemoteSearchProvider(this._searchService, 1 /* SearchProviderType.text */, scheme, handle, this._proxy));
        }
        $registerFileSearchProvider(handle, scheme) {
            this._searchProvider.set(handle, new RemoteSearchProvider(this._searchService, 0 /* SearchProviderType.file */, scheme, handle, this._proxy));
        }
        $unregisterProvider(handle) {
            (0, lifecycle_1.dispose)(this._searchProvider.get(handle));
            this._searchProvider.delete(handle);
        }
        $handleFileMatch(handle, session, data) {
            const provider = this._searchProvider.get(handle);
            if (!provider) {
                throw new Error('Got result for unknown provider');
            }
            provider.handleFindMatch(session, data);
        }
        $handleTextMatch(handle, session, data) {
            const provider = this._searchProvider.get(handle);
            if (!provider) {
                throw new Error('Got result for unknown provider');
            }
            provider.handleFindMatch(session, data);
        }
        $handleTelemetry(eventName, data) {
            this._telemetryService.publicLog(eventName, data);
        }
    };
    exports.MainThreadSearch = MainThreadSearch;
    exports.MainThreadSearch = MainThreadSearch = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadSearch),
        __param(1, search_1.ISearchService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, configuration_1.IConfigurationService)
    ], MainThreadSearch);
    class SearchOperation {
        static { this._idPool = 0; }
        constructor(progress, id = ++SearchOperation._idPool, matches = new Map()) {
            this.progress = progress;
            this.id = id;
            this.matches = matches;
            //
        }
        addMatch(match) {
            const existingMatch = this.matches.get(match.resource.toString());
            if (existingMatch) {
                // TODO@rob clean up text/file result types
                // If a file search returns the same file twice, we would enter this branch.
                // It's possible that could happen, #90813
                if (existingMatch.results && match.results) {
                    existingMatch.results.push(...match.results);
                }
            }
            else {
                this.matches.set(match.resource.toString(), match);
            }
            this.progress?.(match);
        }
    }
    class RemoteSearchProvider {
        constructor(searchService, type, _scheme, _handle, _proxy) {
            this._scheme = _scheme;
            this._handle = _handle;
            this._proxy = _proxy;
            this._registrations = new lifecycle_1.DisposableStore();
            this._searches = new Map();
            this._registrations.add(searchService.registerSearchResultProvider(this._scheme, type, this));
        }
        dispose() {
            this._registrations.dispose();
        }
        fileSearch(query, token = cancellation_1.CancellationToken.None) {
            return this.doSearch(query, undefined, token);
        }
        textSearch(query, onProgress, token = cancellation_1.CancellationToken.None) {
            return this.doSearch(query, onProgress, token);
        }
        doSearch(query, onProgress, token = cancellation_1.CancellationToken.None) {
            if (!query.folderQueries.length) {
                throw new Error('Empty folderQueries');
            }
            const search = new SearchOperation(onProgress);
            this._searches.set(search.id, search);
            const searchP = query.type === 1 /* QueryType.File */
                ? this._proxy.$provideFileSearchResults(this._handle, search.id, query, token)
                : this._proxy.$provideTextSearchResults(this._handle, search.id, query, token);
            return Promise.resolve(searchP).then((result) => {
                this._searches.delete(search.id);
                return { results: Array.from(search.matches.values()), stats: result.stats, limitHit: result.limitHit, messages: result.messages };
            }, err => {
                this._searches.delete(search.id);
                return Promise.reject(err);
            });
        }
        clearCache(cacheKey) {
            return Promise.resolve(this._proxy.$clearCache(cacheKey));
        }
        handleFindMatch(session, dataOrUri) {
            const searchOp = this._searches.get(session);
            if (!searchOp) {
                // ignore...
                return;
            }
            dataOrUri.forEach(result => {
                if (result.results) {
                    searchOp.addMatch({
                        resource: uri_1.URI.revive(result.resource),
                        results: result.results
                    });
                }
                else {
                    searchOp.addMatch({
                        resource: uri_1.URI.revive(result)
                    });
                }
            });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFNlYXJjaC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVl6RixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFnQjtRQUs1QixZQUNDLGNBQStCLEVBQ2YsY0FBK0MsRUFDNUMsaUJBQXFELEVBQ2pELHFCQUE0QztZQUZsQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDM0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUx4RCxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1lBUTFFLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxNQUFNLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUMxQyxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM5QixDQUFDO1FBRUQsMkJBQTJCLENBQUMsTUFBYyxFQUFFLE1BQWM7WUFDekQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLGNBQWMsbUNBQTJCLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDdkksQ0FBQztRQUVELDJCQUEyQixDQUFDLE1BQWMsRUFBRSxNQUFjO1lBQ3pELElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxD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