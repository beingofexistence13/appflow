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
    exports.TerminalMultiLineLinkDetector = void 0;
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
    let TerminalMultiLineLinkDetector = class TerminalMultiLineLinkDetector {
        static { this.id = 'multiline'; }
        constructor(xterm, _processManager, _linkResolver, _logService, _uriIdentityService, _workspaceContextService) {
            this.xterm = xterm;
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
            this._logService.trace('terminalMultiLineLinkDetector#detect text', text);
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
                this._logService.trace('terminalMultiLineLinkDetector#detect candidate', link);
                // Scan up looking for the first line that could be a path
                let possiblePath;
                for (let index = startLine - 1; index >= 0; index--) {
                    // Ignore lines that aren't at the beginning of a wrapped line
                    if (this.xterm.buffer.active.getLine(index).isWrapped) {
                        continue;
                    }
                    const text = (0, terminalLinkHelpers_1.getXtermLineContent)(this.xterm.buffer.active, index, index, this.xterm.cols);
                    if (!text.match(/^\s*\d/)) {
                        possiblePath = text;
                        break;
                    }
                }
                if (!possiblePath) {
                    continue;
                }
                // Check if the first non-matching line is an absolute or relative link
                const linkStat = await this._linkResolver.resolveLink(this._processManager, possiblePath);
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
                    // Convert the entire line's text string index into a wrapped buffer range
                    const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, this.xterm.cols, {
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
                    this._logService.trace('terminalMultiLineLinkDetector#detect verified link', simpleLink);
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
                    this._logService.trace('terminalMultiLineLinkDetector#detect candidate', link);
                    // Scan up looking for the first line that could be a path
                    let possiblePath;
                    for (let index = startLine - 1; index >= 0; index--) {
                        // Ignore lines that aren't at the beginning of a wrapped line
                        if (this.xterm.buffer.active.getLine(index).isWrapped) {
                            continue;
                        }
                        const text = (0, terminalLinkHelpers_1.getXtermLineContent)(this.xterm.buffer.active, index, index, this.xterm.cols);
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
                    const linkStat = await this._linkResolver.resolveLink(this._processManager, possiblePath);
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
                        // Convert the link to the buffer range
                        const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, this.xterm.cols, {
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
                        this._logService.trace('terminalMultiLineLinkDetector#detect verified link', simpleLink);
                        links.push(simpleLink);
                        // Break on the first match
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
    };
    exports.TerminalMultiLineLinkDetector = TerminalMultiLineLinkDetector;
    exports.TerminalMultiLineLinkDetector = TerminalMultiLineLinkDetector = __decorate([
        __param(3, terminal_1.ITerminalLogService),
        __param(4, uriIdentity_1.IUriIdentityService),
        __param(5, workspace_1.IWorkspaceContextService)
    ], TerminalMultiLineLinkDetector);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxNdWx0aUxpbmVMaW5rRGV0ZWN0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvbGlua3MvYnJvd3Nlci90ZXJtaW5hbE11bHRpTGluZUxpbmtEZXRlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFXaEcsSUFBVyxTQVdWO0lBWEQsV0FBVyxTQUFTO1FBQ25COztXQUVHO1FBQ0gsOERBQW9CLENBQUE7UUFFcEI7OztXQUdHO1FBQ0gsOEVBQTRCLENBQUE7SUFDN0IsQ0FBQyxFQVhVLFNBQVMsS0FBVCxTQUFTLFFBV25CO0lBRUQsTUFBTSx3QkFBd0IsR0FBRztRQUNoQyxXQUFXO1FBQ1gsZUFBZTtRQUNmLG9CQUFvQjtRQUNwQix3QkFBd0I7UUFDeEIsVUFBVTtRQUNWLGVBQWU7UUFDZixzQkFBc0I7UUFDdEIsc0NBQXNDO0tBQ3RDLENBQUM7SUFFRixNQUFNLGVBQWUsR0FBRztRQUN2QixrQkFBa0I7UUFDbEIsa0JBQWtCO1FBQ2xCLG9DQUFvQztRQUNwQyw2REFBNkQ7S0FDN0QsQ0FBQztJQUVLLElBQU0sNkJBQTZCLEdBQW5DLE1BQU0sNkJBQTZCO2lCQUNsQyxPQUFFLEdBQUcsV0FBVyxBQUFkLENBQWU7UUFReEIsWUFDVSxLQUFlLEVBQ1AsZUFBeUosRUFDekosYUFBb0MsRUFDaEMsV0FBaUQsRUFDakQsbUJBQXlELEVBQ3BELHdCQUFtRTtZQUxwRixVQUFLLEdBQUwsS0FBSyxDQUFVO1lBQ1Asb0JBQWUsR0FBZixlQUFlLENBQTBJO1lBQ3pKLGtCQUFhLEdBQWIsYUFBYSxDQUF1QjtZQUNmLGdCQUFXLEdBQVgsV0FBVyxDQUFxQjtZQUNoQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBQ25DLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7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