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
define(["require", "exports", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/tree/treeDefaults", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/common/dataTransfer", "vs/nls!vs/workbench/browser/parts/views/treeView", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/theme", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/browser/dnd", "vs/workbench/browser/labels", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/services/activity/common/activity", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/hover/browser/hover", "vs/workbench/services/views/browser/treeViewsService", "vs/platform/dnd/browser/dnd", "vs/editor/browser/dnd", "vs/workbench/browser/parts/views/checkbox", "vs/base/common/platform", "vs/platform/telemetry/common/telemetryUtils", "vs/editor/common/services/treeViewsDndService", "vs/editor/common/services/treeViewsDnd", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/css!./media/views"], function (require, exports, dnd_1, DOM, markdownRenderer_1, actionbar_1, actionViewItems_1, treeDefaults_1, actions_1, async_1, cancellation_1, codicons_1, errors_1, event_1, filters_1, htmlContent_1, lifecycle_1, mime_1, network_1, resources_1, strings_1, types_1, uri_1, uuid_1, dataTransfer_1, nls_1, menuEntryActionViewItem_1, actions_2, commands_1, configuration_1, contextkey_1, contextView_1, files_1, instantiation_1, keybinding_1, label_1, listService_1, log_1, notification_1, opener_1, progress_1, platform_1, telemetry_1, theme_1, themeService_1, themables_1, dnd_2, labels_1, editorCommands_1, viewPane_1, theme_2, views_1, activity_1, extensions_1, hover_1, treeViewsService_1, dnd_3, dnd_4, checkbox_1, platform_2, telemetryUtils_1, treeViewsDndService_1, treeViewsDnd_1, markdownRenderer_2) {
    "use strict";
    var TreeRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$ub = exports.$0ub = exports.$9ub = exports.$8ub = exports.$7ub = void 0;
    let $7ub = class $7ub extends viewPane_1.$Ieb {
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService) {
            super({ ...options, titleMenuId: actions_2.$Ru.ViewTitle, donotForwardArgs: false }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            const { treeView } = platform_1.$8m.as(views_1.Extensions.ViewsRegistry).getView(options.id);
            this.f = treeView;
            this.B(this.f.onDidChangeActions(() => this.Ub(), this));
            this.B(this.f.onDidChangeTitle((newTitle) => this.Jb(newTitle)));
            this.B(this.f.onDidChangeDescription((newDescription) => this.Lb(newDescription)));
            this.B((0, lifecycle_1.$ic)(() => {
                if (this.g && this.f.container && (this.g === this.f.container)) {
                    this.f.setVisibility(false);
                }
            }));
            this.B(this.onDidChangeBodyVisibility(() => this.L()));
            this.B(this.f.onDidChangeWelcomeState(() => this.db.fire()));
            if (options.title !== this.f.title) {
                this.Jb(this.f.title);
            }
            if (options.titleDescription !== this.f.description) {
                this.Lb(this.f.description);
            }
            this.h = new MultipleSelectionActionRunner(notificationService, () => this.f.getSelection());
            this.L();
        }
        focus() {
            super.focus();
            this.f.focus();
        }
        U(container) {
            this.g = container;
            super.U(container);
            this.n(container);
        }
        shouldShowWelcome() {
            return ((this.f.dataProvider === undefined) || !!this.f.dataProvider.isTreeEmpty) && ((this.f.message === undefined) || (this.f.message === ''));
        }
        W(height, width) {
            super.W(height, width);
            this.t(height, width);
        }
        getOptimalWidth() {
            return this.f.getOptimalWidth();
        }
        n(container) {
            this.f.show(container);
        }
        t(height, width) {
            this.f.layout(height, width);
        }
        L() {
            this.f.setVisibility(this.isBodyVisible());
        }
        getActionRunner() {
            return this.h;
        }
        getActionsContext() {
            return { $treeViewId: this.id, $focusedTreeItem: true, $selectedTreeItems: true };
        }
    };
    exports.$7ub = $7ub;
    exports.$7ub = $7ub = __decorate([
        __param(1, keybinding_1.$2D),
        __param(2, contextView_1.$WZ),
        __param(3, configuration_1.$8h),
        __param(4, contextkey_1.$3i),
        __param(5, views_1.$_E),
        __param(6, instantiation_1.$Ah),
        __param(7, opener_1.$NT),
        __param(8, themeService_1.$gv),
        __param(9, telemetry_1.$9k),
        __param(10, notification_1.$Yu)
    ], $7ub);
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
        const command = commands_1.$Gr.getCommand(treeCommand.originalId ? treeCommand.originalId : treeCommand.id);
        if (command) {
            const commandAction = actions_2.$Tu.getCommand(command.id);
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
    const noDataProviderMessage = (0, nls_1.localize)(0, null);
    exports.$8ub = new contextkey_1.$2i('customTreeView', false);
    class Tree extends listService_1.$w4 {
    }
    let AbstractTreeView = class AbstractTreeView extends lifecycle_1.$kc {
        constructor(id, cb, db, eb, fb, gb, hb, ib, jb, kb, lb, mb, nb, ob, pb) {
            super();
            this.id = id;
            this.cb = cb;
            this.db = db;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.jb = jb;
            this.kb = kb;
            this.lb = lb;
            this.mb = mb;
            this.nb = nb;
            this.ob = ob;
            this.pb = pb;
            this.a = false;
            this.b = false;
            this.f = false;
            this.u = false;
            this.C = false;
            this.D = false;
            this.N = [];
            this.O = [];
            this.Q = this.B(new event_1.$fd());
            this.onDidExpandItem = this.Q.event;
            this.R = this.B(new event_1.$fd());
            this.onDidCollapseItem = this.R.event;
            this.S = this.B(new event_1.$fd());
            this.onDidChangeSelectionAndFocus = this.S.event;
            this.U = this.B(new event_1.$fd());
            this.onDidChangeVisibility = this.U.event;
            this.W = this.B(new event_1.$fd());
            this.onDidChangeActions = this.W.event;
            this.X = this.B(new event_1.$fd());
            this.onDidChangeWelcomeState = this.X.event;
            this.Y = this.B(new event_1.$fd());
            this.onDidChangeTitle = this.Y.event;
            this.Z = this.B(new event_1.$fd());
            this.onDidChangeDescription = this.Z.event;
            this.ab = this.B(new event_1.$fd());
            this.onDidChangeCheckboxState = this.ab.event;
            this.bb = this.B(new event_1.$fd());
            this.qb = false;
            this.Kb = 0;
            this.Lb = 0;
            this.Mb = false;
            this.L = new Root();
            this.P = this.L;
            // Try not to add anything that could be costly to this constructor. It gets called once per tree view
            // during startup, and anything added here can affect performance.
        }
        rb() {
            if (this.qb) {
                return;
            }
            this.qb = true;
            // Remember when adding to this method that it isn't called until the the view is visible, meaning that
            // properties could be set and events could be fired before we're initialized and that this needs to be handled.
            this.nb.bufferChangeEvents(() => {
                this.yb();
                this.Ob();
                this.zb();
            });
            this.I = this.eb.createInstance($$ub, this.id);
            if (this.sb) {
                this.I.controller = this.sb;
            }
            this.B(this.gb.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('explorer.decorations')) {
                    this.Nb([this.L]); /** soft refresh **/
                }
            }));
            this.B(this.lb.onDidChangeLocation(({ views, from, to }) => {
                if (views.some(v => v.id === this.id)) {
                    this.G?.updateOptions({ overrideStyles: { listBackground: this.viewLocation === 1 /* ViewContainerLocation.Panel */ ? theme_2.$L_ : theme_2.$Iab } });
                }
            }));
            this.Ab();
            this.Cb();
        }
        get viewContainer() {
            return this.lb.getViewContainerByViewId(this.id);
        }
        get viewLocation() {
            return this.lb.getViewLocationById(this.id);
        }
        get dragAndDropController() {
            return this.sb;
        }
        set dragAndDropController(dnd) {
            this.sb = dnd;
            if (this.I) {
                this.I.controller = dnd;
            }
        }
        get dataProvider() {
            return this.tb;
        }
        set dataProvider(dataProvider) {
            if (dataProvider) {
                const self = this;
                this.tb = new class {
                    constructor() {
                        this.a = true;
                        this.b = new event_1.$fd();
                        this.onDidChangeEmpty = this.b.event;
                    }
                    get isTreeEmpty() {
                        return this.a;
                    }
                    async getChildren(node) {
                        let children;
                        const checkboxesUpdated = [];
                        if (node && node.children) {
                            children = node.children;
                        }
                        else {
                            node = node ?? self.L;
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
                            const oldEmpty = this.a;
                            this.a = children.length === 0;
                            if (oldEmpty !== this.a) {
                                this.b.fire();
                            }
                        }
                        if (checkboxesUpdated.length > 0) {
                            self.ab.fire(checkboxesUpdated);
                        }
                        return children;
                    }
                };
                if (this.tb.onDidChangeEmpty) {
                    this.B(this.tb.onDidChangeEmpty(() => {
                        this.Pb();
                        this.X.fire();
                    }));
                }
                this.Gb();
                this.refresh();
            }
            else {
                this.tb = undefined;
                this.Gb();
            }
            this.X.fire();
        }
        get message() {
            return this.ub;
        }
        set message(message) {
            this.ub = message;
            this.Gb();
            this.X.fire();
        }
        get title() {
            return this.cb;
        }
        set title(name) {
            this.cb = name;
            this.Y.fire(this.cb);
        }
        get description() {
            return this.vb;
        }
        set description(description) {
            this.vb = description;
            this.Z.fire(this.vb);
        }
        get badge() {
            return this.wb;
        }
        set badge(badge) {
            if (this.wb?.value === badge?.value &&
                this.wb?.tooltip === badge?.tooltip) {
                return;
            }
            if (this.xb) {
                this.xb.dispose();
                this.xb = undefined;
            }
            this.wb = badge;
            if (badge) {
                const activity = {
                    badge: new activity_1.$IV(badge.value, () => badge.tooltip),
                    priority: 50
                };
                this.xb = this.ob.showViewActivity(this.id, activity);
            }
        }
        get canSelectMany() {
            return this.C;
        }
        set canSelectMany(canSelectMany) {
            const oldCanSelectMany = this.C;
            this.C = canSelectMany;
            if (this.C !== oldCanSelectMany) {
                this.G?.updateOptions({ multipleSelectionSupport: this.canSelectMany });
            }
        }
        get manuallyManageCheckboxes() {
            return this.D;
        }
        set manuallyManageCheckboxes(manuallyManageCheckboxes) {
            this.D = manuallyManageCheckboxes;
        }
        get hasIconForParentNode() {
            return this.b;
        }
        get hasIconForLeafNode() {
            return this.f;
        }
        get visible() {
            return this.a;
        }
        yb(startingValue = false) {
            if (!this.h) {
                this.g = new contextkey_1.$2i(`treeView.${this.id}.enableCollapseAll`, startingValue, (0, nls_1.localize)(1, null, this.id));
                this.h = this.g.bindTo(this.nb);
            }
            return true;
        }
        get showCollapseAllAction() {
            this.yb();
            return !!this.h?.get();
        }
        set showCollapseAllAction(showCollapseAllAction) {
            this.yb(showCollapseAllAction);
            this.h?.set(showCollapseAllAction);
        }
        zb(startingValue = false) {
            if (!this.t) {
                this.n = new contextkey_1.$2i(`treeView.${this.id}.enableRefresh`, startingValue, (0, nls_1.localize)(2, null, this.id));
                this.t = this.n.bindTo(this.nb);
            }
        }
        get showRefreshAction() {
            this.zb();
            return !!this.t?.get();
        }
        set showRefreshAction(showRefreshAction) {
            this.zb(showRefreshAction);
            this.t?.set(showRefreshAction);
        }
        Ab() {
            const that = this;
            this.B((0, actions_2.$Xu)(class extends actions_2.$Wu {
                constructor() {
                    super({
                        id: `workbench.actions.treeView.${that.id}.refresh`,
                        title: (0, nls_1.localize)(3, null),
                        menu: {
                            id: actions_2.$Ru.ViewTitle,
                            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', that.id), that.n),
                            group: 'navigation',
                            order: Number.MAX_SAFE_INTEGER - 1,
                        },
                        icon: codicons_1.$Pj.refresh
                    });
                }
                async run() {
                    return that.refresh();
                }
            }));
            this.B((0, actions_2.$Xu)(class extends actions_2.$Wu {
                constructor() {
                    super({
                        id: `workbench.actions.treeView.${that.id}.collapseAll`,
                        title: (0, nls_1.localize)(4, null),
                        menu: {
                            id: actions_2.$Ru.ViewTitle,
                            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', that.id), that.g),
                            group: 'navigation',
                            order: Number.MAX_SAFE_INTEGER,
                        },
                        precondition: that.j,
                        icon: codicons_1.$Pj.collapseAll
                    });
                }
                async run() {
                    if (that.G) {
                        return new treeDefaults_1.$sS(that.G, true).run();
                    }
                }
            }));
        }
        setVisibility(isVisible) {
            // Throughout setVisibility we need to check if the tree view's data provider still exists.
            // This can happen because the `getChildren` call to the extension can return
            // after the tree has been disposed.
            this.rb();
            isVisible = !!isVisible;
            if (this.a === isVisible) {
                return;
            }
            this.a = isVisible;
            if (this.G) {
                if (this.a) {
                    DOM.$dP(this.G.getHTMLElement());
                }
                else {
                    DOM.$eP(this.G.getHTMLElement()); // make sure the tree goes out of the tabindex world by hiding it
                }
                if (this.a && this.N.length && this.dataProvider) {
                    this.Nb(this.N);
                    this.N = [];
                }
            }
            (0, platform_2.$A)(() => {
                if (this.dataProvider) {
                    this.U.fire(this.a);
                }
            });
            if (this.visible) {
                this.Bb();
            }
        }
        focus(reveal = true, revealItem) {
            if (this.G && this.L.children && this.L.children.length > 0) {
                // Make sure the current selected element is revealed
                const element = revealItem ?? this.G.getSelection()[0];
                if (element && reveal) {
                    this.G.reveal(element, 0.5);
                }
                // Pass Focus to Viewer
                this.G.domFocus();
            }
            else if (this.G && this.y && !this.y.classList.contains('hide')) {
                this.G.domFocus();
            }
            else {
                this.w.focus();
            }
        }
        show(container) {
            this.J = container;
            DOM.$0O(container, this.w);
        }
        Cb() {
            this.w = DOM.$('.tree-explorer-viewlet-tree-view');
            this.F = DOM.$0O(this.w, DOM.$('.message'));
            this.Gb();
            this.y = DOM.$0O(this.w, DOM.$('.customview-tree'));
            this.y.classList.add('file-icon-themable-tree', 'show-file-icons');
            const focusTracker = this.B(DOM.$8O(this.w));
            this.B(focusTracker.onDidFocus(() => this.u = true));
            this.B(focusTracker.onDidBlur(() => this.u = false));
        }
        Db() {
            const actionViewItemProvider = menuEntryActionViewItem_1.$F3.bind(undefined, this.eb);
            const treeMenus = this.B(this.eb.createInstance(TreeMenus, this.id));
            this.H = this.B(this.eb.createInstance(labels_1.$Llb, this));
            const dataSource = this.eb.createInstance(TreeDataSource, this, (task) => this.hb.withProgress({ location: this.id }, () => task));
            const aligner = new Aligner(this.db);
            const checkboxStateHandler = this.B(new checkbox_1.$5ub());
            const renderer = this.eb.createInstance(TreeRenderer, this.id, treeMenus, this.H, actionViewItemProvider, aligner, checkboxStateHandler, this.manuallyManageCheckboxes);
            this.B(renderer.onDidChangeCheckboxState(e => this.ab.fire(e)));
            const widgetAriaLabel = this.cb;
            this.G = this.B(this.eb.createInstance(Tree, this.id, this.y, new TreeViewDelegate(), [renderer], dataSource, {
                identityProvider: new TreeViewIdentityProvider(),
                accessibilityProvider: {
                    getAriaLabel(element) {
                        if (element.accessibilityInformation) {
                            return element.accessibilityInformation.label;
                        }
                        if ((0, types_1.$jf)(element.tooltip)) {
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
                        return item.label ? item.label.label : (item.resourceUri ? (0, resources_1.$fg)(uri_1.URI.revive(item.resourceUri)) : undefined);
                    }
                },
                expandOnlyOnTwistieClick: (e) => {
                    return !!e.command || !!e.checkbox || this.gb.getValue('workbench.tree.expandMode') === 'doubleClick';
                },
                collapseByDefault: (e) => {
                    return e.collapsibleState !== views_1.TreeItemCollapsibleState.Expanded;
                },
                multipleSelectionSupport: this.canSelectMany,
                dnd: this.I,
                overrideStyles: {
                    listBackground: this.viewLocation === 1 /* ViewContainerLocation.Panel */ ? theme_2.$L_ : theme_2.$Iab
                }
            }));
            treeMenus.setContextKeyService(this.G.contextKeyService);
            aligner.tree = this.G;
            const actionRunner = new MultipleSelectionActionRunner(this.kb, () => this.G.getSelection());
            renderer.actionRunner = actionRunner;
            this.G.contextKeyService.createKey(this.id, true);
            const customTreeKey = exports.$8ub.bindTo(this.G.contextKeyService);
            customTreeKey.set(true);
            this.B(this.G.onContextMenu(e => this.Fb(treeMenus, e, actionRunner)));
            this.B(this.G.onDidChangeSelection(e => {
                this.O = e.elements;
                this.P = this.G?.getFocus()[0] ?? this.P;
                this.S.fire({ selection: this.O, focus: this.P });
            }));
            this.B(this.G.onDidChangeFocus(e => {
                if (e.elements.length && (e.elements[0] !== this.P)) {
                    this.P = e.elements[0];
                    this.O = this.G?.getSelection() ?? this.O;
                    this.S.fire({ selection: this.O, focus: this.P });
                }
            }));
            this.B(this.G.onDidChangeCollapseState(e => {
                if (!e.node.element) {
                    return;
                }
                const element = Array.isArray(e.node.element.element) ? e.node.element.element[0] : e.node.element.element;
                if (e.node.collapsed) {
                    this.R.fire(element);
                }
                else {
                    this.Q.fire(element);
                }
            }));
            this.G.setInput(this.L).then(() => this.Qb());
            this.B(this.G.onDidOpen(async (e) => {
                if (!e.browserEvent) {
                    return;
                }
                if (e.browserEvent.target && e.browserEvent.target.classList.contains(checkbox_1.$6ub.checkboxClass)) {
                    return;
                }
                const selection = this.G.getSelection();
                const command = await this.Eb(selection.length === 1 ? selection[0] : undefined);
                if (command && isTreeCommandEnabled(command, this.nb)) {
                    let args = command.arguments || [];
                    if (command.id === editorCommands_1.$Wub || command.id === editorCommands_1.$Xub) {
                        // Some commands owned by us should receive the
                        // `IOpenEvent` as context to open properly
                        args = [...args, e];
                    }
                    try {
                        await this.fb.executeCommand(command.id, ...args);
                    }
                    catch (err) {
                        this.kb.error(err);
                    }
                }
            }));
            this.B(treeMenus.onDidChange((changed) => {
                if (this.G?.hasNode(changed)) {
                    this.G?.rerender(changed);
                }
            }));
        }
        async Eb(element) {
            let command = element?.command;
            if (element && !command) {
                if ((element instanceof views_1.$aF) && element.hasResolve) {
                    await element.resolve(new cancellation_1.$pd().token);
                    command = element.command;
                }
            }
            return command;
        }
        Fb(treeMenus, treeEvent, actionRunner) {
            this.mb.hideHover();
            const node = treeEvent.element;
            if (node === null) {
                return;
            }
            const event = treeEvent.browserEvent;
            event.preventDefault();
            event.stopPropagation();
            this.G.setFocus([node]);
            const actions = treeMenus.getResourceContextActions(node);
            if (!actions.length) {
                return;
            }
            this.ib.showContextMenu({
                getAnchor: () => treeEvent.anchor,
                getActions: () => actions,
                getActionViewItem: (action) => {
                    const keybinding = this.jb.lookupKeybinding(action.id);
                    if (keybinding) {
                        return new actionViewItems_1.$NQ(action, action, { label: true, keybinding: keybinding.getLabel() });
                    }
                    return undefined;
                },
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.G.domFocus();
                    }
                },
                getActionsContext: () => ({ $treeViewId: this.id, $treeItemHandle: node.handle }),
                actionRunner
            });
        }
        Gb() {
            if (this.ub) {
                this.Hb(this.ub);
            }
            else if (!this.dataProvider) {
                this.Hb(noDataProviderMessage);
            }
            else {
                this.Ib();
            }
            this.Qb();
        }
        Hb(message) {
            if (isRenderedMessageValue(this.z)) {
                this.z.dispose();
            }
            if ((0, htmlContent_1.$Zj)(message) && !this.M) {
                this.M = this.eb.createInstance(markdownRenderer_2.$K2, {});
            }
            this.z = (0, htmlContent_1.$Zj)(message) ? this.M.render(message) : message;
            if (!this.F) {
                return;
            }
            this.F.classList.remove('hide');
            this.Jb();
            if (typeof this.z === 'string' && !(0, strings_1.$me)(this.z)) {
                this.F.textContent = this.z;
            }
            else if (isRenderedMessageValue(this.z)) {
                this.F.appendChild(this.z.element);
            }
            this.layout(this.Kb, this.Lb);
        }
        Ib() {
            this.Jb();
            this.F?.classList.add('hide');
            this.layout(this.Kb, this.Lb);
        }
        Jb() {
            if (this.F) {
                DOM.$lO(this.F);
            }
        }
        layout(height, width) {
            if (height && width && this.F && this.y) {
                this.Kb = height;
                this.Lb = width;
                const treeHeight = height - DOM.$LO(this.F);
                this.y.style.height = treeHeight + 'px';
                this.G?.layout(treeHeight, width);
            }
        }
        getOptimalWidth() {
            if (this.G) {
                const parentNode = this.G.getHTMLElement();
                const childNodes = [].slice.call(parentNode.querySelectorAll('.outline-item-label > a'));
                return DOM.$MO(parentNode, childNodes);
            }
            return 0;
        }
        async refresh(elements) {
            if (this.dataProvider && this.G) {
                if (this.Mb) {
                    await event_1.Event.toPromise(this.bb.event);
                }
                if (!elements) {
                    elements = [this.L];
                    // remove all waiting elements to refresh if root is asked to refresh
                    this.N = [];
                }
                for (const element of elements) {
                    element.children = undefined; // reset children
                }
                if (this.a) {
                    return this.Nb(elements);
                }
                else {
                    if (this.N.length) {
                        const seen = new Set();
                        this.N.forEach(element => seen.add(element.handle));
                        for (const element of elements) {
                            if (!seen.has(element.handle)) {
                                this.N.push(element);
                            }
                        }
                    }
                    else {
                        this.N.push(...elements);
                    }
                }
            }
            return undefined;
        }
        async expand(itemOrItems) {
            const tree = this.G;
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
            return !!this.G?.isCollapsed(item);
        }
        setSelection(items) {
            this.G?.setSelection(items);
        }
        getSelection() {
            return this.G?.getSelection() ?? [];
        }
        setFocus(item) {
            if (this.G) {
                if (item) {
                    this.focus(true, item);
                    this.G.setFocus([item]);
                }
                else if (this.G.getFocus().length === 0) {
                    this.G.setFocus([]);
                }
            }
        }
        async reveal(item) {
            if (this.G) {
                return this.G.reveal(item);
            }
        }
        async Nb(elements) {
            const tree = this.G;
            if (tree && this.visible) {
                this.Mb = true;
                const oldSelection = tree.getSelection();
                try {
                    await Promise.all(elements.map(element => tree.updateChildren(element, true, true)));
                }
                catch (e) {
                    // When multiple calls are made to refresh the tree in quick succession,
                    // we can get a "Tree element not found" error. This is expected.
                    // Ideally this is fixable, so log instead of ignoring so the error is preserved.
                    this.pb.error(e);
                }
                const newSelection = tree.getSelection();
                if (oldSelection.length !== newSelection.length || oldSelection.some((value, index) => value.handle !== newSelection[index].handle)) {
                    this.O = newSelection;
                    this.S.fire({ selection: this.O, focus: this.P });
                }
                this.Mb = false;
                this.bb.fire();
                this.Qb();
                if (this.u) {
                    this.focus(false);
                }
                this.Pb();
            }
        }
        Ob() {
            if (!this.m) {
                this.j = new contextkey_1.$2i(`treeView.${this.id}.toggleCollapseAll`, false, (0, nls_1.localize)(5, null, this.id));
                this.m = this.j.bindTo(this.nb);
            }
        }
        Pb() {
            if (this.showCollapseAllAction) {
                this.Ob();
                this.m?.set(!!this.L.children && (this.L.children.length > 0) &&
                    this.L.children.some(value => value.collapsibleState !== views_1.TreeItemCollapsibleState.None));
            }
        }
        Qb() {
            const isTreeEmpty = !this.L.children || this.L.children.length === 0;
            // Hide tree container only when there is a message and tree is empty and not refreshing
            if (this.z && isTreeEmpty && !this.Mb && this.y) {
                // If there's a dnd controller then hiding the tree prevents it from being dragged into.
                if (!this.dragAndDropController) {
                    this.y.classList.add('hide');
                }
                this.w.setAttribute('tabindex', '0');
            }
            else if (this.y) {
                this.y.classList.remove('hide');
                if (this.w === DOM.$VO()) {
                    this.focus();
                }
                this.w.removeAttribute('tabindex');
            }
        }
        get container() {
            return this.J;
        }
    };
    AbstractTreeView = __decorate([
        __param(2, themeService_1.$gv),
        __param(3, instantiation_1.$Ah),
        __param(4, commands_1.$Fr),
        __param(5, configuration_1.$8h),
        __param(6, progress_1.$2u),
        __param(7, contextView_1.$WZ),
        __param(8, keybinding_1.$2D),
        __param(9, notification_1.$Yu),
        __param(10, views_1.$_E),
        __param(11, hover_1.$zib),
        __param(12, contextkey_1.$3i),
        __param(13, activity_1.$HV),
        __param(14, log_1.$5i)
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
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        hasChildren(element) {
            return !!this.a.dataProvider && (element.collapsibleState !== views_1.TreeItemCollapsibleState.None);
        }
        async getChildren(element) {
            let result = [];
            if (this.a.dataProvider) {
                try {
                    result = (await this.b(this.a.dataProvider.getChildren(element))) ?? [];
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
    let TreeRenderer = class TreeRenderer extends lifecycle_1.$kc {
        static { TreeRenderer_1 = this; }
        static { this.ITEM_HEIGHT = 22; }
        static { this.TREE_TEMPLATE_ID = 'treeExplorer'; }
        constructor(j, m, n, t, u, w, y, z, C, D, F, G, H) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeCheckboxState = this.a.event;
            this.g = false;
            this.h = new Map(); // tree item handle to template data
            this.f = {
                showHover: (options) => this.F.showHover(options),
                delay: this.C.getValue('workbench.hover.delay')
            };
            this.B(this.z.onDidFileIconThemeChange(() => this.J()));
            this.B(this.z.onDidColorThemeChange(() => this.J()));
            this.B(w.onDidChangeCheckboxState(items => {
                this.S(items);
            }));
        }
        get templateId() {
            return TreeRenderer_1.TREE_TEMPLATE_ID;
        }
        set actionRunner(actionRunner) {
            this.b = actionRunner;
        }
        renderTemplate(container) {
            container.classList.add('custom-view-tree-node-item');
            const checkboxContainer = DOM.$0O(container, DOM.$(''));
            const resourceLabel = this.n.create(container, { supportHighlights: true, hoverDelegate: this.f });
            const icon = DOM.$$O(resourceLabel.element, DOM.$('.custom-view-tree-node-item-icon'));
            const actionsContainer = DOM.$0O(resourceLabel.element, DOM.$('.actions'));
            const actionBar = new actionbar_1.$1P(actionsContainer, {
                actionViewItemProvider: this.t
            });
            return { resourceLabel, icon, checkboxContainer, actionBar, container, elementDisposable: new lifecycle_1.$jc() };
        }
        I(label, resource, node) {
            if (!(node instanceof views_1.$aF) || !node.hasResolve) {
                if (resource && !node.tooltip) {
                    return undefined;
                }
                else if (node.tooltip === undefined) {
                    return label;
                }
                else if (!(0, types_1.$jf)(node.tooltip)) {
                    return { markdown: node.tooltip, markdownNotSupportedFallback: resource ? undefined : (0, markdownRenderer_1.$CQ)(node.tooltip) }; // Passing undefined as the fallback for a resource falls back to the old native hover
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
            const treeItemLabel = node.label ? node.label : (resource ? { label: (0, resources_1.$fg)(resource) } : undefined);
            const description = (0, types_1.$jf)(node.description) ? node.description : resource && node.description === true ? this.D.getUriLabel((0, resources_1.$hg)(resource), { relative: true }) : undefined;
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
            const icon = this.z.getColorTheme().type === theme_1.ColorScheme.LIGHT ? node.icon : node.iconDark;
            const iconUrl = icon ? uri_1.URI.revive(icon) : undefined;
            const title = this.I(label, resource, node);
            // reset
            templateData.actionBar.clear();
            templateData.icon.style.color = '';
            let commandEnabled = true;
            if (node.command) {
                commandEnabled = isTreeCommandEnabled(node.command, this.H);
            }
            this.L(node, templateData);
            if (resource) {
                const fileDecorations = this.C.getValue('explorer.decorations');
                const labelResource = resource ? resource : uri_1.URI.parse('missing:_icon_resource');
                templateData.resourceLabel.setResource({ name: label, description, resource: labelResource }, {
                    fileKind: this.R(node),
                    title,
                    hideIcon: this.N(iconUrl, node.themeIcon),
                    fileDecorations,
                    extraClasses: ['custom-view-tree-node-item-resourceLabel'],
                    matches: matches ? matches : (0, filters_1.$Hj)(element.filterData),
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
                    matches: matches ? matches : (0, filters_1.$Hj)(element.filterData),
                    strikethrough: treeItemLabel?.strikethrough,
                    disabledCommand: !commandEnabled,
                    labelEscapeNewLines: true
                });
            }
            if (iconUrl) {
                templateData.icon.className = 'custom-view-tree-node-item-icon';
                templateData.icon.style.backgroundImage = DOM.$nP(iconUrl);
            }
            else {
                let iconClass;
                if (this.O(!!resource, node.themeIcon)) {
                    iconClass = themables_1.ThemeIcon.asClassName(node.themeIcon);
                    if (node.themeIcon.color) {
                        templateData.icon.style.color = this.z.getColorTheme().getColor(node.themeIcon.color.id)?.toString() ?? '';
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
            templateData.actionBar.context = { $treeViewId: this.j, $treeItemHandle: node.handle };
            const menuActions = this.m.getResourceActions(node);
            if (menuActions.menu) {
                templateData.elementDisposable.add(menuActions.menu);
            }
            templateData.actionBar.push(menuActions.actions, { icon: true, label: false });
            if (this.b) {
                templateData.actionBar.actionRunner = this.b;
            }
            this.M(templateData.container, node);
            this.G.addRenderedTreeItemElement(node, templateData.container);
            // remember rendered element
            this.h.set(element.element.handle, { original: element, rendered: templateData });
        }
        J() {
            // As we add items to the map during this call we can't directly use the map in the for loop
            // but have to create a copy of the keys first
            const keys = new Set(this.h.keys());
            for (const key of keys) {
                const value = this.h.get(key);
                if (value) {
                    this.disposeElement(value.original, 0, value.rendered);
                    this.renderElement(value.original, 0, value.rendered);
                }
            }
        }
        L(node, templateData) {
            if (node.checkbox) {
                // The first time we find a checkbox we want to rerender the visible tree to adapt the alignment
                if (!this.g) {
                    this.g = true;
                    this.J();
                }
                if (!templateData.checkbox) {
                    const checkbox = new checkbox_1.$6ub(templateData.checkboxContainer, this.w, this.f);
                    templateData.checkbox = checkbox;
                }
                templateData.checkbox.render(node);
            }
            else if (templateData.checkbox) {
                templateData.checkbox.dispose();
                templateData.checkbox = undefined;
            }
        }
        M(container, treeItem) {
            container.parentElement.classList.toggle('align-icon-with-twisty', !this.g && this.u.alignIconWithTwisty(treeItem));
        }
        N(iconUrl, icon) {
            // We always hide the resource label in favor of the iconUrl when it's provided.
            // When `ThemeIcon` is provided, we hide the resource label icon in favor of it only if it's a not a file icon.
            return (!!iconUrl || (!!icon && !this.Q(icon)));
        }
        O(hasResource, icon) {
            if (!icon) {
                return false;
            }
            // If there's a resource and the icon is a file icon, then the icon (or lack thereof) will already be coming from the
            // icon theme and should use whatever the icon theme has provided.
            return !(hasResource && this.Q(icon));
        }
        P(icon) {
            return icon?.id === themeService_1.$jv.id;
        }
        Q(icon) {
            if (icon) {
                return icon.id === themeService_1.$iv.id || this.P(icon);
            }
            else {
                return false;
            }
        }
        R(node) {
            if (node.themeIcon) {
                switch (node.themeIcon.id) {
                    case themeService_1.$iv.id:
                        return files_1.FileKind.FILE;
                    case themeService_1.$jv.id:
                        return files_1.FileKind.FOLDER;
                }
            }
            return node.collapsibleState === views_1.TreeItemCollapsibleState.Collapsed || node.collapsibleState === views_1.TreeItemCollapsibleState.Expanded ? files_1.FileKind.FOLDER : files_1.FileKind.FILE;
        }
        S(items) {
            const additionalItems = [];
            if (!this.y) {
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
                const renderedItem = this.h.get(item.handle);
                if (renderedItem) {
                    renderedItem.rendered.checkbox?.render(item);
                }
            });
            this.a.fire(items);
        }
        disposeElement(resource, index, templateData) {
            templateData.elementDisposable.clear();
            this.h.delete(resource.element.handle);
            this.G.removeRenderedTreeItemElement(resource.element);
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
        __param(7, themeService_1.$gv),
        __param(8, configuration_1.$8h),
        __param(9, label_1.$Vz),
        __param(10, hover_1.$zib),
        __param(11, treeViewsService_1.$4ub),
        __param(12, contextkey_1.$3i)
    ], TreeRenderer);
    class Aligner extends lifecycle_1.$kc {
        constructor(b) {
            super();
            this.b = b;
        }
        set tree(tree) {
            this.a = tree;
        }
        alignIconWithTwisty(treeItem) {
            if (treeItem.collapsibleState !== views_1.TreeItemCollapsibleState.None) {
                return false;
            }
            if (!this.f(treeItem)) {
                return false;
            }
            if (this.a) {
                const parent = this.a.getParentElement(treeItem) || this.a.getInput();
                if (this.f(parent)) {
                    return !!parent.children && parent.children.some(c => c.collapsibleState !== views_1.TreeItemCollapsibleState.None && !this.f(c));
                }
                return !!parent.children && parent.children.every(c => c.collapsibleState === views_1.TreeItemCollapsibleState.None || !this.f(c));
            }
            else {
                return false;
            }
        }
        f(node) {
            const icon = this.b.getColorTheme().type === theme_1.ColorScheme.LIGHT ? node.icon : node.iconDark;
            if (icon) {
                return true;
            }
            if (node.resourceUri || node.themeIcon) {
                const fileIconTheme = this.b.getFileIconTheme();
                const isFolder = node.themeIcon ? node.themeIcon.id === themeService_1.$jv.id : node.collapsibleState !== views_1.TreeItemCollapsibleState.None;
                if (isFolder) {
                    return fileIconTheme.hasFileIcons && fileIconTheme.hasFolderIcons;
                }
                return fileIconTheme.hasFileIcons;
            }
            return false;
        }
    }
    class MultipleSelectionActionRunner extends actions_1.$hi {
        constructor(notificationService, a) {
            super();
            this.a = a;
            this.B(this.onDidRun(e => {
                if (e.error && !(0, errors_1.$2)(e.error)) {
                    notificationService.error((0, nls_1.localize)(6, null, e.error.message, e.action.id));
                }
            }));
        }
        async u(action, context) {
            const selection = this.a();
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
    let TreeMenus = class TreeMenus extends lifecycle_1.$kc {
        constructor(f, g) {
            super();
            this.f = f;
            this.g = g;
            this.b = new event_1.$fd();
            this.onDidChange = this.b.event;
        }
        /**
         * Caller is now responsible for disposing of the menu!
         */
        getResourceActions(element) {
            const actions = this.h(actions_2.$Ru.ViewItemContext, element, true);
            return { menu: actions.menu, actions: actions.primary };
        }
        getResourceContextActions(element) {
            return this.h(actions_2.$Ru.ViewItemContext, element).secondary;
        }
        setContextKeyService(service) {
            this.a = service;
        }
        h(menuId, element, listen = false) {
            if (!this.a) {
                return { primary: [], secondary: [] };
            }
            const contextKeyService = this.a.createOverlay([
                ['view', this.f],
                ['viewItem', element.contextValue]
            ]);
            const menu = this.g.createMenu(menuId, contextKeyService);
            const primary = [];
            const secondary = [];
            const result = { primary, secondary, menu };
            (0, menuEntryActionViewItem_1.$A3)(menu, { shouldForwardArgs: true }, result, 'inline');
            if (listen) {
                this.B(menu.onDidChange(() => this.b.fire(element)));
            }
            else {
                menu.dispose();
            }
            return result;
        }
        dispose() {
            this.a = undefined;
            super.dispose();
        }
    };
    TreeMenus = __decorate([
        __param(1, actions_2.$Su)
    ], TreeMenus);
    let $9ub = class $9ub extends AbstractTreeView {
        constructor(id, title, Sb, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, contextKeyService, hoverService, Tb, activityService, Ub, logService) {
            super(id, title, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, hoverService, contextKeyService, activityService, logService);
            this.Sb = Sb;
            this.Tb = Tb;
            this.Ub = Ub;
            this.Rb = false;
        }
        Bb() {
            if (!this.Rb) {
                this.Ub.publicLog2('Extension:ViewActivate', {
                    extensionId: new telemetryUtils_1.$_n(this.Sb),
                    id: this.id,
                });
                this.Db();
                this.hb.withProgress({ location: this.id }, () => this.Tb.activateByEvent(`onView:${this.id}`))
                    .then(() => (0, async_1.$Hg)(2000))
                    .then(() => {
                    this.Gb();
                });
                this.Rb = true;
            }
        }
    };
    exports.$9ub = $9ub;
    exports.$9ub = $9ub = __decorate([
        __param(3, themeService_1.$gv),
        __param(4, instantiation_1.$Ah),
        __param(5, commands_1.$Fr),
        __param(6, configuration_1.$8h),
        __param(7, progress_1.$2u),
        __param(8, contextView_1.$WZ),
        __param(9, keybinding_1.$2D),
        __param(10, notification_1.$Yu),
        __param(11, views_1.$_E),
        __param(12, contextkey_1.$3i),
        __param(13, hover_1.$zib),
        __param(14, extensions_1.$MF),
        __param(15, activity_1.$HV),
        __param(16, telemetry_1.$9k),
        __param(17, log_1.$5i)
    ], $9ub);
    class $0ub extends AbstractTreeView {
        constructor() {
            super(...arguments);
            this.Rb = false;
        }
        Bb() {
            if (!this.Rb) {
                this.Db();
                this.Rb = true;
            }
        }
    }
    exports.$0ub = $0ub;
    let $$ub = class $$ub {
        constructor(f, g, h, i, j) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.b = dnd_3.$_6.getInstance();
            this.a = `application/vnd.code.tree.${f.toLowerCase()}`;
        }
        set controller(controller) {
            this.k = controller;
        }
        l(dndController, itemHandles, uuid, dragCancellationToken) {
            return dndController.handleDrag(itemHandles, uuid, dragCancellationToken).then(additionalDataTransfer => {
                if (additionalDataTransfer) {
                    const unlistedTypes = [];
                    for (const item of additionalDataTransfer) {
                        if ((item[0] !== this.a) && (dndController.dragMimeTypes.findIndex(value => value === item[0]) < 0)) {
                            unlistedTypes.push(item[0]);
                        }
                    }
                    if (unlistedTypes.length) {
                        this.j.warn(`Drag and drop controller for tree ${this.f} adds the following data transfer types but does not declare them in dragMimeTypes: ${unlistedTypes.join(', ')}`);
                    }
                }
                return additionalDataTransfer;
            });
        }
        m(originalEvent, itemHandles) {
            if (!originalEvent.dataTransfer || !this.k) {
                return;
            }
            const uuid = (0, uuid_1.$4f)();
            this.d = new cancellation_1.$pd();
            this.i.addDragOperationTransfer(uuid, this.l(this.k, itemHandles, uuid, this.d.token));
            this.b.setData([new treeViewsDnd_1.$m7(uuid)], treeViewsDnd_1.$m7.prototype);
            originalEvent.dataTransfer.clearData(mime_1.$Hr.text);
            if (this.k.dragMimeTypes.find((element) => element === mime_1.$Hr.uriList)) {
                // Add the type that the editor knows
                originalEvent.dataTransfer?.setData(dnd_1.$CP.RESOURCES, '');
            }
            this.k.dragMimeTypes.forEach(supportedType => {
                originalEvent.dataTransfer?.setData(supportedType, '');
            });
        }
        n(originalEvent, resources) {
            if (resources.length && originalEvent.dataTransfer) {
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.h.invokeFunction(accessor => (0, dnd_2.$veb)(accessor, resources, originalEvent));
                // The only custom data transfer we set from the explorer is a file transfer
                // to be able to DND between multiple code file explorers across windows
                const fileResources = resources.filter(s => s.scheme === network_1.Schemas.file).map(r => r.fsPath);
                if (fileResources.length) {
                    originalEvent.dataTransfer.setData(dnd_3.$56.FILES, JSON.stringify(fileResources));
                }
            }
        }
        onDragStart(data, originalEvent) {
            if (originalEvent.dataTransfer) {
                const treeItemsData = data.getData();
                const resources = [];
                const sourceInfo = {
                    id: this.f,
                    itemHandles: []
                };
                treeItemsData.forEach(item => {
                    sourceInfo.itemHandles.push(item.handle);
                    if (item.resourceUri) {
                        resources.push(uri_1.URI.revive(item.resourceUri));
                    }
                });
                this.n(originalEvent, resources);
                this.m(originalEvent, sourceInfo.itemHandles);
                originalEvent.dataTransfer.setData(this.a, JSON.stringify(sourceInfo));
            }
        }
        o(types) {
            if (types.size) {
                this.j.debug(`TreeView dragged mime types: ${Array.from(types).join(', ')}`);
            }
            else {
                this.j.debug(`TreeView dragged with no supported mime types.`);
            }
        }
        onDragOver(data, targetElement, targetIndex, originalEvent) {
            const dataTransfer = (0, dnd_4.$b7)(originalEvent.dataTransfer);
            const types = new Set(Array.from(dataTransfer, x => x[0]));
            if (originalEvent.dataTransfer) {
                // Also add uri-list if we have any files. At this stage we can't actually access the file itself though.
                for (const item of originalEvent.dataTransfer.items) {
                    if (item.kind === 'file' || item.type === dnd_1.$CP.RESOURCES.toLowerCase()) {
                        types.add(mime_1.$Hr.uriList);
                        break;
                    }
                }
            }
            this.o(types);
            const dndController = this.k;
            if (!dndController || !originalEvent.dataTransfer || (dndController.dropMimeTypes.length === 0)) {
                return false;
            }
            const dragContainersSupportedType = Array.from(types).some((value, index) => {
                if (value === this.a) {
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
            if (!this.k) {
                return null;
            }
            return element.resourceUri ? uri_1.URI.revive(element.resourceUri).toString() : element.handle;
        }
        getDragLabel(elements) {
            if (!this.k) {
                return undefined;
            }
            if (elements.length > 1) {
                return String(elements.length);
            }
            const element = elements[0];
            return element.label ? element.label.label : (element.resourceUri ? this.g.getUriLabel(uri_1.URI.revive(element.resourceUri)) : undefined);
        }
        async drop(data, targetNode, targetIndex, originalEvent) {
            const dndController = this.k;
            if (!originalEvent.dataTransfer || !dndController) {
                return;
            }
            let treeSourceInfo;
            let willDropUuid;
            if (this.b.hasData(treeViewsDnd_1.$m7.prototype)) {
                willDropUuid = this.b.getData(treeViewsDnd_1.$m7.prototype)[0].identifier;
            }
            const originalDataTransfer = (0, dnd_4.$b7)(originalEvent.dataTransfer, true);
            const outDataTransfer = new dataTransfer_1.$Rs();
            for (const [type, item] of originalDataTransfer) {
                if (type === this.a || dndController.dropMimeTypes.includes(type) || (item.asFile() && dndController.dropMimeTypes.includes(dnd_1.$CP.FILES.toLowerCase()))) {
                    outDataTransfer.append(type, item);
                    if (type === this.a) {
                        try {
                            treeSourceInfo = JSON.parse(await item.asString());
                        }
                        catch {
                            // noop
                        }
                    }
                }
            }
            const additionalDataTransfer = await this.i.removeDragOperationTransfer(willDropUuid);
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
                this.d?.cancel();
            }
        }
    };
    exports.$$ub = $$ub;
    exports.$$ub = $$ub = __decorate([
        __param(1, label_1.$Vz),
        __param(2, instantiation_1.$Ah),
        __param(3, treeViewsDndService_1.$n7),
        __param(4, log_1.$5i)
    ], $$ub);
});
//# sourceMappingURL=treeView.js.map