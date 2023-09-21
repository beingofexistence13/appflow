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
    exports.ListView = exports.NativeDragAndDropData = exports.ExternalElementsDragAndDropData = exports.ElementsDragAndDropData = void 0;
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
    class ElementsDragAndDropData {
        get context() {
            return this._context;
        }
        set context(value) {
            this._context = value;
        }
        constructor(elements) {
            this.elements = elements;
        }
        update() { }
        getData() {
            return this.elements;
        }
    }
    exports.ElementsDragAndDropData = ElementsDragAndDropData;
    class ExternalElementsDragAndDropData {
        constructor(elements) {
            this.elements = elements;
        }
        update() { }
        getData() {
            return this.elements;
        }
    }
    exports.ExternalElementsDragAndDropData = ExternalElementsDragAndDropData;
    class NativeDragAndDropData {
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
    exports.NativeDragAndDropData = NativeDragAndDropData;
    function equalsDragFeedback(f1, f2) {
        if (Array.isArray(f1) && Array.isArray(f2)) {
            return (0, arrays_1.equals)(f1, f2);
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
     * The {@link ListView} is a virtual scrolling engine.
     *
     * Given that it only renders elements within its viewport, it can hold large
     * collections of elements and stay very performant. The performance bottleneck
     * usually lies within the user's rendering code for each element.
     *
     * @remarks It is a low-level widget, not meant to be used directly. Refer to the
     * List widget instead.
     */
    class ListView {
        static { this.InstanceCount = 0; }
        get contentHeight() { return this.rangeMap.size; }
        get contentWidth() { return this.scrollWidth ?? 0; }
        get onDidScroll() { return this.scrollableElement.onScroll; }
        get onWillScroll() { return this.scrollableElement.onWillScroll; }
        get containerDomNode() { return this.rowsContainer; }
        get scrollableElementDomNode() { return this.scrollableElement.getDomNode(); }
        get horizontalScrolling() { return this._horizontalScrolling; }
        set horizontalScrolling(value) {
            if (value === this._horizontalScrolling) {
                return;
            }
            if (value && this.supportDynamicHeights) {
                throw new Error('Horizontal scrolling and dynamic heights not supported simultaneously');
            }
            this._horizontalScrolling = value;
            this.domNode.classList.toggle('horizontal-scrolling', this._horizontalScrolling);
            if (this._horizontalScrolling) {
                for (const item of this.items) {
                    this.measureItemWidth(item);
                }
                this.updateScrollWidth();
                this.scrollableElement.setScrollDimensions({ width: (0, dom_1.getContentWidth)(this.domNode) });
                this.rowsContainer.style.width = `${Math.max(this.scrollWidth || 0, this.renderWidth)}px`;
            }
            else {
                this.scrollableElementWidthDelayer.cancel();
                this.scrollableElement.setScrollDimensions({ width: this.renderWidth, scrollWidth: this.renderWidth });
                this.rowsContainer.style.width = '';
            }
        }
        constructor(container, virtualDelegate, renderers, options = DefaultOptions) {
            this.virtualDelegate = virtualDelegate;
            this.domId = `list_id_${++ListView.InstanceCount}`;
            this.renderers = new Map();
            this.renderWidth = 0;
            this._scrollHeight = 0;
            this.scrollableElementUpdateDisposable = null;
            this.scrollableElementWidthDelayer = new async_1.Delayer(50);
            this.splicing = false;
            this.dragOverAnimationStopDisposable = lifecycle_1.Disposable.None;
            this.dragOverMouseY = 0;
            this.canDrop = false;
            this.currentDragFeedbackDisposable = lifecycle_1.Disposable.None;
            this.onDragLeaveTimeout = lifecycle_1.Disposable.None;
            this.disposables = new lifecycle_1.DisposableStore();
            this._onDidChangeContentHeight = new event_2.Emitter();
            this._onDidChangeContentWidth = new event_2.Emitter();
            this.onDidChangeContentHeight = event_2.Event.latch(this._onDidChangeContentHeight.event, undefined, this.disposables);
            this.onDidChangeContentWidth = event_2.Event.latch(this._onDidChangeContentWidth.event, undefined, this.disposables);
            this._horizontalScrolling = false;
            if (options.horizontalScrolling && options.supportDynamicHeights) {
                throw new Error('Horizontal scrolling and dynamic heights not supported simultaneously');
            }
            this.items = [];
            this.itemId = 0;
            this.rangeMap = new rangeMap_1.RangeMap(options.paddingTop ?? 0);
            for (const renderer of renderers) {
                this.renderers.set(renderer.templateId, renderer);
            }
            this.cache = this.disposables.add(new rowCache_1.RowCache(this.renderers));
            this.lastRenderTop = 0;
            this.lastRenderHeight = 0;
            this.domNode = document.createElement('div');
            this.domNode.className = 'monaco-list';
            this.domNode.classList.add(this.domId);
            this.domNode.tabIndex = 0;
            this.domNode.classList.toggle('mouse-support', typeof options.mouseSupport === 'boolean' ? options.mouseSupport : true);
            this._horizontalScrolling = options.horizontalScrolling ?? DefaultOptions.horizontalScrolling;
            this.domNode.classList.toggle('horizontal-scrolling', this._horizontalScrolling);
            this.paddingBottom = typeof options.paddingBottom === 'undefined' ? 0 : options.paddingBottom;
            this.accessibilityProvider = new ListViewAccessibilityProvider(options.accessibilityProvider);
            this.rowsContainer = document.createElement('div');
            this.rowsContainer.className = 'monaco-list-rows';
            const transformOptimization = options.transformOptimization ?? DefaultOptions.transformOptimization;
            if (transformOptimization) {
                this.rowsContainer.style.transform = 'translate3d(0px, 0px, 0px)';
                this.rowsContainer.style.overflow = 'hidden';
                this.rowsContainer.style.contain = 'strict';
            }
            this.disposables.add(touch_1.Gesture.addTarget(this.rowsContainer));
            this.scrollable = this.disposables.add(new scrollable_1.Scrollable({
                forceIntegerValues: true,
                smoothScrollDuration: (options.smoothScrolling ?? false) ? 125 : 0,
                scheduleAtNextAnimationFrame: cb => (0, dom_1.scheduleAtNextAnimationFrame)(cb)
            }));
            this.scrollableElement = this.disposables.add(new scrollableElement_1.SmoothScrollableElement(this.rowsContainer, {
                alwaysConsumeMouseWheel: options.alwaysConsumeMouseWheel ?? DefaultOptions.alwaysConsumeMouseWheel,
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                vertical: options.verticalScrollMode ?? DefaultOptions.verticalScrollMode,
                useShadows: options.useShadows ?? DefaultOptions.useShadows,
                mouseWheelScrollSensitivity: options.mouseWheelScrollSensitivity,
                fastScrollSensitivity: options.fastScrollSensitivity,
                scrollByPage: options.scrollByPage
            }, this.scrollable));
            this.domNode.appendChild(this.scrollableElement.getDomNode());
            container.appendChild(this.domNode);
            this.scrollableElement.onScroll(this.onScroll, this, this.disposables);
            this.disposables.add((0, dom_1.addDisposableListener)(this.rowsContainer, touch_1.EventType.Change, e => this.onTouchChange(e)));
            // Prevent the monaco-scrollable-element from scrolling
            // https://github.com/microsoft/vscode/issues/44181
            this.disposables.add((0, dom_1.addDisposableListener)(this.scrollableElement.getDomNode(), 'scroll', e => e.target.scrollTop = 0));
            this.disposables.add((0, dom_1.addDisposableListener)(this.domNode, 'dragover', e => this.onDragOver(this.toDragEvent(e))));
            this.disposables.add((0, dom_1.addDisposableListener)(this.domNode, 'drop', e => this.onDrop(this.toDragEvent(e))));
            this.disposables.add((0, dom_1.addDisposableListener)(this.domNode, 'dragleave', e => this.onDragLeave(this.toDragEvent(e))));
            this.disposables.add((0, dom_1.addDisposableListener)(this.domNode, 'dragend', e => this.onDragEnd(e)));
            this.setRowLineHeight = options.setRowLineHeight ?? DefaultOptions.setRowLineHeight;
            this.setRowHeight = options.setRowHeight ?? DefaultOptions.setRowHeight;
            this.supportDynamicHeights = options.supportDynamicHeights ?? DefaultOptions.supportDynamicHeights;
            this.dnd = options.dnd ?? DefaultOptions.dnd;
            this.layout(options.initialSize?.height, options.initialSize?.width);
        }
        updateOptions(options) {
            if (options.paddingBottom !== undefined) {
                this.paddingBottom = options.paddingBottom;
                this.scrollableElement.setScrollDimensions({ scrollHeight: this.scrollHeight });
            }
            if (options.smoothScrolling !== undefined) {
                this.scrollable.setSmoothScrollDuration(options.smoothScrolling ? 125 : 0);
            }
            if (options.horizontalScrolling !== undefined) {
                this.horizontalScrolling = options.horizontalScrolling;
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
                this.scrollableElement.updateOptions(scrollableOptions);
            }
            if (options.paddingTop !== undefined && options.paddingTop !== this.rangeMap.paddingTop) {
                // trigger a rerender
                const lastRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
                const offset = options.paddingTop - this.rangeMap.paddingTop;
                this.rangeMap.paddingTop = options.paddingTop;
                this.render(lastRenderRange, Math.max(0, this.lastRenderTop + offset), this.lastRenderHeight, undefined, undefined, true);
                this.setScrollTop(this.lastRenderTop);
                this.eventuallyUpdateScrollDimensions();
                if (this.supportDynamicHeights) {
                    this._rerender(this.lastRenderTop, this.lastRenderHeight);
                }
            }
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            this.scrollableElement.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this.scrollableElement.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        updateElementHeight(index, size, anchorIndex) {
            if (index < 0 || index >= this.items.length) {
                return;
            }
            const originalSize = this.items[index].size;
            if (typeof size === 'undefined') {
                if (!this.supportDynamicHeights) {
                    console.warn('Dynamic heights not supported');
                    return;
                }
                this.items[index].lastDynamicHeightWidth = undefined;
                size = originalSize + this.probeDynamicHeight(index);
            }
            if (originalSize === size) {
                return;
            }
            const lastRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
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
            this.rangeMap.splice(index, 1, [{ size: size }]);
            this.items[index].size = size;
            this.render(lastRenderRange, Math.max(0, this.lastRenderTop + heightDiff), this.lastRenderHeight, undefined, undefined, true);
            this.setScrollTop(this.lastRenderTop);
            this.eventuallyUpdateScrollDimensions();
            if (this.supportDynamicHeights) {
                this._rerender(this.lastRenderTop, this.lastRenderHeight);
            }
        }
        splice(start, deleteCount, elements = []) {
            if (this.splicing) {
                throw new Error('Can\'t run recursive splices.');
            }
            this.splicing = true;
            try {
                return this._splice(start, deleteCount, elements);
            }
            finally {
                this.splicing = false;
                this._onDidChangeContentHeight.fire(this.contentHeight);
            }
        }
        _splice(start, deleteCount, elements = []) {
            const previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
            const deleteRange = { start, end: start + deleteCount };
            const removeRange = range_1.Range.intersect(previousRenderRange, deleteRange);
            // try to reuse rows, avoid removing them from DOM
            const rowsToDispose = new Map();
            for (let i = removeRange.end - 1; i >= removeRange.start; i--) {
                const item = this.items[i];
                item.dragStartDisposable.dispose();
                item.checkedDisposable.dispose();
                if (item.row) {
                    let rows = rowsToDispose.get(item.templateId);
                    if (!rows) {
                        rows = [];
                        rowsToDispose.set(item.templateId, rows);
                    }
                    const renderer = this.renderers.get(item.templateId);
                    if (renderer && renderer.disposeElement) {
                        renderer.disposeElement(item.element, i, item.row.templateData, item.size);
                    }
                    rows.push(item.row);
                }
                item.row = null;
            }
            const previousRestRange = { start: start + deleteCount, end: this.items.length };
            const previousRenderedRestRange = range_1.Range.intersect(previousRestRange, previousRenderRange);
            const previousUnrenderedRestRanges = range_1.Range.relativeComplement(previousRestRange, previousRenderRange);
            const inserted = elements.map(element => ({
                id: String(this.itemId++),
                element,
                templateId: this.virtualDelegate.getTemplateId(element),
                size: this.virtualDelegate.getHeight(element),
                width: undefined,
                hasDynamicHeight: !!this.virtualDelegate.hasDynamicHeight && this.virtualDelegate.hasDynamicHeight(element),
                lastDynamicHeightWidth: undefined,
                row: null,
                uri: undefined,
                dropTarget: false,
                dragStartDisposable: lifecycle_1.Disposable.None,
                checkedDisposable: lifecycle_1.Disposable.None
            }));
            let deleted;
            // TODO@joao: improve this optimization to catch even more cases
            if (start === 0 && deleteCount >= this.items.length) {
                this.rangeMap = new rangeMap_1.RangeMap(this.rangeMap.paddingTop);
                this.rangeMap.splice(0, 0, inserted);
                deleted = this.items;
                this.items = inserted;
            }
            else {
                this.rangeMap.splice(start, deleteCount, inserted);
                deleted = this.items.splice(start, deleteCount, ...inserted);
            }
            const delta = elements.length - deleteCount;
            const renderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
            const renderedRestRange = (0, rangeMap_1.shift)(previousRenderedRestRange, delta);
            const updateRange = range_1.Range.intersect(renderRange, renderedRestRange);
            for (let i = updateRange.start; i < updateRange.end; i++) {
                this.updateItemInDOM(this.items[i], i);
            }
            const removeRanges = range_1.Range.relativeComplement(renderedRestRange, renderRange);
            for (const range of removeRanges) {
                for (let i = range.start; i < range.end; i++) {
                    this.removeItemFromDOM(i);
                }
            }
            const unrenderedRestRanges = previousUnrenderedRestRanges.map(r => (0, rangeMap_1.shift)(r, delta));
            const elementsRange = { start, end: start + elements.length };
            const insertRanges = [elementsRange, ...unrenderedRestRanges].map(r => range_1.Range.intersect(renderRange, r));
            const beforeElement = this.getNextToLastElement(insertRanges);
            for (const range of insertRanges) {
                for (let i = range.start; i < range.end; i++) {
                    const item = this.items[i];
                    const rows = rowsToDispose.get(item.templateId);
                    const row = rows?.pop();
                    this.insertItemInDOM(i, beforeElement, row);
                }
            }
            for (const rows of rowsToDispose.values()) {
                for (const row of rows) {
                    this.cache.release(row);
                }
            }
            this.eventuallyUpdateScrollDimensions();
            if (this.supportDynamicHeights) {
                this._rerender(this.scrollTop, this.renderHeight);
            }
            return deleted.map(i => i.element);
        }
        eventuallyUpdateScrollDimensions() {
            this._scrollHeight = this.contentHeight;
            this.rowsContainer.style.height = `${this._scrollHeight}px`;
            if (!this.scrollableElementUpdateDisposable) {
                this.scrollableElementUpdateDisposable = (0, dom_1.scheduleAtNextAnimationFrame)(() => {
                    this.scrollableElement.setScrollDimensions({ scrollHeight: this.scrollHeight });
                    this.updateScrollWidth();
                    this.scrollableElementUpdateDisposable = null;
                });
            }
        }
        eventuallyUpdateScrollWidth() {
            if (!this.horizontalScrolling) {
                this.scrollableElementWidthDelayer.cancel();
                return;
            }
            this.scrollableElementWidthDelayer.trigger(() => this.updateScrollWidth());
        }
        updateScrollWidth() {
            if (!this.horizontalScrolling) {
                return;
            }
            let scrollWidth = 0;
            for (const item of this.items) {
                if (typeof item.width !== 'undefined') {
                    scrollWidth = Math.max(scrollWidth, item.width);
                }
            }
            this.scrollWidth = scrollWidth;
            this.scrollableElement.setScrollDimensions({ scrollWidth: scrollWidth === 0 ? 0 : (scrollWidth + 10) });
            this._onDidChangeContentWidth.fire(this.scrollWidth);
        }
        updateWidth(index) {
            if (!this.horizontalScrolling || typeof this.scrollWidth === 'undefined') {
                return;
            }
            const item = this.items[index];
            this.measureItemWidth(item);
            if (typeof item.width !== 'undefined' && item.width > this.scrollWidth) {
                this.scrollWidth = item.width;
                this.scrollableElement.setScrollDimensions({ scrollWidth: this.scrollWidth + 10 });
                this._onDidChangeContentWidth.fire(this.scrollWidth);
            }
        }
        rerender() {
            if (!this.supportDynamicHeights) {
                return;
            }
            for (const item of this.items) {
                item.lastDynamicHeightWidth = undefined;
            }
            this._rerender(this.lastRenderTop, this.lastRenderHeight);
        }
        get length() {
            return this.items.length;
        }
        get renderHeight() {
            const scrollDimensions = this.scrollableElement.getScrollDimensions();
            return scrollDimensions.height;
        }
        get firstVisibleIndex() {
            const range = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
            const firstElTop = this.rangeMap.positionAt(range.start);
            const nextElTop = this.rangeMap.positionAt(range.start + 1);
            if (nextElTop !== -1) {
                const firstElMidpoint = (nextElTop - firstElTop) / 2 + firstElTop;
                if (firstElMidpoint < this.scrollTop) {
                    return range.start + 1;
                }
            }
            return range.start;
        }
        get lastVisibleIndex() {
            const range = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
            return range.end - 1;
        }
        element(index) {
            return this.items[index].element;
        }
        indexOf(element) {
            return this.items.findIndex(item => item.element === element);
        }
        domElement(index) {
            const row = this.items[index].row;
            return row && row.domNode;
        }
        elementHeight(index) {
            return this.items[index].size;
        }
        elementTop(index) {
            return this.rangeMap.positionAt(index);
        }
        indexAt(position) {
            return this.rangeMap.indexAt(position);
        }
        indexAfter(position) {
            return this.rangeMap.indexAfter(position);
        }
        layout(height, width) {
            const scrollDimensions = {
                height: typeof height === 'number' ? height : (0, dom_1.getContentHeight)(this.domNode)
            };
            if (this.scrollableElementUpdateDisposable) {
                this.scrollableElementUpdateDisposable.dispose();
                this.scrollableElementUpdateDisposable = null;
                scrollDimensions.scrollHeight = this.scrollHeight;
            }
            this.scrollableElement.setScrollDimensions(scrollDimensions);
            if (typeof width !== 'undefined') {
                this.renderWidth = width;
                if (this.supportDynamicHeights) {
                    this._rerender(this.scrollTop, this.renderHeight);
                }
            }
            if (this.horizontalScrolling) {
                this.scrollableElement.setScrollDimensions({
                    width: typeof width === 'number' ? width : (0, dom_1.getContentWidth)(this.domNode)
                });
            }
        }
        // Render
        render(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM = false) {
            const renderRange = this.getRenderRange(renderTop, renderHeight);
            const rangesToInsert = range_1.Range.relativeComplement(renderRange, previousRenderRange);
            const rangesToRemove = range_1.Range.relativeComplement(previousRenderRange, renderRange);
            const beforeElement = this.getNextToLastElement(rangesToInsert);
            if (updateItemsInDOM) {
                const rangesToUpdate = range_1.Range.intersect(previousRenderRange, renderRange);
                for (let i = rangesToUpdate.start; i < rangesToUpdate.end; i++) {
                    this.updateItemInDOM(this.items[i], i);
                }
            }
            this.cache.transact(() => {
                for (const range of rangesToRemove) {
                    for (let i = range.start; i < range.end; i++) {
                        this.removeItemFromDOM(i);
                    }
                }
                for (const range of rangesToInsert) {
                    for (let i = range.start; i < range.end; i++) {
                        this.insertItemInDOM(i, beforeElement);
                    }
                }
            });
            if (renderLeft !== undefined) {
                this.rowsContainer.style.left = `-${renderLeft}px`;
            }
            this.rowsContainer.style.top = `-${renderTop}px`;
            if (this.horizontalScrolling && scrollWidth !== undefined) {
                this.rowsContainer.style.width = `${Math.max(scrollWidth, this.renderWidth)}px`;
            }
            this.lastRenderTop = renderTop;
            this.lastRenderHeight = renderHeight;
        }
        // DOM operations
        insertItemInDOM(index, beforeElement, row) {
            const item = this.items[index];
            let isStale = false;
            if (!item.row) {
                if (row) {
                    item.row = row;
                }
                else {
                    const result = this.cache.alloc(item.templateId);
                    item.row = result.row;
                    isStale = result.isReusingConnectedDomNode;
                }
            }
            const role = this.accessibilityProvider.getRole(item.element) || 'listitem';
            item.row.domNode.setAttribute('role', role);
            const checked = this.accessibilityProvider.isChecked(item.element);
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
                    this.rowsContainer.insertBefore(item.row.domNode, beforeElement);
                }
                else {
                    this.rowsContainer.appendChild(item.row.domNode);
                }
            }
            this.updateItemInDOM(item, index);
            const renderer = this.renderers.get(item.templateId);
            if (!renderer) {
                throw new Error(`No renderer found for template id ${item.templateId}`);
            }
            renderer?.renderElement(item.element, index, item.row.templateData, item.size);
            const uri = this.dnd.getDragURI(item.element);
            item.dragStartDisposable.dispose();
            item.row.domNode.draggable = !!uri;
            if (uri) {
                item.dragStartDisposable = (0, dom_1.addDisposableListener)(item.row.domNode, 'dragstart', event => this.onDragStart(item.element, uri, event));
            }
            if (this.horizontalScrolling) {
                this.measureItemWidth(item);
                this.eventuallyUpdateScrollWidth();
            }
        }
        measureItemWidth(item) {
            if (!item.row || !item.row.domNode) {
                return;
            }
            item.row.domNode.style.width = 'fit-content';
            item.width = (0, dom_1.getContentWidth)(item.row.domNode);
            const style = window.getComputedStyle(item.row.domNode);
            if (style.paddingLeft) {
                item.width += parseFloat(style.paddingLeft);
            }
            if (style.paddingRight) {
                item.width += parseFloat(style.paddingRight);
            }
            item.row.domNode.style.width = '';
        }
        updateItemInDOM(item, index) {
            item.row.domNode.style.top = `${this.elementTop(index)}px`;
            if (this.setRowHeight) {
                item.row.domNode.style.height = `${item.size}px`;
            }
            if (this.setRowLineHeight) {
                item.row.domNode.style.lineHeight = `${item.size}px`;
            }
            item.row.domNode.setAttribute('data-index', `${index}`);
            item.row.domNode.setAttribute('data-last-element', index === this.length - 1 ? 'true' : 'false');
            item.row.domNode.setAttribute('data-parity', index % 2 === 0 ? 'even' : 'odd');
            item.row.domNode.setAttribute('aria-setsize', String(this.accessibilityProvider.getSetSize(item.element, index, this.length)));
            item.row.domNode.setAttribute('aria-posinset', String(this.accessibilityProvider.getPosInSet(item.element, index)));
            item.row.domNode.setAttribute('id', this.getElementDomId(index));
            item.row.domNode.classList.toggle('drop-target', item.dropTarget);
        }
        removeItemFromDOM(index) {
            const item = this.items[index];
            item.dragStartDisposable.dispose();
            item.checkedDisposable.dispose();
            if (item.row) {
                const renderer = this.renderers.get(item.templateId);
                if (renderer && renderer.disposeElement) {
                    renderer.disposeElement(item.element, index, item.row.templateData, item.size);
                }
                this.cache.release(item.row);
                item.row = null;
            }
            if (this.horizontalScrolling) {
                this.eventuallyUpdateScrollWidth();
            }
        }
        getScrollTop() {
            const scrollPosition = this.scrollableElement.getScrollPosition();
            return scrollPosition.scrollTop;
        }
        setScrollTop(scrollTop, reuseAnimation) {
            if (this.scrollableElementUpdateDisposable) {
                this.scrollableElementUpdateDisposable.dispose();
                this.scrollableElementUpdateDisposable = null;
                this.scrollableElement.setScrollDimensions({ scrollHeight: this.scrollHeight });
            }
            this.scrollableElement.setScrollPosition({ scrollTop, reuseAnimation });
        }
        getScrollLeft() {
            const scrollPosition = this.scrollableElement.getScrollPosition();
            return scrollPosition.scrollLeft;
        }
        setScrollLeft(scrollLeft) {
            if (this.scrollableElementUpdateDisposable) {
                this.scrollableElementUpdateDisposable.dispose();
                this.scrollableElementUpdateDisposable = null;
                this.scrollableElement.setScrollDimensions({ scrollWidth: this.scrollWidth });
            }
            this.scrollableElement.setScrollPosition({ scrollLeft });
        }
        get scrollTop() {
            return this.getScrollTop();
        }
        set scrollTop(scrollTop) {
            this.setScrollTop(scrollTop);
        }
        get scrollHeight() {
            return this._scrollHeight + (this.horizontalScrolling ? 10 : 0) + this.paddingBottom;
        }
        // Events
        get onMouseClick() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'click')).event, e => this.toMouseEvent(e), this.disposables); }
        get onMouseDblClick() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'dblclick')).event, e => this.toMouseEvent(e), this.disposables); }
        get onMouseMiddleClick() { return event_2.Event.filter(event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'auxclick')).event, e => this.toMouseEvent(e), this.disposables), e => e.browserEvent.button === 1, this.disposables); }
        get onMouseUp() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'mouseup')).event, e => this.toMouseEvent(e), this.disposables); }
        get onMouseDown() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'mousedown')).event, e => this.toMouseEvent(e), this.disposables); }
        get onMouseOver() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'mouseover')).event, e => this.toMouseEvent(e), this.disposables); }
        get onMouseMove() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'mousemove')).event, e => this.toMouseEvent(e), this.disposables); }
        get onMouseOut() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'mouseout')).event, e => this.toMouseEvent(e), this.disposables); }
        get onContextMenu() { return event_2.Event.any(event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'contextmenu')).event, e => this.toMouseEvent(e), this.disposables), event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, touch_1.EventType.Contextmenu)).event, e => this.toGestureEvent(e), this.disposables)); }
        get onTouchStart() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'touchstart')).event, e => this.toTouchEvent(e), this.disposables); }
        get onTap() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.rowsContainer, touch_1.EventType.Tap)).event, e => this.toGestureEvent(e), this.disposables); }
        toMouseEvent(browserEvent) {
            const index = this.getItemIndexFromEventTarget(browserEvent.target || null);
            const item = typeof index === 'undefined' ? undefined : this.items[index];
            const element = item && item.element;
            return { browserEvent, index, element };
        }
        toTouchEvent(browserEvent) {
            const index = this.getItemIndexFromEventTarget(browserEvent.target || null);
            const item = typeof index === 'undefined' ? undefined : this.items[index];
            const element = item && item.element;
            return { browserEvent, index, element };
        }
        toGestureEvent(browserEvent) {
            const index = this.getItemIndexFromEventTarget(browserEvent.initialTarget || null);
            const item = typeof index === 'undefined' ? undefined : this.items[index];
            const element = item && item.element;
            return { browserEvent, index, element };
        }
        toDragEvent(browserEvent) {
            const index = this.getItemIndexFromEventTarget(browserEvent.target || null);
            const item = typeof index === 'undefined' ? undefined : this.items[index];
            const element = item && item.element;
            return { browserEvent, index, element };
        }
        onScroll(e) {
            try {
                const previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
                this.render(previousRenderRange, e.scrollTop, e.height, e.scrollLeft, e.scrollWidth);
                if (this.supportDynamicHeights) {
                    this._rerender(e.scrollTop, e.height, e.inSmoothScrolling);
                }
            }
            catch (err) {
                console.error('Got bad scroll event:', e);
                throw err;
            }
        }
        onTouchChange(event) {
            event.preventDefault();
            event.stopPropagation();
            this.scrollTop -= event.translationY;
        }
        // DND
        onDragStart(element, uri, event) {
            if (!event.dataTransfer) {
                return;
            }
            const elements = this.dnd.getDragElements(element);
            event.dataTransfer.effectAllowed = 'copyMove';
            event.dataTransfer.setData(dnd_1.DataTransfers.TEXT, uri);
            if (event.dataTransfer.setDragImage) {
                let label;
                if (this.dnd.getDragLabel) {
                    label = this.dnd.getDragLabel(elements, event);
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
            this.currentDragData = new ElementsDragAndDropData(elements);
            StaticDND.CurrentDragAndDropData = new ExternalElementsDragAndDropData(elements);
            this.dnd.onDragStart?.(this.currentDragData, event);
        }
        onDragOver(event) {
            event.browserEvent.preventDefault(); // needed so that the drop event fires (https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome)
            this.onDragLeaveTimeout.dispose();
            if (StaticDND.CurrentDragAndDropData && StaticDND.CurrentDragAndDropData.getData() === 'vscode-ui') {
                return false;
            }
            this.setupDragAndDropScrollTopAnimation(event.browserEvent);
            if (!event.browserEvent.dataTransfer) {
                return false;
            }
            // Drag over from outside
            if (!this.currentDragData) {
                if (StaticDND.CurrentDragAndDropData) {
                    // Drag over from another list
                    this.currentDragData = StaticDND.CurrentDragAndDropData;
                }
                else {
                    // Drag over from the desktop
                    if (!event.browserEvent.dataTransfer.types) {
                        return false;
                    }
                    this.currentDragData = new NativeDragAndDropData();
                }
            }
            const result = this.dnd.onDragOver(this.currentDragData, event.element, event.index, event.browserEvent);
            this.canDrop = typeof result === 'boolean' ? result : result.accept;
            if (!this.canDrop) {
                this.currentDragFeedback = undefined;
                this.currentDragFeedbackDisposable.dispose();
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
            feedback = (0, arrays_1.distinct)(feedback).filter(i => i >= -1 && i < this.length).sort((a, b) => a - b);
            feedback = feedback[0] === -1 ? [-1] : feedback;
            if (equalsDragFeedback(this.currentDragFeedback, feedback)) {
                return true;
            }
            this.currentDragFeedback = feedback;
            this.currentDragFeedbackDisposable.dispose();
            if (feedback[0] === -1) { // entire list feedback
                this.domNode.classList.add('drop-target');
                this.rowsContainer.classList.add('drop-target');
                this.currentDragFeedbackDisposable = (0, lifecycle_1.toDisposable)(() => {
                    this.domNode.classList.remove('drop-target');
                    this.rowsContainer.classList.remove('drop-target');
                });
            }
            else {
                for (const index of feedback) {
                    const item = this.items[index];
                    item.dropTarget = true;
                    item.row?.domNode.classList.add('drop-target');
                }
                this.currentDragFeedbackDisposable = (0, lifecycle_1.toDisposable)(() => {
                    for (const index of feedback) {
                        const item = this.items[index];
                        item.dropTarget = false;
                        item.row?.domNode.classList.remove('drop-target');
                    }
                });
            }
            return true;
        }
        onDragLeave(event) {
            this.onDragLeaveTimeout.dispose();
            this.onDragLeaveTimeout = (0, async_1.disposableTimeout)(() => this.clearDragOverFeedback(), 100);
            if (this.currentDragData) {
                this.dnd.onDragLeave?.(this.currentDragData, event.element, event.index, event.browserEvent);
            }
        }
        onDrop(event) {
            if (!this.canDrop) {
                return;
            }
            const dragData = this.currentDragData;
            this.teardownDragAndDropScrollTopAnimation();
            this.clearDragOverFeedback();
            this.domNode.classList.remove('dragging');
            this.currentDragData = undefined;
            StaticDND.CurrentDragAndDropData = undefined;
            if (!dragData || !event.browserEvent.dataTransfer) {
                return;
            }
            event.browserEvent.preventDefault();
            dragData.update(event.browserEvent.dataTransfer);
            this.dnd.drop(dragData, event.element, event.index, event.browserEvent);
        }
        onDragEnd(event) {
            this.canDrop = false;
            this.teardownDragAndDropScrollTopAnimation();
            this.clearDragOverFeedback();
            this.domNode.classList.remove('dragging');
            this.currentDragData = undefined;
            StaticDND.CurrentDragAndDropData = undefined;
            this.dnd.onDragEnd?.(event);
        }
        clearDragOverFeedback() {
            this.currentDragFeedback = undefined;
            this.currentDragFeedbackDisposable.dispose();
            this.currentDragFeedbackDisposable = lifecycle_1.Disposable.None;
        }
        // DND scroll top animation
        setupDragAndDropScrollTopAnimation(event) {
            if (!this.dragOverAnimationDisposable) {
                const viewTop = (0, dom_1.getTopLeftOffset)(this.domNode).top;
                this.dragOverAnimationDisposable = (0, dom_1.animate)(this.animateDragAndDropScrollTop.bind(this, viewTop));
            }
            this.dragOverAnimationStopDisposable.dispose();
            this.dragOverAnimationStopDisposable = (0, async_1.disposableTimeout)(() => {
                if (this.dragOverAnimationDisposable) {
                    this.dragOverAnimationDisposable.dispose();
                    this.dragOverAnimationDisposable = undefined;
                }
            }, 1000);
            this.dragOverMouseY = event.pageY;
        }
        animateDragAndDropScrollTop(viewTop) {
            if (this.dragOverMouseY === undefined) {
                return;
            }
            const diff = this.dragOverMouseY - viewTop;
            const upperLimit = this.renderHeight - 35;
            if (diff < 35) {
                this.scrollTop += Math.max(-14, Math.floor(0.3 * (diff - 35)));
            }
            else if (diff > upperLimit) {
                this.scrollTop += Math.min(14, Math.floor(0.3 * (diff - upperLimit)));
            }
        }
        teardownDragAndDropScrollTopAnimation() {
            this.dragOverAnimationStopDisposable.dispose();
            if (this.dragOverAnimationDisposable) {
                this.dragOverAnimationDisposable.dispose();
                this.dragOverAnimationDisposable = undefined;
            }
        }
        // Util
        getItemIndexFromEventTarget(target) {
            const scrollableElement = this.scrollableElement.getDomNode();
            let element = target;
            while (element instanceof HTMLElement && element !== this.rowsContainer && scrollableElement.contains(element)) {
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
        getRenderRange(renderTop, renderHeight) {
            return {
                start: this.rangeMap.indexAt(renderTop),
                end: this.rangeMap.indexAfter(renderTop + renderHeight - 1)
            };
        }
        /**
         * Given a stable rendered state, checks every rendered element whether it needs
         * to be probed for dynamic height. Adjusts scroll height and top if necessary.
         */
        _rerender(renderTop, renderHeight, inSmoothScrolling) {
            const previousRenderRange = this.getRenderRange(renderTop, renderHeight);
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
                const renderRange = this.getRenderRange(renderTop, renderHeight);
                let didChange = false;
                for (let i = renderRange.start; i < renderRange.end; i++) {
                    const diff = this.probeDynamicHeight(i);
                    if (diff !== 0) {
                        this.rangeMap.splice(i, 1, [this.items[i]]);
                    }
                    heightDiff += diff;
                    didChange = didChange || diff !== 0;
                }
                if (!didChange) {
                    if (heightDiff !== 0) {
                        this.eventuallyUpdateScrollDimensions();
                    }
                    const unrenderRanges = range_1.Range.relativeComplement(previousRenderRange, renderRange);
                    for (const range of unrenderRanges) {
                        for (let i = range.start; i < range.end; i++) {
                            if (this.items[i].row) {
                                this.removeItemFromDOM(i);
                            }
                        }
                    }
                    const renderRanges = range_1.Range.relativeComplement(renderRange, previousRenderRange);
                    for (const range of renderRanges) {
                        for (let i = range.start; i < range.end; i++) {
                            const afterIndex = i + 1;
                            const beforeRow = afterIndex < this.items.length ? this.items[afterIndex].row : null;
                            const beforeElement = beforeRow ? beforeRow.domNode : null;
                            this.insertItemInDOM(i, beforeElement);
                        }
                    }
                    for (let i = renderRange.start; i < renderRange.end; i++) {
                        if (this.items[i].row) {
                            this.updateItemInDOM(this.items[i], i);
                        }
                    }
                    if (typeof anchorElementIndex === 'number') {
                        // To compute a destination scroll top, we need to take into account the current smooth scrolling
                        // animation, and then reuse it with a new target (to avoid prolonging the scroll)
                        // See https://github.com/microsoft/vscode/issues/104144
                        // See https://github.com/microsoft/vscode/pull/104284
                        // See https://github.com/microsoft/vscode/issues/107704
                        const deltaScrollTop = this.scrollable.getFutureScrollPosition().scrollTop - renderTop;
                        const newScrollTop = this.elementTop(anchorElementIndex) - anchorElementTopDelta + deltaScrollTop;
                        this.setScrollTop(newScrollTop, inSmoothScrolling);
                    }
                    this._onDidChangeContentHeight.fire(this.contentHeight);
                    return;
                }
            }
        }
        probeDynamicHeight(index) {
            const item = this.items[index];
            if (!!this.virtualDelegate.getDynamicHeight) {
                const newSize = this.virtualDelegate.getDynamicHeight(item.element);
                if (newSize !== null) {
                    const size = item.size;
                    item.size = newSize;
                    item.lastDynamicHeightWidth = this.renderWidth;
                    return newSize - size;
                }
            }
            if (!item.hasDynamicHeight || item.lastDynamicHeightWidth === this.renderWidth) {
                return 0;
            }
            if (!!this.virtualDelegate.hasDynamicHeight && !this.virtualDelegate.hasDynamicHeight(item.element)) {
                return 0;
            }
            const size = item.size;
            if (item.row) {
                item.row.domNode.style.height = '';
                item.size = item.row.domNode.offsetHeight;
                item.lastDynamicHeightWidth = this.renderWidth;
                return item.size - size;
            }
            const { row } = this.cache.alloc(item.templateId);
            row.domNode.style.height = '';
            this.rowsContainer.appendChild(row.domNode);
            const renderer = this.renderers.get(item.templateId);
            if (!renderer) {
                throw new errors_1.BugIndicatingError('Missing renderer for templateId: ' + item.templateId);
            }
            renderer.renderElement(item.element, index, row.templateData, undefined);
            item.size = row.domNode.offsetHeight;
            renderer.disposeElement?.(item.element, index, row.templateData, undefined);
            this.virtualDelegate.setDynamicHeight?.(item.element, item.size);
            item.lastDynamicHeightWidth = this.renderWidth;
            this.rowsContainer.removeChild(row.domNode);
            this.cache.release(row);
            return item.size - size;
        }
        getNextToLastElement(ranges) {
            const lastRange = ranges[ranges.length - 1];
            if (!lastRange) {
                return null;
            }
            const nextToLastItem = this.items[lastRange.end];
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
            for (const item of this.items) {
                item.dragStartDisposable.dispose();
                item.checkedDisposable.dispose();
                if (item.row) {
                    const renderer = this.renderers.get(item.row.templateId);
                    if (renderer) {
                        renderer.disposeElement?.(item.element, -1, item.row.templateData, undefined);
                        renderer.disposeTemplate(item.row.templateData);
                    }
                }
            }
            this.items = [];
            if (this.domNode && this.domNode.parentNode) {
                this.domNode.parentNode.removeChild(this.domNode);
            }
            (0, lifecycle_1.dispose)(this.disposables);
        }
    }
    exports.ListView = ListView;
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseClick", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseDblClick", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseMiddleClick", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseUp", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseDown", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseOver", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseMove", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseOut", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onContextMenu", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onTouchStart", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onTap", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdFZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvbGlzdC9saXN0Vmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7SUF1Q2hHLE1BQU0sU0FBUyxHQUFHO1FBQ2pCLHNCQUFzQixFQUFFLFNBQXlDO0tBQ2pFLENBQUM7SUFxQ0YsTUFBTSxjQUFjLEdBQUc7UUFDdEIsVUFBVSxFQUFFLElBQUk7UUFDaEIsa0JBQWtCLGtDQUEwQjtRQUM1QyxnQkFBZ0IsRUFBRSxJQUFJO1FBQ3RCLFlBQVksRUFBRSxJQUFJO1FBQ2xCLHFCQUFxQixFQUFFLEtBQUs7UUFDNUIsR0FBRyxFQUFFO1lBQ0osZUFBZSxDQUFJLENBQUksSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLFVBQVUsS0FBSyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDN0IsV0FBVyxLQUFXLENBQUM7WUFDdkIsVUFBVSxLQUFLLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLEtBQUssQ0FBQztTQUNWO1FBQ0QsbUJBQW1CLEVBQUUsS0FBSztRQUMxQixxQkFBcUIsRUFBRSxJQUFJO1FBQzNCLHVCQUF1QixFQUFFLElBQUk7S0FDN0IsQ0FBQztJQUVGLE1BQWEsdUJBQXVCO1FBS25DLElBQVcsT0FBTztZQUNqQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUNELElBQVcsT0FBTyxDQUFDLEtBQTJCO1lBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxZQUFZLFFBQWE7WUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDMUIsQ0FBQztRQUVELE1BQU0sS0FBVyxDQUFDO1FBRWxCLE9BQU87WUFDTixPQUFPLElB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