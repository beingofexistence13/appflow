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
    exports.$G$b = exports.ProfilingOutput = void 0;
    var ProfilingOutput;
    (function (ProfilingOutput) {
        ProfilingOutput[ProfilingOutput["Failure"] = 0] = "Failure";
        ProfilingOutput[ProfilingOutput["Irrelevant"] = 1] = "Irrelevant";
        ProfilingOutput[ProfilingOutput["Interesting"] = 2] = "Interesting";
    })(ProfilingOutput || (exports.ProfilingOutput = ProfilingOutput = {}));
    exports.$G$b = (0, instantiation_1.$Bh)('IProfileAnalysisWorkerService');
    // ---- impl
    let ProfileAnalysisWorkerService = class ProfileAnalysisWorkerService {
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.a = new defaultWorkerFactory_1.$WQ('CpuProfileAnalysis');
        }
        async d(callback) {
            const worker = new simpleWorker_1.SimpleWorkerClient(this.a, 'vs/platform/profiling/electron-sandbox/profileAnalysisWorker', { /* host */});
            try {
                const r = await callback(await worker.getProxyObject());
                return r;
            }
            finally {
                worker.dispose();
            }
        }
        async analyseBottomUp(profile, callFrameClassifier, perfBaseline, sendAsErrorTelemtry) {
            return this.d(async (worker) => {
                const result = await worker.analyseBottomUp(profile);
                if (result.kind === 2 /* ProfilingOutput.Interesting */) {
                    for (const sample of result.samples) {
                        (0, profilingTelemetrySpec_1.$F$b)({
                            sample,
                            perfBaseline,
                            source: callFrameClassifier(sample.url)
                        }, this.b, this.c, sendAsErrorTelemtry);
                    }
                }
                return result.kind;
            });
        }
        async analyseByLocation(profile, locations) {
            return this.d(async (worker) => {
                const result = await worker.analyseByUrlCategory(profile, locations);
                return result;
            });
        }
    };
    ProfileAnalysisWorkerService = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, log_1.$5i)
    ], ProfileAnalysisWorkerService);
    (0, extensions_1.$mr)(exports.$G$b, ProfileAnalysisWorkerService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=profileAnalysisWorkerService.js.map