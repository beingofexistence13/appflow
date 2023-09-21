/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/actions/workspaceCommands", "vs/platform/workspace/common/workspace", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/base/common/resources", "vs/base/common/cancellation", "vs/base/common/labels", "vs/platform/commands/common/commands", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/dialogs/common/dialogs", "vs/base/common/uri", "vs/base/common/network", "vs/platform/workspaces/common/workspaces", "vs/workbench/services/path/common/pathService"], function (require, exports, nls_1, workspace_1, workspaceEditing_1, resources_1, cancellation_1, labels_1, commands_1, files_1, label_1, quickInput_1, getIconClasses_1, model_1, language_1, dialogs_1, uri_1, network_1, workspaces_1, pathService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dgb = exports.$cgb = exports.$bgb = exports.$agb = void 0;
    exports.$agb = 'addRootFolder';
    exports.$bgb = { value: (0, nls_1.localize)(0, null), original: 'Add Folder to Workspace...' };
    exports.$cgb = 'setRootFolder';
    exports.$dgb = '_workbench.pickWorkspaceFolder';
    // Command registration
    commands_1.$Gr.registerCommand({
        id: 'workbench.action.files.openFileFolderInNewWindow',
        handler: (accessor) => accessor.get(dialogs_1.$qA).pickFileFolderAndOpen({ forceNewWindow: true })
    });
    commands_1.$Gr.registerCommand({
        id: '_files.pickFolderAndOpen',
        handler: (accessor, options) => accessor.get(dialogs_1.$qA).pickFolderAndOpen(options)
    });
    commands_1.$Gr.registerCommand({
        id: 'workbench.action.files.openFolderInNewWindow',
        handler: (accessor) => accessor.get(dialogs_1.$qA).pickFolderAndOpen({ forceNewWindow: true })
    });
    commands_1.$Gr.registerCommand({
        id: 'workbench.action.files.openFileInNewWindow',
        handler: (accessor) => accessor.get(dialogs_1.$qA).pickFileAndOpen({ forceNewWindow: true })
    });
    commands_1.$Gr.registerCommand({
        id: 'workbench.action.openWorkspaceInNewWindow',
        handler: (accessor) => accessor.get(dialogs_1.$qA).pickWorkspaceAndOpen({ forceNewWindow: true })
    });
    commands_1.$Gr.registerCommand({
        id: exports.$agb,
        handler: async (accessor) => {
            const workspaceEditingService = accessor.get(workspaceEditing_1.$pU);
            const folders = await selectWorkspaceFolders(accessor);
            if (!folders || !folders.length) {
                return;
            }
            await workspaceEditingService.addFolders(folders.map(folder => ({ uri: folder })));
        }
    });
    commands_1.$Gr.registerCommand({
        id: exports.$cgb,
        handler: async (accessor) => {
            const workspaceEditingService = accessor.get(workspaceEditing_1.$pU);
            const contextService = accessor.get(workspace_1.$Kh);
            const folders = await selectWorkspaceFolders(accessor);
            if (!folders || !folders.length) {
                return;
            }
            await workspaceEditingService.updateFolders(0, contextService.getWorkspace().folders.length, folders.map(folder => ({ uri: folder })));
        }
    });
    async function selectWorkspaceFolders(accessor) {
        const dialogsService = accessor.get(dialogs_1.$qA);
        const pathService = accessor.get(pathService_1.$yJ);
        const folders = await dialogsService.showOpenDialog({
            openLabel: (0, labels_1.$lA)((0, nls_1.localize)(1, null)),
            title: (0, nls_1.localize)(2, null),
            canSelectFolders: true,
            canSelectMany: true,
            defaultUri: await dialogsService.defaultFolderPath(),
            availableFileSystems: [pathService.defaultUriScheme]
        });
        return folders;
    }
    commands_1.$Gr.registerCommand(exports.$dgb, async function (accessor, args) {
        const quickInputService = accessor.get(quickInput_1.$Gq);
        const labelService = accessor.get(label_1.$Vz);
        const contextService = accessor.get(workspace_1.$Kh);
        const modelService = accessor.get(model_1.$yA);
        const languageService = accessor.get(language_1.$ct);
        const folders = contextService.getWorkspace().folders;
        if (!folders.length) {
            return;
        }
        const folderPicks = folders.map(folder => {
            const label = folder.name;
            const description = labelService.getUriLabel((0, resources_1.$hg)(folder.uri), { relative: true });
            return {
                label,
                description: description !== label ? description : undefined,
                folder,
                iconClasses: (0, getIconClasses_1.$x6)(modelService, languageService, folder.uri, files_1.FileKind.ROOT_FOLDER)
            };
        });
        const options = (args ? args[0] : undefined) || Object.create(null);
        if (!options.activeItem) {
            options.activeItem = folderPicks[0];
        }
        if (!options.placeHolder) {
            options.placeHolder = (0, nls_1.localize)(3, null);
        }
        if (typeof options.matchOnDescription !== 'boolean') {
            options.matchOnDescription = true;
        }
        const token = (args ? args[1] : undefined) || cancellation_1.CancellationToken.None;
        const pick = await quickInputService.pick(folderPicks, options, token);
        if (pick) {
            return folders[folderPicks.indexOf(pick)];
        }
        return;
    });
    commands_1.$Gr.registerCommand({
        id: 'vscode.openFolder',
        handler: (accessor, uriComponents, arg) => {
            const commandService = accessor.get(commands_1.$Fr);
            // Be compatible to previous args by converting to options
            if (typeof arg === 'boolean') {
                arg = { forceNewWindow: arg };
            }
            // Without URI, ask to pick a folder or workspace to open
            if (!uriComponents) {
                const options = {
                    forceNewWindow: arg?.forceNewWindow
                };
                if (arg?.forceLocalWindow) {
                    options.remoteAuthority = null;
                    options.availableFileSystems = ['file'];
                }
                return commandService.executeCommand('_files.pickFolderAndOpen', options);
            }
            const uri = uri_1.URI.from(uriComponents, true);
            const options = {
                forceNewWindow: arg?.forceNewWindow,
                forceReuseWindow: arg?.forceReuseWindow,
                noRecentEntry: arg?.noRecentEntry,
                remoteAuthority: arg?.forceLocalWindow ? null : undefined,
                forceProfile: arg?.forceProfile,
                forceTempProfile: arg?.forceTempProfile,
            };
            const uriToOpen = ((0, workspace_1.$7h)(uri) || uri.scheme === network_1.Schemas.untitled) ? { workspaceUri: uri } : { folderUri: uri };
            return commandService.executeCommand('_files.windowOpen', [uriToOpen], options);
        },
        description: {
            description: 'Open a folder or workspace in the current window or new window depending on the newWindow argument. Note that opening in the same window will shutdown the current extension host process and start a new one on the given folder/workspace unless the newWindow parameter is set to true.',
            args: [
                {
                    name: 'uri', description: '(optional) Uri of the folder or workspace file to open. If not provided, a native dialog will ask the user for the folder',
                    constraint: (value) => value === undefined || value === null || value instanceof uri_1.URI
                },
                {
                    name: 'options',
                    description: '(optional) Options. Object with the following properties: ' +
                        '`forceNewWindow`: Whether to open the folder/workspace in a new window or the same. Defaults to opening in the same window. ' +
                        '`forceReuseWindow`: Whether to force opening the folder/workspace in the same window.  Defaults to false. ' +
                        '`noRecentEntry`: Whether the opened URI will appear in the \'Open Recent\' list. Defaults to false. ' +
                        'Note, for backward compatibility, options can also be of type boolean, representing the `forceNewWindow` setting.',
                    constraint: (value) => value === undefined || typeof value === 'object' || typeof value === 'boolean'
                }
            ]
        }
    });
    commands_1.$Gr.registerCommand({
        id: 'vscode.newWindow',
        handler: (accessor, options) => {
            const commandService = accessor.get(commands_1.$Fr);
            const commandOptions = {
                forceReuseWindow: options && options.reuseWindow,
                remoteAuthority: options && options.remoteAuthority
            };
            return commandService.executeCommand('_files.newWindow', commandOptions);
        },
        description: {
            description: 'Opens an new window depending on the newWindow argument.',
            args: [
                {
                    name: 'options',
                    description: '(optional) Options. Object with the following properties: ' +
                        '`reuseWindow`: Whether to open a new window or the same. Defaults to opening in a new window. ',
                    constraint: (value) => value === undefined || typeof value === 'object'
                }
            ]
        }
    });
    // recent history commands
    commands_1.$Gr.registerCommand('_workbench.removeFromRecentlyOpened', function (accessor, uri) {
        const workspacesService = accessor.get(workspaces_1.$fU);
        return workspacesService.removeRecentlyOpened([uri]);
    });
    commands_1.$Gr.registerCommand({
        id: 'vscode.removeFromRecentlyOpened',
        handler: (accessor, path) => {
            const workspacesService = accessor.get(workspaces_1.$fU);
            if (typeof path === 'string') {
                path = path.match(/^[^:/?#]+:\/\//) ? uri_1.URI.parse(path) : uri_1.URI.file(path);
            }
            else {
                path = uri_1.URI.revive(path); // called from extension host
            }
            return workspacesService.removeRecentlyOpened([path]);
        },
        description: {
            description: 'Removes an entry with the given path from the recently opened list.',
            args: [
                { name: 'path', description: 'URI or URI string to remove from recently opened.', constraint: (value) => typeof value === 'string' || value instanceof uri_1.URI }
            ]
        }
    });
    commands_1.$Gr.registerCommand('_workbench.addToRecentlyOpened', async function (accessor, recentEntry) {
        const workspacesService = accessor.get(workspaces_1.$fU);
        const uri = recentEntry.uri;
        const label = recentEntry.label;
        const remoteAuthority = recentEntry.remoteAuthority;
        let recent = undefined;
        if (recentEntry.type === 'workspace') {
            const workspace = await workspacesService.getWorkspaceIdentifier(uri);
            recent = { workspace, label, remoteAuthority };
        }
        else if (recentEntry.type === 'folder') {
            recent = { folderUri: uri, label, remoteAuthority };
        }
        else {
            recent = { fileUri: uri, label, remoteAuthority };
        }
        return workspacesService.addRecentlyOpened([recent]);
    });
    commands_1.$Gr.registerCommand('_workbench.getRecentlyOpened', async function (accessor) {
        const workspacesService = accessor.get(workspaces_1.$fU);
        return workspacesService.getRecentlyOpened();
    });
});
//# sourceMappingURL=workspaceCommands.js.map