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
define(["require", "exports", "vs/base/common/assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostDocumentData", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTextEditor", "vs/workbench/api/common/extHostTypeConverters", "vs/platform/log/common/log", "vs/base/common/map", "vs/base/common/network", "vs/base/common/iterator", "vs/base/common/lazy"], function (require, exports, assert, event_1, lifecycle_1, uri_1, instantiation_1, extHost_protocol_1, extHostDocumentData_1, extHostRpcService_1, extHostTextEditor_1, typeConverters, log_1, map_1, network_1, iterator_1, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtHostDocumentsAndEditors = exports.ExtHostDocumentsAndEditors = void 0;
    class Reference {
        constructor(value) {
            this.value = value;
            this._count = 0;
        }
        ref() {
            this._count++;
        }
        unref() {
            return --this._count === 0;
        }
    }
    let ExtHostDocumentsAndEditors = class ExtHostDocumentsAndEditors {
        constructor(_extHostRpc, _logService) {
            this._extHostRpc = _extHostRpc;
            this._logService = _logService;
            this._activeEditorId = null;
            this._editors = new Map();
            this._documents = new map_1.ResourceMap();
            this._onDidAddDocuments = new event_1.Emitter();
            this._onDidRemoveDocuments = new event_1.Emitter();
            this._onDidChangeVisibleTextEditors = new event_1.Emitter();
            this._onDidChangeActiveTextEditor = new event_1.Emitter();
            this.onDidAddDocuments = this._onDidAddDocuments.event;
            this.onDidRemoveDocuments = this._onDidRemoveDocuments.event;
            this.onDidChangeVisibleTextEditors = this._onDidChangeVisibleTextEditors.event;
            this.onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;
        }
        $acceptDocumentsAndEditorsDelta(delta) {
            this.acceptDocumentsAndEditorsDelta(delta);
        }
        acceptDocumentsAndEditorsDelta(delta) {
            const removedDocuments = [];
            const addedDocuments = [];
            const removedEditors = [];
            if (delta.removedDocuments) {
                for (const uriComponent of delta.removedDocuments) {
                    const uri = uri_1.URI.revive(uriComponent);
                    const data = this._documents.get(uri);
                    if (data?.unref()) {
                        this._documents.delete(uri);
                        removedDocuments.push(data.value);
                    }
                }
            }
            if (delta.addedDocuments) {
                for (const data of delta.addedDocuments) {
                    const resource = uri_1.URI.revive(data.uri);
                    let ref = this._documents.get(resource);
                    // double check -> only notebook cell documents should be
                    // referenced/opened more than once...
                    if (ref) {
                        if (resource.scheme !== network_1.Schemas.vscodeNotebookCell && resource.scheme !== network_1.Schemas.vscodeInteractiveInput) {
                            throw new Error(`document '${resource} already exists!'`);
                        }
                    }
                    if (!ref) {
                        ref = new Reference(new extHostDocumentData_1.ExtHostDocumentData(this._extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadDocuments), resource, data.lines, data.EOL, data.versionId, data.languageId, data.isDirty, data.notebook));
                        this._documents.set(resource, ref);
                        addedDocuments.push(ref.value);
                    }
                    ref.ref();
                }
            }
            if (delta.removedEditors) {
                for (const id of delta.removedEditors) {
                    const editor = this._editors.get(id);
                    this._editors.delete(id);
                    if (editor) {
                        removedEditors.push(editor);
                    }
                }
            }
            if (delta.addedEditors) {
                for (const data of delta.addedEditors) {
                    const resource = uri_1.URI.revive(data.documentUri);
                    assert.ok(this._documents.has(resource), `document '${resource}' does not exist`);
                    assert.ok(!this._editors.has(data.id), `editor '${data.id}' already exists!`);
                    const documentData = this._documents.get(resource).value;
                    const editor = new extHostTextEditor_1.ExtHostTextEditor(data.id, this._extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadTextEditors), this._logService, new lazy_1.Lazy(() => documentData.document), data.selections.map(typeConverters.Selection.to), data.options, data.visibleRanges.map(range => typeConverters.Range.to(range)), typeof data.editorPosition === 'number' ? typeConverters.ViewColumn.to(data.editorPosition) : undefined);
                    this._editors.set(data.id, editor);
                }
            }
            if (delta.newActiveEditor !== undefined) {
                assert.ok(delta.newActiveEditor === null || this._editors.has(delta.newActiveEditor), `active editor '${delta.newActiveEditor}' does not exist`);
                this._activeEditorId = delta.newActiveEditor;
            }
            (0, lifecycle_1.dispose)(removedDocuments);
            (0, lifecycle_1.dispose)(removedEditors);
            // now that the internal state is complete, fire events
            if (delta.removedDocuments) {
                this._onDidRemoveDocuments.fire(removedDocuments);
            }
            if (delta.addedDocuments) {
                this._onDidAddDocuments.fire(addedDocuments);
            }
            if (delta.removedEditors || delta.addedEditors) {
                this._onDidChangeVisibleTextEditors.fire(this.allEditors().map(editor => editor.value));
            }
            if (delta.newActiveEditor !== undefined) {
                this._onDidChangeActiveTextEditor.fire(this.activeEditor());
            }
        }
        getDocument(uri) {
            return this._documents.get(uri)?.value;
        }
        allDocuments() {
            return iterator_1.Iterable.map(this._documents.values(), ref => ref.value);
        }
        getEditor(id) {
            return this._editors.get(id);
        }
        activeEditor(internal) {
            if (!this._activeEditorId) {
                return undefined;
            }
            const editor = this._editors.get(this._activeEditorId);
            if (internal) {
                return editor;
            }
            else {
                return editor?.value;
            }
        }
        allEditors() {
            return [...this._editors.values()];
        }
    };
    exports.ExtHostDocumentsAndEditors = ExtHostDocumentsAndEditors;
    exports.ExtHostDocumentsAndEditors = ExtHostDocumentsAndEditors = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, log_1.ILogService)
    ], ExtHostDocumentsAndEditors);
    exports.IExtHostDocumentsAndEditors = (0, instantiation_1.createDecorator)('IExtHostDocumentsAndEditors');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERvY3VtZW50c0FuZEVkaXRvcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0RG9jdW1lbnRzQW5kRWRpdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFtQmhHLE1BQU0sU0FBUztRQUVkLFlBQXFCLEtBQVE7WUFBUixVQUFLLEdBQUwsS0FBSyxDQUFHO1lBRHJCLFdBQU0sR0FBRyxDQUFDLENBQUM7UUFDYyxDQUFDO1FBQ2xDLEdBQUc7WUFDRixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixDQUFDO1FBQ0QsS0FBSztZQUNKLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztRQUM1QixDQUFDO0tBQ0Q7SUFVTSxJQUFNLDBCQUEwQixHQUFoQyxNQUFNLDBCQUEwQjtRQW1CdEMsWUFDcUIsV0FBZ0QsRUFDdkQsV0FBeUM7WUFEakIsZ0JBQVcsR0FBWCxXQUFXLENBQW9CO1lBQ3RDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBakIvQyxvQkFBZSxHQUFrQixJQUFJLENBQUM7WUFFN0IsYUFBUSxHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO1lBQ2hELGVBQVUsR0FBRyxJQUFJLGlCQUFXLEVBQWtDLENBQUM7WUFFL0QsdUJBQWtCLEdBQUcsSUFBSSxlQUFPLEVBQWtDLENBQUM7WUFDbkUsMEJBQXFCLEdBQUcsSUFBSSxlQUFPLEVBQWtDLENBQUM7WUFDdEUsbUNBQThCLEdBQUcsSUFBSSxlQUFPLEVBQWdDLENBQUM7WUFDN0UsaUNBQTRCLEdBQUcsSUFBSSxlQUFPLEVBQWlDLENBQUM7WUFFcEYsc0JBQWlCLEdBQTBDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7WUFDekYseUJBQW9CLEdBQTBDLElBQUksQ0FBQyxxQkFBcUIs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