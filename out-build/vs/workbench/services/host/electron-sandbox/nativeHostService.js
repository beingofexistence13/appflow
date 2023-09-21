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
define(["require", "exports", "vs/base/common/event", "vs/workbench/services/host/browser/host", "vs/platform/native/common/native", "vs/platform/instantiation/common/extensions", "vs/platform/label/common/label", "vs/workbench/services/environment/common/environmentService", "vs/platform/window/common/window", "vs/base/common/lifecycle", "vs/platform/native/electron-sandbox/nativeHostService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/ipc/common/mainProcessService"], function (require, exports, event_1, host_1, native_1, extensions_1, label_1, environmentService_1, window_1, lifecycle_1, nativeHostService_1, environmentService_2, mainProcessService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let WorkbenchNativeHostService = class WorkbenchNativeHostService extends nativeHostService_1.$r7b {
        constructor(environmentService, mainProcessService) {
            super(environmentService.window.id, mainProcessService);
        }
    };
    WorkbenchNativeHostService = __decorate([
        __param(0, environmentService_2.$1$b),
        __param(1, mainProcessService_1.$o7b)
    ], WorkbenchNativeHostService);
    let WorkbenchHostService = class WorkbenchHostService extends lifecycle_1.$kc {
        constructor(a, b, c) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = event_1.Event.latch(event_1.Event.any(event_1.Event.map(event_1.Event.filter(this.a.onDidFocusWindow, id => id === this.a.windowId), () => this.hasFocus), event_1.Event.map(event_1.Event.filter(this.a.onDidBlurWindow, id => id === this.a.windowId), () => this.hasFocus)), undefined, this.q);
        }
        //#region Focus
        get onDidChangeFocus() { return this.f; }
        get hasFocus() {
            return document.hasFocus();
        }
        async hadLastFocus() {
            const activeWindowId = await this.a.getActiveWindowId();
            if (typeof activeWindowId === 'undefined') {
                return false;
            }
            return activeWindowId === this.a.windowId;
        }
        openWindow(arg1, arg2) {
            if (Array.isArray(arg1)) {
                return this.g(arg1, arg2);
            }
            return this.j(arg1);
        }
        g(toOpen, options) {
            const remoteAuthority = this.c.remoteAuthority;
            if (!!remoteAuthority) {
                toOpen.forEach(openable => openable.label = openable.label || this.h(openable));
                if (options?.remoteAuthority === undefined) {
                    // set the remoteAuthority of the window the request came from.
                    // It will be used when the input is neither file nor vscode-remote.
                    options = options ? { ...options, remoteAuthority } : { remoteAuthority };
                }
            }
            return this.a.openWindow(toOpen, options);
        }
        h(openable) {
            if ((0, window_1.$RD)(openable)) {
                return this.b.getWorkspaceLabel(openable.folderUri, { verbose: 2 /* Verbosity.LONG */ });
            }
            if ((0, window_1.$QD)(openable)) {
                return this.b.getWorkspaceLabel({ id: '', configPath: openable.workspaceUri }, { verbose: 2 /* Verbosity.LONG */ });
            }
            return this.b.getUriLabel(openable.fileUri);
        }
        j(options) {
            const remoteAuthority = this.c.remoteAuthority;
            if (!!remoteAuthority && options?.remoteAuthority === undefined) {
                // set the remoteAuthority of the window the request came from
                options = options ? { ...options, remoteAuthority } : { remoteAuthority };
            }
            return this.a.openWindow(options);
        }
        toggleFullScreen() {
            return this.a.toggleFullScreen();
        }
        //#endregion
        //#region Lifecycle
        focus(options) {
            return this.a.focusWindow(options);
        }
        restart() {
            return this.a.relaunch();
        }
        reload(options) {
            return this.a.reload(options);
        }
        close() {
            return this.a.closeWindow();
        }
        async withExpectedShutdown(expectedShutdownTask) {
            return await expectedShutdownTask();
        }
    };
    WorkbenchHostService = __decorate([
        __param(0, native_1.$05b),
        __param(1, label_1.$Vz),
        __param(2, environmentService_1.$hJ)
    ], WorkbenchHostService);
    (0, extensions_1.$mr)(host_1.$VT, WorkbenchHostService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(native_1.$05b, WorkbenchNativeHostService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=nativeHostService.js.map