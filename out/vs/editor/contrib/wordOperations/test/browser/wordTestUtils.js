/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/test/browser/testCodeEditor"], function (require, exports, position_1, testCodeEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testRepeatedActionAndExtractPositions = exports.serializePipePositions = exports.deserializePipePositions = void 0;
    function deserializePipePositions(text) {
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
                positions.push(new position_1.Position(lineNumber, charIndex + 1));
            }
            else {
                resultText += chr;
                charIndex++;
            }
        }
        return [resultText, positions];
    }
    exports.deserializePipePositions = deserializePipePositions;
    function serializePipePositions(text, positions) {
        positions.sort(position_1.Position.compare);
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
    exports.serializePipePositions = serializePipePositions;
    function testRepeatedActionAndExtractPositions(text, initialPosition, action, record, stopCondition, options = {}) {
        const actualStops = [];
        (0, testCodeEditor_1.withTestCodeEditor)(text, options, (editor) => {
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
    exports.testRepeatedActionAndExtractPositions = testRepeatedActionAndExtractPositions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZFRlc3RVdGlscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3dvcmRPcGVyYXRpb25zL3Rlc3QvYnJvd3Nlci93b3JkVGVzdFV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxTQUFnQix3QkFBd0IsQ0FBQyxJQUFZO1FBQ3BELElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sU0FBUyxHQUFlLEVBQUUsQ0FBQztRQUNqQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2hELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO2dCQUNqQixVQUFVLElBQUksR0FBRyxDQUFDO2dCQUNsQixVQUFVLEVBQUUsQ0FBQztnQkFDYixTQUFTLEdBQUcsQ0FBQyxDQUFDO2dCQUNkLFNBQVM7YUFDVDtZQUNELElBQUksR0FBRyxLQUFLLEdBQUcsRUFBRTtnQkFDaEIsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFRLENBQUMsVUFBVSxFQUFFLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3hEO2lCQUFNO2dCQUNOLFVBQVUsSUFBSSxHQUFHLENBQUM7Z0JBQ2xCLFNBQVMsRUFBRSxDQUFDO2FBQ1o7U0FDRDtRQUNELE9BQU8sQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQXJCRCw0REFxQkM7SUFFRCxTQUFnQixzQkFBc0Is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