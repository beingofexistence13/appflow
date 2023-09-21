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
define(["require", "exports", "vs/nls", "vs/base/common/resources", "vs/platform/configuration/common/configuration", "vs/workbench/services/editor/common/editorService", "vs/base/common/lifecycle", "vs/workbench/common/editor", "vs/workbench/services/environment/browser/environmentService", "vs/platform/workspace/common/workspace", "vs/base/common/platform", "vs/base/common/strings", "vs/platform/instantiation/common/instantiation", "vs/base/common/labels", "vs/platform/label/common/label", "vs/base/common/event", "vs/base/common/async", "vs/platform/product/common/productService", "vs/base/common/network", "vs/platform/workspace/common/virtualWorkspace", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/common/views"], function (require, exports, nls_1, resources_1, configuration_1, editorService_1, lifecycle_1, editor_1, environmentService_1, workspace_1, platform_1, strings_1, instantiation_1, labels_1, label_1, event_1, async_1, productService_1, network_1, virtualWorkspace_1, userDataProfile_1, views_1) {
    "use strict";
    var WindowTitle_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WindowTitle = void 0;
    var WindowSettingNames;
    (function (WindowSettingNames) {
        WindowSettingNames["titleSeparator"] = "window.titleSeparator";
        WindowSettingNames["title"] = "window.title";
    })(WindowSettingNames || (WindowSettingNames = {}));
    let WindowTitle = class WindowTitle extends lifecycle_1.Disposable {
        static { WindowTitle_1 = this; }
        static { this.NLS_USER_IS_ADMIN = platform_1.isWindows ? (0, nls_1.localize)('userIsAdmin', "[Administrator]") : (0, nls_1.localize)('userIsSudo', "[Superuser]"); }
        static { this.NLS_EXTENSION_HOST = (0, nls_1.localize)('devExtensionWindowTitlePrefix', "[Extension Development Host]"); }
        static { this.TITLE_DIRTY = '\u25cf '; }
        constructor(configurationService, editorService, environmentService, contextService, instantiationService, labelService, userDataProfileService, productService, viewsService) {
            super();
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.environmentService = environmentService;
            this.contextService = contextService;
            this.instantiationService = instantiationService;
            this.labelService = labelService;
            this.userDataProfileService = userDataProfileService;
            this.productService = productService;
            this.viewsService = viewsService;
            this.properties = { isPure: true, isAdmin: false, prefix: undefined };
            this.activeEditorListeners = this._register(new lifecycle_1.DisposableStore());
            this.titleUpdater = this._register(new async_1.RunOnceScheduler(() => this.doUpdateTitle(), 0));
            this.onDidChangeEmitter = new event_1.Emitter();
            this.onDidChange = this.onDidChangeEmitter.event;
            this.registerListeners();
        }
        get value() {
            return this.title ?? '';
        }
        get workspaceName() {
            return this.labelService.getWorkspaceLabel(this.contextService.getWorkspace());
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationChanged(e)));
            this._register(this.editorService.onDidActiveEditorChange(() => this.onActiveEditorChange()));
            this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.titleUpdater.schedule()));
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.titleUpdater.schedule()));
            this._register(this.contextService.onDidChangeWorkspaceName(() => this.titleUpdater.schedule()));
            this._register(this.labelService.onDidChangeFormatters(() => this.titleUpdater.schedule()));
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => this.titleUpdater.schedule()));
            this._register(this.viewsService.onDidChangeFocusedView(() => this.titleUpdater.schedule()));
        }
        onConfigurationChanged(event) {
            if (event.affectsConfiguration("window.title" /* WindowSettingNames.title */) || event.affectsConfiguration("window.titleSeparator" /* WindowSettingNames.titleSeparator */)) {
                this.titleUpdater.schedule();
            }
        }
        onActiveEditorChange() {
            // Dispose old listeners
            this.activeEditorListeners.clear();
            // Calculate New Window Title
            this.titleUpdater.schedule();
            // Apply listener for dirty and label changes
            const activeEditor = this.editorService.activeEditor;
            if (activeEditor) {
                this.activeEditorListeners.add(activeEditor.onDidChangeDirty(() => this.titleUpdater.schedule()));
                this.activeEditorListeners.add(activeEditor.onDidChangeLabel(() => this.titleUpdater.schedule()));
            }
        }
        doUpdateTitle() {
            const title = this.getFullWindowTitle();
            if (title !== this.title) {
                // Always set the native window title to identify us properly to the OS
                let nativeTitle = title;
                if (!(0, strings_1.trim)(nativeTitle)) {
                    nativeTitle = this.productService.nameLong;
                }
                if (!window.document.title && platform_1.isMacintosh && nativeTitle === this.productService.nameLong) {
                    // TODO@electron macOS: if we set a window title for
                    // the first time and it matches the one we set in
                    // `windowImpl.ts` somehow the window does not appear
                    // in the "Windows" menu. As such, we set the title
                    // briefly to something different to ensure macOS
                    // recognizes we have a window.
                    // See: https://github.com/microsoft/vscode/issues/191288
                    window.document.title = `${this.productService.nameLong} ${WindowTitle_1.TITLE_DIRTY}`;
                }
                window.document.title = nativeTitle;
                this.title = title;
                this.onDidChangeEmitter.fire();
            }
        }
        getFullWindowTitle() {
            let title = this.getWindowTitle() || this.productService.nameLong;
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
            if (this.properties.prefix) {
                prefix = this.properties.prefix;
            }
            if (this.environmentService.isExtensionDevelopment) {
                prefix = !prefix
                    ? WindowTitle_1.NLS_EXTENSION_HOST
                    : `${WindowTitle_1.NLS_EXTENSION_HOST} - ${prefix}`;
            }
            if (this.properties.isAdmin) {
                suffix = WindowTitle_1.NLS_USER_IS_ADMIN;
            }
            return { prefix, suffix };
        }
        updateProperties(properties) {
            const isAdmin = typeof properties.isAdmin === 'boolean' ? properties.isAdmin : this.properties.isAdmin;
            const isPure = typeof properties.isPure === 'boolean' ? properties.isPure : this.properties.isPure;
            const prefix = typeof properties.prefix === 'string' ? properties.prefix : this.properties.prefix;
            if (isAdmin !== this.properties.isAdmin || isPure !== this.properties.isPure || prefix !== this.properties.prefix) {
                this.properties.isAdmin = isAdmin;
                this.properties.isPure = isPure;
                this.properties.prefix = prefix;
                this.titleUpdater.schedule();
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
            const editor = this.editorService.activeEditor;
            const workspace = this.contextService.getWorkspace();
            // Compute root
            let root;
            if (workspace.configuration) {
                root = workspace.configuration;
            }
            else if (workspace.folders.length) {
                root = workspace.folders[0].uri;
            }
            // Compute active editor folder
            const editorResource = editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            let editorFolderResource = editorResource ? (0, resources_1.dirname)(editorResource) : undefined;
            if (editorFolderResource?.path === '.') {
                editorFolderResource = undefined;
            }
            // Compute folder resource
            // Single Root Workspace: always the root single workspace in this case
            // Otherwise: root folder of the currently active file if any
            let folder = undefined;
            if (this.contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                folder = workspace.folders[0];
            }
            else if (editorResource) {
                folder = this.contextService.getWorkspaceFolder(editorResource) ?? undefined;
            }
            // Compute remote
            // vscode-remtoe: use as is
            // otherwise figure out if we have a virtual folder opened
            let remoteName = undefined;
            if (this.environmentService.remoteAuthority && !platform_1.isWeb) {
                remoteName = this.labelService.getHostLabel(network_1.Schemas.vscodeRemote, this.environmentService.remoteAuthority);
            }
            else {
                const virtualWorkspaceLocation = (0, virtualWorkspace_1.getVirtualWorkspaceLocation)(workspace);
                if (virtualWorkspaceLocation) {
                    remoteName = this.labelService.getHostLabel(virtualWorkspaceLocation.scheme, virtualWorkspaceLocation.authority);
                }
            }
            // Variables
            const activeEditorShort = editor ? editor.getTitle(0 /* Verbosity.SHORT */) : '';
            const activeEditorMedium = editor ? editor.getTitle(1 /* Verbosity.MEDIUM */) : activeEditorShort;
            const activeEditorLong = editor ? editor.getTitle(2 /* Verbosity.LONG */) : activeEditorMedium;
            const activeFolderShort = editorFolderResource ? (0, resources_1.basename)(editorFolderResource) : '';
            const activeFolderMedium = editorFolderResource ? this.labelService.getUriLabel(editorFolderResource, { relative: true }) : '';
            const activeFolderLong = editorFolderResource ? this.labelService.getUriLabel(editorFolderResource) : '';
            const rootName = this.labelService.getWorkspaceLabel(workspace);
            const rootNameShort = this.labelService.getWorkspaceLabel(workspace, { verbose: 0 /* LabelVerbosity.SHORT */ });
            const rootPath = root ? this.labelService.getUriLabel(root) : '';
            const folderName = folder ? folder.name : '';
            const folderPath = folder ? this.labelService.getUriLabel(folder.uri) : '';
            const dirty = editor?.isDirty() && !editor.isSaving() ? WindowTitle_1.TITLE_DIRTY : '';
            const appName = this.productService.nameLong;
            const profileName = this.userDataProfileService.currentProfile.isDefault ? '' : this.userDataProfileService.currentProfile.name;
            const separator = this.configurationService.getValue("window.titleSeparator" /* WindowSettingNames.titleSeparator */);
            const titleTemplate = this.configurationService.getValue("window.title" /* WindowSettingNames.title */);
            const focusedView = this.viewsService.getFocusedViewName();
            return (0, labels_1.template)(titleTemplate, {
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
            const title = this.configurationService.inspect("window.title" /* WindowSettingNames.title */);
            const titleSeparator = this.configurationService.inspect("window.titleSeparator" /* WindowSettingNames.titleSeparator */);
            return title.value !== title.defaultValue || titleSeparator.value !== titleSeparator.defaultValue;
        }
    };
    exports.WindowTitle = WindowTitle;
    exports.WindowTitle = WindowTitle = WindowTitle_1 = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, editorService_1.IEditorService),
        __param(2, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, label_1.ILabelService),
        __param(6, userDataProfile_1.IUserDataProfileService),
        __param(7, productService_1.IProductService),
        __param(8, views_1.IViewsService)
    ], WindowTitle);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93VGl0bGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy90aXRsZWJhci93aW5kb3dUaXRsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeUJoRyxJQUFXLGtCQUdWO0lBSEQsV0FBVyxrQkFBa0I7UUFDNUIsOERBQXdDLENBQUE7UUFDeEMsNENBQXNCLENBQUE7SUFDdkIsQ0FBQyxFQUhVLGtCQUFrQixLQUFsQixrQkFBa0IsUUFHNUI7SUFFTSxJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFZLFNBQVEsc0JBQVU7O2lCQUVsQixzQkFBaUIsR0FBRyxvQkFBUyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxBQUFqRyxDQUFrRztpQkFDbkgsdUJBQWtCLEdBQUcsSUFBQSxjQUFRLEVBQUMsK0JBQStCLEVBQUUsOEJBQThCLENBQUMsQUFBNUUsQ0FBNkU7aUJBQy9GLGdCQUFXLEdBQUcsU0FBUyxBQUFaLENBQWE7UUFXaEQsWUFDd0Isb0JBQThELEVBQ3JFLGFBQThDLEVBQ3pCLGtCQUEwRSxFQUNyRixjQUF5RCxFQUM1RCxvQkFBOEQsRUFDdEUsWUFBNEMsRUFDbEMsc0JBQWdFLEVBQ3hFLGNBQWdELEVBQ2xELFlBQTRDO1lBRTNELEtBQUssRUFBRSxDQUFDO1lBVmtDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDcEQsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ04sdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQztZQUNwRSxtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDekMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNyRCxpQkFBWSxH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