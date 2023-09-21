/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/editor/common/core/selection"], function (require, exports, range_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$g1 = void 0;
    class $g1 {
        constructor(selection, isMovingLeft) {
            this.a = selection;
            this.b = isMovingLeft;
        }
        getEditOperations(model, builder) {
            if (this.a.startLineNumber !== this.a.endLineNumber || this.a.isEmpty()) {
                return;
            }
            const lineNumber = this.a.startLineNumber;
            const startColumn = this.a.startColumn;
            const endColumn = this.a.endColumn;
            if (this.b && startColumn === 1) {
                return;
            }
            if (!this.b && endColumn === model.getLineMaxColumn(lineNumber)) {
                return;
            }
            if (this.b) {
                const rangeBefore = new range_1.$ks(lineNumber, startColumn - 1, lineNumber, startColumn);
                const charBefore = model.getValueInRange(rangeBefore);
                builder.addEditOperation(rangeBefore, null);
                builder.addEditOperation(new range_1.$ks(lineNumber, endColumn, lineNumber, endColumn), charBefore);
            }
            else {
                const rangeAfter = new range_1.$ks(lineNumber, endColumn, lineNumber, endColumn + 1);
                const charAfter = model.getValueInRange(rangeAfter);
                builder.addEditOperation(rangeAfter, null);
                builder.addEditOperation(new range_1.$ks(lineNumber, startColumn, lineNumber, startColumn), charAfter);
            }
        }
        computeCursorState(model, helper) {
            if (this.b) {
                return new selection_1.$ms(this.a.startLineNumber, this.a.startColumn - 1, this.a.endLineNumber, this.a.endColumn - 1);
            }
            else {
                return new selection_1.$ms(this.a.startLineNumber, this.a.startColumn + 1, this.a.endLineNumber, this.a.endColumn + 1);
            }
        }
    }
    exports.$g1 = $g1;
});
//# sourceMappingURL=moveCaretCommand.js.map