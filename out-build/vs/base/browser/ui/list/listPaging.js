/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "./listWidget", "vs/css!./list"], function (require, exports, arrays_1, cancellation_1, event_1, lifecycle_1, listWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UR = void 0;
    class PagedRenderer {
        get templateId() { return this.a.templateId; }
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        renderTemplate(container) {
            const data = this.a.renderTemplate(container);
            return { data, disposable: lifecycle_1.$kc.None };
        }
        renderElement(index, _, data, height) {
            data.disposable?.dispose();
            if (!data.data) {
                return;
            }
            const model = this.b();
            if (model.isResolved(index)) {
                return this.a.renderElement(model.get(index), index, data.data, height);
            }
            const cts = new cancellation_1.$pd();
            const promise = model.resolve(index, cts.token);
            data.disposable = { dispose: () => cts.cancel() };
            this.a.renderPlaceholder(index, data.data);
            promise.then(entry => this.a.renderElement(entry, index, data.data, height));
        }
        disposeTemplate(data) {
            if (data.disposable) {
                data.disposable.dispose();
                data.disposable = undefined;
            }
            if (data.data) {
                this.a.disposeTemplate(data.data);
                data.data = undefined;
            }
        }
    }
    class PagedAccessibilityProvider {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        getWidgetAriaLabel() {
            return this.b.getWidgetAriaLabel();
        }
        getAriaLabel(index) {
            const model = this.a();
            if (!model.isResolved(index)) {
                return null;
            }
            return this.b.getAriaLabel(model.get(index));
        }
    }
    function fromPagedListOptions(modelProvider, options) {
        return {
            ...options,
            accessibilityProvider: options.accessibilityProvider && new PagedAccessibilityProvider(modelProvider, options.accessibilityProvider)
        };
    }
    class $UR {
        constructor(user, container, virtualDelegate, renderers, options = {}) {
            const modelProvider = () => this.model;
            const pagedRenderers = renderers.map(r => new PagedRenderer(r, modelProvider));
            this.a = new listWidget_1.$wQ(user, container, virtualDelegate, pagedRenderers, fromPagedListOptions(modelProvider, options));
        }
        updateOptions(options) {
            this.a.updateOptions(options);
        }
        getHTMLElement() {
            return this.a.getHTMLElement();
        }
        isDOMFocused() {
            return this.a.getHTMLElement() === document.activeElement;
        }
        domFocus() {
            this.a.domFocus();
        }
        get onDidFocus() {
            return this.a.onDidFocus;
        }
        get onDidBlur() {
            return this.a.onDidBlur;
        }
        get widget() {
            return this.a;
        }
        get onDidDispose() {
            return this.a.onDidDispose;
        }
        get onMouseClick() {
            return event_1.Event.map(this.a.onMouseClick, ({ element, index, browserEvent }) => ({ element: element === undefined ? undefined : this.b.get(element), index, browserEvent }));
        }
        get onMouseDblClick() {
            return event_1.Event.map(this.a.onMouseDblClick, ({ element, index, browserEvent }) => ({ element: element === undefined ? undefined : this.b.get(element), index, browserEvent }));
        }
        get onTap() {
            return event_1.Event.map(this.a.onTap, ({ element, index, browserEvent }) => ({ element: element === undefined ? undefined : this.b.get(element), index, browserEvent }));
        }
        get onPointer() {
            return event_1.Event.map(this.a.onPointer, ({ element, index, browserEvent }) => ({ element: element === undefined ? undefined : this.b.get(element), index, browserEvent }));
        }
        get onDidChangeFocus() {
            return event_1.Event.map(this.a.onDidChangeFocus, ({ elements, indexes, browserEvent }) => ({ elements: elements.map(e => this.b.get(e)), indexes, browserEvent }));
        }
        get onDidChangeSelection() {
            return event_1.Event.map(this.a.onDidChangeSelection, ({ elements, indexes, browserEvent }) => ({ elements: elements.map(e => this.b.get(e)), indexes, browserEvent }));
        }
        get onContextMenu() {
            return event_1.Event.map(this.a.onContextMenu, ({ element, index, anchor, browserEvent }) => (typeof element === 'undefined' ? { element, index, anchor, browserEvent } : { element: this.b.get(element), index, anchor, browserEvent }));
        }
        get model() {
            return this.b;
        }
        set model(model) {
            this.b = model;
            this.a.splice(0, this.a.length, (0, arrays_1.$Qb)(model.length));
        }
        get length() {
            return this.a.length;
        }
        get scrollTop() {
            return this.a.scrollTop;
        }
        set scrollTop(scrollTop) {
            this.a.scrollTop = scrollTop;
        }
        get scrollLeft() {
            return this.a.scrollLeft;
        }
        set scrollLeft(scrollLeft) {
            this.a.scrollLeft = scrollLeft;
        }
        setAnchor(index) {
            this.a.setAnchor(index);
        }
        getAnchor() {
            return this.a.getAnchor();
        }
        setFocus(indexes) {
            this.a.setFocus(indexes);
        }
        focusNext(n, loop) {
            this.a.focusNext(n, loop);
        }
        focusPrevious(n, loop) {
            this.a.focusPrevious(n, loop);
        }
        focusNextPage() {
            return this.a.focusNextPage();
        }
        focusPreviousPage() {
            return this.a.focusPreviousPage();
        }
        focusLast() {
            this.a.focusLast();
        }
        focusFirst() {
            this.a.focusFirst();
        }
        getFocus() {
            return this.a.getFocus();
        }
        setSelection(indexes, browserEvent) {
            this.a.setSelection(indexes, browserEvent);
        }
        getSelection() {
            return this.a.getSelection();
        }
        getSelectedElements() {
            return this.getSelection().map(i => this.model.get(i));
        }
        layout(height, width) {
            this.a.layout(height, width);
        }
        triggerTypeNavigation() {
            this.a.triggerTypeNavigation();
        }
        reveal(index, relativeTop) {
            this.a.reveal(index, relativeTop);
        }
        style(styles) {
            this.a.style(styles);
        }
        dispose() {
            this.a.dispose();
        }
    }
    exports.$UR = $UR;
});
//# sourceMappingURL=listPaging.js.map