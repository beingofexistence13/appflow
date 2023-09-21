/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/path", "vs/base/common/normalization", "vs/base/common/extpath", "vs/base/common/platform", "vs/base/common/strings", "vs/workbench/services/search/node/ripgrepSearchUtils", "@vscode/ripgrep"], function (require, exports, cp, path, normalization_1, extpath, platform_1, strings, ripgrepSearchUtils_1, ripgrep_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fixDriveC = exports.getAbsoluteGlob = exports.spawnRipgrepCmd = void 0;
    // If @vscode/ripgrep is in an .asar file, then the binary is unpacked.
    const rgDiskPath = ripgrep_1.rgPath.replace(/\bnode_modules\.asar\b/, 'node_modules.asar.unpacked');
    function spawnRipgrepCmd(config, folderQuery, includePattern, excludePattern) {
        const rgArgs = getRgArgs(config, folderQuery, includePattern, excludePattern);
        const cwd = folderQuery.folder.fsPath;
        return {
            cmd: cp.spawn(rgDiskPath, rgArgs.args, { cwd }),
            rgDiskPath,
            siblingClauses: rgArgs.siblingClauses,
            rgArgs,
            cwd
        };
    }
    exports.spawnRipgrepCmd = spawnRipgrepCmd;
    function getRgArgs(config, folderQuery, includePattern, excludePattern) {
        const args = ['--files', '--hidden', '--case-sensitive', '--no-require-git'];
        // includePattern can't have siblingClauses
        foldersToIncludeGlobs([folderQuery], includePattern, false).forEach(globArg => {
            const inclusion = (0, ripgrepSearchUtils_1.anchorGlob)(globArg);
            args.push('-g', inclusion);
            if (platform_1.isMacintosh) {
                const normalized = (0, normalization_1.normalizeNFD)(inclusion);
                if (normalized !== inclusion) {
                    args.push('-g', normalized);
                }
            }
        });
        const rgGlobs = foldersToRgExcludeGlobs([folderQuery], excludePattern, undefined, false);
        rgGlobs.globArgs.forEach(globArg => {
            const exclusion = `!${(0, ripgrepSearchUtils_1.anchorGlob)(globArg)}`;
            args.push('-g', exclusion);
            if (platform_1.isMacintosh) {
                const normalized = (0, normalization_1.normalizeNFD)(exclusion);
                if (normalized !== exclusion) {
                    args.push('-g', normalized);
                }
            }
        });
        if (folderQuery.disregardIgnoreFiles !== false) {
            // Don't use .gitignore or .ignore
            args.push('--no-ignore');
        }
        else if (folderQuery.disregardParentIgnoreFiles !== false) {
            args.push('--no-ignore-parent');
        }
        // Follow symlinks
        if (!folderQuery.ignoreSymlinks) {
            args.push('--follow');
        }
        if (config.exists) {
            args.push('--quiet');
        }
        args.push('--no-config');
        if (folderQuery.disregardGlobalIgnoreFiles) {
            args.push('--no-ignore-global');
        }
        return {
            args,
            siblingClauses: rgGlobs.siblingClauses
        };
    }
    function foldersToRgExcludeGlobs(folderQueries, globalExclude, excludesToSkip, absoluteGlobs = true) {
        const globArgs = [];
        let siblingClauses = {};
        folderQueries.forEach(folderQuery => {
            const totalExcludePattern = Object.assign({}, folderQuery.excludePattern || {}, globalExclude || {});
            const result = globExprsToRgGlobs(totalExcludePattern, absoluteGlobs ? folderQuery.folder.fsPath : undefined, excludesToSkip);
            globArgs.push(...result.globArgs);
            if (result.siblingClauses) {
                siblingClauses = Object.assign(siblingClauses, result.siblingClauses);
            }
        });
        return { globArgs, siblingClauses };
    }
    function foldersToIncludeGlobs(folderQueries, globalInclude, absoluteGlobs = true) {
        const globArgs = [];
        folderQueries.forEach(folderQuery => {
            const totalIncludePattern = Object.assign({}, globalInclude || {}, folderQuery.includePattern || {});
            const result = globExprsToRgGlobs(totalIncludePattern, absoluteGlobs ? folderQuery.folder.fsPath : undefined);
            globArgs.push(...result.globArgs);
        });
        return globArgs;
    }
    function globExprsToRgGlobs(patterns, folder, excludesToSkip) {
        const globArgs = [];
        const siblingClauses = {};
        Object.keys(patterns)
            .forEach(key => {
            if (excludesToSkip && excludesToSkip.has(key)) {
                return;
            }
            if (!key) {
                return;
            }
            const value = patterns[key];
            key = trimTrailingSlash(folder ? getAbsoluteGlob(folder, key) : key);
            // glob.ts requires forward slashes, but a UNC path still must start with \\
            // #38165 and #38151
            if (key.startsWith('\\\\')) {
                key = '\\\\' + key.substr(2).replace(/\\/g, '/');
            }
            else {
                key = key.replace(/\\/g, '/');
            }
            if (typeof value === 'boolean' && value) {
                if (key.startsWith('\\\\')) {
                    // Absolute globs UNC paths don't work properly, see #58758
                    key += '**';
                }
                globArgs.push(fixDriveC(key));
            }
            else if (value && value.when) {
                siblingClauses[key] = value;
            }
        });
        return { globArgs, siblingClauses };
    }
    /**
     * Resolves a glob like "node_modules/**" in "/foo/bar" to "/foo/bar/node_modules/**".
     * Special cases C:/foo paths to write the glob like /foo instead - see https://github.com/BurntSushi/ripgrep/issues/530.
     *
     * Exported for testing
     */
    function getAbsoluteGlob(folder, key) {
        return path.isAbsolute(key) ?
            key :
            path.join(folder, key);
    }
    exports.getAbsoluteGlob = getAbsoluteGlob;
    function trimTrailingSlash(str) {
        str = strings.rtrim(str, '\\');
        return strings.rtrim(str, '/');
    }
    function fixDriveC(path) {
        const root = extpath.getRoot(path);
        return root.toLowerCase() === 'c:/' ?
            path.replace(/^c:[/\\]/i, '/') :
            path;
    }
    exports.fixDriveC = fixDriveC;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlwZ3JlcEZpbGVTZWFyY2guanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL25vZGUvcmlwZ3JlcEZpbGVTZWFyY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLHVFQUF1RTtJQUN2RSxNQUFNLFVBQVUsR0FBRyxnQkFBTSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO0lBRTFGLFNBQWdCLGVBQWUsQ0FBQyxNQUFrQixFQUFFLFdBQXlCLEVBQUUsY0FBaUMsRUFBRSxjQUFpQztRQUNsSixNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDOUUsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDdEMsT0FBTztZQUNOLEdBQUcsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDL0MsVUFBVTtZQUNWLGNBQWMsRUFBRSxNQUFNLENBQUMsY0FBYztZQUNyQyxNQUFNO1lBQ04sR0FBRztTQUNILENBQUM7SUFDSCxDQUFDO0lBVkQsMENBVUM7SUFFRCxTQUFTLFNBQVMsQ0FBQyxNQUFrQixFQUFFLFdBQXlCLEVBQUUsY0FBaUMsRUFBRSxjQUFpQztRQUNySSxNQUFNLElBQUksR0FBRyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUU3RSwyQ0FBMkM7UUFDM0MscUJBQXFCLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzdF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