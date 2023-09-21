/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/services/languagesRegistry", "vs/editor/common/tokens/lineTokens"], function (require, exports, assert, utils_1, languagesRegistry_1, lineTokens_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LineTokens', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function createLineTokens(text, tokens) {
            const binTokens = new Uint32Array(tokens.length << 1);
            for (let i = 0, len = tokens.length; i < len; i++) {
                binTokens[(i << 1)] = (i + 1 < len ? tokens[i + 1].startIndex : text.length);
                binTokens[(i << 1) + 1] = (tokens[i].foreground << 15 /* MetadataConsts.FOREGROUND_OFFSET */) >>> 0;
            }
            return new lineTokens_1.LineTokens(binTokens, text, new languagesRegistry_1.LanguageIdCodec());
        }
        function createTestLineTokens() {
            return createLineTokens('Hello world, this is a lovely day', [
                { startIndex: 0, foreground: 1 },
                { startIndex: 6, foreground: 2 },
                { startIndex: 13, foreground: 3 },
                { startIndex: 18, foreground: 4 },
                { startIndex: 21, foreground: 5 },
                { startIndex: 23, foreground: 6 },
                { startIndex: 30, foreground: 7 }, // day
            ]);
        }
        function renderLineTokens(tokens) {
            let result = '';
            const str = tokens.getLineContent();
            let lastOffset = 0;
            for (let i = 0; i < tokens.getCount(); i++) {
                result += str.substring(lastOffset, tokens.getEndOffset(i));
                result += `(${tokens.getMetadata(i)})`;
                lastOffset = tokens.getEndOffset(i);
            }
            return result;
        }
        test('withInserted 1', () => {
            const lineTokens = createTestLineTokens();
            assert.strictEqual(renderLineTokens(lineTokens), 'Hello (32768)world, (65536)this (98304)is (131072)a (163840)lovely (196608)day(229376)');
            const lineTokens2 = lineTokens.withInserted([
                { offset: 0, text: '1', tokenMetadata: 0, },
                { offset: 6, text: '2', tokenMetadata: 0, },
                { offset: 9, text: '3', tokenMetadata: 0, },
            ]);
            assert.strictEqual(renderLineTokens(lineTokens2), '1(0)Hello (32768)2(0)wor(65536)3(0)ld, (65536)this (98304)is (131072)a (163840)lovely (196608)day(229376)');
        });
        test('withInserted (tokens at the same position)', () => {
            const lineTokens = createTestLineTokens();
            assert.strictEqual(renderLineTokens(lineTokens), 'Hello (32768)world, (65536)this (98304)is (131072)a (163840)lovely (196608)day(229376)');
            const lineTokens2 = lineTokens.withInserted([
                { offset: 0, text: '1', tokenMetadata: 0, },
                { offset: 0, text: '2', tokenMetadata: 0, },
                { offset: 0, text: '3', tokenMetadata: 0, },
            ]);
            assert.strictEqual(renderLineTokens(lineTokens2), '1(0)2(0)3(0)Hello (32768)world, (65536)this (98304)is (131072)a (163840)lovely (196608)day(229376)');
        });
        test('withInserted (tokens at the end)', () => {
            const lineTokens = createTestLineTokens();
            assert.strictEqual(renderLineTokens(lineTokens), 'Hello (32768)world, (65536)this (98304)is (131072)a (163840)lovely (196608)day(229376)');
            const lineTokens2 = lineTokens.withInserted([
                { offset: 'Hello world, this is a lovely day'.length - 1, text: '1', tokenMetadata: 0, },
                { offset: 'Hello world, this is a lovely day'.length, text: '2', tokenMetadata: 0, },
            ]);
            assert.strictEqual(renderLineTokens(lineTokens2), 'Hello (32768)world, (65536)this (98304)is (131072)a (163840)lovely (196608)da(229376)1(0)y(229376)2(0)');
        });
        test('basics', () => {
            const lineTokens = createTestLineTokens();
            assert.strictEqual(lineTokens.getLineContent(), 'Hello world, this is a lovely day');
            assert.strictEqual(lineTokens.getLineContent().length, 33);
            assert.strictEqual(lineTokens.getCount(), 7);
            assert.strictEqual(lineTokens.getStartOffset(0), 0);
            assert.strictEqual(lineTokens.getEndOffset(0), 6);
            assert.strictEqual(lineTokens.getStartOffset(1), 6);
            assert.strictEqual(lineTokens.getEndOffset(1), 13);
            assert.strictEqual(lineTokens.getStartOffset(2), 13);
            assert.strictEqual(lineTokens.getEndOffset(2), 18);
            assert.strictEqual(lineTokens.getStartOffset(3), 18);
            assert.strictEqual(lineTokens.getEndOffset(3), 21);
            assert.strictEqual(lineTokens.getStartOffset(4), 21);
            assert.strictEqual(lineTokens.getEndOffset(4), 23);
            assert.strictEqual(lineTokens.getStartOffset(5), 23);
            assert.strictEqual(lineTokens.getEndOffset(5), 30);
            assert.strictEqual(lineTokens.getStartOffset(6), 30);
            assert.strictEqual(lineTokens.getEndOffset(6), 33);
        });
        test('findToken', () => {
            const lineTokens = createTestLineTokens();
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(0), 0);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(1), 0);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(2), 0);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(3), 0);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(4), 0);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(5), 0);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(6), 1);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(7), 1);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(8), 1);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(9), 1);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(10), 1);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(11), 1);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(12), 1);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(13), 2);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(14), 2);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(15), 2);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(16), 2);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(17), 2);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(18), 3);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(19), 3);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(20), 3);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(21), 4);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(22), 4);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(23), 5);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(24), 5);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(25), 5);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(26), 5);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(27), 5);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(28), 5);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(29), 5);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(30), 6);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(31), 6);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(32), 6);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(33), 6);
            assert.strictEqual(lineTokens.findTokenIndexAtOffset(34), 6);
        });
        function assertViewLineTokens(_actual, expected) {
            const actual = [];
            for (let i = 0, len = _actual.getCount(); i < len; i++) {
                actual[i] = {
                    endIndex: _actual.getEndOffset(i),
                    foreground: _actual.getForeground(i)
                };
            }
            assert.deepStrictEqual(actual, expected);
        }
        test('inflate', () => {
            const lineTokens = createTestLineTokens();
            assertViewLineTokens(lineTokens.inflate(), [
                { endIndex: 6, foreground: 1 },
                { endIndex: 13, foreground: 2 },
                { endIndex: 18, foreground: 3 },
                { endIndex: 21, foreground: 4 },
                { endIndex: 23, foreground: 5 },
                { endIndex: 30, foreground: 6 },
                { endIndex: 33, foreground: 7 },
            ]);
        });
        test('sliceAndInflate', () => {
            const lineTokens = createTestLineTokens();
            assertViewLineTokens(lineTokens.sliceAndInflate(0, 33, 0), [
                { endIndex: 6, foreground: 1 },
                { endIndex: 13, foreground: 2 },
                { endIndex: 18, foreground: 3 },
                { endIndex: 21, foreground: 4 },
                { endIndex: 23, foreground: 5 },
                { endIndex: 30, foreground: 6 },
                { endIndex: 33, foreground: 7 },
            ]);
            assertViewLineTokens(lineTokens.sliceAndInflate(0, 32, 0), [
                { endIndex: 6, foreground: 1 },
                { endIndex: 13, foreground: 2 },
                { endIndex: 18, foreground: 3 },
                { endIndex: 21, foreground: 4 },
                { endIndex: 23, foreground: 5 },
                { endIndex: 30, foreground: 6 },
                { endIndex: 32, foreground: 7 },
            ]);
            assertViewLineTokens(lineTokens.sliceAndInflate(0, 30, 0), [
                { endIndex: 6, foreground: 1 },
                { endIndex: 13, foreground: 2 },
                { endIndex: 18, foreground: 3 },
                { endIndex: 21, foreground: 4 },
                { endIndex: 23, foreground: 5 },
                { endIndex: 30, foreground: 6 }
            ]);
            assertViewLineTokens(lineTokens.sliceAndInflate(0, 30, 1), [
                { endIndex: 7, foreground: 1 },
                { endIndex: 14, foreground: 2 },
                { endIndex: 19, foreground: 3 },
                { endIndex: 22, foreground: 4 },
                { endIndex: 24, foreground: 5 },
                { endIndex: 31, foreground: 6 }
            ]);
            assertViewLineTokens(lineTokens.sliceAndInflate(6, 18, 0), [
                { endIndex: 7, foreground: 2 },
                { endIndex: 12, foreground: 3 }
            ]);
            assertViewLineTokens(lineTokens.sliceAndInflate(7, 18, 0), [
                { endIndex: 6, foreground: 2 },
                { endIndex: 11, foreground: 3 }
            ]);
            assertViewLineTokens(lineTokens.sliceAndInflate(6, 17, 0), [
                { endIndex: 7, foreground: 2 },
                { endIndex: 11, foreground: 3 }
            ]);
            assertViewLineTokens(lineTokens.sliceAndInflate(6, 19, 0), [
                { endIndex: 7, foreground: 2 },
                { endIndex: 12, foreground: 3 },
                { endIndex: 13, foreground: 4 },
            ]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZVRva2Vucy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvY29tbW9uL2NvcmUvbGluZVRva2Vucy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBUWhHLEtBQUssQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1FBRXhCLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQU8xQyxTQUFTLGdCQUFnQixDQUFDLElBQVksRUFBRSxNQUFvQjtZQUMzRCxNQUFNLFNBQVMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXRELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2xELFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzdFLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUN6QixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSw2Q0FBb0MsQ0FDeEQsS0FBSyxDQUFDLENBQUM7YUFDUjtZQUVELE9BQU8sSUFBSSx1QkFBVSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxtQ0FBZSxFQUFFLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsU0FBUyxvQkFBb0I7WUFDNUIsT0FBTyxnQkFBZ0IsQ0FDdEIsbUNBQW1D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Q0FBQyxDQUFDO1lBQ3BELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNwRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFO1lBQ3RCLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixFQUFFLENBQUM7WUFFMUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxD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QUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO2dCQUMvQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtnQkFDL0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7Z0JBQy9CLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO2dCQUMvQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtnQkFDL0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7YUFDL0IsQ0FBQyxDQUFDO1lBRUgsb0JBQW9CLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUMxRCxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtnQkFDOUIsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7Z0JBQy9CLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO2dCQUMvQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtnQkFDL0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7Z0JBQy9CLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO2FBQy9CLENBQUMsQ0FBQztZQUVILG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDMUQsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7Z0JBQzlCLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO2dCQUMvQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtnQkFDL0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7Z0JBQy9CLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO2dCQUMvQixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTthQUMvQixDQUFDLENBQUM7WUFFSCxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQzFELEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO2dCQUM5QixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTthQUMvQixDQUFDLENBQUM7WUFFSCxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQzFELEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO2dCQUM5QixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTthQUMvQixDQUFDLENBQUM7WUFFSCxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQzFELEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO2dCQUM5QixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTthQUMvQixDQUFDLENBQUM7WUFFSCxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQzFELEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO2dCQUM5QixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtnQkFDL0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7YUFDL0IsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9