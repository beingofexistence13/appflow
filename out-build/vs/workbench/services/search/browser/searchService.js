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
define(["require", "exports", "vs/editor/common/services/model", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/search/common/search", "vs/workbench/services/search/common/searchService", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/worker/simpleWorker", "vs/base/common/lifecycle", "vs/base/browser/defaultWorkerFactory", "vs/platform/instantiation/common/extensions", "vs/base/common/decorators", "vs/base/common/network", "vs/base/common/uri", "vs/base/common/event", "vs/nls!vs/workbench/services/search/browser/searchService", "vs/platform/files/browser/webFileSystemAccess"], function (require, exports, model_1, files_1, instantiation_1, log_1, telemetry_1, editorService_1, extensions_1, search_1, searchService_1, uriIdentity_1, simpleWorker_1, lifecycle_1, defaultWorkerFactory_1, extensions_2, decorators_1, network_1, uri_1, event_1, nls_1, webFileSystemAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$f3b = exports.$e3b = void 0;
    let $e3b = class $e3b extends searchService_1.$d3b {
        constructor(modelService, editorService, telemetryService, logService, extensionService, fileService, y, uriIdentityService) {
            super(modelService, editorService, telemetryService, logService, extensionService, fileService, uriIdentityService);
            this.y = y;
            const searchProvider = this.y.createInstance($f3b);
            this.registerSearchResultProvider(network_1.Schemas.file, 0 /* SearchProviderType.file */, searchProvider);
            this.registerSearchResultProvider(network_1.Schemas.file, 1 /* SearchProviderType.text */, searchProvider);
        }
    };
    exports.$e3b = $e3b;
    exports.$e3b = $e3b = __decorate([
        __param(0, model_1.$yA),
        __param(1, editorService_1.$9C),
        __param(2, telemetry_1.$9k),
        __param(3, log_1.$5i),
        __param(4, extensions_1.$MF),
        __param(5, files_1.$6j),
        __param(6, instantiation_1.$Ah),
        __param(7, uriIdentity_1.$Ck)
    ], $e3b);
    let $f3b = class $f3b extends lifecycle_1.$kc {
        constructor(h, j) {
            super();
            this.h = h;
            this.j = j;
            this.c = new event_1.$fd();
            this.onDidReceiveTextSearchMatch = this.c.event;
            this.g = 0;
            this.a = null;
            this.b = new defaultWorkerFactory_1.$WQ('localFileSearchWorker');
        }
        sendTextSearchMatch(match, queryId) {
            this.c.fire({ match, queryId });
        }
        get m() {
            return this.h.getProvider(network_1.Schemas.file);
        }
        async n(queryId) {
            const proxy = await this.r().getProxyObject();
            proxy.cancelQuery(queryId);
        }
        async textSearch(query, onProgress, token) {
            try {
                const queryDisposables = new lifecycle_1.$jc();
                const proxy = await this.r().getProxyObject();
                const results = [];
                let limitHit = false;
                await Promise.all(query.folderQueries.map(async (fq) => {
                    const queryId = this.g++;
                    queryDisposables.add(token?.onCancellationRequested(e => this.n(queryId)) || lifecycle_1.$kc.None);
                    const handle = await this.m.getHandle(fq.folder);
                    if (!handle || !webFileSystemAccess_1.WebFileSystemAccess.isFileSystemDirectoryHandle(handle)) {
                        console.error('Could not get directory handle for ', fq);
                        return;
                    }
                    const reviveMatch = (result) => ({
                        resource: uri_1.URI.revive(result.resource),
                        results: result.results
                    });
                    queryDisposables.add(this.onDidReceiveTextSearchMatch(e => {
                        if (e.queryId === queryId) {
                            onProgress?.(reviveMatch(e.match));
                        }
                    }));
                    const ignorePathCasing = this.j.extUri.ignorePathCasing(fq.folder);
                    const folderResults = await proxy.searchDirectory(handle, query, fq, ignorePathCasing, queryId);
                    for (const folderResult of folderResults.results) {
                        results.push(reviveMatch(folderResult));
                    }
                    if (folderResults.limitHit) {
                        limitHit = true;
                    }
                }));
                queryDisposables.dispose();
                const result = { messages: [], results, limitHit };
                return result;
            }
            catch (e) {
                console.error('Error performing web worker text search', e);
                return {
                    results: [],
                    messages: [{
                            text: (0, nls_1.localize)(0, null), type: search_1.TextSearchCompleteMessageType.Warning
                        }],
                };
            }
        }
        async fileSearch(query, token) {
            try {
                const queryDisposables = new lifecycle_1.$jc();
                let limitHit = false;
                const proxy = await this.r().getProxyObject();
                const results = [];
                await Promise.all(query.folderQueries.map(async (fq) => {
                    const queryId = this.g++;
                    queryDisposables.add(token?.onCancellationRequested(e => this.n(queryId)) || lifecycle_1.$kc.None);
                    const handle = await this.m.getHandle(fq.folder);
                    if (!handle || !webFileSystemAccess_1.WebFileSystemAccess.isFileSystemDirectoryHandle(handle)) {
                        console.error('Could not get directory handle for ', fq);
                        return;
                    }
                    const caseSensitive = this.j.extUri.ignorePathCasing(fq.folder);
                    const folderResults = await proxy.listDirectory(handle, query, fq, caseSensitive, queryId);
                    for (const folderResult of folderResults.results) {
                        results.push({ resource: uri_1.URI.joinPath(fq.folder, folderResult) });
                    }
                    if (folderResults.limitHit) {
                        limitHit = true;
                    }
                }));
                queryDisposables.dispose();
                const result = { messages: [], results, limitHit };
                return result;
            }
            catch (e) {
                console.error('Error performing web worker file search', e);
                return {
                    results: [],
                    messages: [{
                            text: (0, nls_1.localize)(1, null), type: search_1.TextSearchCompleteMessageType.Warning
                        }],
                };
            }
        }
        async clearCache(cacheKey) {
            if (this.f?.key === cacheKey) {
                this.f = undefined;
            }
        }
        r() {
            if (!this.a) {
                try {
                    this.a = this.B(new simpleWorker_1.SimpleWorkerClient(this.b, 'vs/workbench/services/search/worker/localFileSearch', this));
                }
                catch (err) {
                    (0, simpleWorker_1.logOnceWebWorkerWarning)(err);
                    throw err;
                }
            }
            return this.a;
        }
    };
    exports.$f3b = $f3b;
    __decorate([
        decorators_1.$6g
    ], $f3b.prototype, "m", null);
    exports.$f3b = $f3b = __decorate([
        __param(0, files_1.$6j),
        __param(1, uriIdentity_1.$Ck)
    ], $f3b);
    (0, extensions_2.$mr)(search_1.$oI, $e3b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=searchService.js.map