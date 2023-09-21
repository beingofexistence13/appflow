/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/lineRange"], function (require, exports, assert, utils_1, lineRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LineRange', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('contains', () => {
            const r = new lineRange_1.LineRange(2, 3);
            assert.deepStrictEqual(r.contains(1), false);
            assert.deepStrictEqual(r.contains(2), true);
            assert.deepStrictEqual(r.contains(3), false);
            assert.deepStrictEqual(r.contains(4), false);
        });
    });
    suite('LineRangeSet', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('addRange', () => {
            const set = new lineRange_1.LineRangeSet();
            set.addRange(new lineRange_1.LineRange(2, 3));
            set.addRange(new lineRange_1.LineRange(3, 4));
            set.addRange(new lineRange_1.LineRange(10, 20));
            assert.deepStrictEqual(set.toString(), '[2,4), [10,20)');
            set.addRange(new lineRange_1.LineRange(3, 21));
            assert.deepStrictEqual(set.toString(), '[2,21)');
        });
        test('getUnion', () => {
            const set1 = new lineRange_1.LineRangeSet([
                new lineRange_1.LineRange(2, 3),
                new lineRange_1.LineRange(5, 7),
                new lineRange_1.LineRange(10, 20)
            ]);
            const set2 = new lineRange_1.LineRangeSet([
                new lineRange_1.LineRange(3, 4),
                new lineRange_1.LineRange(6, 8),
                new lineRange_1.LineRange(9, 11)
            ]);
            const union = set1.getUnion(set2);
            assert.deepStrictEqual(union.toString(), '[2,4), [5,8), [9,20)');
        });
        test('intersects', () => {
            const set1 = new lineRange_1.LineRangeSet([
                new lineRange_1.LineRange(2, 3),
                new lineRange_1.LineRange(5, 7),
                new lineRange_1.LineRange(10, 20)
            ]);
            assert.deepStrictEqual(set1.intersects(new lineRange_1.LineRange(1, 2)), false);
            assert.deepStrictEqual(set1.intersects(new lineRange_1.LineRange(1, 3)), true);
            assert.deepStrictEqual(set1.intersects(new lineRange_1.LineRange(3, 5)), false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZVJhbmdlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vY29yZS9saW5lUmFuZ2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU1oRyxLQUFLLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtRQUV2QixJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7WUFDckIsTUFBTSxDQUFDLEdBQUcsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1FBRTFCLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtZQUNyQixNQUFNLEdBQUcsR0FBRyxJQUFJLHdCQUFZLEVBQUUsQ0FBQztZQUMvQixHQUFHLENBQUMsUUFBUSxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUkscUJBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBRXpELEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7WUFDckIsTUFBTSxJQUFJLEdBQUcsSUFBSSx3QkFBWSxDQUFDO2dCQUM3QixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbkIsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ25CLElBQUkscUJBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO2FBQ3JCLENBQUMsQ0FBQztZQUNILE1BQU0sSUFBSSxHQUFHLElBQUksd0JBQVksQ0FBQztnQkFDN0IsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ25CLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQzthQUNwQixDQUFDLENBQUM7WUFFSCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFDbEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTtZQUN2QixNQUFNLElBQUksR0FBRyxJQUFJLHdCQUFZLENBQUM7Z0JBQzdCLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbkIsSUFBSSxxQkFBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7YUFDckIsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNwRSxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25FLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckUsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9