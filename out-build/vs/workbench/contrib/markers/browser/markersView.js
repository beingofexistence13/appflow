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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/markers/browser/markersModel", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/markers/browser/markersViewActions", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/markers/browser/messages", "vs/workbench/browser/codeeditor", "vs/platform/theme/common/themeService", "vs/platform/storage/common/storage", "vs/nls!vs/workbench/contrib/markers/browser/markersView", "vs/platform/contextkey/common/contextkey", "vs/base/common/iterator", "vs/base/common/event", "vs/platform/list/browser/listService", "vs/workbench/contrib/markers/browser/markersFilterOptions", "vs/base/common/objects", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/markers/browser/markersTreeViewer", "vs/platform/contextview/browser/contextView", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding", "vs/base/browser/keyboardEvent", "vs/workbench/browser/labels", "vs/platform/markers/common/markers", "vs/workbench/common/memento", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/base/common/map", "vs/workbench/common/editor", "vs/workbench/browser/dnd", "vs/workbench/contrib/markers/browser/markersTable", "vs/workbench/contrib/markers/common/markers", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/css!./media/markers"], function (require, exports, dom, actions_1, telemetry_1, editorService_1, markersModel_1, instantiation_1, markersViewActions_1, configuration_1, messages_1, codeeditor_1, themeService_1, storage_1, nls_1, contextkey_1, iterator_1, event_1, listService_1, markersFilterOptions_1, objects_1, workspace_1, markersTreeViewer_1, contextView_1, actions_2, keybinding_1, keyboardEvent_1, labels_1, markers_1, memento_1, viewPane_1, views_1, opener_1, actionViewItems_1, uriIdentity_1, lifecycle_1, arrays_1, map_1, editor_1, dnd_1, markersTable_1, markers_2, widgetNavigationCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PSb = void 0;
    function createResourceMarkersIterator(resourceMarkers) {
        return iterator_1.Iterable.map(resourceMarkers.markers, m => {
            const relatedInformationIt = iterator_1.Iterable.from(m.relatedInformation);
            const children = iterator_1.Iterable.map(relatedInformationIt, r => ({ element: r }));
            return { element: m, children };
        });
    }
    let $PSb = class $PSb extends viewPane_1.$Jeb {
        constructor(options, instantiationService, viewDescriptorService, hc, configurationService, telemetryService, ic, contextKeyService, jc, contextMenuService, kc, keybindingService, storageService, openerService, themeService) {
            const panelState = new memento_1.$YT(markers_2.Markers.MARKERS_VIEW_STORAGE_ID, storageService).getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            super({
                ...options,
                filterOptions: {
                    ariaLabel: messages_1.default.MARKERS_PANEL_FILTER_ARIA_LABEL,
                    placeholder: messages_1.default.MARKERS_PANEL_FILTER_PLACEHOLDER,
                    focusContextKey: markers_2.MarkersContextKeys.MarkerViewFilterFocusContextKey.key,
                    text: panelState['filter'] || '',
                    history: panelState['filterHistory'] || []
                }
            }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.hc = hc;
            this.ic = ic;
            this.jc = jc;
            this.kc = kc;
            this.c = 0;
            this.h = null;
            this.ab = this.B(new lifecycle_1.$jc());
            this.Wb = this.B(new lifecycle_1.$jc());
            this.bc = 0;
            this.cc = 0;
            this.ec = undefined;
            this.fc = false;
            this.onDidChangeVisibility = this.onDidChangeBodyVisibility;
            this.dc = panelState;
            this.t = this.B(instantiationService.createInstance(markersModel_1.$ySb));
            this.gc = this.B(instantiationService.createInstance(markersTreeViewer_1.$NSb, this.dc['multiline'], this.dc['viewMode'] ?? this.rc()));
            this.B(this.onDidChangeVisibility(visible => this.Ac(visible)));
            this.B(this.gc.onDidChangeViewMode(_ => this.Dc()));
            this.Zb = instantiationService.createInstance(markersTreeViewer_1.$FSb);
            this.Yb = { getId(element) { return element.id; } };
            this.Gc();
            this.L = new markersTreeViewer_1.$LSb(markersFilterOptions_1.$ESb.EMPTY(kc));
            this.s = this.B(this.Bb.createInstance(codeeditor_1.$qrb));
            this.filters = this.B(new markersViewActions_1.$ASb({
                filterHistory: this.dc['filterHistory'] || [],
                showErrors: this.dc['showErrors'] !== false,
                showWarnings: this.dc['showWarnings'] !== false,
                showInfos: this.dc['showInfos'] !== false,
                excludedFiles: !!this.dc['useFilesExclude'],
                activeFile: !!this.dc['activeFile'],
            }, this.zb));
            // Update filter, whenever the "files.exclude" setting is changed
            this.B(this.yb.onDidChangeConfiguration(e => {
                if (this.filters.excludedFiles && e.affectsConfiguration('files.exclude')) {
                    this.qc();
                }
            }));
        }
        render() {
            super.render();
            this.B((0, widgetNavigationCommands_1.$Cmb)({
                focusNotifiers: [this, this.filterWidget],
                focusNextWidget: () => {
                    if (this.filterWidget.hasFocus()) {
                        this.focus();
                    }
                },
                focusPreviousWidget: () => {
                    if (!this.filterWidget.hasFocus()) {
                        this.focusFilter();
                    }
                }
            }));
        }
        U(parent) {
            super.U(parent);
            parent.classList.add('markers-panel');
            this.B(dom.$nO(parent, 'keydown', e => {
                if (this.wb.mightProducePrintableCharacter(new keyboardEvent_1.$jO(e))) {
                    this.focusFilter();
                }
            }));
            const panelContainer = dom.$0O(parent, dom.$('.markers-panel-container'));
            this.wc(panelContainer);
            this.vc(panelContainer);
            this.Xb = dom.$0O(panelContainer, dom.$('.widget-container'));
            this.xc(this.Xb);
            this.qc();
            this.Jc();
        }
        getTitle() {
            return messages_1.default.MARKERS_PANEL_TITLE_PROBLEMS;
        }
        n(height = this.bc, width = this.cc) {
            if (this.$b) {
                this.$b.style.height = `${height}px`;
            }
            this.sb.layout(height, width);
            this.bc = height;
            this.cc = width;
        }
        focus() {
            if (this.sb.getHTMLElement() === document.activeElement) {
                return;
            }
            if (this.Ic()) {
                this.$b.focus();
            }
            else {
                this.sb.domFocus();
                this.sb.setMarkerSelection();
            }
        }
        focusFilter() {
            this.filterWidget.focus();
        }
        updateBadge(total, filtered) {
            this.filterWidget.updateBadge(total === filtered || total === 0 ? undefined : (0, nls_1.localize)(0, null, filtered, total));
        }
        checkMoreFilters() {
            this.filterWidget.checkMoreFilters(!this.filters.showErrors || !this.filters.showWarnings || !this.filters.showInfos || this.filters.excludedFiles || this.filters.activeFile);
        }
        clearFilterText() {
            this.filterWidget.setFilterText('');
        }
        showQuickFixes(marker) {
            const viewModel = this.gc.getViewModel(marker);
            if (viewModel) {
                viewModel.quickFixAction.run();
            }
        }
        openFileAtElement(element, preserveFocus, sideByside, pinned) {
            const { resource, selection } = element instanceof markersModel_1.$vSb ? { resource: element.resource, selection: element.range } :
                element instanceof markersModel_1.$xSb ? { resource: element.raw.resource, selection: element.raw } :
                    'marker' in element ? { resource: element.marker.resource, selection: element.marker.range } :
                        { resource: null, selection: null };
            if (resource && selection) {
                this.hc.openEditor({
                    resource,
                    options: {
                        selection,
                        preserveFocus,
                        pinned,
                        revealIfVisible: true
                    },
                }, sideByside ? editorService_1.$$C : editorService_1.$0C).then(editor => {
                    if (editor && preserveFocus) {
                        this.s.highlightRange({ resource, range: selection }, editor.getControl());
                    }
                    else {
                        this.s.removeHighlightRange();
                    }
                });
                return true;
            }
            else {
                this.s.removeHighlightRange();
            }
            return false;
        }
        nc(markerOrChange) {
            if (this.isVisible()) {
                const hasSelection = this.sb.getSelection().length > 0;
                if (markerOrChange) {
                    if (markerOrChange instanceof markersModel_1.$vSb) {
                        this.sb.updateMarker(markerOrChange);
                    }
                    else {
                        if (markerOrChange.added.size || markerOrChange.removed.size) {
                            // Reset complete widget
                            this.pc();
                        }
                        else {
                            // Update resource
                            this.sb.update([...markerOrChange.updated]);
                        }
                    }
                }
                else {
                    // Reset complete widget
                    this.pc();
                }
                if (hasSelection) {
                    this.sb.setMarkerSelection();
                }
                this.ec = undefined;
                const { total, filtered } = this.getFilterStats();
                this.Xc(total === 0 || filtered === 0);
                this.Kc();
                this.updateBadge(total, filtered);
                this.checkMoreFilters();
            }
        }
        oc(marker) {
            this.nc(marker);
        }
        pc() {
            this.sb.reset(this.uc());
        }
        qc() {
            this.L.options = new markersFilterOptions_1.$ESb(this.filterWidget.getFilterText(), this.sc(), this.filters.showWarnings, this.filters.showErrors, this.filters.showInfos, this.kc);
            this.sb.filterMarkers(this.uc(), this.L.options);
            this.ec = undefined;
            const { total, filtered } = this.getFilterStats();
            this.Xc(total === 0 || filtered === 0);
            this.Kc();
            this.updateBadge(total, filtered);
            this.checkMoreFilters();
        }
        rc() {
            switch (this.yb.getValue('problems.defaultViewMode')) {
                case 'table':
                    return "table" /* MarkersViewMode.Table */;
                case 'tree':
                    return "tree" /* MarkersViewMode.Tree */;
                default:
                    return "tree" /* MarkersViewMode.Tree */;
            }
        }
        sc() {
            if (!this.filters.excludedFiles) {
                return [];
            }
            const workspaceFolders = this.jc.getWorkspace().folders;
            return workspaceFolders.length
                ? workspaceFolders.map(workspaceFolder => ({ root: workspaceFolder.uri, expression: this.tc(workspaceFolder.uri) }))
                : this.tc();
        }
        tc(resource) {
            return (0, objects_1.$Vm)(this.yb.getValue('files.exclude', { resource })) || {};
        }
        uc() {
            if (!this.filters.activeFile) {
                return this.t.resourceMarkers;
            }
            let resourceMarkers = [];
            if (this.h) {
                const activeResourceMarkers = this.t.getResourceMarkers(this.h);
                if (activeResourceMarkers) {
                    resourceMarkers = [activeResourceMarkers];
                }
            }
            return resourceMarkers;
        }
        vc(parent) {
            this.$b = dom.$0O(parent, dom.$('.message-box-container'));
            this.$b.setAttribute('aria-labelledby', 'markers-panel-arialabel');
        }
        wc(parent) {
            this.ac = dom.$0O(parent, dom.$(''));
            this.ac.setAttribute('id', 'markers-panel-arialabel');
        }
        xc(parent) {
            this.sb = this.gc.viewMode === "table" /* MarkersViewMode.Table */ ? this.yc(parent) : this.zc(parent);
            this.Wb.add(this.sb);
            const markerFocusContextKey = markers_2.MarkersContextKeys.MarkerFocusContextKey.bindTo(this.sb.contextKeyService);
            const relatedInformationFocusContextKey = markers_2.MarkersContextKeys.RelatedInformationFocusContextKey.bindTo(this.sb.contextKeyService);
            this.Wb.add(this.sb.onDidChangeFocus(focus => {
                markerFocusContextKey.set(focus.elements.some(e => e instanceof markersModel_1.$vSb));
                relatedInformationFocusContextKey.set(focus.elements.some(e => e instanceof markersModel_1.$xSb));
            }));
            this.Wb.add(event_1.Event.debounce(this.sb.onDidOpen, (last, event) => event, 75, true)(options => {
                this.openFileAtElement(options.element, !!options.editorOptions.preserveFocus, options.sideBySide, !!options.editorOptions.pinned);
            }));
            this.Wb.add(event_1.Event.any(this.sb.onDidChangeSelection, this.sb.onDidChangeFocus)(() => {
                const elements = [...this.sb.getSelection(), ...this.sb.getFocus()];
                for (const element of elements) {
                    if (element instanceof markersModel_1.$vSb) {
                        const viewModel = this.gc.getViewModel(element);
                        viewModel?.showLightBulb();
                    }
                }
            }));
            this.Wb.add(this.sb.onContextMenu(this.Vc, this));
            this.Wb.add(this.sb.onDidChangeSelection(this.Hc, this));
        }
        yc(parent) {
            const table = this.Bb.createInstance(markersTable_1.$OSb, dom.$0O(parent, dom.$('.markers-table-container')), this.gc, this.uc(), this.L.options, {
                accessibilityProvider: this.Zb,
                dnd: this.Bb.createInstance(dnd_1.$Beb, (element) => {
                    if (element instanceof markersModel_1.$wSb) {
                        return (0, opener_1.$QT)(element.resource, element.range);
                    }
                    return null;
                }),
                horizontalScrolling: false,
                identityProvider: this.Yb,
                multipleSelectionSupport: true,
                selectionNavigation: true
            });
            return table;
        }
        zc(parent) {
            const onDidChangeRenderNodeCount = new event_1.$od();
            const treeLabels = this.Bb.createInstance(labels_1.$Llb, this);
            const virtualDelegate = new markersTreeViewer_1.$GSb(this.gc);
            const renderers = [
                this.Bb.createInstance(markersTreeViewer_1.$HSb, treeLabels, onDidChangeRenderNodeCount.event),
                this.Bb.createInstance(markersTreeViewer_1.$JSb, this.gc),
                this.Bb.createInstance(markersTreeViewer_1.$KSb)
            ];
            const tree = this.Bb.createInstance(MarkersTree, 'MarkersView', dom.$0O(parent, dom.$('.tree-container.show-file-icons')), virtualDelegate, renderers, {
                filter: this.L,
                accessibilityProvider: this.Zb,
                identityProvider: this.Yb,
                dnd: this.Bb.createInstance(dnd_1.$Beb, (element) => {
                    if (element instanceof markersModel_1.$uSb) {
                        return element.resource;
                    }
                    if (element instanceof markersModel_1.$vSb) {
                        return (0, opener_1.$QT)(element.resource, element.range);
                    }
                    if (element instanceof markersModel_1.$xSb) {
                        return (0, opener_1.$QT)(element.raw.resource, element.raw);
                    }
                    return null;
                }),
                expandOnlyOnTwistieClick: (e) => e instanceof markersModel_1.$vSb && e.relatedInformation.length > 0,
                overrideStyles: {
                    listBackground: this.Rb()
                },
                selectionNavigation: true,
                multipleSelectionSupport: true,
            });
            onDidChangeRenderNodeCount.input = tree.onDidChangeRenderNodeCount;
            return tree;
        }
        collapseAll() {
            this.sb.collapseMarkers();
        }
        setMultiline(multiline) {
            this.gc.multiline = multiline;
        }
        setViewMode(viewMode) {
            this.gc.viewMode = viewMode;
        }
        Ac(visible) {
            this.ab.clear();
            if (visible) {
                for (const disposable of this.Bc()) {
                    this.ab.add(disposable);
                }
                this.nc();
            }
        }
        Bc() {
            const disposables = [];
            // Markers Model
            const readMarkers = (resource) => this.ic.read({ resource, severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning | markers_1.MarkerSeverity.Info });
            this.t.setResourceMarkers((0, arrays_1.$xb)(readMarkers(), markersModel_1.$tSb).map(group => [group[0].resource, group]));
            disposables.push(event_1.Event.debounce(this.ic.onMarkerChanged, (resourcesMap, resources) => {
                resourcesMap = resourcesMap || new map_1.$zi();
                resources.forEach(resource => resourcesMap.set(resource, resource));
                return resourcesMap;
            }, 64)(resourcesMap => {
                this.t.setResourceMarkers([...resourcesMap.values()].map(resource => [resource, readMarkers(resource)]));
            }));
            disposables.push(event_1.Event.any(this.t.onDidChange, this.hc.onDidActiveEditorChange)(changes => {
                if (changes) {
                    this.Cc(changes);
                }
                else {
                    this.Fc();
                }
            }));
            disposables.push((0, lifecycle_1.$ic)(() => this.t.reset()));
            // Markers View Model
            this.t.resourceMarkers.forEach(resourceMarker => resourceMarker.markers.forEach(marker => this.gc.add(marker)));
            disposables.push(this.gc.onDidChange(marker => this.oc(marker)));
            disposables.push((0, lifecycle_1.$ic)(() => this.t.resourceMarkers.forEach(resourceMarker => this.gc.remove(resourceMarker.resource))));
            // Markers Filters
            disposables.push(this.filters.onDidChange((event) => {
                if (event.activeFile) {
                    this.nc();
                }
                else if (event.excludedFiles || event.showWarnings || event.showErrors || event.showInfos) {
                    this.qc();
                }
            }));
            disposables.push(this.filterWidget.onDidChangeFilterText(e => this.qc()));
            disposables.push((0, lifecycle_1.$ic)(() => { this.ec = undefined; }));
            disposables.push((0, lifecycle_1.$ic)(() => this.s.removeHighlightRange()));
            return disposables;
        }
        Cc(change) {
            const resourceMarkers = [...change.added, ...change.removed, ...change.updated];
            const resources = [];
            for (const { resource } of resourceMarkers) {
                this.gc.remove(resource);
                const resourceMarkers = this.t.getResourceMarkers(resource);
                if (resourceMarkers) {
                    for (const marker of resourceMarkers.markers) {
                        this.gc.add(marker);
                    }
                }
                resources.push(resource);
            }
            this.fc = this.fc || this.Ec(resources);
            this.nc(change);
            this.Tc();
            if (this.fc) {
                this.Rc();
                this.fc = false;
            }
        }
        Dc() {
            if (this.Xb && this.sb) {
                this.Xb.textContent = '';
                this.Wb.clear();
            }
            // Save selection
            const selection = new Set();
            for (const marker of this.sb.getSelection()) {
                if (marker instanceof markersModel_1.$uSb) {
                    marker.markers.forEach(m => selection.add(m));
                }
                else if (marker instanceof markersModel_1.$vSb || marker instanceof markersModel_1.$wSb) {
                    selection.add(marker);
                }
            }
            // Save focus
            const focus = new Set();
            for (const marker of this.sb.getFocus()) {
                if (marker instanceof markersModel_1.$vSb || marker instanceof markersModel_1.$wSb) {
                    focus.add(marker);
                }
            }
            // Create new widget
            this.xc(this.Xb);
            this.nc();
            // Restore selection
            if (selection.size > 0) {
                this.sb.setMarkerSelection(Array.from(selection), Array.from(focus));
                this.sb.domFocus();
            }
        }
        Ec(changedResources) {
            const currentlyActiveResource = this.h;
            if (!currentlyActiveResource) {
                return false;
            }
            const resourceForCurrentActiveResource = this.Sc();
            if (resourceForCurrentActiveResource) {
                return false;
            }
            return changedResources.some(r => r.toString() === currentlyActiveResource.toString());
        }
        Fc() {
            this.Gc();
            if (this.filters.activeFile) {
                this.nc();
            }
            this.Rc();
        }
        Gc() {
            const activeEditor = this.hc.activeEditor;
            this.h = activeEditor ? editor_1.$3E.getOriginalUri(activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }) ?? null : null;
        }
        Hc() {
            const selection = this.sb.getSelection();
            if (selection && selection.length > 0) {
                this.c = this.sb.getRelativeTop(selection[0]) || 0;
            }
        }
        Ic() {
            const { total, filtered } = this.getFilterStats();
            return total === 0 || filtered === 0;
        }
        Jc() {
            this.ec = undefined;
            this.pc();
            this.Xc(this.Ic());
            this.Kc();
        }
        Kc() {
            if (!this.$b || !this.ac) {
                return;
            }
            dom.$lO(this.$b);
            const { total, filtered } = this.getFilterStats();
            if (filtered === 0) {
                this.$b.style.display = 'block';
                this.$b.setAttribute('tabIndex', '0');
                if (this.filters.activeFile) {
                    this.Lc(this.$b);
                }
                else {
                    if (total > 0) {
                        this.Mc(this.$b);
                    }
                    else {
                        this.Oc(this.$b);
                    }
                }
            }
            else {
                this.$b.style.display = 'none';
                if (filtered === total) {
                    this.Pc((0, nls_1.localize)(1, null, total));
                }
                else {
                    this.Pc((0, nls_1.localize)(2, null, filtered, total));
                }
                this.$b.removeAttribute('tabIndex');
            }
        }
        Lc(container) {
            if (this.h && this.t.getResourceMarkers(this.h)) {
                this.Mc(container);
            }
            else {
                this.Nc(container);
            }
        }
        Mc(container) {
            const span1 = dom.$0O(container, dom.$('span'));
            span1.textContent = messages_1.default.MARKERS_PANEL_NO_PROBLEMS_FILTERS;
            const link = dom.$0O(container, dom.$('a.messageAction'));
            link.textContent = (0, nls_1.localize)(3, null);
            link.setAttribute('tabIndex', '0');
            const span2 = dom.$0O(container, dom.$('span'));
            span2.textContent = '.';
            dom.$oO(link, dom.$3O.CLICK, () => this.Qc());
            dom.$oO(link, dom.$3O.KEY_DOWN, (e) => {
                if (e.equals(3 /* KeyCode.Enter */) || e.equals(10 /* KeyCode.Space */)) {
                    this.Qc();
                    e.stopPropagation();
                }
            });
            this.Pc(messages_1.default.MARKERS_PANEL_NO_PROBLEMS_FILTERS);
        }
        Nc(container) {
            const span = dom.$0O(container, dom.$('span'));
            span.textContent = messages_1.default.MARKERS_PANEL_NO_PROBLEMS_ACTIVE_FILE_BUILT;
            this.Pc(messages_1.default.MARKERS_PANEL_NO_PROBLEMS_ACTIVE_FILE_BUILT);
        }
        Oc(container) {
            const span = dom.$0O(container, dom.$('span'));
            span.textContent = messages_1.default.MARKERS_PANEL_NO_PROBLEMS_BUILT;
            this.Pc(messages_1.default.MARKERS_PANEL_NO_PROBLEMS_BUILT);
        }
        Pc(label) {
            this.sb.setAriaLabel(label);
            this.ac.setAttribute('aria-label', label);
        }
        Qc() {
            this.filterWidget.setFilterText('');
            this.filters.excludedFiles = false;
            this.filters.showErrors = true;
            this.filters.showWarnings = true;
            this.filters.showInfos = true;
        }
        Rc(focus = false) {
            // No need to auto reveal if active file filter is on
            if (this.filters.activeFile) {
                return;
            }
            const autoReveal = this.yb.getValue('problems.autoReveal');
            if (typeof autoReveal === 'boolean' && autoReveal) {
                const currentActiveResource = this.Sc();
                this.sb.revealMarkers(currentActiveResource, focus, this.c);
            }
        }
        Sc() {
            return this.h ? this.t.getResourceMarkers(this.h) : null;
        }
        Tc() {
            this.s.removeHighlightRange();
            if (this.sb.getHTMLElement() === document.activeElement) {
                this.Uc();
            }
        }
        Uc() {
            const selections = this.sb.getSelection() ?? [];
            if (selections.length !== 1) {
                return;
            }
            const selection = selections[0];
            if (!(selection instanceof markersModel_1.$vSb)) {
                return;
            }
            this.s.highlightRange(selection);
        }
        Vc(e) {
            const element = e.element;
            if (!element) {
                return;
            }
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
            this.xb.showContextMenu({
                getAnchor: () => e.anchor,
                menuId: actions_2.$Ru.ProblemsPanelContext,
                contextKeyService: this.sb.contextKeyService,
                getActions: () => this.Wc(element),
                getActionViewItem: (action) => {
                    const keybinding = this.wb.lookupKeybinding(action.id);
                    if (keybinding) {
                        return new actionViewItems_1.$NQ(action, action, { label: true, keybinding: keybinding.getLabel() });
                    }
                    return undefined;
                },
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.sb.domFocus();
                    }
                }
            });
        }
        Wc(element) {
            const result = [];
            if (element instanceof markersModel_1.$vSb) {
                const viewModel = this.gc.getViewModel(element);
                if (viewModel) {
                    const quickFixActions = viewModel.quickFixAction.quickFixes;
                    if (quickFixActions.length) {
                        result.push(...quickFixActions);
                        result.push(new actions_1.$ii());
                    }
                }
            }
            return result;
        }
        getFocusElement() {
            return this.sb.getFocus()[0] ?? undefined;
        }
        getFocusedSelectedElements() {
            const focus = this.getFocusElement();
            if (!focus) {
                return null;
            }
            const selection = this.sb.getSelection();
            if (selection.includes(focus)) {
                const result = [];
                for (const selected of selection) {
                    if (selected) {
                        result.push(selected);
                    }
                }
                return result;
            }
            else {
                return [focus];
            }
        }
        getAllResourceMarkers() {
            return this.t.resourceMarkers;
        }
        getFilterStats() {
            if (!this.ec) {
                this.ec = {
                    total: this.t.total,
                    filtered: this.sb?.getVisibleItemCount() ?? 0
                };
            }
            return this.ec;
        }
        Xc(hide) {
            this.sb.toggleVisibility(hide);
            this.n();
        }
        saveState() {
            this.dc['filter'] = this.filterWidget.getFilterText();
            this.dc['filterHistory'] = this.filters.filterHistory;
            this.dc['showErrors'] = this.filters.showErrors;
            this.dc['showWarnings'] = this.filters.showWarnings;
            this.dc['showInfos'] = this.filters.showInfos;
            this.dc['useFilesExclude'] = this.filters.excludedFiles;
            this.dc['activeFile'] = this.filters.activeFile;
            this.dc['multiline'] = this.gc.multiline;
            this.dc['viewMode'] = this.gc.viewMode;
            super.saveState();
        }
        dispose() {
            super.dispose();
        }
    };
    exports.$PSb = $PSb;
    exports.$PSb = $PSb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, views_1.$_E),
        __param(3, editorService_1.$9C),
        __param(4, configuration_1.$8h),
        __param(5, telemetry_1.$9k),
        __param(6, markers_1.$3s),
        __param(7, contextkey_1.$3i),
        __param(8, workspace_1.$Kh),
        __param(9, contextView_1.$WZ),
        __param(10, uriIdentity_1.$Ck),
        __param(11, keybinding_1.$2D),
        __param(12, storage_1.$Vo),
        __param(13, opener_1.$NT),
        __param(14, themeService_1.$gv)
    ], $PSb);
    let MarkersTree = class MarkersTree extends listService_1.$t4 {
        constructor(user, b, delegate, renderers, options, instantiationService, contextKeyService, listService, themeService, configurationService) {
            super(user, b, delegate, renderers, options, instantiationService, contextKeyService, listService, configurationService);
            this.b = b;
            this.a = markers_2.MarkersContextKeys.MarkersTreeVisibilityContextKey.bindTo(contextKeyService);
        }
        collapseMarkers() {
            this.collapseAll();
            this.setSelection([]);
            this.setFocus([]);
            this.getHTMLElement().focus();
            this.focusFirst();
        }
        filterMarkers() {
            this.refilter();
        }
        getVisibleItemCount() {
            let filtered = 0;
            const root = this.getNode();
            for (const resourceMarkerNode of root.children) {
                for (const markerNode of resourceMarkerNode.children) {
                    if (resourceMarkerNode.visible && markerNode.visible) {
                        filtered++;
                    }
                }
            }
            return filtered;
        }
        isVisible() {
            return !this.b.classList.contains('hidden');
        }
        toggleVisibility(hide) {
            this.a.set(!hide);
            this.b.classList.toggle('hidden', hide);
        }
        reset(resourceMarkers) {
            this.setChildren(null, iterator_1.Iterable.map(resourceMarkers, m => ({ element: m, children: createResourceMarkersIterator(m) })));
        }
        revealMarkers(activeResource, focus, lastSelectedRelativeTop) {
            if (activeResource) {
                if (this.hasElement(activeResource)) {
                    if (!this.isCollapsed(activeResource) && this.g(activeResource)) {
                        this.reveal(this.getSelection()[0], lastSelectedRelativeTop);
                        if (focus) {
                            this.setFocus(this.getSelection());
                        }
                    }
                    else {
                        this.expand(activeResource);
                        this.reveal(activeResource, 0);
                        if (focus) {
                            this.setFocus([activeResource]);
                            this.setSelection([activeResource]);
                        }
                    }
                }
            }
            else if (focus) {
                this.setSelection([]);
                this.focusFirst();
            }
        }
        setAriaLabel(label) {
            this.ariaLabel = label;
        }
        setMarkerSelection(selection, focus) {
            if (this.isVisible()) {
                if (selection && selection.length > 0) {
                    this.setSelection(selection.map(m => this.c(m)));
                    if (focus && focus.length > 0) {
                        this.setFocus(focus.map(f => this.c(f)));
                    }
                    else {
                        this.setFocus([this.c(selection[0])]);
                    }
                    this.reveal(this.c(selection[0]));
                }
                else if (this.getSelection().length === 0) {
                    const firstVisibleElement = this.firstVisibleElement;
                    const marker = firstVisibleElement ?
                        firstVisibleElement instanceof markersModel_1.$uSb ? firstVisibleElement.markers[0] :
                            firstVisibleElement instanceof markersModel_1.$vSb ? firstVisibleElement : undefined
                        : undefined;
                    if (marker) {
                        this.setSelection([marker]);
                        this.setFocus([marker]);
                        this.reveal(marker);
                    }
                }
            }
        }
        update(resourceMarkers) {
            for (const resourceMarker of resourceMarkers) {
                this.setChildren(resourceMarker, createResourceMarkersIterator(resourceMarker));
                this.rerender(resourceMarker);
            }
        }
        updateMarker(marker) {
            this.rerender(marker);
        }
        c(marker) {
            for (const resourceNode of this.getNode().children) {
                for (const markerNode of resourceNode.children) {
                    if (markerNode.element instanceof markersModel_1.$vSb && markerNode.element.marker === marker.marker) {
                        return markerNode.element;
                    }
                }
            }
            return null;
        }
        g(resource) {
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
        dispose() {
            super.dispose();
        }
        layout(height, width) {
            this.b.style.height = `${height}px`;
            super.layout(height, width);
        }
    };
    MarkersTree = __decorate([
        __param(5, instantiation_1.$Ah),
        __param(6, contextkey_1.$3i),
        __param(7, listService_1.$03),
        __param(8, themeService_1.$gv),
        __param(9, configuration_1.$8h)
    ], MarkersTree);
});
//# sourceMappingURL=markersView.js.map