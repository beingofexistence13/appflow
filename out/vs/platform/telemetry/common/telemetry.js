/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TelemetryConfiguration = exports.TelemetryLevel = exports.TELEMETRY_OLD_SETTING_ID = exports.TELEMETRY_CRASH_REPORTER_SETTING_ID = exports.TELEMETRY_SETTING_ID = exports.TELEMETRY_SECTION_ID = exports.machineIdKey = exports.lastSessionDateStorageKey = exports.firstSessionDateStorageKey = exports.currentSessionDateStorageKey = exports.ICustomEndpointTelemetryService = exports.ITelemetryService = void 0;
    exports.ITelemetryService = (0, instantiation_1.createDecorator)('telemetryService');
    exports.ICustomEndpointTelemetryService = (0, instantiation_1.createDecorator)('customEndpointTelemetryService');
    // Keys
    exports.currentSessionDateStorageKey = 'telemetry.currentSessionDate';
    exports.firstSessionDateStorageKey = 'telemetry.firstSessionDate';
    exports.lastSessionDateStorageKey = 'telemetry.lastSessionDate';
    exports.machineIdKey = 'telemetry.machineId';
    // Configuration Keys
    exports.TELEMETRY_SECTION_ID = 'telemetry';
    exports.TELEMETRY_SETTING_ID = 'telemetry.telemetryLevel';
    exports.TELEMETRY_CRASH_REPORTER_SETTING_ID = 'telemetry.enableCrashReporter';
    exports.TELEMETRY_OLD_SETTING_ID = 'telemetry.enableTelemetry';
    var TelemetryLevel;
    (function (TelemetryLevel) {
        TelemetryLevel[TelemetryLevel["NONE"] = 0] = "NONE";
        TelemetryLevel[TelemetryLevel["CRASH"] = 1] = "CRASH";
        TelemetryLevel[TelemetryLevel["ERROR"] = 2] = "ERROR";
        TelemetryLevel[TelemetryLevel["USAGE"] = 3] = "USAGE";
    })(TelemetryLevel || (exports.TelemetryLevel = TelemetryLevel = {}));
    var TelemetryConfiguration;
    (function (TelemetryConfiguration) {
        TelemetryConfiguration["OFF"] = "off";
        TelemetryConfiguration["CRASH"] = "crash";
        TelemetryConfiguration["ERROR"] = "error";
        TelemetryConfiguration["ON"] = "all";
    })(TelemetryConfiguration || (exports.TelemetryConfiguration = TelemetryConfiguration = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVsZW1ldHJ5L2NvbW1vbi90ZWxlbWV0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS25GLFFBQUEsaUJBQWlCLEdBQUcsSUFBQSwrQkFBZSxFQUFvQixrQkFBa0IsQ0FBQyxDQUFDO0lBbUQzRSxRQUFBLCtCQUErQixHQUFHLElBQUEsK0JBQWUsRUFBa0MsZ0NBQWdDLENBQUMsQ0FBQztJQVNsSSxPQUFPO0lBQ00sUUFBQSw0QkFBNEIsR0FBRyw4QkFBOEIsQ0FBQztJQUM5RCxRQUFBLDBCQUEwQixHQUFHLDRCQUE0QixDQUFDO0lBQzFELFFBQUEseUJBQXlCLEdBQUcsMkJBQTJCLENBQUM7SUFDeEQsUUFBQSxZQUFZLEdBQUcscUJBQXFCLENBQUM7SUFFbEQscUJBQXFCO0lBQ1IsUUFBQSxvQkFBb0IsR0FBRyxXQUFXLENBQUM7SUFDbkMsUUFBQSxvQkFBb0IsR0FBRywwQkFBMEIsQ0FBQztJQUNsRCxRQUFBLG1DQUFtQyxHQUFHLCtCQUErQixDQUFDO0lBQ3RFLFFBQUEsd0JBQXdCLEdBQUcsMkJBQTJCLENBQUM7SUFFcEUsSUFBa0IsY0FLakI7SUFMRCxXQUFrQixjQUFjO1FBQy9CLG1EQUFRLENBQUE7UUFDUixxREFBUyxDQUFBO1FBQ1QscURBQVMsQ0FBQTtRQUNULHFEQUFTLENBQUE7SUFDVixDQUFDLEVBTGlCLGNBQWMsOEJBQWQsY0FBYyxRQUsvQjtJQUVELElBQWtCLHNCQUtqQjtJQUxELFdBQWtCLHNCQUFzQjtRQUN2QyxxQ0FBVyxDQUFBO1FBQ1gseUNBQWUsQ0FBQTtRQUNmLHlDQUFlLENBQUE7UUFDZixvQ0FBVSxDQUFBO0lBQ1gsQ0FBQyxFQUxpQixzQkFBc0Isc0NBQXRCLHNCQUFzQixRQUt2QyJ9