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
//# sourceMappingURL=notebookBrowser.test.js.map