/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "os", "util", "vs/base/common/async", "vs/base/common/extpath", "vs/base/common/normalization", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri"], function (require, exports, fs, os_1, util_1, async_1, extpath_1, normalization_1, path_1, platform_1, resources_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Promises = exports.writeFileSync = exports.configureFlushOnWrite = exports.SymlinkSupport = exports.whenDeleted = exports.readdirSync = exports.rimrafSync = exports.RimRafMode = void 0;
    //#region rimraf
    var RimRafMode;
    (function (RimRafMode) {
        /**
         * Slow version that unlinks each file and folder.
         */
        RimRafMode[RimRafMode["UNLINK"] = 0] = "UNLINK";
        /**
         * Fast version that first moves the file/folder
         * into a temp directory and then deletes that
         * without waiting for it.
         */
        RimRafMode[RimRafMode["MOVE"] = 1] = "MOVE";
    })(RimRafMode || (exports.RimRafMode = RimRafMode = {}));
    async function rimraf(path, mode = RimRafMode.UNLINK, moveToPath) {
        if ((0, extpath_1.isRootOrDriveLetter)(path)) {
            throw new Error('rimraf - will refuse to recursively delete root');
        }
        // delete: via rm
        if (mode === RimRafMode.UNLINK) {
            return rimrafUnlink(path);
        }
        // delete: via move
        return rimrafMove(path, moveToPath);
    }
    async function rimrafMove(path, moveToPath = (0, extpath_1.randomPath)((0, os_1.tmpdir)())) {
        try {
            try {
                // Intentionally using `fs.promises` here to skip
                // the patched graceful-fs method that can result
                // in very long running `rename` calls when the
                // folder is locked by a file watcher. We do not
                // really want to slow down this operation more
                // than necessary and we have a fallback to delete
                // via unlink.
                // https://github.com/microsoft/vscode/issues/139908
                await fs.promises.rename(path, moveToPath);
            }
            catch (error) {
                if (error.code === 'ENOENT') {
                    return; // ignore - path to delete did not exist
                }
                return rimrafUnlink(path); // otherwise fallback to unlink
            }
            // Delete but do not return as promise
            rimrafUnlink(moveToPath).catch(error => { });
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }
    async function rimrafUnlink(path) {
        return (0, util_1.promisify)(fs.rm)(path, { recursive: true, force: true, maxRetries: 3 });
    }
    function rimrafSync(path) {
        if ((0, extpath_1.isRootOrDriveLetter)(path)) {
            throw new Error('rimraf - will refuse to recursively delete root');
        }
        fs.rmSync(path, { recursive: true, force: true, maxRetries: 3 });
    }
    exports.rimrafSync = rimrafSync;
    async function readdir(path, options) {
        return handleDirectoryChildren(await (options ? safeReaddirWithFileTypes(path) : (0, util_1.promisify)(fs.readdir)(path)));
    }
    async function safeReaddirWithFileTypes(path) {
        try {
            return await (0, util_1.promisify)(fs.readdir)(path, { withFileTypes: true });
        }
        catch (error) {
            console.warn('[node.js fs] readdir with filetypes failed with error: ', error);
        }
        // Fallback to manually reading and resolving each
        // children of the folder in case we hit an error
        // previously.
        // This can only really happen on exotic file systems
        // such as explained in #115645 where we get entries
        // from `readdir` that we can later not `lstat`.
        const result = [];
        const children = await readdir(path);
        for (const child of children) {
            let isFile = false;
            let isDirectory = false;
            let isSymbolicLink = false;
            try {
                const lstat = await exports.Promises.lstat((0, path_1.join)(path, child));
                isFile = lstat.isFile();
                isDirectory = lstat.isDirectory();
                isSymbolicLink = lstat.isSymbolicLink();
            }
            catch (error) {
                console.warn('[node.js fs] unexpected error from lstat after readdir: ', error);
            }
            result.push({
                name: child,
                isFile: () => isFile,
                isDirectory: () => isDirectory,
                isSymbolicLink: () => isSymbolicLink
            });
        }
        return result;
    }
    /**
     * Drop-in replacement of `fs.readdirSync` with support
     * for converting from macOS NFD unicon form to NFC
     * (https://github.com/nodejs/node/issues/2165)
     */
    function readdirSync(path) {
        return handleDirectoryChildren(fs.readdirSync(path));
    }
    exports.readdirSync = readdirSync;
    function handleDirectoryChildren(children) {
        return children.map(child => {
            // Mac: uses NFD unicode form on disk, but we want NFC
            // See also https://github.com/nodejs/node/issues/2165
            if (typeof child === 'string') {
                return platform_1.isMacintosh ? (0, normalization_1.normalizeNFC)(child) : child;
            }
            child.name = platform_1.isMacintosh ? (0, normalization_1.normalizeNFC)(child.name) : child.name;
            return child;
        });
    }
    /**
     * A convenience method to read all children of a path that
     * are directories.
     */
    async function readDirsInDir(dirPath) {
        const children = await readdir(dirPath);
        const directories = [];
        for (const child of children) {
            if (await SymlinkSupport.existsDirectory((0, path_1.join)(dirPath, child))) {
                directories.push(child);
            }
        }
        return directories;
    }
    //#endregion
    //#region whenDeleted()
    /**
     * A `Promise` that resolves when the provided `path`
     * is deleted from disk.
     */
    function whenDeleted(path, intervalMs = 1000) {
        return new Promise(resolve => {
            let running = false;
            const interval = setInterval(() => {
                if (!running) {
                    running = true;
                    fs.access(path, err => {
                        running = false;
                        if (err) {
                            clearInterval(interval);
                            resolve(undefined);
                        }
                    });
                }
            }, intervalMs);
        });
    }
    exports.whenDeleted = whenDeleted;
    //#endregion
    //#region Methods with symbolic links support
    var SymlinkSupport;
    (function (SymlinkSupport) {
        /**
         * Resolves the `fs.Stats` of the provided path. If the path is a
         * symbolic link, the `fs.Stats` will be from the target it points
         * to. If the target does not exist, `dangling: true` will be returned
         * as `symbolicLink` value.
         */
        async function stat(path) {
            // First stat the link
            let lstats;
            try {
                lstats = await exports.Promises.lstat(path);
                // Return early if the stat is not a symbolic link at all
                if (!lstats.isSymbolicLink()) {
                    return { stat: lstats };
                }
            }
            catch (error) {
                /* ignore - use stat() instead */
            }
            // If the stat is a symbolic link or failed to stat, use fs.stat()
            // which for symbolic links will stat the target they point to
            try {
                const stats = await exports.Promises.stat(path);
                return { stat: stats, symbolicLink: lstats?.isSymbolicLink() ? { dangling: false } : undefined };
            }
            catch (error) {
                // If the link points to a nonexistent file we still want
                // to return it as result while setting dangling: true flag
                if (error.code === 'ENOENT' && lstats) {
                    return { stat: lstats, symbolicLink: { dangling: true } };
                }
                // Windows: workaround a node.js bug where reparse points
                // are not supported (https://github.com/nodejs/node/issues/36790)
                if (platform_1.isWindows && error.code === 'EACCES') {
                    try {
                        const stats = await exports.Promises.stat(await exports.Promises.readlink(path));
                        return { stat: stats, symbolicLink: { dangling: false } };
                    }
                    catch (error) {
                        // If the link points to a nonexistent file we still want
                        // to return it as result while setting dangling: true flag
                        if (error.code === 'ENOENT' && lstats) {
                            return { stat: lstats, symbolicLink: { dangling: true } };
                        }
                        throw error;
                    }
                }
                throw error;
            }
        }
        SymlinkSupport.stat = stat;
        /**
         * Figures out if the `path` exists and is a file with support
         * for symlinks.
         *
         * Note: this will return `false` for a symlink that exists on
         * disk but is dangling (pointing to a nonexistent path).
         *
         * Use `exists` if you only care about the path existing on disk
         * or not without support for symbolic links.
         */
        async function existsFile(path) {
            try {
                const { stat, symbolicLink } = await SymlinkSupport.stat(path);
                return stat.isFile() && symbolicLink?.dangling !== true;
            }
            catch (error) {
                // Ignore, path might not exist
            }
            return false;
        }
        SymlinkSupport.existsFile = existsFile;
        /**
         * Figures out if the `path` exists and is a directory with support for
         * symlinks.
         *
         * Note: this will return `false` for a symlink that exists on
         * disk but is dangling (pointing to a nonexistent path).
         *
         * Use `exists` if you only care about the path existing on disk
         * or not without support for symbolic links.
         */
        async function existsDirectory(path) {
            try {
                const { stat, symbolicLink } = await SymlinkSupport.stat(path);
                return stat.isDirectory() && symbolicLink?.dangling !== true;
            }
            catch (error) {
                // Ignore, path might not exist
            }
            return false;
        }
        SymlinkSupport.existsDirectory = existsDirectory;
    })(SymlinkSupport || (exports.SymlinkSupport = SymlinkSupport = {}));
    //#endregion
    //#region Write File
    // According to node.js docs (https://nodejs.org/docs/v14.16.0/api/fs.html#fs_fs_writefile_file_data_options_callback)
    // it is not safe to call writeFile() on the same path multiple times without waiting for the callback to return.
    // Therefor we use a Queue on the path that is given to us to sequentialize calls to the same path properly.
    const writeQueues = new async_1.ResourceQueue();
    function writeFile(path, data, options) {
        return writeQueues.queueFor(uri_1.URI.file(path), resources_1.extUriBiasedIgnorePathCase).queue(() => {
            const ensuredOptions = ensureWriteOptions(options);
            return new Promise((resolve, reject) => doWriteFileAndFlush(path, data, ensuredOptions, error => error ? reject(error) : resolve()));
        });
    }
    let canFlush = true;
    function configureFlushOnWrite(enabled) {
        canFlush = enabled;
    }
    exports.configureFlushOnWrite = configureFlushOnWrite;
    // Calls fs.writeFile() followed by a fs.sync() call to flush the changes to disk
    // We do this in cases where we want to make sure the data is really on disk and
    // not in some cache.
    //
    // See https://github.com/nodejs/node/blob/v5.10.0/lib/fs.js#L1194
    function doWriteFileAndFlush(path, data, options, callback) {
        if (!canFlush) {
            return fs.writeFile(path, data, { mode: options.mode, flag: options.flag }, callback);
        }
        // Open the file with same flags and mode as fs.writeFile()
        fs.open(path, options.flag, options.mode, (openError, fd) => {
            if (openError) {
                return callback(openError);
            }
            // It is valid to pass a fd handle to fs.writeFile() and this will keep the handle open!
            fs.writeFile(fd, data, writeError => {
                if (writeError) {
                    return fs.close(fd, () => callback(writeError)); // still need to close the handle on error!
                }
                // Flush contents (not metadata) of the file to disk
                // https://github.com/microsoft/vscode/issues/9589
                fs.fdatasync(fd, (syncError) => {
                    // In some exotic setups it is well possible that node fails to sync
                    // In that case we disable flushing and warn to the console
                    if (syncError) {
                        console.warn('[node.js fs] fdatasync is now disabled for this session because it failed: ', syncError);
                        configureFlushOnWrite(false);
                    }
                    return fs.close(fd, closeError => callback(closeError));
                });
            });
        });
    }
    /**
     * Same as `fs.writeFileSync` but with an additional call to
     * `fs.fdatasyncSync` after writing to ensure changes are
     * flushed to disk.
     */
    function writeFileSync(path, data, options) {
        const ensuredOptions = ensureWriteOptions(options);
        if (!canFlush) {
            return fs.writeFileSync(path, data, { mode: ensuredOptions.mode, flag: ensuredOptions.flag });
        }
        // Open the file with same flags and mode as fs.writeFile()
        const fd = fs.openSync(path, ensuredOptions.flag, ensuredOptions.mode);
        try {
            // It is valid to pass a fd handle to fs.writeFile() and this will keep the handle open!
            fs.writeFileSync(fd, data);
            // Flush contents (not metadata) of the file to disk
            try {
                fs.fdatasyncSync(fd); // https://github.com/microsoft/vscode/issues/9589
            }
            catch (syncError) {
                console.warn('[node.js fs] fdatasyncSync is now disabled for this session because it failed: ', syncError);
                configureFlushOnWrite(false);
            }
        }
        finally {
            fs.closeSync(fd);
        }
    }
    exports.writeFileSync = writeFileSync;
    function ensureWriteOptions(options) {
        if (!options) {
            return { mode: 0o666 /* default node.js mode for files */, flag: 'w' };
        }
        return {
            mode: typeof options.mode === 'number' ? options.mode : 0o666 /* default node.js mode for files */,
            flag: typeof options.flag === 'string' ? options.flag : 'w'
        };
    }
    //#endregion
    //#region Move / Copy
    /**
     * A drop-in replacement for `fs.rename` that:
     * - allows to move across multiple disks
     * - attempts to retry the operation for certain error codes on Windows
     */
    async function rename(source, target, windowsRetryTimeout = 60000 /* matches graceful-fs */) {
        if (source === target) {
            return; // simulate node.js behaviour here and do a no-op if paths match
        }
        try {
            if (platform_1.isWindows && typeof windowsRetryTimeout === 'number') {
                // On Windows, a rename can fail when either source or target
                // is locked by AV software. We do leverage graceful-fs to iron
                // out these issues, however in case the target file exists,
                // graceful-fs will immediately return without retry for fs.rename().
                await renameWithRetry(source, target, Date.now(), windowsRetryTimeout);
            }
            else {
                await (0, util_1.promisify)(fs.rename)(source, target);
            }
        }
        catch (error) {
            // In two cases we fallback to classic copy and delete:
            //
            // 1.) The EXDEV error indicates that source and target are on different devices
            // In this case, fallback to using a copy() operation as there is no way to
            // rename() between different devices.
            //
            // 2.) The user tries to rename a file/folder that ends with a dot. This is not
            // really possible to move then, at least on UNC devices.
            if (source.toLowerCase() !== target.toLowerCase() && error.code === 'EXDEV' || source.endsWith('.')) {
                await copy(source, target, { preserveSymlinks: false /* copying to another device */ });
                await rimraf(source, RimRafMode.MOVE);
            }
            else {
                throw error;
            }
        }
    }
    async function renameWithRetry(source, target, startTime, retryTimeout, attempt = 0) {
        try {
            return await (0, util_1.promisify)(fs.rename)(source, target);
        }
        catch (error) {
            if (error.code !== 'EACCES' && error.code !== 'EPERM' && error.code !== 'EBUSY') {
                throw error; // only for errors we think are temporary
            }
            if (Date.now() - startTime >= retryTimeout) {
                console.error(`[node.js fs] rename failed after ${attempt} retries with error: ${error}`);
                throw error; // give up after configurable timeout
            }
            if (attempt === 0) {
                let abortRetry = false;
                try {
                    const { stat } = await SymlinkSupport.stat(target);
                    if (!stat.isFile()) {
                        abortRetry = true; // if target is not a file, EPERM error may be raised and we should not attempt to retry
                    }
                }
                catch (error) {
                    // Ignore
                }
                if (abortRetry) {
                    throw error;
                }
            }
            // Delay with incremental backoff up to 100ms
            await (0, async_1.timeout)(Math.min(100, attempt * 10));
            // Attempt again
            return renameWithRetry(source, target, startTime, retryTimeout, attempt + 1);
        }
    }
    /**
     * Recursively copies all of `source` to `target`.
     *
     * The options `preserveSymlinks` configures how symbolic
     * links should be handled when encountered. Set to
     * `false` to not preserve them and `true` otherwise.
     */
    async function copy(source, target, options) {
        return doCopy(source, target, { root: { source, target }, options, handledSourcePaths: new Set() });
    }
    // When copying a file or folder, we want to preserve the mode
    // it had and as such provide it when creating. However, modes
    // can go beyond what we expect (see link below), so we mask it.
    // (https://github.com/nodejs/node-v0.x-archive/issues/3045#issuecomment-4862588)
    const COPY_MODE_MASK = 0o777;
    async function doCopy(source, target, payload) {
        // Keep track of paths already copied to prevent
        // cycles from symbolic links to cause issues
        if (payload.handledSourcePaths.has(source)) {
            return;
        }
        else {
            payload.handledSourcePaths.add(source);
        }
        const { stat, symbolicLink } = await SymlinkSupport.stat(source);
        // Symlink
        if (symbolicLink) {
            // Try to re-create the symlink unless `preserveSymlinks: false`
            if (payload.options.preserveSymlinks) {
                try {
                    return await doCopySymlink(source, target, payload);
                }
                catch (error) {
                    // in any case of an error fallback to normal copy via dereferencing
                    console.warn('[node.js fs] copy of symlink failed: ', error);
                }
            }
            if (symbolicLink.dangling) {
                return; // skip dangling symbolic links from here on (https://github.com/microsoft/vscode/issues/111621)
            }
        }
        // Folder
        if (stat.isDirectory()) {
            return doCopyDirectory(source, target, stat.mode & COPY_MODE_MASK, payload);
        }
        // File or file-like
        else {
            return doCopyFile(source, target, stat.mode & COPY_MODE_MASK);
        }
    }
    async function doCopyDirectory(source, target, mode, payload) {
        // Create folder
        await exports.Promises.mkdir(target, { recursive: true, mode });
        // Copy each file recursively
        const files = await readdir(source);
        for (const file of files) {
            await doCopy((0, path_1.join)(source, file), (0, path_1.join)(target, file), payload);
        }
    }
    async function doCopyFile(source, target, mode) {
        // Copy file
        await exports.Promises.copyFile(source, target);
        // restore mode (https://github.com/nodejs/node/issues/1104)
        await exports.Promises.chmod(target, mode);
    }
    async function doCopySymlink(source, target, payload) {
        // Figure out link target
        let linkTarget = await exports.Promises.readlink(source);
        // Special case: the symlink points to a target that is
        // actually within the path that is being copied. In that
        // case we want the symlink to point to the target and
        // not the source
        if ((0, extpath_1.isEqualOrParent)(linkTarget, payload.root.source, !platform_1.isLinux)) {
            linkTarget = (0, path_1.join)(payload.root.target, linkTarget.substr(payload.root.source.length + 1));
        }
        // Create symlink
        await exports.Promises.symlink(linkTarget, target);
    }
    //#endregion
    //#region Promise based fs methods
    /**
     * Prefer this helper class over the `fs.promises` API to
     * enable `graceful-fs` to function properly. Given issue
     * https://github.com/isaacs/node-graceful-fs/issues/160 it
     * is evident that the module only takes care of the non-promise
     * based fs methods.
     *
     * Another reason is `realpath` being entirely different in
     * the promise based implementation compared to the other
     * one (https://github.com/microsoft/vscode/issues/118562)
     *
     * Note: using getters for a reason, since `graceful-fs`
     * patching might kick in later after modules have been
     * loaded we need to defer access to fs methods.
     * (https://github.com/microsoft/vscode/issues/124176)
     */
    exports.Promises = new class {
        //#region Implemented by node.js
        get access() { return (0, util_1.promisify)(fs.access); }
        get stat() { return (0, util_1.promisify)(fs.stat); }
        get lstat() { return (0, util_1.promisify)(fs.lstat); }
        get utimes() { return (0, util_1.promisify)(fs.utimes); }
        get read() {
            // Not using `promisify` here for a reason: the return
            // type is not an object as indicated by TypeScript but
            // just the bytes read, so we create our own wrapper.
            return (fd, buffer, offset, length, position) => {
                return new Promise((resolve, reject) => {
                    fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve({ bytesRead, buffer });
                    });
                });
            };
        }
        get readFile() { return (0, util_1.promisify)(fs.readFile); }
        get write() {
            // Not using `promisify` here for a reason: the return
            // type is not an object as indicated by TypeScript but
            // just the bytes written, so we create our own wrapper.
            return (fd, buffer, offset, length, position) => {
                return new Promise((resolve, reject) => {
                    fs.write(fd, buffer, offset, length, position, (err, bytesWritten, buffer) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve({ bytesWritten, buffer });
                    });
                });
            };
        }
        get appendFile() { return (0, util_1.promisify)(fs.appendFile); }
        get fdatasync() { return (0, util_1.promisify)(fs.fdatasync); }
        get truncate() { return (0, util_1.promisify)(fs.truncate); }
        get copyFile() { return (0, util_1.promisify)(fs.copyFile); }
        get open() { return (0, util_1.promisify)(fs.open); }
        get close() { return (0, util_1.promisify)(fs.close); }
        get symlink() { return (0, util_1.promisify)(fs.symlink); }
        get readlink() { return (0, util_1.promisify)(fs.readlink); }
        get chmod() { return (0, util_1.promisify)(fs.chmod); }
        get mkdir() { return (0, util_1.promisify)(fs.mkdir); }
        get unlink() { return (0, util_1.promisify)(fs.unlink); }
        get rmdir() { return (0, util_1.promisify)(fs.rmdir); }
        get realpath() { return (0, util_1.promisify)(fs.realpath); }
        //#endregion
        //#region Implemented by us
        async exists(path) {
            try {
                await exports.Promises.access(path);
                return true;
            }
            catch {
                return false;
            }
        }
        get readdir() { return readdir; }
        get readDirsInDir() { return readDirsInDir; }
        get writeFile() { return writeFile; }
        get rm() { return rimraf; }
        get rename() { return rename; }
        get copy() { return copy; }
    };
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGZzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9ub2RlL3Bmcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsZ0JBQWdCO0lBRWhCLElBQVksVUFhWDtJQWJELFdBQVksVUFBVTtRQUVyQjs7V0FFRztRQUNILCtDQUFNLENBQUE7UUFFTjs7OztXQUlHO1FBQ0gsMkNBQUksQ0FBQTtJQUNMLENBQUMsRUFiVyxVQUFVLDBCQUFWLFVBQVUsUUFhckI7SUFjRCxLQUFLLFVBQVUsTUFBTSxDQUFDLElBQVksRUFBRSxJQUFJLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxVQUFtQjtRQUNoRixJQUFJLElBQUEsNkJBQW1CLEVBQUMsSUFBSSxDQUFDLEVBQUU7WUFDOUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO1NBQ25FO1FBRUQsaUJBQWlCO1FBQ2pCLElBQUksSUFBSSxLQUFLLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDL0IsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDMUI7UUFFRCxtQkFBbUI7UUFDbkIsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxLQUFLLFVBQVUsVUFBVSxDQUFDLElBQVksRUFBRSxVQUFVLEdBQUcsSUFBQSxvQkFBVSxFQUFDLElBQUEsV0FBTSxHQUFFLENBQUM7UUFDeEUsSUFBSTtZQUNILElBQUk7Z0JBQ0gsaURBQWlEO2dCQUNqRCxpREFBaUQ7Z0JBQ2pELCtDQUErQztnQkFDL0MsZ0RBQWdEO2dCQUNoRCwrQ0FBK0M7Z0JBQy9DLGtEQUFrRDtnQkFDbEQsY0FBYztnQkFDZCxvREFBb0Q7Z0JBQ3BELE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQzNDO1lB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