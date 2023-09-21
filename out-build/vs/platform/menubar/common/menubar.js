/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$o6b = exports.$n6b = exports.$m6b = exports.$l6b = void 0;
    function $l6b(menuItem) {
        return menuItem.submenu !== undefined;
    }
    exports.$l6b = $l6b;
    function $m6b(menuItem) {
        return menuItem.id === 'vscode.menubar.separator';
    }
    exports.$m6b = $m6b;
    function $n6b(menuItem) {
        return menuItem.uri !== undefined;
    }
    exports.$n6b = $n6b;
    function $o6b(menuItem) {
        return !$l6b(menuItem) && !$m6b(menuItem) && !$n6b(menuItem);
    }
    exports.$o6b = $o6b;
});
//# sourceMappingURL=menubar.js.map