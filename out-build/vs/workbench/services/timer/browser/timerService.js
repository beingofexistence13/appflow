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
    exports.$mkb = exports.$lkb = exports.$kkb = void 0;
    exports.$kkb = (0, instantiation_1.$Bh)('timerService');
    class PerfMarks {
        constructor() {
            this.a = [];
        }
        setMarks(source, entries) {
            this.a.push([source, entries]);
        }
        getDuration(from, to) {
            const fromEntry = this.b(from);
            if (!fromEntry) {
                return 0;
            }
            const toEntry = this.b(to);
            if (!toEntry) {
                return 0;
            }
            return toEntry.startTime - fromEntry.startTime;
        }
        b(name) {
            for (const [, marks] of this.a) {
                for (let i = marks.length - 1; i >= 0; i--) {
                    if (marks[i].name === name) {
                        return marks[i];
                    }
                }
            }
        }
        getEntries() {
            return this.a.slice(0);
        }
    }
    let $lkb = class $lkb {
        constructor(f, g, h, j, k, l, m, o, layoutService) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.o = o;
            this.a = new async_1.$Fg();
            this.b = new PerfMarks();
            this.c = Math.random() < .05; // 5% of users
            Promise.all([
                this.h.whenInstalledExtensionsRegistered(),
                f.when(3 /* LifecyclePhase.Restored */),
                layoutService.whenRestored,
                Promise.all(Array.from(platform_2.$8m.as(terminal_1.$Xq.Backend).backends.values()).map(e => e.whenReady))
            ]).then(() => {
                // set perf mark from renderer
                this.setPerformanceMarks('renderer', perf.getMarks());
                return this.s();
            }).then(metrics => {
                this.d = metrics;
                this.p(metrics);
                this.a.open();
            });
            this.perfBaseline = this.a.wait()
                .then(() => this.f.when(4 /* LifecyclePhase.Eventually */))
                .then(() => (0, async_1.$Hg)(this.d.timers.ellapsedRequire))
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
                const worker = (0, defaultWorkerFactory_1.$UQ)(blobUrl, { name: 'perfBaseline' });
                return new Promise(resolve => {
                    worker.onmessage = e => resolve(e.data.value);
                }).finally(() => {
                    worker.terminate();
                    URL.revokeObjectURL(blobUrl);
                });
            });
        }
        whenReady() {
            return this.a.wait();
        }
        get startupMetrics() {
            if (!this.d) {
                throw new Error('illegal state, MUST NOT access startupMetrics before whenReady has resolved');
            }
            return this.d;
        }
        setPerformanceMarks(source, marks) {
            // Perf marks are a shared resource because anyone can generate them
            // and because of that we only accept marks that start with 'code/'
            const codeMarks = marks.filter(mark => mark.name.startsWith('code/'));
            this.b.setMarks(source, codeMarks);
            this.r(source, codeMarks);
        }
        getPerformanceMarks() {
            return this.b.getEntries();
        }
        getDuration(from, to) {
            return this.b.getDuration(from, to);
        }
        p(metrics) {
            // report IStartupMetrics as telemetry
            /* __GDPR__
                "startupTimeVaried" : {
                    "owner": "jrieken",
                    "${include}": [
                        "${IStartupMetrics}"
                    ]
                }
            */
            this.o.publicLog('startupTimeVaried', metrics);
        }
        q() {
            return this.c;
        }
        r(source, marks) {
            if (!this.q()) {
                // the `startup.timer.mark` event is send very often. In order to save resources
                // we let some of our instances/sessions send this event
                return;
            }
            for (const mark of marks) {
                this.o.publicLog2('startup.timer.mark', {
                    source,
                    name: new telemetryUtils_1.$_n(mark.name),
                    startTime: mark.startTime
                });
            }
        }
        async s() {
            const initialStartup = this.t();
            let startMark;
            if (platform_1.$o) {
                startMark = 'code/timeOrigin';
            }
            else {
                startMark = initialStartup ? 'code/didStartMain' : 'code/willOpenNewWindow';
            }
            const activeViewlet = this.k.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            const activePanel = this.k.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
            const info = {
                version: 2,
                ellapsed: this.b.getDuration(startMark, 'code/didStartWorkbench'),
                // reflections
                isLatestVersion: Boolean(await this.j.isLatestVersion()),
                didUseCachedData: this.u(),
                windowKind: this.f.startupKind,
                windowCount: await this.v(),
                viewletId: activeViewlet?.getId(),
                editorIds: this.l.visibleEditors.map(input => input.typeId),
                panelId: activePanel ? activePanel.getId() : undefined,
                // timers
                timers: {
                    ellapsedAppReady: initialStartup ? this.b.getDuration('code/didStartMain', 'code/mainAppReady') : undefined,
                    ellapsedNlsGeneration: initialStartup ? this.b.getDuration('code/willGenerateNls', 'code/didGenerateNls') : undefined,
                    ellapsedLoadMainBundle: initialStartup ? this.b.getDuration('code/willLoadMainBundle', 'code/didLoadMainBundle') : undefined,
                    ellapsedCrashReporter: initialStartup ? this.b.getDuration('code/willStartCrashReporter', 'code/didStartCrashReporter') : undefined,
                    ellapsedMainServer: initialStartup ? this.b.getDuration('code/willStartMainServer', 'code/didStartMainServer') : undefined,
                    ellapsedWindowCreate: initialStartup ? this.b.getDuration('code/willCreateCodeWindow', 'code/didCreateCodeWindow') : undefined,
                    ellapsedWindowRestoreState: initialStartup ? this.b.getDuration('code/willRestoreCodeWindowState', 'code/didRestoreCodeWindowState') : undefined,
                    ellapsedBrowserWindowCreate: initialStartup ? this.b.getDuration('code/willCreateCodeBrowserWindow', 'code/didCreateCodeBrowserWindow') : undefined,
                    ellapsedWindowMaximize: initialStartup ? this.b.getDuration('code/willMaximizeCodeWindow', 'code/didMaximizeCodeWindow') : undefined,
                    ellapsedWindowLoad: initialStartup ? this.b.getDuration('code/mainAppReady', 'code/willOpenNewWindow') : undefined,
                    ellapsedWindowLoadToRequire: this.b.getDuration('code/willOpenNewWindow', 'code/willLoadWorkbenchMain'),
                    ellapsedRequire: this.b.getDuration('code/willLoadWorkbenchMain', 'code/didLoadWorkbenchMain'),
                    ellapsedWaitForWindowConfig: this.b.getDuration('code/willWaitForWindowConfig', 'code/didWaitForWindowConfig'),
                    ellapsedStorageInit: this.b.getDuration('code/willInitStorage', 'code/didInitStorage'),
                    ellapsedSharedProcesConnected: this.b.getDuration('code/willConnectSharedProcess', 'code/didConnectSharedProcess'),
                    ellapsedWorkspaceServiceInit: this.b.getDuration('code/willInitWorkspaceService', 'code/didInitWorkspaceService'),
                    ellapsedRequiredUserDataInit: this.b.getDuration('code/willInitRequiredUserData', 'code/didInitRequiredUserData'),
                    ellapsedOtherUserDataInit: this.b.getDuration('code/willInitOtherUserData', 'code/didInitOtherUserData'),
                    ellapsedExtensions: this.b.getDuration('code/willLoadExtensions', 'code/didLoadExtensions'),
                    ellapsedEditorRestore: this.b.getDuration('code/willRestoreEditors', 'code/didRestoreEditors'),
                    ellapsedViewletRestore: this.b.getDuration('code/willRestoreViewlet', 'code/didRestoreViewlet'),
                    ellapsedPanelRestore: this.b.getDuration('code/willRestorePanel', 'code/didRestorePanel'),
                    ellapsedWorkbench: this.b.getDuration('code/willStartWorkbench', 'code/didStartWorkbench'),
                    ellapsedExtensionsReady: this.b.getDuration(startMark, 'code/didLoadExtensions'),
                    ellapsedRenderer: this.b.getDuration('code/didStartRenderer', 'code/didStartWorkbench')
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
                hasAccessibilitySupport: this.m.isScreenReaderOptimized(),
                emptyWorkbench: this.g.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */
            };
            await this.w(info);
            return info;
        }
    };
    exports.$lkb = $lkb;
    exports.$lkb = $lkb = __decorate([
        __param(0, lifecycle_1.$7y),
        __param(1, workspace_1.$Kh),
        __param(2, extensions_1.$MF),
        __param(3, update_1.$UT),
        __param(4, panecomposite_1.$Yeb),
        __param(5, editorService_1.$9C),
        __param(6, accessibility_1.$1r),
        __param(7, telemetry_1.$9k),
        __param(8, layoutService_1.$Meb)
    ], $lkb);
    class $mkb extends $lkb {
        t() {
            return false;
        }
        u() {
            return false;
        }
        async v() {
            return 1;
        }
        async w(info) {
            info.isVMLikelyhood = 0;
            info.isARM64Emulated = false;
            info.platform = navigator.userAgent;
            info.release = navigator.appVersion;
        }
    }
    exports.$mkb = $mkb;
});
//# sourceMappingURL=timerService.js.map