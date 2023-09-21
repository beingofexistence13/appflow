/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServerTelemetryChannel = void 0;
    class ServerTelemetryChannel extends lifecycle_1.Disposable {
        constructor(telemetryService, telemetryAppender) {
            super();
            this.telemetryService = telemetryService;
            this.telemetryAppender = telemetryAppender;
        }
        async call(_, command, arg) {
            switch (command) {
                case 'updateTelemetryLevel': {
                    const { telemetryLevel } = arg;
                    return this.telemetryService.updateInjectedTelemetryLevel(telemetryLevel);
                }
                case 'logTelemetry': {
                    const { eventName, data } = arg;
                    // Logging is done directly to the appender instead of through the telemetry service
                    // as the data sent from the client has already had common properties added to it and
                    // has already been sent to the telemetry output channel
                    if (this.telemetryAppender) {
                        return this.telemetryAppender.log(eventName, data);
                    }
                    return Promise.resolve();
                }
                case 'flushTelemetry': {
                    if (this.telemetryAppender) {
                        return this.telemetryAppender.flush();
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
            this.telemetryService.updateInjectedTelemetryLevel(0 /* TelemetryLevel.NONE */);
            super.dispose();
        }
    }
    exports.ServerTelemetryChannel = ServerTelemetryChannel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVGVsZW1ldHJ5Q2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3RlbGVtZXRyeS9jb21tb24vcmVtb3RlVGVsZW1ldHJ5Q2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBYSxzQkFBdUIsU0FBUSxzQkFBVTtRQUNyRCxZQUNrQixnQkFBeUMsRUFDekMsaUJBQTRDO1lBRTdELEtBQUssRUFBRSxDQUFDO1lBSFMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUF5QjtZQUN6QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQTJCO1FBRzlELENBQUM7UUFHRCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQU0sRUFBRSxPQUFlLEVBQUUsR0FBUztZQUM1QyxRQUFRLE9BQU8sRUFBRTtnQkFDaEIsS0FBSyxzQkFBc0IsQ0FBQyxDQUFDO29CQUM1QixNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsR0FBRyxDQUFDO29CQUMvQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyw0QkFBNEIsQ0FBQyxjQUFjLENBQUMsQ0FBQztpQkFDMUU7Z0JBRUQsS0FBSyxjQUFjLENBQUMsQ0FBQztvQkFDcEIsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUM7b0JBQ2hDLG9GQUFvRjtvQkFDcEYscUZBQXFGO29CQUNyRix3REFBd0Q7b0JBQ3hELElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO3dCQUMzQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO3FCQUNuRDtvQkFFRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztpQkFDekI7Z0JBRUQsS0FBSyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUN0QixJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTt3QkFDM0IsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7cUJBQ3RDO29CQUVELE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2lCQUN6QjtnQkFFRCxLQUFLLE1BQU0sQ0FBQyxDQUFDO29CQUNaLE9BQU87aUJBQ1A7YUFDRDtZQUNELGdEQUFnRDtZQUNoRCxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsT0FBTyxZQUFZLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsTUFBTSxDQUFDLENBQU0sRUFBRSxLQUFhLEVBQUUsR0FBUTtZQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFRDs7O1dBR0c7UUFDYSxPQUFPO1lBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyw0QkFBNEIsNkJBQXFCLENBQUM7WUFDeEUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7S0FDRDtJQXhERCx3REF3REMifQ==