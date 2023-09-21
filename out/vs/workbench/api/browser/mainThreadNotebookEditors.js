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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/editor/common/editor", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "../common/extHost.protocol"], function (require, exports, lifecycle_1, objects_1, uri_1, configuration_1, editor_1, notebookBrowser_1, notebookEditorService_1, editorGroupColumn_1, editorGroupsService_1, editorService_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadNotebookEditors = void 0;
    class MainThreadNotebook {
        constructor(editor, disposables) {
            this.editor = editor;
            this.disposables = disposables;
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    let MainThreadNotebookEditors = class MainThreadNotebookEditors {
        constructor(extHostContext, _editorService, _notebookEditorService, _editorGroupService, _configurationService) {
            this._editorService = _editorService;
            this._notebookEditorService = _notebookEditorService;
            this._editorGroupService = _editorGroupService;
            this._configurationService = _configurationService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._mainThreadEditors = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostNotebookEditors);
            this._editorService.onDidActiveEditorChange(() => this._updateEditorViewColumns(), this, this._disposables);
            this._editorGroupService.onDidRemoveGroup(() => this._updateEditorViewColumns(), this, this._disposables);
            this._editorGroupService.onDidMoveGroup(() => this._updateEditorViewColumns(), this, this._disposables);
        }
        dispose() {
            this._disposables.dispose();
            (0, lifecycle_1.dispose)(this._mainThreadEditors.values());
        }
        handleEditorsAdded(editors) {
            for (const editor of editors) {
                const editorDisposables = new lifecycle_1.DisposableStore();
                editorDisposables.add(editor.onDidChangeVisibleRanges(() => {
                    this._proxy.$acceptEditorPropertiesChanged(editor.getId(), { visibleRanges: { ranges: editor.visibleRanges } });
                }));
                editorDisposables.add(editor.onDidChangeSelection(() => {
                    this._proxy.$acceptEditorPropertiesChanged(editor.getId(), { selections: { selections: editor.getSelections() } });
                }));
                const wrapper = new MainThreadNotebook(editor, editorDisposables);
                this._mainThreadEditors.set(editor.getId(), wrapper);
            }
        }
        handleEditorsRemoved(editorIds) {
            for (const id of editorIds) {
                this._mainThreadEditors.get(id)?.dispose();
                this._mainThreadEditors.delete(id);
            }
        }
        _updateEditorViewColumns() {
            const result = Object.create(null);
            for (const editorPane of this._editorService.visibleEditorPanes) {
                const candidate = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorPane);
                if (candidate && this._mainThreadEditors.has(candidate.getId())) {
                    result[candidate.getId()] = (0, editorGroupColumn_1.editorGroupToColumn)(this._editorGroupService, editorPane.group);
                }
            }
            if (!(0, objects_1.equals)(result, this._currentViewColumnInfo)) {
                this._currentViewColumnInfo = result;
                this._proxy.$acceptEditorViewColumns(result);
            }
        }
        async $tryShowNotebookDocument(resource, viewType, options) {
            const editorOptions = {
                cellSelections: options.selections,
                preserveFocus: options.preserveFocus,
                pinned: options.pinned,
                // selection: options.selection,
                // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
                // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
                activation: options.preserveFocus ? editor_1.EditorActivation.RESTORE : undefined,
                override: viewType
            };
            const editorPane = await this._editorService.openEditor({ resource: uri_1.URI.revive(resource), options: editorOptions }, (0, editorGroupColumn_1.columnToEditorGroup)(this._editorGroupService, this._configurationService, options.position));
            const notebookEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorPane);
            if (notebookEditor) {
                return notebookEditor.getId();
            }
            else {
                throw new Error(`Notebook Editor creation failure for document ${JSON.stringify(resource)}`);
            }
        }
        async $tryRevealRange(id, range, revealType) {
            const editor = this._notebookEditorService.getNotebookEditor(id);
            if (!editor) {
                return;
            }
            const notebookEditor = editor;
            if (!notebookEditor.hasModel()) {
                return;
            }
            if (range.start >= notebookEditor.getLength()) {
                return;
            }
            const cell = notebookEditor.cellAt(range.start);
            switch (revealType) {
                case extHost_protocol_1.NotebookEditorRevealType.Default:
                    return notebookEditor.revealCellRangeInView(range);
                case extHost_protocol_1.NotebookEditorRevealType.InCenter:
                    return notebookEditor.revealInCenter(cell);
                case extHost_protocol_1.NotebookEditorRevealType.InCenterIfOutsideViewport:
                    return notebookEditor.revealInCenterIfOutsideViewport(cell);
                case extHost_protocol_1.NotebookEditorRevealType.AtTop:
                    return notebookEditor.revealInViewAtTop(cell);
            }
        }
        $trySetSelections(id, ranges) {
            const editor = this._notebookEditorService.getNotebookEditor(id);
            if (!editor) {
                return;
            }
            editor.setSelections(ranges);
            if (ranges.length) {
                editor.setFocus({ start: ranges[0].start, end: ranges[0].start + 1 });
            }
        }
    };
    exports.MainThreadNotebookEditors = MainThreadNotebookEditors;
    exports.MainThreadNotebookEditors = MainThreadNotebookEditors = __decorate([
        __param(1, editorService_1.IEditorService),
        __param(2, notebookEditorService_1.INotebookEditorService),
        __param(3, editorGroupsService_1.IEditorGroupsService),
        __param(4, configuration_1.IConfigurationService)
    ], MainThreadNotebookEditors);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZE5vdGVib29rRWRpdG9ycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkTm90ZWJvb2tFZGl0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdCaEcsTUFBTSxrQkFBa0I7UUFFdkIsWUFDVSxNQUF1QixFQUN2QixXQUE0QjtZQUQ1QixXQUFNLEdBQU4sTUFBTSxDQUFpQjtZQUN2QixnQkFBVyxHQUFYLFdBQVcsQ0FBaUI7UUFDbEMsQ0FBQztRQUVMLE9BQU87WUFDTixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVCLENBQUM7S0FDRDtJQUVNLElBQU0seUJBQXlCLEdBQS9CLE1BQU0seUJBQXlCO1FBU3JDLFlBQ0MsY0FBK0IsRUFDZixjQUErQyxFQUN2QyxzQkFBK0QsRUFDakUsbUJBQTBELEVBQ3pELHFCQUE2RDtZQUhuRCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDdEIsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtZQUNoRCx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQ3hDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFacEUsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUdyQyx1QkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFBOEIsQ0FBQztZQVczRSxJQUFJLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsaUNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBRTdFLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM1RyxJQUFJLENB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