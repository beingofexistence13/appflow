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
    exports.createKernelId = exports.ExtHostNotebookKernels = void 0;
    let ExtHostNotebookKernels = class ExtHostNotebookKernels {
        constructor(mainContext, _initData, _extHostNotebook, _commands, _logService) {
            this._initData = _initData;
            this._extHostNotebook = _extHostNotebook;
            this._commands = _commands;
            this._logService = _logService;
            this._activeExecutions = new map_1.ResourceMap();
            this._activeNotebookExecutions = new map_1.ResourceMap();
            this._kernelDetectionTask = new Map();
            this._kernelDetectionTaskHandlePool = 0;
            this._kernelSourceActionProviders = new Map();
            this._kernelSourceActionProviderHandlePool = 0;
            this._kernelSourceActionProviderCache = new cache_1.Cache('NotebookKernelSourceActionProviderCache');
            this._kernelData = new Map();
            this._handlePool = 0;
            this._onDidChangeCellExecutionState = new event_1.Emitter();
            this.onDidChangeNotebookCellExecutionState = this._onDidChangeCellExecutionState.event;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadNotebookKernels);
            // todo@rebornix @joyceerhl: move to APICommands once stabilized.
            const selectKernelApiCommand = new extHostCommands_1.ApiCommand('notebook.selectKernel', '_notebook.selectKernel', 'Trigger kernel picker for specified notebook editor widget', [
                new extHostCommands_1.ApiCommandArgument('options', 'Select kernel options', v => true, (v) => {
                    if (v && 'notebookEditor' in v && 'id' in v) {
                        const notebookEditorId = this._extHostNotebook.getIdByEditor(v.notebookEditor);
                        return {
                            id: v.id, extension: v.extension, notebookEditorId
                        };
                    }
                    else if (v && 'notebookEditor' in v) {
                        const notebookEditorId = this._extHostNotebook.getIdByEditor(v.notebookEditor);
                        if (notebookEditorId === undefined) {
                            throw new Error(`Cannot invoke 'notebook.selectKernel' for unrecognized notebook editor ${v.notebookEditor.notebook.uri.toString()}`);
                        }
                        return { notebookEditorId };
                    }
                    return v;
                })
            ], extHostCommands_1.ApiCommandResult.Void);
            this._commands.registerApiCommand(selectKernelApiCommand);
        }
        createNotebookController(extension, id, viewType, label, handler, preloads) {
            for (const data of this._kernelData.values()) {
                if (data.controller.id === id && extensions_1.ExtensionIdentifier.equals(extension.identifier, data.extensionId)) {
                    throw new Error(`notebook controller with id '${id}' ALREADY exist`);
                }
            }
            const handle = this._handlePool++;
            const that = this;
            this._logService.trace(`NotebookController[${handle}], CREATED by ${extension.identifier.value}, ${id}`);
            const _defaultExecutHandler = () => console.warn(`NO execute handler from notebook controller '${data.id}' of extension: '${extension.identifier}'`);
            let isDisposed = false;
            const onDidChangeSelection = new event_1.Emitter();
            const onDidReceiveMessage = new event_1.Emitter();
            const data = {
                id: createKernelId(extension.identifier, id),
                notebookType: viewType,
                extensionId: extension.identifier,
                extensionLocation: extension.extensionLocation,
                label: label || extension.identifier.value,
                preloads: preloads ? preloads.map(extHostTypeConverters.NotebookRendererScript.from) : []
            };
            //
            let _executeHandler = handler ?? _defaultExecutHandler;
            let _interruptHandler;
            this._proxy.$addKernel(handle, data).catch(err => {
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
                        this._proxy.$updateKernel(handle, data);
                    }
                });
            };
            // notebook documents that are associated to this controller
            const associatedNotebooks = new map_1.ResourceMap();
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
                        that._logService.trace(`NotebookController[${handle}] NOT associated to notebook, associated to THESE notebooks:`, Array.from(associatedNotebooks.keys()).map(u => u.toString()));
                        throw new Error(`notebook controller is NOT associated to notebook: ${cell.notebook.uri.toString()}`);
                    }
                    return that._createNotebookCellExecution(cell, createKernelId(extension.identifier, this.id));
                },
                createNotebookExecution(notebook) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'notebookExecution');
                    if (isDisposed) {
                        throw new Error('notebook controller is DISPOSED');
                    }
                    if (!associatedNotebooks.has(notebook.uri)) {
                        that._logService.trace(`NotebookController[${handle}] NOT associated to notebook, associated to THESE notebooks:`, Array.from(associatedNotebooks.keys()).map(u => u.toString()));
                        throw new Error(`notebook controller is NOT associated to notebook: ${notebook.uri.toString()}`);
                    }
                    return that._createNotebookExecution(notebook, createKernelId(extension.identifier, this.id));
                },
                dispose: () => {
                    if (!isDisposed) {
                        this._logService.trace(`NotebookController[${handle}], DISPOSED`);
                        isDisposed = true;
                        this._kernelData.delete(handle);
                        onDidChangeSelection.dispose();
                        onDidReceiveMessage.dispose();
                        this._proxy.$removeKernel(handle);
                    }
                },
                // --- priority
                updateNotebookAffinity(notebook, priority) {
                    if (priority === extHostTypes_1.NotebookControllerAffinity2.Hidden) {
                        // This api only adds an extra enum value, the function is the same, so just gate on the new value being passed
                        // for proposedAPI check.
                        (0, extensions_2.checkProposedApiEnabled)(extension, 'notebookControllerAffinityHidden');
                    }
                    that._proxy.$updateNotebookPriority(handle, notebook.uri, priority);
                },
                // --- ipc
                onDidReceiveMessage: onDidReceiveMessage.event,
                postMessage(message, editor) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'notebookMessaging');
                    return that._proxy.$postMessage(handle, editor && that._extHostNotebook.getIdByEditor(editor), message);
                },
                asWebviewUri(uri) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'notebookMessaging');
                    return (0, webview_1.asWebviewUri)(uri, that._initData.remote);
                },
            };
            this._kernelData.set(handle, {
                extensionId: extension.identifier,
                controller,
                onDidReceiveMessage,
                onDidChangeSelection,
                associatedNotebooks
            });
            return controller;
        }
        getIdByController(controller) {
            for (const [_, candidate] of this._kernelData) {
                if (candidate.controller === controller) {
                    return createKernelId(candidate.extensionId, controller.id);
                }
            }
            return null;
        }
        createNotebookControllerDetectionTask(extension, viewType) {
            const handle = this._kernelDetectionTaskHandlePool++;
            const that = this;
            this._logService.trace(`NotebookControllerDetectionTask[${handle}], CREATED by ${extension.identifier.value}`);
            this._proxy.$addKernelDetectionTask(handle, viewType);
            const detectionTask = {
                dispose: () => {
                    this._kernelDetectionTask.delete(handle);
                    that._proxy.$removeKernelDetectionTask(handle);
                }
            };
            this._kernelDetectionTask.set(handle, detectionTask);
            return detectionTask;
        }
        registerKernelSourceActionProvider(extension, viewType, provider) {
            const handle = this._kernelSourceActionProviderHandlePool++;
            const eventHandle = typeof provider.onDidChangeNotebookKernelSourceActions === 'function' ? handle : undefined;
            const that = this;
            this._kernelSourceActionProviders.set(handle, provider);
            this._logService.trace(`NotebookKernelSourceActionProvider[${handle}], CREATED by ${extension.identifier.value}`);
            this._proxy.$addKernelSourceActionProvider(handle, handle, viewType);
            let subscription;
            if (eventHandle !== undefined) {
                subscription = provider.onDidChangeNotebookKernelSourceActions(_ => this._proxy.$emitNotebookKernelSourceActionsChangeEvent(eventHandle));
            }
            return {
                dispose: () => {
                    this._kernelSourceActionProviders.delete(handle);
                    that._proxy.$removeKernelSourceActionProvider(handle, handle);
                    subscription?.dispose();
                }
            };
        }
        async $provideKernelSourceActions(handle, token) {
            const provider = this._kernelSourceActionProviders.get(handle);
            if (provider) {
                const disposables = new lifecycle_1.DisposableStore();
                this._kernelSourceActionProviderCache.add([disposables]);
                const ret = await provider.provideNotebookKernelSourceActions(token);
                return (ret ?? []).map(item => extHostTypeConverters.NotebookKernelSourceAction.from(item, this._commands.converter, disposables));
            }
            return [];
        }
        $acceptNotebookAssociation(handle, uri, value) {
            const obj = this._kernelData.get(handle);
            if (obj) {
                // update data structure
                const notebook = this._extHostNotebook.getNotebookDocument(uri_1.URI.revive(uri));
                if (value) {
                    obj.associatedNotebooks.set(notebook.uri, true);
                }
                else {
                    obj.associatedNotebooks.delete(notebook.uri);
                }
                this._logService.trace(`NotebookController[${handle}] ASSOCIATE notebook`, notebook.uri.toString(), value);
                // send event
                obj.onDidChangeSelection.fire({
                    selected: value,
                    notebook: notebook.apiNotebook
                });
            }
        }
        async $executeCells(handle, uri, handles) {
            const obj = this._kernelData.get(handle);
            if (!obj) {
                // extension can dispose kernels in the meantime
                return;
            }
            const document = this._extHostNotebook.getNotebookDocument(uri_1.URI.revive(uri));
            const cells = [];
            for (const cellHandle of handles) {
                const cell = document.getCell(cellHandle);
                if (cell) {
                    cells.push(cell.apiCell);
                }
            }
            try {
                this._logService.trace(`NotebookController[${handle}] EXECUTE cells`, document.uri.toString(), cells.length);
                await obj.controller.executeHandler.call(obj.controller, cells, document.apiNotebook, obj.controller);
            }
            catch (err) {
                //
                this._logService.error(`NotebookController[${handle}] execute cells FAILED`, err);
                console.error(err);
            }
        }
        async $cancelCells(handle, uri, handles) {
            const obj = this._kernelData.get(handle);
            if (!obj) {
                // extension can dispose kernels in the meantime
                return;
            }
            // cancel or interrupt depends on the controller. When an interrupt handler is used we
            // don't trigger the cancelation token of executions.
            const document = this._extHostNotebook.getNotebookDocument(uri_1.URI.revive(uri));
            if (obj.controller.interruptHandler) {
                await obj.controller.interruptHandler.call(obj.controller, document.apiNotebook);
            }
            else {
                for (const cellHandle of handles) {
                    const cell = document.getCell(cellHandle);
                    if (cell) {
                        this._activeExecutions.get(cell.uri)?.cancel();
                    }
                }
            }
            if (obj.controller.interruptHandler) {
                // If we're interrupting all cells, we also need to cancel the notebook level execution.
                const items = this._activeNotebookExecutions.get(document.uri);
                if (handles.length && Array.isArray(items) && items.length) {
                    items.forEach(d => d.dispose());
                }
            }
        }
        $acceptKernelMessageFromRenderer(handle, editorId, message) {
            const obj = this._kernelData.get(handle);
            if (!obj) {
                // extension can dispose kernels in the meantime
                return;
            }
            const editor = this._extHostNotebook.getEditorById(editorId);
            obj.onDidReceiveMessage.fire(Object.freeze({ editor: editor.apiEditor, message }));
        }
        $cellExecutionChanged(uri, cellHandle, state) {
            const document = this._extHostNotebook.getNotebookDocument(uri_1.URI.revive(uri));
            const cell = document.getCell(cellHandle);
            if (cell) {
                const newState = state ? extHostTypeConverters.NotebookCellExecutionState.to(state) : extHostTypes_1.NotebookCellExecutionState.Idle;
                if (newState !== undefined) {
                    this._onDidChangeCellExecutionState.fire({
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
            const notebook = this._extHostNotebook.getNotebookDocument(cell.notebook.uri);
            const cellObj = notebook.getCellFromApiCell(cell);
            if (!cellObj) {
                throw new Error('invalid cell');
            }
            if (this._activeExecutions.has(cellObj.uri)) {
                throw new Error(`duplicate execution for ${cellObj.uri}`);
            }
            const execution = new NotebookCellExecutionTask(controllerId, cellObj, this._proxy);
            this._activeExecutions.set(cellObj.uri, execution);
            const listener = execution.onDidChangeState(() => {
                if (execution.state === NotebookCellExecutionTaskState.Resolved) {
                    execution.dispose();
                    listener.dispose();
                    this._activeExecutions.delete(cellObj.uri);
                }
            });
            return execution.asApiObject();
        }
        // ---
        _createNotebookExecution(nb, controllerId) {
            const notebook = this._extHostNotebook.getNotebookDocument(nb.uri);
            const runningCell = nb.getCells().find(cell => {
                const apiCell = notebook.getCellFromApiCell(cell);
                return apiCell && this._activeExecutions.has(apiCell.uri);
            });
            if (runningCell) {
                throw new Error(`duplicate cell execution for ${runningCell.document.uri}`);
            }
            if (this._activeNotebookExecutions.has(notebook.uri)) {
                throw new Error(`duplicate notebook execution for ${notebook.uri}`);
            }
            const execution = new NotebookExecutionTask(controllerId, notebook, this._proxy);
            const listener = execution.onDidChangeState(() => {
                if (execution.state === NotebookExecutionTaskState.Resolved) {
                    execution.dispose();
                    listener.dispose();
                    this._activeNotebookExecutions.delete(notebook.uri);
                }
            });
            this._activeNotebookExecutions.set(notebook.uri, [execution, listener]);
            return execution.asApiObject();
        }
    };
    exports.ExtHostNotebookKernels = ExtHostNotebookKernels;
    exports.ExtHostNotebookKernels = ExtHostNotebookKernels = __decorate([
        __param(4, log_1.ILogService)
    ], ExtHostNotebookKernels);
    var NotebookCellExecutionTaskState;
    (function (NotebookCellExecutionTaskState) {
        NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Init"] = 0] = "Init";
        NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Started"] = 1] = "Started";
        NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Resolved"] = 2] = "Resolved";
    })(NotebookCellExecutionTaskState || (NotebookCellExecutionTaskState = {}));
    class NotebookCellExecutionTask extends lifecycle_1.Disposable {
        static { this.HANDLE = 0; }
        get state() { return this._state; }
        constructor(controllerId, _cell, _proxy) {
            super();
            this._cell = _cell;
            this._proxy = _proxy;
            this._handle = NotebookCellExecutionTask.HANDLE++;
            this._onDidChangeState = new event_1.Emitter();
            this.onDidChangeState = this._onDidChangeState.event;
            this._state = NotebookCellExecutionTaskState.Init;
            this._tokenSource = this._register(new cancellation_1.CancellationTokenSource());
            this._collector = new TimeoutBasedCollector(10, updates => this.update(updates));
            this._executionOrder = _cell.internalMetadata.executionOrder;
            this._proxy.$createExecution(this._handle, controllerId, this._cell.notebook.uri, this._cell.handle);
        }
        cancel() {
            this._tokenSource.cancel();
        }
        async updateSoon(update) {
            await this._collector.addItem(update);
        }
        async update(update) {
            const updates = Array.isArray(update) ? update : [update];
            return this._proxy.$updateExecution(this._handle, new proxyIdentifier_1.SerializableObjectWithBuffers(updates));
        }
        verifyStateForOutput() {
            if (this._state === NotebookCellExecutionTaskState.Init) {
                throw new Error('Must call start before modifying cell output');
            }
            if (this._state === NotebookCellExecutionTaskState.Resolved) {
                throw new Error('Cannot modify cell output after calling resolve');
            }
        }
        cellIndexToHandle(cellOrCellIndex) {
            let cell = this._cell;
            if (cellOrCellIndex) {
                cell = this._cell.notebook.getCellFromApiCell(cellOrCellIndex);
            }
            if (!cell) {
                throw new Error('INVALID cell');
            }
            return cell.handle;
        }
        validateAndConvertOutputs(items) {
            return items.map(output => {
                const newOutput = extHostTypes_1.NotebookCellOutput.ensureUniqueMimeTypes(output.items, true);
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
        async updateOutputs(outputs, cell, append) {
            const handle = this.cellIndexToHandle(cell);
            const outputDtos = this.validateAndConvertOutputs((0, arrays_1.asArray)(outputs));
            return this.updateSoon({
                editType: notebookExecutionService_1.CellExecutionUpdateType.Output,
                cellHandle: handle,
                append,
                outputs: outputDtos
            });
        }
        async updateOutputItems(items, output, append) {
            items = extHostTypes_1.NotebookCellOutput.ensureUniqueMimeTypes((0, arrays_1.asArray)(items), true);
            return this.updateSoon({
                editType: notebookExecutionService_1.CellExecutionUpdateType.OutputItems,
                items: items.map(extHostTypeConverters.NotebookCellOutputItem.from),
                outputId: output.id,
                append
            });
        }
        asApiObject() {
            const that = this;
            const result = {
                get token() { return that._tokenSource.token; },
                get cell() { return that._cell.apiCell; },
                get executionOrder() { return that._executionOrder; },
                set executionOrder(v) {
                    that._executionOrder = v;
                    that.update([{
                            editType: notebookExecutionService_1.CellExecutionUpdateType.ExecutionState,
                            executionOrder: that._executionOrder
                        }]);
                },
                start(startTime) {
                    if (that._state === NotebookCellExecutionTaskState.Resolved || that._state === NotebookCellExecutionTaskState.Started) {
                        throw new Error('Cannot call start again');
                    }
                    that._state = NotebookCellExecutionTaskState.Started;
                    that._onDidChangeState.fire();
                    that.update({
                        editType: notebookExecutionService_1.CellExecutionUpdateType.ExecutionState,
                        runStartTime: startTime
                    });
                },
                end(success, endTime) {
                    if (that._state === NotebookCellExecutionTaskState.Resolved) {
                        throw new Error('Cannot call resolve twice');
                    }
                    that._state = NotebookCellExecutionTaskState.Resolved;
                    that._onDidChangeState.fire();
                    // The last update needs to be ordered correctly and applied immediately,
                    // so we use updateSoon and immediately flush.
                    that._collector.flush();
                    that._proxy.$completeExecution(that._handle, new proxyIdentifier_1.SerializableObjectWithBuffers({
                        runEndTime: endTime,
                        lastRunSuccess: success
                    }));
                },
                clearOutput(cell) {
                    that.verifyStateForOutput();
                    return that.updateOutputs([], cell, false);
                },
                appendOutput(outputs, cell) {
                    that.verifyStateForOutput();
                    return that.updateOutputs(outputs, cell, true);
                },
                replaceOutput(outputs, cell) {
                    that.verifyStateForOutput();
                    return that.updateOutputs(outputs, cell, false);
                },
                appendOutputItems(items, output) {
                    that.verifyStateForOutput();
                    return that.updateOutputItems(items, output, true);
                },
                replaceOutputItems(items, output) {
                    that.verifyStateForOutput();
                    return that.updateOutputItems(items, output, false);
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
    class NotebookExecutionTask extends lifecycle_1.Disposable {
        static { this.HANDLE = 0; }
        get state() { return this._state; }
        constructor(controllerId, _notebook, _proxy) {
            super();
            this._notebook = _notebook;
            this._proxy = _proxy;
            this._handle = NotebookExecutionTask.HANDLE++;
            this._onDidChangeState = new event_1.Emitter();
            this.onDidChangeState = this._onDidChangeState.event;
            this._state = NotebookExecutionTaskState.Init;
            this._tokenSource = this._register(new cancellation_1.CancellationTokenSource());
            this._proxy.$createNotebookExecution(this._handle, controllerId, this._notebook.uri);
        }
        cancel() {
            this._tokenSource.cancel();
        }
        asApiObject() {
            const result = {
                start: () => {
                    if (this._state === NotebookExecutionTaskState.Resolved || this._state === NotebookExecutionTaskState.Started) {
                        throw new Error('Cannot call start again');
                    }
                    this._state = NotebookExecutionTaskState.Started;
                    this._onDidChangeState.fire();
                    this._proxy.$beginNotebookExecution(this._handle);
                },
                end: () => {
                    if (this._state === NotebookExecutionTaskState.Resolved) {
                        throw new Error('Cannot call resolve twice');
                    }
                    this._state = NotebookExecutionTaskState.Resolved;
                    this._onDidChangeState.fire();
                    this._proxy.$completeNotebookExecution(this._handle);
                },
            };
            return Object.freeze(result);
        }
    }
    class TimeoutBasedCollector {
        constructor(delay, callback) {
            this.delay = delay;
            this.callback = callback;
            this.batch = [];
            this.startedTimer = Date.now();
        }
        addItem(item) {
            this.batch.push(item);
            if (!this.currentDeferred) {
                this.currentDeferred = new async_1.DeferredPromise();
                this.startedTimer = Date.now();
                (0, async_1.timeout)(this.delay).then(() => {
                    return this.flush();
                });
            }
            // This can be called by the extension repeatedly for a long time before the timeout is able to run.
            // Force a flush after the delay.
            if (Date.now() - this.startedTimer > this.delay) {
                return this.flush();
            }
            return this.currentDeferred.p;
        }
        flush() {
            if (this.batch.length === 0 || !this.currentDeferred) {
                return Promise.resolve();
            }
            const deferred = this.currentDeferred;
            this.currentDeferred = undefined;
            const batch = this.batch;
            this.batch = [];
            return this.callback(batch)
                .finally(() => deferred.complete());
        }
    }
    function createKernelId(extensionIdentifier, id) {
        return `${extensionIdentifier.value}/${id}`;
    }
    exports.createKernelId = createKernelId;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE5vdGVib29rS2VybmVscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3ROb3RlYm9va0tlcm5lbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBdUN6RixJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUFzQjtRQW1CbEMsWUFDQyxXQUF5QixFQUNSLFNBQWtDLEVBQ2xDLGdCQUEyQyxFQUNwRCxTQUEwQixFQUNyQixXQUF5QztZQUhyQyxjQUFTLEdBQVQsU0FBUyxDQUF5QjtZQUNsQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTJCO1lBQ3BELGNBQVMsR0FBVCxTQUFTLENBQWlCO1lBQ0osZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFyQnRDLHNCQUFpQixHQUFHLElBQUksaUJBQVcsRUFBNkIsQ0FBQztZQUNqRSw4QkFBeUIsR0FBRyxJQUFJLGlCQUFXLEVBQXdDLENBQUM7WUFFN0YseUJBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQWtELENBQUM7WUFDakYsbUNBQThCLEdBQVcsQ0FBQyxDQUFDO1lBRTNDLGlDQUE0QixHQUFHLElBQUksR0FBRyxFQUFxRCxDQUFDO1lBQzVGLDBDQUFxQyxHQUFXLENBQUMsQ0FBQztZQUNsRCxxQ0FBZ0MsR0FBRyxJQUFJLGFBQUssQ0FBYyx5Q0FBeUMsQ0FBQyxDQUFDO1lBRTVGLGdCQUFXLEdBQUcsSUFBSSxHQUFHLEVBQXVCLENBQUM7WUFDdEQsZ0JBQVcsR0FBVyxDQUFDLENBQUM7WUFFZixtQ0FBOEIsR0FBRyxJQUFJLGVBQU8sRUFBZ0QsQ0FBQztZQUNyRywwQ0FBcUMsR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsS0FBSyxDQUFDO1lBUzFGLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLHlC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