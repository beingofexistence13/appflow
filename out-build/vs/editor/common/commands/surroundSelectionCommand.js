/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/editor/common/core/selection"], function (require, exports, range_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0V = exports.$9V = void 0;
    class $9V {
        constructor(range, charBeforeSelection, charAfterSelection) {
            this.a = range;
            this.b = charBeforeSelection;
            this.c = charAfterSelection;
        }
        getEditOperations(model, builder) {
            builder.addTrackedEditOperation(new range_1.$ks(this.a.startLineNumber, this.a.startColumn, this.a.startLineNumber, this.a.startColumn), this.b);
            builder.addTrackedEditOperation(new range_1.$ks(this.a.endLineNumber, this.a.endColumn, this.a.endLineNumber, this.a.endColumn), this.c);
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            const firstOperationRange = inverseEditOperations[0].range;
            const secondOperationRange = inverseEditOperations[1].range;
            return new selection_1.$ms(firstOperationRange.endLineNumber, firstOperationRange.endColumn, secondOperationRange.endLineNumber, secondOperationRange.endColumn - this.c.length);
        }
    }
    exports.$9V = $9V;
    /**
     * A surround selection command that runs after composition finished.
     */
    class $0V {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        getEditOperations(model, builder) {
            builder.addTrackedEditOperation(new range_1.$ks(this.a.lineNumber, this.a.column, this.a.lineNumber, this.a.column), this.b + this.c);
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            const opRange = inverseEditOperations[0].range;
            return new selection_1.$ms(opRange.endLineNumber, opRange.startColumn, opRange.endLineNumber, opRange.endColumn - this.c.length);
        }
    }
    exports.$0V = $0V;
});
//# sourceMappingURL=surroundSelectionCommand.js.map