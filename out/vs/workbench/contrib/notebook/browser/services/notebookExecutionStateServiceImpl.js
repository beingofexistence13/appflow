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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/resources", "vs/base/common/uuid", "vs/platform/audioCues/browser/audioCueService", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, event_1, lifecycle_1, map_1, resources_1, uuid_1, audioCueService_1, instantiation_1, log_1, notebookCommon_1, notebookExecutionService_1, notebookExecutionStateService_1, notebookKernelService_1, notebookService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookExecutionStateService = void 0;
    let NotebookExecutionStateService = class NotebookExecutionStateService extends lifecycle_1.Disposable {
        constructor(_instantiationService, _logService, _notebookService, _audioCueService) {
            super();
            this._instantiationService = _instantiationService;
            this._logService = _logService;
            this._notebookService = _notebookService;
            this._audioCueService = _audioCueService;
            this._executions = new map_1.ResourceMap();
            this._notebookExecutions = new map_1.ResourceMap();
            this._notebookListeners = new map_1.ResourceMap();
            this._cellListeners = new map_1.ResourceMap();
            this._lastFailedCells = new map_1.ResourceMap();
            this._onDidChangeExecution = this._register(new event_1.Emitter());
            this.onDidChangeExecution = this._onDidChangeExecution.event;
            this._onDidChangeLastRunFailState = this._register(new event_1.Emitter());
            this.onDidChangeLastRunFailState = this._onDidChangeLastRunFailState.event;
        }
        getLastFailedCellForNotebook(notebook) {
            const failedCell = this._lastFailedCells.get(notebook);
            return failedCell?.visible ? failedCell.cellHandle : undefined;
        }
        forceCancelNotebookExecutions(notebookUri) {
            const notebookCellExecutions = this._executions.get(notebookUri);
            if (notebookCellExecutions) {
                for (const exe of notebookCellExecutions.values()) {
                    this._onCellExecutionDidComplete(notebookUri, exe.cellHandle, exe);
                }
            }
            if (this._notebookExecutions.has(notebookUri)) {
                this._onExecutionDidComplete(notebookUri);
            }
        }
        getCellExecution(cellUri) {
            const parsed = notebookCommon_1.CellUri.parse(cellUri);
            if (!parsed) {
                throw new Error(`Not a cell URI: ${cellUri}`);
            }
            const exeMap = this._executions.get(parsed.notebook);
            if (exeMap) {
                return exeMap.get(parsed.handle);
            }
            return undefined;
        }
        getExecution(notebook) {
            return this._notebookExecutions.get(notebook)?.[0];
        }
        getCellExecutionsForNotebook(notebook) {
            const exeMap = this._executions.get(notebook);
            return exeMap ? Array.from(exeMap.values()) : [];
        }
        getCellExecutionsByHandleForNotebook(notebook) {
            const exeMap = this._executions.get(notebook);
            return exeMap ? new Map(exeMap.entries()) : undefined;
        }
        _onCellExecutionDidChange(notebookUri, cellHandle, exe) {
            this._onDidChangeExecution.fire(new NotebookCellExecutionEvent(notebookUri, cellHandle, exe));
        }
        _onCellExecutionDidComplete(notebookUri, cellHandle, exe, lastRunSuccess) {
            const notebookExecutions = this._executions.get(notebookUri);
            if (!notebookExecutions) {
                this._logService.debug(`NotebookExecutionStateService#_onCellExecutionDidComplete - unknown notebook ${notebookUri.toString()}`);
                return;
            }
            exe.dispose();
            const cellUri = notebookCommon_1.CellUri.generate(notebookUri, cellHandle);
            this._cellListeners.get(cellUri)?.dispose();
            this._cellListeners.delete(cellUri);
            notebookExecutions.delete(cellHandle);
            if (notebookExecutions.size === 0) {
                this._executions.delete(notebookUri);
                this._notebookListeners.get(notebookUri)?.dispose();
                this._notebookListeners.delete(notebookUri);
            }
            if (lastRunSuccess !== undefined) {
                if (lastRunSuccess) {
                    if (this._executions.size === 0) {
                        this._audioCueService.playAudioCue(audioCueService_1.AudioCue.notebookCellCompleted);
                    }
                    this._clearLastFailedCell(notebookUri);
                }
                else {
                    this._audioCueService.playAudioCue(audioCueService_1.AudioCue.notebookCellFailed);
                    this._setLastFailedCell(notebookUri, cellHandle);
                }
            }
            this._onDidChangeExecution.fire(new NotebookCellExecutionEvent(notebookUri, cellHandle));
        }
        _onExecutionDidChange(notebookUri, exe) {
            this._onDidChangeExecution.fire(new NotebookExecutionEvent(notebookUri, exe));
        }
        _onExecutionDidComplete(notebookUri) {
            const disposables = this._notebookExecutions.get(notebookUri);
            if (!Array.isArray(disposables)) {
                this._logService.debug(`NotebookExecutionStateService#_onCellExecutionDidComplete - unknown notebook ${notebookUri.toString()}`);
                return;
            }
            this._notebookExecutions.delete(notebookUri);
            this._onDidChangeExecution.fire(new NotebookExecutionEvent(notebookUri));
            disposables.forEach(d => d.dispose());
        }
        createCellExecution(notebookUri, cellHandle) {
            const notebook = this._notebookService.getNotebookTextModel(notebookUri);
            if (!notebook) {
                throw new Error(`Notebook not found: ${notebookUri.toString()}`);
            }
            let notebookExecutionMap = this._executions.get(notebookUri);
            if (!notebookExecutionMap) {
                const listeners = this._instantiationService.createInstance(NotebookExecutionListeners, notebookUri);
                this._notebookListeners.set(notebookUri, listeners);
                notebookExecutionMap = new Map();
                this._executions.set(notebookUri, notebookExecutionMap);
            }
            let exe = notebookExecutionMap.get(cellHandle);
            if (!exe) {
                exe = this._createNotebookCellExecution(notebook, cellHandle);
                notebookExecutionMap.set(cellHandle, exe);
                exe.initialize();
                this._onDidChangeExecution.fire(new NotebookCellExecutionEvent(notebookUri, cellHandle, exe));
            }
            return exe;
        }
        createExecution(notebookUri) {
            const notebook = this._notebookService.getNotebookTextModel(notebookUri);
            if (!notebook) {
                throw new Error(`Notebook not found: ${notebookUri.toString()}`);
            }
            if (!this._notebookListeners.has(notebookUri)) {
                const listeners = this._instantiationService.createInstance(NotebookExecutionListeners, notebookUri);
                this._notebookListeners.set(notebookUri, listeners);
            }
            let info = this._notebookExecutions.get(notebookUri);
            if (!info) {
                info = this._createNotebookExecution(notebook);
                this._notebookExecutions.set(notebookUri, info);
                this._onDidChangeExecution.fire(new NotebookExecutionEvent(notebookUri, info[0]));
            }
            return info[0];
        }
        _createNotebookCellExecution(notebook, cellHandle) {
            const notebookUri = notebook.uri;
            const exe = this._instantiationService.createInstance(CellExecution, cellHandle, notebook);
            const disposable = (0, lifecycle_1.combinedDisposable)(exe.onDidUpdate(() => this._onCellExecutionDidChange(notebookUri, cellHandle, exe)), exe.onDidComplete(lastRunSuccess => this._onCellExecutionDidComplete(notebookUri, cellHandle, exe, lastRunSuccess)));
            this._cellListeners.set(notebookCommon_1.CellUri.generate(notebookUri, cellHandle), disposable);
            return exe;
        }
        _createNotebookExecution(notebook) {
            const notebookUri = notebook.uri;
            const exe = this._instantiationService.createInstance(NotebookExecution, notebook);
            const disposable = (0, lifecycle_1.combinedDisposable)(exe.onDidUpdate(() => this._onExecutionDidChange(notebookUri, exe)), exe.onDidComplete(() => this._onExecutionDidComplete(notebookUri)));
            return [exe, disposable];
        }
        _setLastFailedCell(notebookURI, cellHandle) {
            const prevLastFailedCellInfo = this._lastFailedCells.get(notebookURI);
            const notebook = this._notebookService.getNotebookTextModel(notebookURI);
            if (!notebook) {
                return;
            }
            const newLastFailedCellInfo = {
                cellHandle: cellHandle,
                disposable: prevLastFailedCellInfo ? prevLastFailedCellInfo.disposable : this._getFailedCellListener(notebook),
                visible: true
            };
            this._lastFailedCells.set(notebookURI, newLastFailedCellInfo);
            this._onDidChangeLastRunFailState.fire({ visible: true, notebook: notebookURI });
        }
        _setLastFailedCellVisibility(notebookURI, visible) {
            const lastFailedCellInfo = this._lastFailedCells.get(notebookURI);
            if (lastFailedCellInfo) {
                this._lastFailedCells.set(notebookURI, {
                    cellHandle: lastFailedCellInfo.cellHandle,
                    disposable: lastFailedCellInfo.disposable,
                    visible: visible,
                });
            }
            this._onDidChangeLastRunFailState.fire({ visible: visible, notebook: notebookURI });
        }
        _clearLastFailedCell(notebookURI) {
            const lastFailedCellInfo = this._lastFailedCells.get(notebookURI);
            if (lastFailedCellInfo) {
                lastFailedCellInfo.disposable?.dispose();
                this._lastFailedCells.delete(notebookURI);
            }
            this._onDidChangeLastRunFailState.fire({ visible: false, notebook: notebookURI });
        }
        _getFailedCellListener(notebook) {
            return notebook.onWillAddRemoveCells((e) => {
                const lastFailedCell = this._lastFailedCells.get(notebook.uri)?.cellHandle;
                if (lastFailedCell !== undefined) {
                    const lastFailedCellPos = notebook.cells.findIndex(c => c.handle === lastFailedCell);
                    e.rawEvent.changes.forEach(([start, deleteCount, addedCells]) => {
                        if (deleteCount) {
                            if (lastFailedCellPos >= start && lastFailedCellPos < start + deleteCount) {
                                this._setLastFailedCellVisibility(notebook.uri, false);
                            }
                        }
                        if (addedCells.some(cell => cell.handle === lastFailedCell)) {
                            this._setLastFailedCellVisibility(notebook.uri, true);
                        }
                    });
                }
            });
        }
        dispose() {
            super.dispose();
            this._executions.forEach(executionMap => {
                executionMap.forEach(execution => execution.dispose());
                executionMap.clear();
            });
            this._executions.clear();
            this._notebookExecutions.forEach(disposables => {
                disposables.forEach(d => d.dispose());
            });
            this._notebookExecutions.clear();
            this._cellListeners.forEach(disposable => disposable.dispose());
            this._notebookListeners.forEach(disposable => disposable.dispose());
            this._lastFailedCells.forEach(elem => elem.disposable.dispose());
        }
    };
    exports.NotebookExecutionStateService = NotebookExecutionStateService;
    exports.NotebookExecutionStateService = NotebookExecutionStateService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, log_1.ILogService),
        __param(2, notebookService_1.INotebookService),
        __param(3, audioCueService_1.IAudioCueService)
    ], NotebookExecutionStateService);
    class NotebookCellExecutionEvent {
        constructor(notebook, cellHandle, changed) {
            this.notebook = notebook;
            this.cellHandle = cellHandle;
            this.changed = changed;
            this.type = notebookExecutionStateService_1.NotebookExecutionType.cell;
        }
        affectsCell(cell) {
            const parsedUri = notebookCommon_1.CellUri.parse(cell);
            return !!parsedUri && (0, resources_1.isEqual)(this.notebook, parsedUri.notebook) && this.cellHandle === parsedUri.handle;
        }
        affectsNotebook(notebook) {
            return (0, resources_1.isEqual)(this.notebook, notebook);
        }
    }
    class NotebookExecutionEvent {
        constructor(notebook, changed) {
            this.notebook = notebook;
            this.changed = changed;
            this.type = notebookExecutionStateService_1.NotebookExecutionType.notebook;
        }
        affectsNotebook(notebook) {
            return (0, resources_1.isEqual)(this.notebook, notebook);
        }
    }
    let NotebookExecutionListeners = class NotebookExecutionListeners extends lifecycle_1.Disposable {
        constructor(notebook, _notebookService, _notebookKernelService, _notebookExecutionService, _notebookExecutionStateService, _logService) {
            super();
            this._notebookService = _notebookService;
            this._notebookKernelService = _notebookKernelService;
            this._notebookExecutionService = _notebookExecutionService;
            this._notebookExecutionStateService = _notebookExecutionStateService;
            this._logService = _logService;
            this._logService.debug(`NotebookExecution#ctor ${notebook.toString()}`);
            const notebookModel = this._notebookService.getNotebookTextModel(notebook);
            if (!notebookModel) {
                throw new Error('Notebook not found: ' + notebook);
            }
            this._notebookModel = notebookModel;
            this._register(this._notebookModel.onWillAddRemoveCells(e => this.onWillAddRemoveCells(e)));
            this._register(this._notebookModel.onWillDispose(() => this.onWillDisposeDocument()));
        }
        cancelAll() {
            this._logService.debug(`NotebookExecutionListeners#cancelAll`);
            const exes = this._notebookExecutionStateService.getCellExecutionsForNotebook(this._notebookModel.uri);
            this._notebookExecutionService.cancelNotebookCellHandles(this._notebookModel, exes.map(exe => exe.cellHandle));
        }
        onWillDisposeDocument() {
            this._logService.debug(`NotebookExecution#onWillDisposeDocument`);
            this.cancelAll();
        }
        onWillAddRemoveCells(e) {
            const notebookExes = this._notebookExecutionStateService.getCellExecutionsByHandleForNotebook(this._notebookModel.uri);
            const executingDeletedHandles = new Set();
            const pendingDeletedHandles = new Set();
            if (notebookExes) {
                e.rawEvent.changes.forEach(([start, deleteCount]) => {
                    if (deleteCount) {
                        const deletedHandles = this._notebookModel.cells.slice(start, start + deleteCount).map(c => c.handle);
                        deletedHandles.forEach(h => {
                            const exe = notebookExes.get(h);
                            if (exe?.state === notebookCommon_1.NotebookCellExecutionState.Executing) {
                                executingDeletedHandles.add(h);
                            }
                            else if (exe) {
                                pendingDeletedHandles.add(h);
                            }
                        });
                    }
                });
            }
            if (executingDeletedHandles.size || pendingDeletedHandles.size) {
                const kernel = this._notebookKernelService.getSelectedOrSuggestedKernel(this._notebookModel);
                if (kernel) {
                    const implementsInterrupt = kernel.implementsInterrupt;
                    const handlesToCancel = implementsInterrupt ? [...executingDeletedHandles] : [...executingDeletedHandles, ...pendingDeletedHandles];
                    this._logService.debug(`NotebookExecution#onWillAddRemoveCells, ${JSON.stringify([...handlesToCancel])}`);
                    if (handlesToCancel.length) {
                        kernel.cancelNotebookCellExecution(this._notebookModel.uri, handlesToCancel);
                    }
                }
            }
        }
    };
    NotebookExecutionListeners = __decorate([
        __param(1, notebookService_1.INotebookService),
        __param(2, notebookKernelService_1.INotebookKernelService),
        __param(3, notebookExecutionService_1.INotebookExecutionService),
        __param(4, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(5, log_1.ILogService)
    ], NotebookExecutionListeners);
    function updateToEdit(update, cellHandle) {
        if (update.editType === notebookExecutionService_1.CellExecutionUpdateType.Output) {
            return {
                editType: 2 /* CellEditType.Output */,
                handle: update.cellHandle,
                append: update.append,
                outputs: update.outputs,
            };
        }
        else if (update.editType === notebookExecutionService_1.CellExecutionUpdateType.OutputItems) {
            return {
                editType: 7 /* CellEditType.OutputItems */,
                items: update.items,
                append: update.append,
                outputId: update.outputId
            };
        }
        else if (update.editType === notebookExecutionService_1.CellExecutionUpdateType.ExecutionState) {
            const newInternalMetadata = {};
            if (typeof update.executionOrder !== 'undefined') {
                newInternalMetadata.executionOrder = update.executionOrder;
            }
            if (typeof update.runStartTime !== 'undefined') {
                newInternalMetadata.runStartTime = update.runStartTime;
            }
            return {
                editType: 9 /* CellEditType.PartialInternalMetadata */,
                handle: cellHandle,
                internalMetadata: newInternalMetadata
            };
        }
        throw new Error('Unknown cell update type');
    }
    let CellExecution = class CellExecution extends lifecycle_1.Disposable {
        get state() {
            return this._state;
        }
        get notebook() {
            return this._notebookModel.uri;
        }
        get didPause() {
            return this._didPause;
        }
        get isPaused() {
            return this._isPaused;
        }
        constructor(cellHandle, _notebookModel, _logService) {
            super();
            this.cellHandle = cellHandle;
            this._notebookModel = _notebookModel;
            this._logService = _logService;
            this._onDidUpdate = this._register(new event_1.Emitter());
            this.onDidUpdate = this._onDidUpdate.event;
            this._onDidComplete = this._register(new event_1.Emitter());
            this.onDidComplete = this._onDidComplete.event;
            this._state = notebookCommon_1.NotebookCellExecutionState.Unconfirmed;
            this._didPause = false;
            this._isPaused = false;
            this._logService.debug(`CellExecution#ctor ${this.getCellLog()}`);
        }
        initialize() {
            const startExecuteEdit = {
                editType: 9 /* CellEditType.PartialInternalMetadata */,
                handle: this.cellHandle,
                internalMetadata: {
                    executionId: (0, uuid_1.generateUuid)(),
                    runStartTime: null,
                    runEndTime: null,
                    lastRunSuccess: null,
                    executionOrder: null,
                    renderDuration: null,
                }
            };
            this._applyExecutionEdits([startExecuteEdit]);
        }
        getCellLog() {
            return `${this._notebookModel.uri.toString()}, ${this.cellHandle}`;
        }
        logUpdates(updates) {
            const updateTypes = updates.map(u => notebookExecutionService_1.CellExecutionUpdateType[u.editType]).join(', ');
            this._logService.debug(`CellExecution#updateExecution ${this.getCellLog()}, [${updateTypes}]`);
        }
        confirm() {
            this._logService.debug(`CellExecution#confirm ${this.getCellLog()}`);
            this._state = notebookCommon_1.NotebookCellExecutionState.Pending;
            this._onDidUpdate.fire();
        }
        update(updates) {
            this.logUpdates(updates);
            if (updates.some(u => u.editType === notebookExecutionService_1.CellExecutionUpdateType.ExecutionState)) {
                this._state = notebookCommon_1.NotebookCellExecutionState.Executing;
            }
            if (!this._didPause && updates.some(u => u.editType === notebookExecutionService_1.CellExecutionUpdateType.ExecutionState && u.didPause)) {
                this._didPause = true;
            }
            const lastIsPausedUpdate = [...updates].reverse().find(u => u.editType === notebookExecutionService_1.CellExecutionUpdateType.ExecutionState && typeof u.isPaused === 'boolean');
            if (lastIsPausedUpdate) {
                this._isPaused = lastIsPausedUpdate.isPaused;
            }
            const cellModel = this._notebookModel.cells.find(c => c.handle === this.cellHandle);
            if (!cellModel) {
                this._logService.debug(`CellExecution#update, updating cell not in notebook: ${this._notebookModel.uri.toString()}, ${this.cellHandle}`);
            }
            else {
                const edits = updates.map(update => updateToEdit(update, this.cellHandle));
                this._applyExecutionEdits(edits);
            }
            if (updates.some(u => u.editType === notebookExecutionService_1.CellExecutionUpdateType.ExecutionState)) {
                this._onDidUpdate.fire();
            }
        }
        complete(completionData) {
            const cellModel = this._notebookModel.cells.find(c => c.handle === this.cellHandle);
            if (!cellModel) {
                this._logService.debug(`CellExecution#complete, completing cell not in notebook: ${this._notebookModel.uri.toString()}, ${this.cellHandle}`);
            }
            else {
                const edit = {
                    editType: 9 /* CellEditType.PartialInternalMetadata */,
                    handle: this.cellHandle,
                    internalMetadata: {
                        lastRunSuccess: completionData.lastRunSuccess,
                        runStartTime: this._didPause ? null : cellModel.internalMetadata.runStartTime,
                        runEndTime: this._didPause ? null : completionData.runEndTime,
                    }
                };
                this._applyExecutionEdits([edit]);
            }
            this._onDidComplete.fire(completionData.lastRunSuccess);
        }
        _applyExecutionEdits(edits) {
            this._notebookModel.applyEdits(edits, true, undefined, () => undefined, undefined, false);
        }
    };
    CellExecution = __decorate([
        __param(2, log_1.ILogService)
    ], CellExecution);
    let NotebookExecution = class NotebookExecution extends lifecycle_1.Disposable {
        get state() {
            return this._state;
        }
        get notebook() {
            return this._notebookModel.uri;
        }
        constructor(_notebookModel, _logService) {
            super();
            this._notebookModel = _notebookModel;
            this._logService = _logService;
            this._onDidUpdate = this._register(new event_1.Emitter());
            this.onDidUpdate = this._onDidUpdate.event;
            this._onDidComplete = this._register(new event_1.Emitter());
            this.onDidComplete = this._onDidComplete.event;
            this._state = notebookCommon_1.NotebookExecutionState.Unconfirmed;
            this._logService.debug(`NotebookExecution#ctor`);
        }
        debug(message) {
            this._logService.debug(`${message} ${this._notebookModel.uri.toString()}`);
        }
        confirm() {
            this.debug(`Execution#confirm`);
            this._state = notebookCommon_1.NotebookExecutionState.Pending;
            this._onDidUpdate.fire();
        }
        begin() {
            this.debug(`Execution#begin`);
            this._state = notebookCommon_1.NotebookExecutionState.Executing;
            this._onDidUpdate.fire();
        }
        complete() {
            this.debug(`Execution#begin`);
            this._state = notebookCommon_1.NotebookExecutionState.Unconfirmed;
            this._onDidComplete.fire();
        }
    };
    NotebookExecution = __decorate([
        __param(1, log_1.ILogService)
    ], NotebookExecution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFeGVjdXRpb25TdGF0ZVNlcnZpY2VJbXBsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9zZXJ2aWNlcy9ub3RlYm9va0V4ZWN1dGlvblN0YXRlU2VydmljZUltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0J6RixJQUFNLDZCQUE2QixHQUFuQyxNQUFNLDZCQUE4QixTQUFRLHNCQUFVO1FBZTVELFlBQ3dCLHFCQUE2RCxFQUN2RSxXQUF5QyxFQUNwQyxnQkFBbUQsRUFDbkQsZ0JBQW1EO1lBRXJFLEtBQUssRUFBRSxDQUFDO1lBTGdDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDdEQsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDbkIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUNsQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBaEJyRCxnQkFBVyxHQUFHLElBQUksaUJBQVcsRUFBOEIsQ0FBQztZQUM1RCx3QkFBbUIsR0FBRyxJQUFJLGlCQUFXLEVBQW9DLENBQUM7WUFDMUUsdUJBQWtCLEdBQUcsSUFBSSxpQkFBVyxFQUE4QixDQUFDO1lBQ25FLG1CQUFjLEdBQUcsSUFBSSxpQkFBVyxFQUFlLENBQUM7WUFDaEQscUJBQWdCLEdBQUcsSUFBSSxpQkFBVyxFQUFtQixDQUFDO1lBRXRELDBCQUFxQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWlFLENBQUMsQ0FBQztZQUN0SSx5QkFBb0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDO1lBRXZDLGlDQUE0QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWtDLENBQUMsQ0FBQztZQUM5RyxnQ0FBMkIsR0FBRyxJQUFJ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