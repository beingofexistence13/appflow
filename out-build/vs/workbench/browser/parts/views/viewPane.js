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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/views/viewPane", "vs/base/common/event", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/registry/common/platform", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/base/browser/ui/splitview/paneview", "vs/platform/configuration/common/configuration", "vs/workbench/common/views", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/common/linkedText", "vs/platform/opener/common/opener", "vs/base/browser/ui/button/button", "vs/platform/opener/browser/link", "vs/base/browser/ui/progressbar/progressbar", "vs/workbench/services/progress/browser/progressIndicator", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/uri", "vs/platform/theme/common/iconRegistry", "vs/base/common/codicons", "vs/workbench/browser/actions", "vs/platform/actions/browser/toolbar", "vs/workbench/browser/parts/views/viewFilter", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/instantiation/common/serviceCollection", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/paneviewlet"], function (require, exports, nls, event_1, colorRegistry_1, theme_1, dom_1, lifecycle_1, actions_1, actionbar_1, platform_1, keybinding_1, contextView_1, telemetry_1, themeService_1, themables_1, paneview_1, configuration_1, views_1, contextkey_1, types_1, instantiation_1, actions_2, menuEntryActionViewItem_1, linkedText_1, opener_1, button_1, link_1, progressbar_1, progressIndicator_1, scrollableElement_1, uri_1, iconRegistry_1, codicons_1, actions_3, toolbar_1, viewFilter_1, actionViewItems_1, serviceCollection_1, defaultStyles_1) {
    "use strict";
    var $Ieb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Keb = exports.$Jeb = exports.$Ieb = exports.$Heb = exports.ViewPaneShowActions = void 0;
    var ViewPaneShowActions;
    (function (ViewPaneShowActions) {
        /** Show the actions when the view is hovered. This is the default behavior. */
        ViewPaneShowActions[ViewPaneShowActions["Default"] = 0] = "Default";
        /** Always shows the actions when the view is expanded */
        ViewPaneShowActions[ViewPaneShowActions["WhenExpanded"] = 1] = "WhenExpanded";
        /** Always shows the actions */
        ViewPaneShowActions[ViewPaneShowActions["Always"] = 2] = "Always";
    })(ViewPaneShowActions || (exports.ViewPaneShowActions = ViewPaneShowActions = {}));
    exports.$Heb = new actions_1.$gi('viewpane.action.filter');
    const viewPaneContainerExpandedIcon = (0, iconRegistry_1.$9u)('view-pane-container-expanded', codicons_1.$Pj.chevronDown, nls.localize(0, null));
    const viewPaneContainerCollapsedIcon = (0, iconRegistry_1.$9u)('view-pane-container-collapsed', codicons_1.$Pj.chevronRight, nls.localize(1, null));
    const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
    let ViewWelcomeController = class ViewWelcomeController {
        get contents() {
            const visibleItems = this.c.filter(v => v.visible);
            if (visibleItems.length === 0 && this.b) {
                return [this.b.descriptor];
            }
            return visibleItems.map(v => v.descriptor);
        }
        constructor(f, g) {
            this.f = f;
            this.g = g;
            this.a = new event_1.$fd();
            this.onDidChange = this.a.event;
            this.c = [];
            this.d = new lifecycle_1.$jc();
            g.onDidChangeContext(this.i, this, this.d);
            this.d.add(event_1.Event.filter(viewsRegistry.onDidChangeViewWelcomeContent, id => id === this.f)(this.h, this, this.d));
            this.h();
        }
        h() {
            const descriptors = viewsRegistry.getViewWelcomeContent(this.f);
            this.c = [];
            for (const descriptor of descriptors) {
                if (descriptor.when === 'default') {
                    this.b = { descriptor, visible: true };
                }
                else {
                    const visible = descriptor.when ? this.g.contextMatchesRules(descriptor.when) : true;
                    this.c.push({ descriptor, visible });
                }
            }
            this.a.fire();
        }
        i() {
            let didChange = false;
            for (const item of this.c) {
                if (!item.descriptor.when || item.descriptor.when === 'default') {
                    continue;
                }
                const visible = this.g.contextMatchesRules(item.descriptor.when);
                if (item.visible === visible) {
                    continue;
                }
                item.visible = visible;
                didChange = true;
            }
            if (didChange) {
                this.a.fire();
            }
        }
        dispose() {
            this.d.dispose();
        }
    };
    ViewWelcomeController = __decorate([
        __param(1, contextkey_1.$3i)
    ], ViewWelcomeController);
    let $Ieb = class $Ieb extends paneview_1.$1R {
        static { $Ieb_1 = this; }
        static { this.X = 'workbench.view.alwaysShowHeaderActions'; }
        get title() {
            return this.fb;
        }
        get titleDescription() {
            return this.gb;
        }
        constructor(options, wb, xb, yb, zb, Ab, Bb, Cb, Db, Eb) {
            super({ ...options, ...{ orientation: Ab.getViewLocationById(options.id) === 1 /* ViewContainerLocation.Panel */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */ } });
            this.wb = wb;
            this.xb = xb;
            this.yb = yb;
            this.zb = zb;
            this.Ab = Ab;
            this.Bb = Bb;
            this.Cb = Cb;
            this.Db = Db;
            this.Eb = Eb;
            this.Y = this.B(new event_1.$fd());
            this.onDidFocus = this.Y.event;
            this.Z = this.B(new event_1.$fd());
            this.onDidBlur = this.Z.event;
            this.bb = this.B(new event_1.$fd());
            this.onDidChangeBodyVisibility = this.bb.event;
            this.cb = this.B(new event_1.$fd());
            this.onDidChangeTitleArea = this.cb.event;
            this.db = this.B(new event_1.$fd());
            this.onDidChangeViewWelcomeState = this.db.event;
            this.eb = false;
            this.tb = lifecycle_1.$kc.None;
            this.id = options.id;
            this.fb = options.title;
            this.gb = options.titleDescription;
            this.kb = options.showActions ?? ViewPaneShowActions.Default;
            this.vb = this.B(zb.createScoped(this.element));
            this.vb.createKey('view', this.id);
            const viewLocationKey = this.vb.createKey('viewLocation', (0, views_1.$0E)(Ab.getViewLocationById(this.id)));
            this.B(event_1.Event.filter(Ab.onDidChangeLocation, e => e.views.some(view => view.id === this.id))(() => viewLocationKey.set((0, views_1.$0E)(Ab.getViewLocationById(this.id)))));
            this.menuActions = this.B(this.Bb.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.vb])).createInstance(actions_3.$qeb, options.titleMenuId ?? actions_2.$Ru.ViewTitle, actions_2.$Ru.ViewTitleContext, { shouldForwardArgs: !options.donotForwardArgs }));
            this.B(this.menuActions.onDidChange(() => this.Ub()));
            this.ub = this.B(new ViewWelcomeController(this.id, zb));
        }
        get headerVisible() {
            return super.headerVisible;
        }
        set headerVisible(visible) {
            super.headerVisible = visible;
            this.element.classList.toggle('merged-header', !visible);
        }
        setVisible(visible) {
            if (this.eb !== visible) {
                this.eb = visible;
                if (this.isExpanded()) {
                    this.bb.fire(visible);
                }
            }
        }
        isVisible() {
            return this.eb;
        }
        isBodyVisible() {
            return this.eb && this.isExpanded();
        }
        setExpanded(expanded) {
            const changed = super.setExpanded(expanded);
            if (changed) {
                this.bb.fire(expanded);
            }
            if (this.pb) {
                this.pb.classList.remove(...themables_1.ThemeIcon.asClassNameArray(this.Gb(!expanded)));
                this.pb.classList.add(...themables_1.ThemeIcon.asClassNameArray(this.Gb(expanded)));
            }
            return changed;
        }
        render() {
            super.render();
            const focusTracker = (0, dom_1.$8O)(this.element);
            this.B(focusTracker);
            this.B(focusTracker.onDidFocus(() => this.Y.fire()));
            this.B(focusTracker.onDidBlur(() => this.Z.fire()));
        }
        S(container) {
            this.lb = container;
            this.pb = (0, dom_1.$0O)(container, (0, dom_1.$)(themables_1.ThemeIcon.asCSSSelector(this.Gb(this.isExpanded()))));
            this.Ib(container, this.title);
            const actions = (0, dom_1.$0O)(container, (0, dom_1.$)('.actions'));
            actions.classList.toggle('show-always', this.kb === ViewPaneShowActions.Always);
            actions.classList.toggle('show-expanded', this.kb === ViewPaneShowActions.WhenExpanded);
            this.jb = this.Bb.createInstance(toolbar_1.$L6, actions, {
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                actionViewItemProvider: action => this.getActionViewItem(action),
                ariaLabel: nls.localize(2, null, this.title),
                getKeyBinding: action => this.wb.lookupKeybinding(action.id),
                renderDropdownAsChildElement: true,
                actionRunner: this.getActionRunner(),
                resetMenu: this.menuActions.menuId
            });
            this.B(this.jb);
            this.Sb();
            this.B((0, dom_1.$nO)(actions, dom_1.$3O.CLICK, e => e.preventDefault()));
            const viewContainerModel = this.Ab.getViewContainerByViewId(this.id);
            if (viewContainerModel) {
                this.B(this.Ab.getViewContainerModel(viewContainerModel).onDidChangeContainerInfo(({ title }) => this.Jb(this.title)));
            }
            else {
                console.error(`View container model not found for view ${this.id}`);
            }
            const onDidRelevantConfigurationChange = event_1.Event.filter(this.yb.onDidChangeConfiguration, e => e.affectsConfiguration($Ieb_1.X));
            this.B(onDidRelevantConfigurationChange(this.Tb, this));
            this.Tb();
        }
        Gb(expanded) {
            return expanded ? viewPaneContainerExpandedIcon : viewPaneContainerCollapsedIcon;
        }
        style(styles) {
            super.style(styles);
            const icon = this.Hb();
            if (this.ob) {
                const fgColor = (0, dom_1.$pP)(styles.headerForeground, (0, colorRegistry_1.$pv)(colorRegistry_1.$uv));
                if (uri_1.URI.isUri(icon)) {
                    // Apply background color to activity bar item provided with iconUrls
                    this.ob.style.backgroundColor = fgColor;
                    this.ob.style.color = '';
                }
                else {
                    // Apply foreground color to activity bar items provided with codicons
                    this.ob.style.color = fgColor;
                    this.ob.style.backgroundColor = '';
                }
            }
        }
        Hb() {
            return this.Ab.getViewDescriptorById(this.id)?.containerIcon || views_1.$8E;
        }
        Ib(container, title) {
            this.ob = (0, dom_1.$0O)(container, (0, dom_1.$)('.icon', undefined));
            const icon = this.Hb();
            let cssClass = undefined;
            if (uri_1.URI.isUri(icon)) {
                cssClass = `view-${this.id.replace(/[\.\:]/g, '-')}`;
                const iconClass = `.pane-header .icon.${cssClass}`;
                (0, dom_1.$ZO)(iconClass, `
				mask: ${(0, dom_1.$nP)(icon)} no-repeat 50% 50%;
				mask-size: 24px;
				-webkit-mask: ${(0, dom_1.$nP)(icon)} no-repeat 50% 50%;
				-webkit-mask-size: 16px;
			`);
            }
            else if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                cssClass = themables_1.ThemeIcon.asClassName(icon);
            }
            if (cssClass) {
                this.ob.classList.add(...cssClass.split(' '));
            }
            const calculatedTitle = this.Mb(title);
            this.mb = (0, dom_1.$0O)(container, (0, dom_1.$)('h3.title', { title: calculatedTitle }, calculatedTitle));
            if (this.gb) {
                this.Kb(this.gb);
            }
            this.ob.title = calculatedTitle;
            this.ob.setAttribute('aria-label', calculatedTitle);
        }
        Jb(title) {
            const calculatedTitle = this.Mb(title);
            if (this.mb) {
                this.mb.textContent = calculatedTitle;
                this.mb.setAttribute('title', calculatedTitle);
            }
            if (this.ob) {
                this.ob.title = calculatedTitle;
                this.ob.setAttribute('aria-label', calculatedTitle);
            }
            this.fb = title;
            this.cb.fire();
        }
        Kb(description) {
            if (this.nb) {
                this.nb.textContent = description ?? '';
                this.nb.setAttribute('title', description ?? '');
            }
            else if (description && this.mb) {
                this.nb = (0, dom_1.$9O)(this.mb, (0, dom_1.$)('span.description', { title: description }, description));
            }
        }
        Lb(description) {
            this.Kb(description);
            this.gb = description;
            this.cb.fire();
        }
        Mb(title) {
            const viewContainer = this.Ab.getViewContainerByViewId(this.id);
            const model = this.Ab.getViewContainerModel(viewContainer);
            const viewDescriptor = this.Ab.getViewDescriptorById(this.id);
            const isDefault = this.Ab.getDefaultContainerById(this.id) === viewContainer;
            if (!isDefault && viewDescriptor?.containerTitle && model.title !== viewDescriptor.containerTitle) {
                return `${viewDescriptor.containerTitle}: ${title}`;
            }
            return title;
        }
        U(container) {
            this.qb = container;
            const viewWelcomeContainer = (0, dom_1.$0O)(container, (0, dom_1.$)('.welcome-view'));
            this.rb = (0, dom_1.$)('.welcome-view-content', { tabIndex: 0 });
            this.Nb = this.B(new scrollableElement_1.$UP(this.rb, {
                alwaysConsumeMouseWheel: true,
                horizontal: 2 /* ScrollbarVisibility.Hidden */,
                vertical: 3 /* ScrollbarVisibility.Visible */,
            }));
            (0, dom_1.$0O)(viewWelcomeContainer, this.Nb.getDomNode());
            const onViewWelcomeChange = event_1.Event.any(this.ub.onDidChange, this.onDidChangeViewWelcomeState);
            this.B(onViewWelcomeChange(this.Vb, this));
            this.Vb();
        }
        W(height, width) {
            this.rb.style.height = `${height}px`;
            this.rb.style.width = `${width}px`;
            this.rb.classList.toggle('wide', width > 640);
            this.Nb.scanDomNode();
        }
        onDidScrollRoot() {
            // noop
        }
        getProgressIndicator() {
            if (this.hb === undefined) {
                // Progress bar
                this.hb = this.B(new progressbar_1.$YR(this.element, defaultStyles_1.$k2));
                this.hb.hide();
            }
            if (this.ib === undefined) {
                const that = this;
                this.ib = new progressIndicator_1.$Deb((0, types_1.$uf)(this.hb), new class extends progressIndicator_1.$Eeb {
                    constructor() {
                        super(that.id, that.isBodyVisible());
                        this.B(that.onDidChangeBodyVisibility(isVisible => isVisible ? this.f(that.id) : this.g(that.id)));
                    }
                }());
            }
            return this.ib;
        }
        Qb() {
            return this.Ab.getViewContainerByViewId(this.id).id;
        }
        Rb() {
            switch (this.Ab.getViewLocationById(this.id)) {
                case 1 /* ViewContainerLocation.Panel */:
                    return theme_1.$L_;
                case 0 /* ViewContainerLocation.Sidebar */:
                case 2 /* ViewContainerLocation.AuxiliaryBar */:
                    return theme_1.$Iab;
            }
            return theme_1.$Iab;
        }
        focus() {
            if (this.shouldShowWelcome()) {
                this.rb.focus();
            }
            else if (this.element) {
                this.element.focus();
                this.Y.fire();
            }
        }
        Sb() {
            if (this.jb) {
                const primaryActions = [...this.menuActions.getPrimaryActions()];
                if (this.shouldShowFilterInHeader()) {
                    primaryActions.unshift(exports.$Heb);
                }
                this.jb.setActions((0, actionbar_1.$2P)(primaryActions), (0, actionbar_1.$2P)(this.menuActions.getSecondaryActions()));
                this.jb.context = this.getActionsContext();
            }
        }
        Tb() {
            if (!this.lb) {
                return;
            }
            const shouldAlwaysShowActions = this.yb.getValue('workbench.view.alwaysShowHeaderActions');
            this.lb.classList.toggle('actions-always-visible', shouldAlwaysShowActions);
        }
        Ub() {
            this.Sb();
            this.cb.fire();
        }
        getActionViewItem(action, options) {
            if (action.id === exports.$Heb.id) {
                const that = this;
                return new class extends actionViewItems_1.$MQ {
                    constructor() { super(null, action); }
                    setFocusable() { }
                    get trapsArrowNavigation() { return true; }
                    render(container) {
                        container.classList.add('viewpane-filter-container');
                        (0, dom_1.$0O)(container, that.getFilterWidget().element);
                    }
                };
            }
            return (0, menuEntryActionViewItem_1.$F3)(this.Bb, action, { ...options, ...{ menuAsChild: action instanceof actions_2.$Uu } });
        }
        getActionsContext() {
            return undefined;
        }
        getActionRunner() {
            return undefined;
        }
        getOptimalWidth() {
            return 0;
        }
        saveState() {
            // Subclasses to implement for saving state
        }
        Vb() {
            this.tb.dispose();
            if (!this.shouldShowWelcome()) {
                this.qb.classList.remove('welcome');
                this.rb.innerText = '';
                this.Nb.scanDomNode();
                return;
            }
            const contents = this.ub.contents;
            if (contents.length === 0) {
                this.qb.classList.remove('welcome');
                this.rb.innerText = '';
                this.Nb.scanDomNode();
                return;
            }
            const disposables = new lifecycle_1.$jc();
            this.qb.classList.add('welcome');
            this.rb.innerText = '';
            for (const { content, precondition } of contents) {
                const lines = content.split('\n');
                for (let line of lines) {
                    line = line.trim();
                    if (!line) {
                        continue;
                    }
                    const linkedText = (0, linkedText_1.$IS)(line);
                    if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== 'string') {
                        const node = linkedText.nodes[0];
                        const buttonContainer = (0, dom_1.$0O)(this.rb, (0, dom_1.$)('.button-container'));
                        const button = new button_1.$7Q(buttonContainer, { title: node.title, supportIcons: true, ...defaultStyles_1.$i2 });
                        button.label = node.label;
                        button.onDidClick(_ => {
                            this.Eb.publicLog2('views.welcomeAction', { viewId: this.id, uri: node.href });
                            this.Cb.open(node.href, { allowCommands: true });
                        }, null, disposables);
                        disposables.add(button);
                        if (precondition) {
                            const updateEnablement = () => button.enabled = this.zb.contextMatchesRules(precondition);
                            updateEnablement();
                            const keys = new Set();
                            precondition.keys().forEach(key => keys.add(key));
                            const onDidChangeContext = event_1.Event.filter(this.zb.onDidChangeContext, e => e.affectsSome(keys));
                            onDidChangeContext(updateEnablement, null, disposables);
                        }
                    }
                    else {
                        const p = (0, dom_1.$0O)(this.rb, (0, dom_1.$)('p'));
                        for (const node of linkedText.nodes) {
                            if (typeof node === 'string') {
                                (0, dom_1.$0O)(p, document.createTextNode(node));
                            }
                            else {
                                const link = disposables.add(this.Bb.createInstance(link_1.$40, p, node, {}));
                                if (precondition && node.href.startsWith('command:')) {
                                    const updateEnablement = () => link.enabled = this.zb.contextMatchesRules(precondition);
                                    updateEnablement();
                                    const keys = new Set();
                                    precondition.keys().forEach(key => keys.add(key));
                                    const onDidChangeContext = event_1.Event.filter(this.zb.onDidChangeContext, e => e.affectsSome(keys));
                                    onDidChangeContext(updateEnablement, null, disposables);
                                }
                            }
                        }
                    }
                }
            }
            this.Nb.scanDomNode();
            this.tb = disposables;
        }
        shouldShowWelcome() {
            return false;
        }
        getFilterWidget() {
            return undefined;
        }
        shouldShowFilterInHeader() {
            return false;
        }
    };
    exports.$Ieb = $Ieb;
    exports.$Ieb = $Ieb = $Ieb_1 = __decorate([
        __param(1, keybinding_1.$2D),
        __param(2, contextView_1.$WZ),
        __param(3, configuration_1.$8h),
        __param(4, contextkey_1.$3i),
        __param(5, views_1.$_E),
        __param(6, instantiation_1.$Ah),
        __param(7, opener_1.$NT),
        __param(8, themeService_1.$gv),
        __param(9, telemetry_1.$9k)
    ], $Ieb);
    let $Jeb = class $Jeb extends $Ieb {
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.filterWidget = this.B(instantiationService.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.vb])).createInstance(viewFilter_1.$Geb, options.filterOptions));
        }
        getFilterWidget() {
            return this.filterWidget;
        }
        U(container) {
            super.U(container);
            this.b = (0, dom_1.$0O)(container, (0, dom_1.$)('.viewpane-filter-container'));
        }
        W(height, width) {
            super.W(height, width);
            this.a = new dom_1.$BO(width, height);
            const wasFilterShownInHeader = !this.b?.hasChildNodes();
            const shouldShowFilterInHeader = this.shouldShowFilterInHeader();
            if (wasFilterShownInHeader !== shouldShowFilterInHeader) {
                if (shouldShowFilterInHeader) {
                    (0, dom_1.$_O)(this.b);
                }
                this.Ub();
                if (!shouldShowFilterInHeader) {
                    (0, dom_1.$0O)(this.b, this.filterWidget.element);
                }
            }
            if (!shouldShowFilterInHeader) {
                height = height - 44;
            }
            this.filterWidget.layout(width);
            this.n(height, width);
        }
        shouldShowFilterInHeader() {
            return !(this.a && this.a.width < 600 && this.a.height > 100);
        }
    };
    exports.$Jeb = $Jeb;
    exports.$Jeb = $Jeb = __decorate([
        __param(1, keybinding_1.$2D),
        __param(2, contextView_1.$WZ),
        __param(3, configuration_1.$8h),
        __param(4, contextkey_1.$3i),
        __param(5, views_1.$_E),
        __param(6, instantiation_1.$Ah),
        __param(7, opener_1.$NT),
        __param(8, themeService_1.$gv),
        __param(9, telemetry_1.$9k)
    ], $Jeb);
    class $Keb extends actions_2.$Wu {
        constructor(desc) {
            super(desc);
            this.desc = desc;
        }
        run(accessor, ...args) {
            const view = accessor.get(views_1.$$E).getActiveViewWithId(this.desc.viewId);
            if (view) {
                return this.runInView(accessor, view, ...args);
            }
        }
    }
    exports.$Keb = $Keb;
});
//# sourceMappingURL=viewPane.js.map