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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/uri", "vs/workbench/api/browser/mainThreadDocuments", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/platform/uriIdentity/common/uriIdentity", "../common/extHost.protocol", "vs/workbench/api/browser/mainThreadNotebookDto", "vs/workbench/services/extensions/common/proxyIdentifier"], function (require, exports, lifecycle_1, map_1, uri_1, mainThreadDocuments_1, notebookCommon_1, notebookEditorModelResolverService_1, uriIdentity_1, extHost_protocol_1, mainThreadNotebookDto_1, proxyIdentifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3rb = void 0;
    let $3rb = class $3rb {
        constructor(extHostContext, f, g) {
            this.f = f;
            this.g = g;
            this.a = new lifecycle_1.$jc();
            this.c = new map_1.$zi();
            this.b = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostNotebookDocuments);
            this.d = new mainThreadDocuments_1.$Lcb(this.g.extUri);
            // forward dirty and save events
            this.a.add(this.f.onDidChangeDirty(model => this.b.$acceptDirtyStateChanged(model.resource, model.isDirty())));
            this.a.add(this.f.onDidSaveNotebook(e => this.b.$acceptModelSaved(e)));
            // when a conflict is going to happen RELEASE references that are held by extensions
            this.a.add(f.onWillFailWithConflict(e => {
                this.d.remove(e.resource);
            }));
        }
        dispose() {
            this.a.dispose();
            this.d.dispose();
            (0, lifecycle_1.$fc)(this.c.values());
        }
        handleNotebooksAdded(notebooks) {
            for (const textModel of notebooks) {
                const disposableStore = new lifecycle_1.$jc();
                disposableStore.add(textModel.onDidChangeContent(event => {
                    const eventDto = {
                        versionId: event.versionId,
                        rawEvents: []
                    };
                    for (const e of event.rawEvents) {
                        switch (e.kind) {
                            case notebookCommon_1.NotebookCellsChangeType.ModelChange:
                                eventDto.rawEvents.push({
                                    kind: e.kind,
                                    changes: e.changes.map(diff => [diff[0], diff[1], diff[2].map(cell => mainThreadNotebookDto_1.NotebookDto.toNotebookCellDto(cell))])
                                });
                                break;
                            case notebookCommon_1.NotebookCellsChangeType.Move:
                                eventDto.rawEvents.push({
                                    kind: e.kind,
                                    index: e.index,
                                    length: e.length,
                                    newIdx: e.newIdx,
                                });
                                break;
                            case notebookCommon_1.NotebookCellsChangeType.Output:
                                eventDto.rawEvents.push({
                                    kind: e.kind,
                                    index: e.index,
                                    outputs: e.outputs.map(mainThreadNotebookDto_1.NotebookDto.toNotebookOutputDto)
                                });
                                break;
                            case notebookCommon_1.NotebookCellsChangeType.OutputItem:
                                eventDto.rawEvents.push({
                                    kind: e.kind,
                                    index: e.index,
                                    outputId: e.outputId,
                                    outputItems: e.outputItems.map(mainThreadNotebookDto_1.NotebookDto.toNotebookOutputItemDto),
                                    append: e.append
                                });
                                break;
                            case notebookCommon_1.NotebookCellsChangeType.ChangeCellLanguage:
                            case notebookCommon_1.NotebookCellsChangeType.ChangeCellContent:
                            case notebookCommon_1.NotebookCellsChangeType.ChangeCellMetadata:
                            case notebookCommon_1.NotebookCellsChangeType.ChangeCellInternalMetadata:
                                eventDto.rawEvents.push(e);
                                break;
                        }
                    }
                    const hasDocumentMetadataChangeEvent = event.rawEvents.find(e => e.kind === notebookCommon_1.NotebookCellsChangeType.ChangeDocumentMetadata);
                    // using the model resolver service to know if the model is dirty or not.
                    // assuming this is the first listener it can mean that at first the model
                    // is marked as dirty and that another event is fired
                    this.b.$acceptModelChanged(textModel.uri, new proxyIdentifier_1.$dA(eventDto), this.f.isDirty(textModel.uri), hasDocumentMetadataChangeEvent ? textModel.metadata : undefined);
                }));
                this.c.set(textModel.uri, disposableStore);
            }
        }
        handleNotebooksRemoved(uris) {
            for (const uri of uris) {
                this.c.get(uri)?.dispose();
                this.c.delete(uri);
            }
        }
        async $tryCreateNotebook(options) {
            const ref = await this.f.resolve({ untitledResource: undefined }, options.viewType);
            // untitled notebooks are disposed when they get saved. we should not hold a reference
            // to such a disposed notebook and therefore dispose the reference as well
            ref.object.notebook.onWillDispose(() => {
                ref.dispose();
            });
            // untitled notebooks are dirty by default
            this.b.$acceptDirtyStateChanged(ref.object.resource, true);
            // apply content changes... slightly HACKY -> this triggers a change event
            if (options.content) {
                const data = mainThreadNotebookDto_1.NotebookDto.fromNotebookDataDto(options.content);
                ref.object.notebook.reset(data.cells, data.metadata, ref.object.notebook.transientOptions);
            }
            return ref.object.resource;
        }
        async $tryOpenNotebook(uriComponents) {
            const uri = uri_1.URI.revive(uriComponents);
            const ref = await this.f.resolve(uri, undefined);
            this.d.add(uri, ref);
            return uri;
        }
        async $trySaveNotebook(uriComponents) {
            const uri = uri_1.URI.revive(uriComponents);
            const ref = await this.f.resolve(uri);
            const saveResult = await ref.object.save();
            ref.dispose();
            return saveResult;
        }
    };
    exports.$3rb = $3rb;
    exports.$3rb = $3rb = __decorate([
        __param(1, notebookEditorModelResolverService_1.$wbb),
        __param(2, uriIdentity_1.$Ck)
    ], $3rb);
});
//# sourceMappingURL=mainThreadNotebookDocuments.js.map