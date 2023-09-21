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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/ui/toolbar/toolbar", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/browser/viewParts/notebookKernelView", "vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/assignment/common/assignmentService", "vs/base/common/async", "vs/platform/actions/browser/toolbar"], function (require, exports, DOM, scrollableElement_1, toolbar_1, actions_1, event_1, lifecycle_1, menuEntryActionViewItem_1, actions_2, configuration_1, contextView_1, instantiation_1, keybinding_1, coreActions_1, notebookCommon_1, notebookKernelView_1, cellActionView_1, editorService_1, assignmentService_1, async_1, toolbar_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.workbenchDynamicCalculateActions = exports.workbenchCalculateActions = exports.NotebookEditorWorkbenchToolbar = exports.convertConfiguration = exports.RenderLabel = void 0;
    var RenderLabel;
    (function (RenderLabel) {
        RenderLabel[RenderLabel["Always"] = 0] = "Always";
        RenderLabel[RenderLabel["Never"] = 1] = "Never";
        RenderLabel[RenderLabel["Dynamic"] = 2] = "Dynamic";
    })(RenderLabel || (exports.RenderLabel = RenderLabel = {}));
    function convertConfiguration(value) {
        switch (value) {
            case true:
                return RenderLabel.Always;
            case false:
                return RenderLabel.Never;
            case 'always':
                return RenderLabel.Always;
            case 'never':
                return RenderLabel.Never;
            case 'dynamic':
                return RenderLabel.Dynamic;
        }
    }
    exports.convertConfiguration = convertConfiguration;
    const ICON_ONLY_ACTION_WIDTH = 21;
    const TOGGLE_MORE_ACTION_WIDTH = 21;
    const ACTION_PADDING = 8;
    class WorkbenchAlwaysLabelStrategy {
        constructor(notebookEditor, editorToolbar, instantiationService) {
            this.notebookEditor = notebookEditor;
            this.editorToolbar = editorToolbar;
            this.instantiationService = instantiationService;
        }
        actionProvider(action) {
            if (action.id === coreActions_1.SELECT_KERNEL_ID) {
                //	this is being disposed by the consumer
                return this.instantiationService.createInstance(notebookKernelView_1.NotebooKernelActionViewItem, action, this.notebookEditor);
            }
            return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(cellActionView_1.ActionViewWithLabel, action, undefined) : undefined;
        }
        calculateActions(leftToolbarContainerMaxWidth) {
            const initialPrimaryActions = this.editorToolbar.primaryActions;
            const initialSecondaryActions = this.editorToolbar.secondaryActions;
            const actionOutput = workbenchCalculateActions(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth);
            return {
                primaryActions: actionOutput.primaryActions.map(a => a.action),
                secondaryActions: actionOutput.secondaryActions
            };
        }
    }
    class WorkbenchNeverLabelStrategy {
        constructor(notebookEditor, editorToolbar, instantiationService) {
            this.notebookEditor = notebookEditor;
            this.editorToolbar = editorToolbar;
            this.instantiationService = instantiationService;
        }
        actionProvider(action) {
            if (action.id === coreActions_1.SELECT_KERNEL_ID) {
                //	this is being disposed by the consumer
                return this.instantiationService.createInstance(notebookKernelView_1.NotebooKernelActionViewItem, action, this.notebookEditor);
            }
            return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined) : undefined;
        }
        calculateActions(leftToolbarContainerMaxWidth) {
            const initialPrimaryActions = this.editorToolbar.primaryActions;
            const initialSecondaryActions = this.editorToolbar.secondaryActions;
            const actionOutput = workbenchCalculateActions(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth);
            return {
                primaryActions: actionOutput.primaryActions.map(a => a.action),
                secondaryActions: actionOutput.secondaryActions
            };
        }
    }
    class WorkbenchDynamicLabelStrategy {
        constructor(notebookEditor, editorToolbar, instantiationService) {
            this.notebookEditor = notebookEditor;
            this.editorToolbar = editorToolbar;
            this.instantiationService = instantiationService;
        }
        actionProvider(action) {
            if (action.id === coreActions_1.SELECT_KERNEL_ID) {
                //	this is being disposed by the consumer
                return this.instantiationService.createInstance(notebookKernelView_1.NotebooKernelActionViewItem, action, this.notebookEditor);
            }
            const a = this.editorToolbar.primaryActions.find(a => a.action.id === action.id);
            if (!a || a.renderLabel) {
                return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(cellActionView_1.ActionViewWithLabel, action, undefined) : undefined;
            }
            else {
                return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined) : undefined;
            }
        }
        calculateActions(leftToolbarContainerMaxWidth) {
            const initialPrimaryActions = this.editorToolbar.primaryActions;
            const initialSecondaryActions = this.editorToolbar.secondaryActions;
            const actionOutput = workbenchDynamicCalculateActions(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth);
            return {
                primaryActions: actionOutput.primaryActions.map(a => a.action),
                secondaryActions: actionOutput.secondaryActions
            };
        }
    }
    let NotebookEditorWorkbenchToolbar = class NotebookEditorWorkbenchToolbar extends lifecycle_1.Disposable {
        get primaryActions() {
            return this._primaryActions;
        }
        get secondaryActions() {
            return this._secondaryActions;
        }
        set visible(visible) {
            if (this._visible !== visible) {
                this._visible = visible;
                this._onDidChangeVisibility.fire(visible);
            }
        }
        get useGlobalToolbar() {
            return this._useGlobalToolbar;
        }
        constructor(notebookEditor, contextKeyService, notebookOptions, domNode, instantiationService, configurationService, contextMenuService, menuService, editorService, keybindingService, experimentService) {
            super();
            this.notebookEditor = notebookEditor;
            this.contextKeyService = contextKeyService;
            this.notebookOptions = notebookOptions;
            this.domNode = domNode;
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.contextMenuService = contextMenuService;
            this.menuService = menuService;
            this.editorService = editorService;
            this.keybindingService = keybindingService;
            this.experimentService = experimentService;
            this._useGlobalToolbar = false;
            this._renderLabel = RenderLabel.Always;
            this._visible = false;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this._dimension = null;
            this._primaryActions = [];
            this._secondaryActions = [];
            this._buildBody();
            this._register(event_1.Event.debounce(this.editorService.onDidActiveEditorChange, (last, _current) => last, 200)(this._updatePerEditorChange, this));
            this._registerNotebookActionsToolbar();
        }
        _buildBody() {
            this._notebookTopLeftToolbarContainer = document.createElement('div');
            this._notebookTopLeftToolbarContainer.classList.add('notebook-toolbar-left');
            this._leftToolbarScrollable = new scrollableElement_1.DomScrollableElement(this._notebookTopLeftToolbarContainer, {
                vertical: 2 /* ScrollbarVisibility.Hidden */,
                horizontal: 3 /* ScrollbarVisibility.Visible */,
                horizontalScrollbarSize: 3,
                useShadows: false,
                scrollYToX: true
            });
            this._register(this._leftToolbarScrollable);
            DOM.append(this.domNode, this._leftToolbarScrollable.getDomNode());
            this._notebookTopRightToolbarContainer = document.createElement('div');
            this._notebookTopRightToolbarContainer.classList.add('notebook-toolbar-right');
            DOM.append(this.domNode, this._notebookTopRightToolbarContainer);
        }
        _updatePerEditorChange() {
            if (this.editorService.activeEditorPane?.getId() === notebookCommon_1.NOTEBOOK_EDITOR_ID) {
                const notebookEditor = this.editorService.activeEditorPane.getControl();
                if (notebookEditor === this.notebookEditor) {
                    // this is the active editor
                    this._showNotebookActionsinEditorToolbar();
                    return;
                }
            }
        }
        _registerNotebookActionsToolbar() {
            this._notebookGlobalActionsMenu = this._register(this.menuService.createMenu(this.notebookEditor.creationOptions.menuIds.notebookToolbar, this.contextKeyService));
            this._register(this._notebookGlobalActionsMenu);
            this._useGlobalToolbar = this.notebookOptions.getLayoutConfiguration().globalToolbar;
            this._renderLabel = this._convertConfiguration(this.configurationService.getValue(notebookCommon_1.NotebookSetting.globalToolbarShowLabel));
            this._updateStrategy();
            const context = {
                ui: true,
                notebookEditor: this.notebookEditor
            };
            const actionProvider = (action) => {
                if (action.id === coreActions_1.SELECT_KERNEL_ID) {
                    // this is being disposed by the consumer
                    return this.instantiationService.createInstance(notebookKernelView_1.NotebooKernelActionViewItem, action, this.notebookEditor);
                }
                if (this._renderLabel !== RenderLabel.Never) {
                    const a = this._primaryActions.find(a => a.action.id === action.id);
                    if (a && a.renderLabel) {
                        return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(cellActionView_1.ActionViewWithLabel, action, undefined) : undefined;
                    }
                    else {
                        return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined) : undefined;
                    }
                }
                else {
                    return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined) : undefined;
                }
            };
            const leftToolbarOptions = {
                hiddenItemStrategy: 1 /* HiddenItemStrategy.RenderInSecondaryGroup */,
                resetMenu: actions_2.MenuId.NotebookToolbar,
                actionViewItemProvider: (action, options) => {
                    return this._strategy.actionProvider(action, options);
                },
                getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
                renderDropdownAsChildElement: true,
            };
            this._notebookLeftToolbar = this.instantiationService.createInstance(toolbar_2.WorkbenchToolBar, this._notebookTopLeftToolbarContainer, leftToolbarOptions);
            this._register(this._notebookLeftToolbar);
            this._notebookLeftToolbar.context = context;
            this._notebookRightToolbar = new toolbar_1.ToolBar(this._notebookTopRightToolbarContainer, this.contextMenuService, {
                getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
                actionViewItemProvider: actionProvider,
                renderDropdownAsChildElement: true
            });
            this._register(this._notebookRightToolbar);
            this._notebookRightToolbar.context = context;
            this._showNotebookActionsinEditorToolbar();
            let dropdownIsVisible = false;
            let deferredUpdate;
            this._register(this._notebookGlobalActionsMenu.onDidChange(() => {
                if (dropdownIsVisible) {
                    deferredUpdate = () => this._showNotebookActionsinEditorToolbar();
                    return;
                }
                if (this.notebookEditor.isVisible) {
                    this._showNotebookActionsinEditorToolbar();
                }
            }));
            this._register(this._notebookLeftToolbar.onDidChangeDropdownVisibility(visible => {
                dropdownIsVisible = visible;
                if (deferredUpdate && !visible) {
                    setTimeout(() => {
                        deferredUpdate?.();
                    }, 0);
                    deferredUpdate = undefined;
                }
            }));
            this._register(this.notebookOptions.onDidChangeOptions(e => {
                if (e.globalToolbar !== undefined) {
                    this._useGlobalToolbar = this.notebookOptions.getLayoutConfiguration().globalToolbar;
                    this._showNotebookActionsinEditorToolbar();
                }
            }));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(notebookCommon_1.NotebookSetting.globalToolbarShowLabel)) {
                    this._renderLabel = this._convertConfiguration(this.configurationService.getValue(notebookCommon_1.NotebookSetting.globalToolbarShowLabel));
                    this._updateStrategy();
                    const oldElement = this._notebookLeftToolbar.getElement();
                    oldElement.parentElement?.removeChild(oldElement);
                    this._notebookLeftToolbar.dispose();
                    this._notebookLeftToolbar = this.instantiationService.createInstance(toolbar_2.WorkbenchToolBar, this._notebookTopLeftToolbarContainer, leftToolbarOptions);
                    this._register(this._notebookLeftToolbar);
                    this._notebookLeftToolbar.context = context;
                    this._showNotebookActionsinEditorToolbar();
                    return;
                }
            }));
            if (this.experimentService) {
                this.experimentService.getTreatment('nbtoolbarineditor').then(treatment => {
                    if (treatment === undefined) {
                        return;
                    }
                    if (this._useGlobalToolbar !== treatment) {
                        this._useGlobalToolbar = treatment;
                        this._showNotebookActionsinEditorToolbar();
                    }
                });
            }
        }
        _updateStrategy() {
            switch (this._renderLabel) {
                case RenderLabel.Always:
                    this._strategy = new WorkbenchAlwaysLabelStrategy(this.notebookEditor, this, this.instantiationService);
                    break;
                case RenderLabel.Never:
                    this._strategy = new WorkbenchNeverLabelStrategy(this.notebookEditor, this, this.instantiationService);
                    break;
                case RenderLabel.Dynamic:
                    this._strategy = new WorkbenchDynamicLabelStrategy(this.notebookEditor, this, this.instantiationService);
                    break;
            }
        }
        _convertConfiguration(value) {
            switch (value) {
                case true:
                    return RenderLabel.Always;
                case false:
                    return RenderLabel.Never;
                case 'always':
                    return RenderLabel.Always;
                case 'never':
                    return RenderLabel.Never;
                case 'dynamic':
                    return RenderLabel.Dynamic;
            }
        }
        _showNotebookActionsinEditorToolbar() {
            // when there is no view model, just ignore.
            if (!this.notebookEditor.hasModel()) {
                this._deferredActionUpdate?.dispose();
                this._deferredActionUpdate = undefined;
                this.visible = false;
                return;
            }
            if (this._deferredActionUpdate) {
                return;
            }
            if (!this._useGlobalToolbar) {
                this.domNode.style.display = 'none';
                this._deferredActionUpdate = undefined;
                this.visible = false;
            }
            else {
                this._deferredActionUpdate = (0, async_1.disposableTimeout)(async () => {
                    await this._setNotebookActions();
                    this.visible = true;
                    this._deferredActionUpdate = undefined;
                }, 50);
            }
        }
        async _setNotebookActions() {
            const groups = this._notebookGlobalActionsMenu.getActions({ shouldForwardArgs: true, renderShortTitle: true });
            this.domNode.style.display = 'flex';
            const primaryLeftGroups = groups.filter(group => /^navigation/.test(group[0]));
            const primaryActions = [];
            primaryLeftGroups.sort((a, b) => {
                if (a[0] === 'navigation') {
                    return 1;
                }
                if (b[0] === 'navigation') {
                    return -1;
                }
                return 0;
            }).forEach((group, index) => {
                primaryActions.push(...group[1]);
                if (index < primaryLeftGroups.length - 1) {
                    primaryActions.push(new actions_1.Separator());
                }
            });
            const primaryRightGroup = groups.find(group => /^status/.test(group[0]));
            const primaryRightActions = primaryRightGroup ? primaryRightGroup[1] : [];
            const secondaryActions = groups.filter(group => !/^navigation/.test(group[0]) && !/^status/.test(group[0])).reduce((prev, curr) => { prev.push(...curr[1]); return prev; }, []);
            this._notebookLeftToolbar.setActions([], []);
            this._primaryActions = primaryActions.map(action => ({
                action: action,
                size: (action instanceof actions_1.Separator ? 1 : 0),
                renderLabel: true,
                visible: true
            }));
            this._notebookLeftToolbar.setActions(primaryActions, secondaryActions);
            this._secondaryActions = secondaryActions;
            this._notebookRightToolbar.setActions(primaryRightActions, []);
            this._secondaryActions = secondaryActions;
            if (this._dimension && this._dimension.width >= 0 && this._dimension.height >= 0) {
                this._cacheItemSizes(this._notebookLeftToolbar);
            }
            this._computeSizes();
        }
        _cacheItemSizes(toolbar) {
            for (let i = 0; i < toolbar.getItemsLength(); i++) {
                const action = toolbar.getItemAction(i);
                if (action && action.id !== 'toolbar.toggle.more') {
                    const existing = this._primaryActions.find(a => a.action.id === action.id);
                    if (existing) {
                        existing.size = toolbar.getItemWidth(i);
                    }
                }
            }
        }
        _computeSizes() {
            const toolbar = this._notebookLeftToolbar;
            const rightToolbar = this._notebookRightToolbar;
            if (toolbar && rightToolbar && this._dimension && this._dimension.height >= 0 && this._dimension.width >= 0) {
                // compute size only if it's visible
                if (this._primaryActions.length === 0 && toolbar.getItemsLength() !== this._primaryActions.length) {
                    this._cacheItemSizes(this._notebookLeftToolbar);
                }
                if (this._primaryActions.length === 0) {
                    return;
                }
                const kernelWidth = (rightToolbar.getItemsLength() ? rightToolbar.getItemWidth(0) : 0) + ACTION_PADDING;
                const leftToolbarContainerMaxWidth = this._dimension.width - kernelWidth - (ACTION_PADDING + TOGGLE_MORE_ACTION_WIDTH) - ( /** toolbar left margin */ACTION_PADDING) - ( /** toolbar right margin */ACTION_PADDING);
                const calculatedActions = this._strategy.calculateActions(leftToolbarContainerMaxWidth);
                this._notebookLeftToolbar.setActions(calculatedActions.primaryActions, calculatedActions.secondaryActions);
            }
        }
        layout(dimension) {
            this._dimension = dimension;
            if (!this._useGlobalToolbar) {
                this.domNode.style.display = 'none';
            }
            else {
                this.domNode.style.display = 'flex';
            }
            this._computeSizes();
        }
        dispose() {
            this._notebookLeftToolbar.context = undefined;
            this._notebookRightToolbar.context = undefined;
            this._notebookLeftToolbar.dispose();
            this._notebookRightToolbar.dispose();
            this._notebookLeftToolbar = null;
            this._notebookRightToolbar = null;
            this._deferredActionUpdate?.dispose();
            this._deferredActionUpdate = undefined;
            super.dispose();
        }
    };
    exports.NotebookEditorWorkbenchToolbar = NotebookEditorWorkbenchToolbar;
    exports.NotebookEditorWorkbenchToolbar = NotebookEditorWorkbenchToolbar = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, actions_2.IMenuService),
        __param(8, editorService_1.IEditorService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, assignmentService_1.IWorkbenchAssignmentService)
    ], NotebookEditorWorkbenchToolbar);
    function workbenchCalculateActions(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth) {
        return actionOverflowHelper(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth, false);
    }
    exports.workbenchCalculateActions = workbenchCalculateActions;
    function workbenchDynamicCalculateActions(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth) {
        if (initialPrimaryActions.length === 0) {
            return { primaryActions: [], secondaryActions: initialSecondaryActions };
        }
        // find true length of array, add 1 for each primary actions, ignoring an item when size = 0
        const visibleActionLength = initialPrimaryActions.filter(action => action.size !== 0).length;
        // step 1: try to fit all primary actions
        const totalWidthWithLabels = initialPrimaryActions.map(action => action.size).reduce((a, b) => a + b, 0) + (visibleActionLength - 1) * ACTION_PADDING;
        if (totalWidthWithLabels <= leftToolbarContainerMaxWidth) {
            initialPrimaryActions.forEach(action => {
                action.renderLabel = true;
            });
            return actionOverflowHelper(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth, false);
        }
        // step 2: check if they fit without labels
        if ((visibleActionLength * ICON_ONLY_ACTION_WIDTH + (visibleActionLength - 1) * ACTION_PADDING) > leftToolbarContainerMaxWidth) {
            initialPrimaryActions.forEach(action => { action.renderLabel = false; });
            return actionOverflowHelper(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth, true);
        }
        // step 3: render as many actions as possible with labels, rest without.
        let sum = 0;
        let lastActionWithLabel = -1;
        for (let i = 0; i < initialPrimaryActions.length; i++) {
            sum += initialPrimaryActions[i].size + ACTION_PADDING;
            if (initialPrimaryActions[i].action instanceof actions_1.Separator) {
                // find group separator
                const remainingItems = initialPrimaryActions.slice(i + 1).filter(action => action.size !== 0); // todo: need to exclude size 0 items from this
                const newTotalSum = sum + (remainingItems.length === 0 ? 0 : (remainingItems.length * ICON_ONLY_ACTION_WIDTH + (remainingItems.length - 1) * ACTION_PADDING));
                if (newTotalSum <= leftToolbarContainerMaxWidth) {
                    lastActionWithLabel = i;
                }
            }
            else {
                continue;
            }
        }
        // icons only don't fit either
        if (lastActionWithLabel < 0) {
            initialPrimaryActions.forEach(action => { action.renderLabel = false; });
            return actionOverflowHelper(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth, true);
        }
        // render labels for the actions that have space
        initialPrimaryActions.slice(0, lastActionWithLabel + 1).forEach(action => { action.renderLabel = true; });
        initialPrimaryActions.slice(lastActionWithLabel + 1).forEach(action => { action.renderLabel = false; });
        return {
            primaryActions: initialPrimaryActions,
            secondaryActions: initialSecondaryActions
        };
    }
    exports.workbenchDynamicCalculateActions = workbenchDynamicCalculateActions;
    function actionOverflowHelper(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth, iconOnly) {
        const renderActions = [];
        const overflow = [];
        let currentSize = 0;
        let nonZeroAction = false;
        let containerFull = false;
        if (initialPrimaryActions.length === 0) {
            return { primaryActions: [], secondaryActions: initialSecondaryActions };
        }
        for (let i = 0; i < initialPrimaryActions.length; i++) {
            const actionModel = initialPrimaryActions[i];
            const itemSize = iconOnly ? (actionModel.size === 0 ? 0 : ICON_ONLY_ACTION_WIDTH) : actionModel.size;
            // if two separators in a row, ignore the second
            if (actionModel.action instanceof actions_1.Separator && renderActions.length > 0 && renderActions[renderActions.length - 1].action instanceof actions_1.Separator) {
                continue;
            }
            // if a separator is the first nonZero action, ignore it
            if (actionModel.action instanceof actions_1.Separator && !nonZeroAction) {
                continue;
            }
            if (currentSize + itemSize <= leftToolbarContainerMaxWidth && !containerFull) {
                currentSize += ACTION_PADDING + itemSize;
                renderActions.push(actionModel);
                if (itemSize !== 0) {
                    nonZeroAction = true;
                }
                if (actionModel.action instanceof actions_1.Separator) {
                    nonZeroAction = false;
                }
            }
            else {
                containerFull = true;
                if (itemSize === 0) { // size 0 implies a hidden item, keep in primary to allow for Workbench to handle visibility
                    renderActions.push(actionModel);
                }
                else {
                    if (actionModel.action instanceof actions_1.Separator) { // never push a separator to overflow
                        continue;
                    }
                    overflow.push(actionModel.action);
                }
            }
        }
        for (let i = (renderActions.length - 1); i > 0; i--) {
            const temp = renderActions[i];
            if (temp.size === 0) {
                continue;
            }
            if (temp.action instanceof actions_1.Separator) {
                renderActions.splice(i, 1);
            }
            break;
        }
        if (renderActions.length && renderActions[renderActions.length - 1].action instanceof actions_1.Separator) {
            renderActions.pop();
        }
        if (overflow.length !== 0) {
            overflow.push(new actions_1.Separator());
        }
        if (iconOnly) {
            // if icon only mode, don't render both (+ code) and (+ markdown) buttons. remove of markdown action
            const markdownIndex = renderActions.findIndex(a => a.action.id === 'notebook.cell.insertMarkdownCellBelow');
            if (markdownIndex !== -1) {
                renderActions.splice(markdownIndex, 1);
            }
        }
        return {
            primaryActions: renderActions,
            secondaryActions: [...overflow, ...initialSecondaryActions]
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JUb29sYmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3UGFydHMvbm90ZWJvb2tFZGl0b3JUb29sYmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9DaEcsSUFBWSxXQUlYO0lBSkQsV0FBWSxXQUFXO1FBQ3RCLGlEQUFVLENBQUE7UUFDViwrQ0FBUyxDQUFBO1FBQ1QsbURBQVcsQ0FBQTtJQUNaLENBQUMsRUFKVyxXQUFXLDJCQUFYLFdBQVcsUUFJdEI7SUFJRCxTQUFnQixvQkFBb0IsQ0FBQyxLQUE4QjtRQUNsRSxRQUFRLEtBQUssRUFBRTtZQUNkLEtBQUssSUFBSTtnQkFDUixPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUM7WUFDM0IsS0FBSyxLQUFLO2dCQUNULE9BQU8sV0FBVyxDQUFDLEtBQUssQ0FBQztZQUMxQixLQUFLLFFBQVE7Z0JBQ1osT0FBTyxXQUFXLENBQUMsTUFBTSxDQUFDO1lBQzNCLEtBQUssT0FBTztnQkFDWCxPQUFPLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFDMUIsS0FBSyxTQUFTO2dCQUNiLE9BQU8sV0FBVyxDQUFDLE9BQU8sQ0FBQztTQUM1QjtJQUNGLENBQUM7SUFiRCxvREFhQztJQUVELE1BQU0sc0JBQXNCLEdBQUcsRUFBRSxDQUFDO0lBQ2xDLE1BQU0sd0JBQXdCLEdBQUcsRUFBRSxDQUFDO0lBQ3BDLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQztJQU96QixNQUFNLDRCQUE0QjtRQUNqQyxZQUNVLGNBQXVDLEVBQ3ZDLGFBQTZDLEVBQzdDLG9CQUEyQztZQUYzQyxtQkFBYyxHQUFkLGNBQWMsQ0FBeUI7WUFDdkMsa0JBQWEsR0FBYixhQUFhLENBQWdDO1lBQzdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FB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