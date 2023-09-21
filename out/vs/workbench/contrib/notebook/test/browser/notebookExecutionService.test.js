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
            disposables = new lifecycle_1.DisposableStore();
            instantiationService = (0, testNotebookEditor_1.setupInstantiationService)(disposables);
            instantiationService.stub(notebookService_1.INotebookService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidAddNotebookDocument = event_1.Event.None;
                    this.onWillRemoveNotebookDocument = event_1.Event.None;
                }
                getNotebookTextModels() { return []; }
            });
            instantiationService.stub(actions_1.IMenuService, new class extends (0, mock_1.mock)() {
                createMenu() {
                    return new class extends (0, mock_1.mock)() {
                        constructor() {
                            super(...arguments);
                            this.onDidChange = event_1.Event.None;
                        }
                        getActions() { return []; }
                        dispose() { }
                    };
                }
            });
            instantiationService.stub(notebookKernelService_1.INotebookKernelHistoryService, new class extends (0, mock_1.mock)() {
                getKernels(notebook) {
                    return kernelService.getMatchingKernel(notebook);
                }
                addMostRecentKernel(kernel) { }
            });
            instantiationService.stub(commands_1.ICommandService, new class extends (0, mock_1.mock)() {
                executeCommand(_commandId, ..._args) {
                    return Promise.resolve(undefined);
                }
            });
            kernelService = instantiationService.createInstance(notebookKernelServiceImpl_1.NotebookKernelService);
            instantiationService.set(notebookKernelService_1.INotebookKernelService, kernelService);
            contextKeyService = instantiationService.get(contextkey_1.IContextKeyService);
        });
        teardown(() => {
            disposables.dispose();
        });
        async function withTestNotebook(cells, callback) {
            return (0, testNotebookEditor_1.withTestNotebook)(cells, (editor, viewModel) => callback(viewModel, viewModel.notebookDocument));
        }
        // test('ctor', () => {
        // 	instantiationService.createInstance(NotebookEditorKernelManager, { activeKernel: undefined, viewModel: undefined });
        // 	const contextKeyService = instantiationService.get(IContextKeyService);
        // 	assert.strictEqual(contextKeyService.getContextKeyValue(NOTEBOOK_KERNEL_COUNT.key), 0);
        // });
        test('cell is not runnable when no kernel is selected', async () => {
            await withTestNotebook([], async (viewModel, textModel) => {
                const executionService = instantiationService.createInstance(notebookExecutionServiceImpl_1.NotebookExecutionService);
                const cell = (0, cellOperations_1.insertCellAtIndex)(viewModel, 1, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                await (0, utils_1.assertThrowsAsync)(async () => await executionService.executeNotebookCells(textModel, [cell.model], contextKeyService));
            });
        });
        test('cell is not runnable when kernel does not support the language', async () => {
            await withTestNotebook([], async (viewModel, textModel) => {
                kernelService.registerKernel(new TestNotebookKernel({ languages: ['testlang'] }));
                const executionService = instantiationService.createInstance(notebookExecutionServiceImpl_1.NotebookExecutionService);
                const cell = (0, cellOperations_1.insertCellAtIndex)(viewModel, 1, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                await (0, utils_1.assertThrowsAsync)(async () => await executionService.executeNotebookCells(textModel, [cell.model], contextKeyService));
            });
        });
        test('cell is runnable when kernel does support the language', async () => {
            await withTestNotebook([], async (viewModel, textModel) => {
                const kernel = new TestNotebookKernel({ languages: ['javascript'] });
                kernelService.registerKernel(kernel);
                kernelService.selectKernelForNotebook(kernel, textModel);
                const executionService = instantiationService.createInstance(notebookExecutionServiceImpl_1.NotebookExecutionService);
                const executeSpy = sinon.spy();
                kernel.executeNotebookCellsRequest = executeSpy;
                const cell = (0, cellOperations_1.insertCellAtIndex)(viewModel, 0, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
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
                const executionService = instantiationService.createInstance(notebookExecutionServiceImpl_1.NotebookExecutionService);
                const exeStateService = instantiationService.get(notebookExecutionStateService_1.INotebookExecutionStateService);
                const cell = (0, cellOperations_1.insertCellAtIndex)(viewModel, 0, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
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
            this.extension = new extensions_1.ExtensionIdentifier('test');
            this.localResourceRoot = uri_1.URI.file('/test');
            this.preloadUris = [];
            this.preloadProvides = [];
            this.supportedLanguages = [];
            this.supportedLanguages = opts?.languages ?? [modesRegistry_1.PLAINTEXT_LANGUAGE_ID];
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFeGVjdXRpb25TZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay90ZXN0L2Jyb3dzZXIvbm90ZWJvb2tFeGVjdXRpb25TZXJ2aWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUEwQmhHLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7UUFFdEMsSUFBSSxvQkFBOEMsQ0FBQztRQUNuRCxJQUFJLGlCQUFxQyxDQUFDO1FBQzFDLElBQUksYUFBcUMsQ0FBQztRQUMxQyxJQUFJLFdBQTRCLENBQUM7UUFFakMsS0FBSyxDQUFDO1lBRUwsV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBRXBDLG9CQUFvQixHQUFHLElBQUEsOENBQXlCLEVBQUMsV0FBVyxDQUFDLENBQUM7WUFFOUQsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGtDQUFnQixFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUFvQjtnQkFBdEM7O29CQUN0Qyw2QkFBd0IsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO29CQUN0QyxpQ0FBNEIsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO2dCQUVwRCxDQUFDO2dCQURTLHFCQUFxQixLQUFLLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMvQyxDQUFDLENBQUM7WUFFSCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsc0JBQVksRUFBRSxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBZ0I7Z0JBQ3BFLFVBQVU7b0JBQ2xCLE9BQU8sSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQVM7d0JBQTNCOzs0QkFDRCxnQkFBVyxHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7d0JBR25DLENBQUM7d0JBRlMsVUFBVSxLQUFLLE9BQU8sRUFBRSxDQUFD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