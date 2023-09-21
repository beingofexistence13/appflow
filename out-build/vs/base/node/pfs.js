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
        if ((0, extpath_1.$Lf)(path)) {
            throw new Error('rimraf - will refuse to recursively delete root');
        }
        // delete: via rm
        if (mode === RimRafMode.UNLINK) {
            return rimrafUnlink(path);
        }
        // delete: via move
        return rimrafMove(path, moveToPath);
    }
    async function rimrafMove(path, moveToPath = (0, extpath_1.$Qf)((0, os_1.tmpdir)())) {
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
        if ((0, extpath_1.$Lf)(path)) {
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
                const lstat = await exports.Promises.lstat((0, path_1.$9d)(path, child));
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
                return platform_1.$j ? (0, normalization_1.$hl)(child) : child;
            }
            child.name = platform_1.$j ? (0, normalization_1.$hl)(child.name) : child.name;
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
            if (await SymlinkSupport.existsDirectory((0, path_1.$9d)(dirPath, child))) {
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
                if (platform_1.$i && error.code === 'EACCES') {
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
    const writeQueues = new async_1.$Pg();
    function writeFile(path, data, options) {
        return writeQueues.queueFor(uri_1.URI.file(path), resources_1.$_f).queue(() => {
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
            if (platform_1.$i && typeof windowsRetryTimeout === 'number') {
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
            await (0, async_1.$Hg)(Math.min(100, attempt * 10));
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
            await doCopy((0, path_1.$9d)(source, file), (0, path_1.$9d)(target, file), payload);
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
        if ((0, extpath_1.$If)(linkTarget, payload.root.source, !platform_1.$k)) {
            linkTarget = (0, path_1.$9d)(payload.root.target, linkTarget.substr(payload.root.source.length + 1));
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
//# sourceMappingURL=pfs.js.map