/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$a6 = void 0;
    class $a6 {
        static { this.a = 51200; }
        constructor(editor, suggestModel) {
            this.b = new lifecycle_1.$jc();
            this.c = [];
            this.d = false;
            this.b.add(editor.onWillType(() => {
                if (this.d || !editor.hasModel()) {
                    return;
                }
                const selections = editor.getSelections();
                const selectionsLength = selections.length;
                // Check if it will overtype any selections
                let willOvertype = false;
                for (let i = 0; i < selectionsLength; i++) {
                    if (!selections[i].isEmpty()) {
                        willOvertype = true;
                        break;
                    }
                }
                if (!willOvertype) {
                    if (this.c.length !== 0) {
                        this.c.length = 0;
                    }
                    return;
                }
                this.c = [];
                const model = editor.getModel();
                for (let i = 0; i < selectionsLength; i++) {
                    const selection = selections[i];
                    // Check for overtyping capturer restrictions
                    if (model.getValueLengthInRange(selection) > $a6.a) {
                        return;
                    }
                    this.c[i] = { value: model.getValueInRange(selection), multiline: selection.startLineNumber !== selection.endLineNumber };
                }
            }));
            this.b.add(suggestModel.onDidTrigger(e => {
                this.d = true;
            }));
            this.b.add(suggestModel.onDidCancel(e => {
                this.d = false;
            }));
        }
        getLastOvertypedInfo(idx) {
            if (idx >= 0 && idx < this.c.length) {
                return this.c[idx];
            }
            return undefined;
        }
        dispose() {
            this.b.dispose();
        }
    }
    exports.$a6 = $a6;
});
//# sourceMappingURL=suggestOvertypingCapturer.js.map