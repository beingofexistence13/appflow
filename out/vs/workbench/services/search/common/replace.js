/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/base/common/search"], function (require, exports, strings, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplacePattern = void 0;
    class ReplacePattern {
        constructor(replaceString, arg2, arg3) {
            this._hasParameters = false;
            this._replacePattern = replaceString;
            let searchPatternInfo;
            let parseParameters;
            if (typeof arg2 === 'boolean') {
                parseParameters = arg2;
                this._regExp = arg3;
            }
            else {
                searchPatternInfo = arg2;
                parseParameters = !!searchPatternInfo.isRegExp;
                this._regExp = strings.createRegExp(searchPatternInfo.pattern, !!searchPatternInfo.isRegExp, { matchCase: searchPatternInfo.isCaseSensitive, wholeWord: searchPatternInfo.isWordMatch, multiline: searchPatternInfo.isMultiline, global: false, unicode: true });
            }
            if (parseParameters) {
                this.parseReplaceString(replaceString);
            }
            if (this._regExp.global) {
                this._regExp = strings.createRegExp(this._regExp.source, true, { matchCase: !this._regExp.ignoreCase, wholeWord: false, multiline: this._regExp.multiline, global: false });
            }
            this._caseOpsRegExp = new RegExp(/([\s\S]*?)((?:\\[uUlL])+?|)(\$[0-9]+)([\s\S]*?)/g);
        }
        get hasParameters() {
            return this._hasParameters;
        }
        get pattern() {
            return this._replacePattern;
        }
        get regExp() {
            return this._regExp;
        }
        /**
        * Returns the replace string for the first match in the given text.
        * If text has no matches then returns null.
        */
        getReplaceString(text, preserveCase) {
            this._regExp.lastIndex = 0;
            const match = this._regExp.exec(text);
            if (match) {
                if (this.hasParameters) {
                    const replaceString = this.replaceWithCaseOperations(text, this._regExp, this.buildReplaceString(match, preserveCase));
                    if (match[0] === text) {
                        return replaceString;
                    }
                    return replaceString.substr(match.index, match[0].length - (text.length - replaceString.length));
                }
                return this.buildReplaceString(match, preserveCase);
            }
            return null;
        }
        /**
         * replaceWithCaseOperations applies case operations to relevant replacement strings and applies
         * the affected $N arguments. It then passes unaffected $N arguments through to string.replace().
         *
         * \u			=> upper-cases one character in a match.
         * \U			=> upper-cases ALL remaining characters in a match.
         * \l			=> lower-cases one character in a match.
         * \L			=> lower-cases ALL remaining characters in a match.
         */
        replaceWithCaseOperations(text, regex, replaceString) {
            // Short-circuit the common path.
            if (!/\\[uUlL]/.test(replaceString)) {
                return text.replace(regex, replaceString);
            }
            // Store the values of the search parameters.
            const firstMatch = regex.exec(text);
            if (firstMatch === null) {
                return text.replace(regex, replaceString);
            }
            let patMatch;
            let newReplaceString = '';
            let lastIndex = 0;
            let lastMatch = '';
            // For each annotated $N, perform text processing on the parameters and perform the substitution.
            while ((patMatch = this._caseOpsRegExp.exec(replaceString)) !== null) {
                lastIndex = patMatch.index;
                const fullMatch = patMatch[0];
                lastMatch = fullMatch;
                let caseOps = patMatch[2]; // \u, \l\u, etc.
                const money = patMatch[3]; // $1, $2, etc.
                if (!caseOps) {
                    newReplaceString += fullMatch;
                    continue;
                }
                const replacement = firstMatch[parseInt(money.slice(1))];
                if (!replacement) {
                    newReplaceString += fullMatch;
                    continue;
                }
                const replacementLen = replacement.length;
                newReplaceString += patMatch[1]; // prefix
                caseOps = caseOps.replace(/\\/g, '');
                let i = 0;
                for (; i < caseOps.length; i++) {
                    switch (caseOps[i]) {
                        case 'U':
                            newReplaceString += replacement.slice(i).toUpperCase();
                            i = replacementLen;
                            break;
                        case 'u':
                            newReplaceString += replacement[i].toUpperCase();
                            break;
                        case 'L':
                            newReplaceString += replacement.slice(i).toLowerCase();
                            i = replacementLen;
                            break;
                        case 'l':
                            newReplaceString += replacement[i].toLowerCase();
                            break;
                    }
                }
                // Append any remaining replacement string content not covered by case operations.
                if (i < replacementLen) {
                    newReplaceString += replacement.slice(i);
                }
                newReplaceString += patMatch[4]; // suffix
            }
            // Append any remaining trailing content after the final regex match.
            newReplaceString += replaceString.slice(lastIndex + lastMatch.length);
            return text.replace(regex, newReplaceString);
        }
        buildReplaceString(matches, preserveCase) {
            if (preserveCase) {
                return (0, search_1.buildReplaceStringWithCasePreserved)(matches, this._replacePattern);
            }
            else {
                return this._replacePattern;
            }
        }
        /**
         * \n => LF
         * \t => TAB
         * \\ => \
         * $0 => $& (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter)
         * everything else stays untouched
         */
        parseReplaceString(replaceString) {
            if (!replaceString || replaceString.length === 0) {
                return;
            }
            let substrFrom = 0, result = '';
            for (let i = 0, len = replaceString.length; i < len; i++) {
                const chCode = replaceString.charCodeAt(i);
                if (chCode === 92 /* CharCode.Backslash */) {
                    // move to next char
                    i++;
                    if (i >= len) {
                        // string ends with a \
                        break;
                    }
                    const nextChCode = replaceString.charCodeAt(i);
                    let replaceWithCharacter = null;
                    switch (nextChCode) {
                        case 92 /* CharCode.Backslash */:
                            // \\ => \
                            replaceWithCharacter = '\\';
                            break;
                        case 110 /* CharCode.n */:
                            // \n => LF
                            replaceWithCharacter = '\n';
                            break;
                        case 116 /* CharCode.t */:
                            // \t => TAB
                            replaceWithCharacter = '\t';
                            break;
                    }
                    if (replaceWithCharacter) {
                        result += replaceString.substring(substrFrom, i - 1) + replaceWithCharacter;
                        substrFrom = i + 1;
                    }
                }
                if (chCode === 36 /* CharCode.DollarSign */) {
                    // move to next char
                    i++;
                    if (i >= len) {
                        // string ends with a $
                        break;
                    }
                    const nextChCode = replaceString.charCodeAt(i);
                    let replaceWithCharacter = null;
                    switch (nextChCode) {
                        case 48 /* CharCode.Digit0 */:
                            // $0 => $&
                            replaceWithCharacter = '$&';
                            this._hasParameters = true;
                            break;
                        case 96 /* CharCode.BackTick */:
                        case 39 /* CharCode.SingleQuote */:
                            this._hasParameters = true;
                            break;
                        default: {
                            // check if it is a valid string parameter $n (0 <= n <= 99). $0 is already handled by now.
                            if (!this.between(nextChCode, 49 /* CharCode.Digit1 */, 57 /* CharCode.Digit9 */)) {
                                break;
                            }
                            if (i === replaceString.length - 1) {
                                this._hasParameters = true;
                                break;
                            }
                            let charCode = replaceString.charCodeAt(++i);
                            if (!this.between(charCode, 48 /* CharCode.Digit0 */, 57 /* CharCode.Digit9 */)) {
                                this._hasParameters = true;
                                --i;
                                break;
                            }
                            if (i === replaceString.length - 1) {
                                this._hasParameters = true;
                                break;
                            }
                            charCode = replaceString.charCodeAt(++i);
                            if (!this.between(charCode, 48 /* CharCode.Digit0 */, 57 /* CharCode.Digit9 */)) {
                                this._hasParameters = true;
                                --i;
                                break;
                            }
                            break;
                        }
                    }
                    if (replaceWithCharacter) {
                        result += replaceString.substring(substrFrom, i - 1) + replaceWithCharacter;
                        substrFrom = i + 1;
                    }
                }
            }
            if (substrFrom === 0) {
                // no replacement occurred
                return;
            }
            this._replacePattern = result + replaceString.substring(substrFrom);
        }
        between(value, from, to) {
            return from <= value && value <= to;
        }
    }
    exports.ReplacePattern = ReplacePattern;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9zZWFyY2gvY29tbW9uL3JlcGxhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQWEsY0FBYztRQVMxQixZQUFZLGFBQXFCLEVBQUUsSUFBUyxFQUFFLElBQVU7WUFOaEQsbUJBQWMsR0FBWSxLQUFLLENBQUM7WUFPdkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxhQUFhLENBQUM7WUFDckMsSUFBSSxpQkFBK0IsQ0FBQztZQUNwQyxJQUFJLGVBQXdCLENBQUM7WUFDN0IsSUFBSSxPQUFPLElBQUksS0FBSyxTQUFTLEVBQUU7Z0JBQzlCLGVBQWUsR0FBRyxJQUFJLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO2FBRXBCO2lCQUFNO2dCQUNOLGlCQUFpQixHQUFHLElBQUksQ0FBQztnQkFDekIsZUFBZSxHQUFHLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDalE7WUFFRCxJQUFJLGVBQWUsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ3ZDO1lBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtn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