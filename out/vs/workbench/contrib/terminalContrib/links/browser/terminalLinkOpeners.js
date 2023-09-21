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
    exports.TerminalUrlLinkOpener = exports.TerminalSearchLinkOpener = exports.TerminalLocalFolderOutsideWorkspaceLinkOpener = exports.TerminalLocalFolderInWorkspaceLinkOpener = exports.TerminalLocalFileLinkOpener = void 0;
    let TerminalLocalFileLinkOpener = class TerminalLocalFileLinkOpener {
        constructor(_editorService) {
            this._editorService = _editorService;
        }
        async open(link) {
            if (!link.uri) {
                throw new Error('Tried to open file link without a resolved URI');
            }
            const linkSuffix = link.parsedLink ? link.parsedLink.suffix : (0, terminalLinkParsing_1.getLinkSuffix)(link.text);
            let selection = link.selection;
            if (!selection) {
                selection = linkSuffix?.row === undefined ? undefined : {
                    startLineNumber: linkSuffix.row ?? 1,
                    startColumn: linkSuffix.col ?? 1,
                    endLineNumber: linkSuffix.rowEnd,
                    endColumn: linkSuffix.colEnd
                };
            }
            await this._editorService.openEditor({
                resource: link.uri,
                options: { pinned: true, selection, revealIfOpened: true }
            });
        }
    };
    exports.TerminalLocalFileLinkOpener = TerminalLocalFileLinkOpener;
    exports.TerminalLocalFileLinkOpener = TerminalLocalFileLinkOpener = __decorate([
        __param(0, editorService_1.IEditorService)
    ], TerminalLocalFileLinkOpener);
    let TerminalLocalFolderInWorkspaceLinkOpener = class TerminalLocalFolderInWorkspaceLinkOpener {
        constructor(_commandService) {
            this._commandService = _commandService;
        }
        async open(link) {
            if (!link.uri) {
                throw new Error('Tried to open folder in workspace link without a resolved URI');
            }
            await this._commandService.executeCommand('revealInExplorer', link.uri);
        }
    };
    exports.TerminalLocalFolderInWorkspaceLinkOpener = TerminalLocalFolderInWorkspaceLinkOpener;
    exports.TerminalLocalFolderInWorkspaceLinkOpener = TerminalLocalFolderInWorkspaceLinkOpener = __decorate([
        __param(0, commands_1.ICommandService)
    ], TerminalLocalFolderInWorkspaceLinkOpener);
    let TerminalLocalFolderOutsideWorkspaceLinkOpener = class TerminalLocalFolderOutsideWorkspaceLinkOpener {
        constructor(_hostService) {
            this._hostService = _hostService;
        }
        async open(link) {
            if (!link.uri) {
                throw new Error('Tried to open folder in workspace link without a resolved URI');
            }
            this._hostService.openWindow([{ folderUri: link.uri }], { forceNewWindow: true });
        }
    };
    exports.TerminalLocalFolderOutsideWorkspaceLinkOpener = TerminalLocalFolderOutsideWorkspaceLinkOpener;
    exports.TerminalLocalFolderOutsideWorkspaceLinkOpener = TerminalLocalFolderOutsideWorkspaceLinkOpener = __decorate([
        __param(0, host_1.IHostService)
    ], TerminalLocalFolderOutsideWorkspaceLinkOpener);
    let TerminalSearchLinkOpener = class TerminalSearchLinkOpener {
        constructor(_capabilities, _initialCwd, _localFileOpener, _localFolderInWorkspaceOpener, _getOS, _fileService, _instantiationService, _logService, _quickInputService, _searchService, _workspaceContextService, _workbenchEnvironmentService) {
            this._capabilities = _capabilities;
            this._initialCwd = _initialCwd;
            this._localFileOpener = _localFileOpener;
            this._localFolderInWorkspaceOpener = _localFolderInWorkspaceOpener;
            this._getOS = _getOS;
            this._fileService = _fileService;
            this._instantiationService = _instantiationService;
            this._logService = _logService;
            this._quickInputService = _quickInputService;
            this._searchService = _searchService;
            this._workspaceContextService = _workspaceContextService;
            this._workbenchEnvironmentService = _workbenchEnvironmentService;
            this._fileQueryBuilder = this._instantiationService.createInstance(queryBuilder_1.QueryBuilder);
        }
        async open(link) {
            const osPath = (0, terminalLinkHelpers_1.osPathModule)(this._getOS());
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
            this._workspaceContextService.getWorkspace().folders.forEach((folder) => {
                if (text.substring(0, folder.name.length + 1) === folder.name + pathSeparator) {
                    text = text.substring(folder.name.length + 1);
                    return;
                }
            });
            let cwdResolvedText = text;
            if (this._capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
                cwdResolvedText = (0, terminalLinkHelpers_1.updateLinkWithRelativeCwd)(this._capabilities, link.bufferRange.start.y, text, osPath, this._logService)?.[0] || text;
            }
            // Try open the cwd resolved link first
            if (await this._tryOpenExactLink(cwdResolvedText, link)) {
                return;
            }
            // If the cwd resolved text didn't match, try find the link without the cwd resolved, for
            // example when a command prints paths in a sub-directory of the current cwd
            if (text !== cwdResolvedText) {
                if (await this._tryOpenExactLink(text, link)) {
                    return;
                }
            }
            // Fallback to searching quick access
            return this._quickInputService.quickAccess.show(text);
        }
        async _getExactMatch(sanitizedLink) {
            // Make the link relative to the cwd if it isn't absolute
            const os = this._getOS();
            const pathModule = (0, terminalLinkHelpers_1.osPathModule)(os);
            const isAbsolute = pathModule.isAbsolute(sanitizedLink);
            let absolutePath = isAbsolute ? sanitizedLink : undefined;
            if (!isAbsolute && this._initialCwd.length > 0) {
                absolutePath = pathModule.join(this._initialCwd, sanitizedLink);
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
                if (this._workbenchEnvironmentService.remoteAuthority) {
                    uri = uri_1.URI.from({
                        scheme: network_1.Schemas.vscodeRemote,
                        authority: this._workbenchEnvironmentService.remoteAuthority,
                        path: normalizedAbsolutePath
                    });
                }
                else {
                    uri = uri_1.URI.file(normalizedAbsolutePath);
                }
                try {
                    const fileStat = await this._fileService.stat(uri);
                    resourceMatch = { uri, isDirectory: fileStat.isDirectory };
                }
                catch {
                    // File or dir doesn't exist, continue on
                }
            }
            // Search the workspace if an exact match based on the absolute path was not found
            if (!resourceMatch) {
                const results = await this._searchService.fileSearch(this._fileQueryBuilder.file(this._workspaceContextService.getWorkspace().folders, {
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
                        const results = await this._searchService.fileSearch(this._fileQueryBuilder.file(this._workspaceContextService.getWorkspace().folders, {
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
        async _tryOpenExactLink(text, link) {
            const sanitizedLink = text.replace(/:\d+(:\d+)?$/, '');
            try {
                const result = await this._getExactMatch(sanitizedLink);
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
                        await (isDirectory ? this._localFolderInWorkspaceOpener.open(linkToOpen) : this._localFileOpener.open(linkToOpen));
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
    exports.TerminalSearchLinkOpener = TerminalSearchLinkOpener;
    exports.TerminalSearchLinkOpener = TerminalSearchLinkOpener = __decorate([
        __param(5, files_1.IFileService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, terminal_1.ITerminalLogService),
        __param(8, quickInput_1.IQuickInputService),
        __param(9, search_1.ISearchService),
        __param(10, workspace_1.IWorkspaceContextService),
        __param(11, environmentService_1.IWorkbenchEnvironmentService)
    ], TerminalSearchLinkOpener);
    let TerminalUrlLinkOpener = class TerminalUrlLinkOpener {
        constructor(_isRemote, _openerService, _configurationService) {
            this._isRemote = _isRemote;
            this._openerService = _openerService;
            this._configurationService = _configurationService;
        }
        async open(link) {
            if (!link.uri) {
                throw new Error('Tried to open a url without a resolved URI');
            }
            // It's important to use the raw string value here to avoid converting pre-encoded values
            // from the URL like `%2B` -> `+`.
            this._openerService.open(link.text, {
                allowTunneling: this._isRemote && this._configurationService.getValue('remote.forwardOnOpen'),
                allowContributedOpeners: true,
                openExternal: true
            });
        }
    };
    exports.TerminalUrlLinkOpener = TerminalUrlLinkOpener;
    exports.TerminalUrlLinkOpener = TerminalUrlLinkOpener = __decorate([
        __param(1, opener_1.IOpenerService),
        __param(2, configuration_1.IConfigurationService)
    ], TerminalUrlLinkOpener);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rT3BlbmVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi9saW5rcy9icm93c2VyL3Rlcm1pbmFsTGlua09wZW5lcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0J6RixJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUEyQjtRQUN2QyxZQUNrQyxjQUE4QjtZQUE5QixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFFaEUsQ0FBQztRQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBeUI7WUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO2FBQ2xFO1lBQ0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUEsbUNBQWEsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkYsSUFBSSxTQUFTLEdBQXFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDakUsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDZixTQUFTLEdBQUcsVUFBVSxFQUFFLEdBQUcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZELGVBQWUsRUFBRSxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUM7b0JBQ3BDLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUM7b0JBQ2hDLGFBQWEsRUFBRSxVQUFVLENBQUMsTUFBTTtvQkFDaEMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxNQUFNO2lCQUM1QixDQUFDO2FBQ0Y7WUFDRCxNQUFNLElBQUksQ0FBQyxj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