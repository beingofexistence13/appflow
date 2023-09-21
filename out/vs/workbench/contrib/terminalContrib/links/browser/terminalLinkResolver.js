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
    exports.TerminalLinkResolver = void 0;
    let TerminalLinkResolver = class TerminalLinkResolver {
        constructor(_fileService) {
            this._fileService = _fileService;
            // Link cache could be shared across all terminals, but that could lead to weird results when
            // both local and remote terminals are present
            this._resolvedLinkCaches = new Map();
        }
        async resolveLink(processManager, link, uri) {
            // Get the link cache
            let cache = this._resolvedLinkCaches.get(processManager.remoteAuthority ?? '');
            if (!cache) {
                cache = new LinkCache();
                this._resolvedLinkCaches.set(processManager.remoteAuthority ?? '', cache);
            }
            // Check resolved link cache first
            const cached = cache.get(uri || link);
            if (cached !== undefined) {
                return cached;
            }
            if (uri) {
                try {
                    const stat = await this._fileService.stat(uri);
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
            let linkUrl = (0, terminalLinkParsing_1.removeLinkSuffix)(link);
            // Remove any query string
            linkUrl = (0, terminalLinkParsing_1.removeLinkQueryString)(linkUrl);
            // Exit early if the link is determines as not valid already
            if (linkUrl.length === 0) {
                cache.set(link, null);
                return null;
            }
            // If the link looks like a /mnt/ WSL path and this is a Windows frontend, use the backend
            // to get the resolved path from the wslpath util.
            if (platform_1.isWindows && link.match(/^\/mnt\/[a-z]/i) && processManager.backend) {
                linkUrl = await processManager.backend.getWslPath(linkUrl, 'unix-to-win');
            }
            // Skip preprocessing if it looks like a special Windows -> WSL link
            else if (platform_1.isWindows && link.match(/^(?:\/\/|\\\\)wsl(?:\$|\.localhost)(\/|\\)/)) {
                // No-op, it's already the right format
            }
            // Handle all non-WSL links
            else {
                const preprocessedLink = this._preprocessPath(linkUrl, processManager.initialCwd, processManager.os, processManager.userHome);
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
                    const stat = await this._fileService.stat(uri);
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
        _preprocessPath(link, initialCwd, os, userHome) {
            const osPath = this._getOsPath(os);
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
                    if (!link.match('^' + terminalLinkParsing_1.winDrivePrefix) && !link.startsWith('\\\\?\\')) {
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
        _getOsPath(os) {
            return (os ?? platform_1.OS) === 1 /* OperatingSystem.Windows */ ? path_1.win32 : path_1.posix;
        }
    };
    exports.TerminalLinkResolver = TerminalLinkResolver;
    exports.TerminalLinkResolver = TerminalLinkResolver = __decorate([
        __param(0, files_1.IFileService)
    ], TerminalLinkResolver);
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
            this._cache = new Map();
            this._cacheTilTimeout = 0;
        }
        set(link, value) {
            // Reset cached link TTL on any set
            if (this._cacheTilTimeout) {
                window.clearTimeout(this._cacheTilTimeout);
            }
            this._cacheTilTimeout = window.setTimeout(() => this._cache.clear(), 10000 /* LinkCacheConstants.TTL */);
            this._cache.set(this._getKey(link), value);
        }
        get(link) {
            return this._cache.get(this._getKey(link));
        }
        _getKey(link) {
            if (uri_1.URI.isUri(link)) {
                return link.toString();
            }
            return link;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvbGlua3MvYnJvd3Nlci90ZXJtaW5hbExpbmtSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZekYsSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBb0I7UUFPaEMsWUFDZSxZQUEyQztZQUExQixpQkFBWSxHQUFaLFlBQVksQ0FBYztZQUwxRCw2RkFBNkY7WUFDN0YsOENBQThDO1lBQzdCLHdCQUFtQixHQUEyQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBS3pFLENBQUM7UUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLGNBQXdKLEVBQUUsSUFBWSxFQUFFLEdBQVM7WUFDbE0scUJBQXFCO1lBQ3JCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNYLEtBQUssR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxlQUFlLElBQUksRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzFFO1lBRUQsa0NBQWtDO1lBQ2xDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDO1lBQ3RDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDekIsT0FBTyxNQUFNLENBQUM7YUFDZDtZQUVELElBQUksR0FBRyxFQUFFO2dCQUNSLElBQUk7b0JBQ0gsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxD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