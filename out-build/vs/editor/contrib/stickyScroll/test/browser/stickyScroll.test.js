define(["require", "exports", "assert", "vs/editor/test/browser/testCodeEditor", "vs/editor/contrib/stickyScroll/browser/stickyScrollController", "vs/platform/instantiation/common/serviceCollection", "vs/editor/common/services/languageFeatures", "vs/editor/test/common/testTextModel", "vs/editor/common/services/languageFeaturesService", "vs/editor/contrib/stickyScroll/browser/stickyScrollProvider", "vs/platform/log/common/log", "vs/platform/contextview/browser/contextView", "vs/base/test/common/mock", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/instantiation/common/descriptors", "vs/base/test/common/timeTravelScheduler", "vs/platform/environment/common/environment", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert, testCodeEditor_1, stickyScrollController_1, serviceCollection_1, languageFeatures_1, testTextModel_1, languageFeaturesService_1, stickyScrollProvider_1, log_1, contextView_1, mock_1, languageConfigurationRegistry_1, languageFeatureDebounce_1, testLanguageConfigurationService_1, descriptors_1, timeTravelScheduler_1, environment_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Sticky Scroll Tests', () => {
        const disposables = new lifecycle_1.$jc();
        const serviceCollection = new serviceCollection_1.$zh([languageFeatures_1.$hF, new languageFeaturesService_1.$oBb()], [log_1.$5i, new log_1.$fj()], [contextView_1.$WZ, new class extends (0, mock_1.$rT)() {
            }], [languageConfigurationRegistry_1.$2t, new testLanguageConfigurationService_1.$D0b()], [environment_1.$Ih, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.isBuilt = true;
                    this.isExtensionDevelopment = false;
                }
            }], [languageFeatureDebounce_1.$52, new descriptors_1.$yh(languageFeatureDebounce_1.$62)]);
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
        (0, utils_1.$bT)();
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
            return (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                const model = (0, testTextModel_1.$O0b)(text);
                await (0, testCodeEditor_1.$Y0b)(model, {
                    stickyScroll: {
                        enabled: true,
                        maxLineCount: 5,
                        defaultModel: 'outlineModel'
                    }, serviceCollection: serviceCollection
                }, async (editor, _viewModel, instantiationService) => {
                    const languageService = instantiationService.get(languageFeatures_1.$hF);
                    const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
                    disposables.add(languageService.documentSymbolProvider.register('*', documentSymbolProviderForTestModel()));
                    const provider = new stickyScrollProvider_1.$T0(editor, languageService, languageConfigurationService);
                    await provider.update();
                    assert.deepStrictEqual(provider.getCandidateStickyLinesIntersecting({ startLineNumber: 1, endLineNumber: 4 }), [new stickyScrollProvider_1.$S0(1, 2, 1)]);
                    assert.deepStrictEqual(provider.getCandidateStickyLinesIntersecting({ startLineNumber: 8, endLineNumber: 10 }), [new stickyScrollProvider_1.$S0(7, 11, 1), new stickyScrollProvider_1.$S0(9, 11, 2), new stickyScrollProvider_1.$S0(10, 10, 3)]);
                    assert.deepStrictEqual(provider.getCandidateStickyLinesIntersecting({ startLineNumber: 10, endLineNumber: 13 }), [new stickyScrollProvider_1.$S0(7, 11, 1), new stickyScrollProvider_1.$S0(9, 11, 2), new stickyScrollProvider_1.$S0(10, 10, 3)]);
                    provider.dispose();
                    model.dispose();
                });
            });
        });
        test('issue #157180: Render the correct line corresponding to the scope definition', () => {
            return (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                const model = (0, testTextModel_1.$O0b)(text);
                await (0, testCodeEditor_1.$Y0b)(model, {
                    stickyScroll: {
                        enabled: true,
                        maxLineCount: 5,
                        defaultModel: 'outlineModel'
                    }, serviceCollection
                }, async (editor, _viewModel, instantiationService) => {
                    const stickyScrollController = editor.registerAndInstantiateContribution(stickyScrollController_1.$U0.ID, stickyScrollController_1.$U0);
                    const lineHeight = editor.getOption(66 /* EditorOption.lineHeight */);
                    const languageService = instantiationService.get(languageFeatures_1.$hF);
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
            return (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                const model = (0, testTextModel_1.$O0b)(text);
                await (0, testCodeEditor_1.$Y0b)(model, {
                    stickyScroll: {
                        enabled: true,
                        maxLineCount: 5,
                        defaultModel: 'outlineModel'
                    }, serviceCollection
                }, async (editor, viewModel, instantiationService) => {
                    const stickyScrollController = editor.registerAndInstantiateContribution(stickyScrollController_1.$U0.ID, stickyScrollController_1.$U0);
                    const lineHeight = editor.getOption(66 /* EditorOption.lineHeight */);
                    const languageService = instantiationService.get(languageFeatures_1.$hF);
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
            return (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                const model = (0, testTextModel_1.$O0b)(textWithScopesWithSameStartingLines);
                await (0, testCodeEditor_1.$Y0b)(model, {
                    stickyScroll: {
                        enabled: true,
                        maxLineCount: 5,
                        defaultModel: 'outlineModel'
                    }, serviceCollection
                }, async (editor, _viewModel, instantiationService) => {
                    const stickyScrollController = editor.registerAndInstantiateContribution(stickyScrollController_1.$U0.ID, stickyScrollController_1.$U0);
                    await stickyScrollController.stickyScrollCandidateProvider.update();
                    const lineHeight = editor.getOption(66 /* EditorOption.lineHeight */);
                    const languageService = instantiationService.get(languageFeatures_1.$hF);
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
//# sourceMappingURL=stickyScroll.test.js.map