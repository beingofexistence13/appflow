/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/ternarySearchTree", "vs/base/common/path", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/base/common/platform", "vs/base/common/network"], function (require, exports, ternarySearchTree_1, path_1, strings_1, types_1, uri_1, nls_1, instantiation_1, platform_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLargeFileConfirmationLimit = exports.ByteSize = exports.whenProviderRegistered = exports.etag = exports.ETAG_DISABLED = exports.FileKind = exports.FILES_READONLY_FROM_PERMISSIONS_CONFIG = exports.FILES_READONLY_EXCLUDE_CONFIG = exports.FILES_READONLY_INCLUDE_CONFIG = exports.FILES_EXCLUDE_CONFIG = exports.FILES_ASSOCIATIONS_CONFIG = exports.HotExitConfiguration = exports.AutoSaveConfiguration = exports.FileOperationResult = exports.NotModifiedSinceFileOperationError = exports.TooLargeFileOperationError = exports.FileOperationError = exports.isParent = exports.FileChangesEvent = exports.FileChangeType = exports.FileOperationEvent = exports.FileOperation = exports.toFileOperationResult = exports.toFileSystemProviderErrorCode = exports.markAsFileSystemProviderError = exports.ensureFileSystemProviderError = exports.createFileSystemProviderError = exports.FileSystemProviderError = exports.FileSystemProviderErrorCode = exports.hasReadonlyCapability = exports.hasFileAtomicDeleteCapability = exports.hasFileAtomicWriteCapability = exports.hasFileAtomicReadCapability = exports.hasFileReadStreamCapability = exports.hasOpenReadWriteCloseCapability = exports.hasFileCloneCapability = exports.hasFileFolderCopyCapability = exports.hasReadWriteCapability = exports.FileSystemProviderCapabilities = exports.FilePermission = exports.FileType = exports.isFileOpenForWriteOptions = exports.IFileService = void 0;
    //#region file service & providers
    exports.IFileService = (0, instantiation_1.createDecorator)('fileService');
    function isFileOpenForWriteOptions(options) {
        return options.create === true;
    }
    exports.isFileOpenForWriteOptions = isFileOpenForWriteOptions;
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
    function hasReadWriteCapability(provider) {
        return !!(provider.capabilities & 2 /* FileSystemProviderCapabilities.FileReadWrite */);
    }
    exports.hasReadWriteCapability = hasReadWriteCapability;
    function hasFileFolderCopyCapability(provider) {
        return !!(provider.capabilities & 8 /* FileSystemProviderCapabilities.FileFolderCopy */);
    }
    exports.hasFileFolderCopyCapability = hasFileFolderCopyCapability;
    function hasFileCloneCapability(provider) {
        return !!(provider.capabilities & 131072 /* FileSystemProviderCapabilities.FileClone */);
    }
    exports.hasFileCloneCapability = hasFileCloneCapability;
    function hasOpenReadWriteCloseCapability(provider) {
        return !!(provider.capabilities & 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
    }
    exports.hasOpenReadWriteCloseCapability = hasOpenReadWriteCloseCapability;
    function hasFileReadStreamCapability(provider) {
        return !!(provider.capabilities & 16 /* FileSystemProviderCapabilities.FileReadStream */);
    }
    exports.hasFileReadStreamCapability = hasFileReadStreamCapability;
    function hasFileAtomicReadCapability(provider) {
        if (!hasReadWriteCapability(provider)) {
            return false; // we require the `FileReadWrite` capability too
        }
        return !!(provider.capabilities & 16384 /* FileSystemProviderCapabilities.FileAtomicRead */);
    }
    exports.hasFileAtomicReadCapability = hasFileAtomicReadCapability;
    function hasFileAtomicWriteCapability(provider) {
        if (!hasReadWriteCapability(provider)) {
            return false; // we require the `FileReadWrite` capability too
        }
        return !!(provider.capabilities & 32768 /* FileSystemProviderCapabilities.FileAtomicWrite */);
    }
    exports.hasFileAtomicWriteCapability = hasFileAtomicWriteCapability;
    function hasFileAtomicDeleteCapability(provider) {
        return !!(provider.capabilities & 65536 /* FileSystemProviderCapabilities.FileAtomicDelete */);
    }
    exports.hasFileAtomicDeleteCapability = hasFileAtomicDeleteCapability;
    function hasReadonlyCapability(provider) {
        return !!(provider.capabilities & 2048 /* FileSystemProviderCapabilities.Readonly */);
    }
    exports.hasReadonlyCapability = hasReadonlyCapability;
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
    class FileSystemProviderError extends Error {
        static create(error, code) {
            const providerError = new FileSystemProviderError(error.toString(), code);
            markAsFileSystemProviderError(providerError, code);
            return providerError;
        }
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.FileSystemProviderError = FileSystemProviderError;
    function createFileSystemProviderError(error, code) {
        return FileSystemProviderError.create(error, code);
    }
    exports.createFileSystemProviderError = createFileSystemProviderError;
    function ensureFileSystemProviderError(error) {
        if (!error) {
            return createFileSystemProviderError((0, nls_1.localize)('unknownError', "Unknown Error"), FileSystemProviderErrorCode.Unknown); // https://github.com/microsoft/vscode/issues/72798
        }
        return error;
    }
    exports.ensureFileSystemProviderError = ensureFileSystemProviderError;
    function markAsFileSystemProviderError(error, code) {
        error.name = code ? `${code} (FileSystemError)` : `FileSystemError`;
        return error;
    }
    exports.markAsFileSystemProviderError = markAsFileSystemProviderError;
    function toFileSystemProviderErrorCode(error) {
        // Guard against abuse
        if (!error) {
            return FileSystemProviderErrorCode.Unknown;
        }
        // FileSystemProviderError comes with the code
        if (error instanceof FileSystemProviderError) {
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
    exports.toFileSystemProviderErrorCode = toFileSystemProviderErrorCode;
    function toFileOperationResult(error) {
        // FileSystemProviderError comes with the result already
        if (error instanceof FileOperationError) {
            return error.fileOperationResult;
        }
        // Otherwise try to find from code
        switch (toFileSystemProviderErrorCode(error)) {
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
    exports.toFileOperationResult = toFileOperationResult;
    var FileOperation;
    (function (FileOperation) {
        FileOperation[FileOperation["CREATE"] = 0] = "CREATE";
        FileOperation[FileOperation["DELETE"] = 1] = "DELETE";
        FileOperation[FileOperation["MOVE"] = 2] = "MOVE";
        FileOperation[FileOperation["COPY"] = 3] = "COPY";
        FileOperation[FileOperation["WRITE"] = 4] = "WRITE";
    })(FileOperation || (exports.FileOperation = FileOperation = {}));
    class FileOperationEvent {
        constructor(resource, operation, target) {
            this.resource = resource;
            this.operation = operation;
            this.target = target;
        }
        isOperation(operation) {
            return this.operation === operation;
        }
    }
    exports.FileOperationEvent = FileOperationEvent;
    /**
     * Possible changes that can occur to a file.
     */
    var FileChangeType;
    (function (FileChangeType) {
        FileChangeType[FileChangeType["UPDATED"] = 0] = "UPDATED";
        FileChangeType[FileChangeType["ADDED"] = 1] = "ADDED";
        FileChangeType[FileChangeType["DELETED"] = 2] = "DELETED";
    })(FileChangeType || (exports.FileChangeType = FileChangeType = {}));
    class FileChangesEvent {
        constructor(changes, ignorePathCasing) {
            this.added = undefined;
            this.updated = undefined;
            this.deleted = undefined;
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
                        this.added = ternarySearchTree_1.TernarySearchTree.forUris(() => ignorePathCasing);
                        this.added.fill(value);
                        break;
                    case 0 /* FileChangeType.UPDATED */:
                        this.updated = ternarySearchTree_1.TernarySearchTree.forUris(() => ignorePathCasing);
                        this.updated.fill(value);
                        break;
                    case 2 /* FileChangeType.DELETED */:
                        this.deleted = ternarySearchTree_1.TernarySearchTree.forUris(() => ignorePathCasing);
                        this.deleted.fill(value);
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
            return this.doContains(resource, { includeChildren: false }, ...types);
        }
        /**
         * Find out if the file change events either match the provided
         * resource, or contain a child of this resource.
         */
        affects(resource, ...types) {
            return this.doContains(resource, { includeChildren: true }, ...types);
        }
        doContains(resource, options, ...types) {
            if (!resource) {
                return false;
            }
            const hasTypesFilter = types.length > 0;
            // Added
            if (!hasTypesFilter || types.includes(1 /* FileChangeType.ADDED */)) {
                if (this.added?.get(resource)) {
                    return true;
                }
                if (options.includeChildren && this.added?.findSuperstr(resource)) {
                    return true;
                }
            }
            // Updated
            if (!hasTypesFilter || types.includes(0 /* FileChangeType.UPDATED */)) {
                if (this.updated?.get(resource)) {
                    return true;
                }
                if (options.includeChildren && this.updated?.findSuperstr(resource)) {
                    return true;
                }
            }
            // Deleted
            if (!hasTypesFilter || types.includes(2 /* FileChangeType.DELETED */)) {
                if (this.deleted?.findSubstr(resource) /* deleted also considers parent folders */) {
                    return true;
                }
                if (options.includeChildren && this.deleted?.findSuperstr(resource)) {
                    return true;
                }
            }
            return false;
        }
        /**
         * Returns if this event contains added files.
         */
        gotAdded() {
            return !!this.added;
        }
        /**
         * Returns if this event contains deleted files.
         */
        gotDeleted() {
            return !!this.deleted;
        }
        /**
         * Returns if this event contains updated files.
         */
        gotUpdated() {
            return !!this.updated;
        }
    }
    exports.FileChangesEvent = FileChangesEvent;
    function isParent(path, candidate, ignoreCase) {
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
            return (0, strings_1.startsWithIgnoreCase)(path, candidate);
        }
        return path.indexOf(candidate) === 0;
    }
    exports.isParent = isParent;
    class FileOperationError extends Error {
        constructor(message, fileOperationResult, options) {
            super(message);
            this.fileOperationResult = fileOperationResult;
            this.options = options;
        }
    }
    exports.FileOperationError = FileOperationError;
    class TooLargeFileOperationError extends FileOperationError {
        constructor(message, fileOperationResult, size, options) {
            super(message, fileOperationResult, options);
            this.fileOperationResult = fileOperationResult;
            this.size = size;
        }
    }
    exports.TooLargeFileOperationError = TooLargeFileOperationError;
    class NotModifiedSinceFileOperationError extends FileOperationError {
        constructor(message, stat, options) {
            super(message, 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */, options);
            this.stat = stat;
        }
    }
    exports.NotModifiedSinceFileOperationError = NotModifiedSinceFileOperationError;
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
    exports.AutoSaveConfiguration = {
        OFF: 'off',
        AFTER_DELAY: 'afterDelay',
        ON_FOCUS_CHANGE: 'onFocusChange',
        ON_WINDOW_CHANGE: 'onWindowChange'
    };
    exports.HotExitConfiguration = {
        OFF: 'off',
        ON_EXIT: 'onExit',
        ON_EXIT_AND_WINDOW_CLOSE: 'onExitAndWindowClose'
    };
    exports.FILES_ASSOCIATIONS_CONFIG = 'files.associations';
    exports.FILES_EXCLUDE_CONFIG = 'files.exclude';
    exports.FILES_READONLY_INCLUDE_CONFIG = 'files.readonlyInclude';
    exports.FILES_READONLY_EXCLUDE_CONFIG = 'files.readonlyExclude';
    exports.FILES_READONLY_FROM_PERMISSIONS_CONFIG = 'files.readonlyFromPermissions';
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
    exports.ETAG_DISABLED = '';
    function etag(stat) {
        if (typeof stat.size !== 'number' || typeof stat.mtime !== 'number') {
            return undefined;
        }
        return stat.mtime.toString(29) + stat.size.toString(31);
    }
    exports.etag = etag;
    async function whenProviderRegistered(file, fileService) {
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
    exports.whenProviderRegistered = whenProviderRegistered;
    /**
     * Helper to format a raw byte size into a human readable label.
     */
    class ByteSize {
        static { this.KB = 1024; }
        static { this.MB = ByteSize.KB * ByteSize.KB; }
        static { this.GB = ByteSize.MB * ByteSize.KB; }
        static { this.TB = ByteSize.GB * ByteSize.KB; }
        static formatSize(size) {
            if (!(0, types_1.isNumber)(size)) {
                size = 0;
            }
            if (size < ByteSize.KB) {
                return (0, nls_1.localize)('sizeB', "{0}B", size.toFixed(0));
            }
            if (size < ByteSize.MB) {
                return (0, nls_1.localize)('sizeKB', "{0}KB", (size / ByteSize.KB).toFixed(2));
            }
            if (size < ByteSize.GB) {
                return (0, nls_1.localize)('sizeMB', "{0}MB", (size / ByteSize.MB).toFixed(2));
            }
            if (size < ByteSize.TB) {
                return (0, nls_1.localize)('sizeGB', "{0}GB", (size / ByteSize.GB).toFixed(2));
            }
            return (0, nls_1.localize)('sizeTB', "{0}TB", (size / ByteSize.TB).toFixed(2));
        }
    }
    exports.ByteSize = ByteSize;
    function getLargeFileConfirmationLimit(arg) {
        const isRemote = typeof arg === 'string' || arg?.scheme === network_1.Schemas.vscodeRemote;
        const isLocal = typeof arg !== 'string' && arg?.scheme === network_1.Schemas.file;
        if (isLocal) {
            // Local almost has no limit in file size
            return 1024 * ByteSize.MB;
        }
        if (isRemote) {
            // With a remote, pick a low limit to avoid
            // potentially costly file transfers
            return 10 * ByteSize.MB;
        }
        if (platform_1.isWeb) {
            // Web: we cannot know for sure if a cost
            // is associated with the file transfer
            // so we pick a reasonably small limit
            return 50 * ByteSize.MB;
        }
        // Local desktop: almost no limit in file size
        return 1024 * ByteSize.MB;
    }
    exports.getLargeFileConfirmationLimit = getLargeFileConfirmationLimit;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9maWxlcy9jb21tb24vZmlsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJoRyxrQ0FBa0M7SUFFckIsUUFBQSxZQUFZLEdBQUcsSUFBQSwrQkFBZSxFQUFlLGFBQWEsQ0FBQyxDQUFDO0lBdVZ6RSxTQUFnQix5QkFBeUIsQ0FBQyxPQUF5QjtRQUNsRSxPQUFPLE9BQU8sQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDO0lBQ2hDLENBQUM7SUFGRCw4REFFQztJQThDRCxJQUFZLFFBeUJYO0lBekJELFdBQVksUUFBUTtRQUVuQjs7V0FFRztRQUNILDZDQUFXLENBQUE7UUFFWDs7V0FFRztRQUNILHVDQUFRLENBQUE7UUFFUjs7V0FFRztRQUNILGlEQUFhLENBQUE7UUFFYjs7Ozs7O1dBTUc7UUFDSCx3REFBaUIsQ0FBQTtJQUNsQixDQUFDLEVBekJXLFFBQVEsd0JBQVIsUUFBUSxRQXlCbkI7SUFFRCxJQUFZLGNBY1g7SUFkRCxXQUFZLGNBQWM7UUFFekI7OztXQUdHO1FBQ0gsMkRBQVksQ0FBQTtRQUVaOzs7O1dBSUc7UUFDSCx1REFBVSxDQUFBO0lBQ1gsQ0FBQyxFQWRXLGNBQWMsOEJBQWQsY0FBYyxRQWN6QjtJQXlERCxJQUFrQiw4QkFvRWpCO0lBcEVELFdBQWtCLDhCQUE4QjtRQUUvQzs7V0FFRztRQUNILG1GQUFRLENBQUE7UUFFUjs7V0FFRztRQUNILHFHQUFzQixDQUFBO1FBRXRCOztXQUVHO1FBQ0gsdUhBQStCLENBQUE7UUFFL0I7O1dBRUc7UUFDSCx3R0FBdUIsQ0FBQTtRQUV2Qjs7V0FFRztRQUNILHVHQUF1QixDQUFBO1FBRXZCOztXQUVHO1FBQ0gsZ0hBQTJCLENBQUE7UUFFM0I7O1dBRUc7UUFDSCw4RkFBa0IsQ0FBQTtRQUVsQjs7V0FFRztRQUNILHdGQUFl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