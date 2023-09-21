/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/emmet/browser/emmetActions", "vs/editor/test/browser/testCodeEditor", "assert", "vs/base/common/lifecycle", "vs/editor/common/languages/language", "vs/base/test/common/utils"], function (require, exports, emmetActions_1, testCodeEditor_1, assert, lifecycle_1, language_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MockGrammarContributions {
        constructor(scopeName) {
            this.scopeName = scopeName;
        }
        getGrammar(mode) {
            return this.scopeName;
        }
    }
    suite('Emmet', () => {
        test('Get language mode and parent mode for emmet', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([], {}, (editor, viewModel, instantiationService) => {
                const languageService = instantiationService.get(language_1.ILanguageService);
                const disposables = new lifecycle_1.DisposableStore();
                disposables.add(languageService.registerLanguage({ id: 'markdown' }));
                disposables.add(languageService.registerLanguage({ id: 'handlebars' }));
                disposables.add(languageService.registerLanguage({ id: 'nunjucks' }));
                disposables.add(languageService.registerLanguage({ id: 'laravel-blade' }));
                function testIsEnabled(mode, scopeName, expectedLanguage, expectedParentLanguage) {
                    const model = editor.getModel();
                    if (!model) {
                        assert.fail('Editor model not found');
                    }
                    model.setLanguage(mode);
                    const langOutput = emmetActions_1.EmmetEditorAction.getLanguage(editor, new MockGrammarContributions(scopeName));
                    if (!langOutput) {
                        assert.fail('langOutput not found');
                    }
                    assert.strictEqual(langOutput.language, expectedLanguage);
                    assert.strictEqual(langOutput.parentMode, expectedParentLanguage);
                }
                // syntaxes mapped using the scope name of the grammar
                testIsEnabled('markdown', 'text.html.markdown', 'markdown', 'html');
                testIsEnabled('handlebars', 'text.html.handlebars', 'handlebars', 'html');
                testIsEnabled('nunjucks', 'text.html.nunjucks', 'nunjucks', 'html');
                testIsEnabled('laravel-blade', 'text.html.php.laravel-blade', 'laravel-blade', 'html');
                // languages that have different Language Id and scopeName
                // testIsEnabled('razor', 'text.html.cshtml', 'razor', 'html');
                // testIsEnabled('HTML (Eex)', 'text.html.elixir', 'boo', 'html');
                disposables.dispose();
            });
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1tZXRBY3Rpb24udGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2VtbWV0L3Rlc3QvYnJvd3Nlci9lbW1ldEFjdGlvbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBU2hHLE1BQU0sd0JBQXdCO1FBRzdCLFlBQVksU0FBaUI7WUFDNUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDNUIsQ0FBQztRQUVNLFVBQVUsQ0FBQyxJQUFZO1lBQzdCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN2QixDQUFDO0tBQ0Q7SUFFRCxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUNuQixJQUFJLENBQUMsNkNBQTZDLEVBQUUsR0FBRyxFQUFFO1lBQ3hELElBQUEsbUNBQWtCLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsb0JBQW9CLEVBQUUsRUFBRTtnQkFDdEUsTUFBTSxlQUFlLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7Z0JBRW5FLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO2dCQUMxQyxXQUFXLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RFLFdBQVcsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDeEUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN0RSxXQUFXLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRTNFLFNBQVMsYUFBYSxDQUFDLElBQVksRUFBRSxTQUFpQixFQUFFLGdCQUF5QixFQUFFLHNCQUErQjtvQkFDakgsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNoQyxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztxQkFDdEM7b0JBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDeEIsTUFBTSxVQUFVLEdBQUcsZ0NBQWlCLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xHLElBQUksQ0FBQyxVQUFVLEVBQUU7d0JBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztxQkFDcEM7b0JBRUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENBQUM7b0JBQzFELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO2dCQUNuRSxDQUFDO2dCQUVELHNEQUFzRDtnQkFDdEQsYUFBYSxDQUFDLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3BFLGFBQWEsQ0FBQyxZQUFZLEVBQUUsc0JBQXNCLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMxRSxhQUFhLENBQUMsVUFBVSxFQUFFLG9CQUFvQixFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDcEUsYUFBYSxDQUFDLGVBQWUsRUFBRSw2QkFBNkIsRUFBRSxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBRXZGLDBEQUEwRDtnQkFDMUQsK0RBQStEO2dCQUMvRCxrRUFBa0U7Z0JBRWxFLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUV2QixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO0lBQzNDLENBQUMsQ0FBQyxDQUFDIn0=