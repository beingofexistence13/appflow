/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sanitizeCwd = exports.collapseTildePath = exports.escapeNonWindowsPath = void 0;
    /**
     * Aggressively escape non-windows paths to prepare for being sent to a shell. This will do some
     * escaping inaccurately to be careful about possible script injection via the file path. For
     * example, we're trying to prevent this sort of attack: `/foo/file$(echo evil)`.
     */
    function escapeNonWindowsPath(path) {
        let newPath = path;
        if (newPath.includes('\\')) {
            newPath = newPath.replace(/\\/g, '\\\\');
        }
        const bannedChars = /[\`\$\|\&\>\~\#\!\^\*\;\<\"\']/g;
        newPath = newPath.replace(bannedChars, '');
        return `'${newPath}'`;
    }
    exports.escapeNonWindowsPath = escapeNonWindowsPath;
    /**
     * Collapses the user's home directory into `~` if it exists within the path, this gives a shorter
     * path that is more suitable within the context of a terminal.
     */
    function collapseTildePath(path, userHome, separator) {
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
    exports.collapseTildePath = collapseTildePath;
    /**
     * Sanitizes a cwd string, removing any wrapping quotes and making the Windows drive letter
     * uppercase.
     * @param cwd The directory to sanitize.
     */
    function sanitizeCwd(cwd) {
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
    exports.sanitizeCwd = sanitizeCwd;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFbnZpcm9ubWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Rlcm1pbmFsL2NvbW1vbi90ZXJtaW5hbEVudmlyb25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRzs7OztPQUlHO0lBQ0gsU0FBZ0Isb0JBQW9CLENBQUMsSUFBWTtRQUNoRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDbkIsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzNCLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztTQUN6QztRQUNELE1BQU0sV0FBVyxHQUFHLGlDQUFpQyxDQUFDO1FBQ3RELE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzQyxPQUFPLElBQUksT0FBTyxHQUFHLENBQUM7SUFDdkIsQ0FBQztJQVJELG9EQVFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsSUFBd0IsRUFBRSxRQUE0QixFQUFFLFNBQWlCO1FBQzFHLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVixPQUFPLEVBQUUsQ0FBQztTQUNWO1FBQ0QsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNkLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFDRCx3REFBd0Q7UUFDeEQsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzlCLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2xEO1FBQ0QsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDOUQsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN0RSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1lBQ2pELE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFDRCxPQUFPLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQzFELENBQUM7SUFqQkQsOENBaUJDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQWdCLFdBQVcsQ0FBQyxHQUFXO1FBQ3RDLG1FQUFtRTtRQUNuRSxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDOUIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDdkM7UUFDRCx5REFBeUQ7UUFDekQsSUFBSSxhQUFFLG9DQUE0QixJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQzVELE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDL0M7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFWRCxrQ0FVQyJ9