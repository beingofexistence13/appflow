/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range"], function (require, exports, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFileResults = void 0;
    const getFileResults = (bytes, pattern, options) => {
        let text;
        if (bytes[0] === 0xff && bytes[1] === 0xfe) {
            text = new TextDecoder('utf-16le').decode(bytes);
        }
        else if (bytes[0] === 0xfe && bytes[1] === 0xff) {
            text = new TextDecoder('utf-16be').decode(bytes);
        }
        else {
            text = new TextDecoder('utf8').decode(bytes);
            if (text.slice(0, 1000).includes('\uFFFD') && bytes.includes(0)) {
                return [];
            }
        }
        const results = [];
        const patternIndecies = [];
        let patternMatch = null;
        let remainingResultQuota = options.remainingResultQuota;
        while (remainingResultQuota >= 0 && (patternMatch = pattern.exec(text))) {
            patternIndecies.push({ matchStartIndex: patternMatch.index, matchedText: patternMatch[0] });
            remainingResultQuota--;
        }
        if (patternIndecies.length) {
            const contextLinesNeeded = new Set();
            const resultLines = new Set();
            const lineRanges = [];
            const readLine = (lineNumber) => text.slice(lineRanges[lineNumber].start, lineRanges[lineNumber].end);
            let prevLineEnd = 0;
            let lineEndingMatch = null;
            const lineEndRegex = /\r?\n/g;
            while ((lineEndingMatch = lineEndRegex.exec(text))) {
                lineRanges.push({ start: prevLineEnd, end: lineEndingMatch.index });
                prevLineEnd = lineEndingMatch.index + lineEndingMatch[0].length;
            }
            if (prevLineEnd < text.length) {
                lineRanges.push({ start: prevLineEnd, end: text.length });
            }
            let startLine = 0;
            for (const { matchStartIndex, matchedText } of patternIndecies) {
                if (remainingResultQuota < 0) {
                    break;
                }
                while (Boolean(lineRanges[startLine + 1]) && matchStartIndex > lineRanges[startLine].end) {
                    startLine++;
                }
                let endLine = startLine;
                while (Boolean(lineRanges[endLine + 1]) && matchStartIndex + matchedText.length > lineRanges[endLine].end) {
                    endLine++;
                }
                if (options.beforeContext) {
                    for (let contextLine = Math.max(0, startLine - options.beforeContext); contextLine < startLine; contextLine++) {
                        contextLinesNeeded.add(contextLine);
                    }
                }
                let previewText = '';
                let offset = 0;
                for (let matchLine = startLine; matchLine <= endLine; matchLine++) {
                    let previewLine = readLine(matchLine);
                    if (options.previewOptions?.charsPerLine && previewLine.length > options.previewOptions.charsPerLine) {
                        offset = Math.max(matchStartIndex - lineRanges[startLine].start - 20, 0);
                        previewLine = previewLine.substr(offset, options.previewOptions.charsPerLine);
                    }
                    previewText += `${previewLine}\n`;
                    resultLines.add(matchLine);
                }
                const fileRange = new range_1.Range(startLine, matchStartIndex - lineRanges[startLine].start, endLine, matchStartIndex + matchedText.length - lineRanges[endLine].start);
                const previewRange = new range_1.Range(0, matchStartIndex - lineRanges[startLine].start - offset, endLine - startLine, matchStartIndex + matchedText.length - lineRanges[endLine].start - (endLine === startLine ? offset : 0));
                const match = {
                    ranges: fileRange,
                    preview: { text: previewText, matches: previewRange },
                };
                results.push(match);
                if (options.afterContext) {
                    for (let contextLine = endLine + 1; contextLine <= Math.min(endLine + options.afterContext, lineRanges.length - 1); contextLine++) {
                        contextLinesNeeded.add(contextLine);
                    }
                }
            }
            for (const contextLine of contextLinesNeeded) {
                if (!resultLines.has(contextLine)) {
                    results.push({
                        text: readLine(contextLine),
                        lineNumber: contextLine + 1,
                    });
                }
            }
        }
        return results;
    };
    exports.getFileResults = getFileResults;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RmlsZVJlc3VsdHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL2NvbW1vbi9nZXRGaWxlUmVzdWx0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNekYsTUFBTSxjQUFjLEdBQUcsQ0FDN0IsS0FBaUIsRUFDakIsT0FBZSxFQUNmLE9BS0MsRUFDcUIsRUFBRTtRQUV4QixJQUFJLElBQVksQ0FBQztRQUNqQixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUMzQyxJQUFJLEdBQUcsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2pEO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDbEQsSUFBSSxHQUFHLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNqRDthQUFNO1lBQ04sSUFBSSxHQUFHLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNoRSxPQUFPLEVBQUUsQ0FBQzthQUNWO1NBQ0Q7UUFFRCxNQUFNLE9BQU8sR0FBd0IsRUFBRSxDQUFDO1FBRXhDLE1BQU0sZUFBZSxHQUF1RCxFQUFFLENBQUM7UUFFL0UsSUFBSSxZQUFZLEdB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