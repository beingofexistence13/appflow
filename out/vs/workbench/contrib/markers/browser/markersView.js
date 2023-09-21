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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/markers/browser/markersModel", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/markers/browser/markersViewActions", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/markers/browser/messages", "vs/workbench/browser/codeeditor", "vs/platform/theme/common/themeService", "vs/platform/storage/common/storage", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/base/common/iterator", "vs/base/common/event", "vs/platform/list/browser/listService", "vs/workbench/contrib/markers/browser/markersFilterOptions", "vs/base/common/objects", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/markers/browser/markersTreeViewer", "vs/platform/contextview/browser/contextView", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding", "vs/base/browser/keyboardEvent", "vs/workbench/browser/labels", "vs/platform/markers/common/markers", "vs/workbench/common/memento", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/base/common/map", "vs/workbench/common/editor", "vs/workbench/browser/dnd", "vs/workbench/contrib/markers/browser/markersTable", "vs/workbench/contrib/markers/common/markers", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/css!./media/markers"], function (require, exports, dom, actions_1, telemetry_1, editorService_1, markersModel_1, instantiation_1, markersViewActions_1, configuration_1, messages_1, codeeditor_1, themeService_1, storage_1, nls_1, contextkey_1, iterator_1, event_1, listService_1, markersFilterOptions_1, objects_1, workspace_1, markersTreeViewer_1, contextView_1, actions_2, keybinding_1, keyboardEvent_1, labels_1, markers_1, memento_1, viewPane_1, views_1, opener_1, actionViewItems_1, uriIdentity_1, lifecycle_1, arrays_1, map_1, editor_1, dnd_1, markersTable_1, markers_2, widgetNavigationCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkersView = void 0;
    function createResourceMarkersIterator(resourceMarkers) {
        return iterator_1.Iterable.map(resourceMarkers.markers, m => {
            const relatedInformationIt = iterator_1.Iterable.from(m.relatedInformation);
            const children = iterator_1.Iterable.map(relatedInformationIt, r => ({ element: r }));
            return { element: m, children };
        });
    }
    let MarkersView = class MarkersView extends viewPane_1.FilterViewPane {
        constructor(options, instantiationService, viewDescriptorService, editorService, configurationService, telemetryService, markerService, contextKeyService, workspaceContextService, contextMenuService, uriIdentityService, keybindingService, storageService, openerService, themeService) {
            const panelState = new memento_1.Memento(markers_2.Markers.MARKERS_VIEW_STORAGE_ID, storageService).getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
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
            this.editorService = editorService;
            this.markerService = markerService;
            this.workspaceContextService = workspaceContextService;
            this.uriIdentityService = uriIdentityService;
            this.lastSelectedRelativeTop = 0;
            this.currentActiveResource = null;
            this.onVisibleDisposables = this._register(new lifecycle_1.DisposableStore());
            this.widgetDisposables = this._register(new lifecycle_1.DisposableStore());
            this.currentHeight = 0;
            this.currentWidth = 0;
            this.cachedFilterStats = undefined;
            this.currentResourceGotAddedToMarkersData = false;
            this.onDidChangeVisibility = this.onDidChangeBodyVisibility;
            this.panelState = panelState;
            this.markersModel = this._register(instantiationService.createInstance(markersModel_1.MarkersModel));
            this.markersViewModel = this._register(instantiationService.createInstance(markersTreeViewer_1.MarkersViewModel, this.panelState['multiline'], this.panelState['viewMode'] ?? this.getDefaultViewMode()));
            this._register(this.onDidChangeVisibility(visible => this.onDidChangeMarkersViewVisibility(visible)));
            this._register(this.markersViewModel.onDidChangeViewMode(_ => this.onDidChangeViewMode()));
            this.widgetAccessibilityProvider = instantiationService.createInstance(markersTreeViewer_1.MarkersWidgetAccessibilityProvider);
            this.widgetIdentityProvider = { getId(element) { return element.id; } };
            this.setCurrentActiveEditor();
            this.filter = new markersTreeViewer_1.Filter(markersFilterOptions_1.FilterOptions.EMPTY(uriIdentityService));
            this.rangeHighlightDecorations = this._register(this.instantiationService.createInstance(codeeditor_1.RangeHighlightDecorations));
            this.filters = this._register(new markersViewActions_1.MarkersFilters({
                filterHistory: this.panelState['filterHistory'] || [],
                showErrors: this.panelState['showErrors'] !== false,
                showWarnings: this.panelState['showWarnings'] !== false,
                showInfos: this.panelState['showInfos'] !== false,
                excludedFiles: !!this.panelState['useFilesExclude'],
                activeFile: !!this.panelState['activeFile'],
            }, this.contextKeyService));
            // Update filter, whenever the "files.exclude" setting is changed
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (this.filters.excludedFiles && e.affectsConfiguration('files.exclude')) {
                    this.updateFilter();
                }
            }));
        }
        render() {
            super.render();
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
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
        renderBody(parent) {
            super.renderBody(parent);
            parent.classList.add('markers-panel');
            this._register(dom.addDisposableListener(parent, 'keydown', e => {
                if (this.keybindingService.mightProducePrintableCharacter(new keyboardEvent_1.StandardKeyboardEvent(e))) {
                    this.focusFilter();
                }
            }));
            const panelContainer = dom.append(parent, dom.$('.markers-panel-container'));
            this.createArialLabelElement(panelContainer);
            this.createMessageBox(panelContainer);
            this.widgetContainer = dom.append(panelContainer, dom.$('.widget-container'));
            this.createWidget(this.widgetContainer);
            this.updateFilter();
            this.renderContent();
        }
        getTitle() {
            return messages_1.default.MARKERS_PANEL_TITLE_PROBLEMS;
        }
        layoutBodyContent(height = this.currentHeight, width = this.currentWidth) {
            if (this.messageBoxContainer) {
                this.messageBoxContainer.style.height = `${height}px`;
            }
            this.widget.layout(height, width);
            this.currentHeight = height;
            this.currentWidth = width;
        }
        focus() {
            if (this.widget.getHTMLElement() === document.activeElement) {
                return;
            }
            if (this.hasNoProblems()) {
                this.messageBoxContainer.focus();
            }
            else {
                this.widget.domFocus();
                this.widget.setMarkerSelection();
            }
        }
        focusFilter() {
            this.filterWidget.focus();
        }
        updateBadge(total, filtered) {
            this.filterWidget.updateBadge(total === filtered || total === 0 ? undefined : (0, nls_1.localize)('showing filtered problems', "Showing {0} of {1}", filtered, total));
        }
        checkMoreFilters() {
            this.filterWidget.checkMoreFilters(!this.filters.showErrors || !this.filters.showWarnings || !this.filters.showInfos || this.filters.excludedFiles || this.filters.activeFile);
        }
        clearFilterText() {
            this.filterWidget.setFilterText('');
        }
        showQuickFixes(marker) {
            const viewModel = this.markersViewModel.getViewModel(marker);
            if (viewModel) {
                viewModel.quickFixAction.run();
            }
        }
        openFileAtElement(element, preserveFocus, sideByside, pinned) {
            const { resource, selection } = element instanceof markersModel_1.Marker ? { resource: element.resource, selection: element.range } :
                element instanceof markersModel_1.RelatedInformation ? { resource: element.raw.resource, selection: element.raw } :
                    'marker' in element ? { resource: element.marker.resource, selection: element.marker.range } :
                        { resource: null, selection: null };
            if (resource && selection) {
                this.editorService.openEditor({
                    resource,
                    options: {
                        selection,
                        preserveFocus,
                        pinned,
                        revealIfVisible: true
                    },
                }, sideByside ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP).then(editor => {
                    if (editor && preserveFocus) {
                        this.rangeHighlightDecorations.highlightRange({ resource, range: selection }, editor.getControl());
                    }
                    else {
                        this.rangeHighlightDecorations.removeHighlightRange();
                    }
                });
                return true;
            }
            else {
                this.rangeHighlightDecorations.removeHighlightRange();
            }
            return false;
        }
        refreshPanel(markerOrChange) {
            if (this.isVisible()) {
                const hasSelection = this.widget.getSelection().length > 0;
                if (markerOrChange) {
                    if (markerOrChange instanceof markersModel_1.Marker) {
                        this.widget.updateMarker(markerOrChange);
                    }
                    else {
                        if (markerOrChange.added.size || markerOrChange.removed.size) {
                            // Reset complete widget
                            this.resetWidget();
                        }
                        else {
                            // Update resource
                            this.widget.update([...markerOrChange.updated]);
                        }
                    }
                }
                else {
                    // Reset complete widget
                    this.resetWidget();
                }
                if (hasSelection) {
                    this.widget.setMarkerSelection();
                }
                this.cachedFilterStats = undefined;
                const { total, filtered } = this.getFilterStats();
                this.toggleVisibility(total === 0 || filtered === 0);
                this.renderMessage();
                this.updateBadge(total, filtered);
                this.checkMoreFilters();
            }
        }
        onDidChangeViewState(marker) {
            this.refreshPanel(marker);
        }
        resetWidget() {
            this.widget.reset(this.getResourceMarkers());
        }
        updateFilter() {
            this.filter.options = new markersFilterOptions_1.FilterOptions(this.filterWidget.getFilterText(), this.getFilesExcludeExpressions(), this.filters.showWarnings, this.filters.showErrors, this.filters.showInfos, this.uriIdentityService);
            this.widget.filterMarkers(this.getResourceMarkers(), this.filter.options);
            this.cachedFilterStats = undefined;
            const { total, filtered } = this.getFilterStats();
            this.toggleVisibility(total === 0 || filtered === 0);
            this.renderMessage();
            this.updateBadge(total, filtered);
            this.checkMoreFilters();
        }
        getDefaultViewMode() {
            switch (this.configurationService.getValue('problems.defaultViewMode')) {
                case 'table':
                    return "table" /* MarkersViewMode.Table */;
                case 'tree':
                    return "tree" /* MarkersViewMode.Tree */;
                default:
                    return "tree" /* MarkersViewMode.Tree */;
            }
        }
        getFilesExcludeExpressions() {
            if (!this.filters.excludedFiles) {
                return [];
            }
            const workspaceFolders = this.workspaceContextService.getWorkspace().folders;
            return workspaceFolders.length
                ? workspaceFolders.map(workspaceFolder => ({ root: workspaceFolder.uri, expression: this.getFilesExclude(workspaceFolder.uri) }))
                : this.getFilesExclude();
        }
        getFilesExclude(resource) {
            return (0, objects_1.deepClone)(this.configurationService.getValue('files.exclude', { resource })) || {};
        }
        getResourceMarkers() {
            if (!this.filters.activeFile) {
                return this.markersModel.resourceMarkers;
            }
            let resourceMarkers = [];
            if (this.currentActiveResource) {
                const activeResourceMarkers = this.markersModel.getResourceMarkers(this.currentActiveResource);
                if (activeResourceMarkers) {
                    resourceMarkers = [activeResourceMarkers];
                }
            }
            return resourceMarkers;
        }
        createMessageBox(parent) {
            this.messageBoxContainer = dom.append(parent, dom.$('.message-box-container'));
            this.messageBoxContainer.setAttribute('aria-labelledby', 'markers-panel-arialabel');
        }
        createArialLabelElement(parent) {
            this.ariaLabelElement = dom.append(parent, dom.$(''));
            this.ariaLabelElement.setAttribute('id', 'markers-panel-arialabel');
        }
        createWidget(parent) {
            this.widget = this.markersViewModel.viewMode === "table" /* MarkersViewMode.Table */ ? this.createTable(parent) : this.createTree(parent);
            this.widgetDisposables.add(this.widget);
            const markerFocusContextKey = markers_2.MarkersContextKeys.MarkerFocusContextKey.bindTo(this.widget.contextKeyService);
            const relatedInformationFocusContextKey = markers_2.MarkersContextKeys.RelatedInformationFocusContextKey.bindTo(this.widget.contextKeyService);
            this.widgetDisposables.add(this.widget.onDidChangeFocus(focus => {
                markerFocusContextKey.set(focus.elements.some(e => e instanceof markersModel_1.Marker));
                relatedInformationFocusContextKey.set(focus.elements.some(e => e instanceof markersModel_1.RelatedInformation));
            }));
            this.widgetDisposables.add(event_1.Event.debounce(this.widget.onDidOpen, (last, event) => event, 75, true)(options => {
                this.openFileAtElement(options.element, !!options.editorOptions.preserveFocus, options.sideBySide, !!options.editorOptions.pinned);
            }));
            this.widgetDisposables.add(event_1.Event.any(this.widget.onDidChangeSelection, this.widget.onDidChangeFocus)(() => {
                const elements = [...this.widget.getSelection(), ...this.widget.getFocus()];
                for (const element of elements) {
                    if (element instanceof markersModel_1.Marker) {
                        const viewModel = this.markersViewModel.getViewModel(element);
                        viewModel?.showLightBulb();
                    }
                }
            }));
            this.widgetDisposables.add(this.widget.onContextMenu(this.onContextMenu, this));
            this.widgetDisposables.add(this.widget.onDidChangeSelection(this.onSelected, this));
        }
        createTable(parent) {
            const table = this.instantiationService.createInstance(markersTable_1.MarkersTable, dom.append(parent, dom.$('.markers-table-container')), this.markersViewModel, this.getResourceMarkers(), this.filter.options, {
                accessibilityProvider: this.widgetAccessibilityProvider,
                dnd: this.instantiationService.createInstance(dnd_1.ResourceListDnDHandler, (element) => {
                    if (element instanceof markersModel_1.MarkerTableItem) {
                        return (0, opener_1.withSelection)(element.resource, element.range);
                    }
                    return null;
                }),
                horizontalScrolling: false,
                identityProvider: this.widgetIdentityProvider,
                multipleSelectionSupport: true,
                selectionNavigation: true
            });
            return table;
        }
        createTree(parent) {
            const onDidChangeRenderNodeCount = new event_1.Relay();
            const treeLabels = this.instantiationService.createInstance(labels_1.ResourceLabels, this);
            const virtualDelegate = new markersTreeViewer_1.VirtualDelegate(this.markersViewModel);
            const renderers = [
                this.instantiationService.createInstance(markersTreeViewer_1.ResourceMarkersRenderer, treeLabels, onDidChangeRenderNodeCount.event),
                this.instantiationService.createInstance(markersTreeViewer_1.MarkerRenderer, this.markersViewModel),
                this.instantiationService.createInstance(markersTreeViewer_1.RelatedInformationRenderer)
            ];
            const tree = this.instantiationService.createInstance(MarkersTree, 'MarkersView', dom.append(parent, dom.$('.tree-container.show-file-icons')), virtualDelegate, renderers, {
                filter: this.filter,
                accessibilityProvider: this.widgetAccessibilityProvider,
                identityProvider: this.widgetIdentityProvider,
                dnd: this.instantiationService.createInstance(dnd_1.ResourceListDnDHandler, (element) => {
                    if (element instanceof markersModel_1.ResourceMarkers) {
                        return element.resource;
                    }
                    if (element instanceof markersModel_1.Marker) {
                        return (0, opener_1.withSelection)(element.resource, element.range);
                    }
                    if (element instanceof markersModel_1.RelatedInformation) {
                        return (0, opener_1.withSelection)(element.raw.resource, element.raw);
                    }
                    return null;
                }),
                expandOnlyOnTwistieClick: (e) => e instanceof markersModel_1.Marker && e.relatedInformation.length > 0,
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                },
                selectionNavigation: true,
                multipleSelectionSupport: true,
            });
            onDidChangeRenderNodeCount.input = tree.onDidChangeRenderNodeCount;
            return tree;
        }
        collapseAll() {
            this.widget.collapseMarkers();
        }
        setMultiline(multiline) {
            this.markersViewModel.multiline = multiline;
        }
        setViewMode(viewMode) {
            this.markersViewModel.viewMode = viewMode;
        }
        onDidChangeMarkersViewVisibility(visible) {
            this.onVisibleDisposables.clear();
            if (visible) {
                for (const disposable of this.reInitialize()) {
                    this.onVisibleDisposables.add(disposable);
                }
                this.refreshPanel();
            }
        }
        reInitialize() {
            const disposables = [];
            // Markers Model
            const readMarkers = (resource) => this.markerService.read({ resource, severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning | markers_1.MarkerSeverity.Info });
            this.markersModel.setResourceMarkers((0, arrays_1.groupBy)(readMarkers(), markersModel_1.compareMarkersByUri).map(group => [group[0].resource, group]));
            disposables.push(event_1.Event.debounce(this.markerService.onMarkerChanged, (resourcesMap, resources) => {
                resourcesMap = resourcesMap || new map_1.ResourceMap();
                resources.forEach(resource => resourcesMap.set(resource, resource));
                return resourcesMap;
            }, 64)(resourcesMap => {
                this.markersModel.setResourceMarkers([...resourcesMap.values()].map(resource => [resource, readMarkers(resource)]));
            }));
            disposables.push(event_1.Event.any(this.markersModel.onDidChange, this.editorService.onDidActiveEditorChange)(changes => {
                if (changes) {
                    this.onDidChangeModel(changes);
                }
                else {
                    this.onActiveEditorChanged();
                }
            }));
            disposables.push((0, lifecycle_1.toDisposable)(() => this.markersModel.reset()));
            // Markers View Model
            this.markersModel.resourceMarkers.forEach(resourceMarker => resourceMarker.markers.forEach(marker => this.markersViewModel.add(marker)));
            disposables.push(this.markersViewModel.onDidChange(marker => this.onDidChangeViewState(marker)));
            disposables.push((0, lifecycle_1.toDisposable)(() => this.markersModel.resourceMarkers.forEach(resourceMarker => this.markersViewModel.remove(resourceMarker.resource))));
            // Markers Filters
            disposables.push(this.filters.onDidChange((event) => {
                if (event.activeFile) {
                    this.refreshPanel();
                }
                else if (event.excludedFiles || event.showWarnings || event.showErrors || event.showInfos) {
                    this.updateFilter();
                }
            }));
            disposables.push(this.filterWidget.onDidChangeFilterText(e => this.updateFilter()));
            disposables.push((0, lifecycle_1.toDisposable)(() => { this.cachedFilterStats = undefined; }));
            disposables.push((0, lifecycle_1.toDisposable)(() => this.rangeHighlightDecorations.removeHighlightRange()));
            return disposables;
        }
        onDidChangeModel(change) {
            const resourceMarkers = [...change.added, ...change.removed, ...change.updated];
            const resources = [];
            for (const { resource } of resourceMarkers) {
                this.markersViewModel.remove(resource);
                const resourceMarkers = this.markersModel.getResourceMarkers(resource);
                if (resourceMarkers) {
                    for (const marker of resourceMarkers.markers) {
                        this.markersViewModel.add(marker);
                    }
                }
                resources.push(resource);
            }
            this.currentResourceGotAddedToMarkersData = this.currentResourceGotAddedToMarkersData || this.isCurrentResourceGotAddedToMarkersData(resources);
            this.refreshPanel(change);
            this.updateRangeHighlights();
            if (this.currentResourceGotAddedToMarkersData) {
                this.autoReveal();
                this.currentResourceGotAddedToMarkersData = false;
            }
        }
        onDidChangeViewMode() {
            if (this.widgetContainer && this.widget) {
                this.widgetContainer.textContent = '';
                this.widgetDisposables.clear();
            }
            // Save selection
            const selection = new Set();
            for (const marker of this.widget.getSelection()) {
                if (marker instanceof markersModel_1.ResourceMarkers) {
                    marker.markers.forEach(m => selection.add(m));
                }
                else if (marker instanceof markersModel_1.Marker || marker instanceof markersModel_1.MarkerTableItem) {
                    selection.add(marker);
                }
            }
            // Save focus
            const focus = new Set();
            for (const marker of this.widget.getFocus()) {
                if (marker instanceof markersModel_1.Marker || marker instanceof markersModel_1.MarkerTableItem) {
                    focus.add(marker);
                }
            }
            // Create new widget
            this.createWidget(this.widgetContainer);
            this.refreshPanel();
            // Restore selection
            if (selection.size > 0) {
                this.widget.setMarkerSelection(Array.from(selection), Array.from(focus));
                this.widget.domFocus();
            }
        }
        isCurrentResourceGotAddedToMarkersData(changedResources) {
            const currentlyActiveResource = this.currentActiveResource;
            if (!currentlyActiveResource) {
                return false;
            }
            const resourceForCurrentActiveResource = this.getResourceForCurrentActiveResource();
            if (resourceForCurrentActiveResource) {
                return false;
            }
            return changedResources.some(r => r.toString() === currentlyActiveResource.toString());
        }
        onActiveEditorChanged() {
            this.setCurrentActiveEditor();
            if (this.filters.activeFile) {
                this.refreshPanel();
            }
            this.autoReveal();
        }
        setCurrentActiveEditor() {
            const activeEditor = this.editorService.activeEditor;
            this.currentActiveResource = activeEditor ? editor_1.EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }) ?? null : null;
        }
        onSelected() {
            const selection = this.widget.getSelection();
            if (selection && selection.length > 0) {
                this.lastSelectedRelativeTop = this.widget.getRelativeTop(selection[0]) || 0;
            }
        }
        hasNoProblems() {
            const { total, filtered } = this.getFilterStats();
            return total === 0 || filtered === 0;
        }
        renderContent() {
            this.cachedFilterStats = undefined;
            this.resetWidget();
            this.toggleVisibility(this.hasNoProblems());
            this.renderMessage();
        }
        renderMessage() {
            if (!this.messageBoxContainer || !this.ariaLabelElement) {
                return;
            }
            dom.clearNode(this.messageBoxContainer);
            const { total, filtered } = this.getFilterStats();
            if (filtered === 0) {
                this.messageBoxContainer.style.display = 'block';
                this.messageBoxContainer.setAttribute('tabIndex', '0');
                if (this.filters.activeFile) {
                    this.renderFilterMessageForActiveFile(this.messageBoxContainer);
                }
                else {
                    if (total > 0) {
                        this.renderFilteredByFilterMessage(this.messageBoxContainer);
                    }
                    else {
                        this.renderNoProblemsMessage(this.messageBoxContainer);
                    }
                }
            }
            else {
                this.messageBoxContainer.style.display = 'none';
                if (filtered === total) {
                    this.setAriaLabel((0, nls_1.localize)('No problems filtered', "Showing {0} problems", total));
                }
                else {
                    this.setAriaLabel((0, nls_1.localize)('problems filtered', "Showing {0} of {1} problems", filtered, total));
                }
                this.messageBoxContainer.removeAttribute('tabIndex');
            }
        }
        renderFilterMessageForActiveFile(container) {
            if (this.currentActiveResource && this.markersModel.getResourceMarkers(this.currentActiveResource)) {
                this.renderFilteredByFilterMessage(container);
            }
            else {
                this.renderNoProblemsMessageForActiveFile(container);
            }
        }
        renderFilteredByFilterMessage(container) {
            const span1 = dom.append(container, dom.$('span'));
            span1.textContent = messages_1.default.MARKERS_PANEL_NO_PROBLEMS_FILTERS;
            const link = dom.append(container, dom.$('a.messageAction'));
            link.textContent = (0, nls_1.localize)('clearFilter', "Clear Filters");
            link.setAttribute('tabIndex', '0');
            const span2 = dom.append(container, dom.$('span'));
            span2.textContent = '.';
            dom.addStandardDisposableListener(link, dom.EventType.CLICK, () => this.clearFilters());
            dom.addStandardDisposableListener(link, dom.EventType.KEY_DOWN, (e) => {
                if (e.equals(3 /* KeyCode.Enter */) || e.equals(10 /* KeyCode.Space */)) {
                    this.clearFilters();
                    e.stopPropagation();
                }
            });
            this.setAriaLabel(messages_1.default.MARKERS_PANEL_NO_PROBLEMS_FILTERS);
        }
        renderNoProblemsMessageForActiveFile(container) {
            const span = dom.append(container, dom.$('span'));
            span.textContent = messages_1.default.MARKERS_PANEL_NO_PROBLEMS_ACTIVE_FILE_BUILT;
            this.setAriaLabel(messages_1.default.MARKERS_PANEL_NO_PROBLEMS_ACTIVE_FILE_BUILT);
        }
        renderNoProblemsMessage(container) {
            const span = dom.append(container, dom.$('span'));
            span.textContent = messages_1.default.MARKERS_PANEL_NO_PROBLEMS_BUILT;
            this.setAriaLabel(messages_1.default.MARKERS_PANEL_NO_PROBLEMS_BUILT);
        }
        setAriaLabel(label) {
            this.widget.setAriaLabel(label);
            this.ariaLabelElement.setAttribute('aria-label', label);
        }
        clearFilters() {
            this.filterWidget.setFilterText('');
            this.filters.excludedFiles = false;
            this.filters.showErrors = true;
            this.filters.showWarnings = true;
            this.filters.showInfos = true;
        }
        autoReveal(focus = false) {
            // No need to auto reveal if active file filter is on
            if (this.filters.activeFile) {
                return;
            }
            const autoReveal = this.configurationService.getValue('problems.autoReveal');
            if (typeof autoReveal === 'boolean' && autoReveal) {
                const currentActiveResource = this.getResourceForCurrentActiveResource();
                this.widget.revealMarkers(currentActiveResource, focus, this.lastSelectedRelativeTop);
            }
        }
        getResourceForCurrentActiveResource() {
            return this.currentActiveResource ? this.markersModel.getResourceMarkers(this.currentActiveResource) : null;
        }
        updateRangeHighlights() {
            this.rangeHighlightDecorations.removeHighlightRange();
            if (this.widget.getHTMLElement() === document.activeElement) {
                this.highlightCurrentSelectedMarkerRange();
            }
        }
        highlightCurrentSelectedMarkerRange() {
            const selections = this.widget.getSelection() ?? [];
            if (selections.length !== 1) {
                return;
            }
            const selection = selections[0];
            if (!(selection instanceof markersModel_1.Marker)) {
                return;
            }
            this.rangeHighlightDecorations.highlightRange(selection);
        }
        onContextMenu(e) {
            const element = e.element;
            if (!element) {
                return;
            }
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                menuId: actions_2.MenuId.ProblemsPanelContext,
                contextKeyService: this.widget.contextKeyService,
                getActions: () => this.getMenuActions(element),
                getActionViewItem: (action) => {
                    const keybinding = this.keybindingService.lookupKeybinding(action.id);
                    if (keybinding) {
                        return new actionViewItems_1.ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
                    }
                    return undefined;
                },
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.widget.domFocus();
                    }
                }
            });
        }
        getMenuActions(element) {
            const result = [];
            if (element instanceof markersModel_1.Marker) {
                const viewModel = this.markersViewModel.getViewModel(element);
                if (viewModel) {
                    const quickFixActions = viewModel.quickFixAction.quickFixes;
                    if (quickFixActions.length) {
                        result.push(...quickFixActions);
                        result.push(new actions_1.Separator());
                    }
                }
            }
            return result;
        }
        getFocusElement() {
            return this.widget.getFocus()[0] ?? undefined;
        }
        getFocusedSelectedElements() {
            const focus = this.getFocusElement();
            if (!focus) {
                return null;
            }
            const selection = this.widget.getSelection();
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
            return this.markersModel.resourceMarkers;
        }
        getFilterStats() {
            if (!this.cachedFilterStats) {
                this.cachedFilterStats = {
                    total: this.markersModel.total,
                    filtered: this.widget?.getVisibleItemCount() ?? 0
                };
            }
            return this.cachedFilterStats;
        }
        toggleVisibility(hide) {
            this.widget.toggleVisibility(hide);
            this.layoutBodyContent();
        }
        saveState() {
            this.panelState['filter'] = this.filterWidget.getFilterText();
            this.panelState['filterHistory'] = this.filters.filterHistory;
            this.panelState['showErrors'] = this.filters.showErrors;
            this.panelState['showWarnings'] = this.filters.showWarnings;
            this.panelState['showInfos'] = this.filters.showInfos;
            this.panelState['useFilesExclude'] = this.filters.excludedFiles;
            this.panelState['activeFile'] = this.filters.activeFile;
            this.panelState['multiline'] = this.markersViewModel.multiline;
            this.panelState['viewMode'] = this.markersViewModel.viewMode;
            super.saveState();
        }
        dispose() {
            super.dispose();
        }
    };
    exports.MarkersView = MarkersView;
    exports.MarkersView = MarkersView = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, views_1.IViewDescriptorService),
        __param(3, editorService_1.IEditorService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, markers_1.IMarkerService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, contextView_1.IContextMenuService),
        __param(10, uriIdentity_1.IUriIdentityService),
        __param(11, keybinding_1.IKeybindingService),
        __param(12, storage_1.IStorageService),
        __param(13, opener_1.IOpenerService),
        __param(14, themeService_1.IThemeService)
    ], MarkersView);
    let MarkersTree = class MarkersTree extends listService_1.WorkbenchObjectTree {
        constructor(user, container, delegate, renderers, options, instantiationService, contextKeyService, listService, themeService, configurationService) {
            super(user, container, delegate, renderers, options, instantiationService, contextKeyService, listService, configurationService);
            this.container = container;
            this.visibilityContextKey = markers_2.MarkersContextKeys.MarkersTreeVisibilityContextKey.bindTo(contextKeyService);
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
            return !this.container.classList.contains('hidden');
        }
        toggleVisibility(hide) {
            this.visibilityContextKey.set(!hide);
            this.container.classList.toggle('hidden', hide);
        }
        reset(resourceMarkers) {
            this.setChildren(null, iterator_1.Iterable.map(resourceMarkers, m => ({ element: m, children: createResourceMarkersIterator(m) })));
        }
        revealMarkers(activeResource, focus, lastSelectedRelativeTop) {
            if (activeResource) {
                if (this.hasElement(activeResource)) {
                    if (!this.isCollapsed(activeResource) && this.hasSelectedMarkerFor(activeResource)) {
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
                    this.setSelection(selection.map(m => this.findMarkerNode(m)));
                    if (focus && focus.length > 0) {
                        this.setFocus(focus.map(f => this.findMarkerNode(f)));
                    }
                    else {
                        this.setFocus([this.findMarkerNode(selection[0])]);
                    }
                    this.reveal(this.findMarkerNode(selection[0]));
                }
                else if (this.getSelection().length === 0) {
                    const firstVisibleElement = this.firstVisibleElement;
                    const marker = firstVisibleElement ?
                        firstVisibleElement instanceof markersModel_1.ResourceMarkers ? firstVisibleElement.markers[0] :
                            firstVisibleElement instanceof markersModel_1.Marker ? firstVisibleElement : undefined
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
        findMarkerNode(marker) {
            for (const resourceNode of this.getNode().children) {
                for (const markerNode of resourceNode.children) {
                    if (markerNode.element instanceof markersModel_1.Marker && markerNode.element.marker === marker.marker) {
                        return markerNode.element;
                    }
                }
            }
            return null;
        }
        hasSelectedMarkerFor(resource) {
            const selectedElement = this.getSelection();
            if (selectedElement && selectedElement.length > 0) {
                if (selectedElement[0] instanceof markersModel_1.Marker) {
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
            this.container.style.height = `${height}px`;
            super.layout(height, width);
        }
    };
    MarkersTree = __decorate([
        __param(5, instantiation_1.IInstantiationService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, listService_1.IListService),
        __param(8, themeService_1.IThemeService),
        __param(9, configuration_1.IConfigurationService)
    ], MarkersTree);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Vyc1ZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tYXJrZXJzL2Jyb3dzZXIvbWFya2Vyc1ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0RoRyxTQUFTLDZCQUE2QixDQUFDLGVBQWdDO1FBQ3RFLE9BQU8sbUJBQVEsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRTtZQUNoRCxNQUFNLG9CQUFvQixHQUFHLG1CQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sUUFBUSxHQUFHLG1CQUFRLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFM0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBNkJNLElBQU0sV0FBVyxHQUFqQixNQUFNLFdBQVksU0FBUSx5QkFBYztRQThCOUMsWUFDQyxPQUF5QixFQUNGLG9CQUEyQyxFQUMxQyxxQkFBNkMsRUFDckQsYUFBOEMsRUFDdkMsb0JBQTJDLEVBQy9DLGdCQUFtQyxFQUN0QyxhQUE4QyxFQUMxQyxpQkFBcUMsRUFDL0IsdUJBQWtFLEVBQ3ZFLGtCQUF1QyxFQUN2QyxrQkFBd0QsRUFDekQsaUJBQXFDLEVBQ3hDLGNBQStCLEVBQ2hDLGFBQTZCLEVBQzlCLFlBQTJCO1lBRTFDLE1BQU0sVUFBVSxHQUFHLElBQUksaUJBQU8sQ0FBQyxpQkFBTyxDQUFDLHVCQUF1QixFQUFFLGNBQWMsQ0FBQyxDQUFDLFVBQVUsK0RBQStDLENBQUM7WUFD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