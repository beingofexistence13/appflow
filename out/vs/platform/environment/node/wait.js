/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "os", "vs/base/common/extpath"], function (require, exports, fs_1, os_1, extpath_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createWaitMarkerFileSync = void 0;
    function createWaitMarkerFileSync(verbose) {
        const randomWaitMarkerPath = (0, extpath_1.randomPath)((0, os_1.tmpdir)());
        try {
            (0, fs_1.writeFileSync)(randomWaitMarkerPath, ''); // use built-in fs to avoid dragging in more dependencies
            if (verbose) {
                console.log(`Marker file for --wait created: ${randomWaitMarkerPath}`);
            }
            return randomWaitMarkerPath;
        }
        catch (err) {
            if (verbose) {
                console.error(`Failed to create marker file for --wait: ${err}`);
            }
            return undefined;
        }
    }
    exports.createWaitMarkerFileSync = createWaitMarkerFileSync;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FpdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2Vudmlyb25tZW50L25vZGUvd2FpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsU0FBZ0Isd0JBQXdCLENBQUMsT0FBaUI7UUFDekQsTUFBTSxvQkFBb0IsR0FBRyxJQUFBLG9CQUFVLEVBQUMsSUFBQSxXQUFNLEdBQUUsQ0FBQyxDQUFDO1FBRWxELElBQUk7WUFDSCxJQUFBLGtCQUFhLEVBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyx5REFBeUQ7WUFDbEcsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO2FBQ3ZFO1lBQ0QsT0FBTyxvQkFBb0IsQ0FBQztTQUM1QjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ2IsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsR0FBRyxFQUFFLENBQUMsQ0FBQzthQUNqRTtZQUNELE9BQU8sU0FBUyxDQUFDO1NBQ2pCO0lBQ0YsQ0FBQztJQWZELDREQWVDIn0=