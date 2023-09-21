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
define(["require", "exports", "vs/nls!vs/workbench/contrib/interactive/browser/interactiveEditor", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/workbench/contrib/interactive/browser/interactiveEditorInput", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/language", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/interactive/browser/interactiveCommon", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/contextview/browser/contextView", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/editor/browser/editorExtensions", "vs/editor/contrib/parameterHints/browser/parameterHints", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/editor/contrib/suggest/browser/suggestController", "vs/editor/contrib/snippet/browser/snippetController2", "vs/workbench/contrib/snippets/browser/tabCompletion", "vs/editor/contrib/hover/browser/hover", "vs/editor/contrib/gotoError/browser/gotoError", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/services/extensions/common/extensions", "vs/base/common/resources", "vs/workbench/contrib/notebook/browser/contrib/find/notebookFindWidget", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/base/common/objects", "vs/css!./media/interactive", "vs/css!./interactiveEditor"], function (require, exports, nls, DOM, event_1, lifecycle_1, codeEditorService_1, codeEditorWidget_1, contextkey_1, instantiation_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, editorPane_1, simpleEditorOptions_1, interactiveEditorInput_1, notebookEditorExtensions_1, notebookEditorService_1, editorGroupsService_1, executionStatusBarItemController_1, notebookKernelService_1, modesRegistry_1, language_1, actions_1, keybinding_1, interactiveCommon_1, configuration_1, notebookOptions_1, toolbar_1, contextView_1, menuEntryActionViewItem_1, editorExtensions_1, parameterHints_1, menuPreventer_1, selectionClipboard_1, contextmenu_1, suggestController_1, snippetController2_1, tabCompletion_1, hover_1, gotoError_1, textResourceConfiguration_1, notebookExecutionStateService_1, notebookContextKeys_1, extensions_1, resources_1, notebookFindWidget_1, notebookCommon_1, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$KJb = void 0;
    const DECORATION_KEY = 'interactiveInputDecoration';
    const INTERACTIVE_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'InteractiveEditorViewState';
    const INPUT_CELL_VERTICAL_PADDING = 8;
    const INPUT_CELL_HORIZONTAL_PADDING_RIGHT = 10;
    const INPUT_EDITOR_PADDING = 8;
    let $KJb = class $KJb extends editorPane_1.$0T {
        get onDidFocus() { return this.vb.event; }
        constructor(telemetryService, themeService, storageService, instantiationService, notebookWidgetService, contextKeyService, codeEditorService, notebookKernelService, languageService, keybindingService, configurationService, menuService, contextMenuService, editorGroupService, textResourceConfigurationService, notebookExecutionStateService, extensionService) {
            super(notebookCommon_1.$VH, telemetryService, themeService, storageService);
            this.f = { value: undefined };
            this.ob = this.B(new lifecycle_1.$jc());
            this.tb = this.B(new lifecycle_1.$jc());
            this.vb = this.B(new event_1.$fd());
            this.wb = this.B(new event_1.$fd());
            this.onDidChangeSelection = this.wb.event;
            this.y = instantiationService;
            this.u = notebookWidgetService;
            this.fb = contextKeyService;
            this.gb = configurationService;
            this.hb = notebookKernelService;
            this.eb = languageService;
            this.ib = keybindingService;
            this.jb = menuService;
            this.kb = contextMenuService;
            this.lb = editorGroupService;
            this.mb = notebookExecutionStateService;
            this.nb = extensionService;
            this.qb = this.Cb();
            this.B(this.gb.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor') || e.affectsConfiguration('notebook')) {
                    this.qb = this.Cb();
                }
            }));
            this.rb = new notebookOptions_1.$Gbb(configurationService, notebookExecutionStateService, true, { cellToolbarInteraction: 'hover', globalToolbar: true, stickyScroll: false, dragAndDropEnabled: false });
            this.sb = this.cb(editorGroupService, textResourceConfigurationService, INTERACTIVE_EDITOR_VIEW_STATE_PREFERENCE_KEY);
            codeEditorService.registerDecorationType('interactive-decoration', DECORATION_KEY, {});
            this.B(this.ib.onDidUpdateKeybindings(this.Mb, this));
            this.B(this.mb.onDidChangeExecution((e) => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && (0, resources_1.$bg)(e.notebook, this.f.value?.viewModel?.notebookDocument.uri)) {
                    const cell = this.f.value?.getCellByHandle(e.cellHandle);
                    if (cell && e.changed?.state) {
                        this.Ib(cell);
                    }
                }
            }));
        }
        get xb() {
            return 19 + 2 + INPUT_CELL_VERTICAL_PADDING * 2 + INPUT_EDITOR_PADDING * 2;
        }
        get yb() {
            return 19 + INPUT_EDITOR_PADDING * 2;
        }
        ab(parent) {
            this.a = DOM.$0O(parent, DOM.$('.interactive-editor'));
            this.a.style.position = 'relative';
            this.c = DOM.$0O(this.a, DOM.$('.notebook-editor-container'));
            this.g = DOM.$0O(this.a, DOM.$('.input-cell-container'));
            this.g.style.position = 'absolute';
            this.g.style.height = `${this.xb}px`;
            this.j = DOM.$0O(this.g, DOM.$('.input-focus-indicator'));
            this.m = DOM.$0O(this.g, DOM.$('.run-button-container'));
            this.Ab(this.m);
            this.r = DOM.$0O(this.g, DOM.$('.input-editor-container'));
            this.Bb();
        }
        Ab(runButtonContainer) {
            const menu = this.B(this.jb.createMenu(actions_1.$Ru.InteractiveInputExecute, this.fb));
            this.ub = this.B(new toolbar_1.$6R(runButtonContainer, this.kb, {
                getKeyBinding: action => this.ib.lookupKeybinding(action.id),
                actionViewItemProvider: action => {
                    return (0, menuEntryActionViewItem_1.$F3)(this.y, action);
                },
                renderDropdownAsChildElement: true
            }));
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.$B3)(menu, { shouldForwardArgs: true }, result);
            this.ub.setActions([...primary, ...secondary]);
        }
        Bb() {
            this.b = DOM.$XO(this.a);
            const styleSheets = [];
            const { focusIndicator, codeCellLeftMargin, cellRunGutter } = this.rb.getLayoutConfiguration();
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
            this.b.textContent = styleSheets.join('\n');
        }
        Cb() {
            let overrideIdentifier = undefined;
            if (this.s) {
                overrideIdentifier = this.s.getModel()?.getLanguageId();
            }
            const editorOptions = (0, objects_1.$Vm)(this.gb.getValue('editor', { overrideIdentifier }));
            const editorOptionsOverride = (0, simpleEditorOptions_1.$uqb)(this.gb);
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
        G() {
            this.Eb(this.input);
            super.G();
        }
        getViewState() {
            const input = this.input;
            if (!(input instanceof interactiveEditorInput_1.$5ib)) {
                return undefined;
            }
            this.Eb(input);
            return this.Fb(input);
        }
        Eb(input) {
            if (this.group && this.f.value && input instanceof interactiveEditorInput_1.$5ib) {
                if (this.f.value.isDisposed) {
                    return;
                }
                const state = this.f.value.getEditorViewState();
                const editorState = this.s.saveViewState();
                this.sb.saveEditorState(this.group, input.notebookEditorInput.resource, {
                    notebook: state,
                    input: editorState
                });
            }
        }
        Fb(input) {
            let result;
            if (this.group) {
                result = this.sb.loadEditorState(this.group, input.notebookEditorInput.resource);
            }
            if (result) {
                return result;
            }
            // when we don't have a view state for the group/input-tuple then we try to use an existing
            // editor for the same resource.
            for (const group of this.lb.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
                if (group.activeEditorPane !== this && group.activeEditorPane === this && group.activeEditor?.matches(input)) {
                    const notebook = this.f.value?.getEditorViewState();
                    const input = this.s.saveViewState();
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
            this.f.value?.onWillHide();
            this.s?.dispose();
            this.ob.clear();
            this.f = this.y.invokeFunction(this.u.retrieveWidget, group, notebookInput, {
                isEmbedded: true,
                isReadOnly: true,
                contributions: notebookEditorExtensions_1.NotebookEditorExtensionsRegistry.getSomeEditorContributions([
                    executionStatusBarItemController_1.$AFb.id,
                    executionStatusBarItemController_1.$BFb.id,
                    notebookFindWidget_1.$nFb.id
                ]),
                menuIds: {
                    notebookToolbar: actions_1.$Ru.InteractiveToolbar,
                    cellTitleToolbar: actions_1.$Ru.InteractiveCellTitle,
                    cellDeleteToolbar: actions_1.$Ru.InteractiveCellDelete,
                    cellInsertToolbar: actions_1.$Ru.NotebookCellBetween,
                    cellTopInsertToolbar: actions_1.$Ru.NotebookCellListTop,
                    cellExecuteToolbar: actions_1.$Ru.InteractiveCellExecute,
                    cellExecutePrimary: undefined
                },
                cellEditorContributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    selectionClipboard_1.$tqb,
                    contextmenu_1.$X6.ID,
                    hover_1.$Q6.ID,
                    gotoError_1.$d5.ID
                ]),
                options: this.rb
            });
            this.s = this.y.createInstance(codeEditorWidget_1.$uY, this.r, this.qb, {
                ...{
                    isSimpleWidget: false,
                    contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                        menuPreventer_1.$0lb.ID,
                        selectionClipboard_1.$tqb,
                        contextmenu_1.$X6.ID,
                        suggestController_1.$G6.ID,
                        parameterHints_1.$n0.ID,
                        snippetController2_1.$05.ID,
                        tabCompletion_1.$qmb.ID,
                        hover_1.$Q6.ID,
                        gotoError_1.$d5.ID
                    ])
                }
            });
            if (this.pb) {
                this.c.style.height = `${this.pb.dimension.height - this.xb}px`;
                this.f.value.layout(new DOM.$BO(this.pb.dimension.width, this.pb.dimension.height - this.xb), this.c);
                const { codeCellLeftMargin, cellRunGutter } = this.rb.getLayoutConfiguration();
                const leftMargin = codeCellLeftMargin + cellRunGutter;
                const maxHeight = Math.min(this.pb.dimension.height / 2, this.yb);
                this.s.layout(this.Lb(this.pb.dimension.width - leftMargin - INPUT_CELL_HORIZONTAL_PADDING_RIGHT, maxHeight));
                this.j.style.height = `${this.yb}px`;
                this.g.style.top = `${this.pb.dimension.height - this.xb}px`;
                this.g.style.width = `${this.pb.dimension.width}px`;
            }
            await super.setInput(input, options, context, token);
            const model = await input.resolve();
            if (this.ub) {
                this.ub.context = input.resource;
            }
            if (model === null) {
                throw new Error('The Interactive Window model could not be resolved');
            }
            this.f.value?.setParentContextKeyService(this.fb);
            const viewState = options?.viewState ?? this.Fb(input);
            await this.nb.whenInstalledExtensionsRegistered();
            await this.f.value.setModel(model.notebook, viewState?.notebook);
            model.notebook.setCellCollapseDefault(this.rb.getCellCollapseDefault());
            this.f.value.setOptions({
                isReadOnly: true
            });
            this.ob.add(this.f.value.onDidResizeOutput((cvm) => {
                this.Ib(cvm);
            }));
            this.ob.add(this.f.value.onDidFocusWidget(() => this.vb.fire()));
            this.ob.add(this.rb.onDidChangeOptions(e => {
                if (e.compactView || e.focusIndicator) {
                    // update the styling
                    this.b?.remove();
                    this.Bb();
                }
                if (this.pb && this.isVisible()) {
                    this.layout(this.pb.dimension, this.pb.position);
                }
                if (e.interactiveWindowCollapseCodeCells) {
                    model.notebook.setCellCollapseDefault(this.rb.getCellCollapseDefault());
                }
            }));
            const languageId = this.f.value?.activeKernel?.supportedLanguages[0] ?? input.language ?? modesRegistry_1.$Yt;
            const editorModel = await input.resolveInput(languageId);
            editorModel.setLanguage(languageId);
            this.s.setModel(editorModel);
            if (viewState?.input) {
                this.s.restoreViewState(viewState.input);
            }
            this.qb = this.Cb();
            this.s.updateOptions(this.qb);
            this.ob.add(this.s.onDidFocusEditorWidget(() => this.vb.fire()));
            this.ob.add(this.s.onDidContentSizeChange(e => {
                if (!e.contentHeightChanged) {
                    return;
                }
                if (this.pb) {
                    this.Kb(this.pb.dimension, this.pb.position);
                }
            }));
            this.ob.add(this.s.onDidChangeCursorPosition(e => this.wb.fire({ reason: this.Gb(e) })));
            this.ob.add(this.s.onDidChangeModelContent(() => this.wb.fire({ reason: 3 /* EditorPaneSelectionChangeReason.EDIT */ })));
            this.ob.add(this.hb.onDidChangeNotebookAffinity(this.Jb, this));
            this.ob.add(this.hb.onDidChangeSelectedNotebooks(this.Jb, this));
            this.ob.add(this.n.onDidColorThemeChange(() => {
                if (this.isVisible()) {
                    this.Mb();
                }
            }));
            this.ob.add(this.s.onDidChangeModelContent(() => {
                if (this.isVisible()) {
                    this.Mb();
                }
            }));
            const cursorAtBoundaryContext = interactiveCommon_1.$IJb.bindTo(this.fb);
            if (input.resource && input.historyService.has(input.resource)) {
                cursorAtBoundaryContext.set('top');
            }
            else {
                cursorAtBoundaryContext.set('none');
            }
            this.ob.add(this.s.onDidChangeCursorPosition(({ position }) => {
                const viewModel = this.s._getViewModel();
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
            this.ob.add(editorModel.onDidChangeContent(() => {
                const value = editorModel.getValue();
                if (this.input?.resource && value !== '') {
                    this.input.historyService.replaceLast(this.input.resource, value);
                }
            }));
            this.Jb();
        }
        setOptions(options) {
            this.f.value?.setOptions(options);
            super.setOptions(options);
        }
        Gb(e) {
            switch (e.source) {
                case "api" /* TextEditorSelectionSource.PROGRAMMATIC */: return 1 /* EditorPaneSelectionChangeReason.PROGRAMMATIC */;
                case "code.navigation" /* TextEditorSelectionSource.NAVIGATION */: return 4 /* EditorPaneSelectionChangeReason.NAVIGATION */;
                case "code.jump" /* TextEditorSelectionSource.JUMP */: return 5 /* EditorPaneSelectionChangeReason.JUMP */;
                default: return 2 /* EditorPaneSelectionChangeReason.USER */;
            }
        }
        Hb(cell) {
            const visibleRanges = this.f.value?.visibleRanges || [];
            const cellIndex = this.f.value?.getCellIndex(cell);
            if (cellIndex === Math.max(...visibleRanges.map(range => range.end - 1))) {
                return true;
            }
            return false;
        }
        Ib(cvm) {
            const index = this.f.value.getCellIndex(cvm);
            if (index === this.f.value.getLength() - 1) {
                // If we're already at the bottom or auto scroll is enabled, scroll to the bottom
                if (this.gb.getValue(interactiveCommon_1.$JJb.interactiveWindowAlwaysScrollOnNewCell) || this.Hb(cvm)) {
                    this.f.value.scrollToBottom();
                }
            }
        }
        Jb() {
            const notebook = this.f.value?.textModel;
            const textModel = this.s.getModel();
            if (notebook && textModel) {
                const info = this.hb.getMatchingKernel(notebook);
                const selectedOrSuggested = info.selected
                    ?? (info.suggestions.length === 1 ? info.suggestions[0] : undefined)
                    ?? (info.all.length === 1 ? info.all[0] : undefined);
                if (selectedOrSuggested) {
                    const language = selectedOrSuggested.supportedLanguages[0];
                    // All kernels will initially list plaintext as the supported language before they properly initialized.
                    if (language && language !== 'plaintext') {
                        const newMode = this.eb.createById(language).languageId;
                        textModel.setLanguage(newMode);
                    }
                    notebookContextKeys_1.$lob.bindTo(this.fb).set(selectedOrSuggested.id);
                }
            }
            this.Mb();
        }
        layout(dimension, position) {
            this.a.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
            this.a.classList.toggle('narrow-width', dimension.width < 600);
            const editorHeightChanged = dimension.height !== this.pb?.dimension.height;
            this.pb = { dimension, position };
            if (!this.f.value) {
                return;
            }
            if (editorHeightChanged && this.s) {
                suggestController_1.$G6.get(this.s)?.cancelSuggestWidget();
            }
            this.c.style.height = `${this.pb.dimension.height - this.xb}px`;
            this.Kb(dimension, position);
        }
        Kb(dimension, position) {
            const contentHeight = this.s.hasModel() ? this.s.getContentHeight() : this.yb;
            const maxHeight = Math.min(dimension.height / 2, contentHeight);
            const { codeCellLeftMargin, cellRunGutter } = this.rb.getLayoutConfiguration();
            const leftMargin = codeCellLeftMargin + cellRunGutter;
            const inputCellContainerHeight = maxHeight + INPUT_CELL_VERTICAL_PADDING * 2;
            this.c.style.height = `${dimension.height - inputCellContainerHeight}px`;
            this.f.value.layout(dimension.with(dimension.width, dimension.height - inputCellContainerHeight), this.c, position);
            this.s.layout(this.Lb(dimension.width - leftMargin - INPUT_CELL_HORIZONTAL_PADDING_RIGHT, maxHeight));
            this.j.style.height = `${contentHeight}px`;
            this.g.style.top = `${dimension.height - inputCellContainerHeight}px`;
            this.g.style.width = `${dimension.width}px`;
        }
        Lb(width, height) {
            return new DOM.$BO(Math.max(0, width), Math.max(0, height));
        }
        Mb() {
            if (!this.s) {
                return;
            }
            if (!this.s.hasModel()) {
                return;
            }
            const model = this.s.getModel();
            const decorations = [];
            if (model?.getValueLength() === 0) {
                const transparentForeground = (0, colorRegistry_1.$5y)(colorRegistry_1.$xw, this.n.getColorTheme())?.transparent(0.4);
                const languageId = model.getLanguageId();
                const keybinding = this.ib.lookupKeybinding('interactive.execute', this.fb)?.getLabel();
                const text = nls.localize(0, null, languageId, keybinding ?? 'ctrl+enter');
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
            this.s.setDecorationsByType('interactive-decoration', DECORATION_KEY, decorations);
        }
        focus() {
            this.f.value?.onShow();
            this.s.focus();
        }
        focusHistory() {
            this.f.value.focus();
        }
        bb(visible, group) {
            super.bb(visible, group);
            if (group) {
                this.tb.clear();
                this.tb.add(group.onWillCloseEditor(e => this.Eb(e.editor)));
            }
            if (!visible) {
                this.Eb(this.input);
                if (this.input && this.f.value) {
                    this.f.value.onWillHide();
                }
            }
        }
        clearInput() {
            if (this.f.value) {
                this.Eb(this.input);
                this.f.value.onWillHide();
            }
            this.s?.dispose();
            this.f = { value: undefined };
            this.ob.clear();
            super.clearInput();
        }
        getControl() {
            return {
                notebookEditor: this.f.value,
                codeEditor: this.s
            };
        }
    };
    exports.$KJb = $KJb;
    exports.$KJb = $KJb = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, storage_1.$Vo),
        __param(3, instantiation_1.$Ah),
        __param(4, notebookEditorService_1.$1rb),
        __param(5, contextkey_1.$3i),
        __param(6, codeEditorService_1.$nV),
        __param(7, notebookKernelService_1.$Bbb),
        __param(8, language_1.$ct),
        __param(9, keybinding_1.$2D),
        __param(10, configuration_1.$8h),
        __param(11, actions_1.$Su),
        __param(12, contextView_1.$WZ),
        __param(13, editorGroupsService_1.$5C),
        __param(14, textResourceConfiguration_1.$FA),
        __param(15, notebookExecutionStateService_1.$_H),
        __param(16, extensions_1.$MF)
    ], $KJb);
});
//# sourceMappingURL=interactiveEditor.js.map