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
define(["require", "exports", "vs/workbench/common/editor", "vs/workbench/common/editor/editorModel", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, editor_1, editorModel_1, diffEditorInput_1, notebookEditorInput_1, editorService_1) {
    "use strict";
    var $pEb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pEb = void 0;
    class NotebookDiffEditorModel extends editorModel_1.$xA {
        constructor(original, modified) {
            super();
            this.original = original;
            this.modified = modified;
        }
    }
    let $pEb = class $pEb extends diffEditorInput_1.$3eb {
        static { $pEb_1 = this; }
        static create(instantiationService, resource, name, description, originalResource, viewType) {
            const original = notebookEditorInput_1.$zbb.create(instantiationService, originalResource, viewType);
            const modified = notebookEditorInput_1.$zbb.create(instantiationService, resource, viewType);
            return instantiationService.createInstance($pEb_1, name, description, original, modified, viewType);
        }
        static { this.ID = 'workbench.input.diffNotebookInput'; }
        get resource() {
            return this.modified.resource;
        }
        get editorId() {
            return this.viewType;
        }
        constructor(name, description, original, modified, viewType, editorService) {
            super(name, description, original, modified, undefined, editorService);
            this.original = original;
            this.modified = modified;
            this.viewType = viewType;
            this.D = null;
            this.F = null;
            this.G = undefined;
        }
        get typeId() {
            return $pEb_1.ID;
        }
        async resolve() {
            const [originalEditorModel, modifiedEditorModel] = await Promise.all([
                this.original.resolve(),
                this.modified.resolve(),
            ]);
            this.G?.dispose();
            // TODO@rebornix check how we restore the editor in text diff editor
            if (!modifiedEditorModel) {
                throw new Error(`Fail to resolve modified editor model for resource ${this.modified.resource} with notebookType ${this.viewType}`);
            }
            if (!originalEditorModel) {
                throw new Error(`Fail to resolve original editor model for resource ${this.original.resource} with notebookType ${this.viewType}`);
            }
            this.F = originalEditorModel;
            this.D = modifiedEditorModel;
            this.G = new NotebookDiffEditorModel(this.F, this.D);
            return this.G;
        }
        toUntyped() {
            const original = { resource: this.original.resource };
            const modified = { resource: this.resource };
            return {
                original,
                modified,
                primary: modified,
                secondary: original,
                options: {
                    override: this.viewType
                }
            };
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof $pEb_1) {
                return this.modified.matches(otherInput.modified)
                    && this.original.matches(otherInput.original)
                    && this.viewType === otherInput.viewType;
            }
            if ((0, editor_1.$OE)(otherInput)) {
                return this.modified.matches(otherInput.modified)
                    && this.original.matches(otherInput.original)
                    && this.editorId !== undefined
                    && (this.editorId === otherInput.options?.override || otherInput.options?.override === undefined);
            }
            return false;
        }
        dispose() {
            super.dispose();
            this.G?.dispose();
            this.G = undefined;
            this.original.dispose();
            this.modified.dispose();
            this.F = null;
            this.D = null;
        }
    };
    exports.$pEb = $pEb;
    exports.$pEb = $pEb = $pEb_1 = __decorate([
        __param(5, editorService_1.$9C)
    ], $pEb);
});
//# sourceMappingURL=notebookDiffEditorInput.js.map