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
    exports.$F_b = void 0;
    let $F_b = class $F_b extends titlebarPart_1.$P4b {
        Gb() {
            const osVersion = this.lb.os.release;
            return parseFloat(osVersion) >= 20;
        }
        Hb() {
            if (this.Gb()) { // Big Sur increases title bar height
                return 28;
            }
            return 22;
        }
        get minimumHeight() {
            if (!platform_1.$j) {
                return super.minimumHeight;
            }
            return (this.isCommandCenterVisible ? 35 : this.Hb()) / (this.Bb ? (0, browser_1.$ZN)() : 1);
        }
        get maximumHeight() { return this.minimumHeight; }
        constructor(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, Jb, hoverService) {
            super(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, hoverService);
            this.Jb = Jb;
            this.lb = environmentService;
        }
        Kb() {
            const setting = this.kb.getValue('window.doubleClickIconToClose');
            if (setting && this.Z) {
                this.Z.style['-webkit-app-region'] = 'no-drag';
            }
            else if (this.Z) {
                this.Z.style['-webkit-app-region'] = 'drag';
            }
        }
        Lb(maximized) {
            if (this.Cb) {
                if (maximized) {
                    this.Cb.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.chromeMaximize));
                    this.Cb.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.chromeRestore));
                }
                else {
                    this.Cb.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.chromeRestore));
                    this.Cb.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.chromeMaximize));
                }
            }
            if (this.Db) {
                if (maximized) {
                    (0, dom_1.$eP)(this.Db);
                }
                else {
                    (0, dom_1.$dP)(this.Db);
                }
            }
        }
        Mb(focused) {
            if ((platform_1.$i || platform_1.$k) && this.zb !== 'compact' && this.R) {
                if (focused) {
                    (0, dom_1.$eP)(this.R);
                }
                else {
                    (0, dom_1.$dP)(this.R);
                }
            }
        }
        tb(visible) {
            // Hide title when toggling menu bar
            if ((platform_1.$i || platform_1.$k) && this.zb === 'toggle' && visible) {
                // Hack to fix issue #52522 with layered webkit-app-region elements appearing under cursor
                if (this.R) {
                    (0, dom_1.$eP)(this.R);
                    setTimeout(() => (0, dom_1.$dP)(this.R), 50);
                }
            }
            super.tb(visible);
        }
        sb(event) {
            super.sb(event);
            if (event.affectsConfiguration('window.doubleClickIconToClose')) {
                if (this.Z) {
                    this.Kb();
                }
            }
        }
        vb() {
            super.vb();
            if (this.bb) {
                return;
            }
            if (this.Y) {
                this.B(this.Y.onFocusStateChange(e => this.Mb(e)));
            }
        }
        L(parent) {
            const ret = super.L(parent);
            // Native menu controller
            if (platform_1.$j || (0, window_1.$UD)(this.kb) === 'native') {
                this.B(this.mb.createInstance(menubarControl_1.$E_b));
            }
            // App Icon (Native Windows/Linux)
            if (this.Z) {
                this.Kb();
                this.B((0, dom_1.$nO)(this.Z, dom_1.$3O.DBLCLICK, (e => {
                    this.Jb.closeWindow();
                })));
            }
            // Window Controls (Native Windows/Linux)
            if (!platform_1.$j && (0, window_1.$UD)(this.kb) !== 'native' && !(0, browser_1.$aO)() && this.Q) {
                // Minimize
                const minimizeIcon = (0, dom_1.$0O)(this.Q, (0, dom_1.$)('div.window-icon.window-minimize' + themables_1.ThemeIcon.asCSSSelector(codicons_1.$Pj.chromeMinimize)));
                this.B((0, dom_1.$nO)(minimizeIcon, dom_1.$3O.CLICK, e => {
                    this.Jb.minimizeWindow();
                }));
                // Restore
                this.Cb = (0, dom_1.$0O)(this.Q, (0, dom_1.$)('div.window-icon.window-max-restore'));
                this.B((0, dom_1.$nO)(this.Cb, dom_1.$3O.CLICK, async (e) => {
                    const maximized = await this.Jb.isMaximized();
                    if (maximized) {
                        return this.Jb.unmaximizeWindow();
                    }
                    return this.Jb.maximizeWindow();
                }));
                // Close
                const closeIcon = (0, dom_1.$0O)(this.Q, (0, dom_1.$)('div.window-icon.window-close' + themables_1.ThemeIcon.asCSSSelector(codicons_1.$Pj.chromeClose)));
                this.B((0, dom_1.$nO)(closeIcon, dom_1.$3O.CLICK, e => {
                    this.Jb.closeWindow();
                }));
                // Resizer
                this.Db = (0, dom_1.$0O)(this.P, (0, dom_1.$)('div.resizer'));
                this.B(this.u.onDidChangeWindowMaximized(maximized => this.Lb(maximized)));
                this.Lb(this.u.isWindowMaximized());
            }
            // Window System Context Menu
            // See https://github.com/electron/electron/issues/24893
            if (platform_1.$i && (0, window_1.$UD)(this.kb) === 'custom') {
                this.B(this.Jb.onDidTriggerSystemContextMenu(({ windowId, x, y }) => {
                    if (this.Jb.windowId !== windowId) {
                        return;
                    }
                    const zoomFactor = (0, browser_1.$ZN)();
                    this.yb(new MouseEvent('mouseup', { clientX: x / zoomFactor, clientY: y / zoomFactor }), actions_1.$Ru.TitleBarContext);
                }));
            }
            return ret;
        }
        updateStyles() {
            super.updateStyles();
            // WCO styles only supported on Windows currently
            if ((0, window_1.$VD)(this.kb)) {
                if (!this.Eb ||
                    this.Eb.bgColor !== this.element.style.backgroundColor ||
                    this.Eb.fgColor !== this.element.style.color) {
                    this.Jb.updateWindowControls({ backgroundColor: this.element.style.backgroundColor, foregroundColor: this.element.style.color });
                }
            }
        }
        layout(width, height) {
            super.layout(width, height);
            if ((0, window_1.$VD)(this.kb) ||
                (platform_1.$j && platform_1.$m && (0, window_1.$UD)(this.kb) === 'custom')) {
                // When the user goes into full screen mode, the height of the title bar becomes 0.
                // Instead, set it back to the default titlebar height for Catalina users
                // so that they can have the traffic lights rendered at the proper offset.
                // Ref https://github.com/microsoft/vscode/issues/159862
                const newHeight = (height > 0 || this.Gb()) ?
                    Math.round(height * (0, browser_1.$ZN)()) : this.Hb();
                if (newHeight !== this.Fb) {
                    this.Fb = newHeight;
                    this.Jb.updateWindowControls({ height: newHeight });
                }
            }
        }
    };
    exports.$F_b = $F_b;
    exports.$F_b = $F_b = __decorate([
        __param(0, contextView_1.$WZ),
        __param(1, configuration_1.$8h),
        __param(2, environmentService_1.$1$b),
        __param(3, instantiation_1.$Ah),
        __param(4, themeService_1.$gv),
        __param(5, storage_1.$Vo),
        __param(6, layoutService_1.$Meb),
        __param(7, contextkey_1.$3i),
        __param(8, host_1.$VT),
        __param(9, native_1.$05b),
        __param(10, hover_1.$zib)
    ], $F_b);
});
//# sourceMappingURL=titlebarPart.js.map