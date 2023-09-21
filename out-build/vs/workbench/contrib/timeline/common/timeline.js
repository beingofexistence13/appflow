/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation"], function (require, exports, extensions_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ZI = exports.$YI = exports.$XI = void 0;
    function $XI(extension, source) {
        return `${typeof extension === 'string' ? extension : extensions_1.$Vl.toKey(extension)}|${source}`;
    }
    exports.$XI = $XI;
    exports.$YI = 'timeline';
    const TIMELINE_SERVICE_ID = 'timeline';
    exports.$ZI = (0, instantiation_1.$Bh)(TIMELINE_SERVICE_ID);
});
//# sourceMappingURL=timeline.js.map