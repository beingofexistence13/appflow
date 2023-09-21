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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/notebookVisibleCellObserver", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, async_1, lifecycle_1, platform_1, nls_1, instantiation_1, themeService_1, themables_1, notebookVisibleCellObserver_1, notebookEditorExtensions_1, notebookEditorWidget_1, notebookIcons_1, notebookCommon_1, notebookExecutionStateService_1, notebookService_1) {
    "use strict";
    var ExecutionStateCellStatusBarItem_1, TimerCellStatusBarItem_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BFb = exports.$AFb = exports.$zFb = exports.$yFb = void 0;
    function $yFb(duration, showMilliseconds = true) {
        if (showMilliseconds && duration < 1000) {
            return `${duration}ms`;
        }
        const minutes = Math.floor(duration / 1000 / 60);
        const seconds = Math.floor(duration / 1000) % 60;
        const tenths = Math.floor((duration % 1000) / 100);
        if (minutes > 0) {
            return `${minutes}m ${seconds}.${tenths}s`;
        }
        else {
            return `${seconds}.${tenths}s`;
        }
    }
    exports.$yFb = $yFb;
    class $zFb extends lifecycle_1.$kc {
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.a = new Map();
            this.b = this.B(new notebookVisibleCellObserver_1.$wFb(this.c));
            this.B(this.b.onDidChangeVisibleCells(this.h, this));
            this.g();
        }
        g() {
            this.a.forEach(lifecycle_1.$fc);
            this.a.clear();
            this.h({ added: this.b.visibleCells, removed: [] });
        }
        h(e) {
            const vm = this.c.getViewModel();
            if (!vm) {
                return;
            }
            for (const oldCell of e.removed) {
                this.a.get(oldCell.handle)?.dispose();
                this.a.delete(oldCell.handle);
            }
            for (const newCell of e.added) {
                this.a.set(newCell.handle, this.f(vm, newCell));
            }
        }
        dispose() {
            super.dispose();
            this.a.forEach(lifecycle_1.$fc);
            this.a.clear();
        }
    }
    exports.$zFb = $zFb;
    let $AFb = class $AFb extends lifecycle_1.$kc {
        static { this.id = 'workbench.notebook.statusBar.execState'; }
        constructor(notebookEditor, instantiationService) {
            super();
            this.B(new $zFb(notebookEditor, (vm, cell) => instantiationService.createInstance(ExecutionStateCellStatusBarItem, vm, cell)));
        }
    };
    exports.$AFb = $AFb;
    exports.$AFb = $AFb = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $AFb);
    (0, notebookEditorExtensions_1.$Fnb)($AFb.id, $AFb);
    /**
     * Shows the cell's execution state in the cell status bar. When the "executing" state is shown, it will be shown for a minimum brief time.
     */
    let ExecutionStateCellStatusBarItem = class ExecutionStateCellStatusBarItem extends lifecycle_1.$kc {
        static { ExecutionStateCellStatusBarItem_1 = this; }
        static { this.a = 500; }
        constructor(g, h, j) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.b = [];
            this.f = this.B(new lifecycle_1.$lc());
            this.m();
            this.B(this.j.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && e.affectsCell(this.h.uri)) {
                    this.m();
                }
            }));
            this.B(this.h.model.onDidChangeInternalMetadata(() => this.m()));
        }
        async m() {
            const items = this.n();
            if (Array.isArray(items)) {
                this.b = this.g.deltaCellStatusBarItems(this.b, [{ handle: this.h.handle, items }]);
            }
        }
        /**
         *	Returns undefined if there should be no change, and an empty array if all items should be removed.
         */
        n() {
            const runState = this.j.getCellExecution(this.h.uri);
            // Show the execution spinner for a minimum time
            if (runState?.state === notebookCommon_1.NotebookCellExecutionState.Executing && typeof this.c !== 'number') {
                this.c = Date.now();
            }
            else if (runState?.state !== notebookCommon_1.NotebookCellExecutionState.Executing && typeof this.c === 'number') {
                const timeUntilMin = ExecutionStateCellStatusBarItem_1.a - (Date.now() - this.c);
                if (timeUntilMin > 0) {
                    if (!this.f.value) {
                        this.f.value = (0, async_1.$Ig)(() => {
                            this.c = undefined;
                            this.f.clear();
                            this.m();
                        }, timeUntilMin);
                    }
                    return undefined;
                }
                else {
                    this.c = undefined;
                }
            }
            const items = this.r(runState, this.h.internalMetadata);
            return items;
        }
        r(runState, internalMetadata) {
            const state = runState?.state;
            const { lastRunSuccess } = internalMetadata;
            if (!state && lastRunSuccess) {
                return [{
                        text: `$(${notebookIcons_1.$Gpb.id})`,
                        color: (0, themeService_1.$hv)(notebookEditorWidget_1.$Frb),
                        tooltip: (0, nls_1.localize)(0, null),
                        alignment: 1 /* CellStatusbarAlignment.Left */,
                        priority: Number.MAX_SAFE_INTEGER
                    }];
            }
            else if (!state && lastRunSuccess === false) {
                return [{
                        text: `$(${notebookIcons_1.$Hpb.id})`,
                        color: (0, themeService_1.$hv)(notebookEditorWidget_1.$Hrb),
                        tooltip: (0, nls_1.localize)(1, null),
                        alignment: 1 /* CellStatusbarAlignment.Left */,
                        priority: Number.MAX_SAFE_INTEGER
                    }];
            }
            else if (state === notebookCommon_1.NotebookCellExecutionState.Pending || state === notebookCommon_1.NotebookCellExecutionState.Unconfirmed) {
                return [{
                        text: `$(${notebookIcons_1.$Ipb.id})`,
                        tooltip: (0, nls_1.localize)(2, null),
                        alignment: 1 /* CellStatusbarAlignment.Left */,
                        priority: Number.MAX_SAFE_INTEGER
                    }];
            }
            else if (state === notebookCommon_1.NotebookCellExecutionState.Executing) {
                const icon = runState?.didPause ?
                    notebookIcons_1.$Jpb :
                    themables_1.ThemeIcon.modify(notebookIcons_1.$Jpb, 'spin');
                return [{
                        text: `$(${icon.id})`,
                        tooltip: (0, nls_1.localize)(3, null),
                        alignment: 1 /* CellStatusbarAlignment.Left */,
                        priority: Number.MAX_SAFE_INTEGER
                    }];
            }
            return [];
        }
        dispose() {
            super.dispose();
            this.g.deltaCellStatusBarItems(this.b, [{ handle: this.h.handle, items: [] }]);
        }
    };
    ExecutionStateCellStatusBarItem = ExecutionStateCellStatusBarItem_1 = __decorate([
        __param(2, notebookExecutionStateService_1.$_H)
    ], ExecutionStateCellStatusBarItem);
    let $BFb = class $BFb extends lifecycle_1.$kc {
        static { this.id = 'workbench.notebook.statusBar.execTimer'; }
        constructor(notebookEditor, instantiationService) {
            super();
            this.B(new $zFb(notebookEditor, (vm, cell) => instantiationService.createInstance(TimerCellStatusBarItem, vm, cell)));
        }
    };
    exports.$BFb = $BFb;
    exports.$BFb = $BFb = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $BFb);
    (0, notebookEditorExtensions_1.$Fnb)($BFb.id, $BFb);
    const UPDATE_TIMER_GRACE_PERIOD = 200;
    let TimerCellStatusBarItem = class TimerCellStatusBarItem extends lifecycle_1.$kc {
        static { TimerCellStatusBarItem_1 = this; }
        static { this.a = 100; }
        constructor(g, h, j, m) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.b = [];
            this.c = this.B(new async_1.$Sg(() => this.n(), TimerCellStatusBarItem_1.a));
            this.n();
            this.B(this.h.model.onDidChangeInternalMetadata(() => this.n()));
        }
        async n() {
            let timerItem;
            const runState = this.j.getCellExecution(this.h.uri);
            const state = runState?.state;
            const startTime = this.h.internalMetadata.runStartTime;
            const adjustment = this.h.internalMetadata.runStartTimeAdjustment ?? 0;
            const endTime = this.h.internalMetadata.runEndTime;
            if (runState?.didPause) {
                timerItem = undefined;
            }
            else if (state === notebookCommon_1.NotebookCellExecutionState.Executing) {
                if (typeof startTime === 'number') {
                    timerItem = this.r(startTime, Date.now(), adjustment);
                    this.c.schedule();
                }
            }
            else if (!state) {
                if (typeof startTime === 'number' && typeof endTime === 'number') {
                    const timerDuration = Date.now() - startTime + adjustment;
                    const executionDuration = endTime - startTime;
                    const renderDuration = this.h.internalMetadata.renderDuration ?? {};
                    timerItem = this.r(startTime, endTime, undefined, {
                        timerDuration,
                        executionDuration,
                        renderDuration
                    });
                }
            }
            const items = timerItem ? [timerItem] : [];
            if (!items.length && !!runState) {
                if (!this.f) {
                    this.f = (0, async_1.$Ig)(() => {
                        this.f = undefined;
                        this.b = this.g.deltaCellStatusBarItems(this.b, [{ handle: this.h.handle, items }]);
                    }, UPDATE_TIMER_GRACE_PERIOD);
                }
            }
            else {
                this.f?.dispose();
                this.f = undefined;
                this.b = this.g.deltaCellStatusBarItems(this.b, [{ handle: this.h.handle, items }]);
            }
        }
        r(startTime, endTime, adjustment = 0, runtimeInformation) {
            const duration = endTime - startTime + adjustment;
            let tooltip;
            if (runtimeInformation) {
                const lastExecution = new Date(endTime).toLocaleTimeString(platform_1.$v);
                const { renderDuration, executionDuration, timerDuration } = runtimeInformation;
                let renderTimes = '';
                for (const key in renderDuration) {
                    const rendererInfo = this.m.getRendererInfo(key);
                    const args = encodeURIComponent(JSON.stringify({
                        extensionId: rendererInfo?.extensionId.value ?? '',
                        issueBody: `Auto-generated text from notebook cell performance. The duration for the renderer, ${rendererInfo?.displayName ?? key}, is slower than expected.\n` +
                            `Execution Time: ${$yFb(executionDuration)}\n` +
                            `Renderer Duration: ${$yFb(renderDuration[key])}\n`
                    }));
                    renderTimes += `- [${rendererInfo?.displayName ?? key}](command:workbench.action.openIssueReporter?${args}) ${$yFb(renderDuration[key])}\n`;
                }
                renderTimes += `\n*${(0, nls_1.localize)(4, null)}*\n`;
                tooltip = {
                    value: (0, nls_1.localize)(5, null, lastExecution, $yFb(executionDuration), $yFb(timerDuration - executionDuration), renderTimes),
                    isTrusted: true
                };
            }
            return {
                text: $yFb(duration, false),
                alignment: 1 /* CellStatusbarAlignment.Left */,
                priority: Number.MAX_SAFE_INTEGER - 5,
                tooltip
            };
        }
        dispose() {
            super.dispose();
            this.f?.dispose();
            this.g.deltaCellStatusBarItems(this.b, [{ handle: this.h.handle, items: [] }]);
        }
    };
    TimerCellStatusBarItem = TimerCellStatusBarItem_1 = __decorate([
        __param(2, notebookExecutionStateService_1.$_H),
        __param(3, notebookService_1.$ubb)
    ], TimerCellStatusBarItem);
});
//# sourceMappingURL=executionStatusBarItemController.js.map