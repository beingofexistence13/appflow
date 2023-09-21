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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/notebookVisibleCellObserver", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, async_1, lifecycle_1, platform_1, nls_1, instantiation_1, themeService_1, themables_1, notebookVisibleCellObserver_1, notebookEditorExtensions_1, notebookEditorWidget_1, notebookIcons_1, notebookCommon_1, notebookExecutionStateService_1, notebookService_1) {
    "use strict";
    var ExecutionStateCellStatusBarItem_1, TimerCellStatusBarItem_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimerCellStatusBarContrib = exports.ExecutionStateCellStatusBarContrib = exports.NotebookStatusBarController = exports.formatCellDuration = void 0;
    function formatCellDuration(duration, showMilliseconds = true) {
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
    exports.formatCellDuration = formatCellDuration;
    class NotebookStatusBarController extends lifecycle_1.Disposable {
        constructor(_notebookEditor, _itemFactory) {
            super();
            this._notebookEditor = _notebookEditor;
            this._itemFactory = _itemFactory;
            this._visibleCells = new Map();
            this._observer = this._register(new notebookVisibleCellObserver_1.NotebookVisibleCellObserver(this._notebookEditor));
            this._register(this._observer.onDidChangeVisibleCells(this._updateVisibleCells, this));
            this._updateEverything();
        }
        _updateEverything() {
            this._visibleCells.forEach(lifecycle_1.dispose);
            this._visibleCells.clear();
            this._updateVisibleCells({ added: this._observer.visibleCells, removed: [] });
        }
        _updateVisibleCells(e) {
            const vm = this._notebookEditor.getViewModel();
            if (!vm) {
                return;
            }
            for (const oldCell of e.removed) {
                this._visibleCells.get(oldCell.handle)?.dispose();
                this._visibleCells.delete(oldCell.handle);
            }
            for (const newCell of e.added) {
                this._visibleCells.set(newCell.handle, this._itemFactory(vm, newCell));
            }
        }
        dispose() {
            super.dispose();
            this._visibleCells.forEach(lifecycle_1.dispose);
            this._visibleCells.clear();
        }
    }
    exports.NotebookStatusBarController = NotebookStatusBarController;
    let ExecutionStateCellStatusBarContrib = class ExecutionStateCellStatusBarContrib extends lifecycle_1.Disposable {
        static { this.id = 'workbench.notebook.statusBar.execState'; }
        constructor(notebookEditor, instantiationService) {
            super();
            this._register(new NotebookStatusBarController(notebookEditor, (vm, cell) => instantiationService.createInstance(ExecutionStateCellStatusBarItem, vm, cell)));
        }
    };
    exports.ExecutionStateCellStatusBarContrib = ExecutionStateCellStatusBarContrib;
    exports.ExecutionStateCellStatusBarContrib = ExecutionStateCellStatusBarContrib = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], ExecutionStateCellStatusBarContrib);
    (0, notebookEditorExtensions_1.registerNotebookContribution)(ExecutionStateCellStatusBarContrib.id, ExecutionStateCellStatusBarContrib);
    /**
     * Shows the cell's execution state in the cell status bar. When the "executing" state is shown, it will be shown for a minimum brief time.
     */
    let ExecutionStateCellStatusBarItem = class ExecutionStateCellStatusBarItem extends lifecycle_1.Disposable {
        static { ExecutionStateCellStatusBarItem_1 = this; }
        static { this.MIN_SPINNER_TIME = 500; }
        constructor(_notebookViewModel, _cell, _executionStateService) {
            super();
            this._notebookViewModel = _notebookViewModel;
            this._cell = _cell;
            this._executionStateService = _executionStateService;
            this._currentItemIds = [];
            this._clearExecutingStateTimer = this._register(new lifecycle_1.MutableDisposable());
            this._update();
            this._register(this._executionStateService.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && e.affectsCell(this._cell.uri)) {
                    this._update();
                }
            }));
            this._register(this._cell.model.onDidChangeInternalMetadata(() => this._update()));
        }
        async _update() {
            const items = this._getItemsForCell();
            if (Array.isArray(items)) {
                this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
            }
        }
        /**
         *	Returns undefined if there should be no change, and an empty array if all items should be removed.
         */
        _getItemsForCell() {
            const runState = this._executionStateService.getCellExecution(this._cell.uri);
            // Show the execution spinner for a minimum time
            if (runState?.state === notebookCommon_1.NotebookCellExecutionState.Executing && typeof this._showedExecutingStateTime !== 'number') {
                this._showedExecutingStateTime = Date.now();
            }
            else if (runState?.state !== notebookCommon_1.NotebookCellExecutionState.Executing && typeof this._showedExecutingStateTime === 'number') {
                const timeUntilMin = ExecutionStateCellStatusBarItem_1.MIN_SPINNER_TIME - (Date.now() - this._showedExecutingStateTime);
                if (timeUntilMin > 0) {
                    if (!this._clearExecutingStateTimer.value) {
                        this._clearExecutingStateTimer.value = (0, async_1.disposableTimeout)(() => {
                            this._showedExecutingStateTime = undefined;
                            this._clearExecutingStateTimer.clear();
                            this._update();
                        }, timeUntilMin);
                    }
                    return undefined;
                }
                else {
                    this._showedExecutingStateTime = undefined;
                }
            }
            const items = this._getItemForState(runState, this._cell.internalMetadata);
            return items;
        }
        _getItemForState(runState, internalMetadata) {
            const state = runState?.state;
            const { lastRunSuccess } = internalMetadata;
            if (!state && lastRunSuccess) {
                return [{
                        text: `$(${notebookIcons_1.successStateIcon.id})`,
                        color: (0, themeService_1.themeColorFromId)(notebookEditorWidget_1.cellStatusIconSuccess),
                        tooltip: (0, nls_1.localize)('notebook.cell.status.success', "Success"),
                        alignment: 1 /* CellStatusbarAlignment.Left */,
                        priority: Number.MAX_SAFE_INTEGER
                    }];
            }
            else if (!state && lastRunSuccess === false) {
                return [{
                        text: `$(${notebookIcons_1.errorStateIcon.id})`,
                        color: (0, themeService_1.themeColorFromId)(notebookEditorWidget_1.cellStatusIconError),
                        tooltip: (0, nls_1.localize)('notebook.cell.status.failed', "Failed"),
                        alignment: 1 /* CellStatusbarAlignment.Left */,
                        priority: Number.MAX_SAFE_INTEGER
                    }];
            }
            else if (state === notebookCommon_1.NotebookCellExecutionState.Pending || state === notebookCommon_1.NotebookCellExecutionState.Unconfirmed) {
                return [{
                        text: `$(${notebookIcons_1.pendingStateIcon.id})`,
                        tooltip: (0, nls_1.localize)('notebook.cell.status.pending', "Pending"),
                        alignment: 1 /* CellStatusbarAlignment.Left */,
                        priority: Number.MAX_SAFE_INTEGER
                    }];
            }
            else if (state === notebookCommon_1.NotebookCellExecutionState.Executing) {
                const icon = runState?.didPause ?
                    notebookIcons_1.executingStateIcon :
                    themables_1.ThemeIcon.modify(notebookIcons_1.executingStateIcon, 'spin');
                return [{
                        text: `$(${icon.id})`,
                        tooltip: (0, nls_1.localize)('notebook.cell.status.executing', "Executing"),
                        alignment: 1 /* CellStatusbarAlignment.Left */,
                        priority: Number.MAX_SAFE_INTEGER
                    }];
            }
            return [];
        }
        dispose() {
            super.dispose();
            this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
        }
    };
    ExecutionStateCellStatusBarItem = ExecutionStateCellStatusBarItem_1 = __decorate([
        __param(2, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], ExecutionStateCellStatusBarItem);
    let TimerCellStatusBarContrib = class TimerCellStatusBarContrib extends lifecycle_1.Disposable {
        static { this.id = 'workbench.notebook.statusBar.execTimer'; }
        constructor(notebookEditor, instantiationService) {
            super();
            this._register(new NotebookStatusBarController(notebookEditor, (vm, cell) => instantiationService.createInstance(TimerCellStatusBarItem, vm, cell)));
        }
    };
    exports.TimerCellStatusBarContrib = TimerCellStatusBarContrib;
    exports.TimerCellStatusBarContrib = TimerCellStatusBarContrib = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], TimerCellStatusBarContrib);
    (0, notebookEditorExtensions_1.registerNotebookContribution)(TimerCellStatusBarContrib.id, TimerCellStatusBarContrib);
    const UPDATE_TIMER_GRACE_PERIOD = 200;
    let TimerCellStatusBarItem = class TimerCellStatusBarItem extends lifecycle_1.Disposable {
        static { TimerCellStatusBarItem_1 = this; }
        static { this.UPDATE_INTERVAL = 100; }
        constructor(_notebookViewModel, _cell, _executionStateService, _notebookService) {
            super();
            this._notebookViewModel = _notebookViewModel;
            this._cell = _cell;
            this._executionStateService = _executionStateService;
            this._notebookService = _notebookService;
            this._currentItemIds = [];
            this._scheduler = this._register(new async_1.RunOnceScheduler(() => this._update(), TimerCellStatusBarItem_1.UPDATE_INTERVAL));
            this._update();
            this._register(this._cell.model.onDidChangeInternalMetadata(() => this._update()));
        }
        async _update() {
            let timerItem;
            const runState = this._executionStateService.getCellExecution(this._cell.uri);
            const state = runState?.state;
            const startTime = this._cell.internalMetadata.runStartTime;
            const adjustment = this._cell.internalMetadata.runStartTimeAdjustment ?? 0;
            const endTime = this._cell.internalMetadata.runEndTime;
            if (runState?.didPause) {
                timerItem = undefined;
            }
            else if (state === notebookCommon_1.NotebookCellExecutionState.Executing) {
                if (typeof startTime === 'number') {
                    timerItem = this._getTimeItem(startTime, Date.now(), adjustment);
                    this._scheduler.schedule();
                }
            }
            else if (!state) {
                if (typeof startTime === 'number' && typeof endTime === 'number') {
                    const timerDuration = Date.now() - startTime + adjustment;
                    const executionDuration = endTime - startTime;
                    const renderDuration = this._cell.internalMetadata.renderDuration ?? {};
                    timerItem = this._getTimeItem(startTime, endTime, undefined, {
                        timerDuration,
                        executionDuration,
                        renderDuration
                    });
                }
            }
            const items = timerItem ? [timerItem] : [];
            if (!items.length && !!runState) {
                if (!this._deferredUpdate) {
                    this._deferredUpdate = (0, async_1.disposableTimeout)(() => {
                        this._deferredUpdate = undefined;
                        this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
                    }, UPDATE_TIMER_GRACE_PERIOD);
                }
            }
            else {
                this._deferredUpdate?.dispose();
                this._deferredUpdate = undefined;
                this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
            }
        }
        _getTimeItem(startTime, endTime, adjustment = 0, runtimeInformation) {
            const duration = endTime - startTime + adjustment;
            let tooltip;
            if (runtimeInformation) {
                const lastExecution = new Date(endTime).toLocaleTimeString(platform_1.language);
                const { renderDuration, executionDuration, timerDuration } = runtimeInformation;
                let renderTimes = '';
                for (const key in renderDuration) {
                    const rendererInfo = this._notebookService.getRendererInfo(key);
                    const args = encodeURIComponent(JSON.stringify({
                        extensionId: rendererInfo?.extensionId.value ?? '',
                        issueBody: `Auto-generated text from notebook cell performance. The duration for the renderer, ${rendererInfo?.displayName ?? key}, is slower than expected.\n` +
                            `Execution Time: ${formatCellDuration(executionDuration)}\n` +
                            `Renderer Duration: ${formatCellDuration(renderDuration[key])}\n`
                    }));
                    renderTimes += `- [${rendererInfo?.displayName ?? key}](command:workbench.action.openIssueReporter?${args}) ${formatCellDuration(renderDuration[key])}\n`;
                }
                renderTimes += `\n*${(0, nls_1.localize)('notebook.cell.statusBar.timerTooltip.reportIssueFootnote', "Use the links above to file an issue using the issue reporter.")}*\n`;
                tooltip = {
                    value: (0, nls_1.localize)('notebook.cell.statusBar.timerTooltip', "**Last Execution** {0}\n\n**Execution Time** {1}\n\n**Overhead Time** {2}\n\n**Render Times**\n\n{3}", lastExecution, formatCellDuration(executionDuration), formatCellDuration(timerDuration - executionDuration), renderTimes),
                    isTrusted: true
                };
            }
            return {
                text: formatCellDuration(duration, false),
                alignment: 1 /* CellStatusbarAlignment.Left */,
                priority: Number.MAX_SAFE_INTEGER - 5,
                tooltip
            };
        }
        dispose() {
            super.dispose();
            this._deferredUpdate?.dispose();
            this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
        }
    };
    TimerCellStatusBarItem = TimerCellStatusBarItem_1 = __decorate([
        __param(2, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(3, notebookService_1.INotebookService)
    ], TimerCellStatusBarItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlY3V0aW9uU3RhdHVzQmFySXRlbUNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyaWIvY2VsbFN0YXR1c0Jhci9leGVjdXRpb25TdGF0dXNCYXJJdGVtQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBbUJoRyxTQUFnQixrQkFBa0IsQ0FBQyxRQUFnQixFQUFFLG1CQUE0QixJQUFJO1FBQ3BGLElBQUksZ0JBQWdCLElBQUksUUFBUSxHQUFHLElBQUksRUFBRTtZQUN4QyxPQUFPLEdBQUcsUUFBUSxJQUFJLENBQUM7U0FDdkI7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDakQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2pELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFFbkQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFO1lBQ2hCLE9BQU8sR0FBRyxPQUFPLEtBQUssT0FBTyxJQUFJLE1BQU0sR0FBRyxDQUFDO1NBQzNDO2FBQU07WUFDTixPQUFPLEdBQUcsT0FBTyxJQUFJLE1BQU0sR0FBRyxDQUFDO1NBQy9CO0lBQ0YsQ0FBQztJQWRELGdEQWNDO0lBRUQsTUFBYSwyQkFBNEIsU0FBUSxzQkFBVTtRQUkxRCxZQUNrQixlQUFnQyxFQUNoQyxZQUEyRTtZQUU1RixLQUFLLEVBQUUsQ0FBQztZQUhTLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNo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