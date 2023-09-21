define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/common/extHostDocuments", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostDocumentSaveParticipant", "vs/workbench/api/test/common/testRPCProtocol", "vs/base/test/common/mock", "vs/platform/log/common/log", "vs/base/common/async", "vs/workbench/services/extensions/common/extensions"], function (require, exports, assert, uri_1, extHostDocuments_1, extHostDocumentsAndEditors_1, extHostTypes_1, extHostDocumentSaveParticipant_1, testRPCProtocol_1, mock_1, log_1, async_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostDocumentSaveParticipant', () => {
        const resource = uri_1.URI.parse('foo:bar');
        const mainThreadBulkEdits = new class extends (0, mock_1.$rT)() {
        };
        let documents;
        const nullLogService = new log_1.$fj();
        setup(() => {
            const documentsAndEditors = new extHostDocumentsAndEditors_1.$_L((0, testRPCProtocol_1.$2dc)(null), new log_1.$fj());
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
            documents = new extHostDocuments_1.$7ac((0, testRPCProtocol_1.$2dc)(null), documentsAndEditors);
        });
        test('no listeners, no problem', () => {
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, mainThreadBulkEdits);
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => assert.ok(true));
        });
        test('event delivery', () => {
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, mainThreadBulkEdits);
            let event;
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (e) {
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
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, mainThreadBulkEdits);
            let event;
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (e) {
                event = e;
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                sub.dispose();
                assert.ok(event);
                assert.throws(() => { event.document = null; });
            });
        });
        test('event delivery, bad listener', () => {
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, mainThreadBulkEdits);
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (e) {
                throw new Error('💀');
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(values => {
                sub.dispose();
                const [first] = values;
                assert.strictEqual(first, false);
            });
        });
        test('event delivery, bad listener doesn\'t prevent more events', () => {
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, mainThreadBulkEdits);
            const sub1 = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (e) {
                throw new Error('💀');
            });
            let event;
            const sub2 = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (e) {
                event = e;
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                sub1.dispose();
                sub2.dispose();
                assert.ok(event);
            });
        });
        test('event delivery, in subscriber order', () => {
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, mainThreadBulkEdits);
            let counter = 0;
            const sub1 = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (event) {
                assert.strictEqual(counter++, 0);
            });
            const sub2 = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (event) {
                assert.strictEqual(counter++, 1);
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                sub1.dispose();
                sub2.dispose();
            });
        });
        test('event delivery, ignore bad listeners', async () => {
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, mainThreadBulkEdits, { timeout: 5, errors: 1 });
            let callCount = 0;
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (event) {
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
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, mainThreadBulkEdits, { timeout: 20, errors: 5 });
            // let callCount = 0;
            const calls = [];
            const sub1 = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (event) {
                calls.push(1);
            });
            const sub2 = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (event) {
                calls.push(2);
                event.waitUntil((0, async_1.$Hg)(100));
            });
            const sub3 = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (event) {
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
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, mainThreadBulkEdits);
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (event) {
                event.waitUntil((0, async_1.$Hg)(10));
                event.waitUntil((0, async_1.$Hg)(10));
                event.waitUntil((0, async_1.$Hg)(10));
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                sub.dispose();
            });
        });
        test('event delivery, waitUntil must be called sync', () => {
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, mainThreadBulkEdits);
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (event) {
                event.waitUntil(new Promise((resolve, reject) => {
                    setTimeout(() => {
                        try {
                            assert.throws(() => event.waitUntil((0, async_1.$Hg)(10)));
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
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, mainThreadBulkEdits, { timeout: 5, errors: 3 });
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (event) {
                event.waitUntil((0, async_1.$Hg)(100));
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(values => {
                sub.dispose();
                const [first] = values;
                assert.strictEqual(first, false);
            });
        });
        test('event delivery, waitUntil failure handling', () => {
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, mainThreadBulkEdits);
            const sub1 = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (e) {
                e.waitUntil(Promise.reject(new Error('dddd')));
            });
            let event;
            const sub2 = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (e) {
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
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, new class extends (0, mock_1.$rT)() {
                $tryApplyWorkspaceEdit(_edits) {
                    dto = _edits;
                    return Promise.resolve(true);
                }
            });
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (e) {
                e.waitUntil(Promise.resolve([extHostTypes_1.$0J.insert(new extHostTypes_1.$4J(0, 0), 'bar')]));
                e.waitUntil(Promise.resolve([extHostTypes_1.$0J.setEndOfLine(extHostTypes_1.EndOfLine.CRLF)]));
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
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, new class extends (0, mock_1.$rT)() {
                $tryApplyWorkspaceEdit(_edits) {
                    edits = _edits;
                    return Promise.resolve(true);
                }
            });
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (e) {
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
                e.waitUntil(Promise.resolve([extHostTypes_1.$0J.insert(new extHostTypes_1.$4J(0, 0), 'bar')]));
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(values => {
                sub.dispose();
                assert.strictEqual(edits, undefined);
                assert.strictEqual(values[0], false);
            });
        });
        test('event delivery, two listeners -> two document states', () => {
            const participant = new extHostDocumentSaveParticipant_1.$pbc(nullLogService, documents, new class extends (0, mock_1.$rT)() {
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
            const sub1 = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (e) {
                // the document state we started with
                assert.strictEqual(document.version, 1);
                assert.strictEqual(document.getText(), 'foo');
                e.waitUntil(Promise.resolve([extHostTypes_1.$0J.insert(new extHostTypes_1.$4J(0, 0), 'bar')]));
            });
            const sub2 = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (e) {
                // the document state AFTER the first listener kicked in
                assert.strictEqual(document.version, 2);
                assert.strictEqual(document.getText(), 'barfoo');
                e.waitUntil(Promise.resolve([extHostTypes_1.$0J.insert(new extHostTypes_1.$4J(0, 0), 'bar')]));
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
            const participant = new extHostDocumentSaveParticipant_1.$pbc(new class extends log_1.$fj {
                error(message, ...args) {
                    didLogSomething = true;
                }
            }, documents, mainThreadBulkEdits);
            const sub = participant.getOnWillSaveTextDocumentEvent(extensions_1.$KF)(function (e) {
                throw new Error('boom');
            });
            return participant.$participateInSave(resource, 1 /* SaveReason.EXPLICIT */).then(() => {
                sub.dispose();
                assert.strictEqual(didLogSomething, true);
            });
        });
    });
});
//# sourceMappingURL=extHostDocumentSaveParticipant.test.js.map