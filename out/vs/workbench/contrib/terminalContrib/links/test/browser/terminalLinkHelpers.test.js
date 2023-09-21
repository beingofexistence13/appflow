/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers", "vs/base/test/common/utils"], function (require, exports, assert, terminalLinkHelpers_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - Terminal Link Helpers', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('convertLinkRangeToBuffer', () => {
            test('should convert ranges for ascii characters', () => {
                const lines = createBufferLineArray([
                    { text: 'AA http://t', width: 11 },
                    { text: '.com/f/', width: 8 }
                ]);
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 11, { startColumn: 4, startLineNumber: 1, endColumn: 19, endLineNumber: 1 }, 0);
                assert.deepStrictEqual(bufferRange, {
                    start: { x: 4, y: 1 },
                    end: { x: 7, y: 2 }
                });
            });
            test('should convert ranges for wide characters before the link', () => {
                const lines = createBufferLineArray([
                    { text: 'A文 http://', width: 11 },
                    { text: 't.com/f/', width: 9 }
                ]);
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 11, { startColumn: 4, startLineNumber: 1, endColumn: 19, endLineNumber: 1 }, 0);
                assert.deepStrictEqual(bufferRange, {
                    start: { x: 4 + 1, y: 1 },
                    end: { x: 7 + 1, y: 2 }
                });
            });
            test('should give correct range for links containing multi-character emoji', () => {
                const lines = createBufferLineArray([
                    { text: 'A🙂 http://', width: 11 }
                ]);
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 11, { startColumn: 0 + 1, startLineNumber: 1, endColumn: 2 + 1, endLineNumber: 1 }, 0);
                assert.deepStrictEqual(bufferRange, {
                    start: { x: 1, y: 1 },
                    end: { x: 2, y: 1 }
                });
            });
            test('should convert ranges for combining characters before the link', () => {
                const lines = createBufferLineArray([
                    { text: 'A🙂 http://', width: 11 },
                    { text: 't.com/f/', width: 9 }
                ]);
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 11, { startColumn: 4 + 1, startLineNumber: 1, endColumn: 19 + 1, endLineNumber: 1 }, 0);
                assert.deepStrictEqual(bufferRange, {
                    start: { x: 6, y: 1 },
                    end: { x: 9, y: 2 }
                });
            });
            test('should convert ranges for wide characters inside the link', () => {
                const lines = createBufferLineArray([
                    { text: 'AA http://t', width: 11 },
                    { text: '.com/文/', width: 8 }
                ]);
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 11, { startColumn: 4, startLineNumber: 1, endColumn: 19, endLineNumber: 1 }, 0);
                assert.deepStrictEqual(bufferRange, {
                    start: { x: 4, y: 1 },
                    end: { x: 7 + 1, y: 2 }
                });
            });
            test('should convert ranges for wide characters before and inside the link', () => {
                const lines = createBufferLineArray([
                    { text: 'A文 http://', width: 11 },
                    { text: 't.com/文/', width: 9 }
                ]);
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 11, { startColumn: 4, startLineNumber: 1, endColumn: 19, endLineNumber: 1 }, 0);
                assert.deepStrictEqual(bufferRange, {
                    start: { x: 4 + 1, y: 1 },
                    end: { x: 7 + 2, y: 2 }
                });
            });
            test('should convert ranges for emoji before and wide inside the link', () => {
                const lines = createBufferLineArray([
                    { text: 'A🙂 http://', width: 11 },
                    { text: 't.com/文/', width: 9 }
                ]);
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 11, { startColumn: 4 + 1, startLineNumber: 1, endColumn: 19 + 1, endLineNumber: 1 }, 0);
                assert.deepStrictEqual(bufferRange, {
                    start: { x: 6, y: 1 },
                    end: { x: 10 + 1, y: 2 }
                });
            });
            test('should convert ranges for ascii characters (link starts on wrapped)', () => {
                const lines = createBufferLineArray([
                    { text: 'AAAAAAAAAAA', width: 11 },
                    { text: 'AA http://t', width: 11 },
                    { text: '.com/f/', width: 8 }
                ]);
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 11, { startColumn: 15, startLineNumber: 1, endColumn: 30, endLineNumber: 1 }, 0);
                assert.deepStrictEqual(bufferRange, {
                    start: { x: 4, y: 2 },
                    end: { x: 7, y: 3 }
                });
            });
            test('should convert ranges for wide characters before the link (link starts on wrapped)', () => {
                const lines = createBufferLineArray([
                    { text: 'AAAAAAAAAAA', width: 11 },
                    { text: 'A文 http://', width: 11 },
                    { text: 't.com/f/', width: 9 }
                ]);
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 11, { startColumn: 15, startLineNumber: 1, endColumn: 30, endLineNumber: 1 }, 0);
                assert.deepStrictEqual(bufferRange, {
                    start: { x: 4 + 1, y: 2 },
                    end: { x: 7 + 1, y: 3 }
                });
            });
            test('regression test #147619: 获取模板 25235168 的预览图失败', () => {
                const lines = createBufferLineArray([
                    { text: '获取模板 25235168 的预览图失败', width: 30 }
                ]);
                assert.deepStrictEqual((0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 30, {
                    startColumn: 1,
                    startLineNumber: 1,
                    endColumn: 5,
                    endLineNumber: 1
                }, 0), {
                    start: { x: 1, y: 1 },
                    end: { x: 8, y: 1 }
                });
                assert.deepStrictEqual((0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 30, {
                    startColumn: 6,
                    startLineNumber: 1,
                    endColumn: 14,
                    endLineNumber: 1
                }, 0), {
                    start: { x: 10, y: 1 },
                    end: { x: 17, y: 1 }
                });
                assert.deepStrictEqual((0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 30, {
                    startColumn: 15,
                    startLineNumber: 1,
                    endColumn: 21,
                    endLineNumber: 1
                }, 0), {
                    start: { x: 19, y: 1 },
                    end: { x: 30, y: 1 }
                });
            });
            test('should convert ranges for wide characters inside the link (link starts on wrapped)', () => {
                const lines = createBufferLineArray([
                    { text: 'AAAAAAAAAAA', width: 11 },
                    { text: 'AA http://t', width: 11 },
                    { text: '.com/文/', width: 8 }
                ]);
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 11, { startColumn: 15, startLineNumber: 1, endColumn: 30, endLineNumber: 1 }, 0);
                assert.deepStrictEqual(bufferRange, {
                    start: { x: 4, y: 2 },
                    end: { x: 7 + 1, y: 3 }
                });
            });
            test('should convert ranges for wide characters before and inside the link #2', () => {
                const lines = createBufferLineArray([
                    { text: 'AAAAAAAAAAA', width: 11 },
                    { text: 'A文 http://', width: 11 },
                    { text: 't.com/文/', width: 9 }
                ]);
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 11, { startColumn: 15, startLineNumber: 1, endColumn: 30, endLineNumber: 1 }, 0);
                assert.deepStrictEqual(bufferRange, {
                    start: { x: 4 + 1, y: 2 },
                    end: { x: 7 + 2, y: 3 }
                });
            });
            test('should convert ranges for several wide characters before the link', () => {
                const lines = createBufferLineArray([
                    { text: 'A文文AAAAAA', width: 11 },
                    { text: 'AA文文 http', width: 11 },
                    { text: '://t.com/f/', width: 11 }
                ]);
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 11, { startColumn: 15, startLineNumber: 1, endColumn: 30, endLineNumber: 1 }, 0);
                // This test ensures that the start offset is applied to the end before it's counted
                assert.deepStrictEqual(bufferRange, {
                    start: { x: 3 + 4, y: 2 },
                    end: { x: 6 + 4, y: 3 }
                });
            });
            test('should convert ranges for several wide characters before and inside the link', () => {
                const lines = createBufferLineArray([
                    { text: 'A文文AAAAAA', width: 11 },
                    { text: 'AA文文 http', width: 11 },
                    { text: '://t.com/文', width: 11 },
                    { text: '文/', width: 3 }
                ]);
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, 11, { startColumn: 14, startLineNumber: 1, endColumn: 31, endLineNumber: 1 }, 0);
                // This test ensures that the start offset is applies to the end before it's counted
                assert.deepStrictEqual(bufferRange, {
                    start: { x: 5, y: 2 },
                    end: { x: 1, y: 4 }
                });
            });
        });
    });
    const TEST_WIDE_CHAR = '文';
    const TEST_NULL_CHAR = 'C';
    function createBufferLineArray(lines) {
        const result = [];
        lines.forEach((l, i) => {
            result.push(new TestBufferLine(l.text, l.width, i + 1 !== lines.length));
        });
        return result;
    }
    class TestBufferLine {
        constructor(_text, length, isWrapped) {
            this._text = _text;
            this.length = length;
            this.isWrapped = isWrapped;
        }
        getCell(x) {
            // Create a fake line of cells and use that to resolve the width
            const cells = [];
            let wideNullCellOffset = 0; // There is no null 0 width char after a wide char
            const emojiOffset = 0; // Skip chars as emoji are multiple characters
            for (let i = 0; i <= x - wideNullCellOffset + emojiOffset; i++) {
                let char = this._text.charAt(i);
                if (char === '\ud83d') {
                    // Make "🙂"
                    char += '\ude42';
                }
                cells.push(char);
                if (this._text.charAt(i) === TEST_WIDE_CHAR || char.charCodeAt(0) > 255) {
                    // Skip the next character as it's width is 0
                    cells.push(TEST_NULL_CHAR);
                    wideNullCellOffset++;
                }
            }
            return {
                getChars: () => {
                    return x >= cells.length ? '' : cells[x];
                },
                getWidth: () => {
                    switch (cells[x]) {
                        case TEST_WIDE_CHAR: return 2;
                        case TEST_NULL_CHAR: return 0;
                        default: {
                            // Naive measurement, assume anything our of ascii in tests are wide
                            if (cells[x].charCodeAt(0) > 255) {
                                return 2;
                            }
                            return 1;
                        }
                    }
                }
            };
        }
        translateToString() {
            throw new Error('Method not implemented.');
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rSGVscGVycy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2xpbmtzL3Rlc3QvYnJvd3Nlci90ZXJtaW5hbExpbmtIZWxwZXJzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFPaEcsS0FBSyxDQUFDLG1DQUFtQyxFQUFFLEdBQUcsRUFBRTtRQUMvQyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtZQUN0QyxJQUFJLENBQUMsNENBQTRDLEVBQUUsR0FBRyxFQUFFO2dCQUN2RCxNQUFNLEtBQUssR0FBRyxxQkFBcUIsQ0FBQztvQkFDbkMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7b0JBQ2xDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFO2lCQUM3QixDQUFDLENBQUM7Z0JBQ0gsTUFBTSxXQUFXLEdBQUcsSUFBQSw4Q0FBd0IsRUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNwSSxNQUFNLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRTtvQkFDbkMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO29CQUNyQixHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7aUJBQ25CLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFB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