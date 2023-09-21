/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/diff/diff"], function (require, exports, assert, diff_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createArray(length, value) {
        const r = [];
        for (let i = 0; i < length; i++) {
            r[i] = value;
        }
        return r;
    }
    function maskBasedSubstring(str, mask) {
        let r = '';
        for (let i = 0; i < str.length; i++) {
            if (mask[i]) {
                r += str.charAt(i);
            }
        }
        return r;
    }
    function assertAnswer(originalStr, modifiedStr, changes, answerStr, onlyLength = false) {
        const originalMask = createArray(originalStr.length, true);
        const modifiedMask = createArray(modifiedStr.length, true);
        let i, j, change;
        for (i = 0; i < changes.length; i++) {
            change = changes[i];
            if (change.originalLength) {
                for (j = 0; j < change.originalLength; j++) {
                    originalMask[change.originalStart + j] = false;
                }
            }
            if (change.modifiedLength) {
                for (j = 0; j < change.modifiedLength; j++) {
                    modifiedMask[change.modifiedStart + j] = false;
                }
            }
        }
        const originalAnswer = maskBasedSubstring(originalStr, originalMask);
        const modifiedAnswer = maskBasedSubstring(modifiedStr, modifiedMask);
        if (onlyLength) {
            assert.strictEqual(originalAnswer.length, answerStr.length);
            assert.strictEqual(modifiedAnswer.length, answerStr.length);
        }
        else {
            assert.strictEqual(originalAnswer, answerStr);
            assert.strictEqual(modifiedAnswer, answerStr);
        }
    }
    function lcsInnerTest(originalStr, modifiedStr, answerStr, onlyLength = false) {
        const diff = new diff_1.LcsDiff(new diff_1.StringDiffSequence(originalStr), new diff_1.StringDiffSequence(modifiedStr));
        const changes = diff.ComputeDiff(false).changes;
        assertAnswer(originalStr, modifiedStr, changes, answerStr, onlyLength);
    }
    function stringPower(str, power) {
        let r = str;
        for (let i = 0; i < power; i++) {
            r += r;
        }
        return r;
    }
    function lcsTest(originalStr, modifiedStr, answerStr) {
        lcsInnerTest(originalStr, modifiedStr, answerStr);
        for (let i = 2; i <= 5; i++) {
            lcsInnerTest(stringPower(originalStr, i), stringPower(modifiedStr, i), stringPower(answerStr, i), true);
        }
    }
    suite('Diff', () => {
        test('LcsDiff - different strings tests', function () {
            this.timeout(10000);
            lcsTest('heLLo world', 'hello orlando', 'heo orld');
            lcsTest('abcde', 'acd', 'acd'); // simple
            lcsTest('abcdbce', 'bcede', 'bcde'); // skip
            lcsTest('abcdefgabcdefg', 'bcehafg', 'bceafg'); // long
            lcsTest('abcde', 'fgh', ''); // no match
            lcsTest('abcfabc', 'fabc', 'fabc');
            lcsTest('0azby0', '9axbzby9', 'azby');
            lcsTest('0abc00000', '9a1b2c399999', 'abc');
            lcsTest('fooBar', 'myfooBar', 'fooBar'); // all insertions
            lcsTest('fooBar', 'fooMyBar', 'fooBar'); // all insertions
            lcsTest('fooBar', 'fooBar', 'fooBar'); // identical sequences
        });
    });
    suite('Diff - Ported from VS', () => {
        test('using continue processing predicate to quit early', function () {
            const left = 'abcdef';
            const right = 'abxxcyyydzzzzezzzzzzzzzzzzzzzzzzzzf';
            // We use a long non-matching portion at the end of the right-side string, so the backwards tracking logic
            // doesn't get there first.
            let predicateCallCount = 0;
            let diff = new diff_1.LcsDiff(new diff_1.StringDiffSequence(left), new diff_1.StringDiffSequence(right), function (leftIndex, longestMatchSoFar) {
                assert.strictEqual(predicateCallCount, 0);
                predicateCallCount++;
                assert.strictEqual(leftIndex, 1);
                // cancel processing
                return false;
            });
            let changes = diff.ComputeDiff(true).changes;
            assert.strictEqual(predicateCallCount, 1);
            // Doesn't include 'c', 'd', or 'e', since we quit on the first request
            assertAnswer(left, right, changes, 'abf');
            // Cancel after the first match ('c')
            diff = new diff_1.LcsDiff(new diff_1.StringDiffSequence(left), new diff_1.StringDiffSequence(right), function (leftIndex, longestMatchSoFar) {
                assert(longestMatchSoFar <= 1); // We never see a match of length > 1
                // Continue processing as long as there hasn't been a match made.
                return longestMatchSoFar < 1;
            });
            changes = diff.ComputeDiff(true).changes;
            assertAnswer(left, right, changes, 'abcf');
            // Cancel after the second match ('d')
            diff = new diff_1.LcsDiff(new diff_1.StringDiffSequence(left), new diff_1.StringDiffSequence(right), function (leftIndex, longestMatchSoFar) {
                assert(longestMatchSoFar <= 2); // We never see a match of length > 2
                // Continue processing as long as there hasn't been a match made.
                return longestMatchSoFar < 2;
            });
            changes = diff.ComputeDiff(true).changes;
            assertAnswer(left, right, changes, 'abcdf');
            // Cancel *one iteration* after the second match ('d')
            let hitSecondMatch = false;
            diff = new diff_1.LcsDiff(new diff_1.StringDiffSequence(left), new diff_1.StringDiffSequence(right), function (leftIndex, longestMatchSoFar) {
                assert(longestMatchSoFar <= 2); // We never see a match of length > 2
                const hitYet = hitSecondMatch;
                hitSecondMatch = longestMatchSoFar > 1;
                // Continue processing as long as there hasn't been a match made.
                return !hitYet;
            });
            changes = diff.ComputeDiff(true).changes;
            assertAnswer(left, right, changes, 'abcdf');
            // Cancel after the third and final match ('e')
            diff = new diff_1.LcsDiff(new diff_1.StringDiffSequence(left), new diff_1.StringDiffSequence(right), function (leftIndex, longestMatchSoFar) {
                assert(longestMatchSoFar <= 3); // We never see a match of length > 3
                // Continue processing as long as there hasn't been a match made.
                return longestMatchSoFar < 3;
            });
            changes = diff.ComputeDiff(true).changes;
            assertAnswer(left, right, changes, 'abcdef');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZi50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9kaWZmL2RpZmYudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQUtoRyxTQUFTLFdBQVcsQ0FBSSxNQUFjLEVBQUUsS0FBUTtRQUMvQyxNQUFNLENBQUMsR0FBUSxFQUFFLENBQUM7UUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNoQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ2I7UUFDRCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUM7SUFFRCxTQUFTLGtCQUFrQixDQUFDLEdBQVcsRUFBRSxJQUFlO1FBQ3ZELElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNYLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3BDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNaLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ25CO1NBQ0Q7UUFDRCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUM7SUFFRCxTQUFTLFlBQVksQ0FBQyxXQUFtQixFQUFFLFdBQW1CLEVBQUUsT0FBc0IsRUFBRSxTQUFpQixFQUFFLGFBQXNCLEtBQUs7UUFDckksTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0QsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFM0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFF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