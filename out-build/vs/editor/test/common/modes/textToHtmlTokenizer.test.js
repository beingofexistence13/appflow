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
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testTextModel_1.$Q0b)(disposables);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        function toStr(pieces) {
            const resultArr = pieces.map((t) => `<span class="${t.className}">${t.text}</span>`);
            return resultArr.join('');
        }
        test('TextToHtmlTokenizer 1', () => {
            const mode = disposables.add(instantiationService.createInstance(Mode));
            const support = languages_1.$bt.get(mode.languageId);
            const actual = (0, textToHtmlTokenizer_1.$fY)('.abc..def...gh', new languagesRegistry_1.$hmb(), support);
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
            const support = languages_1.$bt.get(mode.languageId);
            const actual = (0, textToHtmlTokenizer_1.$fY)('.abc..def...gh\n.abc..def...gh', new languagesRegistry_1.$hmb(), support);
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
            const lineTokens = new testLineToken_1.$j$b([
                new testLineToken_1.$i$b(4, ((3 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                    | ((2 /* FontStyle.Bold */ | 1 /* FontStyle.Italic */) << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)) >>> 0),
                new testLineToken_1.$i$b(5, ((1 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.$i$b(10, ((4 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.$i$b(11, ((1 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.$i$b(17, ((5 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                    | ((4 /* FontStyle.Underline */) << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)) >>> 0)
            ]);
            const colorMap = [null, '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'];
            assert.strictEqual((0, textToHtmlTokenizer_1.$eY)(text, lineTokens, colorMap, 0, 17, 4, true), [
                '<div>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #0000ff;text-decoration: underline;">world!</span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.$eY)(text, lineTokens, colorMap, 0, 12, 4, true), [
                '<div>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #0000ff;text-decoration: underline;">w</span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.$eY)(text, lineTokens, colorMap, 0, 11, 4, true), [
                '<div>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.$eY)(text, lineTokens, colorMap, 1, 11, 4, true), [
                '<div>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">iao</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.$eY)(text, lineTokens, colorMap, 4, 11, 4, true), [
                '<div>',
                '<span style="color: #000000;">&#160;</span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.$eY)(text, lineTokens, colorMap, 5, 11, 4, true), [
                '<div>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.$eY)(text, lineTokens, colorMap, 5, 10, 4, true), [
                '<div>',
                '<span style="color: #00ff00;">hello</span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.$eY)(text, lineTokens, colorMap, 6, 9, 4, true), [
                '<div>',
                '<span style="color: #00ff00;">ell</span>',
                '</div>'
            ].join(''));
        });
        test('tokenizeLineToHTML handle spaces #35954', () => {
            const text = '  Ciao   hello world!';
            const lineTokens = new testLineToken_1.$j$b([
                new testLineToken_1.$i$b(2, ((1 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.$i$b(6, ((3 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                    | ((2 /* FontStyle.Bold */ | 1 /* FontStyle.Italic */) << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)) >>> 0),
                new testLineToken_1.$i$b(9, ((1 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.$i$b(14, ((4 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.$i$b(15, ((1 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0),
                new testLineToken_1.$i$b(21, ((5 << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                    | ((4 /* FontStyle.Underline */) << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)) >>> 0)
            ]);
            const colorMap = [null, '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'];
            assert.strictEqual((0, textToHtmlTokenizer_1.$eY)(text, lineTokens, colorMap, 0, 21, 4, true), [
                '<div>',
                '<span style="color: #000000;">&#160; </span>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
                '<span style="color: #000000;"> &#160; </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #0000ff;text-decoration: underline;">world!</span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.$eY)(text, lineTokens, colorMap, 0, 17, 4, true), [
                '<div>',
                '<span style="color: #000000;">&#160; </span>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
                '<span style="color: #000000;"> &#160; </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #0000ff;text-decoration: underline;">wo</span>',
                '</div>'
            ].join(''));
            assert.strictEqual((0, textToHtmlTokenizer_1.$eY)(text, lineTokens, colorMap, 0, 3, 4, true), [
                '<div>',
                '<span style="color: #000000;">&#160; </span>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">C</span>',
                '</div>'
            ].join(''));
        });
    });
    let Mode = class Mode extends lifecycle_1.$kc {
        constructor(languageService) {
            super();
            this.languageId = 'textToHtmlTokenizerMode';
            this.B(languageService.registerLanguage({ id: this.languageId }));
            this.B(languages_1.$bt.register(this.languageId, {
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
                    return new languages_1.$6s(tokens, null);
                }
            }));
        }
    };
    Mode = __decorate([
        __param(0, language_1.$ct)
    ], Mode);
});
//# sourceMappingURL=textToHtmlTokenizer.test.js.map