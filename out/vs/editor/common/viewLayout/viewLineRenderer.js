/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/strings", "vs/editor/common/core/stringBuilder", "vs/editor/common/viewLayout/lineDecorations", "vs/editor/common/viewLayout/linePart"], function (require, exports, nls, strings, stringBuilder_1, lineDecorations_1, linePart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderViewLine2 = exports.RenderLineOutput2 = exports.renderViewLine = exports.RenderLineOutput = exports.ForeignElementType = exports.CharacterMapping = exports.DomPosition = exports.RenderLineInput = exports.LineRange = exports.RenderWhitespace = void 0;
    var RenderWhitespace;
    (function (RenderWhitespace) {
        RenderWhitespace[RenderWhitespace["None"] = 0] = "None";
        RenderWhitespace[RenderWhitespace["Boundary"] = 1] = "Boundary";
        RenderWhitespace[RenderWhitespace["Selection"] = 2] = "Selection";
        RenderWhitespace[RenderWhitespace["Trailing"] = 3] = "Trailing";
        RenderWhitespace[RenderWhitespace["All"] = 4] = "All";
    })(RenderWhitespace || (exports.RenderWhitespace = RenderWhitespace = {}));
    class LineRange {
        constructor(startIndex, endIndex) {
            this.startOffset = startIndex;
            this.endOffset = endIndex;
        }
        equals(otherLineRange) {
            return this.startOffset === otherLineRange.startOffset
                && this.endOffset === otherLineRange.endOffset;
        }
    }
    exports.LineRange = LineRange;
    class RenderLineInput {
        constructor(useMonospaceOptimizations, canUseHalfwidthRightwardsArrow, lineContent, continuesWithWrappedLine, isBasicASCII, containsRTL, fauxIndentLength, lineTokens, lineDecorations, tabSize, startVisibleColumn, spaceWidth, middotWidth, wsmiddotWidth, stopRenderingLineAfter, renderWhitespace, renderControlCharacters, fontLigatures, selectionsOnLine) {
            this.useMonospaceOptimizations = useMonospaceOptimizations;
            this.canUseHalfwidthRightwardsArrow = canUseHalfwidthRightwardsArrow;
            this.lineContent = lineContent;
            this.continuesWithWrappedLine = continuesWithWrappedLine;
            this.isBasicASCII = isBasicASCII;
            this.containsRTL = containsRTL;
            this.fauxIndentLength = fauxIndentLength;
            this.lineTokens = lineTokens;
            this.lineDecorations = lineDecorations.sort(lineDecorations_1.LineDecoration.compare);
            this.tabSize = tabSize;
            this.startVisibleColumn = startVisibleColumn;
            this.spaceWidth = spaceWidth;
            this.stopRenderingLineAfter = stopRenderingLineAfter;
            this.renderWhitespace = (renderWhitespace === 'all'
                ? 4 /* RenderWhitespace.All */
                : renderWhitespace === 'boundary'
                    ? 1 /* RenderWhitespace.Boundary */
                    : renderWhitespace === 'selection'
                        ? 2 /* RenderWhitespace.Selection */
                        : renderWhitespace === 'trailing'
                            ? 3 /* RenderWhitespace.Trailing */
                            : 0 /* RenderWhitespace.None */);
            this.renderControlCharacters = renderControlCharacters;
            this.fontLigatures = fontLigatures;
            this.selectionsOnLine = selectionsOnLine && selectionsOnLine.sort((a, b) => a.startOffset < b.startOffset ? -1 : 1);
            const wsmiddotDiff = Math.abs(wsmiddotWidth - spaceWidth);
            const middotDiff = Math.abs(middotWidth - spaceWidth);
            if (wsmiddotDiff < middotDiff) {
                this.renderSpaceWidth = wsmiddotWidth;
                this.renderSpaceCharCode = 0x2E31; // U+2E31 - WORD SEPARATOR MIDDLE DOT
            }
            else {
                this.renderSpaceWidth = middotWidth;
                this.renderSpaceCharCode = 0xB7; // U+00B7 - MIDDLE DOT
            }
        }
        sameSelection(otherSelections) {
            if (this.selectionsOnLine === null) {
                return otherSelections === null;
            }
            if (otherSelections === null) {
                return false;
            }
            if (otherSelections.length !== this.selectionsOnLine.length) {
                return false;
            }
            for (let i = 0; i < this.selectionsOnLine.length; i++) {
                if (!this.selectionsOnLine[i].equals(otherSelections[i])) {
                    return false;
                }
            }
            return true;
        }
        equals(other) {
            return (this.useMonospaceOptimizations === other.useMonospaceOptimizations
                && this.canUseHalfwidthRightwardsArrow === other.canUseHalfwidthRightwardsArrow
                && this.lineContent === other.lineContent
                && this.continuesWithWrappedLine === other.continuesWithWrappedLine
                && this.isBasicASCII === other.isBasicASCII
                && this.containsRTL === other.containsRTL
                && this.fauxIndentLength === other.fauxIndentLength
                && this.tabSize === other.tabSize
                && this.startVisibleColumn === other.startVisibleColumn
                && this.spaceWidth === other.spaceWidth
                && this.renderSpaceWidth === other.renderSpaceWidth
                && this.renderSpaceCharCode === other.renderSpaceCharCode
                && this.stopRenderingLineAfter === other.stopRenderingLineAfter
                && this.renderWhitespace === other.renderWhitespace
                && this.renderControlCharacters === other.renderControlCharacters
                && this.fontLigatures === other.fontLigatures
                && lineDecorations_1.LineDecoration.equalsArr(this.lineDecorations, other.lineDecorations)
                && this.lineTokens.equals(other.lineTokens)
                && this.sameSelection(other.selectionsOnLine));
        }
    }
    exports.RenderLineInput = RenderLineInput;
    var CharacterMappingConstants;
    (function (CharacterMappingConstants) {
        CharacterMappingConstants[CharacterMappingConstants["PART_INDEX_MASK"] = 4294901760] = "PART_INDEX_MASK";
        CharacterMappingConstants[CharacterMappingConstants["CHAR_INDEX_MASK"] = 65535] = "CHAR_INDEX_MASK";
        CharacterMappingConstants[CharacterMappingConstants["CHAR_INDEX_OFFSET"] = 0] = "CHAR_INDEX_OFFSET";
        CharacterMappingConstants[CharacterMappingConstants["PART_INDEX_OFFSET"] = 16] = "PART_INDEX_OFFSET";
    })(CharacterMappingConstants || (CharacterMappingConstants = {}));
    class DomPosition {
        constructor(partIndex, charIndex) {
            this.partIndex = partIndex;
            this.charIndex = charIndex;
        }
    }
    exports.DomPosition = DomPosition;
    /**
     * Provides a both direction mapping between a line's character and its rendered position.
     */
    class CharacterMapping {
        static getPartIndex(partData) {
            return (partData & 4294901760 /* CharacterMappingConstants.PART_INDEX_MASK */) >>> 16 /* CharacterMappingConstants.PART_INDEX_OFFSET */;
        }
        static getCharIndex(partData) {
            return (partData & 65535 /* CharacterMappingConstants.CHAR_INDEX_MASK */) >>> 0 /* CharacterMappingConstants.CHAR_INDEX_OFFSET */;
        }
        constructor(length, partCount) {
            this.length = length;
            this._data = new Uint32Array(this.length);
            this._horizontalOffset = new Uint32Array(this.length);
        }
        setColumnInfo(column, partIndex, charIndex, horizontalOffset) {
            const partData = ((partIndex << 16 /* CharacterMappingConstants.PART_INDEX_OFFSET */)
                | (charIndex << 0 /* CharacterMappingConstants.CHAR_INDEX_OFFSET */)) >>> 0;
            this._data[column - 1] = partData;
            this._horizontalOffset[column - 1] = horizontalOffset;
        }
        getHorizontalOffset(column) {
            if (this._horizontalOffset.length === 0) {
                // No characters on this line
                return 0;
            }
            return this._horizontalOffset[column - 1];
        }
        charOffsetToPartData(charOffset) {
            if (this.length === 0) {
                return 0;
            }
            if (charOffset < 0) {
                return this._data[0];
            }
            if (charOffset >= this.length) {
                return this._data[this.length - 1];
            }
            return this._data[charOffset];
        }
        getDomPosition(column) {
            const partData = this.charOffsetToPartData(column - 1);
            const partIndex = CharacterMapping.getPartIndex(partData);
            const charIndex = CharacterMapping.getCharIndex(partData);
            return new DomPosition(partIndex, charIndex);
        }
        getColumn(domPosition, partLength) {
            const charOffset = this.partDataToCharOffset(domPosition.partIndex, partLength, domPosition.charIndex);
            return charOffset + 1;
        }
        partDataToCharOffset(partIndex, partLength, charIndex) {
            if (this.length === 0) {
                return 0;
            }
            const searchEntry = ((partIndex << 16 /* CharacterMappingConstants.PART_INDEX_OFFSET */)
                | (charIndex << 0 /* CharacterMappingConstants.CHAR_INDEX_OFFSET */)) >>> 0;
            let min = 0;
            let max = this.length - 1;
            while (min + 1 < max) {
                const mid = ((min + max) >>> 1);
                const midEntry = this._data[mid];
                if (midEntry === searchEntry) {
                    return mid;
                }
                else if (midEntry > searchEntry) {
                    max = mid;
                }
                else {
                    min = mid;
                }
            }
            if (min === max) {
                return min;
            }
            const minEntry = this._data[min];
            const maxEntry = this._data[max];
            if (minEntry === searchEntry) {
                return min;
            }
            if (maxEntry === searchEntry) {
                return max;
            }
            const minPartIndex = CharacterMapping.getPartIndex(minEntry);
            const minCharIndex = CharacterMapping.getCharIndex(minEntry);
            const maxPartIndex = CharacterMapping.getPartIndex(maxEntry);
            let maxCharIndex;
            if (minPartIndex !== maxPartIndex) {
                // sitting between parts
                maxCharIndex = partLength;
            }
            else {
                maxCharIndex = CharacterMapping.getCharIndex(maxEntry);
            }
            const minEntryDistance = charIndex - minCharIndex;
            const maxEntryDistance = maxCharIndex - charIndex;
            if (minEntryDistance <= maxEntryDistance) {
                return min;
            }
            return max;
        }
        inflate() {
            const result = [];
            for (let i = 0; i < this.length; i++) {
                const partData = this._data[i];
                const partIndex = CharacterMapping.getPartIndex(partData);
                const charIndex = CharacterMapping.getCharIndex(partData);
                const visibleColumn = this._horizontalOffset[i];
                result.push([partIndex, charIndex, visibleColumn]);
            }
            return result;
        }
    }
    exports.CharacterMapping = CharacterMapping;
    var ForeignElementType;
    (function (ForeignElementType) {
        ForeignElementType[ForeignElementType["None"] = 0] = "None";
        ForeignElementType[ForeignElementType["Before"] = 1] = "Before";
        ForeignElementType[ForeignElementType["After"] = 2] = "After";
    })(ForeignElementType || (exports.ForeignElementType = ForeignElementType = {}));
    class RenderLineOutput {
        constructor(characterMapping, containsRTL, containsForeignElements) {
            this._renderLineOutputBrand = undefined;
            this.characterMapping = characterMapping;
            this.containsRTL = containsRTL;
            this.containsForeignElements = containsForeignElements;
        }
    }
    exports.RenderLineOutput = RenderLineOutput;
    function renderViewLine(input, sb) {
        if (input.lineContent.length === 0) {
            if (input.lineDecorations.length > 0) {
                // This line is empty, but it contains inline decorations
                sb.appendString(`<span>`);
                let beforeCount = 0;
                let afterCount = 0;
                let containsForeignElements = 0 /* ForeignElementType.None */;
                for (const lineDecoration of input.lineDecorations) {
                    if (lineDecoration.type === 1 /* InlineDecorationType.Before */ || lineDecoration.type === 2 /* InlineDecorationType.After */) {
                        sb.appendString(`<span class="`);
                        sb.appendString(lineDecoration.className);
                        sb.appendString(`"></span>`);
                        if (lineDecoration.type === 1 /* InlineDecorationType.Before */) {
                            containsForeignElements |= 1 /* ForeignElementType.Before */;
                            beforeCount++;
                        }
                        if (lineDecoration.type === 2 /* InlineDecorationType.After */) {
                            containsForeignElements |= 2 /* ForeignElementType.After */;
                            afterCount++;
                        }
                    }
                }
                sb.appendString(`</span>`);
                const characterMapping = new CharacterMapping(1, beforeCount + afterCount);
                characterMapping.setColumnInfo(1, beforeCount, 0, 0);
                return new RenderLineOutput(characterMapping, false, containsForeignElements);
            }
            // completely empty line
            sb.appendString('<span><span></span></span>');
            return new RenderLineOutput(new CharacterMapping(0, 0), false, 0 /* ForeignElementType.None */);
        }
        return _renderLine(resolveRenderLineInput(input), sb);
    }
    exports.renderViewLine = renderViewLine;
    class RenderLineOutput2 {
        constructor(characterMapping, html, containsRTL, containsForeignElements) {
            this.characterMapping = characterMapping;
            this.html = html;
            this.containsRTL = containsRTL;
            this.containsForeignElements = containsForeignElements;
        }
    }
    exports.RenderLineOutput2 = RenderLineOutput2;
    function renderViewLine2(input) {
        const sb = new stringBuilder_1.StringBuilder(10000);
        const out = renderViewLine(input, sb);
        return new RenderLineOutput2(out.characterMapping, sb.build(), out.containsRTL, out.containsForeignElements);
    }
    exports.renderViewLine2 = renderViewLine2;
    class ResolvedRenderLineInput {
        constructor(fontIsMonospace, canUseHalfwidthRightwardsArrow, lineContent, len, isOverflowing, overflowingCharCount, parts, containsForeignElements, fauxIndentLength, tabSize, startVisibleColumn, containsRTL, spaceWidth, renderSpaceCharCode, renderWhitespace, renderControlCharacters) {
            this.fontIsMonospace = fontIsMonospace;
            this.canUseHalfwidthRightwardsArrow = canUseHalfwidthRightwardsArrow;
            this.lineContent = lineContent;
            this.len = len;
            this.isOverflowing = isOverflowing;
            this.overflowingCharCount = overflowingCharCount;
            this.parts = parts;
            this.containsForeignElements = containsForeignElements;
            this.fauxIndentLength = fauxIndentLength;
            this.tabSize = tabSize;
            this.startVisibleColumn = startVisibleColumn;
            this.containsRTL = containsRTL;
            this.spaceWidth = spaceWidth;
            this.renderSpaceCharCode = renderSpaceCharCode;
            this.renderWhitespace = renderWhitespace;
            this.renderControlCharacters = renderControlCharacters;
            //
        }
    }
    function resolveRenderLineInput(input) {
        const lineContent = input.lineContent;
        let isOverflowing;
        let overflowingCharCount;
        let len;
        if (input.stopRenderingLineAfter !== -1 && input.stopRenderingLineAfter < lineContent.length) {
            isOverflowing = true;
            overflowingCharCount = lineContent.length - input.stopRenderingLineAfter;
            len = input.stopRenderingLineAfter;
        }
        else {
            isOverflowing = false;
            overflowingCharCount = 0;
            len = lineContent.length;
        }
        let tokens = transformAndRemoveOverflowing(lineContent, input.containsRTL, input.lineTokens, input.fauxIndentLength, len);
        if (input.renderControlCharacters && !input.isBasicASCII) {
            // Calling `extractControlCharacters` before adding (possibly empty) line parts
            // for inline decorations. `extractControlCharacters` removes empty line parts.
            tokens = extractControlCharacters(lineContent, tokens);
        }
        if (input.renderWhitespace === 4 /* RenderWhitespace.All */ ||
            input.renderWhitespace === 1 /* RenderWhitespace.Boundary */ ||
            (input.renderWhitespace === 2 /* RenderWhitespace.Selection */ && !!input.selectionsOnLine) ||
            (input.renderWhitespace === 3 /* RenderWhitespace.Trailing */ && !input.continuesWithWrappedLine)) {
            tokens = _applyRenderWhitespace(input, lineContent, len, tokens);
        }
        let containsForeignElements = 0 /* ForeignElementType.None */;
        if (input.lineDecorations.length > 0) {
            for (let i = 0, len = input.lineDecorations.length; i < len; i++) {
                const lineDecoration = input.lineDecorations[i];
                if (lineDecoration.type === 3 /* InlineDecorationType.RegularAffectingLetterSpacing */) {
                    // Pretend there are foreign elements... although not 100% accurate.
                    containsForeignElements |= 1 /* ForeignElementType.Before */;
                }
                else if (lineDecoration.type === 1 /* InlineDecorationType.Before */) {
                    containsForeignElements |= 1 /* ForeignElementType.Before */;
                }
                else if (lineDecoration.type === 2 /* InlineDecorationType.After */) {
                    containsForeignElements |= 2 /* ForeignElementType.After */;
                }
            }
            tokens = _applyInlineDecorations(lineContent, len, tokens, input.lineDecorations);
        }
        if (!input.containsRTL) {
            // We can never split RTL text, as it ruins the rendering
            tokens = splitLargeTokens(lineContent, tokens, !input.isBasicASCII || input.fontLigatures);
        }
        return new ResolvedRenderLineInput(input.useMonospaceOptimizations, input.canUseHalfwidthRightwardsArrow, lineContent, len, isOverflowing, overflowingCharCount, tokens, containsForeignElements, input.fauxIndentLength, input.tabSize, input.startVisibleColumn, input.containsRTL, input.spaceWidth, input.renderSpaceCharCode, input.renderWhitespace, input.renderControlCharacters);
    }
    /**
     * In the rendering phase, characters are always looped until token.endIndex.
     * Ensure that all tokens end before `len` and the last one ends precisely at `len`.
     */
    function transformAndRemoveOverflowing(lineContent, lineContainsRTL, tokens, fauxIndentLength, len) {
        const result = [];
        let resultLen = 0;
        // The faux indent part of the line should have no token type
        if (fauxIndentLength > 0) {
            result[resultLen++] = new linePart_1.LinePart(fauxIndentLength, '', 0, false);
        }
        let startOffset = fauxIndentLength;
        for (let tokenIndex = 0, tokensLen = tokens.getCount(); tokenIndex < tokensLen; tokenIndex++) {
            const endIndex = tokens.getEndOffset(tokenIndex);
            if (endIndex <= fauxIndentLength) {
                // The faux indent part of the line should have no token type
                continue;
            }
            const type = tokens.getClassName(tokenIndex);
            if (endIndex >= len) {
                const tokenContainsRTL = (lineContainsRTL ? strings.containsRTL(lineContent.substring(startOffset, len)) : false);
                result[resultLen++] = new linePart_1.LinePart(len, type, 0, tokenContainsRTL);
                break;
            }
            const tokenContainsRTL = (lineContainsRTL ? strings.containsRTL(lineContent.substring(startOffset, endIndex)) : false);
            result[resultLen++] = new linePart_1.LinePart(endIndex, type, 0, tokenContainsRTL);
            startOffset = endIndex;
        }
        return result;
    }
    /**
     * written as a const enum to get value inlining.
     */
    var Constants;
    (function (Constants) {
        Constants[Constants["LongToken"] = 50] = "LongToken";
    })(Constants || (Constants = {}));
    /**
     * See https://github.com/microsoft/vscode/issues/6885.
     * It appears that having very large spans causes very slow reading of character positions.
     * So here we try to avoid that.
     */
    function splitLargeTokens(lineContent, tokens, onlyAtSpaces) {
        let lastTokenEndIndex = 0;
        const result = [];
        let resultLen = 0;
        if (onlyAtSpaces) {
            // Split only at spaces => we need to walk each character
            for (let i = 0, len = tokens.length; i < len; i++) {
                const token = tokens[i];
                const tokenEndIndex = token.endIndex;
                if (lastTokenEndIndex + 50 /* Constants.LongToken */ < tokenEndIndex) {
                    const tokenType = token.type;
                    const tokenMetadata = token.metadata;
                    const tokenContainsRTL = token.containsRTL;
                    let lastSpaceOffset = -1;
                    let currTokenStart = lastTokenEndIndex;
                    for (let j = lastTokenEndIndex; j < tokenEndIndex; j++) {
                        if (lineContent.charCodeAt(j) === 32 /* CharCode.Space */) {
                            lastSpaceOffset = j;
                        }
                        if (lastSpaceOffset !== -1 && j - currTokenStart >= 50 /* Constants.LongToken */) {
                            // Split at `lastSpaceOffset` + 1
                            result[resultLen++] = new linePart_1.LinePart(lastSpaceOffset + 1, tokenType, tokenMetadata, tokenContainsRTL);
                            currTokenStart = lastSpaceOffset + 1;
                            lastSpaceOffset = -1;
                        }
                    }
                    if (currTokenStart !== tokenEndIndex) {
                        result[resultLen++] = new linePart_1.LinePart(tokenEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
                    }
                }
                else {
                    result[resultLen++] = token;
                }
                lastTokenEndIndex = tokenEndIndex;
            }
        }
        else {
            // Split anywhere => we don't need to walk each character
            for (let i = 0, len = tokens.length; i < len; i++) {
                const token = tokens[i];
                const tokenEndIndex = token.endIndex;
                const diff = (tokenEndIndex - lastTokenEndIndex);
                if (diff > 50 /* Constants.LongToken */) {
                    const tokenType = token.type;
                    const tokenMetadata = token.metadata;
                    const tokenContainsRTL = token.containsRTL;
                    const piecesCount = Math.ceil(diff / 50 /* Constants.LongToken */);
                    for (let j = 1; j < piecesCount; j++) {
                        const pieceEndIndex = lastTokenEndIndex + (j * 50 /* Constants.LongToken */);
                        result[resultLen++] = new linePart_1.LinePart(pieceEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
                    }
                    result[resultLen++] = new linePart_1.LinePart(tokenEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
                }
                else {
                    result[resultLen++] = token;
                }
                lastTokenEndIndex = tokenEndIndex;
            }
        }
        return result;
    }
    function isControlCharacter(charCode) {
        if (charCode < 32) {
            return (charCode !== 9 /* CharCode.Tab */);
        }
        if (charCode === 127) {
            // DEL
            return true;
        }
        if ((charCode >= 0x202A && charCode <= 0x202E)
            || (charCode >= 0x2066 && charCode <= 0x2069)
            || (charCode >= 0x200E && charCode <= 0x200F)
            || charCode === 0x061C) {
            // Unicode Directional Formatting Characters
            // LRE	U+202A	LEFT-TO-RIGHT EMBEDDING
            // RLE	U+202B	RIGHT-TO-LEFT EMBEDDING
            // PDF	U+202C	POP DIRECTIONAL FORMATTING
            // LRO	U+202D	LEFT-TO-RIGHT OVERRIDE
            // RLO	U+202E	RIGHT-TO-LEFT OVERRIDE
            // LRI	U+2066	LEFT-TO-RIGHT ISOLATE
            // RLI	U+2067	RIGHT-TO-LEFT ISOLATE
            // FSI	U+2068	FIRST STRONG ISOLATE
            // PDI	U+2069	POP DIRECTIONAL ISOLATE
            // LRM	U+200E	LEFT-TO-RIGHT MARK
            // RLM	U+200F	RIGHT-TO-LEFT MARK
            // ALM	U+061C	ARABIC LETTER MARK
            return true;
        }
        return false;
    }
    function extractControlCharacters(lineContent, tokens) {
        const result = [];
        let lastLinePart = new linePart_1.LinePart(0, '', 0, false);
        let charOffset = 0;
        for (const token of tokens) {
            const tokenEndIndex = token.endIndex;
            for (; charOffset < tokenEndIndex; charOffset++) {
                const charCode = lineContent.charCodeAt(charOffset);
                if (isControlCharacter(charCode)) {
                    if (charOffset > lastLinePart.endIndex) {
                        // emit previous part if it has text
                        lastLinePart = new linePart_1.LinePart(charOffset, token.type, token.metadata, token.containsRTL);
                        result.push(lastLinePart);
                    }
                    lastLinePart = new linePart_1.LinePart(charOffset + 1, 'mtkcontrol', token.metadata, false);
                    result.push(lastLinePart);
                }
            }
            if (charOffset > lastLinePart.endIndex) {
                // emit previous part if it has text
                lastLinePart = new linePart_1.LinePart(tokenEndIndex, token.type, token.metadata, token.containsRTL);
                result.push(lastLinePart);
            }
        }
        return result;
    }
    /**
     * Whitespace is rendered by "replacing" tokens with a special-purpose `mtkw` type that is later recognized in the rendering phase.
     * Moreover, a token is created for every visual indent because on some fonts the glyphs used for rendering whitespace (&rarr; or &middot;) do not have the same width as &nbsp;.
     * The rendering phase will generate `style="width:..."` for these tokens.
     */
    function _applyRenderWhitespace(input, lineContent, len, tokens) {
        const continuesWithWrappedLine = input.continuesWithWrappedLine;
        const fauxIndentLength = input.fauxIndentLength;
        const tabSize = input.tabSize;
        const startVisibleColumn = input.startVisibleColumn;
        const useMonospaceOptimizations = input.useMonospaceOptimizations;
        const selections = input.selectionsOnLine;
        const onlyBoundary = (input.renderWhitespace === 1 /* RenderWhitespace.Boundary */);
        const onlyTrailing = (input.renderWhitespace === 3 /* RenderWhitespace.Trailing */);
        const generateLinePartForEachWhitespace = (input.renderSpaceWidth !== input.spaceWidth);
        const result = [];
        let resultLen = 0;
        let tokenIndex = 0;
        let tokenType = tokens[tokenIndex].type;
        let tokenContainsRTL = tokens[tokenIndex].containsRTL;
        let tokenEndIndex = tokens[tokenIndex].endIndex;
        const tokensLength = tokens.length;
        let lineIsEmptyOrWhitespace = false;
        let firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(lineContent);
        let lastNonWhitespaceIndex;
        if (firstNonWhitespaceIndex === -1) {
            lineIsEmptyOrWhitespace = true;
            firstNonWhitespaceIndex = len;
            lastNonWhitespaceIndex = len;
        }
        else {
            lastNonWhitespaceIndex = strings.lastNonWhitespaceIndex(lineContent);
        }
        let wasInWhitespace = false;
        let currentSelectionIndex = 0;
        let currentSelection = selections && selections[currentSelectionIndex];
        let tmpIndent = startVisibleColumn % tabSize;
        for (let charIndex = fauxIndentLength; charIndex < len; charIndex++) {
            const chCode = lineContent.charCodeAt(charIndex);
            if (currentSelection && charIndex >= currentSelection.endOffset) {
                currentSelectionIndex++;
                currentSelection = selections && selections[currentSelectionIndex];
            }
            let isInWhitespace;
            if (charIndex < firstNonWhitespaceIndex || charIndex > lastNonWhitespaceIndex) {
                // in leading or trailing whitespace
                isInWhitespace = true;
            }
            else if (chCode === 9 /* CharCode.Tab */) {
                // a tab character is rendered both in all and boundary cases
                isInWhitespace = true;
            }
            else if (chCode === 32 /* CharCode.Space */) {
                // hit a space character
                if (onlyBoundary) {
                    // rendering only boundary whitespace
                    if (wasInWhitespace) {
                        isInWhitespace = true;
                    }
                    else {
                        const nextChCode = (charIndex + 1 < len ? lineContent.charCodeAt(charIndex + 1) : 0 /* CharCode.Null */);
                        isInWhitespace = (nextChCode === 32 /* CharCode.Space */ || nextChCode === 9 /* CharCode.Tab */);
                    }
                }
                else {
                    isInWhitespace = true;
                }
            }
            else {
                isInWhitespace = false;
            }
            // If rendering whitespace on selection, check that the charIndex falls within a selection
            if (isInWhitespace && selections) {
                isInWhitespace = !!currentSelection && currentSelection.startOffset <= charIndex && currentSelection.endOffset > charIndex;
            }
            // If rendering only trailing whitespace, check that the charIndex points to trailing whitespace.
            if (isInWhitespace && onlyTrailing) {
                isInWhitespace = lineIsEmptyOrWhitespace || charIndex > lastNonWhitespaceIndex;
            }
            if (isInWhitespace && tokenContainsRTL) {
                // If the token contains RTL text, breaking it up into multiple line parts
                // to render whitespace might affect the browser's bidi layout.
                //
                // We render whitespace in such tokens only if the whitespace
                // is the leading or the trailing whitespace of the line,
                // which doesn't affect the browser's bidi layout.
                if (charIndex >= firstNonWhitespaceIndex && charIndex <= lastNonWhitespaceIndex) {
                    isInWhitespace = false;
                }
            }
            if (wasInWhitespace) {
                // was in whitespace token
                if (!isInWhitespace || (!useMonospaceOptimizations && tmpIndent >= tabSize)) {
                    // leaving whitespace token or entering a new indent
                    if (generateLinePartForEachWhitespace) {
                        const lastEndIndex = (resultLen > 0 ? result[resultLen - 1].endIndex : fauxIndentLength);
                        for (let i = lastEndIndex + 1; i <= charIndex; i++) {
                            result[resultLen++] = new linePart_1.LinePart(i, 'mtkw', 1 /* LinePartMetadata.IS_WHITESPACE */, false);
                        }
                    }
                    else {
                        result[resultLen++] = new linePart_1.LinePart(charIndex, 'mtkw', 1 /* LinePartMetadata.IS_WHITESPACE */, false);
                    }
                    tmpIndent = tmpIndent % tabSize;
                }
            }
            else {
                // was in regular token
                if (charIndex === tokenEndIndex || (isInWhitespace && charIndex > fauxIndentLength)) {
                    result[resultLen++] = new linePart_1.LinePart(charIndex, tokenType, 0, tokenContainsRTL);
                    tmpIndent = tmpIndent % tabSize;
                }
            }
            if (chCode === 9 /* CharCode.Tab */) {
                tmpIndent = tabSize;
            }
            else if (strings.isFullWidthCharacter(chCode)) {
                tmpIndent += 2;
            }
            else {
                tmpIndent++;
            }
            wasInWhitespace = isInWhitespace;
            while (charIndex === tokenEndIndex) {
                tokenIndex++;
                if (tokenIndex < tokensLength) {
                    tokenType = tokens[tokenIndex].type;
                    tokenContainsRTL = tokens[tokenIndex].containsRTL;
                    tokenEndIndex = tokens[tokenIndex].endIndex;
                }
                else {
                    break;
                }
            }
        }
        let generateWhitespace = false;
        if (wasInWhitespace) {
            // was in whitespace token
            if (continuesWithWrappedLine && onlyBoundary) {
                const lastCharCode = (len > 0 ? lineContent.charCodeAt(len - 1) : 0 /* CharCode.Null */);
                const prevCharCode = (len > 1 ? lineContent.charCodeAt(len - 2) : 0 /* CharCode.Null */);
                const isSingleTrailingSpace = (lastCharCode === 32 /* CharCode.Space */ && (prevCharCode !== 32 /* CharCode.Space */ && prevCharCode !== 9 /* CharCode.Tab */));
                if (!isSingleTrailingSpace) {
                    generateWhitespace = true;
                }
            }
            else {
                generateWhitespace = true;
            }
        }
        if (generateWhitespace) {
            if (generateLinePartForEachWhitespace) {
                const lastEndIndex = (resultLen > 0 ? result[resultLen - 1].endIndex : fauxIndentLength);
                for (let i = lastEndIndex + 1; i <= len; i++) {
                    result[resultLen++] = new linePart_1.LinePart(i, 'mtkw', 1 /* LinePartMetadata.IS_WHITESPACE */, false);
                }
            }
            else {
                result[resultLen++] = new linePart_1.LinePart(len, 'mtkw', 1 /* LinePartMetadata.IS_WHITESPACE */, false);
            }
        }
        else {
            result[resultLen++] = new linePart_1.LinePart(len, tokenType, 0, tokenContainsRTL);
        }
        return result;
    }
    /**
     * Inline decorations are "merged" on top of tokens.
     * Special care must be taken when multiple inline decorations are at play and they overlap.
     */
    function _applyInlineDecorations(lineContent, len, tokens, _lineDecorations) {
        _lineDecorations.sort(lineDecorations_1.LineDecoration.compare);
        const lineDecorations = lineDecorations_1.LineDecorationsNormalizer.normalize(lineContent, _lineDecorations);
        const lineDecorationsLen = lineDecorations.length;
        let lineDecorationIndex = 0;
        const result = [];
        let resultLen = 0;
        let lastResultEndIndex = 0;
        for (let tokenIndex = 0, len = tokens.length; tokenIndex < len; tokenIndex++) {
            const token = tokens[tokenIndex];
            const tokenEndIndex = token.endIndex;
            const tokenType = token.type;
            const tokenMetadata = token.metadata;
            const tokenContainsRTL = token.containsRTL;
            while (lineDecorationIndex < lineDecorationsLen && lineDecorations[lineDecorationIndex].startOffset < tokenEndIndex) {
                const lineDecoration = lineDecorations[lineDecorationIndex];
                if (lineDecoration.startOffset > lastResultEndIndex) {
                    lastResultEndIndex = lineDecoration.startOffset;
                    result[resultLen++] = new linePart_1.LinePart(lastResultEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
                }
                if (lineDecoration.endOffset + 1 <= tokenEndIndex) {
                    // This line decoration ends before this token ends
                    lastResultEndIndex = lineDecoration.endOffset + 1;
                    result[resultLen++] = new linePart_1.LinePart(lastResultEndIndex, tokenType + ' ' + lineDecoration.className, tokenMetadata | lineDecoration.metadata, tokenContainsRTL);
                    lineDecorationIndex++;
                }
                else {
                    // This line decoration continues on to the next token
                    lastResultEndIndex = tokenEndIndex;
                    result[resultLen++] = new linePart_1.LinePart(lastResultEndIndex, tokenType + ' ' + lineDecoration.className, tokenMetadata | lineDecoration.metadata, tokenContainsRTL);
                    break;
                }
            }
            if (tokenEndIndex > lastResultEndIndex) {
                lastResultEndIndex = tokenEndIndex;
                result[resultLen++] = new linePart_1.LinePart(lastResultEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
            }
        }
        const lastTokenEndIndex = tokens[tokens.length - 1].endIndex;
        if (lineDecorationIndex < lineDecorationsLen && lineDecorations[lineDecorationIndex].startOffset === lastTokenEndIndex) {
            while (lineDecorationIndex < lineDecorationsLen && lineDecorations[lineDecorationIndex].startOffset === lastTokenEndIndex) {
                const lineDecoration = lineDecorations[lineDecorationIndex];
                result[resultLen++] = new linePart_1.LinePart(lastResultEndIndex, lineDecoration.className, lineDecoration.metadata, false);
                lineDecorationIndex++;
            }
        }
        return result;
    }
    /**
     * This function is on purpose not split up into multiple functions to allow runtime type inference (i.e. performance reasons).
     * Notice how all the needed data is fully resolved and passed in (i.e. no other calls).
     */
    function _renderLine(input, sb) {
        const fontIsMonospace = input.fontIsMonospace;
        const canUseHalfwidthRightwardsArrow = input.canUseHalfwidthRightwardsArrow;
        const containsForeignElements = input.containsForeignElements;
        const lineContent = input.lineContent;
        const len = input.len;
        const isOverflowing = input.isOverflowing;
        const overflowingCharCount = input.overflowingCharCount;
        const parts = input.parts;
        const fauxIndentLength = input.fauxIndentLength;
        const tabSize = input.tabSize;
        const startVisibleColumn = input.startVisibleColumn;
        const containsRTL = input.containsRTL;
        const spaceWidth = input.spaceWidth;
        const renderSpaceCharCode = input.renderSpaceCharCode;
        const renderWhitespace = input.renderWhitespace;
        const renderControlCharacters = input.renderControlCharacters;
        const characterMapping = new CharacterMapping(len + 1, parts.length);
        let lastCharacterMappingDefined = false;
        let charIndex = 0;
        let visibleColumn = startVisibleColumn;
        let charOffsetInPart = 0; // the character offset in the current part
        let charHorizontalOffset = 0; // the character horizontal position in terms of chars relative to line start
        let partDisplacement = 0;
        if (containsRTL) {
            sb.appendString('<span dir="ltr">');
        }
        else {
            sb.appendString('<span>');
        }
        for (let partIndex = 0, tokensLen = parts.length; partIndex < tokensLen; partIndex++) {
            const part = parts[partIndex];
            const partEndIndex = part.endIndex;
            const partType = part.type;
            const partContainsRTL = part.containsRTL;
            const partRendersWhitespace = (renderWhitespace !== 0 /* RenderWhitespace.None */ && part.isWhitespace());
            const partRendersWhitespaceWithWidth = partRendersWhitespace && !fontIsMonospace && (partType === 'mtkw' /*only whitespace*/ || !containsForeignElements);
            const partIsEmptyAndHasPseudoAfter = (charIndex === partEndIndex && part.isPseudoAfter());
            charOffsetInPart = 0;
            sb.appendString('<span ');
            if (partContainsRTL) {
                sb.appendString('style="unicode-bidi:isolate" ');
            }
            sb.appendString('class="');
            sb.appendString(partRendersWhitespaceWithWidth ? 'mtkz' : partType);
            sb.appendASCIICharCode(34 /* CharCode.DoubleQuote */);
            if (partRendersWhitespace) {
                let partWidth = 0;
                {
                    let _charIndex = charIndex;
                    let _visibleColumn = visibleColumn;
                    for (; _charIndex < partEndIndex; _charIndex++) {
                        const charCode = lineContent.charCodeAt(_charIndex);
                        const charWidth = (charCode === 9 /* CharCode.Tab */ ? (tabSize - (_visibleColumn % tabSize)) : 1) | 0;
                        partWidth += charWidth;
                        if (_charIndex >= fauxIndentLength) {
                            _visibleColumn += charWidth;
                        }
                    }
                }
                if (partRendersWhitespaceWithWidth) {
                    sb.appendString(' style="width:');
                    sb.appendString(String(spaceWidth * partWidth));
                    sb.appendString('px"');
                }
                sb.appendASCIICharCode(62 /* CharCode.GreaterThan */);
                for (; charIndex < partEndIndex; charIndex++) {
                    characterMapping.setColumnInfo(charIndex + 1, partIndex - partDisplacement, charOffsetInPart, charHorizontalOffset);
                    partDisplacement = 0;
                    const charCode = lineContent.charCodeAt(charIndex);
                    let producedCharacters;
                    let charWidth;
                    if (charCode === 9 /* CharCode.Tab */) {
                        producedCharacters = (tabSize - (visibleColumn % tabSize)) | 0;
                        charWidth = producedCharacters;
                        if (!canUseHalfwidthRightwardsArrow || charWidth > 1) {
                            sb.appendCharCode(0x2192); // RIGHTWARDS ARROW
                        }
                        else {
                            sb.appendCharCode(0xFFEB); // HALFWIDTH RIGHTWARDS ARROW
                        }
                        for (let space = 2; space <= charWidth; space++) {
                            sb.appendCharCode(0xA0); // &nbsp;
                        }
                    }
                    else { // must be CharCode.Space
                        producedCharacters = 2;
                        charWidth = 1;
                        sb.appendCharCode(renderSpaceCharCode); // &middot; or word separator middle dot
                        sb.appendCharCode(0x200C); // ZERO WIDTH NON-JOINER
                    }
                    charOffsetInPart += producedCharacters;
                    charHorizontalOffset += charWidth;
                    if (charIndex >= fauxIndentLength) {
                        visibleColumn += charWidth;
                    }
                }
            }
            else {
                sb.appendASCIICharCode(62 /* CharCode.GreaterThan */);
                for (; charIndex < partEndIndex; charIndex++) {
                    characterMapping.setColumnInfo(charIndex + 1, partIndex - partDisplacement, charOffsetInPart, charHorizontalOffset);
                    partDisplacement = 0;
                    const charCode = lineContent.charCodeAt(charIndex);
                    let producedCharacters = 1;
                    let charWidth = 1;
                    switch (charCode) {
                        case 9 /* CharCode.Tab */:
                            producedCharacters = (tabSize - (visibleColumn % tabSize));
                            charWidth = producedCharacters;
                            for (let space = 1; space <= producedCharacters; space++) {
                                sb.appendCharCode(0xA0); // &nbsp;
                            }
                            break;
                        case 32 /* CharCode.Space */:
                            sb.appendCharCode(0xA0); // &nbsp;
                            break;
                        case 60 /* CharCode.LessThan */:
                            sb.appendString('&lt;');
                            break;
                        case 62 /* CharCode.GreaterThan */:
                            sb.appendString('&gt;');
                            break;
                        case 38 /* CharCode.Ampersand */:
                            sb.appendString('&amp;');
                            break;
                        case 0 /* CharCode.Null */:
                            if (renderControlCharacters) {
                                // See https://unicode-table.com/en/blocks/control-pictures/
                                sb.appendCharCode(9216);
                            }
                            else {
                                sb.appendString('&#00;');
                            }
                            break;
                        case 65279 /* CharCode.UTF8_BOM */:
                        case 8232 /* CharCode.LINE_SEPARATOR */:
                        case 8233 /* CharCode.PARAGRAPH_SEPARATOR */:
                        case 133 /* CharCode.NEXT_LINE */:
                            sb.appendCharCode(0xFFFD);
                            break;
                        default:
                            if (strings.isFullWidthCharacter(charCode)) {
                                charWidth++;
                            }
                            // See https://unicode-table.com/en/blocks/control-pictures/
                            if (renderControlCharacters && charCode < 32) {
                                sb.appendCharCode(9216 + charCode);
                            }
                            else if (renderControlCharacters && charCode === 127) {
                                // DEL
                                sb.appendCharCode(9249);
                            }
                            else if (renderControlCharacters && isControlCharacter(charCode)) {
                                sb.appendString('[U+');
                                sb.appendString(to4CharHex(charCode));
                                sb.appendString(']');
                                producedCharacters = 8;
                                charWidth = producedCharacters;
                            }
                            else {
                                sb.appendCharCode(charCode);
                            }
                    }
                    charOffsetInPart += producedCharacters;
                    charHorizontalOffset += charWidth;
                    if (charIndex >= fauxIndentLength) {
                        visibleColumn += charWidth;
                    }
                }
            }
            if (partIsEmptyAndHasPseudoAfter) {
                partDisplacement++;
            }
            else {
                partDisplacement = 0;
            }
            if (charIndex >= len && !lastCharacterMappingDefined && part.isPseudoAfter()) {
                lastCharacterMappingDefined = true;
                characterMapping.setColumnInfo(charIndex + 1, partIndex, charOffsetInPart, charHorizontalOffset);
            }
            sb.appendString('</span>');
        }
        if (!lastCharacterMappingDefined) {
            // When getting client rects for the last character, we will position the
            // text range at the end of the span, insteaf of at the beginning of next span
            characterMapping.setColumnInfo(len + 1, parts.length - 1, charOffsetInPart, charHorizontalOffset);
        }
        if (isOverflowing) {
            sb.appendString('<span class="mtkoverflow">');
            sb.appendString(nls.localize('showMore', "Show more ({0})", renderOverflowingCharCount(overflowingCharCount)));
            sb.appendString('</span>');
        }
        sb.appendString('</span>');
        return new RenderLineOutput(characterMapping, containsRTL, containsForeignElements);
    }
    function to4CharHex(n) {
        return n.toString(16).toUpperCase().padStart(4, '0');
    }
    function renderOverflowingCharCount(n) {
        if (n < 1024) {
            return nls.localize('overflow.chars', "{0} chars", n);
        }
        if (n < 1024 * 1024) {
            return `${(n / 1024).toFixed(1)} KB`;
        }
        return `${(n / 1024 / 1024).toFixed(1)} MB`;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0xpbmVSZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vdmlld0xheW91dC92aWV3TGluZVJlbmRlcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxJQUFrQixnQkFNakI7SUFORCxXQUFrQixnQkFBZ0I7UUFDakMsdURBQVEsQ0FBQTtRQUNSLCtEQUFZLENBQUE7UUFDWixpRUFBYSxDQUFBO1FBQ2IsK0RBQVksQ0FBQTtRQUNaLHFEQUFPLENBQUE7SUFDUixDQUFDLEVBTmlCLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBTWpDO0lBRUQsTUFBYSxTQUFTO1FBV3JCLFlBQVksVUFBa0IsRUFBRSxRQUFnQjtZQUMvQyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztZQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMzQixDQUFDO1FBRU0sTUFBTSxDQUFDLGNBQXlCO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxjQUFjLENBQUMsV0FBVzttQkFDbEQsSUFBSSxDQUFDLFNBQVMsS0FBSyxjQUFjLENBQUMsU0FBUyxDQUFDO1FBQ2pELENBQUM7S0FDRDtJQXBCRCw4QkFvQkM7SUFFRCxNQUFhLGVBQWU7UUEyQjNCLFlBQ0MseUJBQWtDLEVBQ2xDLDhCQUF1QyxFQUN2QyxXQUFtQixFQUNuQix3QkFBaUMsRUFDakMsWUFBcUIsRUFDckIsV0FBb0IsRUFDcEIsZ0JBQXdCLEVBQ3hCLFVBQTJCLEVBQzNCLGVBQWlDLEVBQ2pDLE9BQWUsRUFDZixrQkFBMEIsRUFDMUIsVUFBa0IsRUFDbEIsV0FBbUIsRUFDbkIsYUFBcUIsRUFDckIsc0JBQThCLEVBQzlCLGdCQUF3RSxFQUN4RSx1QkFBZ0MsRUFDaEMsYUFBc0IsRUFDdEIsZ0JBQW9DO1lBRXBDLElBQUksQ0FBQyx5QkFBeUIs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