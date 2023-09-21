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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/uri", "vs/platform/extensions/common/extensions", "vs/platform/log/common/log", "vs/workbench/api/common/cache", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostCommands", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/webview/common/webview", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/proxyIdentifier"], function (require, exports, arrays_1, async_1, cancellation_1, event_1, lifecycle_1, map_1, uri_1, extensions_1, log_1, cache_1, extHost_protocol_1, extHostCommands_1, extHostTypeConverters, extHostTypes_1, webview_1, notebookExecutionService_1, extensions_2, proxyIdentifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ucc = exports.$Tcc = void 0;
    let $Tcc = class $Tcc {
        constructor(mainContext, m, n, o, q) {
            this.m = m;
            this.n = n;
            this.o = o;
            this.q = q;
            this.b = new map_1.$zi();
            this.c = new map_1.$zi();
            this.e = new Map();
            this.f = 0;
            this.g = new Map();
            this.h = 0;
            this.i = new cache_1.$6ac('NotebookKernelSourceActionProviderCache');
            this.j = new Map();
            this.k = 0;
            this.l = new event_1.$fd();
            this.onDidChangeNotebookCellExecutionState = this.l.event;
            this.a = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadNotebookKernels);
            // todo@rebornix @joyceerhl: move to APICommands once stabilized.
            const selectKernelApiCommand = new extHostCommands_1.$pM('notebook.selectKernel', '_notebook.selectKernel', 'Trigger kernel picker for specified notebook editor widget', [
                new extHostCommands_1.$nM('options', 'Select kernel options', v => true, (v) => {
                    if (v && 'notebookEditor' in v && 'id' in v) {
                        const notebookEditorId = this.n.getIdByEditor(v.notebookEditor);
                        return {
                            id: v.id, extension: v.extension, notebookEditorId
                        };
                    }
                    else if (v && 'notebookEditor' in v) {
                        const notebookEditorId = this.n.getIdByEditor(v.notebookEditor);
                        if (notebookEditorId === undefined) {
                            throw new Error(`Cannot invoke 'notebook.selectKernel' for unrecognized notebook editor ${v.notebookEditor.notebook.uri.toString()}`);
                        }
                        return { notebookEditorId };
                    }
                    return v;
                })
            ], extHostCommands_1.$oM.Void);
            this.o.registerApiCommand(selectKernelApiCommand);
        }
        createNotebookController(extension, id, viewType, label, handler, preloads) {
            for (const data of this.j.values()) {
                if (data.controller.id === id && extensions_1.$Vl.equals(extension.identifier, data.extensionId)) {
                    throw new Error(`notebook controller with id '${id}' ALREADY exist`);
                }
            }
            const handle = this.k++;
            const that = this;
            this.q.trace(`NotebookController[${handle}], CREATED by ${extension.identifier.value}, ${id}`);
            const _defaultExecutHandler = () => console.warn(`NO execute handler from notebook controller '${data.id}' of extension: '${extension.identifier}'`);
            let isDisposed = false;
            const onDidChangeSelection = new event_1.$fd();
            const onDidReceiveMessage = new event_1.$fd();
            const data = {
                id: $Ucc(extension.identifier, id),
                notebookType: viewType,
                extensionId: extension.identifier,
                extensionLocation: extension.extensionLocation,
                label: label || extension.identifier.value,
                preloads: preloads ? preloads.map(extHostTypeConverters.NotebookRendererScript.from) : []
            };
            //
            let _executeHandler = handler ?? _defaultExecutHandler;
            let _interruptHandler;
            this.a.$addKernel(handle, data).catch(err => {
                // this can happen when a kernel with that ID is already registered
                console.log(err);
                isDisposed = true;
            });
            // update: all setters write directly into the dto object
            // and trigger an update. the actual update will only happen
            // once per event loop execution
            let tokenPool = 0;
            const _update = () => {
                if (isDisposed) {
                    return;
                }
                const myToken = ++tokenPool;
                Promise.resolve().then(() => {
                    if (myToken === tokenPool) {
                        this.a.$updateKernel(handle, data);
                    }
                });
            };
            // notebook documents that are associated to this controller
            const associatedNotebooks = new map_1.$zi();
            const controller = {
                get id() { return id; },
                get notebookType() { return data.notebookType; },
                onDidChangeSelectedNotebooks: onDidChangeSelection.event,
                get label() {
                    return data.label;
                },
                set label(value) {
                    data.label = value ?? extension.displayName ?? extension.name;
                    _update();
                },
                get detail() {
                    return data.detail ?? '';
                },
                set detail(value) {
                    data.detail = value;
                    _update();
                },
                get description() {
                    return data.description ?? '';
                },
                set description(value) {
                    data.description = value;
                    _update();
                },
                get supportedLanguages() {
                    return data.supportedLanguages;
                },
                set supportedLanguages(value) {
                    data.supportedLanguages = value;
                    _update();
                },
                get supportsExecutionOrder() {
                    return data.supportsExecutionOrder ?? false;
                },
                set supportsExecutionOrder(value) {
                    data.supportsExecutionOrder = value;
                    _update();
                },
                get rendererScripts() {
                    return data.preloads ? data.preloads.map(extHostTypeConverters.NotebookRendererScript.to) : [];
                },
                get executeHandler() {
                    return _executeHandler;
                },
                set executeHandler(value) {
                    _executeHandler = value ?? _defaultExecutHandler;
                },
                get interruptHandler() {
                    return _interruptHandler;
                },
                set interruptHandler(value) {
                    _interruptHandler = value;
                    data.supportsInterrupt = Boolean(value);
                    _update();
                },
                createNotebookCellExecution(cell) {
                    if (isDisposed) {
                        throw new Error('notebook controller is DISPOSED');
                    }
                    if (!associatedNotebooks.has(cell.notebook.uri)) {
                        that.q.trace(`NotebookController[${handle}] NOT associated to notebook, associated to THESE notebooks:`, Array.from(associatedNotebooks.keys()).map(u => u.toString()));
                        throw new Error(`notebook controller is NOT associated to notebook: ${cell.notebook.uri.toString()}`);
                    }
                    return that._createNotebookCellExecution(cell, $Ucc(extension.identifier, this.id));
                },
                createNotebookExecution(notebook) {
                    (0, extensions_2.$QF)(extension, 'notebookExecution');
                    if (isDisposed) {
                        throw new Error('notebook controller is DISPOSED');
                    }
                    if (!associatedNotebooks.has(notebook.uri)) {
                        that.q.trace(`NotebookController[${handle}] NOT associated to notebook, associated to THESE notebooks:`, Array.from(associatedNotebooks.keys()).map(u => u.toString()));
                        throw new Error(`notebook controller is NOT associated to notebook: ${notebook.uri.toString()}`);
                    }
                    return that._createNotebookExecution(notebook, $Ucc(extension.identifier, this.id));
                },
                dispose: () => {
                    if (!isDisposed) {
                        this.q.trace(`NotebookController[${handle}], DISPOSED`);
                        isDisposed = true;
                        this.j.delete(handle);
                        onDidChangeSelection.dispose();
                        onDidReceiveMessage.dispose();
                        this.a.$removeKernel(handle);
                    }
                },
                // --- priority
                updateNotebookAffinity(notebook, priority) {
                    if (priority === extHostTypes_1.NotebookControllerAffinity2.Hidden) {
                        // This api only adds an extra enum value, the function is the same, so just gate on the new value being passed
                        // for proposedAPI check.
                        (0, extensions_2.$QF)(extension, 'notebookControllerAffinityHidden');
                    }
                    that.a.$updateNotebookPriority(handle, notebook.uri, priority);
                },
                // --- ipc
                onDidReceiveMessage: onDidReceiveMessage.event,
                postMessage(message, editor) {
                    (0, extensions_2.$QF)(extension, 'notebookMessaging');
                    return that.a.$postMessage(handle, editor && that.n.getIdByEditor(editor), message);
                },
                asWebviewUri(uri) {
                    (0, extensions_2.$QF)(extension, 'notebookMessaging');
                    return (0, webview_1.$Yob)(uri, that.m.remote);
                },
            };
            this.j.set(handle, {
                extensionId: extension.identifier,
                controller,
                onDidReceiveMessage,
                onDidChangeSelection,
                associatedNotebooks
            });
            return controller;
        }
        getIdByController(controller) {
            for (const [_, candidate] of this.j) {
                if (candidate.controller === controller) {
                    return $Ucc(candidate.extensionId, controller.id);
                }
            }
            return null;
        }
        createNotebookControllerDetectionTask(extension, viewType) {
            const handle = this.f++;
            const that = this;
            this.q.trace(`NotebookControllerDetectionTask[${handle}], CREATED by ${extension.identifier.value}`);
            this.a.$addKernelDetectionTask(handle, viewType);
            const detectionTask = {
                dispose: () => {
                    this.e.delete(handle);
                    that.a.$removeKernelDetectionTask(handle);
                }
            };
            this.e.set(handle, detectionTask);
            return detectionTask;
        }
        registerKernelSourceActionProvider(extension, viewType, provider) {
            const handle = this.h++;
            const eventHandle = typeof provider.onDidChangeNotebookKernelSourceActions === 'function' ? handle : undefined;
            const that = this;
            this.g.set(handle, provider);
            this.q.trace(`NotebookKernelSourceActionProvider[${handle}], CREATED by ${extension.identifier.value}`);
            this.a.$addKernelSourceActionProvider(handle, handle, viewType);
            let subscription;
            if (eventHandle !== undefined) {
                subscription = provider.onDidChangeNotebookKernelSourceActions(_ => this.a.$emitNotebookKernelSourceActionsChangeEvent(eventHandle));
            }
            return {
                dispose: () => {
                    this.g.delete(handle);
                    that.a.$removeKernelSourceActionProvider(handle, handle);
                    subscription?.dispose();
                }
            };
        }
        async $provideKernelSourceActions(handle, token) {
            const provider = this.g.get(handle);
            if (provider) {
                const disposables = new lifecycle_1.$jc();
                this.i.add([disposables]);
                const ret = await provider.provideNotebookKernelSourceActions(token);
                return (ret ?? []).map(item => extHostTypeConverters.NotebookKernelSourceAction.from(item, this.o.converter, disposables));
            }
            return [];
        }
        $acceptNotebookAssociation(handle, uri, value) {
            const obj = this.j.get(handle);
            if (obj) {
                // update data structure
                const notebook = this.n.getNotebookDocument(uri_1.URI.revive(uri));
                if (value) {
                    obj.associatedNotebooks.set(notebook.uri, true);
                }
                else {
                    obj.associatedNotebooks.delete(notebook.uri);
                }
                this.q.trace(`NotebookController[${handle}] ASSOCIATE notebook`, notebook.uri.toString(), value);
                // send event
                obj.onDidChangeSelection.fire({
                    selected: value,
                    notebook: notebook.apiNotebook
                });
            }
        }
        async $executeCells(handle, uri, handles) {
            const obj = this.j.get(handle);
            if (!obj) {
                // extension can dispose kernels in the meantime
                return;
            }
            const document = this.n.getNotebookDocument(uri_1.URI.revive(uri));
            const cells = [];
            for (const cellHandle of handles) {
                const cell = document.getCell(cellHandle);
                if (cell) {
                    cells.push(cell.apiCell);
                }
            }
            try {
                this.q.trace(`NotebookController[${handle}] EXECUTE cells`, document.uri.toString(), cells.length);
                await obj.controller.executeHandler.call(obj.controller, cells, document.apiNotebook, obj.controller);
            }
            catch (err) {
                //
                this.q.error(`NotebookController[${handle}] execute cells FAILED`, err);
                console.error(err);
            }
        }
        async $cancelCells(handle, uri, handles) {
            const obj = this.j.get(handle);
            if (!obj) {
                // extension can dispose kernels in the meantime
                return;
            }
            // cancel or interrupt depends on the controller. When an interrupt handler is used we
            // don't trigger the cancelation token of executions.
            const document = this.n.getNotebookDocument(uri_1.URI.revive(uri));
            if (obj.controller.interruptHandler) {
                await obj.controller.interruptHandler.call(obj.controller, document.apiNotebook);
            }
            else {
                for (const cellHandle of handles) {
                    const cell = document.getCell(cellHandle);
                    if (cell) {
                        this.b.get(cell.uri)?.cancel();
                    }
                }
            }
            if (obj.controller.interruptHandler) {
                // If we're interrupting all cells, we also need to cancel the notebook level execution.
                const items = this.c.get(document.uri);
                if (handles.length && Array.isArray(items) && items.length) {
                    items.forEach(d => d.dispose());
                }
            }
        }
        $acceptKernelMessageFromRenderer(handle, editorId, message) {
            const obj = this.j.get(handle);
            if (!obj) {
                // extension can dispose kernels in the meantime
                return;
            }
            const editor = this.n.getEditorById(editorId);
            obj.onDidReceiveMessage.fire(Object.freeze({ editor: editor.apiEditor, message }));
        }
        $cellExecutionChanged(uri, cellHandle, state) {
            const document = this.n.getNotebookDocument(uri_1.URI.revive(uri));
            const cell = document.getCell(cellHandle);
            if (cell) {
                const newState = state ? extHostTypeConverters.NotebookCellExecutionState.to(state) : extHostTypes_1.NotebookCellExecutionState.Idle;
                if (newState !== undefined) {
                    this.l.fire({
                        cell: cell.apiCell,
                        state: newState
                    });
                }
            }
        }
        // ---
        _createNotebookCellExecution(cell, controllerId) {
            if (cell.index < 0) {
                throw new Error('CANNOT execute cell that has been REMOVED from notebook');
            }
            const notebook = this.n.getNotebookDocument(cell.notebook.uri);
            const cellObj = notebook.getCellFromApiCell(cell);
            if (!cellObj) {
                throw new Error('invalid cell');
            }
            if (this.b.has(cellObj.uri)) {
                throw new Error(`duplicate execution for ${cellObj.uri}`);
            }
            const execution = new NotebookCellExecutionTask(controllerId, cellObj, this.a);
            this.b.set(cellObj.uri, execution);
            const listener = execution.onDidChangeState(() => {
                if (execution.state === NotebookCellExecutionTaskState.Resolved) {
                    execution.dispose();
                    listener.dispose();
                    this.b.delete(cellObj.uri);
                }
            });
            return execution.asApiObject();
        }
        // ---
        _createNotebookExecution(nb, controllerId) {
            const notebook = this.n.getNotebookDocument(nb.uri);
            const runningCell = nb.getCells().find(cell => {
                const apiCell = notebook.getCellFromApiCell(cell);
                return apiCell && this.b.has(apiCell.uri);
            });
            if (runningCell) {
                throw new Error(`duplicate cell execution for ${runningCell.document.uri}`);
            }
            if (this.c.has(notebook.uri)) {
                throw new Error(`duplicate notebook execution for ${notebook.uri}`);
            }
            const execution = new NotebookExecutionTask(controllerId, notebook, this.a);
            const listener = execution.onDidChangeState(() => {
                if (execution.state === NotebookExecutionTaskState.Resolved) {
                    execution.dispose();
                    listener.dispose();
                    this.c.delete(notebook.uri);
                }
            });
            this.c.set(notebook.uri, [execution, listener]);
            return execution.asApiObject();
        }
    };
    exports.$Tcc = $Tcc;
    exports.$Tcc = $Tcc = __decorate([
        __param(4, log_1.$5i)
    ], $Tcc);
    var NotebookCellExecutionTaskState;
    (function (NotebookCellExecutionTaskState) {
        NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Init"] = 0] = "Init";
        NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Started"] = 1] = "Started";
        NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Resolved"] = 2] = "Resolved";
    })(NotebookCellExecutionTaskState || (NotebookCellExecutionTaskState = {}));
    class NotebookCellExecutionTask extends lifecycle_1.$kc {
        static { this.a = 0; }
        get state() { return this.f; }
        constructor(controllerId, m, n) {
            super();
            this.m = m;
            this.n = n;
            this.b = NotebookCellExecutionTask.a++;
            this.c = new event_1.$fd();
            this.onDidChangeState = this.c.event;
            this.f = NotebookCellExecutionTaskState.Init;
            this.g = this.B(new cancellation_1.$pd());
            this.h = new TimeoutBasedCollector(10, updates => this.s(updates));
            this.j = m.internalMetadata.executionOrder;
            this.n.$createExecution(this.b, controllerId, this.m.notebook.uri, this.m.handle);
        }
        cancel() {
            this.g.cancel();
        }
        async r(update) {
            await this.h.addItem(update);
        }
        async s(update) {
            const updates = Array.isArray(update) ? update : [update];
            return this.n.$updateExecution(this.b, new proxyIdentifier_1.$dA(updates));
        }
        t() {
            if (this.f === NotebookCellExecutionTaskState.Init) {
                throw new Error('Must call start before modifying cell output');
            }
            if (this.f === NotebookCellExecutionTaskState.Resolved) {
                throw new Error('Cannot modify cell output after calling resolve');
            }
        }
        w(cellOrCellIndex) {
            let cell = this.m;
            if (cellOrCellIndex) {
                cell = this.m.notebook.getCellFromApiCell(cellOrCellIndex);
            }
            if (!cell) {
                throw new Error('INVALID cell');
            }
            return cell.handle;
        }
        y(items) {
            return items.map(output => {
                const newOutput = extHostTypes_1.$rL.ensureUniqueMimeTypes(output.items, true);
                if (newOutput === output.items) {
                    return extHostTypeConverters.NotebookCellOutput.from(output);
                }
                return extHostTypeConverters.NotebookCellOutput.from({
                    items: newOutput,
                    id: output.id,
                    metadata: output.metadata
                });
            });
        }
        async z(outputs, cell, append) {
            const handle = this.w(cell);
            const outputDtos = this.y((0, arrays_1.$1b)(outputs));
            return this.r({
                editType: notebookExecutionService_1.CellExecutionUpdateType.Output,
                cellHandle: handle,
                append,
                outputs: outputDtos
            });
        }
        async C(items, output, append) {
            items = extHostTypes_1.$rL.ensureUniqueMimeTypes((0, arrays_1.$1b)(items), true);
            return this.r({
                editType: notebookExecutionService_1.CellExecutionUpdateType.OutputItems,
                items: items.map(extHostTypeConverters.NotebookCellOutputItem.from),
                outputId: output.id,
                append
            });
        }
        asApiObject() {
            const that = this;
            const result = {
                get token() { return that.g.token; },
                get cell() { return that.m.apiCell; },
                get executionOrder() { return that.j; },
                set executionOrder(v) {
                    that.j = v;
                    that.s([{
                            editType: notebookExecutionService_1.CellExecutionUpdateType.ExecutionState,
                            executionOrder: that.j
                        }]);
                },
                start(startTime) {
                    if (that.f === NotebookCellExecutionTaskState.Resolved || that.f === NotebookCellExecutionTaskState.Started) {
                        throw new Error('Cannot call start again');
                    }
                    that.f = NotebookCellExecutionTaskState.Started;
                    that.c.fire();
                    that.s({
                        editType: notebookExecutionService_1.CellExecutionUpdateType.ExecutionState,
                        runStartTime: startTime
                    });
                },
                end(success, endTime) {
                    if (that.f === NotebookCellExecutionTaskState.Resolved) {
                        throw new Error('Cannot call resolve twice');
                    }
                    that.f = NotebookCellExecutionTaskState.Resolved;
                    that.c.fire();
                    // The last update needs to be ordered correctly and applied immediately,
                    // so we use updateSoon and immediately flush.
                    that.h.flush();
                    that.n.$completeExecution(that.b, new proxyIdentifier_1.$dA({
                        runEndTime: endTime,
                        lastRunSuccess: success
                    }));
                },
                clearOutput(cell) {
                    that.t();
                    return that.z([], cell, false);
                },
                appendOutput(outputs, cell) {
                    that.t();
                    return that.z(outputs, cell, true);
                },
                replaceOutput(outputs, cell) {
                    that.t();
                    return that.z(outputs, cell, false);
                },
                appendOutputItems(items, output) {
                    that.t();
                    return that.C(items, output, true);
                },
                replaceOutputItems(items, output) {
                    that.t();
                    return that.C(items, output, false);
                }
            };
            return Object.freeze(result);
        }
    }
    var NotebookExecutionTaskState;
    (function (NotebookExecutionTaskState) {
        NotebookExecutionTaskState[NotebookExecutionTaskState["Init"] = 0] = "Init";
        NotebookExecutionTaskState[NotebookExecutionTaskState["Started"] = 1] = "Started";
        NotebookExecutionTaskState[NotebookExecutionTaskState["Resolved"] = 2] = "Resolved";
    })(NotebookExecutionTaskState || (NotebookExecutionTaskState = {}));
    class NotebookExecutionTask extends lifecycle_1.$kc {
        static { this.a = 0; }
        get state() { return this.f; }
        constructor(controllerId, h, j) {
            super();
            this.h = h;
            this.j = j;
            this.b = NotebookExecutionTask.a++;
            this.c = new event_1.$fd();
            this.onDidChangeState = this.c.event;
            this.f = NotebookExecutionTaskState.Init;
            this.g = this.B(new cancellation_1.$pd());
            this.j.$createNotebookExecution(this.b, controllerId, this.h.uri);
        }
        cancel() {
            this.g.cancel();
        }
        asApiObject() {
            const result = {
                start: () => {
                    if (this.f === NotebookExecutionTaskState.Resolved || this.f === NotebookExecutionTaskState.Started) {
                        throw new Error('Cannot call start again');
                    }
                    this.f = NotebookExecutionTaskState.Started;
                    this.c.fire();
                    this.j.$beginNotebookExecution(this.b);
                },
                end: () => {
                    if (this.f === NotebookExecutionTaskState.Resolved) {
                        throw new Error('Cannot call resolve twice');
                    }
                    this.f = NotebookExecutionTaskState.Resolved;
                    this.c.fire();
                    this.j.$completeNotebookExecution(this.b);
                },
            };
            return Object.freeze(result);
        }
    }
    class TimeoutBasedCollector {
        constructor(e, f) {
            this.e = e;
            this.f = f;
            this.a = [];
            this.b = Date.now();
        }
        addItem(item) {
            this.a.push(item);
            if (!this.c) {
                this.c = new async_1.$2g();
                this.b = Date.now();
                (0, async_1.$Hg)(this.e).then(() => {
                    return this.flush();
                });
            }
            // This can be called by the extension repeatedly for a long time before the timeout is able to run.
            // Force a flush after the delay.
            if (Date.now() - this.b > this.e) {
                return this.flush();
            }
            return this.c.p;
        }
        flush() {
            if (this.a.length === 0 || !this.c) {
                return Promise.resolve();
            }
            const deferred = this.c;
            this.c = undefined;
            const batch = this.a;
            this.a = [];
            return this.f(batch)
                .finally(() => deferred.complete());
        }
    }
    function $Ucc(extensionIdentifier, id) {
        return `${extensionIdentifier.value}/${id}`;
    }
    exports.$Ucc = $Ucc;
});
//# sourceMappingURL=extHostNotebookKernels.js.map