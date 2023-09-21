/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LY = exports.$KY = exports.$JY = void 0;
    class $JY {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.a = [];
            this.a = new Array(width * height);
        }
        get(x, y) {
            return this.a[x + y * this.width];
        }
        set(x, y, value) {
            this.a[x + y * this.width] = value;
        }
    }
    exports.$JY = $JY;
    function $KY(charCode) {
        return charCode === 32 /* CharCode.Space */ || charCode === 9 /* CharCode.Tab */;
    }
    exports.$KY = $KY;
    class $LY {
        static { this.a = new Map(); }
        static b(chr) {
            let key = this.a.get(chr);
            if (key === undefined) {
                key = this.a.size;
                this.a.set(chr, key);
            }
            return key;
        }
        constructor(range, lines, source) {
            this.range = range;
            this.lines = lines;
            this.source = source;
            this.d = [];
            let counter = 0;
            for (let i = range.startLineNumber - 1; i < range.endLineNumberExclusive - 1; i++) {
                const line = lines[i];
                for (let j = 0; j < line.length; j++) {
                    counter++;
                    const chr = line[j];
                    const key = $LY.b(chr);
                    this.d[key] = (this.d[key] || 0) + 1;
                }
                counter++;
                const key = $LY.b('\n');
                this.d[key] = (this.d[key] || 0) + 1;
            }
            this.c = counter;
        }
        computeSimilarity(other) {
            let sumDifferences = 0;
            const maxLength = Math.max(this.d.length, other.d.length);
            for (let i = 0; i < maxLength; i++) {
                sumDifferences += Math.abs((this.d[i] ?? 0) - (other.d[i] ?? 0));
            }
            return 1 - (sumDifferences / (this.c + other.c));
        }
    }
    exports.$LY = $LY;
});
//# sourceMappingURL=utils.js.map