/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_2 = exports.$$2 = void 0;
    const editorFeatures = [];
    /**
     * Registers an editor feature. Editor features will be instantiated only once, as soon as
     * the first code editor is instantiated.
     */
    function $$2(ctor) {
        editorFeatures.push(ctor);
    }
    exports.$$2 = $$2;
    function $_2() {
        return editorFeatures.slice(0);
    }
    exports.$_2 = $_2;
});
//# sourceMappingURL=editorFeatures.js.map