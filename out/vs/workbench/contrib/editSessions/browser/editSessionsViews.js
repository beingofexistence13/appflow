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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/views/treeView", "vs/workbench/common/views", "vs/workbench/contrib/editSessions/common/editSessions", "vs/base/common/uri", "vs/base/common/date", "vs/base/common/codicons", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/dialogs/common/dialogs", "vs/platform/workspace/common/workspace", "vs/base/common/resources", "vs/platform/files/common/files", "vs/base/common/path"], function (require, exports, lifecycle_1, nls_1, descriptors_1, instantiation_1, platform_1, treeView_1, views_1, editSessions_1, uri_1, date_1, codicons_1, editorCommands_1, actions_1, contextkey_1, commands_1, dialogs_1, workspace_1, resources_1, files_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditSessionsDataViews = void 0;
    const EDIT_SESSIONS_COUNT_KEY = 'editSessionsCount';
    const EDIT_SESSIONS_COUNT_CONTEXT_KEY = new contextkey_1.RawContextKey(EDIT_SESSIONS_COUNT_KEY, 0);
    let EditSessionsDataViews = class EditSessionsDataViews extends lifecycle_1.Disposable {
        constructor(container, instantiationService) {
            super();
            this.instantiationService = instantiationService;
            this.registerViews(container);
        }
        registerViews(container) {
            const viewId = editSessions_1.EDIT_SESSIONS_DATA_VIEW_ID;
            const name = editSessions_1.EDIT_SESSIONS_TITLE;
            const treeView = this.instantiationService.createInstance(treeView_1.TreeView, viewId, name);
            treeView.showCollapseAllAction = true;
            treeView.showRefreshAction = true;
            treeView.dataProvider = this.instantiationService.createInstance(EditSessionDataViewDataProvider);
            const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
            viewsRegistry.registerViews([{
                    id: viewId,
                    name,
                    ctorDescriptor: new descriptors_1.SyncDescriptor(treeView_1.TreeViewPane),
                    canToggleVisibility: true,
                    canMoveView: false,
                    treeView,
                    collapsed: false,
                    when: contextkey_1.ContextKeyExpr.and(editSessions_1.EDIT_SESSIONS_SHOW_VIEW),
                    order: 100,
                    hideByDefault: true,
                }], container);
            viewsRegistry.registerViewWelcomeContent(viewId, {
                content: (0, nls_1.localize)('noStoredChanges', 'You have no stored changes in the cloud to display.\n{0}', `[${(0, nls_1.localize)('storeWorkingChangesTitle', 'Store Working Changes')}](command:workbench.editSessions.actions.store)`),
                when: contextkey_1.ContextKeyExpr.equals(EDIT_SESSIONS_COUNT_KEY, 0),
                order: 1
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.resume',
                        title: (0, nls_1.localize)('workbench.editSessions.actions.resume.v2', "Resume Working Changes"),
                        icon: codicons_1.Codicon.desktopDownload,
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', viewId), contextkey_1.ContextKeyExpr.regex('viewItem', /edit-session/i)),
                            group: 'inline'
                        }
                    });
                }
                async run(accessor, handle) {
                    const editSessionId = uri_1.URI.parse(handle.$treeItemHandle).path.substring(1);
                    const commandService = accessor.get(commands_1.ICommandService);
                    await commandService.executeCommand('workbench.editSessions.actions.resumeLatest', editSessionId, true);
                    await treeView.refresh();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.store',
                        title: (0, nls_1.localize)('workbench.editSessions.actions.store.v2', "Store Working Changes"),
                        icon: codicons_1.Codicon.cloudUpload,
                    });
                }
                async run(accessor, handle) {
                    const commandService = accessor.get(commands_1.ICommandService);
                    await commandService.executeCommand('workbench.editSessions.actions.storeCurrent');
                    await treeView.refresh();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.delete',
                        title: (0, nls_1.localize)('workbench.editSessions.actions.delete.v2', "Delete Working Changes"),
                        icon: codicons_1.Codicon.trash,
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', viewId), contextkey_1.ContextKeyExpr.regex('viewItem', /edit-session/i)),
                            group: 'inline'
                        }
                    });
                }
                async run(accessor, handle) {
                    const editSessionId = uri_1.URI.parse(handle.$treeItemHandle).path.substring(1);
                    const dialogService = accessor.get(dialogs_1.IDialogService);
                    const editSessionStorageService = accessor.get(editSessions_1.IEditSessionsStorageService);
                    const result = await dialogService.confirm({
                        message: (0, nls_1.localize)('confirm delete.v2', 'Are you sure you want to permanently delete your working changes with ref {0}?', editSessionId),
                        detail: (0, nls_1.localize)('confirm delete detail.v2', ' You cannot undo this action.'),
                        type: 'warning',
                        title: editSessions_1.EDIT_SESSIONS_TITLE
                    });
                    if (result.confirmed) {
                        await editSessionStorageService.delete('editSessions', editSessionId);
                        await treeView.refresh();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.deleteAll',
                        title: (0, nls_1.localize)('workbench.editSessions.actions.deleteAll', "Delete All Working Changes from Cloud"),
                        icon: codicons_1.Codicon.trash,
                        menu: {
                            id: actions_1.MenuId.ViewTitle,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', viewId), contextkey_1.ContextKeyExpr.greater(EDIT_SESSIONS_COUNT_KEY, 0)),
                        }
                    });
                }
                async run(accessor) {
                    const dialogService = accessor.get(dialogs_1.IDialogService);
                    const editSessionStorageService = accessor.get(editSessions_1.IEditSessionsStorageService);
                    const result = await dialogService.confirm({
                        message: (0, nls_1.localize)('confirm delete all', 'Are you sure you want to permanently delete all stored changes from the cloud?'),
                        detail: (0, nls_1.localize)('confirm delete all detail', ' You cannot undo this action.'),
                        type: 'warning',
                        title: editSessions_1.EDIT_SESSIONS_TITLE
                    });
                    if (result.confirmed) {
                        await editSessionStorageService.delete('editSessions', null);
                        await treeView.refresh();
                    }
                }
            });
        }
    };
    exports.EditSessionsDataViews = EditSessionsDataViews;
    exports.EditSessionsDataViews = EditSessionsDataViews = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], EditSessionsDataViews);
    let EditSessionDataViewDataProvider = class EditSessionDataViewDataProvider {
        constructor(editSessionsStorageService, contextKeyService, workspaceContextService, fileService) {
            this.editSessionsStorageService = editSessionsStorageService;
            this.contextKeyService = contextKeyService;
            this.workspaceContextService = workspaceContextService;
            this.fileService = fileService;
            this.editSessionsCount = EDIT_SESSIONS_COUNT_CONTEXT_KEY.bindTo(this.contextKeyService);
        }
        async getChildren(element) {
            if (!element) {
                return this.getAllEditSessions();
            }
            const [ref, folderName, filePath] = uri_1.URI.parse(element.handle).path.substring(1).split('/');
            if (ref && !folderName) {
                return this.getEditSession(ref);
            }
            else if (ref && folderName && !filePath) {
                return this.getEditSessionFolderContents(ref, folderName);
            }
            return [];
        }
        async getAllEditSessions() {
            const allEditSessions = await this.editSessionsStorageService.list('editSessions');
            this.editSessionsCount.set(allEditSessions.length);
            const editSessions = [];
            for (const session of allEditSessions) {
                const resource = uri_1.URI.from({ scheme: editSessions_1.EDIT_SESSIONS_SCHEME, authority: 'remote-session-content', path: `/${session.ref}` });
                const sessionData = await this.editSessionsStorageService.read('editSessions', session.ref);
                if (!sessionData) {
                    continue;
                }
                const content = JSON.parse(sessionData.content);
                const label = content.folders.map((folder) => folder.name).join(', ') ?? session.ref;
                const machineId = content.machine;
                const machineName = machineId ? await this.editSessionsStorageService.getMachineById(machineId) : undefined;
                const description = machineName === undefined ? (0, date_1.fromNow)(session.created, true) : `${(0, date_1.fromNow)(session.created, true)}\u00a0\u00a0\u2022\u00a0\u00a0${machineName}`;
                editSessions.push({
                    handle: resource.toString(),
                    collapsibleState: views_1.TreeItemCollapsibleState.Collapsed,
                    label: { label },
                    description: description,
                    themeIcon: codicons_1.Codicon.repo,
                    contextValue: `edit-session`
                });
            }
            return editSessions;
        }
        async getEditSession(ref) {
            const data = await this.editSessionsStorageService.read('editSessions', ref);
            if (!data) {
                return [];
            }
            const content = JSON.parse(data.content);
            if (content.folders.length === 1) {
                const folder = content.folders[0];
                return this.getEditSessionFolderContents(ref, folder.name);
            }
            return content.folders.map((folder) => {
                const resource = uri_1.URI.from({ scheme: editSessions_1.EDIT_SESSIONS_SCHEME, authority: 'remote-session-content', path: `/${data.ref}/${folder.name}` });
                return {
                    handle: resource.toString(),
                    collapsibleState: views_1.TreeItemCollapsibleState.Collapsed,
                    label: { label: folder.name },
                    themeIcon: codicons_1.Codicon.folder
                };
            });
        }
        async getEditSessionFolderContents(ref, folderName) {
            const data = await this.editSessionsStorageService.read('editSessions', ref);
            if (!data) {
                return [];
            }
            const content = JSON.parse(data.content);
            const currentWorkspaceFolder = this.workspaceContextService.getWorkspace().folders.find((folder) => folder.name === folderName);
            const editSessionFolder = content.folders.find((folder) => folder.name === folderName);
            if (!editSessionFolder) {
                return [];
            }
            return Promise.all(editSessionFolder.workingChanges.map(async (change) => {
                const cloudChangeUri = uri_1.URI.from({ scheme: editSessions_1.EDIT_SESSIONS_SCHEME, authority: 'remote-session-content', path: `/${data.ref}/${folderName}/${change.relativeFilePath}` });
                if (currentWorkspaceFolder?.uri) {
                    // find the corresponding file in the workspace
                    const localCopy = (0, resources_1.joinPath)(currentWorkspaceFolder.uri, change.relativeFilePath);
                    if (change.type === editSessions_1.ChangeType.Addition && await this.fileService.exists(localCopy)) {
                        return {
                            handle: cloudChangeUri.toString(),
                            resourceUri: cloudChangeUri,
                            collapsibleState: views_1.TreeItemCollapsibleState.None,
                            label: { label: change.relativeFilePath },
                            themeIcon: codicons_1.Codicon.file,
                            command: {
                                id: 'vscode.diff',
                                title: (0, nls_1.localize)('compare changes', 'Compare Changes'),
                                arguments: [
                                    localCopy,
                                    cloudChangeUri,
                                    `${(0, path_1.basename)(change.relativeFilePath)} (${(0, nls_1.localize)('local copy', 'Local Copy')} \u2194 ${(0, nls_1.localize)('cloud changes', 'Cloud Changes')})`,
                                    undefined
                                ]
                            }
                        };
                    }
                }
                return {
                    handle: cloudChangeUri.toString(),
                    resourceUri: cloudChangeUri,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    label: { label: change.relativeFilePath },
                    themeIcon: codicons_1.Codicon.file,
                    command: {
                        id: editorCommands_1.API_OPEN_EDITOR_COMMAND_ID,
                        title: (0, nls_1.localize)('open file', 'Open File'),
                        arguments: [cloudChangeUri, undefined, undefined]
                    }
                };
            }));
        }
    };
    EditSessionDataViewDataProvider = __decorate([
        __param(0, editSessions_1.IEditSessionsStorageService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, files_1.IFileService)
    ], EditSessionDataViewDataProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFNlc3Npb25zVmlld3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9lZGl0U2Vzc2lvbnMvYnJvd3Nlci9lZGl0U2Vzc2lvbnNWaWV3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF1QmhHLE1BQU0sdUJBQXVCLEdBQUcsbUJBQW1CLENBQUM7SUFDcEQsTUFBTSwrQkFBK0IsR0FBRyxJQUFJLDBCQUFhLENBQVMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFdkYsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBc0IsU0FBUSxzQkFBVTtRQUNwRCxZQUNDLFNBQXdCLEVBQ2dCLG9CQUEyQztZQUVuRixLQUFLLEVBQUUsQ0FBQztZQUZnQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBR25GLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVPLGFBQWEsQ0FBQyxTQUF3QjtZQUM3QyxNQUFNLE1BQU0sR0FBRyx5Q0FBMEIsQ0FBQztZQUMxQyxNQUFNLElBQUksR0FBRyxrQ0FBbUIsQ0FBQztZQUNqQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLG1CQUFRLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xGLFFBQVEsQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7WUFDdEMsUUFBUSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztZQUNsQyxRQUFRLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsK0JBQStCLENBQUMsQ0FBQztZQUVsRyxNQUFNLGFBQWEsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBaUIsa0JBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM1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