/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TelemetryAppenderClient = exports.TelemetryAppenderChannel = void 0;
    class TelemetryAppenderChannel {
        constructor(appenders) {
            this.appenders = appenders;
        }
        listen(_, event) {
            throw new Error(`Event not found: ${event}`);
        }
        call(_, command, { eventName, data }) {
            this.appenders.forEach(a => a.log(eventName, data));
            return Promise.resolve(null);
        }
    }
    exports.TelemetryAppenderChannel = TelemetryAppenderChannel;
    class TelemetryAppenderClient {
        constructor(channel) {
            this.channel = channel;
        }
        log(eventName, data) {
            this.channel.call('log', { eventName, data })
                .then(undefined, err => `Failed to log telemetry: ${console.warn(err)}`);
            return Promise.resolve(null);
        }
        flush() {
            // TODO
            return Promise.resolve();
        }
    }
    exports.TelemetryAppenderClient = TelemetryAppenderClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5SXBjLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVsZW1ldHJ5L2NvbW1vbi90ZWxlbWV0cnlJcGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLE1BQWEsd0JBQXdCO1FBRXBDLFlBQW9CLFNBQStCO1lBQS9CLGNBQVMsR0FBVCxTQUFTLENBQXNCO1FBQUksQ0FBQztRQUV4RCxNQUFNLENBQUksQ0FBVSxFQUFFLEtBQWE7WUFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRUQsSUFBSSxDQUFDLENBQVUsRUFBRSxPQUFlLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFpQjtZQUNuRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlCLENBQUM7S0FDRDtJQVpELDREQVlDO0lBRUQsTUFBYSx1QkFBdUI7UUFFbkMsWUFBb0IsT0FBaUI7WUFBakIsWUFBTyxHQUFQLE9BQU8sQ0FBVTtRQUFJLENBQUM7UUFFMUMsR0FBRyxDQUFDLFNBQWlCLEVBQUUsSUFBVTtZQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7aUJBQzNDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyw0QkFBNEIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFMUUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFRCxLQUFLO1lBQ0osT0FBTztZQUNQLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFCLENBQUM7S0FDRDtJQWZELDBEQWVDIn0=