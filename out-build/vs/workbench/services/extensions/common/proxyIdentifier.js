/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dA = exports.$cA = exports.$bA = exports.$aA = void 0;
    class $aA {
        static { this.count = 0; }
        constructor(sid) {
            this._proxyIdentifierBrand = undefined;
            this.sid = sid;
            this.nid = (++$aA.count);
        }
    }
    exports.$aA = $aA;
    const identifiers = [];
    function $bA(identifier) {
        const result = new $aA(identifier);
        identifiers[result.nid] = result;
        return result;
    }
    exports.$bA = $bA;
    function $cA(nid) {
        return identifiers[nid].sid;
    }
    exports.$cA = $cA;
    /**
     * Marks the object as containing buffers that should be serialized more efficiently.
     */
    class $dA {
        constructor(value) {
            this.value = value;
        }
    }
    exports.$dA = $dA;
});
//# sourceMappingURL=proxyIdentifier.js.map