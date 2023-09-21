/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/browser/mainThreadDocumentContentProviders", "vs/editor/test/common/testTextModel", "vs/base/test/common/mock", "vs/workbench/api/test/common/testRPCProtocol", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, mainThreadDocumentContentProviders_1, testTextModel_1, mock_1, testRPCProtocol_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadDocumentContentProviders', function () {
        const store = (0, utils_1.$bT)();
        test('events are processed properly', function () {
            const uri = uri_1.URI.parse('test:uri');
            const model = (0, testTextModel_1.$O0b)('1', undefined, undefined, uri);
            const providers = new mainThreadDocumentContentProviders_1.$Kcb(new testRPCProtocol_1.$3dc(), null, null, new class extends (0, mock_1.$rT)() {
                getModel(_uri) {
                    assert.strictEqual(uri.toString(), _uri.toString());
                    return model;
                }
            }, new class extends (0, mock_1.$rT)() {
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
//# sourceMappingURL=mainThreadDocumentContentProviders.test.js.map