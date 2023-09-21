/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StickyModel = exports.StickyElement = exports.StickyRange = void 0;
    class StickyRange {
        constructor(startLineNumber, endLineNumber) {
            this.startLineNumber = startLineNumber;
            this.endLineNumber = endLineNumber;
        }
    }
    exports.StickyRange = StickyRange;
    class StickyElement {
        constructor(
        /**
         * Range of line numbers spanned by the current scope
         */
        range, 
        /**
         * Must be sorted by start line number
        */
        children, 
        /**
         * Parent sticky outline element
         */
        parent) {
            this.range = range;
            this.children = children;
            this.parent = parent;
        }
    }
    exports.StickyElement = StickyElement;
    class StickyModel {
        constructor(uri, version, element, outlineProviderId) {
            this.uri = uri;
            this.version = version;
            this.element = element;
            this.outlineProviderId = outlineProviderId;
        }
    }
    exports.StickyModel = StickyModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5U2Nyb2xsRWxlbWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3N0aWNreVNjcm9sbC9icm93c2VyL3N0aWNreVNjcm9sbEVsZW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLE1BQWEsV0FBVztRQUN2QixZQUNpQixlQUF1QixFQUN2QixhQUFxQjtZQURyQixvQkFBZSxHQUFmLGVBQWUsQ0FBUTtZQUN2QixrQkFBYSxHQUFiLGFBQWEsQ0FBUTtRQUNsQyxDQUFDO0tBQ0w7SUFMRCxrQ0FLQztJQUVELE1BQWEsYUFBYTtRQUV6QjtRQUNDOztXQUVHO1FBQ2EsS0FBOEI7UUFDOUM7O1VBRUU7UUFDYyxRQUF5QjtRQUN6Qzs7V0FFRztRQUNhLE1BQWlDO1lBUmpDLFVBQUssR0FBTCxLQUFLLENBQXlCO1lBSTlCLGFBQVEsR0FBUixRQUFRLENBQWlCO1lBSXpCLFdBQU0sR0FBTixNQUFNLENBQTJCO1FBRWxELENBQUM7S0FDRDtJQWpCRCxzQ0FpQkM7SUFFRCxNQUFhLFdBQVc7UUFDdkIsWUFDVSxHQUFRLEVBQ1IsT0FBZSxFQUNmLE9BQWtDLEVBQ2xDLGlCQUFxQztZQUhyQyxRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1IsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUNmLFlBQU8sR0FBUCxPQUFPLENBQTJCO1lBQ2xDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7UUFDM0MsQ0FBQztLQUNMO0lBUEQsa0NBT0MifQ==