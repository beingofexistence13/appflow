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
        const disposables = new lifecycle_1.$jc();
        teardown(function () {
            disposables.clear();
        });
        (0, utils_1.$bT)();
        setup(async function () {
            rpcProtocol = new testRPCProtocol_1.$3dc();
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadCommands, new class extends (0, mock_1.$rT)() {
                $registerCommand() { }
            });
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadNotebook, new class extends (0, mock_1.$rT)() {
                async $registerNotebookSerializer() { }
                async $unregisterNotebookSerializer() { }
            });
            extHostDocumentsAndEditors = new extHostDocumentsAndEditors_1.$_L(rpcProtocol, new log_1.$fj());
            extHostDocuments = new extHostDocuments_1.$7ac(rpcProtocol, extHostDocumentsAndEditors);
            extHostConsumerFileSystem = new extHostFileSystemConsumer_1.$Abc(rpcProtocol, new extHostFileSystemInfo_1.$8ac());
            extHostNotebooks = new extHostNotebook_1.$Fcc(rpcProtocol, new extHostCommands_1.$kM(rpcProtocol, new log_1.$fj(), new class extends (0, mock_1.$rT)() {
                onExtensionError() {
                    return true;
                }
            }), extHostDocumentsAndEditors, extHostDocuments, extHostConsumerFileSystem);
            extHostNotebookDocuments = new extHostNotebookDocuments_1.$Xcc(extHostNotebooks);
            const reg = extHostNotebooks.registerNotebookSerializer(extensions_1.$KF, 'test', new class extends (0, mock_1.$rT)() {
            });
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.$dA({
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
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.$dA({ newActiveEditor: '_notebook_editor_0' }));
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
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.$dA({ removedDocuments: [notebook.uri] }));
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
                        const doc1 = extHostDocuments.getAllDocumentData().find(data => (0, resources_1.$bg)(data.document.uri, first.document.uri));
                        assert.ok(doc1);
                        assert.strictEqual(doc1?.document === first.document, true);
                        const doc2 = extHostDocuments.getAllDocumentData().find(data => (0, resources_1.$bg)(data.document.uri, second.document.uri));
                        assert.ok(doc2);
                        assert.strictEqual(doc2?.document === second.document, true);
                        resolve();
                    }
                    catch (err) {
                        reject(err);
                    }
                }));
            });
            extHostNotebookDocuments.$acceptModelChanged(notebookUri, new proxyIdentifier_1.$dA({
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
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.$dA({ removedDocuments: [notebook.uri] }));
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
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.$dA({
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
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.$dA({
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 1, []]]
                    }]
            }), false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1);
            assert.strictEqual(second.index, 0);
            extHostNotebookDocuments.$acceptModelChanged(notebookUri, new proxyIdentifier_1.$dA({
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
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.$dA({
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
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.$dA({
                addedEditors: [{
                        documentUri: notebookUri,
                        id: '_notebook_editor_2',
                        selections: [{ start: 0, end: 1 }],
                        visibleRanges: []
                    }]
            }));
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.$dA({
                newActiveEditor: '_notebook_editor_2'
            }));
            assert.strictEqual(count, 1);
        });
        test('unset active notebook editor', function () {
            const editor = extHostNotebooks.activeNotebookEditor;
            assert.ok(editor !== undefined);
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.$dA({ newActiveEditor: undefined }));
            assert.ok(extHostNotebooks.activeNotebookEditor === editor);
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.$dA({}));
            assert.ok(extHostNotebooks.activeNotebookEditor === editor);
            extHostNotebooks.$acceptDocumentAndEditorsDelta(new proxyIdentifier_1.$dA({ newActiveEditor: null }));
            assert.ok(extHostNotebooks.activeNotebookEditor === undefined);
        });
        test('change cell language triggers onDidChange events', async function () {
            const first = notebook.apiNotebook.cellAt(0);
            assert.strictEqual(first.document.languageId, 'markdown');
            const removed = event_1.Event.toPromise(extHostDocuments.onDidRemoveDocument);
            const added = event_1.Event.toPromise(extHostDocuments.onDidAddDocument);
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.$dA({
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
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.$dA({
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
                                        valueBytes: buffer_1.$Fd.fromByteArray([0, 2, 3]),
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
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.$dA({ versionId: 12, rawEvents: [] }), false, { foo: 2 });
            const event = await p;
            assert.strictEqual(event.notebook === notebook.apiNotebook, true);
            assert.strictEqual(event.contentChanges.length, 0);
            assert.strictEqual(event.cellChanges.length, 0);
            assert.deepStrictEqual(event.metadata, { foo: 2 });
        });
        test('onDidChangeNotebook-event, froozen data', async function () {
            const p = event_1.Event.toPromise(extHostNotebookDocuments.onDidChangeNotebookDocument);
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.$dA({ versionId: 12, rawEvents: [] }), false, { foo: 2 });
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
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.$dA({
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
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.$dA({
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
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.$dA({
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
            extHostNotebookDocuments.$acceptModelChanged(notebook.uri, new proxyIdentifier_1.$dA({
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
            await replaceOutputs(1, '1', [{ mime: 'text/plain', valueBytes: buffer_1.$Fd.fromString('foo') }]);
            await appendOutputItem(1, '1', [{ mime: 'text/plain', valueBytes: buffer_1.$Fd.fromString('bar') }]);
            await appendOutputItem(1, '1', [{ mime: 'text/plain', valueBytes: buffer_1.$Fd.fromString('baz') }]);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items.length, 3);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[0].mime, 'text/plain');
            assert.strictEqual(buffer_1.$Fd.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(), 'foo');
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[1].mime, 'text/plain');
            assert.strictEqual(buffer_1.$Fd.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[1].data).toString(), 'bar');
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[2].mime, 'text/plain');
            assert.strictEqual(buffer_1.$Fd.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[2].data).toString(), 'baz');
        });
        test('Append multiple stdout stream output items to an output with another mime', async function () {
            await replaceOutputs(1, '1', [{ mime: 'text/plain', valueBytes: buffer_1.$Fd.fromString('foo') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.$Fd.fromString('bar') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.$Fd.fromString('baz') }]);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items.length, 3);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[0].mime, 'text/plain');
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[1].mime, 'application/vnd.code.notebook.stdout');
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[2].mime, 'application/vnd.code.notebook.stdout');
        });
        test('Compress multiple stdout stream output items', async function () {
            await replaceOutputs(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.$Fd.fromString('foo') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.$Fd.fromString('bar') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.$Fd.fromString('baz') }]);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[0].mime, 'application/vnd.code.notebook.stdout');
            assert.strictEqual(buffer_1.$Fd.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(), 'foobarbaz');
        });
        test('Compress multiple stdout stream output items (with support for terminal escape code -> \u001b[A)', async function () {
            await replaceOutputs(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.$Fd.fromString('\nfoo') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.$Fd.fromString(`${String.fromCharCode(27)}[Abar`) }]);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[0].mime, 'application/vnd.code.notebook.stdout');
            assert.strictEqual(buffer_1.$Fd.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(), 'bar');
        });
        test('Compress multiple stdout stream output items (with support for terminal escape code -> \r character)', async function () {
            await replaceOutputs(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.$Fd.fromString('foo') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stdout', valueBytes: buffer_1.$Fd.fromString(`\rbar`) }]);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[0].mime, 'application/vnd.code.notebook.stdout');
            assert.strictEqual(buffer_1.$Fd.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(), 'bar');
        });
        test('Compress multiple stderr stream output items', async function () {
            await replaceOutputs(1, '1', [{ mime: 'application/vnd.code.notebook.stderr', valueBytes: buffer_1.$Fd.fromString('foo') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stderr', valueBytes: buffer_1.$Fd.fromString('bar') }]);
            await appendOutputItem(1, '1', [{ mime: 'application/vnd.code.notebook.stderr', valueBytes: buffer_1.$Fd.fromString('baz') }]);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items.length, 1);
            assert.strictEqual(notebook.apiNotebook.cellAt(1).outputs[0].items[0].mime, 'application/vnd.code.notebook.stderr');
            assert.strictEqual(buffer_1.$Fd.wrap(notebook.apiNotebook.cellAt(1).outputs[0].items[0].data).toString(), 'foobarbaz');
        });
    });
});
//# sourceMappingURL=extHostNotebook.test.js.map