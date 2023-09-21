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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/trustedTypes", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/themables", "vs/editor/browser/config/domFontInfo", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/config/editorOptions", "vs/editor/common/core/lineRange", "vs/editor/common/core/offsetRange", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/diff/rangeMapping", "vs/editor/common/languages/language", "vs/editor/common/tokens/lineTokens", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/common/viewModel", "vs/nls", "vs/platform/audioCues/browser/audioCueService", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/iconRegistry", "vs/css!./accessibleDiffViewer"], function (require, exports, dom_1, trustedTypes_1, actionbar_1, scrollableElement_1, actions_1, arrays_1, codicons_1, lifecycle_1, observable_1, themables_1, domFontInfo_1, utils_1, editorOptions_1, lineRange_1, offsetRange_1, position_1, range_1, rangeMapping_1, language_1, lineTokens_1, viewLineRenderer_1, viewModel_1, nls_1, audioCueService_1, instantiation_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AccessibleDiffViewer = void 0;
    const accessibleDiffViewerInsertIcon = (0, iconRegistry_1.registerIcon)('diff-review-insert', codicons_1.Codicon.add, (0, nls_1.localize)('accessibleDiffViewerInsertIcon', 'Icon for \'Insert\' in accessible diff viewer.'));
    const accessibleDiffViewerRemoveIcon = (0, iconRegistry_1.registerIcon)('diff-review-remove', codicons_1.Codicon.remove, (0, nls_1.localize)('accessibleDiffViewerRemoveIcon', 'Icon for \'Remove\' in accessible diff viewer.'));
    const accessibleDiffViewerCloseIcon = (0, iconRegistry_1.registerIcon)('diff-review-close', codicons_1.Codicon.close, (0, nls_1.localize)('accessibleDiffViewerCloseIcon', 'Icon for \'Close\' in accessible diff viewer.'));
    let AccessibleDiffViewer = class AccessibleDiffViewer extends lifecycle_1.Disposable {
        static { this._ttPolicy = (0, trustedTypes_1.createTrustedTypesPolicy)('diffReview', { createHTML: value => value }); }
        constructor(_parentNode, _visible, _setVisible, _canClose, _width, _height, _diffs, _editors, _instantiationService) {
            super();
            this._parentNode = _parentNode;
            this._visible = _visible;
            this._setVisible = _setVisible;
            this._canClose = _canClose;
            this._width = _width;
            this._height = _height;
            this._diffs = _diffs;
            this._editors = _editors;
            this._instantiationService = _instantiationService;
            this.model = (0, observable_1.derivedWithStore)(this, (reader, store) => {
                const visible = this._visible.read(reader);
                this._parentNode.style.visibility = visible ? 'visible' : 'hidden';
                if (!visible) {
                    return null;
                }
                const model = store.add(this._instantiationService.createInstance(ViewModel, this._diffs, this._editors, this._setVisible, this._canClose));
                const view = store.add(this._instantiationService.createInstance(View, this._parentNode, model, this._width, this._height, this._editors));
                return {
                    model,
                    view
                };
            });
            this._register((0, observable_1.recomputeInitiallyAndOnChange)(this.model));
        }
        next() {
            (0, observable_1.transaction)(tx => {
                const isVisible = this._visible.get();
                this._setVisible(true, tx);
                if (isVisible) {
                    this.model.get().model.nextGroup(tx);
                }
            });
        }
        prev() {
            (0, observable_1.transaction)(tx => {
                this._setVisible(true, tx);
                this.model.get().model.previousGroup(tx);
            });
        }
        close() {
            (0, observable_1.transaction)(tx => {
                this._setVisible(false, tx);
            });
        }
    };
    exports.AccessibleDiffViewer = AccessibleDiffViewer;
    exports.AccessibleDiffViewer = AccessibleDiffViewer = __decorate([
        __param(8, instantiation_1.IInstantiationService)
    ], AccessibleDiffViewer);
    let ViewModel = class ViewModel extends lifecycle_1.Disposable {
        constructor(_diffs, _editors, _setVisible, canClose, _audioCueService) {
            super();
            this._diffs = _diffs;
            this._editors = _editors;
            this._setVisible = _setVisible;
            this.canClose = canClose;
            this._audioCueService = _audioCueService;
            this._groups = (0, observable_1.observableValue)(this, []);
            this._currentGroupIdx = (0, observable_1.observableValue)(this, 0);
            this._currentElementIdx = (0, observable_1.observableValue)(this, 0);
            this.groups = this._groups;
            this.currentGroup = this._currentGroupIdx.map((idx, r) => this._groups.read(r)[idx]);
            this.currentGroupIndex = this._currentGroupIdx;
            this.currentElement = this._currentElementIdx.map((idx, r) => this.currentGroup.read(r)?.lines[idx]);
            this._register((0, observable_1.autorun)(reader => {
                /** @description update groups */
                const diffs = this._diffs.read(reader);
                if (!diffs) {
                    this._groups.set([], undefined);
                    return;
                }
                const groups = computeViewElementGroups(diffs, this._editors.original.getModel().getLineCount(), this._editors.modified.getModel().getLineCount());
                (0, observable_1.transaction)(tx => {
                    const p = this._editors.modified.getPosition();
                    if (p) {
                        const nextGroup = groups.findIndex(g => p?.lineNumber < g.range.modified.endLineNumberExclusive);
                        if (nextGroup !== -1) {
                            this._currentGroupIdx.set(nextGroup, tx);
                        }
                    }
                    this._groups.set(groups, tx);
                });
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description play audio-cue for diff */
                const currentViewItem = this.currentElement.read(reader);
                if (currentViewItem?.type === LineType.Deleted) {
                    this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineDeleted, { source: 'accessibleDiffViewer.currentElementChanged' });
                }
                else if (currentViewItem?.type === LineType.Added) {
                    this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineInserted, { source: 'accessibleDiffViewer.currentElementChanged' });
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description select lines in editor */
                // This ensures editor commands (like revert/stage) work
                const currentViewItem = this.currentElement.read(reader);
                if (currentViewItem && currentViewItem.type !== LineType.Header) {
                    const lineNumber = currentViewItem.modifiedLineNumber ?? currentViewItem.diff.modified.startLineNumber;
                    this._editors.modified.setSelection(range_1.Range.fromPositions(new position_1.Position(lineNumber, 1)));
                }
            }));
        }
        _goToGroupDelta(delta, tx) {
            const groups = this.groups.get();
            if (!groups || groups.length <= 1) {
                return;
            }
            (0, observable_1.subtransaction)(tx, tx => {
                this._currentGroupIdx.set(offsetRange_1.OffsetRange.ofLength(groups.length).clipCyclic(this._currentGroupIdx.get() + delta), tx);
                this._currentElementIdx.set(0, tx);
            });
        }
        nextGroup(tx) { this._goToGroupDelta(1, tx); }
        previousGroup(tx) { this._goToGroupDelta(-1, tx); }
        _goToLineDelta(delta) {
            const group = this.currentGroup.get();
            if (!group || group.lines.length <= 1) {
                return;
            }
            (0, observable_1.transaction)(tx => {
                this._currentElementIdx.set(offsetRange_1.OffsetRange.ofLength(group.lines.length).clip(this._currentElementIdx.get() + delta), tx);
            });
        }
        goToNextLine() { this._goToLineDelta(1); }
        goToPreviousLine() { this._goToLineDelta(-1); }
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
                this._currentElementIdx.set(idx, tx);
            });
        }
        revealCurrentElementInEditor() {
            this._setVisible(false, undefined);
            const curElem = this.currentElement.get();
            if (curElem) {
                if (curElem.type === LineType.Deleted) {
                    this._editors.original.setSelection(range_1.Range.fromPositions(new position_1.Position(curElem.originalLineNumber, 1)));
                    this._editors.original.revealLine(curElem.originalLineNumber);
                    this._editors.original.focus();
                }
                else {
                    if (curElem.type !== LineType.Header) {
                        this._editors.modified.setSelection(range_1.Range.fromPositions(new position_1.Position(curElem.modifiedLineNumber, 1)));
                        this._editors.modified.revealLine(curElem.modifiedLineNumber);
                    }
                    this._editors.modified.focus();
                }
            }
        }
        close() {
            this._setVisible(false, undefined);
            this._editors.modified.focus();
        }
    };
    ViewModel = __decorate([
        __param(4, audioCueService_1.IAudioCueService)
    ], ViewModel);
    const viewElementGroupLineMargin = 3;
    function computeViewElementGroups(diffs, originalLineCount, modifiedLineCount) {
        const result = [];
        for (const g of (0, arrays_1.groupAdjacentBy)(diffs, (a, b) => (b.modified.startLineNumber - a.modified.endLineNumberExclusive < 2 * viewElementGroupLineMargin))) {
            const viewElements = [];
            viewElements.push(new HeaderViewElement());
            const origFullRange = new lineRange_1.LineRange(Math.max(1, g[0].original.startLineNumber - viewElementGroupLineMargin), Math.min(g[g.length - 1].original.endLineNumberExclusive + viewElementGroupLineMargin, originalLineCount + 1));
            const modifiedFullRange = new lineRange_1.LineRange(Math.max(1, g[0].modified.startLineNumber - viewElementGroupLineMargin), Math.min(g[g.length - 1].modified.endLineNumberExclusive + viewElementGroupLineMargin, modifiedLineCount + 1));
            (0, arrays_1.forEachAdjacent)(g, (a, b) => {
                const origRange = new lineRange_1.LineRange(a ? a.original.endLineNumberExclusive : origFullRange.startLineNumber, b ? b.original.startLineNumber : origFullRange.endLineNumberExclusive);
                const modifiedRange = new lineRange_1.LineRange(a ? a.modified.endLineNumberExclusive : modifiedFullRange.startLineNumber, b ? b.modified.startLineNumber : modifiedFullRange.endLineNumberExclusive);
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
            result.push(new ViewElementGroup(new rangeMapping_1.LineRangeMapping(modifiedRange, originalRange), viewElements));
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
    let View = class View extends lifecycle_1.Disposable {
        constructor(_element, _model, _width, _height, _editors, _languageService) {
            super();
            this._element = _element;
            this._model = _model;
            this._width = _width;
            this._height = _height;
            this._editors = _editors;
            this._languageService = _languageService;
            this.domNode = this._element;
            this.domNode.className = 'diff-review monaco-editor-background';
            const actionBarContainer = document.createElement('div');
            actionBarContainer.className = 'diff-review-actions';
            this._actionBar = this._register(new actionbar_1.ActionBar(actionBarContainer));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update actions */
                this._actionBar.clear();
                if (this._model.canClose.read(reader)) {
                    this._actionBar.push(new actions_1.Action('diffreview.close', (0, nls_1.localize)('label.close', "Close"), 'close-diff-review ' + themables_1.ThemeIcon.asClassName(accessibleDiffViewerCloseIcon), true, async () => _model.close()), { label: false, icon: true });
                }
            }));
            this._content = document.createElement('div');
            this._content.className = 'diff-review-content';
            this._content.setAttribute('role', 'code');
            this._scrollbar = this._register(new scrollableElement_1.DomScrollableElement(this._content, {}));
            (0, dom_1.reset)(this.domNode, this._scrollbar.getDomNode(), actionBarContainer);
            this._register((0, lifecycle_1.toDisposable)(() => { (0, dom_1.reset)(this.domNode); }));
            this._register((0, utils_1.applyStyle)(this.domNode, { width: this._width, height: this._height }));
            this._register((0, utils_1.applyStyle)(this._content, { width: this._width, height: this._height }));
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description render */
                this._model.currentGroup.read(reader);
                this._render(store);
            }));
            // TODO@hediet use commands
            this._register((0, dom_1.addStandardDisposableListener)(this.domNode, 'keydown', (e) => {
                if (e.equals(18 /* KeyCode.DownArrow */)
                    || e.equals(2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */)
                    || e.equals(512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */)) {
                    e.preventDefault();
                    this._model.goToNextLine();
                }
                if (e.equals(16 /* KeyCode.UpArrow */)
                    || e.equals(2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */)
                    || e.equals(512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */)) {
                    e.preventDefault();
                    this._model.goToPreviousLine();
                }
                if (e.equals(9 /* KeyCode.Escape */)
                    || e.equals(2048 /* KeyMod.CtrlCmd */ | 9 /* KeyCode.Escape */)
                    || e.equals(512 /* KeyMod.Alt */ | 9 /* KeyCode.Escape */)
                    || e.equals(1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */)) {
                    e.preventDefault();
                    this._model.close();
                }
                if (e.equals(10 /* KeyCode.Space */)
                    || e.equals(3 /* KeyCode.Enter */)) {
                    e.preventDefault();
                    this._model.revealCurrentElementInEditor();
                }
            }));
        }
        _render(store) {
            const originalOptions = this._editors.original.getOptions();
            const modifiedOptions = this._editors.modified.getOptions();
            const container = document.createElement('div');
            container.className = 'diff-review-table';
            container.setAttribute('role', 'list');
            container.setAttribute('aria-label', (0, nls_1.localize)('ariaLabel', 'Accessible Diff Viewer. Use arrow up and down to navigate.'));
            (0, domFontInfo_1.applyFontInfo)(container, modifiedOptions.get(50 /* EditorOption.fontInfo */));
            (0, dom_1.reset)(this._content, container);
            const originalModel = this._editors.original.getModel();
            const modifiedModel = this._editors.modified.getModel();
            if (!originalModel || !modifiedModel) {
                return;
            }
            const originalModelOpts = originalModel.getOptions();
            const modifiedModelOpts = modifiedModel.getOptions();
            const lineHeight = modifiedOptions.get(66 /* EditorOption.lineHeight */);
            const group = this._model.currentGroup.get();
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
                    const diffIndex = this._model.currentGroupIndex.get();
                    const diffsLength = this._model.groups.get().length;
                    const getAriaLines = (lines) => lines === 0 ? (0, nls_1.localize)('no_lines_changed', "no lines changed")
                        : lines === 1 ? (0, nls_1.localize)('one_line_changed', "1 line changed")
                            : (0, nls_1.localize)('more_lines_changed', "{0} lines changed", lines);
                    const originalChangedLinesCntAria = getAriaLines(r.original.length);
                    const modifiedChangedLinesCntAria = getAriaLines(r.modified.length);
                    header.setAttribute('aria-label', (0, nls_1.localize)({
                        key: 'header',
                        comment: [
                            'This is the ARIA label for a git diff header.',
                            'A git diff header looks like this: @@ -154,12 +159,39 @@.',
                            'That encodes that at original line 154 (which is now line 159), 12 lines were removed/changed with 39 lines.',
                            'Variables 0 and 1 refer to the diff index out of total number of diffs.',
                            'Variables 2 and 4 will be numbers (a line number).',
                            'Variables 3 and 5 will be "no lines changed", "1 line changed" or "X lines changed", localized separately.'
                        ]
                    }, "Difference {0} of {1}: original line {2}, {3}, modified line {4}, {5}", (diffIndex + 1), diffsLength, r.original.startLineNumber, originalChangedLinesCntAria, r.modified.startLineNumber, modifiedChangedLinesCntAria));
                    const cell = document.createElement('div');
                    cell.className = 'diff-review-cell diff-review-summary';
                    // e.g.: `1/10: @@ -504,7 +517,7 @@`
                    cell.appendChild(document.createTextNode(`${diffIndex + 1}/${diffsLength}: @@ -${r.original.startLineNumber},${r.original.length} +${r.modified.startLineNumber},${r.modified.length} @@`));
                    header.appendChild(cell);
                    row = header;
                }
                else {
                    row = this._createRow(viewItem, lineHeight, this._width.get(), originalOptions, originalModel, originalModelOpts, modifiedOptions, modifiedModel, modifiedModelOpts);
                }
                container.appendChild(row);
                const isSelectedObs = (0, observable_1.derived)(reader => /** @description isSelected */ this._model.currentElement.read(reader) === viewItem);
                store.add((0, observable_1.autorun)(reader => {
                    /** @description update tab index */
                    const isSelected = isSelectedObs.read(reader);
                    row.tabIndex = isSelected ? 0 : -1;
                    if (isSelected) {
                        row.focus();
                    }
                }));
                store.add((0, dom_1.addDisposableListener)(row, 'focus', () => {
                    this._model.goToLine(viewItem);
                }));
            }
            this._scrollbar.scanDomNode();
        }
        _createRow(item, lineHeight, width, originalOptions, originalModel, originalModelOpts, modifiedOptions, modifiedModel, modifiedModelOpts) {
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
                let html = this._getLineHtml(modifiedModel, modifiedOptions, modifiedModelOpts.tabSize, item.modifiedLineNumber, this._languageService.languageIdCodec);
                if (AccessibleDiffViewer._ttPolicy) {
                    html = AccessibleDiffViewer._ttPolicy.createHTML(html);
                }
                cell.insertAdjacentHTML('beforeend', html);
                lineContent = modifiedModel.getLineContent(item.modifiedLineNumber);
            }
            else {
                let html = this._getLineHtml(originalModel, originalOptions, originalModelOpts.tabSize, item.originalLineNumber, this._languageService.languageIdCodec);
                if (AccessibleDiffViewer._ttPolicy) {
                    html = AccessibleDiffViewer._ttPolicy.createHTML(html);
                }
                cell.insertAdjacentHTML('beforeend', html);
                lineContent = originalModel.getLineContent(item.originalLineNumber);
            }
            if (lineContent.length === 0) {
                lineContent = (0, nls_1.localize)('blankLine', "blank");
            }
            let ariaLabel = '';
            switch (item.type) {
                case LineType.Unchanged:
                    if (item.originalLineNumber === item.modifiedLineNumber) {
                        ariaLabel = (0, nls_1.localize)({ key: 'unchangedLine', comment: ['The placeholders are contents of the line and should not be translated.'] }, "{0} unchanged line {1}", lineContent, item.originalLineNumber);
                    }
                    else {
                        ariaLabel = (0, nls_1.localize)('equalLine', "{0} original line {1} modified line {2}", lineContent, item.originalLineNumber, item.modifiedLineNumber);
                    }
                    break;
                case LineType.Added:
                    ariaLabel = (0, nls_1.localize)('insertLine', "+ {0} modified line {1}", lineContent, item.modifiedLineNumber);
                    break;
                case LineType.Deleted:
                    ariaLabel = (0, nls_1.localize)('deleteLine', "- {0} original line {1}", lineContent, item.originalLineNumber);
                    break;
            }
            row.setAttribute('aria-label', ariaLabel);
            return row;
        }
        _getLineHtml(model, options, tabSize, lineNumber, languageIdCodec) {
            const lineContent = model.getLineContent(lineNumber);
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const lineTokens = lineTokens_1.LineTokens.createEmpty(lineContent, languageIdCodec);
            const isBasicASCII = viewModel_1.ViewLineRenderingData.isBasicASCII(lineContent, model.mightContainNonBasicASCII());
            const containsRTL = viewModel_1.ViewLineRenderingData.containsRTL(lineContent, isBasicASCII, model.mightContainRTL());
            const r = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput((fontInfo.isMonospace && !options.get(33 /* EditorOption.disableMonospaceOptimizations */)), fontInfo.canUseHalfwidthRightwardsArrow, lineContent, false, isBasicASCII, containsRTL, 0, lineTokens, [], tabSize, 0, fontInfo.spaceWidth, fontInfo.middotWidth, fontInfo.wsmiddotWidth, options.get(116 /* EditorOption.stopRenderingLineAfter */), options.get(98 /* EditorOption.renderWhitespace */), options.get(93 /* EditorOption.renderControlCharacters */), options.get(51 /* EditorOption.fontLigatures */) !== editorOptions_1.EditorFontLigatures.OFF, null));
            return r.html;
        }
    };
    View = __decorate([
        __param(5, language_1.ILanguageService)
    ], View);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJsZURpZmZWaWV3ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvZGlmZkVkaXRvci9hY2Nlc3NpYmxlRGlmZlZpZXdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQ2hHLE1BQU0sOEJBQThCLEdBQUcsSUFBQSwyQkFBWSxFQUFDLG9CQUFvQixFQUFFLGtCQUFPLENBQUMsR0FBRyxFQUFFLElBQUEsY0FBUSxFQUFDLGdDQUFnQyxFQUFFLGdEQUFnRCxDQUFDLENBQUMsQ0FBQztJQUNyTCxNQUFNLDhCQUE4QixHQUFHLElBQUEsMkJBQVksRUFBQyxvQkFBb0IsRUFBRSxrQkFBTyxDQUFDLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxnQ0FBZ0MsRUFBRSxnREFBZ0QsQ0FBQyxDQUFDLENBQUM7SUFDeEwsTUFBTSw2QkFBNkIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsbUJBQW1CLEVBQUUsa0JBQU8sQ0FBQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsK0JBQStCLEVBQUUsK0NBQStDLENBQUMsQ0FBQyxDQUFDO0lBRTVLLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsc0JBQVU7aUJBQ3JDLGNBQVMsR0FBRyxJQUFBLHVDQUF3QixFQUFDLFlBQVksRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEFBQXpFLENBQTBFO1FBRWpHLFlBQ2tCLFdBQXdCLEVBQ3hCLFFBQThCLEVBQzlCLFdBQXFFLEVBQ3JFLFNBQStCLEVBQy9CLE1BQTJCLEVBQzNCLE9BQTRCLEVBQzVCLE1BQTJELEVBQzNELFFBQTJCLEVBQ3JCLHFCQUE2RDtZQUVwRixLQUFLLEVBQUUsQ0FBQztZQVZTLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ3hC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