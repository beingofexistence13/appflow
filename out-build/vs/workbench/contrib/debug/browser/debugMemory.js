/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/assert", "vs/platform/files/common/files", "vs/workbench/contrib/debug/common/debug"], function (require, exports, buffer_1, event_1, lifecycle_1, numbers_1, assert_1, files_1, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QRb = void 0;
    const rangeRe = /range=([0-9]+):([0-9]+)/;
    class $QRb {
        constructor(d) {
            this.d = d;
            this.a = 0;
            this.b = new Map();
            this.c = new event_1.$fd();
            /** @inheritdoc */
            this.onDidChangeCapabilities = event_1.Event.None;
            /** @inheritdoc */
            this.onDidChangeFile = this.c.event;
            /** @inheritdoc */
            this.capabilities = 0
                | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */
                | 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */;
            d.onDidEndSession(session => {
                for (const [fd, memory] of this.b) {
                    if (memory.session === session) {
                        this.close(fd);
                    }
                }
            });
        }
        watch(resource, opts) {
            if (opts.recursive) {
                return (0, lifecycle_1.$ic)(() => { });
            }
            const { session, memoryReference, offset } = this.f(resource);
            const disposable = new lifecycle_1.$jc();
            disposable.add(session.onDidChangeState(() => {
                if (session.state === 3 /* State.Running */ || session.state === 0 /* State.Inactive */) {
                    this.c.fire([{ type: 2 /* FileChangeType.DELETED */, resource }]);
                }
            }));
            disposable.add(session.onDidInvalidateMemory(e => {
                if (e.body.memoryReference !== memoryReference) {
                    return;
                }
                if (offset && (e.body.offset >= offset.toOffset || e.body.offset + e.body.count < offset.fromOffset)) {
                    return;
                }
                this.c.fire([{ resource, type: 0 /* FileChangeType.UPDATED */ }]);
            }));
            return disposable;
        }
        /** @inheritdoc */
        stat(file) {
            const { readOnly } = this.f(file);
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
            throw (0, files_1.$fk)(`Not allowed`, files_1.FileSystemProviderErrorCode.NoPermissions);
        }
        /** @inheritdoc */
        readdir() {
            throw (0, files_1.$fk)(`Not allowed`, files_1.FileSystemProviderErrorCode.NoPermissions);
        }
        /** @inheritdoc */
        delete() {
            throw (0, files_1.$fk)(`Not allowed`, files_1.FileSystemProviderErrorCode.NoPermissions);
        }
        /** @inheritdoc */
        rename() {
            throw (0, files_1.$fk)(`Not allowed`, files_1.FileSystemProviderErrorCode.NoPermissions);
        }
        /** @inheritdoc */
        open(resource, _opts) {
            const { session, memoryReference, offset } = this.f(resource);
            const fd = this.a++;
            let region = session.getMemory(memoryReference);
            if (offset) {
                region = new MemoryRegionView(region, offset);
            }
            this.b.set(fd, { session, region });
            return Promise.resolve(fd);
        }
        /** @inheritdoc */
        close(fd) {
            this.b.get(fd)?.region.dispose();
            this.b.delete(fd);
            return Promise.resolve();
        }
        /** @inheritdoc */
        async writeFile(resource, content) {
            const { offset } = this.f(resource);
            if (!offset) {
                throw (0, files_1.$fk)(`Range must be present to read a file`, files_1.FileSystemProviderErrorCode.FileNotFound);
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
            const { offset } = this.f(resource);
            if (!offset) {
                throw (0, files_1.$fk)(`Range must be present to read a file`, files_1.FileSystemProviderErrorCode.FileNotFound);
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
            const memory = this.b.get(fd);
            if (!memory) {
                throw (0, files_1.$fk)(`No file with that descriptor open`, files_1.FileSystemProviderErrorCode.Unavailable);
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
                            throw (0, files_1.$fk)(range.error, files_1.FileSystemProviderErrorCode.Unknown);
                        }
                    case 0 /* MemoryRangeType.Valid */: {
                        const start = Math.max(0, pos - range.offset);
                        const toWrite = range.data.slice(start, Math.min(range.data.byteLength, start + (length - readSoFar)));
                        data.set(toWrite.buffer, offset + readSoFar);
                        readSoFar += toWrite.byteLength;
                        break;
                    }
                    default:
                        (0, assert_1.$vc)(range);
                }
            }
            return readSoFar;
        }
        /** @inheritdoc */
        write(fd, pos, data, offset, length) {
            const memory = this.b.get(fd);
            if (!memory) {
                throw (0, files_1.$fk)(`No file with that descriptor open`, files_1.FileSystemProviderErrorCode.Unavailable);
            }
            return memory.region.write(pos, buffer_1.$Fd.wrap(data).slice(offset, offset + length));
        }
        f(uri) {
            if (uri.scheme !== debug_1.$mH) {
                throw (0, files_1.$fk)(`Cannot open file with scheme ${uri.scheme}`, files_1.FileSystemProviderErrorCode.FileNotFound);
            }
            const session = this.d.getModel().getSession(uri.authority);
            if (!session) {
                throw (0, files_1.$fk)(`Debug session not found`, files_1.FileSystemProviderErrorCode.FileNotFound);
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
    exports.$QRb = $QRb;
    /** A wrapper for a MemoryRegion that references a subset of data in another region. */
    class MemoryRegionView extends lifecycle_1.$kc {
        constructor(c, range) {
            super();
            this.c = c;
            this.range = range;
            this.a = new event_1.$fd();
            this.onDidInvalidate = this.a.event;
            this.b = this.range.toOffset - this.range.fromOffset;
            this.writable = c.writable;
            this.B(c);
            this.B(c.onDidInvalidate(e => {
                const fromOffset = (0, numbers_1.$Hl)(e.fromOffset - range.fromOffset, 0, this.b);
                const toOffset = (0, numbers_1.$Hl)(e.toOffset - range.fromOffset, 0, this.b);
                if (toOffset > fromOffset) {
                    this.a.fire({ fromOffset, toOffset });
                }
            }));
        }
        read(fromOffset, toOffset) {
            if (fromOffset < 0) {
                throw new RangeError(`Invalid fromOffset: ${fromOffset}`);
            }
            return this.c.read(this.range.fromOffset + fromOffset, this.range.fromOffset + Math.min(toOffset, this.b));
        }
        write(offset, data) {
            return this.c.write(this.range.fromOffset + offset, data);
        }
    }
});
//# sourceMappingURL=debugMemory.js.map