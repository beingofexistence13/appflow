/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/stream", "vs/base/common/uri", "vs/base/common/uuid", "vs/platform/files/common/files"], function (require, exports, buffer_1, errorMessage_1, errors_1, event_1, lifecycle_1, stream_1, uri_1, uuid_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8M = exports.$7M = void 0;
    exports.$7M = 'localFilesystem';
    /**
     * An implementation of a local disk file system provider
     * that is backed by a `IChannel` and thus implemented via
     * IPC on a different process.
     */
    class $8M extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            //#region File Capabilities
            this.onDidChangeCapabilities = event_1.Event.None;
            //#endregion
            //#region File Watching
            this.f = this.B(new event_1.$fd());
            this.onDidChangeFile = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidWatchError = this.g.event;
            // The contract for file watching via remote is to identify us
            // via a unique but readonly session ID. Since the remote is
            // managing potentially many watchers from different clients,
            // this helps the server to properly partition events to the right
            // clients.
            this.h = (0, uuid_1.$4f)();
            this.j();
        }
        get capabilities() {
            if (!this.c) {
                this.c =
                    2 /* FileSystemProviderCapabilities.FileReadWrite */ |
                        4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ |
                        16 /* FileSystemProviderCapabilities.FileReadStream */ |
                        8 /* FileSystemProviderCapabilities.FileFolderCopy */ |
                        8192 /* FileSystemProviderCapabilities.FileWriteUnlock */ |
                        16384 /* FileSystemProviderCapabilities.FileAtomicRead */ |
                        32768 /* FileSystemProviderCapabilities.FileAtomicWrite */ |
                        65536 /* FileSystemProviderCapabilities.FileAtomicDelete */ |
                        131072 /* FileSystemProviderCapabilities.FileClone */;
                if (this.b.pathCaseSensitive) {
                    this.c |= 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
                }
                if (this.b.trash) {
                    this.c |= 4096 /* FileSystemProviderCapabilities.Trash */;
                }
            }
            return this.c;
        }
        //#endregion
        //#region File Metadata Resolving
        stat(resource) {
            return this.a.call('stat', [resource]);
        }
        readdir(resource) {
            return this.a.call('readdir', [resource]);
        }
        //#endregion
        //#region File Reading/Writing
        async readFile(resource, opts) {
            const { buffer } = await this.a.call('readFile', [resource, opts]);
            return buffer;
        }
        readFileStream(resource, opts, token) {
            const stream = (0, stream_1.$td)(data => buffer_1.$Fd.concat(data.map(data => buffer_1.$Fd.wrap(data))).buffer);
            const disposables = new lifecycle_1.$jc();
            // Reading as file stream goes through an event to the remote side
            disposables.add(this.a.listen('readFileStream', [resource, opts])(dataOrErrorOrEnd => {
                // data
                if (dataOrErrorOrEnd instanceof buffer_1.$Fd) {
                    stream.write(dataOrErrorOrEnd.buffer);
                }
                // end or error
                else {
                    if (dataOrErrorOrEnd === 'end') {
                        stream.end();
                    }
                    else {
                        let error;
                        // Take Error as is if type matches
                        if (dataOrErrorOrEnd instanceof Error) {
                            error = dataOrErrorOrEnd;
                        }
                        // Otherwise, try to deserialize into an error.
                        // Since we communicate via IPC, we cannot be sure
                        // that Error objects are properly serialized.
                        else {
                            const errorCandidate = dataOrErrorOrEnd;
                            error = (0, files_1.$fk)(errorCandidate.message ?? (0, errorMessage_1.$mi)(errorCandidate), errorCandidate.code ?? files_1.FileSystemProviderErrorCode.Unknown);
                        }
                        stream.error(error);
                        stream.end();
                    }
                    // Signal to the remote side that we no longer listen
                    disposables.dispose();
                }
            }));
            // Support cancellation
            disposables.add(token.onCancellationRequested(() => {
                // Ensure to end the stream properly with an error
                // to indicate the cancellation.
                stream.error((0, errors_1.$4)());
                stream.end();
                // Ensure to dispose the listener upon cancellation. This will
                // bubble through the remote side as event and allows to stop
                // reading the file.
                disposables.dispose();
            }));
            return stream;
        }
        writeFile(resource, content, opts) {
            return this.a.call('writeFile', [resource, buffer_1.$Fd.wrap(content), opts]);
        }
        open(resource, opts) {
            return this.a.call('open', [resource, opts]);
        }
        close(fd) {
            return this.a.call('close', [fd]);
        }
        async read(fd, pos, data, offset, length) {
            const [bytes, bytesRead] = await this.a.call('read', [fd, pos, length]);
            // copy back the data that was written into the buffer on the remote
            // side. we need to do this because buffers are not referenced by
            // pointer, but only by value and as such cannot be directly written
            // to from the other process.
            data.set(bytes.buffer.slice(0, bytesRead), offset);
            return bytesRead;
        }
        write(fd, pos, data, offset, length) {
            return this.a.call('write', [fd, pos, buffer_1.$Fd.wrap(data), offset, length]);
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        mkdir(resource) {
            return this.a.call('mkdir', [resource]);
        }
        delete(resource, opts) {
            return this.a.call('delete', [resource, opts]);
        }
        rename(resource, target, opts) {
            return this.a.call('rename', [resource, target, opts]);
        }
        copy(resource, target, opts) {
            return this.a.call('copy', [resource, target, opts]);
        }
        //#endregion
        //#region Clone File
        cloneFile(resource, target) {
            return this.a.call('cloneFile', [resource, target]);
        }
        j() {
            // The contract for file changes is that there is one listener
            // for both events and errors from the watcher. So we need to
            // unwrap the event from the remote and emit through the proper
            // emitter.
            this.B(this.a.listen('fileChange', [this.h])(eventsOrError => {
                if (Array.isArray(eventsOrError)) {
                    const events = eventsOrError;
                    this.f.fire(events.map(event => ({ resource: uri_1.URI.revive(event.resource), type: event.type })));
                }
                else {
                    const error = eventsOrError;
                    this.g.fire(error);
                }
            }));
        }
        watch(resource, opts) {
            // Generate a request UUID to correlate the watcher
            // back to us when we ask to dispose the watcher later.
            const req = (0, uuid_1.$4f)();
            this.a.call('watch', [this.h, req, resource, opts]);
            return (0, lifecycle_1.$ic)(() => this.a.call('unwatch', [this.h, req]));
        }
    }
    exports.$8M = $8M;
});
//# sourceMappingURL=diskFileSystemProviderClient.js.map