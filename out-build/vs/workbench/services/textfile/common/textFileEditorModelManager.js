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
define(["require", "exports", "vs/nls!vs/workbench/services/textfile/common/textFileEditorModelManager", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/uri", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/base/common/map", "vs/platform/files/common/files", "vs/base/common/async", "vs/base/common/errors", "vs/workbench/services/textfile/common/textFileSaveParticipant", "vs/platform/notification/common/notification", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/base/common/resources", "vs/editor/common/model/textModel", "vs/editor/common/languages/modesRegistry", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, nls_1, errorMessage_1, event_1, uri_1, textFileEditorModel_1, lifecycle_1, instantiation_1, map_1, files_1, async_1, errors_1, textFileSaveParticipant_1, notification_1, workingCopyFileService_1, resources_1, textModel_1, modesRegistry_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$h3b = void 0;
    let $h3b = class $h3b extends lifecycle_1.$kc {
        get models() {
            return [...this.s.values()];
        }
        constructor(z, C, D, F, G) {
            super();
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.a = this.B(new event_1.$fd());
            this.onDidCreate = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidResolve = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidRemove = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeReadonly = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidChangeOrphaned = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onDidSaveError = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidSave = this.m.event;
            this.n = this.B(new event_1.$fd());
            this.onDidRevert = this.n.event;
            this.r = this.B(new event_1.$fd());
            this.onDidChangeEncoding = this.r.event;
            this.s = new map_1.$zi();
            this.t = new map_1.$zi();
            this.u = new map_1.$zi();
            this.w = new map_1.$zi();
            this.y = this.B(new async_1.$Pg());
            this.saveErrorHandler = (() => {
                const notificationService = this.D;
                return {
                    onSaveError(error, model) {
                        notificationService.error((0, nls_1.localize)(0, null, model.name, (0, errorMessage_1.$mi)(error, false)));
                    }
                };
            })();
            this.O = new Map();
            //#region Save participants
            this.$ = this.B(this.z.createInstance(textFileSaveParticipant_1.$g3b));
            this.H();
        }
        H() {
            // Update models from file change events
            this.B(this.C.onDidFilesChange(e => this.I(e)));
            // File system provider changes
            this.B(this.C.onDidChangeFileSystemProviderCapabilities(e => this.J(e)));
            this.B(this.C.onDidChangeFileSystemProviderRegistrations(e => this.L(e)));
            // Working copy operations
            this.B(this.F.onWillRunWorkingCopyFileOperation(e => this.P(e)));
            this.B(this.F.onDidFailWorkingCopyFileOperation(e => this.Q(e)));
            this.B(this.F.onDidRunWorkingCopyFileOperation(e => this.R(e)));
        }
        I(e) {
            for (const model of this.models) {
                if (model.isDirty()) {
                    continue; // never reload dirty models
                }
                // Trigger a model resolve for any update or add event that impacts
                // the model. We also consider the added event because it could
                // be that a file was added and updated right after.
                if (e.contains(model.resource, 0 /* FileChangeType.UPDATED */, 1 /* FileChangeType.ADDED */)) {
                    this.N(model);
                }
            }
        }
        J(e) {
            // Resolve models again for file systems that changed
            // capabilities to fetch latest metadata (e.g. readonly)
            // into all models.
            this.M(e.scheme);
        }
        L(e) {
            if (!e.added) {
                return; // only if added
            }
            // Resolve models again for file systems that registered
            // to account for capability changes: extensions may
            // unregister and register the same provider with different
            // capabilities, so we want to ensure to fetch latest
            // metadata (e.g. readonly) into all models.
            this.M(e.scheme);
        }
        M(scheme) {
            for (const model of this.models) {
                if (model.isDirty()) {
                    continue; // never reload dirty models
                }
                if (scheme === model.resource.scheme) {
                    this.N(model);
                }
            }
        }
        N(model) {
            // Resolve model to update (use a queue to prevent accumulation of resolves
            // when the resolve actually takes long. At most we only want the queue
            // to have a size of 2 (1 running resolve and 1 queued resolve).
            const queue = this.y.queueFor(model.resource);
            if (queue.size <= 1) {
                queue.queue(async () => {
                    try {
                        await this.U(model);
                    }
                    catch (error) {
                        (0, errors_1.$Y)(error);
                    }
                });
            }
        }
        P(e) {
            // Move / Copy: remember models to restore after the operation
            if (e.operation === 2 /* FileOperation.MOVE */ || e.operation === 3 /* FileOperation.COPY */) {
                const modelsToRestore = [];
                for (const { source, target } of e.files) {
                    if (source) {
                        if (this.G.extUri.isEqual(source, target)) {
                            continue; // ignore if resources are considered equal
                        }
                        // find all models that related to source (can be many if resource is a folder)
                        const sourceModels = [];
                        for (const model of this.models) {
                            if (this.G.extUri.isEqualOrParent(model.resource, source)) {
                                sourceModels.push(model);
                            }
                        }
                        // remember each source model to resolve again after move is done
                        // with optional content to restore if it was dirty
                        for (const sourceModel of sourceModels) {
                            const sourceModelResource = sourceModel.resource;
                            // If the source is the actual model, just use target as new resource
                            let targetModelResource;
                            if (this.G.extUri.isEqual(sourceModelResource, source)) {
                                targetModelResource = target;
                            }
                            // Otherwise a parent folder of the source is being moved, so we need
                            // to compute the target resource based on that
                            else {
                                targetModelResource = (0, resources_1.$ig)(target, sourceModelResource.path.substr(source.path.length + 1));
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
                this.O.set(e.correlationId, modelsToRestore);
            }
        }
        Q(e) {
            // Move / Copy: restore dirty flag on models to restore that were dirty
            if ((e.operation === 2 /* FileOperation.MOVE */ || e.operation === 3 /* FileOperation.COPY */)) {
                const modelsToRestore = this.O.get(e.correlationId);
                if (modelsToRestore) {
                    this.O.delete(e.correlationId);
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
        R(e) {
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
                        const modelsToRestore = this.O.get(e.correlationId);
                        if (modelsToRestore) {
                            this.O.delete(e.correlationId);
                            await async_1.Promises.settled(modelsToRestore.map(async (modelToRestore) => {
                                // restore the model at the target. if we have previous dirty content, we pass it
                                // over to be used, otherwise we force a reload from disk. this is important
                                // because we know the file has changed on disk after the move and the model might
                                // have still existed with the previous state. this ensures that the model is not
                                // tracking a stale state.
                                const restoredModel = await this.resolve(modelToRestore.target, {
                                    reload: { async: false },
                                    contents: modelToRestore.snapshot ? (0, textModel_1.$KC)(modelToRestore.snapshot) : undefined,
                                    encoding: modelToRestore.encoding
                                });
                                // restore previous language only if the language is now unspecified and it was specified
                                // but not when the file was explicitly stored with the plain text extension
                                // (https://github.com/microsoft/vscode/issues/125795)
                                if (modelToRestore.languageId &&
                                    modelToRestore.languageId !== modesRegistry_1.$Yt &&
                                    restoredModel.getLanguageId() === modesRegistry_1.$Yt &&
                                    (0, resources_1.$gg)(modelToRestore.target) !== modesRegistry_1.$Zt) {
                                    restoredModel.updateTextEditorModel(undefined, modelToRestore.languageId);
                                }
                            }));
                        }
                    })());
                    break;
            }
        }
        get(resource) {
            return this.s.get(resource);
        }
        S(resource) {
            return this.s.has(resource);
        }
        async U(model) {
            // Await a pending model resolve first before proceeding
            // to ensure that we never resolve a model more than once
            // in parallel.
            await this.X(model.resource);
            if (model.isDirty() || model.isDisposed() || !this.S(model.resource)) {
                return; // the model possibly got dirty or disposed, so return early then
            }
            // Trigger reload
            await this.W(model, { reload: { async: false } });
        }
        async resolve(resource, options) {
            // Await a pending model resolve first before proceeding
            // to ensure that we never resolve a model more than once
            // in parallel.
            const pendingResolve = this.X(resource);
            if (pendingResolve) {
                await pendingResolve;
            }
            // Trigger resolve
            return this.W(resource, options);
        }
        async W(resourceOrModel, options) {
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
                                (0, errors_1.$Y)(error);
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
                const newModel = model = this.z.createInstance(textFileEditorModel_1.$Hyb, resource, options ? options.encoding : undefined, options ? options.languageId : undefined);
                modelResolve = model.resolve(options);
                this.Z(newModel);
            }
            // Store pending resolves to avoid race conditions
            this.w.set(resource, modelResolve);
            // Make known to manager (if not already known)
            this.add(resource, model);
            // Emit some events if we created the model
            if (didCreateModel) {
                this.a.fire(model);
                // If the model is dirty right from the beginning,
                // make sure to emit this as an event
                if (model.isDirty()) {
                    this.f.fire(model);
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
                this.w.delete(resource);
            }
            // Apply language if provided
            if (options?.languageId) {
                model.setLanguageId(options.languageId);
            }
            // Model can be dirty if a backup was restored, so we make sure to
            // have this event delivered if we created the model here
            if (didCreateModel && model.isDirty()) {
                this.f.fire(model);
            }
            return model;
        }
        X(resource) {
            const pendingModelResolve = this.w.get(resource);
            if (!pendingModelResolve) {
                return;
            }
            return this.Y(resource);
        }
        async Y(resource) {
            // While we have pending model resolves, ensure
            // to await the last one finishing before returning.
            // This prevents a race when multiple clients await
            // the pending resolve and then all trigger the resolve
            // at the same time.
            let currentModelCopyResolve;
            while (this.w.has(resource)) {
                const nextPendingModelResolve = this.w.get(resource);
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
        Z(model) {
            // Install model listeners
            const modelListeners = new lifecycle_1.$jc();
            modelListeners.add(model.onDidResolve(reason => this.b.fire({ model, reason })));
            modelListeners.add(model.onDidChangeDirty(() => this.f.fire(model)));
            modelListeners.add(model.onDidChangeReadonly(() => this.g.fire(model)));
            modelListeners.add(model.onDidChangeOrphaned(() => this.h.fire(model)));
            modelListeners.add(model.onDidSaveError(() => this.j.fire(model)));
            modelListeners.add(model.onDidSave(e => this.m.fire({ model, ...e })));
            modelListeners.add(model.onDidRevert(() => this.n.fire(model)));
            modelListeners.add(model.onDidChangeEncoding(() => this.r.fire(model)));
            // Keep for disposal
            this.t.set(model.resource, modelListeners);
        }
        add(resource, model) {
            const knownModel = this.s.get(resource);
            if (knownModel === model) {
                return; // already cached
            }
            // dispose any previously stored dispose listener for this resource
            const disposeListener = this.u.get(resource);
            disposeListener?.dispose();
            // store in cache but remove when model gets disposed
            this.s.set(resource, model);
            this.u.set(resource, model.onWillDispose(() => this.remove(resource)));
        }
        remove(resource) {
            const removed = this.s.delete(resource);
            const disposeListener = this.u.get(resource);
            if (disposeListener) {
                (0, lifecycle_1.$fc)(disposeListener);
                this.u.delete(resource);
            }
            const modelListener = this.t.get(resource);
            if (modelListener) {
                (0, lifecycle_1.$fc)(modelListener);
                this.t.delete(resource);
            }
            if (removed) {
                this.c.fire(resource);
            }
        }
        addSaveParticipant(participant) {
            return this.$.addSaveParticipant(participant);
        }
        runSaveParticipants(model, context, token) {
            return this.$.participate(model, context, token);
        }
        //#endregion
        canDispose(model) {
            // quick return if model already disposed or not dirty and not resolving
            if (model.isDisposed() ||
                (!this.w.has(model.resource) && !model.isDirty())) {
                return true;
            }
            // promise based return in all other cases
            return this.ab(model);
        }
        async ab(model) {
            // Await any pending resolves first before proceeding
            const pendingResolve = this.X(model.resource);
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
            this.s.clear();
            this.w.clear();
            // dispose the dispose listeners
            (0, lifecycle_1.$fc)(this.u.values());
            this.u.clear();
            // dispose the model change listeners
            (0, lifecycle_1.$fc)(this.t.values());
            this.t.clear();
        }
    };
    exports.$h3b = $h3b;
    exports.$h3b = $h3b = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, files_1.$6j),
        __param(2, notification_1.$Yu),
        __param(3, workingCopyFileService_1.$HD),
        __param(4, uriIdentity_1.$Ck)
    ], $h3b);
});
//# sourceMappingURL=textFileEditorModelManager.js.map