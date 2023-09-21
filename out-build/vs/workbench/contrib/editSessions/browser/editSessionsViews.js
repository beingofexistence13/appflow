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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/editSessions/browser/editSessionsViews", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/views/treeView", "vs/workbench/common/views", "vs/workbench/contrib/editSessions/common/editSessions", "vs/base/common/uri", "vs/base/common/date", "vs/base/common/codicons", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/dialogs/common/dialogs", "vs/platform/workspace/common/workspace", "vs/base/common/resources", "vs/platform/files/common/files", "vs/base/common/path"], function (require, exports, lifecycle_1, nls_1, descriptors_1, instantiation_1, platform_1, treeView_1, views_1, editSessions_1, uri_1, date_1, codicons_1, editorCommands_1, actions_1, contextkey_1, commands_1, dialogs_1, workspace_1, resources_1, files_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$b1b = void 0;
    const EDIT_SESSIONS_COUNT_KEY = 'editSessionsCount';
    const EDIT_SESSIONS_COUNT_CONTEXT_KEY = new contextkey_1.$2i(EDIT_SESSIONS_COUNT_KEY, 0);
    let $b1b = class $b1b extends lifecycle_1.$kc {
        constructor(container, a) {
            super();
            this.a = a;
            this.b(container);
        }
        b(container) {
            const viewId = editSessions_1.$3Zb;
            const name = editSessions_1.$5Zb;
            const treeView = this.a.createInstance(treeView_1.$0ub, viewId, name);
            treeView.showCollapseAllAction = true;
            treeView.showRefreshAction = true;
            treeView.dataProvider = this.a.createInstance(EditSessionDataViewDataProvider);
            const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
            viewsRegistry.registerViews([{
                    id: viewId,
                    name,
                    ctorDescriptor: new descriptors_1.$yh(treeView_1.$7ub),
                    canToggleVisibility: true,
                    canMoveView: false,
                    treeView,
                    collapsed: false,
                    when: contextkey_1.$Ii.and(editSessions_1.$7Zb),
                    order: 100,
                    hideByDefault: true,
                }], container);
            viewsRegistry.registerViewWelcomeContent(viewId, {
                content: (0, nls_1.localize)(0, null, `[${(0, nls_1.localize)(1, null)}](command:workbench.editSessions.actions.store)`),
                when: contextkey_1.$Ii.equals(EDIT_SESSIONS_COUNT_KEY, 0),
                order: 1
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.resume',
                        title: (0, nls_1.localize)(2, null),
                        icon: codicons_1.$Pj.desktopDownload,
                        menu: {
                            id: actions_1.$Ru.ViewItemContext,
                            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', viewId), contextkey_1.$Ii.regex('viewItem', /edit-session/i)),
                            group: 'inline'
                        }
                    });
                }
                async run(accessor, handle) {
                    const editSessionId = uri_1.URI.parse(handle.$treeItemHandle).path.substring(1);
                    const commandService = accessor.get(commands_1.$Fr);
                    await commandService.executeCommand('workbench.editSessions.actions.resumeLatest', editSessionId, true);
                    await treeView.refresh();
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.store',
                        title: (0, nls_1.localize)(3, null),
                        icon: codicons_1.$Pj.cloudUpload,
                    });
                }
                async run(accessor, handle) {
                    const commandService = accessor.get(commands_1.$Fr);
                    await commandService.executeCommand('workbench.editSessions.actions.storeCurrent');
                    await treeView.refresh();
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.delete',
                        title: (0, nls_1.localize)(4, null),
                        icon: codicons_1.$Pj.trash,
                        menu: {
                            id: actions_1.$Ru.ViewItemContext,
                            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', viewId), contextkey_1.$Ii.regex('viewItem', /edit-session/i)),
                            group: 'inline'
                        }
                    });
                }
                async run(accessor, handle) {
                    const editSessionId = uri_1.URI.parse(handle.$treeItemHandle).path.substring(1);
                    const dialogService = accessor.get(dialogs_1.$oA);
                    const editSessionStorageService = accessor.get(editSessions_1.$UZb);
                    const result = await dialogService.confirm({
                        message: (0, nls_1.localize)(5, null, editSessionId),
                        detail: (0, nls_1.localize)(6, null),
                        type: 'warning',
                        title: editSessions_1.$5Zb
                    });
                    if (result.confirmed) {
                        await editSessionStorageService.delete('editSessions', editSessionId);
                        await treeView.refresh();
                    }
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.deleteAll',
                        title: (0, nls_1.localize)(7, null),
                        icon: codicons_1.$Pj.trash,
                        menu: {
                            id: actions_1.$Ru.ViewTitle,
                            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', viewId), contextkey_1.$Ii.greater(EDIT_SESSIONS_COUNT_KEY, 0)),
                        }
                    });
                }
                async run(accessor) {
                    const dialogService = accessor.get(dialogs_1.$oA);
                    const editSessionStorageService = accessor.get(editSessions_1.$UZb);
                    const result = await dialogService.confirm({
                        message: (0, nls_1.localize)(8, null),
                        detail: (0, nls_1.localize)(9, null),
                        type: 'warning',
                        title: editSessions_1.$5Zb
                    });
                    if (result.confirmed) {
                        await editSessionStorageService.delete('editSessions', null);
                        await treeView.refresh();
                    }
                }
            });
        }
    };
    exports.$b1b = $b1b;
    exports.$b1b = $b1b = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $b1b);
    let EditSessionDataViewDataProvider = class EditSessionDataViewDataProvider {
        constructor(b, c, d, e) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.a = EDIT_SESSIONS_COUNT_CONTEXT_KEY.bindTo(this.c);
        }
        async getChildren(element) {
            if (!element) {
                return this.f();
            }
            const [ref, folderName, filePath] = uri_1.URI.parse(element.handle).path.substring(1).split('/');
            if (ref && !folderName) {
                return this.g(ref);
            }
            else if (ref && folderName && !filePath) {
                return this.h(ref, folderName);
            }
            return [];
        }
        async f() {
            const allEditSessions = await this.b.list('editSessions');
            this.a.set(allEditSessions.length);
            const editSessions = [];
            for (const session of allEditSessions) {
                const resource = uri_1.URI.from({ scheme: editSessions_1.$8Zb, authority: 'remote-session-content', path: `/${session.ref}` });
                const sessionData = await this.b.read('editSessions', session.ref);
                if (!sessionData) {
                    continue;
                }
                const content = JSON.parse(sessionData.content);
                const label = content.folders.map((folder) => folder.name).join(', ') ?? session.ref;
                const machineId = content.machine;
                const machineName = machineId ? await this.b.getMachineById(machineId) : undefined;
                const description = machineName === undefined ? (0, date_1.$6l)(session.created, true) : `${(0, date_1.$6l)(session.created, true)}\u00a0\u00a0\u2022\u00a0\u00a0${machineName}`;
                editSessions.push({
                    handle: resource.toString(),
                    collapsibleState: views_1.TreeItemCollapsibleState.Collapsed,
                    label: { label },
                    description: description,
                    themeIcon: codicons_1.$Pj.repo,
                    contextValue: `edit-session`
                });
            }
            return editSessions;
        }
        async g(ref) {
            const data = await this.b.read('editSessions', ref);
            if (!data) {
                return [];
            }
            const content = JSON.parse(data.content);
            if (content.folders.length === 1) {
                const folder = content.folders[0];
                return this.h(ref, folder.name);
            }
            return content.folders.map((folder) => {
                const resource = uri_1.URI.from({ scheme: editSessions_1.$8Zb, authority: 'remote-session-content', path: `/${data.ref}/${folder.name}` });
                return {
                    handle: resource.toString(),
                    collapsibleState: views_1.TreeItemCollapsibleState.Collapsed,
                    label: { label: folder.name },
                    themeIcon: codicons_1.$Pj.folder
                };
            });
        }
        async h(ref, folderName) {
            const data = await this.b.read('editSessions', ref);
            if (!data) {
                return [];
            }
            const content = JSON.parse(data.content);
            const currentWorkspaceFolder = this.d.getWorkspace().folders.find((folder) => folder.name === folderName);
            const editSessionFolder = content.folders.find((folder) => folder.name === folderName);
            if (!editSessionFolder) {
                return [];
            }
            return Promise.all(editSessionFolder.workingChanges.map(async (change) => {
                const cloudChangeUri = uri_1.URI.from({ scheme: editSessions_1.$8Zb, authority: 'remote-session-content', path: `/${data.ref}/${folderName}/${change.relativeFilePath}` });
                if (currentWorkspaceFolder?.uri) {
                    // find the corresponding file in the workspace
                    const localCopy = (0, resources_1.$ig)(currentWorkspaceFolder.uri, change.relativeFilePath);
                    if (change.type === editSessions_1.ChangeType.Addition && await this.e.exists(localCopy)) {
                        return {
                            handle: cloudChangeUri.toString(),
                            resourceUri: cloudChangeUri,
                            collapsibleState: views_1.TreeItemCollapsibleState.None,
                            label: { label: change.relativeFilePath },
                            themeIcon: codicons_1.$Pj.file,
                            command: {
                                id: 'vscode.diff',
                                title: (0, nls_1.localize)(10, null),
                                arguments: [
                                    localCopy,
                                    cloudChangeUri,
                                    `${(0, path_1.$ae)(change.relativeFilePath)} (${(0, nls_1.localize)(11, null)} \u2194 ${(0, nls_1.localize)(12, null)})`,
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
                    themeIcon: codicons_1.$Pj.file,
                    command: {
                        id: editorCommands_1.$Wub,
                        title: (0, nls_1.localize)(13, null),
                        arguments: [cloudChangeUri, undefined, undefined]
                    }
                };
            }));
        }
    };
    EditSessionDataViewDataProvider = __decorate([
        __param(0, editSessions_1.$UZb),
        __param(1, contextkey_1.$3i),
        __param(2, workspace_1.$Kh),
        __param(3, files_1.$6j)
    ], EditSessionDataViewDataProvider);
});
//# sourceMappingURL=editSessionsViews.js.map