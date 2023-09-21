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
    let NotebookUndoRedoContribution = class NotebookUndoRedoContribution extends lifecycle_1.$kc {
        constructor(a) {
            super();
            this.a = a;
            const PRIORITY = 105;
            this.B(editorExtensions_1.$CV.addImplementation(PRIORITY, 'notebook-undo-redo', () => {
                const editor = (0, notebookBrowser_1.$Zbb)(this.a.activeEditorPane);
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
            this.B(editorExtensions_1.$DV.addImplementation(PRIORITY, 'notebook-undo-redo', () => {
                const editor = (0, notebookBrowser_1.$Zbb)(this.a.activeEditorPane);
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
        __param(0, editorService_1.$9C)
    ], NotebookUndoRedoContribution);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookUndoRedoContribution, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=notebookUndoRedo.js.map