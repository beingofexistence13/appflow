/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/defaultWorkerFactory", "vs/base/common/worker/simpleWorker", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/profiling/common/profilingTelemetrySpec", "vs/platform/telemetry/common/telemetry"], function (require, exports, defaultWorkerFactory_1, simpleWorker_1, extensions_1, instantiation_1, log_1, profilingTelemetrySpec_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IProfileAnalysisWorkerService = exports.ProfilingOutput = void 0;
    var ProfilingOutput;
    (function (ProfilingOutput) {
        ProfilingOutput[ProfilingOutput["Failure"] = 0] = "Failure";
        ProfilingOutput[ProfilingOutput["Irrelevant"] = 1] = "Irrelevant";
        ProfilingOutput[ProfilingOutput["Interesting"] = 2] = "Interesting";
    })(ProfilingOutput || (exports.ProfilingOutput = ProfilingOutput = {}));
    exports.IProfileAnalysisWorkerService = (0, instantiation_1.createDecorator)('IProfileAnalysisWorkerService');
    // ---- impl
    let ProfileAnalysisWorkerService = class ProfileAnalysisWorkerService {
        constructor(_telemetryService, _logService) {
            this._telemetryService = _telemetryService;
            this._logService = _logService;
            this._workerFactory = new defaultWorkerFactory_1.DefaultWorkerFactory('CpuProfileAnalysis');
        }
        async _withWorker(callback) {
            const worker = new simpleWorker_1.SimpleWorkerClient(this._workerFactory, 'vs/platform/profiling/electron-sandbox/profileAnalysisWorker', { /* host */});
            try {
                const r = await callback(await worker.getProxyObject());
                return r;
            }
            finally {
                worker.dispose();
            }
        }
        async analyseBottomUp(profile, callFrameClassifier, perfBaseline, sendAsErrorTelemtry) {
            return this._withWorker(async (worker) => {
                const result = await worker.analyseBottomUp(profile);
                if (result.kind === 2 /* ProfilingOutput.Interesting */) {
                    for (const sample of result.samples) {
                        (0, profilingTelemetrySpec_1.reportSample)({
                            sample,
                            perfBaseline,
                            source: callFrameClassifier(sample.url)
                        }, this._telemetryService, this._logService, sendAsErrorTelemtry);
                    }
                }
                return result.kind;
            });
        }
        async analyseByLocation(profile, locations) {
            return this._withWorker(async (worker) => {
                const result = await worker.analyseByUrlCategory(profile, locations);
                return result;
            });
        }
    };
    ProfileAnalysisWorkerService = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, log_1.ILogService)
    ], ProfileAnalysisWorkerService);
    (0, extensions_1.registerSingleton)(exports.IProfileAnalysisWorkerService, ProfileAnalysisWorkerService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZUFuYWx5c2lzV29ya2VyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Byb2ZpbGluZy9lbGVjdHJvbi1zYW5kYm94L3Byb2ZpbGVBbmFseXNpc1dvcmtlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZWhHLElBQWtCLGVBSWpCO0lBSkQsV0FBa0IsZUFBZTtRQUNoQywyREFBTyxDQUFBO1FBQ1AsaUVBQVUsQ0FBQTtRQUNWLG1FQUFXLENBQUE7SUFDWixDQUFDLEVBSmlCLGVBQWUsK0JBQWYsZUFBZSxRQUloQztJQU1ZLFFBQUEsNkJBQTZCLEdBQUcsSUFBQSwrQkFBZSxFQUFnQywrQkFBK0IsQ0FBQyxDQUFDO0lBUzdILFlBQVk7SUFFWixJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE0QjtRQU1qQyxZQUNvQixpQkFBcUQsRUFDM0QsV0FBeUM7WUFEbEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUMxQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUp0QyxtQkFBYyxHQUFHLElBQUksMkNBQW9CLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUs3RSxDQUFDO1FBRUcsS0FBSyxDQUFDLFdBQVcsQ0FBSSxRQUFpRTtZQUU3RixNQUFNLE1BQU0sR0FBRyxJQUFJLGlDQUFrQixDQUNwQyxJQUFJLENBQUMsY0FBYyxFQUNuQiw4REFBOEQsRUFDOUQsRUFBRSxVQUFVLENBQUUsQ0FDZCxDQUFDO1lBRUYsSUFBSTtnQkFDSCxNQUFNLENBQUMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RCxPQUFPLENBQUMsQ0FBQzthQUNUO29CQUFTO2dCQUNULE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNqQjtRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLE9BQW1CLEVBQUUsbUJBQXlDLEVBQUUsWUFBb0IsRUFBRSxtQkFBNEI7WUFDdkksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBQyxNQUFNLEVBQUMsRUFBRTtnQkFDdEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLHdDQUFnQyxFQUFFO29CQUNoRCxLQUFLLE1BQU0sTUFBTSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7d0JBQ3BDLElBQUEscUNBQVksRUFBQzs0QkFDWixNQUFNOzRCQUNOLFlBQVk7NEJBQ1osTUFBTSxFQUFFLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7eUJBQ3ZDLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztxQkFDbEU7aUJBQ0Q7Z0JBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxPQUFtQixFQUFFLFNBQXdDO1lBQ3BGLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUMsTUFBTSxFQUFDLEVBQUU7Z0JBQ3RDLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDckUsT0FBTyxNQUFNLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFBO0lBakRLLDRCQUE0QjtRQU8vQixXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEsaUJBQVcsQ0FBQTtPQVJSLDRCQUE0QixDQWlEakM7SUE0QkQsSUFBQSw4QkFBaUIsRUFBQyxxQ0FBNkIsRUFBRSw0QkFBNEIsb0NBQTRCLENBQUMifQ==