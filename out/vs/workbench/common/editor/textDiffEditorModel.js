/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/editor/diffEditorModel"], function (require, exports, diffEditorModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextDiffEditorModel = void 0;
    /**
     * The base text editor model for the diff editor. It is made up of two text editor models, the original version
     * and the modified version.
     */
    class TextDiffEditorModel extends diffEditorModel_1.DiffEditorModel {
        get originalModel() { return this._originalModel; }
        get modifiedModel() { return this._modifiedModel; }
        get textDiffEditorModel() { return this._textDiffEditorModel; }
        constructor(originalModel, modifiedModel) {
            super(originalModel, modifiedModel);
            this._textDiffEditorModel = undefined;
            this._originalModel = originalModel;
            this._modifiedModel = modifiedModel;
            this.updateTextDiffEditorModel();
        }
        async resolve() {
            await super.resolve();
            this.updateTextDiffEditorModel();
        }
        updateTextDiffEditorModel() {
            if (this.originalModel?.isResolved() && this.modifiedModel?.isResolved()) {
                // Create new
                if (!this._textDiffEditorModel) {
                    this._textDiffEditorModel = {
                        original: this.originalModel.textEditorModel,
                        modified: this.modifiedModel.textEditorModel
                    };
                }
                // Update existing
                else {
                    this._textDiffEditorModel.original = this.originalModel.textEditorModel;
                    this._textDiffEditorModel.modified = this.modifiedModel.textEditorModel;
                }
            }
        }
        isResolved() {
            return !!this._textDiffEditorModel;
        }
        isReadonly() {
            return !!this.modifiedModel && this.modifiedModel.isReadonly();
        }
        dispose() {
            // Free the diff editor model but do not propagate the dispose() call to the two models
            // inside. We never created the two models (original and modified) so we can not dispose
            // them without sideeffects. Rather rely on the models getting disposed when their related
            // inputs get disposed from the diffEditorInput.
            this._textDiffEditorModel = undefined;
            super.dispose();
        }
    }
    exports.TextDiffEditorModel = TextDiffEditorModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dERpZmZFZGl0b3JNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb21tb24vZWRpdG9yL3RleHREaWZmRWRpdG9yTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHOzs7T0FHRztJQUNILE1BQWEsbUJBQW9CLFNBQVEsaUNBQWU7UUFHdkQsSUFBYSxhQUFhLEtBQXNDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFHN0YsSUFBYSxhQUFhLEtBQXNDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFHN0YsSUFBSSxtQkFBbUIsS0FBbUMsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1FBRTdGLFlBQVksYUFBa0MsRUFBRSxhQUFrQztZQUNqRixLQUFLLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBSjdCLHlCQUFvQixHQUFpQyxTQUFTLENBQUM7WUFNdEUsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7WUFDcEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7WUFFcEMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFDbEMsQ0FBQztRQUVRLEtBQUssQ0FBQyxPQUFPO1lBQ3JCLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRXRCLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBQ2xDLENBQUM7UUFFTyx5QkFBeUI7WUFDaEMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLEVBQUU7Z0JBRXpFLGFBQWE7Z0JBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtvQkFDL0IsSUFBSSxDQUFDLG9CQUFvQixHQUFHO3dCQUMzQixRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlO3dCQUM1QyxRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlO3FCQUM1QyxDQUFDO2lCQUNGO2dCQUVELGtCQUFrQjtxQkFDYjtvQkFDSixJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDO29CQUN4RSxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDO2lCQUN4RTthQUNEO1FBQ0YsQ0FBQztRQUVRLFVBQVU7WUFDbEIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDO1FBQ3BDLENBQUM7UUFFRCxVQUFVO1lBQ1QsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2hFLENBQUM7UUFFUSxPQUFPO1lBRWYsdUZBQXVGO1lBQ3ZGLHdGQUF3RjtZQUN4RiwwRkFBMEY7WUFDMUYsZ0RBQWdEO1lBQ2hELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUM7WUFFdEMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7S0FDRDtJQS9ERCxrREErREMifQ==