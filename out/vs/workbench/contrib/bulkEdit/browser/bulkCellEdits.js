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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/workbench/services/editor/common/editorService"], function (require, exports, arrays_1, strings_1, types_1, uri_1, bulkEditService_1, notebookBrowser_1, notebookCommon_1, notebookEditorModelResolverService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BulkCellEdits = exports.ResourceNotebookCellEdit = void 0;
    class ResourceNotebookCellEdit extends bulkEditService_1.ResourceEdit {
        static is(candidate) {
            if (candidate instanceof ResourceNotebookCellEdit) {
                return true;
            }
            return uri_1.URI.isUri(candidate.resource)
                && (0, types_1.isObject)(candidate.cellEdit);
        }
        static lift(edit) {
            if (edit instanceof ResourceNotebookCellEdit) {
                return edit;
            }
            return new ResourceNotebookCellEdit(edit.resource, edit.cellEdit, edit.notebookVersionId, edit.metadata);
        }
        constructor(resource, cellEdit, notebookVersionId = undefined, metadata) {
            super(metadata);
            this.resource = resource;
            this.cellEdit = cellEdit;
            this.notebookVersionId = notebookVersionId;
        }
    }
    exports.ResourceNotebookCellEdit = ResourceNotebookCellEdit;
    let BulkCellEdits = class BulkCellEdits {
        constructor(_undoRedoGroup, undoRedoSource, _progress, _token, _edits, _editorService, _notebookModelService) {
            this._undoRedoGroup = _undoRedoGroup;
            this._progress = _progress;
            this._token = _token;
            this._edits = _edits;
            this._editorService = _editorService;
            this._notebookModelService = _notebookModelService;
            this._edits = this._edits.map(e => {
                if (e.resource.scheme === notebookCommon_1.CellUri.scheme) {
                    const uri = notebookCommon_1.CellUri.parse(e.resource)?.notebook;
                    if (!uri) {
                        throw new Error(`Invalid notebook URI: ${e.resource}`);
                    }
                    return new ResourceNotebookCellEdit(uri, e.cellEdit, e.notebookVersionId, e.metadata);
                }
                else {
                    return e;
                }
            });
        }
        async apply() {
            const resources = [];
            const editsByNotebook = (0, arrays_1.groupBy)(this._edits, (a, b) => (0, strings_1.compare)(a.resource.toString(), b.resource.toString()));
            for (const group of editsByNotebook) {
                if (this._token.isCancellationRequested) {
                    break;
                }
                const [first] = group;
                const ref = await this._notebookModelService.resolve(first.resource);
                // check state
                if (typeof first.notebookVersionId === 'number' && ref.object.notebook.versionId !== first.notebookVersionId) {
                    ref.dispose();
                    throw new Error(`Notebook '${first.resource}' has changed in the meantime`);
                }
                // apply edits
                const edits = group.map(entry => entry.cellEdit);
                const computeUndo = !ref.object.isReadonly();
                const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(this._editorService.activeEditorPane);
                const initialSelectionState = editor?.textModel?.uri.toString() === ref.object.notebook.uri.toString() ? {
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: editor.getFocus(),
                    selections: editor.getSelections()
                } : undefined;
                ref.object.notebook.applyEdits(edits, true, initialSelectionState, () => undefined, this._undoRedoGroup, computeUndo);
                ref.dispose();
                this._progress.report(undefined);
                resources.push(first.resource);
            }
            return resources;
        }
    };
    exports.BulkCellEdits = BulkCellEdits;
    exports.BulkCellEdits = BulkCellEdits = __decorate([
        __param(5, editorService_1.IEditorService),
        __param(6, notebookEditorModelResolverService_1.INotebookEditorModelResolverService)
    ], BulkCellEdits);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVsa0NlbGxFZGl0cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2J1bGtFZGl0L2Jyb3dzZXIvYnVsa0NlbGxFZGl0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQmhHLE1BQWEsd0JBQXlCLFNBQVEsOEJBQVk7UUFFekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFjO1lBQ3ZCLElBQUksU0FBUyxZQUFZLHdCQUF3QixFQUFFO2dCQUNsRCxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxTQUFHLENBQUMsS0FBSyxDQUE4QixTQUFVLENBQUMsUUFBUSxDQUFDO21CQUM5RCxJQUFBLGdCQUFRLEVBQThCLFNBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFnQztZQUMzQyxJQUFJLElBQUksWUFBWSx3QkFBd0IsRUFBRTtnQkFDN0MsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELE9BQU8sSUFBSSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxRyxDQUFDO1FBRUQsWUFDVSxRQUFhLEVBQ2IsUUFBNkUsRUFDN0Usb0JBQXdDLFNBQVMsRUFDMUQsUUFBZ0M7WUFFaEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBTFAsYUFBUSxHQUFSLFFBQVEsQ0FBSztZQUNiLGFBQVEsR0FBUixRQUFRLENBQXFFO1lBQzdFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBZ0M7UUFJM0QsQ0FBQztLQUNEO0lBekJELDREQXlCQztJQUVNLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWE7UUFFekIsWUFDa0IsY0FBNkIs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