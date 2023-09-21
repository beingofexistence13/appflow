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
define(["require", "exports", "vs/base/common/performance", "vs/platform/instantiation/common/instantiation", "vs/platform/workspace/common/workspace", "vs/workbench/services/extensions/common/extensions", "vs/platform/update/common/update", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/editor/common/editorService", "vs/platform/accessibility/common/accessibility", "vs/platform/telemetry/common/telemetry", "vs/base/common/async", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/telemetry/common/telemetryUtils", "vs/base/common/platform", "vs/base/browser/defaultWorkerFactory", "vs/platform/registry/common/platform", "vs/platform/terminal/common/terminal"], function (require, exports, perf, instantiation_1, workspace_1, extensions_1, update_1, lifecycle_1, editorService_1, accessibility_1, telemetry_1, async_1, layoutService_1, panecomposite_1, telemetryUtils_1, platform_1, defaultWorkerFactory_1, platform_2, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimerService = exports.AbstractTimerService = exports.ITimerService = void 0;
    exports.ITimerService = (0, instantiation_1.createDecorator)('timerService');
    class PerfMarks {
        constructor() {
            this._entries = [];
        }
        setMarks(source, entries) {
            this._entries.push([source, entries]);
        }
        getDuration(from, to) {
            const fromEntry = this._findEntry(from);
            if (!fromEntry) {
                return 0;
            }
            const toEntry = this._findEntry(to);
            if (!toEntry) {
                return 0;
            }
            return toEntry.startTime - fromEntry.startTime;
        }
        _findEntry(name) {
            for (const [, marks] of this._entries) {
                for (let i = marks.length - 1; i >= 0; i--) {
                    if (marks[i].name === name) {
                        return marks[i];
                    }
                }
            }
        }
        getEntries() {
            return this._entries.slice(0);
        }
    }
    let AbstractTimerService = class AbstractTimerService {
        constructor(_lifecycleService, _contextService, _extensionService, _updateService, _paneCompositeService, _editorService, _accessibilityService, _telemetryService, layoutService) {
            this._lifecycleService = _lifecycleService;
            this._contextService = _contextService;
            this._extensionService = _extensionService;
            this._updateService = _updateService;
            this._paneCompositeService = _paneCompositeService;
            this._editorService = _editorService;
            this._accessibilityService = _accessibilityService;
            this._telemetryService = _telemetryService;
            this._barrier = new async_1.Barrier();
            this._marks = new PerfMarks();
            this._rndValueShouldSendTelemetry = Math.random() < .05; // 5% of users
            Promise.all([
                this._extensionService.whenInstalledExtensionsRegistered(),
                _lifecycleService.when(3 /* LifecyclePhase.Restored */),
                layoutService.whenRestored,
                Promise.all(Array.from(platform_2.Registry.as(terminal_1.TerminalExtensions.Backend).backends.values()).map(e => e.whenReady))
            ]).then(() => {
                // set perf mark from renderer
                this.setPerformanceMarks('renderer', perf.getMarks());
                return this._computeStartupMetrics();
            }).then(metrics => {
                this._startupMetrics = metrics;
                this._reportStartupTimes(metrics);
                this._barrier.open();
            });
            this.perfBaseline = this._barrier.wait()
                .then(() => this._lifecycleService.when(4 /* LifecyclePhase.Eventually */))
                .then(() => (0, async_1.timeout)(this._startupMetrics.timers.ellapsedRequire))
                .then(() => {
                // we use fibonacci numbers to have a performance baseline that indicates
                // how slow/fast THIS machine actually is.
                const jsSrc = (function () {
                    // the following operation took ~16ms (one frame at 64FPS) to complete on my machine. We derive performance observations
                    // from that. We also bail if that took too long (>1s)
                    let tooSlow = false;
                    function fib(n) {
                        if (tooSlow) {
                            return 0;
                        }
                        if (performance.now() - t1 >= 1000) {
                            tooSlow = true;
                        }
                        if (n <= 2) {
                            return n;
                        }
                        return fib(n - 1) + fib(n - 2);
                    }
                    const t1 = performance.now();
                    fib(24);
                    const value = Math.round(performance.now() - t1);
                    postMessage({ value: tooSlow ? -1 : value });
                }).toString();
                const blob = new Blob([`(${jsSrc})();`], { type: 'application/javascript' });
                const blobUrl = URL.createObjectURL(blob);
                const worker = (0, defaultWorkerFactory_1.createBlobWorker)(blobUrl, { name: 'perfBaseline' });
                return new Promise(resolve => {
                    worker.onmessage = e => resolve(e.data.value);
                }).finally(() => {
                    worker.terminate();
                    URL.revokeObjectURL(blobUrl);
                });
            });
        }
        whenReady() {
            return this._barrier.wait();
        }
        get startupMetrics() {
            if (!this._startupMetrics) {
                throw new Error('illegal state, MUST NOT access startupMetrics before whenReady has resolved');
            }
            return this._startupMetrics;
        }
        setPerformanceMarks(source, marks) {
            // Perf marks are a shared resource because anyone can generate them
            // and because of that we only accept marks that start with 'code/'
            const codeMarks = marks.filter(mark => mark.name.startsWith('code/'));
            this._marks.setMarks(source, codeMarks);
            this._reportPerformanceMarks(source, codeMarks);
        }
        getPerformanceMarks() {
            return this._marks.getEntries();
        }
        getDuration(from, to) {
            return this._marks.getDuration(from, to);
        }
        _reportStartupTimes(metrics) {
            // report IStartupMetrics as telemetry
            /* __GDPR__
                "startupTimeVaried" : {
                    "owner": "jrieken",
                    "${include}": [
                        "${IStartupMetrics}"
                    ]
                }
            */
            this._telemetryService.publicLog('startupTimeVaried', metrics);
        }
        _shouldReportPerfMarks() {
            return this._rndValueShouldSendTelemetry;
        }
        _reportPerformanceMarks(source, marks) {
            if (!this._shouldReportPerfMarks()) {
                // the `startup.timer.mark` event is send very often. In order to save resources
                // we let some of our instances/sessions send this event
                return;
            }
            for (const mark of marks) {
                this._telemetryService.publicLog2('startup.timer.mark', {
                    source,
                    name: new telemetryUtils_1.TelemetryTrustedValue(mark.name),
                    startTime: mark.startTime
                });
            }
        }
        async _computeStartupMetrics() {
            const initialStartup = this._isInitialStartup();
            let startMark;
            if (platform_1.isWeb) {
                startMark = 'code/timeOrigin';
            }
            else {
                startMark = initialStartup ? 'code/didStartMain' : 'code/willOpenNewWindow';
            }
            const activeViewlet = this._paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            const activePanel = this._paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
            const info = {
                version: 2,
                ellapsed: this._marks.getDuration(startMark, 'code/didStartWorkbench'),
                // reflections
                isLatestVersion: Boolean(await this._updateService.isLatestVersion()),
                didUseCachedData: this._didUseCachedData(),
                windowKind: this._lifecycleService.startupKind,
                windowCount: await this._getWindowCount(),
                viewletId: activeViewlet?.getId(),
                editorIds: this._editorService.visibleEditors.map(input => input.typeId),
                panelId: activePanel ? activePanel.getId() : undefined,
                // timers
                timers: {
                    ellapsedAppReady: initialStartup ? this._marks.getDuration('code/didStartMain', 'code/mainAppReady') : undefined,
                    ellapsedNlsGeneration: initialStartup ? this._marks.getDuration('code/willGenerateNls', 'code/didGenerateNls') : undefined,
                    ellapsedLoadMainBundle: initialStartup ? this._marks.getDuration('code/willLoadMainBundle', 'code/didLoadMainBundle') : undefined,
                    ellapsedCrashReporter: initialStartup ? this._marks.getDuration('code/willStartCrashReporter', 'code/didStartCrashReporter') : undefined,
                    ellapsedMainServer: initialStartup ? this._marks.getDuration('code/willStartMainServer', 'code/didStartMainServer') : undefined,
                    ellapsedWindowCreate: initialStartup ? this._marks.getDuration('code/willCreateCodeWindow', 'code/didCreateCodeWindow') : undefined,
                    ellapsedWindowRestoreState: initialStartup ? this._marks.getDuration('code/willRestoreCodeWindowState', 'code/didRestoreCodeWindowState') : undefined,
                    ellapsedBrowserWindowCreate: initialStartup ? this._marks.getDuration('code/willCreateCodeBrowserWindow', 'code/didCreateCodeBrowserWindow') : undefined,
                    ellapsedWindowMaximize: initialStartup ? this._marks.getDuration('code/willMaximizeCodeWindow', 'code/didMaximizeCodeWindow') : undefined,
                    ellapsedWindowLoad: initialStartup ? this._marks.getDuration('code/mainAppReady', 'code/willOpenNewWindow') : undefined,
                    ellapsedWindowLoadToRequire: this._marks.getDuration('code/willOpenNewWindow', 'code/willLoadWorkbenchMain'),
                    ellapsedRequire: this._marks.getDuration('code/willLoadWorkbenchMain', 'code/didLoadWorkbenchMain'),
                    ellapsedWaitForWindowConfig: this._marks.getDuration('code/willWaitForWindowConfig', 'code/didWaitForWindowConfig'),
                    ellapsedStorageInit: this._marks.getDuration('code/willInitStorage', 'code/didInitStorage'),
                    ellapsedSharedProcesConnected: this._marks.getDuration('code/willConnectSharedProcess', 'code/didConnectSharedProcess'),
                    ellapsedWorkspaceServiceInit: this._marks.getDuration('code/willInitWorkspaceService', 'code/didInitWorkspaceService'),
                    ellapsedRequiredUserDataInit: this._marks.getDuration('code/willInitRequiredUserData', 'code/didInitRequiredUserData'),
                    ellapsedOtherUserDataInit: this._marks.getDuration('code/willInitOtherUserData', 'code/didInitOtherUserData'),
                    ellapsedExtensions: this._marks.getDuration('code/willLoadExtensions', 'code/didLoadExtensions'),
                    ellapsedEditorRestore: this._marks.getDuration('code/willRestoreEditors', 'code/didRestoreEditors'),
                    ellapsedViewletRestore: this._marks.getDuration('code/willRestoreViewlet', 'code/didRestoreViewlet'),
                    ellapsedPanelRestore: this._marks.getDuration('code/willRestorePanel', 'code/didRestorePanel'),
                    ellapsedWorkbench: this._marks.getDuration('code/willStartWorkbench', 'code/didStartWorkbench'),
                    ellapsedExtensionsReady: this._marks.getDuration(startMark, 'code/didLoadExtensions'),
                    ellapsedRenderer: this._marks.getDuration('code/didStartRenderer', 'code/didStartWorkbench')
                },
                // system info
                platform: undefined,
                release: undefined,
                arch: undefined,
                totalmem: undefined,
                freemem: undefined,
                meminfo: undefined,
                cpus: undefined,
                loadavg: undefined,
                isVMLikelyhood: undefined,
                initialStartup,
                hasAccessibilitySupport: this._accessibilityService.isScreenReaderOptimized(),
                emptyWorkbench: this._contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */
            };
            await this._extendStartupInfo(info);
            return info;
        }
    };
    exports.AbstractTimerService = AbstractTimerService;
    exports.AbstractTimerService = AbstractTimerService = __decorate([
        __param(0, lifecycle_1.ILifecycleService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, extensions_1.IExtensionService),
        __param(3, update_1.IUpdateService),
        __param(4, panecomposite_1.IPaneCompositePartService),
        __param(5, editorService_1.IEditorService),
        __param(6, accessibility_1.IAccessibilityService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, layoutService_1.IWorkbenchLayoutService)
    ], AbstractTimerService);
    class TimerService extends AbstractTimerService {
        _isInitialStartup() {
            return false;
        }
        _didUseCachedData() {
            return false;
        }
        async _getWindowCount() {
            return 1;
        }
        async _extendStartupInfo(info) {
            info.isVMLikelyhood = 0;
            info.isARM64Emulated = false;
            info.platform = navigator.userAgent;
            info.release = navigator.appVersion;
        }
    }
    exports.TimerService = TimerService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RpbWVyL2Jyb3dzZXIvdGltZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9ibkYsUUFBQSxhQUFhLEdBQUcsSUFBQSwrQkFBZSxFQUFnQixjQUFjLENBQUMsQ0FBQztJQUc1RSxNQUFNLFNBQVM7UUFBZjtZQUVrQixhQUFRLEdBQXVDLEVBQUUsQ0FBQztRQStCcEUsQ0FBQztRQTdCQSxRQUFRLENBQUMsTUFBYyxFQUFFLE9BQStCO1lBQ3ZELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUVELFdBQVcsQ0FBQyxJQUFZLEVBQUUsRUFBVTtZQUNuQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ2YsT0FBTyxDQUFDLENBQUM7YUFDVDtZQUNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixPQUFPLENBQUMsQ0FBQzthQUNUO1lBQ0QsT0FBTyxPQUFPLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7UUFDaEQsQ0FBQztRQUVPLFVBQVUsQ0FBQyxJQUFZO1lBQzlCLEtBQUssTUFBTSxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDdEMsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFB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