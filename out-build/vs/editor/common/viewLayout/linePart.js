/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LW = exports.LinePartMetadata = void 0;
    var LinePartMetadata;
    (function (LinePartMetadata) {
        LinePartMetadata[LinePartMetadata["IS_WHITESPACE"] = 1] = "IS_WHITESPACE";
        LinePartMetadata[LinePartMetadata["PSEUDO_BEFORE"] = 2] = "PSEUDO_BEFORE";
        LinePartMetadata[LinePartMetadata["PSEUDO_AFTER"] = 4] = "PSEUDO_AFTER";
        LinePartMetadata[LinePartMetadata["IS_WHITESPACE_MASK"] = 1] = "IS_WHITESPACE_MASK";
        LinePartMetadata[LinePartMetadata["PSEUDO_BEFORE_MASK"] = 2] = "PSEUDO_BEFORE_MASK";
        LinePartMetadata[LinePartMetadata["PSEUDO_AFTER_MASK"] = 4] = "PSEUDO_AFTER_MASK";
    })(LinePartMetadata || (exports.LinePartMetadata = LinePartMetadata = {}));
    class $LW {
        constructor(
        /**
         * last char index of this token (not inclusive).
         */
        endIndex, type, metadata, containsRTL) {
            this.endIndex = endIndex;
            this.type = type;
            this.metadata = metadata;
            this.containsRTL = containsRTL;
            this._linePartBrand = undefined;
        }
        isWhitespace() {
            return (this.metadata & 1 /* LinePartMetadata.IS_WHITESPACE_MASK */ ? true : false);
        }
        isPseudoAfter() {
            return (this.metadata & 4 /* LinePartMetadata.PSEUDO_AFTER_MASK */ ? true : false);
        }
    }
    exports.$LW = $LW;
});
//# sourceMappingURL=linePart.js.map