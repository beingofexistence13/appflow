/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/splitview/splitview", "vs/base/common/event", "vs/base/common/lifecycle", "vs/css!./table"], function (require, exports, dom_1, listWidget_1, splitview_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5R = void 0;
    class TableListRenderer {
        static { this.TemplateId = 'row'; }
        constructor(f, renderers, g) {
            this.f = f;
            this.g = g;
            this.templateId = TableListRenderer.TemplateId;
            this.e = new Set();
            const rendererMap = new Map(renderers.map(r => [r.templateId, r]));
            this.d = [];
            for (const column of f) {
                const renderer = rendererMap.get(column.templateId);
                if (!renderer) {
                    throw new Error(`Table cell renderer for template id ${column.templateId} not found.`);
                }
                this.d.push(renderer);
            }
        }
        renderTemplate(container) {
            const rowContainer = (0, dom_1.$0O)(container, (0, dom_1.$)('.monaco-table-tr'));
            const cellContainers = [];
            const cellTemplateData = [];
            for (let i = 0; i < this.f.length; i++) {
                const renderer = this.d[i];
                const cellContainer = (0, dom_1.$0O)(rowContainer, (0, dom_1.$)('.monaco-table-td', { 'data-col-index': i }));
                cellContainer.style.width = `${this.g(i)}px`;
                cellContainers.push(cellContainer);
                cellTemplateData.push(renderer.renderTemplate(cellContainer));
            }
            const result = { container, cellContainers, cellTemplateData };
            this.e.add(result);
            return result;
        }
        renderElement(element, index, templateData, height) {
            for (let i = 0; i < this.f.length; i++) {
                const column = this.f[i];
                const cell = column.project(element);
                const renderer = this.d[i];
                renderer.renderElement(cell, index, templateData.cellTemplateData[i], height);
            }
        }
        disposeElement(element, index, templateData, height) {
            for (let i = 0; i < this.f.length; i++) {
                const renderer = this.d[i];
                if (renderer.disposeElement) {
                    const column = this.f[i];
                    const cell = column.project(element);
                    renderer.disposeElement(cell, index, templateData.cellTemplateData[i], height);
                }
            }
        }
        disposeTemplate(templateData) {
            for (let i = 0; i < this.f.length; i++) {
                const renderer = this.d[i];
                renderer.disposeTemplate(templateData.cellTemplateData[i]);
            }
            (0, dom_1.$lO)(templateData.container);
            this.e.delete(templateData);
        }
        layoutColumn(index, size) {
            for (const { cellContainers } of this.e) {
                cellContainers[index].style.width = `${size}px`;
            }
        }
    }
    function asListVirtualDelegate(delegate) {
        return {
            getHeight(row) { return delegate.getHeight(row); },
            getTemplateId() { return TableListRenderer.TemplateId; },
        };
    }
    class ColumnHeader {
        get minimumSize() { return this.column.minimumWidth ?? 120; }
        get maximumSize() { return this.column.maximumWidth ?? Number.POSITIVE_INFINITY; }
        get onDidChange() { return this.column.onDidChangeWidthConstraints ?? event_1.Event.None; }
        constructor(column, e) {
            this.column = column;
            this.e = e;
            this.d = new event_1.$fd();
            this.onDidLayout = this.d.event;
            this.element = (0, dom_1.$)('.monaco-table-th', { 'data-col-index': e, title: column.tooltip }, column.label);
        }
        layout(size) {
            this.d.fire([this.e, size]);
        }
    }
    class $5R {
        static { this.d = 0; }
        get onDidChangeFocus() { return this.g.onDidChangeFocus; }
        get onDidChangeSelection() { return this.g.onDidChangeSelection; }
        get onDidScroll() { return this.g.onDidScroll; }
        get onMouseClick() { return this.g.onMouseClick; }
        get onMouseDblClick() { return this.g.onMouseDblClick; }
        get onMouseMiddleClick() { return this.g.onMouseMiddleClick; }
        get onPointer() { return this.g.onPointer; }
        get onMouseUp() { return this.g.onMouseUp; }
        get onMouseDown() { return this.g.onMouseDown; }
        get onMouseOver() { return this.g.onMouseOver; }
        get onMouseMove() { return this.g.onMouseMove; }
        get onMouseOut() { return this.g.onMouseOut; }
        get onTouchStart() { return this.g.onTouchStart; }
        get onTap() { return this.g.onTap; }
        get onContextMenu() { return this.g.onContextMenu; }
        get onDidFocus() { return this.g.onDidFocus; }
        get onDidBlur() { return this.g.onDidBlur; }
        get scrollTop() { return this.g.scrollTop; }
        set scrollTop(scrollTop) { this.g.scrollTop = scrollTop; }
        get scrollLeft() { return this.g.scrollLeft; }
        set scrollLeft(scrollLeft) { this.g.scrollLeft = scrollLeft; }
        get scrollHeight() { return this.g.scrollHeight; }
        get renderHeight() { return this.g.renderHeight; }
        get onDidDispose() { return this.g.onDidDispose; }
        constructor(user, container, p, columns, renderers, _options) {
            this.p = p;
            this.domId = `table_id_${++$5R.d}`;
            this.k = new lifecycle_1.$jc();
            this.m = 0;
            this.o = 0;
            this.domNode = (0, dom_1.$0O)(container, (0, dom_1.$)(`.monaco-table.${this.domId}`));
            const headers = columns.map((c, i) => new ColumnHeader(c, i));
            const descriptor = {
                size: headers.reduce((a, b) => a + b.column.weight, 0),
                views: headers.map(view => ({ size: view.column.weight, view }))
            };
            this.f = this.k.add(new splitview_1.$bR(this.domNode, {
                orientation: 1 /* Orientation.HORIZONTAL */,
                scrollbarVisibility: 2 /* ScrollbarVisibility.Hidden */,
                getSashOrthogonalSize: () => this.o,
                descriptor
            }));
            this.f.el.style.height = `${p.headerRowHeight}px`;
            this.f.el.style.lineHeight = `${p.headerRowHeight}px`;
            const renderer = new TableListRenderer(columns, renderers, i => this.f.getViewSize(i));
            this.g = this.k.add(new listWidget_1.$wQ(user, this.domNode, asListVirtualDelegate(p), [renderer], _options));
            event_1.Event.any(...headers.map(h => h.onDidLayout))(([index, size]) => renderer.layoutColumn(index, size), null, this.k);
            this.f.onDidSashReset(index => {
                const totalWeight = columns.reduce((r, c) => r + c.weight, 0);
                const size = columns[index].weight / totalWeight * this.m;
                this.f.resizeView(index, size);
            }, null, this.k);
            this.j = (0, dom_1.$XO)(this.domNode);
            this.style(listWidget_1.$vQ);
        }
        updateOptions(options) {
            this.g.updateOptions(options);
        }
        splice(start, deleteCount, elements = []) {
            this.g.splice(start, deleteCount, elements);
        }
        rerender() {
            this.g.rerender();
        }
        row(index) {
            return this.g.element(index);
        }
        indexOf(element) {
            return this.g.indexOf(element);
        }
        get length() {
            return this.g.length;
        }
        getHTMLElement() {
            return this.domNode;
        }
        layout(height, width) {
            height = height ?? (0, dom_1.$KO)(this.domNode);
            width = width ?? (0, dom_1.$IO)(this.domNode);
            this.m = width;
            this.o = height;
            this.f.layout(width);
            const listHeight = height - this.p.headerRowHeight;
            this.g.getHTMLElement().style.height = `${listHeight}px`;
            this.g.layout(listHeight, width);
        }
        triggerTypeNavigation() {
            this.g.triggerTypeNavigation();
        }
        style(styles) {
            const content = [];
            content.push(`.monaco-table.${this.domId} > .monaco-split-view2 .monaco-sash.vertical::before {
			top: ${this.p.headerRowHeight + 1}px;
			height: calc(100% - ${this.p.headerRowHeight}px);
		}`);
            this.j.textContent = content.join('\n');
            this.g.style(styles);
        }
        domFocus() {
            this.g.domFocus();
        }
        setAnchor(index) {
            this.g.setAnchor(index);
        }
        getAnchor() {
            return this.g.getAnchor();
        }
        getSelectedElements() {
            return this.g.getSelectedElements();
        }
        setSelection(indexes, browserEvent) {
            this.g.setSelection(indexes, browserEvent);
        }
        getSelection() {
            return this.g.getSelection();
        }
        setFocus(indexes, browserEvent) {
            this.g.setFocus(indexes, browserEvent);
        }
        focusNext(n = 1, loop = false, browserEvent) {
            this.g.focusNext(n, loop, browserEvent);
        }
        focusPrevious(n = 1, loop = false, browserEvent) {
            this.g.focusPrevious(n, loop, browserEvent);
        }
        focusNextPage(browserEvent) {
            return this.g.focusNextPage(browserEvent);
        }
        focusPreviousPage(browserEvent) {
            return this.g.focusPreviousPage(browserEvent);
        }
        focusFirst(browserEvent) {
            this.g.focusFirst(browserEvent);
        }
        focusLast(browserEvent) {
            this.g.focusLast(browserEvent);
        }
        getFocus() {
            return this.g.getFocus();
        }
        getFocusedElements() {
            return this.g.getFocusedElements();
        }
        getRelativeTop(index) {
            return this.g.getRelativeTop(index);
        }
        reveal(index, relativeTop) {
            this.g.reveal(index, relativeTop);
        }
        dispose() {
            this.k.dispose();
        }
    }
    exports.$5R = $5R;
});
//# sourceMappingURL=tableWidget.js.map