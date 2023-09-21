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
define(["require", "exports", "vs/platform/native/common/native", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/workspace/common/workspace", "vs/workbench/services/extensions/common/extensions", "vs/platform/update/common/update", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/editor/common/editorService", "vs/platform/accessibility/common/accessibility", "vs/workbench/services/timer/browser/timerService", "vs/platform/telemetry/common/telemetry", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/instantiation/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, native_1, environmentService_1, workspace_1, extensions_1, update_1, lifecycle_1, editorService_1, accessibility_1, timerService_1, telemetry_1, globals_1, extensions_2, layoutService_1, productService_1, storage_1, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.didUseCachedData = exports.TimerService = void 0;
    let TimerService = class TimerService extends timerService_1.AbstractTimerService {
        constructor(_nativeHostService, _environmentService, lifecycleService, contextService, extensionService, updateService, paneCompositeService, editorService, accessibilityService, telemetryService, layoutService, _productService, _storageService) {
            super(lifecycleService, contextService, extensionService, updateService, paneCompositeService, editorService, accessibilityService, telemetryService, layoutService);
            this._nativeHostService = _nativeHostService;
            this._environmentService = _environmentService;
            this._productService = _productService;
            this._storageService = _storageService;
            this.setPerformanceMarks('main', _environmentService.window.perfMarks);
        }
        _isInitialStartup() {
            return Boolean(this._environmentService.window.isInitialStartup);
        }
        _didUseCachedData() {
            return didUseCachedData(this._productService, this._storageService, this._environmentService);
        }
        _getWindowCount() {
            return this._nativeHostService.getWindowCount();
        }
        async _extendStartupInfo(info) {
            try {
                const [osProperties, osStatistics, virtualMachineHint, isARM64Emulated] = await Promise.all([
                    this._nativeHostService.getOSProperties(),
                    this._nativeHostService.getOSStatistics(),
                    this._nativeHostService.getOSVirtualMachineHint(),
                    this._nativeHostService.isRunningUnderARM64Translation()
                ]);
                info.totalmem = osStatistics.totalmem;
                info.freemem = osStatistics.freemem;
                info.platform = osProperties.platform;
                info.release = osProperties.release;
                info.arch = osProperties.arch;
                info.loadavg = osStatistics.loadavg;
                info.isARM64Emulated = isARM64Emulated;
                const processMemoryInfo = await globals_1.process.getProcessMemoryInfo();
                info.meminfo = {
                    workingSetSize: processMemoryInfo.residentSet,
                    privateBytes: processMemoryInfo.private,
                    sharedBytes: processMemoryInfo.shared
                };
                info.isVMLikelyhood = Math.round((virtualMachineHint * 100));
                const rawCpus = osProperties.cpus;
                if (rawCpus && rawCpus.length > 0) {
                    info.cpus = { count: rawCpus.length, speed: rawCpus[0].speed, model: rawCpus[0].model };
                }
            }
            catch (error) {
                // ignore, be on the safe side with these hardware method calls
            }
        }
        _shouldReportPerfMarks() {
            // always send when running with the prof-append-timers flag
            return super._shouldReportPerfMarks() || Boolean(this._environmentService.args['prof-append-timers']);
        }
    };
    exports.TimerService = TimerService;
    exports.TimerService = TimerService = __decorate([
        __param(0, native_1.INativeHostService),
        __param(1, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(2, lifecycle_1.ILifecycleService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, extensions_1.IExtensionService),
        __param(5, update_1.IUpdateService),
        __param(6, panecomposite_1.IPaneCompositePartService),
        __param(7, editorService_1.IEditorService),
        __param(8, accessibility_1.IAccessibilityService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, layoutService_1.IWorkbenchLayoutService),
        __param(11, productService_1.IProductService),
        __param(12, storage_1.IStorageService)
    ], TimerService);
    (0, extensions_2.registerSingleton)(timerService_1.ITimerService, TimerService, 1 /* InstantiationType.Delayed */);
    //#region cached data logic
    const lastRunningCommitStorageKey = 'perf/lastRunningCommit';
    let _didUseCachedData = undefined;
    function didUseCachedData(productService, storageService, environmentService) {
        // browser code loading: only a guess based on
        // this being the first start with the commit
        // or subsequent
        if (typeof _didUseCachedData !== 'boolean') {
            if (!environmentService.window.isCodeCaching || !productService.commit) {
                _didUseCachedData = false; // we only produce cached data whith commit and code cache path
            }
            else if (storageService.get(lastRunningCommitStorageKey, -1 /* StorageScope.APPLICATION */) === productService.commit) {
                _didUseCachedData = true; // subsequent start on same commit, assume cached data is there
            }
            else {
                storageService.store(lastRunningCommitStorageKey, productService.commit, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                _didUseCachedData = false; // first time start on commit, assume cached data is not yet there
            }
        }
        return _didUseCachedData;
    }
    exports.didUseCachedData = didUseCachedData;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RpbWVyL2VsZWN0cm9uLXNhbmRib3gvdGltZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW1CekYsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBYSxTQUFRLG1DQUFvQjtRQUVyRCxZQUNzQyxrQkFBc0MsRUFDdEIsbUJBQXVELEVBQ3pGLGdCQUFtQyxFQUM1QixjQUF3QyxFQUMvQyxnQkFBbUMsRUFDdEMsYUFBNkIsRUFDbEIsb0JBQStDLEVBQzFELGFBQTZCLEVBQ3RCLG9CQUEyQyxFQUMvQyxnQkFBbUMsRUFDN0IsYUFBc0MsRUFDN0IsZUFBZ0MsRUFDaEMsZUFBZ0M7WUFFbEUsS0FBSyxDQUFDLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsb0JBQW9CLEVBQUUsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBZGhJLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDdEIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFvQztZQVUxRSxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDaEMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBR2xFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFFUyxpQkFBaUI7WUFDMUIsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFDUyxpQkFBaUI7WUFDMUIsT0FBTyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElB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