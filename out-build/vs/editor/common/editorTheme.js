/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PU = void 0;
    class $PU {
        get type() {
            return this.a.type;
        }
        get value() {
            return this.a;
        }
        constructor(theme) {
            this.a = theme;
        }
        update(theme) {
            this.a = theme;
        }
        getColor(color) {
            return this.a.getColor(color);
        }
    }
    exports.$PU = $PU;
});
//# sourceMappingURL=editorTheme.js.map