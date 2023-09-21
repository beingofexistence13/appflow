/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/editor/common/languages/modesRegistry", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/extensions/common/extensions", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/services/notebookExecutionServiceImpl", "vs/workbench/contrib/notebook/browser/services/notebookKernelServiceImpl", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor"], function (require, exports, assert, sinon, event_1, lifecycle_1, uri_1, mock_1, utils_1, modesRegistry_1, actions_1, commands_1, contextkey_1, extensions_1, cellOperations_1, notebookExecutionServiceImpl_1, notebookKernelServiceImpl_1, notebookCommon_1, notebookExecutionStateService_1, notebookKernelService_1, notebookService_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookExecutionService', () => {
        let instantiationService;
        let contextKeyService;
        let kernelService;
        let disposables;
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
            instantiationService.stub(notebookKernelService_1.$Cbb, new class extends (0, mock_1.$rT)() {
                getKernels(notebook) {
                    return kernelService.getMatchingKernel(notebook);
                }
                addMostRecentKernel(kernel) { }
            });
            instantiationService.stub(commands_1.$Fr, new class extends (0, mock_1.$rT)() {
                executeCommand(_commandId, ..._args) {
                    return Promise.resolve(undefined);
                }
            });
            kernelService = instantiationService.createInstance(notebookKernelServiceImpl_1.$8Eb);
            instantiationService.set(notebookKernelService_1.$Bbb, kernelService);
            contextKeyService = instantiationService.get(contextkey_1.$3i);
        });
        teardown(() => {
            disposables.dispose();
        });
        async function withTestNotebook(cells, callback) {
            return (0, testNotebookEditor_1.$Lfc)(cells, (editor, viewModel) => callback(viewModel, viewModel.notebookDocument));
        }
        // test('ctor', () => {
        // 	instantiationService.createInstance(NotebookEditorKernelManager, { activeKernel: undefined, viewModel: undefined });
        // 	const contextKeyService = instantiationService.get(IContextKeyService);
        // 	assert.strictEqual(contextKeyService.getContextKeyValue(NOTEBOOK_KERNEL_COUNT.key), 0);
        // });
        test('cell is not runnable when no kernel is selected', async () => {
            await withTestNotebook([], async (viewModel, textModel) => {
                const executionService = instantiationService.createInstance(notebookExecutionServiceImpl_1.$iGb);
                const cell = (0, cellOperations_1.$6pb)(viewModel, 1, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                await (0, utils_1.$aT)(async () => await executionService.executeNotebookCells(textModel, [cell.model], contextKeyService));
            });
        });
        test('cell is not runnable when kernel does not support the language', async () => {
            await withTestNotebook([], async (viewModel, textModel) => {
                kernelService.registerKernel(new TestNotebookKernel({ languages: ['testlang'] }));
                const executionService = instantiationService.createInstance(notebookExecutionServiceImpl_1.$iGb);
                const cell = (0, cellOperations_1.$6pb)(viewModel, 1, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                await (0, utils_1.$aT)(async () => await executionService.executeNotebookCells(textModel, [cell.model], contextKeyService));
            });
        });
        test('cell is runnable when kernel does support the language', async () => {
            await withTestNotebook([], async (viewModel, textModel) => {
                const kernel = new TestNotebookKernel({ languages: ['javascript'] });
                kernelService.registerKernel(kernel);
                kernelService.selectKernelForNotebook(kernel, textModel);
                const executionService = instantiationService.createInstance(notebookExecutionServiceImpl_1.$iGb);
                const executeSpy = sinon.spy();
                kernel.executeNotebookCellsRequest = executeSpy;
                const cell = (0, cellOperations_1.$6pb)(viewModel, 0, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                await executionService.executeNotebookCells(viewModel.notebookDocument, [cell.model], contextKeyService);
                assert.strictEqual(executeSpy.calledOnce, true);
            });
        });
        test('Completes unconfirmed executions', async function () {
            return withTestNotebook([], async (viewModel, textModel) => {
                let didExecute = false;
                const kernel = new class extends TestNotebookKernel {
                    constructor() {
                        super({ languages: ['javascript'] });
                        this.id = 'mySpecialId';
                    }
                    async executeNotebookCellsRequest() {
                        didExecute = true;
                        return;
                    }
                };
                kernelService.registerKernel(kernel);
                kernelService.selectKernelForNotebook(kernel, textModel);
                const executionService = instantiationService.createInstance(notebookExecutionServiceImpl_1.$iGb);
                const exeStateService = instantiationService.get(notebookExecutionStateService_1.$_H);
                const cell = (0, cellOperations_1.$6pb)(viewModel, 0, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                await executionService.executeNotebookCells(textModel, [cell.model], contextKeyService);
                assert.strictEqual(didExecute, true);
                assert.strictEqual(exeStateService.getCellExecution(cell.uri), undefined);
            });
        });
    });
    class TestNotebookKernel {
        executeNotebookCellsRequest() {
            throw new Error('Method not implemented.');
        }
        cancelNotebookCellExecution() {
            throw new Error('Method not implemented.');
        }
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
        }
    }
});
//# sourceMappingURL=notebookExecutionService.test.js.map