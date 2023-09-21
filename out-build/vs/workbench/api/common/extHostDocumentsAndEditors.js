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
    exports.$aM = exports.$_L = void 0;
    class Reference {
        constructor(value) {
            this.value = value;
            this.a = 0;
        }
        ref() {
            this.a++;
        }
        unref() {
            return --this.a === 0;
        }
    }
    let $_L = class $_L {
        constructor(h, i) {
            this.h = h;
            this.i = i;
            this.a = null;
            this.b = new Map();
            this.c = new map_1.$zi();
            this.d = new event_1.$fd();
            this.e = new event_1.$fd();
            this.f = new event_1.$fd();
            this.g = new event_1.$fd();
            this.onDidAddDocuments = this.d.event;
            this.onDidRemoveDocuments = this.e.event;
            this.onDidChangeVisibleTextEditors = this.f.event;
            this.onDidChangeActiveTextEditor = this.g.event;
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
                    const data = this.c.get(uri);
                    if (data?.unref()) {
                        this.c.delete(uri);
                        removedDocuments.push(data.value);
                    }
                }
            }
            if (delta.addedDocuments) {
                for (const data of delta.addedDocuments) {
                    const resource = uri_1.URI.revive(data.uri);
                    let ref = this.c.get(resource);
                    // double check -> only notebook cell documents should be
                    // referenced/opened more than once...
                    if (ref) {
                        if (resource.scheme !== network_1.Schemas.vscodeNotebookCell && resource.scheme !== network_1.Schemas.vscodeInteractiveInput) {
                            throw new Error(`document '${resource} already exists!'`);
                        }
                    }
                    if (!ref) {
                        ref = new Reference(new extHostDocumentData_1.$5L(this.h.getProxy(extHost_protocol_1.$1J.MainThreadDocuments), resource, data.lines, data.EOL, data.versionId, data.languageId, data.isDirty, data.notebook));
                        this.c.set(resource, ref);
                        addedDocuments.push(ref.value);
                    }
                    ref.ref();
                }
            }
            if (delta.removedEditors) {
                for (const id of delta.removedEditors) {
                    const editor = this.b.get(id);
                    this.b.delete(id);
                    if (editor) {
                        removedEditors.push(editor);
                    }
                }
            }
            if (delta.addedEditors) {
                for (const data of delta.addedEditors) {
                    const resource = uri_1.URI.revive(data.documentUri);
                    assert.ok(this.c.has(resource), `document '${resource}' does not exist`);
                    assert.ok(!this.b.has(data.id), `editor '${data.id}' already exists!`);
                    const documentData = this.c.get(resource).value;
                    const editor = new extHostTextEditor_1.$$L(data.id, this.h.getProxy(extHost_protocol_1.$1J.MainThreadTextEditors), this.i, new lazy_1.$T(() => documentData.document), data.selections.map(typeConverters.Selection.to), data.options, data.visibleRanges.map(range => typeConverters.Range.to(range)), typeof data.editorPosition === 'number' ? typeConverters.ViewColumn.to(data.editorPosition) : undefined);
                    this.b.set(data.id, editor);
                }
            }
            if (delta.newActiveEditor !== undefined) {
                assert.ok(delta.newActiveEditor === null || this.b.has(delta.newActiveEditor), `active editor '${delta.newActiveEditor}' does not exist`);
                this.a = delta.newActiveEditor;
            }
            (0, lifecycle_1.$fc)(removedDocuments);
            (0, lifecycle_1.$fc)(removedEditors);
            // now that the internal state is complete, fire events
            if (delta.removedDocuments) {
                this.e.fire(removedDocuments);
            }
            if (delta.addedDocuments) {
                this.d.fire(addedDocuments);
            }
            if (delta.removedEditors || delta.addedEditors) {
                this.f.fire(this.allEditors().map(editor => editor.value));
            }
            if (delta.newActiveEditor !== undefined) {
                this.g.fire(this.activeEditor());
            }
        }
        getDocument(uri) {
            return this.c.get(uri)?.value;
        }
        allDocuments() {
            return iterator_1.Iterable.map(this.c.values(), ref => ref.value);
        }
        getEditor(id) {
            return this.b.get(id);
        }
        activeEditor(internal) {
            if (!this.a) {
                return undefined;
            }
            const editor = this.b.get(this.a);
            if (internal) {
                return editor;
            }
            else {
                return editor?.value;
            }
        }
        allEditors() {
            return [...this.b.values()];
        }
    };
    exports.$_L = $_L;
    exports.$_L = $_L = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, log_1.$5i)
    ], $_L);
    exports.$aM = (0, instantiation_1.$Bh)('IExtHostDocumentsAndEditors');
});
//# sourceMappingURL=extHostDocumentsAndEditors.js.map