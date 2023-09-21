/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/selection"], function (require, exports, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YV = exports.$XV = exports.$WV = exports.$VV = exports.$UV = void 0;
    class $UV {
        constructor(range, text, insertsAutoWhitespace = false) {
            this.a = range;
            this.b = text;
            this.insertsAutoWhitespace = insertsAutoWhitespace;
        }
        getEditOperations(model, builder) {
            builder.addTrackedEditOperation(this.a, this.b);
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            const srcRange = inverseEditOperations[0].range;
            return selection_1.$ms.fromPositions(srcRange.getEndPosition());
        }
    }
    exports.$UV = $UV;
    class $VV {
        constructor(range, text) {
            this.a = range;
            this.b = text;
        }
        getEditOperations(model, builder) {
            builder.addTrackedEditOperation(this.a, this.b);
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            const srcRange = inverseEditOperations[0].range;
            return selection_1.$ms.fromRange(srcRange, 0 /* SelectionDirection.LTR */);
        }
    }
    exports.$VV = $VV;
    class $WV {
        constructor(range, text, insertsAutoWhitespace = false) {
            this.a = range;
            this.b = text;
            this.insertsAutoWhitespace = insertsAutoWhitespace;
        }
        getEditOperations(model, builder) {
            builder.addTrackedEditOperation(this.a, this.b);
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            const srcRange = inverseEditOperations[0].range;
            return selection_1.$ms.fromPositions(srcRange.getStartPosition());
        }
    }
    exports.$WV = $WV;
    class $XV {
        constructor(range, text, lineNumberDeltaOffset, columnDeltaOffset, insertsAutoWhitespace = false) {
            this.a = range;
            this.b = text;
            this.c = columnDeltaOffset;
            this.d = lineNumberDeltaOffset;
            this.insertsAutoWhitespace = insertsAutoWhitespace;
        }
        getEditOperations(model, builder) {
            builder.addTrackedEditOperation(this.a, this.b);
        }
        computeCursorState(model, helper) {
            const inverseEditOperations = helper.getInverseEditOperations();
            const srcRange = inverseEditOperations[0].range;
            return selection_1.$ms.fromPositions(srcRange.getEndPosition().delta(this.d, this.c));
        }
    }
    exports.$XV = $XV;
    class $YV {
        constructor(editRange, text, initialSelection, forceMoveMarkers = false) {
            this.a = editRange;
            this.b = text;
            this.c = initialSelection;
            this.d = forceMoveMarkers;
            this.e = null;
        }
        getEditOperations(model, builder) {
            builder.addTrackedEditOperation(this.a, this.b, this.d);
            this.e = builder.trackSelection(this.c);
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this.e);
        }
    }
    exports.$YV = $YV;
});
//# sourceMappingURL=replaceCommand.js.map