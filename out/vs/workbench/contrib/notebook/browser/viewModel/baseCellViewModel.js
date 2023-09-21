/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/model/textModelSearch", "vs/workbench/contrib/codeEditor/browser/toggleWordWrap", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookOptions"], function (require, exports, event_1, lifecycle_1, mime_1, range_1, selection_1, textModelSearch_1, toggleWordWrap_1, notebookBrowser_1, notebookOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseCellViewModel = void 0;
    class BaseCellViewModel extends lifecycle_1.Disposable {
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
                    return mime_1.Mimes.markdown;
                default:
                    return mime_1.Mimes.text;
            }
        }
        get lineNumbers() {
            return this._lineNumbers;
        }
        set lineNumbers(lineNumbers) {
            if (lineNumbers === this._lineNumbers) {
                return;
            }
            this._lineNumbers = lineNumbers;
            this._onDidChangeState.fire({ cellLineNumberChanged: true });
        }
        get focusMode() {
            return this._focusMode;
        }
        set focusMode(newMode) {
            if (this._focusMode !== newMode) {
                this._focusMode = newMode;
                this._onDidChangeState.fire({ focusModeChanged: true });
            }
        }
        get editorAttached() {
            return !!this._textEditor;
        }
        get textModel() {
            return this.model.textModel;
        }
        hasModel() {
            return !!this.textModel;
        }
        get dragging() {
            return this._dragging;
        }
        set dragging(v) {
            this._dragging = v;
            this._onDidChangeState.fire({ dragStateChanged: true });
        }
        get isInputCollapsed() {
            return this._inputCollapsed;
        }
        set isInputCollapsed(v) {
            this._inputCollapsed = v;
            this._onDidChangeState.fire({ inputCollapsedChanged: true });
        }
        get isOutputCollapsed() {
            return this._outputCollapsed;
        }
        set isOutputCollapsed(v) {
            this._outputCollapsed = v;
            this._onDidChangeState.fire({ outputCollapsedChanged: true });
        }
        constructor(viewType, model, id, _viewContext, _configurationService, _modelService, _undoRedoService, _codeEditorService) {
            super();
            this.viewType = viewType;
            this.model = model;
            this.id = id;
            this._viewContext = _viewContext;
            this._configurationService = _configurationService;
            this._modelService = _modelService;
            this._undoRedoService = _undoRedoService;
            this._codeEditorService = _codeEditorService;
            this._onDidChangeEditorAttachState = this._register(new event_1.Emitter());
            // Do not merge this event with `onDidChangeState` as we are using `Event.once(onDidChangeEditorAttachState)` elsewhere.
            this.onDidChangeEditorAttachState = this._onDidChangeEditorAttachState.event;
            this._onDidChangeState = this._register(new event_1.Emitter());
            this.onDidChangeState = this._onDidChangeState.event;
            this._editState = notebookBrowser_1.CellEditState.Preview;
            this._lineNumbers = 'inherit';
            this._focusMode = notebookBrowser_1.CellFocusMode.Container;
            this._editorListeners = [];
            this._editorViewStates = null;
            this._editorTransientState = null;
            this._resolvedCellDecorations = new Map();
            this._cellDecorationsChanged = this._register(new event_1.Emitter());
            this.onCellDecorationsChanged = this._cellDecorationsChanged.event;
            this._resolvedDecorations = new Map();
            this._lastDecorationId = 0;
            this._cellStatusBarItems = new Map();
            this._onDidChangeCellStatusBarItems = this._register(new event_1.Emitter());
            this.onDidChangeCellStatusBarItems = this._onDidChangeCellStatusBarItems.event;
            this._lastStatusBarId = 0;
            this._dragging = false;
            this._inputCollapsed = false;
            this._outputCollapsed = false;
            this._isDisposed = false;
            this._editStateSource = '';
            this._register(model.onDidChangeMetadata(() => {
                this._onDidChangeState.fire({ metadataChanged: true });
            }));
            this._register(model.onDidChangeInternalMetadata(e => {
                this._onDidChangeState.fire({ internalMetadataChanged: true });
                if (e.lastRunSuccessChanged) {
                    // Statusbar visibility may change
                    this.layoutChange({});
                }
            }));
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('notebook.lineNumbers')) {
                    this.lineNumbers = 'inherit';
                }
            }));
            if (this.model.collapseState?.inputCollapsed) {
                this._inputCollapsed = true;
            }
            if (this.model.collapseState?.outputCollapsed) {
                this._outputCollapsed = true;
            }
        }
        assertTextModelAttached() {
            if (this.textModel && this._textEditor && this._textEditor.getModel() === this.textModel) {
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
            if (this._textEditor === editor) {
                if (this._editorListeners.length === 0) {
                    this._editorListeners.push(this._textEditor.onDidChangeCursorSelection(() => { this._onDidChangeState.fire({ selectionChanged: true }); }));
                    // this._editorListeners.push(this._textEditor.onKeyDown(e => this.handleKeyDown(e)));
                    this._onDidChangeState.fire({ selectionChanged: true });
                }
                return;
            }
            this._textEditor = editor;
            if (this._editorViewStates) {
                this._restoreViewState(this._editorViewStates);
            }
            else {
                // If no real editor view state was persisted, restore a default state.
                // This forces the editor to measure its content width immediately.
                if (estimatedHasHorizontalScrolling) {
                    this._restoreViewState({
                        contributionsState: {},
                        cursorState: [],
                        viewState: {
                            scrollLeft: 0,
                            firstPosition: { lineNumber: 1, column: 1 },
                            firstPositionDeltaTop: (0, notebookOptions_1.getEditorTopPadding)()
                        }
                    });
                }
            }
            if (this._editorTransientState) {
                (0, toggleWordWrap_1.writeTransientState)(editor.getModel(), this._editorTransientState, this._codeEditorService);
            }
            this._textEditor?.changeDecorations((accessor) => {
                this._resolvedDecorations.forEach((value, key) => {
                    if (key.startsWith('_lazy_')) {
                        // lazy ones
                        const ret = accessor.addDecoration(value.options.range, value.options.options);
                        this._resolvedDecorations.get(key).id = ret;
                    }
                    else {
                        const ret = accessor.addDecoration(value.options.range, value.options.options);
                        this._resolvedDecorations.get(key).id = ret;
                    }
                });
            });
            this._editorListeners.push(this._textEditor.onDidChangeCursorSelection(() => { this._onDidChangeState.fire({ selectionChanged: true }); }));
            // this._editorListeners.push(this._textEditor.onKeyDown(e => this.handleKeyDown(e)));
            this._onDidChangeState.fire({ selectionChanged: true });
            this._onDidChangeEditorAttachState.fire();
        }
        detachTextEditor() {
            this.saveViewState();
            this.saveTransientState();
            // decorations need to be cleared first as editors can be resued.
            this._textEditor?.changeDecorations((accessor) => {
                this._resolvedDecorations.forEach(value => {
                    const resolvedid = value.id;
                    if (resolvedid) {
                        accessor.removeDecoration(resolvedid);
                    }
                });
            });
            this._textEditor = undefined;
            (0, lifecycle_1.dispose)(this._editorListeners);
            this._editorListeners = [];
            this._onDidChangeEditorAttachState.fire();
            if (this._textModelRef) {
                this._textModelRef.dispose();
                this._textModelRef = undefined;
            }
        }
        getText() {
            return this.model.getValue();
        }
        getTextLength() {
            return this.model.getTextLength();
        }
        saveViewState() {
            if (!this._textEditor) {
                return;
            }
            this._editorViewStates = this._textEditor.saveViewState();
        }
        saveTransientState() {
            if (!this._textEditor || !this._textEditor.hasModel()) {
                return;
            }
            this._editorTransientState = (0, toggleWordWrap_1.readTransientState)(this._textEditor.getModel(), this._codeEditorService);
        }
        saveEditorViewState() {
            if (this._textEditor) {
                this._editorViewStates = this._textEditor.saveViewState();
            }
            return this._editorViewStates;
        }
        restoreEditorViewState(editorViewStates, totalHeight) {
            this._editorViewStates = editorViewStates;
        }
        _restoreViewState(state) {
            if (state) {
                this._textEditor?.restoreViewState(state);
            }
        }
        addModelDecoration(decoration) {
            if (!this._textEditor) {
                const id = ++this._lastDecorationId;
                const decorationId = `_lazy_${this.id};${id}`;
                this._resolvedDecorations.set(decorationId, { options: decoration });
                return decorationId;
            }
            let id;
            this._textEditor.changeDecorations((accessor) => {
                id = accessor.addDecoration(decoration.range, decoration.options);
                this._resolvedDecorations.set(id, { id, options: decoration });
            });
            return id;
        }
        removeModelDecoration(decorationId) {
            const realDecorationId = this._resolvedDecorations.get(decorationId);
            if (this._textEditor && realDecorationId && realDecorationId.id !== undefined) {
                this._textEditor.changeDecorations((accessor) => {
                    accessor.removeDecoration(realDecorationId.id);
                });
            }
            // lastly, remove all the cache
            this._resolvedDecorations.delete(decorationId);
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
        _removeCellDecoration(decorationId) {
            const options = this._resolvedCellDecorations.get(decorationId);
            if (options) {
                this._cellDecorationsChanged.fire({ added: [], removed: [options] });
                this._resolvedCellDecorations.delete(decorationId);
            }
        }
        _addCellDecoration(options) {
            const id = ++this._lastDecorationId;
            const decorationId = `_cell_${this.id};${id}`;
            this._resolvedCellDecorations.set(decorationId, options);
            this._cellDecorationsChanged.fire({ added: [options], removed: [] });
            return decorationId;
        }
        getCellDecorations() {
            return [...this._resolvedCellDecorations.values()];
        }
        getCellDecorationRange(decorationId) {
            if (this._textEditor) {
                // (this._textEditor as CodeEditorWidget).decora
                return this._textEditor.getModel()?.getDecorationRange(decorationId) ?? null;
            }
            return null;
        }
        deltaCellDecorations(oldDecorations, newDecorations) {
            oldDecorations.forEach(id => {
                this._removeCellDecoration(id);
            });
            const ret = newDecorations.map(option => {
                return this._addCellDecoration(option);
            });
            return ret;
        }
        deltaCellStatusBarItems(oldItems, newItems) {
            oldItems.forEach(id => {
                const item = this._cellStatusBarItems.get(id);
                if (item) {
                    this._cellStatusBarItems.delete(id);
                }
            });
            const newIds = newItems.map(item => {
                const id = ++this._lastStatusBarId;
                const itemId = `_cell_${this.id};${id}`;
                this._cellStatusBarItems.set(itemId, item);
                return itemId;
            });
            this._onDidChangeCellStatusBarItems.fire();
            return newIds;
        }
        getCellStatusBarItems() {
            return Array.from(this._cellStatusBarItems.values());
        }
        revealRangeInCenter(range) {
            this._textEditor?.revealRangeInCenter(range, 1 /* editorCommon.ScrollType.Immediate */);
        }
        setSelection(range) {
            this._textEditor?.setSelection(range);
        }
        setSelections(selections) {
            if (selections.length) {
                this._textEditor?.setSelections(selections);
            }
        }
        getSelections() {
            return this._textEditor?.getSelections() || [];
        }
        getSelectionsStartPosition() {
            if (this._textEditor) {
                const selections = this._textEditor.getSelections();
                return selections?.map(s => s.getStartPosition());
            }
            else {
                const selections = this._editorViewStates?.cursorState;
                return selections?.map(s => s.selectionStart);
            }
        }
        getLineScrollTopOffset(line) {
            if (!this._textEditor) {
                return 0;
            }
            const editorPadding = this._viewContext.notebookOptions.computeEditorPadding(this.internalMetadata, this.uri);
            return this._textEditor.getTopForLineNumber(line) + editorPadding.top;
        }
        getPositionScrollTopOffset(range) {
            if (!this._textEditor) {
                return 0;
            }
            const position = range instanceof selection_1.Selection ? range.getPosition() : range.getStartPosition();
            const editorPadding = this._viewContext.notebookOptions.computeEditorPadding(this.internalMetadata, this.uri);
            return this._textEditor.getTopForPosition(position.lineNumber, position.column) + editorPadding.top;
        }
        cursorAtLineBoundary() {
            if (!this._textEditor || !this.textModel || !this._textEditor.hasTextFocus()) {
                return notebookBrowser_1.CursorAtLineBoundary.None;
            }
            const selection = this._textEditor.getSelection();
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
            if (!this._textEditor) {
                return notebookBrowser_1.CursorAtBoundary.None;
            }
            if (!this.textModel) {
                return notebookBrowser_1.CursorAtBoundary.None;
            }
            // only validate primary cursor
            const selection = this._textEditor.getSelection();
            // only validate empty cursor
            if (!selection || !selection.isEmpty()) {
                return notebookBrowser_1.CursorAtBoundary.None;
            }
            const firstViewLineTop = this._textEditor.getTopForPosition(1, 1);
            const lastViewLineTop = this._textEditor.getTopForPosition(this.textModel.getLineCount(), this.textModel.getLineLength(this.textModel.getLineCount()));
            const selectionTop = this._textEditor.getTopForPosition(selection.startLineNumber, selection.startColumn);
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
            return this._editStateSource;
        }
        updateEditState(newState, source) {
            this._editStateSource = source;
            if (newState === this._editState) {
                return;
            }
            this._editState = newState;
            this._onDidChangeState.fire({ editStateChanged: true });
            if (this._editState === notebookBrowser_1.CellEditState.Preview) {
                this.focusMode = notebookBrowser_1.CellFocusMode.Container;
            }
        }
        getEditState() {
            return this._editState;
        }
        get textBuffer() {
            return this.model.textBuffer;
        }
        /**
         * Text model is used for editing.
         */
        async resolveTextModel() {
            if (!this._textModelRef || !this.textModel) {
                this._textModelRef = await this._modelService.createModelReference(this.uri);
                if (this._isDisposed) {
                    return this.textModel;
                }
                if (!this._textModelRef) {
                    throw new Error(`Cannot resolve text model for ${this.uri}`);
                }
                this._register(this.textModel.onDidChangeContent(() => this.onDidChangeTextModelContent()));
            }
            return this.textModel;
        }
        cellStartFind(value, options) {
            let cellMatches = [];
            if (this.assertTextModelAttached()) {
                cellMatches = this.textModel.findMatches(value, false, options.regex || false, options.caseSensitive || false, options.wholeWord ? options.wordSeparators || null : null, options.regex || false);
            }
            else {
                const lineCount = this.textBuffer.getLineCount();
                const fullRange = new range_1.Range(1, 1, lineCount, this.textBuffer.getLineLength(lineCount) + 1);
                const searchParams = new textModelSearch_1.SearchParams(value, options.regex || false, options.caseSensitive || false, options.wholeWord ? options.wordSeparators || null : null);
                const searchData = searchParams.parseSearchRequest();
                if (!searchData) {
                    return null;
                }
                cellMatches = this.textBuffer.findMatchesLineByLine(fullRange, searchData, options.regex || false, 1000);
            }
            return cellMatches;
        }
        dispose() {
            this._isDisposed = true;
            super.dispose();
            (0, lifecycle_1.dispose)(this._editorListeners);
            // Only remove the undo redo stack if we map this cell uri to itself
            // If we are not in perCell mode, it will map to the full NotebookDocument and
            // we don't want to remove that entire document undo / redo stack when a cell is deleted
            if (this._undoRedoService.getUriComparisonKey(this.uri) === this.uri.toString()) {
                this._undoRedoService.removeElements(this.uri);
            }
            this._textModelRef?.dispose();
        }
        toJSON() {
            return {
                handle: this.handle
            };
        }
    }
    exports.BaseCellViewModel = BaseCellViewModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZUNlbGxWaWV3TW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXdNb2RlbC9iYXNlQ2VsbFZpZXdNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF3QmhHLE1BQXNCLGlCQUFrQixTQUFRLHNCQUFVO1FBUXpELElBQUksTUFBTTtZQUNULE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDMUIsQ0FBQztRQUNELElBQUksR0FBRztZQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDdkIsQ0FBQztRQUNELElBQUksU0FBUztZQUNaLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDN0MsQ0FBQztRQUNELElBQUksUUFBUTtZQUNYLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFDNUIsQ0FBQztRQUNELElBQUksZ0JBQWdCO1lBQ25CLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztRQUNwQyxDQUFDO1FBQ0QsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUM1QixDQUFDO1FBRUQsSUFBSSxJQUFJO1lBQ1AsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtnQkFDeEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQzthQUN2QjtZQUVELFFBQVEsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDdEIsS0FBSyxVQUFVO29CQUNkLE9BQU8sWUFBSyxDQUFDLFFBQVEsQ0FBQztnQkFFdkI7b0JBQ0MsT0FBTyxZQUFLLENBQUMsSUFBSSxDQUFDO2FBQ25C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