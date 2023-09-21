/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/editor/browser/coreCommands", "vs/editor/browser/editorExtensions", "vs/editor/common/commands/replaceCommand", "vs/editor/common/commands/trimTrailingWhitespaceCommand", "vs/editor/common/cursor/cursorTypeOperations", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/contrib/linesOperations/browser/copyLinesCommand", "vs/editor/contrib/linesOperations/browser/moveLinesCommand", "vs/editor/contrib/linesOperations/browser/sortLinesCommand", "vs/nls!vs/editor/contrib/linesOperations/browser/linesOperations", "vs/platform/actions/common/actions", "vs/editor/common/languages/languageConfigurationRegistry"], function (require, exports, keyCodes_1, coreCommands_1, editorExtensions_1, replaceCommand_1, trimTrailingWhitespaceCommand_1, cursorTypeOperations_1, editOperation_1, position_1, range_1, selection_1, editorContextKeys_1, copyLinesCommand_1, moveLinesCommand_1, sortLinesCommand_1, nls, actions_1, languageConfigurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$V9 = exports.$U9 = exports.$T9 = exports.$S9 = exports.$R9 = exports.$Q9 = exports.$P9 = exports.$O9 = exports.$N9 = exports.$M9 = exports.$L9 = exports.$K9 = exports.$J9 = exports.$I9 = exports.$H9 = exports.$G9 = exports.$F9 = exports.$E9 = exports.$D9 = exports.$C9 = exports.$B9 = exports.$A9 = void 0;
    // copy lines
    class AbstractCopyLinesAction extends editorExtensions_1.$sV {
        constructor(down, opts) {
            super(opts);
            this.d = down;
        }
        run(_accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const selections = editor.getSelections().map((selection, index) => ({ selection, index, ignore: false }));
            selections.sort((a, b) => range_1.$ks.compareRangesUsingStarts(a.selection, b.selection));
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
                commands.push(new copyLinesCommand_1.$x9(selection.selection, this.d, selection.ignore));
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
                label: nls.localize(0, null),
                alias: 'Copy Line Up',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize(1, null),
                    order: 1
                }
            });
        }
    }
    class CopyLinesDownAction extends AbstractCopyLinesAction {
        constructor() {
            super(true, {
                id: 'editor.action.copyLinesDownAction',
                label: nls.localize(2, null),
                alias: 'Copy Line Down',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize(3, null),
                    order: 2
                }
            });
        }
    }
    class $A9 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.duplicateSelection',
                label: nls.localize(4, null),
                alias: 'Duplicate Selection',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize(5, null),
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
                    commands.push(new copyLinesCommand_1.$x9(selection, true));
                }
                else {
                    const insertSelection = new selection_1.$ms(selection.endLineNumber, selection.endColumn, selection.endLineNumber, selection.endColumn);
                    commands.push(new replaceCommand_1.$VV(insertSelection, model.getValueInRange(selection)));
                }
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.$A9 = $A9;
    // move lines
    class AbstractMoveLinesAction extends editorExtensions_1.$sV {
        constructor(down, opts) {
            super(opts);
            this.d = down;
        }
        run(accessor, editor) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.$2t);
            const commands = [];
            const selections = editor.getSelections() || [];
            const autoIndent = editor.getOption(12 /* EditorOption.autoIndent */);
            for (const selection of selections) {
                commands.push(new moveLinesCommand_1.$y9(selection, this.d, autoIndent, languageConfigurationService));
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
                label: nls.localize(6, null),
                alias: 'Move Line Up',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */,
                    linux: { primary: 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize(7, null),
                    order: 3
                }
            });
        }
    }
    class MoveLinesDownAction extends AbstractMoveLinesAction {
        constructor() {
            super(true, {
                id: 'editor.action.moveLinesDownAction',
                label: nls.localize(8, null),
                alias: 'Move Line Down',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */,
                    linux: { primary: 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize(9, null),
                    order: 4
                }
            });
        }
    }
    class $B9 extends editorExtensions_1.$sV {
        constructor(descending, opts) {
            super(opts);
            this.d = descending;
        }
        run(_accessor, editor) {
            const selections = editor.getSelections() || [];
            for (const selection of selections) {
                if (!sortLinesCommand_1.$z9.canRun(editor.getModel(), selection, this.d)) {
                    return;
                }
            }
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new sortLinesCommand_1.$z9(selections[i], this.d);
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.$B9 = $B9;
    class $C9 extends $B9 {
        constructor() {
            super(false, {
                id: 'editor.action.sortLinesAscending',
                label: nls.localize(10, null),
                alias: 'Sort Lines Ascending',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.$C9 = $C9;
    class $D9 extends $B9 {
        constructor() {
            super(true, {
                id: 'editor.action.sortLinesDescending',
                label: nls.localize(11, null),
                alias: 'Sort Lines Descending',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.$D9 = $D9;
    class $E9 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.removeDuplicateLines',
                label: nls.localize(12, null),
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
                const selectionToReplace = new selection_1.$ms(selection.startLineNumber, 1, selection.endLineNumber, model.getLineMaxColumn(selection.endLineNumber));
                const adjustedSelectionStart = selection.startLineNumber - linesDeleted;
                const finalSelection = new selection_1.$ms(adjustedSelectionStart, 1, adjustedSelectionStart + lines.length - 1, lines[lines.length - 1].length);
                edits.push(editOperation_1.$ls.replace(selectionToReplace, lines.join('\n')));
                endCursorState.push(finalSelection);
                linesDeleted += (selection.endLineNumber - selection.startLineNumber + 1) - lines.length;
            }
            editor.pushUndoStop();
            editor.executeEdits(this.id, edits, endCursorState);
            editor.pushUndoStop();
        }
    }
    exports.$E9 = $E9;
    class $F9 extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.trimTrailingWhitespace'; }
        constructor() {
            super({
                id: $F9.ID,
                label: nls.localize(13, null),
                alias: 'Trim Trailing Whitespace',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */),
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
                cursors = (editor.getSelections() || []).map(s => new position_1.$js(s.positionLineNumber, s.positionColumn));
            }
            const selection = editor.getSelection();
            if (selection === null) {
                return;
            }
            const command = new trimTrailingWhitespaceCommand_1.$v9(selection, cursors);
            editor.pushUndoStop();
            editor.executeCommands(this.id, [command]);
            editor.pushUndoStop();
        }
    }
    exports.$F9 = $F9;
    class $G9 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.deleteLines',
                label: nls.localize(14, null),
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
            const ops = this.d(editor);
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
                edits.push(editOperation_1.$ls.replace(new selection_1.$ms(startLineNumber, startColumn, endLineNumber, endColumn), ''));
                cursorState.push(new selection_1.$ms(startLineNumber - linesDeleted, op.positionColumn, startLineNumber - linesDeleted, op.positionColumn));
                linesDeleted += (op.endLineNumber - op.startLineNumber + 1);
            }
            editor.pushUndoStop();
            editor.executeEdits(this.id, edits, cursorState);
            editor.pushUndoStop();
        }
        d(editor) {
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
    exports.$G9 = $G9;
    class $H9 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.indentLines',
                label: nls.localize(15, null),
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
            editor.executeCommands(this.id, cursorTypeOperations_1.$dW.indent(viewModel.cursorConfig, editor.getModel(), editor.getSelections()));
            editor.pushUndoStop();
        }
    }
    exports.$H9 = $H9;
    class OutdentLinesAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.outdentLines',
                label: nls.localize(16, null),
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
    class $I9 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.insertLineBefore',
                label: nls.localize(17, null),
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
            editor.executeCommands(this.id, cursorTypeOperations_1.$dW.lineInsertBefore(viewModel.cursorConfig, editor.getModel(), editor.getSelections()));
        }
    }
    exports.$I9 = $I9;
    class $J9 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.insertLineAfter',
                label: nls.localize(18, null),
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
            editor.executeCommands(this.id, cursorTypeOperations_1.$dW.lineInsertAfter(viewModel.cursorConfig, editor.getModel(), editor.getSelections()));
        }
    }
    exports.$J9 = $J9;
    class $K9 extends editorExtensions_1.$sV {
        run(_accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const primaryCursor = editor.getSelection();
            const rangesToDelete = this.e(editor);
            // merge overlapping selections
            const effectiveRanges = [];
            for (let i = 0, count = rangesToDelete.length - 1; i < count; i++) {
                const range = rangesToDelete[i];
                const nextRange = rangesToDelete[i + 1];
                if (range_1.$ks.intersectRanges(range, nextRange) === null) {
                    effectiveRanges.push(range);
                }
                else {
                    rangesToDelete[i + 1] = range_1.$ks.plusRange(range, nextRange);
                }
            }
            effectiveRanges.push(rangesToDelete[rangesToDelete.length - 1]);
            const endCursorState = this.d(primaryCursor, effectiveRanges);
            const edits = effectiveRanges.map(range => {
                return editOperation_1.$ls.replace(range, '');
            });
            editor.pushUndoStop();
            editor.executeEdits(this.id, edits, endCursorState);
            editor.pushUndoStop();
        }
    }
    exports.$K9 = $K9;
    class $L9 extends $K9 {
        constructor() {
            super({
                id: 'deleteAllLeft',
                label: nls.localize(19, null),
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
        d(primaryCursor, rangesToDelete) {
            let endPrimaryCursor = null;
            const endCursorState = [];
            let deletedLines = 0;
            rangesToDelete.forEach(range => {
                let endCursor;
                if (range.endColumn === 1 && deletedLines > 0) {
                    const newStartLine = range.startLineNumber - deletedLines;
                    endCursor = new selection_1.$ms(newStartLine, range.startColumn, newStartLine, range.startColumn);
                }
                else {
                    endCursor = new selection_1.$ms(range.startLineNumber, range.startColumn, range.startLineNumber, range.startColumn);
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
        e(editor) {
            const selections = editor.getSelections();
            if (selections === null) {
                return [];
            }
            let rangesToDelete = selections;
            const model = editor.getModel();
            if (model === null) {
                return [];
            }
            rangesToDelete.sort(range_1.$ks.compareRangesUsingStarts);
            rangesToDelete = rangesToDelete.map(selection => {
                if (selection.isEmpty()) {
                    if (selection.startColumn === 1) {
                        const deleteFromLine = Math.max(1, selection.startLineNumber - 1);
                        const deleteFromColumn = selection.startLineNumber === 1 ? 1 : model.getLineLength(deleteFromLine) + 1;
                        return new range_1.$ks(deleteFromLine, deleteFromColumn, selection.startLineNumber, 1);
                    }
                    else {
                        return new range_1.$ks(selection.startLineNumber, 1, selection.startLineNumber, selection.startColumn);
                    }
                }
                else {
                    return new range_1.$ks(selection.startLineNumber, 1, selection.endLineNumber, selection.endColumn);
                }
            });
            return rangesToDelete;
        }
    }
    exports.$L9 = $L9;
    class $M9 extends $K9 {
        constructor() {
            super({
                id: 'deleteAllRight',
                label: nls.localize(20, null),
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
        d(primaryCursor, rangesToDelete) {
            let endPrimaryCursor = null;
            const endCursorState = [];
            for (let i = 0, len = rangesToDelete.length, offset = 0; i < len; i++) {
                const range = rangesToDelete[i];
                const endCursor = new selection_1.$ms(range.startLineNumber - offset, range.startColumn, range.startLineNumber - offset, range.startColumn);
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
        e(editor) {
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
                        return new range_1.$ks(sel.startLineNumber, sel.startColumn, sel.startLineNumber + 1, 1);
                    }
                    else {
                        return new range_1.$ks(sel.startLineNumber, sel.startColumn, sel.startLineNumber, maxColumn);
                    }
                }
                return sel;
            });
            rangesToDelete.sort(range_1.$ks.compareRangesUsingStarts);
            return rangesToDelete;
        }
    }
    exports.$M9 = $M9;
    class $N9 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.joinLines',
                label: nls.localize(21, null),
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
            selections.sort(range_1.$ks.compareRangesUsingStarts);
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
                        return new selection_1.$ms(previousValue.startLineNumber, previousValue.startColumn, currentValue.endLineNumber, currentValue.endColumn);
                    }
                }
                else {
                    if (currentValue.startLineNumber > previousValue.endLineNumber) {
                        reducedSelections.push(previousValue);
                        return currentValue;
                    }
                    else {
                        return new selection_1.$ms(previousValue.startLineNumber, previousValue.startColumn, currentValue.endLineNumber, currentValue.endColumn);
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
                const deleteSelection = new range_1.$ks(startLineNumber, startColumn, endLineNumber, endColumn);
                if (!deleteSelection.isEmpty()) {
                    let resultSelection;
                    if (selection.isEmpty()) {
                        edits.push(editOperation_1.$ls.replace(deleteSelection, trimmedLinesContent));
                        resultSelection = new selection_1.$ms(deleteSelection.startLineNumber - lineOffset, trimmedLinesContent.length - columnDeltaOffset + 1, startLineNumber - lineOffset, trimmedLinesContent.length - columnDeltaOffset + 1);
                    }
                    else {
                        if (selection.startLineNumber === selection.endLineNumber) {
                            edits.push(editOperation_1.$ls.replace(deleteSelection, trimmedLinesContent));
                            resultSelection = new selection_1.$ms(selection.startLineNumber - lineOffset, selection.startColumn, selection.endLineNumber - lineOffset, selection.endColumn);
                        }
                        else {
                            edits.push(editOperation_1.$ls.replace(deleteSelection, trimmedLinesContent));
                            resultSelection = new selection_1.$ms(selection.startLineNumber - lineOffset, selection.startColumn, selection.startLineNumber - lineOffset, trimmedLinesContent.length - selectionEndPositionOffset);
                        }
                    }
                    if (range_1.$ks.intersectRanges(deleteSelection, primaryCursor) !== null) {
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
    exports.$N9 = $N9;
    class $O9 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.transpose',
                label: nls.localize(22, null),
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
                    const deleteSelection = new range_1.$ks(cursor.lineNumber, Math.max(1, cursor.column - 1), cursor.lineNumber + 1, 1);
                    const chars = model.getValueInRange(deleteSelection).split('').reverse().join('');
                    commands.push(new replaceCommand_1.$UV(new selection_1.$ms(cursor.lineNumber, Math.max(1, cursor.column - 1), cursor.lineNumber + 1, 1), chars));
                }
                else {
                    const deleteSelection = new range_1.$ks(cursor.lineNumber, Math.max(1, cursor.column - 1), cursor.lineNumber, cursor.column + 1);
                    const chars = model.getValueInRange(deleteSelection).split('').reverse().join('');
                    commands.push(new replaceCommand_1.$YV(deleteSelection, chars, new selection_1.$ms(cursor.lineNumber, cursor.column + 1, cursor.lineNumber, cursor.column + 1)));
                }
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.$O9 = $O9;
    class $P9 extends editorExtensions_1.$sV {
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
                    const wordRange = new range_1.$ks(cursor.lineNumber, word.startColumn, cursor.lineNumber, word.endColumn);
                    const text = model.getValueInRange(wordRange);
                    textEdits.push(editOperation_1.$ls.replace(wordRange, this.d(text, wordSeparators)));
                }
                else {
                    const text = model.getValueInRange(selection);
                    textEdits.push(editOperation_1.$ls.replace(selection, this.d(text, wordSeparators)));
                }
            }
            editor.pushUndoStop();
            editor.executeEdits(this.id, textEdits);
            editor.pushUndoStop();
        }
    }
    exports.$P9 = $P9;
    class $Q9 extends $P9 {
        constructor() {
            super({
                id: 'editor.action.transformToUppercase',
                label: nls.localize(23, null),
                alias: 'Transform to Uppercase',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        d(text, wordSeparators) {
            return text.toLocaleUpperCase();
        }
    }
    exports.$Q9 = $Q9;
    class $R9 extends $P9 {
        constructor() {
            super({
                id: 'editor.action.transformToLowercase',
                label: nls.localize(24, null),
                alias: 'Transform to Lowercase',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        d(text, wordSeparators) {
            return text.toLocaleLowerCase();
        }
    }
    exports.$R9 = $R9;
    class BackwardsCompatibleRegExp {
        constructor(e, f) {
            this.e = e;
            this.f = f;
            this.c = null;
            this.d = false;
        }
        get() {
            if (!this.d) {
                this.d = true;
                try {
                    this.c = new RegExp(this.e, this.f);
                }
                catch (err) {
                    // this browser does not support this regular expression
                }
            }
            return this.c;
        }
        isSupported() {
            return (this.get() !== null);
        }
    }
    class $S9 extends $P9 {
        static { this.titleBoundary = new BackwardsCompatibleRegExp('(^|[^\\p{L}\\p{N}\']|((^|\\P{L})\'))\\p{L}', 'gmu'); }
        constructor() {
            super({
                id: 'editor.action.transformToTitlecase',
                label: nls.localize(25, null),
                alias: 'Transform to Title Case',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        d(text, wordSeparators) {
            const titleBoundary = $S9.titleBoundary.get();
            if (!titleBoundary) {
                // cannot support this
                return text;
            }
            return text
                .toLocaleLowerCase()
                .replace(titleBoundary, (b) => b.toLocaleUpperCase());
        }
    }
    exports.$S9 = $S9;
    class $T9 extends $P9 {
        static { this.caseBoundary = new BackwardsCompatibleRegExp('(\\p{Ll})(\\p{Lu})', 'gmu'); }
        static { this.singleLetters = new BackwardsCompatibleRegExp('(\\p{Lu}|\\p{N})(\\p{Lu})(\\p{Ll})', 'gmu'); }
        constructor() {
            super({
                id: 'editor.action.transformToSnakecase',
                label: nls.localize(26, null),
                alias: 'Transform to Snake Case',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        d(text, wordSeparators) {
            const caseBoundary = $T9.caseBoundary.get();
            const singleLetters = $T9.singleLetters.get();
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
    exports.$T9 = $T9;
    class $U9 extends $P9 {
        static { this.wordBoundary = new BackwardsCompatibleRegExp('[_\\s-]', 'gm'); }
        constructor() {
            super({
                id: 'editor.action.transformToCamelcase',
                label: nls.localize(27, null),
                alias: 'Transform to Camel Case',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        d(text, wordSeparators) {
            const wordBoundary = $U9.wordBoundary.get();
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
    exports.$U9 = $U9;
    class $V9 extends $P9 {
        static isSupported() {
            const areAllRegexpsSupported = [
                this.e,
                this.h,
                this.j,
            ].every((regexp) => regexp.isSupported());
            return areAllRegexpsSupported;
        }
        static { this.e = new BackwardsCompatibleRegExp('(\\p{Ll})(\\p{Lu})', 'gmu'); }
        static { this.h = new BackwardsCompatibleRegExp('(\\p{Lu}|\\p{N})(\\p{Lu}\\p{Ll})', 'gmu'); }
        static { this.j = new BackwardsCompatibleRegExp('(\\S)(_)(\\S)', 'gm'); }
        constructor() {
            super({
                id: 'editor.action.transformToKebabcase',
                label: nls.localize(28, null),
                alias: 'Transform to Kebab Case',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        d(text, _) {
            const caseBoundary = $V9.e.get();
            const singleLetters = $V9.h.get();
            const underscoreBoundary = $V9.j.get();
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
    exports.$V9 = $V9;
    (0, editorExtensions_1.$xV)(CopyLinesUpAction);
    (0, editorExtensions_1.$xV)(CopyLinesDownAction);
    (0, editorExtensions_1.$xV)($A9);
    (0, editorExtensions_1.$xV)(MoveLinesUpAction);
    (0, editorExtensions_1.$xV)(MoveLinesDownAction);
    (0, editorExtensions_1.$xV)($C9);
    (0, editorExtensions_1.$xV)($D9);
    (0, editorExtensions_1.$xV)($E9);
    (0, editorExtensions_1.$xV)($F9);
    (0, editorExtensions_1.$xV)($G9);
    (0, editorExtensions_1.$xV)($H9);
    (0, editorExtensions_1.$xV)(OutdentLinesAction);
    (0, editorExtensions_1.$xV)($I9);
    (0, editorExtensions_1.$xV)($J9);
    (0, editorExtensions_1.$xV)($L9);
    (0, editorExtensions_1.$xV)($M9);
    (0, editorExtensions_1.$xV)($N9);
    (0, editorExtensions_1.$xV)($O9);
    (0, editorExtensions_1.$xV)($Q9);
    (0, editorExtensions_1.$xV)($R9);
    if ($T9.caseBoundary.isSupported() && $T9.singleLetters.isSupported()) {
        (0, editorExtensions_1.$xV)($T9);
    }
    if ($U9.wordBoundary.isSupported()) {
        (0, editorExtensions_1.$xV)($U9);
    }
    if ($S9.titleBoundary.isSupported()) {
        (0, editorExtensions_1.$xV)($S9);
    }
    if ($V9.isSupported()) {
        (0, editorExtensions_1.$xV)($V9);
    }
});
//# sourceMappingURL=linesOperations.js.map