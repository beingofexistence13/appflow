/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/platform/files/browser/htmlFileSystemProvider", "vs/base/common/uri", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/stream", "vs/platform/files/common/files", "vs/platform/files/browser/webFileSystemAccess"], function (require, exports, nls_1, uri_1, buffer_1, event_1, lifecycle_1, network_1, path_1, platform_1, resources_1, stream_1, files_1, webFileSystemAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$46 = void 0;
    class $46 {
        get capabilities() {
            if (!this.b) {
                this.b =
                    2 /* FileSystemProviderCapabilities.FileReadWrite */ |
                        16 /* FileSystemProviderCapabilities.FileReadStream */;
                if (platform_1.$k) {
                    this.b |= 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
                }
            }
            return this.b;
        }
        //#endregion
        constructor(c, d, e) {
            this.c = c;
            this.d = d;
            this.e = e;
            //#region Events (unsupported)
            this.onDidChangeCapabilities = event_1.Event.None;
            this.onDidChangeFile = event_1.Event.None;
            //#endregion
            //#region File Capabilities
            this.a = platform_1.$k ? resources_1.$$f : resources_1.$ag;
            //#endregion
            //#region File/Directoy Handle Registry
            this.f = new Map();
            this.g = new Map();
        }
        //#region File Metadata Resolving
        async stat(resource) {
            try {
                const handle = await this.getHandle(resource);
                if (!handle) {
                    throw this.m(resource, 'No such file or directory, stat', files_1.FileSystemProviderErrorCode.FileNotFound);
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
                throw this.l(error);
            }
        }
        async readdir(resource) {
            try {
                const handle = await this.j(resource);
                if (!handle) {
                    throw this.m(resource, 'No such file or directory, readdir', files_1.FileSystemProviderErrorCode.FileNotFound);
                }
                const result = [];
                for await (const [name, child] of handle) {
                    result.push([name, webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(child) ? files_1.FileType.File : files_1.FileType.Directory]);
                }
                return result;
            }
            catch (error) {
                throw this.l(error);
            }
        }
        //#endregion
        //#region File Reading/Writing
        readFileStream(resource, opts, token) {
            const stream = (0, stream_1.$td)(data => buffer_1.$Fd.concat(data.map(data => buffer_1.$Fd.wrap(data))).buffer, {
                // Set a highWaterMark to prevent the stream
                // for file upload to produce large buffers
                // in-memory
                highWaterMark: 10
            });
            (async () => {
                try {
                    const handle = await this.i(resource);
                    if (!handle) {
                        throw this.m(resource, 'No such file or directory, readFile', files_1.FileSystemProviderErrorCode.FileNotFound);
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
                    stream.error(this.l(error));
                    stream.end();
                }
            })();
            return stream;
        }
        async readFile(resource) {
            try {
                const handle = await this.i(resource);
                if (!handle) {
                    throw this.m(resource, 'No such file or directory, readFile', files_1.FileSystemProviderErrorCode.FileNotFound);
                }
                const file = await handle.getFile();
                return new Uint8Array(await file.arrayBuffer());
            }
            catch (error) {
                throw this.l(error);
            }
        }
        async writeFile(resource, content, opts) {
            try {
                let handle = await this.i(resource);
                // Validate target unless { create: true, overwrite: true }
                if (!opts.create || !opts.overwrite) {
                    if (handle) {
                        if (!opts.overwrite) {
                            throw this.m(resource, 'File already exists, writeFile', files_1.FileSystemProviderErrorCode.FileExists);
                        }
                    }
                    else {
                        if (!opts.create) {
                            throw this.m(resource, 'No such file, writeFile', files_1.FileSystemProviderErrorCode.FileNotFound);
                        }
                    }
                }
                // Create target as needed
                if (!handle) {
                    const parent = await this.j(this.a.dirname(resource));
                    if (!parent) {
                        throw this.m(resource, 'No such parent directory, writeFile', files_1.FileSystemProviderErrorCode.FileNotFound);
                    }
                    handle = await parent.getFileHandle(this.a.basename(resource), { create: true });
                    if (!handle) {
                        throw this.m(resource, 'Unable to create file , writeFile', files_1.FileSystemProviderErrorCode.Unknown);
                    }
                }
                // Write to target overwriting any existing contents
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
            }
            catch (error) {
                throw this.l(error);
            }
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        async mkdir(resource) {
            try {
                const parent = await this.j(this.a.dirname(resource));
                if (!parent) {
                    throw this.m(resource, 'No such parent directory, mkdir', files_1.FileSystemProviderErrorCode.FileNotFound);
                }
                await parent.getDirectoryHandle(this.a.basename(resource), { create: true });
            }
            catch (error) {
                throw this.l(error);
            }
        }
        async delete(resource, opts) {
            try {
                const parent = await this.j(this.a.dirname(resource));
                if (!parent) {
                    throw this.m(resource, 'No such parent directory, delete', files_1.FileSystemProviderErrorCode.FileNotFound);
                }
                return parent.removeEntry(this.a.basename(resource), { recursive: opts.recursive });
            }
            catch (error) {
                throw this.l(error);
            }
        }
        async rename(from, to, opts) {
            try {
                if (this.a.isEqual(from, to)) {
                    return; // no-op if the paths are the same
                }
                // Implement file rename by write + delete
                const fileHandle = await this.i(from);
                if (fileHandle) {
                    const file = await fileHandle.getFile();
                    const contents = new Uint8Array(await file.arrayBuffer());
                    await this.writeFile(to, contents, { create: true, overwrite: opts.overwrite, unlock: false, atomic: false });
                    await this.delete(from, { recursive: false, useTrash: false, atomic: false });
                }
                // File API does not support any real rename otherwise
                else {
                    throw this.m(from, (0, nls_1.localize)(0, null), files_1.FileSystemProviderErrorCode.Unavailable);
                }
            }
            catch (error) {
                throw this.l(error);
            }
        }
        //#endregion
        //#region File Watching (unsupported)
        watch(resource, opts) {
            return lifecycle_1.$kc.None;
        }
        registerFileHandle(handle) {
            return this.h(handle, this.f);
        }
        registerDirectoryHandle(handle) {
            return this.h(handle, this.g);
        }
        get directories() {
            return this.g.values();
        }
        async h(handle, map) {
            let handleId = `/${handle.name}`;
            // Compute a valid handle ID in case this exists already
            if (map.has(handleId) && !await map.get(handleId)?.isSameEntry(handle)) {
                const fileExt = (0, path_1.$be)(handle.name);
                const fileName = (0, path_1.$ae)(handle.name, fileExt);
                let handleIdCounter = 1;
                do {
                    handleId = `/${fileName}-${handleIdCounter++}${fileExt}`;
                } while (map.has(handleId) && !await map.get(handleId)?.isSameEntry(handle));
            }
            map.set(handleId, handle);
            // Remember in IndexDB for future lookup
            try {
                await this.c?.runInTransaction(this.d, 'readwrite', objectStore => objectStore.put(handle, handleId));
            }
            catch (error) {
                this.e.error(error);
            }
            return uri_1.URI.from({ scheme: network_1.Schemas.file, path: handleId });
        }
        async getHandle(resource) {
            // First: try to find a well known handle first
            let handle = await this.k(resource);
            // Second: walk up parent directories and resolve handle if possible
            if (!handle) {
                const parent = await this.j(this.a.dirname(resource));
                if (parent) {
                    const name = resources_1.$$f.basename(resource);
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
        async i(resource) {
            const handle = await this.k(resource);
            if (handle instanceof FileSystemFileHandle) {
                return handle;
            }
            const parent = await this.j(this.a.dirname(resource));
            try {
                return await parent?.getFileHandle(resources_1.$$f.basename(resource));
            }
            catch (error) {
                return undefined; // guard against possible DOMException
            }
        }
        async j(resource) {
            const handle = await this.k(resource);
            if (handle instanceof FileSystemDirectoryHandle) {
                return handle;
            }
            const parentUri = this.a.dirname(resource);
            if (this.a.isEqual(parentUri, resource)) {
                return undefined; // return when root is reached to prevent infinite recursion
            }
            const parent = await this.j(parentUri);
            try {
                return await parent?.getDirectoryHandle(resources_1.$$f.basename(resource));
            }
            catch (error) {
                return undefined; // guard against possible DOMException
            }
        }
        async k(resource) {
            // We store file system handles with the `handle.name`
            // and as such require the resource to be on the root
            if (this.a.dirname(resource).path !== '/') {
                return undefined;
            }
            const handleId = resource.path.replace(/\/$/, ''); // remove potential slash from the end of the path
            // First: check if we have a known handle stored in memory
            const inMemoryHandle = this.f.get(handleId) ?? this.g.get(handleId);
            if (inMemoryHandle) {
                return inMemoryHandle;
            }
            // Second: check if we have a persisted handle in IndexedDB
            const persistedHandle = await this.c?.runInTransaction(this.d, 'readonly', store => store.get(handleId));
            if (webFileSystemAccess_1.WebFileSystemAccess.isFileSystemHandle(persistedHandle)) {
                let hasPermissions = await persistedHandle.queryPermission() === 'granted';
                try {
                    if (!hasPermissions) {
                        hasPermissions = await persistedHandle.requestPermission() === 'granted';
                    }
                }
                catch (error) {
                    this.e.error(error); // this can fail with a DOMException
                }
                if (hasPermissions) {
                    if (webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(persistedHandle)) {
                        this.f.set(handleId, persistedHandle);
                    }
                    else if (webFileSystemAccess_1.WebFileSystemAccess.isFileSystemDirectoryHandle(persistedHandle)) {
                        this.g.set(handleId, persistedHandle);
                    }
                    return persistedHandle;
                }
            }
            // Third: fail with an error
            throw this.m(resource, 'No file system handle registered', files_1.FileSystemProviderErrorCode.Unavailable);
        }
        //#endregion
        l(error) {
            if (error instanceof files_1.$ek) {
                return error; // avoid double conversion
            }
            let code = files_1.FileSystemProviderErrorCode.Unknown;
            if (error.name === 'NotAllowedError') {
                error = new Error((0, nls_1.localize)(1, null));
                code = files_1.FileSystemProviderErrorCode.Unavailable;
            }
            return (0, files_1.$fk)(error, code);
        }
        m(resource, msg, code) {
            return (0, files_1.$fk)(new Error(`${msg} (${(0, path_1.$7d)(resource.path)})`), code);
        }
    }
    exports.$46 = $46;
});
//# sourceMappingURL=htmlFileSystemProvider.js.map