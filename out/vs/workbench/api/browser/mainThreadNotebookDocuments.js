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
    exports.MainThreadNotebookDocuments = void 0;
    let MainThreadNotebookDocuments = class MainThreadNotebookDocuments {
        constructor(extHostContext, _notebookEditorModelResolverService, _uriIdentityService) {
            this._notebookEditorModelResolverService = _notebookEditorModelResolverService;
            this._uriIdentityService = _uriIdentityService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._documentEventListenersMapping = new map_1.ResourceMap();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostNotebookDocuments);
            this._modelReferenceCollection = new mainThreadDocuments_1.BoundModelReferenceCollection(this._uriIdentityService.extUri);
            // forward dirty and save events
            this._disposables.add(this._notebookEditorModelResolverService.onDidChangeDirty(model => this._proxy.$acceptDirtyStateChanged(model.resource, model.isDirty())));
            this._disposables.add(this._notebookEditorModelResolverService.onDidSaveNotebook(e => this._proxy.$acceptModelSaved(e)));
            // when a conflict is going to happen RELEASE references that are held by extensions
            this._disposables.add(_notebookEditorModelResolverService.onWillFailWithConflict(e => {
                this._modelReferenceCollection.remove(e.resource);
            }));
        }
        dispose() {
            this._disposables.dispose();
            this._modelReferenceCollection.dispose();
            (0, lifecycle_1.dispose)(this._documentEventListenersMapping.values());
        }
        handleNotebooksAdded(notebooks) {
            for (const textModel of notebooks) {
                const disposableStore = new lifecycle_1.DisposableStore();
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
                    this._proxy.$acceptModelChanged(textModel.uri, new proxyIdentifier_1.SerializableObjectWithBuffers(eventDto), this._notebookEditorModelResolverService.isDirty(textModel.uri), hasDocumentMetadataChangeEvent ? textModel.metadata : undefined);
                }));
                this._documentEventListenersMapping.set(textModel.uri, disposableStore);
            }
        }
        handleNotebooksRemoved(uris) {
            for (const uri of uris) {
                this._documentEventListenersMapping.get(uri)?.dispose();
                this._documentEventListenersMapping.delete(uri);
            }
        }
        async $tryCreateNotebook(options) {
            const ref = await this._notebookEditorModelResolverService.resolve({ untitledResource: undefined }, options.viewType);
            // untitled notebooks are disposed when they get saved. we should not hold a reference
            // to such a disposed notebook and therefore dispose the reference as well
            ref.object.notebook.onWillDispose(() => {
                ref.dispose();
            });
            // untitled notebooks are dirty by default
            this._proxy.$acceptDirtyStateChanged(ref.object.resource, true);
            // apply content changes... slightly HACKY -> this triggers a change event
            if (options.content) {
                const data = mainThreadNotebookDto_1.NotebookDto.fromNotebookDataDto(options.content);
                ref.object.notebook.reset(data.cells, data.metadata, ref.object.notebook.transientOptions);
            }
            return ref.object.resource;
        }
        async $tryOpenNotebook(uriComponents) {
            const uri = uri_1.URI.revive(uriComponents);
            const ref = await this._notebookEditorModelResolverService.resolve(uri, undefined);
            this._modelReferenceCollection.add(uri, ref);
            return uri;
        }
        async $trySaveNotebook(uriComponents) {
            const uri = uri_1.URI.revive(uriComponents);
            const ref = await this._notebookEditorModelResolverService.resolve(uri);
            const saveResult = await ref.object.save();
            ref.dispose();
            return saveResult;
        }
    };
    exports.MainThreadNotebookDocuments = MainThreadNotebookDocuments;
    exports.MainThreadNotebookDocuments = MainThreadNotebookDocuments = __decorate([
        __param(1, notebookEditorModelResolverService_1.INotebookEditorModelResolverService),
        __param(2, uriIdentity_1.IUriIdentityService)
    ], MainThreadNotebookDocuments);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZE5vdGVib29rRG9jdW1lbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWROb3RlYm9va0RvY3VtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFlekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBMkI7UUFRdkMsWUFDQyxjQUErQixFQUNNLG1DQUF5RixFQUN6RyxtQkFBeUQ7WUFEeEIsd0NBQW1DLEdBQW5DLG1DQUFtQyxDQUFxQztZQUN4Rix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBVDlELGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFHckMsbUNBQThCLEdBQUcsSUFBSSxpQkFBVyxFQUFtQixDQUFDO1lBUXBGLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDL0UsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksbURBQTZCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXBHLGdDQUFnQztZQUNoQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pLLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXpILG9GQUFvRjtZQUNwRixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDcEYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDekMsSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxTQUF1QztZQUUzRCxLQUFLLE1BQU0sU0FBUyxJQUFJLFNBQVMsRUFBRTtnQkFDbEMsTUFBTSxlQUFlLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7Z0JBQzlDLGVBQWUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUV4RCxNQUFNLFFBQVEsR0FBaUM7d0JBQzlDLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUzt3QkFDMUIsU0FBUyxFQUFFLEVBQUU7cUJBQ2IsQ0FBQztvQkFFRixLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUU7d0JBRWhDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRTs0QkFDZixLQUFLLHdDQUF1QixDQUFDLFdBQVc7Z0NBQ3ZDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO29DQUN2QixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7b0NBQ1osT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQ0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQXdDLENBQUM7aUNBQ25KLENBQUMsQ0FBQztnQ0FDSCxNQUFNOzRCQUNQLEtBQUssd0NBQXVCLENBQUMsSUFBSTtnQ0FDaEMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7b0NBQ3ZCLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtvQ0FDWixLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7b0NBQ2QsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO29DQUNoQixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07aUNBQ2hCLENBQUMsQ0FBQztnQ0FDSCxNQUFNOzRCQUNQLEtBQUssd0NBQXVCLENBQUMsTUFBTTtnQ0FDbEMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7b0NBQ3ZCLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtvQ0FDWixLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7b0NBQ2QsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFXLENBQUMsbUJBQW1CLENBQUM7aUNBQ3ZELENBQUMsQ0FBQztnQ0FDSCxNQUFNOzRCQUNQLEtBQUssd0NBQXVCLENBQUMsVUFBVTtnQ0FDdEMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7b0NBQ3ZCLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtvQ0FDWixLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7b0NBQ2QsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO29DQUNwQixXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsbUNBQVcsQ0FBQyx1QkFBdUIsQ0FBQztvQ0FDbkUsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO2lDQUNoQixDQUFDLENBQUM7Z0NBQ0gsTUFBTTs0QkFDUCxLQUFLLHdDQUF1QixDQUFDLGtCQUFrQixDQUFDOzRCQUNoRCxLQUFLLHdDQUF1QixDQUFDLGlCQUFpQixDQUFDOzRCQUMvQyxLQUFLLHdDQUF1QixDQUFDLGtCQUFrQixDQUFDOzRCQUNoRCxLQUFLLHdDQUF1QixDQUFDLDBCQUEwQjtnQ0FDdEQsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQzNCLE1BQU07eUJBQ1A7cUJBQ0Q7b0JBRUQsTUFBTSw4QkFBOEIsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssd0NBQXVCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztvQkFFNUgseUVBQXlFO29CQUN6RSwwRUFBMEU7b0JBQzFFLHFEQUFxRDtvQkFDckQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FDOUIsU0FBUyxDQUFDLEdBQUcsRUFDYixJQUFJLCtDQUE2QixDQUFDLFFBQVEsQ0FBQyxFQUMzQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFDL0QsOEJBQThCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FDL0QsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVKLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUN4RTtRQUNGLENBQUM7UUFFRCxzQkFBc0IsQ0FBQyxJQUFXO1lBQ2pDLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUN2QixJQUFJLENBQUMsOEJBQThCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDO2dCQUN4RCxJQUFJLENBQUMsOEJBQThCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2hEO1FBQ0YsQ0FBQztRQUdELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxPQUF3RDtZQUNoRixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdEgsc0ZBQXNGO1lBQ3RGLDBFQUEwRTtZQUMxRSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFO2dCQUN0QyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztZQUVILDBDQUEwQztZQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWhFLDBFQUEwRTtZQUMxRSxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7Z0JBQ3BCLE1BQU0sSUFBSSxHQUFHLG1DQUFXLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM5RCxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7YUFDM0Y7WUFDRCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQzVCLENBQUM7UUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsYUFBNEI7WUFDbEQsTUFBTSxHQUFHLEdBQUcsU0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN0QyxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ25GLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUE0QjtZQUNsRCxNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXRDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLG1DQUFtQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4RSxNQUFNLFVBQVUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDM0MsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2QsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUNELENBQUE7SUFqSlksa0VBQTJCOzBDQUEzQiwyQkFBMkI7UUFVckMsV0FBQSx3RUFBbUMsQ0FBQTtRQUNuQyxXQUFBLGlDQUFtQixDQUFBO09BWFQsMkJBQTJCLENBaUp2QyJ9