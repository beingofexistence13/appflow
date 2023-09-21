/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CursorChangeReason = void 0;
    /**
     * Describes the reason the cursor has changed its position.
     */
    var CursorChangeReason;
    (function (CursorChangeReason) {
        /**
         * Unknown or not set.
         */
        CursorChangeReason[CursorChangeReason["NotSet"] = 0] = "NotSet";
        /**
         * A `model.setValue()` was called.
         */
        CursorChangeReason[CursorChangeReason["ContentFlush"] = 1] = "ContentFlush";
        /**
         * The `model` has been changed outside of this cursor and the cursor recovers its position from associated markers.
         */
        CursorChangeReason[CursorChangeReason["RecoverFromMarkers"] = 2] = "RecoverFromMarkers";
        /**
         * There was an explicit user gesture.
         */
        CursorChangeReason[CursorChangeReason["Explicit"] = 3] = "Explicit";
        /**
         * There was a Paste.
         */
        CursorChangeReason[CursorChangeReason["Paste"] = 4] = "Paste";
        /**
         * There was an Undo.
         */
        CursorChangeReason[CursorChangeReason["Undo"] = 5] = "Undo";
        /**
         * There was a Redo.
         */
        CursorChangeReason[CursorChangeReason["Redo"] = 6] = "Redo";
    })(CursorChangeReason || (exports.CursorChangeReason = CursorChangeReason = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yRXZlbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jdXJzb3JFdmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHOztPQUVHO0lBQ0gsSUFBa0Isa0JBNkJqQjtJQTdCRCxXQUFrQixrQkFBa0I7UUFDbkM7O1dBRUc7UUFDSCwrREFBVSxDQUFBO1FBQ1Y7O1dBRUc7UUFDSCwyRUFBZ0IsQ0FBQTtRQUNoQjs7V0FFRztRQUNILHVGQUFzQixDQUFBO1FBQ3RCOztXQUVHO1FBQ0gsbUVBQVksQ0FBQTtRQUNaOztXQUVHO1FBQ0gsNkRBQVMsQ0FBQTtRQUNUOztXQUVHO1FBQ0gsMkRBQVEsQ0FBQTtRQUNSOztXQUVHO1FBQ0gsMkRBQVEsQ0FBQTtJQUNULENBQUMsRUE3QmlCLGtCQUFrQixrQ0FBbEIsa0JBQWtCLFFBNkJuQyJ9