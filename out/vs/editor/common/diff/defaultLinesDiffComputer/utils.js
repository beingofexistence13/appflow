/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineRangeFragment = exports.isSpace = exports.Array2D = void 0;
    class Array2D {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.array = [];
            this.array = new Array(width * height);
        }
        get(x, y) {
            return this.array[x + y * this.width];
        }
        set(x, y, value) {
            this.array[x + y * this.width] = value;
        }
    }
    exports.Array2D = Array2D;
    function isSpace(charCode) {
        return charCode === 32 /* CharCode.Space */ || charCode === 9 /* CharCode.Tab */;
    }
    exports.isSpace = isSpace;
    class LineRangeFragment {
        static { this.chrKeys = new Map(); }
        static getKey(chr) {
            let key = this.chrKeys.get(chr);
            if (key === undefined) {
                key = this.chrKeys.size;
                this.chrKeys.set(chr, key);
            }
            return key;
        }
        constructor(range, lines, source) {
            this.range = range;
            this.lines = lines;
            this.source = source;
            this.histogram = [];
            let counter = 0;
            for (let i = range.startLineNumber - 1; i < range.endLineNumberExclusive - 1; i++) {
                const line = lines[i];
                for (let j = 0; j < line.length; j++) {
                    counter++;
                    const chr = line[j];
                    const key = LineRangeFragment.getKey(chr);
                    this.histogram[key] = (this.histogram[key] || 0) + 1;
                }
                counter++;
                const key = LineRangeFragment.getKey('\n');
                this.histogram[key] = (this.histogram[key] || 0) + 1;
            }
            this.totalCount = counter;
        }
        computeSimilarity(other) {
            let sumDifferences = 0;
            const maxLength = Math.max(this.histogram.length, other.histogram.length);
            for (let i = 0; i < maxLength; i++) {
                sumDifferences += Math.abs((this.histogram[i] ?? 0) - (other.histogram[i] ?? 0));
            }
            return 1 - (sumDifferences / (this.totalCount + other.totalCount));
        }
    }
    exports.LineRangeFragment = LineRangeFragment;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2RpZmYvZGVmYXVsdExpbmVzRGlmZkNvbXB1dGVyL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxNQUFhLE9BQU87UUFHbkIsWUFBNEIsS0FBYSxFQUFrQixNQUFjO1lBQTdDLFVBQUssR0FBTCxLQUFLLENBQVE7WUFBa0IsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUZ4RCxVQUFLLEdBQVEsRUFBRSxDQUFDO1lBR2hDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRCxHQUFHLENBQUMsQ0FBUyxFQUFFLENBQVM7WUFDdkIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxHQUFHLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxLQUFRO1lBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3hDLENBQUM7S0FDRDtJQWRELDBCQWNDO0lBRUQsU0FBZ0IsT0FBTyxDQUFDLFFBQWdCO1FBQ3ZDLE9BQU8sUUFBUSw0QkFBbUIsSUFBSSxRQUFRLHlCQUFpQixDQUFDO0lBQ2pFLENBQUM7SUFGRCwwQkFFQztJQUVELE1BQWEsaUJBQWlCO2lCQUNkLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBa0IsQUFBNUIsQ0FBNkI7UUFFM0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFXO1lBQ2hDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxD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