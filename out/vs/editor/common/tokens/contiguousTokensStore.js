/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/core/position", "vs/editor/common/tokens/contiguousTokensEditing", "vs/editor/common/tokens/lineTokens", "vs/editor/common/encodedTokenAttributes"], function (require, exports, arrays, position_1, contiguousTokensEditing_1, lineTokens_1, encodedTokenAttributes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContiguousTokensStore = void 0;
    /**
     * Represents contiguous tokens in a text model.
     */
    class ContiguousTokensStore {
        constructor(languageIdCodec) {
            this._lineTokens = [];
            this._len = 0;
            this._languageIdCodec = languageIdCodec;
        }
        flush() {
            this._lineTokens = [];
            this._len = 0;
        }
        get hasTokens() {
            return this._lineTokens.length > 0;
        }
        getTokens(topLevelLanguageId, lineIndex, lineText) {
            let rawLineTokens = null;
            if (lineIndex < this._len) {
                rawLineTokens = this._lineTokens[lineIndex];
            }
            if (rawLineTokens !== null && rawLineTokens !== contiguousTokensEditing_1.EMPTY_LINE_TOKENS) {
                return new lineTokens_1.LineTokens((0, contiguousTokensEditing_1.toUint32Array)(rawLineTokens), lineText, this._languageIdCodec);
            }
            const lineTokens = new Uint32Array(2);
            lineTokens[0] = lineText.length;
            lineTokens[1] = getDefaultMetadata(this._languageIdCodec.encodeLanguageId(topLevelLanguageId));
            return new lineTokens_1.LineTokens(lineTokens, lineText, this._languageIdCodec);
        }
        static _massageTokens(topLevelLanguageId, lineTextLength, _tokens) {
            const tokens = _tokens ? (0, contiguousTokensEditing_1.toUint32Array)(_tokens) : null;
            if (lineTextLength === 0) {
                let hasDifferentLanguageId = false;
                if (tokens && tokens.length > 1) {
                    hasDifferentLanguageId = (encodedTokenAttributes_1.TokenMetadata.getLanguageId(tokens[1]) !== topLevelLanguageId);
                }
                if (!hasDifferentLanguageId) {
                    return contiguousTokensEditing_1.EMPTY_LINE_TOKENS;
                }
            }
            if (!tokens || tokens.length === 0) {
                const tokens = new Uint32Array(2);
                tokens[0] = lineTextLength;
                tokens[1] = getDefaultMetadata(topLevelLanguageId);
                return tokens.buffer;
            }
            // Ensure the last token covers the end of the text
            tokens[tokens.length - 2] = lineTextLength;
            if (tokens.byteOffset === 0 && tokens.byteLength === tokens.buffer.byteLength) {
                // Store directly the ArrayBuffer pointer to save an object
                return tokens.buffer;
            }
            return tokens;
        }
        _ensureLine(lineIndex) {
            while (lineIndex >= this._len) {
                this._lineTokens[this._len] = null;
                this._len++;
            }
        }
        _deleteLines(start, deleteCount) {
            if (deleteCount === 0) {
                return;
            }
            if (start + deleteCount > this._len) {
                deleteCount = this._len - start;
            }
            this._lineTokens.splice(start, deleteCount);
            this._len -= deleteCount;
        }
        _insertLines(insertIndex, insertCount) {
            if (insertCount === 0) {
                return;
            }
            const lineTokens = [];
            for (let i = 0; i < insertCount; i++) {
                lineTokens[i] = null;
            }
            this._lineTokens = arrays.arrayInsert(this._lineTokens, insertIndex, lineTokens);
            this._len += insertCount;
        }
        setTokens(topLevelLanguageId, lineIndex, lineTextLength, _tokens, checkEquality) {
            const tokens = ContiguousTokensStore._massageTokens(this._languageIdCodec.encodeLanguageId(topLevelLanguageId), lineTextLength, _tokens);
            this._ensureLine(lineIndex);
            const oldTokens = this._lineTokens[lineIndex];
            this._lineTokens[lineIndex] = tokens;
            if (checkEquality) {
                return !ContiguousTokensStore._equals(oldTokens, tokens);
            }
            return false;
        }
        static _equals(_a, _b) {
            if (!_a || !_b) {
                return !_a && !_b;
            }
            const a = (0, contiguousTokensEditing_1.toUint32Array)(_a);
            const b = (0, contiguousTokensEditing_1.toUint32Array)(_b);
            if (a.length !== b.length) {
                return false;
            }
            for (let i = 0, len = a.length; i < len; i++) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        }
        //#region Editing
        acceptEdit(range, eolCount, firstLineLength) {
            this._acceptDeleteRange(range);
            this._acceptInsertText(new position_1.Position(range.startLineNumber, range.startColumn), eolCount, firstLineLength);
        }
        _acceptDeleteRange(range) {
            const firstLineIndex = range.startLineNumber - 1;
            if (firstLineIndex >= this._len) {
                return;
            }
            if (range.startLineNumber === range.endLineNumber) {
                if (range.startColumn === range.endColumn) {
                    // Nothing to delete
                    return;
                }
                this._lineTokens[firstLineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.delete(this._lineTokens[firstLineIndex], range.startColumn - 1, range.endColumn - 1);
                return;
            }
            this._lineTokens[firstLineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.deleteEnding(this._lineTokens[firstLineIndex], range.startColumn - 1);
            const lastLineIndex = range.endLineNumber - 1;
            let lastLineTokens = null;
            if (lastLineIndex < this._len) {
                lastLineTokens = contiguousTokensEditing_1.ContiguousTokensEditing.deleteBeginning(this._lineTokens[lastLineIndex], range.endColumn - 1);
            }
            // Take remaining text on last line and append it to remaining text on first line
            this._lineTokens[firstLineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.append(this._lineTokens[firstLineIndex], lastLineTokens);
            // Delete middle lines
            this._deleteLines(range.startLineNumber, range.endLineNumber - range.startLineNumber);
        }
        _acceptInsertText(position, eolCount, firstLineLength) {
            if (eolCount === 0 && firstLineLength === 0) {
                // Nothing to insert
                return;
            }
            const lineIndex = position.lineNumber - 1;
            if (lineIndex >= this._len) {
                return;
            }
            if (eolCount === 0) {
                // Inserting text on one line
                this._lineTokens[lineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.insert(this._lineTokens[lineIndex], position.column - 1, firstLineLength);
                return;
            }
            this._lineTokens[lineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.deleteEnding(this._lineTokens[lineIndex], position.column - 1);
            this._lineTokens[lineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.insert(this._lineTokens[lineIndex], position.column - 1, firstLineLength);
            this._insertLines(position.lineNumber, eolCount);
        }
        //#endregion
        setMultilineTokens(tokens, textModel) {
            if (tokens.length === 0) {
                return { changes: [] };
            }
            const ranges = [];
            for (let i = 0, len = tokens.length; i < len; i++) {
                const element = tokens[i];
                let minChangedLineNumber = 0;
                let maxChangedLineNumber = 0;
                let hasChange = false;
                for (let lineNumber = element.startLineNumber; lineNumber <= element.endLineNumber; lineNumber++) {
                    if (hasChange) {
                        this.setTokens(textModel.getLanguageId(), lineNumber - 1, textModel.getLineLength(lineNumber), element.getLineTokens(lineNumber), false);
                        maxChangedLineNumber = lineNumber;
                    }
                    else {
                        const lineHasChange = this.setTokens(textModel.getLanguageId(), lineNumber - 1, textModel.getLineLength(lineNumber), element.getLineTokens(lineNumber), true);
                        if (lineHasChange) {
                            hasChange = true;
                            minChangedLineNumber = lineNumber;
                            maxChangedLineNumber = lineNumber;
                        }
                    }
                }
                if (hasChange) {
                    ranges.push({ fromLineNumber: minChangedLineNumber, toLineNumber: maxChangedLineNumber, });
                }
            }
            return { changes: ranges };
        }
    }
    exports.ContiguousTokensStore = ContiguousTokensStore;
    function getDefaultMetadata(topLevelLanguageId) {
        return ((topLevelLanguageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */)
            | (0 /* StandardTokenType.Other */ << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)
            | (0 /* FontStyle.None */ << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)
            | (1 /* ColorId.DefaultForeground */ << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
            | (2 /* ColorId.DefaultBackground */ << 24 /* MetadataConsts.BACKGROUND_OFFSET */)
            // If there is no grammar, we just take a guess and try to match brackets.
            | (1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */)) >>> 0;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGlndW91c1Rva2Vuc1N0b3JlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi90b2tlbnMvY29udGlndW91c1Rva2Vuc1N0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRzs7T0FFRztJQUNILE1BQWEscUJBQXFCO1FBS2pDLFlBQVksZUFBaUM7WUFDNUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7WUFDZCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO1FBQ3pDLENBQUM7UUFFTSxLQUFLO1lBQ1gsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDZixDQUFDO1FBRUQsSUFBSSxTQUFTO1lBQ1osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVNLFNBQVMsQ0FBQyxrQkFBMEIsRUFBRSxTQUFpQixFQUFFLFFBQWdCO1lBQy9FLElBQUksYUFBYSxHQUFxQyxJQUFJLENBQUM7WUFDM0QsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDMUIsYUFBYSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDNUM7WUFFRCxJQUFJLGFBQWEsS0FBSyxJQUFJLElBQUksYUFBYSxLQUFLLDJDQUFpQixFQUFFO2dCQUNsRSxPQUFPLElBQUksdUJBQVUsQ0FBQyxJQUFBLHVDQUFhLEVBQUMsYUFBYSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2FBQ3JGO1lBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxXQUFXLENBQUMsQ0FBQyxD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