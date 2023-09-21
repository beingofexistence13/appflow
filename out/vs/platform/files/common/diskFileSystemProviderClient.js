/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/stream", "vs/base/common/uri", "vs/base/common/uuid", "vs/platform/files/common/files"], function (require, exports, buffer_1, errorMessage_1, errors_1, event_1, lifecycle_1, stream_1, uri_1, uuid_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiskFileSystemProviderClient = exports.LOCAL_FILE_SYSTEM_CHANNEL_NAME = void 0;
    exports.LOCAL_FILE_SYSTEM_CHANNEL_NAME = 'localFilesystem';
    /**
     * An implementation of a local disk file system provider
     * that is backed by a `IChannel` and thus implemented via
     * IPC on a different process.
     */
    class DiskFileSystemProviderClient extends lifecycle_1.Disposable {
        constructor(channel, extraCapabilities) {
            super();
            this.channel = channel;
            this.extraCapabilities = extraCapabilities;
            //#region File Capabilities
            this.onDidChangeCapabilities = event_1.Event.None;
            //#endregion
            //#region File Watching
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChange.event;
            this._onDidWatchError = this._register(new event_1.Emitter());
            this.onDidWatchError = this._onDidWatchError.event;
            // The contract for file watching via remote is to identify us
            // via a unique but readonly session ID. Since the remote is
            // managing potentially many watchers from different clients,
            // this helps the server to properly partition events to the right
            // clients.
            this.sessionId = (0, uuid_1.generateUuid)();
            this.registerFileChangeListeners();
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
                if (this.extraCapabilities.pathCaseSensitive) {
                    this._capabilities |= 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
                }
                if (this.extraCapabilities.trash) {
                    this._capabilities |= 4096 /* FileSystemProviderCapabilities.Trash */;
                }
            }
            return this._capabilities;
        }
        //#endregion
        //#region File Metadata Resolving
        stat(resource) {
            return this.channel.call('stat', [resource]);
        }
        readdir(resource) {
            return this.channel.call('readdir', [resource]);
        }
        //#endregion
        //#region File Reading/Writing
        async readFile(resource, opts) {
            const { buffer } = await this.channel.call('readFile', [resource, opts]);
            return buffer;
        }
        readFileStream(resource, opts, token) {
            const stream = (0, stream_1.newWriteableStream)(data => buffer_1.VSBuffer.concat(data.map(data => buffer_1.VSBuffer.wrap(data))).buffer);
            const disposables = new lifecycle_1.DisposableStore();
            // Reading as file stream goes through an event to the remote side
            disposables.add(this.channel.listen('readFileStream', [resource, opts])(dataOrErrorOrEnd => {
                // data
                if (dataOrErrorOrEnd instanceof buffer_1.VSBuffer) {
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
                            error = (0, files_1.createFileSystemProviderError)(errorCandidate.message ?? (0, errorMessage_1.toErrorMessage)(errorCandidate), errorCandidate.code ?? files_1.FileSystemProviderErrorCode.Unknown);
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
                stream.error((0, errors_1.canceled)());
                stream.end();
                // Ensure to dispose the listener upon cancellation. This will
                // bubble through the remote side as event and allows to stop
                // reading the file.
                disposables.dispose();
            }));
            return stream;
        }
        writeFile(resource, content, opts) {
            return this.channel.call('writeFile', [resource, buffer_1.VSBuffer.wrap(content), opts]);
        }
        open(resource, opts) {
            return this.channel.call('open', [resource, opts]);
        }
        close(fd) {
            return this.channel.call('close', [fd]);
        }
        async read(fd, pos, data, offset, length) {
            const [bytes, bytesRead] = await this.channel.call('read', [fd, pos, length]);
            // copy back the data that was written into the buffer on the remote
            // side. we need to do this because buffers are not referenced by
            // pointer, but only by value and as such cannot be directly written
            // to from the other process.
            data.set(bytes.buffer.slice(0, bytesRead), offset);
            return bytesRead;
        }
        write(fd, pos, data, offset, length) {
            return this.channel.call('write', [fd, pos, buffer_1.VSBuffer.wrap(data), offset, length]);
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        mkdir(resource) {
            return this.channel.call('mkdir', [resource]);
        }
        delete(resource, opts) {
            return this.channel.call('delete', [resource, opts]);
        }
        rename(resource, target, opts) {
            return this.channel.call('rename', [resource, target, opts]);
        }
        copy(resource, target, opts) {
            return this.channel.call('copy', [resource, target, opts]);
        }
        //#endregion
        //#region Clone File
        cloneFile(resource, target) {
            return this.channel.call('cloneFile', [resource, target]);
        }
        registerFileChangeListeners() {
            // The contract for file changes is that there is one listener
            // for both events and errors from the watcher. So we need to
            // unwrap the event from the remote and emit through the proper
            // emitter.
            this._register(this.channel.listen('fileChange', [this.sessionId])(eventsOrError => {
                if (Array.isArray(eventsOrError)) {
                    const events = eventsOrError;
                    this._onDidChange.fire(events.map(event => ({ resource: uri_1.URI.revive(event.resource), type: event.type })));
                }
                else {
                    const error = eventsOrError;
                    this._onDidWatchError.fire(error);
                }
            }));
        }
        watch(resource, opts) {
            // Generate a request UUID to correlate the watcher
            // back to us when we ask to dispose the watcher later.
            const req = (0, uuid_1.generateUuid)();
            this.channel.call('watch', [this.sessionId, req, resource, opts]);
            return (0, lifecycle_1.toDisposable)(() => this.channel.call('unwatch', [this.sessionId, req]));
        }
    }
    exports.DiskFileSystemProviderClient = DiskFileSystemProviderClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlza0ZpbGVTeXN0ZW1Qcm92aWRlckNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL2NvbW1vbi9kaXNrRmlsZVN5c3RlbVByb3ZpZGVyQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNuRixRQUFBLDhCQUE4QixHQUFHLGlCQUFpQixDQUFDO0lBRWhFOzs7O09BSUc7SUFDSCxNQUFhLDRCQUE2QixTQUFRLHNCQUFVO1FBUTNELFlBQ2tCLE9BQWlCLEVBQ2pCLGlCQUFtRTtZQUVwRixLQUFLLEVBQUUsQ0FBQztZQUhTLFlBQU8sR0FBUCxPQUFPLENBQVU7WUFDakIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrRDtZQU9yRiwyQkFBMkI7WUFFbEIsNEJBQXVCLEdBQWdCLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFxSzNELFlBQVk7WUFFWix1QkFBdUI7WUFFTixpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTBCLENBQUMsQ0FBQztZQUM3RSxvQkFBZSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBRWxDLHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVUsQ0FBQyxDQUFDO1lBQ2pFLG9CQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztZQUV2RCw4REFBOEQ7WUFDOUQsNERBQTREO1lBQzVELDZEQUE2RDtZQUM3RCxrRUFBa0U7WUFDbEUsV0FBVztZQUNNLGNBQVMsR0FBRyxJQUFBLG1CQUFZLEdBQUUsQ0FBQztZQXpMM0MsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFDcEMsQ0FBQztRQU9ELElBQUksWUFBWTtZQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUN4QixJQUFJ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