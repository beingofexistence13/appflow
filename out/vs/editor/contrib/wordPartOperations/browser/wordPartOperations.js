/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/cursor/cursorWordOperations", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/contrib/wordOperations/browser/wordOperations", "vs/platform/commands/common/commands"], function (require, exports, editorExtensions_1, cursorWordOperations_1, range_1, editorContextKeys_1, wordOperations_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CursorWordPartRightSelect = exports.CursorWordPartRight = exports.WordPartRightCommand = exports.CursorWordPartLeftSelect = exports.CursorWordPartLeft = exports.WordPartLeftCommand = exports.DeleteWordPartRight = exports.DeleteWordPartLeft = void 0;
    class DeleteWordPartLeft extends wordOperations_1.DeleteWordCommand {
        constructor() {
            super({
                whitespaceHeuristics: true,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'deleteWordPartLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 1 /* KeyCode.Backspace */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        _delete(ctx, wordNavigationType) {
            const r = cursorWordOperations_1.WordPartOperations.deleteWordPartLeft(ctx);
            if (r) {
                return r;
            }
            return new range_1.Range(1, 1, 1, 1);
        }
    }
    exports.DeleteWordPartLeft = DeleteWordPartLeft;
    class DeleteWordPartRight extends wordOperations_1.DeleteWordCommand {
        constructor() {
            super({
                whitespaceHeuristics: true,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'deleteWordPartRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 20 /* KeyCode.Delete */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        _delete(ctx, wordNavigationType) {
            const r = cursorWordOperations_1.WordPartOperations.deleteWordPartRight(ctx);
            if (r) {
                return r;
            }
            const lineCount = ctx.model.getLineCount();
            const maxColumn = ctx.model.getLineMaxColumn(lineCount);
            return new range_1.Range(lineCount, maxColumn, lineCount, maxColumn);
        }
    }
    exports.DeleteWordPartRight = DeleteWordPartRight;
    class WordPartLeftCommand extends wordOperations_1.MoveWordCommand {
        _move(wordSeparators, model, position, wordNavigationType) {
            return cursorWordOperations_1.WordPartOperations.moveWordPartLeft(wordSeparators, model, position);
        }
    }
    exports.WordPartLeftCommand = WordPartLeftCommand;
    class CursorWordPartLeft extends WordPartLeftCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'cursorWordPartLeft',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.CursorWordPartLeft = CursorWordPartLeft;
    // Register previous id for compatibility purposes
    commands_1.CommandsRegistry.registerCommandAlias('cursorWordPartStartLeft', 'cursorWordPartLeft');
    class CursorWordPartLeftSelect extends WordPartLeftCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'cursorWordPartLeftSelect',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.CursorWordPartLeftSelect = CursorWordPartLeftSelect;
    // Register previous id for compatibility purposes
    commands_1.CommandsRegistry.registerCommandAlias('cursorWordPartStartLeftSelect', 'cursorWordPartLeftSelect');
    class WordPartRightCommand extends wordOperations_1.MoveWordCommand {
        _move(wordSeparators, model, position, wordNavigationType) {
            return cursorWordOperations_1.WordPartOperations.moveWordPartRight(wordSeparators, model, position);
        }
    }
    exports.WordPartRightCommand = WordPartRightCommand;
    class CursorWordPartRight extends WordPartRightCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordPartRight',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.CursorWordPartRight = CursorWordPartRight;
    class CursorWordPartRightSelect extends WordPartRightCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordPartRightSelect',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.CursorWordPartRightSelect = CursorWordPartRightSelect;
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordPartLeft());
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordPartRight());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordPartLeft());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordPartLeftSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordPartRight());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordPartRightSelect());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZFBhcnRPcGVyYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvd29yZFBhcnRPcGVyYXRpb25zL2Jyb3dzZXIvd29yZFBhcnRPcGVyYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRyxNQUFhLGtCQUFtQixTQUFRLGtDQUFpQjtRQUN4RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxvQkFBb0IsRUFBRSxJQUFJO2dCQUMxQixrQkFBa0Isc0NBQThCO2dCQUNoRCxFQUFFLEVBQUUsb0JBQW9CO2dCQUN4QixZQUFZLEVBQUUscUNBQWlCLENBQUMsUUFBUTtnQkFDeEMsTUFBTSxFQUFFO29CQUNQLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxjQUFjO29CQUN4QyxPQUFPLEVBQUUsQ0FBQztvQkFDVixHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsK0NBQTJCLDRCQUFvQixFQUFFO29CQUNqRSxNQUFNLDBDQUFnQztpQkFDdEM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVMsT0FBTyxDQUFDLEdBQXNCLEVBQUUsa0JBQXNDO1lBQy9FLE1BQU0sQ0FBQyxHQUFHLHlDQUFrQixDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxFQUFFO2dCQUNOLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFDRCxPQUFPLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlCLENBQUM7S0FDRDtJQXZCRCxnREF1QkM7SUFFRCxNQUFhLG1CQUFvQixTQUFRLGtDQUFpQjtRQUN6RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxvQkFBb0IsRUFBRSxJQUFJO2dCQUMxQixrQkFBa0Isb0NBQTRCO2dCQUM5QyxFQUFFLEVBQUUscUJBQXFCO2dCQUN6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