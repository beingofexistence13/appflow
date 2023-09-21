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
define(["require", "exports", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/editor/common/services/model", "vs/workbench/common/editor/textResourceEditorModel", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/network", "vs/editor/common/services/resolverService", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/undoRedo/common/undoRedo", "vs/editor/common/services/modelUndoRedoParticipant", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, uri_1, instantiation_1, lifecycle_1, model_1, textResourceEditorModel_1, textfiles_1, network_1, resolverService_1, textFileEditorModel_1, files_1, extensions_1, undoRedo_1, modelUndoRedoParticipant_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextModelResolverService = void 0;
    let ResourceModelCollection = class ResourceModelCollection extends lifecycle_1.ReferenceCollection {
        constructor(instantiationService, textFileService, fileService, modelService) {
            super();
            this.instantiationService = instantiationService;
            this.textFileService = textFileService;
            this.fileService = fileService;
            this.modelService = modelService;
            this.providers = new Map();
            this.modelsToDispose = new Set();
        }
        createReferencedObject(key) {
            return this.doCreateReferencedObject(key);
        }
        async doCreateReferencedObject(key, skipActivateProvider) {
            // Untrack as being disposed
            this.modelsToDispose.delete(key);
            // inMemory Schema: go through model service cache
            const resource = uri_1.URI.parse(key);
            if (resource.scheme === network_1.Schemas.inMemory) {
                const cachedModel = this.modelService.getModel(resource);
                if (!cachedModel) {
                    throw new Error(`Unable to resolve inMemory resource ${key}`);
                }
                const model = this.instantiationService.createInstance(textResourceEditorModel_1.TextResourceEditorModel, resource);
                if (this.ensureResolvedModel(model, key)) {
                    return model;
                }
            }
            // Untitled Schema: go through untitled text service
            if (resource.scheme === network_1.Schemas.untitled) {
                const model = await this.textFileService.untitled.resolve({ untitledResource: resource });
                if (this.ensureResolvedModel(model, key)) {
                    return model;
                }
            }
            // File or remote file: go through text file service
            if (this.fileService.hasProvider(resource)) {
                const model = await this.textFileService.files.resolve(resource, { reason: 2 /* TextFileResolveReason.REFERENCE */ });
                if (this.ensureResolvedModel(model, key)) {
                    return model;
                }
            }
            // Virtual documents
            if (this.providers.has(resource.scheme)) {
                await this.resolveTextModelContent(key);
                const model = this.instantiationService.createInstance(textResourceEditorModel_1.TextResourceEditorModel, resource);
                if (this.ensureResolvedModel(model, key)) {
                    return model;
                }
            }
            // Either unknown schema, or not yet registered, try to activate
            if (!skipActivateProvider) {
                await this.fileService.activateProvider(resource.scheme);
                return this.doCreateReferencedObject(key, true);
            }
            throw new Error(`Unable to resolve resource ${key}`);
        }
        ensureResolvedModel(model, key) {
            if ((0, resolverService_1.isResolvedTextEditorModel)(model)) {
                return true;
            }
            throw new Error(`Unable to resolve resource ${key}`);
        }
        destroyReferencedObject(key, modelPromise) {
            // untitled and inMemory are bound to a different lifecycle
            const resource = uri_1.URI.parse(key);
            if (resource.scheme === network_1.Schemas.untitled || resource.scheme === network_1.Schemas.inMemory) {
                return;
            }
            // Track as being disposed before waiting for model to load
            // to handle the case that the reference is acquired again
            this.modelsToDispose.add(key);
            (async () => {
                try {
                    const model = await modelPromise;
                    if (!this.modelsToDispose.has(key)) {
                        // return if model has been acquired again meanwhile
                        return;
                    }
                    if (model instanceof textFileEditorModel_1.TextFileEditorModel) {
                        // text file models have conditions that prevent them
                        // from dispose, so we have to wait until we can dispose
                        await this.textFileService.files.canDispose(model);
                    }
                    if (!this.modelsToDispose.has(key)) {
                        // return if model has been acquired again meanwhile
                        return;
                    }
                    // Finally we can dispose the model
                    model.dispose();
                }
                catch (error) {
                    // ignore
                }
                finally {
                    this.modelsToDispose.delete(key); // Untrack as being disposed
                }
            })();
        }
        registerTextModelContentProvider(scheme, provider) {
            let providers = this.providers.get(scheme);
            if (!providers) {
                providers = [];
                this.providers.set(scheme, providers);
            }
            providers.unshift(provider);
            return (0, lifecycle_1.toDisposable)(() => {
                const providersForScheme = this.providers.get(scheme);
                if (!providersForScheme) {
                    return;
                }
                const index = providersForScheme.indexOf(provider);
                if (index === -1) {
                    return;
                }
                providersForScheme.splice(index, 1);
                if (providersForScheme.length === 0) {
                    this.providers.delete(scheme);
                }
            });
        }
        hasTextModelContentProvider(scheme) {
            return this.providers.get(scheme) !== undefined;
        }
        async resolveTextModelContent(key) {
            const resource = uri_1.URI.parse(key);
            const providersForScheme = this.providers.get(resource.scheme) || [];
            for (const provider of providersForScheme) {
                const value = await provider.provideTextContent(resource);
                if (value) {
                    return value;
                }
            }
            throw new Error(`Unable to resolve text model content for resource ${key}`);
        }
    };
    ResourceModelCollection = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, textfiles_1.ITextFileService),
        __param(2, files_1.IFileService),
        __param(3, model_1.IModelService)
    ], ResourceModelCollection);
    let TextModelResolverService = class TextModelResolverService extends lifecycle_1.Disposable {
        get resourceModelCollection() {
            if (!this._resourceModelCollection) {
                this._resourceModelCollection = this.instantiationService.createInstance(ResourceModelCollection);
            }
            return this._resourceModelCollection;
        }
        get asyncModelCollection() {
            if (!this._asyncModelCollection) {
                this._asyncModelCollection = new lifecycle_1.AsyncReferenceCollection(this.resourceModelCollection);
            }
            return this._asyncModelCollection;
        }
        constructor(instantiationService, fileService, undoRedoService, modelService, uriIdentityService) {
            super();
            this.instantiationService = instantiationService;
            this.fileService = fileService;
            this.undoRedoService = undoRedoService;
            this.modelService = modelService;
            this.uriIdentityService = uriIdentityService;
            this._resourceModelCollection = undefined;
            this._asyncModelCollection = undefined;
            this._register(new modelUndoRedoParticipant_1.ModelUndoRedoParticipant(this.modelService, this, this.undoRedoService));
        }
        async createModelReference(resource) {
            // From this moment on, only operate on the canonical resource
            // to ensure we reduce the chance of resolving the same resource
            // with different resource forms (e.g. path casing on Windows)
            resource = this.uriIdentityService.asCanonicalUri(resource);
            return await this.asyncModelCollection.acquire(resource.toString());
        }
        registerTextModelContentProvider(scheme, provider) {
            return this.resourceModelCollection.registerTextModelContentProvider(scheme, provider);
        }
        canHandleResource(resource) {
            if (this.fileService.hasProvider(resource) || resource.scheme === network_1.Schemas.untitled || resource.scheme === network_1.Schemas.inMemory) {
                return true; // we handle file://, untitled:// and inMemory:// automatically
            }
            return this.resourceModelCollection.hasTextModelContentProvider(resource.scheme);
        }
    };
    exports.TextModelResolverService = TextModelResolverService;
    exports.TextModelResolverService = TextModelResolverService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, files_1.IFileService),
        __param(2, undoRedo_1.IUndoRedoService),
        __param(3, model_1.IModelService),
        __param(4, uriIdentity_1.IUriIdentityService)
    ], TextModelResolverService);
    (0, extensions_1.registerSingleton)(resolverService_1.ITextModelService, TextModelResolverService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1vZGVsUmVzb2x2ZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RleHRtb2RlbFJlc29sdmVyL2NvbW1vbi90ZXh0TW9kZWxSZXNvbHZlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0JoRyxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLCtCQUFzRDtRQUszRixZQUN3QixvQkFBNEQsRUFDakUsZUFBa0QsRUFDdEQsV0FBMEMsRUFDekMsWUFBNEM7WUFFM0QsS0FBSyxFQUFFLENBQUM7WUFMZ0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNoRCxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDckMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDeEIsaUJBQVksR0FBWixZQUFZLENBQWU7WUFQM0MsY0FBUyxHQUFHLElBQUksR0FBRyxFQUF1QyxDQUFDO1lBQzNELG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQVNyRCxDQUFDO1FBRVMsc0JBQXNCLENBQUMsR0FBVztZQUMzQyxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRU8sS0FBSyxDQUFDLHdCQUF3QixDQUFDLEdBQVcsRUFBRSxvQkFBOEI7WUFFakYsNEJBQTRCO1lBQzVCLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWpDLGtEQUFrRDtZQUNsRCxNQUFNLFFBQVEsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFFBQVEsRUFBRTtnQkFDekMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFD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