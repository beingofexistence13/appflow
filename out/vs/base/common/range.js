/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Range = void 0;
    var Range;
    (function (Range) {
        /**
         * Returns the intersection between two ranges as a range itself.
         * Returns `{ start: 0, end: 0 }` if the intersection is empty.
         */
        function intersect(one, other) {
            if (one.start >= other.end || other.start >= one.end) {
                return { start: 0, end: 0 };
            }
            const start = Math.max(one.start, other.start);
            const end = Math.min(one.end, other.end);
            if (end - start <= 0) {
                return { start: 0, end: 0 };
            }
            return { start, end };
        }
        Range.intersect = intersect;
        function isEmpty(range) {
            return range.end - range.start <= 0;
        }
        Range.isEmpty = isEmpty;
        function intersects(one, other) {
            return !isEmpty(intersect(one, other));
        }
        Range.intersects = intersects;
        function relativeComplement(one, other) {
            const result = [];
            const first = { start: one.start, end: Math.min(other.start, one.end) };
            const second = { start: Math.max(other.end, one.start), end: one.end };
            if (!isEmpty(first)) {
                result.push(first);
            }
            if (!isEmpty(second)) {
                result.push(second);
            }
            return result;
        }
        Range.relativeComplement = relativeComplement;
    })(Range || (exports.Range = Range = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9yYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsSUFBaUIsS0FBSyxDQTRDckI7SUE1Q0QsV0FBaUIsS0FBSztRQUVyQjs7O1dBR0c7UUFDSCxTQUFnQixTQUFTLENBQUMsR0FBVyxFQUFFLEtBQWE7WUFDbkQsSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFO2dCQUNyRCxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDNUI7WUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9DLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFekMsSUFBSSxHQUFHLEdBQUcsS0FBSyxJQUFJLENBQUMsRUFBRTtnQkFDckIsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQzVCO1lBRUQsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBYmUsZUFBUyxZQWF4QixDQUFBO1FBRUQsU0FBZ0IsT0FBTyxDQUFDLEtBQWE7WUFDcEMsT0FBTyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFGZSxhQUFPLFVBRXRCLENBQUE7UUFFRCxTQUFnQixVQUFVLENBQUMsR0FBVyxFQUFFLEtBQWE7WUFDcEQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUZlLGdCQUFVLGFBRXpCLENBQUE7UUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxHQUFXLEVBQUUsS0FBYTtZQUM1RCxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7WUFDNUIsTUFBTSxLQUFLLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3hFLE1BQU0sTUFBTSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUV2RSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ25CO1lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNwQjtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQWRlLHdCQUFrQixxQkFjakMsQ0FBQTtJQUNGLENBQUMsRUE1Q2dCLEtBQUsscUJBQUwsS0FBSyxRQTRDckIifQ==