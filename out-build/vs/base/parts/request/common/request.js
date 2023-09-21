/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ln = exports.$Kn = void 0;
    const offlineName = 'Offline';
    /**
     * Checks if the given error is offline error
     */
    function $Kn(error) {
        if (error instanceof $Ln) {
            return true;
        }
        return error instanceof Error && error.name === offlineName && error.message === offlineName;
    }
    exports.$Kn = $Kn;
    class $Ln extends Error {
        constructor() {
            super(offlineName);
            this.name = this.message;
        }
    }
    exports.$Ln = $Ln;
});
//# sourceMappingURL=request.js.map