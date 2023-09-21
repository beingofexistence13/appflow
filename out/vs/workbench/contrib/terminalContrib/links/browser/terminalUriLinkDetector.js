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
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/editor/common/languages/linkComputer", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers"], function (require, exports, network_1, uri_1, linkComputer_1, uriIdentity_1, workspace_1, terminalLinkHelpers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalUriLinkDetector = void 0;
    var Constants;
    (function (Constants) {
        /**
         * The maximum number of links in a line to resolve against the file system. This limit is put
         * in place to avoid sending excessive data when remote connections are in place.
         */
        Constants[Constants["MaxResolvedLinksInLine"] = 10] = "MaxResolvedLinksInLine";
    })(Constants || (Constants = {}));
    let TerminalUriLinkDetector = class TerminalUriLinkDetector {
        static { this.id = 'uri'; }
        constructor(xterm, _processManager, _linkResolver, _uriIdentityService, _workspaceContextService) {
            this.xterm = xterm;
            this._processManager = _processManager;
            this._linkResolver = _linkResolver;
            this._uriIdentityService = _uriIdentityService;
            this._workspaceContextService = _workspaceContextService;
            // 2048 is the maximum URL length
            this.maxLinkLength = 2048;
        }
        async detect(lines, startLine, endLine) {
            const links = [];
            const linkComputerTarget = new TerminalLinkAdapter(this.xterm, startLine, endLine);
            const computedLinks = linkComputer_1.LinkComputer.computeLinks(linkComputerTarget);
            let resolvedLinkCount = 0;
            for (const computedLink of computedLinks) {
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, this.xterm.cols, computedLink.range, startLine);
                // Check if the link is within the mouse position
                const uri = computedLink.url
                    ? (typeof computedLink.url === 'string' ? uri_1.URI.parse(this._excludeLineAndColSuffix(computedLink.url)) : computedLink.url)
                    : undefined;
                if (!uri) {
                    continue;
                }
                const text = computedLink.url?.toString() || '';
                // Don't try resolve any links of excessive length
                if (text.length > this.maxLinkLength) {
                    continue;
                }
                // Handle non-file scheme links
                if (uri.scheme !== network_1.Schemas.file) {
                    links.push({
                        text,
                        uri,
                        bufferRange,
                        type: "Url" /* TerminalBuiltinLinkType.Url */
                    });
                    continue;
                }
                // Filter out URI with unrecognized authorities
                if (uri.authority.length !== 2 && uri.authority.endsWith(':')) {
                    continue;
                }
                // As a fallback URI, treat the authority as local to the workspace. This is required
                // for `ls --hyperlink` support for example which includes the hostname in the URI like
                // `file://Some-Hostname/mnt/c/foo/bar`.
                const uriCandidates = [uri];
                if (uri.authority.length > 0) {
                    uriCandidates.push(uri_1.URI.from({ ...uri, authority: undefined }));
                }
                // Iterate over all candidates, pushing the candidate on the first that's verified
                for (const uriCandidate of uriCandidates) {
                    const linkStat = await this._linkResolver.resolveLink(this._processManager, text, uriCandidate);
                    // Create the link if validated
                    if (linkStat) {
                        let type;
                        if (linkStat.isDirectory) {
                            if (this._isDirectoryInsideWorkspace(uriCandidate)) {
                                type = "LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */;
                            }
                            else {
                                type = "LocalFolderOutsideWorkspace" /* TerminalBuiltinLinkType.LocalFolderOutsideWorkspace */;
                            }
                        }
                        else {
                            type = "LocalFile" /* TerminalBuiltinLinkType.LocalFile */;
                        }
                        links.push({
                            // Use computedLink.url if it's a string to retain the line/col suffix
                            text: typeof computedLink.url === 'string' ? computedLink.url : linkStat.link,
                            uri: uriCandidate,
                            bufferRange,
                            type
                        });
                        resolvedLinkCount++;
                        break;
                    }
                }
                // Stop early if too many links exist in the line
                if (++resolvedLinkCount >= 10 /* Constants.MaxResolvedLinksInLine */) {
                    break;
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
        _excludeLineAndColSuffix(path) {
            return path.replace(/:\d+(:\d+)?$/, '');
        }
    };
    exports.TerminalUriLinkDetector = TerminalUriLinkDetector;
    exports.TerminalUriLinkDetector = TerminalUriLinkDetector = __decorate([
        __param(3, uriIdentity_1.IUriIdentityService),
        __param(4, workspace_1.IWorkspaceContextService)
    ], TerminalUriLinkDetector);
    class TerminalLinkAdapter {
        constructor(_xterm, _lineStart, _lineEnd) {
            this._xterm = _xterm;
            this._lineStart = _lineStart;
            this._lineEnd = _lineEnd;
        }
        getLineCount() {
            return 1;
        }
        getLineContent() {
            return (0, terminalLinkHelpers_1.getXtermLineContent)(this._xterm.buffer.active, this._lineStart, this._lineEnd, this._xterm.cols);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxVcmlMaW5rRGV0ZWN0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvbGlua3MvYnJvd3Nlci90ZXJtaW5hbFVyaUxpbmtEZXRlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhaEcsSUFBVyxTQU1WO0lBTkQsV0FBVyxTQUFTO1FBQ25COzs7V0FHRztRQUNILDhFQUEyQixDQUFBO0lBQzVCLENBQUMsRUFOVSxTQUFTLEtBQVQsU0FBUyxRQU1uQjtJQUVNLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXVCO2lCQUM1QixPQUFFLEdBQUcsS0FBSyxBQUFSLENBQVM7UUFLbEIsWUFDVSxLQUFlLEVBQ1AsZUFBeUosRUFDekosYUFBb0MsRUFDaEMsbUJBQXlELEVBQ3BELHdCQUFtRTtZQUpwRixVQUFLLEdBQUwsS0FBSyxDQUFVO1lBQ1Asb0JBQWUsR0FBZixlQUFlLENBQTBJO1lBQ3pKLGtCQUFhLEdBQWIsYUFBYSxDQUF1QjtZQUNmLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFDbkMsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQVI5RixpQ0FBaUM7WUFDeEIsa0JBQWEsR0FBRyxJQUFJLENBQUM7UUFTOUIsQ0FBQztRQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBb0IsRUFBRSxTQUFpQixFQUFFLE9BQWU7WUFDcEUsTUFBTSxLQUFLLEdBQTBCLEVBQUUsQ0FBQztZQUV4QyxNQUFNLGtCQUFrQixHQUFHLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbkYsTUFBTSxhQUFhLEdBQUcsMkJBQVksQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUVwRSxJQUFJ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