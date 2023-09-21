/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/diff/diff", "vs/base/common/strings", "vs/editor/common/core/range", "vs/editor/contrib/inlineCompletions/browser/ghostText", "vs/editor/contrib/inlineCompletions/browser/utils"], function (require, exports, diff_1, strings_1, range_1, ghostText_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SingleTextEdit = void 0;
    class SingleTextEdit {
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
            const commonPrefixLen = (0, strings_1.commonPrefixLength)(valueToReplace, this.text);
            const start = (0, utils_1.addPositions)(this.range.getStartPosition(), (0, utils_1.lengthOfText)(valueToReplace.substring(0, commonPrefixLen)));
            const text = this.text.substring(commonPrefixLen);
            const range = range_1.Range.fromPositions(start, this.range.getEndPosition());
            return new SingleTextEdit(range, text);
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
            const sourceIndentationLength = (0, strings_1.getLeadingWhitespace)(sourceLine).length;
            const suggestionTouchesIndentation = edit.range.startColumn - 1 <= sourceIndentationLength;
            if (suggestionTouchesIndentation) {
                // source:      ··········[······abc]
                //                         ^^^^^^^^^ inlineCompletion.range
                //              ^^^^^^^^^^ ^^^^^^ sourceIndentationLength
                //                         ^^^^^^ replacedIndentation.length
                //                               ^^^ rangeThatDoesNotReplaceIndentation
                // inlineCompletion.text: '··foo'
                //                         ^^ suggestionAddedIndentationLength
                const suggestionAddedIndentationLength = (0, strings_1.getLeadingWhitespace)(edit.text).length;
                const replacedIndentation = sourceLine.substring(edit.range.startColumn - 1, sourceIndentationLength);
                const [startPosition, endPosition] = [edit.range.getStartPosition(), edit.range.getEndPosition()];
                const newStartPosition = startPosition.column + replacedIndentation.length <= endPosition.column
                    ? startPosition.delta(0, replacedIndentation.length)
                    : endPosition;
                const rangeThatDoesNotReplaceIndentation = range_1.Range.fromPositions(newStartPosition, endPosition);
                const suggestionWithoutIndentationChange = edit.text.startsWith(replacedIndentation)
                    // Adds more indentation without changing existing indentation: We can add ghost text for this
                    ? edit.text.substring(replacedIndentation.length)
                    // Changes or removes existing indentation. Only add ghost text for the non-indentation part.
                    : edit.text.substring(suggestionAddedIndentationLength);
                edit = new SingleTextEdit(rangeThatDoesNotReplaceIndentation, suggestionWithoutIndentationChange);
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
                    const lines = (0, strings_1.splitLines)(nonPreviewText);
                    parts.push(new ghostText_1.GhostTextPart(insertColumn, lines, false));
                }
                if (italicText.length > 0) {
                    const lines = (0, strings_1.splitLines)(italicText);
                    parts.push(new ghostText_1.GhostTextPart(insertColumn, lines, true));
                }
            }
            return new ghostText_1.GhostText(lineNumber, parts);
        }
    }
    exports.SingleTextEdit = SingleTextEdit;
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
        return new diff_1.LcsDiff({ getElements: () => elements1 }, { getElements: () => elements2 }).ComputeDiff(false).changes;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlVGV4dEVkaXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pbmxpbmVDb21wbGV0aW9ucy9icm93c2VyL3NpbmdsZVRleHRFZGl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxNQUFhLGNBQWM7UUFDMUIsWUFDaUIsS0FBWSxFQUNaLElBQVk7WUFEWixVQUFLLEdBQUwsS0FBSyxDQUFPO1lBQ1osU0FBSSxHQUFKLElBQUksQ0FBUTtRQUU3QixDQUFDO1FBRUQsa0JBQWtCLENBQUMsS0FBaUIsRUFBRSxlQUF1QjtZQUM1RCxNQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzlGLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLFVBQVUsaUNBQXlCLENBQUM7WUFDakYsTUFBTSxlQUFlLEdBQUcsSUFBQSw0QkFBa0IsRUFBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sS0FBSyxHQUFHLElBQUEsb0JBQVksRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsSUFBQSxvQkFBWSxFQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0SCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNsRCxNQUFNLEtBQUssR0FBRyxhQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssRUFB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