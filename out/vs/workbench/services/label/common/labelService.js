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
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/event", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/services/environment/common/environmentService", "vs/platform/workspace/common/workspace", "vs/base/common/resources", "vs/base/common/labels", "vs/platform/label/common/label", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/base/common/glob", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/instantiation/common/extensions", "vs/workbench/services/path/common/pathService", "vs/workbench/services/extensions/common/extensions", "vs/base/common/platform", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/network", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/base/common/arrays"], function (require, exports, nls_1, uri_1, lifecycle_1, path_1, event_1, contributions_1, platform_1, environmentService_1, workspace_1, resources_1, labels_1, label_1, extensionsRegistry_1, glob_1, lifecycle_2, extensions_1, pathService_1, extensions_2, platform_2, remoteAgentService_1, network_1, storage_1, memento_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LabelService = void 0;
    const resourceLabelFormattersExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'resourceLabelFormatters',
        jsonSchema: {
            description: (0, nls_1.localize)('vscode.extension.contributes.resourceLabelFormatters', 'Contributes resource label formatting rules.'),
            type: 'array',
            items: {
                type: 'object',
                required: ['scheme', 'formatting'],
                properties: {
                    scheme: {
                        type: 'string',
                        description: (0, nls_1.localize)('vscode.extension.contributes.resourceLabelFormatters.scheme', 'URI scheme on which to match the formatter on. For example "file". Simple glob patterns are supported.'),
                    },
                    authority: {
                        type: 'string',
                        description: (0, nls_1.localize)('vscode.extension.contributes.resourceLabelFormatters.authority', 'URI authority on which to match the formatter on. Simple glob patterns are supported.'),
                    },
                    formatting: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.resourceLabelFormatters.formatting', "Rules for formatting uri resource labels."),
                        type: 'object',
                        properties: {
                            label: {
                                type: 'string',
                                description: (0, nls_1.localize)('vscode.extension.contributes.resourceLabelFormatters.label', "Label rules to display. For example: myLabel:/${path}. ${path}, ${scheme}, ${authority} and ${authoritySuffix} are supported as variables.")
                            },
                            separator: {
                                type: 'string',
                                description: (0, nls_1.localize)('vscode.extension.contributes.resourceLabelFormatters.separator', "Separator to be used in the uri label display. '/' or '\' as an example.")
                            },
                            stripPathStartingSeparator: {
                                type: 'boolean',
                                description: (0, nls_1.localize)('vscode.extension.contributes.resourceLabelFormatters.stripPathStartingSeparator', "Controls whether `${path}` substitutions should have starting separator characters stripped.")
                            },
                            tildify: {
                                type: 'boolean',
                                description: (0, nls_1.localize)('vscode.extension.contributes.resourceLabelFormatters.tildify', "Controls if the start of the uri label should be tildified when possible.")
                            },
                            workspaceSuffix: {
                                type: 'string',
                                description: (0, nls_1.localize)('vscode.extension.contributes.resourceLabelFormatters.formatting.workspaceSuffix', "Suffix appended to the workspace label.")
                            }
                        }
                    }
                }
            }
        }
    });
    const sepRegexp = /\//g;
    const labelMatchingRegexp = /\$\{(scheme|authoritySuffix|authority|path|(query)\.(.+?))\}/g;
    function hasDriveLetterIgnorePlatform(path) {
        return !!(path && path[2] === ':');
    }
    let ResourceLabelFormattersHandler = class ResourceLabelFormattersHandler {
        constructor(labelService) {
            this.formattersDisposables = new Map();
            resourceLabelFormattersExtPoint.setHandler((extensions, delta) => {
                for (const added of delta.added) {
                    for (const untrustedFormatter of added.value) {
                        // We cannot trust that the formatter as it comes from an extension
                        // adheres to our interface, so for the required properties we fill
                        // in some defaults if missing.
                        const formatter = { ...untrustedFormatter };
                        if (typeof formatter.formatting.label !== 'string') {
                            formatter.formatting.label = '${authority}${path}';
                        }
                        if (typeof formatter.formatting.separator !== `string`) {
                            formatter.formatting.separator = path_1.sep;
                        }
                        if (!(0, extensions_2.isProposedApiEnabled)(added.description, 'contribLabelFormatterWorkspaceTooltip') && formatter.formatting.workspaceTooltip) {
                            formatter.formatting.workspaceTooltip = undefined; // workspaceTooltip is only proposed
                        }
                        this.formattersDisposables.set(formatter, labelService.registerFormatter(formatter));
                    }
                }
                for (const removed of delta.removed) {
                    for (const formatter of removed.value) {
                        (0, lifecycle_1.dispose)(this.formattersDisposables.get(formatter));
                    }
                }
            });
        }
    };
    ResourceLabelFormattersHandler = __decorate([
        __param(0, label_1.ILabelService)
    ], ResourceLabelFormattersHandler);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ResourceLabelFormattersHandler, 3 /* LifecyclePhase.Restored */);
    const FORMATTER_CACHE_SIZE = 50;
    let LabelService = class LabelService extends lifecycle_1.Disposable {
        constructor(environmentService, contextService, pathService, remoteAgentService, storageService, lifecycleService) {
            super();
            this.environmentService = environmentService;
            this.contextService = contextService;
            this.pathService = pathService;
            this.remoteAgentService = remoteAgentService;
            this._onDidChangeFormatters = this._register(new event_1.Emitter({ leakWarningThreshold: 400 }));
            this.onDidChangeFormatters = this._onDidChangeFormatters.event;
            // Find some meaningful defaults until the remote environment
            // is resolved, by taking the current OS we are running in
            // and by taking the local `userHome` if we run on a local
            // file scheme.
            this.os = platform_2.OS;
            this.userHome = pathService.defaultUriScheme === network_1.Schemas.file ? this.pathService.userHome({ preferLocal: true }) : undefined;
            const memento = this.storedFormattersMemento = new memento_1.Memento('cachedResourceLabelFormatters2', storageService);
            this.storedFormatters = memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            this.formatters = this.storedFormatters?.formatters?.slice() || [];
            // Remote environment is potentially long running
            this.resolveRemoteEnvironment();
        }
        async resolveRemoteEnvironment() {
            // OS
            const env = await this.remoteAgentService.getEnvironment();
            this.os = env?.os ?? platform_2.OS;
            // User home
            this.userHome = await this.pathService.userHome();
        }
        findFormatting(resource) {
            let bestResult;
            for (const formatter of this.formatters) {
                if (formatter.scheme === resource.scheme) {
                    if (!formatter.authority && (!bestResult || formatter.priority)) {
                        bestResult = formatter;
                        continue;
                    }
                    if (!formatter.authority) {
                        continue;
                    }
                    if ((0, glob_1.match)(formatter.authority.toLowerCase(), resource.authority.toLowerCase()) &&
                        (!bestResult ||
                            !bestResult.authority ||
                            formatter.authority.length > bestResult.authority.length ||
                            ((formatter.authority.length === bestResult.authority.length) && formatter.priority))) {
                        bestResult = formatter;
                    }
                }
            }
            return bestResult ? bestResult.formatting : undefined;
        }
        getUriLabel(resource, options = {}) {
            let formatting = this.findFormatting(resource);
            if (formatting && options.separator) {
                // mixin separator if defined from the outside
                formatting = { ...formatting, separator: options.separator };
            }
            const label = this.doGetUriLabel(resource, formatting, options);
            // Without formatting we still need to support the separator
            // as provided in options (https://github.com/microsoft/vscode/issues/130019)
            if (!formatting && options.separator) {
                return label.replace(sepRegexp, options.separator);
            }
            return label;
        }
        doGetUriLabel(resource, formatting, options = {}) {
            if (!formatting) {
                return (0, labels_1.getPathLabel)(resource, {
                    os: this.os,
                    tildify: this.userHome ? { userHome: this.userHome } : undefined,
                    relative: options.relative ? {
                        noPrefix: options.noPrefix,
                        getWorkspace: () => this.contextService.getWorkspace(),
                        getWorkspaceFolder: resource => this.contextService.getWorkspaceFolder(resource)
                    } : undefined
                });
            }
            // Relative label
            if (options.relative && this.contextService) {
                let folder = this.contextService.getWorkspaceFolder(resource);
                if (!folder) {
                    // It is possible that the resource we want to resolve the
                    // workspace folder for is not using the same scheme as
                    // the folders in the workspace, so we help by trying again
                    // to resolve a workspace folder by trying again with a
                    // scheme that is workspace contained.
                    const workspace = this.contextService.getWorkspace();
                    const firstFolder = (0, arrays_1.firstOrDefault)(workspace.folders);
                    if (firstFolder && resource.scheme !== firstFolder.uri.scheme && resource.path.startsWith(path_1.posix.sep)) {
                        folder = this.contextService.getWorkspaceFolder(firstFolder.uri.with({ path: resource.path }));
                    }
                }
                if (folder) {
                    const folderLabel = this.formatUri(folder.uri, formatting, options.noPrefix);
                    let relativeLabel = this.formatUri(resource, formatting, options.noPrefix);
                    let overlap = 0;
                    while (relativeLabel[overlap] && relativeLabel[overlap] === folderLabel[overlap]) {
                        overlap++;
                    }
                    if (!relativeLabel[overlap] || relativeLabel[overlap] === formatting.separator) {
                        relativeLabel = relativeLabel.substring(1 + overlap);
                    }
                    else if (overlap === folderLabel.length && folder.uri.path === path_1.posix.sep) {
                        relativeLabel = relativeLabel.substring(overlap);
                    }
                    // always show root basename if there are multiple folders
                    const hasMultipleRoots = this.contextService.getWorkspace().folders.length > 1;
                    if (hasMultipleRoots && !options.noPrefix) {
                        const rootName = folder?.name ?? (0, resources_1.basenameOrAuthority)(folder.uri);
                        relativeLabel = relativeLabel ? `${rootName} • ${relativeLabel}` : rootName;
                    }
                    return relativeLabel;
                }
            }
            // Absolute label
            return this.formatUri(resource, formatting, options.noPrefix);
        }
        getUriBasenameLabel(resource) {
            const formatting = this.findFormatting(resource);
            const label = this.doGetUriLabel(resource, formatting);
            let pathLib;
            if (formatting?.separator === path_1.win32.sep) {
                pathLib = path_1.win32;
            }
            else if (formatting?.separator === path_1.posix.sep) {
                pathLib = path_1.posix;
            }
            else {
                pathLib = (this.os === 1 /* OperatingSystem.Windows */) ? path_1.win32 : path_1.posix;
            }
            return pathLib.basename(label);
        }
        getWorkspaceLabel(workspace, options) {
            if ((0, workspace_1.isWorkspace)(workspace)) {
                const identifier = (0, workspace_1.toWorkspaceIdentifier)(workspace);
                if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(identifier) || (0, workspace_1.isWorkspaceIdentifier)(identifier)) {
                    return this.getWorkspaceLabel(identifier, options);
                }
                return '';
            }
            // Workspace: Single Folder (as URI)
            if (uri_1.URI.isUri(workspace)) {
                return this.doGetSingleFolderWorkspaceLabel(workspace, options);
            }
            // Workspace: Single Folder (as workspace identifier)
            if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspace)) {
                return this.doGetSingleFolderWorkspaceLabel(workspace.uri, options);
            }
            // Workspace: Multi Root
            if ((0, workspace_1.isWorkspaceIdentifier)(workspace)) {
                return this.doGetWorkspaceLabel(workspace.configPath, options);
            }
            return '';
        }
        doGetWorkspaceLabel(workspaceUri, options) {
            // Workspace: Untitled
            if ((0, workspace_1.isUntitledWorkspace)(workspaceUri, this.environmentService)) {
                return (0, nls_1.localize)('untitledWorkspace', "Untitled (Workspace)");
            }
            // Workspace: Temporary
            if ((0, workspace_1.isTemporaryWorkspace)(workspaceUri)) {
                return (0, nls_1.localize)('temporaryWorkspace', "Workspace");
            }
            // Workspace: Saved
            let filename = (0, resources_1.basename)(workspaceUri);
            if (filename.endsWith(workspace_1.WORKSPACE_EXTENSION)) {
                filename = filename.substr(0, filename.length - workspace_1.WORKSPACE_EXTENSION.length - 1);
            }
            let label;
            switch (options?.verbose) {
                case 0 /* Verbosity.SHORT */:
                    label = filename; // skip suffix for short label
                    break;
                case 2 /* Verbosity.LONG */:
                    label = (0, nls_1.localize)('workspaceNameVerbose', "{0} (Workspace)", this.getUriLabel((0, resources_1.joinPath)((0, resources_1.dirname)(workspaceUri), filename)));
                    break;
                case 1 /* Verbosity.MEDIUM */:
                default:
                    label = (0, nls_1.localize)('workspaceName', "{0} (Workspace)", filename);
                    break;
            }
            if (options?.verbose === 0 /* Verbosity.SHORT */) {
                return label; // skip suffix for short label
            }
            return this.appendWorkspaceSuffix(label, workspaceUri);
        }
        doGetSingleFolderWorkspaceLabel(folderUri, options) {
            let label;
            switch (options?.verbose) {
                case 2 /* Verbosity.LONG */:
                    label = this.getUriLabel(folderUri);
                    break;
                case 0 /* Verbosity.SHORT */:
                case 1 /* Verbosity.MEDIUM */:
                default:
                    label = (0, resources_1.basename)(folderUri) || path_1.posix.sep;
                    break;
            }
            if (options?.verbose === 0 /* Verbosity.SHORT */) {
                return label; // skip suffix for short label
            }
            return this.appendWorkspaceSuffix(label, folderUri);
        }
        getSeparator(scheme, authority) {
            const formatter = this.findFormatting(uri_1.URI.from({ scheme, authority }));
            return formatter?.separator || path_1.posix.sep;
        }
        getHostLabel(scheme, authority) {
            const formatter = this.findFormatting(uri_1.URI.from({ scheme, authority }));
            return formatter?.workspaceSuffix || authority || '';
        }
        getHostTooltip(scheme, authority) {
            const formatter = this.findFormatting(uri_1.URI.from({ scheme, authority }));
            return formatter?.workspaceTooltip;
        }
        registerCachedFormatter(formatter) {
            const list = this.storedFormatters.formatters ??= [];
            let replace = list.findIndex(f => f.scheme === formatter.scheme && f.authority === formatter.authority);
            if (replace === -1 && list.length >= FORMATTER_CACHE_SIZE) {
                replace = FORMATTER_CACHE_SIZE - 1; // at max capacity, replace the last element
            }
            if (replace === -1) {
                list.unshift(formatter);
            }
            else {
                for (let i = replace; i > 0; i--) {
                    list[i] = list[i - 1];
                }
                list[0] = formatter;
            }
            this.storedFormattersMemento.saveMemento();
            return this.registerFormatter(formatter);
        }
        registerFormatter(formatter) {
            this.formatters.push(formatter);
            this._onDidChangeFormatters.fire({ scheme: formatter.scheme });
            return {
                dispose: () => {
                    this.formatters = this.formatters.filter(f => f !== formatter);
                    this._onDidChangeFormatters.fire({ scheme: formatter.scheme });
                }
            };
        }
        formatUri(resource, formatting, forceNoTildify) {
            let label = formatting.label.replace(labelMatchingRegexp, (match, token, qsToken, qsValue) => {
                switch (token) {
                    case 'scheme': return resource.scheme;
                    case 'authority': return resource.authority;
                    case 'authoritySuffix': {
                        const i = resource.authority.indexOf('+');
                        return i === -1 ? resource.authority : resource.authority.slice(i + 1);
                    }
                    case 'path':
                        return formatting.stripPathStartingSeparator
                            ? resource.path.slice(resource.path[0] === formatting.separator ? 1 : 0)
                            : resource.path;
                    default: {
                        if (qsToken === 'query') {
                            const { query } = resource;
                            if (query && query[0] === '{' && query[query.length - 1] === '}') {
                                try {
                                    return JSON.parse(query)[qsValue] || '';
                                }
                                catch { }
                            }
                        }
                        return '';
                    }
                }
            });
            // convert \c:\something => C:\something
            if (formatting.normalizeDriveLetter && hasDriveLetterIgnorePlatform(label)) {
                label = label.charAt(1).toUpperCase() + label.substr(2);
            }
            if (formatting.tildify && !forceNoTildify) {
                if (this.userHome) {
                    label = (0, labels_1.tildify)(label, this.userHome.fsPath, this.os);
                }
            }
            if (formatting.authorityPrefix && resource.authority) {
                label = formatting.authorityPrefix + label;
            }
            return label.replace(sepRegexp, formatting.separator);
        }
        appendWorkspaceSuffix(label, uri) {
            const formatting = this.findFormatting(uri);
            const suffix = formatting && (typeof formatting.workspaceSuffix === 'string') ? formatting.workspaceSuffix : undefined;
            return suffix ? `${label} [${suffix}]` : label;
        }
    };
    exports.LabelService = LabelService;
    exports.LabelService = LabelService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, pathService_1.IPathService),
        __param(3, remoteAgentService_1.IRemoteAgentService),
        __param(4, storage_1.IStorageService),
        __param(5, lifecycle_2.ILifecycleService)
    ], LabelService);
    (0, extensions_1.registerSingleton)(label_1.ILabelService, LabelService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2xhYmVsL2NvbW1vbi9sYWJlbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMkJoRyxNQUFNLCtCQUErQixHQUFHLHVDQUFrQixDQUFDLHNCQUFzQixDQUEyQjtRQUMzRyxjQUFjLEVBQUUseUJBQXlCO1FBQ3pDLFVBQVUsRUFBRTtZQUNYLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxzREFBc0QsRUFBRSw4Q0FBOEMsQ0FBQztZQUM3SCxJQUFJLEVBQUUsT0FBTztZQUNiLEtBQUssRUFBRTtnQkFDTixJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDO2dCQUNsQyxVQUFVLEVBQUU7b0JBQ1gsTUFBTSxFQUFFO3dCQUNQLElBQUksRUFBRSxRQUFRO3dCQUNkLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyw2REFBNkQsRUFBRSx3R0FBd0csQ0FBQztxQkFDOUw7b0JBQ0QsU0FBUyxFQUFFO3dCQUNWLElBQUksRUFBRSxRQUFRO3dCQUNkLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxnRUFBZ0UsRUFBRSx1RkFBdUYsQ0FBQztxQkFDaEw7b0JBQ0QsVUFBVSxFQUFFO3dCQUNYLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxpRUFBaUUsRUFBRSwyQ0FBMkMsQ0FBQzt3QkFDckksSUFBSSxFQUFFLFFBQVE7d0JBQ2QsVUFBVSxFQUFFOzRCQUNYLEtBQUssRUFBRTtnQ0FDTixJQUFJLEVBQUUsUUFBUTtnQ0FDZCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsNERBQTRELEVBQUUsNElBQTRJLENBQUM7NkJBQ2pPOzRCQUNELFNBQVMsRUFBRTtnQ0FDVixJQUFJLEVBQUUsUUFBUTtnQ0FDZCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0VBQWdFLEVBQUUsMEVBQTBFLENBQUM7NkJBQ25LOzRCQUNELDBCQUEwQixFQUFFO2dDQUMzQixJQUFJLEVBQUUsU0FBUztnQ0FDZixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUZBQWlGLEVBQUUsOEZBQThGLENBQUM7NkJBQ3hNOzRCQUNELE9BQU8sRUFBRTtnQ0FDUixJQUFJLEVBQUUsU0FBUztnQ0FDZixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsOERBQThELEVBQUUsMkVBQTJFLENBQUM7NkJBQ2xLOzRCQUNELGVBQWUsRUFBRTtnQ0FDaEIsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLGlGQUFpRixFQUFFLHlDQUF5QyxDQUFDOzZCQUNuSjt5QkFDRDtxQkFDRDtpQkFDRDthQUNEO1NBQ0Q7S0FDRCxDQUFDLENBQUM7SUFFSCxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDeEIsTUFBTSxtQkFBbUIsR0FBRywrREFBK0QsQ0FBQztJQUU1RixTQUFTLDRCQUE0QixDQUFDLElBQVk7UUFDakQsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxJQUFNLDhCQUE4QixHQUFwQyxNQUFNLDhCQUE4QjtRQUluQyxZQUEyQixZQUEyQjtZQUZyQywwQkFBcUIsR0FBRyxJQUFJLEdBQUcsRUFBdUMsQ0FBQztZQUd2RiwrQkFBK0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQ2hFLEtBQUssTUFBTSxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRTtvQkFDaEMsS0FBSyxNQUFNLGtCQUFrQixJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7d0JBRTdDLG1FQUFtRTt3QkFDbkUsbUVBQW1FO3dCQUNuRSwrQkFBK0I7d0JBRS9CLE1BQU0sU0FBUyxHQUFHLEVBQUUsR0FBRyxrQkFBa0IsRUFBRSxDQUFDO3dCQUM1QyxJQUFJLE9BQU8sU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFOzRCQUNuRCxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxxQkFBcUIsQ0FBQzt5QkFDbkQ7d0JBQ0QsSUFBSSxPQUFPLFNBQVMsQ0FBQyxVQUFVLENBQUMsU0FBUyxLQUFLLFFBQVEsRUFBRTs0QkFDdkQsU0FBUyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsVUFBRyxDQUFDO3lCQUNyQzt3QkFFRCxJQUFJLENBQUMsSUFBQSxpQ0FBb0IsRUFBQyxLQUFLLENBQUMsV0FBVyxFQUFFLHVDQUF1QyxDQUFDLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRTs0QkFDL0gsU0FBUyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsQ0FBQyxvQ0FBb0M7eUJBQ3ZGO3dCQUVELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO3FCQUNyRjtpQkFDRDtnQkFFRCxLQUFLLE1BQU0sT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7b0JBQ3BDLEtBQUssTUFBTSxTQUFTLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTt3QkFDdEMsSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztxQkFDbkQ7aUJBQ0Q7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFBO0lBcENLLDhCQUE4QjtRQUl0QixXQUFBLHFCQUFhLENBQUE7T0FKckIsOEJBQThCLENBb0NuQztJQUNELG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyw4QkFBOEIsa0NBQTBCLENBQUM7SUFFbkssTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7SUFPekIsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBYSxTQUFRLHNCQUFVO1FBYzNDLFlBQytCLGtCQUFpRSxFQUNyRSxjQUF5RCxFQUNyRSxXQUEwQyxFQUNuQyxrQkFBd0QsRUFDNUQsY0FBK0IsRUFDN0IsZ0JBQW1DO1lBRXRELEtBQUssRUFBRSxDQUFDO1lBUHVDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBOEI7WUFDcEQsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQ3BELGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2xCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFaN0QsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sQ0FBd0IsRUFBRSxvQkFBb0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkgsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQWlCbEUsNkRBQTZEO1lBQzdELDBEQUEwRDtZQUMxRCwwREFBMEQ7WUFDMUQsZUFBZTtZQUNmLElBQUksQ0FBQyxFQUFFLEdBQUcsYUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLEtBQUssaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUU3SCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxpQkFBTyxDQUFDLGdDQUFnQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzdHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsVUFBVSw2REFBNkMsQ0FBQztZQUN4RixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDO1lBRW5FLGlEQUFpRDtZQUNqRCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBRU8sS0FBSyxDQUFDLHdCQUF3QjtZQUVyQyxLQUFLO1lBQ0wsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDM0QsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxJQUFJLGFBQUUsQ0FBQztZQUV4QixZQUFZO1lBQ1osSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkQsQ0FBQztRQUVELGNBQWMsQ0FBQyxRQUFhO1lBQzNCLElBQUksVUFBOEMsQ0FBQztZQUVuRCxLQUFLLE1BQU0sU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3hDLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUMsTUFBTSxFQUFFO29CQUN6QyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsVUFBVSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDaEUsVUFBVSxHQUFHLFNBQVMsQ0FBQzt3QkFDdkIsU0FBUztxQkFDVDtvQkFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTt3QkFDekIsU0FBUztxQkFDVDtvQkFFRCxJQUNDLElBQUEsWUFBSyxFQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDMUUsQ0FDQyxDQUFDLFVBQVU7NEJBQ1gsQ0FBQyxVQUFVLENBQUMsU0FBUzs0QkFDckIsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNOzRCQUN4RCxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQ3BGLEVBQ0E7d0JBQ0QsVUFBVSxHQUFHLFNBQVMsQ0FBQztxQkFDdkI7aUJBQ0Q7YUFDRDtZQUVELE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDdkQsQ0FBQztRQUVELFdBQVcsQ0FBQyxRQUFhLEVBQUUsVUFBOEUsRUFBRTtZQUMxRyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLElBQUksVUFBVSxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7Z0JBQ3BDLDhDQUE4QztnQkFDOUMsVUFBVSxHQUFHLEVBQUUsR0FBRyxVQUFVLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUM3RDtZQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVoRSw0REFBNEQ7WUFDNUQsNkVBQTZFO1lBQzdFLElBQUksQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtnQkFDckMsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDbkQ7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTyxhQUFhLENBQUMsUUFBYSxFQUFFLFVBQW9DLEVBQUUsVUFBc0QsRUFBRTtZQUNsSSxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNoQixPQUFPLElBQUEscUJBQVksRUFBQyxRQUFRLEVBQUU7b0JBQzdCLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDWCxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTO29CQUNoRSxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQzVCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTt3QkFDMUIsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFO3dCQUN0RCxrQkFBa0IsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDO3FCQUNoRixDQUFDLENBQUMsQ0FBQyxTQUFTO2lCQUNiLENBQUMsQ0FBQzthQUNIO1lBRUQsaUJBQWlCO1lBQ2pCLElBQUksT0FBTyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUM1QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM5RCxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUVaLDBEQUEwRDtvQkFDMUQsdURBQXVEO29CQUN2RCwyREFBMkQ7b0JBQzNELHVEQUF1RDtvQkFDdkQsc0NBQXNDO29CQUV0QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUNyRCxNQUFNLFdBQVcsR0FBRyxJQUFBLHVCQUFjLEVBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN0RCxJQUFJLFdBQVcsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDckcsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztxQkFDL0Y7aUJBQ0Q7Z0JBRUQsSUFBSSxNQUFNLEVBQUU7b0JBQ1gsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBRTdFLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzNFLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztvQkFDaEIsT0FBTyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDakYsT0FBTyxFQUFFLENBQUM7cUJBQ1Y7b0JBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssVUFBVSxDQUFDLFNBQVMsRUFBRTt3QkFDL0UsYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO3FCQUNyRDt5QkFBTSxJQUFJLE9BQU8sS0FBSyxXQUFXLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLFlBQUssQ0FBQyxHQUFHLEVBQUU7d0JBQzNFLGFBQWEsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUNqRDtvQkFFRCwwREFBMEQ7b0JBQzFELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDL0UsSUFBSSxnQkFBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7d0JBQzFDLE1BQU0sUUFBUSxHQUFHLE1BQU0sRUFBRSxJQUFJLElBQUksSUFBQSwrQkFBbUIsRUFBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2pFLGFBQWEsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxNQUFNLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7cUJBQzVFO29CQUVELE9BQU8sYUFBYSxDQUFDO2lCQUNyQjthQUNEO1lBRUQsaUJBQWlCO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsbUJBQW1CLENBQUMsUUFBYTtZQUNoQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRXZELElBQUksT0FBb0MsQ0FBQztZQUN6QyxJQUFJLFVBQVUsRUFBRSxTQUFTLEtBQUssWUFBSyxDQUFDLEdBQUcsRUFBRTtnQkFDeEMsT0FBTyxHQUFHLFlBQUssQ0FBQzthQUNoQjtpQkFBTSxJQUFJLFVBQVUsRUFBRSxTQUFTLEtBQUssWUFBSyxDQUFDLEdBQUcsRUFBRTtnQkFDL0MsT0FBTyxHQUFHLFlBQUssQ0FBQzthQUNoQjtpQkFBTTtnQkFDTixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxvQ0FBNEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFLLENBQUMsQ0FBQyxDQUFDLFlBQUssQ0FBQzthQUNoRTtZQUVELE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRUQsaUJBQWlCLENBQUMsU0FBcUYsRUFBRSxPQUFnQztZQUN4SSxJQUFJLElBQUEsdUJBQVcsRUFBQyxTQUFTLENBQUMsRUFBRTtnQkFDM0IsTUFBTSxVQUFVLEdBQUcsSUFBQSxpQ0FBcUIsRUFBQyxTQUFTLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxJQUFBLDZDQUFpQyxFQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUEsaUNBQXFCLEVBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3ZGLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztpQkFDbkQ7Z0JBRUQsT0FBTyxFQUFFLENBQUM7YUFDVjtZQUVELG9DQUFvQztZQUNwQyxJQUFJLFNBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3pCLE9BQU8sSUFBSSxDQUFDLCtCQUErQixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNoRTtZQUVELHFEQUFxRDtZQUNyRCxJQUFJLElBQUEsNkNBQWlDLEVBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ2pELE9BQU8sSUFBSSxDQUFDLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDcEU7WUFFRCx3QkFBd0I7WUFDeEIsSUFBSSxJQUFBLGlDQUFxQixFQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNyQyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQy9EO1lBRUQsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRU8sbUJBQW1CLENBQUMsWUFBaUIsRUFBRSxPQUFnQztZQUU5RSxzQkFBc0I7WUFDdEIsSUFBSSxJQUFBLCtCQUFtQixFQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRTtnQkFDL0QsT0FBTyxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO2FBQzdEO1lBRUQsdUJBQXVCO1lBQ3ZCLElBQUksSUFBQSxnQ0FBb0IsRUFBQyxZQUFZLENBQUMsRUFBRTtnQkFDdkMsT0FBTyxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSxXQUFXLENBQUMsQ0FBQzthQUNuRDtZQUVELG1CQUFtQjtZQUNuQixJQUFJLFFBQVEsR0FBRyxJQUFBLG9CQUFRLEVBQUMsWUFBWSxDQUFDLENBQUM7WUFDdEMsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLCtCQUFtQixDQUFDLEVBQUU7Z0JBQzNDLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLCtCQUFtQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzthQUNoRjtZQUVELElBQUksS0FBYSxDQUFDO1lBQ2xCLFFBQVEsT0FBTyxFQUFFLE9BQU8sRUFBRTtnQkFDekI7b0JBQ0MsS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDLDhCQUE4QjtvQkFDaEQsTUFBTTtnQkFDUDtvQkFDQyxLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsc0JBQXNCLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFBLG9CQUFRLEVBQUMsSUFBQSxtQkFBTyxFQUFDLFlBQVksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekgsTUFBTTtnQkFDUCw4QkFBc0I7Z0JBQ3RCO29CQUNDLEtBQUssR0FBRyxJQUFBLGNBQVEsRUFBQyxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQy9ELE1BQU07YUFDUDtZQUVELElBQUksT0FBTyxFQUFFLE9BQU8sNEJBQW9CLEVBQUU7Z0JBQ3pDLE9BQU8sS0FBSyxDQUFDLENBQUMsOEJBQThCO2FBQzVDO1lBRUQsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFTywrQkFBK0IsQ0FBQyxTQUFjLEVBQUUsT0FBZ0M7WUFDdkYsSUFBSSxLQUFhLENBQUM7WUFDbEIsUUFBUSxPQUFPLEVBQUUsT0FBTyxFQUFFO2dCQUN6QjtvQkFDQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDcEMsTUFBTTtnQkFDUCw2QkFBcUI7Z0JBQ3JCLDhCQUFzQjtnQkFDdEI7b0JBQ0MsS0FBSyxHQUFHLElBQUEsb0JBQVEsRUFBQyxTQUFTLENBQUMsSUFBSSxZQUFLLENBQUMsR0FBRyxDQUFDO29CQUN6QyxNQUFNO2FBQ1A7WUFFRCxJQUFJLE9BQU8sRUFBRSxPQUFPLDRCQUFvQixFQUFFO2dCQUN6QyxPQUFPLEtBQUssQ0FBQyxDQUFDLDhCQUE4QjthQUM1QztZQUVELE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsWUFBWSxDQUFDLE1BQWMsRUFBRSxTQUFrQjtZQUM5QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXZFLE9BQU8sU0FBUyxFQUFFLFNBQVMsSUFBSSxZQUFLLENBQUMsR0FBRyxDQUFDO1FBQzFDLENBQUM7UUFFRCxZQUFZLENBQUMsTUFBYyxFQUFFLFNBQWtCO1lBQzlDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdkUsT0FBTyxTQUFTLEVBQUUsZUFBZSxJQUFJLFNBQVMsSUFBSSxFQUFFLENBQUM7UUFDdEQsQ0FBQztRQUVELGNBQWMsQ0FBQyxNQUFjLEVBQUUsU0FBa0I7WUFDaEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV2RSxPQUFPLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQztRQUNwQyxDQUFDO1FBRUQsdUJBQXVCLENBQUMsU0FBaUM7WUFDeEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsS0FBSyxFQUFFLENBQUM7WUFFckQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4RyxJQUFJLE9BQU8sS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLG9CQUFvQixFQUFFO2dCQUMxRCxPQUFPLEdBQUcsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUMsNENBQTRDO2FBQ2hGO1lBRUQsSUFBSSxPQUFPLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDeEI7aUJBQU07Z0JBQ04sS0FBSyxJQUFJLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDakMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ3RCO2dCQUNELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7YUFDcEI7WUFFRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFM0MsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVELGlCQUFpQixDQUFDLFNBQWlDO1lBQ2xELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFFL0QsT0FBTztnQkFDTixPQUFPLEVBQUUsR0FBRyxFQUFFO29CQUNiLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUM7b0JBQy9ELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBQ2hFLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVPLFNBQVMsQ0FBQyxRQUFhLEVBQUUsVUFBbUMsRUFBRSxjQUF3QjtZQUM3RixJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUM1RixRQUFRLEtBQUssRUFBRTtvQkFDZCxLQUFLLFFBQVEsQ0FBQyxDQUFDLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDdEMsS0FBSyxXQUFXLENBQUMsQ0FBQyxPQUFPLFFBQVEsQ0FBQyxTQUFTLENBQUM7b0JBQzVDLEtBQUssaUJBQWlCLENBQUMsQ0FBQzt3QkFDdkIsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQzFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQ3ZFO29CQUNELEtBQUssTUFBTTt3QkFDVixPQUFPLFVBQVUsQ0FBQywwQkFBMEI7NEJBQzNDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN4RSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztvQkFDbEIsT0FBTyxDQUFDLENBQUM7d0JBQ1IsSUFBSSxPQUFPLEtBQUssT0FBTyxFQUFFOzRCQUN4QixNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsUUFBUSxDQUFDOzRCQUMzQixJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtnQ0FDakUsSUFBSTtvQ0FDSCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2lDQUN4QztnQ0FBQyxNQUFNLEdBQUc7NkJBQ1g7eUJBQ0Q7d0JBRUQsT0FBTyxFQUFFLENBQUM7cUJBQ1Y7aUJBQ0Q7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILHdDQUF3QztZQUN4QyxJQUFJLFVBQVUsQ0FBQyxvQkFBb0IsSUFBSSw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDM0UsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN4RDtZQUVELElBQUksVUFBVSxDQUFDLE9BQU8sSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDMUMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNsQixLQUFLLEdBQUcsSUFBQSxnQkFBTyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3REO2FBQ0Q7WUFFRCxJQUFJLFVBQVUsQ0FBQyxlQUFlLElBQUksUUFBUSxDQUFDLFNBQVMsRUFBRTtnQkFDckQsS0FBSyxHQUFHLFVBQVUsQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO2FBQzNDO1lBRUQsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVPLHFCQUFxQixDQUFDLEtBQWEsRUFBRSxHQUFRO1lBQ3BELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUMsTUFBTSxNQUFNLEdBQUcsVUFBVSxJQUFJLENBQUMsT0FBTyxVQUFVLENBQUMsZUFBZSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFFdkgsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxLQUFLLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDaEQsQ0FBQztLQUNELENBQUE7SUE5V1ksb0NBQVk7MkJBQVosWUFBWTtRQWV0QixXQUFBLGlEQUE0QixDQUFBO1FBQzVCLFdBQUEsb0NBQXdCLENBQUE7UUFDeEIsV0FBQSwwQkFBWSxDQUFBO1FBQ1osV0FBQSx3Q0FBbUIsQ0FBQTtRQUNuQixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLDZCQUFpQixDQUFBO09BcEJQLFlBQVksQ0E4V3hCO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyxxQkFBYSxFQUFFLFlBQVksb0NBQTRCLENBQUMifQ==