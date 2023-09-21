/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/platform/telemetry/common/errorTelemetry"], function (require, exports, errors_1, errorTelemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ErrorTelemetry extends errorTelemetry_1.default {
        installErrorListeners() {
            (0, errors_1.setUnexpectedErrorHandler)(err => console.error(err));
            // Print a console message when rejection isn't handled within N seconds. For details:
            // see https://nodejs.org/api/process.html#process_event_unhandledrejection
            // and https://nodejs.org/api/process.html#process_event_rejectionhandled
            const unhandledPromises = [];
            process.on('unhandledRejection', (reason, promise) => {
                unhandledPromises.push(promise);
                setTimeout(() => {
                    const idx = unhandledPromises.indexOf(promise);
                    if (idx >= 0) {
                        promise.catch(e => {
                            unhandledPromises.splice(idx, 1);
                            if (!(0, errors_1.isCancellationError)(e)) {
                                console.warn(`rejected promise not handled within 1 second: ${e}`);
                                if (e.stack) {
                                    console.warn(`stack trace: ${e.stack}`);
                                }
                                if (reason) {
                                    (0, errors_1.onUnexpectedError)(reason);
                                }
                            }
                        });
                    }
                }, 1000);
            });
            process.on('rejectionHandled', (promise) => {
                const idx = unhandledPromises.indexOf(promise);
                if (idx >= 0) {
                    unhandledPromises.splice(idx, 1);
                }
            });
            // Print a console message when an exception isn't handled.
            process.on('uncaughtException', (err) => {
                if ((0, errors_1.isSigPipeError)(err)) {
                    return;
                }
                (0, errors_1.onUnexpectedError)(err);
            });
        }
    }
    exports.default = ErrorTelemetry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JUZWxlbWV0cnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZWxlbWV0cnkvbm9kZS9lcnJvclRlbGVtZXRyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQUtoRyxNQUFxQixjQUFlLFNBQVEsd0JBQWtCO1FBQzFDLHFCQUFxQjtZQUN2QyxJQUFBLGtDQUF5QixFQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXJELHNGQUFzRjtZQUN0RiwyRUFBMkU7WUFDM0UseUVBQXlFO1lBQ3pFLE1BQU0saUJBQWlCLEdBQW1CLEVBQUUsQ0FBQztZQUM3QyxPQUFPLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsTUFBVyxFQUFFLE9BQXFCLEVBQUUsRUFBRTtnQkFDdkUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNoQyxVQUFVLENBQUMsR0FBRyxFQUFFO29CQUNmLE1BQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDL0MsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFO3dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7NEJBQ2pCLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQ2pDLElBQUksQ0FBQyxJQUFBLDRCQUFtQixFQUFDLENBQUMsQ0FBQyxFQUFFO2dDQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLGlEQUFpRCxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dDQUNuRSxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUU7b0NBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7aUNBQ3hDO2dDQUNELElBQUksTUFBTSxFQUFFO29DQUNYLElBQUEsMEJBQWlCLEVBQUMsTUFBTSxDQUFDLENBQUM7aUNBQzFCOzZCQUNEO3dCQUNGLENBQUMsQ0FBQyxDQUFDO3FCQUNIO2dCQUNGLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNWLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLE9BQXFCLEVBQUUsRUFBRTtnQkFDeEQsTUFBTSxHQUFHLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUU7b0JBQ2IsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDakM7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILDJEQUEyRDtZQUMzRCxPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQUMsR0FBa0MsRUFBRSxFQUFFO2dCQUN0RSxJQUFJLElBQUEsdUJBQWMsRUFBQyxHQUFHLENBQUMsRUFBRTtvQkFDeEIsT0FBTztpQkFDUDtnQkFFRCxJQUFBLDBCQUFpQixFQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNEO0lBN0NELGlDQTZDQyJ9