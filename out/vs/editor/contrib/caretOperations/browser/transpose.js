/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/commands/replaceCommand", "vs/editor/common/cursor/cursorMoveOperations", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/nls"], function (require, exports, editorExtensions_1, replaceCommand_1, cursorMoveOperations_1, range_1, editorContextKeys_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TransposeLettersAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.transposeLetters',
                label: nls.localize('transposeLetters.label', "Transpose Letters"),
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
                    cursorMoveOperations_1.MoveOperations.rightPosition(model, selection.getPosition().lineNumber, selection.getPosition().column);
                const middlePosition = cursorMoveOperations_1.MoveOperations.leftPosition(model, endPosition);
                const beginPosition = cursorMoveOperations_1.MoveOperations.leftPosition(model, middlePosition);
                const leftChar = model.getValueInRange(range_1.Range.fromPositions(beginPosition, middlePosition));
                const rightChar = model.getValueInRange(range_1.Range.fromPositions(middlePosition, endPosition));
                const replaceRange = range_1.Range.fromPositions(beginPosition, endPosition);
                commands.push(new replaceCommand_1.ReplaceCommand(replaceRange, rightChar + leftChar));
            }
            if (commands.length > 0) {
                editor.pushUndoStop();
                editor.executeCommands(this.id, commands);
                editor.pushUndoStop();
            }
        }
    }
    (0, editorExtensions_1.registerEditorAction)(TransposeLettersAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNwb3NlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY2FyZXRPcGVyYXRpb25zL2Jyb3dzZXIvdHJhbnNwb3NlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBYWhHLE1BQU0sc0JBQXVCLFNBQVEsK0JBQVk7UUFFaEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGdDQUFnQztnQkFDcEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsbUJBQW1CLENBQUM7Z0JBQ2xFLEtBQUssRUFBRSxtQkFBbUI7Z0JBQzFCLFlBQVksRUFBRSxxQ0FBaUIsQ0FBQyxRQUFRO2dCQUN4QyxNQUFNLEVBQUU7b0JBQ1AsTUFBTSxFQUFFLHFDQUFpQixDQUFDLGNBQWM7b0JBQ3hDLE9BQU8sRUFBRSxDQUFDO29CQUNWLEdBQUcsRUFBRTt3QkFDSixPQUFPLEVBQUUsZ0RBQTZCO3FCQUN0QztvQkFDRCxNQUFNLDBDQUFnQztpQkFDdEM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sR0FBRyxDQUFDLFFBQTBCLEVBQUUsTUFBbUI7WUFDekQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDdkIsT0FBTzthQUNQO1lBRUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sUUFBUSxHQUFlLEVBQUUsQ0FBQztZQUNoQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFMUMsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQ3pCLFNBQVM7aUJBQ1Q7Z0JBRUQsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQztnQkFDN0MsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQztnQkFFckMsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUV0RCxJQUFJLFVBQVUsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxVQUFVLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDN0Usc0NBQXNDO29CQUN0QyxTQUFTO2lCQUNUO2dCQUVELHFFQUFxRTtnQkFDckUsNENBQTRDO2dCQUM1QyxNQUFNLFdBQVcsR0FBRyxDQUFDLE1BQU0sS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUM1QyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztvQkFDekIscUNBQWMsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUV6RyxNQUFNLGNBQWMsR0FBRyxxQ0FBYyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ3ZFLE1BQU0sYUFBYSxHQUFHLHFDQUFjLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFFekUsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxhQUFLLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUMzRixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLGFBQUssQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBRTFGLE1BQU0sWUFBWSxHQUFHLGFBQUssQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUNyRSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksK0JBQWMsQ0FBQyxZQUFZLEVBQUUsU0FBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUM7YUFDdEU7WUFFRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN4QixNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3RCLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDMUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3RCO1FBQ0YsQ0FBQztLQUNEO0lBRUQsSUFBQSx1Q0FBb0IsRUFBQyxzQkFBc0IsQ0FBQyxDQUFDIn0=