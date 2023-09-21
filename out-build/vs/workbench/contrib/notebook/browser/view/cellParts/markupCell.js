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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/lifecycle", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/language", "vs/editor/common/languages/textToHtmlTokenizer", "vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/markupCell", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions", "vs/editor/contrib/wordHighlighter/browser/wordHighlighter"], function (require, exports, DOM, iconLabels_1, async_1, cancellation_1, codicons_1, themables_1, lifecycle_1, codeEditorWidget_1, editorContextKeys_1, language_1, textToHtmlTokenizer_1, nls_1, accessibility_1, configuration_1, contextkey_1, instantiation_1, serviceCollection_1, keybinding_1, notebookBrowser_1, notebookIcons_1, cellEditorOptions_1, wordHighlighter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6qb = void 0;
    let $6qb = class $6qb extends lifecycle_1.$kc {
        constructor(r, s, t, u, w, y, z, C, D, F) {
            super();
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.a = null;
            this.f = this.B(new lifecycle_1.$jc());
            this.g = this.B(new lifecycle_1.$lc());
            this.h = this.B(new lifecycle_1.$jc());
            this.G();
            this.c = t.editorPart;
            this.m = this.B(new cellEditorOptions_1.$ipb(this.r.getBaseCellEditorOptions(s.language), this.r.notebookOptions, this.D));
            this.m.setLineNumbers(this.s.lineNumbers);
            this.n = this.m.getValue(this.s.internalMetadata, this.s.uri);
            this.B((0, lifecycle_1.$ic)(() => u.delete(this.s)));
            this.H();
            // update for init state
            this.t.cellParts.scheduleRenderCell(this.s);
            this.B((0, lifecycle_1.$ic)(() => {
                this.t.cellParts.unrenderCell(this.s);
            }));
            this.B(this.w.onDidChangeScreenReaderOptimized(() => {
                this.O();
            }));
            this.J();
            this.L();
            this.j = s.foldingState;
            this.Y();
            this.N();
            // the markdown preview's height might already be updated after the renderer calls `element.getHeight()`
            if (this.s.layoutInfo.totalHeight > 0) {
                this.relayoutCell();
            }
            this.M();
            this.O();
            this.layoutCellParts();
            this.B(this.s.onDidChangeLayout(() => {
                this.layoutCellParts();
            }));
        }
        layoutCellParts() {
            this.t.cellParts.updateInternalLayoutNow(this.s);
        }
        G() {
            // Create an element that is only used to announce markup cell content to screen readers
            const id = `aria-markup-cell-${this.s.id}`;
            this.b = this.t.cellContainer;
            this.b.id = id;
            // Hide the element from non-screen readers
            this.b.style.height = '1px';
            this.b.style.overflow = 'hidden';
            this.b.style.position = 'absolute';
            this.b.style.top = '100000px';
            this.b.style.left = '10000px';
            this.b.ariaHidden = 'false';
            this.t.rootContainer.setAttribute('aria-describedby', id);
            this.t.container.classList.toggle('webview-backed-markdown-cell', true);
        }
        H() {
            this.B(this.s.onDidChangeState(e => {
                this.t.cellParts.updateState(this.s, e);
            }));
            this.B(this.s.model.onDidChangeMetadata(() => {
                this.O();
            }));
            this.B(this.s.onDidChangeState((e) => {
                if (e.editStateChanged || e.contentChanged) {
                    this.O();
                }
                if (e.focusModeChanged) {
                    this.L();
                }
                if (e.foldingStateChanged) {
                    const foldingState = this.s.foldingState;
                    if (foldingState !== this.j) {
                        this.j = foldingState;
                        this.Y();
                    }
                }
                if (e.cellIsHoveredChanged) {
                    this.J();
                }
                if (e.inputCollapsedChanged) {
                    this.I();
                    this.O();
                }
                if (e.cellLineNumberChanged) {
                    this.m.setLineNumbers(this.s.lineNumbers);
                }
            }));
            this.B(this.r.notebookOptions.onDidChangeOptions(e => {
                if (e.showFoldingControls) {
                    this.N();
                }
            }));
            this.B(this.s.onDidChangeLayout((e) => {
                const layoutInfo = this.a?.getLayoutInfo();
                if (e.outerWidth && this.s.getEditState() === notebookBrowser_1.CellEditState.Editing && layoutInfo && layoutInfo.width !== this.s.layoutInfo.editorWidth) {
                    this.X();
                }
            }));
            this.B(this.m.onDidChange(() => {
                this.updateEditorOptions(this.m.getUpdatedValue(this.s.internalMetadata, this.s.uri));
            }));
        }
        I() {
            if (this.s.isInputCollapsed) {
                this.r.hideMarkupPreviews([this.s]);
            }
            else {
                this.r.unhideMarkupPreviews([this.s]);
            }
        }
        J() {
            this.t.container.classList.toggle('markdown-cell-hover', this.s.cellIsHovered);
        }
        L() {
            if (this.s.focusMode === notebookBrowser_1.CellFocusMode.Editor) {
                this.U();
            }
            this.t.container.classList.toggle('cell-editor-focus', this.s.focusMode === notebookBrowser_1.CellFocusMode.Editor);
        }
        M() {
            // apply decorations
            this.B(this.s.onCellDecorationsChanged((e) => {
                e.added.forEach(options => {
                    if (options.className) {
                        this.r.deltaCellContainerClassNames(this.s.id, [options.className], []);
                    }
                });
                e.removed.forEach(options => {
                    if (options.className) {
                        this.r.deltaCellContainerClassNames(this.s.id, [], [options.className]);
                    }
                });
            }));
            this.s.getCellDecorations().forEach(options => {
                if (options.className) {
                    this.r.deltaCellContainerClassNames(this.s.id, [options.className], []);
                }
            });
        }
        dispose() {
            // move focus back to the cell list otherwise the focus goes to body
            if (this.r.getActiveCell() === this.s && this.s.focusMode === notebookBrowser_1.CellFocusMode.Editor && (this.r.hasEditorFocus() || document.activeElement === document.body)) {
                this.r.focusContainer();
            }
            this.s.detachTextEditor();
            super.dispose();
        }
        N() {
            const showFoldingIcon = this.r.notebookOptions.getLayoutConfiguration().showFoldingControls;
            this.t.foldingIndicator.classList.remove('mouseover', 'always');
            this.t.foldingIndicator.classList.add(showFoldingIcon);
        }
        O() {
            if (this.s.isInputCollapsed) {
                this.P();
            }
            else if (this.s.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                this.R();
            }
            else {
                this.S();
            }
        }
        P() {
            DOM.$dP(this.t.cellInputCollapsedContainer);
            DOM.$eP(this.c);
            this.t.cellInputCollapsedContainer.innerText = '';
            const markdownIcon = DOM.$0O(this.t.cellInputCollapsedContainer, DOM.$('span'));
            markdownIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.markdown));
            const element = DOM.$('div');
            element.classList.add('cell-collapse-preview');
            const richEditorText = this.Q(this.s.textBuffer, this.s.language);
            DOM.$vP(element, richEditorText);
            this.t.cellInputCollapsedContainer.appendChild(element);
            const expandIcon = DOM.$0O(element, DOM.$('span.expandInputIcon'));
            expandIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.more));
            const keybinding = this.F.lookupKeybinding(notebookBrowser_1.$Pbb);
            if (keybinding) {
                element.title = (0, nls_1.localize)(0, null, keybinding.getLabel());
                expandIcon.title = (0, nls_1.localize)(1, null, keybinding.getLabel());
            }
            this.b.ariaHidden = 'true';
            this.t.container.classList.toggle('input-collapsed', true);
            this.s.renderedMarkdownHeight = 0;
            this.s.layoutChange({});
        }
        Q(buffer, language) {
            return (0, textToHtmlTokenizer_1.$cY)(this.C, buffer.getLineContent(1), language);
        }
        R() {
            // switch to editing mode
            let editorHeight;
            DOM.$dP(this.c);
            this.b.ariaHidden = 'true';
            DOM.$eP(this.t.cellInputCollapsedContainer);
            this.r.hideMarkupPreviews([this.s]);
            this.t.container.classList.toggle('input-collapsed', false);
            this.t.container.classList.toggle('markdown-cell-edit-mode', true);
            if (this.a && this.a.hasModel()) {
                editorHeight = this.a.getContentHeight();
                // not first time, we don't need to create editor
                this.s.attachTextEditor(this.a);
                this.U();
                this.Z(this.a);
                this.a.layout({
                    width: this.s.layoutInfo.editorWidth,
                    height: editorHeight
                });
            }
            else {
                this.h.clear();
                const width = this.r.notebookOptions.computeMarkdownCellEditorWidth(this.r.getLayoutInfo().width);
                const lineNum = this.s.lineCount;
                const lineHeight = this.s.layoutInfo.fontInfo?.lineHeight || 17;
                const editorPadding = this.r.notebookOptions.computeEditorPadding(this.s.internalMetadata, this.s.uri);
                editorHeight = Math.max(lineNum, 1) * lineHeight + editorPadding.top + editorPadding.bottom;
                this.t.editorContainer.innerText = '';
                // create a special context key service that set the inCompositeEditor-contextkey
                const editorContextKeyService = this.y.createScoped(this.t.editorPart);
                editorContextKeys_1.EditorContextKeys.inCompositeEditor.bindTo(editorContextKeyService).set(true);
                const editorInstaService = this.z.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, editorContextKeyService]));
                this.h.add(editorContextKeyService);
                this.a = this.h.add(editorInstaService.createInstance(codeEditorWidget_1.$uY, this.t.editorContainer, {
                    ...this.n,
                    dimension: {
                        width: width,
                        height: editorHeight
                    },
                    // overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode()
                }, {
                    contributions: this.r.creationOptions.cellEditorContributions
                }));
                this.t.currentEditor = this.a;
                this.h.add(this.a.onDidBlurEditorWidget(() => {
                    if (this.a) {
                        wordHighlighter_1.$f$.get(this.a)?.stopHighlighting();
                    }
                }));
                this.h.add(this.a.onDidFocusEditorWidget(() => {
                    if (this.a) {
                        wordHighlighter_1.$f$.get(this.a)?.restoreViewState(true);
                    }
                }));
                const cts = new cancellation_1.$pd();
                this.h.add({ dispose() { cts.dispose(true); } });
                (0, async_1.$vg)(this.s.resolveTextModel(), cts.token).then(model => {
                    if (!model) {
                        return;
                    }
                    this.a.setModel(model);
                    const realContentHeight = this.a.getContentHeight();
                    if (realContentHeight !== editorHeight) {
                        this.a.layout({
                            width: width,
                            height: realContentHeight
                        });
                        editorHeight = realContentHeight;
                    }
                    this.s.attachTextEditor(this.a);
                    if (this.s.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                        this.U();
                    }
                    this.Z(this.a);
                    this.s.editorHeight = editorHeight;
                });
            }
            this.s.editorHeight = editorHeight;
            this.U();
            this.u.set(this.s, this.a);
        }
        S() {
            this.s.detachTextEditor();
            DOM.$eP(this.c);
            DOM.$eP(this.t.cellInputCollapsedContainer);
            this.b.ariaHidden = 'false';
            this.t.container.classList.toggle('input-collapsed', false);
            this.t.container.classList.toggle('markdown-cell-edit-mode', false);
            this.u.delete(this.s);
            this.b.innerText = '';
            if (this.s.renderedHtml) {
                if (this.w.isScreenReaderOptimized()) {
                    DOM.$vP(this.b, this.s.renderedHtml);
                }
                else {
                    DOM.$lO(this.b);
                }
            }
            this.r.createMarkupPreview(this.s);
        }
        U() {
            if (this.s.focusMode === notebookBrowser_1.CellFocusMode.Editor &&
                (this.r.hasEditorFocus() || document.activeElement === document.body)) { // Don't steal focus from other workbench parts, but if body has focus, we can take it
                if (!this.a) {
                    return;
                }
                this.a.focus();
                const primarySelection = this.a.getSelection();
                if (!primarySelection) {
                    return;
                }
                this.r.revealRangeInViewAsync(this.s, primarySelection);
            }
        }
        W(dimension) {
            this.a?.layout(dimension);
        }
        X() {
            const realContentHeight = this.a.getContentHeight();
            this.W({
                width: this.s.layoutInfo.editorWidth,
                height: realContentHeight
            });
            // LET the content size observer to handle it
            // this.viewCell.editorHeight = realContentHeight;
            // this.relayoutCell();
        }
        relayoutCell() {
            this.r.layoutNotebookCell(this.s, this.s.layoutInfo.totalHeight);
            this.Y();
        }
        updateEditorOptions(newValue) {
            this.n = newValue;
            this.a?.updateOptions(this.n);
        }
        Y() {
            switch (this.j) {
                case 0 /* CellFoldingState.None */:
                    this.t.foldingIndicator.style.display = 'none';
                    this.t.foldingIndicator.innerText = '';
                    break;
                case 2 /* CellFoldingState.Collapsed */:
                    this.t.foldingIndicator.style.display = '';
                    DOM.$_O(this.t.foldingIndicator, (0, iconLabels_1.$yQ)(notebookIcons_1.$Kpb));
                    break;
                case 1 /* CellFoldingState.Expanded */:
                    this.t.foldingIndicator.style.display = '';
                    DOM.$_O(this.t.foldingIndicator, (0, iconLabels_1.$yQ)(notebookIcons_1.$Lpb));
                    break;
                default:
                    break;
            }
        }
        Z(editor) {
            this.f.clear();
            this.g.clear();
            this.f.add(editor.onDidContentSizeChange(e => {
                if (e.contentHeightChanged) {
                    this.ab(editor, e.contentHeight);
                }
            }));
            this.f.add(editor.onDidChangeCursorSelection((e) => {
                if (e.source === 'restoreState') {
                    // do not reveal the cell into view if this selection change was caused by restoring editors...
                    return;
                }
                const selections = editor.getSelections();
                if (selections?.length) {
                    const contentHeight = editor.getContentHeight();
                    const layoutContentHeight = this.s.layoutInfo.editorHeight;
                    if (contentHeight !== layoutContentHeight) {
                        this.ab(editor, contentHeight);
                    }
                    const lastSelection = selections[selections.length - 1];
                    this.r.revealRangeInViewAsync(this.s, lastSelection);
                }
            }));
            const updateFocusMode = () => this.s.focusMode = editor.hasWidgetFocus() ? notebookBrowser_1.CellFocusMode.Editor : notebookBrowser_1.CellFocusMode.Container;
            this.f.add(editor.onDidFocusEditorWidget(() => {
                updateFocusMode();
            }));
            this.f.add(editor.onDidBlurEditorWidget(() => {
                // this is for a special case:
                // users click the status bar empty space, which we will then focus the editor
                // so we don't want to update the focus state too eagerly
                if (document.activeElement?.contains(this.t.container)) {
                    this.g.value = (0, async_1.$Ig)(() => updateFocusMode(), 300);
                }
                else {
                    updateFocusMode();
                }
            }));
            updateFocusMode();
        }
        ab(editor, newHeight) {
            const viewLayout = editor.getLayoutInfo();
            this.s.editorHeight = newHeight;
            editor.layout({
                width: viewLayout.width,
                height: newHeight
            });
        }
    };
    exports.$6qb = $6qb;
    exports.$6qb = $6qb = __decorate([
        __param(4, accessibility_1.$1r),
        __param(5, contextkey_1.$3i),
        __param(6, instantiation_1.$Ah),
        __param(7, language_1.$ct),
        __param(8, configuration_1.$8h),
        __param(9, keybinding_1.$2D)
    ], $6qb);
});
//# sourceMappingURL=markupCell.js.map