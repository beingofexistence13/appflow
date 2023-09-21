/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cellRangeContains = exports.cellRangesEqual = exports.reduceCellRanges = exports.cellRangesToIndexes = exports.cellIndexesToRanges = exports.isICellRange = void 0;
    function isICellRange(candidate) {
        if (!candidate || typeof candidate !== 'object') {
            return false;
        }
        return typeof candidate.start === 'number'
            && typeof candidate.end === 'number';
    }
    exports.isICellRange = isICellRange;
    function cellIndexesToRanges(indexes) {
        indexes.sort((a, b) => a - b);
        const first = indexes.shift();
        if (first === undefined) {
            return [];
        }
        return indexes.reduce(function (ranges, num) {
            if (num <= ranges[0][1]) {
                ranges[0][1] = num + 1;
            }
            else {
                ranges.unshift([num, num + 1]);
            }
            return ranges;
        }, [[first, first + 1]]).reverse().map(val => ({ start: val[0], end: val[1] }));
    }
    exports.cellIndexesToRanges = cellIndexesToRanges;
    function cellRangesToIndexes(ranges) {
        const indexes = ranges.reduce((a, b) => {
            for (let i = b.start; i < b.end; i++) {
                a.push(i);
            }
            return a;
        }, []);
        return indexes;
    }
    exports.cellRangesToIndexes = cellRangesToIndexes;
    function reduceCellRanges(ranges) {
        const sorted = ranges.sort((a, b) => a.start - b.start);
        const first = sorted[0];
        if (!first) {
            return [];
        }
        return sorted.reduce((prev, curr) => {
            const last = prev[prev.length - 1];
            if (last.end >= curr.start) {
                last.end = Math.max(last.end, curr.end);
            }
            else {
                prev.push(curr);
            }
            return prev;
        }, [first]);
    }
    exports.reduceCellRanges = reduceCellRanges;
    function cellRangesEqual(a, b) {
        a = reduceCellRanges(a);
        b = reduceCellRanges(b);
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i].start !== b[i].start || a[i].end !== b[i].end) {
                return false;
            }
        }
        return true;
    }
    exports.cellRangesEqual = cellRangesEqual;
    /**
     * todo@rebornix test and sort
     * @param range
     * @param other
     * @returns
     */
    function cellRangeContains(range, other) {
        return other.start >= range.start && other.end <= range.end;
    }
    exports.cellRangeContains = cellRangeContains;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tSYW5nZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2NvbW1vbi9ub3RlYm9va1JhbmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsU0FBZ0IsWUFBWSxDQUFDLFNBQWM7UUFDMUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLEVBQUU7WUFDaEQsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUNELE9BQU8sT0FBb0IsU0FBVSxDQUFDLEtBQUssS0FBSyxRQUFRO2VBQ3BELE9BQW9CLFNBQVUsQ0FBQyxHQUFHLEtBQUssUUFBUSxDQUFDO0lBQ3JELENBQUM7SUFORCxvQ0FNQztJQUVELFNBQWdCLG1CQUFtQixDQUFDLE9BQWlCO1FBQ3BELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDOUIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRTlCLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUN4QixPQUFPLEVBQUUsQ0FBQztTQUNWO1FBRUQsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsTUFBTSxFQUFFLEdBQUc7WUFDMUMsSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN4QixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQzthQUN2QjtpQkFBTTtnQkFDTixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQy9CO1lBQ0QsT0FBTyxN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