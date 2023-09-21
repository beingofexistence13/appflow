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
define(["require", "exports", "vs/nls!vs/workbench/services/label/common/labelService", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/event", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/services/environment/common/environmentService", "vs/platform/workspace/common/workspace", "vs/base/common/resources", "vs/base/common/labels", "vs/platform/label/common/label", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/base/common/glob", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/instantiation/common/extensions", "vs/workbench/services/path/common/pathService", "vs/workbench/services/extensions/common/extensions", "vs/base/common/platform", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/network", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/base/common/arrays"], function (require, exports, nls_1, uri_1, lifecycle_1, path_1, event_1, contributions_1, platform_1, environmentService_1, workspace_1, resources_1, labels_1, label_1, extensionsRegistry_1, glob_1, lifecycle_2, extensions_1, pathService_1, extensions_2, platform_2, remoteAgentService_1, network_1, storage_1, memento_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Bzb = void 0;
    const resourceLabelFormattersExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'resourceLabelFormatters',
        jsonSchema: {
            description: (0, nls_1.localize)(0, null),
            type: 'array',
            items: {
                type: 'object',
                required: ['scheme', 'formatting'],
                properties: {
                    scheme: {
                        type: 'string',
                        description: (0, nls_1.localize)(1, null),
                    },
                    authority: {
                        type: 'string',
                        description: (0, nls_1.localize)(2, null),
                    },
                    formatting: {
                        description: (0, nls_1.localize)(3, null),
                        type: 'object',
                        properties: {
                            label: {
                                type: 'string',
                                description: (0, nls_1.localize)(4, null)
                            },
                            separator: {
                                type: 'string',
                                description: (0, nls_1.localize)(5, null)
                            },
                            stripPathStartingSeparator: {
                                type: 'boolean',
                                description: (0, nls_1.localize)(6, null)
                            },
                            tildify: {
                                type: 'boolean',
                                description: (0, nls_1.localize)(7, null)
                            },
                            workspaceSuffix: {
                                type: 'string',
                                description: (0, nls_1.localize)(8, null)
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
            this.a = new Map();
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
                        if (!(0, extensions_2.$PF)(added.description, 'contribLabelFormatterWorkspaceTooltip') && formatter.formatting.workspaceTooltip) {
                            formatter.formatting.workspaceTooltip = undefined; // workspaceTooltip is only proposed
                        }
                        this.a.set(formatter, labelService.registerFormatter(formatter));
                    }
                }
                for (const removed of delta.removed) {
                    for (const formatter of removed.value) {
                        (0, lifecycle_1.$fc)(this.a.get(formatter));
                    }
                }
            });
        }
    };
    ResourceLabelFormattersHandler = __decorate([
        __param(0, label_1.$Vz)
    ], ResourceLabelFormattersHandler);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ResourceLabelFormattersHandler, 3 /* LifecyclePhase.Restored */);
    const FORMATTER_CACHE_SIZE = 50;
    let $Bzb = class $Bzb extends lifecycle_1.$kc {
        constructor(m, n, r, s, storageService, lifecycleService) {
            super();
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.b = this.B(new event_1.$fd({ leakWarningThreshold: 400 }));
            this.onDidChangeFormatters = this.b.event;
            // Find some meaningful defaults until the remote environment
            // is resolved, by taking the current OS we are running in
            // and by taking the local `userHome` if we run on a local
            // file scheme.
            this.h = platform_2.OS;
            this.j = r.defaultUriScheme === network_1.Schemas.file ? this.r.userHome({ preferLocal: true }) : undefined;
            const memento = this.c = new memento_1.$YT('cachedResourceLabelFormatters2', storageService);
            this.g = memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            this.a = this.g?.formatters?.slice() || [];
            // Remote environment is potentially long running
            this.t();
        }
        async t() {
            // OS
            const env = await this.s.getEnvironment();
            this.h = env?.os ?? platform_2.OS;
            // User home
            this.j = await this.r.userHome();
        }
        findFormatting(resource) {
            let bestResult;
            for (const formatter of this.a) {
                if (formatter.scheme === resource.scheme) {
                    if (!formatter.authority && (!bestResult || formatter.priority)) {
                        bestResult = formatter;
                        continue;
                    }
                    if (!formatter.authority) {
                        continue;
                    }
                    if ((0, glob_1.$qj)(formatter.authority.toLowerCase(), resource.authority.toLowerCase()) &&
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
            const label = this.u(resource, formatting, options);
            // Without formatting we still need to support the separator
            // as provided in options (https://github.com/microsoft/vscode/issues/130019)
            if (!formatting && options.separator) {
                return label.replace(sepRegexp, options.separator);
            }
            return label;
        }
        u(resource, formatting, options = {}) {
            if (!formatting) {
                return (0, labels_1.$eA)(resource, {
                    os: this.h,
                    tildify: this.j ? { userHome: this.j } : undefined,
                    relative: options.relative ? {
                        noPrefix: options.noPrefix,
                        getWorkspace: () => this.n.getWorkspace(),
                        getWorkspaceFolder: resource => this.n.getWorkspaceFolder(resource)
                    } : undefined
                });
            }
            // Relative label
            if (options.relative && this.n) {
                let folder = this.n.getWorkspaceFolder(resource);
                if (!folder) {
                    // It is possible that the resource we want to resolve the
                    // workspace folder for is not using the same scheme as
                    // the folders in the workspace, so we help by trying again
                    // to resolve a workspace folder by trying again with a
                    // scheme that is workspace contained.
                    const workspace = this.n.getWorkspace();
                    const firstFolder = (0, arrays_1.$Mb)(workspace.folders);
                    if (firstFolder && resource.scheme !== firstFolder.uri.scheme && resource.path.startsWith(path_1.$6d.sep)) {
                        folder = this.n.getWorkspaceFolder(firstFolder.uri.with({ path: resource.path }));
                    }
                }
                if (folder) {
                    const folderLabel = this.z(folder.uri, formatting, options.noPrefix);
                    let relativeLabel = this.z(resource, formatting, options.noPrefix);
                    let overlap = 0;
                    while (relativeLabel[overlap] && relativeLabel[overlap] === folderLabel[overlap]) {
                        overlap++;
                    }
                    if (!relativeLabel[overlap] || relativeLabel[overlap] === formatting.separator) {
                        relativeLabel = relativeLabel.substring(1 + overlap);
                    }
                    else if (overlap === folderLabel.length && folder.uri.path === path_1.$6d.sep) {
                        relativeLabel = relativeLabel.substring(overlap);
                    }
                    // always show root basename if there are multiple folders
                    const hasMultipleRoots = this.n.getWorkspace().folders.length > 1;
                    if (hasMultipleRoots && !options.noPrefix) {
                        const rootName = folder?.name ?? (0, resources_1.$eg)(folder.uri);
                        relativeLabel = relativeLabel ? `${rootName} • ${relativeLabel}` : rootName;
                    }
                    return relativeLabel;
                }
            }
            // Absolute label
            return this.z(resource, formatting, options.noPrefix);
        }
        getUriBasenameLabel(resource) {
            const formatting = this.findFormatting(resource);
            const label = this.u(resource, formatting);
            let pathLib;
            if (formatting?.separator === path_1.$5d.sep) {
                pathLib = path_1.$5d;
            }
            else if (formatting?.separator === path_1.$6d.sep) {
                pathLib = path_1.$6d;
            }
            else {
                pathLib = (this.h === 1 /* OperatingSystem.Windows */) ? path_1.$5d : path_1.$6d;
            }
            return pathLib.basename(label);
        }
        getWorkspaceLabel(workspace, options) {
            if ((0, workspace_1.$Sh)(workspace)) {
                const identifier = (0, workspace_1.$Ph)(workspace);
                if ((0, workspace_1.$Lh)(identifier) || (0, workspace_1.$Qh)(identifier)) {
                    return this.getWorkspaceLabel(identifier, options);
                }
                return '';
            }
            // Workspace: Single Folder (as URI)
            if (uri_1.URI.isUri(workspace)) {
                return this.y(workspace, options);
            }
            // Workspace: Single Folder (as workspace identifier)
            if ((0, workspace_1.$Lh)(workspace)) {
                return this.y(workspace.uri, options);
            }
            // Workspace: Multi Root
            if ((0, workspace_1.$Qh)(workspace)) {
                return this.w(workspace.configPath, options);
            }
            return '';
        }
        w(workspaceUri, options) {
            // Workspace: Untitled
            if ((0, workspace_1.$2h)(workspaceUri, this.m)) {
                return (0, nls_1.localize)(9, null);
            }
            // Workspace: Temporary
            if ((0, workspace_1.$3h)(workspaceUri)) {
                return (0, nls_1.localize)(10, null);
            }
            // Workspace: Saved
            let filename = (0, resources_1.$fg)(workspaceUri);
            if (filename.endsWith(workspace_1.$Xh)) {
                filename = filename.substr(0, filename.length - workspace_1.$Xh.length - 1);
            }
            let label;
            switch (options?.verbose) {
                case 0 /* Verbosity.SHORT */:
                    label = filename; // skip suffix for short label
                    break;
                case 2 /* Verbosity.LONG */:
                    label = (0, nls_1.localize)(11, null, this.getUriLabel((0, resources_1.$ig)((0, resources_1.$hg)(workspaceUri), filename)));
                    break;
                case 1 /* Verbosity.MEDIUM */:
                default:
                    label = (0, nls_1.localize)(12, null, filename);
                    break;
            }
            if (options?.verbose === 0 /* Verbosity.SHORT */) {
                return label; // skip suffix for short label
            }
            return this.C(label, workspaceUri);
        }
        y(folderUri, options) {
            let label;
            switch (options?.verbose) {
                case 2 /* Verbosity.LONG */:
                    label = this.getUriLabel(folderUri);
                    break;
                case 0 /* Verbosity.SHORT */:
                case 1 /* Verbosity.MEDIUM */:
                default:
                    label = (0, resources_1.$fg)(folderUri) || path_1.$6d.sep;
                    break;
            }
            if (options?.verbose === 0 /* Verbosity.SHORT */) {
                return label; // skip suffix for short label
            }
            return this.C(label, folderUri);
        }
        getSeparator(scheme, authority) {
            const formatter = this.findFormatting(uri_1.URI.from({ scheme, authority }));
            return formatter?.separator || path_1.$6d.sep;
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
            const list = this.g.formatters ??= [];
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
            this.c.saveMemento();
            return this.registerFormatter(formatter);
        }
        registerFormatter(formatter) {
            this.a.push(formatter);
            this.b.fire({ scheme: formatter.scheme });
            return {
                dispose: () => {
                    this.a = this.a.filter(f => f !== formatter);
                    this.b.fire({ scheme: formatter.scheme });
                }
            };
        }
        z(resource, formatting, forceNoTildify) {
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
                if (this.j) {
                    label = (0, labels_1.$gA)(label, this.j.fsPath, this.h);
                }
            }
            if (formatting.authorityPrefix && resource.authority) {
                label = formatting.authorityPrefix + label;
            }
            return label.replace(sepRegexp, formatting.separator);
        }
        C(label, uri) {
            const formatting = this.findFormatting(uri);
            const suffix = formatting && (typeof formatting.workspaceSuffix === 'string') ? formatting.workspaceSuffix : undefined;
            return suffix ? `${label} [${suffix}]` : label;
        }
    };
    exports.$Bzb = $Bzb;
    exports.$Bzb = $Bzb = __decorate([
        __param(0, environmentService_1.$hJ),
        __param(1, workspace_1.$Kh),
        __param(2, pathService_1.$yJ),
        __param(3, remoteAgentService_1.$jm),
        __param(4, storage_1.$Vo),
        __param(5, lifecycle_2.$7y)
    ], $Bzb);
    (0, extensions_1.$mr)(label_1.$Vz, $Bzb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=labelService.js.map