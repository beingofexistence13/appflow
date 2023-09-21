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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/cancellation", "vs/platform/files/common/files", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/async", "vs/platform/log/common/log", "vs/base/common/types", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/notification/common/notification", "vs/base/common/hash", "vs/base/common/errorMessage", "vs/base/common/actions", "vs/base/common/platform", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/workingCopy/common/resourceWorkingCopy"], function (require, exports, nls_1, event_1, cancellation_1, files_1, workingCopyService_1, async_1, log_1, types_1, workingCopyFileService_1, filesConfigurationService_1, workingCopyBackup_1, notification_1, hash_1, errorMessage_1, actions_1, platform_1, workingCopyEditorService_1, editorService_1, elevatedFileService_1, resourceWorkingCopy_1) {
    "use strict";
    var StoredFileWorkingCopy_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StoredFileWorkingCopy = exports.isStoredFileWorkingCopySaveEvent = exports.StoredFileWorkingCopyState = void 0;
    /**
     * States the stored file working copy can be in.
     */
    var StoredFileWorkingCopyState;
    (function (StoredFileWorkingCopyState) {
        /**
         * A stored file working copy is saved.
         */
        StoredFileWorkingCopyState[StoredFileWorkingCopyState["SAVED"] = 0] = "SAVED";
        /**
         * A stored file working copy is dirty.
         */
        StoredFileWorkingCopyState[StoredFileWorkingCopyState["DIRTY"] = 1] = "DIRTY";
        /**
         * A stored file working copy is currently being saved but
         * this operation has not completed yet.
         */
        StoredFileWorkingCopyState[StoredFileWorkingCopyState["PENDING_SAVE"] = 2] = "PENDING_SAVE";
        /**
         * A stored file working copy is in conflict mode when changes
         * cannot be saved because the underlying file has changed.
         * Stored file working copies in conflict mode are always dirty.
         */
        StoredFileWorkingCopyState[StoredFileWorkingCopyState["CONFLICT"] = 3] = "CONFLICT";
        /**
         * A stored file working copy is in orphan state when the underlying
         * file has been deleted.
         */
        StoredFileWorkingCopyState[StoredFileWorkingCopyState["ORPHAN"] = 4] = "ORPHAN";
        /**
         * Any error that happens during a save that is not causing
         * the `StoredFileWorkingCopyState.CONFLICT` state.
         * Stored file working copies in error mode are always dirty.
         */
        StoredFileWorkingCopyState[StoredFileWorkingCopyState["ERROR"] = 5] = "ERROR";
    })(StoredFileWorkingCopyState || (exports.StoredFileWorkingCopyState = StoredFileWorkingCopyState = {}));
    function isStoredFileWorkingCopySaveEvent(e) {
        const candidate = e;
        return !!candidate.stat;
    }
    exports.isStoredFileWorkingCopySaveEvent = isStoredFileWorkingCopySaveEvent;
    let StoredFileWorkingCopy = class StoredFileWorkingCopy extends resourceWorkingCopy_1.ResourceWorkingCopy {
        static { StoredFileWorkingCopy_1 = this; }
        get model() { return this._model; }
        //#endregion
        constructor(typeId, resource, name, modelFactory, externalResolver, fileService, logService, workingCopyFileService, filesConfigurationService, workingCopyBackupService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService) {
            super(resource, fileService);
            this.typeId = typeId;
            this.name = name;
            this.modelFactory = modelFactory;
            this.externalResolver = externalResolver;
            this.logService = logService;
            this.workingCopyFileService = workingCopyFileService;
            this.filesConfigurationService = filesConfigurationService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.notificationService = notificationService;
            this.workingCopyEditorService = workingCopyEditorService;
            this.editorService = editorService;
            this.elevatedFileService = elevatedFileService;
            this.capabilities = 0 /* WorkingCopyCapabilities.None */;
            this._model = undefined;
            //#region events
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._onDidResolve = this._register(new event_1.Emitter());
            this.onDidResolve = this._onDidResolve.event;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._onDidSaveError = this._register(new event_1.Emitter());
            this.onDidSaveError = this._onDidSaveError.event;
            this._onDidSave = this._register(new event_1.Emitter());
            this.onDidSave = this._onDidSave.event;
            this._onDidRevert = this._register(new event_1.Emitter());
            this.onDidRevert = this._onDidRevert.event;
            this._onDidChangeReadonly = this._register(new event_1.Emitter());
            this.onDidChangeReadonly = this._onDidChangeReadonly.event;
            //#region Dirty
            this.dirty = false;
            this.ignoreDirtyOnModelContentChange = false;
            //#endregion
            //#region Save
            this.versionId = 0;
            this.lastContentChangeFromUndoRedo = undefined;
            this.saveSequentializer = new async_1.TaskSequentializer();
            this.ignoreSaveFromSaveParticipants = false;
            //#endregion
            //#region State
            this.inConflictMode = false;
            this.inErrorMode = false;
            // Make known to working copy service
            this._register(workingCopyService.registerWorkingCopy(this));
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.filesConfigurationService.onReadonlyChange(() => this._onDidChangeReadonly.fire()));
        }
        isDirty() {
            return this.dirty;
        }
        markModified() {
            this.setDirty(true); // stored file working copy tracks modified via dirty
        }
        setDirty(dirty) {
            if (!this.isResolved()) {
                return; // only resolved working copies can be marked dirty
            }
            // Track dirty state and version id
            const wasDirty = this.dirty;
            this.doSetDirty(dirty);
            // Emit as Event if dirty changed
            if (dirty !== wasDirty) {
                this._onDidChangeDirty.fire();
            }
        }
        doSetDirty(dirty) {
            const wasDirty = this.dirty;
            const wasInConflictMode = this.inConflictMode;
            const wasInErrorMode = this.inErrorMode;
            const oldSavedVersionId = this.savedVersionId;
            if (!dirty) {
                this.dirty = false;
                this.inConflictMode = false;
                this.inErrorMode = false;
                // we remember the models alternate version id to remember when the version
                // of the model matches with the saved version on disk. we need to keep this
                // in order to find out if the model changed back to a saved version (e.g.
                // when undoing long enough to reach to a version that is saved and then to
                // clear the dirty flag)
                if (this.isResolved()) {
                    this.savedVersionId = this.model.versionId;
                }
            }
            else {
                this.dirty = true;
            }
            // Return function to revert this call
            return () => {
                this.dirty = wasDirty;
                this.inConflictMode = wasInConflictMode;
                this.inErrorMode = wasInErrorMode;
                this.savedVersionId = oldSavedVersionId;
            };
        }
        isResolved() {
            return !!this.model;
        }
        async resolve(options) {
            this.trace('resolve() - enter');
            // Return early if we are disposed
            if (this.isDisposed()) {
                this.trace('resolve() - exit - without resolving because file working copy is disposed');
                return;
            }
            // Unless there are explicit contents provided, it is important that we do not
            // resolve a working copy that is dirty or is in the process of saving to prevent
            // data loss.
            if (!options?.contents && (this.dirty || this.saveSequentializer.isRunning())) {
                this.trace('resolve() - exit - without resolving because file working copy is dirty or being saved');
                return;
            }
            return this.doResolve(options);
        }
        async doResolve(options) {
            // First check if we have contents to use for the working copy
            if (options?.contents) {
                return this.resolveFromBuffer(options.contents);
            }
            // Second, check if we have a backup to resolve from (only for new working copies)
            const isNew = !this.isResolved();
            if (isNew) {
                const resolvedFromBackup = await this.resolveFromBackup();
                if (resolvedFromBackup) {
                    return;
                }
            }
            // Finally, resolve from file resource
            return this.resolveFromFile(options);
        }
        async resolveFromBuffer(buffer) {
            this.trace('resolveFromBuffer()');
            // Try to resolve metdata from disk
            let mtime;
            let ctime;
            let size;
            let etag;
            try {
                const metadata = await this.fileService.stat(this.resource);
                mtime = metadata.mtime;
                ctime = metadata.ctime;
                size = metadata.size;
                etag = metadata.etag;
                // Clear orphaned state when resolving was successful
                this.setOrphaned(false);
            }
            catch (error) {
                // Put some fallback values in error case
                mtime = Date.now();
                ctime = Date.now();
                size = 0;
                etag = files_1.ETAG_DISABLED;
                // Apply orphaned state based on error code
                this.setOrphaned(error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */);
            }
            // Resolve with buffer
            return this.resolveFromContent({
                resource: this.resource,
                name: this.name,
                mtime,
                ctime,
                size,
                etag,
                value: buffer,
                readonly: false,
                locked: false
            }, true /* dirty (resolved from buffer) */);
        }
        async resolveFromBackup() {
            // Resolve backup if any
            const backup = await this.workingCopyBackupService.resolve(this);
            // Abort if someone else managed to resolve the working copy by now
            const isNew = !this.isResolved();
            if (!isNew) {
                this.trace('resolveFromBackup() - exit - withoutresolving because previously new file working copy got created meanwhile');
                return true; // imply that resolving has happened in another operation
            }
            // Try to resolve from backup if we have any
            if (backup) {
                await this.doResolveFromBackup(backup);
                return true;
            }
            // Otherwise signal back that resolving did not happen
            return false;
        }
        async doResolveFromBackup(backup) {
            this.trace('doResolveFromBackup()');
            // Resolve with backup
            await this.resolveFromContent({
                resource: this.resource,
                name: this.name,
                mtime: backup.meta ? backup.meta.mtime : Date.now(),
                ctime: backup.meta ? backup.meta.ctime : Date.now(),
                size: backup.meta ? backup.meta.size : 0,
                etag: backup.meta ? backup.meta.etag : files_1.ETAG_DISABLED,
                value: backup.value,
                readonly: false,
                locked: false
            }, true /* dirty (resolved from backup) */);
            // Restore orphaned flag based on state
            if (backup.meta && backup.meta.orphaned) {
                this.setOrphaned(true);
            }
        }
        async resolveFromFile(options) {
            this.trace('resolveFromFile()');
            const forceReadFromFile = options?.forceReadFromFile;
            // Decide on etag
            let etag;
            if (forceReadFromFile) {
                etag = files_1.ETAG_DISABLED; // disable ETag if we enforce to read from disk
            }
            else if (this.lastResolvedFileStat) {
                etag = this.lastResolvedFileStat.etag; // otherwise respect etag to support caching
            }
            // Remember current version before doing any long running operation
            // to ensure we are not changing a working copy that was changed
            // meanwhile
            const currentVersionId = this.versionId;
            // Resolve Content
            try {
                const content = await this.fileService.readFileStream(this.resource, { etag });
                // Clear orphaned state when resolving was successful
                this.setOrphaned(false);
                // Return early if the working copy content has changed
                // meanwhile to prevent loosing any changes
                if (currentVersionId !== this.versionId) {
                    this.trace('resolveFromFile() - exit - without resolving because file working copy content changed');
                    return;
                }
                await this.resolveFromContent(content, false /* not dirty (resolved from file) */);
            }
            catch (error) {
                const result = error.fileOperationResult;
                // Apply orphaned state based on error code
                this.setOrphaned(result === 1 /* FileOperationResult.FILE_NOT_FOUND */);
                // NotModified status is expected and can be handled gracefully
                // if we are resolved. We still want to update our last resolved
                // stat to e.g. detect changes to the file's readonly state
                if (this.isResolved() && result === 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */) {
                    if (error instanceof files_1.NotModifiedSinceFileOperationError) {
                        this.updateLastResolvedFileStat(error.stat);
                    }
                    return;
                }
                // Unless we are forced to read from the file, ignore when a working copy has
                // been resolved once and the file was deleted meanwhile. Since we already have
                // the working copy resolved, we can return to this state and update the orphaned
                // flag to indicate that this working copy has no version on disk anymore.
                if (this.isResolved() && result === 1 /* FileOperationResult.FILE_NOT_FOUND */ && !forceReadFromFile) {
                    return;
                }
                // Otherwise bubble up the error
                throw error;
            }
        }
        async resolveFromContent(content, dirty) {
            this.trace('resolveFromContent() - enter');
            // Return early if we are disposed
            if (this.isDisposed()) {
                this.trace('resolveFromContent() - exit - because working copy is disposed');
                return;
            }
            // Update our resolved disk stat
            this.updateLastResolvedFileStat({
                resource: this.resource,
                name: content.name,
                mtime: content.mtime,
                ctime: content.ctime,
                size: content.size,
                etag: content.etag,
                readonly: content.readonly,
                locked: content.locked,
                isFile: true,
                isDirectory: false,
                isSymbolicLink: false,
                children: undefined
            });
            // Update existing model if we had been resolved
            if (this.isResolved()) {
                await this.doUpdateModel(content.value);
            }
            // Create new model otherwise
            else {
                await this.doCreateModel(content.value);
            }
            // Update working copy dirty flag. This is very important to call
            // in both cases of dirty or not because it conditionally updates
            // the `savedVersionId` to determine the version when to consider
            // the working copy as saved again (e.g. when undoing back to the
            // saved state)
            this.setDirty(!!dirty);
            // Emit as event
            this._onDidResolve.fire();
        }
        async doCreateModel(contents) {
            this.trace('doCreateModel()');
            // Create model and dispose it when we get disposed
            this._model = this._register(await this.modelFactory.createModel(this.resource, contents, cancellation_1.CancellationToken.None));
            // Model listeners
            this.installModelListeners(this._model);
        }
        async doUpdateModel(contents) {
            this.trace('doUpdateModel()');
            // Update model value in a block that ignores content change events for dirty tracking
            this.ignoreDirtyOnModelContentChange = true;
            try {
                await this.model?.update(contents, cancellation_1.CancellationToken.None);
            }
            finally {
                this.ignoreDirtyOnModelContentChange = false;
            }
        }
        installModelListeners(model) {
            // See https://github.com/microsoft/vscode/issues/30189
            // This code has been extracted to a different method because it caused a memory leak
            // where `value` was captured in the content change listener closure scope.
            // Content Change
            this._register(model.onDidChangeContent(e => this.onModelContentChanged(model, e.isUndoing || e.isRedoing)));
            // Lifecycle
            this._register(model.onWillDispose(() => this.dispose()));
        }
        onModelContentChanged(model, isUndoingOrRedoing) {
            this.trace(`onModelContentChanged() - enter`);
            // In any case increment the version id because it tracks the content state of the model at all times
            this.versionId++;
            this.trace(`onModelContentChanged() - new versionId ${this.versionId}`);
            // Remember when the user changed the model through a undo/redo operation.
            // We need this information to throttle save participants to fix
            // https://github.com/microsoft/vscode/issues/102542
            if (isUndoingOrRedoing) {
                this.lastContentChangeFromUndoRedo = Date.now();
            }
            // We mark check for a dirty-state change upon model content change, unless:
            // - explicitly instructed to ignore it (e.g. from model.resolve())
            // - the model is readonly (in that case we never assume the change was done by the user)
            if (!this.ignoreDirtyOnModelContentChange && !this.isReadonly()) {
                // The contents changed as a matter of Undo and the version reached matches the saved one
                // In this case we clear the dirty flag and emit a SAVED event to indicate this state.
                if (model.versionId === this.savedVersionId) {
                    this.trace('onModelContentChanged() - model content changed back to last saved version');
                    // Clear flags
                    const wasDirty = this.dirty;
                    this.setDirty(false);
                    // Emit revert event if we were dirty
                    if (wasDirty) {
                        this._onDidRevert.fire();
                    }
                }
                // Otherwise the content has changed and we signal this as becoming dirty
                else {
                    this.trace('onModelContentChanged() - model content changed and marked as dirty');
                    // Mark as dirty
                    this.setDirty(true);
                }
            }
            // Emit as event
            this._onDidChangeContent.fire();
        }
        async forceResolveFromFile() {
            if (this.isDisposed()) {
                return; // return early when the working copy is invalid
            }
            // We go through the resolver to make
            // sure this kind of `resolve` is properly
            // running in sequence with any other running
            // `resolve` if any, including subsequent runs
            // that are triggered right after.
            await this.externalResolver({
                forceReadFromFile: true
            });
        }
        //#endregion
        //#region Backup
        get backupDelay() {
            return this.model?.configuration?.backupDelay;
        }
        async backup(token) {
            // Fill in metadata if we are resolved
            let meta = undefined;
            if (this.lastResolvedFileStat) {
                meta = {
                    mtime: this.lastResolvedFileStat.mtime,
                    ctime: this.lastResolvedFileStat.ctime,
                    size: this.lastResolvedFileStat.size,
                    etag: this.lastResolvedFileStat.etag,
                    orphaned: this.isOrphaned()
                };
            }
            // Fill in content if we are resolved
            let content = undefined;
            if (this.isResolved()) {
                content = await (0, async_1.raceCancellation)(this.model.snapshot(token), token);
            }
            return { meta, content };
        }
        static { this.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD = 500; }
        async save(options = Object.create(null)) {
            if (!this.isResolved()) {
                return false;
            }
            if (this.isReadonly()) {
                this.trace('save() - ignoring request for readonly resource');
                return false; // if working copy is readonly we do not attempt to save at all
            }
            if ((this.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */) || this.hasState(5 /* StoredFileWorkingCopyState.ERROR */)) &&
                (options.reason === 2 /* SaveReason.AUTO */ || options.reason === 3 /* SaveReason.FOCUS_CHANGE */ || options.reason === 4 /* SaveReason.WINDOW_CHANGE */)) {
                this.trace('save() - ignoring auto save request for file working copy that is in conflict or error');
                return false; // if working copy is in save conflict or error, do not save unless save reason is explicit
            }
            // Actually do save
            this.trace('save() - enter');
            await this.doSave(options);
            this.trace('save() - exit');
            return this.hasState(0 /* StoredFileWorkingCopyState.SAVED */);
        }
        async doSave(options) {
            if (typeof options.reason !== 'number') {
                options.reason = 1 /* SaveReason.EXPLICIT */;
            }
            let versionId = this.versionId;
            this.trace(`doSave(${versionId}) - enter with versionId ${versionId}`);
            // Return early if saved from within save participant to break recursion
            //
            // Scenario: a save participant triggers a save() on the working copy
            if (this.ignoreSaveFromSaveParticipants) {
                this.trace(`doSave(${versionId}) - exit - refusing to save() recursively from save participant`);
                return;
            }
            // Lookup any running save for this versionId and return it if found
            //
            // Scenario: user invoked the save action multiple times quickly for the same contents
            //           while the save was not yet finished to disk
            //
            if (this.saveSequentializer.isRunning(versionId)) {
                this.trace(`doSave(${versionId}) - exit - found a running save for versionId ${versionId}`);
                return this.saveSequentializer.running;
            }
            // Return early if not dirty (unless forced)
            //
            // Scenario: user invoked save action even though the working copy is not dirty
            if (!options.force && !this.dirty) {
                this.trace(`doSave(${versionId}) - exit - because not dirty and/or versionId is different (this.isDirty: ${this.dirty}, this.versionId: ${this.versionId})`);
                return;
            }
            // Return if currently saving by storing this save request as the next save that should happen.
            // Never ever must 2 saves execute at the same time because this can lead to dirty writes and race conditions.
            //
            // Scenario A: auto save was triggered and is currently busy saving to disk. this takes long enough that another auto save
            //             kicks in.
            // Scenario B: save is very slow (e.g. network share) and the user manages to change the working copy and trigger another save
            //             while the first save has not returned yet.
            //
            if (this.saveSequentializer.isRunning()) {
                this.trace(`doSave(${versionId}) - exit - because busy saving`);
                // Indicate to the save sequentializer that we want to
                // cancel the running operation so that ours can run
                // before the running one finishes.
                // Currently this will try to cancel running save
                // participants and running snapshots from the
                // save operation, but not the actual save which does
                // not support cancellation yet.
                this.saveSequentializer.cancelRunning();
                // Queue this as the upcoming save and return
                return this.saveSequentializer.queue(() => this.doSave(options));
            }
            // Push all edit operations to the undo stack so that the user has a chance to
            // Ctrl+Z back to the saved version.
            if (this.isResolved()) {
                this.model.pushStackElement();
            }
            const saveCancellation = new cancellation_1.CancellationTokenSource();
            return this.saveSequentializer.run(versionId, (async () => {
                // A save participant can still change the working copy now
                // and since we are so close to saving we do not want to trigger
                // another auto save or similar, so we block this
                // In addition we update our version right after in case it changed
                // because of a working copy change
                // Save participants can also be skipped through API.
                if (this.isResolved() && !options.skipSaveParticipants && this.workingCopyFileService.hasSaveParticipants) {
                    try {
                        // Measure the time it took from the last undo/redo operation to this save. If this
                        // time is below `UNDO_REDO_SAVE_PARTICIPANTS_THROTTLE_THRESHOLD`, we make sure to
                        // delay the save participant for the remaining time if the reason is auto save.
                        //
                        // This fixes the following issue:
                        // - the user has configured auto save with delay of 100ms or shorter
                        // - the user has a save participant enabled that modifies the file on each save
                        // - the user types into the file and the file gets saved
                        // - the user triggers undo operation
                        // - this will undo the save participant change but trigger the save participant right after
                        // - the user has no chance to undo over the save participant
                        //
                        // Reported as: https://github.com/microsoft/vscode/issues/102542
                        if (options.reason === 2 /* SaveReason.AUTO */ && typeof this.lastContentChangeFromUndoRedo === 'number') {
                            const timeFromUndoRedoToSave = Date.now() - this.lastContentChangeFromUndoRedo;
                            if (timeFromUndoRedoToSave < StoredFileWorkingCopy_1.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD) {
                                await (0, async_1.timeout)(StoredFileWorkingCopy_1.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD - timeFromUndoRedoToSave);
                            }
                        }
                        // Run save participants unless save was cancelled meanwhile
                        if (!saveCancellation.token.isCancellationRequested) {
                            this.ignoreSaveFromSaveParticipants = true;
                            try {
                                await this.workingCopyFileService.runSaveParticipants(this, { reason: options.reason ?? 1 /* SaveReason.EXPLICIT */ }, saveCancellation.token);
                            }
                            finally {
                                this.ignoreSaveFromSaveParticipants = false;
                            }
                        }
                    }
                    catch (error) {
                        this.logService.error(`[stored file working copy] runSaveParticipants(${versionId}) - resulted in an error: ${error.toString()}`, this.resource.toString(), this.typeId);
                    }
                }
                // It is possible that a subsequent save is cancelling this
                // running save. As such we return early when we detect that.
                if (saveCancellation.token.isCancellationRequested) {
                    return;
                }
                // We have to protect against being disposed at this point. It could be that the save() operation
                // was triggerd followed by a dispose() operation right after without waiting. Typically we cannot
                // be disposed if we are dirty, but if we are not dirty, save() and dispose() can still be triggered
                // one after the other without waiting for the save() to complete. If we are disposed(), we risk
                // saving contents to disk that are stale (see https://github.com/microsoft/vscode/issues/50942).
                // To fix this issue, we will not store the contents to disk when we got disposed.
                if (this.isDisposed()) {
                    return;
                }
                // We require a resolved working copy from this point on, since we are about to write data to disk.
                if (!this.isResolved()) {
                    return;
                }
                // update versionId with its new value (if pre-save changes happened)
                versionId = this.versionId;
                // Clear error flag since we are trying to save again
                this.inErrorMode = false;
                // Save to Disk. We mark the save operation as currently running with
                // the latest versionId because it might have changed from a save
                // participant triggering
                this.trace(`doSave(${versionId}) - before write()`);
                const lastResolvedFileStat = (0, types_1.assertIsDefined)(this.lastResolvedFileStat);
                const resolvedFileWorkingCopy = this;
                return this.saveSequentializer.run(versionId, (async () => {
                    try {
                        const writeFileOptions = {
                            mtime: lastResolvedFileStat.mtime,
                            etag: (options.ignoreModifiedSince || !this.filesConfigurationService.preventSaveConflicts(lastResolvedFileStat.resource)) ? files_1.ETAG_DISABLED : lastResolvedFileStat.etag,
                            unlock: options.writeUnlock
                        };
                        let stat;
                        // Delegate to working copy model save method if any
                        if (typeof resolvedFileWorkingCopy.model.save === 'function') {
                            stat = await resolvedFileWorkingCopy.model.save(writeFileOptions, saveCancellation.token);
                        }
                        // Otherwise ask for a snapshot and save via file services
                        else {
                            // Snapshot working copy model contents
                            const snapshot = await (0, async_1.raceCancellation)(resolvedFileWorkingCopy.model.snapshot(saveCancellation.token), saveCancellation.token);
                            // It is possible that a subsequent save is cancelling this
                            // running save. As such we return early when we detect that
                            // However, we do not pass the token into the file service
                            // because that is an atomic operation currently without
                            // cancellation support, so we dispose the cancellation if
                            // it was not cancelled yet.
                            if (saveCancellation.token.isCancellationRequested) {
                                return;
                            }
                            else {
                                saveCancellation.dispose();
                            }
                            // Write them to disk
                            if (options?.writeElevated && this.elevatedFileService.isSupported(lastResolvedFileStat.resource)) {
                                stat = await this.elevatedFileService.writeFileElevated(lastResolvedFileStat.resource, (0, types_1.assertIsDefined)(snapshot), writeFileOptions);
                            }
                            else {
                                stat = await this.fileService.writeFile(lastResolvedFileStat.resource, (0, types_1.assertIsDefined)(snapshot), writeFileOptions);
                            }
                        }
                        this.handleSaveSuccess(stat, versionId, options);
                    }
                    catch (error) {
                        this.handleSaveError(error, versionId, options);
                    }
                })(), () => saveCancellation.cancel());
            })(), () => saveCancellation.cancel());
        }
        handleSaveSuccess(stat, versionId, options) {
            // Updated resolved stat with updated stat
            this.updateLastResolvedFileStat(stat);
            // Update dirty state unless working copy has changed meanwhile
            if (versionId === this.versionId) {
                this.trace(`handleSaveSuccess(${versionId}) - setting dirty to false because versionId did not change`);
                this.setDirty(false);
            }
            else {
                this.trace(`handleSaveSuccess(${versionId}) - not setting dirty to false because versionId did change meanwhile`);
            }
            // Update orphan state given save was successful
            this.setOrphaned(false);
            // Emit Save Event
            this._onDidSave.fire({ reason: options.reason, stat, source: options.source });
        }
        handleSaveError(error, versionId, options) {
            (options.ignoreErrorHandler ? this.logService.trace : this.logService.error).apply(this.logService, [`[stored file working copy] handleSaveError(${versionId}) - exit - resulted in a save error: ${error.toString()}`, this.resource.toString(), this.typeId]);
            // Return early if the save() call was made asking to
            // handle the save error itself.
            if (options.ignoreErrorHandler) {
                throw error;
            }
            // In any case of an error, we mark the working copy as dirty to prevent data loss
            // It could be possible that the write corrupted the file on disk (e.g. when
            // an error happened after truncating the file) and as such we want to preserve
            // the working copy contents to prevent data loss.
            this.setDirty(true);
            // Flag as error state
            this.inErrorMode = true;
            // Look out for a save conflict
            if (error.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                this.inConflictMode = true;
            }
            // Show save error to user for handling
            this.doHandleSaveError(error);
            // Emit as event
            this._onDidSaveError.fire();
        }
        doHandleSaveError(error) {
            const fileOperationError = error;
            const primaryActions = [];
            let message;
            // Dirty write prevention
            if (fileOperationError.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                message = (0, nls_1.localize)('staleSaveError', "Failed to save '{0}': The content of the file is newer. Do you want to overwrite the file with your changes?", this.name);
                primaryActions.push((0, actions_1.toAction)({ id: 'fileWorkingCopy.overwrite', label: (0, nls_1.localize)('overwrite', "Overwrite"), run: () => this.save({ ignoreModifiedSince: true }) }));
                primaryActions.push((0, actions_1.toAction)({ id: 'fileWorkingCopy.revert', label: (0, nls_1.localize)('discard', "Discard"), run: () => this.revert() }));
            }
            // Any other save error
            else {
                const isWriteLocked = fileOperationError.fileOperationResult === 5 /* FileOperationResult.FILE_WRITE_LOCKED */;
                const triedToUnlock = isWriteLocked && fileOperationError.options?.unlock;
                const isPermissionDenied = fileOperationError.fileOperationResult === 6 /* FileOperationResult.FILE_PERMISSION_DENIED */;
                const canSaveElevated = this.elevatedFileService.isSupported(this.resource);
                // Error with Actions
                if ((0, errorMessage_1.isErrorWithActions)(error)) {
                    primaryActions.push(...error.actions);
                }
                // Save Elevated
                if (canSaveElevated && (isPermissionDenied || triedToUnlock)) {
                    primaryActions.push((0, actions_1.toAction)({
                        id: 'fileWorkingCopy.saveElevated',
                        label: triedToUnlock ?
                            platform_1.isWindows ? (0, nls_1.localize)('overwriteElevated', "Overwrite as Admin...") : (0, nls_1.localize)('overwriteElevatedSudo', "Overwrite as Sudo...") :
                            platform_1.isWindows ? (0, nls_1.localize)('saveElevated', "Retry as Admin...") : (0, nls_1.localize)('saveElevatedSudo', "Retry as Sudo..."),
                        run: () => {
                            this.save({ writeElevated: true, writeUnlock: triedToUnlock, reason: 1 /* SaveReason.EXPLICIT */ });
                        }
                    }));
                }
                // Unlock
                else if (isWriteLocked) {
                    primaryActions.push((0, actions_1.toAction)({ id: 'fileWorkingCopy.unlock', label: (0, nls_1.localize)('overwrite', "Overwrite"), run: () => this.save({ writeUnlock: true, reason: 1 /* SaveReason.EXPLICIT */ }) }));
                }
                // Retry
                else {
                    primaryActions.push((0, actions_1.toAction)({ id: 'fileWorkingCopy.retry', label: (0, nls_1.localize)('retry', "Retry"), run: () => this.save({ reason: 1 /* SaveReason.EXPLICIT */ }) }));
                }
                // Save As
                primaryActions.push((0, actions_1.toAction)({
                    id: 'fileWorkingCopy.saveAs',
                    label: (0, nls_1.localize)('saveAs', "Save As..."),
                    run: async () => {
                        const editor = this.workingCopyEditorService.findEditor(this);
                        if (editor) {
                            const result = await this.editorService.save(editor, { saveAs: true, reason: 1 /* SaveReason.EXPLICIT */ });
                            if (!result.success) {
                                this.doHandleSaveError(error); // show error again given the operation failed
                            }
                        }
                    }
                }));
                // Discard
                primaryActions.push((0, actions_1.toAction)({ id: 'fileWorkingCopy.revert', label: (0, nls_1.localize)('discard', "Discard"), run: () => this.revert() }));
                // Message
                if (isWriteLocked) {
                    if (triedToUnlock && canSaveElevated) {
                        message = platform_1.isWindows ?
                            (0, nls_1.localize)('readonlySaveErrorAdmin', "Failed to save '{0}': File is read-only. Select 'Overwrite as Admin' to retry as administrator.", this.name) :
                            (0, nls_1.localize)('readonlySaveErrorSudo', "Failed to save '{0}': File is read-only. Select 'Overwrite as Sudo' to retry as superuser.", this.name);
                    }
                    else {
                        message = (0, nls_1.localize)('readonlySaveError', "Failed to save '{0}': File is read-only. Select 'Overwrite' to attempt to make it writeable.", this.name);
                    }
                }
                else if (canSaveElevated && isPermissionDenied) {
                    message = platform_1.isWindows ?
                        (0, nls_1.localize)('permissionDeniedSaveError', "Failed to save '{0}': Insufficient permissions. Select 'Retry as Admin' to retry as administrator.", this.name) :
                        (0, nls_1.localize)('permissionDeniedSaveErrorSudo', "Failed to save '{0}': Insufficient permissions. Select 'Retry as Sudo' to retry as superuser.", this.name);
                }
                else {
                    message = (0, nls_1.localize)({ key: 'genericSaveError', comment: ['{0} is the resource that failed to save and {1} the error message'] }, "Failed to save '{0}': {1}", this.name, (0, errorMessage_1.toErrorMessage)(error, false));
                }
            }
            // Show to the user as notification
            const handle = this.notificationService.notify({ id: `${(0, hash_1.hash)(this.resource.toString())}`, severity: notification_1.Severity.Error, message, actions: { primary: primaryActions } });
            // Remove automatically when we get saved/reverted
            const listener = this._register(event_1.Event.once(event_1.Event.any(this.onDidSave, this.onDidRevert))(() => handle.close()));
            this._register(event_1.Event.once(handle.onDidClose)(() => listener.dispose()));
        }
        updateLastResolvedFileStat(newFileStat) {
            const oldReadonly = this.isReadonly();
            // First resolve - just take
            if (!this.lastResolvedFileStat) {
                this.lastResolvedFileStat = newFileStat;
            }
            // Subsequent resolve - make sure that we only assign it if the mtime
            // is equal or has advanced.
            // This prevents race conditions from resolving and saving. If a save
            // comes in late after a revert was called, the mtime could be out of
            // sync.
            else if (this.lastResolvedFileStat.mtime <= newFileStat.mtime) {
                this.lastResolvedFileStat = newFileStat;
            }
            // Signal that the readonly state changed
            if (this.isReadonly() !== oldReadonly) {
                this._onDidChangeReadonly.fire();
            }
        }
        //#endregion
        //#region Revert
        async revert(options) {
            if (!this.isResolved() || (!this.dirty && !options?.force)) {
                return; // ignore if not resolved or not dirty and not enforced
            }
            this.trace('revert()');
            // Unset flags
            const wasDirty = this.dirty;
            const undoSetDirty = this.doSetDirty(false);
            // Force read from disk unless reverting soft
            const softUndo = options?.soft;
            if (!softUndo) {
                try {
                    await this.forceResolveFromFile();
                }
                catch (error) {
                    // FileNotFound means the file got deleted meanwhile, so ignore it
                    if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        // Set flags back to previous values, we are still dirty if revert failed
                        undoSetDirty();
                        throw error;
                    }
                }
            }
            // Emit file change event
            this._onDidRevert.fire();
            // Emit dirty change event
            if (wasDirty) {
                this._onDidChangeDirty.fire();
            }
        }
        hasState(state) {
            switch (state) {
                case 3 /* StoredFileWorkingCopyState.CONFLICT */:
                    return this.inConflictMode;
                case 1 /* StoredFileWorkingCopyState.DIRTY */:
                    return this.dirty;
                case 5 /* StoredFileWorkingCopyState.ERROR */:
                    return this.inErrorMode;
                case 4 /* StoredFileWorkingCopyState.ORPHAN */:
                    return this.isOrphaned();
                case 2 /* StoredFileWorkingCopyState.PENDING_SAVE */:
                    return this.saveSequentializer.isRunning();
                case 0 /* StoredFileWorkingCopyState.SAVED */:
                    return !this.dirty;
            }
        }
        async joinState(state) {
            return this.saveSequentializer.running;
        }
        //#endregion
        //#region Utilities
        isReadonly() {
            return this.filesConfigurationService.isReadonly(this.resource, this.lastResolvedFileStat);
        }
        trace(msg) {
            this.logService.trace(`[stored file working copy] ${msg}`, this.resource.toString(), this.typeId);
        }
        //#endregion
        //#region Dispose
        dispose() {
            this.trace('dispose()');
            // State
            this.inConflictMode = false;
            this.inErrorMode = false;
            // Free up model for GC
            this._model = undefined;
            super.dispose();
        }
    };
    exports.StoredFileWorkingCopy = StoredFileWorkingCopy;
    exports.StoredFileWorkingCopy = StoredFileWorkingCopy = StoredFileWorkingCopy_1 = __decorate([
        __param(5, files_1.IFileService),
        __param(6, log_1.ILogService),
        __param(7, workingCopyFileService_1.IWorkingCopyFileService),
        __param(8, filesConfigurationService_1.IFilesConfigurationService),
        __param(9, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(10, workingCopyService_1.IWorkingCopyService),
        __param(11, notification_1.INotificationService),
        __param(12, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(13, editorService_1.IEditorService),
        __param(14, elevatedFileService_1.IElevatedFileService)
    ], StoredFileWorkingCopy);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmVkRmlsZVdvcmtpbmdDb3B5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtpbmdDb3B5L2NvbW1vbi9zdG9yZWRGaWxlV29ya2luZ0NvcHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXFLaEc7O09BRUc7SUFDSCxJQUFrQiwwQkFxQ2pCO0lBckNELFdBQWtCLDBCQUEwQjtRQUUzQzs7V0FFRztRQUNILDZFQUFLLENBQUE7UUFFTDs7V0FFRztRQUNILDZFQUFLLENBQUE7UUFFTDs7O1dBR0c7UUFDSCwyRkFBWSxDQUFBO1FBRVo7Ozs7V0FJRztRQUNILG1GQUFRLENBQUE7UUFFUjs7O1dBR0c7UUFDSCwrRUFBTSxDQUFBO1FBRU47Ozs7V0FJRztRQUNILDZFQUFLLENBQUE7SUFDTixDQUFDLEVBckNpQiwwQkFBMEIsMENBQTFCLDBCQUEwQixRQXFDM0M7SUE2RUQsU0FBZ0IsZ0NBQWdDLENBQUMsQ0FBd0I7UUFDeEUsTUFBTSxTQUFTLEdBQUcsQ0FBb0MsQ0FBQztRQUV2RCxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO0lBQ3pCLENBQUM7SUFKRCw0RUFJQztJQUVNLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQTZELFNBQVEseUNBQW1COztRQUtwRyxJQUFJLEtBQUssS0FBb0IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQXlCbEQsWUFBWTtRQUVaLFlBQ1UsTUFBYyxFQUN2QixRQUFhLEVBQ0osSUFBWSxFQUNKLFlBQW1ELEVBQ25ELGdCQUFnRCxFQUNuRCxXQUF5QixFQUMxQixVQUF3QyxFQUM1QixzQkFBZ0UsRUFDN0QseUJBQXNFLEVBQ3ZFLHdCQUFvRSxFQUMxRSxrQkFBdUMsRUFDdEMsbUJBQTBELEVBQ3JELHdCQUFvRSxFQUMvRSxh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