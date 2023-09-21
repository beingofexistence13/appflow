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
define(["require", "exports", "vs/nls!vs/workbench/services/workingCopy/common/storedFileWorkingCopy", "vs/base/common/event", "vs/base/common/cancellation", "vs/platform/files/common/files", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/async", "vs/platform/log/common/log", "vs/base/common/types", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/notification/common/notification", "vs/base/common/hash", "vs/base/common/errorMessage", "vs/base/common/actions", "vs/base/common/platform", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/workingCopy/common/resourceWorkingCopy"], function (require, exports, nls_1, event_1, cancellation_1, files_1, workingCopyService_1, async_1, log_1, types_1, workingCopyFileService_1, filesConfigurationService_1, workingCopyBackup_1, notification_1, hash_1, errorMessage_1, actions_1, platform_1, workingCopyEditorService_1, editorService_1, elevatedFileService_1, resourceWorkingCopy_1) {
    "use strict";
    var $FD_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FD = exports.$ED = exports.StoredFileWorkingCopyState = void 0;
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
    function $ED(e) {
        const candidate = e;
        return !!candidate.stat;
    }
    exports.$ED = $ED;
    let $FD = class $FD extends resourceWorkingCopy_1.$DD {
        static { $FD_1 = this; }
        get model() { return this.m; }
        //#endregion
        constructor(typeId, resource, name, z, C, fileService, D, F, G, H, workingCopyService, I, J, L, N) {
            super(resource, fileService);
            this.typeId = typeId;
            this.name = name;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.N = N;
            this.capabilities = 0 /* WorkingCopyCapabilities.None */;
            this.m = undefined;
            //#region events
            this.n = this.B(new event_1.$fd());
            this.onDidChangeContent = this.n.event;
            this.r = this.B(new event_1.$fd());
            this.onDidResolve = this.r.event;
            this.s = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.s.event;
            this.t = this.B(new event_1.$fd());
            this.onDidSaveError = this.t.event;
            this.u = this.B(new event_1.$fd());
            this.onDidSave = this.u.event;
            this.w = this.B(new event_1.$fd());
            this.onDidRevert = this.w.event;
            this.y = this.B(new event_1.$fd());
            this.onDidChangeReadonly = this.y.event;
            //#region Dirty
            this.P = false;
            this.cb = false;
            //#endregion
            //#region Save
            this.hb = 0;
            this.jb = undefined;
            this.kb = new async_1.$Zg();
            this.lb = false;
            //#endregion
            //#region State
            this.rb = false;
            this.sb = false;
            // Make known to working copy service
            this.B(workingCopyService.registerWorkingCopy(this));
            this.O();
        }
        O() {
            this.B(this.G.onReadonlyChange(() => this.y.fire()));
        }
        isDirty() {
            return this.P;
        }
        markModified() {
            this.R(true); // stored file working copy tracks modified via dirty
        }
        R(dirty) {
            if (!this.isResolved()) {
                return; // only resolved working copies can be marked dirty
            }
            // Track dirty state and version id
            const wasDirty = this.P;
            this.S(dirty);
            // Emit as Event if dirty changed
            if (dirty !== wasDirty) {
                this.s.fire();
            }
        }
        S(dirty) {
            const wasDirty = this.P;
            const wasInConflictMode = this.rb;
            const wasInErrorMode = this.sb;
            const oldSavedVersionId = this.Q;
            if (!dirty) {
                this.P = false;
                this.rb = false;
                this.sb = false;
                // we remember the models alternate version id to remember when the version
                // of the model matches with the saved version on disk. we need to keep this
                // in order to find out if the model changed back to a saved version (e.g.
                // when undoing long enough to reach to a version that is saved and then to
                // clear the dirty flag)
                if (this.isResolved()) {
                    this.Q = this.model.versionId;
                }
            }
            else {
                this.P = true;
            }
            // Return function to revert this call
            return () => {
                this.P = wasDirty;
                this.rb = wasInConflictMode;
                this.sb = wasInErrorMode;
                this.Q = oldSavedVersionId;
            };
        }
        isResolved() {
            return !!this.model;
        }
        async resolve(options) {
            this.tb('resolve() - enter');
            // Return early if we are disposed
            if (this.isDisposed()) {
                this.tb('resolve() - exit - without resolving because file working copy is disposed');
                return;
            }
            // Unless there are explicit contents provided, it is important that we do not
            // resolve a working copy that is dirty or is in the process of saving to prevent
            // data loss.
            if (!options?.contents && (this.P || this.kb.isRunning())) {
                this.tb('resolve() - exit - without resolving because file working copy is dirty or being saved');
                return;
            }
            return this.W(options);
        }
        async W(options) {
            // First check if we have contents to use for the working copy
            if (options?.contents) {
                return this.X(options.contents);
            }
            // Second, check if we have a backup to resolve from (only for new working copies)
            const isNew = !this.isResolved();
            if (isNew) {
                const resolvedFromBackup = await this.Y();
                if (resolvedFromBackup) {
                    return;
                }
            }
            // Finally, resolve from file resource
            return this.$(options);
        }
        async X(buffer) {
            this.tb('resolveFromBuffer()');
            // Try to resolve metdata from disk
            let mtime;
            let ctime;
            let size;
            let etag;
            try {
                const metadata = await this.a.stat(this.resource);
                mtime = metadata.mtime;
                ctime = metadata.ctime;
                size = metadata.size;
                etag = metadata.etag;
                // Clear orphaned state when resolving was successful
                this.g(false);
            }
            catch (error) {
                // Put some fallback values in error case
                mtime = Date.now();
                ctime = Date.now();
                size = 0;
                etag = files_1.$xk;
                // Apply orphaned state based on error code
                this.g(error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */);
            }
            // Resolve with buffer
            return this.ab({
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
        async Y() {
            // Resolve backup if any
            const backup = await this.H.resolve(this);
            // Abort if someone else managed to resolve the working copy by now
            const isNew = !this.isResolved();
            if (!isNew) {
                this.tb('resolveFromBackup() - exit - withoutresolving because previously new file working copy got created meanwhile');
                return true; // imply that resolving has happened in another operation
            }
            // Try to resolve from backup if we have any
            if (backup) {
                await this.Z(backup);
                return true;
            }
            // Otherwise signal back that resolving did not happen
            return false;
        }
        async Z(backup) {
            this.tb('doResolveFromBackup()');
            // Resolve with backup
            await this.ab({
                resource: this.resource,
                name: this.name,
                mtime: backup.meta ? backup.meta.mtime : Date.now(),
                ctime: backup.meta ? backup.meta.ctime : Date.now(),
                size: backup.meta ? backup.meta.size : 0,
                etag: backup.meta ? backup.meta.etag : files_1.$xk,
                value: backup.value,
                readonly: false,
                locked: false
            }, true /* dirty (resolved from backup) */);
            // Restore orphaned flag based on state
            if (backup.meta && backup.meta.orphaned) {
                this.g(true);
            }
        }
        async $(options) {
            this.tb('resolveFromFile()');
            const forceReadFromFile = options?.forceReadFromFile;
            // Decide on etag
            let etag;
            if (forceReadFromFile) {
                etag = files_1.$xk; // disable ETag if we enforce to read from disk
            }
            else if (this.U) {
                etag = this.U.etag; // otherwise respect etag to support caching
            }
            // Remember current version before doing any long running operation
            // to ensure we are not changing a working copy that was changed
            // meanwhile
            const currentVersionId = this.hb;
            // Resolve Content
            try {
                const content = await this.a.readFileStream(this.resource, { etag });
                // Clear orphaned state when resolving was successful
                this.g(false);
                // Return early if the working copy content has changed
                // meanwhile to prevent loosing any changes
                if (currentVersionId !== this.hb) {
                    this.tb('resolveFromFile() - exit - without resolving because file working copy content changed');
                    return;
                }
                await this.ab(content, false /* not dirty (resolved from file) */);
            }
            catch (error) {
                const result = error.fileOperationResult;
                // Apply orphaned state based on error code
                this.g(result === 1 /* FileOperationResult.FILE_NOT_FOUND */);
                // NotModified status is expected and can be handled gracefully
                // if we are resolved. We still want to update our last resolved
                // stat to e.g. detect changes to the file's readonly state
                if (this.isResolved() && result === 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */) {
                    if (error instanceof files_1.$pk) {
                        this.qb(error.stat);
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
        async ab(content, dirty) {
            this.tb('resolveFromContent() - enter');
            // Return early if we are disposed
            if (this.isDisposed()) {
                this.tb('resolveFromContent() - exit - because working copy is disposed');
                return;
            }
            // Update our resolved disk stat
            this.qb({
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
                await this.db(content.value);
            }
            // Create new model otherwise
            else {
                await this.bb(content.value);
            }
            // Update working copy dirty flag. This is very important to call
            // in both cases of dirty or not because it conditionally updates
            // the `savedVersionId` to determine the version when to consider
            // the working copy as saved again (e.g. when undoing back to the
            // saved state)
            this.R(!!dirty);
            // Emit as event
            this.r.fire();
        }
        async bb(contents) {
            this.tb('doCreateModel()');
            // Create model and dispose it when we get disposed
            this.m = this.B(await this.z.createModel(this.resource, contents, cancellation_1.CancellationToken.None));
            // Model listeners
            this.eb(this.m);
        }
        async db(contents) {
            this.tb('doUpdateModel()');
            // Update model value in a block that ignores content change events for dirty tracking
            this.cb = true;
            try {
                await this.model?.update(contents, cancellation_1.CancellationToken.None);
            }
            finally {
                this.cb = false;
            }
        }
        eb(model) {
            // See https://github.com/microsoft/vscode/issues/30189
            // This code has been extracted to a different method because it caused a memory leak
            // where `value` was captured in the content change listener closure scope.
            // Content Change
            this.B(model.onDidChangeContent(e => this.fb(model, e.isUndoing || e.isRedoing)));
            // Lifecycle
            this.B(model.onWillDispose(() => this.dispose()));
        }
        fb(model, isUndoingOrRedoing) {
            this.tb(`onModelContentChanged() - enter`);
            // In any case increment the version id because it tracks the content state of the model at all times
            this.hb++;
            this.tb(`onModelContentChanged() - new versionId ${this.hb}`);
            // Remember when the user changed the model through a undo/redo operation.
            // We need this information to throttle save participants to fix
            // https://github.com/microsoft/vscode/issues/102542
            if (isUndoingOrRedoing) {
                this.jb = Date.now();
            }
            // We mark check for a dirty-state change upon model content change, unless:
            // - explicitly instructed to ignore it (e.g. from model.resolve())
            // - the model is readonly (in that case we never assume the change was done by the user)
            if (!this.cb && !this.isReadonly()) {
                // The contents changed as a matter of Undo and the version reached matches the saved one
                // In this case we clear the dirty flag and emit a SAVED event to indicate this state.
                if (model.versionId === this.Q) {
                    this.tb('onModelContentChanged() - model content changed back to last saved version');
                    // Clear flags
                    const wasDirty = this.P;
                    this.R(false);
                    // Emit revert event if we were dirty
                    if (wasDirty) {
                        this.w.fire();
                    }
                }
                // Otherwise the content has changed and we signal this as becoming dirty
                else {
                    this.tb('onModelContentChanged() - model content changed and marked as dirty');
                    // Mark as dirty
                    this.R(true);
                }
            }
            // Emit as event
            this.n.fire();
        }
        async gb() {
            if (this.isDisposed()) {
                return; // return early when the working copy is invalid
            }
            // We go through the resolver to make
            // sure this kind of `resolve` is properly
            // running in sequence with any other running
            // `resolve` if any, including subsequent runs
            // that are triggered right after.
            await this.C({
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
            if (this.U) {
                meta = {
                    mtime: this.U.mtime,
                    ctime: this.U.ctime,
                    size: this.U.size,
                    etag: this.U.etag,
                    orphaned: this.isOrphaned()
                };
            }
            // Fill in content if we are resolved
            let content = undefined;
            if (this.isResolved()) {
                content = await (0, async_1.$vg)(this.model.snapshot(token), token);
            }
            return { meta, content };
        }
        static { this.ib = 500; }
        async save(options = Object.create(null)) {
            if (!this.isResolved()) {
                return false;
            }
            if (this.isReadonly()) {
                this.tb('save() - ignoring request for readonly resource');
                return false; // if working copy is readonly we do not attempt to save at all
            }
            if ((this.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */) || this.hasState(5 /* StoredFileWorkingCopyState.ERROR */)) &&
                (options.reason === 2 /* SaveReason.AUTO */ || options.reason === 3 /* SaveReason.FOCUS_CHANGE */ || options.reason === 4 /* SaveReason.WINDOW_CHANGE */)) {
                this.tb('save() - ignoring auto save request for file working copy that is in conflict or error');
                return false; // if working copy is in save conflict or error, do not save unless save reason is explicit
            }
            // Actually do save
            this.tb('save() - enter');
            await this.mb(options);
            this.tb('save() - exit');
            return this.hasState(0 /* StoredFileWorkingCopyState.SAVED */);
        }
        async mb(options) {
            if (typeof options.reason !== 'number') {
                options.reason = 1 /* SaveReason.EXPLICIT */;
            }
            let versionId = this.hb;
            this.tb(`doSave(${versionId}) - enter with versionId ${versionId}`);
            // Return early if saved from within save participant to break recursion
            //
            // Scenario: a save participant triggers a save() on the working copy
            if (this.lb) {
                this.tb(`doSave(${versionId}) - exit - refusing to save() recursively from save participant`);
                return;
            }
            // Lookup any running save for this versionId and return it if found
            //
            // Scenario: user invoked the save action multiple times quickly for the same contents
            //           while the save was not yet finished to disk
            //
            if (this.kb.isRunning(versionId)) {
                this.tb(`doSave(${versionId}) - exit - found a running save for versionId ${versionId}`);
                return this.kb.running;
            }
            // Return early if not dirty (unless forced)
            //
            // Scenario: user invoked save action even though the working copy is not dirty
            if (!options.force && !this.P) {
                this.tb(`doSave(${versionId}) - exit - because not dirty and/or versionId is different (this.isDirty: ${this.P}, this.versionId: ${this.hb})`);
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
            if (this.kb.isRunning()) {
                this.tb(`doSave(${versionId}) - exit - because busy saving`);
                // Indicate to the save sequentializer that we want to
                // cancel the running operation so that ours can run
                // before the running one finishes.
                // Currently this will try to cancel running save
                // participants and running snapshots from the
                // save operation, but not the actual save which does
                // not support cancellation yet.
                this.kb.cancelRunning();
                // Queue this as the upcoming save and return
                return this.kb.queue(() => this.mb(options));
            }
            // Push all edit operations to the undo stack so that the user has a chance to
            // Ctrl+Z back to the saved version.
            if (this.isResolved()) {
                this.model.pushStackElement();
            }
            const saveCancellation = new cancellation_1.$pd();
            return this.kb.run(versionId, (async () => {
                // A save participant can still change the working copy now
                // and since we are so close to saving we do not want to trigger
                // another auto save or similar, so we block this
                // In addition we update our version right after in case it changed
                // because of a working copy change
                // Save participants can also be skipped through API.
                if (this.isResolved() && !options.skipSaveParticipants && this.F.hasSaveParticipants) {
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
                        if (options.reason === 2 /* SaveReason.AUTO */ && typeof this.jb === 'number') {
                            const timeFromUndoRedoToSave = Date.now() - this.jb;
                            if (timeFromUndoRedoToSave < $FD_1.ib) {
                                await (0, async_1.$Hg)($FD_1.ib - timeFromUndoRedoToSave);
                            }
                        }
                        // Run save participants unless save was cancelled meanwhile
                        if (!saveCancellation.token.isCancellationRequested) {
                            this.lb = true;
                            try {
                                await this.F.runSaveParticipants(this, { reason: options.reason ?? 1 /* SaveReason.EXPLICIT */ }, saveCancellation.token);
                            }
                            finally {
                                this.lb = false;
                            }
                        }
                    }
                    catch (error) {
                        this.D.error(`[stored file working copy] runSaveParticipants(${versionId}) - resulted in an error: ${error.toString()}`, this.resource.toString(), this.typeId);
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
                versionId = this.hb;
                // Clear error flag since we are trying to save again
                this.sb = false;
                // Save to Disk. We mark the save operation as currently running with
                // the latest versionId because it might have changed from a save
                // participant triggering
                this.tb(`doSave(${versionId}) - before write()`);
                const lastResolvedFileStat = (0, types_1.$uf)(this.U);
                const resolvedFileWorkingCopy = this;
                return this.kb.run(versionId, (async () => {
                    try {
                        const writeFileOptions = {
                            mtime: lastResolvedFileStat.mtime,
                            etag: (options.ignoreModifiedSince || !this.G.preventSaveConflicts(lastResolvedFileStat.resource)) ? files_1.$xk : lastResolvedFileStat.etag,
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
                            const snapshot = await (0, async_1.$vg)(resolvedFileWorkingCopy.model.snapshot(saveCancellation.token), saveCancellation.token);
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
                            if (options?.writeElevated && this.N.isSupported(lastResolvedFileStat.resource)) {
                                stat = await this.N.writeFileElevated(lastResolvedFileStat.resource, (0, types_1.$uf)(snapshot), writeFileOptions);
                            }
                            else {
                                stat = await this.a.writeFile(lastResolvedFileStat.resource, (0, types_1.$uf)(snapshot), writeFileOptions);
                            }
                        }
                        this.nb(stat, versionId, options);
                    }
                    catch (error) {
                        this.ob(error, versionId, options);
                    }
                })(), () => saveCancellation.cancel());
            })(), () => saveCancellation.cancel());
        }
        nb(stat, versionId, options) {
            // Updated resolved stat with updated stat
            this.qb(stat);
            // Update dirty state unless working copy has changed meanwhile
            if (versionId === this.hb) {
                this.tb(`handleSaveSuccess(${versionId}) - setting dirty to false because versionId did not change`);
                this.R(false);
            }
            else {
                this.tb(`handleSaveSuccess(${versionId}) - not setting dirty to false because versionId did change meanwhile`);
            }
            // Update orphan state given save was successful
            this.g(false);
            // Emit Save Event
            this.u.fire({ reason: options.reason, stat, source: options.source });
        }
        ob(error, versionId, options) {
            (options.ignoreErrorHandler ? this.D.trace : this.D.error).apply(this.D, [`[stored file working copy] handleSaveError(${versionId}) - exit - resulted in a save error: ${error.toString()}`, this.resource.toString(), this.typeId]);
            // Return early if the save() call was made asking to
            // handle the save error itself.
            if (options.ignoreErrorHandler) {
                throw error;
            }
            // In any case of an error, we mark the working copy as dirty to prevent data loss
            // It could be possible that the write corrupted the file on disk (e.g. when
            // an error happened after truncating the file) and as such we want to preserve
            // the working copy contents to prevent data loss.
            this.R(true);
            // Flag as error state
            this.sb = true;
            // Look out for a save conflict
            if (error.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                this.rb = true;
            }
            // Show save error to user for handling
            this.pb(error);
            // Emit as event
            this.t.fire();
        }
        pb(error) {
            const fileOperationError = error;
            const primaryActions = [];
            let message;
            // Dirty write prevention
            if (fileOperationError.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                message = (0, nls_1.localize)(0, null, this.name);
                primaryActions.push((0, actions_1.$li)({ id: 'fileWorkingCopy.overwrite', label: (0, nls_1.localize)(1, null), run: () => this.save({ ignoreModifiedSince: true }) }));
                primaryActions.push((0, actions_1.$li)({ id: 'fileWorkingCopy.revert', label: (0, nls_1.localize)(2, null), run: () => this.revert() }));
            }
            // Any other save error
            else {
                const isWriteLocked = fileOperationError.fileOperationResult === 5 /* FileOperationResult.FILE_WRITE_LOCKED */;
                const triedToUnlock = isWriteLocked && fileOperationError.options?.unlock;
                const isPermissionDenied = fileOperationError.fileOperationResult === 6 /* FileOperationResult.FILE_PERMISSION_DENIED */;
                const canSaveElevated = this.N.isSupported(this.resource);
                // Error with Actions
                if ((0, errorMessage_1.$ni)(error)) {
                    primaryActions.push(...error.actions);
                }
                // Save Elevated
                if (canSaveElevated && (isPermissionDenied || triedToUnlock)) {
                    primaryActions.push((0, actions_1.$li)({
                        id: 'fileWorkingCopy.saveElevated',
                        label: triedToUnlock ?
                            platform_1.$i ? (0, nls_1.localize)(3, null) : (0, nls_1.localize)(4, null) :
                            platform_1.$i ? (0, nls_1.localize)(5, null) : (0, nls_1.localize)(6, null),
                        run: () => {
                            this.save({ writeElevated: true, writeUnlock: triedToUnlock, reason: 1 /* SaveReason.EXPLICIT */ });
                        }
                    }));
                }
                // Unlock
                else if (isWriteLocked) {
                    primaryActions.push((0, actions_1.$li)({ id: 'fileWorkingCopy.unlock', label: (0, nls_1.localize)(7, null), run: () => this.save({ writeUnlock: true, reason: 1 /* SaveReason.EXPLICIT */ }) }));
                }
                // Retry
                else {
                    primaryActions.push((0, actions_1.$li)({ id: 'fileWorkingCopy.retry', label: (0, nls_1.localize)(8, null), run: () => this.save({ reason: 1 /* SaveReason.EXPLICIT */ }) }));
                }
                // Save As
                primaryActions.push((0, actions_1.$li)({
                    id: 'fileWorkingCopy.saveAs',
                    label: (0, nls_1.localize)(9, null),
                    run: async () => {
                        const editor = this.J.findEditor(this);
                        if (editor) {
                            const result = await this.L.save(editor, { saveAs: true, reason: 1 /* SaveReason.EXPLICIT */ });
                            if (!result.success) {
                                this.pb(error); // show error again given the operation failed
                            }
                        }
                    }
                }));
                // Discard
                primaryActions.push((0, actions_1.$li)({ id: 'fileWorkingCopy.revert', label: (0, nls_1.localize)(10, null), run: () => this.revert() }));
                // Message
                if (isWriteLocked) {
                    if (triedToUnlock && canSaveElevated) {
                        message = platform_1.$i ?
                            (0, nls_1.localize)(11, null, this.name) :
                            (0, nls_1.localize)(12, null, this.name);
                    }
                    else {
                        message = (0, nls_1.localize)(13, null, this.name);
                    }
                }
                else if (canSaveElevated && isPermissionDenied) {
                    message = platform_1.$i ?
                        (0, nls_1.localize)(14, null, this.name) :
                        (0, nls_1.localize)(15, null, this.name);
                }
                else {
                    message = (0, nls_1.localize)(16, null, this.name, (0, errorMessage_1.$mi)(error, false));
                }
            }
            // Show to the user as notification
            const handle = this.I.notify({ id: `${(0, hash_1.$pi)(this.resource.toString())}`, severity: notification_1.Severity.Error, message, actions: { primary: primaryActions } });
            // Remove automatically when we get saved/reverted
            const listener = this.B(event_1.Event.once(event_1.Event.any(this.onDidSave, this.onDidRevert))(() => handle.close()));
            this.B(event_1.Event.once(handle.onDidClose)(() => listener.dispose()));
        }
        qb(newFileStat) {
            const oldReadonly = this.isReadonly();
            // First resolve - just take
            if (!this.U) {
                this.U = newFileStat;
            }
            // Subsequent resolve - make sure that we only assign it if the mtime
            // is equal or has advanced.
            // This prevents race conditions from resolving and saving. If a save
            // comes in late after a revert was called, the mtime could be out of
            // sync.
            else if (this.U.mtime <= newFileStat.mtime) {
                this.U = newFileStat;
            }
            // Signal that the readonly state changed
            if (this.isReadonly() !== oldReadonly) {
                this.y.fire();
            }
        }
        //#endregion
        //#region Revert
        async revert(options) {
            if (!this.isResolved() || (!this.P && !options?.force)) {
                return; // ignore if not resolved or not dirty and not enforced
            }
            this.tb('revert()');
            // Unset flags
            const wasDirty = this.P;
            const undoSetDirty = this.S(false);
            // Force read from disk unless reverting soft
            const softUndo = options?.soft;
            if (!softUndo) {
                try {
                    await this.gb();
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
            this.w.fire();
            // Emit dirty change event
            if (wasDirty) {
                this.s.fire();
            }
        }
        hasState(state) {
            switch (state) {
                case 3 /* StoredFileWorkingCopyState.CONFLICT */:
                    return this.rb;
                case 1 /* StoredFileWorkingCopyState.DIRTY */:
                    return this.P;
                case 5 /* StoredFileWorkingCopyState.ERROR */:
                    return this.sb;
                case 4 /* StoredFileWorkingCopyState.ORPHAN */:
                    return this.isOrphaned();
                case 2 /* StoredFileWorkingCopyState.PENDING_SAVE */:
                    return this.kb.isRunning();
                case 0 /* StoredFileWorkingCopyState.SAVED */:
                    return !this.P;
            }
        }
        async joinState(state) {
            return this.kb.running;
        }
        //#endregion
        //#region Utilities
        isReadonly() {
            return this.G.isReadonly(this.resource, this.U);
        }
        tb(msg) {
            this.D.trace(`[stored file working copy] ${msg}`, this.resource.toString(), this.typeId);
        }
        //#endregion
        //#region Dispose
        dispose() {
            this.tb('dispose()');
            // State
            this.rb = false;
            this.sb = false;
            // Free up model for GC
            this.m = undefined;
            super.dispose();
        }
    };
    exports.$FD = $FD;
    exports.$FD = $FD = $FD_1 = __decorate([
        __param(5, files_1.$6j),
        __param(6, log_1.$5i),
        __param(7, workingCopyFileService_1.$HD),
        __param(8, filesConfigurationService_1.$yD),
        __param(9, workingCopyBackup_1.$EA),
        __param(10, workingCopyService_1.$TC),
        __param(11, notification_1.$Yu),
        __param(12, workingCopyEditorService_1.$AD),
        __param(13, editorService_1.$9C),
        __param(14, elevatedFileService_1.$CD)
    ], $FD);
});
//# sourceMappingURL=storedFileWorkingCopy.js.map