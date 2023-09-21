/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/test/common/testRPCProtocol", "vs/platform/log/common/log", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, extHostDocumentsAndEditors_1, testRPCProtocol_1, log_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostDocumentsAndEditors', () => {
        let editors;
        setup(function () {
            editors = new extHostDocumentsAndEditors_1.ExtHostDocumentsAndEditors(new testRPCProtocol_1.TestRPCProtocol(), new log_1.NullLogService());
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('The value of TextDocument.isClosed is incorrect when a text document is closed, #27949', () => {
            editors.$acceptDocumentsAndEditorsDelta({
                addedDocuments: [{
                        EOL: '\n',
                        isDirty: true,
                        languageId: 'fooLang',
                        uri: uri_1.URI.parse('foo:bar'),
                        versionId: 1,
                        lines: [
                            'first',
                            'second'
                        ]
                    }]
            });
            return new Promise((resolve, reject) => {
                const d = editors.onDidRemoveDocuments(e => {
                    try {
                        for (const data of e) {
                            assert.strictEqual(data.document.isClosed, true);
                        }
                        resolve(undefined);
                    }
                    catch (e) {
                        reject(e);
                    }
                    finally {
                        d.dispose();
                    }
                });
                editors.$acceptDocumentsAndEditorsDelta({
                    removedDocuments: [uri_1.URI.parse('foo:bar')]
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERvY3VtZW50c0FuZEVkaXRvcnMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvdGVzdC9icm93c2VyL2V4dEhvc3REb2N1bWVudHNBbmRFZGl0b3JzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFTaEcsS0FBSyxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtRQUV4QyxJQUFJLE9BQW1DLENBQUM7UUFFeEMsS0FBSyxDQUFDO1lBQ0wsT0FBTyxHQUFHLElBQUksdURBQTBCLENBQUMsSUFBSSxpQ0FBZSxFQUFFLEVBQUUsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQztRQUN2RixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsd0ZBQXdGLEVBQUUsR0FBRyxFQUFFO1lBRW5HLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQztnQkFDdkMsY0FBYyxFQUFFLENBQUM7d0JBQ2hCLEdBQUcsRUFBRSxJQUFJO3dCQUNULE9BQU8sRUFBRSxJQUFJO3dCQUNiLFVBQVUsRUFBRSxTQUFTO3dCQUNyQixHQUFHLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7d0JBQ3pCLFNBQVMsRUFBRSxDQUFDO3dCQUNaLEtBQUssRUFBRTs0QkFDTixPQUFPOzRCQUNQLFFBQVE7eUJBQ1I7cUJBQ0QsQ0FBQzthQUNGLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBRXRDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDMUMsSUFBSTt3QkFFSCxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRTs0QkFDckIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQzt5QkFDakQ7d0JBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO3FCQUNuQjtvQkFBQyxPQUFPLENBQUMsRUFBRTt3QkFDWCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ1Y7NEJBQVM7d0JBQ1QsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO3FCQUNaO2dCQUNGLENBQUMsQ0FBQyxDQUFDO2dCQUVILE9BQU8sQ0FBQywrQkFBK0IsQ0FBQztvQkFDdkMsZ0JBQWdCLEVBQUUsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUN4QyxDQUFDLENBQUM7WUFFSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUosQ0FBQyxDQUFDLENBQUMifQ==