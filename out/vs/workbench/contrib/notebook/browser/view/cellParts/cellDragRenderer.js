/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/trustedTypes", "vs/base/common/color", "vs/base/common/platform", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/languages/textToHtmlTokenizer"], function (require, exports, DOM, trustedTypes_1, color_1, platform, range_1, languages, textToHtmlTokenizer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeCellDragImageRenderer = void 0;
    class EditorTextRenderer {
        static { this._ttPolicy = (0, trustedTypes_1.createTrustedTypesPolicy)('cellRendererEditorText', {
            createHTML(input) { return input; }
        }); }
        getRichText(editor, modelRange) {
            const model = editor.getModel();
            if (!model) {
                return null;
            }
            const colorMap = this.getDefaultColorMap();
            const fontInfo = editor.getOptions().get(50 /* EditorOption.fontInfo */);
            const fontFamilyVar = '--notebook-editor-font-family';
            const fontSizeVar = '--notebook-editor-font-size';
            const fontWeightVar = '--notebook-editor-font-weight';
            const style = ``
                + `color: ${colorMap[1 /* ColorId.DefaultForeground */]};`
                + `background-color: ${colorMap[2 /* ColorId.DefaultBackground */]};`
                + `font-family: var(${fontFamilyVar});`
                + `font-weight: var(${fontWeightVar});`
                + `font-size: var(${fontSizeVar});`
                + `line-height: ${fontInfo.lineHeight}px;`
                + `white-space: pre;`;
            const element = DOM.$('div', { style });
            const fontSize = fontInfo.fontSize;
            const fontWeight = fontInfo.fontWeight;
            element.style.setProperty(fontFamilyVar, fontInfo.fontFamily);
            element.style.setProperty(fontSizeVar, `${fontSize}px`);
            element.style.setProperty(fontWeightVar, fontWeight);
            const linesHtml = this.getRichTextLinesAsHtml(model, modelRange, colorMap);
            element.innerHTML = linesHtml;
            return element;
        }
        getRichTextLinesAsHtml(model, modelRange, colorMap) {
            const startLineNumber = modelRange.startLineNumber;
            const startColumn = modelRange.startColumn;
            const endLineNumber = modelRange.endLineNumber;
            const endColumn = modelRange.endColumn;
            const tabSize = model.getOptions().tabSize;
            let result = '';
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const lineTokens = model.tokenization.getLineTokens(lineNumber);
                const lineContent = lineTokens.getLineContent();
                const startOffset = (lineNumber === startLineNumber ? startColumn - 1 : 0);
                const endOffset = (lineNumber === endLineNumber ? endColumn - 1 : lineContent.length);
                if (lineContent === '') {
                    result += '<br>';
                }
                else {
                    result += (0, textToHtmlTokenizer_1.tokenizeLineToHTML)(lineContent, lineTokens.inflate(), colorMap, startOffset, endOffset, tabSize, platform.isWindows);
                }
            }
            return EditorTextRenderer._ttPolicy?.createHTML(result) ?? result;
        }
        getDefaultColorMap() {
            const colorMap = languages.TokenizationRegistry.getColorMap();
            const result = ['#000000'];
            if (colorMap) {
                for (let i = 1, len = colorMap.length; i < len; i++) {
                    result[i] = color_1.Color.Format.CSS.formatHex(colorMap[i]);
                }
            }
            return result;
        }
    }
    class CodeCellDragImageRenderer {
        getDragImage(templateData, editor, type) {
            let dragImage = this.getDragImageImpl(templateData, editor, type);
            if (!dragImage) {
                // TODO@roblourens I don't think this can happen
                dragImage = document.createElement('div');
                dragImage.textContent = '1 cell';
            }
            return dragImage;
        }
        getDragImageImpl(templateData, editor, type) {
            const dragImageContainer = templateData.container.cloneNode(true);
            dragImageContainer.classList.forEach(c => dragImageContainer.classList.remove(c));
            dragImageContainer.classList.add('cell-drag-image', 'monaco-list-row', 'focused', `${type}-cell-row`);
            const editorContainer = dragImageContainer.querySelector('.cell-editor-container');
            if (!editorContainer) {
                return null;
            }
            const richEditorText = new EditorTextRenderer().getRichText(editor, new range_1.Range(1, 1, 1, 1000));
            if (!richEditorText) {
                return null;
            }
            DOM.reset(editorContainer, richEditorText);
            return dragImageContainer;
        }
    }
    exports.CodeCellDragImageRenderer = CodeCellDragImageRenderer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbERyYWdSZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlldy9jZWxsUGFydHMvY2VsbERyYWdSZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBTSxrQkFBa0I7aUJBRVIsY0FBUyxHQUFHLElBQUEsdUNBQXdCLEVBQUMsd0JBQXdCLEVBQUU7WUFDN0UsVUFBVSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDbkMsQ0FBQyxDQUFDO1FBRUgsV0FBVyxDQUFDLE1BQW1CLEVBQUUsVUFBaUI7WUFDakQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQzNDLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLGdDQUF1QixDQUFDO1lBQ2hFLE1BQU0sYUFBYSxHQUFHLCtCQUErQixDQUFDO1lBQ3RELE1BQU0sV0FBVyxHQUFHLDZCQUE2QixDQUFDO1lBQ2xELE1BQU0sYUFBYSxHQUFHLCtCQUErQixDQUFDO1lBRXRELE1BQU0sS0FBSyxHQUFHLEVBQUU7a0JBQ2IsVUFBVSxRQUFRLG1DQUEyQixHQUFHO2tCQUNoRCxxQkFBcUIsUUFBUSxtQ0FBMkIsR0FBRztrQkFDM0Qsb0JBQW9CLGFBQWEsSUFBSTtrQkFDckMsb0JBQW9CLGFBQWEsSUFBSTtrQkFDckMsa0JBQWtCLFdBQVcsSUFBSTtrQkFDakMsZ0JBQWdCLFFBQVEsQ0FBQyxVQUFVLEtBQUs7a0JBQ3hDLG1CQUFtQixDQUFDO1lBRXZC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