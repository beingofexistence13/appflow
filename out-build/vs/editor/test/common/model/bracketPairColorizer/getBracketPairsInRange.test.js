/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/test/common/model/bracketPairColorizer/tokenizer.test", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, utils_1, position_1, range_1, languages_1, language_1, languageConfigurationRegistry_1, tokenizer_test_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Bracket Pair Colorizer - getBracketPairsInRange', () => {
        (0, utils_1.$bT)();
        function createTextModelWithColorizedBracketPairs(store, text) {
            const languageId = 'testLanguage';
            const instantiationService = (0, testTextModel_1.$Q0b)(store);
            const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
            const languageService = instantiationService.get(language_1.$ct);
            store.add(languageService.registerLanguage({
                id: languageId,
            }));
            const encodedMode1 = languageService.languageIdCodec.encodeLanguageId(languageId);
            const document = new tokenizer_test_1.$o$b([
                new tokenizer_test_1.$p$b(text, encodedMode1, 0 /* StandardTokenType.Other */, true)
            ]);
            store.add(languages_1.$bt.register(languageId, document.getTokenizationSupport()));
            store.add(languageConfigurationService.register(languageId, {
                brackets: [
                    ['<', '>']
                ],
                colorizedBracketPairs: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')'],
                ]
            }));
            const textModel = store.add((0, testTextModel_1.$P0b)(instantiationService, text, languageId));
            return textModel;
        }
        test('Basic 1', () => {
            (0, lifecycle_1.$rc)(store => {
                const doc = new AnnotatedDocument(`{ ( [] ¹ ) [ ² { } ] () } []`);
                const model = createTextModelWithColorizedBracketPairs(store, doc.text);
                model.tokenization.getLineTokens(1).getLanguageId(0);
                assert.deepStrictEqual(model.bracketPairs
                    .getBracketPairsInRange(doc.range(1, 2))
                    .map(bracketPairToJSON)
                    .toArray(), [
                    {
                        level: 0,
                        range: '[1,1 -> 1,2]',
                        openRange: '[1,1 -> 1,2]',
                        closeRange: '[1,23 -> 1,24]',
                    },
                    {
                        level: 1,
                        range: '[1,3 -> 1,4]',
                        openRange: '[1,3 -> 1,4]',
                        closeRange: '[1,9 -> 1,10]',
                    },
                    {
                        level: 1,
                        range: '[1,11 -> 1,12]',
                        openRange: '[1,11 -> 1,12]',
                        closeRange: '[1,18 -> 1,19]',
                    },
                ]);
            });
        });
        test('Basic 2', () => {
            (0, lifecycle_1.$rc)(store => {
                const doc = new AnnotatedDocument(`{ ( [] ¹ ²) [  { } ] () } []`);
                const model = createTextModelWithColorizedBracketPairs(store, doc.text);
                assert.deepStrictEqual(model.bracketPairs
                    .getBracketPairsInRange(doc.range(1, 2))
                    .map(bracketPairToJSON)
                    .toArray(), [
                    {
                        level: 0,
                        range: '[1,1 -> 1,2]',
                        openRange: '[1,1 -> 1,2]',
                        closeRange: '[1,23 -> 1,24]',
                    },
                    {
                        level: 1,
                        range: '[1,3 -> 1,4]',
                        openRange: '[1,3 -> 1,4]',
                        closeRange: '[1,9 -> 1,10]',
                    },
                ]);
            });
        });
        test('Basic Empty', () => {
            (0, lifecycle_1.$rc)(store => {
                const doc = new AnnotatedDocument(`¹ ² { ( [] ) [  { } ] () } []`);
                const model = createTextModelWithColorizedBracketPairs(store, doc.text);
                assert.deepStrictEqual(model.bracketPairs
                    .getBracketPairsInRange(doc.range(1, 2))
                    .map(bracketPairToJSON)
                    .toArray(), []);
            });
        });
        test('Basic All', () => {
            (0, lifecycle_1.$rc)(store => {
                const doc = new AnnotatedDocument(`¹ { ( [] ) [  { } ] () } [] ²`);
                const model = createTextModelWithColorizedBracketPairs(store, doc.text);
                assert.deepStrictEqual(model.bracketPairs
                    .getBracketPairsInRange(doc.range(1, 2))
                    .map(bracketPairToJSON)
                    .toArray(), [
                    {
                        level: 0,
                        range: '[1,2 -> 1,3]',
                        openRange: '[1,2 -> 1,3]',
                        closeRange: '[1,23 -> 1,24]',
                    },
                    {
                        level: 1,
                        range: '[1,4 -> 1,5]',
                        openRange: '[1,4 -> 1,5]',
                        closeRange: '[1,9 -> 1,10]',
                    },
                    {
                        level: 2,
                        range: '[1,6 -> 1,7]',
                        openRange: '[1,6 -> 1,7]',
                        closeRange: '[1,7 -> 1,8]',
                    },
                    {
                        level: 1,
                        range: '[1,11 -> 1,12]',
                        openRange: '[1,11 -> 1,12]',
                        closeRange: '[1,18 -> 1,19]',
                    },
                    {
                        level: 2,
                        range: '[1,14 -> 1,15]',
                        openRange: '[1,14 -> 1,15]',
                        closeRange: '[1,16 -> 1,17]',
                    },
                    {
                        level: 1,
                        range: '[1,20 -> 1,21]',
                        openRange: '[1,20 -> 1,21]',
                        closeRange: '[1,21 -> 1,22]',
                    },
                    {
                        level: 0,
                        range: '[1,25 -> 1,26]',
                        openRange: '[1,25 -> 1,26]',
                        closeRange: '[1,26 -> 1,27]',
                    },
                ]);
            });
        });
        test('getBracketsInRange', () => {
            (0, lifecycle_1.$rc)(store => {
                const doc = new AnnotatedDocument(`¹ { [ ( [ [ (  ) ] ] ) ] } { } ²`);
                const model = createTextModelWithColorizedBracketPairs(store, doc.text);
                assert.deepStrictEqual(model.bracketPairs
                    .getBracketsInRange(doc.range(1, 2))
                    .map(b => ({ level: b.nestingLevel, levelEqualBracketType: b.nestingLevelOfEqualBracketType, range: b.range.toString() }))
                    .toArray(), [
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,2 -> 1,3]"
                    },
                    {
                        level: 1,
                        levelEqualBracketType: 0,
                        range: "[1,4 -> 1,5]"
                    },
                    {
                        level: 2,
                        levelEqualBracketType: 0,
                        range: "[1,6 -> 1,7]"
                    },
                    {
                        level: 3,
                        levelEqualBracketType: 1,
                        range: "[1,8 -> 1,9]"
                    },
                    {
                        level: 4,
                        levelEqualBracketType: 2,
                        range: "[1,10 -> 1,11]"
                    },
                    {
                        level: 5,
                        levelEqualBracketType: 1,
                        range: "[1,12 -> 1,13]"
                    },
                    {
                        level: 5,
                        levelEqualBracketType: 1,
                        range: "[1,15 -> 1,16]"
                    },
                    {
                        level: 4,
                        levelEqualBracketType: 2,
                        range: "[1,17 -> 1,18]"
                    },
                    {
                        level: 3,
                        levelEqualBracketType: 1,
                        range: "[1,19 -> 1,20]"
                    },
                    {
                        level: 2,
                        levelEqualBracketType: 0,
                        range: "[1,21 -> 1,22]"
                    },
                    {
                        level: 1,
                        levelEqualBracketType: 0,
                        range: "[1,23 -> 1,24]"
                    },
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,25 -> 1,26]"
                    },
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,27 -> 1,28]"
                    },
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,29 -> 1,30]"
                    },
                ]);
            });
        });
        test('Test Error Brackets', () => {
            (0, lifecycle_1.$rc)(store => {
                const doc = new AnnotatedDocument(`¹ { () ] ² `);
                const model = createTextModelWithColorizedBracketPairs(store, doc.text);
                assert.deepStrictEqual(model.bracketPairs
                    .getBracketsInRange(doc.range(1, 2))
                    .map(b => ({ level: b.nestingLevel, range: b.range.toString(), isInvalid: b.isInvalid }))
                    .toArray(), [
                    {
                        level: 0,
                        isInvalid: true,
                        range: "[1,2 -> 1,3]",
                    },
                    {
                        level: 1,
                        isInvalid: false,
                        range: "[1,4 -> 1,5]",
                    },
                    {
                        level: 1,
                        isInvalid: false,
                        range: "[1,5 -> 1,6]",
                    },
                    {
                        level: 0,
                        isInvalid: true,
                        range: "[1,7 -> 1,8]"
                    }
                ]);
            });
        });
        test('colorizedBracketsVSBrackets', () => {
            (0, lifecycle_1.$rc)(store => {
                const doc = new AnnotatedDocument(`¹ {} [<()>] <{>} ²`);
                const model = createTextModelWithColorizedBracketPairs(store, doc.text);
                assert.deepStrictEqual(model.bracketPairs
                    .getBracketsInRange(doc.range(1, 2), true)
                    .map(b => ({ level: b.nestingLevel, levelEqualBracketType: b.nestingLevelOfEqualBracketType, range: b.range.toString() }))
                    .toArray(), [
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,2 -> 1,3]",
                    },
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,3 -> 1,4]",
                    },
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,5 -> 1,6]",
                    },
                    {
                        level: 1,
                        levelEqualBracketType: 0,
                        range: "[1,7 -> 1,8]",
                    },
                    {
                        level: 1,
                        levelEqualBracketType: 0,
                        range: "[1,8 -> 1,9]",
                    },
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,10 -> 1,11]",
                    },
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,13 -> 1,14]",
                    },
                    {
                        level: -1,
                        levelEqualBracketType: 0,
                        range: "[1,15 -> 1,16]",
                    },
                ]);
                assert.deepStrictEqual(model.bracketPairs
                    .getBracketsInRange(doc.range(1, 2), false)
                    .map(b => ({ level: b.nestingLevel, levelEqualBracketType: b.nestingLevelOfEqualBracketType, range: b.range.toString() }))
                    .toArray(), [
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,2 -> 1,3]",
                    },
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,3 -> 1,4]",
                    },
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,5 -> 1,6]",
                    },
                    {
                        level: 1,
                        levelEqualBracketType: 0,
                        range: "[1,6 -> 1,7]",
                    },
                    {
                        level: 2,
                        levelEqualBracketType: 0,
                        range: "[1,7 -> 1,8]",
                    },
                    {
                        level: 2,
                        levelEqualBracketType: 0,
                        range: "[1,8 -> 1,9]",
                    },
                    {
                        level: 1,
                        levelEqualBracketType: 0,
                        range: "[1,9 -> 1,10]",
                    },
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,10 -> 1,11]",
                    },
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,12 -> 1,13]",
                    },
                    {
                        level: 1,
                        levelEqualBracketType: 0,
                        range: "[1,13 -> 1,14]",
                    },
                    {
                        level: 0,
                        levelEqualBracketType: 0,
                        range: "[1,14 -> 1,15]",
                    },
                    {
                        level: -1,
                        levelEqualBracketType: 0,
                        range: "[1,15 -> 1,16]",
                    },
                ]);
            });
        });
    });
    function bracketPairToJSON(pair) {
        return {
            level: pair.nestingLevel,
            range: pair.openingBracketRange.toString(),
            openRange: pair.openingBracketRange.toString(),
            closeRange: pair.closingBracketRange?.toString() || null,
        };
    }
    class PositionOffsetTransformer {
        constructor(text) {
            this.a = [];
            this.a.push(0);
            for (let i = 0; i < text.length; i++) {
                if (text.charAt(i) === '\n') {
                    this.a.push(i + 1);
                }
            }
        }
        getOffset(position) {
            return this.a[position.lineNumber - 1] + position.column - 1;
        }
        getPosition(offset) {
            const lineNumber = this.a.findIndex(lineStartOffset => lineStartOffset <= offset);
            return new position_1.$js(lineNumber + 1, offset - this.a[lineNumber] + 1);
        }
    }
    class AnnotatedDocument {
        constructor(src) {
            const numbers = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
            let text = '';
            const offsetPositions = new Map();
            let offset = 0;
            for (let i = 0; i < src.length; i++) {
                const idx = numbers.indexOf(src[i]);
                if (idx >= 0) {
                    offsetPositions.set(idx, offset);
                }
                else {
                    text += src[i];
                    offset++;
                }
            }
            this.text = text;
            const mapper = new PositionOffsetTransformer(this.text);
            const positions = new Map();
            for (const [idx, offset] of offsetPositions.entries()) {
                positions.set(idx, mapper.getPosition(offset));
            }
            this.a = positions;
        }
        range(start, end) {
            return range_1.$ks.fromPositions(this.a.get(start), this.a.get(end));
        }
    }
});
//# sourceMappingURL=getBracketPairsInRange.test.js.map