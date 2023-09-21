/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/languageFeatureRegistry", "vs/editor/contrib/semanticTokens/common/getSemanticTokens", "vs/editor/test/common/testTextModel"], function (require, exports, assert, cancellation_1, errors_1, lifecycle_1, utils_1, languageFeatureRegistry_1, getSemanticTokens_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('getSemanticTokens', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('issue #136540: semantic highlighting flickers', async () => {
            const disposables = new lifecycle_1.DisposableStore();
            const registry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
            const provider = new class {
                getLegend() {
                    return { tokenTypes: ['test'], tokenModifiers: [] };
                }
                provideDocumentSemanticTokens(model, lastResultId, token) {
                    throw (0, errors_1.canceled)();
                }
                releaseDocumentSemanticTokens(resultId) {
                }
            };
            disposables.add(registry.register('testLang', provider));
            const textModel = disposables.add((0, testTextModel_1.createTextModel)('example', 'testLang'));
            await (0, getSemanticTokens_1.getDocumentSemanticTokens)(registry, textModel, null, null, cancellation_1.CancellationToken.None).then((res) => {
                assert.fail();
            }, (err) => {
                assert.ok(!!err);
            });
            disposables.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0U2VtYW50aWNUb2tlbnMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3NlbWFudGljVG9rZW5zL3Rlc3QvYnJvd3Nlci9nZXRTZW1hbnRpY1Rva2Vucy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBYWhHLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFFL0IsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksQ0FBQywrQ0FBK0MsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNoRSxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUMxQyxNQUFNLFFBQVEsR0FBRyxJQUFJLGlEQUF1QixFQUFrQyxDQUFDO1lBQy9FLE1BQU0sUUFBUSxHQUFHLElBQUk7Z0JBQ3BCLFNBQVM7b0JBQ1IsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsQ0FBQztnQkFDckQsQ0FBQztnQkFDRCw2QkFBNkIsQ0FBQyxLQUFpQixFQUFFLFlBQTJCLEVBQUUsS0FBd0I7b0JBQ3JHLE1BQU0sSUFBQSxpQkFBUSxHQUFFLENBQUM7Z0JBQ2xCLENBQUM7Z0JBQ0QsNkJBQTZCLENBQUMsUUFBNEI7Z0JBQzFELENBQUM7YUFDRCxDQUFDO1lBRUYsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBRXpELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBQSwrQkFBZSxFQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBRTFFLE1BQU0sSUFBQSw2Q0FBeUIsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ3JHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNmLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNWLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1lBRUgsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBRUosQ0FBQyxDQUFDLENBQUMifQ==