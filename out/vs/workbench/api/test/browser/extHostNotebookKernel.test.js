/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/extensions/common/extensions", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostCommands", "vs/workbench/api/common/extHostDocuments", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/common/extHostNotebook", "vs/workbench/api/common/extHostNotebookDocuments", "vs/workbench/api/common/extHostNotebookKernels", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/proxyIdentifier", "vs/workbench/api/test/common/testRPCProtocol", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/api/common/extHostFileSystemConsumer", "vs/workbench/api/common/extHostFileSystemInfo", "vs/base/test/common/utils"], function (require, exports, assert, async_1, lifecycle_1, uri_1, extensions_1, log_1, extHost_protocol_1, extHostCommands_1, extHostDocuments_1, extHostDocumentsAndEditors_1, extHostNotebook_1, extHostNotebookDocuments_1, extHostNotebookKernels_1, extHostTypes_1, notebookCommon_1, notebookExecutionService_1, extensions_2, proxyIdentifier_1, testRPCProtocol_1, workbenchTestServices_1, extHostFileSystemConsumer_1, extHostFileSystemInfo_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookKernel', function () {
        let rpcProtocol;
        let extHostNotebookKernels;
        let notebook;
        let extHostDocumentsAndEditors;
        let extHostDocuments;
        let extHostNotebooks;
        let extHostNotebookDocuments;
        let extHostCommands;
        let extHostConsumerFileSystem;
        const notebookUri = uri_1.URI.parse('test:///notebook.file');
        const kernelData = new Map();
        const disposables = new lifecycle_1.DisposableStore();
        const cellExecuteCreate = [];
        const cellExecuteUpdates = [];
        const cellExecuteComplete = [];
        teardown(function () {
            disposables.clear();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(async function () {
            cellExecuteCreate.length = 0;
            cellExecuteUpdates.length = 0;
            cellExecuteComplete.length = 0;
            kernelData.clear();
            rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadCommands, new class extends (0, workbenchTestServices_1.mock)() {
                $registerCommand() { }
            });
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadNotebookKernels, new class extends (0, workbenchTestServices_1.mock)() {
                async $addKernel(handle, data) {
                    kernelData.set(handle, data);
                }
                $removeKernel(handle) {
                    kernelData.delete(handle);
                }
                $updateKernel(handle, data) {
                    assert.strictEqual(kernelData.has(handle), true);
                    kernelData.set(handle, { ...kernelData.get(handle), ...data, });
                }
                $createExecution(handle, controllerId, uri, cellHandle) {
                    cellExecuteCreate.push({ notebook: uri, cell: cellHandle });
                }
                $updateExecution(handle, data) {
                    cellExecuteUpdates.push(...data.value);
                }
                $completeExecution(handle, data) {
                    cellExecuteComplete.push(data.value);
                }
            });
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadNotebookDocuments, new class extends (0, workbenchTestServices_1.mock)() {
            });
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadNotebook, new class extends (0, workbenchTestServices_1.mock)() {
                async $registerNotebookSerializer() { }
                async $unregisterNotebookSerializer() { }
            });
            extHostDocumentsAndEditors = new extHostDocumentsAndEditors_1.ExtHostDocumentsAndEditors(rpcProtocol, new log_1.NullLogService());
            extHostDocuments = disposables.add(new extHostDocuments_1.ExtHostDocuments(rpcProtocol, extHostDocumentsAndEditors));
            extHostCommands = new extHostCommands_1.ExtHostCommands(rpcProtocol, new log_1.NullLogService(), new class extends (0, workbenchTestServices_1.mock)() {
                onExtensionError() {
                    return true;
                }
            });
            extHostConsumerFileSystem = new extHostFileSystemConsumer_1.ExtHostConsumerFileSystem(rpcProtocol, new extHostFileSystemInfo_1.ExtHostFileSystemInfo());
            extHostNotebooks = new extHostNotebook_1.ExtHostNotebookController(rpcProtocol, extHostCommands, extHostDocumentsAndEditors, extHostDocuments, extHostConsumerFileSystem);
            extHostNotebookDocuments = new extHostNotebookDocuments_1.ExtHostNotebookDocuments(extHostNotebooks);
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.SerializableObjectWithBuffers({
                addedDocuments: [{
                        uri: notebookUri,
                        viewType: 'test',
                        versionId: 0,
                        cells: [{
                                handle: 0,
                                uri: notebookCommon_1.CellUri.generate(notebookUri, 0),
                                source: ['### Heading'],
                                eol: '\n',
                                language: 'markdown',
                                cellKind: notebookCommon_1.CellKind.Markup,
                                outputs: [],
                            }, {
                                handle: 1,
                                uri: notebookCommon_1.CellUri.generate(notebookUri, 1),
                                source: ['console.log("aaa")', 'console.log("bbb")'],
                                eol: '\n',
                                language: 'javascript',
                                cellKind: notebookCommon_1.CellKind.Code,
                                outputs: [],
                            }],
                    }],
                addedEditors: [{
                        documentUri: notebookUri,
                        id: '_notebook_editor_0',
                        selections: [{ start: 0, end: 1 }],
                        visibleRanges: []
                    }]
            }));
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.SerializableObjectWithBuffers({ newActiveEditor: '_notebook_editor_0' }));
            notebook = extHostNotebooks.notebookDocuments[0];
            disposables.add(notebook);
            disposables.add(extHostDocuments);
            extHostNotebookKernels = new extHostNotebookKernels_1.ExtHostNotebookKernels(rpcProtocol, new class extends (0, workbenchTestServices_1.mock)() {
            }, extHostNotebooks, extHostCommands, new log_1.NullLogService());
        });
        test('create/dispose kernel', async function () {
            const kernel = extHostNotebookKernels.createNotebookController(extensions_2.nullExtensionDescription, 'foo', '*', 'Foo');
            assert.throws(() => kernel.id = 'dd');
            assert.throws(() => kernel.notebookType = 'dd');
            assert.ok(kernel);
            assert.strictEqual(kernel.id, 'foo');
            assert.strictEqual(kernel.label, 'Foo');
            assert.strictEqual(kernel.notebookType, '*');
            await rpcProtocol.sync();
            assert.strictEqual(kernelData.size, 1);
            const [first] = kernelData.values();
            assert.strictEqual(first.id, 'nullExtensionDescription/foo');
            assert.strictEqual(extensions_1.ExtensionIdentifier.equals(first.extensionId, extensions_2.nullExtensionDescription.identifier), true);
            assert.strictEqual(first.label, 'Foo');
            assert.strictEqual(first.notebookType, '*');
            kernel.dispose();
            await rpcProtocol.sync();
            assert.strictEqual(kernelData.size, 0);
        });
        test('update kernel', async function () {
            const kernel = disposables.add(extHostNotebookKernels.createNotebookController(extensions_2.nullExtensionDescription, 'foo', '*', 'Foo'));
            await rpcProtocol.sync();
            assert.ok(kernel);
            let [first] = kernelData.values();
            assert.strictEqual(first.id, 'nullExtensionDescription/foo');
            assert.strictEqual(first.label, 'Foo');
            kernel.label = 'Far';
            assert.strictEqual(kernel.label, 'Far');
            await rpcProtocol.sync();
            [first] = kernelData.values();
            assert.strictEqual(first.id, 'nullExtensionDescription/foo');
            assert.strictEqual(first.label, 'Far');
        });
        test('execute - simple createNotebookCellExecution', function () {
            const kernel = disposables.add(extHostNotebookKernels.createNotebookController(extensions_2.nullExtensionDescription, 'foo', '*', 'Foo'));
            extHostNotebookKernels.$acceptNotebookAssociation(0, notebook.uri, true);
            const cell1 = notebook.apiNotebook.cellAt(0);
            const task = kernel.createNotebookCellExecution(cell1);
            task.start();
            task.end(undefined);
        });
        test('createNotebookCellExecution, must be selected/associated', function () {
            const kernel = disposables.add(extHostNotebookKernels.createNotebookController(extensions_2.nullExtensionDescription, 'foo', '*', 'Foo'));
            assert.throws(() => {
                kernel.createNotebookCellExecution(notebook.apiNotebook.cellAt(0));
            });
            extHostNotebookKernels.$acceptNotebookAssociation(0, notebook.uri, true);
            const execution = kernel.createNotebookCellExecution(notebook.apiNotebook.cellAt(0));
            execution.end(true);
        });
        test('createNotebookCellExecution, cell must be alive', function () {
            const kernel = disposables.add(extHostNotebookKernels.createNotebookController(extensions_2.nullExtensionDescription, 'foo', '*', 'Foo'));
            const cell1 = notebook.apiNotebook.cellAt(0);
            extHostNotebookKernels.$acceptNotebookAssociation(0, notebook.uri, true);
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.SerializableObjectWithBuffers({
                versionId: 12,
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, notebook.apiNotebook.cellCount, []]]
                    }]
            }), true);
            assert.strictEqual(cell1.index, -1);
            assert.throws(() => {
                kernel.createNotebookCellExecution(cell1);
            });
        });
        test('interrupt handler, cancellation', async function () {
            let interruptCallCount = 0;
            let tokenCancelCount = 0;
            const kernel = disposables.add(extHostNotebookKernels.createNotebookController(extensions_2.nullExtensionDescription, 'foo', '*', 'Foo'));
            kernel.interruptHandler = () => { interruptCallCount += 1; };
            extHostNotebookKernels.$acceptNotebookAssociation(0, notebook.uri, true);
            const cell1 = notebook.apiNotebook.cellAt(0);
            const task = kernel.createNotebookCellExecution(cell1);
            disposables.add(task.token.onCancellationRequested(() => tokenCancelCount += 1));
            await extHostNotebookKernels.$cancelCells(0, notebook.uri, [0]);
            assert.strictEqual(interruptCallCount, 1);
            assert.strictEqual(tokenCancelCount, 0);
            await extHostNotebookKernels.$cancelCells(0, notebook.uri, [0]);
            assert.strictEqual(interruptCallCount, 2);
            assert.strictEqual(tokenCancelCount, 0);
            // should cancelling the cells end the execution task?
            task.end(false);
        });
        test('set outputs on cancel', async function () {
            const kernel = disposables.add(extHostNotebookKernels.createNotebookController(extensions_2.nullExtensionDescription, 'foo', '*', 'Foo'));
            extHostNotebookKernels.$acceptNotebookAssociation(0, notebook.uri, true);
            const cell1 = notebook.apiNotebook.cellAt(0);
            const task = kernel.createNotebookCellExecution(cell1);
            task.start();
            const b = new async_1.Barrier();
            disposables.add(task.token.onCancellationRequested(async () => {
                await task.replaceOutput(new extHostTypes_1.NotebookCellOutput([extHostTypes_1.NotebookCellOutputItem.text('canceled')]));
                task.end(true);
                b.open(); // use barrier to signal that cancellation has happened
            }));
            cellExecuteUpdates.length = 0;
            await extHostNotebookKernels.$cancelCells(0, notebook.uri, [0]);
            await b.wait();
            assert.strictEqual(cellExecuteUpdates.length > 0, true);
            let found = false;
            for (const edit of cellExecuteUpdates) {
                if (edit.editType === notebookExecutionService_1.CellExecutionUpdateType.Output) {
                    assert.strictEqual(edit.append, false);
                    assert.strictEqual(edit.outputs.length, 1);
                    assert.strictEqual(edit.outputs[0].items.length, 1);
                    assert.deepStrictEqual(Array.from(edit.outputs[0].items[0].valueBytes.buffer), Array.from(new TextEncoder().encode('canceled')));
                    found = true;
                }
            }
            assert.ok(found);
        });
        test('set outputs on interrupt', async function () {
            const kernel = extHostNotebookKernels.createNotebookController(extensions_2.nullExtensionDescription, 'foo', '*', 'Foo');
            extHostNotebookKernels.$acceptNotebookAssociation(0, notebook.uri, true);
            const cell1 = notebook.apiNotebook.cellAt(0);
            const task = kernel.createNotebookCellExecution(cell1);
            task.start();
            kernel.interruptHandler = async (_notebook) => {
                assert.ok(notebook.apiNotebook === _notebook);
                await task.replaceOutput(new extHostTypes_1.NotebookCellOutput([extHostTypes_1.NotebookCellOutputItem.text('interrupted')]));
                task.end(true);
            };
            cellExecuteUpdates.length = 0;
            await extHostNotebookKernels.$cancelCells(0, notebook.uri, [0]);
            assert.strictEqual(cellExecuteUpdates.length > 0, true);
            let found = false;
            for (const edit of cellExecuteUpdates) {
                if (edit.editType === notebookExecutionService_1.CellExecutionUpdateType.Output) {
                    assert.strictEqual(edit.append, false);
                    assert.strictEqual(edit.outputs.length, 1);
                    assert.strictEqual(edit.outputs[0].items.length, 1);
                    assert.deepStrictEqual(Array.from(edit.outputs[0].items[0].valueBytes.buffer), Array.from(new TextEncoder().encode('interrupted')));
                    found = true;
                }
            }
            assert.ok(found);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE5vdGVib29rS2VybmVsLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9leHRIb3N0Tm90ZWJvb2tLZXJuZWwudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQTZCaEcsS0FBSyxDQUFDLGdCQUFnQixFQUFFO1FBQ3ZCLElBQUksV0FBNEIsQ0FBQztRQUNqQyxJQUFJLHNCQUE4QyxDQUFDO1FBQ25ELElBQUksUUFBaUMsQ0FBQztRQUN0QyxJQUFJLDBCQUFzRCxDQUFDO1FBQzNELElBQUksZ0JBQWtDLENBQUM7UUFDdkMsSUFBSSxnQkFBMkMsQ0FBQztRQUNoRCxJQUFJLHdCQUFrRCxDQUFDO1FBQ3ZELElBQUksZUFBZ0MsQ0FBQztRQUNyQyxJQUFJLHlCQUFvRCxDQUFDO1FBRXpELE1BQU0sV0FBVyxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUN2RCxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBK0IsQ0FBQztRQUMxRCxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUUxQyxNQUFNLGlCQUFpQixHQUFnRCxFQUFFLENBQUM7UUFDMUUsTUFBTSxrQkFBa0IsR0FBNEIsRUFBRSxDQUFDO1FBQ3ZELE1BQU0sbUJBQW1CLEdBQWdDLEVBQUUsQ0FBQztRQUU1RCxRQUFRLENBQUM7WUFDUixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsS0FBSyxDQUFDLEtBQUs7WUFDVixpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQzdCLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDOUIsbUJBQW1CLENBQUMsTUFB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