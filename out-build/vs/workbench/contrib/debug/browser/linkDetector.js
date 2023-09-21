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
define(["require", "exports", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/path/common/pathService", "vs/base/browser/keyboardEvent", "vs/nls!vs/workbench/contrib/debug/browser/linkDetector", "vs/platform/tunnel/common/tunnel", "vs/platform/configuration/common/configuration"], function (require, exports, network_1, osPath, platform, uri_1, files_1, opener_1, editorService_1, environmentService_1, pathService_1, keyboardEvent_1, nls_1, tunnel_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2Pb = void 0;
    const CONTROL_CODES = '\\u0000-\\u0020\\u007f-\\u009f';
    const WEB_LINK_REGEX = new RegExp('(?:[a-zA-Z][a-zA-Z0-9+.-]{2,}:\\/\\/|data:|www\\.)[^\\s' + CONTROL_CODES + '"]{2,}[^\\s' + CONTROL_CODES + '"\')}\\],:;.!?]', 'ug');
    const WIN_ABSOLUTE_PATH = /(?:[a-zA-Z]:(?:(?:\\|\/)[\w\.-]*)+)/;
    const WIN_RELATIVE_PATH = /(?:(?:\~|\.)(?:(?:\\|\/)[\w\.-]*)+)/;
    const WIN_PATH = new RegExp(`(${WIN_ABSOLUTE_PATH.source}|${WIN_RELATIVE_PATH.source})`);
    const POSIX_PATH = /((?:\~|\.)?(?:\/[\w\.-]*)+)/;
    const LINE_COLUMN = /(?:\:([\d]+))?(?:\:([\d]+))?/;
    const PATH_LINK_REGEX = new RegExp(`${platform.$i ? WIN_PATH.source : POSIX_PATH.source}${LINE_COLUMN.source}`, 'g');
    const LINE_COLUMN_REGEX = /:([\d]+)(?::([\d]+))?$/;
    const MAX_LENGTH = 2000;
    let $2Pb = class $2Pb {
        constructor(a, b, c, d, f, g, h) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
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
            for (const part of this.n(text)) {
                try {
                    switch (part.kind) {
                        case 'text':
                            container.appendChild(document.createTextNode(part.value));
                            break;
                        case 'web':
                            container.appendChild(this.j(includeFulltext ? text : undefined, part.value));
                            break;
                        case 'path': {
                            const path = part.captures[0];
                            const lineNumber = part.captures[1] ? Number(part.captures[1]) : 0;
                            const columnNumber = part.captures[2] ? Number(part.captures[2]) : 0;
                            container.appendChild(this.k(includeFulltext ? text : undefined, part.value, path, lineNumber, columnNumber, workspaceFolder));
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
        j(fulltext, url) {
            const link = this.l(url);
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
            this.m(link, uri, fulltext, async () => {
                if (uri.scheme === network_1.Schemas.file) {
                    // Just using fsPath here is unsafe: https://github.com/microsoft/vscode/issues/109076
                    const fsPath = uri.fsPath;
                    const path = await this.d.path;
                    const fileUrl = osPath.$7d(((path.sep === osPath.$6d.sep) && platform.$i) ? fsPath.replace(/\\/g, osPath.$6d.sep) : fsPath);
                    const fileUri = uri_1.URI.parse(fileUrl);
                    const exists = await this.b.exists(fileUri);
                    if (!exists) {
                        return;
                    }
                    await this.a.openEditor({
                        resource: fileUri,
                        options: {
                            pinned: true,
                            selection: lineCol ? { startLineNumber: +lineCol[1], startColumn: +lineCol[2] } : undefined,
                        },
                    });
                    return;
                }
                this.c.open(url, { allowTunneling: (!!this.g.remoteAuthority && this.h.getValue('remote.forwardOnOpen')) });
            });
            return link;
        }
        k(fulltext, text, path, lineNumber, columnNumber, workspaceFolder) {
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
                const link = this.l(text);
                this.m(link, uri, fulltext, (preserveFocus) => this.a.openEditor({ resource: uri, options: { ...options, preserveFocus } }));
                return link;
            }
            if (path[0] === '~') {
                const userHome = this.d.resolvedUserHome;
                if (userHome) {
                    path = osPath.$9d(userHome.fsPath, path.substring(1));
                }
            }
            const link = this.l(text);
            link.tabIndex = 0;
            const uri = uri_1.URI.file(osPath.$7d(path));
            this.b.stat(uri).then(stat => {
                if (stat.isDirectory) {
                    return;
                }
                this.m(link, uri, fulltext, (preserveFocus) => this.a.openEditor({ resource: uri, options: { ...options, preserveFocus } }));
            }).catch(() => {
                // If the uri can not be resolved we should not spam the console with error, remain quite #86587
            });
            return link;
        }
        l(text) {
            const link = document.createElement('a');
            link.textContent = text;
            return link;
        }
        m(link, uri, fulltext, onClick) {
            link.classList.add('link');
            const followLink = this.f.canTunnel(uri) ? (0, nls_1.localize)(0, null) : (0, nls_1.localize)(1, null);
            link.title = fulltext
                ? (platform.$j ? (0, nls_1.localize)(2, null, followLink, fulltext) : (0, nls_1.localize)(3, null, followLink, fulltext))
                : (platform.$j ? (0, nls_1.localize)(4, null, followLink) : (0, nls_1.localize)(5, null, followLink));
            link.onmousemove = (event) => { link.classList.toggle('pointer', platform.$j ? event.metaKey : event.ctrlKey); };
            link.onmouseleave = () => link.classList.remove('pointer');
            link.onclick = (event) => {
                const selection = window.getSelection();
                if (!selection || selection.type === 'Range') {
                    return; // do not navigate when user is selecting
                }
                if (!(platform.$j ? event.metaKey : event.ctrlKey)) {
                    return;
                }
                event.preventDefault();
                event.stopImmediatePropagation();
                onClick(false);
            };
            link.onkeydown = e => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.keyCode === 3 /* KeyCode.Enter */ || event.keyCode === 10 /* KeyCode.Space */) {
                    event.preventDefault();
                    event.stopPropagation();
                    onClick(event.keyCode === 10 /* KeyCode.Space */);
                }
            };
        }
        n(text) {
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
    exports.$2Pb = $2Pb;
    exports.$2Pb = $2Pb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, files_1.$6j),
        __param(2, opener_1.$NT),
        __param(3, pathService_1.$yJ),
        __param(4, tunnel_1.$Wz),
        __param(5, environmentService_1.$hJ),
        __param(6, configuration_1.$8h)
    ], $2Pb);
});
//# sourceMappingURL=linkDetector.js.map