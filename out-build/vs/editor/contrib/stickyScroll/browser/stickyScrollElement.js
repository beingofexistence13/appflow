/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Q0 = exports.$P0 = exports.$O0 = void 0;
    class $O0 {
        constructor(startLineNumber, endLineNumber) {
            this.startLineNumber = startLineNumber;
            this.endLineNumber = endLineNumber;
        }
    }
    exports.$O0 = $O0;
    class $P0 {
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
    exports.$P0 = $P0;
    class $Q0 {
        constructor(uri, version, element, outlineProviderId) {
            this.uri = uri;
            this.version = version;
            this.element = element;
            this.outlineProviderId = outlineProviderId;
        }
    }
    exports.$Q0 = $Q0;
});
//# sourceMappingURL=stickyScrollElement.js.map