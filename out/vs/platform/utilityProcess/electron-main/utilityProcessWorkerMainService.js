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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/windows/electron-main/windows", "vs/platform/utilityProcess/electron-main/utilityProcess", "vs/platform/telemetry/common/telemetry", "vs/base/common/hash", "vs/base/common/event", "vs/base/common/async", "vs/platform/lifecycle/electron-main/lifecycleMainService"], function (require, exports, lifecycle_1, instantiation_1, log_1, windows_1, utilityProcess_1, telemetry_1, hash_1, event_1, async_1, lifecycleMainService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UtilityProcessWorkerMainService = exports.IUtilityProcessWorkerMainService = void 0;
    exports.IUtilityProcessWorkerMainService = (0, instantiation_1.createDecorator)('utilityProcessWorker');
    let UtilityProcessWorkerMainService = class UtilityProcessWorkerMainService extends lifecycle_1.Disposable {
        constructor(logService, windowsMainService, telemetryService, lifecycleMainService) {
            super();
            this.logService = logService;
            this.windowsMainService = windowsMainService;
            this.telemetryService = telemetryService;
            this.lifecycleMainService = lifecycleMainService;
            this.workers = new Map();
        }
        async createWorker(configuration) {
            const workerLogId = `window: ${configuration.reply.windowId}, moduleId: ${configuration.process.moduleId}`;
            this.logService.trace(`[UtilityProcessWorker]: createWorker(${workerLogId})`);
            // Ensure to dispose any existing process for config
            const workerId = this.hash(configuration);
            if (this.workers.has(workerId)) {
                this.logService.warn(`[UtilityProcessWorker]: createWorker() found an existing worker that will be terminated (${workerLogId})`);
                this.disposeWorker(configuration);
            }
            // Create new worker
            const worker = new UtilityProcessWorker(this.logService, this.windowsMainService, this.telemetryService, this.lifecycleMainService, configuration);
            if (!worker.spawn()) {
                return { reason: { code: 1, signal: 'EINVALID' } };
            }
            this.workers.set(workerId, worker);
            const onDidTerminate = new async_1.DeferredPromise();
            event_1.Event.once(worker.onDidTerminate)(reason => {
                if (reason.code === 0) {
                    this.logService.trace(`[UtilityProcessWorker]: terminated normally with code ${reason.code}, signal: ${reason.signal}`);
                }
                else {
                    this.logService.error(`[UtilityProcessWorker]: terminated unexpectedly with code ${reason.code}, signal: ${reason.signal}`);
                }
                this.workers.delete(workerId);
                onDidTerminate.complete({ reason });
            });
            return onDidTerminate.p;
        }
        hash(configuration) {
            return (0, hash_1.hash)({
                moduleId: configuration.process.moduleId,
                windowId: configuration.reply.windowId
            });
        }
        async disposeWorker(configuration) {
            const workerId = this.hash(configuration);
            const worker = this.workers.get(workerId);
            if (!worker) {
                return;
            }
            this.logService.trace(`[UtilityProcessWorker]: disposeWorker(window: ${configuration.reply.windowId}, moduleId: ${configuration.process.moduleId})`);
            worker.kill();
            this.workers.delete(workerId);
        }
    };
    exports.UtilityProcessWorkerMainService = UtilityProcessWorkerMainService;
    exports.UtilityProcessWorkerMainService = UtilityProcessWorkerMainService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, windows_1.IWindowsMainService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, lifecycleMainService_1.ILifecycleMainService)
    ], UtilityProcessWorkerMainService);
    let UtilityProcessWorker = class UtilityProcessWorker extends lifecycle_1.Disposable {
        constructor(logService, windowsMainService, telemetryService, lifecycleMainService, configuration) {
            super();
            this.logService = logService;
            this.windowsMainService = windowsMainService;
            this.telemetryService = telemetryService;
            this.lifecycleMainService = lifecycleMainService;
            this.configuration = configuration;
            this._onDidTerminate = this._register(new event_1.Emitter());
            this.onDidTerminate = this._onDidTerminate.event;
            this.utilityProcess = new utilityProcess_1.WindowUtilityProcess(this.logService, this.windowsMainService, this.telemetryService, this.lifecycleMainService);
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.utilityProcess.onExit(e => this._onDidTerminate.fire({ code: e.code, signal: e.signal })));
            this._register(this.utilityProcess.onCrash(e => this._onDidTerminate.fire({ code: e.code, signal: 'ECRASH' })));
        }
        spawn() {
            const window = this.windowsMainService.getWindowById(this.configuration.reply.windowId);
            const windowPid = window?.win?.webContents.getOSProcessId();
            return this.utilityProcess.start({
                type: this.configuration.process.type,
                entryPoint: this.configuration.process.moduleId,
                parentLifecycleBound: windowPid,
                windowLifecycleBound: true,
                correlationId: `${this.configuration.reply.windowId}`,
                responseWindowId: this.configuration.reply.windowId,
                responseChannel: this.configuration.reply.channel,
                responseNonce: this.configuration.reply.nonce
            });
        }
        kill() {
            this.utilityProcess.kill();
        }
    };
    UtilityProcessWorker = __decorate([
        __param(0, log_1.ILogService),
        __param(1, windows_1.IWindowsMainService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, lifecycleMainService_1.ILifecycleMainService)
    ], UtilityProcessWorker);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbGl0eVByb2Nlc3NXb3JrZXJNYWluU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3V0aWxpdHlQcm9jZXNzL2VsZWN0cm9uLW1haW4vdXRpbGl0eVByb2Nlc3NXb3JrZXJNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFjbkYsUUFBQSxnQ0FBZ0MsR0FBRyxJQUFBLCtCQUFlLEVBQW1DLHNCQUFzQixDQUFDLENBQUM7SUFPbkgsSUFBTSwrQkFBK0IsR0FBckMsTUFBTSwrQkFBZ0MsU0FBUSxzQkFBVTtRQU05RCxZQUNjLFVBQXdDLEVBQ2hDLGtCQUF3RCxFQUMxRCxnQkFBb0QsRUFDaEQsb0JBQTREO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBTHNCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDZix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ3pDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDL0IseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQU5uRSxZQUFPLEdBQUcsSUFBSSxHQUFHLEVBQXlDLENBQUM7UUFTNUUsQ0FBQztRQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsYUFBdUQ7WUFDekUsTUFBTSxXQUFXLEdBQUcsV0FBVyxhQUFhLENBQUMsS0FBSyxDQUFDLFFBQVEsZUFBZSxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzNHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1lBRTlFLG9EQUFvRDtZQUNwRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLDRGQUE0RixXQUFXLEdBQUcsQ0FBQyxDQUFDO2dCQUVqSSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ2xDO1lBRUQsb0JBQW9CO1lBQ3BCLE1BQU0sTUFBTSxHQUFHLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUNuSixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNwQixPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQzthQUNuRDtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVuQyxNQUFNLGNBQWMsR0FBRyxJQUFJLHVCQUFlLEVBQTZDLENBQUM7WUFDeEYsYUFBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzFDLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7b0JBQ3RCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLHlEQUF5RCxNQUFNLENBQUMsSUFBSSxhQUFhLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2lCQUN4SDtxQkFBTTtvQkFDTixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyw2REFBNkQsTUFBTSxDQUFDLElBQUksYUFBYSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztpQkFDNUg7Z0JBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzlCLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFFTyxJQUFJLENBQUMsYUFBaUQ7WUFDN0QsT0FBTyxJQUFBLFdBQUksRUFBQztnQkFDWCxRQUFRLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRO2dCQUN4QyxRQUFRLEVBQUUsYUFBYSxDQUFDLEtBQUssQ0FBQyxRQUFRO2FBQ3RDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLGFBQWlEO1lBQ3BFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDMUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxpREFBaUQsYUFBYSxDQUFDLEtBQUssQ0FBQyxRQUFRLGVBQWUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBRXJKLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9CLENBQUM7S0FDRCxDQUFBO0lBckVZLDBFQUErQjs4Q0FBL0IsK0JBQStCO1FBT3pDLFdBQUEsaUJBQVcsQ0FBQTtRQUNYLFdBQUEsNkJBQW1CLENBQUE7UUFDbkIsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLDRDQUFxQixDQUFBO09BVlgsK0JBQStCLENBcUUzQztJQUVELElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsc0JBQVU7UUFPNUMsWUFDYyxVQUF3QyxFQUNoQyxrQkFBd0QsRUFDMUQsZ0JBQW9ELEVBQ2hELG9CQUE0RCxFQUNsRSxhQUF1RDtZQUV4RSxLQUFLLEVBQUUsQ0FBQztZQU5zQixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ2YsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUN6QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQy9CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDbEUsa0JBQWEsR0FBYixhQUFhLENBQTBDO1lBVnhELG9CQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBb0MsQ0FBQyxDQUFDO1lBQzFGLG1CQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUM7WUFFcEMsbUJBQWMsR0FBRyxJQUFJLHFDQUFvQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQVd0SixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8saUJBQWlCO1lBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0csSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pILENBQUM7UUFFRCxLQUFLO1lBQ0osTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN4RixNQUFNLFNBQVMsR0FBRyxNQUFNLEVBQUUsR0FBRyxFQUFFLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUU1RCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO2dCQUNoQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSTtnQkFDckMsVUFBVSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVE7Z0JBQy9DLG9CQUFvQixFQUFFLFNBQVM7Z0JBQy9CLG9CQUFvQixFQUFFLElBQUk7Z0JBQzFCLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtnQkFDckQsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsUUFBUTtnQkFDbkQsZUFBZSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU87Z0JBQ2pELGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLO2FBQzdDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxJQUFJO1lBQ0gsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM1QixDQUFDO0tBQ0QsQ0FBQTtJQTNDSyxvQkFBb0I7UUFRdkIsV0FBQSxpQkFBVyxDQUFBO1FBQ1gsV0FBQSw2QkFBbUIsQ0FBQTtRQUNuQixXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEsNENBQXFCLENBQUE7T0FYbEIsb0JBQW9CLENBMkN6QiJ9