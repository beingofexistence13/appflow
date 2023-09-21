/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/test/common/testRPCProtocol", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/base/test/common/mock", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostNotebook", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/base/common/uri", "vs/workbench/api/common/extHostDocuments", "vs/workbench/api/common/extHostCommands", "vs/workbench/services/extensions/common/extensions", "vs/base/common/resources", "vs/base/common/event", "vs/workbench/api/common/extHostNotebookDocuments", "vs/workbench/services/extensions/common/proxyIdentifier", "vs/base/common/buffer", "vs/workbench/api/common/extHostFileSystemConsumer", "vs/workbench/api/common/extHostFileSystemInfo", "vs/base/test/common/utils"], function (require, exports, assert, extHostDocumentsAndEditors_1, testRPCProtocol_1, lifecycle_1, log_1, mock_1, extHost_protocol_1, extHostNotebook_1, notebookCommon_1, uri_1, extHostDocuments_1, extHostCommands_1, extensions_1, resources_1, event_1, extHostNotebookDocuments_1, proxyIdentifier_1, buffer_1, extHostFileSystemConsumer_1, extHostFileSystemInfo_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookCell#Document', function () {
        let rpcProtocol;
        let notebook;
        let extHostDocumentsAndEditors;
        let extHostDocuments;
        let extHostNotebooks;
        let extHostNotebookDocuments;
        let extHostConsumerFileSystem;
        const notebookUri = uri_1.URI.parse('test:///notebook.file');
        const disposables = new lifecycle_1.DisposableStore();
        teardown(function () {
            disposables.clear();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(async function () {
            rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadCommands, new class extends (0, mock_1.mock)() {
                $registerCommand() { }
            });
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadNotebook, new class extends (0, mock_1.mock)() {
                async $registerNotebookSerializer() { }
                async $unregisterNotebookSerializer() { }
            });
            extHostDocumentsAndEditors = new extHostDocumentsAndEditors_1.ExtHostDocumentsAndEditors(rpcProtocol, new log_1.NullLogService());
            extHostDocuments = new extHostDocuments_1.ExtHostDocuments(rpcProtocol, extHostDocumentsAndEditors);
            extHostConsumerFileSystem = new extHostFileSystemConsumer_1.ExtHostConsumerFileSystem(rpcProtocol, new extHostFileSystemInfo_1.ExtHostFileSystemInfo());
            extHostNotebooks = new extHostNotebook_1.ExtHostNotebookController(rpcProtocol, new extHostCommands_1.ExtHostCommands(rpcProtocol, new log_1.NullLogService(), new class extends (0, mock_1.mock)() {
                onExtensionError() {
                    return true;
                }
            }), extHostDocumentsAndEditors, extHostDocuments, extHostConsumerFileSystem);
            extHostNotebookDocuments = new extHostNotebookDocuments_1.ExtHostNotebookDocuments(extHostNotebooks);
            const reg = extHostNotebooks.registerNotebookSerializer(extensions_1.nullExtensionDescription, 'test', new class extends (0, mock_1.mock)() {
            });
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
            disposables.add(reg);
            disposables.add(notebook);
            disposables.add(extHostDocuments);
        });
        test('cell document is vscode.TextDocument', async function () {
            assert.strictEqual(notebook.apiNotebook.cellCount, 2);
            const [c1, c2] = notebook.apiNotebook.getCells();
            const d1 = extHostDocuments.getDocument(c1.document.uri);
            assert.ok(d1);
            assert.strictEqual(d1.languageId, c1.document.languageId);
            assert.strictEqual(d1.version, 1);
            const d2 = extHostDocuments.getDocument(c2.document.uri);
            assert.ok(d2);
            assert.strictEqual(d2.languageId, c2.document.languageId);
            assert.strictEqual(d2.version, 1);
        });
        test('cell document goes when notebook closes', async function () {
            const cellUris = [];
            for (const cell of notebook.apiNotebook.getCells()) {
                assert.ok(extHostDocuments.getDocument(cell.document.uri));
                cellUris.push(cell.document.uri.toString());
            }
            const removedCellUris = [];
            const reg = extHostDocuments.onDidRemoveDocument(doc => {
                removedCellUris.push(doc.uri.toString());
            });
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.SerializableObjectWithBuffers({ removedDocuments: [notebook.uri] }));
            reg.dispose();
            assert.strictEqual(removedCellUris.length, 2);
            assert.deepStrictEqual(removedCellUris.sort(), cellUris.sort());
        });
        test('cell document is vscode.TextDocument after changing it', async function () {
            const p = new Promise((resolve, reject) => {
                disposables.add(extHostNotebookDocuments.onDidChangeNotebookDocument(e => {
                    try {
                        assert.strictEqual(e.contentChanges.length, 1);
                        assert.strictEqual(e.contentChanges[0].addedCells.length, 2);
                        const [first, second] = e.contentChanges[0].addedCells;
                        const doc1 = extHostDocuments.getAllDocumentData().find(data => (0, resources_1.isEqual)(data.document.uri, first.document.uri));
                        assert.ok(doc1);
                        assert.strictEqual(doc1?.document === first.document, true);
                        const doc2 = extHostDocuments.getAllDocumentData().find(data => (0, resources_1.isEqual)(data.document.uri, second.document.uri));
                        assert.ok(doc2);
                        assert.strictEqual(doc2?.document === second.document, true);
                        resolve();
                    }
                    catch (err) {
                        reject(err);
                    }
                }));
            });
            extHostNotebookDocuments.$acceptModelChanged(notebookUri, new proxyIdentifier_1.SerializableObjectWithBuffers({
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 0, [{
                                        handle: 2,
                                        uri: notebookCommon_1.CellUri.generate(notebookUri, 2),
                                        source: ['Hello', 'World', 'Hello World!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }, {
                                        handle: 3,
                                        uri: notebookCommon_1.CellUri.generate(notebookUri, 3),
                                        source: ['Hallo', 'Welt', 'Hallo Welt!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }
                ]
            }), false);
            await p;
        });
        test('cell document stays open when notebook is still open', async function () {
            const docs = [];
            const addData = [];
            for (const cell of notebook.apiNotebook.getCells()) {
                const doc = extHostDocuments.getDocument(cell.document.uri);
                assert.ok(doc);
                assert.strictEqual(extHostDocuments.getDocument(cell.document.uri).isClosed, false);
                docs.push(doc);
                addData.push({
                    EOL: '\n',
                    isDirty: doc.isDirty,
                    lines: doc.getText().split('\n'),
                    languageId: doc.languageId,
                    uri: doc.uri,
                    versionId: doc.version
                });
            }
            // this call happens when opening a document on the main side
            extHostDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({ addedDocuments: addData });
            // this call happens when closing a document from the main side
            extHostDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({ removedDocuments: docs.map(d => d.uri) });
            // notebook is still open -> cell documents stay open
            for (const cell of notebook.apiNotebook.getCells()) {
                assert.ok(extHostDocuments.getDocument(cell.document.uri));
                assert.strictEqual(extHostDocuments.getDocument(cell.document.uri).isClosed, false);
            }
            // close notebook -> docs are closed
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.SerializableObjectWithBuffers({ removedDocuments: [notebook.uri] }));
            for (const cell of notebook.apiNotebook.getCells()) {
                assert.throws(() => extHostDocuments.getDocument(cell.document.uri));
            }
            for (const doc of docs) {
                assert.strictEqual(doc.isClosed, true);
            }
        });
        test('cell document goes when cell is removed', async function () {
            assert.strictEqual(notebook.apiNotebook.cellCount, 2);
            const [cell1, cell2] = notebook.apiNotebook.getCells();
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.SerializableObjectWithBuffers({
                versionId: 2,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 1, []]]
                    }
                ]
            }), false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1);
            assert.strictEqual(cell1.document.isClosed, true); // ref still alive!
            assert.strictEqual(cell2.document.isClosed, false);
            assert.throws(() => extHostDocuments.getDocument(cell1.document.uri));
        });
        test('cell#index', function () {
            assert.strictEqual(notebook.apiNotebook.cellCount, 2);
            const [first, second] = notebook.apiNotebook.getCells();
            assert.strictEqual(first.index, 0);
            assert.strictEqual(second.index, 1);
            // remove first cell
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.SerializableObjectWithBuffers({
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 1, []]]
                    }]
            }), false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1);
            assert.strictEqual(second.index, 0);
            extHostNotebookDocuments.$acceptModelChanged(notebookUri, new proxyIdentifier_1.SerializableObjectWithBuffers({
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 0, [{
                                        handle: 2,
                                        uri: notebookCommon_1.CellUri.generate(notebookUri, 2),
                                        source: ['Hello', 'World', 'Hello World!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }, {
                                        handle: 3,
                                        uri: notebookCommon_1.CellUri.generate(notebookUri, 3),
                                        source: ['Hallo', 'Welt', 'Hallo Welt!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }]
            }), false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 3);
            assert.strictEqual(second.index, 2);
        });
        test('ERR MISSING extHostDocument for notebook cell: #116711', async function () {
            const p = event_1.Event.toPromise(extHostNotebookDocuments.onDidChangeNotebookDocument);
            // DON'T call this, make sure the cell-documents have not been created yet
            // assert.strictEqual(notebook.notebookDocument.cellCount, 2);
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.SerializableObjectWithBuffers({
                versionId: 100,
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 2, [{
                                        handle: 3,
                                        uri: notebookCommon_1.CellUri.generate(notebookUri, 3),
                                        source: ['### Heading'],
                                        eol: '\n',
                                        language: 'markdown',
                                        cellKind: notebookCommon_1.CellKind.Markup,
                                        outputs: [],
                                    }, {
                                        handle: 4,
                                        uri: notebookCommon_1.CellUri.generate(notebookUri, 4),
                                        source: ['console.log("aaa")', 'console.log("bbb")'],
                                        eol: '\n',
                                        language: 'javascript',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }]
            }), false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 2);
            const event = await p;
            assert.strictEqual(event.notebook === notebook.apiNotebook, true);
            assert.strictEqual(event.contentChanges.length, 1);
            assert.strictEqual(event.contentChanges[0].range.end - event.contentChanges[0].range.start, 2);
            assert.strictEqual(event.contentChanges[0].removedCells[0].document.isClosed, true);
            assert.strictEqual(event.contentChanges[0].removedCells[1].document.isClosed, true);
            assert.strictEqual(event.contentChanges[0].addedCells.length, 2);
            assert.strictEqual(event.contentChanges[0].addedCells[0].document.isClosed, false);
            assert.strictEqual(event.contentChanges[0].addedCells[1].document.isClosed, false);
        });
        test('Opening a notebook results in VS Code firing the event onDidChangeActiveNotebookEditor twice #118470', function () {
            let count = 0;
            disposables.add(extHostNotebooks.onDidChangeActiveNotebookEditor(() => count += 1));
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.SerializableObjectWithBuffers({
                addedEditors: [{
                        documentUri: notebookUri,
                        id: '_notebook_editor_2',
                        selections: [{ start: 0, end: 1 }],
                        visibleRanges: []
                    }]
            }));
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.SerializableObjectWithBuffers({
                newActiveEditor: '_notebook_editor_2'
            }));
            assert.strictEqual(count, 1);
        });
        test('unset active notebook editor', function () {
            const editor = extHostNotebooks.activeNotebookEditor;
            assert.ok(editor !== undefined);
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.SerializableObjectWithBuffers({ newActiveEditor: undefined }));
            assert.ok(extHostNotebooks.activeNotebookEditor === editor);
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.SerializableObjectWithBuffers({}));
            assert.ok(extHostNotebooks.activeNotebookEditor === editor);
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.SerializableObjectWithBuffers({ newActiveEditor: null }));
            assert.ok(extHostNotebooks.activeNotebookEditor === undefined);
        });
        test('change cell language triggers onDidChange events', async function () {
            const first = notebook.apiNotebook.cellAt(0);
            assert.strictEqual(first.document.languageId, 'markdown');
            const removed = event_1.Event.toPromise(extHostDocuments.onDidRemoveDocument);
            const added = event_1.Event.toPromise(extHostDocuments.onDidAddDocument);
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.SerializableObjectWithBuffers({
                versionId: 12, rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellLanguage,
                        index: 0,
                        language: 'fooLang'
                    }]
            }), false);
            const removedDoc = await removed;
            const addedDoc = await added;
            assert.strictEqual(first.document.languageId, 'fooLang');
            assert.ok(removedDoc === addedDoc);
        });
        test('onDidChangeNotebook-event, cell changes', async function () {
            const p = event_1.Event.toPromise(extHostNotebookDocuments.onDidChangeNotebookDocument);
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.SerializableObjectWithBuffers({
                versionId: 12, rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellMetadata,
                        index: 0,
                        metadata: { foo: 1 }
                    }, {
                        kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellMetadata,
                        index: 1,
                        metadata: { foo: 2 },
                    }, {
                        kind: notebookCommon_1.NotebookCellsChangeType.Output,
                        index: 1,
                        outputs: [
                            {
                                items: [{
                                        valueBytes: buffer_1.VSBuffer.fromByteArray([0, 2, 3]),
                                        mime: 'text/plain'
                                    }],
                                outputId: '1'
                            }
                        ]
                    }]
            }), false, undefined);
            const event = await p;
            assert.strictEqual(event.notebook === notebook.apiNotebook, true);
            assert.strictEqual(event.contentChanges.length, 0);
            assert.strictEqual(event.cellChanges.length, 2);
            const [first, second] = event.cellChanges;
            assert.deepStrictEqual(first.metadata, first.cell.metadata);
            assert.deepStrictEqual(first.executionSummary, undefined);
            assert.deepStrictEqual(first.outputs, undefined);
            assert.deepStrictEqual(first.document, undefined);
            assert.deepStrictEqual(second.outputs, second.cell.outputs);
            assert.deepStrictEqual(second.metadata, second.cell.metadata);
            assert.deepStrictEqual(second.executionSummary, undefined);
            assert.deepStrictEqual(second.document, undefined);
        });
        test('onDidChangeNotebook-event, notebook metadata', async function () {
            const p = event_1.Event.toPromise(extHostNotebookDocuments.onDidChangeNotebookDocument);
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.SerializableObjectWithBuffers({ versionId: 12, rawEvents: [] }), false, { foo: 2 });
            const event = await p;
            assert.strictEqual(event.notebook === notebook.apiNotebook, true);
            assert.strictEqual(event.contentChanges.length, 0);
            assert.strictEqual(event.cellChanges.length, 0);
            assert.deepStrictEqual(event.metadata, { foo: 2 });
        });
        test('onDidChangeNotebook-event, froozen data', async function () {
            const p = event_1.Event.toPromise(extHostNotebookDocuments.onDidChangeNotebookDocument);
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.SerializableObjectWithBuffers({ versionId: 12, rawEvents: [] }), false, { foo: 2 });
            const event = await p;
            assert.ok(Object.isFrozen(event));
            assert.ok(Object.isFrozen(event.cellChanges));
            assert.ok(Object.isFrozen(event.contentChanges));
            assert.ok(Object.isFrozen(event.notebook));
            assert.ok(!Object.isFrozen(event.metadata));
        });
        test('change cell language and onDidChangeNotebookDocument', async function () {
            const p = event_1.Event.toPromise(extHostNotebookDocuments.onDidChangeNotebookDocument);
            const first = notebook.apiNotebook.cellAt(0);
            assert.strictEqual(first.document.languageId, 'markdown');
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.SerializableObjectWithBuffers({
                versionId: 12,
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellLanguage,
                        index: 0,
                        language: 'fooLang'
                    }]
            }), false);
            const event = await p;
            assert.strictEqual(event.notebook === notebook.apiNotebook, true);
            assert.strictEqual(event.contentChanges.length, 0);
            assert.strictEqual(event.cellChanges.length, 1);
            const [cellChange] = event.cellChanges;
            assert.strictEqual(cellChange.cell === first, true);
            assert.ok(cellChange.document === first.document);
            assert.ok(cellChange.executionSummary === undefined);
            assert.ok(cellChange.metadata === undefined);
            assert.ok(cellChange.outputs === undefined);
        });
        test('change notebook cell document and onDidChangeNotebookDocument', async function () {
            const p = event_1.Event.toPromise(extHostNotebookDocuments.onDidChangeNotebookDocument);
            const first = notebook.apiNotebook.cellAt(0);
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.SerializableObjectWithBuffers({
                versionId: 12,
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellContent,
                        index: 0
                    }]
            }), false);
            const event = await p;
            assert.strictEqual(event.notebook === notebook.apiNotebook, true);
            assert.strictEqual(event.contentChanges.length, 0);
            assert.strictEqual(event.cellChanges.length, 1);
            const [cellChange] = event.cellChanges;
            assert.strictEqual(cellChange.cell === first, true);
            assert.ok(cellChange.document === first.document);
            assert.ok(cellChange.executionSummary === undefined);
            assert.ok(cellChange.metadata === undefined);
            assert.ok(cellChange.outputs === undefined);
        });
        async function replaceOutputs(cellIndex, outputId, outputItems) {
            const changeEvent = event_1.Event.toPromise(extHostNotebookDocuments.onDidChangeNotebookDocument);
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.SerializableObjectWithBuffers({
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.Output,
                        index: cellIndex,
                        outputs: [{ outputId, items: outputItems }]
                    }]
            }), false);
            await changeEvent;
        }
        async function appendOutputItem(cellIndex, outputId, outputItems) {
            const changeEvent = event_1.Event.toPromise(extHostNotebookDocuments.onDidChangeNotebookDocument);
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.SerializableObjectWithBuffers({
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.OutputItem,
                        index: cellIndex,
                        append: true,
                        outputId,
                        outputItems
                    }]
            }), false);
            await changeEvent;
        }
        test('Append multiple text/plain output items', async function () {
            await replaceOutputs(1, '1', [{ mime: 'text/plain', valueBytes: buffer_1.VSBuffer.fromString('foo') }]);
            await appendOutputItem(1, '1', [{ mime: 'text/plain', valueBytes: buffer_1.VSBuffer.fromString('bar') }]);
            await appendOutputItem(1, '1', [{ mime: 'text/plain', valueBytes: buffer_1.VSBuffer.fromString('baz') }]);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items.length, 3);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[0].mime, 'text/plain');
            assert.strictEqual(buffer_1.VSBuffer.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(), 'foo');
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[1].mime, 'text/plain');
            assert.strictEqual(buffer_1.VSBuffer.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[1].data).toString(), 'bar');
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[2].mime, 'text/plain');
            assert.strictEqual(buffer_1.VSBuffer.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[2].data).toString(), 'baz');
        });
        test('Append multiple stdout stream output items to an output with another mime', async function () {
            await replaceOutputs(1, '1', [{ mime: 'text/plain', valueBytes: buffer_1.VSBuffer.fromString('foo') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.VSBuffer.fromString('bar') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.VSBuffer.fromString('baz') }]);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items.length, 3);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[0].mime, 'text/plain');
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[1].mime, 'application/vnd.code.notebook.stdout');
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[2].mime, 'application/vnd.code.notebook.stdout');
        });
        test('Compress multiple stdout stream output items', async function () {
            await replaceOutputs(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.VSBuffer.fromString('foo') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.VSBuffer.fromString('bar') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.VSBuffer.fromString('baz') }]);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[0].mime, 'application/vnd.code.notebook.stdout');
            assert.strictEqual(buffer_1.VSBuffer.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(), 'foobarbaz');
        });
        test('Compress multiple stdout stream output items (with support for terminal escape code -> \u001b[A)', async function () {
            await replaceOutputs(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.VSBuffer.fromString('\nfoo') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.VSBuffer.fromString(`${String.fromCharCode(27)}[Abar`) }]);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[0].mime, 'application/vnd.code.notebook.stdout');
            assert.strictEqual(buffer_1.VSBuffer.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(), 'bar');
        });
        test('Compress multiple stdout stream output items (with support for terminal escape code -> \r character)', async function () {
            await replaceOutputs(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.VSBuffer.fromString('foo') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.VSBuffer.fromString(`\rbar`) }]);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[0].mime, 'application/vnd.code.notebook.stdout');
            assert.strictEqual(buffer_1.VSBuffer.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(), 'bar');
        });
        test('Compress multiple stderr stream output items', async function () {
            await replaceOutputs(1, '1', [{ mime: 'application/vnd.code.notebook.stderr', valueBytes: buffer_1.VSBuffer.fromString('foo') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stderr', valueBytes: buffer_1.VSBuffer.fromString('bar') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stderr', valueBytes: buffer_1.VSBuffer.fromString('baz') }]);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[0].mime, 'application/vnd.code.notebook.stderr');
            assert.strictEqual(buffer_1.VSBuffer.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(), 'foobarbaz');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE5vdGVib29rLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9leHRIb3N0Tm90ZWJvb2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQTJCaEcsS0FBSyxDQUFDLHVCQUF1QixFQUFFO1FBQzlCLElBQUksV0FBNEIsQ0FBQztRQUNqQyxJQUFJLFFBQWlDLENBQUM7UUFDdEMsSUFBSSwwQkFBc0QsQ0FBQztRQUMzRCxJQUFJLGdCQUFrQyxDQUFDO1FBQ3ZDLElBQUksZ0JBQTJDLENBQUM7UUFDaEQsSUFBSSx3QkFBa0QsQ0FBQztRQUN2RCxJQUFJLHlCQUFvRCxDQUFDO1FBRXpELE1BQU0sV0FBVyxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUN2RCxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUUxQyxRQUFRLENBQUM7WUFDUixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsS0FBSyxDQUFDLEtBQUs7WUFDVixXQUFXLEdBQUcsSUFBSSxpQ0FBZSxFQUFFLENBQUM7WUFDcEMsV0FBVyxDQUFDLEdBQUcsQ0FBQyw4QkFBVyxDQUFDLGtCQUFrQixFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUEyQjtnQkFDdkYsZ0JBQWdCLEtBQUssQ0FBQzthQUMvQixDQUFDLENBQUM7WUFDSCxXQUFXLENBQUMsR0FBRyxDQUFDLDhCQUFXLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQTJCO2dCQUN2RixLQUFLLENBQUMsMkJBQTJCLEtBQUssQ0FBQztnQkFDdkMsS0FBSyxDQUFDLDZCQUE2QixLQUFLLENBQUM7YUFDbEQsQ0FBQyxDQUFDO1lBQ0gsMEJBQTBCLEdBQUcsSUFBSSx1REFBMEIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQztZQUMvRixnQkFBZ0IsR0FBRyxJQUFJLG1DQUFnQixDQUFDLFdBQVcsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1lBQ2pGLHlCQUF5QixHQUFHLElBQUkscURBQXlCLENBQUMsV0FBVyxFQUFFLElBQUksNkNBQXFCLEVBQUUsQ0FBQyxDQUFDO1lBQ3BHLGdCQUFnQixHQUFHLElBQUksMkNBQXlCLENBQUMsV0FBVyxFQUFFLElBQUksaUNBQWUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxvQkFBYyxFQUFFLEVBQUUsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQXFCO2dCQUN0SixnQkFBZ0I7b0JBQ3hCLE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7YUFDRCxDQUFDLEVBQUUsMEJBQTBCLEVBQUUsZ0JBQWdCLEVBQUUseUJBQXlCLENBQUMsQ0FBQztZQUM3RSx3QkFBd0IsR0FBRyxJQUFJLG1EQUF3QixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFMUUsTUFBTSxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsMEJBQTBCLENBQUMscUNBQXdCLEVBQUUsTUFBTSxFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUE2QjthQUFJLENBQUMsQ0FBQztZQUNuSixnQkFBZ0IsQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLCtDQUE2QixDQUFDO2dCQUNqRixjQUFjLEVBQUUsQ0FBQzt3QkFDaEIsR0FBRyxFQUFFLFdBQVc7d0JBQ2hCLFFBQVEsRUFBRSxNQUFNO3dCQUNoQixTQUFTLEVBQUUsQ0FBQzt3QkFDWixLQUFLLEVBQUUsQ0FBQztnQ0FDUCxNQUFNLEVBQUUsQ0FBQztnQ0FDVCxHQUFHLEVBQUUsd0JBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztnQ0FDckMsTUFBTSxFQUFFLENBQUMsYUFBYSxDQUFDO2dDQUN2QixHQUFHLEVBQUUsSUFBSTtnQ0FDVCxRQUFRLEVBQUUsVUFBVTtnQ0FDcEIsUUFBUSxFQUFFLHlCQUFRLENBQUMsTUFBTTtnQ0FDekIsT0FBTyxFQUFFLEVBQUU7NkJBQ1gsRUFBRTtnQ0FDRixNQUFNLEVBQUUsQ0FBQztnQ0FDVCxHQUFHLEVBQUUsd0JBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztnQ0FDckMsTUFBTSxFQUFFLENBQUMsb0JBQW9CLEVBQUUsb0JBQW9CLENBQUM7Z0NBQ3BELEdBQUcsRUFBRSxJQUFJO2dDQUNULFFBQVEsRUFBRSxZQUFZO2dDQUN0QixRQUFRLEVBQUUseUJBQVEsQ0FBQyxJQUFJO2dDQUN2QixPQUFPLEVBQUUsRUFBRTs2QkFDWCxDQUFDO3FCQUNGLENBQUM7Z0JBQ0YsWUFBWSxFQUFFLENBQUM7d0JBQ2QsV0FBVyxFQUFFLFdBQVc7d0JBQ3hCLEVBQUUsRUFBRSxvQkFBb0I7d0JBQ3hCLFVBQVUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7d0JBQ2xDLGFBQWEsRUFBRSxFQUFFO3FCQUNqQixDQUFDO2FBQ0YsQ0FBQyxDQUFDLENBQUM7WUFDSixnQkFBZ0IsQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLCtDQUE2QixDQUFDLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTlILFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUUsQ0FBQztZQUVsRCxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO1FBR0gsSUFBSSxDQUFDLHNDQUFzQyxFQUFFLEtBQUs7WUFFakQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0RCxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakQsTUFBTSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNkLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzFELE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVsQyxNQUFNLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHlDQUF5QyxFQUFFLEtBQUs7WUFDcEQsTUFBTSxRQUFRLEdBQWEsRUFBRSxDQUFDO1lBQzlCLEtBQUssTUFBTSxJQUFJLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDbkQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7YUFDNUM7WUFFRCxNQUFNLGVBQWUsR0FBYSxFQUFFLENBQUM7WUFDckMsTUFBTSxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3RELGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQzFDLENBQUMsQ0FBQyxDQUFDO1lBRUgsZ0JBQWdCLENBQUMsOEJBQThCLENBQUMsSUFBSSwrQ0FBNkIsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pILEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUVkLE1BQU0sQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5QyxNQUFNLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNqRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx3REFBd0QsRUFBRSxLQUFLO1lBRW5FLE1BQU0sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUUvQyxXQUFXLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUN4RSxJQUFJO3dCQUNILE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQy9DLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUU3RCxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO3dCQUV2RCxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUEsbUJBQU8sRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ2hILE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ2hCLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFFBQVEsS0FBSyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUU1RCxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUEsbUJBQU8sRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ2pILE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ2hCLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFFBQVEsS0FBSyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUU3RCxPQUFPLEVBQUUsQ0FBQztxQkFFVjtvQkFBQyxPQUFPLEdBQUcsRUFBRTt3QkFDYixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ1o7Z0JBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVMLENBQUMsQ0FBQyxDQUFDO1lBRUgsd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLElBQUksK0NBQTZCLENBQUM7Z0JBQzNGLFNBQVMsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxDQUFDO2dCQUMzQyxTQUFTLEVBQUU7b0JBQ1Y7d0JBQ0MsSUFBSSxFQUFFLHdDQUF1QixDQUFDLFdBQVc7d0JBQ3pDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO3dDQUNqQixNQUFNLEVBQUUsQ0FBQzt3Q0FDVCxHQUFHLEVBQUUsd0JBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQzt3Q0FDckMsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLENBQUM7d0NBQzFDLEdBQUcsRUFBRSxJQUFJO3dDQUNULFFBQVEsRUFBRSxNQUFNO3dDQUNoQixRQUFRLEVBQUUseUJBQVEsQ0FBQyxJQUFJO3dDQUN2QixPQUFPLEVBQUUsRUFBRTtxQ0FDWCxFQUFFO3dDQUNGLE1BQU0sRUFBRSxDQUFDO3dDQUNULEdBQUcsRUFBRSx3QkFBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO3dDQUNyQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBQzt3Q0FDeEMsR0FBRyxFQUFFLElBQUk7d0NBQ1QsUUFBUSxFQUFFLE1BQU07d0NBQ2hCLFFBQVEsRUFBRSx5QkFBUSxDQUFDLElBQUk7d0NBQ3ZCLE9BQU8sRUFBRSxFQUFFO3FDQUNYLENBQUMsQ0FBQyxDQUFDO3FCQUNKO2lCQUNEO2FBQ0QsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRVgsTUFBTSxDQUFDLENBQUM7UUFFVCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxzREFBc0QsRUFBRSxLQUFLO1lBRWpFLE1BQU0sSUFBSSxHQUEwQixFQUFFLENBQUM7WUFDdkMsTUFBTSxPQUFPLEdBQXNCLEVBQUUsQ0FBQztZQUN0QyxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ25ELE1BQU0sR0FBRyxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM1RCxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNmLE1BQU0sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNwRixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNmLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ1osR0FBRyxFQUFFLElBQUk7b0JBQ1QsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO29CQUNwQixLQUFLLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7b0JBQ2hDLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVTtvQkFDMUIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHO29CQUNaLFNBQVMsRUFBRSxHQUFHLENBQUMsT0FBTztpQkFDdEIsQ0FBQyxDQUFDO2FBQ0g7WUFFRCw2REFBNkQ7WUFDN0QsMEJBQTBCLENBQUMsK0JBQStCLENBQUMsRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUV4RiwrREFBK0Q7WUFDL0QsMEJBQTBCLENBQUMsK0JBQStCLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUV2RyxxREFBcUQ7WUFDckQsS0FBSyxNQUFNLElBQUksSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUNuRCxNQUFNLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzNELE1BQU0sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3BGO1lBRUQsb0NBQW9DO1lBQ3BDLGdCQUFnQixDQUFDLDhCQUE4QixDQUFDLElBQUksK0NBQTZCLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6SCxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUNyRTtZQUNELEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUN2QixNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDdkM7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx5Q0FBeUMsRUFBRSxLQUFLO1lBRXBELE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEQsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRXZELHdCQUF3QixDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSwrQ0FBNkIsQ0FBQztnQkFDNUYsU0FBUyxFQUFFLENBQUM7Z0JBQ1osU0FBUyxFQUFFO29CQUNWO3dCQUNDLElBQUksRUFBRSx3Q0FBdUIsQ0FBQyxXQUFXO3dCQUN6QyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7cUJBQ3JCO2lCQUNEO2FBQ0QsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRVgsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsbUJBQW1CO1lBQ3RFLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUVsQixNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN4RCxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXBDLG9CQUFvQjtZQUNwQix3QkFBd0IsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksK0NBQTZCLENBQUM7Z0JBQzVGLFNBQVMsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxDQUFDO2dCQUMzQyxTQUFTLEVBQUUsQ0FBQzt3QkFDWCxJQUFJLEVBQUUsd0NBQXVCLENBQUMsV0FBVzt3QkFDekMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO3FCQUNyQixDQUFDO2FBQ0YsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRVgsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFcEMsd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLElBQUksK0NBQTZCLENBQUM7Z0JBQzNGLFNBQVMsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxDQUFDO2dCQUMzQyxTQUFTLEVBQUUsQ0FBQzt3QkFDWCxJQUFJLEVBQUUsd0NBQXVCLENBQUMsV0FBVzt3QkFDekMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7d0NBQ2pCLE1BQU0sRUFBRSxDQUFDO3dDQUNULEdBQUcsRUFBRSx3QkFBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO3dDQUNyQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLGNBQWMsQ0FBQzt3Q0FDMUMsR0FBRyxFQUFFLElBQUk7d0NBQ1QsUUFBUSxFQUFFLE1BQU07d0NBQ2hCLFFBQVEsRUFBRSx5QkFBUSxDQUFDLElBQUk7d0NBQ3ZCLE9BQU8sRUFBRSxFQUFFO3FDQUNYLEVBQUU7d0NBQ0YsTUFBTSxFQUFFLENBQUM7d0NBQ1QsR0FBRyxFQUFFLHdCQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7d0NBQ3JDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsYUFBYSxDQUFDO3dDQUN4QyxHQUFHLEVBQUUsSUFBSTt3Q0FDVCxRQUFRLEVBQUUsTUFBTTt3Q0FDaEIsUUFBUSxFQUFFLHlCQUFRLENBQUMsSUFBSTt3Q0FDdkIsT0FBTyxFQUFFLEVBQUU7cUNBQ1gsQ0FBQyxDQUFDLENBQUM7cUJBQ0osQ0FBQzthQUNGLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVYLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHdEQUF3RCxFQUFFLEtBQUs7WUFFbkUsTUFBTSxDQUFDLEdBQUcsYUFBSyxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBRWhGLDBFQUEwRTtZQUMxRSw4REFBOEQ7WUFFOUQsd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLCtDQUE2QixDQUFDO2dCQUM1RixTQUFTLEVBQUUsR0FBRztnQkFDZCxTQUFTLEVBQUUsQ0FBQzt3QkFDWCxJQUFJLEVBQUUsd0NBQXVCLENBQUMsV0FBVzt3QkFDekMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7d0NBQ2pCLE1BQU0sRUFBRSxDQUFDO3dDQUNULEdBQUcsRUFBRSx3QkFBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO3dDQUNyQyxNQUFNLEVBQUUsQ0FBQyxhQUFhLENBQUM7d0NBQ3ZCLEdBQUcsRUFBRSxJQUFJO3dDQUNULFFBQVEsRUFBRSxVQUFVO3dDQUNwQixRQUFRLEVBQUUseUJBQVEsQ0FBQyxNQUFNO3dDQUN6QixPQUFPLEVBQUUsRUFBRTtxQ0FDWCxFQUFFO3dDQUNGLE1BQU0sRUFBRSxDQUFDO3dDQUNULEdBQUcsRUFBRSx3QkFBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO3dDQUNyQyxNQUFNLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQzt3Q0FDcEQsR0FBRyxFQUFFLElBQUk7d0NBQ1QsUUFBUSxFQUFFLFlBQVk7d0NBQ3RCLFFBQVEsRUFBRSx5QkFBUSxDQUFDLElBQUk7d0NBQ3ZCLE9BQU8sRUFBRSxFQUFFO3FDQUNYLENBQUMsQ0FBQyxDQUFDO3FCQUNKLENBQUM7YUFDRixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFWCxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXRELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBRXRCLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9GLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwRixNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ25GLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwRixDQUFDLENBQUMsQ0FBQztRQUdILElBQUksQ0FBQyxzR0FBc0csRUFBRTtZQUM1RyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxXQUFXLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLCtCQUErQixDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXBGLGdCQUFnQixDQUFDLDhCQUE4QixDQUFDLElBQUksK0NBQTZCLENBQUM7Z0JBQ2pGLFlBQVksRUFBRSxDQUFDO3dCQUNkLFdBQVcsRUFBRSxXQUFXO3dCQUN4QixFQUFFLEVBQUUsb0JBQW9CO3dCQUN4QixVQUFVLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO3dCQUNsQyxhQUFhLEVBQUUsRUFBRTtxQkFDakIsQ0FBQzthQUNGLENBQUMsQ0FBQyxDQUFDO1lBRUosZ0JBQWdCLENBQUMsOEJBQThCLENBQUMsSUFBSSwrQ0FBNkIsQ0FBQztnQkFDakYsZUFBZSxFQUFFLG9CQUFvQjthQUNyQyxDQUFDLENBQUMsQ0FBQztZQUVKLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDhCQUE4QixFQUFFO1lBRXBDLE1BQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDO1lBQ3JELE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDO1lBRWhDLGdCQUFnQixDQUFDLDhCQUE4QixDQUFDLElBQUksK0NBQTZCLENBQUMsRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25ILE1BQU0sQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLEtBQUssTUFBTSxDQUFDLENBQUM7WUFFNUQsZ0JBQWdCLENBQUMsOEJBQThCLENBQUMsSUFBSSwrQ0FBNkIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLE1BQU0sQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLEtBQUssTUFBTSxDQUFDLENBQUM7WUFFNUQsZ0JBQWdCLENBQUMsOEJBQThCLENBQUMsSUFBSSwrQ0FBNkIsQ0FBQyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsS0FBSyxTQUFTLENBQUMsQ0FBQztRQUNoRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxrREFBa0QsRUFBRSxLQUFLO1lBRTdELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTdDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFMUQsTUFBTSxPQUFPLEdBQUcsYUFBSyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sS0FBSyxHQUFHLGFBQUssQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUVqRSx3QkFBd0IsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksK0NBQTZCLENBQUM7Z0JBQzVGLFNBQVMsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUM7d0JBQzFCLElBQUksRUFBRSx3Q0FBdUIsQ0FBQyxrQkFBa0I7d0JBQ2hELEtBQUssRUFBRSxDQUFDO3dCQUNSLFFBQVEsRUFBRSxTQUFTO3FCQUNuQixDQUFDO2FBQ0YsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRVgsTUFBTSxVQUFVLEdBQUcsTUFBTSxPQUFPLENBQUM7WUFDakMsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUM7WUFFN0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsS0FBSyxRQUFRLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx5Q0FBeUMsRUFBRSxLQUFLO1lBRXBELE1BQU0sQ0FBQyxHQUFHLGFBQUssQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUVoRix3QkFBd0IsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksK0NBQTZCLENBQUM7Z0JBQzVGLFNBQVMsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUM7d0JBQzFCLElBQUksRUFBRSx3Q0FBdUIsQ0FBQyxrQkFBa0I7d0JBQ2hELEtBQUssRUFBRSxDQUFDO3dCQUNSLFFBQVEsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7cUJBQ3BCLEVBQUU7d0JBQ0YsSUFBSSxFQUFFLHdDQUF1QixDQUFDLGtCQUFrQjt3QkFDaEQsS0FBSyxFQUFFLENBQUM7d0JBQ1IsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRTtxQkFDcEIsRUFBRTt3QkFDRixJQUFJLEVBQUUsd0NBQXVCLENBQUMsTUFBTTt3QkFDcEMsS0FBSyxFQUFFLENBQUM7d0JBQ1IsT0FBTyxFQUFFOzRCQUNSO2dDQUNDLEtBQUssRUFBRSxDQUFDO3dDQUNQLFVBQVUsRUFBRSxpQkFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0NBQzdDLElBQUksRUFBRSxZQUFZO3FDQUNsQixDQUFDO2dDQUNGLFFBQVEsRUFBRSxHQUFHOzZCQUNiO3lCQUNEO3FCQUNELENBQUM7YUFDRixDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBR3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBRXRCLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVoRCxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7WUFDMUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDMUQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVsRCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5RCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsOENBQThDLEVBQUUsS0FBSztZQUV6RCxNQUFNLENBQUMsR0FBRyxhQUFLLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFFaEYsd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLCtDQUE2QixDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVuSixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQztZQUV0QixNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsRSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMseUNBQXlDLEVBQUUsS0FBSztZQUVwRCxNQUFNLENBQUMsR0FBRyxhQUFLLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFFaEYsd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLCtDQUE2QixDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVuSixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQztZQUV0QixNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDOUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxzREFBc0QsRUFBRSxLQUFLO1lBRWpFLE1BQU0sQ0FBQyxHQUFHLGFBQUssQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUVoRixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRTFELHdCQUF3QixDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSwrQ0FBNkIsQ0FBQztnQkFDNUYsU0FBUyxFQUFFLEVBQUU7Z0JBQ2IsU0FBUyxFQUFFLENBQUM7d0JBQ1gsSUFBSSxFQUFFLHdDQUF1QixDQUFDLGtCQUFrQjt3QkFDaEQsS0FBSyxFQUFFLENBQUM7d0JBQ1IsUUFBUSxFQUFFLFNBQVM7cUJBQ25CLENBQUM7YUFDRixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFWCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQztZQUV0QixNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsRSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFaEQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7WUFFdkMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixLQUFLLFNBQVMsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDLENBQUM7UUFDN0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsK0RBQStELEVBQUUsS0FBSztZQUUxRSxNQUFNLENBQUMsR0FBRyxhQUFLLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFFaEYsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFN0Msd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLCtDQUE2QixDQUFDO2dCQUM1RixTQUFTLEVBQUUsRUFBRTtnQkFDYixTQUFTLEVBQUUsQ0FBQzt3QkFDWCxJQUFJLEVBQUUsd0NBQXVCLENBQUMsaUJBQWlCO3dCQUMvQyxLQUFLLEVBQUUsQ0FBQztxQkFDUixDQUFDO2FBQ0YsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRVgsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFFdEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWhELE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO1lBRXZDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxVQUFVLGNBQWMsQ0FBQyxTQUFpQixFQUFFLFFBQWdCLEVBQUUsV0FBb0M7WUFDdEcsTUFBTSxXQUFXLEdBQUcsYUFBSyxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQzFGLHdCQUF3QixDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSwrQ0FBNkIsQ0FBK0I7Z0JBQzFILFNBQVMsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxDQUFDO2dCQUMzQyxTQUFTLEVBQUUsQ0FBQzt3QkFDWCxJQUFJLEVBQUUsd0NBQXVCLENBQUMsTUFBTTt3QkFDcEMsS0FBSyxFQUFFLFNBQVM7d0JBQ2hCLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQztxQkFDM0MsQ0FBQzthQUNGLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNYLE1BQU0sV0FBVyxDQUFDO1FBQ25CLENBQUM7UUFDRCxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsU0FBaUIsRUFBRSxRQUFnQixFQUFFLFdBQW9DO1lBQ3hHLE1BQU0sV0FBVyxHQUFHLGFBQUssQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUMxRix3QkFBd0IsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksK0NBQTZCLENBQStCO2dCQUMxSCxTQUFTLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsQ0FBQztnQkFDM0MsU0FBUyxFQUFFLENBQUM7d0JBQ1gsSUFBSSxFQUFFLHdDQUF1QixDQUFDLFVBQVU7d0JBQ3hDLEtBQUssRUFBRSxTQUFTO3dCQUNoQixNQUFNLEVBQUUsSUFBSTt3QkFDWixRQUFRO3dCQUNSLFdBQVc7cUJBQ1gsQ0FBQzthQUNGLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNYLE1BQU0sV0FBVyxDQUFDO1FBQ25CLENBQUM7UUFDRCxJQUFJLENBQUMseUNBQXlDLEVBQUUsS0FBSztZQUNwRCxNQUFNLGNBQWMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvRixNQUFNLGdCQUFnQixDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGlCQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pHLE1BQU0sZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsaUJBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFHakcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztZQUMxRixNQUFNLENBQUMsV0FBVyxDQUFDLGlCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDN0csTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztZQUMxRixNQUFNLENBQUMsV0FBVyxDQUFDLGlCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDN0csTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztZQUMxRixNQUFNLENBQUMsV0FBVyxDQUFDLGlCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUcsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsMkVBQTJFLEVBQUUsS0FBSztZQUN0RixNQUFNLGNBQWMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FB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