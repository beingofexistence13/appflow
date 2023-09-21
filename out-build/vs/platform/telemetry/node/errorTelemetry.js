/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/platform/telemetry/common/errorTelemetry"], function (require, exports, errors_1, errorTelemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class $Sq extends errorTelemetry_1.default {
        i() {
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
                            if (!(0, errors_1.$2)(e)) {
                                console.warn(`rejected promise not handled within 1 second: ${e}`);
                                if (e.stack) {
                                    console.warn(`stack trace: ${e.stack}`);
                                }
                                if (reason) {
                                    (0, errors_1.$Y)(reason);
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
                if ((0, errors_1.$X)(err)) {
                    return;
                }
                (0, errors_1.$Y)(err);
            });
        }
    }
    exports.default = $Sq;
});
//# sourceMappingURL=errorTelemetry.js.map