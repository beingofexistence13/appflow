/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/wordCharacterClassifier", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model"], function (require, exports, strings, wordCharacterClassifier_1, position_1, range_1, model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Searcher = exports.isValidMatch = exports.TextModelSearch = exports.createFindMatch = exports.isMultilineRegexSource = exports.SearchParams = void 0;
    const LIMIT_FIND_COUNT = 999;
    class SearchParams {
        constructor(searchString, isRegex, matchCase, wordSeparators) {
            this.searchString = searchString;
            this.isRegex = isRegex;
            this.matchCase = matchCase;
            this.wordSeparators = wordSeparators;
        }
        parseSearchRequest() {
            if (this.searchString === '') {
                return null;
            }
            // Try to create a RegExp out of the params
            let multiline;
            if (this.isRegex) {
                multiline = isMultilineRegexSource(this.searchString);
            }
            else {
                multiline = (this.searchString.indexOf('\n') >= 0);
            }
            let regex = null;
            try {
                regex = strings.createRegExp(this.searchString, this.isRegex, {
                    matchCase: this.matchCase,
                    wholeWord: false,
                    multiline: multiline,
                    global: true,
                    unicode: true
                });
            }
            catch (err) {
                return null;
            }
            if (!regex) {
                return null;
            }
            let canUseSimpleSearch = (!this.isRegex && !multiline);
            if (canUseSimpleSearch && this.searchString.toLowerCase() !== this.searchString.toUpperCase()) {
                // casing might make a difference
                canUseSimpleSearch = this.matchCase;
            }
            return new model_1.SearchData(regex, this.wordSeparators ? (0, wordCharacterClassifier_1.getMapForWordSeparators)(this.wordSeparators) : null, canUseSimpleSearch ? this.searchString : null);
        }
    }
    exports.SearchParams = SearchParams;
    function isMultilineRegexSource(searchString) {
        if (!searchString || searchString.length === 0) {
            return false;
        }
        for (let i = 0, len = searchString.length; i < len; i++) {
            const chCode = searchString.charCodeAt(i);
            if (chCode === 10 /* CharCode.LineFeed */) {
                return true;
            }
            if (chCode === 92 /* CharCode.Backslash */) {
                // move to next char
                i++;
                if (i >= len) {
                    // string ends with a \
                    break;
                }
                const nextChCode = searchString.charCodeAt(i);
                if (nextChCode === 110 /* CharCode.n */ || nextChCode === 114 /* CharCode.r */ || nextChCode === 87 /* CharCode.W */) {
                    return true;
                }
            }
        }
        return false;
    }
    exports.isMultilineRegexSource = isMultilineRegexSource;
    function createFindMatch(range, rawMatches, captureMatches) {
        if (!captureMatches) {
            return new model_1.FindMatch(range, null);
        }
        const matches = [];
        for (let i = 0, len = rawMatches.length; i < len; i++) {
            matches[i] = rawMatches[i];
        }
        return new model_1.FindMatch(range, matches);
    }
    exports.createFindMatch = createFindMatch;
    class LineFeedCounter {
        constructor(text) {
            const lineFeedsOffsets = [];
            let lineFeedsOffsetsLen = 0;
            for (let i = 0, textLen = text.length; i < textLen; i++) {
                if (text.charCodeAt(i) === 10 /* CharCode.LineFeed */) {
                    lineFeedsOffsets[lineFeedsOffsetsLen++] = i;
                }
            }
            this._lineFeedsOffsets = lineFeedsOffsets;
        }
        findLineFeedCountBeforeOffset(offset) {
            const lineFeedsOffsets = this._lineFeedsOffsets;
            let min = 0;
            let max = lineFeedsOffsets.length - 1;
            if (max === -1) {
                // no line feeds
                return 0;
            }
            if (offset <= lineFeedsOffsets[0]) {
                // before first line feed
                return 0;
            }
            while (min < max) {
                const mid = min + ((max - min) / 2 >> 0);
                if (lineFeedsOffsets[mid] >= offset) {
                    max = mid - 1;
                }
                else {
                    if (lineFeedsOffsets[mid + 1] >= offset) {
                        // bingo!
                        min = mid;
                        max = mid;
                    }
                    else {
                        min = mid + 1;
                    }
                }
            }
            return min + 1;
        }
    }
    class TextModelSearch {
        static findMatches(model, searchParams, searchRange, captureMatches, limitResultCount) {
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return [];
            }
            if (searchData.regex.multiline) {
                return this._doFindMatchesMultiline(model, searchRange, new Searcher(searchData.wordSeparators, searchData.regex), captureMatches, limitResultCount);
            }
            return this._doFindMatchesLineByLine(model, searchRange, searchData, captureMatches, limitResultCount);
        }
        /**
         * Multiline search always executes on the lines concatenated with \n.
         * We must therefore compensate for the count of \n in case the model is CRLF
         */
        static _getMultilineMatchRange(model, deltaOffset, text, lfCounter, matchIndex, match0) {
            let startOffset;
            let lineFeedCountBeforeMatch = 0;
            if (lfCounter) {
                lineFeedCountBeforeMatch = lfCounter.findLineFeedCountBeforeOffset(matchIndex);
                startOffset = deltaOffset + matchIndex + lineFeedCountBeforeMatch /* add as many \r as there were \n */;
            }
            else {
                startOffset = deltaOffset + matchIndex;
            }
            let endOffset;
            if (lfCounter) {
                const lineFeedCountBeforeEndOfMatch = lfCounter.findLineFeedCountBeforeOffset(matchIndex + match0.length);
                const lineFeedCountInMatch = lineFeedCountBeforeEndOfMatch - lineFeedCountBeforeMatch;
                endOffset = startOffset + match0.length + lineFeedCountInMatch /* add as many \r as there were \n */;
            }
            else {
                endOffset = startOffset + match0.length;
            }
            const startPosition = model.getPositionAt(startOffset);
            const endPosition = model.getPositionAt(endOffset);
            return new range_1.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
        }
        static _doFindMatchesMultiline(model, searchRange, searcher, captureMatches, limitResultCount) {
            const deltaOffset = model.getOffsetAt(searchRange.getStartPosition());
            // We always execute multiline search over the lines joined with \n
            // This makes it that \n will match the EOL for both CRLF and LF models
            // We compensate for offset errors in `_getMultilineMatchRange`
            const text = model.getValueInRange(searchRange, 1 /* EndOfLinePreference.LF */);
            const lfCounter = (model.getEOL() === '\r\n' ? new LineFeedCounter(text) : null);
            const result = [];
            let counter = 0;
            let m;
            searcher.reset(0);
            while ((m = searcher.next(text))) {
                result[counter++] = createFindMatch(this._getMultilineMatchRange(model, deltaOffset, text, lfCounter, m.index, m[0]), m, captureMatches);
                if (counter >= limitResultCount) {
                    return result;
                }
            }
            return result;
        }
        static _doFindMatchesLineByLine(model, searchRange, searchData, captureMatches, limitResultCount) {
            const result = [];
            let resultLen = 0;
            // Early case for a search range that starts & stops on the same line number
            if (searchRange.startLineNumber === searchRange.endLineNumber) {
                const text = model.getLineContent(searchRange.startLineNumber).substring(searchRange.startColumn - 1, searchRange.endColumn - 1);
                resultLen = this._findMatchesInLine(searchData, text, searchRange.startLineNumber, searchRange.startColumn - 1, resultLen, result, captureMatches, limitResultCount);
                return result;
            }
            // Collect results from first line
            const text = model.getLineContent(searchRange.startLineNumber).substring(searchRange.startColumn - 1);
            resultLen = this._findMatchesInLine(searchData, text, searchRange.startLineNumber, searchRange.startColumn - 1, resultLen, result, captureMatches, limitResultCount);
            // Collect results from middle lines
            for (let lineNumber = searchRange.startLineNumber + 1; lineNumber < searchRange.endLineNumber && resultLen < limitResultCount; lineNumber++) {
                resultLen = this._findMatchesInLine(searchData, model.getLineContent(lineNumber), lineNumber, 0, resultLen, result, captureMatches, limitResultCount);
            }
            // Collect results from last line
            if (resultLen < limitResultCount) {
                const text = model.getLineContent(searchRange.endLineNumber).substring(0, searchRange.endColumn - 1);
                resultLen = this._findMatchesInLine(searchData, text, searchRange.endLineNumber, 0, resultLen, result, captureMatches, limitResultCount);
            }
            return result;
        }
        static _findMatchesInLine(searchData, text, lineNumber, deltaOffset, resultLen, result, captureMatches, limitResultCount) {
            const wordSeparators = searchData.wordSeparators;
            if (!captureMatches && searchData.simpleSearch) {
                const searchString = searchData.simpleSearch;
                const searchStringLen = searchString.length;
                const textLength = text.length;
                let lastMatchIndex = -searchStringLen;
                while ((lastMatchIndex = text.indexOf(searchString, lastMatchIndex + searchStringLen)) !== -1) {
                    if (!wordSeparators || isValidMatch(wordSeparators, text, textLength, lastMatchIndex, searchStringLen)) {
                        result[resultLen++] = new model_1.FindMatch(new range_1.Range(lineNumber, lastMatchIndex + 1 + deltaOffset, lineNumber, lastMatchIndex + 1 + searchStringLen + deltaOffset), null);
                        if (resultLen >= limitResultCount) {
                            return resultLen;
                        }
                    }
                }
                return resultLen;
            }
            const searcher = new Searcher(searchData.wordSeparators, searchData.regex);
            let m;
            // Reset regex to search from the beginning
            searcher.reset(0);
            do {
                m = searcher.next(text);
                if (m) {
                    result[resultLen++] = createFindMatch(new range_1.Range(lineNumber, m.index + 1 + deltaOffset, lineNumber, m.index + 1 + m[0].length + deltaOffset), m, captureMatches);
                    if (resultLen >= limitResultCount) {
                        return resultLen;
                    }
                }
            } while (m);
            return resultLen;
        }
        static findNextMatch(model, searchParams, searchStart, captureMatches) {
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return null;
            }
            const searcher = new Searcher(searchData.wordSeparators, searchData.regex);
            if (searchData.regex.multiline) {
                return this._doFindNextMatchMultiline(model, searchStart, searcher, captureMatches);
            }
            return this._doFindNextMatchLineByLine(model, searchStart, searcher, captureMatches);
        }
        static _doFindNextMatchMultiline(model, searchStart, searcher, captureMatches) {
            const searchTextStart = new position_1.Position(searchStart.lineNumber, 1);
            const deltaOffset = model.getOffsetAt(searchTextStart);
            const lineCount = model.getLineCount();
            // We always execute multiline search over the lines joined with \n
            // This makes it that \n will match the EOL for both CRLF and LF models
            // We compensate for offset errors in `_getMultilineMatchRange`
            const text = model.getValueInRange(new range_1.Range(searchTextStart.lineNumber, searchTextStart.column, lineCount, model.getLineMaxColumn(lineCount)), 1 /* EndOfLinePreference.LF */);
            const lfCounter = (model.getEOL() === '\r\n' ? new LineFeedCounter(text) : null);
            searcher.reset(searchStart.column - 1);
            const m = searcher.next(text);
            if (m) {
                return createFindMatch(this._getMultilineMatchRange(model, deltaOffset, text, lfCounter, m.index, m[0]), m, captureMatches);
            }
            if (searchStart.lineNumber !== 1 || searchStart.column !== 1) {
                // Try again from the top
                return this._doFindNextMatchMultiline(model, new position_1.Position(1, 1), searcher, captureMatches);
            }
            return null;
        }
        static _doFindNextMatchLineByLine(model, searchStart, searcher, captureMatches) {
            const lineCount = model.getLineCount();
            const startLineNumber = searchStart.lineNumber;
            // Look in first line
            const text = model.getLineContent(startLineNumber);
            const r = this._findFirstMatchInLine(searcher, text, startLineNumber, searchStart.column, captureMatches);
            if (r) {
                return r;
            }
            for (let i = 1; i <= lineCount; i++) {
                const lineIndex = (startLineNumber + i - 1) % lineCount;
                const text = model.getLineContent(lineIndex + 1);
                const r = this._findFirstMatchInLine(searcher, text, lineIndex + 1, 1, captureMatches);
                if (r) {
                    return r;
                }
            }
            return null;
        }
        static _findFirstMatchInLine(searcher, text, lineNumber, fromColumn, captureMatches) {
            // Set regex to search from column
            searcher.reset(fromColumn - 1);
            const m = searcher.next(text);
            if (m) {
                return createFindMatch(new range_1.Range(lineNumber, m.index + 1, lineNumber, m.index + 1 + m[0].length), m, captureMatches);
            }
            return null;
        }
        static findPreviousMatch(model, searchParams, searchStart, captureMatches) {
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return null;
            }
            const searcher = new Searcher(searchData.wordSeparators, searchData.regex);
            if (searchData.regex.multiline) {
                return this._doFindPreviousMatchMultiline(model, searchStart, searcher, captureMatches);
            }
            return this._doFindPreviousMatchLineByLine(model, searchStart, searcher, captureMatches);
        }
        static _doFindPreviousMatchMultiline(model, searchStart, searcher, captureMatches) {
            const matches = this._doFindMatchesMultiline(model, new range_1.Range(1, 1, searchStart.lineNumber, searchStart.column), searcher, captureMatches, 10 * LIMIT_FIND_COUNT);
            if (matches.length > 0) {
                return matches[matches.length - 1];
            }
            const lineCount = model.getLineCount();
            if (searchStart.lineNumber !== lineCount || searchStart.column !== model.getLineMaxColumn(lineCount)) {
                // Try again with all content
                return this._doFindPreviousMatchMultiline(model, new position_1.Position(lineCount, model.getLineMaxColumn(lineCount)), searcher, captureMatches);
            }
            return null;
        }
        static _doFindPreviousMatchLineByLine(model, searchStart, searcher, captureMatches) {
            const lineCount = model.getLineCount();
            const startLineNumber = searchStart.lineNumber;
            // Look in first line
            const text = model.getLineContent(startLineNumber).substring(0, searchStart.column - 1);
            const r = this._findLastMatchInLine(searcher, text, startLineNumber, captureMatches);
            if (r) {
                return r;
            }
            for (let i = 1; i <= lineCount; i++) {
                const lineIndex = (lineCount + startLineNumber - i - 1) % lineCount;
                const text = model.getLineContent(lineIndex + 1);
                const r = this._findLastMatchInLine(searcher, text, lineIndex + 1, captureMatches);
                if (r) {
                    return r;
                }
            }
            return null;
        }
        static _findLastMatchInLine(searcher, text, lineNumber, captureMatches) {
            let bestResult = null;
            let m;
            searcher.reset(0);
            while ((m = searcher.next(text))) {
                bestResult = createFindMatch(new range_1.Range(lineNumber, m.index + 1, lineNumber, m.index + 1 + m[0].length), m, captureMatches);
            }
            return bestResult;
        }
    }
    exports.TextModelSearch = TextModelSearch;
    function leftIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength) {
        if (matchStartIndex === 0) {
            // Match starts at start of string
            return true;
        }
        const charBefore = text.charCodeAt(matchStartIndex - 1);
        if (wordSeparators.get(charBefore) !== 0 /* WordCharacterClass.Regular */) {
            // The character before the match is a word separator
            return true;
        }
        if (charBefore === 13 /* CharCode.CarriageReturn */ || charBefore === 10 /* CharCode.LineFeed */) {
            // The character before the match is line break or carriage return.
            return true;
        }
        if (matchLength > 0) {
            const firstCharInMatch = text.charCodeAt(matchStartIndex);
            if (wordSeparators.get(firstCharInMatch) !== 0 /* WordCharacterClass.Regular */) {
                // The first character inside the match is a word separator
                return true;
            }
        }
        return false;
    }
    function rightIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength) {
        if (matchStartIndex + matchLength === textLength) {
            // Match ends at end of string
            return true;
        }
        const charAfter = text.charCodeAt(matchStartIndex + matchLength);
        if (wordSeparators.get(charAfter) !== 0 /* WordCharacterClass.Regular */) {
            // The character after the match is a word separator
            return true;
        }
        if (charAfter === 13 /* CharCode.CarriageReturn */ || charAfter === 10 /* CharCode.LineFeed */) {
            // The character after the match is line break or carriage return.
            return true;
        }
        if (matchLength > 0) {
            const lastCharInMatch = text.charCodeAt(matchStartIndex + matchLength - 1);
            if (wordSeparators.get(lastCharInMatch) !== 0 /* WordCharacterClass.Regular */) {
                // The last character in the match is a word separator
                return true;
            }
        }
        return false;
    }
    function isValidMatch(wordSeparators, text, textLength, matchStartIndex, matchLength) {
        return (leftIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength)
            && rightIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength));
    }
    exports.isValidMatch = isValidMatch;
    class Searcher {
        constructor(wordSeparators, searchRegex) {
            this._wordSeparators = wordSeparators;
            this._searchRegex = searchRegex;
            this._prevMatchStartIndex = -1;
            this._prevMatchLength = 0;
        }
        reset(lastIndex) {
            this._searchRegex.lastIndex = lastIndex;
            this._prevMatchStartIndex = -1;
            this._prevMatchLength = 0;
        }
        next(text) {
            const textLength = text.length;
            let m;
            do {
                if (this._prevMatchStartIndex + this._prevMatchLength === textLength) {
                    // Reached the end of the line
                    return null;
                }
                m = this._searchRegex.exec(text);
                if (!m) {
                    return null;
                }
                const matchStartIndex = m.index;
                const matchLength = m[0].length;
                if (matchStartIndex === this._prevMatchStartIndex && matchLength === this._prevMatchLength) {
                    if (matchLength === 0) {
                        // the search result is an empty string and won't advance `regex.lastIndex`, so `regex.exec` will stuck here
                        // we attempt to recover from that by advancing by two if surrogate pair found and by one otherwise
                        if (strings.getNextCodePoint(text, textLength, this._searchRegex.lastIndex) > 0xFFFF) {
                            this._searchRegex.lastIndex += 2;
                        }
                        else {
                            this._searchRegex.lastIndex += 1;
                        }
                        continue;
                    }
                    // Exit early if the regex matches the same range twice
                    return null;
                }
                this._prevMatchStartIndex = matchStartIndex;
                this._prevMatchLength = matchLength;
                if (!this._wordSeparators || isValidMatch(this._wordSeparators, text, textLength, matchStartIndex, matchLength)) {
                    return m;
                }
            } while (m);
            return null;
        }
    }
    exports.Searcher = Searcher;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1vZGVsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9tb2RlbC90ZXh0TW9kZWxTZWFyY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDO0lBRTdCLE1BQWEsWUFBWTtRQU14QixZQUFZLFlBQW9CLEVBQUUsT0FBZ0IsRUFBRSxTQUFrQixFQUFFLGNBQTZCO1lBQ3BHLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzNCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3RDLENBQUM7UUFFTSxrQkFBa0I7WUFDeEIsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLEVBQUUsRUFBRTtnQkFDN0IsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELDJDQUEyQztZQUMzQyxJQUFJLFNBQWtCLENBQUM7WUFDdkIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixTQUFTLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ3REO2lCQUFNO2dCQUNOLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ25EO1lBRUQsSUFBSSxLQUFLLEdBQWtCLElBQUksQ0FBQztZQUNoQyxJQUFJO2dCQUNILEtBQUssR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDN0QsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO29CQUN6QixTQUFTLEVB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