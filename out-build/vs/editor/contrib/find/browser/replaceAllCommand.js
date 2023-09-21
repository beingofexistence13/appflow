/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range"], function (require, exports, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$u7 = void 0;
    class $u7 {
        constructor(editorSelection, ranges, replaceStrings) {
            this.a = editorSelection;
            this.c = ranges;
            this.d = replaceStrings;
            this.b = null;
        }
        getEditOperations(model, builder) {
            if (this.c.length > 0) {
                // Collect all edit operations
                const ops = [];
                for (let i = 0; i < this.c.length; i++) {
                    ops.push({
                        range: this.c[i],
                        text: this.d[i]
                    });
                }
                // Sort them in ascending order by range starts
                ops.sort((o1, o2) => {
                    return range_1.$ks.compareRangesUsingStarts(o1.range, o2.range);
                });
                // Merge operations that touch each other
                const resultOps = [];
                let previousOp = ops[0];
                for (let i = 1; i < ops.length; i++) {
                    if (previousOp.range.endLineNumber === ops[i].range.startLineNumber && previousOp.range.endColumn === ops[i].range.startColumn) {
                        // These operations are one after another and can be merged
                        previousOp.range = previousOp.range.plusRange(ops[i].range);
                        previousOp.text = previousOp.text + ops[i].text;
                    }
                    else {
                        resultOps.push(previousOp);
                        previousOp = ops[i];
                    }
                }
                resultOps.push(previousOp);
                for (const op of resultOps) {
                    builder.addEditOperation(op.range, op.text);
                }
            }
            this.b = builder.trackSelection(this.a);
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this.b);
        }
    }
    exports.$u7 = $u7;
});
//# sourceMappingURL=replaceAllCommand.js.map