/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/textToHtmlTokenizer", "vs/editor/common/services/languagesRegistry", "vs/editor/test/common/core/testLineToken", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, utils_1, languages_1, language_1, textToHtmlTokenizer_1, languagesRegistry_1, testLineToken_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor Modes - textToHtmlTokenizer', () => {
        let disposables;
        let instantiationService;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            instantiationService = (0, testTextModel_1.createModelServices)(disposables);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function toStr(pieces) {
            const resultArr = pieces.map((t) => `<span class="${t.className}">${t.text}</span>`);
            return resultArr.join('');
        }
        test('TextToHtmlTokenizer 1', () => {
            const mode = disposables.add(instantiationService.createInstance(Mode));
            const support = languages_1.TokenizationRegistry.get(mode.languageId);
            const actual = (0, textToHtmlTokenizer_1._tokenizeToString)('.abc..def...gh', new languagesRegistry_1.LanguageIdCodec(), support);
            const expected = [
                { className: 'mtk7', text: '.' },
                { className: 'mtk9', text: 'abc' },
                { className: 'mtk7', text: '..' },
                { className: 'mtk9', text: 'def' },
                { className: 'mtk7', text: '...' },
                { className: 'mtk9', text: 'gh' },
            ];
            const expectedStr = `<div class="monaco-tokenized-source">${toStr(expected)}</div>`;
            assert.strictEqual(actual, expectedStr);
        });
        test('TextToHtmlTokenizer 2', () => {
            const mode = disposables.add(instantiationService.createInstance(Mode));
            const support = languages_1.TokenizationRegistry.get(mode.languageId);
            const actual = (0, textToHtmlTokenizer_1._tokenizeToString)('.abc..def...gh\n.abc..def...gh', new languagesRegistry_1.LanguageIdCodec(), support);
            const expected1 = [
                { className: 'mtk7', text: '.' },
                { className: 'mtk9', text: 'abc' },
                { className: 'mtk7', text: '..' },
                { className: 'mtk9', text: 'def' },
                { className: 'mtk7', text: '...' },
                { className: 'mtk9', text: 'gh' },
            ];
            const expected2 = [
                { className: 'mtk7', text: '.' },
                { className: 'mtk9', text: 'abc' },
                { className: 'mtk7', text: '..' },
                { className: 'mtk9', text: 'def' },
                { className: 'mtk7', text: '...' },
                { className: 'mtk9', text: 'gh' },
            ];
            const expectedStr1 = toStr(expected1);
            const expectedStr2 = toStr(expected2);
            const expectedStr = `<div class="monaco-tokenized-source">${expectedStr1}<br/>${expectedStr2}</div>`;
            assert.strictEqual(actual, expectedStr);
        });
        test('tokenizeLineToHTML', () => {
            const text = 'Ciao hello world!';
            const lineTokens = new testLineToken_1.TestLineTokens([
                new testLineToken_1.TestLineToken(4, ((3 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                    | ((2 /* FontStyle.Bold */ | 1 /* FontStyle.Italic */) << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)) >>> 0),
                new testLineToken_1.TestLineToken(5, ((1 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.TestLineToken(10, ((4 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.TestLineToken(11, ((1 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.TestLineToken(17, ((5 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                    | ((4 /* FontStyle.Underline */) << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)) >>> 0)
            ]);
            const colorMap = [null, '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'];
            assert.strictEqual((0, textToHtmlTokenizer_1.tokenizeLineToHTML)(text, lineTokens, colorMap, 0, 17, 4, true), [
                '<div>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #0000ff;text-decoration: underline;">world!</span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.tokenizeLineToHTML)(text, lineTokens, colorMap, 0, 12, 4, true), [
                '<div>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #0000ff;text-decoration: underline;">w</span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.tokenizeLineToHTML)(text, lineTokens, colorMap, 0, 11, 4, true), [
                '<div>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.tokenizeLineToHTML)(text, lineTokens, colorMap, 1, 11, 4, true), [
                '<div>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">iao</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.tokenizeLineToHTML)(text, lineTokens, colorMap, 4, 11, 4, true), [
                '<div>',
                '<span style="color: #000000;">&#160;</span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.tokenizeLineToHTML)(text, lineTokens, colorMap, 5, 11, 4, true), [
                '<div>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.tokenizeLineToHTML)(text, lineTokens, colorMap, 5, 10, 4, true), [
                '<div>',
                '<span style="color: #00ff00;">hello</span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.tokenizeLineToHTML)(text, lineTokens, colorMap, 6, 9, 4, true), [
                '<div>',
                '<span style="color: #00ff00;">ell</span>',
                '</div>'
            ].join(''));
        });
        test('tokenizeLineToHTML handle spaces #35954', () => {
            const text = '  Ciao   hello world!';
            const lineTokens = new testLineToken_1.TestLineTokens([
                new testLineToken_1.TestLineToken(2, ((1 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.TestLineToken(6, ((3 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                    | ((2 /* FontStyle.Bold */ | 1 /* FontStyle.Italic */) << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)) >>> 0),
                new testLineToken_1.TestLineToken(9, ((1 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.TestLineToken(14, ((4 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.TestLineToken(15, ((1 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.TestLineToken(21, ((5 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                    | ((4 /* FontStyle.Underline */) << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)) >>> 0)
            ]);
            const colorMap = [null, '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'];
            assert.strictEqual((0, textToHtmlTokenizer_1.tokenizeLineToHTML)(text, lineTokens, colorMap, 0, 21, 4, true), [
                '<div>',
                '<span style="color: #000000;">&#160; </span>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
                '<span style="color: #000000;"> &#160; </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #0000ff;text-decoration: underline;">world!</span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.tokenizeLineToHTML)(text, lineTokens, colorMap, 0, 17, 4, true), [
                '<div>',
                '<span style="color: #000000;">&#160; </span>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
                '<span style="color: #000000;"> &#160; </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #0000ff;text-decoration: underline;">wo</span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.tokenizeLineToHTML)(text, lineTokens, colorMap, 0, 3, 4, true), [
                '<div>',
                '<span style="color: #000000;">&#160; </span>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">C</span>',
                '</div>'
            ].join(''));
        });
    });
    let Mode = class Mode extends lifecycle_1.Disposable {
        constructor(languageService) {
            super();
            this.languageId = 'textToHtmlTokenizerMode';
            this._register(languageService.registerLanguage({ id: this.languageId }));
            this._register(languages_1.TokenizationRegistry.register(this.languageId, {
                getInitialState: () => null,
                tokenize: undefined,
                tokenizeEncoded: (line, hasEOL, state) => {
                    const tokensArr = [];
                    let prevColor = -1;
                    for (let i = 0; i < line.length; i++) {
                        const colorId = (line.charAt(i) === '.' ? 7 : 9);
                        if (prevColor !== colorId) {
                            tokensArr.push(i);
                            tokensArr.push((colorId << 15 /* MetadataConsts.FOREGROUND_OFFSET */) >>> 0);
                        }
                        prevColor = colorId;
                    }
                    const tokens = new Uint32Array(tokensArr.length);
                    for (let i = 0; i < tokens.length; i++) {
                        tokens[i] = tokensArr[i];
                    }
                    return new languages_1.EncodedTokenizationResult(tokens, null);
                }
            }));
        }
    };
    Mode = __decorate([
        __param(0, language_1.ILanguageService)
    ], Mode);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFRvSHRtbFRva2VuaXplci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvY29tbW9uL21vZGVzL3RleHRUb0h0bWxUb2tlbml6ZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQWNoRyxLQUFLLENBQUMsb0NBQW9DLEVBQUUsR0FBRyxFQUFFO1FBRWhELElBQUksV0FBNEIsQ0FBQztRQUNqQyxJQUFJLG9CQUE4QyxDQUFDO1FBRW5ELEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDcEMsb0JBQW9CLEdBQUcsSUFBQSxtQ0FBbUIsRUFBQyxXQUFXLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsU0FBUyxLQUFLLENBQUMsTUFBNkM7WUFDM0QsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxTQUFTLEtBQUssQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUM7WUFDckYsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFRCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDeEUsTUFBTSxPQUFPLEdBQUcsZ0NBQW9CLENBQUMsR0FBRyxD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