/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/textChange"], function (require, exports, assert, utils_1, textChange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const GENERATE_TESTS = false;
    suite('TextChangeCompressor', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function getResultingContent(initialContent, edits) {
            let content = initialContent;
            for (let i = edits.length - 1; i >= 0; i--) {
                content = (content.substring(0, edits[i].offset) +
                    edits[i].text +
                    content.substring(edits[i].offset + edits[i].length));
            }
            return content;
        }
        function getTextChanges(initialContent, edits) {
            let content = initialContent;
            const changes = new Array(edits.length);
            let deltaOffset = 0;
            for (let i = 0; i < edits.length; i++) {
                const edit = edits[i];
                const position = edit.offset + deltaOffset;
                const length = edit.length;
                const text = edit.text;
                const oldText = content.substr(position, length);
                content = (content.substr(0, position) +
                    text +
                    content.substr(position + length));
                changes[i] = new textChange_1.TextChange(edit.offset, oldText, position, text);
                deltaOffset += text.length - length;
            }
            return changes;
        }
        function assertCompression(initialText, edit1, edit2) {
            const tmpText = getResultingContent(initialText, edit1);
            const chg1 = getTextChanges(initialText, edit1);
            const finalText = getResultingContent(tmpText, edit2);
            const chg2 = getTextChanges(tmpText, edit2);
            const compressedTextChanges = (0, textChange_1.compressConsecutiveTextChanges)(chg1, chg2);
            // Check that the compression was correct
            const compressedDoTextEdits = compressedTextChanges.map((change) => {
                return {
                    offset: change.oldPosition,
                    length: change.oldLength,
                    text: change.newText
                };
            });
            const actualDoResult = getResultingContent(initialText, compressedDoTextEdits);
            assert.strictEqual(actualDoResult, finalText);
            const compressedUndoTextEdits = compressedTextChanges.map((change) => {
                return {
                    offset: change.newPosition,
                    length: change.newLength,
                    text: change.oldText
                };
            });
            const actualUndoResult = getResultingContent(finalText, compressedUndoTextEdits);
            assert.strictEqual(actualUndoResult, initialText);
        }
        test('simple 1', () => {
            assertCompression('', [{ offset: 0, length: 0, text: 'h' }], [{ offset: 1, length: 0, text: 'e' }]);
        });
        test('simple 2', () => {
            assertCompression('|', [{ offset: 0, length: 0, text: 'h' }], [{ offset: 2, length: 0, text: 'e' }]);
        });
        test('complex1', () => {
            assertCompression('abcdefghij', [
                { offset: 0, length: 3, text: 'qh' },
                { offset: 5, length: 0, text: '1' },
                { offset: 8, length: 2, text: 'X' }
            ], [
                { offset: 1, length: 0, text: 'Z' },
                { offset: 3, length: 3, text: 'Y' },
            ]);
        });
        // test('issue #118041', () => {
        // 	assertCompression(
        // 		'﻿',
        // 		[
        // 			{ offset: 0, length: 1, text: '' },
        // 		],
        // 		[
        // 			{ offset: 1, length: 0, text: 'Z' },
        // 			{ offset: 3, length: 3, text: 'Y' },
        // 		]
        // 	);
        // })
        test('gen1', () => {
            assertCompression('kxm', [{ offset: 0, length: 1, text: 'tod_neu' }], [{ offset: 1, length: 2, text: 'sag_e' }]);
        });
        test('gen2', () => {
            assertCompression('kpb_r_v', [{ offset: 5, length: 2, text: 'a_jvf_l' }], [{ offset: 10, length: 2, text: 'w' }]);
        });
        test('gen3', () => {
            assertCompression('slu_w', [{ offset: 4, length: 1, text: '_wfw' }], [{ offset: 3, length: 5, text: '' }]);
        });
        test('gen4', () => {
            assertCompression('_e', [{ offset: 2, length: 0, text: 'zo_b' }], [{ offset: 1, length: 3, text: 'tra' }]);
        });
        test('gen5', () => {
            assertCompression('ssn_', [{ offset: 0, length: 2, text: 'tat_nwe' }], [{ offset: 2, length: 6, text: 'jm' }]);
        });
        test('gen6', () => {
            assertCompression('kl_nru', [{ offset: 4, length: 1, text: '' }], [{ offset: 1, length: 4, text: '__ut' }]);
        });
        const _a = 'a'.charCodeAt(0);
        const _z = 'z'.charCodeAt(0);
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        function getRandomString(minLength, maxLength) {
            const length = getRandomInt(minLength, maxLength);
            let r = '';
            for (let i = 0; i < length; i++) {
                r += String.fromCharCode(getRandomInt(_a, _z));
            }
            return r;
        }
        function getRandomEOL() {
            switch (getRandomInt(1, 3)) {
                case 1: return '\r';
                case 2: return '\n';
                case 3: return '\r\n';
            }
            throw new Error(`not possible`);
        }
        function getRandomBuffer(small) {
            const lineCount = getRandomInt(1, small ? 3 : 10);
            const lines = [];
            for (let i = 0; i < lineCount; i++) {
                lines.push(getRandomString(0, small ? 3 : 10) + getRandomEOL());
            }
            return lines.join('');
        }
        function getRandomEdits(content, min = 1, max = 5) {
            const result = [];
            let cnt = getRandomInt(min, max);
            let maxOffset = content.length;
            while (cnt > 0 && maxOffset > 0) {
                const offset = getRandomInt(0, maxOffset);
                const length = getRandomInt(0, maxOffset - offset);
                const text = getRandomBuffer(true);
                result.push({
                    offset: offset,
                    length: length,
                    text: text
                });
                maxOffset = offset;
                cnt--;
            }
            result.reverse();
            return result;
        }
        class GeneratedTest {
            constructor() {
                this._content = getRandomBuffer(false).replace(/\n/g, '_');
                this._edits1 = getRandomEdits(this._content, 1, 5).map((e) => { return { offset: e.offset, length: e.length, text: e.text.replace(/\n/g, '_') }; });
                const tmp = getResultingContent(this._content, this._edits1);
                this._edits2 = getRandomEdits(tmp, 1, 5).map((e) => { return { offset: e.offset, length: e.length, text: e.text.replace(/\n/g, '_') }; });
            }
            print() {
                console.log(`assertCompression(${JSON.stringify(this._content)}, ${JSON.stringify(this._edits1)}, ${JSON.stringify(this._edits2)});`);
            }
            assert() {
                assertCompression(this._content, this._edits1, this._edits2);
            }
        }
        if (GENERATE_TESTS) {
            let testNumber = 0;
            while (true) {
                testNumber++;
                console.log(`------RUNNING TextChangeCompressor TEST ${testNumber}`);
                const test = new GeneratedTest();
                try {
                    test.assert();
                }
                catch (err) {
                    console.log(err);
                    test.print();
                    break;
                }
            }
        }
    });
    suite('TextChange', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('issue #118041: unicode character undo bug', () => {
            const textChange = new textChange_1.TextChange(428, '﻿', 428, '');
            const buff = new Uint8Array(textChange.writeSize());
            textChange.write(buff, 0);
            const actual = [];
            textChange_1.TextChange.read(buff, 0, actual);
            assert.deepStrictEqual(actual[0], textChange);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dENoYW5nZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvY29tbW9uL21vZGVsL3RleHRDaGFuZ2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU1oRyxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUM7SUFRN0IsS0FBSyxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtRQUVsQyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsU0FBUyxtQkFBbUIsQ0FBQyxjQUFzQixFQUFFLEtBQXVCO1lBQzNFLElBQUksT0FBTyxHQUFHLGNBQWMsQ0FBQztZQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzNDLE9BQU8sR0FBRyxDQUNULE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7b0JBQ3JDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNiLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQ3BELENBQUM7YUFDRjtZQUNELE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7UUFFRCxTQUFTLGNBQWMsQ0FBQyxjQUFzQixFQUFFLEtBQXVCO1lBQ3RFLElBQUksT0FBTyxHQUFHLGNBQWMsQ0FBQztZQUM3QixNQUFNLE9BQU8sR0FBaUIsSUFBSSxLQUFLLENBQWEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xFLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztZQUVwQixLQUFLLElBQUksQ0FBQyxHQUFH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