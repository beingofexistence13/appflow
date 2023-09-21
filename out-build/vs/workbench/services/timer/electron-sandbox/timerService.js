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
    exports.$2_b = exports.$1_b = void 0;
    let $1_b = class $1_b extends timerService_1.$lkb {
        constructor(x, y, lifecycleService, contextService, extensionService, updateService, paneCompositeService, editorService, accessibilityService, telemetryService, layoutService, z, A) {
            super(lifecycleService, contextService, extensionService, updateService, paneCompositeService, editorService, accessibilityService, telemetryService, layoutService);
            this.x = x;
            this.y = y;
            this.z = z;
            this.A = A;
            this.setPerformanceMarks('main', y.window.perfMarks);
        }
        t() {
            return Boolean(this.y.window.isInitialStartup);
        }
        u() {
            return $2_b(this.z, this.A, this.y);
        }
        v() {
            return this.x.getWindowCount();
        }
        async w(info) {
            try {
                const [osProperties, osStatistics, virtualMachineHint, isARM64Emulated] = await Promise.all([
                    this.x.getOSProperties(),
                    this.x.getOSStatistics(),
                    this.x.getOSVirtualMachineHint(),
                    this.x.isRunningUnderARM64Translation()
                ]);
                info.totalmem = osStatistics.totalmem;
                info.freemem = osStatistics.freemem;
                info.platform = osProperties.platform;
                info.release = osProperties.release;
                info.arch = osProperties.arch;
                info.loadavg = osStatistics.loadavg;
                info.isARM64Emulated = isARM64Emulated;
                const processMemoryInfo = await globals_1.$P.getProcessMemoryInfo();
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
        q() {
            // always send when running with the prof-append-timers flag
            return super.q() || Boolean(this.y.args['prof-append-timers']);
        }
    };
    exports.$1_b = $1_b;
    exports.$1_b = $1_b = __decorate([
        __param(0, native_1.$05b),
        __param(1, environmentService_1.$1$b),
        __param(2, lifecycle_1.$7y),
        __param(3, workspace_1.$Kh),
        __param(4, extensions_1.$MF),
        __param(5, update_1.$UT),
        __param(6, panecomposite_1.$Yeb),
        __param(7, editorService_1.$9C),
        __param(8, accessibility_1.$1r),
        __param(9, telemetry_1.$9k),
        __param(10, layoutService_1.$Meb),
        __param(11, productService_1.$kj),
        __param(12, storage_1.$Vo)
    ], $1_b);
    (0, extensions_2.$mr)(timerService_1.$kkb, $1_b, 1 /* InstantiationType.Delayed */);
    //#region cached data logic
    const lastRunningCommitStorageKey = 'perf/lastRunningCommit';
    let _didUseCachedData = undefined;
    function $2_b(productService, storageService, environmentService) {
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
    exports.$2_b = $2_b;
});
//#endregion
//# sourceMappingURL=timerService.js.map