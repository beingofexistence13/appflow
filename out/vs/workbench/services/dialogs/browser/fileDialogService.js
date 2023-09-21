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
define(["require", "exports", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/workbench/services/dialogs/browser/abstractFileDialogService", "vs/base/common/network", "vs/base/common/decorators", "vs/nls", "vs/base/common/mime", "vs/base/common/resources", "vs/base/browser/dom", "vs/base/common/severity", "vs/base/common/buffer", "vs/platform/dnd/browser/dnd", "vs/base/common/iterator", "vs/platform/files/browser/webFileSystemAccess"], function (require, exports, dialogs_1, extensions_1, abstractFileDialogService_1, network_1, decorators_1, nls_1, mime_1, resources_1, dom_1, severity_1, buffer_1, dnd_1, iterator_1, webFileSystemAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileDialogService = void 0;
    class FileDialogService extends abstractFileDialogService_1.AbstractFileDialogService {
        get fileSystemProvider() {
            return this.fileService.getProvider(network_1.Schemas.file);
        }
        async pickFileFolderAndOpen(options) {
            const schema = this.getFileSystemSchema(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultFilePath(schema);
            }
            if (this.shouldUseSimplified(schema)) {
                return super.pickFileFolderAndOpenSimplified(schema, options, false);
            }
            throw new Error((0, nls_1.localize)('pickFolderAndOpen', "Can't open folders, try adding a folder to the workspace instead."));
        }
        addFileSchemaIfNeeded(schema, isFolder) {
            return (schema === network_1.Schemas.untitled) ? [network_1.Schemas.file]
                : (((schema !== network_1.Schemas.file) && (!isFolder || (schema !== network_1.Schemas.vscodeRemote))) ? [schema, network_1.Schemas.file] : [schema]);
        }
        async pickFileAndOpen(options) {
            const schema = this.getFileSystemSchema(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultFilePath(schema);
            }
            if (this.shouldUseSimplified(schema)) {
                return super.pickFileAndOpenSimplified(schema, options, false);
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.supported(window)) {
                return this.showUnsupportedBrowserWarning('open');
            }
            let fileHandle = undefined;
            try {
                ([fileHandle] = await window.showOpenFilePicker({ multiple: false }));
            }
            catch (error) {
                return; // `showOpenFilePicker` will throw an error when the user cancels
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(fileHandle)) {
                return;
            }
            const uri = await this.fileSystemProvider.registerFileHandle(fileHandle);
            this.addFileToRecentlyOpened(uri);
            await this.openerService.open(uri, { fromUserGesture: true, editorOptions: { pinned: true } });
        }
        async pickFolderAndOpen(options) {
            const schema = this.getFileSystemSchema(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultFolderPath(schema);
            }
            if (this.shouldUseSimplified(schema)) {
                return super.pickFolderAndOpenSimplified(schema, options);
            }
            throw new Error((0, nls_1.localize)('pickFolderAndOpen', "Can't open folders, try adding a folder to the workspace instead."));
        }
        async pickWorkspaceAndOpen(options) {
            options.availableFileSystems = this.getWorkspaceAvailableFileSystems(options);
            const schema = this.getFileSystemSchema(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultWorkspacePath(schema);
            }
            if (this.shouldUseSimplified(schema)) {
                return super.pickWorkspaceAndOpenSimplified(schema, options);
            }
            throw new Error((0, nls_1.localize)('pickWorkspaceAndOpen', "Can't open workspaces, try adding a folder to the workspace instead."));
        }
        async pickFileToSave(defaultUri, availableFileSystems) {
            const schema = this.getFileSystemSchema({ defaultUri, availableFileSystems });
            const options = this.getPickFileToSaveDialogOptions(defaultUri, availableFileSystems);
            if (this.shouldUseSimplified(schema)) {
                return super.pickFileToSaveSimplified(schema, options);
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.supported(window)) {
                return this.showUnsupportedBrowserWarning('save');
            }
            let fileHandle = undefined;
            const startIn = iterator_1.Iterable.first(this.fileSystemProvider.directories);
            try {
                fileHandle = await window.showSaveFilePicker({ types: this.getFilePickerTypes(options.filters), ...{ suggestedName: (0, resources_1.basename)(defaultUri), startIn } });
            }
            catch (error) {
                return; // `showSaveFilePicker` will throw an error when the user cancels
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(fileHandle)) {
                return undefined;
            }
            return this.fileSystemProvider.registerFileHandle(fileHandle);
        }
        getFilePickerTypes(filters) {
            return filters?.filter(filter => {
                return !((filter.extensions.length === 1) && ((filter.extensions[0] === '*') || filter.extensions[0] === ''));
            }).map(filter => {
                const accept = {};
                const extensions = filter.extensions.filter(ext => (ext.indexOf('-') < 0) && (ext.indexOf('*') < 0) && (ext.indexOf('_') < 0));
                accept[(0, mime_1.getMediaOrTextMime)(`fileName.${filter.extensions[0]}`) ?? 'text/plain'] = extensions.map(ext => ext.startsWith('.') ? ext : `.${ext}`);
                return {
                    description: filter.name,
                    accept
                };
            });
        }
        async showSaveDialog(options) {
            const schema = this.getFileSystemSchema(options);
            if (this.shouldUseSimplified(schema)) {
                return super.showSaveDialogSimplified(schema, options);
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.supported(window)) {
                return this.showUnsupportedBrowserWarning('save');
            }
            let fileHandle = undefined;
            const startIn = iterator_1.Iterable.first(this.fileSystemProvider.directories);
            try {
                fileHandle = await window.showSaveFilePicker({ types: this.getFilePickerTypes(options.filters), ...options.defaultUri ? { suggestedName: (0, resources_1.basename)(options.defaultUri) } : undefined, ...{ startIn } });
            }
            catch (error) {
                return undefined; // `showSaveFilePicker` will throw an error when the user cancels
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(fileHandle)) {
                return undefined;
            }
            return this.fileSystemProvider.registerFileHandle(fileHandle);
        }
        async showOpenDialog(options) {
            const schema = this.getFileSystemSchema(options);
            if (this.shouldUseSimplified(schema)) {
                return super.showOpenDialogSimplified(schema, options);
            }
            if (!webFileSystemAccess_1.WebFileSystemAccess.supported(window)) {
                return this.showUnsupportedBrowserWarning('open');
            }
            let uri;
            const startIn = iterator_1.Iterable.first(this.fileSystemProvider.directories) ?? 'documents';
            try {
                if (options.canSelectFiles) {
                    const handle = await window.showOpenFilePicker({ multiple: false, types: this.getFilePickerTypes(options.filters), ...{ startIn } });
                    if (handle.length === 1 && webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(handle[0])) {
                        uri = await this.fileSystemProvider.registerFileHandle(handle[0]);
                    }
                }
                else {
                    const handle = await window.showDirectoryPicker({ ...{ startIn } });
                    uri = await this.fileSystemProvider.registerDirectoryHandle(handle);
                }
            }
            catch (error) {
                // ignore - `showOpenFilePicker` / `showDirectoryPicker` will throw an error when the user cancels
            }
            return uri ? [uri] : undefined;
        }
        async showUnsupportedBrowserWarning(context) {
            // When saving, try to just download the contents
            // of the active text editor if any as a workaround
            if (context === 'save') {
                const activeTextModel = this.codeEditorService.getActiveCodeEditor()?.getModel();
                if (activeTextModel) {
                    (0, dom_1.triggerDownload)(buffer_1.VSBuffer.fromString(activeTextModel.getValue()).buffer, (0, resources_1.basename)(activeTextModel.uri));
                    return;
                }
            }
            // Otherwise inform the user about options
            const buttons = [
                {
                    label: (0, nls_1.localize)({ key: 'openRemote', comment: ['&& denotes a mnemonic'] }, "&&Open Remote..."),
                    run: async () => { await this.commandService.executeCommand('workbench.action.remote.showMenu'); }
                },
                {
                    label: (0, nls_1.localize)({ key: 'learnMore', comment: ['&& denotes a mnemonic'] }, "&&Learn More"),
                    run: async () => { await this.openerService.open('https://aka.ms/VSCodeWebLocalFileSystemAccess'); }
                }
            ];
            if (context === 'open') {
                buttons.push({
                    label: (0, nls_1.localize)({ key: 'openFiles', comment: ['&& denotes a mnemonic'] }, "Open &&Files..."),
                    run: async () => {
                        const files = await (0, dom_1.triggerUpload)();
                        if (files) {
                            const filesData = (await this.instantiationService.invokeFunction(accessor => (0, dnd_1.extractFileListData)(accessor, files))).filter(fileData => !fileData.isDirectory);
                            if (filesData.length > 0) {
                                this.editorService.openEditors(filesData.map(fileData => {
                                    return {
                                        resource: fileData.resource,
                                        contents: fileData.contents?.toString(),
                                        options: { pinned: true }
                                    };
                                }));
                            }
                        }
                    }
                });
            }
            await this.dialogService.prompt({
                type: severity_1.default.Warning,
                message: (0, nls_1.localize)('unsupportedBrowserMessage', "Opening Local Folders is Unsupported"),
                detail: (0, nls_1.localize)('unsupportedBrowserDetail', "Your browser doesn't support opening local folders.\nYou can either open single files or open a remote repository."),
                buttons
            });
            return undefined;
        }
        shouldUseSimplified(scheme) {
            return ![network_1.Schemas.file, network_1.Schemas.vscodeUserData, network_1.Schemas.tmp].includes(scheme);
        }
    }
    exports.FileDialogService = FileDialogService;
    __decorate([
        decorators_1.memoize
    ], FileDialogService.prototype, "fileSystemProvider", null);
    (0, extensions_1.registerSingleton)(dialogs_1.IFileDialogService, FileDialogService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZURpYWxvZ1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZGlhbG9ncy9icm93c2VyL2ZpbGVEaWFsb2dTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7OztJQW1CaEcsTUFBYSxpQkFBa0IsU0FBUSxxREFBeUI7UUFHL0QsSUFBWSxrQkFBa0I7WUFDN0IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxpQkFBTyxDQUFDLElBQUksQ0FBMkIsQ0FBQztRQUM3RSxDQUFDO1FBRUQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLE9BQTRCO1lBQ3ZELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVqRCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtnQkFDeEIsT0FBTyxDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDeEQ7WUFFRCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDckMsT0FBTyxLQUFLLENBQUMsK0JBQStCLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNyRTtZQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxjQUFRLEVBQUMsbUJBQW1CLEVBQUUsbUVBQW1FLENBQUMsQ0FBQyxDQUFDO1FBQ3JILENBQUM7UUFFa0IscUJBQXFCLENBQUMsTUFBYyxFQUFFLFFBQWlCO1lBQ3pFLE9BQU8sQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBTyxDQUFDLElBQUksQ0FBQztnQkFDcEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1B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