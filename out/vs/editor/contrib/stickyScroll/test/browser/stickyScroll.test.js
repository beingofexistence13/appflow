define(["require", "exports", "assert", "vs/editor/test/browser/testCodeEditor", "vs/editor/contrib/stickyScroll/browser/stickyScrollController", "vs/platform/instantiation/common/serviceCollection", "vs/editor/common/services/languageFeatures", "vs/editor/test/common/testTextModel", "vs/editor/common/services/languageFeaturesService", "vs/editor/contrib/stickyScroll/browser/stickyScrollProvider", "vs/platform/log/common/log", "vs/platform/contextview/browser/contextView", "vs/base/test/common/mock", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/instantiation/common/descriptors", "vs/base/test/common/timeTravelScheduler", "vs/platform/environment/common/environment", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert, testCodeEditor_1, stickyScrollController_1, serviceCollection_1, languageFeatures_1, testTextModel_1, languageFeaturesService_1, stickyScrollProvider_1, log_1, contextView_1, mock_1, languageConfigurationRegistry_1, languageFeatureDebounce_1, testLanguageConfigurationService_1, descriptors_1, timeTravelScheduler_1, environment_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Sticky Scroll Tests', () => {
        const disposables = new lifecycle_1.DisposableStore();
        const serviceCollection = new serviceCollection_1.ServiceCollection([languageFeatures_1.ILanguageFeaturesService, new languageFeaturesService_1.LanguageFeaturesService()], [log_1.ILogService, new log_1.NullLogService()], [contextView_1.IContextMenuService, new class extends (0, mock_1.mock)() {
            }], [languageConfigurationRegistry_1.ILanguageConfigurationService, new testLanguageConfigurationService_1.TestLanguageConfigurationService()], [environment_1.IEnvironmentService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.isBuilt = true;
                    this.isExtensionDevelopment = false;
                }
            }], [languageFeatureDebounce_1.ILanguageFeatureDebounceService, new descriptors_1.SyncDescriptor(languageFeatureDebounce_1.LanguageFeatureDebounceService)]);
        const text = [
            'function foo() {',
            '',
            '}',
            '/* comment related to TestClass',
            ' end of the comment */',
            '@classDecorator',
            'class TestClass {',
            '// comment related to the function functionOfClass',
            'functionOfClass(){',
            'function function1(){',
            '}',
            '}}',
            'function bar() { function insideBar() {}',
            '}'
        ].join('\n');
        setup(() => {
            disposables.clear();
        });
        teardown(() => {
            disposables.clear();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function documentSymbolProviderForTestModel() {
            return {
                provideDocumentSymbols() {
                    return [
                        {
                            name: 'foo',
                            detail: 'foo',
                            kind: 11 /* SymbolKind.Function */,
                            tags: [],
                            range: { startLineNumber: 1, endLineNumber: 3, startColumn: 1, endColumn: 1 },
                            selectionRange: { startLineNumber: 1, endLineNumber: 1, startColumn: 1, endColumn: 1 }
                        },
                        {
                            name: 'TestClass',
                            detail: 'TestClass',
                            kind: 4 /* SymbolKind.Class */,
                            tags: [],
                            range: { startLineNumber: 4, endLineNumber: 12, startColumn: 1, endColumn: 1 },
                            selectionRange: { startLineNumber: 7, endLineNumber: 7, startColumn: 1, endColumn: 1 },
                            children: [
                                {
                                    name: 'functionOfClass',
                                    detail: 'functionOfClass',
                                    kind: 11 /* SymbolKind.Function */,
                                    tags: [],
                                    range: { startLineNumber: 8, endLineNumber: 12, startColumn: 1, endColumn: 1 },
                                    selectionRange: { startLineNumber: 9, endLineNumber: 9, startColumn: 1, endColumn: 1 },
                                    children: [
                                        {
                                            name: 'function1',
                                            detail: 'function1',
                                            kind: 11 /* SymbolKind.Function */,
                                            tags: [],
                                            range: { startLineNumber: 10, endLineNumber: 11, startColumn: 1, endColumn: 1 },
                                            selectionRange: { startLineNumber: 10, endLineNumber: 10, startColumn: 1, endColumn: 1 },
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name: 'bar',
                            detail: 'bar',
                            kind: 11 /* SymbolKind.Function */,
                            tags: [],
                            range: { startLineNumber: 13, endLineNumber: 14, startColumn: 1, endColumn: 1 },
                            selectionRange: { startLineNumber: 13, endLineNumber: 13, startColumn: 1, endColumn: 1 },
                            children: [
                                {
                                    name: 'insideBar',
                                    detail: 'insideBar',
                                    kind: 11 /* SymbolKind.Function */,
                                    tags: [],
                                    range: { startLineNumber: 13, endLineNumber: 13, startColumn: 1, endColumn: 1 },
                                    selectionRange: { startLineNumber: 13, endLineNumber: 13, startColumn: 1, endColumn: 1 },
                                }
                            ]
                        }
                    ];
                }
            };
        }
        test('Testing the function getCandidateStickyLinesIntersecting', () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                const model = (0, testTextModel_1.createTextModel)(text);
                await (0, testCodeEditor_1.withAsyncTestCodeEditor)(model, {
                    stickyScroll: {
                        enabled: true,
                        maxLineCount: 5,
                        defaultModel: 'outlineModel'
                    }, serviceCollection: serviceCollection
                }, async (editor, _viewModel, instantiationService) => {
                    const languageService = instantiationService.get(languageFeatures_1.ILanguageFeaturesService);
                    const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
                    disposables.add(languageService.documentSymbolProvider.register('*', documentSymbolProviderForTestModel()));
                    const provider = new stickyScrollProvider_1.StickyLineCandidateProvider(editor, languageService, languageConfigurationService);
                    await provider.update();
                    assert.deepStrictEqual(provider.getCandidateStickyLinesIntersecting({ startLineNumber: 1, endLineNumber: 4 }), [new stickyScrollProvider_1.StickyLineCandidate(1, 2, 1)]);
                    assert.deepStrictEqual(provider.getCandidateStickyLinesIntersecting({ startLineNumber: 8, endLineNumber: 10 }), [new stickyScrollProvider_1.StickyLineCandidate(7, 11, 1), new stickyScrollProvider_1.StickyLineCandidate(9, 11, 2), new stickyScrollProvider_1.StickyLineCandidate(10, 10, 3)]);
                    assert.deepStrictEqual(provider.getCandidateStickyLinesIntersecting({ startLineNumber: 10, endLineNumber: 13 }), [new stickyScrollProvider_1.StickyLineCandidate(7, 11, 1), new stickyScrollProvider_1.StickyLineCandidate(9, 11, 2), new stickyScrollProvider_1.StickyLineCandidate(10, 10, 3)]);
                    provider.dispose();
                    model.dispose();
                });
            });
        });
        test('issue #157180: Render the correct line corresponding to the scope definition', () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                const model = (0, testTextModel_1.createTextModel)(text);
                await (0, testCodeEditor_1.withAsyncTestCodeEditor)(model, {
                    stickyScroll: {
                        enabled: true,
                        maxLineCount: 5,
                        defaultModel: 'outlineModel'
                    }, serviceCollection
                }, async (editor, _viewModel, instantiationService) => {
                    const stickyScrollController = editor.registerAndInstantiateContribution(stickyScrollController_1.StickyScrollController.ID, stickyScrollController_1.StickyScrollController);
                    const lineHeight = editor.getOption(66 /* EditorOption.lineHeight */);
                    const languageService = instantiationService.get(languageFeatures_1.ILanguageFeaturesService);
                    disposables.add(languageService.documentSymbolProvider.register('*', documentSymbolProviderForTestModel()));
                    await stickyScrollController.stickyScrollCandidateProvider.update();
                    let state;
                    editor.setScrollTop(1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, [1]);
                    editor.setScrollTop(lineHeight + 1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, [1]);
                    editor.setScrollTop(4 * lineHeight + 1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, []);
                    editor.setScrollTop(8 * lineHeight + 1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, [7, 9]);
                    editor.setScrollTop(9 * lineHeight + 1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, [7, 9]);
                    editor.setScrollTop(10 * lineHeight + 1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, [7]);
                    stickyScrollController.dispose();
                    stickyScrollController.stickyScrollCandidateProvider.dispose();
                    model.dispose();
                });
            });
        });
        test('issue #156268 : Do not reveal sticky lines when they are in a folded region ', () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                const model = (0, testTextModel_1.createTextModel)(text);
                await (0, testCodeEditor_1.withAsyncTestCodeEditor)(model, {
                    stickyScroll: {
                        enabled: true,
                        maxLineCount: 5,
                        defaultModel: 'outlineModel'
                    }, serviceCollection
                }, async (editor, viewModel, instantiationService) => {
                    const stickyScrollController = editor.registerAndInstantiateContribution(stickyScrollController_1.StickyScrollController.ID, stickyScrollController_1.StickyScrollController);
                    const lineHeight = editor.getOption(66 /* EditorOption.lineHeight */);
                    const languageService = instantiationService.get(languageFeatures_1.ILanguageFeaturesService);
                    disposables.add(languageService.documentSymbolProvider.register('*', documentSymbolProviderForTestModel()));
                    await stickyScrollController.stickyScrollCandidateProvider.update();
                    editor.setHiddenAreas([{ startLineNumber: 2, endLineNumber: 2, startColumn: 1, endColumn: 1 }, { startLineNumber: 10, endLineNumber: 11, startColumn: 1, endColumn: 1 }]);
                    let state;
                    editor.setScrollTop(1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, [1]);
                    editor.setScrollTop(lineHeight + 1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, []);
                    editor.setScrollTop(6 * lineHeight + 1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, [7, 9]);
                    editor.setScrollTop(7 * lineHeight + 1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, [7]);
                    editor.setScrollTop(10 * lineHeight + 1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, []);
                    stickyScrollController.dispose();
                    stickyScrollController.stickyScrollCandidateProvider.dispose();
                    model.dispose();
                });
            });
        });
        const textWithScopesWithSameStartingLines = [
            'class TestClass { foo() {',
            'function bar(){',
            '',
            '}}',
            '}',
            ''
        ].join('\n');
        function documentSymbolProviderForSecondTestModel() {
            return {
                provideDocumentSymbols() {
                    return [
                        {
                            name: 'TestClass',
                            detail: 'TestClass',
                            kind: 4 /* SymbolKind.Class */,
                            tags: [],
                            range: { startLineNumber: 1, endLineNumber: 5, startColumn: 1, endColumn: 1 },
                            selectionRange: { startLineNumber: 1, endLineNumber: 1, startColumn: 1, endColumn: 1 },
                            children: [
                                {
                                    name: 'foo',
                                    detail: 'foo',
                                    kind: 11 /* SymbolKind.Function */,
                                    tags: [],
                                    range: { startLineNumber: 1, endLineNumber: 4, startColumn: 1, endColumn: 1 },
                                    selectionRange: { startLineNumber: 1, endLineNumber: 1, startColumn: 1, endColumn: 1 },
                                    children: [
                                        {
                                            name: 'bar',
                                            detail: 'bar',
                                            kind: 11 /* SymbolKind.Function */,
                                            tags: [],
                                            range: { startLineNumber: 2, endLineNumber: 4, startColumn: 1, endColumn: 1 },
                                            selectionRange: { startLineNumber: 2, endLineNumber: 2, startColumn: 1, endColumn: 1 },
                                            children: []
                                        }
                                    ]
                                },
                            ]
                        }
                    ];
                }
            };
        }
        test('issue #159271 : render the correct widget state when the child scope starts on the same line as the parent scope', () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                const model = (0, testTextModel_1.createTextModel)(textWithScopesWithSameStartingLines);
                await (0, testCodeEditor_1.withAsyncTestCodeEditor)(model, {
                    stickyScroll: {
                        enabled: true,
                        maxLineCount: 5,
                        defaultModel: 'outlineModel'
                    }, serviceCollection
                }, async (editor, _viewModel, instantiationService) => {
                    const stickyScrollController = editor.registerAndInstantiateContribution(stickyScrollController_1.StickyScrollController.ID, stickyScrollController_1.StickyScrollController);
                    await stickyScrollController.stickyScrollCandidateProvider.update();
                    const lineHeight = editor.getOption(66 /* EditorOption.lineHeight */);
                    const languageService = instantiationService.get(languageFeatures_1.ILanguageFeaturesService);
                    disposables.add(languageService.documentSymbolProvider.register('*', documentSymbolProviderForSecondTestModel()));
                    await stickyScrollController.stickyScrollCandidateProvider.update();
                    let state;
                    editor.setScrollTop(1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, [1, 2]);
                    editor.setScrollTop(lineHeight + 1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, [1, 2]);
                    editor.setScrollTop(2 * lineHeight + 1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, [1]);
                    editor.setScrollTop(3 * lineHeight + 1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, [1]);
                    editor.setScrollTop(4 * lineHeight + 1);
                    state = stickyScrollController.findScrollWidgetState();
                    assert.deepStrictEqual(state.startLineNumbers, []);
                    stickyScrollController.dispose();
                    stickyScrollController.stickyScrollCandidateProvider.dispose();
                    model.dispose();
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5U2Nyb2xsLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zdGlja3lTY3JvbGwvdGVzdC9icm93c2VyL3N0aWNreVNjcm9sbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQTBCQSxLQUFLLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO1FBRWpDLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBRTFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxxQ0FBaUIsQ0FDOUMsQ0FBQywyQ0FBd0IsRUFBRSxJQUFJLGlEQUF1QixFQUFFLENBQUMsRUFDekQsQ0FBQyxpQkFBVyxFQUFFLElBQUksb0JBQWMsRUFBRSxDQUFDLEVBQ25DLENBQUMsaUNBQW1CLEVBQUUsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQXVCO2FBQUksQ0FBQyxFQUN4RSxDQUFDLDZEQUE2QixFQUFFLElBQUksbUVBQWdDLEVBQUUsQ0FBQyxFQUN2RSxDQUFDLGlDQUFtQixFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUF1QjtnQkFBekM7O29CQUNoQixZQUFPLEdBQVksSUFBSSxDQUFDO29CQUN4QiwyQkFBc0IsR0FBWSxLQUFLLENBQUM7Z0JBQ2xELENBQUM7YUFBQSxDQUFDLEVBQ0YsQ0FBQyx5REFBK0IsRUFBRSxJQUFJLDRCQUFjLENBQUMsd0RBQThCLENBQUMsQ0FBQyxDQUNyRixDQUFDO1FBRUYsTUFBTSxJQUFJLEdBQUc7WUFDWixrQkFBa0I7WUFDbEIsRUFBRTtZQUNGLEdBQUc7WUFDSCxpQ0FBaUM7WUFDakMsd0JBQXdCO1lBQ3hCLGlCQUFpQjtZQUNqQixtQkFBbUI7WUFDbkIsb0RBQW9EO1lBQ3BELG9CQUFvQjtZQUNwQix1QkFBdUI7WUFDdkIsR0FBRztZQUNILElBQUk7WUFDSiwwQ0FBMEM7WUFDMUMsR0FBRztT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