/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/languages", "vs/editor/common/languages/supports/tokenization", "vs/editor/common/services/languageService", "vs/editor/standalone/browser/standaloneLanguages", "vs/platform/theme/browser/iconsStyleSheet", "vs/platform/theme/common/theme"], function (require, exports, assert, event_1, lifecycle_1, utils_1, languages_1, tokenization_1, languageService_1, standaloneLanguages_1, iconsStyleSheet_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TokenizationSupport2Adapter', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const languageId = 'tttt';
        // const tokenMetadata = (LanguageId.PlainText << MetadataConsts.LANGUAGEID_OFFSET);
        class MockTokenTheme extends tokenization_1.TokenTheme {
            constructor() {
                super(null, null);
                this.counter = 0;
            }
            match(languageId, token) {
                return (((this.counter++) << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                    | (languageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */)) >>> 0;
            }
        }
        class MockThemeService {
            constructor() {
                this._builtInProductIconTheme = new iconsStyleSheet_1.UnthemedProductIconTheme();
                this.onDidColorThemeChange = new event_1.Emitter().event;
                this.onDidFileIconThemeChange = new event_1.Emitter().event;
                this.onDidProductIconThemeChange = new event_1.Emitter().event;
            }
            setTheme(themeName) {
                throw new Error('Not implemented');
            }
            setAutoDetectHighContrast(autoDetectHighContrast) {
                throw new Error('Not implemented');
            }
            defineTheme(themeName, themeData) {
                throw new Error('Not implemented');
            }
            getColorTheme() {
                return {
                    label: 'mock',
                    tokenTheme: new MockTokenTheme(),
                    themeName: theme_1.ColorScheme.LIGHT,
                    type: theme_1.ColorScheme.LIGHT,
                    getColor: (color, useDefault) => {
                        throw new Error('Not implemented');
                    },
                    defines: (color) => {
                        throw new Error('Not implemented');
                    },
                    getTokenStyleMetadata: (type, modifiers, modelLanguage) => {
                        return undefined;
                    },
                    semanticHighlighting: false,
                    tokenColorMap: []
                };
            }
            setColorMapOverride(colorMapOverride) {
            }
            getFileIconTheme() {
                return {
                    hasFileIcons: false,
                    hasFolderIcons: false,
                    hidesExplorerArrows: false
                };
            }
            getProductIconTheme() {
                return this._builtInProductIconTheme;
            }
        }
        class MockState {
            static { this.INSTANCE = new MockState(); }
            constructor() { }
            clone() {
                return this;
            }
            equals(other) {
                return this === other;
            }
        }
        function testBadTokensProvider(providerTokens, expectedClassicTokens, expectedModernTokens) {
            class BadTokensProvider {
                getInitialState() {
                    return MockState.INSTANCE;
                }
                tokenize(line, state) {
                    return {
                        tokens: providerTokens,
                        endState: MockState.INSTANCE
                    };
                }
            }
            const disposables = new lifecycle_1.DisposableStore();
            const languageService = disposables.add(new languageService_1.LanguageService());
            disposables.add(languageService.registerLanguage({ id: languageId }));
            const adapter = new standaloneLanguages_1.TokenizationSupportAdapter(languageId, new BadTokensProvider(), languageService, new MockThemeService());
            const actualClassicTokens = adapter.tokenize('whatever', true, MockState.INSTANCE);
            assert.deepStrictEqual(actualClassicTokens.tokens, expectedClassicTokens);
            const actualModernTokens = adapter.tokenizeEncoded('whatever', true, MockState.INSTANCE);
            const modernTokens = [];
            for (let i = 0; i < actualModernTokens.tokens.length; i++) {
                modernTokens[i] = actualModernTokens.tokens[i];
            }
            // Add the encoded language id to the expected tokens
            const encodedLanguageId = languageService.languageIdCodec.encodeLanguageId(languageId);
            const tokenLanguageMetadata = (encodedLanguageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */);
            for (let i = 1; i < expectedModernTokens.length; i += 2) {
                expectedModernTokens[i] |= tokenLanguageMetadata;
            }
            assert.deepStrictEqual(modernTokens, expectedModernTokens);
            disposables.dispose();
        }
        test('tokens always start at index 0', () => {
            testBadTokensProvider([
                { startIndex: 7, scopes: 'foo' },
                { startIndex: 0, scopes: 'bar' }
            ], [
                new languages_1.Token(0, 'foo', languageId),
                new languages_1.Token(0, 'bar', languageId),
            ], [
                0, (0 << 15 /* MetadataConsts.FOREGROUND_OFFSET */) | 1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */,
                0, (1 << 15 /* MetadataConsts.FOREGROUND_OFFSET */) | 1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */
            ]);
        });
        test('tokens always start after each other', () => {
            testBadTokensProvider([
                { startIndex: 0, scopes: 'foo' },
                { startIndex: 5, scopes: 'bar' },
                { startIndex: 3, scopes: 'foo' },
            ], [
                new languages_1.Token(0, 'foo', languageId),
                new languages_1.Token(5, 'bar', languageId),
                new languages_1.Token(5, 'foo', languageId),
            ], [
                0, (0 << 15 /* MetadataConsts.FOREGROUND_OFFSET */) | 1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */,
                5, (1 << 15 /* MetadataConsts.FOREGROUND_OFFSET */) | 1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */,
                5, (2 << 15 /* MetadataConsts.FOREGROUND_OFFSET */) | 1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */
            ]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUxhbmd1YWdlcy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3N0YW5kYWxvbmUvdGVzdC9icm93c2VyL3N0YW5kYWxvbmVMYW5ndWFnZXMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWtCaEcsS0FBSyxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtRQUV6QyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQzFCLG9GQUFvRjtRQUVwRixNQUFNLGNBQWUsU0FBUSx5QkFBVTtZQUV0QztnQkFDQyxLQUFLLENBQUMsSUFBSyxFQUFFLElBQUssQ0FBQyxDQUFDO2dCQUZiLFlBQU8sR0FBRyxDQUFDLENBQUM7WUFHcEIsQ0FBQztZQUNlLEtBQUssQ0FBQyxVQUFzQixFQUFFLEtBQWE7Z0JBQzFELE9BQU8sQ0FDTixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLDZDQUFvQyxDQUFDO3NCQUNwRCxDQUFDLFVBQVUsNENBQW9DLENBQUMsQ0FDbEQsS0FBSyxDQUFDLENBQUM7WUFDVCxDQUFDO1NBQ0Q7UUFFRCxNQUFNLGdCQUFnQjtZQUF0QjtnQkFnRFMsNkJBQXdCLEdBQUcsSUFBSSwwQ0FBd0IsRUFBRSxDQUFDO2dCQUtsRCwwQkFBcUIsR0FBRyxJQUFJLGVBQU8sRUFBZSxDQUFDLEtBQUssQ0FBQztnQkFDekQsNkJBQXdCLEdBQUcsSUFBSSxlQUFPLEVBQWtCLENBQUMsS0FBSyxDQUFDO2dCQUMvRCxnQ0FBMkIsR0FBRyxJQUFJLGVBQU8sRUFBcUIsQ0FBQyxLQUFLLENBQUM7WUFDdEYsQ0FBQztZQXRETyxRQUFRLENBQUMsU0FBaUI7Z0JBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNwQyxDQUFDO1lBQ00s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