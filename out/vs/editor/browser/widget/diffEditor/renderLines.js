/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/trustedTypes", "vs/editor/browser/config/domFontInfo", "vs/editor/common/config/editorOptions", "vs/editor/common/core/stringBuilder", "vs/editor/common/viewLayout/lineDecorations", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/common/viewModel"], function (require, exports, trustedTypes_1, domFontInfo_1, editorOptions_1, stringBuilder_1, lineDecorations_1, viewLineRenderer_1, viewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenderOptions = exports.LineSource = exports.renderLines = void 0;
    const ttPolicy = (0, trustedTypes_1.createTrustedTypesPolicy)('diffEditorWidget', { createHTML: value => value });
    function renderLines(source, options, decorations, domNode) {
        (0, domFontInfo_1.applyFontInfo)(domNode, options.fontInfo);
        const hasCharChanges = (decorations.length > 0);
        const sb = new stringBuilder_1.StringBuilder(10000);
        let maxCharsPerLine = 0;
        let renderedLineCount = 0;
        const viewLineCounts = [];
        for (let lineIndex = 0; lineIndex < source.lineTokens.length; lineIndex++) {
            const lineNumber = lineIndex + 1;
            const lineTokens = source.lineTokens[lineIndex];
            const lineBreakData = source.lineBreakData[lineIndex];
            const actualDecorations = lineDecorations_1.LineDecoration.filter(decorations, lineNumber, 1, Number.MAX_SAFE_INTEGER);
            if (lineBreakData) {
                let lastBreakOffset = 0;
                for (const breakOffset of lineBreakData.breakOffsets) {
                    const viewLineTokens = lineTokens.sliceAndInflate(lastBreakOffset, breakOffset, 0);
                    maxCharsPerLine = Math.max(maxCharsPerLine, renderOriginalLine(renderedLineCount, viewLineTokens, lineDecorations_1.LineDecoration.extractWrapped(actualDecorations, lastBreakOffset, breakOffset), hasCharChanges, source.mightContainNonBasicASCII, source.mightContainRTL, options, sb));
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
    exports.renderLines = renderLines;
    class LineSource {
        constructor(lineTokens, lineBreakData, mightContainNonBasicASCII, mightContainRTL) {
            this.lineTokens = lineTokens;
            this.lineBreakData = lineBreakData;
            this.mightContainNonBasicASCII = mightContainNonBasicASCII;
            this.mightContainRTL = mightContainRTL;
        }
    }
    exports.LineSource = LineSource;
    class RenderOptions {
        static fromEditor(editor) {
            const modifiedEditorOptions = editor.getOptions();
            const fontInfo = modifiedEditorOptions.get(50 /* EditorOption.fontInfo */);
            const layoutInfo = modifiedEditorOptions.get(143 /* EditorOption.layoutInfo */);
            return new RenderOptions(editor.getModel()?.getOptions().tabSize || 0, fontInfo, modifiedEditorOptions.get(33 /* EditorOption.disableMonospaceOptimizations */), fontInfo.typicalHalfwidthCharacterWidth, modifiedEditorOptions.get(103 /* EditorOption.scrollBeyondLastColumn */), modifiedEditorOptions.get(66 /* EditorOption.lineHeight */), layoutInfo.decorationsWidth, modifiedEditorOptions.get(116 /* EditorOption.stopRenderingLineAfter */), modifiedEditorOptions.get(98 /* EditorOption.renderWhitespace */), modifiedEditorOptions.get(93 /* EditorOption.renderControlCharacters */), modifiedEditorOptions.get(51 /* EditorOption.fontLigatures */));
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
    exports.RenderOptions = RenderOptions;
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
        const isBasicASCII = viewModel_1.ViewLineRenderingData.isBasicASCII(lineContent, mightContainNonBasicASCII);
        const containsRTL = viewModel_1.ViewLineRenderingData.containsRTL(lineContent, isBasicASCII, mightContainRTL);
        const output = (0, viewLineRenderer_1.renderViewLine)(new viewLineRenderer_1.RenderLineInput((options.fontInfo.isMonospace && !options.disableMonospaceOptimizations), options.fontInfo.canUseHalfwidthRightwardsArrow, lineContent, false, isBasicASCII, containsRTL, 0, lineTokens, decorations, options.tabSize, 0, options.fontInfo.spaceWidth, options.fontInfo.middotWidth, options.fontInfo.wsmiddotWidth, options.stopRenderingLineAfter, options.renderWhitespace, options.renderControlCharacters, options.fontLigatures !== editorOptions_1.EditorFontLigatures.OFF, null // Send no selections, original line cannot be selected
        ), sb);
        sb.appendString('</div>');
        return output.characterMapping.getHorizontalOffset(output.characterMapping.length);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyTGluZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvZGlmZkVkaXRvci9yZW5kZXJMaW5lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsTUFBTSxRQUFRLEdBQUcsSUFBQSx1Q0FBd0IsRUFBQyxrQkFBa0IsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFFOUYsU0FBZ0IsV0FBVyxDQUFDLE1BQWtCLEVBQUUsT0FBc0IsRUFBRSxXQUErQixFQUFFLE9BQW9CO1FBQzVILElBQUEsMkJBQWEsRUFBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXpDLE1BQU0sY0FBYyxHQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVoRCxNQUFNLEVBQUUsR0FBRyxJQUFJLDZCQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLE1BQU0sY0FBYyxHQUFhLEVBQUUsQ0FBQztRQUNwQyxLQUFLLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUU7WUFDMUUsTUFBTSxVQUFVLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNqQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEQsTUFBTSxpQkFBaUIsR0FBRyxnQ0FBYyxDQUFDLE1B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