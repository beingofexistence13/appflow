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
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/host/browser/host", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/search/common/search", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkParsing", "vs/platform/terminal/common/terminal"], function (require, exports, network_1, uri_1, commands_1, files_1, instantiation_1, opener_1, quickInput_1, workspace_1, terminalLinkHelpers_1, editorService_1, environmentService_1, host_1, queryBuilder_1, search_1, configuration_1, terminalLinkParsing_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PWb = exports.$OWb = exports.$NWb = exports.$MWb = exports.$LWb = void 0;
    let $LWb = class $LWb {
        constructor(a) {
            this.a = a;
        }
        async open(link) {
            if (!link.uri) {
                throw new Error('Tried to open file link without a resolved URI');
            }
            const linkSuffix = link.parsedLink ? link.parsedLink.suffix : (0, terminalLinkParsing_1.$Xkb)(link.text);
            let selection = link.selection;
            if (!selection) {
                selection = linkSuffix?.row === undefined ? undefined : {
                    startLineNumber: linkSuffix.row ?? 1,
                    startColumn: linkSuffix.col ?? 1,
                    endLineNumber: linkSuffix.rowEnd,
                    endColumn: linkSuffix.colEnd
                };
            }
            await this.a.openEditor({
                resource: link.uri,
                options: { pinned: true, selection, revealIfOpened: true }
            });
        }
    };
    exports.$LWb = $LWb;
    exports.$LWb = $LWb = __decorate([
        __param(0, editorService_1.$9C)
    ], $LWb);
    let $MWb = class $MWb {
        constructor(a) {
            this.a = a;
        }
        async open(link) {
            if (!link.uri) {
                throw new Error('Tried to open folder in workspace link without a resolved URI');
            }
            await this.a.executeCommand('revealInExplorer', link.uri);
        }
    };
    exports.$MWb = $MWb;
    exports.$MWb = $MWb = __decorate([
        __param(0, commands_1.$Fr)
    ], $MWb);
    let $NWb = class $NWb {
        constructor(a) {
            this.a = a;
        }
        async open(link) {
            if (!link.uri) {
                throw new Error('Tried to open folder in workspace link without a resolved URI');
            }
            this.a.openWindow([{ folderUri: link.uri }], { forceNewWindow: true });
        }
    };
    exports.$NWb = $NWb;
    exports.$NWb = $NWb = __decorate([
        __param(0, host_1.$VT)
    ], $NWb);
    let $OWb = class $OWb {
        constructor(b, c, d, f, g, h, i, j, k, l, m, n) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.a = this.i.createInstance(queryBuilder_1.$AJ);
        }
        async open(link) {
            const osPath = (0, terminalLinkHelpers_1.$HWb)(this.g());
            const pathSeparator = osPath.sep;
            // Remove file:/// and any leading ./ or ../ since quick access doesn't understand that format
            let text = link.text.replace(/^file:\/\/\/?/, '');
            text = osPath.normalize(text).replace(/^(\.+[\\/])+/, '');
            // Remove `:<one or more non number characters>` from the end of the link.
            // Examples:
            // - Ruby stack traces: <link>:in ...
            // - Grep output: <link>:<result line>
            // This only happens when the colon is _not_ followed by a forward- or back-slash as that
            // would break absolute Windows paths (eg. `C:/Users/...`).
            text = text.replace(/:[^\\/][^\d]+$/, '');
            // If any of the names of the folders in the workspace matches
            // a prefix of the link, remove that prefix and continue
            this.m.getWorkspace().folders.forEach((folder) => {
                if (text.substring(0, folder.name.length + 1) === folder.name + pathSeparator) {
                    text = text.substring(folder.name.length + 1);
                    return;
                }
            });
            let cwdResolvedText = text;
            if (this.b.has(2 /* TerminalCapability.CommandDetection */)) {
                cwdResolvedText = (0, terminalLinkHelpers_1.$GWb)(this.b, link.bufferRange.start.y, text, osPath, this.j)?.[0] || text;
            }
            // Try open the cwd resolved link first
            if (await this.p(cwdResolvedText, link)) {
                return;
            }
            // If the cwd resolved text didn't match, try find the link without the cwd resolved, for
            // example when a command prints paths in a sub-directory of the current cwd
            if (text !== cwdResolvedText) {
                if (await this.p(text, link)) {
                    return;
                }
            }
            // Fallback to searching quick access
            return this.k.quickAccess.show(text);
        }
        async o(sanitizedLink) {
            // Make the link relative to the cwd if it isn't absolute
            const os = this.g();
            const pathModule = (0, terminalLinkHelpers_1.$HWb)(os);
            const isAbsolute = pathModule.isAbsolute(sanitizedLink);
            let absolutePath = isAbsolute ? sanitizedLink : undefined;
            if (!isAbsolute && this.c.length > 0) {
                absolutePath = pathModule.join(this.c, sanitizedLink);
            }
            // Try open as an absolute link
            let resourceMatch;
            if (absolutePath) {
                let normalizedAbsolutePath = absolutePath;
                if (os === 1 /* OperatingSystem.Windows */) {
                    normalizedAbsolutePath = absolutePath.replace(/\\/g, '/');
                    if (normalizedAbsolutePath.match(/[a-z]:/i)) {
                        normalizedAbsolutePath = `/${normalizedAbsolutePath}`;
                    }
                }
                let uri;
                if (this.n.remoteAuthority) {
                    uri = uri_1.URI.from({
                        scheme: network_1.Schemas.vscodeRemote,
                        authority: this.n.remoteAuthority,
                        path: normalizedAbsolutePath
                    });
                }
                else {
                    uri = uri_1.URI.file(normalizedAbsolutePath);
                }
                try {
                    const fileStat = await this.h.stat(uri);
                    resourceMatch = { uri, isDirectory: fileStat.isDirectory };
                }
                catch {
                    // File or dir doesn't exist, continue on
                }
            }
            // Search the workspace if an exact match based on the absolute path was not found
            if (!resourceMatch) {
                const results = await this.l.fileSearch(this.a.file(this.m.getWorkspace().folders, {
                    filePattern: sanitizedLink,
                    maxResults: 2
                }));
                if (results.results.length > 0) {
                    if (results.results.length === 1) {
                        // If there's exactly 1 search result, return it regardless of whether it's
                        // exact or partial.
                        resourceMatch = { uri: results.results[0].resource };
                    }
                    else if (!isAbsolute) {
                        // For non-absolute links, exact link matching is allowed only if there is a single an exact
                        // file match. For example searching for `foo.txt` when there is no cwd information
                        // available (ie. only the initial cwd) should open the file directly only if there is a
                        // single file names `foo.txt` anywhere within the folder. These same rules apply to
                        // relative paths with folders such as `src/foo.txt`.
                        const results = await this.l.fileSearch(this.a.file(this.m.getWorkspace().folders, {
                            filePattern: `**/${sanitizedLink}`
                        }));
                        // Find an exact match if it exists
                        const exactMatches = results.results.filter(e => e.resource.toString().endsWith(sanitizedLink));
                        if (exactMatches.length === 1) {
                            resourceMatch = { uri: exactMatches[0].resource };
                        }
                    }
                }
            }
            return resourceMatch;
        }
        async p(text, link) {
            const sanitizedLink = text.replace(/:\d+(:\d+)?$/, '');
            try {
                const result = await this.o(sanitizedLink);
                if (result) {
                    const { uri, isDirectory } = result;
                    const linkToOpen = {
                        // Use the absolute URI's path here so the optional line/col get detected
                        text: result.uri.path + (text.match(/:\d+(:\d+)?$/)?.[0] || ''),
                        uri,
                        bufferRange: link.bufferRange,
                        type: link.type
                    };
                    if (uri) {
                        await (isDirectory ? this.f.open(linkToOpen) : this.d.open(linkToOpen));
                        return true;
                    }
                }
            }
            catch {
                return false;
            }
            return false;
        }
    };
    exports.$OWb = $OWb;
    exports.$OWb = $OWb = __decorate([
        __param(5, files_1.$6j),
        __param(6, instantiation_1.$Ah),
        __param(7, terminal_1.$Zq),
        __param(8, quickInput_1.$Gq),
        __param(9, search_1.$oI),
        __param(10, workspace_1.$Kh),
        __param(11, environmentService_1.$hJ)
    ], $OWb);
    let $PWb = class $PWb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async open(link) {
            if (!link.uri) {
                throw new Error('Tried to open a url without a resolved URI');
            }
            // It's important to use the raw string value here to avoid converting pre-encoded values
            // from the URL like `%2B` -> `+`.
            this.b.open(link.text, {
                allowTunneling: this.a && this.c.getValue('remote.forwardOnOpen'),
                allowContributedOpeners: true,
                openExternal: true
            });
        }
    };
    exports.$PWb = $PWb;
    exports.$PWb = $PWb = __decorate([
        __param(1, opener_1.$NT),
        __param(2, configuration_1.$8h)
    ], $PWb);
});
//# sourceMappingURL=terminalLinkOpeners.js.map