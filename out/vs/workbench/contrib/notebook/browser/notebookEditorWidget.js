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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uuid", "vs/editor/browser/config/fontMeasurements", "vs/editor/common/config/fontInfo", "vs/editor/common/core/range", "vs/editor/contrib/suggest/browser/suggestController", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/layout/browser/layoutService", "vs/platform/layout/browser/zIndexRegistry", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/browser/notebookLogger", "vs/workbench/contrib/notebook/browser/notebookViewEvents", "vs/workbench/contrib/notebook/browser/view/cellParts/cellContextKeys", "vs/workbench/contrib/notebook/browser/view/cellParts/cellDnd", "vs/workbench/contrib/notebook/browser/view/notebookCellList", "vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView", "vs/workbench/contrib/notebook/browser/view/renderers/cellRenderer", "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher", "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl", "vs/workbench/contrib/notebook/browser/viewModel/viewContext", "vs/workbench/contrib/notebook/browser/viewParts/notebookEditorToolbar", "vs/workbench/contrib/notebook/browser/viewParts/notebookEditorWidgetContextKeys", "vs/workbench/contrib/notebook/browser/viewParts/notebookOverviewRuler", "vs/workbench/contrib/notebook/browser/viewParts/notebookTopCellToolbar", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/workbench/contrib/notebook/common/notebookRendererMessagingService", "vs/workbench/contrib/notebook/common/notebookService", "vs/editor/browser/editorExtensions", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/contrib/notebook/browser/viewModel/cellEditorOptions", "vs/workbench/browser/codeeditor", "vs/workbench/contrib/notebook/browser/contrib/find/findModel", "vs/workbench/contrib/notebook/common/notebookLoggingService", "vs/base/common/network", "vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorController", "vs/editor/contrib/dropOrPasteInto/browser/copyPasteController", "vs/workbench/contrib/notebook/browser/viewParts/notebookEditorStickyScroll", "vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineProvider", "vs/platform/keybinding/common/keybinding", "vs/css!./media/notebook", "vs/css!./media/notebookCellEditorHint", "vs/css!./media/notebookCellInsertToolbar", "vs/css!./media/notebookCellStatusBar", "vs/css!./media/notebookCellTitleToolbar", "vs/css!./media/notebookFocusIndicator", "vs/css!./media/notebookToolbar", "vs/css!./media/notebookDnd", "vs/css!./media/notebookFolding", "vs/css!./media/notebookCellOutput", "vs/css!./media/notebookEditorStickyScroll", "vs/css!./media/notebookKernelActionViewItem", "vs/css!./media/notebookOutline"], function (require, exports, browser_1, DOM, async_1, color_1, errors_1, event_1, lifecycle_1, platform_1, resources_1, uuid_1, fontMeasurements_1, fontInfo_1, range_1, suggestController_1, nls, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, layoutService_1, zIndexRegistry_1, progress_1, telemetry_1, colorRegistry_1, theme_1, debugColors_1, notebookBrowser_1, notebookEditorExtensions_1, notebookEditorService_1, notebookLogger_1, notebookViewEvents_1, cellContextKeys_1, cellDnd_1, notebookCellList_1, backLayerWebView_1, cellRenderer_1, codeCellViewModel_1, eventDispatcher_1, markupCellViewModel_1, notebookViewModelImpl_1, viewContext_1, notebookEditorToolbar_1, notebookEditorWidgetContextKeys_1, notebookOverviewRuler_1, notebookTopCellToolbar_1, notebookCommon_1, notebookContextKeys_1, notebookExecutionService_1, notebookExecutionStateService_1, notebookKernelService_1, notebookOptions_1, notebookRendererMessagingService_1, notebookService_1, editorExtensions_1, editorGroupsService_1, cellEditorOptions_1, codeeditor_1, findModel_1, notebookLoggingService_1, network_1, dropIntoEditorController_1, copyPasteController_1, notebookEditorStickyScroll_1, notebookOutlineProvider_1, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cellEditorBackground = exports.cellSymbolHighlight = exports.listScrollbarSliderActiveBackground = exports.listScrollbarSliderHoverBackground = exports.listScrollbarSliderBackground = exports.cellInsertionIndicator = exports.cellStatusBarItemHover = exports.inactiveFocusedCellBorder = exports.focusedCellBorder = exports.inactiveSelectedCellBorder = exports.selectedCellBorder = exports.cellHoverBackground = exports.selectedCellBackground = exports.focusedCellBackground = exports.CELL_TOOLBAR_SEPERATOR = exports.notebookOutputContainerColor = exports.notebookOutputContainerBorderColor = exports.cellStatusIconRunning = exports.cellStatusIconError = exports.runningCellRulerDecorationColor = exports.cellStatusIconSuccess = exports.focusedEditorBorderColor = exports.notebookCellBorder = exports.NotebookEditorWidget = exports.getDefaultNotebookCreationOptions = void 0;
    const $ = DOM.$;
    function getDefaultNotebookCreationOptions() {
        // We inlined the id to avoid loading comment contrib in tests
        const skipContributions = [
            'editor.contrib.review',
            codeeditor_1.FloatingEditorClickMenu.ID,
            'editor.contrib.dirtydiff',
            'editor.contrib.testingOutputPeek',
            'editor.contrib.testingDecorations',
            'store.contrib.stickyScrollController',
            'editor.contrib.findController',
            'editor.contrib.emptyTextEditorHint'
        ];
        const contributions = editorExtensions_1.EditorExtensionsRegistry.getEditorContributions().filter(c => skipContributions.indexOf(c.id) === -1);
        return {
            menuIds: {
                notebookToolbar: actions_1.MenuId.NotebookToolbar,
                cellTitleToolbar: actions_1.MenuId.NotebookCellTitle,
                cellDeleteToolbar: actions_1.MenuId.NotebookCellDelete,
                cellInsertToolbar: actions_1.MenuId.NotebookCellBetween,
                cellTopInsertToolbar: actions_1.MenuId.NotebookCellListTop,
                cellExecuteToolbar: actions_1.MenuId.NotebookCellExecute,
                cellExecutePrimary: actions_1.MenuId.NotebookCellExecutePrimary,
            },
            cellEditorContributions: contributions
        };
    }
    exports.getDefaultNotebookCreationOptions = getDefaultNotebookCreationOptions;
    let NotebookEditorWidget = class NotebookEditorWidget extends lifecycle_1.Disposable {
        get isVisible() {
            return this._isVisible;
        }
        get isDisposed() {
            return this._isDisposed;
        }
        set viewModel(newModel) {
            this._onWillChangeModel.fire(this._notebookViewModel?.notebookDocument);
            this._notebookViewModel = newModel;
            this._onDidChangeModel.fire(newModel?.notebookDocument);
        }
        get viewModel() {
            return this._notebookViewModel;
        }
        get textModel() {
            return this._notebookViewModel?.notebookDocument;
        }
        get isReadOnly() {
            return this._notebookViewModel?.options.isReadOnly ?? false;
        }
        get activeCodeEditor() {
            if (this._isDisposed) {
                return;
            }
            const [focused] = this._list.getFocusedElements();
            return this._renderedEditors.get(focused);
        }
        get codeEditors() {
            return [...this._renderedEditors];
        }
        get visibleRanges() {
            return this._list.visibleRanges || [];
        }
        get notebookOptions() {
            return this._notebookOptions;
        }
        constructor(creationOptions, dimension, instantiationService, editorGroupsService, notebookRendererMessaging, notebookEditorService, notebookKernelService, _notebookService, configurationService, contextKeyService, layoutService, contextMenuService, telemetryService, notebookExecutionService, notebookExecutionStateService, editorProgressService, logService, keybindingService) {
            super();
            this.creationOptions = creationOptions;
            this.notebookRendererMessaging = notebookRendererMessaging;
            this.notebookEditorService = notebookEditorService;
            this.notebookKernelService = notebookKernelService;
            this._notebookService = _notebookService;
            this.configurationService = configurationService;
            this.layoutService = layoutService;
            this.contextMenuService = contextMenuService;
            this.telemetryService = telemetryService;
            this.notebookExecutionService = notebookExecutionService;
            this.editorProgressService = editorProgressService;
            this.logService = logService;
            this.keybindingService = keybindingService;
            //#region Eventing
            this._onDidChangeCellState = this._register(new event_1.Emitter());
            this.onDidChangeCellState = this._onDidChangeCellState.event;
            this._onDidChangeViewCells = this._register(new event_1.Emitter());
            this.onDidChangeViewCells = this._onDidChangeViewCells.event;
            this._onWillChangeModel = this._register(new event_1.Emitter());
            this.onWillChangeModel = this._onWillChangeModel.event;
            this._onDidChangeModel = this._register(new event_1.Emitter());
            this.onDidChangeModel = this._onDidChangeModel.event;
            this._onDidAttachViewModel = this._register(new event_1.Emitter());
            this.onDidAttachViewModel = this._onDidAttachViewModel.event;
            this._onDidChangeOptions = this._register(new event_1.Emitter());
            this.onDidChangeOptions = this._onDidChangeOptions.event;
            this._onDidChangeDecorations = this._register(new event_1.Emitter());
            this.onDidChangeDecorations = this._onDidChangeDecorations.event;
            this._onDidScroll = this._register(new event_1.Emitter());
            this.onDidScroll = this._onDidScroll.event;
            this._onDidChangeActiveCell = this._register(new event_1.Emitter());
            this.onDidChangeActiveCell = this._onDidChangeActiveCell.event;
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this._onDidChangeVisibleRanges = this._register(new event_1.Emitter());
            this.onDidChangeVisibleRanges = this._onDidChangeVisibleRanges.event;
            this._onDidFocusEmitter = this._register(new event_1.Emitter());
            this.onDidFocusWidget = this._onDidFocusEmitter.event;
            this._onDidBlurEmitter = this._register(new event_1.Emitter());
            this.onDidBlurWidget = this._onDidBlurEmitter.event;
            this._onDidChangeActiveEditor = this._register(new event_1.Emitter());
            this.onDidChangeActiveEditor = this._onDidChangeActiveEditor.event;
            this._onDidChangeActiveKernel = this._register(new event_1.Emitter());
            this.onDidChangeActiveKernel = this._onDidChangeActiveKernel.event;
            this._onMouseUp = this._register(new event_1.Emitter());
            this.onMouseUp = this._onMouseUp.event;
            this._onMouseDown = this._register(new event_1.Emitter());
            this.onMouseDown = this._onMouseDown.event;
            this._onDidReceiveMessage = this._register(new event_1.Emitter());
            this.onDidReceiveMessage = this._onDidReceiveMessage.event;
            this._onDidRenderOutput = this._register(new event_1.Emitter());
            this.onDidRenderOutput = this._onDidRenderOutput.event;
            this._onDidRemoveOutput = this._register(new event_1.Emitter());
            this.onDidRemoveOutput = this._onDidRemoveOutput.event;
            this._onDidResizeOutputEmitter = this._register(new event_1.Emitter());
            this.onDidResizeOutput = this._onDidResizeOutputEmitter.event;
            this._webview = null;
            this._webviewResolvePromise = null;
            this._webviewTransparentCover = null;
            this._listDelegate = null;
            this._dndController = null;
            this._listTopCellToolbar = null;
            this._renderedEditors = new Map();
            this._localStore = this._register(new lifecycle_1.DisposableStore());
            this._localCellStateListeners = [];
            this._shadowElementViewInfo = null;
            this._contributions = new Map();
            this._insetModifyQueueByOutputId = new async_1.SequencerByKey();
            this._cellContextKeyManager = null;
            this._uuid = (0, uuid_1.generateUuid)();
            this._webviewFocused = false;
            this._isVisible = false;
            this._isDisposed = false;
            this._baseCellEditorOptions = new Map();
            this._debugFlag = false;
            this._backgroundMarkdownRenderRunning = false;
            this._lastCellWithEditorFocus = null;
            //#endregion
            //#region Cell operations/layout API
            this._pendingLayouts = new WeakMap();
            this._pendingOutputHeightAcks = new Map();
            this._dimension = dimension;
            this.isEmbedded = creationOptions.isEmbedded ?? false;
            this._readOnly = creationOptions.isReadOnly ?? false;
            this._notebookOptions = creationOptions.options ?? new notebookOptions_1.NotebookOptions(this.configurationService, notebookExecutionStateService, this._readOnly);
            this._register(this._notebookOptions);
            this._viewContext = new viewContext_1.ViewContext(this._notebookOptions, new eventDispatcher_1.NotebookEventDispatcher(), language => this.getBaseCellEditorOptions(language));
            this._register(this._viewContext.eventDispatcher.onDidChangeCellState(e => {
                this._onDidChangeCellState.fire(e);
            }));
            this._overlayContainer = document.createElement('div');
            this.scopedContextKeyService = contextKeyService.createScoped(this._overlayContainer);
            this.instantiationService = instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService]));
            this._register(_notebookService.onDidChangeOutputRenderers(() => {
                this._updateOutputRenderers();
            }));
            this._register(this.instantiationService.createInstance(notebookEditorWidgetContextKeys_1.NotebookEditorContextKeys, this));
            this._notebookOutline = this._register(this.instantiationService.createInstance(notebookOutlineProvider_1.NotebookCellOutlineProvider, this, 4 /* OutlineTarget.QuickPick */));
            this._register(notebookKernelService.onDidChangeSelectedNotebooks(e => {
                if ((0, resources_1.isEqual)(e.notebook, this.viewModel?.uri)) {
                    this._loadKernelPreloads();
                    this._onDidChangeActiveKernel.fire();
                }
            }));
            this._scrollBeyondLastLine = this.configurationService.getValue('editor.scrollBeyondLastLine');
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor.scrollBeyondLastLine')) {
                    this._scrollBeyondLastLine = this.configurationService.getValue('editor.scrollBeyondLastLine');
                    if (this._dimension && this._isVisible) {
                        this.layout(this._dimension);
                    }
                }
            }));
            this._register(this._notebookOptions.onDidChangeOptions(e => {
                if (e.cellStatusBarVisibility || e.cellToolbarLocation || e.cellToolbarInteraction) {
                    this._updateForNotebookConfiguration();
                }
                if (e.fontFamily) {
                    this._generateFontInfo();
                }
                if (e.compactView
                    || e.focusIndicator
                    || e.insertToolbarPosition
                    || e.cellToolbarLocation
                    || e.dragAndDropEnabled
                    || e.fontSize
                    || e.markupFontSize
                    || e.fontFamily
                    || e.insertToolbarAlignment
                    || e.outputFontSize
                    || e.outputLineHeight
                    || e.outputFontFamily
                    || e.outputWordWrap
                    || e.outputScrolling) {
                    this._styleElement?.remove();
                    this._createLayoutStyles();
                    this._webview?.updateOptions({
                        ...this.notebookOptions.computeWebviewOptions(),
                        fontFamily: this._generateFontFamily()
                    });
                }
                if (this._dimension && this._isVisible) {
                    this.layout(this._dimension);
                }
            }));
            this._register(editorGroupsService.onDidScroll(e => {
                if (!this._shadowElement || !this._isVisible) {
                    return;
                }
                this.updateShadowElement(this._shadowElement, this._dimension);
                this.layoutContainerOverShadowElement(this._dimension, this._position);
            }));
            this.notebookEditorService.addNotebookEditor(this);
            const id = (0, uuid_1.generateUuid)();
            this._overlayContainer.id = `notebook-${id}`;
            this._overlayContainer.className = 'notebookOverlay';
            this._overlayContainer.classList.add('notebook-editor');
            this._overlayContainer.style.visibility = 'hidden';
            this.layoutService.container.appendChild(this._overlayContainer);
            this._createBody(this._overlayContainer);
            this._generateFontInfo();
            this._isVisible = true;
            this._editorFocus = notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED.bindTo(this.scopedContextKeyService);
            this._outputFocus = notebookContextKeys_1.NOTEBOOK_OUTPUT_FOCUSED.bindTo(this.scopedContextKeyService);
            this._outputInputFocus = notebookContextKeys_1.NOTEBOOK_OUPTUT_INPUT_FOCUSED.bindTo(this.scopedContextKeyService);
            this._editorEditable = notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.bindTo(this.scopedContextKeyService);
            this._cursorNavMode = notebookContextKeys_1.NOTEBOOK_CURSOR_NAVIGATION_MODE.bindTo(this.scopedContextKeyService);
            this._editorEditable.set(!creationOptions.isReadOnly);
            let contributions;
            if (Array.isArray(this.creationOptions.contributions)) {
                contributions = this.creationOptions.contributions;
            }
            else {
                contributions = notebookEditorExtensions_1.NotebookEditorExtensionsRegistry.getEditorContributions();
            }
            for (const desc of contributions) {
                let contribution;
                try {
                    contribution = this.instantiationService.createInstance(desc.ctor, this);
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
                if (contribution) {
                    if (!this._contributions.has(desc.id)) {
                        this._contributions.set(desc.id, contribution);
                    }
                    else {
                        contribution.dispose();
                        throw new Error(`DUPLICATE notebook editor contribution: '${desc.id}'`);
                    }
                }
            }
            this._updateForNotebookConfiguration();
        }
        _debug(...args) {
            if (!this._debugFlag) {
                return;
            }
            (0, notebookLogger_1.notebookDebug)(...args);
        }
        /**
         * EditorId
         */
        getId() {
            return this._uuid;
        }
        getViewModel() {
            return this.viewModel;
        }
        getLength() {
            return this.viewModel?.length ?? 0;
        }
        getSelections() {
            return this.viewModel?.getSelections() ?? [];
        }
        setSelections(selections) {
            if (!this.viewModel) {
                return;
            }
            const focus = this.viewModel.getFocus();
            this.viewModel.updateSelectionsState({
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: focus,
                selections: selections
            });
        }
        getFocus() {
            return this.viewModel?.getFocus() ?? { start: 0, end: 0 };
        }
        setFocus(focus) {
            if (!this.viewModel) {
                return;
            }
            const selections = this.viewModel.getSelections();
            this.viewModel.updateSelectionsState({
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: focus,
                selections: selections
            });
        }
        getSelectionViewModels() {
            if (!this.viewModel) {
                return [];
            }
            const cellsSet = new Set();
            return this.viewModel.getSelections().map(range => this.viewModel.viewCells.slice(range.start, range.end)).reduce((a, b) => {
                b.forEach(cell => {
                    if (!cellsSet.has(cell.handle)) {
                        cellsSet.add(cell.handle);
                        a.push(cell);
                    }
                });
                return a;
            }, []);
        }
        hasModel() {
            return !!this._notebookViewModel;
        }
        showProgress() {
            this._currentProgress = this.editorProgressService.show(true);
        }
        hideProgress() {
            if (this._currentProgress) {
                this._currentProgress.done();
                this._currentProgress = undefined;
            }
        }
        //#region Editor Core
        getBaseCellEditorOptions(language) {
            const existingOptions = this._baseCellEditorOptions.get(language);
            if (existingOptions) {
                return existingOptions;
            }
            else {
                const options = new cellEditorOptions_1.BaseCellEditorOptions(this, this.notebookOptions, this.configurationService, language);
                this._baseCellEditorOptions.set(language, options);
                return options;
            }
        }
        _updateForNotebookConfiguration() {
            if (!this._overlayContainer) {
                return;
            }
            this._overlayContainer.classList.remove('cell-title-toolbar-left');
            this._overlayContainer.classList.remove('cell-title-toolbar-right');
            this._overlayContainer.classList.remove('cell-title-toolbar-hidden');
            const cellToolbarLocation = this._notebookOptions.computeCellToolbarLocation(this.viewModel?.viewType);
            this._overlayContainer.classList.add(`cell-title-toolbar-${cellToolbarLocation}`);
            const cellToolbarInteraction = this._notebookOptions.getLayoutConfiguration().cellToolbarInteraction;
            let cellToolbarInteractionState = 'hover';
            this._overlayContainer.classList.remove('cell-toolbar-hover');
            this._overlayContainer.classList.remove('cell-toolbar-click');
            if (cellToolbarInteraction === 'hover' || cellToolbarInteraction === 'click') {
                cellToolbarInteractionState = cellToolbarInteraction;
            }
            this._overlayContainer.classList.add(`cell-toolbar-${cellToolbarInteractionState}`);
        }
        _generateFontInfo() {
            const editorOptions = this.configurationService.getValue('editor');
            this._fontInfo = fontMeasurements_1.FontMeasurements.readFontInfo(fontInfo_1.BareFontInfo.createFromRawSettings(editorOptions, browser_1.PixelRatio.value));
        }
        _createBody(parent) {
            this._notebookTopToolbarContainer = document.createElement('div');
            this._notebookTopToolbarContainer.classList.add('notebook-toolbar-container');
            this._notebookTopToolbarContainer.style.display = 'none';
            DOM.append(parent, this._notebookTopToolbarContainer);
            this._notebookStickyScrollContainer = document.createElement('div');
            this._notebookStickyScrollContainer.classList.add('notebook-sticky-scroll-container');
            DOM.append(parent, this._notebookStickyScrollContainer);
            this._body = document.createElement('div');
            DOM.append(parent, this._body);
            this._body.classList.add('cell-list-container');
            this._createLayoutStyles();
            this._createCellList();
            this._notebookOverviewRulerContainer = document.createElement('div');
            this._notebookOverviewRulerContainer.classList.add('notebook-overview-ruler-container');
            this._list.scrollableElement.appendChild(this._notebookOverviewRulerContainer);
            this._registerNotebookOverviewRuler();
            this._overflowContainer = document.createElement('div');
            this._overflowContainer.classList.add('notebook-overflow-widget-container', 'monaco-editor');
            DOM.append(parent, this._overflowContainer);
        }
        _generateFontFamily() {
            return this._fontInfo?.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
        }
        _createLayoutStyles() {
            this._styleElement = DOM.createStyleSheet(this._body);
            const { cellRightMargin, cellTopMargin, cellRunGutter, cellBottomMargin, codeCellLeftMargin, markdownCellGutter, markdownCellLeftMargin, markdownCellBottomMargin, markdownCellTopMargin, collapsedIndicatorHeight, compactView, focusIndicator, insertToolbarPosition, insertToolbarAlignment, fontSize, outputFontSize, focusIndicatorLeftMargin, focusIndicatorGap } = this._notebookOptions.getLayoutConfiguration();
            const { bottomToolbarGap, bottomToolbarHeight } = this._notebookOptions.computeBottomToolbarDimensions(this.viewModel?.viewType);
            const styleSheets = [];
            if (!this._fontInfo) {
                this._generateFontInfo();
            }
            const fontFamily = this._generateFontFamily();
            styleSheets.push(`
		.notebook-editor {
			--notebook-cell-output-font-size: ${outputFontSize}px;
			--notebook-cell-input-preview-font-size: ${fontSize}px;
			--notebook-cell-input-preview-font-family: ${fontFamily};
		}
		`);
            if (compactView) {
                styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row div.cell.code { margin-left: ${codeCellLeftMargin + cellRunGutter}px; }`);
            }
            else {
                styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row div.cell.code { margin-left: ${codeCellLeftMargin}px; }`);
            }
            // focus indicator
            if (focusIndicator === 'border') {
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-top:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom:before,
			.monaco-workbench .notebookOverlay .monaco-list .markdown-cell-row .cell-inner-container:before,
			.monaco-workbench .notebookOverlay .monaco-list .markdown-cell-row .cell-inner-container:after {
				content: "";
				position: absolute;
				width: 100%;
				height: 1px;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-right:before {
				content: "";
				position: absolute;
				width: 1px;
				height: 100%;
				z-index: 10;
			}

			/* top border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-top:before {
				border-top: 1px solid transparent;
			}

			/* left border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left:before {
				border-left: 1px solid transparent;
			}

			/* bottom border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom:before {
				border-bottom: 1px solid transparent;
			}

			/* right border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-right:before {
				border-right: 1px solid transparent;
			}
			`);
                // left and right border margins
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.focused .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.focused .cell-focus-indicator-right:before,
			.monaco-workbench .notebookOverlay .monaco-list.selection-multiple .monaco-list-row.code-cell-row.selected .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list.selection-multiple .monaco-list-row.code-cell-row.selected .cell-focus-indicator-right:before {
				top: -${cellTopMargin}px; height: calc(100% + ${cellTopMargin + cellBottomMargin}px)
			}`);
            }
            else {
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left .codeOutput-focus-indicator {
				border-left: 3px solid transparent;
				border-radius: 4px;
				width: 0px;
				margin-left: ${focusIndicatorLeftMargin}px;
				border-color: var(--vscode-notebook-inactiveFocusedCellBorder) !important;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.focused .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-output-hover .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .markdown-cell-hover .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row:hover .cell-focus-indicator-left .codeOutput-focus-indicator-container {
				display: block;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left .codeOutput-focus-indicator-container:hover .codeOutput-focus-indicator {
				border-left: 5px solid transparent;
				margin-left: ${focusIndicatorLeftMargin - 1}px;
			}
			`);
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.focused .cell-inner-container.cell-output-focus .cell-focus-indicator-left .codeOutput-focus-indicator,
			.monaco-workbench .notebookOverlay .monaco-list:focus-within .monaco-list-row.focused .cell-inner-container .cell-focus-indicator-left .codeOutput-focus-indicator {
				border-color: var(--vscode-notebook-focusedCellBorder) !important;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-inner-container .cell-focus-indicator-left .output-focus-indicator {
				margin-top: ${focusIndicatorGap}px;
			}
			`);
            }
            // between cell insert toolbar
            if (insertToolbarPosition === 'betweenCells' || insertToolbarPosition === 'both') {
                styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container { display: flex; }`);
                styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .cell-list-top-cell-toolbar-container { display: flex; }`);
            }
            else {
                styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container { display: none; }`);
                styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .cell-list-top-cell-toolbar-container { display: none; }`);
            }
            if (insertToolbarAlignment === 'left') {
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .action-item:first-child,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .action-item:first-child, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .action-item:first-child {
				margin-right: 0px !important;
			}`);
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .monaco-toolbar .action-label,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .monaco-toolbar .action-label, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .monaco-toolbar .action-label {
				padding: 0px !important;
				justify-content: center;
				border-radius: 4px;
			}`);
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container {
				align-items: flex-start;
				justify-content: left;
				margin: 0 16px 0 ${8 + codeCellLeftMargin}px;
			}`);
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container,
			.notebookOverlay .cell-bottom-toolbar-container .action-item {
				border: 0px;
			}`);
            }
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .code-cell-row div.cell.code { margin-left: ${codeCellLeftMargin + cellRunGutter}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row div.cell { margin-right: ${cellRightMargin}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row > .cell-inner-container { padding-top: ${cellTopMargin}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .cell-inner-container { padding-bottom: ${markdownCellBottomMargin}px; padding-top: ${markdownCellTopMargin}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .cell-inner-container.webview-backed-markdown-cell { padding: 0; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .webview-backed-markdown-cell.markdown-cell-edit-mode .cell.code { padding-bottom: ${markdownCellBottomMargin}px; padding-top: ${markdownCellTopMargin}px; }`);
            styleSheets.push(`.notebookOverlay .output { margin: 0px ${cellRightMargin}px 0px ${codeCellLeftMargin + cellRunGutter}px; }`);
            styleSheets.push(`.notebookOverlay .output { width: calc(100% - ${codeCellLeftMargin + cellRunGutter + cellRightMargin}px); }`);
            // comment
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-comment-container { left: ${codeCellLeftMargin + cellRunGutter}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-comment-container { width: calc(100% - ${codeCellLeftMargin + cellRunGutter + cellRightMargin}px); }`);
            // output collapse button
            styleSheets.push(`.monaco-workbench .notebookOverlay .output .output-collapse-container .expandButton { left: -${cellRunGutter}px; }`);
            styleSheets.push(`.monaco-workbench .notebookOverlay .output .output-collapse-container .expandButton {
			position: absolute;
			width: ${cellRunGutter}px;
			padding: 6px 0px;
		}`);
            // show more container
            styleSheets.push(`.notebookOverlay .output-show-more-container { margin: 0px ${cellRightMargin}px 0px ${codeCellLeftMargin + cellRunGutter}px; }`);
            styleSheets.push(`.notebookOverlay .output-show-more-container { width: calc(100% - ${codeCellLeftMargin + cellRunGutter + cellRightMargin}px); }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row div.cell.markdown { padding-left: ${cellRunGutter}px; }`);
            styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container .notebook-folding-indicator { left: ${(markdownCellGutter - 20) / 2 + markdownCellLeftMargin}px; }`);
            styleSheets.push(`.notebookOverlay > .cell-list-container .notebook-folded-hint { left: ${markdownCellGutter + markdownCellLeftMargin + 8}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row :not(.webview-backed-markdown-cell) .cell-focus-indicator-top { height: ${cellTopMargin}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-side { bottom: ${bottomToolbarGap}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row.code-cell-row .cell-focus-indicator-left { width: ${codeCellLeftMargin + cellRunGutter}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row.markdown-cell-row .cell-focus-indicator-left { width: ${codeCellLeftMargin}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator.cell-focus-indicator-right { width: ${cellRightMargin}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom { height: ${cellBottomMargin}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-shadow-container-bottom { top: ${cellBottomMargin}px; }`);
            styleSheets.push(`
			.notebookOverlay .monaco-list .monaco-list-row:has(+ .monaco-list-row.selected) .cell-focus-indicator-bottom {
				height: ${bottomToolbarGap + cellBottomMargin}px;
			}
		`);
            styleSheets.push(`
			.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .input-collapse-container .cell-collapse-preview {
				line-height: ${collapsedIndicatorHeight}px;
			}

			.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .input-collapse-container .cell-collapse-preview .monaco-tokenized-source {
				max-height: ${collapsedIndicatorHeight}px;
			}
		`);
            styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .monaco-toolbar { height: ${bottomToolbarHeight}px }`);
            styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .cell-list-top-cell-toolbar-container .monaco-toolbar { height: ${bottomToolbarHeight}px }`);
            // cell toolbar
            styleSheets.push(`.monaco-workbench .notebookOverlay.cell-title-toolbar-right > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			right: ${cellRightMargin + 26}px;
		}
		.monaco-workbench .notebookOverlay.cell-title-toolbar-left > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			left: ${codeCellLeftMargin + cellRunGutter + 16}px;
		}
		.monaco-workbench .notebookOverlay.cell-title-toolbar-hidden > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			display: none;
		}`);
            // cell output innert container
            styleSheets.push(`
		.monaco-workbench .notebookOverlay .output > div.foreground.output-inner-container {
			padding: ${notebookOptions_1.OutputInnerContainerTopPadding}px 8px;
		}
		.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .output-collapse-container {
			padding: ${notebookOptions_1.OutputInnerContainerTopPadding}px 8px;
		}
		`);
            this._styleElement.textContent = styleSheets.join('\n');
        }
        _createCellList() {
            this._body.classList.add('cell-list-container');
            this._dndController = this._register(new cellDnd_1.CellDragAndDropController(this, this._body));
            const getScopedContextKeyService = (container) => this._list.contextKeyService.createScoped(container);
            const renderers = [
                this.instantiationService.createInstance(cellRenderer_1.CodeCellRenderer, this, this._renderedEditors, this._dndController, getScopedContextKeyService),
                this.instantiationService.createInstance(cellRenderer_1.MarkupCellRenderer, this, this._dndController, this._renderedEditors, getScopedContextKeyService),
            ];
            renderers.forEach(renderer => {
                this._register(renderer);
            });
            this._listDelegate = this.instantiationService.createInstance(cellRenderer_1.NotebookCellListDelegate);
            this._register(this._listDelegate);
            const createNotebookAriaLabel = () => {
                const keybinding = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
                if (this.configurationService.getValue("accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.Notebook */)) {
                    return keybinding
                        ? nls.localize('notebookTreeAriaLabelHelp', "Notebook\nUse {0} for accessibility help", keybinding)
                        : nls.localize('notebookTreeAriaLabelHelpNoKb', "Notebook\nRun the Open Accessibility Help command for more information", keybinding);
                }
                return nls.localize('notebookTreeAriaLabel', "Notebook");
            };
            this._list = this.instantiationService.createInstance(notebookCellList_1.NotebookCellList, 'NotebookCellList', this._body, this._viewContext.notebookOptions, this._listDelegate, renderers, this.scopedContextKeyService, {
                setRowLineHeight: false,
                setRowHeight: false,
                supportDynamicHeights: true,
                horizontalScrolling: false,
                keyboardSupport: false,
                mouseSupport: true,
                multipleSelectionSupport: true,
                selectionNavigation: true,
                typeNavigationEnabled: true,
                paddingTop: this._notebookOptions.computeTopInsertToolbarHeight(this.viewModel?.viewType),
                paddingBottom: 0,
                transformOptimization: false,
                initialSize: this._dimension,
                styleController: (_suffix) => { return this._list; },
                overrideStyles: {
                    listBackground: notebookEditorBackground,
                    listActiveSelectionBackground: notebookEditorBackground,
                    listActiveSelectionForeground: colorRegistry_1.foreground,
                    listFocusAndSelectionBackground: notebookEditorBackground,
                    listFocusAndSelectionForeground: colorRegistry_1.foreground,
                    listFocusBackground: notebookEditorBackground,
                    listFocusForeground: colorRegistry_1.foreground,
                    listHoverForeground: colorRegistry_1.foreground,
                    listHoverBackground: notebookEditorBackground,
                    listHoverOutline: colorRegistry_1.focusBorder,
                    listFocusOutline: colorRegistry_1.focusBorder,
                    listInactiveSelectionBackground: notebookEditorBackground,
                    listInactiveSelectionForeground: colorRegistry_1.foreground,
                    listInactiveFocusBackground: notebookEditorBackground,
                    listInactiveFocusOutline: notebookEditorBackground,
                },
                accessibilityProvider: {
                    getAriaLabel: (element) => {
                        if (!this.viewModel) {
                            return '';
                        }
                        const index = this.viewModel.getCellIndex(element);
                        if (index >= 0) {
                            return `Cell ${index}, ${element.cellKind === notebookCommon_1.CellKind.Markup ? 'markdown' : 'code'}  cell`;
                        }
                        return '';
                    },
                    getWidgetAriaLabel: createNotebookAriaLabel
                },
            });
            this._dndController.setList(this._list);
            // create Webview
            this._register(this._list);
            this._listViewInfoAccessor = new notebookCellList_1.ListViewInfoAccessor(this._list);
            this._register(this._listViewInfoAccessor);
            this._register((0, lifecycle_1.combinedDisposable)(...renderers));
            // top cell toolbar
            this._listTopCellToolbar = this._register(this.instantiationService.createInstance(notebookTopCellToolbar_1.ListTopCellToolbar, this, this.scopedContextKeyService, this._list.rowsContainer));
            // transparent cover
            this._webviewTransparentCover = DOM.append(this._list.rowsContainer, $('.webview-cover'));
            this._webviewTransparentCover.style.display = 'none';
            this._register(DOM.addStandardDisposableGenericMouseDownListener(this._overlayContainer, (e) => {
                if (e.target.classList.contains('slider') && this._webviewTransparentCover) {
                    this._webviewTransparentCover.style.display = 'block';
                }
            }));
            this._register(DOM.addStandardDisposableGenericMouseUpListener(this._overlayContainer, () => {
                if (this._webviewTransparentCover) {
                    // no matter when
                    this._webviewTransparentCover.style.display = 'none';
                }
            }));
            this._register(this._list.onMouseDown(e => {
                if (e.element) {
                    this._onMouseDown.fire({ event: e.browserEvent, target: e.element });
                }
            }));
            this._register(this._list.onMouseUp(e => {
                if (e.element) {
                    this._onMouseUp.fire({ event: e.browserEvent, target: e.element });
                }
            }));
            this._register(this._list.onDidChangeFocus(_e => {
                this._onDidChangeActiveEditor.fire(this);
                this._onDidChangeActiveCell.fire();
                this._cursorNavMode.set(false);
            }));
            this._register(this._list.onContextMenu(e => {
                this.showListContextMenu(e);
            }));
            this._register(this._list.onDidChangeVisibleRanges(() => {
                this._onDidChangeVisibleRanges.fire();
            }));
            this._register(this._list.onDidScroll((e) => {
                this._onDidScroll.fire();
                if (e.scrollTop !== e.oldScrollTop) {
                    this.clearActiveCellWidgets();
                }
            }));
            this._focusTracker = this._register(DOM.trackFocus(this.getDomNode()));
            this._register(this._focusTracker.onDidBlur(() => {
                this._editorFocus.set(false);
                this.viewModel?.setEditorFocus(false);
                this._onDidBlurEmitter.fire();
            }));
            this._register(this._focusTracker.onDidFocus(() => {
                this._editorFocus.set(true);
                this.viewModel?.setEditorFocus(true);
                this._onDidFocusEmitter.fire();
            }));
            this._registerNotebookActionsToolbar();
            this._registerNotebookStickyScroll();
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.Notebook */)) {
                    this._list.ariaLabel = createNotebookAriaLabel();
                }
            }));
        }
        showListContextMenu(e) {
            this.contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.NotebookCellTitle,
                contextKeyService: this.scopedContextKeyService,
                getAnchor: () => e.anchor
            });
        }
        _registerNotebookOverviewRuler() {
            this._notebookOverviewRuler = this._register(this.instantiationService.createInstance(notebookOverviewRuler_1.NotebookOverviewRuler, this, this._notebookOverviewRulerContainer));
        }
        _registerNotebookActionsToolbar() {
            this._notebookTopToolbar = this._register(this.instantiationService.createInstance(notebookEditorToolbar_1.NotebookEditorWorkbenchToolbar, this, this.scopedContextKeyService, this._notebookOptions, this._notebookTopToolbarContainer));
            this._register(this._notebookTopToolbar.onDidChangeVisibility(() => {
                if (this._dimension && this._isVisible) {
                    this.layout(this._dimension);
                }
            }));
        }
        _registerNotebookStickyScroll() {
            this._notebookStickyScroll = this._register(this.instantiationService.createInstance(notebookEditorStickyScroll_1.NotebookStickyScroll, this._notebookStickyScrollContainer, this, this._notebookOutline, this._list));
        }
        _updateOutputRenderers() {
            if (!this.viewModel || !this._webview) {
                return;
            }
            this._webview.updateOutputRenderers();
            this.viewModel.viewCells.forEach(cell => {
                cell.outputsViewModels.forEach(output => {
                    if (output.pickedMimeType?.rendererId === notebookCommon_1.RENDERER_NOT_AVAILABLE) {
                        output.resetRenderer();
                    }
                });
            });
        }
        getDomNode() {
            return this._overlayContainer;
        }
        getOverflowContainerDomNode() {
            return this._overflowContainer;
        }
        getInnerWebview() {
            return this._webview?.webview;
        }
        setEditorProgressService(editorProgressService) {
            this.editorProgressService = editorProgressService;
        }
        setParentContextKeyService(parentContextKeyService) {
            this.scopedContextKeyService.updateParent(parentContextKeyService);
        }
        async setModel(textModel, viewState, perf) {
            if (this.viewModel === undefined || !this.viewModel.equal(textModel)) {
                const oldTopInsertToolbarHeight = this._notebookOptions.computeTopInsertToolbarHeight(this.viewModel?.viewType);
                const oldBottomToolbarDimensions = this._notebookOptions.computeBottomToolbarDimensions(this.viewModel?.viewType);
                this._detachModel();
                await this._attachModel(textModel, viewState, perf);
                const newTopInsertToolbarHeight = this._notebookOptions.computeTopInsertToolbarHeight(this.viewModel?.viewType);
                const newBottomToolbarDimensions = this._notebookOptions.computeBottomToolbarDimensions(this.viewModel?.viewType);
                if (oldTopInsertToolbarHeight !== newTopInsertToolbarHeight
                    || oldBottomToolbarDimensions.bottomToolbarGap !== newBottomToolbarDimensions.bottomToolbarGap
                    || oldBottomToolbarDimensions.bottomToolbarHeight !== newBottomToolbarDimensions.bottomToolbarHeight) {
                    this._styleElement?.remove();
                    this._createLayoutStyles();
                    this._webview?.updateOptions({
                        ...this.notebookOptions.computeWebviewOptions(),
                        fontFamily: this._generateFontFamily()
                    });
                }
                this.telemetryService.publicLog2('notebook/editorOpened', {
                    scheme: textModel.uri.scheme,
                    ext: (0, resources_1.extname)(textModel.uri),
                    viewType: textModel.viewType
                });
            }
            else {
                this.restoreListViewState(viewState);
            }
            this._restoreSelectedKernel(viewState);
            // load preloads for matching kernel
            this._loadKernelPreloads();
            // clear state
            this._dndController?.clearGlobalDragState();
            this._localStore.add(this._list.onDidChangeFocus(() => {
                this.updateContextKeysOnFocusChange();
            }));
            this.updateContextKeysOnFocusChange();
            // render markdown top down on idle
            this._backgroundMarkdownRendering();
        }
        _backgroundMarkdownRendering() {
            if (this._backgroundMarkdownRenderRunning) {
                return;
            }
            this._backgroundMarkdownRenderRunning = true;
            (0, async_1.runWhenIdle)((deadline) => {
                this._backgroundMarkdownRenderingWithDeadline(deadline);
            });
        }
        _backgroundMarkdownRenderingWithDeadline(deadline) {
            const endTime = Date.now() + deadline.timeRemaining();
            const execute = () => {
                try {
                    this._backgroundMarkdownRenderRunning = true;
                    if (this._isDisposed) {
                        return;
                    }
                    if (!this.viewModel) {
                        return;
                    }
                    const firstMarkupCell = this.viewModel.viewCells.find(cell => cell.cellKind === notebookCommon_1.CellKind.Markup && !this._webview?.markupPreviewMapping.has(cell.id) && !this.cellIsHidden(cell));
                    if (!firstMarkupCell) {
                        return;
                    }
                    this.createMarkupPreview(firstMarkupCell);
                }
                finally {
                    this._backgroundMarkdownRenderRunning = false;
                }
                if (Date.now() < endTime) {
                    (0, platform_1.setTimeout0)(execute);
                }
                else {
                    this._backgroundMarkdownRendering();
                }
            };
            execute();
        }
        updateContextKeysOnFocusChange() {
            if (!this.viewModel) {
                return;
            }
            const focused = this._list.getFocusedElements()[0];
            if (focused) {
                if (!this._cellContextKeyManager) {
                    this._cellContextKeyManager = this._localStore.add(this.instantiationService.createInstance(cellContextKeys_1.CellContextKeyManager, this, focused));
                }
                this._cellContextKeyManager.updateForElement(focused);
            }
        }
        async setOptions(options) {
            if (options?.isReadOnly !== undefined) {
                this._readOnly = options?.isReadOnly;
            }
            if (!this.viewModel) {
                return;
            }
            this.viewModel.updateOptions({ isReadOnly: this._readOnly });
            this.notebookOptions.updateOptions(this._readOnly);
            // reveal cell if editor options tell to do so
            const cellOptions = options?.cellOptions ?? this._parseIndexedCellOptions(options);
            if (cellOptions) {
                const cell = this.viewModel.viewCells.find(cell => cell.uri.toString() === cellOptions.resource.toString());
                if (cell) {
                    this.focusElement(cell);
                    const selection = cellOptions.options?.selection;
                    if (selection) {
                        cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'setOptions');
                        cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                        await this.revealRangeInCenterIfOutsideViewportAsync(cell, new range_1.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber || selection.startLineNumber, selection.endColumn || selection.startColumn));
                    }
                    else if (options?.cellRevealType === notebookBrowser_1.CellRevealType.NearTopIfOutsideViewport) {
                        await this._list.revealCellAsync(cell, notebookBrowser_1.CellRevealType.NearTopIfOutsideViewport);
                    }
                    else {
                        await this._list.revealCellAsync(cell, notebookBrowser_1.CellRevealType.CenterIfOutsideViewport);
                    }
                    const editor = this._renderedEditors.get(cell);
                    if (editor) {
                        if (cellOptions.options?.selection) {
                            const { selection } = cellOptions.options;
                            const editorSelection = new range_1.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber || selection.startLineNumber, selection.endColumn || selection.startColumn);
                            editor.setSelection(editorSelection);
                            editor.revealPositionInCenterIfOutsideViewport({
                                lineNumber: selection.startLineNumber,
                                column: selection.startColumn
                            });
                            await this.revealRangeInCenterIfOutsideViewportAsync(cell, editorSelection);
                        }
                        if (!cellOptions.options?.preserveFocus) {
                            editor.focus();
                        }
                    }
                }
            }
            // select cells if options tell to do so
            // todo@rebornix https://github.com/microsoft/vscode/issues/118108 support selections not just focus
            // todo@rebornix support multipe selections
            if (options?.cellSelections) {
                const focusCellIndex = options.cellSelections[0].start;
                const focusedCell = this.viewModel.cellAt(focusCellIndex);
                if (focusedCell) {
                    this.viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Index,
                        focus: { start: focusCellIndex, end: focusCellIndex + 1 },
                        selections: options.cellSelections
                    });
                    this.revealInCenterIfOutsideViewport(focusedCell);
                }
            }
            this._updateForOptions();
            this._onDidChangeOptions.fire();
        }
        _parseIndexedCellOptions(options) {
            if (options?.indexedCellOptions) {
                // convert index based selections
                const cell = this.cellAt(options.indexedCellOptions.index);
                if (cell) {
                    return {
                        resource: cell.uri,
                        options: {
                            selection: options.indexedCellOptions.selection,
                            preserveFocus: false
                        }
                    };
                }
            }
            return undefined;
        }
        _detachModel() {
            this._localStore.clear();
            (0, lifecycle_1.dispose)(this._localCellStateListeners);
            this._list.detachViewModel();
            this.viewModel?.dispose();
            // avoid event
            this.viewModel = undefined;
            this._webview?.dispose();
            this._webview?.element.remove();
            this._webview = null;
            this._list.clear();
        }
        _updateForOptions() {
            if (!this.viewModel) {
                return;
            }
            this._editorEditable.set(!this.viewModel.options.isReadOnly);
            this._overflowContainer.classList.toggle('notebook-editor-editable', !this.viewModel.options.isReadOnly);
            this.getDomNode().classList.toggle('notebook-editor-editable', !this.viewModel.options.isReadOnly);
        }
        async _resolveWebview() {
            if (!this.textModel) {
                return null;
            }
            if (this._webviewResolvePromise) {
                return this._webviewResolvePromise;
            }
            if (!this._webview) {
                this._ensureWebview(this.getId(), this.textModel.viewType, this.textModel.uri);
            }
            this._webviewResolvePromise = (async () => {
                if (!this._webview) {
                    throw new Error('Notebook output webview object is not created successfully.');
                }
                await this._webview.createWebview();
                if (!this._webview.webview) {
                    throw new Error('Notebook output webview element was not created successfully.');
                }
                this._localStore.add(this._webview.webview.onDidBlur(() => {
                    this._outputFocus.set(false);
                    this._webviewFocused = false;
                    this.updateEditorFocus();
                    this.updateCellFocusMode();
                }));
                this._localStore.add(this._webview.webview.onDidFocus(() => {
                    this._outputFocus.set(true);
                    this.updateEditorFocus();
                    this._webviewFocused = true;
                }));
                this._localStore.add(this._webview.onMessage(e => {
                    this._onDidReceiveMessage.fire(e);
                }));
                return this._webview;
            })();
            return this._webviewResolvePromise;
        }
        _ensureWebview(id, viewType, resource) {
            if (this._webview) {
                return;
            }
            const that = this;
            this._webview = this.instantiationService.createInstance(backLayerWebView_1.BackLayerWebView, {
                get creationOptions() { return that.creationOptions; },
                setScrollTop(scrollTop) { that._list.scrollTop = scrollTop; },
                triggerScroll(event) { that._list.triggerScrollFromMouseWheelEvent(event); },
                getCellByInfo: that.getCellByInfo.bind(that),
                getCellById: that._getCellById.bind(that),
                toggleNotebookCellSelection: that._toggleNotebookCellSelection.bind(that),
                focusNotebookCell: that.focusNotebookCell.bind(that),
                focusNextNotebookCell: that.focusNextNotebookCell.bind(that),
                updateOutputHeight: that._updateOutputHeight.bind(that),
                scheduleOutputHeightAck: that._scheduleOutputHeightAck.bind(that),
                updateMarkupCellHeight: that._updateMarkupCellHeight.bind(that),
                setMarkupCellEditState: that._setMarkupCellEditState.bind(that),
                didStartDragMarkupCell: that._didStartDragMarkupCell.bind(that),
                didDragMarkupCell: that._didDragMarkupCell.bind(that),
                didDropMarkupCell: that._didDropMarkupCell.bind(that),
                didEndDragMarkupCell: that._didEndDragMarkupCell.bind(that),
                didResizeOutput: that._didResizeOutput.bind(that),
                updatePerformanceMetadata: that._updatePerformanceMetadata.bind(that),
                didFocusOutputInputChange: that._didFocusOutputInputChange.bind(that),
            }, id, viewType, resource, {
                ...this._notebookOptions.computeWebviewOptions(),
                fontFamily: this._generateFontFamily()
            }, this.notebookRendererMessaging.getScoped(this._uuid));
            this._webview.element.style.width = '100%';
            // attach the webview container to the DOM tree first
            this._list.attachWebview(this._webview.element);
        }
        async _attachModel(textModel, viewState, perf) {
            this._ensureWebview(this.getId(), textModel.viewType, textModel.uri);
            this.viewModel = this.instantiationService.createInstance(notebookViewModelImpl_1.NotebookViewModel, textModel.viewType, textModel, this._viewContext, this.getLayoutInfo(), { isReadOnly: this._readOnly });
            this._viewContext.eventDispatcher.emit([new notebookViewEvents_1.NotebookLayoutChangedEvent({ width: true, fontInfo: true }, this.getLayoutInfo())]);
            this.notebookOptions.updateOptions(this._readOnly);
            this._updateForOptions();
            this._updateForNotebookConfiguration();
            // restore view states, including contributions
            {
                // restore view state
                this.viewModel.restoreEditorViewState(viewState);
                // contribution state restore
                const contributionsState = viewState?.contributionsState || {};
                for (const [id, contribution] of this._contributions) {
                    if (typeof contribution.restoreViewState === 'function') {
                        contribution.restoreViewState(contributionsState[id]);
                    }
                }
            }
            this._localStore.add(this.viewModel.onDidChangeViewCells(e => {
                this._onDidChangeViewCells.fire(e);
            }));
            this._localStore.add(this.viewModel.onDidChangeSelection(() => {
                this._onDidChangeSelection.fire();
                this.updateSelectedMarkdownPreviews();
            }));
            this._localStore.add(this._list.onWillScroll(e => {
                if (this._webview?.isResolved()) {
                    this._webviewTransparentCover.style.transform = `translateY(${e.scrollTop})`;
                }
            }));
            let hasPendingChangeContentHeight = false;
            this._localStore.add(this._list.onDidChangeContentHeight(() => {
                if (hasPendingChangeContentHeight) {
                    return;
                }
                hasPendingChangeContentHeight = true;
                this._localStore.add(DOM.scheduleAtNextAnimationFrame(() => {
                    hasPendingChangeContentHeight = false;
                    this._updateScrollHeight();
                }, 100));
            }));
            this._localStore.add(this._list.onDidRemoveOutputs(outputs => {
                outputs.forEach(output => this.removeInset(output));
            }));
            this._localStore.add(this._list.onDidHideOutputs(outputs => {
                outputs.forEach(output => this.hideInset(output));
            }));
            this._localStore.add(this._list.onDidRemoveCellsFromView(cells => {
                const hiddenCells = [];
                const deletedCells = [];
                for (const cell of cells) {
                    if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        const mdCell = cell;
                        if (this.viewModel?.viewCells.find(cell => cell.handle === mdCell.handle)) {
                            // Cell has been folded but is still in model
                            hiddenCells.push(mdCell);
                        }
                        else {
                            // Cell was deleted
                            deletedCells.push(mdCell);
                        }
                    }
                }
                this.hideMarkupPreviews(hiddenCells);
                this.deleteMarkupPreviews(deletedCells);
            }));
            // init rendering
            await this._warmupWithMarkdownRenderer(this.viewModel, viewState);
            perf?.mark('customMarkdownLoaded');
            // model attached
            this._localCellStateListeners = this.viewModel.viewCells.map(cell => this._bindCellListener(cell));
            this._lastCellWithEditorFocus = this.viewModel.viewCells.find(viewCell => this.getActiveCell() === viewCell && viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor) ?? null;
            this._localStore.add(this.viewModel.onDidChangeViewCells((e) => {
                if (this._isDisposed) {
                    return;
                }
                // update cell listener
                [...e.splices].reverse().forEach(splice => {
                    const [start, deleted, newCells] = splice;
                    const deletedCells = this._localCellStateListeners.splice(start, deleted, ...newCells.map(cell => this._bindCellListener(cell)));
                    (0, lifecycle_1.dispose)(deletedCells);
                });
                if (e.splices.some(s => s[2].some(cell => cell.cellKind === notebookCommon_1.CellKind.Markup))) {
                    this._backgroundMarkdownRendering();
                }
            }));
            if (this._dimension) {
                this._list.layout(this.getBodyHeight(this._dimension.height), this._dimension.width);
            }
            else {
                this._list.layout();
            }
            this._dndController?.clearGlobalDragState();
            // restore list state at last, it must be after list layout
            this.restoreListViewState(viewState);
        }
        _bindCellListener(cell) {
            const store = new lifecycle_1.DisposableStore();
            store.add(cell.onDidChangeLayout(e => {
                // e.totalHeight will be false it's not changed
                if (e.totalHeight || e.outerWidth) {
                    this.layoutNotebookCell(cell, cell.layoutInfo.totalHeight, e.context);
                }
            }));
            if (cell.cellKind === notebookCommon_1.CellKind.Code) {
                store.add(cell.onDidRemoveOutputs((outputs) => {
                    outputs.forEach(output => this.removeInset(output));
                }));
            }
            store.add(cell.onDidChangeState(e => {
                if (e.inputCollapsedChanged && cell.isInputCollapsed && cell.cellKind === notebookCommon_1.CellKind.Markup) {
                    this.hideMarkupPreviews([cell]);
                }
                if (e.outputCollapsedChanged && cell.isOutputCollapsed && cell.cellKind === notebookCommon_1.CellKind.Code) {
                    cell.outputsViewModels.forEach(output => this.hideInset(output));
                }
                if (e.focusModeChanged) {
                    this._validateCellFocusMode(cell);
                }
            }));
            return store;
        }
        _validateCellFocusMode(cell) {
            if (cell.focusMode !== notebookBrowser_1.CellFocusMode.Editor) {
                return;
            }
            if (this._lastCellWithEditorFocus && this._lastCellWithEditorFocus !== cell) {
                this._lastCellWithEditorFocus.focusMode = notebookBrowser_1.CellFocusMode.Container;
            }
            this._lastCellWithEditorFocus = cell;
        }
        async _warmupWithMarkdownRenderer(viewModel, viewState) {
            this.logService.debug('NotebookEditorWidget', 'warmup ' + this.viewModel?.uri.toString());
            await this._resolveWebview();
            this.logService.debug('NotebookEditorWidget', 'warmup - webview resolved');
            // make sure that the webview is not visible otherwise users will see pre-rendered markdown cells in wrong position as the list view doesn't have a correct `top` offset yet
            this._webview.element.style.visibility = 'hidden';
            // warm up can take around 200ms to load markdown libraries, etc.
            await this._warmupViewportMarkdownCells(viewModel, viewState);
            this.logService.debug('NotebookEditorWidget', 'warmup - viewport warmed up');
            // todo@rebornix @mjbvz, is this too complicated?
            /* now the webview is ready, and requests to render markdown are fast enough
             * we can start rendering the list view
             * render
             *   - markdown cell -> request to webview to (10ms, basically just latency between UI and iframe)
             *   - code cell -> render in place
             */
            this._list.layout(0, 0);
            this._list.attachViewModel(viewModel);
            // now the list widget has a correct contentHeight/scrollHeight
            // setting scrollTop will work properly
            // after setting scroll top, the list view will update `top` of the scrollable element, e.g. `top: -584px`
            this._list.scrollTop = viewState?.scrollPosition?.top ?? 0;
            this._debug('finish initial viewport warmup and view state restore.');
            this._webview.element.style.visibility = 'visible';
            this.logService.debug('NotebookEditorWidget', 'warmup - list view model attached, set to visible');
            this._onDidAttachViewModel.fire();
        }
        async _warmupViewportMarkdownCells(viewModel, viewState) {
            if (viewState && viewState.cellTotalHeights) {
                const totalHeightCache = viewState.cellTotalHeights;
                const scrollTop = viewState.scrollPosition?.top ?? 0;
                const scrollBottom = scrollTop + Math.max(this._dimension?.height ?? 0, 1080);
                let offset = 0;
                const requests = [];
                for (let i = 0; i < viewModel.length; i++) {
                    const cell = viewModel.cellAt(i);
                    const cellHeight = totalHeightCache[i] ?? 0;
                    if (offset + cellHeight < scrollTop) {
                        offset += cellHeight;
                        continue;
                    }
                    if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        requests.push([cell, offset]);
                    }
                    offset += cellHeight;
                    if (offset > scrollBottom) {
                        break;
                    }
                }
                await this._webview.initializeMarkup(requests.map(([model, offset]) => this.createMarkupCellInitialization(model, offset)));
            }
            else {
                const initRequests = viewModel.viewCells
                    .filter(cell => cell.cellKind === notebookCommon_1.CellKind.Markup)
                    .slice(0, 5)
                    .map(cell => this.createMarkupCellInitialization(cell, -10000));
                await this._webview.initializeMarkup(initRequests);
                // no cached view state so we are rendering the first viewport
                // after above async call, we already get init height for markdown cells, we can update their offset
                let offset = 0;
                const offsetUpdateRequests = [];
                const scrollBottom = Math.max(this._dimension?.height ?? 0, 1080);
                for (const cell of viewModel.viewCells) {
                    if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        offsetUpdateRequests.push({ id: cell.id, top: offset });
                    }
                    offset += cell.getHeight(this.getLayoutInfo().fontInfo.lineHeight);
                    if (offset > scrollBottom) {
                        break;
                    }
                }
                this._webview?.updateScrollTops([], offsetUpdateRequests);
            }
        }
        createMarkupCellInitialization(model, offset) {
            return ({
                mime: model.mime,
                cellId: model.id,
                cellHandle: model.handle,
                content: model.getText(),
                offset: offset,
                visible: false,
                metadata: model.metadata,
            });
        }
        restoreListViewState(viewState) {
            if (!this.viewModel) {
                return;
            }
            if (viewState?.scrollPosition !== undefined) {
                this._list.scrollTop = viewState.scrollPosition.top;
                this._list.scrollLeft = viewState.scrollPosition.left;
            }
            else {
                this._list.scrollTop = 0;
                this._list.scrollLeft = 0;
            }
            const focusIdx = typeof viewState?.focus === 'number' ? viewState.focus : 0;
            if (focusIdx < this.viewModel.length) {
                const element = this.viewModel.cellAt(focusIdx);
                if (element) {
                    this.viewModel?.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: element.handle,
                        selections: [element.handle]
                    });
                }
            }
            else if (this._list.length > 0) {
                this.viewModel.updateSelectionsState({
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: { start: 0, end: 1 },
                    selections: [{ start: 0, end: 1 }]
                });
            }
            if (viewState?.editorFocused) {
                const cell = this.viewModel.cellAt(focusIdx);
                if (cell) {
                    cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                }
            }
        }
        _restoreSelectedKernel(viewState) {
            if (viewState?.selectedKernelId && this.textModel) {
                const matching = this.notebookKernelService.getMatchingKernel(this.textModel);
                const kernel = matching.all.find(k => k.id === viewState.selectedKernelId);
                // Selected kernel may have already been picked prior to the view state loading
                // If so, don't overwrite it with the saved kernel.
                if (kernel && !matching.selected) {
                    this.notebookKernelService.selectKernelForNotebook(kernel, this.textModel);
                }
            }
        }
        getEditorViewState() {
            const state = this.viewModel?.getEditorViewState();
            if (!state) {
                return {
                    editingCells: {},
                    cellLineNumberStates: {},
                    editorViewStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                };
            }
            if (this._list) {
                state.scrollPosition = { left: this._list.scrollLeft, top: this._list.scrollTop };
                const cellHeights = {};
                for (let i = 0; i < this.viewModel.length; i++) {
                    const elm = this.viewModel.cellAt(i);
                    cellHeights[i] = elm.layoutInfo.totalHeight;
                }
                state.cellTotalHeights = cellHeights;
                if (this.viewModel) {
                    const focusRange = this.viewModel.getFocus();
                    const element = this.viewModel.cellAt(focusRange.start);
                    if (element) {
                        const itemDOM = this._list.domElementOfElement(element);
                        const editorFocused = element.getEditState() === notebookBrowser_1.CellEditState.Editing && !!(document.activeElement && itemDOM && itemDOM.contains(document.activeElement));
                        state.editorFocused = editorFocused;
                        state.focus = focusRange.start;
                    }
                }
            }
            // Save contribution view states
            const contributionsState = {};
            for (const [id, contribution] of this._contributions) {
                if (typeof contribution.saveViewState === 'function') {
                    contributionsState[id] = contribution.saveViewState();
                }
            }
            state.contributionsState = contributionsState;
            if (this.textModel?.uri.scheme === network_1.Schemas.untitled) {
                state.selectedKernelId = this.activeKernel?.id;
            }
            return state;
        }
        _allowScrollBeyondLastLine() {
            return this._scrollBeyondLastLine && !this.isEmbedded;
        }
        getBodyHeight(dimensionHeight) {
            return Math.max(dimensionHeight - (this._notebookTopToolbar?.useGlobalToolbar ? /** Toolbar height */ 26 : 0), 0);
        }
        layout(dimension, shadowElement, position) {
            if (!shadowElement && this._shadowElementViewInfo === null) {
                this._dimension = dimension;
                this._position = position;
                return;
            }
            if (dimension.width <= 0 || dimension.height <= 0) {
                this.onWillHide();
                return;
            }
            if (shadowElement) {
                this.updateShadowElement(shadowElement, dimension, position);
            }
            if (this._shadowElementViewInfo && this._shadowElementViewInfo.width <= 0 && this._shadowElementViewInfo.height <= 0) {
                this.onWillHide();
                return;
            }
            this._dimension = dimension;
            this._position = position;
            const newBodyHeight = this.getBodyHeight(dimension.height);
            DOM.size(this._body, dimension.width, newBodyHeight);
            const topInserToolbarHeight = this._notebookOptions.computeTopInsertToolbarHeight(this.viewModel?.viewType);
            const newCellListHeight = newBodyHeight;
            if (this._list.getRenderHeight() < newCellListHeight) {
                // the new dimension is larger than the list viewport, update its additional height first, otherwise the list view will move down a bit (as the `scrollBottom` will move down)
                this._list.updateOptions({ paddingBottom: this._allowScrollBeyondLastLine() ? Math.max(0, (newCellListHeight - 50)) : 0, paddingTop: topInserToolbarHeight });
                this._list.layout(newCellListHeight, dimension.width);
            }
            else {
                // the new dimension is smaller than the list viewport, if we update the additional height, the `scrollBottom` will move up, which moves the whole list view upwards a bit. So we run a layout first.
                this._list.layout(newCellListHeight, dimension.width);
                this._list.updateOptions({ paddingBottom: this._allowScrollBeyondLastLine() ? Math.max(0, (newCellListHeight - 50)) : 0, paddingTop: topInserToolbarHeight });
            }
            this._overlayContainer.style.visibility = 'visible';
            this._overlayContainer.style.display = 'block';
            this._overlayContainer.style.position = 'absolute';
            this._overlayContainer.style.overflow = 'hidden';
            this.layoutContainerOverShadowElement(dimension, position);
            if (this._webviewTransparentCover) {
                this._webviewTransparentCover.style.height = `${dimension.height}px`;
                this._webviewTransparentCover.style.width = `${dimension.width}px`;
            }
            this._notebookTopToolbar.layout(this._dimension);
            this._notebookOverviewRuler.layout();
            this._viewContext?.eventDispatcher.emit([new notebookViewEvents_1.NotebookLayoutChangedEvent({ width: true, fontInfo: true }, this.getLayoutInfo())]);
        }
        updateShadowElement(shadowElement, dimension, position) {
            this._shadowElement = shadowElement;
            if (dimension && position) {
                this._shadowElementViewInfo = {
                    height: dimension.height,
                    width: dimension.width,
                    top: position.top,
                    left: position.left,
                };
            }
            else {
                // We have to recompute position and size ourselves (which is slow)
                const containerRect = shadowElement.getBoundingClientRect();
                this._shadowElementViewInfo = {
                    height: containerRect.height,
                    width: containerRect.width,
                    top: containerRect.top,
                    left: containerRect.left
                };
            }
        }
        layoutContainerOverShadowElement(dimension, position) {
            if (dimension && position) {
                this._overlayContainer.style.top = `${position.top}px`;
                this._overlayContainer.style.left = `${position.left}px`;
                this._overlayContainer.style.width = `${dimension.width}px`;
                this._overlayContainer.style.height = `${dimension.height}px`;
                return;
            }
            if (!this._shadowElementViewInfo) {
                return;
            }
            const elementContainerRect = this._overlayContainer.parentElement?.getBoundingClientRect();
            this._overlayContainer.style.top = `${this._shadowElementViewInfo.top - (elementContainerRect?.top || 0)}px`;
            this._overlayContainer.style.left = `${this._shadowElementViewInfo.left - (elementContainerRect?.left || 0)}px`;
            this._overlayContainer.style.width = `${dimension ? dimension.width : this._shadowElementViewInfo.width}px`;
            this._overlayContainer.style.height = `${dimension ? dimension.height : this._shadowElementViewInfo.height}px`;
        }
        //#endregion
        //#region Focus tracker
        focus() {
            this._isVisible = true;
            this._editorFocus.set(true);
            if (this._webviewFocused) {
                this._webview?.focusWebview();
            }
            else {
                if (this.viewModel) {
                    const focusRange = this.viewModel.getFocus();
                    const element = this.viewModel.cellAt(focusRange.start);
                    // The notebook editor doesn't have focus yet
                    if (!this.hasEditorFocus()) {
                        this.focusContainer();
                        // trigger editor to update as FocusTracker might not emit focus change event
                        this.updateEditorFocus();
                    }
                    if (element && element.focusMode === notebookBrowser_1.CellFocusMode.Editor) {
                        element.updateEditState(notebookBrowser_1.CellEditState.Editing, 'editorWidget.focus');
                        element.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                        this.focusEditor(element);
                        return;
                    }
                }
                this._list.domFocus();
            }
            if (this._currentProgress) {
                // The editor forces progress to hide when switching editors. So if progress should be visible, force it to show when the editor is focused.
                this.showProgress();
            }
        }
        onShow() {
            this._isVisible = true;
        }
        focusEditor(activeElement) {
            for (const [element, editor] of this._renderedEditors.entries()) {
                if (element === activeElement) {
                    editor.focus();
                    return;
                }
            }
        }
        focusContainer() {
            if (this._webviewFocused) {
                this._webview?.focusWebview();
            }
            else {
                this._list.focusContainer();
            }
        }
        onWillHide() {
            this._isVisible = false;
            this._editorFocus.set(false);
            this._overlayContainer.style.visibility = 'hidden';
            this._overlayContainer.style.left = '-50000px';
            this._notebookTopToolbarContainer.style.display = 'none';
            this.clearActiveCellWidgets();
        }
        clearActiveCellWidgets() {
            this._renderedEditors.forEach((editor, cell) => {
                if (this.getActiveCell() === cell && editor) {
                    suggestController_1.SuggestController.get(editor)?.cancelSuggestWidget();
                    dropIntoEditorController_1.DropIntoEditorController.get(editor)?.clearWidgets();
                    copyPasteController_1.CopyPasteController.get(editor)?.clearWidgets();
                }
            });
        }
        editorHasDomFocus() {
            return DOM.isAncestor(document.activeElement, this.getDomNode());
        }
        updateEditorFocus() {
            // Note - focus going to the webview will fire 'blur', but the webview element will be
            // a descendent of the notebook editor root.
            this._focusTracker.refreshState();
            const focused = this.editorHasDomFocus();
            this._editorFocus.set(focused);
            this.viewModel?.setEditorFocus(focused);
        }
        updateCellFocusMode() {
            const activeCell = this.getActiveCell();
            if (activeCell?.focusMode === notebookBrowser_1.CellFocusMode.Output && !this._webviewFocused) {
                // output previously has focus, but now it's blurred.
                activeCell.focusMode = notebookBrowser_1.CellFocusMode.Container;
            }
        }
        hasEditorFocus() {
            // _editorFocus is driven by the FocusTracker, which is only guaranteed to _eventually_ fire blur.
            // If we need to know whether we have focus at this instant, we need to check the DOM manually.
            this.updateEditorFocus();
            return this.editorHasDomFocus();
        }
        hasWebviewFocus() {
            return this._webviewFocused;
        }
        hasOutputTextSelection() {
            if (!this.hasEditorFocus()) {
                return false;
            }
            const windowSelection = window.getSelection();
            if (windowSelection?.rangeCount !== 1) {
                return false;
            }
            const activeSelection = windowSelection.getRangeAt(0);
            if (activeSelection.startContainer === activeSelection.endContainer && activeSelection.endOffset - activeSelection.startOffset === 0) {
                return false;
            }
            let container = activeSelection.commonAncestorContainer;
            if (!this._body.contains(container)) {
                return false;
            }
            while (container
                &&
                    container !== this._body) {
                if (container.classList && container.classList.contains('output')) {
                    return true;
                }
                container = container.parentNode;
            }
            return false;
        }
        _didFocusOutputInputChange(hasFocus) {
            this._outputInputFocus.set(hasFocus);
        }
        //#endregion
        //#region Editor Features
        focusElement(cell) {
            this.viewModel?.updateSelectionsState({
                kind: notebookCommon_1.SelectionStateType.Handle,
                primary: cell.handle,
                selections: [cell.handle]
            });
        }
        get scrollTop() {
            return this._list.scrollTop;
        }
        getAbsoluteTopOfElement(cell) {
            return this._list.getCellViewScrollTop(cell);
        }
        scrollToBottom() {
            this._list.scrollToBottom();
        }
        setScrollTop(scrollTop) {
            this._list.scrollTop = scrollTop;
        }
        revealCellRangeInView(range) {
            return this._list.revealCellsInView(range);
        }
        revealInView(cell) {
            this._list.revealCell(cell, 1 /* CellRevealSyncType.Default */);
        }
        revealInViewAtTop(cell) {
            this._list.revealCell(cell, 2 /* CellRevealSyncType.Top */);
        }
        revealInCenter(cell) {
            this._list.revealCell(cell, 3 /* CellRevealSyncType.Center */);
        }
        revealInCenterIfOutsideViewport(cell) {
            this._list.revealCell(cell, 4 /* CellRevealSyncType.CenterIfOutsideViewport */);
        }
        revealFirstLineIfOutsideViewport(cell) {
            this._list.revealCell(cell, 5 /* CellRevealSyncType.FirstLineIfOutsideViewport */);
        }
        async revealLineInViewAsync(cell, line) {
            return this._list.revealCellRangeAsync(cell, new range_1.Range(line, 1, line, 1), notebookBrowser_1.CellRevealRangeType.Default);
        }
        async revealLineInCenterAsync(cell, line) {
            return this._list.revealCellRangeAsync(cell, new range_1.Range(line, 1, line, 1), notebookBrowser_1.CellRevealRangeType.Center);
        }
        async revealLineInCenterIfOutsideViewportAsync(cell, line) {
            return this._list.revealCellRangeAsync(cell, new range_1.Range(line, 1, line, 1), notebookBrowser_1.CellRevealRangeType.CenterIfOutsideViewport);
        }
        async revealRangeInViewAsync(cell, range) {
            return this._list.revealCellRangeAsync(cell, range, notebookBrowser_1.CellRevealRangeType.Default);
        }
        async revealRangeInCenterAsync(cell, range) {
            return this._list.revealCellRangeAsync(cell, range, notebookBrowser_1.CellRevealRangeType.Center);
        }
        async revealRangeInCenterIfOutsideViewportAsync(cell, range) {
            return this._list.revealCellRangeAsync(cell, range, notebookBrowser_1.CellRevealRangeType.CenterIfOutsideViewport);
        }
        async revealCellOffsetInCenterAsync(cell, offset) {
            return this._list.revealCellOffsetInCenterAsync(cell, offset);
        }
        getViewIndexByModelIndex(index) {
            if (!this._listViewInfoAccessor) {
                return -1;
            }
            const cell = this.viewModel?.viewCells[index];
            if (!cell) {
                return -1;
            }
            return this._listViewInfoAccessor.getViewIndex(cell);
        }
        getViewHeight(cell) {
            if (!this._listViewInfoAccessor) {
                return -1;
            }
            return this._listViewInfoAccessor.getViewHeight(cell);
        }
        getCellRangeFromViewRange(startIndex, endIndex) {
            return this._listViewInfoAccessor.getCellRangeFromViewRange(startIndex, endIndex);
        }
        getCellsInRange(range) {
            return this._listViewInfoAccessor.getCellsInRange(range);
        }
        setCellEditorSelection(cell, range) {
            this._list.setCellEditorSelection(cell, range);
        }
        setHiddenAreas(_ranges) {
            return this._list.setHiddenAreas(_ranges, true);
        }
        getVisibleRangesPlusViewportAboveAndBelow() {
            return this._listViewInfoAccessor.getVisibleRangesPlusViewportAboveAndBelow();
        }
        //#endregion
        //#region Decorations
        deltaCellDecorations(oldDecorations, newDecorations) {
            const ret = this.viewModel?.deltaCellDecorations(oldDecorations, newDecorations) || [];
            this._onDidChangeDecorations.fire();
            return ret;
        }
        deltaCellContainerClassNames(cellId, added, removed) {
            this._webview?.deltaCellContainerClassNames(cellId, added, removed);
        }
        changeModelDecorations(callback) {
            return this.viewModel?.changeModelDecorations(callback) || null;
        }
        //#endregion
        //#region Kernel/Execution
        async _loadKernelPreloads() {
            if (!this.hasModel()) {
                return;
            }
            const { selected } = this.notebookKernelService.getMatchingKernel(this.textModel);
            if (!this._webview?.isResolved()) {
                await this._resolveWebview();
            }
            this._webview?.updateKernelPreloads(selected);
        }
        get activeKernel() {
            return this.textModel && this.notebookKernelService.getSelectedOrSuggestedKernel(this.textModel);
        }
        async cancelNotebookCells(cells) {
            if (!this.viewModel || !this.hasModel()) {
                return;
            }
            if (!cells) {
                cells = this.viewModel.viewCells;
            }
            return this.notebookExecutionService.cancelNotebookCellHandles(this.textModel, Array.from(cells).map(cell => cell.handle));
        }
        async executeNotebookCells(cells) {
            if (!this.viewModel || !this.hasModel()) {
                this.logService.info('notebookEditorWidget', 'No NotebookViewModel, cannot execute cells');
                return;
            }
            if (!cells) {
                cells = this.viewModel.viewCells;
            }
            return this.notebookExecutionService.executeNotebookCells(this.textModel, Array.from(cells).map(c => c.model), this.scopedContextKeyService);
        }
        async layoutNotebookCell(cell, height, context) {
            this._debug('layout cell', cell.handle, height);
            const viewIndex = this._list.getViewIndex(cell);
            if (viewIndex === undefined) {
                // the cell is hidden
                return;
            }
            if (this._pendingLayouts?.has(cell)) {
                this._pendingLayouts?.get(cell).dispose();
            }
            const deferred = new async_1.DeferredPromise();
            const doLayout = () => {
                if (this._isDisposed) {
                    return;
                }
                if (!this.viewModel?.hasCell(cell)) {
                    // Cell removed in the meantime?
                    return;
                }
                if (this._list.elementHeight(cell) === height) {
                    return;
                }
                this._pendingLayouts?.delete(cell);
                if (!this.hasEditorFocus()) {
                    // Do not scroll inactive notebook
                    // https://github.com/microsoft/vscode/issues/145340
                    const cellIndex = this.viewModel?.getCellIndex(cell);
                    const visibleRanges = this.visibleRanges;
                    if (cellIndex !== undefined
                        && visibleRanges && visibleRanges.length && visibleRanges[0].start === cellIndex
                        // cell is partially visible
                        && this._list.scrollTop > this.getAbsoluteTopOfElement(cell)) {
                        return this._list.updateElementHeight2(cell, height, Math.min(cellIndex + 1, this.getLength() - 1));
                    }
                }
                this._list.updateElementHeight2(cell, height);
                deferred.complete(undefined);
            };
            if (this._list.inRenderingTransaction) {
                const layoutDisposable = DOM.scheduleAtNextAnimationFrame(doLayout);
                this._pendingLayouts?.set(cell, (0, lifecycle_1.toDisposable)(() => {
                    layoutDisposable.dispose();
                    deferred.complete(undefined);
                }));
            }
            else {
                doLayout();
            }
            return deferred.p;
        }
        getActiveCell() {
            const elements = this._list.getFocusedElements();
            if (elements && elements.length) {
                return elements[0];
            }
            return undefined;
        }
        _toggleNotebookCellSelection(selectedCell, selectFromPrevious) {
            const currentSelections = this._list.getSelectedElements();
            const isSelected = currentSelections.includes(selectedCell);
            const previousSelection = selectFromPrevious ? currentSelections[currentSelections.length - 1] ?? selectedCell : selectedCell;
            const selectedIndex = this._list.getViewIndex(selectedCell);
            const previousIndex = this._list.getViewIndex(previousSelection);
            const cellsInSelectionRange = this.getCellsInViewRange(selectedIndex, previousIndex);
            if (isSelected) {
                // Deselect
                this._list.selectElements(currentSelections.filter(current => !cellsInSelectionRange.includes(current)));
            }
            else {
                // Add to selection
                this.focusElement(selectedCell);
                this._list.selectElements([...currentSelections.filter(current => !cellsInSelectionRange.includes(current)), ...cellsInSelectionRange]);
            }
        }
        getCellsInViewRange(fromInclusive, toInclusive) {
            const selectedCellsInRange = [];
            for (let index = 0; index < this._list.length; ++index) {
                const cell = this._list.element(index);
                if (cell) {
                    if ((index >= fromInclusive && index <= toInclusive) || (index >= toInclusive && index <= fromInclusive)) {
                        selectedCellsInRange.push(cell);
                    }
                }
            }
            return selectedCellsInRange;
        }
        async focusNotebookCell(cell, focusItem, options) {
            if (this._isDisposed) {
                return;
            }
            if (focusItem === 'editor') {
                this.focusElement(cell);
                this._list.focusView();
                cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'focusNotebookCell');
                cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                if (!options?.skipReveal) {
                    if (typeof options?.focusEditorLine === 'number') {
                        this._cursorNavMode.set(true);
                        await this.revealLineInViewAsync(cell, options.focusEditorLine);
                        const editor = this._renderedEditors.get(cell);
                        const focusEditorLine = options.focusEditorLine;
                        editor?.setSelection({
                            startLineNumber: focusEditorLine,
                            startColumn: 1,
                            endLineNumber: focusEditorLine,
                            endColumn: 1
                        });
                    }
                    else {
                        const selectionsStartPosition = cell.getSelectionsStartPosition();
                        if (selectionsStartPosition?.length) {
                            const firstSelectionPosition = selectionsStartPosition[0];
                            await this.revealRangeInCenterIfOutsideViewportAsync(cell, range_1.Range.fromPositions(firstSelectionPosition, firstSelectionPosition));
                        }
                        else {
                            this.revealInCenterIfOutsideViewport(cell);
                        }
                    }
                }
            }
            else if (focusItem === 'output') {
                this.focusElement(cell);
                if (!this.hasEditorFocus()) {
                    this._list.focusView();
                }
                if (!this._webview) {
                    return;
                }
                const focusElementId = options?.outputId ?? cell.id;
                this._webview.focusOutput(focusElementId, options?.altOutputId, this._webviewFocused);
                cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'focusNotebookCell');
                cell.focusMode = notebookBrowser_1.CellFocusMode.Output;
                if (!options?.skipReveal) {
                    this.revealInCenterIfOutsideViewport(cell);
                }
            }
            else {
                // focus container
                const itemDOM = this._list.domElementOfElement(cell);
                if (document.activeElement && itemDOM && itemDOM.contains(document.activeElement)) {
                    document.activeElement.blur();
                }
                cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'focusNotebookCell');
                cell.focusMode = notebookBrowser_1.CellFocusMode.Container;
                this.focusElement(cell);
                if (!options?.skipReveal) {
                    if (typeof options?.focusEditorLine === 'number') {
                        this._cursorNavMode.set(true);
                        this.revealInView(cell);
                    }
                    else if (options?.revealBehavior === notebookBrowser_1.ScrollToRevealBehavior.fullCell) {
                        this.revealInView(cell);
                    }
                    else if (options?.revealBehavior === notebookBrowser_1.ScrollToRevealBehavior.firstLine) {
                        this.revealFirstLineIfOutsideViewport(cell);
                    }
                    else {
                        this.revealInCenterIfOutsideViewport(cell);
                    }
                }
                this._list.focusView();
                this.updateEditorFocus();
            }
        }
        async focusNextNotebookCell(cell, focusItem) {
            const idx = this.viewModel?.getCellIndex(cell);
            if (typeof idx !== 'number') {
                return;
            }
            const newCell = this.viewModel?.cellAt(idx + 1);
            if (!newCell) {
                return;
            }
            await this.focusNotebookCell(newCell, focusItem);
        }
        //#endregion
        //#region Find
        async _warmupCell(viewCell) {
            if (viewCell.isOutputCollapsed) {
                return;
            }
            const outputs = viewCell.outputsViewModels;
            for (const output of outputs.slice(0, codeCellViewModel_1.outputDisplayLimit)) {
                const [mimeTypes, pick] = output.resolveMimeTypes(this.textModel, undefined);
                if (!mimeTypes.find(mimeType => mimeType.isTrusted) || mimeTypes.length === 0) {
                    continue;
                }
                const pickedMimeTypeRenderer = mimeTypes[pick];
                if (!pickedMimeTypeRenderer) {
                    return;
                }
                const renderer = this._notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
                if (!renderer) {
                    return;
                }
                const result = { type: 1 /* RenderOutputType.Extension */, renderer, source: output, mimeType: pickedMimeTypeRenderer.mimeType };
                const inset = this._webview?.insetMapping.get(result.source);
                if (!inset || !inset.initialized) {
                    const p = new Promise(resolve => {
                        this._register(event_1.Event.any(this.onDidRenderOutput, this.onDidRemoveOutput)(e => {
                            if (e.model === result.source.model) {
                                resolve();
                            }
                        }));
                    });
                    this.createOutput(viewCell, result, 0, false);
                    await p;
                }
                else {
                    // request to update its visibility
                    this.createOutput(viewCell, result, 0, false);
                }
                return;
            }
        }
        async _warmupAll(includeOutput) {
            if (!this.hasModel() || !this.viewModel) {
                return;
            }
            const cells = this.viewModel.viewCells;
            const requests = [];
            for (let i = 0; i < cells.length; i++) {
                if (cells[i].cellKind === notebookCommon_1.CellKind.Markup && !this._webview.markupPreviewMapping.has(cells[i].id)) {
                    requests.push(this.createMarkupPreview(cells[i]));
                }
            }
            if (includeOutput && this._list) {
                for (let i = 0; i < this._list.length; i++) {
                    const cell = this._list.element(i);
                    if (cell?.cellKind === notebookCommon_1.CellKind.Code) {
                        requests.push(this._warmupCell(cell));
                    }
                }
            }
            return Promise.all(requests);
        }
        async find(query, options, token, skipWarmup = false, shouldGetSearchPreviewInfo = false, ownerID) {
            if (!this._notebookViewModel) {
                return [];
            }
            if (!ownerID) {
                ownerID = this.getId();
            }
            const findMatches = this._notebookViewModel.find(query, options).filter(match => match.length > 0);
            if (!options.includeMarkupPreview && !options.includeOutput) {
                this._webview?.findStop(ownerID);
                return findMatches;
            }
            // search in webview enabled
            const matchMap = {};
            findMatches.forEach(match => {
                matchMap[match.cell.id] = match;
            });
            if (this._webview) {
                // request all outputs to be rendered
                // measure perf
                const start = Date.now();
                await this._warmupAll(!!options.includeOutput);
                const end = Date.now();
                this.logService.debug('Find', `Warmup time: ${end - start}ms`);
                if (token.isCancellationRequested) {
                    return [];
                }
                const webviewMatches = await this._webview.find(query, { caseSensitive: options.caseSensitive, wholeWord: options.wholeWord, includeMarkup: !!options.includeMarkupPreview, includeOutput: !!options.includeOutput, shouldGetSearchPreviewInfo, ownerID });
                if (token.isCancellationRequested) {
                    return [];
                }
                // attach webview matches to model find matches
                webviewMatches.forEach(match => {
                    const cell = this._notebookViewModel.viewCells.find(cell => cell.id === match.cellId);
                    if (!cell) {
                        return;
                    }
                    if (match.type === 'preview') {
                        // markup preview
                        if (cell.getEditState() === notebookBrowser_1.CellEditState.Preview && !options.includeMarkupPreview) {
                            return;
                        }
                        if (cell.getEditState() === notebookBrowser_1.CellEditState.Editing && options.includeMarkupInput) {
                            return;
                        }
                    }
                    else {
                        if (!options.includeOutput) {
                            // skip outputs if not included
                            return;
                        }
                    }
                    const exisitingMatch = matchMap[match.cellId];
                    if (exisitingMatch) {
                        exisitingMatch.webviewMatches.push(match);
                    }
                    else {
                        matchMap[match.cellId] = new findModel_1.CellFindMatchModel(this._notebookViewModel.viewCells.find(cell => cell.id === match.cellId), this._notebookViewModel.viewCells.findIndex(cell => cell.id === match.cellId), [], [match]);
                    }
                });
            }
            const ret = [];
            this._notebookViewModel.viewCells.forEach((cell, index) => {
                if (matchMap[cell.id]) {
                    ret.push(new findModel_1.CellFindMatchModel(cell, index, matchMap[cell.id].contentMatches, matchMap[cell.id].webviewMatches));
                }
            });
            return ret;
        }
        async findHighlightCurrent(matchIndex, ownerID) {
            if (!this._webview) {
                return 0;
            }
            return this._webview?.findHighlightCurrent(matchIndex, ownerID ?? this.getId());
        }
        async findUnHighlightCurrent(matchIndex, ownerID) {
            if (!this._webview) {
                return;
            }
            return this._webview?.findUnHighlightCurrent(matchIndex, ownerID ?? this.getId());
        }
        findStop(ownerID) {
            this._webview?.findStop(ownerID ?? this.getId());
        }
        //#endregion
        //#region MISC
        getLayoutInfo() {
            if (!this._list) {
                throw new Error('Editor is not initalized successfully');
            }
            if (!this._fontInfo) {
                this._generateFontInfo();
            }
            return {
                width: this._dimension?.width ?? 0,
                height: this._dimension?.height ?? 0,
                scrollHeight: this._list?.getScrollHeight() ?? 0,
                fontInfo: this._fontInfo,
                stickyHeight: this._notebookStickyScroll?.getCurrentStickyHeight() ?? 0
            };
        }
        async createMarkupPreview(cell) {
            if (!this._webview) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            if (!this._webview || !this._list.webviewElement) {
                return;
            }
            if (!this.viewModel || !this._list.viewModel) {
                return;
            }
            if (this.viewModel.getCellIndex(cell) === -1) {
                return;
            }
            if (this.cellIsHidden(cell)) {
                return;
            }
            const webviewTop = parseInt(this._list.webviewElement.domNode.style.top, 10);
            const top = !!webviewTop ? (0 - webviewTop) : 0;
            const cellTop = this._list.getCellViewScrollTop(cell);
            await this._webview.showMarkupPreview({
                mime: cell.mime,
                cellHandle: cell.handle,
                cellId: cell.id,
                content: cell.getText(),
                offset: cellTop + top,
                visible: true,
                metadata: cell.metadata,
            });
        }
        cellIsHidden(cell) {
            const modelIndex = this.viewModel.getCellIndex(cell);
            const foldedRanges = this.viewModel.getHiddenRanges();
            return foldedRanges.some(range => modelIndex >= range.start && modelIndex <= range.end);
        }
        async unhideMarkupPreviews(cells) {
            if (!this._webview) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            await this._webview?.unhideMarkupPreviews(cells.map(cell => cell.id));
        }
        async hideMarkupPreviews(cells) {
            if (!this._webview || !cells.length) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            await this._webview?.hideMarkupPreviews(cells.map(cell => cell.id));
        }
        async deleteMarkupPreviews(cells) {
            if (!this._webview) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            await this._webview?.deleteMarkupPreviews(cells.map(cell => cell.id));
        }
        async updateSelectedMarkdownPreviews() {
            if (!this._webview) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            const selectedCells = this.getSelectionViewModels().map(cell => cell.id);
            // Only show selection when there is more than 1 cell selected
            await this._webview?.updateMarkupPreviewSelections(selectedCells.length > 1 ? selectedCells : []);
        }
        async createOutput(cell, output, offset, createWhenIdle) {
            this._insetModifyQueueByOutputId.queue(output.source.model.outputId, async () => {
                if (this._isDisposed || !this._webview) {
                    return;
                }
                if (!this._webview.isResolved()) {
                    await this._resolveWebview();
                }
                if (!this._webview) {
                    return;
                }
                if (!this._list.webviewElement) {
                    return;
                }
                if (output.type === 1 /* RenderOutputType.Extension */) {
                    this.notebookRendererMessaging.prepare(output.renderer.id);
                }
                const webviewTop = parseInt(this._list.webviewElement.domNode.style.top, 10);
                const top = !!webviewTop ? (0 - webviewTop) : 0;
                const cellTop = this._list.getCellViewScrollTop(cell) + top;
                const existingOutput = this._webview.insetMapping.get(output.source);
                if (!existingOutput
                    || (!existingOutput.renderer && output.type === 1 /* RenderOutputType.Extension */)) {
                    if (createWhenIdle) {
                        this._webview.requestCreateOutputWhenWebviewIdle({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri, executionId: cell.internalMetadata.executionId }, output, cellTop, offset);
                    }
                    else {
                        this._webview.createOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri, executionId: cell.internalMetadata.executionId }, output, cellTop, offset);
                    }
                }
                else if (existingOutput.renderer
                    && output.type === 1 /* RenderOutputType.Extension */
                    && existingOutput.renderer.id !== output.renderer.id) {
                    // switch mimetype
                    this._webview.removeInsets([output.source]);
                    this._webview.createOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri }, output, cellTop, offset);
                }
                else if (existingOutput.versionId !== output.source.model.versionId) {
                    this._webview.updateOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri, executionId: cell.internalMetadata.executionId }, output, cellTop, offset);
                }
                else {
                    const outputIndex = cell.outputsViewModels.indexOf(output.source);
                    const outputOffset = cell.getOutputOffset(outputIndex);
                    this._webview.updateScrollTops([{
                            cell,
                            output: output.source,
                            cellTop,
                            outputOffset,
                            forceDisplay: !cell.isOutputCollapsed,
                        }], []);
                }
            });
        }
        async updateOutput(cell, output, offset) {
            this._insetModifyQueueByOutputId.queue(output.source.model.outputId, async () => {
                if (this._isDisposed || !this._webview) {
                    return;
                }
                if (!this._webview.isResolved()) {
                    await this._resolveWebview();
                }
                if (!this._webview || !this._list.webviewElement) {
                    return;
                }
                if (!this._webview.insetMapping.has(output.source)) {
                    return this.createOutput(cell, output, offset, false);
                }
                if (output.type === 1 /* RenderOutputType.Extension */) {
                    this.notebookRendererMessaging.prepare(output.renderer.id);
                }
                const webviewTop = parseInt(this._list.webviewElement.domNode.style.top, 10);
                const top = !!webviewTop ? (0 - webviewTop) : 0;
                const cellTop = this._list.getCellViewScrollTop(cell) + top;
                this._webview.updateOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri }, output, cellTop, offset);
            });
        }
        async copyOutputImage(cellOutput) {
            this._webview?.copyImage(cellOutput);
        }
        removeInset(output) {
            this._insetModifyQueueByOutputId.queue(output.model.outputId, async () => {
                if (this._isDisposed || !this._webview) {
                    return;
                }
                if (this._webview?.isResolved()) {
                    this._webview.removeInsets([output]);
                }
                this._onDidRemoveOutput.fire(output);
            });
        }
        hideInset(output) {
            this._insetModifyQueueByOutputId.queue(output.model.outputId, async () => {
                if (this._isDisposed || !this._webview) {
                    return;
                }
                if (this._webview?.isResolved()) {
                    this._webview.hideInset(output);
                }
            });
        }
        //#region --- webview IPC ----
        postMessage(message) {
            if (this._webview?.isResolved()) {
                this._webview.postKernelMessage(message);
            }
        }
        //#endregion
        addClassName(className) {
            this._overlayContainer.classList.add(className);
        }
        removeClassName(className) {
            this._overlayContainer.classList.remove(className);
        }
        cellAt(index) {
            return this.viewModel?.cellAt(index);
        }
        getCellByInfo(cellInfo) {
            const { cellHandle } = cellInfo;
            return this.viewModel?.viewCells.find(vc => vc.handle === cellHandle);
        }
        getCellByHandle(handle) {
            return this.viewModel?.getCellByHandle(handle);
        }
        getCellIndex(cell) {
            return this.viewModel?.getCellIndexByHandle(cell.handle);
        }
        getNextVisibleCellIndex(index) {
            return this.viewModel?.getNextVisibleCellIndex(index);
        }
        getPreviousVisibleCellIndex(index) {
            return this.viewModel?.getPreviousVisibleCellIndex(index);
        }
        _updateScrollHeight() {
            if (this._isDisposed || !this._webview?.isResolved()) {
                return;
            }
            if (!this._list.webviewElement) {
                return;
            }
            const scrollHeight = this._list.scrollHeight;
            this._webview.element.style.height = `${scrollHeight + notebookCellList_1.NOTEBOOK_WEBVIEW_BOUNDARY * 2}px`;
            const webviewTop = parseInt(this._list.webviewElement.domNode.style.top, 10);
            const top = !!webviewTop ? (0 - webviewTop) : 0;
            const updateItems = [];
            const removedItems = [];
            this._webview?.insetMapping.forEach((value, key) => {
                const cell = this.viewModel?.getCellByHandle(value.cellInfo.cellHandle);
                if (!cell || !(cell instanceof codeCellViewModel_1.CodeCellViewModel)) {
                    return;
                }
                this.viewModel?.viewCells.find(cell => cell.handle === value.cellInfo.cellHandle);
                const viewIndex = this._list.getViewIndex(cell);
                if (viewIndex === undefined) {
                    return;
                }
                if (cell.outputsViewModels.indexOf(key) < 0) {
                    // output is already gone
                    removedItems.push(key);
                }
                const cellTop = this._list.getCellViewScrollTop(cell);
                const outputIndex = cell.outputsViewModels.indexOf(key);
                const outputOffset = cell.getOutputOffset(outputIndex);
                updateItems.push({
                    cell,
                    output: key,
                    cellTop: cellTop + top,
                    outputOffset,
                    forceDisplay: false,
                });
            });
            this._webview.removeInsets(removedItems);
            const markdownUpdateItems = [];
            for (const cellId of this._webview.markupPreviewMapping.keys()) {
                const cell = this.viewModel?.viewCells.find(cell => cell.id === cellId);
                if (cell) {
                    const cellTop = this._list.getCellViewScrollTop(cell);
                    // markdownUpdateItems.push({ id: cellId, top: cellTop });
                    markdownUpdateItems.push({ id: cellId, top: cellTop + top });
                }
            }
            if (markdownUpdateItems.length || updateItems.length) {
                this._debug('_list.onDidChangeContentHeight/markdown', markdownUpdateItems);
                this._webview?.updateScrollTops(updateItems, markdownUpdateItems);
            }
        }
        //#endregion
        //#region BacklayerWebview delegate
        _updateOutputHeight(cellInfo, output, outputHeight, isInit, source) {
            const cell = this.viewModel?.viewCells.find(vc => vc.handle === cellInfo.cellHandle);
            if (cell && cell instanceof codeCellViewModel_1.CodeCellViewModel) {
                const outputIndex = cell.outputsViewModels.indexOf(output);
                if (outputHeight !== 0) {
                    cell.updateOutputMinHeight(0);
                }
                this._debug('update cell output', cell.handle, outputHeight);
                cell.updateOutputHeight(outputIndex, outputHeight, source);
                this.layoutNotebookCell(cell, cell.layoutInfo.totalHeight);
                if (isInit) {
                    this._onDidRenderOutput.fire(output);
                }
            }
        }
        _scheduleOutputHeightAck(cellInfo, outputId, height) {
            const wasEmpty = this._pendingOutputHeightAcks.size === 0;
            this._pendingOutputHeightAcks.set(outputId, { cellId: cellInfo.cellId, outputId, height });
            if (wasEmpty) {
                DOM.scheduleAtNextAnimationFrame(() => {
                    this._debug('ack height');
                    this._updateScrollHeight();
                    this._webview?.ackHeight([...this._pendingOutputHeightAcks.values()]);
                    this._pendingOutputHeightAcks.clear();
                }, -1); // -1 priority because this depends on calls to layoutNotebookCell, and that may be called multiple times before this runs
            }
        }
        _getCellById(cellId) {
            return this.viewModel?.viewCells.find(vc => vc.id === cellId);
        }
        _updateMarkupCellHeight(cellId, height, isInit) {
            const cell = this._getCellById(cellId);
            if (cell && cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                const { bottomToolbarGap } = this._notebookOptions.computeBottomToolbarDimensions(this.viewModel?.viewType);
                this._debug('updateMarkdownCellHeight', cell.handle, height + bottomToolbarGap, isInit);
                cell.renderedMarkdownHeight = height;
            }
        }
        _setMarkupCellEditState(cellId, editState) {
            const cell = this._getCellById(cellId);
            if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                this.revealInView(cell);
                cell.updateEditState(editState, 'setMarkdownCellEditState');
            }
        }
        _didStartDragMarkupCell(cellId, event) {
            const cell = this._getCellById(cellId);
            if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                const webviewOffset = this._list.webviewElement ? -parseInt(this._list.webviewElement.domNode.style.top, 10) : 0;
                this._dndController?.startExplicitDrag(cell, event.dragOffsetY - webviewOffset);
            }
        }
        _didDragMarkupCell(cellId, event) {
            const cell = this._getCellById(cellId);
            if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                const webviewOffset = this._list.webviewElement ? -parseInt(this._list.webviewElement.domNode.style.top, 10) : 0;
                this._dndController?.explicitDrag(cell, event.dragOffsetY - webviewOffset);
            }
        }
        _didDropMarkupCell(cellId, event) {
            const cell = this._getCellById(cellId);
            if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                const webviewOffset = this._list.webviewElement ? -parseInt(this._list.webviewElement.domNode.style.top, 10) : 0;
                event.dragOffsetY -= webviewOffset;
                this._dndController?.explicitDrop(cell, event);
            }
        }
        _didEndDragMarkupCell(cellId) {
            const cell = this._getCellById(cellId);
            if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                this._dndController?.endExplicitDrag(cell);
            }
        }
        _didResizeOutput(cellId) {
            const cell = this._getCellById(cellId);
            if (cell) {
                this._onDidResizeOutputEmitter.fire(cell);
            }
        }
        _updatePerformanceMetadata(cellId, executionId, duration, rendererId) {
            if (!this.hasModel()) {
                return;
            }
            const cell = this._getCellById(cellId);
            const cellIndex = !cell ? undefined : this.getCellIndex(cell);
            if (cell?.internalMetadata.executionId === executionId && cellIndex !== undefined) {
                const renderDurationMap = cell.internalMetadata.renderDuration || {};
                renderDurationMap[rendererId] = (renderDurationMap[rendererId] ?? 0) + duration;
                this.textModel.applyEdits([
                    {
                        editType: 9 /* CellEditType.PartialInternalMetadata */,
                        index: cellIndex,
                        internalMetadata: {
                            executionId: executionId,
                            renderDuration: renderDurationMap
                        }
                    }
                ], true, undefined, () => undefined, undefined, false);
            }
        }
        //#endregion
        //#region Editor Contributions
        getContribution(id) {
            return (this._contributions.get(id) || null);
        }
        //#endregion
        dispose() {
            this._isDisposed = true;
            // dispose webview first
            this._webview?.dispose();
            this._webview = null;
            this.notebookEditorService.removeNotebookEditor(this);
            (0, lifecycle_1.dispose)(this._contributions.values());
            this._contributions.clear();
            this._localStore.clear();
            (0, lifecycle_1.dispose)(this._localCellStateListeners);
            this._list.dispose();
            this._listTopCellToolbar?.dispose();
            this._overlayContainer.remove();
            this.viewModel?.dispose();
            this._renderedEditors.clear();
            this._baseCellEditorOptions.forEach(v => v.dispose());
            this._baseCellEditorOptions.clear();
            this._notebookOverviewRulerContainer.remove();
            super.dispose();
            // unref
            this._webview = null;
            this._webviewResolvePromise = null;
            this._webviewTransparentCover = null;
            this._dndController = null;
            this._listTopCellToolbar = null;
            this._notebookViewModel = undefined;
            this._cellContextKeyManager = null;
            this._notebookTopToolbar = null;
            this._list = null;
            this._listViewInfoAccessor = null;
            this._pendingLayouts = null;
            this._listDelegate = null;
        }
        toJSON() {
            return {
                notebookUri: this.viewModel?.uri,
            };
        }
    };
    exports.NotebookEditorWidget = NotebookEditorWidget;
    exports.NotebookEditorWidget = NotebookEditorWidget = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, editorGroupsService_1.IEditorGroupsService),
        __param(4, notebookRendererMessagingService_1.INotebookRendererMessagingService),
        __param(5, notebookEditorService_1.INotebookEditorService),
        __param(6, notebookKernelService_1.INotebookKernelService),
        __param(7, notebookService_1.INotebookService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, layoutService_1.ILayoutService),
        __param(11, contextView_1.IContextMenuService),
        __param(12, telemetry_1.ITelemetryService),
        __param(13, notebookExecutionService_1.INotebookExecutionService),
        __param(14, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(15, progress_1.IEditorProgressService),
        __param(16, notebookLoggingService_1.INotebookLoggingService),
        __param(17, keybinding_1.IKeybindingService)
    ], NotebookEditorWidget);
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 5, 'notebook-progress-bar');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 10, 'notebook-list-insertion-indicator');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 20, 'notebook-cell-editor-outline');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 25, 'notebook-scrollbar');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 26, 'notebook-cell-status');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 26, 'notebook-folding-indicator');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 27, 'notebook-output');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 28, 'notebook-cell-bottom-toolbar-container');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 29, 'notebook-run-button-container');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 29, 'notebook-input-collapse-condicon');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 30, 'notebook-cell-output-toolbar');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 31, 'notebook-sticky-scroll');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Sash, 1, 'notebook-cell-expand-part-button');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Sash, 2, 'notebook-cell-toolbar');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Sash, 3, 'notebook-cell-toolbar-dropdown-active');
    exports.notebookCellBorder = (0, colorRegistry_1.registerColor)('notebook.cellBorderColor', {
        dark: (0, colorRegistry_1.transparent)(colorRegistry_1.listInactiveSelectionBackground, 1),
        light: (0, colorRegistry_1.transparent)(colorRegistry_1.listInactiveSelectionBackground, 1),
        hcDark: theme_1.PANEL_BORDER,
        hcLight: theme_1.PANEL_BORDER
    }, nls.localize('notebook.cellBorderColor', "The border color for notebook cells."));
    exports.focusedEditorBorderColor = (0, colorRegistry_1.registerColor)('notebook.focusedEditorBorder', {
        light: colorRegistry_1.focusBorder,
        dark: colorRegistry_1.focusBorder,
        hcDark: colorRegistry_1.focusBorder,
        hcLight: colorRegistry_1.focusBorder
    }, nls.localize('notebook.focusedEditorBorder', "The color of the notebook cell editor border."));
    exports.cellStatusIconSuccess = (0, colorRegistry_1.registerColor)('notebookStatusSuccessIcon.foreground', {
        light: debugColors_1.debugIconStartForeground,
        dark: debugColors_1.debugIconStartForeground,
        hcDark: debugColors_1.debugIconStartForeground,
        hcLight: debugColors_1.debugIconStartForeground
    }, nls.localize('notebookStatusSuccessIcon.foreground', "The error icon color of notebook cells in the cell status bar."));
    exports.runningCellRulerDecorationColor = (0, colorRegistry_1.registerColor)('notebookEditorOverviewRuler.runningCellForeground', {
        light: debugColors_1.debugIconStartForeground,
        dark: debugColors_1.debugIconStartForeground,
        hcDark: debugColors_1.debugIconStartForeground,
        hcLight: debugColors_1.debugIconStartForeground
    }, nls.localize('notebookEditorOverviewRuler.runningCellForeground', "The color of the running cell decoration in the notebook editor overview ruler."));
    exports.cellStatusIconError = (0, colorRegistry_1.registerColor)('notebookStatusErrorIcon.foreground', {
        light: colorRegistry_1.errorForeground,
        dark: colorRegistry_1.errorForeground,
        hcDark: colorRegistry_1.errorForeground,
        hcLight: colorRegistry_1.errorForeground
    }, nls.localize('notebookStatusErrorIcon.foreground', "The error icon color of notebook cells in the cell status bar."));
    exports.cellStatusIconRunning = (0, colorRegistry_1.registerColor)('notebookStatusRunningIcon.foreground', {
        light: colorRegistry_1.foreground,
        dark: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, nls.localize('notebookStatusRunningIcon.foreground', "The running icon color of notebook cells in the cell status bar."));
    exports.notebookOutputContainerBorderColor = (0, colorRegistry_1.registerColor)('notebook.outputContainerBorderColor', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, nls.localize('notebook.outputContainerBorderColor', "The border color of the notebook output container."));
    exports.notebookOutputContainerColor = (0, colorRegistry_1.registerColor)('notebook.outputContainerBackgroundColor', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, nls.localize('notebook.outputContainerBackgroundColor', "The color of the notebook output container background."));
    // TODO@rebornix currently also used for toolbar border, if we keep all of this, pick a generic name
    exports.CELL_TOOLBAR_SEPERATOR = (0, colorRegistry_1.registerColor)('notebook.cellToolbarSeparator', {
        dark: color_1.Color.fromHex('#808080').transparent(0.35),
        light: color_1.Color.fromHex('#808080').transparent(0.35),
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, nls.localize('notebook.cellToolbarSeparator', "The color of the separator in the cell bottom toolbar"));
    exports.focusedCellBackground = (0, colorRegistry_1.registerColor)('notebook.focusedCellBackground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, nls.localize('focusedCellBackground', "The background color of a cell when the cell is focused."));
    exports.selectedCellBackground = (0, colorRegistry_1.registerColor)('notebook.selectedCellBackground', {
        dark: colorRegistry_1.listInactiveSelectionBackground,
        light: colorRegistry_1.listInactiveSelectionBackground,
        hcDark: null,
        hcLight: null
    }, nls.localize('selectedCellBackground', "The background color of a cell when the cell is selected."));
    exports.cellHoverBackground = (0, colorRegistry_1.registerColor)('notebook.cellHoverBackground', {
        dark: (0, colorRegistry_1.transparent)(exports.focusedCellBackground, .5),
        light: (0, colorRegistry_1.transparent)(exports.focusedCellBackground, .7),
        hcDark: null,
        hcLight: null
    }, nls.localize('notebook.cellHoverBackground', "The background color of a cell when the cell is hovered."));
    exports.selectedCellBorder = (0, colorRegistry_1.registerColor)('notebook.selectedCellBorder', {
        dark: exports.notebookCellBorder,
        light: exports.notebookCellBorder,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, nls.localize('notebook.selectedCellBorder', "The color of the cell's top and bottom border when the cell is selected but not focused."));
    exports.inactiveSelectedCellBorder = (0, colorRegistry_1.registerColor)('notebook.inactiveSelectedCellBorder', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.focusBorder,
        hcLight: colorRegistry_1.focusBorder
    }, nls.localize('notebook.inactiveSelectedCellBorder', "The color of the cell's borders when multiple cells are selected."));
    exports.focusedCellBorder = (0, colorRegistry_1.registerColor)('notebook.focusedCellBorder', {
        dark: colorRegistry_1.focusBorder,
        light: colorRegistry_1.focusBorder,
        hcDark: colorRegistry_1.focusBorder,
        hcLight: colorRegistry_1.focusBorder
    }, nls.localize('notebook.focusedCellBorder', "The color of the cell's focus indicator borders when the cell is focused."));
    exports.inactiveFocusedCellBorder = (0, colorRegistry_1.registerColor)('notebook.inactiveFocusedCellBorder', {
        dark: exports.notebookCellBorder,
        light: exports.notebookCellBorder,
        hcDark: exports.notebookCellBorder,
        hcLight: exports.notebookCellBorder
    }, nls.localize('notebook.inactiveFocusedCellBorder', "The color of the cell's top and bottom border when a cell is focused while the primary focus is outside of the editor."));
    exports.cellStatusBarItemHover = (0, colorRegistry_1.registerColor)('notebook.cellStatusBarItemHoverBackground', {
        light: new color_1.Color(new color_1.RGBA(0, 0, 0, 0.08)),
        dark: new color_1.Color(new color_1.RGBA(255, 255, 255, 0.15)),
        hcDark: new color_1.Color(new color_1.RGBA(255, 255, 255, 0.15)),
        hcLight: new color_1.Color(new color_1.RGBA(0, 0, 0, 0.08)),
    }, nls.localize('notebook.cellStatusBarItemHoverBackground', "The background color of notebook cell status bar items."));
    exports.cellInsertionIndicator = (0, colorRegistry_1.registerColor)('notebook.cellInsertionIndicator', {
        light: colorRegistry_1.focusBorder,
        dark: colorRegistry_1.focusBorder,
        hcDark: colorRegistry_1.focusBorder,
        hcLight: colorRegistry_1.focusBorder
    }, nls.localize('notebook.cellInsertionIndicator', "The color of the notebook cell insertion indicator."));
    exports.listScrollbarSliderBackground = (0, colorRegistry_1.registerColor)('notebookScrollbarSlider.background', {
        dark: colorRegistry_1.scrollbarSliderBackground,
        light: colorRegistry_1.scrollbarSliderBackground,
        hcDark: colorRegistry_1.scrollbarSliderBackground,
        hcLight: colorRegistry_1.scrollbarSliderBackground
    }, nls.localize('notebookScrollbarSliderBackground', "Notebook scrollbar slider background color."));
    exports.listScrollbarSliderHoverBackground = (0, colorRegistry_1.registerColor)('notebookScrollbarSlider.hoverBackground', {
        dark: colorRegistry_1.scrollbarSliderHoverBackground,
        light: colorRegistry_1.scrollbarSliderHoverBackground,
        hcDark: colorRegistry_1.scrollbarSliderHoverBackground,
        hcLight: colorRegistry_1.scrollbarSliderHoverBackground
    }, nls.localize('notebookScrollbarSliderHoverBackground', "Notebook scrollbar slider background color when hovering."));
    exports.listScrollbarSliderActiveBackground = (0, colorRegistry_1.registerColor)('notebookScrollbarSlider.activeBackground', {
        dark: colorRegistry_1.scrollbarSliderActiveBackground,
        light: colorRegistry_1.scrollbarSliderActiveBackground,
        hcDark: colorRegistry_1.scrollbarSliderActiveBackground,
        hcLight: colorRegistry_1.scrollbarSliderActiveBackground
    }, nls.localize('notebookScrollbarSliderActiveBackground', "Notebook scrollbar slider background color when clicked on."));
    exports.cellSymbolHighlight = (0, colorRegistry_1.registerColor)('notebook.symbolHighlightBackground', {
        dark: color_1.Color.fromHex('#ffffff0b'),
        light: color_1.Color.fromHex('#fdff0033'),
        hcDark: null,
        hcLight: null
    }, nls.localize('notebook.symbolHighlightBackground', "Background color of highlighted cell"));
    exports.cellEditorBackground = (0, colorRegistry_1.registerColor)('notebook.cellEditorBackground', {
        light: theme_1.SIDE_BAR_BACKGROUND,
        dark: theme_1.SIDE_BAR_BACKGROUND,
        hcDark: null,
        hcLight: null
    }, nls.localize('notebook.cellEditorBackground', "Cell editor background color."));
    const notebookEditorBackground = (0, colorRegistry_1.registerColor)('notebook.editorBackground', {
        light: theme_1.EDITOR_PANE_BACKGROUND,
        dark: theme_1.EDITOR_PANE_BACKGROUND,
        hcDark: null,
        hcLight: null
    }, nls.localize('notebook.editorBackground', "Notebook background color."));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL25vdGVib29rRWRpdG9yV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXFHaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVoQixTQUFnQixpQ0FBaUM7UUFDaEQsOERBQThEO1FBQzlELE1BQU0saUJBQWlCLEdBQUc7WUFDekIsdUJBQXVCO1lBQ3ZCLG9DQUF1QixDQUFDLEVBQUU7WUFDMUIsMEJBQTBCO1lBQzFCLGtDQUFrQztZQUNsQyxtQ0FBbUM7WUFDbkMsc0NBQXNDO1lBQ3RDLCtCQUErQjtZQUMvQixvQ0FBb0M7U0FDcEMsQ0FBQztRQUNGLE1BQU0sYUFBYSxHQUFHLDJDQUF3QixDQUFDLHNCQUFzQixFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVILE9BQU87WUFDTixPQUFPLEVBQUU7Z0JBQ1IsZUFBZSxFQUFFLGdCQUFNLENBQUMsZUFBZTtnQkFDdkMsZ0JBQWdCLEVBQUUsZ0JBQU0sQ0FBQyxpQkFBaUI7Z0JBQzFDLGlCQUFpQixFQUFFLGdCQUFNLENBQUMsa0JBQWtCO2dCQUM1QyxpQkFBaUIsRUFBRSxnQkFBTSxDQUFDLG1CQUFtQjtnQkFDN0Msb0JBQW9CLEVBQUUsZ0JBQU0sQ0FBQyxtQkFBbUI7Z0JBQ2hELGtCQUFrQixFQUFFLGdCQUFNLENBQUMsbUJBQW1CO2dCQUM5QyxrQkFBa0IsRUFBRSxnQkFBTSxDQUFDLDBCQUEwQjthQUNyRDtZQUNELHVCQUF1QixFQUFFLGFBQWE7U0FDdEMs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