/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/editor/editorModel"], function (require, exports, editorModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1eb = void 0;
    /**
     * The base editor model for the diff editor. It is made up of two editor models, the original version
     * and the modified version.
     */
    class $1eb extends editorModel_1.$xA {
        get originalModel() { return this.a; }
        get modifiedModel() { return this.b; }
        constructor(originalModel, modifiedModel) {
            super();
            this.a = originalModel;
            this.b = modifiedModel;
        }
        async resolve() {
            await Promise.all([
                this.a?.resolve(),
                this.b?.resolve()
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
    exports.$1eb = $1eb;
});
//# sourceMappingURL=diffEditorModel.js.map