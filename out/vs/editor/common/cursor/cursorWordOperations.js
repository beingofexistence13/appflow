/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/cursorCommon", "vs/editor/common/cursor/cursorDeleteOperations", "vs/editor/common/core/wordCharacterClassifier", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, strings, cursorCommon_1, cursorDeleteOperations_1, wordCharacterClassifier_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WordPartOperations = exports.WordOperations = exports.WordNavigationType = void 0;
    var WordType;
    (function (WordType) {
        WordType[WordType["None"] = 0] = "None";
        WordType[WordType["Regular"] = 1] = "Regular";
        WordType[WordType["Separator"] = 2] = "Separator";
    })(WordType || (WordType = {}));
    var WordNavigationType;
    (function (WordNavigationType) {
        WordNavigationType[WordNavigationType["WordStart"] = 0] = "WordStart";
        WordNavigationType[WordNavigationType["WordStartFast"] = 1] = "WordStartFast";
        WordNavigationType[WordNavigationType["WordEnd"] = 2] = "WordEnd";
        WordNavigationType[WordNavigationType["WordAccessibility"] = 3] = "WordAccessibility"; // Respect chrome definition of a word
    })(WordNavigationType || (exports.WordNavigationType = WordNavigationType = {}));
    class WordOperations {
        static _createWord(lineContent, wordType, nextCharClass, start, end) {
            // console.log('WORD ==> ' + start + ' => ' + end + ':::: <<<' + lineContent.substring(start, end) + '>>>');
            return { start: start, end: end, wordType: wordType, nextCharClass: nextCharClass };
        }
        static _findPreviousWordOnLine(wordSeparators, model, position) {
            const lineContent = model.getLineContent(position.lineNumber);
            return this._doFindPreviousWordOnLine(lineContent, wordSeparators, position);
        }
        static _doFindPreviousWordOnLine(lineContent, wordSeparators, position) {
            let wordType = 0 /* WordType.None */;
            for (let chIndex = position.column - 2; chIndex >= 0; chIndex--) {
                const chCode = lineContent.charCodeAt(chIndex);
                const chClass = wordSeparators.get(chCode);
                if (chClass === 0 /* WordCharacterClass.Regular */) {
                    if (wordType === 2 /* WordType.Separator */) {
                        return this._createWord(lineContent, wordType, chClass, chIndex + 1, this._findEndOfWord(lineContent, wordSeparators, wordType, chIndex + 1));
                    }
                    wordType = 1 /* WordType.Regular */;
                }
                else if (chClass === 2 /* WordCharacterClass.WordSeparator */) {
                    if (wordType === 1 /* WordType.Regular */) {
                        return this._createWord(lineContent, wordType, chClass, chIndex + 1, this._findEndOfWord(lineContent, wordSeparators, wordType, chIndex + 1));
                    }
                    wordType = 2 /* WordType.Separator */;
                }
                else if (chClass === 1 /* WordCharacterClass.Whitespace */) {
                    if (wordType !== 0 /* WordType.None */) {
                        return this._createWord(lineContent, wordType, chClass, chIndex + 1, this._findEndOfWord(lineContent, wordSeparators, wordType, chIndex + 1));
                    }
                }
            }
            if (wordType !== 0 /* WordType.None */) {
                return this._createWord(lineContent, wordType, 1 /* WordCharacterClass.Whitespace */, 0, this._findEndOfWord(lineContent, wordSeparators, wordType, 0));
            }
            return null;
        }
        static _findEndOfWord(lineContent, wordSeparators, wordType, startIndex) {
            const len = lineContent.length;
            for (let chIndex = startIndex; chIndex < len; chIndex++) {
                const chCode = lineContent.charCodeAt(chIndex);
                const chClass = wordSeparators.get(chCode);
                if (chClass === 1 /* WordCharacterClass.Whitespace */) {
                    return chIndex;
                }
                if (wordType === 1 /* WordType.Regular */ && chClass === 2 /* WordCharacterClass.WordSeparator */) {
                    return chIndex;
                }
                if (wordType === 2 /* WordType.Separator */ && chClass === 0 /* WordCharacterClass.Regular */) {
                    return chIndex;
                }
            }
            return len;
        }
        static _findNextWordOnLine(wordSeparators, model, position) {
            const lineContent = model.getLineContent(position.lineNumber);
            return this._doFindNextWordOnLine(lineContent, wordSeparators, position);
        }
        static _doFindNextWordOnLine(lineContent, wordSeparators, position) {
            let wordType = 0 /* WordType.None */;
            const len = lineContent.length;
            for (let chIndex = position.column - 1; chIndex < len; chIndex++) {
                const chCode = lineContent.charCodeAt(chIndex);
                const chClass = wordSeparators.get(chCode);
                if (chClass === 0 /* WordCharacterClass.Regular */) {
                    if (wordType === 2 /* WordType.Separator */) {
                        return this._createWord(lineContent, wordType, chClass, this._findStartOfWord(lineContent, wordSeparators, wordType, chIndex - 1), chIndex);
                    }
                    wordType = 1 /* WordType.Regular */;
                }
                else if (chClass === 2 /* WordCharacterClass.WordSeparator */) {
                    if (wordType === 1 /* WordType.Regular */) {
                        return this._createWord(lineContent, wordType, chClass, this._findStartOfWord(lineContent, wordSeparators, wordType, chIndex - 1), chIndex);
                    }
                    wordType = 2 /* WordType.Separator */;
                }
                else if (chClass === 1 /* WordCharacterClass.Whitespace */) {
                    if (wordType !== 0 /* WordType.None */) {
                        return this._createWord(lineContent, wordType, chClass, this._findStartOfWord(lineContent, wordSeparators, wordType, chIndex - 1), chIndex);
                    }
                }
            }
            if (wordType !== 0 /* WordType.None */) {
                return this._createWord(lineContent, wordType, 1 /* WordCharacterClass.Whitespace */, this._findStartOfWord(lineContent, wordSeparators, wordType, len - 1), len);
            }
            return null;
        }
        static _findStartOfWord(lineContent, wordSeparators, wordType, startIndex) {
            for (let chIndex = startIndex; chIndex >= 0; chIndex--) {
                const chCode = lineContent.charCodeAt(chIndex);
                const chClass = wordSeparators.get(chCode);
                if (chClass === 1 /* WordCharacterClass.Whitespace */) {
                    return chIndex + 1;
                }
                if (wordType === 1 /* WordType.Regular */ && chClass === 2 /* WordCharacterClass.WordSeparator */) {
                    return chIndex + 1;
                }
                if (wordType === 2 /* WordType.Separator */ && chClass === 0 /* WordCharacterClass.Regular */) {
                    return chIndex + 1;
                }
            }
            return 0;
        }
        static moveWordLeft(wordSeparators, model, position, wordNavigationType) {
            let lineNumber = position.lineNumber;
            let column = position.column;
            if (column === 1) {
                if (lineNumber > 1) {
                    lineNumber = lineNumber - 1;
                    column = model.getLineMaxColumn(lineNumber);
                }
            }
            let prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, column));
            if (wordNavigationType === 0 /* WordNavigationType.WordStart */) {
                return new position_1.Position(lineNumber, prevWordOnLine ? prevWordOnLine.start + 1 : 1);
            }
            if (wordNavigationType === 1 /* WordNavigationType.WordStartFast */) {
                if (prevWordOnLine
                    && prevWordOnLine.wordType === 2 /* WordType.Separator */
                    && prevWordOnLine.end - prevWordOnLine.start === 1
                    && prevWordOnLine.nextCharClass === 0 /* WordCharacterClass.Regular */) {
                    // Skip over a word made up of one single separator and followed by a regular character
                    prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, prevWordOnLine.start + 1));
                }
                return new position_1.Position(lineNumber, prevWordOnLine ? prevWordOnLine.start + 1 : 1);
            }
            if (wordNavigationType === 3 /* WordNavigationType.WordAccessibility */) {
                while (prevWordOnLine
                    && prevWordOnLine.wordType === 2 /* WordType.Separator */) {
                    // Skip over words made up of only separators
                    prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, prevWordOnLine.start + 1));
                }
                return new position_1.Position(lineNumber, prevWordOnLine ? prevWordOnLine.start + 1 : 1);
            }
            // We are stopping at the ending of words
            if (prevWordOnLine && column <= prevWordOnLine.end + 1) {
                prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, prevWordOnLine.start + 1));
            }
            return new position_1.Position(lineNumber, prevWordOnLine ? prevWordOnLine.end + 1 : 1);
        }
        static _moveWordPartLeft(model, position) {
            const lineNumber = position.lineNumber;
            const maxColumn = model.getLineMaxColumn(lineNumber);
            if (position.column === 1) {
                return (lineNumber > 1 ? new position_1.Position(lineNumber - 1, model.getLineMaxColumn(lineNumber - 1)) : position);
            }
            const lineContent = model.getLineContent(lineNumber);
            for (let column = position.column - 1; column > 1; column--) {
                const left = lineContent.charCodeAt(column - 2);
                const right = lineContent.charCodeAt(column - 1);
                if (left === 95 /* CharCode.Underline */ && right !== 95 /* CharCode.Underline */) {
                    // snake_case_variables
                    return new position_1.Position(lineNumber, column);
                }
                if (left === 45 /* CharCode.Dash */ && right !== 45 /* CharCode.Dash */) {
                    // kebab-case-variables
                    return new position_1.Position(lineNumber, column);
                }
                if ((strings.isLowerAsciiLetter(left) || strings.isAsciiDigit(left)) && strings.isUpperAsciiLetter(right)) {
                    // camelCaseVariables
                    return new position_1.Position(lineNumber, column);
                }
                if (strings.isUpperAsciiLetter(left) && strings.isUpperAsciiLetter(right)) {
                    // thisIsACamelCaseWithOneLetterWords
                    if (column + 1 < maxColumn) {
                        const rightRight = lineContent.charCodeAt(column);
                        if (strings.isLowerAsciiLetter(rightRight) || strings.isAsciiDigit(rightRight)) {
                            return new position_1.Position(lineNumber, column);
                        }
                    }
                }
            }
            return new position_1.Position(lineNumber, 1);
        }
        static moveWordRight(wordSeparators, model, position, wordNavigationType) {
            let lineNumber = position.lineNumber;
            let column = position.column;
            let movedDown = false;
            if (column === model.getLineMaxColumn(lineNumber)) {
                if (lineNumber < model.getLineCount()) {
                    movedDown = true;
                    lineNumber = lineNumber + 1;
                    column = 1;
                }
            }
            let nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, column));
            if (wordNavigationType === 2 /* WordNavigationType.WordEnd */) {
                if (nextWordOnLine && nextWordOnLine.wordType === 2 /* WordType.Separator */) {
                    if (nextWordOnLine.end - nextWordOnLine.start === 1 && nextWordOnLine.nextCharClass === 0 /* WordCharacterClass.Regular */) {
                        // Skip over a word made up of one single separator and followed by a regular character
                        nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, nextWordOnLine.end + 1));
                    }
                }
                if (nextWordOnLine) {
                    column = nextWordOnLine.end + 1;
                }
                else {
                    column = model.getLineMaxColumn(lineNumber);
                }
            }
            else if (wordNavigationType === 3 /* WordNavigationType.WordAccessibility */) {
                if (movedDown) {
                    // If we move to the next line, pretend that the cursor is right before the first character.
                    // This is needed when the first word starts right at the first character - and in order not to miss it,
                    // we need to start before.
                    column = 0;
                }
                while (nextWordOnLine
                    && (nextWordOnLine.wordType === 2 /* WordType.Separator */
                        || nextWordOnLine.start + 1 <= column)) {
                    // Skip over a word made up of one single separator
                    // Also skip over word if it begins before current cursor position to ascertain we're moving forward at least 1 character.
                    nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, nextWordOnLine.end + 1));
                }
                if (nextWordOnLine) {
                    column = nextWordOnLine.start + 1;
                }
                else {
                    column = model.getLineMaxColumn(lineNumber);
                }
            }
            else {
                if (nextWordOnLine && !movedDown && column >= nextWordOnLine.start + 1) {
                    nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, nextWordOnLine.end + 1));
                }
                if (nextWordOnLine) {
                    column = nextWordOnLine.start + 1;
                }
                else {
                    column = model.getLineMaxColumn(lineNumber);
                }
            }
            return new position_1.Position(lineNumber, column);
        }
        static _moveWordPartRight(model, position) {
            const lineNumber = position.lineNumber;
            const maxColumn = model.getLineMaxColumn(lineNumber);
            if (position.column === maxColumn) {
                return (lineNumber < model.getLineCount() ? new position_1.Position(lineNumber + 1, 1) : position);
            }
            const lineContent = model.getLineContent(lineNumber);
            for (let column = position.column + 1; column < maxColumn; column++) {
                const left = lineContent.charCodeAt(column - 2);
                const right = lineContent.charCodeAt(column - 1);
                if (left !== 95 /* CharCode.Underline */ && right === 95 /* CharCode.Underline */) {
                    // snake_case_variables
                    return new position_1.Position(lineNumber, column);
                }
                if (left !== 45 /* CharCode.Dash */ && right === 45 /* CharCode.Dash */) {
                    // kebab-case-variables
                    return new position_1.Position(lineNumber, column);
                }
                if ((strings.isLowerAsciiLetter(left) || strings.isAsciiDigit(left)) && strings.isUpperAsciiLetter(right)) {
                    // camelCaseVariables
                    return new position_1.Position(lineNumber, column);
                }
                if (strings.isUpperAsciiLetter(left) && strings.isUpperAsciiLetter(right)) {
                    // thisIsACamelCaseWithOneLetterWords
                    if (column + 1 < maxColumn) {
                        const rightRight = lineContent.charCodeAt(column);
                        if (strings.isLowerAsciiLetter(rightRight) || strings.isAsciiDigit(rightRight)) {
                            return new position_1.Position(lineNumber, column);
                        }
                    }
                }
            }
            return new position_1.Position(lineNumber, maxColumn);
        }
        static _deleteWordLeftWhitespace(model, position) {
            const lineContent = model.getLineContent(position.lineNumber);
            const startIndex = position.column - 2;
            const lastNonWhitespace = strings.lastNonWhitespaceIndex(lineContent, startIndex);
            if (lastNonWhitespace + 1 < startIndex) {
                return new range_1.Range(position.lineNumber, lastNonWhitespace + 2, position.lineNumber, position.column);
            }
            return null;
        }
        static deleteWordLeft(ctx, wordNavigationType) {
            const wordSeparators = ctx.wordSeparators;
            const model = ctx.model;
            const selection = ctx.selection;
            const whitespaceHeuristics = ctx.whitespaceHeuristics;
            if (!selection.isEmpty()) {
                return selection;
            }
            if (cursorDeleteOperations_1.DeleteOperations.isAutoClosingPairDelete(ctx.autoClosingDelete, ctx.autoClosingBrackets, ctx.autoClosingQuotes, ctx.autoClosingPairs.autoClosingPairsOpenByEnd, ctx.model, [ctx.selection], ctx.autoClosedCharacters)) {
                const position = ctx.selection.getPosition();
                return new range_1.Range(position.lineNumber, position.column - 1, position.lineNumber, position.column + 1);
            }
            const position = new position_1.Position(selection.positionLineNumber, selection.positionColumn);
            let lineNumber = position.lineNumber;
            let column = position.column;
            if (lineNumber === 1 && column === 1) {
                // Ignore deleting at beginning of file
                return null;
            }
            if (whitespaceHeuristics) {
                const r = this._deleteWordLeftWhitespace(model, position);
                if (r) {
                    return r;
                }
            }
            let prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, position);
            if (wordNavigationType === 0 /* WordNavigationType.WordStart */) {
                if (prevWordOnLine) {
                    column = prevWordOnLine.start + 1;
                }
                else {
                    if (column > 1) {
                        column = 1;
                    }
                    else {
                        lineNumber--;
                        column = model.getLineMaxColumn(lineNumber);
                    }
                }
            }
            else {
                if (prevWordOnLine && column <= prevWordOnLine.end + 1) {
                    prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, prevWordOnLine.start + 1));
                }
                if (prevWordOnLine) {
                    column = prevWordOnLine.end + 1;
                }
                else {
                    if (column > 1) {
                        column = 1;
                    }
                    else {
                        lineNumber--;
                        column = model.getLineMaxColumn(lineNumber);
                    }
                }
            }
            return new range_1.Range(lineNumber, column, position.lineNumber, position.column);
        }
        static deleteInsideWord(wordSeparators, model, selection) {
            if (!selection.isEmpty()) {
                return selection;
            }
            const position = new position_1.Position(selection.positionLineNumber, selection.positionColumn);
            const r = this._deleteInsideWordWhitespace(model, position);
            if (r) {
                return r;
            }
            return this._deleteInsideWordDetermineDeleteRange(wordSeparators, model, position);
        }
        static _charAtIsWhitespace(str, index) {
            const charCode = str.charCodeAt(index);
            return (charCode === 32 /* CharCode.Space */ || charCode === 9 /* CharCode.Tab */);
        }
        static _deleteInsideWordWhitespace(model, position) {
            const lineContent = model.getLineContent(position.lineNumber);
            const lineContentLength = lineContent.length;
            if (lineContentLength === 0) {
                // empty line
                return null;
            }
            let leftIndex = Math.max(position.column - 2, 0);
            if (!this._charAtIsWhitespace(lineContent, leftIndex)) {
                // touches a non-whitespace character to the left
                return null;
            }
            let rightIndex = Math.min(position.column - 1, lineContentLength - 1);
            if (!this._charAtIsWhitespace(lineContent, rightIndex)) {
                // touches a non-whitespace character to the right
                return null;
            }
            // walk over whitespace to the left
            while (leftIndex > 0 && this._charAtIsWhitespace(lineContent, leftIndex - 1)) {
                leftIndex--;
            }
            // walk over whitespace to the right
            while (rightIndex + 1 < lineContentLength && this._charAtIsWhitespace(lineContent, rightIndex + 1)) {
                rightIndex++;
            }
            return new range_1.Range(position.lineNumber, leftIndex + 1, position.lineNumber, rightIndex + 2);
        }
        static _deleteInsideWordDetermineDeleteRange(wordSeparators, model, position) {
            const lineContent = model.getLineContent(position.lineNumber);
            const lineLength = lineContent.length;
            if (lineLength === 0) {
                // empty line
                if (position.lineNumber > 1) {
                    return new range_1.Range(position.lineNumber - 1, model.getLineMaxColumn(position.lineNumber - 1), position.lineNumber, 1);
                }
                else {
                    if (position.lineNumber < model.getLineCount()) {
                        return new range_1.Range(position.lineNumber, 1, position.lineNumber + 1, 1);
                    }
                    else {
                        // empty model
                        return new range_1.Range(position.lineNumber, 1, position.lineNumber, 1);
                    }
                }
            }
            const touchesWord = (word) => {
                return (word.start + 1 <= position.column && position.column <= word.end + 1);
            };
            const createRangeWithPosition = (startColumn, endColumn) => {
                startColumn = Math.min(startColumn, position.column);
                endColumn = Math.max(endColumn, position.column);
                return new range_1.Range(position.lineNumber, startColumn, position.lineNumber, endColumn);
            };
            const deleteWordAndAdjacentWhitespace = (word) => {
                let startColumn = word.start + 1;
                let endColumn = word.end + 1;
                let expandedToTheRight = false;
                while (endColumn - 1 < lineLength && this._charAtIsWhitespace(lineContent, endColumn - 1)) {
                    expandedToTheRight = true;
                    endColumn++;
                }
                if (!expandedToTheRight) {
                    while (startColumn > 1 && this._charAtIsWhitespace(lineContent, startColumn - 2)) {
                        startColumn--;
                    }
                }
                return createRangeWithPosition(startColumn, endColumn);
            };
            const prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, position);
            if (prevWordOnLine && touchesWord(prevWordOnLine)) {
                return deleteWordAndAdjacentWhitespace(prevWordOnLine);
            }
            const nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, position);
            if (nextWordOnLine && touchesWord(nextWordOnLine)) {
                return deleteWordAndAdjacentWhitespace(nextWordOnLine);
            }
            if (prevWordOnLine && nextWordOnLine) {
                return createRangeWithPosition(prevWordOnLine.end + 1, nextWordOnLine.start + 1);
            }
            if (prevWordOnLine) {
                return createRangeWithPosition(prevWordOnLine.start + 1, prevWordOnLine.end + 1);
            }
            if (nextWordOnLine) {
                return createRangeWithPosition(nextWordOnLine.start + 1, nextWordOnLine.end + 1);
            }
            return createRangeWithPosition(1, lineLength + 1);
        }
        static _deleteWordPartLeft(model, selection) {
            if (!selection.isEmpty()) {
                return selection;
            }
            const pos = selection.getPosition();
            const toPosition = WordOperations._moveWordPartLeft(model, pos);
            return new range_1.Range(pos.lineNumber, pos.column, toPosition.lineNumber, toPosition.column);
        }
        static _findFirstNonWhitespaceChar(str, startIndex) {
            const len = str.length;
            for (let chIndex = startIndex; chIndex < len; chIndex++) {
                const ch = str.charAt(chIndex);
                if (ch !== ' ' && ch !== '\t') {
                    return chIndex;
                }
            }
            return len;
        }
        static _deleteWordRightWhitespace(model, position) {
            const lineContent = model.getLineContent(position.lineNumber);
            const startIndex = position.column - 1;
            const firstNonWhitespace = this._findFirstNonWhitespaceChar(lineContent, startIndex);
            if (startIndex + 1 < firstNonWhitespace) {
                // bingo
                return new range_1.Range(position.lineNumber, position.column, position.lineNumber, firstNonWhitespace + 1);
            }
            return null;
        }
        static deleteWordRight(ctx, wordNavigationType) {
            const wordSeparators = ctx.wordSeparators;
            const model = ctx.model;
            const selection = ctx.selection;
            const whitespaceHeuristics = ctx.whitespaceHeuristics;
            if (!selection.isEmpty()) {
                return selection;
            }
            const position = new position_1.Position(selection.positionLineNumber, selection.positionColumn);
            let lineNumber = position.lineNumber;
            let column = position.column;
            const lineCount = model.getLineCount();
            const maxColumn = model.getLineMaxColumn(lineNumber);
            if (lineNumber === lineCount && column === maxColumn) {
                // Ignore deleting at end of file
                return null;
            }
            if (whitespaceHeuristics) {
                const r = this._deleteWordRightWhitespace(model, position);
                if (r) {
                    return r;
                }
            }
            let nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, position);
            if (wordNavigationType === 2 /* WordNavigationType.WordEnd */) {
                if (nextWordOnLine) {
                    column = nextWordOnLine.end + 1;
                }
                else {
                    if (column < maxColumn || lineNumber === lineCount) {
                        column = maxColumn;
                    }
                    else {
                        lineNumber++;
                        nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, 1));
                        if (nextWordOnLine) {
                            column = nextWordOnLine.start + 1;
                        }
                        else {
                            column = model.getLineMaxColumn(lineNumber);
                        }
                    }
                }
            }
            else {
                if (nextWordOnLine && column >= nextWordOnLine.start + 1) {
                    nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, nextWordOnLine.end + 1));
                }
                if (nextWordOnLine) {
                    column = nextWordOnLine.start + 1;
                }
                else {
                    if (column < maxColumn || lineNumber === lineCount) {
                        column = maxColumn;
                    }
                    else {
                        lineNumber++;
                        nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, 1));
                        if (nextWordOnLine) {
                            column = nextWordOnLine.start + 1;
                        }
                        else {
                            column = model.getLineMaxColumn(lineNumber);
                        }
                    }
                }
            }
            return new range_1.Range(lineNumber, column, position.lineNumber, position.column);
        }
        static _deleteWordPartRight(model, selection) {
            if (!selection.isEmpty()) {
                return selection;
            }
            const pos = selection.getPosition();
            const toPosition = WordOperations._moveWordPartRight(model, pos);
            return new range_1.Range(pos.lineNumber, pos.column, toPosition.lineNumber, toPosition.column);
        }
        static _createWordAtPosition(model, lineNumber, word) {
            const range = new range_1.Range(lineNumber, word.start + 1, lineNumber, word.end + 1);
            return {
                word: model.getValueInRange(range),
                startColumn: range.startColumn,
                endColumn: range.endColumn
            };
        }
        static getWordAtPosition(model, _wordSeparators, position) {
            const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(_wordSeparators);
            const prevWord = WordOperations._findPreviousWordOnLine(wordSeparators, model, position);
            if (prevWord && prevWord.wordType === 1 /* WordType.Regular */ && prevWord.start <= position.column - 1 && position.column - 1 <= prevWord.end) {
                return WordOperations._createWordAtPosition(model, position.lineNumber, prevWord);
            }
            const nextWord = WordOperations._findNextWordOnLine(wordSeparators, model, position);
            if (nextWord && nextWord.wordType === 1 /* WordType.Regular */ && nextWord.start <= position.column - 1 && position.column - 1 <= nextWord.end) {
                return WordOperations._createWordAtPosition(model, position.lineNumber, nextWord);
            }
            return null;
        }
        static word(config, model, cursor, inSelectionMode, position) {
            const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(config.wordSeparators);
            const prevWord = WordOperations._findPreviousWordOnLine(wordSeparators, model, position);
            const nextWord = WordOperations._findNextWordOnLine(wordSeparators, model, position);
            if (!inSelectionMode) {
                // Entering word selection for the first time
                let startColumn;
                let endColumn;
                if (prevWord && prevWord.wordType === 1 /* WordType.Regular */ && prevWord.start <= position.column - 1 && position.column - 1 <= prevWord.end) {
                    // isTouchingPrevWord
                    startColumn = prevWord.start + 1;
                    endColumn = prevWord.end + 1;
                }
                else if (nextWord && nextWord.wordType === 1 /* WordType.Regular */ && nextWord.start <= position.column - 1 && position.column - 1 <= nextWord.end) {
                    // isTouchingNextWord
                    startColumn = nextWord.start + 1;
                    endColumn = nextWord.end + 1;
                }
                else {
                    if (prevWord) {
                        startColumn = prevWord.end + 1;
                    }
                    else {
                        startColumn = 1;
                    }
                    if (nextWord) {
                        endColumn = nextWord.start + 1;
                    }
                    else {
                        endColumn = model.getLineMaxColumn(position.lineNumber);
                    }
                }
                return new cursorCommon_1.SingleCursorState(new range_1.Range(position.lineNumber, startColumn, position.lineNumber, endColumn), 1 /* SelectionStartKind.Word */, 0, new position_1.Position(position.lineNumber, endColumn), 0);
            }
            let startColumn;
            let endColumn;
            if (prevWord && prevWord.wordType === 1 /* WordType.Regular */ && prevWord.start < position.column - 1 && position.column - 1 < prevWord.end) {
                // isInsidePrevWord
                startColumn = prevWord.start + 1;
                endColumn = prevWord.end + 1;
            }
            else if (nextWord && nextWord.wordType === 1 /* WordType.Regular */ && nextWord.start < position.column - 1 && position.column - 1 < nextWord.end) {
                // isInsideNextWord
                startColumn = nextWord.start + 1;
                endColumn = nextWord.end + 1;
            }
            else {
                startColumn = position.column;
                endColumn = position.column;
            }
            const lineNumber = position.lineNumber;
            let column;
            if (cursor.selectionStart.containsPosition(position)) {
                column = cursor.selectionStart.endColumn;
            }
            else if (position.isBeforeOrEqual(cursor.selectionStart.getStartPosition())) {
                column = startColumn;
                const possiblePosition = new position_1.Position(lineNumber, column);
                if (cursor.selectionStart.containsPosition(possiblePosition)) {
                    column = cursor.selectionStart.endColumn;
                }
            }
            else {
                column = endColumn;
                const possiblePosition = new position_1.Position(lineNumber, column);
                if (cursor.selectionStart.containsPosition(possiblePosition)) {
                    column = cursor.selectionStart.startColumn;
                }
            }
            return cursor.move(true, lineNumber, column, 0);
        }
    }
    exports.WordOperations = WordOperations;
    class WordPartOperations extends WordOperations {
        static deleteWordPartLeft(ctx) {
            const candidates = enforceDefined([
                WordOperations.deleteWordLeft(ctx, 0 /* WordNavigationType.WordStart */),
                WordOperations.deleteWordLeft(ctx, 2 /* WordNavigationType.WordEnd */),
                WordOperations._deleteWordPartLeft(ctx.model, ctx.selection)
            ]);
            candidates.sort(range_1.Range.compareRangesUsingEnds);
            return candidates[2];
        }
        static deleteWordPartRight(ctx) {
            const candidates = enforceDefined([
                WordOperations.deleteWordRight(ctx, 0 /* WordNavigationType.WordStart */),
                WordOperations.deleteWordRight(ctx, 2 /* WordNavigationType.WordEnd */),
                WordOperations._deleteWordPartRight(ctx.model, ctx.selection)
            ]);
            candidates.sort(range_1.Range.compareRangesUsingStarts);
            return candidates[0];
        }
        static moveWordPartLeft(wordSeparators, model, position) {
            const candidates = enforceDefined([
                WordOperations.moveWordLeft(wordSeparators, model, position, 0 /* WordNavigationType.WordStart */),
                WordOperations.moveWordLeft(wordSeparators, model, position, 2 /* WordNavigationType.WordEnd */),
                WordOperations._moveWordPartLeft(model, position)
            ]);
            candidates.sort(position_1.Position.compare);
            return candidates[2];
        }
        static moveWordPartRight(wordSeparators, model, position) {
            const candidates = enforceDefined([
                WordOperations.moveWordRight(wordSeparators, model, position, 0 /* WordNavigationType.WordStart */),
                WordOperations.moveWordRight(wordSeparators, model, position, 2 /* WordNavigationType.WordEnd */),
                WordOperations._moveWordPartRight(model, position)
            ]);
            candidates.sort(position_1.Position.compare);
            return candidates[0];
        }
    }
    exports.WordPartOperations = WordPartOperations;
    function enforceDefined(arr) {
        return arr.filter(el => Boolean(el));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yV29yZE9wZXJhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2N1cnNvci9jdXJzb3JXb3JkT3BlcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQ2hHLElBQVcsUUFJVjtJQUpELFdBQVcsUUFBUTtRQUNsQix1Q0FBUSxDQUFBO1FBQ1IsNkNBQVcsQ0FBQTtRQUNYLGlEQUFhLENBQUE7SUFDZCxDQUFDLEVBSlUsUUFBUSxLQUFSLFFBQVEsUUFJbEI7SUFFRCxJQUFrQixrQkFLakI7SUFMRCxXQUFrQixrQkFBa0I7UUFDbkMscUVBQWEsQ0FBQTtRQUNiLDZFQUFpQixDQUFBO1FBQ2pCLGlFQUFXLENBQUE7UUFDWCxxRkFBcUIsQ0FBQSxDQUFDLHNDQUFzQztJQUM3RCxDQUFDLEVBTGlCLGtCQUFrQixrQ0FBbEIsa0JBQWtCLFFBS25DO0lBY0QsTUFBYSxjQUFjO1FBRWxCLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBbUIsRUFBRSxRQUFrQixFQUFFLGFBQWlDLEVBQUUsS0FBYSxFQUFFLEdBQVc7WUFDaEksNEdBQTRHO1lBQzVHLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLENBQUM7UUFDckYsQ0FBQztRQUVPLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxjQUF1QyxFQUFFLEtBQXlCLEVBQUUsUUFBa0I7WUFDNUgsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDOUQsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsV0FBVyxFQUFFLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRU8sTUFBTSxDQUFD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