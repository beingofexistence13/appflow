/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$RM = exports.$QM = exports.$PM = void 0;
    /**
     * Aggressively escape non-windows paths to prepare for being sent to a shell. This will do some
     * escaping inaccurately to be careful about possible script injection via the file path. For
     * example, we're trying to prevent this sort of attack: `/foo/file$(echo evil)`.
     */
    function $PM(path) {
        let newPath = path;
        if (newPath.includes('\\')) {
            newPath = newPath.replace(/\\/g, '\\\\');
        }
        const bannedChars = /[\`\$\|\&\>\~\#\!\^\*\;\<\"\']/g;
        newPath = newPath.replace(bannedChars, '');
        return `'${newPath}'`;
    }
    exports.$PM = $PM;
    /**
     * Collapses the user's home directory into `~` if it exists within the path, this gives a shorter
     * path that is more suitable within the context of a terminal.
     */
    function $QM(path, userHome, separator) {
        if (!path) {
            return '';
        }
        if (!userHome) {
            return path;
        }
        // Trim the trailing separator from the end if it exists
        if (userHome.match(/[\/\\]$/)) {
            userHome = userHome.slice(0, userHome.length - 1);
        }
        const normalizedPath = path.replace(/\\/g, '/').toLowerCase();
        const normalizedUserHome = userHome.replace(/\\/g, '/').toLowerCase();
        if (!normalizedPath.includes(normalizedUserHome)) {
            return path;
        }
        return `~${separator}${path.slice(userHome.length + 1)}`;
    }
    exports.$QM = $QM;
    /**
     * Sanitizes a cwd string, removing any wrapping quotes and making the Windows drive letter
     * uppercase.
     * @param cwd The directory to sanitize.
     */
    function $RM(cwd) {
        // Sanity check that the cwd is not wrapped in quotes (see #160109)
        if (cwd.match(/^['"].*['"]$/)) {
            cwd = cwd.substring(1, cwd.length - 1);
        }
        // Make the drive letter uppercase on Windows (see #9448)
        if (platform_1.OS === 1 /* OperatingSystem.Windows */ && cwd && cwd[1] === ':') {
            return cwd[0].toUpperCase() + cwd.substring(1);
        }
        return cwd;
    }
    exports.$RM = $RM;
});
//# sourceMappingURL=terminalEnvironment.js.map