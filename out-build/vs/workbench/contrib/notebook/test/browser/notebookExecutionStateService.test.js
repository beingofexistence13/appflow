/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/mock", "vs/editor/common/languages/modesRegistry", "vs/platform/actions/common/actions", "vs/platform/extensions/common/extensions", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/services/notebookExecutionServiceImpl", "vs/workbench/contrib/notebook/browser/services/notebookExecutionStateServiceImpl", "vs/workbench/contrib/notebook/browser/services/notebookKernelServiceImpl", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor"], function (require, exports, assert, async_1, event_1, lifecycle_1, uri_1, mock_1, modesRegistry_1, actions_1, extensions_1, cellOperations_1, notebookExecutionServiceImpl_1, notebookExecutionStateServiceImpl_1, notebookKernelServiceImpl_1, notebookCommon_1, notebookExecutionService_1, notebookExecutionStateService_1, notebookKernelService_1, notebookService_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookExecutionStateService', () => {
        let instantiationService;
        let kernelService;
        let disposables;
        let testNotebookModel;
        setup(function () {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testNotebookEditor_1.$Ifc)(disposables);
            instantiationService.stub(notebookService_1.$ubb, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.onDidAddNotebookDocument = event_1.Event.None;
                    this.onWillRemoveNotebookDocument = event_1.Event.None;
                }
                getNotebookTextModels() { return []; }
                getNotebookTextModel(uri) {
                    return testNotebookModel;
                }
            });
            instantiationService.stub(actions_1.$Su, new class extends (0, mock_1.$rT)() {
                createMenu() {
                    return new class extends (0, mock_1.$rT)() {
                        constructor() {
                            super(...arguments);
                            this.onDidChange = event_1.Event.None;
                        }
                        getActions() { return []; }
                        dispose() { }
                    };
                }
            });
            kernelService = instantiationService.createInstance(notebookKernelServiceImpl_1.$8Eb);
            instantiationService.set(notebookKernelService_1.$Bbb, kernelService);
            instantiationService.set(notebookExecutionService_1.$aI, instantiationService.createInstance(notebookExecutionServiceImpl_1.$iGb));
            instantiationService.set(notebookExecutionStateService_1.$_H, instantiationService.createInstance(notebookExecutionStateServiceImpl_1.$hGb));
        });
        teardown(() => {
            disposables.dispose();
        });
        async function withTestNotebook(cells, callback) {
            return (0, testNotebookEditor_1.$Lfc)(cells, (editor, viewModel) => callback(viewModel, viewModel.notebookDocument));
        }
        function testCancelOnDelete(expectedCancels, implementsInterrupt) {
            return withTestNotebook([], async (viewModel) => {
                testNotebookModel = viewModel.notebookDocument;
                let cancels = 0;
                const kernel = new class extends TestNotebookKernel {
                    constructor() {
                        super({ languages: ['javascript'] });
                        this.implementsInterrupt = implementsInterrupt;
                    }
                    async executeNotebookCellsRequest() { }
                    async cancelNotebookCellExecution(_uri, handles) {
                        cancels += handles.length;
                    }
                };
                kernelService.registerKernel(kernel);
                kernelService.selectKernelForNotebook(kernel, viewModel.notebookDocument);
                const executionStateService = instantiationService.get(notebookExecutionStateService_1.$_H);
                // Should cancel executing and pending cells, when kernel does not implement interrupt
                const cell = (0, cellOperations_1.$6pb)(viewModel, 0, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                const cell2 = (0, cellOperations_1.$6pb)(viewModel, 1, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                const cell3 = (0, cellOperations_1.$6pb)(viewModel, 2, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                (0, cellOperations_1.$6pb)(viewModel, 3, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true); // Not deleted
                const exe = executionStateService.createCellExecution(viewModel.uri, cell.handle); // Executing
                exe.confirm();
                exe.update([{ editType: notebookExecutionService_1.CellExecutionUpdateType.ExecutionState, executionOrder: 1 }]);
                const exe2 = executionStateService.createCellExecution(viewModel.uri, cell2.handle); // Pending
                exe2.confirm();
                executionStateService.createCellExecution(viewModel.uri, cell3.handle); // Unconfirmed
                assert.strictEqual(cancels, 0);
                viewModel.notebookDocument.applyEdits([{
                        editType: 1 /* CellEditType.Replace */, index: 0, count: 3, cells: []
                    }], true, undefined, () => undefined, undefined, false);
                assert.strictEqual(cancels, expectedCancels);
            });
        }
        // TODO@roblou Could be a test just for NotebookExecutionListeners, which can be a standalone contribution
        test('cancel execution when cell is deleted', async function () {
            return testCancelOnDelete(3, false);
        });
        test('cancel execution when cell is deleted in interrupt-type kernel', async function () {
            return testCancelOnDelete(1, true);
        });
        test('fires onDidChangeCellExecution when cell is completed while deleted', async function () {
            return withTestNotebook([], async (viewModel) => {
                testNotebookModel = viewModel.notebookDocument;
                const kernel = new TestNotebookKernel();
                kernelService.registerKernel(kernel);
                kernelService.selectKernelForNotebook(kernel, viewModel.notebookDocument);
                const executionStateService = instantiationService.get(notebookExecutionStateService_1.$_H);
                const cell = (0, cellOperations_1.$6pb)(viewModel, 0, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                const exe = executionStateService.createCellExecution(viewModel.uri, cell.handle);
                let didFire = false;
                disposables.add(executionStateService.onDidChangeExecution(e => {
                    if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell) {
                        didFire = !e.changed;
                    }
                }));
                viewModel.notebookDocument.applyEdits([{
                        editType: 1 /* CellEditType.Replace */, index: 0, count: 1, cells: []
                    }], true, undefined, () => undefined, undefined, false);
                exe.complete({});
                assert.strictEqual(didFire, true);
            });
        });
        test('does not fire onDidChangeCellExecution for output updates', async function () {
            return withTestNotebook([], async (viewModel) => {
                testNotebookModel = viewModel.notebookDocument;
                const kernel = new TestNotebookKernel();
                kernelService.registerKernel(kernel);
                kernelService.selectKernelForNotebook(kernel, viewModel.notebookDocument);
                const executionStateService = instantiationService.get(notebookExecutionStateService_1.$_H);
                const cell = (0, cellOperations_1.$6pb)(viewModel, 0, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                const exe = executionStateService.createCellExecution(viewModel.uri, cell.handle);
                let didFire = false;
                disposables.add(executionStateService.onDidChangeExecution(e => {
                    if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell) {
                        didFire = true;
                    }
                }));
                exe.update([{ editType: notebookExecutionService_1.CellExecutionUpdateType.OutputItems, items: [], outputId: '1' }]);
                assert.strictEqual(didFire, false);
                exe.update([{ editType: notebookExecutionService_1.CellExecutionUpdateType.ExecutionState, executionOrder: 123 }]);
                assert.strictEqual(didFire, true);
                exe.complete({});
            });
        });
        // #142466
        test('getCellExecution and onDidChangeCellExecution', async function () {
            return withTestNotebook([], async (viewModel) => {
                testNotebookModel = viewModel.notebookDocument;
                const kernel = new TestNotebookKernel();
                kernelService.registerKernel(kernel);
                kernelService.selectKernelForNotebook(kernel, viewModel.notebookDocument);
                const executionStateService = instantiationService.get(notebookExecutionStateService_1.$_H);
                const cell = (0, cellOperations_1.$6pb)(viewModel, 0, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                const deferred = new async_1.$2g();
                disposables.add(executionStateService.onDidChangeExecution(e => {
                    if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell) {
                        const cellUri = notebookCommon_1.CellUri.generate(e.notebook, e.cellHandle);
                        const exe = executionStateService.getCellExecution(cellUri);
                        assert.ok(exe);
                        assert.strictEqual(e.notebook.toString(), exe.notebook.toString());
                        assert.strictEqual(e.cellHandle, exe.cellHandle);
                        assert.strictEqual(exe.notebook.toString(), e.changed?.notebook.toString());
                        assert.strictEqual(exe.cellHandle, e.changed?.cellHandle);
                        deferred.complete();
                    }
                }));
                executionStateService.createCellExecution(viewModel.uri, cell.handle);
                return deferred.p;
            });
        });
        test('getExecution and onDidChangeExecution', async function () {
            return withTestNotebook([], async (viewModel) => {
                testNotebookModel = viewModel.notebookDocument;
                const kernel = new TestNotebookKernel();
                kernelService.registerKernel(kernel);
                kernelService.selectKernelForNotebook(kernel, viewModel.notebookDocument);
                const eventRaisedWithExecution = [];
                const executionStateService = instantiationService.get(notebookExecutionStateService_1.$_H);
                executionStateService.onDidChangeExecution(e => eventRaisedWithExecution.push(e.type === notebookExecutionStateService_1.NotebookExecutionType.notebook && !!e.changed), this, disposables);
                const deferred = new async_1.$2g();
                disposables.add(executionStateService.onDidChangeExecution(e => {
                    if (e.type === notebookExecutionStateService_1.NotebookExecutionType.notebook) {
                        const exe = executionStateService.getExecution(viewModel.uri);
                        assert.ok(exe);
                        assert.strictEqual(e.notebook.toString(), exe.notebook.toString());
                        assert.ok(e.affectsNotebook(viewModel.uri));
                        assert.deepStrictEqual(eventRaisedWithExecution, [true]);
                        deferred.complete();
                    }
                }));
                executionStateService.createExecution(viewModel.uri);
                return deferred.p;
            });
        });
        test('getExecution and onDidChangeExecution 2', async function () {
            return withTestNotebook([], async (viewModel) => {
                testNotebookModel = viewModel.notebookDocument;
                const kernel = new TestNotebookKernel();
                kernelService.registerKernel(kernel);
                kernelService.selectKernelForNotebook(kernel, viewModel.notebookDocument);
                const executionStateService = instantiationService.get(notebookExecutionStateService_1.$_H);
                const deferred = new async_1.$2g();
                const expectedNotebookEventStates = [notebookCommon_1.NotebookExecutionState.Unconfirmed, notebookCommon_1.NotebookExecutionState.Pending, notebookCommon_1.NotebookExecutionState.Executing, undefined];
                executionStateService.onDidChangeExecution(e => {
                    if (e.type === notebookExecutionStateService_1.NotebookExecutionType.notebook) {
                        const expectedState = expectedNotebookEventStates.shift();
                        if (typeof expectedState === 'number') {
                            const exe = executionStateService.getExecution(viewModel.uri);
                            assert.ok(exe);
                            assert.strictEqual(e.notebook.toString(), exe.notebook.toString());
                            assert.strictEqual(e.changed?.state, expectedState);
                        }
                        else {
                            assert.ok(e.changed === undefined);
                        }
                        assert.ok(e.affectsNotebook(viewModel.uri));
                        if (expectedNotebookEventStates.length === 0) {
                            deferred.complete();
                        }
                    }
                }, this, disposables);
                const execution = executionStateService.createExecution(viewModel.uri);
                execution.confirm();
                execution.begin();
                execution.complete();
                return deferred.p;
            });
        });
        test('force-cancel works for Cell Execution', async function () {
            return withTestNotebook([], async (viewModel) => {
                testNotebookModel = viewModel.notebookDocument;
                const kernel = new TestNotebookKernel();
                kernelService.registerKernel(kernel);
                kernelService.selectKernelForNotebook(kernel, viewModel.notebookDocument);
                const executionStateService = instantiationService.get(notebookExecutionStateService_1.$_H);
                const cell = (0, cellOperations_1.$6pb)(viewModel, 0, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                executionStateService.createCellExecution(viewModel.uri, cell.handle);
                const exe = executionStateService.getCellExecution(cell.uri);
                assert.ok(exe);
                executionStateService.forceCancelNotebookExecutions(viewModel.uri);
                const exe2 = executionStateService.getCellExecution(cell.uri);
                assert.strictEqual(exe2, undefined);
            });
        });
        test('force-cancel works for Notebook Execution', async function () {
            return withTestNotebook([], async (viewModel) => {
                testNotebookModel = viewModel.notebookDocument;
                const kernel = new TestNotebookKernel();
                kernelService.registerKernel(kernel);
                kernelService.selectKernelForNotebook(kernel, viewModel.notebookDocument);
                const eventRaisedWithExecution = [];
                const executionStateService = instantiationService.get(notebookExecutionStateService_1.$_H);
                executionStateService.onDidChangeExecution(e => eventRaisedWithExecution.push(e.type === notebookExecutionStateService_1.NotebookExecutionType.notebook && !!e.changed), this, disposables);
                executionStateService.createExecution(viewModel.uri);
                const exe = executionStateService.getExecution(viewModel.uri);
                assert.ok(exe);
                assert.deepStrictEqual(eventRaisedWithExecution, [true]);
                executionStateService.forceCancelNotebookExecutions(viewModel.uri);
                const exe2 = executionStateService.getExecution(viewModel.uri);
                assert.deepStrictEqual(eventRaisedWithExecution, [true, false]);
                assert.strictEqual(exe2, undefined);
            });
        });
        test('force-cancel works for Cell and Notebook Execution', async function () {
            return withTestNotebook([], async (viewModel) => {
                testNotebookModel = viewModel.notebookDocument;
                const kernel = new TestNotebookKernel();
                kernelService.registerKernel(kernel);
                kernelService.selectKernelForNotebook(kernel, viewModel.notebookDocument);
                const executionStateService = instantiationService.get(notebookExecutionStateService_1.$_H);
                executionStateService.createExecution(viewModel.uri);
                executionStateService.createExecution(viewModel.uri);
                const cellExe = executionStateService.getExecution(viewModel.uri);
                const exe = executionStateService.getExecution(viewModel.uri);
                assert.ok(cellExe);
                assert.ok(exe);
                executionStateService.forceCancelNotebookExecutions(viewModel.uri);
                const cellExe2 = executionStateService.getExecution(viewModel.uri);
                const exe2 = executionStateService.getExecution(viewModel.uri);
                assert.strictEqual(cellExe2, undefined);
                assert.strictEqual(exe2, undefined);
            });
        });
    });
    class TestNotebookKernel {
        async executeNotebookCellsRequest() { }
        async cancelNotebookCellExecution(uri, cellHandles) { }
        constructor(opts) {
            this.id = 'test';
            this.label = '';
            this.viewType = '*';
            this.onDidChange = event_1.Event.None;
            this.extension = new extensions_1.$Vl('test');
            this.localResourceRoot = uri_1.URI.file('/test');
            this.preloadUris = [];
            this.preloadProvides = [];
            this.supportedLanguages = [];
            this.supportedLanguages = opts?.languages ?? [modesRegistry_1.$Yt];
            if (opts?.id) {
                this.id = opts?.id;
            }
        }
    }
});
//# sourceMappingURL=notebookExecutionStateService.test.js.map