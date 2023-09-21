/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/browser/mainThreadDocumentContentProviders", "vs/editor/test/common/testTextModel", "vs/base/test/common/mock", "vs/workbench/api/test/common/testRPCProtocol", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, mainThreadDocumentContentProviders_1, testTextModel_1, mock_1, testRPCProtocol_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadDocumentContentProviders', function () {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('events are processed properly', function () {
            const uri = uri_1.URI.parse('test:uri');
            const model = (0, testTextModel_1.createTextModel)('1', undefined, undefined, uri);
            const providers = new mainThreadDocumentContentProviders_1.MainThreadDocumentContentProviders(new testRPCProtocol_1.TestRPCProtocol(), null, null, new class extends (0, mock_1.mock)() {
                getModel(_uri) {
                    assert.strictEqual(uri.toString(), _uri.toString());
                    return model;
                }
            }, new class extends (0, mock_1.mock)() {
                computeMoreMinimalEdits(_uri, data) {
                    assert.strictEqual(model.getValue(), '1');
                    return Promise.resolve(data);
                }
            });
            store.add(model);
            store.add(providers);
            return new Promise((resolve, reject) => {
                let expectedEvents = 1;
                store.add(model.onDidChangeContent(e => {
                    expectedEvents -= 1;
                    try {
                        assert.ok(expectedEvents >= 0);
                    }
                    catch (err) {
                        reject(err);
                    }
                    if (model.getValue() === '1\n2\n3') {
                        model.dispose();
                        resolve();
                    }
                }));
                providers.$onVirtualDocumentChange(uri, '1\n2');
                providers.$onVirtualDocumentChange(uri, '1\n2\n3');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZERvY3VtZW50Q29udGVudFByb3ZpZGVycy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS90ZXN0L2Jyb3dzZXIvbWFpblRocmVhZERvY3VtZW50Q29udGVudFByb3ZpZGVycy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBYWhHLEtBQUssQ0FBQyxvQ0FBb0MsRUFBRTtRQUUzQyxNQUFNLEtBQUssR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFeEQsSUFBSSxDQUFDLCtCQUErQixFQUFFO1lBRXJDLE1BQU0sR0FBRyxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEMsTUFBTSxLQUFLLEdBQUcsSUFBQSwrQkFBZSxFQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRTlELE1BQU0sU0FBUyxHQUFHLElBQUksdUVBQWtDLENBQUMsSUFBSSxpQ0FBZSxFQUFFLEVBQUUsSUFBSyxFQUFFLElBQUssRUFDM0YsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQWlCO2dCQUM3QixRQUFRLENBQUMsSUFBUztvQkFDMUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7b0JBQ3BELE9BQU8sS0FBSyxDQUFDO2dCQUNkLENBQUM7YUFDRCxFQUNELElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUF3QjtnQkFDcEMsdUJBQXVCLENBQUMsSUFBUyxFQUFFLElBQTRCO29CQUN2RSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDMUMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QixDQUFDO2FBQ0QsQ0FDRCxDQUFDO1lBRUYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQixLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXJCLE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQzVDLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztnQkFDdkIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3RDLGNBQWMsSUFBSSxDQUFDLENBQUM7b0JBQ3BCLElBQUk7d0JBQ0gsTUFBTSxDQUFDLEVBQUUsQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFDLENBQUM7cUJBQy9CO29CQUFDLE9BQU8sR0FBRyxFQUFFO3dCQUNiLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDWjtvQkFDRCxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxTQUFTLEVBQUU7d0JBQ25DLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDaEIsT0FBTyxFQUFFLENBQUM7cUJBQ1Y7Z0JBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDSixTQUFTLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNoRCxTQUFTLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3BELENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9