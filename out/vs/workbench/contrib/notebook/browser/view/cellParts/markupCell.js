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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/lifecycle", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/language", "vs/editor/common/languages/textToHtmlTokenizer", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions", "vs/editor/contrib/wordHighlighter/browser/wordHighlighter"], function (require, exports, DOM, iconLabels_1, async_1, cancellation_1, codicons_1, themables_1, lifecycle_1, codeEditorWidget_1, editorContextKeys_1, language_1, textToHtmlTokenizer_1, nls_1, accessibility_1, configuration_1, contextkey_1, instantiation_1, serviceCollection_1, keybinding_1, notebookBrowser_1, notebookIcons_1, cellEditorOptions_1, wordHighlighter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkupCell = void 0;
    let MarkupCell = class MarkupCell extends lifecycle_1.Disposable {
        constructor(notebookEditor, viewCell, templateData, renderedEditors, accessibilityService, contextKeyService, instantiationService, languageService, configurationService, keybindingService) {
            super();
            this.notebookEditor = notebookEditor;
            this.viewCell = viewCell;
            this.templateData = templateData;
            this.renderedEditors = renderedEditors;
            this.accessibilityService = accessibilityService;
            this.contextKeyService = contextKeyService;
            this.instantiationService = instantiationService;
            this.languageService = languageService;
            this.configurationService = configurationService;
            this.keybindingService = keybindingService;
            this.editor = null;
            this.localDisposables = this._register(new lifecycle_1.DisposableStore());
            this.focusSwitchDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.editorDisposables = this._register(new lifecycle_1.DisposableStore());
            this.constructDOM();
            this.editorPart = templateData.editorPart;
            this.cellEditorOptions = this._register(new cellEditorOptions_1.CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(viewCell.language), this.notebookEditor.notebookOptions, this.configurationService));
            this.cellEditorOptions.setLineNumbers(this.viewCell.lineNumbers);
            this.editorOptions = this.cellEditorOptions.getValue(this.viewCell.internalMetadata, this.viewCell.uri);
            this._register((0, lifecycle_1.toDisposable)(() => renderedEditors.delete(this.viewCell)));
            this.registerListeners();
            // update for init state
            this.templateData.cellParts.scheduleRenderCell(this.viewCell);
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.templateData.cellParts.unrenderCell(this.viewCell);
            }));
            this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => {
                this.viewUpdate();
            }));
            this.updateForHover();
            this.updateForFocusModeChange();
            this.foldingState = viewCell.foldingState;
            this.layoutFoldingIndicator();
            this.updateFoldingIconShowClass();
            // the markdown preview's height might already be updated after the renderer calls `element.getHeight()`
            if (this.viewCell.layoutInfo.totalHeight > 0) {
                this.relayoutCell();
            }
            this.applyDecorations();
            this.viewUpdate();
            this.layoutCellParts();
            this._register(this.viewCell.onDidChangeLayout(() => {
                this.layoutCellParts();
            }));
        }
        layoutCellParts() {
            this.templateData.cellParts.updateInternalLayoutNow(this.viewCell);
        }
        constructDOM() {
            // Create an element that is only used to announce markup cell content to screen readers
            const id = `aria-markup-cell-${this.viewCell.id}`;
            this.markdownAccessibilityContainer = this.templateData.cellContainer;
            this.markdownAccessibilityContainer.id = id;
            // Hide the element from non-screen readers
            this.markdownAccessibilityContainer.style.height = '1px';
            this.markdownAccessibilityContainer.style.overflow = 'hidden';
            this.markdownAccessibilityContainer.style.position = 'absolute';
            this.markdownAccessibilityContainer.style.top = '100000px';
            this.markdownAccessibilityContainer.style.left = '10000px';
            this.markdownAccessibilityContainer.ariaHidden = 'false';
            this.templateData.rootContainer.setAttribute('aria-describedby', id);
            this.templateData.container.classList.toggle('webview-backed-markdown-cell', true);
        }
        registerListeners() {
            this._register(this.viewCell.onDidChangeState(e => {
                this.templateData.cellParts.updateState(this.viewCell, e);
            }));
            this._register(this.viewCell.model.onDidChangeMetadata(() => {
                this.viewUpdate();
            }));
            this._register(this.viewCell.onDidChangeState((e) => {
                if (e.editStateChanged || e.contentChanged) {
                    this.viewUpdate();
                }
                if (e.focusModeChanged) {
                    this.updateForFocusModeChange();
                }
                if (e.foldingStateChanged) {
                    const foldingState = this.viewCell.foldingState;
                    if (foldingState !== this.foldingState) {
                        this.foldingState = foldingState;
                        this.layoutFoldingIndicator();
                    }
                }
                if (e.cellIsHoveredChanged) {
                    this.updateForHover();
                }
                if (e.inputCollapsedChanged) {
                    this.updateCollapsedState();
                    this.viewUpdate();
                }
                if (e.cellLineNumberChanged) {
                    this.cellEditorOptions.setLineNumbers(this.viewCell.lineNumbers);
                }
            }));
            this._register(this.notebookEditor.notebookOptions.onDidChangeOptions(e => {
                if (e.showFoldingControls) {
                    this.updateFoldingIconShowClass();
                }
            }));
            this._register(this.viewCell.onDidChangeLayout((e) => {
                const layoutInfo = this.editor?.getLayoutInfo();
                if (e.outerWidth && this.viewCell.getEditState() === notebookBrowser_1.CellEditState.Editing && layoutInfo && layoutInfo.width !== this.viewCell.layoutInfo.editorWidth) {
                    this.onCellEditorWidthChange();
                }
            }));
            this._register(this.cellEditorOptions.onDidChange(() => {
                this.updateEditorOptions(this.cellEditorOptions.getUpdatedValue(this.viewCell.internalMetadata, this.viewCell.uri));
            }));
        }
        updateCollapsedState() {
            if (this.viewCell.isInputCollapsed) {
                this.notebookEditor.hideMarkupPreviews([this.viewCell]);
            }
            else {
                this.notebookEditor.unhideMarkupPreviews([this.viewCell]);
            }
        }
        updateForHover() {
            this.templateData.container.classList.toggle('markdown-cell-hover', this.viewCell.cellIsHovered);
        }
        updateForFocusModeChange() {
            if (this.viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor) {
                this.focusEditorIfNeeded();
            }
            this.templateData.container.classList.toggle('cell-editor-focus', this.viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor);
        }
        applyDecorations() {
            // apply decorations
            this._register(this.viewCell.onCellDecorationsChanged((e) => {
                e.added.forEach(options => {
                    if (options.className) {
                        this.notebookEditor.deltaCellContainerClassNames(this.viewCell.id, [options.className], []);
                    }
                });
                e.removed.forEach(options => {
                    if (options.className) {
                        this.notebookEditor.deltaCellContainerClassNames(this.viewCell.id, [], [options.className]);
                    }
                });
            }));
            this.viewCell.getCellDecorations().forEach(options => {
                if (options.className) {
                    this.notebookEditor.deltaCellContainerClassNames(this.viewCell.id, [options.className], []);
                }
            });
        }
        dispose() {
            // move focus back to the cell list otherwise the focus goes to body
            if (this.notebookEditor.getActiveCell() === this.viewCell && this.viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor && (this.notebookEditor.hasEditorFocus() || document.activeElement === document.body)) {
                this.notebookEditor.focusContainer();
            }
            this.viewCell.detachTextEditor();
            super.dispose();
        }
        updateFoldingIconShowClass() {
            const showFoldingIcon = this.notebookEditor.notebookOptions.getLayoutConfiguration().showFoldingControls;
            this.templateData.foldingIndicator.classList.remove('mouseover', 'always');
            this.templateData.foldingIndicator.classList.add(showFoldingIcon);
        }
        viewUpdate() {
            if (this.viewCell.isInputCollapsed) {
                this.viewUpdateCollapsed();
            }
            else if (this.viewCell.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                this.viewUpdateEditing();
            }
            else {
                this.viewUpdatePreview();
            }
        }
        viewUpdateCollapsed() {
            DOM.show(this.templateData.cellInputCollapsedContainer);
            DOM.hide(this.editorPart);
            this.templateData.cellInputCollapsedContainer.innerText = '';
            const markdownIcon = DOM.append(this.templateData.cellInputCollapsedContainer, DOM.$('span'));
            markdownIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.markdown));
            const element = DOM.$('div');
            element.classList.add('cell-collapse-preview');
            const richEditorText = this.getRichText(this.viewCell.textBuffer, this.viewCell.language);
            DOM.safeInnerHtml(element, richEditorText);
            this.templateData.cellInputCollapsedContainer.appendChild(element);
            const expandIcon = DOM.append(element, DOM.$('span.expandInputIcon'));
            expandIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.more));
            const keybinding = this.keybindingService.lookupKeybinding(notebookBrowser_1.EXPAND_CELL_INPUT_COMMAND_ID);
            if (keybinding) {
                element.title = (0, nls_1.localize)('cellExpandInputButtonLabelWithDoubleClick', "Double-click to expand cell input ({0})", keybinding.getLabel());
                expandIcon.title = (0, nls_1.localize)('cellExpandInputButtonLabel', "Expand Cell Input ({0})", keybinding.getLabel());
            }
            this.markdownAccessibilityContainer.ariaHidden = 'true';
            this.templateData.container.classList.toggle('input-collapsed', true);
            this.viewCell.renderedMarkdownHeight = 0;
            this.viewCell.layoutChange({});
        }
        getRichText(buffer, language) {
            return (0, textToHtmlTokenizer_1.tokenizeToStringSync)(this.languageService, buffer.getLineContent(1), language);
        }
        viewUpdateEditing() {
            // switch to editing mode
            let editorHeight;
            DOM.show(this.editorPart);
            this.markdownAccessibilityContainer.ariaHidden = 'true';
            DOM.hide(this.templateData.cellInputCollapsedContainer);
            this.notebookEditor.hideMarkupPreviews([this.viewCell]);
            this.templateData.container.classList.toggle('input-collapsed', false);
            this.templateData.container.classList.toggle('markdown-cell-edit-mode', true);
            if (this.editor && this.editor.hasModel()) {
                editorHeight = this.editor.getContentHeight();
                // not first time, we don't need to create editor
                this.viewCell.attachTextEditor(this.editor);
                this.focusEditorIfNeeded();
                this.bindEditorListeners(this.editor);
                this.editor.layout({
                    width: this.viewCell.layoutInfo.editorWidth,
                    height: editorHeight
                });
            }
            else {
                this.editorDisposables.clear();
                const width = this.notebookEditor.notebookOptions.computeMarkdownCellEditorWidth(this.notebookEditor.getLayoutInfo().width);
                const lineNum = this.viewCell.lineCount;
                const lineHeight = this.viewCell.layoutInfo.fontInfo?.lineHeight || 17;
                const editorPadding = this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri);
                editorHeight = Math.max(lineNum, 1) * lineHeight + editorPadding.top + editorPadding.bottom;
                this.templateData.editorContainer.innerText = '';
                // create a special context key service that set the inCompositeEditor-contextkey
                const editorContextKeyService = this.contextKeyService.createScoped(this.templateData.editorPart);
                editorContextKeys_1.EditorContextKeys.inCompositeEditor.bindTo(editorContextKeyService).set(true);
                const editorInstaService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, editorContextKeyService]));
                this.editorDisposables.add(editorContextKeyService);
                this.editor = this.editorDisposables.add(editorInstaService.createInstance(codeEditorWidget_1.CodeEditorWidget, this.templateData.editorContainer, {
                    ...this.editorOptions,
                    dimension: {
                        width: width,
                        height: editorHeight
                    },
                    // overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode()
                }, {
                    contributions: this.notebookEditor.creationOptions.cellEditorContributions
                }));
                this.templateData.currentEditor = this.editor;
                this.editorDisposables.add(this.editor.onDidBlurEditorWidget(() => {
                    if (this.editor) {
                        wordHighlighter_1.WordHighlighterContribution.get(this.editor)?.stopHighlighting();
                    }
                }));
                this.editorDisposables.add(this.editor.onDidFocusEditorWidget(() => {
                    if (this.editor) {
                        wordHighlighter_1.WordHighlighterContribution.get(this.editor)?.restoreViewState(true);
                    }
                }));
                const cts = new cancellation_1.CancellationTokenSource();
                this.editorDisposables.add({ dispose() { cts.dispose(true); } });
                (0, async_1.raceCancellation)(this.viewCell.resolveTextModel(), cts.token).then(model => {
                    if (!model) {
                        return;
                    }
                    this.editor.setModel(model);
                    const realContentHeight = this.editor.getContentHeight();
                    if (realContentHeight !== editorHeight) {
                        this.editor.layout({
                            width: width,
                            height: realContentHeight
                        });
                        editorHeight = realContentHeight;
                    }
                    this.viewCell.attachTextEditor(this.editor);
                    if (this.viewCell.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                        this.focusEditorIfNeeded();
                    }
                    this.bindEditorListeners(this.editor);
                    this.viewCell.editorHeight = editorHeight;
                });
            }
            this.viewCell.editorHeight = editorHeight;
            this.focusEditorIfNeeded();
            this.renderedEditors.set(this.viewCell, this.editor);
        }
        viewUpdatePreview() {
            this.viewCell.detachTextEditor();
            DOM.hide(this.editorPart);
            DOM.hide(this.templateData.cellInputCollapsedContainer);
            this.markdownAccessibilityContainer.ariaHidden = 'false';
            this.templateData.container.classList.toggle('input-collapsed', false);
            this.templateData.container.classList.toggle('markdown-cell-edit-mode', false);
            this.renderedEditors.delete(this.viewCell);
            this.markdownAccessibilityContainer.innerText = '';
            if (this.viewCell.renderedHtml) {
                if (this.accessibilityService.isScreenReaderOptimized()) {
                    DOM.safeInnerHtml(this.markdownAccessibilityContainer, this.viewCell.renderedHtml);
                }
                else {
                    DOM.clearNode(this.markdownAccessibilityContainer);
                }
            }
            this.notebookEditor.createMarkupPreview(this.viewCell);
        }
        focusEditorIfNeeded() {
            if (this.viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor &&
                (this.notebookEditor.hasEditorFocus() || document.activeElement === document.body)) { // Don't steal focus from other workbench parts, but if body has focus, we can take it
                if (!this.editor) {
                    return;
                }
                this.editor.focus();
                const primarySelection = this.editor.getSelection();
                if (!primarySelection) {
                    return;
                }
                this.notebookEditor.revealRangeInViewAsync(this.viewCell, primarySelection);
            }
        }
        layoutEditor(dimension) {
            this.editor?.layout(dimension);
        }
        onCellEditorWidthChange() {
            const realContentHeight = this.editor.getContentHeight();
            this.layoutEditor({
                width: this.viewCell.layoutInfo.editorWidth,
                height: realContentHeight
            });
            // LET the content size observer to handle it
            // this.viewCell.editorHeight = realContentHeight;
            // this.relayoutCell();
        }
        relayoutCell() {
            this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
            this.layoutFoldingIndicator();
        }
        updateEditorOptions(newValue) {
            this.editorOptions = newValue;
            this.editor?.updateOptions(this.editorOptions);
        }
        layoutFoldingIndicator() {
            switch (this.foldingState) {
                case 0 /* CellFoldingState.None */:
                    this.templateData.foldingIndicator.style.display = 'none';
                    this.templateData.foldingIndicator.innerText = '';
                    break;
                case 2 /* CellFoldingState.Collapsed */:
                    this.templateData.foldingIndicator.style.display = '';
                    DOM.reset(this.templateData.foldingIndicator, (0, iconLabels_1.renderIcon)(notebookIcons_1.collapsedIcon));
                    break;
                case 1 /* CellFoldingState.Expanded */:
                    this.templateData.foldingIndicator.style.display = '';
                    DOM.reset(this.templateData.foldingIndicator, (0, iconLabels_1.renderIcon)(notebookIcons_1.expandedIcon));
                    break;
                default:
                    break;
            }
        }
        bindEditorListeners(editor) {
            this.localDisposables.clear();
            this.focusSwitchDisposable.clear();
            this.localDisposables.add(editor.onDidContentSizeChange(e => {
                if (e.contentHeightChanged) {
                    this.onCellEditorHeightChange(editor, e.contentHeight);
                }
            }));
            this.localDisposables.add(editor.onDidChangeCursorSelection((e) => {
                if (e.source === 'restoreState') {
                    // do not reveal the cell into view if this selection change was caused by restoring editors...
                    return;
                }
                const selections = editor.getSelections();
                if (selections?.length) {
                    const contentHeight = editor.getContentHeight();
                    const layoutContentHeight = this.viewCell.layoutInfo.editorHeight;
                    if (contentHeight !== layoutContentHeight) {
                        this.onCellEditorHeightChange(editor, contentHeight);
                    }
                    const lastSelection = selections[selections.length - 1];
                    this.notebookEditor.revealRangeInViewAsync(this.viewCell, lastSelection);
                }
            }));
            const updateFocusMode = () => this.viewCell.focusMode = editor.hasWidgetFocus() ? notebookBrowser_1.CellFocusMode.Editor : notebookBrowser_1.CellFocusMode.Container;
            this.localDisposables.add(editor.onDidFocusEditorWidget(() => {
                updateFocusMode();
            }));
            this.localDisposables.add(editor.onDidBlurEditorWidget(() => {
                // this is for a special case:
                // users click the status bar empty space, which we will then focus the editor
                // so we don't want to update the focus state too eagerly
                if (document.activeElement?.contains(this.templateData.container)) {
                    this.focusSwitchDisposable.value = (0, async_1.disposableTimeout)(() => updateFocusMode(), 300);
                }
                else {
                    updateFocusMode();
                }
            }));
            updateFocusMode();
        }
        onCellEditorHeightChange(editor, newHeight) {
            const viewLayout = editor.getLayoutInfo();
            this.viewCell.editorHeight = newHeight;
            editor.layout({
                width: viewLayout.width,
                height: newHeight
            });
        }
    };
    exports.MarkupCell = MarkupCell;
    exports.MarkupCell = MarkupCell = __decorate([
        __param(4, accessibility_1.IAccessibilityService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, language_1.ILanguageService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, keybinding_1.IKeybindingService)
    ], MarkupCell);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya3VwQ2VsbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlldy9jZWxsUGFydHMvbWFya3VwQ2VsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE4QnpGLElBQU0sVUFBVSxHQUFoQixNQUFNLFVBQVcsU0FBUSxzQkFBVTtRQWN6QyxZQUNrQixjQUE2QyxFQUM3QyxRQUE2QixFQUM3QixZQUF3QyxFQUN4QyxlQUE2RCxFQUN2RCxvQkFBNEQsRUFDL0QsaUJBQXNELEVBQ25ELG9CQUE0RCxFQUNqRSxlQUFrRCxFQUM3QyxvQkFBbUQsRUFDdEQsaUJBQTZDO1lBRWpFLEtBQUssRUFBRSxDQUFDO1lBWFMsbUJBQWMsR0FBZCxjQUFjLENBQStCO1lBQzdDLGFBQVEsR0FBUixRQUFRLENBQXFCO1lBQzdCLGlCQUFZLEdBQVosWUFBWSxDQUE0QjtZQUN4QyxvQkFBZSxHQUFmLGVBQWUsQ0FBOEM7WUFDdEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUM5QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDaEQsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQ3JDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDOUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQXRCMUQsV0FBTSxHQUE0QixJQUFJLENBQUM7WUFLOUIscUJBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELDBCQUFxQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7WUFDaEUsc0JBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FB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