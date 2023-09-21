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
    let WorkbenchNativeHostService = class WorkbenchNativeHostService extends nativeHostService_1.NativeHostService {
        constructor(environmentService, mainProcessService) {
            super(environmentService.window.id, mainProcessService);
        }
    };
    WorkbenchNativeHostService = __decorate([
        __param(0, environmentService_2.INativeWorkbenchEnvironmentService),
        __param(1, mainProcessService_1.IMainProcessService)
    ], WorkbenchNativeHostService);
    let WorkbenchHostService = class WorkbenchHostService extends lifecycle_1.Disposable {
        constructor(nativeHostService, labelService, environmentService) {
            super();
            this.nativeHostService = nativeHostService;
            this.labelService = labelService;
            this.environmentService = environmentService;
            this._onDidChangeFocus = event_1.Event.latch(event_1.Event.any(event_1.Event.map(event_1.Event.filter(this.nativeHostService.onDidFocusWindow, id => id === this.nativeHostService.windowId), () => this.hasFocus), event_1.Event.map(event_1.Event.filter(this.nativeHostService.onDidBlurWindow, id => id === this.nativeHostService.windowId), () => this.hasFocus)), undefined, this._store);
        }
        //#region Focus
        get onDidChangeFocus() { return this._onDidChangeFocus; }
        get hasFocus() {
            return document.hasFocus();
        }
        async hadLastFocus() {
            const activeWindowId = await this.nativeHostService.getActiveWindowId();
            if (typeof activeWindowId === 'undefined') {
                return false;
            }
            return activeWindowId === this.nativeHostService.windowId;
        }
        openWindow(arg1, arg2) {
            if (Array.isArray(arg1)) {
                return this.doOpenWindow(arg1, arg2);
            }
            return this.doOpenEmptyWindow(arg1);
        }
        doOpenWindow(toOpen, options) {
            const remoteAuthority = this.environmentService.remoteAuthority;
            if (!!remoteAuthority) {
                toOpen.forEach(openable => openable.label = openable.label || this.getRecentLabel(openable));
                if (options?.remoteAuthority === undefined) {
                    // set the remoteAuthority of the window the request came from.
                    // It will be used when the input is neither file nor vscode-remote.
                    options = options ? { ...options, remoteAuthority } : { remoteAuthority };
                }
            }
            return this.nativeHostService.openWindow(toOpen, options);
        }
        getRecentLabel(openable) {
            if ((0, window_1.isFolderToOpen)(openable)) {
                return this.labelService.getWorkspaceLabel(openable.folderUri, { verbose: 2 /* Verbosity.LONG */ });
            }
            if ((0, window_1.isWorkspaceToOpen)(openable)) {
                return this.labelService.getWorkspaceLabel({ id: '', configPath: openable.workspaceUri }, { verbose: 2 /* Verbosity.LONG */ });
            }
            return this.labelService.getUriLabel(openable.fileUri);
        }
        doOpenEmptyWindow(options) {
            const remoteAuthority = this.environmentService.remoteAuthority;
            if (!!remoteAuthority && options?.remoteAuthority === undefined) {
                // set the remoteAuthority of the window the request came from
                options = options ? { ...options, remoteAuthority } : { remoteAuthority };
            }
            return this.nativeHostService.openWindow(options);
        }
        toggleFullScreen() {
            return this.nativeHostService.toggleFullScreen();
        }
        //#endregion
        //#region Lifecycle
        focus(options) {
            return this.nativeHostService.focusWindow(options);
        }
        restart() {
            return this.nativeHostService.relaunch();
        }
        reload(options) {
            return this.nativeHostService.reload(options);
        }
        close() {
            return this.nativeHostService.closeWindow();
        }
        async withExpectedShutdown(expectedShutdownTask) {
            return await expectedShutdownTask();
        }
    };
    WorkbenchHostService = __decorate([
        __param(0, native_1.INativeHostService),
        __param(1, label_1.ILabelService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService)
    ], WorkbenchHostService);
    (0, extensions_1.registerSingleton)(host_1.IHostService, WorkbenchHostService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(native_1.INativeHostService, WorkbenchNativeHostService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlSG9zdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvaG9zdC9lbGVjdHJvbi1zYW5kYm94L25hdGl2ZUhvc3RTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBY2hHLElBQU0sMEJBQTBCLEdBQWhDLE1BQU0sMEJBQTJCLFNBQVEscUNBQWlCO1FBRXpELFlBQ3FDLGtCQUFzRCxFQUNyRSxrQkFBdUM7WUFFNUQsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUN6RCxDQUFDO0tBQ0QsQ0FBQTtJQVJLLDBCQUEwQjtRQUc3QixXQUFBLHVEQUFrQyxDQUFBO1FBQ2xDLFdBQUEsd0NBQW1CLENBQUE7T0FKaEIsMEJBQTBCLENBUS9CO0lBRUQsSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSxzQkFBVTtRQUk1QyxZQUNxQixpQkFBc0QsRUFDM0QsWUFBNEMsRUFDN0Isa0JBQWlFO1lBRS9GLEtBQUssRUFBRSxDQUFDO1lBSjZCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDMUMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDWix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBUXhGLHNCQUFpQixHQUFtQixhQUFLLENBQUMsS0FBSyxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQ2hFLGFBQUssQ0FBQyxHQUFHLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFD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