/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/editor/browser/coreCommands", "vs/editor/browser/editorExtensions", "vs/editor/common/commands/replaceCommand", "vs/editor/common/commands/trimTrailingWhitespaceCommand", "vs/editor/common/cursor/cursorTypeOperations", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/contrib/linesOperations/browser/copyLinesCommand", "vs/editor/contrib/linesOperations/browser/moveLinesCommand", "vs/editor/contrib/linesOperations/browser/sortLinesCommand", "vs/nls", "vs/platform/actions/common/actions", "vs/editor/common/languages/languageConfigurationRegistry"], function (require, exports, keyCodes_1, coreCommands_1, editorExtensions_1, replaceCommand_1, trimTrailingWhitespaceCommand_1, cursorTypeOperations_1, editOperation_1, position_1, range_1, selection_1, editorContextKeys_1, copyLinesCommand_1, moveLinesCommand_1, sortLinesCommand_1, nls, actions_1, languageConfigurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KebabCaseAction = exports.CamelCaseAction = exports.SnakeCaseAction = exports.TitleCaseAction = exports.LowerCaseAction = exports.UpperCaseAction = exports.AbstractCaseAction = exports.TransposeAction = exports.JoinLinesAction = exports.DeleteAllRightAction = exports.DeleteAllLeftAction = exports.AbstractDeleteAllToBoundaryAction = exports.InsertLineAfterAction = exports.InsertLineBeforeAction = exports.IndentLinesAction = exports.DeleteLinesAction = exports.TrimTrailingWhitespaceAction = exports.DeleteDuplicateLinesAction = exports.SortLinesDescendingAction = exports.SortLinesAscendingAction = exports.AbstractSortLinesAction = exports.DuplicateSelectionAction = void 0;
    // copy lines
    class AbstractCopyLinesAction extends editorExtensions_1.EditorAction {
        constructor(down, opts) {
            super(opts);
            this.down = down;
        }
        run(_accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const selections = editor.getSelections().map((selection, index) => ({ selection, index, ignore: false }));
            selections.sort((a, b) => range_1.Range.compareRangesUsingStarts(a.selection, b.selection));
            // Remove selections that would result in copying the same line
            let prev = selections[0];
            for (let i = 1; i < selections.length; i++) {
                const curr = selections[i];
                if (prev.selection.endLineNumber === curr.selection.startLineNumber) {
                    // these two selections would copy the same line
                    if (prev.index < curr.index) {
                        // prev wins
                        curr.ignore = true;
                    }
                    else {
                        // curr wins
                        prev.ignore = true;
                        prev = curr;
                    }
                }
            }
            const commands = [];
            for (const selection of selections) {
                commands.push(new copyLinesCommand_1.CopyLinesCommand(selection.selection, this.down, selection.ignore));
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    class CopyLinesUpAction extends AbstractCopyLinesAction {
        constructor() {
            super(false, {
                id: 'editor.action.copyLinesUpAction',
                label: nls.localize('lines.copyUp', "Copy Line Up"),
                alias: 'Copy Line Up',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize({ key: 'miCopyLinesUp', comment: ['&& denotes a mnemonic'] }, "&&Copy Line Up"),
                    order: 1
                }
            });
        }
    }
    class CopyLinesDownAction extends AbstractCopyLinesAction {
        constructor() {
            super(true, {
                id: 'editor.action.copyLinesDownAction',
                label: nls.localize('lines.copyDown', "Copy Line Down"),
                alias: 'Copy Line Down',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize({ key: 'miCopyLinesDown', comment: ['&& denotes a mnemonic'] }, "Co&&py Line Down"),
                    order: 2
                }
            });
        }
    }
    class DuplicateSelectionAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.duplicateSelection',
                label: nls.localize('duplicateSelection', "Duplicate Selection"),
                alias: 'Duplicate Selection',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize({ key: 'miDuplicateSelection', comment: ['&& denotes a mnemonic'] }, "&&Duplicate Selection"),
                    order: 5
                }
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const commands = [];
            const selections = editor.getSelections();
            const model = editor.getModel();
            for (const selection of selections) {
                if (selection.isEmpty()) {
                    commands.push(new copyLinesCommand_1.CopyLinesCommand(selection, true));
                }
                else {
                    const insertSelection = new selection_1.Selection(selection.endLineNumber, selection.endColumn, selection.endLineNumber, selection.endColumn);
                    commands.push(new replaceCommand_1.ReplaceCommandThatSelectsText(insertSelection, model.getValueInRange(selection)));
                }
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.DuplicateSelectionAction = DuplicateSelectionAction;
    // move lines
    class AbstractMoveLinesAction extends editorExtensions_1.EditorAction {
        constructor(down, opts) {
            super(opts);
            this.down = down;
        }
        run(accessor, editor) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
            const commands = [];
            const selections = editor.getSelections() || [];
            const autoIndent = editor.getOption(12 /* EditorOption.autoIndent */);
            for (const selection of selections) {
                commands.push(new moveLinesCommand_1.MoveLinesCommand(selection, this.down, autoIndent, languageConfigurationService));
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    class MoveLinesUpAction extends AbstractMoveLinesAction {
        constructor() {
            super(false, {
                id: 'editor.action.moveLinesUpAction',
                label: nls.localize('lines.moveUp', "Move Line Up"),
                alias: 'Move Line Up',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */,
                    linux: { primary: 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize({ key: 'miMoveLinesUp', comment: ['&& denotes a mnemonic'] }, "Mo&&ve Line Up"),
                    order: 3
                }
            });
        }
    }
    class MoveLinesDownAction extends AbstractMoveLinesAction {
        constructor() {
            super(true, {
                id: 'editor.action.moveLinesDownAction',
                label: nls.localize('lines.moveDown', "Move Line Down"),
                alias: 'Move Line Down',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */,
                    linux: { primary: 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize({ key: 'miMoveLinesDown', comment: ['&& denotes a mnemonic'] }, "Move &&Line Down"),
                    order: 4
                }
            });
        }
    }
    class AbstractSortLinesAction extends editorExtensions_1.EditorAction {
        constructor(descending, opts) {
            super(opts);
            this.descending = descending;
        }
        run(_accessor, editor) {
            const selections = editor.getSelections() || [];
            for (const selection of selections) {
                if (!sortLinesCommand_1.SortLinesCommand.canRun(editor.getModel(), selection, this.descending)) {
                    return;
                }
            }
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new sortLinesCommand_1.SortLinesCommand(selections[i], this.descending);
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.AbstractSortLinesAction = AbstractSortLinesAction;
    class SortLinesAscendingAction extends AbstractSortLinesAction {
        constructor() {
            super(false, {
                id: 'editor.action.sortLinesAscending',
                label: nls.localize('lines.sortAscending', "Sort Lines Ascending"),
                alias: 'Sort Lines Ascending',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.SortLinesAscendingAction = SortLinesAscendingAction;
    class SortLinesDescendingAction extends AbstractSortLinesAction {
        constructor() {
            super(true, {
                id: 'editor.action.sortLinesDescending',
                label: nls.localize('lines.sortDescending', "Sort Lines Descending"),
                alias: 'Sort Lines Descending',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.SortLinesDescendingAction = SortLinesDescendingAction;
    class DeleteDuplicateLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.removeDuplicateLines',
                label: nls.localize('lines.deleteDuplicates', "Delete Duplicate Lines"),
                alias: 'Delete Duplicate Lines',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(_accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const model = editor.getModel();
            if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
                return;
            }
            const edits = [];
            const endCursorState = [];
            let linesDeleted = 0;
            for (const selection of editor.getSelections()) {
                const uniqueLines = new Set();
                const lines = [];
                for (let i = selection.startLineNumber; i <= selection.endLineNumber; i++) {
                    const line = model.getLineContent(i);
                    if (uniqueLines.has(line)) {
                        continue;
                    }
                    lines.push(line);
                    uniqueLines.add(line);
                }
                const selectionToReplace = new selection_1.Selection(selection.startLineNumber, 1, selection.endLineNumber, model.getLineMaxColumn(selection.endLineNumber));
                const adjustedSelectionStart = selection.startLineNumber - linesDeleted;
                const finalSelection = new selection_1.Selection(adjustedSelectionStart, 1, adjustedSelectionStart + lines.length - 1, lines[lines.length - 1].length);
                edits.push(editOperation_1.EditOperation.replace(selectionToReplace, lines.join('\n')));
                endCursorState.push(finalSelection);
                linesDeleted += (selection.endLineNumber - selection.startLineNumber + 1) - lines.length;
            }
            editor.pushUndoStop();
            editor.executeEdits(this.id, edits, endCursorState);
            editor.pushUndoStop();
        }
    }
    exports.DeleteDuplicateLinesAction = DeleteDuplicateLinesAction;
    class TrimTrailingWhitespaceAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.trimTrailingWhitespace'; }
        constructor() {
            super({
                id: TrimTrailingWhitespaceAction.ID,
                label: nls.localize('lines.trimTrailingWhitespace', "Trim Trailing Whitespace"),
                alias: 'Trim Trailing Whitespace',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor, args) {
            let cursors = [];
            if (args.reason === 'auto-save') {
                // See https://github.com/editorconfig/editorconfig-vscode/issues/47
                // It is very convenient for the editor config extension to invoke this action.
                // So, if we get a reason:'auto-save' passed in, let's preserve cursor positions.
                cursors = (editor.getSelections() || []).map(s => new position_1.Position(s.positionLineNumber, s.positionColumn));
            }
            const selection = editor.getSelection();
            if (selection === null) {
                return;
            }
            const command = new trimTrailingWhitespaceCommand_1.TrimTrailingWhitespaceCommand(selection, cursors);
            editor.pushUndoStop();
            editor.executeCommands(this.id, [command]);
            editor.pushUndoStop();
        }
    }
    exports.TrimTrailingWhitespaceAction = TrimTrailingWhitespaceAction;
    class DeleteLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.deleteLines',
                label: nls.localize('lines.delete', "Delete Line"),
                alias: 'Delete Line',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 41 /* KeyCode.KeyK */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const ops = this._getLinesToRemove(editor);
            const model = editor.getModel();
            if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
                // Model is empty
                return;
            }
            let linesDeleted = 0;
            const edits = [];
            const cursorState = [];
            for (let i = 0, len = ops.length; i < len; i++) {
                const op = ops[i];
                let startLineNumber = op.startLineNumber;
                let endLineNumber = op.endLineNumber;
                let startColumn = 1;
                let endColumn = model.getLineMaxColumn(endLineNumber);
                if (endLineNumber < model.getLineCount()) {
                    endLineNumber += 1;
                    endColumn = 1;
                }
                else if (startLineNumber > 1) {
                    startLineNumber -= 1;
                    startColumn = model.getLineMaxColumn(startLineNumber);
                }
                edits.push(editOperation_1.EditOperation.replace(new selection_1.Selection(startLineNumber, startColumn, endLineNumber, endColumn), ''));
                cursorState.push(new selection_1.Selection(startLineNumber - linesDeleted, op.positionColumn, startLineNumber - linesDeleted, op.positionColumn));
                linesDeleted += (op.endLineNumber - op.startLineNumber + 1);
            }
            editor.pushUndoStop();
            editor.executeEdits(this.id, edits, cursorState);
            editor.pushUndoStop();
        }
        _getLinesToRemove(editor) {
            // Construct delete operations
            const operations = editor.getSelections().map((s) => {
                let endLineNumber = s.endLineNumber;
                if (s.startLineNumber < s.endLineNumber && s.endColumn === 1) {
                    endLineNumber -= 1;
                }
                return {
                    startLineNumber: s.startLineNumber,
                    selectionStartColumn: s.selectionStartColumn,
                    endLineNumber: endLineNumber,
                    positionColumn: s.positionColumn
                };
            });
            // Sort delete operations
            operations.sort((a, b) => {
                if (a.startLineNumber === b.startLineNumber) {
                    return a.endLineNumber - b.endLineNumber;
                }
                return a.startLineNumber - b.startLineNumber;
            });
            // Merge delete operations which are adjacent or overlapping
            const mergedOperations = [];
            let previousOperation = operations[0];
            for (let i = 1; i < operations.length; i++) {
                if (previousOperation.endLineNumber + 1 >= operations[i].startLineNumber) {
                    // Merge current operations into the previous one
                    previousOperation.endLineNumber = operations[i].endLineNumber;
                }
                else {
                    // Push previous operation
                    mergedOperations.push(previousOperation);
                    previousOperation = operations[i];
                }
            }
            // Push the last operation
            mergedOperations.push(previousOperation);
            return mergedOperations;
        }
    }
    exports.DeleteLinesAction = DeleteLinesAction;
    class IndentLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.indentLines',
                label: nls.localize('lines.indent', "Indent Line"),
                alias: 'Indent Line',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            const viewModel = editor._getViewModel();
            if (!viewModel) {
                return;
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, cursorTypeOperations_1.TypeOperations.indent(viewModel.cursorConfig, editor.getModel(), editor.getSelections()));
            editor.pushUndoStop();
        }
    }
    exports.IndentLinesAction = IndentLinesAction;
    class OutdentLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.outdentLines',
                label: nls.localize('lines.outdent', "Outdent Line"),
                alias: 'Outdent Line',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 92 /* KeyCode.BracketLeft */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            coreCommands_1.CoreEditingCommands.Outdent.runEditorCommand(_accessor, editor, null);
        }
    }
    class InsertLineBeforeAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.insertLineBefore',
                label: nls.localize('lines.insertBefore', "Insert Line Above"),
                alias: 'Insert Line Above',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            const viewModel = editor._getViewModel();
            if (!viewModel) {
                return;
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, cursorTypeOperations_1.TypeOperations.lineInsertBefore(viewModel.cursorConfig, editor.getModel(), editor.getSelections()));
        }
    }
    exports.InsertLineBeforeAction = InsertLineBeforeAction;
    class InsertLineAfterAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.insertLineAfter',
                label: nls.localize('lines.insertAfter', "Insert Line Below"),
                alias: 'Insert Line Below',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            const viewModel = editor._getViewModel();
            if (!viewModel) {
                return;
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, cursorTypeOperations_1.TypeOperations.lineInsertAfter(viewModel.cursorConfig, editor.getModel(), editor.getSelections()));
        }
    }
    exports.InsertLineAfterAction = InsertLineAfterAction;
    class AbstractDeleteAllToBoundaryAction extends editorExtensions_1.EditorAction {
        run(_accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const primaryCursor = editor.getSelection();
            const rangesToDelete = this._getRangesToDelete(editor);
            // merge overlapping selections
            const effectiveRanges = [];
            for (let i = 0, count = rangesToDelete.length - 1; i < count; i++) {
                const range = rangesToDelete[i];
                const nextRange = rangesToDelete[i + 1];
                if (range_1.Range.intersectRanges(range, nextRange) === null) {
                    effectiveRanges.push(range);
                }
                else {
                    rangesToDelete[i + 1] = range_1.Range.plusRange(range, nextRange);
                }
            }
            effectiveRanges.push(rangesToDelete[rangesToDelete.length - 1]);
            const endCursorState = this._getEndCursorState(primaryCursor, effectiveRanges);
            const edits = effectiveRanges.map(range => {
                return editOperation_1.EditOperation.replace(range, '');
            });
            editor.pushUndoStop();
            editor.executeEdits(this.id, edits, endCursorState);
            editor.pushUndoStop();
        }
    }
    exports.AbstractDeleteAllToBoundaryAction = AbstractDeleteAllToBoundaryAction;
    class DeleteAllLeftAction extends AbstractDeleteAllToBoundaryAction {
        constructor() {
            super({
                id: 'deleteAllLeft',
                label: nls.localize('lines.deleteAllLeft', "Delete All Left"),
                alias: 'Delete All Left',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        _getEndCursorState(primaryCursor, rangesToDelete) {
            let endPrimaryCursor = null;
            const endCursorState = [];
            let deletedLines = 0;
            rangesToDelete.forEach(range => {
                let endCursor;
                if (range.endColumn === 1 && deletedLines > 0) {
                    const newStartLine = range.startLineNumber - deletedLines;
                    endCursor = new selection_1.Selection(newStartLine, range.startColumn, newStartLine, range.startColumn);
                }
                else {
                    endCursor = new selection_1.Selection(range.startLineNumber, range.startColumn, range.startLineNumber, range.startColumn);
                }
                deletedLines += range.endLineNumber - range.startLineNumber;
                if (range.intersectRanges(primaryCursor)) {
                    endPrimaryCursor = endCursor;
                }
                else {
                    endCursorState.push(endCursor);
                }
            });
            if (endPrimaryCursor) {
                endCursorState.unshift(endPrimaryCursor);
            }
            return endCursorState;
        }
        _getRangesToDelete(editor) {
            const selections = editor.getSelections();
            if (selections === null) {
                return [];
            }
            let rangesToDelete = selections;
            const model = editor.getModel();
            if (model === null) {
                return [];
            }
            rangesToDelete.sort(range_1.Range.compareRangesUsingStarts);
            rangesToDelete = rangesToDelete.map(selection => {
                if (selection.isEmpty()) {
                    if (selection.startColumn === 1) {
                        const deleteFromLine = Math.max(1, selection.startLineNumber - 1);
                        const deleteFromColumn = selection.startLineNumber === 1 ? 1 : model.getLineLength(deleteFromLine) + 1;
                        return new range_1.Range(deleteFromLine, deleteFromColumn, selection.startLineNumber, 1);
                    }
                    else {
                        return new range_1.Range(selection.startLineNumber, 1, selection.startLineNumber, selection.startColumn);
                    }
                }
                else {
                    return new range_1.Range(selection.startLineNumber, 1, selection.endLineNumber, selection.endColumn);
                }
            });
            return rangesToDelete;
        }
    }
    exports.DeleteAllLeftAction = DeleteAllLeftAction;
    class DeleteAllRightAction extends AbstractDeleteAllToBoundaryAction {
        constructor() {
            super({
                id: 'deleteAllRight',
                label: nls.localize('lines.deleteAllRight', "Delete All Right"),
                alias: 'Delete All Right',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 41 /* KeyCode.KeyK */, secondary: [2048 /* KeyMod.CtrlCmd */ | 20 /* KeyCode.Delete */] },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        _getEndCursorState(primaryCursor, rangesToDelete) {
            let endPrimaryCursor = null;
            const endCursorState = [];
            for (let i = 0, len = rangesToDelete.length, offset = 0; i < len; i++) {
                const range = rangesToDelete[i];
                const endCursor = new selection_1.Selection(range.startLineNumber - offset, range.startColumn, range.startLineNumber - offset, range.startColumn);
                if (range.intersectRanges(primaryCursor)) {
                    endPrimaryCursor = endCursor;
                }
                else {
                    endCursorState.push(endCursor);
                }
            }
            if (endPrimaryCursor) {
                endCursorState.unshift(endPrimaryCursor);
            }
            return endCursorState;
        }
        _getRangesToDelete(editor) {
            const model = editor.getModel();
            if (model === null) {
                return [];
            }
            const selections = editor.getSelections();
            if (selections === null) {
                return [];
            }
            const rangesToDelete = selections.map((sel) => {
                if (sel.isEmpty()) {
                    const maxColumn = model.getLineMaxColumn(sel.startLineNumber);
                    if (sel.startColumn === maxColumn) {
                        return new range_1.Range(sel.startLineNumber, sel.startColumn, sel.startLineNumber + 1, 1);
                    }
                    else {
                        return new range_1.Range(sel.startLineNumber, sel.startColumn, sel.startLineNumber, maxColumn);
                    }
                }
                return sel;
            });
            rangesToDelete.sort(range_1.Range.compareRangesUsingStarts);
            return rangesToDelete;
        }
    }
    exports.DeleteAllRightAction = DeleteAllRightAction;
    class JoinLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.joinLines',
                label: nls.localize('lines.joinLines', "Join Lines"),
                alias: 'Join Lines',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 40 /* KeyCode.KeyJ */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            const selections = editor.getSelections();
            if (selections === null) {
                return;
            }
            let primaryCursor = editor.getSelection();
            if (primaryCursor === null) {
                return;
            }
            selections.sort(range_1.Range.compareRangesUsingStarts);
            const reducedSelections = [];
            const lastSelection = selections.reduce((previousValue, currentValue) => {
                if (previousValue.isEmpty()) {
                    if (previousValue.endLineNumber === currentValue.startLineNumber) {
                        if (primaryCursor.equalsSelection(previousValue)) {
                            primaryCursor = currentValue;
                        }
                        return currentValue;
                    }
                    if (currentValue.startLineNumber > previousValue.endLineNumber + 1) {
                        reducedSelections.push(previousValue);
                        return currentValue;
                    }
                    else {
                        return new selection_1.Selection(previousValue.startLineNumber, previousValue.startColumn, currentValue.endLineNumber, currentValue.endColumn);
                    }
                }
                else {
                    if (currentValue.startLineNumber > previousValue.endLineNumber) {
                        reducedSelections.push(previousValue);
                        return currentValue;
                    }
                    else {
                        return new selection_1.Selection(previousValue.startLineNumber, previousValue.startColumn, currentValue.endLineNumber, currentValue.endColumn);
                    }
                }
            });
            reducedSelections.push(lastSelection);
            const model = editor.getModel();
            if (model === null) {
                return;
            }
            const edits = [];
            const endCursorState = [];
            let endPrimaryCursor = primaryCursor;
            let lineOffset = 0;
            for (let i = 0, len = reducedSelections.length; i < len; i++) {
                const selection = reducedSelections[i];
                const startLineNumber = selection.startLineNumber;
                const startColumn = 1;
                let columnDeltaOffset = 0;
                let endLineNumber, endColumn;
                const selectionEndPositionOffset = model.getLineLength(selection.endLineNumber) - selection.endColumn;
                if (selection.isEmpty() || selection.startLineNumber === selection.endLineNumber) {
                    const position = selection.getStartPosition();
                    if (position.lineNumber < model.getLineCount()) {
                        endLineNumber = startLineNumber + 1;
                        endColumn = model.getLineMaxColumn(endLineNumber);
                    }
                    else {
                        endLineNumber = position.lineNumber;
                        endColumn = model.getLineMaxColumn(position.lineNumber);
                    }
                }
                else {
                    endLineNumber = selection.endLineNumber;
                    endColumn = model.getLineMaxColumn(endLineNumber);
                }
                let trimmedLinesContent = model.getLineContent(startLineNumber);
                for (let i = startLineNumber + 1; i <= endLineNumber; i++) {
                    const lineText = model.getLineContent(i);
                    const firstNonWhitespaceIdx = model.getLineFirstNonWhitespaceColumn(i);
                    if (firstNonWhitespaceIdx >= 1) {
                        let insertSpace = true;
                        if (trimmedLinesContent === '') {
                            insertSpace = false;
                        }
                        if (insertSpace && (trimmedLinesContent.charAt(trimmedLinesContent.length - 1) === ' ' ||
                            trimmedLinesContent.charAt(trimmedLinesContent.length - 1) === '\t')) {
                            insertSpace = false;
                            trimmedLinesContent = trimmedLinesContent.replace(/[\s\uFEFF\xA0]+$/g, ' ');
                        }
                        const lineTextWithoutIndent = lineText.substr(firstNonWhitespaceIdx - 1);
                        trimmedLinesContent += (insertSpace ? ' ' : '') + lineTextWithoutIndent;
                        if (insertSpace) {
                            columnDeltaOffset = lineTextWithoutIndent.length + 1;
                        }
                        else {
                            columnDeltaOffset = lineTextWithoutIndent.length;
                        }
                    }
                    else {
                        columnDeltaOffset = 0;
                    }
                }
                const deleteSelection = new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn);
                if (!deleteSelection.isEmpty()) {
                    let resultSelection;
                    if (selection.isEmpty()) {
                        edits.push(editOperation_1.EditOperation.replace(deleteSelection, trimmedLinesContent));
                        resultSelection = new selection_1.Selection(deleteSelection.startLineNumber - lineOffset, trimmedLinesContent.length - columnDeltaOffset + 1, startLineNumber - lineOffset, trimmedLinesContent.length - columnDeltaOffset + 1);
                    }
                    else {
                        if (selection.startLineNumber === selection.endLineNumber) {
                            edits.push(editOperation_1.EditOperation.replace(deleteSelection, trimmedLinesContent));
                            resultSelection = new selection_1.Selection(selection.startLineNumber - lineOffset, selection.startColumn, selection.endLineNumber - lineOffset, selection.endColumn);
                        }
                        else {
                            edits.push(editOperation_1.EditOperation.replace(deleteSelection, trimmedLinesContent));
                            resultSelection = new selection_1.Selection(selection.startLineNumber - lineOffset, selection.startColumn, selection.startLineNumber - lineOffset, trimmedLinesContent.length - selectionEndPositionOffset);
                        }
                    }
                    if (range_1.Range.intersectRanges(deleteSelection, primaryCursor) !== null) {
                        endPrimaryCursor = resultSelection;
                    }
                    else {
                        endCursorState.push(resultSelection);
                    }
                }
                lineOffset += deleteSelection.endLineNumber - deleteSelection.startLineNumber;
            }
            endCursorState.unshift(endPrimaryCursor);
            editor.pushUndoStop();
            editor.executeEdits(this.id, edits, endCursorState);
            editor.pushUndoStop();
        }
    }
    exports.JoinLinesAction = JoinLinesAction;
    class TransposeAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.transpose',
                label: nls.localize('editor.transpose', "Transpose Characters around the Cursor"),
                alias: 'Transpose Characters around the Cursor',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(_accessor, editor) {
            const selections = editor.getSelections();
            if (selections === null) {
                return;
            }
            const model = editor.getModel();
            if (model === null) {
                return;
            }
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                if (!selection.isEmpty()) {
                    continue;
                }
                const cursor = selection.getStartPosition();
                const maxColumn = model.getLineMaxColumn(cursor.lineNumber);
                if (cursor.column >= maxColumn) {
                    if (cursor.lineNumber === model.getLineCount()) {
                        continue;
                    }
                    // The cursor is at the end of current line and current line is not empty
                    // then we transpose the character before the cursor and the line break if there is any following line.
                    const deleteSelection = new range_1.Range(cursor.lineNumber, Math.max(1, cursor.column - 1), cursor.lineNumber + 1, 1);
                    const chars = model.getValueInRange(deleteSelection).split('').reverse().join('');
                    commands.push(new replaceCommand_1.ReplaceCommand(new selection_1.Selection(cursor.lineNumber, Math.max(1, cursor.column - 1), cursor.lineNumber + 1, 1), chars));
                }
                else {
                    const deleteSelection = new range_1.Range(cursor.lineNumber, Math.max(1, cursor.column - 1), cursor.lineNumber, cursor.column + 1);
                    const chars = model.getValueInRange(deleteSelection).split('').reverse().join('');
                    commands.push(new replaceCommand_1.ReplaceCommandThatPreservesSelection(deleteSelection, chars, new selection_1.Selection(cursor.lineNumber, cursor.column + 1, cursor.lineNumber, cursor.column + 1)));
                }
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.TransposeAction = TransposeAction;
    class AbstractCaseAction extends editorExtensions_1.EditorAction {
        run(_accessor, editor) {
            const selections = editor.getSelections();
            if (selections === null) {
                return;
            }
            const model = editor.getModel();
            if (model === null) {
                return;
            }
            const wordSeparators = editor.getOption(129 /* EditorOption.wordSeparators */);
            const textEdits = [];
            for (const selection of selections) {
                if (selection.isEmpty()) {
                    const cursor = selection.getStartPosition();
                    const word = editor.getConfiguredWordAtPosition(cursor);
                    if (!word) {
                        continue;
                    }
                    const wordRange = new range_1.Range(cursor.lineNumber, word.startColumn, cursor.lineNumber, word.endColumn);
                    const text = model.getValueInRange(wordRange);
                    textEdits.push(editOperation_1.EditOperation.replace(wordRange, this._modifyText(text, wordSeparators)));
                }
                else {
                    const text = model.getValueInRange(selection);
                    textEdits.push(editOperation_1.EditOperation.replace(selection, this._modifyText(text, wordSeparators)));
                }
            }
            editor.pushUndoStop();
            editor.executeEdits(this.id, textEdits);
            editor.pushUndoStop();
        }
    }
    exports.AbstractCaseAction = AbstractCaseAction;
    class UpperCaseAction extends AbstractCaseAction {
        constructor() {
            super({
                id: 'editor.action.transformToUppercase',
                label: nls.localize('editor.transformToUppercase', "Transform to Uppercase"),
                alias: 'Transform to Uppercase',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        _modifyText(text, wordSeparators) {
            return text.toLocaleUpperCase();
        }
    }
    exports.UpperCaseAction = UpperCaseAction;
    class LowerCaseAction extends AbstractCaseAction {
        constructor() {
            super({
                id: 'editor.action.transformToLowercase',
                label: nls.localize('editor.transformToLowercase', "Transform to Lowercase"),
                alias: 'Transform to Lowercase',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        _modifyText(text, wordSeparators) {
            return text.toLocaleLowerCase();
        }
    }
    exports.LowerCaseAction = LowerCaseAction;
    class BackwardsCompatibleRegExp {
        constructor(_pattern, _flags) {
            this._pattern = _pattern;
            this._flags = _flags;
            this._actual = null;
            this._evaluated = false;
        }
        get() {
            if (!this._evaluated) {
                this._evaluated = true;
                try {
                    this._actual = new RegExp(this._pattern, this._flags);
                }
                catch (err) {
                    // this browser does not support this regular expression
                }
            }
            return this._actual;
        }
        isSupported() {
            return (this.get() !== null);
        }
    }
    class TitleCaseAction extends AbstractCaseAction {
        static { this.titleBoundary = new BackwardsCompatibleRegExp('(^|[^\\p{L}\\p{N}\']|((^|\\P{L})\'))\\p{L}', 'gmu'); }
        constructor() {
            super({
                id: 'editor.action.transformToTitlecase',
                label: nls.localize('editor.transformToTitlecase', "Transform to Title Case"),
                alias: 'Transform to Title Case',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        _modifyText(text, wordSeparators) {
            const titleBoundary = TitleCaseAction.titleBoundary.get();
            if (!titleBoundary) {
                // cannot support this
                return text;
            }
            return text
                .toLocaleLowerCase()
                .replace(titleBoundary, (b) => b.toLocaleUpperCase());
        }
    }
    exports.TitleCaseAction = TitleCaseAction;
    class SnakeCaseAction extends AbstractCaseAction {
        static { this.caseBoundary = new BackwardsCompatibleRegExp('(\\p{Ll})(\\p{Lu})', 'gmu'); }
        static { this.singleLetters = new BackwardsCompatibleRegExp('(\\p{Lu}|\\p{N})(\\p{Lu})(\\p{Ll})', 'gmu'); }
        constructor() {
            super({
                id: 'editor.action.transformToSnakecase',
                label: nls.localize('editor.transformToSnakecase', "Transform to Snake Case"),
                alias: 'Transform to Snake Case',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        _modifyText(text, wordSeparators) {
            const caseBoundary = SnakeCaseAction.caseBoundary.get();
            const singleLetters = SnakeCaseAction.singleLetters.get();
            if (!caseBoundary || !singleLetters) {
                // cannot support this
                return text;
            }
            return (text
                .replace(caseBoundary, '$1_$2')
                .replace(singleLetters, '$1_$2$3')
                .toLocaleLowerCase());
        }
    }
    exports.SnakeCaseAction = SnakeCaseAction;
    class CamelCaseAction extends AbstractCaseAction {
        static { this.wordBoundary = new BackwardsCompatibleRegExp('[_\\s-]', 'gm'); }
        constructor() {
            super({
                id: 'editor.action.transformToCamelcase',
                label: nls.localize('editor.transformToCamelcase', "Transform to Camel Case"),
                alias: 'Transform to Camel Case',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        _modifyText(text, wordSeparators) {
            const wordBoundary = CamelCaseAction.wordBoundary.get();
            if (!wordBoundary) {
                // cannot support this
                return text;
            }
            const words = text.split(wordBoundary);
            const firstWord = words.shift();
            return firstWord + words.map((word) => word.substring(0, 1).toLocaleUpperCase() + word.substring(1))
                .join('');
        }
    }
    exports.CamelCaseAction = CamelCaseAction;
    class KebabCaseAction extends AbstractCaseAction {
        static isSupported() {
            const areAllRegexpsSupported = [
                this.caseBoundary,
                this.singleLetters,
                this.underscoreBoundary,
            ].every((regexp) => regexp.isSupported());
            return areAllRegexpsSupported;
        }
        static { this.caseBoundary = new BackwardsCompatibleRegExp('(\\p{Ll})(\\p{Lu})', 'gmu'); }
        static { this.singleLetters = new BackwardsCompatibleRegExp('(\\p{Lu}|\\p{N})(\\p{Lu}\\p{Ll})', 'gmu'); }
        static { this.underscoreBoundary = new BackwardsCompatibleRegExp('(\\S)(_)(\\S)', 'gm'); }
        constructor() {
            super({
                id: 'editor.action.transformToKebabcase',
                label: nls.localize('editor.transformToKebabcase', 'Transform to Kebab Case'),
                alias: 'Transform to Kebab Case',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        _modifyText(text, _) {
            const caseBoundary = KebabCaseAction.caseBoundary.get();
            const singleLetters = KebabCaseAction.singleLetters.get();
            const underscoreBoundary = KebabCaseAction.underscoreBoundary.get();
            if (!caseBoundary || !singleLetters || !underscoreBoundary) {
                // one or more regexps aren't supported
                return text;
            }
            return text
                .replace(underscoreBoundary, '$1-$3')
                .replace(caseBoundary, '$1-$2')
                .replace(singleLetters, '$1-$2')
                .toLocaleLowerCase();
        }
    }
    exports.KebabCaseAction = KebabCaseAction;
    (0, editorExtensions_1.registerEditorAction)(CopyLinesUpAction);
    (0, editorExtensions_1.registerEditorAction)(CopyLinesDownAction);
    (0, editorExtensions_1.registerEditorAction)(DuplicateSelectionAction);
    (0, editorExtensions_1.registerEditorAction)(MoveLinesUpAction);
    (0, editorExtensions_1.registerEditorAction)(MoveLinesDownAction);
    (0, editorExtensions_1.registerEditorAction)(SortLinesAscendingAction);
    (0, editorExtensions_1.registerEditorAction)(SortLinesDescendingAction);
    (0, editorExtensions_1.registerEditorAction)(DeleteDuplicateLinesAction);
    (0, editorExtensions_1.registerEditorAction)(TrimTrailingWhitespaceAction);
    (0, editorExtensions_1.registerEditorAction)(DeleteLinesAction);
    (0, editorExtensions_1.registerEditorAction)(IndentLinesAction);
    (0, editorExtensions_1.registerEditorAction)(OutdentLinesAction);
    (0, editorExtensions_1.registerEditorAction)(InsertLineBeforeAction);
    (0, editorExtensions_1.registerEditorAction)(InsertLineAfterAction);
    (0, editorExtensions_1.registerEditorAction)(DeleteAllLeftAction);
    (0, editorExtensions_1.registerEditorAction)(DeleteAllRightAction);
    (0, editorExtensions_1.registerEditorAction)(JoinLinesAction);
    (0, editorExtensions_1.registerEditorAction)(TransposeAction);
    (0, editorExtensions_1.registerEditorAction)(UpperCaseAction);
    (0, editorExtensions_1.registerEditorAction)(LowerCaseAction);
    if (SnakeCaseAction.caseBoundary.isSupported() && SnakeCaseAction.singleLetters.isSupported()) {
        (0, editorExtensions_1.registerEditorAction)(SnakeCaseAction);
    }
    if (CamelCaseAction.wordBoundary.isSupported()) {
        (0, editorExtensions_1.registerEditorAction)(CamelCaseAction);
    }
    if (TitleCaseAction.titleBoundary.isSupported()) {
        (0, editorExtensions_1.registerEditorAction)(TitleCaseAction);
    }
    if (KebabCaseAction.isSupported()) {
        (0, editorExtensions_1.registerEditorAction)(KebabCaseAction);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZXNPcGVyYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvbGluZXNPcGVyYXRpb25zL2Jyb3dzZXIvbGluZXNPcGVyYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXlCaEcsYUFBYTtJQUViLE1BQWUsdUJBQXdCLFNBQVEsK0JBQVk7UUFJMUQsWUFBWSxJQUFhLEVBQUUsSUFBb0I7WUFDOUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1osSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDbEIsQ0FBQztRQUVNLEdBQUcsQ0FBQyxTQUEyQixFQUFFLE1BQW1CO1lBQzFELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ3ZCLE9BQU87YUFDUDtZQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxhQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUVwRiwrREFBK0Q7WUFDL0QsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMzQyxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsQ0FB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