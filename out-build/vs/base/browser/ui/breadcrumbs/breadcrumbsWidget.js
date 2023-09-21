/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/arrays", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/lifecycle", "vs/css!./breadcrumbsWidget"], function (require, exports, dom, scrollableElement_1, arrays_1, themables_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5Q = exports.$4Q = void 0;
    class $4Q {
        dispose() { }
    }
    exports.$4Q = $4Q;
    class $5Q {
        constructor(container, horizontalScrollbarSize, separatorIcon, styles) {
            this.c = new lifecycle_1.$jc();
            this.g = new event_1.$fd();
            this.h = new event_1.$fd();
            this.j = new event_1.$fd();
            this.onDidSelectItem = this.g.event;
            this.onDidFocusItem = this.h.event;
            this.onDidChangeFocus = this.j.event;
            this.k = new Array();
            this.l = new Array();
            this.m = new Array();
            this.o = true;
            this.p = -1;
            this.q = -1;
            this.d = document.createElement('div');
            this.d.className = 'monaco-breadcrumbs';
            this.d.tabIndex = 0;
            this.d.setAttribute('role', 'list');
            this.f = new scrollableElement_1.$UP(this.d, {
                vertical: 2 /* ScrollbarVisibility.Hidden */,
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                horizontalScrollbarSize,
                useShadows: false,
                scrollYToX: true
            });
            this.n = separatorIcon;
            this.c.add(this.f);
            this.c.add(dom.$oO(this.d, 'click', e => this.B(e)));
            container.appendChild(this.f.getDomNode());
            const styleElement = dom.$XO(this.d);
            this.v(styleElement, styles);
            const focusTracker = dom.$8O(this.d);
            this.c.add(focusTracker);
            this.c.add(focusTracker.onDidBlur(_ => this.j.fire(false)));
            this.c.add(focusTracker.onDidFocus(_ => this.j.fire(true)));
        }
        setHorizontalScrollbarSize(size) {
            this.f.updateOptions({
                horizontalScrollbarSize: size
            });
        }
        dispose() {
            this.c.dispose();
            this.r?.dispose();
            this.g.dispose();
            this.h.dispose();
            this.j.dispose();
            this.d.remove();
            this.l.length = 0;
            this.m.length = 0;
        }
        layout(dim) {
            if (dim && dom.$BO.equals(dim, this.s)) {
                return;
            }
            this.r?.dispose();
            if (dim) {
                // only measure
                this.r = this.t(dim);
            }
            else {
                this.r = this.u();
            }
        }
        t(dim) {
            const disposables = new lifecycle_1.$jc();
            disposables.add(dom.$xO(() => {
                this.s = dim;
                this.d.style.width = `${dim.width}px`;
                this.d.style.height = `${dim.height}px`;
                disposables.add(this.u());
            }));
            return disposables;
        }
        u() {
            return dom.$wO(() => {
                dom.$wO(() => {
                    this.f.setRevealOnScroll(false);
                    this.f.scanDomNode();
                    this.f.setRevealOnScroll(true);
                });
            });
        }
        v(styleElement, style) {
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
            this.o = value;
            this.d.classList.toggle('disabled', !this.o);
        }
        domFocus() {
            const idx = this.p >= 0 ? this.p : this.k.length - 1;
            if (idx >= 0 && idx < this.k.length) {
                this.w(idx, undefined);
            }
            else {
                this.d.focus();
            }
        }
        isDOMFocused() {
            let candidate = document.activeElement;
            while (candidate) {
                if (this.d === candidate) {
                    return true;
                }
                candidate = candidate.parentElement;
            }
            return false;
        }
        getFocused() {
            return this.k[this.p];
        }
        setFocused(item, payload) {
            this.w(this.k.indexOf(item), payload);
        }
        focusPrev(payload) {
            if (this.p > 0) {
                this.w(this.p - 1, payload);
            }
        }
        focusNext(payload) {
            if (this.p + 1 < this.l.length) {
                this.w(this.p + 1, payload);
            }
        }
        w(nth, payload) {
            this.p = -1;
            for (let i = 0; i < this.l.length; i++) {
                const node = this.l[i];
                if (i !== nth) {
                    node.classList.remove('focused');
                }
                else {
                    this.p = i;
                    node.classList.add('focused');
                    node.focus();
                }
            }
            this.x(this.p, true);
            this.h.fire({ type: 'focus', item: this.k[this.p], node: this.l[this.p], payload });
        }
        reveal(item) {
            const idx = this.k.indexOf(item);
            if (idx >= 0) {
                this.x(idx, false);
            }
        }
        revealLast() {
            this.x(this.k.length - 1, false);
        }
        x(nth, minimal) {
            if (nth < 0 || nth >= this.l.length) {
                return;
            }
            const node = this.l[nth];
            if (!node) {
                return;
            }
            const { width } = this.f.getScrollDimensions();
            const { scrollLeft } = this.f.getScrollPosition();
            if (!minimal || node.offsetLeft > scrollLeft + width || node.offsetLeft < scrollLeft) {
                this.f.setRevealOnScroll(false);
                this.f.setScrollPosition({ scrollLeft: node.offsetLeft });
                this.f.setRevealOnScroll(true);
            }
        }
        getSelection() {
            return this.k[this.q];
        }
        setSelection(item, payload) {
            this.y(this.k.indexOf(item), payload);
        }
        y(nth, payload) {
            this.q = -1;
            for (let i = 0; i < this.l.length; i++) {
                const node = this.l[i];
                if (i !== nth) {
                    node.classList.remove('selected');
                }
                else {
                    this.q = i;
                    node.classList.add('selected');
                }
            }
            this.g.fire({ type: 'select', item: this.k[this.q], node: this.l[this.q], payload });
        }
        getItems() {
            return this.k;
        }
        setItems(items) {
            let prefix;
            let removed = [];
            try {
                prefix = (0, arrays_1.$Ob)(this.k, items, (a, b) => a.equals(b));
                removed = this.k.splice(prefix, this.k.length - prefix, ...items.slice(prefix));
                this.z(prefix);
                (0, lifecycle_1.$fc)(removed);
                this.w(-1, undefined);
            }
            catch (e) {
                const newError = new Error(`BreadcrumbsItem#setItems: newItems: ${items.length}, prefix: ${prefix}, removed: ${removed.length}`);
                newError.name = e.name;
                newError.stack = e.stack;
                throw newError;
            }
        }
        z(start) {
            let didChange = false;
            for (; start < this.k.length && start < this.l.length; start++) {
                const item = this.k[start];
                const node = this.l[start];
                this.A(item, node);
                didChange = true;
            }
            // case a: more nodes -> remove them
            while (start < this.l.length) {
                const free = this.l.pop();
                if (free) {
                    this.m.push(free);
                    free.remove();
                    didChange = true;
                }
            }
            // case b: more items -> render them
            for (; start < this.k.length; start++) {
                const item = this.k[start];
                const node = this.m.length > 0 ? this.m.pop() : document.createElement('div');
                if (node) {
                    this.A(item, node);
                    this.d.appendChild(node);
                    this.l.push(node);
                    didChange = true;
                }
            }
            if (didChange) {
                this.layout(undefined);
            }
        }
        A(item, container) {
            dom.$lO(container);
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
            const iconContainer = dom.$(themables_1.ThemeIcon.asCSSSelector(this.n));
            container.appendChild(iconContainer);
        }
        B(event) {
            if (!this.o) {
                return;
            }
            for (let el = event.target; el; el = el.parentElement) {
                const idx = this.l.indexOf(el);
                if (idx >= 0) {
                    this.w(idx, event);
                    this.y(idx, event);
                    break;
                }
            }
        }
    }
    exports.$5Q = $5Q;
});
//# sourceMappingURL=breadcrumbsWidget.js.map