/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/telemetry/common/errorTelemetry"], function (require, exports, errors_1, lifecycle_1, platform_1, errorTelemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ErrorTelemetry extends errorTelemetry_1.default {
        installErrorListeners() {
            let oldOnError;
            const that = this;
            if (typeof platform_1.globals.onerror === 'function') {
                oldOnError = platform_1.globals.onerror;
            }
            platform_1.globals.onerror = function (message, filename, line, column, e) {
                that._onUncaughtError(message, filename, line, column, e);
                oldOnError?.apply(this, arguments);
            };
            this._disposables.add((0, lifecycle_1.toDisposable)(() => {
                if (oldOnError) {
                    platform_1.globals.onerror = oldOnError;
                }
            }));
        }
        _onUncaughtError(msg, file, line, column, err) {
            const data = {
                callstack: msg,
                msg,
                file,
                line,
                column
            };
            if (err) {
                // If it's the no telemetry error it doesn't get logged
                if (errors_1.ErrorNoTelemetry.isErrorNoTelemetry(err)) {
                    return;
                }
                const { name, message, stack } = err;
                data.uncaught_error_name = name;
                if (message) {
                    data.uncaught_error_msg = message;
                }
                if (stack) {
                    data.callstack = Array.isArray(err.stack)
                        ? err.stack = err.stack.join('\n')
                        : err.stack;
                }
            }
            this._enqueue(data);
        }
    }
    exports.default = ErrorTelemetry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JUZWxlbWV0cnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZWxlbWV0cnkvYnJvd3Nlci9lcnJvclRlbGVtZXRyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU9oRyxNQUFxQixjQUFlLFNBQVEsd0JBQWtCO1FBQzFDLHFCQUFxQjtZQUN2QyxJQUFJLFVBQW9CLENBQUM7WUFDekIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksT0FBTyxrQkFBTyxDQUFDLE9BQU8sS0FBSyxVQUFVLEVBQUU7Z0JBQzFDLFVBQVUsR0FBRyxrQkFBTyxDQUFDLE9BQU8sQ0FBQzthQUM3QjtZQUNELGtCQUFPLENBQUMsT0FBTyxHQUFHLFVBQVUsT0FBZSxFQUFFLFFBQWdCLEVBQUUsSUFBWSxFQUFFLE1BQWUsRUFBRSxDQUFPO2dCQUNwRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxVQUFVLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNwQyxDQUFDLENBQUM7WUFDRixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUN2QyxJQUFJLFVBQVUsRUFBRTtvQkFDZixrQkFBTyxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUM7aUJBQzdCO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTyxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsSUFBWSxFQUFFLElBQVksRUFBRSxNQUFlLEVBQUUsR0FBUztZQUMzRixNQUFNLElBQUksR0FBZTtnQkFDeEIsU0FBUyxFQUFFLEdBQUc7Z0JBQ2QsR0FBRztnQkFDSCxJQUFJO2dCQUNKLElBQUk7Z0JBQ0osTUFBTTthQUNOLENBQUM7WUFFRixJQUFJLEdBQUcsRUFBRTtnQkFDUix1REFBdUQ7Z0JBQ3ZELElBQUkseUJBQWdCLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQzdDLE9BQU87aUJBQ1A7Z0JBRUQsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO2dCQUNoQyxJQUFJLE9BQU8sRUFBRTtvQkFDWixJQUFJLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDO2lCQUNsQztnQkFDRCxJQUFJLEtBQUssRUFBRTtvQkFDVixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQzt3QkFDeEMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUNsQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztpQkFDYjthQUNEO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQixDQUFDO0tBQ0Q7SUEvQ0QsaUNBK0NDIn0=