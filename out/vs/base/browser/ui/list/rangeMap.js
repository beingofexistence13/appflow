/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/range"], function (require, exports, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RangeMap = exports.consolidate = exports.shift = exports.groupIntersect = void 0;
    /**
     * Returns the intersection between a ranged group and a range.
     * Returns `[]` if the intersection is empty.
     */
    function groupIntersect(range, groups) {
        const result = [];
        for (const r of groups) {
            if (range.start >= r.range.end) {
                continue;
            }
            if (range.end < r.range.start) {
                break;
            }
            const intersection = range_1.Range.intersect(range, r.range);
            if (range_1.Range.isEmpty(intersection)) {
                continue;
            }
            result.push({
                range: intersection,
                size: r.size
            });
        }
        return result;
    }
    exports.groupIntersect = groupIntersect;
    /**
     * Shifts a range by that `much`.
     */
    function shift({ start, end }, much) {
        return { start: start + much, end: end + much };
    }
    exports.shift = shift;
    /**
     * Consolidates a collection of ranged groups.
     *
     * Consolidation is the process of merging consecutive ranged groups
     * that share the same `size`.
     */
    function consolidate(groups) {
        const result = [];
        let previousGroup = null;
        for (const group of groups) {
            const start = group.range.start;
            const end = group.range.end;
            const size = group.size;
            if (previousGroup && size === previousGroup.size) {
                previousGroup.range.end = end;
                continue;
            }
            previousGroup = { range: { start, end }, size };
            result.push(previousGroup);
        }
        return result;
    }
    exports.consolidate = consolidate;
    /**
     * Concatenates several collections of ranged groups into a single
     * collection.
     */
    function concat(...groups) {
        return consolidate(groups.reduce((r, g) => r.concat(g), []));
    }
    class RangeMap {
        get paddingTop() {
            return this._paddingTop;
        }
        set paddingTop(paddingTop) {
            this._size = this._size + paddingTop - this._paddingTop;
            this._paddingTop = paddingTop;
        }
        constructor(topPadding) {
            this.groups = [];
            this._size = 0;
            this._paddingTop = 0;
            this._paddingTop = topPadding ?? 0;
            this._size = this._paddingTop;
        }
        splice(index, deleteCount, items = []) {
            const diff = items.length - deleteCount;
            const before = groupIntersect({ start: 0, end: index }, this.groups);
            const after = groupIntersect({ start: index + deleteCount, end: Number.POSITIVE_INFINITY }, this.groups)
                .map(g => ({ range: shift(g.range, diff), size: g.size }));
            const middle = items.map((item, i) => ({
                range: { start: index + i, end: index + i + 1 },
                size: item.size
            }));
            this.groups = concat(before, middle, after);
            this._size = this._paddingTop + this.groups.reduce((t, g) => t + (g.size * (g.range.end - g.range.start)), 0);
        }
        /**
         * Returns the number of items in the range map.
         */
        get count() {
            const len = this.groups.length;
            if (!len) {
                return 0;
            }
            return this.groups[len - 1].range.end;
        }
        /**
         * Returns the sum of the sizes of all items in the range map.
         */
        get size() {
            return this._size;
        }
        /**
         * Returns the index of the item at the given position.
         */
        indexAt(position) {
            if (position < 0) {
                return -1;
            }
            if (position < this._paddingTop) {
                return 0;
            }
            let index = 0;
            let size = this._paddingTop;
            for (const group of this.groups) {
                const count = group.range.end - group.range.start;
                const newSize = size + (count * group.size);
                if (position < newSize) {
                    return index + Math.floor((position - size) / group.size);
                }
                index += count;
                size = newSize;
            }
            return index;
        }
        /**
         * Returns the index of the item right after the item at the
         * index of the given position.
         */
        indexAfter(position) {
            return Math.min(this.indexAt(position) + 1, this.count);
        }
        /**
         * Returns the start position of the item at the given index.
         */
        positionAt(index) {
            if (index < 0) {
                return -1;
            }
            let position = 0;
            let count = 0;
            for (const group of this.groups) {
                const groupCount = group.range.end - group.range.start;
                const newCount = count + groupCount;
                if (index < newCount) {
                    return this._paddingTop + position + ((index - count) * group.size);
                }
                position += groupCount * group.size;
                count = newCount;
            }
            return -1;
        }
    }
    exports.RangeMap = RangeMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VNYXAuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvbGlzdC9yYW5nZU1hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEc7OztPQUdHO0lBQ0gsU0FBZ0IsY0FBYyxDQUFDLEtBQWEsRUFBRSxNQUFzQjtRQUNuRSxNQUFNLE1BQU0sR0FBbUIsRUFBRSxDQUFDO1FBRWxDLEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFO1lBQ3ZCLElBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDL0IsU0FBUzthQUNUO1lBRUQsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO2dCQUM5QixNQUFNO2FBQ047WUFFRCxNQUFNLFlBQVksR0FBRyxhQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFckQsSUFBSSxhQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNoQyxTQUFTO2FBQ1Q7WUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNYLEtBQUssRUFBRSxZQUFZO2dCQUNuQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7YUFDWixDQUFDLENBQUM7U0FDSDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQXpCRCx3Q0F5QkM7SUFFRDs7T0FFRztJQUNILFNBQWdCLEtBQUssQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQVUsRUFBRSxJQUFZO1FBQ3pELE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxHQUFHLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDO0lBQ2pELENBQUM7SUFGRCxzQkFFQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBZ0IsV0FBVyxDQUFDLE1BQXNCO1FBQ2pELE1BQU0sTUFBTSxHQUFtQixFQUFFLENBQUM7UUFDbEMsSUFBSSxhQUFhLEdBQXdCLElBQUksQ0FBQztRQUU5QyxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtZQUMzQixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUNoQyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztZQUM1QixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBRXhCLElBQUksYUFBYSxJQUFJLElBQUksS0FBSyxhQUFhLENBQUMsSUFBSSxFQUFFO2dCQUNqRCxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7Z0JBQzlCLFNBQVM7YUFDVDtZQUVELGFBQWEsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQzNCO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBbkJELGtDQW1CQztJQUVEOzs7T0FHRztJQUNILFNBQVMsTUFBTSxDQUFDLEdBQUcsTUFBd0I7UUFDMUMsT0FBTyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsTUFBYSxRQUFRO1FBTXBCLElBQUksVUFBVTtZQUNiLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN6QixDQUFDO1FBRUQsSUFBSSxVQUFVLENBQUMsVUFBa0I7WUFDaEMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3hELElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQy9CLENBQUM7UUFFRCxZQUFZLFVBQW1CO1lBYnZCLFdBQU0sR0FBbUIsRUFBRSxDQUFDO1lBQzVCLFVBQUssR0FBRyxDQUFDLENBQUM7WUFDVixnQkFBVyxHQUFHLENBQUMsQ0FBQztZQVl2QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsSUFBSSxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQy9CLENBQUM7UUFFRCxNQUFNLENBQUMsS0FBYSxFQUFFLFdBQW1CLEVBQUUsUUFBaUIsRUFBRTtZQUM3RCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQztZQUN4QyxNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckUsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssR0FBRyxXQUFXLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUM7aUJBQ3RHLEdBQUcsQ0FBZSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFMUUsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBZSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3BELEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDL0MsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2FBQ2YsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0csQ0FBQztRQUVEOztXQUVHO1FBQ0gsSUFBSSxLQUFLO1lBQ1IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFFL0IsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDVCxPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO1FBQ3ZDLENBQUM7UUFFRDs7V0FFRztRQUNILElBQUksSUFBSTtZQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBRUQ7O1dBRUc7UUFDSCxPQUFPLENBQUMsUUFBZ0I7WUFDdkIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFO2dCQUNqQixPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ1Y7WUFFRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNoQyxPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUU1QixLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO2dCQUNsRCxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUU1QyxJQUFJLFFBQVEsR0FBRyxPQUFPLEVBQUU7b0JBQ3ZCLE9BQU8sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUMxRDtnQkFFRCxLQUFLLElBQUksS0FBSyxDQUFDO2dCQUNmLElBQUksR0FBRyxPQUFPLENBQUM7YUFDZjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVEOzs7V0FHRztRQUNILFVBQVUsQ0FBQyxRQUFnQjtZQUMxQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRDs7V0FFRztRQUNILFVBQVUsQ0FBQyxLQUFhO1lBQ3ZCLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtnQkFDZCxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ1Y7WUFFRCxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDakIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBRWQsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNoQyxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztnQkFDdkQsTUFBTSxRQUFRLEdBQUcsS0FBSyxHQUFHLFVBQVUsQ0FBQztnQkFFcEMsSUFBSSxLQUFLLEdBQUcsUUFBUSxFQUFFO29CQUNyQixPQUFPLElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNwRTtnQkFFRCxRQUFRLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQ3BDLEtBQUssR0FBRyxRQUFRLENBQUM7YUFDakI7WUFFRCxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztLQUNEO0lBdEhELDRCQXNIQyJ9