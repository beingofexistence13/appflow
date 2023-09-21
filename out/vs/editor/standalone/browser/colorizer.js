/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/trustedTypes", "vs/base/common/strings", "vs/editor/common/languages", "vs/editor/common/tokens/lineTokens", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/common/viewModel", "vs/editor/standalone/common/monarch/monarchLexer"], function (require, exports, trustedTypes_1, strings, languages_1, lineTokens_1, viewLineRenderer_1, viewModel_1, monarchLexer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Colorizer = void 0;
    const ttPolicy = (0, trustedTypes_1.createTrustedTypesPolicy)('standaloneColorizer', { createHTML: value => value });
    class Colorizer {
        static colorizeElement(themeService, languageService, domNode, options) {
            options = options || {};
            const theme = options.theme || 'vs';
            const mimeType = options.mimeType || domNode.getAttribute('lang') || domNode.getAttribute('data-lang');
            if (!mimeType) {
                console.error('Mode not detected');
                return Promise.resolve();
            }
            const languageId = languageService.getLanguageIdByMimeType(mimeType) || mimeType;
            themeService.setTheme(theme);
            const text = domNode.firstChild ? domNode.firstChild.nodeValue : '';
            domNode.className += ' ' + theme;
            const render = (str) => {
                const trustedhtml = ttPolicy?.createHTML(str) ?? str;
                domNode.innerHTML = trustedhtml;
            };
            return this.colorize(languageService, text || '', languageId, options).then(render, (err) => console.error(err));
        }
        static async colorize(languageService, text, languageId, options) {
            const languageIdCodec = languageService.languageIdCodec;
            let tabSize = 4;
            if (options && typeof options.tabSize === 'number') {
                tabSize = options.tabSize;
            }
            if (strings.startsWithUTF8BOM(text)) {
                text = text.substr(1);
            }
            const lines = strings.splitLines(text);
            if (!languageService.isRegisteredLanguageId(languageId)) {
                return _fakeColorize(lines, tabSize, languageIdCodec);
            }
            const tokenizationSupport = await languages_1.TokenizationRegistry.getOrCreate(languageId);
            if (tokenizationSupport) {
                return _colorize(lines, tabSize, tokenizationSupport, languageIdCodec);
            }
            return _fakeColorize(lines, tabSize, languageIdCodec);
        }
        static colorizeLine(line, mightContainNonBasicASCII, mightContainRTL, tokens, tabSize = 4) {
            const isBasicASCII = viewModel_1.ViewLineRenderingData.isBasicASCII(line, mightContainNonBasicASCII);
            const containsRTL = viewModel_1.ViewLineRenderingData.containsRTL(line, isBasicASCII, mightContainRTL);
            const renderResult = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, line, false, isBasicASCII, containsRTL, 0, tokens, [], tabSize, 0, 0, 0, 0, -1, 'none', false, false, null));
            return renderResult.html;
        }
        static colorizeModelLine(model, lineNumber, tabSize = 4) {
            const content = model.getLineContent(lineNumber);
            model.tokenization.forceTokenization(lineNumber);
            const tokens = model.tokenization.getLineTokens(lineNumber);
            const inflatedTokens = tokens.inflate();
            return this.colorizeLine(content, model.mightContainNonBasicASCII(), model.mightContainRTL(), inflatedTokens, tabSize);
        }
    }
    exports.Colorizer = Colorizer;
    function _colorize(lines, tabSize, tokenizationSupport, languageIdCodec) {
        return new Promise((c, e) => {
            const execute = () => {
                const result = _actualColorize(lines, tabSize, tokenizationSupport, languageIdCodec);
                if (tokenizationSupport instanceof monarchLexer_1.MonarchTokenizer) {
                    const status = tokenizationSupport.getLoadStatus();
                    if (status.loaded === false) {
                        status.promise.then(execute, e);
                        return;
                    }
                }
                c(result);
            };
            execute();
        });
    }
    function _fakeColorize(lines, tabSize, languageIdCodec) {
        let html = [];
        const defaultMetadata = ((0 /* FontStyle.None */ << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)
            | (1 /* ColorId.DefaultForeground */ << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
            | (2 /* ColorId.DefaultBackground */ << 24 /* MetadataConsts.BACKGROUND_OFFSET */)) >>> 0;
        const tokens = new Uint32Array(2);
        tokens[0] = 0;
        tokens[1] = defaultMetadata;
        for (let i = 0, length = lines.length; i < length; i++) {
            const line = lines[i];
            tokens[0] = line.length;
            const lineTokens = new lineTokens_1.LineTokens(tokens, line, languageIdCodec);
            const isBasicASCII = viewModel_1.ViewLineRenderingData.isBasicASCII(line, /* check for basic ASCII */ true);
            const containsRTL = viewModel_1.ViewLineRenderingData.containsRTL(line, isBasicASCII, /* check for RTL */ true);
            const renderResult = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, line, false, isBasicASCII, containsRTL, 0, lineTokens, [], tabSize, 0, 0, 0, 0, -1, 'none', false, false, null));
            html = html.concat(renderResult.html);
            html.push('<br/>');
        }
        return html.join('');
    }
    function _actualColorize(lines, tabSize, tokenizationSupport, languageIdCodec) {
        let html = [];
        let state = tokenizationSupport.getInitialState();
        for (let i = 0, length = lines.length; i < length; i++) {
            const line = lines[i];
            const tokenizeResult = tokenizationSupport.tokenizeEncoded(line, true, state);
            lineTokens_1.LineTokens.convertToEndOffset(tokenizeResult.tokens, line.length);
            const lineTokens = new lineTokens_1.LineTokens(tokenizeResult.tokens, line, languageIdCodec);
            const isBasicASCII = viewModel_1.ViewLineRenderingData.isBasicASCII(line, /* check for basic ASCII */ true);
            const containsRTL = viewModel_1.ViewLineRenderingData.containsRTL(line, isBasicASCII, /* check for RTL */ true);
            const renderResult = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, line, false, isBasicASCII, containsRTL, 0, lineTokens.inflate(), [], tabSize, 0, 0, 0, 0, -1, 'none', false, false, null));
            html = html.concat(renderResult.html);
            html.push('<br/>');
            state = tokenizeResult.endState;
        }
        return html.join('');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JpemVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3N0YW5kYWxvbmUvYnJvd3Nlci9jb2xvcml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQU0sUUFBUSxHQUFHLElBQUEsdUNBQXdCLEVBQUMscUJBQXFCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBV2pHLE1BQWEsU0FBUztRQUVkLE1BQU0sQ0FBQyxlQUFlLENBQUMsWUFBcUMsRUFBRSxlQUFpQyxFQUFFLE9BQW9CLEVBQUUsT0FBaUM7WUFDOUosT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7WUFDeEIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7WUFDcEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkcsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBQ25DLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3pCO1lBQ0QsTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQztZQUVqRixZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTdCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDcEUsT0FBTyxDQUFDLFNB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