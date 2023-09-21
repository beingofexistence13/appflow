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
define(["require", "exports", "vs/base/common/event", "vs/workbench/services/host/browser/host", "vs/platform/instantiation/common/extensions", "vs/platform/layout/browser/layoutService", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/platform/window/common/window", "vs/workbench/common/editor", "vs/workbench/browser/editor", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/workbench/services/environment/browser/environmentService", "vs/base/common/decorators", "vs/base/common/extpath", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/workbench/services/workspaces/browser/workspaces", "vs/nls", "vs/base/common/severity", "vs/platform/dialogs/common/dialogs", "vs/base/browser/event", "vs/base/common/types", "vs/platform/workspace/common/workspace", "vs/base/common/network", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/arrays"], function (require, exports, event_1, host_1, extensions_1, layoutService_1, editorService_1, configuration_1, window_1, editor_1, editor_2, files_1, label_1, dom_1, lifecycle_1, environmentService_1, decorators_1, extpath_1, workspaceEditing_1, instantiation_1, lifecycle_2, log_1, workspaces_1, nls_1, severity_1, dialogs_1, event_2, types_1, workspace_1, network_1, userDataProfile_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserHostService = void 0;
    var HostShutdownReason;
    (function (HostShutdownReason) {
        /**
         * An unknown shutdown reason.
         */
        HostShutdownReason[HostShutdownReason["Unknown"] = 1] = "Unknown";
        /**
         * A shutdown that was potentially triggered by keyboard use.
         */
        HostShutdownReason[HostShutdownReason["Keyboard"] = 2] = "Keyboard";
        /**
         * An explicit shutdown via code.
         */
        HostShutdownReason[HostShutdownReason["Api"] = 3] = "Api";
    })(HostShutdownReason || (HostShutdownReason = {}));
    let BrowserHostService = class BrowserHostService extends lifecycle_1.Disposable {
        constructor(layoutService, configurationService, fileService, labelService, environmentService, instantiationService, lifecycleService, logService, dialogService, contextService, userDataProfileService) {
            super();
            this.layoutService = layoutService;
            this.configurationService = configurationService;
            this.fileService = fileService;
            this.labelService = labelService;
            this.environmentService = environmentService;
            this.instantiationService = instantiationService;
            this.lifecycleService = lifecycleService;
            this.logService = logService;
            this.dialogService = dialogService;
            this.contextService = contextService;
            this.userDataProfileService = userDataProfileService;
            this.shutdownReason = HostShutdownReason.Unknown;
            if (environmentService.options?.workspaceProvider) {
                this.workspaceProvider = environmentService.options.workspaceProvider;
            }
            else {
                this.workspaceProvider = new class {
                    constructor() {
                        this.workspace = undefined;
                        this.trusted = undefined;
                    }
                    async open() { return true; }
                };
            }
            this.registerListeners();
        }
        registerListeners() {
            // Veto shutdown depending on `window.confirmBeforeClose` setting
            this._register(this.lifecycleService.onBeforeShutdown(e => this.onBeforeShutdown(e)));
            // Track modifier keys to detect keybinding usage
            this._register(dom_1.ModifierKeyEmitter.getInstance().event(() => this.updateShutdownReasonFromEvent()));
        }
        onBeforeShutdown(e) {
            switch (this.shutdownReason) {
                // Unknown / Keyboard shows veto depending on setting
                case HostShutdownReason.Unknown:
                case HostShutdownReason.Keyboard: {
                    const confirmBeforeClose = this.configurationService.getValue('window.confirmBeforeClose');
                    if (confirmBeforeClose === 'always' || (confirmBeforeClose === 'keyboardOnly' && this.shutdownReason === HostShutdownReason.Keyboard)) {
                        e.veto(true, 'veto.confirmBeforeClose');
                    }
                    break;
                }
                // Api never shows veto
                case HostShutdownReason.Api:
                    break;
            }
            // Unset for next shutdown
            this.shutdownReason = HostShutdownReason.Unknown;
        }
        updateShutdownReasonFromEvent() {
            if (this.shutdownReason === HostShutdownReason.Api) {
                return; // do not overwrite any explicitly set shutdown reason
            }
            if (dom_1.ModifierKeyEmitter.getInstance().isModifierPressed) {
                this.shutdownReason = HostShutdownReason.Keyboard;
            }
            else {
                this.shutdownReason = HostShutdownReason.Unknown;
            }
        }
        //#region Focus
        get onDidChangeFocus() {
            const focusTracker = this._register((0, dom_1.trackFocus)(window));
            const onVisibilityChange = this._register(new event_2.DomEmitter(window.document, 'visibilitychange'));
            return event_1.Event.latch(event_1.Event.any(event_1.Event.map(focusTracker.onDidFocus, () => this.hasFocus), event_1.Event.map(focusTracker.onDidBlur, () => this.hasFocus), event_1.Event.map(onVisibilityChange.event, () => this.hasFocus)));
        }
        get hasFocus() {
            return document.hasFocus();
        }
        async hadLastFocus() {
            return true;
        }
        async focus() {
            window.focus();
        }
        openWindow(arg1, arg2) {
            if (Array.isArray(arg1)) {
                return this.doOpenWindow(arg1, arg2);
            }
            return this.doOpenEmptyWindow(arg1);
        }
        async doOpenWindow(toOpen, options) {
            const payload = this.preservePayload(false /* not an empty window */);
            const fileOpenables = [];
            const foldersToAdd = [];
            for (const openable of toOpen) {
                openable.label = openable.label || this.getRecentLabel(openable);
                // Folder
                if ((0, window_1.isFolderToOpen)(openable)) {
                    if (options?.addMode) {
                        foldersToAdd.push(({ uri: openable.folderUri }));
                    }
                    else {
                        this.doOpen({ folderUri: openable.folderUri }, { reuse: this.shouldReuse(options, false /* no file */), payload });
                    }
                }
                // Workspace
                else if ((0, window_1.isWorkspaceToOpen)(openable)) {
                    this.doOpen({ workspaceUri: openable.workspaceUri }, { reuse: this.shouldReuse(options, false /* no file */), payload });
                }
                // File (handled later in bulk)
                else if ((0, window_1.isFileToOpen)(openable)) {
                    fileOpenables.push(openable);
                }
            }
            // Handle Folders to Add
            if (foldersToAdd.length > 0) {
                this.withServices(accessor => {
                    const workspaceEditingService = accessor.get(workspaceEditing_1.IWorkspaceEditingService);
                    workspaceEditingService.addFolders(foldersToAdd);
                });
            }
            // Handle Files
            if (fileOpenables.length > 0) {
                this.withServices(async (accessor) => {
                    const editorService = accessor.get(editorService_1.IEditorService);
                    // Support mergeMode
                    if (options?.mergeMode && fileOpenables.length === 4) {
                        const editors = (0, arrays_1.coalesce)(await (0, editor_1.pathsToEditors)(fileOpenables, this.fileService, this.logService));
                        if (editors.length !== 4 || !(0, editor_1.isResourceEditorInput)(editors[0]) || !(0, editor_1.isResourceEditorInput)(editors[1]) || !(0, editor_1.isResourceEditorInput)(editors[2]) || !(0, editor_1.isResourceEditorInput)(editors[3])) {
                            return; // invalid resources
                        }
                        // Same Window: open via editor service in current window
                        if (this.shouldReuse(options, true /* file */)) {
                            editorService.openEditor({
                                input1: { resource: editors[0].resource },
                                input2: { resource: editors[1].resource },
                                base: { resource: editors[2].resource },
                                result: { resource: editors[3].resource },
                                options: { pinned: true }
                            });
                        }
                        // New Window: open into empty window
                        else {
                            const environment = new Map();
                            environment.set('mergeFile1', editors[0].resource.toString());
                            environment.set('mergeFile2', editors[1].resource.toString());
                            environment.set('mergeFileBase', editors[2].resource.toString());
                            environment.set('mergeFileResult', editors[3].resource.toString());
                            this.doOpen(undefined, { payload: Array.from(environment.entries()) });
                        }
                    }
                    // Support diffMode
                    if (options?.diffMode && fileOpenables.length === 2) {
                        const editors = (0, arrays_1.coalesce)(await (0, editor_1.pathsToEditors)(fileOpenables, this.fileService, this.logService));
                        if (editors.length !== 2 || !(0, editor_1.isResourceEditorInput)(editors[0]) || !(0, editor_1.isResourceEditorInput)(editors[1])) {
                            return; // invalid resources
                        }
                        // Same Window: open via editor service in current window
                        if (this.shouldReuse(options, true /* file */)) {
                            editorService.openEditor({
                                original: { resource: editors[0].resource },
                                modified: { resource: editors[1].resource },
                                options: { pinned: true }
                            });
                        }
                        // New Window: open into empty window
                        else {
                            const environment = new Map();
                            environment.set('diffFileSecondary', editors[0].resource.toString());
                            environment.set('diffFilePrimary', editors[1].resource.toString());
                            this.doOpen(undefined, { payload: Array.from(environment.entries()) });
                        }
                    }
                    // Just open normally
                    else {
                        for (const openable of fileOpenables) {
                            // Same Window: open via editor service in current window
                            if (this.shouldReuse(options, true /* file */)) {
                                let openables = [];
                                // Support: --goto parameter to open on line/col
                                if (options?.gotoLineMode) {
                                    const pathColumnAware = (0, extpath_1.parseLineAndColumnAware)(openable.fileUri.path);
                                    openables = [{
                                            fileUri: openable.fileUri.with({ path: pathColumnAware.path }),
                                            options: {
                                                selection: !(0, types_1.isUndefined)(pathColumnAware.line) ? { startLineNumber: pathColumnAware.line, startColumn: pathColumnAware.column || 1 } : undefined
                                            }
                                        }];
                                }
                                else {
                                    openables = [openable];
                                }
                                editorService.openEditors((0, arrays_1.coalesce)(await (0, editor_1.pathsToEditors)(openables, this.fileService, this.logService)), undefined, { validateTrust: true });
                            }
                            // New Window: open into empty window
                            else {
                                const environment = new Map();
                                environment.set('openFile', openable.fileUri.toString());
                                if (options?.gotoLineMode) {
                                    environment.set('gotoLineMode', 'true');
                                }
                                this.doOpen(undefined, { payload: Array.from(environment.entries()) });
                            }
                        }
                    }
                    // Support wait mode
                    const waitMarkerFileURI = options?.waitMarkerFileURI;
                    if (waitMarkerFileURI) {
                        (async () => {
                            // Wait for the resources to be closed in the text editor...
                            await this.instantiationService.invokeFunction(accessor => (0, editor_2.whenEditorClosed)(accessor, fileOpenables.map(fileOpenable => fileOpenable.fileUri)));
                            // ...before deleting the wait marker file
                            await this.fileService.del(waitMarkerFileURI);
                        })();
                    }
                });
            }
        }
        withServices(fn) {
            // Host service is used in a lot of contexts and some services
            // need to be resolved dynamically to avoid cyclic dependencies
            // (https://github.com/microsoft/vscode/issues/108522)
            this.instantiationService.invokeFunction(accessor => fn(accessor));
        }
        preservePayload(isEmptyWindow) {
            // Selectively copy payload: for now only extension debugging properties are considered
            const newPayload = new Array();
            if (!isEmptyWindow && this.environmentService.extensionDevelopmentLocationURI) {
                newPayload.push(['extensionDevelopmentPath', this.environmentService.extensionDevelopmentLocationURI.toString()]);
                if (this.environmentService.debugExtensionHost.debugId) {
                    newPayload.push(['debugId', this.environmentService.debugExtensionHost.debugId]);
                }
                if (this.environmentService.debugExtensionHost.port) {
                    newPayload.push(['inspect-brk-extensions', String(this.environmentService.debugExtensionHost.port)]);
                }
            }
            if (!this.userDataProfileService.currentProfile.isDefault) {
                newPayload.push(['lastActiveProfile', this.userDataProfileService.currentProfile.id]);
            }
            return newPayload.length ? newPayload : undefined;
        }
        getRecentLabel(openable) {
            if ((0, window_1.isFolderToOpen)(openable)) {
                return this.labelService.getWorkspaceLabel(openable.folderUri, { verbose: 2 /* Verbosity.LONG */ });
            }
            if ((0, window_1.isWorkspaceToOpen)(openable)) {
                return this.labelService.getWorkspaceLabel((0, workspaces_1.getWorkspaceIdentifier)(openable.workspaceUri), { verbose: 2 /* Verbosity.LONG */ });
            }
            return this.labelService.getUriLabel(openable.fileUri);
        }
        shouldReuse(options = Object.create(null), isFile) {
            if (options.waitMarkerFileURI) {
                return true; // always handle --wait in same window
            }
            const windowConfig = this.configurationService.getValue('window');
            const openInNewWindowConfig = isFile ? (windowConfig?.openFilesInNewWindow || 'off' /* default */) : (windowConfig?.openFoldersInNewWindow || 'default' /* default */);
            let openInNewWindow = (options.preferNewWindow || !!options.forceNewWindow) && !options.forceReuseWindow;
            if (!options.forceNewWindow && !options.forceReuseWindow && (openInNewWindowConfig === 'on' || openInNewWindowConfig === 'off')) {
                openInNewWindow = (openInNewWindowConfig === 'on');
            }
            return !openInNewWindow;
        }
        async doOpenEmptyWindow(options) {
            return this.doOpen(undefined, {
                reuse: options?.forceReuseWindow,
                payload: this.preservePayload(true /* empty window */)
            });
        }
        async doOpen(workspace, options) {
            // When we are in a temporary workspace and are asked to open a local folder
            // we swap that folder into the workspace to avoid a window reload. Access
            // to local resources is only possible without a window reload because it
            // needs user activation.
            if (workspace && (0, window_1.isFolderToOpen)(workspace) && workspace.folderUri.scheme === network_1.Schemas.file && (0, workspace_1.isTemporaryWorkspace)(this.contextService.getWorkspace())) {
                this.withServices(async (accessor) => {
                    const workspaceEditingService = accessor.get(workspaceEditing_1.IWorkspaceEditingService);
                    await workspaceEditingService.updateFolders(0, this.contextService.getWorkspace().folders.length, [{ uri: workspace.folderUri }]);
                });
                return;
            }
            // We know that `workspaceProvider.open` will trigger a shutdown
            // with `options.reuse` so we handle this expected shutdown
            if (options?.reuse) {
                await this.handleExpectedShutdown(4 /* ShutdownReason.LOAD */);
            }
            const opened = await this.workspaceProvider.open(workspace, options);
            if (!opened) {
                const { confirmed } = await this.dialogService.confirm({
                    type: severity_1.default.Warning,
                    message: (0, nls_1.localize)('unableToOpenExternal', "The browser interrupted the opening of a new tab or window. Press 'Open' to open it anyway."),
                    primaryButton: (0, nls_1.localize)({ key: 'open', comment: ['&& denotes a mnemonic'] }, "&&Open")
                });
                if (confirmed) {
                    await this.workspaceProvider.open(workspace, options);
                }
            }
        }
        async toggleFullScreen() {
            const target = this.layoutService.container;
            // Chromium
            if (document.fullscreen !== undefined) {
                if (!document.fullscreen) {
                    try {
                        return await target.requestFullscreen();
                    }
                    catch (error) {
                        this.logService.warn('toggleFullScreen(): requestFullscreen failed'); // https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
                    }
                }
                else {
                    try {
                        return await document.exitFullscreen();
                    }
                    catch (error) {
                        this.logService.warn('toggleFullScreen(): exitFullscreen failed');
                    }
                }
            }
            // Safari and Edge 14 are all using webkit prefix
            if (document.webkitIsFullScreen !== undefined) {
                try {
                    if (!document.webkitIsFullScreen) {
                        target.webkitRequestFullscreen(); // it's async, but doesn't return a real promise.
                    }
                    else {
                        document.webkitExitFullscreen(); // it's async, but doesn't return a real promise.
                    }
                }
                catch {
                    this.logService.warn('toggleFullScreen(): requestFullscreen/exitFullscreen failed');
                }
            }
        }
        //#endregion
        //#region Lifecycle
        async restart() {
            this.reload();
        }
        async reload() {
            await this.handleExpectedShutdown(3 /* ShutdownReason.RELOAD */);
            window.location.reload();
        }
        async close() {
            await this.handleExpectedShutdown(1 /* ShutdownReason.CLOSE */);
            window.close();
        }
        async withExpectedShutdown(expectedShutdownTask) {
            const previousShutdownReason = this.shutdownReason;
            try {
                this.shutdownReason = HostShutdownReason.Api;
                return await expectedShutdownTask();
            }
            finally {
                this.shutdownReason = previousShutdownReason;
            }
        }
        async handleExpectedShutdown(reason) {
            // Update shutdown reason in a way that we do
            // not show a dialog because this is a expected
            // shutdown.
            this.shutdownReason = HostShutdownReason.Api;
            // Signal shutdown reason to lifecycle
            return this.lifecycleService.withExpectedShutdown(reason);
        }
    };
    exports.BrowserHostService = BrowserHostService;
    __decorate([
        decorators_1.memoize
    ], BrowserHostService.prototype, "onDidChangeFocus", null);
    exports.BrowserHostService = BrowserHostService = __decorate([
        __param(0, layoutService_1.ILayoutService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, files_1.IFileService),
        __param(3, label_1.ILabelService),
        __param(4, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, lifecycle_2.ILifecycleService),
        __param(7, log_1.ILogService),
        __param(8, dialogs_1.IDialogService),
        __param(9, workspace_1.IWorkspaceContextService),
        __param(10, userDataProfile_1.IUserDataProfileService)
    ], BrowserHostService);
    (0, extensions_1.registerSingleton)(host_1.IHostService, BrowserHostService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlckhvc3RTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2hvc3QvYnJvd3Nlci9icm93c2VySG9zdFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNkVoRyxJQUFLLGtCQWdCSjtJQWhCRCxXQUFLLGtCQUFrQjtRQUV0Qjs7V0FFRztRQUNILGlFQUFXLENBQUE7UUFFWDs7V0FFRztRQUNILG1FQUFZLENBQUE7UUFFWjs7V0FFRztRQUNILHlEQUFPLENBQUE7SUFDUixDQUFDLEVBaEJJLGtCQUFrQixLQUFsQixrQkFBa0IsUUFnQnRCO0lBRU0sSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQVFqRCxZQUNpQixhQUE4QyxFQUN2QyxvQkFBNEQsRUFDckUsV0FBMEMsRUFDekMsWUFBNEMsRUFDdEIsa0JBQXdFLEVBQ3RGLG9CQUE0RCxFQUNoRSxnQkFBMEQsRUFDaEUsVUFBd0MsRUFDckMsYUFBOEMsRUFDcEMsY0FBeUQsRUFDMUQsc0JBQWdFO1lBRXpGLEtBQUssRUFBRSxDQUFDO1lBWnlCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN0Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3BELGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3hCLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ0wsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQztZQUNyRSx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQy9DLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBeUI7WUFDL0MsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNwQixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDbkIsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQ3pDLDJCQUFzQixHQUF0QixzQkFBc0Is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