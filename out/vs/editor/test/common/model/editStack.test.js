/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/selection", "vs/editor/common/core/textChange", "vs/editor/common/model/editStack"], function (require, exports, assert, utils_1, selection_1, textChange_1, editStack_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditStack', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('issue #118041: unicode character undo bug', () => {
            const stackData = new editStack_1.SingleModelEditStackData(1, 2, 0 /* EndOfLineSequence.LF */, 0 /* EndOfLineSequence.LF */, [new selection_1.Selection(10, 2, 10, 2)], [new selection_1.Selection(10, 1, 10, 1)], [new textChange_1.TextChange(428, '﻿', 428, '')]);
            const buff = stackData.serialize();
            const actual = editStack_1.SingleModelEditStackData.deserialize(buff);
            assert.deepStrictEqual(actual, stackData);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vbW9kZWwvZWRpdFN0YWNrLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFTaEcsS0FBSyxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7UUFFdkIsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksQ0FBQywyQ0FBMkMsRUFBRSxHQUFHLEVBQUU7WUFDdEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxvQ0FBd0IsQ0FDN0MsQ0FBQyxFQUNELENBQUMsOERBR0QsQ0FBQyxJQUFJLHFCQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDN0IsQ0FBQyxJQUFJLHFCQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDN0IsQ0FBQyxJQUFJLHVCQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FDbkMsQ0FBQztZQUVGLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNuQyxNQUFNLE1BQU0sR0FBRyxvQ0FBd0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFMUQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7SUFFSixDQUFDLENBQUMsQ0FBQyJ9