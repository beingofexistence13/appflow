/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/extpath", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/strings"], function (require, exports, arrays_1, extpath_1, path_1, platform_1, resources_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.splitRecentLabel = exports.unmnemonicLabel = exports.mnemonicButtonLabel = exports.mnemonicMenuLabel = exports.template = exports.shorten = exports.untildify = exports.tildify = exports.normalizeDriveLetter = exports.getPathLabel = void 0;
    function getPathLabel(resource, formatting) {
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
        if (os === 1 /* OperatingSystem.Windows */ && !platform_1.isWindows) {
            absolutePath = absolutePath.replace(/\//g, '\\');
        }
        else if (os !== 1 /* OperatingSystem.Windows */ && platform_1.isWindows) {
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
            if (resource.scheme !== tildifier.userHome.scheme && resource.path.startsWith(path_1.posix.sep)) {
                userHomeCandidate = tildifier.userHome.with({ path: resource.path }).fsPath;
            }
            else {
                userHomeCandidate = resource.fsPath;
            }
            absolutePath = tildify(userHomeCandidate, userHome, os);
        }
        // normalize
        const pathLib = os === 1 /* OperatingSystem.Windows */ ? path_1.win32 : path_1.posix;
        return pathLib.normalize(normalizeDriveLetter(absolutePath, os === 1 /* OperatingSystem.Windows */));
    }
    exports.getPathLabel = getPathLabel;
    function getRelativePathLabel(resource, relativePathProvider, os) {
        const pathLib = os === 1 /* OperatingSystem.Windows */ ? path_1.win32 : path_1.posix;
        const extUriLib = os === 3 /* OperatingSystem.Linux */ ? resources_1.extUri : resources_1.extUriIgnorePathCase;
        const workspace = relativePathProvider.getWorkspace();
        const firstFolder = (0, arrays_1.firstOrDefault)(workspace.folders);
        if (!firstFolder) {
            return undefined;
        }
        // This is a bit of a hack, but in order to figure out the folder
        // the resource belongs to, we need to make sure to convert it
        // to a workspace resource. We cannot assume that the resource is
        // already matching the workspace.
        if (resource.scheme !== firstFolder.uri.scheme && resource.path.startsWith(path_1.posix.sep)) {
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
    function normalizeDriveLetter(path, isWindowsOS = platform_1.isWindows) {
        if ((0, extpath_1.hasDriveLetter)(path, isWindowsOS)) {
            return path.charAt(0).toUpperCase() + path.slice(1);
        }
        return path;
    }
    exports.normalizeDriveLetter = normalizeDriveLetter;
    let normalizedUserHomeCached = Object.create(null);
    function tildify(path, userHome, os = platform_1.OS) {
        if (os === 1 /* OperatingSystem.Windows */ || !path || !userHome) {
            return path; // unsupported on Windows
        }
        let normalizedUserHome = normalizedUserHomeCached.original === userHome ? normalizedUserHomeCached.normalized : undefined;
        if (!normalizedUserHome) {
            normalizedUserHome = userHome;
            if (platform_1.isWindows) {
                normalizedUserHome = (0, extpath_1.toSlashes)(normalizedUserHome); // make sure that the path is POSIX normalized on Windows
            }
            normalizedUserHome = `${(0, strings_1.rtrim)(normalizedUserHome, path_1.posix.sep)}${path_1.posix.sep}`;
            normalizedUserHomeCached = { original: userHome, normalized: normalizedUserHome };
        }
        let normalizedPath = path;
        if (platform_1.isWindows) {
            normalizedPath = (0, extpath_1.toSlashes)(normalizedPath); // make sure that the path is POSIX normalized on Windows
        }
        // Linux: case sensitive, macOS: case insensitive
        if (os === 3 /* OperatingSystem.Linux */ ? normalizedPath.startsWith(normalizedUserHome) : (0, strings_1.startsWithIgnoreCase)(normalizedPath, normalizedUserHome)) {
            return `~/${normalizedPath.substr(normalizedUserHome.length)}`;
        }
        return path;
    }
    exports.tildify = tildify;
    function untildify(path, userHome) {
        return path.replace(/^~($|\/|\\)/, `${userHome}$1`);
    }
    exports.untildify = untildify;
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
    function shorten(paths, pathSeparator = path_1.sep) {
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
    exports.shorten = shorten;
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
    function template(template, values = Object.create(null)) {
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
    exports.template = template;
    /**
     * Handles mnemonics for menu items. Depending on OS:
     * - Windows: Supported via & character (replace && with &)
     * -   Linux: Supported via & character (replace && with &)
     * -   macOS: Unsupported (replace && with empty string)
     */
    function mnemonicMenuLabel(label, forceDisableMnemonics) {
        if (platform_1.isMacintosh || forceDisableMnemonics) {
            return label.replace(/\(&&\w\)|&&/g, '').replace(/&/g, platform_1.isMacintosh ? '&' : '&&');
        }
        return label.replace(/&&|&/g, m => m === '&' ? '&&' : '&');
    }
    exports.mnemonicMenuLabel = mnemonicMenuLabel;
    /**
     * Handles mnemonics for buttons. Depending on OS:
     * - Windows: Supported via & character (replace && with & and & with && for escaping)
     * -   Linux: Supported via _ character (replace && with _)
     * -   macOS: Unsupported (replace && with empty string)
     */
    function mnemonicButtonLabel(label, forceDisableMnemonics) {
        if (platform_1.isMacintosh || forceDisableMnemonics) {
            return label.replace(/\(&&\w\)|&&/g, '');
        }
        if (platform_1.isWindows) {
            return label.replace(/&&|&/g, m => m === '&' ? '&&' : '&');
        }
        return label.replace(/&&/g, '_');
    }
    exports.mnemonicButtonLabel = mnemonicButtonLabel;
    function unmnemonicLabel(label) {
        return label.replace(/&/g, '&&');
    }
    exports.unmnemonicLabel = unmnemonicLabel;
    /**
     * Splits a recent label in name and parent path, supporting both '/' and '\' and workspace suffixes
     */
    function splitRecentLabel(recentLabel) {
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
    exports.splitRecentLabel = splitRecentLabel;
    function splitName(fullPath) {
        const p = fullPath.indexOf('/') !== -1 ? path_1.posix : path_1.win32;
        const name = p.basename(fullPath);
        const parentPath = p.dirname(fullPath);
        if (name.length) {
            return { name, parentPath };
        }
        // only the root segment
        return { name: parentPath, parentPath: '' };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vbGFiZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlEaEcsU0FBZ0IsWUFBWSxDQUFDLFFBQWEsRUFBRSxVQUFnQztRQUMzRSxNQUFNLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxHQUFHLFVBQVUsQ0FBQztRQUVwRSwwREFBMEQ7UUFDMUQsSUFBSSxVQUFVLEVBQUU7WUFDZixNQUFNLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3BFLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFO2dCQUNyQyxPQUFPLFlBQVksQ0FBQzthQUNwQjtTQUNEO1FBRUQscURBQXFEO1FBQ3JELHFEQUFxRDtRQUNyRCw4Q0FBOEM7UUFDOUMsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUNuQyxJQUFJLEVBQUUsb0NBQTRCLElBQUksQ0FBQyxvQkFBUyxFQUFFO1lBQ2pELFlBQVksR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNqRDthQUFNLElBQUksRUFBRSxvQ0FBNEIsSUFBSSxvQkFBUyxFQUFFO1lBQ3ZELFlBQVksR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNoRDtRQUVELHlEQUF5RDtRQUN6RCxJQUFJLEVBQUUsb0NBQTRCLElBQUksU0FBUyxFQUFFLFFBQVEsRUFBRTtZQUMxRCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUUzQyw2REFBNkQ7WUFDN0QsbUVBQW1FO1lBQ25FLGlFQUFpRTtZQUNqRSxn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