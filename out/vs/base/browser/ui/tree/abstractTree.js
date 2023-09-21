/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/findinput/findInput", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/list/listView", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/tree/indexTreeModel", "vs/base/browser/ui/tree/tree", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/collections", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/types", "vs/nls", "vs/css!./media/tree"], function (require, exports, dom_1, event_1, keyboardEvent_1, actionbar_1, findInput_1, inputBox_1, listView_1, listWidget_1, toggle_1, indexTreeModel_1, tree_1, actions_1, arrays_1, async_1, codicons_1, themables_1, collections_1, event_2, filters_1, lifecycle_1, numbers_1, types_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractTree = exports.TreeFindMatchType = exports.TreeFindMode = exports.FuzzyToggle = exports.ModeToggle = exports.RenderIndentGuides = exports.AbstractTreeViewState = exports.ComposedTreeDelegate = void 0;
    class TreeElementsDragAndDropData extends listView_1.ElementsDragAndDropData {
        set context(context) {
            this.data.context = context;
        }
        get context() {
            return this.data.context;
        }
        constructor(data) {
            super(data.elements.map(node => node.element));
            this.data = data;
        }
    }
    function asTreeDragAndDropData(data) {
        if (data instanceof listView_1.ElementsDragAndDropData) {
            return new TreeElementsDragAndDropData(data);
        }
        return data;
    }
    class TreeNodeListDragAndDrop {
        constructor(modelProvider, dnd) {
            this.modelProvider = modelProvider;
            this.dnd = dnd;
            this.autoExpandDisposable = lifecycle_1.Disposable.None;
        }
        getDragURI(node) {
            return this.dnd.getDragURI(node.element);
        }
        getDragLabel(nodes, originalEvent) {
            if (this.dnd.getDragLabel) {
                return this.dnd.getDragLabel(nodes.map(node => node.element), originalEvent);
            }
            return undefined;
        }
        onDragStart(data, originalEvent) {
            this.dnd.onDragStart?.(asTreeDragAndDropData(data), originalEvent);
        }
        onDragOver(data, targetNode, targetIndex, originalEvent, raw = true) {
            const result = this.dnd.onDragOver(asTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, originalEvent);
            const didChangeAutoExpandNode = this.autoExpandNode !== targetNode;
            if (didChangeAutoExpandNode) {
                this.autoExpandDisposable.dispose();
                this.autoExpandNode = targetNode;
            }
            if (typeof targetNode === 'undefined') {
                return result;
            }
            if (didChangeAutoExpandNode && typeof result !== 'boolean' && result.autoExpand) {
                this.autoExpandDisposable = (0, async_1.disposableTimeout)(() => {
                    const model = this.modelProvider();
                    const ref = model.getNodeLocation(targetNode);
                    if (model.isCollapsed(ref)) {
                        model.setCollapsed(ref, false);
                    }
                    this.autoExpandNode = undefined;
                }, 500);
            }
            if (typeof result === 'boolean' || !result.accept || typeof result.bubble === 'undefined' || result.feedback) {
                if (!raw) {
                    const accept = typeof result === 'boolean' ? result : result.accept;
                    const effect = typeof result === 'boolean' ? undefined : result.effect;
                    return { accept, effect, feedback: [targetIndex] };
                }
                return result;
            }
            if (result.bubble === 1 /* TreeDragOverBubble.Up */) {
                const model = this.modelProvider();
                const ref = model.getNodeLocation(targetNode);
                const parentRef = model.getParentNodeLocation(ref);
                const parentNode = model.getNode(parentRef);
                const parentIndex = parentRef && model.getListIndex(parentRef);
                return this.onDragOver(data, parentNode, parentIndex, originalEvent, false);
            }
            const model = this.modelProvider();
            const ref = model.getNodeLocation(targetNode);
            const start = model.getListIndex(ref);
            const length = model.getListRenderCount(ref);
            return { ...result, feedback: (0, arrays_1.range)(start, start + length) };
        }
        drop(data, targetNode, targetIndex, originalEvent) {
            this.autoExpandDisposable.dispose();
            this.autoExpandNode = undefined;
            this.dnd.drop(asTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, originalEvent);
        }
        onDragEnd(originalEvent) {
            this.dnd.onDragEnd?.(originalEvent);
        }
    }
    function asListOptions(modelProvider, options) {
        return options && {
            ...options,
            identityProvider: options.identityProvider && {
                getId(el) {
                    return options.identityProvider.getId(el.element);
                }
            },
            dnd: options.dnd && new TreeNodeListDragAndDrop(modelProvider, options.dnd),
            multipleSelectionController: options.multipleSelectionController && {
                isSelectionSingleChangeEvent(e) {
                    return options.multipleSelectionController.isSelectionSingleChangeEvent({ ...e, element: e.element });
                },
                isSelectionRangeChangeEvent(e) {
                    return options.multipleSelectionController.isSelectionRangeChangeEvent({ ...e, element: e.element });
                }
            },
            accessibilityProvider: options.accessibilityProvider && {
                ...options.accessibilityProvider,
                getSetSize(node) {
                    const model = modelProvider();
                    const ref = model.getNodeLocation(node);
                    const parentRef = model.getParentNodeLocation(ref);
                    const parentNode = model.getNode(parentRef);
                    return parentNode.visibleChildrenCount;
                },
                getPosInSet(node) {
                    return node.visibleChildIndex + 1;
                },
                isChecked: options.accessibilityProvider && options.accessibilityProvider.isChecked ? (node) => {
                    return options.accessibilityProvider.isChecked(node.element);
                } : undefined,
                getRole: options.accessibilityProvider && options.accessibilityProvider.getRole ? (node) => {
                    return options.accessibilityProvider.getRole(node.element);
                } : () => 'treeitem',
                getAriaLabel(e) {
                    return options.accessibilityProvider.getAriaLabel(e.element);
                },
                getWidgetAriaLabel() {
                    return options.accessibilityProvider.getWidgetAriaLabel();
                },
                getWidgetRole: options.accessibilityProvider && options.accessibilityProvider.getWidgetRole ? () => options.accessibilityProvider.getWidgetRole() : () => 'tree',
                getAriaLevel: options.accessibilityProvider && options.accessibilityProvider.getAriaLevel ? (node) => options.accessibilityProvider.getAriaLevel(node.element) : (node) => {
                    return node.depth;
                },
                getActiveDescendantId: options.accessibilityProvider.getActiveDescendantId && (node => {
                    return options.accessibilityProvider.getActiveDescendantId(node.element);
                })
            },
            keyboardNavigationLabelProvider: options.keyboardNavigationLabelProvider && {
                ...options.keyboardNavigationLabelProvider,
                getKeyboardNavigationLabel(node) {
                    return options.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(node.element);
                }
            }
        };
    }
    class ComposedTreeDelegate {
        constructor(delegate) {
            this.delegate = delegate;
        }
        getHeight(element) {
            return this.delegate.getHeight(element.element);
        }
        getTemplateId(element) {
            return this.delegate.getTemplateId(element.element);
        }
        hasDynamicHeight(element) {
            return !!this.delegate.hasDynamicHeight && this.delegate.hasDynamicHeight(element.element);
        }
        setDynamicHeight(element, height) {
            this.delegate.setDynamicHeight?.(element.element, height);
        }
    }
    exports.ComposedTreeDelegate = ComposedTreeDelegate;
    class AbstractTreeViewState {
        static lift(state) {
            return state instanceof AbstractTreeViewState ? state : new AbstractTreeViewState(state);
        }
        static empty(scrollTop = 0) {
            return new AbstractTreeViewState({
                focus: [],
                selection: [],
                expanded: Object.create(null),
                scrollTop,
            });
        }
        constructor(state) {
            this.focus = new Set(state.focus);
            this.selection = new Set(state.selection);
            if (state.expanded instanceof Array) { // old format
                this.expanded = Object.create(null);
                for (const id of state.expanded) {
                    this.expanded[id] = 1;
                }
            }
            else {
                this.expanded = state.expanded;
            }
            this.expanded = state.expanded;
            this.scrollTop = state.scrollTop;
        }
        toJSON() {
            return {
                focus: Array.from(this.focus),
                selection: Array.from(this.selection),
                expanded: this.expanded,
                scrollTop: this.scrollTop,
            };
        }
    }
    exports.AbstractTreeViewState = AbstractTreeViewState;
    var RenderIndentGuides;
    (function (RenderIndentGuides) {
        RenderIndentGuides["None"] = "none";
        RenderIndentGuides["OnHover"] = "onHover";
        RenderIndentGuides["Always"] = "always";
    })(RenderIndentGuides || (exports.RenderIndentGuides = RenderIndentGuides = {}));
    class EventCollection {
        get elements() {
            return this._elements;
        }
        constructor(onDidChange, _elements = []) {
            this._elements = _elements;
            this.disposables = new lifecycle_1.DisposableStore();
            this.onDidChange = event_2.Event.forEach(onDidChange, elements => this._elements = elements, this.disposables);
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    class TreeRenderer {
        static { this.DefaultIndent = 8; }
        constructor(renderer, modelProvider, onDidChangeCollapseState, activeNodes, renderedIndentGuides, options = {}) {
            this.renderer = renderer;
            this.modelProvider = modelProvider;
            this.activeNodes = activeNodes;
            this.renderedIndentGuides = renderedIndentGuides;
            this.renderedElements = new Map();
            this.renderedNodes = new Map();
            this.indent = TreeRenderer.DefaultIndent;
            this.hideTwistiesOfChildlessElements = false;
            this.shouldRenderIndentGuides = false;
            this.activeIndentNodes = new Set();
            this.indentGuidesDisposable = lifecycle_1.Disposable.None;
            this.disposables = new lifecycle_1.DisposableStore();
            this.templateId = renderer.templateId;
            this.updateOptions(options);
            event_2.Event.map(onDidChangeCollapseState, e => e.node)(this.onDidChangeNodeTwistieState, this, this.disposables);
            renderer.onDidChangeTwistieState?.(this.onDidChangeTwistieState, this, this.disposables);
        }
        updateOptions(options = {}) {
            if (typeof options.indent !== 'undefined') {
                const indent = (0, numbers_1.clamp)(options.indent, 0, 40);
                if (indent !== this.indent) {
                    this.indent = indent;
                    for (const [node, templateData] of this.renderedNodes) {
                        this.renderTreeElement(node, templateData);
                    }
                }
            }
            if (typeof options.renderIndentGuides !== 'undefined') {
                const shouldRenderIndentGuides = options.renderIndentGuides !== RenderIndentGuides.None;
                if (shouldRenderIndentGuides !== this.shouldRenderIndentGuides) {
                    this.shouldRenderIndentGuides = shouldRenderIndentGuides;
                    for (const [node, templateData] of this.renderedNodes) {
                        this._renderIndentGuides(node, templateData);
                    }
                    this.indentGuidesDisposable.dispose();
                    if (shouldRenderIndentGuides) {
                        const disposables = new lifecycle_1.DisposableStore();
                        this.activeNodes.onDidChange(this._onDidChangeActiveNodes, this, disposables);
                        this.indentGuidesDisposable = disposables;
                        this._onDidChangeActiveNodes(this.activeNodes.elements);
                    }
                }
            }
            if (typeof options.hideTwistiesOfChildlessElements !== 'undefined') {
                this.hideTwistiesOfChildlessElements = options.hideTwistiesOfChildlessElements;
            }
        }
        renderTemplate(container) {
            const el = (0, dom_1.append)(container, (0, dom_1.$)('.monaco-tl-row'));
            const indent = (0, dom_1.append)(el, (0, dom_1.$)('.monaco-tl-indent'));
            const twistie = (0, dom_1.append)(el, (0, dom_1.$)('.monaco-tl-twistie'));
            const contents = (0, dom_1.append)(el, (0, dom_1.$)('.monaco-tl-contents'));
            const templateData = this.renderer.renderTemplate(contents);
            return { container, indent, twistie, indentGuidesDisposable: lifecycle_1.Disposable.None, templateData };
        }
        renderElement(node, index, templateData, height) {
            this.renderedNodes.set(node, templateData);
            this.renderedElements.set(node.element, node);
            this.renderTreeElement(node, templateData);
            this.renderer.renderElement(node, index, templateData.templateData, height);
        }
        disposeElement(node, index, templateData, height) {
            templateData.indentGuidesDisposable.dispose();
            this.renderer.disposeElement?.(node, index, templateData.templateData, height);
            if (typeof height === 'number') {
                this.renderedNodes.delete(node);
                this.renderedElements.delete(node.element);
            }
        }
        disposeTemplate(templateData) {
            this.renderer.disposeTemplate(templateData.templateData);
        }
        onDidChangeTwistieState(element) {
            const node = this.renderedElements.get(element);
            if (!node) {
                return;
            }
            this.onDidChangeNodeTwistieState(node);
        }
        onDidChangeNodeTwistieState(node) {
            const templateData = this.renderedNodes.get(node);
            if (!templateData) {
                return;
            }
            this._onDidChangeActiveNodes(this.activeNodes.elements);
            this.renderTreeElement(node, templateData);
        }
        renderTreeElement(node, templateData) {
            const indent = TreeRenderer.DefaultIndent + (node.depth - 1) * this.indent;
            templateData.twistie.style.paddingLeft = `${indent}px`;
            templateData.indent.style.width = `${indent + this.indent - 16}px`;
            if (node.collapsible) {
                templateData.container.setAttribute('aria-expanded', String(!node.collapsed));
            }
            else {
                templateData.container.removeAttribute('aria-expanded');
            }
            templateData.twistie.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.treeItemExpanded));
            let twistieRendered = false;
            if (this.renderer.renderTwistie) {
                twistieRendered = this.renderer.renderTwistie(node.element, templateData.twistie);
            }
            if (node.collapsible && (!this.hideTwistiesOfChildlessElements || node.visibleChildrenCount > 0)) {
                if (!twistieRendered) {
                    templateData.twistie.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.treeItemExpanded));
                }
                templateData.twistie.classList.add('collapsible');
                templateData.twistie.classList.toggle('collapsed', node.collapsed);
            }
            else {
                templateData.twistie.classList.remove('collapsible', 'collapsed');
            }
            this._renderIndentGuides(node, templateData);
        }
        _renderIndentGuides(node, templateData) {
            (0, dom_1.clearNode)(templateData.indent);
            templateData.indentGuidesDisposable.dispose();
            if (!this.shouldRenderIndentGuides) {
                return;
            }
            const disposableStore = new lifecycle_1.DisposableStore();
            const model = this.modelProvider();
            while (true) {
                const ref = model.getNodeLocation(node);
                const parentRef = model.getParentNodeLocation(ref);
                if (!parentRef) {
                    break;
                }
                const parent = model.getNode(parentRef);
                const guide = (0, dom_1.$)('.indent-guide', { style: `width: ${this.indent}px` });
                if (this.activeIndentNodes.has(parent)) {
                    guide.classList.add('active');
                }
                if (templateData.indent.childElementCount === 0) {
                    templateData.indent.appendChild(guide);
                }
                else {
                    templateData.indent.insertBefore(guide, templateData.indent.firstElementChild);
                }
                this.renderedIndentGuides.add(parent, guide);
                disposableStore.add((0, lifecycle_1.toDisposable)(() => this.renderedIndentGuides.delete(parent, guide)));
                node = parent;
            }
            templateData.indentGuidesDisposable = disposableStore;
        }
        _onDidChangeActiveNodes(nodes) {
            if (!this.shouldRenderIndentGuides) {
                return;
            }
            const set = new Set();
            const model = this.modelProvider();
            nodes.forEach(node => {
                const ref = model.getNodeLocation(node);
                try {
                    const parentRef = model.getParentNodeLocation(ref);
                    if (node.collapsible && node.children.length > 0 && !node.collapsed) {
                        set.add(node);
                    }
                    else if (parentRef) {
                        set.add(model.getNode(parentRef));
                    }
                }
                catch {
                    // noop
                }
            });
            this.activeIndentNodes.forEach(node => {
                if (!set.has(node)) {
                    this.renderedIndentGuides.forEach(node, line => line.classList.remove('active'));
                }
            });
            set.forEach(node => {
                if (!this.activeIndentNodes.has(node)) {
                    this.renderedIndentGuides.forEach(node, line => line.classList.add('active'));
                }
            });
            this.activeIndentNodes = set;
        }
        dispose() {
            this.renderedNodes.clear();
            this.renderedElements.clear();
            this.indentGuidesDisposable.dispose();
            (0, lifecycle_1.dispose)(this.disposables);
        }
    }
    class FindFilter {
        get totalCount() { return this._totalCount; }
        get matchCount() { return this._matchCount; }
        set pattern(pattern) {
            this._pattern = pattern;
            this._lowercasePattern = pattern.toLowerCase();
        }
        constructor(tree, keyboardNavigationLabelProvider, _filter) {
            this.tree = tree;
            this.keyboardNavigationLabelProvider = keyboardNavigationLabelProvider;
            this._filter = _filter;
            this._totalCount = 0;
            this._matchCount = 0;
            this._pattern = '';
            this._lowercasePattern = '';
            this.disposables = new lifecycle_1.DisposableStore();
            tree.onWillRefilter(this.reset, this, this.disposables);
        }
        filter(element, parentVisibility) {
            let visibility = 1 /* TreeVisibility.Visible */;
            if (this._filter) {
                const result = this._filter.filter(element, parentVisibility);
                if (typeof result === 'boolean') {
                    visibility = result ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */;
                }
                else if ((0, indexTreeModel_1.isFilterResult)(result)) {
                    visibility = (0, indexTreeModel_1.getVisibleState)(result.visibility);
                }
                else {
                    visibility = result;
                }
                if (visibility === 0 /* TreeVisibility.Hidden */) {
                    return false;
                }
            }
            this._totalCount++;
            if (!this._pattern) {
                this._matchCount++;
                return { data: filters_1.FuzzyScore.Default, visibility };
            }
            const label = this.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(element);
            const labels = Array.isArray(label) ? label : [label];
            for (const l of labels) {
                const labelStr = l && l.toString();
                if (typeof labelStr === 'undefined') {
                    return { data: filters_1.FuzzyScore.Default, visibility };
                }
                let score;
                if (this.tree.findMatchType === TreeFindMatchType.Contiguous) {
                    const index = labelStr.toLowerCase().indexOf(this._lowercasePattern);
                    if (index > -1) {
                        score = [Number.MAX_SAFE_INTEGER, 0];
                        for (let i = this._lowercasePattern.length; i > 0; i--) {
                            score.push(index + i - 1);
                        }
                    }
                }
                else {
                    score = (0, filters_1.fuzzyScore)(this._pattern, this._lowercasePattern, 0, labelStr, labelStr.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
                }
                if (score) {
                    this._matchCount++;
                    return labels.length === 1 ?
                        { data: score, visibility } :
                        { data: { label: labelStr, score: score }, visibility };
                }
            }
            if (this.tree.findMode === TreeFindMode.Filter) {
                if (typeof this.tree.options.defaultFindVisibility === 'number') {
                    return this.tree.options.defaultFindVisibility;
                }
                else if (this.tree.options.defaultFindVisibility) {
                    return this.tree.options.defaultFindVisibility(element);
                }
                else {
                    return 2 /* TreeVisibility.Recurse */;
                }
            }
            else {
                return { data: filters_1.FuzzyScore.Default, visibility };
            }
        }
        reset() {
            this._totalCount = 0;
            this._matchCount = 0;
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.disposables);
        }
    }
    class ModeToggle extends toggle_1.Toggle {
        constructor(opts) {
            super({
                icon: codicons_1.Codicon.listFilter,
                title: (0, nls_1.localize)('filter', "Filter"),
                isChecked: opts.isChecked ?? false,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.ModeToggle = ModeToggle;
    class FuzzyToggle extends toggle_1.Toggle {
        constructor(opts) {
            super({
                icon: codicons_1.Codicon.searchFuzzy,
                title: (0, nls_1.localize)('fuzzySearch', "Fuzzy Match"),
                isChecked: opts.isChecked ?? false,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.FuzzyToggle = FuzzyToggle;
    const unthemedFindWidgetStyles = {
        inputBoxStyles: inputBox_1.unthemedInboxStyles,
        toggleStyles: toggle_1.unthemedToggleStyles,
        listFilterWidgetBackground: undefined,
        listFilterWidgetNoMatchesOutline: undefined,
        listFilterWidgetOutline: undefined,
        listFilterWidgetShadow: undefined
    };
    var TreeFindMode;
    (function (TreeFindMode) {
        TreeFindMode[TreeFindMode["Highlight"] = 0] = "Highlight";
        TreeFindMode[TreeFindMode["Filter"] = 1] = "Filter";
    })(TreeFindMode || (exports.TreeFindMode = TreeFindMode = {}));
    var TreeFindMatchType;
    (function (TreeFindMatchType) {
        TreeFindMatchType[TreeFindMatchType["Fuzzy"] = 0] = "Fuzzy";
        TreeFindMatchType[TreeFindMatchType["Contiguous"] = 1] = "Contiguous";
    })(TreeFindMatchType || (exports.TreeFindMatchType = TreeFindMatchType = {}));
    class FindWidget extends lifecycle_1.Disposable {
        set mode(mode) {
            this.modeToggle.checked = mode === TreeFindMode.Filter;
            this.findInput.inputBox.setPlaceHolder(mode === TreeFindMode.Filter ? (0, nls_1.localize)('type to filter', "Type to filter") : (0, nls_1.localize)('type to search', "Type to search"));
        }
        set matchType(matchType) {
            this.matchTypeToggle.checked = matchType === TreeFindMatchType.Fuzzy;
        }
        get value() {
            return this.findInput.inputBox.value;
        }
        set value(value) {
            this.findInput.inputBox.value = value;
        }
        constructor(container, tree, contextViewProvider, mode, matchType, options) {
            super();
            this.tree = tree;
            this.elements = (0, dom_1.h)('.monaco-tree-type-filter', [
                (0, dom_1.h)('.monaco-tree-type-filter-grab.codicon.codicon-debug-gripper@grab', { tabIndex: 0 }),
                (0, dom_1.h)('.monaco-tree-type-filter-input@findInput'),
                (0, dom_1.h)('.monaco-tree-type-filter-actionbar@actionbar'),
            ]);
            this.width = 0;
            this.right = 0;
            this.top = 0;
            this._onDidDisable = new event_2.Emitter();
            this.onDidDisable = this._onDidDisable.event;
            container.appendChild(this.elements.root);
            this._register((0, lifecycle_1.toDisposable)(() => container.removeChild(this.elements.root)));
            const styles = options?.styles ?? unthemedFindWidgetStyles;
            if (styles.listFilterWidgetBackground) {
                this.elements.root.style.backgroundColor = styles.listFilterWidgetBackground;
            }
            if (styles.listFilterWidgetShadow) {
                this.elements.root.style.boxShadow = `0 0 8px 2px ${styles.listFilterWidgetShadow}`;
            }
            this.modeToggle = this._register(new ModeToggle({ ...styles.toggleStyles, isChecked: mode === TreeFindMode.Filter }));
            this.matchTypeToggle = this._register(new FuzzyToggle({ ...styles.toggleStyles, isChecked: matchType === TreeFindMatchType.Fuzzy }));
            this.onDidChangeMode = event_2.Event.map(this.modeToggle.onChange, () => this.modeToggle.checked ? TreeFindMode.Filter : TreeFindMode.Highlight, this._store);
            this.onDidChangeMatchType = event_2.Event.map(this.matchTypeToggle.onChange, () => this.matchTypeToggle.checked ? TreeFindMatchType.Fuzzy : TreeFindMatchType.Contiguous, this._store);
            this.findInput = this._register(new findInput_1.FindInput(this.elements.findInput, contextViewProvider, {
                label: (0, nls_1.localize)('type to search', "Type to search"),
                additionalToggles: [this.modeToggle, this.matchTypeToggle],
                showCommonFindToggles: false,
                inputBoxStyles: styles.inputBoxStyles,
                toggleStyles: styles.toggleStyles,
                history: options?.history
            }));
            this.actionbar = this._register(new actionbar_1.ActionBar(this.elements.actionbar));
            this.mode = mode;
            const emitter = this._register(new event_1.DomEmitter(this.findInput.inputBox.inputElement, 'keydown'));
            const onKeyDown = event_2.Event.chain(emitter.event, $ => $.map(e => new keyboardEvent_1.StandardKeyboardEvent(e)));
            this._register(onKeyDown((e) => {
                // Using equals() so we reserve modified keys for future use
                if (e.equals(3 /* KeyCode.Enter */)) {
                    // This is the only keyboard way to return to the tree from a history item that isn't the last one
                    e.preventDefault();
                    e.stopPropagation();
                    this.findInput.inputBox.addToHistory();
                    this.tree.domFocus();
                    return;
                }
                if (e.equals(18 /* KeyCode.DownArrow */)) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.findInput.inputBox.isAtLastInHistory() || this.findInput.inputBox.isNowhereInHistory()) {
                        // Retain original pre-history DownArrow behavior
                        this.findInput.inputBox.addToHistory();
                        this.tree.domFocus();
                    }
                    else {
                        // Downward through history
                        this.findInput.inputBox.showNextValue();
                    }
                    return;
                }
                if (e.equals(16 /* KeyCode.UpArrow */)) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Upward through history
                    this.findInput.inputBox.showPreviousValue();
                    return;
                }
            }));
            const closeAction = this._register(new actions_1.Action('close', (0, nls_1.localize)('close', "Close"), 'codicon codicon-close', true, () => this.dispose()));
            this.actionbar.push(closeAction, { icon: true, label: false });
            const onGrabMouseDown = this._register(new event_1.DomEmitter(this.elements.grab, 'mousedown'));
            this._register(onGrabMouseDown.event(e => {
                const disposables = new lifecycle_1.DisposableStore();
                const onWindowMouseMove = disposables.add(new event_1.DomEmitter(window, 'mousemove'));
                const onWindowMouseUp = disposables.add(new event_1.DomEmitter(window, 'mouseup'));
                const startRight = this.right;
                const startX = e.pageX;
                const startTop = this.top;
                const startY = e.pageY;
                this.elements.grab.classList.add('grabbing');
                const transition = this.elements.root.style.transition;
                this.elements.root.style.transition = 'unset';
                const update = (e) => {
                    const deltaX = e.pageX - startX;
                    this.right = startRight - deltaX;
                    const deltaY = e.pageY - startY;
                    this.top = startTop + deltaY;
                    this.layout();
                };
                disposables.add(onWindowMouseMove.event(update));
                disposables.add(onWindowMouseUp.event(e => {
                    update(e);
                    this.elements.grab.classList.remove('grabbing');
                    this.elements.root.style.transition = transition;
                    disposables.dispose();
                }));
            }));
            const onGrabKeyDown = event_2.Event.chain(this._register(new event_1.DomEmitter(this.elements.grab, 'keydown')).event, $ => $.map(e => new keyboardEvent_1.StandardKeyboardEvent(e)));
            this._register(onGrabKeyDown((e) => {
                let right;
                let top;
                if (e.keyCode === 15 /* KeyCode.LeftArrow */) {
                    right = Number.POSITIVE_INFINITY;
                }
                else if (e.keyCode === 17 /* KeyCode.RightArrow */) {
                    right = 0;
                }
                else if (e.keyCode === 10 /* KeyCode.Space */) {
                    right = this.right === 0 ? Number.POSITIVE_INFINITY : 0;
                }
                if (e.keyCode === 16 /* KeyCode.UpArrow */) {
                    top = 0;
                }
                else if (e.keyCode === 18 /* KeyCode.DownArrow */) {
                    top = Number.POSITIVE_INFINITY;
                }
                if (right !== undefined) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.right = right;
                    this.layout();
                }
                if (top !== undefined) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.top = top;
                    const transition = this.elements.root.style.transition;
                    this.elements.root.style.transition = 'unset';
                    this.layout();
                    setTimeout(() => {
                        this.elements.root.style.transition = transition;
                    }, 0);
                }
            }));
            this.onDidChangeValue = this.findInput.onDidChange;
        }
        getHistory() {
            return this.findInput.inputBox.getHistory();
        }
        focus() {
            this.findInput.focus();
        }
        select() {
            this.findInput.select();
            // Reposition to last in history
            this.findInput.inputBox.addToHistory(true);
        }
        layout(width = this.width) {
            this.width = width;
            this.right = (0, numbers_1.clamp)(this.right, 0, Math.max(0, width - 212));
            this.elements.root.style.right = `${this.right}px`;
            this.top = (0, numbers_1.clamp)(this.top, 0, 24);
            this.elements.root.style.top = `${this.top}px`;
        }
        showMessage(message) {
            this.findInput.showMessage(message);
        }
        clearMessage() {
            this.findInput.clearMessage();
        }
        async dispose() {
            this._onDidDisable.fire();
            this.elements.root.classList.add('disabled');
            await (0, async_1.timeout)(300);
            super.dispose();
        }
    }
    class FindController {
        get pattern() { return this._pattern; }
        get mode() { return this._mode; }
        set mode(mode) {
            if (mode === this._mode) {
                return;
            }
            this._mode = mode;
            if (this.widget) {
                this.widget.mode = this._mode;
            }
            this.tree.refilter();
            this.render();
            this._onDidChangeMode.fire(mode);
        }
        get matchType() { return this._matchType; }
        set matchType(matchType) {
            if (matchType === this._matchType) {
                return;
            }
            this._matchType = matchType;
            if (this.widget) {
                this.widget.matchType = this._matchType;
            }
            this.tree.refilter();
            this.render();
            this._onDidChangeMatchType.fire(matchType);
        }
        constructor(tree, model, view, filter, contextViewProvider, options = {}) {
            this.tree = tree;
            this.view = view;
            this.filter = filter;
            this.contextViewProvider = contextViewProvider;
            this.options = options;
            this._pattern = '';
            this.previousPattern = '';
            this.width = 0;
            this._onDidChangeMode = new event_2.Emitter();
            this.onDidChangeMode = this._onDidChangeMode.event;
            this._onDidChangeMatchType = new event_2.Emitter();
            this.onDidChangeMatchType = this._onDidChangeMatchType.event;
            this._onDidChangePattern = new event_2.Emitter();
            this.onDidChangePattern = this._onDidChangePattern.event;
            this._onDidChangeOpenState = new event_2.Emitter();
            this.onDidChangeOpenState = this._onDidChangeOpenState.event;
            this.enabledDisposables = new lifecycle_1.DisposableStore();
            this.disposables = new lifecycle_1.DisposableStore();
            this._mode = tree.options.defaultFindMode ?? TreeFindMode.Highlight;
            this._matchType = tree.options.defaultFindMatchType ?? TreeFindMatchType.Fuzzy;
            model.onDidSplice(this.onDidSpliceModel, this, this.disposables);
        }
        updateOptions(optionsUpdate = {}) {
            if (optionsUpdate.defaultFindMode !== undefined) {
                this.mode = optionsUpdate.defaultFindMode;
            }
            if (optionsUpdate.defaultFindMatchType !== undefined) {
                this.matchType = optionsUpdate.defaultFindMatchType;
            }
        }
        open() {
            if (this.widget) {
                this.widget.focus();
                this.widget.select();
                return;
            }
            this.widget = new FindWidget(this.view.getHTMLElement(), this.tree, this.contextViewProvider, this.mode, this.matchType, { ...this.options, history: this._history });
            this.enabledDisposables.add(this.widget);
            this.widget.onDidChangeValue(this.onDidChangeValue, this, this.enabledDisposables);
            this.widget.onDidChangeMode(mode => this.mode = mode, undefined, this.enabledDisposables);
            this.widget.onDidChangeMatchType(matchType => this.matchType = matchType, undefined, this.enabledDisposables);
            this.widget.onDidDisable(this.close, this, this.enabledDisposables);
            this.widget.layout(this.width);
            this.widget.focus();
            this.widget.value = this.previousPattern;
            this.widget.select();
            this._onDidChangeOpenState.fire(true);
        }
        close() {
            if (!this.widget) {
                return;
            }
            this._history = this.widget.getHistory();
            this.widget = undefined;
            this.enabledDisposables.clear();
            this.previousPattern = this.pattern;
            this.onDidChangeValue('');
            this.tree.domFocus();
            this._onDidChangeOpenState.fire(false);
        }
        onDidChangeValue(pattern) {
            this._pattern = pattern;
            this._onDidChangePattern.fire(pattern);
            this.filter.pattern = pattern;
            this.tree.refilter();
            if (pattern) {
                this.tree.focusNext(0, true, undefined, node => !filters_1.FuzzyScore.isDefault(node.filterData));
            }
            const focus = this.tree.getFocus();
            if (focus.length > 0) {
                const element = focus[0];
                if (this.tree.getRelativeTop(element) === null) {
                    this.tree.reveal(element, 0.5);
                }
            }
            this.render();
        }
        onDidSpliceModel() {
            if (!this.widget || this.pattern.length === 0) {
                return;
            }
            this.tree.refilter();
            this.render();
        }
        render() {
            const noMatches = this.filter.totalCount > 0 && this.filter.matchCount === 0;
            if (this.pattern && noMatches) {
                if (this.tree.options.showNotFoundMessage ?? true) {
                    this.widget?.showMessage({ type: 2 /* MessageType.WARNING */, content: (0, nls_1.localize)('not found', "No elements found.") });
                }
                else {
                    this.widget?.showMessage({ type: 2 /* MessageType.WARNING */ });
                }
            }
            else {
                this.widget?.clearMessage();
            }
        }
        shouldAllowFocus(node) {
            if (!this.widget || !this.pattern || this._mode === TreeFindMode.Filter) {
                return true;
            }
            if (this.filter.totalCount > 0 && this.filter.matchCount <= 1) {
                return true;
            }
            return !filters_1.FuzzyScore.isDefault(node.filterData);
        }
        layout(width) {
            this.width = width;
            this.widget?.layout(width);
        }
        dispose() {
            this._history = undefined;
            this._onDidChangePattern.dispose();
            this.enabledDisposables.dispose();
            this.disposables.dispose();
        }
    }
    function asTreeMouseEvent(event) {
        let target = tree_1.TreeMouseEventTarget.Unknown;
        if ((0, dom_1.hasParentWithClass)(event.browserEvent.target, 'monaco-tl-twistie', 'monaco-tl-row')) {
            target = tree_1.TreeMouseEventTarget.Twistie;
        }
        else if ((0, dom_1.hasParentWithClass)(event.browserEvent.target, 'monaco-tl-contents', 'monaco-tl-row')) {
            target = tree_1.TreeMouseEventTarget.Element;
        }
        else if ((0, dom_1.hasParentWithClass)(event.browserEvent.target, 'monaco-tree-type-filter', 'monaco-list')) {
            target = tree_1.TreeMouseEventTarget.Filter;
        }
        return {
            browserEvent: event.browserEvent,
            element: event.element ? event.element.element : null,
            target
        };
    }
    function asTreeContextMenuEvent(event) {
        return {
            element: event.element ? event.element.element : null,
            browserEvent: event.browserEvent,
            anchor: event.anchor
        };
    }
    function dfs(node, fn) {
        fn(node);
        node.children.forEach(child => dfs(child, fn));
    }
    /**
     * The trait concept needs to exist at the tree level, because collapsed
     * tree nodes will not be known by the list.
     */
    class Trait {
        get nodeSet() {
            if (!this._nodeSet) {
                this._nodeSet = this.createNodeSet();
            }
            return this._nodeSet;
        }
        constructor(getFirstViewElementWithTrait, identityProvider) {
            this.getFirstViewElementWithTrait = getFirstViewElementWithTrait;
            this.identityProvider = identityProvider;
            this.nodes = [];
            this._onDidChange = new event_2.Emitter();
            this.onDidChange = this._onDidChange.event;
        }
        set(nodes, browserEvent) {
            if (!browserEvent?.__forceEvent && (0, arrays_1.equals)(this.nodes, nodes)) {
                return;
            }
            this._set(nodes, false, browserEvent);
        }
        _set(nodes, silent, browserEvent) {
            this.nodes = [...nodes];
            this.elements = undefined;
            this._nodeSet = undefined;
            if (!silent) {
                const that = this;
                this._onDidChange.fire({ get elements() { return that.get(); }, browserEvent });
            }
        }
        get() {
            if (!this.elements) {
                this.elements = this.nodes.map(node => node.element);
            }
            return [...this.elements];
        }
        getNodes() {
            return this.nodes;
        }
        has(node) {
            return this.nodeSet.has(node);
        }
        onDidModelSplice({ insertedNodes, deletedNodes }) {
            if (!this.identityProvider) {
                const set = this.createNodeSet();
                const visit = (node) => set.delete(node);
                deletedNodes.forEach(node => dfs(node, visit));
                this.set([...set.values()]);
                return;
            }
            const deletedNodesIdSet = new Set();
            const deletedNodesVisitor = (node) => deletedNodesIdSet.add(this.identityProvider.getId(node.element).toString());
            deletedNodes.forEach(node => dfs(node, deletedNodesVisitor));
            const insertedNodesMap = new Map();
            const insertedNodesVisitor = (node) => insertedNodesMap.set(this.identityProvider.getId(node.element).toString(), node);
            insertedNodes.forEach(node => dfs(node, insertedNodesVisitor));
            const nodes = [];
            for (const node of this.nodes) {
                const id = this.identityProvider.getId(node.element).toString();
                const wasDeleted = deletedNodesIdSet.has(id);
                if (!wasDeleted) {
                    nodes.push(node);
                }
                else {
                    const insertedNode = insertedNodesMap.get(id);
                    if (insertedNode && insertedNode.visible) {
                        nodes.push(insertedNode);
                    }
                }
            }
            if (this.nodes.length > 0 && nodes.length === 0) {
                const node = this.getFirstViewElementWithTrait();
                if (node) {
                    nodes.push(node);
                }
            }
            this._set(nodes, true);
        }
        createNodeSet() {
            const set = new Set();
            for (const node of this.nodes) {
                set.add(node);
            }
            return set;
        }
    }
    class TreeNodeListMouseController extends listWidget_1.MouseController {
        constructor(list, tree) {
            super(list);
            this.tree = tree;
        }
        onViewPointer(e) {
            if ((0, listWidget_1.isButton)(e.browserEvent.target) ||
                (0, listWidget_1.isInputElement)(e.browserEvent.target) ||
                (0, listWidget_1.isMonacoEditor)(e.browserEvent.target)) {
                return;
            }
            if (e.browserEvent.isHandledByList) {
                return;
            }
            const node = e.element;
            if (!node) {
                return super.onViewPointer(e);
            }
            if (this.isSelectionRangeChangeEvent(e) || this.isSelectionSingleChangeEvent(e)) {
                return super.onViewPointer(e);
            }
            const target = e.browserEvent.target;
            const onTwistie = target.classList.contains('monaco-tl-twistie')
                || (target.classList.contains('monaco-icon-label') && target.classList.contains('folder-icon') && e.browserEvent.offsetX < 16);
            let expandOnlyOnTwistieClick = false;
            if (typeof this.tree.expandOnlyOnTwistieClick === 'function') {
                expandOnlyOnTwistieClick = this.tree.expandOnlyOnTwistieClick(node.element);
            }
            else {
                expandOnlyOnTwistieClick = !!this.tree.expandOnlyOnTwistieClick;
            }
            if (expandOnlyOnTwistieClick && !onTwistie && e.browserEvent.detail !== 2) {
                return super.onViewPointer(e);
            }
            if (!this.tree.expandOnDoubleClick && e.browserEvent.detail === 2) {
                return super.onViewPointer(e);
            }
            if (node.collapsible) {
                const location = this.tree.getNodeLocation(node);
                const recursive = e.browserEvent.altKey;
                this.tree.setFocus([location]);
                this.tree.toggleCollapsed(location, recursive);
                if (expandOnlyOnTwistieClick && onTwistie) {
                    // Do not set this before calling a handler on the super class, because it will reject it as handled
                    e.browserEvent.isHandledByList = true;
                    return;
                }
            }
            super.onViewPointer(e);
        }
        onDoubleClick(e) {
            const onTwistie = e.browserEvent.target.classList.contains('monaco-tl-twistie');
            if (onTwistie || !this.tree.expandOnDoubleClick) {
                return;
            }
            if (e.browserEvent.isHandledByList) {
                return;
            }
            super.onDoubleClick(e);
        }
    }
    /**
     * We use this List subclass to restore selection and focus as nodes
     * get rendered in the list, possibly due to a node expand() call.
     */
    class TreeNodeList extends listWidget_1.List {
        constructor(user, container, virtualDelegate, renderers, focusTrait, selectionTrait, anchorTrait, options) {
            super(user, container, virtualDelegate, renderers, options);
            this.focusTrait = focusTrait;
            this.selectionTrait = selectionTrait;
            this.anchorTrait = anchorTrait;
        }
        createMouseController(options) {
            return new TreeNodeListMouseController(this, options.tree);
        }
        splice(start, deleteCount, elements = []) {
            super.splice(start, deleteCount, elements);
            if (elements.length === 0) {
                return;
            }
            const additionalFocus = [];
            const additionalSelection = [];
            let anchor;
            elements.forEach((node, index) => {
                if (this.focusTrait.has(node)) {
                    additionalFocus.push(start + index);
                }
                if (this.selectionTrait.has(node)) {
                    additionalSelection.push(start + index);
                }
                if (this.anchorTrait.has(node)) {
                    anchor = start + index;
                }
            });
            if (additionalFocus.length > 0) {
                super.setFocus((0, arrays_1.distinct)([...super.getFocus(), ...additionalFocus]));
            }
            if (additionalSelection.length > 0) {
                super.setSelection((0, arrays_1.distinct)([...super.getSelection(), ...additionalSelection]));
            }
            if (typeof anchor === 'number') {
                super.setAnchor(anchor);
            }
        }
        setFocus(indexes, browserEvent, fromAPI = false) {
            super.setFocus(indexes, browserEvent);
            if (!fromAPI) {
                this.focusTrait.set(indexes.map(i => this.element(i)), browserEvent);
            }
        }
        setSelection(indexes, browserEvent, fromAPI = false) {
            super.setSelection(indexes, browserEvent);
            if (!fromAPI) {
                this.selectionTrait.set(indexes.map(i => this.element(i)), browserEvent);
            }
        }
        setAnchor(index, fromAPI = false) {
            super.setAnchor(index);
            if (!fromAPI) {
                if (typeof index === 'undefined') {
                    this.anchorTrait.set([]);
                }
                else {
                    this.anchorTrait.set([this.element(index)]);
                }
            }
        }
    }
    class AbstractTree {
        get onDidScroll() { return this.view.onDidScroll; }
        get onDidChangeFocus() { return this.eventBufferer.wrapEvent(this.focus.onDidChange); }
        get onDidChangeSelection() { return this.eventBufferer.wrapEvent(this.selection.onDidChange); }
        get onMouseClick() { return event_2.Event.map(this.view.onMouseClick, asTreeMouseEvent); }
        get onMouseDblClick() { return event_2.Event.filter(event_2.Event.map(this.view.onMouseDblClick, asTreeMouseEvent), e => e.target !== tree_1.TreeMouseEventTarget.Filter); }
        get onContextMenu() { return event_2.Event.map(this.view.onContextMenu, asTreeContextMenuEvent); }
        get onTap() { return event_2.Event.map(this.view.onTap, asTreeMouseEvent); }
        get onPointer() { return event_2.Event.map(this.view.onPointer, asTreeMouseEvent); }
        get onKeyDown() { return this.view.onKeyDown; }
        get onKeyUp() { return this.view.onKeyUp; }
        get onKeyPress() { return this.view.onKeyPress; }
        get onDidFocus() { return this.view.onDidFocus; }
        get onDidBlur() { return this.view.onDidBlur; }
        get onDidChangeModel() { return event_2.Event.signal(this.model.onDidSplice); }
        get onDidChangeCollapseState() { return this.model.onDidChangeCollapseState; }
        get onDidChangeRenderNodeCount() { return this.model.onDidChangeRenderNodeCount; }
        get findMode() { return this.findController?.mode ?? TreeFindMode.Highlight; }
        set findMode(findMode) { if (this.findController) {
            this.findController.mode = findMode;
        } }
        get findMatchType() { return this.findController?.matchType ?? TreeFindMatchType.Fuzzy; }
        set findMatchType(findFuzzy) { if (this.findController) {
            this.findController.matchType = findFuzzy;
        } }
        get onDidChangeFindPattern() { return this.findController ? this.findController.onDidChangePattern : event_2.Event.None; }
        get expandOnDoubleClick() { return typeof this._options.expandOnDoubleClick === 'undefined' ? true : this._options.expandOnDoubleClick; }
        get expandOnlyOnTwistieClick() { return typeof this._options.expandOnlyOnTwistieClick === 'undefined' ? true : this._options.expandOnlyOnTwistieClick; }
        get onDidDispose() { return this.view.onDidDispose; }
        constructor(_user, container, delegate, renderers, _options = {}) {
            this._user = _user;
            this._options = _options;
            this.eventBufferer = new event_2.EventBufferer();
            this.onDidChangeFindOpenState = event_2.Event.None;
            this.disposables = new lifecycle_1.DisposableStore();
            this._onWillRefilter = new event_2.Emitter();
            this.onWillRefilter = this._onWillRefilter.event;
            this._onDidUpdateOptions = new event_2.Emitter();
            this.onDidUpdateOptions = this._onDidUpdateOptions.event;
            const treeDelegate = new ComposedTreeDelegate(delegate);
            const onDidChangeCollapseStateRelay = new event_2.Relay();
            const onDidChangeActiveNodes = new event_2.Relay();
            const activeNodes = this.disposables.add(new EventCollection(onDidChangeActiveNodes.event));
            const renderedIndentGuides = new collections_1.SetMap();
            this.renderers = renderers.map(r => new TreeRenderer(r, () => this.model, onDidChangeCollapseStateRelay.event, activeNodes, renderedIndentGuides, _options));
            for (const r of this.renderers) {
                this.disposables.add(r);
            }
            let filter;
            if (_options.keyboardNavigationLabelProvider) {
                filter = new FindFilter(this, _options.keyboardNavigationLabelProvider, _options.filter);
                _options = { ..._options, filter: filter }; // TODO need typescript help here
                this.disposables.add(filter);
            }
            this.focus = new Trait(() => this.view.getFocusedElements()[0], _options.identityProvider);
            this.selection = new Trait(() => this.view.getSelectedElements()[0], _options.identityProvider);
            this.anchor = new Trait(() => this.view.getAnchorElement(), _options.identityProvider);
            this.view = new TreeNodeList(_user, container, treeDelegate, this.renderers, this.focus, this.selection, this.anchor, { ...asListOptions(() => this.model, _options), tree: this });
            this.model = this.createModel(_user, this.view, _options);
            onDidChangeCollapseStateRelay.input = this.model.onDidChangeCollapseState;
            const onDidModelSplice = event_2.Event.forEach(this.model.onDidSplice, e => {
                this.eventBufferer.bufferEvents(() => {
                    this.focus.onDidModelSplice(e);
                    this.selection.onDidModelSplice(e);
                });
            }, this.disposables);
            // Make sure the `forEach` always runs
            onDidModelSplice(() => null, null, this.disposables);
            // Active nodes can change when the model changes or when focus or selection change.
            // We debounce it with 0 delay since these events may fire in the same stack and we only
            // want to run this once. It also doesn't matter if it runs on the next tick since it's only
            // a nice to have UI feature.
            const activeNodesEmitter = this.disposables.add(new event_2.Emitter());
            const activeNodesDebounce = this.disposables.add(new async_1.Delayer(0));
            this.disposables.add(event_2.Event.any(onDidModelSplice, this.focus.onDidChange, this.selection.onDidChange)(() => {
                activeNodesDebounce.trigger(() => {
                    const set = new Set();
                    for (const node of this.focus.getNodes()) {
                        set.add(node);
                    }
                    for (const node of this.selection.getNodes()) {
                        set.add(node);
                    }
                    activeNodesEmitter.fire([...set.values()]);
                });
            }));
            onDidChangeActiveNodes.input = activeNodesEmitter.event;
            if (_options.keyboardSupport !== false) {
                const onKeyDown = event_2.Event.chain(this.view.onKeyDown, $ => $.filter(e => !(0, listWidget_1.isInputElement)(e.target))
                    .map(e => new keyboardEvent_1.StandardKeyboardEvent(e)));
                event_2.Event.chain(onKeyDown, $ => $.filter(e => e.keyCode === 15 /* KeyCode.LeftArrow */))(this.onLeftArrow, this, this.disposables);
                event_2.Event.chain(onKeyDown, $ => $.filter(e => e.keyCode === 17 /* KeyCode.RightArrow */))(this.onRightArrow, this, this.disposables);
                event_2.Event.chain(onKeyDown, $ => $.filter(e => e.keyCode === 10 /* KeyCode.Space */))(this.onSpace, this, this.disposables);
            }
            if ((_options.findWidgetEnabled ?? true) && _options.keyboardNavigationLabelProvider && _options.contextViewProvider) {
                const opts = this.options.findWidgetStyles ? { styles: this.options.findWidgetStyles } : undefined;
                this.findController = new FindController(this, this.model, this.view, filter, _options.contextViewProvider, opts);
                this.focusNavigationFilter = node => this.findController.shouldAllowFocus(node);
                this.onDidChangeFindOpenState = this.findController.onDidChangeOpenState;
                this.disposables.add(this.findController);
                this.onDidChangeFindMode = this.findController.onDidChangeMode;
                this.onDidChangeFindMatchType = this.findController.onDidChangeMatchType;
            }
            else {
                this.onDidChangeFindMode = event_2.Event.None;
                this.onDidChangeFindMatchType = event_2.Event.None;
            }
            this.styleElement = (0, dom_1.createStyleSheet)(this.view.getHTMLElement());
            this.getHTMLElement().classList.toggle('always', this._options.renderIndentGuides === RenderIndentGuides.Always);
        }
        updateOptions(optionsUpdate = {}) {
            this._options = { ...this._options, ...optionsUpdate };
            for (const renderer of this.renderers) {
                renderer.updateOptions(optionsUpdate);
            }
            this.view.updateOptions(this._options);
            this.findController?.updateOptions(optionsUpdate);
            this._onDidUpdateOptions.fire(this._options);
            this.getHTMLElement().classList.toggle('always', this._options.renderIndentGuides === RenderIndentGuides.Always);
        }
        get options() {
            return this._options;
        }
        updateWidth(element) {
            const index = this.model.getListIndex(element);
            if (index === -1) {
                return;
            }
            this.view.updateWidth(index);
        }
        // Widget
        getHTMLElement() {
            return this.view.getHTMLElement();
        }
        get contentHeight() {
            return this.view.contentHeight;
        }
        get contentWidth() {
            return this.view.contentWidth;
        }
        get onDidChangeContentHeight() {
            return this.view.onDidChangeContentHeight;
        }
        get onDidChangeContentWidth() {
            return this.view.onDidChangeContentWidth;
        }
        get scrollTop() {
            return this.view.scrollTop;
        }
        set scrollTop(scrollTop) {
            this.view.scrollTop = scrollTop;
        }
        get scrollLeft() {
            return this.view.scrollLeft;
        }
        set scrollLeft(scrollLeft) {
            this.view.scrollLeft = scrollLeft;
        }
        get scrollHeight() {
            return this.view.scrollHeight;
        }
        get renderHeight() {
            return this.view.renderHeight;
        }
        get firstVisibleElement() {
            const index = this.view.firstVisibleIndex;
            if (index < 0 || index >= this.view.length) {
                return undefined;
            }
            const node = this.view.element(index);
            return node.element;
        }
        get lastVisibleElement() {
            const index = this.view.lastVisibleIndex;
            const node = this.view.element(index);
            return node.element;
        }
        get ariaLabel() {
            return this.view.ariaLabel;
        }
        set ariaLabel(value) {
            this.view.ariaLabel = value;
        }
        get selectionSize() {
            return this.selection.getNodes().length;
        }
        domFocus() {
            this.view.domFocus();
        }
        isDOMFocused() {
            return this.getHTMLElement() === document.activeElement;
        }
        layout(height, width) {
            this.view.layout(height, width);
            if ((0, types_1.isNumber)(width)) {
                this.findController?.layout(width);
            }
        }
        style(styles) {
            const suffix = `.${this.view.domId}`;
            const content = [];
            if (styles.treeIndentGuidesStroke) {
                content.push(`.monaco-list${suffix}:hover .monaco-tl-indent > .indent-guide, .monaco-list${suffix}.always .monaco-tl-indent > .indent-guide  { border-color: ${styles.treeInactiveIndentGuidesStroke}; }`);
                content.push(`.monaco-list${suffix} .monaco-tl-indent > .indent-guide.active { border-color: ${styles.treeIndentGuidesStroke}; }`);
            }
            this.styleElement.textContent = content.join('\n');
            this.view.style(styles);
        }
        // Tree navigation
        getParentElement(location) {
            const parentRef = this.model.getParentNodeLocation(location);
            const parentNode = this.model.getNode(parentRef);
            return parentNode.element;
        }
        getFirstElementChild(location) {
            return this.model.getFirstElementChild(location);
        }
        // Tree
        getNode(location) {
            return this.model.getNode(location);
        }
        getNodeLocation(node) {
            return this.model.getNodeLocation(node);
        }
        collapse(location, recursive = false) {
            return this.model.setCollapsed(location, true, recursive);
        }
        expand(location, recursive = false) {
            return this.model.setCollapsed(location, false, recursive);
        }
        toggleCollapsed(location, recursive = false) {
            return this.model.setCollapsed(location, undefined, recursive);
        }
        expandAll() {
            this.model.setCollapsed(this.model.rootRef, false, true);
        }
        collapseAll() {
            this.model.setCollapsed(this.model.rootRef, true, true);
        }
        isCollapsible(location) {
            return this.model.isCollapsible(location);
        }
        setCollapsible(location, collapsible) {
            return this.model.setCollapsible(location, collapsible);
        }
        isCollapsed(location) {
            return this.model.isCollapsed(location);
        }
        triggerTypeNavigation() {
            this.view.triggerTypeNavigation();
        }
        openFind() {
            this.findController?.open();
        }
        closeFind() {
            this.findController?.close();
        }
        refilter() {
            this._onWillRefilter.fire(undefined);
            this.model.refilter();
        }
        setAnchor(element) {
            if (typeof element === 'undefined') {
                return this.view.setAnchor(undefined);
            }
            const node = this.model.getNode(element);
            this.anchor.set([node]);
            const index = this.model.getListIndex(element);
            if (index > -1) {
                this.view.setAnchor(index, true);
            }
        }
        getAnchor() {
            return (0, arrays_1.firstOrDefault)(this.anchor.get(), undefined);
        }
        setSelection(elements, browserEvent) {
            const nodes = elements.map(e => this.model.getNode(e));
            this.selection.set(nodes, browserEvent);
            const indexes = elements.map(e => this.model.getListIndex(e)).filter(i => i > -1);
            this.view.setSelection(indexes, browserEvent, true);
        }
        getSelection() {
            return this.selection.get();
        }
        setFocus(elements, browserEvent) {
            const nodes = elements.map(e => this.model.getNode(e));
            this.focus.set(nodes, browserEvent);
            const indexes = elements.map(e => this.model.getListIndex(e)).filter(i => i > -1);
            this.view.setFocus(indexes, browserEvent, true);
        }
        focusNext(n = 1, loop = false, browserEvent, filter = this.focusNavigationFilter) {
            this.view.focusNext(n, loop, browserEvent, filter);
        }
        focusPrevious(n = 1, loop = false, browserEvent, filter = this.focusNavigationFilter) {
            this.view.focusPrevious(n, loop, browserEvent, filter);
        }
        focusNextPage(browserEvent, filter = this.focusNavigationFilter) {
            return this.view.focusNextPage(browserEvent, filter);
        }
        focusPreviousPage(browserEvent, filter = this.focusNavigationFilter) {
            return this.view.focusPreviousPage(browserEvent, filter);
        }
        focusLast(browserEvent, filter = this.focusNavigationFilter) {
            this.view.focusLast(browserEvent, filter);
        }
        focusFirst(browserEvent, filter = this.focusNavigationFilter) {
            this.view.focusFirst(browserEvent, filter);
        }
        getFocus() {
            return this.focus.get();
        }
        reveal(location, relativeTop) {
            this.model.expandTo(location);
            const index = this.model.getListIndex(location);
            if (index === -1) {
                return;
            }
            this.view.reveal(index, relativeTop);
        }
        /**
         * Returns the relative position of an element rendered in the list.
         * Returns `null` if the element isn't *entirely* in the visible viewport.
         */
        getRelativeTop(location) {
            const index = this.model.getListIndex(location);
            if (index === -1) {
                return null;
            }
            return this.view.getRelativeTop(index);
        }
        getViewState(identityProvider = this.options.identityProvider) {
            if (!identityProvider) {
                throw new tree_1.TreeError(this._user, 'Can\'t get tree view state without an identity provider');
            }
            const getId = (element) => identityProvider.getId(element).toString();
            const state = AbstractTreeViewState.empty(this.scrollTop);
            for (const focus of this.getFocus()) {
                state.focus.add(getId(focus));
            }
            for (const selection of this.getSelection()) {
                state.selection.add(getId(selection));
            }
            const root = this.model.getNode();
            const queue = [root];
            while (queue.length > 0) {
                const node = queue.shift();
                if (node !== root && node.collapsible) {
                    state.expanded[getId(node.element)] = node.collapsed ? 0 : 1;
                }
                queue.push(...node.children);
            }
            return state;
        }
        // List
        onLeftArrow(e) {
            e.preventDefault();
            e.stopPropagation();
            const nodes = this.view.getFocusedElements();
            if (nodes.length === 0) {
                return;
            }
            const node = nodes[0];
            const location = this.model.getNodeLocation(node);
            const didChange = this.model.setCollapsed(location, true);
            if (!didChange) {
                const parentLocation = this.model.getParentNodeLocation(location);
                if (!parentLocation) {
                    return;
                }
                const parentListIndex = this.model.getListIndex(parentLocation);
                this.view.reveal(parentListIndex);
                this.view.setFocus([parentListIndex]);
            }
        }
        onRightArrow(e) {
            e.preventDefault();
            e.stopPropagation();
            const nodes = this.view.getFocusedElements();
            if (nodes.length === 0) {
                return;
            }
            const node = nodes[0];
            const location = this.model.getNodeLocation(node);
            const didChange = this.model.setCollapsed(location, false);
            if (!didChange) {
                if (!node.children.some(child => child.visible)) {
                    return;
                }
                const [focusedIndex] = this.view.getFocus();
                const firstChildIndex = focusedIndex + 1;
                this.view.reveal(firstChildIndex);
                this.view.setFocus([firstChildIndex]);
            }
        }
        onSpace(e) {
            e.preventDefault();
            e.stopPropagation();
            const nodes = this.view.getFocusedElements();
            if (nodes.length === 0) {
                return;
            }
            const node = nodes[0];
            const location = this.model.getNodeLocation(node);
            const recursive = e.browserEvent.altKey;
            this.model.setCollapsed(location, undefined, recursive);
        }
        navigate(start) {
            return new TreeNavigator(this.view, this.model, start);
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.disposables);
            this.view.dispose();
        }
    }
    exports.AbstractTree = AbstractTree;
    class TreeNavigator {
        constructor(view, model, start) {
            this.view = view;
            this.model = model;
            if (start) {
                this.index = this.model.getListIndex(start);
            }
            else {
                this.index = -1;
            }
        }
        current() {
            if (this.index < 0 || this.index >= this.view.length) {
                return null;
            }
            return this.view.element(this.index).element;
        }
        previous() {
            this.index--;
            return this.current();
        }
        next() {
            this.index++;
            return this.current();
        }
        first() {
            this.index = 0;
            return this.current();
        }
        last() {
            this.index = this.view.length - 1;
            return this.current();
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RUcmVlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL3RyZWUvYWJzdHJhY3RUcmVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlDaEcsTUFBTSwyQkFBc0QsU0FBUSxrQ0FBb0M7UUFFdkcsSUFBYSxPQUFPLENBQUMsT0FBNkI7WUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQzdCLENBQUM7UUFFRCxJQUFhLE9BQU87WUFDbkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUMxQixDQUFDO1FBRUQsWUFBb0IsSUFBa0U7WUFDckYsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFENUIsU0FBSSxHQUFKLElBQUksQ0FBOEQ7UUFFdEYsQ0FBQztLQUNEO0lBRUQsU0FBUyxxQkFBcUIsQ0FBaUIsSUFBc0I7UUFDcEUsSUFBSSxJQUFJLFlBQVksa0NBQXVCLEVBQUU7WUFDNUMsT0FBTyxJQUFJLDJCQUEyQixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzdDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsTUFBTSx1QkFBdUI7UUFLNUIsWUFBb0IsYUFBcUQsRUFBVSxHQUF3QjtZQUF2RixrQkFBYSxHQUFiLGFBQWEsQ0FBd0M7WUFBVSxRQUFHLEdBQUgsR0FBRyxDQUFxQjtZQUZuRyx5QkFBb0IsR0FBZ0Isc0JBQVUsQ0FBQyxJQUFJLENBQUM7UUFFbUQsQ0FBQztRQUVoSCxVQUFVLENBQUMsSUFBK0I7WUFDekMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFD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