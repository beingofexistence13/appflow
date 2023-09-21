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
define(["require", "exports", "vs/nls", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/uri", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/base/common/map", "vs/platform/files/common/files", "vs/base/common/async", "vs/base/common/errors", "vs/workbench/services/textfile/common/textFileSaveParticipant", "vs/platform/notification/common/notification", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/base/common/resources", "vs/editor/common/model/textModel", "vs/editor/common/languages/modesRegistry", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, nls_1, errorMessage_1, event_1, uri_1, textFileEditorModel_1, lifecycle_1, instantiation_1, map_1, files_1, async_1, errors_1, textFileSaveParticipant_1, notification_1, workingCopyFileService_1, resources_1, textModel_1, modesRegistry_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextFileEditorModelManager = void 0;
    let TextFileEditorModelManager = class TextFileEditorModelManager extends lifecycle_1.Disposable {
        get models() {
            return [...this.mapResourceToModel.values()];
        }
        constructor(instantiationService, fileService, notificationService, workingCopyFileService, uriIdentityService) {
            super();
            this.instantiationService = instantiationService;
            this.fileService = fileService;
            this.notificationService = notificationService;
            this.workingCopyFileService = workingCopyFileService;
            this.uriIdentityService = uriIdentityService;
            this._onDidCreate = this._register(new event_1.Emitter());
            this.onDidCreate = this._onDidCreate.event;
            this._onDidResolve = this._register(new event_1.Emitter());
            this.onDidResolve = this._onDidResolve.event;
            this._onDidRemove = this._register(new event_1.Emitter());
            this.onDidRemove = this._onDidRemove.event;
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
            this._onDidChangeEncoding = this._register(new event_1.Emitter());
            this.onDidChangeEncoding = this._onDidChangeEncoding.event;
            this.mapResourceToModel = new map_1.ResourceMap();
            this.mapResourceToModelListeners = new map_1.ResourceMap();
            this.mapResourceToDisposeListener = new map_1.ResourceMap();
            this.mapResourceToPendingModelResolvers = new map_1.ResourceMap();
            this.modelResolveQueue = this._register(new async_1.ResourceQueue());
            this.saveErrorHandler = (() => {
                const notificationService = this.notificationService;
                return {
                    onSaveError(error, model) {
                        notificationService.error((0, nls_1.localize)({ key: 'genericSaveError', comment: ['{0} is the resource that failed to save and {1} the error message'] }, "Failed to save '{0}': {1}", model.name, (0, errorMessage_1.toErrorMessage)(error, false)));
                    }
                };
            })();
            this.mapCorrelationIdToModelsToRestore = new Map();
            //#region Save participants
            this.saveParticipants = this._register(this.instantiationService.createInstance(textFileSaveParticipant_1.TextFileSaveParticipant));
            this.registerListeners();
        }
        registerListeners() {
            // Update models from file change events
            this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
            // File system provider changes
            this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onDidChangeFileSystemProviderCapabilities(e)));
            this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onDidChangeFileSystemProviderRegistrations(e)));
            // Working copy operations
            this._register(this.workingCopyFileService.onWillRunWorkingCopyFileOperation(e => this.onWillRunWorkingCopyFileOperation(e)));
            this._register(this.workingCopyFileService.onDidFailWorkingCopyFileOperation(e => this.onDidFailWorkingCopyFileOperation(e)));
            this._register(this.workingCopyFileService.onDidRunWorkingCopyFileOperation(e => this.onDidRunWorkingCopyFileOperation(e)));
        }
        onDidFilesChange(e) {
            for (const model of this.models) {
                if (model.isDirty()) {
                    continue; // never reload dirty models
                }
                // Trigger a model resolve for any update or add event that impacts
                // the model. We also consider the added event because it could
                // be that a file was added and updated right after.
                if (e.contains(model.resource, 0 /* FileChangeType.UPDATED */, 1 /* FileChangeType.ADDED */)) {
                    this.queueModelReload(model);
                }
            }
        }
        onDidChangeFileSystemProviderCapabilities(e) {
            // Resolve models again for file systems that changed
            // capabilities to fetch latest metadata (e.g. readonly)
            // into all models.
            this.queueModelReloads(e.scheme);
        }
        onDidChangeFileSystemProviderRegistrations(e) {
            if (!e.added) {
                return; // only if added
            }
            // Resolve models again for file systems that registered
            // to account for capability changes: extensions may
            // unregister and register the same provider with different
            // capabilities, so we want to ensure to fetch latest
            // metadata (e.g. readonly) into all models.
            this.queueModelReloads(e.scheme);
        }
        queueModelReloads(scheme) {
            for (const model of this.models) {
                if (model.isDirty()) {
                    continue; // never reload dirty models
                }
                if (scheme === model.resource.scheme) {
                    this.queueModelReload(model);
                }
            }
        }
        queueModelReload(model) {
            // Resolve model to update (use a queue to prevent accumulation of resolves
            // when the resolve actually takes long. At most we only want the queue
            // to have a size of 2 (1 running resolve and 1 queued resolve).
            const queue = this.modelResolveQueue.queueFor(model.resource);
            if (queue.size <= 1) {
                queue.queue(async () => {
                    try {
                        await this.reload(model);
                    }
                    catch (error) {
                        (0, errors_1.onUnexpectedError)(error);
                    }
                });
            }
        }
        onWillRunWorkingCopyFileOperation(e) {
            // Move / Copy: remember models to restore after the operation
            if (e.operation === 2 /* FileOperation.MOVE */ || e.operation === 3 /* FileOperation.COPY */) {
                const modelsToRestore = [];
                for (const { source, target } of e.files) {
                    if (source) {
                        if (this.uriIdentityService.extUri.isEqual(source, target)) {
                            continue; // ignore if resources are considered equal
                        }
                        // find all models that related to source (can be many if resource is a folder)
                        const sourceModels = [];
                        for (const model of this.models) {
                            if (this.uriIdentityService.extUri.isEqualOrParent(model.resource, source)) {
                                sourceModels.push(model);
                            }
                        }
                        // remember each source model to resolve again after move is done
                        // with optional content to restore if it was dirty
                        for (const sourceModel of sourceModels) {
                            const sourceModelResource = sourceModel.resource;
                            // If the source is the actual model, just use target as new resource
                            let targetModelResource;
                            if (this.uriIdentityService.extUri.isEqual(sourceModelResource, source)) {
                                targetModelResource = target;
                            }
                            // Otherwise a parent folder of the source is being moved, so we need
                            // to compute the target resource based on that
                            else {
                                targetModelResource = (0, resources_1.joinPath)(target, sourceModelResource.path.substr(source.path.length + 1));
                            }
                            modelsToRestore.push({
                                source: sourceModelResource,
                                target: targetModelResource,
                                languageId: sourceModel.getLanguageId(),
                                encoding: sourceModel.getEncoding(),
                                snapshot: sourceModel.isDirty() ? sourceModel.createSnapshot() : undefined
                            });
                        }
                    }
                }
                this.mapCorrelationIdToModelsToRestore.set(e.correlationId, modelsToRestore);
            }
        }
        onDidFailWorkingCopyFileOperation(e) {
            // Move / Copy: restore dirty flag on models to restore that were dirty
            if ((e.operation === 2 /* FileOperation.MOVE */ || e.operation === 3 /* FileOperation.COPY */)) {
                const modelsToRestore = this.mapCorrelationIdToModelsToRestore.get(e.correlationId);
                if (modelsToRestore) {
                    this.mapCorrelationIdToModelsToRestore.delete(e.correlationId);
                    modelsToRestore.forEach(model => {
                        // snapshot presence means this model used to be dirty and so we restore that
                        // flag. we do NOT have to restore the content because the model was only soft
                        // reverted and did not loose its original dirty contents.
                        if (model.snapshot) {
                            this.get(model.source)?.setDirty(true);
                        }
                    });
                }
            }
        }
        onDidRunWorkingCopyFileOperation(e) {
            switch (e.operation) {
                // Create: Revert existing models
                case 0 /* FileOperation.CREATE */:
                    e.waitUntil((async () => {
                        for (const { target } of e.files) {
                            const model = this.get(target);
                            if (model && !model.isDisposed()) {
                                await model.revert();
                            }
                        }
                    })());
                    break;
                // Move/Copy: restore models that were resolved before the operation took place
                case 2 /* FileOperation.MOVE */:
                case 3 /* FileOperation.COPY */:
                    e.waitUntil((async () => {
                        const modelsToRestore = this.mapCorrelationIdToModelsToRestore.get(e.correlationId);
                        if (modelsToRestore) {
                            this.mapCorrelationIdToModelsToRestore.delete(e.correlationId);
                            await async_1.Promises.settled(modelsToRestore.map(async (modelToRestore) => {
                                // restore the model at the target. if we have previous dirty content, we pass it
                                // over to be used, otherwise we force a reload from disk. this is important
                                // because we know the file has changed on disk after the move and the model might
                                // have still existed with the previous state. this ensures that the model is not
                                // tracking a stale state.
                                const restoredModel = await this.resolve(modelToRestore.target, {
                                    reload: { async: false },
                                    contents: modelToRestore.snapshot ? (0, textModel_1.createTextBufferFactoryFromSnapshot)(modelToRestore.snapshot) : undefined,
                                    encoding: modelToRestore.encoding
                                });
                                // restore previous language only if the language is now unspecified and it was specified
                                // but not when the file was explicitly stored with the plain text extension
                                // (https://github.com/microsoft/vscode/issues/125795)
                                if (modelToRestore.languageId &&
                                    modelToRestore.languageId !== modesRegistry_1.PLAINTEXT_LANGUAGE_ID &&
                                    restoredModel.getLanguageId() === modesRegistry_1.PLAINTEXT_LANGUAGE_ID &&
                                    (0, resources_1.extname)(modelToRestore.target) !== modesRegistry_1.PLAINTEXT_EXTENSION) {
                                    restoredModel.updateTextEditorModel(undefined, modelToRestore.languageId);
                                }
                            }));
                        }
                    })());
                    break;
            }
        }
        get(resource) {
            return this.mapResourceToModel.get(resource);
        }
        has(resource) {
            return this.mapResourceToModel.has(resource);
        }
        async reload(model) {
            // Await a pending model resolve first before proceeding
            // to ensure that we never resolve a model more than once
            // in parallel.
            await this.joinPendingResolves(model.resource);
            if (model.isDirty() || model.isDisposed() || !this.has(model.resource)) {
                return; // the model possibly got dirty or disposed, so return early then
            }
            // Trigger reload
            await this.doResolve(model, { reload: { async: false } });
        }
        async resolve(resource, options) {
            // Await a pending model resolve first before proceeding
            // to ensure that we never resolve a model more than once
            // in parallel.
            const pendingResolve = this.joinPendingResolves(resource);
            if (pendingResolve) {
                await pendingResolve;
            }
            // Trigger resolve
            return this.doResolve(resource, options);
        }
        async doResolve(resourceOrModel, options) {
            let model;
            let resource;
            if (uri_1.URI.isUri(resourceOrModel)) {
                resource = resourceOrModel;
                model = this.get(resource);
            }
            else {
                resource = resourceOrModel.resource;
                model = resourceOrModel;
            }
            let modelResolve;
            let didCreateModel = false;
            // Model exists
            if (model) {
                // Always reload if contents are provided
                if (options?.contents) {
                    modelResolve = model.resolve(options);
                }
                // Reload async or sync based on options
                else if (options?.reload) {
                    // async reload: trigger a reload but return immediately
                    if (options.reload.async) {
                        modelResolve = Promise.resolve();
                        (async () => {
                            try {
                                await model.resolve(options);
                            }
                            catch (error) {
                                (0, errors_1.onUnexpectedError)(error);
                            }
                        })();
                    }
                    // sync reload: do not return until model reloaded
                    else {
                        modelResolve = model.resolve(options);
                    }
                }
                // Do not reload
                else {
                    modelResolve = Promise.resolve();
                }
            }
            // Model does not exist
            else {
                didCreateModel = true;
                const newModel = model = this.instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, resource, options ? options.encoding : undefined, options ? options.languageId : undefined);
                modelResolve = model.resolve(options);
                this.registerModel(newModel);
            }
            // Store pending resolves to avoid race conditions
            this.mapResourceToPendingModelResolvers.set(resource, modelResolve);
            // Make known to manager (if not already known)
            this.add(resource, model);
            // Emit some events if we created the model
            if (didCreateModel) {
                this._onDidCreate.fire(model);
                // If the model is dirty right from the beginning,
                // make sure to emit this as an event
                if (model.isDirty()) {
                    this._onDidChangeDirty.fire(model);
                }
            }
            try {
                await modelResolve;
            }
            catch (error) {
                // Automatically dispose the model if we created it
                // because we cannot dispose a model we do not own
                // https://github.com/microsoft/vscode/issues/138850
                if (didCreateModel) {
                    model.dispose();
                }
                throw error;
            }
            finally {
                // Remove from pending resolves
                this.mapResourceToPendingModelResolvers.delete(resource);
            }
            // Apply language if provided
            if (options?.languageId) {
                model.setLanguageId(options.languageId);
            }
            // Model can be dirty if a backup was restored, so we make sure to
            // have this event delivered if we created the model here
            if (didCreateModel && model.isDirty()) {
                this._onDidChangeDirty.fire(model);
            }
            return model;
        }
        joinPendingResolves(resource) {
            const pendingModelResolve = this.mapResourceToPendingModelResolvers.get(resource);
            if (!pendingModelResolve) {
                return;
            }
            return this.doJoinPendingResolves(resource);
        }
        async doJoinPendingResolves(resource) {
            // While we have pending model resolves, ensure
            // to await the last one finishing before returning.
            // This prevents a race when multiple clients await
            // the pending resolve and then all trigger the resolve
            // at the same time.
            let currentModelCopyResolve;
            while (this.mapResourceToPendingModelResolvers.has(resource)) {
                const nextPendingModelResolve = this.mapResourceToPendingModelResolvers.get(resource);
                if (nextPendingModelResolve === currentModelCopyResolve) {
                    return; // already awaited on - return
                }
                currentModelCopyResolve = nextPendingModelResolve;
                try {
                    await nextPendingModelResolve;
                }
                catch (error) {
                    // ignore any error here, it will bubble to the original requestor
                }
            }
        }
        registerModel(model) {
            // Install model listeners
            const modelListeners = new lifecycle_1.DisposableStore();
            modelListeners.add(model.onDidResolve(reason => this._onDidResolve.fire({ model, reason })));
            modelListeners.add(model.onDidChangeDirty(() => this._onDidChangeDirty.fire(model)));
            modelListeners.add(model.onDidChangeReadonly(() => this._onDidChangeReadonly.fire(model)));
            modelListeners.add(model.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire(model)));
            modelListeners.add(model.onDidSaveError(() => this._onDidSaveError.fire(model)));
            modelListeners.add(model.onDidSave(e => this._onDidSave.fire({ model, ...e })));
            modelListeners.add(model.onDidRevert(() => this._onDidRevert.fire(model)));
            modelListeners.add(model.onDidChangeEncoding(() => this._onDidChangeEncoding.fire(model)));
            // Keep for disposal
            this.mapResourceToModelListeners.set(model.resource, modelListeners);
        }
        add(resource, model) {
            const knownModel = this.mapResourceToModel.get(resource);
            if (knownModel === model) {
                return; // already cached
            }
            // dispose any previously stored dispose listener for this resource
            const disposeListener = this.mapResourceToDisposeListener.get(resource);
            disposeListener?.dispose();
            // store in cache but remove when model gets disposed
            this.mapResourceToModel.set(resource, model);
            this.mapResourceToDisposeListener.set(resource, model.onWillDispose(() => this.remove(resource)));
        }
        remove(resource) {
            const removed = this.mapResourceToModel.delete(resource);
            const disposeListener = this.mapResourceToDisposeListener.get(resource);
            if (disposeListener) {
                (0, lifecycle_1.dispose)(disposeListener);
                this.mapResourceToDisposeListener.delete(resource);
            }
            const modelListener = this.mapResourceToModelListeners.get(resource);
            if (modelListener) {
                (0, lifecycle_1.dispose)(modelListener);
                this.mapResourceToModelListeners.delete(resource);
            }
            if (removed) {
                this._onDidRemove.fire(resource);
            }
        }
        addSaveParticipant(participant) {
            return this.saveParticipants.addSaveParticipant(participant);
        }
        runSaveParticipants(model, context, token) {
            return this.saveParticipants.participate(model, context, token);
        }
        //#endregion
        canDispose(model) {
            // quick return if model already disposed or not dirty and not resolving
            if (model.isDisposed() ||
                (!this.mapResourceToPendingModelResolvers.has(model.resource) && !model.isDirty())) {
                return true;
            }
            // promise based return in all other cases
            return this.doCanDispose(model);
        }
        async doCanDispose(model) {
            // Await any pending resolves first before proceeding
            const pendingResolve = this.joinPendingResolves(model.resource);
            if (pendingResolve) {
                await pendingResolve;
                return this.canDispose(model);
            }
            // dirty model: we do not allow to dispose dirty models to prevent
            // data loss cases. dirty models can only be disposed when they are
            // either saved or reverted
            if (model.isDirty()) {
                await event_1.Event.toPromise(model.onDidChangeDirty);
                return this.canDispose(model);
            }
            return true;
        }
        dispose() {
            super.dispose();
            // model caches
            this.mapResourceToModel.clear();
            this.mapResourceToPendingModelResolvers.clear();
            // dispose the dispose listeners
            (0, lifecycle_1.dispose)(this.mapResourceToDisposeListener.values());
            this.mapResourceToDisposeListener.clear();
            // dispose the model change listeners
            (0, lifecycle_1.dispose)(this.mapResourceToModelListeners.values());
            this.mapResourceToModelListeners.clear();
        }
    };
    exports.TextFileEditorModelManager = TextFileEditorModelManager;
    exports.TextFileEditorModelManager = TextFileEditorModelManager = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, files_1.IFileService),
        __param(2, notification_1.INotificationService),
        __param(3, workingCopyFileService_1.IWorkingCopyFileService),
        __param(4, uriIdentity_1.IUriIdentityService)
    ], TextFileEditorModelManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEZpbGVFZGl0b3JNb2RlbE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGV4dGZpbGUvY29tbW9uL3RleHRGaWxlRWRpdG9yTW9kZWxNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXlCekYsSUFBTSwwQkFBMEIsR0FBaEMsTUFBTSwwQkFBMkIsU0FBUSxzQkFBVTtRQWlEekQsSUFBSSxNQUFNO1lBQ1QsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVELFlBQ3dCLG9CQUE0RCxFQUNyRSxXQUEwQyxFQUNsQyxtQkFBMEQsRUFDdkQsc0JBQWdFLEVBQ3BFLGtCQUF3RDtZQUU3RSxLQUFLLEVBQUUsQ0FBQztZQU5nQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3BELGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2pCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDdEMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUNuRCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBeEQ3RCxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXVCLENBQUMsQ0FBQztZQUMxRSxnQkFBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBRTlCLGtCQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBeUIsQ0FBQyxDQUFDO1lBQzdFLGlCQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFFaEMsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFPLENBQUMsQ0FBQztZQUMxRCxnQkFBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBRTlCLHNCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXVCLENBQUMsQ0FBQztZQUMvRSxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1lBRXhDLHlCQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXVCLENBQUMsQ0FBQztZQUNsRix3QkFBbUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBRTlDLHlCQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXVCLENBQUMsQ0FBQztZQUNsRix3QkFBbUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBRTlDLG9CQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBdUIsQ0FBQyxDQUFDO1lBQzdFLG1CQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUM7WUFFcEMsZUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXNCLENBQUMsQ0FBQztZQUN2RSxjQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFFMUIsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUF1QixDQUFDLENBQUM7WUFDMUUsZ0JBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUU5Qix5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUF1QixDQUFDLENBQUM7WUFDbEYsd0JBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQztZQUU5Qyx1QkFBa0IsR0FBRyxJQUFJLGlCQUFXLEVBQXVCLENBQUM7WUFDNUQsZ0NBQTJCLEdBQUcsSUFBSSxpQkFBVyxFQUFlLENBQUM7WUFDN0QsaUNBQTRCLEdBQUcsSUFBSSxpQkFBVyxFQUFlLENBQUM7WUFDOUQsdUNBQWtDLEdBQUcsSUFBSSxpQkFBVyxFQUFpQixDQUFDO1lBRXRFLHNCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxxQkFBYSxFQUFFLENBQUMsQ0FBQztZQUV6RSxxQkFBZ0IsR0FBRyxDQUFDLEdBQUcsRUFBRTtnQkFDeEIsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUM7Z0JBRXJELE9BQU87b0JBQ04sV0FBVyxDQUFDLEtBQVksRUFBRSxLQUEyQjt3QkFDcEQsbUJBQW1CLENBQUMsS0FBSyxDQUFDLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFLE9BQU8sRUFBRSxDQUFDLG1FQUFtRSxDQUFDLEVBQUUsRUFBRSwyQkFBMkIsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUEsNkJBQWMsRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6TixDQUFDO2lCQUNELENBQUM7WUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDO1lBa0dZLHNDQUFpQyxHQUFHLElBQUksR0FBRyxFQUE0RyxDQUFDO1lBcVd6SywyQkFBMkI7WUFFVixxQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaURBQXVCLENBQUMsQ0FBQyxDQUFDO1lBMWJySCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8saUJBQWlCO1lBRXhCLHdDQUF3QztZQUN4QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWpGLCtCQUErQjtZQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMseUNBQXlDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25JLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFckksMEJBQTBCO1lBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5SCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdILENBQUM7UUFFTyxnQkFBZ0IsQ0FBQyxDQUFtQjtZQUMzQyxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hDLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUNwQixTQUFTLENBQUMsNEJBQTRCO2lCQUN0QztnQkFFRCxtRUFBbUU7Z0JBQ25FLCtEQUErRDtnQkFDL0Qsb0RBQW9EO2dCQUNwRCxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsK0RBQStDLEVBQUU7b0JBQzdFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDN0I7YUFDRDtRQUNGLENBQUM7UUFFTyx5Q0FBeUMsQ0FBQyxDQUE2QztZQUU5RixxREFBcUQ7WUFDckQsd0RBQXdEO1lBQ3hELG1CQUFtQjtZQUNuQixJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFTywwQ0FBMEMsQ0FBQyxDQUF1QztZQUN6RixJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRTtnQkFDYixPQUFPLENBQUMsZ0JBQWdCO2FBQ3hCO1lBRUQsd0RBQXdEO1lBQ3hELG9EQUFvRDtZQUNwRCwyREFBMkQ7WUFDM0QscURBQXFEO1lBQ3JELDRDQUE0QztZQUM1QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFTyxpQkFBaUIsQ0FBQyxNQUFjO1lBQ3ZDLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDaEMsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQ3BCLFNBQVMsQ0FBQyw0QkFBNEI7aUJBQ3RDO2dCQUVELElBQUksTUFBTSxLQUFLLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO29CQUNyQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQzdCO2FBQ0Q7UUFDRixDQUFDO1FBRU8sZ0JBQWdCLENBQUMsS0FBMEI7WUFFbEQsMkVBQTJFO1lBQzNFLHVFQUF1RTtZQUN2RSxnRUFBZ0U7WUFDaEUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUQsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRTtnQkFDcEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDdEIsSUFBSTt3QkFDSCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ3pCO29CQUFDLE9BQU8sS0FBSyxFQUFFO3dCQUNmLElBQUEsMEJBQWlCLEVBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ3pCO2dCQUNGLENBQUMsQ0FBQyxDQUFDO2FBQ0g7UUFDRixDQUFDO1FBSU8saUNBQWlDLENBQUMsQ0FBdUI7WUFFaEUsOERBQThEO1lBQzlELElBQUksQ0FBQyxDQUFDLFNBQVMsK0JBQXVCLElBQUksQ0FBQyxDQUFDLFNBQVMsK0JBQXVCLEVBQUU7Z0JBQzdFLE1BQU0sZUFBZSxHQUFxRyxFQUFFLENBQUM7Z0JBRTdILEtBQUssTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFO29CQUN6QyxJQUFJLE1BQU0sRUFBRTt3QkFDWCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRTs0QkFDM0QsU0FBUyxDQUFDLDJDQUEyQzt5QkFDckQ7d0JBRUQsK0VBQStFO3dCQUMvRSxNQUFNLFlBQVksR0FBMEIsRUFBRSxDQUFDO3dCQUMvQyxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7NEJBQ2hDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtnQ0FDM0UsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs2QkFDekI7eUJBQ0Q7d0JBRUQsaUVBQWlFO3dCQUNqRSxtREFBbUQ7d0JBQ25ELEtBQUssTUFBTSxXQUFXLElBQUksWUFBWSxFQUFFOzRCQUN2QyxNQUFNLG1CQUFtQixHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7NEJBRWpELHFFQUFxRTs0QkFDckUsSUFBSSxtQkFBd0IsQ0FBQzs0QkFDN0IsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsRUFBRTtnQ0FDeEUsbUJBQW1CLEdBQUcsTUFBTSxDQUFDOzZCQUM3Qjs0QkFFRCxxRUFBcUU7NEJBQ3JFLCtDQUErQztpQ0FDMUM7Z0NBQ0osbUJBQW1CLEdBQUcsSUFBQSxvQkFBUSxFQUFDLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ2hHOzRCQUVELGVBQWUsQ0FBQyxJQUFJLENBQUM7Z0NBQ3BCLE1BQU0sRUFBRSxtQkFBbUI7Z0NBQzNCLE1BQU0sRUFBRSxtQkFBbUI7Z0NBQzNCLFVBQVUsRUFBRSxXQUFXLENBQUMsYUFBYSxFQUFFO2dDQUN2QyxRQUFRLEVBQUUsV0FBVyxDQUFDLFdBQVcsRUFBRTtnQ0FDbkMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTOzZCQUMxRSxDQUFDLENBQUM7eUJBQ0g7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLGVBQWUsQ0FBQyxDQUFDO2FBQzdFO1FBQ0YsQ0FBQztRQUVPLGlDQUFpQyxDQUFDLENBQXVCO1lBRWhFLHVFQUF1RTtZQUN2RSxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsK0JBQXVCLElBQUksQ0FBQyxDQUFDLFNBQVMsK0JBQXVCLENBQUMsRUFBRTtnQkFDL0UsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3BGLElBQUksZUFBZSxFQUFFO29CQUNwQixJQUFJLENBQUMsaUNBQWlDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFFL0QsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDL0IsNkVBQTZFO3dCQUM3RSw4RUFBOEU7d0JBQzlFLDBEQUEwRDt3QkFDMUQsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFOzRCQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQ3ZDO29CQUNGLENBQUMsQ0FBQyxDQUFDO2lCQUNIO2FBQ0Q7UUFDRixDQUFDO1FBRU8sZ0NBQWdDLENBQUMsQ0FBdUI7WUFDL0QsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFO2dCQUVwQixpQ0FBaUM7Z0JBQ2pDO29CQUNDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTt3QkFDdkIsS0FBSyxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRTs0QkFDakMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDL0IsSUFBSSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0NBQ2pDLE1BQU0sS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDOzZCQUNyQjt5QkFDRDtvQkFDRixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ04sTUFBTTtnQkFFUCwrRUFBK0U7Z0JBQy9FLGdDQUF3QjtnQkFDeEI7b0JBQ0MsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO3dCQUN2QixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsaUNBQWlDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFDcEYsSUFBSSxlQUFlLEVBQUU7NEJBQ3BCLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDOzRCQUUvRCxNQUFNLGdCQUFRLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLGNBQWMsRUFBQyxFQUFFO2dDQUVqRSxpRkFBaUY7Z0NBQ2pGLDRFQUE0RTtnQ0FDNUUsa0ZBQWtGO2dDQUNsRixpRkFBaUY7Z0NBQ2pGLDBCQUEwQjtnQ0FDMUIsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUU7b0NBQy9ELE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7b0NBQ3hCLFFBQVEsRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFBLCtDQUFtQyxFQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztvQ0FDNUcsUUFBUSxFQUFFLGNBQWMsQ0FBQyxRQUFRO2lDQUNqQyxDQUFDLENBQUM7Z0NBRUgseUZBQXlGO2dDQUN6Riw0RUFBNEU7Z0NBQzVFLHNEQUFzRDtnQ0FDdEQsSUFDQyxjQUFjLENBQUMsVUFBVTtvQ0FDekIsY0FBYyxDQUFDLFVBQVUsS0FBSyxxQ0FBcUI7b0NBQ25ELGFBQWEsQ0FBQyxhQUFhLEVBQUUsS0FBSyxxQ0FBcUI7b0NBQ3ZELElBQUEsbUJBQU8sRUFBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssbUNBQW1CLEVBQ3JEO29DQUNELGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lDQUMxRTs0QkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNKO29CQUNGLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDTixNQUFNO2FBQ1A7UUFDRixDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQWE7WUFDaEIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFTyxHQUFHLENBQUMsUUFBYTtZQUN4QixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVPLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBMEI7WUFFOUMsd0RBQXdEO1lBQ3hELHlEQUF5RDtZQUN6RCxlQUFlO1lBQ2YsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRS9DLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLEtBQUssQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN2RSxPQUFPLENBQUMsaUVBQWlFO2FBQ3pFO1lBRUQsaUJBQWlCO1lBQ2pCLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQWEsRUFBRSxPQUFvRDtZQUVoRix3REFBd0Q7WUFDeEQseURBQXlEO1lBQ3pELGVBQWU7WUFDZixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUQsSUFBSSxjQUFjLEVBQUU7Z0JBQ25CLE1BQU0sY0FBYyxDQUFDO2FBQ3JCO1lBRUQsa0JBQWtCO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVPLEtBQUssQ0FBQyxTQUFTLENBQUMsZUFBMEMsRUFBRSxPQUFvRDtZQUN2SCxJQUFJLEtBQXNDLENBQUM7WUFDM0MsSUFBSSxRQUFhLENBQUM7WUFDbEIsSUFBSSxTQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxFQUFFO2dCQUMvQixRQUFRLEdBQUcsZUFBZSxDQUFDO2dCQUMzQixLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUMzQjtpQkFBTTtnQkFDTixRQUFRLEdBQUcsZUFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDcEMsS0FBSyxHQUFHLGVBQWUsQ0FBQzthQUN4QjtZQUVELElBQUksWUFBMkIsQ0FBQztZQUNoQyxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFFM0IsZUFBZTtZQUNmLElBQUksS0FBSyxFQUFFO2dCQUVWLHlDQUF5QztnQkFDekMsSUFBSSxPQUFPLEVBQUUsUUFBUSxFQUFFO29CQUN0QixZQUFZLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDdEM7Z0JBRUQsd0NBQXdDO3FCQUNuQyxJQUFJLE9BQU8sRUFBRSxNQUFNLEVBQUU7b0JBRXpCLHdEQUF3RDtvQkFDeEQsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTt3QkFDekIsWUFBWSxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDakMsQ0FBQyxLQUFLLElBQUksRUFBRTs0QkFDWCxJQUFJO2dDQUNILE1BQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs2QkFDN0I7NEJBQUMsT0FBTyxLQUFLLEVBQUU7Z0NBQ2YsSUFBQSwwQkFBaUIsRUFBQyxLQUFLLENBQUMsQ0FBQzs2QkFDekI7d0JBQ0YsQ0FBQyxDQUFDLEVBQUUsQ0FBQztxQkFDTDtvQkFFRCxrREFBa0Q7eUJBQzdDO3dCQUNKLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUN0QztpQkFDRDtnQkFFRCxnQkFBZ0I7cUJBQ1g7b0JBQ0osWUFBWSxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztpQkFDakM7YUFDRDtZQUVELHVCQUF1QjtpQkFDbEI7Z0JBQ0osY0FBYyxHQUFHLElBQUksQ0FBQztnQkFFdEIsTUFBTSxRQUFRLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUNBQW1CLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ25MLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUV0QyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzdCO1lBRUQsa0RBQWtEO1lBQ2xELElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBRXBFLCtDQUErQztZQUMvQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUUxQiwyQ0FBMkM7WUFDM0MsSUFBSSxjQUFjLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUU5QixrREFBa0Q7Z0JBQ2xELHFDQUFxQztnQkFDckMsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQ3BCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ25DO2FBQ0Q7WUFFRCxJQUFJO2dCQUNILE1BQU0sWUFBWSxDQUFDO2FBQ25CO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBRWYsbURBQW1EO2dCQUNuRCxrREFBa0Q7Z0JBQ2xELG9EQUFvRDtnQkFDcEQsSUFBSSxjQUFjLEVBQUU7b0JBQ25CLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztpQkFDaEI7Z0JBRUQsTUFBTSxLQUFLLENBQUM7YUFDWjtvQkFBUztnQkFFVCwrQkFBK0I7Z0JBQy9CLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDekQ7WUFFRCw2QkFBNkI7WUFDN0IsSUFBSSxPQUFPLEVBQUUsVUFBVSxFQUFFO2dCQUN4QixLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUN4QztZQUVELGtFQUFrRTtZQUNsRSx5REFBeUQ7WUFDekQsSUFBSSxjQUFjLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUN0QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ25DO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU8sbUJBQW1CLENBQUMsUUFBYTtZQUN4QyxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLG1CQUFtQixFQUFFO2dCQUN6QixPQUFPO2FBQ1A7WUFFRCxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRU8sS0FBSyxDQUFDLHFCQUFxQixDQUFDLFFBQWE7WUFFaEQsK0NBQStDO1lBQy9DLG9EQUFvRDtZQUNwRCxtREFBbUQ7WUFDbkQsdURBQXVEO1lBQ3ZELG9CQUFvQjtZQUNwQixJQUFJLHVCQUFrRCxDQUFDO1lBQ3ZELE9BQU8sSUFBSSxDQUFDLGtDQUFrQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDN0QsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLENBQUMsa0NBQWtDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN0RixJQUFJLHVCQUF1QixLQUFLLHVCQUF1QixFQUFFO29CQUN4RCxPQUFPLENBQUMsOEJBQThCO2lCQUN0QztnQkFFRCx1QkFBdUIsR0FBRyx1QkFBdUIsQ0FBQztnQkFDbEQsSUFBSTtvQkFDSCxNQUFNLHVCQUF1QixDQUFDO2lCQUM5QjtnQkFBQyxPQUFPLEtBQUssRUFBRTtvQkFDZixrRUFBa0U7aUJBQ2xFO2FBQ0Q7UUFDRixDQUFDO1FBRU8sYUFBYSxDQUFDLEtBQTBCO1lBRS9DLDBCQUEwQjtZQUMxQixNQUFNLGNBQWMsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUM3QyxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RixjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRixjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRixjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRixjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEYsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRSxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUzRixvQkFBb0I7WUFDcEIsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRCxHQUFHLENBQUMsUUFBYSxFQUFFLEtBQTBCO1lBQzVDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekQsSUFBSSxVQUFVLEtBQUssS0FBSyxFQUFFO2dCQUN6QixPQUFPLENBQUMsaUJBQWlCO2FBQ3pCO1lBRUQsbUVBQW1FO1lBQ25FLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEUsZUFBZSxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBRTNCLHFEQUFxRDtZQUNyRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25HLENBQUM7UUFFRCxNQUFNLENBQUMsUUFBYTtZQUNuQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXpELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEUsSUFBSSxlQUFlLEVBQUU7Z0JBQ3BCLElBQUEsbUJBQU8sRUFBQyxlQUFlLENBQUMsQ0FBQztnQkFDekIsSUFBSSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNuRDtZQUVELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckUsSUFBSSxhQUFhLEVBQUU7Z0JBQ2xCLElBQUEsbUJBQU8sRUFBQyxhQUFhLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNsRDtZQUVELElBQUksT0FBTyxFQUFFO2dCQUNaLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2pDO1FBQ0YsQ0FBQztRQU1ELGtCQUFrQixDQUFDLFdBQXFDO1lBQ3ZELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxtQkFBbUIsQ0FBQyxLQUEyQixFQUFFLE9BQStCLEVBQUUsS0FBd0I7WUFDekcsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELFlBQVk7UUFFWixVQUFVLENBQUMsS0FBMEI7WUFFcEMsd0VBQXdFO1lBQ3hFLElBQ0MsS0FBSyxDQUFDLFVBQVUsRUFBRTtnQkFDbEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQ2pGO2dCQUNELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCwwQ0FBMEM7WUFDMUMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFTyxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQTBCO1lBRXBELHFEQUFxRDtZQUNyRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hFLElBQUksY0FBYyxFQUFFO2dCQUNuQixNQUFNLGNBQWMsQ0FBQztnQkFFckIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzlCO1lBRUQsa0VBQWtFO1lBQ2xFLG1FQUFtRTtZQUNuRSwyQkFBMkI7WUFDM0IsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3BCLE1BQU0sYUFBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFFOUMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzlCO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRVEsT0FBTztZQUNmLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUVoQixlQUFlO1lBQ2YsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVoRCxnQ0FBZ0M7WUFDaEMsSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUUxQyxxQ0FBcUM7WUFDckMsSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxQyxDQUFDO0tBQ0QsQ0FBQTtJQXZqQlksZ0VBQTBCO3lDQUExQiwwQkFBMEI7UUFzRHBDLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSxtQ0FBb0IsQ0FBQTtRQUNwQixXQUFBLGdEQUF1QixDQUFBO1FBQ3ZCLFdBQUEsaUNBQW1CLENBQUE7T0ExRFQsMEJBQTBCLENBdWpCdEMifQ==