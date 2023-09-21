/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/map", "vs/base/common/strings"], function (require, exports, map_1, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fuzzyScoreGraceful = exports.fuzzyScoreGracefulAggressive = exports.fuzzyScore = exports.FuzzyScoreOptions = exports.FuzzyScore = exports.isPatternInWord = exports.createMatches = exports.anyScore = exports.matchesFuzzy2 = exports.matchesFuzzy = exports.matchesWords = exports.matchesCamelCase = exports.isUpper = exports.matchesSubString = exports.matchesContiguousSubString = exports.matchesPrefix = exports.matchesStrictPrefix = exports.or = void 0;
    // Combined filters
    /**
     * @returns A filter which combines the provided set
     * of filters with an or. The *first* filters that
     * matches defined the return value of the returned
     * filter.
     */
    function or(...filter) {
        return function (word, wordToMatchAgainst) {
            for (let i = 0, len = filter.length; i < len; i++) {
                const match = filter[i](word, wordToMatchAgainst);
                if (match) {
                    return match;
                }
            }
            return null;
        };
    }
    exports.or = or;
    // Prefix
    exports.matchesStrictPrefix = _matchesPrefix.bind(undefined, false);
    exports.matchesPrefix = _matchesPrefix.bind(undefined, true);
    function _matchesPrefix(ignoreCase, word, wordToMatchAgainst) {
        if (!wordToMatchAgainst || wordToMatchAgainst.length < word.length) {
            return null;
        }
        let matches;
        if (ignoreCase) {
            matches = strings.startsWithIgnoreCase(wordToMatchAgainst, word);
        }
        else {
            matches = wordToMatchAgainst.indexOf(word) === 0;
        }
        if (!matches) {
            return null;
        }
        return word.length > 0 ? [{ start: 0, end: word.length }] : [];
    }
    // Contiguous Substring
    function matchesContiguousSubString(word, wordToMatchAgainst) {
        const index = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
        if (index === -1) {
            return null;
        }
        return [{ start: index, end: index + word.length }];
    }
    exports.matchesContiguousSubString = matchesContiguousSubString;
    // Substring
    function matchesSubString(word, wordToMatchAgainst) {
        return _matchesSubString(word.toLowerCase(), wordToMatchAgainst.toLowerCase(), 0, 0);
    }
    exports.matchesSubString = matchesSubString;
    function _matchesSubString(word, wordToMatchAgainst, i, j) {
        if (i === word.length) {
            return [];
        }
        else if (j === wordToMatchAgainst.length) {
            return null;
        }
        else {
            if (word[i] === wordToMatchAgainst[j]) {
                let result = null;
                if (result = _matchesSubString(word, wordToMatchAgainst, i + 1, j + 1)) {
                    return join({ start: j, end: j + 1 }, result);
                }
                return null;
            }
            return _matchesSubString(word, wordToMatchAgainst, i, j + 1);
        }
    }
    // CamelCase
    function isLower(code) {
        return 97 /* CharCode.a */ <= code && code <= 122 /* CharCode.z */;
    }
    function isUpper(code) {
        return 65 /* CharCode.A */ <= code && code <= 90 /* CharCode.Z */;
    }
    exports.isUpper = isUpper;
    function isNumber(code) {
        return 48 /* CharCode.Digit0 */ <= code && code <= 57 /* CharCode.Digit9 */;
    }
    function isWhitespace(code) {
        return (code === 32 /* CharCode.Space */
            || code === 9 /* CharCode.Tab */
            || code === 10 /* CharCode.LineFeed */
            || code === 13 /* CharCode.CarriageReturn */);
    }
    const wordSeparators = new Set();
    // These are chosen as natural word separators based on writen text.
    // It is a subset of the word separators used by the monaco editor.
    '()[]{}<>`\'"-/;:,.?!'
        .split('')
        .forEach(s => wordSeparators.add(s.charCodeAt(0)));
    function isWordSeparator(code) {
        return isWhitespace(code) || wordSeparators.has(code);
    }
    function charactersMatch(codeA, codeB) {
        return (codeA === codeB) || (isWordSeparator(codeA) && isWordSeparator(codeB));
    }
    function isAlphanumeric(code) {
        return isLower(code) || isUpper(code) || isNumber(code);
    }
    function join(head, tail) {
        if (tail.length === 0) {
            tail = [head];
        }
        else if (head.end === tail[0].start) {
            tail[0].start = head.start;
        }
        else {
            tail.unshift(head);
        }
        return tail;
    }
    function nextAnchor(camelCaseWord, start) {
        for (let i = start; i < camelCaseWord.length; i++) {
            const c = camelCaseWord.charCodeAt(i);
            if (isUpper(c) || isNumber(c) || (i > 0 && !isAlphanumeric(camelCaseWord.charCodeAt(i - 1)))) {
                return i;
            }
        }
        return camelCaseWord.length;
    }
    function _matchesCamelCase(word, camelCaseWord, i, j) {
        if (i === word.length) {
            return [];
        }
        else if (j === camelCaseWord.length) {
            return null;
        }
        else if (word[i] !== camelCaseWord[j].toLowerCase()) {
            return null;
        }
        else {
            let result = null;
            let nextUpperIndex = j + 1;
            result = _matchesCamelCase(word, camelCaseWord, i + 1, j + 1);
            while (!result && (nextUpperIndex = nextAnchor(camelCaseWord, nextUpperIndex)) < camelCaseWord.length) {
                result = _matchesCamelCase(word, camelCaseWord, i + 1, nextUpperIndex);
                nextUpperIndex++;
            }
            return result === null ? null : join({ start: j, end: j + 1 }, result);
        }
    }
    // Heuristic to avoid computing camel case matcher for words that don't
    // look like camelCaseWords.
    function analyzeCamelCaseWord(word) {
        let upper = 0, lower = 0, alpha = 0, numeric = 0, code = 0;
        for (let i = 0; i < word.length; i++) {
            code = word.charCodeAt(i);
            if (isUpper(code)) {
                upper++;
            }
            if (isLower(code)) {
                lower++;
            }
            if (isAlphanumeric(code)) {
                alpha++;
            }
            if (isNumber(code)) {
                numeric++;
            }
        }
        const upperPercent = upper / word.length;
        const lowerPercent = lower / word.length;
        const alphaPercent = alpha / word.length;
        const numericPercent = numeric / word.length;
        return { upperPercent, lowerPercent, alphaPercent, numericPercent };
    }
    function isUpperCaseWord(analysis) {
        const { upperPercent, lowerPercent } = analysis;
        return lowerPercent === 0 && upperPercent > 0.6;
    }
    function isCamelCaseWord(analysis) {
        const { upperPercent, lowerPercent, alphaPercent, numericPercent } = analysis;
        return lowerPercent > 0.2 && upperPercent < 0.8 && alphaPercent > 0.6 && numericPercent < 0.2;
    }
    // Heuristic to avoid computing camel case matcher for words that don't
    // look like camel case patterns.
    function isCamelCasePattern(word) {
        let upper = 0, lower = 0, code = 0, whitespace = 0;
        for (let i = 0; i < word.length; i++) {
            code = word.charCodeAt(i);
            if (isUpper(code)) {
                upper++;
            }
            if (isLower(code)) {
                lower++;
            }
            if (isWhitespace(code)) {
                whitespace++;
            }
        }
        if ((upper === 0 || lower === 0) && whitespace === 0) {
            return word.length <= 30;
        }
        else {
            return upper <= 5;
        }
    }
    function matchesCamelCase(word, camelCaseWord) {
        if (!camelCaseWord) {
            return null;
        }
        camelCaseWord = camelCaseWord.trim();
        if (camelCaseWord.length === 0) {
            return null;
        }
        if (!isCamelCasePattern(word)) {
            return null;
        }
        if (camelCaseWord.length > 60) {
            return null;
        }
        const analysis = analyzeCamelCaseWord(camelCaseWord);
        if (!isCamelCaseWord(analysis)) {
            if (!isUpperCaseWord(analysis)) {
                return null;
            }
            camelCaseWord = camelCaseWord.toLowerCase();
        }
        let result = null;
        let i = 0;
        word = word.toLowerCase();
        while (i < camelCaseWord.length && (result = _matchesCamelCase(word, camelCaseWord, 0, i)) === null) {
            i = nextAnchor(camelCaseWord, i + 1);
        }
        return result;
    }
    exports.matchesCamelCase = matchesCamelCase;
    // Matches beginning of words supporting non-ASCII languages
    // If `contiguous` is true then matches word with beginnings of the words in the target. E.g. "pul" will match "Git: Pull"
    // Otherwise also matches sub string of the word with beginnings of the words in the target. E.g. "gp" or "g p" will match "Git: Pull"
    // Useful in cases where the target is words (e.g. command labels)
    function matchesWords(word, target, contiguous = false) {
        if (!target || target.length === 0) {
            return null;
        }
        let result = null;
        let i = 0;
        word = word.toLowerCase();
        target = target.toLowerCase();
        while (i < target.length && (result = _matchesWords(word, target, 0, i, contiguous)) === null) {
            i = nextWord(target, i + 1);
        }
        return result;
    }
    exports.matchesWords = matchesWords;
    function _matchesWords(word, target, i, j, contiguous) {
        if (i === word.length) {
            return [];
        }
        else if (j === target.length) {
            return null;
        }
        else if (!charactersMatch(word.charCodeAt(i), target.charCodeAt(j))) {
            return null;
        }
        else {
            let result = null;
            let nextWordIndex = j + 1;
            result = _matchesWords(word, target, i + 1, j + 1, contiguous);
            if (!contiguous) {
                while (!result && (nextWordIndex = nextWord(target, nextWordIndex)) < target.length) {
                    result = _matchesWords(word, target, i + 1, nextWordIndex, contiguous);
                    nextWordIndex++;
                }
            }
            if (!result) {
                return null;
            }
            // If the characters don't exactly match, then they must be word separators (see charactersMatch(...)).
            // We don't want to include this in the matches but we don't want to throw the target out all together so we return `result`.
            if (word.charCodeAt(i) !== target.charCodeAt(j)) {
                return result;
            }
            return join({ start: j, end: j + 1 }, result);
        }
    }
    function nextWord(word, start) {
        for (let i = start; i < word.length; i++) {
            if (isWordSeparator(word.charCodeAt(i)) ||
                (i > 0 && isWordSeparator(word.charCodeAt(i - 1)))) {
                return i;
            }
        }
        return word.length;
    }
    // Fuzzy
    const fuzzyContiguousFilter = or(exports.matchesPrefix, matchesCamelCase, matchesContiguousSubString);
    const fuzzySeparateFilter = or(exports.matchesPrefix, matchesCamelCase, matchesSubString);
    const fuzzyRegExpCache = new map_1.LRUCache(10000); // bounded to 10000 elements
    function matchesFuzzy(word, wordToMatchAgainst, enableSeparateSubstringMatching = false) {
        if (typeof word !== 'string' || typeof wordToMatchAgainst !== 'string') {
            return null; // return early for invalid input
        }
        // Form RegExp for wildcard matches
        let regexp = fuzzyRegExpCache.get(word);
        if (!regexp) {
            regexp = new RegExp(strings.convertSimple2RegExpPattern(word), 'i');
            fuzzyRegExpCache.set(word, regexp);
        }
        // RegExp Filter
        const match = regexp.exec(wordToMatchAgainst);
        if (match) {
            return [{ start: match.index, end: match.index + match[0].length }];
        }
        // Default Filter
        return enableSeparateSubstringMatching ? fuzzySeparateFilter(word, wordToMatchAgainst) : fuzzyContiguousFilter(word, wordToMatchAgainst);
    }
    exports.matchesFuzzy = matchesFuzzy;
    /**
     * Match pattern against word in a fuzzy way. As in IntelliSense and faster and more
     * powerful than `matchesFuzzy`
     */
    function matchesFuzzy2(pattern, word) {
        const score = fuzzyScore(pattern, pattern.toLowerCase(), 0, word, word.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
        return score ? createMatches(score) : null;
    }
    exports.matchesFuzzy2 = matchesFuzzy2;
    function anyScore(pattern, lowPattern, patternPos, word, lowWord, wordPos) {
        const max = Math.min(13, pattern.length);
        for (; patternPos < max; patternPos++) {
            const result = fuzzyScore(pattern, lowPattern, patternPos, word, lowWord, wordPos, { firstMatchCanBeWeak: true, boostFullMatch: true });
            if (result) {
                return result;
            }
        }
        return [0, wordPos];
    }
    exports.anyScore = anyScore;
    //#region --- fuzzyScore ---
    function createMatches(score) {
        if (typeof score === 'undefined') {
            return [];
        }
        const res = [];
        const wordPos = score[1];
        for (let i = score.length - 1; i > 1; i--) {
            const pos = score[i] + wordPos;
            const last = res[res.length - 1];
            if (last && last.end === pos) {
                last.end = pos + 1;
            }
            else {
                res.push({ start: pos, end: pos + 1 });
            }
        }
        return res;
    }
    exports.createMatches = createMatches;
    const _maxLen = 128;
    function initTable() {
        const table = [];
        const row = [];
        for (let i = 0; i <= _maxLen; i++) {
            row[i] = 0;
        }
        for (let i = 0; i <= _maxLen; i++) {
            table.push(row.slice(0));
        }
        return table;
    }
    function initArr(maxLen) {
        const row = [];
        for (let i = 0; i <= maxLen; i++) {
            row[i] = 0;
        }
        return row;
    }
    const _minWordMatchPos = initArr(2 * _maxLen); // min word position for a certain pattern position
    const _maxWordMatchPos = initArr(2 * _maxLen); // max word position for a certain pattern position
    const _diag = initTable(); // the length of a contiguous diagonal match
    const _table = initTable();
    const _arrows = initTable();
    const _debug = false;
    function printTable(table, pattern, patternLen, word, wordLen) {
        function pad(s, n, pad = ' ') {
            while (s.length < n) {
                s = pad + s;
            }
            return s;
        }
        let ret = ` |   |${word.split('').map(c => pad(c, 3)).join('|')}\n`;
        for (let i = 0; i <= patternLen; i++) {
            if (i === 0) {
                ret += ' |';
            }
            else {
                ret += `${pattern[i - 1]}|`;
            }
            ret += table[i].slice(0, wordLen + 1).map(n => pad(n.toString(), 3)).join('|') + '\n';
        }
        return ret;
    }
    function printTables(pattern, patternStart, word, wordStart) {
        pattern = pattern.substr(patternStart);
        word = word.substr(wordStart);
        console.log(printTable(_table, pattern, pattern.length, word, word.length));
        console.log(printTable(_arrows, pattern, pattern.length, word, word.length));
        console.log(printTable(_diag, pattern, pattern.length, word, word.length));
    }
    function isSeparatorAtPos(value, index) {
        if (index < 0 || index >= value.length) {
            return false;
        }
        const code = value.codePointAt(index);
        switch (code) {
            case 95 /* CharCode.Underline */:
            case 45 /* CharCode.Dash */:
            case 46 /* CharCode.Period */:
            case 32 /* CharCode.Space */:
            case 47 /* CharCode.Slash */:
            case 92 /* CharCode.Backslash */:
            case 39 /* CharCode.SingleQuote */:
            case 34 /* CharCode.DoubleQuote */:
            case 58 /* CharCode.Colon */:
            case 36 /* CharCode.DollarSign */:
            case 60 /* CharCode.LessThan */:
            case 62 /* CharCode.GreaterThan */:
            case 40 /* CharCode.OpenParen */:
            case 41 /* CharCode.CloseParen */:
            case 91 /* CharCode.OpenSquareBracket */:
            case 93 /* CharCode.CloseSquareBracket */:
            case 123 /* CharCode.OpenCurlyBrace */:
            case 125 /* CharCode.CloseCurlyBrace */:
                return true;
            case undefined:
                return false;
            default:
                if (strings.isEmojiImprecise(code)) {
                    return true;
                }
                return false;
        }
    }
    function isWhitespaceAtPos(value, index) {
        if (index < 0 || index >= value.length) {
            return false;
        }
        const code = value.charCodeAt(index);
        switch (code) {
            case 32 /* CharCode.Space */:
            case 9 /* CharCode.Tab */:
                return true;
            default:
                return false;
        }
    }
    function isUpperCaseAtPos(pos, word, wordLow) {
        return word[pos] !== wordLow[pos];
    }
    function isPatternInWord(patternLow, patternPos, patternLen, wordLow, wordPos, wordLen, fillMinWordPosArr = false) {
        while (patternPos < patternLen && wordPos < wordLen) {
            if (patternLow[patternPos] === wordLow[wordPos]) {
                if (fillMinWordPosArr) {
                    // Remember the min word position for each pattern position
                    _minWordMatchPos[patternPos] = wordPos;
                }
                patternPos += 1;
            }
            wordPos += 1;
        }
        return patternPos === patternLen; // pattern must be exhausted
    }
    exports.isPatternInWord = isPatternInWord;
    var Arrow;
    (function (Arrow) {
        Arrow[Arrow["Diag"] = 1] = "Diag";
        Arrow[Arrow["Left"] = 2] = "Left";
        Arrow[Arrow["LeftLeft"] = 3] = "LeftLeft";
    })(Arrow || (Arrow = {}));
    var FuzzyScore;
    (function (FuzzyScore) {
        /**
         * No matches and value `-100`
         */
        FuzzyScore.Default = ([-100, 0]);
        function isDefault(score) {
            return !score || (score.length === 2 && score[0] === -100 && score[1] === 0);
        }
        FuzzyScore.isDefault = isDefault;
    })(FuzzyScore || (exports.FuzzyScore = FuzzyScore = {}));
    class FuzzyScoreOptions {
        static { this.default = { boostFullMatch: true, firstMatchCanBeWeak: false }; }
        constructor(firstMatchCanBeWeak, boostFullMatch) {
            this.firstMatchCanBeWeak = firstMatchCanBeWeak;
            this.boostFullMatch = boostFullMatch;
        }
    }
    exports.FuzzyScoreOptions = FuzzyScoreOptions;
    function fuzzyScore(pattern, patternLow, patternStart, word, wordLow, wordStart, options = FuzzyScoreOptions.default) {
        const patternLen = pattern.length > _maxLen ? _maxLen : pattern.length;
        const wordLen = word.length > _maxLen ? _maxLen : word.length;
        if (patternStart >= patternLen || wordStart >= wordLen || (patternLen - patternStart) > (wordLen - wordStart)) {
            return undefined;
        }
        // Run a simple check if the characters of pattern occur
        // (in order) at all in word. If that isn't the case we
        // stop because no match will be possible
        if (!isPatternInWord(patternLow, patternStart, patternLen, wordLow, wordStart, wordLen, true)) {
            return undefined;
        }
        // Find the max matching word position for each pattern position
        // NOTE: the min matching word position was filled in above, in the `isPatternInWord` call
        _fillInMaxWordMatchPos(patternLen, wordLen, patternStart, wordStart, patternLow, wordLow);
        let row = 1;
        let column = 1;
        let patternPos = patternStart;
        let wordPos = wordStart;
        const hasStrongFirstMatch = [false];
        // There will be a match, fill in tables
        for (row = 1, patternPos = patternStart; patternPos < patternLen; row++, patternPos++) {
            // Reduce search space to possible matching word positions and to possible access from next row
            const minWordMatchPos = _minWordMatchPos[patternPos];
            const maxWordMatchPos = _maxWordMatchPos[patternPos];
            const nextMaxWordMatchPos = (patternPos + 1 < patternLen ? _maxWordMatchPos[patternPos + 1] : wordLen);
            for (column = minWordMatchPos - wordStart + 1, wordPos = minWordMatchPos; wordPos < nextMaxWordMatchPos; column++, wordPos++) {
                let score = Number.MIN_SAFE_INTEGER;
                let canComeDiag = false;
                if (wordPos <= maxWordMatchPos) {
                    score = _doScore(pattern, patternLow, patternPos, patternStart, word, wordLow, wordPos, wordLen, wordStart, _diag[row - 1][column - 1] === 0, hasStrongFirstMatch);
                }
                let diagScore = 0;
                if (score !== Number.MAX_SAFE_INTEGER) {
                    canComeDiag = true;
                    diagScore = score + _table[row - 1][column - 1];
                }
                const canComeLeft = wordPos > minWordMatchPos;
                const leftScore = canComeLeft ? _table[row][column - 1] + (_diag[row][column - 1] > 0 ? -5 : 0) : 0; // penalty for a gap start
                const canComeLeftLeft = wordPos > minWordMatchPos + 1 && _diag[row][column - 1] > 0;
                const leftLeftScore = canComeLeftLeft ? _table[row][column - 2] + (_diag[row][column - 2] > 0 ? -5 : 0) : 0; // penalty for a gap start
                if (canComeLeftLeft && (!canComeLeft || leftLeftScore >= leftScore) && (!canComeDiag || leftLeftScore >= diagScore)) {
                    // always prefer choosing left left to jump over a diagonal because that means a match is earlier in the word
                    _table[row][column] = leftLeftScore;
                    _arrows[row][column] = 3 /* Arrow.LeftLeft */;
                    _diag[row][column] = 0;
                }
                else if (canComeLeft && (!canComeDiag || leftScore >= diagScore)) {
                    // always prefer choosing left since that means a match is earlier in the word
                    _table[row][column] = leftScore;
                    _arrows[row][column] = 2 /* Arrow.Left */;
                    _diag[row][column] = 0;
                }
                else if (canComeDiag) {
                    _table[row][column] = diagScore;
                    _arrows[row][column] = 1 /* Arrow.Diag */;
                    _diag[row][column] = _diag[row - 1][column - 1] + 1;
                }
                else {
                    throw new Error(`not possible`);
                }
            }
        }
        if (_debug) {
            printTables(pattern, patternStart, word, wordStart);
        }
        if (!hasStrongFirstMatch[0] && !options.firstMatchCanBeWeak) {
            return undefined;
        }
        row--;
        column--;
        const result = [_table[row][column], wordStart];
        let backwardsDiagLength = 0;
        let maxMatchColumn = 0;
        while (row >= 1) {
            // Find the column where we go diagonally up
            let diagColumn = column;
            do {
                const arrow = _arrows[row][diagColumn];
                if (arrow === 3 /* Arrow.LeftLeft */) {
                    diagColumn = diagColumn - 2;
                }
                else if (arrow === 2 /* Arrow.Left */) {
                    diagColumn = diagColumn - 1;
                }
                else {
                    // found the diagonal
                    break;
                }
            } while (diagColumn >= 1);
            // Overturn the "forwards" decision if keeping the "backwards" diagonal would give a better match
            if (backwardsDiagLength > 1 // only if we would have a contiguous match of 3 characters
                && patternLow[patternStart + row - 1] === wordLow[wordStart + column - 1] // only if we can do a contiguous match diagonally
                && !isUpperCaseAtPos(diagColumn + wordStart - 1, word, wordLow) // only if the forwards chose diagonal is not an uppercase
                && backwardsDiagLength + 1 > _diag[row][diagColumn] // only if our contiguous match would be longer than the "forwards" contiguous match
            ) {
                diagColumn = column;
            }
            if (diagColumn === column) {
                // this is a contiguous match
                backwardsDiagLength++;
            }
            else {
                backwardsDiagLength = 1;
            }
            if (!maxMatchColumn) {
                // remember the last matched column
                maxMatchColumn = diagColumn;
            }
            row--;
            column = diagColumn - 1;
            result.push(column);
        }
        if (wordLen === patternLen && options.boostFullMatch) {
            // the word matches the pattern with all characters!
            // giving the score a total match boost (to come up ahead other words)
            result[0] += 2;
        }
        // Add 1 penalty for each skipped character in the word
        const skippedCharsCount = maxMatchColumn - patternLen;
        result[0] -= skippedCharsCount;
        return result;
    }
    exports.fuzzyScore = fuzzyScore;
    function _fillInMaxWordMatchPos(patternLen, wordLen, patternStart, wordStart, patternLow, wordLow) {
        let patternPos = patternLen - 1;
        let wordPos = wordLen - 1;
        while (patternPos >= patternStart && wordPos >= wordStart) {
            if (patternLow[patternPos] === wordLow[wordPos]) {
                _maxWordMatchPos[patternPos] = wordPos;
                patternPos--;
            }
            wordPos--;
        }
    }
    function _doScore(pattern, patternLow, patternPos, patternStart, word, wordLow, wordPos, wordLen, wordStart, newMatchStart, outFirstMatchStrong) {
        if (patternLow[patternPos] !== wordLow[wordPos]) {
            return Number.MIN_SAFE_INTEGER;
        }
        let score = 1;
        let isGapLocation = false;
        if (wordPos === (patternPos - patternStart)) {
            // common prefix: `foobar <-> foobaz`
            //                            ^^^^^
            score = pattern[patternPos] === word[wordPos] ? 7 : 5;
        }
        else if (isUpperCaseAtPos(wordPos, word, wordLow) && (wordPos === 0 || !isUpperCaseAtPos(wordPos - 1, word, wordLow))) {
            // hitting upper-case: `foo <-> forOthers`
            //                              ^^ ^
            score = pattern[patternPos] === word[wordPos] ? 7 : 5;
            isGapLocation = true;
        }
        else if (isSeparatorAtPos(wordLow, wordPos) && (wordPos === 0 || !isSeparatorAtPos(wordLow, wordPos - 1))) {
            // hitting a separator: `. <-> foo.bar`
            //                                ^
            score = 5;
        }
        else if (isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1)) {
            // post separator: `foo <-> bar_foo`
            //                              ^^^
            score = 5;
            isGapLocation = true;
        }
        if (score > 1 && patternPos === patternStart) {
            outFirstMatchStrong[0] = true;
        }
        if (!isGapLocation) {
            isGapLocation = isUpperCaseAtPos(wordPos, word, wordLow) || isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1);
        }
        //
        if (patternPos === patternStart) { // first character in pattern
            if (wordPos > wordStart) {
                // the first pattern character would match a word character that is not at the word start
                // so introduce a penalty to account for the gap preceding this match
                score -= isGapLocation ? 3 : 5;
            }
        }
        else {
            if (newMatchStart) {
                // this would be the beginning of a new match (i.e. there would be a gap before this location)
                score += isGapLocation ? 2 : 0;
            }
            else {
                // this is part of a contiguous match, so give it a slight bonus, but do so only if it would not be a preferred gap location
                score += isGapLocation ? 0 : 1;
            }
        }
        if (wordPos + 1 === wordLen) {
            // we always penalize gaps, but this gives unfair advantages to a match that would match the last character in the word
            // so pretend there is a gap after the last character in the word to normalize things
            score -= isGapLocation ? 3 : 5;
        }
        return score;
    }
    //#endregion
    //#region --- graceful ---
    function fuzzyScoreGracefulAggressive(pattern, lowPattern, patternPos, word, lowWord, wordPos, options) {
        return fuzzyScoreWithPermutations(pattern, lowPattern, patternPos, word, lowWord, wordPos, true, options);
    }
    exports.fuzzyScoreGracefulAggressive = fuzzyScoreGracefulAggressive;
    function fuzzyScoreGraceful(pattern, lowPattern, patternPos, word, lowWord, wordPos, options) {
        return fuzzyScoreWithPermutations(pattern, lowPattern, patternPos, word, lowWord, wordPos, false, options);
    }
    exports.fuzzyScoreGraceful = fuzzyScoreGraceful;
    function fuzzyScoreWithPermutations(pattern, lowPattern, patternPos, word, lowWord, wordPos, aggressive, options) {
        let top = fuzzyScore(pattern, lowPattern, patternPos, word, lowWord, wordPos, options);
        if (top && !aggressive) {
            // when using the original pattern yield a result we`
            // return it unless we are aggressive and try to find
            // a better alignment, e.g. `cno` -> `^co^ns^ole` or `^c^o^nsole`.
            return top;
        }
        if (pattern.length >= 3) {
            // When the pattern is long enough then try a few (max 7)
            // permutations of the pattern to find a better match. The
            // permutations only swap neighbouring characters, e.g
            // `cnoso` becomes `conso`, `cnsoo`, `cnoos`.
            const tries = Math.min(7, pattern.length - 1);
            for (let movingPatternPos = patternPos + 1; movingPatternPos < tries; movingPatternPos++) {
                const newPattern = nextTypoPermutation(pattern, movingPatternPos);
                if (newPattern) {
                    const candidate = fuzzyScore(newPattern, newPattern.toLowerCase(), patternPos, word, lowWord, wordPos, options);
                    if (candidate) {
                        candidate[0] -= 3; // permutation penalty
                        if (!top || candidate[0] > top[0]) {
                            top = candidate;
                        }
                    }
                }
            }
        }
        return top;
    }
    function nextTypoPermutation(pattern, patternPos) {
        if (patternPos + 1 >= pattern.length) {
            return undefined;
        }
        const swap1 = pattern[patternPos];
        const swap2 = pattern[patternPos + 1];
        if (swap1 === swap2) {
            return undefined;
        }
        return pattern.slice(0, patternPos)
            + swap2
            + swap1
            + pattern.slice(patternPos + 2);
    }
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2ZpbHRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JoRyxtQkFBbUI7SUFFbkI7Ozs7O09BS0c7SUFDSCxTQUFnQixFQUFFLENBQUMsR0FBRyxNQUFpQjtRQUN0QyxPQUFPLFVBQVUsSUFBWSxFQUFFLGtCQUEwQjtZQUN4RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNsRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0JBQ2xELElBQUksS0FBSyxFQUFFO29CQUNWLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2FBQ0Q7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUMsQ0FBQztJQUNILENBQUM7SUFWRCxnQkFVQztJQUVELFNBQVM7SUFFSSxRQUFBLG1CQUFtQixHQUFZLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JFLFFBQUEsYUFBYSxHQUFZLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRTNFLFNBQVMsY0FBYyxDQUFDLFVBQW1CLEVBQUUsSUFBWSxFQUFFLGtCQUEwQjtRQUNwRixJQUFJLENBQUMsa0JBQWtCLElBQUksa0JBQWtCLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDbkUsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELElBQUksT0FBZ0IsQ0FBQztRQUNyQixJQUFJLFVBQVUsRUFBRTtZQUNmLE9BQU8sR0FBRyxPQUFPLENBQUMsb0JBQW9C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