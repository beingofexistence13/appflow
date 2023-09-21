/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$F$b = void 0;
    function $F$b(data, telemetryService, logService, sendAsErrorTelemtry) {
        const { sample, perfBaseline, source } = data;
        // send telemetry event
        telemetryService.publicLog2(`unresponsive.sample`, {
            perfBaseline,
            selfTime: sample.selfTime,
            totalTime: sample.totalTime,
            percentage: sample.percentage,
            functionName: sample.location,
            callers: sample.caller.map(c => c.location).join('<'),
            callersAnnotated: sample.caller.map(c => `${c.percentage}|${c.location}`).join('<'),
            source
        });
        // log a fake error with a clearer stack
        const fakeError = new PerformanceError(data);
        if (sendAsErrorTelemtry) {
            errors_1.$V.onUnexpectedError(fakeError);
        }
        else {
            logService.error(fakeError);
        }
    }
    exports.$F$b = $F$b;
    class PerformanceError extends Error {
        constructor(data) {
            super(`PerfSampleError: by ${data.source} in ${data.sample.location}`);
            this.name = 'PerfSampleError';
            this.selfTime = data.sample.selfTime;
            const trace = [data.sample.absLocation, ...data.sample.caller.map(c => c.absLocation)];
            this.stack = `\n\t at ${trace.join('\n\t at ')}`;
        }
    }
});
//# sourceMappingURL=profilingTelemetrySpec.js.map