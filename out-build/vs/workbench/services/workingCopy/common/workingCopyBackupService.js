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
define(["require", "exports", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/arrays", "vs/base/common/objects", "vs/base/common/async", "vs/platform/files/common/files", "vs/base/common/map", "vs/base/common/stream", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/base/common/network", "vs/base/common/hash", "vs/base/common/types", "vs/workbench/services/workingCopy/common/workingCopy"], function (require, exports, resources_1, uri_1, arrays_1, objects_1, async_1, files_1, map_1, stream_1, buffer_1, lifecycle_1, log_1, network_1, hash_1, types_1, workingCopy_1) {
    "use strict";
    var WorkingCopyBackupServiceImpl_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$j4b = exports.$i4b = exports.$h4b = exports.$g4b = void 0;
    class $g4b {
        static async create(backupRoot, fileService) {
            const model = new $g4b(backupRoot, fileService);
            await model.d();
            return model;
        }
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.a = new map_1.$zi();
        }
        async d() {
            try {
                const backupRootStat = await this.c.resolve(this.b);
                if (backupRootStat.children) {
                    await async_1.Promises.settled(backupRootStat.children
                        .filter(child => child.isDirectory)
                        .map(async (backupSchemaFolder) => {
                        // Read backup directory for backups
                        const backupSchemaFolderStat = await this.c.resolve(backupSchemaFolder.resource);
                        // Remember known backups in our caches
                        //
                        // Note: this does NOT account for resolving
                        // associated meta data because that requires
                        // opening the backup and reading the meta
                        // preamble. Instead, when backups are actually
                        // resolved, the meta data will be added via
                        // additional `update` calls.
                        if (backupSchemaFolderStat.children) {
                            for (const backupForSchema of backupSchemaFolderStat.children) {
                                if (!backupForSchema.isDirectory) {
                                    this.add(backupForSchema.resource);
                                }
                            }
                        }
                    }));
                }
            }
            catch (error) {
                // ignore any errors
            }
        }
        add(resource, versionId = 0, meta) {
            this.a.set(resource, {
                versionId,
                meta: (0, objects_1.$Vm)(meta)
            });
        }
        update(resource, meta) {
            const entry = this.a.get(resource);
            if (entry) {
                entry.meta = (0, objects_1.$Vm)(meta);
            }
        }
        count() {
            return this.a.size;
        }
        has(resource, versionId, meta) {
            const entry = this.a.get(resource);
            if (!entry) {
                return false; // unknown resource
            }
            if (typeof versionId === 'number' && versionId !== entry.versionId) {
                return false; // different versionId
            }
            if (meta && !(0, objects_1.$Zm)(meta, entry.meta)) {
                return false; // different metadata
            }
            return true;
        }
        get() {
            return Array.from(this.a.keys());
        }
        remove(resource) {
            this.a.delete(resource);
        }
        clear() {
            this.a.clear();
        }
    }
    exports.$g4b = $g4b;
    let $h4b = class $h4b extends lifecycle_1.$kc {
        constructor(backupWorkspaceHome, b, g) {
            super();
            this.b = b;
            this.g = g;
            this.a = this.B(this.h(backupWorkspaceHome));
        }
        h(backupWorkspaceHome) {
            if (backupWorkspaceHome) {
                return new WorkingCopyBackupServiceImpl(backupWorkspaceHome, this.b, this.g);
            }
            return new $i4b();
        }
        reinitialize(backupWorkspaceHome) {
            // Re-init implementation (unless we are running in-memory)
            if (this.a instanceof WorkingCopyBackupServiceImpl) {
                if (backupWorkspaceHome) {
                    this.a.initialize(backupWorkspaceHome);
                }
                else {
                    this.a = new $i4b();
                }
            }
        }
        hasBackups() {
            return this.a.hasBackups();
        }
        hasBackupSync(identifier, versionId, meta) {
            return this.a.hasBackupSync(identifier, versionId, meta);
        }
        backup(identifier, content, versionId, meta, token) {
            return this.a.backup(identifier, content, versionId, meta, token);
        }
        discardBackup(identifier, token) {
            return this.a.discardBackup(identifier, token);
        }
        discardBackups(filter) {
            return this.a.discardBackups(filter);
        }
        getBackups() {
            return this.a.getBackups();
        }
        resolve(identifier) {
            return this.a.resolve(identifier);
        }
        toBackupResource(identifier) {
            return this.a.toBackupResource(identifier);
        }
        joinBackups() {
            return this.a.joinBackups();
        }
    };
    exports.$h4b = $h4b;
    exports.$h4b = $h4b = __decorate([
        __param(1, files_1.$6j),
        __param(2, log_1.$5i)
    ], $h4b);
    let WorkingCopyBackupServiceImpl = class WorkingCopyBackupServiceImpl extends lifecycle_1.$kc {
        static { WorkingCopyBackupServiceImpl_1 = this; }
        static { this.a = '\n'; }
        static { this.b = '\n'.charCodeAt(0); }
        static { this.c = ' '; } // using a character that is know to be escaped in a URI as separator
        static { this.f = 10000; }
        constructor(m, n, r) {
            super();
            this.m = m;
            this.n = n;
            this.r = r;
            this.g = this.B(new async_1.$Pg()); // queue IO operations to ensure write/delete file order
            this.j = undefined;
            this.initialize(m);
        }
        initialize(backupWorkspaceResource) {
            this.m = backupWorkspaceResource;
            this.h = this.s();
        }
        async s() {
            // Create backup model
            this.j = await $g4b.create(this.m, this.n);
            return this.j;
        }
        async hasBackups() {
            const model = await this.h;
            // Ensure to await any pending backup operations
            await this.joinBackups();
            return model.count() > 0;
        }
        hasBackupSync(identifier, versionId, meta) {
            if (!this.j) {
                return false;
            }
            const backupResource = this.toBackupResource(identifier);
            return this.j.has(backupResource, versionId, meta);
        }
        async backup(identifier, content, versionId, meta, token) {
            const model = await this.h;
            if (token?.isCancellationRequested) {
                return;
            }
            const backupResource = this.toBackupResource(identifier);
            if (model.has(backupResource, versionId, meta)) {
                // return early if backup version id matches requested one
                return;
            }
            return this.g.queueFor(backupResource).queue(async () => {
                if (token?.isCancellationRequested) {
                    return;
                }
                if (model.has(backupResource, versionId, meta)) {
                    // return early if backup version id matches requested one
                    // this can happen when multiple backup IO operations got
                    // scheduled, racing against each other.
                    return;
                }
                // Encode as: Resource + META-START + Meta + END
                // and respect max length restrictions in case
                // meta is too large.
                let preamble = this.t(identifier, meta);
                if (preamble.length >= WorkingCopyBackupServiceImpl_1.f) {
                    preamble = this.t(identifier);
                }
                // Update backup with value
                const preambleBuffer = buffer_1.$Fd.fromString(preamble);
                let backupBuffer;
                if ((0, stream_1.$rd)(content)) {
                    backupBuffer = (0, buffer_1.$Xd)(preambleBuffer, content);
                }
                else if (content) {
                    backupBuffer = (0, buffer_1.$Wd)(preambleBuffer, content);
                }
                else {
                    backupBuffer = buffer_1.$Fd.concat([preambleBuffer, buffer_1.$Fd.fromString('')]);
                }
                // Write backup via file service
                await this.n.writeFile(backupResource, backupBuffer);
                //
                // Update model
                //
                // Note: not checking for cancellation here because a successful
                // write into the backup file should be noted in the model to
                // prevent the model being out of sync with the backup file
                model.add(backupResource, versionId, meta);
            });
        }
        t(identifier, meta) {
            return `${identifier.resource.toString()}${WorkingCopyBackupServiceImpl_1.c}${JSON.stringify({ ...meta, typeId: identifier.typeId })}${WorkingCopyBackupServiceImpl_1.a}`;
        }
        async discardBackups(filter) {
            const model = await this.h;
            // Discard all but some backups
            const except = filter?.except;
            if (Array.isArray(except) && except.length > 0) {
                const exceptMap = new map_1.$zi();
                for (const exceptWorkingCopy of except) {
                    exceptMap.set(this.toBackupResource(exceptWorkingCopy), true);
                }
                await async_1.Promises.settled(model.get().map(async (backupResource) => {
                    if (!exceptMap.has(backupResource)) {
                        await this.u(backupResource);
                    }
                }));
            }
            // Discard all backups
            else {
                await this.w(this.m);
                model.clear();
            }
        }
        discardBackup(identifier, token) {
            const backupResource = this.toBackupResource(identifier);
            return this.u(backupResource, token);
        }
        async u(backupResource, token) {
            const model = await this.h;
            if (token?.isCancellationRequested) {
                return;
            }
            return this.g.queueFor(backupResource).queue(async () => {
                if (token?.isCancellationRequested) {
                    return;
                }
                // Delete backup file ignoring any file not found errors
                await this.w(backupResource);
                //
                // Update model
                //
                // Note: not checking for cancellation here because a successful
                // delete of the backup file should be noted in the model to
                // prevent the model being out of sync with the backup file
                model.remove(backupResource);
            });
        }
        async w(backupResource) {
            try {
                await this.n.del(backupResource, { recursive: true });
            }
            catch (error) {
                if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    throw error; // re-throw any other error than file not found which is OK
                }
            }
        }
        async getBackups() {
            const model = await this.h;
            // Ensure to await any pending backup operations
            await this.joinBackups();
            const backups = await Promise.all(model.get().map(backupResource => this.y(backupResource, model)));
            return (0, arrays_1.$Fb)(backups);
        }
        async y(backupResource, model) {
            let res = undefined;
            await this.g.queueFor(backupResource).queue(async () => {
                if (!model.has(backupResource)) {
                    return; // require backup to be present
                }
                // Read the entire backup preamble by reading up to
                // `PREAMBLE_MAX_LENGTH` in the backup file until
                // the `PREAMBLE_END_MARKER` is found
                const backupPreamble = await this.z(backupResource, WorkingCopyBackupServiceImpl_1.a, WorkingCopyBackupServiceImpl_1.f);
                if (!backupPreamble) {
                    return;
                }
                // Figure out the offset in the preamble where meta
                // information possibly starts. This can be `-1` for
                // older backups without meta.
                const metaStartIndex = backupPreamble.indexOf(WorkingCopyBackupServiceImpl_1.c);
                // Extract the preamble content for resource and meta
                let resourcePreamble;
                let metaPreamble;
                if (metaStartIndex > 0) {
                    resourcePreamble = backupPreamble.substring(0, metaStartIndex);
                    metaPreamble = backupPreamble.substr(metaStartIndex + 1);
                }
                else {
                    resourcePreamble = backupPreamble;
                    metaPreamble = undefined;
                }
                // Try to parse the meta preamble for figuring out
                // `typeId` and `meta` if defined.
                const { typeId, meta } = this.C(metaPreamble);
                // Update model entry with now resolved meta
                model.update(backupResource, meta);
                res = {
                    typeId: typeId ?? workingCopy_1.$wA,
                    resource: uri_1.URI.parse(resourcePreamble)
                };
            });
            return res;
        }
        async z(backupResource, matchingString, maximumBytesToRead) {
            const contents = (await this.n.readFile(backupResource, { length: maximumBytesToRead })).value.toString();
            const matchingStringIndex = contents.indexOf(matchingString);
            if (matchingStringIndex >= 0) {
                return contents.substr(0, matchingStringIndex);
            }
            // Unable to find matching string in file
            return undefined;
        }
        async resolve(identifier) {
            const backupResource = this.toBackupResource(identifier);
            const model = await this.h;
            let res = undefined;
            await this.g.queueFor(backupResource).queue(async () => {
                if (!model.has(backupResource)) {
                    return; // require backup to be present
                }
                // Load the backup content and peek into the first chunk
                // to be able to resolve the meta data
                const backupStream = await this.n.readFileStream(backupResource);
                const peekedBackupStream = await (0, stream_1.$yd)(backupStream.value, 1);
                const firstBackupChunk = buffer_1.$Fd.concat(peekedBackupStream.buffer);
                // We have seen reports (e.g. https://github.com/microsoft/vscode/issues/78500) where
                // if VSCode goes down while writing the backup file, the file can turn empty because
                // it always first gets truncated and then written to. In this case, we will not find
                // the meta-end marker ('\n') and as such the backup can only be invalid. We bail out
                // here if that is the case.
                const preambleEndIndex = firstBackupChunk.buffer.indexOf(WorkingCopyBackupServiceImpl_1.b);
                if (preambleEndIndex === -1) {
                    this.r.trace(`Backup: Could not find meta end marker in ${backupResource}. The file is probably corrupt (filesize: ${backupStream.size}).`);
                    return undefined;
                }
                const preambelRaw = firstBackupChunk.slice(0, preambleEndIndex).toString();
                // Extract meta data (if any)
                let meta;
                const metaStartIndex = preambelRaw.indexOf(WorkingCopyBackupServiceImpl_1.c);
                if (metaStartIndex !== -1) {
                    meta = this.C(preambelRaw.substr(metaStartIndex + 1)).meta;
                }
                // Update model entry with now resolved meta
                model.update(backupResource, meta);
                // Build a new stream without the preamble
                const firstBackupChunkWithoutPreamble = firstBackupChunk.slice(preambleEndIndex + 1);
                let value;
                if (peekedBackupStream.ended) {
                    value = (0, buffer_1.$Td)(firstBackupChunkWithoutPreamble);
                }
                else {
                    value = (0, buffer_1.$Xd)(firstBackupChunkWithoutPreamble, peekedBackupStream.stream);
                }
                res = { value, meta };
            });
            return res;
        }
        C(preambleMetaRaw) {
            let typeId = undefined;
            let meta = undefined;
            if (preambleMetaRaw) {
                try {
                    meta = JSON.parse(preambleMetaRaw);
                    typeId = meta?.typeId;
                    // `typeId` is a property that we add so we
                    // remove it when returning to clients.
                    if (typeof meta?.typeId === 'string') {
                        delete meta.typeId;
                        if ((0, types_1.$wf)(meta)) {
                            meta = undefined;
                        }
                    }
                }
                catch (error) {
                    // ignore JSON parse errors
                }
            }
            return { typeId, meta };
        }
        toBackupResource(identifier) {
            return (0, resources_1.$ig)(this.m, identifier.resource.scheme, $j4b(identifier));
        }
        joinBackups() {
            return this.g.whenDrained();
        }
    };
    WorkingCopyBackupServiceImpl = WorkingCopyBackupServiceImpl_1 = __decorate([
        __param(1, files_1.$6j),
        __param(2, log_1.$5i)
    ], WorkingCopyBackupServiceImpl);
    class $i4b extends lifecycle_1.$kc {
        constructor() {
            super();
            this.a = new map_1.$zi();
        }
        async hasBackups() {
            return this.a.size > 0;
        }
        hasBackupSync(identifier, versionId) {
            const backupResource = this.toBackupResource(identifier);
            return this.a.has(backupResource);
        }
        async backup(identifier, content, versionId, meta, token) {
            const backupResource = this.toBackupResource(identifier);
            this.a.set(backupResource, {
                typeId: identifier.typeId,
                content: content instanceof buffer_1.$Fd ? content : content ? (0, stream_1.$rd)(content) ? await (0, buffer_1.$Rd)(content) : (0, buffer_1.$Pd)(content) : buffer_1.$Fd.fromString(''),
                meta
            });
        }
        async resolve(identifier) {
            const backupResource = this.toBackupResource(identifier);
            const backup = this.a.get(backupResource);
            if (backup) {
                return { value: (0, buffer_1.$Td)(backup.content), meta: backup.meta };
            }
            return undefined;
        }
        async getBackups() {
            return Array.from(this.a.entries()).map(([resource, backup]) => ({ typeId: backup.typeId, resource }));
        }
        async discardBackup(identifier) {
            this.a.delete(this.toBackupResource(identifier));
        }
        async discardBackups(filter) {
            const except = filter?.except;
            if (Array.isArray(except) && except.length > 0) {
                const exceptMap = new map_1.$zi();
                for (const exceptWorkingCopy of except) {
                    exceptMap.set(this.toBackupResource(exceptWorkingCopy), true);
                }
                for (const backup of await this.getBackups()) {
                    if (!exceptMap.has(this.toBackupResource(backup))) {
                        await this.discardBackup(backup);
                    }
                }
            }
            else {
                this.a.clear();
            }
        }
        toBackupResource(identifier) {
            return uri_1.URI.from({ scheme: network_1.Schemas.inMemory, path: $j4b(identifier) });
        }
        async joinBackups() {
            return;
        }
    }
    exports.$i4b = $i4b;
    /*
     * Exported only for testing
     */
    function $j4b(identifier) {
        // IMPORTANT: for backwards compatibility, ensure that
        // we ignore the `typeId` unless a value is provided.
        // To preserve previous backups without type id, we
        // need to just hash the resource. Otherwise we use
        // the type id as a seed to the resource path.
        let resource;
        if (identifier.typeId.length > 0) {
            const typeIdHash = hashString(identifier.typeId);
            if (identifier.resource.path) {
                resource = (0, resources_1.$ig)(identifier.resource, typeIdHash);
            }
            else {
                resource = identifier.resource.with({ path: typeIdHash });
            }
        }
        else {
            resource = identifier.resource;
        }
        return hashPath(resource);
    }
    exports.$j4b = $j4b;
    function hashPath(resource) {
        const str = resource.scheme === network_1.Schemas.file || resource.scheme === network_1.Schemas.untitled ? resource.fsPath : resource.toString();
        return hashString(str);
    }
    function hashString(str) {
        return (0, hash_1.$pi)(str).toString(16);
    }
});
//# sourceMappingURL=workingCopyBackupService.js.map