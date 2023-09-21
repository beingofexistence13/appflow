/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Er = void 0;
    class $Er extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
        }
        async call(_, command, arg) {
            switch (command) {
                case 'updateTelemetryLevel': {
                    const { telemetryLevel } = arg;
                    return this.a.updateInjectedTelemetryLevel(telemetryLevel);
                }
                case 'logTelemetry': {
                    const { eventName, data } = arg;
                    // Logging is done directly to the appender instead of through the telemetry service
                    // as the data sent from the client has already had common properties added to it and
                    // has already been sent to the telemetry output channel
                    if (this.b) {
                        return this.b.log(eventName, data);
                    }
                    return Promise.resolve();
                }
                case 'flushTelemetry': {
                    if (this.b) {
                        return this.b.flush();
                    }
                    return Promise.resolve();
                }
                case 'ping': {
                    return;
                }
            }
            // Command we cannot handle so we throw an error
            throw new Error(`IPC Command ${command} not found`);
        }
        listen(_, event, arg) {
            throw new Error('Not supported');
        }
        /**
         * Disposing the channel also disables the telemetryService as there is
         * no longer a way to control it
         */
        dispose() {
            this.a.updateInjectedTelemetryLevel(0 /* TelemetryLevel.NONE */);
            super.dispose();
        }
    }
    exports.$Er = $Er;
});
//# sourceMappingURL=remoteTelemetryChannel.js.map