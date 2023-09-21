/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TelemetryConfiguration = exports.TelemetryLevel = exports.$fl = exports.$el = exports.$dl = exports.$cl = exports.$bl = exports.$al = exports.$_k = exports.$$k = exports.$0k = exports.$9k = void 0;
    exports.$9k = (0, instantiation_1.$Bh)('telemetryService');
    exports.$0k = (0, instantiation_1.$Bh)('customEndpointTelemetryService');
    // Keys
    exports.$$k = 'telemetry.currentSessionDate';
    exports.$_k = 'telemetry.firstSessionDate';
    exports.$al = 'telemetry.lastSessionDate';
    exports.$bl = 'telemetry.machineId';
    // Configuration Keys
    exports.$cl = 'telemetry';
    exports.$dl = 'telemetry.telemetryLevel';
    exports.$el = 'telemetry.enableCrashReporter';
    exports.$fl = 'telemetry.enableTelemetry';
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
//# sourceMappingURL=telemetry.js.map