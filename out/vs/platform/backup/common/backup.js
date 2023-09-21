/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isWorkspaceBackupInfo = exports.isFolderBackupInfo = void 0;
    function isFolderBackupInfo(curr) {
        return curr && curr.hasOwnProperty('folderUri');
    }
    exports.isFolderBackupInfo = isFolderBackupInfo;
    function isWorkspaceBackupInfo(curr) {
        return curr && curr.hasOwnProperty('workspace');
    }
    exports.isWorkspaceBackupInfo = isWorkspaceBackupInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja3VwLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vYmFja3VwL2NvbW1vbi9iYWNrdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxTQUFnQixrQkFBa0IsQ0FBQyxJQUE4QztRQUNoRixPQUFPLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFGRCxnREFFQztJQUVELFNBQWdCLHFCQUFxQixDQUFDLElBQThDO1FBQ25GLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUZELHNEQUVDIn0=