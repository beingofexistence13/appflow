/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/notebook/browser/view/cellParts/cellDnd", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor", "assert"], function (require, exports, cellDnd_1, notebookCommon_1, testNotebookEditor_1, assert) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function testCellDnd(beginning, dragAction, end) {
        await (0, testNotebookEditor_1.withTestNotebook)(beginning.startOrder.map(text => [text, 'plaintext', notebookCommon_1.CellKind.Code, []]), (editor, viewModel) => {
            editor.setSelections(beginning.selections);
            editor.setFocus({ start: beginning.focus, end: beginning.focus + 1 });
            (0, cellDnd_1.performCellDropEdits)(editor, viewModel.cellAt(dragAction.dragIdx), dragAction.direction, viewModel.cellAt(dragAction.dragOverIdx));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbERuZC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svdGVzdC9icm93c2VyL2NlbGxEbmQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQTBCaEcsS0FBSyxVQUFVLFdBQVcsQ0FBQyxTQUEwQixFQUFFLFVBQXVCLEVBQUUsR0FBYztRQUM3RixNQUFNLElBQUEscUNBQWdCLEVBQ3JCLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLHlCQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQ3hFLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFO1lBQ3JCLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLElBQUEsOEJBQW9CLEVBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBRSxFQUFFLFVBQVUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFFLENBQUMsQ0FBQztZQUVySSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUU7Z0JBQzdCLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7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