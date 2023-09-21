/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$m7 = exports.$l7 = void 0;
    class $l7 {
        constructor() {
            this.a = new Map();
        }
        removeDragOperationTransfer(uuid) {
            if ((uuid && this.a.has(uuid))) {
                const operation = this.a.get(uuid);
                this.a.delete(uuid);
                return operation;
            }
            return undefined;
        }
        addDragOperationTransfer(uuid, transferPromise) {
            this.a.set(uuid, transferPromise);
        }
    }
    exports.$l7 = $l7;
    class $m7 {
        constructor(identifier) {
            this.identifier = identifier;
        }
    }
    exports.$m7 = $m7;
});
//# sourceMappingURL=treeViewsDnd.js.map