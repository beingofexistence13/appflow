/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/stream", "vs/platform/files/common/files", "vs/platform/files/browser/webFileSystemAccess"], function (require, exports, nls_1, uri_1, buffer_1, event_1, lifecycle_1, network_1, path_1, platform_1, resources_1, stream_1, files_1, webFileSystemAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTMLFileSystemProvider = void 0;
    class HTMLFileSystemProvider {
        get capabilities() {
            if (!this._capabilities) {
                this._capabilities =
                    2 /* FileSystemProviderCapabilities.FileReadWrite */ |
                        16 /* FileSystemProviderCapabilities.FileReadStream */;
                if (platform_1.isLinux) {
                    this._capabilities |= 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
                }
            }
            return this._capabilities;
        }
        //#endregion
        constructor(indexedDB, store, logService) {
            this.indexedDB = indexedDB;
            this.store = store;
            this.logService = logService;
            //#region Events (unsupported)
            this.onDidChangeCapabilities = event_1.Event.None;
            this.onDidChangeFile = event_1.Event.None;
            //#endregion
            //#region File Capabilities
            this.extUri = platform_1.isLinux ? resources_1.extUri : resources_1.extUriIgnorePathCase;
            //#endregion
            //#region File/Directoy Handle Registry
            this._files = new Map();
            this._directories = new Map();
        }
        //#region File Metadata Resolving
        async stat(resource) {
            try {
                const handle = await this.getHandle(resource);
                if (!handle) {
                    throw this.createFileSystemProviderError(resource, 'No such file or directory, stat', files_1.FileSystemProviderErrorCode.FileNotFound);
                }
                if (webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(handle)) {
                    const file = await handle.getFile();
                    return {
                        type: files_1.FileType.File,
                        mtime: file.lastModified,
                        ctime: 0,
                        size: file.size
                    };
                }
                return {
                    type: files_1.FileType.Directory,
                    mtime: 0,
                    ctime: 0,
                    size: 0
                };
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        async readdir(resource) {
            try {
                const handle = await this.getDirectoryHandle(resource);
                if (!handle) {
                    throw this.createFileSystemProviderError(resource, 'No such file or directory, readdir', files_1.FileSystemProviderErrorCode.FileNotFound);
                }
                const result = [];
                for await (const [name, child] of handle) {
                    result.push([name, webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(child) ? files_1.FileType.File : files_1.FileType.Directory]);
                }
                return result;
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        //#endregion
        //#region File Reading/Writing
        readFileStream(resource, opts, token) {
            const stream = (0, stream_1.newWriteableStream)(data => buffer_1.VSBuffer.concat(data.map(data => buffer_1.VSBuffer.wrap(data))).buffer, {
                // Set a highWaterMark to prevent the stream
                // for file upload to produce large buffers
                // in-memory
                highWaterMark: 10
            });
            (async () => {
                try {
                    const handle = await this.getFileHandle(resource);
                    if (!handle) {
                        throw this.createFileSystemProviderError(resource, 'No such file or directory, readFile', files_1.FileSystemProviderErrorCode.FileNotFound);
                    }
                    const file = await handle.getFile();
                    // Partial file: implemented simply via `readFile`
                    if (typeof opts.length === 'number' || typeof opts.position === 'number') {
                        let buffer = new Uint8Array(await file.arrayBuffer());
                        if (typeof opts?.position === 'number') {
                            buffer = buffer.slice(opts.position);
                        }
                        if (typeof opts?.length === 'number') {
                            buffer = buffer.slice(0, opts.length);
                        }
                        stream.end(buffer);
                    }
                    // Entire file
                    else {
                        const reader = file.stream().getReader();
                        let res = await reader.read();
                        while (!res.done) {
                            if (token.isCancellationRequested) {
                                break;
                            }
                            // Write buffer into stream but make sure to wait
                            // in case the `highWaterMark` is reached
                            await stream.write(res.value);
                            if (token.isCancellationRequested) {
                                break;
                            }
                            res = await reader.read();
                        }
                        stream.end(undefined);
                    }
                }
                catch (error) {
                    stream.error(this.toFileSystemProviderError(error));
                    stream.end();
                }
            })();
            return stream;
        }
        async readFile(resource) {
            try {
                const handle = await this.getFileHandle(resource);
                if (!handle) {
                    throw this.createFileSystemProviderError(resource, 'No such file or directory, readFile', files_1.FileSystemProviderErrorCode.FileNotFound);
                }
                const file = await handle.getFile();
                return new Uint8Array(await file.arrayBuffer());
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        async writeFile(resource, content, opts) {
            try {
                let handle = await this.getFileHandle(resource);
                // Validate target unless { create: true, overwrite: true }
                if (!opts.create || !opts.overwrite) {
                    if (handle) {
                        if (!opts.overwrite) {
                            throw this.createFileSystemProviderError(resource, 'File already exists, writeFile', files_1.FileSystemProviderErrorCode.FileExists);
                        }
                    }
                    else {
                        if (!opts.create) {
                            throw this.createFileSystemProviderError(resource, 'No such file, writeFile', files_1.FileSystemProviderErrorCode.FileNotFound);
                        }
                    }
                }
                // Create target as needed
                if (!handle) {
                    const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
                    if (!parent) {
                        throw this.createFileSystemProviderError(resource, 'No such parent directory, writeFile', files_1.FileSystemProviderErrorCode.FileNotFound);
                    }
                    handle = await parent.getFileHandle(this.extUri.basename(resource), { create: true });
                    if (!handle) {
                        throw this.createFileSystemProviderError(resource, 'Unable to create file , writeFile', files_1.FileSystemProviderErrorCode.Unknown);
                    }
                }
                // Write to target overwriting any existing contents
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        async mkdir(resource) {
            try {
                const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
                if (!parent) {
                    throw this.createFileSystemProviderError(resource, 'No such parent directory, mkdir', files_1.FileSystemProviderErrorCode.FileNotFound);
                }
                await parent.getDirectoryHandle(this.extUri.basename(resource), { create: true });
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        async delete(resource, opts) {
            try {
                const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
                if (!parent) {
                    throw this.createFileSystemProviderError(resource, 'No such parent directory, delete', files_1.FileSystemProviderErrorCode.FileNotFound);
                }
                return parent.removeEntry(this.extUri.basename(resource), { recursive: opts.recursive });
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        async rename(from, to, opts) {
            try {
                if (this.extUri.isEqual(from, to)) {
                    return; // no-op if the paths are the same
                }
                // Implement file rename by write + delete
                const fileHandle = await this.getFileHandle(from);
                if (fileHandle) {
                    const file = await fileHandle.getFile();
                    const contents = new Uint8Array(await file.arrayBuffer());
                    await this.writeFile(to, contents, { create: true, overwrite: opts.overwrite, unlock: false, atomic: false });
                    await this.delete(from, { recursive: false, useTrash: false, atomic: false });
                }
                // File API does not support any real rename otherwise
                else {
                    throw this.createFileSystemProviderError(from, (0, nls_1.localize)('fileSystemRenameError', "Rename is only supported for files."), files_1.FileSystemProviderErrorCode.Unavailable);
                }
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        //#endregion
        //#region File Watching (unsupported)
        watch(resource, opts) {
            return lifecycle_1.Disposable.None;
        }
        registerFileHandle(handle) {
            return this.registerHandle(handle, this._files);
        }
        registerDirectoryHandle(handle) {
            return this.registerHandle(handle, this._directories);
        }
        get directories() {
            return this._directories.values();
        }
        async registerHandle(handle, map) {
            let handleId = `/${handle.name}`;
            // Compute a valid handle ID in case this exists already
            if (map.has(handleId) && !await map.get(handleId)?.isSameEntry(handle)) {
                const fileExt = (0, path_1.extname)(handle.name);
                const fileName = (0, path_1.basename)(handle.name, fileExt);
                let handleIdCounter = 1;
                do {
                    handleId = `/${fileName}-${handleIdCounter++}${fileExt}`;
                } while (map.has(handleId) && !await map.get(handleId)?.isSameEntry(handle));
            }
            map.set(handleId, handle);
            // Remember in IndexDB for future lookup
            try {
                await this.indexedDB?.runInTransaction(this.store, 'readwrite', objectStore => objectStore.put(handle, handleId));
            }
            catch (error) {
                this.logService.error(error);
            }
            return uri_1.URI.from({ scheme: network_1.Schemas.file, path: handleId });
        }
        async getHandle(resource) {
            // First: try to find a well known handle first
            let handle = await this.doGetHandle(resource);
            // Second: walk up parent directories and resolve handle if possible
            if (!handle) {
                const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
                if (parent) {
                    const name = resources_1.extUri.basename(resource);
                    try {
                        handle = await parent.getFileHandle(name);
                    }
                    catch (error) {
                        try {
                            handle = await parent.getDirectoryHandle(name);
                        }
                        catch (error) {
                            // Ignore
                        }
                    }
                }
            }
            return handle;
        }
        async getFileHandle(resource) {
            const handle = await this.doGetHandle(resource);
            if (handle instanceof FileSystemFileHandle) {
                return handle;
            }
            const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
            try {
                return await parent?.getFileHandle(resources_1.extUri.basename(resource));
            }
            catch (error) {
                return undefined; // guard against possible DOMException
            }
        }
        async getDirectoryHandle(resource) {
            const handle = await this.doGetHandle(resource);
            if (handle instanceof FileSystemDirectoryHandle) {
                return handle;
            }
            const parentUri = this.extUri.dirname(resource);
            if (this.extUri.isEqual(parentUri, resource)) {
                return undefined; // return when root is reached to prevent infinite recursion
            }
            const parent = await this.getDirectoryHandle(parentUri);
            try {
                return await parent?.getDirectoryHandle(resources_1.extUri.basename(resource));
            }
            catch (error) {
                return undefined; // guard against possible DOMException
            }
        }
        async doGetHandle(resource) {
            // We store file system handles with the `handle.name`
            // and as such require the resource to be on the root
            if (this.extUri.dirname(resource).path !== '/') {
                return undefined;
            }
            const handleId = resource.path.replace(/\/$/, ''); // remove potential slash from the end of the path
            // First: check if we have a known handle stored in memory
            const inMemoryHandle = this._files.get(handleId) ?? this._directories.get(handleId);
            if (inMemoryHandle) {
                return inMemoryHandle;
            }
            // Second: check if we have a persisted handle in IndexedDB
            const persistedHandle = await this.indexedDB?.runInTransaction(this.store, 'readonly', store => store.get(handleId));
            if (webFileSystemAccess_1.WebFileSystemAccess.isFileSystemHandle(persistedHandle)) {
                let hasPermissions = await persistedHandle.queryPermission() === 'granted';
                try {
                    if (!hasPermissions) {
                        hasPermissions = await persistedHandle.requestPermission() === 'granted';
                    }
                }
                catch (error) {
                    this.logService.error(error); // this can fail with a DOMException
                }
                if (hasPermissions) {
                    if (webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(persistedHandle)) {
                        this._files.set(handleId, persistedHandle);
                    }
                    else if (webFileSystemAccess_1.WebFileSystemAccess.isFileSystemDirectoryHandle(persistedHandle)) {
                        this._directories.set(handleId, persistedHandle);
                    }
                    return persistedHandle;
                }
            }
            // Third: fail with an error
            throw this.createFileSystemProviderError(resource, 'No file system handle registered', files_1.FileSystemProviderErrorCode.Unavailable);
        }
        //#endregion
        toFileSystemProviderError(error) {
            if (error instanceof files_1.FileSystemProviderError) {
                return error; // avoid double conversion
            }
            let code = files_1.FileSystemProviderErrorCode.Unknown;
            if (error.name === 'NotAllowedError') {
                error = new Error((0, nls_1.localize)('fileSystemNotAllowedError', "Insufficient permissions. Please retry and allow the operation."));
                code = files_1.FileSystemProviderErrorCode.Unavailable;
            }
            return (0, files_1.createFileSystemProviderError)(error, code);
        }
        createFileSystemProviderError(resource, msg, code) {
            return (0, files_1.createFileSystemProviderError)(new Error(`${msg} (${(0, path_1.normalize)(resource.path)})`), code);
        }
    }
    exports.HTMLFileSystemProvider = HTMLFileSystemProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbEZpbGVTeXN0ZW1Qcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL2Jyb3dzZXIvaHRtbEZpbGVTeXN0ZW1Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLE1BQWEsc0JBQXNCO1FBY2xDLElBQUksWUFBWTtZQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUN4QixJQUFJLENBQUMsYUFBYTtvQkFDakI7OEVBQzZDLENBQUM7Z0JBRS9DLElBQUksa0JBQU8sRUFBRTtvQkFDWixJQUFJLENBQUMsYUFBYSwrREFBb0QsQ0FBQztpQkFDdkU7YUFDRDtZQUVELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUMzQixDQUFDO1FBRUQsWUFBWTtRQUdaLFlBQ1MsU0FBZ0MsRUFDdkIsS0FBYSxFQUN0QixVQUF1QjtZQUZ2QixjQUFTLEdBQVQsU0FBUyxDQUF1QjtZQUN2QixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ3RCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFoQ2hDLDhCQUE4QjtZQUVyQiw0QkFBdUIsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1lBQ3JDLG9CQUFlLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztZQUV0QyxZQUFZO1lBRVosMkJBQTJCO1lBRW5CLFdBQU0sR0FBRyxrQkFBTyxDQUFDLENBQUMsQ0FBQyxrQkFBTSxDQUFDLENBQUMsQ0FBQyxnQ0FBb0IsQ0FBQztZQW9RekQsWUFBWTtZQUVaLHVDQUF1QztZQUV0QixXQUFNLEdBQUcsSUFBSSxHQUFHLEVBQWdDLENBQUM7WUFDakQsaUJBQVksR0FBRyxJQUFJLEdBQUcsRUFBcUMsQ0FBQztRQWpQekUsQ0FBQztRQUVMLGlDQUFpQztRQUVqQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQWE7WUFDdkIsSUFBSTtnQkFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1osTUFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsUUFBUSxFQUFFLGlDQUFpQyxFQUFFLG1DQUEyQixDQUFDLFlBQVksQ0FBQyxDQUFDO2lCQUNoSTtnQkFFRCxJQUFJLHlDQUFtQixDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUN2RCxNQUFNLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFFcEMsT0FBTzt3QkFDTixJQUFJLEVBQUUsZ0JBQVEsQ0FBQyxJQUFJO3dCQUNuQixLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVk7d0JBQ3hCLEtBQUssRUFBRSxDQUFDO3dCQUNSLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtxQkFDZixDQUFDO2lCQUNGO2dCQUVELE9BQU87b0JBQ04sSUFBSSxFQUFFLGdCQUFRLENBQUMsU0FBUztvQkFDeEIsS0FBSyxFQUFFLENBQUM7b0JBQ1IsS0FBSyxFQUFFLENBQUM7b0JBQ1IsSUFBSSxFQUFFLENBQUM7aUJBQ1AsQ0FBQzthQUNGO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsTUFBTSxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDNUM7UUFDRixDQUFDO1FBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFhO1lBQzFCLElBQUk7Z0JBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1osTUFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsUUFBUSxFQUFFLG9DQUFvQyxFQUFFLG1DQUEyQixDQUFDLFlBQVksQ0FBQyxDQUFDO2lCQUNuSTtnQkFFRCxNQUFNLE1BQU0sR0FBeUIsRUFBRSxDQUFDO2dCQUV4QyxJQUFJLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sRUFBRTtvQkFDekMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSx5Q0FBbUIsQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztpQkFDNUc7Z0JBRUQsT0FBTyxNQUFNLENBQUM7YUFDZDtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNmLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVDO1FBQ0YsQ0FBQztRQUVELFlBQVk7UUFFWiw4QkFBOEI7UUFFOUIsY0FBYyxDQUFDLFFBQWEsRUFBRSxJQUE0QixFQUFFLEtBQXdCO1lBQ25GLE1BQU0sTUFBTSxHQUFHLElBQUEsMkJBQWtCLEVBQWEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQkFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtnQkFDcEgsNENBQTRDO2dCQUM1QywyQ0FBMkM7Z0JBQzNDLFlBQVk7Z0JBQ1osYUFBYSxFQUFFLEVBQUU7YUFDakIsQ0FBQyxDQUFDO1lBRUgsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDWCxJQUFJO29CQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDbEQsSUFBSSxDQUFDLE1BQU0sRUFBRTt3QkFDWixNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxRQUFRLEVBQUUscUNBQXFDLEVBQUUsbUNBQTJCLENBQUMsWUFBWSxDQUFDLENBQUM7cUJBQ3BJO29CQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUVwQyxrREFBa0Q7b0JBQ2xELElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVEsSUFBSSxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO3dCQUN6RSxJQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO3dCQUV0RCxJQUFJLE9BQU8sSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLEVBQUU7NEJBQ3ZDLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzt5QkFDckM7d0JBRUQsSUFBSSxPQUFPLElBQUksRUFBRSxNQUFNLEtBQUssUUFBUSxFQUFFOzRCQUNyQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3lCQUN0Qzt3QkFFRCxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUNuQjtvQkFFRCxjQUFjO3lCQUNUO3dCQUNKLE1BQU0sTUFBTSxHQUE0QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBRWxGLElBQUksR0FBRyxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTs0QkFDakIsSUFBSSxLQUFLLENBQUMsdUJBQXVCLEVBQUU7Z0NBQ2xDLE1BQU07NkJBQ047NEJBRUQsaURBQWlEOzRCQUNqRCx5Q0FBeUM7NEJBQ3pDLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBRTlCLElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFO2dDQUNsQyxNQUFNOzZCQUNOOzRCQUVELEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQzt5QkFDMUI7d0JBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztxQkFDdEI7aUJBQ0Q7Z0JBQUMsT0FBTyxLQUFLLEVBQUU7b0JBQ2YsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDcEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO2lCQUNiO1lBQ0YsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVMLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBYTtZQUMzQixJQUFJO2dCQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxRQUFRLEVBQUUscUNBQXFDLEVBQUUsbUNBQTJCLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ3BJO2dCQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUVwQyxPQUFPLElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7YUFDaEQ7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM1QztRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQWEsRUFBRSxPQUFtQixFQUFFLElBQXVCO1lBQzFFLElBQUk7Z0JBQ0gsSUFBSSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUVoRCwyREFBMkQ7Z0JBQzNELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDcEMsSUFBSSxNQUFNLEVBQUU7d0JBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7NEJBQ3BCLE1BQU0sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFFBQVEsRUFBRSxnQ0FBZ0MsRUFBRSxtQ0FBMkIsQ0FBQyxVQUFVLENBQUMsQ0FBQzt5QkFDN0g7cUJBQ0Q7eUJBQU07d0JBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7NEJBQ2pCLE1BQU0sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFFBQVEsRUFBRSx5QkFBeUIsRUFBRSxtQ0FBMkIsQ0FBQyxZQUFZLENBQUMsQ0FBQzt5QkFDeEg7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsMEJBQTBCO2dCQUMxQixJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzVFLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ1osTUFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsUUFBUSxFQUFFLHFDQUFxQyxFQUFFLG1DQUEyQixDQUFDLFlBQVksQ0FBQyxDQUFDO3FCQUNwSTtvQkFFRCxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7b0JBQ3RGLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ1osTUFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsUUFBUSxFQUFFLG1DQUFtQyxFQUFFLG1DQUEyQixDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUM3SDtpQkFDRDtnQkFFRCxvREFBb0Q7Z0JBQ3BELE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUMvQyxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzlCLE1BQU0sUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ3ZCO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsTUFBTSxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDNUM7UUFDRixDQUFDO1FBRUQsWUFBWTtRQUVaLHdDQUF3QztRQUV4QyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQWE7WUFDeEIsSUFBSTtnQkFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1RSxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLE1BQU0sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFFBQVEsRUFBRSxpQ0FBaUMsRUFBRSxtQ0FBMkIsQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDaEk7Z0JBRUQsTUFBTSxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUNsRjtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNmLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVDO1FBQ0YsQ0FBQztRQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBYSxFQUFFLElBQXdCO1lBQ25ELElBQUk7Z0JBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDNUUsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxRQUFRLEVBQUUsa0NBQWtDLEVBQUUsbUNBQTJCLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ2pJO2dCQUVELE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQzthQUN6RjtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNmLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVDO1FBQ0YsQ0FBQztRQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBUyxFQUFFLEVBQU8sRUFBRSxJQUEyQjtZQUMzRCxJQUFJO2dCQUNILElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFO29CQUNsQyxPQUFPLENBQUMsa0NBQWtDO2lCQUMxQztnQkFFRCwwQ0FBMEM7Z0JBQzFDLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxVQUFVLEVBQUU7b0JBQ2YsTUFBTSxJQUFJLEdBQUcsTUFBTSxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3hDLE1BQU0sUUFBUSxHQUFHLElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7b0JBRTFELE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO29CQUM5RyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2lCQUM5RTtnQkFFRCxzREFBc0Q7cUJBQ2pEO29CQUNKLE1BQU0sSUFBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksRUFBRSxJQUFBLGNBQVEsRUFBQyx1QkFBdUIsRUFBRSxxQ0FBcUMsQ0FBQyxFQUFFLG1DQUEyQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUNsSzthQUNEO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsTUFBTSxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDNUM7UUFDRixDQUFDO1FBRUQsWUFBWTtRQUVaLHFDQUFxQztRQUVyQyxLQUFLLENBQUMsUUFBYSxFQUFFLElBQW1CO1lBQ3ZDLE9BQU8sc0JBQVUsQ0FBQyxJQUFJLENBQUM7UUFDeEIsQ0FBQztRQVNELGtCQUFrQixDQUFDLE1BQTRCO1lBQzlDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFFRCx1QkFBdUIsQ0FBQyxNQUFpQztZQUN4RCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRUQsSUFBSSxXQUFXO1lBQ2QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFFTyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQXdCLEVBQUUsR0FBa0M7WUFDeEYsSUFBSSxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFakMsd0RBQXdEO1lBQ3hELElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3ZFLE1BQU0sT0FBTyxHQUFHLElBQUEsY0FBTyxFQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckMsTUFBTSxRQUFRLEdBQUcsSUFBQSxlQUFRLEVBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFFaEQsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QixHQUFHO29CQUNGLFFBQVEsR0FBRyxJQUFJLFFBQVEsSUFBSSxlQUFlLEVBQUUsR0FBRyxPQUFPLEVBQUUsQ0FBQztpQkFDekQsUUFBUSxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRTthQUM3RTtZQUVELEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRTFCLHdDQUF3QztZQUN4QyxJQUFJO2dCQUNILE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7YUFDbEg7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM3QjtZQUVELE9BQU8sU0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFhO1lBRTVCLCtDQUErQztZQUMvQyxJQUFJLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFOUMsb0VBQW9FO1lBQ3BFLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDNUUsSUFBSSxNQUFNLEVBQUU7b0JBQ1gsTUFBTSxJQUFJLEdBQUcsa0JBQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3ZDLElBQUk7d0JBQ0gsTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDMUM7b0JBQUMsT0FBTyxLQUFLLEVBQUU7d0JBQ2YsSUFBSTs0QkFDSCxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQy9DO3dCQUFDLE9BQU8sS0FBSyxFQUFFOzRCQUNmLFNBQVM7eUJBQ1Q7cUJBQ0Q7aUJBQ0Q7YUFDRDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVPLEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBYTtZQUN4QyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsSUFBSSxNQUFNLFlBQVksb0JBQW9CLEVBQUU7Z0JBQzNDLE9BQU8sTUFBTSxDQUFDO2FBQ2Q7WUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBRTVFLElBQUk7Z0JBQ0gsT0FBTyxNQUFNLE1BQU0sRUFBRSxhQUFhLENBQUMsa0JBQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUM5RDtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNmLE9BQU8sU0FBUyxDQUFDLENBQUMsc0NBQXNDO2FBQ3hEO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFhO1lBQzdDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoRCxJQUFJLE1BQU0sWUFBWSx5QkFBeUIsRUFBRTtnQkFDaEQsT0FBTyxNQUFNLENBQUM7YUFDZDtZQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUFFO2dCQUM3QyxPQUFPLFNBQVMsQ0FBQyxDQUFDLDREQUE0RDthQUM5RTtZQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXhELElBQUk7Z0JBQ0gsT0FBTyxNQUFNLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxrQkFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ25FO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsT0FBTyxTQUFTLENBQUMsQ0FBQyxzQ0FBc0M7YUFDeEQ7UUFDRixDQUFDO1FBRU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFhO1lBRXRDLHNEQUFzRDtZQUN0RCxxREFBcUQ7WUFDckQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBRyxFQUFFO2dCQUMvQyxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGtEQUFrRDtZQUVyRywwREFBMEQ7WUFDMUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEYsSUFBSSxjQUFjLEVBQUU7Z0JBQ25CLE9BQU8sY0FBYyxDQUFDO2FBQ3RCO1lBRUQsMkRBQTJEO1lBQzNELE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNySCxJQUFJLHlDQUFtQixDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxFQUFFO2dCQUM1RCxJQUFJLGNBQWMsR0FBRyxNQUFNLGVBQWUsQ0FBQyxlQUFlLEVBQUUsS0FBSyxTQUFTLENBQUM7Z0JBQzNFLElBQUk7b0JBQ0gsSUFBSSxDQUFDLGNBQWMsRUFBRTt3QkFDcEIsY0FBYyxHQUFHLE1BQU0sZUFBZSxDQUFDLGlCQUFpQixFQUFFLEtBQUssU0FBUyxDQUFDO3FCQUN6RTtpQkFDRDtnQkFBQyxPQUFPLEtBQUssRUFBRTtvQkFDZixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLG9DQUFvQztpQkFDbEU7Z0JBRUQsSUFBSSxjQUFjLEVBQUU7b0JBQ25CLElBQUkseUNBQW1CLENBQUMsc0JBQXNCLENBQUMsZUFBZSxDQUFDLEVBQUU7d0JBQ2hFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztxQkFDM0M7eUJBQU0sSUFBSSx5Q0FBbUIsQ0FBQywyQkFBMkIsQ0FBQyxlQUFlLENBQUMsRUFBRTt3QkFDNUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxDQUFDO3FCQUNqRDtvQkFFRCxPQUFPLGVBQWUsQ0FBQztpQkFDdkI7YUFDRDtZQUVELDRCQUE0QjtZQUM1QixNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxRQUFRLEVBQUUsa0NBQWtDLEVBQUUsbUNBQTJCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakksQ0FBQztRQUVELFlBQVk7UUFFSix5QkFBeUIsQ0FBQyxLQUFZO1lBQzdDLElBQUksS0FBSyxZQUFZLCtCQUF1QixFQUFFO2dCQUM3QyxPQUFPLEtBQUssQ0FBQyxDQUFDLDBCQUEwQjthQUN4QztZQUVELElBQUksSUFBSSxHQUFHLG1DQUEyQixDQUFDLE9BQU8sQ0FBQztZQUMvQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssaUJBQWlCLEVBQUU7Z0JBQ3JDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFBLGNBQVEsRUFBQywyQkFBMkIsRUFBRSxpRUFBaUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzVILElBQUksR0FBRyxtQ0FBMkIsQ0FBQyxXQUFXLENBQUM7YUFDL0M7WUFFRCxPQUFPLElBQUEscUNBQTZCLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFTyw2QkFBNkIsQ0FBQyxRQUFhLEVBQUUsR0FBVyxFQUFFLElBQWlDO1lBQ2xHLE9BQU8sSUFBQSxxQ0FBNkIsRUFBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxJQUFBLGdCQUFTLEVBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMvRixDQUFDO0tBQ0Q7SUF0YkQsd0RBc2JDIn0=