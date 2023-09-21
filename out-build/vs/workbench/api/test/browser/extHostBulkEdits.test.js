define(["require", "exports", "assert", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHost.protocol", "vs/base/common/uri", "vs/base/test/common/mock", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/test/common/testRPCProtocol", "vs/platform/log/common/log", "vs/workbench/api/common/extHostBulkEdits", "vs/workbench/services/extensions/common/extensions"], function (require, exports, assert, extHostTypes, extHost_protocol_1, uri_1, mock_1, extHostDocumentsAndEditors_1, testRPCProtocol_1, log_1, extHostBulkEdits_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostBulkEdits.applyWorkspaceEdit', () => {
        const resource = uri_1.URI.parse('foo:bar');
        let bulkEdits;
        let workspaceResourceEdits;
        setup(() => {
            workspaceResourceEdits = null;
            const rpcProtocol = new testRPCProtocol_1.$3dc();
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadBulkEdits, new class extends (0, mock_1.$rT)() {
                $tryApplyWorkspaceEdit(_workspaceResourceEdits) {
                    workspaceResourceEdits = _workspaceResourceEdits;
                    return Promise.resolve(true);
                }
            });
            const documentsAndEditors = new extHostDocumentsAndEditors_1.$_L((0, testRPCProtocol_1.$2dc)(null), new log_1.$fj());
            documentsAndEditors.$acceptDocumentsAndEditorsDelta({
                addedDocuments: [{
                        isDirty: false,
                        languageId: 'foo',
                        uri: resource,
                        versionId: 1337,
                        lines: ['foo'],
                        EOL: '\n',
                    }]
            });
            bulkEdits = new extHostBulkEdits_1.$Ncc(rpcProtocol, documentsAndEditors);
        });
        test('uses version id if document available', async () => {
            const edit = new extHostTypes.$aK();
            edit.replace(resource, new extHostTypes.$5J(0, 0, 0, 0), 'hello');
            await bulkEdits.applyWorkspaceEdit(edit, extensions_1.$KF, undefined);
            assert.strictEqual(workspaceResourceEdits.edits.length, 1);
            const [first] = workspaceResourceEdits.edits;
            assert.strictEqual(first.versionId, 1337);
        });
        test('does not use version id if document is not available', async () => {
            const edit = new extHostTypes.$aK();
            edit.replace(uri_1.URI.parse('foo:bar2'), new extHostTypes.$5J(0, 0, 0, 0), 'hello');
            await bulkEdits.applyWorkspaceEdit(edit, extensions_1.$KF, undefined);
            assert.strictEqual(workspaceResourceEdits.edits.length, 1);
            const [first] = workspaceResourceEdits.edits;
            assert.ok(typeof first.versionId === 'undefined');
        });
    });
});
//# sourceMappingURL=extHostBulkEdits.test.js.map