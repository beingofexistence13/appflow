/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/editor/common/core/selection"], function (require, exports, range_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$26 = void 0;
    class $26 {
        constructor(selection, targetPosition, copy) {
            this.a = selection;
            this.b = targetPosition;
            this.d = copy;
            this.c = null;
        }
        getEditOperations(model, builder) {
            const text = model.getValueInRange(this.a);
            if (!this.d) {
                builder.addEditOperation(this.a, null);
            }
            builder.addEditOperation(new range_1.$ks(this.b.lineNumber, this.b.column, this.b.lineNumber, this.b.column), text);
            if (this.a.containsPosition(this.b) && !(this.d && (this.a.getEndPosition().equals(this.b) || this.a.getStartPosition().equals(this.b)) // we allow users to paste content beside the selection
            )) {
                this.c = this.a;
                return;
            }
            if (this.d) {
                this.c = new selection_1.$ms(this.b.lineNumber, this.b.column, this.a.endLineNumber - this.a.startLineNumber + this.b.lineNumber, this.a.startLineNumber === this.a.endLineNumber ?
                    this.b.column + this.a.endColumn - this.a.startColumn :
                    this.a.endColumn);
                return;
            }
            if (this.b.lineNumber > this.a.endLineNumber) {
                // Drag the selection downwards
                this.c = new selection_1.$ms(this.b.lineNumber - this.a.endLineNumber + this.a.startLineNumber, this.b.column, this.b.lineNumber, this.a.startLineNumber === this.a.endLineNumber ?
                    this.b.column + this.a.endColumn - this.a.startColumn :
                    this.a.endColumn);
                return;
            }
            if (this.b.lineNumber < this.a.endLineNumber) {
                // Drag the selection upwards
                this.c = new selection_1.$ms(this.b.lineNumber, this.b.column, this.b.lineNumber + this.a.endLineNumber - this.a.startLineNumber, this.a.startLineNumber === this.a.endLineNumber ?
                    this.b.column + this.a.endColumn - this.a.startColumn :
                    this.a.endColumn);
                return;
            }
            // The target position is at the same line as the selection's end position.
            if (this.a.endColumn <= this.b.column) {
                // The target position is after the selection's end position
                this.c = new selection_1.$ms(this.b.lineNumber - this.a.endLineNumber + this.a.startLineNumber, this.a.startLineNumber === this.a.endLineNumber ?
                    this.b.column - this.a.endColumn + this.a.startColumn :
                    this.b.column - this.a.endColumn + this.a.startColumn, this.b.lineNumber, this.a.startLineNumber === this.a.endLineNumber ?
                    this.b.column :
                    this.a.endColumn);
            }
            else {
                // The target position is before the selection's end position. Since the selection doesn't contain the target position, the selection is one-line and target position is before this selection.
                this.c = new selection_1.$ms(this.b.lineNumber - this.a.endLineNumber + this.a.startLineNumber, this.b.column, this.b.lineNumber, this.b.column + this.a.endColumn - this.a.startColumn);
            }
        }
        computeCursorState(model, helper) {
            return this.c;
        }
    }
    exports.$26 = $26;
});
//# sourceMappingURL=dragAndDropCommand.js.map