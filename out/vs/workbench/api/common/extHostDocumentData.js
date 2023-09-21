/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/network", "vs/base/common/strings", "vs/editor/common/model/mirrorTextModel", "vs/editor/common/core/wordHelper", "vs/workbench/api/common/extHostTypes", "vs/base/common/arrays"], function (require, exports, assert_1, network_1, strings_1, mirrorTextModel_1, wordHelper_1, extHostTypes_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostDocumentLine = exports.ExtHostDocumentData = exports.setWordDefinitionFor = void 0;
    const _languageId2WordDefinition = new Map();
    function setWordDefinitionFor(languageId, wordDefinition) {
        if (!wordDefinition) {
            _languageId2WordDefinition.delete(languageId);
        }
        else {
            _languageId2WordDefinition.set(languageId, wordDefinition);
        }
    }
    exports.setWordDefinitionFor = setWordDefinitionFor;
    function getWordDefinitionFor(languageId) {
        return _languageId2WordDefinition.get(languageId);
    }
    class ExtHostDocumentData extends mirrorTextModel_1.MirrorTextModel {
        constructor(_proxy, uri, lines, eol, versionId, _languageId, _isDirty, notebook) {
            super(uri, lines, eol, versionId);
            this._proxy = _proxy;
            this._languageId = _languageId;
            this._isDirty = _isDirty;
            this.notebook = notebook;
            this._isDisposed = false;
        }
        dispose() {
            // we don't really dispose documents but let
            // extensions still read from them. some
            // operations, live saving, will now error tho
            (0, assert_1.ok)(!this._isDisposed);
            this._isDisposed = true;
            this._isDirty = false;
        }
        equalLines(lines) {
            return (0, arrays_1.equals)(this._lines, lines);
        }
        get document() {
            if (!this._document) {
                const that = this;
                this._document = {
                    get uri() { return that._uri; },
                    get fileName() { return that._uri.fsPath; },
                    get isUntitled() { return that._uri.scheme === network_1.Schemas.untitled; },
                    get languageId() { return that._languageId; },
                    get version() { return that._versionId; },
                    get isClosed() { return that._isDisposed; },
                    get isDirty() { return that._isDirty; },
                    save() { return that._save(); },
                    getText(range) { return range ? that._getTextInRange(range) : that.getText(); },
                    get eol() { return that._eol === '\n' ? extHostTypes_1.EndOfLine.LF : extHostTypes_1.EndOfLine.CRLF; },
                    get lineCount() { return that._lines.length; },
                    lineAt(lineOrPos) { return that._lineAt(lineOrPos); },
                    offsetAt(pos) { return that._offsetAt(pos); },
                    positionAt(offset) { return that._positionAt(offset); },
                    validateRange(ran) { return that._validateRange(ran); },
                    validatePosition(pos) { return that._validatePosition(pos); },
                    getWordRangeAtPosition(pos, regexp) { return that._getWordRangeAtPosition(pos, regexp); },
                };
            }
            return Object.freeze(this._document);
        }
        _acceptLanguageId(newLanguageId) {
            (0, assert_1.ok)(!this._isDisposed);
            this._languageId = newLanguageId;
        }
        _acceptIsDirty(isDirty) {
            (0, assert_1.ok)(!this._isDisposed);
            this._isDirty = isDirty;
        }
        _save() {
            if (this._isDisposed) {
                return Promise.reject(new Error('Document has been closed'));
            }
            return this._proxy.$trySaveDocument(this._uri);
        }
        _getTextInRange(_range) {
            const range = this._validateRange(_range);
            if (range.isEmpty) {
                return '';
            }
            if (range.isSingleLine) {
                return this._lines[range.start.line].substring(range.start.character, range.end.character);
            }
            const lineEnding = this._eol, startLineIndex = range.start.line, endLineIndex = range.end.line, resultLines = [];
            resultLines.push(this._lines[startLineIndex].substring(range.start.character));
            for (let i = startLineIndex + 1; i < endLineIndex; i++) {
                resultLines.push(this._lines[i]);
            }
            resultLines.push(this._lines[endLineIndex].substring(0, range.end.character));
            return resultLines.join(lineEnding);
        }
        _lineAt(lineOrPosition) {
            let line;
            if (lineOrPosition instanceof extHostTypes_1.Position) {
                line = lineOrPosition.line;
            }
            else if (typeof lineOrPosition === 'number') {
                line = lineOrPosition;
            }
            if (typeof line !== 'number' || line < 0 || line >= this._lines.length || Math.floor(line) !== line) {
                throw new Error('Illegal value for `line`');
            }
            return new ExtHostDocumentLine(line, this._lines[line], line === this._lines.length - 1);
        }
        _offsetAt(position) {
            position = this._validatePosition(position);
            this._ensureLineStarts();
            return this._lineStarts.getPrefixSum(position.line - 1) + position.character;
        }
        _positionAt(offset) {
            offset = Math.floor(offset);
            offset = Math.max(0, offset);
            this._ensureLineStarts();
            const out = this._lineStarts.getIndexOf(offset);
            const lineLength = this._lines[out.index].length;
            // Ensure we return a valid position
            return new extHostTypes_1.Position(out.index, Math.min(out.remainder, lineLength));
        }
        // ---- range math
        _validateRange(range) {
            if (!(range instanceof extHostTypes_1.Range)) {
                throw new Error('Invalid argument');
            }
            const start = this._validatePosition(range.start);
            const end = this._validatePosition(range.end);
            if (start === range.start && end === range.end) {
                return range;
            }
            return new extHostTypes_1.Range(start.line, start.character, end.line, end.character);
        }
        _validatePosition(position) {
            if (!(position instanceof extHostTypes_1.Position)) {
                throw new Error('Invalid argument');
            }
            if (this._lines.length === 0) {
                return position.with(0, 0);
            }
            let { line, character } = position;
            let hasChanged = false;
            if (line < 0) {
                line = 0;
                character = 0;
                hasChanged = true;
            }
            else if (line >= this._lines.length) {
                line = this._lines.length - 1;
                character = this._lines[line].length;
                hasChanged = true;
            }
            else {
                const maxCharacter = this._lines[line].length;
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
            return new extHostTypes_1.Position(line, character);
        }
        _getWordRangeAtPosition(_position, regexp) {
            const position = this._validatePosition(_position);
            if (!regexp) {
                // use default when custom-regexp isn't provided
                regexp = getWordDefinitionFor(this._languageId);
            }
            else if ((0, strings_1.regExpLeadsToEndlessLoop)(regexp)) {
                // use default when custom-regexp is bad
                throw new Error(`[getWordRangeAtPosition]: ignoring custom regexp '${regexp.source}' because it matches the empty string.`);
            }
            const wordAtText = (0, wordHelper_1.getWordAtText)(position.character + 1, (0, wordHelper_1.ensureValidWordDefinition)(regexp), this._lines[position.line], 0);
            if (wordAtText) {
                return new extHostTypes_1.Range(position.line, wordAtText.startColumn - 1, position.line, wordAtText.endColumn - 1);
            }
            return undefined;
        }
    }
    exports.ExtHostDocumentData = ExtHostDocumentData;
    class ExtHostDocumentLine {
        constructor(line, text, isLastLine) {
            this._line = line;
            this._text = text;
            this._isLastLine = isLastLine;
        }
        get lineNumber() {
            return this._line;
        }
        get text() {
            return this._text;
        }
        get range() {
            return new extHostTypes_1.Range(this._line, 0, this._line, this._text.length);
        }
        get rangeIncludingLineBreak() {
            if (this._isLastLine) {
                return this.range;
            }
            return new extHostTypes_1.Range(this._line, 0, this._line + 1, 0);
        }
        get firstNonWhitespaceCharacterIndex() {
            //TODO@api, rename to 'leadingWhitespaceLength'
            return /^(\s*)/.exec(this._text)[1].length;
        }
        get isEmptyOrWhitespace() {
            return this.firstNonWhitespaceCharacterIndex === this._text.length;
        }
    }
    exports.ExtHostDocumentLine = ExtHostDocumentLine;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERvY3VtZW50RGF0YS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3REb2N1bWVudERhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7SUFDN0QsU0FBZ0Isb0JBQW9CLENBQUMsVUFBa0IsRUFBRSxjQUFrQztRQUMxRixJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3BCLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUM5QzthQUFNO1lBQ04sMEJBQTBCLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztTQUMzRDtJQUNGLENBQUM7SUFORCxvREFNQztJQUVELFNBQVMsb0JBQW9CLENBQUMsVUFBa0I7UUFDL0MsT0FBTywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELE1BQWEsbUJBQW9CLFNBQVEsaUNBQWU7UUFLdkQsWUFDa0IsTUFBZ0MsRUFDakQsR0FBUSxFQUFFLEtBQWUsRUFBRSxHQUFXLEVBQUUsU0FBaUIsRUFDakQsV0FBbUIsRUFDbkIsUUFBaUIsRUFDVCxRQUE4QztZQUU5RCxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFOakIsV0FBTSxHQUFOLE1BQU0sQ0FBMEI7WUFFekMsZ0JBQVcsR0FBWCxXQUFXLENBQVE7WUFDbkIsYUFBUSxHQUFSLFFBQVEsQ0FBUztZQUNULGFBQVEsR0FBUixRQUFRLENBQXNDO1lBUHZELGdCQUFXLEdBQVksS0FBSyxDQUFDO1FBVXJDLENBQUM7UUFFUSxPQUFPO1lBQ2YsNENBQTRDO1lBQzVDLHdDQUF3QztZQUN4Qyw4Q0FBOEM7WUFDOUMsSUFBQSxXQUFFLEVBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdkIsQ0FBQztRQUVELFVBQVUsQ0FBQyxLQUF3QjtZQUNsQyxPQUFPLElBQUEsZUFBTSxFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELElBQUksUUFBUTtZQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNwQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUc7b0JBQ2hCLElBQUksR0FBRyxLQUFLLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQy9CLElBQUksUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUMzQyxJQUFJLFVBQVUsS0FBSyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDbEUsSUFBSSxVQUFVLEtBQUssT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDN0MsSUFBSSxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFDekMsSUFBSSxRQUFRLEtBQUssT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDM0MsSUFBSSxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDdkMsSUFBSSxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDL0IsT0FBTyxDQUFDLEtBQU0sSUFBSSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDaEYsSUFBSSxHQUFHLEtBQUssT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsd0JBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLHdCQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDeEUsSUFBSSxTQUFTLEtBQUssT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQzlDLE1BQU0sQ0FBQyxTQUFtQyxJQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQy9FLFFBQVEsQ0FBQyxHQUFHLElBQUksT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0MsVUFBVSxDQUFDLE1BQU0sSUFBSSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2RCxhQUFhLENBQUMsR0FBRyxJQUFJLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZELGdCQUFnQixDQUFDLEdBQUcsSUFBSSxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdELHNCQUFzQixDQUFDLEdBQUcsRUFBRSxNQUFPLElBQUksT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDMUYsQ0FBQzthQUNGO1lBQ0QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsaUJBQWlCLENBQUMsYUFBcUI7WUFDdEMsSUFBQSxXQUFFLEVBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUM7UUFDbEMsQ0FBQztRQUVELGNBQWMsQ0FBQyxPQUFnQjtZQUM5QixJQUFBLFdBQUUsRUFBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUN6QixDQUFDO1FBRU8sS0FBSztZQUNaLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDckIsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQzthQUM3RDtZQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVPLGVBQWUsQ0FBQyxNQUFvQjtZQUMzQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTFDLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtnQkFDbEIsT0FBTyxFQUFFLENBQUM7YUFDVjtZQUVELElBQUksS0FBSyxDQUFDLFlBQVksRUFBRTtnQkFDdkIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDM0Y7WUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUMzQixjQUFjLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQ2pDLFlBQVksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFDN0IsV0FBVyxHQUFhLEVBQUUsQ0FBQztZQUU1QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMvRSxLQUFLLElBQUksQ0FBQyxHQUFHLGNBQWMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdkQsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakM7WUFDRCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFOUUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFTyxPQUFPLENBQUMsY0FBd0M7WUFFdkQsSUFBSSxJQUF3QixDQUFDO1lBQzdCLElBQUksY0FBYyxZQUFZLHVCQUFRLEVBQUU7Z0JBQ3ZDLElBQUksR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDO2FBQzNCO2lCQUFNLElBQUksT0FBTyxjQUFjLEtBQUssUUFBUSxFQUFFO2dCQUM5QyxJQUFJLEdBQUcsY0FBYyxDQUFDO2FBQ3RCO1lBRUQsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3BHLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQzthQUM1QztZQUVELE9BQU8sSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUYsQ0FBQztRQUVPLFNBQVMsQ0FBQyxRQUF5QjtZQUMxQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLFdBQVksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO1FBQy9FLENBQUM7UUFFTyxXQUFXLENBQUMsTUFBYztZQUNqQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1QixNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFN0IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFakQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBRWpELG9DQUFvQztZQUNwQyxPQUFPLElBQUksdUJBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFRCxrQkFBa0I7UUFFVixjQUFjLENBQUMsS0FBbUI7WUFDekMsSUFBSSxDQUFDLENBQUMsS0FBSyxZQUFZLG9CQUFLLENBQUMsRUFBRTtnQkFDOUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTlDLElBQUksS0FBSyxLQUFLLEtBQUssQ0FBQyxLQUFLLElBQUksR0FBRyxLQUFLLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQy9DLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxPQUFPLElBQUksb0JBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVPLGlCQUFpQixDQUFDLFFBQXlCO1lBQ2xELElBQUksQ0FBQyxDQUFDLFFBQVEsWUFBWSx1QkFBUSxDQUFDLEVBQUU7Z0JBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQzthQUNwQztZQUVELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUM3QixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzNCO1lBRUQsSUFBSSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsR0FBRyxRQUFRLENBQUM7WUFDbkMsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBRXZCLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtnQkFDYixJQUFJLEdBQUcsQ0FBQyxDQUFDO2dCQUNULFNBQVMsR0FBRyxDQUFDLENBQUM7Z0JBQ2QsVUFBVSxHQUFHLElBQUksQ0FBQzthQUNsQjtpQkFDSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtnQkFDcEMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDOUIsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUNyQyxVQUFVLEdBQUcsSUFBSSxDQUFDO2FBQ2xCO2lCQUNJO2dCQUNKLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUM5QyxJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUU7b0JBQ2xCLFNBQVMsR0FBRyxDQUFDLENBQUM7b0JBQ2QsVUFBVSxHQUFHLElBQUksQ0FBQztpQkFDbEI7cUJBQ0ksSUFBSSxTQUFTLEdBQUcsWUFBWSxFQUFFO29CQUNsQyxTQUFTLEdBQUcsWUFBWSxDQUFDO29CQUN6QixVQUFVLEdBQUcsSUFBSSxDQUFDO2lCQUNsQjthQUNEO1lBRUQsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDaEIsT0FBTyxRQUFRLENBQUM7YUFDaEI7WUFDRCxPQUFPLElBQUksdUJBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVPLHVCQUF1QixDQUFDLFNBQTBCLEVBQUUsTUFBZTtZQUMxRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFbkQsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixnREFBZ0Q7Z0JBQ2hELE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7YUFFaEQ7aUJBQU0sSUFBSSxJQUFBLGtDQUF3QixFQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUM1Qyx3Q0FBd0M7Z0JBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMscURBQXFELE1BQU0sQ0FBQyxNQUFNLHdDQUF3QyxDQUFDLENBQUM7YUFDNUg7WUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFBLDBCQUFhLEVBQy9CLFFBQVEsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUN0QixJQUFBLHNDQUF5QixFQUFDLE1BQU0sQ0FBQyxFQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFDMUIsQ0FBQyxDQUNELENBQUM7WUFFRixJQUFJLFVBQVUsRUFBRTtnQkFDZixPQUFPLElBQUksb0JBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUNyRztZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7S0FDRDtJQW5ORCxrREFtTkM7SUFFRCxNQUFhLG1CQUFtQjtRQU0vQixZQUFZLElBQVksRUFBRSxJQUFZLEVBQUUsVUFBbUI7WUFDMUQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDL0IsQ0FBQztRQUVELElBQVcsVUFBVTtZQUNwQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDbkIsQ0FBQztRQUVELElBQVcsSUFBSTtZQUNkLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBRUQsSUFBVyxLQUFLO1lBQ2YsT0FBTyxJQUFJLG9CQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFRCxJQUFXLHVCQUF1QjtZQUNqQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3JCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQzthQUNsQjtZQUNELE9BQU8sSUFBSSxvQkFBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFRCxJQUFXLGdDQUFnQztZQUMxQywrQ0FBK0M7WUFDL0MsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDN0MsQ0FBQztRQUVELElBQVcsbUJBQW1CO1lBQzdCLE9BQU8sSUFBSSxDQUFDLGdDQUFnQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3BFLENBQUM7S0FDRDtJQXZDRCxrREF1Q0MifQ==