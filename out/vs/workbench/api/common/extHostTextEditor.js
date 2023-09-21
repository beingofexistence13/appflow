/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/errors", "vs/base/common/idGenerator", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes"], function (require, exports, assert_1, errors_1, idGenerator_1, TypeConverters, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostTextEditor = exports.ExtHostTextEditorOptions = exports.TextEditorDecorationType = void 0;
    class TextEditorDecorationType {
        static { this._Keys = new idGenerator_1.IdGenerator('TextEditorDecorationType'); }
        constructor(proxy, extension, options) {
            const key = TextEditorDecorationType._Keys.nextId();
            proxy.$registerTextEditorDecorationType(extension.identifier, key, TypeConverters.DecorationRenderOptions.from(options));
            this.value = Object.freeze({
                key,
                dispose() {
                    proxy.$removeTextEditorDecorationType(key);
                }
            });
        }
    }
    exports.TextEditorDecorationType = TextEditorDecorationType;
    class TextEditorEdit {
        constructor(document, options) {
            this._collectedEdits = [];
            this._setEndOfLine = undefined;
            this._finalized = false;
            this._document = document;
            this._documentVersionId = document.version;
            this._undoStopBefore = options.undoStopBefore;
            this._undoStopAfter = options.undoStopAfter;
        }
        finalize() {
            this._finalized = true;
            return {
                documentVersionId: this._documentVersionId,
                edits: this._collectedEdits,
                setEndOfLine: this._setEndOfLine,
                undoStopBefore: this._undoStopBefore,
                undoStopAfter: this._undoStopAfter
            };
        }
        _throwIfFinalized() {
            if (this._finalized) {
                throw new Error('Edit is only valid while callback runs');
            }
        }
        replace(location, value) {
            this._throwIfFinalized();
            let range = null;
            if (location instanceof extHostTypes_1.Position) {
                range = new extHostTypes_1.Range(location, location);
            }
            else if (location instanceof extHostTypes_1.Range) {
                range = location;
            }
            else {
                throw new Error('Unrecognized location');
            }
            this._pushEdit(range, value, false);
        }
        insert(location, value) {
            this._throwIfFinalized();
            this._pushEdit(new extHostTypes_1.Range(location, location), value, true);
        }
        delete(location) {
            this._throwIfFinalized();
            let range = null;
            if (location instanceof extHostTypes_1.Range) {
                range = location;
            }
            else {
                throw new Error('Unrecognized location');
            }
            this._pushEdit(range, null, true);
        }
        _pushEdit(range, text, forceMoveMarkers) {
            const validRange = this._document.validateRange(range);
            this._collectedEdits.push({
                range: validRange,
                text: text,
                forceMoveMarkers: forceMoveMarkers
            });
        }
        setEndOfLine(endOfLine) {
            this._throwIfFinalized();
            if (endOfLine !== extHostTypes_1.EndOfLine.LF && endOfLine !== extHostTypes_1.EndOfLine.CRLF) {
                throw (0, errors_1.illegalArgument)('endOfLine');
            }
            this._setEndOfLine = endOfLine;
        }
    }
    class ExtHostTextEditorOptions {
        constructor(proxy, id, source, logService) {
            this._proxy = proxy;
            this._id = id;
            this._accept(source);
            this._logService = logService;
            const that = this;
            this.value = {
                get tabSize() {
                    return that._tabSize;
                },
                set tabSize(value) {
                    that._setTabSize(value);
                },
                get indentSize() {
                    return that._indentSize;
                },
                set indentSize(value) {
                    that._setIndentSize(value);
                },
                get insertSpaces() {
                    return that._insertSpaces;
                },
                set insertSpaces(value) {
                    that._setInsertSpaces(value);
                },
                get cursorStyle() {
                    return that._cursorStyle;
                },
                set cursorStyle(value) {
                    that._setCursorStyle(value);
                },
                get lineNumbers() {
                    return that._lineNumbers;
                },
                set lineNumbers(value) {
                    that._setLineNumbers(value);
                }
            };
        }
        _accept(source) {
            this._tabSize = source.tabSize;
            this._indentSize = source.indentSize;
            this._insertSpaces = source.insertSpaces;
            this._cursorStyle = source.cursorStyle;
            this._lineNumbers = TypeConverters.TextEditorLineNumbersStyle.to(source.lineNumbers);
        }
        // --- internal: tabSize
        _validateTabSize(value) {
            if (value === 'auto') {
                return 'auto';
            }
            if (typeof value === 'number') {
                const r = Math.floor(value);
                return (r > 0 ? r : null);
            }
            if (typeof value === 'string') {
                const r = parseInt(value, 10);
                if (isNaN(r)) {
                    return null;
                }
                return (r > 0 ? r : null);
            }
            return null;
        }
        _setTabSize(value) {
            const tabSize = this._validateTabSize(value);
            if (tabSize === null) {
                // ignore invalid call
                return;
            }
            if (typeof tabSize === 'number') {
                if (this._tabSize === tabSize) {
                    // nothing to do
                    return;
                }
                // reflect the new tabSize value immediately
                this._tabSize = tabSize;
            }
            this._warnOnError('setTabSize', this._proxy.$trySetOptions(this._id, {
                tabSize: tabSize
            }));
        }
        // --- internal: indentSize
        _validateIndentSize(value) {
            if (value === 'tabSize') {
                return 'tabSize';
            }
            if (typeof value === 'number') {
                const r = Math.floor(value);
                return (r > 0 ? r : null);
            }
            if (typeof value === 'string') {
                const r = parseInt(value, 10);
                if (isNaN(r)) {
                    return null;
                }
                return (r > 0 ? r : null);
            }
            return null;
        }
        _setIndentSize(value) {
            const indentSize = this._validateIndentSize(value);
            if (indentSize === null) {
                // ignore invalid call
                return;
            }
            if (typeof indentSize === 'number') {
                if (this._indentSize === indentSize) {
                    // nothing to do
                    return;
                }
                // reflect the new indentSize value immediately
                this._indentSize = indentSize;
            }
            this._warnOnError('setIndentSize', this._proxy.$trySetOptions(this._id, {
                indentSize: indentSize
            }));
        }
        // --- internal: insert spaces
        _validateInsertSpaces(value) {
            if (value === 'auto') {
                return 'auto';
            }
            return (value === 'false' ? false : Boolean(value));
        }
        _setInsertSpaces(value) {
            const insertSpaces = this._validateInsertSpaces(value);
            if (typeof insertSpaces === 'boolean') {
                if (this._insertSpaces === insertSpaces) {
                    // nothing to do
                    return;
                }
                // reflect the new insertSpaces value immediately
                this._insertSpaces = insertSpaces;
            }
            this._warnOnError('setInsertSpaces', this._proxy.$trySetOptions(this._id, {
                insertSpaces: insertSpaces
            }));
        }
        // --- internal: cursor style
        _setCursorStyle(value) {
            if (this._cursorStyle === value) {
                // nothing to do
                return;
            }
            this._cursorStyle = value;
            this._warnOnError('setCursorStyle', this._proxy.$trySetOptions(this._id, {
                cursorStyle: value
            }));
        }
        // --- internal: line number
        _setLineNumbers(value) {
            if (this._lineNumbers === value) {
                // nothing to do
                return;
            }
            this._lineNumbers = value;
            this._warnOnError('setLineNumbers', this._proxy.$trySetOptions(this._id, {
                lineNumbers: TypeConverters.TextEditorLineNumbersStyle.from(value)
            }));
        }
        assign(newOptions) {
            const bulkConfigurationUpdate = {};
            let hasUpdate = false;
            if (typeof newOptions.tabSize !== 'undefined') {
                const tabSize = this._validateTabSize(newOptions.tabSize);
                if (tabSize === 'auto') {
                    hasUpdate = true;
                    bulkConfigurationUpdate.tabSize = tabSize;
                }
                else if (typeof tabSize === 'number' && this._tabSize !== tabSize) {
                    // reflect the new tabSize value immediately
                    this._tabSize = tabSize;
                    hasUpdate = true;
                    bulkConfigurationUpdate.tabSize = tabSize;
                }
            }
            if (typeof newOptions.indentSize !== 'undefined') {
                const indentSize = this._validateIndentSize(newOptions.indentSize);
                if (indentSize === 'tabSize') {
                    hasUpdate = true;
                    bulkConfigurationUpdate.indentSize = indentSize;
                }
                else if (typeof indentSize === 'number' && this._indentSize !== indentSize) {
                    // reflect the new indentSize value immediately
                    this._indentSize = indentSize;
                    hasUpdate = true;
                    bulkConfigurationUpdate.indentSize = indentSize;
                }
            }
            if (typeof newOptions.insertSpaces !== 'undefined') {
                const insertSpaces = this._validateInsertSpaces(newOptions.insertSpaces);
                if (insertSpaces === 'auto') {
                    hasUpdate = true;
                    bulkConfigurationUpdate.insertSpaces = insertSpaces;
                }
                else if (this._insertSpaces !== insertSpaces) {
                    // reflect the new insertSpaces value immediately
                    this._insertSpaces = insertSpaces;
                    hasUpdate = true;
                    bulkConfigurationUpdate.insertSpaces = insertSpaces;
                }
            }
            if (typeof newOptions.cursorStyle !== 'undefined') {
                if (this._cursorStyle !== newOptions.cursorStyle) {
                    this._cursorStyle = newOptions.cursorStyle;
                    hasUpdate = true;
                    bulkConfigurationUpdate.cursorStyle = newOptions.cursorStyle;
                }
            }
            if (typeof newOptions.lineNumbers !== 'undefined') {
                if (this._lineNumbers !== newOptions.lineNumbers) {
                    this._lineNumbers = newOptions.lineNumbers;
                    hasUpdate = true;
                    bulkConfigurationUpdate.lineNumbers = TypeConverters.TextEditorLineNumbersStyle.from(newOptions.lineNumbers);
                }
            }
            if (hasUpdate) {
                this._warnOnError('setOptions', this._proxy.$trySetOptions(this._id, bulkConfigurationUpdate));
            }
        }
        _warnOnError(action, promise) {
            promise.catch(err => {
                this._logService.warn(`ExtHostTextEditorOptions '${action}' failed:'`);
                this._logService.warn(err);
            });
        }
    }
    exports.ExtHostTextEditorOptions = ExtHostTextEditorOptions;
    class ExtHostTextEditor {
        constructor(id, _proxy, _logService, document, selections, options, visibleRanges, viewColumn) {
            this.id = id;
            this._proxy = _proxy;
            this._logService = _logService;
            this._disposed = false;
            this._hasDecorationsForKey = new Set();
            this._selections = selections;
            this._options = new ExtHostTextEditorOptions(this._proxy, this.id, options, _logService);
            this._visibleRanges = visibleRanges;
            this._viewColumn = viewColumn;
            const that = this;
            this.value = Object.freeze({
                get document() {
                    return document.value;
                },
                set document(_value) {
                    throw new errors_1.ReadonlyError('document');
                },
                // --- selection
                get selection() {
                    return that._selections && that._selections[0];
                },
                set selection(value) {
                    if (!(value instanceof extHostTypes_1.Selection)) {
                        throw (0, errors_1.illegalArgument)('selection');
                    }
                    that._selections = [value];
                    that._trySetSelection();
                },
                get selections() {
                    return that._selections;
                },
                set selections(value) {
                    if (!Array.isArray(value) || value.some(a => !(a instanceof extHostTypes_1.Selection))) {
                        throw (0, errors_1.illegalArgument)('selections');
                    }
                    that._selections = value;
                    that._trySetSelection();
                },
                // --- visible ranges
                get visibleRanges() {
                    return that._visibleRanges;
                },
                set visibleRanges(_value) {
                    throw new errors_1.ReadonlyError('visibleRanges');
                },
                // --- options
                get options() {
                    return that._options.value;
                },
                set options(value) {
                    if (!that._disposed) {
                        that._options.assign(value);
                    }
                },
                // --- view column
                get viewColumn() {
                    return that._viewColumn;
                },
                set viewColumn(_value) {
                    throw new errors_1.ReadonlyError('viewColumn');
                },
                // --- edit
                edit(callback, options = { undoStopBefore: true, undoStopAfter: true }) {
                    if (that._disposed) {
                        return Promise.reject(new Error('TextEditor#edit not possible on closed editors'));
                    }
                    const edit = new TextEditorEdit(document.value, options);
                    callback(edit);
                    return that._applyEdit(edit);
                },
                // --- snippet edit
                insertSnippet(snippet, where, options = { undoStopBefore: true, undoStopAfter: true }) {
                    if (that._disposed) {
                        return Promise.reject(new Error('TextEditor#insertSnippet not possible on closed editors'));
                    }
                    let ranges;
                    if (!where || (Array.isArray(where) && where.length === 0)) {
                        ranges = that._selections.map(range => TypeConverters.Range.from(range));
                    }
                    else if (where instanceof extHostTypes_1.Position) {
                        const { lineNumber, column } = TypeConverters.Position.from(where);
                        ranges = [{ startLineNumber: lineNumber, startColumn: column, endLineNumber: lineNumber, endColumn: column }];
                    }
                    else if (where instanceof extHostTypes_1.Range) {
                        ranges = [TypeConverters.Range.from(where)];
                    }
                    else {
                        ranges = [];
                        for (const posOrRange of where) {
                            if (posOrRange instanceof extHostTypes_1.Range) {
                                ranges.push(TypeConverters.Range.from(posOrRange));
                            }
                            else {
                                const { lineNumber, column } = TypeConverters.Position.from(posOrRange);
                                ranges.push({ startLineNumber: lineNumber, startColumn: column, endLineNumber: lineNumber, endColumn: column });
                            }
                        }
                    }
                    return _proxy.$tryInsertSnippet(id, document.value.version, snippet.value, ranges, options);
                },
                setDecorations(decorationType, ranges) {
                    const willBeEmpty = (ranges.length === 0);
                    if (willBeEmpty && !that._hasDecorationsForKey.has(decorationType.key)) {
                        // avoid no-op call to the renderer
                        return;
                    }
                    if (willBeEmpty) {
                        that._hasDecorationsForKey.delete(decorationType.key);
                    }
                    else {
                        that._hasDecorationsForKey.add(decorationType.key);
                    }
                    that._runOnProxy(() => {
                        if (TypeConverters.isDecorationOptionsArr(ranges)) {
                            return _proxy.$trySetDecorations(id, decorationType.key, TypeConverters.fromRangeOrRangeWithMessage(ranges));
                        }
                        else {
                            const _ranges = new Array(4 * ranges.length);
                            for (let i = 0, len = ranges.length; i < len; i++) {
                                const range = ranges[i];
                                _ranges[4 * i] = range.start.line + 1;
                                _ranges[4 * i + 1] = range.start.character + 1;
                                _ranges[4 * i + 2] = range.end.line + 1;
                                _ranges[4 * i + 3] = range.end.character + 1;
                            }
                            return _proxy.$trySetDecorationsFast(id, decorationType.key, _ranges);
                        }
                    });
                },
                revealRange(range, revealType) {
                    that._runOnProxy(() => _proxy.$tryRevealRange(id, TypeConverters.Range.from(range), (revealType || extHostTypes_1.TextEditorRevealType.Default)));
                },
                show(column) {
                    _proxy.$tryShowEditor(id, TypeConverters.ViewColumn.from(column));
                },
                hide() {
                    _proxy.$tryHideEditor(id);
                }
            });
        }
        dispose() {
            (0, assert_1.ok)(!this._disposed);
            this._disposed = true;
        }
        // --- incoming: extension host MUST accept what the renderer says
        _acceptOptions(options) {
            (0, assert_1.ok)(!this._disposed);
            this._options._accept(options);
        }
        _acceptVisibleRanges(value) {
            (0, assert_1.ok)(!this._disposed);
            this._visibleRanges = value;
        }
        _acceptViewColumn(value) {
            (0, assert_1.ok)(!this._disposed);
            this._viewColumn = value;
        }
        _acceptSelections(selections) {
            (0, assert_1.ok)(!this._disposed);
            this._selections = selections;
        }
        async _trySetSelection() {
            const selection = this._selections.map(TypeConverters.Selection.from);
            await this._runOnProxy(() => this._proxy.$trySetSelections(this.id, selection));
            return this.value;
        }
        _applyEdit(editBuilder) {
            const editData = editBuilder.finalize();
            // return when there is nothing to do
            if (editData.edits.length === 0 && !editData.setEndOfLine) {
                return Promise.resolve(true);
            }
            // check that the edits are not overlapping (i.e. illegal)
            const editRanges = editData.edits.map(edit => edit.range);
            // sort ascending (by end and then by start)
            editRanges.sort((a, b) => {
                if (a.end.line === b.end.line) {
                    if (a.end.character === b.end.character) {
                        if (a.start.line === b.start.line) {
                            return a.start.character - b.start.character;
                        }
                        return a.start.line - b.start.line;
                    }
                    return a.end.character - b.end.character;
                }
                return a.end.line - b.end.line;
            });
            // check that no edits are overlapping
            for (let i = 0, count = editRanges.length - 1; i < count; i++) {
                const rangeEnd = editRanges[i].end;
                const nextRangeStart = editRanges[i + 1].start;
                if (nextRangeStart.isBefore(rangeEnd)) {
                    // overlapping ranges
                    return Promise.reject(new Error('Overlapping ranges are not allowed!'));
                }
            }
            // prepare data for serialization
            const edits = editData.edits.map((edit) => {
                return {
                    range: TypeConverters.Range.from(edit.range),
                    text: edit.text,
                    forceMoveMarkers: edit.forceMoveMarkers
                };
            });
            return this._proxy.$tryApplyEdits(this.id, editData.documentVersionId, edits, {
                setEndOfLine: typeof editData.setEndOfLine === 'number' ? TypeConverters.EndOfLine.from(editData.setEndOfLine) : undefined,
                undoStopBefore: editData.undoStopBefore,
                undoStopAfter: editData.undoStopAfter
            });
        }
        _runOnProxy(callback) {
            if (this._disposed) {
                this._logService.warn('TextEditor is closed/disposed');
                return Promise.resolve(undefined);
            }
            return callback().then(() => this, err => {
                if (!(err instanceof Error && err.name === 'DISPOSED')) {
                    this._logService.warn(err);
                }
                return null;
            });
        }
    }
    exports.ExtHostTextEditor = ExtHostTextEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRleHRFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0VGV4dEVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLE1BQWEsd0JBQXdCO2lCQUVaLFVBQUssR0FBRyxJQUFJLHlCQUFXLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUk1RSxZQUFZLEtBQWlDLEVBQUUsU0FBZ0MsRUFBRSxPQUF1QztZQUN2SCxNQUFNLEdBQUcsR0FBRyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDcEQsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN6SCxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQzFCLEdBQUc7Z0JBQ0gsT0FBTztvQkFDTixLQUFLLENBQUMsK0JBQStCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzVDLENBQUM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDOztJQWZGLDREQWlCQztJQWdCRCxNQUFNLGNBQWM7UUFVbkIsWUFBWSxRQUE2QixFQUFFLE9BQTREO1lBSi9GLG9CQUFlLEdBQXlCLEVBQUUsQ0FBQztZQUMzQyxrQkFBYSxHQUEwQixTQUFTLENBQUM7WUFDakQsZUFBVSxHQUFZLEtBQUssQ0FBQztZQUduQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUMxQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQztZQUMzQyxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7WUFDOUMsSUFBSSxDQUFDLGNB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