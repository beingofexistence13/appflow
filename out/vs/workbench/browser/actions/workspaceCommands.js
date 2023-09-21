/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/workspace/common/workspace", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/base/common/resources", "vs/base/common/cancellation", "vs/base/common/labels", "vs/platform/commands/common/commands", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/dialogs/common/dialogs", "vs/base/common/uri", "vs/base/common/network", "vs/platform/workspaces/common/workspaces", "vs/workbench/services/path/common/pathService"], function (require, exports, nls_1, workspace_1, workspaceEditing_1, resources_1, cancellation_1, labels_1, commands_1, files_1, label_1, quickInput_1, getIconClasses_1, model_1, language_1, dialogs_1, uri_1, network_1, workspaces_1, pathService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PICK_WORKSPACE_FOLDER_COMMAND_ID = exports.SET_ROOT_FOLDER_COMMAND_ID = exports.ADD_ROOT_FOLDER_LABEL = exports.ADD_ROOT_FOLDER_COMMAND_ID = void 0;
    exports.ADD_ROOT_FOLDER_COMMAND_ID = 'addRootFolder';
    exports.ADD_ROOT_FOLDER_LABEL = { value: (0, nls_1.localize)('addFolderToWorkspace', "Add Folder to Workspace..."), original: 'Add Folder to Workspace...' };
    exports.SET_ROOT_FOLDER_COMMAND_ID = 'setRootFolder';
    exports.PICK_WORKSPACE_FOLDER_COMMAND_ID = '_workbench.pickWorkspaceFolder';
    // Command registration
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.action.files.openFileFolderInNewWindow',
        handler: (accessor) => accessor.get(dialogs_1.IFileDialogService).pickFileFolderAndOpen({ forceNewWindow: true })
    });
    commands_1.CommandsRegistry.registerCommand({
        id: '_files.pickFolderAndOpen',
        handler: (accessor, options) => accessor.get(dialogs_1.IFileDialogService).pickFolderAndOpen(options)
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.action.files.openFolderInNewWindow',
        handler: (accessor) => accessor.get(dialogs_1.IFileDialogService).pickFolderAndOpen({ forceNewWindow: true })
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.action.files.openFileInNewWindow',
        handler: (accessor) => accessor.get(dialogs_1.IFileDialogService).pickFileAndOpen({ forceNewWindow: true })
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.action.openWorkspaceInNewWindow',
        handler: (accessor) => accessor.get(dialogs_1.IFileDialogService).pickWorkspaceAndOpen({ forceNewWindow: true })
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.ADD_ROOT_FOLDER_COMMAND_ID,
        handler: async (accessor) => {
            const workspaceEditingService = accessor.get(workspaceEditing_1.IWorkspaceEditingService);
            const folders = await selectWorkspaceFolders(accessor);
            if (!folders || !folders.length) {
                return;
            }
            await workspaceEditingService.addFolders(folders.map(folder => ({ uri: folder })));
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SET_ROOT_FOLDER_COMMAND_ID,
        handler: async (accessor) => {
            const workspaceEditingService = accessor.get(workspaceEditing_1.IWorkspaceEditingService);
            const contextService = accessor.get(workspace_1.IWorkspaceContextService);
            const folders = await selectWorkspaceFolders(accessor);
            if (!folders || !folders.length) {
                return;
            }
            await workspaceEditingService.updateFolders(0, contextService.getWorkspace().folders.length, folders.map(folder => ({ uri: folder })));
        }
    });
    async function selectWorkspaceFolders(accessor) {
        const dialogsService = accessor.get(dialogs_1.IFileDialogService);
        const pathService = accessor.get(pathService_1.IPathService);
        const folders = await dialogsService.showOpenDialog({
            openLabel: (0, labels_1.mnemonicButtonLabel)((0, nls_1.localize)({ key: 'add', comment: ['&& denotes a mnemonic'] }, "&&Add")),
            title: (0, nls_1.localize)('addFolderToWorkspaceTitle', "Add Folder to Workspace"),
            canSelectFolders: true,
            canSelectMany: true,
            defaultUri: await dialogsService.defaultFolderPath(),
            availableFileSystems: [pathService.defaultUriScheme]
        });
        return folders;
    }
    commands_1.CommandsRegistry.registerCommand(exports.PICK_WORKSPACE_FOLDER_COMMAND_ID, async function (accessor, args) {
        const quickInputService = accessor.get(quickInput_1.IQuickInputService);
        const labelService = accessor.get(label_1.ILabelService);
        const contextService = accessor.get(workspace_1.IWorkspaceContextService);
        const modelService = accessor.get(model_1.IModelService);
        const languageService = accessor.get(language_1.ILanguageService);
        const folders = contextService.getWorkspace().folders;
        if (!folders.length) {
            return;
        }
        const folderPicks = folders.map(folder => {
            const label = folder.name;
            const description = labelService.getUriLabel((0, resources_1.dirname)(folder.uri), { relative: true });
            return {
                label,
                description: description !== label ? description : undefined,
                folder,
                iconClasses: (0, getIconClasses_1.getIconClasses)(modelService, languageService, folder.uri, files_1.FileKind.ROOT_FOLDER)
            };
        });
        const options = (args ? args[0] : undefined) || Object.create(null);
        if (!options.activeItem) {
            options.activeItem = folderPicks[0];
        }
        if (!options.placeHolder) {
            options.placeHolder = (0, nls_1.localize)('workspaceFolderPickerPlaceholder', "Select workspace folder");
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
    commands_1.CommandsRegistry.registerCommand({
        id: 'vscode.openFolder',
        handler: (accessor, uriComponents, arg) => {
            const commandService = accessor.get(commands_1.ICommandService);
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
            const uriToOpen = ((0, workspace_1.hasWorkspaceFileExtension)(uri) || uri.scheme === network_1.Schemas.untitled) ? { workspaceUri: uri } : { folderUri: uri };
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
    commands_1.CommandsRegistry.registerCommand({
        id: 'vscode.newWindow',
        handler: (accessor, options) => {
            const commandService = accessor.get(commands_1.ICommandService);
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
    commands_1.CommandsRegistry.registerCommand('_workbench.removeFromRecentlyOpened', function (accessor, uri) {
        const workspacesService = accessor.get(workspaces_1.IWorkspacesService);
        return workspacesService.removeRecentlyOpened([uri]);
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'vscode.removeFromRecentlyOpened',
        handler: (accessor, path) => {
            const workspacesService = accessor.get(workspaces_1.IWorkspacesService);
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
    commands_1.CommandsRegistry.registerCommand('_workbench.addToRecentlyOpened', async function (accessor, recentEntry) {
        const workspacesService = accessor.get(workspaces_1.IWorkspacesService);
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
    commands_1.CommandsRegistry.registerCommand('_workbench.getRecentlyOpened', async function (accessor) {
        const workspacesService = accessor.get(workspaces_1.IWorkspacesService);
        return workspacesService.getRecentlyOpened();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlQ29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9hY3Rpb25zL3dvcmtzcGFjZUNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXdCbkYsUUFBQSwwQkFBMEIsR0FBRyxlQUFlLENBQUM7SUFDN0MsUUFBQSxxQkFBcUIsR0FBcUIsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsc0JBQXNCLEVBQUUsNEJBQTRCLENBQUMsRUFBRSxRQUFRLEVBQUUsNEJBQTRCLEVBQUUsQ0FBQztJQUU1SixRQUFBLDBCQUEwQixHQUFHLGVBQWUsQ0FBQztJQUU3QyxRQUFBLGdDQUFnQyxHQUFHLGdDQUFnQyxDQUFDO0lBRWpGLHVCQUF1QjtJQUV2QiwyQkFBZ0IsQ0FBQyxlQUFlLENBQUM7UUFDaEMsRUFBRSxFQUFFLGtEQUFrRDtRQUN0RCxPQUFPLEVBQUUsQ0FBQyxRQUEwQixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLDRCQUFrQixDQUFDLENBQUMscUJBQXFCLENBQUMsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUM7S0FDekgsQ0FBQyxDQUFDO0lBRUgsMkJBQWdCLENBQUMsZUFBZSxDQUFDO1FBQ2hDLEVBQUUsRUFBRSwwQkFBMEI7UUFDOUIsT0FBTyxFQUFFLENBQUMsUUFBMEIsRUFBRSxPQUFvQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLDRCQUFrQixDQUFDLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDO0tBQzFJLENBQUMsQ0FBQztJQUVILDJCQUFnQixDQUFDLGVBQWUsQ0FBQztRQUNoQyxFQUFFLEVBQUUsOENBQThDO1FBQ2xELE9BQU8sRUFBRSxDQUFDLFFBQTBCLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsNEJB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