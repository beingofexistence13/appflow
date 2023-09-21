/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/diff/diff", "vs/base/common/strings", "vs/editor/common/core/range", "vs/editor/contrib/inlineCompletions/browser/ghostText", "vs/editor/contrib/inlineCompletions/browser/utils"], function (require, exports, diff_1, strings_1, range_1, ghostText_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$v5 = void 0;
    class $v5 {
        constructor(range, text) {
            this.range = range;
            this.text = text;
        }
        removeCommonPrefix(model, validModelRange) {
            const modelRange = validModelRange ? this.range.intersectRanges(validModelRange) : this.range;
            if (!modelRange) {
                return this;
            }
            const valueToReplace = model.getValueInRange(modelRange, 1 /* EndOfLinePreference.LF */);
            const commonPrefixLen = (0, strings_1.$Oe)(valueToReplace, this.text);
            const start = (0, utils_1.$o5)(this.range.getStartPosition(), (0, utils_1.$p5)(valueToReplace.substring(0, commonPrefixLen)));
            const text = this.text.substring(commonPrefixLen);
            const range = range_1.$ks.fromPositions(start, this.range.getEndPosition());
            return new $v5(range, text);
        }
        augments(base) {
            // The augmented completion must replace the base range, but can replace even more
            return this.text.startsWith(base.text) && rangeExtends(this.range, base.range);
        }
        /**
         * @param previewSuffixLength Sets where to split `inlineCompletion.text`.
         * 	If the text is `hello` and the suffix length is 2, the non-preview part is `hel` and the preview-part is `lo`.
        */
        computeGhostText(model, mode, cursorPosition, previewSuffixLength = 0) {
            let edit = this.removeCommonPrefix(model);
            if (edit.range.endLineNumber !== edit.range.startLineNumber) {
                // This edit might span multiple lines, but the first lines must be a common prefix.
                return undefined;
            }
            const sourceLine = model.getLineContent(edit.range.startLineNumber);
            const sourceIndentationLength = (0, strings_1.$Ce)(sourceLine).length;
            const suggestionTouchesIndentation = edit.range.startColumn - 1 <= sourceIndentationLength;
            if (suggestionTouchesIndentation) {
                // source:      ··········[······abc]
                //                         ^^^^^^^^^ inlineCompletion.range
                //              ^^^^^^^^^^ ^^^^^^ sourceIndentationLength
                //                         ^^^^^^ replacedIndentation.length
                //                               ^^^ rangeThatDoesNotReplaceIndentation
                // inlineCompletion.text: '··foo'
                //                         ^^ suggestionAddedIndentationLength
                const suggestionAddedIndentationLength = (0, strings_1.$Ce)(edit.text).length;
                const replacedIndentation = sourceLine.substring(edit.range.startColumn - 1, sourceIndentationLength);
                const [startPosition, endPosition] = [edit.range.getStartPosition(), edit.range.getEndPosition()];
                const newStartPosition = startPosition.column + replacedIndentation.length <= endPosition.column
                    ? startPosition.delta(0, replacedIndentation.length)
                    : endPosition;
                const rangeThatDoesNotReplaceIndentation = range_1.$ks.fromPositions(newStartPosition, endPosition);
                const suggestionWithoutIndentationChange = edit.text.startsWith(replacedIndentation)
                    // Adds more indentation without changing existing indentation: We can add ghost text for this
                    ? edit.text.substring(replacedIndentation.length)
                    // Changes or removes existing indentation. Only add ghost text for the non-indentation part.
                    : edit.text.substring(suggestionAddedIndentationLength);
                edit = new $v5(rangeThatDoesNotReplaceIndentation, suggestionWithoutIndentationChange);
            }
            // This is a single line string
            const valueToBeReplaced = model.getValueInRange(edit.range);
            const changes = cachingDiff(valueToBeReplaced, edit.text);
            if (!changes) {
                // No ghost text in case the diff would be too slow to compute
                return undefined;
            }
            const lineNumber = edit.range.startLineNumber;
            const parts = new Array();
            if (mode === 'prefix') {
                const filteredChanges = changes.filter(c => c.originalLength === 0);
                if (filteredChanges.length > 1 || filteredChanges.length === 1 && filteredChanges[0].originalStart !== valueToBeReplaced.length) {
                    // Prefixes only have a single change.
                    return undefined;
                }
            }
            const previewStartInCompletionText = edit.text.length - previewSuffixLength;
            for (const c of changes) {
                const insertColumn = edit.range.startColumn + c.originalStart + c.originalLength;
                if (mode === 'subwordSmart' && cursorPosition && cursorPosition.lineNumber === edit.range.startLineNumber && insertColumn < cursorPosition.column) {
                    // No ghost text before cursor
                    return undefined;
                }
                if (c.originalLength > 0) {
                    return undefined;
                }
                if (c.modifiedLength === 0) {
                    continue;
                }
                const modifiedEnd = c.modifiedStart + c.modifiedLength;
                const nonPreviewTextEnd = Math.max(c.modifiedStart, Math.min(modifiedEnd, previewStartInCompletionText));
                const nonPreviewText = edit.text.substring(c.modifiedStart, nonPreviewTextEnd);
                const italicText = edit.text.substring(nonPreviewTextEnd, Math.max(c.modifiedStart, modifiedEnd));
                if (nonPreviewText.length > 0) {
                    const lines = (0, strings_1.$Ae)(nonPreviewText);
                    parts.push(new ghostText_1.$r5(insertColumn, lines, false));
                }
                if (italicText.length > 0) {
                    const lines = (0, strings_1.$Ae)(italicText);
                    parts.push(new ghostText_1.$r5(insertColumn, lines, true));
                }
            }
            return new ghostText_1.$q5(lineNumber, parts);
        }
    }
    exports.$v5 = $v5;
    function rangeExtends(extendingRange, rangeToExtend) {
        return rangeToExtend.getStartPosition().equals(extendingRange.getStartPosition())
            && rangeToExtend.getEndPosition().isBeforeOrEqual(extendingRange.getEndPosition());
    }
    let lastRequest = undefined;
    function cachingDiff(originalValue, newValue) {
        if (lastRequest?.originalValue === originalValue && lastRequest?.newValue === newValue) {
            return lastRequest?.changes;
        }
        else {
            let changes = smartDiff(originalValue, newValue, true);
            if (changes) {
                const deletedChars = deletedCharacters(changes);
                if (deletedChars > 0) {
                    // For performance reasons, don't compute diff if there is nothing to improve
                    const newChanges = smartDiff(originalValue, newValue, false);
                    if (newChanges && deletedCharacters(newChanges) < deletedChars) {
                        // Disabling smartness seems to be better here
                        changes = newChanges;
                    }
                }
            }
            lastRequest = {
                originalValue,
                newValue,
                changes
            };
            return changes;
        }
    }
    function deletedCharacters(changes) {
        let sum = 0;
        for (const c of changes) {
            sum += c.originalLength;
        }
        return sum;
    }
    /**
     * When matching `if ()` with `if (f() = 1) { g(); }`,
     * align it like this:        `if (       )`
     * Not like this:			  `if (  )`
     * Also not like this:		  `if (             )`.
     *
     * The parenthesis are preprocessed to ensure that they match correctly.
     */
    function smartDiff(originalValue, newValue, smartBracketMatching) {
        if (originalValue.length > 5000 || newValue.length > 5000) {
            // We don't want to work on strings that are too big
            return undefined;
        }
        function getMaxCharCode(val) {
            let maxCharCode = 0;
            for (let i = 0, len = val.length; i < len; i++) {
                const charCode = val.charCodeAt(i);
                if (charCode > maxCharCode) {
                    maxCharCode = charCode;
                }
            }
            return maxCharCode;
        }
        const maxCharCode = Math.max(getMaxCharCode(originalValue), getMaxCharCode(newValue));
        function getUniqueCharCode(id) {
            if (id < 0) {
                throw new Error('unexpected');
            }
            return maxCharCode + id + 1;
        }
        function getElements(source) {
            let level = 0;
            let group = 0;
            const characters = new Int32Array(source.length);
            for (let i = 0, len = source.length; i < len; i++) {
                // TODO support more brackets
                if (smartBracketMatching && source[i] === '(') {
                    const id = group * 100 + level;
                    characters[i] = getUniqueCharCode(2 * id);
                    level++;
                }
                else if (smartBracketMatching && source[i] === ')') {
                    level = Math.max(level - 1, 0);
                    const id = group * 100 + level;
                    characters[i] = getUniqueCharCode(2 * id + 1);
                    if (level === 0) {
                        group++;
                    }
                }
                else {
                    characters[i] = source.charCodeAt(i);
                }
            }
            return characters;
        }
        const elements1 = getElements(originalValue);
        const elements2 = getElements(newValue);
        return new diff_1.$qs({ getElements: () => elements1 }, { getElements: () => elements2 }).ComputeDiff(false).changes;
    }
});
//# sourceMappingURL=singleTextEdit.js.map