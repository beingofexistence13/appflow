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
            this.a = line;
        }
        _setText(text) {
            this.a = text;
        }
        getLineMaxColumn(lineNumber) {
            return this.a.length + 1;
        }
        getValueInRange(range, eol) {
            return this.a.substring(range.startColumn - 1, range.endColumn - 1);
        }
        getValueLengthInRange(range, eol) {
            return this.getValueInRange(range, eol).length;
        }
        modifyPosition(position, offset) {
            const column = Math.min(this.getLineMaxColumn(position.lineNumber), Math.max(1, position.column + offset));
            return new position_1.$js(position.lineNumber, column);
        }
        getModelLineContent(lineNumber) {
            return this.a;
        }
        getLineCount() {
            return 1;
        }
    }
    class TestView {
        constructor(model) {
            this.a = model;
        }
        paint(output) {
            dom.$lO(output);
            for (let i = 1; i <= this.a.getLineCount(); i++) {
                const textNode = document.createTextNode(this.a.getModelLineContent(i));
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
                const selection = new range_1.$ks(1, 1 + cursorOffset, 1, 1 + cursorOffset + cursorLength);
                return textAreaState_1.$9W.fromEditorSelection(model, selection, 10, true);
            },
            deduceModelPosition: (viewAnchorPosition, deltaOffset, lineFeedCnt) => {
                return null;
            }
        };
        const handler = new textAreaInput_1.$_W(textAreaInputHost, new textAreaInput_1.$bX(input), platform.OS, {
            isAndroid: browser.$$N,
            isFirefox: browser.$5N,
            isChrome: browser.$7N,
            isSafari: browser.$8N,
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
//# sourceMappingURL=imeTester.js.map