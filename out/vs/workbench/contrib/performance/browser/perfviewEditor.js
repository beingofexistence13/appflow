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
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/workbench/common/editor/textResourceEditorInput", "vs/editor/common/services/resolverService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/editor/common/languages/language", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/model", "vs/workbench/services/timer/browser/timerService", "vs/workbench/services/extensions/common/extensions", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/workbench/contrib/codeEditor/browser/toggleWordWrap", "vs/base/common/amd", "vs/platform/product/common/productService", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/base/common/platform", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/contrib/terminal/browser/terminal"], function (require, exports, nls_1, uri_1, textResourceEditorInput_1, resolverService_1, lifecycle_1, language_1, instantiation_1, model_1, timerService_1, extensions_1, lifecycle_2, codeEditorService_1, toggleWordWrap_1, amd_1, productService_1, textfiles_1, editorService_1, files_1, label_1, platform_1, filesConfigurationService_1, terminal_1) {
    "use strict";
    var PerfviewInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PerfviewInput = exports.PerfviewContrib = void 0;
    let PerfviewContrib = class PerfviewContrib {
        constructor(instaService, textModelResolverService) {
            this._registration = textModelResolverService.registerTextModelContentProvider('perf', instaService.createInstance(PerfModelContentProvider));
        }
        dispose() {
            this._registration.dispose();
        }
    };
    exports.PerfviewContrib = PerfviewContrib;
    exports.PerfviewContrib = PerfviewContrib = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, resolverService_1.ITextModelService)
    ], PerfviewContrib);
    let PerfviewInput = class PerfviewInput extends textResourceEditorInput_1.TextResourceEditorInput {
        static { PerfviewInput_1 = this; }
        static { this.Id = 'PerfviewInput'; }
        static { this.Uri = uri_1.URI.from({ scheme: 'perf', path: 'Startup Performance' }); }
        get typeId() {
            return PerfviewInput_1.Id;
        }
        constructor(textModelResolverService, textFileService, editorService, fileService, labelService, filesConfigurationService) {
            super(PerfviewInput_1.Uri, (0, nls_1.localize)('name', "Startup Performance"), undefined, undefined, undefined, textModelResolverService, textFileService, editorService, fileService, labelService, filesConfigurationService);
        }
    };
    exports.PerfviewInput = PerfviewInput;
    exports.PerfviewInput = PerfviewInput = PerfviewInput_1 = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, textfiles_1.ITextFileService),
        __param(2, editorService_1.IEditorService),
        __param(3, files_1.IFileService),
        __param(4, label_1.ILabelService),
        __param(5, filesConfigurationService_1.IFilesConfigurationService)
    ], PerfviewInput);
    let PerfModelContentProvider = class PerfModelContentProvider {
        constructor(_modelService, _languageService, _editorService, _lifecycleService, _timerService, _extensionService, _productService, _terminalService) {
            this._modelService = _modelService;
            this._languageService = _languageService;
            this._editorService = _editorService;
            this._lifecycleService = _lifecycleService;
            this._timerService = _timerService;
            this._extensionService = _extensionService;
            this._productService = _productService;
            this._terminalService = _terminalService;
            this._modelDisposables = [];
        }
        provideTextContent(resource) {
            if (!this._model || this._model.isDisposed()) {
                (0, lifecycle_2.dispose)(this._modelDisposables);
                const langId = this._languageService.createById('markdown');
                this._model = this._modelService.getModel(resource) || this._modelService.createModel('Loading...', langId, resource);
                this._modelDisposables.push(langId.onDidChange(e => {
                    this._model?.setLanguage(e);
                }));
                this._modelDisposables.push(this._extensionService.onDidChangeExtensionsStatus(this._updateModel, this));
                (0, toggleWordWrap_1.writeTransientState)(this._model, { wordWrapOverride: 'off' }, this._editorService);
            }
            this._updateModel();
            return Promise.resolve(this._model);
        }
        _updateModel() {
            Promise.all([
                this._timerService.whenReady(),
                this._lifecycleService.when(4 /* LifecyclePhase.Eventually */),
                this._extensionService.whenInstalledExtensionsRegistered(),
                this._terminalService.whenConnected
            ]).then(() => {
                if (this._model && !this._model.isDisposed()) {
                    const stats = amd_1.LoaderStats.get();
                    const md = new MarkdownBuilder();
                    this._addSummary(md);
                    md.blank();
                    this._addSummaryTable(md, stats);
                    md.blank();
                    this._addExtensionsTable(md);
                    md.blank();
                    this._addPerfMarksTable('Terminal Stats', md, this._timerService.getPerformanceMarks().find(e => e[0] === 'renderer')?.[1].filter(e => e.name.startsWith('code/terminal/')));
                    md.blank();
                    this._addRawPerfMarks(md);
                    if (!amd_1.isESM) {
                        md.blank();
                        this._addLoaderStats(md, stats);
                        md.blank();
                        this._addCachedDataStats(md);
                    }
                    md.blank();
                    this._addResourceTimingStats(md);
                    this._model.setValue(md.value);
                }
            });
        }
        _addSummary(md) {
            const metrics = this._timerService.startupMetrics;
            md.heading(2, 'System Info');
            md.li(`${this._productService.nameShort}: ${this._productService.version} (${this._productService.commit || '0000000'})`);
            md.li(`OS: ${metrics.platform}(${metrics.release})`);
            if (metrics.cpus) {
                md.li(`CPUs: ${metrics.cpus.model}(${metrics.cpus.count} x ${metrics.cpus.speed})`);
            }
            if (typeof metrics.totalmem === 'number' && typeof metrics.freemem === 'number') {
                md.li(`Memory(System): ${(metrics.totalmem / (files_1.ByteSize.GB)).toFixed(2)} GB(${(metrics.freemem / (files_1.ByteSize.GB)).toFixed(2)}GB free)`);
            }
            if (metrics.meminfo) {
                md.li(`Memory(Process): ${(metrics.meminfo.workingSetSize / files_1.ByteSize.KB).toFixed(2)} MB working set(${(metrics.meminfo.privateBytes / files_1.ByteSize.KB).toFixed(2)}MB private, ${(metrics.meminfo.sharedBytes / files_1.ByteSize.KB).toFixed(2)}MB shared)`);
            }
            md.li(`VM(likelihood): ${metrics.isVMLikelyhood}%`);
            md.li(`Initial Startup: ${metrics.initialStartup}`);
            md.li(`Has ${metrics.windowCount - 1} other windows`);
            md.li(`Screen Reader Active: ${metrics.hasAccessibilitySupport}`);
            md.li(`Empty Workspace: ${metrics.emptyWorkbench}`);
        }
        _addSummaryTable(md, stats) {
            const metrics = this._timerService.startupMetrics;
            const table = [];
            table.push(['start => app.isReady', metrics.timers.ellapsedAppReady, '[main]', `initial startup: ${metrics.initialStartup}`]);
            table.push(['nls:start => nls:end', metrics.timers.ellapsedNlsGeneration, '[main]', `initial startup: ${metrics.initialStartup}`]);
            table.push(['require(main.bundle.js)', metrics.timers.ellapsedLoadMainBundle, '[main]', `initial startup: ${metrics.initialStartup}`]);
            table.push(['start crash reporter', metrics.timers.ellapsedCrashReporter, '[main]', `initial startup: ${metrics.initialStartup}`]);
            table.push(['serve main IPC handle', metrics.timers.ellapsedMainServer, '[main]', `initial startup: ${metrics.initialStartup}`]);
            table.push(['create window', metrics.timers.ellapsedWindowCreate, '[main]', `initial startup: ${metrics.initialStartup}, ${metrics.initialStartup ? `state: ${metrics.timers.ellapsedWindowRestoreState}ms, widget: ${metrics.timers.ellapsedBrowserWindowCreate}ms, show: ${metrics.timers.ellapsedWindowMaximize}ms` : ''}`]);
            table.push(['app.isReady => window.loadUrl()', metrics.timers.ellapsedWindowLoad, '[main]', `initial startup: ${metrics.initialStartup}`]);
            table.push(['window.loadUrl() => begin to require(workbench.desktop.main.js)', metrics.timers.ellapsedWindowLoadToRequire, '[main->renderer]', (0, lifecycle_1.StartupKindToString)(metrics.windowKind)]);
            table.push(['require(workbench.desktop.main.js)', metrics.timers.ellapsedRequire, '[renderer]', `cached data: ${(metrics.didUseCachedData ? 'YES' : 'NO')}${stats ? `, node_modules took ${stats.nodeRequireTotal}ms` : ''}`]);
            table.push(['wait for window config', metrics.timers.ellapsedWaitForWindowConfig, '[renderer]', undefined]);
            table.push(['init storage (global & workspace)', metrics.timers.ellapsedStorageInit, '[renderer]', undefined]);
            table.push(['init workspace service', metrics.timers.ellapsedWorkspaceServiceInit, '[renderer]', undefined]);
            if (platform_1.isWeb) {
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
        _addExtensionsTable(md) {
            const eager = [];
            const normal = [];
            const extensionsStatus = this._extensionService.getExtensionsStatus();
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
        _addPerfMarksTable(name, md, marks) {
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
        _addRawPerfMarks(md) {
            for (const [source, marks] of this._timerService.getPerformanceMarks()) {
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
        _addLoaderStats(md, stats) {
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
        _addCachedDataStats(md) {
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
        _addResourceTimingStats(md) {
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
        __param(0, model_1.IModelService),
        __param(1, language_1.ILanguageService),
        __param(2, codeEditorService_1.ICodeEditorService),
        __param(3, lifecycle_1.ILifecycleService),
        __param(4, timerService_1.ITimerService),
        __param(5, extensions_1.IExtensionService),
        __param(6, productService_1.IProductService),
        __param(7, terminal_1.ITerminalService)
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
            this.value += amd_1.LoaderStats.toMarkdownTable(header, rows);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZnZpZXdFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wZXJmb3JtYW5jZS9icm93c2VyL3BlcmZ2aWV3RWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEyQnpGLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWU7UUFJM0IsWUFDd0IsWUFBbUMsRUFDdkMsd0JBQTJDO1lBRTlELElBQUksQ0FBQyxhQUFhLEdBQUcsd0JBQXdCLENBQUMsZ0NBQWdDLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxjQUFjLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1FBQy9JLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM5QixDQUFDO0tBQ0QsQ0FBQTtJQWRZLDBDQUFlOzhCQUFmLGVBQWU7UUFLekIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLG1DQUFpQixDQUFBO09BTlAsZUFBZSxDQWMzQjtJQUVNLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxpREFBdUI7O2lCQUV6QyxPQUFFLEdBQUcsZUFBZSxBQUFsQixDQUFtQjtpQkFDckIsUUFBRyxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxDQUFDLEFBQTVELENBQTZEO1FBRWhGLElBQWEsTUFBTTtZQUNsQixPQUFPLGVBQWEsQ0FBQyxFQUFFLENBQUM7UUFDekIsQ0FBQztRQUVELFlBQ29CLHdCQUEyQyxFQUM1QyxlQUFpQyxFQUNuQyxhQUE2QixFQUMvQixXQUF5QixFQUN4QixZQUEyQixFQUNkLHlCQUFxRDtZQUVqRixLQUFLLENBQ0osZUFBYSxDQUFDLEdBQUcsRUFDakIsSUFBQSxj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