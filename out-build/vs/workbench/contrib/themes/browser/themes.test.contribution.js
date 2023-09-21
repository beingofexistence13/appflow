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
            this.a = theme;
            this.b = Object.create(null);
            this.d = '#000000';
            for (let i = 0, len = this.a.tokenColors.length; i < len; i++) {
                const rule = this.a.tokenColors[i];
                if (!rule.scope) {
                    this.d = rule.settings.foreground;
                }
            }
        }
        e(selector, color) {
            return `${selector}: ${color_1.$Os.Format.CSS.formatHexA(color, true).toUpperCase()}`;
        }
        explainTokenColor(scopes, color) {
            const matchingRule = this.f(scopes);
            if (!matchingRule) {
                const expected = color_1.$Os.fromHex(this.d);
                // No matching rule
                if (!color.equals(expected)) {
                    throw new Error(`[${this.a.label}]: Unexpected color ${color_1.$Os.Format.CSS.formatHexA(color)} for ${scopes}. Expected default ${color_1.$Os.Format.CSS.formatHexA(expected)}`);
                }
                return this.e('default', color);
            }
            const expected = color_1.$Os.fromHex(matchingRule.settings.foreground);
            if (!color.equals(expected)) {
                throw new Error(`[${this.a.label}]: Unexpected color ${color_1.$Os.Format.CSS.formatHexA(color)} for ${scopes}. Expected ${color_1.$Os.Format.CSS.formatHexA(expected)} coming in from ${matchingRule.rawSelector}`);
            }
            return this.e(matchingRule.rawSelector, color);
        }
        f(scopes) {
            if (!this.b[scopes]) {
                this.b[scopes] = (0, TMHelper_1.$8Xb)(this.a, scopes.split(' '));
            }
            return this.b[scopes];
        }
    }
    let Snapper = class Snapper {
        constructor(a, b, d) {
            this.a = a;
            this.b = b;
            this.d = d;
        }
        e(grammar, lines) {
            const colorMap = languages_1.$bt.getColorMap();
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
                    const color = encodedTokenAttributes_1.$Us.getForeground(metadata);
                    result[resultLen++] = {
                        text: tokenText,
                        color: colorMap[color]
                    };
                }
                state = tokenizationResult.ruleStack;
            }
            return result;
        }
        f(grammar, lines) {
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
        async g(grammar, lines) {
            const currentTheme = this.b.getColorTheme();
            const getThemeName = (id) => {
                const part = 'vscode-theme-defaults-themes-';
                const startIdx = id.indexOf(part);
                if (startIdx !== -1) {
                    return id.substring(startIdx + part.length, id.length - 5);
                }
                return undefined;
            };
            const result = {};
            const themeDatas = await this.b.getColorThemes();
            const defaultThemes = themeDatas.filter(themeData => !!getThemeName(themeData.id));
            for (const defaultTheme of defaultThemes) {
                const themeId = defaultTheme.id;
                const success = await this.b.setColorTheme(themeId, undefined);
                if (success) {
                    const themeName = getThemeName(themeId);
                    result[themeName] = {
                        document: new ThemeDocument(this.b.getColorTheme()),
                        tokens: this.e(grammar, lines)
                    };
                }
            }
            await this.b.setColorTheme(currentTheme.id, undefined);
            return result;
        }
        h(result, themesResult) {
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
            const languageId = this.a.guessLanguageIdByFilepathOrFirstLine(uri_1.URI.file(fileName));
            return this.d.createTokenizer(languageId).then((grammar) => {
                if (!grammar) {
                    return [];
                }
                const lines = (0, strings_1.$Ae)(content);
                const result = this.f(grammar, lines);
                return this.g(grammar, lines).then((themesResult) => {
                    this.h(result, themesResult);
                    return result.filter(t => t.c.length > 0);
                });
            });
        }
    };
    Snapper = __decorate([
        __param(0, language_1.$ct),
        __param(1, workbenchThemeService_1.$egb),
        __param(2, textMateTokenizationFeature_1.$qBb)
    ], Snapper);
    commands_1.$Gr.registerCommand('_workbench.captureSyntaxTokens', function (accessor, resource) {
        const process = (resource) => {
            const fileService = accessor.get(files_1.$6j);
            const fileName = (0, resources_1.$fg)(resource);
            const snapper = accessor.get(instantiation_1.$Ah).createInstance(Snapper);
            return fileService.readFile(resource).then(content => {
                return snapper.captureSyntaxTokens(fileName, content.value.toString());
            });
        };
        if (!resource) {
            const editorService = accessor.get(editorService_1.$9C);
            const file = editorService.activeEditor ? editor_1.$3E.getCanonicalUri(editorService.activeEditor, { filterByScheme: network_1.Schemas.file }) : null;
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
//# sourceMappingURL=themes.test.contribution.js.map