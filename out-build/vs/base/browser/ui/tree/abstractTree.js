/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/findinput/findInput", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/list/listView", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/tree/indexTreeModel", "vs/base/browser/ui/tree/tree", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/collections", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/types", "vs/nls!vs/base/browser/ui/tree/abstractTree", "vs/css!./media/tree"], function (require, exports, dom_1, event_1, keyboardEvent_1, actionbar_1, findInput_1, inputBox_1, listView_1, listWidget_1, toggle_1, indexTreeModel_1, tree_1, actions_1, arrays_1, async_1, codicons_1, themables_1, collections_1, event_2, filters_1, lifecycle_1, numbers_1, types_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fS = exports.TreeFindMatchType = exports.TreeFindMode = exports.$eS = exports.$dS = exports.RenderIndentGuides = exports.$cS = exports.$bS = void 0;
    class TreeElementsDragAndDropData extends listView_1.$jQ {
        set context(context) {
            this.c.context = context;
        }
        get context() {
            return this.c.context;
        }
        constructor(c) {
            super(c.elements.map(node => node.element));
            this.c = c;
        }
    }
    function asTreeDragAndDropData(data) {
        if (data instanceof listView_1.$jQ) {
            return new TreeElementsDragAndDropData(data);
        }
        return data;
    }
    class TreeNodeListDragAndDrop {
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.b = lifecycle_1.$kc.None;
        }
        getDragURI(node) {
            return this.d.getDragURI(node.element);
        }
        getDragLabel(nodes, originalEvent) {
            if (this.d.getDragLabel) {
                return this.d.getDragLabel(nodes.map(node => node.element), originalEvent);
            }
            return undefined;
        }
        onDragStart(data, originalEvent) {
            this.d.onDragStart?.(asTreeDragAndDropData(data), originalEvent);
        }
        onDragOver(data, targetNode, targetIndex, originalEvent, raw = true) {
            const result = this.d.onDragOver(asTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, originalEvent);
            const didChangeAutoExpandNode = this.a !== targetNode;
            if (didChangeAutoExpandNode) {
                this.b.dispose();
                this.a = targetNode;
            }
            if (typeof targetNode === 'undefined') {
                return result;
            }
            if (didChangeAutoExpandNode && typeof result !== 'boolean' && result.autoExpand) {
                this.b = (0, async_1.$Ig)(() => {
                    const model = this.c();
                    const ref = model.getNodeLocation(targetNode);
                    if (model.isCollapsed(ref)) {
                        model.setCollapsed(ref, false);
                    }
                    this.a = undefined;
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
                const model = this.c();
                const ref = model.getNodeLocation(targetNode);
                const parentRef = model.getParentNodeLocation(ref);
                const parentNode = model.getNode(parentRef);
                const parentIndex = parentRef && model.getListIndex(parentRef);
                return this.onDragOver(data, parentNode, parentIndex, originalEvent, false);
            }
            const model = this.c();
            const ref = model.getNodeLocation(targetNode);
            const start = model.getListIndex(ref);
            const length = model.getListRenderCount(ref);
            return { ...result, feedback: (0, arrays_1.$Qb)(start, start + length) };
        }
        drop(data, targetNode, targetIndex, originalEvent) {
            this.b.dispose();
            this.a = undefined;
            this.d.drop(asTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, originalEvent);
        }
        onDragEnd(originalEvent) {
            this.d.onDragEnd?.(originalEvent);
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
    class $bS {
        constructor(a) {
            this.a = a;
        }
        getHeight(element) {
            return this.a.getHeight(element.element);
        }
        getTemplateId(element) {
            return this.a.getTemplateId(element.element);
        }
        hasDynamicHeight(element) {
            return !!this.a.hasDynamicHeight && this.a.hasDynamicHeight(element.element);
        }
        setDynamicHeight(element, height) {
            this.a.setDynamicHeight?.(element.element, height);
        }
    }
    exports.$bS = $bS;
    class $cS {
        static lift(state) {
            return state instanceof $cS ? state : new $cS(state);
        }
        static empty(scrollTop = 0) {
            return new $cS({
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
    exports.$cS = $cS;
    var RenderIndentGuides;
    (function (RenderIndentGuides) {
        RenderIndentGuides["None"] = "none";
        RenderIndentGuides["OnHover"] = "onHover";
        RenderIndentGuides["Always"] = "always";
    })(RenderIndentGuides || (exports.RenderIndentGuides = RenderIndentGuides = {}));
    class EventCollection {
        get elements() {
            return this.b;
        }
        constructor(onDidChange, b = []) {
            this.b = b;
            this.a = new lifecycle_1.$jc();
            this.onDidChange = event_2.Event.forEach(onDidChange, elements => this.b = elements, this.a);
        }
        dispose() {
            this.a.dispose();
        }
    }
    class TreeRenderer {
        static { this.a = 8; }
        constructor(o, p, onDidChangeCollapseState, q, s, options = {}) {
            this.o = o;
            this.p = p;
            this.q = q;
            this.s = s;
            this.b = new Map();
            this.c = new Map();
            this.d = TreeRenderer.a;
            this.f = false;
            this.g = false;
            this.j = new Set();
            this.k = lifecycle_1.$kc.None;
            this.m = new lifecycle_1.$jc();
            this.templateId = o.templateId;
            this.updateOptions(options);
            event_2.Event.map(onDidChangeCollapseState, e => e.node)(this.u, this, this.m);
            o.onDidChangeTwistieState?.(this.t, this, this.m);
        }
        updateOptions(options = {}) {
            if (typeof options.indent !== 'undefined') {
                const indent = (0, numbers_1.$Hl)(options.indent, 0, 40);
                if (indent !== this.d) {
                    this.d = indent;
                    for (const [node, templateData] of this.c) {
                        this.v(node, templateData);
                    }
                }
            }
            if (typeof options.renderIndentGuides !== 'undefined') {
                const shouldRenderIndentGuides = options.renderIndentGuides !== RenderIndentGuides.None;
                if (shouldRenderIndentGuides !== this.g) {
                    this.g = shouldRenderIndentGuides;
                    for (const [node, templateData] of this.c) {
                        this.w(node, templateData);
                    }
                    this.k.dispose();
                    if (shouldRenderIndentGuides) {
                        const disposables = new lifecycle_1.$jc();
                        this.q.onDidChange(this.x, this, disposables);
                        this.k = disposables;
                        this.x(this.q.elements);
                    }
                }
            }
            if (typeof options.hideTwistiesOfChildlessElements !== 'undefined') {
                this.f = options.hideTwistiesOfChildlessElements;
            }
        }
        renderTemplate(container) {
            const el = (0, dom_1.$0O)(container, (0, dom_1.$)('.monaco-tl-row'));
            const indent = (0, dom_1.$0O)(el, (0, dom_1.$)('.monaco-tl-indent'));
            const twistie = (0, dom_1.$0O)(el, (0, dom_1.$)('.monaco-tl-twistie'));
            const contents = (0, dom_1.$0O)(el, (0, dom_1.$)('.monaco-tl-contents'));
            const templateData = this.o.renderTemplate(contents);
            return { container, indent, twistie, indentGuidesDisposable: lifecycle_1.$kc.None, templateData };
        }
        renderElement(node, index, templateData, height) {
            this.c.set(node, templateData);
            this.b.set(node.element, node);
            this.v(node, templateData);
            this.o.renderElement(node, index, templateData.templateData, height);
        }
        disposeElement(node, index, templateData, height) {
            templateData.indentGuidesDisposable.dispose();
            this.o.disposeElement?.(node, index, templateData.templateData, height);
            if (typeof height === 'number') {
                this.c.delete(node);
                this.b.delete(node.element);
            }
        }
        disposeTemplate(templateData) {
            this.o.disposeTemplate(templateData.templateData);
        }
        t(element) {
            const node = this.b.get(element);
            if (!node) {
                return;
            }
            this.u(node);
        }
        u(node) {
            const templateData = this.c.get(node);
            if (!templateData) {
                return;
            }
            this.x(this.q.elements);
            this.v(node, templateData);
        }
        v(node, templateData) {
            const indent = TreeRenderer.a + (node.depth - 1) * this.d;
            templateData.twistie.style.paddingLeft = `${indent}px`;
            templateData.indent.style.width = `${indent + this.d - 16}px`;
            if (node.collapsible) {
                templateData.container.setAttribute('aria-expanded', String(!node.collapsed));
            }
            else {
                templateData.container.removeAttribute('aria-expanded');
            }
            templateData.twistie.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.treeItemExpanded));
            let twistieRendered = false;
            if (this.o.renderTwistie) {
                twistieRendered = this.o.renderTwistie(node.element, templateData.twistie);
            }
            if (node.collapsible && (!this.f || node.visibleChildrenCount > 0)) {
                if (!twistieRendered) {
                    templateData.twistie.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.treeItemExpanded));
                }
                templateData.twistie.classList.add('collapsible');
                templateData.twistie.classList.toggle('collapsed', node.collapsed);
            }
            else {
                templateData.twistie.classList.remove('collapsible', 'collapsed');
            }
            this.w(node, templateData);
        }
        w(node, templateData) {
            (0, dom_1.$lO)(templateData.indent);
            templateData.indentGuidesDisposable.dispose();
            if (!this.g) {
                return;
            }
            const disposableStore = new lifecycle_1.$jc();
            const model = this.p();
            while (true) {
                const ref = model.getNodeLocation(node);
                const parentRef = model.getParentNodeLocation(ref);
                if (!parentRef) {
                    break;
                }
                const parent = model.getNode(parentRef);
                const guide = (0, dom_1.$)('.indent-guide', { style: `width: ${this.d}px` });
                if (this.j.has(parent)) {
                    guide.classList.add('active');
                }
                if (templateData.indent.childElementCount === 0) {
                    templateData.indent.appendChild(guide);
                }
                else {
                    templateData.indent.insertBefore(guide, templateData.indent.firstElementChild);
                }
                this.s.add(parent, guide);
                disposableStore.add((0, lifecycle_1.$ic)(() => this.s.delete(parent, guide)));
                node = parent;
            }
            templateData.indentGuidesDisposable = disposableStore;
        }
        x(nodes) {
            if (!this.g) {
                return;
            }
            const set = new Set();
            const model = this.p();
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
            this.j.forEach(node => {
                if (!set.has(node)) {
                    this.s.forEach(node, line => line.classList.remove('active'));
                }
            });
            set.forEach(node => {
                if (!this.j.has(node)) {
                    this.s.forEach(node, line => line.classList.add('active'));
                }
            });
            this.j = set;
        }
        dispose() {
            this.c.clear();
            this.b.clear();
            this.k.dispose();
            (0, lifecycle_1.$fc)(this.m);
        }
    }
    class FindFilter {
        get totalCount() { return this.a; }
        get matchCount() { return this.b; }
        set pattern(pattern) {
            this.c = pattern;
            this.d = pattern.toLowerCase();
        }
        constructor(g, j, k) {
            this.g = g;
            this.j = j;
            this.k = k;
            this.a = 0;
            this.b = 0;
            this.c = '';
            this.d = '';
            this.f = new lifecycle_1.$jc();
            g.onWillRefilter(this.m, this, this.f);
        }
        filter(element, parentVisibility) {
            let visibility = 1 /* TreeVisibility.Visible */;
            if (this.k) {
                const result = this.k.filter(element, parentVisibility);
                if (typeof result === 'boolean') {
                    visibility = result ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */;
                }
                else if ((0, indexTreeModel_1.$$R)(result)) {
                    visibility = (0, indexTreeModel_1.$_R)(result.visibility);
                }
                else {
                    visibility = result;
                }
                if (visibility === 0 /* TreeVisibility.Hidden */) {
                    return false;
                }
            }
            this.a++;
            if (!this.c) {
                this.b++;
                return { data: filters_1.FuzzyScore.Default, visibility };
            }
            const label = this.j.getKeyboardNavigationLabel(element);
            const labels = Array.isArray(label) ? label : [label];
            for (const l of labels) {
                const labelStr = l && l.toString();
                if (typeof labelStr === 'undefined') {
                    return { data: filters_1.FuzzyScore.Default, visibility };
                }
                let score;
                if (this.g.findMatchType === TreeFindMatchType.Contiguous) {
                    const index = labelStr.toLowerCase().indexOf(this.d);
                    if (index > -1) {
                        score = [Number.MAX_SAFE_INTEGER, 0];
                        for (let i = this.d.length; i > 0; i--) {
                            score.push(index + i - 1);
                        }
                    }
                }
                else {
                    score = (0, filters_1.$Kj)(this.c, this.d, 0, labelStr, labelStr.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
                }
                if (score) {
                    this.b++;
                    return labels.length === 1 ?
                        { data: score, visibility } :
                        { data: { label: labelStr, score: score }, visibility };
                }
            }
            if (this.g.findMode === TreeFindMode.Filter) {
                if (typeof this.g.options.defaultFindVisibility === 'number') {
                    return this.g.options.defaultFindVisibility;
                }
                else if (this.g.options.defaultFindVisibility) {
                    return this.g.options.defaultFindVisibility(element);
                }
                else {
                    return 2 /* TreeVisibility.Recurse */;
                }
            }
            else {
                return { data: filters_1.FuzzyScore.Default, visibility };
            }
        }
        m() {
            this.a = 0;
            this.b = 0;
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.f);
        }
    }
    class $dS extends toggle_1.$KQ {
        constructor(opts) {
            super({
                icon: codicons_1.$Pj.listFilter,
                title: (0, nls_1.localize)(0, null),
                isChecked: opts.isChecked ?? false,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.$dS = $dS;
    class $eS extends toggle_1.$KQ {
        constructor(opts) {
            super({
                icon: codicons_1.$Pj.searchFuzzy,
                title: (0, nls_1.localize)(1, null),
                isChecked: opts.isChecked ?? false,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.$eS = $eS;
    const unthemedFindWidgetStyles = {
        inputBoxStyles: inputBox_1.$rR,
        toggleStyles: toggle_1.$IQ,
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
    class FindWidget extends lifecycle_1.$kc {
        set mode(mode) {
            this.b.checked = mode === TreeFindMode.Filter;
            this.f.inputBox.setPlaceHolder(mode === TreeFindMode.Filter ? (0, nls_1.localize)(2, null) : (0, nls_1.localize)(3, null));
        }
        set matchType(matchType) {
            this.c.checked = matchType === TreeFindMatchType.Fuzzy;
        }
        get value() {
            return this.f.inputBox.value;
        }
        set value(value) {
            this.f.inputBox.value = value;
        }
        constructor(container, t, contextViewProvider, mode, matchType, options) {
            super();
            this.t = t;
            this.a = (0, dom_1.h)('.monaco-tree-type-filter', [
                (0, dom_1.h)('.monaco-tree-type-filter-grab.codicon.codicon-debug-gripper@grab', { tabIndex: 0 }),
                (0, dom_1.h)('.monaco-tree-type-filter-input@findInput'),
                (0, dom_1.h)('.monaco-tree-type-filter-actionbar@actionbar'),
            ]);
            this.j = 0;
            this.m = 0;
            this.s = 0;
            this._onDidDisable = new event_2.$fd();
            this.onDidDisable = this._onDidDisable.event;
            container.appendChild(this.a.root);
            this.B((0, lifecycle_1.$ic)(() => container.removeChild(this.a.root)));
            const styles = options?.styles ?? unthemedFindWidgetStyles;
            if (styles.listFilterWidgetBackground) {
                this.a.root.style.backgroundColor = styles.listFilterWidgetBackground;
            }
            if (styles.listFilterWidgetShadow) {
                this.a.root.style.boxShadow = `0 0 8px 2px ${styles.listFilterWidgetShadow}`;
            }
            this.b = this.B(new $dS({ ...styles.toggleStyles, isChecked: mode === TreeFindMode.Filter }));
            this.c = this.B(new $eS({ ...styles.toggleStyles, isChecked: matchType === TreeFindMatchType.Fuzzy }));
            this.onDidChangeMode = event_2.Event.map(this.b.onChange, () => this.b.checked ? TreeFindMode.Filter : TreeFindMode.Highlight, this.q);
            this.onDidChangeMatchType = event_2.Event.map(this.c.onChange, () => this.c.checked ? TreeFindMatchType.Fuzzy : TreeFindMatchType.Contiguous, this.q);
            this.f = this.B(new findInput_1.$HR(this.a.findInput, contextViewProvider, {
                label: (0, nls_1.localize)(4, null),
                additionalToggles: [this.b, this.c],
                showCommonFindToggles: false,
                inputBoxStyles: styles.inputBoxStyles,
                toggleStyles: styles.toggleStyles,
                history: options?.history
            }));
            this.g = this.B(new actionbar_1.$1P(this.a.actionbar));
            this.mode = mode;
            const emitter = this.B(new event_1.$9P(this.f.inputBox.inputElement, 'keydown'));
            const onKeyDown = event_2.Event.chain(emitter.event, $ => $.map(e => new keyboardEvent_1.$jO(e)));
            this.B(onKeyDown((e) => {
                // Using equals() so we reserve modified keys for future use
                if (e.equals(3 /* KeyCode.Enter */)) {
                    // This is the only keyboard way to return to the tree from a history item that isn't the last one
                    e.preventDefault();
                    e.stopPropagation();
                    this.f.inputBox.addToHistory();
                    this.t.domFocus();
                    return;
                }
                if (e.equals(18 /* KeyCode.DownArrow */)) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.f.inputBox.isAtLastInHistory() || this.f.inputBox.isNowhereInHistory()) {
                        // Retain original pre-history DownArrow behavior
                        this.f.inputBox.addToHistory();
                        this.t.domFocus();
                    }
                    else {
                        // Downward through history
                        this.f.inputBox.showNextValue();
                    }
                    return;
                }
                if (e.equals(16 /* KeyCode.UpArrow */)) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Upward through history
                    this.f.inputBox.showPreviousValue();
                    return;
                }
            }));
            const closeAction = this.B(new actions_1.$gi('close', (0, nls_1.localize)(5, null), 'codicon codicon-close', true, () => this.dispose()));
            this.g.push(closeAction, { icon: true, label: false });
            const onGrabMouseDown = this.B(new event_1.$9P(this.a.grab, 'mousedown'));
            this.B(onGrabMouseDown.event(e => {
                const disposables = new lifecycle_1.$jc();
                const onWindowMouseMove = disposables.add(new event_1.$9P(window, 'mousemove'));
                const onWindowMouseUp = disposables.add(new event_1.$9P(window, 'mouseup'));
                const startRight = this.m;
                const startX = e.pageX;
                const startTop = this.s;
                const startY = e.pageY;
                this.a.grab.classList.add('grabbing');
                const transition = this.a.root.style.transition;
                this.a.root.style.transition = 'unset';
                const update = (e) => {
                    const deltaX = e.pageX - startX;
                    this.m = startRight - deltaX;
                    const deltaY = e.pageY - startY;
                    this.s = startTop + deltaY;
                    this.layout();
                };
                disposables.add(onWindowMouseMove.event(update));
                disposables.add(onWindowMouseUp.event(e => {
                    update(e);
                    this.a.grab.classList.remove('grabbing');
                    this.a.root.style.transition = transition;
                    disposables.dispose();
                }));
            }));
            const onGrabKeyDown = event_2.Event.chain(this.B(new event_1.$9P(this.a.grab, 'keydown')).event, $ => $.map(e => new keyboardEvent_1.$jO(e)));
            this.B(onGrabKeyDown((e) => {
                let right;
                let top;
                if (e.keyCode === 15 /* KeyCode.LeftArrow */) {
                    right = Number.POSITIVE_INFINITY;
                }
                else if (e.keyCode === 17 /* KeyCode.RightArrow */) {
                    right = 0;
                }
                else if (e.keyCode === 10 /* KeyCode.Space */) {
                    right = this.m === 0 ? Number.POSITIVE_INFINITY : 0;
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
                    this.m = right;
                    this.layout();
                }
                if (top !== undefined) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.s = top;
                    const transition = this.a.root.style.transition;
                    this.a.root.style.transition = 'unset';
                    this.layout();
                    setTimeout(() => {
                        this.a.root.style.transition = transition;
                    }, 0);
                }
            }));
            this.onDidChangeValue = this.f.onDidChange;
        }
        getHistory() {
            return this.f.inputBox.getHistory();
        }
        focus() {
            this.f.focus();
        }
        select() {
            this.f.select();
            // Reposition to last in history
            this.f.inputBox.addToHistory(true);
        }
        layout(width = this.j) {
            this.j = width;
            this.m = (0, numbers_1.$Hl)(this.m, 0, Math.max(0, width - 212));
            this.a.root.style.right = `${this.m}px`;
            this.s = (0, numbers_1.$Hl)(this.s, 0, 24);
            this.a.root.style.top = `${this.s}px`;
        }
        showMessage(message) {
            this.f.showMessage(message);
        }
        clearMessage() {
            this.f.clearMessage();
        }
        async dispose() {
            this._onDidDisable.fire();
            this.a.root.classList.add('disabled');
            await (0, async_1.$Hg)(300);
            super.dispose();
        }
    }
    class FindController {
        get pattern() { return this.b; }
        get mode() { return this.d; }
        set mode(mode) {
            if (mode === this.d) {
                return;
            }
            this.d = mode;
            if (this.g) {
                this.g.mode = this.d;
            }
            this.t.refilter();
            this.A();
            this.k.fire(mode);
        }
        get matchType() { return this.f; }
        set matchType(matchType) {
            if (matchType === this.f) {
                return;
            }
            this.f = matchType;
            if (this.g) {
                this.g.matchType = this.f;
            }
            this.t.refilter();
            this.A();
            this.m.fire(matchType);
        }
        constructor(t, model, u, v, w, x = {}) {
            this.t = t;
            this.u = u;
            this.v = v;
            this.w = w;
            this.x = x;
            this.b = '';
            this.c = '';
            this.j = 0;
            this.k = new event_2.$fd();
            this.onDidChangeMode = this.k.event;
            this.m = new event_2.$fd();
            this.onDidChangeMatchType = this.m.event;
            this.o = new event_2.$fd();
            this.onDidChangePattern = this.o.event;
            this.p = new event_2.$fd();
            this.onDidChangeOpenState = this.p.event;
            this.q = new lifecycle_1.$jc();
            this.s = new lifecycle_1.$jc();
            this.d = t.options.defaultFindMode ?? TreeFindMode.Highlight;
            this.f = t.options.defaultFindMatchType ?? TreeFindMatchType.Fuzzy;
            model.onDidSplice(this.z, this, this.s);
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
            if (this.g) {
                this.g.focus();
                this.g.select();
                return;
            }
            this.g = new FindWidget(this.u.getHTMLElement(), this.t, this.w, this.mode, this.matchType, { ...this.x, history: this.a });
            this.q.add(this.g);
            this.g.onDidChangeValue(this.y, this, this.q);
            this.g.onDidChangeMode(mode => this.mode = mode, undefined, this.q);
            this.g.onDidChangeMatchType(matchType => this.matchType = matchType, undefined, this.q);
            this.g.onDidDisable(this.close, this, this.q);
            this.g.layout(this.j);
            this.g.focus();
            this.g.value = this.c;
            this.g.select();
            this.p.fire(true);
        }
        close() {
            if (!this.g) {
                return;
            }
            this.a = this.g.getHistory();
            this.g = undefined;
            this.q.clear();
            this.c = this.pattern;
            this.y('');
            this.t.domFocus();
            this.p.fire(false);
        }
        y(pattern) {
            this.b = pattern;
            this.o.fire(pattern);
            this.v.pattern = pattern;
            this.t.refilter();
            if (pattern) {
                this.t.focusNext(0, true, undefined, node => !filters_1.FuzzyScore.isDefault(node.filterData));
            }
            const focus = this.t.getFocus();
            if (focus.length > 0) {
                const element = focus[0];
                if (this.t.getRelativeTop(element) === null) {
                    this.t.reveal(element, 0.5);
                }
            }
            this.A();
        }
        z() {
            if (!this.g || this.pattern.length === 0) {
                return;
            }
            this.t.refilter();
            this.A();
        }
        A() {
            const noMatches = this.v.totalCount > 0 && this.v.matchCount === 0;
            if (this.pattern && noMatches) {
                if (this.t.options.showNotFoundMessage ?? true) {
                    this.g?.showMessage({ type: 2 /* MessageType.WARNING */, content: (0, nls_1.localize)(6, null) });
                }
                else {
                    this.g?.showMessage({ type: 2 /* MessageType.WARNING */ });
                }
            }
            else {
                this.g?.clearMessage();
            }
        }
        shouldAllowFocus(node) {
            if (!this.g || !this.pattern || this.d === TreeFindMode.Filter) {
                return true;
            }
            if (this.v.totalCount > 0 && this.v.matchCount <= 1) {
                return true;
            }
            return !filters_1.FuzzyScore.isDefault(node.filterData);
        }
        layout(width) {
            this.j = width;
            this.g?.layout(width);
        }
        dispose() {
            this.a = undefined;
            this.o.dispose();
            this.q.dispose();
            this.s.dispose();
        }
    }
    function asTreeMouseEvent(event) {
        let target = tree_1.TreeMouseEventTarget.Unknown;
        if ((0, dom_1.$RO)(event.browserEvent.target, 'monaco-tl-twistie', 'monaco-tl-row')) {
            target = tree_1.TreeMouseEventTarget.Twistie;
        }
        else if ((0, dom_1.$RO)(event.browserEvent.target, 'monaco-tl-contents', 'monaco-tl-row')) {
            target = tree_1.TreeMouseEventTarget.Element;
        }
        else if ((0, dom_1.$RO)(event.browserEvent.target, 'monaco-tree-type-filter', 'monaco-list')) {
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
        get f() {
            if (!this.d) {
                this.d = this.m();
            }
            return this.d;
        }
        constructor(g, j) {
            this.g = g;
            this.j = j;
            this.a = [];
            this.c = new event_2.$fd();
            this.onDidChange = this.c.event;
        }
        set(nodes, browserEvent) {
            if (!browserEvent?.__forceEvent && (0, arrays_1.$sb)(this.a, nodes)) {
                return;
            }
            this.k(nodes, false, browserEvent);
        }
        k(nodes, silent, browserEvent) {
            this.a = [...nodes];
            this.b = undefined;
            this.d = undefined;
            if (!silent) {
                const that = this;
                this.c.fire({ get elements() { return that.get(); }, browserEvent });
            }
        }
        get() {
            if (!this.b) {
                this.b = this.a.map(node => node.element);
            }
            return [...this.b];
        }
        getNodes() {
            return this.a;
        }
        has(node) {
            return this.f.has(node);
        }
        onDidModelSplice({ insertedNodes, deletedNodes }) {
            if (!this.j) {
                const set = this.m();
                const visit = (node) => set.delete(node);
                deletedNodes.forEach(node => dfs(node, visit));
                this.set([...set.values()]);
                return;
            }
            const deletedNodesIdSet = new Set();
            const deletedNodesVisitor = (node) => deletedNodesIdSet.add(this.j.getId(node.element).toString());
            deletedNodes.forEach(node => dfs(node, deletedNodesVisitor));
            const insertedNodesMap = new Map();
            const insertedNodesVisitor = (node) => insertedNodesMap.set(this.j.getId(node.element).toString(), node);
            insertedNodes.forEach(node => dfs(node, insertedNodesVisitor));
            const nodes = [];
            for (const node of this.a) {
                const id = this.j.getId(node.element).toString();
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
            if (this.a.length > 0 && nodes.length === 0) {
                const node = this.g();
                if (node) {
                    nodes.push(node);
                }
            }
            this.k(nodes, true);
        }
        m() {
            const set = new Set();
            for (const node of this.a) {
                set.add(node);
            }
            return set;
        }
    }
    class TreeNodeListMouseController extends listWidget_1.$tQ {
        constructor(list, x) {
            super(list);
            this.x = x;
        }
        u(e) {
            if ((0, listWidget_1.$pQ)(e.browserEvent.target) ||
                (0, listWidget_1.$nQ)(e.browserEvent.target) ||
                (0, listWidget_1.$oQ)(e.browserEvent.target)) {
                return;
            }
            if (e.browserEvent.isHandledByList) {
                return;
            }
            const node = e.element;
            if (!node) {
                return super.u(e);
            }
            if (this.p(e) || this.o(e)) {
                return super.u(e);
            }
            const target = e.browserEvent.target;
            const onTwistie = target.classList.contains('monaco-tl-twistie')
                || (target.classList.contains('monaco-icon-label') && target.classList.contains('folder-icon') && e.browserEvent.offsetX < 16);
            let expandOnlyOnTwistieClick = false;
            if (typeof this.x.expandOnlyOnTwistieClick === 'function') {
                expandOnlyOnTwistieClick = this.x.expandOnlyOnTwistieClick(node.element);
            }
            else {
                expandOnlyOnTwistieClick = !!this.x.expandOnlyOnTwistieClick;
            }
            if (expandOnlyOnTwistieClick && !onTwistie && e.browserEvent.detail !== 2) {
                return super.u(e);
            }
            if (!this.x.expandOnDoubleClick && e.browserEvent.detail === 2) {
                return super.u(e);
            }
            if (node.collapsible) {
                const location = this.x.getNodeLocation(node);
                const recursive = e.browserEvent.altKey;
                this.x.setFocus([location]);
                this.x.toggleCollapsed(location, recursive);
                if (expandOnlyOnTwistieClick && onTwistie) {
                    // Do not set this before calling a handler on the super class, because it will reject it as handled
                    e.browserEvent.isHandledByList = true;
                    return;
                }
            }
            super.u(e);
        }
        v(e) {
            const onTwistie = e.browserEvent.target.classList.contains('monaco-tl-twistie');
            if (onTwistie || !this.x.expandOnDoubleClick) {
                return;
            }
            if (e.browserEvent.isHandledByList) {
                return;
            }
            super.v(e);
        }
    }
    /**
     * We use this List subclass to restore selection and focus as nodes
     * get rendered in the list, possibly due to a node expand() call.
     */
    class TreeNodeList extends listWidget_1.$wQ {
        constructor(user, container, virtualDelegate, renderers, p, s, K, options) {
            super(user, container, virtualDelegate, renderers, options);
            this.p = p;
            this.s = s;
            this.K = K;
        }
        D(options) {
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
                if (this.p.has(node)) {
                    additionalFocus.push(start + index);
                }
                if (this.s.has(node)) {
                    additionalSelection.push(start + index);
                }
                if (this.K.has(node)) {
                    anchor = start + index;
                }
            });
            if (additionalFocus.length > 0) {
                super.setFocus((0, arrays_1.$Kb)([...super.getFocus(), ...additionalFocus]));
            }
            if (additionalSelection.length > 0) {
                super.setSelection((0, arrays_1.$Kb)([...super.getSelection(), ...additionalSelection]));
            }
            if (typeof anchor === 'number') {
                super.setAnchor(anchor);
            }
        }
        setFocus(indexes, browserEvent, fromAPI = false) {
            super.setFocus(indexes, browserEvent);
            if (!fromAPI) {
                this.p.set(indexes.map(i => this.element(i)), browserEvent);
            }
        }
        setSelection(indexes, browserEvent, fromAPI = false) {
            super.setSelection(indexes, browserEvent);
            if (!fromAPI) {
                this.s.set(indexes.map(i => this.element(i)), browserEvent);
            }
        }
        setAnchor(index, fromAPI = false) {
            super.setAnchor(index);
            if (!fromAPI) {
                if (typeof index === 'undefined') {
                    this.K.set([]);
                }
                else {
                    this.K.set([this.element(index)]);
                }
            }
        }
    }
    class $fS {
        get onDidScroll() { return this.j.onDidScroll; }
        get onDidChangeFocus() { return this.w.wrapEvent(this.p.onDidChange); }
        get onDidChangeSelection() { return this.w.wrapEvent(this.q.onDidChange); }
        get onMouseClick() { return event_2.Event.map(this.j.onMouseClick, asTreeMouseEvent); }
        get onMouseDblClick() { return event_2.Event.filter(event_2.Event.map(this.j.onMouseDblClick, asTreeMouseEvent), e => e.target !== tree_1.TreeMouseEventTarget.Filter); }
        get onContextMenu() { return event_2.Event.map(this.j.onContextMenu, asTreeContextMenuEvent); }
        get onTap() { return event_2.Event.map(this.j.onTap, asTreeMouseEvent); }
        get onPointer() { return event_2.Event.map(this.j.onPointer, asTreeMouseEvent); }
        get onKeyDown() { return this.j.onKeyDown; }
        get onKeyUp() { return this.j.onKeyUp; }
        get onKeyPress() { return this.j.onKeyPress; }
        get onDidFocus() { return this.j.onDidFocus; }
        get onDidBlur() { return this.j.onDidBlur; }
        get onDidChangeModel() { return event_2.Event.signal(this.o.onDidSplice); }
        get onDidChangeCollapseState() { return this.o.onDidChangeCollapseState; }
        get onDidChangeRenderNodeCount() { return this.o.onDidChangeRenderNodeCount; }
        get findMode() { return this.x?.mode ?? TreeFindMode.Highlight; }
        set findMode(findMode) { if (this.x) {
            this.x.mode = findMode;
        } }
        get findMatchType() { return this.x?.matchType ?? TreeFindMatchType.Fuzzy; }
        set findMatchType(findFuzzy) { if (this.x) {
            this.x.matchType = findFuzzy;
        } }
        get onDidChangeFindPattern() { return this.x ? this.x.onDidChangePattern : event_2.Event.None; }
        get expandOnDoubleClick() { return typeof this.E.expandOnDoubleClick === 'undefined' ? true : this.E.expandOnDoubleClick; }
        get expandOnlyOnTwistieClick() { return typeof this.E.expandOnlyOnTwistieClick === 'undefined' ? true : this.E.expandOnlyOnTwistieClick; }
        get onDidDispose() { return this.j.onDidDispose; }
        constructor(D, container, delegate, renderers, E = {}) {
            this.D = D;
            this.E = E;
            this.w = new event_2.$nd();
            this.onDidChangeFindOpenState = event_2.Event.None;
            this.A = new lifecycle_1.$jc();
            this.B = new event_2.$fd();
            this.onWillRefilter = this.B.event;
            this.C = new event_2.$fd();
            this.onDidUpdateOptions = this.C.event;
            const treeDelegate = new $bS(delegate);
            const onDidChangeCollapseStateRelay = new event_2.$od();
            const onDidChangeActiveNodes = new event_2.$od();
            const activeNodes = this.A.add(new EventCollection(onDidChangeActiveNodes.event));
            const renderedIndentGuides = new collections_1.$L();
            this.k = renderers.map(r => new TreeRenderer(r, () => this.o, onDidChangeCollapseStateRelay.event, activeNodes, renderedIndentGuides, E));
            for (const r of this.k) {
                this.A.add(r);
            }
            let filter;
            if (E.keyboardNavigationLabelProvider) {
                filter = new FindFilter(this, E.keyboardNavigationLabelProvider, E.filter);
                E = { ...E, filter: filter }; // TODO need typescript help here
                this.A.add(filter);
            }
            this.p = new Trait(() => this.j.getFocusedElements()[0], E.identityProvider);
            this.q = new Trait(() => this.j.getSelectedElements()[0], E.identityProvider);
            this.u = new Trait(() => this.j.getAnchorElement(), E.identityProvider);
            this.j = new TreeNodeList(D, container, treeDelegate, this.k, this.p, this.q, this.u, { ...asListOptions(() => this.o, E), tree: this });
            this.o = this.I(D, this.j, E);
            onDidChangeCollapseStateRelay.input = this.o.onDidChangeCollapseState;
            const onDidModelSplice = event_2.Event.forEach(this.o.onDidSplice, e => {
                this.w.bufferEvents(() => {
                    this.p.onDidModelSplice(e);
                    this.q.onDidModelSplice(e);
                });
            }, this.A);
            // Make sure the `forEach` always runs
            onDidModelSplice(() => null, null, this.A);
            // Active nodes can change when the model changes or when focus or selection change.
            // We debounce it with 0 delay since these events may fire in the same stack and we only
            // want to run this once. It also doesn't matter if it runs on the next tick since it's only
            // a nice to have UI feature.
            const activeNodesEmitter = this.A.add(new event_2.$fd());
            const activeNodesDebounce = this.A.add(new async_1.$Dg(0));
            this.A.add(event_2.Event.any(onDidModelSplice, this.p.onDidChange, this.q.onDidChange)(() => {
                activeNodesDebounce.trigger(() => {
                    const set = new Set();
                    for (const node of this.p.getNodes()) {
                        set.add(node);
                    }
                    for (const node of this.q.getNodes()) {
                        set.add(node);
                    }
                    activeNodesEmitter.fire([...set.values()]);
                });
            }));
            onDidChangeActiveNodes.input = activeNodesEmitter.event;
            if (E.keyboardSupport !== false) {
                const onKeyDown = event_2.Event.chain(this.j.onKeyDown, $ => $.filter(e => !(0, listWidget_1.$nQ)(e.target))
                    .map(e => new keyboardEvent_1.$jO(e)));
                event_2.Event.chain(onKeyDown, $ => $.filter(e => e.keyCode === 15 /* KeyCode.LeftArrow */))(this.F, this, this.A);
                event_2.Event.chain(onKeyDown, $ => $.filter(e => e.keyCode === 17 /* KeyCode.RightArrow */))(this.G, this, this.A);
                event_2.Event.chain(onKeyDown, $ => $.filter(e => e.keyCode === 10 /* KeyCode.Space */))(this.H, this, this.A);
            }
            if ((E.findWidgetEnabled ?? true) && E.keyboardNavigationLabelProvider && E.contextViewProvider) {
                const opts = this.options.findWidgetStyles ? { styles: this.options.findWidgetStyles } : undefined;
                this.x = new FindController(this, this.o, this.j, filter, E.contextViewProvider, opts);
                this.y = node => this.x.shouldAllowFocus(node);
                this.onDidChangeFindOpenState = this.x.onDidChangeOpenState;
                this.A.add(this.x);
                this.onDidChangeFindMode = this.x.onDidChangeMode;
                this.onDidChangeFindMatchType = this.x.onDidChangeMatchType;
            }
            else {
                this.onDidChangeFindMode = event_2.Event.None;
                this.onDidChangeFindMatchType = event_2.Event.None;
            }
            this.z = (0, dom_1.$XO)(this.j.getHTMLElement());
            this.getHTMLElement().classList.toggle('always', this.E.renderIndentGuides === RenderIndentGuides.Always);
        }
        updateOptions(optionsUpdate = {}) {
            this.E = { ...this.E, ...optionsUpdate };
            for (const renderer of this.k) {
                renderer.updateOptions(optionsUpdate);
            }
            this.j.updateOptions(this.E);
            this.x?.updateOptions(optionsUpdate);
            this.C.fire(this.E);
            this.getHTMLElement().classList.toggle('always', this.E.renderIndentGuides === RenderIndentGuides.Always);
        }
        get options() {
            return this.E;
        }
        updateWidth(element) {
            const index = this.o.getListIndex(element);
            if (index === -1) {
                return;
            }
            this.j.updateWidth(index);
        }
        // Widget
        getHTMLElement() {
            return this.j.getHTMLElement();
        }
        get contentHeight() {
            return this.j.contentHeight;
        }
        get contentWidth() {
            return this.j.contentWidth;
        }
        get onDidChangeContentHeight() {
            return this.j.onDidChangeContentHeight;
        }
        get onDidChangeContentWidth() {
            return this.j.onDidChangeContentWidth;
        }
        get scrollTop() {
            return this.j.scrollTop;
        }
        set scrollTop(scrollTop) {
            this.j.scrollTop = scrollTop;
        }
        get scrollLeft() {
            return this.j.scrollLeft;
        }
        set scrollLeft(scrollLeft) {
            this.j.scrollLeft = scrollLeft;
        }
        get scrollHeight() {
            return this.j.scrollHeight;
        }
        get renderHeight() {
            return this.j.renderHeight;
        }
        get firstVisibleElement() {
            const index = this.j.firstVisibleIndex;
            if (index < 0 || index >= this.j.length) {
                return undefined;
            }
            const node = this.j.element(index);
            return node.element;
        }
        get lastVisibleElement() {
            const index = this.j.lastVisibleIndex;
            const node = this.j.element(index);
            return node.element;
        }
        get ariaLabel() {
            return this.j.ariaLabel;
        }
        set ariaLabel(value) {
            this.j.ariaLabel = value;
        }
        get selectionSize() {
            return this.q.getNodes().length;
        }
        domFocus() {
            this.j.domFocus();
        }
        isDOMFocused() {
            return this.getHTMLElement() === document.activeElement;
        }
        layout(height, width) {
            this.j.layout(height, width);
            if ((0, types_1.$nf)(width)) {
                this.x?.layout(width);
            }
        }
        style(styles) {
            const suffix = `.${this.j.domId}`;
            const content = [];
            if (styles.treeIndentGuidesStroke) {
                content.push(`.monaco-list${suffix}:hover .monaco-tl-indent > .indent-guide, .monaco-list${suffix}.always .monaco-tl-indent > .indent-guide  { border-color: ${styles.treeInactiveIndentGuidesStroke}; }`);
                content.push(`.monaco-list${suffix} .monaco-tl-indent > .indent-guide.active { border-color: ${styles.treeIndentGuidesStroke}; }`);
            }
            this.z.textContent = content.join('\n');
            this.j.style(styles);
        }
        // Tree navigation
        getParentElement(location) {
            const parentRef = this.o.getParentNodeLocation(location);
            const parentNode = this.o.getNode(parentRef);
            return parentNode.element;
        }
        getFirstElementChild(location) {
            return this.o.getFirstElementChild(location);
        }
        // Tree
        getNode(location) {
            return this.o.getNode(location);
        }
        getNodeLocation(node) {
            return this.o.getNodeLocation(node);
        }
        collapse(location, recursive = false) {
            return this.o.setCollapsed(location, true, recursive);
        }
        expand(location, recursive = false) {
            return this.o.setCollapsed(location, false, recursive);
        }
        toggleCollapsed(location, recursive = false) {
            return this.o.setCollapsed(location, undefined, recursive);
        }
        expandAll() {
            this.o.setCollapsed(this.o.rootRef, false, true);
        }
        collapseAll() {
            this.o.setCollapsed(this.o.rootRef, true, true);
        }
        isCollapsible(location) {
            return this.o.isCollapsible(location);
        }
        setCollapsible(location, collapsible) {
            return this.o.setCollapsible(location, collapsible);
        }
        isCollapsed(location) {
            return this.o.isCollapsed(location);
        }
        triggerTypeNavigation() {
            this.j.triggerTypeNavigation();
        }
        openFind() {
            this.x?.open();
        }
        closeFind() {
            this.x?.close();
        }
        refilter() {
            this.B.fire(undefined);
            this.o.refilter();
        }
        setAnchor(element) {
            if (typeof element === 'undefined') {
                return this.j.setAnchor(undefined);
            }
            const node = this.o.getNode(element);
            this.u.set([node]);
            const index = this.o.getListIndex(element);
            if (index > -1) {
                this.j.setAnchor(index, true);
            }
        }
        getAnchor() {
            return (0, arrays_1.$Mb)(this.u.get(), undefined);
        }
        setSelection(elements, browserEvent) {
            const nodes = elements.map(e => this.o.getNode(e));
            this.q.set(nodes, browserEvent);
            const indexes = elements.map(e => this.o.getListIndex(e)).filter(i => i > -1);
            this.j.setSelection(indexes, browserEvent, true);
        }
        getSelection() {
            return this.q.get();
        }
        setFocus(elements, browserEvent) {
            const nodes = elements.map(e => this.o.getNode(e));
            this.p.set(nodes, browserEvent);
            const indexes = elements.map(e => this.o.getListIndex(e)).filter(i => i > -1);
            this.j.setFocus(indexes, browserEvent, true);
        }
        focusNext(n = 1, loop = false, browserEvent, filter = this.y) {
            this.j.focusNext(n, loop, browserEvent, filter);
        }
        focusPrevious(n = 1, loop = false, browserEvent, filter = this.y) {
            this.j.focusPrevious(n, loop, browserEvent, filter);
        }
        focusNextPage(browserEvent, filter = this.y) {
            return this.j.focusNextPage(browserEvent, filter);
        }
        focusPreviousPage(browserEvent, filter = this.y) {
            return this.j.focusPreviousPage(browserEvent, filter);
        }
        focusLast(browserEvent, filter = this.y) {
            this.j.focusLast(browserEvent, filter);
        }
        focusFirst(browserEvent, filter = this.y) {
            this.j.focusFirst(browserEvent, filter);
        }
        getFocus() {
            return this.p.get();
        }
        reveal(location, relativeTop) {
            this.o.expandTo(location);
            const index = this.o.getListIndex(location);
            if (index === -1) {
                return;
            }
            this.j.reveal(index, relativeTop);
        }
        /**
         * Returns the relative position of an element rendered in the list.
         * Returns `null` if the element isn't *entirely* in the visible viewport.
         */
        getRelativeTop(location) {
            const index = this.o.getListIndex(location);
            if (index === -1) {
                return null;
            }
            return this.j.getRelativeTop(index);
        }
        getViewState(identityProvider = this.options.identityProvider) {
            if (!identityProvider) {
                throw new tree_1.$9R(this.D, 'Can\'t get tree view state without an identity provider');
            }
            const getId = (element) => identityProvider.getId(element).toString();
            const state = $cS.empty(this.scrollTop);
            for (const focus of this.getFocus()) {
                state.focus.add(getId(focus));
            }
            for (const selection of this.getSelection()) {
                state.selection.add(getId(selection));
            }
            const root = this.o.getNode();
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
        F(e) {
            e.preventDefault();
            e.stopPropagation();
            const nodes = this.j.getFocusedElements();
            if (nodes.length === 0) {
                return;
            }
            const node = nodes[0];
            const location = this.o.getNodeLocation(node);
            const didChange = this.o.setCollapsed(location, true);
            if (!didChange) {
                const parentLocation = this.o.getParentNodeLocation(location);
                if (!parentLocation) {
                    return;
                }
                const parentListIndex = this.o.getListIndex(parentLocation);
                this.j.reveal(parentListIndex);
                this.j.setFocus([parentListIndex]);
            }
        }
        G(e) {
            e.preventDefault();
            e.stopPropagation();
            const nodes = this.j.getFocusedElements();
            if (nodes.length === 0) {
                return;
            }
            const node = nodes[0];
            const location = this.o.getNodeLocation(node);
            const didChange = this.o.setCollapsed(location, false);
            if (!didChange) {
                if (!node.children.some(child => child.visible)) {
                    return;
                }
                const [focusedIndex] = this.j.getFocus();
                const firstChildIndex = focusedIndex + 1;
                this.j.reveal(firstChildIndex);
                this.j.setFocus([firstChildIndex]);
            }
        }
        H(e) {
            e.preventDefault();
            e.stopPropagation();
            const nodes = this.j.getFocusedElements();
            if (nodes.length === 0) {
                return;
            }
            const node = nodes[0];
            const location = this.o.getNodeLocation(node);
            const recursive = e.browserEvent.altKey;
            this.o.setCollapsed(location, undefined, recursive);
        }
        navigate(start) {
            return new TreeNavigator(this.j, this.o, start);
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.A);
            this.j.dispose();
        }
    }
    exports.$fS = $fS;
    class TreeNavigator {
        constructor(b, c, start) {
            this.b = b;
            this.c = c;
            if (start) {
                this.a = this.c.getListIndex(start);
            }
            else {
                this.a = -1;
            }
        }
        current() {
            if (this.a < 0 || this.a >= this.b.length) {
                return null;
            }
            return this.b.element(this.a).element;
        }
        previous() {
            this.a--;
            return this.current();
        }
        next() {
            this.a++;
            return this.current();
        }
        first() {
            this.a = 0;
            return this.current();
        }
        last() {
            this.a = this.b.length - 1;
            return this.current();
        }
    }
});
//# sourceMappingURL=abstractTree.js.map