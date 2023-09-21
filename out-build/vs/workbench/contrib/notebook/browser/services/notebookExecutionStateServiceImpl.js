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
    exports.$hGb = void 0;
    let $hGb = class $hGb extends lifecycle_1.$kc {
        constructor(r, s, t, w) {
            super();
            this.r = r;
            this.s = s;
            this.t = t;
            this.w = w;
            this.a = new map_1.$zi();
            this.b = new map_1.$zi();
            this.f = new map_1.$zi();
            this.g = new map_1.$zi();
            this.j = new map_1.$zi();
            this.m = this.B(new event_1.$fd());
            this.onDidChangeExecution = this.m.event;
            this.n = this.B(new event_1.$fd());
            this.onDidChangeLastRunFailState = this.n.event;
        }
        getLastFailedCellForNotebook(notebook) {
            const failedCell = this.j.get(notebook);
            return failedCell?.visible ? failedCell.cellHandle : undefined;
        }
        forceCancelNotebookExecutions(notebookUri) {
            const notebookCellExecutions = this.a.get(notebookUri);
            if (notebookCellExecutions) {
                for (const exe of notebookCellExecutions.values()) {
                    this.z(notebookUri, exe.cellHandle, exe);
                }
            }
            if (this.b.has(notebookUri)) {
                this.D(notebookUri);
            }
        }
        getCellExecution(cellUri) {
            const parsed = notebookCommon_1.CellUri.parse(cellUri);
            if (!parsed) {
                throw new Error(`Not a cell URI: ${cellUri}`);
            }
            const exeMap = this.a.get(parsed.notebook);
            if (exeMap) {
                return exeMap.get(parsed.handle);
            }
            return undefined;
        }
        getExecution(notebook) {
            return this.b.get(notebook)?.[0];
        }
        getCellExecutionsForNotebook(notebook) {
            const exeMap = this.a.get(notebook);
            return exeMap ? Array.from(exeMap.values()) : [];
        }
        getCellExecutionsByHandleForNotebook(notebook) {
            const exeMap = this.a.get(notebook);
            return exeMap ? new Map(exeMap.entries()) : undefined;
        }
        y(notebookUri, cellHandle, exe) {
            this.m.fire(new NotebookCellExecutionEvent(notebookUri, cellHandle, exe));
        }
        z(notebookUri, cellHandle, exe, lastRunSuccess) {
            const notebookExecutions = this.a.get(notebookUri);
            if (!notebookExecutions) {
                this.s.debug(`NotebookExecutionStateService#_onCellExecutionDidComplete - unknown notebook ${notebookUri.toString()}`);
                return;
            }
            exe.dispose();
            const cellUri = notebookCommon_1.CellUri.generate(notebookUri, cellHandle);
            this.g.get(cellUri)?.dispose();
            this.g.delete(cellUri);
            notebookExecutions.delete(cellHandle);
            if (notebookExecutions.size === 0) {
                this.a.delete(notebookUri);
                this.f.get(notebookUri)?.dispose();
                this.f.delete(notebookUri);
            }
            if (lastRunSuccess !== undefined) {
                if (lastRunSuccess) {
                    if (this.a.size === 0) {
                        this.w.playAudioCue(audioCueService_1.$wZ.notebookCellCompleted);
                    }
                    this.J(notebookUri);
                }
                else {
                    this.w.playAudioCue(audioCueService_1.$wZ.notebookCellFailed);
                    this.H(notebookUri, cellHandle);
                }
            }
            this.m.fire(new NotebookCellExecutionEvent(notebookUri, cellHandle));
        }
        C(notebookUri, exe) {
            this.m.fire(new NotebookExecutionEvent(notebookUri, exe));
        }
        D(notebookUri) {
            const disposables = this.b.get(notebookUri);
            if (!Array.isArray(disposables)) {
                this.s.debug(`NotebookExecutionStateService#_onCellExecutionDidComplete - unknown notebook ${notebookUri.toString()}`);
                return;
            }
            this.b.delete(notebookUri);
            this.m.fire(new NotebookExecutionEvent(notebookUri));
            disposables.forEach(d => d.dispose());
        }
        createCellExecution(notebookUri, cellHandle) {
            const notebook = this.t.getNotebookTextModel(notebookUri);
            if (!notebook) {
                throw new Error(`Notebook not found: ${notebookUri.toString()}`);
            }
            let notebookExecutionMap = this.a.get(notebookUri);
            if (!notebookExecutionMap) {
                const listeners = this.r.createInstance(NotebookExecutionListeners, notebookUri);
                this.f.set(notebookUri, listeners);
                notebookExecutionMap = new Map();
                this.a.set(notebookUri, notebookExecutionMap);
            }
            let exe = notebookExecutionMap.get(cellHandle);
            if (!exe) {
                exe = this.F(notebook, cellHandle);
                notebookExecutionMap.set(cellHandle, exe);
                exe.initialize();
                this.m.fire(new NotebookCellExecutionEvent(notebookUri, cellHandle, exe));
            }
            return exe;
        }
        createExecution(notebookUri) {
            const notebook = this.t.getNotebookTextModel(notebookUri);
            if (!notebook) {
                throw new Error(`Notebook not found: ${notebookUri.toString()}`);
            }
            if (!this.f.has(notebookUri)) {
                const listeners = this.r.createInstance(NotebookExecutionListeners, notebookUri);
                this.f.set(notebookUri, listeners);
            }
            let info = this.b.get(notebookUri);
            if (!info) {
                info = this.G(notebook);
                this.b.set(notebookUri, info);
                this.m.fire(new NotebookExecutionEvent(notebookUri, info[0]));
            }
            return info[0];
        }
        F(notebook, cellHandle) {
            const notebookUri = notebook.uri;
            const exe = this.r.createInstance(CellExecution, cellHandle, notebook);
            const disposable = (0, lifecycle_1.$hc)(exe.onDidUpdate(() => this.y(notebookUri, cellHandle, exe)), exe.onDidComplete(lastRunSuccess => this.z(notebookUri, cellHandle, exe, lastRunSuccess)));
            this.g.set(notebookCommon_1.CellUri.generate(notebookUri, cellHandle), disposable);
            return exe;
        }
        G(notebook) {
            const notebookUri = notebook.uri;
            const exe = this.r.createInstance(NotebookExecution, notebook);
            const disposable = (0, lifecycle_1.$hc)(exe.onDidUpdate(() => this.C(notebookUri, exe)), exe.onDidComplete(() => this.D(notebookUri)));
            return [exe, disposable];
        }
        H(notebookURI, cellHandle) {
            const prevLastFailedCellInfo = this.j.get(notebookURI);
            const notebook = this.t.getNotebookTextModel(notebookURI);
            if (!notebook) {
                return;
            }
            const newLastFailedCellInfo = {
                cellHandle: cellHandle,
                disposable: prevLastFailedCellInfo ? prevLastFailedCellInfo.disposable : this.L(notebook),
                visible: true
            };
            this.j.set(notebookURI, newLastFailedCellInfo);
            this.n.fire({ visible: true, notebook: notebookURI });
        }
        I(notebookURI, visible) {
            const lastFailedCellInfo = this.j.get(notebookURI);
            if (lastFailedCellInfo) {
                this.j.set(notebookURI, {
                    cellHandle: lastFailedCellInfo.cellHandle,
                    disposable: lastFailedCellInfo.disposable,
                    visible: visible,
                });
            }
            this.n.fire({ visible: visible, notebook: notebookURI });
        }
        J(notebookURI) {
            const lastFailedCellInfo = this.j.get(notebookURI);
            if (lastFailedCellInfo) {
                lastFailedCellInfo.disposable?.dispose();
                this.j.delete(notebookURI);
            }
            this.n.fire({ visible: false, notebook: notebookURI });
        }
        L(notebook) {
            return notebook.onWillAddRemoveCells((e) => {
                const lastFailedCell = this.j.get(notebook.uri)?.cellHandle;
                if (lastFailedCell !== undefined) {
                    const lastFailedCellPos = notebook.cells.findIndex(c => c.handle === lastFailedCell);
                    e.rawEvent.changes.forEach(([start, deleteCount, addedCells]) => {
                        if (deleteCount) {
                            if (lastFailedCellPos >= start && lastFailedCellPos < start + deleteCount) {
                                this.I(notebook.uri, false);
                            }
                        }
                        if (addedCells.some(cell => cell.handle === lastFailedCell)) {
                            this.I(notebook.uri, true);
                        }
                    });
                }
            });
        }
        dispose() {
            super.dispose();
            this.a.forEach(executionMap => {
                executionMap.forEach(execution => execution.dispose());
                executionMap.clear();
            });
            this.a.clear();
            this.b.forEach(disposables => {
                disposables.forEach(d => d.dispose());
            });
            this.b.clear();
            this.g.forEach(disposable => disposable.dispose());
            this.f.forEach(disposable => disposable.dispose());
            this.j.forEach(elem => elem.disposable.dispose());
        }
    };
    exports.$hGb = $hGb;
    exports.$hGb = $hGb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, log_1.$5i),
        __param(2, notebookService_1.$ubb),
        __param(3, audioCueService_1.$sZ)
    ], $hGb);
    class NotebookCellExecutionEvent {
        constructor(notebook, cellHandle, changed) {
            this.notebook = notebook;
            this.cellHandle = cellHandle;
            this.changed = changed;
            this.type = notebookExecutionStateService_1.NotebookExecutionType.cell;
        }
        affectsCell(cell) {
            const parsedUri = notebookCommon_1.CellUri.parse(cell);
            return !!parsedUri && (0, resources_1.$bg)(this.notebook, parsedUri.notebook) && this.cellHandle === parsedUri.handle;
        }
        affectsNotebook(notebook) {
            return (0, resources_1.$bg)(this.notebook, notebook);
        }
    }
    class NotebookExecutionEvent {
        constructor(notebook, changed) {
            this.notebook = notebook;
            this.changed = changed;
            this.type = notebookExecutionStateService_1.NotebookExecutionType.notebook;
        }
        affectsNotebook(notebook) {
            return (0, resources_1.$bg)(this.notebook, notebook);
        }
    }
    let NotebookExecutionListeners = class NotebookExecutionListeners extends lifecycle_1.$kc {
        constructor(notebook, b, f, g, j, m) {
            super();
            this.b = b;
            this.f = f;
            this.g = g;
            this.j = j;
            this.m = m;
            this.m.debug(`NotebookExecution#ctor ${notebook.toString()}`);
            const notebookModel = this.b.getNotebookTextModel(notebook);
            if (!notebookModel) {
                throw new Error('Notebook not found: ' + notebook);
            }
            this.a = notebookModel;
            this.B(this.a.onWillAddRemoveCells(e => this.s(e)));
            this.B(this.a.onWillDispose(() => this.r()));
        }
        n() {
            this.m.debug(`NotebookExecutionListeners#cancelAll`);
            const exes = this.j.getCellExecutionsForNotebook(this.a.uri);
            this.g.cancelNotebookCellHandles(this.a, exes.map(exe => exe.cellHandle));
        }
        r() {
            this.m.debug(`NotebookExecution#onWillDisposeDocument`);
            this.n();
        }
        s(e) {
            const notebookExes = this.j.getCellExecutionsByHandleForNotebook(this.a.uri);
            const executingDeletedHandles = new Set();
            const pendingDeletedHandles = new Set();
            if (notebookExes) {
                e.rawEvent.changes.forEach(([start, deleteCount]) => {
                    if (deleteCount) {
                        const deletedHandles = this.a.cells.slice(start, start + deleteCount).map(c => c.handle);
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
                const kernel = this.f.getSelectedOrSuggestedKernel(this.a);
                if (kernel) {
                    const implementsInterrupt = kernel.implementsInterrupt;
                    const handlesToCancel = implementsInterrupt ? [...executingDeletedHandles] : [...executingDeletedHandles, ...pendingDeletedHandles];
                    this.m.debug(`NotebookExecution#onWillAddRemoveCells, ${JSON.stringify([...handlesToCancel])}`);
                    if (handlesToCancel.length) {
                        kernel.cancelNotebookCellExecution(this.a.uri, handlesToCancel);
                    }
                }
            }
        }
    };
    NotebookExecutionListeners = __decorate([
        __param(1, notebookService_1.$ubb),
        __param(2, notebookKernelService_1.$Bbb),
        __param(3, notebookExecutionService_1.$aI),
        __param(4, notebookExecutionStateService_1.$_H),
        __param(5, log_1.$5i)
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
    let CellExecution = class CellExecution extends lifecycle_1.$kc {
        get state() {
            return this.f;
        }
        get notebook() {
            return this.m.uri;
        }
        get didPause() {
            return this.g;
        }
        get isPaused() {
            return this.j;
        }
        constructor(cellHandle, m, n) {
            super();
            this.cellHandle = cellHandle;
            this.m = m;
            this.n = n;
            this.a = this.B(new event_1.$fd());
            this.onDidUpdate = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidComplete = this.b.event;
            this.f = notebookCommon_1.NotebookCellExecutionState.Unconfirmed;
            this.g = false;
            this.j = false;
            this.n.debug(`CellExecution#ctor ${this.r()}`);
        }
        initialize() {
            const startExecuteEdit = {
                editType: 9 /* CellEditType.PartialInternalMetadata */,
                handle: this.cellHandle,
                internalMetadata: {
                    executionId: (0, uuid_1.$4f)(),
                    runStartTime: null,
                    runEndTime: null,
                    lastRunSuccess: null,
                    executionOrder: null,
                    renderDuration: null,
                }
            };
            this.t([startExecuteEdit]);
        }
        r() {
            return `${this.m.uri.toString()}, ${this.cellHandle}`;
        }
        s(updates) {
            const updateTypes = updates.map(u => notebookExecutionService_1.CellExecutionUpdateType[u.editType]).join(', ');
            this.n.debug(`CellExecution#updateExecution ${this.r()}, [${updateTypes}]`);
        }
        confirm() {
            this.n.debug(`CellExecution#confirm ${this.r()}`);
            this.f = notebookCommon_1.NotebookCellExecutionState.Pending;
            this.a.fire();
        }
        update(updates) {
            this.s(updates);
            if (updates.some(u => u.editType === notebookExecutionService_1.CellExecutionUpdateType.ExecutionState)) {
                this.f = notebookCommon_1.NotebookCellExecutionState.Executing;
            }
            if (!this.g && updates.some(u => u.editType === notebookExecutionService_1.CellExecutionUpdateType.ExecutionState && u.didPause)) {
                this.g = true;
            }
            const lastIsPausedUpdate = [...updates].reverse().find(u => u.editType === notebookExecutionService_1.CellExecutionUpdateType.ExecutionState && typeof u.isPaused === 'boolean');
            if (lastIsPausedUpdate) {
                this.j = lastIsPausedUpdate.isPaused;
            }
            const cellModel = this.m.cells.find(c => c.handle === this.cellHandle);
            if (!cellModel) {
                this.n.debug(`CellExecution#update, updating cell not in notebook: ${this.m.uri.toString()}, ${this.cellHandle}`);
            }
            else {
                const edits = updates.map(update => updateToEdit(update, this.cellHandle));
                this.t(edits);
            }
            if (updates.some(u => u.editType === notebookExecutionService_1.CellExecutionUpdateType.ExecutionState)) {
                this.a.fire();
            }
        }
        complete(completionData) {
            const cellModel = this.m.cells.find(c => c.handle === this.cellHandle);
            if (!cellModel) {
                this.n.debug(`CellExecution#complete, completing cell not in notebook: ${this.m.uri.toString()}, ${this.cellHandle}`);
            }
            else {
                const edit = {
                    editType: 9 /* CellEditType.PartialInternalMetadata */,
                    handle: this.cellHandle,
                    internalMetadata: {
                        lastRunSuccess: completionData.lastRunSuccess,
                        runStartTime: this.g ? null : cellModel.internalMetadata.runStartTime,
                        runEndTime: this.g ? null : completionData.runEndTime,
                    }
                };
                this.t([edit]);
            }
            this.b.fire(completionData.lastRunSuccess);
        }
        t(edits) {
            this.m.applyEdits(edits, true, undefined, () => undefined, undefined, false);
        }
    };
    CellExecution = __decorate([
        __param(2, log_1.$5i)
    ], CellExecution);
    let NotebookExecution = class NotebookExecution extends lifecycle_1.$kc {
        get state() {
            return this.f;
        }
        get notebook() {
            return this.g.uri;
        }
        constructor(g, j) {
            super();
            this.g = g;
            this.j = j;
            this.a = this.B(new event_1.$fd());
            this.onDidUpdate = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidComplete = this.b.event;
            this.f = notebookCommon_1.NotebookExecutionState.Unconfirmed;
            this.j.debug(`NotebookExecution#ctor`);
        }
        m(message) {
            this.j.debug(`${message} ${this.g.uri.toString()}`);
        }
        confirm() {
            this.m(`Execution#confirm`);
            this.f = notebookCommon_1.NotebookExecutionState.Pending;
            this.a.fire();
        }
        begin() {
            this.m(`Execution#begin`);
            this.f = notebookCommon_1.NotebookExecutionState.Executing;
            this.a.fire();
        }
        complete() {
            this.m(`Execution#begin`);
            this.f = notebookCommon_1.NotebookExecutionState.Unconfirmed;
            this.b.fire();
        }
    };
    NotebookExecution = __decorate([
        __param(1, log_1.$5i)
    ], NotebookExecution);
});
//# sourceMappingURL=notebookExecutionStateServiceImpl.js.map