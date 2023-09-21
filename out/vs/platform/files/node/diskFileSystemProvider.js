/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "graceful-fs", "vs/base/common/async", "vs/base/common/map", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/extpath", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/stream", "vs/base/node/pfs", "vs/nls", "vs/platform/files/common/files", "vs/platform/files/common/io", "vs/platform/files/common/diskFileSystemProvider", "vs/base/common/errorMessage", "vs/platform/files/node/watcher/watcherClient", "vs/platform/files/node/watcher/nodejs/nodejsClient"], function (require, exports, fs, graceful_fs_1, async_1, map_1, buffer_1, event_1, extpath_1, lifecycle_1, path_1, platform_1, resources_1, stream_1, pfs_1, nls_1, files_1, io_1, diskFileSystemProvider_1, errorMessage_1, watcherClient_1, nodejsClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiskFileSystemProvider = void 0;
    /**
     * Enable graceful-fs very early from here to have it enabled
     * in all contexts that leverage the disk file system provider.
     */
    (() => {
        try {
            (0, graceful_fs_1.gracefulify)(fs);
        }
        catch (error) {
            console.error(`Error enabling graceful-fs: ${(0, errorMessage_1.toErrorMessage)(error)}`);
        }
    })();
    class DiskFileSystemProvider extends diskFileSystemProvider_1.AbstractDiskFileSystemProvider {
        static { this.TRACE_LOG_RESOURCE_LOCKS = false; } // not enabled by default because very spammy
        constructor(logService, options) {
            super(logService, options);
            //#region File Capabilities
            this.onDidChangeCapabilities = event_1.Event.None;
            //#endregion
            //#region File Reading/Writing
            this.resourceLocks = new map_1.ResourceMap(resource => resources_1.extUriBiasedIgnorePathCase.getComparisonKey(resource));
            this.mapHandleToPos = new Map();
            this.mapHandleToLock = new Map();
            this.writeHandles = new Map();
        }
        get capabilities() {
            if (!this._capabilities) {
                this._capabilities =
                    2 /* FileSystemProviderCapabilities.FileReadWrite */ |
                        4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ |
                        16 /* FileSystemProviderCapabilities.FileReadStream */ |
                        8 /* FileSystemProviderCapabilities.FileFolderCopy */ |
                        8192 /* FileSystemProviderCapabilities.FileWriteUnlock */ |
                        16384 /* FileSystemProviderCapabilities.FileAtomicRead */ |
                        32768 /* FileSystemProviderCapabilities.FileAtomicWrite */ |
                        65536 /* FileSystemProviderCapabilities.FileAtomicDelete */ |
                        131072 /* FileSystemProviderCapabilities.FileClone */;
                if (platform_1.isLinux) {
                    this._capabilities |= 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
                }
            }
            return this._capabilities;
        }
        //#endregion
        //#region File Metadata Resolving
        async stat(resource) {
            try {
                const { stat, symbolicLink } = await pfs_1.SymlinkSupport.stat(this.toFilePath(resource)); // cannot use fs.stat() here to support links properly
                return {
                    type: this.toType(stat, symbolicLink),
                    ctime: stat.birthtime.getTime(),
                    mtime: stat.mtime.getTime(),
                    size: stat.size,
                    permissions: (stat.mode & 0o200) === 0 ? files_1.FilePermission.Locked : undefined
                };
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        async statIgnoreError(resource) {
            try {
                return await this.stat(resource);
            }
            catch (error) {
                return undefined;
            }
        }
        async readdir(resource) {
            try {
                const children = await pfs_1.Promises.readdir(this.toFilePath(resource), { withFileTypes: true });
                const result = [];
                await Promise.all(children.map(async (child) => {
                    try {
                        let type;
                        if (child.isSymbolicLink()) {
                            type = (await this.stat((0, resources_1.joinPath)(resource, child.name))).type; // always resolve target the link points to if any
                        }
                        else {
                            type = this.toType(child);
                        }
                        result.push([child.name, type]);
                    }
                    catch (error) {
                        this.logService.trace(error); // ignore errors for individual entries that can arise from permission denied
                    }
                }));
                return result;
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        toType(entry, symbolicLink) {
            // Signal file type by checking for file / directory, except:
            // - symbolic links pointing to nonexistent files are FileType.Unknown
            // - files that are neither file nor directory are FileType.Unknown
            let type;
            if (symbolicLink?.dangling) {
                type = files_1.FileType.Unknown;
            }
            else if (entry.isFile()) {
                type = files_1.FileType.File;
            }
            else if (entry.isDirectory()) {
                type = files_1.FileType.Directory;
            }
            else {
                type = files_1.FileType.Unknown;
            }
            // Always signal symbolic link as file type additionally
            if (symbolicLink) {
                type |= files_1.FileType.SymbolicLink;
            }
            return type;
        }
        async createResourceLock(resource) {
            const filePath = this.toFilePath(resource);
            this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - request to acquire resource lock (${filePath})`);
            // Await pending locks for resource. It is possible for a new lock being
            // added right after opening, so we have to loop over locks until no lock
            // remains.
            let existingLock = undefined;
            while (existingLock = this.resourceLocks.get(resource)) {
                this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - waiting for resource lock to be released (${filePath})`);
                await existingLock.wait();
            }
            // Store new
            const newLock = new async_1.Barrier();
            this.resourceLocks.set(resource, newLock);
            this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - new resource lock created (${filePath})`);
            return (0, lifecycle_1.toDisposable)(() => {
                this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - resource lock dispose() (${filePath})`);
                // Delete lock if it is still ours
                if (this.resourceLocks.get(resource) === newLock) {
                    this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - resource lock removed from resource-lock map (${filePath})`);
                    this.resourceLocks.delete(resource);
                }
                // Open lock
                this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - resource lock barrier open() (${filePath})`);
                newLock.open();
            });
        }
        async readFile(resource, options) {
            let lock = undefined;
            try {
                if (options?.atomic) {
                    this.traceLock(`[Disk FileSystemProvider]: atomic read operation started (${this.toFilePath(resource)})`);
                    // When the read should be atomic, make sure
                    // to await any pending locks for the resource
                    // and lock for the duration of the read.
                    lock = await this.createResourceLock(resource);
                }
                const filePath = this.toFilePath(resource);
                return await pfs_1.Promises.readFile(filePath);
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
            finally {
                lock?.dispose();
            }
        }
        traceLock(msg) {
            if (DiskFileSystemProvider.TRACE_LOG_RESOURCE_LOCKS) {
                this.logService.trace(msg);
            }
        }
        readFileStream(resource, opts, token) {
            const stream = (0, stream_1.newWriteableStream)(data => buffer_1.VSBuffer.concat(data.map(data => buffer_1.VSBuffer.wrap(data))).buffer);
            (0, io_1.readFileIntoStream)(this, resource, stream, data => data.buffer, {
                ...opts,
                bufferSize: 256 * 1024 // read into chunks of 256kb each to reduce IPC overhead
            }, token);
            return stream;
        }
        async writeFile(resource, content, opts) {
            if (opts?.atomic !== false && opts?.atomic?.postfix) {
                return this.doWriteFileAtomic(resource, (0, resources_1.joinPath)((0, resources_1.dirname)(resource), `${(0, resources_1.basename)(resource)}${opts.atomic.postfix}`), content, opts);
            }
            else {
                return this.doWriteFile(resource, content, opts);
            }
        }
        async doWriteFileAtomic(resource, tempResource, content, opts) {
            // Write to temp resource first
            await this.doWriteFile(tempResource, content, opts);
            try {
                // Rename over existing to ensure atomic replace
                await this.rename(tempResource, resource, { overwrite: true });
            }
            catch (error) {
                // Cleanup in case of rename error
                try {
                    await this.delete(tempResource, { recursive: false, useTrash: false, atomic: false });
                }
                catch (error) {
                    // ignore - we want the outer error to bubble up
                }
                throw error;
            }
        }
        async doWriteFile(resource, content, opts) {
            let handle = undefined;
            try {
                const filePath = this.toFilePath(resource);
                // Validate target unless { create: true, overwrite: true }
                if (!opts.create || !opts.overwrite) {
                    const fileExists = await pfs_1.Promises.exists(filePath);
                    if (fileExists) {
                        if (!opts.overwrite) {
                            throw (0, files_1.createFileSystemProviderError)((0, nls_1.localize)('fileExists', "File already exists"), files_1.FileSystemProviderErrorCode.FileExists);
                        }
                    }
                    else {
                        if (!opts.create) {
                            throw (0, files_1.createFileSystemProviderError)((0, nls_1.localize)('fileNotExists', "File does not exist"), files_1.FileSystemProviderErrorCode.FileNotFound);
                        }
                    }
                }
                // Open
                handle = await this.open(resource, { create: true, unlock: opts.unlock });
                // Write content at once
                await this.write(handle, 0, content, 0, content.byteLength);
            }
            catch (error) {
                throw await this.toFileSystemProviderWriteError(resource, error);
            }
            finally {
                if (typeof handle === 'number') {
                    await this.close(handle);
                }
            }
        }
        static { this.canFlush = true; }
        static configureFlushOnWrite(enabled) {
            DiskFileSystemProvider.canFlush = enabled;
        }
        async open(resource, opts) {
            const filePath = this.toFilePath(resource);
            // Writes: guard multiple writes to the same resource
            // behind a single lock to prevent races when writing
            // from multiple places at the same time to the same file
            let lock = undefined;
            if ((0, files_1.isFileOpenForWriteOptions)(opts)) {
                lock = await this.createResourceLock(resource);
            }
            let fd = undefined;
            try {
                // Determine whether to unlock the file (write only)
                if ((0, files_1.isFileOpenForWriteOptions)(opts) && opts.unlock) {
                    try {
                        const { stat } = await pfs_1.SymlinkSupport.stat(filePath);
                        if (!(stat.mode & 0o200 /* File mode indicating writable by owner */)) {
                            await pfs_1.Promises.chmod(filePath, stat.mode | 0o200);
                        }
                    }
                    catch (error) {
                        if (error.code !== 'ENOENT') {
                            this.logService.trace(error); // ignore any errors here and try to just write
                        }
                    }
                }
                // Determine file flags for opening (read vs write)
                let flags = undefined;
                if ((0, files_1.isFileOpenForWriteOptions)(opts)) {
                    if (platform_1.isWindows) {
                        try {
                            // On Windows and if the file exists, we use a different strategy of saving the file
                            // by first truncating the file and then writing with r+ flag. This helps to save hidden files on Windows
                            // (see https://github.com/microsoft/vscode/issues/931) and prevent removing alternate data streams
                            // (see https://github.com/microsoft/vscode/issues/6363)
                            await pfs_1.Promises.truncate(filePath, 0);
                            // After a successful truncate() the flag can be set to 'r+' which will not truncate.
                            flags = 'r+';
                        }
                        catch (error) {
                            if (error.code !== 'ENOENT') {
                                this.logService.trace(error);
                            }
                        }
                    }
                    // We take opts.create as a hint that the file is opened for writing
                    // as such we use 'w' to truncate an existing or create the
                    // file otherwise. we do not allow reading.
                    if (!flags) {
                        flags = 'w';
                    }
                }
                else {
                    // Otherwise we assume the file is opened for reading
                    // as such we use 'r' to neither truncate, nor create
                    // the file.
                    flags = 'r';
                }
                // Finally open handle to file path
                fd = await pfs_1.Promises.open(filePath, flags);
            }
            catch (error) {
                // Release lock because we have no valid handle
                // if we did open a lock during this operation
                lock?.dispose();
                // Rethrow as file system provider error
                if ((0, files_1.isFileOpenForWriteOptions)(opts)) {
                    throw await this.toFileSystemProviderWriteError(resource, error);
                }
                else {
                    throw this.toFileSystemProviderError(error);
                }
            }
            // Remember this handle to track file position of the handle
            // we init the position to 0 since the file descriptor was
            // just created and the position was not moved so far (see
            // also http://man7.org/linux/man-pages/man2/open.2.html -
            // "The file offset is set to the beginning of the file.")
            this.mapHandleToPos.set(fd, 0);
            // remember that this handle was used for writing
            if ((0, files_1.isFileOpenForWriteOptions)(opts)) {
                this.writeHandles.set(fd, resource);
            }
            if (lock) {
                const previousLock = this.mapHandleToLock.get(fd);
                // Remember that this handle has an associated lock
                this.traceLock(`[Disk FileSystemProvider]: open() - storing lock for handle ${fd} (${filePath})`);
                this.mapHandleToLock.set(fd, lock);
                // There is a slight chance that a resource lock for a
                // handle was not yet disposed when we acquire a new
                // lock, so we must ensure to dispose the previous lock
                // before storing a new one for the same handle, other
                // wise we end up in a deadlock situation
                // https://github.com/microsoft/vscode/issues/142462
                if (previousLock) {
                    this.traceLock(`[Disk FileSystemProvider]: open() - disposing a previous lock that was still stored on same handle ${fd} (${filePath})`);
                    previousLock.dispose();
                }
            }
            return fd;
        }
        async close(fd) {
            // It is very important that we keep any associated lock
            // for the file handle before attempting to call `fs.close(fd)`
            // because of a possible race condition: as soon as a file
            // handle is released, the OS may assign the same handle to
            // the next `fs.open` call and as such it is possible that our
            // lock is getting overwritten
            const lockForHandle = this.mapHandleToLock.get(fd);
            try {
                // Remove this handle from map of positions
                this.mapHandleToPos.delete(fd);
                // If a handle is closed that was used for writing, ensure
                // to flush the contents to disk if possible.
                if (this.writeHandles.delete(fd) && DiskFileSystemProvider.canFlush) {
                    try {
                        await pfs_1.Promises.fdatasync(fd); // https://github.com/microsoft/vscode/issues/9589
                    }
                    catch (error) {
                        // In some exotic setups it is well possible that node fails to sync
                        // In that case we disable flushing and log the error to our logger
                        DiskFileSystemProvider.configureFlushOnWrite(false);
                        this.logService.error(error);
                    }
                }
                return await pfs_1.Promises.close(fd);
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
            finally {
                if (lockForHandle) {
                    if (this.mapHandleToLock.get(fd) === lockForHandle) {
                        this.traceLock(`[Disk FileSystemProvider]: close() - resource lock removed from handle-lock map ${fd}`);
                        this.mapHandleToLock.delete(fd); // only delete from map if this is still our lock!
                    }
                    this.traceLock(`[Disk FileSystemProvider]: close() - disposing lock for handle ${fd}`);
                    lockForHandle.dispose();
                }
            }
        }
        async read(fd, pos, data, offset, length) {
            const normalizedPos = this.normalizePos(fd, pos);
            let bytesRead = null;
            try {
                bytesRead = (await pfs_1.Promises.read(fd, data, offset, length, normalizedPos)).bytesRead;
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
            finally {
                this.updatePos(fd, normalizedPos, bytesRead);
            }
            return bytesRead;
        }
        normalizePos(fd, pos) {
            // When calling fs.read/write we try to avoid passing in the "pos" argument and
            // rather prefer to pass in "null" because this avoids an extra seek(pos)
            // call that in some cases can even fail (e.g. when opening a file over FTP -
            // see https://github.com/microsoft/vscode/issues/73884).
            //
            // as such, we compare the passed in position argument with our last known
            // position for the file descriptor and use "null" if they match.
            if (pos === this.mapHandleToPos.get(fd)) {
                return null;
            }
            return pos;
        }
        updatePos(fd, pos, bytesLength) {
            const lastKnownPos = this.mapHandleToPos.get(fd);
            if (typeof lastKnownPos === 'number') {
                // pos !== null signals that previously a position was used that is
                // not null. node.js documentation explains, that in this case
                // the internal file pointer is not moving and as such we do not move
                // our position pointer.
                //
                // Docs: "If position is null, data will be read from the current file position,
                // and the file position will be updated. If position is an integer, the file position
                // will remain unchanged."
                if (typeof pos === 'number') {
                    // do not modify the position
                }
                // bytesLength = number is a signal that the read/write operation was
                // successful and as such we need to advance the position in the Map
                //
                // Docs (http://man7.org/linux/man-pages/man2/read.2.html):
                // "On files that support seeking, the read operation commences at the
                // file offset, and the file offset is incremented by the number of
                // bytes read."
                //
                // Docs (http://man7.org/linux/man-pages/man2/write.2.html):
                // "For a seekable file (i.e., one to which lseek(2) may be applied, for
                // example, a regular file) writing takes place at the file offset, and
                // the file offset is incremented by the number of bytes actually
                // written."
                else if (typeof bytesLength === 'number') {
                    this.mapHandleToPos.set(fd, lastKnownPos + bytesLength);
                }
                // bytesLength = null signals an error in the read/write operation
                // and as such we drop the handle from the Map because the position
                // is unspecificed at this point.
                else {
                    this.mapHandleToPos.delete(fd);
                }
            }
        }
        async write(fd, pos, data, offset, length) {
            // We know at this point that the file to write to is truncated and thus empty
            // if the write now fails, the file remains empty. as such we really try hard
            // to ensure the write succeeds by retrying up to three times.
            return (0, async_1.retry)(() => this.doWrite(fd, pos, data, offset, length), 100 /* ms delay */, 3 /* retries */);
        }
        async doWrite(fd, pos, data, offset, length) {
            const normalizedPos = this.normalizePos(fd, pos);
            let bytesWritten = null;
            try {
                bytesWritten = (await pfs_1.Promises.write(fd, data, offset, length, normalizedPos)).bytesWritten;
            }
            catch (error) {
                throw await this.toFileSystemProviderWriteError(this.writeHandles.get(fd), error);
            }
            finally {
                this.updatePos(fd, normalizedPos, bytesWritten);
            }
            return bytesWritten;
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        async mkdir(resource) {
            try {
                await pfs_1.Promises.mkdir(this.toFilePath(resource));
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        async delete(resource, opts) {
            try {
                const filePath = this.toFilePath(resource);
                if (opts.recursive) {
                    let rmMoveToPath = undefined;
                    if (opts?.atomic !== false && opts.atomic.postfix) {
                        rmMoveToPath = (0, path_1.join)((0, path_1.dirname)(filePath), `${(0, path_1.basename)(filePath)}${opts.atomic.postfix}`);
                    }
                    await pfs_1.Promises.rm(filePath, pfs_1.RimRafMode.MOVE, rmMoveToPath);
                }
                else {
                    try {
                        await pfs_1.Promises.unlink(filePath);
                    }
                    catch (unlinkError) {
                        // `fs.unlink` will throw when used on directories
                        // we try to detect this error and then see if the
                        // provided resource is actually a directory. in that
                        // case we use `fs.rmdir` to delete the directory.
                        if (unlinkError.code === 'EPERM' || unlinkError.code === 'EISDIR') {
                            let isDirectory = false;
                            try {
                                const { stat, symbolicLink } = await pfs_1.SymlinkSupport.stat(filePath);
                                isDirectory = stat.isDirectory() && !symbolicLink;
                            }
                            catch (statError) {
                                // ignore
                            }
                            if (isDirectory) {
                                await pfs_1.Promises.rmdir(filePath);
                            }
                            else {
                                throw unlinkError;
                            }
                        }
                        else {
                            throw unlinkError;
                        }
                    }
                }
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        async rename(from, to, opts) {
            const fromFilePath = this.toFilePath(from);
            const toFilePath = this.toFilePath(to);
            if (fromFilePath === toFilePath) {
                return; // simulate node.js behaviour here and do a no-op if paths match
            }
            try {
                // Validate the move operation can perform
                await this.validateMoveCopy(from, to, 'move', opts.overwrite);
                // Rename
                await pfs_1.Promises.rename(fromFilePath, toFilePath);
            }
            catch (error) {
                // Rewrite some typical errors that can happen especially around symlinks
                // to something the user can better understand
                if (error.code === 'EINVAL' || error.code === 'EBUSY' || error.code === 'ENAMETOOLONG') {
                    error = new Error((0, nls_1.localize)('moveError', "Unable to move '{0}' into '{1}' ({2}).", (0, path_1.basename)(fromFilePath), (0, path_1.basename)((0, path_1.dirname)(toFilePath)), error.toString()));
                }
                throw this.toFileSystemProviderError(error);
            }
        }
        async copy(from, to, opts) {
            const fromFilePath = this.toFilePath(from);
            const toFilePath = this.toFilePath(to);
            if (fromFilePath === toFilePath) {
                return; // simulate node.js behaviour here and do a no-op if paths match
            }
            try {
                // Validate the copy operation can perform
                await this.validateMoveCopy(from, to, 'copy', opts.overwrite);
                // Copy
                await pfs_1.Promises.copy(fromFilePath, toFilePath, { preserveSymlinks: true });
            }
            catch (error) {
                // Rewrite some typical errors that can happen especially around symlinks
                // to something the user can better understand
                if (error.code === 'EINVAL' || error.code === 'EBUSY' || error.code === 'ENAMETOOLONG') {
                    error = new Error((0, nls_1.localize)('copyError', "Unable to copy '{0}' into '{1}' ({2}).", (0, path_1.basename)(fromFilePath), (0, path_1.basename)((0, path_1.dirname)(toFilePath)), error.toString()));
                }
                throw this.toFileSystemProviderError(error);
            }
        }
        async validateMoveCopy(from, to, mode, overwrite) {
            const fromFilePath = this.toFilePath(from);
            const toFilePath = this.toFilePath(to);
            let isSameResourceWithDifferentPathCase = false;
            const isPathCaseSensitive = !!(this.capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
            if (!isPathCaseSensitive) {
                isSameResourceWithDifferentPathCase = (0, extpath_1.isEqual)(fromFilePath, toFilePath, true /* ignore case */);
            }
            if (isSameResourceWithDifferentPathCase) {
                // You cannot copy the same file to the same location with different
                // path case unless you are on a case sensitive file system
                if (mode === 'copy') {
                    throw (0, files_1.createFileSystemProviderError)((0, nls_1.localize)('fileCopyErrorPathCase', "File cannot be copied to same path with different path case"), files_1.FileSystemProviderErrorCode.FileExists);
                }
                // You can move the same file to the same location with different
                // path case on case insensitive file systems
                else if (mode === 'move') {
                    return;
                }
            }
            // Here we have to see if the target to move/copy to exists or not.
            // We need to respect the `overwrite` option to throw in case the
            // target exists.
            const fromStat = await this.statIgnoreError(from);
            if (!fromStat) {
                throw (0, files_1.createFileSystemProviderError)((0, nls_1.localize)('fileMoveCopyErrorNotFound', "File to move/copy does not exist"), files_1.FileSystemProviderErrorCode.FileNotFound);
            }
            const toStat = await this.statIgnoreError(to);
            if (!toStat) {
                return; // target does not exist so we are good
            }
            if (!overwrite) {
                throw (0, files_1.createFileSystemProviderError)((0, nls_1.localize)('fileMoveCopyErrorExists', "File at target already exists and thus will not be moved/copied to unless overwrite is specified"), files_1.FileSystemProviderErrorCode.FileExists);
            }
            // Handle existing target for move/copy
            if ((fromStat.type & files_1.FileType.File) !== 0 && (toStat.type & files_1.FileType.File) !== 0) {
                return; // node.js can move/copy a file over an existing file without having to delete it first
            }
            else {
                await this.delete(to, { recursive: true, useTrash: false, atomic: false });
            }
        }
        //#endregion
        //#region Clone File
        async cloneFile(from, to) {
            return this.doCloneFile(from, to, false /* optimistically assume parent folders exist */);
        }
        async doCloneFile(from, to, mkdir) {
            const fromFilePath = this.toFilePath(from);
            const toFilePath = this.toFilePath(to);
            const isPathCaseSensitive = !!(this.capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
            if ((0, extpath_1.isEqual)(fromFilePath, toFilePath, !isPathCaseSensitive)) {
                return; // cloning is only supported `from` and `to` are different files
            }
            // Implement clone by using `fs.copyFile`, however setup locks
            // for both `from` and `to` because node.js does not ensure
            // this to be an atomic operation
            const locks = new lifecycle_1.DisposableStore();
            try {
                const [fromLock, toLock] = await Promise.all([
                    this.createResourceLock(from),
                    this.createResourceLock(to)
                ]);
                locks.add(fromLock);
                locks.add(toLock);
                if (mkdir) {
                    await pfs_1.Promises.mkdir((0, path_1.dirname)(toFilePath), { recursive: true });
                }
                await pfs_1.Promises.copyFile(fromFilePath, toFilePath);
            }
            catch (error) {
                if (error.code === 'ENOENT' && !mkdir) {
                    return this.doCloneFile(from, to, true);
                }
                throw this.toFileSystemProviderError(error);
            }
            finally {
                locks.dispose();
            }
        }
        //#endregion
        //#region File Watching
        createUniversalWatcher(onChange, onLogMessage, verboseLogging) {
            return new watcherClient_1.UniversalWatcherClient(changes => onChange(changes), msg => onLogMessage(msg), verboseLogging);
        }
        createNonRecursiveWatcher(onChange, onLogMessage, verboseLogging) {
            return new nodejsClient_1.NodeJSWatcherClient(changes => onChange(changes), msg => onLogMessage(msg), verboseLogging);
        }
        //#endregion
        //#region Helpers
        toFileSystemProviderError(error) {
            if (error instanceof files_1.FileSystemProviderError) {
                return error; // avoid double conversion
            }
            let resultError = error;
            let code;
            switch (error.code) {
                case 'ENOENT':
                    code = files_1.FileSystemProviderErrorCode.FileNotFound;
                    break;
                case 'EISDIR':
                    code = files_1.FileSystemProviderErrorCode.FileIsADirectory;
                    break;
                case 'ENOTDIR':
                    code = files_1.FileSystemProviderErrorCode.FileNotADirectory;
                    break;
                case 'EEXIST':
                    code = files_1.FileSystemProviderErrorCode.FileExists;
                    break;
                case 'EPERM':
                case 'EACCES':
                    code = files_1.FileSystemProviderErrorCode.NoPermissions;
                    break;
                case 'ERR_UNC_HOST_NOT_ALLOWED':
                    resultError = `${error.message}. Please update the 'security.allowedUNCHosts' setting if you want to allow this host.`;
                    code = files_1.FileSystemProviderErrorCode.Unknown;
                    break;
                default:
                    code = files_1.FileSystemProviderErrorCode.Unknown;
            }
            return (0, files_1.createFileSystemProviderError)(resultError, code);
        }
        async toFileSystemProviderWriteError(resource, error) {
            let fileSystemProviderWriteError = this.toFileSystemProviderError(error);
            // If the write error signals permission issues, we try
            // to read the file's mode to see if the file is write
            // locked.
            if (resource && fileSystemProviderWriteError.code === files_1.FileSystemProviderErrorCode.NoPermissions) {
                try {
                    const { stat } = await pfs_1.SymlinkSupport.stat(this.toFilePath(resource));
                    if (!(stat.mode & 0o200 /* File mode indicating writable by owner */)) {
                        fileSystemProviderWriteError = (0, files_1.createFileSystemProviderError)(error, files_1.FileSystemProviderErrorCode.FileWriteLocked);
                    }
                }
                catch (error) {
                    this.logService.trace(error); // ignore - return original error
                }
            }
            return fileSystemProviderWriteError;
        }
    }
    exports.DiskFileSystemProvider = DiskFileSystemProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlza0ZpbGVTeXN0ZW1Qcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL25vZGUvZGlza0ZpbGVTeXN0ZW1Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUEyQmhHOzs7T0FHRztJQUNILENBQUMsR0FBRyxFQUFFO1FBQ0wsSUFBSTtZQUNILElBQUEseUJBQVcsRUFBQyxFQUFFLENBQUMsQ0FBQztTQUNoQjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsSUFBQSw2QkFBYyxFQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUN0RTtJQUNGLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFTCxNQUFhLHNCQUF1QixTQUFRLHVEQUE4QjtpQkFVMUQsNkJBQXdCLEdBQUcsS0FBSyxBQUFSLENBQVMsR0FBQyw2Q0FBNkM7UUFFOUYsWUFDQyxVQUF1QixFQUN2QixPQUF3QztZQUV4QyxLQUFLLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRzVCLDJCQUEyQjtZQUVsQiw0QkFBdUIsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1lBc0c5QyxZQUFZO1lBRVosOEJBQThCO1lBRWIsa0JBQWEsR0FBRyxJQUFJLGlCQUFXLENBQVUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxzQ0FBMEIsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBMkk1RyxtQkFBYyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBQzNDLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQXVCLENBQUM7WUFFakQsaUJBQVksR0FBRyxJQUFJLEdBQUcsRUFBZSxDQUFDO1FBNVB2RCxDQUFDO1FBT0QsSUFBSSxZQUFZO1lBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7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