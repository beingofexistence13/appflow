/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/brackets", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, utils_1, languages_1, language_1, languageConfigurationRegistry_1, brackets_1, length_1, smallImmutableSet_1, tokenizer_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenInfo = exports.TokenizedDocument = void 0;
    suite('Bracket Pair Colorizer - Tokenizer', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Basic', () => {
            const mode1 = 'testMode1';
            const disposableStore = new lifecycle_1.DisposableStore();
            const instantiationService = (0, testTextModel_1.createModelServices)(disposableStore);
            const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
            const languageService = instantiationService.get(language_1.ILanguageService);
            disposableStore.add(languageService.registerLanguage({ id: mode1 }));
            const encodedMode1 = languageService.languageIdCodec.encodeLanguageId(mode1);
            const denseKeyProvider = new smallImmutableSet_1.DenseKeyProvider();
            const tStandard = (text) => new TokenInfo(text, encodedMode1, 0 /* StandardTokenType.Other */, true);
            const tComment = (text) => new TokenInfo(text, encodedMode1, 1 /* StandardTokenType.Comment */, true);
            const document = new TokenizedDocument([
                tStandard(' { } '), tStandard('be'), tStandard('gin end'), tStandard('\n'),
                tStandard('hello'), tComment('{'), tStandard('}'),
            ]);
            disposableStore.add(languages_1.TokenizationRegistry.register(mode1, document.getTokenizationSupport()));
            disposableStore.add(languageConfigurationService.register(mode1, {
                brackets: [['{', '}'], ['[', ']'], ['(', ')'], ['begin', 'end']],
            }));
            const model = disposableStore.add((0, testTextModel_1.instantiateTextModel)(instantiationService, document.getText(), mode1));
            model.tokenization.forceTokenization(model.getLineCount());
            const brackets = new brackets_1.LanguageAgnosticBracketTokens(denseKeyProvider, l => languageConfigurationService.getLanguageConfiguration(l));
            const tokens = readAllTokens(new tokenizer_1.TextBufferTokenizer(model, brackets));
            assert.deepStrictEqual(toArr(tokens, model, denseKeyProvider), [
                { text: ' ', bracketId: null, bracketIds: [], kind: 'Text' },
                {
                    text: '{',
                    bracketId: 'testMode1:::{',
                    bracketIds: ['testMode1:::{'],
                    kind: 'OpeningBracket',
                },
                { text: ' ', bracketId: null, bracketIds: [], kind: 'Text' },
                {
                    text: '}',
                    bracketId: 'testMode1:::{',
                    bracketIds: ['testMode1:::{'],
                    kind: 'ClosingBracket',
                },
                { text: ' ', bracketId: null, bracketIds: [], kind: 'Text' },
                {
                    text: 'begin',
                    bracketId: 'testMode1:::begin',
                    bracketIds: ['testMode1:::begin'],
                    kind: 'OpeningBracket',
                },
                { text: ' ', bracketId: null, bracketIds: [], kind: 'Text' },
                {
                    text: 'end',
                    bracketId: 'testMode1:::begin',
                    bracketIds: ['testMode1:::begin'],
                    kind: 'ClosingBracket',
                },
                { text: '\nhello{', bracketId: null, bracketIds: [], kind: 'Text' },
                {
                    text: '}',
                    bracketId: 'testMode1:::{',
                    bracketIds: ['testMode1:::{'],
                    kind: 'ClosingBracket',
                },
            ]);
            disposableStore.dispose();
        });
    });
    function readAllTokens(tokenizer) {
        const tokens = new Array();
        while (true) {
            const token = tokenizer.read();
            if (!token) {
                break;
            }
            tokens.push(token);
        }
        return tokens;
    }
    function toArr(tokens, model, keyProvider) {
        const result = new Array();
        let offset = length_1.lengthZero;
        for (const token of tokens) {
            result.push(tokenToObj(token, offset, model, keyProvider));
            offset = (0, length_1.lengthAdd)(offset, token.length);
        }
        return result;
    }
    function tokenToObj(token, offset, model, keyProvider) {
        return {
            text: model.getValueInRange((0, length_1.lengthsToRange)(offset, (0, length_1.lengthAdd)(offset, token.length))),
            bracketId: keyProvider.reverseLookup(token.bracketId) || null,
            bracketIds: keyProvider.reverseLookupSet(token.bracketIds),
            kind: {
                [2 /* TokenKind.ClosingBracket */]: 'ClosingBracket',
                [1 /* TokenKind.OpeningBracket */]: 'OpeningBracket',
                [0 /* TokenKind.Text */]: 'Text',
            }[token.kind]
        };
    }
    class TokenizedDocument {
        constructor(tokens) {
            const tokensByLine = new Array();
            let curLine = new Array();
            for (const token of tokens) {
                const lines = token.text.split('\n');
                let first = true;
                while (lines.length > 0) {
                    if (!first) {
                        tokensByLine.push(curLine);
                        curLine = new Array();
                    }
                    else {
                        first = false;
                    }
                    if (lines[0].length > 0) {
                        curLine.push(token.withText(lines[0]));
                    }
                    lines.pop();
                }
            }
            tokensByLine.push(curLine);
            this.tokensByLine = tokensByLine;
        }
        getText() {
            return this.tokensByLine.map(t => t.map(t => t.text).join('')).join('\n');
        }
        getTokenizationSupport() {
            class State {
                constructor(lineNumber) {
                    this.lineNumber = lineNumber;
                }
                clone() {
                    return new State(this.lineNumber);
                }
                equals(other) {
                    return this.lineNumber === other.lineNumber;
                }
            }
            return {
                getInitialState: () => new State(0),
                tokenize: () => { throw new Error('Method not implemented.'); },
                tokenizeEncoded: (line, hasEOL, state) => {
                    const state2 = state;
                    const tokens = this.tokensByLine[state2.lineNumber];
                    const arr = new Array();
                    let offset = 0;
                    for (const t of tokens) {
                        arr.push(offset, t.getMetadata());
                        offset += t.text.length;
                    }
                    return new languages_1.EncodedTokenizationResult(new Uint32Array(arr), new State(state2.lineNumber + 1));
                }
            };
        }
    }
    exports.TokenizedDocument = TokenizedDocument;
    class TokenInfo {
        constructor(text, languageId, tokenType, hasBalancedBrackets) {
            this.text = text;
            this.languageId = languageId;
            this.tokenType = tokenType;
            this.hasBalancedBrackets = hasBalancedBrackets;
        }
        getMetadata() {
            return ((((this.languageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */) |
                (this.tokenType << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)) >>>
                0) |
                (this.hasBalancedBrackets ? 1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */ : 0));
        }
        withText(text) {
            return new TokenInfo(text, this.languageId, this.tokenType, this.hasBalancedBrackets);
        }
    }
    exports.TokenInfo = TokenInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5pemVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vbW9kZWwvYnJhY2tldFBhaXJDb2xvcml6ZXIvdG9rZW5pemVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JoRyxLQUFLLENBQUMsb0NBQW9DLEVBQUUsR0FBRyxFQUFFO1FBRWhELElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUNsQixNQUFNLEtBQUssR0FBRyxXQUFXLENBQUM7WUFDMUIsTUFBTSxlQUFlLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDOUMsTUFBTSxvQkFBb0IsR0FBRyxJQUFBLG1DQUFtQixFQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sNEJBQTRCLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLDZEQUE2QixDQUFDLENBQUM7WUFDN0YsTUFBTSxlQUFlLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7WUFDbkUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFN0UsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9DQUFnQixFQUFVLENBQUM7WUFFeEQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksU0FBUyxDQUFDLElBQUksRUFBRSxZQUFZLG1DQUEyQixJQUFJLENBQUMsQ0FBQztZQUNyRyxNQUFNLFFBQVEsR0FBRyxDQUFDLElBQVksRUFBRSxFQUFF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