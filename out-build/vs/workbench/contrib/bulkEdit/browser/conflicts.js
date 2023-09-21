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
    exports.$eMb = void 0;
    let $eMb = class $eMb {
        constructor(edits, fileService, modelService, logService) {
            this.a = new map_1.$zi();
            this.b = new lifecycle_1.$jc();
            this.c = new event_1.$fd();
            this.onDidConflict = this.c.event;
            const _workspaceEditResources = new map_1.$zi();
            for (const edit of edits) {
                if (edit instanceof bulkEditService_1.$p1) {
                    _workspaceEditResources.set(edit.resource, true);
                    if (typeof edit.versionId === 'number') {
                        const model = modelService.getModel(edit.resource);
                        if (model && model.getVersionId() !== edit.versionId) {
                            this.a.set(edit.resource, true);
                            this.c.fire(this);
                        }
                    }
                }
                else if (edit instanceof bulkEditService_1.$q1) {
                    if (edit.newResource) {
                        _workspaceEditResources.set(edit.newResource, true);
                    }
                    else if (edit.oldResource) {
                        _workspaceEditResources.set(edit.oldResource, true);
                    }
                }
                else if (edit instanceof bulkCellEdits_1.$3bb) {
                    _workspaceEditResources.set(edit.resource, true);
                }
                else {
                    logService.warn('UNKNOWN edit type', edit);
                }
            }
            // listen to file changes
            this.b.add(fileService.onDidFilesChange(e => {
                for (const uri of _workspaceEditResources.keys()) {
                    // conflict happens when a file that we are working
                    // on changes on disk. ignore changes for which a model
                    // exists because we have a better check for models
                    if (!modelService.getModel(uri) && e.contains(uri)) {
                        this.a.set(uri, true);
                        this.c.fire(this);
                        break;
                    }
                }
            }));
            // listen to model changes...?
            const onDidChangeModel = (model) => {
                // conflict
                if (_workspaceEditResources.has(model.uri)) {
                    this.a.set(model.uri, true);
                    this.c.fire(this);
                }
            };
            for (const model of modelService.getModels()) {
                this.b.add(model.onDidChangeContent(() => onDidChangeModel(model)));
            }
        }
        dispose() {
            this.b.dispose();
            this.c.dispose();
        }
        list() {
            return [...this.a.keys()];
        }
        hasConflicts() {
            return this.a.size > 0;
        }
    };
    exports.$eMb = $eMb;
    exports.$eMb = $eMb = __decorate([
        __param(1, files_1.$6j),
        __param(2, model_1.$yA),
        __param(3, log_1.$5i)
    ], $eMb);
});
//# sourceMappingURL=conflicts.js.map