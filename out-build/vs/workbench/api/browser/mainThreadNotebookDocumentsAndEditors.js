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
define(["require", "exports", "vs/base/common/collections", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/workbench/api/browser/mainThreadNotebookDocuments", "vs/workbench/api/browser/mainThreadNotebookDto", "vs/workbench/api/browser/mainThreadNotebookEditors", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "../common/extHost.protocol", "vs/workbench/services/extensions/common/proxyIdentifier"], function (require, exports, collections_1, lifecycle_1, instantiation_1, log_1, mainThreadNotebookDocuments_1, mainThreadNotebookDto_1, mainThreadNotebookEditors_1, extHostCustomers_1, editorGroupColumn_1, notebookBrowser_1, notebookEditorService_1, notebookService_1, editorGroupsService_1, editorService_1, extHost_protocol_1, proxyIdentifier_1) {
    "use strict";
    var $5rb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5rb = void 0;
    class NotebookAndEditorState {
        static delta(before, after) {
            if (!before) {
                return {
                    addedDocuments: [...after.documents],
                    removedDocuments: [],
                    addedEditors: [...after.textEditors.values()],
                    removedEditors: [],
                    visibleEditors: [...after.visibleEditors].map(editor => editor[0])
                };
            }
            const documentDelta = (0, collections_1.$J)(before.documents, after.documents);
            const editorDelta = (0, collections_1.$K)(before.textEditors, after.textEditors);
            const newActiveEditor = before.activeEditor !== after.activeEditor ? after.activeEditor : undefined;
            const visibleEditorDelta = (0, collections_1.$K)(before.visibleEditors, after.visibleEditors);
            return {
                addedDocuments: documentDelta.added,
                removedDocuments: documentDelta.removed.map(e => e.uri),
                addedEditors: editorDelta.added,
                removedEditors: editorDelta.removed.map(removed => removed.getId()),
                newActiveEditor: newActiveEditor,
                visibleEditors: visibleEditorDelta.added.length === 0 && visibleEditorDelta.removed.length === 0
                    ? undefined
                    : [...after.visibleEditors].map(editor => editor[0])
            };
        }
        constructor(documents, textEditors, activeEditor, visibleEditors) {
            this.documents = documents;
            this.textEditors = textEditors;
            this.activeEditor = activeEditor;
            this.visibleEditors = visibleEditors;
            //
        }
    }
    let $5rb = $5rb_1 = class $5rb {
        constructor(extHostContext, instantiationService, h, i, j, k, l) {
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.b = new lifecycle_1.$jc();
            this.c = new lifecycle_1.$sc();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostNotebook);
            this.f = instantiationService.createInstance(mainThreadNotebookDocuments_1.$3rb, extHostContext);
            this.g = instantiationService.createInstance(mainThreadNotebookEditors_1.$4rb, extHostContext);
            extHostContext.set(extHost_protocol_1.$1J.MainThreadNotebookDocuments, this.f);
            extHostContext.set(extHost_protocol_1.$1J.MainThreadNotebookEditors, this.g);
            this.h.onWillAddNotebookDocument(() => this.o(), this, this.b);
            this.h.onDidRemoveNotebookDocument(() => this.o(), this, this.b);
            this.j.onDidActiveEditorChange(() => this.o(), this, this.b);
            this.j.onDidVisibleEditorsChange(() => this.o(), this, this.b);
            this.i.onDidAddNotebookEditor(this.m, this, this.b);
            this.i.onDidRemoveNotebookEditor(this.n, this, this.b);
            this.o();
        }
        dispose() {
            this.f.dispose();
            this.g.dispose();
            this.b.dispose();
            this.c.dispose();
        }
        m(editor) {
            this.c.set(editor.getId(), (0, lifecycle_1.$hc)(editor.onDidChangeModel(() => this.o()), editor.onDidFocusWidget(() => this.o(editor))));
            this.o();
        }
        n(editor) {
            this.c.deleteAndDispose(editor.getId());
            this.o();
        }
        o(focusedEditor) {
            const editors = new Map();
            const visibleEditorsMap = new Map();
            for (const editor of this.i.listNotebookEditors()) {
                if (editor.hasModel()) {
                    editors.set(editor.getId(), editor);
                }
            }
            const activeNotebookEditor = (0, notebookBrowser_1.$Zbb)(this.j.activeEditorPane);
            let activeEditor = null;
            if (activeNotebookEditor) {
                activeEditor = activeNotebookEditor.getId();
            }
            else if (focusedEditor?.textModel) {
                activeEditor = focusedEditor.getId();
            }
            if (activeEditor && !editors.has(activeEditor)) {
                this.l.trace('MainThreadNotebooksAndEditors#_updateState: active editor is not in editors list', activeEditor, editors.keys());
                activeEditor = null;
            }
            for (const editorPane of this.j.visibleEditorPanes) {
                const notebookEditor = (0, notebookBrowser_1.$Zbb)(editorPane);
                if (notebookEditor?.hasModel() && editors.has(notebookEditor.getId())) {
                    visibleEditorsMap.set(notebookEditor.getId(), notebookEditor);
                }
            }
            const newState = new NotebookAndEditorState(new Set(this.h.listNotebookDocuments()), editors, activeEditor, visibleEditorsMap);
            this.p(NotebookAndEditorState.delta(this.d, newState));
            this.d = newState;
        }
        p(delta) {
            if ($5rb_1.q(delta)) {
                return;
            }
            const dto = {
                removedDocuments: delta.removedDocuments,
                removedEditors: delta.removedEditors,
                newActiveEditor: delta.newActiveEditor,
                visibleEditors: delta.visibleEditors,
                addedDocuments: delta.addedDocuments.map($5rb_1.r),
                addedEditors: delta.addedEditors.map(this.s, this),
            };
            // send to extension FIRST
            this.a.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.$dA(dto));
            // handle internally
            this.g.handleEditorsRemoved(delta.removedEditors);
            this.f.handleNotebooksRemoved(delta.removedDocuments);
            this.f.handleNotebooksAdded(delta.addedDocuments);
            this.g.handleEditorsAdded(delta.addedEditors);
        }
        static q(delta) {
            if (delta.addedDocuments !== undefined && delta.addedDocuments.length > 0) {
                return false;
            }
            if (delta.removedDocuments !== undefined && delta.removedDocuments.length > 0) {
                return false;
            }
            if (delta.addedEditors !== undefined && delta.addedEditors.length > 0) {
                return false;
            }
            if (delta.removedEditors !== undefined && delta.removedEditors.length > 0) {
                return false;
            }
            if (delta.visibleEditors !== undefined && delta.visibleEditors.length > 0) {
                return false;
            }
            if (delta.newActiveEditor !== undefined) {
                return false;
            }
            return true;
        }
        static r(e) {
            return {
                viewType: e.viewType,
                uri: e.uri,
                metadata: e.metadata,
                versionId: e.versionId,
                cells: e.cells.map(mainThreadNotebookDto_1.NotebookDto.toNotebookCellDto)
            };
        }
        s(add) {
            const pane = this.j.visibleEditorPanes.find(pane => (0, notebookBrowser_1.$Zbb)(pane) === add);
            return {
                id: add.getId(),
                documentUri: add.textModel.uri,
                selections: add.getSelections(),
                visibleRanges: add.visibleRanges,
                viewColumn: pane && (0, editorGroupColumn_1.$5I)(this.k, pane.group)
            };
        }
    };
    exports.$5rb = $5rb;
    exports.$5rb = $5rb = $5rb_1 = __decorate([
        extHostCustomers_1.$kbb,
        __param(1, instantiation_1.$Ah),
        __param(2, notebookService_1.$ubb),
        __param(3, notebookEditorService_1.$1rb),
        __param(4, editorService_1.$9C),
        __param(5, editorGroupsService_1.$5C),
        __param(6, log_1.$5i)
    ], $5rb);
});
//# sourceMappingURL=mainThreadNotebookDocumentsAndEditors.js.map