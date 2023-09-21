/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/ternarySearchTree", "vs/base/common/path", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/nls!vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/base/common/platform", "vs/base/common/network"], function (require, exports, ternarySearchTree_1, path_1, strings_1, types_1, uri_1, nls_1, instantiation_1, platform_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Bk = exports.$Ak = exports.$zk = exports.$yk = exports.$xk = exports.FileKind = exports.$wk = exports.$vk = exports.$uk = exports.$tk = exports.$sk = exports.$rk = exports.$qk = exports.FileOperationResult = exports.$pk = exports.$ok = exports.$nk = exports.$mk = exports.$lk = exports.FileChangeType = exports.$kk = exports.FileOperation = exports.$jk = exports.$ik = exports.$hk = exports.$gk = exports.$fk = exports.$ek = exports.FileSystemProviderErrorCode = exports.$dk = exports.$ck = exports.$bk = exports.$ak = exports.$_j = exports.$$j = exports.$0j = exports.$9j = exports.$8j = exports.FileSystemProviderCapabilities = exports.FilePermission = exports.FileType = exports.$7j = exports.$6j = void 0;
    //#region file service & providers
    exports.$6j = (0, instantiation_1.$Bh)('fileService');
    function $7j(options) {
        return options.create === true;
    }
    exports.$7j = $7j;
    var FileType;
    (function (FileType) {
        /**
         * File is unknown (neither file, directory nor symbolic link).
         */
        FileType[FileType["Unknown"] = 0] = "Unknown";
        /**
         * File is a normal file.
         */
        FileType[FileType["File"] = 1] = "File";
        /**
         * File is a directory.
         */
        FileType[FileType["Directory"] = 2] = "Directory";
        /**
         * File is a symbolic link.
         *
         * Note: even when the file is a symbolic link, you can test for
         * `FileType.File` and `FileType.Directory` to know the type of
         * the target the link points to.
         */
        FileType[FileType["SymbolicLink"] = 64] = "SymbolicLink";
    })(FileType || (exports.FileType = FileType = {}));
    var FilePermission;
    (function (FilePermission) {
        /**
         * File is readonly. Components like editors should not
         * offer to edit the contents.
         */
        FilePermission[FilePermission["Readonly"] = 1] = "Readonly";
        /**
         * File is locked. Components like editors should offer
         * to edit the contents and ask the user upon saving to
         * remove the lock.
         */
        FilePermission[FilePermission["Locked"] = 2] = "Locked";
    })(FilePermission || (exports.FilePermission = FilePermission = {}));
    var FileSystemProviderCapabilities;
    (function (FileSystemProviderCapabilities) {
        /**
         * No capabilities.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["None"] = 0] = "None";
        /**
         * Provider supports unbuffered read/write.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileReadWrite"] = 2] = "FileReadWrite";
        /**
         * Provider supports open/read/write/close low level file operations.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileOpenReadWriteClose"] = 4] = "FileOpenReadWriteClose";
        /**
         * Provider supports stream based reading.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileReadStream"] = 16] = "FileReadStream";
        /**
         * Provider supports copy operation.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileFolderCopy"] = 8] = "FileFolderCopy";
        /**
         * Provider is path case sensitive.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["PathCaseSensitive"] = 1024] = "PathCaseSensitive";
        /**
         * All files of the provider are readonly.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["Readonly"] = 2048] = "Readonly";
        /**
         * Provider supports to delete via trash.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["Trash"] = 4096] = "Trash";
        /**
         * Provider support to unlock files for writing.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileWriteUnlock"] = 8192] = "FileWriteUnlock";
        /**
         * Provider support to read files atomically. This implies the
         * provider provides the `FileReadWrite` capability too.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileAtomicRead"] = 16384] = "FileAtomicRead";
        /**
         * Provider support to write files atomically. This implies the
         * provider provides the `FileReadWrite` capability too.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileAtomicWrite"] = 32768] = "FileAtomicWrite";
        /**
         * Provider support to delete atomically.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileAtomicDelete"] = 65536] = "FileAtomicDelete";
        /**
         * Provider support to clone files atomically.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileClone"] = 131072] = "FileClone";
    })(FileSystemProviderCapabilities || (exports.FileSystemProviderCapabilities = FileSystemProviderCapabilities = {}));
    function $8j(provider) {
        return !!(provider.capabilities & 2 /* FileSystemProviderCapabilities.FileReadWrite */);
    }
    exports.$8j = $8j;
    function $9j(provider) {
        return !!(provider.capabilities & 8 /* FileSystemProviderCapabilities.FileFolderCopy */);
    }
    exports.$9j = $9j;
    function $0j(provider) {
        return !!(provider.capabilities & 131072 /* FileSystemProviderCapabilities.FileClone */);
    }
    exports.$0j = $0j;
    function $$j(provider) {
        return !!(provider.capabilities & 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
    }
    exports.$$j = $$j;
    function $_j(provider) {
        return !!(provider.capabilities & 16 /* FileSystemProviderCapabilities.FileReadStream */);
    }
    exports.$_j = $_j;
    function $ak(provider) {
        if (!$8j(provider)) {
            return false; // we require the `FileReadWrite` capability too
        }
        return !!(provider.capabilities & 16384 /* FileSystemProviderCapabilities.FileAtomicRead */);
    }
    exports.$ak = $ak;
    function $bk(provider) {
        if (!$8j(provider)) {
            return false; // we require the `FileReadWrite` capability too
        }
        return !!(provider.capabilities & 32768 /* FileSystemProviderCapabilities.FileAtomicWrite */);
    }
    exports.$bk = $bk;
    function $ck(provider) {
        return !!(provider.capabilities & 65536 /* FileSystemProviderCapabilities.FileAtomicDelete */);
    }
    exports.$ck = $ck;
    function $dk(provider) {
        return !!(provider.capabilities & 2048 /* FileSystemProviderCapabilities.Readonly */);
    }
    exports.$dk = $dk;
    var FileSystemProviderErrorCode;
    (function (FileSystemProviderErrorCode) {
        FileSystemProviderErrorCode["FileExists"] = "EntryExists";
        FileSystemProviderErrorCode["FileNotFound"] = "EntryNotFound";
        FileSystemProviderErrorCode["FileNotADirectory"] = "EntryNotADirectory";
        FileSystemProviderErrorCode["FileIsADirectory"] = "EntryIsADirectory";
        FileSystemProviderErrorCode["FileExceedsStorageQuota"] = "EntryExceedsStorageQuota";
        FileSystemProviderErrorCode["FileTooLarge"] = "EntryTooLarge";
        FileSystemProviderErrorCode["FileWriteLocked"] = "EntryWriteLocked";
        FileSystemProviderErrorCode["NoPermissions"] = "NoPermissions";
        FileSystemProviderErrorCode["Unavailable"] = "Unavailable";
        FileSystemProviderErrorCode["Unknown"] = "Unknown";
    })(FileSystemProviderErrorCode || (exports.FileSystemProviderErrorCode = FileSystemProviderErrorCode = {}));
    class $ek extends Error {
        static create(error, code) {
            const providerError = new $ek(error.toString(), code);
            $hk(providerError, code);
            return providerError;
        }
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.$ek = $ek;
    function $fk(error, code) {
        return $ek.create(error, code);
    }
    exports.$fk = $fk;
    function $gk(error) {
        if (!error) {
            return $fk((0, nls_1.localize)(0, null), FileSystemProviderErrorCode.Unknown); // https://github.com/microsoft/vscode/issues/72798
        }
        return error;
    }
    exports.$gk = $gk;
    function $hk(error, code) {
        error.name = code ? `${code} (FileSystemError)` : `FileSystemError`;
        return error;
    }
    exports.$hk = $hk;
    function $ik(error) {
        // Guard against abuse
        if (!error) {
            return FileSystemProviderErrorCode.Unknown;
        }
        // FileSystemProviderError comes with the code
        if (error instanceof $ek) {
            return error.code;
        }
        // Any other error, check for name match by assuming that the error
        // went through the markAsFileSystemProviderError() method
        const match = /^(.+) \(FileSystemError\)$/.exec(error.name);
        if (!match) {
            return FileSystemProviderErrorCode.Unknown;
        }
        switch (match[1]) {
            case FileSystemProviderErrorCode.FileExists: return FileSystemProviderErrorCode.FileExists;
            case FileSystemProviderErrorCode.FileIsADirectory: return FileSystemProviderErrorCode.FileIsADirectory;
            case FileSystemProviderErrorCode.FileNotADirectory: return FileSystemProviderErrorCode.FileNotADirectory;
            case FileSystemProviderErrorCode.FileNotFound: return FileSystemProviderErrorCode.FileNotFound;
            case FileSystemProviderErrorCode.FileTooLarge: return FileSystemProviderErrorCode.FileTooLarge;
            case FileSystemProviderErrorCode.FileWriteLocked: return FileSystemProviderErrorCode.FileWriteLocked;
            case FileSystemProviderErrorCode.NoPermissions: return FileSystemProviderErrorCode.NoPermissions;
            case FileSystemProviderErrorCode.Unavailable: return FileSystemProviderErrorCode.Unavailable;
        }
        return FileSystemProviderErrorCode.Unknown;
    }
    exports.$ik = $ik;
    function $jk(error) {
        // FileSystemProviderError comes with the result already
        if (error instanceof $nk) {
            return error.fileOperationResult;
        }
        // Otherwise try to find from code
        switch ($ik(error)) {
            case FileSystemProviderErrorCode.FileNotFound:
                return 1 /* FileOperationResult.FILE_NOT_FOUND */;
            case FileSystemProviderErrorCode.FileIsADirectory:
                return 0 /* FileOperationResult.FILE_IS_DIRECTORY */;
            case FileSystemProviderErrorCode.FileNotADirectory:
                return 9 /* FileOperationResult.FILE_NOT_DIRECTORY */;
            case FileSystemProviderErrorCode.FileWriteLocked:
                return 5 /* FileOperationResult.FILE_WRITE_LOCKED */;
            case FileSystemProviderErrorCode.NoPermissions:
                return 6 /* FileOperationResult.FILE_PERMISSION_DENIED */;
            case FileSystemProviderErrorCode.FileExists:
                return 4 /* FileOperationResult.FILE_MOVE_CONFLICT */;
            case FileSystemProviderErrorCode.FileTooLarge:
                return 7 /* FileOperationResult.FILE_TOO_LARGE */;
            default:
                return 10 /* FileOperationResult.FILE_OTHER_ERROR */;
        }
    }
    exports.$jk = $jk;
    var FileOperation;
    (function (FileOperation) {
        FileOperation[FileOperation["CREATE"] = 0] = "CREATE";
        FileOperation[FileOperation["DELETE"] = 1] = "DELETE";
        FileOperation[FileOperation["MOVE"] = 2] = "MOVE";
        FileOperation[FileOperation["COPY"] = 3] = "COPY";
        FileOperation[FileOperation["WRITE"] = 4] = "WRITE";
    })(FileOperation || (exports.FileOperation = FileOperation = {}));
    class $kk {
        constructor(resource, operation, target) {
            this.resource = resource;
            this.operation = operation;
            this.target = target;
        }
        isOperation(operation) {
            return this.operation === operation;
        }
    }
    exports.$kk = $kk;
    /**
     * Possible changes that can occur to a file.
     */
    var FileChangeType;
    (function (FileChangeType) {
        FileChangeType[FileChangeType["UPDATED"] = 0] = "UPDATED";
        FileChangeType[FileChangeType["ADDED"] = 1] = "ADDED";
        FileChangeType[FileChangeType["DELETED"] = 2] = "DELETED";
    })(FileChangeType || (exports.FileChangeType = FileChangeType = {}));
    class $lk {
        constructor(changes, ignorePathCasing) {
            this.a = undefined;
            this.b = undefined;
            this.c = undefined;
            /**
             * @deprecated use the `contains` or `affects` method to efficiently find
             * out if the event relates to a given resource. these methods ensure:
             * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
             * - correctly handles `FileChangeType.DELETED` events
             */
            this.rawAdded = [];
            /**
            * @deprecated use the `contains` or `affects` method to efficiently find
            * out if the event relates to a given resource. these methods ensure:
            * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
            * - correctly handles `FileChangeType.DELETED` events
            */
            this.rawUpdated = [];
            /**
            * @deprecated use the `contains` or `affects` method to efficiently find
            * out if the event relates to a given resource. these methods ensure:
            * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
            * - correctly handles `FileChangeType.DELETED` events
            */
            this.rawDeleted = [];
            const entriesByType = new Map();
            for (const change of changes) {
                const array = entriesByType.get(change.type);
                if (array) {
                    array.push([change.resource, change]);
                }
                else {
                    entriesByType.set(change.type, [[change.resource, change]]);
                }
                switch (change.type) {
                    case 1 /* FileChangeType.ADDED */:
                        this.rawAdded.push(change.resource);
                        break;
                    case 0 /* FileChangeType.UPDATED */:
                        this.rawUpdated.push(change.resource);
                        break;
                    case 2 /* FileChangeType.DELETED */:
                        this.rawDeleted.push(change.resource);
                        break;
                }
            }
            for (const [key, value] of entriesByType) {
                switch (key) {
                    case 1 /* FileChangeType.ADDED */:
                        this.a = ternarySearchTree_1.$Hh.forUris(() => ignorePathCasing);
                        this.a.fill(value);
                        break;
                    case 0 /* FileChangeType.UPDATED */:
                        this.b = ternarySearchTree_1.$Hh.forUris(() => ignorePathCasing);
                        this.b.fill(value);
                        break;
                    case 2 /* FileChangeType.DELETED */:
                        this.c = ternarySearchTree_1.$Hh.forUris(() => ignorePathCasing);
                        this.c.fill(value);
                        break;
                }
            }
        }
        /**
         * Find out if the file change events match the provided resource.
         *
         * Note: when passing `FileChangeType.DELETED`, we consider a match
         * also when the parent of the resource got deleted.
         */
        contains(resource, ...types) {
            return this.d(resource, { includeChildren: false }, ...types);
        }
        /**
         * Find out if the file change events either match the provided
         * resource, or contain a child of this resource.
         */
        affects(resource, ...types) {
            return this.d(resource, { includeChildren: true }, ...types);
        }
        d(resource, options, ...types) {
            if (!resource) {
                return false;
            }
            const hasTypesFilter = types.length > 0;
            // Added
            if (!hasTypesFilter || types.includes(1 /* FileChangeType.ADDED */)) {
                if (this.a?.get(resource)) {
                    return true;
                }
                if (options.includeChildren && this.a?.findSuperstr(resource)) {
                    return true;
                }
            }
            // Updated
            if (!hasTypesFilter || types.includes(0 /* FileChangeType.UPDATED */)) {
                if (this.b?.get(resource)) {
                    return true;
                }
                if (options.includeChildren && this.b?.findSuperstr(resource)) {
                    return true;
                }
            }
            // Deleted
            if (!hasTypesFilter || types.includes(2 /* FileChangeType.DELETED */)) {
                if (this.c?.findSubstr(resource) /* deleted also considers parent folders */) {
                    return true;
                }
                if (options.includeChildren && this.c?.findSuperstr(resource)) {
                    return true;
                }
            }
            return false;
        }
        /**
         * Returns if this event contains added files.
         */
        gotAdded() {
            return !!this.a;
        }
        /**
         * Returns if this event contains deleted files.
         */
        gotDeleted() {
            return !!this.c;
        }
        /**
         * Returns if this event contains updated files.
         */
        gotUpdated() {
            return !!this.b;
        }
    }
    exports.$lk = $lk;
    function $mk(path, candidate, ignoreCase) {
        if (!path || !candidate || path === candidate) {
            return false;
        }
        if (candidate.length > path.length) {
            return false;
        }
        if (candidate.charAt(candidate.length - 1) !== path_1.sep) {
            candidate += path_1.sep;
        }
        if (ignoreCase) {
            return (0, strings_1.$Ne)(path, candidate);
        }
        return path.indexOf(candidate) === 0;
    }
    exports.$mk = $mk;
    class $nk extends Error {
        constructor(message, fileOperationResult, options) {
            super(message);
            this.fileOperationResult = fileOperationResult;
            this.options = options;
        }
    }
    exports.$nk = $nk;
    class $ok extends $nk {
        constructor(message, fileOperationResult, size, options) {
            super(message, fileOperationResult, options);
            this.fileOperationResult = fileOperationResult;
            this.size = size;
        }
    }
    exports.$ok = $ok;
    class $pk extends $nk {
        constructor(message, stat, options) {
            super(message, 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */, options);
            this.stat = stat;
        }
    }
    exports.$pk = $pk;
    var FileOperationResult;
    (function (FileOperationResult) {
        FileOperationResult[FileOperationResult["FILE_IS_DIRECTORY"] = 0] = "FILE_IS_DIRECTORY";
        FileOperationResult[FileOperationResult["FILE_NOT_FOUND"] = 1] = "FILE_NOT_FOUND";
        FileOperationResult[FileOperationResult["FILE_NOT_MODIFIED_SINCE"] = 2] = "FILE_NOT_MODIFIED_SINCE";
        FileOperationResult[FileOperationResult["FILE_MODIFIED_SINCE"] = 3] = "FILE_MODIFIED_SINCE";
        FileOperationResult[FileOperationResult["FILE_MOVE_CONFLICT"] = 4] = "FILE_MOVE_CONFLICT";
        FileOperationResult[FileOperationResult["FILE_WRITE_LOCKED"] = 5] = "FILE_WRITE_LOCKED";
        FileOperationResult[FileOperationResult["FILE_PERMISSION_DENIED"] = 6] = "FILE_PERMISSION_DENIED";
        FileOperationResult[FileOperationResult["FILE_TOO_LARGE"] = 7] = "FILE_TOO_LARGE";
        FileOperationResult[FileOperationResult["FILE_INVALID_PATH"] = 8] = "FILE_INVALID_PATH";
        FileOperationResult[FileOperationResult["FILE_NOT_DIRECTORY"] = 9] = "FILE_NOT_DIRECTORY";
        FileOperationResult[FileOperationResult["FILE_OTHER_ERROR"] = 10] = "FILE_OTHER_ERROR";
    })(FileOperationResult || (exports.FileOperationResult = FileOperationResult = {}));
    //#endregion
    //#region Settings
    exports.$qk = {
        OFF: 'off',
        AFTER_DELAY: 'afterDelay',
        ON_FOCUS_CHANGE: 'onFocusChange',
        ON_WINDOW_CHANGE: 'onWindowChange'
    };
    exports.$rk = {
        OFF: 'off',
        ON_EXIT: 'onExit',
        ON_EXIT_AND_WINDOW_CLOSE: 'onExitAndWindowClose'
    };
    exports.$sk = 'files.associations';
    exports.$tk = 'files.exclude';
    exports.$uk = 'files.readonlyInclude';
    exports.$vk = 'files.readonlyExclude';
    exports.$wk = 'files.readonlyFromPermissions';
    //#endregion
    //#region Utilities
    var FileKind;
    (function (FileKind) {
        FileKind[FileKind["FILE"] = 0] = "FILE";
        FileKind[FileKind["FOLDER"] = 1] = "FOLDER";
        FileKind[FileKind["ROOT_FOLDER"] = 2] = "ROOT_FOLDER";
    })(FileKind || (exports.FileKind = FileKind = {}));
    /**
     * A hint to disable etag checking for reading/writing.
     */
    exports.$xk = '';
    function $yk(stat) {
        if (typeof stat.size !== 'number' || typeof stat.mtime !== 'number') {
            return undefined;
        }
        return stat.mtime.toString(29) + stat.size.toString(31);
    }
    exports.$yk = $yk;
    async function $zk(file, fileService) {
        if (fileService.hasProvider(uri_1.URI.from({ scheme: file.scheme }))) {
            return;
        }
        return new Promise(resolve => {
            const disposable = fileService.onDidChangeFileSystemProviderRegistrations(e => {
                if (e.scheme === file.scheme && e.added) {
                    disposable.dispose();
                    resolve();
                }
            });
        });
    }
    exports.$zk = $zk;
    /**
     * Helper to format a raw byte size into a human readable label.
     */
    class $Ak {
        static { this.KB = 1024; }
        static { this.MB = $Ak.KB * $Ak.KB; }
        static { this.GB = $Ak.MB * $Ak.KB; }
        static { this.TB = $Ak.GB * $Ak.KB; }
        static formatSize(size) {
            if (!(0, types_1.$nf)(size)) {
                size = 0;
            }
            if (size < $Ak.KB) {
                return (0, nls_1.localize)(1, null, size.toFixed(0));
            }
            if (size < $Ak.MB) {
                return (0, nls_1.localize)(2, null, (size / $Ak.KB).toFixed(2));
            }
            if (size < $Ak.GB) {
                return (0, nls_1.localize)(3, null, (size / $Ak.MB).toFixed(2));
            }
            if (size < $Ak.TB) {
                return (0, nls_1.localize)(4, null, (size / $Ak.GB).toFixed(2));
            }
            return (0, nls_1.localize)(5, null, (size / $Ak.TB).toFixed(2));
        }
    }
    exports.$Ak = $Ak;
    function $Bk(arg) {
        const isRemote = typeof arg === 'string' || arg?.scheme === network_1.Schemas.vscodeRemote;
        const isLocal = typeof arg !== 'string' && arg?.scheme === network_1.Schemas.file;
        if (isLocal) {
            // Local almost has no limit in file size
            return 1024 * $Ak.MB;
        }
        if (isRemote) {
            // With a remote, pick a low limit to avoid
            // potentially costly file transfers
            return 10 * $Ak.MB;
        }
        if (platform_1.$o) {
            // Web: we cannot know for sure if a cost
            // is associated with the file transfer
            // so we pick a reasonably small limit
            return 50 * $Ak.MB;
        }
        // Local desktop: almost no limit in file size
        return 1024 * $Ak.MB;
    }
    exports.$Bk = $Bk;
});
//#endregion
//# sourceMappingURL=files.js.map