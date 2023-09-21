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
define(["require", "exports", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/path/common/pathService", "vs/base/browser/keyboardEvent", "vs/nls", "vs/platform/tunnel/common/tunnel", "vs/platform/configuration/common/configuration"], function (require, exports, network_1, osPath, platform, uri_1, files_1, opener_1, editorService_1, environmentService_1, pathService_1, keyboardEvent_1, nls_1, tunnel_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinkDetector = void 0;
    const CONTROL_CODES = '\\u0000-\\u0020\\u007f-\\u009f';
    const WEB_LINK_REGEX = new RegExp('(?:[a-zA-Z][a-zA-Z0-9+.-]{2,}:\\/\\/|data:|www\\.)[^\\s' + CONTROL_CODES + '"]{2,}[^\\s' + CONTROL_CODES + '"\')}\\],:;.!?]', 'ug');
    const WIN_ABSOLUTE_PATH = /(?:[a-zA-Z]:(?:(?:\\|\/)[\w\.-]*)+)/;
    const WIN_RELATIVE_PATH = /(?:(?:\~|\.)(?:(?:\\|\/)[\w\.-]*)+)/;
    const WIN_PATH = new RegExp(`(${WIN_ABSOLUTE_PATH.source}|${WIN_RELATIVE_PATH.source})`);
    const POSIX_PATH = /((?:\~|\.)?(?:\/[\w\.-]*)+)/;
    const LINE_COLUMN = /(?:\:([\d]+))?(?:\:([\d]+))?/;
    const PATH_LINK_REGEX = new RegExp(`${platform.isWindows ? WIN_PATH.source : POSIX_PATH.source}${LINE_COLUMN.source}`, 'g');
    const LINE_COLUMN_REGEX = /:([\d]+)(?::([\d]+))?$/;
    const MAX_LENGTH = 2000;
    let LinkDetector = class LinkDetector {
        constructor(editorService, fileService, openerService, pathService, tunnelService, environmentService, configurationService) {
            this.editorService = editorService;
            this.fileService = fileService;
            this.openerService = openerService;
            this.pathService = pathService;
            this.tunnelService = tunnelService;
            this.environmentService = environmentService;
            this.configurationService = configurationService;
            // noop
        }
        /**
         * Matches and handles web urls, absolute and relative file links in the string provided.
         * Returns <span/> element that wraps the processed string, where matched links are replaced by <a/>.
         * 'onclick' event is attached to all anchored links that opens them in the editor.
         * When splitLines is true, each line of the text, even if it contains no links, is wrapped in a <span>
         * and added as a child of the returned <span>.
         */
        linkify(text, splitLines, workspaceFolder, includeFulltext) {
            if (splitLines) {
                const lines = text.split('\n');
                for (let i = 0; i < lines.length - 1; i++) {
                    lines[i] = lines[i] + '\n';
                }
                if (!lines[lines.length - 1]) {
                    // Remove the last element ('') that split added.
                    lines.pop();
                }
                const elements = lines.map(line => this.linkify(line, false, workspaceFolder, includeFulltext));
                if (elements.length === 1) {
                    // Do not wrap single line with extra span.
                    return elements[0];
                }
                const container = document.createElement('span');
                elements.forEach(e => container.appendChild(e));
                return container;
            }
            const container = document.createElement('span');
            for (const part of this.detectLinks(text)) {
                try {
                    switch (part.kind) {
                        case 'text':
                            container.appendChild(document.createTextNode(part.value));
                            break;
                        case 'web':
                            container.appendChild(this.createWebLink(includeFulltext ? text : undefined, part.value));
                            break;
                        case 'path': {
                            const path = part.captures[0];
                            const lineNumber = part.captures[1] ? Number(part.captures[1]) : 0;
                            const columnNumber = part.captures[2] ? Number(part.captures[2]) : 0;
                            container.appendChild(this.createPathLink(includeFulltext ? text : undefined, part.value, path, lineNumber, columnNumber, workspaceFolder));
                            break;
                        }
                    }
                }
                catch (e) {
                    container.appendChild(document.createTextNode(part.value));
                }
            }
            return container;
        }
        createWebLink(fulltext, url) {
            const link = this.createLink(url);
            let uri = uri_1.URI.parse(url);
            // if the URI ends with something like `foo.js:12:3`, parse
            // that into a fragment to reveal that location (#150702)
            const lineCol = LINE_COLUMN_REGEX.exec(uri.path);
            if (lineCol) {
                uri = uri.with({
                    path: uri.path.slice(0, lineCol.index),
                    fragment: `L${lineCol[0].slice(1)}`
                });
            }
            this.decorateLink(link, uri, fulltext, async () => {
                if (uri.scheme === network_1.Schemas.file) {
                    // Just using fsPath here is unsafe: https://github.com/microsoft/vscode/issues/109076
                    const fsPath = uri.fsPath;
                    const path = await this.pathService.path;
                    const fileUrl = osPath.normalize(((path.sep === osPath.posix.sep) && platform.isWindows) ? fsPath.replace(/\\/g, osPath.posix.sep) : fsPath);
                    const fileUri = uri_1.URI.parse(fileUrl);
                    const exists = await this.fileService.exists(fileUri);
                    if (!exists) {
                        return;
                    }
                    await this.editorService.openEditor({
                        resource: fileUri,
                        options: {
                            pinned: true,
                            selection: lineCol ? { startLineNumber: +lineCol[1], startColumn: +lineCol[2] } : undefined,
                        },
                    });
                    return;
                }
                this.openerService.open(url, { allowTunneling: (!!this.environmentService.remoteAuthority && this.configurationService.getValue('remote.forwardOnOpen')) });
            });
            return link;
        }
        createPathLink(fulltext, text, path, lineNumber, columnNumber, workspaceFolder) {
            if (path[0] === '/' && path[1] === '/') {
                // Most likely a url part which did not match, for example ftp://path.
                return document.createTextNode(text);
            }
            const options = { selection: { startLineNumber: lineNumber, startColumn: columnNumber } };
            if (path[0] === '.') {
                if (!workspaceFolder) {
                    return document.createTextNode(text);
                }
                const uri = workspaceFolder.toResource(path);
                const link = this.createLink(text);
                this.decorateLink(link, uri, fulltext, (preserveFocus) => this.editorService.openEditor({ resource: uri, options: { ...options, preserveFocus } }));
                return link;
            }
            if (path[0] === '~') {
                const userHome = this.pathService.resolvedUserHome;
                if (userHome) {
                    path = osPath.join(userHome.fsPath, path.substring(1));
                }
            }
            const link = this.createLink(text);
            link.tabIndex = 0;
            const uri = uri_1.URI.file(osPath.normalize(path));
            this.fileService.stat(uri).then(stat => {
                if (stat.isDirectory) {
                    return;
                }
                this.decorateLink(link, uri, fulltext, (preserveFocus) => this.editorService.openEditor({ resource: uri, options: { ...options, preserveFocus } }));
            }).catch(() => {
                // If the uri can not be resolved we should not spam the console with error, remain quite #86587
            });
            return link;
        }
        createLink(text) {
            const link = document.createElement('a');
            link.textContent = text;
            return link;
        }
        decorateLink(link, uri, fulltext, onClick) {
            link.classList.add('link');
            const followLink = this.tunnelService.canTunnel(uri) ? (0, nls_1.localize)('followForwardedLink', "follow link using forwarded port") : (0, nls_1.localize)('followLink', "follow link");
            link.title = fulltext
                ? (platform.isMacintosh ? (0, nls_1.localize)('fileLinkWithPathMac', "Cmd + click to {0}\n{1}", followLink, fulltext) : (0, nls_1.localize)('fileLinkWithPath', "Ctrl + click to {0}\n{1}", followLink, fulltext))
                : (platform.isMacintosh ? (0, nls_1.localize)('fileLinkMac', "Cmd + click to {0}", followLink) : (0, nls_1.localize)('fileLink', "Ctrl + click to {0}", followLink));
            link.onmousemove = (event) => { link.classList.toggle('pointer', platform.isMacintosh ? event.metaKey : event.ctrlKey); };
            link.onmouseleave = () => link.classList.remove('pointer');
            link.onclick = (event) => {
                const selection = window.getSelection();
                if (!selection || selection.type === 'Range') {
                    return; // do not navigate when user is selecting
                }
                if (!(platform.isMacintosh ? event.metaKey : event.ctrlKey)) {
                    return;
                }
                event.preventDefault();
                event.stopImmediatePropagation();
                onClick(false);
            };
            link.onkeydown = e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.keyCode === 3 /* KeyCode.Enter */ || event.keyCode === 10 /* KeyCode.Space */) {
                    event.preventDefault();
                    event.stopPropagation();
                    onClick(event.keyCode === 10 /* KeyCode.Space */);
                }
            };
        }
        detectLinks(text) {
            if (text.length > MAX_LENGTH) {
                return [{ kind: 'text', value: text, captures: [] }];
            }
            const regexes = [WEB_LINK_REGEX, PATH_LINK_REGEX];
            const kinds = ['web', 'path'];
            const result = [];
            const splitOne = (text, regexIndex) => {
                if (regexIndex >= regexes.length) {
                    result.push({ value: text, kind: 'text', captures: [] });
                    return;
                }
                const regex = regexes[regexIndex];
                let currentIndex = 0;
                let match;
                regex.lastIndex = 0;
                while ((match = regex.exec(text)) !== null) {
                    const stringBeforeMatch = text.substring(currentIndex, match.index);
                    if (stringBeforeMatch) {
                        splitOne(stringBeforeMatch, regexIndex + 1);
                    }
                    const value = match[0];
                    result.push({
                        value: value,
                        kind: kinds[regexIndex],
                        captures: match.slice(1)
                    });
                    currentIndex = match.index + value.length;
                }
                const stringAfterMatches = text.substring(currentIndex);
                if (stringAfterMatches) {
                    splitOne(stringAfterMatches, regexIndex + 1);
                }
            };
            splitOne(text, 0);
            return result;
        }
    };
    exports.LinkDetector = LinkDetector;
    exports.LinkDetector = LinkDetector = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, files_1.IFileService),
        __param(2, opener_1.IOpenerService),
        __param(3, pathService_1.IPathService),
        __param(4, tunnel_1.ITunnelService),
        __param(5, environmentService_1.IWorkbenchEnvironmentService),
        __param(6, configuration_1.IConfigurationService)
    ], LinkDetector);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua0RldGVjdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9saW5rRGV0ZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0JoRyxNQUFNLGFBQWEsR0FBRyxnQ0FBZ0MsQ0FBQztJQUN2RCxNQUFNLGNBQWMsR0FBRyxJQUFJLE1BQU0sQ0FBQyx5REFBeUQsR0FBRyxhQUFhLEdBQUcsYUFBYSxHQUFHLGFBQWEsR0FBRyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUV2SyxNQUFNLGlCQUFpQixHQUFHLHFDQUFxQyxDQUFDO0lBQ2hFLE1BQU0saUJBQWlCLEdBQUcscUNBQXFDLENBQUM7SUFDaEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLElBQUksaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUN6RixNQUFNLFVBQVUsR0FBRyw2QkFBNkIsQ0FBQztJQUNqRCxNQUFNLFdBQVcsR0FBRyw4QkFBOEIsQ0FBQztJQUNuRCxNQUFNLGVBQWUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzVILE1BQU0saUJBQWlCLEdBQUcsd0JBQXdCLENBQUM7SUFFbkQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBU2pCLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQVk7UUFDeEIsWUFDa0MsYUFBNkIsRUFDL0IsV0FBeUIsRUFDdkIsYUFBNkIsRUFDL0IsV0FBeUIsRUFDdkIsYUFBNkIsRUFDZixr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