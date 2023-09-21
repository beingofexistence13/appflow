/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/platform/files/node/diskFileSystemProvider", "vs/base/common/lifecycle", "vs/base/common/buffer", "vs/base/common/stream", "vs/base/common/cancellation"], function (require, exports, event_1, diskFileSystemProvider_1, lifecycle_1, buffer_1, stream_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractSessionFileWatcher = exports.AbstractDiskFileSystemProviderChannel = void 0;
    /**
     * A server implementation for a IPC based file system provider client.
     */
    class AbstractDiskFileSystemProviderChannel extends lifecycle_1.Disposable {
        constructor(provider, logService) {
            super();
            this.provider = provider;
            this.logService = logService;
            //#endregion
            //#region File Watching
            this.sessionToWatcher = new Map();
            this.watchRequests = new Map();
        }
        call(ctx, command, arg) {
            const uriTransformer = this.getUriTransformer(ctx);
            switch (command) {
                case 'stat': return this.stat(uriTransformer, arg[0]);
                case 'readdir': return this.readdir(uriTransformer, arg[0]);
                case 'open': return this.open(uriTransformer, arg[0], arg[1]);
                case 'close': return this.close(arg[0]);
                case 'read': return this.read(arg[0], arg[1], arg[2]);
                case 'readFile': return this.readFile(uriTransformer, arg[0], arg[1]);
                case 'write': return this.write(arg[0], arg[1], arg[2], arg[3], arg[4]);
                case 'writeFile': return this.writeFile(uriTransformer, arg[0], arg[1], arg[2]);
                case 'rename': return this.rename(uriTransformer, arg[0], arg[1], arg[2]);
                case 'copy': return this.copy(uriTransformer, arg[0], arg[1], arg[2]);
                case 'cloneFile': return this.cloneFile(uriTransformer, arg[0], arg[1]);
                case 'mkdir': return this.mkdir(uriTransformer, arg[0]);
                case 'delete': return this.delete(uriTransformer, arg[0], arg[1]);
                case 'watch': return this.watch(uriTransformer, arg[0], arg[1], arg[2], arg[3]);
                case 'unwatch': return this.unwatch(arg[0], arg[1]);
            }
            throw new Error(`IPC Command ${command} not found`);
        }
        listen(ctx, event, arg) {
            const uriTransformer = this.getUriTransformer(ctx);
            switch (event) {
                case 'fileChange': return this.onFileChange(uriTransformer, arg[0]);
                case 'readFileStream': return this.onReadFileStream(uriTransformer, arg[0], arg[1]);
            }
            throw new Error(`Unknown event ${event}`);
        }
        //#region File Metadata Resolving
        stat(uriTransformer, _resource) {
            const resource = this.transformIncoming(uriTransformer, _resource, true);
            return this.provider.stat(resource);
        }
        readdir(uriTransformer, _resource) {
            const resource = this.transformIncoming(uriTransformer, _resource);
            return this.provider.readdir(resource);
        }
        //#endregion
        //#region File Reading/Writing
        async readFile(uriTransformer, _resource, opts) {
            const resource = this.transformIncoming(uriTransformer, _resource, true);
            const buffer = await this.provider.readFile(resource, opts);
            return buffer_1.VSBuffer.wrap(buffer);
        }
        onReadFileStream(uriTransformer, _resource, opts) {
            const resource = this.transformIncoming(uriTransformer, _resource, true);
            const cts = new cancellation_1.CancellationTokenSource();
            const emitter = new event_1.Emitter({
                onDidRemoveLastListener: () => {
                    // Ensure to cancel the read operation when there is no more
                    // listener on the other side to prevent unneeded work.
                    cts.cancel();
                }
            });
            const fileStream = this.provider.readFileStream(resource, opts, cts.token);
            (0, stream_1.listenStream)(fileStream, {
                onData: chunk => emitter.fire(buffer_1.VSBuffer.wrap(chunk)),
                onError: error => emitter.fire(error),
                onEnd: () => {
                    // Forward event
                    emitter.fire('end');
                    // Cleanup
                    emitter.dispose();
                    cts.dispose();
                }
            });
            return emitter.event;
        }
        writeFile(uriTransformer, _resource, content, opts) {
            const resource = this.transformIncoming(uriTransformer, _resource);
            return this.provider.writeFile(resource, content.buffer, opts);
        }
        open(uriTransformer, _resource, opts) {
            const resource = this.transformIncoming(uriTransformer, _resource, true);
            return this.provider.open(resource, opts);
        }
        close(fd) {
            return this.provider.close(fd);
        }
        async read(fd, pos, length) {
            const buffer = buffer_1.VSBuffer.alloc(length);
            const bufferOffset = 0; // offset is 0 because we create a buffer to read into for each call
            const bytesRead = await this.provider.read(fd, pos, buffer.buffer, bufferOffset, length);
            return [buffer, bytesRead];
        }
        write(fd, pos, data, offset, length) {
            return this.provider.write(fd, pos, data.buffer, offset, length);
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        mkdir(uriTransformer, _resource) {
            const resource = this.transformIncoming(uriTransformer, _resource);
            return this.provider.mkdir(resource);
        }
        delete(uriTransformer, _resource, opts) {
            const resource = this.transformIncoming(uriTransformer, _resource);
            return this.provider.delete(resource, opts);
        }
        rename(uriTransformer, _source, _target, opts) {
            const source = this.transformIncoming(uriTransformer, _source);
            const target = this.transformIncoming(uriTransformer, _target);
            return this.provider.rename(source, target, opts);
        }
        copy(uriTransformer, _source, _target, opts) {
            const source = this.transformIncoming(uriTransformer, _source);
            const target = this.transformIncoming(uriTransformer, _target);
            return this.provider.copy(source, target, opts);
        }
        //#endregion
        //#region Clone File
        cloneFile(uriTransformer, _source, _target) {
            const source = this.transformIncoming(uriTransformer, _source);
            const target = this.transformIncoming(uriTransformer, _target);
            return this.provider.cloneFile(source, target);
        }
        onFileChange(uriTransformer, sessionId) {
            // We want a specific emitter for the given session so that events
            // from the one session do not end up on the other session. As such
            // we create a `SessionFileWatcher` and a `Emitter` for that session.
            const emitter = new event_1.Emitter({
                onWillAddFirstListener: () => {
                    this.sessionToWatcher.set(sessionId, this.createSessionFileWatcher(uriTransformer, emitter));
                },
                onDidRemoveLastListener: () => {
                    (0, lifecycle_1.dispose)(this.sessionToWatcher.get(sessionId));
                    this.sessionToWatcher.delete(sessionId);
                }
            });
            return emitter.event;
        }
        async watch(uriTransformer, sessionId, req, _resource, opts) {
            const watcher = this.sessionToWatcher.get(sessionId);
            if (watcher) {
                const resource = this.transformIncoming(uriTransformer, _resource);
                const disposable = watcher.watch(req, resource, opts);
                this.watchRequests.set(sessionId + req, disposable);
            }
        }
        async unwatch(sessionId, req) {
            const id = sessionId + req;
            const disposable = this.watchRequests.get(id);
            if (disposable) {
                (0, lifecycle_1.dispose)(disposable);
                this.watchRequests.delete(id);
            }
        }
        //#endregion
        dispose() {
            super.dispose();
            for (const [, disposable] of this.watchRequests) {
                disposable.dispose();
            }
            this.watchRequests.clear();
            for (const [, disposable] of this.sessionToWatcher) {
                disposable.dispose();
            }
            this.sessionToWatcher.clear();
        }
    }
    exports.AbstractDiskFileSystemProviderChannel = AbstractDiskFileSystemProviderChannel;
    class AbstractSessionFileWatcher extends lifecycle_1.Disposable {
        constructor(uriTransformer, sessionEmitter, logService, environmentService) {
            super();
            this.uriTransformer = uriTransformer;
            this.logService = logService;
            this.environmentService = environmentService;
            this.watcherRequests = new Map();
            // To ensure we use one file watcher per session, we keep a
            // disk file system provider instantiated for this session.
            // The provider is cheap and only stateful when file watching
            // starts.
            //
            // This is important because we want to ensure that we only
            // forward events from the watched paths for this session and
            // not other clients that asked to watch other paths.
            this.fileWatcher = this._register(new diskFileSystemProvider_1.DiskFileSystemProvider(this.logService, { watcher: { recursive: this.getRecursiveWatcherOptions(this.environmentService) } }));
            this.registerListeners(sessionEmitter);
        }
        registerListeners(sessionEmitter) {
            const localChangeEmitter = this._register(new event_1.Emitter());
            this._register(localChangeEmitter.event((events) => {
                sessionEmitter.fire(events.map(e => ({
                    resource: this.uriTransformer.transformOutgoingURI(e.resource),
                    type: e.type
                })));
            }));
            this._register(this.fileWatcher.onDidChangeFile(events => localChangeEmitter.fire(events)));
            this._register(this.fileWatcher.onDidWatchError(error => sessionEmitter.fire(error)));
        }
        getRecursiveWatcherOptions(environmentService) {
            return undefined; // subclasses can override
        }
        getExtraExcludes(environmentService) {
            return undefined; // subclasses can override
        }
        watch(req, resource, opts) {
            const extraExcludes = this.getExtraExcludes(this.environmentService);
            if (Array.isArray(extraExcludes)) {
                opts.excludes = [...opts.excludes, ...extraExcludes];
            }
            this.watcherRequests.set(req, this.fileWatcher.watch(resource, opts));
            return (0, lifecycle_1.toDisposable)(() => {
                (0, lifecycle_1.dispose)(this.watcherRequests.get(req));
                this.watcherRequests.delete(req);
            });
        }
        dispose() {
            for (const [, disposable] of this.watcherRequests) {
                disposable.dispose();
            }
            this.watcherRequests.clear();
            super.dispose();
        }
    }
    exports.AbstractSessionFileWatcher = AbstractSessionFileWatcher;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlza0ZpbGVTeXN0ZW1Qcm92aWRlclNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL25vZGUvZGlza0ZpbGVTeXN0ZW1Qcm92aWRlclNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFvQmhHOztPQUVHO0lBQ0gsTUFBc0IscUNBQXlDLFNBQVEsc0JBQVU7UUFFaEYsWUFDb0IsUUFBZ0MsRUFDaEMsVUFBdUI7WUFFMUMsS0FBSyxFQUFFLENBQUM7WUFIVyxhQUFRLEdBQVIsUUFBUSxDQUF3QjtZQUNoQyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBeUszQyxZQUFZO1lBRVosdUJBQXVCO1lBRU4scUJBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQWdELENBQUM7WUFDM0Usa0JBQWEsR0FBRyxJQUFJLEdBQUcsRUFBcUQsQ0FBQztRQTNLOUYsQ0FBQztRQUVELElBQUksQ0FBQyxHQUFNLEVBQUUsT0FBZSxFQUFFLEdBQVM7WUFDdEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRW5ELFFBQVEsT0FBTyxFQUFFO2dCQUNoQixLQUFLLE1BQU0sQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELEtBQUssU0FBUyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUQsS0FBSyxNQUFNLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUQsS0FBSyxP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