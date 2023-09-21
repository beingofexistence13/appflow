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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/ternarySearchTree", "vs/base/common/network", "vs/base/common/performance", "vs/base/common/resources", "vs/base/common/stream", "vs/nls", "vs/platform/files/common/files", "vs/platform/files/common/io", "vs/platform/log/common/log", "vs/base/common/errors"], function (require, exports, arrays_1, async_1, buffer_1, cancellation_1, event_1, hash_1, iterator_1, lifecycle_1, ternarySearchTree_1, network_1, performance_1, resources_1, stream_1, nls_1, files_1, io_1, log_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileService = void 0;
    let FileService = class FileService extends lifecycle_1.Disposable {
        constructor(logService) {
            super();
            this.logService = logService;
            // Choose a buffer size that is a balance between memory needs and
            // manageable IPC overhead. The larger the buffer size, the less
            // roundtrips we have to do for reading/writing data.
            this.BUFFER_SIZE = 256 * 1024;
            //#region File System Provider
            this._onDidChangeFileSystemProviderRegistrations = this._register(new event_1.Emitter());
            this.onDidChangeFileSystemProviderRegistrations = this._onDidChangeFileSystemProviderRegistrations.event;
            this._onWillActivateFileSystemProvider = this._register(new event_1.Emitter());
            this.onWillActivateFileSystemProvider = this._onWillActivateFileSystemProvider.event;
            this._onDidChangeFileSystemProviderCapabilities = this._register(new event_1.Emitter());
            this.onDidChangeFileSystemProviderCapabilities = this._onDidChangeFileSystemProviderCapabilities.event;
            this.provider = new Map();
            //#endregion
            //#region Operation events
            this._onDidRunOperation = this._register(new event_1.Emitter());
            this.onDidRunOperation = this._onDidRunOperation.event;
            //#endregion
            //#region File Watching
            this._onDidFilesChange = this._register(new event_1.Emitter());
            this.onDidFilesChange = this._onDidFilesChange.event;
            this._onDidWatchError = this._register(new event_1.Emitter());
            this.onDidWatchError = this._onDidWatchError.event;
            this.activeWatchers = new Map();
            //#endregion
            //#region Helpers
            this.writeQueue = this._register(new async_1.ResourceQueue());
        }
        registerProvider(scheme, provider) {
            if (this.provider.has(scheme)) {
                throw new Error(`A filesystem provider for the scheme '${scheme}' is already registered.`);
            }
            (0, performance_1.mark)(`code/registerFilesystem/${scheme}`);
            const providerDisposables = new lifecycle_1.DisposableStore();
            // Add provider with event
            this.provider.set(scheme, provider);
            this._onDidChangeFileSystemProviderRegistrations.fire({ added: true, scheme, provider });
            // Forward events from provider
            providerDisposables.add(provider.onDidChangeFile(changes => this._onDidFilesChange.fire(new files_1.FileChangesEvent(changes, !this.isPathCaseSensitive(provider)))));
            if (typeof provider.onDidWatchError === 'function') {
                providerDisposables.add(provider.onDidWatchError(error => this._onDidWatchError.fire(new Error(error))));
            }
            providerDisposables.add(provider.onDidChangeCapabilities(() => this._onDidChangeFileSystemProviderCapabilities.fire({ provider, scheme })));
            return (0, lifecycle_1.toDisposable)(() => {
                this._onDidChangeFileSystemProviderRegistrations.fire({ added: false, scheme, provider });
                this.provider.delete(scheme);
                (0, lifecycle_1.dispose)(providerDisposables);
            });
        }
        getProvider(scheme) {
            return this.provider.get(scheme);
        }
        async activateProvider(scheme) {
            // Emit an event that we are about to activate a provider with the given scheme.
            // Listeners can participate in the activation by registering a provider for it.
            const joiners = [];
            this._onWillActivateFileSystemProvider.fire({
                scheme,
                join(promise) {
                    joiners.push(promise);
                },
            });
            if (this.provider.has(scheme)) {
                return; // provider is already here so we can return directly
            }
            // If the provider is not yet there, make sure to join on the listeners assuming
            // that it takes a bit longer to register the file system provider.
            await async_1.Promises.settled(joiners);
        }
        async canHandleResource(resource) {
            // Await activation of potentially extension contributed providers
            await this.activateProvider(resource.scheme);
            return this.hasProvider(resource);
        }
        hasProvider(resource) {
            return this.provider.has(resource.scheme);
        }
        hasCapability(resource, capability) {
            const provider = this.provider.get(resource.scheme);
            return !!(provider && (provider.capabilities & capability));
        }
        listCapabilities() {
            return iterator_1.Iterable.map(this.provider, ([scheme, provider]) => ({ scheme, capabilities: provider.capabilities }));
        }
        async withProvider(resource) {
            // Assert path is absolute
            if (!(0, resources_1.isAbsolutePath)(resource)) {
                throw new files_1.FileOperationError((0, nls_1.localize)('invalidPath', "Unable to resolve filesystem provider with relative file path '{0}'", this.resourceForError(resource)), 8 /* FileOperationResult.FILE_INVALID_PATH */);
            }
            // Activate provider
            await this.activateProvider(resource.scheme);
            // Assert provider
            const provider = this.provider.get(resource.scheme);
            if (!provider) {
                const error = new errors_1.ErrorNoTelemetry();
                error.message = (0, nls_1.localize)('noProviderFound', "ENOPRO: No file system provider found for resource '{0}'", resource.toString());
                throw error;
            }
            return provider;
        }
        async withReadProvider(resource) {
            const provider = await this.withProvider(resource);
            if ((0, files_1.hasOpenReadWriteCloseCapability)(provider) || (0, files_1.hasReadWriteCapability)(provider) || (0, files_1.hasFileReadStreamCapability)(provider)) {
                return provider;
            }
            throw new Error(`Filesystem provider for scheme '${resource.scheme}' neither has FileReadWrite, FileReadStream nor FileOpenReadWriteClose capability which is needed for the read operation.`);
        }
        async withWriteProvider(resource) {
            const provider = await this.withProvider(resource);
            if ((0, files_1.hasOpenReadWriteCloseCapability)(provider) || (0, files_1.hasReadWriteCapability)(provider)) {
                return provider;
            }
            throw new Error(`Filesystem provider for scheme '${resource.scheme}' neither has FileReadWrite nor FileOpenReadWriteClose capability which is needed for the write operation.`);
        }
        async resolve(resource, options) {
            try {
                return await this.doResolveFile(resource, options);
            }
            catch (error) {
                // Specially handle file not found case as file operation result
                if ((0, files_1.toFileSystemProviderErrorCode)(error) === files_1.FileSystemProviderErrorCode.FileNotFound) {
                    throw new files_1.FileOperationError((0, nls_1.localize)('fileNotFoundError', "Unable to resolve nonexistent file '{0}'", this.resourceForError(resource)), 1 /* FileOperationResult.FILE_NOT_FOUND */);
                }
                // Bubble up any other error as is
                throw (0, files_1.ensureFileSystemProviderError)(error);
            }
        }
        async doResolveFile(resource, options) {
            const provider = await this.withProvider(resource);
            const isPathCaseSensitive = this.isPathCaseSensitive(provider);
            const resolveTo = options?.resolveTo;
            const resolveSingleChildDescendants = options?.resolveSingleChildDescendants;
            const resolveMetadata = options?.resolveMetadata;
            const stat = await provider.stat(resource);
            let trie;
            return this.toFileStat(provider, resource, stat, undefined, !!resolveMetadata, (stat, siblings) => {
                // lazy trie to check for recursive resolving
                if (!trie) {
                    trie = ternarySearchTree_1.TernarySearchTree.forUris(() => !isPathCaseSensitive);
                    trie.set(resource, true);
                    if (resolveTo) {
                        trie.fill(true, resolveTo);
                    }
                }
                // check for recursive resolving
                if (trie.get(stat.resource) || trie.findSuperstr(stat.resource.with({ query: null, fragment: null } /* required for https://github.com/microsoft/vscode/issues/128151 */))) {
                    return true;
                }
                // check for resolving single child folders
                if (stat.isDirectory && resolveSingleChildDescendants) {
                    return siblings === 1;
                }
                return false;
            });
        }
        async toFileStat(provider, resource, stat, siblings, resolveMetadata, recurse) {
            const { providerExtUri } = this.getExtUri(provider);
            // convert to file stat
            const fileStat = {
                resource,
                name: providerExtUri.basename(resource),
                isFile: (stat.type & files_1.FileType.File) !== 0,
                isDirectory: (stat.type & files_1.FileType.Directory) !== 0,
                isSymbolicLink: (stat.type & files_1.FileType.SymbolicLink) !== 0,
                mtime: stat.mtime,
                ctime: stat.ctime,
                size: stat.size,
                readonly: Boolean((stat.permissions ?? 0) & files_1.FilePermission.Readonly) || Boolean(provider.capabilities & 2048 /* FileSystemProviderCapabilities.Readonly */),
                locked: Boolean((stat.permissions ?? 0) & files_1.FilePermission.Locked),
                etag: (0, files_1.etag)({ mtime: stat.mtime, size: stat.size }),
                children: undefined
            };
            // check to recurse for directories
            if (fileStat.isDirectory && recurse(fileStat, siblings)) {
                try {
                    const entries = await provider.readdir(resource);
                    const resolvedEntries = await async_1.Promises.settled(entries.map(async ([name, type]) => {
                        try {
                            const childResource = providerExtUri.joinPath(resource, name);
                            const childStat = resolveMetadata ? await provider.stat(childResource) : { type };
                            return await this.toFileStat(provider, childResource, childStat, entries.length, resolveMetadata, recurse);
                        }
                        catch (error) {
                            this.logService.trace(error);
                            return null; // can happen e.g. due to permission errors
                        }
                    }));
                    // make sure to get rid of null values that signal a failure to resolve a particular entry
                    fileStat.children = (0, arrays_1.coalesce)(resolvedEntries);
                }
                catch (error) {
                    this.logService.trace(error);
                    fileStat.children = []; // gracefully handle errors, we may not have permissions to read
                }
                return fileStat;
            }
            return fileStat;
        }
        async resolveAll(toResolve) {
            return async_1.Promises.settled(toResolve.map(async (entry) => {
                try {
                    return { stat: await this.doResolveFile(entry.resource, entry.options), success: true };
                }
                catch (error) {
                    this.logService.trace(error);
                    return { stat: undefined, success: false };
                }
            }));
        }
        async stat(resource) {
            const provider = await this.withProvider(resource);
            const stat = await provider.stat(resource);
            return this.toFileStat(provider, resource, stat, undefined, true, () => false /* Do not resolve any children */);
        }
        async exists(resource) {
            const provider = await this.withProvider(resource);
            try {
                const stat = await provider.stat(resource);
                return !!stat;
            }
            catch (error) {
                return false;
            }
        }
        //#endregion
        //#region File Reading/Writing
        async canCreateFile(resource, options) {
            try {
                await this.doValidateCreateFile(resource, options);
            }
            catch (error) {
                return error;
            }
            return true;
        }
        async doValidateCreateFile(resource, options) {
            // validate overwrite
            if (!options?.overwrite && await this.exists(resource)) {
                throw new files_1.FileOperationError((0, nls_1.localize)('fileExists', "Unable to create file '{0}' that already exists when overwrite flag is not set", this.resourceForError(resource)), 3 /* FileOperationResult.FILE_MODIFIED_SINCE */, options);
            }
        }
        async createFile(resource, bufferOrReadableOrStream = buffer_1.VSBuffer.fromString(''), options) {
            // validate
            await this.doValidateCreateFile(resource, options);
            // do write into file (this will create it too)
            const fileStat = await this.writeFile(resource, bufferOrReadableOrStream);
            // events
            this._onDidRunOperation.fire(new files_1.FileOperationEvent(resource, 0 /* FileOperation.CREATE */, fileStat));
            return fileStat;
        }
        async writeFile(resource, bufferOrReadableOrStream, options) {
            const provider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(resource), resource);
            const { providerExtUri } = this.getExtUri(provider);
            try {
                // validate write
                const stat = await this.validateWriteFile(provider, resource, options);
                // mkdir recursively as needed
                if (!stat) {
                    await this.mkdirp(provider, providerExtUri.dirname(resource));
                }
                // optimization: if the provider has unbuffered write capability and the data
                // to write is not a buffer, we consume up to 3 chunks and try to write the data
                // unbuffered to reduce the overhead. If the stream or readable has more data
                // to provide we continue to write buffered.
                let bufferOrReadableOrStreamOrBufferedStream;
                if ((0, files_1.hasReadWriteCapability)(provider) && !(bufferOrReadableOrStream instanceof buffer_1.VSBuffer)) {
                    if ((0, stream_1.isReadableStream)(bufferOrReadableOrStream)) {
                        const bufferedStream = await (0, stream_1.peekStream)(bufferOrReadableOrStream, 3);
                        if (bufferedStream.ended) {
                            bufferOrReadableOrStreamOrBufferedStream = buffer_1.VSBuffer.concat(bufferedStream.buffer);
                        }
                        else {
                            bufferOrReadableOrStreamOrBufferedStream = bufferedStream;
                        }
                    }
                    else {
                        bufferOrReadableOrStreamOrBufferedStream = (0, stream_1.peekReadable)(bufferOrReadableOrStream, data => buffer_1.VSBuffer.concat(data), 3);
                    }
                }
                else {
                    bufferOrReadableOrStreamOrBufferedStream = bufferOrReadableOrStream;
                }
                // write file: unbuffered (only if data to write is a buffer, or the provider has no buffered write capability)
                if (!(0, files_1.hasOpenReadWriteCloseCapability)(provider) || ((0, files_1.hasReadWriteCapability)(provider) && bufferOrReadableOrStreamOrBufferedStream instanceof buffer_1.VSBuffer)) {
                    await this.doWriteUnbuffered(provider, resource, options, bufferOrReadableOrStreamOrBufferedStream);
                }
                // write file: buffered
                else {
                    const contents = bufferOrReadableOrStreamOrBufferedStream instanceof buffer_1.VSBuffer ? (0, buffer_1.bufferToReadable)(bufferOrReadableOrStreamOrBufferedStream) : bufferOrReadableOrStreamOrBufferedStream;
                    // atomic write
                    if (options?.atomic !== false && options?.atomic?.postfix) {
                        await this.doWriteBufferedAtomic(provider, resource, (0, resources_1.joinPath)((0, resources_1.dirname)(resource), `${(0, resources_1.basename)(resource)}${options.atomic.postfix}`), options, contents);
                    }
                    // non-atomic write
                    else {
                        await this.doWriteBuffered(provider, resource, options, contents);
                    }
                }
                // events
                this._onDidRunOperation.fire(new files_1.FileOperationEvent(resource, 4 /* FileOperation.WRITE */));
            }
            catch (error) {
                throw new files_1.FileOperationError((0, nls_1.localize)('err.write', "Unable to write file '{0}' ({1})", this.resourceForError(resource), (0, files_1.ensureFileSystemProviderError)(error).toString()), (0, files_1.toFileOperationResult)(error), options);
            }
            return this.resolve(resource, { resolveMetadata: true });
        }
        async validateWriteFile(provider, resource, options) {
            // Validate unlock support
            const unlock = !!options?.unlock;
            if (unlock && !(provider.capabilities & 8192 /* FileSystemProviderCapabilities.FileWriteUnlock */)) {
                throw new Error((0, nls_1.localize)('writeFailedUnlockUnsupported', "Unable to unlock file '{0}' because provider does not support it.", this.resourceForError(resource)));
            }
            // Validate atomic support
            const atomic = !!options?.atomic;
            if (atomic) {
                if (!(provider.capabilities & 32768 /* FileSystemProviderCapabilities.FileAtomicWrite */)) {
                    throw new Error((0, nls_1.localize)('writeFailedAtomicUnsupported', "Unable to atomically write file '{0}' because provider does not support it.", this.resourceForError(resource)));
                }
                if (unlock) {
                    throw new Error((0, nls_1.localize)('writeFailedAtomicUnlock', "Unable to unlock file '{0}' because atomic write is enabled.", this.resourceForError(resource)));
                }
            }
            // Validate via file stat meta data
            let stat = undefined;
            try {
                stat = await provider.stat(resource);
            }
            catch (error) {
                return undefined; // file might not exist
            }
            // File cannot be directory
            if ((stat.type & files_1.FileType.Directory) !== 0) {
                throw new files_1.FileOperationError((0, nls_1.localize)('fileIsDirectoryWriteError', "Unable to write file '{0}' that is actually a directory", this.resourceForError(resource)), 0 /* FileOperationResult.FILE_IS_DIRECTORY */, options);
            }
            // File cannot be readonly
            this.throwIfFileIsReadonly(resource, stat);
            // Dirty write prevention: if the file on disk has been changed and does not match our expected
            // mtime and etag, we bail out to prevent dirty writing.
            //
            // First, we check for a mtime that is in the future before we do more checks. The assumption is
            // that only the mtime is an indicator for a file that has changed on disk.
            //
            // Second, if the mtime has advanced, we compare the size of the file on disk with our previous
            // one using the etag() function. Relying only on the mtime check has prooven to produce false
            // positives due to file system weirdness (especially around remote file systems). As such, the
            // check for size is a weaker check because it can return a false negative if the file has changed
            // but to the same length. This is a compromise we take to avoid having to produce checksums of
            // the file content for comparison which would be much slower to compute.
            if (typeof options?.mtime === 'number' && typeof options.etag === 'string' && options.etag !== files_1.ETAG_DISABLED &&
                typeof stat.mtime === 'number' && typeof stat.size === 'number' &&
                options.mtime < stat.mtime && options.etag !== (0, files_1.etag)({ mtime: options.mtime /* not using stat.mtime for a reason, see above */, size: stat.size })) {
                throw new files_1.FileOperationError((0, nls_1.localize)('fileModifiedError', "File Modified Since"), 3 /* FileOperationResult.FILE_MODIFIED_SINCE */, options);
            }
            return stat;
        }
        async readFile(resource, options, token) {
            const provider = await this.withReadProvider(resource);
            if (options?.atomic) {
                return this.doReadFileAtomic(provider, resource, options, token);
            }
            return this.doReadFile(provider, resource, options, token);
        }
        async doReadFileAtomic(provider, resource, options, token) {
            return new Promise((resolve, reject) => {
                this.writeQueue.queueFor(resource, this.getExtUri(provider).providerExtUri).queue(async () => {
                    try {
                        const content = await this.doReadFile(provider, resource, options, token);
                        resolve(content);
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
        }
        async doReadFile(provider, resource, options, token) {
            const stream = await this.doReadFileStream(provider, resource, {
                ...options,
                // optimization: since we know that the caller does not
                // care about buffering, we indicate this to the reader.
                // this reduces all the overhead the buffered reading
                // has (open, read, close) if the provider supports
                // unbuffered reading.
                preferUnbuffered: true
            }, token);
            return {
                ...stream,
                value: await (0, buffer_1.streamToBuffer)(stream.value)
            };
        }
        async readFileStream(resource, options, token) {
            const provider = await this.withReadProvider(resource);
            return this.doReadFileStream(provider, resource, options, token);
        }
        async doReadFileStream(provider, resource, options, token) {
            // install a cancellation token that gets cancelled
            // when any error occurs. this allows us to resolve
            // the content of the file while resolving metadata
            // but still cancel the operation in certain cases.
            //
            // in addition, we pass the optional token in that
            // we got from the outside to even allow for external
            // cancellation of the read operation.
            const cancellableSource = new cancellation_1.CancellationTokenSource(token);
            // validate read operation
            const statPromise = this.validateReadFile(resource, options).then(stat => stat, error => {
                cancellableSource.dispose(true);
                throw error;
            });
            let fileStream = undefined;
            try {
                // if the etag is provided, we await the result of the validation
                // due to the likelihood of hitting a NOT_MODIFIED_SINCE result.
                // otherwise, we let it run in parallel to the file reading for
                // optimal startup performance.
                if (typeof options?.etag === 'string' && options.etag !== files_1.ETAG_DISABLED) {
                    await statPromise;
                }
                // read unbuffered
                if ((options?.atomic && (0, files_1.hasFileAtomicReadCapability)(provider)) || // atomic reads are always unbuffered
                    !((0, files_1.hasOpenReadWriteCloseCapability)(provider) || (0, files_1.hasFileReadStreamCapability)(provider)) || // provider has no buffered capability
                    ((0, files_1.hasReadWriteCapability)(provider) && options?.preferUnbuffered) // unbuffered read is preferred
                ) {
                    fileStream = this.readFileUnbuffered(provider, resource, options);
                }
                // read streamed (always prefer over primitive buffered read)
                else if ((0, files_1.hasFileReadStreamCapability)(provider)) {
                    fileStream = this.readFileStreamed(provider, resource, cancellableSource.token, options);
                }
                // read buffered
                else {
                    fileStream = this.readFileBuffered(provider, resource, cancellableSource.token, options);
                }
                fileStream.on('end', () => cancellableSource.dispose());
                fileStream.on('error', () => cancellableSource.dispose());
                const fileStat = await statPromise;
                return {
                    ...fileStat,
                    value: fileStream
                };
            }
            catch (error) {
                // Await the stream to finish so that we exit this method
                // in a consistent state with file handles closed
                // (https://github.com/microsoft/vscode/issues/114024)
                if (fileStream) {
                    await (0, stream_1.consumeStream)(fileStream);
                }
                // Re-throw errors as file operation errors but preserve
                // specific errors (such as not modified since)
                throw this.restoreReadError(error, resource, options);
            }
        }
        restoreReadError(error, resource, options) {
            const message = (0, nls_1.localize)('err.read', "Unable to read file '{0}' ({1})", this.resourceForError(resource), (0, files_1.ensureFileSystemProviderError)(error).toString());
            if (error instanceof files_1.NotModifiedSinceFileOperationError) {
                return new files_1.NotModifiedSinceFileOperationError(message, error.stat, options);
            }
            if (error instanceof files_1.TooLargeFileOperationError) {
                return new files_1.TooLargeFileOperationError(message, error.fileOperationResult, error.size, error.options);
            }
            return new files_1.FileOperationError(message, (0, files_1.toFileOperationResult)(error), options);
        }
        readFileStreamed(provider, resource, token, options = Object.create(null)) {
            const fileStream = provider.readFileStream(resource, options, token);
            return (0, stream_1.transform)(fileStream, {
                data: data => data instanceof buffer_1.VSBuffer ? data : buffer_1.VSBuffer.wrap(data),
                error: error => this.restoreReadError(error, resource, options)
            }, data => buffer_1.VSBuffer.concat(data));
        }
        readFileBuffered(provider, resource, token, options = Object.create(null)) {
            const stream = (0, buffer_1.newWriteableBufferStream)();
            (0, io_1.readFileIntoStream)(provider, resource, stream, data => data, {
                ...options,
                bufferSize: this.BUFFER_SIZE,
                errorTransformer: error => this.restoreReadError(error, resource, options)
            }, token);
            return stream;
        }
        readFileUnbuffered(provider, resource, options) {
            const stream = (0, stream_1.newWriteableStream)(data => buffer_1.VSBuffer.concat(data));
            // Read the file into the stream async but do not wait for
            // this to complete because streams work via events
            (async () => {
                try {
                    let buffer;
                    if (options?.atomic && (0, files_1.hasFileAtomicReadCapability)(provider)) {
                        buffer = await provider.readFile(resource, { atomic: true });
                    }
                    else {
                        buffer = await provider.readFile(resource);
                    }
                    // respect position option
                    if (typeof options?.position === 'number') {
                        buffer = buffer.slice(options.position);
                    }
                    // respect length option
                    if (typeof options?.length === 'number') {
                        buffer = buffer.slice(0, options.length);
                    }
                    // Throw if file is too large to load
                    this.validateReadFileLimits(resource, buffer.byteLength, options);
                    // End stream with data
                    stream.end(buffer_1.VSBuffer.wrap(buffer));
                }
                catch (err) {
                    stream.error(err);
                    stream.end();
                }
            })();
            return stream;
        }
        async validateReadFile(resource, options) {
            const stat = await this.resolve(resource, { resolveMetadata: true });
            // Throw if resource is a directory
            if (stat.isDirectory) {
                throw new files_1.FileOperationError((0, nls_1.localize)('fileIsDirectoryReadError', "Unable to read file '{0}' that is actually a directory", this.resourceForError(resource)), 0 /* FileOperationResult.FILE_IS_DIRECTORY */, options);
            }
            // Throw if file not modified since (unless disabled)
            if (typeof options?.etag === 'string' && options.etag !== files_1.ETAG_DISABLED && options.etag === stat.etag) {
                throw new files_1.NotModifiedSinceFileOperationError((0, nls_1.localize)('fileNotModifiedError', "File not modified since"), stat, options);
            }
            // Throw if file is too large to load
            this.validateReadFileLimits(resource, stat.size, options);
            return stat;
        }
        validateReadFileLimits(resource, size, options) {
            if (typeof options?.limits?.size === 'number' && size > options.limits.size) {
                throw new files_1.TooLargeFileOperationError((0, nls_1.localize)('fileTooLargeError', "Unable to read file '{0}' that is too large to open", this.resourceForError(resource)), 7 /* FileOperationResult.FILE_TOO_LARGE */, size, options);
            }
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        async canMove(source, target, overwrite) {
            return this.doCanMoveCopy(source, target, 'move', overwrite);
        }
        async canCopy(source, target, overwrite) {
            return this.doCanMoveCopy(source, target, 'copy', overwrite);
        }
        async doCanMoveCopy(source, target, mode, overwrite) {
            if (source.toString() !== target.toString()) {
                try {
                    const sourceProvider = mode === 'move' ? this.throwIfFileSystemIsReadonly(await this.withWriteProvider(source), source) : await this.withReadProvider(source);
                    const targetProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(target), target);
                    await this.doValidateMoveCopy(sourceProvider, source, targetProvider, target, mode, overwrite);
                }
                catch (error) {
                    return error;
                }
            }
            return true;
        }
        async move(source, target, overwrite) {
            const sourceProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(source), source);
            const targetProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(target), target);
            // move
            const mode = await this.doMoveCopy(sourceProvider, source, targetProvider, target, 'move', !!overwrite);
            // resolve and send events
            const fileStat = await this.resolve(target, { resolveMetadata: true });
            this._onDidRunOperation.fire(new files_1.FileOperationEvent(source, mode === 'move' ? 2 /* FileOperation.MOVE */ : 3 /* FileOperation.COPY */, fileStat));
            return fileStat;
        }
        async copy(source, target, overwrite) {
            const sourceProvider = await this.withReadProvider(source);
            const targetProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(target), target);
            // copy
            const mode = await this.doMoveCopy(sourceProvider, source, targetProvider, target, 'copy', !!overwrite);
            // resolve and send events
            const fileStat = await this.resolve(target, { resolveMetadata: true });
            this._onDidRunOperation.fire(new files_1.FileOperationEvent(source, mode === 'copy' ? 3 /* FileOperation.COPY */ : 2 /* FileOperation.MOVE */, fileStat));
            return fileStat;
        }
        async doMoveCopy(sourceProvider, source, targetProvider, target, mode, overwrite) {
            if (source.toString() === target.toString()) {
                return mode; // simulate node.js behaviour here and do a no-op if paths match
            }
            // validation
            const { exists, isSameResourceWithDifferentPathCase } = await this.doValidateMoveCopy(sourceProvider, source, targetProvider, target, mode, overwrite);
            // delete as needed (unless target is same resurce with different path case)
            if (exists && !isSameResourceWithDifferentPathCase && overwrite) {
                await this.del(target, { recursive: true });
            }
            // create parent folders
            await this.mkdirp(targetProvider, this.getExtUri(targetProvider).providerExtUri.dirname(target));
            // copy source => target
            if (mode === 'copy') {
                // same provider with fast copy: leverage copy() functionality
                if (sourceProvider === targetProvider && (0, files_1.hasFileFolderCopyCapability)(sourceProvider)) {
                    await sourceProvider.copy(source, target, { overwrite });
                }
                // when copying via buffer/unbuffered, we have to manually
                // traverse the source if it is a folder and not a file
                else {
                    const sourceFile = await this.resolve(source);
                    if (sourceFile.isDirectory) {
                        await this.doCopyFolder(sourceProvider, sourceFile, targetProvider, target);
                    }
                    else {
                        await this.doCopyFile(sourceProvider, source, targetProvider, target);
                    }
                }
                return mode;
            }
            // move source => target
            else {
                // same provider: leverage rename() functionality
                if (sourceProvider === targetProvider) {
                    await sourceProvider.rename(source, target, { overwrite });
                    return mode;
                }
                // across providers: copy to target & delete at source
                else {
                    await this.doMoveCopy(sourceProvider, source, targetProvider, target, 'copy', overwrite);
                    await this.del(source, { recursive: true });
                    return 'copy';
                }
            }
        }
        async doCopyFile(sourceProvider, source, targetProvider, target) {
            // copy: source (buffered) => target (buffered)
            if ((0, files_1.hasOpenReadWriteCloseCapability)(sourceProvider) && (0, files_1.hasOpenReadWriteCloseCapability)(targetProvider)) {
                return this.doPipeBuffered(sourceProvider, source, targetProvider, target);
            }
            // copy: source (buffered) => target (unbuffered)
            if ((0, files_1.hasOpenReadWriteCloseCapability)(sourceProvider) && (0, files_1.hasReadWriteCapability)(targetProvider)) {
                return this.doPipeBufferedToUnbuffered(sourceProvider, source, targetProvider, target);
            }
            // copy: source (unbuffered) => target (buffered)
            if ((0, files_1.hasReadWriteCapability)(sourceProvider) && (0, files_1.hasOpenReadWriteCloseCapability)(targetProvider)) {
                return this.doPipeUnbufferedToBuffered(sourceProvider, source, targetProvider, target);
            }
            // copy: source (unbuffered) => target (unbuffered)
            if ((0, files_1.hasReadWriteCapability)(sourceProvider) && (0, files_1.hasReadWriteCapability)(targetProvider)) {
                return this.doPipeUnbuffered(sourceProvider, source, targetProvider, target);
            }
        }
        async doCopyFolder(sourceProvider, sourceFolder, targetProvider, targetFolder) {
            // create folder in target
            await targetProvider.mkdir(targetFolder);
            // create children in target
            if (Array.isArray(sourceFolder.children)) {
                await async_1.Promises.settled(sourceFolder.children.map(async (sourceChild) => {
                    const targetChild = this.getExtUri(targetProvider).providerExtUri.joinPath(targetFolder, sourceChild.name);
                    if (sourceChild.isDirectory) {
                        return this.doCopyFolder(sourceProvider, await this.resolve(sourceChild.resource), targetProvider, targetChild);
                    }
                    else {
                        return this.doCopyFile(sourceProvider, sourceChild.resource, targetProvider, targetChild);
                    }
                }));
            }
        }
        async doValidateMoveCopy(sourceProvider, source, targetProvider, target, mode, overwrite) {
            let isSameResourceWithDifferentPathCase = false;
            // Check if source is equal or parent to target (requires providers to be the same)
            if (sourceProvider === targetProvider) {
                const { providerExtUri, isPathCaseSensitive } = this.getExtUri(sourceProvider);
                if (!isPathCaseSensitive) {
                    isSameResourceWithDifferentPathCase = providerExtUri.isEqual(source, target);
                }
                if (isSameResourceWithDifferentPathCase && mode === 'copy') {
                    throw new Error((0, nls_1.localize)('unableToMoveCopyError1', "Unable to copy when source '{0}' is same as target '{1}' with different path case on a case insensitive file system", this.resourceForError(source), this.resourceForError(target)));
                }
                if (!isSameResourceWithDifferentPathCase && providerExtUri.isEqualOrParent(target, source)) {
                    throw new Error((0, nls_1.localize)('unableToMoveCopyError2', "Unable to move/copy when source '{0}' is parent of target '{1}'.", this.resourceForError(source), this.resourceForError(target)));
                }
            }
            // Extra checks if target exists and this is not a rename
            const exists = await this.exists(target);
            if (exists && !isSameResourceWithDifferentPathCase) {
                // Bail out if target exists and we are not about to overwrite
                if (!overwrite) {
                    throw new files_1.FileOperationError((0, nls_1.localize)('unableToMoveCopyError3', "Unable to move/copy '{0}' because target '{1}' already exists at destination.", this.resourceForError(source), this.resourceForError(target)), 4 /* FileOperationResult.FILE_MOVE_CONFLICT */);
                }
                // Special case: if the target is a parent of the source, we cannot delete
                // it as it would delete the source as well. In this case we have to throw
                if (sourceProvider === targetProvider) {
                    const { providerExtUri } = this.getExtUri(sourceProvider);
                    if (providerExtUri.isEqualOrParent(source, target)) {
                        throw new Error((0, nls_1.localize)('unableToMoveCopyError4', "Unable to move/copy '{0}' into '{1}' since a file would replace the folder it is contained in.", this.resourceForError(source), this.resourceForError(target)));
                    }
                }
            }
            return { exists, isSameResourceWithDifferentPathCase };
        }
        getExtUri(provider) {
            const isPathCaseSensitive = this.isPathCaseSensitive(provider);
            return {
                providerExtUri: isPathCaseSensitive ? resources_1.extUri : resources_1.extUriIgnorePathCase,
                isPathCaseSensitive
            };
        }
        isPathCaseSensitive(provider) {
            return !!(provider.capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
        }
        async createFolder(resource) {
            const provider = this.throwIfFileSystemIsReadonly(await this.withProvider(resource), resource);
            // mkdir recursively
            await this.mkdirp(provider, resource);
            // events
            const fileStat = await this.resolve(resource, { resolveMetadata: true });
            this._onDidRunOperation.fire(new files_1.FileOperationEvent(resource, 0 /* FileOperation.CREATE */, fileStat));
            return fileStat;
        }
        async mkdirp(provider, directory) {
            const directoriesToCreate = [];
            // mkdir until we reach root
            const { providerExtUri } = this.getExtUri(provider);
            while (!providerExtUri.isEqual(directory, providerExtUri.dirname(directory))) {
                try {
                    const stat = await provider.stat(directory);
                    if ((stat.type & files_1.FileType.Directory) === 0) {
                        throw new Error((0, nls_1.localize)('mkdirExistsError', "Unable to create folder '{0}' that already exists but is not a directory", this.resourceForError(directory)));
                    }
                    break; // we have hit a directory that exists -> good
                }
                catch (error) {
                    // Bubble up any other error that is not file not found
                    if ((0, files_1.toFileSystemProviderErrorCode)(error) !== files_1.FileSystemProviderErrorCode.FileNotFound) {
                        throw error;
                    }
                    // Upon error, remember directories that need to be created
                    directoriesToCreate.push(providerExtUri.basename(directory));
                    // Continue up
                    directory = providerExtUri.dirname(directory);
                }
            }
            // Create directories as needed
            for (let i = directoriesToCreate.length - 1; i >= 0; i--) {
                directory = providerExtUri.joinPath(directory, directoriesToCreate[i]);
                try {
                    await provider.mkdir(directory);
                }
                catch (error) {
                    if ((0, files_1.toFileSystemProviderErrorCode)(error) !== files_1.FileSystemProviderErrorCode.FileExists) {
                        // For mkdirp() we tolerate that the mkdir() call fails
                        // in case the folder already exists. This follows node.js
                        // own implementation of fs.mkdir({ recursive: true }) and
                        // reduces the chances of race conditions leading to errors
                        // if multiple calls try to create the same folders
                        // As such, we only throw an error here if it is other than
                        // the fact that the file already exists.
                        // (see also https://github.com/microsoft/vscode/issues/89834)
                        throw error;
                    }
                }
            }
        }
        async canDelete(resource, options) {
            try {
                await this.doValidateDelete(resource, options);
            }
            catch (error) {
                return error;
            }
            return true;
        }
        async doValidateDelete(resource, options) {
            const provider = this.throwIfFileSystemIsReadonly(await this.withProvider(resource), resource);
            // Validate trash support
            const useTrash = !!options?.useTrash;
            if (useTrash && !(provider.capabilities & 4096 /* FileSystemProviderCapabilities.Trash */)) {
                throw new Error((0, nls_1.localize)('deleteFailedTrashUnsupported', "Unable to delete file '{0}' via trash because provider does not support it.", this.resourceForError(resource)));
            }
            // Validate atomic support
            const atomic = options?.atomic;
            if (atomic && !(provider.capabilities & 65536 /* FileSystemProviderCapabilities.FileAtomicDelete */)) {
                throw new Error((0, nls_1.localize)('deleteFailedAtomicUnsupported', "Unable to delete file '{0}' atomically because provider does not support it.", this.resourceForError(resource)));
            }
            if (useTrash && atomic) {
                throw new Error((0, nls_1.localize)('deleteFailedTrashAndAtomicUnsupported', "Unable to atomically delete file '{0}' because using trash is enabled.", this.resourceForError(resource)));
            }
            // Validate delete
            let stat = undefined;
            try {
                stat = await provider.stat(resource);
            }
            catch (error) {
                // Handled later
            }
            if (stat) {
                this.throwIfFileIsReadonly(resource, stat);
            }
            else {
                throw new files_1.FileOperationError((0, nls_1.localize)('deleteFailedNotFound', "Unable to delete nonexistent file '{0}'", this.resourceForError(resource)), 1 /* FileOperationResult.FILE_NOT_FOUND */);
            }
            // Validate recursive
            const recursive = !!options?.recursive;
            if (!recursive) {
                const stat = await this.resolve(resource);
                if (stat.isDirectory && Array.isArray(stat.children) && stat.children.length > 0) {
                    throw new Error((0, nls_1.localize)('deleteFailedNonEmptyFolder', "Unable to delete non-empty folder '{0}'.", this.resourceForError(resource)));
                }
            }
            return provider;
        }
        async del(resource, options) {
            const provider = await this.doValidateDelete(resource, options);
            const useTrash = !!options?.useTrash;
            const recursive = !!options?.recursive;
            const atomic = options?.atomic ?? false;
            // Delete through provider
            await provider.delete(resource, { recursive, useTrash, atomic });
            // Events
            this._onDidRunOperation.fire(new files_1.FileOperationEvent(resource, 1 /* FileOperation.DELETE */));
        }
        //#endregion
        //#region Clone File
        async cloneFile(source, target) {
            const sourceProvider = await this.withProvider(source);
            const targetProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(target), target);
            if (sourceProvider === targetProvider && this.getExtUri(sourceProvider).providerExtUri.isEqual(source, target)) {
                return; // return early if paths are equal
            }
            // same provider, use `cloneFile` when native support is provided
            if (sourceProvider === targetProvider && (0, files_1.hasFileCloneCapability)(sourceProvider)) {
                return sourceProvider.cloneFile(source, target);
            }
            // otherwise, either providers are different or there is no native
            // `cloneFile` support, then we fallback to emulate a clone as best
            // as we can with the other primitives
            // create parent folders
            await this.mkdirp(targetProvider, this.getExtUri(targetProvider).providerExtUri.dirname(target));
            // queue on the source to ensure atomic read
            const sourceWriteQueue = this.writeQueue.queueFor(source, this.getExtUri(sourceProvider).providerExtUri);
            // leverage `copy` method if provided and providers are identical
            if (sourceProvider === targetProvider && (0, files_1.hasFileFolderCopyCapability)(sourceProvider)) {
                return sourceWriteQueue.queue(() => sourceProvider.copy(source, target, { overwrite: true }));
            }
            // otherwise copy via buffer/unbuffered and use a write queue
            // on the source to ensure atomic operation as much as possible
            return sourceWriteQueue.queue(() => this.doCopyFile(sourceProvider, source, targetProvider, target));
        }
        watch(resource, options = { recursive: false, excludes: [] }) {
            const disposables = new lifecycle_1.DisposableStore();
            // Forward watch request to provider and wire in disposables
            let watchDisposed = false;
            let disposeWatch = () => { watchDisposed = true; };
            disposables.add((0, lifecycle_1.toDisposable)(() => disposeWatch()));
            // Watch and wire in disposable which is async but
            // check if we got disposed meanwhile and forward
            (async () => {
                try {
                    const disposable = await this.doWatch(resource, options);
                    if (watchDisposed) {
                        (0, lifecycle_1.dispose)(disposable);
                    }
                    else {
                        disposeWatch = () => (0, lifecycle_1.dispose)(disposable);
                    }
                }
                catch (error) {
                    this.logService.error(error);
                }
            })();
            return disposables;
        }
        async doWatch(resource, options) {
            const provider = await this.withProvider(resource);
            // Deduplicate identical watch requests
            const watchHash = (0, hash_1.hash)([this.getExtUri(provider).providerExtUri.getComparisonKey(resource), options]);
            let watcher = this.activeWatchers.get(watchHash);
            if (!watcher) {
                watcher = {
                    count: 0,
                    disposable: provider.watch(resource, options)
                };
                this.activeWatchers.set(watchHash, watcher);
            }
            // Increment usage counter
            watcher.count += 1;
            return (0, lifecycle_1.toDisposable)(() => {
                if (watcher) {
                    // Unref
                    watcher.count--;
                    // Dispose only when last user is reached
                    if (watcher.count === 0) {
                        (0, lifecycle_1.dispose)(watcher.disposable);
                        this.activeWatchers.delete(watchHash);
                    }
                }
            });
        }
        dispose() {
            super.dispose();
            for (const [, watcher] of this.activeWatchers) {
                (0, lifecycle_1.dispose)(watcher.disposable);
            }
            this.activeWatchers.clear();
        }
        async doWriteBufferedAtomic(provider, resource, tempResource, options, readableOrStreamOrBufferedStream) {
            // Write to temp resource first
            await this.doWriteBuffered(provider, tempResource, options, readableOrStreamOrBufferedStream);
            try {
                // Rename over existing to ensure atomic replace
                await provider.rename(tempResource, resource, { overwrite: true });
            }
            catch (error) {
                // Cleanup in case of rename error
                try {
                    await provider.delete(tempResource, { recursive: false, useTrash: false, atomic: false });
                }
                catch (error) {
                    // ignore - we want the outer error to bubble up
                }
                throw error;
            }
        }
        async doWriteBuffered(provider, resource, options, readableOrStreamOrBufferedStream) {
            return this.writeQueue.queueFor(resource, this.getExtUri(provider).providerExtUri).queue(async () => {
                // open handle
                const handle = await provider.open(resource, { create: true, unlock: options?.unlock ?? false });
                // write into handle until all bytes from buffer have been written
                try {
                    if ((0, stream_1.isReadableStream)(readableOrStreamOrBufferedStream) || (0, stream_1.isReadableBufferedStream)(readableOrStreamOrBufferedStream)) {
                        await this.doWriteStreamBufferedQueued(provider, handle, readableOrStreamOrBufferedStream);
                    }
                    else {
                        await this.doWriteReadableBufferedQueued(provider, handle, readableOrStreamOrBufferedStream);
                    }
                }
                catch (error) {
                    throw (0, files_1.ensureFileSystemProviderError)(error);
                }
                finally {
                    // close handle always
                    await provider.close(handle);
                }
            });
        }
        async doWriteStreamBufferedQueued(provider, handle, streamOrBufferedStream) {
            let posInFile = 0;
            let stream;
            // Buffered stream: consume the buffer first by writing
            // it to the target before reading from the stream.
            if ((0, stream_1.isReadableBufferedStream)(streamOrBufferedStream)) {
                if (streamOrBufferedStream.buffer.length > 0) {
                    const chunk = buffer_1.VSBuffer.concat(streamOrBufferedStream.buffer);
                    await this.doWriteBuffer(provider, handle, chunk, chunk.byteLength, posInFile, 0);
                    posInFile += chunk.byteLength;
                }
                // If the stream has been consumed, return early
                if (streamOrBufferedStream.ended) {
                    return;
                }
                stream = streamOrBufferedStream.stream;
            }
            // Unbuffered stream - just take as is
            else {
                stream = streamOrBufferedStream;
            }
            return new Promise((resolve, reject) => {
                (0, stream_1.listenStream)(stream, {
                    onData: async (chunk) => {
                        // pause stream to perform async write operation
                        stream.pause();
                        try {
                            await this.doWriteBuffer(provider, handle, chunk, chunk.byteLength, posInFile, 0);
                        }
                        catch (error) {
                            return reject(error);
                        }
                        posInFile += chunk.byteLength;
                        // resume stream now that we have successfully written
                        // run this on the next tick to prevent increasing the
                        // execution stack because resume() may call the event
                        // handler again before finishing.
                        setTimeout(() => stream.resume());
                    },
                    onError: error => reject(error),
                    onEnd: () => resolve()
                });
            });
        }
        async doWriteReadableBufferedQueued(provider, handle, readable) {
            let posInFile = 0;
            let chunk;
            while ((chunk = readable.read()) !== null) {
                await this.doWriteBuffer(provider, handle, chunk, chunk.byteLength, posInFile, 0);
                posInFile += chunk.byteLength;
            }
        }
        async doWriteBuffer(provider, handle, buffer, length, posInFile, posInBuffer) {
            let totalBytesWritten = 0;
            while (totalBytesWritten < length) {
                // Write through the provider
                const bytesWritten = await provider.write(handle, posInFile + totalBytesWritten, buffer.buffer, posInBuffer + totalBytesWritten, length - totalBytesWritten);
                totalBytesWritten += bytesWritten;
            }
        }
        async doWriteUnbuffered(provider, resource, options, bufferOrReadableOrStreamOrBufferedStream) {
            return this.writeQueue.queueFor(resource, this.getExtUri(provider).providerExtUri).queue(() => this.doWriteUnbufferedQueued(provider, resource, options, bufferOrReadableOrStreamOrBufferedStream));
        }
        async doWriteUnbufferedQueued(provider, resource, options, bufferOrReadableOrStreamOrBufferedStream) {
            let buffer;
            if (bufferOrReadableOrStreamOrBufferedStream instanceof buffer_1.VSBuffer) {
                buffer = bufferOrReadableOrStreamOrBufferedStream;
            }
            else if ((0, stream_1.isReadableStream)(bufferOrReadableOrStreamOrBufferedStream)) {
                buffer = await (0, buffer_1.streamToBuffer)(bufferOrReadableOrStreamOrBufferedStream);
            }
            else if ((0, stream_1.isReadableBufferedStream)(bufferOrReadableOrStreamOrBufferedStream)) {
                buffer = await (0, buffer_1.bufferedStreamToBuffer)(bufferOrReadableOrStreamOrBufferedStream);
            }
            else {
                buffer = (0, buffer_1.readableToBuffer)(bufferOrReadableOrStreamOrBufferedStream);
            }
            // Write through the provider
            await provider.writeFile(resource, buffer.buffer, { create: true, overwrite: true, unlock: options?.unlock ?? false, atomic: options?.atomic ?? false });
        }
        async doPipeBuffered(sourceProvider, source, targetProvider, target) {
            return this.writeQueue.queueFor(target, this.getExtUri(targetProvider).providerExtUri).queue(() => this.doPipeBufferedQueued(sourceProvider, source, targetProvider, target));
        }
        async doPipeBufferedQueued(sourceProvider, source, targetProvider, target) {
            let sourceHandle = undefined;
            let targetHandle = undefined;
            try {
                // Open handles
                sourceHandle = await sourceProvider.open(source, { create: false });
                targetHandle = await targetProvider.open(target, { create: true, unlock: false });
                const buffer = buffer_1.VSBuffer.alloc(this.BUFFER_SIZE);
                let posInFile = 0;
                let posInBuffer = 0;
                let bytesRead = 0;
                do {
                    // read from source (sourceHandle) at current position (posInFile) into buffer (buffer) at
                    // buffer position (posInBuffer) up to the size of the buffer (buffer.byteLength).
                    bytesRead = await sourceProvider.read(sourceHandle, posInFile, buffer.buffer, posInBuffer, buffer.byteLength - posInBuffer);
                    // write into target (targetHandle) at current position (posInFile) from buffer (buffer) at
                    // buffer position (posInBuffer) all bytes we read (bytesRead).
                    await this.doWriteBuffer(targetProvider, targetHandle, buffer, bytesRead, posInFile, posInBuffer);
                    posInFile += bytesRead;
                    posInBuffer += bytesRead;
                    // when buffer full, fill it again from the beginning
                    if (posInBuffer === buffer.byteLength) {
                        posInBuffer = 0;
                    }
                } while (bytesRead > 0);
            }
            catch (error) {
                throw (0, files_1.ensureFileSystemProviderError)(error);
            }
            finally {
                await async_1.Promises.settled([
                    typeof sourceHandle === 'number' ? sourceProvider.close(sourceHandle) : Promise.resolve(),
                    typeof targetHandle === 'number' ? targetProvider.close(targetHandle) : Promise.resolve(),
                ]);
            }
        }
        async doPipeUnbuffered(sourceProvider, source, targetProvider, target) {
            return this.writeQueue.queueFor(target, this.getExtUri(targetProvider).providerExtUri).queue(() => this.doPipeUnbufferedQueued(sourceProvider, source, targetProvider, target));
        }
        async doPipeUnbufferedQueued(sourceProvider, source, targetProvider, target) {
            return targetProvider.writeFile(target, await sourceProvider.readFile(source), { create: true, overwrite: true, unlock: false, atomic: false });
        }
        async doPipeUnbufferedToBuffered(sourceProvider, source, targetProvider, target) {
            return this.writeQueue.queueFor(target, this.getExtUri(targetProvider).providerExtUri).queue(() => this.doPipeUnbufferedToBufferedQueued(sourceProvider, source, targetProvider, target));
        }
        async doPipeUnbufferedToBufferedQueued(sourceProvider, source, targetProvider, target) {
            // Open handle
            const targetHandle = await targetProvider.open(target, { create: true, unlock: false });
            // Read entire buffer from source and write buffered
            try {
                const buffer = await sourceProvider.readFile(source);
                await this.doWriteBuffer(targetProvider, targetHandle, buffer_1.VSBuffer.wrap(buffer), buffer.byteLength, 0, 0);
            }
            catch (error) {
                throw (0, files_1.ensureFileSystemProviderError)(error);
            }
            finally {
                await targetProvider.close(targetHandle);
            }
        }
        async doPipeBufferedToUnbuffered(sourceProvider, source, targetProvider, target) {
            // Read buffer via stream buffered
            const buffer = await (0, buffer_1.streamToBuffer)(this.readFileBuffered(sourceProvider, source, cancellation_1.CancellationToken.None));
            // Write buffer into target at once
            await this.doWriteUnbuffered(targetProvider, target, undefined, buffer);
        }
        throwIfFileSystemIsReadonly(provider, resource) {
            if (provider.capabilities & 2048 /* FileSystemProviderCapabilities.Readonly */) {
                throw new files_1.FileOperationError((0, nls_1.localize)('err.readonly', "Unable to modify read-only file '{0}'", this.resourceForError(resource)), 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
            }
            return provider;
        }
        throwIfFileIsReadonly(resource, stat) {
            if ((stat.permissions ?? 0) & files_1.FilePermission.Readonly) {
                throw new files_1.FileOperationError((0, nls_1.localize)('err.readonly', "Unable to modify read-only file '{0}'", this.resourceForError(resource)), 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
            }
        }
        resourceForError(resource) {
            if (resource.scheme === network_1.Schemas.file) {
                return resource.fsPath;
            }
            return resource.toString(true);
        }
    };
    exports.FileService = FileService;
    exports.FileService = FileService = __decorate([
        __param(0, log_1.ILogService)
    ], FileService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9maWxlcy9jb21tb24vZmlsZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0J6RixJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFZLFNBQVEsc0JBQVU7UUFTMUMsWUFBeUIsVUFBd0M7WUFDaEUsS0FBSyxFQUFFLENBQUM7WUFEaUMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUxqRSxrRUFBa0U7WUFDbEUsZ0VBQWdFO1lBQ2hFLHFEQUFxRDtZQUNwQyxnQkFBVyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7WUFNMUMsOEJBQThCO1lBRWIsZ0RBQTJDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBd0MsQ0FBQyxDQUFDO1lBQzFILCtDQUEwQyxHQUFHLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxLQUFLLENBQUM7WUFFNUYsc0NBQWlDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBc0MsQ0FBQyxDQUFDO1lBQzlHLHFDQUFnQyxHQUFHLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxLQUFLLENBQUM7WUFFeEUsK0NBQTBDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBOEMsQ0FBQyxDQUFDO1lBQy9ILDhDQUF5QyxHQUFHLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxLQUFLLENBQUM7WUFFMUYsYUFBUSxHQUFHLElBQUksR0FBRyxFQUErQixDQUFDO1lBdUhuRSxZQUFZO1lBRVosMEJBQTBCO1lBRVQsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBc0IsQ0FBQyxDQUFDO1lBQy9FLHNCQUFpQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7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