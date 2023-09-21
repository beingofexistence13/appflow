/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/trustedTypes", "vs/base/common/strings", "vs/editor/browser/config/domFontInfo", "vs/editor/common/core/stringBuilder", "vs/editor/common/modelLineProjectionData", "vs/editor/common/textModelEvents"], function (require, exports, trustedTypes_1, strings, domFontInfo_1, stringBuilder_1, modelLineProjectionData_1, textModelEvents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DOMLineBreaksComputerFactory = void 0;
    const ttPolicy = (0, trustedTypes_1.createTrustedTypesPolicy)('domLineBreaksComputer', { createHTML: value => value });
    class DOMLineBreaksComputerFactory {
        static create() {
            return new DOMLineBreaksComputerFactory();
        }
        constructor() {
        }
        createLineBreaksComputer(fontInfo, tabSize, wrappingColumn, wrappingIndent, wordBreak) {
            const requests = [];
            const injectedTexts = [];
            return {
                addRequest: (lineText, injectedText, previousLineBreakData) => {
                    requests.push(lineText);
                    injectedTexts.push(injectedText);
                },
                finalize: () => {
                    return createLineBreaks(requests, fontInfo, tabSize, wrappingColumn, wrappingIndent, wordBreak, injectedTexts);
                }
            };
        }
    }
    exports.DOMLineBreaksComputerFactory = DOMLineBreaksComputerFactory;
    function createLineBreaks(requests, fontInfo, tabSize, firstLineBreakColumn, wrappingIndent, wordBreak, injectedTextsPerLine) {
        function createEmptyLineBreakWithPossiblyInjectedText(requestIdx) {
            const injectedTexts = injectedTextsPerLine[requestIdx];
            if (injectedTexts) {
                const lineText = textModelEvents_1.LineInjectedText.applyInjectedText(requests[requestIdx], injectedTexts);
                const injectionOptions = injectedTexts.map(t => t.options);
                const injectionOffsets = injectedTexts.map(text => text.column - 1);
                // creating a `LineBreakData` with an invalid `breakOffsetsVisibleColumn` is OK
                // because `breakOffsetsVisibleColumn` will never be used because it contains injected text
                return new modelLineProjectionData_1.ModelLineProjectionData(injectionOffsets, injectionOptions, [lineText.length], [], 0);
            }
            else {
                return null;
            }
        }
        if (firstLineBreakColumn === -1) {
            const result = [];
            for (let i = 0, len = requests.length; i < len; i++) {
                result[i] = createEmptyLineBreakWithPossiblyInjectedText(i);
            }
            return result;
        }
        const overallWidth = Math.round(firstLineBreakColumn * fontInfo.typicalHalfwidthCharacterWidth);
        const additionalIndent = (wrappingIndent === 3 /* WrappingIndent.DeepIndent */ ? 2 : wrappingIndent === 2 /* WrappingIndent.Indent */ ? 1 : 0);
        const additionalIndentSize = Math.round(tabSize * additionalIndent);
        const additionalIndentLength = Math.ceil(fontInfo.spaceWidth * additionalIndentSize);
        const containerDomNode = document.createElement('div');
        (0, domFontInfo_1.applyFontInfo)(containerDomNode, fontInfo);
        const sb = new stringBuilder_1.StringBuilder(10000);
        const firstNonWhitespaceIndices = [];
        const wrappedTextIndentLengths = [];
        const renderLineContents = [];
        const allCharOffsets = [];
        const allVisibleColumns = [];
        for (let i = 0; i < requests.length; i++) {
            const lineContent = textModelEvents_1.LineInjectedText.applyInjectedText(requests[i], injectedTextsPerLine[i]);
            let firstNonWhitespaceIndex = 0;
            let wrappedTextIndentLength = 0;
            let width = overallWidth;
            if (wrappingIndent !== 0 /* WrappingIndent.None */) {
                firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(lineContent);
                if (firstNonWhitespaceIndex === -1) {
                    // all whitespace line
                    firstNonWhitespaceIndex = 0;
                }
                else {
                    // Track existing indent
                    for (let i = 0; i < firstNonWhitespaceIndex; i++) {
                        const charWidth = (lineContent.charCodeAt(i) === 9 /* CharCode.Tab */
                            ? (tabSize - (wrappedTextIndentLength % tabSize))
                            : 1);
                        wrappedTextIndentLength += charWidth;
                    }
                    const indentWidth = Math.ceil(fontInfo.spaceWidth * wrappedTextIndentLength);
                    // Force sticking to beginning of line if no character would fit except for the indentation
                    if (indentWidth + fontInfo.typicalFullwidthCharacterWidth > overallWidth) {
                        firstNonWhitespaceIndex = 0;
                        wrappedTextIndentLength = 0;
                    }
                    else {
                        width = overallWidth - indentWidth;
                    }
                }
            }
            const renderLineContent = lineContent.substr(firstNonWhitespaceIndex);
            const tmp = renderLine(renderLineContent, wrappedTextIndentLength, tabSize, width, sb, additionalIndentLength);
            firstNonWhitespaceIndices[i] = firstNonWhitespaceIndex;
            wrappedTextIndentLengths[i] = wrappedTextIndentLength;
            renderLineContents[i] = renderLineContent;
            allCharOffsets[i] = tmp[0];
            allVisibleColumns[i] = tmp[1];
        }
        const html = sb.build();
        const trustedhtml = ttPolicy?.createHTML(html) ?? html;
        containerDomNode.innerHTML = trustedhtml;
        containerDomNode.style.position = 'absolute';
        containerDomNode.style.top = '10000';
        if (wordBreak === 'keepAll') {
            // word-break: keep-all; overflow-wrap: anywhere
            containerDomNode.style.wordBreak = 'keep-all';
            containerDomNode.style.overflowWrap = 'anywhere';
        }
        else {
            // overflow-wrap: break-word
            containerDomNode.style.wordBreak = 'inherit';
            containerDomNode.style.overflowWrap = 'break-word';
        }
        document.body.appendChild(containerDomNode);
        const range = document.createRange();
        const lineDomNodes = Array.prototype.slice.call(containerDomNode.children, 0);
        const result = [];
        for (let i = 0; i < requests.length; i++) {
            const lineDomNode = lineDomNodes[i];
            const breakOffsets = readLineBreaks(range, lineDomNode, renderLineContents[i], allCharOffsets[i]);
            if (breakOffsets === null) {
                result[i] = createEmptyLineBreakWithPossiblyInjectedText(i);
                continue;
            }
            const firstNonWhitespaceIndex = firstNonWhitespaceIndices[i];
            const wrappedTextIndentLength = wrappedTextIndentLengths[i] + additionalIndentSize;
            const visibleColumns = allVisibleColumns[i];
            const breakOffsetsVisibleColumn = [];
            for (let j = 0, len = breakOffsets.length; j < len; j++) {
                breakOffsetsVisibleColumn[j] = visibleColumns[breakOffsets[j]];
            }
            if (firstNonWhitespaceIndex !== 0) {
                // All break offsets are relative to the renderLineContent, make them absolute again
                for (let j = 0, len = breakOffsets.length; j < len; j++) {
                    breakOffsets[j] += firstNonWhitespaceIndex;
                }
            }
            let injectionOptions;
            let injectionOffsets;
            const curInjectedTexts = injectedTextsPerLine[i];
            if (curInjectedTexts) {
                injectionOptions = curInjectedTexts.map(t => t.options);
                injectionOffsets = curInjectedTexts.map(text => text.column - 1);
            }
            else {
                injectionOptions = null;
                injectionOffsets = null;
            }
            result[i] = new modelLineProjectionData_1.ModelLineProjectionData(injectionOffsets, injectionOptions, breakOffsets, breakOffsetsVisibleColumn, wrappedTextIndentLength);
        }
        document.body.removeChild(containerDomNode);
        return result;
    }
    var Constants;
    (function (Constants) {
        Constants[Constants["SPAN_MODULO_LIMIT"] = 16384] = "SPAN_MODULO_LIMIT";
    })(Constants || (Constants = {}));
    function renderLine(lineContent, initialVisibleColumn, tabSize, width, sb, wrappingIndentLength) {
        if (wrappingIndentLength !== 0) {
            const hangingOffset = String(wrappingIndentLength);
            sb.appendString('<div style="text-indent: -');
            sb.appendString(hangingOffset);
            sb.appendString('px; padding-left: ');
            sb.appendString(hangingOffset);
            sb.appendString('px; box-sizing: border-box; width:');
        }
        else {
            sb.appendString('<div style="width:');
        }
        sb.appendString(String(width));
        sb.appendString('px;">');
        // if (containsRTL) {
        // 	sb.appendASCIIString('" dir="ltr');
        // }
        const len = lineContent.length;
        let visibleColumn = initialVisibleColumn;
        let charOffset = 0;
        const charOffsets = [];
        const visibleColumns = [];
        let nextCharCode = (0 < len ? lineContent.charCodeAt(0) : 0 /* CharCode.Null */);
        sb.appendString('<span>');
        for (let charIndex = 0; charIndex < len; charIndex++) {
            if (charIndex !== 0 && charIndex % 16384 /* Constants.SPAN_MODULO_LIMIT */ === 0) {
                sb.appendString('</span><span>');
            }
            charOffsets[charIndex] = charOffset;
            visibleColumns[charIndex] = visibleColumn;
            const charCode = nextCharCode;
            nextCharCode = (charIndex + 1 < len ? lineContent.charCodeAt(charIndex + 1) : 0 /* CharCode.Null */);
            let producedCharacters = 1;
            let charWidth = 1;
            switch (charCode) {
                case 9 /* CharCode.Tab */:
                    producedCharacters = (tabSize - (visibleColumn % tabSize));
                    charWidth = producedCharacters;
                    for (let space = 1; space <= producedCharacters; space++) {
                        if (space < producedCharacters) {
                            sb.appendCharCode(0xA0); // &nbsp;
                        }
                        else {
                            sb.appendASCIICharCode(32 /* CharCode.Space */);
                        }
                    }
                    break;
                case 32 /* CharCode.Space */:
                    if (nextCharCode === 32 /* CharCode.Space */) {
                        sb.appendCharCode(0xA0); // &nbsp;
                    }
                    else {
                        sb.appendASCIICharCode(32 /* CharCode.Space */);
                    }
                    break;
                case 60 /* CharCode.LessThan */:
                    sb.appendString('&lt;');
                    break;
                case 62 /* CharCode.GreaterThan */:
                    sb.appendString('&gt;');
                    break;
                case 38 /* CharCode.Ampersand */:
                    sb.appendString('&amp;');
                    break;
                case 0 /* CharCode.Null */:
                    sb.appendString('&#00;');
                    break;
                case 65279 /* CharCode.UTF8_BOM */:
                case 8232 /* CharCode.LINE_SEPARATOR */:
                case 8233 /* CharCode.PARAGRAPH_SEPARATOR */:
                case 133 /* CharCode.NEXT_LINE */:
                    sb.appendCharCode(0xFFFD);
                    break;
                default:
                    if (strings.isFullWidthCharacter(charCode)) {
                        charWidth++;
                    }
                    if (charCode < 32) {
                        sb.appendCharCode(9216 + charCode);
                    }
                    else {
                        sb.appendCharCode(charCode);
                    }
            }
            charOffset += producedCharacters;
            visibleColumn += charWidth;
        }
        sb.appendString('</span>');
        charOffsets[lineContent.length] = charOffset;
        visibleColumns[lineContent.length] = visibleColumn;
        sb.appendString('</div>');
        return [charOffsets, visibleColumns];
    }
    function readLineBreaks(range, lineDomNode, lineContent, charOffsets) {
        if (lineContent.length <= 1) {
            return null;
        }
        const spans = Array.prototype.slice.call(lineDomNode.children, 0);
        const breakOffsets = [];
        try {
            discoverBreaks(range, spans, charOffsets, 0, null, lineContent.length - 1, null, breakOffsets);
        }
        catch (err) {
            console.log(err);
            return null;
        }
        if (breakOffsets.length === 0) {
            return null;
        }
        breakOffsets.push(lineContent.length);
        return breakOffsets;
    }
    function discoverBreaks(range, spans, charOffsets, low, lowRects, high, highRects, result) {
        if (low === high) {
            return;
        }
        lowRects = lowRects || readClientRect(range, spans, charOffsets[low], charOffsets[low + 1]);
        highRects = highRects || readClientRect(range, spans, charOffsets[high], charOffsets[high + 1]);
        if (Math.abs(lowRects[0].top - highRects[0].top) <= 0.1) {
            // same line
            return;
        }
        // there is at least one line break between these two offsets
        if (low + 1 === high) {
            // the two characters are adjacent, so the line break must be exactly between them
            result.push(high);
            return;
        }
        const mid = low + ((high - low) / 2) | 0;
        const midRects = readClientRect(range, spans, charOffsets[mid], charOffsets[mid + 1]);
        discoverBreaks(range, spans, charOffsets, low, lowRects, mid, midRects, result);
        discoverBreaks(range, spans, charOffsets, mid, midRects, high, highRects, result);
    }
    function readClientRect(range, spans, startOffset, endOffset) {
        range.setStart(spans[(startOffset / 16384 /* Constants.SPAN_MODULO_LIMIT */) | 0].firstChild, startOffset % 16384 /* Constants.SPAN_MODULO_LIMIT */);
        range.setEnd(spans[(endOffset / 16384 /* Constants.SPAN_MODULO_LIMIT */) | 0].firstChild, endOffset % 16384 /* Constants.SPAN_MODULO_LIMIT */);
        return range.getClientRects();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tTGluZUJyZWFrc0NvbXB1dGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvdmlldy9kb21MaW5lQnJlYWtzQ29tcHV0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQU0sUUFBUSxHQUFHLElBQUEsdUNBQXdCLEVBQUMsdUJBQXVCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBRW5HLE1BQWEsNEJBQTRCO1FBRWpDLE1BQU0sQ0FBQyxNQUFNO1lBQ25CLE9BQU8sSUFBSSw0QkFBNEIsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFRDtRQUNBLENBQUM7UUFFTSx3QkFBd0IsQ0FBQyxRQUFrQixFQUFFLE9BQWUsRUFBRSxjQUFzQixFQUFFLGNBQThCLEVBQUUsU0FBK0I7WUFDM0osTUFBTSxRQUFRLEdBQWEsRUFBRSxDQUFDO1lBQzlCLE1BQU0sYUFBYSxHQUFrQyxFQUFFLENBQUM7WUFDeEQsT0FBTztnQkFDTixVQUFVLEVBQUUsQ0FBQyxRQUFnQixFQUFFLFlBQXVDLEVBQUUscUJBQXFELEVBQUUsRUFBRTtvQkFDaEksUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDeEIsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDbEMsQ0FBQztnQkFDRCxRQUFRLEVBQUUsR0FBRyxFQUFFO29CQUNkLE9BQU8sZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ2hILENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBdEJELG9FQXNCQztJQUVELFNBQVMsZ0JBQWdCLENBQUMsUUFBa0IsRUFB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