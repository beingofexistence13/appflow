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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/platform/contextview/browser/contextView", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/browser/diff/diffElementOutputs", "vs/editor/browser/editorExtensions", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/suggest/browser/suggestController", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/workbench/contrib/snippets/browser/tabCompletion", "vs/base/browser/ui/iconLabel/iconLabels", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/themeService", "vs/platform/actions/browser/toolbar", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/notebook/browser/diff/diffCellEditorOptions", "vs/platform/accessibility/common/accessibility", "vs/editor/browser/widget/diffEditor/diffEditorWidget"], function (require, exports, DOM, lifecycle_1, network_1, instantiation_1, diffElementViewModel_1, notebookDiffEditorBrowser_1, codeEditorWidget_1, model_1, language_1, notebookCommon_1, contextView_1, actions_1, keybinding_1, notification_1, menuEntryActionViewItem_1, contextkey_1, cellActionView_1, notebookIcons_1, diffElementOutputs_1, editorExtensions_1, contextmenu_1, snippetController2_1, suggestController_1, menuPreventer_1, selectionClipboard_1, tabCompletion_1, iconLabels_1, resolverService_1, configuration_1, themeService_1, toolbar_1, telemetry_1, diffCellEditorOptions_1, accessibility_1, diffEditorWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModifiedElement = exports.InsertElement = exports.DeletedElement = exports.getOptimizedNestedCodeEditorWidgetOptions = void 0;
    function getOptimizedNestedCodeEditorWidgetOptions() {
        return {
            isSimpleWidget: false,
            contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                menuPreventer_1.MenuPreventer.ID,
                selectionClipboard_1.SelectionClipboardContributionID,
                contextmenu_1.ContextMenuController.ID,
                suggestController_1.SuggestController.ID,
                snippetController2_1.SnippetController2.ID,
                tabCompletion_1.TabCompletionController.ID,
            ])
        };
    }
    exports.getOptimizedNestedCodeEditorWidgetOptions = getOptimizedNestedCodeEditorWidgetOptions;
    let PropertyHeader = class PropertyHeader extends lifecycle_1.Disposable {
        constructor(cell, propertyHeaderContainer, notebookEditor, accessor, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, themeService, telemetryService, accessibilityService) {
            super();
            this.cell = cell;
            this.propertyHeaderContainer = propertyHeaderContainer;
            this.notebookEditor = notebookEditor;
            this.accessor = accessor;
            this.contextMenuService = contextMenuService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
            this.themeService = themeService;
            this.telemetryService = telemetryService;
            this.accessibilityService = accessibilityService;
        }
        buildHeader() {
            const metadataChanged = this.accessor.checkIfModified(this.cell);
            this._foldingIndicator = DOM.append(this.propertyHeaderContainer, DOM.$('.property-folding-indicator'));
            this._foldingIndicator.classList.add(this.accessor.prefix);
            this._updateFoldingIcon();
            const metadataStatus = DOM.append(this.propertyHeaderContainer, DOM.$('div.property-status'));
            this._statusSpan = DOM.append(metadataStatus, DOM.$('span'));
            this._description = DOM.append(metadataStatus, DOM.$('span.property-description'));
            if (metadataChanged) {
                this._statusSpan.textContent = this.accessor.changedLabel;
                this._statusSpan.style.fontWeight = 'bold';
                if (metadataChanged.reason) {
                    this._description.textContent = metadataChanged.reason;
                }
                this.propertyHeaderContainer.classList.add('modified');
            }
            else {
                this._statusSpan.textContent = this.accessor.unChangedLabel;
                this._description.textContent = '';
                this.propertyHeaderContainer.classList.remove('modified');
            }
            const cellToolbarContainer = DOM.append(this.propertyHeaderContainer, DOM.$('div.property-toolbar'));
            this._toolbar = new toolbar_1.WorkbenchToolBar(cellToolbarContainer, {
                actionViewItemProvider: action => {
                    if (action instanceof actions_1.MenuItemAction) {
                        const item = new cellActionView_1.CodiconActionViewItem(action, undefined, this.keybindingService, this.notificationService, this.contextKeyService, this.themeService, this.contextMenuService, this.accessibilityService);
                        return item;
                    }
                    return undefined;
                }
            }, this.menuService, this.contextKeyService, this.contextMenuService, this.keybindingService, this.telemetryService);
            this._register(this._toolbar);
            this._toolbar.context = {
                cell: this.cell
            };
            const scopedContextKeyService = this.contextKeyService.createScoped(cellToolbarContainer);
            this._register(scopedContextKeyService);
            const propertyChanged = notebookDiffEditorBrowser_1.NOTEBOOK_DIFF_CELL_PROPERTY.bindTo(scopedContextKeyService);
            propertyChanged.set(!!metadataChanged);
            this._propertyExpanded = notebookDiffEditorBrowser_1.NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED.bindTo(scopedContextKeyService);
            this._menu = this.menuService.createMenu(this.accessor.menuId, scopedContextKeyService);
            this._register(this._menu);
            const actions = [];
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this._menu, { shouldForwardArgs: true }, actions);
            this._toolbar.setActions(actions);
            this._register(this._menu.onDidChange(() => {
                const actions = [];
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this._menu, { shouldForwardArgs: true }, actions);
                this._toolbar.setActions(actions);
            }));
            this._register(this.notebookEditor.onMouseUp(e => {
                if (!e.event.target) {
                    return;
                }
                const target = e.event.target;
                if (target.classList.contains('codicon-notebook-collapsed') || target.classList.contains('codicon-notebook-expanded')) {
                    const parent = target.parentElement;
                    if (!parent) {
                        return;
                    }
                    if (!parent.classList.contains(this.accessor.prefix)) {
                        return;
                    }
                    if (!parent.classList.contains('property-folding-indicator')) {
                        return;
                    }
                    // folding icon
                    const cellViewModel = e.target;
                    if (cellViewModel === this.cell) {
                        const oldFoldingState = this.accessor.getFoldingState(this.cell);
                        this.accessor.updateFoldingState(this.cell, oldFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded ? diffElementViewModel_1.PropertyFoldingState.Collapsed : diffElementViewModel_1.PropertyFoldingState.Expanded);
                        this._updateFoldingIcon();
                        this.accessor.updateInfoRendering(this.cell.renderOutput);
                    }
                }
                return;
            }));
            this._updateFoldingIcon();
            this.accessor.updateInfoRendering(this.cell.renderOutput);
        }
        refresh() {
            const metadataChanged = this.accessor.checkIfModified(this.cell);
            if (metadataChanged) {
                this._statusSpan.textContent = this.accessor.changedLabel;
                this._statusSpan.style.fontWeight = 'bold';
                if (metadataChanged.reason) {
                    this._description.textContent = metadataChanged.reason;
                }
                this.propertyHeaderContainer.classList.add('modified');
                const actions = [];
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this._menu, undefined, actions);
                this._toolbar.setActions(actions);
            }
            else {
                this._statusSpan.textContent = this.accessor.unChangedLabel;
                this._statusSpan.style.fontWeight = 'normal';
                this._description.textContent = '';
                this.propertyHeaderContainer.classList.remove('modified');
                this._toolbar.setActions([]);
            }
        }
        _updateFoldingIcon() {
            if (this.accessor.getFoldingState(this.cell) === diffElementViewModel_1.PropertyFoldingState.Collapsed) {
                DOM.reset(this._foldingIndicator, (0, iconLabels_1.renderIcon)(notebookIcons_1.collapsedIcon));
                this._propertyExpanded?.set(false);
            }
            else {
                DOM.reset(this._foldingIndicator, (0, iconLabels_1.renderIcon)(notebookIcons_1.expandedIcon));
                this._propertyExpanded?.set(true);
            }
        }
    };
    PropertyHeader = __decorate([
        __param(4, contextView_1.IContextMenuService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, notification_1.INotificationService),
        __param(7, actions_1.IMenuService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, themeService_1.IThemeService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, accessibility_1.IAccessibilityService)
    ], PropertyHeader);
    class AbstractElementRenderer extends lifecycle_1.Disposable {
        constructor(notebookEditor, cell, templateData, style, instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.cell = cell;
            this.templateData = templateData;
            this.style = style;
            this.instantiationService = instantiationService;
            this.languageService = languageService;
            this.modelService = modelService;
            this.textModelService = textModelService;
            this.contextMenuService = contextMenuService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
            this.configurationService = configurationService;
            this._metadataLocalDisposable = this._register(new lifecycle_1.DisposableStore());
            this._outputLocalDisposable = this._register(new lifecycle_1.DisposableStore());
            this._ignoreMetadata = false;
            this._ignoreOutputs = false;
            // init
            this._isDisposed = false;
            this._metadataEditorDisposeStore = this._register(new lifecycle_1.DisposableStore());
            this._outputEditorDisposeStore = this._register(new lifecycle_1.DisposableStore());
            this._register(cell.onDidLayoutChange(e => this.layout(e)));
            this._register(cell.onDidLayoutChange(e => this.updateBorders()));
            this.init();
            this.buildBody();
            this._register(cell.onDidStateChange(() => {
                this.updateOutputRendering(this.cell.renderOutput);
            }));
        }
        buildBody() {
            const body = this.templateData.body;
            this._diffEditorContainer = this.templateData.diffEditorContainer;
            body.classList.remove('left', 'right', 'full');
            switch (this.style) {
                case 'left':
                    body.classList.add('left');
                    break;
                case 'right':
                    body.classList.add('right');
                    break;
                default:
                    body.classList.add('full');
                    break;
            }
            this.styleContainer(this._diffEditorContainer);
            this.updateSourceEditor();
            this._ignoreMetadata = this.configurationService.getValue('notebook.diff.ignoreMetadata');
            if (this._ignoreMetadata) {
                this._disposeMetadata();
            }
            else {
                this._buildMetadata();
            }
            this._ignoreOutputs = this.configurationService.getValue('notebook.diff.ignoreOutputs') || !!(this.notebookEditor.textModel?.transientOptions.transientOutputs);
            if (this._ignoreOutputs) {
                this._disposeOutput();
            }
            else {
                this._buildOutput();
            }
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                let metadataLayoutChange = false;
                let outputLayoutChange = false;
                if (e.affectsConfiguration('notebook.diff.ignoreMetadata')) {
                    const newValue = this.configurationService.getValue('notebook.diff.ignoreMetadata');
                    if (newValue !== undefined && this._ignoreMetadata !== newValue) {
                        this._ignoreMetadata = newValue;
                        this._metadataLocalDisposable.clear();
                        if (this.configurationService.getValue('notebook.diff.ignoreMetadata')) {
                            this._disposeMetadata();
                        }
                        else {
                            this.cell.metadataStatusHeight = 25;
                            this._buildMetadata();
                            this.updateMetadataRendering();
                            metadataLayoutChange = true;
                        }
                    }
                }
                if (e.affectsConfiguration('notebook.diff.ignoreOutputs')) {
                    const newValue = this.configurationService.getValue('notebook.diff.ignoreOutputs');
                    if (newValue !== undefined && this._ignoreOutputs !== (newValue || this.notebookEditor.textModel?.transientOptions.transientOutputs)) {
                        this._ignoreOutputs = newValue || !!(this.notebookEditor.textModel?.transientOptions.transientOutputs);
                        this._outputLocalDisposable.clear();
                        if (this._ignoreOutputs) {
                            this._disposeOutput();
                        }
                        else {
                            this.cell.outputStatusHeight = 25;
                            this._buildOutput();
                            outputLayoutChange = true;
                        }
                    }
                }
                if (metadataLayoutChange || outputLayoutChange) {
                    this.layout({ metadataHeight: metadataLayoutChange, outputTotalHeight: outputLayoutChange });
                }
            }));
        }
        updateMetadataRendering() {
            if (this.cell.metadataFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded) {
                // we should expand the metadata editor
                this._metadataInfoContainer.style.display = 'block';
                if (!this._metadataEditorContainer || !this._metadataEditor) {
                    // create editor
                    this._metadataEditorContainer = DOM.append(this._metadataInfoContainer, DOM.$('.metadata-editor-container'));
                    this._buildMetadataEditor();
                }
                else {
                    this.cell.metadataHeight = this._metadataEditor.getContentHeight();
                }
            }
            else {
                // we should collapse the metadata editor
                this._metadataInfoContainer.style.display = 'none';
                // this._metadataEditorDisposeStore.clear();
                this.cell.metadataHeight = 0;
            }
        }
        updateOutputRendering(renderRichOutput) {
            if (this.cell.outputFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded) {
                this._outputInfoContainer.style.display = 'block';
                if (renderRichOutput) {
                    this._hideOutputsRaw();
                    this._buildOutputRendererContainer();
                    this._showOutputsRenderer();
                    this._showOutputsEmptyView();
                }
                else {
                    this._hideOutputsRenderer();
                    this._buildOutputRawContainer();
                    this._showOutputsRaw();
                }
            }
            else {
                this._outputInfoContainer.style.display = 'none';
                this._hideOutputsRaw();
                this._hideOutputsRenderer();
                this._hideOutputsEmptyView();
            }
        }
        _buildOutputRawContainer() {
            if (!this._outputEditorContainer) {
                this._outputEditorContainer = DOM.append(this._outputInfoContainer, DOM.$('.output-editor-container'));
                this._buildOutputEditor();
            }
        }
        _showOutputsRaw() {
            if (this._outputEditorContainer) {
                this._outputEditorContainer.style.display = 'block';
                this.cell.rawOutputHeight = this._outputEditor.getContentHeight();
            }
        }
        _showOutputsEmptyView() {
            this.cell.layoutChange();
        }
        _hideOutputsRaw() {
            if (this._outputEditorContainer) {
                this._outputEditorContainer.style.display = 'none';
                this.cell.rawOutputHeight = 0;
            }
        }
        _hideOutputsEmptyView() {
            this.cell.layoutChange();
        }
        _applySanitizedMetadataChanges(currentMetadata, newMetadata) {
            const result = {};
            try {
                const newMetadataObj = JSON.parse(newMetadata);
                const keys = new Set([...Object.keys(newMetadataObj)]);
                for (const key of keys) {
                    switch (key) {
                        case 'inputCollapsed':
                        case 'outputCollapsed':
                            // boolean
                            if (typeof newMetadataObj[key] === 'boolean') {
                                result[key] = newMetadataObj[key];
                            }
                            else {
                                result[key] = currentMetadata[key];
                            }
                            break;
                        default:
                            result[key] = newMetadataObj[key];
                            break;
                    }
                }
                const index = this.notebookEditor.textModel.cells.indexOf(this.cell.modified.textModel);
                if (index < 0) {
                    return;
                }
                this.notebookEditor.textModel.applyEdits([
                    { editType: 3 /* CellEditType.Metadata */, index, metadata: result }
                ], true, undefined, () => undefined, undefined, true);
            }
            catch {
            }
        }
        async _buildMetadataEditor() {
            this._metadataEditorDisposeStore.clear();
            if (this.cell instanceof diffElementViewModel_1.SideBySideDiffElementViewModel) {
                this._metadataEditor = this.instantiationService.createInstance(diffEditorWidget_1.DiffEditorWidget, this._metadataEditorContainer, {
                    ...diffCellEditorOptions_1.fixedDiffEditorOptions,
                    overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
                    readOnly: false,
                    originalEditable: false,
                    ignoreTrimWhitespace: false,
                    automaticLayout: false,
                    dimension: {
                        height: this.cell.layoutInfo.metadataHeight,
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), true, true)
                    }
                }, {
                    originalEditor: getOptimizedNestedCodeEditorWidgetOptions(),
                    modifiedEditor: getOptimizedNestedCodeEditorWidgetOptions()
                });
                this.layout({ metadataHeight: true });
                this._metadataEditorDisposeStore.add(this._metadataEditor);
                this._metadataEditorContainer?.classList.add('diff');
                const originalMetadataModel = await this.textModelService.createModelReference(notebookCommon_1.CellUri.generateCellPropertyUri(this.cell.originalDocument.uri, this.cell.original.handle, network_1.Schemas.vscodeNotebookCellMetadata));
                const modifiedMetadataModel = await this.textModelService.createModelReference(notebookCommon_1.CellUri.generateCellPropertyUri(this.cell.modifiedDocument.uri, this.cell.modified.handle, network_1.Schemas.vscodeNotebookCellMetadata));
                this._metadataEditor.setModel({
                    original: originalMetadataModel.object.textEditorModel,
                    modified: modifiedMetadataModel.object.textEditorModel
                });
                this._metadataEditorDisposeStore.add(originalMetadataModel);
                this._metadataEditorDisposeStore.add(modifiedMetadataModel);
                this.cell.metadataHeight = this._metadataEditor.getContentHeight();
                this._metadataEditorDisposeStore.add(this._metadataEditor.onDidContentSizeChange((e) => {
                    if (e.contentHeightChanged && this.cell.metadataFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded) {
                        this.cell.metadataHeight = e.contentHeight;
                    }
                }));
                let respondingToContentChange = false;
                this._metadataEditorDisposeStore.add(modifiedMetadataModel.object.textEditorModel.onDidChangeContent(() => {
                    respondingToContentChange = true;
                    const value = modifiedMetadataModel.object.textEditorModel.getValue();
                    this._applySanitizedMetadataChanges(this.cell.modified.metadata, value);
                    this._metadataHeader.refresh();
                    respondingToContentChange = false;
                }));
                this._metadataEditorDisposeStore.add(this.cell.modified.textModel.onDidChangeMetadata(() => {
                    if (respondingToContentChange) {
                        return;
                    }
                    const modifiedMetadataSource = (0, diffElementViewModel_1.getFormattedMetadataJSON)(this.notebookEditor.textModel, this.cell.modified?.metadata || {}, this.cell.modified?.language);
                    modifiedMetadataModel.object.textEditorModel.setValue(modifiedMetadataSource);
                }));
                return;
            }
            else {
                this._metadataEditor = this.instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this._metadataEditorContainer, {
                    ...diffCellEditorOptions_1.fixedEditorOptions,
                    dimension: {
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true),
                        height: this.cell.layoutInfo.metadataHeight
                    },
                    overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
                    readOnly: false
                }, {});
                this.layout({ metadataHeight: true });
                this._metadataEditorDisposeStore.add(this._metadataEditor);
                const mode = this.languageService.createById('jsonc');
                const originalMetadataSource = (0, diffElementViewModel_1.getFormattedMetadataJSON)(this.notebookEditor.textModel, this.cell.type === 'insert'
                    ? this.cell.modified.metadata || {}
                    : this.cell.original.metadata || {});
                const uri = this.cell.type === 'insert'
                    ? this.cell.modified.uri
                    : this.cell.original.uri;
                const handle = this.cell.type === 'insert'
                    ? this.cell.modified.handle
                    : this.cell.original.handle;
                const modelUri = notebookCommon_1.CellUri.generateCellPropertyUri(uri, handle, network_1.Schemas.vscodeNotebookCellMetadata);
                const metadataModel = this.modelService.createModel(originalMetadataSource, mode, modelUri, false);
                this._metadataEditor.setModel(metadataModel);
                this._metadataEditorDisposeStore.add(metadataModel);
                this.cell.metadataHeight = this._metadataEditor.getContentHeight();
                this._metadataEditorDisposeStore.add(this._metadataEditor.onDidContentSizeChange((e) => {
                    if (e.contentHeightChanged && this.cell.metadataFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded) {
                        this.cell.metadataHeight = e.contentHeight;
                    }
                }));
            }
        }
        _buildOutputEditor() {
            this._outputEditorDisposeStore.clear();
            if ((this.cell.type === 'modified' || this.cell.type === 'unchanged') && !this.notebookEditor.textModel.transientOptions.transientOutputs) {
                const originalOutputsSource = (0, diffElementViewModel_1.getFormattedOutputJSON)(this.cell.original?.outputs || []);
                const modifiedOutputsSource = (0, diffElementViewModel_1.getFormattedOutputJSON)(this.cell.modified?.outputs || []);
                if (originalOutputsSource !== modifiedOutputsSource) {
                    const mode = this.languageService.createById('json');
                    const originalModel = this.modelService.createModel(originalOutputsSource, mode, undefined, true);
                    const modifiedModel = this.modelService.createModel(modifiedOutputsSource, mode, undefined, true);
                    this._outputEditorDisposeStore.add(originalModel);
                    this._outputEditorDisposeStore.add(modifiedModel);
                    const lineHeight = this.notebookEditor.getLayoutInfo().fontInfo.lineHeight || 17;
                    const lineCount = Math.max(originalModel.getLineCount(), modifiedModel.getLineCount());
                    this._outputEditor = this.instantiationService.createInstance(diffEditorWidget_1.DiffEditorWidget, this._outputEditorContainer, {
                        ...diffCellEditorOptions_1.fixedDiffEditorOptions,
                        overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
                        readOnly: true,
                        ignoreTrimWhitespace: false,
                        automaticLayout: false,
                        dimension: {
                            height: Math.min(diffElementViewModel_1.OUTPUT_EDITOR_HEIGHT_MAGIC, this.cell.layoutInfo.rawOutputHeight || lineHeight * lineCount),
                            width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true)
                        },
                        accessibilityVerbose: this.configurationService.getValue("accessibility.verbosity.diffEditor" /* AccessibilityVerbositySettingId.DiffEditor */) ?? false
                    }, {
                        originalEditor: getOptimizedNestedCodeEditorWidgetOptions(),
                        modifiedEditor: getOptimizedNestedCodeEditorWidgetOptions()
                    });
                    this._outputEditorDisposeStore.add(this._outputEditor);
                    this._outputEditorContainer?.classList.add('diff');
                    this._outputEditor.setModel({
                        original: originalModel,
                        modified: modifiedModel
                    });
                    this._outputEditor.restoreViewState(this.cell.getOutputEditorViewState());
                    this.cell.rawOutputHeight = this._outputEditor.getContentHeight();
                    this._outputEditorDisposeStore.add(this._outputEditor.onDidContentSizeChange((e) => {
                        if (e.contentHeightChanged && this.cell.outputFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded) {
                            this.cell.rawOutputHeight = e.contentHeight;
                        }
                    }));
                    this._outputEditorDisposeStore.add(this.cell.modified.textModel.onDidChangeOutputs(() => {
                        const modifiedOutputsSource = (0, diffElementViewModel_1.getFormattedOutputJSON)(this.cell.modified?.outputs || []);
                        modifiedModel.setValue(modifiedOutputsSource);
                        this._outputHeader.refresh();
                    }));
                    return;
                }
            }
            this._outputEditor = this.instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this._outputEditorContainer, {
                ...diffCellEditorOptions_1.fixedEditorOptions,
                dimension: {
                    width: Math.min(diffElementViewModel_1.OUTPUT_EDITOR_HEIGHT_MAGIC, this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, this.cell.type === 'unchanged' || this.cell.type === 'modified') - 32),
                    height: this.cell.layoutInfo.rawOutputHeight
                },
                overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode()
            }, {});
            this._outputEditorDisposeStore.add(this._outputEditor);
            const mode = this.languageService.createById('json');
            const originaloutputSource = (0, diffElementViewModel_1.getFormattedOutputJSON)(this.notebookEditor.textModel.transientOptions.transientOutputs
                ? []
                : this.cell.type === 'insert'
                    ? this.cell.modified.outputs || []
                    : this.cell.original.outputs || []);
            const outputModel = this.modelService.createModel(originaloutputSource, mode, undefined, true);
            this._outputEditorDisposeStore.add(outputModel);
            this._outputEditor.setModel(outputModel);
            this._outputEditor.restoreViewState(this.cell.getOutputEditorViewState());
            this.cell.rawOutputHeight = this._outputEditor.getContentHeight();
            this._outputEditorDisposeStore.add(this._outputEditor.onDidContentSizeChange((e) => {
                if (e.contentHeightChanged && this.cell.outputFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded) {
                    this.cell.rawOutputHeight = e.contentHeight;
                }
            }));
        }
        layoutNotebookCell() {
            this.notebookEditor.layoutNotebookCell(this.cell, this.cell.layoutInfo.totalHeight);
        }
        updateBorders() {
            this.templateData.leftBorder.style.height = `${this.cell.layoutInfo.totalHeight - 32}px`;
            this.templateData.rightBorder.style.height = `${this.cell.layoutInfo.totalHeight - 32}px`;
            this.templateData.bottomBorder.style.top = `${this.cell.layoutInfo.totalHeight - 32}px`;
        }
        dispose() {
            if (this._outputEditor) {
                this.cell.saveOutputEditorViewState(this._outputEditor.saveViewState());
            }
            if (this._metadataEditor) {
                this.cell.saveMetadataEditorViewState(this._metadataEditor.saveViewState());
            }
            this._metadataEditorDisposeStore.dispose();
            this._outputEditorDisposeStore.dispose();
            this._isDisposed = true;
            super.dispose();
        }
    }
    class SingleSideDiffElement extends AbstractElementRenderer {
        constructor(notebookEditor, cell, templateData, style, instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService) {
            super(notebookEditor, cell, templateData, style, instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService);
            this.cell = cell;
            this.templateData = templateData;
        }
        init() {
            this._diagonalFill = this.templateData.diagonalFill;
        }
        buildBody() {
            const body = this.templateData.body;
            this._diffEditorContainer = this.templateData.diffEditorContainer;
            body.classList.remove('left', 'right', 'full');
            switch (this.style) {
                case 'left':
                    body.classList.add('left');
                    break;
                case 'right':
                    body.classList.add('right');
                    break;
                default:
                    body.classList.add('full');
                    break;
            }
            this.styleContainer(this._diffEditorContainer);
            this.updateSourceEditor();
            if (this.configurationService.getValue('notebook.diff.ignoreMetadata')) {
                this._disposeMetadata();
            }
            else {
                this._buildMetadata();
            }
            if (this.configurationService.getValue('notebook.diff.ignoreOutputs') || this.notebookEditor.textModel?.transientOptions.transientOutputs) {
                this._disposeOutput();
            }
            else {
                this._buildOutput();
            }
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                let metadataLayoutChange = false;
                let outputLayoutChange = false;
                if (e.affectsConfiguration('notebook.diff.ignoreMetadata')) {
                    this._metadataLocalDisposable.clear();
                    if (this.configurationService.getValue('notebook.diff.ignoreMetadata')) {
                        this._disposeMetadata();
                    }
                    else {
                        this.cell.metadataStatusHeight = 25;
                        this._buildMetadata();
                        this.updateMetadataRendering();
                        metadataLayoutChange = true;
                    }
                }
                if (e.affectsConfiguration('notebook.diff.ignoreOutputs')) {
                    this._outputLocalDisposable.clear();
                    if (this.configurationService.getValue('notebook.diff.ignoreOutputs') || this.notebookEditor.textModel?.transientOptions.transientOutputs) {
                        this._disposeOutput();
                    }
                    else {
                        this.cell.outputStatusHeight = 25;
                        this._buildOutput();
                        outputLayoutChange = true;
                    }
                }
                if (metadataLayoutChange || outputLayoutChange) {
                    this.layout({ metadataHeight: metadataLayoutChange, outputTotalHeight: outputLayoutChange });
                }
            }));
        }
        _disposeMetadata() {
            this.cell.metadataStatusHeight = 0;
            this.cell.metadataHeight = 0;
            this.templateData.metadataHeaderContainer.style.display = 'none';
            this.templateData.metadataInfoContainer.style.display = 'none';
            this._metadataEditor = undefined;
        }
        _buildMetadata() {
            this._metadataHeaderContainer = this.templateData.metadataHeaderContainer;
            this._metadataInfoContainer = this.templateData.metadataInfoContainer;
            this._metadataHeaderContainer.style.display = 'flex';
            this._metadataInfoContainer.style.display = 'block';
            this._metadataHeaderContainer.innerText = '';
            this._metadataInfoContainer.innerText = '';
            this._metadataHeader = this.instantiationService.createInstance(PropertyHeader, this.cell, this._metadataHeaderContainer, this.notebookEditor, {
                updateInfoRendering: this.updateMetadataRendering.bind(this),
                checkIfModified: (cell) => {
                    return cell.checkMetadataIfModified();
                },
                getFoldingState: (cell) => {
                    return cell.metadataFoldingState;
                },
                updateFoldingState: (cell, state) => {
                    cell.metadataFoldingState = state;
                },
                unChangedLabel: 'Metadata',
                changedLabel: 'Metadata changed',
                prefix: 'metadata',
                menuId: actions_1.MenuId.NotebookDiffCellMetadataTitle
            });
            this._metadataLocalDisposable.add(this._metadataHeader);
            this._metadataHeader.buildHeader();
        }
        _buildOutput() {
            this.templateData.outputHeaderContainer.style.display = 'flex';
            this.templateData.outputInfoContainer.style.display = 'block';
            this._outputHeaderContainer = this.templateData.outputHeaderContainer;
            this._outputInfoContainer = this.templateData.outputInfoContainer;
            this._outputHeaderContainer.innerText = '';
            this._outputInfoContainer.innerText = '';
            this._outputHeader = this.instantiationService.createInstance(PropertyHeader, this.cell, this._outputHeaderContainer, this.notebookEditor, {
                updateInfoRendering: this.updateOutputRendering.bind(this),
                checkIfModified: (cell) => {
                    return cell.checkIfOutputsModified();
                },
                getFoldingState: (cell) => {
                    return cell.outputFoldingState;
                },
                updateFoldingState: (cell, state) => {
                    cell.outputFoldingState = state;
                },
                unChangedLabel: 'Outputs',
                changedLabel: 'Outputs changed',
                prefix: 'output',
                menuId: actions_1.MenuId.NotebookDiffCellOutputsTitle
            });
            this._outputLocalDisposable.add(this._outputHeader);
            this._outputHeader.buildHeader();
        }
        _disposeOutput() {
            this._hideOutputsRaw();
            this._hideOutputsRenderer();
            this._hideOutputsEmptyView();
            this.cell.rawOutputHeight = 0;
            this.cell.outputStatusHeight = 0;
            this.templateData.outputHeaderContainer.style.display = 'none';
            this.templateData.outputInfoContainer.style.display = 'none';
            this._outputViewContainer = undefined;
        }
    }
    let DeletedElement = class DeletedElement extends SingleSideDiffElement {
        constructor(notebookEditor, cell, templateData, languageService, modelService, textModelService, instantiationService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService) {
            super(notebookEditor, cell, templateData, 'left', instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService);
        }
        styleContainer(container) {
            container.classList.remove('inserted');
            container.classList.add('removed');
        }
        updateSourceEditor() {
            const originalCell = this.cell.original;
            const lineCount = originalCell.textModel.textBuffer.getLineCount();
            const lineHeight = this.notebookEditor.getLayoutInfo().fontInfo.lineHeight || 17;
            const editorHeight = lineCount * lineHeight + diffCellEditorOptions_1.fixedEditorPadding.top + diffCellEditorOptions_1.fixedEditorPadding.bottom;
            this._editor = this.templateData.sourceEditor;
            this._editor.layout({
                width: (this.notebookEditor.getLayoutInfo().width - 2 * notebookDiffEditorBrowser_1.DIFF_CELL_MARGIN) / 2 - 18,
                height: editorHeight
            });
            this.cell.editorHeight = editorHeight;
            this._register(this._editor.onDidContentSizeChange((e) => {
                if (e.contentHeightChanged && this.cell.layoutInfo.editorHeight !== e.contentHeight) {
                    this.cell.editorHeight = e.contentHeight;
                }
            }));
            this.textModelService.createModelReference(originalCell.uri).then(ref => {
                if (this._isDisposed) {
                    return;
                }
                this._register(ref);
                const textModel = ref.object.textEditorModel;
                this._editor.setModel(textModel);
                this.cell.editorHeight = this._editor.getContentHeight();
            });
        }
        layout(state) {
            DOM.scheduleAtNextAnimationFrame(() => {
                if (state.editorHeight || state.outerWidth) {
                    this._editor.layout({
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
                        height: this.cell.layoutInfo.editorHeight
                    });
                }
                if (state.metadataHeight || state.outerWidth) {
                    this._metadataEditor?.layout({
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
                        height: this.cell.layoutInfo.metadataHeight
                    });
                }
                if (state.outputTotalHeight || state.outerWidth) {
                    this._outputEditor?.layout({
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
                        height: this.cell.layoutInfo.outputTotalHeight
                    });
                }
                if (this._diagonalFill) {
                    this._diagonalFill.style.height = `${this.cell.layoutInfo.totalHeight - 32}px`;
                }
                this.layoutNotebookCell();
            });
        }
        _buildOutputRendererContainer() {
            if (!this._outputViewContainer) {
                this._outputViewContainer = DOM.append(this._outputInfoContainer, DOM.$('.output-view-container'));
                this._outputEmptyElement = DOM.append(this._outputViewContainer, DOM.$('.output-empty-view'));
                const span = DOM.append(this._outputEmptyElement, DOM.$('span'));
                span.innerText = 'No outputs to render';
                if (this.cell.original.outputs.length === 0) {
                    this._outputEmptyElement.style.display = 'block';
                }
                else {
                    this._outputEmptyElement.style.display = 'none';
                }
                this.cell.layoutChange();
                this._outputLeftView = this.instantiationService.createInstance(diffElementOutputs_1.OutputContainer, this.notebookEditor, this.notebookEditor.textModel, this.cell, this.cell.original, notebookDiffEditorBrowser_1.DiffSide.Original, this._outputViewContainer);
                this._register(this._outputLeftView);
                this._outputLeftView.render();
                const removedOutputRenderListener = this.notebookEditor.onDidDynamicOutputRendered(e => {
                    if (e.cell.uri.toString() === this.cell.original.uri.toString()) {
                        this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Original, this.cell.original.id, ['nb-cellDeleted'], []);
                        removedOutputRenderListener.dispose();
                    }
                });
                this._register(removedOutputRenderListener);
            }
            this._outputViewContainer.style.display = 'block';
        }
        _decorate() {
            this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Original, this.cell.original.id, ['nb-cellDeleted'], []);
        }
        _showOutputsRenderer() {
            if (this._outputViewContainer) {
                this._outputViewContainer.style.display = 'block';
                this._outputLeftView?.showOutputs();
                this._decorate();
            }
        }
        _hideOutputsRenderer() {
            if (this._outputViewContainer) {
                this._outputViewContainer.style.display = 'none';
                this._outputLeftView?.hideOutputs();
            }
        }
        dispose() {
            if (this._editor) {
                this.cell.saveSpirceEditorViewState(this._editor.saveViewState());
            }
            super.dispose();
        }
    };
    exports.DeletedElement = DeletedElement;
    exports.DeletedElement = DeletedElement = __decorate([
        __param(3, language_1.ILanguageService),
        __param(4, model_1.IModelService),
        __param(5, resolverService_1.ITextModelService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, notification_1.INotificationService),
        __param(10, actions_1.IMenuService),
        __param(11, contextkey_1.IContextKeyService),
        __param(12, configuration_1.IConfigurationService)
    ], DeletedElement);
    let InsertElement = class InsertElement extends SingleSideDiffElement {
        constructor(notebookEditor, cell, templateData, instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService) {
            super(notebookEditor, cell, templateData, 'right', instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService);
        }
        styleContainer(container) {
            container.classList.remove('removed');
            container.classList.add('inserted');
        }
        updateSourceEditor() {
            const modifiedCell = this.cell.modified;
            const lineCount = modifiedCell.textModel.textBuffer.getLineCount();
            const lineHeight = this.notebookEditor.getLayoutInfo().fontInfo.lineHeight || 17;
            const editorHeight = lineCount * lineHeight + diffCellEditorOptions_1.fixedEditorPadding.top + diffCellEditorOptions_1.fixedEditorPadding.bottom;
            this._editor = this.templateData.sourceEditor;
            this._editor.layout({
                width: (this.notebookEditor.getLayoutInfo().width - 2 * notebookDiffEditorBrowser_1.DIFF_CELL_MARGIN) / 2 - 18,
                height: editorHeight
            });
            this._editor.updateOptions({ readOnly: false });
            this.cell.editorHeight = editorHeight;
            this._register(this._editor.onDidContentSizeChange((e) => {
                if (e.contentHeightChanged && this.cell.layoutInfo.editorHeight !== e.contentHeight) {
                    this.cell.editorHeight = e.contentHeight;
                }
            }));
            this.textModelService.createModelReference(modifiedCell.uri).then(ref => {
                if (this._isDisposed) {
                    return;
                }
                this._register(ref);
                const textModel = ref.object.textEditorModel;
                this._editor.setModel(textModel);
                this._editor.restoreViewState(this.cell.getSourceEditorViewState());
                this.cell.editorHeight = this._editor.getContentHeight();
            });
        }
        _buildOutputRendererContainer() {
            if (!this._outputViewContainer) {
                this._outputViewContainer = DOM.append(this._outputInfoContainer, DOM.$('.output-view-container'));
                this._outputEmptyElement = DOM.append(this._outputViewContainer, DOM.$('.output-empty-view'));
                this._outputEmptyElement.innerText = 'No outputs to render';
                if (this.cell.modified.outputs.length === 0) {
                    this._outputEmptyElement.style.display = 'block';
                }
                else {
                    this._outputEmptyElement.style.display = 'none';
                }
                this.cell.layoutChange();
                this._outputRightView = this.instantiationService.createInstance(diffElementOutputs_1.OutputContainer, this.notebookEditor, this.notebookEditor.textModel, this.cell, this.cell.modified, notebookDiffEditorBrowser_1.DiffSide.Modified, this._outputViewContainer);
                this._register(this._outputRightView);
                this._outputRightView.render();
                const insertOutputRenderListener = this.notebookEditor.onDidDynamicOutputRendered(e => {
                    if (e.cell.uri.toString() === this.cell.modified.uri.toString()) {
                        this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Modified, this.cell.modified.id, ['nb-cellAdded'], []);
                        insertOutputRenderListener.dispose();
                    }
                });
                this._register(insertOutputRenderListener);
            }
            this._outputViewContainer.style.display = 'block';
        }
        _decorate() {
            this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Modified, this.cell.modified.id, ['nb-cellAdded'], []);
        }
        _showOutputsRenderer() {
            if (this._outputViewContainer) {
                this._outputViewContainer.style.display = 'block';
                this._outputRightView?.showOutputs();
                this._decorate();
            }
        }
        _hideOutputsRenderer() {
            if (this._outputViewContainer) {
                this._outputViewContainer.style.display = 'none';
                this._outputRightView?.hideOutputs();
            }
        }
        layout(state) {
            DOM.scheduleAtNextAnimationFrame(() => {
                if (state.editorHeight || state.outerWidth) {
                    this._editor.layout({
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
                        height: this.cell.layoutInfo.editorHeight
                    });
                }
                if (state.metadataHeight || state.outerWidth) {
                    this._metadataEditor?.layout({
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true),
                        height: this.cell.layoutInfo.metadataHeight
                    });
                }
                if (state.outputTotalHeight || state.outerWidth) {
                    this._outputEditor?.layout({
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
                        height: this.cell.layoutInfo.outputTotalHeight
                    });
                }
                this.layoutNotebookCell();
                if (this._diagonalFill) {
                    this._diagonalFill.style.height = `${this.cell.layoutInfo.editorHeight + this.cell.layoutInfo.editorMargin + this.cell.layoutInfo.metadataStatusHeight + this.cell.layoutInfo.metadataHeight + this.cell.layoutInfo.outputTotalHeight + this.cell.layoutInfo.outputStatusHeight}px`;
                }
            });
        }
        dispose() {
            if (this._editor) {
                this.cell.saveSpirceEditorViewState(this._editor.saveViewState());
            }
            super.dispose();
        }
    };
    exports.InsertElement = InsertElement;
    exports.InsertElement = InsertElement = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, language_1.ILanguageService),
        __param(5, model_1.IModelService),
        __param(6, resolverService_1.ITextModelService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, notification_1.INotificationService),
        __param(10, actions_1.IMenuService),
        __param(11, contextkey_1.IContextKeyService),
        __param(12, configuration_1.IConfigurationService)
    ], InsertElement);
    let ModifiedElement = class ModifiedElement extends AbstractElementRenderer {
        constructor(notebookEditor, cell, templateData, instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService) {
            super(notebookEditor, cell, templateData, 'full', instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService);
            this.cell = cell;
            this.templateData = templateData;
            this._editorViewStateChanged = false;
        }
        init() { }
        styleContainer(container) {
            container.classList.remove('inserted', 'removed');
        }
        _disposeMetadata() {
            this.cell.metadataStatusHeight = 0;
            this.cell.metadataHeight = 0;
            this.templateData.metadataHeaderContainer.style.display = 'none';
            this.templateData.metadataInfoContainer.style.display = 'none';
            this._metadataEditor = undefined;
        }
        _buildMetadata() {
            this._metadataHeaderContainer = this.templateData.metadataHeaderContainer;
            this._metadataInfoContainer = this.templateData.metadataInfoContainer;
            this._metadataHeaderContainer.style.display = 'flex';
            this._metadataInfoContainer.style.display = 'block';
            this._metadataHeaderContainer.innerText = '';
            this._metadataInfoContainer.innerText = '';
            this._metadataHeader = this.instantiationService.createInstance(PropertyHeader, this.cell, this._metadataHeaderContainer, this.notebookEditor, {
                updateInfoRendering: this.updateMetadataRendering.bind(this),
                checkIfModified: (cell) => {
                    return cell.checkMetadataIfModified();
                },
                getFoldingState: (cell) => {
                    return cell.metadataFoldingState;
                },
                updateFoldingState: (cell, state) => {
                    cell.metadataFoldingState = state;
                },
                unChangedLabel: 'Metadata',
                changedLabel: 'Metadata changed',
                prefix: 'metadata',
                menuId: actions_1.MenuId.NotebookDiffCellMetadataTitle
            });
            this._metadataLocalDisposable.add(this._metadataHeader);
            this._metadataHeader.buildHeader();
        }
        _disposeOutput() {
            this._hideOutputsRaw();
            this._hideOutputsRenderer();
            this._hideOutputsEmptyView();
            this.cell.rawOutputHeight = 0;
            this.cell.outputStatusHeight = 0;
            this.templateData.outputHeaderContainer.style.display = 'none';
            this.templateData.outputInfoContainer.style.display = 'none';
            this._outputViewContainer = undefined;
        }
        _buildOutput() {
            this.templateData.outputHeaderContainer.style.display = 'flex';
            this.templateData.outputInfoContainer.style.display = 'block';
            this._outputHeaderContainer = this.templateData.outputHeaderContainer;
            this._outputInfoContainer = this.templateData.outputInfoContainer;
            this._outputHeaderContainer.innerText = '';
            this._outputInfoContainer.innerText = '';
            if (this.cell.checkIfOutputsModified()) {
                this._outputInfoContainer.classList.add('modified');
            }
            else {
                this._outputInfoContainer.classList.remove('modified');
            }
            this._outputHeader = this.instantiationService.createInstance(PropertyHeader, this.cell, this._outputHeaderContainer, this.notebookEditor, {
                updateInfoRendering: this.updateOutputRendering.bind(this),
                checkIfModified: (cell) => {
                    return cell.checkIfOutputsModified();
                },
                getFoldingState: (cell) => {
                    return cell.outputFoldingState;
                },
                updateFoldingState: (cell, state) => {
                    cell.outputFoldingState = state;
                },
                unChangedLabel: 'Outputs',
                changedLabel: 'Outputs changed',
                prefix: 'output',
                menuId: actions_1.MenuId.NotebookDiffCellOutputsTitle
            });
            this._outputLocalDisposable.add(this._outputHeader);
            this._outputHeader.buildHeader();
        }
        _buildOutputRendererContainer() {
            if (!this._outputViewContainer) {
                this._outputViewContainer = DOM.append(this._outputInfoContainer, DOM.$('.output-view-container'));
                this._outputEmptyElement = DOM.append(this._outputViewContainer, DOM.$('.output-empty-view'));
                this._outputEmptyElement.innerText = 'No outputs to render';
                if (!this.cell.checkIfOutputsModified() && this.cell.modified.outputs.length === 0) {
                    this._outputEmptyElement.style.display = 'block';
                }
                else {
                    this._outputEmptyElement.style.display = 'none';
                }
                this.cell.layoutChange();
                this._register(this.cell.modified.textModel.onDidChangeOutputs(() => {
                    // currently we only allow outputs change to the modified cell
                    if (!this.cell.checkIfOutputsModified() && this.cell.modified.outputs.length === 0) {
                        this._outputEmptyElement.style.display = 'block';
                    }
                    else {
                        this._outputEmptyElement.style.display = 'none';
                    }
                    this._decorate();
                }));
                this._outputLeftContainer = DOM.append(this._outputViewContainer, DOM.$('.output-view-container-left'));
                this._outputRightContainer = DOM.append(this._outputViewContainer, DOM.$('.output-view-container-right'));
                this._outputMetadataContainer = DOM.append(this._outputViewContainer, DOM.$('.output-view-container-metadata'));
                const outputModified = this.cell.checkIfOutputsModified();
                const outputMetadataChangeOnly = outputModified
                    && outputModified.kind === 1 /* OutputComparison.Metadata */
                    && this.cell.original.outputs.length === 1
                    && this.cell.modified.outputs.length === 1
                    && (0, diffElementViewModel_1.outputEqual)(this.cell.original.outputs[0], this.cell.modified.outputs[0]) === 1 /* OutputComparison.Metadata */;
                if (outputModified && !outputMetadataChangeOnly) {
                    const originalOutputRenderListener = this.notebookEditor.onDidDynamicOutputRendered(e => {
                        if (e.cell.uri.toString() === this.cell.original.uri.toString() && this.cell.checkIfOutputsModified()) {
                            this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Original, this.cell.original.id, ['nb-cellDeleted'], []);
                            originalOutputRenderListener.dispose();
                        }
                    });
                    const modifiedOutputRenderListener = this.notebookEditor.onDidDynamicOutputRendered(e => {
                        if (e.cell.uri.toString() === this.cell.modified.uri.toString() && this.cell.checkIfOutputsModified()) {
                            this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Modified, this.cell.modified.id, ['nb-cellAdded'], []);
                            modifiedOutputRenderListener.dispose();
                        }
                    });
                    this._register(originalOutputRenderListener);
                    this._register(modifiedOutputRenderListener);
                }
                // We should use the original text model here
                this._outputLeftView = this.instantiationService.createInstance(diffElementOutputs_1.OutputContainer, this.notebookEditor, this.notebookEditor.textModel, this.cell, this.cell.original, notebookDiffEditorBrowser_1.DiffSide.Original, this._outputLeftContainer);
                this._outputLeftView.render();
                this._register(this._outputLeftView);
                this._outputRightView = this.instantiationService.createInstance(diffElementOutputs_1.OutputContainer, this.notebookEditor, this.notebookEditor.textModel, this.cell, this.cell.modified, notebookDiffEditorBrowser_1.DiffSide.Modified, this._outputRightContainer);
                this._outputRightView.render();
                this._register(this._outputRightView);
                if (outputModified && !outputMetadataChangeOnly) {
                    this._decorate();
                }
                if (outputMetadataChangeOnly) {
                    this._outputMetadataContainer.style.top = `${this.cell.layoutInfo.rawOutputHeight}px`;
                    // single output, metadata change, let's render a diff editor for metadata
                    this._outputMetadataEditor = this.instantiationService.createInstance(diffEditorWidget_1.DiffEditorWidget, this._outputMetadataContainer, {
                        ...diffCellEditorOptions_1.fixedDiffEditorOptions,
                        overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
                        readOnly: true,
                        ignoreTrimWhitespace: false,
                        automaticLayout: false,
                        dimension: {
                            height: diffElementViewModel_1.OUTPUT_EDITOR_HEIGHT_MAGIC,
                            width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true)
                        }
                    }, {
                        originalEditor: getOptimizedNestedCodeEditorWidgetOptions(),
                        modifiedEditor: getOptimizedNestedCodeEditorWidgetOptions()
                    });
                    this._register(this._outputMetadataEditor);
                    const originalOutputMetadataSource = JSON.stringify(this.cell.original.outputs[0].metadata ?? {}, undefined, '\t');
                    const modifiedOutputMetadataSource = JSON.stringify(this.cell.modified.outputs[0].metadata ?? {}, undefined, '\t');
                    const mode = this.languageService.createById('json');
                    const originalModel = this.modelService.createModel(originalOutputMetadataSource, mode, undefined, true);
                    const modifiedModel = this.modelService.createModel(modifiedOutputMetadataSource, mode, undefined, true);
                    this._outputMetadataEditor.setModel({
                        original: originalModel,
                        modified: modifiedModel
                    });
                    this.cell.outputMetadataHeight = this._outputMetadataEditor.getContentHeight();
                    this._register(this._outputMetadataEditor.onDidContentSizeChange((e) => {
                        this.cell.outputMetadataHeight = e.contentHeight;
                    }));
                }
            }
            this._outputViewContainer.style.display = 'block';
        }
        _decorate() {
            if (this.cell.checkIfOutputsModified()) {
                this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Original, this.cell.original.id, ['nb-cellDeleted'], []);
                this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Modified, this.cell.modified.id, ['nb-cellAdded'], []);
            }
            else {
                this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Original, this.cell.original.id, [], ['nb-cellDeleted']);
                this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Modified, this.cell.modified.id, [], ['nb-cellAdded']);
            }
        }
        _showOutputsRenderer() {
            if (this._outputViewContainer) {
                this._outputViewContainer.style.display = 'block';
                this._outputLeftView?.showOutputs();
                this._outputRightView?.showOutputs();
                this._outputMetadataEditor?.layout();
                this._decorate();
            }
        }
        _hideOutputsRenderer() {
            if (this._outputViewContainer) {
                this._outputViewContainer.style.display = 'none';
                this._outputLeftView?.hideOutputs();
                this._outputRightView?.hideOutputs();
            }
        }
        updateSourceEditor() {
            const modifiedCell = this.cell.modified;
            const lineCount = modifiedCell.textModel.textBuffer.getLineCount();
            const lineHeight = this.notebookEditor.getLayoutInfo().fontInfo.lineHeight || 17;
            const editorHeight = this.cell.layoutInfo.editorHeight !== 0 ? this.cell.layoutInfo.editorHeight : lineCount * lineHeight + diffCellEditorOptions_1.fixedEditorPadding.top + diffCellEditorOptions_1.fixedEditorPadding.bottom;
            this._editorContainer = this.templateData.editorContainer;
            this._editor = this.templateData.sourceEditor;
            this._editorContainer.classList.add('diff');
            this._editor.layout({
                width: this.notebookEditor.getLayoutInfo().width - 2 * notebookDiffEditorBrowser_1.DIFF_CELL_MARGIN,
                height: editorHeight
            });
            this._editorContainer.style.height = `${editorHeight}px`;
            this._register(this._editor.onDidContentSizeChange((e) => {
                if (e.contentHeightChanged && this.cell.layoutInfo.editorHeight !== e.contentHeight) {
                    this.cell.editorHeight = e.contentHeight;
                }
            }));
            this._initializeSourceDiffEditor();
            const scopedContextKeyService = this.contextKeyService.createScoped(this.templateData.inputToolbarContainer);
            this._register(scopedContextKeyService);
            const inputChanged = notebookDiffEditorBrowser_1.NOTEBOOK_DIFF_CELL_INPUT.bindTo(scopedContextKeyService);
            this._inputToolbarContainer = this.templateData.inputToolbarContainer;
            this._toolbar = this.templateData.toolbar;
            this._toolbar.context = {
                cell: this.cell
            };
            if (this.cell.modified.textModel.getValue() !== this.cell.original.textModel.getValue()) {
                this._inputToolbarContainer.style.display = 'block';
                inputChanged.set(true);
            }
            else {
                this._inputToolbarContainer.style.display = 'none';
                inputChanged.set(false);
            }
            this._register(this.cell.modified.textModel.onDidChangeContent(() => {
                if (this.cell.modified.textModel.getValue() !== this.cell.original.textModel.getValue()) {
                    this._inputToolbarContainer.style.display = 'block';
                    inputChanged.set(true);
                }
                else {
                    this._inputToolbarContainer.style.display = 'none';
                    inputChanged.set(false);
                }
            }));
            const menu = this.menuService.createMenu(actions_1.MenuId.NotebookDiffCellInputTitle, scopedContextKeyService);
            const actions = [];
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, actions);
            this._toolbar.setActions(actions);
            menu.dispose();
        }
        async _initializeSourceDiffEditor() {
            const originalCell = this.cell.original;
            const modifiedCell = this.cell.modified;
            const originalRef = await this.textModelService.createModelReference(originalCell.uri);
            const modifiedRef = await this.textModelService.createModelReference(modifiedCell.uri);
            if (this._isDisposed) {
                return;
            }
            const textModel = originalRef.object.textEditorModel;
            const modifiedTextModel = modifiedRef.object.textEditorModel;
            this._register(originalRef);
            this._register(modifiedRef);
            this._editor.setModel({
                original: textModel,
                modified: modifiedTextModel
            });
            const handleViewStateChange = () => {
                this._editorViewStateChanged = true;
            };
            const handleScrollChange = (e) => {
                if (e.scrollTopChanged || e.scrollLeftChanged) {
                    this._editorViewStateChanged = true;
                }
            };
            this._register(this._editor.getOriginalEditor().onDidChangeCursorSelection(handleViewStateChange));
            this._register(this._editor.getOriginalEditor().onDidScrollChange(handleScrollChange));
            this._register(this._editor.getModifiedEditor().onDidChangeCursorSelection(handleViewStateChange));
            this._register(this._editor.getModifiedEditor().onDidScrollChange(handleScrollChange));
            const editorViewState = this.cell.getSourceEditorViewState();
            if (editorViewState) {
                this._editor.restoreViewState(editorViewState);
            }
            const contentHeight = this._editor.getContentHeight();
            this.cell.editorHeight = contentHeight;
        }
        layout(state) {
            DOM.scheduleAtNextAnimationFrame(() => {
                if (state.editorHeight) {
                    this._editorContainer.style.height = `${this.cell.layoutInfo.editorHeight}px`;
                    this._editor.layout({
                        width: this._editor.getViewWidth(),
                        height: this.cell.layoutInfo.editorHeight
                    });
                }
                if (state.outerWidth) {
                    this._editorContainer.style.height = `${this.cell.layoutInfo.editorHeight}px`;
                    this._editor.layout();
                }
                if (state.metadataHeight || state.outerWidth) {
                    if (this._metadataEditorContainer) {
                        this._metadataEditorContainer.style.height = `${this.cell.layoutInfo.metadataHeight}px`;
                        this._metadataEditor?.layout();
                    }
                }
                if (state.outputTotalHeight || state.outerWidth) {
                    if (this._outputEditorContainer) {
                        this._outputEditorContainer.style.height = `${this.cell.layoutInfo.outputTotalHeight}px`;
                        this._outputEditor?.layout();
                    }
                    if (this._outputMetadataContainer) {
                        this._outputMetadataContainer.style.height = `${this.cell.layoutInfo.outputMetadataHeight}px`;
                        this._outputMetadataContainer.style.top = `${this.cell.layoutInfo.outputTotalHeight - this.cell.layoutInfo.outputMetadataHeight}px`;
                        this._outputMetadataEditor?.layout();
                    }
                }
                this.layoutNotebookCell();
            });
        }
        dispose() {
            if (this._editor && this._editorViewStateChanged) {
                this.cell.saveSpirceEditorViewState(this._editor.saveViewState());
            }
            super.dispose();
        }
    };
    exports.ModifiedElement = ModifiedElement;
    exports.ModifiedElement = ModifiedElement = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, language_1.ILanguageService),
        __param(5, model_1.IModelService),
        __param(6, resolverService_1.ITextModelService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, notification_1.INotificationService),
        __param(10, actions_1.IMenuService),
        __param(11, contextkey_1.IContextKeyService),
        __param(12, configuration_1.IConfigurationService)
    ], ModifiedElement);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkNvbXBvbmVudHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2RpZmYvZGlmZkNvbXBvbmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMENoRyxTQUFnQix5Q0FBeUM7UUFDeEQsT0FBTztZQUNOLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLGFBQWEsRUFBRSwyQ0FBd0IsQ0FBQywwQkFBMEIsQ0FBQztnQkFDbEUsNkJBQWEsQ0FBQyxFQUFFO2dCQUNoQixxREFBZ0M7Z0JBQ2hDLG1DQUFxQixDQUFDLEVBQUU7Z0JBQ3hCLHFDQUFpQixDQUFDLEVBQUU7Z0JBQ3BCLHVDQUFrQixDQUFDLEVBQUU7Z0JBQ3JCLHVDQUF1QixDQUFDLEVBQUU7YUFDMUIsQ0FBQztTQUNGLENBQUM7SUFDSCxDQUFDO0lBWkQsOEZBWUM7SUFHRCxJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFlLFNBQVEsc0JBQVU7UUFRdEMsWUFDVSxJQUE4QixFQUM5Qix1QkFBb0MsRUFDcEMsY0FBdUMsRUFDdkMsUUFTUixFQUNxQyxrQkFBdUMsRUFDeEMsaUJBQXFDLEVBQ25DLG1CQUF5QyxFQUNqRCxXQUF5QixFQUNuQixpQkFBcUMsRUFDMUMsWUFBMkIsRUFDdkIsZ0JBQW1DLEVBQy9CLG9CQUEyQztZQUVuRixLQUFLLEVBQUUsQ0FBQztZQXRCQyxTQUFJLEdBQUosSUFBSSxDQUEwQjtZQUM5Qiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQWE7WUFDcEMsbUJBQWMsR0FBZCxjQUFjLENBQXlCO1lBQ3ZDLGFBQVEsR0FBUixRQUFRLENBU2hCO1lBQ3FDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDeEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNuQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENB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