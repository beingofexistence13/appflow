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
define(["require", "exports", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/tree/treeDefaults", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/common/dataTransfer", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/theme", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/browser/dnd", "vs/workbench/browser/labels", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/services/activity/common/activity", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/hover/browser/hover", "vs/workbench/services/views/browser/treeViewsService", "vs/platform/dnd/browser/dnd", "vs/editor/browser/dnd", "vs/workbench/browser/parts/views/checkbox", "vs/base/common/platform", "vs/platform/telemetry/common/telemetryUtils", "vs/editor/common/services/treeViewsDndService", "vs/editor/common/services/treeViewsDnd", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/css!./media/views"], function (require, exports, dnd_1, DOM, markdownRenderer_1, actionbar_1, actionViewItems_1, treeDefaults_1, actions_1, async_1, cancellation_1, codicons_1, errors_1, event_1, filters_1, htmlContent_1, lifecycle_1, mime_1, network_1, resources_1, strings_1, types_1, uri_1, uuid_1, dataTransfer_1, nls_1, menuEntryActionViewItem_1, actions_2, commands_1, configuration_1, contextkey_1, contextView_1, files_1, instantiation_1, keybinding_1, label_1, listService_1, log_1, notification_1, opener_1, progress_1, platform_1, telemetry_1, theme_1, themeService_1, themables_1, dnd_2, labels_1, editorCommands_1, viewPane_1, theme_2, views_1, activity_1, extensions_1, hover_1, treeViewsService_1, dnd_3, dnd_4, checkbox_1, platform_2, telemetryUtils_1, treeViewsDndService_1, treeViewsDnd_1, markdownRenderer_2) {
    "use strict";
    var TreeRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomTreeViewDragAndDrop = exports.TreeView = exports.CustomTreeView = exports.RawCustomTreeViewContextKey = exports.TreeViewPane = void 0;
    let TreeViewPane = class TreeViewPane extends viewPane_1.ViewPane {
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService) {
            super({ ...options, titleMenuId: actions_2.MenuId.ViewTitle, donotForwardArgs: false }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            const { treeView } = platform_1.Registry.as(views_1.Extensions.ViewsRegistry).getView(options.id);
            this.treeView = treeView;
            this._register(this.treeView.onDidChangeActions(() => this.updateActions(), this));
            this._register(this.treeView.onDidChangeTitle((newTitle) => this.updateTitle(newTitle)));
            this._register(this.treeView.onDidChangeDescription((newDescription) => this.updateTitleDescription(newDescription)));
            this._register((0, lifecycle_1.toDisposable)(() => {
                if (this._container && this.treeView.container && (this._container === this.treeView.container)) {
                    this.treeView.setVisibility(false);
                }
            }));
            this._register(this.onDidChangeBodyVisibility(() => this.updateTreeVisibility()));
            this._register(this.treeView.onDidChangeWelcomeState(() => this._onDidChangeViewWelcomeState.fire()));
            if (options.title !== this.treeView.title) {
                this.updateTitle(this.treeView.title);
            }
            if (options.titleDescription !== this.treeView.description) {
                this.updateTitleDescription(this.treeView.description);
            }
            this._actionRunner = new MultipleSelectionActionRunner(notificationService, () => this.treeView.getSelection());
            this.updateTreeVisibility();
        }
        focus() {
            super.focus();
            this.treeView.focus();
        }
        renderBody(container) {
            this._container = container;
            super.renderBody(container);
            this.renderTreeView(container);
        }
        shouldShowWelcome() {
            return ((this.treeView.dataProvider === undefined) || !!this.treeView.dataProvider.isTreeEmpty) && ((this.treeView.message === undefined) || (this.treeView.message === ''));
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.layoutTreeView(height, width);
        }
        getOptimalWidth() {
            return this.treeView.getOptimalWidth();
        }
        renderTreeView(container) {
            this.treeView.show(container);
        }
        layoutTreeView(height, width) {
            this.treeView.layout(height, width);
        }
        updateTreeVisibility() {
            this.treeView.setVisibility(this.isBodyVisible());
        }
        getActionRunner() {
            return this._actionRunner;
        }
        getActionsContext() {
            return { $treeViewId: this.id, $focusedTreeItem: true, $selectedTreeItems: true };
        }
    };
    exports.TreeViewPane = TreeViewPane;
    exports.TreeViewPane = TreeViewPane = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, opener_1.IOpenerService),
        __param(8, themeService_1.IThemeService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, notification_1.INotificationService)
    ], TreeViewPane);
    class Root {
        constructor() {
            this.label = { label: 'root' };
            this.handle = '0';
            this.parentHandle = undefined;
            this.collapsibleState = views_1.TreeItemCollapsibleState.Expanded;
            this.children = undefined;
        }
    }
    function isTreeCommandEnabled(treeCommand, contextKeyService) {
        const command = commands_1.CommandsRegistry.getCommand(treeCommand.originalId ? treeCommand.originalId : treeCommand.id);
        if (command) {
            const commandAction = actions_2.MenuRegistry.getCommand(command.id);
            const precondition = commandAction && commandAction.precondition;
            if (precondition) {
                return contextKeyService.contextMatchesRules(precondition);
            }
        }
        return true;
    }
    function isRenderedMessageValue(messageValue) {
        return !!messageValue && typeof messageValue !== 'string' && 'element' in messageValue && 'dispose' in messageValue;
    }
    const noDataProviderMessage = (0, nls_1.localize)('no-dataprovider', "There is no data provider registered that can provide view data.");
    exports.RawCustomTreeViewContextKey = new contextkey_1.RawContextKey('customTreeView', false);
    class Tree extends listService_1.WorkbenchAsyncDataTree {
    }
    let AbstractTreeView = class AbstractTreeView extends lifecycle_1.Disposable {
        constructor(id, _title, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, hoverService, contextKeyService, activityService, logService) {
            super();
            this.id = id;
            this._title = _title;
            this.themeService = themeService;
            this.instantiationService = instantiationService;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.progressService = progressService;
            this.contextMenuService = contextMenuService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this.viewDescriptorService = viewDescriptorService;
            this.hoverService = hoverService;
            this.contextKeyService = contextKeyService;
            this.activityService = activityService;
            this.logService = logService;
            this.isVisible = false;
            this._hasIconForParentNode = false;
            this._hasIconForLeafNode = false;
            this.focused = false;
            this._canSelectMany = false;
            this._manuallyManageCheckboxes = false;
            this.elementsToRefresh = [];
            this.lastSelection = [];
            this._onDidExpandItem = this._register(new event_1.Emitter());
            this.onDidExpandItem = this._onDidExpandItem.event;
            this._onDidCollapseItem = this._register(new event_1.Emitter());
            this.onDidCollapseItem = this._onDidCollapseItem.event;
            this._onDidChangeSelectionAndFocus = this._register(new event_1.Emitter());
            this.onDidChangeSelectionAndFocus = this._onDidChangeSelectionAndFocus.event;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this._onDidChangeActions = this._register(new event_1.Emitter());
            this.onDidChangeActions = this._onDidChangeActions.event;
            this._onDidChangeWelcomeState = this._register(new event_1.Emitter());
            this.onDidChangeWelcomeState = this._onDidChangeWelcomeState.event;
            this._onDidChangeTitle = this._register(new event_1.Emitter());
            this.onDidChangeTitle = this._onDidChangeTitle.event;
            this._onDidChangeDescription = this._register(new event_1.Emitter());
            this.onDidChangeDescription = this._onDidChangeDescription.event;
            this._onDidChangeCheckboxState = this._register(new event_1.Emitter());
            this.onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
            this._onDidCompleteRefresh = this._register(new event_1.Emitter());
            this._isInitialized = false;
            this._height = 0;
            this._width = 0;
            this.refreshing = false;
            this.root = new Root();
            this.lastActive = this.root;
            // Try not to add anything that could be costly to this constructor. It gets called once per tree view
            // during startup, and anything added here can affect performance.
        }
        initialize() {
            if (this._isInitialized) {
                return;
            }
            this._isInitialized = true;
            // Remember when adding to this method that it isn't called until the the view is visible, meaning that
            // properties could be set and events could be fired before we're initialized and that this needs to be handled.
            this.contextKeyService.bufferChangeEvents(() => {
                this.initializeShowCollapseAllAction();
                this.initializeCollapseAllToggle();
                this.initializeShowRefreshAction();
            });
            this.treeViewDnd = this.instantiationService.createInstance(CustomTreeViewDragAndDrop, this.id);
            if (this._dragAndDropController) {
                this.treeViewDnd.controller = this._dragAndDropController;
            }
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('explorer.decorations')) {
                    this.doRefresh([this.root]); /** soft refresh **/
                }
            }));
            this._register(this.viewDescriptorService.onDidChangeLocation(({ views, from, to }) => {
                if (views.some(v => v.id === this.id)) {
                    this.tree?.updateOptions({ overrideStyles: { listBackground: this.viewLocation === 1 /* ViewContainerLocation.Panel */ ? theme_2.PANEL_BACKGROUND : theme_2.SIDE_BAR_BACKGROUND } });
                }
            }));
            this.registerActions();
            this.create();
        }
        get viewContainer() {
            return this.viewDescriptorService.getViewContainerByViewId(this.id);
        }
        get viewLocation() {
            return this.viewDescriptorService.getViewLocationById(this.id);
        }
        get dragAndDropController() {
            return this._dragAndDropController;
        }
        set dragAndDropController(dnd) {
            this._dragAndDropController = dnd;
            if (this.treeViewDnd) {
                this.treeViewDnd.controller = dnd;
            }
        }
        get dataProvider() {
            return this._dataProvider;
        }
        set dataProvider(dataProvider) {
            if (dataProvider) {
                const self = this;
                this._dataProvider = new class {
                    constructor() {
                        this._isEmpty = true;
                        this._onDidChangeEmpty = new event_1.Emitter();
                        this.onDidChangeEmpty = this._onDidChangeEmpty.event;
                    }
                    get isTreeEmpty() {
                        return this._isEmpty;
                    }
                    async getChildren(node) {
                        let children;
                        const checkboxesUpdated = [];
                        if (node && node.children) {
                            children = node.children;
                        }
                        else {
                            node = node ?? self.root;
                            node.children = await (node instanceof Root ? dataProvider.getChildren() : dataProvider.getChildren(node));
                            children = node.children ?? [];
                            children.forEach(child => {
                                child.parent = node;
                                if (!self.manuallyManageCheckboxes && (node?.checkbox?.isChecked === true) && (child.checkbox?.isChecked === false)) {
                                    child.checkbox.isChecked = true;
                                    checkboxesUpdated.push(child);
                                }
                            });
                        }
                        if (node instanceof Root) {
                            const oldEmpty = this._isEmpty;
                            this._isEmpty = children.length === 0;
                            if (oldEmpty !== this._isEmpty) {
                                this._onDidChangeEmpty.fire();
                            }
                        }
                        if (checkboxesUpdated.length > 0) {
                            self._onDidChangeCheckboxState.fire(checkboxesUpdated);
                        }
                        return children;
                    }
                };
                if (this._dataProvider.onDidChangeEmpty) {
                    this._register(this._dataProvider.onDidChangeEmpty(() => {
                        this.updateCollapseAllToggle();
                        this._onDidChangeWelcomeState.fire();
                    }));
                }
                this.updateMessage();
                this.refresh();
            }
            else {
                this._dataProvider = undefined;
                this.updateMessage();
            }
            this._onDidChangeWelcomeState.fire();
        }
        get message() {
            return this._message;
        }
        set message(message) {
            this._message = message;
            this.updateMessage();
            this._onDidChangeWelcomeState.fire();
        }
        get title() {
            return this._title;
        }
        set title(name) {
            this._title = name;
            this._onDidChangeTitle.fire(this._title);
        }
        get description() {
            return this._description;
        }
        set description(description) {
            this._description = description;
            this._onDidChangeDescription.fire(this._description);
        }
        get badge() {
            return this._badge;
        }
        set badge(badge) {
            if (this._badge?.value === badge?.value &&
                this._badge?.tooltip === badge?.tooltip) {
                return;
            }
            if (this._badgeActivity) {
                this._badgeActivity.dispose();
                this._badgeActivity = undefined;
            }
            this._badge = badge;
            if (badge) {
                const activity = {
                    badge: new activity_1.NumberBadge(badge.value, () => badge.tooltip),
                    priority: 50
                };
                this._badgeActivity = this.activityService.showViewActivity(this.id, activity);
            }
        }
        get canSelectMany() {
            return this._canSelectMany;
        }
        set canSelectMany(canSelectMany) {
            const oldCanSelectMany = this._canSelectMany;
            this._canSelectMany = canSelectMany;
            if (this._canSelectMany !== oldCanSelectMany) {
                this.tree?.updateOptions({ multipleSelectionSupport: this.canSelectMany });
            }
        }
        get manuallyManageCheckboxes() {
            return this._manuallyManageCheckboxes;
        }
        set manuallyManageCheckboxes(manuallyManageCheckboxes) {
            this._manuallyManageCheckboxes = manuallyManageCheckboxes;
        }
        get hasIconForParentNode() {
            return this._hasIconForParentNode;
        }
        get hasIconForLeafNode() {
            return this._hasIconForLeafNode;
        }
        get visible() {
            return this.isVisible;
        }
        initializeShowCollapseAllAction(startingValue = false) {
            if (!this.collapseAllContext) {
                this.collapseAllContextKey = new contextkey_1.RawContextKey(`treeView.${this.id}.enableCollapseAll`, startingValue, (0, nls_1.localize)('treeView.enableCollapseAll', "Whether the the tree view with id {0} enables collapse all.", this.id));
                this.collapseAllContext = this.collapseAllContextKey.bindTo(this.contextKeyService);
            }
            return true;
        }
        get showCollapseAllAction() {
            this.initializeShowCollapseAllAction();
            return !!this.collapseAllContext?.get();
        }
        set showCollapseAllAction(showCollapseAllAction) {
            this.initializeShowCollapseAllAction(showCollapseAllAction);
            this.collapseAllContext?.set(showCollapseAllAction);
        }
        initializeShowRefreshAction(startingValue = false) {
            if (!this.refreshContext) {
                this.refreshContextKey = new contextkey_1.RawContextKey(`treeView.${this.id}.enableRefresh`, startingValue, (0, nls_1.localize)('treeView.enableRefresh', "Whether the tree view with id {0} enables refresh.", this.id));
                this.refreshContext = this.refreshContextKey.bindTo(this.contextKeyService);
            }
        }
        get showRefreshAction() {
            this.initializeShowRefreshAction();
            return !!this.refreshContext?.get();
        }
        set showRefreshAction(showRefreshAction) {
            this.initializeShowRefreshAction(showRefreshAction);
            this.refreshContext?.set(showRefreshAction);
        }
        registerActions() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.treeView.${that.id}.refresh`,
                        title: (0, nls_1.localize)('refresh', "Refresh"),
                        menu: {
                            id: actions_2.MenuId.ViewTitle,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', that.id), that.refreshContextKey),
                            group: 'navigation',
                            order: Number.MAX_SAFE_INTEGER - 1,
                        },
                        icon: codicons_1.Codicon.refresh
                    });
                }
                async run() {
                    return that.refresh();
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.treeView.${that.id}.collapseAll`,
                        title: (0, nls_1.localize)('collapseAll', "Collapse All"),
                        menu: {
                            id: actions_2.MenuId.ViewTitle,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', that.id), that.collapseAllContextKey),
                            group: 'navigation',
                            order: Number.MAX_SAFE_INTEGER,
                        },
                        precondition: that.collapseAllToggleContextKey,
                        icon: codicons_1.Codicon.collapseAll
                    });
                }
                async run() {
                    if (that.tree) {
                        return new treeDefaults_1.CollapseAllAction(that.tree, true).run();
                    }
                }
            }));
        }
        setVisibility(isVisible) {
            // Throughout setVisibility we need to check if the tree view's data provider still exists.
            // This can happen because the `getChildren` call to the extension can return
            // after the tree has been disposed.
            this.initialize();
            isVisible = !!isVisible;
            if (this.isVisible === isVisible) {
                return;
            }
            this.isVisible = isVisible;
            if (this.tree) {
                if (this.isVisible) {
                    DOM.show(this.tree.getHTMLElement());
                }
                else {
                    DOM.hide(this.tree.getHTMLElement()); // make sure the tree goes out of the tabindex world by hiding it
                }
                if (this.isVisible && this.elementsToRefresh.length && this.dataProvider) {
                    this.doRefresh(this.elementsToRefresh);
                    this.elementsToRefresh = [];
                }
            }
            (0, platform_2.setTimeout0)(() => {
                if (this.dataProvider) {
                    this._onDidChangeVisibility.fire(this.isVisible);
                }
            });
            if (this.visible) {
                this.activate();
            }
        }
        focus(reveal = true, revealItem) {
            if (this.tree && this.root.children && this.root.children.length > 0) {
                // Make sure the current selected element is revealed
                const element = revealItem ?? this.tree.getSelection()[0];
                if (element && reveal) {
                    this.tree.reveal(element, 0.5);
                }
                // Pass Focus to Viewer
                this.tree.domFocus();
            }
            else if (this.tree && this.treeContainer && !this.treeContainer.classList.contains('hide')) {
                this.tree.domFocus();
            }
            else {
                this.domNode.focus();
            }
        }
        show(container) {
            this._container = container;
            DOM.append(container, this.domNode);
        }
        create() {
            this.domNode = DOM.$('.tree-explorer-viewlet-tree-view');
            this.messageElement = DOM.append(this.domNode, DOM.$('.message'));
            this.updateMessage();
            this.treeContainer = DOM.append(this.domNode, DOM.$('.customview-tree'));
            this.treeContainer.classList.add('file-icon-themable-tree', 'show-file-icons');
            const focusTracker = this._register(DOM.trackFocus(this.domNode));
            this._register(focusTracker.onDidFocus(() => this.focused = true));
            this._register(focusTracker.onDidBlur(() => this.focused = false));
        }
        createTree() {
            const actionViewItemProvider = menuEntryActionViewItem_1.createActionViewItem.bind(undefined, this.instantiationService);
            const treeMenus = this._register(this.instantiationService.createInstance(TreeMenus, this.id));
            this.treeLabels = this._register(this.instantiationService.createInstance(labels_1.ResourceLabels, this));
            const dataSource = this.instantiationService.createInstance(TreeDataSource, this, (task) => this.progressService.withProgress({ location: this.id }, () => task));
            const aligner = new Aligner(this.themeService);
            const checkboxStateHandler = this._register(new checkbox_1.CheckboxStateHandler());
            const renderer = this.instantiationService.createInstance(TreeRenderer, this.id, treeMenus, this.treeLabels, actionViewItemProvider, aligner, checkboxStateHandler, this.manuallyManageCheckboxes);
            this._register(renderer.onDidChangeCheckboxState(e => this._onDidChangeCheckboxState.fire(e)));
            const widgetAriaLabel = this._title;
            this.tree = this._register(this.instantiationService.createInstance(Tree, this.id, this.treeContainer, new TreeViewDelegate(), [renderer], dataSource, {
                identityProvider: new TreeViewIdentityProvider(),
                accessibilityProvider: {
                    getAriaLabel(element) {
                        if (element.accessibilityInformation) {
                            return element.accessibilityInformation.label;
                        }
                        if ((0, types_1.isString)(element.tooltip)) {
                            return element.tooltip;
                        }
                        else {
                            if (element.resourceUri && !element.label) {
                                // The custom tree has no good information on what should be used for the aria label.
                                // Allow the tree widget's default aria label to be used.
                                return null;
                            }
                            let buildAriaLabel = '';
                            if (element.label) {
                                buildAriaLabel += element.label.label + ' ';
                            }
                            if (element.description) {
                                buildAriaLabel += element.description;
                            }
                            return buildAriaLabel;
                        }
                    },
                    getRole(element) {
                        return element.accessibilityInformation?.role ?? 'treeitem';
                    },
                    getWidgetAriaLabel() {
                        return widgetAriaLabel;
                    }
                },
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (item) => {
                        return item.label ? item.label.label : (item.resourceUri ? (0, resources_1.basename)(uri_1.URI.revive(item.resourceUri)) : undefined);
                    }
                },
                expandOnlyOnTwistieClick: (e) => {
                    return !!e.command || !!e.checkbox || this.configurationService.getValue('workbench.tree.expandMode') === 'doubleClick';
                },
                collapseByDefault: (e) => {
                    return e.collapsibleState !== views_1.TreeItemCollapsibleState.Expanded;
                },
                multipleSelectionSupport: this.canSelectMany,
                dnd: this.treeViewDnd,
                overrideStyles: {
                    listBackground: this.viewLocation === 1 /* ViewContainerLocation.Panel */ ? theme_2.PANEL_BACKGROUND : theme_2.SIDE_BAR_BACKGROUND
                }
            }));
            treeMenus.setContextKeyService(this.tree.contextKeyService);
            aligner.tree = this.tree;
            const actionRunner = new MultipleSelectionActionRunner(this.notificationService, () => this.tree.getSelection());
            renderer.actionRunner = actionRunner;
            this.tree.contextKeyService.createKey(this.id, true);
            const customTreeKey = exports.RawCustomTreeViewContextKey.bindTo(this.tree.contextKeyService);
            customTreeKey.set(true);
            this._register(this.tree.onContextMenu(e => this.onContextMenu(treeMenus, e, actionRunner)));
            this._register(this.tree.onDidChangeSelection(e => {
                this.lastSelection = e.elements;
                this.lastActive = this.tree?.getFocus()[0] ?? this.lastActive;
                this._onDidChangeSelectionAndFocus.fire({ selection: this.lastSelection, focus: this.lastActive });
            }));
            this._register(this.tree.onDidChangeFocus(e => {
                if (e.elements.length && (e.elements[0] !== this.lastActive)) {
                    this.lastActive = e.elements[0];
                    this.lastSelection = this.tree?.getSelection() ?? this.lastSelection;
                    this._onDidChangeSelectionAndFocus.fire({ selection: this.lastSelection, focus: this.lastActive });
                }
            }));
            this._register(this.tree.onDidChangeCollapseState(e => {
                if (!e.node.element) {
                    return;
                }
                const element = Array.isArray(e.node.element.element) ? e.node.element.element[0] : e.node.element.element;
                if (e.node.collapsed) {
                    this._onDidCollapseItem.fire(element);
                }
                else {
                    this._onDidExpandItem.fire(element);
                }
            }));
            this.tree.setInput(this.root).then(() => this.updateContentAreas());
            this._register(this.tree.onDidOpen(async (e) => {
                if (!e.browserEvent) {
                    return;
                }
                if (e.browserEvent.target && e.browserEvent.target.classList.contains(checkbox_1.TreeItemCheckbox.checkboxClass)) {
                    return;
                }
                const selection = this.tree.getSelection();
                const command = await this.resolveCommand(selection.length === 1 ? selection[0] : undefined);
                if (command && isTreeCommandEnabled(command, this.contextKeyService)) {
                    let args = command.arguments || [];
                    if (command.id === editorCommands_1.API_OPEN_EDITOR_COMMAND_ID || command.id === editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID) {
                        // Some commands owned by us should receive the
                        // `IOpenEvent` as context to open properly
                        args = [...args, e];
                    }
                    try {
                        await this.commandService.executeCommand(command.id, ...args);
                    }
                    catch (err) {
                        this.notificationService.error(err);
                    }
                }
            }));
            this._register(treeMenus.onDidChange((changed) => {
                if (this.tree?.hasNode(changed)) {
                    this.tree?.rerender(changed);
                }
            }));
        }
        async resolveCommand(element) {
            let command = element?.command;
            if (element && !command) {
                if ((element instanceof views_1.ResolvableTreeItem) && element.hasResolve) {
                    await element.resolve(new cancellation_1.CancellationTokenSource().token);
                    command = element.command;
                }
            }
            return command;
        }
        onContextMenu(treeMenus, treeEvent, actionRunner) {
            this.hoverService.hideHover();
            const node = treeEvent.element;
            if (node === null) {
                return;
            }
            const event = treeEvent.browserEvent;
            event.preventDefault();
            event.stopPropagation();
            this.tree.setFocus([node]);
            const actions = treeMenus.getResourceContextActions(node);
            if (!actions.length) {
                return;
            }
            this.contextMenuService.showContextMenu({
                getAnchor: () => treeEvent.anchor,
                getActions: () => actions,
                getActionViewItem: (action) => {
                    const keybinding = this.keybindingService.lookupKeybinding(action.id);
                    if (keybinding) {
                        return new actionViewItems_1.ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
                    }
                    return undefined;
                },
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.tree.domFocus();
                    }
                },
                getActionsContext: () => ({ $treeViewId: this.id, $treeItemHandle: node.handle }),
                actionRunner
            });
        }
        updateMessage() {
            if (this._message) {
                this.showMessage(this._message);
            }
            else if (!this.dataProvider) {
                this.showMessage(noDataProviderMessage);
            }
            else {
                this.hideMessage();
            }
            this.updateContentAreas();
        }
        showMessage(message) {
            if (isRenderedMessageValue(this._messageValue)) {
                this._messageValue.dispose();
            }
            if ((0, htmlContent_1.isMarkdownString)(message) && !this.markdownRenderer) {
                this.markdownRenderer = this.instantiationService.createInstance(markdownRenderer_2.MarkdownRenderer, {});
            }
            this._messageValue = (0, htmlContent_1.isMarkdownString)(message) ? this.markdownRenderer.render(message) : message;
            if (!this.messageElement) {
                return;
            }
            this.messageElement.classList.remove('hide');
            this.resetMessageElement();
            if (typeof this._messageValue === 'string' && !(0, strings_1.isFalsyOrWhitespace)(this._messageValue)) {
                this.messageElement.textContent = this._messageValue;
            }
            else if (isRenderedMessageValue(this._messageValue)) {
                this.messageElement.appendChild(this._messageValue.element);
            }
            this.layout(this._height, this._width);
        }
        hideMessage() {
            this.resetMessageElement();
            this.messageElement?.classList.add('hide');
            this.layout(this._height, this._width);
        }
        resetMessageElement() {
            if (this.messageElement) {
                DOM.clearNode(this.messageElement);
            }
        }
        layout(height, width) {
            if (height && width && this.messageElement && this.treeContainer) {
                this._height = height;
                this._width = width;
                const treeHeight = height - DOM.getTotalHeight(this.messageElement);
                this.treeContainer.style.height = treeHeight + 'px';
                this.tree?.layout(treeHeight, width);
            }
        }
        getOptimalWidth() {
            if (this.tree) {
                const parentNode = this.tree.getHTMLElement();
                const childNodes = [].slice.call(parentNode.querySelectorAll('.outline-item-label > a'));
                return DOM.getLargestChildWidth(parentNode, childNodes);
            }
            return 0;
        }
        async refresh(elements) {
            if (this.dataProvider && this.tree) {
                if (this.refreshing) {
                    await event_1.Event.toPromise(this._onDidCompleteRefresh.event);
                }
                if (!elements) {
                    elements = [this.root];
                    // remove all waiting elements to refresh if root is asked to refresh
                    this.elementsToRefresh = [];
                }
                for (const element of elements) {
                    element.children = undefined; // reset children
                }
                if (this.isVisible) {
                    return this.doRefresh(elements);
                }
                else {
                    if (this.elementsToRefresh.length) {
                        const seen = new Set();
                        this.elementsToRefresh.forEach(element => seen.add(element.handle));
                        for (const element of elements) {
                            if (!seen.has(element.handle)) {
                                this.elementsToRefresh.push(element);
                            }
                        }
                    }
                    else {
                        this.elementsToRefresh.push(...elements);
                    }
                }
            }
            return undefined;
        }
        async expand(itemOrItems) {
            const tree = this.tree;
            if (!tree) {
                return;
            }
            try {
                itemOrItems = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
                for (const element of itemOrItems) {
                    await tree.expand(element, false);
                }
            }
            catch (e) {
                // The extension could have changed the tree during the reveal.
                // Because of that, we ignore errors.
            }
        }
        isCollapsed(item) {
            return !!this.tree?.isCollapsed(item);
        }
        setSelection(items) {
            this.tree?.setSelection(items);
        }
        getSelection() {
            return this.tree?.getSelection() ?? [];
        }
        setFocus(item) {
            if (this.tree) {
                if (item) {
                    this.focus(true, item);
                    this.tree.setFocus([item]);
                }
                else if (this.tree.getFocus().length === 0) {
                    this.tree.setFocus([]);
                }
            }
        }
        async reveal(item) {
            if (this.tree) {
                return this.tree.reveal(item);
            }
        }
        async doRefresh(elements) {
            const tree = this.tree;
            if (tree && this.visible) {
                this.refreshing = true;
                const oldSelection = tree.getSelection();
                try {
                    await Promise.all(elements.map(element => tree.updateChildren(element, true, true)));
                }
                catch (e) {
                    // When multiple calls are made to refresh the tree in quick succession,
                    // we can get a "Tree element not found" error. This is expected.
                    // Ideally this is fixable, so log instead of ignoring so the error is preserved.
                    this.logService.error(e);
                }
                const newSelection = tree.getSelection();
                if (oldSelection.length !== newSelection.length || oldSelection.some((value, index) => value.handle !== newSelection[index].handle)) {
                    this.lastSelection = newSelection;
                    this._onDidChangeSelectionAndFocus.fire({ selection: this.lastSelection, focus: this.lastActive });
                }
                this.refreshing = false;
                this._onDidCompleteRefresh.fire();
                this.updateContentAreas();
                if (this.focused) {
                    this.focus(false);
                }
                this.updateCollapseAllToggle();
            }
        }
        initializeCollapseAllToggle() {
            if (!this.collapseAllToggleContext) {
                this.collapseAllToggleContextKey = new contextkey_1.RawContextKey(`treeView.${this.id}.toggleCollapseAll`, false, (0, nls_1.localize)('treeView.toggleCollapseAll', "Whether collapse all is toggled for the tree view with id {0}.", this.id));
                this.collapseAllToggleContext = this.collapseAllToggleContextKey.bindTo(this.contextKeyService);
            }
        }
        updateCollapseAllToggle() {
            if (this.showCollapseAllAction) {
                this.initializeCollapseAllToggle();
                this.collapseAllToggleContext?.set(!!this.root.children && (this.root.children.length > 0) &&
                    this.root.children.some(value => value.collapsibleState !== views_1.TreeItemCollapsibleState.None));
            }
        }
        updateContentAreas() {
            const isTreeEmpty = !this.root.children || this.root.children.length === 0;
            // Hide tree container only when there is a message and tree is empty and not refreshing
            if (this._messageValue && isTreeEmpty && !this.refreshing && this.treeContainer) {
                // If there's a dnd controller then hiding the tree prevents it from being dragged into.
                if (!this.dragAndDropController) {
                    this.treeContainer.classList.add('hide');
                }
                this.domNode.setAttribute('tabindex', '0');
            }
            else if (this.treeContainer) {
                this.treeContainer.classList.remove('hide');
                if (this.domNode === DOM.getActiveElement()) {
                    this.focus();
                }
                this.domNode.removeAttribute('tabindex');
            }
        }
        get container() {
            return this._container;
        }
    };
    AbstractTreeView = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, commands_1.ICommandService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, progress_1.IProgressService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, notification_1.INotificationService),
        __param(10, views_1.IViewDescriptorService),
        __param(11, hover_1.IHoverService),
        __param(12, contextkey_1.IContextKeyService),
        __param(13, activity_1.IActivityService),
        __param(14, log_1.ILogService)
    ], AbstractTreeView);
    class TreeViewIdentityProvider {
        getId(element) {
            return element.handle;
        }
    }
    class TreeViewDelegate {
        getHeight(element) {
            return TreeRenderer.ITEM_HEIGHT;
        }
        getTemplateId(element) {
            return TreeRenderer.TREE_TEMPLATE_ID;
        }
    }
    class TreeDataSource {
        constructor(treeView, withProgress) {
            this.treeView = treeView;
            this.withProgress = withProgress;
        }
        hasChildren(element) {
            return !!this.treeView.dataProvider && (element.collapsibleState !== views_1.TreeItemCollapsibleState.None);
        }
        async getChildren(element) {
            let result = [];
            if (this.treeView.dataProvider) {
                try {
                    result = (await this.withProgress(this.treeView.dataProvider.getChildren(element))) ?? [];
                }
                catch (e) {
                    if (!e.message.startsWith('Bad progress location:')) {
                        throw e;
                    }
                }
            }
            return result;
        }
    }
    let TreeRenderer = class TreeRenderer extends lifecycle_1.Disposable {
        static { TreeRenderer_1 = this; }
        static { this.ITEM_HEIGHT = 22; }
        static { this.TREE_TEMPLATE_ID = 'treeExplorer'; }
        constructor(treeViewId, menus, labels, actionViewItemProvider, aligner, checkboxStateHandler, manuallyManageCheckboxes, themeService, configurationService, labelService, hoverService, treeViewsService, contextKeyService) {
            super();
            this.treeViewId = treeViewId;
            this.menus = menus;
            this.labels = labels;
            this.actionViewItemProvider = actionViewItemProvider;
            this.aligner = aligner;
            this.checkboxStateHandler = checkboxStateHandler;
            this.manuallyManageCheckboxes = manuallyManageCheckboxes;
            this.themeService = themeService;
            this.configurationService = configurationService;
            this.labelService = labelService;
            this.hoverService = hoverService;
            this.treeViewsService = treeViewsService;
            this.contextKeyService = contextKeyService;
            this._onDidChangeCheckboxState = this._register(new event_1.Emitter());
            this.onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
            this._hasCheckbox = false;
            this._renderedElements = new Map(); // tree item handle to template data
            this._hoverDelegate = {
                showHover: (options) => this.hoverService.showHover(options),
                delay: this.configurationService.getValue('workbench.hover.delay')
            };
            this._register(this.themeService.onDidFileIconThemeChange(() => this.rerender()));
            this._register(this.themeService.onDidColorThemeChange(() => this.rerender()));
            this._register(checkboxStateHandler.onDidChangeCheckboxState(items => {
                this.updateCheckboxes(items);
            }));
        }
        get templateId() {
            return TreeRenderer_1.TREE_TEMPLATE_ID;
        }
        set actionRunner(actionRunner) {
            this._actionRunner = actionRunner;
        }
        renderTemplate(container) {
            container.classList.add('custom-view-tree-node-item');
            const checkboxContainer = DOM.append(container, DOM.$(''));
            const resourceLabel = this.labels.create(container, { supportHighlights: true, hoverDelegate: this._hoverDelegate });
            const icon = DOM.prepend(resourceLabel.element, DOM.$('.custom-view-tree-node-item-icon'));
            const actionsContainer = DOM.append(resourceLabel.element, DOM.$('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionsContainer, {
                actionViewItemProvider: this.actionViewItemProvider
            });
            return { resourceLabel, icon, checkboxContainer, actionBar, container, elementDisposable: new lifecycle_1.DisposableStore() };
        }
        getHover(label, resource, node) {
            if (!(node instanceof views_1.ResolvableTreeItem) || !node.hasResolve) {
                if (resource && !node.tooltip) {
                    return undefined;
                }
                else if (node.tooltip === undefined) {
                    return label;
                }
                else if (!(0, types_1.isString)(node.tooltip)) {
                    return { markdown: node.tooltip, markdownNotSupportedFallback: resource ? undefined : (0, markdownRenderer_1.renderMarkdownAsPlaintext)(node.tooltip) }; // Passing undefined as the fallback for a resource falls back to the old native hover
                }
                else if (node.tooltip !== '') {
                    return node.tooltip;
                }
                else {
                    return undefined;
                }
            }
            return {
                markdown: typeof node.tooltip === 'string' ? node.tooltip :
                    (token) => {
                        return new Promise((resolve) => {
                            node.resolve(token).then(() => resolve(node.tooltip));
                        });
                    },
                markdownNotSupportedFallback: resource ? undefined : (label ?? '') // Passing undefined as the fallback for a resource falls back to the old native hover
            };
        }
        renderElement(element, index, templateData) {
            const node = element.element;
            const resource = node.resourceUri ? uri_1.URI.revive(node.resourceUri) : null;
            const treeItemLabel = node.label ? node.label : (resource ? { label: (0, resources_1.basename)(resource) } : undefined);
            const description = (0, types_1.isString)(node.description) ? node.description : resource && node.description === true ? this.labelService.getUriLabel((0, resources_1.dirname)(resource), { relative: true }) : undefined;
            const label = treeItemLabel ? treeItemLabel.label : undefined;
            const matches = (treeItemLabel && treeItemLabel.highlights && label) ? treeItemLabel.highlights.map(([start, end]) => {
                if (start < 0) {
                    start = label.length + start;
                }
                if (end < 0) {
                    end = label.length + end;
                }
                if ((start >= label.length) || (end > label.length)) {
                    return ({ start: 0, end: 0 });
                }
                if (start > end) {
                    const swap = start;
                    start = end;
                    end = swap;
                }
                return ({ start, end });
            }) : undefined;
            const icon = this.themeService.getColorTheme().type === theme_1.ColorScheme.LIGHT ? node.icon : node.iconDark;
            const iconUrl = icon ? uri_1.URI.revive(icon) : undefined;
            const title = this.getHover(label, resource, node);
            // reset
            templateData.actionBar.clear();
            templateData.icon.style.color = '';
            let commandEnabled = true;
            if (node.command) {
                commandEnabled = isTreeCommandEnabled(node.command, this.contextKeyService);
            }
            this.renderCheckbox(node, templateData);
            if (resource) {
                const fileDecorations = this.configurationService.getValue('explorer.decorations');
                const labelResource = resource ? resource : uri_1.URI.parse('missing:_icon_resource');
                templateData.resourceLabel.setResource({ name: label, description, resource: labelResource }, {
                    fileKind: this.getFileKind(node),
                    title,
                    hideIcon: this.shouldHideResourceLabelIcon(iconUrl, node.themeIcon),
                    fileDecorations,
                    extraClasses: ['custom-view-tree-node-item-resourceLabel'],
                    matches: matches ? matches : (0, filters_1.createMatches)(element.filterData),
                    strikethrough: treeItemLabel?.strikethrough,
                    disabledCommand: !commandEnabled,
                    labelEscapeNewLines: true,
                    forceLabel: !!node.label
                });
            }
            else {
                templateData.resourceLabel.setResource({ name: label, description }, {
                    title,
                    hideIcon: true,
                    extraClasses: ['custom-view-tree-node-item-resourceLabel'],
                    matches: matches ? matches : (0, filters_1.createMatches)(element.filterData),
                    strikethrough: treeItemLabel?.strikethrough,
                    disabledCommand: !commandEnabled,
                    labelEscapeNewLines: true
                });
            }
            if (iconUrl) {
                templateData.icon.className = 'custom-view-tree-node-item-icon';
                templateData.icon.style.backgroundImage = DOM.asCSSUrl(iconUrl);
            }
            else {
                let iconClass;
                if (this.shouldShowThemeIcon(!!resource, node.themeIcon)) {
                    iconClass = themables_1.ThemeIcon.asClassName(node.themeIcon);
                    if (node.themeIcon.color) {
                        templateData.icon.style.color = this.themeService.getColorTheme().getColor(node.themeIcon.color.id)?.toString() ?? '';
                    }
                }
                templateData.icon.className = iconClass ? `custom-view-tree-node-item-icon ${iconClass}` : '';
                templateData.icon.style.backgroundImage = '';
            }
            if (!commandEnabled) {
                templateData.icon.className = templateData.icon.className + ' disabled';
                if (templateData.container.parentElement) {
                    templateData.container.parentElement.className = templateData.container.parentElement.className + ' disabled';
                }
            }
            templateData.actionBar.context = { $treeViewId: this.treeViewId, $treeItemHandle: node.handle };
            const menuActions = this.menus.getResourceActions(node);
            if (menuActions.menu) {
                templateData.elementDisposable.add(menuActions.menu);
            }
            templateData.actionBar.push(menuActions.actions, { icon: true, label: false });
            if (this._actionRunner) {
                templateData.actionBar.actionRunner = this._actionRunner;
            }
            this.setAlignment(templateData.container, node);
            this.treeViewsService.addRenderedTreeItemElement(node, templateData.container);
            // remember rendered element
            this._renderedElements.set(element.element.handle, { original: element, rendered: templateData });
        }
        rerender() {
            // As we add items to the map during this call we can't directly use the map in the for loop
            // but have to create a copy of the keys first
            const keys = new Set(this._renderedElements.keys());
            for (const key of keys) {
                const value = this._renderedElements.get(key);
                if (value) {
                    this.disposeElement(value.original, 0, value.rendered);
                    this.renderElement(value.original, 0, value.rendered);
                }
            }
        }
        renderCheckbox(node, templateData) {
            if (node.checkbox) {
                // The first time we find a checkbox we want to rerender the visible tree to adapt the alignment
                if (!this._hasCheckbox) {
                    this._hasCheckbox = true;
                    this.rerender();
                }
                if (!templateData.checkbox) {
                    const checkbox = new checkbox_1.TreeItemCheckbox(templateData.checkboxContainer, this.checkboxStateHandler, this._hoverDelegate);
                    templateData.checkbox = checkbox;
                }
                templateData.checkbox.render(node);
            }
            else if (templateData.checkbox) {
                templateData.checkbox.dispose();
                templateData.checkbox = undefined;
            }
        }
        setAlignment(container, treeItem) {
            container.parentElement.classList.toggle('align-icon-with-twisty', !this._hasCheckbox && this.aligner.alignIconWithTwisty(treeItem));
        }
        shouldHideResourceLabelIcon(iconUrl, icon) {
            // We always hide the resource label in favor of the iconUrl when it's provided.
            // When `ThemeIcon` is provided, we hide the resource label icon in favor of it only if it's a not a file icon.
            return (!!iconUrl || (!!icon && !this.isFileKindThemeIcon(icon)));
        }
        shouldShowThemeIcon(hasResource, icon) {
            if (!icon) {
                return false;
            }
            // If there's a resource and the icon is a file icon, then the icon (or lack thereof) will already be coming from the
            // icon theme and should use whatever the icon theme has provided.
            return !(hasResource && this.isFileKindThemeIcon(icon));
        }
        isFolderThemeIcon(icon) {
            return icon?.id === themeService_1.FolderThemeIcon.id;
        }
        isFileKindThemeIcon(icon) {
            if (icon) {
                return icon.id === themeService_1.FileThemeIcon.id || this.isFolderThemeIcon(icon);
            }
            else {
                return false;
            }
        }
        getFileKind(node) {
            if (node.themeIcon) {
                switch (node.themeIcon.id) {
                    case themeService_1.FileThemeIcon.id:
                        return files_1.FileKind.FILE;
                    case themeService_1.FolderThemeIcon.id:
                        return files_1.FileKind.FOLDER;
                }
            }
            return node.collapsibleState === views_1.TreeItemCollapsibleState.Collapsed || node.collapsibleState === views_1.TreeItemCollapsibleState.Expanded ? files_1.FileKind.FOLDER : files_1.FileKind.FILE;
        }
        updateCheckboxes(items) {
            const additionalItems = [];
            if (!this.manuallyManageCheckboxes) {
                for (const item of items) {
                    if (item.checkbox !== undefined) {
                        function checkChildren(currentItem) {
                            for (const child of (currentItem.children ?? [])) {
                                if ((child.checkbox !== undefined) && (currentItem.checkbox !== undefined) && (child.checkbox.isChecked !== currentItem.checkbox.isChecked)) {
                                    child.checkbox.isChecked = currentItem.checkbox.isChecked;
                                    additionalItems.push(child);
                                    checkChildren(child);
                                }
                            }
                        }
                        checkChildren(item);
                        const visitedParents = new Set();
                        function checkParents(currentItem) {
                            if (currentItem.parent && (currentItem.parent.checkbox !== undefined) && currentItem.parent.children) {
                                if (visitedParents.has(currentItem.parent)) {
                                    return;
                                }
                                else {
                                    visitedParents.add(currentItem.parent);
                                }
                                let someUnchecked = false;
                                let someChecked = false;
                                for (const child of currentItem.parent.children) {
                                    if (someUnchecked && someChecked) {
                                        break;
                                    }
                                    if (child.checkbox !== undefined) {
                                        if (child.checkbox.isChecked) {
                                            someChecked = true;
                                        }
                                        else {
                                            someUnchecked = true;
                                        }
                                    }
                                }
                                if (someChecked && !someUnchecked && (currentItem.parent.checkbox.isChecked !== true)) {
                                    currentItem.parent.checkbox.isChecked = true;
                                    additionalItems.push(currentItem.parent);
                                    checkParents(currentItem.parent);
                                }
                                else if (someUnchecked && (currentItem.parent.checkbox.isChecked !== false)) {
                                    currentItem.parent.checkbox.isChecked = false;
                                    additionalItems.push(currentItem.parent);
                                    checkParents(currentItem.parent);
                                }
                            }
                        }
                        checkParents(item);
                    }
                }
            }
            items = items.concat(additionalItems);
            items.forEach(item => {
                const renderedItem = this._renderedElements.get(item.handle);
                if (renderedItem) {
                    renderedItem.rendered.checkbox?.render(item);
                }
            });
            this._onDidChangeCheckboxState.fire(items);
        }
        disposeElement(resource, index, templateData) {
            templateData.elementDisposable.clear();
            this._renderedElements.delete(resource.element.handle);
            this.treeViewsService.removeRenderedTreeItemElement(resource.element);
            templateData.checkbox?.dispose();
            templateData.checkbox = undefined;
        }
        disposeTemplate(templateData) {
            templateData.resourceLabel.dispose();
            templateData.actionBar.dispose();
            templateData.elementDisposable.dispose();
        }
    };
    TreeRenderer = TreeRenderer_1 = __decorate([
        __param(7, themeService_1.IThemeService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, label_1.ILabelService),
        __param(10, hover_1.IHoverService),
        __param(11, treeViewsService_1.ITreeViewsService),
        __param(12, contextkey_1.IContextKeyService)
    ], TreeRenderer);
    class Aligner extends lifecycle_1.Disposable {
        constructor(themeService) {
            super();
            this.themeService = themeService;
        }
        set tree(tree) {
            this._tree = tree;
        }
        alignIconWithTwisty(treeItem) {
            if (treeItem.collapsibleState !== views_1.TreeItemCollapsibleState.None) {
                return false;
            }
            if (!this.hasIcon(treeItem)) {
                return false;
            }
            if (this._tree) {
                const parent = this._tree.getParentElement(treeItem) || this._tree.getInput();
                if (this.hasIcon(parent)) {
                    return !!parent.children && parent.children.some(c => c.collapsibleState !== views_1.TreeItemCollapsibleState.None && !this.hasIcon(c));
                }
                return !!parent.children && parent.children.every(c => c.collapsibleState === views_1.TreeItemCollapsibleState.None || !this.hasIcon(c));
            }
            else {
                return false;
            }
        }
        hasIcon(node) {
            const icon = this.themeService.getColorTheme().type === theme_1.ColorScheme.LIGHT ? node.icon : node.iconDark;
            if (icon) {
                return true;
            }
            if (node.resourceUri || node.themeIcon) {
                const fileIconTheme = this.themeService.getFileIconTheme();
                const isFolder = node.themeIcon ? node.themeIcon.id === themeService_1.FolderThemeIcon.id : node.collapsibleState !== views_1.TreeItemCollapsibleState.None;
                if (isFolder) {
                    return fileIconTheme.hasFileIcons && fileIconTheme.hasFolderIcons;
                }
                return fileIconTheme.hasFileIcons;
            }
            return false;
        }
    }
    class MultipleSelectionActionRunner extends actions_1.ActionRunner {
        constructor(notificationService, getSelectedResources) {
            super();
            this.getSelectedResources = getSelectedResources;
            this._register(this.onDidRun(e => {
                if (e.error && !(0, errors_1.isCancellationError)(e.error)) {
                    notificationService.error((0, nls_1.localize)('command-error', 'Error running command {1}: {0}. This is likely caused by the extension that contributes {1}.', e.error.message, e.action.id));
                }
            }));
        }
        async runAction(action, context) {
            const selection = this.getSelectedResources();
            let selectionHandleArgs = undefined;
            let actionInSelected = false;
            if (selection.length > 1) {
                selectionHandleArgs = selection.map(selected => {
                    if ((selected.handle === context.$treeItemHandle) || context.$selectedTreeItems) {
                        actionInSelected = true;
                    }
                    return { $treeViewId: context.$treeViewId, $treeItemHandle: selected.handle };
                });
            }
            if (!actionInSelected) {
                selectionHandleArgs = undefined;
            }
            await action.run(context, selectionHandleArgs);
        }
    }
    let TreeMenus = class TreeMenus extends lifecycle_1.Disposable {
        constructor(id, menuService) {
            super();
            this.id = id;
            this.menuService = menuService;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
        }
        /**
         * Caller is now responsible for disposing of the menu!
         */
        getResourceActions(element) {
            const actions = this.getActions(actions_2.MenuId.ViewItemContext, element, true);
            return { menu: actions.menu, actions: actions.primary };
        }
        getResourceContextActions(element) {
            return this.getActions(actions_2.MenuId.ViewItemContext, element).secondary;
        }
        setContextKeyService(service) {
            this.contextKeyService = service;
        }
        getActions(menuId, element, listen = false) {
            if (!this.contextKeyService) {
                return { primary: [], secondary: [] };
            }
            const contextKeyService = this.contextKeyService.createOverlay([
                ['view', this.id],
                ['viewItem', element.contextValue]
            ]);
            const menu = this.menuService.createMenu(menuId, contextKeyService);
            const primary = [];
            const secondary = [];
            const result = { primary, secondary, menu };
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true }, result, 'inline');
            if (listen) {
                this._register(menu.onDidChange(() => this._onDidChange.fire(element)));
            }
            else {
                menu.dispose();
            }
            return result;
        }
        dispose() {
            this.contextKeyService = undefined;
            super.dispose();
        }
    };
    TreeMenus = __decorate([
        __param(1, actions_2.IMenuService)
    ], TreeMenus);
    let CustomTreeView = class CustomTreeView extends AbstractTreeView {
        constructor(id, title, extensionId, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, contextKeyService, hoverService, extensionService, activityService, telemetryService, logService) {
            super(id, title, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, hoverService, contextKeyService, activityService, logService);
            this.extensionId = extensionId;
            this.extensionService = extensionService;
            this.telemetryService = telemetryService;
            this.activated = false;
        }
        activate() {
            if (!this.activated) {
                this.telemetryService.publicLog2('Extension:ViewActivate', {
                    extensionId: new telemetryUtils_1.TelemetryTrustedValue(this.extensionId),
                    id: this.id,
                });
                this.createTree();
                this.progressService.withProgress({ location: this.id }, () => this.extensionService.activateByEvent(`onView:${this.id}`))
                    .then(() => (0, async_1.timeout)(2000))
                    .then(() => {
                    this.updateMessage();
                });
                this.activated = true;
            }
        }
    };
    exports.CustomTreeView = CustomTreeView;
    exports.CustomTreeView = CustomTreeView = __decorate([
        __param(3, themeService_1.IThemeService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, commands_1.ICommandService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, progress_1.IProgressService),
        __param(8, contextView_1.IContextMenuService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, notification_1.INotificationService),
        __param(11, views_1.IViewDescriptorService),
        __param(12, contextkey_1.IContextKeyService),
        __param(13, hover_1.IHoverService),
        __param(14, extensions_1.IExtensionService),
        __param(15, activity_1.IActivityService),
        __param(16, telemetry_1.ITelemetryService),
        __param(17, log_1.ILogService)
    ], CustomTreeView);
    class TreeView extends AbstractTreeView {
        constructor() {
            super(...arguments);
            this.activated = false;
        }
        activate() {
            if (!this.activated) {
                this.createTree();
                this.activated = true;
            }
        }
    }
    exports.TreeView = TreeView;
    let CustomTreeViewDragAndDrop = class CustomTreeViewDragAndDrop {
        constructor(treeId, labelService, instantiationService, treeViewsDragAndDropService, logService) {
            this.treeId = treeId;
            this.labelService = labelService;
            this.instantiationService = instantiationService;
            this.treeViewsDragAndDropService = treeViewsDragAndDropService;
            this.logService = logService;
            this.treeItemsTransfer = dnd_3.LocalSelectionTransfer.getInstance();
            this.treeMimeType = `application/vnd.code.tree.${treeId.toLowerCase()}`;
        }
        set controller(controller) {
            this.dndController = controller;
        }
        handleDragAndLog(dndController, itemHandles, uuid, dragCancellationToken) {
            return dndController.handleDrag(itemHandles, uuid, dragCancellationToken).then(additionalDataTransfer => {
                if (additionalDataTransfer) {
                    const unlistedTypes = [];
                    for (const item of additionalDataTransfer) {
                        if ((item[0] !== this.treeMimeType) && (dndController.dragMimeTypes.findIndex(value => value === item[0]) < 0)) {
                            unlistedTypes.push(item[0]);
                        }
                    }
                    if (unlistedTypes.length) {
                        this.logService.warn(`Drag and drop controller for tree ${this.treeId} adds the following data transfer types but does not declare them in dragMimeTypes: ${unlistedTypes.join(', ')}`);
                    }
                }
                return additionalDataTransfer;
            });
        }
        addExtensionProvidedTransferTypes(originalEvent, itemHandles) {
            if (!originalEvent.dataTransfer || !this.dndController) {
                return;
            }
            const uuid = (0, uuid_1.generateUuid)();
            this.dragCancellationToken = new cancellation_1.CancellationTokenSource();
            this.treeViewsDragAndDropService.addDragOperationTransfer(uuid, this.handleDragAndLog(this.dndController, itemHandles, uuid, this.dragCancellationToken.token));
            this.treeItemsTransfer.setData([new treeViewsDnd_1.DraggedTreeItemsIdentifier(uuid)], treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype);
            originalEvent.dataTransfer.clearData(mime_1.Mimes.text);
            if (this.dndController.dragMimeTypes.find((element) => element === mime_1.Mimes.uriList)) {
                // Add the type that the editor knows
                originalEvent.dataTransfer?.setData(dnd_1.DataTransfers.RESOURCES, '');
            }
            this.dndController.dragMimeTypes.forEach(supportedType => {
                originalEvent.dataTransfer?.setData(supportedType, '');
            });
        }
        addResourceInfoToTransfer(originalEvent, resources) {
            if (resources.length && originalEvent.dataTransfer) {
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.instantiationService.invokeFunction(accessor => (0, dnd_2.fillEditorsDragData)(accessor, resources, originalEvent));
                // The only custom data transfer we set from the explorer is a file transfer
                // to be able to DND between multiple code file explorers across windows
                const fileResources = resources.filter(s => s.scheme === network_1.Schemas.file).map(r => r.fsPath);
                if (fileResources.length) {
                    originalEvent.dataTransfer.setData(dnd_3.CodeDataTransfers.FILES, JSON.stringify(fileResources));
                }
            }
        }
        onDragStart(data, originalEvent) {
            if (originalEvent.dataTransfer) {
                const treeItemsData = data.getData();
                const resources = [];
                const sourceInfo = {
                    id: this.treeId,
                    itemHandles: []
                };
                treeItemsData.forEach(item => {
                    sourceInfo.itemHandles.push(item.handle);
                    if (item.resourceUri) {
                        resources.push(uri_1.URI.revive(item.resourceUri));
                    }
                });
                this.addResourceInfoToTransfer(originalEvent, resources);
                this.addExtensionProvidedTransferTypes(originalEvent, sourceInfo.itemHandles);
                originalEvent.dataTransfer.setData(this.treeMimeType, JSON.stringify(sourceInfo));
            }
        }
        debugLog(types) {
            if (types.size) {
                this.logService.debug(`TreeView dragged mime types: ${Array.from(types).join(', ')}`);
            }
            else {
                this.logService.debug(`TreeView dragged with no supported mime types.`);
            }
        }
        onDragOver(data, targetElement, targetIndex, originalEvent) {
            const dataTransfer = (0, dnd_4.toExternalVSDataTransfer)(originalEvent.dataTransfer);
            const types = new Set(Array.from(dataTransfer, x => x[0]));
            if (originalEvent.dataTransfer) {
                // Also add uri-list if we have any files. At this stage we can't actually access the file itself though.
                for (const item of originalEvent.dataTransfer.items) {
                    if (item.kind === 'file' || item.type === dnd_1.DataTransfers.RESOURCES.toLowerCase()) {
                        types.add(mime_1.Mimes.uriList);
                        break;
                    }
                }
            }
            this.debugLog(types);
            const dndController = this.dndController;
            if (!dndController || !originalEvent.dataTransfer || (dndController.dropMimeTypes.length === 0)) {
                return false;
            }
            const dragContainersSupportedType = Array.from(types).some((value, index) => {
                if (value === this.treeMimeType) {
                    return true;
                }
                else {
                    return dndController.dropMimeTypes.indexOf(value) >= 0;
                }
            });
            if (dragContainersSupportedType) {
                return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, autoExpand: true };
            }
            return false;
        }
        getDragURI(element) {
            if (!this.dndController) {
                return null;
            }
            return element.resourceUri ? uri_1.URI.revive(element.resourceUri).toString() : element.handle;
        }
        getDragLabel(elements) {
            if (!this.dndController) {
                return undefined;
            }
            if (elements.length > 1) {
                return String(elements.length);
            }
            const element = elements[0];
            return element.label ? element.label.label : (element.resourceUri ? this.labelService.getUriLabel(uri_1.URI.revive(element.resourceUri)) : undefined);
        }
        async drop(data, targetNode, targetIndex, originalEvent) {
            const dndController = this.dndController;
            if (!originalEvent.dataTransfer || !dndController) {
                return;
            }
            let treeSourceInfo;
            let willDropUuid;
            if (this.treeItemsTransfer.hasData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype)) {
                willDropUuid = this.treeItemsTransfer.getData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype)[0].identifier;
            }
            const originalDataTransfer = (0, dnd_4.toExternalVSDataTransfer)(originalEvent.dataTransfer, true);
            const outDataTransfer = new dataTransfer_1.VSDataTransfer();
            for (const [type, item] of originalDataTransfer) {
                if (type === this.treeMimeType || dndController.dropMimeTypes.includes(type) || (item.asFile() && dndController.dropMimeTypes.includes(dnd_1.DataTransfers.FILES.toLowerCase()))) {
                    outDataTransfer.append(type, item);
                    if (type === this.treeMimeType) {
                        try {
                            treeSourceInfo = JSON.parse(await item.asString());
                        }
                        catch {
                            // noop
                        }
                    }
                }
            }
            const additionalDataTransfer = await this.treeViewsDragAndDropService.removeDragOperationTransfer(willDropUuid);
            if (additionalDataTransfer) {
                for (const [type, item] of additionalDataTransfer) {
                    outDataTransfer.append(type, item);
                }
            }
            return dndController.handleDrop(outDataTransfer, targetNode, cancellation_1.CancellationToken.None, willDropUuid, treeSourceInfo?.id, treeSourceInfo?.itemHandles);
        }
        onDragEnd(originalEvent) {
            // Check if the drag was cancelled.
            if (originalEvent.dataTransfer?.dropEffect === 'none') {
                this.dragCancellationToken?.cancel();
            }
        }
    };
    exports.CustomTreeViewDragAndDrop = CustomTreeViewDragAndDrop;
    exports.CustomTreeViewDragAndDrop = CustomTreeViewDragAndDrop = __decorate([
        __param(1, label_1.ILabelService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, treeViewsDndService_1.ITreeViewsDnDService),
        __param(4, log_1.ILogService)
    ], CustomTreeViewDragAndDrop);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZVZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy92aWV3cy90cmVlVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeUV6RixJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFhLFNBQVEsbUJBQVE7UUFNekMsWUFDQyxPQUE0QixFQUNSLGlCQUFxQyxFQUNwQyxrQkFBdUMsRUFDckMsb0JBQTJDLEVBQzlDLGlCQUFxQyxFQUNqQyxxQkFBNkMsRUFDOUMsb0JBQTJDLEVBQ2xELGFBQTZCLEVBQzlCLFlBQTJCLEVBQ3ZCLGdCQUFtQyxFQUNoQyxtQkFBeUM7WUFFL0QsS0FBSyxDQUFDLEVBQUUsR0FBSSxPQUE0QixFQUFFLFdBQVcsRUFBRSxnQkFBTSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBRSxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDaFIsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUF5QixtQkFBUSxDQUFDLEVBQUUsQ0FBaUIsa0JBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBRSxDQUFDO1lBQ3RILElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JB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