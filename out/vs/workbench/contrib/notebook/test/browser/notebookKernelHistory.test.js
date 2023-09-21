/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/platform/extensions/common/extensions", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor", "vs/base/common/event", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/browser/services/notebookKernelServiceImpl", "vs/workbench/contrib/notebook/common/notebookService", "vs/base/test/common/mock", "vs/base/common/lifecycle", "vs/editor/common/languages/modesRegistry", "vs/platform/actions/common/actions", "vs/workbench/contrib/notebook/browser/services/notebookKernelHistoryServiceImpl", "vs/platform/storage/common/storage", "vs/workbench/contrib/notebook/common/notebookLoggingService", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, extensions_1, testNotebookEditor_1, event_1, notebookKernelService_1, notebookKernelServiceImpl_1, notebookService_1, mock_1, lifecycle_1, modesRegistry_1, actions_1, notebookKernelHistoryServiceImpl_1, storage_1, notebookLoggingService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookKernelHistoryService', () => {
        let disposables;
        let instantiationService;
        let kernelService;
        let onDidAddNotebookDocument;
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(function () {
            disposables = new lifecycle_1.DisposableStore();
            onDidAddNotebookDocument = new event_1.Emitter();
            disposables.add(onDidAddNotebookDocument);
            instantiationService = (0, testNotebookEditor_1.setupInstantiationService)(disposables);
            instantiationService.stub(notebookService_1.INotebookService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidAddNotebookDocument = onDidAddNotebookDocument.event;
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
            kernelService = disposables.add(instantiationService.createInstance(notebookKernelServiceImpl_1.NotebookKernelService));
            instantiationService.set(notebookKernelService_1.INotebookKernelService, kernelService);
        });
        test('notebook kernel empty history', function () {
            const u1 = uri_1.URI.parse('foo:///one');
            const k1 = new TestNotebookKernel({ label: 'z', viewType: 'foo' });
            const k2 = new TestNotebookKernel({ label: 'a', viewType: 'foo' });
            disposables.add(kernelService.registerKernel(k1));
            disposables.add(kernelService.registerKernel(k2));
            instantiationService.stub(storage_1.IStorageService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onWillSaveState = event_1.Event.None;
                }
                onDidChangeValue(scope, key, disposable) {
                    return event_1.Event.None;
                }
                get(key, scope, fallbackValue) {
                    if (key === 'notebook.kernelHistory') {
                        return JSON.stringify({
                            'foo': {
                                'entries': []
                            }
                        });
                    }
                    return undefined;
                }
            });
            instantiationService.stub(notebookLoggingService_1.INotebookLoggingService, new class extends (0, mock_1.mock)() {
                info() { }
                debug() { }
            });
            const kernelHistoryService = disposables.add(instantiationService.createInstance(notebookKernelHistoryServiceImpl_1.NotebookKernelHistoryService));
            let info = kernelHistoryService.getKernels({ uri: u1, viewType: 'foo' });
            assert.equal(info.all.length, 0);
            assert.ok(!info.selected);
            // update priorities for u1 notebook
            kernelService.updateKernelNotebookAffinity(k2, u1, 2);
            info = kernelHistoryService.getKernels({ uri: u1, viewType: 'foo' });
            assert.equal(info.all.length, 0);
            // MRU only auto selects kernel if there is only one
            assert.deepStrictEqual(info.selected, undefined);
        });
        test('notebook kernel history restore', function () {
            const u1 = uri_1.URI.parse('foo:///one');
            const k1 = new TestNotebookKernel({ label: 'z', viewType: 'foo' });
            const k2 = new TestNotebookKernel({ label: 'a', viewType: 'foo' });
            const k3 = new TestNotebookKernel({ label: 'b', viewType: 'foo' });
            disposables.add(kernelService.registerKernel(k1));
            disposables.add(kernelService.registerKernel(k2));
            disposables.add(kernelService.registerKernel(k3));
            instantiationService.stub(storage_1.IStorageService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onWillSaveState = event_1.Event.None;
                }
                onDidChangeValue(scope, key, disposable) {
                    return event_1.Event.None;
                }
                get(key, scope, fallbackValue) {
                    if (key === 'notebook.kernelHistory') {
                        return JSON.stringify({
                            'foo': {
                                'entries': [
                                    k2.id
                                ]
                            }
                        });
                    }
                    return undefined;
                }
            });
            instantiationService.stub(notebookLoggingService_1.INotebookLoggingService, new class extends (0, mock_1.mock)() {
                info() { }
                debug() { }
            });
            const kernelHistoryService = disposables.add(instantiationService.createInstance(notebookKernelHistoryServiceImpl_1.NotebookKernelHistoryService));
            let info = kernelHistoryService.getKernels({ uri: u1, viewType: 'foo' });
            assert.equal(info.all.length, 1);
            assert.deepStrictEqual(info.selected, undefined);
            kernelHistoryService.addMostRecentKernel(k3);
            info = kernelHistoryService.getKernels({ uri: u1, viewType: 'foo' });
            assert.deepStrictEqual(info.all, [k3, k2]);
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
            this.id = Math.random() + 'kernel';
            this.label = 'test-label';
            this.viewType = '*';
            this.onDidChange = event_1.Event.None;
            this.extension = new extensions_1.ExtensionIdentifier('test');
            this.localResourceRoot = uri_1.URI.file('/test');
            this.preloadUris = [];
            this.preloadProvides = [];
            this.supportedLanguages = [];
            this.supportedLanguages = opts?.languages ?? [modesRegistry_1.PLAINTEXT_LANGUAGE_ID];
            this.label = opts?.label ?? this.label;
            this.viewType = opts?.viewType ?? this.viewType;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tLZXJuZWxIaXN0b3J5LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay90ZXN0L2Jyb3dzZXIvbm90ZWJvb2tLZXJuZWxIaXN0b3J5LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFxQmhHLEtBQUssQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUU7UUFFMUMsSUFBSSxXQUE0QixDQUFDO1FBQ2pDLElBQUksb0JBQThDLENBQUM7UUFDbkQsSUFBSSxhQUFxQyxDQUFDO1FBRTFDLElBQUksd0JBQW9ELENBQUM7UUFFekQsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxLQUFLLENBQUM7WUFDTCxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDcEMsd0JBQXdCLEdBQUcsSUFBSSxlQUFPLEVBQUUsQ0FBQztZQUN6QyxXQUFXLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFFMUMsb0JBQW9CLEdBQUcsSUFBQSw4Q0FBeUIsRUFBQyxXQUFXLENBQUMsQ0FBQztZQUM5RCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsa0NBQWdCLEVBQUUsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQW9CO2dCQUF0Qzs7b0JBQ3RDLDZCQUF3QixHQUFHLHdCQUF3QixDQUFDLEtBQUssQ0FBQztvQkFDMUQsaUNBQTRCLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztnQkFFcEQsQ0FBQztnQkFEUyxxQkFBcUIsS0FBSyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDL0MsQ0FBQyxDQUFDO1lBQ0gsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHNC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