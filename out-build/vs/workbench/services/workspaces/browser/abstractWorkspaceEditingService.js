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
define(["require", "exports", "vs/nls!vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/jsonEditing", "vs/platform/workspaces/common/workspaces", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/commands/common/commands", "vs/base/common/arrays", "vs/base/common/resources", "vs/platform/notification/common/notification", "vs/platform/files/common/files", "vs/workbench/services/environment/common/environmentService", "vs/platform/dialogs/common/dialogs", "vs/base/common/labels", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/host/browser/host", "vs/base/common/network", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/configuration/common/configuration", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, nls_1, workspace_1, jsonEditing_1, workspaces_1, configurationRegistry_1, platform_1, commands_1, arrays_1, resources_1, notification_1, files_1, environmentService_1, dialogs_1, labels_1, textfiles_1, host_1, network_1, uriIdentity_1, workspaceTrust_1, configuration_1, userDataProfile_1, userDataProfile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$83b = void 0;
    let $83b = class $83b {
        constructor(a, b, c, d, f, g, h, i, j, k, l, m, n, o, p, q) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
        }
        async pickNewWorkspacePath() {
            const availableFileSystems = [network_1.Schemas.file];
            if (this.j.remoteAuthority) {
                availableFileSystems.unshift(network_1.Schemas.vscodeRemote);
            }
            let workspacePath = await this.k.showSaveDialog({
                saveLabel: (0, labels_1.$lA)((0, nls_1.localize)(0, null)),
                title: (0, nls_1.localize)(1, null),
                filters: workspace_1.$Zh,
                defaultUri: (0, resources_1.$ig)(await this.k.defaultWorkspacePath(), this.r()),
                availableFileSystems
            });
            if (!workspacePath) {
                return; // canceled
            }
            if (!(0, workspace_1.$7h)(workspacePath)) {
                // Always ensure we have workspace file extension
                // (see https://github.com/microsoft/vscode/issues/84818)
                workspacePath = workspacePath.with({ path: `${workspacePath.path}.${workspace_1.$Xh}` });
            }
            return workspacePath;
        }
        r() {
            // First try with existing workspace name
            const configPathURI = this.E()?.configPath;
            if (configPathURI && (0, workspace_1.$6h)(configPathURI, this.j)) {
                return (0, resources_1.$fg)(configPathURI);
            }
            // Then fallback to first folder if any
            const folder = (0, arrays_1.$Mb)(this.b.getWorkspace().folders);
            if (folder) {
                return `${(0, resources_1.$fg)(folder.uri)}.${workspace_1.$Xh}`;
            }
            // Finally pick a good default
            return `workspace.${workspace_1.$Xh}`;
        }
        async updateFolders(index, deleteCount, foldersToAddCandidates, donotNotifyError) {
            const folders = this.b.getWorkspace().folders;
            let foldersToDelete = [];
            if (typeof deleteCount === 'number') {
                foldersToDelete = folders.slice(index, index + deleteCount).map(folder => folder.uri);
            }
            let foldersToAdd = [];
            if (Array.isArray(foldersToAddCandidates)) {
                foldersToAdd = foldersToAddCandidates.map(folderToAdd => ({ uri: (0, resources_1.$pg)(folderToAdd.uri), name: folderToAdd.name })); // Normalize
            }
            const wantsToDelete = foldersToDelete.length > 0;
            const wantsToAdd = foldersToAdd.length > 0;
            if (!wantsToAdd && !wantsToDelete) {
                return; // return early if there is nothing to do
            }
            // Add Folders
            if (wantsToAdd && !wantsToDelete) {
                return this.t(foldersToAdd, index, donotNotifyError);
            }
            // Delete Folders
            if (wantsToDelete && !wantsToAdd) {
                return this.removeFolders(foldersToDelete);
            }
            // Add & Delete Folders
            else {
                // if we are in single-folder state and the folder is replaced with
                // other folders, we handle this specially and just enter workspace
                // mode with the folders that are being added.
                if (this.u(foldersToDelete)) {
                    return this.createAndEnterWorkspace(foldersToAdd);
                }
                // if we are not in workspace-state, we just add the folders
                if (this.b.getWorkbenchState() !== 3 /* WorkbenchState.WORKSPACE */) {
                    return this.t(foldersToAdd, index, donotNotifyError);
                }
                // finally, update folders within the workspace
                return this.s(foldersToAdd, foldersToDelete, index, donotNotifyError);
            }
        }
        async s(foldersToAdd, foldersToDelete, index, donotNotifyError = false) {
            try {
                await this.b.updateFolders(foldersToAdd, foldersToDelete, index);
            }
            catch (error) {
                if (donotNotifyError) {
                    throw error;
                }
                this.x(error);
            }
        }
        addFolders(foldersToAddCandidates, donotNotifyError = false) {
            // Normalize
            const foldersToAdd = foldersToAddCandidates.map(folderToAdd => ({ uri: (0, resources_1.$pg)(folderToAdd.uri), name: folderToAdd.name }));
            return this.t(foldersToAdd, undefined, donotNotifyError);
        }
        async t(foldersToAdd, index, donotNotifyError = false) {
            const state = this.b.getWorkbenchState();
            const remoteAuthority = this.j.remoteAuthority;
            if (remoteAuthority) {
                // https://github.com/microsoft/vscode/issues/94191
                foldersToAdd = foldersToAdd.filter(folder => folder.uri.scheme !== network_1.Schemas.file && (folder.uri.scheme !== network_1.Schemas.vscodeRemote || (0, resources_1.$ng)(folder.uri.authority, remoteAuthority)));
            }
            // If we are in no-workspace or single-folder workspace, adding folders has to
            // enter a workspace.
            if (state !== 3 /* WorkbenchState.WORKSPACE */) {
                let newWorkspaceFolders = this.b.getWorkspace().folders.map(folder => ({ uri: folder.uri }));
                newWorkspaceFolders.splice(typeof index === 'number' ? index : newWorkspaceFolders.length, 0, ...foldersToAdd);
                newWorkspaceFolders = (0, arrays_1.$Kb)(newWorkspaceFolders, folder => this.n.extUri.getComparisonKey(folder.uri));
                if (state === 1 /* WorkbenchState.EMPTY */ && newWorkspaceFolders.length === 0 || state === 2 /* WorkbenchState.FOLDER */ && newWorkspaceFolders.length === 1) {
                    return; // return if the operation is a no-op for the current state
                }
                return this.createAndEnterWorkspace(newWorkspaceFolders);
            }
            // Delegate addition of folders to workspace service otherwise
            try {
                await this.b.addFolders(foldersToAdd, index);
            }
            catch (error) {
                if (donotNotifyError) {
                    throw error;
                }
                this.x(error);
            }
        }
        async removeFolders(foldersToRemove, donotNotifyError = false) {
            // If we are in single-folder state and the opened folder is to be removed,
            // we create an empty workspace and enter it.
            if (this.u(foldersToRemove)) {
                return this.createAndEnterWorkspace([]);
            }
            // Delegate removal of folders to workspace service otherwise
            try {
                await this.b.removeFolders(foldersToRemove);
            }
            catch (error) {
                if (donotNotifyError) {
                    throw error;
                }
                this.x(error);
            }
        }
        u(folders) {
            if (this.b.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                const workspaceFolder = this.b.getWorkspace().folders[0];
                return (folders.some(folder => this.n.extUri.isEqual(folder, workspaceFolder.uri)));
            }
            return false;
        }
        async createAndEnterWorkspace(folders, path) {
            if (path && !await this.isValidTargetWorkspacePath(path)) {
                return;
            }
            const remoteAuthority = this.j.remoteAuthority;
            const untitledWorkspace = await this.i.createUntitledWorkspace(folders, remoteAuthority);
            if (path) {
                try {
                    await this.v(untitledWorkspace, path);
                }
                finally {
                    await this.i.deleteUntitledWorkspace(untitledWorkspace); // https://github.com/microsoft/vscode/issues/100276
                }
            }
            else {
                path = untitledWorkspace.configPath;
                if (!this.q.currentProfile.isDefault) {
                    await this.p.setProfileForWorkspace(untitledWorkspace, this.q.currentProfile);
                }
            }
            return this.enterWorkspace(path);
        }
        async saveAndEnterWorkspace(workspaceUri) {
            const workspaceIdentifier = this.E();
            if (!workspaceIdentifier) {
                return;
            }
            // Allow to save the workspace of the current window
            // if we have an identical match on the path
            if ((0, resources_1.$bg)(workspaceIdentifier.configPath, workspaceUri)) {
                return this.w(workspaceIdentifier);
            }
            // From this moment on we require a valid target that is not opened already
            if (!await this.isValidTargetWorkspacePath(workspaceUri)) {
                return;
            }
            await this.v(workspaceIdentifier, workspaceUri);
            return this.enterWorkspace(workspaceUri);
        }
        async isValidTargetWorkspacePath(workspaceUri) {
            return true; // OK
        }
        async v(workspace, targetConfigPathURI) {
            const configPathURI = workspace.configPath;
            const isNotUntitledWorkspace = !(0, workspace_1.$2h)(targetConfigPathURI, this.j);
            if (isNotUntitledWorkspace && !this.q.currentProfile.isDefault) {
                const newWorkspace = await this.i.getWorkspaceIdentifier(targetConfigPathURI);
                await this.p.setProfileForWorkspace(newWorkspace, this.q.currentProfile);
            }
            // Return early if target is same as source
            if (this.n.extUri.isEqual(configPathURI, targetConfigPathURI)) {
                return;
            }
            const isFromUntitledWorkspace = (0, workspace_1.$2h)(configPathURI, this.j);
            // Read the contents of the workspace file, update it to new location and save it.
            const raw = await this.g.readFile(configPathURI);
            const newRawWorkspaceContents = (0, workspaces_1.$mU)(raw.value.toString(), configPathURI, isFromUntitledWorkspace, targetConfigPathURI, this.n.extUri);
            await this.h.create([{ resource: targetConfigPathURI, value: newRawWorkspaceContents, options: { overwrite: true } }]);
            // Set trust for the workspace file
            await this.D(targetConfigPathURI);
        }
        async w(workspace) {
            const configPathURI = workspace.configPath;
            // First: try to save any existing model as it could be dirty
            const existingModel = this.h.files.get(configPathURI);
            if (existingModel) {
                await existingModel.save({ force: true, reason: 1 /* SaveReason.EXPLICIT */ });
                return;
            }
            // Second: if the file exists on disk, simply return
            const workspaceFileExists = await this.g.exists(configPathURI);
            if (workspaceFileExists) {
                return;
            }
            // Finally, we need to re-create the file as it was deleted
            const newWorkspace = { folders: [] };
            const newRawWorkspaceContents = (0, workspaces_1.$mU)(JSON.stringify(newWorkspace, null, '\t'), configPathURI, false, configPathURI, this.n.extUri);
            await this.h.create([{ resource: configPathURI, value: newRawWorkspaceContents }]);
        }
        x(error) {
            switch (error.code) {
                case 0 /* JSONEditingErrorCode.ERROR_INVALID_FILE */:
                    this.y();
                    break;
                default:
                    this.d.error(error.message);
            }
        }
        y() {
            const message = (0, nls_1.localize)(2, null);
            this.z(message);
        }
        z(message) {
            this.d.prompt(notification_1.Severity.Error, message, [{
                    label: (0, nls_1.localize)(3, null),
                    run: () => this.f.executeCommand('workbench.action.openWorkspaceConfigFile')
                }]);
        }
        async A(workspaceUri) {
            if (!!this.j.extensionTestsLocationURI) {
                throw new Error('Entering a new workspace is not possible in tests.');
            }
            const workspace = await this.i.getWorkspaceIdentifier(workspaceUri);
            // Settings migration (only if we come from a folder workspace)
            if (this.b.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                await this.B(workspace);
            }
            await this.c.initialize(workspace);
            return this.i.enterWorkspace(workspaceUri);
        }
        B(toWorkspace) {
            return this.C(toWorkspace, setting => setting.scope === 3 /* ConfigurationScope.WINDOW */);
        }
        copyWorkspaceSettings(toWorkspace) {
            return this.C(toWorkspace);
        }
        C(toWorkspace, filter) {
            const configurationProperties = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
            const targetWorkspaceConfiguration = {};
            for (const key of this.c.keys().workspace) {
                if (configurationProperties[key]) {
                    if (filter && !filter(configurationProperties[key])) {
                        continue;
                    }
                    targetWorkspaceConfiguration[key] = this.c.inspect(key).workspaceValue;
                }
            }
            return this.a.write(toWorkspace.configPath, [{ path: ['settings'], value: targetWorkspaceConfiguration }], true);
        }
        async D(configPathURI) {
            if (this.b.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ && this.o.isWorkspaceTrusted()) {
                await this.o.setUrisTrust([configPathURI], true);
            }
        }
        E() {
            const identifier = (0, workspace_1.$Ph)(this.b.getWorkspace());
            if ((0, workspace_1.$Qh)(identifier)) {
                return identifier;
            }
            return undefined;
        }
    };
    exports.$83b = $83b;
    exports.$83b = $83b = __decorate([
        __param(0, jsonEditing_1.$$fb),
        __param(1, workspace_1.$Kh),
        __param(2, configuration_1.$mE),
        __param(3, notification_1.$Yu),
        __param(4, commands_1.$Fr),
        __param(5, files_1.$6j),
        __param(6, textfiles_1.$JD),
        __param(7, workspaces_1.$fU),
        __param(8, environmentService_1.$hJ),
        __param(9, dialogs_1.$qA),
        __param(10, dialogs_1.$oA),
        __param(11, host_1.$VT),
        __param(12, uriIdentity_1.$Ck),
        __param(13, workspaceTrust_1.$$z),
        __param(14, userDataProfile_1.$Ek),
        __param(15, userDataProfile_2.$CJ)
    ], $83b);
});
//# sourceMappingURL=abstractWorkspaceEditingService.js.map