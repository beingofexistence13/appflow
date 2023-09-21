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
    var NotebookDiffEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookDiffEditorInput = void 0;
    class NotebookDiffEditorModel extends editorModel_1.EditorModel {
        constructor(original, modified) {
            super();
            this.original = original;
            this.modified = modified;
        }
    }
    let NotebookDiffEditorInput = class NotebookDiffEditorInput extends diffEditorInput_1.DiffEditorInput {
        static { NotebookDiffEditorInput_1 = this; }
        static create(instantiationService, resource, name, description, originalResource, viewType) {
            const original = notebookEditorInput_1.NotebookEditorInput.create(instantiationService, originalResource, viewType);
            const modified = notebookEditorInput_1.NotebookEditorInput.create(instantiationService, resource, viewType);
            return instantiationService.createInstance(NotebookDiffEditorInput_1, name, description, original, modified, viewType);
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
            this._modifiedTextModel = null;
            this._originalTextModel = null;
            this._cachedModel = undefined;
        }
        get typeId() {
            return NotebookDiffEditorInput_1.ID;
        }
        async resolve() {
            const [originalEditorModel, modifiedEditorModel] = await Promise.all([
                this.original.resolve(),
                this.modified.resolve(),
            ]);
            this._cachedModel?.dispose();
            // TODO@rebornix check how we restore the editor in text diff editor
            if (!modifiedEditorModel) {
                throw new Error(`Fail to resolve modified editor model for resource ${this.modified.resource} with notebookType ${this.viewType}`);
            }
            if (!originalEditorModel) {
                throw new Error(`Fail to resolve original editor model for resource ${this.original.resource} with notebookType ${this.viewType}`);
            }
            this._originalTextModel = originalEditorModel;
            this._modifiedTextModel = modifiedEditorModel;
            this._cachedModel = new NotebookDiffEditorModel(this._originalTextModel, this._modifiedTextModel);
            return this._cachedModel;
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
            if (otherInput instanceof NotebookDiffEditorInput_1) {
                return this.modified.matches(otherInput.modified)
                    && this.original.matches(otherInput.original)
                    && this.viewType === otherInput.viewType;
            }
            if ((0, editor_1.isResourceDiffEditorInput)(otherInput)) {
                return this.modified.matches(otherInput.modified)
                    && this.original.matches(otherInput.original)
                    && this.editorId !== undefined
                    && (this.editorId === otherInput.options?.override || otherInput.options?.override === undefined);
            }
            return false;
        }
        dispose() {
            super.dispose();
            this._cachedModel?.dispose();
            this._cachedModel = undefined;
            this.original.dispose();
            this.modified.dispose();
            this._originalTextModel = null;
            this._modifiedTextModel = null;
        }
    };
    exports.NotebookDiffEditorInput = NotebookDiffEditorInput;
    exports.NotebookDiffEditorInput = NotebookDiffEditorInput = NotebookDiffEditorInput_1 = __decorate([
        __param(5, editorService_1.IEditorService)
    ], NotebookDiffEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tEaWZmRWRpdG9ySW5wdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9jb21tb24vbm90ZWJvb2tEaWZmRWRpdG9ySW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQVloRyxNQUFNLHVCQUF3QixTQUFRLHlCQUFXO1FBQ2hELFlBQ1UsUUFBc0MsRUFDdEMsUUFBc0M7WUFFL0MsS0FBSyxFQUFFLENBQUM7WUFIQyxhQUFRLEdBQVIsUUFBUSxDQUE4QjtZQUN0QyxhQUFRLEdBQVIsUUFBUSxDQUE4QjtRQUdoRCxDQUFDO0tBQ0Q7SUFFTSxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLGlDQUFlOztRQUMzRCxNQUFNLENBQUMsTUFBTSxDQUFDLG9CQUEyQyxFQUFFLFFBQWEsRUFBRSxJQUF3QixFQUFFLFdBQStCLEVBQUUsZ0JBQXFCLEVBQUUsUUFBZ0I7WUFDM0ssTUFBTSxRQUFRLEdBQUcseUNBQW1CLENBQUMsTUFBTSxDQUFDLG9CQUFvQixFQUFFLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzlGLE1BQU0sUUFBUSxHQUFHLHlDQUFtQixDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDdEYsT0FBTyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUJBQXVCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3RILENBQUM7aUJBRXdCLE9BQUUsR0FBVyxtQ0FBbUMsQUFBOUMsQ0FBK0M7UUFLMUUsSUFBYSxRQUFRO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7UUFDL0IsQ0FBQztRQUVELElBQWEsUUFBUTtZ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