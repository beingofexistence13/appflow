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
    exports.hashIdentifier = exports.InMemoryWorkingCopyBackupService = exports.WorkingCopyBackupService = exports.WorkingCopyBackupsModel = void 0;
    class WorkingCopyBackupsModel {
        static async create(backupRoot, fileService) {
            const model = new WorkingCopyBackupsModel(backupRoot, fileService);
            await model.resolve();
            return model;
        }
        constructor(backupRoot, fileService) {
            this.backupRoot = backupRoot;
            this.fileService = fileService;
            this.cache = new map_1.ResourceMap();
        }
        async resolve() {
            try {
                const backupRootStat = await this.fileService.resolve(this.backupRoot);
                if (backupRootStat.children) {
                    await async_1.Promises.settled(backupRootStat.children
                        .filter(child => child.isDirectory)
                        .map(async (backupSchemaFolder) => {
                        // Read backup directory for backups
                        const backupSchemaFolderStat = await this.fileService.resolve(backupSchemaFolder.resource);
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
            this.cache.set(resource, {
                versionId,
                meta: (0, objects_1.deepClone)(meta)
            });
        }
        update(resource, meta) {
            const entry = this.cache.get(resource);
            if (entry) {
                entry.meta = (0, objects_1.deepClone)(meta);
            }
        }
        count() {
            return this.cache.size;
        }
        has(resource, versionId, meta) {
            const entry = this.cache.get(resource);
            if (!entry) {
                return false; // unknown resource
            }
            if (typeof versionId === 'number' && versionId !== entry.versionId) {
                return false; // different versionId
            }
            if (meta && !(0, objects_1.equals)(meta, entry.meta)) {
                return false; // different metadata
            }
            return true;
        }
        get() {
            return Array.from(this.cache.keys());
        }
        remove(resource) {
            this.cache.delete(resource);
        }
        clear() {
            this.cache.clear();
        }
    }
    exports.WorkingCopyBackupsModel = WorkingCopyBackupsModel;
    let WorkingCopyBackupService = class WorkingCopyBackupService extends lifecycle_1.Disposable {
        constructor(backupWorkspaceHome, fileService, logService) {
            super();
            this.fileService = fileService;
            this.logService = logService;
            this.impl = this._register(this.initialize(backupWorkspaceHome));
        }
        initialize(backupWorkspaceHome) {
            if (backupWorkspaceHome) {
                return new WorkingCopyBackupServiceImpl(backupWorkspaceHome, this.fileService, this.logService);
            }
            return new InMemoryWorkingCopyBackupService();
        }
        reinitialize(backupWorkspaceHome) {
            // Re-init implementation (unless we are running in-memory)
            if (this.impl instanceof WorkingCopyBackupServiceImpl) {
                if (backupWorkspaceHome) {
                    this.impl.initialize(backupWorkspaceHome);
                }
                else {
                    this.impl = new InMemoryWorkingCopyBackupService();
                }
            }
        }
        hasBackups() {
            return this.impl.hasBackups();
        }
        hasBackupSync(identifier, versionId, meta) {
            return this.impl.hasBackupSync(identifier, versionId, meta);
        }
        backup(identifier, content, versionId, meta, token) {
            return this.impl.backup(identifier, content, versionId, meta, token);
        }
        discardBackup(identifier, token) {
            return this.impl.discardBackup(identifier, token);
        }
        discardBackups(filter) {
            return this.impl.discardBackups(filter);
        }
        getBackups() {
            return this.impl.getBackups();
        }
        resolve(identifier) {
            return this.impl.resolve(identifier);
        }
        toBackupResource(identifier) {
            return this.impl.toBackupResource(identifier);
        }
        joinBackups() {
            return this.impl.joinBackups();
        }
    };
    exports.WorkingCopyBackupService = WorkingCopyBackupService;
    exports.WorkingCopyBackupService = WorkingCopyBackupService = __decorate([
        __param(1, files_1.IFileService),
        __param(2, log_1.ILogService)
    ], WorkingCopyBackupService);
    let WorkingCopyBackupServiceImpl = class WorkingCopyBackupServiceImpl extends lifecycle_1.Disposable {
        static { WorkingCopyBackupServiceImpl_1 = this; }
        static { this.PREAMBLE_END_MARKER = '\n'; }
        static { this.PREAMBLE_END_MARKER_CHARCODE = '\n'.charCodeAt(0); }
        static { this.PREAMBLE_META_SEPARATOR = ' '; } // using a character that is know to be escaped in a URI as separator
        static { this.PREAMBLE_MAX_LENGTH = 10000; }
        constructor(backupWorkspaceHome, fileService, logService) {
            super();
            this.backupWorkspaceHome = backupWorkspaceHome;
            this.fileService = fileService;
            this.logService = logService;
            this.ioOperationQueues = this._register(new async_1.ResourceQueue()); // queue IO operations to ensure write/delete file order
            this.model = undefined;
            this.initialize(backupWorkspaceHome);
        }
        initialize(backupWorkspaceResource) {
            this.backupWorkspaceHome = backupWorkspaceResource;
            this.ready = this.doInitialize();
        }
        async doInitialize() {
            // Create backup model
            this.model = await WorkingCopyBackupsModel.create(this.backupWorkspaceHome, this.fileService);
            return this.model;
        }
        async hasBackups() {
            const model = await this.ready;
            // Ensure to await any pending backup operations
            await this.joinBackups();
            return model.count() > 0;
        }
        hasBackupSync(identifier, versionId, meta) {
            if (!this.model) {
                return false;
            }
            const backupResource = this.toBackupResource(identifier);
            return this.model.has(backupResource, versionId, meta);
        }
        async backup(identifier, content, versionId, meta, token) {
            const model = await this.ready;
            if (token?.isCancellationRequested) {
                return;
            }
            const backupResource = this.toBackupResource(identifier);
            if (model.has(backupResource, versionId, meta)) {
                // return early if backup version id matches requested one
                return;
            }
            return this.ioOperationQueues.queueFor(backupResource).queue(async () => {
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
                let preamble = this.createPreamble(identifier, meta);
                if (preamble.length >= WorkingCopyBackupServiceImpl_1.PREAMBLE_MAX_LENGTH) {
                    preamble = this.createPreamble(identifier);
                }
                // Update backup with value
                const preambleBuffer = buffer_1.VSBuffer.fromString(preamble);
                let backupBuffer;
                if ((0, stream_1.isReadableStream)(content)) {
                    backupBuffer = (0, buffer_1.prefixedBufferStream)(preambleBuffer, content);
                }
                else if (content) {
                    backupBuffer = (0, buffer_1.prefixedBufferReadable)(preambleBuffer, content);
                }
                else {
                    backupBuffer = buffer_1.VSBuffer.concat([preambleBuffer, buffer_1.VSBuffer.fromString('')]);
                }
                // Write backup via file service
                await this.fileService.writeFile(backupResource, backupBuffer);
                //
                // Update model
                //
                // Note: not checking for cancellation here because a successful
                // write into the backup file should be noted in the model to
                // prevent the model being out of sync with the backup file
                model.add(backupResource, versionId, meta);
            });
        }
        createPreamble(identifier, meta) {
            return `${identifier.resource.toString()}${WorkingCopyBackupServiceImpl_1.PREAMBLE_META_SEPARATOR}${JSON.stringify({ ...meta, typeId: identifier.typeId })}${WorkingCopyBackupServiceImpl_1.PREAMBLE_END_MARKER}`;
        }
        async discardBackups(filter) {
            const model = await this.ready;
            // Discard all but some backups
            const except = filter?.except;
            if (Array.isArray(except) && except.length > 0) {
                const exceptMap = new map_1.ResourceMap();
                for (const exceptWorkingCopy of except) {
                    exceptMap.set(this.toBackupResource(exceptWorkingCopy), true);
                }
                await async_1.Promises.settled(model.get().map(async (backupResource) => {
                    if (!exceptMap.has(backupResource)) {
                        await this.doDiscardBackup(backupResource);
                    }
                }));
            }
            // Discard all backups
            else {
                await this.deleteIgnoreFileNotFound(this.backupWorkspaceHome);
                model.clear();
            }
        }
        discardBackup(identifier, token) {
            const backupResource = this.toBackupResource(identifier);
            return this.doDiscardBackup(backupResource, token);
        }
        async doDiscardBackup(backupResource, token) {
            const model = await this.ready;
            if (token?.isCancellationRequested) {
                return;
            }
            return this.ioOperationQueues.queueFor(backupResource).queue(async () => {
                if (token?.isCancellationRequested) {
                    return;
                }
                // Delete backup file ignoring any file not found errors
                await this.deleteIgnoreFileNotFound(backupResource);
                //
                // Update model
                //
                // Note: not checking for cancellation here because a successful
                // delete of the backup file should be noted in the model to
                // prevent the model being out of sync with the backup file
                model.remove(backupResource);
            });
        }
        async deleteIgnoreFileNotFound(backupResource) {
            try {
                await this.fileService.del(backupResource, { recursive: true });
            }
            catch (error) {
                if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    throw error; // re-throw any other error than file not found which is OK
                }
            }
        }
        async getBackups() {
            const model = await this.ready;
            // Ensure to await any pending backup operations
            await this.joinBackups();
            const backups = await Promise.all(model.get().map(backupResource => this.resolveIdentifier(backupResource, model)));
            return (0, arrays_1.coalesce)(backups);
        }
        async resolveIdentifier(backupResource, model) {
            let res = undefined;
            await this.ioOperationQueues.queueFor(backupResource).queue(async () => {
                if (!model.has(backupResource)) {
                    return; // require backup to be present
                }
                // Read the entire backup preamble by reading up to
                // `PREAMBLE_MAX_LENGTH` in the backup file until
                // the `PREAMBLE_END_MARKER` is found
                const backupPreamble = await this.readToMatchingString(backupResource, WorkingCopyBackupServiceImpl_1.PREAMBLE_END_MARKER, WorkingCopyBackupServiceImpl_1.PREAMBLE_MAX_LENGTH);
                if (!backupPreamble) {
                    return;
                }
                // Figure out the offset in the preamble where meta
                // information possibly starts. This can be `-1` for
                // older backups without meta.
                const metaStartIndex = backupPreamble.indexOf(WorkingCopyBackupServiceImpl_1.PREAMBLE_META_SEPARATOR);
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
                const { typeId, meta } = this.parsePreambleMeta(metaPreamble);
                // Update model entry with now resolved meta
                model.update(backupResource, meta);
                res = {
                    typeId: typeId ?? workingCopy_1.NO_TYPE_ID,
                    resource: uri_1.URI.parse(resourcePreamble)
                };
            });
            return res;
        }
        async readToMatchingString(backupResource, matchingString, maximumBytesToRead) {
            const contents = (await this.fileService.readFile(backupResource, { length: maximumBytesToRead })).value.toString();
            const matchingStringIndex = contents.indexOf(matchingString);
            if (matchingStringIndex >= 0) {
                return contents.substr(0, matchingStringIndex);
            }
            // Unable to find matching string in file
            return undefined;
        }
        async resolve(identifier) {
            const backupResource = this.toBackupResource(identifier);
            const model = await this.ready;
            let res = undefined;
            await this.ioOperationQueues.queueFor(backupResource).queue(async () => {
                if (!model.has(backupResource)) {
                    return; // require backup to be present
                }
                // Load the backup content and peek into the first chunk
                // to be able to resolve the meta data
                const backupStream = await this.fileService.readFileStream(backupResource);
                const peekedBackupStream = await (0, stream_1.peekStream)(backupStream.value, 1);
                const firstBackupChunk = buffer_1.VSBuffer.concat(peekedBackupStream.buffer);
                // We have seen reports (e.g. https://github.com/microsoft/vscode/issues/78500) where
                // if VSCode goes down while writing the backup file, the file can turn empty because
                // it always first gets truncated and then written to. In this case, we will not find
                // the meta-end marker ('\n') and as such the backup can only be invalid. We bail out
                // here if that is the case.
                const preambleEndIndex = firstBackupChunk.buffer.indexOf(WorkingCopyBackupServiceImpl_1.PREAMBLE_END_MARKER_CHARCODE);
                if (preambleEndIndex === -1) {
                    this.logService.trace(`Backup: Could not find meta end marker in ${backupResource}. The file is probably corrupt (filesize: ${backupStream.size}).`);
                    return undefined;
                }
                const preambelRaw = firstBackupChunk.slice(0, preambleEndIndex).toString();
                // Extract meta data (if any)
                let meta;
                const metaStartIndex = preambelRaw.indexOf(WorkingCopyBackupServiceImpl_1.PREAMBLE_META_SEPARATOR);
                if (metaStartIndex !== -1) {
                    meta = this.parsePreambleMeta(preambelRaw.substr(metaStartIndex + 1)).meta;
                }
                // Update model entry with now resolved meta
                model.update(backupResource, meta);
                // Build a new stream without the preamble
                const firstBackupChunkWithoutPreamble = firstBackupChunk.slice(preambleEndIndex + 1);
                let value;
                if (peekedBackupStream.ended) {
                    value = (0, buffer_1.bufferToStream)(firstBackupChunkWithoutPreamble);
                }
                else {
                    value = (0, buffer_1.prefixedBufferStream)(firstBackupChunkWithoutPreamble, peekedBackupStream.stream);
                }
                res = { value, meta };
            });
            return res;
        }
        parsePreambleMeta(preambleMetaRaw) {
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
                        if ((0, types_1.isEmptyObject)(meta)) {
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
            return (0, resources_1.joinPath)(this.backupWorkspaceHome, identifier.resource.scheme, hashIdentifier(identifier));
        }
        joinBackups() {
            return this.ioOperationQueues.whenDrained();
        }
    };
    WorkingCopyBackupServiceImpl = WorkingCopyBackupServiceImpl_1 = __decorate([
        __param(1, files_1.IFileService),
        __param(2, log_1.ILogService)
    ], WorkingCopyBackupServiceImpl);
    class InMemoryWorkingCopyBackupService extends lifecycle_1.Disposable {
        constructor() {
            super();
            this.backups = new map_1.ResourceMap();
        }
        async hasBackups() {
            return this.backups.size > 0;
        }
        hasBackupSync(identifier, versionId) {
            const backupResource = this.toBackupResource(identifier);
            return this.backups.has(backupResource);
        }
        async backup(identifier, content, versionId, meta, token) {
            const backupResource = this.toBackupResource(identifier);
            this.backups.set(backupResource, {
                typeId: identifier.typeId,
                content: content instanceof buffer_1.VSBuffer ? content : content ? (0, stream_1.isReadableStream)(content) ? await (0, buffer_1.streamToBuffer)(content) : (0, buffer_1.readableToBuffer)(content) : buffer_1.VSBuffer.fromString(''),
                meta
            });
        }
        async resolve(identifier) {
            const backupResource = this.toBackupResource(identifier);
            const backup = this.backups.get(backupResource);
            if (backup) {
                return { value: (0, buffer_1.bufferToStream)(backup.content), meta: backup.meta };
            }
            return undefined;
        }
        async getBackups() {
            return Array.from(this.backups.entries()).map(([resource, backup]) => ({ typeId: backup.typeId, resource }));
        }
        async discardBackup(identifier) {
            this.backups.delete(this.toBackupResource(identifier));
        }
        async discardBackups(filter) {
            const except = filter?.except;
            if (Array.isArray(except) && except.length > 0) {
                const exceptMap = new map_1.ResourceMap();
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
                this.backups.clear();
            }
        }
        toBackupResource(identifier) {
            return uri_1.URI.from({ scheme: network_1.Schemas.inMemory, path: hashIdentifier(identifier) });
        }
        async joinBackups() {
            return;
        }
    }
    exports.InMemoryWorkingCopyBackupService = InMemoryWorkingCopyBackupService;
    /*
     * Exported only for testing
     */
    function hashIdentifier(identifier) {
        // IMPORTANT: for backwards compatibility, ensure that
        // we ignore the `typeId` unless a value is provided.
        // To preserve previous backups without type id, we
        // need to just hash the resource. Otherwise we use
        // the type id as a seed to the resource path.
        let resource;
        if (identifier.typeId.length > 0) {
            const typeIdHash = hashString(identifier.typeId);
            if (identifier.resource.path) {
                resource = (0, resources_1.joinPath)(identifier.resource, typeIdHash);
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
    exports.hashIdentifier = hashIdentifier;
    function hashPath(resource) {
        const str = resource.scheme === network_1.Schemas.file || resource.scheme === network_1.Schemas.untitled ? resource.fsPath : resource.toString();
        return hashString(str);
    }
    function hashString(str) {
        return (0, hash_1.hash)(str).toString(16);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlCYWNrdXBTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtpbmdDb3B5L2NvbW1vbi93b3JraW5nQ29weUJhY2t1cFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW9CaEcsTUFBYSx1QkFBdUI7UUFJbkMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBZSxFQUFFLFdBQXlCO1lBQzdELE1BQU0sS0FBSyxHQUFHLElBQUksdUJBQXVCLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBRW5FLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRXRCLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELFlBQTRCLFVBQWUsRUFBVSxXQUF5QjtZQUFsRCxlQUFVLEdBQVYsVUFBVSxDQUFLO1lBQVUsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFWN0QsVUFBSyxHQUFHLElBQUksaUJBQVcsRUFBeUQsQ0FBQztRQVVoQixDQUFDO1FBRTNFLEtBQUssQ0FBQyxPQUFPO1lBQ3BCLElBQUk7Z0JBQ0gsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZFLElBQUksY0FBYyxDQUFDLFFBQVEsRUFBRTtvQkFDNUIsTUFBTSxnQkFBUSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUTt5QkFDNUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQzt5QkFDbEMsR0FBRyxDQUFDLEtBQUssRUFBQyxrQkFBa0IsRUFBQyxFQUFFO3dCQUUvQixvQ0FBb0M7d0JBQ3BDLE1BQU0sc0JBQXNCLEdBQUcsTUFBTSxJQUFJ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