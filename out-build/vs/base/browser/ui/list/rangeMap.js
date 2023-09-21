/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/range"], function (require, exports, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hQ = exports.$gQ = exports.$fQ = exports.$eQ = void 0;
    /**
     * Returns the intersection between a ranged group and a range.
     * Returns `[]` if the intersection is empty.
     */
    function $eQ(range, groups) {
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
    exports.$eQ = $eQ;
    /**
     * Shifts a range by that `much`.
     */
    function $fQ({ start, end }, much) {
        return { start: start + much, end: end + much };
    }
    exports.$fQ = $fQ;
    /**
     * Consolidates a collection of ranged groups.
     *
     * Consolidation is the process of merging consecutive ranged groups
     * that share the same `size`.
     */
    function $gQ(groups) {
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
    exports.$gQ = $gQ;
    /**
     * Concatenates several collections of ranged groups into a single
     * collection.
     */
    function concat(...groups) {
        return $gQ(groups.reduce((r, g) => r.concat(g), []));
    }
    class $hQ {
        get paddingTop() {
            return this.c;
        }
        set paddingTop(paddingTop) {
            this.b = this.b + paddingTop - this.c;
            this.c = paddingTop;
        }
        constructor(topPadding) {
            this.a = [];
            this.b = 0;
            this.c = 0;
            this.c = topPadding ?? 0;
            this.b = this.c;
        }
        splice(index, deleteCount, items = []) {
            const diff = items.length - deleteCount;
            const before = $eQ({ start: 0, end: index }, this.a);
            const after = $eQ({ start: index + deleteCount, end: Number.POSITIVE_INFINITY }, this.a)
                .map(g => ({ range: $fQ(g.range, diff), size: g.size }));
            const middle = items.map((item, i) => ({
                range: { start: index + i, end: index + i + 1 },
                size: item.size
            }));
            this.a = concat(before, middle, after);
            this.b = this.c + this.a.reduce((t, g) => t + (g.size * (g.range.end - g.range.start)), 0);
        }
        /**
         * Returns the number of items in the range map.
         */
        get count() {
            const len = this.a.length;
            if (!len) {
                return 0;
            }
            return this.a[len - 1].range.end;
        }
        /**
         * Returns the sum of the sizes of all items in the range map.
         */
        get size() {
            return this.b;
        }
        /**
         * Returns the index of the item at the given position.
         */
        indexAt(position) {
            if (position < 0) {
                return -1;
            }
            if (position < this.c) {
                return 0;
            }
            let index = 0;
            let size = this.c;
            for (const group of this.a) {
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
            for (const group of this.a) {
                const groupCount = group.range.end - group.range.start;
                const newCount = count + groupCount;
                if (index < newCount) {
                    return this.c + position + ((index - count) * group.size);
                }
                position += groupCount * group.size;
                count = newCount;
            }
            return -1;
        }
    }
    exports.$hQ = $hQ;
});
//# sourceMappingURL=rangeMap.js.map