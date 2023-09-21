/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/range"], function (require, exports, strings, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9W = exports.$8W = exports.$7W = void 0;
    exports.$7W = false;
    class $8W {
        static { this.EMPTY = new $8W('', 0, 0, null, undefined); }
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
            return new $8W(value, selectionStart, selectionEnd, null, newlineCountBeforeSelection);
        }
        collapseSelection() {
            if (this.selectionStart === this.value.length) {
                return this;
            }
            return new $8W(this.value, this.value.length, this.value.length, null, undefined);
        }
        writeToTextArea(reason, textArea, select) {
            if (exports.$7W) {
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
                return this.a(this.selection?.getStartPosition() ?? null, str, -1);
            }
            if (offset >= this.selectionEnd) {
                const str = this.value.substring(this.selectionEnd, offset);
                return this.a(this.selection?.getEndPosition() ?? null, str, 1);
            }
            const str1 = this.value.substring(this.selectionStart, offset);
            if (str1.indexOf(String.fromCharCode(8230)) === -1) {
                return this.a(this.selection?.getStartPosition() ?? null, str1, 1);
            }
            const str2 = this.value.substring(offset, this.selectionEnd);
            return this.a(this.selection?.getEndPosition() ?? null, str2, -1);
        }
        a(anchor, deltaText, signum) {
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
            if (exports.$7W) {
                console.log('------------------------deduceInput');
                console.log(`PREVIOUS STATE: ${previousState.toString()}`);
                console.log(`CURRENT STATE: ${currentState.toString()}`);
            }
            const prefixLength = Math.min(strings.$Oe(previousState.value, currentState.value), previousState.selectionStart, currentState.selectionStart);
            const suffixLength = Math.min(strings.$Pe(previousState.value, currentState.value), previousState.value.length - previousState.selectionEnd, currentState.value.length - currentState.selectionEnd);
            const previousValue = previousState.value.substring(prefixLength, previousState.value.length - suffixLength);
            const currentValue = currentState.value.substring(prefixLength, currentState.value.length - suffixLength);
            const previousSelectionStart = previousState.selectionStart - prefixLength;
            const previousSelectionEnd = previousState.selectionEnd - prefixLength;
            const currentSelectionStart = currentState.selectionStart - prefixLength;
            const currentSelectionEnd = currentState.selectionEnd - prefixLength;
            if (exports.$7W) {
                console.log(`AFTER DIFFING PREVIOUS STATE: <${previousValue}>, selectionStart: ${previousSelectionStart}, selectionEnd: ${previousSelectionEnd}`);
                console.log(`AFTER DIFFING CURRENT STATE: <${currentValue}>, selectionStart: ${currentSelectionStart}, selectionEnd: ${currentSelectionEnd}`);
            }
            if (currentSelectionStart === currentSelectionEnd) {
                // no current selection
                const replacePreviousCharacters = (previousState.selectionStart - prefixLength);
                if (exports.$7W) {
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
            if (exports.$7W) {
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
            const prefixLength = Math.min(strings.$Oe(previousState.value, currentState.value), previousState.selectionEnd);
            const suffixLength = Math.min(strings.$Pe(previousState.value, currentState.value), previousState.value.length - previousState.selectionEnd);
            const previousValue = previousState.value.substring(prefixLength, previousState.value.length - suffixLength);
            const currentValue = currentState.value.substring(prefixLength, currentState.value.length - suffixLength);
            const previousSelectionStart = previousState.selectionStart - prefixLength;
            const previousSelectionEnd = previousState.selectionEnd - prefixLength;
            const currentSelectionStart = currentState.selectionStart - prefixLength;
            const currentSelectionEnd = currentState.selectionEnd - prefixLength;
            if (exports.$7W) {
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
    exports.$8W = $8W;
    class $9W {
        static a(lineNumber, linesPerPage) {
            return Math.floor((lineNumber - 1) / linesPerPage);
        }
        static b(page, linesPerPage) {
            const offset = page * linesPerPage;
            const startLineNumber = offset + 1;
            const endLineNumber = offset + linesPerPage;
            return new range_1.$ks(startLineNumber, 1, endLineNumber + 1, 1);
        }
        static fromEditorSelection(model, selection, linesPerPage, trimLongText) {
            // Chromium handles very poorly text even of a few thousand chars
            // Cut text to avoid stalling the entire UI
            const LIMIT_CHARS = 500;
            const selectionStartPage = $9W.a(selection.startLineNumber, linesPerPage);
            const selectionStartPageRange = $9W.b(selectionStartPage, linesPerPage);
            const selectionEndPage = $9W.a(selection.endLineNumber, linesPerPage);
            const selectionEndPageRange = $9W.b(selectionEndPage, linesPerPage);
            let pretextRange = selectionStartPageRange.intersectRanges(new range_1.$ks(1, 1, selection.startLineNumber, selection.startColumn));
            if (trimLongText && model.getValueLengthInRange(pretextRange, 1 /* EndOfLinePreference.LF */) > LIMIT_CHARS) {
                const pretextStart = model.modifyPosition(pretextRange.getEndPosition(), -LIMIT_CHARS);
                pretextRange = range_1.$ks.fromPositions(pretextStart, pretextRange.getEndPosition());
            }
            const pretext = model.getValueInRange(pretextRange, 1 /* EndOfLinePreference.LF */);
            const lastLine = model.getLineCount();
            const lastLineMaxColumn = model.getLineMaxColumn(lastLine);
            let posttextRange = selectionEndPageRange.intersectRanges(new range_1.$ks(selection.endLineNumber, selection.endColumn, lastLine, lastLineMaxColumn));
            if (trimLongText && model.getValueLengthInRange(posttextRange, 1 /* EndOfLinePreference.LF */) > LIMIT_CHARS) {
                const posttextEnd = model.modifyPosition(posttextRange.getStartPosition(), LIMIT_CHARS);
                posttextRange = range_1.$ks.fromPositions(posttextRange.getStartPosition(), posttextEnd);
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
            return new $8W(pretext + text + posttext, pretext.length, pretext.length + text.length, selection, pretextRange.endLineNumber - pretextRange.startLineNumber);
        }
    }
    exports.$9W = $9W;
});
//# sourceMappingURL=textAreaState.js.map