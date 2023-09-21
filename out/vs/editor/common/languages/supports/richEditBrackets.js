/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/stringBuilder", "vs/editor/common/core/range"], function (require, exports, strings, stringBuilder, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BracketsUtils = exports.RichEditBrackets = exports.RichEditBracket = void 0;
    /**
     * Represents a grouping of colliding bracket pairs.
     *
     * Most of the times this contains a single bracket pair,
     * but sometimes this contains multiple bracket pairs in cases
     * where the same string appears as a closing bracket for multiple
     * bracket pairs, or the same string appears an opening bracket for
     * multiple bracket pairs.
     *
     * e.g. of a group containing a single pair:
     *   open: ['{'], close: ['}']
     *
     * e.g. of a group containing multiple pairs:
     *   open: ['if', 'for'], close: ['end', 'end']
     */
    class RichEditBracket {
        constructor(languageId, index, open, close, forwardRegex, reversedRegex) {
            this._richEditBracketBrand = undefined;
            this.languageId = languageId;
            this.index = index;
            this.open = open;
            this.close = close;
            this.forwardRegex = forwardRegex;
            this.reversedRegex = reversedRegex;
            this._openSet = RichEditBracket._toSet(this.open);
            this._closeSet = RichEditBracket._toSet(this.close);
        }
        /**
         * Check if the provided `text` is an open bracket in this group.
         */
        isOpen(text) {
            return this._openSet.has(text);
        }
        /**
         * Check if the provided `text` is a close bracket in this group.
         */
        isClose(text) {
            return this._closeSet.has(text);
        }
        static _toSet(arr) {
            const result = new Set();
            for (const element of arr) {
                result.add(element);
            }
            return result;
        }
    }
    exports.RichEditBracket = RichEditBracket;
    /**
     * Groups together brackets that have equal open or close sequences.
     *
     * For example, if the following brackets are defined:
     *   ['IF','END']
     *   ['for','end']
     *   ['{','}']
     *
     * Then the grouped brackets would be:
     *   { open: ['if', 'for'], close: ['end', 'end'] }
     *   { open: ['{'], close: ['}'] }
     *
     */
    function groupFuzzyBrackets(brackets) {
        const N = brackets.length;
        brackets = brackets.map(b => [b[0].toLowerCase(), b[1].toLowerCase()]);
        const group = [];
        for (let i = 0; i < N; i++) {
            group[i] = i;
        }
        const areOverlapping = (a, b) => {
            const [aOpen, aClose] = a;
            const [bOpen, bClose] = b;
            return (aOpen === bOpen || aOpen === bClose || aClose === bOpen || aClose === bClose);
        };
        const mergeGroups = (g1, g2) => {
            const newG = Math.min(g1, g2);
            const oldG = Math.max(g1, g2);
            for (let i = 0; i < N; i++) {
                if (group[i] === oldG) {
                    group[i] = newG;
                }
            }
        };
        // group together brackets that have the same open or the same close sequence
        for (let i = 0; i < N; i++) {
            const a = brackets[i];
            for (let j = i + 1; j < N; j++) {
                const b = brackets[j];
                if (areOverlapping(a, b)) {
                    mergeGroups(group[i], group[j]);
                }
            }
        }
        const result = [];
        for (let g = 0; g < N; g++) {
            const currentOpen = [];
            const currentClose = [];
            for (let i = 0; i < N; i++) {
                if (group[i] === g) {
                    const [open, close] = brackets[i];
                    currentOpen.push(open);
                    currentClose.push(close);
                }
            }
            if (currentOpen.length > 0) {
                result.push({
                    open: currentOpen,
                    close: currentClose
                });
            }
        }
        return result;
    }
    class RichEditBrackets {
        constructor(languageId, _brackets) {
            this._richEditBracketsBrand = undefined;
            const brackets = groupFuzzyBrackets(_brackets);
            this.brackets = brackets.map((b, index) => {
                return new RichEditBracket(languageId, index, b.open, b.close, getRegexForBracketPair(b.open, b.close, brackets, index), getReversedRegexForBracketPair(b.open, b.close, brackets, index));
            });
            this.forwardRegex = getRegexForBrackets(this.brackets);
            this.reversedRegex = getReversedRegexForBrackets(this.brackets);
            this.textIsBracket = {};
            this.textIsOpenBracket = {};
            this.maxBracketLength = 0;
            for (const bracket of this.brackets) {
                for (const open of bracket.open) {
                    this.textIsBracket[open] = bracket;
                    this.textIsOpenBracket[open] = true;
                    this.maxBracketLength = Math.max(this.maxBracketLength, open.length);
                }
                for (const close of bracket.close) {
                    this.textIsBracket[close] = bracket;
                    this.textIsOpenBracket[close] = false;
                    this.maxBracketLength = Math.max(this.maxBracketLength, close.length);
                }
            }
        }
    }
    exports.RichEditBrackets = RichEditBrackets;
    function collectSuperstrings(str, brackets, currentIndex, dest) {
        for (let i = 0, len = brackets.length; i < len; i++) {
            if (i === currentIndex) {
                continue;
            }
            const bracket = brackets[i];
            for (const open of bracket.open) {
                if (open.indexOf(str) >= 0) {
                    dest.push(open);
                }
            }
            for (const close of bracket.close) {
                if (close.indexOf(str) >= 0) {
                    dest.push(close);
                }
            }
        }
    }
    function lengthcmp(a, b) {
        return a.length - b.length;
    }
    function unique(arr) {
        if (arr.length <= 1) {
            return arr;
        }
        const result = [];
        const seen = new Set();
        for (const element of arr) {
            if (seen.has(element)) {
                continue;
            }
            result.push(element);
            seen.add(element);
        }
        return result;
    }
    /**
     * Create a regular expression that can be used to search forward in a piece of text
     * for a group of bracket pairs. But this regex must be built in a way in which
     * it is aware of the other bracket pairs defined for the language.
     *
     * For example, if a language contains the following bracket pairs:
     *   ['begin', 'end']
     *   ['if', 'end if']
     * The two bracket pairs do not collide because no open or close brackets are equal.
     * So the function getRegexForBracketPair is called twice, once with
     * the ['begin'], ['end'] group consisting of one bracket pair, and once with
     * the ['if'], ['end if'] group consiting of the other bracket pair.
     *
     * But there could be a situation where an occurrence of 'end if' is mistaken
     * for an occurrence of 'end'.
     *
     * Therefore, for the bracket pair ['begin', 'end'], the regex will also
     * target 'end if'. The regex will be something like:
     *   /(\bend if\b)|(\bend\b)|(\bif\b)/
     *
     * The regex also searches for "superstrings" (other brackets that might be mistaken with the current bracket).
     *
     */
    function getRegexForBracketPair(open, close, brackets, currentIndex) {
        // search in all brackets for other brackets that are a superstring of these brackets
        let pieces = [];
        pieces = pieces.concat(open);
        pieces = pieces.concat(close);
        for (let i = 0, len = pieces.length; i < len; i++) {
            collectSuperstrings(pieces[i], brackets, currentIndex, pieces);
        }
        pieces = unique(pieces);
        pieces.sort(lengthcmp);
        pieces.reverse();
        return createBracketOrRegExp(pieces);
    }
    /**
     * Matching a regular expression in JS can only be done "forwards". So JS offers natively only
     * methods to find the first match of a regex in a string. But sometimes, it is useful to
     * find the last match of a regex in a string. For such a situation, a nice solution is to
     * simply reverse the string and then search for a reversed regex.
     *
     * This function also has the fine details of `getRegexForBracketPair`. For the same example
     * given above, the regex produced here would look like:
     *   /(\bfi dne\b)|(\bdne\b)|(\bfi\b)/
     */
    function getReversedRegexForBracketPair(open, close, brackets, currentIndex) {
        // search in all brackets for other brackets that are a superstring of these brackets
        let pieces = [];
        pieces = pieces.concat(open);
        pieces = pieces.concat(close);
        for (let i = 0, len = pieces.length; i < len; i++) {
            collectSuperstrings(pieces[i], brackets, currentIndex, pieces);
        }
        pieces = unique(pieces);
        pieces.sort(lengthcmp);
        pieces.reverse();
        return createBracketOrRegExp(pieces.map(toReversedString));
    }
    /**
     * Creates a regular expression that targets all bracket pairs.
     *
     * e.g. for the bracket pairs:
     *  ['{','}']
     *  ['begin,'end']
     *  ['for','end']
     * the regex would look like:
     *  /(\{)|(\})|(\bbegin\b)|(\bend\b)|(\bfor\b)/
     */
    function getRegexForBrackets(brackets) {
        let pieces = [];
        for (const bracket of brackets) {
            for (const open of bracket.open) {
                pieces.push(open);
            }
            for (const close of bracket.close) {
                pieces.push(close);
            }
        }
        pieces = unique(pieces);
        return createBracketOrRegExp(pieces);
    }
    /**
     * Matching a regular expression in JS can only be done "forwards". So JS offers natively only
     * methods to find the first match of a regex in a string. But sometimes, it is useful to
     * find the last match of a regex in a string. For such a situation, a nice solution is to
     * simply reverse the string and then search for a reversed regex.
     *
     * e.g. for the bracket pairs:
     *  ['{','}']
     *  ['begin,'end']
     *  ['for','end']
     * the regex would look like:
     *  /(\{)|(\})|(\bnigeb\b)|(\bdne\b)|(\brof\b)/
     */
    function getReversedRegexForBrackets(brackets) {
        let pieces = [];
        for (const bracket of brackets) {
            for (const open of bracket.open) {
                pieces.push(open);
            }
            for (const close of bracket.close) {
                pieces.push(close);
            }
        }
        pieces = unique(pieces);
        return createBracketOrRegExp(pieces.map(toReversedString));
    }
    function prepareBracketForRegExp(str) {
        // This bracket pair uses letters like e.g. "begin" - "end"
        const insertWordBoundaries = (/^[\w ]+$/.test(str));
        str = strings.escapeRegExpCharacters(str);
        return (insertWordBoundaries ? `\\b${str}\\b` : str);
    }
    function createBracketOrRegExp(pieces) {
        const regexStr = `(${pieces.map(prepareBracketForRegExp).join(')|(')})`;
        return strings.createRegExp(regexStr, true);
    }
    const toReversedString = (function () {
        function reverse(str) {
            // create a Uint16Array and then use a TextDecoder to create a string
            const arr = new Uint16Array(str.length);
            let offset = 0;
            for (let i = str.length - 1; i >= 0; i--) {
                arr[offset++] = str.charCodeAt(i);
            }
            return stringBuilder.getPlatformTextDecoder().decode(arr);
        }
        let lastInput = null;
        let lastOutput = null;
        return function toReversedString(str) {
            if (lastInput !== str) {
                lastInput = str;
                lastOutput = reverse(lastInput);
            }
            return lastOutput;
        };
    })();
    class BracketsUtils {
        static _findPrevBracketInText(reversedBracketRegex, lineNumber, reversedText, offset) {
            const m = reversedText.match(reversedBracketRegex);
            if (!m) {
                return null;
            }
            const matchOffset = reversedText.length - (m.index || 0);
            const matchLength = m[0].length;
            const absoluteMatchOffset = offset + matchOffset;
            return new range_1.Range(lineNumber, absoluteMatchOffset - matchLength + 1, lineNumber, absoluteMatchOffset + 1);
        }
        static findPrevBracketInRange(reversedBracketRegex, lineNumber, lineText, startOffset, endOffset) {
            // Because JS does not support backwards regex search, we search forwards in a reversed string with a reversed regex ;)
            const reversedLineText = toReversedString(lineText);
            const reversedSubstr = reversedLineText.substring(lineText.length - endOffset, lineText.length - startOffset);
            return this._findPrevBracketInText(reversedBracketRegex, lineNumber, reversedSubstr, startOffset);
        }
        static findNextBracketInText(bracketRegex, lineNumber, text, offset) {
            const m = text.match(bracketRegex);
            if (!m) {
                return null;
            }
            const matchOffset = m.index || 0;
            const matchLength = m[0].length;
            if (matchLength === 0) {
                return null;
            }
            const absoluteMatchOffset = offset + matchOffset;
            return new range_1.Range(lineNumber, absoluteMatchOffset + 1, lineNumber, absoluteMatchOffset + 1 + matchLength);
        }
        static findNextBracketInRange(bracketRegex, lineNumber, lineText, startOffset, endOffset) {
            const substr = lineText.substring(startOffset, endOffset);
            return this.findNextBracketInText(bracketRegex, lineNumber, substr, startOffset);
        }
    }
    exports.BracketsUtils = BracketsUtils;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmljaEVkaXRCcmFja2V0cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbGFuZ3VhZ2VzL3N1cHBvcnRzL3JpY2hFZGl0QnJhY2tldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBQ0gsTUFBYSxlQUFlO1FBaUQzQixZQUFZLFVBQWtCLEVBQUUsS0FBYSxFQUFFLElBQWMsRUFBRSxLQUFlLEVBQUUsWUFBb0IsRUFBRSxhQUFxQjtZQWhEM0gsMEJBQXFCLEdBQVMsU0FBUyxDQUFDO1lBaUR2QyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUM3QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztZQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztZQUNuQyxJQUFJLENBQUMsUUFBUSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVEOztXQUVHO1FBQ0ksTUFBTSxDQUFDLElBQVk7WUFDekIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRUQ7O1dBRUc7UUFDSSxPQUFPLENBQUMsSUFBWTtZQUMxQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLENB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