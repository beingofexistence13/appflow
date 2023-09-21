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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/common/languages/language", "vs/editor/common/languages/textToHtmlTokenizer", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions", "vs/workbench/contrib/notebook/browser/view/cellParts/cellOutput", "vs/workbench/contrib/notebook/browser/view/cellParts/codeCellExecutionIcon", "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/editor/contrib/wordHighlighter/browser/wordHighlighter", "vs/editor/contrib/codeAction/browser/codeActionController"], function (require, exports, DOM, async_1, cancellation_1, codicons_1, themables_1, event_1, lifecycle_1, strings, language_1, textToHtmlTokenizer_1, nls_1, configuration_1, instantiation_1, keybinding_1, opener_1, notebookBrowser_1, cellEditorOptions_1, cellOutput_1, codeCellExecutionIcon_1, codeCellViewModel_1, notebookExecutionStateService_1, wordHighlighter_1, codeActionController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeCell = void 0;
    let CodeCell = class CodeCell extends lifecycle_1.Disposable {
        constructor(notebookEditor, viewCell, templateData, instantiationService, keybindingService, openerService, languageService, configurationService, notebookExecutionStateService) {
            super();
            this.notebookEditor = notebookEditor;
            this.viewCell = viewCell;
            this.templateData = templateData;
            this.instantiationService = instantiationService;
            this.keybindingService = keybindingService;
            this.languageService = languageService;
            this.configurationService = configurationService;
            this._isDisposed = false;
            const cellEditorOptions = this._register(new cellEditorOptions_1.CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(viewCell.language), this.notebookEditor.notebookOptions, this.configurationService));
            this._outputContainerRenderer = this.instantiationService.createInstance(cellOutput_1.CellOutputContainer, notebookEditor, viewCell, templateData, { limit: codeCellViewModel_1.outputDisplayLimit });
            this.cellParts = this._register(templateData.cellParts.concatContentPart([cellEditorOptions, this._outputContainerRenderer]));
            // this.viewCell.layoutInfo.editorHeight or estimation when this.viewCell.layoutInfo.editorHeight === 0
            const editorHeight = this.calculateInitEditorHeight();
            this.initializeEditor(editorHeight);
            this._renderedInputCollapseState = false; // editor is always expanded initially
            this.registerViewCellLayoutChange();
            this.registerCellEditorEventListeners();
            this.registerDecorations();
            this.registerMouseListener();
            this._register(event_1.Event.any(this.viewCell.onDidStartExecution, this.viewCell.onDidStopExecution)((e) => {
                this.cellParts.updateForExecutionState(this.viewCell, e);
            }));
            this._register(this.viewCell.onDidChangeState(e => {
                this.cellParts.updateState(this.viewCell, e);
                if (e.outputIsHoveredChanged) {
                    this.updateForOutputHover();
                }
                if (e.outputIsFocusedChanged) {
                    this.updateForOutputFocus();
                }
                if (e.metadataChanged || e.internalMetadataChanged) {
                    this.updateEditorOptions();
                }
                if (e.inputCollapsedChanged || e.outputCollapsedChanged) {
                    this.viewCell.pauseLayout();
                    const updated = this.updateForCollapseState();
                    this.viewCell.resumeLayout();
                    if (updated) {
                        this.relayoutCell();
                    }
                }
                if (e.focusModeChanged) {
                    this.updateEditorForFocusModeChange();
                }
            }));
            this.cellParts.scheduleRenderCell(this.viewCell);
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.cellParts.unrenderCell(this.viewCell);
            }));
            this.updateEditorOptions();
            this.updateEditorForFocusModeChange();
            this.updateForOutputHover();
            this.updateForOutputFocus();
            // Render Outputs
            this.viewCell.editorHeight = editorHeight;
            this._outputContainerRenderer.render();
            this._renderedOutputCollapseState = false; // the output is always rendered initially
            // Need to do this after the intial renderOutput
            this.initialViewUpdateExpanded();
            this._register(this.viewCell.onLayoutInfoRead(() => {
                this.cellParts.prepareLayout();
            }));
            const executionItemElement = DOM.append(this.templateData.cellInputCollapsedContainer, DOM.$('.collapsed-execution-icon'));
            this._register((0, lifecycle_1.toDisposable)(() => {
                executionItemElement.parentElement?.removeChild(executionItemElement);
            }));
            this._collapsedExecutionIcon = this._register(this.instantiationService.createInstance(codeCellExecutionIcon_1.CollapsedCodeCellExecutionIcon, this.notebookEditor, this.viewCell, executionItemElement));
            this.updateForCollapseState();
            this._register(event_1.Event.runAndSubscribe(viewCell.onDidChangeOutputs, this.updateForOutputs.bind(this)));
            this._register(event_1.Event.runAndSubscribe(viewCell.onDidChangeLayout, this.updateForLayout.bind(this)));
            cellEditorOptions.setLineNumbers(this.viewCell.lineNumbers);
            this._register(cellEditorOptions.onDidChange(() => templateData.editor.updateOptions(cellEditorOptions.getUpdatedValue(this.viewCell.internalMetadata, this.viewCell.uri))));
            templateData.editor.updateOptions(cellEditorOptions.getUpdatedValue(this.viewCell.internalMetadata, this.viewCell.uri));
        }
        updateForLayout() {
            this._pendingLayout?.dispose();
            this._pendingLayout = DOM.modify(() => {
                this.cellParts.updateInternalLayoutNow(this.viewCell);
            });
        }
        updateForOutputHover() {
            this.templateData.container.classList.toggle('cell-output-hover', this.viewCell.outputIsHovered);
        }
        updateForOutputFocus() {
            this.templateData.container.classList.toggle('cell-output-focus', this.viewCell.outputIsFocused);
        }
        calculateInitEditorHeight() {
            const lineNum = this.viewCell.lineCount;
            const lineHeight = this.viewCell.layoutInfo.fontInfo?.lineHeight || 17;
            const editorPadding = this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri);
            const editorHeight = this.viewCell.layoutInfo.editorHeight === 0
                ? lineNum * lineHeight + editorPadding.top + editorPadding.bottom
                : this.viewCell.layoutInfo.editorHeight;
            return editorHeight;
        }
        initializeEditor(initEditorHeight) {
            const width = this.viewCell.layoutInfo.editorWidth;
            this.layoutEditor({
                width: width,
                height: initEditorHeight
            });
            const cts = new cancellation_1.CancellationTokenSource();
            this._register({ dispose() { cts.dispose(true); } });
            (0, async_1.raceCancellation)(this.viewCell.resolveTextModel(), cts.token).then(model => {
                if (this._isDisposed) {
                    return;
                }
                if (model && this.templateData.editor) {
                    this._reigsterModelListeners(model);
                    this.templateData.editor.setModel(model);
                    this.viewCell.attachTextEditor(this.templateData.editor, this.viewCell.layoutInfo.estimatedHasHorizontalScrolling);
                    const focusEditorIfNeeded = () => {
                        if (this.notebookEditor.getActiveCell() === this.viewCell &&
                            this.viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor &&
                            (this.notebookEditor.hasEditorFocus() || document.activeElement === document.body)) // Don't steal focus from other workbench parts, but if body has focus, we can take it
                         {
                            this.templateData.editor?.focus();
                        }
                    };
                    focusEditorIfNeeded();
                    const realContentHeight = this.templateData.editor?.getContentHeight();
                    if (realContentHeight !== undefined && realContentHeight !== initEditorHeight) {
                        this.onCellEditorHeightChange(realContentHeight);
                    }
                    focusEditorIfNeeded();
                }
            });
        }
        updateForOutputs() {
            DOM.setVisibility(this.viewCell.outputsViewModels.length > 0, this.templateData.focusSinkElement);
        }
        updateEditorOptions() {
            const editor = this.templateData.editor;
            if (!editor) {
                return;
            }
            const isReadonly = this.notebookEditor.isReadOnly;
            const padding = this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri);
            const options = editor.getOptions();
            if (options.get(90 /* EditorOption.readOnly */) !== isReadonly || options.get(83 /* EditorOption.padding */) !== padding) {
                editor.updateOptions({ readOnly: this.notebookEditor.isReadOnly, padding: this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri) });
            }
        }
        registerViewCellLayoutChange() {
            this._register(this.viewCell.onDidChangeLayout((e) => {
                if (e.outerWidth !== undefined) {
                    const layoutInfo = this.templateData.editor.getLayoutInfo();
                    if (layoutInfo.width !== this.viewCell.layoutInfo.editorWidth) {
                        this.onCellWidthChange();
                    }
                }
            }));
        }
        registerCellEditorEventListeners() {
            this._register(this.templateData.editor.onDidContentSizeChange((e) => {
                if (e.contentHeightChanged) {
                    if (this.viewCell.layoutInfo.editorHeight !== e.contentHeight) {
                        this.onCellEditorHeightChange(e.contentHeight);
                    }
                }
            }));
            this._register(this.templateData.editor.onDidChangeCursorSelection((e) => {
                if (e.source === 'restoreState' || e.oldModelVersionId === 0) {
                    // do not reveal the cell into view if this selection change was caused by restoring editors...
                    return;
                }
                const selections = this.templateData.editor.getSelections();
                if (selections?.length) {
                    const contentHeight = this.templateData.editor.getContentHeight();
                    const layoutContentHeight = this.viewCell.layoutInfo.editorHeight;
                    if (contentHeight !== layoutContentHeight) {
                        this.onCellEditorHeightChange(contentHeight);
                    }
                    const lastSelection = selections[selections.length - 1];
                    this.notebookEditor.revealRangeInViewAsync(this.viewCell, lastSelection);
                }
            }));
            this._register(this.templateData.editor.onDidBlurEditorWidget(() => {
                wordHighlighter_1.WordHighlighterContribution.get(this.templateData.editor)?.stopHighlighting();
                codeActionController_1.CodeActionController.get(this.templateData.editor)?.hideCodeActions();
                codeActionController_1.CodeActionController.get(this.templateData.editor)?.hideLightBulbWidget();
            }));
            this._register(this.templateData.editor.onDidFocusEditorWidget(() => {
                wordHighlighter_1.WordHighlighterContribution.get(this.templateData.editor)?.restoreViewState(true);
            }));
        }
        _reigsterModelListeners(model) {
            this._register(model.onDidChangeTokens(() => {
                if (this.viewCell.isInputCollapsed && this._inputCollapseElement) {
                    // flush the collapsed input with the latest tokens
                    const content = this._getRichTextFromLineTokens(model);
                    DOM.safeInnerHtml(this._inputCollapseElement, content);
                    this._attachInputExpandButton(this._inputCollapseElement);
                }
            }));
        }
        registerDecorations() {
            // Apply decorations
            this._register(this.viewCell.onCellDecorationsChanged((e) => {
                e.added.forEach(options => {
                    if (options.className) {
                        this.templateData.rootContainer.classList.add(options.className);
                    }
                    if (options.outputClassName) {
                        this.notebookEditor.deltaCellContainerClassNames(this.viewCell.id, [options.outputClassName], []);
                    }
                });
                e.removed.forEach(options => {
                    if (options.className) {
                        this.templateData.rootContainer.classList.remove(options.className);
                    }
                    if (options.outputClassName) {
                        this.notebookEditor.deltaCellContainerClassNames(this.viewCell.id, [], [options.outputClassName]);
                    }
                });
            }));
            this.viewCell.getCellDecorations().forEach(options => {
                if (options.className) {
                    this.templateData.rootContainer.classList.add(options.className);
                }
                if (options.outputClassName) {
                    this.notebookEditor.deltaCellContainerClassNames(this.viewCell.id, [options.outputClassName], []);
                }
            });
        }
        registerMouseListener() {
            this._register(this.templateData.editor.onMouseDown(e => {
                // prevent default on right mouse click, otherwise it will trigger unexpected focus changes
                // the catch is, it means we don't allow customization of right button mouse down handlers other than the built in ones.
                if (e.event.rightButton) {
                    e.event.preventDefault();
                }
            }));
        }
        shouldUpdateDOMFocus() {
            // The DOM focus needs to be adjusted:
            // when a cell editor should be focused
            // the document active element is inside the notebook editor or the document body (cell editor being disposed previously)
            return this.notebookEditor.getActiveCell() === this.viewCell
                && this.viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor
                && (this.notebookEditor.hasEditorFocus() || document.activeElement === document.body);
        }
        updateEditorForFocusModeChange() {
            if (this.shouldUpdateDOMFocus()) {
                this.templateData.editor?.focus();
            }
            this.templateData.container.classList.toggle('cell-editor-focus', this.viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor);
            this.templateData.container.classList.toggle('cell-output-focus', this.viewCell.focusMode === notebookBrowser_1.CellFocusMode.Output);
        }
        updateForCollapseState() {
            if (this.viewCell.isOutputCollapsed === this._renderedOutputCollapseState &&
                this.viewCell.isInputCollapsed === this._renderedInputCollapseState) {
                return false;
            }
            this.viewCell.layoutChange({ editorHeight: true });
            if (this.viewCell.isInputCollapsed) {
                this._collapseInput();
            }
            else {
                this._showInput();
            }
            if (this.viewCell.isOutputCollapsed) {
                this._collapseOutput();
            }
            else {
                this._showOutput(false);
            }
            this.relayoutCell();
            this._renderedOutputCollapseState = this.viewCell.isOutputCollapsed;
            this._renderedInputCollapseState = this.viewCell.isInputCollapsed;
            return true;
        }
        _collapseInput() {
            // hide the editor and execution label, keep the run button
            DOM.hide(this.templateData.editorPart);
            this.templateData.container.classList.toggle('input-collapsed', true);
            // remove input preview
            this._removeInputCollapsePreview();
            this._collapsedExecutionIcon.setVisibility(true);
            // update preview
            const richEditorText = this.templateData.editor.hasModel() ? this._getRichTextFromLineTokens(this.templateData.editor.getModel()) : this._getRichText(this.viewCell.textBuffer, this.viewCell.language);
            const element = DOM.$('div.cell-collapse-preview');
            DOM.safeInnerHtml(element, richEditorText);
            this._inputCollapseElement = element;
            this.templateData.cellInputCollapsedContainer.appendChild(element);
            this._attachInputExpandButton(element);
            DOM.show(this.templateData.cellInputCollapsedContainer);
        }
        _attachInputExpandButton(element) {
            const expandIcon = DOM.$('span.expandInputIcon');
            const keybinding = this.keybindingService.lookupKeybinding(notebookBrowser_1.EXPAND_CELL_INPUT_COMMAND_ID);
            if (keybinding) {
                element.title = (0, nls_1.localize)('cellExpandInputButtonLabelWithDoubleClick', "Double-click to expand cell input ({0})", keybinding.getLabel());
                expandIcon.title = (0, nls_1.localize)('cellExpandInputButtonLabel', "Expand Cell Input ({0})", keybinding.getLabel());
            }
            expandIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.more));
            element.appendChild(expandIcon);
        }
        _showInput() {
            this._collapsedExecutionIcon.setVisibility(false);
            DOM.show(this.templateData.editorPart);
            DOM.hide(this.templateData.cellInputCollapsedContainer);
        }
        _getRichText(buffer, language) {
            return (0, textToHtmlTokenizer_1.tokenizeToStringSync)(this.languageService, buffer.getLineContent(1), language);
        }
        _getRichTextFromLineTokens(model) {
            let result = `<div class="monaco-tokenized-source">`;
            const firstLineTokens = model.tokenization.getLineTokens(1);
            const viewLineTokens = firstLineTokens.inflate();
            const line = model.getLineContent(1);
            let startOffset = 0;
            for (let j = 0, lenJ = viewLineTokens.getCount(); j < lenJ; j++) {
                const type = viewLineTokens.getClassName(j);
                const endIndex = viewLineTokens.getEndOffset(j);
                result += `<span class="${type}">${strings.escape(line.substring(startOffset, endIndex))}</span>`;
                startOffset = endIndex;
            }
            result += `</div>`;
            return result;
        }
        _removeInputCollapsePreview() {
            const children = this.templateData.cellInputCollapsedContainer.children;
            const elements = [];
            for (let i = 0; i < children.length; i++) {
                if (children[i].classList.contains('cell-collapse-preview')) {
                    elements.push(children[i]);
                }
            }
            elements.forEach(element => {
                element.parentElement?.removeChild(element);
            });
        }
        _updateOutputInnerContainer(hide) {
            const children = this.templateData.outputContainer.domNode.children;
            for (let i = 0; i < children.length; i++) {
                if (children[i].classList.contains('output-inner-container')) {
                    DOM.setVisibility(!hide, children[i]);
                }
            }
        }
        _collapseOutput() {
            this.templateData.container.classList.toggle('output-collapsed', true);
            DOM.show(this.templateData.cellOutputCollapsedContainer);
            this._updateOutputInnerContainer(true);
            this._outputContainerRenderer.viewUpdateHideOuputs();
        }
        _showOutput(initRendering) {
            this.templateData.container.classList.toggle('output-collapsed', false);
            DOM.hide(this.templateData.cellOutputCollapsedContainer);
            this._updateOutputInnerContainer(false);
            this._outputContainerRenderer.viewUpdateShowOutputs(initRendering);
        }
        initialViewUpdateExpanded() {
            this.templateData.container.classList.toggle('input-collapsed', false);
            DOM.show(this.templateData.editorPart);
            DOM.hide(this.templateData.cellInputCollapsedContainer);
            this.templateData.container.classList.toggle('output-collapsed', false);
            this._showOutput(true);
        }
        layoutEditor(dimension) {
            this.templateData.editor?.layout(dimension);
        }
        onCellWidthChange() {
            if (!this.templateData.editor.hasModel()) {
                return;
            }
            const realContentHeight = this.templateData.editor.getContentHeight();
            this.viewCell.editorHeight = realContentHeight;
            this.relayoutCell();
            this.layoutEditor({
                width: this.viewCell.layoutInfo.editorWidth,
                height: realContentHeight
            });
        }
        onCellEditorHeightChange(newHeight) {
            const viewLayout = this.templateData.editor.getLayoutInfo();
            this.viewCell.editorHeight = newHeight;
            this.relayoutCell();
            this.layoutEditor({
                width: viewLayout.width,
                height: newHeight
            });
        }
        relayoutCell() {
            this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
        }
        dispose() {
            this._isDisposed = true;
            // move focus back to the cell list otherwise the focus goes to body
            if (this.shouldUpdateDOMFocus()) {
                this.notebookEditor.focusContainer();
            }
            this.viewCell.detachTextEditor();
            this._removeInputCollapsePreview();
            this._outputContainerRenderer.dispose();
            this._pendingLayout?.dispose();
            super.dispose();
        }
    };
    exports.CodeCell = CodeCell;
    exports.CodeCell = CodeCell = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, opener_1.IOpenerService),
        __param(6, language_1.ILanguageService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], CodeCell);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUNlbGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvY2VsbFBhcnRzL2NvZGVDZWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQStCekYsSUFBTSxRQUFRLEdBQWQsTUFBTSxRQUFTLFNBQVEsc0JBQVU7UUFXdkMsWUFDa0IsY0FBNkMsRUFDN0MsUUFBMkIsRUFDM0IsWUFBb0MsRUFDOUIsb0JBQTRELEVBQy9ELGlCQUFzRCxFQUMxRCxhQUE2QixFQUMzQixlQUFrRCxFQUM3QyxvQkFBbUQsRUFDMUMsNkJBQTZEO1lBRTdGLEtBQUssRUFBRSxDQUFDO1lBVlMsbUJBQWMsR0FBZCxjQUFjLENBQStCO1lBQzdDLGFBQVEsR0FBUixRQUFRLENBQW1CO1lBQzNCLGlCQUFZLEdBQVosWUFBWSxDQUF3QjtZQUNiLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDOUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUV2QyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDckMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQWJuRSxnQkFBVyxHQUFZLEtBQUssQ0FBQztZQWtCcEMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkscUNBQWlCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNqTSxJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxnQ0FBbUIsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLFlBQVks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