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
        (0, utils_1.$bT)();
        setup(function () {
            disposables = new lifecycle_1.$jc();
            onDidAddNotebookDocument = new event_1.$fd();
            disposables.add(onDidAddNotebookDocument);
            instantiationService = (0, testNotebookEditor_1.$Ifc)(disposables);
            instantiationService.stub(notebookService_1.$ubb, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.onDidAddNotebookDocument = onDidAddNotebookDocument.event;
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
            kernelService = disposables.add(instantiationService.createInstance(notebookKernelServiceImpl_1.$8Eb));
            instantiationService.set(notebookKernelService_1.$Bbb, kernelService);
        });
        test('notebook kernel empty history', function () {
            const u1 = uri_1.URI.parse('foo:///one');
            const k1 = new TestNotebookKernel({ label: 'z', viewType: 'foo' });
            const k2 = new TestNotebookKernel({ label: 'a', viewType: 'foo' });
            disposables.add(kernelService.registerKernel(k1));
            disposables.add(kernelService.registerKernel(k2));
            instantiationService.stub(storage_1.$Vo, new class extends (0, mock_1.$rT)() {
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
            instantiationService.stub(notebookLoggingService_1.$1ob, new class extends (0, mock_1.$rT)() {
                info() { }
                debug() { }
            });
            const kernelHistoryService = disposables.add(instantiationService.createInstance(notebookKernelHistoryServiceImpl_1.$oGb));
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
            instantiationService.stub(storage_1.$Vo, new class extends (0, mock_1.$rT)() {
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
            instantiationService.stub(notebookLoggingService_1.$1ob, new class extends (0, mock_1.$rT)() {
                info() { }
                debug() { }
            });
            const kernelHistoryService = disposables.add(instantiationService.createInstance(notebookKernelHistoryServiceImpl_1.$oGb));
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
            this.extension = new extensions_1.$Vl('test');
            this.localResourceRoot = uri_1.URI.file('/test');
            this.preloadUris = [];
            this.preloadProvides = [];
            this.supportedLanguages = [];
            this.supportedLanguages = opts?.languages ?? [modesRegistry_1.$Yt];
            this.label = opts?.label ?? this.label;
            this.viewType = opts?.viewType ?? this.viewType;
        }
    }
});
//# sourceMappingURL=notebookKernelHistory.test.js.map