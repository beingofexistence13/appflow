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
    exports.MainThreadDocumentsAndEditors = void 0;
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
            const documentDelta = (0, collections_1.diffSets)(before.documents, after.documents);
            const editorDelta = (0, collections_1.diffMaps)(before.textEditors, after.textEditors);
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
        constructor(_onDidChangeState, _modelService, _codeEditorService, _editorService, _paneCompositeService) {
            this._onDidChangeState = _onDidChangeState;
            this._modelService = _modelService;
            this._codeEditorService = _codeEditorService;
            this._editorService = _editorService;
            this._paneCompositeService = _paneCompositeService;
            this._toDispose = new lifecycle_1.DisposableStore();
            this._toDisposeOnEditorRemove = new lifecycle_1.DisposableMap();
            this._activeEditorOrder = 0 /* ActiveEditorOrder.Editor */;
            this._modelService.onModelAdded(this._updateStateOnModelAdd, this, this._toDispose);
            this._modelService.onModelRemoved(_ => this._updateState(), this, this._toDispose);
            this._editorService.onDidActiveEditorChange(_ => this._updateState(), this, this._toDispose);
            this._codeEditorService.onCodeEditorAdd(this._onDidAddEditor, this, this._toDispose);
            this._codeEditorService.onCodeEditorRemove(this._onDidRemoveEditor, this, this._toDispose);
            this._codeEditorService.listCodeEditors().forEach(this._onDidAddEditor, this);
            event_1.Event.filter(this._paneCompositeService.onDidPaneCompositeOpen, event => event.viewContainerLocation === 1 /* ViewContainerLocation.Panel */)(_ => this._activeEditorOrder = 1 /* ActiveEditorOrder.Panel */, undefined, this._toDispose);
            event_1.Event.filter(this._paneCompositeService.onDidPaneCompositeClose, event => event.viewContainerLocation === 1 /* ViewContainerLocation.Panel */)(_ => this._activeEditorOrder = 0 /* ActiveEditorOrder.Editor */, undefined, this._toDispose);
            this._editorService.onDidVisibleEditorsChange(_ => this._activeEditorOrder = 0 /* ActiveEditorOrder.Editor */, undefined, this._toDispose);
            this._updateState();
        }
        dispose() {
            this._toDispose.dispose();
            this._toDisposeOnEditorRemove.dispose();
        }
        _onDidAddEditor(e) {
            this._toDisposeOnEditorRemove.set(e.getId(), (0, lifecycle_1.combinedDisposable)(e.onDidChangeModel(() => this._updateState()), e.onDidFocusEditorText(() => this._updateState()), e.onDidFocusEditorWidget(() => this._updateState(e))));
            this._updateState();
        }
        _onDidRemoveEditor(e) {
            const id = e.getId();
            if (this._toDisposeOnEditorRemove.has(id)) {
                this._toDisposeOnEditorRemove.deleteAndDispose(id);
                this._updateState();
            }
        }
        _updateStateOnModelAdd(model) {
            if (!(0, model_1.shouldSynchronizeModel)(model)) {
                // ignore
                return;
            }
            if (!this._currentState) {
                // too early
                this._updateState();
                return;
            }
            // small (fast) delta
            this._currentState = new DocumentAndEditorState(this._currentState.documents.add(model), this._currentState.textEditors, this._currentState.activeEditor);
            this._onDidChangeState(new DocumentAndEditorStateDelta([], [model], [], [], undefined, undefined));
        }
        _updateState(widgetFocusCandidate) {
            // models: ignore too large models
            const models = new Set();
            for (const model of this._modelService.getModels()) {
                if ((0, model_1.shouldSynchronizeModel)(model)) {
                    models.add(model);
                }
            }
            // editor: only take those that have a not too large model
            const editors = new Map();
            let activeEditor = null; // Strict null work. This doesn't like being undefined!
            for (const editor of this._codeEditorService.listCodeEditors()) {
                if (editor.isSimpleWidget) {
                    continue;
                }
                const model = editor.getModel();
                if (editor.hasModel() && model && (0, model_1.shouldSynchronizeModel)(model)
                    && !model.isDisposed() // model disposed
                    && Boolean(this._modelService.getModel(model.uri)) // model disposing, the flag didn't flip yet but the model service already removed it
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
                if (this._activeEditorOrder === 0 /* ActiveEditorOrder.Editor */) {
                    candidate = this._getActiveEditorFromEditorPart() || this._getActiveEditorFromPanel();
                }
                else {
                    candidate = this._getActiveEditorFromPanel() || this._getActiveEditorFromEditorPart();
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
            const delta = DocumentAndEditorState.compute(this._currentState, newState);
            if (!delta.isEmpty) {
                this._currentState = newState;
                this._onDidChangeState(delta);
            }
        }
        _getActiveEditorFromPanel() {
            const panel = this._paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
            if (panel instanceof textEditor_1.AbstractTextEditor) {
                const control = panel.getControl();
                if ((0, editorBrowser_1.isCodeEditor)(control)) {
                    return control;
                }
            }
            return undefined;
        }
        _getActiveEditorFromEditorPart() {
            let activeTextEditorControl = this._editorService.activeTextEditorControl;
            if ((0, editorBrowser_1.isDiffEditor)(activeTextEditorControl)) {
                activeTextEditorControl = activeTextEditorControl.getModifiedEditor();
            }
            return activeTextEditorControl;
        }
    };
    MainThreadDocumentAndEditorStateComputer = __decorate([
        __param(1, model_2.IModelService),
        __param(2, codeEditorService_1.ICodeEditorService),
        __param(3, editorService_1.IEditorService),
        __param(4, panecomposite_1.IPaneCompositePartService)
    ], MainThreadDocumentAndEditorStateComputer);
    let MainThreadDocumentsAndEditors = class MainThreadDocumentsAndEditors {
        constructor(extHostContext, _modelService, _textFileService, _editorService, codeEditorService, fileService, textModelResolverService, _editorGroupService, paneCompositeService, environmentService, workingCopyFileService, uriIdentityService, _clipboardService, pathService, configurationService) {
            this._modelService = _modelService;
            this._textFileService = _textFileService;
            this._editorService = _editorService;
            this._editorGroupService = _editorGroupService;
            this._clipboardService = _clipboardService;
            this._toDispose = new lifecycle_1.DisposableStore();
            this._textEditors = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostDocumentsAndEditors);
            this._mainThreadDocuments = this._toDispose.add(new mainThreadDocuments_1.MainThreadDocuments(extHostContext, this._modelService, this._textFileService, fileService, textModelResolverService, environmentService, uriIdentityService, workingCopyFileService, pathService));
            extHostContext.set(extHost_protocol_1.MainContext.MainThreadDocuments, this._mainThreadDocuments);
            this._mainThreadEditors = this._toDispose.add(new mainThreadEditors_1.MainThreadTextEditors(this, extHostContext, codeEditorService, this._editorService, this._editorGroupService, configurationService));
            extHostContext.set(extHost_protocol_1.MainContext.MainThreadTextEditors, this._mainThreadEditors);
            // It is expected that the ctor of the state computer calls our `_onDelta`.
            this._toDispose.add(new MainThreadDocumentAndEditorStateComputer(delta => this._onDelta(delta), _modelService, codeEditorService, this._editorService, paneCompositeService));
        }
        dispose() {
            this._toDispose.dispose();
        }
        _onDelta(delta) {
            const removedEditors = [];
            const addedEditors = [];
            // removed models
            const removedDocuments = delta.removedDocuments.map(m => m.uri);
            // added editors
            for (const apiEditor of delta.addedEditors) {
                const mainThreadEditor = new mainThreadEditor_1.MainThreadTextEditor(apiEditor.id, apiEditor.editor.getModel(), apiEditor.editor, { onGainedFocus() { }, onLostFocus() { } }, this._mainThreadDocuments, this._modelService, this._clipboardService);
                this._textEditors.set(apiEditor.id, mainThreadEditor);
                addedEditors.push(mainThreadEditor);
            }
            // removed editors
            for (const { id } of delta.removedEditors) {
                const mainThreadEditor = this._textEditors.get(id);
                if (mainThreadEditor) {
                    mainThreadEditor.dispose();
                    this._textEditors.delete(id);
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
                extHostDelta.addedDocuments = delta.addedDocuments.map(m => this._toModelAddData(m));
            }
            if (delta.addedEditors.length > 0) {
                empty = false;
                extHostDelta.addedEditors = addedEditors.map(e => this._toTextEditorAddData(e));
            }
            if (!empty) {
                // first update ext host
                this._proxy.$acceptDocumentsAndEditorsDelta(extHostDelta);
                // second update dependent document/editor states
                removedDocuments.forEach(this._mainThreadDocuments.handleModelRemoved, this._mainThreadDocuments);
                delta.addedDocuments.forEach(this._mainThreadDocuments.handleModelAdded, this._mainThreadDocuments);
                removedEditors.forEach(this._mainThreadEditors.handleTextEditorRemoved, this._mainThreadEditors);
                addedEditors.forEach(this._mainThreadEditors.handleTextEditorAdded, this._mainThreadEditors);
            }
        }
        _toModelAddData(model) {
            return {
                uri: model.uri,
                versionId: model.getVersionId(),
                lines: model.getLinesContent(),
                EOL: model.getEOL(),
                languageId: model.getLanguageId(),
                isDirty: this._textFileService.isDirty(model.uri)
            };
        }
        _toTextEditorAddData(textEditor) {
            const props = textEditor.getProperties();
            return {
                id: textEditor.getId(),
                documentUri: textEditor.getModel().uri,
                options: props.options,
                selections: props.selections,
                visibleRanges: props.visibleRanges,
                editorPosition: this._findEditorPosition(textEditor)
            };
        }
        _findEditorPosition(editor) {
            for (const editorPane of this._editorService.visibleEditorPanes) {
                if (editor.matches(editorPane)) {
                    return (0, editorGroupColumn_1.editorGroupToColumn)(this._editorGroupService, editorPane.group);
                }
            }
            return undefined;
        }
        findTextEditorIdFor(editorPane) {
            for (const [id, editor] of this._textEditors) {
                if (editor.matches(editorPane)) {
                    return id;
                }
            }
            return undefined;
        }
        getIdOfCodeEditor(codeEditor) {
            for (const [id, editor] of this._textEditors) {
                if (editor.getCodeEditor() === codeEditor) {
                    return id;
                }
            }
            return undefined;
        }
        getEditor(id) {
            return this._textEditors.get(id);
        }
    };
    exports.MainThreadDocumentsAndEditors = MainThreadDocumentsAndEditors;
    exports.MainThreadDocumentsAndEditors = MainThreadDocumentsAndEditors = __decorate([
        extHostCustomers_1.extHostCustomer,
        __param(1, model_2.IModelService),
        __param(2, textfiles_1.ITextFileService),
        __param(3, editorService_1.IEditorService),
        __param(4, codeEditorService_1.ICodeEditorService),
        __param(5, files_1.IFileService),
        __param(6, resolverService_1.ITextModelService),
        __param(7, editorGroupsService_1.IEditorGroupsService),
        __param(8, panecomposite_1.IPaneCompositePartService),
        __param(9, environmentService_1.IWorkbenchEnvironmentService),
        __param(10, workingCopyFileService_1.IWorkingCopyFileService),
        __param(11, uriIdentity_1.IUriIdentityService),
        __param(12, clipboardService_1.IClipboardService),
        __param(13, pathService_1.IPathService),
        __param(14, configuration_1.IConfigurationService)
    ], MainThreadDocumentsAndEditors);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZERvY3VtZW50c0FuZEVkaXRvcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZERvY3VtZW50c0FuZEVkaXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUNoRyxNQUFNLGtCQUFrQjtRQUl2QixZQUNVLE1BQXlCO1lBQXpCLFdBQU0sR0FBTixNQUFNLENBQW1CO1lBRWxDLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3ZELENBQUM7S0FDRDtJQUVELE1BQU0sMkJBQTJCO1FBSWhDLFlBQ1UsZ0JBQThCLEVBQzlCLGNBQTRCLEVBQzVCLGNBQW9DLEVBQ3BDLFlBQWtDLEVBQ2xDLGVBQTBDLEVBQzFDLGVBQTBDO1lBTDFDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBYztZQUM5QixtQkFBYyxHQUFkLGNBQWMsQ0FBYztZQUM1QixtQkFBYyxHQUFkLGNBQWMsQ0FBc0I7WUFDcEMsaUJBQVksR0FBWixZQUFZLENBQXNCO1lBQ2xDLG9CQUFlLEdBQWYsZUFBZSxDQUEyQjtZQUMxQyxvQkFBZSxHQUFmLGVBQWUsQ0FBMkI7WUFFbkQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUM7bUJBQzdDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUM7bUJBQ2hDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUM7bUJBQ2hDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUM7bUJBQzlCLGVBQWUsS0FBSyxlQUFlLENBQUM7UUFDekMsQ0FBQztRQUVELFFBQVE7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