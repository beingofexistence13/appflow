/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/themes/common/workbenchThemeService", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/editor", "vs/workbench/services/textMate/browser/textMateTokenizationFeature", "vs/editor/common/languages", "vs/editor/common/encodedTokenAttributes", "vs/workbench/services/textMate/common/TMHelper", "vs/base/common/color", "vs/platform/files/common/files", "vs/base/common/resources", "vs/base/common/network", "vs/base/common/strings"], function (require, exports, uri_1, language_1, commands_1, instantiation_1, workbenchThemeService_1, editorService_1, editor_1, textMateTokenizationFeature_1, languages_1, encodedTokenAttributes_1, TMHelper_1, color_1, files_1, resources_1, network_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ThemeDocument {
        constructor(theme) {
            this._theme = theme;
            this._cache = Object.create(null);
            this._defaultColor = '#000000';
            for (let i = 0, len = this._theme.tokenColors.length; i < len; i++) {
                const rule = this._theme.tokenColors[i];
                if (!rule.scope) {
                    this._defaultColor = rule.settings.foreground;
                }
            }
        }
        _generateExplanation(selector, color) {
            return `${selector}: ${color_1.Color.Format.CSS.formatHexA(color, true).toUpperCase()}`;
        }
        explainTokenColor(scopes, color) {
            const matchingRule = this._findMatchingThemeRule(scopes);
            if (!matchingRule) {
                const expected = color_1.Color.fromHex(this._defaultColor);
                // No matching rule
                if (!color.equals(expected)) {
                    throw new Error(`[${this._theme.label}]: Unexpected color ${color_1.Color.Format.CSS.formatHexA(color)} for ${scopes}. Expected default ${color_1.Color.Format.CSS.formatHexA(expected)}`);
                }
                return this._generateExplanation('default', color);
            }
            const expected = color_1.Color.fromHex(matchingRule.settings.foreground);
            if (!color.equals(expected)) {
                throw new Error(`[${this._theme.label}]: Unexpected color ${color_1.Color.Format.CSS.formatHexA(color)} for ${scopes}. Expected ${color_1.Color.Format.CSS.formatHexA(expected)} coming in from ${matchingRule.rawSelector}`);
            }
            return this._generateExplanation(matchingRule.rawSelector, color);
        }
        _findMatchingThemeRule(scopes) {
            if (!this._cache[scopes]) {
                this._cache[scopes] = (0, TMHelper_1.findMatchingThemeRule)(this._theme, scopes.split(' '));
            }
            return this._cache[scopes];
        }
    }
    let Snapper = class Snapper {
        constructor(languageService, themeService, textMateService) {
            this.languageService = languageService;
            this.themeService = themeService;
            this.textMateService = textMateService;
        }
        _themedTokenize(grammar, lines) {
            const colorMap = languages_1.TokenizationRegistry.getColorMap();
            let state = null;
            const result = [];
            let resultLen = 0;
            for (let i = 0, len = lines.length; i < len; i++) {
                const line = lines[i];
                const tokenizationResult = grammar.tokenizeLine2(line, state);
                for (let j = 0, lenJ = tokenizationResult.tokens.length >>> 1; j < lenJ; j++) {
                    const startOffset = tokenizationResult.tokens[(j << 1)];
                    const metadata = tokenizationResult.tokens[(j << 1) + 1];
                    const endOffset = j + 1 < lenJ ? tokenizationResult.tokens[((j + 1) << 1)] : line.length;
                    const tokenText = line.substring(startOffset, endOffset);
                    const color = encodedTokenAttributes_1.TokenMetadata.getForeground(metadata);
                    result[resultLen++] = {
                        text: tokenText,
                        color: colorMap[color]
                    };
                }
                state = tokenizationResult.ruleStack;
            }
            return result;
        }
        _tokenize(grammar, lines) {
            let state = null;
            const result = [];
            let resultLen = 0;
            for (let i = 0, len = lines.length; i < len; i++) {
                const line = lines[i];
                const tokenizationResult = grammar.tokenizeLine(line, state);
                let lastScopes = null;
                for (let j = 0, lenJ = tokenizationResult.tokens.length; j < lenJ; j++) {
                    const token = tokenizationResult.tokens[j];
                    const tokenText = line.substring(token.startIndex, token.endIndex);
                    const tokenScopes = token.scopes.join(' ');
                    if (lastScopes === tokenScopes) {
                        result[resultLen - 1].c += tokenText;
                    }
                    else {
                        lastScopes = tokenScopes;
                        result[resultLen++] = {
                            c: tokenText,
                            t: tokenScopes,
                            r: {
                                dark_plus: undefined,
                                light_plus: undefined,
                                dark_vs: undefined,
                                light_vs: undefined,
                                hc_black: undefined,
                            }
                        };
                    }
                }
                state = tokenizationResult.ruleStack;
            }
            return result;
        }
        async _getThemesResult(grammar, lines) {
            const currentTheme = this.themeService.getColorTheme();
            const getThemeName = (id) => {
                const part = 'vscode-theme-defaults-themes-';
                const startIdx = id.indexOf(part);
                if (startIdx !== -1) {
                    return id.substring(startIdx + part.length, id.length - 5);
                }
                return undefined;
            };
            const result = {};
            const themeDatas = await this.themeService.getColorThemes();
            const defaultThemes = themeDatas.filter(themeData => !!getThemeName(themeData.id));
            for (const defaultTheme of defaultThemes) {
                const themeId = defaultTheme.id;
                const success = await this.themeService.setColorTheme(themeId, undefined);
                if (success) {
                    const themeName = getThemeName(themeId);
                    result[themeName] = {
                        document: new ThemeDocument(this.themeService.getColorTheme()),
                        tokens: this._themedTokenize(grammar, lines)
                    };
                }
            }
            await this.themeService.setColorTheme(currentTheme.id, undefined);
            return result;
        }
        _enrichResult(result, themesResult) {
            const index = {};
            const themeNames = Object.keys(themesResult);
            for (const themeName of themeNames) {
                index[themeName] = 0;
            }
            for (let i = 0, len = result.length; i < len; i++) {
                const token = result[i];
                for (const themeName of themeNames) {
                    const themedToken = themesResult[themeName].tokens[index[themeName]];
                    themedToken.text = themedToken.text.substr(token.c.length);
                    token.r[themeName] = themesResult[themeName].document.explainTokenColor(token.t, themedToken.color);
                    if (themedToken.text.length === 0) {
                        index[themeName]++;
                    }
                }
            }
        }
        captureSyntaxTokens(fileName, content) {
            const languageId = this.languageService.guessLanguageIdByFilepathOrFirstLine(uri_1.URI.file(fileName));
            return this.textMateService.createTokenizer(languageId).then((grammar) => {
                if (!grammar) {
                    return [];
                }
                const lines = (0, strings_1.splitLines)(content);
                const result = this._tokenize(grammar, lines);
                return this._getThemesResult(grammar, lines).then((themesResult) => {
                    this._enrichResult(result, themesResult);
                    return result.filter(t => t.c.length > 0);
                });
            });
        }
    };
    Snapper = __decorate([
        __param(0, language_1.ILanguageService),
        __param(1, workbenchThemeService_1.IWorkbenchThemeService),
        __param(2, textMateTokenizationFeature_1.ITextMateTokenizationService)
    ], Snapper);
    commands_1.CommandsRegistry.registerCommand('_workbench.captureSyntaxTokens', function (accessor, resource) {
        const process = (resource) => {
            const fileService = accessor.get(files_1.IFileService);
            const fileName = (0, resources_1.basename)(resource);
            const snapper = accessor.get(instantiation_1.IInstantiationService).createInstance(Snapper);
            return fileService.readFile(resource).then(content => {
                return snapper.captureSyntaxTokens(fileName, content.value.toString());
            });
        };
        if (!resource) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const file = editorService.activeEditor ? editor_1.EditorResourceAccessor.getCanonicalUri(editorService.activeEditor, { filterByScheme: network_1.Schemas.file }) : null;
            if (file) {
                process(file).then(result => {
                    console.log(result);
                });
            }
            else {
                console.log('No file editor active');
            }
        }
        else {
            return process(resource);
        }
        return undefined;
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWVzLnRlc3QuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGhlbWVzL2Jyb3dzZXIvdGhlbWVzLnRlc3QuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBc0NoRyxNQUFNLGFBQWE7UUFLbEIsWUFBWSxLQUEyQjtZQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7WUFDL0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNuRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ2hCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFXLENBQUM7aUJBQy9DO2FBQ0Q7UUFDRixDQUFDO1FBRU8sb0JBQW9CLENBQUMsUUFBZ0IsRUFBRSxLQUFZO1lBQzFELE9BQU8sR0FBRyxRQUFRLEtBQUssYUFBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO1FBQ2pGLENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsS0FBWTtZQUVwRCxNQUFNLFlBQVksR0FB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