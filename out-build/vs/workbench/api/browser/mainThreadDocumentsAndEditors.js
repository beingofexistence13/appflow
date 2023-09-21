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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/codeEditorService", "vs/editor/common/model", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/platform/files/common/files", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/api/browser/mainThreadDocuments", "vs/workbench/api/browser/mainThreadEditor", "vs/workbench/api/browser/mainThreadEditors", "vs/workbench/api/common/extHost.protocol", "vs/workbench/browser/parts/editor/textEditor", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/clipboard/common/clipboardService", "vs/workbench/services/path/common/pathService", "vs/base/common/collections", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/configuration/common/configuration"], function (require, exports, event_1, lifecycle_1, editorBrowser_1, codeEditorService_1, model_1, model_2, resolverService_1, files_1, extHostCustomers_1, mainThreadDocuments_1, mainThreadEditor_1, mainThreadEditors_1, extHost_protocol_1, textEditor_1, editorGroupColumn_1, editorService_1, editorGroupsService_1, textfiles_1, environmentService_1, workingCopyFileService_1, uriIdentity_1, clipboardService_1, pathService_1, collections_1, panecomposite_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Zeb = void 0;
    class TextEditorSnapshot {
        constructor(editor) {
            this.editor = editor;
            this.id = `${editor.getId()},${editor.getModel().id}`;
        }
    }
    class DocumentAndEditorStateDelta {
        constructor(removedDocuments, addedDocuments, removedEditors, addedEditors, oldActiveEditor, newActiveEditor) {
            this.removedDocuments = removedDocuments;
            this.addedDocuments = addedDocuments;
            this.removedEditors = removedEditors;
            this.addedEditors = addedEditors;
            this.oldActiveEditor = oldActiveEditor;
            this.newActiveEditor = newActiveEditor;
            this.isEmpty = this.removedDocuments.length === 0
                && this.addedDocuments.length === 0
                && this.removedEditors.length === 0
                && this.addedEditors.length === 0
                && oldActiveEditor === newActiveEditor;
        }
        toString() {
            let ret = 'DocumentAndEditorStateDelta\n';
            ret += `\tRemoved Documents: [${this.removedDocuments.map(d => d.uri.toString(true)).join(', ')}]\n`;
            ret += `\tAdded Documents: [${this.addedDocuments.map(d => d.uri.toString(true)).join(', ')}]\n`;
            ret += `\tRemoved Editors: [${this.removedEditors.map(e => e.id).join(', ')}]\n`;
            ret += `\tAdded Editors: [${this.addedEditors.map(e => e.id).join(', ')}]\n`;
            ret += `\tNew Active Editor: ${this.newActiveEditor}\n`;
            return ret;
        }
    }
    class DocumentAndEditorState {
        static compute(before, after) {
            if (!before) {
                return new DocumentAndEditorStateDelta([], [...after.documents.values()], [], [...after.textEditors.values()], undefined, after.activeEditor);
            }
            const documentDelta = (0, collections_1.$J)(before.documents, after.documents);
            const editorDelta = (0, collections_1.$K)(before.textEditors, after.textEditors);
            const oldActiveEditor = before.activeEditor !== after.activeEditor ? before.activeEditor : undefined;
            const newActiveEditor = before.activeEditor !== after.activeEditor ? after.activeEditor : undefined;
            return new DocumentAndEditorStateDelta(documentDelta.removed, documentDelta.added, editorDelta.removed, editorDelta.added, oldActiveEditor, newActiveEditor);
        }
        constructor(documents, textEditors, activeEditor) {
            this.documents = documents;
            this.textEditors = textEditors;
            this.activeEditor = activeEditor;
            //
        }
    }
    var ActiveEditorOrder;
    (function (ActiveEditorOrder) {
        ActiveEditorOrder[ActiveEditorOrder["Editor"] = 0] = "Editor";
        ActiveEditorOrder[ActiveEditorOrder["Panel"] = 1] = "Panel";
    })(ActiveEditorOrder || (ActiveEditorOrder = {}));
    let MainThreadDocumentAndEditorStateComputer = class MainThreadDocumentAndEditorStateComputer {
        constructor(g, h, i, j, k) {
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.a = new lifecycle_1.$jc();
            this.b = new lifecycle_1.$sc();
            this.f = 0 /* ActiveEditorOrder.Editor */;
            this.h.onModelAdded(this.o, this, this.a);
            this.h.onModelRemoved(_ => this.p(), this, this.a);
            this.j.onDidActiveEditorChange(_ => this.p(), this, this.a);
            this.i.onCodeEditorAdd(this.l, this, this.a);
            this.i.onCodeEditorRemove(this.n, this, this.a);
            this.i.listCodeEditors().forEach(this.l, this);
            event_1.Event.filter(this.k.onDidPaneCompositeOpen, event => event.viewContainerLocation === 1 /* ViewContainerLocation.Panel */)(_ => this.f = 1 /* ActiveEditorOrder.Panel */, undefined, this.a);
            event_1.Event.filter(this.k.onDidPaneCompositeClose, event => event.viewContainerLocation === 1 /* ViewContainerLocation.Panel */)(_ => this.f = 0 /* ActiveEditorOrder.Editor */, undefined, this.a);
            this.j.onDidVisibleEditorsChange(_ => this.f = 0 /* ActiveEditorOrder.Editor */, undefined, this.a);
            this.p();
        }
        dispose() {
            this.a.dispose();
            this.b.dispose();
        }
        l(e) {
            this.b.set(e.getId(), (0, lifecycle_1.$hc)(e.onDidChangeModel(() => this.p()), e.onDidFocusEditorText(() => this.p()), e.onDidFocusEditorWidget(() => this.p(e))));
            this.p();
        }
        n(e) {
            const id = e.getId();
            if (this.b.has(id)) {
                this.b.deleteAndDispose(id);
                this.p();
            }
        }
        o(model) {
            if (!(0, model_1.$Gu)(model)) {
                // ignore
                return;
            }
            if (!this.c) {
                // too early
                this.p();
                return;
            }
            // small (fast) delta
            this.c = new DocumentAndEditorState(this.c.documents.add(model), this.c.textEditors, this.c.activeEditor);
            this.g(new DocumentAndEditorStateDelta([], [model], [], [], undefined, undefined));
        }
        p(widgetFocusCandidate) {
            // models: ignore too large models
            const models = new Set();
            for (const model of this.h.getModels()) {
                if ((0, model_1.$Gu)(model)) {
                    models.add(model);
                }
            }
            // editor: only take those that have a not too large model
            const editors = new Map();
            let activeEditor = null; // Strict null work. This doesn't like being undefined!
            for (const editor of this.i.listCodeEditors()) {
                if (editor.isSimpleWidget) {
                    continue;
                }
                const model = editor.getModel();
                if (editor.hasModel() && model && (0, model_1.$Gu)(model)
                    && !model.isDisposed() // model disposed
                    && Boolean(this.h.getModel(model.uri)) // model disposing, the flag didn't flip yet but the model service already removed it
                ) {
                    const apiEditor = new TextEditorSnapshot(editor);
                    editors.set(apiEditor.id, apiEditor);
                    if (editor.hasTextFocus() || (widgetFocusCandidate === editor && editor.hasWidgetFocus())) {
                        // text focus has priority, widget focus is tricky because multiple
                        // editors might claim widget focus at the same time. therefore we use a
                        // candidate (which is the editor that has raised an widget focus event)
                        // in addition to the widget focus check
                        activeEditor = apiEditor.id;
                    }
                }
            }
            // active editor: if none of the previous editors had focus we try
            // to match output panels or the active workbench editor with
            // one of editor we have just computed
            if (!activeEditor) {
                let candidate;
                if (this.f === 0 /* ActiveEditorOrder.Editor */) {
                    candidate = this.r() || this.q();
                }
                else {
                    candidate = this.q() || this.r();
                }
                if (candidate) {
                    for (const snapshot of editors.values()) {
                        if (candidate === snapshot.editor) {
                            activeEditor = snapshot.id;
                        }
                    }
                }
            }
            // compute new state and compare against old
            const newState = new DocumentAndEditorState(models, editors, activeEditor);
            const delta = DocumentAndEditorState.compute(this.c, newState);
            if (!delta.isEmpty) {
                this.c = newState;
                this.g(delta);
            }
        }
        q() {
            const panel = this.k.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
            if (panel instanceof textEditor_1.$oeb) {
                const control = panel.getControl();
                if ((0, editorBrowser_1.$iV)(control)) {
                    return control;
                }
            }
            return undefined;
        }
        r() {
            let activeTextEditorControl = this.j.activeTextEditorControl;
            if ((0, editorBrowser_1.$jV)(activeTextEditorControl)) {
                activeTextEditorControl = activeTextEditorControl.getModifiedEditor();
            }
            return activeTextEditorControl;
        }
    };
    MainThreadDocumentAndEditorStateComputer = __decorate([
        __param(1, model_2.$yA),
        __param(2, codeEditorService_1.$nV),
        __param(3, editorService_1.$9C),
        __param(4, panecomposite_1.$Yeb)
    ], MainThreadDocumentAndEditorStateComputer);
    let $Zeb = class $Zeb {
        constructor(extHostContext, h, i, j, codeEditorService, fileService, textModelResolverService, k, paneCompositeService, environmentService, workingCopyFileService, uriIdentityService, l, pathService, configurationService) {
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.a = new lifecycle_1.$jc();
            this.g = new Map();
            this.b = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostDocumentsAndEditors);
            this.c = this.a.add(new mainThreadDocuments_1.$Mcb(extHostContext, this.h, this.i, fileService, textModelResolverService, environmentService, uriIdentityService, workingCopyFileService, pathService));
            extHostContext.set(extHost_protocol_1.$1J.MainThreadDocuments, this.c);
            this.f = this.a.add(new mainThreadEditors_1.$meb(this, extHostContext, codeEditorService, this.j, this.k, configurationService));
            extHostContext.set(extHost_protocol_1.$1J.MainThreadTextEditors, this.f);
            // It is expected that the ctor of the state computer calls our `_onDelta`.
            this.a.add(new MainThreadDocumentAndEditorStateComputer(delta => this.n(delta), h, codeEditorService, this.j, paneCompositeService));
        }
        dispose() {
            this.a.dispose();
        }
        n(delta) {
            const removedEditors = [];
            const addedEditors = [];
            // removed models
            const removedDocuments = delta.removedDocuments.map(m => m.uri);
            // added editors
            for (const apiEditor of delta.addedEditors) {
                const mainThreadEditor = new mainThreadEditor_1.$Ocb(apiEditor.id, apiEditor.editor.getModel(), apiEditor.editor, { onGainedFocus() { }, onLostFocus() { } }, this.c, this.h, this.l);
                this.g.set(apiEditor.id, mainThreadEditor);
                addedEditors.push(mainThreadEditor);
            }
            // removed editors
            for (const { id } of delta.removedEditors) {
                const mainThreadEditor = this.g.get(id);
                if (mainThreadEditor) {
                    mainThreadEditor.dispose();
                    this.g.delete(id);
                    removedEditors.push(id);
                }
            }
            const extHostDelta = Object.create(null);
            let empty = true;
            if (delta.newActiveEditor !== undefined) {
                empty = false;
                extHostDelta.newActiveEditor = delta.newActiveEditor;
            }
            if (removedDocuments.length > 0) {
                empty = false;
                extHostDelta.removedDocuments = removedDocuments;
            }
            if (removedEditors.length > 0) {
                empty = false;
                extHostDelta.removedEditors = removedEditors;
            }
            if (delta.addedDocuments.length > 0) {
                empty = false;
                extHostDelta.addedDocuments = delta.addedDocuments.map(m => this.o(m));
            }
            if (delta.addedEditors.length > 0) {
                empty = false;
                extHostDelta.addedEditors = addedEditors.map(e => this.p(e));
            }
            if (!empty) {
                // first update ext host
                this.b.$acceptDocumentsAndEditorsDelta(extHostDelta);
                // second update dependent document/editor states
                removedDocuments.forEach(this.c.handleModelRemoved, this.c);
                delta.addedDocuments.forEach(this.c.handleModelAdded, this.c);
                removedEditors.forEach(this.f.handleTextEditorRemoved, this.f);
                addedEditors.forEach(this.f.handleTextEditorAdded, this.f);
            }
        }
        o(model) {
            return {
                uri: model.uri,
                versionId: model.getVersionId(),
                lines: model.getLinesContent(),
                EOL: model.getEOL(),
                languageId: model.getLanguageId(),
                isDirty: this.i.isDirty(model.uri)
            };
        }
        p(textEditor) {
            const props = textEditor.getProperties();
            return {
                id: textEditor.getId(),
                documentUri: textEditor.getModel().uri,
                options: props.options,
                selections: props.selections,
                visibleRanges: props.visibleRanges,
                editorPosition: this.q(textEditor)
            };
        }
        q(editor) {
            for (const editorPane of this.j.visibleEditorPanes) {
                if (editor.matches(editorPane)) {
                    return (0, editorGroupColumn_1.$5I)(this.k, editorPane.group);
                }
            }
            return undefined;
        }
        findTextEditorIdFor(editorPane) {
            for (const [id, editor] of this.g) {
                if (editor.matches(editorPane)) {
                    return id;
                }
            }
            return undefined;
        }
        getIdOfCodeEditor(codeEditor) {
            for (const [id, editor] of this.g) {
                if (editor.getCodeEditor() === codeEditor) {
                    return id;
                }
            }
            return undefined;
        }
        getEditor(id) {
            return this.g.get(id);
        }
    };
    exports.$Zeb = $Zeb;
    exports.$Zeb = $Zeb = __decorate([
        extHostCustomers_1.$kbb,
        __param(1, model_2.$yA),
        __param(2, textfiles_1.$JD),
        __param(3, editorService_1.$9C),
        __param(4, codeEditorService_1.$nV),
        __param(5, files_1.$6j),
        __param(6, resolverService_1.$uA),
        __param(7, editorGroupsService_1.$5C),
        __param(8, panecomposite_1.$Yeb),
        __param(9, environmentService_1.$hJ),
        __param(10, workingCopyFileService_1.$HD),
        __param(11, uriIdentity_1.$Ck),
        __param(12, clipboardService_1.$UZ),
        __param(13, pathService_1.$yJ),
        __param(14, configuration_1.$8h)
    ], $Zeb);
});
//# sourceMappingURL=mainThreadDocumentsAndEditors.js.map