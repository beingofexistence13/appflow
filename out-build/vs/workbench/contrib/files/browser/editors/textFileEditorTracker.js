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
define(["require", "exports", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/workbench/services/host/browser/host", "vs/workbench/services/editor/common/editorService", "vs/base/common/async", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/contrib/files/common/files", "vs/base/common/network", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/common/editor"], function (require, exports, textfiles_1, lifecycle_1, lifecycle_2, arrays_1, host_1, editorService_1, async_1, codeEditorService_1, filesConfigurationService_1, files_1, network_1, untitledTextEditorInput_1, workingCopyEditorService_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5Lb = void 0;
    let $5Lb = class $5Lb extends lifecycle_2.$kc {
        constructor(a, b, c, f, g, h, j) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            //#region Text File: Ensure every dirty text and untitled file is opened in an editor
            this.n = this.B(new async_1.$Ug(units => this.s(units), this.r()));
            this.m();
        }
        m() {
            // Ensure dirty text file and untitled models are always opened as editors
            this.B(this.b.files.onDidChangeDirty(model => this.n.work(model.resource)));
            this.B(this.b.files.onDidSaveError(model => this.n.work(model.resource)));
            this.B(this.b.untitled.onDidChangeDirty(model => this.n.work(model.resource)));
            // Update visible text file editors when focus is gained
            this.B(this.f.onDidChangeFocus(hasFocus => hasFocus ? this.u() : undefined));
            // Lifecycle
            this.B(this.c.onDidShutdown(() => this.dispose()));
        }
        r() {
            return 800; // encapsulated in a method for tests to override
        }
        s(resources) {
            this.t((0, arrays_1.$Kb)(resources.filter(resource => {
                if (!this.b.isDirty(resource)) {
                    return false; // resource must be dirty
                }
                const fileModel = this.b.files.get(resource);
                if (fileModel?.hasState(2 /* TextFileEditorModelState.PENDING_SAVE */)) {
                    return false; // resource must not be pending to save
                }
                if (resource.scheme !== network_1.Schemas.untitled && this.h.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */ && !fileModel?.hasState(5 /* TextFileEditorModelState.ERROR */)) {
                    // leave models auto saved after short delay unless
                    // the save resulted in an error and not for untitled
                    // that are not auto-saved anyway
                    return false;
                }
                if (this.a.isOpened({ resource, typeId: resource.scheme === network_1.Schemas.untitled ? untitledTextEditorInput_1.$Bvb.ID : files_1.$8db, editorId: editor_1.$HE.id })) {
                    return false; // model must not be opened already as file (fast check via editor type)
                }
                const model = fileModel ?? this.b.untitled.get(resource);
                if (model && this.j.findEditor(model)) {
                    return false; // model must not be opened already as file (slower check via working copy)
                }
                return true;
            }), resource => resource.toString()));
        }
        t(resources) {
            if (!resources.length) {
                return;
            }
            this.a.openEditors(resources.map(resource => ({
                resource,
                options: { inactive: true, pinned: true, preserveFocus: true }
            })));
        }
        //#endregion
        //#region Window Focus Change: Update visible code editors when focus is gained that have a known text file model
        u() {
            // the window got focus and we use this as a hint that files might have been changed outside
            // of this window. since file events can be unreliable, we queue a load for models that
            // are visible in any editor. since this is a fast operation in the case nothing has changed,
            // we tolerate the additional work.
            (0, arrays_1.$Kb)((0, arrays_1.$Fb)(this.g.listCodeEditors()
                .map(codeEditor => {
                const resource = codeEditor.getModel()?.uri;
                if (!resource) {
                    return undefined;
                }
                const model = this.b.files.get(resource);
                if (!model || model.isDirty() || !model.isResolved()) {
                    return undefined;
                }
                return model;
            })), model => model.resource.toString()).forEach(model => this.b.files.resolve(model.resource, { reload: { async: true } }));
        }
    };
    exports.$5Lb = $5Lb;
    exports.$5Lb = $5Lb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, textfiles_1.$JD),
        __param(2, lifecycle_1.$7y),
        __param(3, host_1.$VT),
        __param(4, codeEditorService_1.$nV),
        __param(5, filesConfigurationService_1.$yD),
        __param(6, workingCopyEditorService_1.$AD)
    ], $5Lb);
});
//# sourceMappingURL=textFileEditorTracker.js.map