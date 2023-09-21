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
    exports.$irb = exports.$hrb = exports.$grb = exports.$frb = exports.RenderLabel = void 0;
    var RenderLabel;
    (function (RenderLabel) {
        RenderLabel[RenderLabel["Always"] = 0] = "Always";
        RenderLabel[RenderLabel["Never"] = 1] = "Never";
        RenderLabel[RenderLabel["Dynamic"] = 2] = "Dynamic";
    })(RenderLabel || (exports.RenderLabel = RenderLabel = {}));
    function $frb(value) {
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
    exports.$frb = $frb;
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
            if (action.id === coreActions_1.$6ob) {
                //	this is being disposed by the consumer
                return this.instantiationService.createInstance(notebookKernelView_1.$$qb, action, this.notebookEditor);
            }
            return action instanceof actions_2.$Vu ? this.instantiationService.createInstance(cellActionView_1.$mpb, action, undefined) : undefined;
        }
        calculateActions(leftToolbarContainerMaxWidth) {
            const initialPrimaryActions = this.editorToolbar.primaryActions;
            const initialSecondaryActions = this.editorToolbar.secondaryActions;
            const actionOutput = $hrb(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth);
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
            if (action.id === coreActions_1.$6ob) {
                //	this is being disposed by the consumer
                return this.instantiationService.createInstance(notebookKernelView_1.$$qb, action, this.notebookEditor);
            }
            return action instanceof actions_2.$Vu ? this.instantiationService.createInstance(menuEntryActionViewItem_1.$C3, action, undefined) : undefined;
        }
        calculateActions(leftToolbarContainerMaxWidth) {
            const initialPrimaryActions = this.editorToolbar.primaryActions;
            const initialSecondaryActions = this.editorToolbar.secondaryActions;
            const actionOutput = $hrb(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth);
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
            if (action.id === coreActions_1.$6ob) {
                //	this is being disposed by the consumer
                return this.instantiationService.createInstance(notebookKernelView_1.$$qb, action, this.notebookEditor);
            }
            const a = this.editorToolbar.primaryActions.find(a => a.action.id === action.id);
            if (!a || a.renderLabel) {
                return action instanceof actions_2.$Vu ? this.instantiationService.createInstance(cellActionView_1.$mpb, action, undefined) : undefined;
            }
            else {
                return action instanceof actions_2.$Vu ? this.instantiationService.createInstance(menuEntryActionViewItem_1.$C3, action, undefined) : undefined;
            }
        }
        calculateActions(leftToolbarContainerMaxWidth) {
            const initialPrimaryActions = this.editorToolbar.primaryActions;
            const initialSecondaryActions = this.editorToolbar.secondaryActions;
            const actionOutput = $irb(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth);
            return {
                primaryActions: actionOutput.primaryActions.map(a => a.action),
                secondaryActions: actionOutput.secondaryActions
            };
        }
    }
    let $grb = class $grb extends lifecycle_1.$kc {
        get primaryActions() {
            return this.m;
        }
        get secondaryActions() {
            return this.n;
        }
        set visible(visible) {
            if (this.w !== visible) {
                this.w = visible;
                this.y.fire(visible);
            }
        }
        get useGlobalToolbar() {
            return this.s;
        }
        constructor(notebookEditor, contextKeyService, notebookOptions, domNode, D, F, G, H, I, J, L) {
            super();
            this.notebookEditor = notebookEditor;
            this.contextKeyService = contextKeyService;
            this.notebookOptions = notebookOptions;
            this.domNode = domNode;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.s = false;
            this.u = RenderLabel.Always;
            this.w = false;
            this.y = this.B(new event_1.$fd());
            this.onDidChangeVisibility = this.y.event;
            this.z = null;
            this.m = [];
            this.n = [];
            this.M();
            this.B(event_1.Event.debounce(this.I.onDidActiveEditorChange, (last, _current) => last, 200)(this.N, this));
            this.O();
        }
        M() {
            this.f = document.createElement('div');
            this.f.classList.add('notebook-toolbar-left');
            this.c = new scrollableElement_1.$UP(this.f, {
                vertical: 2 /* ScrollbarVisibility.Hidden */,
                horizontal: 3 /* ScrollbarVisibility.Visible */,
                horizontalScrollbarSize: 3,
                useShadows: false,
                scrollYToX: true
            });
            this.B(this.c);
            DOM.$0O(this.domNode, this.c.getDomNode());
            this.g = document.createElement('div');
            this.g.classList.add('notebook-toolbar-right');
            DOM.$0O(this.domNode, this.g);
        }
        N() {
            if (this.I.activeEditorPane?.getId() === notebookCommon_1.$TH) {
                const notebookEditor = this.I.activeEditorPane.getControl();
                if (notebookEditor === this.notebookEditor) {
                    // this is the active editor
                    this.R();
                    return;
                }
            }
        }
        O() {
            this.h = this.B(this.H.createMenu(this.notebookEditor.creationOptions.menuIds.notebookToolbar, this.contextKeyService));
            this.B(this.h);
            this.s = this.notebookOptions.getLayoutConfiguration().globalToolbar;
            this.u = this.Q(this.F.getValue(notebookCommon_1.$7H.globalToolbarShowLabel));
            this.P();
            const context = {
                ui: true,
                notebookEditor: this.notebookEditor
            };
            const actionProvider = (action) => {
                if (action.id === coreActions_1.$6ob) {
                    // this is being disposed by the consumer
                    return this.D.createInstance(notebookKernelView_1.$$qb, action, this.notebookEditor);
                }
                if (this.u !== RenderLabel.Never) {
                    const a = this.m.find(a => a.action.id === action.id);
                    if (a && a.renderLabel) {
                        return action instanceof actions_2.$Vu ? this.D.createInstance(cellActionView_1.$mpb, action, undefined) : undefined;
                    }
                    else {
                        return action instanceof actions_2.$Vu ? this.D.createInstance(menuEntryActionViewItem_1.$C3, action, undefined) : undefined;
                    }
                }
                else {
                    return action instanceof actions_2.$Vu ? this.D.createInstance(menuEntryActionViewItem_1.$C3, action, undefined) : undefined;
                }
            };
            const leftToolbarOptions = {
                hiddenItemStrategy: 1 /* HiddenItemStrategy.RenderInSecondaryGroup */,
                resetMenu: actions_2.$Ru.NotebookToolbar,
                actionViewItemProvider: (action, options) => {
                    return this.t.actionProvider(action, options);
                },
                getKeyBinding: action => this.J.lookupKeybinding(action.id),
                renderDropdownAsChildElement: true,
            };
            this.j = this.D.createInstance(toolbar_2.$L6, this.f, leftToolbarOptions);
            this.B(this.j);
            this.j.context = context;
            this.r = new toolbar_1.$6R(this.g, this.G, {
                getKeyBinding: action => this.J.lookupKeybinding(action.id),
                actionViewItemProvider: actionProvider,
                renderDropdownAsChildElement: true
            });
            this.B(this.r);
            this.r.context = context;
            this.R();
            let dropdownIsVisible = false;
            let deferredUpdate;
            this.B(this.h.onDidChange(() => {
                if (dropdownIsVisible) {
                    deferredUpdate = () => this.R();
                    return;
                }
                if (this.notebookEditor.isVisible) {
                    this.R();
                }
            }));
            this.B(this.j.onDidChangeDropdownVisibility(visible => {
                dropdownIsVisible = visible;
                if (deferredUpdate && !visible) {
                    setTimeout(() => {
                        deferredUpdate?.();
                    }, 0);
                    deferredUpdate = undefined;
                }
            }));
            this.B(this.notebookOptions.onDidChangeOptions(e => {
                if (e.globalToolbar !== undefined) {
                    this.s = this.notebookOptions.getLayoutConfiguration().globalToolbar;
                    this.R();
                }
            }));
            this.B(this.F.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(notebookCommon_1.$7H.globalToolbarShowLabel)) {
                    this.u = this.Q(this.F.getValue(notebookCommon_1.$7H.globalToolbarShowLabel));
                    this.P();
                    const oldElement = this.j.getElement();
                    oldElement.parentElement?.removeChild(oldElement);
                    this.j.dispose();
                    this.j = this.D.createInstance(toolbar_2.$L6, this.f, leftToolbarOptions);
                    this.B(this.j);
                    this.j.context = context;
                    this.R();
                    return;
                }
            }));
            if (this.L) {
                this.L.getTreatment('nbtoolbarineditor').then(treatment => {
                    if (treatment === undefined) {
                        return;
                    }
                    if (this.s !== treatment) {
                        this.s = treatment;
                        this.R();
                    }
                });
            }
        }
        P() {
            switch (this.u) {
                case RenderLabel.Always:
                    this.t = new WorkbenchAlwaysLabelStrategy(this.notebookEditor, this, this.D);
                    break;
                case RenderLabel.Never:
                    this.t = new WorkbenchNeverLabelStrategy(this.notebookEditor, this, this.D);
                    break;
                case RenderLabel.Dynamic:
                    this.t = new WorkbenchDynamicLabelStrategy(this.notebookEditor, this, this.D);
                    break;
            }
        }
        Q(value) {
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
        R() {
            // when there is no view model, just ignore.
            if (!this.notebookEditor.hasModel()) {
                this.C?.dispose();
                this.C = undefined;
                this.visible = false;
                return;
            }
            if (this.C) {
                return;
            }
            if (!this.s) {
                this.domNode.style.display = 'none';
                this.C = undefined;
                this.visible = false;
            }
            else {
                this.C = (0, async_1.$Ig)(async () => {
                    await this.S();
                    this.visible = true;
                    this.C = undefined;
                }, 50);
            }
        }
        async S() {
            const groups = this.h.getActions({ shouldForwardArgs: true, renderShortTitle: true });
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
                    primaryActions.push(new actions_1.$ii());
                }
            });
            const primaryRightGroup = groups.find(group => /^status/.test(group[0]));
            const primaryRightActions = primaryRightGroup ? primaryRightGroup[1] : [];
            const secondaryActions = groups.filter(group => !/^navigation/.test(group[0]) && !/^status/.test(group[0])).reduce((prev, curr) => { prev.push(...curr[1]); return prev; }, []);
            this.j.setActions([], []);
            this.m = primaryActions.map(action => ({
                action: action,
                size: (action instanceof actions_1.$ii ? 1 : 0),
                renderLabel: true,
                visible: true
            }));
            this.j.setActions(primaryActions, secondaryActions);
            this.n = secondaryActions;
            this.r.setActions(primaryRightActions, []);
            this.n = secondaryActions;
            if (this.z && this.z.width >= 0 && this.z.height >= 0) {
                this.U(this.j);
            }
            this.W();
        }
        U(toolbar) {
            for (let i = 0; i < toolbar.getItemsLength(); i++) {
                const action = toolbar.getItemAction(i);
                if (action && action.id !== 'toolbar.toggle.more') {
                    const existing = this.m.find(a => a.action.id === action.id);
                    if (existing) {
                        existing.size = toolbar.getItemWidth(i);
                    }
                }
            }
        }
        W() {
            const toolbar = this.j;
            const rightToolbar = this.r;
            if (toolbar && rightToolbar && this.z && this.z.height >= 0 && this.z.width >= 0) {
                // compute size only if it's visible
                if (this.m.length === 0 && toolbar.getItemsLength() !== this.m.length) {
                    this.U(this.j);
                }
                if (this.m.length === 0) {
                    return;
                }
                const kernelWidth = (rightToolbar.getItemsLength() ? rightToolbar.getItemWidth(0) : 0) + ACTION_PADDING;
                const leftToolbarContainerMaxWidth = this.z.width - kernelWidth - (ACTION_PADDING + TOGGLE_MORE_ACTION_WIDTH) - ( /** toolbar left margin */ACTION_PADDING) - ( /** toolbar right margin */ACTION_PADDING);
                const calculatedActions = this.t.calculateActions(leftToolbarContainerMaxWidth);
                this.j.setActions(calculatedActions.primaryActions, calculatedActions.secondaryActions);
            }
        }
        layout(dimension) {
            this.z = dimension;
            if (!this.s) {
                this.domNode.style.display = 'none';
            }
            else {
                this.domNode.style.display = 'flex';
            }
            this.W();
        }
        dispose() {
            this.j.context = undefined;
            this.r.context = undefined;
            this.j.dispose();
            this.r.dispose();
            this.j = null;
            this.r = null;
            this.C?.dispose();
            this.C = undefined;
            super.dispose();
        }
    };
    exports.$grb = $grb;
    exports.$grb = $grb = __decorate([
        __param(4, instantiation_1.$Ah),
        __param(5, configuration_1.$8h),
        __param(6, contextView_1.$WZ),
        __param(7, actions_2.$Su),
        __param(8, editorService_1.$9C),
        __param(9, keybinding_1.$2D),
        __param(10, assignmentService_1.$drb)
    ], $grb);
    function $hrb(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth) {
        return actionOverflowHelper(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth, false);
    }
    exports.$hrb = $hrb;
    function $irb(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth) {
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
            if (initialPrimaryActions[i].action instanceof actions_1.$ii) {
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
    exports.$irb = $irb;
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
            if (actionModel.action instanceof actions_1.$ii && renderActions.length > 0 && renderActions[renderActions.length - 1].action instanceof actions_1.$ii) {
                continue;
            }
            // if a separator is the first nonZero action, ignore it
            if (actionModel.action instanceof actions_1.$ii && !nonZeroAction) {
                continue;
            }
            if (currentSize + itemSize <= leftToolbarContainerMaxWidth && !containerFull) {
                currentSize += ACTION_PADDING + itemSize;
                renderActions.push(actionModel);
                if (itemSize !== 0) {
                    nonZeroAction = true;
                }
                if (actionModel.action instanceof actions_1.$ii) {
                    nonZeroAction = false;
                }
            }
            else {
                containerFull = true;
                if (itemSize === 0) { // size 0 implies a hidden item, keep in primary to allow for Workbench to handle visibility
                    renderActions.push(actionModel);
                }
                else {
                    if (actionModel.action instanceof actions_1.$ii) { // never push a separator to overflow
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
            if (temp.action instanceof actions_1.$ii) {
                renderActions.splice(i, 1);
            }
            break;
        }
        if (renderActions.length && renderActions[renderActions.length - 1].action instanceof actions_1.$ii) {
            renderActions.pop();
        }
        if (overflow.length !== 0) {
            overflow.push(new actions_1.$ii());
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
//# sourceMappingURL=notebookEditorToolbar.js.map