/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/errors", "vs/base/common/idGenerator", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes"], function (require, exports, assert_1, errors_1, idGenerator_1, TypeConverters, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$L = exports.$0L = exports.$9L = void 0;
    class $9L {
        static { this.c = new idGenerator_1.$7L('TextEditorDecorationType'); }
        constructor(proxy, extension, options) {
            const key = $9L.c.nextId();
            proxy.$registerTextEditorDecorationType(extension.identifier, key, TypeConverters.DecorationRenderOptions.from(options));
            this.value = Object.freeze({
                key,
                dispose() {
                    proxy.$removeTextEditorDecorationType(key);
                }
            });
        }
    }
    exports.$9L = $9L;
    class TextEditorEdit {
        constructor(document, options) {
            this.g = [];
            this.h = undefined;
            this.j = false;
            this.c = document;
            this.d = document.version;
            this.e = options.undoStopBefore;
            this.f = options.undoStopAfter;
        }
        finalize() {
            this.j = true;
            return {
                documentVersionId: this.d,
                edits: this.g,
                setEndOfLine: this.h,
                undoStopBefore: this.e,
                undoStopAfter: this.f
            };
        }
        k() {
            if (this.j) {
                throw new Error('Edit is only valid while callback runs');
            }
        }
        replace(location, value) {
            this.k();
            let range = null;
            if (location instanceof extHostTypes_1.$4J) {
                range = new extHostTypes_1.$5J(location, location);
            }
            else if (location instanceof extHostTypes_1.$5J) {
                range = location;
            }
            else {
                throw new Error('Unrecognized location');
            }
            this.l(range, value, false);
        }
        insert(location, value) {
            this.k();
            this.l(new extHostTypes_1.$5J(location, location), value, true);
        }
        delete(location) {
            this.k();
            let range = null;
            if (location instanceof extHostTypes_1.$5J) {
                range = location;
            }
            else {
                throw new Error('Unrecognized location');
            }
            this.l(range, null, true);
        }
        l(range, text, forceMoveMarkers) {
            const validRange = this.c.validateRange(range);
            this.g.push({
                range: validRange,
                text: text,
                forceMoveMarkers: forceMoveMarkers
            });
        }
        setEndOfLine(endOfLine) {
            this.k();
            if (endOfLine !== extHostTypes_1.EndOfLine.LF && endOfLine !== extHostTypes_1.EndOfLine.CRLF) {
                throw (0, errors_1.$5)('endOfLine');
            }
            this.h = endOfLine;
        }
    }
    class $0L {
        constructor(proxy, id, source, logService) {
            this.c = proxy;
            this.d = id;
            this._accept(source);
            this.e = logService;
            const that = this;
            this.value = {
                get tabSize() {
                    return that.f;
                },
                set tabSize(value) {
                    that.m(value);
                },
                get indentSize() {
                    return that.g;
                },
                set indentSize(value) {
                    that.o(value);
                },
                get insertSpaces() {
                    return that.h;
                },
                set insertSpaces(value) {
                    that.q(value);
                },
                get cursorStyle() {
                    return that.j;
                },
                set cursorStyle(value) {
                    that.s(value);
                },
                get lineNumbers() {
                    return that.k;
                },
                set lineNumbers(value) {
                    that.t(value);
                }
            };
        }
        _accept(source) {
            this.f = source.tabSize;
            this.g = source.indentSize;
            this.h = source.insertSpaces;
            this.j = source.cursorStyle;
            this.k = TypeConverters.TextEditorLineNumbersStyle.to(source.lineNumbers);
        }
        // --- internal: tabSize
        l(value) {
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
        m(value) {
            const tabSize = this.l(value);
            if (tabSize === null) {
                // ignore invalid call
                return;
            }
            if (typeof tabSize === 'number') {
                if (this.f === tabSize) {
                    // nothing to do
                    return;
                }
                // reflect the new tabSize value immediately
                this.f = tabSize;
            }
            this.u('setTabSize', this.c.$trySetOptions(this.d, {
                tabSize: tabSize
            }));
        }
        // --- internal: indentSize
        n(value) {
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
        o(value) {
            const indentSize = this.n(value);
            if (indentSize === null) {
                // ignore invalid call
                return;
            }
            if (typeof indentSize === 'number') {
                if (this.g === indentSize) {
                    // nothing to do
                    return;
                }
                // reflect the new indentSize value immediately
                this.g = indentSize;
            }
            this.u('setIndentSize', this.c.$trySetOptions(this.d, {
                indentSize: indentSize
            }));
        }
        // --- internal: insert spaces
        p(value) {
            if (value === 'auto') {
                return 'auto';
            }
            return (value === 'false' ? false : Boolean(value));
        }
        q(value) {
            const insertSpaces = this.p(value);
            if (typeof insertSpaces === 'boolean') {
                if (this.h === insertSpaces) {
                    // nothing to do
                    return;
                }
                // reflect the new insertSpaces value immediately
                this.h = insertSpaces;
            }
            this.u('setInsertSpaces', this.c.$trySetOptions(this.d, {
                insertSpaces: insertSpaces
            }));
        }
        // --- internal: cursor style
        s(value) {
            if (this.j === value) {
                // nothing to do
                return;
            }
            this.j = value;
            this.u('setCursorStyle', this.c.$trySetOptions(this.d, {
                cursorStyle: value
            }));
        }
        // --- internal: line number
        t(value) {
            if (this.k === value) {
                // nothing to do
                return;
            }
            this.k = value;
            this.u('setLineNumbers', this.c.$trySetOptions(this.d, {
                lineNumbers: TypeConverters.TextEditorLineNumbersStyle.from(value)
            }));
        }
        assign(newOptions) {
            const bulkConfigurationUpdate = {};
            let hasUpdate = false;
            if (typeof newOptions.tabSize !== 'undefined') {
                const tabSize = this.l(newOptions.tabSize);
                if (tabSize === 'auto') {
                    hasUpdate = true;
                    bulkConfigurationUpdate.tabSize = tabSize;
                }
                else if (typeof tabSize === 'number' && this.f !== tabSize) {
                    // reflect the new tabSize value immediately
                    this.f = tabSize;
                    hasUpdate = true;
                    bulkConfigurationUpdate.tabSize = tabSize;
                }
            }
            if (typeof newOptions.indentSize !== 'undefined') {
                const indentSize = this.n(newOptions.indentSize);
                if (indentSize === 'tabSize') {
                    hasUpdate = true;
                    bulkConfigurationUpdate.indentSize = indentSize;
                }
                else if (typeof indentSize === 'number' && this.g !== indentSize) {
                    // reflect the new indentSize value immediately
                    this.g = indentSize;
                    hasUpdate = true;
                    bulkConfigurationUpdate.indentSize = indentSize;
                }
            }
            if (typeof newOptions.insertSpaces !== 'undefined') {
                const insertSpaces = this.p(newOptions.insertSpaces);
                if (insertSpaces === 'auto') {
                    hasUpdate = true;
                    bulkConfigurationUpdate.insertSpaces = insertSpaces;
                }
                else if (this.h !== insertSpaces) {
                    // reflect the new insertSpaces value immediately
                    this.h = insertSpaces;
                    hasUpdate = true;
                    bulkConfigurationUpdate.insertSpaces = insertSpaces;
                }
            }
            if (typeof newOptions.cursorStyle !== 'undefined') {
                if (this.j !== newOptions.cursorStyle) {
                    this.j = newOptions.cursorStyle;
                    hasUpdate = true;
                    bulkConfigurationUpdate.cursorStyle = newOptions.cursorStyle;
                }
            }
            if (typeof newOptions.lineNumbers !== 'undefined') {
                if (this.k !== newOptions.lineNumbers) {
                    this.k = newOptions.lineNumbers;
                    hasUpdate = true;
                    bulkConfigurationUpdate.lineNumbers = TypeConverters.TextEditorLineNumbersStyle.from(newOptions.lineNumbers);
                }
            }
            if (hasUpdate) {
                this.u('setOptions', this.c.$trySetOptions(this.d, bulkConfigurationUpdate));
            }
        }
        u(action, promise) {
            promise.catch(err => {
                this.e.warn(`ExtHostTextEditorOptions '${action}' failed:'`);
                this.e.warn(err);
            });
        }
    }
    exports.$0L = $0L;
    class $$L {
        constructor(id, j, k, document, selections, options, visibleRanges, viewColumn) {
            this.id = id;
            this.j = j;
            this.k = k;
            this.g = false;
            this.h = new Set();
            this.c = selections;
            this.d = new $0L(this.j, this.id, options, k);
            this.e = visibleRanges;
            this.f = viewColumn;
            const that = this;
            this.value = Object.freeze({
                get document() {
                    return document.value;
                },
                set document(_value) {
                    throw new errors_1.$7('document');
                },
                // --- selection
                get selection() {
                    return that.c && that.c[0];
                },
                set selection(value) {
                    if (!(value instanceof extHostTypes_1.$6J)) {
                        throw (0, errors_1.$5)('selection');
                    }
                    that.c = [value];
                    that.l();
                },
                get selections() {
                    return that.c;
                },
                set selections(value) {
                    if (!Array.isArray(value) || value.some(a => !(a instanceof extHostTypes_1.$6J))) {
                        throw (0, errors_1.$5)('selections');
                    }
                    that.c = value;
                    that.l();
                },
                // --- visible ranges
                get visibleRanges() {
                    return that.e;
                },
                set visibleRanges(_value) {
                    throw new errors_1.$7('visibleRanges');
                },
                // --- options
                get options() {
                    return that.d.value;
                },
                set options(value) {
                    if (!that.g) {
                        that.d.assign(value);
                    }
                },
                // --- view column
                get viewColumn() {
                    return that.f;
                },
                set viewColumn(_value) {
                    throw new errors_1.$7('viewColumn');
                },
                // --- edit
                edit(callback, options = { undoStopBefore: true, undoStopAfter: true }) {
                    if (that.g) {
                        return Promise.reject(new Error('TextEditor#edit not possible on closed editors'));
                    }
                    const edit = new TextEditorEdit(document.value, options);
                    callback(edit);
                    return that.m(edit);
                },
                // --- snippet edit
                insertSnippet(snippet, where, options = { undoStopBefore: true, undoStopAfter: true }) {
                    if (that.g) {
                        return Promise.reject(new Error('TextEditor#insertSnippet not possible on closed editors'));
                    }
                    let ranges;
                    if (!where || (Array.isArray(where) && where.length === 0)) {
                        ranges = that.c.map(range => TypeConverters.Range.from(range));
                    }
                    else if (where instanceof extHostTypes_1.$4J) {
                        const { lineNumber, column } = TypeConverters.Position.from(where);
                        ranges = [{ startLineNumber: lineNumber, startColumn: column, endLineNumber: lineNumber, endColumn: column }];
                    }
                    else if (where instanceof extHostTypes_1.$5J) {
                        ranges = [TypeConverters.Range.from(where)];
                    }
                    else {
                        ranges = [];
                        for (const posOrRange of where) {
                            if (posOrRange instanceof extHostTypes_1.$5J) {
                                ranges.push(TypeConverters.Range.from(posOrRange));
                            }
                            else {
                                const { lineNumber, column } = TypeConverters.Position.from(posOrRange);
                                ranges.push({ startLineNumber: lineNumber, startColumn: column, endLineNumber: lineNumber, endColumn: column });
                            }
                        }
                    }
                    return j.$tryInsertSnippet(id, document.value.version, snippet.value, ranges, options);
                },
                setDecorations(decorationType, ranges) {
                    const willBeEmpty = (ranges.length === 0);
                    if (willBeEmpty && !that.h.has(decorationType.key)) {
                        // avoid no-op call to the renderer
                        return;
                    }
                    if (willBeEmpty) {
                        that.h.delete(decorationType.key);
                    }
                    else {
                        that.h.add(decorationType.key);
                    }
                    that.n(() => {
                        if (TypeConverters.$YL(ranges)) {
                            return j.$trySetDecorations(id, decorationType.key, TypeConverters.$ZL(ranges));
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
                            return j.$trySetDecorationsFast(id, decorationType.key, _ranges);
                        }
                    });
                },
                revealRange(range, revealType) {
                    that.n(() => j.$tryRevealRange(id, TypeConverters.Range.from(range), (revealType || extHostTypes_1.TextEditorRevealType.Default)));
                },
                show(column) {
                    j.$tryShowEditor(id, TypeConverters.ViewColumn.from(column));
                },
                hide() {
                    j.$tryHideEditor(id);
                }
            });
        }
        dispose() {
            (0, assert_1.ok)(!this.g);
            this.g = true;
        }
        // --- incoming: extension host MUST accept what the renderer says
        _acceptOptions(options) {
            (0, assert_1.ok)(!this.g);
            this.d._accept(options);
        }
        _acceptVisibleRanges(value) {
            (0, assert_1.ok)(!this.g);
            this.e = value;
        }
        _acceptViewColumn(value) {
            (0, assert_1.ok)(!this.g);
            this.f = value;
        }
        _acceptSelections(selections) {
            (0, assert_1.ok)(!this.g);
            this.c = selections;
        }
        async l() {
            const selection = this.c.map(TypeConverters.Selection.from);
            await this.n(() => this.j.$trySetSelections(this.id, selection));
            return this.value;
        }
        m(editBuilder) {
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
            return this.j.$tryApplyEdits(this.id, editData.documentVersionId, edits, {
                setEndOfLine: typeof editData.setEndOfLine === 'number' ? TypeConverters.EndOfLine.from(editData.setEndOfLine) : undefined,
                undoStopBefore: editData.undoStopBefore,
                undoStopAfter: editData.undoStopAfter
            });
        }
        n(callback) {
            if (this.g) {
                this.k.warn('TextEditor is closed/disposed');
                return Promise.resolve(undefined);
            }
            return callback().then(() => this, err => {
                if (!(err instanceof Error && err.name === 'DISPOSED')) {
                    this.k.warn(err);
                }
                return null;
            });
        }
    }
    exports.$$L = $$L;
});
//# sourceMappingURL=extHostTextEditor.js.map