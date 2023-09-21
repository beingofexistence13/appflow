/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/network", "vs/base/common/strings", "vs/editor/common/model/mirrorTextModel", "vs/editor/common/core/wordHelper", "vs/workbench/api/common/extHostTypes", "vs/base/common/arrays"], function (require, exports, assert_1, network_1, strings_1, mirrorTextModel_1, wordHelper_1, extHostTypes_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6L = exports.$5L = exports.$4L = void 0;
    const _languageId2WordDefinition = new Map();
    function $4L(languageId, wordDefinition) {
        if (!wordDefinition) {
            _languageId2WordDefinition.delete(languageId);
        }
        else {
            _languageId2WordDefinition.set(languageId, wordDefinition);
        }
    }
    exports.$4L = $4L;
    function getWordDefinitionFor(languageId) {
        return _languageId2WordDefinition.get(languageId);
    }
    class $5L extends mirrorTextModel_1.$Mu {
        constructor(c, uri, lines, eol, versionId, m, q, notebook) {
            super(uri, lines, eol, versionId);
            this.c = c;
            this.m = m;
            this.q = q;
            this.notebook = notebook;
            this.b = false;
        }
        dispose() {
            // we don't really dispose documents but let
            // extensions still read from them. some
            // operations, live saving, will now error tho
            (0, assert_1.ok)(!this.b);
            this.b = true;
            this.q = false;
        }
        equalLines(lines) {
            return (0, arrays_1.$sb)(this.f, lines);
        }
        get document() {
            if (!this.a) {
                const that = this;
                this.a = {
                    get uri() { return that.d; },
                    get fileName() { return that.d.fsPath; },
                    get isUntitled() { return that.d.scheme === network_1.Schemas.untitled; },
                    get languageId() { return that.m; },
                    get version() { return that.h; },
                    get isClosed() { return that.b; },
                    get isDirty() { return that.q; },
                    save() { return that.r(); },
                    getText(range) { return range ? that.s(range) : that.getText(); },
                    get eol() { return that.g === '\n' ? extHostTypes_1.EndOfLine.LF : extHostTypes_1.EndOfLine.CRLF; },
                    get lineCount() { return that.f.length; },
                    lineAt(lineOrPos) { return that.t(lineOrPos); },
                    offsetAt(pos) { return that.u(pos); },
                    positionAt(offset) { return that.v(offset); },
                    validateRange(ran) { return that.w(ran); },
                    validatePosition(pos) { return that.x(pos); },
                    getWordRangeAtPosition(pos, regexp) { return that.y(pos, regexp); },
                };
            }
            return Object.freeze(this.a);
        }
        _acceptLanguageId(newLanguageId) {
            (0, assert_1.ok)(!this.b);
            this.m = newLanguageId;
        }
        _acceptIsDirty(isDirty) {
            (0, assert_1.ok)(!this.b);
            this.q = isDirty;
        }
        r() {
            if (this.b) {
                return Promise.reject(new Error('Document has been closed'));
            }
            return this.c.$trySaveDocument(this.d);
        }
        s(_range) {
            const range = this.w(_range);
            if (range.isEmpty) {
                return '';
            }
            if (range.isSingleLine) {
                return this.f[range.start.line].substring(range.start.character, range.end.character);
            }
            const lineEnding = this.g, startLineIndex = range.start.line, endLineIndex = range.end.line, resultLines = [];
            resultLines.push(this.f[startLineIndex].substring(range.start.character));
            for (let i = startLineIndex + 1; i < endLineIndex; i++) {
                resultLines.push(this.f[i]);
            }
            resultLines.push(this.f[endLineIndex].substring(0, range.end.character));
            return resultLines.join(lineEnding);
        }
        t(lineOrPosition) {
            let line;
            if (lineOrPosition instanceof extHostTypes_1.$4J) {
                line = lineOrPosition.line;
            }
            else if (typeof lineOrPosition === 'number') {
                line = lineOrPosition;
            }
            if (typeof line !== 'number' || line < 0 || line >= this.f.length || Math.floor(line) !== line) {
                throw new Error('Illegal value for `line`');
            }
            return new $6L(line, this.f[line], line === this.f.length - 1);
        }
        u(position) {
            position = this.x(position);
            this.l();
            return this.j.getPrefixSum(position.line - 1) + position.character;
        }
        v(offset) {
            offset = Math.floor(offset);
            offset = Math.max(0, offset);
            this.l();
            const out = this.j.getIndexOf(offset);
            const lineLength = this.f[out.index].length;
            // Ensure we return a valid position
            return new extHostTypes_1.$4J(out.index, Math.min(out.remainder, lineLength));
        }
        // ---- range math
        w(range) {
            if (!(range instanceof extHostTypes_1.$5J)) {
                throw new Error('Invalid argument');
            }
            const start = this.x(range.start);
            const end = this.x(range.end);
            if (start === range.start && end === range.end) {
                return range;
            }
            return new extHostTypes_1.$5J(start.line, start.character, end.line, end.character);
        }
        x(position) {
            if (!(position instanceof extHostTypes_1.$4J)) {
                throw new Error('Invalid argument');
            }
            if (this.f.length === 0) {
                return position.with(0, 0);
            }
            let { line, character } = position;
            let hasChanged = false;
            if (line < 0) {
                line = 0;
                character = 0;
                hasChanged = true;
            }
            else if (line >= this.f.length) {
                line = this.f.length - 1;
                character = this.f[line].length;
                hasChanged = true;
            }
            else {
                const maxCharacter = this.f[line].length;
                if (character < 0) {
                    character = 0;
                    hasChanged = true;
                }
                else if (character > maxCharacter) {
                    character = maxCharacter;
                    hasChanged = true;
                }
            }
            if (!hasChanged) {
                return position;
            }
            return new extHostTypes_1.$4J(line, character);
        }
        y(_position, regexp) {
            const position = this.x(_position);
            if (!regexp) {
                // use default when custom-regexp isn't provided
                regexp = getWordDefinitionFor(this.m);
            }
            else if ((0, strings_1.$ze)(regexp)) {
                // use default when custom-regexp is bad
                throw new Error(`[getWordRangeAtPosition]: ignoring custom regexp '${regexp.source}' because it matches the empty string.`);
            }
            const wordAtText = (0, wordHelper_1.$Zr)(position.character + 1, (0, wordHelper_1.$Xr)(regexp), this.f[position.line], 0);
            if (wordAtText) {
                return new extHostTypes_1.$5J(position.line, wordAtText.startColumn - 1, position.line, wordAtText.endColumn - 1);
            }
            return undefined;
        }
    }
    exports.$5L = $5L;
    class $6L {
        constructor(line, text, isLastLine) {
            this.a = line;
            this.b = text;
            this.c = isLastLine;
        }
        get lineNumber() {
            return this.a;
        }
        get text() {
            return this.b;
        }
        get range() {
            return new extHostTypes_1.$5J(this.a, 0, this.a, this.b.length);
        }
        get rangeIncludingLineBreak() {
            if (this.c) {
                return this.range;
            }
            return new extHostTypes_1.$5J(this.a, 0, this.a + 1, 0);
        }
        get firstNonWhitespaceCharacterIndex() {
            //TODO@api, rename to 'leadingWhitespaceLength'
            return /^(\s*)/.exec(this.b)[1].length;
        }
        get isEmptyOrWhitespace() {
            return this.firstNonWhitespaceCharacterIndex === this.b.length;
        }
    }
    exports.$6L = $6L;
});
//# sourceMappingURL=extHostDocumentData.js.map