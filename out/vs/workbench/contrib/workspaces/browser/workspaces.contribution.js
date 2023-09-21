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
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/workspace/common/workspace", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/platform/notification/common/notification", "vs/base/common/resources", "vs/workbench/services/host/browser/host", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/actions/common/actions", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/files/common/files"], function (require, exports, nls_1, platform_1, contributions_1, workspace_1, lifecycle_1, files_1, notification_1, resources_1, host_1, quickInput_1, storage_1, virtualWorkspace_1, actions_1, contextkeys_1, contextkey_1, files_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspacesFinderContribution = void 0;
    /**
     * A workbench contribution that will look for `.code-workspace` files in the root of the
     * workspace folder and open a notification to suggest to open one of the workspaces.
     */
    let WorkspacesFinderContribution = class WorkspacesFinderContribution extends lifecycle_1.Disposable {
        constructor(contextService, notificationService, fileService, quickInputService, hostService, storageService) {
            super();
            this.contextService = contextService;
            this.notificationService = notificationService;
            this.fileService = fileService;
            this.quickInputService = quickInputService;
            this.hostService = hostService;
            this.storageService = storageService;
            this.findWorkspaces();
        }
        async findWorkspaces() {
            const folder = this.contextService.getWorkspace().folders[0];
            if (!folder || this.contextService.getWorkbenchState() !== 2 /* WorkbenchState.FOLDER */ || (0, virtualWorkspace_1.isVirtualWorkspace)(this.contextService.getWorkspace())) {
                return; // require a single (non virtual) root folder
            }
            const rootFileNames = (await this.fileService.resolve(folder.uri)).children?.map(child => child.name);
            if (Array.isArray(rootFileNames)) {
                const workspaceFiles = rootFileNames.filter(workspace_1.hasWorkspaceFileExtension);
                if (workspaceFiles.length > 0) {
                    this.doHandleWorkspaceFiles(folder.uri, workspaceFiles);
                }
            }
        }
        doHandleWorkspaceFiles(folder, workspaces) {
            const neverShowAgain = { id: 'workspaces.dontPromptToOpen', scope: notification_1.NeverShowAgainScope.WORKSPACE, isSecondary: true };
            // Prompt to open one workspace
            if (workspaces.length === 1) {
                const workspaceFile = workspaces[0];
                this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)('workspaceFound', "This folder contains a workspace file '{0}'. Do you want to open it? [Learn more]({1}) about workspace files.", workspaceFile, 'https://go.microsoft.com/fwlink/?linkid=2025315'), [{
                        label: (0, nls_1.localize)('openWorkspace', "Open Workspace"),
                        run: () => this.hostService.openWindow([{ workspaceUri: (0, resources_1.joinPath)(folder, workspaceFile) }])
                    }], {
                    neverShowAgain,
                    priority: !this.storageService.isNew(1 /* StorageScope.WORKSPACE */) ? notification_1.NotificationPriority.SILENT : undefined // https://github.com/microsoft/vscode/issues/125315
                });
            }
            // Prompt to select a workspace from many
            else if (workspaces.length > 1) {
                this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)('workspacesFound', "This folder contains multiple workspace files. Do you want to open one? [Learn more]({0}) about workspace files.", 'https://go.microsoft.com/fwlink/?linkid=2025315'), [{
                        label: (0, nls_1.localize)('selectWorkspace', "Select Workspace"),
                        run: () => {
                            this.quickInputService.pick(workspaces.map(workspace => ({ label: workspace })), { placeHolder: (0, nls_1.localize)('selectToOpen', "Select a workspace to open") }).then(pick => {
                                if (pick) {
                                    this.hostService.openWindow([{ workspaceUri: (0, resources_1.joinPath)(folder, pick.label) }]);
                                }
                            });
                        }
                    }], {
                    neverShowAgain,
                    priority: !this.storageService.isNew(1 /* StorageScope.WORKSPACE */) ? notification_1.NotificationPriority.SILENT : undefined // https://github.com/microsoft/vscode/issues/125315
                });
            }
        }
    };
    exports.WorkspacesFinderContribution = WorkspacesFinderContribution;
    exports.WorkspacesFinderContribution = WorkspacesFinderContribution = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, notification_1.INotificationService),
        __param(2, files_1.IFileService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, host_1.IHostService),
        __param(5, storage_1.IStorageService)
    ], WorkspacesFinderContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(WorkspacesFinderContribution, 4 /* LifecyclePhase.Eventually */);
    // Render "Open Workspace" button in *.code-workspace files
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.openWorkspaceFromEditor',
                title: { original: 'Open Workspace', value: (0, nls_1.localize)('openWorkspace', "Open Workspace") },
                f1: false,
                menu: {
                    id: actions_1.MenuId.EditorContent,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.ResourceContextKey.Extension.isEqualTo(workspace_1.WORKSPACE_SUFFIX), contextkeys_1.ActiveEditorContext.isEqualTo(files_2.TEXT_FILE_EDITOR_ID), contextkeys_1.TemporaryWorkspaceContext.toNegated())
                }
            });
        }
        async run(accessor, uri) {
            const hostService = accessor.get(host_1.IHostService);
            const contextService = accessor.get(workspace_1.IWorkspaceContextService);
            const notificationService = accessor.get(notification_1.INotificationService);
            if (contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                const workspaceConfiguration = contextService.getWorkspace().configuration;
                if (workspaceConfiguration && (0, resources_1.isEqual)(workspaceConfiguration, uri)) {
                    notificationService.info((0, nls_1.localize)('alreadyOpen', "This workspace is already open."));
                    return; // workspace already opened
                }
            }
            return hostService.openWindow([{ workspaceUri: uri }]);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlcy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93b3Jrc3BhY2VzL2Jyb3dzZXIvd29ya3NwYWNlcy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0JoRzs7O09BR0c7SUFDSSxJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE2QixTQUFRLHNCQUFVO1FBRTNELFlBQzRDLGNBQXdDLEVBQzVDLG1CQUF5QyxFQUNqRCxXQUF5QixFQUNuQixpQkFBcUMsRUFDM0MsV0FBeUIsRUFDdEIsY0FBK0I7WUFFakUsS0FBSyxFQUFFLENBQUM7WUFQbUMsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQzVDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDakQsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDbkIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUMzQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUN0QixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFJakUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFTyxLQUFLLENBQUMsY0FBYztZQUMzQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsa0NBQTBCLElBQUksSUFBQSxxQ0FBa0IsRUFBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUU7Z0JBQzNJLE9BQU8sQ0FBQyw2Q0FBNkM7YUFDckQ7WUFFRCxNQUFNLGFBQWEsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFD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