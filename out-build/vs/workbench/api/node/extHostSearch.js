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
    exports.$Kdc = void 0;
    let $Kdc = class $Kdc extends extHostSearch_1.$Acc {
        constructor(extHostRpc, initData, _uriTransformer, _logService) {
            super(extHostRpc, _uriTransformer, _logService);
            this.s = pfs; // allow extending for tests
            this.t = -1;
            this.v = null;
            this.w = false;
            this.x = new lifecycle_1.$jc();
            const outputChannel = new ripgrepSearchUtils_1.$tdc('RipgrepSearchUD', this.n);
            this.x.add(this.registerTextSearchProvider(network_1.Schemas.vscodeUserData, new ripgrepSearchProvider_1.$Jdc(outputChannel)));
            if (initData.remote.isRemote && initData.remote.authority) {
                this.y();
            }
        }
        dispose() {
            this.x.dispose();
        }
        $enableExtensionHostSearch() {
            this.y();
        }
        y() {
            if (this.w) {
                return;
            }
            this.w = true;
            const outputChannel = new ripgrepSearchUtils_1.$tdc('RipgrepSearchEH', this.n);
            this.x.add(this.registerTextSearchProvider(network_1.Schemas.file, new ripgrepSearchProvider_1.$Jdc(outputChannel)));
            this.x.add(this.z(network_1.Schemas.file, new rawSearchService_1.$Idc('fileSearchProvider')));
        }
        z(scheme, provider) {
            const handle = this.d++;
            this.v = provider;
            this.t = handle;
            this.c.$registerFileSearchProvider(handle, this.o(scheme));
            return (0, lifecycle_1.$ic)(() => {
                this.v = null;
                this.c.$unregisterProvider(handle);
            });
        }
        $provideFileSearchResults(handle, session, rawQuery, token) {
            const query = (0, extHostSearch_1.$Bcc)(rawQuery);
            if (handle === this.t) {
                return this.A(handle, session, query, token);
            }
            return super.$provideFileSearchResults(handle, session, rawQuery, token);
        }
        A(handle, session, rawQuery, token) {
            const onResult = (ev) => {
                if ((0, search_1.$DI)(ev)) {
                    ev = [ev];
                }
                if (Array.isArray(ev)) {
                    this.c.$handleFileMatch(handle, session, ev.map(m => uri_1.URI.file(m.path)));
                    return;
                }
                if (ev.message) {
                    this.n.debug('ExtHostSearch', ev.message);
                }
            };
            if (!this.v) {
                throw new Error('No internal file search handler');
            }
            return this.v.doFileSearch(rawQuery, onResult, token);
        }
        $clearCache(cacheKey) {
            this.v?.clearCache(cacheKey);
            return super.$clearCache(cacheKey);
        }
        q(query, provider) {
            return new textSearchManager_1.$Gdc(query, provider, undefined, 'textSearchProvider');
        }
    };
    exports.$Kdc = $Kdc;
    exports.$Kdc = $Kdc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostInitDataService_1.$fM),
        __param(2, extHostUriTransformerService_1.$gbc),
        __param(3, log_1.$5i)
    ], $Kdc);
});
//# sourceMappingURL=extHostSearch.js.map