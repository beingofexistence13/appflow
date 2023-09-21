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
define(["require", "exports", "vs/nls!vs/workbench/services/textfile/common/textFileEditorModel", "vs/base/common/event", "vs/base/common/performance", "vs/base/common/types", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/common/editor", "vs/workbench/common/editor/textEditorModel", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/files/common/files", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/base/common/async", "vs/platform/log/common/log", "vs/base/common/path", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/workingCopy/common/workingCopy", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/label/common/label", "vs/base/common/cancellation", "vs/workbench/services/textfile/common/encoding", "vs/editor/common/model/textModel", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/workbench/services/path/common/pathService", "vs/base/common/resources", "vs/platform/accessibility/common/accessibility", "vs/editor/common/languages/modesRegistry", "vs/workbench/services/extensions/common/extensions"], function (require, exports, nls_1, event_1, performance_1, types_1, textfiles_1, editor_1, textEditorModel_1, workingCopyBackup_1, files_1, language_1, model_1, async_1, log_1, path_1, workingCopyService_1, workingCopy_1, filesConfigurationService_1, label_1, cancellation_1, encoding_1, textModel_1, languageDetectionWorkerService_1, pathService_1, resources_1, accessibility_1, modesRegistry_1, extensions_1) {
    "use strict";
    var $Hyb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Hyb = void 0;
    /**
     * The text file editor model listens to changes to its underlying code editor model and saves these changes through the file service back to the disk.
     */
    let $Hyb = class $Hyb extends textEditorModel_1.$DA {
        static { $Hyb_1 = this; }
        static { this.M = editor_1.$SE.registerSource('textFileEncoding.source', (0, nls_1.localize)(0, null)); }
        static { this.db = 500; }
        constructor(resource, kb, // encoding as chosen by the user
        lb, languageService, modelService, mb, nb, ob, pb, qb, rb, sb, languageDetectionService, accessibilityService, tb, ub) {
            super(modelService, languageService, languageDetectionService, accessibilityService);
            this.resource = resource;
            this.kb = kb;
            this.lb = lb;
            this.mb = mb;
            this.nb = nb;
            this.ob = ob;
            this.pb = pb;
            this.qb = qb;
            this.rb = rb;
            this.sb = sb;
            this.tb = tb;
            this.ub = ub;
            //#region Events
            this.N = this.B(new event_1.$fd());
            this.onDidChangeContent = this.N.event;
            this.O = this.B(new event_1.$fd());
            this.onDidResolve = this.O.event;
            this.P = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.P.event;
            this.Q = this.B(new event_1.$fd());
            this.onDidSaveError = this.Q.event;
            this.R = this.B(new event_1.$fd());
            this.onDidSave = this.R.event;
            this.S = this.B(new event_1.$fd());
            this.onDidRevert = this.S.event;
            this.U = this.B(new event_1.$fd());
            this.onDidChangeEncoding = this.U.event;
            this.W = this.B(new event_1.$fd());
            this.onDidChangeOrphaned = this.W.event;
            this.X = this.B(new event_1.$fd());
            this.onDidChangeReadonly = this.X.event;
            //#endregion
            this.typeId = workingCopy_1.$wA; // IMPORTANT: never change this to not break existing assumptions (e.g. backups)
            this.capabilities = 0 /* WorkingCopyCapabilities.None */;
            this.name = (0, path_1.$ae)(this.sb.getUriLabel(this.resource));
            this.Y = !!resources_1.$$f.extname(this.resource);
            this.$ = 0;
            this.bb = false;
            this.cb = false;
            this.eb = undefined;
            this.fb = new async_1.$Zg();
            this.gb = false;
            this.hb = false;
            this.ib = false;
            this.jb = false;
            this.Sb = false;
            // Make known to working copy service
            this.B(this.qb.registerWorkingCopy(this));
            this.vb();
        }
        vb() {
            this.B(this.mb.onDidFilesChange(e => this.wb(e)));
            this.B(this.rb.onFilesAssociationChange(() => this.yb()));
            this.B(this.rb.onReadonlyChange(() => this.X.fire()));
        }
        async wb(e) {
            let fileEventImpactsModel = false;
            let newInOrphanModeGuess;
            // If we are currently orphaned, we check if the model file was added back
            if (this.ib) {
                const modelFileAdded = e.contains(this.resource, 1 /* FileChangeType.ADDED */);
                if (modelFileAdded) {
                    newInOrphanModeGuess = false;
                    fileEventImpactsModel = true;
                }
            }
            // Otherwise we check if the model file was deleted
            else {
                const modelFileDeleted = e.contains(this.resource, 2 /* FileChangeType.DELETED */);
                if (modelFileDeleted) {
                    newInOrphanModeGuess = true;
                    fileEventImpactsModel = true;
                }
            }
            if (fileEventImpactsModel && this.ib !== newInOrphanModeGuess) {
                let newInOrphanModeValidated = false;
                if (newInOrphanModeGuess) {
                    // We have received reports of users seeing delete events even though the file still
                    // exists (network shares issue: https://github.com/microsoft/vscode/issues/13665).
                    // Since we do not want to mark the model as orphaned, we have to check if the
                    // file is really gone and not just a faulty file event.
                    await (0, async_1.$Hg)(100, cancellation_1.CancellationToken.None);
                    if (this.isDisposed()) {
                        newInOrphanModeValidated = true;
                    }
                    else {
                        const exists = await this.mb.exists(this.resource);
                        newInOrphanModeValidated = !exists;
                    }
                }
                if (this.ib !== newInOrphanModeValidated && !this.isDisposed()) {
                    this.xb(newInOrphanModeValidated);
                }
            }
        }
        xb(orphaned) {
            if (this.ib !== orphaned) {
                this.ib = orphaned;
                this.W.fire();
            }
        }
        yb() {
            if (!this.isResolved()) {
                return;
            }
            const firstLineText = this.J(this.textEditorModel);
            const languageSelection = this.L(this.resource, this.s, this.lb, firstLineText);
            this.textEditorModel.setLanguage(languageSelection);
        }
        setLanguageId(languageId, source) {
            super.setLanguageId(languageId, source);
            this.lb = languageId;
        }
        //#region Backup
        async backup(token) {
            // Fill in metadata if we are resolved
            let meta = undefined;
            if (this.lastResolvedFileStat) {
                meta = {
                    mtime: this.lastResolvedFileStat.mtime,
                    ctime: this.lastResolvedFileStat.ctime,
                    size: this.lastResolvedFileStat.size,
                    etag: this.lastResolvedFileStat.etag,
                    orphaned: this.ib
                };
            }
            // Fill in content the same way we would do when
            // saving the file via the text file service
            // encoding support (hardcode UTF-8)
            const content = await this.nb.getEncodedReadable(this.resource, this.createSnapshot() ?? undefined, { encoding: encoding_1.$bD });
            return { meta, content };
        }
        //#endregion
        //#region Revert
        async revert(options) {
            if (!this.isResolved()) {
                return;
            }
            // Unset flags
            const wasDirty = this.gb;
            const undo = this.Lb(false);
            // Force read from disk unless reverting soft
            const softUndo = options?.soft;
            if (!softUndo) {
                try {
                    await this.Kb();
                }
                catch (error) {
                    // FileNotFound means the file got deleted meanwhile, so ignore it
                    if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        // Set flags back to previous values, we are still dirty if revert failed
                        undo();
                        throw error;
                    }
                }
            }
            // Emit file change event
            this.S.fire();
            // Emit dirty change event
            if (wasDirty) {
                this.P.fire();
            }
        }
        //#endregion
        //#region Resolve
        async resolve(options) {
            this.Vb('resolve() - enter');
            (0, performance_1.mark)('code/willResolveTextFileEditorModel');
            // Return early if we are disposed
            if (this.isDisposed()) {
                this.Vb('resolve() - exit - without resolving because model is disposed');
                return;
            }
            // Unless there are explicit contents provided, it is important that we do not
            // resolve a model that is dirty or is in the process of saving to prevent data
            // loss.
            if (!options?.contents && (this.gb || this.fb.isRunning())) {
                this.Vb('resolve() - exit - without resolving because model is dirty or being saved');
                return;
            }
            // Resolve either from backup or from file
            await this.zb(options);
            (0, performance_1.mark)('code/didResolveTextFileEditorModel');
        }
        async zb(options) {
            // First check if we have contents to use for the model
            if (options?.contents) {
                return this.Ab(options.contents, options);
            }
            // Second, check if we have a backup to resolve from (only for new models)
            const isNewModel = !this.isResolved();
            if (isNewModel) {
                const resolvedFromBackup = await this.Bb(options);
                if (resolvedFromBackup) {
                    return;
                }
            }
            // Finally, resolve from file resource
            return this.Db(options);
        }
        async Ab(buffer, options) {
            this.Vb('resolveFromBuffer()');
            // Try to resolve metdata from disk
            let mtime;
            let ctime;
            let size;
            let etag;
            try {
                const metadata = await this.mb.stat(this.resource);
                mtime = metadata.mtime;
                ctime = metadata.ctime;
                size = metadata.size;
                etag = metadata.etag;
                // Clear orphaned state when resolving was successful
                this.xb(false);
            }
            catch (error) {
                // Put some fallback values in error case
                mtime = Date.now();
                ctime = Date.now();
                size = 0;
                etag = files_1.$xk;
                // Apply orphaned state based on error code
                this.xb(error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */);
            }
            const preferredEncoding = await this.nb.encoding.getPreferredWriteEncoding(this.resource, this.kb);
            // Resolve with buffer
            this.Eb({
                resource: this.resource,
                name: this.name,
                mtime,
                ctime,
                size,
                etag,
                value: buffer,
                encoding: preferredEncoding.encoding,
                readonly: false,
                locked: false
            }, true /* dirty (resolved from buffer) */, options);
        }
        async Bb(options) {
            // Resolve backup if any
            const backup = await this.ob.resolve(this);
            // Resolve preferred encoding if we need it
            let encoding = encoding_1.$bD;
            if (backup) {
                encoding = (await this.nb.encoding.getPreferredWriteEncoding(this.resource, this.kb)).encoding;
            }
            // Abort if someone else managed to resolve the model by now
            const isNewModel = !this.isResolved();
            if (!isNewModel) {
                this.Vb('resolveFromBackup() - exit - without resolving because previously new model got created meanwhile');
                return true; // imply that resolving has happened in another operation
            }
            // Try to resolve from backup if we have any
            if (backup) {
                await this.Cb(backup, encoding, options);
                return true;
            }
            // Otherwise signal back that resolving did not happen
            return false;
        }
        async Cb(backup, encoding, options) {
            this.Vb('doResolveFromBackup()');
            // Resolve with backup
            this.Eb({
                resource: this.resource,
                name: this.name,
                mtime: backup.meta ? backup.meta.mtime : Date.now(),
                ctime: backup.meta ? backup.meta.ctime : Date.now(),
                size: backup.meta ? backup.meta.size : 0,
                etag: backup.meta ? backup.meta.etag : files_1.$xk,
                value: await (0, textModel_1.$JC)(await this.nb.getDecodedStream(this.resource, backup.value, { encoding: encoding_1.$bD })),
                encoding,
                readonly: false,
                locked: false
            }, true /* dirty (resolved from backup) */, options);
            // Restore orphaned flag based on state
            if (backup.meta?.orphaned) {
                this.xb(true);
            }
        }
        async Db(options) {
            this.Vb('resolveFromFile()');
            const forceReadFromFile = options?.forceReadFromFile;
            const allowBinary = this.isResolved() /* always allow if we resolved previously */ || options?.allowBinary;
            // Decide on etag
            let etag;
            if (forceReadFromFile) {
                etag = files_1.$xk; // disable ETag if we enforce to read from disk
            }
            else if (this.lastResolvedFileStat) {
                etag = this.lastResolvedFileStat.etag; // otherwise respect etag to support caching
            }
            // Remember current version before doing any long running operation
            // to ensure we are not changing a model that was changed meanwhile
            const currentVersionId = this.$;
            // Resolve Content
            try {
                const content = await this.nb.readStream(this.resource, {
                    acceptTextOnly: !allowBinary,
                    etag, encoding: this.kb,
                    limits: options?.limits
                });
                // Clear orphaned state when resolving was successful
                this.xb(false);
                // Return early if the model content has changed
                // meanwhile to prevent loosing any changes
                if (currentVersionId !== this.$) {
                    this.Vb('resolveFromFile() - exit - without resolving because model content changed');
                    return;
                }
                return this.Eb(content, false /* not dirty (resolved from file) */, options);
            }
            catch (error) {
                const result = error.fileOperationResult;
                // Apply orphaned state based on error code
                this.xb(result === 1 /* FileOperationResult.FILE_NOT_FOUND */);
                // NotModified status is expected and can be handled gracefully
                // if we are resolved. We still want to update our last resolved
                // stat to e.g. detect changes to the file's readonly state
                if (this.isResolved() && result === 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */) {
                    if (error instanceof files_1.$pk) {
                        this.Qb(error.stat);
                    }
                    return;
                }
                // Unless we are forced to read from the file, Ignore when a model has been resolved once
                // and the file was deleted meanwhile. Since we already have the model resolved, we can return
                // to this state and update the orphaned flag to indicate that this model has no version on
                // disk anymore.
                if (this.isResolved() && result === 1 /* FileOperationResult.FILE_NOT_FOUND */ && !forceReadFromFile) {
                    return;
                }
                // Otherwise bubble up the error
                throw error;
            }
        }
        Eb(content, dirty, options) {
            this.Vb('resolveFromContent() - enter');
            // Return early if we are disposed
            if (this.isDisposed()) {
                this.Vb('resolveFromContent() - exit - because model is disposed');
                return;
            }
            // Update our resolved disk stat model
            this.Qb({
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
            // Keep the original encoding to not loose it when saving
            const oldEncoding = this.Z;
            this.Z = content.encoding;
            // Handle events if encoding changed
            if (this.kb) {
                this.updatePreferredEncoding(this.Z); // make sure to reflect the real encoding of the file (never out of sync)
            }
            else if (oldEncoding !== this.Z) {
                this.U.fire();
            }
            // Update Existing Model
            if (this.textEditorModel) {
                this.Gb(content.value);
            }
            // Create New Model
            else {
                this.Fb(content.resource, content.value);
            }
            // Update model dirty flag. This is very important to call
            // in both cases of dirty or not because it conditionally
            // updates the `bufferSavedVersionId` to determine the
            // version when to consider the model as saved again (e.g.
            // when undoing back to the saved state)
            this.setDirty(!!dirty);
            // Emit as event
            this.O.fire(options?.reason ?? 3 /* TextFileResolveReason.OTHER */);
        }
        Fb(resource, value) {
            this.Vb('doCreateTextModel()');
            // Create model
            const textModel = this.H(value, resource, this.lb);
            // Model Listeners
            this.D(textModel);
            // Detect language from content
            this.F();
        }
        Gb(value) {
            this.Vb('doUpdateTextModel()');
            // Update model value in a block that ignores content change events for dirty tracking
            this.bb = true;
            try {
                this.updateTextEditorModel(value, this.lb);
            }
            finally {
                this.bb = false;
            }
        }
        D(model) {
            // See https://github.com/microsoft/vscode/issues/30189
            // This code has been extracted to a different method because it caused a memory leak
            // where `value` was captured in the content change listener closure scope.
            this.B(model.onDidChangeContent(e => this.Ib(model, e.isUndoing || e.isRedoing)));
            this.B(model.onDidChangeLanguage(() => this.Rb())); // detect possible encoding change via language specific settings
            super.D(model);
        }
        Ib(model, isUndoingOrRedoing) {
            this.Vb(`onModelContentChanged() - enter`);
            // In any case increment the version id because it tracks the textual content state of the model at all times
            this.$++;
            this.Vb(`onModelContentChanged() - new versionId ${this.$}`);
            // Remember when the user changed the model through a undo/redo operation.
            // We need this information to throttle save participants to fix
            // https://github.com/microsoft/vscode/issues/102542
            if (isUndoingOrRedoing) {
                this.eb = Date.now();
            }
            // We mark check for a dirty-state change upon model content change, unless:
            // - explicitly instructed to ignore it (e.g. from model.resolve())
            // - the model is readonly (in that case we never assume the change was done by the user)
            if (!this.bb && !this.isReadonly()) {
                // The contents changed as a matter of Undo and the version reached matches the saved one
                // In this case we clear the dirty flag and emit a SAVED event to indicate this state.
                if (model.getAlternativeVersionId() === this.ab) {
                    this.Vb('onModelContentChanged() - model content changed back to last saved version');
                    // Clear flags
                    const wasDirty = this.gb;
                    this.setDirty(false);
                    // Emit revert event if we were dirty
                    if (wasDirty) {
                        this.S.fire();
                    }
                }
                // Otherwise the content has changed and we signal this as becoming dirty
                else {
                    this.Vb('onModelContentChanged() - model content changed and marked as dirty');
                    // Mark as dirty
                    this.setDirty(true);
                }
            }
            // Emit as event
            this.N.fire();
            // Detect language from content
            this.F();
        }
        async F() {
            // Wait to be ready to detect language
            await this.ub?.whenInstalledExtensionsRegistered();
            // Only perform language detection conditionally
            const languageId = this.getLanguageId();
            if (this.resource.scheme === this.tb.defaultUriScheme && // make sure to not detect language for non-user visible documents
                (!languageId || languageId === modesRegistry_1.$Yt) && // only run on files with plaintext language set or no language set at all
                !this.Y // only run if this particular file doesn't have an extension
            ) {
                return super.F();
            }
        }
        async Kb() {
            if (this.isDisposed()) {
                return; // return early when the model is invalid
            }
            // We go through the text file service to make
            // sure this kind of `resolve` is properly
            // running in sequence with any other running
            // `resolve` if any, including subsequent runs
            // that are triggered right after.
            await this.nb.files.resolve(this.resource, {
                reload: { async: false },
                forceReadFromFile: true
            });
        }
        //#endregion
        //#region Dirty
        isDirty() {
            return this.gb;
        }
        isModified() {
            return this.isDirty();
        }
        setDirty(dirty) {
            if (!this.isResolved()) {
                return; // only resolved models can be marked dirty
            }
            // Track dirty state and version id
            const wasDirty = this.gb;
            this.Lb(dirty);
            // Emit as Event if dirty changed
            if (dirty !== wasDirty) {
                this.P.fire();
            }
        }
        Lb(dirty) {
            const wasDirty = this.gb;
            const wasInConflictMode = this.hb;
            const wasInErrorMode = this.jb;
            const oldBufferSavedVersionId = this.ab;
            if (!dirty) {
                this.gb = false;
                this.hb = false;
                this.jb = false;
                this.Pb();
            }
            else {
                this.gb = true;
            }
            // Return function to revert this call
            return () => {
                this.gb = wasDirty;
                this.hb = wasInConflictMode;
                this.jb = wasInErrorMode;
                this.ab = oldBufferSavedVersionId;
            };
        }
        //#endregion
        //#region Save
        async save(options = Object.create(null)) {
            if (!this.isResolved()) {
                return false;
            }
            if (this.isReadonly()) {
                this.Vb('save() - ignoring request for readonly resource');
                return false; // if model is readonly we do not attempt to save at all
            }
            if ((this.hasState(3 /* TextFileEditorModelState.CONFLICT */) || this.hasState(5 /* TextFileEditorModelState.ERROR */)) &&
                (options.reason === 2 /* SaveReason.AUTO */ || options.reason === 3 /* SaveReason.FOCUS_CHANGE */ || options.reason === 4 /* SaveReason.WINDOW_CHANGE */)) {
                this.Vb('save() - ignoring auto save request for model that is in conflict or error');
                return false; // if model is in save conflict or error, do not save unless save reason is explicit
            }
            // Actually do save and log
            this.Vb('save() - enter');
            await this.Mb(options);
            this.Vb('save() - exit');
            return this.hasState(0 /* TextFileEditorModelState.SAVED */);
        }
        async Mb(options) {
            if (typeof options.reason !== 'number') {
                options.reason = 1 /* SaveReason.EXPLICIT */;
            }
            let versionId = this.$;
            this.Vb(`doSave(${versionId}) - enter with versionId ${versionId}`);
            // Return early if saved from within save participant to break recursion
            //
            // Scenario: a save participant triggers a save() on the model
            if (this.cb) {
                this.Vb(`doSave(${versionId}) - exit - refusing to save() recursively from save participant`);
                return;
            }
            // Lookup any running save for this versionId and return it if found
            //
            // Scenario: user invoked the save action multiple times quickly for the same contents
            //           while the save was not yet finished to disk
            //
            if (this.fb.isRunning(versionId)) {
                this.Vb(`doSave(${versionId}) - exit - found a running save for versionId ${versionId}`);
                return this.fb.running;
            }
            // Return early if not dirty (unless forced)
            //
            // Scenario: user invoked save action even though the model is not dirty
            if (!options.force && !this.gb) {
                this.Vb(`doSave(${versionId}) - exit - because not dirty and/or versionId is different (this.isDirty: ${this.gb}, this.versionId: ${this.$})`);
                return;
            }
            // Return if currently saving by storing this save request as the next save that should happen.
            // Never ever must 2 saves execute at the same time because this can lead to dirty writes and race conditions.
            //
            // Scenario A: auto save was triggered and is currently busy saving to disk. this takes long enough that another auto save
            //             kicks in.
            // Scenario B: save is very slow (e.g. network share) and the user manages to change the buffer and trigger another save
            //             while the first save has not returned yet.
            //
            if (this.fb.isRunning()) {
                this.Vb(`doSave(${versionId}) - exit - because busy saving`);
                // Indicate to the save sequentializer that we want to
                // cancel the running operation so that ours can run
                // before the running one finishes.
                // Currently this will try to cancel running save
                // participants but never a running save.
                this.fb.cancelRunning();
                // Queue this as the upcoming save and return
                return this.fb.queue(() => this.Mb(options));
            }
            // Push all edit operations to the undo stack so that the user has a chance to
            // Ctrl+Z back to the saved version.
            if (this.isResolved()) {
                this.textEditorModel.pushStackElement();
            }
            const saveCancellation = new cancellation_1.$pd();
            return this.fb.run(versionId, (async () => {
                // A save participant can still change the model now and since we are so close to saving
                // we do not want to trigger another auto save or similar, so we block this
                // In addition we update our version right after in case it changed because of a model change
                //
                // Save participants can also be skipped through API.
                if (this.isResolved() && !options.skipSaveParticipants) {
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
                        if (options.reason === 2 /* SaveReason.AUTO */ && typeof this.eb === 'number') {
                            const timeFromUndoRedoToSave = Date.now() - this.eb;
                            if (timeFromUndoRedoToSave < $Hyb_1.db) {
                                await (0, async_1.$Hg)($Hyb_1.db - timeFromUndoRedoToSave);
                            }
                        }
                        // Run save participants unless save was cancelled meanwhile
                        if (!saveCancellation.token.isCancellationRequested) {
                            this.cb = true;
                            try {
                                await this.nb.files.runSaveParticipants(this, { reason: options.reason ?? 1 /* SaveReason.EXPLICIT */ }, saveCancellation.token);
                            }
                            finally {
                                this.cb = false;
                            }
                        }
                    }
                    catch (error) {
                        this.pb.error(`[text file model] runSaveParticipants(${versionId}) - resulted in an error: ${error.toString()}`, this.resource.toString());
                    }
                }
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
                // We have to protect against being disposed at this point. It could be that the save() operation
                // was triggerd followed by a dispose() operation right after without waiting. Typically we cannot
                // be disposed if we are dirty, but if we are not dirty, save() and dispose() can still be triggered
                // one after the other without waiting for the save() to complete. If we are disposed(), we risk
                // saving contents to disk that are stale (see https://github.com/microsoft/vscode/issues/50942).
                // To fix this issue, we will not store the contents to disk when we got disposed.
                if (this.isDisposed()) {
                    return;
                }
                // We require a resolved model from this point on, since we are about to write data to disk.
                if (!this.isResolved()) {
                    return;
                }
                // update versionId with its new value (if pre-save changes happened)
                versionId = this.$;
                // Clear error flag since we are trying to save again
                this.jb = false;
                // Save to Disk. We mark the save operation as currently running with
                // the latest versionId because it might have changed from a save
                // participant triggering
                this.Vb(`doSave(${versionId}) - before write()`);
                const lastResolvedFileStat = (0, types_1.$uf)(this.lastResolvedFileStat);
                const resolvedTextFileEditorModel = this;
                return this.fb.run(versionId, (async () => {
                    try {
                        const stat = await this.nb.write(lastResolvedFileStat.resource, resolvedTextFileEditorModel.createSnapshot(), {
                            mtime: lastResolvedFileStat.mtime,
                            encoding: this.getEncoding(),
                            etag: (options.ignoreModifiedSince || !this.rb.preventSaveConflicts(lastResolvedFileStat.resource, resolvedTextFileEditorModel.getLanguageId())) ? files_1.$xk : lastResolvedFileStat.etag,
                            unlock: options.writeUnlock,
                            writeElevated: options.writeElevated
                        });
                        this.Nb(stat, versionId, options);
                    }
                    catch (error) {
                        this.Ob(error, versionId, options);
                    }
                })());
            })(), () => saveCancellation.cancel());
        }
        Nb(stat, versionId, options) {
            // Updated resolved stat with updated stat
            this.Qb(stat);
            // Update dirty state unless model has changed meanwhile
            if (versionId === this.$) {
                this.Vb(`handleSaveSuccess(${versionId}) - setting dirty to false because versionId did not change`);
                this.setDirty(false);
            }
            else {
                this.Vb(`handleSaveSuccess(${versionId}) - not setting dirty to false because versionId did change meanwhile`);
            }
            // Update orphan state given save was successful
            this.xb(false);
            // Emit Save Event
            this.R.fire({ reason: options.reason, stat, source: options.source });
        }
        Ob(error, versionId, options) {
            (options.ignoreErrorHandler ? this.pb.trace : this.pb.error).apply(this.pb, [`[text file model] handleSaveError(${versionId}) - exit - resulted in a save error: ${error.toString()}`, this.resource.toString()]);
            // Return early if the save() call was made asking to
            // handle the save error itself.
            if (options.ignoreErrorHandler) {
                throw error;
            }
            // In any case of an error, we mark the model as dirty to prevent data loss
            // It could be possible that the write corrupted the file on disk (e.g. when
            // an error happened after truncating the file) and as such we want to preserve
            // the model contents to prevent data loss.
            this.setDirty(true);
            // Flag as error state in the model
            this.jb = true;
            // Look out for a save conflict
            if (error.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                this.hb = true;
            }
            // Show to user
            this.nb.files.saveErrorHandler.onSaveError(error, this);
            // Emit as event
            this.Q.fire();
        }
        Pb() {
            // we remember the models alternate version id to remember when the version
            // of the model matches with the saved version on disk. we need to keep this
            // in order to find out if the model changed back to a saved version (e.g.
            // when undoing long enough to reach to a version that is saved and then to
            // clear the dirty flag)
            if (this.isResolved()) {
                this.ab = this.textEditorModel.getAlternativeVersionId();
            }
        }
        Qb(newFileStat) {
            const oldReadonly = this.isReadonly();
            // First resolve - just take
            if (!this.lastResolvedFileStat) {
                this.lastResolvedFileStat = newFileStat;
            }
            // Subsequent resolve - make sure that we only assign it if the mtime is equal or has advanced.
            // This prevents race conditions from resolving and saving. If a save comes in late after a revert
            // was called, the mtime could be out of sync.
            else if (this.lastResolvedFileStat.mtime <= newFileStat.mtime) {
                this.lastResolvedFileStat = newFileStat;
            }
            // Signal that the readonly state changed
            if (this.isReadonly() !== oldReadonly) {
                this.X.fire();
            }
        }
        //#endregion
        hasState(state) {
            switch (state) {
                case 3 /* TextFileEditorModelState.CONFLICT */:
                    return this.hb;
                case 1 /* TextFileEditorModelState.DIRTY */:
                    return this.gb;
                case 5 /* TextFileEditorModelState.ERROR */:
                    return this.jb;
                case 4 /* TextFileEditorModelState.ORPHAN */:
                    return this.ib;
                case 2 /* TextFileEditorModelState.PENDING_SAVE */:
                    return this.fb.isRunning();
                case 0 /* TextFileEditorModelState.SAVED */:
                    return !this.gb;
            }
        }
        async joinState(state) {
            return this.fb.running;
        }
        getLanguageId() {
            if (this.textEditorModel) {
                return this.textEditorModel.getLanguageId();
            }
            return this.lb;
        }
        //#region Encoding
        async Rb() {
            // This is a bit of a hack but there is a narrow case where
            // per-language configured encodings are not working:
            //
            // On startup we may not yet have all languages resolved so
            // we pick a wrong encoding. We never used to re-apply the
            // encoding when the language was then resolved, because that
            // is an operation that is will have to fetch the contents
            // again from disk.
            //
            // To mitigate this issue, when we detect the model language
            // changes, we see if there is a specific encoding configured
            // for the new language and apply it, only if the model is
            // not dirty and only if the encoding was not explicitly set.
            //
            // (see https://github.com/microsoft/vscode/issues/127936)
            if (this.Sb) {
                this.Vb('onMaybeShouldChangeEncoding() - ignoring because encoding was set explicitly');
                return; // never change the user's choice of encoding
            }
            if (this.Z === encoding_1.$cD || this.Z === encoding_1.$dD || this.Z === encoding_1.$eD) {
                this.Vb('onMaybeShouldChangeEncoding() - ignoring because content encoding has a BOM');
                return; // never change an encoding that we can detect 100% via BOMs
            }
            const { encoding } = await this.nb.encoding.getPreferredReadEncoding(this.resource);
            if (typeof encoding !== 'string' || !this.Ub(encoding)) {
                this.Vb(`onMaybeShouldChangeEncoding() - ignoring because preferred encoding ${encoding} is not new`);
                return; // return early if encoding is invalid or did not change
            }
            if (this.isDirty()) {
                this.Vb('onMaybeShouldChangeEncoding() - ignoring because model is dirty');
                return; // return early to prevent accident saves in this case
            }
            this.pb.info(`Adjusting encoding based on configured language override to '${encoding}' for ${this.resource.toString(true)}.`);
            // Re-open with new encoding
            return this.Tb(encoding, 1 /* EncodingMode.Decode */);
        }
        setEncoding(encoding, mode) {
            // Remember that an explicit encoding was set
            this.Sb = true;
            return this.Tb(encoding, mode);
        }
        async Tb(encoding, mode) {
            // Encode: Save with encoding
            if (mode === 0 /* EncodingMode.Encode */) {
                this.updatePreferredEncoding(encoding);
                // Save
                if (!this.isDirty()) {
                    this.$++; // needs to increment because we change the model potentially
                    this.setDirty(true);
                }
                if (!this.hb) {
                    await this.save({ source: $Hyb_1.M });
                }
            }
            // Decode: Resolve with encoding
            else {
                if (!this.Ub(encoding)) {
                    return; // return early if the encoding is already the same
                }
                if (this.isDirty() && !this.hb) {
                    await this.save();
                }
                this.updatePreferredEncoding(encoding);
                await this.Kb();
            }
        }
        updatePreferredEncoding(encoding) {
            if (!this.Ub(encoding)) {
                return;
            }
            this.kb = encoding;
            // Emit
            this.U.fire();
        }
        Ub(encoding) {
            if (this.kb === encoding) {
                return false; // return early if the encoding is already the same
            }
            if (!this.kb && this.Z === encoding) {
                return false; // also return if we don't have a preferred encoding but the content encoding is already the same
            }
            return true;
        }
        getEncoding() {
            return this.kb || this.Z;
        }
        //#endregion
        Vb(msg) {
            this.pb.trace(`[text file model] ${msg}`, this.resource.toString());
        }
        isResolved() {
            return !!this.textEditorModel;
        }
        isReadonly() {
            return this.rb.isReadonly(this.resource, this.lastResolvedFileStat);
        }
        dispose() {
            this.Vb('dispose()');
            this.hb = false;
            this.ib = false;
            this.jb = false;
            super.dispose();
        }
    };
    exports.$Hyb = $Hyb;
    exports.$Hyb = $Hyb = $Hyb_1 = __decorate([
        __param(3, language_1.$ct),
        __param(4, model_1.$yA),
        __param(5, files_1.$6j),
        __param(6, textfiles_1.$JD),
        __param(7, workingCopyBackup_1.$EA),
        __param(8, log_1.$5i),
        __param(9, workingCopyService_1.$TC),
        __param(10, filesConfigurationService_1.$yD),
        __param(11, label_1.$Vz),
        __param(12, languageDetectionWorkerService_1.$zA),
        __param(13, accessibility_1.$1r),
        __param(14, pathService_1.$yJ),
        __param(15, extensions_1.$MF)
    ], $Hyb);
});
//# sourceMappingURL=textFileEditorModel.js.map