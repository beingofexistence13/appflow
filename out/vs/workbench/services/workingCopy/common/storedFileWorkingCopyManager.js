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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/services/workingCopy/common/storedFileWorkingCopy", "vs/base/common/map", "vs/base/common/async", "vs/platform/files/common/files", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/uri", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/base/common/resources", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/cancellation", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/workingCopy/common/abstractFileWorkingCopyManager", "vs/platform/notification/common/notification", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/platform", "vs/base/common/errors"], function (require, exports, nls_1, lifecycle_1, event_1, storedFileWorkingCopy_1, map_1, async_1, files_1, lifecycle_2, uri_1, label_1, log_1, resources_1, workingCopyFileService_1, uriIdentity_1, cancellation_1, workingCopyBackup_1, abstractFileWorkingCopyManager_1, notification_1, editorService_1, elevatedFileService_1, filesConfigurationService_1, workingCopyEditorService_1, workingCopyService_1, platform_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StoredFileWorkingCopyManager = void 0;
    let StoredFileWorkingCopyManager = class StoredFileWorkingCopyManager extends abstractFileWorkingCopyManager_1.BaseFileWorkingCopyManager {
        constructor(workingCopyTypeId, modelFactory, fileService, lifecycleService, labelService, logService, workingCopyFileService, workingCopyBackupService, uriIdentityService, filesConfigurationService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService) {
            super(fileService, logService, workingCopyBackupService);
            this.workingCopyTypeId = workingCopyTypeId;
            this.modelFactory = modelFactory;
            this.lifecycleService = lifecycleService;
            this.labelService = labelService;
            this.workingCopyFileService = workingCopyFileService;
            this.uriIdentityService = uriIdentityService;
            this.filesConfigurationService = filesConfigurationService;
            this.workingCopyService = workingCopyService;
            this.notificationService = notificationService;
            this.workingCopyEditorService = workingCopyEditorService;
            this.editorService = editorService;
            this.elevatedFileService = elevatedFileService;
            //#region Events
            this._onDidResolve = this._register(new event_1.Emitter());
            this.onDidResolve = this._onDidResolve.event;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._onDidChangeReadonly = this._register(new event_1.Emitter());
            this.onDidChangeReadonly = this._onDidChangeReadonly.event;
            this._onDidChangeOrphaned = this._register(new event_1.Emitter());
            this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
            this._onDidSaveError = this._register(new event_1.Emitter());
            this.onDidSaveError = this._onDidSaveError.event;
            this._onDidSave = this._register(new event_1.Emitter());
            this.onDidSave = this._onDidSave.event;
            this._onDidRevert = this._register(new event_1.Emitter());
            this.onDidRevert = this._onDidRevert.event;
            this._onDidRemove = this._register(new event_1.Emitter());
            this.onDidRemove = this._onDidRemove.event;
            //#endregion
            this.mapResourceToWorkingCopyListeners = new map_1.ResourceMap();
            this.mapResourceToPendingWorkingCopyResolve = new map_1.ResourceMap();
            this.workingCopyResolveQueue = this._register(new async_1.ResourceQueue());
            //#endregion
            //#region Working Copy File Events
            this.mapCorrelationIdToWorkingCopiesToRestore = new Map();
            this.registerListeners();
        }
        registerListeners() {
            // Update working copies from file change events
            this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
            // File system provider changes
            this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onDidChangeFileSystemProviderCapabilities(e)));
            this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onDidChangeFileSystemProviderRegistrations(e)));
            // Working copy operations
            this._register(this.workingCopyFileService.onWillRunWorkingCopyFileOperation(e => this.onWillRunWorkingCopyFileOperation(e)));
            this._register(this.workingCopyFileService.onDidFailWorkingCopyFileOperation(e => this.onDidFailWorkingCopyFileOperation(e)));
            this._register(this.workingCopyFileService.onDidRunWorkingCopyFileOperation(e => this.onDidRunWorkingCopyFileOperation(e)));
            // Lifecycle
            if (platform_1.isWeb) {
                this._register(this.lifecycleService.onBeforeShutdown(event => event.veto(this.onBeforeShutdownWeb(), 'veto.fileWorkingCopyManager')));
            }
            else {
                this._register(this.lifecycleService.onWillShutdown(event => event.join(this.onWillShutdownDesktop(), { id: 'join.fileWorkingCopyManager', label: (0, nls_1.localize)('join.fileWorkingCopyManager', "Saving working copies") })));
            }
        }
        onBeforeShutdownWeb() {
            if (this.workingCopies.some(workingCopy => workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */))) {
                // stored file working copies are pending to be saved:
                // veto because web does not support long running shutdown
                return true;
            }
            return false;
        }
        async onWillShutdownDesktop() {
            let pendingSavedWorkingCopies;
            // As long as stored file working copies are pending to be saved, we prolong the shutdown
            // until that has happened to ensure we are not shutting down in the middle of
            // writing to the working copy (https://github.com/microsoft/vscode/issues/116600).
            while ((pendingSavedWorkingCopies = this.workingCopies.filter(workingCopy => workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */))).length > 0) {
                await async_1.Promises.settled(pendingSavedWorkingCopies.map(workingCopy => workingCopy.joinState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */)));
            }
        }
        //#region Resolve from file or file provider changes
        onDidChangeFileSystemProviderCapabilities(e) {
            // Resolve working copies again for file systems that changed
            // capabilities to fetch latest metadata (e.g. readonly)
            // into all working copies.
            this.queueWorkingCopyReloads(e.scheme);
        }
        onDidChangeFileSystemProviderRegistrations(e) {
            if (!e.added) {
                return; // only if added
            }
            // Resolve working copies again for file systems that registered
            // to account for capability changes: extensions may unregister
            // and register the same provider with different capabilities,
            // so we want to ensure to fetch latest metadata (e.g. readonly)
            // into all working copies.
            this.queueWorkingCopyReloads(e.scheme);
        }
        onDidFilesChange(e) {
            // Trigger a resolve for any update or add event that impacts
            // the working copy. We also consider the added event
            // because it could be that a file was added and updated
            // right after.
            this.queueWorkingCopyReloads(e);
        }
        queueWorkingCopyReloads(schemeOrEvent) {
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
                    this.queueWorkingCopyReload(workingCopy);
                }
            }
        }
        queueWorkingCopyReload(workingCopy) {
            // Resolves a working copy to update (use a queue to prevent accumulation of
            // resolve when the resolving actually takes long. At most we only want the
            // queue to have a size of 2 (1 running resolve and 1 queued resolve).
            const queue = this.workingCopyResolveQueue.queueFor(workingCopy.resource);
            if (queue.size <= 1) {
                queue.queue(async () => {
                    try {
                        await this.reload(workingCopy);
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                });
            }
        }
        onWillRunWorkingCopyFileOperation(e) {
            // Move / Copy: remember working copies to restore after the operation
            if (e.operation === 2 /* FileOperation.MOVE */ || e.operation === 3 /* FileOperation.COPY */) {
                e.waitUntil((async () => {
                    const workingCopiesToRestore = [];
                    for (const { source, target } of e.files) {
                        if (source) {
                            if (this.uriIdentityService.extUri.isEqual(source, target)) {
                                continue; // ignore if resources are considered equal
                            }
                            // Find all working copies that related to source (can be many if resource is a folder)
                            const sourceWorkingCopies = [];
                            for (const workingCopy of this.workingCopies) {
                                if (this.uriIdentityService.extUri.isEqualOrParent(workingCopy.resource, source)) {
                                    sourceWorkingCopies.push(workingCopy);
                                }
                            }
                            // Remember each source working copy to load again after move is done
                            // with optional content to restore if it was dirty
                            for (const sourceWorkingCopy of sourceWorkingCopies) {
                                const sourceResource = sourceWorkingCopy.resource;
                                // If the source is the actual working copy, just use target as new resource
                                let targetResource;
                                if (this.uriIdentityService.extUri.isEqual(sourceResource, source)) {
                                    targetResource = target;
                                }
                                // Otherwise a parent folder of the source is being moved, so we need
                                // to compute the target resource based on that
                                else {
                                    targetResource = (0, resources_1.joinPath)(target, sourceResource.path.substr(source.path.length + 1));
                                }
                                workingCopiesToRestore.push({
                                    source: sourceResource,
                                    target: targetResource,
                                    snapshot: sourceWorkingCopy.isDirty() ? await sourceWorkingCopy.model?.snapshot(cancellation_1.CancellationToken.None) : undefined
                                });
                            }
                        }
                    }
                    this.mapCorrelationIdToWorkingCopiesToRestore.set(e.correlationId, workingCopiesToRestore);
                })());
            }
        }
        onDidFailWorkingCopyFileOperation(e) {
            // Move / Copy: restore dirty flag on working copies to restore that were dirty
            if ((e.operation === 2 /* FileOperation.MOVE */ || e.operation === 3 /* FileOperation.COPY */)) {
                const workingCopiesToRestore = this.mapCorrelationIdToWorkingCopiesToRestore.get(e.correlationId);
                if (workingCopiesToRestore) {
                    this.mapCorrelationIdToWorkingCopiesToRestore.delete(e.correlationId);
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
        onDidRunWorkingCopyFileOperation(e) {
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
                        const workingCopiesToRestore = this.mapCorrelationIdToWorkingCopiesToRestore.get(e.correlationId);
                        if (workingCopiesToRestore) {
                            this.mapCorrelationIdToWorkingCopiesToRestore.delete(e.correlationId);
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
        async reload(workingCopy) {
            // Await a pending working copy resolve first before proceeding
            // to ensure that we never resolve a working copy more than once
            // in parallel.
            await this.joinPendingResolves(workingCopy.resource);
            if (workingCopy.isDirty() || workingCopy.isDisposed() || !this.has(workingCopy.resource)) {
                return; // the working copy possibly got dirty or disposed, so return early then
            }
            // Trigger reload
            await this.doResolve(workingCopy, { reload: { async: false } });
        }
        async resolve(resource, options) {
            // Await a pending working copy resolve first before proceeding
            // to ensure that we never resolve a working copy more than once
            // in parallel.
            const pendingResolve = this.joinPendingResolves(resource);
            if (pendingResolve) {
                await pendingResolve;
            }
            // Trigger resolve
            return this.doResolve(resource, options);
        }
        async doResolve(resourceOrWorkingCopy, options) {
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
                                (0, errors_1.onUnexpectedError)(error);
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
                workingCopy = new storedFileWorkingCopy_1.StoredFileWorkingCopy(this.workingCopyTypeId, resource, this.labelService.getUriBasenameLabel(resource), this.modelFactory, async (options) => { await this.resolve(resource, { ...options, reload: { async: false } }); }, this.fileService, this.logService, this.workingCopyFileService, this.filesConfigurationService, this.workingCopyBackupService, this.workingCopyService, this.notificationService, this.workingCopyEditorService, this.editorService, this.elevatedFileService);
                workingCopyResolve = workingCopy.resolve(resolveOptions);
                this.registerWorkingCopy(workingCopy);
            }
            // Store pending resolve to avoid race conditions
            this.mapResourceToPendingWorkingCopyResolve.set(resource, workingCopyResolve);
            // Make known to manager (if not already known)
            this.add(resource, workingCopy);
            // Emit some events if we created the working copy
            if (didCreateWorkingCopy) {
                // If the working copy is dirty right from the beginning,
                // make sure to emit this as an event
                if (workingCopy.isDirty()) {
                    this._onDidChangeDirty.fire(workingCopy);
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
                this.mapResourceToPendingWorkingCopyResolve.delete(resource);
            }
            // Stored file working copy can be dirty if a backup was restored, so we make sure to
            // have this event delivered if we created the working copy here
            if (didCreateWorkingCopy && workingCopy.isDirty()) {
                this._onDidChangeDirty.fire(workingCopy);
            }
            return workingCopy;
        }
        joinPendingResolves(resource) {
            const pendingWorkingCopyResolve = this.mapResourceToPendingWorkingCopyResolve.get(resource);
            if (!pendingWorkingCopyResolve) {
                return;
            }
            return this.doJoinPendingResolves(resource);
        }
        async doJoinPendingResolves(resource) {
            // While we have pending working copy resolves, ensure
            // to await the last one finishing before returning.
            // This prevents a race when multiple clients await
            // the pending resolve and then all trigger the resolve
            // at the same time.
            let currentWorkingCopyResolve;
            while (this.mapResourceToPendingWorkingCopyResolve.has(resource)) {
                const nextPendingWorkingCopyResolve = this.mapResourceToPendingWorkingCopyResolve.get(resource);
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
        registerWorkingCopy(workingCopy) {
            // Install working copy listeners
            const workingCopyListeners = new lifecycle_1.DisposableStore();
            workingCopyListeners.add(workingCopy.onDidResolve(() => this._onDidResolve.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onDidChangeReadonly(() => this._onDidChangeReadonly.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onDidSaveError(() => this._onDidSaveError.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onDidSave(e => this._onDidSave.fire({ workingCopy, ...e })));
            workingCopyListeners.add(workingCopy.onDidRevert(() => this._onDidRevert.fire(workingCopy)));
            // Keep for disposal
            this.mapResourceToWorkingCopyListeners.set(workingCopy.resource, workingCopyListeners);
        }
        remove(resource) {
            const removed = super.remove(resource);
            // Dispose any existing working copy listeners
            const workingCopyListener = this.mapResourceToWorkingCopyListeners.get(resource);
            if (workingCopyListener) {
                (0, lifecycle_1.dispose)(workingCopyListener);
                this.mapResourceToWorkingCopyListeners.delete(resource);
            }
            if (removed) {
                this._onDidRemove.fire(resource);
            }
            return removed;
        }
        //#endregion
        //#region Lifecycle
        canDispose(workingCopy) {
            // Quick return if working copy already disposed or not dirty and not resolving
            if (workingCopy.isDisposed() ||
                (!this.mapResourceToPendingWorkingCopyResolve.has(workingCopy.resource) && !workingCopy.isDirty())) {
                return true;
            }
            // Promise based return in all other cases
            return this.doCanDispose(workingCopy);
        }
        async doCanDispose(workingCopy) {
            // Await any pending resolves first before proceeding
            const pendingResolve = this.joinPendingResolves(workingCopy.resource);
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
            this.mapResourceToPendingWorkingCopyResolve.clear();
            // Dispose the working copy change listeners
            (0, lifecycle_1.dispose)(this.mapResourceToWorkingCopyListeners.values());
            this.mapResourceToWorkingCopyListeners.clear();
        }
    };
    exports.StoredFileWorkingCopyManager = StoredFileWorkingCopyManager;
    exports.StoredFileWorkingCopyManager = StoredFileWorkingCopyManager = __decorate([
        __param(2, files_1.IFileService),
        __param(3, lifecycle_2.ILifecycleService),
        __param(4, label_1.ILabelService),
        __param(5, log_1.ILogService),
        __param(6, workingCopyFileService_1.IWorkingCopyFileService),
        __param(7, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(8, uriIdentity_1.IUriIdentityService),
        __param(9, filesConfigurationService_1.IFilesConfigurationService),
        __param(10, workingCopyService_1.IWorkingCopyService),
        __param(11, notification_1.INotificationService),
        __param(12, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(13, editorService_1.IEditorService),
        __param(14, elevatedFileService_1.IElevatedFileService)
    ], StoredFileWorkingCopyManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmVkRmlsZVdvcmtpbmdDb3B5TWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy93b3JraW5nQ29weS9jb21tb24vc3RvcmVkRmlsZVdvcmtpbmdDb3B5TWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzSXpGLElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQW9FLFNBQVEsMkRBQXdEO1FBbUNoSixZQUNrQixpQkFBeUIsRUFDekIsWUFBbUQsRUFDdEQsV0FBeUIsRUFDcEIsZ0JBQW9ELEVBQ3hELFlBQTRDLEVBQzlDLFVBQXVCLEVBQ1gsc0JBQWdFLEVBQzlELHdCQUFtRCxFQUN6RCxrQkFBd0QsRUFDakQseUJBQXNFLEVBQzdFLGtCQUF3RCxFQUN2RCxtQkFBMEQsRUFDckQsd0JBQW9FLEVBQy9FLGFBQThDLEVBQ3hDLG1CQUEwRDtZQUVoRixLQUFLLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1lBaEJ4QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQVE7WUFDekIsaUJBQVksR0FBWixZQUFZLENBQXVDO1lBRWhDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDdkMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFFakIsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUVuRCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ2hDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBNEI7WUFDNUQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUN0Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQ3BDLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMkI7WUFDOUQsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ3ZCLHdCQUFtQixHQUFuQixtQkFBbUIs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