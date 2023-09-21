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
    exports.$Bcc = exports.$Acc = exports.$zcc = void 0;
    exports.$zcc = (0, instantiation_1.$Bh)('IExtHostSearch');
    let $Acc = class $Acc {
        constructor(k, l, n) {
            this.k = k;
            this.l = l;
            this.n = n;
            this.c = this.k.getProxy(extHost_protocol_1.$1J.MainThreadSearch);
            this.d = 0;
            this.e = new Map();
            this.g = new Set();
            this.h = new Map();
            this.i = new Set();
            this.j = new fileSearchManager_1.$ucc();
        }
        o(scheme) {
            return this.l.transformOutgoingScheme(scheme);
        }
        registerTextSearchProvider(scheme, provider) {
            if (this.g.has(scheme)) {
                throw new Error(`a text search provider for the scheme '${scheme}' is already registered`);
            }
            this.g.add(scheme);
            const handle = this.d++;
            this.e.set(handle, provider);
            this.c.$registerTextSearchProvider(handle, this.o(scheme));
            return (0, lifecycle_1.$ic)(() => {
                this.g.delete(scheme);
                this.e.delete(handle);
                this.c.$unregisterProvider(handle);
            });
        }
        registerFileSearchProvider(scheme, provider) {
            if (this.i.has(scheme)) {
                throw new Error(`a file search provider for the scheme '${scheme}' is already registered`);
            }
            this.i.add(scheme);
            const handle = this.d++;
            this.h.set(handle, provider);
            this.c.$registerFileSearchProvider(handle, this.o(scheme));
            return (0, lifecycle_1.$ic)(() => {
                this.i.delete(scheme);
                this.h.delete(handle);
                this.c.$unregisterProvider(handle);
            });
        }
        $provideFileSearchResults(handle, session, rawQuery, token) {
            const query = $Bcc(rawQuery);
            const provider = this.h.get(handle);
            if (provider) {
                return this.j.fileSearch(query, provider, batch => {
                    this.c.$handleFileMatch(handle, session, batch.map(p => p.resource));
                }, token);
            }
            else {
                throw new Error('unknown provider: ' + handle);
            }
        }
        $clearCache(cacheKey) {
            this.j.clearCache(cacheKey);
            return Promise.resolve(undefined);
        }
        $provideTextSearchResults(handle, session, rawQuery, token) {
            const provider = this.e.get(handle);
            if (!provider || !provider.provideTextSearchResults) {
                throw new Error(`Unknown provider ${handle}`);
            }
            const query = $Bcc(rawQuery);
            const engine = this.q(query, provider);
            return engine.search(progress => this.c.$handleTextMatch(handle, session, progress), token);
        }
        $enableExtensionHostSearch() { }
        q(query, provider) {
            return new textSearchManager_1.$vcc(query, provider, {
                readdir: resource => Promise.resolve([]),
                toCanonicalName: encoding => encoding
            }, 'textSearchProvider');
        }
    };
    exports.$Acc = $Acc;
    exports.$Acc = $Acc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostUriTransformerService_1.$gbc),
        __param(2, log_1.$5i)
    ], $Acc);
    function $Bcc(rawQuery) {
        return {
            ...rawQuery,
            ...{
                folderQueries: rawQuery.folderQueries && rawQuery.folderQueries.map(reviveFolderQuery),
                extraFileResources: rawQuery.extraFileResources && rawQuery.extraFileResources.map(components => uri_1.URI.revive(components))
            }
        };
    }
    exports.$Bcc = $Bcc;
    function reviveFolderQuery(rawFolderQuery) {
        return {
            ...rawFolderQuery,
            folder: uri_1.URI.revive(rawFolderQuery.folder)
        };
    }
});
//# sourceMappingURL=extHostSearch.js.map