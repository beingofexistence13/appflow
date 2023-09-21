/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/tokens/lineTokens", "vs/editor/common/languages", "vs/editor/common/languages/nullTokenize"], function (require, exports, strings, lineTokens_1, languages_1, nullTokenize_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports._tokenizeToString = exports.tokenizeLineToHTML = exports.tokenizeToString = exports.tokenizeToStringSync = void 0;
    const fallback = {
        getInitialState: () => nullTokenize_1.NullState,
        tokenizeEncoded: (buffer, hasEOL, state) => (0, nullTokenize_1.nullTokenizeEncoded)(0 /* LanguageId.Null */, state)
    };
    function tokenizeToStringSync(languageService, text, languageId) {
        return _tokenizeToString(text, languageService.languageIdCodec, languages_1.TokenizationRegistry.get(languageId) || fallback);
    }
    exports.tokenizeToStringSync = tokenizeToStringSync;
    async function tokenizeToString(languageService, text, languageId) {
        if (!languageId) {
            return _tokenizeToString(text, languageService.languageIdCodec, fallback);
        }
        const tokenizationSupport = await languages_1.TokenizationRegistry.getOrCreate(languageId);
        return _tokenizeToString(text, languageService.languageIdCodec, tokenizationSupport || fallback);
    }
    exports.tokenizeToString = tokenizeToString;
    function tokenizeLineToHTML(text, viewLineTokens, colorMap, startOffset, endOffset, tabSize, useNbsp) {
        let result = `<div>`;
        let charIndex = startOffset;
        let tabsCharDelta = 0;
        let prevIsSpace = true;
        for (let tokenIndex = 0, tokenCount = viewLineTokens.getCount(); tokenIndex < tokenCount; tokenIndex++) {
            const tokenEndIndex = viewLineTokens.getEndOffset(tokenIndex);
            if (tokenEndIndex <= startOffset) {
                continue;
            }
            let partContent = '';
            for (; charIndex < tokenEndIndex && charIndex < endOffset; charIndex++) {
                const charCode = text.charCodeAt(charIndex);
                switch (charCode) {
                    case 9 /* CharCode.Tab */: {
                        let insertSpacesCount = tabSize - (charIndex + tabsCharDelta) % tabSize;
                        tabsCharDelta += insertSpacesCount - 1;
                        while (insertSpacesCount > 0) {
                            if (useNbsp && prevIsSpace) {
                                partContent += '&#160;';
                                prevIsSpace = false;
                            }
                            else {
                                partContent += ' ';
                                prevIsSpace = true;
                            }
                            insertSpacesCount--;
                        }
                        break;
                    }
                    case 60 /* CharCode.LessThan */:
                        partContent += '&lt;';
                        prevIsSpace = false;
                        break;
                    case 62 /* CharCode.GreaterThan */:
                        partContent += '&gt;';
                        prevIsSpace = false;
                        break;
                    case 38 /* CharCode.Ampersand */:
                        partContent += '&amp;';
                        prevIsSpace = false;
                        break;
                    case 0 /* CharCode.Null */:
                        partContent += '&#00;';
                        prevIsSpace = false;
                        break;
                    case 65279 /* CharCode.UTF8_BOM */:
                    case 8232 /* CharCode.LINE_SEPARATOR */:
                    case 8233 /* CharCode.PARAGRAPH_SEPARATOR */:
                    case 133 /* CharCode.NEXT_LINE */:
                        partContent += '\ufffd';
                        prevIsSpace = false;
                        break;
                    case 13 /* CharCode.CarriageReturn */:
                        // zero width space, because carriage return would introduce a line break
                        partContent += '&#8203';
                        prevIsSpace = false;
                        break;
                    case 32 /* CharCode.Space */:
                        if (useNbsp && prevIsSpace) {
                            partContent += '&#160;';
                            prevIsSpace = false;
                        }
                        else {
                            partContent += ' ';
                            prevIsSpace = true;
                        }
                        break;
                    default:
                        partContent += String.fromCharCode(charCode);
                        prevIsSpace = false;
                }
            }
            result += `<span style="${viewLineTokens.getInlineStyle(tokenIndex, colorMap)}">${partContent}</span>`;
            if (tokenEndIndex > endOffset || charIndex >= endOffset) {
                break;
            }
        }
        result += `</div>`;
        return result;
    }
    exports.tokenizeLineToHTML = tokenizeLineToHTML;
    function _tokenizeToString(text, languageIdCodec, tokenizationSupport) {
        let result = `<div class="monaco-tokenized-source">`;
        const lines = strings.splitLines(text);
        let currentState = tokenizationSupport.getInitialState();
        for (let i = 0, len = lines.length; i < len; i++) {
            const line = lines[i];
            if (i > 0) {
                result += `<br/>`;
            }
            const tokenizationResult = tokenizationSupport.tokenizeEncoded(line, true, currentState);
            lineTokens_1.LineTokens.convertToEndOffset(tokenizationResult.tokens, line.length);
            const lineTokens = new lineTokens_1.LineTokens(tokenizationResult.tokens, line, languageIdCodec);
            const viewLineTokens = lineTokens.inflate();
            let startOffset = 0;
            for (let j = 0, lenJ = viewLineTokens.getCount(); j < lenJ; j++) {
                const type = viewLineTokens.getClassName(j);
                const endIndex = viewLineTokens.getEndOffset(j);
                result += `<span class="${type}">${strings.escape(line.substring(startOffset, endIndex))}</span>`;
                startOffset = endIndex;
            }
            currentState = tokenizationResult.endState;
        }
        result += `</div>`;
        return result;
    }
    exports._tokenizeToString = _tokenizeToString;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFRvSHRtbFRva2VuaXplci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbGFuZ3VhZ2VzL3RleHRUb0h0bWxUb2tlbml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQU0sUUFBUSxHQUFnQztRQUM3QyxlQUFlLEVBQUUsR0FBRyxFQUFFLENBQUMsd0JBQVM7UUFDaEMsZUFBZSxFQUFFLENBQUMsTUFBYyxFQUFFLE1BQWUsRUFBRSxLQUFhLEVBQUUsRUFBRSxDQUFDLElBQUEsa0NBQW1CLDJCQUFrQixLQUFLLENBQUM7S0FDaEgsQ0FBQztJQUVGLFNBQWdCLG9CQUFvQixDQUFDLGVBQWlDLEVBQUUsSUFBWSxFQUFFLFVBQWtCO1FBQ3ZHLE9BQU8saUJBQWlCLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxlQUFlLEVBQUUsZ0NBQW9CLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDO0lBQ25ILENBQUM7SUFGRCxvREFFQztJQUVNLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxlQUFpQyxFQUFFLElBQVksRUFBRSxVQUF5QjtRQUNoSCxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2hCLE9BQU8saUJBQWlCLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDMUU7UUFDRCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sZ0NBQW9CLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLE9BQU8saUJBQWlCLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxlQUFlLEVBQUUsbUJBQW1CLElBQUksUUFBUSxDQUFDLENBQUM7SUFDbEcsQ0FBQztJQU5ELDRDQU1DO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsSUFBWSxFQUFFLGNBQStCLEVBQUUsUUFB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