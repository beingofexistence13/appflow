/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "os", "vs/base/common/extpath"], function (require, exports, fs_1, os_1, extpath_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$d7b = void 0;
    function $d7b(verbose) {
        const randomWaitMarkerPath = (0, extpath_1.$Qf)((0, os_1.tmpdir)());
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
    exports.$d7b = $d7b;
});
//# sourceMappingURL=wait.js.map