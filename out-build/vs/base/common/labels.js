/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/extpath", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/strings"], function (require, exports, arrays_1, extpath_1, path_1, platform_1, resources_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nA = exports.$mA = exports.$lA = exports.$kA = exports.$jA = exports.$iA = exports.$hA = exports.$gA = exports.$fA = exports.$eA = void 0;
    function $eA(resource, formatting) {
        const { os, tildify: tildifier, relative: relatifier } = formatting;
        // return early with a relative path if we can resolve one
        if (relatifier) {
            const relativePath = getRelativePathLabel(resource, relatifier, os);
            if (typeof relativePath === 'string') {
                return relativePath;
            }
        }
        // otherwise try to resolve a absolute path label and
        // apply target OS standard path separators if target
        // OS differs from actual OS we are running in
        let absolutePath = resource.fsPath;
        if (os === 1 /* OperatingSystem.Windows */ && !platform_1.$i) {
            absolutePath = absolutePath.replace(/\//g, '\\');
        }
        else if (os !== 1 /* OperatingSystem.Windows */ && platform_1.$i) {
            absolutePath = absolutePath.replace(/\\/g, '/');
        }
        // macOS/Linux: tildify with provided user home directory
        if (os !== 1 /* OperatingSystem.Windows */ && tildifier?.userHome) {
            const userHome = tildifier.userHome.fsPath;
            // This is a bit of a hack, but in order to figure out if the
            // resource is in the user home, we need to make sure to convert it
            // to a user home resource. We cannot assume that the resource is
            // already a user home resource.
            let userHomeCandidate;
            if (resource.scheme !== tildifier.userHome.scheme && resource.path.startsWith(path_1.$6d.sep)) {
                userHomeCandidate = tildifier.userHome.with({ path: resource.path }).fsPath;
            }
            else {
                userHomeCandidate = resource.fsPath;
            }
            absolutePath = $gA(userHomeCandidate, userHome, os);
        }
        // normalize
        const pathLib = os === 1 /* OperatingSystem.Windows */ ? path_1.$5d : path_1.$6d;
        return pathLib.normalize($fA(absolutePath, os === 1 /* OperatingSystem.Windows */));
    }
    exports.$eA = $eA;
    function getRelativePathLabel(resource, relativePathProvider, os) {
        const pathLib = os === 1 /* OperatingSystem.Windows */ ? path_1.$5d : path_1.$6d;
        const extUriLib = os === 3 /* OperatingSystem.Linux */ ? resources_1.$$f : resources_1.$ag;
        const workspace = relativePathProvider.getWorkspace();
        const firstFolder = (0, arrays_1.$Mb)(workspace.folders);
        if (!firstFolder) {
            return undefined;
        }
        // This is a bit of a hack, but in order to figure out the folder
        // the resource belongs to, we need to make sure to convert it
        // to a workspace resource. We cannot assume that the resource is
        // already matching the workspace.
        if (resource.scheme !== firstFolder.uri.scheme && resource.path.startsWith(path_1.$6d.sep)) {
            resource = firstFolder.uri.with({ path: resource.path });
        }
        const folder = relativePathProvider.getWorkspaceFolder(resource);
        if (!folder) {
            return undefined;
        }
        let relativePathLabel = undefined;
        if (extUriLib.isEqual(folder.uri, resource)) {
            relativePathLabel = ''; // no label if paths are identical
        }
        else {
            relativePathLabel = extUriLib.relativePath(folder.uri, resource) ?? '';
        }
        // normalize
        if (relativePathLabel) {
            relativePathLabel = pathLib.normalize(relativePathLabel);
        }
        // always show root basename if there are multiple folders
        if (workspace.folders.length > 1 && !relativePathProvider.noPrefix) {
            const rootName = folder.name ? folder.name : extUriLib.basenameOrAuthority(folder.uri);
            relativePathLabel = relativePathLabel ? `${rootName} • ${relativePathLabel}` : rootName;
        }
        return relativePathLabel;
    }
    function $fA(path, isWindowsOS = platform_1.$i) {
        if ((0, extpath_1.$Mf)(path, isWindowsOS)) {
            return path.charAt(0).toUpperCase() + path.slice(1);
        }
        return path;
    }
    exports.$fA = $fA;
    let normalizedUserHomeCached = Object.create(null);
    function $gA(path, userHome, os = platform_1.OS) {
        if (os === 1 /* OperatingSystem.Windows */ || !path || !userHome) {
            return path; // unsupported on Windows
        }
        let normalizedUserHome = normalizedUserHomeCached.original === userHome ? normalizedUserHomeCached.normalized : undefined;
        if (!normalizedUserHome) {
            normalizedUserHome = userHome;
            if (platform_1.$i) {
                normalizedUserHome = (0, extpath_1.$Cf)(normalizedUserHome); // make sure that the path is POSIX normalized on Windows
            }
            normalizedUserHome = `${(0, strings_1.$ve)(normalizedUserHome, path_1.$6d.sep)}${path_1.$6d.sep}`;
            normalizedUserHomeCached = { original: userHome, normalized: normalizedUserHome };
        }
        let normalizedPath = path;
        if (platform_1.$i) {
            normalizedPath = (0, extpath_1.$Cf)(normalizedPath); // make sure that the path is POSIX normalized on Windows
        }
        // Linux: case sensitive, macOS: case insensitive
        if (os === 3 /* OperatingSystem.Linux */ ? normalizedPath.startsWith(normalizedUserHome) : (0, strings_1.$Ne)(normalizedPath, normalizedUserHome)) {
            return `~/${normalizedPath.substr(normalizedUserHome.length)}`;
        }
        return path;
    }
    exports.$gA = $gA;
    function $hA(path, userHome) {
        return path.replace(/^~($|\/|\\)/, `${userHome}$1`);
    }
    exports.$hA = $hA;
    /**
     * Shortens the paths but keeps them easy to distinguish.
     * Replaces not important parts with ellipsis.
     * Every shorten path matches only one original path and vice versa.
     *
     * Algorithm for shortening paths is as follows:
     * 1. For every path in list, find unique substring of that path.
     * 2. Unique substring along with ellipsis is shortened path of that path.
     * 3. To find unique substring of path, consider every segment of length from 1 to path.length of path from end of string
     *    and if present segment is not substring to any other paths then present segment is unique path,
     *    else check if it is not present as suffix of any other path and present segment is suffix of path itself,
     *    if it is true take present segment as unique path.
     * 4. Apply ellipsis to unique segment according to whether segment is present at start/in-between/end of path.
     *
     * Example 1
     * 1. consider 2 paths i.e. ['a\\b\\c\\d', 'a\\f\\b\\c\\d']
     * 2. find unique path of first path,
     * 	a. 'd' is present in path2 and is suffix of path2, hence not unique of present path.
     * 	b. 'c' is present in path2 and 'c' is not suffix of present path, similarly for 'b' and 'a' also.
     * 	c. 'd\\c' is suffix of path2.
     *  d. 'b\\c' is not suffix of present path.
     *  e. 'a\\b' is not present in path2, hence unique path is 'a\\b...'.
     * 3. for path2, 'f' is not present in path1 hence unique is '...\\f\\...'.
     *
     * Example 2
     * 1. consider 2 paths i.e. ['a\\b', 'a\\b\\c'].
     * 	a. Even if 'b' is present in path2, as 'b' is suffix of path1 and is not suffix of path2, unique path will be '...\\b'.
     * 2. for path2, 'c' is not present in path1 hence unique path is '..\\c'.
     */
    const ellipsis = '\u2026';
    const unc = '\\\\';
    const home = '~';
    function $iA(paths, pathSeparator = path_1.sep) {
        const shortenedPaths = new Array(paths.length);
        // for every path
        let match = false;
        for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
            const originalPath = paths[pathIndex];
            if (originalPath === '') {
                shortenedPaths[pathIndex] = `.${pathSeparator}`;
                continue;
            }
            if (!originalPath) {
                shortenedPaths[pathIndex] = originalPath;
                continue;
            }
            match = true;
            // trim for now and concatenate unc path (e.g. \\network) or root path (/etc, ~/etc) later
            let prefix = '';
            let trimmedPath = originalPath;
            if (trimmedPath.indexOf(unc) === 0) {
                prefix = trimmedPath.substr(0, trimmedPath.indexOf(unc) + unc.length);
                trimmedPath = trimmedPath.substr(trimmedPath.indexOf(unc) + unc.length);
            }
            else if (trimmedPath.indexOf(pathSeparator) === 0) {
                prefix = trimmedPath.substr(0, trimmedPath.indexOf(pathSeparator) + pathSeparator.length);
                trimmedPath = trimmedPath.substr(trimmedPath.indexOf(pathSeparator) + pathSeparator.length);
            }
            else if (trimmedPath.indexOf(home) === 0) {
                prefix = trimmedPath.substr(0, trimmedPath.indexOf(home) + home.length);
                trimmedPath = trimmedPath.substr(trimmedPath.indexOf(home) + home.length);
            }
            // pick the first shortest subpath found
            const segments = trimmedPath.split(pathSeparator);
            for (let subpathLength = 1; match && subpathLength <= segments.length; subpathLength++) {
                for (let start = segments.length - subpathLength; match && start >= 0; start--) {
                    match = false;
                    let subpath = segments.slice(start, start + subpathLength).join(pathSeparator);
                    // that is unique to any other path
                    for (let otherPathIndex = 0; !match && otherPathIndex < paths.length; otherPathIndex++) {
                        // suffix subpath treated specially as we consider no match 'x' and 'x/...'
                        if (otherPathIndex !== pathIndex && paths[otherPathIndex] && paths[otherPathIndex].indexOf(subpath) > -1) {
                            const isSubpathEnding = (start + subpathLength === segments.length);
                            // Adding separator as prefix for subpath, such that 'endsWith(src, trgt)' considers subpath as directory name instead of plain string.
                            // prefix is not added when either subpath is root directory or path[otherPathIndex] does not have multiple directories.
                            const subpathWithSep = (start > 0 && paths[otherPathIndex].indexOf(pathSeparator) > -1) ? pathSeparator + subpath : subpath;
                            const isOtherPathEnding = paths[otherPathIndex].endsWith(subpathWithSep);
                            match = !isSubpathEnding || isOtherPathEnding;
                        }
                    }
                    // found unique subpath
                    if (!match) {
                        let result = '';
                        // preserve disk drive or root prefix
                        if (segments[0].endsWith(':') || prefix !== '') {
                            if (start === 1) {
                                // extend subpath to include disk drive prefix
                                start = 0;
                                subpathLength++;
                                subpath = segments[0] + pathSeparator + subpath;
                            }
                            if (start > 0) {
                                result = segments[0] + pathSeparator;
                            }
                            result = prefix + result;
                        }
                        // add ellipsis at the beginning if needed
                        if (start > 0) {
                            result = result + ellipsis + pathSeparator;
                        }
                        result = result + subpath;
                        // add ellipsis at the end if needed
                        if (start + subpathLength < segments.length) {
                            result = result + pathSeparator + ellipsis;
                        }
                        shortenedPaths[pathIndex] = result;
                    }
                }
            }
            if (match) {
                shortenedPaths[pathIndex] = originalPath; // use original path if no unique subpaths found
            }
        }
        return shortenedPaths;
    }
    exports.$iA = $iA;
    var Type;
    (function (Type) {
        Type[Type["TEXT"] = 0] = "TEXT";
        Type[Type["VARIABLE"] = 1] = "VARIABLE";
        Type[Type["SEPARATOR"] = 2] = "SEPARATOR";
    })(Type || (Type = {}));
    /**
     * Helper to insert values for specific template variables into the string. E.g. "this $(is) a $(template)" can be
     * passed to this function together with an object that maps "is" and "template" to strings to have them replaced.
     * @param value string to which template is applied
     * @param values the values of the templates to use
     */
    function $jA(template, values = Object.create(null)) {
        const segments = [];
        let inVariable = false;
        let curVal = '';
        for (const char of template) {
            // Beginning of variable
            if (char === '$' || (inVariable && char === '{')) {
                if (curVal) {
                    segments.push({ value: curVal, type: Type.TEXT });
                }
                curVal = '';
                inVariable = true;
            }
            // End of variable
            else if (char === '}' && inVariable) {
                const resolved = values[curVal];
                // Variable
                if (typeof resolved === 'string') {
                    if (resolved.length) {
                        segments.push({ value: resolved, type: Type.VARIABLE });
                    }
                }
                // Separator
                else if (resolved) {
                    const prevSegment = segments[segments.length - 1];
                    if (!prevSegment || prevSegment.type !== Type.SEPARATOR) {
                        segments.push({ value: resolved.label, type: Type.SEPARATOR }); // prevent duplicate separators
                    }
                }
                curVal = '';
                inVariable = false;
            }
            // Text or Variable Name
            else {
                curVal += char;
            }
        }
        // Tail
        if (curVal && !inVariable) {
            segments.push({ value: curVal, type: Type.TEXT });
        }
        return segments.filter((segment, index) => {
            // Only keep separator if we have values to the left and right
            if (segment.type === Type.SEPARATOR) {
                const left = segments[index - 1];
                const right = segments[index + 1];
                return [left, right].every(segment => segment && (segment.type === Type.VARIABLE || segment.type === Type.TEXT) && segment.value.length > 0);
            }
            // accept any TEXT and VARIABLE
            return true;
        }).map(segment => segment.value).join('');
    }
    exports.$jA = $jA;
    /**
     * Handles mnemonics for menu items. Depending on OS:
     * - Windows: Supported via & character (replace && with &)
     * -   Linux: Supported via & character (replace && with &)
     * -   macOS: Unsupported (replace && with empty string)
     */
    function $kA(label, forceDisableMnemonics) {
        if (platform_1.$j || forceDisableMnemonics) {
            return label.replace(/\(&&\w\)|&&/g, '').replace(/&/g, platform_1.$j ? '&' : '&&');
        }
        return label.replace(/&&|&/g, m => m === '&' ? '&&' : '&');
    }
    exports.$kA = $kA;
    /**
     * Handles mnemonics for buttons. Depending on OS:
     * - Windows: Supported via & character (replace && with & and & with && for escaping)
     * -   Linux: Supported via _ character (replace && with _)
     * -   macOS: Unsupported (replace && with empty string)
     */
    function $lA(label, forceDisableMnemonics) {
        if (platform_1.$j || forceDisableMnemonics) {
            return label.replace(/\(&&\w\)|&&/g, '');
        }
        if (platform_1.$i) {
            return label.replace(/&&|&/g, m => m === '&' ? '&&' : '&');
        }
        return label.replace(/&&/g, '_');
    }
    exports.$lA = $lA;
    function $mA(label) {
        return label.replace(/&/g, '&&');
    }
    exports.$mA = $mA;
    /**
     * Splits a recent label in name and parent path, supporting both '/' and '\' and workspace suffixes
     */
    function $nA(recentLabel) {
        if (recentLabel.endsWith(']')) {
            // label with workspace suffix
            const lastIndexOfSquareBracket = recentLabel.lastIndexOf(' [', recentLabel.length - 2);
            if (lastIndexOfSquareBracket !== -1) {
                const split = splitName(recentLabel.substring(0, lastIndexOfSquareBracket));
                return { name: split.name, parentPath: split.parentPath + recentLabel.substring(lastIndexOfSquareBracket) };
            }
        }
        return splitName(recentLabel);
    }
    exports.$nA = $nA;
    function splitName(fullPath) {
        const p = fullPath.indexOf('/') !== -1 ? path_1.$6d : path_1.$5d;
        const name = p.basename(fullPath);
        const parentPath = p.dirname(fullPath);
        if (name.length) {
            return { name, parentPath };
        }
        // only the root segment
        return { name: parentPath, parentPath: '' };
    }
});
//# sourceMappingURL=labels.js.map