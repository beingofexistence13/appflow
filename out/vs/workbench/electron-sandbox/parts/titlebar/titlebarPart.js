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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/platform/storage/common/storage", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/host/browser/host", "vs/base/common/platform", "vs/platform/actions/common/actions", "vs/workbench/browser/parts/titlebar/titlebarPart", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/themeService", "vs/workbench/services/layout/browser/layoutService", "vs/platform/native/common/native", "vs/platform/window/common/window", "vs/platform/instantiation/common/instantiation", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/electron-sandbox/parts/titlebar/menubarControl", "vs/workbench/services/hover/browser/hover"], function (require, exports, browser_1, dom_1, contextkey_1, configuration_1, storage_1, environmentService_1, host_1, platform_1, actions_1, titlebarPart_1, contextView_1, themeService_1, layoutService_1, native_1, window_1, instantiation_1, codicons_1, themables_1, menubarControl_1, hover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TitlebarPart = void 0;
    let TitlebarPart = class TitlebarPart extends titlebarPart_1.TitlebarPart {
        isBigSurOrNewer() {
            const osVersion = this.environmentService.os.release;
            return parseFloat(osVersion) >= 20;
        }
        getMacTitlebarSize() {
            if (this.isBigSurOrNewer()) { // Big Sur increases title bar height
                return 28;
            }
            return 22;
        }
        get minimumHeight() {
            if (!platform_1.isMacintosh) {
                return super.minimumHeight;
            }
            return (this.isCommandCenterVisible ? 35 : this.getMacTitlebarSize()) / (this.useCounterZoom ? (0, browser_1.getZoomFactor)() : 1);
        }
        get maximumHeight() { return this.minimumHeight; }
        constructor(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, hoverService) {
            super(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, hoverService);
            this.nativeHostService = nativeHostService;
            this.environmentService = environmentService;
        }
        onUpdateAppIconDragBehavior() {
            const setting = this.configurationService.getValue('window.doubleClickIconToClose');
            if (setting && this.appIcon) {
                this.appIcon.style['-webkit-app-region'] = 'no-drag';
            }
            else if (this.appIcon) {
                this.appIcon.style['-webkit-app-region'] = 'drag';
            }
        }
        onDidChangeWindowMaximized(maximized) {
            if (this.maxRestoreControl) {
                if (maximized) {
                    this.maxRestoreControl.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.chromeMaximize));
                    this.maxRestoreControl.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.chromeRestore));
                }
                else {
                    this.maxRestoreControl.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.chromeRestore));
                    this.maxRestoreControl.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.chromeMaximize));
                }
            }
            if (this.resizer) {
                if (maximized) {
                    (0, dom_1.hide)(this.resizer);
                }
                else {
                    (0, dom_1.show)(this.resizer);
                }
            }
        }
        onMenubarFocusChanged(focused) {
            if ((platform_1.isWindows || platform_1.isLinux) && this.currentMenubarVisibility !== 'compact' && this.dragRegion) {
                if (focused) {
                    (0, dom_1.hide)(this.dragRegion);
                }
                else {
                    (0, dom_1.show)(this.dragRegion);
                }
            }
        }
        onMenubarVisibilityChanged(visible) {
            // Hide title when toggling menu bar
            if ((platform_1.isWindows || platform_1.isLinux) && this.currentMenubarVisibility === 'toggle' && visible) {
                // Hack to fix issue #52522 with layered webkit-app-region elements appearing under cursor
                if (this.dragRegion) {
                    (0, dom_1.hide)(this.dragRegion);
                    setTimeout(() => (0, dom_1.show)(this.dragRegion), 50);
                }
            }
            super.onMenubarVisibilityChanged(visible);
        }
        onConfigurationChanged(event) {
            super.onConfigurationChanged(event);
            if (event.affectsConfiguration('window.doubleClickIconToClose')) {
                if (this.appIcon) {
                    this.onUpdateAppIconDragBehavior();
                }
            }
        }
        installMenubar() {
            super.installMenubar();
            if (this.menubar) {
                return;
            }
            if (this.customMenubar) {
                this._register(this.customMenubar.onFocusStateChange(e => this.onMenubarFocusChanged(e)));
            }
        }
        createContentArea(parent) {
            const ret = super.createContentArea(parent);
            // Native menu controller
            if (platform_1.isMacintosh || (0, window_1.getTitleBarStyle)(this.configurationService) === 'native') {
                this._register(this.instantiationService.createInstance(menubarControl_1.NativeMenubarControl));
            }
            // App Icon (Native Windows/Linux)
            if (this.appIcon) {
                this.onUpdateAppIconDragBehavior();
                this._register((0, dom_1.addDisposableListener)(this.appIcon, dom_1.EventType.DBLCLICK, (e => {
                    this.nativeHostService.closeWindow();
                })));
            }
            // Window Controls (Native Windows/Linux)
            if (!platform_1.isMacintosh && (0, window_1.getTitleBarStyle)(this.configurationService) !== 'native' && !(0, browser_1.isWCOEnabled)() && this.primaryWindowControls) {
                // Minimize
                const minimizeIcon = (0, dom_1.append)(this.primaryWindowControls, (0, dom_1.$)('div.window-icon.window-minimize' + themables_1.ThemeIcon.asCSSSelector(codicons_1.Codicon.chromeMinimize)));
                this._register((0, dom_1.addDisposableListener)(minimizeIcon, dom_1.EventType.CLICK, e => {
                    this.nativeHostService.minimizeWindow();
                }));
                // Restore
                this.maxRestoreControl = (0, dom_1.append)(this.primaryWindowControls, (0, dom_1.$)('div.window-icon.window-max-restore'));
                this._register((0, dom_1.addDisposableListener)(this.maxRestoreControl, dom_1.EventType.CLICK, async (e) => {
                    const maximized = await this.nativeHostService.isMaximized();
                    if (maximized) {
                        return this.nativeHostService.unmaximizeWindow();
                    }
                    return this.nativeHostService.maximizeWindow();
                }));
                // Close
                const closeIcon = (0, dom_1.append)(this.primaryWindowControls, (0, dom_1.$)('div.window-icon.window-close' + themables_1.ThemeIcon.asCSSSelector(codicons_1.Codicon.chromeClose)));
                this._register((0, dom_1.addDisposableListener)(closeIcon, dom_1.EventType.CLICK, e => {
                    this.nativeHostService.closeWindow();
                }));
                // Resizer
                this.resizer = (0, dom_1.append)(this.rootContainer, (0, dom_1.$)('div.resizer'));
                this._register(this.layoutService.onDidChangeWindowMaximized(maximized => this.onDidChangeWindowMaximized(maximized)));
                this.onDidChangeWindowMaximized(this.layoutService.isWindowMaximized());
            }
            // Window System Context Menu
            // See https://github.com/electron/electron/issues/24893
            if (platform_1.isWindows && (0, window_1.getTitleBarStyle)(this.configurationService) === 'custom') {
                this._register(this.nativeHostService.onDidTriggerSystemContextMenu(({ windowId, x, y }) => {
                    if (this.nativeHostService.windowId !== windowId) {
                        return;
                    }
                    const zoomFactor = (0, browser_1.getZoomFactor)();
                    this.onContextMenu(new MouseEvent('mouseup', { clientX: x / zoomFactor, clientY: y / zoomFactor }), actions_1.MenuId.TitleBarContext);
                }));
            }
            return ret;
        }
        updateStyles() {
            super.updateStyles();
            // WCO styles only supported on Windows currently
            if ((0, window_1.useWindowControlsOverlay)(this.configurationService)) {
                if (!this.cachedWindowControlStyles ||
                    this.cachedWindowControlStyles.bgColor !== this.element.style.backgroundColor ||
                    this.cachedWindowControlStyles.fgColor !== this.element.style.color) {
                    this.nativeHostService.updateWindowControls({ backgroundColor: this.element.style.backgroundColor, foregroundColor: this.element.style.color });
                }
            }
        }
        layout(width, height) {
            super.layout(width, height);
            if ((0, window_1.useWindowControlsOverlay)(this.configurationService) ||
                (platform_1.isMacintosh && platform_1.isNative && (0, window_1.getTitleBarStyle)(this.configurationService) === 'custom')) {
                // When the user goes into full screen mode, the height of the title bar becomes 0.
                // Instead, set it back to the default titlebar height for Catalina users
                // so that they can have the traffic lights rendered at the proper offset.
                // Ref https://github.com/microsoft/vscode/issues/159862
                const newHeight = (height > 0 || this.isBigSurOrNewer()) ?
                    Math.round(height * (0, browser_1.getZoomFactor)()) : this.getMacTitlebarSize();
                if (newHeight !== this.cachedWindowControlHeight) {
                    this.cachedWindowControlHeight = newHeight;
                    this.nativeHostService.updateWindowControls({ height: newHeight });
                }
            }
        }
    };
    exports.TitlebarPart = TitlebarPart;
    exports.TitlebarPart = TitlebarPart = __decorate([
        __param(0, contextView_1.IContextMenuService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, themeService_1.IThemeService),
        __param(5, storage_1.IStorageService),
        __param(6, layoutService_1.IWorkbenchLayoutService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, host_1.IHostService),
        __param(9, native_1.INativeHostService),
        __param(10, hover_1.IHoverService)
    ], TitlebarPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGViYXJQYXJ0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2VsZWN0cm9uLXNhbmRib3gvcGFydHMvdGl0bGViYXIvdGl0bGViYXJQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXVCekYsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBYSxTQUFRLDJCQUFtQjtRQU01QyxlQUFlO1lBQ3RCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDO1lBQ3JELE9BQU8sVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNwQyxDQUFDO1FBRU8sa0JBQWtCO1lBQ3pCLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLEVBQUUscUNBQXFDO2dCQUNsRSxPQUFPLEVBQUUsQ0FBQzthQUNWO1lBRUQsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRUQsSUFBYSxhQUFhO1lBQ3pCLElBQUksQ0FBQyxzQkFBVyxFQUFFO2dCQUNqQixPQUFPLEtBQUssQ0FBQyxhQUFhLENBQUM7YUFDM0I7WUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFBLHVCQUFhLEdBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckgsQ0FBQztRQUNELElBQWEsYUFBYSxLQUFhLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFJbkUsWUFDc0Isa0JBQXVDLEVBQ3JDLG9CQUEyQyxFQUM5QixrQkFBc0QsRUFDbkUsb0JBQTJDLEVBQ25ELFlBQTJCLEVB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