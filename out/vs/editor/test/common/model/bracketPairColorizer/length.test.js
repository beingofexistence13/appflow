/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length"], function (require, exports, assert, utils_1, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Bracket Pair Colorizer - Length', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function toStr(length) {
            return (0, length_1.lengthToObj)(length).toString();
        }
        test('Basic', () => {
            const l1 = (0, length_1.toLength)(100, 10);
            assert.strictEqual((0, length_1.lengthToObj)(l1).lineCount, 100);
            assert.strictEqual((0, length_1.lengthToObj)(l1).columnCount, 10);
            assert.deepStrictEqual(toStr((0, length_1.lengthAdd)(l1, (0, length_1.toLength)(100, 10))), '200,10');
            assert.deepStrictEqual(toStr((0, length_1.lengthAdd)(l1, (0, length_1.toLength)(0, 10))), '100,20');
        });
        test('lengthDiffNonNeg', () => {
            assert.deepStrictEqual(toStr((0, length_1.lengthDiffNonNegative)((0, length_1.toLength)(100, 10), (0, length_1.toLength)(100, 20))), '0,10');
            assert.deepStrictEqual(toStr((0, length_1.lengthDiffNonNegative)((0, length_1.toLength)(100, 10), (0, length_1.toLength)(101, 20))), '1,20');
            assert.deepStrictEqual(toStr((0, length_1.lengthDiffNonNegative)((0, length_1.toLength)(101, 30), (0, length_1.toLength)(101, 20))), '0,0');
            assert.deepStrictEqual(toStr((0, length_1.lengthDiffNonNegative)((0, length_1.toLength)(102, 10), (0, length_1.toLength)(101, 20))), '0,0');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVuZ3RoLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vbW9kZWwvYnJhY2tldFBhaXJDb2xvcml6ZXIvbGVuZ3RoLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFNaEcsS0FBSyxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtRQUU3QyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsU0FBUyxLQUFLLENBQUMsTUFBYztZQUM1QixPQUFPLElBQUEsb0JBQVcsRUFBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN2QyxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDbEIsTUFBTSxFQUFFLEdBQUcsSUFBQSxpQkFBUSxFQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsb0JBQVcsRUFBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLG9CQUFXLEVBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRXBELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUEsa0JBQVMsRUFBQyxFQUFFLEVBQUUsSUFBQSxpQkFBUSxFQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDMUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBQSxrQkFBUyxFQUFDLEVBQUUsRUFBRSxJQUFBLGlCQUFRLEVBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN6RSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7WUFDN0IsTUFBTSxDQUFDLGVBQWUsQ0FDckIsS0FBSyxDQUNKLElBQUEsOEJBQXFCLEVBQ3BCLElBQUEsaUJBQVEsRUFBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQ2pCLElBQUEsaUJBQVEsRUFBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FDbkIsRUFDRCxNQUFNLENBQ04sQ0FBQztZQUVGLE1BQU0sQ0FBQyxlQUFlLENBQ3JCLEtBQUssQ0FDSixJQUFBLDhCQUFxQixFQUNwQixJQUFBLGlCQUFRLEVBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUNqQixJQUFBLGlCQUFRLEVBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQ25CLEVBQ0QsTUFBTSxDQUNOLENBQUM7WUFFRixNQUFNLENBQUMsZUFBZSxDQUNyQixLQUFLLENBQ0osSUFBQSw4QkFBcUIsRUFDcEIsSUFBQSxpQkFBUSxFQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFDakIsSUFBQSxpQkFBUSxFQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUNuQixFQUNELEtBQUssQ0FDTCxDQUFDO1lBRUYsTUFBTSxDQUFDLGVBQWUsQ0FDckIsS0FBSyxDQUNKLElBQUEsOEJBQXFCLEVBQ3BCLElBQUEsaUJBQVEsRUFBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQ2pCLElBQUEsaUJBQVEsRUFBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FDbkIsRUFDRCxLQUFLLENBQ0wsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==