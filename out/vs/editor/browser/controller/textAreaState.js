/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/range"], function (require, exports, strings, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PagedScreenReaderStrategy = exports.TextAreaState = exports._debugComposition = void 0;
    exports._debugComposition = false;
    class TextAreaState {
        static { this.EMPTY = new TextAreaState('', 0, 0, null, undefined); }
        constructor(value, 
        /** the offset where selection starts inside `value` */
        selectionStart, 
        /** the offset where selection ends inside `value` */
        selectionEnd, 
        /** the editor range in the view coordinate system that matches the selection inside `value` */
        selection, 
        /** the visible line count (wrapped, not necessarily matching \n characters) for the text in `value` before `selectionStart` */
        newlineCountBeforeSelection) {
            this.value = value;
            this.selectionStart = selectionStart;
            this.selectionEnd = selectionEnd;
            this.selection = selection;
            this.newlineCountBeforeSelection = newlineCountBeforeSelection;
        }
        toString() {
            return `[ <${this.value}>, selectionStart: ${this.selectionStart}, selectionEnd: ${this.selectionEnd}]`;
        }
        static readFromTextArea(textArea, previousState) {
            const value = textArea.getValue();
            const selectionStart = textArea.getSelectionStart();
            const selectionEnd = textArea.getSelectionEnd();
            let newlineCountBeforeSelection = undefined;
            if (previousState) {
                const valueBeforeSelectionStart = value.substring(0, selectionStart);
                const previousValueBeforeSelectionStart = previousState.value.substring(0, previousState.selectionStart);
                if (valueBeforeSelectionStart === previousValueBeforeSelectionStart) {
                    newlineCountBeforeSelection = previousState.newlineCountBeforeSelection;
                }
            }
            return new TextAreaState(value, selectionStart, selectionEnd, null, newlineCountBeforeSelection);
        }
        collapseSelection() {
            if (this.selectionStart === this.value.length) {
                return this;
            }
            return new TextAreaState(this.value, this.value.length, this.value.length, null, undefined);
        }
        writeToTextArea(reason, textArea, select) {
            if (exports._debugComposition) {
                console.log(`writeToTextArea ${reason}: ${this.toString()}`);
            }
            textArea.setValue(reason, this.value);
            if (select) {
                textArea.setSelectionRange(reason, this.selectionStart, this.selectionEnd);
            }
        }
        deduceEditorPosition(offset) {
            if (offset <= this.selectionStart) {
                const str = this.value.substring(offset, this.selectionStart);
                return this._finishDeduceEditorPosition(this.selection?.getStartPosition() ?? null, str, -1);
            }
            if (offset >= this.selectionEnd) {
                const str = this.value.substring(this.selectionEnd, offset);
                return this._finishDeduceEditorPosition(this.selection?.getEndPosition() ?? null, str, 1);
            }
            const str1 = this.value.substring(this.selectionStart, offset);
            if (str1.indexOf(String.fromCharCode(8230)) === -1) {
                return this._finishDeduceEditorPosition(this.selection?.getStartPosition() ?? null, str1, 1);
            }
            const str2 = this.value.substring(offset, this.selectionEnd);
            return this._finishDeduceEditorPosition(this.selection?.getEndPosition() ?? null, str2, -1);
        }
        _finishDeduceEditorPosition(anchor, deltaText, signum) {
            let lineFeedCnt = 0;
            let lastLineFeedIndex = -1;
            while ((lastLineFeedIndex = deltaText.indexOf('\n', lastLineFeedIndex + 1)) !== -1) {
                lineFeedCnt++;
            }
            return [anchor, signum * deltaText.length, lineFeedCnt];
        }
        static deduceInput(previousState, currentState, couldBeEmojiInput) {
            if (!previousState) {
                // This is the EMPTY state
                return {
                    text: '',
                    replacePrevCharCnt: 0,
                    replaceNextCharCnt: 0,
                    positionDelta: 0
                };
            }
            if (exports._debugComposition) {
                console.log('------------------------deduceInput');
                console.log(`PREVIOUS STATE: ${previousState.toString()}`);
                console.log(`CURRENT STATE: ${currentState.toString()}`);
            }
            const prefixLength = Math.min(strings.commonPrefixLength(previousState.value, currentState.value), previousState.selectionStart, currentState.selectionStart);
            const suffixLength = Math.min(strings.commonSuffixLength(previousState.value, currentState.value), previousState.value.length - previousState.selectionEnd, currentState.value.length - currentState.selectionEnd);
            const previousValue = previousState.value.substring(prefixLength, previousState.value.length - suffixLength);
            const currentValue = currentState.value.substring(prefixLength, currentState.value.length - suffixLength);
            const previousSelectionStart = previousState.selectionStart - prefixLength;
            const previousSelectionEnd = previousState.selectionEnd - prefixLength;
            const currentSelectionStart = currentState.selectionStart - prefixLength;
            const currentSelectionEnd = currentState.selectionEnd - prefixLength;
            if (exports._debugComposition) {
                console.log(`AFTER DIFFING PREVIOUS STATE: <${previousValue}>, selectionStart: ${previousSelectionStart}, selectionEnd: ${previousSelectionEnd}`);
                console.log(`AFTER DIFFING CURRENT STATE: <${currentValue}>, selectionStart: ${currentSelectionStart}, selectionEnd: ${currentSelectionEnd}`);
            }
            if (currentSelectionStart === currentSelectionEnd) {
                // no current selection
                const replacePreviousCharacters = (previousState.selectionStart - prefixLength);
                if (exports._debugComposition) {
                    console.log(`REMOVE PREVIOUS: ${replacePreviousCharacters} chars`);
                }
                return {
                    text: currentValue,
                    replacePrevCharCnt: replacePreviousCharacters,
                    replaceNextCharCnt: 0,
                    positionDelta: 0
                };
            }
            // there is a current selection => composition case
            const replacePreviousCharacters = previousSelectionEnd - previousSelectionStart;
            return {
                text: currentValue,
                replacePrevCharCnt: replacePreviousCharacters,
                replaceNextCharCnt: 0,
                positionDelta: 0
            };
        }
        static deduceAndroidCompositionInput(previousState, currentState) {
            if (!previousState) {
                // This is the EMPTY state
                return {
                    text: '',
                    replacePrevCharCnt: 0,
                    replaceNextCharCnt: 0,
                    positionDelta: 0
                };
            }
            if (exports._debugComposition) {
                console.log('------------------------deduceAndroidCompositionInput');
                console.log(`PREVIOUS STATE: ${previousState.toString()}`);
                console.log(`CURRENT STATE: ${currentState.toString()}`);
            }
            if (previousState.value === currentState.value) {
                return {
                    text: '',
                    replacePrevCharCnt: 0,
                    replaceNextCharCnt: 0,
                    positionDelta: currentState.selectionEnd - previousState.selectionEnd
                };
            }
            const prefixLength = Math.min(strings.commonPrefixLength(previousState.value, currentState.value), previousState.selectionEnd);
            const suffixLength = Math.min(strings.commonSuffixLength(previousState.value, currentState.value), previousState.value.length - previousState.selectionEnd);
            const previousValue = previousState.value.substring(prefixLength, previousState.value.length - suffixLength);
            const currentValue = currentState.value.substring(prefixLength, currentState.value.length - suffixLength);
            const previousSelectionStart = previousState.selectionStart - prefixLength;
            const previousSelectionEnd = previousState.selectionEnd - prefixLength;
            const currentSelectionStart = currentState.selectionStart - prefixLength;
            const currentSelectionEnd = currentState.selectionEnd - prefixLength;
            if (exports._debugComposition) {
                console.log(`AFTER DIFFING PREVIOUS STATE: <${previousValue}>, selectionStart: ${previousSelectionStart}, selectionEnd: ${previousSelectionEnd}`);
                console.log(`AFTER DIFFING CURRENT STATE: <${currentValue}>, selectionStart: ${currentSelectionStart}, selectionEnd: ${currentSelectionEnd}`);
            }
            return {
                text: currentValue,
                replacePrevCharCnt: previousSelectionEnd,
                replaceNextCharCnt: previousValue.length - previousSelectionEnd,
                positionDelta: currentSelectionEnd - currentValue.length
            };
        }
    }
    exports.TextAreaState = TextAreaState;
    class PagedScreenReaderStrategy {
        static _getPageOfLine(lineNumber, linesPerPage) {
            return Math.floor((lineNumber - 1) / linesPerPage);
        }
        static _getRangeForPage(page, linesPerPage) {
            const offset = page * linesPerPage;
            const startLineNumber = offset + 1;
            const endLineNumber = offset + linesPerPage;
            return new range_1.Range(startLineNumber, 1, endLineNumber + 1, 1);
        }
        static fromEditorSelection(model, selection, linesPerPage, trimLongText) {
            // Chromium handles very poorly text even of a few thousand chars
            // Cut text to avoid stalling the entire UI
            const LIMIT_CHARS = 500;
            const selectionStartPage = PagedScreenReaderStrategy._getPageOfLine(selection.startLineNumber, linesPerPage);
            const selectionStartPageRange = PagedScreenReaderStrategy._getRangeForPage(selectionStartPage, linesPerPage);
            const selectionEndPage = PagedScreenReaderStrategy._getPageOfLine(selection.endLineNumber, linesPerPage);
            const selectionEndPageRange = PagedScreenReaderStrategy._getRangeForPage(selectionEndPage, linesPerPage);
            let pretextRange = selectionStartPageRange.intersectRanges(new range_1.Range(1, 1, selection.startLineNumber, selection.startColumn));
            if (trimLongText && model.getValueLengthInRange(pretextRange, 1 /* EndOfLinePreference.LF */) > LIMIT_CHARS) {
                const pretextStart = model.modifyPosition(pretextRange.getEndPosition(), -LIMIT_CHARS);
                pretextRange = range_1.Range.fromPositions(pretextStart, pretextRange.getEndPosition());
            }
            const pretext = model.getValueInRange(pretextRange, 1 /* EndOfLinePreference.LF */);
            const lastLine = model.getLineCount();
            const lastLineMaxColumn = model.getLineMaxColumn(lastLine);
            let posttextRange = selectionEndPageRange.intersectRanges(new range_1.Range(selection.endLineNumber, selection.endColumn, lastLine, lastLineMaxColumn));
            if (trimLongText && model.getValueLengthInRange(posttextRange, 1 /* EndOfLinePreference.LF */) > LIMIT_CHARS) {
                const posttextEnd = model.modifyPosition(posttextRange.getStartPosition(), LIMIT_CHARS);
                posttextRange = range_1.Range.fromPositions(posttextRange.getStartPosition(), posttextEnd);
            }
            const posttext = model.getValueInRange(posttextRange, 1 /* EndOfLinePreference.LF */);
            let text;
            if (selectionStartPage === selectionEndPage || selectionStartPage + 1 === selectionEndPage) {
                // take full selection
                text = model.getValueInRange(selection, 1 /* EndOfLinePreference.LF */);
            }
            else {
                const selectionRange1 = selectionStartPageRange.intersectRanges(selection);
                const selectionRange2 = selectionEndPageRange.intersectRanges(selection);
                text = (model.getValueInRange(selectionRange1, 1 /* EndOfLinePreference.LF */)
                    + String.fromCharCode(8230)
                    + model.getValueInRange(selectionRange2, 1 /* EndOfLinePreference.LF */));
            }
            if (trimLongText && text.length > 2 * LIMIT_CHARS) {
                text = text.substring(0, LIMIT_CHARS) + String.fromCharCode(8230) + text.substring(text.length - LIMIT_CHARS, text.length);
            }
            return new TextAreaState(pretext + text + posttext, pretext.length, pretext.length + text.length, selection, pretextRange.endLineNumber - pretextRange.startLineNumber);
        }
    }
    exports.PagedScreenReaderStrategy = PagedScreenReaderStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEFyZWFTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL2NvbnRyb2xsZXIvdGV4dEFyZWFTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPbkYsUUFBQSxpQkFBaUIsR0FBRyxLQUFLLENBQUM7SUEwQnZDLE1BQWEsYUFBYTtpQkFFRixVQUFLLEdBQUcsSUFBSSxhQUFhLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTVFLFlBQ2lCLEtBQWE7UUFDN0IsdURBQXVEO1FBQ3ZDLGNBQXNCO1FBQ3RDLHFEQUFxRDtRQUNyQyxZQUFvQjtRQUNwQywrRkFBK0Y7UUFDL0UsU0FBdUI7UUFDdkMsK0hBQStIO1FBQy9HLDJCQUErQztZQVIvQyxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBRWIsbUJBQWMsR0FBZCxjQUFjLENBQVE7WUFFdEIsaUJBQVksR0FBWixZQUFZLENBQVE7WUFFcEIsY0FBUyxHQUFULFNBQVMsQ0FBYztZQUV2QixnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQW9CO1FBQzVELENBQUM7UUFFRSxRQUFRO1lBQ2QsT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLHNCQUFzQixJQUFJLENBQUMsY0FBYyxtQkFBbUIsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDO1FBQ3pHLENBQUM7UUFFTSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBMEIsRUFBRSxhQUFtQztZQUM3RixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbEMsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDcEQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ2hELElBQUksMkJBQTJCLEdBQXVC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