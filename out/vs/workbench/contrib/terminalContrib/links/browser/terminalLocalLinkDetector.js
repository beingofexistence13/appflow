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
    exports.TerminalLocalLinkDetector = void 0;
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
    let TerminalLocalLinkDetector = class TerminalLocalLinkDetector {
        static { this.id = 'local'; }
        constructor(xterm, _capabilities, _processManager, _linkResolver, _logService, _uriIdentityService, _workspaceContextService) {
            this.xterm = xterm;
            this._capabilities = _capabilities;
            this._processManager = _processManager;
            this._linkResolver = _linkResolver;
            this._logService = _logService;
            this._uriIdentityService = _uriIdentityService;
            this._workspaceContextService = _workspaceContextService;
            // This was chosen as a reasonable maximum line length given the tradeoff between performance
            // and how likely it is to encounter such a large line length. Some useful reference points:
            // - Window old max length: 260 ($MAX_PATH)
            // - Linux max length: 4096 ($PATH_MAX)
            this.maxLinkLength = 500;
        }
        async detect(lines, startLine, endLine) {
            const links = [];
            // Get the text representation of the wrapped line
            const text = (0, terminalLinkHelpers_1.getXtermLineContent)(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
            if (text === '' || text.length > 2000 /* Constants.MaxLineLength */) {
                return [];
            }
            let stringIndex = -1;
            let resolvedLinkCount = 0;
            const os = this._processManager.os || platform_1.OS;
            const parsedLinks = (0, terminalLinkParsing_1.detectLinks)(text, os);
            this._logService.trace('terminalLocalLinkDetector#detect text', text);
            this._logService.trace('terminalLocalLinkDetector#detect parsedLinks', parsedLinks);
            for (const parsedLink of parsedLinks) {
                // Don't try resolve any links of excessive length
                if (parsedLink.path.text.length > 1024 /* Constants.MaxResolvedLinkLength */) {
                    continue;
                }
                // Convert the link text's string index into a wrapped buffer range
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, this.xterm.cols, {
                    startColumn: (parsedLink.prefix?.index ?? parsedLink.path.index) + 1,
                    startLineNumber: 1,
                    endColumn: parsedLink.path.index + parsedLink.path.text.length + (parsedLink.suffix?.suffix.text.length ?? 0) + 1,
                    endLineNumber: 1
                }, startLine);
                // Get a single link candidate if the cwd of the line is known
                const linkCandidates = [];
                const osPath = (0, terminalLinkHelpers_1.osPathModule)(os);
                if (osPath.isAbsolute(parsedLink.path.text) || parsedLink.path.text.startsWith('~')) {
                    linkCandidates.push(parsedLink.path.text);
                }
                else {
                    if (this._capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
                        const absolutePath = (0, terminalLinkHelpers_1.updateLinkWithRelativeCwd)(this._capabilities, bufferRange.start.y, parsedLink.path.text, osPath, this._logService);
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
                this._logService.trace('terminalLocalLinkDetector#detect linkCandidates', linkCandidates);
                // Validate the path and convert to the outgoing type
                const simpleLink = await this._validateAndGetLink(undefined, bufferRange, linkCandidates, trimRangeMap);
                if (simpleLink) {
                    simpleLink.parsedLink = parsedLink;
                    simpleLink.text = text.substring(parsedLink.prefix?.index ?? parsedLink.path.index, parsedLink.suffix ? parsedLink.suffix.suffix.index + parsedLink.suffix.suffix.text.length : parsedLink.path.index + parsedLink.path.text.length);
                    this._logService.trace('terminalLocalLinkDetector#detect verified link', simpleLink);
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
                    const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, this.xterm.cols, {
                        startColumn: stringIndex + 1,
                        startLineNumber: 1,
                        endColumn: stringIndex + link.length + 1,
                        endLineNumber: 1
                    }, startLine);
                    // Validate and add link
                    const suffix = line ? `:${line}${col ? `:${col}` : ''}` : '';
                    const simpleLink = await this._validateAndGetLink(`${path}${suffix}`, bufferRange, [path]);
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
                const rangeCandidates = (0, terminalLinkHelpers_1.getXtermRangesByAttr)(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
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
                    const simpleLink = await this._validateAndGetLink(text, rangeCandidate, [text]);
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
        _isDirectoryInsideWorkspace(uri) {
            const folders = this._workspaceContextService.getWorkspace().folders;
            for (let i = 0; i < folders.length; i++) {
                if (this._uriIdentityService.extUri.isEqualOrParent(uri, folders[i].uri)) {
                    return true;
                }
            }
            return false;
        }
        async _validateLinkCandidates(linkCandidates) {
            for (const link of linkCandidates) {
                const result = await this._linkResolver.resolveLink(this._processManager, link);
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
        async _validateAndGetLink(linkText, bufferRange, linkCandidates, trimRangeMap) {
            const linkStat = await this._validateLinkCandidates(linkCandidates);
            if (linkStat) {
                let type;
                if (linkStat.isDirectory) {
                    if (this._isDirectoryInsideWorkspace(linkStat.uri)) {
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
    exports.TerminalLocalLinkDetector = TerminalLocalLinkDetector;
    exports.TerminalLocalLinkDetector = TerminalLocalLinkDetector = __decorate([
        __param(4, terminal_1.ITerminalLogService),
        __param(5, uriIdentity_1.IUriIdentityService),
        __param(6, workspace_1.IWorkspaceContextService)
    ], TerminalLocalLinkDetector);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMb2NhbExpbmtEZXRlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi9saW5rcy9icm93c2VyL3Rlcm1pbmFsTG9jYWxMaW5rRGV0ZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBY2hHLElBQVcsU0FpQlY7SUFqQkQsV0FBVyxTQUFTO1FBQ25COztXQUVHO1FBQ0gsOERBQW9CLENBQUE7UUFFcEI7OztXQUdHO1FBQ0gsOEVBQTJCLENBQUE7UUFFM0I7OztXQUdHO1FBQ0gsOEVBQTRCLENBQUE7SUFDN0IsQ0FBQyxFQWpCVSxTQUFTLEtBQVQsU0FBUyxRQWlCbkI7SUFFRCxNQUFNLGdCQUFnQixHQUFhO1FBQ2xDLGlEQUFpRDtRQUNqRCxzREFBc0Q7UUFDdEQsa0NBQWtDO1FBQ2xDLGtDQUFrQztRQUNsQyxxQ0FBcUM7UUFDckMsc0NBQXNDO1FBQ3RDLHdGQUF3RjtRQUN4Riw4QkFBOEI7UUFDOUIsK0JBQStCO1FBQy9CLDZEQUE2RDtRQUM3RCxpQ0FBaUM7UUFDakMsb0NBQW9DO1FBQ3BDLGdDQUFnQztRQUNoQyx3REFBd0Q7UUFDeEQsd0RBQXdEO1FBQ3hELGFBQWE7UUFDYix3QkFBd0I7UUFDeEIsNkJBQTZCO1FBQzdCLHlCQUF5QjtLQUN6QixDQUFDO0lBRUssSUFBTSx5QkFBeUIsR0FBL0IsTUFBTSx5QkFBeUI7aUJBQzlCLE9BQUUsR0FBRyxPQUFPLEFBQVYsQ0FBVztRQVFwQixZQUNVLEtBQWUsRUFDUCxhQUF1QyxFQUN2QyxlQUF5SixFQUN6SixhQUFvQyxFQUNoQyxXQUFpRCxFQUNqRCxtQkFBeUQsRUFDcEQsd0JBQW1FO1lBTnBGLFVBQUssR0FBTCxLQUFLLENBQVU7WUFDUCxrQkFBYSxHQUFiLGFBQWEsQ0FBMEI7WUFDdkMsb0JBQWUs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