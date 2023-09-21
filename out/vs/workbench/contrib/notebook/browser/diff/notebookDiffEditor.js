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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/arraysFind", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/base/common/cancellation", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/diff/notebookDiffList", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/notebook/common/services/notebookWorkerService", "vs/platform/configuration/common/configuration", "vs/editor/common/config/fontInfo", "vs/base/browser/browser", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/base/common/async", "vs/base/common/uuid", "vs/workbench/contrib/notebook/browser/diff/diffNestedCellViewModel", "vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView", "vs/workbench/contrib/notebook/browser/diff/eventDispatcher", "vs/editor/browser/config/fontMeasurements", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/contrib/notebook/browser/diff/notebookDiffOverviewRuler", "vs/platform/layout/browser/zIndexRegistry"], function (require, exports, nls, DOM, arraysFind_1, storage_1, telemetry_1, themeService_1, notebookEditorWidget_1, cancellation_1, diffElementViewModel_1, instantiation_1, notebookDiffList_1, contextkey_1, colorRegistry_1, notebookWorkerService_1, configuration_1, fontInfo_1, browser_1, notebookDiffEditorBrowser_1, event_1, lifecycle_1, editorPane_1, notebookCommon_1, async_1, uuid_1, diffNestedCellViewModel_1, backLayerWebView_1, eventDispatcher_1, fontMeasurements_1, notebookOptions_1, notebookExecutionStateService_1, notebookRange_1, notebookDiffOverviewRuler_1, zIndexRegistry_1) {
    "use strict";
    var NotebookTextDiffEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookTextDiffEditor = void 0;
    const $ = DOM.$;
    class NotebookDiffEditorSelection {
        constructor(selections) {
            this.selections = selections;
        }
        compare(other) {
            if (!(other instanceof NotebookDiffEditorSelection)) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            if (this.selections.length !== other.selections.length) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            for (let i = 0; i < this.selections.length; i++) {
                if (this.selections[i] !== other.selections[i]) {
                    return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
                }
            }
            return 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
        }
        restore(options) {
            const notebookOptions = {
                cellSelections: (0, notebookRange_1.cellIndexesToRanges)(this.selections)
            };
            Object.assign(notebookOptions, options);
            return notebookOptions;
        }
    }
    let NotebookTextDiffEditor = class NotebookTextDiffEditor extends editorPane_1.EditorPane {
        static { NotebookTextDiffEditor_1 = this; }
        static { this.ENTIRE_DIFF_OVERVIEW_WIDTH = 30; }
        static { this.ID = notebookCommon_1.NOTEBOOK_DIFF_EDITOR_ID; }
        get textModel() {
            return this._model?.modified.notebook;
        }
        get notebookOptions() {
            return this._notebookOptions;
        }
        get isDisposed() {
            return this._isDisposed;
        }
        constructor(instantiationService, themeService, contextKeyService, notebookEditorWorkerService, configurationService, telemetryService, storageService, notebookExecutionStateService) {
            super(NotebookTextDiffEditor_1.ID, telemetryService, themeService, storageService);
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.notebookEditorWorkerService = notebookEditorWorkerService;
            this.configurationService = configurationService;
            this.creationOptions = (0, notebookEditorWidget_1.getDefaultNotebookCreationOptions)();
            this._dimension = null;
            this._diffElementViewModels = [];
            this._modifiedWebview = null;
            this._originalWebview = null;
            this._webviewTransparentCover = null;
            this._onMouseUp = this._register(new event_1.Emitter());
            this.onMouseUp = this._onMouseUp.event;
            this._onDidScroll = this._register(new event_1.Emitter());
            this.onDidScroll = this._onDidScroll.event;
            this._model = null;
            this._modifiedResourceDisposableStore = this._register(new lifecycle_1.DisposableStore());
            this._insetModifyQueueByOutputId = new async_1.SequencerByKey();
            this._onDidDynamicOutputRendered = this._register(new event_1.Emitter());
            this.onDidDynamicOutputRendered = this._onDidDynamicOutputRendered.event;
            this._localStore = this._register(new lifecycle_1.DisposableStore());
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this._isDisposed = false;
            this.pendingLayouts = new WeakMap();
            this._notebookOptions = new notebookOptions_1.NotebookOptions(this.configurationService, notebookExecutionStateService, false);
            this._register(this._notebookOptions);
            const editorOptions = this.configurationService.getValue('editor');
            this._fontInfo = fontMeasurements_1.FontMeasurements.readFontInfo(fontInfo_1.BareFontInfo.createFromRawSettings(editorOptions, browser_1.PixelRatio.value));
            this._revealFirst = true;
        }
        isOverviewRulerEnabled() {
            return this.configurationService.getValue(notebookCommon_1.NotebookSetting.diffOverviewRuler) ?? false;
        }
        getSelection() {
            const selections = this._list.getFocus();
            return new NotebookDiffEditorSelection(selections);
        }
        toggleNotebookCellSelection(cell) {
            // throw new Error('Method not implemented.');
        }
        updatePerformanceMetadata(cellId, executionId, duration, rendererId) {
            // throw new Error('Method not implemented.');
        }
        async focusNotebookCell(cell, focus) {
            // throw new Error('Method not implemented.');
        }
        async focusNextNotebookCell(cell, focus) {
            // throw new Error('Method not implemented.');
        }
        didFocusOutputInputChange(inputFocused) {
            // noop
        }
        getScrollTop() {
            return this._list?.scrollTop ?? 0;
        }
        getScrollHeight() {
            return this._list?.scrollHeight ?? 0;
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this._list?.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        updateOutputHeight(cellInfo, output, outputHeight, isInit) {
            const diffElement = cellInfo.diffElement;
            const cell = this.getCellByInfo(cellInfo);
            const outputIndex = cell.outputsViewModels.indexOf(output);
            if (diffElement instanceof diffElementViewModel_1.SideBySideDiffElementViewModel) {
                const info = notebookCommon_1.CellUri.parse(cellInfo.cellUri);
                if (!info) {
                    return;
                }
                diffElement.updateOutputHeight(info.notebook.toString() === this._model?.original.resource.toString() ? notebookDiffEditorBrowser_1.DiffSide.Original : notebookDiffEditorBrowser_1.DiffSide.Modified, outputIndex, outputHeight);
            }
            else {
                diffElement.updateOutputHeight(diffElement.type === 'insert' ? notebookDiffEditorBrowser_1.DiffSide.Modified : notebookDiffEditorBrowser_1.DiffSide.Original, outputIndex, outputHeight);
            }
            if (isInit) {
                this._onDidDynamicOutputRendered.fire({ cell, output });
            }
        }
        setMarkupCellEditState(cellId, editState) {
            // throw new Error('Method not implemented.');
        }
        didStartDragMarkupCell(cellId, event) {
            // throw new Error('Method not implemented.');
        }
        didDragMarkupCell(cellId, event) {
            // throw new Error('Method not implemented.');
        }
        didEndDragMarkupCell(cellId) {
            // throw new Error('Method not implemented.');
        }
        didDropMarkupCell(cellId) {
            // throw new Error('Method not implemented.');
        }
        didResizeOutput(cellId) {
            // throw new Error('Method not implemented.');
        }
        createEditor(parent) {
            this._rootElement = DOM.append(parent, DOM.$('.notebook-text-diff-editor'));
            this._overflowContainer = document.createElement('div');
            this._overflowContainer.classList.add('notebook-overflow-widget-container', 'monaco-editor');
            DOM.append(parent, this._overflowContainer);
            const renderers = [
                this.instantiationService.createInstance(notebookDiffList_1.CellDiffSingleSideRenderer, this),
                this.instantiationService.createInstance(notebookDiffList_1.CellDiffSideBySideRenderer, this),
            ];
            this._listViewContainer = DOM.append(this._rootElement, DOM.$('.notebook-diff-list-view'));
            this._list = this.instantiationService.createInstance(notebookDiffList_1.NotebookTextDiffList, 'NotebookTextDiff', this._listViewContainer, this.instantiationService.createInstance(notebookDiffList_1.NotebookCellTextDiffListDelegate), renderers, this.contextKeyService, {
                setRowLineHeight: false,
                setRowHeight: false,
                supportDynamicHeights: true,
                horizontalScrolling: false,
                keyboardSupport: false,
                mouseSupport: true,
                multipleSelectionSupport: false,
                typeNavigationEnabled: true,
                paddingBottom: 0,
                // transformOptimization: (isMacintosh && isNative) || getTitleBarStyle(this.configurationService, this.environmentService) === 'native',
                styleController: (_suffix) => { return this._list; },
                overrideStyles: {
                    listBackground: colorRegistry_1.editorBackground,
                    listActiveSelectionBackground: colorRegistry_1.editorBackground,
                    listActiveSelectionForeground: colorRegistry_1.foreground,
                    listFocusAndSelectionBackground: colorRegistry_1.editorBackground,
                    listFocusAndSelectionForeground: colorRegistry_1.foreground,
                    listFocusBackground: colorRegistry_1.editorBackground,
                    listFocusForeground: colorRegistry_1.foreground,
                    listHoverForeground: colorRegistry_1.foreground,
                    listHoverBackground: colorRegistry_1.editorBackground,
                    listHoverOutline: colorRegistry_1.focusBorder,
                    listFocusOutline: colorRegistry_1.focusBorder,
                    listInactiveSelectionBackground: colorRegistry_1.editorBackground,
                    listInactiveSelectionForeground: colorRegistry_1.foreground,
                    listInactiveFocusBackground: colorRegistry_1.editorBackground,
                    listInactiveFocusOutline: colorRegistry_1.editorBackground,
                },
                accessibilityProvider: {
                    getAriaLabel() { return null; },
                    getWidgetAriaLabel() {
                        return nls.localize('notebookTreeAriaLabel', "Notebook Text Diff");
                    }
                },
                // focusNextPreviousDelegate: {
                // 	onFocusNext: (applyFocusNext: () => void) => this._updateForCursorNavigationMode(applyFocusNext),
                // 	onFocusPrevious: (applyFocusPrevious: () => void) => this._updateForCursorNavigationMode(applyFocusPrevious),
                // }
            });
            this._register(this._list);
            this._register(this._list.onMouseUp(e => {
                if (e.element) {
                    this._onMouseUp.fire({ event: e.browserEvent, target: e.element });
                }
            }));
            this._register(this._list.onDidScroll(() => {
                this._onDidScroll.fire();
            }));
            this._register(this._list.onDidChangeFocus(() => this._onDidChangeSelection.fire({ reason: 2 /* EditorPaneSelectionChangeReason.USER */ })));
            this._overviewRulerContainer = document.createElement('div');
            this._overviewRulerContainer.classList.add('notebook-overview-ruler-container');
            this._rootElement.appendChild(this._overviewRulerContainer);
            this._registerOverviewRuler();
            // transparent cover
            this._webviewTransparentCover = DOM.append(this._list.rowsContainer, $('.webview-cover'));
            this._webviewTransparentCover.style.display = 'none';
            this._register(DOM.addStandardDisposableGenericMouseDownListener(this._overflowContainer, (e) => {
                if (e.target.classList.contains('slider') && this._webviewTransparentCover) {
                    this._webviewTransparentCover.style.display = 'block';
                }
            }));
            this._register(DOM.addStandardDisposableGenericMouseUpListener(this._overflowContainer, () => {
                if (this._webviewTransparentCover) {
                    // no matter when
                    this._webviewTransparentCover.style.display = 'none';
                }
            }));
            this._register(this._list.onDidScroll(e => {
                this._webviewTransparentCover.style.top = `${e.scrollTop}px`;
            }));
        }
        _registerOverviewRuler() {
            this._overviewRuler = this._register(this.instantiationService.createInstance(notebookDiffOverviewRuler_1.NotebookDiffOverviewRuler, this, NotebookTextDiffEditor_1.ENTIRE_DIFF_OVERVIEW_WIDTH, this._overviewRulerContainer));
        }
        _updateOutputsOffsetsInWebview(scrollTop, scrollHeight, activeWebview, getActiveNestedCell, diffSide) {
            activeWebview.element.style.height = `${scrollHeight}px`;
            if (activeWebview.insetMapping) {
                const updateItems = [];
                const removedItems = [];
                activeWebview.insetMapping.forEach((value, key) => {
                    const cell = getActiveNestedCell(value.cellInfo.diffElement);
                    if (!cell) {
                        return;
                    }
                    const viewIndex = this._list.indexOf(value.cellInfo.diffElement);
                    if (viewIndex === undefined) {
                        return;
                    }
                    if (cell.outputsViewModels.indexOf(key) < 0) {
                        // output is already gone
                        removedItems.push(key);
                    }
                    else {
                        const cellTop = this._list.getCellViewScrollTop(value.cellInfo.diffElement);
                        const outputIndex = cell.outputsViewModels.indexOf(key);
                        const outputOffset = value.cellInfo.diffElement.getOutputOffsetInCell(diffSide, outputIndex);
                        updateItems.push({
                            cell,
                            output: key,
                            cellTop: cellTop,
                            outputOffset: outputOffset,
                            forceDisplay: false
                        });
                    }
                });
                activeWebview.removeInsets(removedItems);
                if (updateItems.length) {
                    activeWebview.updateScrollTops(updateItems, []);
                }
            }
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            const model = await input.resolve();
            if (this._model !== model) {
                this._detachModel();
                this._model = model;
                this._attachModel();
            }
            this._model = model;
            if (this._model === null) {
                return;
            }
            this._revealFirst = true;
            this._modifiedResourceDisposableStore.clear();
            this._layoutCancellationTokenSource = new cancellation_1.CancellationTokenSource();
            this._modifiedResourceDisposableStore.add(event_1.Event.any(this._model.original.notebook.onDidChangeContent, this._model.modified.notebook.onDidChangeContent)(e => {
                if (this._model !== null) {
                    this._layoutCancellationTokenSource?.dispose();
                    this._layoutCancellationTokenSource = new cancellation_1.CancellationTokenSource();
                    this.updateLayout(this._layoutCancellationTokenSource.token);
                }
            }));
            await this._createOriginalWebview((0, uuid_1.generateUuid)(), this._model.original.viewType, this._model.original.resource);
            if (this._originalWebview) {
                this._modifiedResourceDisposableStore.add(this._originalWebview);
            }
            await this._createModifiedWebview((0, uuid_1.generateUuid)(), this._model.modified.viewType, this._model.modified.resource);
            if (this._modifiedWebview) {
                this._modifiedResourceDisposableStore.add(this._modifiedWebview);
            }
            await this.updateLayout(this._layoutCancellationTokenSource.token, options?.cellSelections ? (0, notebookRange_1.cellRangesToIndexes)(options.cellSelections) : undefined);
        }
        _detachModel() {
            this._localStore.clear();
            this._originalWebview?.dispose();
            this._originalWebview?.element.remove();
            this._originalWebview = null;
            this._modifiedWebview?.dispose();
            this._modifiedWebview?.element.remove();
            this._modifiedWebview = null;
            this._modifiedResourceDisposableStore.clear();
            this._list.clear();
        }
        _attachModel() {
            this._eventDispatcher = new eventDispatcher_1.NotebookDiffEditorEventDispatcher();
            const updateInsets = () => {
                DOM.scheduleAtNextAnimationFrame(() => {
                    if (this._isDisposed) {
                        return;
                    }
                    if (this._modifiedWebview) {
                        this._updateOutputsOffsetsInWebview(this._list.scrollTop, this._list.scrollHeight, this._modifiedWebview, (diffElement) => {
                            return diffElement.modified;
                        }, notebookDiffEditorBrowser_1.DiffSide.Modified);
                    }
                    if (this._originalWebview) {
                        this._updateOutputsOffsetsInWebview(this._list.scrollTop, this._list.scrollHeight, this._originalWebview, (diffElement) => {
                            return diffElement.original;
                        }, notebookDiffEditorBrowser_1.DiffSide.Original);
                    }
                });
            };
            this._localStore.add(this._list.onDidChangeContentHeight(() => {
                updateInsets();
            }));
            this._localStore.add(this._eventDispatcher.onDidChangeCellLayout(() => {
                updateInsets();
            }));
        }
        async _createModifiedWebview(id, viewType, resource) {
            this._modifiedWebview?.dispose();
            this._modifiedWebview = this.instantiationService.createInstance(backLayerWebView_1.BackLayerWebView, this, id, viewType, resource, {
                ...this._notebookOptions.computeDiffWebviewOptions(),
                fontFamily: this._generateFontFamily()
            }, undefined);
            // attach the webview container to the DOM tree first
            this._list.rowsContainer.insertAdjacentElement('afterbegin', this._modifiedWebview.element);
            this._modifiedWebview.createWebview();
            this._modifiedWebview.element.style.width = `calc(50% - 16px)`;
            this._modifiedWebview.element.style.left = `calc(50%)`;
        }
        _generateFontFamily() {
            return this._fontInfo?.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
        }
        async _createOriginalWebview(id, viewType, resource) {
            this._originalWebview?.dispose();
            this._originalWebview = this.instantiationService.createInstance(backLayerWebView_1.BackLayerWebView, this, id, viewType, resource, {
                ...this._notebookOptions.computeDiffWebviewOptions(),
                fontFamily: this._generateFontFamily()
            }, undefined);
            // attach the webview container to the DOM tree first
            this._list.rowsContainer.insertAdjacentElement('afterbegin', this._originalWebview.element);
            this._originalWebview.createWebview();
            this._originalWebview.element.style.width = `calc(50% - 16px)`;
            this._originalWebview.element.style.left = `16px`;
        }
        setOptions(options) {
            const selections = options?.cellSelections ? (0, notebookRange_1.cellRangesToIndexes)(options.cellSelections) : undefined;
            if (selections) {
                this._list.setFocus(selections);
            }
        }
        async updateLayout(token, selections) {
            if (!this._model) {
                return;
            }
            const diffResult = await this.notebookEditorWorkerService.computeDiff(this._model.original.resource, this._model.modified.resource);
            if (token.isCancellationRequested) {
                // after await the editor might be disposed.
                return;
            }
            NotebookTextDiffEditor_1.prettyChanges(this._model, diffResult.cellsDiff);
            const { viewModels, firstChangeIndex } = NotebookTextDiffEditor_1.computeDiff(this.instantiationService, this.configurationService, this._model, this._eventDispatcher, diffResult, this._fontInfo);
            const isSame = this._isViewModelTheSame(viewModels);
            if (!isSame) {
                this._originalWebview?.removeInsets([...this._originalWebview?.insetMapping.keys()]);
                this._modifiedWebview?.removeInsets([...this._modifiedWebview?.insetMapping.keys()]);
                this._setViewModel(viewModels);
            }
            // this._diffElementViewModels = viewModels;
            // this._list.splice(0, this._list.length, this._diffElementViewModels);
            if (this._revealFirst && firstChangeIndex !== -1 && firstChangeIndex < this._list.length) {
                this._revealFirst = false;
                this._list.setFocus([firstChangeIndex]);
                this._list.reveal(firstChangeIndex, 0.3);
            }
            if (selections) {
                this._list.setFocus(selections);
            }
        }
        _isViewModelTheSame(viewModels) {
            let isSame = true;
            if (this._diffElementViewModels.length === viewModels.length) {
                for (let i = 0; i < viewModels.length; i++) {
                    const a = this._diffElementViewModels[i];
                    const b = viewModels[i];
                    if (a.original?.textModel.getHashValue() !== b.original?.textModel.getHashValue()
                        || a.modified?.textModel.getHashValue() !== b.modified?.textModel.getHashValue()) {
                        isSame = false;
                        break;
                    }
                }
            }
            else {
                isSame = false;
            }
            return isSame;
        }
        _setViewModel(viewModels) {
            this._diffElementViewModels = viewModels;
            this._list.splice(0, this._list.length, this._diffElementViewModels);
            if (this.isOverviewRulerEnabled()) {
                this._overviewRuler.updateViewModels(this._diffElementViewModels, this._eventDispatcher);
            }
        }
        /**
         * making sure that swapping cells are always translated to `insert+delete`.
         */
        static prettyChanges(model, diffResult) {
            const changes = diffResult.changes;
            for (let i = 0; i < diffResult.changes.length - 1; i++) {
                // then we know there is another change after current one
                const curr = changes[i];
                const next = changes[i + 1];
                const x = curr.originalStart;
                const y = curr.modifiedStart;
                if (curr.originalLength === 1
                    && curr.modifiedLength === 0
                    && next.originalStart === x + 2
                    && next.originalLength === 0
                    && next.modifiedStart === y + 1
                    && next.modifiedLength === 1
                    && model.original.notebook.cells[x].getHashValue() === model.modified.notebook.cells[y + 1].getHashValue()
                    && model.original.notebook.cells[x + 1].getHashValue() === model.modified.notebook.cells[y].getHashValue()) {
                    // this is a swap
                    curr.originalStart = x;
                    curr.originalLength = 0;
                    curr.modifiedStart = y;
                    curr.modifiedLength = 1;
                    next.originalStart = x + 1;
                    next.originalLength = 1;
                    next.modifiedStart = y + 2;
                    next.modifiedLength = 0;
                    i++;
                }
            }
        }
        static computeDiff(instantiationService, configurationService, model, eventDispatcher, diffResult, fontInfo) {
            const cellChanges = diffResult.cellsDiff.changes;
            const diffElementViewModels = [];
            const originalModel = model.original.notebook;
            const modifiedModel = model.modified.notebook;
            let originalCellIndex = 0;
            let modifiedCellIndex = 0;
            let firstChangeIndex = -1;
            const initData = {
                metadataStatusHeight: configurationService.getValue('notebook.diff.ignoreMetadata') ? 0 : 25,
                outputStatusHeight: configurationService.getValue('notebook.diff.ignoreOutputs') || !!(modifiedModel.transientOptions.transientOutputs) ? 0 : 25,
                fontInfo
            };
            for (let i = 0; i < cellChanges.length; i++) {
                const change = cellChanges[i];
                // common cells
                for (let j = 0; j < change.originalStart - originalCellIndex; j++) {
                    const originalCell = originalModel.cells[originalCellIndex + j];
                    const modifiedCell = modifiedModel.cells[modifiedCellIndex + j];
                    if (originalCell.getHashValue() === modifiedCell.getHashValue()) {
                        diffElementViewModels.push(new diffElementViewModel_1.SideBySideDiffElementViewModel(model.modified.notebook, model.original.notebook, instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, originalCell), instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, modifiedCell), 'unchanged', eventDispatcher, initData));
                    }
                    else {
                        if (firstChangeIndex === -1) {
                            firstChangeIndex = diffElementViewModels.length;
                        }
                        diffElementViewModels.push(new diffElementViewModel_1.SideBySideDiffElementViewModel(model.modified.notebook, model.original.notebook, instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, originalCell), instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, modifiedCell), 'modified', eventDispatcher, initData));
                    }
                }
                const modifiedLCS = NotebookTextDiffEditor_1.computeModifiedLCS(instantiationService, change, originalModel, modifiedModel, eventDispatcher, initData);
                if (modifiedLCS.length && firstChangeIndex === -1) {
                    firstChangeIndex = diffElementViewModels.length;
                }
                diffElementViewModels.push(...modifiedLCS);
                originalCellIndex = change.originalStart + change.originalLength;
                modifiedCellIndex = change.modifiedStart + change.modifiedLength;
            }
            for (let i = originalCellIndex; i < originalModel.cells.length; i++) {
                diffElementViewModels.push(new diffElementViewModel_1.SideBySideDiffElementViewModel(model.modified.notebook, model.original.notebook, instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, originalModel.cells[i]), instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, modifiedModel.cells[i - originalCellIndex + modifiedCellIndex]), 'unchanged', eventDispatcher, initData));
            }
            return {
                viewModels: diffElementViewModels,
                firstChangeIndex
            };
        }
        static computeModifiedLCS(instantiationService, change, originalModel, modifiedModel, eventDispatcher, initData) {
            const result = [];
            // modified cells
            const modifiedLen = Math.min(change.originalLength, change.modifiedLength);
            for (let j = 0; j < modifiedLen; j++) {
                const isTheSame = originalModel.cells[change.originalStart + j].equal(modifiedModel.cells[change.modifiedStart + j]);
                result.push(new diffElementViewModel_1.SideBySideDiffElementViewModel(modifiedModel, originalModel, instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, originalModel.cells[change.originalStart + j]), instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, modifiedModel.cells[change.modifiedStart + j]), isTheSame ? 'unchanged' : 'modified', eventDispatcher, initData));
            }
            for (let j = modifiedLen; j < change.originalLength; j++) {
                // deletion
                result.push(new diffElementViewModel_1.SingleSideDiffElementViewModel(originalModel, modifiedModel, instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, originalModel.cells[change.originalStart + j]), undefined, 'delete', eventDispatcher, initData));
            }
            for (let j = modifiedLen; j < change.modifiedLength; j++) {
                // insertion
                result.push(new diffElementViewModel_1.SingleSideDiffElementViewModel(modifiedModel, originalModel, undefined, instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, modifiedModel.cells[change.modifiedStart + j]), 'insert', eventDispatcher, initData));
            }
            return result;
        }
        scheduleOutputHeightAck(cellInfo, outputId, height) {
            const diffElement = cellInfo.diffElement;
            // const activeWebview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
            let diffSide = notebookDiffEditorBrowser_1.DiffSide.Original;
            if (diffElement instanceof diffElementViewModel_1.SideBySideDiffElementViewModel) {
                const info = notebookCommon_1.CellUri.parse(cellInfo.cellUri);
                if (!info) {
                    return;
                }
                diffSide = info.notebook.toString() === this._model?.original.resource.toString() ? notebookDiffEditorBrowser_1.DiffSide.Original : notebookDiffEditorBrowser_1.DiffSide.Modified;
            }
            else {
                diffSide = diffElement.type === 'insert' ? notebookDiffEditorBrowser_1.DiffSide.Modified : notebookDiffEditorBrowser_1.DiffSide.Original;
            }
            const webview = diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
            DOM.scheduleAtNextAnimationFrame(() => {
                webview?.ackHeight([{ cellId: cellInfo.cellId, outputId, height }]);
            }, 10);
        }
        layoutNotebookCell(cell, height) {
            const relayout = (cell, height) => {
                this._list.updateElementHeight2(cell, height);
            };
            if (this.pendingLayouts.has(cell)) {
                this.pendingLayouts.get(cell).dispose();
            }
            let r;
            const layoutDisposable = DOM.scheduleAtNextAnimationFrame(() => {
                this.pendingLayouts.delete(cell);
                relayout(cell, height);
                r();
            });
            this.pendingLayouts.set(cell, (0, lifecycle_1.toDisposable)(() => {
                layoutDisposable.dispose();
                r();
            }));
            return new Promise(resolve => { r = resolve; });
        }
        setScrollTop(scrollTop) {
            this._list.scrollTop = scrollTop;
        }
        triggerScroll(event) {
            this._list.triggerScrollFromMouseWheelEvent(event);
        }
        previousChange() {
            let currFocus = this._list.getFocus()[0];
            if (isNaN(currFocus) || currFocus < 0) {
                currFocus = 0;
            }
            // find the index of previous change
            let prevChangeIndex = currFocus - 1;
            while (prevChangeIndex >= 0) {
                const vm = this._diffElementViewModels[prevChangeIndex];
                if (vm.type !== 'unchanged') {
                    break;
                }
                prevChangeIndex--;
            }
            if (prevChangeIndex >= 0) {
                this._list.setFocus([prevChangeIndex]);
                this._list.reveal(prevChangeIndex);
            }
            else {
                // go to the last one
                const index = (0, arraysFind_1.findLastIdx)(this._diffElementViewModels, vm => vm.type !== 'unchanged');
                if (index >= 0) {
                    this._list.setFocus([index]);
                    this._list.reveal(index);
                }
            }
        }
        nextChange() {
            let currFocus = this._list.getFocus()[0];
            if (isNaN(currFocus) || currFocus < 0) {
                currFocus = 0;
            }
            // find the index of next change
            let nextChangeIndex = currFocus + 1;
            while (nextChangeIndex < this._diffElementViewModels.length) {
                const vm = this._diffElementViewModels[nextChangeIndex];
                if (vm.type !== 'unchanged') {
                    break;
                }
                nextChangeIndex++;
            }
            if (nextChangeIndex < this._diffElementViewModels.length) {
                this._list.setFocus([nextChangeIndex]);
                this._list.reveal(nextChangeIndex);
            }
            else {
                // go to the first one
                const index = this._diffElementViewModels.findIndex(vm => vm.type !== 'unchanged');
                if (index >= 0) {
                    this._list.setFocus([index]);
                    this._list.reveal(index);
                }
            }
        }
        createOutput(cellDiffViewModel, cellViewModel, output, getOffset, diffSide) {
            this._insetModifyQueueByOutputId.queue(output.source.model.outputId + (diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? '-right' : 'left'), async () => {
                const activeWebview = diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
                if (!activeWebview) {
                    return;
                }
                if (!activeWebview.insetMapping.has(output.source)) {
                    const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
                    await activeWebview.createOutput({ diffElement: cellDiffViewModel, cellHandle: cellViewModel.handle, cellId: cellViewModel.id, cellUri: cellViewModel.uri }, output, cellTop, getOffset());
                }
                else {
                    const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
                    const outputIndex = cellViewModel.outputsViewModels.indexOf(output.source);
                    const outputOffset = cellDiffViewModel.getOutputOffsetInCell(diffSide, outputIndex);
                    activeWebview.updateScrollTops([{
                            cell: cellViewModel,
                            output: output.source,
                            cellTop,
                            outputOffset,
                            forceDisplay: true
                        }], []);
                }
            });
        }
        updateMarkupCellHeight() {
            // TODO
        }
        getCellByInfo(cellInfo) {
            return cellInfo.diffElement.getCellByUri(cellInfo.cellUri);
        }
        getCellById(cellId) {
            throw new Error('Not implemented');
        }
        removeInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
            this._insetModifyQueueByOutputId.queue(displayOutput.model.outputId + (diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? '-right' : 'left'), async () => {
                const activeWebview = diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
                if (!activeWebview) {
                    return;
                }
                if (!activeWebview.insetMapping.has(displayOutput)) {
                    return;
                }
                activeWebview.removeInsets([displayOutput]);
            });
        }
        showInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
            this._insetModifyQueueByOutputId.queue(displayOutput.model.outputId + (diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? '-right' : 'left'), async () => {
                const activeWebview = diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
                if (!activeWebview) {
                    return;
                }
                if (!activeWebview.insetMapping.has(displayOutput)) {
                    return;
                }
                const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
                const outputIndex = cellViewModel.outputsViewModels.indexOf(displayOutput);
                const outputOffset = cellDiffViewModel.getOutputOffsetInCell(diffSide, outputIndex);
                activeWebview.updateScrollTops([{
                        cell: cellViewModel,
                        output: displayOutput,
                        cellTop,
                        outputOffset,
                        forceDisplay: true,
                    }], []);
            });
        }
        hideInset(cellDiffViewModel, cellViewModel, output) {
            this._modifiedWebview?.hideInset(output);
            this._originalWebview?.hideInset(output);
        }
        // private async _resolveWebview(rightEditor: boolean): Promise<BackLayerWebView | null> {
        // 	if (rightEditor) {
        // 	}
        // }
        getDomNode() {
            return this._rootElement;
        }
        getOverflowContainerDomNode() {
            return this._overflowContainer;
        }
        getControl() {
            return this;
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
        }
        focus() {
            super.focus();
        }
        clearInput() {
            super.clearInput();
            this._modifiedResourceDisposableStore.clear();
            this._list?.splice(0, this._list?.length || 0);
            this._model = null;
            this._diffElementViewModels.forEach(vm => vm.dispose());
            this._diffElementViewModels = [];
        }
        deltaCellOutputContainerClassNames(diffSide, cellId, added, removed) {
            if (diffSide === notebookDiffEditorBrowser_1.DiffSide.Original) {
                this._originalWebview?.deltaCellContainerClassNames(cellId, added, removed);
            }
            else {
                this._modifiedWebview?.deltaCellContainerClassNames(cellId, added, removed);
            }
        }
        getLayoutInfo() {
            if (!this._list) {
                throw new Error('Editor is not initalized successfully');
            }
            return {
                width: this._dimension.width,
                height: this._dimension.height,
                fontInfo: this._fontInfo,
                scrollHeight: this._list?.getScrollHeight() ?? 0,
                stickyHeight: 0,
            };
        }
        getCellOutputLayoutInfo(nestedCell) {
            if (!this._model) {
                throw new Error('Editor is not attached to model yet');
            }
            const documentModel = notebookCommon_1.CellUri.parse(nestedCell.uri);
            if (!documentModel) {
                throw new Error('Nested cell in the diff editor has wrong Uri');
            }
            const belongToOriginalDocument = this._model.original.notebook.uri.toString() === documentModel.notebook.toString();
            const viewModel = this._diffElementViewModels.find(element => {
                const textModel = belongToOriginalDocument ? element.original : element.modified;
                if (!textModel) {
                    return false;
                }
                if (textModel.uri.toString() === nestedCell.uri.toString()) {
                    return true;
                }
                return false;
            });
            if (!viewModel) {
                throw new Error('Nested cell in the diff editor does not match any diff element');
            }
            if (viewModel.type === 'unchanged') {
                return this.getLayoutInfo();
            }
            if (viewModel.type === 'insert' || viewModel.type === 'delete') {
                return {
                    width: this._dimension.width / 2,
                    height: this._dimension.height / 2,
                    fontInfo: this._fontInfo
                };
            }
            if (viewModel.checkIfOutputsModified()) {
                return {
                    width: this._dimension.width / 2,
                    height: this._dimension.height / 2,
                    fontInfo: this._fontInfo
                };
            }
            else {
                return this.getLayoutInfo();
            }
        }
        layout(dimension, _position) {
            this._rootElement.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
            this._rootElement.classList.toggle('narrow-width', dimension.width < 600);
            const overviewRulerEnabled = this.isOverviewRulerEnabled();
            this._dimension = dimension.with(dimension.width - (overviewRulerEnabled ? NotebookTextDiffEditor_1.ENTIRE_DIFF_OVERVIEW_WIDTH : 0));
            this._listViewContainer.style.height = `${dimension.height}px`;
            this._listViewContainer.style.width = `${this._dimension.width}px`;
            this._list?.layout(this._dimension.height, this._dimension.width);
            if (this._modifiedWebview) {
                this._modifiedWebview.element.style.width = `calc(50% - 16px)`;
                this._modifiedWebview.element.style.left = `calc(50%)`;
            }
            if (this._originalWebview) {
                this._originalWebview.element.style.width = `calc(50% - 16px)`;
                this._originalWebview.element.style.left = `16px`;
            }
            if (this._webviewTransparentCover) {
                this._webviewTransparentCover.style.height = `${this._dimension.height}px`;
                this._webviewTransparentCover.style.width = `${this._dimension.width}px`;
            }
            if (overviewRulerEnabled) {
                this._overviewRuler.layout();
            }
            this._eventDispatcher?.emit([new eventDispatcher_1.NotebookDiffLayoutChangedEvent({ width: true, fontInfo: true }, this.getLayoutInfo())]);
        }
        dispose() {
            this._isDisposed = true;
            this._layoutCancellationTokenSource?.dispose();
            this._detachModel();
            super.dispose();
        }
    };
    exports.NotebookTextDiffEditor = NotebookTextDiffEditor;
    exports.NotebookTextDiffEditor = NotebookTextDiffEditor = NotebookTextDiffEditor_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, themeService_1.IThemeService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, notebookWorkerService_1.INotebookEditorWorkerService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, storage_1.IStorageService),
        __param(7, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], NotebookTextDiffEditor);
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 10, 'notebook-diff-view-viewport-slider');
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const diffDiagonalFillColor = theme.getColor(colorRegistry_1.diffDiagonalFill);
        collector.addRule(`
	.notebook-text-diff-editor .diagonal-fill {
		background-image: linear-gradient(
			-45deg,
			${diffDiagonalFillColor} 12.5%,
			#0000 12.5%, #0000 50%,
			${diffDiagonalFillColor} 50%, ${diffDiagonalFillColor} 62.5%,
			#0000 62.5%, #0000 100%
		);
		background-size: 8px 8px;
	}
	`);
        collector.addRule(`.notebook-text-diff-editor .cell-body { margin: ${notebookDiffEditorBrowser_1.DIFF_CELL_MARGIN}px; }`);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tEaWZmRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9kaWZmL25vdGVib29rRGlmZkVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBK0NoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLE1BQU0sMkJBQTJCO1FBRWhDLFlBQ2tCLFVBQW9CO1lBQXBCLGVBQVUsR0FBVixVQUFVLENBQVU7UUFDbEMsQ0FBQztRQUVMLE9BQU8sQ0FBQyxLQUEyQjtZQUNsQyxJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksMkJBQTJCLENBQUMsRUFBRTtnQkFDcEQsMERBQWtEO2FBQ2xEO1lBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtnQkFDdkQsMERBQWtEO2FBQ2xEO1lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNoRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDL0MsMERBQWtEO2lCQUNsRDthQUNEO1lBRUQsMERBQWtEO1FBQ25ELENBQUM7UUFFRCxPQUFPLENBQUMsT0FBdUI7WUFDOUIsTUFBTSxlQUFlLEdBQTJCO2dCQUMvQyxjQUFjLEVBQUUsSUFBQSxtQ0FBbUIsRUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2FBQ3BELENBQUM7WUFFRixNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN4QyxP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