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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/editor/browser/editorExtensions"], function (require, exports, lifecycle_1, platform_1, contributions_1, notebookCommon_1, editorService_1, notebookBrowser_1, editorExtensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let NotebookUndoRedoContribution = class NotebookUndoRedoContribution extends lifecycle_1.Disposable {
        constructor(_editorService) {
            super();
            this._editorService = _editorService;
            const PRIORITY = 105;
            this._register(editorExtensions_1.UndoCommand.addImplementation(PRIORITY, 'notebook-undo-redo', () => {
                const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(this._editorService.activeEditorPane);
                const viewModel = editor?.getViewModel();
                if (editor && editor.hasModel() && viewModel) {
                    return viewModel.undo().then(cellResources => {
                        if (cellResources?.length) {
                            for (let i = 0; i < editor.getLength(); i++) {
                                const cell = editor.cellAt(i);
                                if (cell.cellKind === notebookCommon_1.CellKind.Markup && cellResources.find(resource => resource.fragment === cell.model.uri.fragment)) {
                                    cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'undo');
                                }
                            }
                            editor?.setOptions({ cellOptions: { resource: cellResources[0] }, preserveFocus: true });
                        }
                    });
                }
                return false;
            }));
            this._register(editorExtensions_1.RedoCommand.addImplementation(PRIORITY, 'notebook-undo-redo', () => {
                const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(this._editorService.activeEditorPane);
                const viewModel = editor?.getViewModel();
                if (editor && editor.hasModel() && viewModel) {
                    return viewModel.redo().then(cellResources => {
                        if (cellResources?.length) {
                            for (let i = 0; i < editor.getLength(); i++) {
                                const cell = editor.cellAt(i);
                                if (cell.cellKind === notebookCommon_1.CellKind.Markup && cellResources.find(resource => resource.fragment === cell.model.uri.fragment)) {
                                    cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'redo');
                                }
                            }
                            editor?.setOptions({ cellOptions: { resource: cellResources[0] }, preserveFocus: true });
                        }
                    });
                }
                return false;
            }));
        }
    };
    NotebookUndoRedoContribution = __decorate([
        __param(0, editorService_1.IEditorService)
    ], NotebookUndoRedoContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookUndoRedoContribution, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tVbmRvUmVkby5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJpYi91bmRvUmVkby9ub3RlYm9va1VuZG9SZWRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBWWhHLElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTZCLFNBQVEsc0JBQVU7UUFFcEQsWUFBNkMsY0FBOEI7WUFDMUUsS0FBSyxFQUFFLENBQUM7WUFEb0MsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBRzFFLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQztZQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLDhCQUFXLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDakYsTUFBTSxNQUFNLEdBQUcsSUFBQSxpREFBK0IsRUFBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3JGLE1BQU0sU0FBUyxHQUFHLE1BQU0sRUFBRSxZQUFZLEVBQW1DLENBQUM7Z0JBQzFFLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxTQUFTLEVBQUU7b0JBQzdDLE9BQU8sU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTt3QkFDNUMsSUFBSSxhQUFhLEVBQUUsTUFBTSxFQUFFOzRCQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO2dDQUM1QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUM5QixJQUFJLElBQUksQ0FBQyxRQUFRLEtB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