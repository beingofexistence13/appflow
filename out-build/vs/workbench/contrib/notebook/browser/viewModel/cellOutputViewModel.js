/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, event_1, lifecycle_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Knb = void 0;
    let handle = 0;
    class $Knb extends lifecycle_1.$kc {
        get model() {
            return this.c;
        }
        get pickedMimeType() {
            return this.b;
        }
        set pickedMimeType(value) {
            this.b = value;
        }
        constructor(cellViewModel, c, f) {
            super();
            this.cellViewModel = cellViewModel;
            this.c = c;
            this.f = f;
            this.a = this.B(new event_1.$fd());
            this.onDidResetRenderer = this.a.event;
            this.outputHandle = handle++;
        }
        hasMultiMimeType() {
            if (this.c.outputs.length < 2) {
                return false;
            }
            const firstMimeType = this.c.outputs[0].mime;
            return this.c.outputs.some(output => output.mime !== firstMimeType);
        }
        resolveMimeTypes(textModel, kernelProvides) {
            const mimeTypes = this.f.getOutputMimeTypeInfo(textModel, kernelProvides, this.model);
            const index = mimeTypes.findIndex(mimeType => mimeType.rendererId !== notebookCommon_1.$ZH && mimeType.isTrusted);
            return [mimeTypes, Math.max(index, 0)];
        }
        resetRenderer() {
            // reset the output renderer
            this.b = undefined;
            this.model.bumpVersion();
            this.a.fire();
        }
        toRawJSON() {
            return {
                outputs: this.c.outputs,
                // TODO@rebronix, no id, right?
            };
        }
    }
    exports.$Knb = $Knb;
});
//# sourceMappingURL=cellOutputViewModel.js.map