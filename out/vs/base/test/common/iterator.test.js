/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/iterator"], function (require, exports, assert, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Iterable', function () {
        const customIterable = new class {
            *[Symbol.iterator]() {
                yield 'one';
                yield 'two';
                yield 'three';
            }
        };
        test('first', function () {
            assert.strictEqual(iterator_1.Iterable.first([]), undefined);
            assert.strictEqual(iterator_1.Iterable.first([1]), 1);
            assert.strictEqual(iterator_1.Iterable.first(customIterable), 'one');
            assert.strictEqual(iterator_1.Iterable.first(customIterable), 'one'); // fresh
        });
        test('wrap', function () {
            assert.deepStrictEqual([...iterator_1.Iterable.wrap(1)], [1]);
            assert.deepStrictEqual([...iterator_1.Iterable.wrap([1, 2, 3])], [1, 2, 3]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmF0b3IudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvdGVzdC9jb21tb24vaXRlcmF0b3IudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQUtoRyxLQUFLLENBQUMsVUFBVSxFQUFFO1FBRWpCLE1BQU0sY0FBYyxHQUFHLElBQUk7WUFFMUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBQ2pCLE1BQU0sS0FBSyxDQUFDO2dCQUNaLE1BQU0sS0FBSyxDQUFDO2dCQUNaLE1BQU0sT0FBTyxDQUFDO1lBQ2YsQ0FBQztTQUNELENBQUM7UUFFRixJQUFJLENBQUMsT0FBTyxFQUFFO1lBRWIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxtQkFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLG1CQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsV0FBVyxDQUFDLG1CQUFRLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFELE1BQU0sQ0FBQyxXQUFXLENBQUMsbUJBQVEsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRO1FBQ3BFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNaLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLG1CQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLG1CQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEUsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9