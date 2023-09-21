/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, assert, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Return a set of ranges for the cells matching the given predicate
     */
    function getRanges(cells, included) {
        const ranges = [];
        let currentRange;
        cells.forEach((cell, idx) => {
            if (included(cell)) {
                if (!currentRange) {
                    currentRange = { start: idx, end: idx + 1 };
                    ranges.push(currentRange);
                }
                else {
                    currentRange.end = idx + 1;
                }
            }
            else {
                currentRange = undefined;
            }
        });
        return ranges;
    }
    suite('notebookBrowser', () => {
        suite('getRanges', function () {
            const predicate = (cell) => cell.cellKind === notebookCommon_1.CellKind.Code;
            test('all code', function () {
                const cells = [
                    { cellKind: notebookCommon_1.CellKind.Code },
                    { cellKind: notebookCommon_1.CellKind.Code },
                ];
                assert.deepStrictEqual(getRanges(cells, predicate), [{ start: 0, end: 2 }]);
            });
            test('none code', function () {
                const cells = [
                    { cellKind: notebookCommon_1.CellKind.Markup },
                    { cellKind: notebookCommon_1.CellKind.Markup },
                ];
                assert.deepStrictEqual(getRanges(cells, predicate), []);
            });
            test('start code', function () {
                const cells = [
                    { cellKind: notebookCommon_1.CellKind.Code },
                    { cellKind: notebookCommon_1.CellKind.Markup },
                ];
                assert.deepStrictEqual(getRanges(cells, predicate), [{ start: 0, end: 1 }]);
            });
            test('random', function () {
                const cells = [
                    { cellKind: notebookCommon_1.CellKind.Code },
                    { cellKind: notebookCommon_1.CellKind.Code },
                    { cellKind: notebookCommon_1.CellKind.Markup },
                    { cellKind: notebookCommon_1.CellKind.Code },
                    { cellKind: notebookCommon_1.CellKind.Markup },
                    { cellKind: notebookCommon_1.CellKind.Markup },
                    { cellKind: notebookCommon_1.CellKind.Code },
                ];
                assert.deepStrictEqual(getRanges(cells, predicate), [{ start: 0, end: 2 }, { start: 3, end: 4 }, { start: 6, end: 7 }]);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tCcm93c2VyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay90ZXN0L2Jyb3dzZXIvbm90ZWJvb2tCcm93c2VyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFPaEc7O09BRUc7SUFDSCxTQUFTLFNBQVMsQ0FBQyxLQUF1QixFQUFFLFFBQTJDO1FBQ3RGLE1BQU0sTUFBTSxHQUFpQixFQUFFLENBQUM7UUFDaEMsSUFBSSxZQUFvQyxDQUFDO1FBRXpDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDM0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxZQUFZLEVBQUU7b0JBQ2xCLFlBQVksR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDNUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDMUI7cUJBQU07b0JBQ04sWUFBWSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2lCQUMzQjthQUNEO2lCQUFNO2dCQUNOLFlBQVksR0FBRyxTQUFTLENBQUM7YUFDekI7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUdELEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7UUFDN0IsS0FBSyxDQUFDLFdBQVcsRUFBRTtZQUNsQixNQUFNLFNBQVMsR0FBRyxDQUFDLElBQW9CLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUsseUJBQVEsQ0FBQyxJQUFJLENBQUM7WUFFNUUsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDaEIsTUFBTSxLQUFLLEdBQUc7b0JBQ2IsRUFBRSxRQUFRLEVBQUUseUJBQVEsQ0FBQyxJQUFJLEVBQUU7b0JBQzNCLEVBQUUsUUFBUSxFQUFFLHlCQUFRLENBQUMsSUFBSSxFQUFFO2lCQUMzQixDQUFDO2dCQUNGLE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEtBQXlCLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2pCLE1BQU0sS0FBSyxHQUFHO29CQUNiLEVBQUUsUUFBUSxFQUFFLHlCQUFRLENBQUMsTUFBTSxFQUFFO29CQUM3QixFQUFFLFFBQVEsRUFBRSx5QkFBUSxDQUFDLE1BQU0sRUFBRTtpQkFDN0IsQ0FBQztnQkFDRixNQUFNLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxLQUF5QixFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzdFLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbEIsTUFBTSxLQUFLLEdBQUc7b0JBQ2IsRUFBRSxRQUFRLEVBQUUseUJBQVEsQ0FBQyxJQUFJLEVBQUU7b0JBQzNCLEVBQUUsUUFBUSxFQUFFLHlCQUFRLENBQUMsTUFBTSxFQUFFO2lCQUM3QixDQUFDO2dCQUNGLE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEtBQXlCLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2QsTUFBTSxLQUFLLEdBQUc7b0JBQ2IsRUFBRSxRQUFRLEVBQUUseUJBQVEsQ0FBQyxJQUFJLEVBQUU7b0JBQzNCLEVBQUUsUUFBUSxFQUFFLHlCQUFRLENBQUMsSUFBSSxFQUFFO29CQUMzQixFQUFFLFFBQVEsRUFBRSx5QkFBUSxDQUFDLE1BQU0sRUFBRTtvQkFDN0IsRUFBRSxRQUFRLEVBQUUseUJBQVEsQ0FBQyxJQUFJLEVBQUU7b0JBQzNCLEVBQUUsUUFBUSxFQUFFLHlCQUFRLENBQUMsTUFBTSxFQUFFO29CQUM3QixFQUFFLFFBQVEsRUFBRSx5QkFBUSxDQUFDLE1BQU0sRUFBRTtvQkFDN0IsRUFBRSxRQUFRLEVBQUUseUJBQVEsQ0FBQyxJQUFJLEVBQUU7aUJBQzNCLENBQUM7Z0JBQ0YsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsS0FBeUIsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3SSxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==