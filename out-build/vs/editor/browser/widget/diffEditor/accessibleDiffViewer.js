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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/trustedTypes", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/themables", "vs/editor/browser/config/domFontInfo", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/config/editorOptions", "vs/editor/common/core/lineRange", "vs/editor/common/core/offsetRange", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/diff/rangeMapping", "vs/editor/common/languages/language", "vs/editor/common/tokens/lineTokens", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/common/viewModel", "vs/nls!vs/editor/browser/widget/diffEditor/accessibleDiffViewer", "vs/platform/audioCues/browser/audioCueService", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/iconRegistry", "vs/css!./accessibleDiffViewer"], function (require, exports, dom_1, trustedTypes_1, actionbar_1, scrollableElement_1, actions_1, arrays_1, codicons_1, lifecycle_1, observable_1, themables_1, domFontInfo_1, utils_1, editorOptions_1, lineRange_1, offsetRange_1, position_1, range_1, rangeMapping_1, language_1, lineTokens_1, viewLineRenderer_1, viewModel_1, nls_1, audioCueService_1, instantiation_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xZ = void 0;
    const accessibleDiffViewerInsertIcon = (0, iconRegistry_1.$9u)('diff-review-insert', codicons_1.$Pj.add, (0, nls_1.localize)(0, null));
    const accessibleDiffViewerRemoveIcon = (0, iconRegistry_1.$9u)('diff-review-remove', codicons_1.$Pj.remove, (0, nls_1.localize)(1, null));
    const accessibleDiffViewerCloseIcon = (0, iconRegistry_1.$9u)('diff-review-close', codicons_1.$Pj.close, (0, nls_1.localize)(2, null));
    let $xZ = class $xZ extends lifecycle_1.$kc {
        static { this._ttPolicy = (0, trustedTypes_1.$PQ)('diffReview', { createHTML: value => value }); }
        constructor(c, f, h, j, m, n, s, t, u) {
            super();
            this.c = c;
            this.f = f;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = (0, observable_1.derivedWithStore)(this, (reader, store) => {
                const visible = this.f.read(reader);
                this.c.style.visibility = visible ? 'visible' : 'hidden';
                if (!visible) {
                    return null;
                }
                const model = store.add(this.u.createInstance(ViewModel, this.s, this.t, this.h, this.j));
                const view = store.add(this.u.createInstance(View, this.c, model, this.m, this.n, this.t));
                return {
                    model,
                    view
                };
            });
            this.B((0, observable_1.recomputeInitiallyAndOnChange)(this.w));
        }
        next() {
            (0, observable_1.transaction)(tx => {
                const isVisible = this.f.get();
                this.h(true, tx);
                if (isVisible) {
                    this.w.get().model.nextGroup(tx);
                }
            });
        }
        prev() {
            (0, observable_1.transaction)(tx => {
                this.h(true, tx);
                this.w.get().model.previousGroup(tx);
            });
        }
        close() {
            (0, observable_1.transaction)(tx => {
                this.h(false, tx);
            });
        }
    };
    exports.$xZ = $xZ;
    exports.$xZ = $xZ = __decorate([
        __param(8, instantiation_1.$Ah)
    ], $xZ);
    let ViewModel = class ViewModel extends lifecycle_1.$kc {
        constructor(j, m, n, canClose, s) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.canClose = canClose;
            this.s = s;
            this.c = (0, observable_1.observableValue)(this, []);
            this.f = (0, observable_1.observableValue)(this, 0);
            this.h = (0, observable_1.observableValue)(this, 0);
            this.groups = this.c;
            this.currentGroup = this.f.map((idx, r) => this.c.read(r)[idx]);
            this.currentGroupIndex = this.f;
            this.currentElement = this.h.map((idx, r) => this.currentGroup.read(r)?.lines[idx]);
            this.B((0, observable_1.autorun)(reader => {
                /** @description update groups */
                const diffs = this.j.read(reader);
                if (!diffs) {
                    this.c.set([], undefined);
                    return;
                }
                const groups = computeViewElementGroups(diffs, this.m.original.getModel().getLineCount(), this.m.modified.getModel().getLineCount());
                (0, observable_1.transaction)(tx => {
                    const p = this.m.modified.getPosition();
                    if (p) {
                        const nextGroup = groups.findIndex(g => p?.lineNumber < g.range.modified.endLineNumberExclusive);
                        if (nextGroup !== -1) {
                            this.f.set(nextGroup, tx);
                        }
                    }
                    this.c.set(groups, tx);
                });
            }));
            this.B((0, observable_1.autorun)(reader => {
                /** @description play audio-cue for diff */
                const currentViewItem = this.currentElement.read(reader);
                if (currentViewItem?.type === LineType.Deleted) {
                    this.s.playAudioCue(audioCueService_1.$wZ.diffLineDeleted, { source: 'accessibleDiffViewer.currentElementChanged' });
                }
                else if (currentViewItem?.type === LineType.Added) {
                    this.s.playAudioCue(audioCueService_1.$wZ.diffLineInserted, { source: 'accessibleDiffViewer.currentElementChanged' });
                }
            }));
            this.B((0, observable_1.autorun)(reader => {
                /** @description select lines in editor */
                // This ensures editor commands (like revert/stage) work
                const currentViewItem = this.currentElement.read(reader);
                if (currentViewItem && currentViewItem.type !== LineType.Header) {
                    const lineNumber = currentViewItem.modifiedLineNumber ?? currentViewItem.diff.modified.startLineNumber;
                    this.m.modified.setSelection(range_1.$ks.fromPositions(new position_1.$js(lineNumber, 1)));
                }
            }));
        }
        t(delta, tx) {
            const groups = this.groups.get();
            if (!groups || groups.length <= 1) {
                return;
            }
            (0, observable_1.subtransaction)(tx, tx => {
                this.f.set(offsetRange_1.$rs.ofLength(groups.length).clipCyclic(this.f.get() + delta), tx);
                this.h.set(0, tx);
            });
        }
        nextGroup(tx) { this.t(1, tx); }
        previousGroup(tx) { this.t(-1, tx); }
        u(delta) {
            const group = this.currentGroup.get();
            if (!group || group.lines.length <= 1) {
                return;
            }
            (0, observable_1.transaction)(tx => {
                this.h.set(offsetRange_1.$rs.ofLength(group.lines.length).clip(this.h.get() + delta), tx);
            });
        }
        goToNextLine() { this.u(1); }
        goToPreviousLine() { this.u(-1); }
        goToLine(line) {
            const group = this.currentGroup.get();
            if (!group) {
                return;
            }
            const idx = group.lines.indexOf(line);
            if (idx === -1) {
                return;
            }
            (0, observable_1.transaction)(tx => {
                this.h.set(idx, tx);
            });
        }
        revealCurrentElementInEditor() {
            this.n(false, undefined);
            const curElem = this.currentElement.get();
            if (curElem) {
                if (curElem.type === LineType.Deleted) {
                    this.m.original.setSelection(range_1.$ks.fromPositions(new position_1.$js(curElem.originalLineNumber, 1)));
                    this.m.original.revealLine(curElem.originalLineNumber);
                    this.m.original.focus();
                }
                else {
                    if (curElem.type !== LineType.Header) {
                        this.m.modified.setSelection(range_1.$ks.fromPositions(new position_1.$js(curElem.modifiedLineNumber, 1)));
                        this.m.modified.revealLine(curElem.modifiedLineNumber);
                    }
                    this.m.modified.focus();
                }
            }
        }
        close() {
            this.n(false, undefined);
            this.m.modified.focus();
        }
    };
    ViewModel = __decorate([
        __param(4, audioCueService_1.$sZ)
    ], ViewModel);
    const viewElementGroupLineMargin = 3;
    function computeViewElementGroups(diffs, originalLineCount, modifiedLineCount) {
        const result = [];
        for (const g of (0, arrays_1.$yb)(diffs, (a, b) => (b.modified.startLineNumber - a.modified.endLineNumberExclusive < 2 * viewElementGroupLineMargin))) {
            const viewElements = [];
            viewElements.push(new HeaderViewElement());
            const origFullRange = new lineRange_1.$ts(Math.max(1, g[0].original.startLineNumber - viewElementGroupLineMargin), Math.min(g[g.length - 1].original.endLineNumberExclusive + viewElementGroupLineMargin, originalLineCount + 1));
            const modifiedFullRange = new lineRange_1.$ts(Math.max(1, g[0].modified.startLineNumber - viewElementGroupLineMargin), Math.min(g[g.length - 1].modified.endLineNumberExclusive + viewElementGroupLineMargin, modifiedLineCount + 1));
            (0, arrays_1.$zb)(g, (a, b) => {
                const origRange = new lineRange_1.$ts(a ? a.original.endLineNumberExclusive : origFullRange.startLineNumber, b ? b.original.startLineNumber : origFullRange.endLineNumberExclusive);
                const modifiedRange = new lineRange_1.$ts(a ? a.modified.endLineNumberExclusive : modifiedFullRange.startLineNumber, b ? b.modified.startLineNumber : modifiedFullRange.endLineNumberExclusive);
                origRange.forEach(origLineNumber => {
                    viewElements.push(new UnchangedLineViewElement(origLineNumber, modifiedRange.startLineNumber + (origLineNumber - origRange.startLineNumber)));
                });
                if (b) {
                    b.original.forEach(origLineNumber => {
                        viewElements.push(new DeletedLineViewElement(b, origLineNumber));
                    });
                    b.modified.forEach(modifiedLineNumber => {
                        viewElements.push(new AddedLineViewElement(b, modifiedLineNumber));
                    });
                }
            });
            const modifiedRange = g[0].modified.join(g[g.length - 1].modified);
            const originalRange = g[0].original.join(g[g.length - 1].original);
            result.push(new ViewElementGroup(new rangeMapping_1.$vs(modifiedRange, originalRange), viewElements));
        }
        return result;
    }
    var LineType;
    (function (LineType) {
        LineType[LineType["Header"] = 0] = "Header";
        LineType[LineType["Unchanged"] = 1] = "Unchanged";
        LineType[LineType["Deleted"] = 2] = "Deleted";
        LineType[LineType["Added"] = 3] = "Added";
    })(LineType || (LineType = {}));
    class ViewElementGroup {
        constructor(range, lines) {
            this.range = range;
            this.lines = lines;
        }
    }
    class HeaderViewElement {
        constructor() {
            this.type = LineType.Header;
        }
    }
    class DeletedLineViewElement {
        constructor(diff, originalLineNumber) {
            this.diff = diff;
            this.originalLineNumber = originalLineNumber;
            this.type = LineType.Deleted;
            this.modifiedLineNumber = undefined;
        }
    }
    class AddedLineViewElement {
        constructor(diff, modifiedLineNumber) {
            this.diff = diff;
            this.modifiedLineNumber = modifiedLineNumber;
            this.type = LineType.Added;
            this.originalLineNumber = undefined;
        }
    }
    class UnchangedLineViewElement {
        constructor(originalLineNumber, modifiedLineNumber) {
            this.originalLineNumber = originalLineNumber;
            this.modifiedLineNumber = modifiedLineNumber;
            this.type = LineType.Unchanged;
        }
    }
    let View = class View extends lifecycle_1.$kc {
        constructor(j, m, n, s, t, u) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.s = s;
            this.t = t;
            this.u = u;
            this.domNode = this.j;
            this.domNode.className = 'diff-review monaco-editor-background';
            const actionBarContainer = document.createElement('div');
            actionBarContainer.className = 'diff-review-actions';
            this.h = this.B(new actionbar_1.$1P(actionBarContainer));
            this.B((0, observable_1.autorun)(reader => {
                /** @description update actions */
                this.h.clear();
                if (this.m.canClose.read(reader)) {
                    this.h.push(new actions_1.$gi('diffreview.close', (0, nls_1.localize)(3, null), 'close-diff-review ' + themables_1.ThemeIcon.asClassName(accessibleDiffViewerCloseIcon), true, async () => m.close()), { label: false, icon: true });
                }
            }));
            this.c = document.createElement('div');
            this.c.className = 'diff-review-content';
            this.c.setAttribute('role', 'code');
            this.f = this.B(new scrollableElement_1.$UP(this.c, {}));
            (0, dom_1.$_O)(this.domNode, this.f.getDomNode(), actionBarContainer);
            this.B((0, lifecycle_1.$ic)(() => { (0, dom_1.$_O)(this.domNode); }));
            this.B((0, utils_1.$fZ)(this.domNode, { width: this.n, height: this.s }));
            this.B((0, utils_1.$fZ)(this.c, { width: this.n, height: this.s }));
            this.B((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description render */
                this.m.currentGroup.read(reader);
                this.w(store);
            }));
            // TODO@hediet use commands
            this.B((0, dom_1.$oO)(this.domNode, 'keydown', (e) => {
                if (e.equals(18 /* KeyCode.DownArrow */)
                    || e.equals(2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */)
                    || e.equals(512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */)) {
                    e.preventDefault();
                    this.m.goToNextLine();
                }
                if (e.equals(16 /* KeyCode.UpArrow */)
                    || e.equals(2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */)
                    || e.equals(512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */)) {
                    e.preventDefault();
                    this.m.goToPreviousLine();
                }
                if (e.equals(9 /* KeyCode.Escape */)
                    || e.equals(2048 /* KeyMod.CtrlCmd */ | 9 /* KeyCode.Escape */)
                    || e.equals(512 /* KeyMod.Alt */ | 9 /* KeyCode.Escape */)
                    || e.equals(1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */)) {
                    e.preventDefault();
                    this.m.close();
                }
                if (e.equals(10 /* KeyCode.Space */)
                    || e.equals(3 /* KeyCode.Enter */)) {
                    e.preventDefault();
                    this.m.revealCurrentElementInEditor();
                }
            }));
        }
        w(store) {
            const originalOptions = this.t.original.getOptions();
            const modifiedOptions = this.t.modified.getOptions();
            const container = document.createElement('div');
            container.className = 'diff-review-table';
            container.setAttribute('role', 'list');
            container.setAttribute('aria-label', (0, nls_1.localize)(4, null));
            (0, domFontInfo_1.$vU)(container, modifiedOptions.get(50 /* EditorOption.fontInfo */));
            (0, dom_1.$_O)(this.c, container);
            const originalModel = this.t.original.getModel();
            const modifiedModel = this.t.modified.getModel();
            if (!originalModel || !modifiedModel) {
                return;
            }
            const originalModelOpts = originalModel.getOptions();
            const modifiedModelOpts = modifiedModel.getOptions();
            const lineHeight = modifiedOptions.get(66 /* EditorOption.lineHeight */);
            const group = this.m.currentGroup.get();
            for (const viewItem of group?.lines || []) {
                if (!group) {
                    break;
                }
                let row;
                if (viewItem.type === LineType.Header) {
                    const header = document.createElement('div');
                    header.className = 'diff-review-row';
                    header.setAttribute('role', 'listitem');
                    const r = group.range;
                    const diffIndex = this.m.currentGroupIndex.get();
                    const diffsLength = this.m.groups.get().length;
                    const getAriaLines = (lines) => lines === 0 ? (0, nls_1.localize)(5, null)
                        : lines === 1 ? (0, nls_1.localize)(6, null)
                            : (0, nls_1.localize)(7, null, lines);
                    const originalChangedLinesCntAria = getAriaLines(r.original.length);
                    const modifiedChangedLinesCntAria = getAriaLines(r.modified.length);
                    header.setAttribute('aria-label', (0, nls_1.localize)(8, null, (diffIndex + 1), diffsLength, r.original.startLineNumber, originalChangedLinesCntAria, r.modified.startLineNumber, modifiedChangedLinesCntAria));










                    const cell = document.createElement('div');
                    cell.className = 'diff-review-cell diff-review-summary';
                    // e.g.: `1/10: @@ -504,7 +517,7 @@`
                    cell.appendChild(document.createTextNode(`${diffIndex + 1}/${diffsLength}: @@ -${r.original.startLineNumber},${r.original.length} +${r.modified.startLineNumber},${r.modified.length} @@`));
                    header.appendChild(cell);
                    row = header;
                }
                else {
                    row = this.y(viewItem, lineHeight, this.n.get(), originalOptions, originalModel, originalModelOpts, modifiedOptions, modifiedModel, modifiedModelOpts);
                }
                container.appendChild(row);
                const isSelectedObs = (0, observable_1.derived)(reader => /** @description isSelected */ this.m.currentElement.read(reader) === viewItem);
                store.add((0, observable_1.autorun)(reader => {
                    /** @description update tab index */
                    const isSelected = isSelectedObs.read(reader);
                    row.tabIndex = isSelected ? 0 : -1;
                    if (isSelected) {
                        row.focus();
                    }
                }));
                store.add((0, dom_1.$nO)(row, 'focus', () => {
                    this.m.goToLine(viewItem);
                }));
            }
            this.f.scanDomNode();
        }
        y(item, lineHeight, width, originalOptions, originalModel, originalModelOpts, modifiedOptions, modifiedModel, modifiedModelOpts) {
            const originalLayoutInfo = originalOptions.get(143 /* EditorOption.layoutInfo */);
            const originalLineNumbersWidth = originalLayoutInfo.glyphMarginWidth + originalLayoutInfo.lineNumbersWidth;
            const modifiedLayoutInfo = modifiedOptions.get(143 /* EditorOption.layoutInfo */);
            const modifiedLineNumbersWidth = 10 + modifiedLayoutInfo.glyphMarginWidth + modifiedLayoutInfo.lineNumbersWidth;
            let rowClassName = 'diff-review-row';
            let lineNumbersExtraClassName = '';
            const spacerClassName = 'diff-review-spacer';
            let spacerIcon = null;
            switch (item.type) {
                case LineType.Added:
                    rowClassName = 'diff-review-row line-insert';
                    lineNumbersExtraClassName = ' char-insert';
                    spacerIcon = accessibleDiffViewerInsertIcon;
                    break;
                case LineType.Deleted:
                    rowClassName = 'diff-review-row line-delete';
                    lineNumbersExtraClassName = ' char-delete';
                    spacerIcon = accessibleDiffViewerRemoveIcon;
                    break;
            }
            const row = document.createElement('div');
            row.style.minWidth = width + 'px';
            row.className = rowClassName;
            row.setAttribute('role', 'listitem');
            row.ariaLevel = '';
            const cell = document.createElement('div');
            cell.className = 'diff-review-cell';
            cell.style.height = `${lineHeight}px`;
            row.appendChild(cell);
            const originalLineNumber = document.createElement('span');
            originalLineNumber.style.width = (originalLineNumbersWidth + 'px');
            originalLineNumber.style.minWidth = (originalLineNumbersWidth + 'px');
            originalLineNumber.className = 'diff-review-line-number' + lineNumbersExtraClassName;
            if (item.originalLineNumber !== undefined) {
                originalLineNumber.appendChild(document.createTextNode(String(item.originalLineNumber)));
            }
            else {
                originalLineNumber.innerText = '\u00a0';
            }
            cell.appendChild(originalLineNumber);
            const modifiedLineNumber = document.createElement('span');
            modifiedLineNumber.style.width = (modifiedLineNumbersWidth + 'px');
            modifiedLineNumber.style.minWidth = (modifiedLineNumbersWidth + 'px');
            modifiedLineNumber.style.paddingRight = '10px';
            modifiedLineNumber.className = 'diff-review-line-number' + lineNumbersExtraClassName;
            if (item.modifiedLineNumber !== undefined) {
                modifiedLineNumber.appendChild(document.createTextNode(String(item.modifiedLineNumber)));
            }
            else {
                modifiedLineNumber.innerText = '\u00a0';
            }
            cell.appendChild(modifiedLineNumber);
            const spacer = document.createElement('span');
            spacer.className = spacerClassName;
            if (spacerIcon) {
                const spacerCodicon = document.createElement('span');
                spacerCodicon.className = themables_1.ThemeIcon.asClassName(spacerIcon);
                spacerCodicon.innerText = '\u00a0\u00a0';
                spacer.appendChild(spacerCodicon);
            }
            else {
                spacer.innerText = '\u00a0\u00a0';
            }
            cell.appendChild(spacer);
            let lineContent;
            if (item.modifiedLineNumber !== undefined) {
                let html = this.z(modifiedModel, modifiedOptions, modifiedModelOpts.tabSize, item.modifiedLineNumber, this.u.languageIdCodec);
                if ($xZ._ttPolicy) {
                    html = $xZ._ttPolicy.createHTML(html);
                }
                cell.insertAdjacentHTML('beforeend', html);
                lineContent = modifiedModel.getLineContent(item.modifiedLineNumber);
            }
            else {
                let html = this.z(originalModel, originalOptions, originalModelOpts.tabSize, item.originalLineNumber, this.u.languageIdCodec);
                if ($xZ._ttPolicy) {
                    html = $xZ._ttPolicy.createHTML(html);
                }
                cell.insertAdjacentHTML('beforeend', html);
                lineContent = originalModel.getLineContent(item.originalLineNumber);
            }
            if (lineContent.length === 0) {
                lineContent = (0, nls_1.localize)(9, null);
            }
            let ariaLabel = '';
            switch (item.type) {
                case LineType.Unchanged:
                    if (item.originalLineNumber === item.modifiedLineNumber) {
                        ariaLabel = (0, nls_1.localize)(10, null, lineContent, item.originalLineNumber);
                    }
                    else {
                        ariaLabel = (0, nls_1.localize)(11, null, lineContent, item.originalLineNumber, item.modifiedLineNumber);
                    }
                    break;
                case LineType.Added:
                    ariaLabel = (0, nls_1.localize)(12, null, lineContent, item.modifiedLineNumber);
                    break;
                case LineType.Deleted:
                    ariaLabel = (0, nls_1.localize)(13, null, lineContent, item.originalLineNumber);
                    break;
            }
            row.setAttribute('aria-label', ariaLabel);
            return row;
        }
        z(model, options, tabSize, lineNumber, languageIdCodec) {
            const lineContent = model.getLineContent(lineNumber);
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const lineTokens = lineTokens_1.$Xs.createEmpty(lineContent, languageIdCodec);
            const isBasicASCII = viewModel_1.$aV.isBasicASCII(lineContent, model.mightContainNonBasicASCII());
            const containsRTL = viewModel_1.$aV.containsRTL(lineContent, isBasicASCII, model.mightContainRTL());
            const r = (0, viewLineRenderer_1.$WW)(new viewLineRenderer_1.$QW((fontInfo.isMonospace && !options.get(33 /* EditorOption.disableMonospaceOptimizations */)), fontInfo.canUseHalfwidthRightwardsArrow, lineContent, false, isBasicASCII, containsRTL, 0, lineTokens, [], tabSize, 0, fontInfo.spaceWidth, fontInfo.middotWidth, fontInfo.wsmiddotWidth, options.get(116 /* EditorOption.stopRenderingLineAfter */), options.get(98 /* EditorOption.renderWhitespace */), options.get(93 /* EditorOption.renderControlCharacters */), options.get(51 /* EditorOption.fontLigatures */) !== editorOptions_1.EditorFontLigatures.OFF, null));
            return r.html;
        }
    };
    View = __decorate([
        __param(5, language_1.$ct)
    ], View);
});
//# sourceMappingURL=accessibleDiffViewer.js.map