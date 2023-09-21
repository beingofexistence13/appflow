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
define(["require", "exports", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkParsing", "vs/base/common/uri", "vs/base/common/network", "vs/base/common/platform", "vs/platform/files/common/files", "vs/base/common/path"], function (require, exports, terminalLinkParsing_1, uri_1, network_1, platform_1, files_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YWb = void 0;
    let $YWb = class $YWb {
        constructor(b) {
            this.b = b;
            // Link cache could be shared across all terminals, but that could lead to weird results when
            // both local and remote terminals are present
            this.a = new Map();
        }
        async resolveLink(processManager, link, uri) {
            // Get the link cache
            let cache = this.a.get(processManager.remoteAuthority ?? '');
            if (!cache) {
                cache = new LinkCache();
                this.a.set(processManager.remoteAuthority ?? '', cache);
            }
            // Check resolved link cache first
            const cached = cache.get(uri || link);
            if (cached !== undefined) {
                return cached;
            }
            if (uri) {
                try {
                    const stat = await this.b.stat(uri);
                    const result = { uri, link, isDirectory: stat.isDirectory };
                    cache.set(uri, result);
                    return result;
                }
                catch (e) {
                    // Does not exist
                    cache.set(uri, null);
                    return null;
                }
            }
            // Remove any line/col suffix
            let linkUrl = (0, terminalLinkParsing_1.$Ukb)(link);
            // Remove any query string
            linkUrl = (0, terminalLinkParsing_1.$Vkb)(linkUrl);
            // Exit early if the link is determines as not valid already
            if (linkUrl.length === 0) {
                cache.set(link, null);
                return null;
            }
            // If the link looks like a /mnt/ WSL path and this is a Windows frontend, use the backend
            // to get the resolved path from the wslpath util.
            if (platform_1.$i && link.match(/^\/mnt\/[a-z]/i) && processManager.backend) {
                linkUrl = await processManager.backend.getWslPath(linkUrl, 'unix-to-win');
            }
            // Skip preprocessing if it looks like a special Windows -> WSL link
            else if (platform_1.$i && link.match(/^(?:\/\/|\\\\)wsl(?:\$|\.localhost)(\/|\\)/)) {
                // No-op, it's already the right format
            }
            // Handle all non-WSL links
            else {
                const preprocessedLink = this.c(linkUrl, processManager.initialCwd, processManager.os, processManager.userHome);
                if (!preprocessedLink) {
                    cache.set(link, null);
                    return null;
                }
                linkUrl = preprocessedLink;
            }
            try {
                let uri;
                if (processManager.remoteAuthority) {
                    uri = uri_1.URI.from({
                        scheme: network_1.Schemas.vscodeRemote,
                        authority: processManager.remoteAuthority,
                        path: linkUrl
                    });
                }
                else {
                    uri = uri_1.URI.file(linkUrl);
                }
                try {
                    const stat = await this.b.stat(uri);
                    const result = { uri, link, isDirectory: stat.isDirectory };
                    cache.set(link, result);
                    return result;
                }
                catch (e) {
                    // Does not exist
                    cache.set(link, null);
                    return null;
                }
            }
            catch {
                // Errors in parsing the path
                cache.set(link, null);
                return null;
            }
        }
        c(link, initialCwd, os, userHome) {
            const osPath = this.d(os);
            if (link.charAt(0) === '~') {
                // Resolve ~ -> userHome
                if (!userHome) {
                    return null;
                }
                link = osPath.join(userHome, link.substring(1));
            }
            else if (link.charAt(0) !== '/' && link.charAt(0) !== '~') {
                // Resolve workspace path . | .. | <relative_path> -> <path>/. | <path>/.. | <path>/<relative_path>
                if (os === 1 /* OperatingSystem.Windows */) {
                    if (!link.match('^' + terminalLinkParsing_1.$1kb) && !link.startsWith('\\\\?\\')) {
                        if (!initialCwd) {
                            // Abort if no workspace is open
                            return null;
                        }
                        link = osPath.join(initialCwd, link);
                    }
                    else {
                        // Remove \\?\ from paths so that they share the same underlying
                        // uri and don't open multiple tabs for the same file
                        link = link.replace(/^\\\\\?\\/, '');
                    }
                }
                else {
                    if (!initialCwd) {
                        // Abort if no workspace is open
                        return null;
                    }
                    link = osPath.join(initialCwd, link);
                }
            }
            link = osPath.normalize(link);
            return link;
        }
        d(os) {
            return (os ?? platform_1.OS) === 1 /* OperatingSystem.Windows */ ? path_1.$5d : path_1.$6d;
        }
    };
    exports.$YWb = $YWb;
    exports.$YWb = $YWb = __decorate([
        __param(0, files_1.$6j)
    ], $YWb);
    var LinkCacheConstants;
    (function (LinkCacheConstants) {
        /**
         * How long to cache links for in milliseconds, the TTL resets whenever a new value is set in
         * the cache.
         */
        LinkCacheConstants[LinkCacheConstants["TTL"] = 10000] = "TTL";
    })(LinkCacheConstants || (LinkCacheConstants = {}));
    class LinkCache {
        constructor() {
            this.a = new Map();
            this.b = 0;
        }
        set(link, value) {
            // Reset cached link TTL on any set
            if (this.b) {
                window.clearTimeout(this.b);
            }
            this.b = window.setTimeout(() => this.a.clear(), 10000 /* LinkCacheConstants.TTL */);
            this.a.set(this.c(link), value);
        }
        get(link) {
            return this.a.get(this.c(link));
        }
        c(link) {
            if (uri_1.URI.isUri(link)) {
                return link.toString();
            }
            return link;
        }
    }
});
//# sourceMappingURL=terminalLinkResolver.js.map