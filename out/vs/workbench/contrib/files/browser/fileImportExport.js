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
define(["require", "exports", "vs/nls", "vs/base/common/cancellation", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/workbench/contrib/files/browser/files", "vs/workbench/contrib/files/common/files", "vs/workbench/services/editor/common/editorService", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/resources", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/uri", "vs/workbench/services/host/browser/host", "vs/platform/workspace/common/workspace", "vs/platform/dnd/browser/dnd", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/base/common/platform", "vs/base/browser/dom", "vs/platform/log/common/log", "vs/base/common/network", "vs/base/common/labels", "vs/base/common/stream", "vs/base/common/lifecycle", "vs/base/common/functional", "vs/base/common/arrays", "vs/base/common/errors", "vs/platform/configuration/common/configuration", "vs/platform/files/browser/webFileSystemAccess", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage"], function (require, exports, nls_1, cancellation_1, dialogs_1, files_1, notification_1, progress_1, files_2, files_3, editorService_1, async_1, buffer_1, resources_1, bulkEditService_1, explorerModel_1, uri_1, host_1, workspace_1, dnd_1, workspaceEditing_1, platform_1, dom_1, log_1, network_1, labels_1, stream_1, lifecycle_1, functional_1, arrays_1, errors_1, configuration_1, webFileSystemAccess_1, instantiation_1, storage_1) {
    "use strict";
    var BrowserFileUpload_1, FileDownload_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMultipleFilesOverwriteConfirm = exports.getFileOverwriteConfirm = exports.FileDownload = exports.ExternalFileImport = exports.BrowserFileUpload = void 0;
    let BrowserFileUpload = class BrowserFileUpload {
        static { BrowserFileUpload_1 = this; }
        static { this.MAX_PARALLEL_UPLOADS = 20; }
        constructor(progressService, dialogService, explorerService, editorService, fileService) {
            this.progressService = progressService;
            this.dialogService = dialogService;
            this.explorerService = explorerService;
            this.editorService = editorService;
            this.fileService = fileService;
        }
        upload(target, source) {
            const cts = new cancellation_1.CancellationTokenSource();
            // Indicate progress globally
            const uploadPromise = this.progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                delay: 800,
                cancellable: true,
                title: (0, nls_1.localize)('uploadingFiles', "Uploading")
            }, async (progress) => this.doUpload(target, this.toTransfer(source), progress, cts.token), () => cts.dispose(true));
            // Also indicate progress in the files view
            this.progressService.withProgress({ location: files_3.VIEW_ID, delay: 500 }, () => uploadPromise);
            return uploadPromise;
        }
        toTransfer(source) {
            if (source instanceof DragEvent) {
                return source.dataTransfer;
            }
            const transfer = { items: [] };
            // We want to reuse the same code for uploading from
            // Drag & Drop as well as input element based upload
            // so we convert into webkit data transfer when the
            // input element approach is used (simplified).
            for (const file of source) {
                transfer.items.push({
                    webkitGetAsEntry: () => {
                        return {
                            name: file.name,
                            isDirectory: false,
                            isFile: true,
                            createReader: () => { throw new Error('Unsupported for files'); },
                            file: resolve => resolve(file)
                        };
                    }
                });
            }
            return transfer;
        }
        async doUpload(target, source, progress, token) {
            const items = source.items;
            // Somehow the items thing is being modified at random, maybe as a security
            // measure since this is a DND operation. As such, we copy the items into
            // an array we own as early as possible before using it.
            const entries = [];
            for (const item of items) {
                entries.push(item.webkitGetAsEntry());
            }
            const results = [];
            const operation = {
                startTime: Date.now(),
                progressScheduler: new async_1.RunOnceWorker(steps => { progress.report(steps[steps.length - 1]); }, 1000),
                filesTotal: entries.length,
                filesUploaded: 0,
                totalBytesUploaded: 0
            };
            // Upload all entries in parallel up to a
            // certain maximum leveraging the `Limiter`
            const uploadLimiter = new async_1.Limiter(BrowserFileUpload_1.MAX_PARALLEL_UPLOADS);
            await async_1.Promises.settled(entries.map(entry => {
                return uploadLimiter.queue(async () => {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    // Confirm overwrite as needed
                    if (target && entry.name && target.getChild(entry.name)) {
                        const { confirmed } = await this.dialogService.confirm(getFileOverwriteConfirm(entry.name));
                        if (!confirmed) {
                            return;
                        }
                        await this.explorerService.applyBulkEdit([new bulkEditService_1.ResourceFileEdit((0, resources_1.joinPath)(target.resource, entry.name), undefined, { recursive: true, folder: target.getChild(entry.name)?.isDirectory })], {
                            undoLabel: (0, nls_1.localize)('overwrite', "Overwrite {0}", entry.name),
                            progressLabel: (0, nls_1.localize)('overwriting', "Overwriting {0}", entry.name),
                        });
                        if (token.isCancellationRequested) {
                            return;
                        }
                    }
                    // Upload entry
                    const result = await this.doUploadEntry(entry, target.resource, target, progress, operation, token);
                    if (result) {
                        results.push(result);
                    }
                });
            }));
            operation.progressScheduler.dispose();
            // Open uploaded file in editor only if we upload just one
            const firstUploadedFile = results[0];
            if (!token.isCancellationRequested && firstUploadedFile?.isFile) {
                await this.editorService.openEditor({ resource: firstUploadedFile.resource, options: { pinned: true } });
            }
        }
        async doUploadEntry(entry, parentResource, target, progress, operation, token) {
            if (token.isCancellationRequested || !entry.name || (!entry.isFile && !entry.isDirectory)) {
                return undefined;
            }
            // Report progress
            let fileBytesUploaded = 0;
            const reportProgress = (fileSize, bytesUploaded) => {
                fileBytesUploaded += bytesUploaded;
                operation.totalBytesUploaded += bytesUploaded;
                const bytesUploadedPerSecond = operation.totalBytesUploaded / ((Date.now() - operation.startTime) / 1000);
                // Small file
                let message;
                if (fileSize < files_1.ByteSize.MB) {
                    if (operation.filesTotal === 1) {
                        message = `${entry.name}`;
                    }
                    else {
                        message = (0, nls_1.localize)('uploadProgressSmallMany', "{0} of {1} files ({2}/s)", operation.filesUploaded, operation.filesTotal, files_1.ByteSize.formatSize(bytesUploadedPerSecond));
                    }
                }
                // Large file
                else {
                    message = (0, nls_1.localize)('uploadProgressLarge', "{0} ({1} of {2}, {3}/s)", entry.name, files_1.ByteSize.formatSize(fileBytesUploaded), files_1.ByteSize.formatSize(fileSize), files_1.ByteSize.formatSize(bytesUploadedPerSecond));
                }
                // Report progress but limit to update only once per second
                operation.progressScheduler.work({ message });
            };
            operation.filesUploaded++;
            reportProgress(0, 0);
            // Handle file upload
            const resource = (0, resources_1.joinPath)(parentResource, entry.name);
            if (entry.isFile) {
                const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
                if (token.isCancellationRequested) {
                    return undefined;
                }
                // Chrome/Edge/Firefox support stream method, but only use it for
                // larger files to reduce the overhead of the streaming approach
                if (typeof file.stream === 'function' && file.size > files_1.ByteSize.MB) {
                    await this.doUploadFileBuffered(resource, file, reportProgress, token);
                }
                // Fallback to unbuffered upload for other browsers or small files
                else {
                    await this.doUploadFileUnbuffered(resource, file, reportProgress);
                }
                return { isFile: true, resource };
            }
            // Handle folder upload
            else {
                // Create target folder
                await this.fileService.createFolder(resource);
                if (token.isCancellationRequested) {
                    return undefined;
                }
                // Recursive upload files in this directory
                const dirReader = entry.createReader();
                const childEntries = [];
                let done = false;
                do {
                    const childEntriesChunk = await new Promise((resolve, reject) => dirReader.readEntries(resolve, reject));
                    if (childEntriesChunk.length > 0) {
                        childEntries.push(...childEntriesChunk);
                    }
                    else {
                        done = true; // an empty array is a signal that all entries have been read
                    }
                } while (!done && !token.isCancellationRequested);
                // Update operation total based on new counts
                operation.filesTotal += childEntries.length;
                // Split up files from folders to upload
                const folderTarget = target && target.getChild(entry.name) || undefined;
                const fileChildEntries = [];
                const folderChildEntries = [];
                for (const childEntry of childEntries) {
                    if (childEntry.isFile) {
                        fileChildEntries.push(childEntry);
                    }
                    else if (childEntry.isDirectory) {
                        folderChildEntries.push(childEntry);
                    }
                }
                // Upload files (up to `MAX_PARALLEL_UPLOADS` in parallel)
                const fileUploadQueue = new async_1.Limiter(BrowserFileUpload_1.MAX_PARALLEL_UPLOADS);
                await async_1.Promises.settled(fileChildEntries.map(fileChildEntry => {
                    return fileUploadQueue.queue(() => this.doUploadEntry(fileChildEntry, resource, folderTarget, progress, operation, token));
                }));
                // Upload folders (sequentially give we don't know their sizes)
                for (const folderChildEntry of folderChildEntries) {
                    await this.doUploadEntry(folderChildEntry, resource, folderTarget, progress, operation, token);
                }
                return { isFile: false, resource };
            }
        }
        async doUploadFileBuffered(resource, file, progressReporter, token) {
            const writeableStream = (0, buffer_1.newWriteableBufferStream)({
                // Set a highWaterMark to prevent the stream
                // for file upload to produce large buffers
                // in-memory
                highWaterMark: 10
            });
            const writeFilePromise = this.fileService.writeFile(resource, writeableStream);
            // Read the file in chunks using File.stream() web APIs
            try {
                const reader = file.stream().getReader();
                let res = await reader.read();
                while (!res.done) {
                    if (token.isCancellationRequested) {
                        break;
                    }
                    // Write buffer into stream but make sure to wait
                    // in case the `highWaterMark` is reached
                    const buffer = buffer_1.VSBuffer.wrap(res.value);
                    await writeableStream.write(buffer);
                    if (token.isCancellationRequested) {
                        break;
                    }
                    // Report progress
                    progressReporter(file.size, buffer.byteLength);
                    res = await reader.read();
                }
                writeableStream.end(undefined);
            }
            catch (error) {
                writeableStream.error(error);
                writeableStream.end();
            }
            if (token.isCancellationRequested) {
                return undefined;
            }
            // Wait for file being written to target
            await writeFilePromise;
        }
        doUploadFileUnbuffered(resource, file, progressReporter) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        if (event.target?.result instanceof ArrayBuffer) {
                            const buffer = buffer_1.VSBuffer.wrap(new Uint8Array(event.target.result));
                            await this.fileService.writeFile(resource, buffer);
                            // Report progress
                            progressReporter(file.size, buffer.byteLength);
                        }
                        else {
                            throw new Error('Could not read from dropped file.');
                        }
                        resolve();
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                // Start reading the file to trigger `onload`
                reader.readAsArrayBuffer(file);
            });
        }
    };
    exports.BrowserFileUpload = BrowserFileUpload;
    exports.BrowserFileUpload = BrowserFileUpload = BrowserFileUpload_1 = __decorate([
        __param(0, progress_1.IProgressService),
        __param(1, dialogs_1.IDialogService),
        __param(2, files_2.IExplorerService),
        __param(3, editorService_1.IEditorService),
        __param(4, files_1.IFileService)
    ], BrowserFileUpload);
    //#endregion
    //#region External File Import (drag and drop)
    let ExternalFileImport = class ExternalFileImport {
        constructor(fileService, hostService, contextService, configurationService, dialogService, workspaceEditingService, explorerService, editorService, progressService, notificationService, instantiationService) {
            this.fileService = fileService;
            this.hostService = hostService;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.dialogService = dialogService;
            this.workspaceEditingService = workspaceEditingService;
            this.explorerService = explorerService;
            this.editorService = editorService;
            this.progressService = progressService;
            this.notificationService = notificationService;
            this.instantiationService = instantiationService;
        }
        async import(target, source) {
            const cts = new cancellation_1.CancellationTokenSource();
            // Indicate progress globally
            const importPromise = this.progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                delay: 800,
                cancellable: true,
                title: (0, nls_1.localize)('copyingFiles', "Copying...")
            }, async () => await this.doImport(target, source, cts.token), () => cts.dispose(true));
            // Also indicate progress in the files view
            this.progressService.withProgress({ location: files_3.VIEW_ID, delay: 500 }, () => importPromise);
            return importPromise;
        }
        async doImport(target, source, token) {
            // Activate all providers for the resources dropped
            const candidateFiles = (0, arrays_1.coalesce)((await this.instantiationService.invokeFunction(accessor => (0, dnd_1.extractEditorsAndFilesDropData)(accessor, source))).map(editor => editor.resource));
            await Promise.all(candidateFiles.map(resource => this.fileService.activateProvider(resource.scheme)));
            // Check for dropped external files to be folders
            const files = (0, arrays_1.coalesce)(candidateFiles.filter(resource => this.fileService.hasProvider(resource)));
            const resolvedFiles = await this.fileService.resolveAll(files.map(file => ({ resource: file })));
            if (token.isCancellationRequested) {
                return;
            }
            // Pass focus to window
            this.hostService.focus();
            // Handle folders by adding to workspace if we are in workspace context and if dropped on top
            const folders = resolvedFiles.filter(resolvedFile => resolvedFile.success && resolvedFile.stat?.isDirectory).map(resolvedFile => ({ uri: resolvedFile.stat.resource }));
            if (folders.length > 0 && target.isRoot) {
                let ImportChoice;
                (function (ImportChoice) {
                    ImportChoice[ImportChoice["Copy"] = 1] = "Copy";
                    ImportChoice[ImportChoice["Add"] = 2] = "Add";
                })(ImportChoice || (ImportChoice = {}));
                const buttons = [
                    {
                        label: folders.length > 1 ?
                            (0, nls_1.localize)('copyFolders', "&&Copy Folders") :
                            (0, nls_1.localize)('copyFolder', "&&Copy Folder"),
                        run: () => ImportChoice.Copy
                    }
                ];
                let message;
                // We only allow to add a folder to the workspace if there is already a workspace folder with that scheme
                const workspaceFolderSchemas = this.contextService.getWorkspace().folders.map(folder => folder.uri.scheme);
                if (folders.some(folder => workspaceFolderSchemas.indexOf(folder.uri.scheme) >= 0)) {
                    buttons.unshift({
                        label: folders.length > 1 ?
                            (0, nls_1.localize)('addFolders', "&&Add Folders to Workspace") :
                            (0, nls_1.localize)('addFolder', "&&Add Folder to Workspace"),
                        run: () => ImportChoice.Add
                    });
                    message = folders.length > 1 ?
                        (0, nls_1.localize)('dropFolders', "Do you want to copy the folders or add the folders to the workspace?") :
                        (0, nls_1.localize)('dropFolder', "Do you want to copy '{0}' or add '{0}' as a folder to the workspace?", (0, resources_1.basename)(folders[0].uri));
                }
                else {
                    message = folders.length > 1 ?
                        (0, nls_1.localize)('copyfolders', "Are you sure to want to copy folders?") :
                        (0, nls_1.localize)('copyfolder', "Are you sure to want to copy '{0}'?", (0, resources_1.basename)(folders[0].uri));
                }
                const { result } = await this.dialogService.prompt({
                    type: notification_1.Severity.Info,
                    message,
                    buttons,
                    cancelButton: true
                });
                // Add folders
                if (result === ImportChoice.Add) {
                    return this.workspaceEditingService.addFolders(folders);
                }
                // Copy resources
                if (result === ImportChoice.Copy) {
                    return this.importResources(target, files, token);
                }
            }
            // Handle dropped files (only support FileStat as target)
            else if (target instanceof explorerModel_1.ExplorerItem) {
                return this.importResources(target, files, token);
            }
        }
        async importResources(target, resources, token) {
            if (resources && resources.length > 0) {
                // Resolve target to check for name collisions and ask user
                const targetStat = await this.fileService.resolve(target.resource);
                if (token.isCancellationRequested) {
                    return;
                }
                // Check for name collisions
                const targetNames = new Set();
                const caseSensitive = this.fileService.hasCapability(target.resource, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
                if (targetStat.children) {
                    targetStat.children.forEach(child => {
                        targetNames.add(caseSensitive ? child.name : child.name.toLowerCase());
                    });
                }
                let inaccessibleFileCount = 0;
                const resourcesFiltered = (0, arrays_1.coalesce)((await async_1.Promises.settled(resources.map(async (resource) => {
                    const fileDoesNotExist = !(await this.fileService.exists(resource));
                    if (fileDoesNotExist) {
                        inaccessibleFileCount++;
                        return undefined;
                    }
                    if (targetNames.has(caseSensitive ? (0, resources_1.basename)(resource) : (0, resources_1.basename)(resource).toLowerCase())) {
                        const confirmationResult = await this.dialogService.confirm(getFileOverwriteConfirm((0, resources_1.basename)(resource)));
                        if (!confirmationResult.confirmed) {
                            return undefined;
                        }
                    }
                    return resource;
                }))));
                if (inaccessibleFileCount > 0) {
                    this.notificationService.error(inaccessibleFileCount > 1 ? (0, nls_1.localize)('filesInaccessible', "Some or all of the dropped files could not be accessed for import.") : (0, nls_1.localize)('fileInaccessible', "The dropped file could not be accessed for import."));
                }
                // Copy resources through bulk edit API
                const resourceFileEdits = resourcesFiltered.map(resource => {
                    const sourceFileName = (0, resources_1.basename)(resource);
                    const targetFile = (0, resources_1.joinPath)(target.resource, sourceFileName);
                    return new bulkEditService_1.ResourceFileEdit(resource, targetFile, { overwrite: true, copy: true });
                });
                const undoLevel = this.configurationService.getValue().explorer.confirmUndo;
                await this.explorerService.applyBulkEdit(resourceFileEdits, {
                    undoLabel: resourcesFiltered.length === 1 ?
                        (0, nls_1.localize)({ comment: ['substitution will be the name of the file that was imported'], key: 'importFile' }, "Import {0}", (0, resources_1.basename)(resourcesFiltered[0])) :
                        (0, nls_1.localize)({ comment: ['substitution will be the number of files that were imported'], key: 'importnFile' }, "Import {0} resources", resourcesFiltered.length),
                    progressLabel: resourcesFiltered.length === 1 ?
                        (0, nls_1.localize)({ comment: ['substitution will be the name of the file that was copied'], key: 'copyingFile' }, "Copying {0}", (0, resources_1.basename)(resourcesFiltered[0])) :
                        (0, nls_1.localize)({ comment: ['substitution will be the number of files that were copied'], key: 'copyingnFile' }, "Copying {0} resources", resourcesFiltered.length),
                    progressLocation: 10 /* ProgressLocation.Window */,
                    confirmBeforeUndo: undoLevel === "verbose" /* UndoConfirmLevel.Verbose */ || undoLevel === "default" /* UndoConfirmLevel.Default */,
                });
                // if we only add one file, just open it directly
                if (resourceFileEdits.length === 1) {
                    const item = this.explorerService.findClosest(resourceFileEdits[0].newResource);
                    if (item && !item.isDirectory) {
                        this.editorService.openEditor({ resource: item.resource, options: { pinned: true } });
                    }
                }
            }
        }
    };
    exports.ExternalFileImport = ExternalFileImport;
    exports.ExternalFileImport = ExternalFileImport = __decorate([
        __param(0, files_1.IFileService),
        __param(1, host_1.IHostService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, dialogs_1.IDialogService),
        __param(5, workspaceEditing_1.IWorkspaceEditingService),
        __param(6, files_2.IExplorerService),
        __param(7, editorService_1.IEditorService),
        __param(8, progress_1.IProgressService),
        __param(9, notification_1.INotificationService),
        __param(10, instantiation_1.IInstantiationService)
    ], ExternalFileImport);
    let FileDownload = class FileDownload {
        static { FileDownload_1 = this; }
        static { this.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY = 'workbench.explorer.downloadPath'; }
        constructor(fileService, explorerService, progressService, logService, fileDialogService, storageService) {
            this.fileService = fileService;
            this.explorerService = explorerService;
            this.progressService = progressService;
            this.logService = logService;
            this.fileDialogService = fileDialogService;
            this.storageService = storageService;
        }
        download(source) {
            const cts = new cancellation_1.CancellationTokenSource();
            // Indicate progress globally
            const downloadPromise = this.progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                delay: 800,
                cancellable: platform_1.isWeb,
                title: (0, nls_1.localize)('downloadingFiles', "Downloading")
            }, async (progress) => this.doDownload(source, progress, cts), () => cts.dispose(true));
            // Also indicate progress in the files view
            this.progressService.withProgress({ location: files_3.VIEW_ID, delay: 500 }, () => downloadPromise);
            return downloadPromise;
        }
        async doDownload(sources, progress, cts) {
            for (const source of sources) {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // Web: use DOM APIs to download files with optional support
                // for folders and large files
                if (platform_1.isWeb) {
                    await this.doDownloadBrowser(source.resource, progress, cts);
                }
                // Native: use working copy file service to get at the contents
                else {
                    await this.doDownloadNative(source, progress, cts);
                }
            }
        }
        async doDownloadBrowser(resource, progress, cts) {
            const stat = await this.fileService.resolve(resource, { resolveMetadata: true });
            if (cts.token.isCancellationRequested) {
                return;
            }
            const maxBlobDownloadSize = 32 * files_1.ByteSize.MB; // avoid to download via blob-trick >32MB to avoid memory pressure
            const preferFileSystemAccessWebApis = stat.isDirectory || stat.size > maxBlobDownloadSize;
            // Folder: use FS APIs to download files and folders if available and preferred
            if (preferFileSystemAccessWebApis && webFileSystemAccess_1.WebFileSystemAccess.supported(window)) {
                try {
                    const parentFolder = await window.showDirectoryPicker();
                    const operation = {
                        startTime: Date.now(),
                        progressScheduler: new async_1.RunOnceWorker(steps => { progress.report(steps[steps.length - 1]); }, 1000),
                        filesTotal: stat.isDirectory ? 0 : 1,
                        filesDownloaded: 0,
                        totalBytesDownloaded: 0,
                        fileBytesDownloaded: 0
                    };
                    if (stat.isDirectory) {
                        const targetFolder = await parentFolder.getDirectoryHandle(stat.name, { create: true });
                        await this.downloadFolderBrowser(stat, targetFolder, operation, cts.token);
                    }
                    else {
                        await this.downloadFileBrowser(parentFolder, stat, operation, cts.token);
                    }
                    operation.progressScheduler.dispose();
                }
                catch (error) {
                    this.logService.warn(error);
                    cts.cancel(); // `showDirectoryPicker` will throw an error when the user cancels
                }
            }
            // File: use traditional download to circumvent browser limitations
            else if (stat.isFile) {
                let bufferOrUri;
                try {
                    bufferOrUri = (await this.fileService.readFile(stat.resource, { limits: { size: maxBlobDownloadSize } }, cts.token)).value.buffer;
                }
                catch (error) {
                    bufferOrUri = network_1.FileAccess.uriToBrowserUri(stat.resource);
                }
                if (!cts.token.isCancellationRequested) {
                    (0, dom_1.triggerDownload)(bufferOrUri, stat.name);
                }
            }
        }
        async downloadFileBufferedBrowser(resource, target, operation, token) {
            const contents = await this.fileService.readFileStream(resource, undefined, token);
            if (token.isCancellationRequested) {
                target.close();
                return;
            }
            return new Promise((resolve, reject) => {
                const sourceStream = contents.value;
                const disposables = new lifecycle_1.DisposableStore();
                disposables.add((0, lifecycle_1.toDisposable)(() => target.close()));
                disposables.add((0, functional_1.once)(token.onCancellationRequested)(() => {
                    disposables.dispose();
                    reject((0, errors_1.canceled)());
                }));
                (0, stream_1.listenStream)(sourceStream, {
                    onData: data => {
                        target.write(data.buffer);
                        this.reportProgress(contents.name, contents.size, data.byteLength, operation);
                    },
                    onError: error => {
                        disposables.dispose();
                        reject(error);
                    },
                    onEnd: () => {
                        disposables.dispose();
                        resolve();
                    }
                }, token);
            });
        }
        async downloadFileUnbufferedBrowser(resource, target, operation, token) {
            const contents = await this.fileService.readFile(resource, undefined, token);
            if (!token.isCancellationRequested) {
                target.write(contents.value.buffer);
                this.reportProgress(contents.name, contents.size, contents.value.byteLength, operation);
            }
            target.close();
        }
        async downloadFileBrowser(targetFolder, file, operation, token) {
            // Report progress
            operation.filesDownloaded++;
            operation.fileBytesDownloaded = 0; // reset for this file
            this.reportProgress(file.name, 0, 0, operation);
            // Start to download
            const targetFile = await targetFolder.getFileHandle(file.name, { create: true });
            const targetFileWriter = await targetFile.createWritable();
            // For large files, write buffered using streams
            if (file.size > files_1.ByteSize.MB) {
                return this.downloadFileBufferedBrowser(file.resource, targetFileWriter, operation, token);
            }
            // For small files prefer to write unbuffered to reduce overhead
            return this.downloadFileUnbufferedBrowser(file.resource, targetFileWriter, operation, token);
        }
        async downloadFolderBrowser(folder, targetFolder, operation, token) {
            if (folder.children) {
                operation.filesTotal += (folder.children.map(child => child.isFile)).length;
                for (const child of folder.children) {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    if (child.isFile) {
                        await this.downloadFileBrowser(targetFolder, child, operation, token);
                    }
                    else {
                        const childFolder = await targetFolder.getDirectoryHandle(child.name, { create: true });
                        const resolvedChildFolder = await this.fileService.resolve(child.resource, { resolveMetadata: true });
                        await this.downloadFolderBrowser(resolvedChildFolder, childFolder, operation, token);
                    }
                }
            }
        }
        reportProgress(name, fileSize, bytesDownloaded, operation) {
            operation.fileBytesDownloaded += bytesDownloaded;
            operation.totalBytesDownloaded += bytesDownloaded;
            const bytesDownloadedPerSecond = operation.totalBytesDownloaded / ((Date.now() - operation.startTime) / 1000);
            // Small file
            let message;
            if (fileSize < files_1.ByteSize.MB) {
                if (operation.filesTotal === 1) {
                    message = name;
                }
                else {
                    message = (0, nls_1.localize)('downloadProgressSmallMany', "{0} of {1} files ({2}/s)", operation.filesDownloaded, operation.filesTotal, files_1.ByteSize.formatSize(bytesDownloadedPerSecond));
                }
            }
            // Large file
            else {
                message = (0, nls_1.localize)('downloadProgressLarge', "{0} ({1} of {2}, {3}/s)", name, files_1.ByteSize.formatSize(operation.fileBytesDownloaded), files_1.ByteSize.formatSize(fileSize), files_1.ByteSize.formatSize(bytesDownloadedPerSecond));
            }
            // Report progress but limit to update only once per second
            operation.progressScheduler.work({ message });
        }
        async doDownloadNative(explorerItem, progress, cts) {
            progress.report({ message: explorerItem.name });
            let defaultUri;
            const lastUsedDownloadPath = this.storageService.get(FileDownload_1.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
            if (lastUsedDownloadPath) {
                defaultUri = (0, resources_1.joinPath)(uri_1.URI.file(lastUsedDownloadPath), explorerItem.name);
            }
            else {
                defaultUri = (0, resources_1.joinPath)(explorerItem.isDirectory ?
                    await this.fileDialogService.defaultFolderPath(network_1.Schemas.file) :
                    await this.fileDialogService.defaultFilePath(network_1.Schemas.file), explorerItem.name);
            }
            const destination = await this.fileDialogService.showSaveDialog({
                availableFileSystems: [network_1.Schemas.file],
                saveLabel: (0, labels_1.mnemonicButtonLabel)((0, nls_1.localize)('downloadButton', "Download")),
                title: (0, nls_1.localize)('chooseWhereToDownload', "Choose Where to Download"),
                defaultUri
            });
            if (destination) {
                // Remember as last used download folder
                this.storageService.store(FileDownload_1.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY, (0, resources_1.dirname)(destination).fsPath, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                // Perform download
                await this.explorerService.applyBulkEdit([new bulkEditService_1.ResourceFileEdit(explorerItem.resource, destination, { overwrite: true, copy: true })], {
                    undoLabel: (0, nls_1.localize)('downloadBulkEdit', "Download {0}", explorerItem.name),
                    progressLabel: (0, nls_1.localize)('downloadingBulkEdit', "Downloading {0}", explorerItem.name),
                    progressLocation: 10 /* ProgressLocation.Window */
                });
            }
            else {
                cts.cancel(); // User canceled a download. In case there were multiple files selected we should cancel the remainder of the prompts #86100
            }
        }
    };
    exports.FileDownload = FileDownload;
    exports.FileDownload = FileDownload = FileDownload_1 = __decorate([
        __param(0, files_1.IFileService),
        __param(1, files_2.IExplorerService),
        __param(2, progress_1.IProgressService),
        __param(3, log_1.ILogService),
        __param(4, dialogs_1.IFileDialogService),
        __param(5, storage_1.IStorageService)
    ], FileDownload);
    //#endregion
    //#region Helpers
    function getFileOverwriteConfirm(name) {
        return {
            message: (0, nls_1.localize)('confirmOverwrite', "A file or folder with the name '{0}' already exists in the destination folder. Do you want to replace it?", name),
            detail: (0, nls_1.localize)('irreversible', "This action is irreversible!"),
            primaryButton: (0, nls_1.localize)({ key: 'replaceButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
            type: 'warning'
        };
    }
    exports.getFileOverwriteConfirm = getFileOverwriteConfirm;
    function getMultipleFilesOverwriteConfirm(files) {
        if (files.length > 1) {
            return {
                message: (0, nls_1.localize)('confirmManyOverwrites', "The following {0} files and/or folders already exist in the destination folder. Do you want to replace them?", files.length),
                detail: (0, dialogs_1.getFileNamesMessage)(files) + '\n' + (0, nls_1.localize)('irreversible', "This action is irreversible!"),
                primaryButton: (0, nls_1.localize)({ key: 'replaceButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
                type: 'warning'
            };
        }
        return getFileOverwriteConfirm((0, resources_1.basename)(files[0]));
    }
    exports.getMultipleFilesOverwriteConfirm = getMultipleFilesOverwriteConfirm;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUltcG9ydEV4cG9ydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2ZpbGVzL2Jyb3dzZXIvZmlsZUltcG9ydEV4cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcUV6RixJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFpQjs7aUJBRUwseUJBQW9CLEdBQUcsRUFBRSxBQUFMLENBQU07UUFFbEQsWUFDb0MsZUFBaUMsRUFDbkMsYUFBNkIsRUFDM0IsZUFBaUMsRUFDbkMsYUFBNkIsRUFDL0IsV0FBeUI7WUFKckIsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQ25DLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUMzQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDbkMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQy9CLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1FBRXpELENBQUM7UUFFRCxNQUFNLENBQUMsTUFBb0IsRUFBRSxNQUE0QjtZQUN4RCxNQUFNLEdBQUcsR0FBRyxJQUFJLHNDQUF1QixFQUFFLENBQUM7WUFFMUMsNkJBQTZCO1lBQzdCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUN0RDtnQkFDQyxRQUFRLGtDQUF5QjtnQkFDakMsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsV0FBVyxFQUFFLElBQUk7Z0JBQ2pCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQUM7YUFDOUMsRUFDRCxLQUFLLEVBQUMsUUFBUSxFQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQ3JGLEdBQUcsRUFB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