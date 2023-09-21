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
    exports.$u0 = exports.$t0 = void 0;
    var SemanticTokensProviderStylingConstants;
    (function (SemanticTokensProviderStylingConstants) {
        SemanticTokensProviderStylingConstants[SemanticTokensProviderStylingConstants["NO_STYLING"] = 2147483647] = "NO_STYLING";
    })(SemanticTokensProviderStylingConstants || (SemanticTokensProviderStylingConstants = {}));
    let $t0 = class $t0 {
        constructor(e, f, g, h) {
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.b = false;
            this.c = false;
            this.d = false;
            this.a = new HashTable();
        }
        getMetadata(tokenTypeIndex, tokenModifierSet, languageId) {
            const encodedLanguageId = this.g.languageIdCodec.encodeLanguageId(languageId);
            const entry = this.a.get(tokenTypeIndex, tokenModifierSet, encodedLanguageId);
            let metadata;
            if (entry) {
                metadata = entry.metadata;
                if (this.h.getLevel() === log_1.LogLevel.Trace) {
                    this.h.trace(`SemanticTokensProviderStyling [CACHED] ${tokenTypeIndex} / ${tokenModifierSet}: foreground ${encodedTokenAttributes_1.$Us.getForeground(metadata)}, fontStyle ${encodedTokenAttributes_1.$Us.getFontStyle(metadata).toString(2)}`);
                }
            }
            else {
                let tokenType = this.e.tokenTypes[tokenTypeIndex];
                const tokenModifiers = [];
                if (tokenType) {
                    let modifierSet = tokenModifierSet;
                    for (let modifierIndex = 0; modifierSet > 0 && modifierIndex < this.e.tokenModifiers.length; modifierIndex++) {
                        if (modifierSet & 1) {
                            tokenModifiers.push(this.e.tokenModifiers[modifierIndex]);
                        }
                        modifierSet = modifierSet >> 1;
                    }
                    if (modifierSet > 0 && this.h.getLevel() === log_1.LogLevel.Trace) {
                        this.h.trace(`SemanticTokensProviderStyling: unknown token modifier index: ${tokenModifierSet.toString(2)} for legend: ${JSON.stringify(this.e.tokenModifiers)}`);
                        tokenModifiers.push('not-in-legend');
                    }
                    const tokenStyle = this.f.getColorTheme().getTokenStyleMetadata(tokenType, tokenModifiers, languageId);
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
                    if (this.h.getLevel() === log_1.LogLevel.Trace) {
                        this.h.trace(`SemanticTokensProviderStyling: unknown token type index: ${tokenTypeIndex} for legend: ${JSON.stringify(this.e.tokenTypes)}`);
                    }
                    metadata = 2147483647 /* SemanticTokensProviderStylingConstants.NO_STYLING */;
                    tokenType = 'not-in-legend';
                }
                this.a.add(tokenTypeIndex, tokenModifierSet, encodedLanguageId, metadata);
                if (this.h.getLevel() === log_1.LogLevel.Trace) {
                    this.h.trace(`SemanticTokensProviderStyling ${tokenTypeIndex} (${tokenType}) / ${tokenModifierSet} (${tokenModifiers.join(' ')}): foreground ${encodedTokenAttributes_1.$Us.getForeground(metadata)}, fontStyle ${encodedTokenAttributes_1.$Us.getFontStyle(metadata).toString(2)}`);
                }
            }
            return metadata;
        }
        warnOverlappingSemanticTokens(lineNumber, startColumn) {
            if (!this.b) {
                this.b = true;
                console.warn(`Overlapping semantic tokens detected at lineNumber ${lineNumber}, column ${startColumn}`);
            }
        }
        warnInvalidLengthSemanticTokens(lineNumber, startColumn) {
            if (!this.c) {
                this.c = true;
                console.warn(`Semantic token with invalid length detected at lineNumber ${lineNumber}, column ${startColumn}`);
            }
        }
        warnInvalidEditStart(previousResultId, resultId, editIndex, editStart, maxExpectedStart) {
            if (!this.d) {
                this.d = true;
                console.warn(`Invalid semantic tokens edit detected (previousResultId: ${previousResultId}, resultId: ${resultId}) at edit #${editIndex}: The provided start offset ${editStart} is outside the previous data (length ${maxExpectedStart}).`);
            }
        }
    };
    exports.$t0 = $t0;
    exports.$t0 = $t0 = __decorate([
        __param(1, themeService_1.$gv),
        __param(2, language_1.$ct),
        __param(3, log_1.$5i)
    ], $t0);
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
    function $u0(tokens, styling, languageId) {
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
            const tokens = sparseMultilineTokens_1.$uu.create(areaLine, destData);
            result.push(tokens);
        }
        return result;
    }
    exports.$u0 = $u0;
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
        static { this.a = [3, 7, 13, 31, 61, 127, 251, 509, 1021, 2039, 4093, 8191, 16381, 32749, 65521, 131071, 262139, 524287, 1048573, 2097143]; }
        constructor() {
            this.b = 0;
            this.c = 0;
            this.d = HashTable.a[this.c];
            this.e = Math.round(this.c + 1 < HashTable.a.length ? 2 / 3 * this.d : 0);
            this.f = [];
            HashTable.g(this.f, this.d);
        }
        static g(entries, length) {
            for (let i = 0; i < length; i++) {
                entries[i] = null;
            }
        }
        h(n1, n2) {
            return (((n1 << 5) - n1) + n2) | 0; // n1 * 31 + n2, keep as int32
        }
        j(tokenTypeIndex, tokenModifierSet, languageId) {
            return this.h(this.h(tokenTypeIndex, tokenModifierSet), languageId) % this.d;
        }
        get(tokenTypeIndex, tokenModifierSet, languageId) {
            const hash = this.j(tokenTypeIndex, tokenModifierSet, languageId);
            let p = this.f[hash];
            while (p) {
                if (p.tokenTypeIndex === tokenTypeIndex && p.tokenModifierSet === tokenModifierSet && p.languageId === languageId) {
                    return p;
                }
                p = p.next;
            }
            return null;
        }
        add(tokenTypeIndex, tokenModifierSet, languageId, metadata) {
            this.b++;
            if (this.e !== 0 && this.b >= this.e) {
                // expand!
                const oldElements = this.f;
                this.c++;
                this.d = HashTable.a[this.c];
                this.e = Math.round(this.c + 1 < HashTable.a.length ? 2 / 3 * this.d : 0);
                this.f = [];
                HashTable.g(this.f, this.d);
                for (const first of oldElements) {
                    let p = first;
                    while (p) {
                        const oldNext = p.next;
                        p.next = null;
                        this.k(p);
                        p = oldNext;
                    }
                }
            }
            this.k(new HashTableEntry(tokenTypeIndex, tokenModifierSet, languageId, metadata));
        }
        k(element) {
            const hash = this.j(element.tokenTypeIndex, element.tokenModifierSet, element.languageId);
            element.next = this.f[hash];
            this.f[hash] = element;
        }
    }
});
//# sourceMappingURL=semanticTokensProviderStyling.js.map