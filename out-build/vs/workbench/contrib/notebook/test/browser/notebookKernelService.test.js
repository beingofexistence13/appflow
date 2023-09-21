/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/platform/extensions/common/extensions", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor", "vs/base/common/event", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/browser/services/notebookKernelServiceImpl", "vs/workbench/contrib/notebook/common/notebookService", "vs/base/test/common/mock", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/model/notebookTextModel", "vs/editor/common/languages/modesRegistry", "vs/platform/actions/common/actions"], function (require, exports, assert, uri_1, extensions_1, testNotebookEditor_1, event_1, notebookKernelService_1, notebookKernelServiceImpl_1, notebookService_1, mock_1, lifecycle_1, notebookTextModel_1, modesRegistry_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookKernelService', () => {
        let instantiationService;
        let kernelService;
        let disposables;
        let onDidAddNotebookDocument;
        teardown(() => {
            disposables.dispose();
        });
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
            kernelService = instantiationService.createInstance(notebookKernelServiceImpl_1.$8Eb);
            instantiationService.set(notebookKernelService_1.$Bbb, kernelService);
        });
        test('notebook priorities', function () {
            const u1 = uri_1.URI.parse('foo:///one');
            const u2 = uri_1.URI.parse('foo:///two');
            const k1 = new TestNotebookKernel({ label: 'z' });
            const k2 = new TestNotebookKernel({ label: 'a' });
            kernelService.registerKernel(k1);
            kernelService.registerKernel(k2);
            // equal priorities -> sort by name
            let info = kernelService.getMatchingKernel({ uri: u1, viewType: 'foo' });
            assert.ok(info.all[0] === k2);
            assert.ok(info.all[1] === k1);
            // update priorities for u1 notebook
            kernelService.updateKernelNotebookAffinity(k2, u1, 2);
            kernelService.updateKernelNotebookAffinity(k2, u2, 1);
            // updated
            info = kernelService.getMatchingKernel({ uri: u1, viewType: 'foo' });
            assert.ok(info.all[0] === k2);
            assert.ok(info.all[1] === k1);
            // NOT updated
            info = kernelService.getMatchingKernel({ uri: u2, viewType: 'foo' });
            assert.ok(info.all[0] === k2);
            assert.ok(info.all[1] === k1);
            // reset
            kernelService.updateKernelNotebookAffinity(k2, u1, undefined);
            info = kernelService.getMatchingKernel({ uri: u1, viewType: 'foo' });
            assert.ok(info.all[0] === k2);
            assert.ok(info.all[1] === k1);
        });
        test('new kernel with higher affinity wins, https://github.com/microsoft/vscode/issues/122028', function () {
            const notebook = uri_1.URI.parse('foo:///one');
            const kernel = new TestNotebookKernel();
            kernelService.registerKernel(kernel);
            let info = kernelService.getMatchingKernel({ uri: notebook, viewType: 'foo' });
            assert.strictEqual(info.all.length, 1);
            assert.ok(info.all[0] === kernel);
            const betterKernel = new TestNotebookKernel();
            kernelService.registerKernel(betterKernel);
            info = kernelService.getMatchingKernel({ uri: notebook, viewType: 'foo' });
            assert.strictEqual(info.all.length, 2);
            kernelService.updateKernelNotebookAffinity(betterKernel, notebook, 2);
            info = kernelService.getMatchingKernel({ uri: notebook, viewType: 'foo' });
            assert.strictEqual(info.all.length, 2);
            assert.ok(info.all[0] === betterKernel);
            assert.ok(info.all[1] === kernel);
        });
        test('onDidChangeSelectedNotebooks not fired on initial notebook open #121904', function () {
            const uri = uri_1.URI.parse('foo:///one');
            const jupyter = { uri, viewType: 'jupyter' };
            const dotnet = { uri, viewType: 'dotnet' };
            const jupyterKernel = new TestNotebookKernel({ viewType: jupyter.viewType });
            const dotnetKernel = new TestNotebookKernel({ viewType: dotnet.viewType });
            kernelService.registerKernel(jupyterKernel);
            kernelService.registerKernel(dotnetKernel);
            kernelService.selectKernelForNotebook(jupyterKernel, jupyter);
            kernelService.selectKernelForNotebook(dotnetKernel, dotnet);
            let info = kernelService.getMatchingKernel(dotnet);
            assert.strictEqual(info.selected === dotnetKernel, true);
            info = kernelService.getMatchingKernel(jupyter);
            assert.strictEqual(info.selected === jupyterKernel, true);
        });
        test('onDidChangeSelectedNotebooks not fired on initial notebook open #121904, p2', async function () {
            const uri = uri_1.URI.parse('foo:///one');
            const jupyter = { uri, viewType: 'jupyter' };
            const dotnet = { uri, viewType: 'dotnet' };
            const jupyterKernel = new TestNotebookKernel({ viewType: jupyter.viewType });
            const dotnetKernel = new TestNotebookKernel({ viewType: dotnet.viewType });
            kernelService.registerKernel(jupyterKernel);
            kernelService.registerKernel(dotnetKernel);
            kernelService.selectKernelForNotebook(jupyterKernel, jupyter);
            kernelService.selectKernelForNotebook(dotnetKernel, dotnet);
            const transientOptions = {
                transientOutputs: false,
                transientCellMetadata: {},
                transientDocumentMetadata: {},
                cellContentMetadata: {},
            };
            {
                // open as jupyter -> bind event
                const p1 = event_1.Event.toPromise(kernelService.onDidChangeSelectedNotebooks);
                const d1 = instantiationService.createInstance(notebookTextModel_1.$MH, jupyter.viewType, jupyter.uri, [], {}, transientOptions);
                onDidAddNotebookDocument.fire(d1);
                const event = await p1;
                assert.strictEqual(event.newKernel, jupyterKernel.id);
            }
            {
                // RE-open as dotnet -> bind event
                const p2 = event_1.Event.toPromise(kernelService.onDidChangeSelectedNotebooks);
                const d2 = instantiationService.createInstance(notebookTextModel_1.$MH, dotnet.viewType, dotnet.uri, [], {}, transientOptions);
                onDidAddNotebookDocument.fire(d2);
                const event2 = await p2;
                assert.strictEqual(event2.newKernel, dotnetKernel.id);
            }
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
//# sourceMappingURL=notebookKernelService.test.js.map