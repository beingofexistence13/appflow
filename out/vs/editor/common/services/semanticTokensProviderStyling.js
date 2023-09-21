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
define(["require", "exports", "vs/editor/common/encodedTokenAttributes", "vs/platform/theme/common/themeService", "vs/platform/log/common/log", "vs/editor/common/tokens/sparseMultilineTokens", "vs/editor/common/languages/language"], function (require, exports, encodedTokenAttributes_1, themeService_1, log_1, sparseMultilineTokens_1, language_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toMultilineTokens2 = exports.SemanticTokensProviderStyling = void 0;
    var SemanticTokensProviderStylingConstants;
    (function (SemanticTokensProviderStylingConstants) {
        SemanticTokensProviderStylingConstants[SemanticTokensProviderStylingConstants["NO_STYLING"] = 2147483647] = "NO_STYLING";
    })(SemanticTokensProviderStylingConstants || (SemanticTokensProviderStylingConstants = {}));
    let SemanticTokensProviderStyling = class SemanticTokensProviderStyling {
        constructor(_legend, _themeService, _languageService, _logService) {
            this._legend = _legend;
            this._themeService = _themeService;
            this._languageService = _languageService;
            this._logService = _logService;
            this._hasWarnedOverlappingTokens = false;
            this._hasWarnedInvalidLengthTokens = false;
            this._hasWarnedInvalidEditStart = false;
            this._hashTable = new HashTable();
        }
        getMetadata(tokenTypeIndex, tokenModifierSet, languageId) {
            const encodedLanguageId = this._languageService.languageIdCodec.encodeLanguageId(languageId);
            const entry = this._hashTable.get(tokenTypeIndex, tokenModifierSet, encodedLanguageId);
            let metadata;
            if (entry) {
                metadata = entry.metadata;
                if (this._logService.getLevel() === log_1.LogLevel.Trace) {
                    this._logService.trace(`SemanticTokensProviderStyling [CACHED] ${tokenTypeIndex} / ${tokenModifierSet}: foreground ${encodedTokenAttributes_1.TokenMetadata.getForeground(metadata)}, fontStyle ${encodedTokenAttributes_1.TokenMetadata.getFontStyle(metadata).toString(2)}`);
                }
            }
            else {
                let tokenType = this._legend.tokenTypes[tokenTypeIndex];
                const tokenModifiers = [];
                if (tokenType) {
                    let modifierSet = tokenModifierSet;
                    for (let modifierIndex = 0; modifierSet > 0 && modifierIndex < this._legend.tokenModifiers.length; modifierIndex++) {
                        if (modifierSet & 1) {
                            tokenModifiers.push(this._legend.tokenModifiers[modifierIndex]);
                        }
                        modifierSet = modifierSet >> 1;
                    }
                    if (modifierSet > 0 && this._logService.getLevel() === log_1.LogLevel.Trace) {
                        this._logService.trace(`SemanticTokensProviderStyling: unknown token modifier index: ${tokenModifierSet.toString(2)} for legend: ${JSON.stringify(this._legend.tokenModifiers)}`);
                        tokenModifiers.push('not-in-legend');
                    }
                    const tokenStyle = this._themeService.getColorTheme().getTokenStyleMetadata(tokenType, tokenModifiers, languageId);
                    if (typeof tokenStyle === 'undefined') {
                        metadata = 2147483647 /* SemanticTokensProviderStylingConstants.NO_STYLING */;
                    }
                    else {
                        metadata = 0;
                        if (typeof tokenStyle.italic !== 'undefined') {
                            const italicBit = (tokenStyle.italic ? 1 /* FontStyle.Italic */ : 0) << 11 /* MetadataConsts.FONT_STYLE_OFFSET */;
                            metadata |= italicBit | 1 /* MetadataConsts.SEMANTIC_USE_ITALIC */;
                        }
                        if (typeof tokenStyle.bold !== 'undefined') {
                            const boldBit = (tokenStyle.bold ? 2 /* FontStyle.Bold */ : 0) << 11 /* MetadataConsts.FONT_STYLE_OFFSET */;
                            metadata |= boldBit | 2 /* MetadataConsts.SEMANTIC_USE_BOLD */;
                        }
                        if (typeof tokenStyle.underline !== 'undefined') {
                            const underlineBit = (tokenStyle.underline ? 4 /* FontStyle.Underline */ : 0) << 11 /* MetadataConsts.FONT_STYLE_OFFSET */;
                            metadata |= underlineBit | 4 /* MetadataConsts.SEMANTIC_USE_UNDERLINE */;
                        }
                        if (typeof tokenStyle.strikethrough !== 'undefined') {
                            const strikethroughBit = (tokenStyle.strikethrough ? 8 /* FontStyle.Strikethrough */ : 0) << 11 /* MetadataConsts.FONT_STYLE_OFFSET */;
                            metadata |= strikethroughBit | 8 /* MetadataConsts.SEMANTIC_USE_STRIKETHROUGH */;
                        }
                        if (tokenStyle.foreground) {
                            const foregroundBits = (tokenStyle.foreground) << 15 /* MetadataConsts.FOREGROUND_OFFSET */;
                            metadata |= foregroundBits | 16 /* MetadataConsts.SEMANTIC_USE_FOREGROUND */;
                        }
                        if (metadata === 0) {
                            // Nothing!
                            metadata = 2147483647 /* SemanticTokensProviderStylingConstants.NO_STYLING */;
                        }
                    }
                }
                else {
                    if (this._logService.getLevel() === log_1.LogLevel.Trace) {
                        this._logService.trace(`SemanticTokensProviderStyling: unknown token type index: ${tokenTypeIndex} for legend: ${JSON.stringify(this._legend.tokenTypes)}`);
                    }
                    metadata = 2147483647 /* SemanticTokensProviderStylingConstants.NO_STYLING */;
                    tokenType = 'not-in-legend';
                }
                this._hashTable.add(tokenTypeIndex, tokenModifierSet, encodedLanguageId, metadata);
                if (this._logService.getLevel() === log_1.LogLevel.Trace) {
                    this._logService.trace(`SemanticTokensProviderStyling ${tokenTypeIndex} (${tokenType}) / ${tokenModifierSet} (${tokenModifiers.join(' ')}): foreground ${encodedTokenAttributes_1.TokenMetadata.getForeground(metadata)}, fontStyle ${encodedTokenAttributes_1.TokenMetadata.getFontStyle(metadata).toString(2)}`);
                }
            }
            return metadata;
        }
        warnOverlappingSemanticTokens(lineNumber, startColumn) {
            if (!this._hasWarnedOverlappingTokens) {
                this._hasWarnedOverlappingTokens = true;
                console.warn(`Overlapping semantic tokens detected at lineNumber ${lineNumber}, column ${startColumn}`);
            }
        }
        warnInvalidLengthSemanticTokens(lineNumber, startColumn) {
            if (!this._hasWarnedInvalidLengthTokens) {
                this._hasWarnedInvalidLengthTokens = true;
                console.warn(`Semantic token with invalid length detected at lineNumber ${lineNumber}, column ${startColumn}`);
            }
        }
        warnInvalidEditStart(previousResultId, resultId, editIndex, editStart, maxExpectedStart) {
            if (!this._hasWarnedInvalidEditStart) {
                this._hasWarnedInvalidEditStart = true;
                console.warn(`Invalid semantic tokens edit detected (previousResultId: ${previousResultId}, resultId: ${resultId}) at edit #${editIndex}: The provided start offset ${editStart} is outside the previous data (length ${maxExpectedStart}).`);
            }
        }
    };
    exports.SemanticTokensProviderStyling = SemanticTokensProviderStyling;
    exports.SemanticTokensProviderStyling = SemanticTokensProviderStyling = __decorate([
        __param(1, themeService_1.IThemeService),
        __param(2, language_1.ILanguageService),
        __param(3, log_1.ILogService)
    ], SemanticTokensProviderStyling);
    var SemanticColoringConstants;
    (function (SemanticColoringConstants) {
        /**
         * Let's aim at having 8KB buffers if possible...
         * So that would be 8192 / (5 * 4) = 409.6 tokens per area
         */
        SemanticColoringConstants[SemanticColoringConstants["DesiredTokensPerArea"] = 400] = "DesiredTokensPerArea";
        /**
         * Try to keep the total number of areas under 1024 if possible,
         * simply compensate by having more tokens per area...
         */
        SemanticColoringConstants[SemanticColoringConstants["DesiredMaxAreas"] = 1024] = "DesiredMaxAreas";
    })(SemanticColoringConstants || (SemanticColoringConstants = {}));
    function toMultilineTokens2(tokens, styling, languageId) {
        const srcData = tokens.data;
        const tokenCount = (tokens.data.length / 5) | 0;
        const tokensPerArea = Math.max(Math.ceil(tokenCount / 1024 /* SemanticColoringConstants.DesiredMaxAreas */), 400 /* SemanticColoringConstants.DesiredTokensPerArea */);
        const result = [];
        let tokenIndex = 0;
        let lastLineNumber = 1;
        let lastStartCharacter = 0;
        while (tokenIndex < tokenCount) {
            const tokenStartIndex = tokenIndex;
            let tokenEndIndex = Math.min(tokenStartIndex + tokensPerArea, tokenCount);
            // Keep tokens on the same line in the same area...
            if (tokenEndIndex < tokenCount) {
                let smallTokenEndIndex = tokenEndIndex;
                while (smallTokenEndIndex - 1 > tokenStartIndex && srcData[5 * smallTokenEndIndex] === 0) {
                    smallTokenEndIndex--;
                }
                if (smallTokenEndIndex - 1 === tokenStartIndex) {
                    // there are so many tokens on this line that our area would be empty, we must now go right
                    let bigTokenEndIndex = tokenEndIndex;
                    while (bigTokenEndIndex + 1 < tokenCount && srcData[5 * bigTokenEndIndex] === 0) {
                        bigTokenEndIndex++;
                    }
                    tokenEndIndex = bigTokenEndIndex;
                }
                else {
                    tokenEndIndex = smallTokenEndIndex;
                }
            }
            let destData = new Uint32Array((tokenEndIndex - tokenStartIndex) * 4);
            let destOffset = 0;
            let areaLine = 0;
            let prevLineNumber = 0;
            let prevEndCharacter = 0;
            while (tokenIndex < tokenEndIndex) {
                const srcOffset = 5 * tokenIndex;
                const deltaLine = srcData[srcOffset];
                const deltaCharacter = srcData[srcOffset + 1];
                // Casting both `lineNumber`, `startCharacter` and `endCharacter` here to uint32 using `|0`
                // to validate below with the actual values that will be inserted in the Uint32Array result
                const lineNumber = (lastLineNumber + deltaLine) | 0;
                const startCharacter = (deltaLine === 0 ? (lastStartCharacter + deltaCharacter) | 0 : deltaCharacter);
                const length = srcData[srcOffset + 2];
                const endCharacter = (startCharacter + length) | 0;
                const tokenTypeIndex = srcData[srcOffset + 3];
                const tokenModifierSet = srcData[srcOffset + 4];
                if (endCharacter <= startCharacter) {
                    // this token is invalid (most likely a negative length casted to uint32)
                    styling.warnInvalidLengthSemanticTokens(lineNumber, startCharacter + 1);
                }
                else if (prevLineNumber === lineNumber && prevEndCharacter > startCharacter) {
                    // this token overlaps with the previous token
                    styling.warnOverlappingSemanticTokens(lineNumber, startCharacter + 1);
                }
                else {
                    const metadata = styling.getMetadata(tokenTypeIndex, tokenModifierSet, languageId);
                    if (metadata !== 2147483647 /* SemanticTokensProviderStylingConstants.NO_STYLING */) {
                        if (areaLine === 0) {
                            areaLine = lineNumber;
                        }
                        destData[destOffset] = lineNumber - areaLine;
                        destData[destOffset + 1] = startCharacter;
                        destData[destOffset + 2] = endCharacter;
                        destData[destOffset + 3] = metadata;
                        destOffset += 4;
                        prevLineNumber = lineNumber;
                        prevEndCharacter = endCharacter;
                    }
                }
                lastLineNumber = lineNumber;
                lastStartCharacter = startCharacter;
                tokenIndex++;
            }
            if (destOffset !== destData.length) {
                destData = destData.subarray(0, destOffset);
            }
            const tokens = sparseMultilineTokens_1.SparseMultilineTokens.create(areaLine, destData);
            result.push(tokens);
        }
        return result;
    }
    exports.toMultilineTokens2 = toMultilineTokens2;
    class HashTableEntry {
        constructor(tokenTypeIndex, tokenModifierSet, languageId, metadata) {
            this.tokenTypeIndex = tokenTypeIndex;
            this.tokenModifierSet = tokenModifierSet;
            this.languageId = languageId;
            this.metadata = metadata;
            this.next = null;
        }
    }
    class HashTable {
        static { this._SIZES = [3, 7, 13, 31, 61, 127, 251, 509, 1021, 2039, 4093, 8191, 16381, 32749, 65521, 131071, 262139, 524287, 1048573, 2097143]; }
        constructor() {
            this._elementsCount = 0;
            this._currentLengthIndex = 0;
            this._currentLength = HashTable._SIZES[this._currentLengthIndex];
            this._growCount = Math.round(this._currentLengthIndex + 1 < HashTable._SIZES.length ? 2 / 3 * this._currentLength : 0);
            this._elements = [];
            HashTable._nullOutEntries(this._elements, this._currentLength);
        }
        static _nullOutEntries(entries, length) {
            for (let i = 0; i < length; i++) {
                entries[i] = null;
            }
        }
        _hash2(n1, n2) {
            return (((n1 << 5) - n1) + n2) | 0; // n1 * 31 + n2, keep as int32
        }
        _hashFunc(tokenTypeIndex, tokenModifierSet, languageId) {
            return this._hash2(this._hash2(tokenTypeIndex, tokenModifierSet), languageId) % this._currentLength;
        }
        get(tokenTypeIndex, tokenModifierSet, languageId) {
            const hash = this._hashFunc(tokenTypeIndex, tokenModifierSet, languageId);
            let p = this._elements[hash];
            while (p) {
                if (p.tokenTypeIndex === tokenTypeIndex && p.tokenModifierSet === tokenModifierSet && p.languageId === languageId) {
                    return p;
                }
                p = p.next;
            }
            return null;
        }
        add(tokenTypeIndex, tokenModifierSet, languageId, metadata) {
            this._elementsCount++;
            if (this._growCount !== 0 && this._elementsCount >= this._growCount) {
                // expand!
                const oldElements = this._elements;
                this._currentLengthIndex++;
                this._currentLength = HashTable._SIZES[this._currentLengthIndex];
                this._growCount = Math.round(this._currentLengthIndex + 1 < HashTable._SIZES.length ? 2 / 3 * this._currentLength : 0);
                this._elements = [];
                HashTable._nullOutEntries(this._elements, this._currentLength);
                for (const first of oldElements) {
                    let p = first;
                    while (p) {
                        const oldNext = p.next;
                        p.next = null;
                        this._add(p);
                        p = oldNext;
                    }
                }
            }
            this._add(new HashTableEntry(tokenTypeIndex, tokenModifierSet, languageId, metadata));
        }
        _add(element) {
            const hash = this._hashFunc(element.tokenTypeIndex, element.tokenModifierSet, element.languageId);
            element.next = this._elements[hash];
            this._elements[hash] = element;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VtYW50aWNUb2tlbnNQcm92aWRlclN0eWxpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3NlcnZpY2VzL3NlbWFudGljVG9rZW5zUHJvdmlkZXJTdHlsaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVNoRyxJQUFXLHNDQUVWO0lBRkQsV0FBVyxzQ0FBc0M7UUFDaEQsd0hBQStDLENBQUE7SUFDaEQsQ0FBQyxFQUZVLHNDQUFzQyxLQUF0QyxzQ0FBc0MsUUFFaEQ7SUFFTSxJQUFNLDZCQUE2QixHQUFuQyxNQUFNLDZCQUE2QjtRQU96QyxZQUNrQixPQUE2QixFQUMvQixhQUE2QyxFQUMxQyxnQkFBbUQsRUFDeEQsV0FBeUM7WUFIckMsWUFBTyxHQUFQLE9BQU8sQ0FBc0I7WUFDZCxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUN6QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ3ZDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBUi9DLGdDQUEyQixHQUFHLEtBQUssQ0FBQztZQUNwQyxrQ0FBNkIsR0FBRyxLQUFLLENBQUM7WUFDdEMsK0JBQTBCLEdBQUcsS0FBSyxDQUFDO1lBUTFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUNuQyxDQUFDO1FBRU0sV0FBVyxDQUFDLGNBQXNCLEVBQUUsZ0JBQXdCLEVBQUUsVUFBa0I7WUFDdEYsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdGLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3ZGLElBQUksUUFBZ0IsQ0FBQztZ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