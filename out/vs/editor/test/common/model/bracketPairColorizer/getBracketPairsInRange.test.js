/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/test/common/model/bracketPairColorizer/tokenizer.test", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, utils_1, position_1, range_1, languages_1, language_1, languageConfigurationRegistry_1, tokenizer_test_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Bracket Pair Colorizer - getBracketPairsInRange', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function createTextModelWithColorizedBracketPairs(store, text) {
            const languageId = 'testLanguage';
            const instantiationService = (0, testTextModel_1.createModelServices)(store);
            const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
            const languageService = instantiationService.get(language_1.ILanguageService);
            store.add(languageService.registerLanguage({
                id: languageId,
            }));
            const encodedMode1 = languageService.languageIdCodec.encodeLanguageId(languageId);
            const document = new tokenizer_test_1.TokenizedDocument([
                new tokenizer_test_1.TokenInfo(text, encodedMode1, 0 /* StandardTokenType.Other */, true)
            ]);
            store.add(languages_1.TokenizationRegistry.register(languageId, document.getTokenizationSupport()));
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
            const textModel = store.add((0, testTextModel_1.instantiateTextModel)(instantiationService, text, languageId));
            return textModel;
        }
        test('Basic 1', () => {
            (0, lifecycle_1.disposeOnReturn)(store => {
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
            (0, lifecycle_1.disposeOnReturn)(store => {
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
            (0, lifecycle_1.disposeOnReturn)(store => {
                const doc = new AnnotatedDocument(`¹ ² { ( [] ) [  { } ] () } []`);
                const model = createTextModelWithColorizedBracketPairs(store, doc.text);
                assert.deepStrictEqual(model.bracketPairs
                    .getBracketPairsInRange(doc.range(1, 2))
                    .map(bracketPairToJSON)
                    .toArray(), []);
            });
        });
        test('Basic All', () => {
            (0, lifecycle_1.disposeOnReturn)(store => {
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
            (0, lifecycle_1.disposeOnReturn)(store => {
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
            (0, lifecycle_1.disposeOnReturn)(store => {
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
            (0, lifecycle_1.disposeOnReturn)(store => {
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
            this.lineStartOffsetByLineIdx = [];
            this.lineStartOffsetByLineIdx.push(0);
            for (let i = 0; i < text.length; i++) {
                if (text.charAt(i) === '\n') {
                    this.lineStartOffsetByLineIdx.push(i + 1);
                }
            }
        }
        getOffset(position) {
            return this.lineStartOffsetByLineIdx[position.lineNumber - 1] + position.column - 1;
        }
        getPosition(offset) {
            const lineNumber = this.lineStartOffsetByLineIdx.findIndex(lineStartOffset => lineStartOffset <= offset);
            return new position_1.Position(lineNumber + 1, offset - this.lineStartOffsetByLineIdx[lineNumber] + 1);
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
            this.positions = positions;
        }
        range(start, end) {
            return range_1.Range.fromPositions(this.positions.get(start), this.positions.get(end));
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0QnJhY2tldFBhaXJzSW5SYW5nZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvY29tbW9uL21vZGVsL2JyYWNrZXRQYWlyQ29sb3JpemVyL2dldEJyYWNrZXRQYWlyc0luUmFuZ2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWdCaEcsS0FBSyxDQUFDLGlEQUFpRCxFQUFFLEdBQUcsRUFBRTtRQUU3RCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsU0FBUyx3Q0FBd0MsQ0FBQyxLQUFzQixFQUFFLElBQVk7WUFDckYsTUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDO1lBQ2xDLE1BQU0sb0JBQW9CLEdBQUcsSUFBQSxtQ0FBbUIsRUFBQyxLQUFLLENBQUMsQ0FBQztZQUN4RCxNQUFNLDRCQUE0QixHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyw2REFBNkIsQ0FBQyxDQUFDO1lBQzdGLE1BQU0sZUFBZSxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxDQUFDO1lBQ25FLEtBQUssQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDO2dCQUMxQyxFQUFFLEVBQUUsVUFBVTthQUNkLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNsRixNQUFNLFFBQVEsR0FBRyxJQUFJLGtDQUFpQixDQUFDO2dCQUN0QyxJQUFJLDBCQUFTLENBQUMsSUFBSSxFQUFFLFlBQVksbUNBQTJCLElBQUksQ0FBQzthQUNoRSxDQUFDLENBQUM7WUFDSCxLQUFLLENBQUMsR0FBRyxDQUFDLGdDQUFvQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FB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