/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers", "vs/platform/terminal/common/terminal"], function (require, exports, uriIdentity_1, workspace_1, terminalLinkHelpers_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UWb = void 0;
    var Constants;
    (function (Constants) {
        /**
         * The max line length to try extract word links from.
         */
        Constants[Constants["MaxLineLength"] = 2000] = "MaxLineLength";
        /**
         * The maximum length of a link to resolve against the file system. This limit is put in place
         * to avoid sending excessive data when remote connections are in place.
         */
        Constants[Constants["MaxResolvedLinkLength"] = 1024] = "MaxResolvedLinkLength";
    })(Constants || (Constants = {}));
    const lineNumberPrefixMatchers = [
        // Ripgrep:
        //   /some/file
        //   16:searchresult
        //   16:    searchresult
        // Eslint:
        //   /some/file
        //     16:5  error ...
        / *(?<link>(?<line>\d+):(?<col>\d+)?)/
    ];
    const gitDiffMatchers = [
        // --- a/some/file
        // +++ b/some/file
        // @@ -8,11 +8,11 @@ file content...
        /^(?<link>@@ .+ \+(?<toFileLine>\d+),(?<toFileCount>\d+) @@)/
    ];
    let $UWb = class $UWb {
        static { this.id = 'multiline'; }
        constructor(xterm, a, b, c, d, e) {
            this.xterm = xterm;
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            // This was chosen as a reasonable maximum line length given the tradeoff between performance
            // and how likely it is to encounter such a large line length. Some useful reference points:
            // - Window old max length: 260 ($MAX_PATH)
            // - Linux max length: 4096 ($PATH_MAX)
            this.maxLinkLength = 500;
        }
        async detect(lines, startLine, endLine) {
            const links = [];
            // Get the text representation of the wrapped line
            const text = (0, terminalLinkHelpers_1.$EWb)(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
            if (text === '' || text.length > 2000 /* Constants.MaxLineLength */) {
                return [];
            }
            this.c.trace('terminalMultiLineLinkDetector#detect text', text);
            // Match against the fallback matchers which are mainly designed to catch paths with spaces
            // that aren't possible using the regular mechanism.
            for (const matcher of lineNumberPrefixMatchers) {
                const match = text.match(matcher);
                const group = match?.groups;
                if (!group) {
                    continue;
                }
                const link = group?.link;
                const line = group?.line;
                const col = group?.col;
                if (!link || line === undefined) {
                    continue;
                }
                // Don't try resolve any links of excessive length
                if (link.length > 1024 /* Constants.MaxResolvedLinkLength */) {
                    continue;
                }
                this.c.trace('terminalMultiLineLinkDetector#detect candidate', link);
                // Scan up looking for the first line that could be a path
                let possiblePath;
                for (let index = startLine - 1; index >= 0; index--) {
                    // Ignore lines that aren't at the beginning of a wrapped line
                    if (this.xterm.buffer.active.getLine(index).isWrapped) {
                        continue;
                    }
                    const text = (0, terminalLinkHelpers_1.$EWb)(this.xterm.buffer.active, index, index, this.xterm.cols);
                    if (!text.match(/^\s*\d/)) {
                        possiblePath = text;
                        break;
                    }
                }
                if (!possiblePath) {
                    continue;
                }
                // Check if the first non-matching line is an absolute or relative link
                const linkStat = await this.b.resolveLink(this.a, possiblePath);
                if (linkStat) {
                    let type;
                    if (linkStat.isDirectory) {
                        if (this.f(linkStat.uri)) {
                            type = "LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */;
                        }
                        else {
                            type = "LocalFolderOutsideWorkspace" /* TerminalBuiltinLinkType.LocalFolderOutsideWorkspace */;
                        }
                    }
                    else {
                        type = "LocalFile" /* TerminalBuiltinLinkType.LocalFile */;
                    }
                    // Convert the entire line's text string index into a wrapped buffer range
                    const bufferRange = (0, terminalLinkHelpers_1.$CWb)(lines, this.xterm.cols, {
                        startColumn: 1,
                        startLineNumber: 1,
                        endColumn: 1 + text.length,
                        endLineNumber: 1
                    }, startLine);
                    const simpleLink = {
                        text: link,
                        uri: linkStat.uri,
                        selection: {
                            startLineNumber: parseInt(line),
                            startColumn: col ? parseInt(col) : 1
                        },
                        disableTrimColon: true,
                        bufferRange: bufferRange,
                        type
                    };
                    this.c.trace('terminalMultiLineLinkDetector#detect verified link', simpleLink);
                    links.push(simpleLink);
                    // Break on the first match
                    break;
                }
            }
            if (links.length === 0) {
                for (const matcher of gitDiffMatchers) {
                    const match = text.match(matcher);
                    const group = match?.groups;
                    if (!group) {
                        continue;
                    }
                    const link = group?.link;
                    const toFileLine = group?.toFileLine;
                    const toFileCount = group?.toFileCount;
                    if (!link || toFileLine === undefined) {
                        continue;
                    }
                    // Don't try resolve any links of excessive length
                    if (link.length > 1024 /* Constants.MaxResolvedLinkLength */) {
                        continue;
                    }
                    this.c.trace('terminalMultiLineLinkDetector#detect candidate', link);
                    // Scan up looking for the first line that could be a path
                    let possiblePath;
                    for (let index = startLine - 1; index >= 0; index--) {
                        // Ignore lines that aren't at the beginning of a wrapped line
                        if (this.xterm.buffer.active.getLine(index).isWrapped) {
                            continue;
                        }
                        const text = (0, terminalLinkHelpers_1.$EWb)(this.xterm.buffer.active, index, index, this.xterm.cols);
                        const match = text.match(/\+\+\+ b\/(?<path>.+)/);
                        if (match) {
                            possiblePath = match.groups?.path;
                            break;
                        }
                    }
                    if (!possiblePath) {
                        continue;
                    }
                    // Check if the first non-matching line is an absolute or relative link
                    const linkStat = await this.b.resolveLink(this.a, possiblePath);
                    if (linkStat) {
                        let type;
                        if (linkStat.isDirectory) {
                            if (this.f(linkStat.uri)) {
                                type = "LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */;
                            }
                            else {
                                type = "LocalFolderOutsideWorkspace" /* TerminalBuiltinLinkType.LocalFolderOutsideWorkspace */;
                            }
                        }
                        else {
                            type = "LocalFile" /* TerminalBuiltinLinkType.LocalFile */;
                        }
                        // Convert the link to the buffer range
                        const bufferRange = (0, terminalLinkHelpers_1.$CWb)(lines, this.xterm.cols, {
                            startColumn: 1,
                            startLineNumber: 1,
                            endColumn: 1 + link.length,
                            endLineNumber: 1
                        }, startLine);
                        const simpleLink = {
                            text: link,
                            uri: linkStat.uri,
                            selection: {
                                startLineNumber: parseInt(toFileLine),
                                startColumn: 1,
                                endLineNumber: parseInt(toFileLine) + parseInt(toFileCount)
                            },
                            bufferRange: bufferRange,
                            type
                        };
                        this.c.trace('terminalMultiLineLinkDetector#detect verified link', simpleLink);
                        links.push(simpleLink);
                        // Break on the first match
                        break;
                    }
                }
            }
            return links;
        }
        f(uri) {
            const folders = this.e.getWorkspace().folders;
            for (let i = 0; i < folders.length; i++) {
                if (this.d.extUri.isEqualOrParent(uri, folders[i].uri)) {
                    return true;
                }
            }
            return false;
        }
    };
    exports.$UWb = $UWb;
    exports.$UWb = $UWb = __decorate([
        __param(3, terminal_1.$Zq),
        __param(4, uriIdentity_1.$Ck),
        __param(5, workspace_1.$Kh)
    ], $UWb);
});
//# sourceMappingURL=terminalMultiLineLinkDetector.js.map