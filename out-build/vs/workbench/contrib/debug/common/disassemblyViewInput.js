/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/editor/editorInput", "vs/nls!vs/workbench/contrib/debug/common/disassemblyViewInput"], function (require, exports, editorInput_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GFb = void 0;
    class $GFb extends editorInput_1.$tA {
        constructor() {
            super(...arguments);
            this.resource = undefined;
        }
        static { this.ID = 'debug.disassemblyView.input'; }
        get typeId() {
            return $GFb.ID;
        }
        static get instance() {
            if (!$GFb._instance || $GFb._instance.isDisposed()) {
                $GFb._instance = new $GFb();
            }
            return $GFb._instance;
        }
        getName() {
            return (0, nls_1.localize)(0, null);
        }
        matches(other) {
            return other instanceof $GFb;
        }
    }
    exports.$GFb = $GFb;
});
//# sourceMappingURL=disassemblyViewInput.js.map