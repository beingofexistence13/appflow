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
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/nullTokenize", "vs/editor/common/textModelEvents", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, utils_1, editOperation_1, position_1, range_1, languages_1, language_1, languageConfigurationRegistry_1, nullTokenize_1, textModelEvents_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // --------- utils
    const LINE1 = 'My First Line';
    const LINE2 = '\t\tMy Second Line';
    const LINE3 = '    Third Line';
    const LINE4 = '';
    const LINE5 = '1';
    suite('Editor Model - Model', () => {
        let thisModel;
        setup(() => {
            const text = LINE1 + '\r\n' +
                LINE2 + '\n' +
                LINE3 + '\n' +
                LINE4 + '\r\n' +
                LINE5;
            thisModel = (0, testTextModel_1.$O0b)(text);
        });
        teardown(() => {
            thisModel.dispose();
        });
        (0, utils_1.$bT)();
        // --------- insert text
        test('model getValue', () => {
            assert.strictEqual(thisModel.getValue(), 'My First Line\n\t\tMy Second Line\n    Third Line\n\n1');
        });
        test('model insert empty text', () => {
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 1), '')]);
            assert.strictEqual(thisModel.getLineCount(), 5);
            assert.strictEqual(thisModel.getLineContent(1), 'My First Line');
        });
        test('model insert text without newline 1', () => {
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 1), 'foo ')]);
            assert.strictEqual(thisModel.getLineCount(), 5);
            assert.strictEqual(thisModel.getLineContent(1), 'foo My First Line');
        });
        test('model insert text without newline 2', () => {
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 3), ' foo')]);
            assert.strictEqual(thisModel.getLineCount(), 5);
            assert.strictEqual(thisModel.getLineContent(1), 'My foo First Line');
        });
        test('model insert text with one newline', () => {
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 3), ' new line\nNo longer')]);
            assert.strictEqual(thisModel.getLineCount(), 6);
            assert.strictEqual(thisModel.getLineContent(1), 'My new line');
            assert.strictEqual(thisModel.getLineContent(2), 'No longer First Line');
        });
        test('model insert text with two newlines', () => {
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 3), ' new line\nOne more line in the middle\nNo longer')]);
            assert.strictEqual(thisModel.getLineCount(), 7);
            assert.strictEqual(thisModel.getLineContent(1), 'My new line');
            assert.strictEqual(thisModel.getLineContent(2), 'One more line in the middle');
            assert.strictEqual(thisModel.getLineContent(3), 'No longer First Line');
        });
        test('model insert text with many newlines', () => {
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 3), '\n\n\n\n')]);
            assert.strictEqual(thisModel.getLineCount(), 9);
            assert.strictEqual(thisModel.getLineContent(1), 'My');
            assert.strictEqual(thisModel.getLineContent(2), '');
            assert.strictEqual(thisModel.getLineContent(3), '');
            assert.strictEqual(thisModel.getLineContent(4), '');
            assert.strictEqual(thisModel.getLineContent(5), ' First Line');
        });
        // --------- insert text eventing
        test('model insert empty text does not trigger eventing', () => {
            const disposable = thisModel.onDidChangeContentOrInjectedText((e) => {
                assert.ok(false, 'was not expecting event');
            });
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 1), '')]);
            disposable.dispose();
        });
        test('model insert text without newline eventing', () => {
            let e = null;
            const disposable = thisModel.onDidChangeContentOrInjectedText((_e) => {
                if (e !== null || !(_e instanceof textModelEvents_1.$ru)) {
                    assert.fail('Unexpected assertion error');
                }
                e = _e.rawContentChangedEvent;
            });
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 1), 'foo ')]);
            assert.deepStrictEqual(e, new textModelEvents_1.$pu([
                new textModelEvents_1.$lu(1, 'foo My First Line', null)
            ], 2, false, false));
            disposable.dispose();
        });
        test('model insert text with one newline eventing', () => {
            let e = null;
            const disposable = thisModel.onDidChangeContentOrInjectedText((_e) => {
                if (e !== null || !(_e instanceof textModelEvents_1.$ru)) {
                    assert.fail('Unexpected assertion error');
                }
                e = _e.rawContentChangedEvent;
            });
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 3), ' new line\nNo longer')]);
            assert.deepStrictEqual(e, new textModelEvents_1.$pu([
                new textModelEvents_1.$lu(1, 'My new line', null),
                new textModelEvents_1.$nu(2, 2, ['No longer First Line'], [null]),
            ], 2, false, false));
            disposable.dispose();
        });
        // --------- delete text
        test('model delete empty text', () => {
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 1, 1))]);
            assert.strictEqual(thisModel.getLineCount(), 5);
            assert.strictEqual(thisModel.getLineContent(1), 'My First Line');
        });
        test('model delete text from one line', () => {
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 1, 2))]);
            assert.strictEqual(thisModel.getLineCount(), 5);
            assert.strictEqual(thisModel.getLineContent(1), 'y First Line');
        });
        test('model delete text from one line 2', () => {
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 1), 'a')]);
            assert.strictEqual(thisModel.getLineContent(1), 'aMy First Line');
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 2, 1, 4))]);
            assert.strictEqual(thisModel.getLineCount(), 5);
            assert.strictEqual(thisModel.getLineContent(1), 'a First Line');
        });
        test('model delete all text from a line', () => {
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 1, 14))]);
            assert.strictEqual(thisModel.getLineCount(), 5);
            assert.strictEqual(thisModel.getLineContent(1), '');
        });
        test('model delete text from two lines', () => {
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 4, 2, 6))]);
            assert.strictEqual(thisModel.getLineCount(), 4);
            assert.strictEqual(thisModel.getLineContent(1), 'My Second Line');
        });
        test('model delete text from many lines', () => {
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 4, 3, 5))]);
            assert.strictEqual(thisModel.getLineCount(), 3);
            assert.strictEqual(thisModel.getLineContent(1), 'My Third Line');
        });
        test('model delete everything', () => {
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 5, 2))]);
            assert.strictEqual(thisModel.getLineCount(), 1);
            assert.strictEqual(thisModel.getLineContent(1), '');
        });
        // --------- delete text eventing
        test('model delete empty text does not trigger eventing', () => {
            const disposable = thisModel.onDidChangeContentOrInjectedText((e) => {
                assert.ok(false, 'was not expecting event');
            });
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 1, 1))]);
            disposable.dispose();
        });
        test('model delete text from one line eventing', () => {
            let e = null;
            const disposable = thisModel.onDidChangeContentOrInjectedText((_e) => {
                if (e !== null || !(_e instanceof textModelEvents_1.$ru)) {
                    assert.fail('Unexpected assertion error');
                }
                e = _e.rawContentChangedEvent;
            });
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 1, 2))]);
            assert.deepStrictEqual(e, new textModelEvents_1.$pu([
                new textModelEvents_1.$lu(1, 'y First Line', null),
            ], 2, false, false));
            disposable.dispose();
        });
        test('model delete all text from a line eventing', () => {
            let e = null;
            const disposable = thisModel.onDidChangeContentOrInjectedText((_e) => {
                if (e !== null || !(_e instanceof textModelEvents_1.$ru)) {
                    assert.fail('Unexpected assertion error');
                }
                e = _e.rawContentChangedEvent;
            });
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 1, 14))]);
            assert.deepStrictEqual(e, new textModelEvents_1.$pu([
                new textModelEvents_1.$lu(1, '', null),
            ], 2, false, false));
            disposable.dispose();
        });
        test('model delete text from two lines eventing', () => {
            let e = null;
            const disposable = thisModel.onDidChangeContentOrInjectedText((_e) => {
                if (e !== null || !(_e instanceof textModelEvents_1.$ru)) {
                    assert.fail('Unexpected assertion error');
                }
                e = _e.rawContentChangedEvent;
            });
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 4, 2, 6))]);
            assert.deepStrictEqual(e, new textModelEvents_1.$pu([
                new textModelEvents_1.$lu(1, 'My Second Line', null),
                new textModelEvents_1.$mu(2, 2),
            ], 2, false, false));
            disposable.dispose();
        });
        test('model delete text from many lines eventing', () => {
            let e = null;
            const disposable = thisModel.onDidChangeContentOrInjectedText((_e) => {
                if (e !== null || !(_e instanceof textModelEvents_1.$ru)) {
                    assert.fail('Unexpected assertion error');
                }
                e = _e.rawContentChangedEvent;
            });
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 4, 3, 5))]);
            assert.deepStrictEqual(e, new textModelEvents_1.$pu([
                new textModelEvents_1.$lu(1, 'My Third Line', null),
                new textModelEvents_1.$mu(2, 3),
            ], 2, false, false));
            disposable.dispose();
        });
        // --------- getValueInRange
        test('getValueInRange', () => {
            assert.strictEqual(thisModel.getValueInRange(new range_1.$ks(1, 1, 1, 1)), '');
            assert.strictEqual(thisModel.getValueInRange(new range_1.$ks(1, 1, 1, 2)), 'M');
            assert.strictEqual(thisModel.getValueInRange(new range_1.$ks(1, 2, 1, 3)), 'y');
            assert.strictEqual(thisModel.getValueInRange(new range_1.$ks(1, 1, 1, 14)), 'My First Line');
            assert.strictEqual(thisModel.getValueInRange(new range_1.$ks(1, 1, 2, 1)), 'My First Line\n');
            assert.strictEqual(thisModel.getValueInRange(new range_1.$ks(1, 1, 2, 2)), 'My First Line\n\t');
            assert.strictEqual(thisModel.getValueInRange(new range_1.$ks(1, 1, 2, 3)), 'My First Line\n\t\t');
            assert.strictEqual(thisModel.getValueInRange(new range_1.$ks(1, 1, 2, 17)), 'My First Line\n\t\tMy Second Line');
            assert.strictEqual(thisModel.getValueInRange(new range_1.$ks(1, 1, 3, 1)), 'My First Line\n\t\tMy Second Line\n');
            assert.strictEqual(thisModel.getValueInRange(new range_1.$ks(1, 1, 4, 1)), 'My First Line\n\t\tMy Second Line\n    Third Line\n');
        });
        // --------- getValueLengthInRange
        test('getValueLengthInRange', () => {
            assert.strictEqual(thisModel.getValueLengthInRange(new range_1.$ks(1, 1, 1, 1)), ''.length);
            assert.strictEqual(thisModel.getValueLengthInRange(new range_1.$ks(1, 1, 1, 2)), 'M'.length);
            assert.strictEqual(thisModel.getValueLengthInRange(new range_1.$ks(1, 2, 1, 3)), 'y'.length);
            assert.strictEqual(thisModel.getValueLengthInRange(new range_1.$ks(1, 1, 1, 14)), 'My First Line'.length);
            assert.strictEqual(thisModel.getValueLengthInRange(new range_1.$ks(1, 1, 2, 1)), 'My First Line\n'.length);
            assert.strictEqual(thisModel.getValueLengthInRange(new range_1.$ks(1, 1, 2, 2)), 'My First Line\n\t'.length);
            assert.strictEqual(thisModel.getValueLengthInRange(new range_1.$ks(1, 1, 2, 3)), 'My First Line\n\t\t'.length);
            assert.strictEqual(thisModel.getValueLengthInRange(new range_1.$ks(1, 1, 2, 17)), 'My First Line\n\t\tMy Second Line'.length);
            assert.strictEqual(thisModel.getValueLengthInRange(new range_1.$ks(1, 1, 3, 1)), 'My First Line\n\t\tMy Second Line\n'.length);
            assert.strictEqual(thisModel.getValueLengthInRange(new range_1.$ks(1, 1, 4, 1)), 'My First Line\n\t\tMy Second Line\n    Third Line\n'.length);
        });
        // --------- setValue
        test('setValue eventing', () => {
            let e = null;
            const disposable = thisModel.onDidChangeContentOrInjectedText((_e) => {
                if (e !== null || !(_e instanceof textModelEvents_1.$ru)) {
                    assert.fail('Unexpected assertion error');
                }
                e = _e.rawContentChangedEvent;
            });
            thisModel.setValue('new value');
            assert.deepStrictEqual(e, new textModelEvents_1.$pu([
                new textModelEvents_1.$ju()
            ], 2, false, false));
            disposable.dispose();
        });
        test('issue #46342: Maintain edit operation order in applyEdits', () => {
            const res = thisModel.applyEdits([
                { range: new range_1.$ks(2, 1, 2, 1), text: 'a' },
                { range: new range_1.$ks(1, 1, 1, 1), text: 'b' },
            ], true);
            assert.deepStrictEqual(res[0].range, new range_1.$ks(2, 1, 2, 2));
            assert.deepStrictEqual(res[1].range, new range_1.$ks(1, 1, 1, 2));
        });
    });
    // --------- Special Unicode LINE SEPARATOR character
    suite('Editor Model - Model Line Separators', () => {
        let thisModel;
        setup(() => {
            const text = LINE1 + '\u2028' +
                LINE2 + '\n' +
                LINE3 + '\u2028' +
                LINE4 + '\r\n' +
                LINE5;
            thisModel = (0, testTextModel_1.$O0b)(text);
        });
        teardown(() => {
            thisModel.dispose();
        });
        (0, utils_1.$bT)();
        test('model getValue', () => {
            assert.strictEqual(thisModel.getValue(), 'My First Line\u2028\t\tMy Second Line\n    Third Line\u2028\n1');
        });
        test('model lines', () => {
            assert.strictEqual(thisModel.getLineCount(), 3);
        });
        test('Bug 13333:Model should line break on lonely CR too', () => {
            const model = (0, testTextModel_1.$O0b)('Hello\rWorld!\r\nAnother line');
            assert.strictEqual(model.getLineCount(), 3);
            assert.strictEqual(model.getValue(), 'Hello\r\nWorld!\r\nAnother line');
            model.dispose();
        });
    });
    // --------- Words
    suite('Editor Model - Words', () => {
        const OUTER_LANGUAGE_ID = 'outerMode';
        const INNER_LANGUAGE_ID = 'innerMode';
        let OuterMode = class OuterMode extends lifecycle_1.$kc {
            constructor(languageService, languageConfigurationService) {
                super();
                this.languageId = OUTER_LANGUAGE_ID;
                this.B(languageService.registerLanguage({ id: this.languageId }));
                this.B(languageConfigurationService.register(this.languageId, {}));
                const languageIdCodec = languageService.languageIdCodec;
                this.B(languages_1.$bt.register(this.languageId, {
                    getInitialState: () => nullTokenize_1.$uC,
                    tokenize: undefined,
                    tokenizeEncoded: (line, hasEOL, state) => {
                        const tokensArr = [];
                        let prevLanguageId = undefined;
                        for (let i = 0; i < line.length; i++) {
                            const languageId = (line.charAt(i) === 'x' ? INNER_LANGUAGE_ID : OUTER_LANGUAGE_ID);
                            const encodedLanguageId = languageIdCodec.encodeLanguageId(languageId);
                            if (prevLanguageId !== languageId) {
                                tokensArr.push(i);
                                tokensArr.push((encodedLanguageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */));
                            }
                            prevLanguageId = languageId;
                        }
                        const tokens = new Uint32Array(tokensArr.length);
                        for (let i = 0; i < tokens.length; i++) {
                            tokens[i] = tokensArr[i];
                        }
                        return new languages_1.$6s(tokens, state);
                    }
                }));
            }
        };
        OuterMode = __decorate([
            __param(0, language_1.$ct),
            __param(1, languageConfigurationRegistry_1.$2t)
        ], OuterMode);
        let InnerMode = class InnerMode extends lifecycle_1.$kc {
            constructor(languageService, languageConfigurationService) {
                super();
                this.languageId = INNER_LANGUAGE_ID;
                this.B(languageService.registerLanguage({ id: this.languageId }));
                this.B(languageConfigurationService.register(this.languageId, {}));
            }
        };
        InnerMode = __decorate([
            __param(0, language_1.$ct),
            __param(1, languageConfigurationRegistry_1.$2t)
        ], InnerMode);
        let disposables = [];
        setup(() => {
            disposables = [];
        });
        teardown(() => {
            (0, lifecycle_1.$fc)(disposables);
            disposables = [];
        });
        (0, utils_1.$bT)();
        test('Get word at position', () => {
            const text = ['This text has some  words. '];
            const thisModel = (0, testTextModel_1.$O0b)(text.join('\n'));
            disposables.push(thisModel);
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 1)), { word: 'This', startColumn: 1, endColumn: 5 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 2)), { word: 'This', startColumn: 1, endColumn: 5 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 4)), { word: 'This', startColumn: 1, endColumn: 5 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 5)), { word: 'This', startColumn: 1, endColumn: 5 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 6)), { word: 'text', startColumn: 6, endColumn: 10 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 19)), { word: 'some', startColumn: 15, endColumn: 19 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 20)), null);
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 21)), { word: 'words', startColumn: 21, endColumn: 26 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 26)), { word: 'words', startColumn: 21, endColumn: 26 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 27)), null);
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 28)), null);
        });
        test('getWordAtPosition at embedded language boundaries', () => {
            const disposables = new lifecycle_1.$jc();
            const instantiationService = (0, testTextModel_1.$Q0b)(disposables);
            const outerMode = disposables.add(instantiationService.createInstance(OuterMode));
            disposables.add(instantiationService.createInstance(InnerMode));
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, 'ab<xx>ab<x>', outerMode.languageId));
            assert.deepStrictEqual(model.getWordAtPosition(new position_1.$js(1, 1)), { word: 'ab', startColumn: 1, endColumn: 3 });
            assert.deepStrictEqual(model.getWordAtPosition(new position_1.$js(1, 2)), { word: 'ab', startColumn: 1, endColumn: 3 });
            assert.deepStrictEqual(model.getWordAtPosition(new position_1.$js(1, 3)), { word: 'ab', startColumn: 1, endColumn: 3 });
            assert.deepStrictEqual(model.getWordAtPosition(new position_1.$js(1, 4)), { word: 'xx', startColumn: 4, endColumn: 6 });
            assert.deepStrictEqual(model.getWordAtPosition(new position_1.$js(1, 5)), { word: 'xx', startColumn: 4, endColumn: 6 });
            assert.deepStrictEqual(model.getWordAtPosition(new position_1.$js(1, 6)), { word: 'xx', startColumn: 4, endColumn: 6 });
            assert.deepStrictEqual(model.getWordAtPosition(new position_1.$js(1, 7)), { word: 'ab', startColumn: 7, endColumn: 9 });
            disposables.dispose();
        });
        test('issue #61296: VS code freezes when editing CSS file with emoji', () => {
            const MODE_ID = 'testMode';
            const disposables = new lifecycle_1.$jc();
            const instantiationService = (0, testTextModel_1.$Q0b)(disposables);
            const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
            const languageService = instantiationService.get(language_1.$ct);
            disposables.add(languageService.registerLanguage({ id: MODE_ID }));
            disposables.add(languageConfigurationService.register(MODE_ID, {
                wordPattern: /(#?-?\d*\.\d\w*%?)|(::?[\w-]*(?=[^,{;]*[,{]))|(([@#.!])?[\w-?]+%?|[@#!.])/g
            }));
            const thisModel = disposables.add((0, testTextModel_1.$P0b)(instantiationService, '.🐷-a-b', MODE_ID));
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 1)), { word: '.', startColumn: 1, endColumn: 2 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 2)), { word: '.', startColumn: 1, endColumn: 2 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 3)), null);
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 4)), { word: '-a-b', startColumn: 4, endColumn: 8 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 5)), { word: '-a-b', startColumn: 4, endColumn: 8 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 6)), { word: '-a-b', startColumn: 4, endColumn: 8 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 7)), { word: '-a-b', startColumn: 4, endColumn: 8 });
            assert.deepStrictEqual(thisModel.getWordAtPosition(new position_1.$js(1, 8)), { word: '-a-b', startColumn: 4, endColumn: 8 });
            disposables.dispose();
        });
    });
});
//# sourceMappingURL=model.test.js.map