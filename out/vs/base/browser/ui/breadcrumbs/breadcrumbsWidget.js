/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/arrays", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/lifecycle", "vs/css!./breadcrumbsWidget"], function (require, exports, dom, scrollableElement_1, arrays_1, themables_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BreadcrumbsWidget = exports.BreadcrumbsItem = void 0;
    class BreadcrumbsItem {
        dispose() { }
    }
    exports.BreadcrumbsItem = BreadcrumbsItem;
    class BreadcrumbsWidget {
        constructor(container, horizontalScrollbarSize, separatorIcon, styles) {
            this._disposables = new lifecycle_1.DisposableStore();
            this._onDidSelectItem = new event_1.Emitter();
            this._onDidFocusItem = new event_1.Emitter();
            this._onDidChangeFocus = new event_1.Emitter();
            this.onDidSelectItem = this._onDidSelectItem.event;
            this.onDidFocusItem = this._onDidFocusItem.event;
            this.onDidChangeFocus = this._onDidChangeFocus.event;
            this._items = new Array();
            this._nodes = new Array();
            this._freeNodes = new Array();
            this._enabled = true;
            this._focusedItemIdx = -1;
            this._selectedItemIdx = -1;
            this._domNode = document.createElement('div');
            this._domNode.className = 'monaco-breadcrumbs';
            this._domNode.tabIndex = 0;
            this._domNode.setAttribute('role', 'list');
            this._scrollable = new scrollableElement_1.DomScrollableElement(this._domNode, {
                vertical: 2 /* ScrollbarVisibility.Hidden */,
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                horizontalScrollbarSize,
                useShadows: false,
                scrollYToX: true
            });
            this._separatorIcon = separatorIcon;
            this._disposables.add(this._scrollable);
            this._disposables.add(dom.addStandardDisposableListener(this._domNode, 'click', e => this._onClick(e)));
            container.appendChild(this._scrollable.getDomNode());
            const styleElement = dom.createStyleSheet(this._domNode);
            this._style(styleElement, styles);
            const focusTracker = dom.trackFocus(this._domNode);
            this._disposables.add(focusTracker);
            this._disposables.add(focusTracker.onDidBlur(_ => this._onDidChangeFocus.fire(false)));
            this._disposables.add(focusTracker.onDidFocus(_ => this._onDidChangeFocus.fire(true)));
        }
        setHorizontalScrollbarSize(size) {
            this._scrollable.updateOptions({
                horizontalScrollbarSize: size
            });
        }
        dispose() {
            this._disposables.dispose();
            this._pendingLayout?.dispose();
            this._onDidSelectItem.dispose();
            this._onDidFocusItem.dispose();
            this._onDidChangeFocus.dispose();
            this._domNode.remove();
            this._nodes.length = 0;
            this._freeNodes.length = 0;
        }
        layout(dim) {
            if (dim && dom.Dimension.equals(dim, this._dimension)) {
                return;
            }
            this._pendingLayout?.dispose();
            if (dim) {
                // only measure
                this._pendingLayout = this._updateDimensions(dim);
            }
            else {
                this._pendingLayout = this._updateScrollbar();
            }
        }
        _updateDimensions(dim) {
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(dom.modify(() => {
                this._dimension = dim;
                this._domNode.style.width = `${dim.width}px`;
                this._domNode.style.height = `${dim.height}px`;
                disposables.add(this._updateScrollbar());
            }));
            return disposables;
        }
        _updateScrollbar() {
            return dom.measure(() => {
                dom.measure(() => {
                    this._scrollable.setRevealOnScroll(false);
                    this._scrollable.scanDomNode();
                    this._scrollable.setRevealOnScroll(true);
                });
            });
        }
        _style(styleElement, style) {
            let content = '';
            if (style.breadcrumbsBackground) {
                content += `.monaco-breadcrumbs { background-color: ${style.breadcrumbsBackground}}`;
            }
            if (style.breadcrumbsForeground) {
                content += `.monaco-breadcrumbs .monaco-breadcrumb-item { color: ${style.breadcrumbsForeground}}\n`;
            }
            if (style.breadcrumbsFocusForeground) {
                content += `.monaco-breadcrumbs .monaco-breadcrumb-item.focused { color: ${style.breadcrumbsFocusForeground}}\n`;
            }
            if (style.breadcrumbsFocusAndSelectionForeground) {
                content += `.monaco-breadcrumbs .monaco-breadcrumb-item.focused.selected { color: ${style.breadcrumbsFocusAndSelectionForeground}}\n`;
            }
            if (style.breadcrumbsHoverForeground) {
                content += `.monaco-breadcrumbs:not(.disabled	) .monaco-breadcrumb-item:hover:not(.focused):not(.selected) { color: ${style.breadcrumbsHoverForeground}}\n`;
            }
            styleElement.innerText = content;
        }
        setEnabled(value) {
            this._enabled = value;
            this._domNode.classList.toggle('disabled', !this._enabled);
        }
        domFocus() {
            const idx = this._focusedItemIdx >= 0 ? this._focusedItemIdx : this._items.length - 1;
            if (idx >= 0 && idx < this._items.length) {
                this._focus(idx, undefined);
            }
            else {
                this._domNode.focus();
            }
        }
        isDOMFocused() {
            let candidate = document.activeElement;
            while (candidate) {
                if (this._domNode === candidate) {
                    return true;
                }
                candidate = candidate.parentElement;
            }
            return false;
        }
        getFocused() {
            return this._items[this._focusedItemIdx];
        }
        setFocused(item, payload) {
            this._focus(this._items.indexOf(item), payload);
        }
        focusPrev(payload) {
            if (this._focusedItemIdx > 0) {
                this._focus(this._focusedItemIdx - 1, payload);
            }
        }
        focusNext(payload) {
            if (this._focusedItemIdx + 1 < this._nodes.length) {
                this._focus(this._focusedItemIdx + 1, payload);
            }
        }
        _focus(nth, payload) {
            this._focusedItemIdx = -1;
            for (let i = 0; i < this._nodes.length; i++) {
                const node = this._nodes[i];
                if (i !== nth) {
                    node.classList.remove('focused');
                }
                else {
                    this._focusedItemIdx = i;
                    node.classList.add('focused');
                    node.focus();
                }
            }
            this._reveal(this._focusedItemIdx, true);
            this._onDidFocusItem.fire({ type: 'focus', item: this._items[this._focusedItemIdx], node: this._nodes[this._focusedItemIdx], payload });
        }
        reveal(item) {
            const idx = this._items.indexOf(item);
            if (idx >= 0) {
                this._reveal(idx, false);
            }
        }
        revealLast() {
            this._reveal(this._items.length - 1, false);
        }
        _reveal(nth, minimal) {
            if (nth < 0 || nth >= this._nodes.length) {
                return;
            }
            const node = this._nodes[nth];
            if (!node) {
                return;
            }
            const { width } = this._scrollable.getScrollDimensions();
            const { scrollLeft } = this._scrollable.getScrollPosition();
            if (!minimal || node.offsetLeft > scrollLeft + width || node.offsetLeft < scrollLeft) {
                this._scrollable.setRevealOnScroll(false);
                this._scrollable.setScrollPosition({ scrollLeft: node.offsetLeft });
                this._scrollable.setRevealOnScroll(true);
            }
        }
        getSelection() {
            return this._items[this._selectedItemIdx];
        }
        setSelection(item, payload) {
            this._select(this._items.indexOf(item), payload);
        }
        _select(nth, payload) {
            this._selectedItemIdx = -1;
            for (let i = 0; i < this._nodes.length; i++) {
                const node = this._nodes[i];
                if (i !== nth) {
                    node.classList.remove('selected');
                }
                else {
                    this._selectedItemIdx = i;
                    node.classList.add('selected');
                }
            }
            this._onDidSelectItem.fire({ type: 'select', item: this._items[this._selectedItemIdx], node: this._nodes[this._selectedItemIdx], payload });
        }
        getItems() {
            return this._items;
        }
        setItems(items) {
            let prefix;
            let removed = [];
            try {
                prefix = (0, arrays_1.commonPrefixLength)(this._items, items, (a, b) => a.equals(b));
                removed = this._items.splice(prefix, this._items.length - prefix, ...items.slice(prefix));
                this._render(prefix);
                (0, lifecycle_1.dispose)(removed);
                this._focus(-1, undefined);
            }
            catch (e) {
                const newError = new Error(`BreadcrumbsItem#setItems: newItems: ${items.length}, prefix: ${prefix}, removed: ${removed.length}`);
                newError.name = e.name;
                newError.stack = e.stack;
                throw newError;
            }
        }
        _render(start) {
            let didChange = false;
            for (; start < this._items.length && start < this._nodes.length; start++) {
                const item = this._items[start];
                const node = this._nodes[start];
                this._renderItem(item, node);
                didChange = true;
            }
            // case a: more nodes -> remove them
            while (start < this._nodes.length) {
                const free = this._nodes.pop();
                if (free) {
                    this._freeNodes.push(free);
                    free.remove();
                    didChange = true;
                }
            }
            // case b: more items -> render them
            for (; start < this._items.length; start++) {
                const item = this._items[start];
                const node = this._freeNodes.length > 0 ? this._freeNodes.pop() : document.createElement('div');
                if (node) {
                    this._renderItem(item, node);
                    this._domNode.appendChild(node);
                    this._nodes.push(node);
                    didChange = true;
                }
            }
            if (didChange) {
                this.layout(undefined);
            }
        }
        _renderItem(item, container) {
            dom.clearNode(container);
            container.className = '';
            try {
                item.render(container);
            }
            catch (err) {
                container.innerText = '<<RENDER ERROR>>';
                console.error(err);
            }
            container.tabIndex = -1;
            container.setAttribute('role', 'listitem');
            container.classList.add('monaco-breadcrumb-item');
            const iconContainer = dom.$(themables_1.ThemeIcon.asCSSSelector(this._separatorIcon));
            container.appendChild(iconContainer);
        }
        _onClick(event) {
            if (!this._enabled) {
                return;
            }
            for (let el = event.target; el; el = el.parentElement) {
                const idx = this._nodes.indexOf(el);
                if (idx >= 0) {
                    this._focus(idx, event);
                    this._select(idx, event);
                    break;
                }
            }
        }
    }
    exports.BreadcrumbsWidget = BreadcrumbsWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWRjcnVtYnNXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvYnJlYWRjcnVtYnMvYnJlYWRjcnVtYnNXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQXNCLGVBQWU7UUFDcEMsT0FBTyxLQUFXLENBQUM7S0FHbkI7SUFKRCwwQ0FJQztJQWlCRCxNQUFhLGlCQUFpQjtRQTBCN0IsWUFDQyxTQUFzQixFQUN0Qix1QkFBK0IsRUFDL0IsYUFBd0IsRUFDeEIsTUFBZ0M7WUE1QmhCLGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFJckMscUJBQWdCLEdBQUcsSUFBSSxlQUFPLEVBQXlCLENBQUM7WUFDeEQsb0JBQWUsR0FBRyxJQUFJLGVBQU8sRUFBeUIsQ0FBQztZQUN2RCxzQkFBaUIsR0FBRyxJQUFJLGVBQU8sRUFBVyxDQUFDO1lBRW5ELG9CQUFlLEdBQWlDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7WUFDNUUsbUJBQWMsR0FBaUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUM7WUFDMUUscUJBQWdCLEdBQW1CLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7WUFFeEQsV0FBTSxHQUFHLElBQUksS0FBSyxFQUFtQixDQUFDO1lBQ3RDLFdBQU0sR0FBRyxJQUFJLEtBQUssRUFBa0IsQ0FBQztZQUNyQyxlQUFVLEdBQUcsSUFBSSxLQUFLLEVBQWtCLENBQUM7WUFHbEQsYUFBUSxHQUFZLElBQUksQ0FBQztZQUN6QixvQkFBZSxHQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzdCLHFCQUFnQixHQUFXLENBQUMsQ0FBQyxDQUFDO1lBV3JDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxJQUFJ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