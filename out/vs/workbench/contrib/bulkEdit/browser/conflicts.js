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
define(["require", "exports", "vs/platform/files/common/files", "vs/editor/common/services/model", "vs/base/common/map", "vs/base/common/lifecycle", "vs/base/common/event", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/platform/log/common/log"], function (require, exports, files_1, model_1, map_1, lifecycle_1, event_1, bulkEditService_1, bulkCellEdits_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConflictDetector = void 0;
    let ConflictDetector = class ConflictDetector {
        constructor(edits, fileService, modelService, logService) {
            this._conflicts = new map_1.ResourceMap();
            this._disposables = new lifecycle_1.DisposableStore();
            this._onDidConflict = new event_1.Emitter();
            this.onDidConflict = this._onDidConflict.event;
            const _workspaceEditResources = new map_1.ResourceMap();
            for (const edit of edits) {
                if (edit instanceof bulkEditService_1.ResourceTextEdit) {
                    _workspaceEditResources.set(edit.resource, true);
                    if (typeof edit.versionId === 'number') {
                        const model = modelService.getModel(edit.resource);
                        if (model && model.getVersionId() !== edit.versionId) {
                            this._conflicts.set(edit.resource, true);
                            this._onDidConflict.fire(this);
                        }
                    }
                }
                else if (edit instanceof bulkEditService_1.ResourceFileEdit) {
                    if (edit.newResource) {
                        _workspaceEditResources.set(edit.newResource, true);
                    }
                    else if (edit.oldResource) {
                        _workspaceEditResources.set(edit.oldResource, true);
                    }
                }
                else if (edit instanceof bulkCellEdits_1.ResourceNotebookCellEdit) {
                    _workspaceEditResources.set(edit.resource, true);
                }
                else {
                    logService.warn('UNKNOWN edit type', edit);
                }
            }
            // listen to file changes
            this._disposables.add(fileService.onDidFilesChange(e => {
                for (const uri of _workspaceEditResources.keys()) {
                    // conflict happens when a file that we are working
                    // on changes on disk. ignore changes for which a model
                    // exists because we have a better check for models
                    if (!modelService.getModel(uri) && e.contains(uri)) {
                        this._conflicts.set(uri, true);
                        this._onDidConflict.fire(this);
                        break;
                    }
                }
            }));
            // listen to model changes...?
            const onDidChangeModel = (model) => {
                // conflict
                if (_workspaceEditResources.has(model.uri)) {
                    this._conflicts.set(model.uri, true);
                    this._onDidConflict.fire(this);
                }
            };
            for (const model of modelService.getModels()) {
                this._disposables.add(model.onDidChangeContent(() => onDidChangeModel(model)));
            }
        }
        dispose() {
            this._disposables.dispose();
            this._onDidConflict.dispose();
        }
        list() {
            return [...this._conflicts.keys()];
        }
        hasConflicts() {
            return this._conflicts.size > 0;
        }
    };
    exports.ConflictDetector = ConflictDetector;
    exports.ConflictDetector = ConflictDetector = __decorate([
        __param(1, files_1.IFileService),
        __param(2, model_1.IModelService),
        __param(3, log_1.ILogService)
    ], ConflictDetector);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmxpY3RzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvYnVsa0VkaXQvYnJvd3Nlci9jb25mbGljdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYXpGLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWdCO1FBUTVCLFlBQ0MsS0FBcUIsRUFDUCxXQUF5QixFQUN4QixZQUEyQixFQUM3QixVQUF1QjtZQVZwQixlQUFVLEdBQUcsSUFBSSxpQkFBVyxFQUFXLENBQUM7WUFDeEMsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUVyQyxtQkFBYyxHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFDN0Msa0JBQWEsR0FBZ0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUM7WUFTL0QsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLGlCQUFXLEVBQVcsQ0FBQztZQUUzRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDekIsSUFBSSxJQUFJLFlBQVksa0NBQWdCLEVBQUU7b0JBQ3JDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNqRCxJQUFJLE9BQU8sSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLEVBQUU7d0JBQ3ZDLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUNuRCxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBSSxDQUFDLFNBQVMsRUFBRTs0QkFDckQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQzs0QkFDekMsSUFBSSxDQUFDLGNBQWMsQ0FB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