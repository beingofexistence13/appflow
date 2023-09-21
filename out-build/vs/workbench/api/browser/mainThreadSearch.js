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
    exports.$Nkb = void 0;
    let $Nkb = class $Nkb {
        constructor(extHostContext, c, d, _configurationService) {
            this.c = c;
            this.d = d;
            this.b = new Map();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostSearch);
            this.a.$enableExtensionHostSearch();
        }
        dispose() {
            this.b.forEach(value => value.dispose());
            this.b.clear();
        }
        $registerTextSearchProvider(handle, scheme) {
            this.b.set(handle, new RemoteSearchProvider(this.c, 1 /* SearchProviderType.text */, scheme, handle, this.a));
        }
        $registerFileSearchProvider(handle, scheme) {
            this.b.set(handle, new RemoteSearchProvider(this.c, 0 /* SearchProviderType.file */, scheme, handle, this.a));
        }
        $unregisterProvider(handle) {
            (0, lifecycle_1.$fc)(this.b.get(handle));
            this.b.delete(handle);
        }
        $handleFileMatch(handle, session, data) {
            const provider = this.b.get(handle);
            if (!provider) {
                throw new Error('Got result for unknown provider');
            }
            provider.handleFindMatch(session, data);
        }
        $handleTextMatch(handle, session, data) {
            const provider = this.b.get(handle);
            if (!provider) {
                throw new Error('Got result for unknown provider');
            }
            provider.handleFindMatch(session, data);
        }
        $handleTelemetry(eventName, data) {
            this.d.publicLog(eventName, data);
        }
    };
    exports.$Nkb = $Nkb;
    exports.$Nkb = $Nkb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadSearch),
        __param(1, search_1.$oI),
        __param(2, telemetry_1.$9k),
        __param(3, configuration_1.$8h)
    ], $Nkb);
    class SearchOperation {
        static { this.a = 0; }
        constructor(progress, id = ++SearchOperation.a, matches = new Map()) {
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
        constructor(searchService, type, c, d, e) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.a = new lifecycle_1.$jc();
            this.b = new Map();
            this.a.add(searchService.registerSearchResultProvider(this.c, type, this));
        }
        dispose() {
            this.a.dispose();
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
            this.b.set(search.id, search);
            const searchP = query.type === 1 /* QueryType.File */
                ? this.e.$provideFileSearchResults(this.d, search.id, query, token)
                : this.e.$provideTextSearchResults(this.d, search.id, query, token);
            return Promise.resolve(searchP).then((result) => {
                this.b.delete(search.id);
                return { results: Array.from(search.matches.values()), stats: result.stats, limitHit: result.limitHit, messages: result.messages };
            }, err => {
                this.b.delete(search.id);
                return Promise.reject(err);
            });
        }
        clearCache(cacheKey) {
            return Promise.resolve(this.e.$clearCache(cacheKey));
        }
        handleFindMatch(session, dataOrUri) {
            const searchOp = this.b.get(session);
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
//# sourceMappingURL=mainThreadSearch.js.map