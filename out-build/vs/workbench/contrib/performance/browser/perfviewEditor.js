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
define(["require", "exports", "vs/nls!vs/workbench/contrib/performance/browser/perfviewEditor", "vs/base/common/uri", "vs/workbench/common/editor/textResourceEditorInput", "vs/editor/common/services/resolverService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/editor/common/languages/language", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/model", "vs/workbench/services/timer/browser/timerService", "vs/workbench/services/extensions/common/extensions", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/workbench/contrib/codeEditor/browser/toggleWordWrap", "vs/base/common/amd", "vs/platform/product/common/productService", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/base/common/platform", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/contrib/terminal/browser/terminal"], function (require, exports, nls_1, uri_1, textResourceEditorInput_1, resolverService_1, lifecycle_1, language_1, instantiation_1, model_1, timerService_1, extensions_1, lifecycle_2, codeEditorService_1, toggleWordWrap_1, amd_1, productService_1, textfiles_1, editorService_1, files_1, label_1, platform_1, filesConfigurationService_1, terminal_1) {
    "use strict";
    var $hEb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hEb = exports.$gEb = void 0;
    let $gEb = class $gEb {
        constructor(instaService, textModelResolverService) {
            this.a = textModelResolverService.registerTextModelContentProvider('perf', instaService.createInstance(PerfModelContentProvider));
        }
        dispose() {
            this.a.dispose();
        }
    };
    exports.$gEb = $gEb;
    exports.$gEb = $gEb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, resolverService_1.$uA)
    ], $gEb);
    let $hEb = class $hEb extends textResourceEditorInput_1.$7eb {
        static { $hEb_1 = this; }
        static { this.Id = 'PerfviewInput'; }
        static { this.Uri = uri_1.URI.from({ scheme: 'perf', path: 'Startup Performance' }); }
        get typeId() {
            return $hEb_1.Id;
        }
        constructor(textModelResolverService, textFileService, editorService, fileService, labelService, filesConfigurationService) {
            super($hEb_1.Uri, (0, nls_1.localize)(0, null), undefined, undefined, undefined, textModelResolverService, textFileService, editorService, fileService, labelService, filesConfigurationService);
        }
    };
    exports.$hEb = $hEb;
    exports.$hEb = $hEb = $hEb_1 = __decorate([
        __param(0, resolverService_1.$uA),
        __param(1, textfiles_1.$JD),
        __param(2, editorService_1.$9C),
        __param(3, files_1.$6j),
        __param(4, label_1.$Vz),
        __param(5, filesConfigurationService_1.$yD)
    ], $hEb);
    let PerfModelContentProvider = class PerfModelContentProvider {
        constructor(c, d, f, g, h, i, j, k) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.b = [];
        }
        provideTextContent(resource) {
            if (!this.a || this.a.isDisposed()) {
                (0, lifecycle_2.$fc)(this.b);
                const langId = this.d.createById('markdown');
                this.a = this.c.getModel(resource) || this.c.createModel('Loading...', langId, resource);
                this.b.push(langId.onDidChange(e => {
                    this.a?.setLanguage(e);
                }));
                this.b.push(this.i.onDidChangeExtensionsStatus(this.l, this));
                (0, toggleWordWrap_1.$Nnb)(this.a, { wordWrapOverride: 'off' }, this.f);
            }
            this.l();
            return Promise.resolve(this.a);
        }
        l() {
            Promise.all([
                this.h.whenReady(),
                this.g.when(4 /* LifecyclePhase.Eventually */),
                this.i.whenInstalledExtensionsRegistered(),
                this.k.whenConnected
            ]).then(() => {
                if (this.a && !this.a.isDisposed()) {
                    const stats = amd_1.$S.get();
                    const md = new MarkdownBuilder();
                    this.m(md);
                    md.blank();
                    this.n(md, stats);
                    md.blank();
                    this.o(md);
                    md.blank();
                    this.p('Terminal Stats', md, this.h.getPerformanceMarks().find(e => e[0] === 'renderer')?.[1].filter(e => e.name.startsWith('code/terminal/')));
                    md.blank();
                    this.q(md);
                    if (!amd_1.$R) {
                        md.blank();
                        this.r(md, stats);
                        md.blank();
                        this.s(md);
                    }
                    md.blank();
                    this.t(md);
                    this.a.setValue(md.value);
                }
            });
        }
        m(md) {
            const metrics = this.h.startupMetrics;
            md.heading(2, 'System Info');
            md.li(`${this.j.nameShort}: ${this.j.version} (${this.j.commit || '0000000'})`);
            md.li(`OS: ${metrics.platform}(${metrics.release})`);
            if (metrics.cpus) {
                md.li(`CPUs: ${metrics.cpus.model}(${metrics.cpus.count} x ${metrics.cpus.speed})`);
            }
            if (typeof metrics.totalmem === 'number' && typeof metrics.freemem === 'number') {
                md.li(`Memory(System): ${(metrics.totalmem / (files_1.$Ak.GB)).toFixed(2)} GB(${(metrics.freemem / (files_1.$Ak.GB)).toFixed(2)}GB free)`);
            }
            if (metrics.meminfo) {
                md.li(`Memory(Process): ${(metrics.meminfo.workingSetSize / files_1.$Ak.KB).toFixed(2)} MB working set(${(metrics.meminfo.privateBytes / files_1.$Ak.KB).toFixed(2)}MB private, ${(metrics.meminfo.sharedBytes / files_1.$Ak.KB).toFixed(2)}MB shared)`);
            }
            md.li(`VM(likelihood): ${metrics.isVMLikelyhood}%`);
            md.li(`Initial Startup: ${metrics.initialStartup}`);
            md.li(`Has ${metrics.windowCount - 1} other windows`);
            md.li(`Screen Reader Active: ${metrics.hasAccessibilitySupport}`);
            md.li(`Empty Workspace: ${metrics.emptyWorkbench}`);
        }
        n(md, stats) {
            const metrics = this.h.startupMetrics;
            const table = [];
            table.push(['start => app.isReady', metrics.timers.ellapsedAppReady, '[main]', `initial startup: ${metrics.initialStartup}`]);
            table.push(['nls:start => nls:end', metrics.timers.ellapsedNlsGeneration, '[main]', `initial startup: ${metrics.initialStartup}`]);
            table.push(['require(main.bundle.js)', metrics.timers.ellapsedLoadMainBundle, '[main]', `initial startup: ${metrics.initialStartup}`]);
            table.push(['start crash reporter', metrics.timers.ellapsedCrashReporter, '[main]', `initial startup: ${metrics.initialStartup}`]);
            table.push(['serve main IPC handle', metrics.timers.ellapsedMainServer, '[main]', `initial startup: ${metrics.initialStartup}`]);
            table.push(['create window', metrics.timers.ellapsedWindowCreate, '[main]', `initial startup: ${metrics.initialStartup}, ${metrics.initialStartup ? `state: ${metrics.timers.ellapsedWindowRestoreState}ms, widget: ${metrics.timers.ellapsedBrowserWindowCreate}ms, show: ${metrics.timers.ellapsedWindowMaximize}ms` : ''}`]);
            table.push(['app.isReady => window.loadUrl()', metrics.timers.ellapsedWindowLoad, '[main]', `initial startup: ${metrics.initialStartup}`]);
            table.push(['window.loadUrl() => begin to require(workbench.desktop.main.js)', metrics.timers.ellapsedWindowLoadToRequire, '[main->renderer]', (0, lifecycle_1.$8y)(metrics.windowKind)]);
            table.push(['require(workbench.desktop.main.js)', metrics.timers.ellapsedRequire, '[renderer]', `cached data: ${(metrics.didUseCachedData ? 'YES' : 'NO')}${stats ? `, node_modules took ${stats.nodeRequireTotal}ms` : ''}`]);
            table.push(['wait for window config', metrics.timers.ellapsedWaitForWindowConfig, '[renderer]', undefined]);
            table.push(['init storage (global & workspace)', metrics.timers.ellapsedStorageInit, '[renderer]', undefined]);
            table.push(['init workspace service', metrics.timers.ellapsedWorkspaceServiceInit, '[renderer]', undefined]);
            if (platform_1.$o) {
                table.push(['init settings and global state from settings sync service', metrics.timers.ellapsedRequiredUserDataInit, '[renderer]', undefined]);
                table.push(['init keybindings, snippets & extensions from settings sync service', metrics.timers.ellapsedOtherUserDataInit, '[renderer]', undefined]);
            }
            table.push(['register extensions & spawn extension host', metrics.timers.ellapsedExtensions, '[renderer]', undefined]);
            table.push(['restore viewlet', metrics.timers.ellapsedViewletRestore, '[renderer]', metrics.viewletId]);
            table.push(['restore panel', metrics.timers.ellapsedPanelRestore, '[renderer]', metrics.panelId]);
            table.push(['restore & resolve visible editors', metrics.timers.ellapsedEditorRestore, '[renderer]', `${metrics.editorIds.length}: ${metrics.editorIds.join(', ')}`]);
            table.push(['overall workbench load', metrics.timers.ellapsedWorkbench, '[renderer]', undefined]);
            table.push(['workbench ready', metrics.ellapsed, '[main->renderer]', undefined]);
            table.push(['renderer ready', metrics.timers.ellapsedRenderer, '[renderer]', undefined]);
            table.push(['shared process connection ready', metrics.timers.ellapsedSharedProcesConnected, '[renderer->sharedprocess]', undefined]);
            table.push(['extensions registered', metrics.timers.ellapsedExtensionsReady, '[renderer]', undefined]);
            md.heading(2, 'Performance Marks');
            md.table(['What', 'Duration', 'Process', 'Info'], table);
        }
        o(md) {
            const eager = [];
            const normal = [];
            const extensionsStatus = this.i.getExtensionsStatus();
            for (const id in extensionsStatus) {
                const { activationTimes: times } = extensionsStatus[id];
                if (!times) {
                    continue;
                }
                if (times.activationReason.startup) {
                    eager.push([id, times.activationReason.startup, times.codeLoadingTime, times.activateCallTime, times.activateResolvedTime, times.activationReason.activationEvent, times.activationReason.extensionId.value]);
                }
                else {
                    normal.push([id, times.activationReason.startup, times.codeLoadingTime, times.activateCallTime, times.activateResolvedTime, times.activationReason.activationEvent, times.activationReason.extensionId.value]);
                }
            }
            const table = eager.concat(normal);
            if (table.length > 0) {
                md.heading(2, 'Extension Activation Stats');
                md.table(['Extension', 'Eager', 'Load Code', 'Call Activate', 'Finish Activate', 'Event', 'By'], table);
            }
        }
        p(name, md, marks) {
            if (!marks) {
                return;
            }
            const table = [];
            let lastStartTime = -1;
            let total = 0;
            for (const { name, startTime } of marks) {
                const delta = lastStartTime !== -1 ? startTime - lastStartTime : 0;
                total += delta;
                table.push([name, Math.round(startTime), Math.round(delta), Math.round(total)]);
                lastStartTime = startTime;
            }
            md.heading(2, name);
            md.table(['Name', 'Timestamp', 'Delta', 'Total'], table);
        }
        q(md) {
            for (const [source, marks] of this.h.getPerformanceMarks()) {
                md.heading(2, `Raw Perf Marks: ${source}`);
                md.value += '```\n';
                md.value += `Name\tTimestamp\tDelta\tTotal\n`;
                let lastStartTime = -1;
                let total = 0;
                for (const { name, startTime } of marks) {
                    const delta = lastStartTime !== -1 ? startTime - lastStartTime : 0;
                    total += delta;
                    md.value += `${name}\t${startTime}\t${delta}\t${total}\n`;
                    lastStartTime = startTime;
                }
                md.value += '```\n';
            }
        }
        r(md, stats) {
            md.heading(2, 'Loader Stats');
            md.heading(3, 'Load AMD-module');
            md.table(['Module', 'Duration'], stats.amdLoad);
            md.blank();
            md.heading(3, 'Load commonjs-module');
            md.table(['Module', 'Duration'], stats.nodeRequire);
            md.blank();
            md.heading(3, 'Invoke AMD-module factory');
            md.table(['Module', 'Duration'], stats.amdInvoke);
            md.blank();
            md.heading(3, 'Invoke commonjs-module');
            md.table(['Module', 'Duration'], stats.nodeEval);
        }
        s(md) {
            const map = new Map();
            map.set(63 /* LoaderEventType.CachedDataCreated */, []);
            map.set(60 /* LoaderEventType.CachedDataFound */, []);
            map.set(61 /* LoaderEventType.CachedDataMissed */, []);
            map.set(62 /* LoaderEventType.CachedDataRejected */, []);
            if (typeof require.getStats === 'function') {
                for (const stat of require.getStats()) {
                    if (map.has(stat.type)) {
                        map.get(stat.type).push(stat.detail);
                    }
                }
            }
            const printLists = (arr) => {
                if (arr) {
                    arr.sort();
                    for (const e of arr) {
                        md.li(`${e}`);
                    }
                    md.blank();
                }
            };
            md.heading(2, 'Node Cached Data Stats');
            md.blank();
            md.heading(3, 'cached data used');
            printLists(map.get(60 /* LoaderEventType.CachedDataFound */));
            md.heading(3, 'cached data missed');
            printLists(map.get(61 /* LoaderEventType.CachedDataMissed */));
            md.heading(3, 'cached data rejected');
            printLists(map.get(62 /* LoaderEventType.CachedDataRejected */));
            md.heading(3, 'cached data created (lazy, might need refreshes)');
            printLists(map.get(63 /* LoaderEventType.CachedDataCreated */));
        }
        t(md) {
            const stats = performance.getEntriesByType('resource').map(entry => {
                return [entry.name, entry.duration];
            });
            if (!stats.length) {
                return;
            }
            md.heading(2, 'Resource Timing Stats');
            md.table(['Name', 'Duration'], stats);
        }
    };
    PerfModelContentProvider = __decorate([
        __param(0, model_1.$yA),
        __param(1, language_1.$ct),
        __param(2, codeEditorService_1.$nV),
        __param(3, lifecycle_1.$7y),
        __param(4, timerService_1.$kkb),
        __param(5, extensions_1.$MF),
        __param(6, productService_1.$kj),
        __param(7, terminal_1.$Mib)
    ], PerfModelContentProvider);
    class MarkdownBuilder {
        constructor() {
            this.value = '';
        }
        heading(level, value) {
            this.value += `${'#'.repeat(level)} ${value}\n\n`;
            return this;
        }
        blank() {
            this.value += '\n';
            return this;
        }
        li(value) {
            this.value += `* ${value}\n`;
            return this;
        }
        table(header, rows) {
            this.value += amd_1.$S.toMarkdownTable(header, rows);
        }
    }
});
//# sourceMappingURL=perfviewEditor.js.map