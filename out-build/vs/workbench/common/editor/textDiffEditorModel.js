/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/editor/diffEditorModel"], function (require, exports, diffEditorModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2eb = void 0;
    /**
     * The base text editor model for the diff editor. It is made up of two text editor models, the original version
     * and the modified version.
     */
    class $2eb extends diffEditorModel_1.$1eb {
        get originalModel() { return this.a; }
        get modifiedModel() { return this.b; }
        get textDiffEditorModel() { return this.m; }
        constructor(originalModel, modifiedModel) {
            super(originalModel, modifiedModel);
            this.m = undefined;
            this.a = originalModel;
            this.b = modifiedModel;
            this.n();
        }
        async resolve() {
            await super.resolve();
            this.n();
        }
        n() {
            if (this.originalModel?.isResolved() && this.modifiedModel?.isResolved()) {
                // Create new
                if (!this.m) {
                    this.m = {
                        original: this.originalModel.textEditorModel,
                        modified: this.modifiedModel.textEditorModel
                    };
                }
                // Update existing
                else {
                    this.m.original = this.originalModel.textEditorModel;
                    this.m.modified = this.modifiedModel.textEditorModel;
                }
            }
        }
        isResolved() {
            return !!this.m;
        }
        isReadonly() {
            return !!this.modifiedModel && this.modifiedModel.isReadonly();
        }
        dispose() {
            // Free the diff editor model but do not propagate the dispose() call to the two models
            // inside. We never created the two models (original and modified) so we can not dispose
            // them without sideeffects. Rather rely on the models getting disposed when their related
            // inputs get disposed from the diffEditorInput.
            this.m = undefined;
            super.dispose();
        }
    }
    exports.$2eb = $2eb;
});
//# sourceMappingURL=textDiffEditorModel.js.map