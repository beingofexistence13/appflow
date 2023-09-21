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
define(["require", "exports", "vs/nls!vs/workbench/services/dialogs/browser/abstractFileDialogService", "vs/platform/window/common/window", "vs/platform/dialogs/common/dialogs", "vs/platform/workspace/common/workspace", "vs/workbench/services/history/common/history", "vs/workbench/services/environment/common/environmentService", "vs/base/common/resources", "vs/base/common/path", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/dialogs/browser/simpleFileDialog", "vs/platform/workspaces/common/workspaces", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/workbench/services/host/browser/host", "vs/base/common/severity", "vs/base/common/arrays", "vs/base/common/strings", "vs/editor/common/languages/language", "vs/platform/label/common/label", "vs/workbench/services/path/common/pathService", "vs/base/common/network", "vs/editor/common/languages/modesRegistry", "vs/platform/commands/common/commands", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/editor/common/editorService", "vs/platform/editor/common/editor", "vs/platform/log/common/log"], function (require, exports, nls, window_1, dialogs_1, workspace_1, history_1, environmentService_1, resources, path_1, instantiation_1, simpleFileDialog_1, workspaces_1, configuration_1, files_1, opener_1, host_1, severity_1, arrays_1, strings_1, language_1, label_1, pathService_1, network_1, modesRegistry_1, commands_1, codeEditorService_1, editorService_1, editor_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_3b = void 0;
    let $_3b = class $_3b {
        constructor(a, b, c, d, f, g, h, i, j, k, l, m, n, o, p, q, r) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.r = r;
        }
        async defaultFilePath(schemeFilter = this.G()) {
            // Check for last active file first...
            let candidate = this.c.getLastActiveFile(schemeFilter);
            // ...then for last active file root
            if (!candidate) {
                candidate = this.c.getLastActiveWorkspaceRoot(schemeFilter);
            }
            else {
                candidate = resources.$hg(candidate);
            }
            if (!candidate) {
                candidate = await this.preferredHome(schemeFilter);
            }
            return candidate;
        }
        async defaultFolderPath(schemeFilter = this.G()) {
            // Check for last active file root first...
            let candidate = this.c.getLastActiveWorkspaceRoot(schemeFilter);
            // ...then for last active file
            if (!candidate) {
                candidate = this.c.getLastActiveFile(schemeFilter);
            }
            if (!candidate) {
                return this.preferredHome(schemeFilter);
            }
            return resources.$hg(candidate);
        }
        async preferredHome(schemeFilter = this.G()) {
            const preferLocal = schemeFilter === network_1.Schemas.file;
            const preferredHomeConfig = this.g.inspect('files.dialog.defaultPath');
            const preferredHomeCandidate = preferLocal ? preferredHomeConfig.userLocalValue : preferredHomeConfig.userRemoteValue;
            if (preferredHomeCandidate) {
                const isPreferredHomeCandidateAbsolute = preferLocal ? (0, path_1.$8d)(preferredHomeCandidate) : (await this.n.path).isAbsolute(preferredHomeCandidate);
                if (isPreferredHomeCandidateAbsolute) {
                    const preferredHomeNormalized = preferLocal ? (0, path_1.$7d)(preferredHomeCandidate) : (await this.n.path).normalize(preferredHomeCandidate);
                    const preferredHome = resources.$sg(await this.n.fileURI(preferredHomeNormalized), this.d.remoteAuthority, this.n.defaultUriScheme);
                    if (await this.h.exists(preferredHome)) {
                        return preferredHome;
                    }
                }
            }
            return this.n.userHome({ preferLocal });
        }
        async defaultWorkspacePath(schemeFilter = this.G()) {
            let defaultWorkspacePath;
            // Check for current workspace config file first...
            if (this.b.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                const configuration = this.b.getWorkspace().configuration;
                if (configuration?.scheme === schemeFilter && (0, workspace_1.$6h)(configuration, this.d) && !(0, workspace_1.$3h)(configuration)) {
                    defaultWorkspacePath = resources.$hg(configuration);
                }
            }
            // ...then fallback to default file path
            if (!defaultWorkspacePath) {
                defaultWorkspacePath = await this.defaultFilePath(schemeFilter);
            }
            return defaultWorkspacePath;
        }
        async showSaveConfirm(fileNamesOrResources) {
            if (this.s()) {
                this.r.trace('FileDialogService: refused to show save confirmation dialog in tests.');
                // no veto when we are in extension dev testing mode because we cannot assume we run interactive
                return 1 /* ConfirmResult.DONT_SAVE */;
            }
            return this.t(fileNamesOrResources);
        }
        s() {
            if (this.d.isExtensionDevelopment && this.d.extensionTestsLocationURI) {
                return true; // integration tests
            }
            return !!this.d.enableSmokeTestDriver; // smoke tests
        }
        async t(fileNamesOrResources) {
            if (fileNamesOrResources.length === 0) {
                return 1 /* ConfirmResult.DONT_SAVE */;
            }
            let message;
            let detail = nls.localize(0, null);
            if (fileNamesOrResources.length === 1) {
                message = nls.localize(1, null, typeof fileNamesOrResources[0] === 'string' ? fileNamesOrResources[0] : resources.$fg(fileNamesOrResources[0]));
            }
            else {
                message = nls.localize(2, null, fileNamesOrResources.length);
                detail = (0, dialogs_1.$rA)(fileNamesOrResources) + '\n' + detail;
            }
            const { result } = await this.j.prompt({
                type: severity_1.default.Warning,
                message,
                detail,
                buttons: [
                    {
                        label: fileNamesOrResources.length > 1 ?
                            nls.localize(3, null) :
                            nls.localize(4, null),
                        run: () => 0 /* ConfirmResult.SAVE */
                    },
                    {
                        label: nls.localize(5, null),
                        run: () => 1 /* ConfirmResult.DONT_SAVE */
                    }
                ],
                cancelButton: {
                    run: () => 2 /* ConfirmResult.CANCEL */
                }
            });
            return result;
        }
        u(schema, _isFolder) {
            return schema === network_1.Schemas.untitled ? [network_1.Schemas.file] : (schema !== network_1.Schemas.file ? [schema, network_1.Schemas.file] : [schema]);
        }
        async v(schema, options, preferNewWindow) {
            const title = nls.localize(6, null);
            const availableFileSystems = this.u(schema);
            const uri = await this.E({ canSelectFiles: true, canSelectFolders: true, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
            if (uri) {
                const stat = await this.h.stat(uri);
                const toOpen = stat.isDirectory ? { folderUri: uri } : { fileUri: uri };
                if (!(0, window_1.$QD)(toOpen) && (0, window_1.$SD)(toOpen)) {
                    this.x(toOpen.fileUri);
                }
                if (stat.isDirectory || options.forceNewWindow || preferNewWindow) {
                    await this.a.openWindow([toOpen], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
                }
                else {
                    await this.p.openEditors([{ resource: uri, options: { source: editor_1.EditorOpenSource.USER, pinned: true } }], undefined, { validateTrust: true });
                }
            }
        }
        async w(schema, options, preferNewWindow) {
            const title = nls.localize(7, null);
            const availableFileSystems = this.u(schema);
            const uri = await this.E({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
            if (uri) {
                this.x(uri);
                if (options.forceNewWindow || preferNewWindow) {
                    await this.a.openWindow([{ fileUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
                }
                else {
                    await this.p.openEditors([{ resource: uri, options: { source: editor_1.EditorOpenSource.USER, pinned: true } }], undefined, { validateTrust: true });
                }
            }
        }
        x(uri) {
            this.l.addRecentlyOpened([{ fileUri: uri, label: this.m.getUriLabel(uri) }]);
        }
        async y(schema, options) {
            const title = nls.localize(8, null);
            const availableFileSystems = this.u(schema, true);
            const uri = await this.E({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
            if (uri) {
                return this.a.openWindow([{ folderUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
            }
        }
        async z(schema, options) {
            const title = nls.localize(9, null);
            const filters = [{ name: nls.localize(10, null), extensions: [workspace_1.$Xh] }];
            const availableFileSystems = this.u(schema, true);
            const uri = await this.E({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, defaultUri: options.defaultUri, title, filters, availableFileSystems });
            if (uri) {
                return this.a.openWindow([{ workspaceUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
            }
        }
        async A(schema, options) {
            if (!options.availableFileSystems) {
                options.availableFileSystems = this.u(schema);
            }
            options.title = nls.localize(11, null);
            const uri = await this.F(options);
            if (uri) {
                this.x(uri);
            }
            return uri;
        }
        async B(schema, options) {
            if (!options.availableFileSystems) {
                options.availableFileSystems = this.u(schema);
            }
            return this.F(options);
        }
        async C(schema, options) {
            if (!options.availableFileSystems) {
                options.availableFileSystems = this.u(schema, options.canSelectFolders);
            }
            const uri = await this.E(options);
            return uri ? [uri] : undefined;
        }
        D() {
            return this.f.createInstance(simpleFileDialog_1.$$3b);
        }
        E(options) {
            return this.D().showOpenDialog(options);
        }
        F(options) {
            return this.D().showSaveDialog(options);
        }
        G(defaultUriScheme) {
            return defaultUriScheme ?? this.n.defaultUriScheme;
        }
        H(options) {
            return options.availableFileSystems && options.availableFileSystems[0] || this.G(options.defaultUri?.scheme);
        }
        I(options) {
            if (options.availableFileSystems && (options.availableFileSystems.length > 0)) {
                return options.availableFileSystems;
            }
            const availableFileSystems = [network_1.Schemas.file];
            if (this.d.remoteAuthority) {
                availableFileSystems.unshift(network_1.Schemas.vscodeRemote);
            }
            return availableFileSystems;
        }
        J(defaultUri, availableFileSystems) {
            const options = {
                defaultUri,
                title: nls.localize(12, null),
                availableFileSystems
            };
            // Build the file filter by using our known languages
            const ext = defaultUri ? resources.$gg(defaultUri) : undefined;
            let matchingFilter;
            const registeredLanguageNames = this.k.getSortedRegisteredLanguageNames();
            const registeredLanguageFilters = (0, arrays_1.$Fb)(registeredLanguageNames.map(({ languageName, languageId }) => {
                const extensions = this.k.getExtensions(languageId);
                if (!extensions.length) {
                    return null;
                }
                const filter = { name: languageName, extensions: (0, arrays_1.$Kb)(extensions).slice(0, 10).map(e => (0, strings_1.$te)(e, '.')) };
                // https://github.com/microsoft/vscode/issues/115860
                const extOrPlaintext = ext || modesRegistry_1.$Zt;
                if (!matchingFilter && extensions.includes(extOrPlaintext)) {
                    matchingFilter = filter;
                    // The selected extension must be in the set of extensions that are in the filter list that is sent to the save dialog.
                    // If it isn't, add it manually. https://github.com/microsoft/vscode/issues/147657
                    const trimmedExt = (0, strings_1.$te)(extOrPlaintext, '.');
                    if (!filter.extensions.includes(trimmedExt)) {
                        filter.extensions.unshift(trimmedExt);
                    }
                    return null; // first matching filter will be added to the top
                }
                return filter;
            }));
            // We have no matching filter, e.g. because the language
            // is unknown. We still add the extension to the list of
            // filters though so that it can be picked
            // (https://github.com/microsoft/vscode/issues/96283)
            if (!matchingFilter && ext) {
                matchingFilter = { name: (0, strings_1.$te)(ext, '.').toUpperCase(), extensions: [(0, strings_1.$te)(ext, '.')] };
            }
            // Order of filters is
            // - All Files (we MUST do this to fix macOS issue https://github.com/microsoft/vscode/issues/102713)
            // - File Extension Match (if any)
            // - All Languages
            // - No Extension
            options.filters = (0, arrays_1.$Fb)([
                { name: nls.localize(13, null), extensions: ['*'] },
                matchingFilter,
                ...registeredLanguageFilters,
                { name: nls.localize(14, null), extensions: [''] }
            ]);
            return options;
        }
    };
    exports.$_3b = $_3b;
    exports.$_3b = $_3b = __decorate([
        __param(0, host_1.$VT),
        __param(1, workspace_1.$Kh),
        __param(2, history_1.$SM),
        __param(3, environmentService_1.$hJ),
        __param(4, instantiation_1.$Ah),
        __param(5, configuration_1.$8h),
        __param(6, files_1.$6j),
        __param(7, opener_1.$NT),
        __param(8, dialogs_1.$oA),
        __param(9, language_1.$ct),
        __param(10, workspaces_1.$fU),
        __param(11, label_1.$Vz),
        __param(12, pathService_1.$yJ),
        __param(13, commands_1.$Fr),
        __param(14, editorService_1.$9C),
        __param(15, codeEditorService_1.$nV),
        __param(16, log_1.$5i)
    ], $_3b);
});
//# sourceMappingURL=abstractFileDialogService.js.map