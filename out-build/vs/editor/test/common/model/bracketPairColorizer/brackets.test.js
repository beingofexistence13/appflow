/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/brackets", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet", "vs/editor/test/common/modes/testLanguageConfigurationService"], function (require, exports, assert, lifecycle_1, utils_1, brackets_1, smallImmutableSet_1, testLanguageConfigurationService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Bracket Pair Colorizer - Brackets', () => {
        (0, utils_1.$bT)();
        test('Basic', () => {
            const languageId = 'testMode1';
            const denseKeyProvider = new smallImmutableSet_1.$Nt();
            const getImmutableSet = (elements) => {
                let newSet = smallImmutableSet_1.$Lt.getEmpty();
                elements.forEach(x => newSet = newSet.add(`${languageId}:::${x}`, denseKeyProvider));
                return newSet;
            };
            const getKey = (value) => {
                return denseKeyProvider.getKey(`${languageId}:::${value}`);
            };
            const disposableStore = new lifecycle_1.$jc();
            const languageConfigService = disposableStore.add(new testLanguageConfigurationService_1.$D0b());
            disposableStore.add(languageConfigService.register(languageId, {
                brackets: [
                    ['{', '}'], ['[', ']'], ['(', ')'],
                    ['begin', 'end'], ['case', 'endcase'], ['casez', 'endcase'],
                    ['\\left(', '\\right)'], ['\\left(', '\\right.'], ['\\left.', '\\right)'],
                    ['\\left[', '\\right]'], ['\\left[', '\\right.'], ['\\left.', '\\right]'] // LaTeX Brackets
                ]
            }));
            const brackets = new brackets_1.$0t(denseKeyProvider, l => languageConfigService.getLanguageConfiguration(l));
            const bracketsExpected = [
                { text: '{', length: 1, kind: 'OpeningBracket', bracketId: getKey('{'), bracketIds: getImmutableSet(['{']) },
                { text: '[', length: 1, kind: 'OpeningBracket', bracketId: getKey('['), bracketIds: getImmutableSet(['[']) },
                { text: '(', length: 1, kind: 'OpeningBracket', bracketId: getKey('('), bracketIds: getImmutableSet(['(']) },
                { text: 'begin', length: 5, kind: 'OpeningBracket', bracketId: getKey('begin'), bracketIds: getImmutableSet(['begin']) },
                { text: 'case', length: 4, kind: 'OpeningBracket', bracketId: getKey('case'), bracketIds: getImmutableSet(['case']) },
                { text: 'casez', length: 5, kind: 'OpeningBracket', bracketId: getKey('casez'), bracketIds: getImmutableSet(['casez']) },
                { text: '\\left(', length: 6, kind: 'OpeningBracket', bracketId: getKey('\\left('), bracketIds: getImmutableSet(['\\left(']) },
                { text: '\\left.', length: 6, kind: 'OpeningBracket', bracketId: getKey('\\left.'), bracketIds: getImmutableSet(['\\left.']) },
                { text: '\\left[', length: 6, kind: 'OpeningBracket', bracketId: getKey('\\left['), bracketIds: getImmutableSet(['\\left[']) },
                { text: '}', length: 1, kind: 'ClosingBracket', bracketId: getKey('{'), bracketIds: getImmutableSet(['{']) },
                { text: ']', length: 1, kind: 'ClosingBracket', bracketId: getKey('['), bracketIds: getImmutableSet(['[']) },
                { text: ')', length: 1, kind: 'ClosingBracket', bracketId: getKey('('), bracketIds: getImmutableSet(['(']) },
                { text: 'end', length: 3, kind: 'ClosingBracket', bracketId: getKey('begin'), bracketIds: getImmutableSet(['begin']) },
                { text: 'endcase', length: 7, kind: 'ClosingBracket', bracketId: getKey('case'), bracketIds: getImmutableSet(['case', 'casez']) },
                { text: '\\right)', length: 7, kind: 'ClosingBracket', bracketId: getKey('\\left('), bracketIds: getImmutableSet(['\\left(', '\\left.']) },
                { text: '\\right.', length: 7, kind: 'ClosingBracket', bracketId: getKey('\\left('), bracketIds: getImmutableSet(['\\left(', '\\left[']) },
                { text: '\\right]', length: 7, kind: 'ClosingBracket', bracketId: getKey('\\left['), bracketIds: getImmutableSet(['\\left[', '\\left.']) }
            ];
            const bracketsActual = bracketsExpected.map(x => tokenToObject(brackets.getToken(x.text, languageId), x.text));
            assert.deepStrictEqual(bracketsActual, bracketsExpected);
            disposableStore.dispose();
        });
    });
    function tokenToObject(token, text) {
        if (token === undefined) {
            return undefined;
        }
        return {
            text: text,
            length: token.length,
            bracketId: token.bracketId,
            bracketIds: token.bracketIds,
            kind: {
                [2 /* TokenKind.ClosingBracket */]: 'ClosingBracket',
                [1 /* TokenKind.OpeningBracket */]: 'OpeningBracket',
                [0 /* TokenKind.Text */]: 'Text',
            }[token.kind],
        };
    }
});
//# sourceMappingURL=brackets.test.js.map