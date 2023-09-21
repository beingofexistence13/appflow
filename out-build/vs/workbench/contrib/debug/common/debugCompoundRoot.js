/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gF = void 0;
    class $gF {
        constructor() {
            this.a = false;
            this.b = new event_1.$fd();
            this.onDidSessionStop = this.b.event;
        }
        sessionStopped() {
            if (!this.a) { // avoid sending extranous terminate events
                this.a = true;
                this.b.fire();
            }
        }
    }
    exports.$gF = $gF;
});
//# sourceMappingURL=debugCompoundRoot.js.map