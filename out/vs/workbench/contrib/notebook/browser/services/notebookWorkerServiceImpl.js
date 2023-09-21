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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/worker/simpleWorker", "vs/base/browser/defaultWorkerFactory", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, lifecycle_1, simpleWorker_1, defaultWorkerFactory_1, notebookCommon_1, notebookService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookEditorWorkerServiceImpl = void 0;
    let NotebookEditorWorkerServiceImpl = class NotebookEditorWorkerServiceImpl extends lifecycle_1.Disposable {
        constructor(notebookService) {
            super();
            this._workerManager = this._register(new WorkerManager(notebookService));
        }
        canComputeDiff(original, modified) {
            throw new Error('Method not implemented.');
        }
        computeDiff(original, modified) {
            return this._workerManager.withWorker().then(client => {
                return client.computeDiff(original, modified);
            });
        }
        canPromptRecommendation(model) {
            return this._workerManager.withWorker().then(client => {
                return client.canPromptRecommendation(model);
            });
        }
    };
    exports.NotebookEditorWorkerServiceImpl = NotebookEditorWorkerServiceImpl;
    exports.NotebookEditorWorkerServiceImpl = NotebookEditorWorkerServiceImpl = __decorate([
        __param(0, notebookService_1.INotebookService)
    ], NotebookEditorWorkerServiceImpl);
    class WorkerManager extends lifecycle_1.Disposable {
        // private _lastWorkerUsedTime: number;
        constructor(_notebookService) {
            super();
            this._notebookService = _notebookService;
            this._editorWorkerClient = null;
            // this._lastWorkerUsedTime = (new Date()).getTime();
        }
        withWorker() {
            // this._lastWorkerUsedTime = (new Date()).getTime();
            if (!this._editorWorkerClient) {
                this._editorWorkerClient = new NotebookWorkerClient(this._notebookService, 'notebookEditorWorkerService');
            }
            return Promise.resolve(this._editorWorkerClient);
        }
    }
    class NotebookEditorModelManager extends lifecycle_1.Disposable {
        constructor(_proxy, _notebookService) {
            super();
            this._proxy = _proxy;
            this._notebookService = _notebookService;
            this._syncedModels = Object.create(null);
            this._syncedModelsLastUsedTime = Object.create(null);
        }
        ensureSyncedResources(resources) {
            for (const resource of resources) {
                const resourceStr = resource.toString();
                if (!this._syncedModels[resourceStr]) {
                    this._beginModelSync(resource);
                }
                if (this._syncedModels[resourceStr]) {
                    this._syncedModelsLastUsedTime[resourceStr] = (new Date()).getTime();
                }
            }
        }
        _beginModelSync(resource) {
            const model = this._notebookService.listNotebookDocuments().find(document => document.uri.toString() === resource.toString());
            if (!model) {
                return;
            }
            const modelUrl = resource.toString();
            this._proxy.acceptNewModel(model.uri.toString(), {
                cells: model.cells.map(cell => ({
                    handle: cell.handle,
                    uri: cell.uri,
                    source: cell.getValue(),
                    eol: cell.textBuffer.getEOL(),
                    language: cell.language,
                    mime: cell.mime,
                    cellKind: cell.cellKind,
                    outputs: cell.outputs.map(op => ({ outputId: op.outputId, outputs: op.outputs })),
                    metadata: cell.metadata,
                    internalMetadata: cell.internalMetadata,
                })),
                metadata: model.metadata
            });
            const toDispose = new lifecycle_1.DisposableStore();
            const cellToDto = (cell) => {
                return {
                    handle: cell.handle,
                    uri: cell.uri,
                    source: cell.textBuffer.getLinesContent(),
                    eol: cell.textBuffer.getEOL(),
                    language: cell.language,
                    cellKind: cell.cellKind,
                    outputs: cell.outputs.map(op => ({ outputId: op.outputId, outputs: op.outputs })),
                    metadata: cell.metadata,
                    internalMetadata: cell.internalMetadata,
                };
            };
            toDispose.add(model.onDidChangeContent((event) => {
                const dto = event.rawEvents.map(e => {
                    const data = e.kind === notebookCommon_1.NotebookCellsChangeType.ModelChange || e.kind === notebookCommon_1.NotebookCellsChangeType.Initialize
                        ? {
                            kind: e.kind,
                            versionId: event.versionId,
                            changes: e.changes.map(diff => [diff[0], diff[1], diff[2].map(cell => cellToDto(cell))])
                        }
                        : (e.kind === notebookCommon_1.NotebookCellsChangeType.Move
                            ? {
                                kind: e.kind,
                                index: e.index,
                                length: e.length,
                                newIdx: e.newIdx,
                                versionId: event.versionId,
                                cells: e.cells.map(cell => cellToDto(cell))
                            }
                            : e);
                    return data;
                });
                this._proxy.acceptModelChanged(modelUrl.toString(), {
                    rawEvents: dto,
                    versionId: event.versionId
                });
            }));
            toDispose.add(model.onWillDispose(() => {
                this._stopModelSync(modelUrl);
            }));
            toDispose.add((0, lifecycle_1.toDisposable)(() => {
                this._proxy.acceptRemovedModel(modelUrl);
            }));
            this._syncedModels[modelUrl] = toDispose;
        }
        _stopModelSync(modelUrl) {
            const toDispose = this._syncedModels[modelUrl];
            delete this._syncedModels[modelUrl];
            delete this._syncedModelsLastUsedTime[modelUrl];
            (0, lifecycle_1.dispose)(toDispose);
        }
    }
    class NotebookWorkerHost {
        constructor(workerClient) {
            this._workerClient = workerClient;
        }
        // foreign host request
        fhr(method, args) {
            return this._workerClient.fhr(method, args);
        }
    }
    class NotebookWorkerClient extends lifecycle_1.Disposable {
        constructor(_notebookService, label) {
            super();
            this._notebookService = _notebookService;
            this._workerFactory = new defaultWorkerFactory_1.DefaultWorkerFactory(label);
            this._worker = null;
            this._modelManager = null;
        }
        // foreign host request
        fhr(method, args) {
            throw new Error(`Not implemented!`);
        }
        computeDiff(original, modified) {
            return this._withSyncedResources([original, modified]).then(proxy => {
                return proxy.computeDiff(original.toString(), modified.toString());
            });
        }
        canPromptRecommendation(modelUri) {
            return this._withSyncedResources([modelUri]).then(proxy => {
                return proxy.canPromptRecommendation(modelUri.toString());
            });
        }
        _getOrCreateModelManager(proxy) {
            if (!this._modelManager) {
                this._modelManager = this._register(new NotebookEditorModelManager(proxy, this._notebookService));
            }
            return this._modelManager;
        }
        _withSyncedResources(resources) {
            return this._getProxy().then((proxy) => {
                this._getOrCreateModelManager(proxy).ensureSyncedResources(resources);
                return proxy;
            });
        }
        _getOrCreateWorker() {
            if (!this._worker) {
                try {
                    this._worker = this._register(new simpleWorker_1.SimpleWorkerClient(this._workerFactory, 'vs/workbench/contrib/notebook/common/services/notebookSimpleWorker', new NotebookWorkerHost(this)));
                }
                catch (err) {
                    // logOnceWebWorkerWarning(err);
                    // this._worker = new SynchronousWorkerClient(new EditorSimpleWorker(new EditorWorkerHost(this), null));
                    throw (err);
                }
            }
            return this._worker;
        }
        _getProxy() {
            return this._getOrCreateWorker().getProxyObject().then(undefined, (err) => {
                // logOnceWebWorkerWarning(err);
                // this._worker = new SynchronousWorkerClient(new EditorSimpleWorker(new EditorWorkerHost(this), null));
                // return this._getOrCreateWorker().getProxyObject();
                throw (err);
            });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tXb3JrZXJTZXJ2aWNlSW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvc2VydmljZXMvbm90ZWJvb2tXb3JrZXJTZXJ2aWNlSW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhekYsSUFBTSwrQkFBK0IsR0FBckMsTUFBTSwrQkFBZ0MsU0FBUSxzQkFBVTtRQUs5RCxZQUNtQixlQUFpQztZQUVuRCxLQUFLLEVBQUUsQ0FBQztZQUVSLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFDRCxjQUFjLENBQUMsUUFBYSxFQUFFLFFBQWE7WUFDMUMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxXQUFXLENBQUMsUUFBYSxFQUFFLFFBQWE7WUFDdkMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDckQsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMvQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCx1QkFBdUIsQ0FBQyxLQUFVO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3JELE9BQU8sTUFBTSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNELENBQUE7SUEzQlksMEVBQStCOzhDQUEvQiwrQkFBK0I7UUFN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