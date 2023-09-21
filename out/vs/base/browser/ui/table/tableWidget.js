/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/splitview/splitview", "vs/base/common/event", "vs/base/common/lifecycle", "vs/css!./table"], function (require, exports, dom_1, listWidget_1, splitview_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Table = void 0;
    class TableListRenderer {
        static { this.TemplateId = 'row'; }
        constructor(columns, renderers, getColumnSize) {
            this.columns = columns;
            this.getColumnSize = getColumnSize;
            this.templateId = TableListRenderer.TemplateId;
            this.renderedTemplates = new Set();
            const rendererMap = new Map(renderers.map(r => [r.templateId, r]));
            this.renderers = [];
            for (const column of columns) {
                const renderer = rendererMap.get(column.templateId);
                if (!renderer) {
                    throw new Error(`Table cell renderer for template id ${column.templateId} not found.`);
                }
                this.renderers.push(renderer);
            }
        }
        renderTemplate(container) {
            const rowContainer = (0, dom_1.append)(container, (0, dom_1.$)('.monaco-table-tr'));
            const cellContainers = [];
            const cellTemplateData = [];
            for (let i = 0; i < this.columns.length; i++) {
                const renderer = this.renderers[i];
                const cellContainer = (0, dom_1.append)(rowContainer, (0, dom_1.$)('.monaco-table-td', { 'data-col-index': i }));
                cellContainer.style.width = `${this.getColumnSize(i)}px`;
                cellContainers.push(cellContainer);
                cellTemplateData.push(renderer.renderTemplate(cellContainer));
            }
            const result = { container, cellContainers, cellTemplateData };
            this.renderedTemplates.add(result);
            return result;
        }
        renderElement(element, index, templateData, height) {
            for (let i = 0; i < this.columns.length; i++) {
                const column = this.columns[i];
                const cell = column.project(element);
                const renderer = this.renderers[i];
                renderer.renderElement(cell, index, templateData.cellTemplateData[i], height);
            }
        }
        disposeElement(element, index, templateData, height) {
            for (let i = 0; i < this.columns.length; i++) {
                const renderer = this.renderers[i];
                if (renderer.disposeElement) {
                    const column = this.columns[i];
                    const cell = column.project(element);
                    renderer.disposeElement(cell, index, templateData.cellTemplateData[i], height);
                }
            }
        }
        disposeTemplate(templateData) {
            for (let i = 0; i < this.columns.length; i++) {
                const renderer = this.renderers[i];
                renderer.disposeTemplate(templateData.cellTemplateData[i]);
            }
            (0, dom_1.clearNode)(templateData.container);
            this.renderedTemplates.delete(templateData);
        }
        layoutColumn(index, size) {
            for (const { cellContainers } of this.renderedTemplates) {
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
        constructor(column, index) {
            this.column = column;
            this.index = index;
            this._onDidLayout = new event_1.Emitter();
            this.onDidLayout = this._onDidLayout.event;
            this.element = (0, dom_1.$)('.monaco-table-th', { 'data-col-index': index, title: column.tooltip }, column.label);
        }
        layout(size) {
            this._onDidLayout.fire([this.index, size]);
        }
    }
    class Table {
        static { this.InstanceCount = 0; }
        get onDidChangeFocus() { return this.list.onDidChangeFocus; }
        get onDidChangeSelection() { return this.list.onDidChangeSelection; }
        get onDidScroll() { return this.list.onDidScroll; }
        get onMouseClick() { return this.list.onMouseClick; }
        get onMouseDblClick() { return this.list.onMouseDblClick; }
        get onMouseMiddleClick() { return this.list.onMouseMiddleClick; }
        get onPointer() { return this.list.onPointer; }
        get onMouseUp() { return this.list.onMouseUp; }
        get onMouseDown() { return this.list.onMouseDown; }
        get onMouseOver() { return this.list.onMouseOver; }
        get onMouseMove() { return this.list.onMouseMove; }
        get onMouseOut() { return this.list.onMouseOut; }
        get onTouchStart() { return this.list.onTouchStart; }
        get onTap() { return this.list.onTap; }
        get onContextMenu() { return this.list.onContextMenu; }
        get onDidFocus() { return this.list.onDidFocus; }
        get onDidBlur() { return this.list.onDidBlur; }
        get scrollTop() { return this.list.scrollTop; }
        set scrollTop(scrollTop) { this.list.scrollTop = scrollTop; }
        get scrollLeft() { return this.list.scrollLeft; }
        set scrollLeft(scrollLeft) { this.list.scrollLeft = scrollLeft; }
        get scrollHeight() { return this.list.scrollHeight; }
        get renderHeight() { return this.list.renderHeight; }
        get onDidDispose() { return this.list.onDidDispose; }
        constructor(user, container, virtualDelegate, columns, renderers, _options) {
            this.virtualDelegate = virtualDelegate;
            this.domId = `table_id_${++Table.InstanceCount}`;
            this.disposables = new lifecycle_1.DisposableStore();
            this.cachedWidth = 0;
            this.cachedHeight = 0;
            this.domNode = (0, dom_1.append)(container, (0, dom_1.$)(`.monaco-table.${this.domId}`));
            const headers = columns.map((c, i) => new ColumnHeader(c, i));
            const descriptor = {
                size: headers.reduce((a, b) => a + b.column.weight, 0),
                views: headers.map(view => ({ size: view.column.weight, view }))
            };
            this.splitview = this.disposables.add(new splitview_1.SplitView(this.domNode, {
                orientation: 1 /* Orientation.HORIZONTAL */,
                scrollbarVisibility: 2 /* ScrollbarVisibility.Hidden */,
                getSashOrthogonalSize: () => this.cachedHeight,
                descriptor
            }));
            this.splitview.el.style.height = `${virtualDelegate.headerRowHeight}px`;
            this.splitview.el.style.lineHeight = `${virtualDelegate.headerRowHeight}px`;
            const renderer = new TableListRenderer(columns, renderers, i => this.splitview.getViewSize(i));
            this.list = this.disposables.add(new listWidget_1.List(user, this.domNode, asListVirtualDelegate(virtualDelegate), [renderer], _options));
            event_1.Event.any(...headers.map(h => h.onDidLayout))(([index, size]) => renderer.layoutColumn(index, size), null, this.disposables);
            this.splitview.onDidSashReset(index => {
                const totalWeight = columns.reduce((r, c) => r + c.weight, 0);
                const size = columns[index].weight / totalWeight * this.cachedWidth;
                this.splitview.resizeView(index, size);
            }, null, this.disposables);
            this.styleElement = (0, dom_1.createStyleSheet)(this.domNode);
            this.style(listWidget_1.unthemedListStyles);
        }
        updateOptions(options) {
            this.list.updateOptions(options);
        }
        splice(start, deleteCount, elements = []) {
            this.list.splice(start, deleteCount, elements);
        }
        rerender() {
            this.list.rerender();
        }
        row(index) {
            return this.list.element(index);
        }
        indexOf(element) {
            return this.list.indexOf(element);
        }
        get length() {
            return this.list.length;
        }
        getHTMLElement() {
            return this.domNode;
        }
        layout(height, width) {
            height = height ?? (0, dom_1.getContentHeight)(this.domNode);
            width = width ?? (0, dom_1.getContentWidth)(this.domNode);
            this.cachedWidth = width;
            this.cachedHeight = height;
            this.splitview.layout(width);
            const listHeight = height - this.virtualDelegate.headerRowHeight;
            this.list.getHTMLElement().style.height = `${listHeight}px`;
            this.list.layout(listHeight, width);
        }
        triggerTypeNavigation() {
            this.list.triggerTypeNavigation();
        }
        style(styles) {
            const content = [];
            content.push(`.monaco-table.${this.domId} > .monaco-split-view2 .monaco-sash.vertical::before {
			top: ${this.virtualDelegate.headerRowHeight + 1}px;
			height: calc(100% - ${this.virtualDelegate.headerRowHeight}px);
		}`);
            this.styleElement.textContent = content.join('\n');
            this.list.style(styles);
        }
        domFocus() {
            this.list.domFocus();
        }
        setAnchor(index) {
            this.list.setAnchor(index);
        }
        getAnchor() {
            return this.list.getAnchor();
        }
        getSelectedElements() {
            return this.list.getSelectedElements();
        }
        setSelection(indexes, browserEvent) {
            this.list.setSelection(indexes, browserEvent);
        }
        getSelection() {
            return this.list.getSelection();
        }
        setFocus(indexes, browserEvent) {
            this.list.setFocus(indexes, browserEvent);
        }
        focusNext(n = 1, loop = false, browserEvent) {
            this.list.focusNext(n, loop, browserEvent);
        }
        focusPrevious(n = 1, loop = false, browserEvent) {
            this.list.focusPrevious(n, loop, browserEvent);
        }
        focusNextPage(browserEvent) {
            return this.list.focusNextPage(browserEvent);
        }
        focusPreviousPage(browserEvent) {
            return this.list.focusPreviousPage(browserEvent);
        }
        focusFirst(browserEvent) {
            this.list.focusFirst(browserEvent);
        }
        focusLast(browserEvent) {
            this.list.focusLast(browserEvent);
        }
        getFocus() {
            return this.list.getFocus();
        }
        getFocusedElements() {
            return this.list.getFocusedElements();
        }
        getRelativeTop(index) {
            return this.list.getRelativeTop(index);
        }
        reveal(index, relativeTop) {
            this.list.reveal(index, relativeTop);
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    exports.Table = Table;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGVXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvdGFibGUvdGFibGVXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0JoRyxNQUFNLGlCQUFpQjtpQkFFZixlQUFVLEdBQUcsS0FBSyxBQUFSLENBQVM7UUFLMUIsWUFDUyxPQUFvQyxFQUM1QyxTQUEyQyxFQUNuQyxhQUF3QztZQUZ4QyxZQUFPLEdBQVAsT0FBTyxDQUE2QjtZQUVwQyxrQkFBYSxHQUFiLGFBQWEsQ0FBMkI7WUFQeEMsZUFBVSxHQUFHLGlCQUFpQixDQUFDLFVBQVUsQ0FBQztZQUUzQyxzQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztZQU90RCxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUVwQixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtnQkFDN0IsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRXBELElBQUksQ0FBQyxRQUFRLEVBQUU7b0JBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsTUFBTSxDQUFDLFVBQVUsYUFBYSxDQUFDLENBQUM7aUJBQ3ZGO2dCQUVELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzlCO1FBQ0YsQ0FBQztRQUVELGNBQWMsQ0FBQyxTQUFzQjtZQUNwQyxNQUFNLFlBQVksR0FBRyxJQUFBLFlBQU0sRUFBQyxTQUFTLEVBQUUsSUFB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