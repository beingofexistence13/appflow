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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/fileImportExport", "vs/base/common/cancellation", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/workbench/contrib/files/browser/files", "vs/workbench/contrib/files/common/files", "vs/workbench/services/editor/common/editorService", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/resources", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/uri", "vs/workbench/services/host/browser/host", "vs/platform/workspace/common/workspace", "vs/platform/dnd/browser/dnd", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/base/common/platform", "vs/base/browser/dom", "vs/platform/log/common/log", "vs/base/common/network", "vs/base/common/labels", "vs/base/common/stream", "vs/base/common/lifecycle", "vs/base/common/functional", "vs/base/common/arrays", "vs/base/common/errors", "vs/platform/configuration/common/configuration", "vs/platform/files/browser/webFileSystemAccess", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage"], function (require, exports, nls_1, cancellation_1, dialogs_1, files_1, notification_1, progress_1, files_2, files_3, editorService_1, async_1, buffer_1, resources_1, bulkEditService_1, explorerModel_1, uri_1, host_1, workspace_1, dnd_1, workspaceEditing_1, platform_1, dom_1, log_1, network_1, labels_1, stream_1, lifecycle_1, functional_1, arrays_1, errors_1, configuration_1, webFileSystemAccess_1, instantiation_1, storage_1) {
    "use strict";
    var $BHb_1, $DHb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FHb = exports.$EHb = exports.$DHb = exports.$CHb = exports.$BHb = void 0;
    let $BHb = class $BHb {
        static { $BHb_1 = this; }
        static { this.a = 20; }
        constructor(b, c, d, e, f) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
        }
        upload(target, source) {
            const cts = new cancellation_1.$pd();
            // Indicate progress globally
            const uploadPromise = this.b.withProgress({
                location: 10 /* ProgressLocation.Window */,
                delay: 800,
                cancellable: true,
                title: (0, nls_1.localize)(0, null)
            }, async (progress) => this.h(target, this.g(source), progress, cts.token), () => cts.dispose(true));
            // Also indicate progress in the files view
            this.b.withProgress({ location: files_3.$Ndb, delay: 500 }, () => uploadPromise);
            return uploadPromise;
        }
        g(source) {
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
        async h(target, source, progress, token) {
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
                progressScheduler: new async_1.$Ug(steps => { progress.report(steps[steps.length - 1]); }, 1000),
                filesTotal: entries.length,
                filesUploaded: 0,
                totalBytesUploaded: 0
            };
            // Upload all entries in parallel up to a
            // certain maximum leveraging the `Limiter`
            const uploadLimiter = new async_1.$Mg($BHb_1.a);
            await async_1.Promises.settled(entries.map(entry => {
                return uploadLimiter.queue(async () => {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    // Confirm overwrite as needed
                    if (target && entry.name && target.getChild(entry.name)) {
                        const { confirmed } = await this.c.confirm($EHb(entry.name));
                        if (!confirmed) {
                            return;
                        }
                        await this.d.applyBulkEdit([new bulkEditService_1.$q1((0, resources_1.$ig)(target.resource, entry.name), undefined, { recursive: true, folder: target.getChild(entry.name)?.isDirectory })], {
                            undoLabel: (0, nls_1.localize)(1, null, entry.name),
                            progressLabel: (0, nls_1.localize)(2, null, entry.name),
                        });
                        if (token.isCancellationRequested) {
                            return;
                        }
                    }
                    // Upload entry
                    const result = await this.i(entry, target.resource, target, progress, operation, token);
                    if (result) {
                        results.push(result);
                    }
                });
            }));
            operation.progressScheduler.dispose();
            // Open uploaded file in editor only if we upload just one
            const firstUploadedFile = results[0];
            if (!token.isCancellationRequested && firstUploadedFile?.isFile) {
                await this.e.openEditor({ resource: firstUploadedFile.resource, options: { pinned: true } });
            }
        }
        async i(entry, parentResource, target, progress, operation, token) {
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
                if (fileSize < files_1.$Ak.MB) {
                    if (operation.filesTotal === 1) {
                        message = `${entry.name}`;
                    }
                    else {
                        message = (0, nls_1.localize)(3, null, operation.filesUploaded, operation.filesTotal, files_1.$Ak.formatSize(bytesUploadedPerSecond));
                    }
                }
                // Large file
                else {
                    message = (0, nls_1.localize)(4, null, entry.name, files_1.$Ak.formatSize(fileBytesUploaded), files_1.$Ak.formatSize(fileSize), files_1.$Ak.formatSize(bytesUploadedPerSecond));
                }
                // Report progress but limit to update only once per second
                operation.progressScheduler.work({ message });
            };
            operation.filesUploaded++;
            reportProgress(0, 0);
            // Handle file upload
            const resource = (0, resources_1.$ig)(parentResource, entry.name);
            if (entry.isFile) {
                const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
                if (token.isCancellationRequested) {
                    return undefined;
                }
                // Chrome/Edge/Firefox support stream method, but only use it for
                // larger files to reduce the overhead of the streaming approach
                if (typeof file.stream === 'function' && file.size > files_1.$Ak.MB) {
                    await this.j(resource, file, reportProgress, token);
                }
                // Fallback to unbuffered upload for other browsers or small files
                else {
                    await this.k(resource, file, reportProgress);
                }
                return { isFile: true, resource };
            }
            // Handle folder upload
            else {
                // Create target folder
                await this.f.createFolder(resource);
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
                const fileUploadQueue = new async_1.$Mg($BHb_1.a);
                await async_1.Promises.settled(fileChildEntries.map(fileChildEntry => {
                    return fileUploadQueue.queue(() => this.i(fileChildEntry, resource, folderTarget, progress, operation, token));
                }));
                // Upload folders (sequentially give we don't know their sizes)
                for (const folderChildEntry of folderChildEntries) {
                    await this.i(folderChildEntry, resource, folderTarget, progress, operation, token);
                }
                return { isFile: false, resource };
            }
        }
        async j(resource, file, progressReporter, token) {
            const writeableStream = (0, buffer_1.$Vd)({
                // Set a highWaterMark to prevent the stream
                // for file upload to produce large buffers
                // in-memory
                highWaterMark: 10
            });
            const writeFilePromise = this.f.writeFile(resource, writeableStream);
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
                    const buffer = buffer_1.$Fd.wrap(res.value);
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
        k(resource, file, progressReporter) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        if (event.target?.result instanceof ArrayBuffer) {
                            const buffer = buffer_1.$Fd.wrap(new Uint8Array(event.target.result));
                            await this.f.writeFile(resource, buffer);
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
    exports.$BHb = $BHb;
    exports.$BHb = $BHb = $BHb_1 = __decorate([
        __param(0, progress_1.$2u),
        __param(1, dialogs_1.$oA),
        __param(2, files_2.$xHb),
        __param(3, editorService_1.$9C),
        __param(4, files_1.$6j)
    ], $BHb);
    //#endregion
    //#region External File Import (drag and drop)
    let $CHb = class $CHb {
        constructor(a, b, c, d, e, f, g, h, i, j, k) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
        }
        async import(target, source) {
            const cts = new cancellation_1.$pd();
            // Indicate progress globally
            const importPromise = this.i.withProgress({
                location: 10 /* ProgressLocation.Window */,
                delay: 800,
                cancellable: true,
                title: (0, nls_1.localize)(5, null)
            }, async () => await this.l(target, source, cts.token), () => cts.dispose(true));
            // Also indicate progress in the files view
            this.i.withProgress({ location: files_3.$Ndb, delay: 500 }, () => importPromise);
            return importPromise;
        }
        async l(target, source, token) {
            // Activate all providers for the resources dropped
            const candidateFiles = (0, arrays_1.$Fb)((await this.k.invokeFunction(accessor => (0, dnd_1.$76)(accessor, source))).map(editor => editor.resource));
            await Promise.all(candidateFiles.map(resource => this.a.activateProvider(resource.scheme)));
            // Check for dropped external files to be folders
            const files = (0, arrays_1.$Fb)(candidateFiles.filter(resource => this.a.hasProvider(resource)));
            const resolvedFiles = await this.a.resolveAll(files.map(file => ({ resource: file })));
            if (token.isCancellationRequested) {
                return;
            }
            // Pass focus to window
            this.b.focus();
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
                            (0, nls_1.localize)(6, null) :
                            (0, nls_1.localize)(7, null),
                        run: () => ImportChoice.Copy
                    }
                ];
                let message;
                // We only allow to add a folder to the workspace if there is already a workspace folder with that scheme
                const workspaceFolderSchemas = this.c.getWorkspace().folders.map(folder => folder.uri.scheme);
                if (folders.some(folder => workspaceFolderSchemas.indexOf(folder.uri.scheme) >= 0)) {
                    buttons.unshift({
                        label: folders.length > 1 ?
                            (0, nls_1.localize)(8, null) :
                            (0, nls_1.localize)(9, null),
                        run: () => ImportChoice.Add
                    });
                    message = folders.length > 1 ?
                        (0, nls_1.localize)(10, null) :
                        (0, nls_1.localize)(11, null, (0, resources_1.$fg)(folders[0].uri));
                }
                else {
                    message = folders.length > 1 ?
                        (0, nls_1.localize)(12, null) :
                        (0, nls_1.localize)(13, null, (0, resources_1.$fg)(folders[0].uri));
                }
                const { result } = await this.e.prompt({
                    type: notification_1.Severity.Info,
                    message,
                    buttons,
                    cancelButton: true
                });
                // Add folders
                if (result === ImportChoice.Add) {
                    return this.f.addFolders(folders);
                }
                // Copy resources
                if (result === ImportChoice.Copy) {
                    return this.m(target, files, token);
                }
            }
            // Handle dropped files (only support FileStat as target)
            else if (target instanceof explorerModel_1.$vHb) {
                return this.m(target, files, token);
            }
        }
        async m(target, resources, token) {
            if (resources && resources.length > 0) {
                // Resolve target to check for name collisions and ask user
                const targetStat = await this.a.resolve(target.resource);
                if (token.isCancellationRequested) {
                    return;
                }
                // Check for name collisions
                const targetNames = new Set();
                const caseSensitive = this.a.hasCapability(target.resource, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
                if (targetStat.children) {
                    targetStat.children.forEach(child => {
                        targetNames.add(caseSensitive ? child.name : child.name.toLowerCase());
                    });
                }
                let inaccessibleFileCount = 0;
                const resourcesFiltered = (0, arrays_1.$Fb)((await async_1.Promises.settled(resources.map(async (resource) => {
                    const fileDoesNotExist = !(await this.a.exists(resource));
                    if (fileDoesNotExist) {
                        inaccessibleFileCount++;
                        return undefined;
                    }
                    if (targetNames.has(caseSensitive ? (0, resources_1.$fg)(resource) : (0, resources_1.$fg)(resource).toLowerCase())) {
                        const confirmationResult = await this.e.confirm($EHb((0, resources_1.$fg)(resource)));
                        if (!confirmationResult.confirmed) {
                            return undefined;
                        }
                    }
                    return resource;
                }))));
                if (inaccessibleFileCount > 0) {
                    this.j.error(inaccessibleFileCount > 1 ? (0, nls_1.localize)(14, null) : (0, nls_1.localize)(15, null));
                }
                // Copy resources through bulk edit API
                const resourceFileEdits = resourcesFiltered.map(resource => {
                    const sourceFileName = (0, resources_1.$fg)(resource);
                    const targetFile = (0, resources_1.$ig)(target.resource, sourceFileName);
                    return new bulkEditService_1.$q1(resource, targetFile, { overwrite: true, copy: true });
                });
                const undoLevel = this.d.getValue().explorer.confirmUndo;
                await this.g.applyBulkEdit(resourceFileEdits, {
                    undoLabel: resourcesFiltered.length === 1 ?
                        (0, nls_1.localize)(16, null, (0, resources_1.$fg)(resourcesFiltered[0])) :
                        (0, nls_1.localize)(17, null, resourcesFiltered.length),
                    progressLabel: resourcesFiltered.length === 1 ?
                        (0, nls_1.localize)(18, null, (0, resources_1.$fg)(resourcesFiltered[0])) :
                        (0, nls_1.localize)(19, null, resourcesFiltered.length),
                    progressLocation: 10 /* ProgressLocation.Window */,
                    confirmBeforeUndo: undoLevel === "verbose" /* UndoConfirmLevel.Verbose */ || undoLevel === "default" /* UndoConfirmLevel.Default */,
                });
                // if we only add one file, just open it directly
                if (resourceFileEdits.length === 1) {
                    const item = this.g.findClosest(resourceFileEdits[0].newResource);
                    if (item && !item.isDirectory) {
                        this.h.openEditor({ resource: item.resource, options: { pinned: true } });
                    }
                }
            }
        }
    };
    exports.$CHb = $CHb;
    exports.$CHb = $CHb = __decorate([
        __param(0, files_1.$6j),
        __param(1, host_1.$VT),
        __param(2, workspace_1.$Kh),
        __param(3, configuration_1.$8h),
        __param(4, dialogs_1.$oA),
        __param(5, workspaceEditing_1.$pU),
        __param(6, files_2.$xHb),
        __param(7, editorService_1.$9C),
        __param(8, progress_1.$2u),
        __param(9, notification_1.$Yu),
        __param(10, instantiation_1.$Ah)
    ], $CHb);
    let $DHb = class $DHb {
        static { $DHb_1 = this; }
        static { this.a = 'workbench.explorer.downloadPath'; }
        constructor(b, c, d, e, f, g) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
        }
        download(source) {
            const cts = new cancellation_1.$pd();
            // Indicate progress globally
            const downloadPromise = this.d.withProgress({
                location: 10 /* ProgressLocation.Window */,
                delay: 800,
                cancellable: platform_1.$o,
                title: (0, nls_1.localize)(20, null)
            }, async (progress) => this.h(source, progress, cts), () => cts.dispose(true));
            // Also indicate progress in the files view
            this.d.withProgress({ location: files_3.$Ndb, delay: 500 }, () => downloadPromise);
            return downloadPromise;
        }
        async h(sources, progress, cts) {
            for (const source of sources) {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // Web: use DOM APIs to download files with optional support
                // for folders and large files
                if (platform_1.$o) {
                    await this.i(source.resource, progress, cts);
                }
                // Native: use working copy file service to get at the contents
                else {
                    await this.o(source, progress, cts);
                }
            }
        }
        async i(resource, progress, cts) {
            const stat = await this.b.resolve(resource, { resolveMetadata: true });
            if (cts.token.isCancellationRequested) {
                return;
            }
            const maxBlobDownloadSize = 32 * files_1.$Ak.MB; // avoid to download via blob-trick >32MB to avoid memory pressure
            const preferFileSystemAccessWebApis = stat.isDirectory || stat.size > maxBlobDownloadSize;
            // Folder: use FS APIs to download files and folders if available and preferred
            if (preferFileSystemAccessWebApis && webFileSystemAccess_1.WebFileSystemAccess.supported(window)) {
                try {
                    const parentFolder = await window.showDirectoryPicker();
                    const operation = {
                        startTime: Date.now(),
                        progressScheduler: new async_1.$Ug(steps => { progress.report(steps[steps.length - 1]); }, 1000),
                        filesTotal: stat.isDirectory ? 0 : 1,
                        filesDownloaded: 0,
                        totalBytesDownloaded: 0,
                        fileBytesDownloaded: 0
                    };
                    if (stat.isDirectory) {
                        const targetFolder = await parentFolder.getDirectoryHandle(stat.name, { create: true });
                        await this.m(stat, targetFolder, operation, cts.token);
                    }
                    else {
                        await this.l(parentFolder, stat, operation, cts.token);
                    }
                    operation.progressScheduler.dispose();
                }
                catch (error) {
                    this.e.warn(error);
                    cts.cancel(); // `showDirectoryPicker` will throw an error when the user cancels
                }
            }
            // File: use traditional download to circumvent browser limitations
            else if (stat.isFile) {
                let bufferOrUri;
                try {
                    bufferOrUri = (await this.b.readFile(stat.resource, { limits: { size: maxBlobDownloadSize } }, cts.token)).value.buffer;
                }
                catch (error) {
                    bufferOrUri = network_1.$2f.uriToBrowserUri(stat.resource);
                }
                if (!cts.token.isCancellationRequested) {
                    (0, dom_1.$qP)(bufferOrUri, stat.name);
                }
            }
        }
        async j(resource, target, operation, token) {
            const contents = await this.b.readFileStream(resource, undefined, token);
            if (token.isCancellationRequested) {
                target.close();
                return;
            }
            return new Promise((resolve, reject) => {
                const sourceStream = contents.value;
                const disposables = new lifecycle_1.$jc();
                disposables.add((0, lifecycle_1.$ic)(() => target.close()));
                disposables.add((0, functional_1.$bb)(token.onCancellationRequested)(() => {
                    disposables.dispose();
                    reject((0, errors_1.$4)());
                }));
                (0, stream_1.$xd)(sourceStream, {
                    onData: data => {
                        target.write(data.buffer);
                        this.n(contents.name, contents.size, data.byteLength, operation);
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
        async k(resource, target, operation, token) {
            const contents = await this.b.readFile(resource, undefined, token);
            if (!token.isCancellationRequested) {
                target.write(contents.value.buffer);
                this.n(contents.name, contents.size, contents.value.byteLength, operation);
            }
            target.close();
        }
        async l(targetFolder, file, operation, token) {
            // Report progress
            operation.filesDownloaded++;
            operation.fileBytesDownloaded = 0; // reset for this file
            this.n(file.name, 0, 0, operation);
            // Start to download
            const targetFile = await targetFolder.getFileHandle(file.name, { create: true });
            const targetFileWriter = await targetFile.createWritable();
            // For large files, write buffered using streams
            if (file.size > files_1.$Ak.MB) {
                return this.j(file.resource, targetFileWriter, operation, token);
            }
            // For small files prefer to write unbuffered to reduce overhead
            return this.k(file.resource, targetFileWriter, operation, token);
        }
        async m(folder, targetFolder, operation, token) {
            if (folder.children) {
                operation.filesTotal += (folder.children.map(child => child.isFile)).length;
                for (const child of folder.children) {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    if (child.isFile) {
                        await this.l(targetFolder, child, operation, token);
                    }
                    else {
                        const childFolder = await targetFolder.getDirectoryHandle(child.name, { create: true });
                        const resolvedChildFolder = await this.b.resolve(child.resource, { resolveMetadata: true });
                        await this.m(resolvedChildFolder, childFolder, operation, token);
                    }
                }
            }
        }
        n(name, fileSize, bytesDownloaded, operation) {
            operation.fileBytesDownloaded += bytesDownloaded;
            operation.totalBytesDownloaded += bytesDownloaded;
            const bytesDownloadedPerSecond = operation.totalBytesDownloaded / ((Date.now() - operation.startTime) / 1000);
            // Small file
            let message;
            if (fileSize < files_1.$Ak.MB) {
                if (operation.filesTotal === 1) {
                    message = name;
                }
                else {
                    message = (0, nls_1.localize)(21, null, operation.filesDownloaded, operation.filesTotal, files_1.$Ak.formatSize(bytesDownloadedPerSecond));
                }
            }
            // Large file
            else {
                message = (0, nls_1.localize)(22, null, name, files_1.$Ak.formatSize(operation.fileBytesDownloaded), files_1.$Ak.formatSize(fileSize), files_1.$Ak.formatSize(bytesDownloadedPerSecond));
            }
            // Report progress but limit to update only once per second
            operation.progressScheduler.work({ message });
        }
        async o(explorerItem, progress, cts) {
            progress.report({ message: explorerItem.name });
            let defaultUri;
            const lastUsedDownloadPath = this.g.get($DHb_1.a, -1 /* StorageScope.APPLICATION */);
            if (lastUsedDownloadPath) {
                defaultUri = (0, resources_1.$ig)(uri_1.URI.file(lastUsedDownloadPath), explorerItem.name);
            }
            else {
                defaultUri = (0, resources_1.$ig)(explorerItem.isDirectory ?
                    await this.f.defaultFolderPath(network_1.Schemas.file) :
                    await this.f.defaultFilePath(network_1.Schemas.file), explorerItem.name);
            }
            const destination = await this.f.showSaveDialog({
                availableFileSystems: [network_1.Schemas.file],
                saveLabel: (0, labels_1.$lA)((0, nls_1.localize)(23, null)),
                title: (0, nls_1.localize)(24, null),
                defaultUri
            });
            if (destination) {
                // Remember as last used download folder
                this.g.store($DHb_1.a, (0, resources_1.$hg)(destination).fsPath, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                // Perform download
                await this.c.applyBulkEdit([new bulkEditService_1.$q1(explorerItem.resource, destination, { overwrite: true, copy: true })], {
                    undoLabel: (0, nls_1.localize)(25, null, explorerItem.name),
                    progressLabel: (0, nls_1.localize)(26, null, explorerItem.name),
                    progressLocation: 10 /* ProgressLocation.Window */
                });
            }
            else {
                cts.cancel(); // User canceled a download. In case there were multiple files selected we should cancel the remainder of the prompts #86100
            }
        }
    };
    exports.$DHb = $DHb;
    exports.$DHb = $DHb = $DHb_1 = __decorate([
        __param(0, files_1.$6j),
        __param(1, files_2.$xHb),
        __param(2, progress_1.$2u),
        __param(3, log_1.$5i),
        __param(4, dialogs_1.$qA),
        __param(5, storage_1.$Vo)
    ], $DHb);
    //#endregion
    //#region Helpers
    function $EHb(name) {
        return {
            message: (0, nls_1.localize)(27, null, name),
            detail: (0, nls_1.localize)(28, null),
            primaryButton: (0, nls_1.localize)(29, null),
            type: 'warning'
        };
    }
    exports.$EHb = $EHb;
    function $FHb(files) {
        if (files.length > 1) {
            return {
                message: (0, nls_1.localize)(30, null, files.length),
                detail: (0, dialogs_1.$rA)(files) + '\n' + (0, nls_1.localize)(31, null),
                primaryButton: (0, nls_1.localize)(32, null),
                type: 'warning'
            };
        }
        return $EHb((0, resources_1.$fg)(files[0]));
    }
    exports.$FHb = $FHb;
});
//#endregion
//# sourceMappingURL=fileImportExport.js.map