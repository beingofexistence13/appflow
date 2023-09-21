/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/config/editorOptions", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/contrib/snippet/browser/snippetController2", "vs/workbench/api/common/extHost.protocol", "vs/base/common/arrays", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/contrib/snippet/browser/snippetParser"], function (require, exports, event_1, lifecycle_1, editorOptions_1, range_1, selection_1, snippetController2_1, extHost_protocol_1, arrays_1, editorState_1, snippetParser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadTextEditor = exports.MainThreadTextEditorProperties = void 0;
    class MainThreadTextEditorProperties {
        static readFromEditor(previousProperties, model, codeEditor) {
            const selections = MainThreadTextEditorProperties._readSelectionsFromCodeEditor(previousProperties, codeEditor);
            const options = MainThreadTextEditorProperties._readOptionsFromCodeEditor(previousProperties, model, codeEditor);
            const visibleRanges = MainThreadTextEditorProperties._readVisibleRangesFromCodeEditor(previousProperties, codeEditor);
            return new MainThreadTextEditorProperties(selections, options, visibleRanges);
        }
        static _readSelectionsFromCodeEditor(previousProperties, codeEditor) {
            let result = null;
            if (codeEditor) {
                result = codeEditor.getSelections();
            }
            if (!result && previousProperties) {
                result = previousProperties.selections;
            }
            if (!result) {
                result = [new selection_1.Selection(1, 1, 1, 1)];
            }
            return result;
        }
        static _readOptionsFromCodeEditor(previousProperties, model, codeEditor) {
            if (model.isDisposed()) {
                if (previousProperties) {
                    // shutdown time
                    return previousProperties.options;
                }
                else {
                    throw new Error('No valid properties');
                }
            }
            let cursorStyle;
            let lineNumbers;
            if (codeEditor) {
                const options = codeEditor.getOptions();
                const lineNumbersOpts = options.get(67 /* EditorOption.lineNumbers */);
                cursorStyle = options.get(28 /* EditorOption.cursorStyle */);
                lineNumbers = lineNumbersOpts.renderType;
            }
            else if (previousProperties) {
                cursorStyle = previousProperties.options.cursorStyle;
                lineNumbers = previousProperties.options.lineNumbers;
            }
            else {
                cursorStyle = editorOptions_1.TextEditorCursorStyle.Line;
                lineNumbers = 1 /* RenderLineNumbersType.On */;
            }
            const modelOptions = model.getOptions();
            return {
                insertSpaces: modelOptions.insertSpaces,
                tabSize: modelOptions.tabSize,
                indentSize: modelOptions.indentSize,
                cursorStyle: cursorStyle,
                lineNumbers: lineNumbers
            };
        }
        static _readVisibleRangesFromCodeEditor(previousProperties, codeEditor) {
            if (codeEditor) {
                return codeEditor.getVisibleRanges();
            }
            return [];
        }
        constructor(selections, options, visibleRanges) {
            this.selections = selections;
            this.options = options;
            this.visibleRanges = visibleRanges;
        }
        generateDelta(oldProps, selectionChangeSource) {
            const delta = {
                options: null,
                selections: null,
                visibleRanges: null
            };
            if (!oldProps || !MainThreadTextEditorProperties._selectionsEqual(oldProps.selections, this.selections)) {
                delta.selections = {
                    selections: this.selections,
                    source: selectionChangeSource ?? undefined,
                };
            }
            if (!oldProps || !MainThreadTextEditorProperties._optionsEqual(oldProps.options, this.options)) {
                delta.options = this.options;
            }
            if (!oldProps || !MainThreadTextEditorProperties._rangesEqual(oldProps.visibleRanges, this.visibleRanges)) {
                delta.visibleRanges = this.visibleRanges;
            }
            if (delta.selections || delta.options || delta.visibleRanges) {
                // something changed
                return delta;
            }
            // nothing changed
            return null;
        }
        static _selectionsEqual(a, b) {
            return (0, arrays_1.equals)(a, b, (aValue, bValue) => aValue.equalsSelection(bValue));
        }
        static _rangesEqual(a, b) {
            return (0, arrays_1.equals)(a, b, (aValue, bValue) => aValue.equalsRange(bValue));
        }
        static _optionsEqual(a, b) {
            if (a && !b || !a && b) {
                return false;
            }
            if (!a && !b) {
                return true;
            }
            return (a.tabSize === b.tabSize
                && a.indentSize === b.indentSize
                && a.insertSpaces === b.insertSpaces
                && a.cursorStyle === b.cursorStyle
                && a.lineNumbers === b.lineNumbers);
        }
    }
    exports.MainThreadTextEditorProperties = MainThreadTextEditorProperties;
    /**
     * Text Editor that is permanently bound to the same model.
     * It can be bound or not to a CodeEditor.
     */
    class MainThreadTextEditor {
        constructor(id, model, codeEditor, focusTracker, mainThreadDocuments, modelService, clipboardService) {
            this._modelListeners = new lifecycle_1.DisposableStore();
            this._codeEditorListeners = new lifecycle_1.DisposableStore();
            this._id = id;
            this._model = model;
            this._codeEditor = null;
            this._properties = null;
            this._focusTracker = focusTracker;
            this._mainThreadDocuments = mainThreadDocuments;
            this._modelService = modelService;
            this._clipboardService = clipboardService;
            this._onPropertiesChanged = new event_1.Emitter();
            this._modelListeners.add(this._model.onDidChangeOptions((e) => {
                this._updatePropertiesNow(null);
            }));
            this.setCodeEditor(codeEditor);
            this._updatePropertiesNow(null);
        }
        dispose() {
            this._modelListeners.dispose();
            this._codeEditor = null;
            this._codeEditorListeners.dispose();
        }
        _updatePropertiesNow(selectionChangeSource) {
            this._setProperties(MainThreadTextEditorProperties.readFromEditor(this._properties, this._model, this._codeEditor), selectionChangeSource);
        }
        _setProperties(newProperties, selectionChangeSource) {
            const delta = newProperties.generateDelta(this._properties, selectionChangeSource);
            this._properties = newProperties;
            if (delta) {
                this._onPropertiesChanged.fire(delta);
            }
        }
        getId() {
            return this._id;
        }
        getModel() {
            return this._model;
        }
        getCodeEditor() {
            return this._codeEditor;
        }
        hasCodeEditor(codeEditor) {
            return (this._codeEditor === codeEditor);
        }
        setCodeEditor(codeEditor) {
            if (this.hasCodeEditor(codeEditor)) {
                // Nothing to do...
                return;
            }
            this._codeEditorListeners.clear();
            this._codeEditor = codeEditor;
            if (this._codeEditor) {
                // Catch early the case that this code editor gets a different model set and disassociate from this model
                this._codeEditorListeners.add(this._codeEditor.onDidChangeModel(() => {
                    this.setCodeEditor(null);
                }));
                this._codeEditorListeners.add(this._codeEditor.onDidFocusEditorWidget(() => {
                    this._focusTracker.onGainedFocus();
                }));
                this._codeEditorListeners.add(this._codeEditor.onDidBlurEditorWidget(() => {
                    this._focusTracker.onLostFocus();
                }));
                let nextSelectionChangeSource = null;
                this._codeEditorListeners.add(this._mainThreadDocuments.onIsCaughtUpWithContentChanges((uri) => {
                    if (uri.toString() === this._model.uri.toString()) {
                        const selectionChangeSource = nextSelectionChangeSource;
                        nextSelectionChangeSource = null;
                        this._updatePropertiesNow(selectionChangeSource);
                    }
                }));
                const isValidCodeEditor = () => {
                    // Due to event timings, it is possible that there is a model change event not yet delivered to us.
                    // > e.g. a model change event is emitted to a listener which then decides to update editor options
                    // > In this case the editor configuration change event reaches us first.
                    // So simply check that the model is still attached to this code editor
                    return (this._codeEditor && this._codeEditor.getModel() === this._model);
                };
                const updateProperties = (selectionChangeSource) => {
                    // Some editor events get delivered faster than model content changes. This is
                    // problematic, as this leads to editor properties reaching the extension host
                    // too soon, before the model content change that was the root cause.
                    //
                    // If this case is identified, then let's update editor properties on the next model
                    // content change instead.
                    if (this._mainThreadDocuments.isCaughtUpWithContentChanges(this._model.uri)) {
                        nextSelectionChangeSource = null;
                        this._updatePropertiesNow(selectionChangeSource);
                    }
                    else {
                        // update editor properties on the next model content change
                        nextSelectionChangeSource = selectionChangeSource;
                    }
                };
                this._codeEditorListeners.add(this._codeEditor.onDidChangeCursorSelection((e) => {
                    // selection
                    if (!isValidCodeEditor()) {
                        return;
                    }
                    updateProperties(e.source);
                }));
                this._codeEditorListeners.add(this._codeEditor.onDidChangeConfiguration((e) => {
                    // options
                    if (!isValidCodeEditor()) {
                        return;
                    }
                    updateProperties(null);
                }));
                this._codeEditorListeners.add(this._codeEditor.onDidLayoutChange(() => {
                    // visibleRanges
                    if (!isValidCodeEditor()) {
                        return;
                    }
                    updateProperties(null);
                }));
                this._codeEditorListeners.add(this._codeEditor.onDidScrollChange(() => {
                    // visibleRanges
                    if (!isValidCodeEditor()) {
                        return;
                    }
                    updateProperties(null);
                }));
                this._updatePropertiesNow(null);
            }
        }
        isVisible() {
            return !!this._codeEditor;
        }
        getProperties() {
            return this._properties;
        }
        get onPropertiesChanged() {
            return this._onPropertiesChanged.event;
        }
        setSelections(selections) {
            if (this._codeEditor) {
                this._codeEditor.setSelections(selections);
                return;
            }
            const newSelections = selections.map(selection_1.Selection.liftSelection);
            this._setProperties(new MainThreadTextEditorProperties(newSelections, this._properties.options, this._properties.visibleRanges), null);
        }
        _setIndentConfiguration(newConfiguration) {
            const creationOpts = this._modelService.getCreationOptions(this._model.getLanguageId(), this._model.uri, this._model.isForSimpleWidget);
            if (newConfiguration.tabSize === 'auto' || newConfiguration.insertSpaces === 'auto') {
                // one of the options was set to 'auto' => detect indentation
                let insertSpaces = creationOpts.insertSpaces;
                let tabSize = creationOpts.tabSize;
                if (newConfiguration.insertSpaces !== 'auto' && typeof newConfiguration.insertSpaces !== 'undefined') {
                    insertSpaces = newConfiguration.insertSpaces;
                }
                if (newConfiguration.tabSize !== 'auto' && typeof newConfiguration.tabSize !== 'undefined') {
                    tabSize = newConfiguration.tabSize;
                }
                this._model.detectIndentation(insertSpaces, tabSize);
                return;
            }
            const newOpts = {};
            if (typeof newConfiguration.insertSpaces !== 'undefined') {
                newOpts.insertSpaces = newConfiguration.insertSpaces;
            }
            if (typeof newConfiguration.tabSize !== 'undefined') {
                newOpts.tabSize = newConfiguration.tabSize;
            }
            if (typeof newConfiguration.indentSize !== 'undefined') {
                newOpts.indentSize = newConfiguration.indentSize;
            }
            this._model.updateOptions(newOpts);
        }
        setConfiguration(newConfiguration) {
            this._setIndentConfiguration(newConfiguration);
            if (!this._codeEditor) {
                return;
            }
            if (newConfiguration.cursorStyle) {
                const newCursorStyle = (0, editorOptions_1.cursorStyleToString)(newConfiguration.cursorStyle);
                this._codeEditor.updateOptions({
                    cursorStyle: newCursorStyle
                });
            }
            if (typeof newConfiguration.lineNumbers !== 'undefined') {
                let lineNumbers;
                switch (newConfiguration.lineNumbers) {
                    case 1 /* RenderLineNumbersType.On */:
                        lineNumbers = 'on';
                        break;
                    case 2 /* RenderLineNumbersType.Relative */:
                        lineNumbers = 'relative';
                        break;
                    default:
                        lineNumbers = 'off';
                }
                this._codeEditor.updateOptions({
                    lineNumbers: lineNumbers
                });
            }
        }
        setDecorations(key, ranges) {
            if (!this._codeEditor) {
                return;
            }
            this._codeEditor.setDecorationsByType('exthost-api', key, ranges);
        }
        setDecorationsFast(key, _ranges) {
            if (!this._codeEditor) {
                return;
            }
            const ranges = [];
            for (let i = 0, len = Math.floor(_ranges.length / 4); i < len; i++) {
                ranges[i] = new range_1.Range(_ranges[4 * i], _ranges[4 * i + 1], _ranges[4 * i + 2], _ranges[4 * i + 3]);
            }
            this._codeEditor.setDecorationsByTypeFast(key, ranges);
        }
        revealRange(range, revealType) {
            if (!this._codeEditor) {
                return;
            }
            switch (revealType) {
                case extHost_protocol_1.TextEditorRevealType.Default:
                    this._codeEditor.revealRange(range, 0 /* ScrollType.Smooth */);
                    break;
                case extHost_protocol_1.TextEditorRevealType.InCenter:
                    this._codeEditor.revealRangeInCenter(range, 0 /* ScrollType.Smooth */);
                    break;
                case extHost_protocol_1.TextEditorRevealType.InCenterIfOutsideViewport:
                    this._codeEditor.revealRangeInCenterIfOutsideViewport(range, 0 /* ScrollType.Smooth */);
                    break;
                case extHost_protocol_1.TextEditorRevealType.AtTop:
                    this._codeEditor.revealRangeAtTop(range, 0 /* ScrollType.Smooth */);
                    break;
                default:
                    console.warn(`Unknown revealType: ${revealType}`);
                    break;
            }
        }
        isFocused() {
            if (this._codeEditor) {
                return this._codeEditor.hasTextFocus();
            }
            return false;
        }
        matches(editor) {
            if (!editor) {
                return false;
            }
            return editor.getControl() === this._codeEditor;
        }
        applyEdits(versionIdCheck, edits, opts) {
            if (this._model.getVersionId() !== versionIdCheck) {
                // throw new Error('Model has changed in the meantime!');
                // model changed in the meantime
                return false;
            }
            if (!this._codeEditor) {
                // console.warn('applyEdits on invisible editor');
                return false;
            }
            if (typeof opts.setEndOfLine !== 'undefined') {
                this._model.pushEOL(opts.setEndOfLine);
            }
            const transformedEdits = edits.map((edit) => {
                return {
                    range: range_1.Range.lift(edit.range),
                    text: edit.text,
                    forceMoveMarkers: edit.forceMoveMarkers
                };
            });
            if (opts.undoStopBefore) {
                this._codeEditor.pushUndoStop();
            }
            this._codeEditor.executeEdits('MainThreadTextEditor', transformedEdits);
            if (opts.undoStopAfter) {
                this._codeEditor.pushUndoStop();
            }
            return true;
        }
        async insertSnippet(modelVersionId, template, ranges, opts) {
            if (!this._codeEditor || !this._codeEditor.hasModel()) {
                return false;
            }
            // check if clipboard is required and only iff read it (async)
            let clipboardText;
            const needsTemplate = snippetParser_1.SnippetParser.guessNeedsClipboard(template);
            if (needsTemplate) {
                const state = new editorState_1.EditorState(this._codeEditor, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */);
                clipboardText = await this._clipboardService.readText();
                if (!state.validate(this._codeEditor)) {
                    return false;
                }
            }
            if (this._codeEditor.getModel().getVersionId() !== modelVersionId) {
                return false;
            }
            const snippetController = snippetController2_1.SnippetController2.get(this._codeEditor);
            if (!snippetController) {
                return false;
            }
            // cancel previous snippet mode
            // snippetController.leaveSnippet();
            // set selection, focus editor
            const selections = ranges.map(r => new selection_1.Selection(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn));
            this._codeEditor.setSelections(selections);
            this._codeEditor.focus();
            // make modifications
            snippetController.insert(template, {
                overwriteBefore: 0, overwriteAfter: 0,
                undoStopBefore: opts.undoStopBefore, undoStopAfter: opts.undoStopAfter,
                clipboardText
            });
            return true;
        }
    }
    exports.MainThreadTextEditor = MainThreadTextEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTBCaEcsTUFBYSw4QkFBOEI7UUFFbkMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxrQkFBeUQsRUFBRSxLQUFpQixFQUFFLFVBQThCO1lBQ3hJLE1BQU0sVUFBVSxHQUFHLDhCQUE4QixDQUFDLDZCQUE2QixDQUFDLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2hILE1BQU0sT0FBTyxHQUFHLDhCQUE4QixDQUFDLDBCQUEwQixDQUFDLGtCQUFrQixFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNqSCxNQUFNLGFBQWEsR0FBRyw4QkFBOEIsQ0FBQyxnQ0FBZ0MsQ0FBQyxrQkFBa0IsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN0SCxPQUFPLElBQUksOEJBQThCLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRU8sTUFBTSxDQUFDLDZCQUE2QixDQUFDLGtCQUF5RCxFQUFFLFVBQThCO1lBQ3JJLElBQUksTUFBTSxHQUF1QixJQUFJLENBQUM7WUFDdEMsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsTUFBTSxHQUFHLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUNwQztZQUNELElBQUksQ0FBQyxNQUFNLElBQUksa0JBQWtCLEVBQUU7Z0JBQ2xDLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxVQUFVLENBQUM7YUFDdkM7WUFDRCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE1BQU0sR0FBRyxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFD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