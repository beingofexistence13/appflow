/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/trustedTypes", "vs/editor/browser/config/domFontInfo", "vs/editor/common/config/editorOptions", "vs/editor/common/core/stringBuilder", "vs/editor/common/viewLayout/lineDecorations", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/common/viewModel"], function (require, exports, trustedTypes_1, domFontInfo_1, editorOptions_1, stringBuilder_1, lineDecorations_1, viewLineRenderer_1, viewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1Z = exports.$ZZ = exports.$YZ = void 0;
    const ttPolicy = (0, trustedTypes_1.$PQ)('diffEditorWidget', { createHTML: value => value });
    function $YZ(source, options, decorations, domNode) {
        (0, domFontInfo_1.$vU)(domNode, options.fontInfo);
        const hasCharChanges = (decorations.length > 0);
        const sb = new stringBuilder_1.$Es(10000);
        let maxCharsPerLine = 0;
        let renderedLineCount = 0;
        const viewLineCounts = [];
        for (let lineIndex = 0; lineIndex < source.lineTokens.length; lineIndex++) {
            const lineNumber = lineIndex + 1;
            const lineTokens = source.lineTokens[lineIndex];
            const lineBreakData = source.lineBreakData[lineIndex];
            const actualDecorations = lineDecorations_1.$MW.filter(decorations, lineNumber, 1, Number.MAX_SAFE_INTEGER);
            if (lineBreakData) {
                let lastBreakOffset = 0;
                for (const breakOffset of lineBreakData.breakOffsets) {
                    const viewLineTokens = lineTokens.sliceAndInflate(lastBreakOffset, breakOffset, 0);
                    maxCharsPerLine = Math.max(maxCharsPerLine, renderOriginalLine(renderedLineCount, viewLineTokens, lineDecorations_1.$MW.extractWrapped(actualDecorations, lastBreakOffset, breakOffset), hasCharChanges, source.mightContainNonBasicASCII, source.mightContainRTL, options, sb));
                    renderedLineCount++;
                    lastBreakOffset = breakOffset;
                }
                viewLineCounts.push(lineBreakData.breakOffsets.length);
            }
            else {
                viewLineCounts.push(1);
                maxCharsPerLine = Math.max(maxCharsPerLine, renderOriginalLine(renderedLineCount, lineTokens, actualDecorations, hasCharChanges, source.mightContainNonBasicASCII, source.mightContainRTL, options, sb));
                renderedLineCount++;
            }
        }
        maxCharsPerLine += options.scrollBeyondLastColumn;
        const html = sb.build();
        const trustedhtml = ttPolicy ? ttPolicy.createHTML(html) : html;
        domNode.innerHTML = trustedhtml;
        const minWidthInPx = (maxCharsPerLine * options.typicalHalfwidthCharacterWidth);
        return {
            heightInLines: renderedLineCount,
            minWidthInPx,
            viewLineCounts,
        };
    }
    exports.$YZ = $YZ;
    class $ZZ {
        constructor(lineTokens, lineBreakData, mightContainNonBasicASCII, mightContainRTL) {
            this.lineTokens = lineTokens;
            this.lineBreakData = lineBreakData;
            this.mightContainNonBasicASCII = mightContainNonBasicASCII;
            this.mightContainRTL = mightContainRTL;
        }
    }
    exports.$ZZ = $ZZ;
    class $1Z {
        static fromEditor(editor) {
            const modifiedEditorOptions = editor.getOptions();
            const fontInfo = modifiedEditorOptions.get(50 /* EditorOption.fontInfo */);
            const layoutInfo = modifiedEditorOptions.get(143 /* EditorOption.layoutInfo */);
            return new $1Z(editor.getModel()?.getOptions().tabSize || 0, fontInfo, modifiedEditorOptions.get(33 /* EditorOption.disableMonospaceOptimizations */), fontInfo.typicalHalfwidthCharacterWidth, modifiedEditorOptions.get(103 /* EditorOption.scrollBeyondLastColumn */), modifiedEditorOptions.get(66 /* EditorOption.lineHeight */), layoutInfo.decorationsWidth, modifiedEditorOptions.get(116 /* EditorOption.stopRenderingLineAfter */), modifiedEditorOptions.get(98 /* EditorOption.renderWhitespace */), modifiedEditorOptions.get(93 /* EditorOption.renderControlCharacters */), modifiedEditorOptions.get(51 /* EditorOption.fontLigatures */));
        }
        constructor(tabSize, fontInfo, disableMonospaceOptimizations, typicalHalfwidthCharacterWidth, scrollBeyondLastColumn, lineHeight, lineDecorationsWidth, stopRenderingLineAfter, renderWhitespace, renderControlCharacters, fontLigatures) {
            this.tabSize = tabSize;
            this.fontInfo = fontInfo;
            this.disableMonospaceOptimizations = disableMonospaceOptimizations;
            this.typicalHalfwidthCharacterWidth = typicalHalfwidthCharacterWidth;
            this.scrollBeyondLastColumn = scrollBeyondLastColumn;
            this.lineHeight = lineHeight;
            this.lineDecorationsWidth = lineDecorationsWidth;
            this.stopRenderingLineAfter = stopRenderingLineAfter;
            this.renderWhitespace = renderWhitespace;
            this.renderControlCharacters = renderControlCharacters;
            this.fontLigatures = fontLigatures;
        }
    }
    exports.$1Z = $1Z;
    function renderOriginalLine(viewLineIdx, lineTokens, decorations, hasCharChanges, mightContainNonBasicASCII, mightContainRTL, options, sb) {
        sb.appendString('<div class="view-line');
        if (!hasCharChanges) {
            // No char changes
            sb.appendString(' char-delete');
        }
        sb.appendString('" style="top:');
        sb.appendString(String(viewLineIdx * options.lineHeight));
        sb.appendString('px;width:1000000px;">');
        const lineContent = lineTokens.getLineContent();
        const isBasicASCII = viewModel_1.$aV.isBasicASCII(lineContent, mightContainNonBasicASCII);
        const containsRTL = viewModel_1.$aV.containsRTL(lineContent, isBasicASCII, mightContainRTL);
        const output = (0, viewLineRenderer_1.$UW)(new viewLineRenderer_1.$QW((options.fontInfo.isMonospace && !options.disableMonospaceOptimizations), options.fontInfo.canUseHalfwidthRightwardsArrow, lineContent, false, isBasicASCII, containsRTL, 0, lineTokens, decorations, options.tabSize, 0, options.fontInfo.spaceWidth, options.fontInfo.middotWidth, options.fontInfo.wsmiddotWidth, options.stopRenderingLineAfter, options.renderWhitespace, options.renderControlCharacters, options.fontLigatures !== editorOptions_1.EditorFontLigatures.OFF, null // Send no selections, original line cannot be selected
        ), sb);
        sb.appendString('</div>');
        return output.characterMapping.getHorizontalOffset(output.characterMapping.length);
    }
});
//# sourceMappingURL=renderLines.js.map