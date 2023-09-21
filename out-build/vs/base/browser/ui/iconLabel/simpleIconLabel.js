/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels"], function (require, exports, dom_1, iconLabels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LR = void 0;
    class $LR {
        constructor(a) {
            this.a = a;
        }
        set text(text) {
            (0, dom_1.$_O)(this.a, ...(0, iconLabels_1.$xQ)(text ?? ''));
        }
        set title(title) {
            this.a.title = title;
        }
    }
    exports.$LR = $LR;
});
//# sourceMappingURL=simpleIconLabel.js.map