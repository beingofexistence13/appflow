/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinePart = exports.LinePartMetadata = void 0;
    var LinePartMetadata;
    (function (LinePartMetadata) {
        LinePartMetadata[LinePartMetadata["IS_WHITESPACE"] = 1] = "IS_WHITESPACE";
        LinePartMetadata[LinePartMetadata["PSEUDO_BEFORE"] = 2] = "PSEUDO_BEFORE";
        LinePartMetadata[LinePartMetadata["PSEUDO_AFTER"] = 4] = "PSEUDO_AFTER";
        LinePartMetadata[LinePartMetadata["IS_WHITESPACE_MASK"] = 1] = "IS_WHITESPACE_MASK";
        LinePartMetadata[LinePartMetadata["PSEUDO_BEFORE_MASK"] = 2] = "PSEUDO_BEFORE_MASK";
        LinePartMetadata[LinePartMetadata["PSEUDO_AFTER_MASK"] = 4] = "PSEUDO_AFTER_MASK";
    })(LinePartMetadata || (exports.LinePartMetadata = LinePartMetadata = {}));
    class LinePart {
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
    exports.LinePart = LinePart;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZVBhcnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3ZpZXdMYXlvdXQvbGluZVBhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHLElBQWtCLGdCQVFqQjtJQVJELFdBQWtCLGdCQUFnQjtRQUNqQyx5RUFBaUIsQ0FBQTtRQUNqQix5RUFBaUIsQ0FBQTtRQUNqQix1RUFBZ0IsQ0FBQTtRQUVoQixtRkFBMEIsQ0FBQTtRQUMxQixtRkFBMEIsQ0FBQTtRQUMxQixpRkFBeUIsQ0FBQTtJQUMxQixDQUFDLEVBUmlCLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBUWpDO0lBRUQsTUFBYSxRQUFRO1FBR3BCO1FBQ0M7O1dBRUc7UUFDYSxRQUFnQixFQUNoQixJQUFZLEVBQ1osUUFBZ0IsRUFDaEIsV0FBb0I7WUFIcEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUNoQixTQUFJLEdBQUosSUFBSSxDQUFRO1lBQ1osYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUNoQixnQkFBVyxHQUFYLFdBQVcsQ0FBUztZQVRyQyxtQkFBYyxHQUFTLFNBQVMsQ0FBQztRQVU3QixDQUFDO1FBRUUsWUFBWTtZQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsOENBQXNDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLDZDQUFxQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVFLENBQUM7S0FDRDtJQXBCRCw0QkFvQkMifQ==