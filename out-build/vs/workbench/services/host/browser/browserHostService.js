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
define(["require", "exports", "vs/base/common/event", "vs/workbench/services/host/browser/host", "vs/platform/instantiation/common/extensions", "vs/platform/layout/browser/layoutService", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/platform/window/common/window", "vs/workbench/common/editor", "vs/workbench/browser/editor", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/workbench/services/environment/browser/environmentService", "vs/base/common/decorators", "vs/base/common/extpath", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/workbench/services/workspaces/browser/workspaces", "vs/nls!vs/workbench/services/host/browser/browserHostService", "vs/base/common/severity", "vs/platform/dialogs/common/dialogs", "vs/base/browser/event", "vs/base/common/types", "vs/platform/workspace/common/workspace", "vs/base/common/network", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/arrays"], function (require, exports, event_1, host_1, extensions_1, layoutService_1, editorService_1, configuration_1, window_1, editor_1, editor_2, files_1, label_1, dom_1, lifecycle_1, environmentService_1, decorators_1, extpath_1, workspaceEditing_1, instantiation_1, lifecycle_2, log_1, workspaces_1, nls_1, severity_1, dialogs_1, event_2, types_1, workspace_1, network_1, userDataProfile_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FV = void 0;
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
    let $FV = class $FV extends lifecycle_1.$kc {
        constructor(c, f, g, h, j, m, n, r, s, t, u) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.b = HostShutdownReason.Unknown;
            if (j.options?.workspaceProvider) {
                this.a = j.options.workspaceProvider;
            }
            else {
                this.a = new class {
                    constructor() {
                        this.workspace = undefined;
                        this.trusted = undefined;
                    }
                    async open() { return true; }
                };
            }
            this.w();
        }
        w() {
            // Veto shutdown depending on `window.confirmBeforeClose` setting
            this.B(this.n.onBeforeShutdown(e => this.y(e)));
            // Track modifier keys to detect keybinding usage
            this.B(dom_1.$xP.getInstance().event(() => this.z()));
        }
        y(e) {
            switch (this.b) {
                // Unknown / Keyboard shows veto depending on setting
                case HostShutdownReason.Unknown:
                case HostShutdownReason.Keyboard: {
                    const confirmBeforeClose = this.f.getValue('window.confirmBeforeClose');
                    if (confirmBeforeClose === 'always' || (confirmBeforeClose === 'keyboardOnly' && this.b === HostShutdownReason.Keyboard)) {
                        e.veto(true, 'veto.confirmBeforeClose');
                    }
                    break;
                }
                // Api never shows veto
                case HostShutdownReason.Api:
                    break;
            }
            // Unset for next shutdown
            this.b = HostShutdownReason.Unknown;
        }
        z() {
            if (this.b === HostShutdownReason.Api) {
                return; // do not overwrite any explicitly set shutdown reason
            }
            if (dom_1.$xP.getInstance().isModifierPressed) {
                this.b = HostShutdownReason.Keyboard;
            }
            else {
                this.b = HostShutdownReason.Unknown;
            }
        }
        //#region Focus
        get onDidChangeFocus() {
            const focusTracker = this.B((0, dom_1.$8O)(window));
            const onVisibilityChange = this.B(new event_2.$9P(window.document, 'visibilitychange'));
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
                return this.C(arg1, arg2);
            }
            return this.I(arg1);
        }
        async C(toOpen, options) {
            const payload = this.F(false /* not an empty window */);
            const fileOpenables = [];
            const foldersToAdd = [];
            for (const openable of toOpen) {
                openable.label = openable.label || this.G(openable);
                // Folder
                if ((0, window_1.$RD)(openable)) {
                    if (options?.addMode) {
                        foldersToAdd.push(({ uri: openable.folderUri }));
                    }
                    else {
                        this.J({ folderUri: openable.folderUri }, { reuse: this.H(options, false /* no file */), payload });
                    }
                }
                // Workspace
                else if ((0, window_1.$QD)(openable)) {
                    this.J({ workspaceUri: openable.workspaceUri }, { reuse: this.H(options, false /* no file */), payload });
                }
                // File (handled later in bulk)
                else if ((0, window_1.$SD)(openable)) {
                    fileOpenables.push(openable);
                }
            }
            // Handle Folders to Add
            if (foldersToAdd.length > 0) {
                this.D(accessor => {
                    const workspaceEditingService = accessor.get(workspaceEditing_1.$pU);
                    workspaceEditingService.addFolders(foldersToAdd);
                });
            }
            // Handle Files
            if (fileOpenables.length > 0) {
                this.D(async (accessor) => {
                    const editorService = accessor.get(editorService_1.$9C);
                    // Support mergeMode
                    if (options?.mergeMode && fileOpenables.length === 4) {
                        const editors = (0, arrays_1.$Fb)(await (0, editor_1.$4E)(fileOpenables, this.g, this.r));
                        if (editors.length !== 4 || !(0, editor_1.$NE)(editors[0]) || !(0, editor_1.$NE)(editors[1]) || !(0, editor_1.$NE)(editors[2]) || !(0, editor_1.$NE)(editors[3])) {
                            return; // invalid resources
                        }
                        // Same Window: open via editor service in current window
                        if (this.H(options, true /* file */)) {
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
                            this.J(undefined, { payload: Array.from(environment.entries()) });
                        }
                    }
                    // Support diffMode
                    if (options?.diffMode && fileOpenables.length === 2) {
                        const editors = (0, arrays_1.$Fb)(await (0, editor_1.$4E)(fileOpenables, this.g, this.r));
                        if (editors.length !== 2 || !(0, editor_1.$NE)(editors[0]) || !(0, editor_1.$NE)(editors[1])) {
                            return; // invalid resources
                        }
                        // Same Window: open via editor service in current window
                        if (this.H(options, true /* file */)) {
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
                            this.J(undefined, { payload: Array.from(environment.entries()) });
                        }
                    }
                    // Just open normally
                    else {
                        for (const openable of fileOpenables) {
                            // Same Window: open via editor service in current window
                            if (this.H(options, true /* file */)) {
                                let openables = [];
                                // Support: --goto parameter to open on line/col
                                if (options?.gotoLineMode) {
                                    const pathColumnAware = (0, extpath_1.$Pf)(openable.fileUri.path);
                                    openables = [{
                                            fileUri: openable.fileUri.with({ path: pathColumnAware.path }),
                                            options: {
                                                selection: !(0, types_1.$qf)(pathColumnAware.line) ? { startLineNumber: pathColumnAware.line, startColumn: pathColumnAware.column || 1 } : undefined
                                            }
                                        }];
                                }
                                else {
                                    openables = [openable];
                                }
                                editorService.openEditors((0, arrays_1.$Fb)(await (0, editor_1.$4E)(openables, this.g, this.r)), undefined, { validateTrust: true });
                            }
                            // New Window: open into empty window
                            else {
                                const environment = new Map();
                                environment.set('openFile', openable.fileUri.toString());
                                if (options?.gotoLineMode) {
                                    environment.set('gotoLineMode', 'true');
                                }
                                this.J(undefined, { payload: Array.from(environment.entries()) });
                            }
                        }
                    }
                    // Support wait mode
                    const waitMarkerFileURI = options?.waitMarkerFileURI;
                    if (waitMarkerFileURI) {
                        (async () => {
                            // Wait for the resources to be closed in the text editor...
                            await this.m.invokeFunction(accessor => (0, editor_2.$bU)(accessor, fileOpenables.map(fileOpenable => fileOpenable.fileUri)));
                            // ...before deleting the wait marker file
                            await this.g.del(waitMarkerFileURI);
                        })();
                    }
                });
            }
        }
        D(fn) {
            // Host service is used in a lot of contexts and some services
            // need to be resolved dynamically to avoid cyclic dependencies
            // (https://github.com/microsoft/vscode/issues/108522)
            this.m.invokeFunction(accessor => fn(accessor));
        }
        F(isEmptyWindow) {
            // Selectively copy payload: for now only extension debugging properties are considered
            const newPayload = new Array();
            if (!isEmptyWindow && this.j.extensionDevelopmentLocationURI) {
                newPayload.push(['extensionDevelopmentPath', this.j.extensionDevelopmentLocationURI.toString()]);
                if (this.j.debugExtensionHost.debugId) {
                    newPayload.push(['debugId', this.j.debugExtensionHost.debugId]);
                }
                if (this.j.debugExtensionHost.port) {
                    newPayload.push(['inspect-brk-extensions', String(this.j.debugExtensionHost.port)]);
                }
            }
            if (!this.u.currentProfile.isDefault) {
                newPayload.push(['lastActiveProfile', this.u.currentProfile.id]);
            }
            return newPayload.length ? newPayload : undefined;
        }
        G(openable) {
            if ((0, window_1.$RD)(openable)) {
                return this.h.getWorkspaceLabel(openable.folderUri, { verbose: 2 /* Verbosity.LONG */ });
            }
            if ((0, window_1.$QD)(openable)) {
                return this.h.getWorkspaceLabel((0, workspaces_1.$sU)(openable.workspaceUri), { verbose: 2 /* Verbosity.LONG */ });
            }
            return this.h.getUriLabel(openable.fileUri);
        }
        H(options = Object.create(null), isFile) {
            if (options.waitMarkerFileURI) {
                return true; // always handle --wait in same window
            }
            const windowConfig = this.f.getValue('window');
            const openInNewWindowConfig = isFile ? (windowConfig?.openFilesInNewWindow || 'off' /* default */) : (windowConfig?.openFoldersInNewWindow || 'default' /* default */);
            let openInNewWindow = (options.preferNewWindow || !!options.forceNewWindow) && !options.forceReuseWindow;
            if (!options.forceNewWindow && !options.forceReuseWindow && (openInNewWindowConfig === 'on' || openInNewWindowConfig === 'off')) {
                openInNewWindow = (openInNewWindowConfig === 'on');
            }
            return !openInNewWindow;
        }
        async I(options) {
            return this.J(undefined, {
                reuse: options?.forceReuseWindow,
                payload: this.F(true /* empty window */)
            });
        }
        async J(workspace, options) {
            // When we are in a temporary workspace and are asked to open a local folder
            // we swap that folder into the workspace to avoid a window reload. Access
            // to local resources is only possible without a window reload because it
            // needs user activation.
            if (workspace && (0, window_1.$RD)(workspace) && workspace.folderUri.scheme === network_1.Schemas.file && (0, workspace_1.$3h)(this.t.getWorkspace())) {
                this.D(async (accessor) => {
                    const workspaceEditingService = accessor.get(workspaceEditing_1.$pU);
                    await workspaceEditingService.updateFolders(0, this.t.getWorkspace().folders.length, [{ uri: workspace.folderUri }]);
                });
                return;
            }
            // We know that `workspaceProvider.open` will trigger a shutdown
            // with `options.reuse` so we handle this expected shutdown
            if (options?.reuse) {
                await this.L(4 /* ShutdownReason.LOAD */);
            }
            const opened = await this.a.open(workspace, options);
            if (!opened) {
                const { confirmed } = await this.s.confirm({
                    type: severity_1.default.Warning,
                    message: (0, nls_1.localize)(0, null),
                    primaryButton: (0, nls_1.localize)(1, null)
                });
                if (confirmed) {
                    await this.a.open(workspace, options);
                }
            }
        }
        async toggleFullScreen() {
            const target = this.c.container;
            // Chromium
            if (document.fullscreen !== undefined) {
                if (!document.fullscreen) {
                    try {
                        return await target.requestFullscreen();
                    }
                    catch (error) {
                        this.r.warn('toggleFullScreen(): requestFullscreen failed'); // https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
                    }
                }
                else {
                    try {
                        return await document.exitFullscreen();
                    }
                    catch (error) {
                        this.r.warn('toggleFullScreen(): exitFullscreen failed');
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
                    this.r.warn('toggleFullScreen(): requestFullscreen/exitFullscreen failed');
                }
            }
        }
        //#endregion
        //#region Lifecycle
        async restart() {
            this.reload();
        }
        async reload() {
            await this.L(3 /* ShutdownReason.RELOAD */);
            window.location.reload();
        }
        async close() {
            await this.L(1 /* ShutdownReason.CLOSE */);
            window.close();
        }
        async withExpectedShutdown(expectedShutdownTask) {
            const previousShutdownReason = this.b;
            try {
                this.b = HostShutdownReason.Api;
                return await expectedShutdownTask();
            }
            finally {
                this.b = previousShutdownReason;
            }
        }
        async L(reason) {
            // Update shutdown reason in a way that we do
            // not show a dialog because this is a expected
            // shutdown.
            this.b = HostShutdownReason.Api;
            // Signal shutdown reason to lifecycle
            return this.n.withExpectedShutdown(reason);
        }
    };
    exports.$FV = $FV;
    __decorate([
        decorators_1.$6g
    ], $FV.prototype, "onDidChangeFocus", null);
    exports.$FV = $FV = __decorate([
        __param(0, layoutService_1.$XT),
        __param(1, configuration_1.$8h),
        __param(2, files_1.$6j),
        __param(3, label_1.$Vz),
        __param(4, environmentService_1.$LT),
        __param(5, instantiation_1.$Ah),
        __param(6, lifecycle_2.$7y),
        __param(7, log_1.$5i),
        __param(8, dialogs_1.$oA),
        __param(9, workspace_1.$Kh),
        __param(10, userDataProfile_1.$CJ)
    ], $FV);
    (0, extensions_1.$mr)(host_1.$VT, $FV, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=browserHostService.js.map