/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/linkedList"], function (require, exports, iterator_1, lifecycle_1, linkedList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWordAtText = exports.setDefaultGetWordAtTextConfig = exports.ensureValidWordDefinition = exports.DEFAULT_WORD_REGEXP = exports.USUAL_WORD_SEPARATORS = void 0;
    exports.USUAL_WORD_SEPARATORS = '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?';
    /**
     * Create a word definition regular expression based on default word separators.
     * Optionally provide allowed separators that should be included in words.
     *
     * The default would look like this:
     * /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g
     */
    function createWordRegExp(allowInWords = '') {
        let source = '(-?\\d*\\.\\d\\w*)|([^';
        for (const sep of exports.USUAL_WORD_SEPARATORS) {
            if (allowInWords.indexOf(sep) >= 0) {
                continue;
            }
            source += '\\' + sep;
        }
        source += '\\s]+)';
        return new RegExp(source, 'g');
    }
    // catches numbers (including floating numbers) in the first group, and alphanum in the second
    exports.DEFAULT_WORD_REGEXP = createWordRegExp();
    function ensureValidWordDefinition(wordDefinition) {
        let result = exports.DEFAULT_WORD_REGEXP;
        if (wordDefinition && (wordDefinition instanceof RegExp)) {
            if (!wordDefinition.global) {
                let flags = 'g';
                if (wordDefinition.ignoreCase) {
                    flags += 'i';
                }
                if (wordDefinition.multiline) {
                    flags += 'm';
                }
                if (wordDefinition.unicode) {
                    flags += 'u';
                }
                result = new RegExp(wordDefinition.source, flags);
            }
            else {
                result = wordDefinition;
            }
        }
        result.lastIndex = 0;
        return result;
    }
    exports.ensureValidWordDefinition = ensureValidWordDefinition;
    const _defaultConfig = new linkedList_1.LinkedList();
    _defaultConfig.unshift({
        maxLen: 1000,
        windowSize: 15,
        timeBudget: 150
    });
    function setDefaultGetWordAtTextConfig(value) {
        const rm = _defaultConfig.unshift(value);
        return (0, lifecycle_1.toDisposable)(rm);
    }
    exports.setDefaultGetWordAtTextConfig = setDefaultGetWordAtTextConfig;
    function getWordAtText(column, wordDefinition, text, textOffset, config) {
        if (!config) {
            config = iterator_1.Iterable.first(_defaultConfig);
        }
        if (text.length > config.maxLen) {
            // don't throw strings that long at the regexp
            // but use a sub-string in which a word must occur
            let start = column - config.maxLen / 2;
            if (start < 0) {
                start = 0;
            }
            else {
                textOffset += start;
            }
            text = text.substring(start, column + config.maxLen / 2);
            return getWordAtText(column, wordDefinition, text, textOffset, config);
        }
        const t1 = Date.now();
        const pos = column - 1 - textOffset;
        let prevRegexIndex = -1;
        let match = null;
        for (let i = 1;; i++) {
            // check time budget
            if (Date.now() - t1 >= config.timeBudget) {
                break;
            }
            // reset the index at which the regexp should start matching, also know where it
            // should stop so that subsequent search don't repeat previous searches
            const regexIndex = pos - config.windowSize * i;
            wordDefinition.lastIndex = Math.max(0, regexIndex);
            const thisMatch = _findRegexMatchEnclosingPosition(wordDefinition, text, pos, prevRegexIndex);
            if (!thisMatch && match) {
                // stop: we have something
                break;
            }
            match = thisMatch;
            // stop: searched at start
            if (regexIndex <= 0) {
                break;
            }
            prevRegexIndex = regexIndex;
        }
        if (match) {
            const result = {
                word: match[0],
                startColumn: textOffset + 1 + match.index,
                endColumn: textOffset + 1 + match.index + match[0].length
            };
            wordDefinition.lastIndex = 0;
            return result;
        }
        return null;
    }
    exports.getWordAtText = getWordAtText;
    function _findRegexMatchEnclosingPosition(wordDefinition, text, pos, stopPos) {
        let match;
        while (match = wordDefinition.exec(text)) {
            const matchIndex = match.index || 0;
            if (matchIndex <= pos && wordDefinition.lastIndex >= pos) {
                return match;
            }
            else if (stopPos > 0 && matchIndex > stopPos) {
                return null;
            }
        }
        return null;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY29yZS93b3JkSGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1uRixRQUFBLHFCQUFxQixHQUFHLG1DQUFtQyxDQUFDO0lBb0J6RTs7Ozs7O09BTUc7SUFDSCxTQUFTLGdCQUFnQixDQUFDLGVBQXVCLEVBQUU7UUFDbEQsSUFBSSxNQUFNLEdBQUcsd0JBQXdCLENBQUM7UUFDdEMsS0FBSyxNQUFNLEdBQUcsSUFBSSw2QkFBcUIsRUFBRTtZQUN4QyxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNuQyxTQUFTO2FBQ1Q7WUFDRCxNQUFNLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQztTQUNyQjtRQUNELE1BQU0sSUFBSSxRQUFRLENBQUM7UUFDbkIsT0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELDhGQUE4RjtJQUNqRixRQUFBLG1CQUFtQixHQUFHLGdCQUFnQixFQUFFLENBQUM7SUFFdEQsU0FBZ0IseUJBQXlCLENBQUMsY0FBOEI7UUFDdkUsSUFBSSxNQUFNLEdBQVcsMkJBQW1CLENBQUM7UUFFekMsSUFBSSxjQUFjLElBQUksQ0FBQyxjQUFjLFlBQVksTUFBTSxDQUFDLEVBQUU7WUFDekQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUU7Z0JBQzNCLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQztnQkFDaEIsSUFBSSxjQUFjLENBQUMsVUFBVSxFQUFFO29CQUM5QixLQUFLLElBQUksR0FBRyxDQUFDO2lCQUNiO2dCQUNELElBQUksY0FBYyxDQUFDLFNBQVMsRUFBRTtvQkFDN0IsS0FBSyxJQUFJLEdBQUcsQ0FBQztpQkFDYjtnQkFDRCxJ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