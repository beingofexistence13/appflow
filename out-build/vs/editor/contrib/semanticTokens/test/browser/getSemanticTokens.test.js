/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/languageFeatureRegistry", "vs/editor/contrib/semanticTokens/common/getSemanticTokens", "vs/editor/test/common/testTextModel"], function (require, exports, assert, cancellation_1, errors_1, lifecycle_1, utils_1, languageFeatureRegistry_1, getSemanticTokens_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('getSemanticTokens', () => {
        (0, utils_1.$bT)();
        test('issue #136540: semantic highlighting flickers', async () => {
            const disposables = new lifecycle_1.$jc();
            const registry = new languageFeatureRegistry_1.$dF();
            const provider = new class {
                getLegend() {
                    return { tokenTypes: ['test'], tokenModifiers: [] };
                }
                provideDocumentSemanticTokens(model, lastResultId, token) {
                    throw (0, errors_1.$4)();
                }
                releaseDocumentSemanticTokens(resultId) {
                }
            };
            disposables.add(registry.register('testLang', provider));
            const textModel = disposables.add((0, testTextModel_1.$O0b)('example', 'testLang'));
            await (0, getSemanticTokens_1.$B0)(registry, textModel, null, null, cancellation_1.CancellationToken.None).then((res) => {
                assert.fail();
            }, (err) => {
                assert.ok(!!err);
            });
            disposables.dispose();
        });
    });
});
//# sourceMappingURL=getSemanticTokens.test.js.map