/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays"], function (require, exports, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$DBb = exports.$CBb = exports.$BBb = exports.$ABb = void 0;
    class $ABb {
        constructor(
        /**
         * Disjoint edits that are applied in parallel
         */
        edits) {
            this.edits = edits.slice().sort((0, arrays_1.$5b)(c => c.offset, arrays_1.$7b));
        }
        applyToArray(array) {
            for (let i = this.edits.length - 1; i >= 0; i--) {
                const c = this.edits[i];
                array.splice(c.offset, c.length, ...new Array(c.newLength));
            }
        }
    }
    exports.$ABb = $ABb;
    class $BBb {
        constructor(offset, length, newLength) {
            this.offset = offset;
            this.length = length;
            this.newLength = newLength;
        }
        toString() {
            return `[${this.offset}, +${this.length}) -> +${this.newLength}}`;
        }
    }
    exports.$BBb = $BBb;
    /**
     * Can only be called with increasing values of `index`.
    */
    class $CBb {
        static fromMany(transformations) {
            // TODO improve performance by combining transformations first
            const transformers = transformations.map(t => new $CBb(t));
            return new $DBb(transformers);
        }
        constructor(d) {
            this.d = d;
            this.a = 0;
            this.b = 0;
        }
        /**
         * Precondition: index >= previous-value-of(index).
         */
        transform(index) {
            let nextChange = this.d.edits[this.a];
            while (nextChange && nextChange.offset + nextChange.length <= index) {
                this.b += nextChange.newLength - nextChange.length;
                this.a++;
                nextChange = this.d.edits[this.a];
            }
            // assert nextChange === undefined || index < nextChange.offset + nextChange.length
            if (nextChange && nextChange.offset <= index) {
                // Offset is touched by the change
                return undefined;
            }
            return index + this.b;
        }
    }
    exports.$CBb = $CBb;
    class $DBb {
        constructor(a) {
            this.a = a;
        }
        transform(index) {
            for (const transformer of this.a) {
                const result = transformer.transform(index);
                if (result === undefined) {
                    return undefined;
                }
                index = result;
            }
            return index;
        }
    }
    exports.$DBb = $DBb;
});
//# sourceMappingURL=arrayOperation.js.map