/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/editor/editorModel"], function (require, exports, editorModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffEditorModel = void 0;
    /**
     * The base editor model for the diff editor. It is made up of two editor models, the original version
     * and the modified version.
     */
    class DiffEditorModel extends editorModel_1.EditorModel {
        get originalModel() { return this._originalModel; }
        get modifiedModel() { return this._modifiedModel; }
        constructor(originalModel, modifiedModel) {
            super();
            this._originalModel = originalModel;
            this._modifiedModel = modifiedModel;
        }
        async resolve() {
            await Promise.all([
                this._originalModel?.resolve(),
                this._modifiedModel?.resolve()
            ]);
        }
        isResolved() {
            return !!(this.originalModel?.isResolved() && this.modifiedModel?.isResolved());
        }
        dispose() {
            // Do not propagate the dispose() call to the two models inside. We never created the two models
            // (original and modified) so we can not dispose them without sideeffects. Rather rely on the
            // models getting disposed when their related inputs get disposed from the diffEditorInput.
            super.dispose();
        }
    }
    exports.DiffEditorModel = DiffEditorModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvck1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbW1vbi9lZGl0b3IvZGlmZkVkaXRvck1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRzs7O09BR0c7SUFDSCxNQUFhLGVBQWdCLFNBQVEseUJBQVc7UUFHL0MsSUFBSSxhQUFhLEtBQStCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFHN0UsSUFBSSxhQUFhLEtBQStCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFFN0UsWUFBWSxhQUF1QyxFQUFFLGFBQXVDO1lBQzNGLEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7WUFDcEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7UUFDckMsQ0FBQztRQUVRLEtBQUssQ0FBQyxPQUFPO1lBQ3JCLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDakIsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFO2FBQzlCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUSxVQUFVO1lBQ2xCLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDakYsQ0FBQztRQUVRLE9BQU87WUFFZixnR0FBZ0c7WUFDaEcsNkZBQTZGO1lBQzdGLDJGQUEyRjtZQUUzRixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztLQUNEO0lBbENELDBDQWtDQyJ9