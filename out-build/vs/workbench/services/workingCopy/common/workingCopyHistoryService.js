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
define(["require", "exports", "vs/nls!vs/workbench/services/workingCopy/common/workingCopyHistoryService", "vs/base/common/event", "vs/base/common/types", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/workingCopy/common/workingCopyHistoryTracker", "vs/base/common/lifecycle", "vs/workbench/services/workingCopy/common/workingCopyHistory", "vs/platform/files/common/files", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/uri", "vs/base/common/async", "vs/base/common/resources", "vs/workbench/services/environment/common/environmentService", "vs/base/common/hash", "vs/base/common/extpath", "vs/base/common/cancellation", "vs/base/common/map", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/label/common/label", "vs/base/common/buffer", "vs/platform/log/common/log", "vs/workbench/common/editor", "vs/platform/configuration/common/configuration", "vs/base/common/arrays", "vs/base/common/strings"], function (require, exports, nls_1, event_1, types_1, platform_1, contributions_1, lifecycle_1, workingCopyHistoryTracker_1, lifecycle_2, workingCopyHistory_1, files_1, remoteAgentService_1, uri_1, async_1, resources_1, environmentService_1, hash_1, extpath_1, cancellation_1, map_1, uriIdentity_1, label_1, buffer_1, log_1, editor_1, configuration_1, arrays_1, strings_1) {
    "use strict";
    var $r4b_1, $s4b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$s4b = exports.$r4b = exports.$q4b = void 0;
    class $q4b {
        static { this.ENTRIES_FILE = 'entries.json'; }
        static { this.a = editor_1.$SE.registerSource('default.source', (0, nls_1.localize)(0, null)); }
        static { this.b = {
            MAX_ENTRIES: 'workbench.localHistory.maxFileEntries',
            MERGE_PERIOD: 'workbench.localHistory.mergeWindow'
        }; }
        constructor(workingCopyResource, n, o, q, r, s, t, u, v, w, x) {
            this.n = n;
            this.o = o;
            this.q = q;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.v = v;
            this.w = w;
            this.x = x;
            this.c = [];
            this.d = undefined;
            this.f = undefined;
            this.g = undefined;
            this.h = undefined;
            this.i = undefined;
            this.j = undefined;
            this.k = 0;
            this.l = this.k;
            this.m = new async_1.$Mg(1);
            this.y(workingCopyResource);
        }
        y(workingCopyResource) {
            // Update working copy
            this.f = workingCopyResource;
            this.g = this.v.getUriBasenameLabel(workingCopyResource);
            this.j = new RegExp(`[A-Za-z0-9]{4}${(0, strings_1.$qe)((0, resources_1.$gg)(workingCopyResource))}`);
            // Update locations
            this.h = this.z(this.n, workingCopyResource);
            this.i = (0, resources_1.$ig)(this.h, $q4b.ENTRIES_FILE);
            // Reset entries and resolved cache
            this.c = [];
            this.d = undefined;
        }
        z(historyHome, workingCopyResource) {
            return (0, resources_1.$ig)(historyHome, (0, hash_1.$pi)(workingCopyResource.toString()).toString(16));
        }
        async addEntry(source = $q4b.a, timestamp = Date.now(), token) {
            let entryToReplace = undefined;
            // Figure out if the last entry should be replaced based
            // on settings that can define a interval for when an
            // entry is not added as new entry but should replace.
            // However, when save source is different, never replace.
            const lastEntry = (0, arrays_1.$Nb)(this.c);
            if (lastEntry && lastEntry.source === source) {
                const configuredReplaceInterval = this.x.getValue($q4b.b.MERGE_PERIOD, { resource: this.f });
                if (timestamp - lastEntry.timestamp <= (configuredReplaceInterval * 1000 /* convert to millies */)) {
                    entryToReplace = lastEntry;
                }
            }
            let entry;
            // Replace lastest entry in history
            if (entryToReplace) {
                entry = await this.B(entryToReplace, timestamp, token);
            }
            // Add entry to history
            else {
                entry = await this.A(source, timestamp, token);
            }
            // Flush now if configured
            if (this.t.flushOnChange && !token.isCancellationRequested) {
                await this.store(token);
            }
            return entry;
        }
        async A(source, timestamp, token) {
            const workingCopyResource = (0, types_1.$uf)(this.f);
            const workingCopyName = (0, types_1.$uf)(this.g);
            const historyEntriesFolder = (0, types_1.$uf)(this.h);
            // Perform a fast clone operation with minimal overhead to a new random location
            const id = `${(0, extpath_1.$Qf)(undefined, undefined, 4)}${(0, resources_1.$gg)(workingCopyResource)}`;
            const location = (0, resources_1.$ig)(historyEntriesFolder, id);
            await this.u.cloneFile(workingCopyResource, location);
            // Add to list of entries
            const entry = {
                id,
                workingCopy: { resource: workingCopyResource, name: workingCopyName },
                location,
                timestamp,
                source
            };
            this.c.push(entry);
            // Update version ID of model to use for storing later
            this.k++;
            // Events
            this.o.fire({ entry });
            return entry;
        }
        async B(entry, timestamp, token) {
            const workingCopyResource = (0, types_1.$uf)(this.f);
            // Perform a fast clone operation with minimal overhead to the existing location
            await this.u.cloneFile(workingCopyResource, entry.location);
            // Update entry
            entry.timestamp = timestamp;
            // Update version ID of model to use for storing later
            this.k++;
            // Events
            this.r.fire({ entry });
            return entry;
        }
        async removeEntry(entry, token) {
            // Make sure to await resolving when removing entries
            await this.C();
            if (token.isCancellationRequested) {
                return false;
            }
            const index = this.c.indexOf(entry);
            if (index === -1) {
                return false;
            }
            // Delete from disk
            await this.I(entry);
            // Remove from model
            this.c.splice(index, 1);
            // Update version ID of model to use for storing later
            this.k++;
            // Events
            this.s.fire({ entry });
            // Flush now if configured
            if (this.t.flushOnChange && !token.isCancellationRequested) {
                await this.store(token);
            }
            return true;
        }
        async updateEntry(entry, properties, token) {
            // Make sure to await resolving when updating entries
            await this.C();
            if (token.isCancellationRequested) {
                return;
            }
            const index = this.c.indexOf(entry);
            if (index === -1) {
                return;
            }
            // Update entry
            entry.source = properties.source;
            // Update version ID of model to use for storing later
            this.k++;
            // Events
            this.q.fire({ entry });
            // Flush now if configured
            if (this.t.flushOnChange && !token.isCancellationRequested) {
                await this.store(token);
            }
        }
        async getEntries() {
            // Make sure to await resolving when all entries are asked for
            await this.C();
            // Return as many entries as configured by user settings
            const configuredMaxEntries = this.x.getValue($q4b.b.MAX_ENTRIES, { resource: this.f });
            if (this.c.length > configuredMaxEntries) {
                return this.c.slice(this.c.length - configuredMaxEntries);
            }
            return this.c;
        }
        async hasEntries(skipResolve) {
            // Make sure to await resolving unless explicitly skipped
            if (!skipResolve) {
                await this.C();
            }
            return this.c.length > 0;
        }
        C() {
            if (!this.d) {
                this.d = this.D();
            }
            return this.d;
        }
        async D() {
            // Resolve from disk
            const entries = await this.E();
            // We now need to merge our in-memory entries with the
            // entries we have found on disk because it is possible
            // that new entries have been added before the entries
            // listing file was updated
            for (const entry of this.c) {
                entries.set(entry.id, entry);
            }
            // Set as entries, sorted by timestamp
            this.c = Array.from(entries.values()).sort((entryA, entryB) => entryA.timestamp - entryB.timestamp);
        }
        async E() {
            const workingCopyResource = (0, types_1.$uf)(this.f);
            const workingCopyName = (0, types_1.$uf)(this.g);
            const [entryListing, entryStats] = await Promise.all([
                // Resolve entries listing file
                this.K(),
                // Resolve children of history folder
                this.L()
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
                        source: $q4b.a
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
            const sourceHistoryEntriesFolder = (0, types_1.$uf)(this.h);
            const targetHistoryFolder = this.z(this.n, targetWorkingCopyResource);
            try {
                await this.u.move(sourceHistoryEntriesFolder, targetHistoryFolder, true);
            }
            catch (error) {
                if (!(error instanceof files_1.$nk && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */)) {
                    this.M(error);
                }
            }
            // Update our associated working copy
            this.y(targetWorkingCopyResource);
            // Add entry for the move
            await this.addEntry(source, undefined, token);
            // Store model again to updated location
            await this.store(token);
        }
        async store(token) {
            if (!this.F()) {
                return;
            }
            // Use a `Limiter` to prevent multiple `store` operations
            // potentially running at the same time
            await this.m.queue(async () => {
                if (token.isCancellationRequested || !this.F()) {
                    return;
                }
                return this.G(token);
            });
        }
        F() {
            return this.l !== this.k;
        }
        async G(token) {
            const historyEntriesFolder = (0, types_1.$uf)(this.h);
            // Make sure to await resolving when persisting
            await this.C();
            if (token.isCancellationRequested) {
                return undefined;
            }
            // Cleanup based on max-entries setting
            await this.H();
            // Without entries, remove the history folder
            const storedVersion = this.k;
            if (this.c.length === 0) {
                try {
                    await this.u.del(historyEntriesFolder, { recursive: true });
                }
                catch (error) {
                    this.M(error);
                }
            }
            // If we still have entries, update the entries meta file
            else {
                await this.J();
            }
            // Mark as stored version
            this.l = storedVersion;
        }
        async H() {
            const configuredMaxEntries = this.x.getValue($q4b.b.MAX_ENTRIES, { resource: this.f });
            if (this.c.length <= configuredMaxEntries) {
                return; // nothing to cleanup
            }
            const entriesToDelete = this.c.slice(0, this.c.length - configuredMaxEntries);
            const entriesToKeep = this.c.slice(this.c.length - configuredMaxEntries);
            // Delete entries from disk as instructed
            for (const entryToDelete of entriesToDelete) {
                await this.I(entryToDelete);
            }
            // Make sure to update our in-memory model as well
            // because it will be persisted right after
            this.c = entriesToKeep;
            // Events
            for (const entry of entriesToDelete) {
                this.s.fire({ entry });
            }
        }
        async I(entry) {
            try {
                await this.u.del(entry.location);
            }
            catch (error) {
                this.M(error);
            }
        }
        async J() {
            const workingCopyResource = (0, types_1.$uf)(this.f);
            const historyEntriesListingFile = (0, types_1.$uf)(this.i);
            const serializedModel = {
                version: 1,
                resource: workingCopyResource.toString(),
                entries: this.c.map(entry => {
                    return {
                        id: entry.id,
                        source: entry.source !== $q4b.a ? entry.source : undefined,
                        timestamp: entry.timestamp
                    };
                })
            };
            await this.u.writeFile(historyEntriesListingFile, buffer_1.$Fd.fromString(JSON.stringify(serializedModel)));
        }
        async K() {
            const historyEntriesListingFile = (0, types_1.$uf)(this.i);
            let serializedModel = undefined;
            try {
                serializedModel = JSON.parse((await this.u.readFile(historyEntriesListingFile)).value.toString());
            }
            catch (error) {
                if (!(error instanceof files_1.$nk && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */)) {
                    this.M(error);
                }
            }
            return serializedModel;
        }
        async L() {
            const historyEntriesFolder = (0, types_1.$uf)(this.h);
            const historyEntriesNameMatcher = (0, types_1.$uf)(this.j);
            let rawEntries = undefined;
            // Resolve children of folder on disk
            try {
                rawEntries = (await this.u.resolve(historyEntriesFolder, { resolveMetadata: true })).children;
            }
            catch (error) {
                if (!(error instanceof files_1.$nk && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */)) {
                    this.M(error);
                }
            }
            if (!rawEntries) {
                return undefined;
            }
            // Skip entries that do not seem to have valid file name
            return rawEntries.filter(entry => !(0, resources_1.$bg)(entry.resource, this.i) && // not the listings file
                historyEntriesNameMatcher.test(entry.name) // matching our expected file pattern for entries
            );
        }
        M(error) {
            this.w.trace('[Working Copy History Service]', error);
        }
    }
    exports.$q4b = $q4b;
    let $r4b = class $r4b extends lifecycle_2.$kc {
        static { $r4b_1 = this; }
        static { this.a = editor_1.$SE.registerSource('moved.source', (0, nls_1.localize)(1, null)); }
        static { this.b = editor_1.$SE.registerSource('renamed.source', (0, nls_1.localize)(2, null)); }
        constructor(s, t, u, w, y, z, C) {
            super();
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.c = this.B(new event_1.$fd());
            this.onDidAddEntry = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidChangeEntry = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidReplaceEntry = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidMoveEntries = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onDidRemoveEntry = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidRemoveEntries = this.m.event;
            this.n = new async_1.$2g();
            this.r = new map_1.$zi(resource => this.w.extUri.getComparisonKey(resource));
            this.D();
        }
        async D() {
            let historyHome = undefined;
            // Prefer history to be stored in the remote if we are connected to a remote
            try {
                const remoteEnv = await this.t.getEnvironment();
                if (remoteEnv) {
                    historyHome = remoteEnv.localHistoryHome;
                }
            }
            catch (error) {
                this.z.trace(error); // ignore and fallback to local
            }
            // But fallback to local if there is no remote
            if (!historyHome) {
                historyHome = this.u.localHistoryHome;
            }
            this.n.complete(historyHome);
        }
        async moveEntries(source, target) {
            const limiter = new async_1.$Mg(workingCopyHistory_1.$w1b);
            const promises = [];
            for (const [resource, model] of this.r) {
                if (!this.w.extUri.isEqualOrParent(resource, source)) {
                    continue; // model does not match moved resource
                }
                // Determine new resulting target resource
                let targetResource;
                if (this.w.extUri.isEqual(source, resource)) {
                    targetResource = target; // file got moved
                }
                else {
                    const index = (0, extpath_1.$Of)(resource.path, source.path);
                    targetResource = (0, resources_1.$ig)(target, resource.path.substr(index + source.path.length + 1)); // parent folder got moved
                }
                // Figure out save source
                let saveSource;
                if (this.w.extUri.isEqual((0, resources_1.$hg)(resource), (0, resources_1.$hg)(targetResource))) {
                    saveSource = $r4b_1.b;
                }
                else {
                    saveSource = $r4b_1.a;
                }
                // Move entries to target queued
                promises.push(limiter.queue(() => this.F(model, saveSource, resource, targetResource)));
            }
            if (!promises.length) {
                return [];
            }
            // Await move operations
            const resources = await Promise.all(promises);
            // Events
            this.h.fire();
            return resources;
        }
        async F(model, source, sourceWorkingCopyResource, targetWorkingCopyResource) {
            // Move to target via model
            await model.moveEntries(targetWorkingCopyResource, source, cancellation_1.CancellationToken.None);
            // Update model in our map
            this.r.delete(sourceWorkingCopyResource);
            this.r.set(targetWorkingCopyResource, model);
            return targetWorkingCopyResource;
        }
        async addEntry({ resource, source, timestamp }, token) {
            if (!this.s.hasProvider(resource)) {
                return undefined; // we require the working copy resource to be file service accessible
            }
            // Resolve history model for working copy
            const model = await this.G(resource);
            if (token.isCancellationRequested) {
                return undefined;
            }
            // Add to model
            return model.addEntry(source, timestamp, token);
        }
        async updateEntry(entry, properties, token) {
            // Resolve history model for working copy
            const model = await this.G(entry.workingCopy.resource);
            if (token.isCancellationRequested) {
                return;
            }
            // Rename in model
            return model.updateEntry(entry, properties, token);
        }
        async removeEntry(entry, token) {
            // Resolve history model for working copy
            const model = await this.G(entry.workingCopy.resource);
            if (token.isCancellationRequested) {
                return false;
            }
            // Remove from model
            return model.removeEntry(entry, token);
        }
        async removeAll(token) {
            const historyHome = await this.n.p;
            if (token.isCancellationRequested) {
                return;
            }
            // Clear models
            this.r.clear();
            // Remove from disk
            await this.s.del(historyHome, { recursive: true });
            // Events
            this.m.fire();
        }
        async getEntries(resource, token) {
            const model = await this.G(resource);
            if (token.isCancellationRequested) {
                return [];
            }
            const entries = await model.getEntries();
            return entries ?? [];
        }
        async getAll(token) {
            const historyHome = await this.n.p;
            if (token.isCancellationRequested) {
                return [];
            }
            const all = new map_1.$zi();
            // Fill in all known model resources (they might not have yet persisted to disk)
            for (const [resource, model] of this.r) {
                const hasInMemoryEntries = await model.hasEntries(true /* skip resolving because we resolve below from disk */);
                if (hasInMemoryEntries) {
                    all.set(resource, true);
                }
            }
            // Resolve all other resources by iterating the history home folder
            try {
                const resolvedHistoryHome = await this.s.resolve(historyHome);
                if (resolvedHistoryHome.children) {
                    const limiter = new async_1.$Mg(workingCopyHistory_1.$w1b);
                    const promises = [];
                    for (const child of resolvedHistoryHome.children) {
                        promises.push(limiter.queue(async () => {
                            if (token.isCancellationRequested) {
                                return;
                            }
                            try {
                                const serializedModel = JSON.parse((await this.s.readFile((0, resources_1.$ig)(child.resource, $q4b.ENTRIES_FILE))).value.toString());
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
        async G(resource) {
            const historyHome = await this.n.p;
            let model = this.r.get(resource);
            if (!model) {
                model = new $q4b(resource, historyHome, this.c, this.f, this.g, this.j, this.H(), this.s, this.y, this.z, this.C);
                this.r.set(resource, model);
            }
            return model;
        }
    };
    exports.$r4b = $r4b;
    exports.$r4b = $r4b = $r4b_1 = __decorate([
        __param(0, files_1.$6j),
        __param(1, remoteAgentService_1.$jm),
        __param(2, environmentService_1.$hJ),
        __param(3, uriIdentity_1.$Ck),
        __param(4, label_1.$Vz),
        __param(5, log_1.$5i),
        __param(6, configuration_1.$8h)
    ], $r4b);
    let $s4b = class $s4b extends $r4b {
        static { $s4b_1 = this; }
        static { this.I = 5 * 60 * 1000; } // 5min
        constructor(fileService, remoteAgentService, environmentService, uriIdentityService, labelService, N, logService, configurationService) {
            super(fileService, remoteAgentService, environmentService, uriIdentityService, labelService, logService, configurationService);
            this.N = N;
            this.J = typeof this.u.remoteAuthority === 'string';
            this.L = this.B(new cancellation_1.$pd());
            this.M = this.B(new async_1.$Sg(() => this.S(this.L.token), $s4b_1.I));
            this.O();
        }
        O() {
            if (!this.J) {
                // Local: persist all on shutdown
                this.B(this.N.onWillShutdown(e => this.Q(e)));
                // Local: schedule persist on change
                this.B(event_1.Event.any(this.onDidAddEntry, this.onDidChangeEntry, this.onDidReplaceEntry, this.onDidRemoveEntry)(() => this.R()));
            }
        }
        H() {
            return { flushOnChange: this.J /* because the connection might drop anytime */ };
        }
        Q(e) {
            // Dispose the scheduler...
            this.M.dispose();
            this.L.dispose(true);
            // ...because we now explicitly store all models
            e.join(this.S(e.token), { id: 'join.workingCopyHistory', label: (0, nls_1.localize)(3, null) });
        }
        R() {
            if (!this.M.isScheduled()) {
                this.M.schedule();
            }
        }
        async S(token) {
            const limiter = new async_1.$Mg(workingCopyHistory_1.$w1b);
            const promises = [];
            const models = Array.from(this.r.values());
            for (const model of models) {
                promises.push(limiter.queue(async () => {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    try {
                        await model.store(token);
                    }
                    catch (error) {
                        this.z.trace(error);
                    }
                }));
            }
            await Promise.all(promises);
        }
    };
    exports.$s4b = $s4b;
    exports.$s4b = $s4b = $s4b_1 = __decorate([
        __param(0, files_1.$6j),
        __param(1, remoteAgentService_1.$jm),
        __param(2, environmentService_1.$hJ),
        __param(3, uriIdentity_1.$Ck),
        __param(4, label_1.$Vz),
        __param(5, lifecycle_1.$7y),
        __param(6, log_1.$5i),
        __param(7, configuration_1.$8h)
    ], $s4b);
    // Register History Tracker
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(workingCopyHistoryTracker_1.$p4b, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=workingCopyHistoryService.js.map