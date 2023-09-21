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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModel", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookService", "vs/platform/log/common/log", "vs/base/common/event", "vs/workbench/services/extensions/common/extensions", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/map", "vs/workbench/services/workingCopy/common/fileWorkingCopyManager", "vs/base/common/network", "vs/workbench/contrib/notebook/common/notebookProvider", "vs/base/common/types", "vs/base/common/cancellation", "vs/platform/configuration/common/configuration"], function (require, exports, instantiation_1, uri_1, notebookCommon_1, notebookEditorModel_1, lifecycle_1, notebookService_1, log_1, event_1, extensions_1, uriIdentity_1, map_1, fileWorkingCopyManager_1, network_1, notebookProvider_1, types_1, cancellation_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookModelResolverServiceImpl = void 0;
    let NotebookModelReferenceCollection = class NotebookModelReferenceCollection extends lifecycle_1.ReferenceCollection {
        constructor(_instantiationService, _notebookService, _logService, _configurationService) {
            super();
            this._instantiationService = _instantiationService;
            this._notebookService = _notebookService;
            this._logService = _logService;
            this._configurationService = _configurationService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._workingCopyManagers = new Map();
            this._modelListener = new Map();
            this._onDidSaveNotebook = new event_1.Emitter();
            this.onDidSaveNotebook = this._onDidSaveNotebook.event;
            this._onDidChangeDirty = new event_1.Emitter();
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._dirtyStates = new map_1.ResourceMap();
            this.modelsToDispose = new Set();
        }
        dispose() {
            this._disposables.dispose();
            this._onDidSaveNotebook.dispose();
            this._onDidChangeDirty.dispose();
            (0, lifecycle_1.dispose)(this._modelListener.values());
            (0, lifecycle_1.dispose)(this._workingCopyManagers.values());
        }
        isDirty(resource) {
            return this._dirtyStates.get(resource) ?? false;
        }
        async createReferencedObject(key, viewType, hasAssociatedFilePath) {
            // Untrack as being disposed
            this.modelsToDispose.delete(key);
            const uri = uri_1.URI.parse(key);
            const workingCopyTypeId = notebookCommon_1.NotebookWorkingCopyTypeIdentifier.create(viewType);
            let workingCopyManager = this._workingCopyManagers.get(workingCopyTypeId);
            if (!workingCopyManager) {
                const factory = new notebookEditorModel_1.NotebookFileWorkingCopyModelFactory(viewType, this._notebookService, this._configurationService);
                workingCopyManager = this._instantiationService.createInstance(fileWorkingCopyManager_1.FileWorkingCopyManager, workingCopyTypeId, factory, factory);
                this._workingCopyManagers.set(workingCopyTypeId, workingCopyManager);
            }
            const model = this._instantiationService.createInstance(notebookEditorModel_1.SimpleNotebookEditorModel, uri, hasAssociatedFilePath, viewType, workingCopyManager);
            const result = await model.load();
            // Whenever a notebook model is dirty we automatically reference it so that
            // we can ensure that at least one reference exists. That guarantees that
            // a model with unsaved changes is never disposed.
            let onDirtyAutoReference;
            this._modelListener.set(result, (0, lifecycle_1.combinedDisposable)(result.onDidSave(() => this._onDidSaveNotebook.fire(result.resource)), result.onDidChangeDirty(() => {
                const isDirty = result.isDirty();
                this._dirtyStates.set(result.resource, isDirty);
                // isDirty -> add reference
                // !isDirty -> free reference
                if (isDirty && !onDirtyAutoReference) {
                    onDirtyAutoReference = this.acquire(key, viewType);
                }
                else if (onDirtyAutoReference) {
                    onDirtyAutoReference.dispose();
                    onDirtyAutoReference = undefined;
                }
                this._onDidChangeDirty.fire(result);
            }), (0, lifecycle_1.toDisposable)(() => onDirtyAutoReference?.dispose())));
            return result;
        }
        destroyReferencedObject(key, object) {
            this.modelsToDispose.add(key);
            (async () => {
                try {
                    const model = await object;
                    if (!this.modelsToDispose.has(key)) {
                        // return if model has been acquired again meanwhile
                        return;
                    }
                    if (model instanceof notebookEditorModel_1.SimpleNotebookEditorModel) {
                        await model.canDispose();
                    }
                    if (!this.modelsToDispose.has(key)) {
                        // return if model has been acquired again meanwhile
                        return;
                    }
                    // Finally we can dispose the model
                    this._modelListener.get(model)?.dispose();
                    this._modelListener.delete(model);
                    model.dispose();
                }
                catch (err) {
                    this._logService.error('FAILED to destory notebook', err);
                }
                finally {
                    this.modelsToDispose.delete(key); // Untrack as being disposed
                }
            })();
        }
    };
    NotebookModelReferenceCollection = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, notebookService_1.INotebookService),
        __param(2, log_1.ILogService),
        __param(3, configuration_1.IConfigurationService)
    ], NotebookModelReferenceCollection);
    let NotebookModelResolverServiceImpl = class NotebookModelResolverServiceImpl {
        constructor(instantiationService, _notebookService, _extensionService, _uriIdentService) {
            this._notebookService = _notebookService;
            this._extensionService = _extensionService;
            this._uriIdentService = _uriIdentService;
            this._onWillFailWithConflict = new event_1.AsyncEmitter();
            this.onWillFailWithConflict = this._onWillFailWithConflict.event;
            this._data = instantiationService.createInstance(NotebookModelReferenceCollection);
            this.onDidSaveNotebook = this._data.onDidSaveNotebook;
            this.onDidChangeDirty = this._data.onDidChangeDirty;
        }
        dispose() {
            this._data.dispose();
        }
        isDirty(resource) {
            return this._data.isDirty(resource);
        }
        async resolve(arg0, viewType) {
            let resource;
            let hasAssociatedFilePath = false;
            if (uri_1.URI.isUri(arg0)) {
                resource = arg0;
            }
            else {
                if (!arg0.untitledResource) {
                    const info = this._notebookService.getContributedNotebookType((0, types_1.assertIsDefined)(viewType));
                    if (!info) {
                        throw new Error('UNKNOWN view type: ' + viewType);
                    }
                    const suffix = notebookProvider_1.NotebookProviderInfo.possibleFileEnding(info.selectors) ?? '';
                    for (let counter = 1;; counter++) {
                        const candidate = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: `Untitled-${counter}${suffix}`, query: viewType });
                        if (!this._notebookService.getNotebookTextModel(candidate)) {
                            resource = candidate;
                            break;
                        }
                    }
                }
                else if (arg0.untitledResource.scheme === network_1.Schemas.untitled) {
                    resource = arg0.untitledResource;
                }
                else {
                    resource = arg0.untitledResource.with({ scheme: network_1.Schemas.untitled });
                    hasAssociatedFilePath = true;
                }
            }
            if (resource.scheme === notebookCommon_1.CellUri.scheme) {
                throw new Error(`CANNOT open a cell-uri as notebook. Tried with ${resource.toString()}`);
            }
            resource = this._uriIdentService.asCanonicalUri(resource);
            const existingViewType = this._notebookService.getNotebookTextModel(resource)?.viewType;
            if (!viewType) {
                if (existingViewType) {
                    viewType = existingViewType;
                }
                else {
                    await this._extensionService.whenInstalledExtensionsRegistered();
                    const providers = this._notebookService.getContributedNotebookTypes(resource);
                    const exclusiveProvider = providers.find(provider => provider.exclusive);
                    viewType = exclusiveProvider?.id || providers[0]?.id;
                }
            }
            if (!viewType) {
                throw new Error(`Missing viewType for '${resource}'`);
            }
            if (existingViewType && existingViewType !== viewType) {
                await this._onWillFailWithConflict.fireAsync({ resource, viewType }, cancellation_1.CancellationToken.None);
                // check again, listener should have done cleanup
                const existingViewType2 = this._notebookService.getNotebookTextModel(resource)?.viewType;
                if (existingViewType2 && existingViewType2 !== viewType) {
                    throw new Error(`A notebook with view type '${existingViewType2}' already exists for '${resource}', CANNOT create another notebook with view type ${viewType}`);
                }
            }
            const reference = this._data.acquire(resource.toString(), viewType, hasAssociatedFilePath);
            try {
                const model = await reference.object;
                return {
                    object: model,
                    dispose() { reference.dispose(); }
                };
            }
            catch (err) {
                reference.dispose();
                throw err;
            }
        }
    };
    exports.NotebookModelResolverServiceImpl = NotebookModelResolverServiceImpl;
    exports.NotebookModelResolverServiceImpl = NotebookModelResolverServiceImpl = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, notebookService_1.INotebookService),
        __param(2, extensions_1.IExtensionService),
        __param(3, uriIdentity_1.IUriIdentityService)
    ], NotebookModelResolverServiceImpl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JNb2RlbFJlc29sdmVyU2VydmljZUltcGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9jb21tb24vbm90ZWJvb2tFZGl0b3JNb2RlbFJlc29sdmVyU2VydmljZUltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUJoRyxJQUFNLGdDQUFnQyxHQUF0QyxNQUFNLGdDQUFpQyxTQUFRLCtCQUEwRDtRQWV4RyxZQUN3QixxQkFBNkQsRUFDbEUsZ0JBQW1ELEVBQ3hELFdBQXlDLEVBQy9CLHFCQUE2RDtZQUVwRixLQUFLLEVBQUUsQ0FBQztZQUxnQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ2pELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDdkMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDZCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBakJwRSxpQkFBWSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3JDLHlCQUFvQixHQUFHLElBQUksR0FBRyxFQUErRixDQUFDO1lBQzlILG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQTZDLENBQUM7WUFFdEUsdUJBQWtCLEdBQUcsSUFBSSxlQUFPLEVBQU8sQ0FBQztZQUNoRCxzQkFBaUIsR0FBZSxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO1lBRXRELHNCQUFpQixHQUFHLElBQUksZUFBTyxFQUFnQyxDQUFDO1lBQ3hFLHFCQUFnQixHQUF3QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1lBRTdFLGlCQUFZLEdBQUcsSUFBSSxpQkFBVyxFQUFXLENBQUM7WUFFMUMsb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBUXJELENBQUM7UUFFRCxPQUFPO1lBQ04sSUFB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