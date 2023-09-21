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
define(["require", "exports", "vs/nls", "vs/workbench/browser/part", "vs/base/browser/browser", "vs/platform/window/common/window", "vs/platform/contextview/browser/contextView", "vs/base/browser/mouseEvent", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/workbench/services/environment/browser/environmentService", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/theme", "vs/base/common/platform", "vs/base/common/color", "vs/base/browser/dom", "vs/workbench/browser/parts/titlebar/menubarControl", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/workbench/services/layout/browser/layoutService", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/host/browser/host", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/browser/parts/titlebar/windowTitle", "vs/workbench/browser/parts/titlebar/commandCenterControl", "vs/workbench/services/hover/browser/hover", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/browser/toolbar", "vs/css!./media/titlebarpart"], function (require, exports, nls_1, part_1, browser_1, window_1, contextView_1, mouseEvent_1, configuration_1, lifecycle_1, environmentService_1, themeService_1, themables_1, theme_1, platform_1, color_1, dom_1, menubarControl_1, instantiation_1, event_1, storage_1, layoutService_1, menuEntryActionViewItem_1, actions_1, contextkey_1, host_1, codicons_1, iconRegistry_1, windowTitle_1, commandCenterControl_1, hover_1, actionCommonCategories_1, toolbar_1) {
    "use strict";
    var TitlebarPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TitlebarPart = void 0;
    let TitlebarPart = class TitlebarPart extends part_1.Part {
        static { TitlebarPart_1 = this; }
        static { this.configCommandCenter = 'window.commandCenter'; }
        get minimumHeight() {
            const value = this.isCommandCenterVisible || (platform_1.isWeb && (0, browser_1.isWCOEnabled)()) ? 35 : 30;
            return value / (this.useCounterZoom ? (0, browser_1.getZoomFactor)() : 1);
        }
        get maximumHeight() { return this.minimumHeight; }
        constructor(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, hoverService) {
            super("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, { hasTitle: false }, themeService, storageService, layoutService);
            this.contextMenuService = contextMenuService;
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.hostService = hostService;
            //#region IView
            this.minimumWidth = 0;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            //#endregion
            this._onMenubarVisibilityChange = this._register(new event_1.Emitter());
            this.onMenubarVisibilityChange = this._onMenubarVisibilityChange.event;
            this._onDidChangeCommandCenterVisibility = new event_1.Emitter();
            this.onDidChangeCommandCenterVisibility = this._onDidChangeCommandCenterVisibility.event;
            this.titleDisposables = this._register(new lifecycle_1.DisposableStore());
            this.isInactive = false;
            this.windowTitle = this._register(instantiationService.createInstance(windowTitle_1.WindowTitle));
            this.titleBarStyle = (0, window_1.getTitleBarStyle)(this.configurationService);
            this.hoverDelegate = new class {
                constructor() {
                    this._lastHoverHideTime = 0;
                    this.showHover = hoverService.showHover.bind(hoverService);
                    this.placement = 'element';
                }
                get delay() {
                    return Date.now() - this._lastHoverHideTime < 200
                        ? 0 // show instantly when a hover was recently shown
                        : configurationService.getValue('workbench.hover.delay');
                }
                onDidHideHover() {
                    this._lastHoverHideTime = Date.now();
                }
            };
            this.registerListeners();
        }
        updateProperties(properties) {
            this.windowTitle.updateProperties(properties);
        }
        get isCommandCenterVisible() {
            return this.configurationService.getValue(TitlebarPart_1.configCommandCenter);
        }
        registerListeners() {
            this._register(this.hostService.onDidChangeFocus(focused => focused ? this.onFocus() : this.onBlur()));
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationChanged(e)));
        }
        onBlur() {
            this.isInactive = true;
            this.updateStyles();
        }
        onFocus() {
            this.isInactive = false;
            this.updateStyles();
        }
        onConfigurationChanged(event) {
            if (this.titleBarStyle !== 'native' && (!platform_1.isMacintosh || platform_1.isWeb)) {
                if (event.affectsConfiguration('window.menuBarVisibility')) {
                    if (this.currentMenubarVisibility === 'compact') {
                        this.uninstallMenubar();
                    }
                    else {
                        this.installMenubar();
                    }
                }
            }
            if (this.titleBarStyle !== 'native' && this.layoutControls && event.affectsConfiguration('workbench.layoutControl.enabled')) {
                this.layoutControls.classList.toggle('show-layout-control', this.layoutControlEnabled);
                this._onDidChange.fire(undefined);
            }
            if (event.affectsConfiguration(TitlebarPart_1.configCommandCenter)) {
                this.updateTitle();
                this._onDidChangeCommandCenterVisibility.fire();
                this._onDidChange.fire(undefined);
            }
        }
        onMenubarVisibilityChanged(visible) {
            if (platform_1.isWeb || platform_1.isWindows || platform_1.isLinux) {
                if (this.lastLayoutDimensions) {
                    this.layout(this.lastLayoutDimensions.width, this.lastLayoutDimensions.height);
                }
                this._onMenubarVisibilityChange.fire(visible);
            }
        }
        uninstallMenubar() {
            if (this.customMenubar) {
                this.customMenubar.dispose();
                this.customMenubar = undefined;
            }
            if (this.menubar) {
                this.menubar.remove();
                this.menubar = undefined;
            }
            this.onMenubarVisibilityChanged(false);
        }
        installMenubar() {
            // If the menubar is already installed, skip
            if (this.menubar) {
                return;
            }
            this.customMenubar = this._register(this.instantiationService.createInstance(menubarControl_1.CustomMenubarControl));
            this.menubar = (0, dom_1.append)(this.leftContent, (0, dom_1.$)('div.menubar'));
            this.menubar.setAttribute('role', 'menubar');
            this._register(this.customMenubar.onVisibilityChange(e => this.onMenubarVisibilityChanged(e)));
            this.customMenubar.create(this.menubar);
        }
        updateTitle() {
            this.titleDisposables.clear();
            if (!this.isCommandCenterVisible) {
                // Text Title
                this.title.innerText = this.windowTitle.value;
                this.titleDisposables.add(this.windowTitle.onDidChange(() => {
                    this.title.innerText = this.windowTitle.value;
                }));
            }
            else {
                // Menu Title
                const commandCenter = this.instantiationService.createInstance(commandCenterControl_1.CommandCenterControl, this.windowTitle, this.hoverDelegate);
                (0, dom_1.reset)(this.title, commandCenter.element);
                this.titleDisposables.add(commandCenter);
            }
        }
        createContentArea(parent) {
            this.element = parent;
            this.rootContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.titlebar-container'));
            this.leftContent = (0, dom_1.append)(this.rootContainer, (0, dom_1.$)('.titlebar-left'));
            this.centerContent = (0, dom_1.append)(this.rootContainer, (0, dom_1.$)('.titlebar-center'));
            this.rightContent = (0, dom_1.append)(this.rootContainer, (0, dom_1.$)('.titlebar-right'));
            // App Icon (Native Windows/Linux and Web)
            if (!platform_1.isMacintosh && !platform_1.isWeb) {
                this.appIcon = (0, dom_1.prepend)(this.leftContent, (0, dom_1.$)('a.window-appicon'));
                // Web-only home indicator and menu
                if (platform_1.isWeb) {
                    const homeIndicator = this.environmentService.options?.homeIndicator;
                    if (homeIndicator) {
                        const icon = (0, iconRegistry_1.getIconRegistry)().getIcon(homeIndicator.icon) ? { id: homeIndicator.icon } : codicons_1.Codicon.code;
                        this.appIcon.setAttribute('href', homeIndicator.href);
                        this.appIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(icon));
                        this.appIconBadge = document.createElement('div');
                        this.appIconBadge.classList.add('home-bar-icon-badge');
                        this.appIcon.appendChild(this.appIconBadge);
                    }
                }
            }
            // Draggable region that we can manipulate for #52522
            this.dragRegion = (0, dom_1.prepend)(this.rootContainer, (0, dom_1.$)('div.titlebar-drag-region'));
            // Menubar: install a custom menu bar depending on configuration
            // and when not in activity bar
            if (this.titleBarStyle !== 'native'
                && (!platform_1.isMacintosh || platform_1.isWeb)
                && this.currentMenubarVisibility !== 'compact') {
                this.installMenubar();
            }
            // Title
            this.title = (0, dom_1.append)(this.centerContent, (0, dom_1.$)('div.window-title'));
            this.updateTitle();
            if (this.titleBarStyle !== 'native') {
                this.layoutControls = (0, dom_1.append)(this.rightContent, (0, dom_1.$)('div.layout-controls-container'));
                this.layoutControls.classList.toggle('show-layout-control', this.layoutControlEnabled);
                this._register(this.instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, this.layoutControls, actions_1.MenuId.LayoutControlMenu, {
                    contextMenu: actions_1.MenuId.TitleBarContext,
                    toolbarOptions: { primaryGroup: () => true },
                    actionViewItemProvider: action => {
                        return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action, { hoverDelegate: this.hoverDelegate });
                    }
                }));
            }
            let primaryControlLocation = platform_1.isMacintosh ? 'left' : 'right';
            if (platform_1.isMacintosh && platform_1.isNative) {
                // Check if the locale is RTL, macOS will move traffic lights in RTL locales
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/textInfo
                const localeInfo = new Intl.Locale(platform_1.platformLocale);
                if (localeInfo?.textInfo?.direction === 'rtl') {
                    primaryControlLocation = 'right';
                }
            }
            this.primaryWindowControls = (0, dom_1.append)(primaryControlLocation === 'left' ? this.leftContent : this.rightContent, (0, dom_1.$)('div.window-controls-container.primary'));
            (0, dom_1.append)(primaryControlLocation === 'left' ? this.rightContent : this.leftContent, (0, dom_1.$)('div.window-controls-container.secondary'));
            // Context menu on title
            [dom_1.EventType.CONTEXT_MENU, dom_1.EventType.MOUSE_DOWN].forEach(event => {
                this._register((0, dom_1.addDisposableListener)(this.rootContainer, event, e => {
                    if (e.type === dom_1.EventType.CONTEXT_MENU || (e.target === this.title && e.metaKey)) {
                        dom_1.EventHelper.stop(e);
                        this.onContextMenu(e, e.target === this.title ? actions_1.MenuId.TitleBarTitleContext : actions_1.MenuId.TitleBarContext);
                    }
                }));
            });
            this.updateStyles();
            const that = this;
            (0, actions_1.registerAction2)(class FocusTitleBar extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.action.focusTitleBar`,
                        title: { value: (0, nls_1.localize)('focusTitleBar', "Focus Title Bar"), original: 'Focus Title Bar' },
                        category: actionCommonCategories_1.Categories.View,
                        f1: true,
                    });
                }
                run() {
                    if (that.customMenubar) {
                        that.customMenubar.toggleFocus();
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
                if (this.isInactive) {
                    this.element.classList.add('inactive');
                }
                else {
                    this.element.classList.remove('inactive');
                }
                const titleBackground = this.getColor(this.isInactive ? theme_1.TITLE_BAR_INACTIVE_BACKGROUND : theme_1.TITLE_BAR_ACTIVE_BACKGROUND, (color, theme) => {
                    // LCD Rendering Support: the title bar part is a defining its own GPU layer.
                    // To benefit from LCD font rendering, we must ensure that we always set an
                    // opaque background color. As such, we compute an opaque color given we know
                    // the background color is the workbench background.
                    return color.isOpaque() ? color : color.makeOpaque((0, theme_1.WORKBENCH_BACKGROUND)(theme));
                }) || '';
                this.element.style.backgroundColor = titleBackground;
                if (this.appIconBadge) {
                    this.appIconBadge.style.backgroundColor = titleBackground;
                }
                if (titleBackground && color_1.Color.fromHex(titleBackground).isLighter()) {
                    this.element.classList.add('light');
                }
                else {
                    this.element.classList.remove('light');
                }
                const titleForeground = this.getColor(this.isInactive ? theme_1.TITLE_BAR_INACTIVE_FOREGROUND : theme_1.TITLE_BAR_ACTIVE_FOREGROUND);
                this.element.style.color = titleForeground || '';
                const titleBorder = this.getColor(theme_1.TITLE_BAR_BORDER);
                this.element.style.borderBottom = titleBorder ? `1px solid ${titleBorder}` : '';
            }
        }
        onContextMenu(e, menuId) {
            // Find target anchor
            const event = new mouseEvent_1.StandardMouseEvent(e);
            // Show it
            this.contextMenuService.showContextMenu({
                getAnchor: () => event,
                menuId,
                contextKeyService: this.contextKeyService,
                domForShadowRoot: platform_1.isMacintosh && platform_1.isNative ? event.target : undefined
            });
        }
        get currentMenubarVisibility() {
            return (0, window_1.getMenuBarVisibility)(this.configurationService);
        }
        get layoutControlEnabled() {
            return this.configurationService.getValue('workbench.layoutControl.enabled');
        }
        get useCounterZoom() {
            // Prevent zooming behavior if any of the following conditions are met:
            // 1. Shrinking below the window control size (zoom < 1)
            // 2. No custom items are present in the title bar
            const zoomFactor = (0, browser_1.getZoomFactor)();
            const noMenubar = this.currentMenubarVisibility === 'hidden' || (!platform_1.isWeb && platform_1.isMacintosh);
            const noCommandCenter = !this.isCommandCenterVisible;
            const noLayoutControls = !this.layoutControlEnabled;
            return zoomFactor < 1 || (noMenubar && noCommandCenter && noLayoutControls);
        }
        updateLayout(dimension) {
            this.lastLayoutDimensions = dimension;
            if ((0, window_1.getTitleBarStyle)(this.configurationService) === 'custom') {
                const zoomFactor = (0, browser_1.getZoomFactor)();
                this.element.style.setProperty('--zoom-factor', zoomFactor.toString());
                this.rootContainer.classList.toggle('counter-zoom', this.useCounterZoom);
                if (this.customMenubar) {
                    const menubarDimension = new dom_1.Dimension(0, dimension.height);
                    this.customMenubar.layout(menubarDimension);
                }
            }
        }
        layout(width, height) {
            this.updateLayout(new dom_1.Dimension(width, height));
            super.layoutContents(width, height);
        }
        toJSON() {
            return {
                type: "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */
            };
        }
    };
    exports.TitlebarPart = TitlebarPart;
    exports.TitlebarPart = TitlebarPart = TitlebarPart_1 = __decorate([
        __param(0, contextView_1.IContextMenuService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, themeService_1.IThemeService),
        __param(5, storage_1.IStorageService),
        __param(6, layoutService_1.IWorkbenchLayoutService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, host_1.IHostService),
        __param(9, hover_1.IHoverService)
    ], TitlebarPart);
    class ToogleConfigAction extends actions_1.Action2 {
        constructor(section, title, order) {
            super({
                id: `toggle.${section}`,
                title,
                toggled: contextkey_1.ContextKeyExpr.equals(`config.${section}`, true),
                menu: { id: actions_1.MenuId.TitleBarContext, order }
            });
            this.section = section;
        }
        run(accessor, ...args) {
            const configService = accessor.get(configuration_1.IConfigurationService);
            const value = configService.getValue(this.section);
            configService.updateValue(this.section, !value);
        }
    }
    (0, actions_1.registerAction2)(class ToogleCommandCenter extends ToogleConfigAction {
        constructor() {
            super('window.commandCenter', (0, nls_1.localize)('toggle.commandCenter', 'Command Center'), 1);
        }
    });
    (0, actions_1.registerAction2)(class ToogleLayoutControl extends ToogleConfigAction {
        constructor() {
            super('workbench.layoutControl.enabled', (0, nls_1.localize)('toggle.layout', 'Layout Controls'), 2);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGViYXJQYXJ0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvdGl0bGViYXIvdGl0bGViYXJQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFxQ3pGLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQWEsU0FBUSxXQUFJOztpQkFFYix3QkFBbUIsR0FBRyxzQkFBc0IsQUFBekIsQ0FBMEI7UUFRckUsSUFBSSxhQUFhO1lBQ2hCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLGdCQUFLLElBQUksSUFBQSxzQkFBWSxHQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDakYsT0FBTyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFBLHVCQUFhLEdBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVELElBQUksYUFBYSxLQUFhLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFtQzFELFlBQ3NCLGtCQUF3RCxFQUN0RCxvQkFBOEQsRUFDaEQsa0JBQTBFLEVBQ3hGLG9CQUE4RCxFQUN0RSxZQUEyQixFQUN6QixjQUErQixFQUN2QixhQUFzQyxFQUMzQyxpQkFBc0QsRUFDNUQsV0FBMEMsRUFDekMsWUFBMkI7WUFFMUMsS0FBSyx1REFBc0IsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQVh2RCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ25DLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDN0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFx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