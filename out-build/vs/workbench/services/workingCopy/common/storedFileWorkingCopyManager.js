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
define(["require", "exports", "vs/nls!vs/workbench/services/workingCopy/common/storedFileWorkingCopyManager", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/services/workingCopy/common/storedFileWorkingCopy", "vs/base/common/map", "vs/base/common/async", "vs/platform/files/common/files", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/uri", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/base/common/resources", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/cancellation", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/workingCopy/common/abstractFileWorkingCopyManager", "vs/platform/notification/common/notification", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/platform", "vs/base/common/errors"], function (require, exports, nls_1, lifecycle_1, event_1, storedFileWorkingCopy_1, map_1, async_1, files_1, lifecycle_2, uri_1, label_1, log_1, resources_1, workingCopyFileService_1, uriIdentity_1, cancellation_1, workingCopyBackup_1, abstractFileWorkingCopyManager_1, notification_1, editorService_1, elevatedFileService_1, filesConfigurationService_1, workingCopyEditorService_1, workingCopyService_1, platform_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8rb = void 0;
    let $8rb = class $8rb extends abstractFileWorkingCopyManager_1.$7rb {
        constructor(I, J, fileService, L, N, logService, O, workingCopyBackupService, P, Q, R, S, U, X, Y) {
            super(fileService, logService, workingCopyBackupService);
            this.I = I;
            this.J = J;
            this.L = L;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
            this.X = X;
            this.Y = Y;
            //#region Events
            this.s = this.B(new event_1.$fd());
            this.onDidResolve = this.s.event;
            this.t = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.t.event;
            this.u = this.B(new event_1.$fd());
            this.onDidChangeReadonly = this.u.event;
            this.w = this.B(new event_1.$fd());
            this.onDidChangeOrphaned = this.w.event;
            this.y = this.B(new event_1.$fd());
            this.onDidSaveError = this.y.event;
            this.z = this.B(new event_1.$fd());
            this.onDidSave = this.z.event;
            this.C = this.B(new event_1.$fd());
            this.onDidRevert = this.C.event;
            this.D = this.B(new event_1.$fd());
            this.onDidRemove = this.D.event;
            //#endregion
            this.F = new map_1.$zi();
            this.G = new map_1.$zi();
            this.H = this.B(new async_1.$Pg());
            //#endregion
            //#region Working Copy File Events
            this.gb = new Map();
            this.Z();
        }
        Z() {
            // Update working copies from file change events
            this.B(this.f.onDidFilesChange(e => this.db(e)));
            // File system provider changes
            this.B(this.f.onDidChangeFileSystemProviderCapabilities(e => this.bb(e)));
            this.B(this.f.onDidChangeFileSystemProviderRegistrations(e => this.cb(e)));
            // Working copy operations
            this.B(this.O.onWillRunWorkingCopyFileOperation(e => this.hb(e)));
            this.B(this.O.onDidFailWorkingCopyFileOperation(e => this.ib(e)));
            this.B(this.O.onDidRunWorkingCopyFileOperation(e => this.jb(e)));
            // Lifecycle
            if (platform_1.$o) {
                this.B(this.L.onBeforeShutdown(event => event.veto(this.$(), 'veto.fileWorkingCopyManager')));
            }
            else {
                this.B(this.L.onWillShutdown(event => event.join(this.ab(), { id: 'join.fileWorkingCopyManager', label: (0, nls_1.localize)(0, null) })));
            }
        }
        $() {
            if (this.workingCopies.some(workingCopy => workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */))) {
                // stored file working copies are pending to be saved:
                // veto because web does not support long running shutdown
                return true;
            }
            return false;
        }
        async ab() {
            let pendingSavedWorkingCopies;
            // As long as stored file working copies are pending to be saved, we prolong the shutdown
            // until that has happened to ensure we are not shutting down in the middle of
            // writing to the working copy (https://github.com/microsoft/vscode/issues/116600).
            while ((pendingSavedWorkingCopies = this.workingCopies.filter(workingCopy => workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */))).length > 0) {
                await async_1.Promises.settled(pendingSavedWorkingCopies.map(workingCopy => workingCopy.joinState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */)));
            }
        }
        //#region Resolve from file or file provider changes
        bb(e) {
            // Resolve working copies again for file systems that changed
            // capabilities to fetch latest metadata (e.g. readonly)
            // into all working copies.
            this.eb(e.scheme);
        }
        cb(e) {
            if (!e.added) {
                return; // only if added
            }
            // Resolve working copies again for file systems that registered
            // to account for capability changes: extensions may unregister
            // and register the same provider with different capabilities,
            // so we want to ensure to fetch latest metadata (e.g. readonly)
            // into all working copies.
            this.eb(e.scheme);
        }
        db(e) {
            // Trigger a resolve for any update or add event that impacts
            // the working copy. We also consider the added event
            // because it could be that a file was added and updated
            // right after.
            this.eb(e);
        }
        eb(schemeOrEvent) {
            for (const workingCopy of this.workingCopies) {
                if (workingCopy.isDirty()) {
                    continue; // never reload dirty working copies
                }
                let resolveWorkingCopy = false;
                if (typeof schemeOrEvent === 'string') {
                    resolveWorkingCopy = schemeOrEvent === workingCopy.resource.scheme;
                }
                else {
                    resolveWorkingCopy = schemeOrEvent.contains(workingCopy.resource, 0 /* FileChangeType.UPDATED */, 1 /* FileChangeType.ADDED */);
                }
                if (resolveWorkingCopy) {
                    this.fb(workingCopy);
                }
            }
        }
        fb(workingCopy) {
            // Resolves a working copy to update (use a queue to prevent accumulation of
            // resolve when the resolving actually takes long. At most we only want the
            // queue to have a size of 2 (1 running resolve and 1 queued resolve).
            const queue = this.H.queueFor(workingCopy.resource);
            if (queue.size <= 1) {
                queue.queue(async () => {
                    try {
                        await this.kb(workingCopy);
                    }
                    catch (error) {
                        this.g.error(error);
                    }
                });
            }
        }
        hb(e) {
            // Move / Copy: remember working copies to restore after the operation
            if (e.operation === 2 /* FileOperation.MOVE */ || e.operation === 3 /* FileOperation.COPY */) {
                e.waitUntil((async () => {
                    const workingCopiesToRestore = [];
                    for (const { source, target } of e.files) {
                        if (source) {
                            if (this.P.extUri.isEqual(source, target)) {
                                continue; // ignore if resources are considered equal
                            }
                            // Find all working copies that related to source (can be many if resource is a folder)
                            const sourceWorkingCopies = [];
                            for (const workingCopy of this.workingCopies) {
                                if (this.P.extUri.isEqualOrParent(workingCopy.resource, source)) {
                                    sourceWorkingCopies.push(workingCopy);
                                }
                            }
                            // Remember each source working copy to load again after move is done
                            // with optional content to restore if it was dirty
                            for (const sourceWorkingCopy of sourceWorkingCopies) {
                                const sourceResource = sourceWorkingCopy.resource;
                                // If the source is the actual working copy, just use target as new resource
                                let targetResource;
                                if (this.P.extUri.isEqual(sourceResource, source)) {
                                    targetResource = target;
                                }
                                // Otherwise a parent folder of the source is being moved, so we need
                                // to compute the target resource based on that
                                else {
                                    targetResource = (0, resources_1.$ig)(target, sourceResource.path.substr(source.path.length + 1));
                                }
                                workingCopiesToRestore.push({
                                    source: sourceResource,
                                    target: targetResource,
                                    snapshot: sourceWorkingCopy.isDirty() ? await sourceWorkingCopy.model?.snapshot(cancellation_1.CancellationToken.None) : undefined
                                });
                            }
                        }
                    }
                    this.gb.set(e.correlationId, workingCopiesToRestore);
                })());
            }
        }
        ib(e) {
            // Move / Copy: restore dirty flag on working copies to restore that were dirty
            if ((e.operation === 2 /* FileOperation.MOVE */ || e.operation === 3 /* FileOperation.COPY */)) {
                const workingCopiesToRestore = this.gb.get(e.correlationId);
                if (workingCopiesToRestore) {
                    this.gb.delete(e.correlationId);
                    for (const workingCopy of workingCopiesToRestore) {
                        // Snapshot presence means this working copy used to be modified and so we restore that
                        // flag. we do NOT have to restore the content because the working copy was only soft
                        // reverted and did not loose its original modified contents.
                        if (workingCopy.snapshot) {
                            this.get(workingCopy.source)?.markModified();
                        }
                    }
                }
            }
        }
        jb(e) {
            switch (e.operation) {
                // Create: Revert existing working copies
                case 0 /* FileOperation.CREATE */:
                    e.waitUntil((async () => {
                        for (const { target } of e.files) {
                            const workingCopy = this.get(target);
                            if (workingCopy && !workingCopy.isDisposed()) {
                                await workingCopy.revert();
                            }
                        }
                    })());
                    break;
                // Move/Copy: restore working copies that were loaded before the operation took place
                case 2 /* FileOperation.MOVE */:
                case 3 /* FileOperation.COPY */:
                    e.waitUntil((async () => {
                        const workingCopiesToRestore = this.gb.get(e.correlationId);
                        if (workingCopiesToRestore) {
                            this.gb.delete(e.correlationId);
                            await async_1.Promises.settled(workingCopiesToRestore.map(async (workingCopyToRestore) => {
                                // Restore the working copy at the target. if we have previous dirty content, we pass it
                                // over to be used, otherwise we force a reload from disk. this is important
                                // because we know the file has changed on disk after the move and the working copy might
                                // have still existed with the previous state. this ensures that the working copy is not
                                // tracking a stale state.
                                await this.resolve(workingCopyToRestore.target, {
                                    reload: { async: false },
                                    contents: workingCopyToRestore.snapshot
                                });
                            }));
                        }
                    })());
                    break;
            }
        }
        //#endregion
        //#region Reload & Resolve
        async kb(workingCopy) {
            // Await a pending working copy resolve first before proceeding
            // to ensure that we never resolve a working copy more than once
            // in parallel.
            await this.mb(workingCopy.resource);
            if (workingCopy.isDirty() || workingCopy.isDisposed() || !this.j(workingCopy.resource)) {
                return; // the working copy possibly got dirty or disposed, so return early then
            }
            // Trigger reload
            await this.lb(workingCopy, { reload: { async: false } });
        }
        async resolve(resource, options) {
            // Await a pending working copy resolve first before proceeding
            // to ensure that we never resolve a working copy more than once
            // in parallel.
            const pendingResolve = this.mb(resource);
            if (pendingResolve) {
                await pendingResolve;
            }
            // Trigger resolve
            return this.lb(resource, options);
        }
        async lb(resourceOrWorkingCopy, options) {
            let workingCopy;
            let resource;
            if (uri_1.URI.isUri(resourceOrWorkingCopy)) {
                resource = resourceOrWorkingCopy;
                workingCopy = this.get(resource);
            }
            else {
                resource = resourceOrWorkingCopy.resource;
                workingCopy = resourceOrWorkingCopy;
            }
            let workingCopyResolve;
            let didCreateWorkingCopy = false;
            const resolveOptions = {
                contents: options?.contents,
                forceReadFromFile: options?.reload?.force
            };
            // Working copy exists
            if (workingCopy) {
                // Always reload if contents are provided
                if (options?.contents) {
                    workingCopyResolve = workingCopy.resolve(resolveOptions);
                }
                // Reload async or sync based on options
                else if (options?.reload) {
                    // Async reload: trigger a reload but return immediately
                    if (options.reload.async) {
                        workingCopyResolve = Promise.resolve();
                        (async () => {
                            try {
                                await workingCopy.resolve(resolveOptions);
                            }
                            catch (error) {
                                (0, errors_1.$Y)(error);
                            }
                        })();
                    }
                    // Sync reload: do not return until working copy reloaded
                    else {
                        workingCopyResolve = workingCopy.resolve(resolveOptions);
                    }
                }
                // Do not reload
                else {
                    workingCopyResolve = Promise.resolve();
                }
            }
            // Stored file working copy does not exist
            else {
                didCreateWorkingCopy = true;
                workingCopy = new storedFileWorkingCopy_1.$FD(this.I, resource, this.N.getUriBasenameLabel(resource), this.J, async (options) => { await this.resolve(resource, { ...options, reload: { async: false } }); }, this.f, this.g, this.O, this.Q, this.h, this.R, this.S, this.U, this.X, this.Y);
                workingCopyResolve = workingCopy.resolve(resolveOptions);
                this.ob(workingCopy);
            }
            // Store pending resolve to avoid race conditions
            this.G.set(resource, workingCopyResolve);
            // Make known to manager (if not already known)
            this.m(resource, workingCopy);
            // Emit some events if we created the working copy
            if (didCreateWorkingCopy) {
                // If the working copy is dirty right from the beginning,
                // make sure to emit this as an event
                if (workingCopy.isDirty()) {
                    this.t.fire(workingCopy);
                }
            }
            try {
                await workingCopyResolve;
            }
            catch (error) {
                // Automatically dispose the working copy if we created
                // it because we cannot dispose a working copy we do not
                // own (https://github.com/microsoft/vscode/issues/138850)
                if (didCreateWorkingCopy) {
                    workingCopy.dispose();
                }
                throw error;
            }
            finally {
                // Remove from pending resolves
                this.G.delete(resource);
            }
            // Stored file working copy can be dirty if a backup was restored, so we make sure to
            // have this event delivered if we created the working copy here
            if (didCreateWorkingCopy && workingCopy.isDirty()) {
                this.t.fire(workingCopy);
            }
            return workingCopy;
        }
        mb(resource) {
            const pendingWorkingCopyResolve = this.G.get(resource);
            if (!pendingWorkingCopyResolve) {
                return;
            }
            return this.nb(resource);
        }
        async nb(resource) {
            // While we have pending working copy resolves, ensure
            // to await the last one finishing before returning.
            // This prevents a race when multiple clients await
            // the pending resolve and then all trigger the resolve
            // at the same time.
            let currentWorkingCopyResolve;
            while (this.G.has(resource)) {
                const nextPendingWorkingCopyResolve = this.G.get(resource);
                if (nextPendingWorkingCopyResolve === currentWorkingCopyResolve) {
                    return; // already awaited on - return
                }
                currentWorkingCopyResolve = nextPendingWorkingCopyResolve;
                try {
                    await nextPendingWorkingCopyResolve;
                }
                catch (error) {
                    // ignore any error here, it will bubble to the original requestor
                }
            }
        }
        ob(workingCopy) {
            // Install working copy listeners
            const workingCopyListeners = new lifecycle_1.$jc();
            workingCopyListeners.add(workingCopy.onDidResolve(() => this.s.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onDidChangeDirty(() => this.t.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onDidChangeReadonly(() => this.u.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onDidChangeOrphaned(() => this.w.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onDidSaveError(() => this.y.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onDidSave(e => this.z.fire({ workingCopy, ...e })));
            workingCopyListeners.add(workingCopy.onDidRevert(() => this.C.fire(workingCopy)));
            // Keep for disposal
            this.F.set(workingCopy.resource, workingCopyListeners);
        }
        n(resource) {
            const removed = super.n(resource);
            // Dispose any existing working copy listeners
            const workingCopyListener = this.F.get(resource);
            if (workingCopyListener) {
                (0, lifecycle_1.$fc)(workingCopyListener);
                this.F.delete(resource);
            }
            if (removed) {
                this.D.fire(resource);
            }
            return removed;
        }
        //#endregion
        //#region Lifecycle
        canDispose(workingCopy) {
            // Quick return if working copy already disposed or not dirty and not resolving
            if (workingCopy.isDisposed() ||
                (!this.G.has(workingCopy.resource) && !workingCopy.isDirty())) {
                return true;
            }
            // Promise based return in all other cases
            return this.qb(workingCopy);
        }
        async qb(workingCopy) {
            // Await any pending resolves first before proceeding
            const pendingResolve = this.mb(workingCopy.resource);
            if (pendingResolve) {
                await pendingResolve;
                return this.canDispose(workingCopy);
            }
            // Dirty working copy: we do not allow to dispose dirty working copys
            // to prevent data loss cases. dirty working copys can only be disposed when
            // they are either saved or reverted
            if (workingCopy.isDirty()) {
                await event_1.Event.toPromise(workingCopy.onDidChangeDirty);
                return this.canDispose(workingCopy);
            }
            return true;
        }
        dispose() {
            super.dispose();
            // Clear pending working copy resolves
            this.G.clear();
            // Dispose the working copy change listeners
            (0, lifecycle_1.$fc)(this.F.values());
            this.F.clear();
        }
    };
    exports.$8rb = $8rb;
    exports.$8rb = $8rb = __decorate([
        __param(2, files_1.$6j),
        __param(3, lifecycle_2.$7y),
        __param(4, label_1.$Vz),
        __param(5, log_1.$5i),
        __param(6, workingCopyFileService_1.$HD),
        __param(7, workingCopyBackup_1.$EA),
        __param(8, uriIdentity_1.$Ck),
        __param(9, filesConfigurationService_1.$yD),
        __param(10, workingCopyService_1.$TC),
        __param(11, notification_1.$Yu),
        __param(12, workingCopyEditorService_1.$AD),
        __param(13, editorService_1.$9C),
        __param(14, elevatedFileService_1.$CD)
    ], $8rb);
});
//# sourceMappingURL=storedFileWorkingCopyManager.js.map