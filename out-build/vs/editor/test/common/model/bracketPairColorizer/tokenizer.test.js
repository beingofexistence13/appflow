/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/brackets", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, utils_1, languages_1, language_1, languageConfigurationRegistry_1, brackets_1, length_1, smallImmutableSet_1, tokenizer_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$p$b = exports.$o$b = void 0;
    suite('Bracket Pair Colorizer - Tokenizer', () => {
        (0, utils_1.$bT)();
        test('Basic', () => {
            const mode1 = 'testMode1';
            const disposableStore = new lifecycle_1.$jc();
            const instantiationService = (0, testTextModel_1.$Q0b)(disposableStore);
            const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
            const languageService = instantiationService.get(language_1.$ct);
            disposableStore.add(languageService.registerLanguage({ id: mode1 }));
            const encodedMode1 = languageService.languageIdCodec.encodeLanguageId(mode1);
            const denseKeyProvider = new smallImmutableSet_1.$Nt();
            const tStandard = (text) => new $p$b(text, encodedMode1, 0 /* StandardTokenType.Other */, true);
            const tComment = (text) => new $p$b(text, encodedMode1, 1 /* StandardTokenType.Comment */, true);
            const document = new $o$b([
                tStandard(' { } '), tStandard('be'), tStandard('gin end'), tStandard('\n'),
                tStandard('hello'), tComment('{'), tStandard('}'),
            ]);
            disposableStore.add(languages_1.$bt.register(mode1, document.getTokenizationSupport()));
            disposableStore.add(languageConfigurationService.register(mode1, {
                brackets: [['{', '}'], ['[', ']'], ['(', ')'], ['begin', 'end']],
            }));
            const model = disposableStore.add((0, testTextModel_1.$P0b)(instantiationService, document.getText(), mode1));
            model.tokenization.forceTokenization(model.getLineCount());
            const brackets = new brackets_1.$0t(denseKeyProvider, l => languageConfigurationService.getLanguageConfiguration(l));
            const tokens = readAllTokens(new tokenizer_1.$_t(model, brackets));
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
        let offset = length_1.$pt;
        for (const token of tokens) {
            result.push(tokenToObj(token, offset, model, keyProvider));
            offset = (0, length_1.$vt)(offset, token.length);
        }
        return result;
    }
    function tokenToObj(token, offset, model, keyProvider) {
        return {
            text: model.getValueInRange((0, length_1.$Et)(offset, (0, length_1.$vt)(offset, token.length))),
            bracketId: keyProvider.reverseLookup(token.bracketId) || null,
            bracketIds: keyProvider.reverseLookupSet(token.bracketIds),
            kind: {
                [2 /* TokenKind.ClosingBracket */]: 'ClosingBracket',
                [1 /* TokenKind.OpeningBracket */]: 'OpeningBracket',
                [0 /* TokenKind.Text */]: 'Text',
            }[token.kind]
        };
    }
    class $o$b {
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
            this.a = tokensByLine;
        }
        getText() {
            return this.a.map(t => t.map(t => t.text).join('')).join('\n');
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
                    const tokens = this.a[state2.lineNumber];
                    const arr = new Array();
                    let offset = 0;
                    for (const t of tokens) {
                        arr.push(offset, t.getMetadata());
                        offset += t.text.length;
                    }
                    return new languages_1.$6s(new Uint32Array(arr), new State(state2.lineNumber + 1));
                }
            };
        }
    }
    exports.$o$b = $o$b;
    class $p$b {
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
            return new $p$b(text, this.languageId, this.tokenType, this.hasBalancedBrackets);
        }
    }
    exports.$p$b = $p$b;
});
//# sourceMappingURL=tokenizer.test.js.map