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
    exports.$2rb = void 0;
    class MainThreadKernel {
        get preloadUris() {
            return this.b.map(p => p.uri);
        }
        get preloadProvides() {
            return this.b.map(p => p.provides).flat();
        }
        constructor(data, c) {
            this.c = c;
            this.a = new event_1.$fd();
            this.onDidChange = this.a.event;
            this.id = data.id;
            this.viewType = data.notebookType;
            this.extension = data.extensionId;
            this.implementsInterrupt = data.supportsInterrupt ?? false;
            this.label = data.label;
            this.description = data.description;
            this.detail = data.detail;
            this.supportedLanguages = (0, arrays_1.$Jb)(data.supportedLanguages) ? data.supportedLanguages : c.getRegisteredLanguageIds();
            this.implementsExecutionOrder = data.supportsExecutionOrder ?? false;
            this.localResourceRoot = uri_1.URI.revive(data.extensionLocation);
            this.b = data.preloads?.map(u => ({ uri: uri_1.URI.revive(u.uri), provides: u.provides })) ?? [];
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
                this.supportedLanguages = (0, arrays_1.$Jb)(data.supportedLanguages) ? data.supportedLanguages : this.c.getRegisteredLanguageIds();
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
            this.a.fire(event);
        }
    }
    class MainThreadKernelDetectionTask {
        constructor(notebookType) {
            this.notebookType = notebookType;
        }
    }
    let $2rb = class $2rb {
        constructor(extHostContext, k, l, m, n, notebookEditorService) {
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.a = new lifecycle_1.$sc();
            this.b = new lifecycle_1.$jc();
            this.c = new Map();
            this.d = new Map();
            this.f = new Map();
            this.g = new Map();
            this.i = new Map();
            this.j = new Map();
            this.h = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostNotebookKernels);
            notebookEditorService.listNotebookEditors().forEach(this.o, this);
            notebookEditorService.onDidAddNotebookEditor(this.o, this, this.b);
            notebookEditorService.onDidRemoveNotebookEditor(this.q, this, this.b);
            this.b.add((0, lifecycle_1.$ic)(() => {
                // EH shut down, complete all executions started by this EH
                this.i.forEach(e => {
                    e.complete({});
                });
                this.j.forEach(e => e.complete());
            }));
            this.b.add(this.m.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell) {
                    this.h.$cellExecutionChanged(e.notebook, e.cellHandle, e.changed?.state);
                }
            }));
        }
        dispose() {
            this.b.dispose();
            for (const [, registration] of this.c.values()) {
                registration.dispose();
            }
            for (const [, registration] of this.d.values()) {
                registration.dispose();
            }
            for (const [, registration] of this.f.values()) {
                registration.dispose();
            }
            this.a.dispose();
        }
        // --- kernel ipc
        o(editor) {
            const ipcListener = editor.onDidReceiveMessage(e => {
                if (!editor.hasModel()) {
                    return;
                }
                const { selected } = this.l.getMatchingKernel(editor.textModel);
                if (!selected) {
                    return;
                }
                for (const [handle, candidate] of this.c) {
                    if (candidate[0] === selected) {
                        this.h.$acceptKernelMessageFromRenderer(handle, editor.getId(), e.message);
                        break;
                    }
                }
            });
            this.a.set(editor, ipcListener);
        }
        q(editor) {
            this.a.deleteAndDispose(editor);
        }
        async $postMessage(handle, editorId, message) {
            const tuple = this.c.get(handle);
            if (!tuple) {
                throw new Error('kernel already disposed');
            }
            const [kernel] = tuple;
            let didSend = false;
            for (const [editor] of this.a) {
                if (!editor.hasModel()) {
                    continue;
                }
                if (this.l.getMatchingKernel(editor.textModel).selected !== kernel) {
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
                    await that.h.$executeCells(handle, uri, handles);
                }
                async cancelNotebookCellExecution(uri, handles) {
                    await that.h.$cancelCells(handle, uri, handles);
                }
            }(data, this.k);
            const listener = this.l.onDidChangeSelectedNotebooks(e => {
                if (e.oldKernel === kernel.id) {
                    this.h.$acceptNotebookAssociation(handle, e.notebook, false);
                }
                else if (e.newKernel === kernel.id) {
                    this.h.$acceptNotebookAssociation(handle, e.notebook, true);
                }
            });
            const registration = this.l.registerKernel(kernel);
            this.c.set(handle, [kernel, (0, lifecycle_1.$hc)(listener, registration)]);
        }
        $updateKernel(handle, data) {
            const tuple = this.c.get(handle);
            if (tuple) {
                tuple[0].update(data);
            }
        }
        $removeKernel(handle) {
            const tuple = this.c.get(handle);
            if (tuple) {
                tuple[1].dispose();
                this.c.delete(handle);
            }
        }
        $updateNotebookPriority(handle, notebook, value) {
            const tuple = this.c.get(handle);
            if (tuple) {
                this.l.updateKernelNotebookAffinity(tuple[0], uri_1.URI.revive(notebook), value);
            }
        }
        // --- Cell execution
        $createExecution(handle, controllerId, rawUri, cellHandle) {
            const uri = uri_1.URI.revive(rawUri);
            const notebook = this.n.getNotebookTextModel(uri);
            if (!notebook) {
                throw new Error(`Notebook not found: ${uri.toString()}`);
            }
            const kernel = this.l.getMatchingKernel(notebook);
            if (!kernel.selected || kernel.selected.id !== controllerId) {
                throw new Error(`Kernel is not selected: ${kernel.selected?.id} !== ${controllerId}`);
            }
            const execution = this.m.createCellExecution(uri, cellHandle);
            execution.confirm();
            this.i.set(handle, execution);
        }
        $updateExecution(handle, data) {
            const updates = data.value;
            try {
                const execution = this.i.get(handle);
                execution?.update(updates.map(mainThreadNotebookDto_1.NotebookDto.fromCellExecuteUpdateDto));
            }
            catch (e) {
                (0, errors_1.$Y)(e);
            }
        }
        $completeExecution(handle, data) {
            try {
                const execution = this.i.get(handle);
                execution?.complete(mainThreadNotebookDto_1.NotebookDto.fromCellExecuteCompleteDto(data.value));
            }
            catch (e) {
                (0, errors_1.$Y)(e);
            }
            finally {
                this.i.delete(handle);
            }
        }
        // --- Notebook execution
        $createNotebookExecution(handle, controllerId, rawUri) {
            const uri = uri_1.URI.revive(rawUri);
            const notebook = this.n.getNotebookTextModel(uri);
            if (!notebook) {
                throw new Error(`Notebook not found: ${uri.toString()}`);
            }
            const kernel = this.l.getMatchingKernel(notebook);
            if (!kernel.selected || kernel.selected.id !== controllerId) {
                throw new Error(`Kernel is not selected: ${kernel.selected?.id} !== ${controllerId}`);
            }
            const execution = this.m.createExecution(uri);
            execution.confirm();
            this.j.set(handle, execution);
        }
        $beginNotebookExecution(handle) {
            try {
                const execution = this.j.get(handle);
                execution?.begin();
            }
            catch (e) {
                (0, errors_1.$Y)(e);
            }
        }
        $completeNotebookExecution(handle) {
            try {
                const execution = this.j.get(handle);
                execution?.complete();
            }
            catch (e) {
                (0, errors_1.$Y)(e);
            }
            finally {
                this.j.delete(handle);
            }
        }
        // --- notebook kernel detection task
        async $addKernelDetectionTask(handle, notebookType) {
            const kernelDetectionTask = new MainThreadKernelDetectionTask(notebookType);
            const registration = this.l.registerNotebookKernelDetectionTask(kernelDetectionTask);
            this.d.set(handle, [kernelDetectionTask, registration]);
        }
        $removeKernelDetectionTask(handle) {
            const tuple = this.d.get(handle);
            if (tuple) {
                tuple[1].dispose();
                this.d.delete(handle);
            }
        }
        // --- notebook kernel source action provider
        async $addKernelSourceActionProvider(handle, eventHandle, notebookType) {
            const kernelSourceActionProvider = {
                viewType: notebookType,
                provideKernelSourceActions: async () => {
                    const actions = await this.h.$provideKernelSourceActions(handle, cancellation_1.CancellationToken.None);
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
                const emitter = new event_1.$fd();
                this.g.set(eventHandle, emitter);
                kernelSourceActionProvider.onDidChangeSourceActions = emitter.event;
            }
            const registration = this.l.registerKernelSourceActionProvider(notebookType, kernelSourceActionProvider);
            this.f.set(handle, [kernelSourceActionProvider, registration]);
        }
        $removeKernelSourceActionProvider(handle, eventHandle) {
            const tuple = this.f.get(handle);
            if (tuple) {
                tuple[1].dispose();
                this.f.delete(handle);
            }
            if (typeof eventHandle === 'number') {
                this.g.delete(eventHandle);
            }
        }
        $emitNotebookKernelSourceActionsChangeEvent(eventHandle) {
            const emitter = this.g.get(eventHandle);
            if (emitter instanceof event_1.$fd) {
                emitter.fire(undefined);
            }
        }
    };
    exports.$2rb = $2rb;
    exports.$2rb = $2rb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadNotebookKernels),
        __param(1, language_1.$ct),
        __param(2, notebookKernelService_1.$Bbb),
        __param(3, notebookExecutionStateService_1.$_H),
        __param(4, notebookService_1.$ubb),
        __param(5, notebookEditorService_1.$1rb)
    ], $2rb);
});
//# sourceMappingURL=mainThreadNotebookKernels.js.map