/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/browser/controller/textAreaState", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, utils_1, textAreaState_1, range_1, selection_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MockTextAreaWrapper extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._value = '';
            this._selectionStart = 0;
            this._selectionEnd = 0;
        }
        getValue() {
            return this._value;
        }
        setValue(reason, value) {
            this._value = value;
            this._selectionStart = this._value.length;
            this._selectionEnd = this._value.length;
        }
        getSelectionStart() {
            return this._selectionStart;
        }
        getSelectionEnd() {
            return this._selectionEnd;
        }
        setSelectionRange(reason, selectionStart, selectionEnd) {
            if (selectionStart < 0) {
                selectionStart = 0;
            }
            if (selectionStart > this._value.length) {
                selectionStart = this._value.length;
            }
            if (selectionEnd < 0) {
                selectionEnd = 0;
            }
            if (selectionEnd > this._value.length) {
                selectionEnd = this._value.length;
            }
            this._selectionStart = selectionStart;
            this._selectionEnd = selectionEnd;
        }
    }
    function equalsTextAreaState(a, b) {
        return (a.value === b.value
            && a.selectionStart === b.selectionStart
            && a.selectionEnd === b.selectionEnd
            && range_1.Range.equalsRange(a.selection, b.selection)
            && a.newlineCountBeforeSelection === b.newlineCountBeforeSelection);
    }
    suite('TextAreaState', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function assertTextAreaState(actual, value, selectionStart, selectionEnd) {
            const desired = new textAreaState_1.TextAreaState(value, selectionStart, selectionEnd, null, undefined);
            assert.ok(equalsTextAreaState(desired, actual), desired.toString() + ' == ' + actual.toString());
        }
        test('fromTextArea', () => {
            const textArea = new MockTextAreaWrapper();
            textArea._value = 'Hello world!';
            textArea._selectionStart = 1;
            textArea._selectionEnd = 12;
            let actual = textAreaState_1.TextAreaState.readFromTextArea(textArea, null);
            assertTextAreaState(actual, 'Hello world!', 1, 12);
            assert.strictEqual(actual.value, 'Hello world!');
            assert.strictEqual(actual.selectionStart, 1);
            actual = actual.collapseSelection();
            assertTextAreaState(actual, 'Hello world!', 12, 12);
            textArea.dispose();
        });
        test('applyToTextArea', () => {
            const textArea = new MockTextAreaWrapper();
            textArea._value = 'Hello world!';
            textArea._selectionStart = 1;
            textArea._selectionEnd = 12;
            let state = new textAreaState_1.TextAreaState('Hi world!', 2, 2, null, undefined);
            state.writeToTextArea('test', textArea, false);
            assert.strictEqual(textArea._value, 'Hi world!');
            assert.strictEqual(textArea._selectionStart, 9);
            assert.strictEqual(textArea._selectionEnd, 9);
            state = new textAreaState_1.TextAreaState('Hi world!', 3, 3, null, undefined);
            state.writeToTextArea('test', textArea, false);
            assert.strictEqual(textArea._value, 'Hi world!');
            assert.strictEqual(textArea._selectionStart, 9);
            assert.strictEqual(textArea._selectionEnd, 9);
            state = new textAreaState_1.TextAreaState('Hi world!', 0, 2, null, undefined);
            state.writeToTextArea('test', textArea, true);
            assert.strictEqual(textArea._value, 'Hi world!');
            assert.strictEqual(textArea._selectionStart, 0);
            assert.strictEqual(textArea._selectionEnd, 2);
            textArea.dispose();
        });
        function testDeduceInput(prevState, value, selectionStart, selectionEnd, couldBeEmojiInput, expected, expectedCharReplaceCnt) {
            prevState = prevState || textAreaState_1.TextAreaState.EMPTY;
            const textArea = new MockTextAreaWrapper();
            textArea._value = value;
            textArea._selectionStart = selectionStart;
            textArea._selectionEnd = selectionEnd;
            const newState = textAreaState_1.TextAreaState.readFromTextArea(textArea, null);
            const actual = textAreaState_1.TextAreaState.deduceInput(prevState, newState, couldBeEmojiInput);
            assert.deepStrictEqual(actual, {
                text: expected,
                replacePrevCharCnt: expectedCharReplaceCnt,
                replaceNextCharCnt: 0,
                positionDelta: 0,
            });
            textArea.dispose();
        }
        test('extractNewText - no previous state with selection', () => {
            testDeduceInput(null, 'a', 0, 1, true, 'a', 0);
        });
        test('issue #2586: Replacing selected end-of-line with newline locks up the document', () => {
            testDeduceInput(new textAreaState_1.TextAreaState(']\n', 1, 2, null, undefined), ']\n', 2, 2, true, '\n', 0);
        });
        test('extractNewText - no previous state without selection', () => {
            testDeduceInput(null, 'a', 1, 1, true, 'a', 0);
        });
        test('extractNewText - typing does not cause a selection', () => {
            testDeduceInput(textAreaState_1.TextAreaState.EMPTY, 'a', 0, 1, true, 'a', 0);
        });
        test('extractNewText - had the textarea empty', () => {
            testDeduceInput(textAreaState_1.TextAreaState.EMPTY, 'a', 1, 1, true, 'a', 0);
        });
        test('extractNewText - had the entire line selected', () => {
            testDeduceInput(new textAreaState_1.TextAreaState('Hello world!', 0, 12, null, undefined), 'H', 1, 1, true, 'H', 0);
        });
        test('extractNewText - had previous text 1', () => {
            testDeduceInput(new textAreaState_1.TextAreaState('Hello world!', 12, 12, null, undefined), 'Hello world!a', 13, 13, true, 'a', 0);
        });
        test('extractNewText - had previous text 2', () => {
            testDeduceInput(new textAreaState_1.TextAreaState('Hello world!', 0, 0, null, undefined), 'aHello world!', 1, 1, true, 'a', 0);
        });
        test('extractNewText - had previous text 3', () => {
            testDeduceInput(new textAreaState_1.TextAreaState('Hello world!', 6, 11, null, undefined), 'Hello other!', 11, 11, true, 'other', 0);
        });
        test('extractNewText - IME', () => {
            testDeduceInput(textAreaState_1.TextAreaState.EMPTY, 'これは', 3, 3, true, 'これは', 0);
        });
        test('extractNewText - isInOverwriteMode', () => {
            testDeduceInput(new textAreaState_1.TextAreaState('Hello world!', 0, 0, null, undefined), 'Aello world!', 1, 1, true, 'A', 0);
        });
        test('extractMacReplacedText - does nothing if there is selection', () => {
            testDeduceInput(new textAreaState_1.TextAreaState('Hello world!', 5, 5, null, undefined), 'Hellö world!', 4, 5, true, 'ö', 0);
        });
        test('extractMacReplacedText - does nothing if there is more than one extra char', () => {
            testDeduceInput(new textAreaState_1.TextAreaState('Hello world!', 5, 5, null, undefined), 'Hellöö world!', 5, 5, true, 'öö', 1);
        });
        test('extractMacReplacedText - does nothing if there is more than one changed char', () => {
            testDeduceInput(new textAreaState_1.TextAreaState('Hello world!', 5, 5, null, undefined), 'Helöö world!', 5, 5, true, 'öö', 2);
        });
        test('extractMacReplacedText', () => {
            testDeduceInput(new textAreaState_1.TextAreaState('Hello world!', 5, 5, null, undefined), 'Hellö world!', 5, 5, true, 'ö', 1);
        });
        test('issue #25101 - First key press ignored', () => {
            testDeduceInput(new textAreaState_1.TextAreaState('a', 0, 1, null, undefined), 'a', 1, 1, true, 'a', 0);
        });
        test('issue #16520 - Cmd-d of single character followed by typing same character as has no effect', () => {
            testDeduceInput(new textAreaState_1.TextAreaState('x x', 0, 1, null, undefined), 'x x', 1, 1, true, 'x', 0);
        });
        function testDeduceAndroidCompositionInput(prevState, value, selectionStart, selectionEnd, expected, expectedReplacePrevCharCnt, expectedReplaceNextCharCnt, expectedPositionDelta) {
            prevState = prevState || textAreaState_1.TextAreaState.EMPTY;
            const textArea = new MockTextAreaWrapper();
            textArea._value = value;
            textArea._selectionStart = selectionStart;
            textArea._selectionEnd = selectionEnd;
            const newState = textAreaState_1.TextAreaState.readFromTextArea(textArea, null);
            const actual = textAreaState_1.TextAreaState.deduceAndroidCompositionInput(prevState, newState);
            assert.deepStrictEqual(actual, {
                text: expected,
                replacePrevCharCnt: expectedReplacePrevCharCnt,
                replaceNextCharCnt: expectedReplaceNextCharCnt,
                positionDelta: expectedPositionDelta,
            });
            textArea.dispose();
        }
        test('Android composition input 1', () => {
            testDeduceAndroidCompositionInput(new textAreaState_1.TextAreaState('Microsoft', 4, 4, null, undefined), 'Microsoft', 4, 4, '', 0, 0, 0);
        });
        test('Android composition input 2', () => {
            testDeduceAndroidCompositionInput(new textAreaState_1.TextAreaState('Microsoft', 4, 4, null, undefined), 'Microsoft', 0, 9, '', 0, 0, 5);
        });
        test('Android composition input 3', () => {
            testDeduceAndroidCompositionInput(new textAreaState_1.TextAreaState('Microsoft', 0, 9, null, undefined), 'Microsoft\'s', 11, 11, '\'s', 0, 0, 0);
        });
        test('Android backspace', () => {
            testDeduceAndroidCompositionInput(new textAreaState_1.TextAreaState('undefinedVariable', 2, 2, null, undefined), 'udefinedVariable', 1, 1, '', 1, 0, 0);
        });
        suite('PagedScreenReaderStrategy', () => {
            function testPagedScreenReaderStrategy(lines, selection, expected) {
                const model = (0, testTextModel_1.createTextModel)(lines.join('\n'));
                const actual = textAreaState_1.PagedScreenReaderStrategy.fromEditorSelection(model, selection, 10, true);
                assert.ok(equalsTextAreaState(actual, expected));
                model.dispose();
            }
            test('simple', () => {
                testPagedScreenReaderStrategy([
                    'Hello world!'
                ], new selection_1.Selection(1, 13, 1, 13), new textAreaState_1.TextAreaState('Hello world!', 12, 12, new range_1.Range(1, 13, 1, 13), 0));
                testPagedScreenReaderStrategy([
                    'Hello world!'
                ], new selection_1.Selection(1, 1, 1, 1), new textAreaState_1.TextAreaState('Hello world!', 0, 0, new range_1.Range(1, 1, 1, 1), 0));
                testPagedScreenReaderStrategy([
                    'Hello world!'
                ], new selection_1.Selection(1, 1, 1, 6), new textAreaState_1.TextAreaState('Hello world!', 0, 5, new range_1.Range(1, 1, 1, 6), 0));
            });
            test('multiline', () => {
                testPagedScreenReaderStrategy([
                    'Hello world!',
                    'How are you?'
                ], new selection_1.Selection(1, 1, 1, 1), new textAreaState_1.TextAreaState('Hello world!\nHow are you?', 0, 0, new range_1.Range(1, 1, 1, 1), 0));
                testPagedScreenReaderStrategy([
                    'Hello world!',
                    'How are you?'
                ], new selection_1.Selection(2, 1, 2, 1), new textAreaState_1.TextAreaState('Hello world!\nHow are you?', 13, 13, new range_1.Range(2, 1, 2, 1), 1));
            });
            test('page', () => {
                testPagedScreenReaderStrategy([
                    'L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\nL11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\nL21'
                ], new selection_1.Selection(1, 1, 1, 1), new textAreaState_1.TextAreaState('L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\n', 0, 0, new range_1.Range(1, 1, 1, 1), 0));
                testPagedScreenReaderStrategy([
                    'L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\nL11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\nL21'
                ], new selection_1.Selection(11, 1, 11, 1), new textAreaState_1.TextAreaState('L11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\n', 0, 0, new range_1.Range(11, 1, 11, 1), 0));
                testPagedScreenReaderStrategy([
                    'L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\nL11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\nL21'
                ], new selection_1.Selection(12, 1, 12, 1), new textAreaState_1.TextAreaState('L11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\n', 4, 4, new range_1.Range(12, 1, 12, 1), 1));
                testPagedScreenReaderStrategy([
                    'L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\nL11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\nL21'
                ], new selection_1.Selection(21, 1, 21, 1), new textAreaState_1.TextAreaState('L21', 0, 0, new range_1.Range(21, 1, 21, 1), 0));
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEFyZWFTdGF0ZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvYnJvd3Nlci9jb250cm9sbGVyL3RleHRBcmVhU3RhdGUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRyxNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBTTNDO1lBQ0MsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBRU0sUUFBUTtZQUNkLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQixDQUFDO1FBRU0sUUFBUSxDQUFDLE1BQWMsRUFBRSxLQUFhO1lBQzVDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDMUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN6QyxDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUM3QixDQUFDO1FBRU0sZUFBZTtZQUNyQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDM0IsQ0FBQztRQUVNLGlCQUFpQixDQUFDLE1BQWMsRUFBRSxjQUFzQixFQUFFLFlBQW9CO1lBQ3BGLElBQUksY0FBYyxHQUFHLENBQUMsRUFBRTtnQkFDdkIsY0FBYyxHQUFHLENBQUMsQ0FBQzthQUNuQjtZQUNELElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUN4QyxjQUFjLEdBQUcsSUFBSSxD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QUFFLENBQUMsQ0FDTixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNkRBQTZELEVBQUUsR0FBRyxFQUFFO1lBQ3hFLGVBQWUsQ0FDZCxJQUFJLDZCQUFhLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUN4RCxjQUFjLEVBQ2QsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQ1YsR0FBRyxFQUFFLENBQUMsQ0FDTixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNEVBQTRFLEVBQUUsR0FBRyxFQUFFO1lBQ3ZGLGVBQWUsQ0FDZCxJQUFJLDZCQUFhLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUN4RCxlQUFlLEVBQ2YsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQ1YsSUFBSSxFQUFFLENBQUMsQ0FDUCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsOEVBQThFLEVBQUUsR0FBRyxFQUFFO1lBQ3pGLGVBQWUsQ0FDZCxJQUFJLDZCQUFhLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUN4RCxjQUFjLEVBQ2QsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQ1YsSUFBSSxFQUFFLENBQUMsQ0FDUCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1lBQ25DLGVBQWUsQ0FDZCxJQUFJLDZCQUFhLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUN4RCxjQUFjLEVBQ2QsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQ1YsR0FBRyxFQUFFLENBQUMsQ0FDTixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsd0NBQXdD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