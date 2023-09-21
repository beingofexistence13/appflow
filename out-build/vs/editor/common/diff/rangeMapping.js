/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/lineRange"], function (require, exports, lineRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xs = exports.$ws = exports.$vs = void 0;
    /**
     * Maps a line range in the original text model to a line range in the modified text model.
     */
    class $vs {
        static inverse(mapping, originalLineCount, modifiedLineCount) {
            const result = [];
            let lastOriginalEndLineNumber = 1;
            let lastModifiedEndLineNumber = 1;
            for (const m of mapping) {
                const r = new $ws(new lineRange_1.$ts(lastOriginalEndLineNumber, m.original.startLineNumber), new lineRange_1.$ts(lastModifiedEndLineNumber, m.modified.startLineNumber), undefined);
                if (!r.modified.isEmpty) {
                    result.push(r);
                }
                lastOriginalEndLineNumber = m.original.endLineNumberExclusive;
                lastModifiedEndLineNumber = m.modified.endLineNumberExclusive;
            }
            const r = new $ws(new lineRange_1.$ts(lastOriginalEndLineNumber, originalLineCount + 1), new lineRange_1.$ts(lastModifiedEndLineNumber, modifiedLineCount + 1), undefined);
            if (!r.modified.isEmpty) {
                result.push(r);
            }
            return result;
        }
        constructor(originalRange, modifiedRange) {
            this.original = originalRange;
            this.modified = modifiedRange;
        }
        toString() {
            return `{${this.original.toString()}->${this.modified.toString()}}`;
        }
        flip() {
            return new $vs(this.modified, this.original);
        }
        join(other) {
            return new $vs(this.original.join(other.original), this.modified.join(other.modified));
        }
        get changedLineCount() {
            return Math.max(this.original.length, this.modified.length);
        }
    }
    exports.$vs = $vs;
    /**
     * Maps a line range in the original text model to a line range in the modified text model.
     * Also contains inner range mappings.
     */
    class $ws extends $vs {
        constructor(originalRange, modifiedRange, innerChanges) {
            super(originalRange, modifiedRange);
            this.innerChanges = innerChanges;
        }
        flip() {
            return new $ws(this.modified, this.original, this.innerChanges?.map(c => c.flip()));
        }
    }
    exports.$ws = $ws;
    /**
     * Maps a range in the original text model to a range in the modified text model.
     */
    class $xs {
        constructor(originalRange, modifiedRange) {
            this.originalRange = originalRange;
            this.modifiedRange = modifiedRange;
        }
        toString() {
            return `{${this.originalRange.toString()}->${this.modifiedRange.toString()}}`;
        }
        flip() {
            return new $xs(this.modifiedRange, this.originalRange);
        }
    }
    exports.$xs = $xs;
});
//# sourceMappingURL=rangeMapping.js.map