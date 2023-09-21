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
define(["require", "exports", "vs/nls", "vs/platform/window/common/window", "vs/platform/dialogs/common/dialogs", "vs/platform/workspace/common/workspace", "vs/workbench/services/history/common/history", "vs/workbench/services/environment/common/environmentService", "vs/base/common/resources", "vs/base/common/path", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/dialogs/browser/simpleFileDialog", "vs/platform/workspaces/common/workspaces", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/workbench/services/host/browser/host", "vs/base/common/severity", "vs/base/common/arrays", "vs/base/common/strings", "vs/editor/common/languages/language", "vs/platform/label/common/label", "vs/workbench/services/path/common/pathService", "vs/base/common/network", "vs/editor/common/languages/modesRegistry", "vs/platform/commands/common/commands", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/editor/common/editorService", "vs/platform/editor/common/editor", "vs/platform/log/common/log"], function (require, exports, nls, window_1, dialogs_1, workspace_1, history_1, environmentService_1, resources, path_1, instantiation_1, simpleFileDialog_1, workspaces_1, configuration_1, files_1, opener_1, host_1, severity_1, arrays_1, strings_1, language_1, label_1, pathService_1, network_1, modesRegistry_1, commands_1, codeEditorService_1, editorService_1, editor_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractFileDialogService = void 0;
    let AbstractFileDialogService = class AbstractFileDialogService {
        constructor(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService) {
            this.hostService = hostService;
            this.contextService = contextService;
            this.historyService = historyService;
            this.environmentService = environmentService;
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.fileService = fileService;
            this.openerService = openerService;
            this.dialogService = dialogService;
            this.languageService = languageService;
            this.workspacesService = workspacesService;
            this.labelService = labelService;
            this.pathService = pathService;
            this.commandService = commandService;
            this.editorService = editorService;
            this.codeEditorService = codeEditorService;
            this.logService = logService;
        }
        async defaultFilePath(schemeFilter = this.getSchemeFilterForWindow()) {
            // Check for last active file first...
            let candidate = this.historyService.getLastActiveFile(schemeFilter);
            // ...then for last active file root
            if (!candidate) {
                candidate = this.historyService.getLastActiveWorkspaceRoot(schemeFilter);
            }
            else {
                candidate = resources.dirname(candidate);
            }
            if (!candidate) {
                candidate = await this.preferredHome(schemeFilter);
            }
            return candidate;
        }
        async defaultFolderPath(schemeFilter = this.getSchemeFilterForWindow()) {
            // Check for last active file root first...
            let candidate = this.historyService.getLastActiveWorkspaceRoot(schemeFilter);
            // ...then for last active file
            if (!candidate) {
                candidate = this.historyService.getLastActiveFile(schemeFilter);
            }
            if (!candidate) {
                return this.preferredHome(schemeFilter);
            }
            return resources.dirname(candidate);
        }
        async preferredHome(schemeFilter = this.getSchemeFilterForWindow()) {
            const preferLocal = schemeFilter === network_1.Schemas.file;
            const preferredHomeConfig = this.configurationService.inspect('files.dialog.defaultPath');
            const preferredHomeCandidate = preferLocal ? preferredHomeConfig.userLocalValue : preferredHomeConfig.userRemoteValue;
            if (preferredHomeCandidate) {
                const isPreferredHomeCandidateAbsolute = preferLocal ? (0, path_1.isAbsolute)(preferredHomeCandidate) : (await this.pathService.path).isAbsolute(preferredHomeCandidate);
                if (isPreferredHomeCandidateAbsolute) {
                    const preferredHomeNormalized = preferLocal ? (0, path_1.normalize)(preferredHomeCandidate) : (await this.pathService.path).normalize(preferredHomeCandidate);
                    const preferredHome = resources.toLocalResource(await this.pathService.fileURI(preferredHomeNormalized), this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
                    if (await this.fileService.exists(preferredHome)) {
                        return preferredHome;
                    }
                }
            }
            return this.pathService.userHome({ preferLocal });
        }
        async defaultWorkspacePath(schemeFilter = this.getSchemeFilterForWindow()) {
            let defaultWorkspacePath;
            // Check for current workspace config file first...
            if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                const configuration = this.contextService.getWorkspace().configuration;
                if (configuration?.scheme === schemeFilter && (0, workspace_1.isSavedWorkspace)(configuration, this.environmentService) && !(0, workspace_1.isTemporaryWorkspace)(configuration)) {
                    defaultWorkspacePath = resources.dirname(configuration);
                }
            }
            // ...then fallback to default file path
            if (!defaultWorkspacePath) {
                defaultWorkspacePath = await this.defaultFilePath(schemeFilter);
            }
            return defaultWorkspacePath;
        }
        async showSaveConfirm(fileNamesOrResources) {
            if (this.skipDialogs()) {
                this.logService.trace('FileDialogService: refused to show save confirmation dialog in tests.');
                // no veto when we are in extension dev testing mode because we cannot assume we run interactive
                return 1 /* ConfirmResult.DONT_SAVE */;
            }
            return this.doShowSaveConfirm(fileNamesOrResources);
        }
        skipDialogs() {
            if (this.environmentService.isExtensionDevelopment && this.environmentService.extensionTestsLocationURI) {
                return true; // integration tests
            }
            return !!this.environmentService.enableSmokeTestDriver; // smoke tests
        }
        async doShowSaveConfirm(fileNamesOrResources) {
            if (fileNamesOrResources.length === 0) {
                return 1 /* ConfirmResult.DONT_SAVE */;
            }
            let message;
            let detail = nls.localize('saveChangesDetail', "Your changes will be lost if you don't save them.");
            if (fileNamesOrResources.length === 1) {
                message = nls.localize('saveChangesMessage', "Do you want to save the changes you made to {0}?", typeof fileNamesOrResources[0] === 'string' ? fileNamesOrResources[0] : resources.basename(fileNamesOrResources[0]));
            }
            else {
                message = nls.localize('saveChangesMessages', "Do you want to save the changes to the following {0} files?", fileNamesOrResources.length);
                detail = (0, dialogs_1.getFileNamesMessage)(fileNamesOrResources) + '\n' + detail;
            }
            const { result } = await this.dialogService.prompt({
                type: severity_1.default.Warning,
                message,
                detail,
                buttons: [
                    {
                        label: fileNamesOrResources.length > 1 ?
                            nls.localize({ key: 'saveAll', comment: ['&& denotes a mnemonic'] }, "&&Save All") :
                            nls.localize({ key: 'save', comment: ['&& denotes a mnemonic'] }, "&&Save"),
                        run: () => 0 /* ConfirmResult.SAVE */
                    },
                    {
                        label: nls.localize({ key: 'dontSave', comment: ['&& denotes a mnemonic'] }, "Do&&n't Save"),
                        run: () => 1 /* ConfirmResult.DONT_SAVE */
                    }
                ],
                cancelButton: {
                    run: () => 2 /* ConfirmResult.CANCEL */
                }
            });
            return result;
        }
        addFileSchemaIfNeeded(schema, _isFolder) {
            return schema === network_1.Schemas.untitled ? [network_1.Schemas.file] : (schema !== network_1.Schemas.file ? [schema, network_1.Schemas.file] : [schema]);
        }
        async pickFileFolderAndOpenSimplified(schema, options, preferNewWindow) {
            const title = nls.localize('openFileOrFolder.title', 'Open File or Folder');
            const availableFileSystems = this.addFileSchemaIfNeeded(schema);
            const uri = await this.pickResource({ canSelectFiles: true, canSelectFolders: true, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
            if (uri) {
                const stat = await this.fileService.stat(uri);
                const toOpen = stat.isDirectory ? { folderUri: uri } : { fileUri: uri };
                if (!(0, window_1.isWorkspaceToOpen)(toOpen) && (0, window_1.isFileToOpen)(toOpen)) {
                    this.addFileToRecentlyOpened(toOpen.fileUri);
                }
                if (stat.isDirectory || options.forceNewWindow || preferNewWindow) {
                    await this.hostService.openWindow([toOpen], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
                }
                else {
                    await this.editorService.openEditors([{ resource: uri, options: { source: editor_1.EditorOpenSource.USER, pinned: true } }], undefined, { validateTrust: true });
                }
            }
        }
        async pickFileAndOpenSimplified(schema, options, preferNewWindow) {
            const title = nls.localize('openFile.title', 'Open File');
            const availableFileSystems = this.addFileSchemaIfNeeded(schema);
            const uri = await this.pickResource({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
            if (uri) {
                this.addFileToRecentlyOpened(uri);
                if (options.forceNewWindow || preferNewWindow) {
                    await this.hostService.openWindow([{ fileUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
                }
                else {
                    await this.editorService.openEditors([{ resource: uri, options: { source: editor_1.EditorOpenSource.USER, pinned: true } }], undefined, { validateTrust: true });
                }
            }
        }
        addFileToRecentlyOpened(uri) {
            this.workspacesService.addRecentlyOpened([{ fileUri: uri, label: this.labelService.getUriLabel(uri) }]);
        }
        async pickFolderAndOpenSimplified(schema, options) {
            const title = nls.localize('openFolder.title', 'Open Folder');
            const availableFileSystems = this.addFileSchemaIfNeeded(schema, true);
            const uri = await this.pickResource({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
            if (uri) {
                return this.hostService.openWindow([{ folderUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
            }
        }
        async pickWorkspaceAndOpenSimplified(schema, options) {
            const title = nls.localize('openWorkspace.title', 'Open Workspace from File');
            const filters = [{ name: nls.localize('filterName.workspace', 'Workspace'), extensions: [workspace_1.WORKSPACE_EXTENSION] }];
            const availableFileSystems = this.addFileSchemaIfNeeded(schema, true);
            const uri = await this.pickResource({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, defaultUri: options.defaultUri, title, filters, availableFileSystems });
            if (uri) {
                return this.hostService.openWindow([{ workspaceUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
            }
        }
        async pickFileToSaveSimplified(schema, options) {
            if (!options.availableFileSystems) {
                options.availableFileSystems = this.addFileSchemaIfNeeded(schema);
            }
            options.title = nls.localize('saveFileAs.title', 'Save As');
            const uri = await this.saveRemoteResource(options);
            if (uri) {
                this.addFileToRecentlyOpened(uri);
            }
            return uri;
        }
        async showSaveDialogSimplified(schema, options) {
            if (!options.availableFileSystems) {
                options.availableFileSystems = this.addFileSchemaIfNeeded(schema);
            }
            return this.saveRemoteResource(options);
        }
        async showOpenDialogSimplified(schema, options) {
            if (!options.availableFileSystems) {
                options.availableFileSystems = this.addFileSchemaIfNeeded(schema, options.canSelectFolders);
            }
            const uri = await this.pickResource(options);
            return uri ? [uri] : undefined;
        }
        getSimpleFileDialog() {
            return this.instantiationService.createInstance(simpleFileDialog_1.SimpleFileDialog);
        }
        pickResource(options) {
            return this.getSimpleFileDialog().showOpenDialog(options);
        }
        saveRemoteResource(options) {
            return this.getSimpleFileDialog().showSaveDialog(options);
        }
        getSchemeFilterForWindow(defaultUriScheme) {
            return defaultUriScheme ?? this.pathService.defaultUriScheme;
        }
        getFileSystemSchema(options) {
            return options.availableFileSystems && options.availableFileSystems[0] || this.getSchemeFilterForWindow(options.defaultUri?.scheme);
        }
        getWorkspaceAvailableFileSystems(options) {
            if (options.availableFileSystems && (options.availableFileSystems.length > 0)) {
                return options.availableFileSystems;
            }
            const availableFileSystems = [network_1.Schemas.file];
            if (this.environmentService.remoteAuthority) {
                availableFileSystems.unshift(network_1.Schemas.vscodeRemote);
            }
            return availableFileSystems;
        }
        getPickFileToSaveDialogOptions(defaultUri, availableFileSystems) {
            const options = {
                defaultUri,
                title: nls.localize('saveAsTitle', "Save As"),
                availableFileSystems
            };
            // Build the file filter by using our known languages
            const ext = defaultUri ? resources.extname(defaultUri) : undefined;
            let matchingFilter;
            const registeredLanguageNames = this.languageService.getSortedRegisteredLanguageNames();
            const registeredLanguageFilters = (0, arrays_1.coalesce)(registeredLanguageNames.map(({ languageName, languageId }) => {
                const extensions = this.languageService.getExtensions(languageId);
                if (!extensions.length) {
                    return null;
                }
                const filter = { name: languageName, extensions: (0, arrays_1.distinct)(extensions).slice(0, 10).map(e => (0, strings_1.trim)(e, '.')) };
                // https://github.com/microsoft/vscode/issues/115860
                const extOrPlaintext = ext || modesRegistry_1.PLAINTEXT_EXTENSION;
                if (!matchingFilter && extensions.includes(extOrPlaintext)) {
                    matchingFilter = filter;
                    // The selected extension must be in the set of extensions that are in the filter list that is sent to the save dialog.
                    // If it isn't, add it manually. https://github.com/microsoft/vscode/issues/147657
                    const trimmedExt = (0, strings_1.trim)(extOrPlaintext, '.');
                    if (!filter.extensions.includes(trimmedExt)) {
                        filter.extensions.unshift(trimmedExt);
                    }
                    return null; // first matching filter will be added to the top
                }
                return filter;
            }));
            // We have no matching filter, e.g. because the language
            // is unknown. We still add the extension to the list of
            // filters though so that it can be picked
            // (https://github.com/microsoft/vscode/issues/96283)
            if (!matchingFilter && ext) {
                matchingFilter = { name: (0, strings_1.trim)(ext, '.').toUpperCase(), extensions: [(0, strings_1.trim)(ext, '.')] };
            }
            // Order of filters is
            // - All Files (we MUST do this to fix macOS issue https://github.com/microsoft/vscode/issues/102713)
            // - File Extension Match (if any)
            // - All Languages
            // - No Extension
            options.filters = (0, arrays_1.coalesce)([
                { name: nls.localize('allFiles', "All Files"), extensions: ['*'] },
                matchingFilter,
                ...registeredLanguageFilters,
                { name: nls.localize('noExt', "No Extension"), extensions: [''] }
            ]);
            return options;
        }
    };
    exports.AbstractFileDialogService = AbstractFileDialogService;
    exports.AbstractFileDialogService = AbstractFileDialogService = __decorate([
        __param(0, host_1.IHostService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, history_1.IHistoryService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, files_1.IFileService),
        __param(7, opener_1.IOpenerService),
        __param(8, dialogs_1.IDialogService),
        __param(9, language_1.ILanguageService),
        __param(10, workspaces_1.IWorkspacesService),
        __param(11, label_1.ILabelService),
        __param(12, pathService_1.IPathService),
        __param(13, commands_1.ICommandService),
        __param(14, editorService_1.IEditorService),
        __param(15, codeEditorService_1.ICodeEditorService),
        __param(16, log_1.ILogService)
    ], AbstractFileDialogService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RGaWxlRGlhbG9nU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9kaWFsb2dzL2Jyb3dzZXIvYWJzdHJhY3RGaWxlRGlhbG9nU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQ3pGLElBQWUseUJBQXlCLEdBQXhDLE1BQWUseUJBQXlCO1FBSTlDLFlBQ2tDLFdBQXlCLEVBQ2IsY0FBd0MsRUFDakQsY0FBK0IsRUFDbEIsa0JBQWdELEVBQ3ZELG9CQUEyQyxFQUMzQyxvQkFBMkMsRUFDcEQsV0FBeUIsRUFDdkIsYUFBNkIsRUFDN0IsYUFBNkIsRUFDN0IsZUFBaUMsRUFDL0IsaUJBQXFDLEVBQzFDLFlBQTJCLEVBQzVCLFdBQXlCLEVBQ3BCLGNBQStCLEVBQ2hDLGFBQTZCLEVBQ3pCLGlCQUFxQyxFQUM5QyxVQUF1QjtZQWhCcEIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDYixtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDakQsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ2xCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBOEI7WUFDdkQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUMzQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3BELGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3ZCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUM3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDN0Isb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQy9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDMUMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDNUIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDcEIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ2hDLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN6QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQzlDLGVBQVUsR0FBVixVQUFVLENBQWE7UUFDbEQsQ0FBQztRQUVMLEtBQUssQ0FBQyxlQUFlLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRTtZQUVuRSxzQ0FBc0M7WUFDdEMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVwRSxvQ0FBb0M7WUFDcEMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDZixTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUN6RTtpQkFBTTtnQkFDTixTQUFTLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUN6QztZQUVELElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ2YsU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUNuRDtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxLQUFLLENBQUMsaUJBQWlCLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRTtZQUVyRSwyQ0FBMkM7WUFDM0MsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUU3RSwrQkFBK0I7WUFDL0IsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDZixTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUNoRTtZQUVELElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ2YsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ3hDO1lBRUQsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsd0JBQXdCLEVBQUU7WUFDakUsTUFBTSxXQUFXLEdBQUcsWUFBWSxLQUFLLGlCQUFPLENBQUMsSUFBSSxDQUFDO1lBQ2xELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBUywwQkFBMEIsQ0FBQyxDQUFDO1lBQ2xHLE1BQU0sc0JBQXNCLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQztZQUN0SCxJQUFJLHNCQUFzQixFQUFFO2dCQUMzQixNQUFNLGdDQUFnQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBQSxpQkFBbUIsRUFBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDdEssSUFBSSxnQ0FBZ0MsRUFBRTtvQkFDckMsTUFBTSx1QkFBdUIsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUEsZ0JBQWtCLEVBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUM7b0JBQzNKLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUNyTCxJQUFJLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUU7d0JBQ2pELE9BQU8sYUFBYSxDQUFDO3FCQUNyQjtpQkFDRDthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUVELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixFQUFFO1lBQ3hFLElBQUksb0JBQXFDLENBQUM7WUFFMUMsbURBQW1EO1lBQ25ELElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxxQ0FBNkIsRUFBRTtnQkFDekUsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxhQUFhLENBQUM7Z0JBQ3ZFLElBQUksYUFBYSxFQUFFLE1BQU0sS0FBSyxZQUFZLElBQUksSUFBQSw0QkFBZ0IsRUFBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFBLGdDQUFvQixFQUFDLGFBQWEsQ0FBQyxFQUFFO29CQUMvSSxvQkFBb0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2lCQUN4RDthQUNEO1lBRUQsd0NBQXdDO1lBQ3hDLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtnQkFDMUIsb0JBQW9CLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ2hFO1lBRUQsT0FBTyxvQkFBb0IsQ0FBQztRQUM3QixDQUFDO1FBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxvQkFBc0M7WUFDM0QsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLHVFQUF1RSxDQUFDLENBQUM7Z0JBRS9GLGdHQUFnRztnQkFDaEcsdUNBQStCO2FBQy9CO1lBRUQsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRU8sV0FBVztZQUNsQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxzQkFBc0IsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMseUJBQXlCLEVBQUU7Z0JBQ3hHLE9BQU8sSUFBSSxDQUFDLENBQUMsb0JBQW9CO2FBQ2pDO1lBRUQsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDLENBQUMsY0FBYztRQUN2RSxDQUFDO1FBRU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDLG9CQUFzQztZQUNyRSxJQUFJLG9CQUFvQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3RDLHVDQUErQjthQUMvQjtZQUVELElBQUksT0FBZSxDQUFDO1lBQ3BCLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsbURBQW1ELENBQUMsQ0FBQztZQUNwRyxJQUFJLG9CQUFvQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3RDLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLGtEQUFrRCxFQUFFLE9BQU8sb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdE47aUJBQU07Z0JBQ04sT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsNkRBQTZELEVBQUUsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzFJLE1BQU0sR0FBRyxJQUFBLDZCQUFtQixFQUFDLG9CQUFvQixDQUFDLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQzthQUNuRTtZQUVELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFnQjtnQkFDakUsSUFBSSxFQUFFLGtCQUFRLENBQUMsT0FBTztnQkFDdEIsT0FBTztnQkFDUCxNQUFNO2dCQUNOLE9BQU8sRUFBRTtvQkFDUjt3QkFDQyxLQUFLLEVBQUUsb0JBQW9CLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDOzRCQUN2QyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQzs0QkFDcEYsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQzt3QkFDNUUsR0FBRyxFQUFFLEdBQUcsRUFBRSwyQkFBbUI7cUJBQzdCO29CQUNEO3dCQUNDLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDO3dCQUM1RixHQUFHLEVBQUUsR0FBRyxFQUFFLGdDQUF3QjtxQkFDbEM7aUJBQ0Q7Z0JBQ0QsWUFBWSxFQUFFO29CQUNiLEdBQUcsRUFBRSxHQUFHLEVBQUUsNkJBQXFCO2lCQUMvQjthQUNELENBQUMsQ0FBQztZQUVILE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVTLHFCQUFxQixDQUFDLE1BQWMsRUFBRSxTQUFtQjtZQUNsRSxPQUFPLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3JILENBQUM7UUFFUyxLQUFLLENBQUMsK0JBQStCLENBQUMsTUFBYyxFQUFFLE9BQTRCLEVBQUUsZUFBd0I7WUFDckgsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1lBQzVFLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWhFLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixFQUFFLENBQUMsQ0FBQztZQUV6SyxJQUFJLEdBQUcsRUFBRTtnQkFDUixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUU5QyxNQUFNLE1BQU0sR0FBb0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUN6RixJQUFJLENBQUMsSUFBQSwwQkFBaUIsRUFBQyxNQUFNLENBQUMsSUFBSSxJQUFBLHFCQUFZLEVBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQ3ZELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQzdDO2dCQUVELElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsY0FBYyxJQUFJLGVBQWUsRUFBRTtvQkFDbEUsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO2lCQUNsSTtxQkFBTTtvQkFDTixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSx5QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztpQkFDeEo7YUFDRDtRQUNGLENBQUM7UUFFUyxLQUFLLENBQUMseUJBQXlCLENBQUMsTUFBYyxFQUFFLE9BQTRCLEVBQUUsZUFBd0I7WUFDL0csTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUMxRCxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVoRSxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxDQUFDLENBQUM7WUFDMUssSUFBSSxHQUFHLEVBQUU7Z0JBQ1IsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVsQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLElBQUksZUFBZSxFQUFFO29CQUM5QyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsY0FBYyxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztpQkFDNUk7cUJBQU07b0JBQ04sTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUseUJBQWdCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7aUJBQ3hKO2FBQ0Q7UUFDRixDQUFDO1FBRVMsdUJBQXVCLENBQUMsR0FBUTtZQUN6QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3pHLENBQUM7UUFFUyxLQUFLLENBQUMsMkJBQTJCLENBQUMsTUFBYyxFQUFFLE9BQTRCO1lBQ3ZGLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDOUQsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXRFLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixFQUFFLENBQUMsQ0FBQztZQUMxSyxJQUFJLEdBQUcsRUFBRTtnQkFDUixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsY0FBYyxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQzthQUMvSTtRQUNGLENBQUM7UUFFUyxLQUFLLENBQUMsOEJBQThCLENBQUMsTUFBYyxFQUFFLE9BQTRCO1lBQzFGLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztZQUM5RSxNQUFNLE9BQU8sR0FBaUIsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLFdBQVcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLCtCQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9ILE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUV0RSxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO1lBQ25MLElBQUksR0FBRyxFQUFFO2dCQUNSLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO2FBQ2xKO1FBQ0YsQ0FBQztRQUVTLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxNQUFjLEVBQUUsT0FBMkI7WUFDbkYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRTtnQkFDbEMsT0FBTyxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNsRTtZQUVELE9BQU8sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM1RCxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVuRCxJQUFJLEdBQUcsRUFBRTtnQkFDUixJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDbEM7WUFFRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFUyxLQUFLLENBQUMsd0JBQXdCLENBQUMsTUFBYyxFQUFFLE9BQTJCO1lBQ25GLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUU7Z0JBQ2xDLE9BQU8sQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbEU7WUFFRCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRVMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLE1BQWMsRUFBRSxPQUEyQjtZQUNuRixJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixFQUFFO2dCQUNsQyxPQUFPLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzthQUM1RjtZQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUU3QyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ2hDLENBQUM7UUFFUyxtQkFBbUI7WUFDNUIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLG1DQUFnQixDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVPLFlBQVksQ0FBQyxPQUEyQjtZQUMvQyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRU8sa0JBQWtCLENBQUMsT0FBMkI7WUFDckQsT0FBTyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVPLHdCQUF3QixDQUFDLGdCQUF5QjtZQUN6RCxPQUFPLGdCQUFnQixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUM7UUFDOUQsQ0FBQztRQUVTLG1CQUFtQixDQUFDLE9BQXVFO1lBQ3BHLE9BQU8sT0FBTyxDQUFDLG9CQUFvQixJQUFJLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNySSxDQUFDO1FBTVMsZ0NBQWdDLENBQUMsT0FBNEI7WUFDdEUsSUFBSSxPQUFPLENBQUMsb0JBQW9CLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUM5RSxPQUFPLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQzthQUNwQztZQUNELE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsRUFBRTtnQkFDNUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLGlCQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDbkQ7WUFDRCxPQUFPLG9CQUFvQixDQUFDO1FBQzdCLENBQUM7UUFNUyw4QkFBOEIsQ0FBQyxVQUFlLEVBQUUsb0JBQStCO1lBQ3hGLE1BQU0sT0FBTyxHQUF1QjtnQkFDbkMsVUFBVTtnQkFDVixLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDO2dCQUM3QyxvQkFBb0I7YUFDcEIsQ0FBQztZQUlGLHFEQUFxRDtZQUNyRCxNQUFNLEdBQUcsR0FBdUIsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDdkYsSUFBSSxjQUFtQyxDQUFDO1lBRXhDLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDO1lBQ3hGLE1BQU0seUJBQXlCLEdBQWMsSUFBQSxpQkFBUSxFQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUU7Z0JBQ2xILE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtvQkFDdkIsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBRUQsTUFBTSxNQUFNLEdBQVksRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxJQUFBLGlCQUFRLEVBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFBLGNBQUksRUFBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUVySCxvREFBb0Q7Z0JBQ3BELE1BQU0sY0FBYyxHQUFHLEdBQUcsSUFBSSxtQ0FBbUIsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLGNBQWMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFO29CQUMzRCxjQUFjLEdBQUcsTUFBTSxDQUFDO29CQUV4Qix1SEFBdUg7b0JBQ3ZILGtGQUFrRjtvQkFDbEYsTUFBTSxVQUFVLEdBQUcsSUFBQSxjQUFJLEVBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUM3QyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7d0JBQzVDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3FCQUN0QztvQkFFRCxPQUFPLElBQUksQ0FBQyxDQUFDLGlEQUFpRDtpQkFDOUQ7Z0JBRUQsT0FBTyxNQUFNLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosd0RBQXdEO1lBQ3hELHdEQUF3RDtZQUN4RCwwQ0FBMEM7WUFDMUMscURBQXFEO1lBQ3JELElBQUksQ0FBQyxjQUFjLElBQUksR0FBRyxFQUFFO2dCQUMzQixjQUFjLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBQSxjQUFJLEVBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLElBQUEsY0FBSSxFQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDdEY7WUFFRCxzQkFBc0I7WUFDdEIscUdBQXFHO1lBQ3JHLGtDQUFrQztZQUNsQyxrQkFBa0I7WUFDbEIsaUJBQWlCO1lBQ2pCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsSUFBQSxpQkFBUSxFQUFDO2dCQUMxQixFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbEUsY0FBYztnQkFDZCxHQUFHLHlCQUF5QjtnQkFDNUIsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7YUFDakUsQ0FBQyxDQUFDO1lBRUgsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztLQUNELENBQUE7SUFuV3FCLDhEQUF5Qjt3Q0FBekIseUJBQXlCO1FBSzVDLFdBQUEsbUJBQVksQ0FBQTtRQUNaLFdBQUEsb0NBQXdCLENBQUE7UUFDeEIsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSxpREFBNEIsQ0FBQTtRQUM1QixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSx1QkFBYyxDQUFBO1FBQ2QsV0FBQSx3QkFBYyxDQUFBO1FBQ2QsV0FBQSwyQkFBZ0IsQ0FBQTtRQUNoQixZQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFlBQUEscUJBQWEsQ0FBQTtRQUNiLFlBQUEsMEJBQVksQ0FBQTtRQUNaLFlBQUEsMEJBQWUsQ0FBQTtRQUNmLFlBQUEsOEJBQWMsQ0FBQTtRQUNkLFlBQUEsc0NBQWtCLENBQUE7UUFDbEIsWUFBQSxpQkFBVyxDQUFBO09BckJRLHlCQUF5QixDQW1XOUMifQ==