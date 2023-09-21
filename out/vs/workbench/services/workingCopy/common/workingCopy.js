/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NO_TYPE_ID = exports.WorkingCopyCapabilities = void 0;
    var WorkingCopyCapabilities;
    (function (WorkingCopyCapabilities) {
        /**
         * Signals no specific capability for the working copy.
         */
        WorkingCopyCapabilities[WorkingCopyCapabilities["None"] = 0] = "None";
        /**
         * Signals that the working copy requires
         * additional input when saving, e.g. an
         * associated path to save to.
         */
        WorkingCopyCapabilities[WorkingCopyCapabilities["Untitled"] = 2] = "Untitled";
        /**
         * The working copy will not indicate that
         * it is dirty and unsaved content will be
         * discarded without prompting if closed.
         */
        WorkingCopyCapabilities[WorkingCopyCapabilities["Scratchpad"] = 4] = "Scratchpad";
    })(WorkingCopyCapabilities || (exports.WorkingCopyCapabilities = WorkingCopyCapabilities = {}));
    /**
     * @deprecated it is important to provide a type identifier
     * for working copies to enable all capabilities.
     */
    exports.NO_TYPE_ID = '';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvd29ya2luZ0NvcHkvY29tbW9uL3dvcmtpbmdDb3B5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxJQUFrQix1QkFvQmpCO0lBcEJELFdBQWtCLHVCQUF1QjtRQUV4Qzs7V0FFRztRQUNILHFFQUFRLENBQUE7UUFFUjs7OztXQUlHO1FBQ0gsNkVBQWlCLENBQUE7UUFFakI7Ozs7V0FJRztRQUNILGlGQUFtQixDQUFBO0lBQ3BCLENBQUMsRUFwQmlCLHVCQUF1Qix1Q0FBdkIsdUJBQXVCLFFBb0J4QztJQTBDRDs7O09BR0c7SUFDVSxRQUFBLFVBQVUsR0FBRyxFQUFFLENBQUMifQ==