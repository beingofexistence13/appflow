/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/browser/widget/diffEditor/diffEditorViewModel", "vs/editor/common/core/lineRange", "vs/editor/common/diff/rangeMapping"], function (require, exports, assert, utils_1, diffEditorViewModel_1, lineRange_1, rangeMapping_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('DiffEditorWidget2', () => {
        (0, utils_1.$bT)();
        suite('UnchangedRegion', () => {
            function serialize(regions) {
                return regions.map(r => `${r.originalUnchangedRange} - ${r.modifiedUnchangedRange}`);
            }
            test('Everything changed', () => {
                assert.deepStrictEqual(serialize(diffEditorViewModel_1.$pZ.fromDiffs([new rangeMapping_1.$ws(new lineRange_1.$ts(1, 10), new lineRange_1.$ts(1, 10), [])], 10, 10, 3, 3)), []);
            });
            test('Nothing changed', () => {
                assert.deepStrictEqual(serialize(diffEditorViewModel_1.$pZ.fromDiffs([], 10, 10, 3, 3)), [
                    "[1,11) - [1,11)"
                ]);
            });
            test('Change in the middle', () => {
                assert.deepStrictEqual(serialize(diffEditorViewModel_1.$pZ.fromDiffs([new rangeMapping_1.$ws(new lineRange_1.$ts(50, 60), new lineRange_1.$ts(50, 60), [])], 100, 100, 3, 3)), ([
                    '[1,47) - [1,47)',
                    '[63,101) - [63,101)'
                ]));
            });
            test('Change at the end', () => {
                assert.deepStrictEqual(serialize(diffEditorViewModel_1.$pZ.fromDiffs([new rangeMapping_1.$ws(new lineRange_1.$ts(99, 100), new lineRange_1.$ts(100, 100), [])], 100, 100, 3, 3)), (["[1,96) - [1,96)"]));
            });
        });
    });
});
//# sourceMappingURL=diffEditorWidget.test.js.map