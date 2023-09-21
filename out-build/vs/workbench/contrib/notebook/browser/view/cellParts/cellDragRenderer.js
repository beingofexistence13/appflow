/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/trustedTypes", "vs/base/common/color", "vs/base/common/platform", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/languages/textToHtmlTokenizer"], function (require, exports, DOM, trustedTypes_1, color_1, platform, range_1, languages, textToHtmlTokenizer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5ob = void 0;
    class EditorTextRenderer {
        static { this.a = (0, trustedTypes_1.$PQ)('cellRendererEditorText', {
            createHTML(input) { return input; }
        }); }
        getRichText(editor, modelRange) {
            const model = editor.getModel();
            if (!model) {
                return null;
            }
            const colorMap = this.d();
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
            const linesHtml = this.b(model, modelRange, colorMap);
            element.innerHTML = linesHtml;
            return element;
        }
        b(model, modelRange, colorMap) {
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
                    result += (0, textToHtmlTokenizer_1.$eY)(lineContent, lineTokens.inflate(), colorMap, startOffset, endOffset, tabSize, platform.$i);
                }
            }
            return EditorTextRenderer.a?.createHTML(result) ?? result;
        }
        d() {
            const colorMap = languages.$bt.getColorMap();
            const result = ['#000000'];
            if (colorMap) {
                for (let i = 1, len = colorMap.length; i < len; i++) {
                    result[i] = color_1.$Os.Format.CSS.formatHex(colorMap[i]);
                }
            }
            return result;
        }
    }
    class $5ob {
        getDragImage(templateData, editor, type) {
            let dragImage = this.a(templateData, editor, type);
            if (!dragImage) {
                // TODO@roblourens I don't think this can happen
                dragImage = document.createElement('div');
                dragImage.textContent = '1 cell';
            }
            return dragImage;
        }
        a(templateData, editor, type) {
            const dragImageContainer = templateData.container.cloneNode(true);
            dragImageContainer.classList.forEach(c => dragImageContainer.classList.remove(c));
            dragImageContainer.classList.add('cell-drag-image', 'monaco-list-row', 'focused', `${type}-cell-row`);
            const editorContainer = dragImageContainer.querySelector('.cell-editor-container');
            if (!editorContainer) {
                return null;
            }
            const richEditorText = new EditorTextRenderer().getRichText(editor, new range_1.$ks(1, 1, 1, 1000));
            if (!richEditorText) {
                return null;
            }
            DOM.$_O(editorContainer, richEditorText);
            return dragImageContainer;
        }
    }
    exports.$5ob = $5ob;
});
//# sourceMappingURL=cellDragRenderer.js.map