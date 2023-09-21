/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/assert", "vs/platform/files/common/files", "vs/workbench/contrib/debug/common/debug"], function (require, exports, buffer_1, event_1, lifecycle_1, numbers_1, assert_1, files_1, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugMemoryFileSystemProvider = void 0;
    const rangeRe = /range=([0-9]+):([0-9]+)/;
    class DebugMemoryFileSystemProvider {
        constructor(debugService) {
            this.debugService = debugService;
            this.memoryFdCounter = 0;
            this.fdMemory = new Map();
            this.changeEmitter = new event_1.Emitter();
            /** @inheritdoc */
            this.onDidChangeCapabilities = event_1.Event.None;
            /** @inheritdoc */
            this.onDidChangeFile = this.changeEmitter.event;
            /** @inheritdoc */
            this.capabilities = 0
                | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */
                | 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */;
            debugService.onDidEndSession(session => {
                for (const [fd, memory] of this.fdMemory) {
                    if (memory.session === session) {
                        this.close(fd);
                    }
                }
            });
        }
        watch(resource, opts) {
            if (opts.recursive) {
                return (0, lifecycle_1.toDisposable)(() => { });
            }
            const { session, memoryReference, offset } = this.parseUri(resource);
            const disposable = new lifecycle_1.DisposableStore();
            disposable.add(session.onDidChangeState(() => {
                if (session.state === 3 /* State.Running */ || session.state === 0 /* State.Inactive */) {
                    this.changeEmitter.fire([{ type: 2 /* FileChangeType.DELETED */, resource }]);
                }
            }));
            disposable.add(session.onDidInvalidateMemory(e => {
                if (e.body.memoryReference !== memoryReference) {
                    return;
                }
                if (offset && (e.body.offset >= offset.toOffset || e.body.offset + e.body.count < offset.fromOffset)) {
                    return;
                }
                this.changeEmitter.fire([{ resource, type: 0 /* FileChangeType.UPDATED */ }]);
            }));
            return disposable;
        }
        /** @inheritdoc */
        stat(file) {
            const { readOnly } = this.parseUri(file);
            return Promise.resolve({
                type: files_1.FileType.File,
                mtime: 0,
                ctime: 0,
                size: 0,
                permissions: readOnly ? files_1.FilePermission.Readonly : undefined,
            });
        }
        /** @inheritdoc */
        mkdir() {
            throw (0, files_1.createFileSystemProviderError)(`Not allowed`, files_1.FileSystemProviderErrorCode.NoPermissions);
        }
        /** @inheritdoc */
        readdir() {
            throw (0, files_1.createFileSystemProviderError)(`Not allowed`, files_1.FileSystemProviderErrorCode.NoPermissions);
        }
        /** @inheritdoc */
        delete() {
            throw (0, files_1.createFileSystemProviderError)(`Not allowed`, files_1.FileSystemProviderErrorCode.NoPermissions);
        }
        /** @inheritdoc */
        rename() {
            throw (0, files_1.createFileSystemProviderError)(`Not allowed`, files_1.FileSystemProviderErrorCode.NoPermissions);
        }
        /** @inheritdoc */
        open(resource, _opts) {
            const { session, memoryReference, offset } = this.parseUri(resource);
            const fd = this.memoryFdCounter++;
            let region = session.getMemory(memoryReference);
            if (offset) {
                region = new MemoryRegionView(region, offset);
            }
            this.fdMemory.set(fd, { session, region });
            return Promise.resolve(fd);
        }
        /** @inheritdoc */
        close(fd) {
            this.fdMemory.get(fd)?.region.dispose();
            this.fdMemory.delete(fd);
            return Promise.resolve();
        }
        /** @inheritdoc */
        async writeFile(resource, content) {
            const { offset } = this.parseUri(resource);
            if (!offset) {
                throw (0, files_1.createFileSystemProviderError)(`Range must be present to read a file`, files_1.FileSystemProviderErrorCode.FileNotFound);
            }
            const fd = await this.open(resource, { create: false });
            try {
                await this.write(fd, offset.fromOffset, content, 0, content.length);
            }
            finally {
                this.close(fd);
            }
        }
        /** @inheritdoc */
        async readFile(resource) {
            const { offset } = this.parseUri(resource);
            if (!offset) {
                throw (0, files_1.createFileSystemProviderError)(`Range must be present to read a file`, files_1.FileSystemProviderErrorCode.FileNotFound);
            }
            const data = new Uint8Array(offset.toOffset - offset.fromOffset);
            const fd = await this.open(resource, { create: false });
            try {
                await this.read(fd, offset.fromOffset, data, 0, data.length);
                return data;
            }
            finally {
                this.close(fd);
            }
        }
        /** @inheritdoc */
        async read(fd, pos, data, offset, length) {
            const memory = this.fdMemory.get(fd);
            if (!memory) {
                throw (0, files_1.createFileSystemProviderError)(`No file with that descriptor open`, files_1.FileSystemProviderErrorCode.Unavailable);
            }
            const ranges = await memory.region.read(pos, length);
            let readSoFar = 0;
            for (const range of ranges) {
                switch (range.type) {
                    case 1 /* MemoryRangeType.Unreadable */:
                        return readSoFar;
                    case 2 /* MemoryRangeType.Error */:
                        if (readSoFar > 0) {
                            return readSoFar;
                        }
                        else {
                            throw (0, files_1.createFileSystemProviderError)(range.error, files_1.FileSystemProviderErrorCode.Unknown);
                        }
                    case 0 /* MemoryRangeType.Valid */: {
                        const start = Math.max(0, pos - range.offset);
                        const toWrite = range.data.slice(start, Math.min(range.data.byteLength, start + (length - readSoFar)));
                        data.set(toWrite.buffer, offset + readSoFar);
                        readSoFar += toWrite.byteLength;
                        break;
                    }
                    default:
                        (0, assert_1.assertNever)(range);
                }
            }
            return readSoFar;
        }
        /** @inheritdoc */
        write(fd, pos, data, offset, length) {
            const memory = this.fdMemory.get(fd);
            if (!memory) {
                throw (0, files_1.createFileSystemProviderError)(`No file with that descriptor open`, files_1.FileSystemProviderErrorCode.Unavailable);
            }
            return memory.region.write(pos, buffer_1.VSBuffer.wrap(data).slice(offset, offset + length));
        }
        parseUri(uri) {
            if (uri.scheme !== debug_1.DEBUG_MEMORY_SCHEME) {
                throw (0, files_1.createFileSystemProviderError)(`Cannot open file with scheme ${uri.scheme}`, files_1.FileSystemProviderErrorCode.FileNotFound);
            }
            const session = this.debugService.getModel().getSession(uri.authority);
            if (!session) {
                throw (0, files_1.createFileSystemProviderError)(`Debug session not found`, files_1.FileSystemProviderErrorCode.FileNotFound);
            }
            let offset;
            const rangeMatch = rangeRe.exec(uri.query);
            if (rangeMatch) {
                offset = { fromOffset: Number(rangeMatch[1]), toOffset: Number(rangeMatch[2]) };
            }
            const [, memoryReference] = uri.path.split('/');
            return {
                session,
                offset,
                readOnly: !session.capabilities.supportsWriteMemoryRequest,
                sessionId: uri.authority,
                memoryReference: decodeURIComponent(memoryReference),
            };
        }
    }
    exports.DebugMemoryFileSystemProvider = DebugMemoryFileSystemProvider;
    /** A wrapper for a MemoryRegion that references a subset of data in another region. */
    class MemoryRegionView extends lifecycle_1.Disposable {
        constructor(parent, range) {
            super();
            this.parent = parent;
            this.range = range;
            this.invalidateEmitter = new event_1.Emitter();
            this.onDidInvalidate = this.invalidateEmitter.event;
            this.width = this.range.toOffset - this.range.fromOffset;
            this.writable = parent.writable;
            this._register(parent);
            this._register(parent.onDidInvalidate(e => {
                const fromOffset = (0, numbers_1.clamp)(e.fromOffset - range.fromOffset, 0, this.width);
                const toOffset = (0, numbers_1.clamp)(e.toOffset - range.fromOffset, 0, this.width);
                if (toOffset > fromOffset) {
                    this.invalidateEmitter.fire({ fromOffset, toOffset });
                }
            }));
        }
        read(fromOffset, toOffset) {
            if (fromOffset < 0) {
                throw new RangeError(`Invalid fromOffset: ${fromOffset}`);
            }
            return this.parent.read(this.range.fromOffset + fromOffset, this.range.fromOffset + Math.min(toOffset, this.width));
        }
        write(offset, data) {
            return this.parent.write(this.range.fromOffset + offset, data);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdNZW1vcnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2RlYnVnTWVtb3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxNQUFNLE9BQU8sR0FBRyx5QkFBeUIsQ0FBQztJQUUxQyxNQUFhLDZCQUE2QjtRQWdCekMsWUFBNkIsWUFBMkI7WUFBM0IsaUJBQVksR0FBWixZQUFZLENBQWU7WUFmaEQsb0JBQWUsR0FBRyxDQUFDLENBQUM7WUFDWCxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQTZELENBQUM7WUFDaEYsa0JBQWEsR0FBRyxJQUFJLGVBQU8sRUFBMEIsQ0FBQztZQUV2RSxrQkFBa0I7WUFDRiw0QkFBdUIsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1lBRXJELGtCQUFrQjtZQUNGLG9CQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFFM0Qsa0JBQWtCO1lBQ0YsaUJBQVksR0FBRyxDQUFDOzZFQUNtQjsrRUFDSyxDQUFDO1lBR3hELFlBQVksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3RDLEtBQUssTUFBTSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUN6QyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEtBQUssT0FBTyxFQUFFO3dCQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUNmO2lCQUNEO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sS0FBSyxDQUFDLFFBQWEsRUFBRSxJQUFtQjtZQUM5QyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ25CLE9BQU8sSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFD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