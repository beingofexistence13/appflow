/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextSearchCompleteMessageType = exports.$iI = exports.$hI = void 0;
    class $hI {
        constructor(line, character) {
            this.line = line;
            this.character = character;
        }
        isBefore(other) { return false; }
        isBeforeOrEqual(other) { return false; }
        isAfter(other) { return false; }
        isAfterOrEqual(other) { return false; }
        isEqual(other) { return false; }
        compareTo(other) { return 0; }
        translate(_, _2) { return new $hI(0, 0); }
        with(_) { return new $hI(0, 0); }
    }
    exports.$hI = $hI;
    class $iI {
        constructor(startLine, startCol, endLine, endCol) {
            this.isEmpty = false;
            this.isSingleLine = false;
            this.start = new $hI(startLine, startCol);
            this.end = new $hI(endLine, endCol);
        }
        contains(positionOrRange) { return false; }
        isEqual(other) { return false; }
        intersection(range) { return undefined; }
        union(other) { return new $iI(0, 0, 0, 0); }
        with(_) { return new $iI(0, 0, 0, 0); }
    }
    exports.$iI = $iI;
    /**
     * Represents the severity of a TextSearchComplete message.
     */
    var TextSearchCompleteMessageType;
    (function (TextSearchCompleteMessageType) {
        TextSearchCompleteMessageType[TextSearchCompleteMessageType["Information"] = 1] = "Information";
        TextSearchCompleteMessageType[TextSearchCompleteMessageType["Warning"] = 2] = "Warning";
    })(TextSearchCompleteMessageType || (exports.TextSearchCompleteMessageType = TextSearchCompleteMessageType = {}));
});
//# sourceMappingURL=searchExtTypes.js.map