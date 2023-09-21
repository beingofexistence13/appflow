/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$C6b = exports.$B6b = void 0;
    class $B6b {
        constructor(b) {
            this.b = b;
        }
        listen(_, event) {
            throw new Error(`Event not found: ${event}`);
        }
        call(_, command, { eventName, data }) {
            this.b.forEach(a => a.log(eventName, data));
            return Promise.resolve(null);
        }
    }
    exports.$B6b = $B6b;
    class $C6b {
        constructor(b) {
            this.b = b;
        }
        log(eventName, data) {
            this.b.call('log', { eventName, data })
                .then(undefined, err => `Failed to log telemetry: ${console.warn(err)}`);
            return Promise.resolve(null);
        }
        flush() {
            // TODO
            return Promise.resolve();
        }
    }
    exports.$C6b = $C6b;
});
//# sourceMappingURL=telemetryIpc.js.map