/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length", "vs/workbench/contrib/mergeEditor/browser/model/mapping"], function (require, exports, assert, utils_1, position_1, range_1, length_1, mapping_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('merge editor mapping', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('DocumentRangeMap', () => {
            const documentMap = createDocumentRangeMap([
                '1:3',
                ['0:2', '0:3'],
                '1:1',
                ['1:2', '3:3'],
                '0:2',
                ['0:2', '0:3'],
            ]);
            test('map', () => assert.deepStrictEqual(documentMap.rangeMappings.map(m => m.toString()), [
                '[2:4, 2:6) -> [2:4, 2:7)',
                '[3:2, 4:3) -> [3:2, 6:4)',
                '[4:5, 4:7) -> [6:6, 6:9)'
            ]));
            function f() {
                return documentMap.project(parsePos(this.test.title)).toString();
            }
            test('1:1', function () { assert.deepStrictEqual(f.apply(this), '[1:1, 1:1) -> [1:1, 1:1)'); });
            test('2:3', function () { assert.deepStrictEqual(f.apply(this), '[2:3, 2:3) -> [2:3, 2:3)'); });
            test('2:4', function () { assert.deepStrictEqual(f.apply(this), '[2:4, 2:6) -> [2:4, 2:7)'); });
            test('2:5', function () { assert.deepStrictEqual(f.apply(this), '[2:4, 2:6) -> [2:4, 2:7)'); });
            test('2:6', function () { assert.deepStrictEqual(f.apply(this), '[2:6, 2:6) -> [2:7, 2:7)'); });
            test('2:7', function () { assert.deepStrictEqual(f.apply(this), '[2:7, 2:7) -> [2:8, 2:8)'); });
            test('3:1', function () { assert.deepStrictEqual(f.apply(this), '[3:1, 3:1) -> [3:1, 3:1)'); });
            test('3:2', function () { assert.deepStrictEqual(f.apply(this), '[3:2, 4:3) -> [3:2, 6:4)'); });
            test('4:2', function () { assert.deepStrictEqual(f.apply(this), '[3:2, 4:3) -> [3:2, 6:4)'); });
            test('4:3', function () { assert.deepStrictEqual(f.apply(this), '[4:3, 4:3) -> [6:4, 6:4)'); });
            test('4:4', function () { assert.deepStrictEqual(f.apply(this), '[4:4, 4:4) -> [6:5, 6:5)'); });
            test('4:5', function () { assert.deepStrictEqual(f.apply(this), '[4:5, 4:7) -> [6:6, 6:9)'); });
        });
    });
    function parsePos(str) {
        const [lineCount, columnCount] = str.split(':');
        return new position_1.Position(parseInt(lineCount, 10), parseInt(columnCount, 10));
    }
    function parseLengthObj(str) {
        const [lineCount, columnCount] = str.split(':');
        return new length_1.LengthObj(parseInt(lineCount, 10), parseInt(columnCount, 10));
    }
    function toPosition(length) {
        return new position_1.Position(length.lineCount + 1, length.columnCount + 1);
    }
    function createDocumentRangeMap(items) {
        const mappings = [];
        let lastLen1 = new length_1.LengthObj(0, 0);
        let lastLen2 = new length_1.LengthObj(0, 0);
        for (const item of items) {
            if (typeof item === 'string') {
                const len = parseLengthObj(item);
                lastLen1 = lastLen1.add(len);
                lastLen2 = lastLen2.add(len);
            }
            else {
                const len1 = parseLengthObj(item[0]);
                const len2 = parseLengthObj(item[1]);
                mappings.push(new mapping_1.RangeMapping(range_1.Range.fromPositions(toPosition(lastLen1), toPosition(lastLen1.add(len1))), range_1.Range.fromPositions(toPosition(lastLen2), toPosition(lastLen2.add(len2)))));
                lastLen1 = lastLen1.add(len1);
                lastLen2 = lastLen2.add(len2);
            }
        }
        return new mapping_1.DocumentRangeMap(mappings, lastLen1.lineCount);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwcGluZy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvdGVzdC9icm93c2VyL21hcHBpbmcudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVNoRyxLQUFLLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO1FBQ2xDLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO1lBQzlCLE1BQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDO2dCQUMxQyxLQUFLO2dCQUNMLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztnQkFDZCxLQUFLO2dCQUNMLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztnQkFDZCxLQUFLO2dCQUNMLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQzthQUNkLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFO2dCQUMxRiwwQkFBMEI7Z0JBQzFCLDBCQUEwQjtnQkFDMUIsMEJBQTBCO2FBQzFCLENBQUMsQ0FBQyxDQUFDO1lBRUosU0FBUyxDQUFDO2dCQUNULE9BQU8sV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25FLENBQUM7WUFFRCxJQUFJLENBQUMsS0FBSyxFQUFFLGNBQWMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRyxJQUFJLENBQUMsS0FBSyxFQUFFLGNBQWMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRyxJQUFJLENBQUMsS0FBSyxFQUFFLGNBQWMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRyxJQUFJLENBQUMsS0FBSyxFQUFFLGNBQWMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRyxJQUFJLENBQUMsS0FBSyxFQUFFLGNBQWMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRyxJQUFJLENBQUMsS0FBSyxFQUFFLGNBQWMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRyxJQUFJLENBQUMsS0FBSyxFQUFFLGNBQWMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRyxJQUFJLENBQUMsS0FBSyxFQUFFLGNBQWMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRyxJQUFJLENB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