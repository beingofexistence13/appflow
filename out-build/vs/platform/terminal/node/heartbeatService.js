/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/terminal/common/terminal"], function (require, exports, event_1, lifecycle_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$P$b = void 0;
    class $P$b extends lifecycle_1.$kc {
        constructor() {
            super();
            this.a = this.B(new event_1.$fd());
            this.onBeat = this.a.event;
            const interval = setInterval(() => {
                this.a.fire();
            }, terminal_1.HeartbeatConstants.BeatInterval);
            this.B((0, lifecycle_1.$ic)(() => clearInterval(interval)));
        }
    }
    exports.$P$b = $P$b;
});
//# sourceMappingURL=heartbeatService.js.map