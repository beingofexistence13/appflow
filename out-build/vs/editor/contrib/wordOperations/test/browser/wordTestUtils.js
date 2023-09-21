/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/test/browser/testCodeEditor"], function (require, exports, position_1, testCodeEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$d$b = exports.$c$b = exports.$b$b = void 0;
    function $b$b(text) {
        let resultText = '';
        let lineNumber = 1;
        let charIndex = 0;
        const positions = [];
        for (let i = 0, len = text.length; i < len; i++) {
            const chr = text.charAt(i);
            if (chr === '\n') {
                resultText += chr;
                lineNumber++;
                charIndex = 0;
                continue;
            }
            if (chr === '|') {
                positions.push(new position_1.$js(lineNumber, charIndex + 1));
            }
            else {
                resultText += chr;
                charIndex++;
            }
        }
        return [resultText, positions];
    }
    exports.$b$b = $b$b;
    function $c$b(text, positions) {
        positions.sort(position_1.$js.compare);
        let resultText = '';
        let lineNumber = 1;
        let charIndex = 0;
        for (let i = 0, len = text.length; i < len; i++) {
            const chr = text.charAt(i);
            if (positions.length > 0 && positions[0].lineNumber === lineNumber && positions[0].column === charIndex + 1) {
                resultText += '|';
                positions.shift();
            }
            resultText += chr;
            if (chr === '\n') {
                lineNumber++;
                charIndex = 0;
            }
            else {
                charIndex++;
            }
        }
        if (positions.length > 0 && positions[0].lineNumber === lineNumber && positions[0].column === charIndex + 1) {
            resultText += '|';
            positions.shift();
        }
        if (positions.length > 0) {
            throw new Error(`Unexpected left over positions!!!`);
        }
        return resultText;
    }
    exports.$c$b = $c$b;
    function $d$b(text, initialPosition, action, record, stopCondition, options = {}) {
        const actualStops = [];
        (0, testCodeEditor_1.$X0b)(text, options, (editor) => {
            editor.setPosition(initialPosition);
            while (true) {
                action(editor);
                actualStops.push(record(editor));
                if (stopCondition(editor)) {
                    break;
                }
                if (actualStops.length > 1000) {
                    throw new Error(`Endless loop detected involving position ${editor.getPosition()}!`);
                }
            }
        });
        return actualStops;
    }
    exports.$d$b = $d$b;
});
//# sourceMappingURL=wordTestUtils.js.map