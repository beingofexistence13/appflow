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
define(["require", "exports", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/touch", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/range", "vs/base/common/scrollable", "vs/base/browser/ui/list/rangeMap", "vs/base/browser/ui/list/rowCache", "vs/base/common/errors"], function (require, exports, dnd_1, dom_1, event_1, touch_1, scrollableElement_1, arrays_1, async_1, decorators_1, event_2, lifecycle_1, range_1, scrollable_1, rangeMap_1, rowCache_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mQ = exports.$lQ = exports.$kQ = exports.$jQ = void 0;
    const StaticDND = {
        CurrentDragAndDropData: undefined
    };
    const DefaultOptions = {
        useShadows: true,
        verticalScrollMode: 1 /* ScrollbarVisibility.Auto */,
        setRowLineHeight: true,
        setRowHeight: true,
        supportDynamicHeights: false,
        dnd: {
            getDragElements(e) { return [e]; },
            getDragURI() { return null; },
            onDragStart() { },
            onDragOver() { return false; },
            drop() { }
        },
        horizontalScrolling: false,
        transformOptimization: true,
        alwaysConsumeMouseWheel: true,
    };
    class $jQ {
        get context() {
            return this.d;
        }
        set context(value) {
            this.d = value;
        }
        constructor(elements) {
            this.elements = elements;
        }
        update() { }
        getData() {
            return this.elements;
        }
    }
    exports.$jQ = $jQ;
    class $kQ {
        constructor(elements) {
            this.elements = elements;
        }
        update() { }
        getData() {
            return this.elements;
        }
    }
    exports.$kQ = $kQ;
    class $lQ {
        constructor() {
            this.types = [];
            this.files = [];
        }
        update(dataTransfer) {
            if (dataTransfer.types) {
                this.types.splice(0, this.types.length, ...dataTransfer.types);
            }
            if (dataTransfer.files) {
                this.files.splice(0, this.files.length);
                for (let i = 0; i < dataTransfer.files.length; i++) {
                    const file = dataTransfer.files.item(i);
                    if (file && (file.size || file.type)) {
                        this.files.push(file);
                    }
                }
            }
        }
        getData() {
            return {
                types: this.types,
                files: this.files
            };
        }
    }
    exports.$lQ = $lQ;
    function equalsDragFeedback(f1, f2) {
        if (Array.isArray(f1) && Array.isArray(f2)) {
            return (0, arrays_1.$sb)(f1, f2);
        }
        return f1 === f2;
    }
    class ListViewAccessibilityProvider {
        constructor(accessibilityProvider) {
            if (accessibilityProvider?.getSetSize) {
                this.getSetSize = accessibilityProvider.getSetSize.bind(accessibilityProvider);
            }
            else {
                this.getSetSize = (e, i, l) => l;
            }
            if (accessibilityProvider?.getPosInSet) {
                this.getPosInSet = accessibilityProvider.getPosInSet.bind(accessibilityProvider);
            }
            else {
                this.getPosInSet = (e, i) => i + 1;
            }
            if (accessibilityProvider?.getRole) {
                this.getRole = accessibilityProvider.getRole.bind(accessibilityProvider);
            }
            else {
                this.getRole = _ => 'listitem';
            }
            if (accessibilityProvider?.isChecked) {
                this.isChecked = accessibilityProvider.isChecked.bind(accessibilityProvider);
            }
            else {
                this.isChecked = _ => undefined;
            }
        }
    }
    /**
     * The {@link $mQ} is a virtual scrolling engine.
     *
     * Given that it only renders elements within its viewport, it can hold large
     * collections of elements and stay very performant. The performance bottleneck
     * usually lies within the user's rendering code for each element.
     *
     * @remarks It is a low-level widget, not meant to be used directly. Refer to the
     * List widget instead.
     */
    class $mQ {
        static { this.c = 0; }
        get contentHeight() { return this.g.size; }
        get contentWidth() { return this.E ?? 0; }
        get onDidScroll() { return this.q.onScroll; }
        get onWillScroll() { return this.q.onWillScroll; }
        get containerDomNode() { return this.o; }
        get scrollableElementDomNode() { return this.q.getDomNode(); }
        get P() { return this.O; }
        set P(value) {
            if (value === this.O) {
                return;
            }
            if (value && this.B) {
                throw new Error('Horizontal scrolling and dynamic heights not supported simultaneously');
            }
            this.O = value;
            this.domNode.classList.toggle('horizontal-scrolling', this.O);
            if (this.O) {
                for (const item of this.d) {
                    this.Y(item);
                }
                this.V();
                this.q.setScrollDimensions({ width: (0, dom_1.$IO)(this.domNode) });
                this.o.style.width = `${Math.max(this.E || 0, this.n)}px`;
            }
            else {
                this.u.cancel();
                this.q.setScrollDimensions({ width: this.n, scrollWidth: this.n });
                this.o.style.width = '';
            }
        }
        constructor(container, Q, renderers, options = DefaultOptions) {
            this.Q = Q;
            this.domId = `list_id_${++$mQ.c}`;
            this.j = new Map();
            this.n = 0;
            this.s = 0;
            this.t = null;
            this.u = new async_1.$Dg(50);
            this.v = false;
            this.x = lifecycle_1.$kc.None;
            this.y = 0;
            this.G = false;
            this.J = lifecycle_1.$kc.None;
            this.K = lifecycle_1.$kc.None;
            this.L = new lifecycle_1.$jc();
            this.M = new event_2.$fd();
            this.N = new event_2.$fd();
            this.onDidChangeContentHeight = event_2.Event.latch(this.M.event, undefined, this.L);
            this.onDidChangeContentWidth = event_2.Event.latch(this.N.event, undefined, this.L);
            this.O = false;
            if (options.horizontalScrolling && options.supportDynamicHeights) {
                throw new Error('Horizontal scrolling and dynamic heights not supported simultaneously');
            }
            this.d = [];
            this.f = 0;
            this.g = new rangeMap_1.$hQ(options.paddingTop ?? 0);
            for (const renderer of renderers) {
                this.j.set(renderer.templateId, renderer);
            }
            this.h = this.L.add(new rowCache_1.$iQ(this.j));
            this.k = 0;
            this.m = 0;
            this.domNode = document.createElement('div');
            this.domNode.className = 'monaco-list';
            this.domNode.classList.add(this.domId);
            this.domNode.tabIndex = 0;
            this.domNode.classList.toggle('mouse-support', typeof options.mouseSupport === 'boolean' ? options.mouseSupport : true);
            this.O = options.horizontalScrolling ?? DefaultOptions.horizontalScrolling;
            this.domNode.classList.toggle('horizontal-scrolling', this.O);
            this.C = typeof options.paddingBottom === 'undefined' ? 0 : options.paddingBottom;
            this.D = new ListViewAccessibilityProvider(options.accessibilityProvider);
            this.o = document.createElement('div');
            this.o.className = 'monaco-list-rows';
            const transformOptimization = options.transformOptimization ?? DefaultOptions.transformOptimization;
            if (transformOptimization) {
                this.o.style.transform = 'translate3d(0px, 0px, 0px)';
                this.o.style.overflow = 'hidden';
                this.o.style.contain = 'strict';
            }
            this.L.add(touch_1.$EP.addTarget(this.o));
            this.p = this.L.add(new scrollable_1.$Nr({
                forceIntegerValues: true,
                smoothScrollDuration: (options.smoothScrolling ?? false) ? 125 : 0,
                scheduleAtNextAnimationFrame: cb => (0, dom_1.$vO)(cb)
            }));
            this.q = this.L.add(new scrollableElement_1.$TP(this.o, {
                alwaysConsumeMouseWheel: options.alwaysConsumeMouseWheel ?? DefaultOptions.alwaysConsumeMouseWheel,
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                vertical: options.verticalScrollMode ?? DefaultOptions.verticalScrollMode,
                useShadows: options.useShadows ?? DefaultOptions.useShadows,
                mouseWheelScrollSensitivity: options.mouseWheelScrollSensitivity,
                fastScrollSensitivity: options.fastScrollSensitivity,
                scrollByPage: options.scrollByPage
            }, this.p));
            this.domNode.appendChild(this.q.getDomNode());
            container.appendChild(this.domNode);
            this.q.onScroll(this.gb, this, this.L);
            this.L.add((0, dom_1.$nO)(this.o, touch_1.EventType.Change, e => this.hb(e)));
            // Prevent the monaco-scrollable-element from scrolling
            // https://github.com/microsoft/vscode/issues/44181
            this.L.add((0, dom_1.$nO)(this.q.getDomNode(), 'scroll', e => e.target.scrollTop = 0));
            this.L.add((0, dom_1.$nO)(this.domNode, 'dragover', e => this.jb(this.fb(e))));
            this.L.add((0, dom_1.$nO)(this.domNode, 'drop', e => this.lb(this.fb(e))));
            this.L.add((0, dom_1.$nO)(this.domNode, 'dragleave', e => this.kb(this.fb(e))));
            this.L.add((0, dom_1.$nO)(this.domNode, 'dragend', e => this.mb(e)));
            this.z = options.setRowLineHeight ?? DefaultOptions.setRowLineHeight;
            this.A = options.setRowHeight ?? DefaultOptions.setRowHeight;
            this.B = options.supportDynamicHeights ?? DefaultOptions.supportDynamicHeights;
            this.F = options.dnd ?? DefaultOptions.dnd;
            this.layout(options.initialSize?.height, options.initialSize?.width);
        }
        updateOptions(options) {
            if (options.paddingBottom !== undefined) {
                this.C = options.paddingBottom;
                this.q.setScrollDimensions({ scrollHeight: this.scrollHeight });
            }
            if (options.smoothScrolling !== undefined) {
                this.p.setSmoothScrollDuration(options.smoothScrolling ? 125 : 0);
            }
            if (options.horizontalScrolling !== undefined) {
                this.P = options.horizontalScrolling;
            }
            let scrollableOptions;
            if (options.scrollByPage !== undefined) {
                scrollableOptions = { ...(scrollableOptions ?? {}), scrollByPage: options.scrollByPage };
            }
            if (options.mouseWheelScrollSensitivity !== undefined) {
                scrollableOptions = { ...(scrollableOptions ?? {}), mouseWheelScrollSensitivity: options.mouseWheelScrollSensitivity };
            }
            if (options.fastScrollSensitivity !== undefined) {
                scrollableOptions = { ...(scrollableOptions ?? {}), fastScrollSensitivity: options.fastScrollSensitivity };
            }
            if (scrollableOptions) {
                this.q.updateOptions(scrollableOptions);
            }
            if (options.paddingTop !== undefined && options.paddingTop !== this.g.paddingTop) {
                // trigger a rerender
                const lastRenderRange = this.sb(this.k, this.m);
                const offset = options.paddingTop - this.g.paddingTop;
                this.g.paddingTop = options.paddingTop;
                this.W(lastRenderRange, Math.max(0, this.k + offset), this.m, undefined, undefined, true);
                this.setScrollTop(this.k);
                this.S();
                if (this.B) {
                    this.tb(this.k, this.m);
                }
            }
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            this.q.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this.q.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        updateElementHeight(index, size, anchorIndex) {
            if (index < 0 || index >= this.d.length) {
                return;
            }
            const originalSize = this.d[index].size;
            if (typeof size === 'undefined') {
                if (!this.B) {
                    console.warn('Dynamic heights not supported');
                    return;
                }
                this.d[index].lastDynamicHeightWidth = undefined;
                size = originalSize + this.ub(index);
            }
            if (originalSize === size) {
                return;
            }
            const lastRenderRange = this.sb(this.k, this.m);
            let heightDiff = 0;
            if (index < lastRenderRange.start) {
                // do not scroll the viewport if resized element is out of viewport
                heightDiff = size - originalSize;
            }
            else {
                if (anchorIndex !== null && anchorIndex > index && anchorIndex <= lastRenderRange.end) {
                    // anchor in viewport
                    // resized element in viewport and above the anchor
                    heightDiff = size - originalSize;
                }
                else {
                    heightDiff = 0;
                }
            }
            this.g.splice(index, 1, [{ size: size }]);
            this.d[index].size = size;
            this.W(lastRenderRange, Math.max(0, this.k + heightDiff), this.m, undefined, undefined, true);
            this.setScrollTop(this.k);
            this.S();
            if (this.B) {
                this.tb(this.k, this.m);
            }
        }
        splice(start, deleteCount, elements = []) {
            if (this.v) {
                throw new Error('Can\'t run recursive splices.');
            }
            this.v = true;
            try {
                return this.R(start, deleteCount, elements);
            }
            finally {
                this.v = false;
                this.M.fire(this.contentHeight);
            }
        }
        R(start, deleteCount, elements = []) {
            const previousRenderRange = this.sb(this.k, this.m);
            const deleteRange = { start, end: start + deleteCount };
            const removeRange = range_1.Range.intersect(previousRenderRange, deleteRange);
            // try to reuse rows, avoid removing them from DOM
            const rowsToDispose = new Map();
            for (let i = removeRange.end - 1; i >= removeRange.start; i--) {
                const item = this.d[i];
                item.dragStartDisposable.dispose();
                item.checkedDisposable.dispose();
                if (item.row) {
                    let rows = rowsToDispose.get(item.templateId);
                    if (!rows) {
                        rows = [];
                        rowsToDispose.set(item.templateId, rows);
                    }
                    const renderer = this.j.get(item.templateId);
                    if (renderer && renderer.disposeElement) {
                        renderer.disposeElement(item.element, i, item.row.templateData, item.size);
                    }
                    rows.push(item.row);
                }
                item.row = null;
            }
            const previousRestRange = { start: start + deleteCount, end: this.d.length };
            const previousRenderedRestRange = range_1.Range.intersect(previousRestRange, previousRenderRange);
            const previousUnrenderedRestRanges = range_1.Range.relativeComplement(previousRestRange, previousRenderRange);
            const inserted = elements.map(element => ({
                id: String(this.f++),
                element,
                templateId: this.Q.getTemplateId(element),
                size: this.Q.getHeight(element),
                width: undefined,
                hasDynamicHeight: !!this.Q.hasDynamicHeight && this.Q.hasDynamicHeight(element),
                lastDynamicHeightWidth: undefined,
                row: null,
                uri: undefined,
                dropTarget: false,
                dragStartDisposable: lifecycle_1.$kc.None,
                checkedDisposable: lifecycle_1.$kc.None
            }));
            let deleted;
            // TODO@joao: improve this optimization to catch even more cases
            if (start === 0 && deleteCount >= this.d.length) {
                this.g = new rangeMap_1.$hQ(this.g.paddingTop);
                this.g.splice(0, 0, inserted);
                deleted = this.d;
                this.d = inserted;
            }
            else {
                this.g.splice(start, deleteCount, inserted);
                deleted = this.d.splice(start, deleteCount, ...inserted);
            }
            const delta = elements.length - deleteCount;
            const renderRange = this.sb(this.k, this.m);
            const renderedRestRange = (0, rangeMap_1.$fQ)(previousRenderedRestRange, delta);
            const updateRange = range_1.Range.intersect(renderRange, renderedRestRange);
            for (let i = updateRange.start; i < updateRange.end; i++) {
                this.Z(this.d[i], i);
            }
            const removeRanges = range_1.Range.relativeComplement(renderedRestRange, renderRange);
            for (const range of removeRanges) {
                for (let i = range.start; i < range.end; i++) {
                    this.ab(i);
                }
            }
            const unrenderedRestRanges = previousUnrenderedRestRanges.map(r => (0, rangeMap_1.$fQ)(r, delta));
            const elementsRange = { start, end: start + elements.length };
            const insertRanges = [elementsRange, ...unrenderedRestRanges].map(r => range_1.Range.intersect(renderRange, r));
            const beforeElement = this.vb(insertRanges);
            for (const range of insertRanges) {
                for (let i = range.start; i < range.end; i++) {
                    const item = this.d[i];
                    const rows = rowsToDispose.get(item.templateId);
                    const row = rows?.pop();
                    this.X(i, beforeElement, row);
                }
            }
            for (const rows of rowsToDispose.values()) {
                for (const row of rows) {
                    this.h.release(row);
                }
            }
            this.S();
            if (this.B) {
                this.tb(this.scrollTop, this.renderHeight);
            }
            return deleted.map(i => i.element);
        }
        S() {
            this.s = this.contentHeight;
            this.o.style.height = `${this.s}px`;
            if (!this.t) {
                this.t = (0, dom_1.$vO)(() => {
                    this.q.setScrollDimensions({ scrollHeight: this.scrollHeight });
                    this.V();
                    this.t = null;
                });
            }
        }
        U() {
            if (!this.P) {
                this.u.cancel();
                return;
            }
            this.u.trigger(() => this.V());
        }
        V() {
            if (!this.P) {
                return;
            }
            let scrollWidth = 0;
            for (const item of this.d) {
                if (typeof item.width !== 'undefined') {
                    scrollWidth = Math.max(scrollWidth, item.width);
                }
            }
            this.E = scrollWidth;
            this.q.setScrollDimensions({ scrollWidth: scrollWidth === 0 ? 0 : (scrollWidth + 10) });
            this.N.fire(this.E);
        }
        updateWidth(index) {
            if (!this.P || typeof this.E === 'undefined') {
                return;
            }
            const item = this.d[index];
            this.Y(item);
            if (typeof item.width !== 'undefined' && item.width > this.E) {
                this.E = item.width;
                this.q.setScrollDimensions({ scrollWidth: this.E + 10 });
                this.N.fire(this.E);
            }
        }
        rerender() {
            if (!this.B) {
                return;
            }
            for (const item of this.d) {
                item.lastDynamicHeightWidth = undefined;
            }
            this.tb(this.k, this.m);
        }
        get length() {
            return this.d.length;
        }
        get renderHeight() {
            const scrollDimensions = this.q.getScrollDimensions();
            return scrollDimensions.height;
        }
        get firstVisibleIndex() {
            const range = this.sb(this.k, this.m);
            const firstElTop = this.g.positionAt(range.start);
            const nextElTop = this.g.positionAt(range.start + 1);
            if (nextElTop !== -1) {
                const firstElMidpoint = (nextElTop - firstElTop) / 2 + firstElTop;
                if (firstElMidpoint < this.scrollTop) {
                    return range.start + 1;
                }
            }
            return range.start;
        }
        get lastVisibleIndex() {
            const range = this.sb(this.k, this.m);
            return range.end - 1;
        }
        element(index) {
            return this.d[index].element;
        }
        indexOf(element) {
            return this.d.findIndex(item => item.element === element);
        }
        domElement(index) {
            const row = this.d[index].row;
            return row && row.domNode;
        }
        elementHeight(index) {
            return this.d[index].size;
        }
        elementTop(index) {
            return this.g.positionAt(index);
        }
        indexAt(position) {
            return this.g.indexAt(position);
        }
        indexAfter(position) {
            return this.g.indexAfter(position);
        }
        layout(height, width) {
            const scrollDimensions = {
                height: typeof height === 'number' ? height : (0, dom_1.$KO)(this.domNode)
            };
            if (this.t) {
                this.t.dispose();
                this.t = null;
                scrollDimensions.scrollHeight = this.scrollHeight;
            }
            this.q.setScrollDimensions(scrollDimensions);
            if (typeof width !== 'undefined') {
                this.n = width;
                if (this.B) {
                    this.tb(this.scrollTop, this.renderHeight);
                }
            }
            if (this.P) {
                this.q.setScrollDimensions({
                    width: typeof width === 'number' ? width : (0, dom_1.$IO)(this.domNode)
                });
            }
        }
        // Render
        W(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM = false) {
            const renderRange = this.sb(renderTop, renderHeight);
            const rangesToInsert = range_1.Range.relativeComplement(renderRange, previousRenderRange);
            const rangesToRemove = range_1.Range.relativeComplement(previousRenderRange, renderRange);
            const beforeElement = this.vb(rangesToInsert);
            if (updateItemsInDOM) {
                const rangesToUpdate = range_1.Range.intersect(previousRenderRange, renderRange);
                for (let i = rangesToUpdate.start; i < rangesToUpdate.end; i++) {
                    this.Z(this.d[i], i);
                }
            }
            this.h.transact(() => {
                for (const range of rangesToRemove) {
                    for (let i = range.start; i < range.end; i++) {
                        this.ab(i);
                    }
                }
                for (const range of rangesToInsert) {
                    for (let i = range.start; i < range.end; i++) {
                        this.X(i, beforeElement);
                    }
                }
            });
            if (renderLeft !== undefined) {
                this.o.style.left = `-${renderLeft}px`;
            }
            this.o.style.top = `-${renderTop}px`;
            if (this.P && scrollWidth !== undefined) {
                this.o.style.width = `${Math.max(scrollWidth, this.n)}px`;
            }
            this.k = renderTop;
            this.m = renderHeight;
        }
        // DOM operations
        X(index, beforeElement, row) {
            const item = this.d[index];
            let isStale = false;
            if (!item.row) {
                if (row) {
                    item.row = row;
                }
                else {
                    const result = this.h.alloc(item.templateId);
                    item.row = result.row;
                    isStale = result.isReusingConnectedDomNode;
                }
            }
            const role = this.D.getRole(item.element) || 'listitem';
            item.row.domNode.setAttribute('role', role);
            const checked = this.D.isChecked(item.element);
            if (typeof checked === 'boolean') {
                item.row.domNode.setAttribute('aria-checked', String(!!checked));
            }
            else if (checked) {
                const update = (checked) => item.row.domNode.setAttribute('aria-checked', String(!!checked));
                update(checked.value);
                item.checkedDisposable = checked.onDidChange(update);
            }
            if (isStale || !item.row.domNode.parentElement) {
                if (beforeElement) {
                    this.o.insertBefore(item.row.domNode, beforeElement);
                }
                else {
                    this.o.appendChild(item.row.domNode);
                }
            }
            this.Z(item, index);
            const renderer = this.j.get(item.templateId);
            if (!renderer) {
                throw new Error(`No renderer found for template id ${item.templateId}`);
            }
            renderer?.renderElement(item.element, index, item.row.templateData, item.size);
            const uri = this.F.getDragURI(item.element);
            item.dragStartDisposable.dispose();
            item.row.domNode.draggable = !!uri;
            if (uri) {
                item.dragStartDisposable = (0, dom_1.$nO)(item.row.domNode, 'dragstart', event => this.ib(item.element, uri, event));
            }
            if (this.P) {
                this.Y(item);
                this.U();
            }
        }
        Y(item) {
            if (!item.row || !item.row.domNode) {
                return;
            }
            item.row.domNode.style.width = 'fit-content';
            item.width = (0, dom_1.$IO)(item.row.domNode);
            const style = window.getComputedStyle(item.row.domNode);
            if (style.paddingLeft) {
                item.width += parseFloat(style.paddingLeft);
            }
            if (style.paddingRight) {
                item.width += parseFloat(style.paddingRight);
            }
            item.row.domNode.style.width = '';
        }
        Z(item, index) {
            item.row.domNode.style.top = `${this.elementTop(index)}px`;
            if (this.A) {
                item.row.domNode.style.height = `${item.size}px`;
            }
            if (this.z) {
                item.row.domNode.style.lineHeight = `${item.size}px`;
            }
            item.row.domNode.setAttribute('data-index', `${index}`);
            item.row.domNode.setAttribute('data-last-element', index === this.length - 1 ? 'true' : 'false');
            item.row.domNode.setAttribute('data-parity', index % 2 === 0 ? 'even' : 'odd');
            item.row.domNode.setAttribute('aria-setsize', String(this.D.getSetSize(item.element, index, this.length)));
            item.row.domNode.setAttribute('aria-posinset', String(this.D.getPosInSet(item.element, index)));
            item.row.domNode.setAttribute('id', this.getElementDomId(index));
            item.row.domNode.classList.toggle('drop-target', item.dropTarget);
        }
        ab(index) {
            const item = this.d[index];
            item.dragStartDisposable.dispose();
            item.checkedDisposable.dispose();
            if (item.row) {
                const renderer = this.j.get(item.templateId);
                if (renderer && renderer.disposeElement) {
                    renderer.disposeElement(item.element, index, item.row.templateData, item.size);
                }
                this.h.release(item.row);
                item.row = null;
            }
            if (this.P) {
                this.U();
            }
        }
        getScrollTop() {
            const scrollPosition = this.q.getScrollPosition();
            return scrollPosition.scrollTop;
        }
        setScrollTop(scrollTop, reuseAnimation) {
            if (this.t) {
                this.t.dispose();
                this.t = null;
                this.q.setScrollDimensions({ scrollHeight: this.scrollHeight });
            }
            this.q.setScrollPosition({ scrollTop, reuseAnimation });
        }
        getScrollLeft() {
            const scrollPosition = this.q.getScrollPosition();
            return scrollPosition.scrollLeft;
        }
        setScrollLeft(scrollLeft) {
            if (this.t) {
                this.t.dispose();
                this.t = null;
                this.q.setScrollDimensions({ scrollWidth: this.E });
            }
            this.q.setScrollPosition({ scrollLeft });
        }
        get scrollTop() {
            return this.getScrollTop();
        }
        set scrollTop(scrollTop) {
            this.setScrollTop(scrollTop);
        }
        get scrollHeight() {
            return this.s + (this.P ? 10 : 0) + this.C;
        }
        // Events
        get onMouseClick() { return event_2.Event.map(this.L.add(new event_1.$9P(this.domNode, 'click')).event, e => this.bb(e), this.L); }
        get onMouseDblClick() { return event_2.Event.map(this.L.add(new event_1.$9P(this.domNode, 'dblclick')).event, e => this.bb(e), this.L); }
        get onMouseMiddleClick() { return event_2.Event.filter(event_2.Event.map(this.L.add(new event_1.$9P(this.domNode, 'auxclick')).event, e => this.bb(e), this.L), e => e.browserEvent.button === 1, this.L); }
        get onMouseUp() { return event_2.Event.map(this.L.add(new event_1.$9P(this.domNode, 'mouseup')).event, e => this.bb(e), this.L); }
        get onMouseDown() { return event_2.Event.map(this.L.add(new event_1.$9P(this.domNode, 'mousedown')).event, e => this.bb(e), this.L); }
        get onMouseOver() { return event_2.Event.map(this.L.add(new event_1.$9P(this.domNode, 'mouseover')).event, e => this.bb(e), this.L); }
        get onMouseMove() { return event_2.Event.map(this.L.add(new event_1.$9P(this.domNode, 'mousemove')).event, e => this.bb(e), this.L); }
        get onMouseOut() { return event_2.Event.map(this.L.add(new event_1.$9P(this.domNode, 'mouseout')).event, e => this.bb(e), this.L); }
        get onContextMenu() { return event_2.Event.any(event_2.Event.map(this.L.add(new event_1.$9P(this.domNode, 'contextmenu')).event, e => this.bb(e), this.L), event_2.Event.map(this.L.add(new event_1.$9P(this.domNode, touch_1.EventType.Contextmenu)).event, e => this.eb(e), this.L)); }
        get onTouchStart() { return event_2.Event.map(this.L.add(new event_1.$9P(this.domNode, 'touchstart')).event, e => this.db(e), this.L); }
        get onTap() { return event_2.Event.map(this.L.add(new event_1.$9P(this.o, touch_1.EventType.Tap)).event, e => this.eb(e), this.L); }
        bb(browserEvent) {
            const index = this.rb(browserEvent.target || null);
            const item = typeof index === 'undefined' ? undefined : this.d[index];
            const element = item && item.element;
            return { browserEvent, index, element };
        }
        db(browserEvent) {
            const index = this.rb(browserEvent.target || null);
            const item = typeof index === 'undefined' ? undefined : this.d[index];
            const element = item && item.element;
            return { browserEvent, index, element };
        }
        eb(browserEvent) {
            const index = this.rb(browserEvent.initialTarget || null);
            const item = typeof index === 'undefined' ? undefined : this.d[index];
            const element = item && item.element;
            return { browserEvent, index, element };
        }
        fb(browserEvent) {
            const index = this.rb(browserEvent.target || null);
            const item = typeof index === 'undefined' ? undefined : this.d[index];
            const element = item && item.element;
            return { browserEvent, index, element };
        }
        gb(e) {
            try {
                const previousRenderRange = this.sb(this.k, this.m);
                this.W(previousRenderRange, e.scrollTop, e.height, e.scrollLeft, e.scrollWidth);
                if (this.B) {
                    this.tb(e.scrollTop, e.height, e.inSmoothScrolling);
                }
            }
            catch (err) {
                console.error('Got bad scroll event:', e);
                throw err;
            }
        }
        hb(event) {
            event.preventDefault();
            event.stopPropagation();
            this.scrollTop -= event.translationY;
        }
        // DND
        ib(element, uri, event) {
            if (!event.dataTransfer) {
                return;
            }
            const elements = this.F.getDragElements(element);
            event.dataTransfer.effectAllowed = 'copyMove';
            event.dataTransfer.setData(dnd_1.$CP.TEXT, uri);
            if (event.dataTransfer.setDragImage) {
                let label;
                if (this.F.getDragLabel) {
                    label = this.F.getDragLabel(elements, event);
                }
                if (typeof label === 'undefined') {
                    label = String(elements.length);
                }
                const dragImage = (0, dom_1.$)('.monaco-drag-image');
                dragImage.textContent = label;
                const getDragImageContainer = (e) => {
                    while (e && !e.classList.contains('monaco-workbench')) {
                        e = e.parentElement;
                    }
                    return e || document.body;
                };
                const container = getDragImageContainer(this.domNode);
                container.appendChild(dragImage);
                event.dataTransfer.setDragImage(dragImage, -10, -10);
                setTimeout(() => container.removeChild(dragImage), 0);
            }
            this.domNode.classList.add('dragging');
            this.H = new $jQ(elements);
            StaticDND.CurrentDragAndDropData = new $kQ(elements);
            this.F.onDragStart?.(this.H, event);
        }
        jb(event) {
            event.browserEvent.preventDefault(); // needed so that the drop event fires (https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome)
            this.K.dispose();
            if (StaticDND.CurrentDragAndDropData && StaticDND.CurrentDragAndDropData.getData() === 'vscode-ui') {
                return false;
            }
            this.ob(event.browserEvent);
            if (!event.browserEvent.dataTransfer) {
                return false;
            }
            // Drag over from outside
            if (!this.H) {
                if (StaticDND.CurrentDragAndDropData) {
                    // Drag over from another list
                    this.H = StaticDND.CurrentDragAndDropData;
                }
                else {
                    // Drag over from the desktop
                    if (!event.browserEvent.dataTransfer.types) {
                        return false;
                    }
                    this.H = new $lQ();
                }
            }
            const result = this.F.onDragOver(this.H, event.element, event.index, event.browserEvent);
            this.G = typeof result === 'boolean' ? result : result.accept;
            if (!this.G) {
                this.I = undefined;
                this.J.dispose();
                return false;
            }
            event.browserEvent.dataTransfer.dropEffect = (typeof result !== 'boolean' && result.effect === 0 /* ListDragOverEffect.Copy */) ? 'copy' : 'move';
            let feedback;
            if (typeof result !== 'boolean' && result.feedback) {
                feedback = result.feedback;
            }
            else {
                if (typeof event.index === 'undefined') {
                    feedback = [-1];
                }
                else {
                    feedback = [event.index];
                }
            }
            // sanitize feedback list
            feedback = (0, arrays_1.$Kb)(feedback).filter(i => i >= -1 && i < this.length).sort((a, b) => a - b);
            feedback = feedback[0] === -1 ? [-1] : feedback;
            if (equalsDragFeedback(this.I, feedback)) {
                return true;
            }
            this.I = feedback;
            this.J.dispose();
            if (feedback[0] === -1) { // entire list feedback
                this.domNode.classList.add('drop-target');
                this.o.classList.add('drop-target');
                this.J = (0, lifecycle_1.$ic)(() => {
                    this.domNode.classList.remove('drop-target');
                    this.o.classList.remove('drop-target');
                });
            }
            else {
                for (const index of feedback) {
                    const item = this.d[index];
                    item.dropTarget = true;
                    item.row?.domNode.classList.add('drop-target');
                }
                this.J = (0, lifecycle_1.$ic)(() => {
                    for (const index of feedback) {
                        const item = this.d[index];
                        item.dropTarget = false;
                        item.row?.domNode.classList.remove('drop-target');
                    }
                });
            }
            return true;
        }
        kb(event) {
            this.K.dispose();
            this.K = (0, async_1.$Ig)(() => this.nb(), 100);
            if (this.H) {
                this.F.onDragLeave?.(this.H, event.element, event.index, event.browserEvent);
            }
        }
        lb(event) {
            if (!this.G) {
                return;
            }
            const dragData = this.H;
            this.qb();
            this.nb();
            this.domNode.classList.remove('dragging');
            this.H = undefined;
            StaticDND.CurrentDragAndDropData = undefined;
            if (!dragData || !event.browserEvent.dataTransfer) {
                return;
            }
            event.browserEvent.preventDefault();
            dragData.update(event.browserEvent.dataTransfer);
            this.F.drop(dragData, event.element, event.index, event.browserEvent);
        }
        mb(event) {
            this.G = false;
            this.qb();
            this.nb();
            this.domNode.classList.remove('dragging');
            this.H = undefined;
            StaticDND.CurrentDragAndDropData = undefined;
            this.F.onDragEnd?.(event);
        }
        nb() {
            this.I = undefined;
            this.J.dispose();
            this.J = lifecycle_1.$kc.None;
        }
        // DND scroll top animation
        ob(event) {
            if (!this.w) {
                const viewTop = (0, dom_1.$CO)(this.domNode).top;
                this.w = (0, dom_1.$mP)(this.pb.bind(this, viewTop));
            }
            this.x.dispose();
            this.x = (0, async_1.$Ig)(() => {
                if (this.w) {
                    this.w.dispose();
                    this.w = undefined;
                }
            }, 1000);
            this.y = event.pageY;
        }
        pb(viewTop) {
            if (this.y === undefined) {
                return;
            }
            const diff = this.y - viewTop;
            const upperLimit = this.renderHeight - 35;
            if (diff < 35) {
                this.scrollTop += Math.max(-14, Math.floor(0.3 * (diff - 35)));
            }
            else if (diff > upperLimit) {
                this.scrollTop += Math.min(14, Math.floor(0.3 * (diff - upperLimit)));
            }
        }
        qb() {
            this.x.dispose();
            if (this.w) {
                this.w.dispose();
                this.w = undefined;
            }
        }
        // Util
        rb(target) {
            const scrollableElement = this.q.getDomNode();
            let element = target;
            while (element instanceof HTMLElement && element !== this.o && scrollableElement.contains(element)) {
                const rawIndex = element.getAttribute('data-index');
                if (rawIndex) {
                    const index = Number(rawIndex);
                    if (!isNaN(index)) {
                        return index;
                    }
                }
                element = element.parentElement;
            }
            return undefined;
        }
        sb(renderTop, renderHeight) {
            return {
                start: this.g.indexAt(renderTop),
                end: this.g.indexAfter(renderTop + renderHeight - 1)
            };
        }
        /**
         * Given a stable rendered state, checks every rendered element whether it needs
         * to be probed for dynamic height. Adjusts scroll height and top if necessary.
         */
        tb(renderTop, renderHeight, inSmoothScrolling) {
            const previousRenderRange = this.sb(renderTop, renderHeight);
            // Let's remember the second element's position, this helps in scrolling up
            // and preserving a linear upwards scroll movement
            let anchorElementIndex;
            let anchorElementTopDelta;
            if (renderTop === this.elementTop(previousRenderRange.start)) {
                anchorElementIndex = previousRenderRange.start;
                anchorElementTopDelta = 0;
            }
            else if (previousRenderRange.end - previousRenderRange.start > 1) {
                anchorElementIndex = previousRenderRange.start + 1;
                anchorElementTopDelta = this.elementTop(anchorElementIndex) - renderTop;
            }
            let heightDiff = 0;
            while (true) {
                const renderRange = this.sb(renderTop, renderHeight);
                let didChange = false;
                for (let i = renderRange.start; i < renderRange.end; i++) {
                    const diff = this.ub(i);
                    if (diff !== 0) {
                        this.g.splice(i, 1, [this.d[i]]);
                    }
                    heightDiff += diff;
                    didChange = didChange || diff !== 0;
                }
                if (!didChange) {
                    if (heightDiff !== 0) {
                        this.S();
                    }
                    const unrenderRanges = range_1.Range.relativeComplement(previousRenderRange, renderRange);
                    for (const range of unrenderRanges) {
                        for (let i = range.start; i < range.end; i++) {
                            if (this.d[i].row) {
                                this.ab(i);
                            }
                        }
                    }
                    const renderRanges = range_1.Range.relativeComplement(renderRange, previousRenderRange);
                    for (const range of renderRanges) {
                        for (let i = range.start; i < range.end; i++) {
                            const afterIndex = i + 1;
                            const beforeRow = afterIndex < this.d.length ? this.d[afterIndex].row : null;
                            const beforeElement = beforeRow ? beforeRow.domNode : null;
                            this.X(i, beforeElement);
                        }
                    }
                    for (let i = renderRange.start; i < renderRange.end; i++) {
                        if (this.d[i].row) {
                            this.Z(this.d[i], i);
                        }
                    }
                    if (typeof anchorElementIndex === 'number') {
                        // To compute a destination scroll top, we need to take into account the current smooth scrolling
                        // animation, and then reuse it with a new target (to avoid prolonging the scroll)
                        // See https://github.com/microsoft/vscode/issues/104144
                        // See https://github.com/microsoft/vscode/pull/104284
                        // See https://github.com/microsoft/vscode/issues/107704
                        const deltaScrollTop = this.p.getFutureScrollPosition().scrollTop - renderTop;
                        const newScrollTop = this.elementTop(anchorElementIndex) - anchorElementTopDelta + deltaScrollTop;
                        this.setScrollTop(newScrollTop, inSmoothScrolling);
                    }
                    this.M.fire(this.contentHeight);
                    return;
                }
            }
        }
        ub(index) {
            const item = this.d[index];
            if (!!this.Q.getDynamicHeight) {
                const newSize = this.Q.getDynamicHeight(item.element);
                if (newSize !== null) {
                    const size = item.size;
                    item.size = newSize;
                    item.lastDynamicHeightWidth = this.n;
                    return newSize - size;
                }
            }
            if (!item.hasDynamicHeight || item.lastDynamicHeightWidth === this.n) {
                return 0;
            }
            if (!!this.Q.hasDynamicHeight && !this.Q.hasDynamicHeight(item.element)) {
                return 0;
            }
            const size = item.size;
            if (item.row) {
                item.row.domNode.style.height = '';
                item.size = item.row.domNode.offsetHeight;
                item.lastDynamicHeightWidth = this.n;
                return item.size - size;
            }
            const { row } = this.h.alloc(item.templateId);
            row.domNode.style.height = '';
            this.o.appendChild(row.domNode);
            const renderer = this.j.get(item.templateId);
            if (!renderer) {
                throw new errors_1.$ab('Missing renderer for templateId: ' + item.templateId);
            }
            renderer.renderElement(item.element, index, row.templateData, undefined);
            item.size = row.domNode.offsetHeight;
            renderer.disposeElement?.(item.element, index, row.templateData, undefined);
            this.Q.setDynamicHeight?.(item.element, item.size);
            item.lastDynamicHeightWidth = this.n;
            this.o.removeChild(row.domNode);
            this.h.release(row);
            return item.size - size;
        }
        vb(ranges) {
            const lastRange = ranges[ranges.length - 1];
            if (!lastRange) {
                return null;
            }
            const nextToLastItem = this.d[lastRange.end];
            if (!nextToLastItem) {
                return null;
            }
            if (!nextToLastItem.row) {
                return null;
            }
            return nextToLastItem.row.domNode;
        }
        getElementDomId(index) {
            return `${this.domId}_${index}`;
        }
        // Dispose
        dispose() {
            for (const item of this.d) {
                item.dragStartDisposable.dispose();
                item.checkedDisposable.dispose();
                if (item.row) {
                    const renderer = this.j.get(item.row.templateId);
                    if (renderer) {
                        renderer.disposeElement?.(item.element, -1, item.row.templateData, undefined);
                        renderer.disposeTemplate(item.row.templateData);
                    }
                }
            }
            this.d = [];
            if (this.domNode && this.domNode.parentNode) {
                this.domNode.parentNode.removeChild(this.domNode);
            }
            (0, lifecycle_1.$fc)(this.L);
        }
    }
    exports.$mQ = $mQ;
    __decorate([
        decorators_1.$6g
    ], $mQ.prototype, "onMouseClick", null);
    __decorate([
        decorators_1.$6g
    ], $mQ.prototype, "onMouseDblClick", null);
    __decorate([
        decorators_1.$6g
    ], $mQ.prototype, "onMouseMiddleClick", null);
    __decorate([
        decorators_1.$6g
    ], $mQ.prototype, "onMouseUp", null);
    __decorate([
        decorators_1.$6g
    ], $mQ.prototype, "onMouseDown", null);
    __decorate([
        decorators_1.$6g
    ], $mQ.prototype, "onMouseOver", null);
    __decorate([
        decorators_1.$6g
    ], $mQ.prototype, "onMouseMove", null);
    __decorate([
        decorators_1.$6g
    ], $mQ.prototype, "onMouseOut", null);
    __decorate([
        decorators_1.$6g
    ], $mQ.prototype, "onContextMenu", null);
    __decorate([
        decorators_1.$6g
    ], $mQ.prototype, "onTouchStart", null);
    __decorate([
        decorators_1.$6g
    ], $mQ.prototype, "onTap", null);
});
//# sourceMappingURL=listView.js.map