/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/notebook/browser/view/cellParts/cellDnd", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor", "assert"], function (require, exports, cellDnd_1, notebookCommon_1, testNotebookEditor_1, assert) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function testCellDnd(beginning, dragAction, end) {
        await (0, testNotebookEditor_1.$Lfc)(beginning.startOrder.map(text => [text, 'plaintext', notebookCommon_1.CellKind.Code, []]), (editor, viewModel) => {
            editor.setSelections(beginning.selections);
            editor.setFocus({ start: beginning.focus, end: beginning.focus + 1 });
            (0, cellDnd_1.$Dob)(editor, viewModel.cellAt(dragAction.dragIdx), dragAction.direction, viewModel.cellAt(dragAction.dragOverIdx));
            for (const i in end.endOrder) {
                assert.equal(viewModel.viewCells[i].getText(), end.endOrder[i]);
            }
            assert.equal(editor.getSelections().length, 1);
            assert.deepStrictEqual(editor.getSelections()[0], end.selection);
            assert.deepStrictEqual(editor.getFocus(), { start: end.focus, end: end.focus + 1 });
        });
    }
    suite('cellDND', () => {
        test('drag 1 cell', async () => {
            await testCellDnd({
                startOrder: ['0', '1', '2', '3'],
                selections: [{ start: 0, end: 1 }],
                focus: 0
            }, {
                dragIdx: 0,
                dragOverIdx: 1,
                direction: 'below'
            }, {
                endOrder: ['1', '0', '2', '3'],
                selection: { start: 1, end: 2 },
                focus: 1
            });
        });
        test('drag multiple contiguous cells down', async () => {
            await testCellDnd({
                startOrder: ['0', '1', '2', '3'],
                selections: [{ start: 1, end: 3 }],
                focus: 1
            }, {
                dragIdx: 1,
                dragOverIdx: 3,
                direction: 'below'
            }, {
                endOrder: ['0', '3', '1', '2'],
                selection: { start: 2, end: 4 },
                focus: 2
            });
        });
        test('drag multiple contiguous cells up', async () => {
            await testCellDnd({
                startOrder: ['0', '1', '2', '3'],
                selections: [{ start: 2, end: 4 }],
                focus: 2
            }, {
                dragIdx: 3,
                dragOverIdx: 0,
                direction: 'above'
            }, {
                endOrder: ['2', '3', '0', '1'],
                selection: { start: 0, end: 2 },
                focus: 0
            });
        });
        test('drag ranges down', async () => {
            await testCellDnd({
                startOrder: ['0', '1', '2', '3'],
                selections: [{ start: 0, end: 1 }, { start: 2, end: 3 }],
                focus: 0
            }, {
                dragIdx: 0,
                dragOverIdx: 3,
                direction: 'below'
            }, {
                endOrder: ['1', '3', '0', '2'],
                selection: { start: 2, end: 4 },
                focus: 2
            });
        });
        test('drag ranges up', async () => {
            await testCellDnd({
                startOrder: ['0', '1', '2', '3'],
                selections: [{ start: 1, end: 2 }, { start: 3, end: 4 }],
                focus: 1
            }, {
                dragIdx: 1,
                dragOverIdx: 0,
                direction: 'above'
            }, {
                endOrder: ['1', '3', '0', '2'],
                selection: { start: 0, end: 2 },
                focus: 0
            });
        });
        test('drag ranges between ranges', async () => {
            await testCellDnd({
                startOrder: ['0', '1', '2', '3'],
                selections: [{ start: 0, end: 1 }, { start: 3, end: 4 }],
                focus: 0
            }, {
                dragIdx: 0,
                dragOverIdx: 1,
                direction: 'below'
            }, {
                endOrder: ['1', '0', '3', '2'],
                selection: { start: 1, end: 3 },
                focus: 1
            });
        });
        test('drag ranges just above a range', async () => {
            await testCellDnd({
                startOrder: ['0', '1', '2', '3'],
                selections: [{ start: 1, end: 2 }, { start: 3, end: 4 }],
                focus: 1
            }, {
                dragIdx: 1,
                dragOverIdx: 1,
                direction: 'above'
            }, {
                endOrder: ['0', '1', '3', '2'],
                selection: { start: 1, end: 3 },
                focus: 1
            });
        });
        test('drag ranges inside a range', async () => {
            await testCellDnd({
                startOrder: ['0', '1', '2', '3'],
                selections: [{ start: 0, end: 2 }, { start: 3, end: 4 }],
                focus: 0
            }, {
                dragIdx: 0,
                dragOverIdx: 0,
                direction: 'below'
            }, {
                endOrder: ['0', '1', '3', '2'],
                selection: { start: 0, end: 3 },
                focus: 0
            });
        });
        test('dragged cell is not focused or selected', async () => {
            await testCellDnd({
                startOrder: ['0', '1', '2', '3'],
                selections: [{ start: 1, end: 2 }],
                focus: 1
            }, {
                dragIdx: 2,
                dragOverIdx: 3,
                direction: 'below'
            }, {
                endOrder: ['0', '1', '3', '2'],
                selection: { start: 3, end: 4 },
                focus: 3
            });
        });
    });
});
//# sourceMappingURL=cellDnd.test.js.map