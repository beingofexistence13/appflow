/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cb = void 0;
    class $cb {
        constructor() {
            this.elements = [];
            this.a = new event_1.$fd();
            this.onDidSplice = this.a.event;
        }
        splice(start, deleteCount, toInsert = []) {
            this.elements.splice(start, deleteCount, ...toInsert);
            this.a.fire({ start, deleteCount, toInsert });
        }
    }
    exports.$cb = $cb;
});
//# sourceMappingURL=sequence.js.map