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
define(["require", "exports", "vs/base/common/platform", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkParsing", "vs/platform/terminal/common/terminal"], function (require, exports, platform_1, uriIdentity_1, workspace_1, terminalLinkHelpers_1, terminalLinkParsing_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QWb = void 0;
    var Constants;
    (function (Constants) {
        /**
         * The max line length to try extract word links from.
         */
        Constants[Constants["MaxLineLength"] = 2000] = "MaxLineLength";
        /**
         * The maximum number of links in a line to resolve against the file system. This limit is put
         * in place to avoid sending excessive data when remote connections are in place.
         */
        Constants[Constants["MaxResolvedLinksInLine"] = 10] = "MaxResolvedLinksInLine";
        /**
         * The maximum length of a link to resolve against the file system. This limit is put in place
         * to avoid sending excessive data when remote connections are in place.
         */
        Constants[Constants["MaxResolvedLinkLength"] = 1024] = "MaxResolvedLinkLength";
    })(Constants || (Constants = {}));
    const fallbackMatchers = [
        // Python style error: File "<path>", line <line>
        /^ *File (?<link>"(?<path>.+)"(, line (?<line>\d+))?)/,
        // Some C++ compile error formats:
        // C:\foo\bar baz(339) : error ...
        // C:\foo\bar baz(339,12) : error ...
        // C:\foo\bar baz(339, 12) : error ...
        // C:\foo\bar baz(339): error ...       [#178584, Visual Studio CL/NVIDIA CUDA compiler]
        // C:\foo\bar baz(339,12): ...
        // C:\foo\bar baz(339, 12): ...
        /^(?<link>(?<path>.+)\((?<line>\d+)(?:, ?(?<col>\d+))?\)) ?:/,
        // C:\foo/bar baz:339 : error ...
        // C:\foo/bar baz:339:12 : error ...
        // C:\foo/bar baz:339: error ...
        // C:\foo/bar baz:339:12: error ...     [#178584, Clang]
        /^(?<link>(?<path>.+):(?<line>\d+)(?::(?<col>\d+))?) ?:/,
        // Cmd prompt
        /^(?<link>(?<path>.+))>/,
        // The whole line is the path
        /^ *(?<link>(?<path>.+))/
    ];
    let $QWb = class $QWb {
        static { this.id = 'local'; }
        constructor(xterm, a, b, c, d, e, f) {
            this.xterm = xterm;
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
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
            let stringIndex = -1;
            let resolvedLinkCount = 0;
            const os = this.b.os || platform_1.OS;
            const parsedLinks = (0, terminalLinkParsing_1.$Zkb)(text, os);
            this.d.trace('terminalLocalLinkDetector#detect text', text);
            this.d.trace('terminalLocalLinkDetector#detect parsedLinks', parsedLinks);
            for (const parsedLink of parsedLinks) {
                // Don't try resolve any links of excessive length
                if (parsedLink.path.text.length > 1024 /* Constants.MaxResolvedLinkLength */) {
                    continue;
                }
                // Convert the link text's string index into a wrapped buffer range
                const bufferRange = (0, terminalLinkHelpers_1.$CWb)(lines, this.xterm.cols, {
                    startColumn: (parsedLink.prefix?.index ?? parsedLink.path.index) + 1,
                    startLineNumber: 1,
                    endColumn: parsedLink.path.index + parsedLink.path.text.length + (parsedLink.suffix?.suffix.text.length ?? 0) + 1,
                    endLineNumber: 1
                }, startLine);
                // Get a single link candidate if the cwd of the line is known
                const linkCandidates = [];
                const osPath = (0, terminalLinkHelpers_1.$HWb)(os);
                if (osPath.isAbsolute(parsedLink.path.text) || parsedLink.path.text.startsWith('~')) {
                    linkCandidates.push(parsedLink.path.text);
                }
                else {
                    if (this.a.has(2 /* TerminalCapability.CommandDetection */)) {
                        const absolutePath = (0, terminalLinkHelpers_1.$GWb)(this.a, bufferRange.start.y, parsedLink.path.text, osPath, this.d);
                        // Only add a single exact link candidate if the cwd is available, this may cause
                        // the link to not be resolved but that should only occur when the actual file does
                        // not exist. Doing otherwise could cause unexpected results where handling via the
                        // word link detector is preferable.
                        if (absolutePath) {
                            linkCandidates.push(...absolutePath);
                        }
                    }
                    // Fallback to resolving against the initial cwd, removing any relative directory prefixes
                    if (linkCandidates.length === 0) {
                        linkCandidates.push(parsedLink.path.text);
                        if (parsedLink.path.text.match(/^(\.\.[\/\\])+/)) {
                            linkCandidates.push(parsedLink.path.text.replace(/^(\.\.[\/\\])+/, ''));
                        }
                    }
                }
                // If any candidates end with special characters that are likely to not be part of the
                // link, add a candidate excluding them.
                const specialEndCharRegex = /[\[\]"'\.]$/;
                const trimRangeMap = new Map();
                const specialEndLinkCandidates = [];
                for (const candidate of linkCandidates) {
                    let previous = candidate;
                    let removed = previous.replace(specialEndCharRegex, '');
                    let trimRange = 0;
                    while (removed !== previous) {
                        // Only trim the link if there is no suffix, otherwise the underline would be incorrect
                        if (!parsedLink.suffix) {
                            trimRange++;
                        }
                        specialEndLinkCandidates.push(removed);
                        trimRangeMap.set(removed, trimRange);
                        previous = removed;
                        removed = removed.replace(specialEndCharRegex, '');
                    }
                }
                linkCandidates.push(...specialEndLinkCandidates);
                this.d.trace('terminalLocalLinkDetector#detect linkCandidates', linkCandidates);
                // Validate the path and convert to the outgoing type
                const simpleLink = await this.j(undefined, bufferRange, linkCandidates, trimRangeMap);
                if (simpleLink) {
                    simpleLink.parsedLink = parsedLink;
                    simpleLink.text = text.substring(parsedLink.prefix?.index ?? parsedLink.path.index, parsedLink.suffix ? parsedLink.suffix.suffix.index + parsedLink.suffix.suffix.text.length : parsedLink.path.index + parsedLink.path.text.length);
                    this.d.trace('terminalLocalLinkDetector#detect verified link', simpleLink);
                    links.push(simpleLink);
                }
                // Stop early if too many links exist in the line
                if (++resolvedLinkCount >= 10 /* Constants.MaxResolvedLinksInLine */) {
                    break;
                }
            }
            // Match against the fallback matchers which are mainly designed to catch paths with spaces
            // that aren't possible using the regular mechanism.
            if (links.length === 0) {
                for (const matcher of fallbackMatchers) {
                    const match = text.match(matcher);
                    const group = match?.groups;
                    if (!group) {
                        continue;
                    }
                    const link = group?.link;
                    const path = group?.path;
                    const line = group?.line;
                    const col = group?.col;
                    if (!link || !path) {
                        continue;
                    }
                    // Don't try resolve any links of excessive length
                    if (link.length > 1024 /* Constants.MaxResolvedLinkLength */) {
                        continue;
                    }
                    // Convert the link text's string index into a wrapped buffer range
                    stringIndex = text.indexOf(link);
                    const bufferRange = (0, terminalLinkHelpers_1.$CWb)(lines, this.xterm.cols, {
                        startColumn: stringIndex + 1,
                        startLineNumber: 1,
                        endColumn: stringIndex + link.length + 1,
                        endLineNumber: 1
                    }, startLine);
                    // Validate and add link
                    const suffix = line ? `:${line}${col ? `:${col}` : ''}` : '';
                    const simpleLink = await this.j(`${path}${suffix}`, bufferRange, [path]);
                    if (simpleLink) {
                        links.push(simpleLink);
                    }
                    // Only match a single fallback matcher
                    break;
                }
            }
            // Sometimes links are styled specially in the terminal like underlined or bolded, try split
            // the line by attributes and test whether it matches a path
            if (links.length === 0) {
                const rangeCandidates = (0, terminalLinkHelpers_1.$FWb)(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
                for (const rangeCandidate of rangeCandidates) {
                    let text = '';
                    for (let y = rangeCandidate.start.y; y <= rangeCandidate.end.y; y++) {
                        const line = this.xterm.buffer.active.getLine(y);
                        if (!line) {
                            break;
                        }
                        const lineStartX = y === rangeCandidate.start.y ? rangeCandidate.start.x : 0;
                        const lineEndX = y === rangeCandidate.end.y ? rangeCandidate.end.x : this.xterm.cols - 1;
                        text += line.translateToString(false, lineStartX, lineEndX);
                    }
                    // HACK: Adjust to 1-based for link API
                    rangeCandidate.start.x++;
                    rangeCandidate.start.y++;
                    rangeCandidate.end.y++;
                    // Validate and add link
                    const simpleLink = await this.j(text, rangeCandidate, [text]);
                    if (simpleLink) {
                        links.push(simpleLink);
                    }
                    // Stop early if too many links exist in the line
                    if (++resolvedLinkCount >= 10 /* Constants.MaxResolvedLinksInLine */) {
                        break;
                    }
                }
            }
            return links;
        }
        g(uri) {
            const folders = this.f.getWorkspace().folders;
            for (let i = 0; i < folders.length; i++) {
                if (this.e.extUri.isEqualOrParent(uri, folders[i].uri)) {
                    return true;
                }
            }
            return false;
        }
        async h(linkCandidates) {
            for (const link of linkCandidates) {
                const result = await this.c.resolveLink(this.b, link);
                if (result) {
                    return result;
                }
            }
            return undefined;
        }
        /**
         * Validates a set of link candidates and returns a link if validated.
         * @param linkText The link text, this should be undefined to use the link stat value
         * @param trimRangeMap A map of link candidates to the amount of buffer range they need trimmed.
         */
        async j(linkText, bufferRange, linkCandidates, trimRangeMap) {
            const linkStat = await this.h(linkCandidates);
            if (linkStat) {
                let type;
                if (linkStat.isDirectory) {
                    if (this.g(linkStat.uri)) {
                        type = "LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */;
                    }
                    else {
                        type = "LocalFolderOutsideWorkspace" /* TerminalBuiltinLinkType.LocalFolderOutsideWorkspace */;
                    }
                }
                else {
                    type = "LocalFile" /* TerminalBuiltinLinkType.LocalFile */;
                }
                // Offset the buffer range if the link range was trimmed
                const trimRange = trimRangeMap?.get(linkStat.link);
                if (trimRange) {
                    bufferRange.end.x -= trimRange;
                    if (bufferRange.end.x < 0) {
                        bufferRange.end.y--;
                        bufferRange.end.x += this.xterm.cols;
                    }
                }
                return {
                    text: linkText ?? linkStat.link,
                    uri: linkStat.uri,
                    bufferRange: bufferRange,
                    type
                };
            }
            return undefined;
        }
    };
    exports.$QWb = $QWb;
    exports.$QWb = $QWb = __decorate([
        __param(4, terminal_1.$Zq),
        __param(5, uriIdentity_1.$Ck),
        __param(6, workspace_1.$Kh)
    ], $QWb);
});
//# sourceMappingURL=terminalLocalLinkDetector.js.map