/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/encodedTokenAttributes", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languagesRegistry", "vs/editor/common/tokens/lineTokens", "vs/editor/common/tokens/sparseMultilineTokens", "vs/editor/common/tokens/sparseTokensStore", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, utils_1, position_1, range_1, encodedTokenAttributes_1, languageConfigurationRegistry_1, languagesRegistry_1, lineTokens_1, sparseMultilineTokens_1, sparseTokensStore_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TokensStore', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const SEMANTIC_COLOR = 5;
        function parseTokensState(state) {
            const text = [];
            const tokens = [];
            let baseLine = 1;
            for (let i = 0; i < state.length; i++) {
                const line = state[i];
                let startOffset = 0;
                let lineText = '';
                while (true) {
                    const firstPipeOffset = line.indexOf('|', startOffset);
                    if (firstPipeOffset === -1) {
                        break;
                    }
                    const secondPipeOffset = line.indexOf('|', firstPipeOffset + 1);
                    if (secondPipeOffset === -1) {
                        break;
                    }
                    if (firstPipeOffset + 1 === secondPipeOffset) {
                        // skip ||
                        lineText += line.substring(startOffset, secondPipeOffset + 1);
                        startOffset = secondPipeOffset + 1;
                        continue;
                    }
                    lineText += line.substring(startOffset, firstPipeOffset);
                    const tokenStartCharacter = lineText.length;
                    const tokenLength = secondPipeOffset - firstPipeOffset - 1;
                    const metadata = (SEMANTIC_COLOR << 15 /* MetadataConsts.FOREGROUND_OFFSET */
                        | 16 /* MetadataConsts.SEMANTIC_USE_FOREGROUND */);
                    if (tokens.length === 0) {
                        baseLine = i + 1;
                    }
                    tokens.push(i + 1 - baseLine, tokenStartCharacter, tokenStartCharacter + tokenLength, metadata);
                    lineText += line.substr(firstPipeOffset + 1, tokenLength);
                    startOffset = secondPipeOffset + 1;
                }
                lineText += line.substring(startOffset);
                text.push(lineText);
            }
            return {
                text: text.join('\n'),
                tokens: sparseMultilineTokens_1.SparseMultilineTokens.create(baseLine, new Uint32Array(tokens))
            };
        }
        function extractState(model) {
            const result = [];
            for (let lineNumber = 1; lineNumber <= model.getLineCount(); lineNumber++) {
                const lineTokens = model.tokenization.getLineTokens(lineNumber);
                const lineContent = model.getLineContent(lineNumber);
                let lineText = '';
                for (let i = 0; i < lineTokens.getCount(); i++) {
                    const tokenStartCharacter = lineTokens.getStartOffset(i);
                    const tokenEndCharacter = lineTokens.getEndOffset(i);
                    const metadata = lineTokens.getMetadata(i);
                    const color = encodedTokenAttributes_1.TokenMetadata.getForeground(metadata);
                    const tokenText = lineContent.substring(tokenStartCharacter, tokenEndCharacter);
                    if (color === SEMANTIC_COLOR) {
                        lineText += `|${tokenText}|`;
                    }
                    else {
                        lineText += tokenText;
                    }
                }
                result.push(lineText);
            }
            return result;
        }
        function testTokensAdjustment(rawInitialState, edits, rawFinalState) {
            const initialState = parseTokensState(rawInitialState);
            const model = (0, testTextModel_1.createTextModel)(initialState.text);
            model.tokenization.setSemanticTokens([initialState.tokens], true);
            model.applyEdits(edits);
            const actualState = extractState(model);
            assert.deepStrictEqual(actualState, rawFinalState);
            model.dispose();
        }
        test('issue #86303 - color shifting between different tokens', () => {
            testTokensAdjustment([
                `import { |URI| } from 'vs/base/common/uri';`,
                `const foo = |URI|.parse('hey');`
            ], [
                { range: new range_1.Range(2, 9, 2, 10), text: '' }
            ], [
                `import { |URI| } from 'vs/base/common/uri';`,
                `const fo = |URI|.parse('hey');`
            ]);
        });
        test('deleting a newline', () => {
            testTokensAdjustment([
                `import { |URI| } from 'vs/base/common/uri';`,
                `const foo = |URI|.parse('hey');`
            ], [
                { range: new range_1.Range(1, 42, 2, 1), text: '' }
            ], [
                `import { |URI| } from 'vs/base/common/uri';const foo = |URI|.parse('hey');`
            ]);
        });
        test('inserting a newline', () => {
            testTokensAdjustment([
                `import { |URI| } from 'vs/base/common/uri';const foo = |URI|.parse('hey');`
            ], [
                { range: new range_1.Range(1, 42, 1, 42), text: '\n' }
            ], [
                `import { |URI| } from 'vs/base/common/uri';`,
                `const foo = |URI|.parse('hey');`
            ]);
        });
        test('deleting a newline 2', () => {
            testTokensAdjustment([
                `import { `,
                `    |URI| } from 'vs/base/common/uri';const foo = |URI|.parse('hey');`
            ], [
                { range: new range_1.Range(1, 10, 2, 5), text: '' }
            ], [
                `import { |URI| } from 'vs/base/common/uri';const foo = |URI|.parse('hey');`
            ]);
        });
        test('issue #179268: a complex edit', () => {
            testTokensAdjustment([
                `|export| |'interior_material_selector.dart'|;`,
                `|export| |'mileage_selector.dart'|;`,
                `|export| |'owners_selector.dart'|;`,
                `|export| |'price_selector.dart'|;`,
                `|export| |'seat_count_selector.dart'|;`,
                `|export| |'year_selector.dart'|;`,
                `|export| |'winter_options_selector.dart'|;|export| |'camera_selector.dart'|;`
            ], [
                { range: new range_1.Range(1, 9, 1, 9), text: `camera_selector.dart';\nexport '` },
                { range: new range_1.Range(6, 9, 7, 9), text: `` },
                { range: new range_1.Range(7, 39, 7, 39), text: `\n` },
                { range: new range_1.Range(7, 47, 7, 48), text: `ye` },
                { range: new range_1.Range(7, 49, 7, 51), text: `` },
                { range: new range_1.Range(7, 52, 7, 53), text: `` },
            ], [
                `|export| |'|camera_selector.dart';`,
                `export 'interior_material_selector.dart';`,
                `|export| |'mileage_selector.dart'|;`,
                `|export| |'owners_selector.dart'|;`,
                `|export| |'price_selector.dart'|;`,
                `|export| |'seat_count_selector.dart'|;`,
                `|export| |'||winter_options_selector.dart'|;`,
                `|export| |'year_selector.dart'|;`
            ]);
        });
        test('issue #91936: Semantic token color highlighting fails on line with selected text', () => {
            const model = (0, testTextModel_1.createTextModel)('                    else if ($s = 08) then \'\\b\'');
            model.tokenization.setSemanticTokens([
                sparseMultilineTokens_1.SparseMultilineTokens.create(1, new Uint32Array([
                    0, 20, 24, 0b01111000000000010000,
                    0, 25, 27, 0b01111000000000010000,
                    0, 28, 29, 0b00001000000000010000,
                    0, 29, 31, 0b10000000000000010000,
                    0, 32, 33, 0b00001000000000010000,
                    0, 34, 36, 0b00110000000000010000,
                    0, 36, 37, 0b00001000000000010000,
                    0, 38, 42, 0b01111000000000010000,
                    0, 43, 47, 0b01011000000000010000,
                ]))
            ], true);
            const lineTokens = model.tokenization.getLineTokens(1);
            const decodedTokens = [];
            for (let i = 0, len = lineTokens.getCount(); i < len; i++) {
                decodedTokens.push(lineTokens.getEndOffset(i), lineTokens.getMetadata(i));
            }
            assert.deepStrictEqual(decodedTokens, [
                20, 0b10000000001000010000000001,
                24, 0b10000001111000010000000001,
                25, 0b10000000001000010000000001,
                27, 0b10000001111000010000000001,
                28, 0b10000000001000010000000001,
                29, 0b10000000001000010000000001,
                31, 0b10000010000000010000000001,
                32, 0b10000000001000010000000001,
                33, 0b10000000001000010000000001,
                34, 0b10000000001000010000000001,
                36, 0b10000000110000010000000001,
                37, 0b10000000001000010000000001,
                38, 0b10000000001000010000000001,
                42, 0b10000001111000010000000001,
                43, 0b10000000001000010000000001,
                47, 0b10000001011000010000000001
            ]);
            model.dispose();
        });
        test('issue #147944: Language id "vs.editor.nullLanguage" is not configured nor known', () => {
            const disposables = new lifecycle_1.DisposableStore();
            const instantiationService = (0, testTextModel_1.createModelServices)(disposables, [
                [languageConfigurationRegistry_1.ILanguageConfigurationService, languageConfigurationRegistry_1.LanguageConfigurationService]
            ]);
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, '--[[\n\n]]'));
            model.tokenization.setSemanticTokens([
                sparseMultilineTokens_1.SparseMultilineTokens.create(1, new Uint32Array([
                    0, 2, 4, 0b100000000000010000,
                    1, 0, 0, 0b100000000000010000,
                    2, 0, 2, 0b100000000000010000,
                ]))
            ], true);
            assert.strictEqual(model.getWordAtPosition(new position_1.Position(2, 1)), null);
            disposables.dispose();
        });
        test('partial tokens 1', () => {
            const codec = new languagesRegistry_1.LanguageIdCodec();
            const store = new sparseTokensStore_1.SparseTokensStore(codec);
            // setPartial: [1,1 -> 31,2], [(5,5-10),(10,5-10),(15,5-10),(20,5-10),(25,5-10),(30,5-10)]
            store.setPartial(new range_1.Range(1, 1, 31, 2), [
                sparseMultilineTokens_1.SparseMultilineTokens.create(5, new Uint32Array([
                    0, 5, 10, 1,
                    5, 5, 10, 2,
                    10, 5, 10, 3,
                    15, 5, 10, 4,
                    20, 5, 10, 5,
                    25, 5, 10, 6,
                ]))
            ]);
            // setPartial: [18,1 -> 42,1], [(20,5-10),(25,5-10),(30,5-10),(35,5-10),(40,5-10)]
            store.setPartial(new range_1.Range(18, 1, 42, 1), [
                sparseMultilineTokens_1.SparseMultilineTokens.create(20, new Uint32Array([
                    0, 5, 10, 4,
                    5, 5, 10, 5,
                    10, 5, 10, 6,
                    15, 5, 10, 7,
                    20, 5, 10, 8,
                ]))
            ]);
            // setPartial: [1,1 -> 31,2], [(5,5-10),(10,5-10),(15,5-10),(20,5-10),(25,5-10),(30,5-10)]
            store.setPartial(new range_1.Range(1, 1, 31, 2), [
                sparseMultilineTokens_1.SparseMultilineTokens.create(5, new Uint32Array([
                    0, 5, 10, 1,
                    5, 5, 10, 2,
                    10, 5, 10, 3,
                    15, 5, 10, 4,
                    20, 5, 10, 5,
                    25, 5, 10, 6,
                ]))
            ]);
            const lineTokens = store.addSparseTokens(10, new lineTokens_1.LineTokens(new Uint32Array([12, 1]), `enum Enum1 {`, codec));
            assert.strictEqual(lineTokens.getCount(), 3);
        });
        test('partial tokens 2', () => {
            const codec = new languagesRegistry_1.LanguageIdCodec();
            const store = new sparseTokensStore_1.SparseTokensStore(codec);
            // setPartial: [1,1 -> 31,2], [(5,5-10),(10,5-10),(15,5-10),(20,5-10),(25,5-10),(30,5-10)]
            store.setPartial(new range_1.Range(1, 1, 31, 2), [
                sparseMultilineTokens_1.SparseMultilineTokens.create(5, new Uint32Array([
                    0, 5, 10, 1,
                    5, 5, 10, 2,
                    10, 5, 10, 3,
                    15, 5, 10, 4,
                    20, 5, 10, 5,
                    25, 5, 10, 6,
                ]))
            ]);
            // setPartial: [6,1 -> 36,2], [(10,5-10),(15,5-10),(20,5-10),(25,5-10),(30,5-10),(35,5-10)]
            store.setPartial(new range_1.Range(6, 1, 36, 2), [
                sparseMultilineTokens_1.SparseMultilineTokens.create(10, new Uint32Array([
                    0, 5, 10, 2,
                    5, 5, 10, 3,
                    10, 5, 10, 4,
                    15, 5, 10, 5,
                    20, 5, 10, 6,
                ]))
            ]);
            // setPartial: [17,1 -> 42,1], [(20,5-10),(25,5-10),(30,5-10),(35,5-10),(40,5-10)]
            store.setPartial(new range_1.Range(17, 1, 42, 1), [
                sparseMultilineTokens_1.SparseMultilineTokens.create(20, new Uint32Array([
                    0, 5, 10, 4,
                    5, 5, 10, 5,
                    10, 5, 10, 6,
                    15, 5, 10, 7,
                    20, 5, 10, 8,
                ]))
            ]);
            const lineTokens = store.addSparseTokens(20, new lineTokens_1.LineTokens(new Uint32Array([12, 1]), `enum Enum1 {`, codec));
            assert.strictEqual(lineTokens.getCount(), 3);
        });
        test('partial tokens 3', () => {
            const codec = new languagesRegistry_1.LanguageIdCodec();
            const store = new sparseTokensStore_1.SparseTokensStore(codec);
            // setPartial: [1,1 -> 31,2], [(5,5-10),(10,5-10),(15,5-10),(20,5-10),(25,5-10),(30,5-10)]
            store.setPartial(new range_1.Range(1, 1, 31, 2), [
                sparseMultilineTokens_1.SparseMultilineTokens.create(5, new Uint32Array([
                    0, 5, 10, 1,
                    5, 5, 10, 2,
                    10, 5, 10, 3,
                    15, 5, 10, 4,
                    20, 5, 10, 5,
                    25, 5, 10, 6,
                ]))
            ]);
            // setPartial: [11,1 -> 16,2], [(15,5-10),(20,5-10)]
            store.setPartial(new range_1.Range(11, 1, 16, 2), [
                sparseMultilineTokens_1.SparseMultilineTokens.create(10, new Uint32Array([
                    0, 5, 10, 3,
                    5, 5, 10, 4,
                ]))
            ]);
            const lineTokens = store.addSparseTokens(5, new lineTokens_1.LineTokens(new Uint32Array([12, 1]), `enum Enum1 {`, codec));
            assert.strictEqual(lineTokens.getCount(), 3);
        });
        test('issue #94133: Semantic colors stick around when using (only) range provider', () => {
            const codec = new languagesRegistry_1.LanguageIdCodec();
            const store = new sparseTokensStore_1.SparseTokensStore(codec);
            // setPartial: [1,1 -> 1,20] [(1,9-11)]
            store.setPartial(new range_1.Range(1, 1, 1, 20), [
                sparseMultilineTokens_1.SparseMultilineTokens.create(1, new Uint32Array([
                    0, 9, 11, 1,
                ]))
            ]);
            // setPartial: [1,1 -> 1,20], []
            store.setPartial(new range_1.Range(1, 1, 1, 20), []);
            const lineTokens = store.addSparseTokens(1, new lineTokens_1.LineTokens(new Uint32Array([12, 1]), `enum Enum1 {`, codec));
            assert.strictEqual(lineTokens.getCount(), 1);
        });
        test('bug', () => {
            function createTokens(str) {
                str = str.replace(/^\[\(/, '');
                str = str.replace(/\)\]$/, '');
                const strTokens = str.split('),(');
                const result = [];
                let firstLineNumber = 0;
                for (const strToken of strTokens) {
                    const pieces = strToken.split(',');
                    const chars = pieces[1].split('-');
                    const lineNumber = parseInt(pieces[0], 10);
                    const startChar = parseInt(chars[0], 10);
                    const endChar = parseInt(chars[1], 10);
                    if (firstLineNumber === 0) {
                        // this is the first line
                        firstLineNumber = lineNumber;
                    }
                    result.push(lineNumber - firstLineNumber, startChar, endChar, (lineNumber + startChar) % 13);
                }
                return sparseMultilineTokens_1.SparseMultilineTokens.create(firstLineNumber, new Uint32Array(result));
            }
            const codec = new languagesRegistry_1.LanguageIdCodec();
            const store = new sparseTokensStore_1.SparseTokensStore(codec);
            // setPartial [36446,1 -> 36475,115] [(36448,24-29),(36448,33-46),(36448,47-54),(36450,25-35),(36450,36-50),(36451,28-33),(36451,36-49),(36451,50-57),(36452,35-53),(36452,54-62),(36454,33-38),(36454,41-54),(36454,55-60),(36455,35-53),(36455,54-62),(36457,33-44),(36457,45-49),(36457,50-56),(36457,62-83),(36457,84-88),(36458,35-53),(36458,54-62),(36460,33-37),(36460,38-42),(36460,47-57),(36460,58-67),(36461,35-53),(36461,54-62),(36463,34-38),(36463,39-45),(36463,46-51),(36463,54-63),(36463,64-71),(36463,76-80),(36463,81-87),(36463,88-92),(36463,97-107),(36463,108-119),(36464,35-53),(36464,54-62),(36466,33-71),(36466,72-76),(36467,35-53),(36467,54-62),(36469,24-29),(36469,33-46),(36469,47-54),(36470,24-35),(36470,38-46),(36473,25-35),(36473,36-51),(36474,28-33),(36474,36-49),(36474,50-58),(36475,35-53),(36475,54-62)]
            store.setPartial(new range_1.Range(36446, 1, 36475, 115), [createTokens('[(36448,24-29),(36448,33-46),(36448,47-54),(36450,25-35),(36450,36-50),(36451,28-33),(36451,36-49),(36451,50-57),(36452,35-53),(36452,54-62),(36454,33-38),(36454,41-54),(36454,55-60),(36455,35-53),(36455,54-62),(36457,33-44),(36457,45-49),(36457,50-56),(36457,62-83),(36457,84-88),(36458,35-53),(36458,54-62),(36460,33-37),(36460,38-42),(36460,47-57),(36460,58-67),(36461,35-53),(36461,54-62),(36463,34-38),(36463,39-45),(36463,46-51),(36463,54-63),(36463,64-71),(36463,76-80),(36463,81-87),(36463,88-92),(36463,97-107),(36463,108-119),(36464,35-53),(36464,54-62),(36466,33-71),(36466,72-76),(36467,35-53),(36467,54-62),(36469,24-29),(36469,33-46),(36469,47-54),(36470,24-35),(36470,38-46),(36473,25-35),(36473,36-51),(36474,28-33),(36474,36-49),(36474,50-58),(36475,35-53),(36475,54-62)]')]);
            // setPartial [36436,1 -> 36464,142] [(36437,33-37),(36437,38-42),(36437,47-57),(36437,58-67),(36438,35-53),(36438,54-62),(36440,24-29),(36440,33-46),(36440,47-53),(36442,25-35),(36442,36-50),(36443,30-39),(36443,42-46),(36443,47-53),(36443,54-58),(36443,63-73),(36443,74-84),(36443,87-91),(36443,92-98),(36443,101-105),(36443,106-112),(36443,113-119),(36444,28-37),(36444,38-42),(36444,47-57),(36444,58-75),(36444,80-95),(36444,96-105),(36445,35-53),(36445,54-62),(36448,24-29),(36448,33-46),(36448,47-54),(36450,25-35),(36450,36-50),(36451,28-33),(36451,36-49),(36451,50-57),(36452,35-53),(36452,54-62),(36454,33-38),(36454,41-54),(36454,55-60),(36455,35-53),(36455,54-62),(36457,33-44),(36457,45-49),(36457,50-56),(36457,62-83),(36457,84-88),(36458,35-53),(36458,54-62),(36460,33-37),(36460,38-42),(36460,47-57),(36460,58-67),(36461,35-53),(36461,54-62),(36463,34-38),(36463,39-45),(36463,46-51),(36463,54-63),(36463,64-71),(36463,76-80),(36463,81-87),(36463,88-92),(36463,97-107),(36463,108-119),(36464,35-53),(36464,54-62)]
            store.setPartial(new range_1.Range(36436, 1, 36464, 142), [createTokens('[(36437,33-37),(36437,38-42),(36437,47-57),(36437,58-67),(36438,35-53),(36438,54-62),(36440,24-29),(36440,33-46),(36440,47-53),(36442,25-35),(36442,36-50),(36443,30-39),(36443,42-46),(36443,47-53),(36443,54-58),(36443,63-73),(36443,74-84),(36443,87-91),(36443,92-98),(36443,101-105),(36443,106-112),(36443,113-119),(36444,28-37),(36444,38-42),(36444,47-57),(36444,58-75),(36444,80-95),(36444,96-105),(36445,35-53),(36445,54-62),(36448,24-29),(36448,33-46),(36448,47-54),(36450,25-35),(36450,36-50),(36451,28-33),(36451,36-49),(36451,50-57),(36452,35-53),(36452,54-62),(36454,33-38),(36454,41-54),(36454,55-60),(36455,35-53),(36455,54-62),(36457,33-44),(36457,45-49),(36457,50-56),(36457,62-83),(36457,84-88),(36458,35-53),(36458,54-62),(36460,33-37),(36460,38-42),(36460,47-57),(36460,58-67),(36461,35-53),(36461,54-62),(36463,34-38),(36463,39-45),(36463,46-51),(36463,54-63),(36463,64-71),(36463,76-80),(36463,81-87),(36463,88-92),(36463,97-107),(36463,108-119),(36464,35-53),(36464,54-62)]')]);
            // setPartial [36457,1 -> 36485,140] [(36457,33-44),(36457,45-49),(36457,50-56),(36457,62-83),(36457,84-88),(36458,35-53),(36458,54-62),(36460,33-37),(36460,38-42),(36460,47-57),(36460,58-67),(36461,35-53),(36461,54-62),(36463,34-38),(36463,39-45),(36463,46-51),(36463,54-63),(36463,64-71),(36463,76-80),(36463,81-87),(36463,88-92),(36463,97-107),(36463,108-119),(36464,35-53),(36464,54-62),(36466,33-71),(36466,72-76),(36467,35-53),(36467,54-62),(36469,24-29),(36469,33-46),(36469,47-54),(36470,24-35),(36470,38-46),(36473,25-35),(36473,36-51),(36474,28-33),(36474,36-49),(36474,50-58),(36475,35-53),(36475,54-62),(36477,28-32),(36477,33-37),(36477,42-52),(36477,53-69),(36478,32-36),(36478,37-41),(36478,46-56),(36478,57-74),(36479,32-36),(36479,37-41),(36479,46-56),(36479,57-76),(36480,32-36),(36480,37-41),(36480,46-56),(36480,57-68),(36481,32-36),(36481,37-41),(36481,46-56),(36481,57-68),(36482,39-57),(36482,58-66),(36484,34-38),(36484,39-45),(36484,46-50),(36484,55-65),(36484,66-82),(36484,86-97),(36484,98-102),(36484,103-109),(36484,111-124),(36484,125-133),(36485,39-57),(36485,58-66)]
            store.setPartial(new range_1.Range(36457, 1, 36485, 140), [createTokens('[(36457,33-44),(36457,45-49),(36457,50-56),(36457,62-83),(36457,84-88),(36458,35-53),(36458,54-62),(36460,33-37),(36460,38-42),(36460,47-57),(36460,58-67),(36461,35-53),(36461,54-62),(36463,34-38),(36463,39-45),(36463,46-51),(36463,54-63),(36463,64-71),(36463,76-80),(36463,81-87),(36463,88-92),(36463,97-107),(36463,108-119),(36464,35-53),(36464,54-62),(36466,33-71),(36466,72-76),(36467,35-53),(36467,54-62),(36469,24-29),(36469,33-46),(36469,47-54),(36470,24-35),(36470,38-46),(36473,25-35),(36473,36-51),(36474,28-33),(36474,36-49),(36474,50-58),(36475,35-53),(36475,54-62),(36477,28-32),(36477,33-37),(36477,42-52),(36477,53-69),(36478,32-36),(36478,37-41),(36478,46-56),(36478,57-74),(36479,32-36),(36479,37-41),(36479,46-56),(36479,57-76),(36480,32-36),(36480,37-41),(36480,46-56),(36480,57-68),(36481,32-36),(36481,37-41),(36481,46-56),(36481,57-68),(36482,39-57),(36482,58-66),(36484,34-38),(36484,39-45),(36484,46-50),(36484,55-65),(36484,66-82),(36484,86-97),(36484,98-102),(36484,103-109),(36484,111-124),(36484,125-133),(36485,39-57),(36485,58-66)]')]);
            // setPartial [36441,1 -> 36469,56] [(36442,25-35),(36442,36-50),(36443,30-39),(36443,42-46),(36443,47-53),(36443,54-58),(36443,63-73),(36443,74-84),(36443,87-91),(36443,92-98),(36443,101-105),(36443,106-112),(36443,113-119),(36444,28-37),(36444,38-42),(36444,47-57),(36444,58-75),(36444,80-95),(36444,96-105),(36445,35-53),(36445,54-62),(36448,24-29),(36448,33-46),(36448,47-54),(36450,25-35),(36450,36-50),(36451,28-33),(36451,36-49),(36451,50-57),(36452,35-53),(36452,54-62),(36454,33-38),(36454,41-54),(36454,55-60),(36455,35-53),(36455,54-62),(36457,33-44),(36457,45-49),(36457,50-56),(36457,62-83),(36457,84-88),(36458,35-53),(36458,54-62),(36460,33-37),(36460,38-42),(36460,47-57),(36460,58-67),(36461,35-53),(36461,54-62),(36463,34-38),(36463,39-45),(36463,46-51),(36463,54-63),(36463,64-71),(36463,76-80),(36463,81-87),(36463,88-92),(36463,97-107),(36463,108-119),(36464,35-53),(36464,54-62),(36466,33-71),(36466,72-76),(36467,35-53),(36467,54-62),(36469,24-29),(36469,33-46),(36469,47-54),(36470,24-35)]
            store.setPartial(new range_1.Range(36441, 1, 36469, 56), [createTokens('[(36442,25-35),(36442,36-50),(36443,30-39),(36443,42-46),(36443,47-53),(36443,54-58),(36443,63-73),(36443,74-84),(36443,87-91),(36443,92-98),(36443,101-105),(36443,106-112),(36443,113-119),(36444,28-37),(36444,38-42),(36444,47-57),(36444,58-75),(36444,80-95),(36444,96-105),(36445,35-53),(36445,54-62),(36448,24-29),(36448,33-46),(36448,47-54),(36450,25-35),(36450,36-50),(36451,28-33),(36451,36-49),(36451,50-57),(36452,35-53),(36452,54-62),(36454,33-38),(36454,41-54),(36454,55-60),(36455,35-53),(36455,54-62),(36457,33-44),(36457,45-49),(36457,50-56),(36457,62-83),(36457,84-88),(36458,35-53),(36458,54-62),(36460,33-37),(36460,38-42),(36460,47-57),(36460,58-67),(36461,35-53),(36461,54-62),(36463,34-38),(36463,39-45),(36463,46-51),(36463,54-63),(36463,64-71),(36463,76-80),(36463,81-87),(36463,88-92),(36463,97-107),(36463,108-119),(36464,35-53),(36464,54-62),(36466,33-71),(36466,72-76),(36467,35-53),(36467,54-62),(36469,24-29),(36469,33-46),(36469,47-54),(36470,24-35)]')]);
            const lineTokens = store.addSparseTokens(36451, new lineTokens_1.LineTokens(new Uint32Array([60, 1]), `                        if (flags & ModifierFlags.Ambient) {`, codec));
            assert.strictEqual(lineTokens.getCount(), 7);
        });
        test('issue #95949: Identifiers are colored in bold when targetting keywords', () => {
            function createTMMetadata(foreground, fontStyle, languageId) {
                return ((languageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */)
                    | (fontStyle << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)
                    | (foreground << 15 /* MetadataConsts.FOREGROUND_OFFSET */)) >>> 0;
            }
            function toArr(lineTokens) {
                const r = [];
                for (let i = 0; i < lineTokens.getCount(); i++) {
                    r.push(lineTokens.getEndOffset(i));
                    r.push(lineTokens.getMetadata(i));
                }
                return r;
            }
            const codec = new languagesRegistry_1.LanguageIdCodec();
            const store = new sparseTokensStore_1.SparseTokensStore(codec);
            store.set([
                sparseMultilineTokens_1.SparseMultilineTokens.create(1, new Uint32Array([
                    0, 6, 11, (1 << 15 /* MetadataConsts.FOREGROUND_OFFSET */) | 16 /* MetadataConsts.SEMANTIC_USE_FOREGROUND */,
                ]))
            ], true);
            const lineTokens = store.addSparseTokens(1, new lineTokens_1.LineTokens(new Uint32Array([
                5, createTMMetadata(5, 2 /* FontStyle.Bold */, 53),
                14, createTMMetadata(1, 0 /* FontStyle.None */, 53),
                17, createTMMetadata(6, 0 /* FontStyle.None */, 53),
                18, createTMMetadata(1, 0 /* FontStyle.None */, 53),
            ]), `const hello = 123;`, codec));
            const actual = toArr(lineTokens);
            assert.deepStrictEqual(actual, [
                5, createTMMetadata(5, 2 /* FontStyle.Bold */, 53),
                6, createTMMetadata(1, 0 /* FontStyle.None */, 53),
                11, createTMMetadata(1, 0 /* FontStyle.None */, 53),
                14, createTMMetadata(1, 0 /* FontStyle.None */, 53),
                17, createTMMetadata(6, 0 /* FontStyle.None */, 53),
                18, createTMMetadata(1, 0 /* FontStyle.None */, 53)
            ]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5zU3RvcmUudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi9tb2RlbC90b2tlbnNTdG9yZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBaUJoRyxLQUFLLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtRQUV6QixJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsTUFBTSxjQUFjLEdBQUcsQ0FBWSxDQUFDO1FBRXBDLFNBQVMsZ0JBQWdCLENBQUMsS0FBZTtZQUN4QyxNQUFNLElBQUksR0FBYSxFQUFFLENBQUM7WUFDMUIsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1lBQzVCLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdEMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV0QixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztnQkFDbEIsT0FBTyxJQUFJLEVBQUU7b0JBQ1osTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7b0JBQ3ZELElBQUksZUFBZSxLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUMzQixNQUFNO3FCQUNOO29CQUNELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsZUFBZSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNoRSxJQUFJLGdCQUFnQixLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUM1QixNQUFNO3FCQUNOO29CQUNELElBQUksZUFBZSxHQUFHLENB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