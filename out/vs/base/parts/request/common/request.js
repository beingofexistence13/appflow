/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OfflineError = exports.isOfflineError = void 0;
    const offlineName = 'Offline';
    /**
     * Checks if the given error is offline error
     */
    function isOfflineError(error) {
        if (error instanceof OfflineError) {
            return true;
        }
        return error instanceof Error && error.name === offlineName && error.message === offlineName;
    }
    exports.isOfflineError = isOfflineError;
    class OfflineError extends Error {
        constructor() {
            super(offlineName);
            this.name = this.message;
        }
    }
    exports.OfflineError = OfflineError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvcGFydHMvcmVxdWVzdC9jb21tb24vcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDO0lBRTlCOztPQUVHO0lBQ0gsU0FBZ0IsY0FBYyxDQUFDLEtBQVU7UUFDeEMsSUFBSSxLQUFLLFlBQVksWUFBWSxFQUFFO1lBQ2xDLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFDRCxPQUFPLEtBQUssWUFBWSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxXQUFXLElBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxXQUFXLENBQUM7SUFDOUYsQ0FBQztJQUxELHdDQUtDO0lBRUQsTUFBYSxZQUFhLFNBQVEsS0FBSztRQUN0QztZQUNDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDMUIsQ0FBQztLQUNEO0lBTEQsb0NBS0MifQ==