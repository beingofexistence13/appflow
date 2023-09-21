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
define(["require", "exports", "vs/nls!vs/workbench/contrib/markers/browser/markersTable", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/workbench/contrib/markers/browser/markersModel", "vs/platform/markers/common/markers", "vs/platform/severityIcon/browser/severityIcon", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/label/common/label", "vs/workbench/contrib/markers/browser/markersFilterOptions", "vs/platform/opener/browser/link", "vs/platform/opener/common/opener", "vs/workbench/contrib/markers/browser/markersViewActions", "vs/base/browser/event", "vs/workbench/contrib/markers/browser/messages", "vs/base/common/types", "vs/editor/common/core/range", "vs/platform/markers/common/markerService", "vs/base/common/severity"], function (require, exports, nls_1, DOM, event_1, lifecycle_1, instantiation_1, listService_1, highlightedLabel_1, markersModel_1, markers_1, severityIcon_1, actionbar_1, label_1, markersFilterOptions_1, link_1, opener_1, markersViewActions_1, event_2, messages_1, types_1, range_1, markerService_1, severity_1) {
    "use strict";
    var MarkerSeverityColumnRenderer_1, MarkerCodeColumnRenderer_1, MarkerFileColumnRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OSb = void 0;
    const $ = DOM.$;
    let MarkerSeverityColumnRenderer = class MarkerSeverityColumnRenderer {
        static { MarkerSeverityColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'severity'; }
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.templateId = MarkerSeverityColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const severityColumn = DOM.$0O(container, $('.severity'));
            const icon = DOM.$0O(severityColumn, $(''));
            const actionBarColumn = DOM.$0O(container, $('.actions'));
            const actionBar = new actionbar_1.$1P(actionBarColumn, {
                actionViewItemProvider: (action) => action.id === markersViewActions_1.$BSb.ID ? this.d.createInstance(markersViewActions_1.$CSb, action) : undefined,
                animated: false
            });
            return { actionBar, icon };
        }
        renderElement(element, index, templateData, height) {
            const toggleQuickFix = (enabled) => {
                if (!(0, types_1.$sf)(enabled)) {
                    const container = DOM.$QO(templateData.icon, 'monaco-table-td');
                    container.classList.toggle('quickFix', enabled);
                }
            };
            templateData.icon.title = markers_1.MarkerSeverity.toString(element.marker.severity);
            templateData.icon.className = `marker-icon ${severity_1.default.toString(markers_1.MarkerSeverity.toSeverity(element.marker.severity))} codicon ${severityIcon_1.SeverityIcon.className(markers_1.MarkerSeverity.toSeverity(element.marker.severity))}`;
            templateData.actionBar.clear();
            const viewModel = this.c.getViewModel(element);
            if (viewModel) {
                const quickFixAction = viewModel.quickFixAction;
                templateData.actionBar.push([quickFixAction], { icon: true, label: false });
                toggleQuickFix(viewModel.quickFixAction.enabled);
                quickFixAction.onDidChange(({ enabled }) => toggleQuickFix(enabled));
                quickFixAction.onShowQuickFixes(() => {
                    const quickFixActionViewItem = templateData.actionBar.viewItems[0];
                    if (quickFixActionViewItem) {
                        quickFixActionViewItem.showQuickFixes();
                    }
                });
            }
        }
        disposeTemplate(templateData) { }
    };
    MarkerSeverityColumnRenderer = MarkerSeverityColumnRenderer_1 = __decorate([
        __param(1, instantiation_1.$Ah)
    ], MarkerSeverityColumnRenderer);
    let MarkerCodeColumnRenderer = class MarkerCodeColumnRenderer {
        static { MarkerCodeColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'code'; }
        constructor(c) {
            this.c = c;
            this.templateId = MarkerCodeColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const codeColumn = DOM.$0O(container, $('.code'));
            const sourceLabel = new highlightedLabel_1.$JR(codeColumn);
            sourceLabel.element.classList.add('source-label');
            const codeLabel = new highlightedLabel_1.$JR(codeColumn);
            codeLabel.element.classList.add('code-label');
            const codeLink = new link_1.$40(codeColumn, { href: '', label: '' }, {}, this.c);
            return { codeColumn, sourceLabel, codeLabel, codeLink };
        }
        renderElement(element, index, templateData, height) {
            templateData.codeColumn.classList.remove('code-label');
            templateData.codeColumn.classList.remove('code-link');
            if (element.marker.source && element.marker.code) {
                if (typeof element.marker.code === 'string') {
                    templateData.codeColumn.classList.add('code-label');
                    templateData.codeColumn.title = `${element.marker.source} (${element.marker.code})`;
                    templateData.sourceLabel.set(element.marker.source, element.sourceMatches);
                    templateData.codeLabel.set(element.marker.code, element.codeMatches);
                }
                else {
                    templateData.codeColumn.classList.add('code-link');
                    templateData.codeColumn.title = `${element.marker.source} (${element.marker.code.value})`;
                    templateData.sourceLabel.set(element.marker.source, element.sourceMatches);
                    const codeLinkLabel = new highlightedLabel_1.$JR($('.code-link-label'));
                    codeLinkLabel.set(element.marker.code.value, element.codeMatches);
                    templateData.codeLink.link = {
                        href: element.marker.code.target.toString(),
                        title: element.marker.code.target.toString(),
                        label: codeLinkLabel.element,
                    };
                }
            }
            else {
                templateData.codeColumn.title = '';
                templateData.sourceLabel.set('-');
            }
        }
        disposeTemplate(templateData) { }
    };
    MarkerCodeColumnRenderer = MarkerCodeColumnRenderer_1 = __decorate([
        __param(0, opener_1.$NT)
    ], MarkerCodeColumnRenderer);
    class MarkerMessageColumnRenderer {
        constructor() {
            this.templateId = MarkerMessageColumnRenderer.TEMPLATE_ID;
        }
        static { this.TEMPLATE_ID = 'message'; }
        renderTemplate(container) {
            const columnElement = DOM.$0O(container, $('.message'));
            const highlightedLabel = new highlightedLabel_1.$JR(columnElement);
            return { columnElement, highlightedLabel };
        }
        renderElement(element, index, templateData, height) {
            templateData.columnElement.title = element.marker.message;
            templateData.highlightedLabel.set(element.marker.message, element.messageMatches);
        }
        disposeTemplate(templateData) { }
    }
    let MarkerFileColumnRenderer = class MarkerFileColumnRenderer {
        static { MarkerFileColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'file'; }
        constructor(c) {
            this.c = c;
            this.templateId = MarkerFileColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const columnElement = DOM.$0O(container, $('.file'));
            const fileLabel = new highlightedLabel_1.$JR(columnElement);
            fileLabel.element.classList.add('file-label');
            const positionLabel = new highlightedLabel_1.$JR(columnElement);
            positionLabel.element.classList.add('file-position');
            return { columnElement, fileLabel, positionLabel };
        }
        renderElement(element, index, templateData, height) {
            const positionLabel = messages_1.default.MARKERS_PANEL_AT_LINE_COL_NUMBER(element.marker.startLineNumber, element.marker.startColumn);
            templateData.columnElement.title = `${this.c.getUriLabel(element.marker.resource, { relative: false })} ${positionLabel}`;
            templateData.fileLabel.set(this.c.getUriLabel(element.marker.resource, { relative: true }), element.fileMatches);
            templateData.positionLabel.set(positionLabel, undefined);
        }
        disposeTemplate(templateData) { }
    };
    MarkerFileColumnRenderer = MarkerFileColumnRenderer_1 = __decorate([
        __param(0, label_1.$Vz)
    ], MarkerFileColumnRenderer);
    class MarkerOwnerColumnRenderer {
        constructor() {
            this.templateId = MarkerOwnerColumnRenderer.TEMPLATE_ID;
        }
        static { this.TEMPLATE_ID = 'owner'; }
        renderTemplate(container) {
            const columnElement = DOM.$0O(container, $('.owner'));
            const highlightedLabel = new highlightedLabel_1.$JR(columnElement);
            return { columnElement, highlightedLabel };
        }
        renderElement(element, index, templateData, height) {
            templateData.columnElement.title = element.marker.owner;
            templateData.highlightedLabel.set(element.marker.owner, element.ownerMatches);
        }
        disposeTemplate(templateData) { }
    }
    class MarkersTableVirtualDelegate {
        constructor() {
            this.headerRowHeight = MarkersTableVirtualDelegate.HEADER_ROW_HEIGHT;
        }
        static { this.HEADER_ROW_HEIGHT = 24; }
        static { this.ROW_HEIGHT = 24; }
        getHeight(item) {
            return MarkersTableVirtualDelegate.ROW_HEIGHT;
        }
    }
    let $OSb = class $OSb extends lifecycle_1.$kc {
        constructor(h, j, n, r, options, s, t) {
            super();
            this.h = h;
            this.j = j;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.c = 0;
            this.g = this.s.createInstance(listService_1.$r4, 'Markers', this.h, new MarkersTableVirtualDelegate(), [
                {
                    label: '',
                    tooltip: '',
                    weight: 0,
                    minimumWidth: 36,
                    maximumWidth: 36,
                    templateId: MarkerSeverityColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)(0, null),
                    tooltip: '',
                    weight: 1,
                    minimumWidth: 100,
                    maximumWidth: 300,
                    templateId: MarkerCodeColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)(1, null),
                    tooltip: '',
                    weight: 4,
                    templateId: MarkerMessageColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)(2, null),
                    tooltip: '',
                    weight: 2,
                    templateId: MarkerFileColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)(3, null),
                    tooltip: '',
                    weight: 1,
                    minimumWidth: 100,
                    maximumWidth: 300,
                    templateId: MarkerOwnerColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                }
            ], [
                this.s.createInstance(MarkerSeverityColumnRenderer, this.j),
                this.s.createInstance(MarkerCodeColumnRenderer),
                this.s.createInstance(MarkerMessageColumnRenderer),
                this.s.createInstance(MarkerFileColumnRenderer),
                this.s.createInstance(MarkerOwnerColumnRenderer),
            ], options);
            const list = this.g.domNode.querySelector('.monaco-list-rows');
            // mouseover/mouseleave event handlers
            const onRowHover = event_1.Event.chain(this.B(new event_2.$9P(list, 'mouseover')).event, $ => $.map(e => DOM.$QO(e.target, 'monaco-list-row', 'monaco-list-rows'))
                .filter(((e) => !!e))
                .map(e => parseInt(e.getAttribute('data-index'))));
            const onListLeave = event_1.Event.map(this.B(new event_2.$9P(list, 'mouseleave')).event, () => -1);
            const onRowHoverOrLeave = event_1.Event.latch(event_1.Event.any(onRowHover, onListLeave));
            const onRowPermanentHover = event_1.Event.debounce(onRowHoverOrLeave, (_, e) => e, 500);
            this.B(onRowPermanentHover(e => {
                if (e !== -1 && this.g.row(e)) {
                    this.j.onMarkerMouseHover(this.g.row(e));
                }
            }));
        }
        get contextKeyService() {
            return this.g.contextKeyService;
        }
        get onContextMenu() {
            return this.g.onContextMenu;
        }
        get onDidOpen() {
            return this.g.onDidOpen;
        }
        get onDidChangeFocus() {
            return this.g.onDidChangeFocus;
        }
        get onDidChangeSelection() {
            return this.g.onDidChangeSelection;
        }
        collapseMarkers() { }
        domFocus() {
            this.g.domFocus();
        }
        filterMarkers(resourceMarkers, filterOptions) {
            this.r = filterOptions;
            this.reset(resourceMarkers);
        }
        getFocus() {
            const focus = this.g.getFocus();
            return focus.length > 0 ? [...focus.map(f => this.g.row(f))] : [];
        }
        getHTMLElement() {
            return this.g.getHTMLElement();
        }
        getRelativeTop(marker) {
            return marker ? this.g.getRelativeTop(this.g.indexOf(marker)) : null;
        }
        getSelection() {
            const selection = this.g.getSelection();
            return selection.length > 0 ? [...selection.map(i => this.g.row(i))] : [];
        }
        getVisibleItemCount() {
            return this.c;
        }
        isVisible() {
            return !this.h.classList.contains('hidden');
        }
        layout(height, width) {
            this.h.style.height = `${height}px`;
            this.g.layout(height, width);
        }
        reset(resourceMarkers) {
            this.n = resourceMarkers;
            const items = [];
            for (const resourceMarker of this.n) {
                for (const marker of resourceMarker.markers) {
                    if (markerService_1.$LBb.has(marker.resource.scheme)) {
                        continue;
                    }
                    // Exclude pattern
                    if (this.r.excludesMatcher.matches(marker.resource)) {
                        continue;
                    }
                    // Include pattern
                    if (this.r.includesMatcher.matches(marker.resource)) {
                        items.push(new markersModel_1.$wSb(marker));
                        continue;
                    }
                    // Severity filter
                    const matchesSeverity = this.r.showErrors && markers_1.MarkerSeverity.Error === marker.marker.severity ||
                        this.r.showWarnings && markers_1.MarkerSeverity.Warning === marker.marker.severity ||
                        this.r.showInfos && markers_1.MarkerSeverity.Info === marker.marker.severity;
                    if (!matchesSeverity) {
                        continue;
                    }
                    // Text filter
                    if (this.r.textFilter.text) {
                        const sourceMatches = marker.marker.source ? markersFilterOptions_1.$ESb._filter(this.r.textFilter.text, marker.marker.source) ?? undefined : undefined;
                        const codeMatches = marker.marker.code ? markersFilterOptions_1.$ESb._filter(this.r.textFilter.text, typeof marker.marker.code === 'string' ? marker.marker.code : marker.marker.code.value) ?? undefined : undefined;
                        const messageMatches = markersFilterOptions_1.$ESb._messageFilter(this.r.textFilter.text, marker.marker.message) ?? undefined;
                        const fileMatches = markersFilterOptions_1.$ESb._messageFilter(this.r.textFilter.text, this.t.getUriLabel(marker.resource, { relative: true })) ?? undefined;
                        const ownerMatches = markersFilterOptions_1.$ESb._messageFilter(this.r.textFilter.text, marker.marker.owner) ?? undefined;
                        const matched = sourceMatches || codeMatches || messageMatches || fileMatches || ownerMatches;
                        if ((matched && !this.r.textFilter.negate) || (!matched && this.r.textFilter.negate)) {
                            items.push(new markersModel_1.$wSb(marker, sourceMatches, codeMatches, messageMatches, fileMatches, ownerMatches));
                        }
                        continue;
                    }
                    items.push(new markersModel_1.$wSb(marker));
                }
            }
            this.c = items.length;
            this.g.splice(0, Number.POSITIVE_INFINITY, items.sort((a, b) => {
                let result = markers_1.MarkerSeverity.compare(a.marker.severity, b.marker.severity);
                if (result === 0) {
                    result = (0, markersModel_1.$tSb)(a.marker, b.marker);
                }
                if (result === 0) {
                    result = range_1.$ks.compareRangesUsingStarts(a.marker, b.marker);
                }
                return result;
            }));
        }
        revealMarkers(activeResource, focus, lastSelectedRelativeTop) {
            if (activeResource) {
                const activeResourceIndex = this.n.indexOf(activeResource);
                if (activeResourceIndex !== -1) {
                    if (this.w(activeResource)) {
                        const tableSelection = this.g.getSelection();
                        this.g.reveal(tableSelection[0], lastSelectedRelativeTop);
                        if (focus) {
                            this.g.setFocus(tableSelection);
                        }
                    }
                    else {
                        this.g.reveal(activeResourceIndex, 0);
                        if (focus) {
                            this.g.setFocus([activeResourceIndex]);
                            this.g.setSelection([activeResourceIndex]);
                        }
                    }
                }
            }
            else if (focus) {
                this.g.setSelection([]);
                this.g.focusFirst();
            }
        }
        setAriaLabel(label) {
            this.g.domNode.ariaLabel = label;
        }
        setMarkerSelection(selection, focus) {
            if (this.isVisible()) {
                if (selection && selection.length > 0) {
                    this.g.setSelection(selection.map(m => this.u(m)));
                    if (focus && focus.length > 0) {
                        this.g.setFocus(focus.map(f => this.u(f)));
                    }
                    else {
                        this.g.setFocus([this.u(selection[0])]);
                    }
                    this.g.reveal(this.u(selection[0]));
                }
                else if (this.getSelection().length === 0 && this.getVisibleItemCount() > 0) {
                    this.g.setSelection([0]);
                    this.g.setFocus([0]);
                    this.g.reveal(0);
                }
            }
        }
        toggleVisibility(hide) {
            this.h.classList.toggle('hidden', hide);
        }
        update(resourceMarkers) {
            for (const resourceMarker of resourceMarkers) {
                const index = this.n.indexOf(resourceMarker);
                this.n.splice(index, 1, resourceMarker);
            }
            this.reset(this.n);
        }
        updateMarker(marker) {
            this.g.rerender();
        }
        u(marker) {
            for (let index = 0; index < this.g.length; index++) {
                if (this.g.row(index).marker === marker.marker) {
                    return index;
                }
            }
            return -1;
        }
        w(resource) {
            const selectedElement = this.getSelection();
            if (selectedElement && selectedElement.length > 0) {
                if (selectedElement[0] instanceof markersModel_1.$vSb) {
                    if (resource.has(selectedElement[0].marker.resource)) {
                        return true;
                    }
                }
            }
            return false;
        }
    };
    exports.$OSb = $OSb;
    exports.$OSb = $OSb = __decorate([
        __param(5, instantiation_1.$Ah),
        __param(6, label_1.$Vz)
    ], $OSb);
});
//# sourceMappingURL=markersTable.js.map