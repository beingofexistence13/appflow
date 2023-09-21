/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CSSPluginUtilities = exports.rewriteUrls = exports.getInlinedResources = exports.writeFile = exports.write = exports.load = void 0;
    const nodeReq = (module) => {
        if (typeof require.__$__nodeRequire === 'function') {
            return require.__$__nodeRequire(module);
        }
        return undefined;
    };
    const fs = nodeReq('fs');
    const path = nodeReq('path');
    let inlineResources = false;
    let inlineResourcesLimit = 5000;
    const contentsMap = {};
    const pathMap = {};
    const entryPoints = {};
    const inlinedResources = [];
    /**
     * Invoked by the loader at build-time
     */
    function load(name, req, load, config) {
        if (!fs) {
            throw new Error(`Cannot load files without 'fs'!`);
        }
        config = config || {};
        const myConfig = (config['vs/css'] || {});
        inlineResources = (typeof myConfig.inlineResources === 'undefined' ? false : myConfig.inlineResources);
        inlineResourcesLimit = (myConfig.inlineResourcesLimit || 5000);
        const cssUrl = req.toUrl(name + '.css');
        let contents = fs.readFileSync(cssUrl, 'utf8');
        if (contents.charCodeAt(0) === 65279 /* BOM */) {
            // Remove BOM
            contents = contents.substring(1);
        }
        if (config.isBuild) {
            contentsMap[name] = contents;
            pathMap[name] = cssUrl;
        }
        load({});
    }
    exports.load = load;
    /**
     * Invoked by the loader at build-time
     */
    function write(pluginName, moduleName, write) {
        const entryPoint = write.getEntryPoint();
        entryPoints[entryPoint] = entryPoints[entryPoint] || [];
        entryPoints[entryPoint].push({
            moduleName: moduleName,
            contents: contentsMap[moduleName],
            fsPath: pathMap[moduleName],
        });
        write.asModule(pluginName + '!' + moduleName, 'define([\'vs/css!' + entryPoint + '\'], {});');
    }
    exports.write = write;
    /**
     * Invoked by the loader at build-time
     */
    function writeFile(pluginName, moduleName, req, write, config) {
        if (entryPoints && entryPoints.hasOwnProperty(moduleName)) {
            const fileName = req.toUrl(moduleName + '.css');
            const contents = [
                '/*---------------------------------------------------------',
                ' * Copyright (c) Microsoft Corporation. All rights reserved.',
                ' *--------------------------------------------------------*/'
            ], entries = entryPoints[moduleName];
            for (let i = 0; i < entries.length; i++) {
                if (inlineResources) {
                    contents.push(rewriteOrInlineUrls(entries[i].fsPath, entries[i].moduleName, moduleName, entries[i].contents, inlineResources === 'base64', inlineResourcesLimit));
                }
                else {
                    contents.push(rewriteUrls(entries[i].moduleName, moduleName, entries[i].contents));
                }
            }
            write(fileName, contents.join('\r\n'));
        }
    }
    exports.writeFile = writeFile;
    function getInlinedResources() {
        return inlinedResources || [];
    }
    exports.getInlinedResources = getInlinedResources;
    function rewriteOrInlineUrls(originalFileFSPath, originalFile, newFile, contents, forceBase64, inlineByteLimit) {
        if (!fs || !path) {
            throw new Error(`Cannot rewrite or inline urls without 'fs' or 'path'!`);
        }
        return CSSPluginUtilities.replaceURL(contents, (url) => {
            if (/\.(svg|png)$/.test(url)) {
                const fsPath = path.join(path.dirname(originalFileFSPath), url);
                const fileContents = fs.readFileSync(fsPath);
                if (fileContents.length < inlineByteLimit) {
                    const normalizedFSPath = fsPath.replace(/\\/g, '/');
                    inlinedResources.push(normalizedFSPath);
                    const MIME = /\.svg$/.test(url) ? 'image/svg+xml' : 'image/png';
                    let DATA = ';base64,' + fileContents.toString('base64');
                    if (!forceBase64 && /\.svg$/.test(url)) {
                        // .svg => url encode as explained at https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
                        const newText = fileContents.toString()
                            .replace(/"/g, '\'')
                            .replace(/%/g, '%25')
                            .replace(/</g, '%3C')
                            .replace(/>/g, '%3E')
                            .replace(/&/g, '%26')
                            .replace(/#/g, '%23')
                            .replace(/\s+/g, ' ');
                        const encodedData = ',' + newText;
                        if (encodedData.length < DATA.length) {
                            DATA = encodedData;
                        }
                    }
                    return '"data:' + MIME + DATA + '"';
                }
            }
            const absoluteUrl = CSSPluginUtilities.joinPaths(CSSPluginUtilities.pathOf(originalFile), url);
            return CSSPluginUtilities.relativePath(newFile, absoluteUrl);
        });
    }
    function rewriteUrls(originalFile, newFile, contents) {
        return CSSPluginUtilities.replaceURL(contents, (url) => {
            const absoluteUrl = CSSPluginUtilities.joinPaths(CSSPluginUtilities.pathOf(originalFile), url);
            return CSSPluginUtilities.relativePath(newFile, absoluteUrl);
        });
    }
    exports.rewriteUrls = rewriteUrls;
    class CSSPluginUtilities {
        static startsWith(haystack, needle) {
            return haystack.length >= needle.length && haystack.substr(0, needle.length) === needle;
        }
        /**
         * Find the path of a file.
         */
        static pathOf(filename) {
            const lastSlash = filename.lastIndexOf('/');
            if (lastSlash !== -1) {
                return filename.substr(0, lastSlash + 1);
            }
            else {
                return '';
            }
        }
        /**
         * A conceptual a + b for paths.
         * Takes into account if `a` contains a protocol.
         * Also normalizes the result: e.g.: a/b/ + ../c => a/c
         */
        static joinPaths(a, b) {
            function findSlashIndexAfterPrefix(haystack, prefix) {
                if (CSSPluginUtilities.startsWith(haystack, prefix)) {
                    return Math.max(prefix.length, haystack.indexOf('/', prefix.length));
                }
                return 0;
            }
            let aPathStartIndex = 0;
            aPathStartIndex = aPathStartIndex || findSlashIndexAfterPrefix(a, '//');
            aPathStartIndex = aPathStartIndex || findSlashIndexAfterPrefix(a, 'http://');
            aPathStartIndex = aPathStartIndex || findSlashIndexAfterPrefix(a, 'https://');
            function pushPiece(pieces, piece) {
                if (piece === './') {
                    // Ignore
                    return;
                }
                if (piece === '../') {
                    const prevPiece = (pieces.length > 0 ? pieces[pieces.length - 1] : null);
                    if (prevPiece && prevPiece === '/') {
                        // Ignore
                        return;
                    }
                    if (prevPiece && prevPiece !== '../') {
                        // Pop
                        pieces.pop();
                        return;
                    }
                }
                // Push
                pieces.push(piece);
            }
            function push(pieces, path) {
                while (path.length > 0) {
                    const slashIndex = path.indexOf('/');
                    const piece = (slashIndex >= 0 ? path.substring(0, slashIndex + 1) : path);
                    path = (slashIndex >= 0 ? path.substring(slashIndex + 1) : '');
                    pushPiece(pieces, piece);
                }
            }
            let pieces = [];
            push(pieces, a.substr(aPathStartIndex));
            if (b.length > 0 && b.charAt(0) === '/') {
                pieces = [];
            }
            push(pieces, b);
            return a.substring(0, aPathStartIndex) + pieces.join('');
        }
        static commonPrefix(str1, str2) {
            const len = Math.min(str1.length, str2.length);
            for (let i = 0; i < len; i++) {
                if (str1.charCodeAt(i) !== str2.charCodeAt(i)) {
                    return str1.substring(0, i);
                }
            }
            return str1.substring(0, len);
        }
        static commonFolderPrefix(fromPath, toPath) {
            const prefix = CSSPluginUtilities.commonPrefix(fromPath, toPath);
            const slashIndex = prefix.lastIndexOf('/');
            if (slashIndex === -1) {
                return '';
            }
            return prefix.substring(0, slashIndex + 1);
        }
        static relativePath(fromPath, toPath) {
            if (CSSPluginUtilities.startsWith(toPath, '/') || CSSPluginUtilities.startsWith(toPath, 'http://') || CSSPluginUtilities.startsWith(toPath, 'https://')) {
                return toPath;
            }
            // Ignore common folder prefix
            const prefix = CSSPluginUtilities.commonFolderPrefix(fromPath, toPath);
            fromPath = fromPath.substr(prefix.length);
            toPath = toPath.substr(prefix.length);
            const upCount = fromPath.split('/').length;
            let result = '';
            for (let i = 1; i < upCount; i++) {
                result += '../';
            }
            return result + toPath;
        }
        static replaceURL(contents, replacer) {
            // Use ")" as the terminator as quotes are oftentimes not used at all
            return contents.replace(/url\(\s*([^\)]+)\s*\)?/g, (_, ...matches) => {
                let url = matches[0];
                // Eliminate starting quotes (the initial whitespace is not captured)
                if (url.charAt(0) === '"' || url.charAt(0) === '\'') {
                    url = url.substring(1);
                }
                // The ending whitespace is captured
                while (url.length > 0 && (url.charAt(url.length - 1) === ' ' || url.charAt(url.length - 1) === '\t')) {
                    url = url.substring(0, url.length - 1);
                }
                // Eliminate ending quotes
                if (url.charAt(url.length - 1) === '"' || url.charAt(url.length - 1) === '\'') {
                    url = url.substring(0, url.length - 1);
                }
                if (!CSSPluginUtilities.startsWith(url, 'data:') && !CSSPluginUtilities.startsWith(url, 'http://') && !CSSPluginUtilities.startsWith(url, 'https://')) {
                    url = replacer(url);
                }
                return 'url(' + url + ')';
            });
        }
    }
    exports.CSSPluginUtilities = CSSPluginUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvY3NzLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTRCaEcsTUFBTSxPQUFPLEdBQUcsQ0FBSSxNQUFjLEVBQWlCLEVBQUU7UUFDcEQsSUFBSSxPQUFhLE9BQVEsQ0FBQyxnQkFBZ0IsS0FBSyxVQUFVLEVBQUU7WUFDMUQsT0FBYSxPQUFRLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDL0M7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDLENBQUM7SUFFRixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQVUsSUFBSSxDQUFDLENBQUM7SUFDbEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFZLE1BQU0sQ0FBQyxDQUFDO0lBRXhDLElBQUksZUFBZSxHQUF1QixLQUFLLENBQUM7SUFDaEQsSUFBSSxvQkFBb0IsR0FBVyxJQUFJLENBQUM7SUFFeEMsTUFBTSxXQUFXLEdBQXFDLEVBQUUsQ0FBQztJQUN6RCxNQUFNLE9BQU8sR0FBcUMsRUFBRSxDQUFDO0lBQ3JELE1BQU0sV0FBVyxHQUFtRCxFQUFFLENBQUM7SUFDdkUsTUFBTSxnQkFBZ0IsR0FBYSxFQUFFLENBQUM7SUFFdEM7O09BRUc7SUFDSCxTQUFnQixJQUFJLENBQUMsSUFBWSxFQUFFLEdBQStCLEVBQUUsSUFBbUMsRUFBRSxNQUF1QztRQUMvSSxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ1IsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1NBQ25EO1FBQ0QsTUFBTSxHQUFHLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDdEIsTUFBTSxRQUFRLEdBQXFCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVELGVBQWUsR0FBRyxDQUFDLE9BQU8sUUFBUSxDQUFD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