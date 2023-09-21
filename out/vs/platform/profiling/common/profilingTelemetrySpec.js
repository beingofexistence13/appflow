/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reportSample = void 0;
    function reportSample(data, telemetryService, logService, sendAsErrorTelemtry) {
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
            errors_1.errorHandler.onUnexpectedError(fakeError);
        }
        else {
            logService.error(fakeError);
        }
    }
    exports.reportSample = reportSample;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsaW5nVGVsZW1ldHJ5U3BlYy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Byb2ZpbGluZy9jb21tb24vcHJvZmlsaW5nVGVsZW1ldHJ5U3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQ2hHLFNBQWdCLFlBQVksQ0FBQyxJQUFnQixFQUFFLGdCQUFtQyxFQUFFLFVBQXVCLEVBQUUsbUJBQTRCO1FBRXhJLE1BQU0sRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztRQUU5Qyx1QkFBdUI7UUFDdkIsZ0JBQWdCLENBQUMsVUFBVSxDQUF5RCxxQkFBcUIsRUFBRTtZQUMxRyxZQUFZO1lBQ1osUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRO1lBQ3pCLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUztZQUMzQixVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVU7WUFDN0IsWUFBWSxFQUFFLE1BQU0sQ0FBQyxRQUFRO1lBQzdCLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ3JELGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDbkYsTUFBTTtTQUNOLENBQUMsQ0FBQztRQUVILHdDQUF3QztRQUN4QyxNQUFNLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLElBQUksbUJBQW1CLEVBQUU7WUFDeEIscUJBQVksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMxQzthQUFNO1lBQ04sVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM1QjtJQUNGLENBQUM7SUF2QkQsb0NBdUJDO0lBRUQsTUFBTSxnQkFBaUIsU0FBUSxLQUFLO1FBR25DLFlBQVksSUFBZ0I7WUFDM0IsS0FBSyxDQUFDLHVCQUF1QixJQUFJLENBQUMsTUFBTSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFDO1lBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFFckMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFDbEQsQ0FBQztLQUNEIn0=