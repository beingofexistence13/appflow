/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/model/textModelSearch", "vs/workbench/contrib/codeEditor/browser/toggleWordWrap", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookOptions"], function (require, exports, event_1, lifecycle_1, mime_1, range_1, selection_1, textModelSearch_1, toggleWordWrap_1, notebookBrowser_1, notebookOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Pnb = void 0;
    class $Pnb extends lifecycle_1.$kc {
        get handle() {
            return this.model.handle;
        }
        get uri() {
            return this.model.uri;
        }
        get lineCount() {
            return this.model.textBuffer.getLineCount();
        }
        get metadata() {
            return this.model.metadata;
        }
        get internalMetadata() {
            return this.model.internalMetadata;
        }
        get language() {
            return this.model.language;
        }
        get mime() {
            if (typeof this.model.mime === 'string') {
                return this.model.mime;
            }
            switch (this.language) {
                case 'markdown':
                    return mime_1.$Hr.markdown;
                default:
                    return mime_1.$Hr.text;
            }
        }
        get lineNumbers() {
            return this.f;
        }
        set lineNumbers(lineNumbers) {
            if (lineNumbers === this.f) {
                return;
            }
            this.f = lineNumbers;
            this.b.fire({ cellLineNumberChanged: true });
        }
        get focusMode() {
            return this.g;
        }
        set focusMode(newMode) {
            if (this.g !== newMode) {
                this.g = newMode;
                this.b.fire({ focusModeChanged: true });
            }
        }
        get editorAttached() {
            return !!this.h;
        }
        get textModel() {
            return this.model.textModel;
        }
        hasModel() {
            return !!this.textModel;
        }
        get dragging() {
            return this.D;
        }
        set dragging(v) {
            this.D = v;
            this.b.fire({ dragStateChanged: true });
        }
        get isInputCollapsed() {
            return this.G;
        }
        set isInputCollapsed(v) {
            this.G = v;
            this.b.fire({ inputCollapsedChanged: true });
        }
        get isOutputCollapsed() {
            return this.H;
        }
        set isOutputCollapsed(v) {
            this.H = v;
            this.b.fire({ outputCollapsedChanged: true });
        }
        constructor(viewType, model, id, J, L, M, N, O) {
            super();
            this.viewType = viewType;
            this.model = model;
            this.id = id;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.a = this.B(new event_1.$fd());
            // Do not merge this event with `onDidChangeState` as we are using `Event.once(onDidChangeEditorAttachState)` elsewhere.
            this.onDidChangeEditorAttachState = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeState = this.b.event;
            this.c = notebookBrowser_1.CellEditState.Preview;
            this.f = 'inherit';
            this.g = notebookBrowser_1.CellFocusMode.Container;
            this.j = [];
            this.m = null;
            this.n = null;
            this.r = new Map();
            this.t = this.B(new event_1.$fd());
            this.onCellDecorationsChanged = this.t.event;
            this.u = new Map();
            this.w = 0;
            this.y = new Map();
            this.z = this.B(new event_1.$fd());
            this.onDidChangeCellStatusBarItems = this.z.event;
            this.C = 0;
            this.D = false;
            this.G = false;
            this.H = false;
            this.I = false;
            this.W = '';
            this.B(model.onDidChangeMetadata(() => {
                this.b.fire({ metadataChanged: true });
            }));
            this.B(model.onDidChangeInternalMetadata(e => {
                this.b.fire({ internalMetadataChanged: true });
                if (e.lastRunSuccessChanged) {
                    // Statusbar visibility may change
                    this.layoutChange({});
                }
            }));
            this.B(this.L.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('notebook.lineNumbers')) {
                    this.lineNumbers = 'inherit';
                }
            }));
            if (this.model.collapseState?.inputCollapsed) {
                this.G = true;
            }
            if (this.model.collapseState?.outputCollapsed) {
                this.H = true;
            }
        }
        assertTextModelAttached() {
            if (this.textModel && this.h && this.h.getModel() === this.textModel) {
                return true;
            }
            return false;
        }
        // private handleKeyDown(e: IKeyboardEvent) {
        // 	if (this.viewType === IPYNB_VIEW_TYPE && isWindows && e.ctrlKey && e.keyCode === KeyCode.Enter) {
        // 		this._keymapService.promptKeymapRecommendation();
        // 	}
        // }
        attachTextEditor(editor, estimatedHasHorizontalScrolling) {
            if (!editor.hasModel()) {
                throw new Error('Invalid editor: model is missing');
            }
            if (this.h === editor) {
                if (this.j.length === 0) {
                    this.j.push(this.h.onDidChangeCursorSelection(() => { this.b.fire({ selectionChanged: true }); }));
                    // this._editorListeners.push(this._textEditor.onKeyDown(e => this.handleKeyDown(e)));
                    this.b.fire({ selectionChanged: true });
                }
                return;
            }
            this.h = editor;
            if (this.m) {
                this.R(this.m);
            }
            else {
                // If no real editor view state was persisted, restore a default state.
                // This forces the editor to measure its content width immediately.
                if (estimatedHasHorizontalScrolling) {
                    this.R({
                        contributionsState: {},
                        cursorState: [],
                        viewState: {
                            scrollLeft: 0,
                            firstPosition: { lineNumber: 1, column: 1 },
                            firstPositionDeltaTop: (0, notebookOptions_1.$Ebb)()
                        }
                    });
                }
            }
            if (this.n) {
                (0, toggleWordWrap_1.$Nnb)(editor.getModel(), this.n, this.O);
            }
            this.h?.changeDecorations((accessor) => {
                this.u.forEach((value, key) => {
                    if (key.startsWith('_lazy_')) {
                        // lazy ones
                        const ret = accessor.addDecoration(value.options.range, value.options.options);
                        this.u.get(key).id = ret;
                    }
                    else {
                        const ret = accessor.addDecoration(value.options.range, value.options.options);
                        this.u.get(key).id = ret;
                    }
                });
            });
            this.j.push(this.h.onDidChangeCursorSelection(() => { this.b.fire({ selectionChanged: true }); }));
            // this._editorListeners.push(this._textEditor.onKeyDown(e => this.handleKeyDown(e)));
            this.b.fire({ selectionChanged: true });
            this.a.fire();
        }
        detachTextEditor() {
            this.P();
            this.Q();
            // decorations need to be cleared first as editors can be resued.
            this.h?.changeDecorations((accessor) => {
                this.u.forEach(value => {
                    const resolvedid = value.id;
                    if (resolvedid) {
                        accessor.removeDecoration(resolvedid);
                    }
                });
            });
            this.h = undefined;
            (0, lifecycle_1.$fc)(this.j);
            this.j = [];
            this.a.fire();
            if (this.F) {
                this.F.dispose();
                this.F = undefined;
            }
        }
        getText() {
            return this.model.getValue();
        }
        getTextLength() {
            return this.model.getTextLength();
        }
        P() {
            if (!this.h) {
                return;
            }
            this.m = this.h.saveViewState();
        }
        Q() {
            if (!this.h || !this.h.hasModel()) {
                return;
            }
            this.n = (0, toggleWordWrap_1.$Onb)(this.h.getModel(), this.O);
        }
        saveEditorViewState() {
            if (this.h) {
                this.m = this.h.saveViewState();
            }
            return this.m;
        }
        restoreEditorViewState(editorViewStates, totalHeight) {
            this.m = editorViewStates;
        }
        R(state) {
            if (state) {
                this.h?.restoreViewState(state);
            }
        }
        addModelDecoration(decoration) {
            if (!this.h) {
                const id = ++this.w;
                const decorationId = `_lazy_${this.id};${id}`;
                this.u.set(decorationId, { options: decoration });
                return decorationId;
            }
            let id;
            this.h.changeDecorations((accessor) => {
                id = accessor.addDecoration(decoration.range, decoration.options);
                this.u.set(id, { id, options: decoration });
            });
            return id;
        }
        removeModelDecoration(decorationId) {
            const realDecorationId = this.u.get(decorationId);
            if (this.h && realDecorationId && realDecorationId.id !== undefined) {
                this.h.changeDecorations((accessor) => {
                    accessor.removeDecoration(realDecorationId.id);
                });
            }
            // lastly, remove all the cache
            this.u.delete(decorationId);
        }
        deltaModelDecorations(oldDecorations, newDecorations) {
            oldDecorations.forEach(id => {
                this.removeModelDecoration(id);
            });
            const ret = newDecorations.map(option => {
                return this.addModelDecoration(option);
            });
            return ret;
        }
        S(decorationId) {
            const options = this.r.get(decorationId);
            if (options) {
                this.t.fire({ added: [], removed: [options] });
                this.r.delete(decorationId);
            }
        }
        U(options) {
            const id = ++this.w;
            const decorationId = `_cell_${this.id};${id}`;
            this.r.set(decorationId, options);
            this.t.fire({ added: [options], removed: [] });
            return decorationId;
        }
        getCellDecorations() {
            return [...this.r.values()];
        }
        getCellDecorationRange(decorationId) {
            if (this.h) {
                // (this._textEditor as CodeEditorWidget).decora
                return this.h.getModel()?.getDecorationRange(decorationId) ?? null;
            }
            return null;
        }
        deltaCellDecorations(oldDecorations, newDecorations) {
            oldDecorations.forEach(id => {
                this.S(id);
            });
            const ret = newDecorations.map(option => {
                return this.U(option);
            });
            return ret;
        }
        deltaCellStatusBarItems(oldItems, newItems) {
            oldItems.forEach(id => {
                const item = this.y.get(id);
                if (item) {
                    this.y.delete(id);
                }
            });
            const newIds = newItems.map(item => {
                const id = ++this.C;
                const itemId = `_cell_${this.id};${id}`;
                this.y.set(itemId, item);
                return itemId;
            });
            this.z.fire();
            return newIds;
        }
        getCellStatusBarItems() {
            return Array.from(this.y.values());
        }
        revealRangeInCenter(range) {
            this.h?.revealRangeInCenter(range, 1 /* editorCommon.ScrollType.Immediate */);
        }
        setSelection(range) {
            this.h?.setSelection(range);
        }
        setSelections(selections) {
            if (selections.length) {
                this.h?.setSelections(selections);
            }
        }
        getSelections() {
            return this.h?.getSelections() || [];
        }
        getSelectionsStartPosition() {
            if (this.h) {
                const selections = this.h.getSelections();
                return selections?.map(s => s.getStartPosition());
            }
            else {
                const selections = this.m?.cursorState;
                return selections?.map(s => s.selectionStart);
            }
        }
        getLineScrollTopOffset(line) {
            if (!this.h) {
                return 0;
            }
            const editorPadding = this.J.notebookOptions.computeEditorPadding(this.internalMetadata, this.uri);
            return this.h.getTopForLineNumber(line) + editorPadding.top;
        }
        getPositionScrollTopOffset(range) {
            if (!this.h) {
                return 0;
            }
            const position = range instanceof selection_1.$ms ? range.getPosition() : range.getStartPosition();
            const editorPadding = this.J.notebookOptions.computeEditorPadding(this.internalMetadata, this.uri);
            return this.h.getTopForPosition(position.lineNumber, position.column) + editorPadding.top;
        }
        cursorAtLineBoundary() {
            if (!this.h || !this.textModel || !this.h.hasTextFocus()) {
                return notebookBrowser_1.CursorAtLineBoundary.None;
            }
            const selection = this.h.getSelection();
            if (!selection || !selection.isEmpty()) {
                return notebookBrowser_1.CursorAtLineBoundary.None;
            }
            const currentLineLength = this.textModel.getLineLength(selection.startLineNumber);
            if (currentLineLength === 0) {
                return notebookBrowser_1.CursorAtLineBoundary.Both;
            }
            switch (selection.startColumn) {
                case 1:
                    return notebookBrowser_1.CursorAtLineBoundary.Start;
                case currentLineLength + 1:
                    return notebookBrowser_1.CursorAtLineBoundary.End;
                default:
                    return notebookBrowser_1.CursorAtLineBoundary.None;
            }
        }
        cursorAtBoundary() {
            if (!this.h) {
                return notebookBrowser_1.CursorAtBoundary.None;
            }
            if (!this.textModel) {
                return notebookBrowser_1.CursorAtBoundary.None;
            }
            // only validate primary cursor
            const selection = this.h.getSelection();
            // only validate empty cursor
            if (!selection || !selection.isEmpty()) {
                return notebookBrowser_1.CursorAtBoundary.None;
            }
            const firstViewLineTop = this.h.getTopForPosition(1, 1);
            const lastViewLineTop = this.h.getTopForPosition(this.textModel.getLineCount(), this.textModel.getLineLength(this.textModel.getLineCount()));
            const selectionTop = this.h.getTopForPosition(selection.startLineNumber, selection.startColumn);
            if (selectionTop === lastViewLineTop) {
                if (selectionTop === firstViewLineTop) {
                    return notebookBrowser_1.CursorAtBoundary.Both;
                }
                else {
                    return notebookBrowser_1.CursorAtBoundary.Bottom;
                }
            }
            else {
                if (selectionTop === firstViewLineTop) {
                    return notebookBrowser_1.CursorAtBoundary.Top;
                }
                else {
                    return notebookBrowser_1.CursorAtBoundary.None;
                }
            }
        }
        get editStateSource() {
            return this.W;
        }
        updateEditState(newState, source) {
            this.W = source;
            if (newState === this.c) {
                return;
            }
            this.c = newState;
            this.b.fire({ editStateChanged: true });
            if (this.c === notebookBrowser_1.CellEditState.Preview) {
                this.focusMode = notebookBrowser_1.CellFocusMode.Container;
            }
        }
        getEditState() {
            return this.c;
        }
        get textBuffer() {
            return this.model.textBuffer;
        }
        /**
         * Text model is used for editing.
         */
        async resolveTextModel() {
            if (!this.F || !this.textModel) {
                this.F = await this.M.createModelReference(this.uri);
                if (this.I) {
                    return this.textModel;
                }
                if (!this.F) {
                    throw new Error(`Cannot resolve text model for ${this.uri}`);
                }
                this.B(this.textModel.onDidChangeContent(() => this.X()));
            }
            return this.textModel;
        }
        Y(value, options) {
            let cellMatches = [];
            if (this.assertTextModelAttached()) {
                cellMatches = this.textModel.findMatches(value, false, options.regex || false, options.caseSensitive || false, options.wholeWord ? options.wordSeparators || null : null, options.regex || false);
            }
            else {
                const lineCount = this.textBuffer.getLineCount();
                const fullRange = new range_1.$ks(1, 1, lineCount, this.textBuffer.getLineLength(lineCount) + 1);
                const searchParams = new textModelSearch_1.$hC(value, options.regex || false, options.caseSensitive || false, options.wholeWord ? options.wordSeparators || null : null);
                const searchData = searchParams.parseSearchRequest();
                if (!searchData) {
                    return null;
                }
                cellMatches = this.textBuffer.findMatchesLineByLine(fullRange, searchData, options.regex || false, 1000);
            }
            return cellMatches;
        }
        dispose() {
            this.I = true;
            super.dispose();
            (0, lifecycle_1.$fc)(this.j);
            // Only remove the undo redo stack if we map this cell uri to itself
            // If we are not in perCell mode, it will map to the full NotebookDocument and
            // we don't want to remove that entire document undo / redo stack when a cell is deleted
            if (this.N.getUriComparisonKey(this.uri) === this.uri.toString()) {
                this.N.removeElements(this.uri);
            }
            this.F?.dispose();
        }
        toJSON() {
            return {
                handle: this.handle
            };
        }
    }
    exports.$Pnb = $Pnb;
});
//# sourceMappingURL=baseCellViewModel.js.map