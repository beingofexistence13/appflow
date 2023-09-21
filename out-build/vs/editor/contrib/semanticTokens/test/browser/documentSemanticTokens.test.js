/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeaturesService", "vs/editor/common/services/languageService", "vs/editor/common/services/modelService", "vs/editor/common/services/semanticTokensStylingService", "vs/editor/contrib/semanticTokens/browser/documentSemanticTokens", "vs/editor/contrib/semanticTokens/common/getSemanticTokens", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/editor/test/common/services/testTextResourcePropertiesService", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/log/common/log", "vs/platform/notification/test/common/testNotificationService", "vs/platform/theme/common/theme", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedoService"], function (require, exports, assert, async_1, cancellation_1, event_1, lifecycle_1, mock_1, timeTravelScheduler_1, utils_1, range_1, languageFeatureDebounce_1, languageFeaturesService_1, languageService_1, modelService_1, semanticTokensStylingService_1, documentSemanticTokens_1, getSemanticTokens_1, testLanguageConfigurationService_1, testTextResourcePropertiesService_1, testConfigurationService_1, testDialogService_1, log_1, testNotificationService_1, theme_1, testThemeService_1, undoRedoService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ModelSemanticColoring', () => {
        const disposables = new lifecycle_1.$jc();
        let modelService;
        let languageService;
        let languageFeaturesService;
        setup(() => {
            const configService = new testConfigurationService_1.$G0b({ editor: { semanticHighlighting: true } });
            const themeService = new testThemeService_1.$K0b();
            themeService.setTheme(new testThemeService_1.$J0b({}, theme_1.ColorScheme.DARK, true));
            const logService = new log_1.$fj();
            languageFeaturesService = new languageFeaturesService_1.$oBb();
            languageService = disposables.add(new languageService_1.$jmb(false));
            const semanticTokensStylingService = disposables.add(new semanticTokensStylingService_1.$pBb(themeService, logService, languageService));
            modelService = disposables.add(new modelService_1.$4yb(configService, new testTextResourcePropertiesService_1.$F0b(configService), new undoRedoService_1.$myb(new testDialogService_1.$H0b(), new testNotificationService_1.$I0b()), languageService, new testLanguageConfigurationService_1.$D0b()));
            const envService = new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.isBuilt = true;
                    this.isExtensionDevelopment = false;
                }
            };
            disposables.add(new documentSemanticTokens_1.$H0(semanticTokensStylingService, modelService, themeService, configService, new languageFeatureDebounce_1.$62(logService, envService), languageFeaturesService));
        });
        teardown(() => {
            disposables.clear();
        });
        (0, utils_1.$bT)();
        test('DocumentSemanticTokens should be fetched when the result is empty if there are pending changes', async () => {
            await (0, timeTravelScheduler_1.$kT)({}, async () => {
                disposables.add(languageService.registerLanguage({ id: 'testMode' }));
                const inFirstCall = new async_1.$Fg();
                const delayFirstResult = new async_1.$Fg();
                const secondResultProvided = new async_1.$Fg();
                let callCount = 0;
                disposables.add(languageFeaturesService.documentSemanticTokensProvider.register('testMode', new class {
                    getLegend() {
                        return { tokenTypes: ['class'], tokenModifiers: [] };
                    }
                    async provideDocumentSemanticTokens(model, lastResultId, token) {
                        callCount++;
                        if (callCount === 1) {
                            assert.ok('called once');
                            inFirstCall.open();
                            await delayFirstResult.wait();
                            await (0, async_1.$Hg)(0); // wait for the simple scheduler to fire to check that we do actually get rescheduled
                            return null;
                        }
                        if (callCount === 2) {
                            assert.ok('called twice');
                            secondResultProvided.open();
                            return null;
                        }
                        assert.fail('Unexpected call');
                    }
                    releaseDocumentSemanticTokens(resultId) {
                    }
                }));
                const textModel = disposables.add(modelService.createModel('Hello world', languageService.createById('testMode')));
                // pretend the text model is attached to an editor (so that semantic tokens are computed)
                textModel.onBeforeAttached();
                // wait for the provider to be called
                await inFirstCall.wait();
                // the provider is now in the provide call
                // change the text buffer while the provider is running
                textModel.applyEdits([{ range: new range_1.$ks(1, 1, 1, 1), text: 'x' }]);
                // let the provider finish its first result
                delayFirstResult.open();
                // we need to check that the provider is called again, even if it returns null
                await secondResultProvided.wait();
                // assert that it got called twice
                assert.strictEqual(callCount, 2);
            });
        });
        test('issue #149412: VS Code hangs when bad semantic token data is received', async () => {
            await (0, timeTravelScheduler_1.$kT)({}, async () => {
                disposables.add(languageService.registerLanguage({ id: 'testMode' }));
                let lastResult = null;
                disposables.add(languageFeaturesService.documentSemanticTokensProvider.register('testMode', new class {
                    getLegend() {
                        return { tokenTypes: ['class'], tokenModifiers: [] };
                    }
                    async provideDocumentSemanticTokens(model, lastResultId, token) {
                        if (!lastResultId) {
                            // this is the first call
                            lastResult = {
                                resultId: '1',
                                data: new Uint32Array([4294967293, 0, 7, 16, 0, 1, 4, 3, 11, 1])
                            };
                        }
                        else {
                            // this is the second call
                            lastResult = {
                                resultId: '2',
                                edits: [{
                                        start: 4294967276,
                                        deleteCount: 0,
                                        data: new Uint32Array([2, 0, 3, 11, 0])
                                    }]
                            };
                        }
                        return lastResult;
                    }
                    releaseDocumentSemanticTokens(resultId) {
                    }
                }));
                const textModel = disposables.add(modelService.createModel('', languageService.createById('testMode')));
                // pretend the text model is attached to an editor (so that semantic tokens are computed)
                textModel.onBeforeAttached();
                // wait for the semantic tokens to be fetched
                await event_1.Event.toPromise(textModel.onDidChangeTokens);
                assert.strictEqual(lastResult.resultId, '1');
                // edit the text
                textModel.applyEdits([{ range: new range_1.$ks(1, 1, 1, 1), text: 'foo' }]);
                // wait for the semantic tokens to be fetched again
                await event_1.Event.toPromise(textModel.onDidChangeTokens);
                assert.strictEqual(lastResult.resultId, '2');
            });
        });
        test('issue #161573: onDidChangeSemanticTokens doesn\'t consistently trigger provideDocumentSemanticTokens', async () => {
            await (0, timeTravelScheduler_1.$kT)({}, async () => {
                disposables.add(languageService.registerLanguage({ id: 'testMode' }));
                const emitter = new event_1.$fd();
                let requestCount = 0;
                disposables.add(languageFeaturesService.documentSemanticTokensProvider.register('testMode', new class {
                    constructor() {
                        this.onDidChange = emitter.event;
                    }
                    getLegend() {
                        return { tokenTypes: ['class'], tokenModifiers: [] };
                    }
                    async provideDocumentSemanticTokens(model, lastResultId, token) {
                        requestCount++;
                        if (requestCount === 1) {
                            await (0, async_1.$Hg)(1000);
                            // send a change event
                            emitter.fire();
                            await (0, async_1.$Hg)(1000);
                            return null;
                        }
                        return null;
                    }
                    releaseDocumentSemanticTokens(resultId) {
                    }
                }));
                const textModel = disposables.add(modelService.createModel('', languageService.createById('testMode')));
                // pretend the text model is attached to an editor (so that semantic tokens are computed)
                textModel.onBeforeAttached();
                await (0, async_1.$Hg)(5000);
                assert.deepStrictEqual(requestCount, 2);
            });
        });
        test('DocumentSemanticTokens should be pick the token provider with actual items', async () => {
            await (0, timeTravelScheduler_1.$kT)({}, async () => {
                let callCount = 0;
                disposables.add(languageService.registerLanguage({ id: 'testMode2' }));
                disposables.add(languageFeaturesService.documentSemanticTokensProvider.register('testMode2', new class {
                    getLegend() {
                        return { tokenTypes: ['class1'], tokenModifiers: [] };
                    }
                    async provideDocumentSemanticTokens(model, lastResultId, token) {
                        callCount++;
                        // For a secondary request return a different value
                        if (lastResultId) {
                            return {
                                data: new Uint32Array([2, 1, 1, 1, 1, 0, 2, 1, 1, 1])
                            };
                        }
                        return {
                            resultId: '1',
                            data: new Uint32Array([0, 1, 1, 1, 1, 0, 2, 1, 1, 1])
                        };
                    }
                    releaseDocumentSemanticTokens(resultId) {
                    }
                }));
                disposables.add(languageFeaturesService.documentSemanticTokensProvider.register('testMode2', new class {
                    getLegend() {
                        return { tokenTypes: ['class2'], tokenModifiers: [] };
                    }
                    async provideDocumentSemanticTokens(model, lastResultId, token) {
                        callCount++;
                        return null;
                    }
                    releaseDocumentSemanticTokens(resultId) {
                    }
                }));
                function toArr(arr) {
                    const result = [];
                    for (let i = 0; i < arr.length; i++) {
                        result[i] = arr[i];
                    }
                    return result;
                }
                const textModel = modelService.createModel('Hello world 2', languageService.createById('testMode2'));
                try {
                    let result = await (0, getSemanticTokens_1.$B0)(languageFeaturesService.documentSemanticTokensProvider, textModel, null, null, cancellation_1.CancellationToken.None);
                    assert.ok(result, `We should have tokens (1)`);
                    assert.ok(result.tokens, `Tokens are found from multiple providers (1)`);
                    assert.ok((0, getSemanticTokens_1.$x0)(result.tokens), `Tokens are full (1)`);
                    assert.ok(result.tokens.resultId, `Token result id found from multiple providers (1)`);
                    assert.deepStrictEqual(toArr(result.tokens.data), [0, 1, 1, 1, 1, 0, 2, 1, 1, 1], `Token data returned for multiple providers (1)`);
                    assert.deepStrictEqual(callCount, 2, `Called both token providers (1)`);
                    assert.deepStrictEqual(result.provider.getLegend(), { tokenTypes: ['class1'], tokenModifiers: [] }, `Legend matches the tokens (1)`);
                    // Make a second request. Make sure we get the secondary value
                    result = await (0, getSemanticTokens_1.$B0)(languageFeaturesService.documentSemanticTokensProvider, textModel, result.provider, result.tokens.resultId, cancellation_1.CancellationToken.None);
                    assert.ok(result, `We should have tokens (2)`);
                    assert.ok(result.tokens, `Tokens are found from multiple providers (2)`);
                    assert.ok((0, getSemanticTokens_1.$x0)(result.tokens), `Tokens are full (2)`);
                    assert.ok(!result.tokens.resultId, `Token result id found from multiple providers (2)`);
                    assert.deepStrictEqual(toArr(result.tokens.data), [2, 1, 1, 1, 1, 0, 2, 1, 1, 1], `Token data returned for multiple providers (2)`);
                    assert.deepStrictEqual(callCount, 4, `Called both token providers (2)`);
                    assert.deepStrictEqual(result.provider.getLegend(), { tokenTypes: ['class1'], tokenModifiers: [] }, `Legend matches the tokens (2)`);
                }
                finally {
                    disposables.clear();
                    // Wait for scheduler to finish
                    await (0, async_1.$Hg)(0);
                    // Now dispose the text model
                    textModel.dispose();
                }
            });
        });
    });
});
//# sourceMappingURL=documentSemanticTokens.test.js.map