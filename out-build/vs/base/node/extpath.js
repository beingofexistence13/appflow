/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/strings", "vs/base/node/pfs"], function (require, exports, fs, path_1, platform_1, strings_1, pfs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Xp = exports.$Wp = exports.$Vp = exports.$Up = void 0;
    /**
     * Copied from: https://github.com/microsoft/vscode-node-debug/blob/master/src/node/pathUtilities.ts#L83
     *
     * Given an absolute, normalized, and existing file path 'realcase' returns the exact path that the file has on disk.
     * On a case insensitive file system, the returned path might differ from the original path by character casing.
     * On a case sensitive file system, the returned path will always be identical to the original path.
     * In case of errors, null is returned. But you cannot use this function to verify that a path exists.
     * realcaseSync does not handle '..' or '.' path segments and it does not take the locale into account.
     */
    function $Up(path) {
        if (platform_1.$k) {
            // This method is unsupported on OS that have case sensitive
            // file system where the same path can exist in different forms
            // (see also https://github.com/microsoft/vscode/issues/139709)
            return path;
        }
        const dir = (0, path_1.$_d)(path);
        if (path === dir) { // end recursion
            return path;
        }
        const name = ((0, path_1.$ae)(path) /* can be '' for windows drive letters */ || path).toLowerCase();
        try {
            const entries = (0, pfs_1.readdirSync)(dir);
            const found = entries.filter(e => e.toLowerCase() === name); // use a case insensitive search
            if (found.length === 1) {
                // on a case sensitive filesystem we cannot determine here, whether the file exists or not, hence we need the 'file exists' precondition
                const prefix = $Up(dir); // recurse
                if (prefix) {
                    return (0, path_1.$9d)(prefix, found[0]);
                }
            }
            else if (found.length > 1) {
                // must be a case sensitive $filesystem
                const ix = found.indexOf(name);
                if (ix >= 0) { // case sensitive
                    const prefix = $Up(dir); // recurse
                    if (prefix) {
                        return (0, path_1.$9d)(prefix, found[ix]);
                    }
                }
            }
        }
        catch (error) {
            // silently ignore error
        }
        return null;
    }
    exports.$Up = $Up;
    async function $Vp(path) {
        if (platform_1.$k) {
            // This method is unsupported on OS that have case sensitive
            // file system where the same path can exist in different forms
            // (see also https://github.com/microsoft/vscode/issues/139709)
            return path;
        }
        const dir = (0, path_1.$_d)(path);
        if (path === dir) { // end recursion
            return path;
        }
        const name = ((0, path_1.$ae)(path) /* can be '' for windows drive letters */ || path).toLowerCase();
        try {
            const entries = await pfs_1.Promises.readdir(dir);
            const found = entries.filter(e => e.toLowerCase() === name); // use a case insensitive search
            if (found.length === 1) {
                // on a case sensitive filesystem we cannot determine here, whether the file exists or not, hence we need the 'file exists' precondition
                const prefix = await $Vp(dir); // recurse
                if (prefix) {
                    return (0, path_1.$9d)(prefix, found[0]);
                }
            }
            else if (found.length > 1) {
                // must be a case sensitive $filesystem
                const ix = found.indexOf(name);
                if (ix >= 0) { // case sensitive
                    const prefix = await $Vp(dir); // recurse
                    if (prefix) {
                        return (0, path_1.$9d)(prefix, found[ix]);
                    }
                }
            }
        }
        catch (error) {
            // silently ignore error
        }
        return null;
    }
    exports.$Vp = $Vp;
    async function $Wp(path) {
        try {
            // DO NOT USE `fs.promises.realpath` here as it internally
            // calls `fs.native.realpath` which will result in subst
            // drives to be resolved to their target on Windows
            // https://github.com/microsoft/vscode/issues/118562
            return await pfs_1.Promises.realpath(path);
        }
        catch (error) {
            // We hit an error calling fs.realpath(). Since fs.realpath() is doing some path normalization
            // we now do a similar normalization and then try again if we can access the path with read
            // permissions at least. If that succeeds, we return that path.
            // fs.realpath() is resolving symlinks and that can fail in certain cases. The workaround is
            // to not resolve links but to simply see if the path is read accessible or not.
            const normalizedPath = normalizePath(path);
            await pfs_1.Promises.access(normalizedPath, fs.constants.R_OK);
            return normalizedPath;
        }
    }
    exports.$Wp = $Wp;
    function $Xp(path) {
        try {
            return fs.realpathSync(path);
        }
        catch (error) {
            // We hit an error calling fs.realpathSync(). Since fs.realpathSync() is doing some path normalization
            // we now do a similar normalization and then try again if we can access the path with read
            // permissions at least. If that succeeds, we return that path.
            // fs.realpath() is resolving symlinks and that can fail in certain cases. The workaround is
            // to not resolve links but to simply see if the path is read accessible or not.
            const normalizedPath = normalizePath(path);
            fs.accessSync(normalizedPath, fs.constants.R_OK); // throws in case of an error
            return normalizedPath;
        }
    }
    exports.$Xp = $Xp;
    function normalizePath(path) {
        return (0, strings_1.$ve)((0, path_1.$7d)(path), path_1.sep);
    }
});
//# sourceMappingURL=extpath.js.map