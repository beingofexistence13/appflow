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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/resources", "vs/base/common/uuid", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/native/common/native", "vs/platform/profiling/electron-sandbox/profileAnalysisWorkerService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/extensions/common/extensionDevOptions", "vs/workbench/services/timer/browser/timerService"], function (require, exports, async_1, buffer_1, resources_1, uuid_1, configuration_1, files_1, log_1, native_1, profileAnalysisWorkerService_1, environmentService_1, extensionDevOptions_1, timerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Rac = void 0;
    let $Rac = class $Rac {
        constructor(b, d, f, nativeHostService, timerService, configService, profileAnalysisService) {
            this.b = b;
            this.d = d;
            this.f = f;
            const devOpts = (0, extensionDevOptions_1.$Ccb)(b);
            if (devOpts.isExtensionDevTestFromCli) {
                // disabled when running extension tests
                return;
            }
            timerService.perfBaseline.then(perfBaseline => {
                f.info(`[perf] Render performance baseline is ${perfBaseline}ms`);
                if (perfBaseline < 0) {
                    // too slow
                    return;
                }
                // SLOW threshold
                const slowThreshold = perfBaseline * 10; // ~10 frames at 64fps on MY machine
                const obs = new PerformanceObserver(async (list) => {
                    obs.takeRecords();
                    const maxDuration = list.getEntries()
                        .map(e => e.duration)
                        .reduce((p, c) => Math.max(p, c), 0);
                    if (maxDuration < slowThreshold) {
                        return;
                    }
                    if (!configService.getValue('application.experimental.rendererProfiling')) {
                        f.debug(`[perf] SLOW task detected (${maxDuration}ms) but renderer profiling is disabled via 'application.experimental.rendererProfiling'`);
                        return;
                    }
                    const sessionId = (0, uuid_1.$4f)();
                    f.warn(`[perf] Renderer reported VERY LONG TASK (${maxDuration}ms), starting profiling session '${sessionId}'`);
                    // pause observation, we'll take a detailed look
                    obs.disconnect();
                    // profile renderer for 5secs, analyse, and take action depending on the result
                    for (let i = 0; i < 3; i++) {
                        try {
                            const profile = await nativeHostService.profileRenderer(sessionId, 5000);
                            const output = await profileAnalysisService.analyseBottomUp(profile, _url => '<<renderer>>', perfBaseline, true);
                            if (output === 2 /* ProfilingOutput.Interesting */) {
                                this.g(profile, sessionId);
                                break;
                            }
                            (0, async_1.$Hg)(15000); // wait 15s
                        }
                        catch (err) {
                            f.error(err);
                            break;
                        }
                    }
                    // reconnect the observer
                    obs.observe({ entryTypes: ['longtask'] });
                });
                obs.observe({ entryTypes: ['longtask'] });
                this.a = obs;
            });
        }
        dispose() {
            this.a?.disconnect();
        }
        async g(profile, sessionId) {
            const path = (0, resources_1.$ig)(this.b.tmpDir, `renderer-${Math.random().toString(16).slice(2, 8)}.cpuprofile`);
            await this.d.writeFile(path, buffer_1.$Fd.fromString(JSON.stringify(profile)));
            this.f.info(`[perf] stored profile to DISK '${path}'`, sessionId);
        }
    };
    exports.$Rac = $Rac;
    exports.$Rac = $Rac = __decorate([
        __param(0, environmentService_1.$1$b),
        __param(1, files_1.$6j),
        __param(2, log_1.$5i),
        __param(3, native_1.$05b),
        __param(4, timerService_1.$kkb),
        __param(5, configuration_1.$8h),
        __param(6, profileAnalysisWorkerService_1.$G$b)
    ], $Rac);
});
//# sourceMappingURL=rendererAutoProfiler.js.map