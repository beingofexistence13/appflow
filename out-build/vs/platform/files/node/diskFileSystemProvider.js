/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "graceful-fs", "vs/base/common/async", "vs/base/common/map", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/extpath", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/stream", "vs/base/node/pfs", "vs/nls!vs/platform/files/node/diskFileSystemProvider", "vs/platform/files/common/files", "vs/platform/files/common/io", "vs/platform/files/common/diskFileSystemProvider", "vs/base/common/errorMessage", "vs/platform/files/node/watcher/watcherClient", "vs/platform/files/node/watcher/nodejs/nodejsClient"], function (require, exports, fs, graceful_fs_1, async_1, map_1, buffer_1, event_1, extpath_1, lifecycle_1, path_1, platform_1, resources_1, stream_1, pfs_1, nls_1, files_1, io_1, diskFileSystemProvider_1, errorMessage_1, watcherClient_1, nodejsClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3p = void 0;
    /**
     * Enable graceful-fs very early from here to have it enabled
     * in all contexts that leverage the disk file system provider.
     */
    (() => {
        try {
            (0, graceful_fs_1.gracefulify)(fs);
        }
        catch (error) {
            console.error(`Error enabling graceful-fs: ${(0, errorMessage_1.$mi)(error)}`);
        }
    })();
    class $3p extends diskFileSystemProvider_1.$Mp {
        static { this.I = false; } // not enabled by default because very spammy
        constructor(logService, options) {
            super(logService, options);
            //#region File Capabilities
            this.onDidChangeCapabilities = event_1.Event.None;
            //#endregion
            //#region File Reading/Writing
            this.N = new map_1.$zi(resource => resources_1.$_f.getComparisonKey(resource));
            this.S = new Map();
            this.U = new Map();
            this.W = new Map();
        }
        get capabilities() {
            if (!this.J) {
                this.J =
                    2 /* FileSystemProviderCapabilities.FileReadWrite */ |
                        4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ |
                        16 /* FileSystemProviderCapabilities.FileReadStream */ |
                        8 /* FileSystemProviderCapabilities.FileFolderCopy */ |
                        8192 /* FileSystemProviderCapabilities.FileWriteUnlock */ |
                        16384 /* FileSystemProviderCapabilities.FileAtomicRead */ |
                        32768 /* FileSystemProviderCapabilities.FileAtomicWrite */ |
                        65536 /* FileSystemProviderCapabilities.FileAtomicDelete */ |
                        131072 /* FileSystemProviderCapabilities.FileClone */;
                if (platform_1.$k) {
                    this.J |= 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
                }
            }
            return this.J;
        }
        //#endregion
        //#region File Metadata Resolving
        async stat(resource) {
            try {
                const { stat, symbolicLink } = await pfs_1.SymlinkSupport.stat(this.H(resource)); // cannot use fs.stat() here to support links properly
                return {
                    type: this.M(stat, symbolicLink),
                    ctime: stat.birthtime.getTime(),
                    mtime: stat.mtime.getTime(),
                    size: stat.size,
                    permissions: (stat.mode & 0o200) === 0 ? files_1.FilePermission.Locked : undefined
                };
            }
            catch (error) {
                throw this.eb(error);
            }
        }
        async L(resource) {
            try {
                return await this.stat(resource);
            }
            catch (error) {
                return undefined;
            }
        }
        async readdir(resource) {
            try {
                const children = await pfs_1.Promises.readdir(this.H(resource), { withFileTypes: true });
                const result = [];
                await Promise.all(children.map(async (child) => {
                    try {
                        let type;
                        if (child.isSymbolicLink()) {
                            type = (await this.stat((0, resources_1.$ig)(resource, child.name))).type; // always resolve target the link points to if any
                        }
                        else {
                            type = this.M(child);
                        }
                        result.push([child.name, type]);
                    }
                    catch (error) {
                        this.a.trace(error); // ignore errors for individual entries that can arise from permission denied
                    }
                }));
                return result;
            }
            catch (error) {
                throw this.eb(error);
            }
        }
        M(entry, symbolicLink) {
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
        async O(resource) {
            const filePath = this.H(resource);
            this.P(`[Disk FileSystemProvider]: createResourceLock() - request to acquire resource lock (${filePath})`);
            // Await pending locks for resource. It is possible for a new lock being
            // added right after opening, so we have to loop over locks until no lock
            // remains.
            let existingLock = undefined;
            while (existingLock = this.N.get(resource)) {
                this.P(`[Disk FileSystemProvider]: createResourceLock() - waiting for resource lock to be released (${filePath})`);
                await existingLock.wait();
            }
            // Store new
            const newLock = new async_1.$Fg();
            this.N.set(resource, newLock);
            this.P(`[Disk FileSystemProvider]: createResourceLock() - new resource lock created (${filePath})`);
            return (0, lifecycle_1.$ic)(() => {
                this.P(`[Disk FileSystemProvider]: createResourceLock() - resource lock dispose() (${filePath})`);
                // Delete lock if it is still ours
                if (this.N.get(resource) === newLock) {
                    this.P(`[Disk FileSystemProvider]: createResourceLock() - resource lock removed from resource-lock map (${filePath})`);
                    this.N.delete(resource);
                }
                // Open lock
                this.P(`[Disk FileSystemProvider]: createResourceLock() - resource lock barrier open() (${filePath})`);
                newLock.open();
            });
        }
        async readFile(resource, options) {
            let lock = undefined;
            try {
                if (options?.atomic) {
                    this.P(`[Disk FileSystemProvider]: atomic read operation started (${this.H(resource)})`);
                    // When the read should be atomic, make sure
                    // to await any pending locks for the resource
                    // and lock for the duration of the read.
                    lock = await this.O(resource);
                }
                const filePath = this.H(resource);
                return await pfs_1.Promises.readFile(filePath);
            }
            catch (error) {
                throw this.eb(error);
            }
            finally {
                lock?.dispose();
            }
        }
        P(msg) {
            if ($3p.I) {
                this.a.trace(msg);
            }
        }
        readFileStream(resource, opts, token) {
            const stream = (0, stream_1.$td)(data => buffer_1.$Fd.concat(data.map(data => buffer_1.$Fd.wrap(data))).buffer);
            (0, io_1.$Cp)(this, resource, stream, data => data.buffer, {
                ...opts,
                bufferSize: 256 * 1024 // read into chunks of 256kb each to reduce IPC overhead
            }, token);
            return stream;
        }
        async writeFile(resource, content, opts) {
            if (opts?.atomic !== false && opts?.atomic?.postfix) {
                return this.Q(resource, (0, resources_1.$ig)((0, resources_1.$hg)(resource), `${(0, resources_1.$fg)(resource)}${opts.atomic.postfix}`), content, opts);
            }
            else {
                return this.R(resource, content, opts);
            }
        }
        async Q(resource, tempResource, content, opts) {
            // Write to temp resource first
            await this.R(tempResource, content, opts);
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
        async R(resource, content, opts) {
            let handle = undefined;
            try {
                const filePath = this.H(resource);
                // Validate target unless { create: true, overwrite: true }
                if (!opts.create || !opts.overwrite) {
                    const fileExists = await pfs_1.Promises.exists(filePath);
                    if (fileExists) {
                        if (!opts.overwrite) {
                            throw (0, files_1.$fk)((0, nls_1.localize)(0, null), files_1.FileSystemProviderErrorCode.FileExists);
                        }
                    }
                    else {
                        if (!opts.create) {
                            throw (0, files_1.$fk)((0, nls_1.localize)(1, null), files_1.FileSystemProviderErrorCode.FileNotFound);
                        }
                    }
                }
                // Open
                handle = await this.open(resource, { create: true, unlock: opts.unlock });
                // Write content at once
                await this.write(handle, 0, content, 0, content.byteLength);
            }
            catch (error) {
                throw await this.fb(resource, error);
            }
            finally {
                if (typeof handle === 'number') {
                    await this.close(handle);
                }
            }
        }
        static { this.X = true; }
        static configureFlushOnWrite(enabled) {
            $3p.X = enabled;
        }
        async open(resource, opts) {
            const filePath = this.H(resource);
            // Writes: guard multiple writes to the same resource
            // behind a single lock to prevent races when writing
            // from multiple places at the same time to the same file
            let lock = undefined;
            if ((0, files_1.$7j)(opts)) {
                lock = await this.O(resource);
            }
            let fd = undefined;
            try {
                // Determine whether to unlock the file (write only)
                if ((0, files_1.$7j)(opts) && opts.unlock) {
                    try {
                        const { stat } = await pfs_1.SymlinkSupport.stat(filePath);
                        if (!(stat.mode & 0o200 /* File mode indicating writable by owner */)) {
                            await pfs_1.Promises.chmod(filePath, stat.mode | 0o200);
                        }
                    }
                    catch (error) {
                        if (error.code !== 'ENOENT') {
                            this.a.trace(error); // ignore any errors here and try to just write
                        }
                    }
                }
                // Determine file flags for opening (read vs write)
                let flags = undefined;
                if ((0, files_1.$7j)(opts)) {
                    if (platform_1.$i) {
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
                                this.a.trace(error);
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
                if ((0, files_1.$7j)(opts)) {
                    throw await this.fb(resource, error);
                }
                else {
                    throw this.eb(error);
                }
            }
            // Remember this handle to track file position of the handle
            // we init the position to 0 since the file descriptor was
            // just created and the position was not moved so far (see
            // also http://man7.org/linux/man-pages/man2/open.2.html -
            // "The file offset is set to the beginning of the file.")
            this.S.set(fd, 0);
            // remember that this handle was used for writing
            if ((0, files_1.$7j)(opts)) {
                this.W.set(fd, resource);
            }
            if (lock) {
                const previousLock = this.U.get(fd);
                // Remember that this handle has an associated lock
                this.P(`[Disk FileSystemProvider]: open() - storing lock for handle ${fd} (${filePath})`);
                this.U.set(fd, lock);
                // There is a slight chance that a resource lock for a
                // handle was not yet disposed when we acquire a new
                // lock, so we must ensure to dispose the previous lock
                // before storing a new one for the same handle, other
                // wise we end up in a deadlock situation
                // https://github.com/microsoft/vscode/issues/142462
                if (previousLock) {
                    this.P(`[Disk FileSystemProvider]: open() - disposing a previous lock that was still stored on same handle ${fd} (${filePath})`);
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
            const lockForHandle = this.U.get(fd);
            try {
                // Remove this handle from map of positions
                this.S.delete(fd);
                // If a handle is closed that was used for writing, ensure
                // to flush the contents to disk if possible.
                if (this.W.delete(fd) && $3p.X) {
                    try {
                        await pfs_1.Promises.fdatasync(fd); // https://github.com/microsoft/vscode/issues/9589
                    }
                    catch (error) {
                        // In some exotic setups it is well possible that node fails to sync
                        // In that case we disable flushing and log the error to our logger
                        $3p.configureFlushOnWrite(false);
                        this.a.error(error);
                    }
                }
                return await pfs_1.Promises.close(fd);
            }
            catch (error) {
                throw this.eb(error);
            }
            finally {
                if (lockForHandle) {
                    if (this.U.get(fd) === lockForHandle) {
                        this.P(`[Disk FileSystemProvider]: close() - resource lock removed from handle-lock map ${fd}`);
                        this.U.delete(fd); // only delete from map if this is still our lock!
                    }
                    this.P(`[Disk FileSystemProvider]: close() - disposing lock for handle ${fd}`);
                    lockForHandle.dispose();
                }
            }
        }
        async read(fd, pos, data, offset, length) {
            const normalizedPos = this.Y(fd, pos);
            let bytesRead = null;
            try {
                bytesRead = (await pfs_1.Promises.read(fd, data, offset, length, normalizedPos)).bytesRead;
            }
            catch (error) {
                throw this.eb(error);
            }
            finally {
                this.Z(fd, normalizedPos, bytesRead);
            }
            return bytesRead;
        }
        Y(fd, pos) {
            // When calling fs.read/write we try to avoid passing in the "pos" argument and
            // rather prefer to pass in "null" because this avoids an extra seek(pos)
            // call that in some cases can even fail (e.g. when opening a file over FTP -
            // see https://github.com/microsoft/vscode/issues/73884).
            //
            // as such, we compare the passed in position argument with our last known
            // position for the file descriptor and use "null" if they match.
            if (pos === this.S.get(fd)) {
                return null;
            }
            return pos;
        }
        Z(fd, pos, bytesLength) {
            const lastKnownPos = this.S.get(fd);
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
                    this.S.set(fd, lastKnownPos + bytesLength);
                }
                // bytesLength = null signals an error in the read/write operation
                // and as such we drop the handle from the Map because the position
                // is unspecificed at this point.
                else {
                    this.S.delete(fd);
                }
            }
        }
        async write(fd, pos, data, offset, length) {
            // We know at this point that the file to write to is truncated and thus empty
            // if the write now fails, the file remains empty. as such we really try hard
            // to ensure the write succeeds by retrying up to three times.
            return (0, async_1.$Yg)(() => this.$(fd, pos, data, offset, length), 100 /* ms delay */, 3 /* retries */);
        }
        async $(fd, pos, data, offset, length) {
            const normalizedPos = this.Y(fd, pos);
            let bytesWritten = null;
            try {
                bytesWritten = (await pfs_1.Promises.write(fd, data, offset, length, normalizedPos)).bytesWritten;
            }
            catch (error) {
                throw await this.fb(this.W.get(fd), error);
            }
            finally {
                this.Z(fd, normalizedPos, bytesWritten);
            }
            return bytesWritten;
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        async mkdir(resource) {
            try {
                await pfs_1.Promises.mkdir(this.H(resource));
            }
            catch (error) {
                throw this.eb(error);
            }
        }
        async delete(resource, opts) {
            try {
                const filePath = this.H(resource);
                if (opts.recursive) {
                    let rmMoveToPath = undefined;
                    if (opts?.atomic !== false && opts.atomic.postfix) {
                        rmMoveToPath = (0, path_1.$9d)((0, path_1.$_d)(filePath), `${(0, path_1.$ae)(filePath)}${opts.atomic.postfix}`);
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
                throw this.eb(error);
            }
        }
        async rename(from, to, opts) {
            const fromFilePath = this.H(from);
            const toFilePath = this.H(to);
            if (fromFilePath === toFilePath) {
                return; // simulate node.js behaviour here and do a no-op if paths match
            }
            try {
                // Validate the move operation can perform
                await this.ab(from, to, 'move', opts.overwrite);
                // Rename
                await pfs_1.Promises.rename(fromFilePath, toFilePath);
            }
            catch (error) {
                // Rewrite some typical errors that can happen especially around symlinks
                // to something the user can better understand
                if (error.code === 'EINVAL' || error.code === 'EBUSY' || error.code === 'ENAMETOOLONG') {
                    error = new Error((0, nls_1.localize)(2, null, (0, path_1.$ae)(fromFilePath), (0, path_1.$ae)((0, path_1.$_d)(toFilePath)), error.toString()));
                }
                throw this.eb(error);
            }
        }
        async copy(from, to, opts) {
            const fromFilePath = this.H(from);
            const toFilePath = this.H(to);
            if (fromFilePath === toFilePath) {
                return; // simulate node.js behaviour here and do a no-op if paths match
            }
            try {
                // Validate the copy operation can perform
                await this.ab(from, to, 'copy', opts.overwrite);
                // Copy
                await pfs_1.Promises.copy(fromFilePath, toFilePath, { preserveSymlinks: true });
            }
            catch (error) {
                // Rewrite some typical errors that can happen especially around symlinks
                // to something the user can better understand
                if (error.code === 'EINVAL' || error.code === 'EBUSY' || error.code === 'ENAMETOOLONG') {
                    error = new Error((0, nls_1.localize)(3, null, (0, path_1.$ae)(fromFilePath), (0, path_1.$ae)((0, path_1.$_d)(toFilePath)), error.toString()));
                }
                throw this.eb(error);
            }
        }
        async ab(from, to, mode, overwrite) {
            const fromFilePath = this.H(from);
            const toFilePath = this.H(to);
            let isSameResourceWithDifferentPathCase = false;
            const isPathCaseSensitive = !!(this.capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
            if (!isPathCaseSensitive) {
                isSameResourceWithDifferentPathCase = (0, extpath_1.$Hf)(fromFilePath, toFilePath, true /* ignore case */);
            }
            if (isSameResourceWithDifferentPathCase) {
                // You cannot copy the same file to the same location with different
                // path case unless you are on a case sensitive file system
                if (mode === 'copy') {
                    throw (0, files_1.$fk)((0, nls_1.localize)(4, null), files_1.FileSystemProviderErrorCode.FileExists);
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
            const fromStat = await this.L(from);
            if (!fromStat) {
                throw (0, files_1.$fk)((0, nls_1.localize)(5, null), files_1.FileSystemProviderErrorCode.FileNotFound);
            }
            const toStat = await this.L(to);
            if (!toStat) {
                return; // target does not exist so we are good
            }
            if (!overwrite) {
                throw (0, files_1.$fk)((0, nls_1.localize)(6, null), files_1.FileSystemProviderErrorCode.FileExists);
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
            return this.bb(from, to, false /* optimistically assume parent folders exist */);
        }
        async bb(from, to, mkdir) {
            const fromFilePath = this.H(from);
            const toFilePath = this.H(to);
            const isPathCaseSensitive = !!(this.capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
            if ((0, extpath_1.$Hf)(fromFilePath, toFilePath, !isPathCaseSensitive)) {
                return; // cloning is only supported `from` and `to` are different files
            }
            // Implement clone by using `fs.copyFile`, however setup locks
            // for both `from` and `to` because node.js does not ensure
            // this to be an atomic operation
            const locks = new lifecycle_1.$jc();
            try {
                const [fromLock, toLock] = await Promise.all([
                    this.O(from),
                    this.O(to)
                ]);
                locks.add(fromLock);
                locks.add(toLock);
                if (mkdir) {
                    await pfs_1.Promises.mkdir((0, path_1.$_d)(toFilePath), { recursive: true });
                }
                await pfs_1.Promises.copyFile(fromFilePath, toFilePath);
            }
            catch (error) {
                if (error.code === 'ENOENT' && !mkdir) {
                    return this.bb(from, to, true);
                }
                throw this.eb(error);
            }
            finally {
                locks.dispose();
            }
        }
        //#endregion
        //#region File Watching
        t(onChange, onLogMessage, verboseLogging) {
            return new watcherClient_1.$Tp(changes => onChange(changes), msg => onLogMessage(msg), verboseLogging);
        }
        F(onChange, onLogMessage, verboseLogging) {
            return new nodejsClient_1.$2p(changes => onChange(changes), msg => onLogMessage(msg), verboseLogging);
        }
        //#endregion
        //#region Helpers
        eb(error) {
            if (error instanceof files_1.$ek) {
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
            return (0, files_1.$fk)(resultError, code);
        }
        async fb(resource, error) {
            let fileSystemProviderWriteError = this.eb(error);
            // If the write error signals permission issues, we try
            // to read the file's mode to see if the file is write
            // locked.
            if (resource && fileSystemProviderWriteError.code === files_1.FileSystemProviderErrorCode.NoPermissions) {
                try {
                    const { stat } = await pfs_1.SymlinkSupport.stat(this.H(resource));
                    if (!(stat.mode & 0o200 /* File mode indicating writable by owner */)) {
                        fileSystemProviderWriteError = (0, files_1.$fk)(error, files_1.FileSystemProviderErrorCode.FileWriteLocked);
                    }
                }
                catch (error) {
                    this.a.trace(error); // ignore - return original error
                }
            }
            return fileSystemProviderWriteError;
        }
    }
    exports.$3p = $3p;
});
//# sourceMappingURL=diskFileSystemProvider.js.map