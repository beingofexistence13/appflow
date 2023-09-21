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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/types", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/workingCopy/common/workingCopyHistoryTracker", "vs/base/common/lifecycle", "vs/workbench/services/workingCopy/common/workingCopyHistory", "vs/platform/files/common/files", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/uri", "vs/base/common/async", "vs/base/common/resources", "vs/workbench/services/environment/common/environmentService", "vs/base/common/hash", "vs/base/common/extpath", "vs/base/common/cancellation", "vs/base/common/map", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/label/common/label", "vs/base/common/buffer", "vs/platform/log/common/log", "vs/workbench/common/editor", "vs/platform/configuration/common/configuration", "vs/base/common/arrays", "vs/base/common/strings"], function (require, exports, nls_1, event_1, types_1, platform_1, contributions_1, lifecycle_1, workingCopyHistoryTracker_1, lifecycle_2, workingCopyHistory_1, files_1, remoteAgentService_1, uri_1, async_1, resources_1, environmentService_1, hash_1, extpath_1, cancellation_1, map_1, uriIdentity_1, label_1, buffer_1, log_1, editor_1, configuration_1, arrays_1, strings_1) {
    "use strict";
    var WorkingCopyHistoryService_1, NativeWorkingCopyHistoryService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeWorkingCopyHistoryService = exports.WorkingCopyHistoryService = exports.WorkingCopyHistoryModel = void 0;
    class WorkingCopyHistoryModel {
        static { this.ENTRIES_FILE = 'entries.json'; }
        static { this.FILE_SAVED_SOURCE = editor_1.SaveSourceRegistry.registerSource('default.source', (0, nls_1.localize)('default.source', "File Saved")); }
        static { this.SETTINGS = {
            MAX_ENTRIES: 'workbench.localHistory.maxFileEntries',
            MERGE_PERIOD: 'workbench.localHistory.mergeWindow'
        }; }
        constructor(workingCopyResource, historyHome, entryAddedEmitter, entryChangedEmitter, entryReplacedEmitter, entryRemovedEmitter, options, fileService, labelService, logService, configurationService) {
            this.historyHome = historyHome;
            this.entryAddedEmitter = entryAddedEmitter;
            this.entryChangedEmitter = entryChangedEmitter;
            this.entryReplacedEmitter = entryReplacedEmitter;
            this.entryRemovedEmitter = entryRemovedEmitter;
            this.options = options;
            this.fileService = fileService;
            this.labelService = labelService;
            this.logService = logService;
            this.configurationService = configurationService;
            this.entries = [];
            this.whenResolved = undefined;
            this.workingCopyResource = undefined;
            this.workingCopyName = undefined;
            this.historyEntriesFolder = undefined;
            this.historyEntriesListingFile = undefined;
            this.historyEntriesNameMatcher = undefined;
            this.versionId = 0;
            this.storedVersionId = this.versionId;
            this.storeLimiter = new async_1.Limiter(1);
            this.setWorkingCopy(workingCopyResource);
        }
        setWorkingCopy(workingCopyResource) {
            // Update working copy
            this.workingCopyResource = workingCopyResource;
            this.workingCopyName = this.labelService.getUriBasenameLabel(workingCopyResource);
            this.historyEntriesNameMatcher = new RegExp(`[A-Za-z0-9]{4}${(0, strings_1.escapeRegExpCharacters)((0, resources_1.extname)(workingCopyResource))}`);
            // Update locations
            this.historyEntriesFolder = this.toHistoryEntriesFolder(this.historyHome, workingCopyResource);
            this.historyEntriesListingFile = (0, resources_1.joinPath)(this.historyEntriesFolder, WorkingCopyHistoryModel.ENTRIES_FILE);
            // Reset entries and resolved cache
            this.entries = [];
            this.whenResolved = undefined;
        }
        toHistoryEntriesFolder(historyHome, workingCopyResource) {
            return (0, resources_1.joinPath)(historyHome, (0, hash_1.hash)(workingCopyResource.toString()).toString(16));
        }
        async addEntry(source = WorkingCopyHistoryModel.FILE_SAVED_SOURCE, timestamp = Date.now(), token) {
            let entryToReplace = undefined;
            // Figure out if the last entry should be replaced based
            // on settings that can define a interval for when an
            // entry is not added as new entry but should replace.
            // However, when save source is different, never replace.
            const lastEntry = (0, arrays_1.lastOrDefault)(this.entries);
            if (lastEntry && lastEntry.source === source) {
                const configuredReplaceInterval = this.configurationService.getValue(WorkingCopyHistoryModel.SETTINGS.MERGE_PERIOD, { resource: this.workingCopyResource });
                if (timestamp - lastEntry.timestamp <= (configuredReplaceInterval * 1000 /* convert to millies */)) {
                    entryToReplace = lastEntry;
                }
            }
            let entry;
            // Replace lastest entry in history
            if (entryToReplace) {
                entry = await this.doReplaceEntry(entryToReplace, timestamp, token);
            }
            // Add entry to history
            else {
                entry = await this.doAddEntry(source, timestamp, token);
            }
            // Flush now if configured
            if (this.options.flushOnChange && !token.isCancellationRequested) {
                await this.store(token);
            }
            return entry;
        }
        async doAddEntry(source, timestamp, token) {
            const workingCopyResource = (0, types_1.assertIsDefined)(this.workingCopyResource);
            const workingCopyName = (0, types_1.assertIsDefined)(this.workingCopyName);
            const historyEntriesFolder = (0, types_1.assertIsDefined)(this.historyEntriesFolder);
            // Perform a fast clone operation with minimal overhead to a new random location
            const id = `${(0, extpath_1.randomPath)(undefined, undefined, 4)}${(0, resources_1.extname)(workingCopyResource)}`;
            const location = (0, resources_1.joinPath)(historyEntriesFolder, id);
            await this.fileService.cloneFile(workingCopyResource, location);
            // Add to list of entries
            const entry = {
                id,
                workingCopy: { resource: workingCopyResource, name: workingCopyName },
                location,
                timestamp,
                source
            };
            this.entries.push(entry);
            // Update version ID of model to use for storing later
            this.versionId++;
            // Events
            this.entryAddedEmitter.fire({ entry });
            return entry;
        }
        async doReplaceEntry(entry, timestamp, token) {
            const workingCopyResource = (0, types_1.assertIsDefined)(this.workingCopyResource);
            // Perform a fast clone operation with minimal overhead to the existing location
            await this.fileService.cloneFile(workingCopyResource, entry.location);
            // Update entry
            entry.timestamp = timestamp;
            // Update version ID of model to use for storing later
            this.versionId++;
            // Events
            this.entryReplacedEmitter.fire({ entry });
            return entry;
        }
        async removeEntry(entry, token) {
            // Make sure to await resolving when removing entries
            await this.resolveEntriesOnce();
            if (token.isCancellationRequested) {
                return false;
            }
            const index = this.entries.indexOf(entry);
            if (index === -1) {
                return false;
            }
            // Delete from disk
            await this.deleteEntry(entry);
            // Remove from model
            this.entries.splice(index, 1);
            // Update version ID of model to use for storing later
            this.versionId++;
            // Events
            this.entryRemovedEmitter.fire({ entry });
            // Flush now if configured
            if (this.options.flushOnChange && !token.isCancellationRequested) {
                await this.store(token);
            }
            return true;
        }
        async updateEntry(entry, properties, token) {
            // Make sure to await resolving when updating entries
            await this.resolveEntriesOnce();
            if (token.isCancellationRequested) {
                return;
            }
            const index = this.entries.indexOf(entry);
            if (index === -1) {
                return;
            }
            // Update entry
            entry.source = properties.source;
            // Update version ID of model to use for storing later
            this.versionId++;
            // Events
            this.entryChangedEmitter.fire({ entry });
            // Flush now if configured
            if (this.options.flushOnChange && !token.isCancellationRequested) {
                await this.store(token);
            }
        }
        async getEntries() {
            // Make sure to await resolving when all entries are asked for
            await this.resolveEntriesOnce();
            // Return as many entries as configured by user settings
            const configuredMaxEntries = this.configurationService.getValue(WorkingCopyHistoryModel.SETTINGS.MAX_ENTRIES, { resource: this.workingCopyResource });
            if (this.entries.length > configuredMaxEntries) {
                return this.entries.slice(this.entries.length - configuredMaxEntries);
            }
            return this.entries;
        }
        async hasEntries(skipResolve) {
            // Make sure to await resolving unless explicitly skipped
            if (!skipResolve) {
                await this.resolveEntriesOnce();
            }
            return this.entries.length > 0;
        }
        resolveEntriesOnce() {
            if (!this.whenResolved) {
                this.whenResolved = this.doResolveEntries();
            }
            return this.whenResolved;
        }
        async doResolveEntries() {
            // Resolve from disk
            const entries = await this.resolveEntriesFromDisk();
            // We now need to merge our in-memory entries with the
            // entries we have found on disk because it is possible
            // that new entries have been added before the entries
            // listing file was updated
            for (const entry of this.entries) {
                entries.set(entry.id, entry);
            }
            // Set as entries, sorted by timestamp
            this.entries = Array.from(entries.values()).sort((entryA, entryB) => entryA.timestamp - entryB.timestamp);
        }
        async resolveEntriesFromDisk() {
            const workingCopyResource = (0, types_1.assertIsDefined)(this.workingCopyResource);
            const workingCopyName = (0, types_1.assertIsDefined)(this.workingCopyName);
            const [entryListing, entryStats] = await Promise.all([
                // Resolve entries listing file
                this.readEntriesFile(),
                // Resolve children of history folder
                this.readEntriesFolder()
            ]);
            // Add from raw folder children
            const entries = new Map();
            if (entryStats) {
                for (const entryStat of entryStats) {
                    entries.set(entryStat.name, {
                        id: entryStat.name,
                        workingCopy: { resource: workingCopyResource, name: workingCopyName },
                        location: entryStat.resource,
                        timestamp: entryStat.mtime,
                        source: WorkingCopyHistoryModel.FILE_SAVED_SOURCE
                    });
                }
            }
            // Update from listing (to have more specific metadata)
            if (entryListing) {
                for (const entry of entryListing.entries) {
                    const existingEntry = entries.get(entry.id);
                    if (existingEntry) {
                        entries.set(entry.id, {
                            ...existingEntry,
                            timestamp: entry.timestamp,
                            source: entry.source ?? existingEntry.source
                        });
                    }
                }
            }
            return entries;
        }
        async moveEntries(targetWorkingCopyResource, source, token) {
            // Ensure model stored so that any pending data is flushed
            await this.store(token);
            if (token.isCancellationRequested) {
                return undefined;
            }
            // Rename existing entries folder
            const sourceHistoryEntriesFolder = (0, types_1.assertIsDefined)(this.historyEntriesFolder);
            const targetHistoryFolder = this.toHistoryEntriesFolder(this.historyHome, targetWorkingCopyResource);
            try {
                await this.fileService.move(sourceHistoryEntriesFolder, targetHistoryFolder, true);
            }
            catch (error) {
                if (!(error instanceof files_1.FileOperationError && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */)) {
                    this.traceError(error);
                }
            }
            // Update our associated working copy
            this.setWorkingCopy(targetWorkingCopyResource);
            // Add entry for the move
            await this.addEntry(source, undefined, token);
            // Store model again to updated location
            await this.store(token);
        }
        async store(token) {
            if (!this.shouldStore()) {
                return;
            }
            // Use a `Limiter` to prevent multiple `store` operations
            // potentially running at the same time
            await this.storeLimiter.queue(async () => {
                if (token.isCancellationRequested || !this.shouldStore()) {
                    return;
                }
                return this.doStore(token);
            });
        }
        shouldStore() {
            return this.storedVersionId !== this.versionId;
        }
        async doStore(token) {
            const historyEntriesFolder = (0, types_1.assertIsDefined)(this.historyEntriesFolder);
            // Make sure to await resolving when persisting
            await this.resolveEntriesOnce();
            if (token.isCancellationRequested) {
                return undefined;
            }
            // Cleanup based on max-entries setting
            await this.cleanUpEntries();
            // Without entries, remove the history folder
            const storedVersion = this.versionId;
            if (this.entries.length === 0) {
                try {
                    await this.fileService.del(historyEntriesFolder, { recursive: true });
                }
                catch (error) {
                    this.traceError(error);
                }
            }
            // If we still have entries, update the entries meta file
            else {
                await this.writeEntriesFile();
            }
            // Mark as stored version
            this.storedVersionId = storedVersion;
        }
        async cleanUpEntries() {
            const configuredMaxEntries = this.configurationService.getValue(WorkingCopyHistoryModel.SETTINGS.MAX_ENTRIES, { resource: this.workingCopyResource });
            if (this.entries.length <= configuredMaxEntries) {
                return; // nothing to cleanup
            }
            const entriesToDelete = this.entries.slice(0, this.entries.length - configuredMaxEntries);
            const entriesToKeep = this.entries.slice(this.entries.length - configuredMaxEntries);
            // Delete entries from disk as instructed
            for (const entryToDelete of entriesToDelete) {
                await this.deleteEntry(entryToDelete);
            }
            // Make sure to update our in-memory model as well
            // because it will be persisted right after
            this.entries = entriesToKeep;
            // Events
            for (const entry of entriesToDelete) {
                this.entryRemovedEmitter.fire({ entry });
            }
        }
        async deleteEntry(entry) {
            try {
                await this.fileService.del(entry.location);
            }
            catch (error) {
                this.traceError(error);
            }
        }
        async writeEntriesFile() {
            const workingCopyResource = (0, types_1.assertIsDefined)(this.workingCopyResource);
            const historyEntriesListingFile = (0, types_1.assertIsDefined)(this.historyEntriesListingFile);
            const serializedModel = {
                version: 1,
                resource: workingCopyResource.toString(),
                entries: this.entries.map(entry => {
                    return {
                        id: entry.id,
                        source: entry.source !== WorkingCopyHistoryModel.FILE_SAVED_SOURCE ? entry.source : undefined,
                        timestamp: entry.timestamp
                    };
                })
            };
            await this.fileService.writeFile(historyEntriesListingFile, buffer_1.VSBuffer.fromString(JSON.stringify(serializedModel)));
        }
        async readEntriesFile() {
            const historyEntriesListingFile = (0, types_1.assertIsDefined)(this.historyEntriesListingFile);
            let serializedModel = undefined;
            try {
                serializedModel = JSON.parse((await this.fileService.readFile(historyEntriesListingFile)).value.toString());
            }
            catch (error) {
                if (!(error instanceof files_1.FileOperationError && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */)) {
                    this.traceError(error);
                }
            }
            return serializedModel;
        }
        async readEntriesFolder() {
            const historyEntriesFolder = (0, types_1.assertIsDefined)(this.historyEntriesFolder);
            const historyEntriesNameMatcher = (0, types_1.assertIsDefined)(this.historyEntriesNameMatcher);
            let rawEntries = undefined;
            // Resolve children of folder on disk
            try {
                rawEntries = (await this.fileService.resolve(historyEntriesFolder, { resolveMetadata: true })).children;
            }
            catch (error) {
                if (!(error instanceof files_1.FileOperationError && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */)) {
                    this.traceError(error);
                }
            }
            if (!rawEntries) {
                return undefined;
            }
            // Skip entries that do not seem to have valid file name
            return rawEntries.filter(entry => !(0, resources_1.isEqual)(entry.resource, this.historyEntriesListingFile) && // not the listings file
                historyEntriesNameMatcher.test(entry.name) // matching our expected file pattern for entries
            );
        }
        traceError(error) {
            this.logService.trace('[Working Copy History Service]', error);
        }
    }
    exports.WorkingCopyHistoryModel = WorkingCopyHistoryModel;
    let WorkingCopyHistoryService = class WorkingCopyHistoryService extends lifecycle_2.Disposable {
        static { WorkingCopyHistoryService_1 = this; }
        static { this.FILE_MOVED_SOURCE = editor_1.SaveSourceRegistry.registerSource('moved.source', (0, nls_1.localize)('moved.source', "File Moved")); }
        static { this.FILE_RENAMED_SOURCE = editor_1.SaveSourceRegistry.registerSource('renamed.source', (0, nls_1.localize)('renamed.source', "File Renamed")); }
        constructor(fileService, remoteAgentService, environmentService, uriIdentityService, labelService, logService, configurationService) {
            super();
            this.fileService = fileService;
            this.remoteAgentService = remoteAgentService;
            this.environmentService = environmentService;
            this.uriIdentityService = uriIdentityService;
            this.labelService = labelService;
            this.logService = logService;
            this.configurationService = configurationService;
            this._onDidAddEntry = this._register(new event_1.Emitter());
            this.onDidAddEntry = this._onDidAddEntry.event;
            this._onDidChangeEntry = this._register(new event_1.Emitter());
            this.onDidChangeEntry = this._onDidChangeEntry.event;
            this._onDidReplaceEntry = this._register(new event_1.Emitter());
            this.onDidReplaceEntry = this._onDidReplaceEntry.event;
            this._onDidMoveEntries = this._register(new event_1.Emitter());
            this.onDidMoveEntries = this._onDidMoveEntries.event;
            this._onDidRemoveEntry = this._register(new event_1.Emitter());
            this.onDidRemoveEntry = this._onDidRemoveEntry.event;
            this._onDidRemoveEntries = this._register(new event_1.Emitter());
            this.onDidRemoveEntries = this._onDidRemoveEntries.event;
            this.localHistoryHome = new async_1.DeferredPromise();
            this.models = new map_1.ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
            this.resolveLocalHistoryHome();
        }
        async resolveLocalHistoryHome() {
            let historyHome = undefined;
            // Prefer history to be stored in the remote if we are connected to a remote
            try {
                const remoteEnv = await this.remoteAgentService.getEnvironment();
                if (remoteEnv) {
                    historyHome = remoteEnv.localHistoryHome;
                }
            }
            catch (error) {
                this.logService.trace(error); // ignore and fallback to local
            }
            // But fallback to local if there is no remote
            if (!historyHome) {
                historyHome = this.environmentService.localHistoryHome;
            }
            this.localHistoryHome.complete(historyHome);
        }
        async moveEntries(source, target) {
            const limiter = new async_1.Limiter(workingCopyHistory_1.MAX_PARALLEL_HISTORY_IO_OPS);
            const promises = [];
            for (const [resource, model] of this.models) {
                if (!this.uriIdentityService.extUri.isEqualOrParent(resource, source)) {
                    continue; // model does not match moved resource
                }
                // Determine new resulting target resource
                let targetResource;
                if (this.uriIdentityService.extUri.isEqual(source, resource)) {
                    targetResource = target; // file got moved
                }
                else {
                    const index = (0, extpath_1.indexOfPath)(resource.path, source.path);
                    targetResource = (0, resources_1.joinPath)(target, resource.path.substr(index + source.path.length + 1)); // parent folder got moved
                }
                // Figure out save source
                let saveSource;
                if (this.uriIdentityService.extUri.isEqual((0, resources_1.dirname)(resource), (0, resources_1.dirname)(targetResource))) {
                    saveSource = WorkingCopyHistoryService_1.FILE_RENAMED_SOURCE;
                }
                else {
                    saveSource = WorkingCopyHistoryService_1.FILE_MOVED_SOURCE;
                }
                // Move entries to target queued
                promises.push(limiter.queue(() => this.doMoveEntries(model, saveSource, resource, targetResource)));
            }
            if (!promises.length) {
                return [];
            }
            // Await move operations
            const resources = await Promise.all(promises);
            // Events
            this._onDidMoveEntries.fire();
            return resources;
        }
        async doMoveEntries(model, source, sourceWorkingCopyResource, targetWorkingCopyResource) {
            // Move to target via model
            await model.moveEntries(targetWorkingCopyResource, source, cancellation_1.CancellationToken.None);
            // Update model in our map
            this.models.delete(sourceWorkingCopyResource);
            this.models.set(targetWorkingCopyResource, model);
            return targetWorkingCopyResource;
        }
        async addEntry({ resource, source, timestamp }, token) {
            if (!this.fileService.hasProvider(resource)) {
                return undefined; // we require the working copy resource to be file service accessible
            }
            // Resolve history model for working copy
            const model = await this.getModel(resource);
            if (token.isCancellationRequested) {
                return undefined;
            }
            // Add to model
            return model.addEntry(source, timestamp, token);
        }
        async updateEntry(entry, properties, token) {
            // Resolve history model for working copy
            const model = await this.getModel(entry.workingCopy.resource);
            if (token.isCancellationRequested) {
                return;
            }
            // Rename in model
            return model.updateEntry(entry, properties, token);
        }
        async removeEntry(entry, token) {
            // Resolve history model for working copy
            const model = await this.getModel(entry.workingCopy.resource);
            if (token.isCancellationRequested) {
                return false;
            }
            // Remove from model
            return model.removeEntry(entry, token);
        }
        async removeAll(token) {
            const historyHome = await this.localHistoryHome.p;
            if (token.isCancellationRequested) {
                return;
            }
            // Clear models
            this.models.clear();
            // Remove from disk
            await this.fileService.del(historyHome, { recursive: true });
            // Events
            this._onDidRemoveEntries.fire();
        }
        async getEntries(resource, token) {
            const model = await this.getModel(resource);
            if (token.isCancellationRequested) {
                return [];
            }
            const entries = await model.getEntries();
            return entries ?? [];
        }
        async getAll(token) {
            const historyHome = await this.localHistoryHome.p;
            if (token.isCancellationRequested) {
                return [];
            }
            const all = new map_1.ResourceMap();
            // Fill in all known model resources (they might not have yet persisted to disk)
            for (const [resource, model] of this.models) {
                const hasInMemoryEntries = await model.hasEntries(true /* skip resolving because we resolve below from disk */);
                if (hasInMemoryEntries) {
                    all.set(resource, true);
                }
            }
            // Resolve all other resources by iterating the history home folder
            try {
                const resolvedHistoryHome = await this.fileService.resolve(historyHome);
                if (resolvedHistoryHome.children) {
                    const limiter = new async_1.Limiter(workingCopyHistory_1.MAX_PARALLEL_HISTORY_IO_OPS);
                    const promises = [];
                    for (const child of resolvedHistoryHome.children) {
                        promises.push(limiter.queue(async () => {
                            if (token.isCancellationRequested) {
                                return;
                            }
                            try {
                                const serializedModel = JSON.parse((await this.fileService.readFile((0, resources_1.joinPath)(child.resource, WorkingCopyHistoryModel.ENTRIES_FILE))).value.toString());
                                if (serializedModel.entries.length > 0) {
                                    all.set(uri_1.URI.parse(serializedModel.resource), true);
                                }
                            }
                            catch (error) {
                                // ignore - model might be missing or corrupt, but we need it
                            }
                        }));
                    }
                    await Promise.all(promises);
                }
            }
            catch (error) {
                // ignore - history might be entirely empty
            }
            return Array.from(all.keys());
        }
        async getModel(resource) {
            const historyHome = await this.localHistoryHome.p;
            let model = this.models.get(resource);
            if (!model) {
                model = new WorkingCopyHistoryModel(resource, historyHome, this._onDidAddEntry, this._onDidChangeEntry, this._onDidReplaceEntry, this._onDidRemoveEntry, this.getModelOptions(), this.fileService, this.labelService, this.logService, this.configurationService);
                this.models.set(resource, model);
            }
            return model;
        }
    };
    exports.WorkingCopyHistoryService = WorkingCopyHistoryService;
    exports.WorkingCopyHistoryService = WorkingCopyHistoryService = WorkingCopyHistoryService_1 = __decorate([
        __param(0, files_1.IFileService),
        __param(1, remoteAgentService_1.IRemoteAgentService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, uriIdentity_1.IUriIdentityService),
        __param(4, label_1.ILabelService),
        __param(5, log_1.ILogService),
        __param(6, configuration_1.IConfigurationService)
    ], WorkingCopyHistoryService);
    let NativeWorkingCopyHistoryService = class NativeWorkingCopyHistoryService extends WorkingCopyHistoryService {
        static { NativeWorkingCopyHistoryService_1 = this; }
        static { this.STORE_ALL_INTERVAL = 5 * 60 * 1000; } // 5min
        constructor(fileService, remoteAgentService, environmentService, uriIdentityService, labelService, lifecycleService, logService, configurationService) {
            super(fileService, remoteAgentService, environmentService, uriIdentityService, labelService, logService, configurationService);
            this.lifecycleService = lifecycleService;
            this.isRemotelyStored = typeof this.environmentService.remoteAuthority === 'string';
            this.storeAllCts = this._register(new cancellation_1.CancellationTokenSource());
            this.storeAllScheduler = this._register(new async_1.RunOnceScheduler(() => this.storeAll(this.storeAllCts.token), NativeWorkingCopyHistoryService_1.STORE_ALL_INTERVAL));
            this.registerListeners();
        }
        registerListeners() {
            if (!this.isRemotelyStored) {
                // Local: persist all on shutdown
                this._register(this.lifecycleService.onWillShutdown(e => this.onWillShutdown(e)));
                // Local: schedule persist on change
                this._register(event_1.Event.any(this.onDidAddEntry, this.onDidChangeEntry, this.onDidReplaceEntry, this.onDidRemoveEntry)(() => this.onDidChangeModels()));
            }
        }
        getModelOptions() {
            return { flushOnChange: this.isRemotelyStored /* because the connection might drop anytime */ };
        }
        onWillShutdown(e) {
            // Dispose the scheduler...
            this.storeAllScheduler.dispose();
            this.storeAllCts.dispose(true);
            // ...because we now explicitly store all models
            e.join(this.storeAll(e.token), { id: 'join.workingCopyHistory', label: (0, nls_1.localize)('join.workingCopyHistory', "Saving local history") });
        }
        onDidChangeModels() {
            if (!this.storeAllScheduler.isScheduled()) {
                this.storeAllScheduler.schedule();
            }
        }
        async storeAll(token) {
            const limiter = new async_1.Limiter(workingCopyHistory_1.MAX_PARALLEL_HISTORY_IO_OPS);
            const promises = [];
            const models = Array.from(this.models.values());
            for (const model of models) {
                promises.push(limiter.queue(async () => {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    try {
                        await model.store(token);
                    }
                    catch (error) {
                        this.logService.trace(error);
                    }
                }));
            }
            await Promise.all(promises);
        }
    };
    exports.NativeWorkingCopyHistoryService = NativeWorkingCopyHistoryService;
    exports.NativeWorkingCopyHistoryService = NativeWorkingCopyHistoryService = NativeWorkingCopyHistoryService_1 = __decorate([
        __param(0, files_1.IFileService),
        __param(1, remoteAgentService_1.IRemoteAgentService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, uriIdentity_1.IUriIdentityService),
        __param(4, label_1.ILabelService),
        __param(5, lifecycle_1.ILifecycleService),
        __param(6, log_1.ILogService),
        __param(7, configuration_1.IConfigurationService)
    ], NativeWorkingCopyHistoryService);
    // Register History Tracker
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(workingCopyHistoryTracker_1.WorkingCopyHistoryTracker, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlIaXN0b3J5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy93b3JraW5nQ29weS9jb21tb24vd29ya2luZ0NvcHlIaXN0b3J5U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcURoRyxNQUFhLHVCQUF1QjtpQkFFbkIsaUJBQVksR0FBRyxjQUFjLEFBQWpCLENBQWtCO2lCQUV0QixzQkFBaUIsR0FBRywyQkFBa0IsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDLENBQUMsQUFBaEcsQ0FBaUc7aUJBRWxILGFBQVEsR0FBRztZQUNsQyxXQUFXLEVBQUUsdUNBQXVDO1lBQ3BELFlBQVksRUFBRSxvQ0FBb0M7U0FDbEQsQUFIK0IsQ0FHOUI7UUFtQkYsWUFDQyxtQkFBd0IsRUFDUCxXQUFnQixFQUNoQixpQkFBb0QsRUFDcEQsbUJBQXNELEVBQ3RELG9CQUF1RCxFQUN2RCxtQkFBc0QsRUFDdEQsT0FBd0MsRUFDeEMsV0FBeUIsRUFDekIsWUFBMkIsRUFDM0IsVUFBdUIsRUFDdkIsb0JBQTJDO1lBVDNDLGdCQUFXLEdBQVgsV0FBVyxDQUFLO1lBQ2hCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUM7WUFDcEQsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFtQztZQUN0RCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQW1DO1lBQ3ZELHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBbUM7WUFDdEQsWUFBTyxHQUFQLE9BQU8sQ0FBaUM7WUFDeEMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDekIsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDM0IsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUN2Qix5QkFBb0IsR0FBcEIsb0JB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