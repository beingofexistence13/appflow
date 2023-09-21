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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/titlebar/windowTitle", "vs/base/common/resources", "vs/platform/configuration/common/configuration", "vs/workbench/services/editor/common/editorService", "vs/base/common/lifecycle", "vs/workbench/common/editor", "vs/workbench/services/environment/browser/environmentService", "vs/platform/workspace/common/workspace", "vs/base/common/platform", "vs/base/common/strings", "vs/platform/instantiation/common/instantiation", "vs/base/common/labels", "vs/platform/label/common/label", "vs/base/common/event", "vs/base/common/async", "vs/platform/product/common/productService", "vs/base/common/network", "vs/platform/workspace/common/virtualWorkspace", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/common/views"], function (require, exports, nls_1, resources_1, configuration_1, editorService_1, lifecycle_1, editor_1, environmentService_1, workspace_1, platform_1, strings_1, instantiation_1, labels_1, label_1, event_1, async_1, productService_1, network_1, virtualWorkspace_1, userDataProfile_1, views_1) {
    "use strict";
    var $N4b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$N4b = void 0;
    var WindowSettingNames;
    (function (WindowSettingNames) {
        WindowSettingNames["titleSeparator"] = "window.titleSeparator";
        WindowSettingNames["title"] = "window.title";
    })(WindowSettingNames || (WindowSettingNames = {}));
    let $N4b = class $N4b extends lifecycle_1.$kc {
        static { $N4b_1 = this; }
        static { this.a = platform_1.$i ? (0, nls_1.localize)(0, null) : (0, nls_1.localize)(1, null); }
        static { this.b = (0, nls_1.localize)(2, null); }
        static { this.c = '\u25cf '; }
        constructor(n, r, s, t, u, w, y, z, C) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.f = { isPure: true, isAdmin: false, prefix: undefined };
            this.g = this.B(new lifecycle_1.$jc());
            this.h = this.B(new async_1.$Sg(() => this.H(), 0));
            this.j = new event_1.$fd();
            this.onDidChange = this.j.event;
            this.D();
        }
        get value() {
            return this.m ?? '';
        }
        get workspaceName() {
            return this.w.getWorkspaceLabel(this.t.getWorkspace());
        }
        D() {
            this.B(this.n.onDidChangeConfiguration(e => this.F(e)));
            this.B(this.r.onDidActiveEditorChange(() => this.G()));
            this.B(this.t.onDidChangeWorkspaceFolders(() => this.h.schedule()));
            this.B(this.t.onDidChangeWorkbenchState(() => this.h.schedule()));
            this.B(this.t.onDidChangeWorkspaceName(() => this.h.schedule()));
            this.B(this.w.onDidChangeFormatters(() => this.h.schedule()));
            this.B(this.y.onDidChangeCurrentProfile(() => this.h.schedule()));
            this.B(this.C.onDidChangeFocusedView(() => this.h.schedule()));
        }
        F(event) {
            if (event.affectsConfiguration("window.title" /* WindowSettingNames.title */) || event.affectsConfiguration("window.titleSeparator" /* WindowSettingNames.titleSeparator */)) {
                this.h.schedule();
            }
        }
        G() {
            // Dispose old listeners
            this.g.clear();
            // Calculate New Window Title
            this.h.schedule();
            // Apply listener for dirty and label changes
            const activeEditor = this.r.activeEditor;
            if (activeEditor) {
                this.g.add(activeEditor.onDidChangeDirty(() => this.h.schedule()));
                this.g.add(activeEditor.onDidChangeLabel(() => this.h.schedule()));
            }
        }
        H() {
            const title = this.I();
            if (title !== this.m) {
                // Always set the native window title to identify us properly to the OS
                let nativeTitle = title;
                if (!(0, strings_1.$te)(nativeTitle)) {
                    nativeTitle = this.z.nameLong;
                }
                if (!window.document.title && platform_1.$j && nativeTitle === this.z.nameLong) {
                    // TODO@electron macOS: if we set a window title for
                    // the first time and it matches the one we set in
                    // `windowImpl.ts` somehow the window does not appear
                    // in the "Windows" menu. As such, we set the title
                    // briefly to something different to ensure macOS
                    // recognizes we have a window.
                    // See: https://github.com/microsoft/vscode/issues/191288
                    window.document.title = `${this.z.nameLong} ${$N4b_1.c}`;
                }
                window.document.title = nativeTitle;
                this.m = title;
                this.j.fire();
            }
        }
        I() {
            let title = this.getWindowTitle() || this.z.nameLong;
            const { prefix, suffix } = this.getTitleDecorations();
            if (prefix) {
                title = `${prefix} ${title}`;
            }
            if (suffix) {
                title = `${title} ${suffix}`;
            }
            // Replace non-space whitespace
            title = title.replace(/[^\S ]/g, ' ');
            return title;
        }
        getTitleDecorations() {
            let prefix;
            let suffix;
            if (this.f.prefix) {
                prefix = this.f.prefix;
            }
            if (this.s.isExtensionDevelopment) {
                prefix = !prefix
                    ? $N4b_1.b
                    : `${$N4b_1.b} - ${prefix}`;
            }
            if (this.f.isAdmin) {
                suffix = $N4b_1.a;
            }
            return { prefix, suffix };
        }
        updateProperties(properties) {
            const isAdmin = typeof properties.isAdmin === 'boolean' ? properties.isAdmin : this.f.isAdmin;
            const isPure = typeof properties.isPure === 'boolean' ? properties.isPure : this.f.isPure;
            const prefix = typeof properties.prefix === 'string' ? properties.prefix : this.f.prefix;
            if (isAdmin !== this.f.isAdmin || isPure !== this.f.isPure || prefix !== this.f.prefix) {
                this.f.isAdmin = isAdmin;
                this.f.isPure = isPure;
                this.f.prefix = prefix;
                this.h.schedule();
            }
        }
        /**
         * Possible template values:
         *
         * {activeEditorLong}: e.g. /Users/Development/myFolder/myFileFolder/myFile.txt
         * {activeEditorMedium}: e.g. myFolder/myFileFolder/myFile.txt
         * {activeEditorShort}: e.g. myFile.txt
         * {activeFolderLong}: e.g. /Users/Development/myFolder/myFileFolder
         * {activeFolderMedium}: e.g. myFolder/myFileFolder
         * {activeFolderShort}: e.g. myFileFolder
         * {rootName}: e.g. myFolder1, myFolder2, myFolder3
         * {rootPath}: e.g. /Users/Development
         * {folderName}: e.g. myFolder
         * {folderPath}: e.g. /Users/Development/myFolder
         * {appName}: e.g. VS Code
         * {remoteName}: e.g. SSH
         * {dirty}: indicator
         * {separator}: conditional separator
         */
        getWindowTitle() {
            const editor = this.r.activeEditor;
            const workspace = this.t.getWorkspace();
            // Compute root
            let root;
            if (workspace.configuration) {
                root = workspace.configuration;
            }
            else if (workspace.folders.length) {
                root = workspace.folders[0].uri;
            }
            // Compute active editor folder
            const editorResource = editor_1.$3E.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            let editorFolderResource = editorResource ? (0, resources_1.$hg)(editorResource) : undefined;
            if (editorFolderResource?.path === '.') {
                editorFolderResource = undefined;
            }
            // Compute folder resource
            // Single Root Workspace: always the root single workspace in this case
            // Otherwise: root folder of the currently active file if any
            let folder = undefined;
            if (this.t.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                folder = workspace.folders[0];
            }
            else if (editorResource) {
                folder = this.t.getWorkspaceFolder(editorResource) ?? undefined;
            }
            // Compute remote
            // vscode-remtoe: use as is
            // otherwise figure out if we have a virtual folder opened
            let remoteName = undefined;
            if (this.s.remoteAuthority && !platform_1.$o) {
                remoteName = this.w.getHostLabel(network_1.Schemas.vscodeRemote, this.s.remoteAuthority);
            }
            else {
                const virtualWorkspaceLocation = (0, virtualWorkspace_1.$uJ)(workspace);
                if (virtualWorkspaceLocation) {
                    remoteName = this.w.getHostLabel(virtualWorkspaceLocation.scheme, virtualWorkspaceLocation.authority);
                }
            }
            // Variables
            const activeEditorShort = editor ? editor.getTitle(0 /* Verbosity.SHORT */) : '';
            const activeEditorMedium = editor ? editor.getTitle(1 /* Verbosity.MEDIUM */) : activeEditorShort;
            const activeEditorLong = editor ? editor.getTitle(2 /* Verbosity.LONG */) : activeEditorMedium;
            const activeFolderShort = editorFolderResource ? (0, resources_1.$fg)(editorFolderResource) : '';
            const activeFolderMedium = editorFolderResource ? this.w.getUriLabel(editorFolderResource, { relative: true }) : '';
            const activeFolderLong = editorFolderResource ? this.w.getUriLabel(editorFolderResource) : '';
            const rootName = this.w.getWorkspaceLabel(workspace);
            const rootNameShort = this.w.getWorkspaceLabel(workspace, { verbose: 0 /* LabelVerbosity.SHORT */ });
            const rootPath = root ? this.w.getUriLabel(root) : '';
            const folderName = folder ? folder.name : '';
            const folderPath = folder ? this.w.getUriLabel(folder.uri) : '';
            const dirty = editor?.isDirty() && !editor.isSaving() ? $N4b_1.c : '';
            const appName = this.z.nameLong;
            const profileName = this.y.currentProfile.isDefault ? '' : this.y.currentProfile.name;
            const separator = this.n.getValue("window.titleSeparator" /* WindowSettingNames.titleSeparator */);
            const titleTemplate = this.n.getValue("window.title" /* WindowSettingNames.title */);
            const focusedView = this.C.getFocusedViewName();
            return (0, labels_1.$jA)(titleTemplate, {
                activeEditorShort,
                activeEditorLong,
                activeEditorMedium,
                activeFolderShort,
                activeFolderMedium,
                activeFolderLong,
                rootName,
                rootPath,
                rootNameShort,
                folderName,
                folderPath,
                dirty,
                appName,
                remoteName,
                profileName,
                focusedView,
                separator: { label: separator }
            });
        }
        isCustomTitleFormat() {
            const title = this.n.inspect("window.title" /* WindowSettingNames.title */);
            const titleSeparator = this.n.inspect("window.titleSeparator" /* WindowSettingNames.titleSeparator */);
            return title.value !== title.defaultValue || titleSeparator.value !== titleSeparator.defaultValue;
        }
    };
    exports.$N4b = $N4b;
    exports.$N4b = $N4b = $N4b_1 = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, editorService_1.$9C),
        __param(2, environmentService_1.$LT),
        __param(3, workspace_1.$Kh),
        __param(4, instantiation_1.$Ah),
        __param(5, label_1.$Vz),
        __param(6, userDataProfile_1.$CJ),
        __param(7, productService_1.$kj),
        __param(8, views_1.$$E)
    ], $N4b);
});
//# sourceMappingURL=windowTitle.js.map