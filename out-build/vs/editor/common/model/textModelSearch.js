/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/wordCharacterClassifier", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model"], function (require, exports, strings, wordCharacterClassifier_1, position_1, range_1, model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mC = exports.$lC = exports.$kC = exports.$jC = exports.$iC = exports.$hC = void 0;
    const LIMIT_FIND_COUNT = 999;
    class $hC {
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
                multiline = $iC(this.searchString);
            }
            else {
                multiline = (this.searchString.indexOf('\n') >= 0);
            }
            let regex = null;
            try {
                regex = strings.$ye(this.searchString, this.isRegex, {
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
            return new model_1.$Eu(regex, this.wordSeparators ? (0, wordCharacterClassifier_1.$Ks)(this.wordSeparators) : null, canUseSimpleSearch ? this.searchString : null);
        }
    }
    exports.$hC = $hC;
    function $iC(searchString) {
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
    exports.$iC = $iC;
    function $jC(range, rawMatches, captureMatches) {
        if (!captureMatches) {
            return new model_1.$Bu(range, null);
        }
        const matches = [];
        for (let i = 0, len = rawMatches.length; i < len; i++) {
            matches[i] = rawMatches[i];
        }
        return new model_1.$Bu(range, matches);
    }
    exports.$jC = $jC;
    class LineFeedCounter {
        constructor(text) {
            const lineFeedsOffsets = [];
            let lineFeedsOffsetsLen = 0;
            for (let i = 0, textLen = text.length; i < textLen; i++) {
                if (text.charCodeAt(i) === 10 /* CharCode.LineFeed */) {
                    lineFeedsOffsets[lineFeedsOffsetsLen++] = i;
                }
            }
            this.a = lineFeedsOffsets;
        }
        findLineFeedCountBeforeOffset(offset) {
            const lineFeedsOffsets = this.a;
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
    class $kC {
        static findMatches(model, searchParams, searchRange, captureMatches, limitResultCount) {
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return [];
            }
            if (searchData.regex.multiline) {
                return this.b(model, searchRange, new $mC(searchData.wordSeparators, searchData.regex), captureMatches, limitResultCount);
            }
            return this.c(model, searchRange, searchData, captureMatches, limitResultCount);
        }
        /**
         * Multiline search always executes on the lines concatenated with \n.
         * We must therefore compensate for the count of \n in case the model is CRLF
         */
        static a(model, deltaOffset, text, lfCounter, matchIndex, match0) {
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
            return new range_1.$ks(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
        }
        static b(model, searchRange, searcher, captureMatches, limitResultCount) {
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
                result[counter++] = $jC(this.a(model, deltaOffset, text, lfCounter, m.index, m[0]), m, captureMatches);
                if (counter >= limitResultCount) {
                    return result;
                }
            }
            return result;
        }
        static c(model, searchRange, searchData, captureMatches, limitResultCount) {
            const result = [];
            let resultLen = 0;
            // Early case for a search range that starts & stops on the same line number
            if (searchRange.startLineNumber === searchRange.endLineNumber) {
                const text = model.getLineContent(searchRange.startLineNumber).substring(searchRange.startColumn - 1, searchRange.endColumn - 1);
                resultLen = this.d(searchData, text, searchRange.startLineNumber, searchRange.startColumn - 1, resultLen, result, captureMatches, limitResultCount);
                return result;
            }
            // Collect results from first line
            const text = model.getLineContent(searchRange.startLineNumber).substring(searchRange.startColumn - 1);
            resultLen = this.d(searchData, text, searchRange.startLineNumber, searchRange.startColumn - 1, resultLen, result, captureMatches, limitResultCount);
            // Collect results from middle lines
            for (let lineNumber = searchRange.startLineNumber + 1; lineNumber < searchRange.endLineNumber && resultLen < limitResultCount; lineNumber++) {
                resultLen = this.d(searchData, model.getLineContent(lineNumber), lineNumber, 0, resultLen, result, captureMatches, limitResultCount);
            }
            // Collect results from last line
            if (resultLen < limitResultCount) {
                const text = model.getLineContent(searchRange.endLineNumber).substring(0, searchRange.endColumn - 1);
                resultLen = this.d(searchData, text, searchRange.endLineNumber, 0, resultLen, result, captureMatches, limitResultCount);
            }
            return result;
        }
        static d(searchData, text, lineNumber, deltaOffset, resultLen, result, captureMatches, limitResultCount) {
            const wordSeparators = searchData.wordSeparators;
            if (!captureMatches && searchData.simpleSearch) {
                const searchString = searchData.simpleSearch;
                const searchStringLen = searchString.length;
                const textLength = text.length;
                let lastMatchIndex = -searchStringLen;
                while ((lastMatchIndex = text.indexOf(searchString, lastMatchIndex + searchStringLen)) !== -1) {
                    if (!wordSeparators || $lC(wordSeparators, text, textLength, lastMatchIndex, searchStringLen)) {
                        result[resultLen++] = new model_1.$Bu(new range_1.$ks(lineNumber, lastMatchIndex + 1 + deltaOffset, lineNumber, lastMatchIndex + 1 + searchStringLen + deltaOffset), null);
                        if (resultLen >= limitResultCount) {
                            return resultLen;
                        }
                    }
                }
                return resultLen;
            }
            const searcher = new $mC(searchData.wordSeparators, searchData.regex);
            let m;
            // Reset regex to search from the beginning
            searcher.reset(0);
            do {
                m = searcher.next(text);
                if (m) {
                    result[resultLen++] = $jC(new range_1.$ks(lineNumber, m.index + 1 + deltaOffset, lineNumber, m.index + 1 + m[0].length + deltaOffset), m, captureMatches);
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
            const searcher = new $mC(searchData.wordSeparators, searchData.regex);
            if (searchData.regex.multiline) {
                return this.e(model, searchStart, searcher, captureMatches);
            }
            return this.f(model, searchStart, searcher, captureMatches);
        }
        static e(model, searchStart, searcher, captureMatches) {
            const searchTextStart = new position_1.$js(searchStart.lineNumber, 1);
            const deltaOffset = model.getOffsetAt(searchTextStart);
            const lineCount = model.getLineCount();
            // We always execute multiline search over the lines joined with \n
            // This makes it that \n will match the EOL for both CRLF and LF models
            // We compensate for offset errors in `_getMultilineMatchRange`
            const text = model.getValueInRange(new range_1.$ks(searchTextStart.lineNumber, searchTextStart.column, lineCount, model.getLineMaxColumn(lineCount)), 1 /* EndOfLinePreference.LF */);
            const lfCounter = (model.getEOL() === '\r\n' ? new LineFeedCounter(text) : null);
            searcher.reset(searchStart.column - 1);
            const m = searcher.next(text);
            if (m) {
                return $jC(this.a(model, deltaOffset, text, lfCounter, m.index, m[0]), m, captureMatches);
            }
            if (searchStart.lineNumber !== 1 || searchStart.column !== 1) {
                // Try again from the top
                return this.e(model, new position_1.$js(1, 1), searcher, captureMatches);
            }
            return null;
        }
        static f(model, searchStart, searcher, captureMatches) {
            const lineCount = model.getLineCount();
            const startLineNumber = searchStart.lineNumber;
            // Look in first line
            const text = model.getLineContent(startLineNumber);
            const r = this.g(searcher, text, startLineNumber, searchStart.column, captureMatches);
            if (r) {
                return r;
            }
            for (let i = 1; i <= lineCount; i++) {
                const lineIndex = (startLineNumber + i - 1) % lineCount;
                const text = model.getLineContent(lineIndex + 1);
                const r = this.g(searcher, text, lineIndex + 1, 1, captureMatches);
                if (r) {
                    return r;
                }
            }
            return null;
        }
        static g(searcher, text, lineNumber, fromColumn, captureMatches) {
            // Set regex to search from column
            searcher.reset(fromColumn - 1);
            const m = searcher.next(text);
            if (m) {
                return $jC(new range_1.$ks(lineNumber, m.index + 1, lineNumber, m.index + 1 + m[0].length), m, captureMatches);
            }
            return null;
        }
        static findPreviousMatch(model, searchParams, searchStart, captureMatches) {
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return null;
            }
            const searcher = new $mC(searchData.wordSeparators, searchData.regex);
            if (searchData.regex.multiline) {
                return this.h(model, searchStart, searcher, captureMatches);
            }
            return this.j(model, searchStart, searcher, captureMatches);
        }
        static h(model, searchStart, searcher, captureMatches) {
            const matches = this.b(model, new range_1.$ks(1, 1, searchStart.lineNumber, searchStart.column), searcher, captureMatches, 10 * LIMIT_FIND_COUNT);
            if (matches.length > 0) {
                return matches[matches.length - 1];
            }
            const lineCount = model.getLineCount();
            if (searchStart.lineNumber !== lineCount || searchStart.column !== model.getLineMaxColumn(lineCount)) {
                // Try again with all content
                return this.h(model, new position_1.$js(lineCount, model.getLineMaxColumn(lineCount)), searcher, captureMatches);
            }
            return null;
        }
        static j(model, searchStart, searcher, captureMatches) {
            const lineCount = model.getLineCount();
            const startLineNumber = searchStart.lineNumber;
            // Look in first line
            const text = model.getLineContent(startLineNumber).substring(0, searchStart.column - 1);
            const r = this.k(searcher, text, startLineNumber, captureMatches);
            if (r) {
                return r;
            }
            for (let i = 1; i <= lineCount; i++) {
                const lineIndex = (lineCount + startLineNumber - i - 1) % lineCount;
                const text = model.getLineContent(lineIndex + 1);
                const r = this.k(searcher, text, lineIndex + 1, captureMatches);
                if (r) {
                    return r;
                }
            }
            return null;
        }
        static k(searcher, text, lineNumber, captureMatches) {
            let bestResult = null;
            let m;
            searcher.reset(0);
            while ((m = searcher.next(text))) {
                bestResult = $jC(new range_1.$ks(lineNumber, m.index + 1, lineNumber, m.index + 1 + m[0].length), m, captureMatches);
            }
            return bestResult;
        }
    }
    exports.$kC = $kC;
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
    function $lC(wordSeparators, text, textLength, matchStartIndex, matchLength) {
        return (leftIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength)
            && rightIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength));
    }
    exports.$lC = $lC;
    class $mC {
        constructor(wordSeparators, searchRegex) {
            this._wordSeparators = wordSeparators;
            this.a = searchRegex;
            this.b = -1;
            this.c = 0;
        }
        reset(lastIndex) {
            this.a.lastIndex = lastIndex;
            this.b = -1;
            this.c = 0;
        }
        next(text) {
            const textLength = text.length;
            let m;
            do {
                if (this.b + this.c === textLength) {
                    // Reached the end of the line
                    return null;
                }
                m = this.a.exec(text);
                if (!m) {
                    return null;
                }
                const matchStartIndex = m.index;
                const matchLength = m[0].length;
                if (matchStartIndex === this.b && matchLength === this.c) {
                    if (matchLength === 0) {
                        // the search result is an empty string and won't advance `regex.lastIndex`, so `regex.exec` will stuck here
                        // we attempt to recover from that by advancing by two if surrogate pair found and by one otherwise
                        if (strings.$Te(text, textLength, this.a.lastIndex) > 0xFFFF) {
                            this.a.lastIndex += 2;
                        }
                        else {
                            this.a.lastIndex += 1;
                        }
                        continue;
                    }
                    // Exit early if the regex matches the same range twice
                    return null;
                }
                this.b = matchStartIndex;
                this.c = matchLength;
                if (!this._wordSeparators || $lC(this._wordSeparators, text, textLength, matchStartIndex, matchLength)) {
                    return m;
                }
            } while (m);
            return null;
        }
    }
    exports.$mC = $mC;
});
//# sourceMappingURL=textModelSearch.js.map