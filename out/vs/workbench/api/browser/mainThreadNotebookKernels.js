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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/workbench/api/browser/mainThreadNotebookDto", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookKernelService", "../common/extHost.protocol", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, arrays_1, cancellation_1, errors_1, event_1, lifecycle_1, uri_1, language_1, mainThreadNotebookDto_1, extHostCustomers_1, notebookEditorService_1, notebookExecutionStateService_1, notebookKernelService_1, extHost_protocol_1, notebookService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadNotebookKernels = void 0;
    class MainThreadKernel {
        get preloadUris() {
            return this.preloads.map(p => p.uri);
        }
        get preloadProvides() {
            return this.preloads.map(p => p.provides).flat();
        }
        constructor(data, _languageService) {
            this._languageService = _languageService;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this.id = data.id;
            this.viewType = data.notebookType;
            this.extension = data.extensionId;
            this.implementsInterrupt = data.supportsInterrupt ?? false;
            this.label = data.label;
            this.description = data.description;
            this.detail = data.detail;
            this.supportedLanguages = (0, arrays_1.isNonEmptyArray)(data.supportedLanguages) ? data.supportedLanguages : _languageService.getRegisteredLanguageIds();
            this.implementsExecutionOrder = data.supportsExecutionOrder ?? false;
            this.localResourceRoot = uri_1.URI.revive(data.extensionLocation);
            this.preloads = data.preloads?.map(u => ({ uri: uri_1.URI.revive(u.uri), provides: u.provides })) ?? [];
        }
        update(data) {
            const event = Object.create(null);
            if (data.label !== undefined) {
                this.label = data.label;
                event.label = true;
            }
            if (data.description !== undefined) {
                this.description = data.description;
                event.description = true;
            }
            if (data.detail !== undefined) {
                this.detail = data.detail;
                event.detail = true;
            }
            if (data.supportedLanguages !== undefined) {
                this.supportedLanguages = (0, arrays_1.isNonEmptyArray)(data.supportedLanguages) ? data.supportedLanguages : this._languageService.getRegisteredLanguageIds();
                event.supportedLanguages = true;
            }
            if (data.supportsExecutionOrder !== undefined) {
                this.implementsExecutionOrder = data.supportsExecutionOrder;
                event.hasExecutionOrder = true;
            }
            if (data.supportsInterrupt !== undefined) {
                this.implementsInterrupt = data.supportsInterrupt;
                event.hasInterruptHandler = true;
            }
            this._onDidChange.fire(event);
        }
    }
    class MainThreadKernelDetectionTask {
        constructor(notebookType) {
            this.notebookType = notebookType;
        }
    }
    let MainThreadNotebookKernels = class MainThreadNotebookKernels {
        constructor(extHostContext, _languageService, _notebookKernelService, _notebookExecutionStateService, _notebookService, notebookEditorService) {
            this._languageService = _languageService;
            this._notebookKernelService = _notebookKernelService;
            this._notebookExecutionStateService = _notebookExecutionStateService;
            this._notebookService = _notebookService;
            this._editors = new lifecycle_1.DisposableMap();
            this._disposables = new lifecycle_1.DisposableStore();
            this._kernels = new Map();
            this._kernelDetectionTasks = new Map();
            this._kernelSourceActionProviders = new Map();
            this._kernelSourceActionProvidersEventRegistrations = new Map();
            this._executions = new Map();
            this._notebookExecutions = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostNotebookKernels);
            notebookEditorService.listNotebookEditors().forEach(this._onEditorAdd, this);
            notebookEditorService.onDidAddNotebookEditor(this._onEditorAdd, this, this._disposables);
            notebookEditorService.onDidRemoveNotebookEditor(this._onEditorRemove, this, this._disposables);
            this._disposables.add((0, lifecycle_1.toDisposable)(() => {
                // EH shut down, complete all executions started by this EH
                this._executions.forEach(e => {
                    e.complete({});
                });
                this._notebookExecutions.forEach(e => e.complete());
            }));
            this._disposables.add(this._notebookExecutionStateService.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell) {
                    this._proxy.$cellExecutionChanged(e.notebook, e.cellHandle, e.changed?.state);
                }
            }));
        }
        dispose() {
            this._disposables.dispose();
            for (const [, registration] of this._kernels.values()) {
                registration.dispose();
            }
            for (const [, registration] of this._kernelDetectionTasks.values()) {
                registration.dispose();
            }
            for (const [, registration] of this._kernelSourceActionProviders.values()) {
                registration.dispose();
            }
            this._editors.dispose();
        }
        // --- kernel ipc
        _onEditorAdd(editor) {
            const ipcListener = editor.onDidReceiveMessage(e => {
                if (!editor.hasModel()) {
                    return;
                }
                const { selected } = this._notebookKernelService.getMatchingKernel(editor.textModel);
                if (!selected) {
                    return;
                }
                for (const [handle, candidate] of this._kernels) {
                    if (candidate[0] === selected) {
                        this._proxy.$acceptKernelMessageFromRenderer(handle, editor.getId(), e.message);
                        break;
                    }
                }
            });
            this._editors.set(editor, ipcListener);
        }
        _onEditorRemove(editor) {
            this._editors.deleteAndDispose(editor);
        }
        async $postMessage(handle, editorId, message) {
            const tuple = this._kernels.get(handle);
            if (!tuple) {
                throw new Error('kernel already disposed');
            }
            const [kernel] = tuple;
            let didSend = false;
            for (const [editor] of this._editors) {
                if (!editor.hasModel()) {
                    continue;
                }
                if (this._notebookKernelService.getMatchingKernel(editor.textModel).selected !== kernel) {
                    // different kernel
                    continue;
                }
                if (editorId === undefined) {
                    // all editors
                    editor.postMessage(message);
                    didSend = true;
                }
                else if (editor.getId() === editorId) {
                    // selected editors
                    editor.postMessage(message);
                    didSend = true;
                    break;
                }
            }
            return didSend;
        }
        // --- kernel adding/updating/removal
        async $addKernel(handle, data) {
            const that = this;
            const kernel = new class extends MainThreadKernel {
                async executeNotebookCellsRequest(uri, handles) {
                    await that._proxy.$executeCells(handle, uri, handles);
                }
                async cancelNotebookCellExecution(uri, handles) {
                    await that._proxy.$cancelCells(handle, uri, handles);
                }
            }(data, this._languageService);
            const listener = this._notebookKernelService.onDidChangeSelectedNotebooks(e => {
                if (e.oldKernel === kernel.id) {
                    this._proxy.$acceptNotebookAssociation(handle, e.notebook, false);
                }
                else if (e.newKernel === kernel.id) {
                    this._proxy.$acceptNotebookAssociation(handle, e.notebook, true);
                }
            });
            const registration = this._notebookKernelService.registerKernel(kernel);
            this._kernels.set(handle, [kernel, (0, lifecycle_1.combinedDisposable)(listener, registration)]);
        }
        $updateKernel(handle, data) {
            const tuple = this._kernels.get(handle);
            if (tuple) {
                tuple[0].update(data);
            }
        }
        $removeKernel(handle) {
            const tuple = this._kernels.get(handle);
            if (tuple) {
                tuple[1].dispose();
                this._kernels.delete(handle);
            }
        }
        $updateNotebookPriority(handle, notebook, value) {
            const tuple = this._kernels.get(handle);
            if (tuple) {
                this._notebookKernelService.updateKernelNotebookAffinity(tuple[0], uri_1.URI.revive(notebook), value);
            }
        }
        // --- Cell execution
        $createExecution(handle, controllerId, rawUri, cellHandle) {
            const uri = uri_1.URI.revive(rawUri);
            const notebook = this._notebookService.getNotebookTextModel(uri);
            if (!notebook) {
                throw new Error(`Notebook not found: ${uri.toString()}`);
            }
            const kernel = this._notebookKernelService.getMatchingKernel(notebook);
            if (!kernel.selected || kernel.selected.id !== controllerId) {
                throw new Error(`Kernel is not selected: ${kernel.selected?.id} !== ${controllerId}`);
            }
            const execution = this._notebookExecutionStateService.createCellExecution(uri, cellHandle);
            execution.confirm();
            this._executions.set(handle, execution);
        }
        $updateExecution(handle, data) {
            const updates = data.value;
            try {
                const execution = this._executions.get(handle);
                execution?.update(updates.map(mainThreadNotebookDto_1.NotebookDto.fromCellExecuteUpdateDto));
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
            }
        }
        $completeExecution(handle, data) {
            try {
                const execution = this._executions.get(handle);
                execution?.complete(mainThreadNotebookDto_1.NotebookDto.fromCellExecuteCompleteDto(data.value));
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
            }
            finally {
                this._executions.delete(handle);
            }
        }
        // --- Notebook execution
        $createNotebookExecution(handle, controllerId, rawUri) {
            const uri = uri_1.URI.revive(rawUri);
            const notebook = this._notebookService.getNotebookTextModel(uri);
            if (!notebook) {
                throw new Error(`Notebook not found: ${uri.toString()}`);
            }
            const kernel = this._notebookKernelService.getMatchingKernel(notebook);
            if (!kernel.selected || kernel.selected.id !== controllerId) {
                throw new Error(`Kernel is not selected: ${kernel.selected?.id} !== ${controllerId}`);
            }
            const execution = this._notebookExecutionStateService.createExecution(uri);
            execution.confirm();
            this._notebookExecutions.set(handle, execution);
        }
        $beginNotebookExecution(handle) {
            try {
                const execution = this._notebookExecutions.get(handle);
                execution?.begin();
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
            }
        }
        $completeNotebookExecution(handle) {
            try {
                const execution = this._notebookExecutions.get(handle);
                execution?.complete();
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
            }
            finally {
                this._notebookExecutions.delete(handle);
            }
        }
        // --- notebook kernel detection task
        async $addKernelDetectionTask(handle, notebookType) {
            const kernelDetectionTask = new MainThreadKernelDetectionTask(notebookType);
            const registration = this._notebookKernelService.registerNotebookKernelDetectionTask(kernelDetectionTask);
            this._kernelDetectionTasks.set(handle, [kernelDetectionTask, registration]);
        }
        $removeKernelDetectionTask(handle) {
            const tuple = this._kernelDetectionTasks.get(handle);
            if (tuple) {
                tuple[1].dispose();
                this._kernelDetectionTasks.delete(handle);
            }
        }
        // --- notebook kernel source action provider
        async $addKernelSourceActionProvider(handle, eventHandle, notebookType) {
            const kernelSourceActionProvider = {
                viewType: notebookType,
                provideKernelSourceActions: async () => {
                    const actions = await this._proxy.$provideKernelSourceActions(handle, cancellation_1.CancellationToken.None);
                    return actions.map(action => {
                        let documentation = action.documentation;
                        if (action.documentation && typeof action.documentation !== 'string') {
                            documentation = uri_1.URI.revive(action.documentation);
                        }
                        return {
                            label: action.label,
                            command: action.command,
                            description: action.description,
                            detail: action.detail,
                            documentation,
                        };
                    });
                }
            };
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.Emitter();
                this._kernelSourceActionProvidersEventRegistrations.set(eventHandle, emitter);
                kernelSourceActionProvider.onDidChangeSourceActions = emitter.event;
            }
            const registration = this._notebookKernelService.registerKernelSourceActionProvider(notebookType, kernelSourceActionProvider);
            this._kernelSourceActionProviders.set(handle, [kernelSourceActionProvider, registration]);
        }
        $removeKernelSourceActionProvider(handle, eventHandle) {
            const tuple = this._kernelSourceActionProviders.get(handle);
            if (tuple) {
                tuple[1].dispose();
                this._kernelSourceActionProviders.delete(handle);
            }
            if (typeof eventHandle === 'number') {
                this._kernelSourceActionProvidersEventRegistrations.delete(eventHandle);
            }
        }
        $emitNotebookKernelSourceActionsChangeEvent(eventHandle) {
            const emitter = this._kernelSourceActionProvidersEventRegistrations.get(eventHandle);
            if (emitter instanceof event_1.Emitter) {
                emitter.fire(undefined);
            }
        }
    };
    exports.MainThreadNotebookKernels = MainThreadNotebookKernels;
    exports.MainThreadNotebookKernels = MainThreadNotebookKernels = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadNotebookKernels),
        __param(1, language_1.ILanguageService),
        __param(2, notebookKernelService_1.INotebookKernelService),
        __param(3, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(4, notebookService_1.INotebookService),
        __param(5, notebookEditorService_1.INotebookEditorService)
    ], MainThreadNotebookKernels);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZE5vdGVib29rS2VybmVscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkTm90ZWJvb2tLZXJuZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CaEcsTUFBZSxnQkFBZ0I7UUFpQjlCLElBQVcsV0FBVztZQUNyQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxJQUFXLGVBQWU7WUFDekIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsRCxDQUFDO1FBRUQsWUFBWSxJQUF5QixFQUFVLGdCQUFrQztZQUFsQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBeEJoRSxpQkFBWSxHQUFHLElBQUksZUFBTyxFQUE4QixDQUFDO1lBRWpFLGdCQUFXLEdBQXNDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBdUJqRixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUVsQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixJQUFJLEtBQUssQ0FBQztZQUMzRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENB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