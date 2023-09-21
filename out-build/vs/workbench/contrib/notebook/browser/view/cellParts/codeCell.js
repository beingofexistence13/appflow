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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/common/languages/language", "vs/editor/common/languages/textToHtmlTokenizer", "vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/codeCell", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions", "vs/workbench/contrib/notebook/browser/view/cellParts/cellOutput", "vs/workbench/contrib/notebook/browser/view/cellParts/codeCellExecutionIcon", "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/editor/contrib/wordHighlighter/browser/wordHighlighter", "vs/editor/contrib/codeAction/browser/codeActionController"], function (require, exports, DOM, async_1, cancellation_1, codicons_1, themables_1, event_1, lifecycle_1, strings, language_1, textToHtmlTokenizer_1, nls_1, configuration_1, instantiation_1, keybinding_1, opener_1, notebookBrowser_1, cellEditorOptions_1, cellOutput_1, codeCellExecutionIcon_1, codeCellViewModel_1, notebookExecutionStateService_1, wordHighlighter_1, codeActionController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Uqb = void 0;
    let $Uqb = class $Uqb extends lifecycle_1.$kc {
        constructor(n, r, s, t, u, openerService, w, y, notebookExecutionStateService) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.g = false;
            const cellEditorOptions = this.B(new cellEditorOptions_1.$ipb(this.n.getBaseCellEditorOptions(r.language), this.n.notebookOptions, this.y));
            this.a = this.t.createInstance(cellOutput_1.$Sqb, n, r, s, { limit: codeCellViewModel_1.$Qnb });
            this.h = this.B(s.cellParts.concatContentPart([cellEditorOptions, this.a]));
            // this.viewCell.layoutInfo.editorHeight or estimation when this.viewCell.layoutInfo.editorHeight === 0
            const editorHeight = this.G();
            this.H(editorHeight);
            this.c = false; // editor is always expanded initially
            this.L();
            this.M();
            this.O();
            this.P();
            this.B(event_1.Event.any(this.r.onDidStartExecution, this.r.onDidStopExecution)((e) => {
                this.h.updateForExecutionState(this.r, e);
            }));
            this.B(this.r.onDidChangeState(e => {
                this.h.updateState(this.r, e);
                if (e.outputIsHoveredChanged) {
                    this.D();
                }
                if (e.outputIsFocusedChanged) {
                    this.F();
                }
                if (e.metadataChanged || e.internalMetadataChanged) {
                    this.J();
                }
                if (e.inputCollapsedChanged || e.outputCollapsedChanged) {
                    this.r.pauseLayout();
                    const updated = this.S();
                    this.r.resumeLayout();
                    if (updated) {
                        this.relayoutCell();
                    }
                }
                if (e.focusModeChanged) {
                    this.R();
                }
            }));
            this.h.scheduleRenderCell(this.r);
            this.B((0, lifecycle_1.$ic)(() => {
                this.h.unrenderCell(this.r);
            }));
            this.J();
            this.R();
            this.D();
            this.F();
            // Render Outputs
            this.r.editorHeight = editorHeight;
            this.a.render();
            this.f = false; // the output is always rendered initially
            // Need to do this after the intial renderOutput
            this.eb();
            this.B(this.r.onLayoutInfoRead(() => {
                this.h.prepareLayout();
            }));
            const executionItemElement = DOM.$0O(this.s.cellInputCollapsedContainer, DOM.$('.collapsed-execution-icon'));
            this.B((0, lifecycle_1.$ic)(() => {
                executionItemElement.parentElement?.removeChild(executionItemElement);
            }));
            this.m = this.B(this.t.createInstance(codeCellExecutionIcon_1.$Tqb, this.n, this.r, executionItemElement));
            this.S();
            this.B(event_1.Event.runAndSubscribe(r.onDidChangeOutputs, this.I.bind(this)));
            this.B(event_1.Event.runAndSubscribe(r.onDidChangeLayout, this.C.bind(this)));
            cellEditorOptions.setLineNumbers(this.r.lineNumbers);
            this.B(cellEditorOptions.onDidChange(() => s.editor.updateOptions(cellEditorOptions.getUpdatedValue(this.r.internalMetadata, this.r.uri))));
            s.editor.updateOptions(cellEditorOptions.getUpdatedValue(this.r.internalMetadata, this.r.uri));
        }
        C() {
            this.z?.dispose();
            this.z = DOM.$xO(() => {
                this.h.updateInternalLayoutNow(this.r);
            });
        }
        D() {
            this.s.container.classList.toggle('cell-output-hover', this.r.outputIsHovered);
        }
        F() {
            this.s.container.classList.toggle('cell-output-focus', this.r.outputIsFocused);
        }
        G() {
            const lineNum = this.r.lineCount;
            const lineHeight = this.r.layoutInfo.fontInfo?.lineHeight || 17;
            const editorPadding = this.n.notebookOptions.computeEditorPadding(this.r.internalMetadata, this.r.uri);
            const editorHeight = this.r.layoutInfo.editorHeight === 0
                ? lineNum * lineHeight + editorPadding.top + editorPadding.bottom
                : this.r.layoutInfo.editorHeight;
            return editorHeight;
        }
        H(initEditorHeight) {
            const width = this.r.layoutInfo.editorWidth;
            this.fb({
                width: width,
                height: initEditorHeight
            });
            const cts = new cancellation_1.$pd();
            this.B({ dispose() { cts.dispose(true); } });
            (0, async_1.$vg)(this.r.resolveTextModel(), cts.token).then(model => {
                if (this.g) {
                    return;
                }
                if (model && this.s.editor) {
                    this.N(model);
                    this.s.editor.setModel(model);
                    this.r.attachTextEditor(this.s.editor, this.r.layoutInfo.estimatedHasHorizontalScrolling);
                    const focusEditorIfNeeded = () => {
                        if (this.n.getActiveCell() === this.r &&
                            this.r.focusMode === notebookBrowser_1.CellFocusMode.Editor &&
                            (this.n.hasEditorFocus() || document.activeElement === document.body)) // Don't steal focus from other workbench parts, but if body has focus, we can take it
                         {
                            this.s.editor?.focus();
                        }
                    };
                    focusEditorIfNeeded();
                    const realContentHeight = this.s.editor?.getContentHeight();
                    if (realContentHeight !== undefined && realContentHeight !== initEditorHeight) {
                        this.hb(realContentHeight);
                    }
                    focusEditorIfNeeded();
                }
            });
        }
        I() {
            DOM.$cP(this.r.outputsViewModels.length > 0, this.s.focusSinkElement);
        }
        J() {
            const editor = this.s.editor;
            if (!editor) {
                return;
            }
            const isReadonly = this.n.isReadOnly;
            const padding = this.n.notebookOptions.computeEditorPadding(this.r.internalMetadata, this.r.uri);
            const options = editor.getOptions();
            if (options.get(90 /* EditorOption.readOnly */) !== isReadonly || options.get(83 /* EditorOption.padding */) !== padding) {
                editor.updateOptions({ readOnly: this.n.isReadOnly, padding: this.n.notebookOptions.computeEditorPadding(this.r.internalMetadata, this.r.uri) });
            }
        }
        L() {
            this.B(this.r.onDidChangeLayout((e) => {
                if (e.outerWidth !== undefined) {
                    const layoutInfo = this.s.editor.getLayoutInfo();
                    if (layoutInfo.width !== this.r.layoutInfo.editorWidth) {
                        this.gb();
                    }
                }
            }));
        }
        M() {
            this.B(this.s.editor.onDidContentSizeChange((e) => {
                if (e.contentHeightChanged) {
                    if (this.r.layoutInfo.editorHeight !== e.contentHeight) {
                        this.hb(e.contentHeight);
                    }
                }
            }));
            this.B(this.s.editor.onDidChangeCursorSelection((e) => {
                if (e.source === 'restoreState' || e.oldModelVersionId === 0) {
                    // do not reveal the cell into view if this selection change was caused by restoring editors...
                    return;
                }
                const selections = this.s.editor.getSelections();
                if (selections?.length) {
                    const contentHeight = this.s.editor.getContentHeight();
                    const layoutContentHeight = this.r.layoutInfo.editorHeight;
                    if (contentHeight !== layoutContentHeight) {
                        this.hb(contentHeight);
                    }
                    const lastSelection = selections[selections.length - 1];
                    this.n.revealRangeInViewAsync(this.r, lastSelection);
                }
            }));
            this.B(this.s.editor.onDidBlurEditorWidget(() => {
                wordHighlighter_1.$f$.get(this.s.editor)?.stopHighlighting();
                codeActionController_1.$Q2.get(this.s.editor)?.hideCodeActions();
                codeActionController_1.$Q2.get(this.s.editor)?.hideLightBulbWidget();
            }));
            this.B(this.s.editor.onDidFocusEditorWidget(() => {
                wordHighlighter_1.$f$.get(this.s.editor)?.restoreViewState(true);
            }));
        }
        N(model) {
            this.B(model.onDidChangeTokens(() => {
                if (this.r.isInputCollapsed && this.b) {
                    // flush the collapsed input with the latest tokens
                    const content = this.Z(model);
                    DOM.$vP(this.b, content);
                    this.W(this.b);
                }
            }));
        }
        O() {
            // Apply decorations
            this.B(this.r.onCellDecorationsChanged((e) => {
                e.added.forEach(options => {
                    if (options.className) {
                        this.s.rootContainer.classList.add(options.className);
                    }
                    if (options.outputClassName) {
                        this.n.deltaCellContainerClassNames(this.r.id, [options.outputClassName], []);
                    }
                });
                e.removed.forEach(options => {
                    if (options.className) {
                        this.s.rootContainer.classList.remove(options.className);
                    }
                    if (options.outputClassName) {
                        this.n.deltaCellContainerClassNames(this.r.id, [], [options.outputClassName]);
                    }
                });
            }));
            this.r.getCellDecorations().forEach(options => {
                if (options.className) {
                    this.s.rootContainer.classList.add(options.className);
                }
                if (options.outputClassName) {
                    this.n.deltaCellContainerClassNames(this.r.id, [options.outputClassName], []);
                }
            });
        }
        P() {
            this.B(this.s.editor.onMouseDown(e => {
                // prevent default on right mouse click, otherwise it will trigger unexpected focus changes
                // the catch is, it means we don't allow customization of right button mouse down handlers other than the built in ones.
                if (e.event.rightButton) {
                    e.event.preventDefault();
                }
            }));
        }
        Q() {
            // The DOM focus needs to be adjusted:
            // when a cell editor should be focused
            // the document active element is inside the notebook editor or the document body (cell editor being disposed previously)
            return this.n.getActiveCell() === this.r
                && this.r.focusMode === notebookBrowser_1.CellFocusMode.Editor
                && (this.n.hasEditorFocus() || document.activeElement === document.body);
        }
        R() {
            if (this.Q()) {
                this.s.editor?.focus();
            }
            this.s.container.classList.toggle('cell-editor-focus', this.r.focusMode === notebookBrowser_1.CellFocusMode.Editor);
            this.s.container.classList.toggle('cell-output-focus', this.r.focusMode === notebookBrowser_1.CellFocusMode.Output);
        }
        S() {
            if (this.r.isOutputCollapsed === this.f &&
                this.r.isInputCollapsed === this.c) {
                return false;
            }
            this.r.layoutChange({ editorHeight: true });
            if (this.r.isInputCollapsed) {
                this.U();
            }
            else {
                this.X();
            }
            if (this.r.isOutputCollapsed) {
                this.cb();
            }
            else {
                this.db(false);
            }
            this.relayoutCell();
            this.f = this.r.isOutputCollapsed;
            this.c = this.r.isInputCollapsed;
            return true;
        }
        U() {
            // hide the editor and execution label, keep the run button
            DOM.$eP(this.s.editorPart);
            this.s.container.classList.toggle('input-collapsed', true);
            // remove input preview
            this.ab();
            this.m.setVisibility(true);
            // update preview
            const richEditorText = this.s.editor.hasModel() ? this.Z(this.s.editor.getModel()) : this.Y(this.r.textBuffer, this.r.language);
            const element = DOM.$('div.cell-collapse-preview');
            DOM.$vP(element, richEditorText);
            this.b = element;
            this.s.cellInputCollapsedContainer.appendChild(element);
            this.W(element);
            DOM.$dP(this.s.cellInputCollapsedContainer);
        }
        W(element) {
            const expandIcon = DOM.$('span.expandInputIcon');
            const keybinding = this.u.lookupKeybinding(notebookBrowser_1.$Pbb);
            if (keybinding) {
                element.title = (0, nls_1.localize)(0, null, keybinding.getLabel());
                expandIcon.title = (0, nls_1.localize)(1, null, keybinding.getLabel());
            }
            expandIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.more));
            element.appendChild(expandIcon);
        }
        X() {
            this.m.setVisibility(false);
            DOM.$dP(this.s.editorPart);
            DOM.$eP(this.s.cellInputCollapsedContainer);
        }
        Y(buffer, language) {
            return (0, textToHtmlTokenizer_1.$cY)(this.w, buffer.getLineContent(1), language);
        }
        Z(model) {
            let result = `<div class="monaco-tokenized-source">`;
            const firstLineTokens = model.tokenization.getLineTokens(1);
            const viewLineTokens = firstLineTokens.inflate();
            const line = model.getLineContent(1);
            let startOffset = 0;
            for (let j = 0, lenJ = viewLineTokens.getCount(); j < lenJ; j++) {
                const type = viewLineTokens.getClassName(j);
                const endIndex = viewLineTokens.getEndOffset(j);
                result += `<span class="${type}">${strings.$pe(line.substring(startOffset, endIndex))}</span>`;
                startOffset = endIndex;
            }
            result += `</div>`;
            return result;
        }
        ab() {
            const children = this.s.cellInputCollapsedContainer.children;
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
        bb(hide) {
            const children = this.s.outputContainer.domNode.children;
            for (let i = 0; i < children.length; i++) {
                if (children[i].classList.contains('output-inner-container')) {
                    DOM.$cP(!hide, children[i]);
                }
            }
        }
        cb() {
            this.s.container.classList.toggle('output-collapsed', true);
            DOM.$dP(this.s.cellOutputCollapsedContainer);
            this.bb(true);
            this.a.viewUpdateHideOuputs();
        }
        db(initRendering) {
            this.s.container.classList.toggle('output-collapsed', false);
            DOM.$eP(this.s.cellOutputCollapsedContainer);
            this.bb(false);
            this.a.viewUpdateShowOutputs(initRendering);
        }
        eb() {
            this.s.container.classList.toggle('input-collapsed', false);
            DOM.$dP(this.s.editorPart);
            DOM.$eP(this.s.cellInputCollapsedContainer);
            this.s.container.classList.toggle('output-collapsed', false);
            this.db(true);
        }
        fb(dimension) {
            this.s.editor?.layout(dimension);
        }
        gb() {
            if (!this.s.editor.hasModel()) {
                return;
            }
            const realContentHeight = this.s.editor.getContentHeight();
            this.r.editorHeight = realContentHeight;
            this.relayoutCell();
            this.fb({
                width: this.r.layoutInfo.editorWidth,
                height: realContentHeight
            });
        }
        hb(newHeight) {
            const viewLayout = this.s.editor.getLayoutInfo();
            this.r.editorHeight = newHeight;
            this.relayoutCell();
            this.fb({
                width: viewLayout.width,
                height: newHeight
            });
        }
        relayoutCell() {
            this.n.layoutNotebookCell(this.r, this.r.layoutInfo.totalHeight);
        }
        dispose() {
            this.g = true;
            // move focus back to the cell list otherwise the focus goes to body
            if (this.Q()) {
                this.n.focusContainer();
            }
            this.r.detachTextEditor();
            this.ab();
            this.a.dispose();
            this.z?.dispose();
            super.dispose();
        }
    };
    exports.$Uqb = $Uqb;
    exports.$Uqb = $Uqb = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, keybinding_1.$2D),
        __param(5, opener_1.$NT),
        __param(6, language_1.$ct),
        __param(7, configuration_1.$8h),
        __param(8, notebookExecutionStateService_1.$_H)
    ], $Uqb);
});
//# sourceMappingURL=codeCell.js.map