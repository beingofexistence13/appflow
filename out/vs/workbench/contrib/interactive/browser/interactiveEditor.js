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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/workbench/contrib/interactive/browser/interactiveEditorInput", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/language", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/interactive/browser/interactiveCommon", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/contextview/browser/contextView", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/editor/browser/editorExtensions", "vs/editor/contrib/parameterHints/browser/parameterHints", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/editor/contrib/suggest/browser/suggestController", "vs/editor/contrib/snippet/browser/snippetController2", "vs/workbench/contrib/snippets/browser/tabCompletion", "vs/editor/contrib/hover/browser/hover", "vs/editor/contrib/gotoError/browser/gotoError", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/services/extensions/common/extensions", "vs/base/common/resources", "vs/workbench/contrib/notebook/browser/contrib/find/notebookFindWidget", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/base/common/objects", "vs/css!./media/interactive", "vs/css!./interactiveEditor"], function (require, exports, nls, DOM, event_1, lifecycle_1, codeEditorService_1, codeEditorWidget_1, contextkey_1, instantiation_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, editorPane_1, simpleEditorOptions_1, interactiveEditorInput_1, notebookEditorExtensions_1, notebookEditorService_1, editorGroupsService_1, executionStatusBarItemController_1, notebookKernelService_1, modesRegistry_1, language_1, actions_1, keybinding_1, interactiveCommon_1, configuration_1, notebookOptions_1, toolbar_1, contextView_1, menuEntryActionViewItem_1, editorExtensions_1, parameterHints_1, menuPreventer_1, selectionClipboard_1, contextmenu_1, suggestController_1, snippetController2_1, tabCompletion_1, hover_1, gotoError_1, textResourceConfiguration_1, notebookExecutionStateService_1, notebookContextKeys_1, extensions_1, resources_1, notebookFindWidget_1, notebookCommon_1, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InteractiveEditor = void 0;
    const DECORATION_KEY = 'interactiveInputDecoration';
    const INTERACTIVE_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'InteractiveEditorViewState';
    const INPUT_CELL_VERTICAL_PADDING = 8;
    const INPUT_CELL_HORIZONTAL_PADDING_RIGHT = 10;
    const INPUT_EDITOR_PADDING = 8;
    let InteractiveEditor = class InteractiveEditor extends editorPane_1.EditorPane {
        get onDidFocus() { return this._onDidFocusWidget.event; }
        constructor(telemetryService, themeService, storageService, instantiationService, notebookWidgetService, contextKeyService, codeEditorService, notebookKernelService, languageService, keybindingService, configurationService, menuService, contextMenuService, editorGroupService, textResourceConfigurationService, notebookExecutionStateService, extensionService) {
            super(notebookCommon_1.INTERACTIVE_WINDOW_EDITOR_ID, telemetryService, themeService, storageService);
            this._notebookWidget = { value: undefined };
            this._widgetDisposableStore = this._register(new lifecycle_1.DisposableStore());
            this._groupListener = this._register(new lifecycle_1.DisposableStore());
            this._onDidFocusWidget = this._register(new event_1.Emitter());
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this._instantiationService = instantiationService;
            this._notebookWidgetService = notebookWidgetService;
            this._contextKeyService = contextKeyService;
            this._configurationService = configurationService;
            this._notebookKernelService = notebookKernelService;
            this._languageService = languageService;
            this._keybindingService = keybindingService;
            this._menuService = menuService;
            this._contextMenuService = contextMenuService;
            this._editorGroupService = editorGroupService;
            this._notebookExecutionStateService = notebookExecutionStateService;
            this._extensionService = extensionService;
            this._editorOptions = this._computeEditorOptions();
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor') || e.affectsConfiguration('notebook')) {
                    this._editorOptions = this._computeEditorOptions();
                }
            }));
            this._notebookOptions = new notebookOptions_1.NotebookOptions(configurationService, notebookExecutionStateService, true, { cellToolbarInteraction: 'hover', globalToolbar: true, stickyScroll: false, dragAndDropEnabled: false });
            this._editorMemento = this.getEditorMemento(editorGroupService, textResourceConfigurationService, INTERACTIVE_EDITOR_VIEW_STATE_PREFERENCE_KEY);
            codeEditorService.registerDecorationType('interactive-decoration', DECORATION_KEY, {});
            this._register(this._keybindingService.onDidUpdateKeybindings(this._updateInputDecoration, this));
            this._register(this._notebookExecutionStateService.onDidChangeExecution((e) => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && (0, resources_1.isEqual)(e.notebook, this._notebookWidget.value?.viewModel?.notebookDocument.uri)) {
                    const cell = this._notebookWidget.value?.getCellByHandle(e.cellHandle);
                    if (cell && e.changed?.state) {
                        this._scrollIfNecessary(cell);
                    }
                }
            }));
        }
        get inputCellContainerHeight() {
            return 19 + 2 + INPUT_CELL_VERTICAL_PADDING * 2 + INPUT_EDITOR_PADDING * 2;
        }
        get inputCellEditorHeight() {
            return 19 + INPUT_EDITOR_PADDING * 2;
        }
        createEditor(parent) {
            this._rootElement = DOM.append(parent, DOM.$('.interactive-editor'));
            this._rootElement.style.position = 'relative';
            this._notebookEditorContainer = DOM.append(this._rootElement, DOM.$('.notebook-editor-container'));
            this._inputCellContainer = DOM.append(this._rootElement, DOM.$('.input-cell-container'));
            this._inputCellContainer.style.position = 'absolute';
            this._inputCellContainer.style.height = `${this.inputCellContainerHeight}px`;
            this._inputFocusIndicator = DOM.append(this._inputCellContainer, DOM.$('.input-focus-indicator'));
            this._inputRunButtonContainer = DOM.append(this._inputCellContainer, DOM.$('.run-button-container'));
            this._setupRunButtonToolbar(this._inputRunButtonContainer);
            this._inputEditorContainer = DOM.append(this._inputCellContainer, DOM.$('.input-editor-container'));
            this._createLayoutStyles();
        }
        _setupRunButtonToolbar(runButtonContainer) {
            const menu = this._register(this._menuService.createMenu(actions_1.MenuId.InteractiveInputExecute, this._contextKeyService));
            this._runbuttonToolbar = this._register(new toolbar_1.ToolBar(runButtonContainer, this._contextMenuService, {
                getKeyBinding: action => this._keybindingService.lookupKeybinding(action.id),
                actionViewItemProvider: action => {
                    return (0, menuEntryActionViewItem_1.createActionViewItem)(this._instantiationService, action);
                },
                renderDropdownAsChildElement: true
            }));
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, result);
            this._runbuttonToolbar.setActions([...primary, ...secondary]);
        }
        _createLayoutStyles() {
            this._styleElement = DOM.createStyleSheet(this._rootElement);
            const styleSheets = [];
            const { focusIndicator, codeCellLeftMargin, cellRunGutter } = this._notebookOptions.getLayoutConfiguration();
            const leftMargin = codeCellLeftMargin + cellRunGutter;
            styleSheets.push(`
			.interactive-editor .input-cell-container {
				padding: ${INPUT_CELL_VERTICAL_PADDING}px ${INPUT_CELL_HORIZONTAL_PADDING_RIGHT}px ${INPUT_CELL_VERTICAL_PADDING}px ${leftMargin}px;
			}
		`);
            if (focusIndicator === 'gutter') {
                styleSheets.push(`
				.interactive-editor .input-cell-container:focus-within .input-focus-indicator::before {
					border-color: var(--vscode-notebook-focusedCellBorder) !important;
				}
				.interactive-editor .input-focus-indicator::before {
					border-color: var(--vscode-notebook-inactiveFocusedCellBorder) !important;
				}
				.interactive-editor .input-cell-container .input-focus-indicator {
					display: block;
					top: ${INPUT_CELL_VERTICAL_PADDING}px;
				}
				.interactive-editor .input-cell-container {
					border-top: 1px solid var(--vscode-notebook-inactiveFocusedCellBorder);
				}
			`);
            }
            else {
                // border
                styleSheets.push(`
				.interactive-editor .input-cell-container {
					border-top: 1px solid var(--vscode-notebook-inactiveFocusedCellBorder);
				}
				.interactive-editor .input-cell-container .input-focus-indicator {
					display: none;
				}
			`);
            }
            styleSheets.push(`
			.interactive-editor .input-cell-container .run-button-container {
				width: ${cellRunGutter}px;
				left: ${codeCellLeftMargin}px;
				margin-top: ${INPUT_EDITOR_PADDING - 2}px;
			}
		`);
            this._styleElement.textContent = styleSheets.join('\n');
        }
        _computeEditorOptions() {
            let overrideIdentifier = undefined;
            if (this._codeEditorWidget) {
                overrideIdentifier = this._codeEditorWidget.getModel()?.getLanguageId();
            }
            const editorOptions = (0, objects_1.deepClone)(this._configurationService.getValue('editor', { overrideIdentifier }));
            const editorOptionsOverride = (0, simpleEditorOptions_1.getSimpleEditorOptions)(this._configurationService);
            const computed = Object.freeze({
                ...editorOptions,
                ...editorOptionsOverride,
                ...{
                    glyphMargin: true,
                    padding: {
                        top: INPUT_EDITOR_PADDING,
                        bottom: INPUT_EDITOR_PADDING
                    },
                    hover: {
                        enabled: true
                    }
                }
            });
            return computed;
        }
        saveState() {
            this._saveEditorViewState(this.input);
            super.saveState();
        }
        getViewState() {
            const input = this.input;
            if (!(input instanceof interactiveEditorInput_1.InteractiveEditorInput)) {
                return undefined;
            }
            this._saveEditorViewState(input);
            return this._loadNotebookEditorViewState(input);
        }
        _saveEditorViewState(input) {
            if (this.group && this._notebookWidget.value && input instanceof interactiveEditorInput_1.InteractiveEditorInput) {
                if (this._notebookWidget.value.isDisposed) {
                    return;
                }
                const state = this._notebookWidget.value.getEditorViewState();
                const editorState = this._codeEditorWidget.saveViewState();
                this._editorMemento.saveEditorState(this.group, input.notebookEditorInput.resource, {
                    notebook: state,
                    input: editorState
                });
            }
        }
        _loadNotebookEditorViewState(input) {
            let result;
            if (this.group) {
                result = this._editorMemento.loadEditorState(this.group, input.notebookEditorInput.resource);
            }
            if (result) {
                return result;
            }
            // when we don't have a view state for the group/input-tuple then we try to use an existing
            // editor for the same resource.
            for (const group of this._editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
                if (group.activeEditorPane !== this && group.activeEditorPane === this && group.activeEditor?.matches(input)) {
                    const notebook = this._notebookWidget.value?.getEditorViewState();
                    const input = this._codeEditorWidget.saveViewState();
                    return {
                        notebook,
                        input
                    };
                }
            }
            return;
        }
        async setInput(input, options, context, token) {
            const group = this.group;
            const notebookInput = input.notebookEditorInput;
            // there currently is a widget which we still own so
            // we need to hide it before getting a new widget
            this._notebookWidget.value?.onWillHide();
            this._codeEditorWidget?.dispose();
            this._widgetDisposableStore.clear();
            this._notebookWidget = this._instantiationService.invokeFunction(this._notebookWidgetService.retrieveWidget, group, notebookInput, {
                isEmbedded: true,
                isReadOnly: true,
                contributions: notebookEditorExtensions_1.NotebookEditorExtensionsRegistry.getSomeEditorContributions([
                    executionStatusBarItemController_1.ExecutionStateCellStatusBarContrib.id,
                    executionStatusBarItemController_1.TimerCellStatusBarContrib.id,
                    notebookFindWidget_1.NotebookFindContrib.id
                ]),
                menuIds: {
                    notebookToolbar: actions_1.MenuId.InteractiveToolbar,
                    cellTitleToolbar: actions_1.MenuId.InteractiveCellTitle,
                    cellDeleteToolbar: actions_1.MenuId.InteractiveCellDelete,
                    cellInsertToolbar: actions_1.MenuId.NotebookCellBetween,
                    cellTopInsertToolbar: actions_1.MenuId.NotebookCellListTop,
                    cellExecuteToolbar: actions_1.MenuId.InteractiveCellExecute,
                    cellExecutePrimary: undefined
                },
                cellEditorContributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    selectionClipboard_1.SelectionClipboardContributionID,
                    contextmenu_1.ContextMenuController.ID,
                    hover_1.ModesHoverController.ID,
                    gotoError_1.MarkerController.ID
                ]),
                options: this._notebookOptions
            });
            this._codeEditorWidget = this._instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this._inputEditorContainer, this._editorOptions, {
                ...{
                    isSimpleWidget: false,
                    contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                        menuPreventer_1.MenuPreventer.ID,
                        selectionClipboard_1.SelectionClipboardContributionID,
                        contextmenu_1.ContextMenuController.ID,
                        suggestController_1.SuggestController.ID,
                        parameterHints_1.ParameterHintsController.ID,
                        snippetController2_1.SnippetController2.ID,
                        tabCompletion_1.TabCompletionController.ID,
                        hover_1.ModesHoverController.ID,
                        gotoError_1.MarkerController.ID
                    ])
                }
            });
            if (this._lastLayoutDimensions) {
                this._notebookEditorContainer.style.height = `${this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight}px`;
                this._notebookWidget.value.layout(new DOM.Dimension(this._lastLayoutDimensions.dimension.width, this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight), this._notebookEditorContainer);
                const { codeCellLeftMargin, cellRunGutter } = this._notebookOptions.getLayoutConfiguration();
                const leftMargin = codeCellLeftMargin + cellRunGutter;
                const maxHeight = Math.min(this._lastLayoutDimensions.dimension.height / 2, this.inputCellEditorHeight);
                this._codeEditorWidget.layout(this._validateDimension(this._lastLayoutDimensions.dimension.width - leftMargin - INPUT_CELL_HORIZONTAL_PADDING_RIGHT, maxHeight));
                this._inputFocusIndicator.style.height = `${this.inputCellEditorHeight}px`;
                this._inputCellContainer.style.top = `${this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight}px`;
                this._inputCellContainer.style.width = `${this._lastLayoutDimensions.dimension.width}px`;
            }
            await super.setInput(input, options, context, token);
            const model = await input.resolve();
            if (this._runbuttonToolbar) {
                this._runbuttonToolbar.context = input.resource;
            }
            if (model === null) {
                throw new Error('The Interactive Window model could not be resolved');
            }
            this._notebookWidget.value?.setParentContextKeyService(this._contextKeyService);
            const viewState = options?.viewState ?? this._loadNotebookEditorViewState(input);
            await this._extensionService.whenInstalledExtensionsRegistered();
            await this._notebookWidget.value.setModel(model.notebook, viewState?.notebook);
            model.notebook.setCellCollapseDefault(this._notebookOptions.getCellCollapseDefault());
            this._notebookWidget.value.setOptions({
                isReadOnly: true
            });
            this._widgetDisposableStore.add(this._notebookWidget.value.onDidResizeOutput((cvm) => {
                this._scrollIfNecessary(cvm);
            }));
            this._widgetDisposableStore.add(this._notebookWidget.value.onDidFocusWidget(() => this._onDidFocusWidget.fire()));
            this._widgetDisposableStore.add(this._notebookOptions.onDidChangeOptions(e => {
                if (e.compactView || e.focusIndicator) {
                    // update the styling
                    this._styleElement?.remove();
                    this._createLayoutStyles();
                }
                if (this._lastLayoutDimensions && this.isVisible()) {
                    this.layout(this._lastLayoutDimensions.dimension, this._lastLayoutDimensions.position);
                }
                if (e.interactiveWindowCollapseCodeCells) {
                    model.notebook.setCellCollapseDefault(this._notebookOptions.getCellCollapseDefault());
                }
            }));
            const languageId = this._notebookWidget.value?.activeKernel?.supportedLanguages[0] ?? input.language ?? modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
            const editorModel = await input.resolveInput(languageId);
            editorModel.setLanguage(languageId);
            this._codeEditorWidget.setModel(editorModel);
            if (viewState?.input) {
                this._codeEditorWidget.restoreViewState(viewState.input);
            }
            this._editorOptions = this._computeEditorOptions();
            this._codeEditorWidget.updateOptions(this._editorOptions);
            this._widgetDisposableStore.add(this._codeEditorWidget.onDidFocusEditorWidget(() => this._onDidFocusWidget.fire()));
            this._widgetDisposableStore.add(this._codeEditorWidget.onDidContentSizeChange(e => {
                if (!e.contentHeightChanged) {
                    return;
                }
                if (this._lastLayoutDimensions) {
                    this._layoutWidgets(this._lastLayoutDimensions.dimension, this._lastLayoutDimensions.position);
                }
            }));
            this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeCursorPosition(e => this._onDidChangeSelection.fire({ reason: this._toEditorPaneSelectionChangeReason(e) })));
            this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeModelContent(() => this._onDidChangeSelection.fire({ reason: 3 /* EditorPaneSelectionChangeReason.EDIT */ })));
            this._widgetDisposableStore.add(this._notebookKernelService.onDidChangeNotebookAffinity(this._syncWithKernel, this));
            this._widgetDisposableStore.add(this._notebookKernelService.onDidChangeSelectedNotebooks(this._syncWithKernel, this));
            this._widgetDisposableStore.add(this.themeService.onDidColorThemeChange(() => {
                if (this.isVisible()) {
                    this._updateInputDecoration();
                }
            }));
            this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeModelContent(() => {
                if (this.isVisible()) {
                    this._updateInputDecoration();
                }
            }));
            const cursorAtBoundaryContext = interactiveCommon_1.INTERACTIVE_INPUT_CURSOR_BOUNDARY.bindTo(this._contextKeyService);
            if (input.resource && input.historyService.has(input.resource)) {
                cursorAtBoundaryContext.set('top');
            }
            else {
                cursorAtBoundaryContext.set('none');
            }
            this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeCursorPosition(({ position }) => {
                const viewModel = this._codeEditorWidget._getViewModel();
                const lastLineNumber = viewModel.getLineCount();
                const lastLineCol = viewModel.getLineContent(lastLineNumber).length + 1;
                const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
                const firstLine = viewPosition.lineNumber === 1 && viewPosition.column === 1;
                const lastLine = viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol;
                if (firstLine) {
                    if (lastLine) {
                        cursorAtBoundaryContext.set('both');
                    }
                    else {
                        cursorAtBoundaryContext.set('top');
                    }
                }
                else {
                    if (lastLine) {
                        cursorAtBoundaryContext.set('bottom');
                    }
                    else {
                        cursorAtBoundaryContext.set('none');
                    }
                }
            }));
            this._widgetDisposableStore.add(editorModel.onDidChangeContent(() => {
                const value = editorModel.getValue();
                if (this.input?.resource && value !== '') {
                    this.input.historyService.replaceLast(this.input.resource, value);
                }
            }));
            this._syncWithKernel();
        }
        setOptions(options) {
            this._notebookWidget.value?.setOptions(options);
            super.setOptions(options);
        }
        _toEditorPaneSelectionChangeReason(e) {
            switch (e.source) {
                case "api" /* TextEditorSelectionSource.PROGRAMMATIC */: return 1 /* EditorPaneSelectionChangeReason.PROGRAMMATIC */;
                case "code.navigation" /* TextEditorSelectionSource.NAVIGATION */: return 4 /* EditorPaneSelectionChangeReason.NAVIGATION */;
                case "code.jump" /* TextEditorSelectionSource.JUMP */: return 5 /* EditorPaneSelectionChangeReason.JUMP */;
                default: return 2 /* EditorPaneSelectionChangeReason.USER */;
            }
        }
        _cellAtBottom(cell) {
            const visibleRanges = this._notebookWidget.value?.visibleRanges || [];
            const cellIndex = this._notebookWidget.value?.getCellIndex(cell);
            if (cellIndex === Math.max(...visibleRanges.map(range => range.end - 1))) {
                return true;
            }
            return false;
        }
        _scrollIfNecessary(cvm) {
            const index = this._notebookWidget.value.getCellIndex(cvm);
            if (index === this._notebookWidget.value.getLength() - 1) {
                // If we're already at the bottom or auto scroll is enabled, scroll to the bottom
                if (this._configurationService.getValue(interactiveCommon_1.InteractiveWindowSetting.interactiveWindowAlwaysScrollOnNewCell) || this._cellAtBottom(cvm)) {
                    this._notebookWidget.value.scrollToBottom();
                }
            }
        }
        _syncWithKernel() {
            const notebook = this._notebookWidget.value?.textModel;
            const textModel = this._codeEditorWidget.getModel();
            if (notebook && textModel) {
                const info = this._notebookKernelService.getMatchingKernel(notebook);
                const selectedOrSuggested = info.selected
                    ?? (info.suggestions.length === 1 ? info.suggestions[0] : undefined)
                    ?? (info.all.length === 1 ? info.all[0] : undefined);
                if (selectedOrSuggested) {
                    const language = selectedOrSuggested.supportedLanguages[0];
                    // All kernels will initially list plaintext as the supported language before they properly initialized.
                    if (language && language !== 'plaintext') {
                        const newMode = this._languageService.createById(language).languageId;
                        textModel.setLanguage(newMode);
                    }
                    notebookContextKeys_1.NOTEBOOK_KERNEL.bindTo(this._contextKeyService).set(selectedOrSuggested.id);
                }
            }
            this._updateInputDecoration();
        }
        layout(dimension, position) {
            this._rootElement.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
            this._rootElement.classList.toggle('narrow-width', dimension.width < 600);
            const editorHeightChanged = dimension.height !== this._lastLayoutDimensions?.dimension.height;
            this._lastLayoutDimensions = { dimension, position };
            if (!this._notebookWidget.value) {
                return;
            }
            if (editorHeightChanged && this._codeEditorWidget) {
                suggestController_1.SuggestController.get(this._codeEditorWidget)?.cancelSuggestWidget();
            }
            this._notebookEditorContainer.style.height = `${this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight}px`;
            this._layoutWidgets(dimension, position);
        }
        _layoutWidgets(dimension, position) {
            const contentHeight = this._codeEditorWidget.hasModel() ? this._codeEditorWidget.getContentHeight() : this.inputCellEditorHeight;
            const maxHeight = Math.min(dimension.height / 2, contentHeight);
            const { codeCellLeftMargin, cellRunGutter } = this._notebookOptions.getLayoutConfiguration();
            const leftMargin = codeCellLeftMargin + cellRunGutter;
            const inputCellContainerHeight = maxHeight + INPUT_CELL_VERTICAL_PADDING * 2;
            this._notebookEditorContainer.style.height = `${dimension.height - inputCellContainerHeight}px`;
            this._notebookWidget.value.layout(dimension.with(dimension.width, dimension.height - inputCellContainerHeight), this._notebookEditorContainer, position);
            this._codeEditorWidget.layout(this._validateDimension(dimension.width - leftMargin - INPUT_CELL_HORIZONTAL_PADDING_RIGHT, maxHeight));
            this._inputFocusIndicator.style.height = `${contentHeight}px`;
            this._inputCellContainer.style.top = `${dimension.height - inputCellContainerHeight}px`;
            this._inputCellContainer.style.width = `${dimension.width}px`;
        }
        _validateDimension(width, height) {
            return new DOM.Dimension(Math.max(0, width), Math.max(0, height));
        }
        _updateInputDecoration() {
            if (!this._codeEditorWidget) {
                return;
            }
            if (!this._codeEditorWidget.hasModel()) {
                return;
            }
            const model = this._codeEditorWidget.getModel();
            const decorations = [];
            if (model?.getValueLength() === 0) {
                const transparentForeground = (0, colorRegistry_1.resolveColorValue)(colorRegistry_1.editorForeground, this.themeService.getColorTheme())?.transparent(0.4);
                const languageId = model.getLanguageId();
                const keybinding = this._keybindingService.lookupKeybinding('interactive.execute', this._contextKeyService)?.getLabel();
                const text = nls.localize('interactiveInputPlaceHolder', "Type '{0}' code here and press {1} to run", languageId, keybinding ?? 'ctrl+enter');
                decorations.push({
                    range: {
                        startLineNumber: 0,
                        endLineNumber: 0,
                        startColumn: 0,
                        endColumn: 1
                    },
                    renderOptions: {
                        after: {
                            contentText: text,
                            color: transparentForeground ? transparentForeground.toString() : undefined
                        }
                    }
                });
            }
            this._codeEditorWidget.setDecorationsByType('interactive-decoration', DECORATION_KEY, decorations);
        }
        focus() {
            this._notebookWidget.value?.onShow();
            this._codeEditorWidget.focus();
        }
        focusHistory() {
            this._notebookWidget.value.focus();
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
            if (group) {
                this._groupListener.clear();
                this._groupListener.add(group.onWillCloseEditor(e => this._saveEditorViewState(e.editor)));
            }
            if (!visible) {
                this._saveEditorViewState(this.input);
                if (this.input && this._notebookWidget.value) {
                    this._notebookWidget.value.onWillHide();
                }
            }
        }
        clearInput() {
            if (this._notebookWidget.value) {
                this._saveEditorViewState(this.input);
                this._notebookWidget.value.onWillHide();
            }
            this._codeEditorWidget?.dispose();
            this._notebookWidget = { value: undefined };
            this._widgetDisposableStore.clear();
            super.clearInput();
        }
        getControl() {
            return {
                notebookEditor: this._notebookWidget.value,
                codeEditor: this._codeEditorWidget
            };
        }
    };
    exports.InteractiveEditor = InteractiveEditor;
    exports.InteractiveEditor = InteractiveEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, notebookEditorService_1.INotebookEditorService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, codeEditorService_1.ICodeEditorService),
        __param(7, notebookKernelService_1.INotebookKernelService),
        __param(8, language_1.ILanguageService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, actions_1.IMenuService),
        __param(12, contextView_1.IContextMenuService),
        __param(13, editorGroupsService_1.IEditorGroupsService),
        __param(14, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(15, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(16, extensions_1.IExtensionService)
    ], InteractiveEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3RpdmVFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9pbnRlcmFjdGl2ZS9icm93c2VyL2ludGVyYWN0aXZlRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQStEaEcsTUFBTSxjQUFjLEdBQUcsNEJBQTRCLENBQUM7SUFDcEQsTUFBTSw0Q0FBNEMsR0FBRyw0QkFBNEIsQ0FBQztJQUVsRixNQUFNLDJCQUEyQixHQUFHLENBQUMsQ0FBQztJQUN0QyxNQUFNLG1DQUFtQyxHQUFHLEVBQUUsQ0FBQztJQUMvQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsQ0FBQztJQVd4QixJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLHVCQUFVO1FBK0JoRCxJQUFhLFVBQVUsS0FBa0IsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUkvRSxZQUNvQixnQkFBbUMsRUFDdkMsWUFBMkIsRUFDekIsY0FBK0IsRUFDekIsb0JBQTJDLEVBQzFDLHFCQUE2QyxFQUNqRCxpQkFBcUMsRUFDckMsaUJBQXFDLEVBQ2pDLHFCQUE2QyxFQUNuRCxlQUFpQyxFQUMvQixpQkFBcUMsRUFDbEMsb0JBQTJDLEVBQ3BELFdBQXlCLEVBQ2xCLGtCQUF1QyxFQUN0QyxrQkFBd0MsRUFDM0IsZ0NBQW1FLEVBQ3RFLDZCQUE2RCxFQUMxRSxnQkFBbUM7WUFFdEQsS0FBSyxDQUNKLDZDQUE0QixFQUM1QixnQkFBZ0IsRUFDaEIsWUFBWSxFQUNaLGNBQWMsQ0FDZCxDQUFDO1lBdkRLLG9CQUFlLEdBQXVDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBa0IzRSwyQkFBc0IsR0FBb0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxD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