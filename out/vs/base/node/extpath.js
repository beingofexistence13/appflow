/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/strings", "vs/base/node/pfs"], function (require, exports, fs, path_1, platform_1, strings_1, pfs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.realpathSync = exports.realpath = exports.realcase = exports.realcaseSync = void 0;
    /**
     * Copied from: https://github.com/microsoft/vscode-node-debug/blob/master/src/node/pathUtilities.ts#L83
     *
     * Given an absolute, normalized, and existing file path 'realcase' returns the exact path that the file has on disk.
     * On a case insensitive file system, the returned path might differ from the original path by character casing.
     * On a case sensitive file system, the returned path will always be identical to the original path.
     * In case of errors, null is returned. But you cannot use this function to verify that a path exists.
     * realcaseSync does not handle '..' or '.' path segments and it does not take the locale into account.
     */
    function realcaseSync(path) {
        if (platform_1.isLinux) {
            // This method is unsupported on OS that have case sensitive
            // file system where the same path can exist in different forms
            // (see also https://github.com/microsoft/vscode/issues/139709)
            return path;
        }
        const dir = (0, path_1.dirname)(path);
        if (path === dir) { // end recursion
            return path;
        }
        const name = ((0, path_1.basename)(path) /* can be '' for windows drive letters */ || path).toLowerCase();
        try {
            const entries = (0, pfs_1.readdirSync)(dir);
            const found = entries.filter(e => e.toLowerCase() === name); // use a case insensitive search
            if (found.length === 1) {
                // on a case sensitive filesystem we cannot determine here, whether the file exists or not, hence we need the 'file exists' precondition
                const prefix = realcaseSync(dir); // recurse
                if (prefix) {
                    return (0, path_1.join)(prefix, found[0]);
                }
            }
            else if (found.length > 1) {
                // must be a case sensitive $filesystem
                const ix = found.indexOf(name);
                if (ix >= 0) { // case sensitive
                    const prefix = realcaseSync(dir); // recurse
                    if (prefix) {
                        return (0, path_1.join)(prefix, found[ix]);
                    }
                }
            }
        }
        catch (error) {
            // silently ignore error
        }
        return null;
    }
    exports.realcaseSync = realcaseSync;
    async function realcase(path) {
        if (platform_1.isLinux) {
            // This method is unsupported on OS that have case sensitive
            // file system where the same path can exist in different forms
            // (see also https://github.com/microsoft/vscode/issues/139709)
            return path;
        }
        const dir = (0, path_1.dirname)(path);
        if (path === dir) { // end recursion
            return path;
        }
        const name = ((0, path_1.basename)(path) /* can be '' for windows drive letters */ || path).toLowerCase();
        try {
            const entries = await pfs_1.Promises.readdir(dir);
            const found = entries.filter(e => e.toLowerCase() === name); // use a case insensitive search
            if (found.length === 1) {
                // on a case sensitive filesystem we cannot determine here, whether the file exists or not, hence we need the 'file exists' precondition
                const prefix = await realcase(dir); // recurse
                if (prefix) {
                    return (0, path_1.join)(prefix, found[0]);
                }
            }
            else if (found.length > 1) {
                // must be a case sensitive $filesystem
                const ix = found.indexOf(name);
                if (ix >= 0) { // case sensitive
                    const prefix = await realcase(dir); // recurse
                    if (prefix) {
                        return (0, path_1.join)(prefix, found[ix]);
                    }
                }
            }
        }
        catch (error) {
            // silently ignore error
        }
        return null;
    }
    exports.realcase = realcase;
    async function realpath(path) {
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
    exports.realpath = realpath;
    function realpathSync(path) {
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
    exports.realpathSync = realpathSync;
    function normalizePath(path) {
        return (0, strings_1.rtrim)((0, path_1.normalize)(path), path_1.sep);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0cGF0aC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2Uvbm9kZS9leHRwYXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRzs7Ozs7Ozs7T0FRRztJQUNILFNBQWdCLFlBQVksQ0FBQyxJQUFZO1FBQ3hDLElBQUksa0JBQU8sRUFBRTtZQUNaLDREQUE0RDtZQUM1RCwrREFBK0Q7WUFDL0QsK0RBQStEO1lBQy9ELE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsQ0FBQztRQUMxQixJQUFJLElBQUksS0FBSyxHQUFHLEVBQUUsRUFBRSxnQkFBZ0I7WUFDbkMsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE1BQU0sSUFBSSxHQUFHLENBQUMsSUFBQSxlQUFRLEVBQUMsSUFBSSxDQUFDLENBQUMseUNBQXlDLElBQUksSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDOUYsSUFBSTtZQUNILE1BQU0sT0FBTyxHQUFHLElBQUEsaUJBQVcsRUFBQyxHQUFHLENBQUMsQ0FBQztZQUNqQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsZ0NBQWdDO1lBQzdGLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3ZCLHdJQUF3STtnQkFDeEksTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUcsVUFBVTtnQkFDOUMsSUFBSSxNQUFNLEVBQUU7b0JBQ1gsT0FBTyxJQUFBLFdBQUksRUFBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzlCO2FBQ0Q7aUJBQU0sSUFB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