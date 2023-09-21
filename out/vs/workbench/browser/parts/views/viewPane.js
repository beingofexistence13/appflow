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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/registry/common/platform", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/base/browser/ui/splitview/paneview", "vs/platform/configuration/common/configuration", "vs/workbench/common/views", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/common/linkedText", "vs/platform/opener/common/opener", "vs/base/browser/ui/button/button", "vs/platform/opener/browser/link", "vs/base/browser/ui/progressbar/progressbar", "vs/workbench/services/progress/browser/progressIndicator", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/uri", "vs/platform/theme/common/iconRegistry", "vs/base/common/codicons", "vs/workbench/browser/actions", "vs/platform/actions/browser/toolbar", "vs/workbench/browser/parts/views/viewFilter", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/instantiation/common/serviceCollection", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/paneviewlet"], function (require, exports, nls, event_1, colorRegistry_1, theme_1, dom_1, lifecycle_1, actions_1, actionbar_1, platform_1, keybinding_1, contextView_1, telemetry_1, themeService_1, themables_1, paneview_1, configuration_1, views_1, contextkey_1, types_1, instantiation_1, actions_2, menuEntryActionViewItem_1, linkedText_1, opener_1, button_1, link_1, progressbar_1, progressIndicator_1, scrollableElement_1, uri_1, iconRegistry_1, codicons_1, actions_3, toolbar_1, viewFilter_1, actionViewItems_1, serviceCollection_1, defaultStyles_1) {
    "use strict";
    var ViewPane_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewAction = exports.FilterViewPane = exports.ViewPane = exports.VIEWPANE_FILTER_ACTION = exports.ViewPaneShowActions = void 0;
    var ViewPaneShowActions;
    (function (ViewPaneShowActions) {
        /** Show the actions when the view is hovered. This is the default behavior. */
        ViewPaneShowActions[ViewPaneShowActions["Default"] = 0] = "Default";
        /** Always shows the actions when the view is expanded */
        ViewPaneShowActions[ViewPaneShowActions["WhenExpanded"] = 1] = "WhenExpanded";
        /** Always shows the actions */
        ViewPaneShowActions[ViewPaneShowActions["Always"] = 2] = "Always";
    })(ViewPaneShowActions || (exports.ViewPaneShowActions = ViewPaneShowActions = {}));
    exports.VIEWPANE_FILTER_ACTION = new actions_1.Action('viewpane.action.filter');
    const viewPaneContainerExpandedIcon = (0, iconRegistry_1.registerIcon)('view-pane-container-expanded', codicons_1.Codicon.chevronDown, nls.localize('viewPaneContainerExpandedIcon', 'Icon for an expanded view pane container.'));
    const viewPaneContainerCollapsedIcon = (0, iconRegistry_1.registerIcon)('view-pane-container-collapsed', codicons_1.Codicon.chevronRight, nls.localize('viewPaneContainerCollapsedIcon', 'Icon for a collapsed view pane container.'));
    const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
    let ViewWelcomeController = class ViewWelcomeController {
        get contents() {
            const visibleItems = this.items.filter(v => v.visible);
            if (visibleItems.length === 0 && this.defaultItem) {
                return [this.defaultItem.descriptor];
            }
            return visibleItems.map(v => v.descriptor);
        }
        constructor(id, contextKeyService) {
            this.id = id;
            this.contextKeyService = contextKeyService;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this.items = [];
            this.disposables = new lifecycle_1.DisposableStore();
            contextKeyService.onDidChangeContext(this.onDidChangeContext, this, this.disposables);
            this.disposables.add(event_1.Event.filter(viewsRegistry.onDidChangeViewWelcomeContent, id => id === this.id)(this.onDidChangeViewWelcomeContent, this, this.disposables));
            this.onDidChangeViewWelcomeContent();
        }
        onDidChangeViewWelcomeContent() {
            const descriptors = viewsRegistry.getViewWelcomeContent(this.id);
            this.items = [];
            for (const descriptor of descriptors) {
                if (descriptor.when === 'default') {
                    this.defaultItem = { descriptor, visible: true };
                }
                else {
                    const visible = descriptor.when ? this.contextKeyService.contextMatchesRules(descriptor.when) : true;
                    this.items.push({ descriptor, visible });
                }
            }
            this._onDidChange.fire();
        }
        onDidChangeContext() {
            let didChange = false;
            for (const item of this.items) {
                if (!item.descriptor.when || item.descriptor.when === 'default') {
                    continue;
                }
                const visible = this.contextKeyService.contextMatchesRules(item.descriptor.when);
                if (item.visible === visible) {
                    continue;
                }
                item.visible = visible;
                didChange = true;
            }
            if (didChange) {
                this._onDidChange.fire();
            }
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    ViewWelcomeController = __decorate([
        __param(1, contextkey_1.IContextKeyService)
    ], ViewWelcomeController);
    let ViewPane = class ViewPane extends paneview_1.Pane {
        static { ViewPane_1 = this; }
        static { this.AlwaysShowActionsConfig = 'workbench.view.alwaysShowHeaderActions'; }
        get title() {
            return this._title;
        }
        get titleDescription() {
            return this._titleDescription;
        }
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService) {
            super({ ...options, ...{ orientation: viewDescriptorService.getViewLocationById(options.id) === 1 /* ViewContainerLocation.Panel */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */ } });
            this.keybindingService = keybindingService;
            this.contextMenuService = contextMenuService;
            this.configurationService = configurationService;
            this.contextKeyService = contextKeyService;
            this.viewDescriptorService = viewDescriptorService;
            this.instantiationService = instantiationService;
            this.openerService = openerService;
            this.themeService = themeService;
            this.telemetryService = telemetryService;
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event_1.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this._onDidChangeBodyVisibility = this._register(new event_1.Emitter());
            this.onDidChangeBodyVisibility = this._onDidChangeBodyVisibility.event;
            this._onDidChangeTitleArea = this._register(new event_1.Emitter());
            this.onDidChangeTitleArea = this._onDidChangeTitleArea.event;
            this._onDidChangeViewWelcomeState = this._register(new event_1.Emitter());
            this.onDidChangeViewWelcomeState = this._onDidChangeViewWelcomeState.event;
            this._isVisible = false;
            this.viewWelcomeDisposable = lifecycle_1.Disposable.None;
            this.id = options.id;
            this._title = options.title;
            this._titleDescription = options.titleDescription;
            this.showActions = options.showActions ?? ViewPaneShowActions.Default;
            this.scopedContextKeyService = this._register(contextKeyService.createScoped(this.element));
            this.scopedContextKeyService.createKey('view', this.id);
            const viewLocationKey = this.scopedContextKeyService.createKey('viewLocation', (0, views_1.ViewContainerLocationToString)(viewDescriptorService.getViewLocationById(this.id)));
            this._register(event_1.Event.filter(viewDescriptorService.onDidChangeLocation, e => e.views.some(view => view.id === this.id))(() => viewLocationKey.set((0, views_1.ViewContainerLocationToString)(viewDescriptorService.getViewLocationById(this.id)))));
            this.menuActions = this._register(this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService])).createInstance(actions_3.CompositeMenuActions, options.titleMenuId ?? actions_2.MenuId.ViewTitle, actions_2.MenuId.ViewTitleContext, { shouldForwardArgs: !options.donotForwardArgs }));
            this._register(this.menuActions.onDidChange(() => this.updateActions()));
            this.viewWelcomeController = this._register(new ViewWelcomeController(this.id, contextKeyService));
        }
        get headerVisible() {
            return super.headerVisible;
        }
        set headerVisible(visible) {
            super.headerVisible = visible;
            this.element.classList.toggle('merged-header', !visible);
        }
        setVisible(visible) {
            if (this._isVisible !== visible) {
                this._isVisible = visible;
                if (this.isExpanded()) {
                    this._onDidChangeBodyVisibility.fire(visible);
                }
            }
        }
        isVisible() {
            return this._isVisible;
        }
        isBodyVisible() {
            return this._isVisible && this.isExpanded();
        }
        setExpanded(expanded) {
            const changed = super.setExpanded(expanded);
            if (changed) {
                this._onDidChangeBodyVisibility.fire(expanded);
            }
            if (this.twistiesContainer) {
                this.twistiesContainer.classList.remove(...themables_1.ThemeIcon.asClassNameArray(this.getTwistyIcon(!expanded)));
                this.twistiesContainer.classList.add(...themables_1.ThemeIcon.asClassNameArray(this.getTwistyIcon(expanded)));
            }
            return changed;
        }
        render() {
            super.render();
            const focusTracker = (0, dom_1.trackFocus)(this.element);
            this._register(focusTracker);
            this._register(focusTracker.onDidFocus(() => this._onDidFocus.fire()));
            this._register(focusTracker.onDidBlur(() => this._onDidBlur.fire()));
        }
        renderHeader(container) {
            this.headerContainer = container;
            this.twistiesContainer = (0, dom_1.append)(container, (0, dom_1.$)(themables_1.ThemeIcon.asCSSSelector(this.getTwistyIcon(this.isExpanded()))));
            this.renderHeaderTitle(container, this.title);
            const actions = (0, dom_1.append)(container, (0, dom_1.$)('.actions'));
            actions.classList.toggle('show-always', this.showActions === ViewPaneShowActions.Always);
            actions.classList.toggle('show-expanded', this.showActions === ViewPaneShowActions.WhenExpanded);
            this.toolbar = this.instantiationService.createInstance(toolbar_1.WorkbenchToolBar, actions, {
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                actionViewItemProvider: action => this.getActionViewItem(action),
                ariaLabel: nls.localize('viewToolbarAriaLabel', "{0} actions", this.title),
                getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
                renderDropdownAsChildElement: true,
                actionRunner: this.getActionRunner(),
                resetMenu: this.menuActions.menuId
            });
            this._register(this.toolbar);
            this.setActions();
            this._register((0, dom_1.addDisposableListener)(actions, dom_1.EventType.CLICK, e => e.preventDefault()));
            const viewContainerModel = this.viewDescriptorService.getViewContainerByViewId(this.id);
            if (viewContainerModel) {
                this._register(this.viewDescriptorService.getViewContainerModel(viewContainerModel).onDidChangeContainerInfo(({ title }) => this.updateTitle(this.title)));
            }
            else {
                console.error(`View container model not found for view ${this.id}`);
            }
            const onDidRelevantConfigurationChange = event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration(ViewPane_1.AlwaysShowActionsConfig));
            this._register(onDidRelevantConfigurationChange(this.updateActionsVisibility, this));
            this.updateActionsVisibility();
        }
        getTwistyIcon(expanded) {
            return expanded ? viewPaneContainerExpandedIcon : viewPaneContainerCollapsedIcon;
        }
        style(styles) {
            super.style(styles);
            const icon = this.getIcon();
            if (this.iconContainer) {
                const fgColor = (0, dom_1.asCssValueWithDefault)(styles.headerForeground, (0, colorRegistry_1.asCssVariable)(colorRegistry_1.foreground));
                if (uri_1.URI.isUri(icon)) {
                    // Apply background color to activity bar item provided with iconUrls
                    this.iconContainer.style.backgroundColor = fgColor;
                    this.iconContainer.style.color = '';
                }
                else {
                    // Apply foreground color to activity bar items provided with codicons
                    this.iconContainer.style.color = fgColor;
                    this.iconContainer.style.backgroundColor = '';
                }
            }
        }
        getIcon() {
            return this.viewDescriptorService.getViewDescriptorById(this.id)?.containerIcon || views_1.defaultViewIcon;
        }
        renderHeaderTitle(container, title) {
            this.iconContainer = (0, dom_1.append)(container, (0, dom_1.$)('.icon', undefined));
            const icon = this.getIcon();
            let cssClass = undefined;
            if (uri_1.URI.isUri(icon)) {
                cssClass = `view-${this.id.replace(/[\.\:]/g, '-')}`;
                const iconClass = `.pane-header .icon.${cssClass}`;
                (0, dom_1.createCSSRule)(iconClass, `
				mask: ${(0, dom_1.asCSSUrl)(icon)} no-repeat 50% 50%;
				mask-size: 24px;
				-webkit-mask: ${(0, dom_1.asCSSUrl)(icon)} no-repeat 50% 50%;
				-webkit-mask-size: 16px;
			`);
            }
            else if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                cssClass = themables_1.ThemeIcon.asClassName(icon);
            }
            if (cssClass) {
                this.iconContainer.classList.add(...cssClass.split(' '));
            }
            const calculatedTitle = this.calculateTitle(title);
            this.titleContainer = (0, dom_1.append)(container, (0, dom_1.$)('h3.title', { title: calculatedTitle }, calculatedTitle));
            if (this._titleDescription) {
                this.setTitleDescription(this._titleDescription);
            }
            this.iconContainer.title = calculatedTitle;
            this.iconContainer.setAttribute('aria-label', calculatedTitle);
        }
        updateTitle(title) {
            const calculatedTitle = this.calculateTitle(title);
            if (this.titleContainer) {
                this.titleContainer.textContent = calculatedTitle;
                this.titleContainer.setAttribute('title', calculatedTitle);
            }
            if (this.iconContainer) {
                this.iconContainer.title = calculatedTitle;
                this.iconContainer.setAttribute('aria-label', calculatedTitle);
            }
            this._title = title;
            this._onDidChangeTitleArea.fire();
        }
        setTitleDescription(description) {
            if (this.titleDescriptionContainer) {
                this.titleDescriptionContainer.textContent = description ?? '';
                this.titleDescriptionContainer.setAttribute('title', description ?? '');
            }
            else if (description && this.titleContainer) {
                this.titleDescriptionContainer = (0, dom_1.after)(this.titleContainer, (0, dom_1.$)('span.description', { title: description }, description));
            }
        }
        updateTitleDescription(description) {
            this.setTitleDescription(description);
            this._titleDescription = description;
            this._onDidChangeTitleArea.fire();
        }
        calculateTitle(title) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(this.id);
            const model = this.viewDescriptorService.getViewContainerModel(viewContainer);
            const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(this.id);
            const isDefault = this.viewDescriptorService.getDefaultContainerById(this.id) === viewContainer;
            if (!isDefault && viewDescriptor?.containerTitle && model.title !== viewDescriptor.containerTitle) {
                return `${viewDescriptor.containerTitle}: ${title}`;
            }
            return title;
        }
        renderBody(container) {
            this.bodyContainer = container;
            const viewWelcomeContainer = (0, dom_1.append)(container, (0, dom_1.$)('.welcome-view'));
            this.viewWelcomeContainer = (0, dom_1.$)('.welcome-view-content', { tabIndex: 0 });
            this.scrollableElement = this._register(new scrollableElement_1.DomScrollableElement(this.viewWelcomeContainer, {
                alwaysConsumeMouseWheel: true,
                horizontal: 2 /* ScrollbarVisibility.Hidden */,
                vertical: 3 /* ScrollbarVisibility.Visible */,
            }));
            (0, dom_1.append)(viewWelcomeContainer, this.scrollableElement.getDomNode());
            const onViewWelcomeChange = event_1.Event.any(this.viewWelcomeController.onDidChange, this.onDidChangeViewWelcomeState);
            this._register(onViewWelcomeChange(this.updateViewWelcome, this));
            this.updateViewWelcome();
        }
        layoutBody(height, width) {
            this.viewWelcomeContainer.style.height = `${height}px`;
            this.viewWelcomeContainer.style.width = `${width}px`;
            this.viewWelcomeContainer.classList.toggle('wide', width > 640);
            this.scrollableElement.scanDomNode();
        }
        onDidScrollRoot() {
            // noop
        }
        getProgressIndicator() {
            if (this.progressBar === undefined) {
                // Progress bar
                this.progressBar = this._register(new progressbar_1.ProgressBar(this.element, defaultStyles_1.defaultProgressBarStyles));
                this.progressBar.hide();
            }
            if (this.progressIndicator === undefined) {
                const that = this;
                this.progressIndicator = new progressIndicator_1.ScopedProgressIndicator((0, types_1.assertIsDefined)(this.progressBar), new class extends progressIndicator_1.AbstractProgressScope {
                    constructor() {
                        super(that.id, that.isBodyVisible());
                        this._register(that.onDidChangeBodyVisibility(isVisible => isVisible ? this.onScopeOpened(that.id) : this.onScopeClosed(that.id)));
                    }
                }());
            }
            return this.progressIndicator;
        }
        getProgressLocation() {
            return this.viewDescriptorService.getViewContainerByViewId(this.id).id;
        }
        getBackgroundColor() {
            switch (this.viewDescriptorService.getViewLocationById(this.id)) {
                case 1 /* ViewContainerLocation.Panel */:
                    return theme_1.PANEL_BACKGROUND;
                case 0 /* ViewContainerLocation.Sidebar */:
                case 2 /* ViewContainerLocation.AuxiliaryBar */:
                    return theme_1.SIDE_BAR_BACKGROUND;
            }
            return theme_1.SIDE_BAR_BACKGROUND;
        }
        focus() {
            if (this.shouldShowWelcome()) {
                this.viewWelcomeContainer.focus();
            }
            else if (this.element) {
                this.element.focus();
                this._onDidFocus.fire();
            }
        }
        setActions() {
            if (this.toolbar) {
                const primaryActions = [...this.menuActions.getPrimaryActions()];
                if (this.shouldShowFilterInHeader()) {
                    primaryActions.unshift(exports.VIEWPANE_FILTER_ACTION);
                }
                this.toolbar.setActions((0, actionbar_1.prepareActions)(primaryActions), (0, actionbar_1.prepareActions)(this.menuActions.getSecondaryActions()));
                this.toolbar.context = this.getActionsContext();
            }
        }
        updateActionsVisibility() {
            if (!this.headerContainer) {
                return;
            }
            const shouldAlwaysShowActions = this.configurationService.getValue('workbench.view.alwaysShowHeaderActions');
            this.headerContainer.classList.toggle('actions-always-visible', shouldAlwaysShowActions);
        }
        updateActions() {
            this.setActions();
            this._onDidChangeTitleArea.fire();
        }
        getActionViewItem(action, options) {
            if (action.id === exports.VIEWPANE_FILTER_ACTION.id) {
                const that = this;
                return new class extends actionViewItems_1.BaseActionViewItem {
                    constructor() { super(null, action); }
                    setFocusable() { }
                    get trapsArrowNavigation() { return true; }
                    render(container) {
                        container.classList.add('viewpane-filter-container');
                        (0, dom_1.append)(container, that.getFilterWidget().element);
                    }
                };
            }
            return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action, { ...options, ...{ menuAsChild: action instanceof actions_2.SubmenuItemAction } });
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
        updateViewWelcome() {
            this.viewWelcomeDisposable.dispose();
            if (!this.shouldShowWelcome()) {
                this.bodyContainer.classList.remove('welcome');
                this.viewWelcomeContainer.innerText = '';
                this.scrollableElement.scanDomNode();
                return;
            }
            const contents = this.viewWelcomeController.contents;
            if (contents.length === 0) {
                this.bodyContainer.classList.remove('welcome');
                this.viewWelcomeContainer.innerText = '';
                this.scrollableElement.scanDomNode();
                return;
            }
            const disposables = new lifecycle_1.DisposableStore();
            this.bodyContainer.classList.add('welcome');
            this.viewWelcomeContainer.innerText = '';
            for (const { content, precondition } of contents) {
                const lines = content.split('\n');
                for (let line of lines) {
                    line = line.trim();
                    if (!line) {
                        continue;
                    }
                    const linkedText = (0, linkedText_1.parseLinkedText)(line);
                    if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== 'string') {
                        const node = linkedText.nodes[0];
                        const buttonContainer = (0, dom_1.append)(this.viewWelcomeContainer, (0, dom_1.$)('.button-container'));
                        const button = new button_1.Button(buttonContainer, { title: node.title, supportIcons: true, ...defaultStyles_1.defaultButtonStyles });
                        button.label = node.label;
                        button.onDidClick(_ => {
                            this.telemetryService.publicLog2('views.welcomeAction', { viewId: this.id, uri: node.href });
                            this.openerService.open(node.href, { allowCommands: true });
                        }, null, disposables);
                        disposables.add(button);
                        if (precondition) {
                            const updateEnablement = () => button.enabled = this.contextKeyService.contextMatchesRules(precondition);
                            updateEnablement();
                            const keys = new Set();
                            precondition.keys().forEach(key => keys.add(key));
                            const onDidChangeContext = event_1.Event.filter(this.contextKeyService.onDidChangeContext, e => e.affectsSome(keys));
                            onDidChangeContext(updateEnablement, null, disposables);
                        }
                    }
                    else {
                        const p = (0, dom_1.append)(this.viewWelcomeContainer, (0, dom_1.$)('p'));
                        for (const node of linkedText.nodes) {
                            if (typeof node === 'string') {
                                (0, dom_1.append)(p, document.createTextNode(node));
                            }
                            else {
                                const link = disposables.add(this.instantiationService.createInstance(link_1.Link, p, node, {}));
                                if (precondition && node.href.startsWith('command:')) {
                                    const updateEnablement = () => link.enabled = this.contextKeyService.contextMatchesRules(precondition);
                                    updateEnablement();
                                    const keys = new Set();
                                    precondition.keys().forEach(key => keys.add(key));
                                    const onDidChangeContext = event_1.Event.filter(this.contextKeyService.onDidChangeContext, e => e.affectsSome(keys));
                                    onDidChangeContext(updateEnablement, null, disposables);
                                }
                            }
                        }
                    }
                }
            }
            this.scrollableElement.scanDomNode();
            this.viewWelcomeDisposable = disposables;
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
    exports.ViewPane = ViewPane;
    exports.ViewPane = ViewPane = ViewPane_1 = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, opener_1.IOpenerService),
        __param(8, themeService_1.IThemeService),
        __param(9, telemetry_1.ITelemetryService)
    ], ViewPane);
    let FilterViewPane = class FilterViewPane extends ViewPane {
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.filterWidget = this._register(instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService])).createInstance(viewFilter_1.FilterWidget, options.filterOptions));
        }
        getFilterWidget() {
            return this.filterWidget;
        }
        renderBody(container) {
            super.renderBody(container);
            this.filterContainer = (0, dom_1.append)(container, (0, dom_1.$)('.viewpane-filter-container'));
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.dimension = new dom_1.Dimension(width, height);
            const wasFilterShownInHeader = !this.filterContainer?.hasChildNodes();
            const shouldShowFilterInHeader = this.shouldShowFilterInHeader();
            if (wasFilterShownInHeader !== shouldShowFilterInHeader) {
                if (shouldShowFilterInHeader) {
                    (0, dom_1.reset)(this.filterContainer);
                }
                this.updateActions();
                if (!shouldShowFilterInHeader) {
                    (0, dom_1.append)(this.filterContainer, this.filterWidget.element);
                }
            }
            if (!shouldShowFilterInHeader) {
                height = height - 44;
            }
            this.filterWidget.layout(width);
            this.layoutBodyContent(height, width);
        }
        shouldShowFilterInHeader() {
            return !(this.dimension && this.dimension.width < 600 && this.dimension.height > 100);
        }
    };
    exports.FilterViewPane = FilterViewPane;
    exports.FilterViewPane = FilterViewPane = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, opener_1.IOpenerService),
        __param(8, themeService_1.IThemeService),
        __param(9, telemetry_1.ITelemetryService)
    ], FilterViewPane);
    class ViewAction extends actions_2.Action2 {
        constructor(desc) {
            super(desc);
            this.desc = desc;
        }
        run(accessor, ...args) {
            const view = accessor.get(views_1.IViewsService).getActiveViewWithId(this.desc.viewId);
            if (view) {
                return this.runInView(accessor, view, ...args);
            }
        }
    }
    exports.ViewAction = ViewAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld1BhbmUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy92aWV3cy92aWV3UGFuZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBOENoRyxJQUFZLG1CQVNYO0lBVEQsV0FBWSxtQkFBbUI7UUFDOUIsK0VBQStFO1FBQy9FLG1FQUFPLENBQUE7UUFFUCx5REFBeUQ7UUFDekQsNkVBQVksQ0FBQTtRQUVaLCtCQUErQjtRQUMvQixpRUFBTSxDQUFBO0lBQ1AsQ0FBQyxFQVRXLG1CQUFtQixtQ0FBbkIsbUJBQW1CLFFBUzlCO0lBYVksUUFBQSxzQkFBc0IsR0FBRyxJQUFJLGdCQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQVMzRSxNQUFNLDZCQUE2QixHQUFHLElBQUEsMkJBQVksRUFBQyw4QkFBOEIsRUFBRSxrQkFBTyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLCtCQUErQixFQUFFLDJDQUEyQyxDQUFDLENBQUMsQ0FBQztJQUNwTSxNQUFNLDhCQUE4QixHQUFHLElBQUEsMkJBQVksRUFBQywrQkFBK0IsRUFBRSxrQkFBTyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxFQUFFLDJDQUEyQyxDQUFDLENBQUMsQ0FBQztJQUV4TSxNQUFNLGFBQWEsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBaUIsa0JBQXVCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFPekYsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBcUI7UUFPMUIsSUFBSSxRQUFRO1lBQ1gsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdkQsSUFBSSxZQUFZLENBQUMs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