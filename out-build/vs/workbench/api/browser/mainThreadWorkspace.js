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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri", "vs/nls!vs/workbench/api/browser/mainThreadWorkspace", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/notification/common/notification", "vs/platform/request/common/request", "vs/platform/workspace/common/workspaceTrust", "vs/platform/workspace/common/workspace", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/extensions/common/workspaceContains", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/search/common/search", "vs/workbench/services/workspaces/common/workspaceEditing", "../common/extHost.protocol", "vs/platform/workspace/common/editSessions", "vs/workbench/common/editor", "vs/base/common/arrays", "vs/platform/workspace/common/canonicalUri"], function (require, exports, errors_1, lifecycle_1, platform_1, uri_1, nls_1, environment_1, files_1, instantiation_1, label_1, notification_1, request_1, workspaceTrust_1, workspace_1, extHostCustomers_1, workspaceContains_1, queryBuilder_1, editorService_1, search_1, workspaceEditing_1, extHost_protocol_1, editSessions_1, editor_1, arrays_1, canonicalUri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Clb = void 0;
    let $Clb = class $Clb {
        constructor(extHostContext, e, g, h, i, j, k, l, n, o, q, r, fileService, s, t) {
            this.e = e;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.n = n;
            this.o = o;
            this.q = q;
            this.r = r;
            this.s = s;
            this.t = t;
            this.a = new lifecycle_1.$jc();
            this.b = Object.create(null);
            this.d = this.o.createInstance(queryBuilder_1.$AJ);
            // --- edit sessions ---
            this.A = new Map();
            // --- canonical uri identities ---
            this.B = new Map();
            this.c = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostWorkspace);
            const workspace = this.g.getWorkspace();
            // The workspace file is provided be a unknown file system provider. It might come
            // from the extension host. So initialize now knowing that `rootPath` is undefined.
            if (workspace.configuration && !platform_1.$m && !fileService.hasProvider(workspace.configuration)) {
                this.c.$initializeWorkspace(this.w(workspace), this.y());
            }
            else {
                this.g.getCompleteWorkspace().then(workspace => this.c.$initializeWorkspace(this.w(workspace), this.y()));
            }
            this.g.onDidChangeWorkspaceFolders(this.v, this, this.a);
            this.g.onDidChangeWorkbenchState(this.v, this, this.a);
            this.s.onDidChangeTrust(this.z, this, this.a);
        }
        dispose() {
            this.a.dispose();
            for (const requestId in this.b) {
                const tokenSource = this.b[requestId];
                tokenSource.cancel();
            }
        }
        // --- workspace ---
        $updateWorkspaceFolders(extensionName, index, deleteCount, foldersToAdd) {
            const workspaceFoldersToAdd = foldersToAdd.map(f => ({ uri: uri_1.URI.revive(f.uri), name: f.name }));
            // Indicate in status message
            this.l.status(this.u(extensionName, workspaceFoldersToAdd.length, deleteCount), { hideAfter: 10 * 1000 /* 10s */ });
            return this.k.updateFolders(index, deleteCount, workspaceFoldersToAdd, true);
        }
        u(extensionName, addCount, removeCount) {
            let message;
            const wantsToAdd = addCount > 0;
            const wantsToDelete = removeCount > 0;
            // Add Folders
            if (wantsToAdd && !wantsToDelete) {
                if (addCount === 1) {
                    message = (0, nls_1.localize)(0, null, extensionName);
                }
                else {
                    message = (0, nls_1.localize)(1, null, extensionName, addCount);
                }
            }
            // Delete Folders
            else if (wantsToDelete && !wantsToAdd) {
                if (removeCount === 1) {
                    message = (0, nls_1.localize)(2, null, extensionName);
                }
                else {
                    message = (0, nls_1.localize)(3, null, extensionName, removeCount);
                }
            }
            // Change Folders
            else {
                message = (0, nls_1.localize)(4, null, extensionName);
            }
            return message;
        }
        v() {
            this.c.$acceptWorkspaceData(this.w(this.g.getWorkspace()));
        }
        w(workspace) {
            if (this.g.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                return null;
            }
            return {
                configuration: workspace.configuration || undefined,
                isUntitled: workspace.configuration ? (0, workspace_1.$2h)(workspace.configuration, this.r) : false,
                folders: workspace.folders,
                id: workspace.id,
                name: this.q.getWorkspaceLabel(workspace),
                transient: workspace.transient
            };
        }
        // --- search ---
        $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
            const includeFolder = uri_1.URI.revive(_includeFolder);
            const workspace = this.g.getWorkspace();
            const query = this.d.file(includeFolder ? [includeFolder] : workspace.folders, {
                maxResults: maxResults ?? undefined,
                disregardExcludeSettings: (excludePatternOrDisregardExcludes === false) || undefined,
                disregardSearchExcludeSettings: true,
                disregardIgnoreFiles: true,
                includePattern: includePattern ?? undefined,
                excludePattern: typeof excludePatternOrDisregardExcludes === 'string' ? excludePatternOrDisregardExcludes : undefined,
                _reason: 'startFileSearch'
            });
            return this.e.fileSearch(query, token).then(result => {
                return result.results.map(m => m.resource);
            }, err => {
                if (!(0, errors_1.$2)(err)) {
                    return Promise.reject(err);
                }
                return null;
            });
        }
        $startTextSearch(pattern, _folder, options, requestId, token) {
            const folder = uri_1.URI.revive(_folder);
            const workspace = this.g.getWorkspace();
            const folders = folder ? [folder] : workspace.folders.map(folder => folder.uri);
            const query = this.d.text(pattern, folders, options);
            query._reason = 'startTextSearch';
            const onProgress = (p) => {
                if (p.results) {
                    this.c.$handleTextSearchResult(p, requestId);
                }
            };
            const search = this.e.textSearch(query, token, onProgress).then(result => {
                return { limitHit: result.limitHit };
            }, err => {
                if (!(0, errors_1.$2)(err)) {
                    return Promise.reject(err);
                }
                return null;
            });
            return search;
        }
        $checkExists(folders, includes, token) {
            return this.o.invokeFunction((accessor) => (0, workspaceContains_1.$Alb)(accessor, folders, includes, token));
        }
        // --- save & edit resources ---
        async $save(uriComponents, options) {
            const uri = uri_1.URI.revive(uriComponents);
            const editors = [...this.j.findEditors(uri, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })];
            const result = await this.j.save(editors, {
                reason: 1 /* SaveReason.EXPLICIT */,
                saveAs: options.saveAs,
                force: !options.saveAs
            });
            return (0, arrays_1.$Mb)(this.x(result));
        }
        x(result) {
            if (!result.success) {
                return [];
            }
            return (0, arrays_1.$Fb)(result.editors.map(editor => editor_1.$3E.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })));
        }
        $saveAll(includeUntitled) {
            return this.j.saveAll({ includeUntitled }).then(res => res.success);
        }
        $resolveProxy(url) {
            return this.n.resolveProxy(url);
        }
        // --- trust ---
        $requestWorkspaceTrust(options) {
            return this.t.requestWorkspaceTrust(options);
        }
        y() {
            return this.s.isWorkspaceTrusted();
        }
        z() {
            this.c.$onDidGrantWorkspaceTrust();
        }
        $registerEditSessionIdentityProvider(handle, scheme) {
            const disposable = this.h.registerEditSessionIdentityProvider({
                scheme: scheme,
                getEditSessionIdentifier: async (workspaceFolder, token) => {
                    return this.c.$getEditSessionIdentifier(workspaceFolder.uri, token);
                },
                provideEditSessionIdentityMatch: async (workspaceFolder, identity1, identity2, token) => {
                    return this.c.$provideEditSessionIdentityMatch(workspaceFolder.uri, identity1, identity2, token);
                }
            });
            this.A.set(handle, disposable);
            this.a.add(disposable);
        }
        $unregisterEditSessionIdentityProvider(handle) {
            const disposable = this.A.get(handle);
            disposable?.dispose();
            this.A.delete(handle);
        }
        $registerCanonicalUriProvider(handle, scheme) {
            const disposable = this.i.registerCanonicalUriProvider({
                scheme: scheme,
                provideCanonicalUri: async (uri, targetScheme, token) => {
                    const result = await this.c.$provideCanonicalUri(uri, targetScheme, token);
                    if (result) {
                        return uri_1.URI.revive(result);
                    }
                    return result;
                }
            });
            this.B.set(handle, disposable);
            this.a.add(disposable);
        }
        $unregisterCanonicalUriProvider(handle) {
            const disposable = this.B.get(handle);
            disposable?.dispose();
            this.B.delete(handle);
        }
    };
    exports.$Clb = $Clb;
    exports.$Clb = $Clb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadWorkspace),
        __param(1, search_1.$oI),
        __param(2, workspace_1.$Kh),
        __param(3, editSessions_1.$8z),
        __param(4, canonicalUri_1.$Blb),
        __param(5, editorService_1.$9C),
        __param(6, workspaceEditing_1.$pU),
        __param(7, notification_1.$Yu),
        __param(8, request_1.$Io),
        __param(9, instantiation_1.$Ah),
        __param(10, label_1.$Vz),
        __param(11, environment_1.$Ih),
        __param(12, files_1.$6j),
        __param(13, workspaceTrust_1.$$z),
        __param(14, workspaceTrust_1.$_z)
    ], $Clb);
});
//# sourceMappingURL=mainThreadWorkspace.js.map