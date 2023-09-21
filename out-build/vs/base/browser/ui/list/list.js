/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dQ = exports.$cQ = exports.$bQ = exports.ListDragOverEffect = void 0;
    var ListDragOverEffect;
    (function (ListDragOverEffect) {
        ListDragOverEffect[ListDragOverEffect["Copy"] = 0] = "Copy";
        ListDragOverEffect[ListDragOverEffect["Move"] = 1] = "Move";
    })(ListDragOverEffect || (exports.ListDragOverEffect = ListDragOverEffect = {}));
    exports.$bQ = {
        reject() { return { accept: false }; },
        accept() { return { accept: true }; },
    };
    class $cQ extends Error {
        constructor(user, message) {
            super(`ListError [${user}] ${message}`);
        }
    }
    exports.$cQ = $cQ;
    class $dQ {
        constructor() {
            this.c = new WeakMap();
        }
        getHeight(element) {
            return this.c.get(element) ?? this.d(element);
        }
        setDynamicHeight(element, height) {
            if (height > 0) {
                this.c.set(element, height);
            }
        }
    }
    exports.$dQ = $dQ;
});
//# sourceMappingURL=list.js.map