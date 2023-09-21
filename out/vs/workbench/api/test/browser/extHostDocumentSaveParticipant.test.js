define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/common/extHostDocuments", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostDocumentSaveParticipant", "vs/workbench/api/test/common/testRPCProtocol", "vs/base/test/common/mock", "vs/platform/log/common/log", "vs/base/common/async", "vs/workbench/services/extensions/common/extensions"], function (require, exports, assert, uri_1, extHostDocuments_1, extHostDocumentsAndEditors_1, extHostTypes_1, extHostDocumentSaveParticipant_1, testRPCProtocol_1, mock_1, log_1, async_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostDocumentSaveParticipant', () => {
        const resource = uri_1.URI.parse('foo:bar');
        const mainThreadBulkEdits = new class extends (0, mock_1.mock)() {
        };
        let documents;
        const nullLogService = new log_1.NullLogService();
        setup(() => {
            const documentsAndEditors = new extHostDocumentsAndEditors_1.ExtHostDocumentsAndEditors((0, testRPCProtocol_1.SingleProxyRPCProtocol)(null), new log_1.NullLogService());
            documentsAndEditors.$acceptDocumentsAndEditorsDelta({
                addedDocuments: [{
                        isDirty: false,
                        languageId: 'foo',
                        uri: resource,
                        versionId: 1,
                        lines: ['foo'],
                        EOL: '\n',
                    }]
            });
            documents = new extHostDocuments_1.ExtHostDocuments((0, testRPCProtocol_1.SingleProxyRPCProtocol)(null), documentsAndEditors);
        });
        test('no listeners, no problem', () => {
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadBulkEdits);
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => assert.ok(true));
        });
        test('event delivery', () => {
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadBulkEdits);
            let event;
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (e) {
                event = e;
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                sub.dispose();
                assert.ok(event);
                assert.strictEqual(event.reason, extHostTypes_1.TextDocumentSaveReason.Manual);
                assert.strictEqual(typeof event.waitUntil, 'function');
            });
        });
        test('event delivery, immutable', () => {
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadBulkEdits);
            let event;
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (e) {
                event = e;
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                sub.dispose();
                assert.ok(event);
                assert.throws(() => { event.document = null; });
            });
        });
        test('event delivery, bad listener', () => {
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadBulkEdits);
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (e) {
                throw new Error('💀');
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(values => {
                sub.dispose();
                const [first] = values;
                assert.strictEqual(first, false);
            });
        });
        test('event delivery, bad listener doesn\'t prevent more events', () => {
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadBulkEdits);
            const sub1 = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (e) {
                throw new Error('💀');
            });
            let event;
            const sub2 = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (e) {
                event = e;
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                sub1.dispose();
                sub2.dispose();
                assert.ok(event);
            });
        });
        test('event delivery, in subscriber order', () => {
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadBulkEdits);
            let counter = 0;
            const sub1 = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (event) {
                assert.strictEqual(counter++, 0);
            });
            const sub2 = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (event) {
                assert.strictEqual(counter++, 1);
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                sub1.dispose();
                sub2.dispose();
            });
        });
        test('event delivery, ignore bad listeners', async () => {
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadBulkEdits, { timeout: 5, errors: 1 });
            let callCount = 0;
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (event) {
                callCount += 1;
                throw new Error('boom');
            });
            await participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */);
            await participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */);
            await participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */);
            await participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */);
            sub.dispose();
            assert.strictEqual(callCount, 2);
        });
        test('event delivery, overall timeout', async function () {
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadBulkEdits, { timeout: 20, errors: 5 });
            // let callCount = 0;
            const calls = [];
            const sub1 = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (event) {
                calls.push(1);
            });
            const sub2 = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (event) {
                calls.push(2);
                event.waitUntil((0, async_1.timeout)(100));
            });
            const sub3 = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (event) {
                calls.push(3);
            });
            const values = await participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */);
            sub1.dispose();
            sub2.dispose();
            sub3.dispose();
            assert.deepStrictEqual(calls, [1, 2]);
            assert.strictEqual(values.length, 2);
        });
        test('event delivery, waitUntil', () => {
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadBulkEdits);
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (event) {
                event.waitUntil((0, async_1.timeout)(10));
                event.waitUntil((0, async_1.timeout)(10));
                event.waitUntil((0, async_1.timeout)(10));
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                sub.dispose();
            });
        });
        test('event delivery, waitUntil must be called sync', () => {
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadBulkEdits);
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (event) {
                event.waitUntil(new Promise((resolve, reject) => {
                    setTimeout(() => {
                        try {
                            assert.throws(() => event.waitUntil((0, async_1.timeout)(10)));
                            resolve(undefined);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }, 10);
                }));
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                sub.dispose();
            });
        });
        test('event delivery, waitUntil will timeout', function () {
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadBulkEdits, { timeout: 5, errors: 3 });
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (event) {
                event.waitUntil((0, async_1.timeout)(100));
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(values => {
                sub.dispose();
                const [first] = values;
                assert.strictEqual(first, false);
            });
        });
        test('event delivery, waitUntil failure handling', () => {
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadBulkEdits);
            const sub1 = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (e) {
                e.waitUntil(Promise.reject(new Error('dddd')));
            });
            let event;
            const sub2 = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (e) {
                event = e;
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                assert.ok(event);
                sub1.dispose();
                sub2.dispose();
            });
        });
        test('event delivery, pushEdits sync', () => {
            let dto;
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, new class extends (0, mock_1.mock)() {
                $tryApplyWorkspaceEdit(_edits) {
                    dto = _edits;
                    return Promise.resolve(true);
                }
            });
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (e) {
                e.waitUntil(Promise.resolve([extHostTypes_1.TextEdit.insert(new extHostTypes_1.Position(0, 0), 'bar')]));
                e.waitUntil(Promise.resolve([extHostTypes_1.TextEdit.setEndOfLine(extHostTypes_1.EndOfLine.CRLF)]));
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                sub.dispose();
                assert.strictEqual(dto.edits.length, 2);
                assert.ok(dto.edits[0].textEdit);
                assert.ok(dto.edits[1].textEdit);
            });
        });
        test('event delivery, concurrent change', () => {
            let edits;
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, new class extends (0, mock_1.mock)() {
                $tryApplyWorkspaceEdit(_edits) {
                    edits = _edits;
                    return Promise.resolve(true);
                }
            });
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (e) {
                // concurrent change from somewhere
                documents.$acceptModelChanged(resource, {
                    changes: [{
                            range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 },
                            rangeOffset: undefined,
                            rangeLength: undefined,
                            text: 'bar'
                        }],
                    eol: undefined,
                    versionId: 2,
                    isRedoing: false,
                    isUndoing: false,
                }, true);
                e.waitUntil(Promise.resolve([extHostTypes_1.TextEdit.insert(new extHostTypes_1.Position(0, 0), 'bar')]));
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(values => {
                sub.dispose();
                assert.strictEqual(edits, undefined);
                assert.strictEqual(values[0], false);
            });
        });
        test('event delivery, two listeners -> two document states', () => {
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, new class extends (0, mock_1.mock)() {
                $tryApplyWorkspaceEdit(dto) {
                    for (const edit of dto.edits) {
                        const uri = uri_1.URI.revive(edit.resource);
                        const { text, range } = edit.textEdit;
                        documents.$acceptModelChanged(uri, {
                            changes: [{
                                    range,
                                    text,
                                    rangeOffset: undefined,
                                    rangeLength: undefined,
                                }],
                            eol: undefined,
                            versionId: documents.getDocumentData(uri).version + 1,
                            isRedoing: false,
                            isUndoing: false,
                        }, true);
                        // }
                    }
                    return Promise.resolve(true);
                }
            });
            const document = documents.getDocument(resource);
            const sub1 = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (e) {
                // the document state we started with
                assert.strictEqual(document.version, 1);
                assert.strictEqual(document.getText(), 'foo');
                e.waitUntil(Promise.resolve([extHostTypes_1.TextEdit.insert(new extHostTypes_1.Position(0, 0), 'bar')]));
            });
            const sub2 = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (e) {
                // the document state AFTER the first listener kicked in
                assert.strictEqual(document.version, 2);
                assert.strictEqual(document.getText(), 'barfoo');
                e.waitUntil(Promise.resolve([extHostTypes_1.TextEdit.insert(new extHostTypes_1.Position(0, 0), 'bar')]));
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(values => {
                sub1.dispose();
                sub2.dispose();
                // the document state AFTER eventing is done
                assert.strictEqual(document.version, 3);
                assert.strictEqual(document.getText(), 'barbarfoo');
            });
        });
        test('Log failing listener', function () {
            let didLogSomething = false;
            const participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(new class extends log_1.NullLogService {
                error(message, ...args) {
                    didLogSomething = true;
                }
            }, documents, mainThreadBulkEdits);
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.nullExtensionDescription)(function (e) {
                throw new Error('boom');
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                sub.dispose();
                assert.strictEqual(didLogSomething, true);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERvY3VtZW50U2F2ZVBhcnRpY2lwYW50LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9leHRIb3N0RG9jdW1lbnRTYXZlUGFydGljaXBhbnQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFtQkEsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtRQUU1QyxNQUFNLFFBQVEsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQTRCO1NBQUksQ0FBQztRQUNuRixJQUFJLFNBQTJCLENBQUM7UUFDaEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxvQkFBYyxFQUFFLENBQUM7UUFFNUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSx1REFBMEIsQ0FBQyxJQUFBLHdDQUFzQixFQUFDLElBQUksQ0FBQyxFQUFFLElBQUksb0JBQWMsRUFBRSxDQUFDLENBQUM7WUFDL0csbUJBQW1CLENBQUMsK0JBQStCLENBQUM7Z0JBQ25ELGNBQWMsRUFBRSxDQUFDO3dCQUNoQixPQUFPLEVBQUUsS0FBSzt3QkFDZCxVQUFVLEVBQUUsS0FBSzt3QkFDakIsR0FBRyxFQUFFLFFBQVE7d0JBQ2IsU0FBUyxFQUFFLENBQUM7d0JBQ1osS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO3dCQUNkLEdBQUcsRUFBRSxJQUFJO3FCQUNULENBQUM7YUFDRixDQUFDLENBQUM7WUFDSCxTQUFTLEdBQUcsSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFBLHdDQUFzQixFQUFDLElBQUksQ0FBQyxFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFDckYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsMEJBQTBC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