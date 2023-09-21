define(["require", "exports", "assert", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHost.protocol", "vs/base/common/uri", "vs/base/test/common/mock", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/test/common/testRPCProtocol", "vs/platform/log/common/log", "vs/workbench/api/common/extHostBulkEdits", "vs/workbench/services/extensions/common/extensions"], function (require, exports, assert, extHostTypes, extHost_protocol_1, uri_1, mock_1, extHostDocumentsAndEditors_1, testRPCProtocol_1, log_1, extHostBulkEdits_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostBulkEdits.applyWorkspaceEdit', () => {
        const resource = uri_1.URI.parse('foo:bar');
        let bulkEdits;
        let workspaceResourceEdits;
        setup(() => {
            workspaceResourceEdits = null;
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadBulkEdits, new class extends (0, mock_1.mock)() {
                $tryApplyWorkspaceEdit(_workspaceResourceEdits) {
                    workspaceResourceEdits = _workspaceResourceEdits;
                    return Promise.resolve(true);
                }
            });
            const documentsAndEditors = new extHostDocumentsAndEditors_1.ExtHostDocumentsAndEditors((0, testRPCProtocol_1.SingleProxyRPCProtocol)(null), new log_1.NullLogService());
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
            bulkEdits = new extHostBulkEdits_1.ExtHostBulkEdits(rpcProtocol, documentsAndEditors);
        });
        test('uses version id if document available', async () => {
            const edit = new extHostTypes.WorkspaceEdit();
            edit.replace(resource, new extHostTypes.Range(0, 0, 0, 0), 'hello');
            await bulkEdits.applyWorkspaceEdit(edit, extensions_1.nullExtensionDescription, undefined);
            assert.strictEqual(workspaceResourceEdits.edits.length, 1);
            const [first] = workspaceResourceEdits.edits;
            assert.strictEqual(first.versionId, 1337);
        });
        test('does not use version id if document is not available', async () => {
            const edit = new extHostTypes.WorkspaceEdit();
            edit.replace(uri_1.URI.parse('foo:bar2'), new extHostTypes.Range(0, 0, 0, 0), 'hello');
            await bulkEdits.applyWorkspaceEdit(edit, extensions_1.nullExtensionDescription, undefined);
            assert.strictEqual(workspaceResourceEdits.edits.length, 1);
            const [first] = workspaceResourceEdits.edits;
            assert.ok(typeof first.versionId === 'undefined');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEJ1bGtFZGl0cy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS90ZXN0L2Jyb3dzZXIvZXh0SG9zdEJ1bGtFZGl0cy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7UUFFakQsTUFBTSxRQUFRLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0QyxJQUFJLFNBQTJCLENBQUM7UUFDaEMsSUFBSSxzQkFBeUMsQ0FBQztRQUU5QyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1Ysc0JBQXNCLEdBQUcsSUFBSyxDQUFDO1lBRS9CLE1BQU0sV0FBVyxHQUFHLElBQUksaUNBQWUsRUFBRSxDQUFDO1lBQzFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsOEJBQVcsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBNEI7Z0JBQ3pGLHNCQUFzQixDQUFDLHVCQUEwQztvQkFDekUsc0JBQXNCLEdBQUcsdUJBQXVCLENBQUM7b0JBQ2pELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUIsQ0FBQzthQUNELENBQUMsQ0FBQztZQUNILE1BQU0sbUJBQW1CLEdBQUcsSUFBSSx1REFBMEIsQ0FBQyxJQUFBLHdDQUFzQixFQUFDLElBQUksQ0FBQyxFQUFFLElBQUksb0JBQWMsRUFBRSxDQUFDLENBQUM7WUFDL0csbUJBQW1CLENBQUMsK0JBQStCLENBQUM7Z0JBQ25ELGNBQWMsRUFBRSxDQUFDO3dCQUNoQixPQUFPLEVBQUUsS0FBSzt3QkFDZCxVQUFVLEVBQUUsS0FBSzt3QkFDakIsR0FBRyxFQUFFLFFBQVE7d0JBQ2IsU0FBUyxFQUFFLElBQUk7d0JBQ2YsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO3dCQUNkLEdBQUcsRUFBRSxJQUFJO3FCQUNULENBQUM7YUFDRixDQUFDLENBQUM7WUFDSCxTQUFTLEdBQUcsSUFBSSxtQ0FBZ0IsQ0FBQyxXQUFXLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUNwRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx1Q0FBdUMsRUFBRSxLQUFLLElBQUksRUFBRTtZQUN4RCxNQUFNLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDcEUsTUFBTSxTQUFTLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLHFDQUF3QixFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsS0FBSyxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxXQUFXLENBQXlCLEtBQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsc0RBQXNELEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDdkUsTUFBTSxJQUFJLEdBQUcsSUFBSSxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNqRixNQUFNLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUscUNBQXdCLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDOUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUFDN0MsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUErQixLQUFNLENBQUMsU0FBUyxLQUFLLFdBQVcsQ0FBQyxDQUFDO1FBQzVFLENBQUMsQ0FBQyxDQUFDO0lBRUosQ0FBQyxDQUFDLENBQUMifQ==