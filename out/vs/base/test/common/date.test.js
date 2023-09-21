/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/date", "vs/base/test/common/utils"], function (require, exports, assert_1, date_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Date', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('fromNow', () => {
            test('appendAgoLabel', () => {
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 35000), '35 secs');
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 35000, false), '35 secs');
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 35000, true), '35 secs ago');
            });
            test('useFullTimeWords', () => {
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 35000), '35 secs');
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 35000, undefined, false), '35 secs');
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 35000, undefined, true), '35 seconds');
            });
            test('disallowNow', () => {
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 5000), 'now');
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 5000, undefined, undefined, false), 'now');
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 5000, undefined, undefined, true), '5 secs');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9kYXRlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFNaEcsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7UUFDbEIsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7Z0JBQzNCLElBQUEsb0JBQVcsRUFBQyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3BELElBQUEsb0JBQVcsRUFBQyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUMzRCxJQUFBLG9CQUFXLEVBQUMsSUFBQSxjQUFPLEVBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUMvRCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7Z0JBQzdCLElBQUEsb0JBQVcsRUFBQyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3BELElBQUEsb0JBQVcsRUFBQyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDdEUsSUFBQSxvQkFBVyxFQUFDLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3pFLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7Z0JBQ3hCLElBQUEsb0JBQVcsRUFBQyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQy9DLElBQUEsb0JBQVcsRUFBQyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzVFLElBQUEsb0JBQVcsRUFBQyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDL0UsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=