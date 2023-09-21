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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/titlebar/titlebarPart", "vs/workbench/browser/part", "vs/base/browser/browser", "vs/platform/window/common/window", "vs/platform/contextview/browser/contextView", "vs/base/browser/mouseEvent", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/workbench/services/environment/browser/environmentService", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/theme", "vs/base/common/platform", "vs/base/common/color", "vs/base/browser/dom", "vs/workbench/browser/parts/titlebar/menubarControl", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/workbench/services/layout/browser/layoutService", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/host/browser/host", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/browser/parts/titlebar/windowTitle", "vs/workbench/browser/parts/titlebar/commandCenterControl", "vs/workbench/services/hover/browser/hover", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/browser/toolbar", "vs/css!./media/titlebarpart"], function (require, exports, nls_1, part_1, browser_1, window_1, contextView_1, mouseEvent_1, configuration_1, lifecycle_1, environmentService_1, themeService_1, themables_1, theme_1, platform_1, color_1, dom_1, menubarControl_1, instantiation_1, event_1, storage_1, layoutService_1, menuEntryActionViewItem_1, actions_1, contextkey_1, host_1, codicons_1, iconRegistry_1, windowTitle_1, commandCenterControl_1, hover_1, actionCommonCategories_1, toolbar_1) {
    "use strict";
    var $P4b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$P4b = void 0;
    let $P4b = class $P4b extends part_1.Part {
        static { $P4b_1 = this; }
        static { this.a = 'window.commandCenter'; }
        get minimumHeight() {
            const value = this.isCommandCenterVisible || (platform_1.$o && (0, browser_1.$aO)()) ? 35 : 30;
            return value / (this.Bb ? (0, browser_1.$ZN)() : 1);
        }
        get maximumHeight() { return this.minimumHeight; }
        constructor(jb, kb, lb, mb, themeService, storageService, layoutService, nb, ob, hoverService) {
            super("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, { hasTitle: false }, themeService, storageService, layoutService);
            this.jb = jb;
            this.kb = kb;
            this.lb = lb;
            this.mb = mb;
            this.nb = nb;
            this.ob = ob;
            //#region IView
            this.minimumWidth = 0;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            //#endregion
            this.b = this.B(new event_1.$fd());
            this.onMenubarVisibilityChange = this.b.event;
            this.c = new event_1.$fd();
            this.onDidChangeCommandCenterVisibility = this.c.event;
            this.fb = this.B(new lifecycle_1.$jc());
            this.hb = false;
            this.ib = this.B(mb.createInstance(windowTitle_1.$N4b));
            this.gb = (0, window_1.$UD)(this.kb);
            this.eb = new class {
                constructor() {
                    this.a = 0;
                    this.showHover = hoverService.showHover.bind(hoverService);
                    this.placement = 'element';
                }
                get delay() {
                    return Date.now() - this.a < 200
                        ? 0 // show instantly when a hover was recently shown
                        : kb.getValue('workbench.hover.delay');
                }
                onDidHideHover() {
                    this.a = Date.now();
                }
            };
            this.pb();
        }
        updateProperties(properties) {
            this.ib.updateProperties(properties);
        }
        get isCommandCenterVisible() {
            return this.kb.getValue($P4b_1.a);
        }
        pb() {
            this.B(this.ob.onDidChangeFocus(focused => focused ? this.rb() : this.qb()));
            this.B(this.kb.onDidChangeConfiguration(e => this.sb(e)));
        }
        qb() {
            this.hb = true;
            this.updateStyles();
        }
        rb() {
            this.hb = false;
            this.updateStyles();
        }
        sb(event) {
            if (this.gb !== 'native' && (!platform_1.$j || platform_1.$o)) {
                if (event.affectsConfiguration('window.menuBarVisibility')) {
                    if (this.zb === 'compact') {
                        this.ub();
                    }
                    else {
                        this.vb();
                    }
                }
            }
            if (this.gb !== 'native' && this.cb && event.affectsConfiguration('workbench.layoutControl.enabled')) {
                this.cb.classList.toggle('show-layout-control', this.Ab);
                this.O.fire(undefined);
            }
            if (event.affectsConfiguration($P4b_1.a)) {
                this.wb();
                this.c.fire();
                this.O.fire(undefined);
            }
        }
        tb(visible) {
            if (platform_1.$o || platform_1.$i || platform_1.$k) {
                if (this.db) {
                    this.layout(this.db.width, this.db.height);
                }
                this.b.fire(visible);
            }
        }
        ub() {
            if (this.Y) {
                this.Y.dispose();
                this.Y = undefined;
            }
            if (this.bb) {
                this.bb.remove();
                this.bb = undefined;
            }
            this.tb(false);
        }
        vb() {
            // If the menubar is already installed, skip
            if (this.bb) {
                return;
            }
            this.Y = this.B(this.mb.createInstance(menubarControl_1.$3xb));
            this.bb = (0, dom_1.$0O)(this.U, (0, dom_1.$)('div.menubar'));
            this.bb.setAttribute('role', 'menubar');
            this.B(this.Y.onVisibilityChange(e => this.tb(e)));
            this.Y.create(this.bb);
        }
        wb() {
            this.fb.clear();
            if (!this.isCommandCenterVisible) {
                // Text Title
                this.S.innerText = this.ib.value;
                this.fb.add(this.ib.onDidChange(() => {
                    this.S.innerText = this.ib.value;
                }));
            }
            else {
                // Menu Title
                const commandCenter = this.mb.createInstance(commandCenterControl_1.$O4b, this.ib, this.eb);
                (0, dom_1.$_O)(this.S, commandCenter.element);
                this.fb.add(commandCenter);
            }
        }
        L(parent) {
            this.element = parent;
            this.P = (0, dom_1.$0O)(parent, (0, dom_1.$)('.titlebar-container'));
            this.U = (0, dom_1.$0O)(this.P, (0, dom_1.$)('.titlebar-left'));
            this.W = (0, dom_1.$0O)(this.P, (0, dom_1.$)('.titlebar-center'));
            this.X = (0, dom_1.$0O)(this.P, (0, dom_1.$)('.titlebar-right'));
            // App Icon (Native Windows/Linux and Web)
            if (!platform_1.$j && !platform_1.$o) {
                this.Z = (0, dom_1.$$O)(this.U, (0, dom_1.$)('a.window-appicon'));
                // Web-only home indicator and menu
                if (platform_1.$o) {
                    const homeIndicator = this.lb.options?.homeIndicator;
                    if (homeIndicator) {
                        const icon = (0, iconRegistry_1.$0u)().getIcon(homeIndicator.icon) ? { id: homeIndicator.icon } : codicons_1.$Pj.code;
                        this.Z.setAttribute('href', homeIndicator.href);
                        this.Z.classList.add(...themables_1.ThemeIcon.asClassNameArray(icon));
                        this.ab = document.createElement('div');
                        this.ab.classList.add('home-bar-icon-badge');
                        this.Z.appendChild(this.ab);
                    }
                }
            }
            // Draggable region that we can manipulate for #52522
            this.R = (0, dom_1.$$O)(this.P, (0, dom_1.$)('div.titlebar-drag-region'));
            // Menubar: install a custom menu bar depending on configuration
            // and when not in activity bar
            if (this.gb !== 'native'
                && (!platform_1.$j || platform_1.$o)
                && this.zb !== 'compact') {
                this.vb();
            }
            // Title
            this.S = (0, dom_1.$0O)(this.W, (0, dom_1.$)('div.window-title'));
            this.wb();
            if (this.gb !== 'native') {
                this.cb = (0, dom_1.$0O)(this.X, (0, dom_1.$)('div.layout-controls-container'));
                this.cb.classList.toggle('show-layout-control', this.Ab);
                this.B(this.mb.createInstance(toolbar_1.$M6, this.cb, actions_1.$Ru.LayoutControlMenu, {
                    contextMenu: actions_1.$Ru.TitleBarContext,
                    toolbarOptions: { primaryGroup: () => true },
                    actionViewItemProvider: action => {
                        return (0, menuEntryActionViewItem_1.$F3)(this.mb, action, { hoverDelegate: this.eb });
                    }
                }));
            }
            let primaryControlLocation = platform_1.$j ? 'left' : 'right';
            if (platform_1.$j && platform_1.$m) {
                // Check if the locale is RTL, macOS will move traffic lights in RTL locales
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/textInfo
                const localeInfo = new Intl.Locale(platform_1.$x);
                if (localeInfo?.textInfo?.direction === 'rtl') {
                    primaryControlLocation = 'right';
                }
            }
            this.Q = (0, dom_1.$0O)(primaryControlLocation === 'left' ? this.U : this.X, (0, dom_1.$)('div.window-controls-container.primary'));
            (0, dom_1.$0O)(primaryControlLocation === 'left' ? this.X : this.U, (0, dom_1.$)('div.window-controls-container.secondary'));
            // Context menu on title
            [dom_1.$3O.CONTEXT_MENU, dom_1.$3O.MOUSE_DOWN].forEach(event => {
                this.B((0, dom_1.$nO)(this.P, event, e => {
                    if (e.type === dom_1.$3O.CONTEXT_MENU || (e.target === this.S && e.metaKey)) {
                        dom_1.$5O.stop(e);
                        this.yb(e, e.target === this.S ? actions_1.$Ru.TitleBarTitleContext : actions_1.$Ru.TitleBarContext);
                    }
                }));
            });
            this.updateStyles();
            const that = this;
            (0, actions_1.$Xu)(class FocusTitleBar extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.action.focusTitleBar`,
                        title: { value: (0, nls_1.localize)(0, null), original: 'Focus Title Bar' },
                        category: actionCommonCategories_1.$Nl.View,
                        f1: true,
                    });
                }
                run() {
                    if (that.Y) {
                        that.Y.toggleFocus();
                    }
                    else {
                        that.element.querySelector('[tabindex]:not([tabindex="-1"])').focus();
                    }
                }
            });
            return this.element;
        }
        updateStyles() {
            super.updateStyles();
            // Part container
            if (this.element) {
                if (this.hb) {
                    this.element.classList.add('inactive');
                }
                else {
                    this.element.classList.remove('inactive');
                }
                const titleBackground = this.z(this.hb ? theme_1.$Tab : theme_1.$Sab, (color, theme) => {
                    // LCD Rendering Support: the title bar part is a defining its own GPU layer.
                    // To benefit from LCD font rendering, we must ensure that we always set an
                    // opaque background color. As such, we compute an opaque color given we know
                    // the background color is the workbench background.
                    return color.isOpaque() ? color : color.makeOpaque((0, theme_1.$$$)(theme));
                }) || '';
                this.element.style.backgroundColor = titleBackground;
                if (this.ab) {
                    this.ab.style.backgroundColor = titleBackground;
                }
                if (titleBackground && color_1.$Os.fromHex(titleBackground).isLighter()) {
                    this.element.classList.add('light');
                }
                else {
                    this.element.classList.remove('light');
                }
                const titleForeground = this.z(this.hb ? theme_1.$Rab : theme_1.$Qab);
                this.element.style.color = titleForeground || '';
                const titleBorder = this.z(theme_1.$Uab);
                this.element.style.borderBottom = titleBorder ? `1px solid ${titleBorder}` : '';
            }
        }
        yb(e, menuId) {
            // Find target anchor
            const event = new mouseEvent_1.$eO(e);
            // Show it
            this.jb.showContextMenu({
                getAnchor: () => event,
                menuId,
                contextKeyService: this.nb,
                domForShadowRoot: platform_1.$j && platform_1.$m ? event.target : undefined
            });
        }
        get zb() {
            return (0, window_1.$TD)(this.kb);
        }
        get Ab() {
            return this.kb.getValue('workbench.layoutControl.enabled');
        }
        get Bb() {
            // Prevent zooming behavior if any of the following conditions are met:
            // 1. Shrinking below the window control size (zoom < 1)
            // 2. No custom items are present in the title bar
            const zoomFactor = (0, browser_1.$ZN)();
            const noMenubar = this.zb === 'hidden' || (!platform_1.$o && platform_1.$j);
            const noCommandCenter = !this.isCommandCenterVisible;
            const noLayoutControls = !this.Ab;
            return zoomFactor < 1 || (noMenubar && noCommandCenter && noLayoutControls);
        }
        updateLayout(dimension) {
            this.db = dimension;
            if ((0, window_1.$UD)(this.kb) === 'custom') {
                const zoomFactor = (0, browser_1.$ZN)();
                this.element.style.setProperty('--zoom-factor', zoomFactor.toString());
                this.P.classList.toggle('counter-zoom', this.Bb);
                if (this.Y) {
                    const menubarDimension = new dom_1.$BO(0, dimension.height);
                    this.Y.layout(menubarDimension);
                }
            }
        }
        layout(width, height) {
            this.updateLayout(new dom_1.$BO(width, height));
            super.N(width, height);
        }
        toJSON() {
            return {
                type: "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */
            };
        }
    };
    exports.$P4b = $P4b;
    exports.$P4b = $P4b = $P4b_1 = __decorate([
        __param(0, contextView_1.$WZ),
        __param(1, configuration_1.$8h),
        __param(2, environmentService_1.$LT),
        __param(3, instantiation_1.$Ah),
        __param(4, themeService_1.$gv),
        __param(5, storage_1.$Vo),
        __param(6, layoutService_1.$Meb),
        __param(7, contextkey_1.$3i),
        __param(8, host_1.$VT),
        __param(9, hover_1.$zib)
    ], $P4b);
    class ToogleConfigAction extends actions_1.$Wu {
        constructor(a, title, order) {
            super({
                id: `toggle.${a}`,
                title,
                toggled: contextkey_1.$Ii.equals(`config.${a}`, true),
                menu: { id: actions_1.$Ru.TitleBarContext, order }
            });
            this.a = a;
        }
        run(accessor, ...args) {
            const configService = accessor.get(configuration_1.$8h);
            const value = configService.getValue(this.a);
            configService.updateValue(this.a, !value);
        }
    }
    (0, actions_1.$Xu)(class ToogleCommandCenter extends ToogleConfigAction {
        constructor() {
            super('window.commandCenter', (0, nls_1.localize)(1, null), 1);
        }
    });
    (0, actions_1.$Xu)(class ToogleLayoutControl extends ToogleConfigAction {
        constructor() {
            super('workbench.layoutControl.enabled', (0, nls_1.localize)(2, null), 2);
        }
    });
});
//# sourceMappingURL=titlebarPart.js.map