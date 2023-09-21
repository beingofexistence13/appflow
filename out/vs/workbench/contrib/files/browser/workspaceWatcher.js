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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/workspace/common/workspace", "vs/base/common/map", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/base/common/path", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/host/browser/host", "vs/workbench/services/files/common/files"], function (require, exports, nls_1, lifecycle_1, uri_1, configuration_1, workspace_1, map_1, notification_1, opener_1, path_1, uriIdentity_1, host_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceWatcher = void 0;
    let WorkspaceWatcher = class WorkspaceWatcher extends lifecycle_1.Disposable {
        constructor(fileService, configurationService, contextService, notificationService, openerService, uriIdentityService, hostService) {
            super();
            this.fileService = fileService;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.uriIdentityService = uriIdentityService;
            this.hostService = hostService;
            this.watchedWorkspaces = new map_1.ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
            this.registerListeners();
            this.refresh();
        }
        registerListeners() {
            this._register(this.contextService.onDidChangeWorkspaceFolders(e => this.onDidChangeWorkspaceFolders(e)));
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.onDidChangeWorkbenchState()));
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onDidChangeConfiguration(e)));
            this._register(this.fileService.onDidWatchError(error => this.onDidWatchError(error)));
        }
        onDidChangeWorkspaceFolders(e) {
            // Removed workspace: Unwatch
            for (const removed of e.removed) {
                this.unwatchWorkspace(removed);
            }
            // Added workspace: Watch
            for (const added of e.added) {
                this.watchWorkspace(added);
            }
        }
        onDidChangeWorkbenchState() {
            this.refresh();
        }
        onDidChangeConfiguration(e) {
            if (e.affectsConfiguration('files.watcherExclude') || e.affectsConfiguration('files.watcherInclude')) {
                this.refresh();
            }
        }
        onDidWatchError(error) {
            const msg = error.toString();
            // Detect if we run into ENOSPC issues
            if (msg.indexOf('ENOSPC') >= 0) {
                this.notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('enospcError', "Unable to watch for file changes in this large workspace folder. Please follow the instructions link to resolve this issue."), [{
                        label: (0, nls_1.localize)('learnMore', "Instructions"),
                        run: () => this.openerService.open(uri_1.URI.parse('https://go.microsoft.com/fwlink/?linkid=867693'))
                    }], {
                    sticky: true,
                    neverShowAgain: { id: 'ignoreEnospcError', isSecondary: true, scope: notification_1.NeverShowAgainScope.WORKSPACE }
                });
            }
            // Detect when the watcher throws an error unexpectedly
            else if (msg.indexOf('EUNKNOWN') >= 0) {
                this.notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('eshutdownError', "File changes watcher stopped unexpectedly. A reload of the window may enable the watcher again unless the workspace cannot be watched for file changes."), [{
                        label: (0, nls_1.localize)('reload', "Reload"),
                        run: () => this.hostService.reload()
                    }], {
                    sticky: true,
                    priority: notification_1.NotificationPriority.SILENT // reduce potential spam since we don't really know how often this fires
                });
            }
        }
        watchWorkspace(workspace) {
            // Compute the watcher exclude rules from configuration
            const excludes = [];
            const config = this.configurationService.getValue({ resource: workspace.uri });
            if (config.files?.watcherExclude) {
                for (const key in config.files.watcherExclude) {
                    if (config.files.watcherExclude[key] === true) {
                        excludes.push(key);
                    }
                }
            }
            const pathsToWatch = new map_1.ResourceMap(uri => this.uriIdentityService.extUri.getComparisonKey(uri));
            // Add the workspace as path to watch
            pathsToWatch.set(workspace.uri, workspace.uri);
            // Compute additional includes from configuration
            if (config.files?.watcherInclude) {
                for (const includePath of config.files.watcherInclude) {
                    if (!includePath) {
                        continue;
                    }
                    // Absolute: verify a child of the workspace
                    if ((0, path_1.isAbsolute)(includePath)) {
                        const candidate = uri_1.URI.file(includePath).with({ scheme: workspace.uri.scheme });
                        if (this.uriIdentityService.extUri.isEqualOrParent(candidate, workspace.uri)) {
                            pathsToWatch.set(candidate, candidate);
                        }
                    }
                    // Relative: join against workspace folder
                    else {
                        const candidate = workspace.toResource(includePath);
                        pathsToWatch.set(candidate, candidate);
                    }
                }
            }
            // Watch all paths as instructed
            const disposables = new lifecycle_1.DisposableStore();
            for (const [, pathToWatch] of pathsToWatch) {
                disposables.add(this.fileService.watch(pathToWatch, { recursive: true, excludes }));
            }
            this.watchedWorkspaces.set(workspace.uri, disposables);
        }
        unwatchWorkspace(workspace) {
            if (this.watchedWorkspaces.has(workspace.uri)) {
                (0, lifecycle_1.dispose)(this.watchedWorkspaces.get(workspace.uri));
                this.watchedWorkspaces.delete(workspace.uri);
            }
        }
        refresh() {
            // Unwatch all first
            this.unwatchWorkspaces();
            // Watch each workspace folder
            for (const folder of this.contextService.getWorkspace().folders) {
                this.watchWorkspace(folder);
            }
        }
        unwatchWorkspaces() {
            for (const [, disposable] of this.watchedWorkspaces) {
                disposable.dispose();
            }
            this.watchedWorkspaces.clear();
        }
        dispose() {
            super.dispose();
            this.unwatchWorkspaces();
        }
    };
    exports.WorkspaceWatcher = WorkspaceWatcher;
    exports.WorkspaceWatcher = WorkspaceWatcher = __decorate([
        __param(0, files_1.IWorkbenchFileService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, notification_1.INotificationService),
        __param(4, opener_1.IOpenerService),
        __param(5, uriIdentity_1.IUriIdentityService),
        __param(6, host_1.IHostService)
    ], WorkspaceWatcher);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlV2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2ZpbGVzL2Jyb3dzZXIvd29ya3NwYWNlV2F0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQnpGLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWlCLFNBQVEsc0JBQVU7UUFJL0MsWUFDd0IsV0FBbUQsRUFDbkQsb0JBQTRELEVBQ3pELGNBQXlELEVBQzdELG1CQUEwRCxFQUNoRSxhQUE4QyxFQUN6QyxrQkFBd0QsRUFDL0QsV0FBMEM7WUFFeEQsS0FBSyxFQUFFLENBQUM7WUFSZ0MsZ0JBQVcsR0FBWCxXQUFXLENBQXVCO1lBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDeEMsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQzVDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDL0Msa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ3hCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDOUMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFUeEMsc0JBQWlCLEdBQUcsSUFBSSxpQkFBVyxDQUFjLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBYXhJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRXpCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQixDQUFDO1FBRU8saUJBQWlCO1lBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFD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