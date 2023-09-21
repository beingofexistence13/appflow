/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/core/range"], function (require, exports, arrays_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ijb = exports.$hjb = exports.$gjb = void 0;
    /**
     * Represents an edit, expressed in whole lines:
     * At (before) {@link $6ib.startLineNumber}, delete {@link $6ib.lineCount} many lines and insert {@link newLines}.
    */
    class $gjb {
        constructor(range, newLines) {
            this.range = range;
            this.newLines = newLines;
        }
        equals(other) {
            return this.range.equals(other.range) && (0, arrays_1.$sb)(this.newLines, other.newLines);
        }
        toEdits(modelLineCount) {
            return new $ijb([this]).toEdits(modelLineCount);
        }
    }
    exports.$gjb = $gjb;
    class $hjb {
        constructor(range, newText) {
            this.range = range;
            this.newText = newText;
        }
        equals(other) {
            return range_1.$ks.equalsRange(this.range, other.range) && this.newText === other.newText;
        }
    }
    exports.$hjb = $hjb;
    class $ijb {
        constructor(edits) {
            this.edits = edits;
        }
        toEdits(modelLineCount) {
            return this.edits.map((e) => {
                if (e.range.endLineNumberExclusive <= modelLineCount) {
                    return {
                        range: new range_1.$ks(e.range.startLineNumber, 1, e.range.endLineNumberExclusive, 1),
                        text: e.newLines.map(s => s + '\n').join(''),
                    };
                }
                if (e.range.startLineNumber === 1) {
                    return {
                        range: new range_1.$ks(1, 1, modelLineCount, Number.MAX_SAFE_INTEGER),
                        text: e.newLines.join('\n'),
                    };
                }
                return {
                    range: new range_1.$ks(e.range.startLineNumber - 1, Number.MAX_SAFE_INTEGER, modelLineCount, Number.MAX_SAFE_INTEGER),
                    text: e.newLines.map(s => '\n' + s).join(''),
                };
            });
        }
    }
    exports.$ijb = $ijb;
});
//# sourceMappingURL=editing.js.map