define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/diff/legacyLinesDiffComputer", "vs/editor/test/common/testTextModel"], function (require, exports, assert, utils_1, range_1, legacyLinesDiffComputer_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function assertDiff(originalLines, modifiedLines, expectedChanges, shouldComputeCharChanges = true, shouldPostProcessCharChanges = false, shouldIgnoreTrimWhitespace = false) {
        const diffComputer = new legacyLinesDiffComputer_1.DiffComputer(originalLines, modifiedLines, {
            shouldComputeCharChanges,
            shouldPostProcessCharChanges,
            shouldIgnoreTrimWhitespace,
            shouldMakePrettyDiff: true,
            maxComputationTime: 0
        });
        const changes = diffComputer.computeDiff().changes;
        const mapCharChange = (charChange) => {
            return {
                originalStartLineNumber: charChange.originalStartLineNumber,
                originalStartColumn: charChange.originalStartColumn,
                originalEndLineNumber: charChange.originalEndLineNumber,
                originalEndColumn: charChange.originalEndColumn,
                modifiedStartLineNumber: charChange.modifiedStartLineNumber,
                modifiedStartColumn: charChange.modifiedStartColumn,
                modifiedEndLineNumber: charChange.modifiedEndLineNumber,
                modifiedEndColumn: charChange.modifiedEndColumn,
            };
        };
        const actual = changes.map((lineChange) => {
            return {
                originalStartLineNumber: lineChange.originalStartLineNumber,
                originalEndLineNumber: lineChange.originalEndLineNumber,
                modifiedStartLineNumber: lineChange.modifiedStartLineNumber,
                modifiedEndLineNumber: lineChange.modifiedEndLineNumber,
                charChanges: (lineChange.charChanges ? lineChange.charChanges.map(mapCharChange) : undefined)
            };
        });
        assert.deepStrictEqual(actual, expectedChanges);
        if (!shouldIgnoreTrimWhitespace) {
            // The diffs should describe how to apply edits to the original text model to get to the modified text model.
            const modifiedTextModel = (0, testTextModel_1.createTextModel)(modifiedLines.join('\n'));
            const expectedValue = modifiedTextModel.getValue();
            {
                // Line changes:
                const originalTextModel = (0, testTextModel_1.createTextModel)(originalLines.join('\n'));
                originalTextModel.applyEdits(changes.map(c => getLineEdit(c, modifiedTextModel)));
                assert.deepStrictEqual(originalTextModel.getValue(), expectedValue);
                originalTextModel.dispose();
            }
            if (shouldComputeCharChanges) {
                // Char changes:
                const originalTextModel = (0, testTextModel_1.createTextModel)(originalLines.join('\n'));
                originalTextModel.applyEdits(changes.flatMap(c => getCharEdits(c, modifiedTextModel)));
                assert.deepStrictEqual(originalTextModel.getValue(), expectedValue);
                originalTextModel.dispose();
            }
            modifiedTextModel.dispose();
        }
    }
    function getCharEdits(lineChange, modifiedTextModel) {
        if (!lineChange.charChanges) {
            return [getLineEdit(lineChange, modifiedTextModel)];
        }
        return lineChange.charChanges.map(c => {
            const originalRange = new range_1.Range(c.originalStartLineNumber, c.originalStartColumn, c.originalEndLineNumber, c.originalEndColumn);
            const modifiedRange = new range_1.Range(c.modifiedStartLineNumber, c.modifiedStartColumn, c.modifiedEndLineNumber, c.modifiedEndColumn);
            return {
                range: originalRange,
                text: modifiedTextModel.getValueInRange(modifiedRange)
            };
        });
    }
    function getLineEdit(lineChange, modifiedTextModel) {
        let originalRange;
        if (lineChange.originalEndLineNumber === 0) {
            // Insertion
            originalRange = new LineRange(lineChange.originalStartLineNumber + 1, 0);
        }
        else {
            originalRange = new LineRange(lineChange.originalStartLineNumber, lineChange.originalEndLineNumber - lineChange.originalStartLineNumber + 1);
        }
        let modifiedRange;
        if (lineChange.modifiedEndLineNumber === 0) {
            // Deletion
            modifiedRange = new LineRange(lineChange.modifiedStartLineNumber + 1, 0);
        }
        else {
            modifiedRange = new LineRange(lineChange.modifiedStartLineNumber, lineChange.modifiedEndLineNumber - lineChange.modifiedStartLineNumber + 1);
        }
        const [r1, r2] = diffFromLineRanges(originalRange, modifiedRange);
        return {
            range: r1,
            text: modifiedTextModel.getValueInRange(r2),
        };
    }
    function diffFromLineRanges(originalRange, modifiedRange) {
        if (originalRange.startLineNumber === 1 || modifiedRange.startLineNumber === 1) {
            if (!originalRange.isEmpty && !modifiedRange.isEmpty) {
                return [
                    new range_1.Range(originalRange.startLineNumber, 1, originalRange.endLineNumberExclusive - 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
                    new range_1.Range(modifiedRange.startLineNumber, 1, modifiedRange.endLineNumberExclusive - 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */)
                ];
            }
            // When one of them is one and one of them is empty, the other cannot be the last line of the document
            return [
                new range_1.Range(originalRange.startLineNumber, 1, originalRange.endLineNumberExclusive, 1),
                new range_1.Range(modifiedRange.startLineNumber, 1, modifiedRange.endLineNumberExclusive, 1)
            ];
        }
        return [
            new range_1.Range(originalRange.startLineNumber - 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, originalRange.endLineNumberExclusive - 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
            new range_1.Range(modifiedRange.startLineNumber - 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, modifiedRange.endLineNumberExclusive - 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */)
        ];
    }
    class LineRange {
        constructor(startLineNumber, lineCount) {
            this.startLineNumber = startLineNumber;
            this.lineCount = lineCount;
        }
        get isEmpty() {
            return this.lineCount === 0;
        }
        get endLineNumberExclusive() {
            return this.startLineNumber + this.lineCount;
        }
    }
    function createLineDeletion(startLineNumber, endLineNumber, modifiedLineNumber) {
        return {
            originalStartLineNumber: startLineNumber,
            originalEndLineNumber: endLineNumber,
            modifiedStartLineNumber: modifiedLineNumber,
            modifiedEndLineNumber: 0,
            charChanges: undefined
        };
    }
    function createLineInsertion(startLineNumber, endLineNumber, originalLineNumber) {
        return {
            originalStartLineNumber: originalLineNumber,
            originalEndLineNumber: 0,
            modifiedStartLineNumber: startLineNumber,
            modifiedEndLineNumber: endLineNumber,
            charChanges: undefined
        };
    }
    function createLineChange(originalStartLineNumber, originalEndLineNumber, modifiedStartLineNumber, modifiedEndLineNumber, charChanges) {
        return {
            originalStartLineNumber: originalStartLineNumber,
            originalEndLineNumber: originalEndLineNumber,
            modifiedStartLineNumber: modifiedStartLineNumber,
            modifiedEndLineNumber: modifiedEndLineNumber,
            charChanges: charChanges
        };
    }
    function createCharChange(originalStartLineNumber, originalStartColumn, originalEndLineNumber, originalEndColumn, modifiedStartLineNumber, modifiedStartColumn, modifiedEndLineNumber, modifiedEndColumn) {
        return {
            originalStartLineNumber: originalStartLineNumber,
            originalStartColumn: originalStartColumn,
            originalEndLineNumber: originalEndLineNumber,
            originalEndColumn: originalEndColumn,
            modifiedStartLineNumber: modifiedStartLineNumber,
            modifiedStartColumn: modifiedStartColumn,
            modifiedEndLineNumber: modifiedEndLineNumber,
            modifiedEndColumn: modifiedEndColumn
        };
    }
    suite('Editor Diff - DiffComputer', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        // ---- insertions
        test('one inserted line below', () => {
            const original = ['line'];
            const modified = ['line', 'new line'];
            const expected = [createLineInsertion(2, 2, 1)];
            assertDiff(original, modified, expected);
        });
        test('two inserted lines below', () => {
            const original = ['line'];
            const modified = ['line', 'new line', 'another new line'];
            const expected = [createLineInsertion(2, 3, 1)];
            assertDiff(original, modified, expected);
        });
        test('one inserted line above', () => {
            const original = ['line'];
            const modified = ['new line', 'line'];
            const expected = [createLineInsertion(1, 1, 0)];
            assertDiff(original, modified, expected);
        });
        test('two inserted lines above', () => {
            const original = ['line'];
            const modified = ['new line', 'another new line', 'line'];
            const expected = [createLineInsertion(1, 2, 0)];
            assertDiff(original, modified, expected);
        });
        test('one inserted line in middle', () => {
            const original = ['line1', 'line2', 'line3', 'line4'];
            const modified = ['line1', 'line2', 'new line', 'line3', 'line4'];
            const expected = [createLineInsertion(3, 3, 2)];
            assertDiff(original, modified, expected);
        });
        test('two inserted lines in middle', () => {
            const original = ['line1', 'line2', 'line3', 'line4'];
            const modified = ['line1', 'line2', 'new line', 'another new line', 'line3', 'line4'];
            const expected = [createLineInsertion(3, 4, 2)];
            assertDiff(original, modified, expected);
        });
        test('two inserted lines in middle interrupted', () => {
            const original = ['line1', 'line2', 'line3', 'line4'];
            const modified = ['line1', 'line2', 'new line', 'line3', 'another new line', 'line4'];
            const expected = [createLineInsertion(3, 3, 2), createLineInsertion(5, 5, 3)];
            assertDiff(original, modified, expected);
        });
        // ---- deletions
        test('one deleted line below', () => {
            const original = ['line', 'new line'];
            const modified = ['line'];
            const expected = [createLineDeletion(2, 2, 1)];
            assertDiff(original, modified, expected);
        });
        test('two deleted lines below', () => {
            const original = ['line', 'new line', 'another new line'];
            const modified = ['line'];
            const expected = [createLineDeletion(2, 3, 1)];
            assertDiff(original, modified, expected);
        });
        test('one deleted lines above', () => {
            const original = ['new line', 'line'];
            const modified = ['line'];
            const expected = [createLineDeletion(1, 1, 0)];
            assertDiff(original, modified, expected);
        });
        test('two deleted lines above', () => {
            const original = ['new line', 'another new line', 'line'];
            const modified = ['line'];
            const expected = [createLineDeletion(1, 2, 0)];
            assertDiff(original, modified, expected);
        });
        test('one deleted line in middle', () => {
            const original = ['line1', 'line2', 'new line', 'line3', 'line4'];
            const modified = ['line1', 'line2', 'line3', 'line4'];
            const expected = [createLineDeletion(3, 3, 2)];
            assertDiff(original, modified, expected);
        });
        test('two deleted lines in middle', () => {
            const original = ['line1', 'line2', 'new line', 'another new line', 'line3', 'line4'];
            const modified = ['line1', 'line2', 'line3', 'line4'];
            const expected = [createLineDeletion(3, 4, 2)];
            assertDiff(original, modified, expected);
        });
        test('two deleted lines in middle interrupted', () => {
            const original = ['line1', 'line2', 'new line', 'line3', 'another new line', 'line4'];
            const modified = ['line1', 'line2', 'line3', 'line4'];
            const expected = [createLineDeletion(3, 3, 2), createLineDeletion(5, 5, 3)];
            assertDiff(original, modified, expected);
        });
        // ---- changes
        test('one line changed: chars inserted at the end', () => {
            const original = ['line'];
            const modified = ['line changed'];
            const expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharChange(1, 5, 1, 5, 1, 5, 1, 13)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('one line changed: chars inserted at the beginning', () => {
            const original = ['line'];
            const modified = ['my line'];
            const expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharChange(1, 1, 1, 1, 1, 1, 1, 4)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('one line changed: chars inserted in the middle', () => {
            const original = ['abba'];
            const modified = ['abzzba'];
            const expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharChange(1, 3, 1, 3, 1, 3, 1, 5)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('one line changed: chars inserted in the middle (two spots)', () => {
            const original = ['abba'];
            const modified = ['abzzbzza'];
            const expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharChange(1, 3, 1, 3, 1, 3, 1, 5),
                    createCharChange(1, 4, 1, 4, 1, 6, 1, 8)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('one line changed: chars deleted 1', () => {
            const original = ['abcdefg'];
            const modified = ['abcfg'];
            const expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharChange(1, 4, 1, 6, 1, 4, 1, 4)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('one line changed: chars deleted 2', () => {
            const original = ['abcdefg'];
            const modified = ['acfg'];
            const expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharChange(1, 2, 1, 3, 1, 2, 1, 2),
                    createCharChange(1, 4, 1, 6, 1, 3, 1, 3)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('two lines changed 1', () => {
            const original = ['abcd', 'efgh'];
            const modified = ['abcz'];
            const expected = [
                createLineChange(1, 2, 1, 1, [
                    createCharChange(1, 4, 2, 5, 1, 4, 1, 5)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('two lines changed 2', () => {
            const original = ['foo', 'abcd', 'efgh', 'BAR'];
            const modified = ['foo', 'abcz', 'BAR'];
            const expected = [
                createLineChange(2, 3, 2, 2, [
                    createCharChange(2, 4, 3, 5, 2, 4, 2, 5)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('two lines changed 3', () => {
            const original = ['foo', 'abcd', 'efgh', 'BAR'];
            const modified = ['foo', 'abcz', 'zzzzefgh', 'BAR'];
            const expected = [
                createLineChange(2, 3, 2, 3, [
                    createCharChange(2, 4, 2, 5, 2, 4, 2, 5),
                    createCharChange(3, 1, 3, 1, 3, 1, 3, 5)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('two lines changed 4', () => {
            const original = ['abc'];
            const modified = ['', '', 'axc', ''];
            const expected = [
                createLineChange(1, 1, 1, 4, [
                    createCharChange(1, 1, 1, 1, 1, 1, 3, 1),
                    createCharChange(1, 2, 1, 3, 3, 2, 3, 3),
                    createCharChange(1, 4, 1, 4, 3, 4, 4, 1)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('empty original sequence in char diff', () => {
            const original = ['abc', '', 'xyz'];
            const modified = ['abc', 'qwe', 'rty', 'xyz'];
            const expected = [
                createLineChange(2, 2, 2, 3)
            ];
            assertDiff(original, modified, expected);
        });
        test('three lines changed', () => {
            const original = ['foo', 'abcd', 'efgh', 'BAR'];
            const modified = ['foo', 'zzzefgh', 'xxx', 'BAR'];
            const expected = [
                createLineChange(2, 3, 2, 3, [
                    createCharChange(2, 1, 3, 1, 2, 1, 2, 4),
                    createCharChange(3, 5, 3, 5, 2, 8, 3, 4),
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('big change part 1', () => {
            const original = ['foo', 'abcd', 'efgh', 'BAR'];
            const modified = ['hello', 'foo', 'zzzefgh', 'xxx', 'BAR'];
            const expected = [
                createLineInsertion(1, 1, 0),
                createLineChange(2, 3, 3, 4, [
                    createCharChange(2, 1, 3, 1, 3, 1, 3, 4),
                    createCharChange(3, 5, 3, 5, 3, 8, 4, 4)
                ])
            ];
            assertDiff(original, modified, expected);
        });
        test('big change part 2', () => {
            const original = ['foo', 'abcd', 'efgh', 'BAR', 'RAB'];
            const modified = ['hello', 'foo', 'zzzefgh', 'xxx', 'BAR'];
            const expected = [
                createLineInsertion(1, 1, 0),
                createLineChange(2, 3, 3, 4, [
                    createCharChange(2, 1, 3, 1, 3, 1, 3, 4),
                    createCharChange(3, 5, 3, 5, 3, 8, 4, 4)
                ]),
                createLineDeletion(5, 5, 5)
            ];
            assertDiff(original, modified, expected);
        });
        test('char change postprocessing merges', () => {
            const original = ['abba'];
            const modified = ['azzzbzzzbzzza'];
            const expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharChange(1, 2, 1, 4, 1, 2, 1, 13)
                ])
            ];
            assertDiff(original, modified, expected, true, true);
        });
        test('ignore trim whitespace', () => {
            const original = ['\t\t foo ', 'abcd', 'efgh', '\t\t BAR\t\t'];
            const modified = ['  hello\t', '\t foo   \t', 'zzzefgh', 'xxx', '   BAR   \t'];
            const expected = [
                createLineInsertion(1, 1, 0),
                createLineChange(2, 3, 3, 4, [
                    createCharChange(2, 1, 2, 5, 3, 1, 3, 4),
                    createCharChange(3, 5, 3, 5, 4, 1, 4, 4)
                ])
            ];
            assertDiff(original, modified, expected, true, false, true);
        });
        test('issue #12122 r.hasOwnProperty is not a function', () => {
            const original = ['hasOwnProperty'];
            const modified = ['hasOwnProperty', 'and another line'];
            const expected = [
                createLineInsertion(2, 2, 1)
            ];
            assertDiff(original, modified, expected);
        });
        test('empty diff 1', () => {
            const original = [''];
            const modified = ['something'];
            const expected = [
                createLineChange(1, 1, 1, 1, undefined)
            ];
            assertDiff(original, modified, expected, true, false, true);
        });
        test('empty diff 2', () => {
            const original = [''];
            const modified = ['something', 'something else'];
            const expected = [
                createLineChange(1, 1, 1, 2, undefined)
            ];
            assertDiff(original, modified, expected, true, false, true);
        });
        test('empty diff 3', () => {
            const original = ['something', 'something else'];
            const modified = [''];
            const expected = [
                createLineChange(1, 2, 1, 1, undefined)
            ];
            assertDiff(original, modified, expected, true, false, true);
        });
        test('empty diff 4', () => {
            const original = ['something'];
            const modified = [''];
            const expected = [
                createLineChange(1, 1, 1, 1, undefined)
            ];
            assertDiff(original, modified, expected, true, false, true);
        });
        test('empty diff 5', () => {
            const original = [''];
            const modified = [''];
            const expected = [];
            assertDiff(original, modified, expected, true, false, true);
        });
        test('pretty diff 1', () => {
            const original = [
                'suite(function () {',
                '	test1() {',
                '		assert.ok(true);',
                '	}',
                '',
                '	test2() {',
                '		assert.ok(true);',
                '	}',
                '});',
                '',
            ];
            const modified = [
                '// An insertion',
                'suite(function () {',
                '	test1() {',
                '		assert.ok(true);',
                '	}',
                '',
                '	test2() {',
                '		assert.ok(true);',
                '	}',
                '',
                '	test3() {',
                '		assert.ok(true);',
                '	}',
                '});',
                '',
            ];
            const expected = [
                createLineInsertion(1, 1, 0),
                createLineInsertion(10, 13, 8)
            ];
            assertDiff(original, modified, expected, true, false, true);
        });
        test('pretty diff 2', () => {
            const original = [
                '// Just a comment',
                '',
                'function compute(a, b, c, d) {',
                '	if (a) {',
                '		if (b) {',
                '			if (c) {',
                '				return 5;',
                '			}',
                '		}',
                '		// These next lines will be deleted',
                '		if (d) {',
                '			return -1;',
                '		}',
                '		return 0;',
                '	}',
                '}',
            ];
            const modified = [
                '// Here is an inserted line',
                '// and another inserted line',
                '// and another one',
                '// Just a comment',
                '',
                'function compute(a, b, c, d) {',
                '	if (a) {',
                '		if (b) {',
                '			if (c) {',
                '				return 5;',
                '			}',
                '		}',
                '		return 0;',
                '	}',
                '}',
            ];
            const expected = [
                createLineInsertion(1, 3, 0),
                createLineDeletion(10, 13, 12),
            ];
            assertDiff(original, modified, expected, true, false, true);
        });
        test('pretty diff 3', () => {
            const original = [
                'class A {',
                '	/**',
                '	 * m1',
                '	 */',
                '	method1() {}',
                '',
                '	/**',
                '	 * m3',
                '	 */',
                '	method3() {}',
                '}',
            ];
            const modified = [
                'class A {',
                '	/**',
                '	 * m1',
                '	 */',
                '	method1() {}',
                '',
                '	/**',
                '	 * m2',
                '	 */',
                '	method2() {}',
                '',
                '	/**',
                '	 * m3',
                '	 */',
                '	method3() {}',
                '}',
            ];
            const expected = [
                createLineInsertion(7, 11, 6)
            ];
            assertDiff(original, modified, expected, true, false, true);
        });
        test('issue #23636', () => {
            const original = [
                'if(!TextDrawLoad[playerid])',
                '{',
                '',
                '	TextDrawHideForPlayer(playerid,TD_AppleJob[3]);',
                '	TextDrawHideForPlayer(playerid,TD_AppleJob[4]);',
                '	if(!AppleJobTreesType[AppleJobTreesPlayerNum[playerid]])',
                '	{',
                '		for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[5+i]);',
                '	}',
                '	else',
                '	{',
                '		for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[15+i]);',
                '	}',
                '}',
                'else',
                '{',
                '	TextDrawHideForPlayer(playerid,TD_AppleJob[3]);',
                '	TextDrawHideForPlayer(playerid,TD_AppleJob[27]);',
                '	if(!AppleJobTreesType[AppleJobTreesPlayerNum[playerid]])',
                '	{',
                '		for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[28+i]);',
                '	}',
                '	else',
                '	{',
                '		for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[38+i]);',
                '	}',
                '}',
            ];
            const modified = [
                '	if(!TextDrawLoad[playerid])',
                '	{',
                '	',
                '		TextDrawHideForPlayer(playerid,TD_AppleJob[3]);',
                '		TextDrawHideForPlayer(playerid,TD_AppleJob[4]);',
                '		if(!AppleJobTreesType[AppleJobTreesPlayerNum[playerid]])',
                '		{',
                '			for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[5+i]);',
                '		}',
                '		else',
                '		{',
                '			for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[15+i]);',
                '		}',
                '	}',
                '	else',
                '	{',
                '		TextDrawHideForPlayer(playerid,TD_AppleJob[3]);',
                '		TextDrawHideForPlayer(playerid,TD_AppleJob[27]);',
                '		if(!AppleJobTreesType[AppleJobTreesPlayerNum[playerid]])',
                '		{',
                '			for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[28+i]);',
                '		}',
                '		else',
                '		{',
                '			for(new i=0;i<10;i++) if(StatusTD_AppleJobApples[playerid][i]) TextDrawHideForPlayer(playerid,TD_AppleJob[38+i]);',
                '		}',
                '	}',
            ];
            const expected = [
                createLineChange(1, 27, 1, 27, [
                    createCharChange(1, 1, 1, 1, 1, 1, 1, 2),
                    createCharChange(2, 1, 2, 1, 2, 1, 2, 2),
                    createCharChange(3, 1, 3, 1, 3, 1, 3, 2),
                    createCharChange(4, 1, 4, 1, 4, 1, 4, 2),
                    createCharChange(5, 1, 5, 1, 5, 1, 5, 2),
                    createCharChange(6, 1, 6, 1, 6, 1, 6, 2),
                    createCharChange(7, 1, 7, 1, 7, 1, 7, 2),
                    createCharChange(8, 1, 8, 1, 8, 1, 8, 2),
                    createCharChange(9, 1, 9, 1, 9, 1, 9, 2),
                    createCharChange(10, 1, 10, 1, 10, 1, 10, 2),
                    createCharChange(11, 1, 11, 1, 11, 1, 11, 2),
                    createCharChange(12, 1, 12, 1, 12, 1, 12, 2),
                    createCharChange(13, 1, 13, 1, 13, 1, 13, 2),
                    createCharChange(14, 1, 14, 1, 14, 1, 14, 2),
                    createCharChange(15, 1, 15, 1, 15, 1, 15, 2),
                    createCharChange(16, 1, 16, 1, 16, 1, 16, 2),
                    createCharChange(17, 1, 17, 1, 17, 1, 17, 2),
                    createCharChange(18, 1, 18, 1, 18, 1, 18, 2),
                    createCharChange(19, 1, 19, 1, 19, 1, 19, 2),
                    createCharChange(20, 1, 20, 1, 20, 1, 20, 2),
                    createCharChange(21, 1, 21, 1, 21, 1, 21, 2),
                    createCharChange(22, 1, 22, 1, 22, 1, 22, 2),
                    createCharChange(23, 1, 23, 1, 23, 1, 23, 2),
                    createCharChange(24, 1, 24, 1, 24, 1, 24, 2),
                    createCharChange(25, 1, 25, 1, 25, 1, 25, 2),
                    createCharChange(26, 1, 26, 1, 26, 1, 26, 2),
                    createCharChange(27, 1, 27, 1, 27, 1, 27, 2),
                ])
                // createLineInsertion(7, 11, 6)
            ];
            assertDiff(original, modified, expected, true, true, false);
        });
        test('issue #43922', () => {
            const original = [
                ' * `yarn [install]` -- Install project NPM dependencies. This is automatically done when you first create the project. You should only need to run this if you add dependencies in `package.json`.',
            ];
            const modified = [
                ' * `yarn` -- Install project NPM dependencies. You should only need to run this if you add dependencies in `package.json`.',
            ];
            const expected = [
                createLineChange(1, 1, 1, 1, [
                    createCharChange(1, 9, 1, 19, 1, 9, 1, 9),
                    createCharChange(1, 58, 1, 120, 1, 48, 1, 48),
                ])
            ];
            assertDiff(original, modified, expected, true, true, false);
        });
        test('issue #42751', () => {
            const original = [
                '    1',
                '  2',
            ];
            const modified = [
                '    1',
                '   3',
            ];
            const expected = [
                createLineChange(2, 2, 2, 2, [
                    createCharChange(2, 3, 2, 4, 2, 3, 2, 5)
                ])
            ];
            assertDiff(original, modified, expected, true, true, false);
        });
        test('does not give character changes', () => {
            const original = [
                '    1',
                '  2',
                'A',
            ];
            const modified = [
                '    1',
                '   3',
                ' A',
            ];
            const expected = [
                createLineChange(2, 3, 2, 3)
            ];
            assertDiff(original, modified, expected, false, false, false);
        });
        test('issue #44422: Less than ideal diff results', () => {
            const original = [
                'export class C {',
                '',
                '	public m1(): void {',
                '		{',
                '		//2',
                '		//3',
                '		//4',
                '		//5',
                '		//6',
                '		//7',
                '		//8',
                '		//9',
                '		//10',
                '		//11',
                '		//12',
                '		//13',
                '		//14',
                '		//15',
                '		//16',
                '		//17',
                '		//18',
                '		}',
                '	}',
                '',
                '	public m2(): void {',
                '		if (a) {',
                '			if (b) {',
                '				//A1',
                '				//A2',
                '				//A3',
                '				//A4',
                '				//A5',
                '				//A6',
                '				//A7',
                '				//A8',
                '			}',
                '		}',
                '',
                '		//A9',
                '		//A10',
                '		//A11',
                '		//A12',
                '		//A13',
                '		//A14',
                '		//A15',
                '	}',
                '',
                '	public m3(): void {',
                '		if (a) {',
                '			//B1',
                '		}',
                '		//B2',
                '		//B3',
                '	}',
                '',
                '	public m4(): boolean {',
                '		//1',
                '		//2',
                '		//3',
                '		//4',
                '	}',
                '',
                '}',
            ];
            const modified = [
                'export class C {',
                '',
                '	constructor() {',
                '',
                '',
                '',
                '',
                '	}',
                '',
                '	public m1(): void {',
                '		{',
                '		//2',
                '		//3',
                '		//4',
                '		//5',
                '		//6',
                '		//7',
                '		//8',
                '		//9',
                '		//10',
                '		//11',
                '		//12',
                '		//13',
                '		//14',
                '		//15',
                '		//16',
                '		//17',
                '		//18',
                '		}',
                '	}',
                '',
                '	public m4(): boolean {',
                '		//1',
                '		//2',
                '		//3',
                '		//4',
                '	}',
                '',
                '}',
            ];
            const expected = [
                createLineChange(2, 0, 3, 9),
                createLineChange(25, 55, 31, 0)
            ];
            assertDiff(original, modified, expected, false, false, false);
        });
        test('gives preference to matching longer lines', () => {
            const original = [
                'A',
                'A',
                'BB',
                'C',
            ];
            const modified = [
                'A',
                'BB',
                'A',
                'D',
                'E',
                'A',
                'C',
            ];
            const expected = [
                createLineChange(2, 2, 1, 0),
                createLineChange(3, 0, 3, 6)
            ];
            assertDiff(original, modified, expected, false, false, false);
        });
        test('issue #119051: gives preference to fewer diff hunks', () => {
            const original = [
                '1',
                '',
                '',
                '2',
                '',
            ];
            const modified = [
                '1',
                '',
                '1.5',
                '',
                '',
                '2',
                '',
                '3',
                '',
            ];
            const expected = [
                createLineChange(2, 0, 3, 4),
                createLineChange(5, 0, 8, 9)
            ];
            assertDiff(original, modified, expected, false, false, false);
        });
        test('issue #121436: Diff chunk contains an unchanged line part 1', () => {
            const original = [
                'if (cond) {',
                '    cmd',
                '}',
            ];
            const modified = [
                'if (cond) {',
                '    if (other_cond) {',
                '        cmd',
                '    }',
                '}',
            ];
            const expected = [
                createLineChange(1, 0, 2, 2),
                createLineChange(2, 0, 4, 4)
            ];
            assertDiff(original, modified, expected, false, false, true);
        });
        test('issue #121436: Diff chunk contains an unchanged line part 2', () => {
            const original = [
                'if (cond) {',
                '    cmd',
                '}',
            ];
            const modified = [
                'if (cond) {',
                '    if (other_cond) {',
                '        cmd',
                '    }',
                '}',
            ];
            const expected = [
                createLineChange(1, 0, 2, 2),
                createLineChange(2, 2, 3, 3),
                createLineChange(2, 0, 4, 4)
            ];
            assertDiff(original, modified, expected, false, false, false);
        });
        test('issue #169552: Assertion error when having both leading and trailing whitespace diffs', () => {
            const original = [
                'if True:',
                '    print(2)',
            ];
            const modified = [
                'if True:',
                '\tprint(2) ',
            ];
            const expected = [
                createLineChange(2, 2, 2, 2, [
                    createCharChange(2, 1, 2, 5, 2, 1, 2, 2),
                    createCharChange(2, 13, 2, 13, 2, 10, 2, 11),
                ]),
            ];
            assertDiff(original, modified, expected, true, false, false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkNvbXB1dGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vZGlmZi9kaWZmQ29tcHV0ZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxTQUFTLFVBQVUsQ0FBQyxhQUF1QixFQUFFLGFBQXVCLEVBQUUsZUFBOEIsRUFBRSwyQkFBb0MsSUFBSSxFQUFFLCtCQUF3QyxLQUFLLEVBQUUsNkJBQXNDLEtBQUs7UUFDek8sTUFBTSxZQUFZLEdBQUcsSUFBSSxzQ0FBWSxDQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUU7WUFDbkUsd0JBQXdCO1lBQ3hCLDRCQUE0QjtZQUM1QiwwQkFBMEI7WUFDMUIsb0JBQW9CLEVBQUUsSUFBSTtZQUMxQixrQkFBa0IsRUFBRSxDQUFDO1NBQ3JCLENBQUMsQ0FBQztRQUNILE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUM7UUFFbkQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxVQUF1QixFQUFFLEVBQUU7WUFDakQsT0FBTztnQkFDTix1QkFBdUIsRUFBRSxVQUFVLENBQUMsdUJBQXVCO2dCQUMzRCxtQkFBbUIsRUFBRSxVQUFVLENBQUMsbUJBQW1CO2dCQUNuRCxxQkFBcUIsRUFBRSxVQUFVLENBQUMscUJBQXFCO2dCQUN2RCxpQkFBaUIsRUFBRSxVQUFVLENBQUMsaUJBQWlCO2dCQUMvQyx1QkFBdUIsRUFBRSxVQUFVLENBQUMsdUJBQXVCO2dCQUMzRCxtQkFBbUIsRUFBRSxVQUFVLENBQUMsbUJBQW1CO2dCQUNuRCxxQkFBcUIsRUFBRSxVQUFVLENBQUMscUJBQXFCO2dCQUN2RCxpQkFBaUIsRUFBRSxVQUFVLENBQUMsaUJBQWlCO2FBQy9DLENBQUM7UUFDSCxDQUFDLENBQUM7UUFFRixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMs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QUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsVUFBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxFQUFFO1lBQ3JDLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDMUQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsVUFBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO1lBQ3hDLE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbEUsTUFBTSxRQUFRLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsVUFBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO1lBQ3pDLE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEYsTUFBTSxRQUFRLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsVUFBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsMENBQTBDLEVBQUUsR0FBRyxFQUFFO1lBQ3JELE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEYsTUFBTSxRQUFRLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RSxVQUFVLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztRQUVILGlCQUFpQjtRQUVqQixJQUFJLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1lBQ25DLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsVUFBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1lBQ3BDLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQzFELE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsVUFBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1lBQ3BDLE1BQU0sUUFBUSxHQUFHLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsVUFBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1lBQ3BDLE1BQU0sUUFBUSxHQUFHLENBQUMsVUFBVSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzFELE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsVUFBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFF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LGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3hDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3hDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3hDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3hDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3hDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3hDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3hDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3hDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7aUJBQzVDLENBQ0Q7Z0JBQ0QsZ0NBQWdDO2FBQ2hDLENBQUM7WUFDRixVQUFVLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3RCxDQUFDLENBQUMs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