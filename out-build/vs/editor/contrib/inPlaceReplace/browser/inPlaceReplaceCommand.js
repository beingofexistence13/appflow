/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/selection"], function (require, exports, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$t9 = void 0;
    class $t9 {
        constructor(editRange, originalSelection, text) {
            this.a = editRange;
            this.b = originalSelection;
            this.c = text;
        }
        getEditOperations(model, builder) {
            builder.addTrackedEditOperation(this.a, this.c);
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            const srcRange = inverseEditOperations[0].range;
            if (!this.b.isEmpty()) {
                // Preserve selection and extends to typed text
                return new selection_1.$ms(srcRange.endLineNumber, srcRange.endColumn - this.c.length, srcRange.endLineNumber, srcRange.endColumn);
            }
            return new selection_1.$ms(srcRange.endLineNumber, Math.min(this.b.positionColumn, srcRange.endColumn), srcRange.endLineNumber, Math.min(this.b.positionColumn, srcRange.endColumn));
        }
    }
    exports.$t9 = $t9;
});
//# sourceMappingURL=inPlaceReplaceCommand.js.map