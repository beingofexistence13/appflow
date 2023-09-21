/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages/modesRegistry", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange", "vs/nls"], function (require, exports, bulkEditService_1, position_1, range_1, modesRegistry_1, bulkCellEdits_1, notebookBrowser_1, notebookCellTextModel_1, notebookCommon_1, notebookRange_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.insertCellAtIndex = exports.insertCell = exports.computeCellLinesContents = exports.joinCellsWithSurrounds = exports.joinNotebookCells = exports.joinSelectedCells = exports.copyCellRange = exports.moveCellRange = exports.runDeleteAction = exports.changeCellToKind = void 0;
    async function changeCellToKind(kind, context, language, mime) {
        const { notebookEditor } = context;
        if (!notebookEditor.hasModel()) {
            return;
        }
        if (notebookEditor.isReadOnly) {
            return;
        }
        if (context.ui && context.cell) {
            // action from UI
            const { cell } = context;
            if (cell.cellKind === kind) {
                return;
            }
            const text = cell.getText();
            const idx = notebookEditor.getCellIndex(cell);
            if (language === undefined) {
                const availableLanguages = notebookEditor.activeKernel?.supportedLanguages ?? [];
                language = availableLanguages[0] ?? modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
            }
            notebookEditor.textModel.applyEdits([
                {
                    editType: 1 /* CellEditType.Replace */,
                    index: idx,
                    count: 1,
                    cells: [{
                            cellKind: kind,
                            source: text,
                            language: language,
                            mime: mime ?? cell.mime,
                            outputs: cell.model.outputs,
                            metadata: cell.metadata,
                        }]
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: notebookEditor.getFocus(),
                selections: notebookEditor.getSelections()
            }, () => {
                return {
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: notebookEditor.getFocus(),
                    selections: notebookEditor.getSelections()
                };
            }, undefined, true);
            const newCell = notebookEditor.cellAt(idx);
            await notebookEditor.focusNotebookCell(newCell, cell.getEditState() === notebookBrowser_1.CellEditState.Editing ? 'editor' : 'container');
        }
        else if (context.selectedCells) {
            const selectedCells = context.selectedCells;
            const rawEdits = [];
            selectedCells.forEach(cell => {
                if (cell.cellKind === kind) {
                    return;
                }
                const text = cell.getText();
                const idx = notebookEditor.getCellIndex(cell);
                if (language === undefined) {
                    const availableLanguages = notebookEditor.activeKernel?.supportedLanguages ?? [];
                    language = availableLanguages[0] ?? modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
                }
                rawEdits.push({
                    editType: 1 /* CellEditType.Replace */,
                    index: idx,
                    count: 1,
                    cells: [{
                            cellKind: kind,
                            source: text,
                            language: language,
                            mime: mime ?? cell.mime,
                            outputs: cell.model.outputs,
                            metadata: cell.metadata,
                        }]
                });
            });
            notebookEditor.textModel.applyEdits(rawEdits, true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: notebookEditor.getFocus(),
                selections: notebookEditor.getSelections()
            }, () => {
                return {
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: notebookEditor.getFocus(),
                    selections: notebookEditor.getSelections()
                };
            }, undefined, true);
        }
    }
    exports.changeCellToKind = changeCellToKind;
    function runDeleteAction(editor, cell) {
        const textModel = editor.textModel;
        const selections = editor.getSelections();
        const targetCellIndex = editor.getCellIndex(cell);
        const containingSelection = selections.find(selection => selection.start <= targetCellIndex && targetCellIndex < selection.end);
        const computeUndoRedo = !editor.isReadOnly || textModel.viewType === 'interactive';
        if (containingSelection) {
            const edits = selections.reverse().map(selection => ({
                editType: 1 /* CellEditType.Replace */, index: selection.start, count: selection.end - selection.start, cells: []
            }));
            const nextCellAfterContainingSelection = containingSelection.end >= editor.getLength() ? undefined : editor.cellAt(containingSelection.end);
            textModel.applyEdits(edits, true, { kind: notebookCommon_1.SelectionStateType.Index, focus: editor.getFocus(), selections: editor.getSelections() }, () => {
                if (nextCellAfterContainingSelection) {
                    const cellIndex = textModel.cells.findIndex(cell => cell.handle === nextCellAfterContainingSelection.handle);
                    return { kind: notebookCommon_1.SelectionStateType.Index, focus: { start: cellIndex, end: cellIndex + 1 }, selections: [{ start: cellIndex, end: cellIndex + 1 }] };
                }
                else {
                    if (textModel.length) {
                        const lastCellIndex = textModel.length - 1;
                        return { kind: notebookCommon_1.SelectionStateType.Index, focus: { start: lastCellIndex, end: lastCellIndex + 1 }, selections: [{ start: lastCellIndex, end: lastCellIndex + 1 }] };
                    }
                    else {
                        return { kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 0 }, selections: [{ start: 0, end: 0 }] };
                    }
                }
            }, undefined, computeUndoRedo);
        }
        else {
            const focus = editor.getFocus();
            const edits = [{
                    editType: 1 /* CellEditType.Replace */, index: targetCellIndex, count: 1, cells: []
                }];
            const finalSelections = [];
            for (let i = 0; i < selections.length; i++) {
                const selection = selections[i];
                if (selection.end <= targetCellIndex) {
                    finalSelections.push(selection);
                }
                else if (selection.start > targetCellIndex) {
                    finalSelections.push({ start: selection.start - 1, end: selection.end - 1 });
                }
                else {
                    finalSelections.push({ start: targetCellIndex, end: targetCellIndex + 1 });
                }
            }
            if (editor.cellAt(focus.start) === cell) {
                // focus is the target, focus is also not part of any selection
                const newFocus = focus.end === textModel.length ? { start: focus.start - 1, end: focus.end - 1 } : focus;
                textModel.applyEdits(edits, true, { kind: notebookCommon_1.SelectionStateType.Index, focus: editor.getFocus(), selections: editor.getSelections() }, () => ({
                    kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: finalSelections
                }), undefined, computeUndoRedo);
            }
            else {
                // users decide to delete a cell out of current focus/selection
                const newFocus = focus.start > targetCellIndex ? { start: focus.start - 1, end: focus.end - 1 } : focus;
                textModel.applyEdits(edits, true, { kind: notebookCommon_1.SelectionStateType.Index, focus: editor.getFocus(), selections: editor.getSelections() }, () => ({
                    kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: finalSelections
                }), undefined, computeUndoRedo);
            }
        }
    }
    exports.runDeleteAction = runDeleteAction;
    async function moveCellRange(context, direction) {
        if (!context.notebookEditor.hasModel()) {
            return;
        }
        const editor = context.notebookEditor;
        const textModel = editor.textModel;
        if (editor.isReadOnly) {
            return;
        }
        const selections = editor.getSelections();
        const modelRanges = (0, notebookBrowser_1.expandCellRangesWithHiddenCells)(editor, selections);
        const range = modelRanges[0];
        if (!range || range.start === range.end) {
            return;
        }
        if (direction === 'up') {
            if (range.start === 0) {
                return;
            }
            const indexAbove = range.start - 1;
            const finalSelection = { start: range.start - 1, end: range.end - 1 };
            const focus = context.notebookEditor.getFocus();
            const newFocus = (0, notebookRange_1.cellRangeContains)(range, focus) ? { start: focus.start - 1, end: focus.end - 1 } : { start: range.start - 1, end: range.start };
            textModel.applyEdits([
                {
                    editType: 6 /* CellEditType.Move */,
                    index: indexAbove,
                    length: 1,
                    newIdx: range.end - 1
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: editor.getFocus(),
                selections: editor.getSelections()
            }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: [finalSelection] }), undefined, true);
            const focusRange = editor.getSelections()[0] ?? editor.getFocus();
            editor.revealCellRangeInView(focusRange);
        }
        else {
            if (range.end >= textModel.length) {
                return;
            }
            const indexBelow = range.end;
            const finalSelection = { start: range.start + 1, end: range.end + 1 };
            const focus = editor.getFocus();
            const newFocus = (0, notebookRange_1.cellRangeContains)(range, focus) ? { start: focus.start + 1, end: focus.end + 1 } : { start: range.start + 1, end: range.start + 2 };
            textModel.applyEdits([
                {
                    editType: 6 /* CellEditType.Move */,
                    index: indexBelow,
                    length: 1,
                    newIdx: range.start
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: editor.getFocus(),
                selections: editor.getSelections()
            }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: [finalSelection] }), undefined, true);
            const focusRange = editor.getSelections()[0] ?? editor.getFocus();
            editor.revealCellRangeInView(focusRange);
        }
    }
    exports.moveCellRange = moveCellRange;
    async function copyCellRange(context, direction) {
        const editor = context.notebookEditor;
        if (!editor.hasModel()) {
            return;
        }
        const textModel = editor.textModel;
        if (editor.isReadOnly) {
            return;
        }
        let range = undefined;
        if (context.ui) {
            const targetCell = context.cell;
            const targetCellIndex = editor.getCellIndex(targetCell);
            range = { start: targetCellIndex, end: targetCellIndex + 1 };
        }
        else {
            const selections = editor.getSelections();
            const modelRanges = (0, notebookBrowser_1.expandCellRangesWithHiddenCells)(editor, selections);
            range = modelRanges[0];
        }
        if (!range || range.start === range.end) {
            return;
        }
        if (direction === 'up') {
            // insert up, without changing focus and selections
            const focus = editor.getFocus();
            const selections = editor.getSelections();
            textModel.applyEdits([
                {
                    editType: 1 /* CellEditType.Replace */,
                    index: range.end,
                    count: 0,
                    cells: (0, notebookRange_1.cellRangesToIndexes)([range]).map(index => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(editor.cellAt(index).model))
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: focus,
                selections: selections
            }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: focus, selections: selections }), undefined, true);
        }
        else {
            // insert down, move selections
            const focus = editor.getFocus();
            const selections = editor.getSelections();
            const newCells = (0, notebookRange_1.cellRangesToIndexes)([range]).map(index => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(editor.cellAt(index).model));
            const countDelta = newCells.length;
            const newFocus = context.ui ? focus : { start: focus.start + countDelta, end: focus.end + countDelta };
            const newSelections = context.ui ? selections : [{ start: range.start + countDelta, end: range.end + countDelta }];
            textModel.applyEdits([
                {
                    editType: 1 /* CellEditType.Replace */,
                    index: range.end,
                    count: 0,
                    cells: (0, notebookRange_1.cellRangesToIndexes)([range]).map(index => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(editor.cellAt(index).model))
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: focus,
                selections: selections
            }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: newSelections }), undefined, true);
            const focusRange = editor.getSelections()[0] ?? editor.getFocus();
            editor.revealCellRangeInView(focusRange);
        }
    }
    exports.copyCellRange = copyCellRange;
    async function joinSelectedCells(bulkEditService, notificationService, context) {
        const editor = context.notebookEditor;
        if (editor.isReadOnly) {
            return;
        }
        const edits = [];
        const cells = [];
        for (const selection of editor.getSelections()) {
            cells.push(...editor.getCellsInRange(selection));
        }
        if (cells.length <= 1) {
            return;
        }
        // check if all cells are of the same kind
        const cellKind = cells[0].cellKind;
        const isSameKind = cells.every(cell => cell.cellKind === cellKind);
        if (!isSameKind) {
            // cannot join cells of different kinds
            // show warning and quit
            const message = (0, nls_1.localize)('notebookActions.joinSelectedCells', "Cannot join cells of different kinds");
            return notificationService.warn(message);
        }
        // merge all cells content into first cell
        const firstCell = cells[0];
        const insertContent = cells.map(cell => cell.getText()).join(firstCell.textBuffer.getEOL());
        const firstSelection = editor.getSelections()[0];
        edits.push(new bulkCellEdits_1.ResourceNotebookCellEdit(editor.textModel.uri, {
            editType: 1 /* CellEditType.Replace */,
            index: firstSelection.start,
            count: firstSelection.end - firstSelection.start,
            cells: [{
                    cellKind: firstCell.cellKind,
                    source: insertContent,
                    language: firstCell.language,
                    mime: firstCell.mime,
                    outputs: firstCell.model.outputs,
                    metadata: firstCell.metadata,
                }]
        }));
        for (const selection of editor.getSelections().slice(1)) {
            edits.push(new bulkCellEdits_1.ResourceNotebookCellEdit(editor.textModel.uri, {
                editType: 1 /* CellEditType.Replace */,
                index: selection.start,
                count: selection.end - selection.start,
                cells: []
            }));
        }
        if (edits.length) {
            await bulkEditService.apply(edits, { quotableLabel: (0, nls_1.localize)('notebookActions.joinSelectedCells.label', "Join Notebook Cells") });
        }
    }
    exports.joinSelectedCells = joinSelectedCells;
    async function joinNotebookCells(editor, range, direction, constraint) {
        if (editor.isReadOnly) {
            return null;
        }
        const textModel = editor.textModel;
        const cells = editor.getCellsInRange(range);
        if (!cells.length) {
            return null;
        }
        if (range.start === 0 && direction === 'above') {
            return null;
        }
        if (range.end === textModel.length && direction === 'below') {
            return null;
        }
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (constraint && cell.cellKind !== constraint) {
                return null;
            }
        }
        if (direction === 'above') {
            const above = editor.cellAt(range.start - 1);
            if (constraint && above.cellKind !== constraint) {
                return null;
            }
            const insertContent = cells.map(cell => (cell.textBuffer.getEOL() ?? '') + cell.getText()).join('');
            const aboveCellLineCount = above.textBuffer.getLineCount();
            const aboveCellLastLineEndColumn = above.textBuffer.getLineLength(aboveCellLineCount);
            return {
                edits: [
                    new bulkEditService_1.ResourceTextEdit(above.uri, { range: new range_1.Range(aboveCellLineCount, aboveCellLastLineEndColumn + 1, aboveCellLineCount, aboveCellLastLineEndColumn + 1), text: insertContent }),
                    new bulkCellEdits_1.ResourceNotebookCellEdit(textModel.uri, {
                        editType: 1 /* CellEditType.Replace */,
                        index: range.start,
                        count: range.end - range.start,
                        cells: []
                    })
                ],
                cell: above,
                endFocus: { start: range.start - 1, end: range.start },
                endSelections: [{ start: range.start - 1, end: range.start }]
            };
        }
        else {
            const below = editor.cellAt(range.end);
            if (constraint && below.cellKind !== constraint) {
                return null;
            }
            const cell = cells[0];
            const restCells = [...cells.slice(1), below];
            const insertContent = restCells.map(cl => (cl.textBuffer.getEOL() ?? '') + cl.getText()).join('');
            const cellLineCount = cell.textBuffer.getLineCount();
            const cellLastLineEndColumn = cell.textBuffer.getLineLength(cellLineCount);
            return {
                edits: [
                    new bulkEditService_1.ResourceTextEdit(cell.uri, { range: new range_1.Range(cellLineCount, cellLastLineEndColumn + 1, cellLineCount, cellLastLineEndColumn + 1), text: insertContent }),
                    new bulkCellEdits_1.ResourceNotebookCellEdit(textModel.uri, {
                        editType: 1 /* CellEditType.Replace */,
                        index: range.start + 1,
                        count: range.end - range.start,
                        cells: []
                    })
                ],
                cell,
                endFocus: { start: range.start, end: range.start + 1 },
                endSelections: [{ start: range.start, end: range.start + 1 }]
            };
        }
    }
    exports.joinNotebookCells = joinNotebookCells;
    async function joinCellsWithSurrounds(bulkEditService, context, direction) {
        const editor = context.notebookEditor;
        const textModel = editor.textModel;
        const viewModel = editor.getViewModel();
        let ret = null;
        if (context.ui) {
            const focusMode = context.cell.focusMode;
            const cellIndex = editor.getCellIndex(context.cell);
            ret = await joinNotebookCells(editor, { start: cellIndex, end: cellIndex + 1 }, direction);
            if (!ret) {
                return;
            }
            await bulkEditService.apply(ret?.edits, { quotableLabel: 'Join Notebook Cells' });
            viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: ret.endFocus, selections: ret.endSelections });
            ret.cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'joinCellsWithSurrounds');
            editor.revealCellRangeInView(editor.getFocus());
            if (focusMode === notebookBrowser_1.CellFocusMode.Editor) {
                ret.cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
            }
        }
        else {
            const selections = editor.getSelections();
            if (!selections.length) {
                return;
            }
            const focus = editor.getFocus();
            const focusMode = editor.cellAt(focus.start)?.focusMode;
            const edits = [];
            let cell = null;
            const cells = [];
            for (let i = selections.length - 1; i >= 0; i--) {
                const selection = selections[i];
                const containFocus = (0, notebookRange_1.cellRangeContains)(selection, focus);
                if (selection.end >= textModel.length && direction === 'below'
                    || selection.start === 0 && direction === 'above') {
                    if (containFocus) {
                        cell = editor.cellAt(focus.start);
                    }
                    cells.push(...editor.getCellsInRange(selection));
                    continue;
                }
                const singleRet = await joinNotebookCells(editor, selection, direction);
                if (!singleRet) {
                    return;
                }
                edits.push(...singleRet.edits);
                cells.push(singleRet.cell);
                if (containFocus) {
                    cell = singleRet.cell;
                }
            }
            if (!edits.length) {
                return;
            }
            if (!cell || !cells.length) {
                return;
            }
            await bulkEditService.apply(edits, { quotableLabel: 'Join Notebook Cells' });
            cells.forEach(cell => {
                cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'joinCellsWithSurrounds');
            });
            viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Handle, primary: cell.handle, selections: cells.map(cell => cell.handle) });
            editor.revealCellRangeInView(editor.getFocus());
            const newFocusedCell = editor.cellAt(editor.getFocus().start);
            if (focusMode === notebookBrowser_1.CellFocusMode.Editor && newFocusedCell) {
                newFocusedCell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
            }
        }
    }
    exports.joinCellsWithSurrounds = joinCellsWithSurrounds;
    function _splitPointsToBoundaries(splitPoints, textBuffer) {
        const boundaries = [];
        const lineCnt = textBuffer.getLineCount();
        const getLineLen = (lineNumber) => {
            return textBuffer.getLineLength(lineNumber);
        };
        // split points need to be sorted
        splitPoints = splitPoints.sort((l, r) => {
            const lineDiff = l.lineNumber - r.lineNumber;
            const columnDiff = l.column - r.column;
            return lineDiff !== 0 ? lineDiff : columnDiff;
        });
        for (let sp of splitPoints) {
            if (getLineLen(sp.lineNumber) + 1 === sp.column && sp.column !== 1 /** empty line */ && sp.lineNumber < lineCnt) {
                sp = new position_1.Position(sp.lineNumber + 1, 1);
            }
            _pushIfAbsent(boundaries, sp);
        }
        if (boundaries.length === 0) {
            return null;
        }
        // boundaries already sorted and not empty
        const modelStart = new position_1.Position(1, 1);
        const modelEnd = new position_1.Position(lineCnt, getLineLen(lineCnt) + 1);
        return [modelStart, ...boundaries, modelEnd];
    }
    function _pushIfAbsent(positions, p) {
        const last = positions.length > 0 ? positions[positions.length - 1] : undefined;
        if (!last || last.lineNumber !== p.lineNumber || last.column !== p.column) {
            positions.push(p);
        }
    }
    function computeCellLinesContents(cell, splitPoints) {
        const rangeBoundaries = _splitPointsToBoundaries(splitPoints, cell.textBuffer);
        if (!rangeBoundaries) {
            return null;
        }
        const newLineModels = [];
        for (let i = 1; i < rangeBoundaries.length; i++) {
            const start = rangeBoundaries[i - 1];
            const end = rangeBoundaries[i];
            newLineModels.push(cell.textBuffer.getValueInRange(new range_1.Range(start.lineNumber, start.column, end.lineNumber, end.column), 0 /* EndOfLinePreference.TextDefined */));
        }
        return newLineModels;
    }
    exports.computeCellLinesContents = computeCellLinesContents;
    function insertCell(languageService, editor, index, type, direction = 'above', initialText = '', ui = false) {
        const viewModel = editor.getViewModel();
        const activeKernel = editor.activeKernel;
        if (viewModel.options.isReadOnly) {
            return null;
        }
        const cell = editor.cellAt(index);
        const nextIndex = ui ? viewModel.getNextVisibleCellIndex(index) : index + 1;
        let language;
        if (type === notebookCommon_1.CellKind.Code) {
            const supportedLanguages = activeKernel?.supportedLanguages ?? languageService.getRegisteredLanguageIds();
            const defaultLanguage = supportedLanguages[0] || modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
            if (cell?.cellKind === notebookCommon_1.CellKind.Code) {
                language = cell.language;
            }
            else if (cell?.cellKind === notebookCommon_1.CellKind.Markup) {
                const nearestCodeCellIndex = viewModel.nearestCodeCellIndex(index);
                if (nearestCodeCellIndex > -1) {
                    language = viewModel.cellAt(nearestCodeCellIndex).language;
                }
                else {
                    language = defaultLanguage;
                }
            }
            else {
                if (cell === undefined && direction === 'above') {
                    // insert cell at the very top
                    language = viewModel.viewCells.find(cell => cell.cellKind === notebookCommon_1.CellKind.Code)?.language || defaultLanguage;
                }
                else {
                    language = defaultLanguage;
                }
            }
            if (!supportedLanguages.includes(language)) {
                // the language no longer exists
                language = defaultLanguage;
            }
        }
        else {
            language = 'markdown';
        }
        const insertIndex = cell ?
            (direction === 'above' ? index : nextIndex) :
            index;
        return insertCellAtIndex(viewModel, insertIndex, initialText, language, type, undefined, [], true, true);
    }
    exports.insertCell = insertCell;
    function insertCellAtIndex(viewModel, index, source, language, type, metadata, outputs, synchronous, pushUndoStop) {
        const endSelections = { kind: notebookCommon_1.SelectionStateType.Index, focus: { start: index, end: index + 1 }, selections: [{ start: index, end: index + 1 }] };
        viewModel.notebookDocument.applyEdits([
            {
                editType: 1 /* CellEditType.Replace */,
                index,
                count: 0,
                cells: [
                    {
                        cellKind: type,
                        language: language,
                        mime: undefined,
                        outputs: outputs,
                        metadata: metadata,
                        source: source
                    }
                ]
            }
        ], synchronous, { kind: notebookCommon_1.SelectionStateType.Index, focus: viewModel.getFocus(), selections: viewModel.getSelections() }, () => endSelections, undefined, pushUndoStop && !viewModel.options.isReadOnly);
        return viewModel.cellAt(index);
    }
    exports.insertCellAtIndex = insertCellAtIndex;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbE9wZXJhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyb2xsZXIvY2VsbE9wZXJhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0J6RixLQUFLLFVBQVUsZ0JBQWdCLENBQUMsSUFBYyxFQUFFLE9BQStCLEVBQUUsUUFBaUIsRUFBRSxJQUFhO1FBQ3ZILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDbkMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUMvQixPQUFPO1NBQ1A7UUFFRCxJQUFJLGNBQWMsQ0FBQyxVQUFVLEVBQUU7WUFDOUIsT0FBTztTQUNQO1FBRUQsSUFBSSxPQUFPLENBQUMsRUFBRSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDL0IsaUJBQWlCO1lBQ2pCLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUM7WUFFekIsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtnQkFDM0IsT0FBTzthQUNQO1lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzVCLE1BQU0sR0FBRyxHQUFHLGNBQWMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFOUMsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO2dCQUMzQixNQUFNLGtCQUFrQixHQUFHLGNBQWMsQ0FBQyxZQUFZLEVBQUUsa0JBQWtCLElBQUksRUFBRSxDQUFDO2dCQUNqRixRQUFRLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLElBQUkscUNBQXFCLENBQUM7YUFDMUQ7WUFFRCxjQUFjLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQztnQkFDbkM7b0JBQ0MsUUFBUSw4QkFBc0I7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