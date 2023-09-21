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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/performance", "vs/base/common/types", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/common/editor", "vs/workbench/common/editor/textEditorModel", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/files/common/files", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/base/common/async", "vs/platform/log/common/log", "vs/base/common/path", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/workingCopy/common/workingCopy", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/label/common/label", "vs/base/common/cancellation", "vs/workbench/services/textfile/common/encoding", "vs/editor/common/model/textModel", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/workbench/services/path/common/pathService", "vs/base/common/resources", "vs/platform/accessibility/common/accessibility", "vs/editor/common/languages/modesRegistry", "vs/workbench/services/extensions/common/extensions"], function (require, exports, nls_1, event_1, performance_1, types_1, textfiles_1, editor_1, textEditorModel_1, workingCopyBackup_1, files_1, language_1, model_1, async_1, log_1, path_1, workingCopyService_1, workingCopy_1, filesConfigurationService_1, label_1, cancellation_1, encoding_1, textModel_1, languageDetectionWorkerService_1, pathService_1, resources_1, accessibility_1, modesRegistry_1, extensions_1) {
    "use strict";
    var TextFileEditorModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextFileEditorModel = void 0;
    /**
     * The text file editor model listens to changes to its underlying code editor model and saves these changes through the file service back to the disk.
     */
    let TextFileEditorModel = class TextFileEditorModel extends textEditorModel_1.BaseTextEditorModel {
        static { TextFileEditorModel_1 = this; }
        static { this.TEXTFILE_SAVE_ENCODING_SOURCE = editor_1.SaveSourceRegistry.registerSource('textFileEncoding.source', (0, nls_1.localize)('textFileCreate.source', "File Encoding Changed")); }
        static { this.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD = 500; }
        constructor(resource, preferredEncoding, // encoding as chosen by the user
        preferredLanguageId, languageService, modelService, fileService, textFileService, workingCopyBackupService, logService, workingCopyService, filesConfigurationService, labelService, languageDetectionService, accessibilityService, pathService, extensionService) {
            super(modelService, languageService, languageDetectionService, accessibilityService);
            this.resource = resource;
            this.preferredEncoding = preferredEncoding;
            this.preferredLanguageId = preferredLanguageId;
            this.fileService = fileService;
            this.textFileService = textFileService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.logService = logService;
            this.workingCopyService = workingCopyService;
            this.filesConfigurationService = filesConfigurationService;
            this.labelService = labelService;
            this.pathService = pathService;
            this.extensionService = extensionService;
            //#region Events
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
            this._onDidChangeEncoding = this._register(new event_1.Emitter());
            this.onDidChangeEncoding = this._onDidChangeEncoding.event;
            this._onDidChangeOrphaned = this._register(new event_1.Emitter());
            this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
            this._onDidChangeReadonly = this._register(new event_1.Emitter());
            this.onDidChangeReadonly = this._onDidChangeReadonly.event;
            //#endregion
            this.typeId = workingCopy_1.NO_TYPE_ID; // IMPORTANT: never change this to not break existing assumptions (e.g. backups)
            this.capabilities = 0 /* WorkingCopyCapabilities.None */;
            this.name = (0, path_1.basename)(this.labelService.getUriLabel(this.resource));
            this.resourceHasExtension = !!resources_1.extUri.extname(this.resource);
            this.versionId = 0;
            this.ignoreDirtyOnModelContentChange = false;
            this.ignoreSaveFromSaveParticipants = false;
            this.lastModelContentChangeFromUndoRedo = undefined;
            this.saveSequentializer = new async_1.TaskSequentializer();
            this.dirty = false;
            this.inConflictMode = false;
            this.inOrphanMode = false;
            this.inErrorMode = false;
            this.hasEncodingSetExplicitly = false;
            // Make known to working copy service
            this._register(this.workingCopyService.registerWorkingCopy(this));
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
            this._register(this.filesConfigurationService.onFilesAssociationChange(() => this.onFilesAssociationChange()));
            this._register(this.filesConfigurationService.onReadonlyChange(() => this._onDidChangeReadonly.fire()));
        }
        async onDidFilesChange(e) {
            let fileEventImpactsModel = false;
            let newInOrphanModeGuess;
            // If we are currently orphaned, we check if the model file was added back
            if (this.inOrphanMode) {
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
            if (fileEventImpactsModel && this.inOrphanMode !== newInOrphanModeGuess) {
                let newInOrphanModeValidated = false;
                if (newInOrphanModeGuess) {
                    // We have received reports of users seeing delete events even though the file still
                    // exists (network shares issue: https://github.com/microsoft/vscode/issues/13665).
                    // Since we do not want to mark the model as orphaned, we have to check if the
                    // file is really gone and not just a faulty file event.
                    await (0, async_1.timeout)(100, cancellation_1.CancellationToken.None);
                    if (this.isDisposed()) {
                        newInOrphanModeValidated = true;
                    }
                    else {
                        const exists = await this.fileService.exists(this.resource);
                        newInOrphanModeValidated = !exists;
                    }
                }
                if (this.inOrphanMode !== newInOrphanModeValidated && !this.isDisposed()) {
                    this.setOrphaned(newInOrphanModeValidated);
                }
            }
        }
        setOrphaned(orphaned) {
            if (this.inOrphanMode !== orphaned) {
                this.inOrphanMode = orphaned;
                this._onDidChangeOrphaned.fire();
            }
        }
        onFilesAssociationChange() {
            if (!this.isResolved()) {
                return;
            }
            const firstLineText = this.getFirstLineText(this.textEditorModel);
            const languageSelection = this.getOrCreateLanguage(this.resource, this.languageService, this.preferredLanguageId, firstLineText);
            this.textEditorModel.setLanguage(languageSelection);
        }
        setLanguageId(languageId, source) {
            super.setLanguageId(languageId, source);
            this.preferredLanguageId = languageId;
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
                    orphaned: this.inOrphanMode
                };
            }
            // Fill in content the same way we would do when
            // saving the file via the text file service
            // encoding support (hardcode UTF-8)
            const content = await this.textFileService.getEncodedReadable(this.resource, this.createSnapshot() ?? undefined, { encoding: encoding_1.UTF8 });
            return { meta, content };
        }
        //#endregion
        //#region Revert
        async revert(options) {
            if (!this.isResolved()) {
                return;
            }
            // Unset flags
            const wasDirty = this.dirty;
            const undo = this.doSetDirty(false);
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
                        undo();
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
        //#endregion
        //#region Resolve
        async resolve(options) {
            this.trace('resolve() - enter');
            (0, performance_1.mark)('code/willResolveTextFileEditorModel');
            // Return early if we are disposed
            if (this.isDisposed()) {
                this.trace('resolve() - exit - without resolving because model is disposed');
                return;
            }
            // Unless there are explicit contents provided, it is important that we do not
            // resolve a model that is dirty or is in the process of saving to prevent data
            // loss.
            if (!options?.contents && (this.dirty || this.saveSequentializer.isRunning())) {
                this.trace('resolve() - exit - without resolving because model is dirty or being saved');
                return;
            }
            // Resolve either from backup or from file
            await this.doResolve(options);
            (0, performance_1.mark)('code/didResolveTextFileEditorModel');
        }
        async doResolve(options) {
            // First check if we have contents to use for the model
            if (options?.contents) {
                return this.resolveFromBuffer(options.contents, options);
            }
            // Second, check if we have a backup to resolve from (only for new models)
            const isNewModel = !this.isResolved();
            if (isNewModel) {
                const resolvedFromBackup = await this.resolveFromBackup(options);
                if (resolvedFromBackup) {
                    return;
                }
            }
            // Finally, resolve from file resource
            return this.resolveFromFile(options);
        }
        async resolveFromBuffer(buffer, options) {
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
            const preferredEncoding = await this.textFileService.encoding.getPreferredWriteEncoding(this.resource, this.preferredEncoding);
            // Resolve with buffer
            this.resolveFromContent({
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
        async resolveFromBackup(options) {
            // Resolve backup if any
            const backup = await this.workingCopyBackupService.resolve(this);
            // Resolve preferred encoding if we need it
            let encoding = encoding_1.UTF8;
            if (backup) {
                encoding = (await this.textFileService.encoding.getPreferredWriteEncoding(this.resource, this.preferredEncoding)).encoding;
            }
            // Abort if someone else managed to resolve the model by now
            const isNewModel = !this.isResolved();
            if (!isNewModel) {
                this.trace('resolveFromBackup() - exit - without resolving because previously new model got created meanwhile');
                return true; // imply that resolving has happened in another operation
            }
            // Try to resolve from backup if we have any
            if (backup) {
                await this.doResolveFromBackup(backup, encoding, options);
                return true;
            }
            // Otherwise signal back that resolving did not happen
            return false;
        }
        async doResolveFromBackup(backup, encoding, options) {
            this.trace('doResolveFromBackup()');
            // Resolve with backup
            this.resolveFromContent({
                resource: this.resource,
                name: this.name,
                mtime: backup.meta ? backup.meta.mtime : Date.now(),
                ctime: backup.meta ? backup.meta.ctime : Date.now(),
                size: backup.meta ? backup.meta.size : 0,
                etag: backup.meta ? backup.meta.etag : files_1.ETAG_DISABLED,
                value: await (0, textModel_1.createTextBufferFactoryFromStream)(await this.textFileService.getDecodedStream(this.resource, backup.value, { encoding: encoding_1.UTF8 })),
                encoding,
                readonly: false,
                locked: false
            }, true /* dirty (resolved from backup) */, options);
            // Restore orphaned flag based on state
            if (backup.meta?.orphaned) {
                this.setOrphaned(true);
            }
        }
        async resolveFromFile(options) {
            this.trace('resolveFromFile()');
            const forceReadFromFile = options?.forceReadFromFile;
            const allowBinary = this.isResolved() /* always allow if we resolved previously */ || options?.allowBinary;
            // Decide on etag
            let etag;
            if (forceReadFromFile) {
                etag = files_1.ETAG_DISABLED; // disable ETag if we enforce to read from disk
            }
            else if (this.lastResolvedFileStat) {
                etag = this.lastResolvedFileStat.etag; // otherwise respect etag to support caching
            }
            // Remember current version before doing any long running operation
            // to ensure we are not changing a model that was changed meanwhile
            const currentVersionId = this.versionId;
            // Resolve Content
            try {
                const content = await this.textFileService.readStream(this.resource, {
                    acceptTextOnly: !allowBinary,
                    etag, encoding: this.preferredEncoding,
                    limits: options?.limits
                });
                // Clear orphaned state when resolving was successful
                this.setOrphaned(false);
                // Return early if the model content has changed
                // meanwhile to prevent loosing any changes
                if (currentVersionId !== this.versionId) {
                    this.trace('resolveFromFile() - exit - without resolving because model content changed');
                    return;
                }
                return this.resolveFromContent(content, false /* not dirty (resolved from file) */, options);
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
        resolveFromContent(content, dirty, options) {
            this.trace('resolveFromContent() - enter');
            // Return early if we are disposed
            if (this.isDisposed()) {
                this.trace('resolveFromContent() - exit - because model is disposed');
                return;
            }
            // Update our resolved disk stat model
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
            // Keep the original encoding to not loose it when saving
            const oldEncoding = this.contentEncoding;
            this.contentEncoding = content.encoding;
            // Handle events if encoding changed
            if (this.preferredEncoding) {
                this.updatePreferredEncoding(this.contentEncoding); // make sure to reflect the real encoding of the file (never out of sync)
            }
            else if (oldEncoding !== this.contentEncoding) {
                this._onDidChangeEncoding.fire();
            }
            // Update Existing Model
            if (this.textEditorModel) {
                this.doUpdateTextModel(content.value);
            }
            // Create New Model
            else {
                this.doCreateTextModel(content.resource, content.value);
            }
            // Update model dirty flag. This is very important to call
            // in both cases of dirty or not because it conditionally
            // updates the `bufferSavedVersionId` to determine the
            // version when to consider the model as saved again (e.g.
            // when undoing back to the saved state)
            this.setDirty(!!dirty);
            // Emit as event
            this._onDidResolve.fire(options?.reason ?? 3 /* TextFileResolveReason.OTHER */);
        }
        doCreateTextModel(resource, value) {
            this.trace('doCreateTextModel()');
            // Create model
            const textModel = this.createTextEditorModel(value, resource, this.preferredLanguageId);
            // Model Listeners
            this.installModelListeners(textModel);
            // Detect language from content
            this.autoDetectLanguage();
        }
        doUpdateTextModel(value) {
            this.trace('doUpdateTextModel()');
            // Update model value in a block that ignores content change events for dirty tracking
            this.ignoreDirtyOnModelContentChange = true;
            try {
                this.updateTextEditorModel(value, this.preferredLanguageId);
            }
            finally {
                this.ignoreDirtyOnModelContentChange = false;
            }
        }
        installModelListeners(model) {
            // See https://github.com/microsoft/vscode/issues/30189
            // This code has been extracted to a different method because it caused a memory leak
            // where `value` was captured in the content change listener closure scope.
            this._register(model.onDidChangeContent(e => this.onModelContentChanged(model, e.isUndoing || e.isRedoing)));
            this._register(model.onDidChangeLanguage(() => this.onMaybeShouldChangeEncoding())); // detect possible encoding change via language specific settings
            super.installModelListeners(model);
        }
        onModelContentChanged(model, isUndoingOrRedoing) {
            this.trace(`onModelContentChanged() - enter`);
            // In any case increment the version id because it tracks the textual content state of the model at all times
            this.versionId++;
            this.trace(`onModelContentChanged() - new versionId ${this.versionId}`);
            // Remember when the user changed the model through a undo/redo operation.
            // We need this information to throttle save participants to fix
            // https://github.com/microsoft/vscode/issues/102542
            if (isUndoingOrRedoing) {
                this.lastModelContentChangeFromUndoRedo = Date.now();
            }
            // We mark check for a dirty-state change upon model content change, unless:
            // - explicitly instructed to ignore it (e.g. from model.resolve())
            // - the model is readonly (in that case we never assume the change was done by the user)
            if (!this.ignoreDirtyOnModelContentChange && !this.isReadonly()) {
                // The contents changed as a matter of Undo and the version reached matches the saved one
                // In this case we clear the dirty flag and emit a SAVED event to indicate this state.
                if (model.getAlternativeVersionId() === this.bufferSavedVersionId) {
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
            // Detect language from content
            this.autoDetectLanguage();
        }
        async autoDetectLanguage() {
            // Wait to be ready to detect language
            await this.extensionService?.whenInstalledExtensionsRegistered();
            // Only perform language detection conditionally
            const languageId = this.getLanguageId();
            if (this.resource.scheme === this.pathService.defaultUriScheme && // make sure to not detect language for non-user visible documents
                (!languageId || languageId === modesRegistry_1.PLAINTEXT_LANGUAGE_ID) && // only run on files with plaintext language set or no language set at all
                !this.resourceHasExtension // only run if this particular file doesn't have an extension
            ) {
                return super.autoDetectLanguage();
            }
        }
        async forceResolveFromFile() {
            if (this.isDisposed()) {
                return; // return early when the model is invalid
            }
            // We go through the text file service to make
            // sure this kind of `resolve` is properly
            // running in sequence with any other running
            // `resolve` if any, including subsequent runs
            // that are triggered right after.
            await this.textFileService.files.resolve(this.resource, {
                reload: { async: false },
                forceReadFromFile: true
            });
        }
        //#endregion
        //#region Dirty
        isDirty() {
            return this.dirty;
        }
        isModified() {
            return this.isDirty();
        }
        setDirty(dirty) {
            if (!this.isResolved()) {
                return; // only resolved models can be marked dirty
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
            const oldBufferSavedVersionId = this.bufferSavedVersionId;
            if (!dirty) {
                this.dirty = false;
                this.inConflictMode = false;
                this.inErrorMode = false;
                this.updateSavedVersionId();
            }
            else {
                this.dirty = true;
            }
            // Return function to revert this call
            return () => {
                this.dirty = wasDirty;
                this.inConflictMode = wasInConflictMode;
                this.inErrorMode = wasInErrorMode;
                this.bufferSavedVersionId = oldBufferSavedVersionId;
            };
        }
        //#endregion
        //#region Save
        async save(options = Object.create(null)) {
            if (!this.isResolved()) {
                return false;
            }
            if (this.isReadonly()) {
                this.trace('save() - ignoring request for readonly resource');
                return false; // if model is readonly we do not attempt to save at all
            }
            if ((this.hasState(3 /* TextFileEditorModelState.CONFLICT */) || this.hasState(5 /* TextFileEditorModelState.ERROR */)) &&
                (options.reason === 2 /* SaveReason.AUTO */ || options.reason === 3 /* SaveReason.FOCUS_CHANGE */ || options.reason === 4 /* SaveReason.WINDOW_CHANGE */)) {
                this.trace('save() - ignoring auto save request for model that is in conflict or error');
                return false; // if model is in save conflict or error, do not save unless save reason is explicit
            }
            // Actually do save and log
            this.trace('save() - enter');
            await this.doSave(options);
            this.trace('save() - exit');
            return this.hasState(0 /* TextFileEditorModelState.SAVED */);
        }
        async doSave(options) {
            if (typeof options.reason !== 'number') {
                options.reason = 1 /* SaveReason.EXPLICIT */;
            }
            let versionId = this.versionId;
            this.trace(`doSave(${versionId}) - enter with versionId ${versionId}`);
            // Return early if saved from within save participant to break recursion
            //
            // Scenario: a save participant triggers a save() on the model
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
            // Scenario: user invoked save action even though the model is not dirty
            if (!options.force && !this.dirty) {
                this.trace(`doSave(${versionId}) - exit - because not dirty and/or versionId is different (this.isDirty: ${this.dirty}, this.versionId: ${this.versionId})`);
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
            if (this.saveSequentializer.isRunning()) {
                this.trace(`doSave(${versionId}) - exit - because busy saving`);
                // Indicate to the save sequentializer that we want to
                // cancel the running operation so that ours can run
                // before the running one finishes.
                // Currently this will try to cancel running save
                // participants but never a running save.
                this.saveSequentializer.cancelRunning();
                // Queue this as the upcoming save and return
                return this.saveSequentializer.queue(() => this.doSave(options));
            }
            // Push all edit operations to the undo stack so that the user has a chance to
            // Ctrl+Z back to the saved version.
            if (this.isResolved()) {
                this.textEditorModel.pushStackElement();
            }
            const saveCancellation = new cancellation_1.CancellationTokenSource();
            return this.saveSequentializer.run(versionId, (async () => {
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
                        if (options.reason === 2 /* SaveReason.AUTO */ && typeof this.lastModelContentChangeFromUndoRedo === 'number') {
                            const timeFromUndoRedoToSave = Date.now() - this.lastModelContentChangeFromUndoRedo;
                            if (timeFromUndoRedoToSave < TextFileEditorModel_1.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD) {
                                await (0, async_1.timeout)(TextFileEditorModel_1.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD - timeFromUndoRedoToSave);
                            }
                        }
                        // Run save participants unless save was cancelled meanwhile
                        if (!saveCancellation.token.isCancellationRequested) {
                            this.ignoreSaveFromSaveParticipants = true;
                            try {
                                await this.textFileService.files.runSaveParticipants(this, { reason: options.reason ?? 1 /* SaveReason.EXPLICIT */ }, saveCancellation.token);
                            }
                            finally {
                                this.ignoreSaveFromSaveParticipants = false;
                            }
                        }
                    }
                    catch (error) {
                        this.logService.error(`[text file model] runSaveParticipants(${versionId}) - resulted in an error: ${error.toString()}`, this.resource.toString());
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
                versionId = this.versionId;
                // Clear error flag since we are trying to save again
                this.inErrorMode = false;
                // Save to Disk. We mark the save operation as currently running with
                // the latest versionId because it might have changed from a save
                // participant triggering
                this.trace(`doSave(${versionId}) - before write()`);
                const lastResolvedFileStat = (0, types_1.assertIsDefined)(this.lastResolvedFileStat);
                const resolvedTextFileEditorModel = this;
                return this.saveSequentializer.run(versionId, (async () => {
                    try {
                        const stat = await this.textFileService.write(lastResolvedFileStat.resource, resolvedTextFileEditorModel.createSnapshot(), {
                            mtime: lastResolvedFileStat.mtime,
                            encoding: this.getEncoding(),
                            etag: (options.ignoreModifiedSince || !this.filesConfigurationService.preventSaveConflicts(lastResolvedFileStat.resource, resolvedTextFileEditorModel.getLanguageId())) ? files_1.ETAG_DISABLED : lastResolvedFileStat.etag,
                            unlock: options.writeUnlock,
                            writeElevated: options.writeElevated
                        });
                        this.handleSaveSuccess(stat, versionId, options);
                    }
                    catch (error) {
                        this.handleSaveError(error, versionId, options);
                    }
                })());
            })(), () => saveCancellation.cancel());
        }
        handleSaveSuccess(stat, versionId, options) {
            // Updated resolved stat with updated stat
            this.updateLastResolvedFileStat(stat);
            // Update dirty state unless model has changed meanwhile
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
            (options.ignoreErrorHandler ? this.logService.trace : this.logService.error).apply(this.logService, [`[text file model] handleSaveError(${versionId}) - exit - resulted in a save error: ${error.toString()}`, this.resource.toString()]);
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
            this.inErrorMode = true;
            // Look out for a save conflict
            if (error.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                this.inConflictMode = true;
            }
            // Show to user
            this.textFileService.files.saveErrorHandler.onSaveError(error, this);
            // Emit as event
            this._onDidSaveError.fire();
        }
        updateSavedVersionId() {
            // we remember the models alternate version id to remember when the version
            // of the model matches with the saved version on disk. we need to keep this
            // in order to find out if the model changed back to a saved version (e.g.
            // when undoing long enough to reach to a version that is saved and then to
            // clear the dirty flag)
            if (this.isResolved()) {
                this.bufferSavedVersionId = this.textEditorModel.getAlternativeVersionId();
            }
        }
        updateLastResolvedFileStat(newFileStat) {
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
                this._onDidChangeReadonly.fire();
            }
        }
        //#endregion
        hasState(state) {
            switch (state) {
                case 3 /* TextFileEditorModelState.CONFLICT */:
                    return this.inConflictMode;
                case 1 /* TextFileEditorModelState.DIRTY */:
                    return this.dirty;
                case 5 /* TextFileEditorModelState.ERROR */:
                    return this.inErrorMode;
                case 4 /* TextFileEditorModelState.ORPHAN */:
                    return this.inOrphanMode;
                case 2 /* TextFileEditorModelState.PENDING_SAVE */:
                    return this.saveSequentializer.isRunning();
                case 0 /* TextFileEditorModelState.SAVED */:
                    return !this.dirty;
            }
        }
        async joinState(state) {
            return this.saveSequentializer.running;
        }
        getLanguageId() {
            if (this.textEditorModel) {
                return this.textEditorModel.getLanguageId();
            }
            return this.preferredLanguageId;
        }
        //#region Encoding
        async onMaybeShouldChangeEncoding() {
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
            if (this.hasEncodingSetExplicitly) {
                this.trace('onMaybeShouldChangeEncoding() - ignoring because encoding was set explicitly');
                return; // never change the user's choice of encoding
            }
            if (this.contentEncoding === encoding_1.UTF8_with_bom || this.contentEncoding === encoding_1.UTF16be || this.contentEncoding === encoding_1.UTF16le) {
                this.trace('onMaybeShouldChangeEncoding() - ignoring because content encoding has a BOM');
                return; // never change an encoding that we can detect 100% via BOMs
            }
            const { encoding } = await this.textFileService.encoding.getPreferredReadEncoding(this.resource);
            if (typeof encoding !== 'string' || !this.isNewEncoding(encoding)) {
                this.trace(`onMaybeShouldChangeEncoding() - ignoring because preferred encoding ${encoding} is not new`);
                return; // return early if encoding is invalid or did not change
            }
            if (this.isDirty()) {
                this.trace('onMaybeShouldChangeEncoding() - ignoring because model is dirty');
                return; // return early to prevent accident saves in this case
            }
            this.logService.info(`Adjusting encoding based on configured language override to '${encoding}' for ${this.resource.toString(true)}.`);
            // Re-open with new encoding
            return this.setEncodingInternal(encoding, 1 /* EncodingMode.Decode */);
        }
        setEncoding(encoding, mode) {
            // Remember that an explicit encoding was set
            this.hasEncodingSetExplicitly = true;
            return this.setEncodingInternal(encoding, mode);
        }
        async setEncodingInternal(encoding, mode) {
            // Encode: Save with encoding
            if (mode === 0 /* EncodingMode.Encode */) {
                this.updatePreferredEncoding(encoding);
                // Save
                if (!this.isDirty()) {
                    this.versionId++; // needs to increment because we change the model potentially
                    this.setDirty(true);
                }
                if (!this.inConflictMode) {
                    await this.save({ source: TextFileEditorModel_1.TEXTFILE_SAVE_ENCODING_SOURCE });
                }
            }
            // Decode: Resolve with encoding
            else {
                if (!this.isNewEncoding(encoding)) {
                    return; // return early if the encoding is already the same
                }
                if (this.isDirty() && !this.inConflictMode) {
                    await this.save();
                }
                this.updatePreferredEncoding(encoding);
                await this.forceResolveFromFile();
            }
        }
        updatePreferredEncoding(encoding) {
            if (!this.isNewEncoding(encoding)) {
                return;
            }
            this.preferredEncoding = encoding;
            // Emit
            this._onDidChangeEncoding.fire();
        }
        isNewEncoding(encoding) {
            if (this.preferredEncoding === encoding) {
                return false; // return early if the encoding is already the same
            }
            if (!this.preferredEncoding && this.contentEncoding === encoding) {
                return false; // also return if we don't have a preferred encoding but the content encoding is already the same
            }
            return true;
        }
        getEncoding() {
            return this.preferredEncoding || this.contentEncoding;
        }
        //#endregion
        trace(msg) {
            this.logService.trace(`[text file model] ${msg}`, this.resource.toString());
        }
        isResolved() {
            return !!this.textEditorModel;
        }
        isReadonly() {
            return this.filesConfigurationService.isReadonly(this.resource, this.lastResolvedFileStat);
        }
        dispose() {
            this.trace('dispose()');
            this.inConflictMode = false;
            this.inOrphanMode = false;
            this.inErrorMode = false;
            super.dispose();
        }
    };
    exports.TextFileEditorModel = TextFileEditorModel;
    exports.TextFileEditorModel = TextFileEditorModel = TextFileEditorModel_1 = __decorate([
        __param(3, language_1.ILanguageService),
        __param(4, model_1.IModelService),
        __param(5, files_1.IFileService),
        __param(6, textfiles_1.ITextFileService),
        __param(7, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(8, log_1.ILogService),
        __param(9, workingCopyService_1.IWorkingCopyService),
        __param(10, filesConfigurationService_1.IFilesConfigurationService),
        __param(11, label_1.ILabelService),
        __param(12, languageDetectionWorkerService_1.ILanguageDetectionService),
        __param(13, accessibility_1.IAccessibilityService),
        __param(14, pathService_1.IPathService),
        __param(15, extensions_1.IExtensionService)
    ], TextFileEditorModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEZpbGVFZGl0b3JNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90ZXh0ZmlsZS9jb21tb24vdGV4dEZpbGVFZGl0b3JNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeUNoRzs7T0FFRztJQUNJLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEscUNBQW1COztpQkFFbkMsa0NBQTZCLEdBQUcsMkJBQWtCLENBQUMsY0FBYyxDQUFDLHlCQUF5QixFQUFFLElBQUEsY0FBUSxFQUFDLHVCQUF1QixFQUFFLHVCQUF1QixDQUFDLENBQUMsQUFBM0gsQ0FBNEg7aUJBZ0R6Siw2REFBd0QsR0FBRyxHQUFHLEFBQU4sQ0FBTztRQVl2RixZQUNVLFFBQWEsRUFDZCxpQkFBcUMsRUFBRyxpQ0FBaUM7UUFDekUsbUJBQXVDLEVBQzdCLGVBQWlDLEVBQ3BDLFlBQTJCLEVBQzVCLFdBQTBDLEVBQ3RDLGVBQWtELEVBQ3pDLHdCQUFvRSxFQUNsRixVQUF3QyxFQUNoQyxrQkFBd0QsRUFDakQseUJBQXNFLEVBQ25GLFlBQTRDLEVBQ2hDLHdCQUFtRCxFQUN2RCxvQkFBMkMsRUFDcEQsV0FBMEMsRUFDckMsZ0JBQW9EO1lBRXZFLEtBQUssQ0FBQyxZQUFZLEVBQUUsZUFBZSxFQUFFLHdCQUF3QixFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFqQjVFLGFBQVEsR0FBUixRQUFRLENBQUs7WUFDZCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ3JDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBb0I7WUFHaEIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDckIsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQ3hCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMkI7WUFDakUsZUFBVSxHQUFWLFVBQVUs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