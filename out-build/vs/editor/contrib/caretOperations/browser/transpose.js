/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/commands/replaceCommand", "vs/editor/common/cursor/cursorMoveOperations", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/nls!vs/editor/contrib/caretOperations/browser/transpose"], function (require, exports, editorExtensions_1, replaceCommand_1, cursorMoveOperations_1, range_1, editorContextKeys_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TransposeLettersAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.transposeLetters',
                label: nls.localize(0, null),
                alias: 'Transpose Letters',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: {
                        primary: 256 /* KeyMod.WinCtrl */ | 50 /* KeyCode.KeyT */
                    },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const model = editor.getModel();
            const commands = [];
            const selections = editor.getSelections();
            for (const selection of selections) {
                if (!selection.isEmpty()) {
                    continue;
                }
                const lineNumber = selection.startLineNumber;
                const column = selection.startColumn;
                const lastColumn = model.getLineMaxColumn(lineNumber);
                if (lineNumber === 1 && (column === 1 || (column === 2 && lastColumn === 2))) {
                    // at beginning of file, nothing to do
                    continue;
                }
                // handle special case: when at end of line, transpose left two chars
                // otherwise, transpose left and right chars
                const endPosition = (column === lastColumn) ?
                    selection.getPosition() :
                    cursorMoveOperations_1.$2V.rightPosition(model, selection.getPosition().lineNumber, selection.getPosition().column);
                const middlePosition = cursorMoveOperations_1.$2V.leftPosition(model, endPosition);
                const beginPosition = cursorMoveOperations_1.$2V.leftPosition(model, middlePosition);
                const leftChar = model.getValueInRange(range_1.$ks.fromPositions(beginPosition, middlePosition));
                const rightChar = model.getValueInRange(range_1.$ks.fromPositions(middlePosition, endPosition));
                const replaceRange = range_1.$ks.fromPositions(beginPosition, endPosition);
                commands.push(new replaceCommand_1.$UV(replaceRange, rightChar + leftChar));
            }
            if (commands.length > 0) {
                editor.pushUndoStop();
                editor.executeCommands(this.id, commands);
                editor.pushUndoStop();
            }
        }
    }
    (0, editorExtensions_1.$xV)(TransposeLettersAction);
});
//# sourceMappingURL=transpose.js.map