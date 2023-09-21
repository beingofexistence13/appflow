/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/marshalling", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInput"], function (require, exports, errors_1, marshalling_1, mergeEditorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mTb = void 0;
    class $mTb {
        canSerialize() {
            return true;
        }
        serialize(editor) {
            return JSON.stringify(this.toJSON(editor));
        }
        toJSON(editor) {
            return {
                base: editor.base,
                input1: editor.input1,
                input2: editor.input2,
                result: editor.result,
            };
        }
        deserialize(instantiationService, raw) {
            try {
                const data = (0, marshalling_1.$0g)(raw);
                return instantiationService.createInstance(mergeEditorInput_1.$hkb, data.base, new mergeEditorInput_1.$gkb(data.input1.uri, data.input1.title, data.input1.detail, data.input1.description), new mergeEditorInput_1.$gkb(data.input2.uri, data.input2.title, data.input2.detail, data.input2.description), data.result);
            }
            catch (err) {
                (0, errors_1.$Y)(err);
                return undefined;
            }
        }
    }
    exports.$mTb = $mTb;
});
//# sourceMappingURL=mergeEditorSerializer.js.map