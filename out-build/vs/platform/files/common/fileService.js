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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/ternarySearchTree", "vs/base/common/network", "vs/base/common/performance", "vs/base/common/resources", "vs/base/common/stream", "vs/nls!vs/platform/files/common/fileService", "vs/platform/files/common/files", "vs/platform/files/common/io", "vs/platform/log/common/log", "vs/base/common/errors"], function (require, exports, arrays_1, async_1, buffer_1, cancellation_1, event_1, hash_1, iterator_1, lifecycle_1, ternarySearchTree_1, network_1, performance_1, resources_1, stream_1, nls_1, files_1, io_1, log_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Dp = void 0;
    let $Dp = class $Dp extends lifecycle_1.$kc {
        constructor(b) {
            super();
            this.b = b;
            // Choose a buffer size that is a balance between memory needs and
            // manageable IPC overhead. The larger the buffer size, the less
            // roundtrips we have to do for reading/writing data.
            this.a = 256 * 1024;
            //#region File System Provider
            this.c = this.B(new event_1.$fd());
            this.onDidChangeFileSystemProviderRegistrations = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onWillActivateFileSystemProvider = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeFileSystemProviderCapabilities = this.g.event;
            this.h = new Map();
            //#endregion
            //#region Operation events
            this.r = this.B(new event_1.$fd());
            this.onDidRunOperation = this.r.event;
            //#endregion
            //#region File Watching
            this.X = this.B(new event_1.$fd());
            this.onDidFilesChange = this.X.event;
            this.Y = this.B(new event_1.$fd());
            this.onDidWatchError = this.Y.event;
            this.Z = new Map();
            //#endregion
            //#region Helpers
            this.ab = this.B(new async_1.$Pg());
        }
        registerProvider(scheme, provider) {
            if (this.h.has(scheme)) {
                throw new Error(`A filesystem provider for the scheme '${scheme}' is already registered.`);
            }
            (0, performance_1.mark)(`code/registerFilesystem/${scheme}`);
            const providerDisposables = new lifecycle_1.$jc();
            // Add provider with event
            this.h.set(scheme, provider);
            this.c.fire({ added: true, scheme, provider });
            // Forward events from provider
            providerDisposables.add(provider.onDidChangeFile(changes => this.X.fire(new files_1.$lk(changes, !this.S(provider)))));
            if (typeof provider.onDidWatchError === 'function') {
                providerDisposables.add(provider.onDidWatchError(error => this.Y.fire(new Error(error))));
            }
            providerDisposables.add(provider.onDidChangeCapabilities(() => this.g.fire({ provider, scheme })));
            return (0, lifecycle_1.$ic)(() => {
                this.c.fire({ added: false, scheme, provider });
                this.h.delete(scheme);
                (0, lifecycle_1.$fc)(providerDisposables);
            });
        }
        getProvider(scheme) {
            return this.h.get(scheme);
        }
        async activateProvider(scheme) {
            // Emit an event that we are about to activate a provider with the given scheme.
            // Listeners can participate in the activation by registering a provider for it.
            const joiners = [];
            this.f.fire({
                scheme,
                join(promise) {
                    joiners.push(promise);
                },
            });
            if (this.h.has(scheme)) {
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
            return this.h.has(resource.scheme);
        }
        hasCapability(resource, capability) {
            const provider = this.h.get(resource.scheme);
            return !!(provider && (provider.capabilities & capability));
        }
        listCapabilities() {
            return iterator_1.Iterable.map(this.h, ([scheme, provider]) => ({ scheme, capabilities: provider.capabilities }));
        }
        async j(resource) {
            // Assert path is absolute
            if (!(0, resources_1.$mg)(resource)) {
                throw new files_1.$nk((0, nls_1.localize)(0, null, this.rb(resource)), 8 /* FileOperationResult.FILE_INVALID_PATH */);
            }
            // Activate provider
            await this.activateProvider(resource.scheme);
            // Assert provider
            const provider = this.h.get(resource.scheme);
            if (!provider) {
                const error = new errors_1.$_();
                error.message = (0, nls_1.localize)(1, null, resource.toString());
                throw error;
            }
            return provider;
        }
        async m(resource) {
            const provider = await this.j(resource);
            if ((0, files_1.$$j)(provider) || (0, files_1.$8j)(provider) || (0, files_1.$_j)(provider)) {
                return provider;
            }
            throw new Error(`Filesystem provider for scheme '${resource.scheme}' neither has FileReadWrite, FileReadStream nor FileOpenReadWriteClose capability which is needed for the read operation.`);
        }
        async n(resource) {
            const provider = await this.j(resource);
            if ((0, files_1.$$j)(provider) || (0, files_1.$8j)(provider)) {
                return provider;
            }
            throw new Error(`Filesystem provider for scheme '${resource.scheme}' neither has FileReadWrite nor FileOpenReadWriteClose capability which is needed for the write operation.`);
        }
        async resolve(resource, options) {
            try {
                return await this.s(resource, options);
            }
            catch (error) {
                // Specially handle file not found case as file operation result
                if ((0, files_1.$ik)(error) === files_1.FileSystemProviderErrorCode.FileNotFound) {
                    throw new files_1.$nk((0, nls_1.localize)(2, null, this.rb(resource)), 1 /* FileOperationResult.FILE_NOT_FOUND */);
                }
                // Bubble up any other error as is
                throw (0, files_1.$gk)(error);
            }
        }
        async s(resource, options) {
            const provider = await this.j(resource);
            const isPathCaseSensitive = this.S(provider);
            const resolveTo = options?.resolveTo;
            const resolveSingleChildDescendants = options?.resolveSingleChildDescendants;
            const resolveMetadata = options?.resolveMetadata;
            const stat = await provider.stat(resource);
            let trie;
            return this.t(provider, resource, stat, undefined, !!resolveMetadata, (stat, siblings) => {
                // lazy trie to check for recursive resolving
                if (!trie) {
                    trie = ternarySearchTree_1.$Hh.forUris(() => !isPathCaseSensitive);
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
        async t(provider, resource, stat, siblings, resolveMetadata, recurse) {
            const { providerExtUri } = this.R(provider);
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
                etag: (0, files_1.$yk)({ mtime: stat.mtime, size: stat.size }),
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
                            return await this.t(provider, childResource, childStat, entries.length, resolveMetadata, recurse);
                        }
                        catch (error) {
                            this.b.trace(error);
                            return null; // can happen e.g. due to permission errors
                        }
                    }));
                    // make sure to get rid of null values that signal a failure to resolve a particular entry
                    fileStat.children = (0, arrays_1.$Fb)(resolvedEntries);
                }
                catch (error) {
                    this.b.trace(error);
                    fileStat.children = []; // gracefully handle errors, we may not have permissions to read
                }
                return fileStat;
            }
            return fileStat;
        }
        async resolveAll(toResolve) {
            return async_1.Promises.settled(toResolve.map(async (entry) => {
                try {
                    return { stat: await this.s(entry.resource, entry.options), success: true };
                }
                catch (error) {
                    this.b.trace(error);
                    return { stat: undefined, success: false };
                }
            }));
        }
        async stat(resource) {
            const provider = await this.j(resource);
            const stat = await provider.stat(resource);
            return this.t(provider, resource, stat, undefined, true, () => false /* Do not resolve any children */);
        }
        async exists(resource) {
            const provider = await this.j(resource);
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
                await this.u(resource, options);
            }
            catch (error) {
                return error;
            }
            return true;
        }
        async u(resource, options) {
            // validate overwrite
            if (!options?.overwrite && await this.exists(resource)) {
                throw new files_1.$nk((0, nls_1.localize)(3, null, this.rb(resource)), 3 /* FileOperationResult.FILE_MODIFIED_SINCE */, options);
            }
        }
        async createFile(resource, bufferOrReadableOrStream = buffer_1.$Fd.fromString(''), options) {
            // validate
            await this.u(resource, options);
            // do write into file (this will create it too)
            const fileStat = await this.writeFile(resource, bufferOrReadableOrStream);
            // events
            this.r.fire(new files_1.$kk(resource, 0 /* FileOperation.CREATE */, fileStat));
            return fileStat;
        }
        async writeFile(resource, bufferOrReadableOrStream, options) {
            const provider = this.pb(await this.n(resource), resource);
            const { providerExtUri } = this.R(provider);
            try {
                // validate write
                const stat = await this.w(provider, resource, options);
                // mkdir recursively as needed
                if (!stat) {
                    await this.U(provider, providerExtUri.dirname(resource));
                }
                // optimization: if the provider has unbuffered write capability and the data
                // to write is not a buffer, we consume up to 3 chunks and try to write the data
                // unbuffered to reduce the overhead. If the stream or readable has more data
                // to provide we continue to write buffered.
                let bufferOrReadableOrStreamOrBufferedStream;
                if ((0, files_1.$8j)(provider) && !(bufferOrReadableOrStream instanceof buffer_1.$Fd)) {
                    if ((0, stream_1.$rd)(bufferOrReadableOrStream)) {
                        const bufferedStream = await (0, stream_1.$yd)(bufferOrReadableOrStream, 3);
                        if (bufferedStream.ended) {
                            bufferOrReadableOrStreamOrBufferedStream = buffer_1.$Fd.concat(bufferedStream.buffer);
                        }
                        else {
                            bufferOrReadableOrStreamOrBufferedStream = bufferedStream;
                        }
                    }
                    else {
                        bufferOrReadableOrStreamOrBufferedStream = (0, stream_1.$vd)(bufferOrReadableOrStream, data => buffer_1.$Fd.concat(data), 3);
                    }
                }
                else {
                    bufferOrReadableOrStreamOrBufferedStream = bufferOrReadableOrStream;
                }
                // write file: unbuffered (only if data to write is a buffer, or the provider has no buffered write capability)
                if (!(0, files_1.$$j)(provider) || ((0, files_1.$8j)(provider) && bufferOrReadableOrStreamOrBufferedStream instanceof buffer_1.$Fd)) {
                    await this.gb(provider, resource, options, bufferOrReadableOrStreamOrBufferedStream);
                }
                // write file: buffered
                else {
                    const contents = bufferOrReadableOrStreamOrBufferedStream instanceof buffer_1.$Fd ? (0, buffer_1.$Qd)(bufferOrReadableOrStreamOrBufferedStream) : bufferOrReadableOrStreamOrBufferedStream;
                    // atomic write
                    if (options?.atomic !== false && options?.atomic?.postfix) {
                        await this.bb(provider, resource, (0, resources_1.$ig)((0, resources_1.$hg)(resource), `${(0, resources_1.$fg)(resource)}${options.atomic.postfix}`), options, contents);
                    }
                    // non-atomic write
                    else {
                        await this.cb(provider, resource, options, contents);
                    }
                }
                // events
                this.r.fire(new files_1.$kk(resource, 4 /* FileOperation.WRITE */));
            }
            catch (error) {
                throw new files_1.$nk((0, nls_1.localize)(4, null, this.rb(resource), (0, files_1.$gk)(error).toString()), (0, files_1.$jk)(error), options);
            }
            return this.resolve(resource, { resolveMetadata: true });
        }
        async w(provider, resource, options) {
            // Validate unlock support
            const unlock = !!options?.unlock;
            if (unlock && !(provider.capabilities & 8192 /* FileSystemProviderCapabilities.FileWriteUnlock */)) {
                throw new Error((0, nls_1.localize)(5, null, this.rb(resource)));
            }
            // Validate atomic support
            const atomic = !!options?.atomic;
            if (atomic) {
                if (!(provider.capabilities & 32768 /* FileSystemProviderCapabilities.FileAtomicWrite */)) {
                    throw new Error((0, nls_1.localize)(6, null, this.rb(resource)));
                }
                if (unlock) {
                    throw new Error((0, nls_1.localize)(7, null, this.rb(resource)));
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
                throw new files_1.$nk((0, nls_1.localize)(8, null, this.rb(resource)), 0 /* FileOperationResult.FILE_IS_DIRECTORY */, options);
            }
            // File cannot be readonly
            this.qb(resource, stat);
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
            if (typeof options?.mtime === 'number' && typeof options.etag === 'string' && options.etag !== files_1.$xk &&
                typeof stat.mtime === 'number' && typeof stat.size === 'number' &&
                options.mtime < stat.mtime && options.etag !== (0, files_1.$yk)({ mtime: options.mtime /* not using stat.mtime for a reason, see above */, size: stat.size })) {
                throw new files_1.$nk((0, nls_1.localize)(9, null), 3 /* FileOperationResult.FILE_MODIFIED_SINCE */, options);
            }
            return stat;
        }
        async readFile(resource, options, token) {
            const provider = await this.m(resource);
            if (options?.atomic) {
                return this.z(provider, resource, options, token);
            }
            return this.C(provider, resource, options, token);
        }
        async z(provider, resource, options, token) {
            return new Promise((resolve, reject) => {
                this.ab.queueFor(resource, this.R(provider).providerExtUri).queue(async () => {
                    try {
                        const content = await this.C(provider, resource, options, token);
                        resolve(content);
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
        }
        async C(provider, resource, options, token) {
            const stream = await this.D(provider, resource, {
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
                value: await (0, buffer_1.$Rd)(stream.value)
            };
        }
        async readFileStream(resource, options, token) {
            const provider = await this.m(resource);
            return this.D(provider, resource, options, token);
        }
        async D(provider, resource, options, token) {
            // install a cancellation token that gets cancelled
            // when any error occurs. this allows us to resolve
            // the content of the file while resolving metadata
            // but still cancel the operation in certain cases.
            //
            // in addition, we pass the optional token in that
            // we got from the outside to even allow for external
            // cancellation of the read operation.
            const cancellableSource = new cancellation_1.$pd(token);
            // validate read operation
            const statPromise = this.J(resource, options).then(stat => stat, error => {
                cancellableSource.dispose(true);
                throw error;
            });
            let fileStream = undefined;
            try {
                // if the etag is provided, we await the result of the validation
                // due to the likelihood of hitting a NOT_MODIFIED_SINCE result.
                // otherwise, we let it run in parallel to the file reading for
                // optimal startup performance.
                if (typeof options?.etag === 'string' && options.etag !== files_1.$xk) {
                    await statPromise;
                }
                // read unbuffered
                if ((options?.atomic && (0, files_1.$ak)(provider)) || // atomic reads are always unbuffered
                    !((0, files_1.$$j)(provider) || (0, files_1.$_j)(provider)) || // provider has no buffered capability
                    ((0, files_1.$8j)(provider) && options?.preferUnbuffered) // unbuffered read is preferred
                ) {
                    fileStream = this.I(provider, resource, options);
                }
                // read streamed (always prefer over primitive buffered read)
                else if ((0, files_1.$_j)(provider)) {
                    fileStream = this.G(provider, resource, cancellableSource.token, options);
                }
                // read buffered
                else {
                    fileStream = this.H(provider, resource, cancellableSource.token, options);
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
                    await (0, stream_1.$wd)(fileStream);
                }
                // Re-throw errors as file operation errors but preserve
                // specific errors (such as not modified since)
                throw this.F(error, resource, options);
            }
        }
        F(error, resource, options) {
            const message = (0, nls_1.localize)(10, null, this.rb(resource), (0, files_1.$gk)(error).toString());
            if (error instanceof files_1.$pk) {
                return new files_1.$pk(message, error.stat, options);
            }
            if (error instanceof files_1.$ok) {
                return new files_1.$ok(message, error.fileOperationResult, error.size, error.options);
            }
            return new files_1.$nk(message, (0, files_1.$jk)(error), options);
        }
        G(provider, resource, token, options = Object.create(null)) {
            const fileStream = provider.readFileStream(resource, options, token);
            return (0, stream_1.$Cd)(fileStream, {
                data: data => data instanceof buffer_1.$Fd ? data : buffer_1.$Fd.wrap(data),
                error: error => this.F(error, resource, options)
            }, data => buffer_1.$Fd.concat(data));
        }
        H(provider, resource, token, options = Object.create(null)) {
            const stream = (0, buffer_1.$Vd)();
            (0, io_1.$Cp)(provider, resource, stream, data => data, {
                ...options,
                bufferSize: this.a,
                errorTransformer: error => this.F(error, resource, options)
            }, token);
            return stream;
        }
        I(provider, resource, options) {
            const stream = (0, stream_1.$td)(data => buffer_1.$Fd.concat(data));
            // Read the file into the stream async but do not wait for
            // this to complete because streams work via events
            (async () => {
                try {
                    let buffer;
                    if (options?.atomic && (0, files_1.$ak)(provider)) {
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
                    this.L(resource, buffer.byteLength, options);
                    // End stream with data
                    stream.end(buffer_1.$Fd.wrap(buffer));
                }
                catch (err) {
                    stream.error(err);
                    stream.end();
                }
            })();
            return stream;
        }
        async J(resource, options) {
            const stat = await this.resolve(resource, { resolveMetadata: true });
            // Throw if resource is a directory
            if (stat.isDirectory) {
                throw new files_1.$nk((0, nls_1.localize)(11, null, this.rb(resource)), 0 /* FileOperationResult.FILE_IS_DIRECTORY */, options);
            }
            // Throw if file not modified since (unless disabled)
            if (typeof options?.etag === 'string' && options.etag !== files_1.$xk && options.etag === stat.etag) {
                throw new files_1.$pk((0, nls_1.localize)(12, null), stat, options);
            }
            // Throw if file is too large to load
            this.L(resource, stat.size, options);
            return stat;
        }
        L(resource, size, options) {
            if (typeof options?.limits?.size === 'number' && size > options.limits.size) {
                throw new files_1.$ok((0, nls_1.localize)(13, null, this.rb(resource)), 7 /* FileOperationResult.FILE_TOO_LARGE */, size, options);
            }
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        async canMove(source, target, overwrite) {
            return this.M(source, target, 'move', overwrite);
        }
        async canCopy(source, target, overwrite) {
            return this.M(source, target, 'copy', overwrite);
        }
        async M(source, target, mode, overwrite) {
            if (source.toString() !== target.toString()) {
                try {
                    const sourceProvider = mode === 'move' ? this.pb(await this.n(source), source) : await this.m(source);
                    const targetProvider = this.pb(await this.n(target), target);
                    await this.Q(sourceProvider, source, targetProvider, target, mode, overwrite);
                }
                catch (error) {
                    return error;
                }
            }
            return true;
        }
        async move(source, target, overwrite) {
            const sourceProvider = this.pb(await this.n(source), source);
            const targetProvider = this.pb(await this.n(target), target);
            // move
            const mode = await this.N(sourceProvider, source, targetProvider, target, 'move', !!overwrite);
            // resolve and send events
            const fileStat = await this.resolve(target, { resolveMetadata: true });
            this.r.fire(new files_1.$kk(source, mode === 'move' ? 2 /* FileOperation.MOVE */ : 3 /* FileOperation.COPY */, fileStat));
            return fileStat;
        }
        async copy(source, target, overwrite) {
            const sourceProvider = await this.m(source);
            const targetProvider = this.pb(await this.n(target), target);
            // copy
            const mode = await this.N(sourceProvider, source, targetProvider, target, 'copy', !!overwrite);
            // resolve and send events
            const fileStat = await this.resolve(target, { resolveMetadata: true });
            this.r.fire(new files_1.$kk(source, mode === 'copy' ? 3 /* FileOperation.COPY */ : 2 /* FileOperation.MOVE */, fileStat));
            return fileStat;
        }
        async N(sourceProvider, source, targetProvider, target, mode, overwrite) {
            if (source.toString() === target.toString()) {
                return mode; // simulate node.js behaviour here and do a no-op if paths match
            }
            // validation
            const { exists, isSameResourceWithDifferentPathCase } = await this.Q(sourceProvider, source, targetProvider, target, mode, overwrite);
            // delete as needed (unless target is same resurce with different path case)
            if (exists && !isSameResourceWithDifferentPathCase && overwrite) {
                await this.del(target, { recursive: true });
            }
            // create parent folders
            await this.U(targetProvider, this.R(targetProvider).providerExtUri.dirname(target));
            // copy source => target
            if (mode === 'copy') {
                // same provider with fast copy: leverage copy() functionality
                if (sourceProvider === targetProvider && (0, files_1.$9j)(sourceProvider)) {
                    await sourceProvider.copy(source, target, { overwrite });
                }
                // when copying via buffer/unbuffered, we have to manually
                // traverse the source if it is a folder and not a file
                else {
                    const sourceFile = await this.resolve(source);
                    if (sourceFile.isDirectory) {
                        await this.P(sourceProvider, sourceFile, targetProvider, target);
                    }
                    else {
                        await this.O(sourceProvider, source, targetProvider, target);
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
                    await this.N(sourceProvider, source, targetProvider, target, 'copy', overwrite);
                    await this.del(source, { recursive: true });
                    return 'copy';
                }
            }
        }
        async O(sourceProvider, source, targetProvider, target) {
            // copy: source (buffered) => target (buffered)
            if ((0, files_1.$$j)(sourceProvider) && (0, files_1.$$j)(targetProvider)) {
                return this.ib(sourceProvider, source, targetProvider, target);
            }
            // copy: source (buffered) => target (unbuffered)
            if ((0, files_1.$$j)(sourceProvider) && (0, files_1.$8j)(targetProvider)) {
                return this.ob(sourceProvider, source, targetProvider, target);
            }
            // copy: source (unbuffered) => target (buffered)
            if ((0, files_1.$8j)(sourceProvider) && (0, files_1.$$j)(targetProvider)) {
                return this.mb(sourceProvider, source, targetProvider, target);
            }
            // copy: source (unbuffered) => target (unbuffered)
            if ((0, files_1.$8j)(sourceProvider) && (0, files_1.$8j)(targetProvider)) {
                return this.kb(sourceProvider, source, targetProvider, target);
            }
        }
        async P(sourceProvider, sourceFolder, targetProvider, targetFolder) {
            // create folder in target
            await targetProvider.mkdir(targetFolder);
            // create children in target
            if (Array.isArray(sourceFolder.children)) {
                await async_1.Promises.settled(sourceFolder.children.map(async (sourceChild) => {
                    const targetChild = this.R(targetProvider).providerExtUri.joinPath(targetFolder, sourceChild.name);
                    if (sourceChild.isDirectory) {
                        return this.P(sourceProvider, await this.resolve(sourceChild.resource), targetProvider, targetChild);
                    }
                    else {
                        return this.O(sourceProvider, sourceChild.resource, targetProvider, targetChild);
                    }
                }));
            }
        }
        async Q(sourceProvider, source, targetProvider, target, mode, overwrite) {
            let isSameResourceWithDifferentPathCase = false;
            // Check if source is equal or parent to target (requires providers to be the same)
            if (sourceProvider === targetProvider) {
                const { providerExtUri, isPathCaseSensitive } = this.R(sourceProvider);
                if (!isPathCaseSensitive) {
                    isSameResourceWithDifferentPathCase = providerExtUri.isEqual(source, target);
                }
                if (isSameResourceWithDifferentPathCase && mode === 'copy') {
                    throw new Error((0, nls_1.localize)(14, null, this.rb(source), this.rb(target)));
                }
                if (!isSameResourceWithDifferentPathCase && providerExtUri.isEqualOrParent(target, source)) {
                    throw new Error((0, nls_1.localize)(15, null, this.rb(source), this.rb(target)));
                }
            }
            // Extra checks if target exists and this is not a rename
            const exists = await this.exists(target);
            if (exists && !isSameResourceWithDifferentPathCase) {
                // Bail out if target exists and we are not about to overwrite
                if (!overwrite) {
                    throw new files_1.$nk((0, nls_1.localize)(16, null, this.rb(source), this.rb(target)), 4 /* FileOperationResult.FILE_MOVE_CONFLICT */);
                }
                // Special case: if the target is a parent of the source, we cannot delete
                // it as it would delete the source as well. In this case we have to throw
                if (sourceProvider === targetProvider) {
                    const { providerExtUri } = this.R(sourceProvider);
                    if (providerExtUri.isEqualOrParent(source, target)) {
                        throw new Error((0, nls_1.localize)(17, null, this.rb(source), this.rb(target)));
                    }
                }
            }
            return { exists, isSameResourceWithDifferentPathCase };
        }
        R(provider) {
            const isPathCaseSensitive = this.S(provider);
            return {
                providerExtUri: isPathCaseSensitive ? resources_1.$$f : resources_1.$ag,
                isPathCaseSensitive
            };
        }
        S(provider) {
            return !!(provider.capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
        }
        async createFolder(resource) {
            const provider = this.pb(await this.j(resource), resource);
            // mkdir recursively
            await this.U(provider, resource);
            // events
            const fileStat = await this.resolve(resource, { resolveMetadata: true });
            this.r.fire(new files_1.$kk(resource, 0 /* FileOperation.CREATE */, fileStat));
            return fileStat;
        }
        async U(provider, directory) {
            const directoriesToCreate = [];
            // mkdir until we reach root
            const { providerExtUri } = this.R(provider);
            while (!providerExtUri.isEqual(directory, providerExtUri.dirname(directory))) {
                try {
                    const stat = await provider.stat(directory);
                    if ((stat.type & files_1.FileType.Directory) === 0) {
                        throw new Error((0, nls_1.localize)(18, null, this.rb(directory)));
                    }
                    break; // we have hit a directory that exists -> good
                }
                catch (error) {
                    // Bubble up any other error that is not file not found
                    if ((0, files_1.$ik)(error) !== files_1.FileSystemProviderErrorCode.FileNotFound) {
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
                    if ((0, files_1.$ik)(error) !== files_1.FileSystemProviderErrorCode.FileExists) {
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
                await this.W(resource, options);
            }
            catch (error) {
                return error;
            }
            return true;
        }
        async W(resource, options) {
            const provider = this.pb(await this.j(resource), resource);
            // Validate trash support
            const useTrash = !!options?.useTrash;
            if (useTrash && !(provider.capabilities & 4096 /* FileSystemProviderCapabilities.Trash */)) {
                throw new Error((0, nls_1.localize)(19, null, this.rb(resource)));
            }
            // Validate atomic support
            const atomic = options?.atomic;
            if (atomic && !(provider.capabilities & 65536 /* FileSystemProviderCapabilities.FileAtomicDelete */)) {
                throw new Error((0, nls_1.localize)(20, null, this.rb(resource)));
            }
            if (useTrash && atomic) {
                throw new Error((0, nls_1.localize)(21, null, this.rb(resource)));
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
                this.qb(resource, stat);
            }
            else {
                throw new files_1.$nk((0, nls_1.localize)(22, null, this.rb(resource)), 1 /* FileOperationResult.FILE_NOT_FOUND */);
            }
            // Validate recursive
            const recursive = !!options?.recursive;
            if (!recursive) {
                const stat = await this.resolve(resource);
                if (stat.isDirectory && Array.isArray(stat.children) && stat.children.length > 0) {
                    throw new Error((0, nls_1.localize)(23, null, this.rb(resource)));
                }
            }
            return provider;
        }
        async del(resource, options) {
            const provider = await this.W(resource, options);
            const useTrash = !!options?.useTrash;
            const recursive = !!options?.recursive;
            const atomic = options?.atomic ?? false;
            // Delete through provider
            await provider.delete(resource, { recursive, useTrash, atomic });
            // Events
            this.r.fire(new files_1.$kk(resource, 1 /* FileOperation.DELETE */));
        }
        //#endregion
        //#region Clone File
        async cloneFile(source, target) {
            const sourceProvider = await this.j(source);
            const targetProvider = this.pb(await this.n(target), target);
            if (sourceProvider === targetProvider && this.R(sourceProvider).providerExtUri.isEqual(source, target)) {
                return; // return early if paths are equal
            }
            // same provider, use `cloneFile` when native support is provided
            if (sourceProvider === targetProvider && (0, files_1.$0j)(sourceProvider)) {
                return sourceProvider.cloneFile(source, target);
            }
            // otherwise, either providers are different or there is no native
            // `cloneFile` support, then we fallback to emulate a clone as best
            // as we can with the other primitives
            // create parent folders
            await this.U(targetProvider, this.R(targetProvider).providerExtUri.dirname(target));
            // queue on the source to ensure atomic read
            const sourceWriteQueue = this.ab.queueFor(source, this.R(sourceProvider).providerExtUri);
            // leverage `copy` method if provided and providers are identical
            if (sourceProvider === targetProvider && (0, files_1.$9j)(sourceProvider)) {
                return sourceWriteQueue.queue(() => sourceProvider.copy(source, target, { overwrite: true }));
            }
            // otherwise copy via buffer/unbuffered and use a write queue
            // on the source to ensure atomic operation as much as possible
            return sourceWriteQueue.queue(() => this.O(sourceProvider, source, targetProvider, target));
        }
        watch(resource, options = { recursive: false, excludes: [] }) {
            const disposables = new lifecycle_1.$jc();
            // Forward watch request to provider and wire in disposables
            let watchDisposed = false;
            let disposeWatch = () => { watchDisposed = true; };
            disposables.add((0, lifecycle_1.$ic)(() => disposeWatch()));
            // Watch and wire in disposable which is async but
            // check if we got disposed meanwhile and forward
            (async () => {
                try {
                    const disposable = await this.$(resource, options);
                    if (watchDisposed) {
                        (0, lifecycle_1.$fc)(disposable);
                    }
                    else {
                        disposeWatch = () => (0, lifecycle_1.$fc)(disposable);
                    }
                }
                catch (error) {
                    this.b.error(error);
                }
            })();
            return disposables;
        }
        async $(resource, options) {
            const provider = await this.j(resource);
            // Deduplicate identical watch requests
            const watchHash = (0, hash_1.$pi)([this.R(provider).providerExtUri.getComparisonKey(resource), options]);
            let watcher = this.Z.get(watchHash);
            if (!watcher) {
                watcher = {
                    count: 0,
                    disposable: provider.watch(resource, options)
                };
                this.Z.set(watchHash, watcher);
            }
            // Increment usage counter
            watcher.count += 1;
            return (0, lifecycle_1.$ic)(() => {
                if (watcher) {
                    // Unref
                    watcher.count--;
                    // Dispose only when last user is reached
                    if (watcher.count === 0) {
                        (0, lifecycle_1.$fc)(watcher.disposable);
                        this.Z.delete(watchHash);
                    }
                }
            });
        }
        dispose() {
            super.dispose();
            for (const [, watcher] of this.Z) {
                (0, lifecycle_1.$fc)(watcher.disposable);
            }
            this.Z.clear();
        }
        async bb(provider, resource, tempResource, options, readableOrStreamOrBufferedStream) {
            // Write to temp resource first
            await this.cb(provider, tempResource, options, readableOrStreamOrBufferedStream);
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
        async cb(provider, resource, options, readableOrStreamOrBufferedStream) {
            return this.ab.queueFor(resource, this.R(provider).providerExtUri).queue(async () => {
                // open handle
                const handle = await provider.open(resource, { create: true, unlock: options?.unlock ?? false });
                // write into handle until all bytes from buffer have been written
                try {
                    if ((0, stream_1.$rd)(readableOrStreamOrBufferedStream) || (0, stream_1.$sd)(readableOrStreamOrBufferedStream)) {
                        await this.db(provider, handle, readableOrStreamOrBufferedStream);
                    }
                    else {
                        await this.eb(provider, handle, readableOrStreamOrBufferedStream);
                    }
                }
                catch (error) {
                    throw (0, files_1.$gk)(error);
                }
                finally {
                    // close handle always
                    await provider.close(handle);
                }
            });
        }
        async db(provider, handle, streamOrBufferedStream) {
            let posInFile = 0;
            let stream;
            // Buffered stream: consume the buffer first by writing
            // it to the target before reading from the stream.
            if ((0, stream_1.$sd)(streamOrBufferedStream)) {
                if (streamOrBufferedStream.buffer.length > 0) {
                    const chunk = buffer_1.$Fd.concat(streamOrBufferedStream.buffer);
                    await this.fb(provider, handle, chunk, chunk.byteLength, posInFile, 0);
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
                (0, stream_1.$xd)(stream, {
                    onData: async (chunk) => {
                        // pause stream to perform async write operation
                        stream.pause();
                        try {
                            await this.fb(provider, handle, chunk, chunk.byteLength, posInFile, 0);
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
        async eb(provider, handle, readable) {
            let posInFile = 0;
            let chunk;
            while ((chunk = readable.read()) !== null) {
                await this.fb(provider, handle, chunk, chunk.byteLength, posInFile, 0);
                posInFile += chunk.byteLength;
            }
        }
        async fb(provider, handle, buffer, length, posInFile, posInBuffer) {
            let totalBytesWritten = 0;
            while (totalBytesWritten < length) {
                // Write through the provider
                const bytesWritten = await provider.write(handle, posInFile + totalBytesWritten, buffer.buffer, posInBuffer + totalBytesWritten, length - totalBytesWritten);
                totalBytesWritten += bytesWritten;
            }
        }
        async gb(provider, resource, options, bufferOrReadableOrStreamOrBufferedStream) {
            return this.ab.queueFor(resource, this.R(provider).providerExtUri).queue(() => this.hb(provider, resource, options, bufferOrReadableOrStreamOrBufferedStream));
        }
        async hb(provider, resource, options, bufferOrReadableOrStreamOrBufferedStream) {
            let buffer;
            if (bufferOrReadableOrStreamOrBufferedStream instanceof buffer_1.$Fd) {
                buffer = bufferOrReadableOrStreamOrBufferedStream;
            }
            else if ((0, stream_1.$rd)(bufferOrReadableOrStreamOrBufferedStream)) {
                buffer = await (0, buffer_1.$Rd)(bufferOrReadableOrStreamOrBufferedStream);
            }
            else if ((0, stream_1.$sd)(bufferOrReadableOrStreamOrBufferedStream)) {
                buffer = await (0, buffer_1.$Sd)(bufferOrReadableOrStreamOrBufferedStream);
            }
            else {
                buffer = (0, buffer_1.$Pd)(bufferOrReadableOrStreamOrBufferedStream);
            }
            // Write through the provider
            await provider.writeFile(resource, buffer.buffer, { create: true, overwrite: true, unlock: options?.unlock ?? false, atomic: options?.atomic ?? false });
        }
        async ib(sourceProvider, source, targetProvider, target) {
            return this.ab.queueFor(target, this.R(targetProvider).providerExtUri).queue(() => this.jb(sourceProvider, source, targetProvider, target));
        }
        async jb(sourceProvider, source, targetProvider, target) {
            let sourceHandle = undefined;
            let targetHandle = undefined;
            try {
                // Open handles
                sourceHandle = await sourceProvider.open(source, { create: false });
                targetHandle = await targetProvider.open(target, { create: true, unlock: false });
                const buffer = buffer_1.$Fd.alloc(this.a);
                let posInFile = 0;
                let posInBuffer = 0;
                let bytesRead = 0;
                do {
                    // read from source (sourceHandle) at current position (posInFile) into buffer (buffer) at
                    // buffer position (posInBuffer) up to the size of the buffer (buffer.byteLength).
                    bytesRead = await sourceProvider.read(sourceHandle, posInFile, buffer.buffer, posInBuffer, buffer.byteLength - posInBuffer);
                    // write into target (targetHandle) at current position (posInFile) from buffer (buffer) at
                    // buffer position (posInBuffer) all bytes we read (bytesRead).
                    await this.fb(targetProvider, targetHandle, buffer, bytesRead, posInFile, posInBuffer);
                    posInFile += bytesRead;
                    posInBuffer += bytesRead;
                    // when buffer full, fill it again from the beginning
                    if (posInBuffer === buffer.byteLength) {
                        posInBuffer = 0;
                    }
                } while (bytesRead > 0);
            }
            catch (error) {
                throw (0, files_1.$gk)(error);
            }
            finally {
                await async_1.Promises.settled([
                    typeof sourceHandle === 'number' ? sourceProvider.close(sourceHandle) : Promise.resolve(),
                    typeof targetHandle === 'number' ? targetProvider.close(targetHandle) : Promise.resolve(),
                ]);
            }
        }
        async kb(sourceProvider, source, targetProvider, target) {
            return this.ab.queueFor(target, this.R(targetProvider).providerExtUri).queue(() => this.lb(sourceProvider, source, targetProvider, target));
        }
        async lb(sourceProvider, source, targetProvider, target) {
            return targetProvider.writeFile(target, await sourceProvider.readFile(source), { create: true, overwrite: true, unlock: false, atomic: false });
        }
        async mb(sourceProvider, source, targetProvider, target) {
            return this.ab.queueFor(target, this.R(targetProvider).providerExtUri).queue(() => this.nb(sourceProvider, source, targetProvider, target));
        }
        async nb(sourceProvider, source, targetProvider, target) {
            // Open handle
            const targetHandle = await targetProvider.open(target, { create: true, unlock: false });
            // Read entire buffer from source and write buffered
            try {
                const buffer = await sourceProvider.readFile(source);
                await this.fb(targetProvider, targetHandle, buffer_1.$Fd.wrap(buffer), buffer.byteLength, 0, 0);
            }
            catch (error) {
                throw (0, files_1.$gk)(error);
            }
            finally {
                await targetProvider.close(targetHandle);
            }
        }
        async ob(sourceProvider, source, targetProvider, target) {
            // Read buffer via stream buffered
            const buffer = await (0, buffer_1.$Rd)(this.H(sourceProvider, source, cancellation_1.CancellationToken.None));
            // Write buffer into target at once
            await this.gb(targetProvider, target, undefined, buffer);
        }
        pb(provider, resource) {
            if (provider.capabilities & 2048 /* FileSystemProviderCapabilities.Readonly */) {
                throw new files_1.$nk((0, nls_1.localize)(24, null, this.rb(resource)), 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
            }
            return provider;
        }
        qb(resource, stat) {
            if ((stat.permissions ?? 0) & files_1.FilePermission.Readonly) {
                throw new files_1.$nk((0, nls_1.localize)(25, null, this.rb(resource)), 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
            }
        }
        rb(resource) {
            if (resource.scheme === network_1.Schemas.file) {
                return resource.fsPath;
            }
            return resource.toString(true);
        }
    };
    exports.$Dp = $Dp;
    exports.$Dp = $Dp = __decorate([
        __param(0, log_1.$5i)
    ], $Dp);
});
//# sourceMappingURL=fileService.js.map