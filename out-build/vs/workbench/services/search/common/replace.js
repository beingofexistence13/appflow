/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/base/common/search"], function (require, exports, strings, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MMb = void 0;
    class $MMb {
        constructor(replaceString, arg2, arg3) {
            this.b = false;
            this.a = replaceString;
            let searchPatternInfo;
            let parseParameters;
            if (typeof arg2 === 'boolean') {
                parseParameters = arg2;
                this.c = arg3;
            }
            else {
                searchPatternInfo = arg2;
                parseParameters = !!searchPatternInfo.isRegExp;
                this.c = strings.$ye(searchPatternInfo.pattern, !!searchPatternInfo.isRegExp, { matchCase: searchPatternInfo.isCaseSensitive, wholeWord: searchPatternInfo.isWordMatch, multiline: searchPatternInfo.isMultiline, global: false, unicode: true });
            }
            if (parseParameters) {
                this.f(replaceString);
            }
            if (this.c.global) {
                this.c = strings.$ye(this.c.source, true, { matchCase: !this.c.ignoreCase, wholeWord: false, multiline: this.c.multiline, global: false });
            }
            this.d = new RegExp(/([\s\S]*?)((?:\\[uUlL])+?|)(\$[0-9]+)([\s\S]*?)/g);
        }
        get hasParameters() {
            return this.b;
        }
        get pattern() {
            return this.a;
        }
        get regExp() {
            return this.c;
        }
        /**
        * Returns the replace string for the first match in the given text.
        * If text has no matches then returns null.
        */
        getReplaceString(text, preserveCase) {
            this.c.lastIndex = 0;
            const match = this.c.exec(text);
            if (match) {
                if (this.hasParameters) {
                    const replaceString = this.e(text, this.c, this.buildReplaceString(match, preserveCase));
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
        e(text, regex, replaceString) {
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
            while ((patMatch = this.d.exec(replaceString)) !== null) {
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
                return (0, search_1.$MS)(matches, this.a);
            }
            else {
                return this.a;
            }
        }
        /**
         * \n => LF
         * \t => TAB
         * \\ => \
         * $0 => $& (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter)
         * everything else stays untouched
         */
        f(replaceString) {
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
                            this.b = true;
                            break;
                        case 96 /* CharCode.BackTick */:
                        case 39 /* CharCode.SingleQuote */:
                            this.b = true;
                            break;
                        default: {
                            // check if it is a valid string parameter $n (0 <= n <= 99). $0 is already handled by now.
                            if (!this.g(nextChCode, 49 /* CharCode.Digit1 */, 57 /* CharCode.Digit9 */)) {
                                break;
                            }
                            if (i === replaceString.length - 1) {
                                this.b = true;
                                break;
                            }
                            let charCode = replaceString.charCodeAt(++i);
                            if (!this.g(charCode, 48 /* CharCode.Digit0 */, 57 /* CharCode.Digit9 */)) {
                                this.b = true;
                                --i;
                                break;
                            }
                            if (i === replaceString.length - 1) {
                                this.b = true;
                                break;
                            }
                            charCode = replaceString.charCodeAt(++i);
                            if (!this.g(charCode, 48 /* CharCode.Digit0 */, 57 /* CharCode.Digit9 */)) {
                                this.b = true;
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
            this.a = result + replaceString.substring(substrFrom);
        }
        g(value, from, to) {
            return from <= value && value <= to;
        }
    }
    exports.$MMb = $MMb;
});
//# sourceMappingURL=replace.js.map