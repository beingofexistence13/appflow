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
    exports.$4Eb = void 0;
    let $4Eb = class $4Eb extends lifecycle_1.$kc {
        constructor(notebookService) {
            super();
            this.a = this.B(new WorkerManager(notebookService));
        }
        canComputeDiff(original, modified) {
            throw new Error('Method not implemented.');
        }
        computeDiff(original, modified) {
            return this.a.withWorker().then(client => {
                return client.computeDiff(original, modified);
            });
        }
        canPromptRecommendation(model) {
            return this.a.withWorker().then(client => {
                return client.canPromptRecommendation(model);
            });
        }
    };
    exports.$4Eb = $4Eb;
    exports.$4Eb = $4Eb = __decorate([
        __param(0, notebookService_1.$ubb)
    ], $4Eb);
    class WorkerManager extends lifecycle_1.$kc {
        // private _lastWorkerUsedTime: number;
        constructor(b) {
            super();
            this.b = b;
            this.a = null;
            // this._lastWorkerUsedTime = (new Date()).getTime();
        }
        withWorker() {
            // this._lastWorkerUsedTime = (new Date()).getTime();
            if (!this.a) {
                this.a = new NotebookWorkerClient(this.b, 'notebookEditorWorkerService');
            }
            return Promise.resolve(this.a);
        }
    }
    class NotebookEditorModelManager extends lifecycle_1.$kc {
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.a = Object.create(null);
            this.b = Object.create(null);
        }
        ensureSyncedResources(resources) {
            for (const resource of resources) {
                const resourceStr = resource.toString();
                if (!this.a[resourceStr]) {
                    this.g(resource);
                }
                if (this.a[resourceStr]) {
                    this.b[resourceStr] = (new Date()).getTime();
                }
            }
        }
        g(resource) {
            const model = this.f.listNotebookDocuments().find(document => document.uri.toString() === resource.toString());
            if (!model) {
                return;
            }
            const modelUrl = resource.toString();
            this.c.acceptNewModel(model.uri.toString(), {
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
            const toDispose = new lifecycle_1.$jc();
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
                this.c.acceptModelChanged(modelUrl.toString(), {
                    rawEvents: dto,
                    versionId: event.versionId
                });
            }));
            toDispose.add(model.onWillDispose(() => {
                this.h(modelUrl);
            }));
            toDispose.add((0, lifecycle_1.$ic)(() => {
                this.c.acceptRemovedModel(modelUrl);
            }));
            this.a[modelUrl] = toDispose;
        }
        h(modelUrl) {
            const toDispose = this.a[modelUrl];
            delete this.a[modelUrl];
            delete this.b[modelUrl];
            (0, lifecycle_1.$fc)(toDispose);
        }
    }
    class NotebookWorkerHost {
        constructor(workerClient) {
            this.a = workerClient;
        }
        // foreign host request
        fhr(method, args) {
            return this.a.fhr(method, args);
        }
    }
    class NotebookWorkerClient extends lifecycle_1.$kc {
        constructor(f, label) {
            super();
            this.f = f;
            this.b = new defaultWorkerFactory_1.$WQ(label);
            this.a = null;
            this.c = null;
        }
        // foreign host request
        fhr(method, args) {
            throw new Error(`Not implemented!`);
        }
        computeDiff(original, modified) {
            return this.h([original, modified]).then(proxy => {
                return proxy.computeDiff(original.toString(), modified.toString());
            });
        }
        canPromptRecommendation(modelUri) {
            return this.h([modelUri]).then(proxy => {
                return proxy.canPromptRecommendation(modelUri.toString());
            });
        }
        g(proxy) {
            if (!this.c) {
                this.c = this.B(new NotebookEditorModelManager(proxy, this.f));
            }
            return this.c;
        }
        h(resources) {
            return this.m().then((proxy) => {
                this.g(proxy).ensureSyncedResources(resources);
                return proxy;
            });
        }
        j() {
            if (!this.a) {
                try {
                    this.a = this.B(new simpleWorker_1.SimpleWorkerClient(this.b, 'vs/workbench/contrib/notebook/common/services/notebookSimpleWorker', new NotebookWorkerHost(this)));
                }
                catch (err) {
                    // logOnceWebWorkerWarning(err);
                    // this._worker = new SynchronousWorkerClient(new EditorSimpleWorker(new EditorWorkerHost(this), null));
                    throw (err);
                }
            }
            return this.a;
        }
        m() {
            return this.j().getProxyObject().then(undefined, (err) => {
                // logOnceWebWorkerWarning(err);
                // this._worker = new SynchronousWorkerClient(new EditorSimpleWorker(new EditorWorkerHost(this), null));
                // return this._getOrCreateWorker().getProxyObject();
                throw (err);
            });
        }
    }
});
//# sourceMappingURL=notebookWorkerServiceImpl.js.map