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
    exports.$RWb = void 0;
    var Constants;
    (function (Constants) {
        /**
         * The maximum number of links in a line to resolve against the file system. This limit is put
         * in place to avoid sending excessive data when remote connections are in place.
         */
        Constants[Constants["MaxResolvedLinksInLine"] = 10] = "MaxResolvedLinksInLine";
    })(Constants || (Constants = {}));
    let $RWb = class $RWb {
        static { this.id = 'uri'; }
        constructor(xterm, a, b, c, d) {
            this.xterm = xterm;
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            // 2048 is the maximum URL length
            this.maxLinkLength = 2048;
        }
        async detect(lines, startLine, endLine) {
            const links = [];
            const linkComputerTarget = new TerminalLinkAdapter(this.xterm, startLine, endLine);
            const computedLinks = linkComputer_1.$zY.computeLinks(linkComputerTarget);
            let resolvedLinkCount = 0;
            for (const computedLink of computedLinks) {
                const bufferRange = (0, terminalLinkHelpers_1.$CWb)(lines, this.xterm.cols, computedLink.range, startLine);
                // Check if the link is within the mouse position
                const uri = computedLink.url
                    ? (typeof computedLink.url === 'string' ? uri_1.URI.parse(this.f(computedLink.url)) : computedLink.url)
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
                    const linkStat = await this.b.resolveLink(this.a, text, uriCandidate);
                    // Create the link if validated
                    if (linkStat) {
                        let type;
                        if (linkStat.isDirectory) {
                            if (this.e(uriCandidate)) {
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
        e(uri) {
            const folders = this.d.getWorkspace().folders;
            for (let i = 0; i < folders.length; i++) {
                if (this.c.extUri.isEqualOrParent(uri, folders[i].uri)) {
                    return true;
                }
            }
            return false;
        }
        f(path) {
            return path.replace(/:\d+(:\d+)?$/, '');
        }
    };
    exports.$RWb = $RWb;
    exports.$RWb = $RWb = __decorate([
        __param(3, uriIdentity_1.$Ck),
        __param(4, workspace_1.$Kh)
    ], $RWb);
    class TerminalLinkAdapter {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        getLineCount() {
            return 1;
        }
        getLineContent() {
            return (0, terminalLinkHelpers_1.$EWb)(this.a.buffer.active, this.b, this.c, this.a.cols);
        }
    }
});
//# sourceMappingURL=terminalUriLinkDetector.js.map