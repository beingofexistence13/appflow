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
            editors = new extHostDocumentsAndEditors_1.$_L(new testRPCProtocol_1.$3dc(), new log_1.$fj());
        });
        (0, utils_1.$bT)();
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
//# sourceMappingURL=extHostDocumentsAndEditors.test.js.map