/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/characterClassifier", "vs/editor/common/textModelEvents", "vs/editor/common/modelLineProjectionData"], function (require, exports, strings, characterClassifier_1, textModelEvents_1, modelLineProjectionData_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MonospaceLineBreaksComputerFactory = void 0;
    class MonospaceLineBreaksComputerFactory {
        static create(options) {
            return new MonospaceLineBreaksComputerFactory(options.get(132 /* EditorOption.wordWrapBreakBeforeCharacters */), options.get(131 /* EditorOption.wordWrapBreakAfterCharacters */));
        }
        constructor(breakBeforeChars, breakAfterChars) {
            this.classifier = new WrappingCharacterClassifier(breakBeforeChars, breakAfterChars);
        }
        createLineBreaksComputer(fontInfo, tabSize, wrappingColumn, wrappingIndent, wordBreak) {
            const requests = [];
            const injectedTexts = [];
            const previousBreakingData = [];
            return {
                addRequest: (lineText, injectedText, previousLineBreakData) => {
                    requests.push(lineText);
                    injectedTexts.push(injectedText);
                    previousBreakingData.push(previousLineBreakData);
                },
                finalize: () => {
                    const columnsForFullWidthChar = fontInfo.typicalFullwidthCharacterWidth / fontInfo.typicalHalfwidthCharacterWidth;
                    const result = [];
                    for (let i = 0, len = requests.length; i < len; i++) {
                        const injectedText = injectedTexts[i];
                        const previousLineBreakData = previousBreakingData[i];
                        if (previousLineBreakData && !previousLineBreakData.injectionOptions && !injectedText) {
                            result[i] = createLineBreaksFromPreviousLineBreaks(this.classifier, previousLineBreakData, requests[i], tabSize, wrappingColumn, columnsForFullWidthChar, wrappingIndent, wordBreak);
                        }
                        else {
                            result[i] = createLineBreaks(this.classifier, requests[i], injectedText, tabSize, wrappingColumn, columnsForFullWidthChar, wrappingIndent, wordBreak);
                        }
                    }
                    arrPool1.length = 0;
                    arrPool2.length = 0;
                    return result;
                }
            };
        }
    }
    exports.MonospaceLineBreaksComputerFactory = MonospaceLineBreaksComputerFactory;
    var CharacterClass;
    (function (CharacterClass) {
        CharacterClass[CharacterClass["NONE"] = 0] = "NONE";
        CharacterClass[CharacterClass["BREAK_BEFORE"] = 1] = "BREAK_BEFORE";
        CharacterClass[CharacterClass["BREAK_AFTER"] = 2] = "BREAK_AFTER";
        CharacterClass[CharacterClass["BREAK_IDEOGRAPHIC"] = 3] = "BREAK_IDEOGRAPHIC"; // for Han and Kana.
    })(CharacterClass || (CharacterClass = {}));
    class WrappingCharacterClassifier extends characterClassifier_1.CharacterClassifier {
        constructor(BREAK_BEFORE, BREAK_AFTER) {
            super(0 /* CharacterClass.NONE */);
            for (let i = 0; i < BREAK_BEFORE.length; i++) {
                this.set(BREAK_BEFORE.charCodeAt(i), 1 /* CharacterClass.BREAK_BEFORE */);
            }
            for (let i = 0; i < BREAK_AFTER.length; i++) {
                this.set(BREAK_AFTER.charCodeAt(i), 2 /* CharacterClass.BREAK_AFTER */);
            }
        }
        get(charCode) {
            if (charCode >= 0 && charCode < 256) {
                return this._asciiMap[charCode];
            }
            else {
                // Initialize CharacterClass.BREAK_IDEOGRAPHIC for these Unicode ranges:
                // 1. CJK Unified Ideographs (0x4E00 -- 0x9FFF)
                // 2. CJK Unified Ideographs Extension A (0x3400 -- 0x4DBF)
                // 3. Hiragana and Katakana (0x3040 -- 0x30FF)
                if ((charCode >= 0x3040 && charCode <= 0x30FF)
                    || (charCode >= 0x3400 && charCode <= 0x4DBF)
                    || (charCode >= 0x4E00 && charCode <= 0x9FFF)) {
                    return 3 /* CharacterClass.BREAK_IDEOGRAPHIC */;
                }
                return (this._map.get(charCode) || this._defaultValue);
            }
        }
    }
    let arrPool1 = [];
    let arrPool2 = [];
    function createLineBreaksFromPreviousLineBreaks(classifier, previousBreakingData, lineText, tabSize, firstLineBreakColumn, columnsForFullWidthChar, wrappingIndent, wordBreak) {
        if (firstLineBreakColumn === -1) {
            return null;
        }
        const len = lineText.length;
        if (len <= 1) {
            return null;
        }
        const isKeepAll = (wordBreak === 'keepAll');
        const prevBreakingOffsets = previousBreakingData.breakOffsets;
        const prevBreakingOffsetsVisibleColumn = previousBreakingData.breakOffsetsVisibleColumn;
        const wrappedTextIndentLength = computeWrappedTextIndentLength(lineText, tabSize, firstLineBreakColumn, columnsForFullWidthChar, wrappingIndent);
        const wrappedLineBreakColumn = firstLineBreakColumn - wrappedTextIndentLength;
        const breakingOffsets = arrPool1;
        const breakingOffsetsVisibleColumn = arrPool2;
        let breakingOffsetsCount = 0;
        let lastBreakingOffset = 0;
        let lastBreakingOffsetVisibleColumn = 0;
        let breakingColumn = firstLineBreakColumn;
        const prevLen = prevBreakingOffsets.length;
        let prevIndex = 0;
        if (prevIndex >= 0) {
            let bestDistance = Math.abs(prevBreakingOffsetsVisibleColumn[prevIndex] - breakingColumn);
            while (prevIndex + 1 < prevLen) {
                const distance = Math.abs(prevBreakingOffsetsVisibleColumn[prevIndex + 1] - breakingColumn);
                if (distance >= bestDistance) {
                    break;
                }
                bestDistance = distance;
                prevIndex++;
            }
        }
        while (prevIndex < prevLen) {
            // Allow for prevIndex to be -1 (for the case where we hit a tab when walking backwards from the first break)
            let prevBreakOffset = prevIndex < 0 ? 0 : prevBreakingOffsets[prevIndex];
            let prevBreakOffsetVisibleColumn = prevIndex < 0 ? 0 : prevBreakingOffsetsVisibleColumn[prevIndex];
            if (lastBreakingOffset > prevBreakOffset) {
                prevBreakOffset = lastBreakingOffset;
                prevBreakOffsetVisibleColumn = lastBreakingOffsetVisibleColumn;
            }
            let breakOffset = 0;
            let breakOffsetVisibleColumn = 0;
            let forcedBreakOffset = 0;
            let forcedBreakOffsetVisibleColumn = 0;
            // initially, we search as much as possible to the right (if it fits)
            if (prevBreakOffsetVisibleColumn <= breakingColumn) {
                let visibleColumn = prevBreakOffsetVisibleColumn;
                let prevCharCode = prevBreakOffset === 0 ? 0 /* CharCode.Null */ : lineText.charCodeAt(prevBreakOffset - 1);
                let prevCharCodeClass = prevBreakOffset === 0 ? 0 /* CharacterClass.NONE */ : classifier.get(prevCharCode);
                let entireLineFits = true;
                for (let i = prevBreakOffset; i < len; i++) {
                    const charStartOffset = i;
                    const charCode = lineText.charCodeAt(i);
                    let charCodeClass;
                    let charWidth;
                    if (strings.isHighSurrogate(charCode)) {
                        // A surrogate pair must always be considered as a single unit, so it is never to be broken
                        i++;
                        charCodeClass = 0 /* CharacterClass.NONE */;
                        charWidth = 2;
                    }
                    else {
                        charCodeClass = classifier.get(charCode);
                        charWidth = computeCharWidth(charCode, visibleColumn, tabSize, columnsForFullWidthChar);
                    }
                    if (charStartOffset > lastBreakingOffset && canBreak(prevCharCode, prevCharCodeClass, charCode, charCodeClass, isKeepAll)) {
                        breakOffset = charStartOffset;
                        breakOffsetVisibleColumn = visibleColumn;
                    }
                    visibleColumn += charWidth;
                    // check if adding character at `i` will go over the breaking column
                    if (visibleColumn > breakingColumn) {
                        // We need to break at least before character at `i`:
                        if (charStartOffset > lastBreakingOffset) {
                            forcedBreakOffset = charStartOffset;
                            forcedBreakOffsetVisibleColumn = visibleColumn - charWidth;
                        }
                        else {
                            // we need to advance at least by one character
                            forcedBreakOffset = i + 1;
                            forcedBreakOffsetVisibleColumn = visibleColumn;
                        }
                        if (visibleColumn - breakOffsetVisibleColumn > wrappedLineBreakColumn) {
                            // Cannot break at `breakOffset` => reset it if it was set
                            breakOffset = 0;
                        }
                        entireLineFits = false;
                        break;
                    }
                    prevCharCode = charCode;
                    prevCharCodeClass = charCodeClass;
                }
                if (entireLineFits) {
                    // there is no more need to break => stop the outer loop!
                    if (breakingOffsetsCount > 0) {
                        // Add last segment, no need to assign to `lastBreakingOffset` and `lastBreakingOffsetVisibleColumn`
                        breakingOffsets[breakingOffsetsCount] = prevBreakingOffsets[prevBreakingOffsets.length - 1];
                        breakingOffsetsVisibleColumn[breakingOffsetsCount] = prevBreakingOffsetsVisibleColumn[prevBreakingOffsets.length - 1];
                        breakingOffsetsCount++;
                    }
                    break;
                }
            }
            if (breakOffset === 0) {
                // must search left
                let visibleColumn = prevBreakOffsetVisibleColumn;
                let charCode = lineText.charCodeAt(prevBreakOffset);
                let charCodeClass = classifier.get(charCode);
                let hitATabCharacter = false;
                for (let i = prevBreakOffset - 1; i >= lastBreakingOffset; i--) {
                    const charStartOffset = i + 1;
                    const prevCharCode = lineText.charCodeAt(i);
                    if (prevCharCode === 9 /* CharCode.Tab */) {
                        // cannot determine the width of a tab when going backwards, so we must go forwards
                        hitATabCharacter = true;
                        break;
                    }
                    let prevCharCodeClass;
                    let prevCharWidth;
                    if (strings.isLowSurrogate(prevCharCode)) {
                        // A surrogate pair must always be considered as a single unit, so it is never to be broken
                        i--;
                        prevCharCodeClass = 0 /* CharacterClass.NONE */;
                        prevCharWidth = 2;
                    }
                    else {
                        prevCharCodeClass = classifier.get(prevCharCode);
                        prevCharWidth = (strings.isFullWidthCharacter(prevCharCode) ? columnsForFullWidthChar : 1);
                    }
                    if (visibleColumn <= breakingColumn) {
                        if (forcedBreakOffset === 0) {
                            forcedBreakOffset = charStartOffset;
                            forcedBreakOffsetVisibleColumn = visibleColumn;
                        }
                        if (visibleColumn <= breakingColumn - wrappedLineBreakColumn) {
                            // went too far!
                            break;
                        }
                        if (canBreak(prevCharCode, prevCharCodeClass, charCode, charCodeClass, isKeepAll)) {
                            breakOffset = charStartOffset;
                            breakOffsetVisibleColumn = visibleColumn;
                            break;
                        }
                    }
                    visibleColumn -= prevCharWidth;
                    charCode = prevCharCode;
                    charCodeClass = prevCharCodeClass;
                }
                if (breakOffset !== 0) {
                    const remainingWidthOfNextLine = wrappedLineBreakColumn - (forcedBreakOffsetVisibleColumn - breakOffsetVisibleColumn);
                    if (remainingWidthOfNextLine <= tabSize) {
                        const charCodeAtForcedBreakOffset = lineText.charCodeAt(forcedBreakOffset);
                        let charWidth;
                        if (strings.isHighSurrogate(charCodeAtForcedBreakOffset)) {
                            // A surrogate pair must always be considered as a single unit, so it is never to be broken
                            charWidth = 2;
                        }
                        else {
                            charWidth = computeCharWidth(charCodeAtForcedBreakOffset, forcedBreakOffsetVisibleColumn, tabSize, columnsForFullWidthChar);
                        }
                        if (remainingWidthOfNextLine - charWidth < 0) {
                            // it is not worth it to break at breakOffset, it just introduces an extra needless line!
                            breakOffset = 0;
                        }
                    }
                }
                if (hitATabCharacter) {
                    // cannot determine the width of a tab when going backwards, so we must go forwards from the previous break
                    prevIndex--;
                    continue;
                }
            }
            if (breakOffset === 0) {
                // Could not find a good breaking point
                breakOffset = forcedBreakOffset;
                breakOffsetVisibleColumn = forcedBreakOffsetVisibleColumn;
            }
            if (breakOffset <= lastBreakingOffset) {
                // Make sure that we are advancing (at least one character)
                const charCode = lineText.charCodeAt(lastBreakingOffset);
                if (strings.isHighSurrogate(charCode)) {
                    // A surrogate pair must always be considered as a single unit, so it is never to be broken
                    breakOffset = lastBreakingOffset + 2;
                    breakOffsetVisibleColumn = lastBreakingOffsetVisibleColumn + 2;
                }
                else {
                    breakOffset = lastBreakingOffset + 1;
                    breakOffsetVisibleColumn = lastBreakingOffsetVisibleColumn + computeCharWidth(charCode, lastBreakingOffsetVisibleColumn, tabSize, columnsForFullWidthChar);
                }
            }
            lastBreakingOffset = breakOffset;
            breakingOffsets[breakingOffsetsCount] = breakOffset;
            lastBreakingOffsetVisibleColumn = breakOffsetVisibleColumn;
            breakingOffsetsVisibleColumn[breakingOffsetsCount] = breakOffsetVisibleColumn;
            breakingOffsetsCount++;
            breakingColumn = breakOffsetVisibleColumn + wrappedLineBreakColumn;
            while (prevIndex < 0 || (prevIndex < prevLen && prevBreakingOffsetsVisibleColumn[prevIndex] < breakOffsetVisibleColumn)) {
                prevIndex++;
            }
            let bestDistance = Math.abs(prevBreakingOffsetsVisibleColumn[prevIndex] - breakingColumn);
            while (prevIndex + 1 < prevLen) {
                const distance = Math.abs(prevBreakingOffsetsVisibleColumn[prevIndex + 1] - breakingColumn);
                if (distance >= bestDistance) {
                    break;
                }
                bestDistance = distance;
                prevIndex++;
            }
        }
        if (breakingOffsetsCount === 0) {
            return null;
        }
        // Doing here some object reuse which ends up helping a huge deal with GC pauses!
        breakingOffsets.length = breakingOffsetsCount;
        breakingOffsetsVisibleColumn.length = breakingOffsetsCount;
        arrPool1 = previousBreakingData.breakOffsets;
        arrPool2 = previousBreakingData.breakOffsetsVisibleColumn;
        previousBreakingData.breakOffsets = breakingOffsets;
        previousBreakingData.breakOffsetsVisibleColumn = breakingOffsetsVisibleColumn;
        previousBreakingData.wrappedTextIndentLength = wrappedTextIndentLength;
        return previousBreakingData;
    }
    function createLineBreaks(classifier, _lineText, injectedTexts, tabSize, firstLineBreakColumn, columnsForFullWidthChar, wrappingIndent, wordBreak) {
        const lineText = textModelEvents_1.LineInjectedText.applyInjectedText(_lineText, injectedTexts);
        let injectionOptions;
        let injectionOffsets;
        if (injectedTexts && injectedTexts.length > 0) {
            injectionOptions = injectedTexts.map(t => t.options);
            injectionOffsets = injectedTexts.map(text => text.column - 1);
        }
        else {
            injectionOptions = null;
            injectionOffsets = null;
        }
        if (firstLineBreakColumn === -1) {
            if (!injectionOptions) {
                return null;
            }
            // creating a `LineBreakData` with an invalid `breakOffsetsVisibleColumn` is OK
            // because `breakOffsetsVisibleColumn` will never be used because it contains injected text
            return new modelLineProjectionData_1.ModelLineProjectionData(injectionOffsets, injectionOptions, [lineText.length], [], 0);
        }
        const len = lineText.length;
        if (len <= 1) {
            if (!injectionOptions) {
                return null;
            }
            // creating a `LineBreakData` with an invalid `breakOffsetsVisibleColumn` is OK
            // because `breakOffsetsVisibleColumn` will never be used because it contains injected text
            return new modelLineProjectionData_1.ModelLineProjectionData(injectionOffsets, injectionOptions, [lineText.length], [], 0);
        }
        const isKeepAll = (wordBreak === 'keepAll');
        const wrappedTextIndentLength = computeWrappedTextIndentLength(lineText, tabSize, firstLineBreakColumn, columnsForFullWidthChar, wrappingIndent);
        const wrappedLineBreakColumn = firstLineBreakColumn - wrappedTextIndentLength;
        const breakingOffsets = [];
        const breakingOffsetsVisibleColumn = [];
        let breakingOffsetsCount = 0;
        let breakOffset = 0;
        let breakOffsetVisibleColumn = 0;
        let breakingColumn = firstLineBreakColumn;
        let prevCharCode = lineText.charCodeAt(0);
        let prevCharCodeClass = classifier.get(prevCharCode);
        let visibleColumn = computeCharWidth(prevCharCode, 0, tabSize, columnsForFullWidthChar);
        let startOffset = 1;
        if (strings.isHighSurrogate(prevCharCode)) {
            // A surrogate pair must always be considered as a single unit, so it is never to be broken
            visibleColumn += 1;
            prevCharCode = lineText.charCodeAt(1);
            prevCharCodeClass = classifier.get(prevCharCode);
            startOffset++;
        }
        for (let i = startOffset; i < len; i++) {
            const charStartOffset = i;
            const charCode = lineText.charCodeAt(i);
            let charCodeClass;
            let charWidth;
            if (strings.isHighSurrogate(charCode)) {
                // A surrogate pair must always be considered as a single unit, so it is never to be broken
                i++;
                charCodeClass = 0 /* CharacterClass.NONE */;
                charWidth = 2;
            }
            else {
                charCodeClass = classifier.get(charCode);
                charWidth = computeCharWidth(charCode, visibleColumn, tabSize, columnsForFullWidthChar);
            }
            if (canBreak(prevCharCode, prevCharCodeClass, charCode, charCodeClass, isKeepAll)) {
                breakOffset = charStartOffset;
                breakOffsetVisibleColumn = visibleColumn;
            }
            visibleColumn += charWidth;
            // check if adding character at `i` will go over the breaking column
            if (visibleColumn > breakingColumn) {
                // We need to break at least before character at `i`:
                if (breakOffset === 0 || visibleColumn - breakOffsetVisibleColumn > wrappedLineBreakColumn) {
                    // Cannot break at `breakOffset`, must break at `i`
                    breakOffset = charStartOffset;
                    breakOffsetVisibleColumn = visibleColumn - charWidth;
                }
                breakingOffsets[breakingOffsetsCount] = breakOffset;
                breakingOffsetsVisibleColumn[breakingOffsetsCount] = breakOffsetVisibleColumn;
                breakingOffsetsCount++;
                breakingColumn = breakOffsetVisibleColumn + wrappedLineBreakColumn;
                breakOffset = 0;
            }
            prevCharCode = charCode;
            prevCharCodeClass = charCodeClass;
        }
        if (breakingOffsetsCount === 0 && (!injectedTexts || injectedTexts.length === 0)) {
            return null;
        }
        // Add last segment
        breakingOffsets[breakingOffsetsCount] = len;
        breakingOffsetsVisibleColumn[breakingOffsetsCount] = visibleColumn;
        return new modelLineProjectionData_1.ModelLineProjectionData(injectionOffsets, injectionOptions, breakingOffsets, breakingOffsetsVisibleColumn, wrappedTextIndentLength);
    }
    function computeCharWidth(charCode, visibleColumn, tabSize, columnsForFullWidthChar) {
        if (charCode === 9 /* CharCode.Tab */) {
            return (tabSize - (visibleColumn % tabSize));
        }
        if (strings.isFullWidthCharacter(charCode)) {
            return columnsForFullWidthChar;
        }
        if (charCode < 32) {
            // when using `editor.renderControlCharacters`, the substitutions are often wide
            return columnsForFullWidthChar;
        }
        return 1;
    }
    function tabCharacterWidth(visibleColumn, tabSize) {
        return (tabSize - (visibleColumn % tabSize));
    }
    /**
     * Kinsoku Shori : Don't break after a leading character, like an open bracket
     * Kinsoku Shori : Don't break before a trailing character, like a period
     */
    function canBreak(prevCharCode, prevCharCodeClass, charCode, charCodeClass, isKeepAll) {
        return (charCode !== 32 /* CharCode.Space */
            && ((prevCharCodeClass === 2 /* CharacterClass.BREAK_AFTER */ && charCodeClass !== 2 /* CharacterClass.BREAK_AFTER */) // break at the end of multiple BREAK_AFTER
                || (prevCharCodeClass !== 1 /* CharacterClass.BREAK_BEFORE */ && charCodeClass === 1 /* CharacterClass.BREAK_BEFORE */) // break at the start of multiple BREAK_BEFORE
                || (!isKeepAll && prevCharCodeClass === 3 /* CharacterClass.BREAK_IDEOGRAPHIC */ && charCodeClass !== 2 /* CharacterClass.BREAK_AFTER */)
                || (!isKeepAll && charCodeClass === 3 /* CharacterClass.BREAK_IDEOGRAPHIC */ && prevCharCodeClass !== 1 /* CharacterClass.BREAK_BEFORE */)));
    }
    function computeWrappedTextIndentLength(lineText, tabSize, firstLineBreakColumn, columnsForFullWidthChar, wrappingIndent) {
        let wrappedTextIndentLength = 0;
        if (wrappingIndent !== 0 /* WrappingIndent.None */) {
            const firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(lineText);
            if (firstNonWhitespaceIndex !== -1) {
                // Track existing indent
                for (let i = 0; i < firstNonWhitespaceIndex; i++) {
                    const charWidth = (lineText.charCodeAt(i) === 9 /* CharCode.Tab */ ? tabCharacterWidth(wrappedTextIndentLength, tabSize) : 1);
                    wrappedTextIndentLength += charWidth;
                }
                // Increase indent of continuation lines, if desired
                const numberOfAdditionalTabs = (wrappingIndent === 3 /* WrappingIndent.DeepIndent */ ? 2 : wrappingIndent === 2 /* WrappingIndent.Indent */ ? 1 : 0);
                for (let i = 0; i < numberOfAdditionalTabs; i++) {
                    const charWidth = tabCharacterWidth(wrappedTextIndentLength, tabSize);
                    wrappedTextIndentLength += charWidth;
                }
                // Force sticking to beginning of line if no character would fit except for the indentation
                if (wrappedTextIndentLength + columnsForFullWidthChar > firstLineBreakColumn) {
                    wrappedTextIndentLength = 0;
                }
            }
        }
        return wrappedTextIndentLength;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ub3NwYWNlTGluZUJyZWFrc0NvbXB1dGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi92aWV3TW9kZWwvbW9ub3NwYWNlTGluZUJyZWFrc0NvbXB1dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxNQUFhLGtDQUFrQztRQUN2QyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQStCO1lBQ25ELE9BQU8sSUFBSSxrQ0FBa0MsQ0FDNUMsT0FBTyxDQUFDLEdBQUcsc0RBQTRDLEVBQ3ZELE9BQU8sQ0FBQyxHQUFHLHFEQUEyQyxDQUN0RCxDQUFDO1FBQ0gsQ0FBQztRQUlELFlBQVksZ0JBQXdCLEVBQUUsZUFBdUI7WUFDNUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7UUFFTSx3QkFBd0IsQ0FBQyxRQUFrQixFQUFFLE9BQWUsRUFBRSxjQUFzQixFQUFFLGNBQThCLEVBQUUsU0FBK0I7WUFDM0osTUFBTSxRQUFRLEdBQWEsRUFBRSxDQUFDO1lBQzlCLE1BQU0sYUFBYSxHQUFrQyxFQUFFLENBQUM7WUFDeEQsTUFBTSxvQkFBb0IsR0FBdUMsRUFBRSxDQUFDO1lBQ3BFLE9BQU87Z0JBQ04sVUFBVSxFQUFFLENBQUMsUUFBZ0IsRUFBRSxZQUF1QyxFQUFFLHFCQUFxRCxFQUFFLEVBQUU7b0JBQ2hJLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3hCLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ2pDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUNsRCxDQUFDO2dCQUNELFFBQVEsRUFBRSxHQUFHLEVBQUU7b0JBQ2QsTUFBTSx1QkFBdUIsR0FBRyxRQUFRLENBQUMsOEJBQThCLEdBQUcsUUFBUSxDQUFDLDhCQUE4QixDQUFDO29CQUNsSCxNQUFNLE1BQU0sR0FBdUMsRUFBRSxDQUFDO29CQUN0RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUNwRCxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3RDLE1BQU0scUJBQXFCLEdBQUcsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3RELElBQUkscUJBQXFCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLFlBQVksRUFBRTs0QkFDdEYsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLHNDQUFzQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUscUJBQXFCLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsdUJBQXVCLEVBQUUsY0FBYyxFQUFFLFNBQVMsQ0FBQyxDQUFDO3lCQUNyTDs2QkFBTTs0QkFDTixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsdUJBQXVCLEVBQUUsY0FBYyxFQUFFLFNBQVMsQ0FBQyxDQUFDO3lCQUN0SjtxQkFDRDtvQkFDRCxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDcEIsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBQ3BCLE9BQU8sTUFBTSxDQUFDO2dCQUNmLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBMUNELGdGQTBDQztJQUVELElBQVcsY0FLVjtJQUxELFdBQVcsY0FBYztRQUN4QixtREFBUSxDQUFBO1FBQ1IsbUVBQWdCLENBQUE7UUFDaEIsaUVBQWUsQ0FBQTtRQUNmLDZFQUFxQixDQUFBLENBQUMsb0JBQW9CO0lBQzNDLENBQUMsRUFMVSxjQUFjLEtBQWQsY0FBYyxRQUt4QjtJQUVELE1BQU0sMkJBQTRCLFNBQVEseUNBQW1DO1FBRTVFLFlBQVksWUFBb0IsRUFBRSxXQUFtQjtZQUNwRCxLQUFLLDZCQUFxQixDQUFDO1lBRTNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLHNDQUE4QixDQUFDO2FBQ2xFO1lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzVDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMscUNBQTZCLENBQUM7YUFDaEU7UUFDRixDQUFDO1FBRWUsR0FBRyxDQUFDLFFBQWdCO1lBQ25DLElBQUksUUFBUSxJQUFJLENBQUMsSUFBSSxRQUFRLEdBQUcsR0FBRyxFQUFFO2dCQUNwQyxPQUF1QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2hEO2lCQUFNO2dCQUNOLHdFQUF3RTtnQkFDeEUsK0NBQStDO2dCQUMvQywyREFBMkQ7Z0JBQzNELDhDQUE4QztnQkFDOUMsSUFDQyxDQUFDLFFBQVEsSUFBSSxNQUFNLElBQUksUUFBUSxJQUFJLE1BQU0sQ0FBQzt1QkFDdkMsQ0FBQyxRQUFRLElBQUksTUFBTSxJQUFJLFFBQVEsSUFBSSxNQUFNLENBQUM7dUJBQzFDLENBQUMsUUFBUSxJQUFJLE1BQU0sSUFBSSxRQUFRLElBQUksTUFBTSxDQUFDLEVBQzVDO29CQUNELGdEQUF3QztpQkFDeEM7Z0JBRUQsT0FBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDdkU7UUFDRixDQUFDO0tBQ0Q7SUFFRCxJQUFJLFFBQVEsR0FBYSxFQUFFLENBQUM7SUFDNUIsSUFBSSxRQUFRLEdBQWEsRUFBRSxDQUFDO0lBRTVCLFNBQVMsc0NBQXNDLENBQUMsVUFBdUMsRUFBRSxvQkFBNkMsRUFBRSxRQUFnQixFQUFFLE9BQWUsRUFBRSxvQkFBNEIsRUFBRSx1QkFBK0IsRUFBRSxjQUE4QixFQUFFLFNBQStCO1FBQ3hTLElBQUksb0JBQW9CLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDaEMsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFO1lBQ2IsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE1BQU0sU0FBUyxHQUFHLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FBQyxDQUFDO1FBRTVDLE1BQU0sbUJBQW1CLEdBQUcsb0JBQW9CLENBQUMsWUFBWSxDQUFDO1FBQzlELE1BQU0sZ0NBQWdDLEdBQUcsb0JBQW9CLENBQUMseUJBQXlCLENBQUM7UUFFeEYsTUFBTSx1QkFBdUIsR0FBRyw4QkFBOEIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLHVCQUF1QixFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ2pKLE1BQU0sc0JBQXNCLEdBQUcsb0JBQW9CLEdBQUcsdUJBQXVCLENBQUM7UUFFOUUsTUFBTSxlQUFlLEdBQWEsUUFBUSxDQUFDO1FBQzNDLE1BQU0sNEJBQTRCLEdBQWEsUUFBUSxDQUFDO1FBQ3hELElBQUksb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLElBQUksa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLElBQUksK0JBQStCLEdBQUcsQ0FBQyxDQUFDO1FBRXhDLElBQUksY0FBYyxHQUFHLG9CQUFvQixDQUFDO1FBQzFDLE1BQU0sT0FBTyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQztRQUMzQyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFFbEIsSUFBSSxTQUFTLElBQUksQ0FBQyxFQUFFO1lBQ25CLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsU0FBUyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUM7WUFDMUYsT0FBTyxTQUFTLEdBQUcsQ0FBQyxHQUFHLE9BQU8sRUFBRTtnQkFDL0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUM7Z0JBQzVGLElBQUksUUFBUSxJQUFJLFlBQVksRUFBRTtvQkFDN0IsTUFBTTtpQkFDTjtnQkFDRCxZQUFZLEdBQUcsUUFBUSxDQUFDO2dCQUN4QixTQUFTLEVBQUUsQ0FBQzthQUNaO1NBQ0Q7UUFFRCxPQUFPLFNBQVMsR0FBRyxPQUFPLEVBQUU7WUFDM0IsNkdBQTZHO1lBQzdHLElBQUksZUFBZSxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekUsSUFBSSw0QkFBNEIsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25HLElBQUksa0JBQWtCLEdBQUcsZUFBZSxFQUFFO2dCQUN6QyxlQUFlLEdBQUcsa0JBQWtCLENBQUM7Z0JBQ3JDLDRCQUE0QixHQUFHLCtCQUErQixDQUFDO2FBQy9EO1lBRUQsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLElBQUksd0JBQXdCLEdBQUcsQ0FBQyxDQUFDO1lBRWpDLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLElBQUksOEJBQThCLEdBQUcsQ0FBQyxDQUFDO1lBRXZDLHFFQUFxRTtZQUNyRSxJQUFJLDRCQUE0QixJQUFJLGNBQWMsRUFBRTtnQkFDbkQsSUFBSSxhQUFhLEdBQUcsNEJBQTRCLENBQUM7Z0JBQ2pELElBQUksWUFBWSxHQUFHLGVBQWUsS0FBSyxDQUFDLENBQUMsQ0FBQyx1QkFBZSxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BHLElBQUksaUJBQWlCLEdBQUcsZUFBZSxLQUFLLENBQUMsQ0FBQyxDQUFDLDZCQUFxQixDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDbkcsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLGVBQWUsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUMzQyxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUM7b0JBQzFCLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLElBQUksYUFBcUIsQ0FBQztvQkFDMUIsSUFBSSxTQUFpQixDQUFDO29CQUV0QixJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQUU7d0JBQ3RDLDJGQUEyRjt3QkFDM0YsQ0FBQyxFQUFFLENBQUM7d0JBQ0osYUFBYSw4QkFBc0IsQ0FBQzt3QkFDcEMsU0FBUyxHQUFHLENBQUMsQ0FBQztxQkFDZDt5QkFBTTt3QkFDTixhQUFhLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDekMsU0FBUyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLHVCQUF1QixDQUFDLENBQUM7cUJBQ3hGO29CQUVELElBQUksZUFBZSxHQUFHLGtCQUFrQixJQUFJLFFBQVEsQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxTQUFTLENBQUMsRUFBRTt3QkFDMUgsV0FBVyxHQUFHLGVBQWUsQ0FBQzt3QkFDOUIsd0JBQXdCLEdBQUcsYUFBYSxDQUFDO3FCQUN6QztvQkFFRCxhQUFhLElBQUksU0FBUyxDQUFDO29CQUUzQixvRUFBb0U7b0JBQ3BFLElBQUksYUFBYSxHQUFHLGNBQWMsRUFBRTt3QkFDbkMscURBQXFEO3dCQUNyRCxJQUFJLGVBQWUsR0FBRyxrQkFBa0IsRUFBRTs0QkFDekMsaUJBQWlCLEdBQUcsZUFBZSxDQUFDOzRCQUNwQyw4QkFBOEIsR0FBRyxhQUFhLEdBQUcsU0FBUyxDQUFDO3lCQUMzRDs2QkFBTTs0QkFDTiwrQ0FBK0M7NEJBQy9DLGlCQUFpQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQzFCLDhCQUE4QixHQUFHLGFBQWEsQ0FBQzt5QkFDL0M7d0JBRUQsSUFBSSxhQUFhLEdBQUcsd0JBQXdCLEdBQUcsc0JBQXNCLEVBQUU7NEJBQ3RFLDBEQUEwRDs0QkFDMUQsV0FBVyxHQUFHLENBQUMsQ0FBQzt5QkFDaEI7d0JBRUQsY0FBYyxHQUFHLEtBQUssQ0FBQzt3QkFDdkIsTUFBTTtxQkFDTjtvQkFFRCxZQUFZLEdBQUcsUUFBUSxDQUFDO29CQUN4QixpQkFBaUIsR0FBRyxhQUFhLENBQUM7aUJBQ2xDO2dCQUVELElBQUksY0FBYyxFQUFFO29CQUNuQix5REFBeUQ7b0JBQ3pELElBQUksb0JBQW9CLEdBQUcsQ0FBQyxFQUFFO3dCQUM3QixvR0FBb0c7d0JBQ3BHLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLG1CQUFtQixDQUFDLG1CQUFtQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDNUYsNEJBQTRCLENBQUMsb0JBQW9CLENBQUMsR0FBRyxnQ0FBZ0MsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ3RILG9CQUFvQixFQUFFLENBQUM7cUJBQ3ZCO29CQUNELE1BQU07aUJBQ047YUFDRDtZQUVELElBQUksV0FBVyxLQUFLLENBQUMsRUFBRTtnQkFDdEIsbUJBQW1CO2dCQUNuQixJQUFJLGFBQWEsR0FBRyw0QkFBNEIsQ0FBQztnQkFDakQsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxhQUFhLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7Z0JBQzdCLEtBQUssSUFBSSxDQUFDLEdBQUcsZUFBZSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQy9ELE1BQU0sZUFBZSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzlCLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRTVDLElBQUksWUFBWSx5QkFBaUIsRUFBRTt3QkFDbEMsbUZBQW1GO3dCQUNuRixnQkFBZ0IsR0FBRyxJQUFJLENBQUM7d0JBQ3hCLE1BQU07cUJBQ047b0JBRUQsSUFBSSxpQkFBeUIsQ0FBQztvQkFDOUIsSUFBSSxhQUFxQixDQUFDO29CQUUxQixJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUU7d0JBQ3pDLDJGQUEyRjt3QkFDM0YsQ0FBQyxFQUFFLENBQUM7d0JBQ0osaUJBQWlCLDhCQUFzQixDQUFDO3dCQUN4QyxhQUFhLEdBQUcsQ0FBQyxDQUFDO3FCQUNsQjt5QkFBTTt3QkFDTixpQkFBaUIsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO3dCQUNqRCxhQUFhLEdBQUcsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDM0Y7b0JBRUQsSUFBSSxhQUFhLElBQUksY0FBYyxFQUFFO3dCQUNwQyxJQUFJLGlCQUFpQixLQUFLLENBQUMsRUFBRTs0QkFDNUIsaUJBQWlCLEdBQUcsZUFBZSxDQUFDOzRCQUNwQyw4QkFBOEIsR0FBRyxhQUFhLENBQUM7eUJBQy9DO3dCQUVELElBQUksYUFBYSxJQUFJLGNBQWMsR0FBRyxzQkFBc0IsRUFBRTs0QkFDN0QsZ0JBQWdCOzRCQUNoQixNQUFNO3lCQUNOO3dCQUVELElBQUksUUFBUSxDQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLFNBQVMsQ0FBQyxFQUFFOzRCQUNsRixXQUFXLEdBQUcsZUFBZSxDQUFDOzRCQUM5Qix3QkFBd0IsR0FBRyxhQUFhLENBQUM7NEJBQ3pDLE1BQU07eUJBQ047cUJBQ0Q7b0JBRUQsYUFBYSxJQUFJLGFBQWEsQ0FBQztvQkFDL0IsUUFBUSxHQUFHLFlBQVksQ0FBQztvQkFDeEIsYUFBYSxHQUFHLGlCQUFpQixDQUFDO2lCQUNsQztnQkFFRCxJQUFJLFdBQVcsS0FBSyxDQUFDLEVBQUU7b0JBQ3RCLE1BQU0sd0JBQXdCLEdBQUcsc0JBQXNCLEdBQUcsQ0FBQyw4QkFBOEIsR0FBRyx3QkFBd0IsQ0FBQyxDQUFDO29CQUN0SCxJQUFJLHdCQUF3QixJQUFJLE9BQU8sRUFBRTt3QkFDeEMsTUFBTSwyQkFBMkIsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7d0JBQzNFLElBQUksU0FBaUIsQ0FBQzt3QkFDdEIsSUFBSSxPQUFPLENBQUMsZUFBZSxDQUFDLDJCQUEyQixDQUFDLEVBQUU7NEJBQ3pELDJGQUEyRjs0QkFDM0YsU0FBUyxHQUFHLENBQUMsQ0FBQzt5QkFDZDs2QkFBTTs0QkFDTixTQUFTLEdBQUcsZ0JBQWdCLENBQUMsMkJBQTJCLEVBQUUsOEJBQThCLEVBQUUsT0FBTyxFQUFFLHVCQUF1QixDQUFDLENBQUM7eUJBQzVIO3dCQUNELElBQUksd0JBQXdCLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRTs0QkFDN0MseUZBQXlGOzRCQUN6RixXQUFXLEdBQUcsQ0FBQyxDQUFDO3lCQUNoQjtxQkFDRDtpQkFDRDtnQkFFRCxJQUFJLGdCQUFnQixFQUFFO29CQUNyQiwyR0FBMkc7b0JBQzNHLFNBQVMsRUFBRSxDQUFDO29CQUNaLFNBQVM7aUJBQ1Q7YUFDRDtZQUVELElBQUksV0FBVyxLQUFLLENBQUMsRUFBRTtnQkFDdEIsdUNBQXVDO2dCQUN2QyxXQUFXLEdBQUcsaUJBQWlCLENBQUM7Z0JBQ2hDLHdCQUF3QixHQUFHLDhCQUE4QixDQUFDO2FBQzFEO1lBRUQsSUFBSSxXQUFXLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3RDLDJEQUEyRDtnQkFDM0QsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ3RDLDJGQUEyRjtvQkFDM0YsV0FBVyxHQUFHLGtCQUFrQixHQUFHLENBQUMsQ0FBQztvQkFDckMsd0JBQXdCLEdBQUcsK0JBQStCLEdBQUcsQ0FBQyxDQUFDO2lCQUMvRDtxQkFBTTtvQkFDTixXQUFXLEdBQUcsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO29CQUNyQyx3QkFBd0IsR0FBRywrQkFBK0IsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsK0JBQStCLEVBQUUsT0FBTyxFQUFFLHVCQUF1QixDQUFDLENBQUM7aUJBQzNKO2FBQ0Q7WUFFRCxrQkFBa0IsR0FBRyxXQUFXLENBQUM7WUFDakMsZUFBZSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsV0FBVyxDQUFDO1lBQ3BELCtCQUErQixHQUFHLHdCQUF3QixDQUFDO1lBQzNELDRCQUE0QixDQUFDLG9CQUFvQixDQUFDLEdBQUcsd0JBQXdCLENBQUM7WUFDOUUsb0JBQW9CLEVBQUUsQ0FBQztZQUN2QixjQUFjLEdBQUcsd0JBQXdCLEdBQUcsc0JBQXNCLENBQUM7WUFFbkUsT0FBTyxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sSUFBSSxnQ0FBZ0MsQ0FBQyxTQUFTLENBQUMsR0FBRyx3QkFBd0IsQ0FBQyxFQUFFO2dCQUN4SCxTQUFTLEVBQUUsQ0FBQzthQUNaO1lBRUQsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxTQUFTLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQztZQUMxRixPQUFPLFNBQVMsR0FBRyxDQUFDLEdBQUcsT0FBTyxFQUFFO2dCQUMvQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQztnQkFDNUYsSUFBSSxRQUFRLElBQUksWUFBWSxFQUFFO29CQUM3QixNQUFNO2lCQUNOO2dCQUNELFlBQVksR0FBRyxRQUFRLENBQUM7Z0JBQ3hCLFNBQVMsRUFBRSxDQUFDO2FBQ1o7U0FDRDtRQUVELElBQUksb0JBQW9CLEtBQUssQ0FBQyxFQUFFO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxpRkFBaUY7UUFDakYsZUFBZSxDQUFDLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQztRQUM5Qyw0QkFBNEIsQ0FBQyxNQUFNLEdBQUcsb0JBQW9CLENBQUM7UUFDM0QsUUFBUSxHQUFHLG9CQUFvQixDQUFDLFlBQVksQ0FBQztRQUM3QyxRQUFRLEdBQUcsb0JBQW9CLENBQUMseUJBQXlCLENBQUM7UUFDMUQsb0JBQW9CLENBQUMsWUFBWSxHQUFHLGVBQWUsQ0FBQztRQUNwRCxvQkFBb0IsQ0FBQyx5QkFBeUIsR0FBRyw0QkFBNEIsQ0FBQztRQUM5RSxvQkFBb0IsQ0FBQyx1QkFBdUIsR0FBRyx1QkFBdUIsQ0FBQztRQUN2RSxPQUFPLG9CQUFvQixDQUFDO0lBQzdCLENBQUM7SUFFRCxTQUFTLGdCQUFnQixDQUFDLFVBQXVDLEVBQUUsU0FBaUIsRUFBRSxhQUF3QyxFQUFFLE9BQWUsRUFBRSxvQkFBNEIsRUFBRSx1QkFBK0IsRUFBRSxjQUE4QixFQUFFLFNBQStCO1FBQzlRLE1BQU0sUUFBUSxHQUFHLGtDQUFnQixDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUU5RSxJQUFJLGdCQUE4QyxDQUFDO1FBQ25ELElBQUksZ0JBQWlDLENBQUM7UUFDdEMsSUFBSSxhQUFhLElBQUksYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDOUMsZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyRCxnQkFBZ0IsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztTQUM5RDthQUFNO1lBQ04sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLGdCQUFnQixHQUFHLElBQUksQ0FBQztTQUN4QjtRQUVELElBQUksb0JBQW9CLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUN0QixPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsK0VBQStFO1lBQy9FLDJGQUEyRjtZQUMzRixPQUFPLElBQUksaURBQXVCLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2pHO1FBRUQsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUM1QixJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUU7WUFDYixJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3RCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCwrRUFBK0U7WUFDL0UsMkZBQTJGO1lBQzNGLE9BQU8sSUFBSSxpREFBdUIsQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDakc7UUFFRCxNQUFNLFNBQVMsR0FBRyxDQUFDLFNBQVMsS0FBSyxTQUFTLENBQUMsQ0FBQztRQUM1QyxNQUFNLHVCQUF1QixHQUFHLDhCQUE4QixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsdUJBQXVCLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDakosTUFBTSxzQkFBc0IsR0FBRyxvQkFBb0IsR0FBRyx1QkFBdUIsQ0FBQztRQUU5RSxNQUFNLGVBQWUsR0FBYSxFQUFFLENBQUM7UUFDckMsTUFBTSw0QkFBNEIsR0FBYSxFQUFFLENBQUM7UUFDbEQsSUFBSSxvQkFBb0IsR0FBVyxDQUFDLENBQUM7UUFDckMsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksd0JBQXdCLEdBQUcsQ0FBQyxDQUFDO1FBRWpDLElBQUksY0FBYyxHQUFHLG9CQUFvQixDQUFDO1FBQzFDLElBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsSUFBSSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3JELElBQUksYUFBYSxHQUFHLGdCQUFnQixDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFFeEYsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUMxQywyRkFBMkY7WUFDM0YsYUFBYSxJQUFJLENBQUMsQ0FBQztZQUNuQixZQUFZLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxpQkFBaUIsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2pELFdBQVcsRUFBRSxDQUFDO1NBQ2Q7UUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLFdBQVcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3ZDLE1BQU0sZUFBZSxHQUFHLENBQUMsQ0FBQztZQUMxQixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksYUFBNkIsQ0FBQztZQUNsQyxJQUFJLFNBQWlCLENBQUM7WUFFdEIsSUFBSSxPQUFPLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN0QywyRkFBMkY7Z0JBQzNGLENBQUMsRUFBRSxDQUFDO2dCQUNKLGFBQWEsOEJBQXNCLENBQUM7Z0JBQ3BDLFNBQVMsR0FBRyxDQUFDLENBQUM7YUFDZDtpQkFBTTtnQkFDTixhQUFhLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDekMsU0FBUyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLHVCQUF1QixDQUFDLENBQUM7YUFDeEY7WUFFRCxJQUFJLFFBQVEsQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxTQUFTLENBQUMsRUFBRTtnQkFDbEYsV0FBVyxHQUFHLGVBQWUsQ0FBQztnQkFDOUIsd0JBQXdCLEdBQUcsYUFBYSxDQUFDO2FBQ3pDO1lBRUQsYUFBYSxJQUFJLFNBQVMsQ0FBQztZQUUzQixvRUFBb0U7WUFDcEUsSUFBSSxhQUFhLEdBQUcsY0FBYyxFQUFFO2dCQUNuQyxxREFBcUQ7Z0JBRXJELElBQUksV0FBVyxLQUFLLENBQUMsSUFBSSxhQUFhLEdBQUcsd0JBQXdCLEdBQUcsc0JBQXNCLEVBQUU7b0JBQzNGLG1EQUFtRDtvQkFDbkQsV0FBVyxHQUFHLGVBQWUsQ0FBQztvQkFDOUIsd0JBQXdCLEdBQUcsYUFBYSxHQUFHLFNBQVMsQ0FBQztpQkFDckQ7Z0JBRUQsZUFBZSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsV0FBVyxDQUFDO2dCQUNwRCw0QkFBNEIsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLHdCQUF3QixDQUFDO2dCQUM5RSxvQkFBb0IsRUFBRSxDQUFDO2dCQUN2QixjQUFjLEdBQUcsd0JBQXdCLEdBQUcsc0JBQXNCLENBQUM7Z0JBQ25FLFdBQVcsR0FBRyxDQUFDLENBQUM7YUFDaEI7WUFFRCxZQUFZLEdBQUcsUUFBUSxDQUFDO1lBQ3hCLGlCQUFpQixHQUFHLGFBQWEsQ0FBQztTQUNsQztRQUVELElBQUksb0JBQW9CLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNqRixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsbUJBQW1CO1FBQ25CLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUM1Qyw0QkFBNEIsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLGFBQWEsQ0FBQztRQUVuRSxPQUFPLElBQUksaURBQXVCLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLDRCQUE0QixFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDaEosQ0FBQztJQUVELFNBQVMsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxhQUFxQixFQUFFLE9BQWUsRUFBRSx1QkFBK0I7UUFDbEgsSUFBSSxRQUFRLHlCQUFpQixFQUFFO1lBQzlCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUM3QztRQUNELElBQUksT0FBTyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzNDLE9BQU8sdUJBQXVCLENBQUM7U0FDL0I7UUFDRCxJQUFJLFFBQVEsR0FBRyxFQUFFLEVBQUU7WUFDbEIsZ0ZBQWdGO1lBQ2hGLE9BQU8sdUJBQXVCLENBQUM7U0FDL0I7UUFDRCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUM7SUFFRCxTQUFTLGlCQUFpQixDQUFDLGFBQXFCLEVBQUUsT0FBZTtRQUNoRSxPQUFPLENBQUMsT0FBTyxHQUFHLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQVMsUUFBUSxDQUFDLFlBQW9CLEVBQUUsaUJBQWlDLEVBQUUsUUFBZ0IsRUFBRSxhQUE2QixFQUFFLFNBQWtCO1FBQzdJLE9BQU8sQ0FDTixRQUFRLDRCQUFtQjtlQUN4QixDQUNGLENBQUMsaUJBQWlCLHVDQUErQixJQUFJLGFBQWEsdUNBQStCLENBQUMsQ0FBQywyQ0FBMkM7bUJBQzNJLENBQUMsaUJBQWlCLHdDQUFnQyxJQUFJLGFBQWEsd0NBQWdDLENBQUMsQ0FBQyw4Q0FBOEM7bUJBQ25KLENBQUMsQ0FBQyxTQUFTLElBQUksaUJBQWlCLDZDQUFxQyxJQUFJLGFBQWEsdUNBQStCLENBQUM7bUJBQ3RILENBQUMsQ0FBQyxTQUFTLElBQUksYUFBYSw2Q0FBcUMsSUFBSSxpQkFBaUIsd0NBQWdDLENBQUMsQ0FDMUgsQ0FDRCxDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVMsOEJBQThCLENBQUMsUUFBZ0IsRUFBRSxPQUFlLEVBQUUsb0JBQTRCLEVBQUUsdUJBQStCLEVBQUUsY0FBOEI7UUFDdkssSUFBSSx1QkFBdUIsR0FBRyxDQUFDLENBQUM7UUFDaEMsSUFBSSxjQUFjLGdDQUF3QixFQUFFO1lBQzNDLE1BQU0sdUJBQXVCLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFFLElBQUksdUJBQXVCLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ25DLHdCQUF3QjtnQkFFeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLHVCQUF1QixFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNqRCxNQUFNLFNBQVMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLHlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyx1QkFBdUIsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RILHVCQUF1QixJQUFJLFNBQVMsQ0FBQztpQkFDckM7Z0JBRUQsb0RBQW9EO2dCQUNwRCxNQUFNLHNCQUFzQixHQUFHLENBQUMsY0FBYyxzQ0FBOEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLGtDQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNySSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ2hELE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUN0RSx1QkFBdUIsSUFBSSxTQUFTLENBQUM7aUJBQ3JDO2dCQUVELDJGQUEyRjtnQkFDM0YsSUFBSSx1QkFBdUIsR0FBRyx1QkFBdUIsR0FBRyxvQkFBb0IsRUFBRTtvQkFDN0UsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDO2lCQUM1QjthQUNEO1NBQ0Q7UUFDRCxPQUFPLHVCQUF1QixDQUFDO0lBQ2hDLENBQUMifQ==