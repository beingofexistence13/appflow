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
    exports.RendererProfiling = void 0;
    let RendererProfiling = class RendererProfiling {
        constructor(_environmentService, _fileService, _logService, nativeHostService, timerService, configService, profileAnalysisService) {
            this._environmentService = _environmentService;
            this._fileService = _fileService;
            this._logService = _logService;
            const devOpts = (0, extensionDevOptions_1.parseExtensionDevOptions)(_environmentService);
            if (devOpts.isExtensionDevTestFromCli) {
                // disabled when running extension tests
                return;
            }
            timerService.perfBaseline.then(perfBaseline => {
                _logService.info(`[perf] Render performance baseline is ${perfBaseline}ms`);
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
                        _logService.debug(`[perf] SLOW task detected (${maxDuration}ms) but renderer profiling is disabled via 'application.experimental.rendererProfiling'`);
                        return;
                    }
                    const sessionId = (0, uuid_1.generateUuid)();
                    _logService.warn(`[perf] Renderer reported VERY LONG TASK (${maxDuration}ms), starting profiling session '${sessionId}'`);
                    // pause observation, we'll take a detailed look
                    obs.disconnect();
                    // profile renderer for 5secs, analyse, and take action depending on the result
                    for (let i = 0; i < 3; i++) {
                        try {
                            const profile = await nativeHostService.profileRenderer(sessionId, 5000);
                            const output = await profileAnalysisService.analyseBottomUp(profile, _url => '<<renderer>>', perfBaseline, true);
                            if (output === 2 /* ProfilingOutput.Interesting */) {
                                this._store(profile, sessionId);
                                break;
                            }
                            (0, async_1.timeout)(15000); // wait 15s
                        }
                        catch (err) {
                            _logService.error(err);
                            break;
                        }
                    }
                    // reconnect the observer
                    obs.observe({ entryTypes: ['longtask'] });
                });
                obs.observe({ entryTypes: ['longtask'] });
                this._observer = obs;
            });
        }
        dispose() {
            this._observer?.disconnect();
        }
        async _store(profile, sessionId) {
            const path = (0, resources_1.joinPath)(this._environmentService.tmpDir, `renderer-${Math.random().toString(16).slice(2, 8)}.cpuprofile`);
            await this._fileService.writeFile(path, buffer_1.VSBuffer.fromString(JSON.stringify(profile)));
            this._logService.info(`[perf] stored profile to DISK '${path}'`, sessionId);
        }
    };
    exports.RendererProfiling = RendererProfiling;
    exports.RendererProfiling = RendererProfiling = __decorate([
        __param(0, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, log_1.ILogService),
        __param(3, native_1.INativeHostService),
        __param(4, timerService_1.ITimerService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, profileAnalysisWorkerService_1.IProfileAnalysisWorkerService)
    ], RendererProfiling);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXJBdXRvUHJvZmlsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wZXJmb3JtYW5jZS9lbGVjdHJvbi1zYW5kYm94L3JlbmRlcmVyQXV0b1Byb2ZpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdCekYsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBaUI7UUFJN0IsWUFDc0QsbUJBQXVELEVBQzdFLFlBQTBCLEVBQzNCLFdBQXdCLEVBQ2xDLGlCQUFxQyxFQUMxQyxZQUEyQixFQUNuQixhQUFvQyxFQUM1QixzQkFBcUQ7WUFOL0Isd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFvQztZQUM3RSxpQkFBWSxHQUFaLFlBQVksQ0FBYztZQUMzQixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQU90RCxNQUFNLE9BQU8sR0FBRyxJQUFBLDhDQUF3QixFQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDOUQsSUFBSSxPQUFPLENBQUMseUJBQXlCLEVBQUU7Z0JBQ3RDLHdDQUF3QztnQkFDeEMsT0FBTzthQUNQO1lBRUQsWUFBWSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQzdDLFdBQVcsQ0FBQyxJQUFJLENBQUMseUNBQXlDLFlBQVksSUFBSSxDQUFDLENBQUM7Z0JBRTVFLElBQUksWUFBWSxHQUFHLENBQUMsRUFBRTtvQkFDckIsV0FBVztvQkFDWCxPQUFPO2lCQUNQO2dCQUVELGlCQUFpQjtnQkFDakIsTUFBTSxhQUFhLEdBQUcsWUFBWSxHQUFHLEVBQUUsQ0FBQyxDQUFDLG9DQUFvQztnQkFFN0UsTUFBTSxHQUFHLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxLQUFLLEVBQUMsSUFBSSxFQUFDLEVBQUU7b0JBRWhELEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDbEIs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