/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/controller/textAreaInput", "vs/editor/browser/controller/textAreaState", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/base/browser/dom", "vs/base/browser/browser", "vs/base/common/platform"], function (require, exports, textAreaInput_1, textAreaState_1, position_1, range_1, dom, browser, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // To run this test, open imeTester.html
    class SingleLineTestModel {
        constructor(line) {
            this._line = line;
        }
        _setText(text) {
            this._line = text;
        }
        getLineMaxColumn(lineNumber) {
            return this._line.length + 1;
        }
        getValueInRange(range, eol) {
            return this._line.substring(range.startColumn - 1, range.endColumn - 1);
        }
        getValueLengthInRange(range, eol) {
            return this.getValueInRange(range, eol).length;
        }
        modifyPosition(position, offset) {
            const column = Math.min(this.getLineMaxColumn(position.lineNumber), Math.max(1, position.column + offset));
            return new position_1.Position(position.lineNumber, column);
        }
        getModelLineContent(lineNumber) {
            return this._line;
        }
        getLineCount() {
            return 1;
        }
    }
    class TestView {
        constructor(model) {
            this._model = model;
        }
        paint(output) {
            dom.clearNode(output);
            for (let i = 1; i <= this._model.getLineCount(); i++) {
                const textNode = document.createTextNode(this._model.getModelLineContent(i));
                output.appendChild(textNode);
                const br = document.createElement('br');
                output.appendChild(br);
            }
        }
    }
    function doCreateTest(description, inputStr, expectedStr) {
        let cursorOffset = 0;
        let cursorLength = 0;
        const container = document.createElement('div');
        container.className = 'container';
        const title = document.createElement('div');
        title.className = 'title';
        const inputStrStrong = document.createElement('strong');
        inputStrStrong.innerText = inputStr;
        title.innerText = description + '. Type ';
        title.appendChild(inputStrStrong);
        container.appendChild(title);
        const startBtn = document.createElement('button');
        startBtn.innerText = 'Start';
        container.appendChild(startBtn);
        const input = document.createElement('textarea');
        input.setAttribute('rows', '10');
        input.setAttribute('cols', '40');
        container.appendChild(input);
        const model = new SingleLineTestModel('some  text');
        const textAreaInputHost = {
            getDataToCopy: () => {
                return {
                    isFromEmptySelection: false,
                    multicursorText: null,
                    text: '',
                    html: undefined,
                    mode: null
                };
            },
            getScreenReaderContent: () => {
                const selection = new range_1.Range(1, 1 + cursorOffset, 1, 1 + cursorOffset + cursorLength);
                return textAreaState_1.PagedScreenReaderStrategy.fromEditorSelection(model, selection, 10, true);
            },
            deduceModelPosition: (viewAnchorPosition, deltaOffset, lineFeedCnt) => {
                return null;
            }
        };
        const handler = new textAreaInput_1.TextAreaInput(textAreaInputHost, new textAreaInput_1.TextAreaWrapper(input), platform.OS, {
            isAndroid: browser.isAndroid,
            isFirefox: browser.isFirefox,
            isChrome: browser.isChrome,
            isSafari: browser.isSafari,
        });
        const output = document.createElement('pre');
        output.className = 'output';
        container.appendChild(output);
        const check = document.createElement('pre');
        check.className = 'check';
        container.appendChild(check);
        const br = document.createElement('br');
        br.style.clear = 'both';
        container.appendChild(br);
        const view = new TestView(model);
        const updatePosition = (off, len) => {
            cursorOffset = off;
            cursorLength = len;
            handler.writeScreenReaderContent('selection changed');
            handler.focusTextArea();
        };
        const updateModelAndPosition = (text, off, len) => {
            model._setText(text);
            updatePosition(off, len);
            view.paint(output);
            const expected = 'some ' + expectedStr + ' text';
            if (text === expected) {
                check.innerText = '[GOOD]';
                check.className = 'check good';
            }
            else {
                check.innerText = '[BAD]';
                check.className = 'check bad';
            }
            check.appendChild(document.createTextNode(expected));
        };
        handler.onType((e) => {
            console.log('type text: ' + e.text + ', replaceCharCnt: ' + e.replacePrevCharCnt);
            const text = model.getModelLineContent(1);
            const preText = text.substring(0, cursorOffset - e.replacePrevCharCnt);
            const postText = text.substring(cursorOffset + cursorLength);
            const midText = e.text;
            updateModelAndPosition(preText + midText + postText, (preText + midText).length, 0);
        });
        view.paint(output);
        startBtn.onclick = function () {
            updateModelAndPosition('some  text', 5, 0);
            input.focus();
        };
        return container;
    }
    const TESTS = [
        { description: 'Japanese IME 1', in: 'sennsei [Enter]', out: 'せんせい' },
        { description: 'Japanese IME 2', in: 'konnichiha [Enter]', out: 'こんいちは' },
        { description: 'Japanese IME 3', in: 'mikann [Enter]', out: 'みかん' },
        { description: 'Korean IME 1', in: 'gksrmf [Space]', out: '한글 ' },
        { description: 'Chinese IME 1', in: '.,', out: '。，' },
        { description: 'Chinese IME 2', in: 'ni [Space] hao [Space]', out: '你好' },
        { description: 'Chinese IME 3', in: 'hazni [Space]', out: '哈祝你' },
        { description: 'Mac dead key 1', in: '`.', out: '`.' },
        { description: 'Mac hold key 1', in: 'e long press and 1', out: 'é' }
    ];
    TESTS.forEach((t) => {
        document.body.appendChild(doCreateTest(t.description, t.in, t.out));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1lVGVzdGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvYnJvd3Nlci9jb250cm9sbGVyL2ltZVRlc3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVdoRyx3Q0FBd0M7SUFFeEMsTUFBTSxtQkFBbUI7UUFJeEIsWUFBWSxJQUFZO1lBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ25CLENBQUM7UUFFRCxRQUFRLENBQUMsSUFBWTtZQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNuQixDQUFDO1FBRUQsZ0JBQWdCLENBQUMsVUFBa0I7WUFDbEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVELGVBQWUsQ0FBQyxLQUFhLEVBQUUsR0FBd0I7WUFDdEQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRCxxQkFBcUIsQ0FBQyxLQUFZLEVBQUUsR0FBd0I7WUFDM0QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDaEQsQ0FBQztRQUVELGNBQWMsQ0FBQyxRQUFrQixFQUFFLE1BQWM7WUFDaEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMzRyxPQUFPLElBQUksbUJBQVEsQ0FB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