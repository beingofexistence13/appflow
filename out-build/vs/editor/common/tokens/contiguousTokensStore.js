/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/core/position", "vs/editor/common/tokens/contiguousTokensEditing", "vs/editor/common/tokens/lineTokens", "vs/editor/common/encodedTokenAttributes"], function (require, exports, arrays, position_1, contiguousTokensEditing_1, lineTokens_1, encodedTokenAttributes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FC = void 0;
    /**
     * Represents contiguous tokens in a text model.
     */
    class $FC {
        constructor(languageIdCodec) {
            this.c = [];
            this.d = 0;
            this.e = languageIdCodec;
        }
        flush() {
            this.c = [];
            this.d = 0;
        }
        get hasTokens() {
            return this.c.length > 0;
        }
        getTokens(topLevelLanguageId, lineIndex, lineText) {
            let rawLineTokens = null;
            if (lineIndex < this.d) {
                rawLineTokens = this.c[lineIndex];
            }
            if (rawLineTokens !== null && rawLineTokens !== contiguousTokensEditing_1.$Ys) {
                return new lineTokens_1.$Xs((0, contiguousTokensEditing_1.$1s)(rawLineTokens), lineText, this.e);
            }
            const lineTokens = new Uint32Array(2);
            lineTokens[0] = lineText.length;
            lineTokens[1] = getDefaultMetadata(this.e.encodeLanguageId(topLevelLanguageId));
            return new lineTokens_1.$Xs(lineTokens, lineText, this.e);
        }
        static f(topLevelLanguageId, lineTextLength, _tokens) {
            const tokens = _tokens ? (0, contiguousTokensEditing_1.$1s)(_tokens) : null;
            if (lineTextLength === 0) {
                let hasDifferentLanguageId = false;
                if (tokens && tokens.length > 1) {
                    hasDifferentLanguageId = (encodedTokenAttributes_1.$Us.getLanguageId(tokens[1]) !== topLevelLanguageId);
                }
                if (!hasDifferentLanguageId) {
                    return contiguousTokensEditing_1.$Ys;
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
        g(lineIndex) {
            while (lineIndex >= this.d) {
                this.c[this.d] = null;
                this.d++;
            }
        }
        h(start, deleteCount) {
            if (deleteCount === 0) {
                return;
            }
            if (start + deleteCount > this.d) {
                deleteCount = this.d - start;
            }
            this.c.splice(start, deleteCount);
            this.d -= deleteCount;
        }
        j(insertIndex, insertCount) {
            if (insertCount === 0) {
                return;
            }
            const lineTokens = [];
            for (let i = 0; i < insertCount; i++) {
                lineTokens[i] = null;
            }
            this.c = arrays.$Ub(this.c, insertIndex, lineTokens);
            this.d += insertCount;
        }
        setTokens(topLevelLanguageId, lineIndex, lineTextLength, _tokens, checkEquality) {
            const tokens = $FC.f(this.e.encodeLanguageId(topLevelLanguageId), lineTextLength, _tokens);
            this.g(lineIndex);
            const oldTokens = this.c[lineIndex];
            this.c[lineIndex] = tokens;
            if (checkEquality) {
                return !$FC.k(oldTokens, tokens);
            }
            return false;
        }
        static k(_a, _b) {
            if (!_a || !_b) {
                return !_a && !_b;
            }
            const a = (0, contiguousTokensEditing_1.$1s)(_a);
            const b = (0, contiguousTokensEditing_1.$1s)(_b);
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
            this.l(range);
            this.m(new position_1.$js(range.startLineNumber, range.startColumn), eolCount, firstLineLength);
        }
        l(range) {
            const firstLineIndex = range.startLineNumber - 1;
            if (firstLineIndex >= this.d) {
                return;
            }
            if (range.startLineNumber === range.endLineNumber) {
                if (range.startColumn === range.endColumn) {
                    // Nothing to delete
                    return;
                }
                this.c[firstLineIndex] = contiguousTokensEditing_1.$Zs.delete(this.c[firstLineIndex], range.startColumn - 1, range.endColumn - 1);
                return;
            }
            this.c[firstLineIndex] = contiguousTokensEditing_1.$Zs.deleteEnding(this.c[firstLineIndex], range.startColumn - 1);
            const lastLineIndex = range.endLineNumber - 1;
            let lastLineTokens = null;
            if (lastLineIndex < this.d) {
                lastLineTokens = contiguousTokensEditing_1.$Zs.deleteBeginning(this.c[lastLineIndex], range.endColumn - 1);
            }
            // Take remaining text on last line and append it to remaining text on first line
            this.c[firstLineIndex] = contiguousTokensEditing_1.$Zs.append(this.c[firstLineIndex], lastLineTokens);
            // Delete middle lines
            this.h(range.startLineNumber, range.endLineNumber - range.startLineNumber);
        }
        m(position, eolCount, firstLineLength) {
            if (eolCount === 0 && firstLineLength === 0) {
                // Nothing to insert
                return;
            }
            const lineIndex = position.lineNumber - 1;
            if (lineIndex >= this.d) {
                return;
            }
            if (eolCount === 0) {
                // Inserting text on one line
                this.c[lineIndex] = contiguousTokensEditing_1.$Zs.insert(this.c[lineIndex], position.column - 1, firstLineLength);
                return;
            }
            this.c[lineIndex] = contiguousTokensEditing_1.$Zs.deleteEnding(this.c[lineIndex], position.column - 1);
            this.c[lineIndex] = contiguousTokensEditing_1.$Zs.insert(this.c[lineIndex], position.column - 1, firstLineLength);
            this.j(position.lineNumber, eolCount);
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
    exports.$FC = $FC;
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
//# sourceMappingURL=contiguousTokensStore.js.map