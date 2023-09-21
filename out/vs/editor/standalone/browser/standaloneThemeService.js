/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/browser", "vs/base/common/color", "vs/base/common/event", "vs/editor/common/languages", "vs/editor/common/encodedTokenAttributes", "vs/editor/common/languages/supports/tokenization", "vs/editor/standalone/common/themes", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/lifecycle", "vs/platform/theme/common/theme", "vs/platform/theme/browser/iconsStyleSheet"], function (require, exports, dom, browser_1, color_1, event_1, languages_1, encodedTokenAttributes_1, tokenization_1, themes_1, platform_1, colorRegistry_1, themeService_1, lifecycle_1, theme_1, iconsStyleSheet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StandaloneThemeService = exports.HC_LIGHT_THEME_NAME = exports.HC_BLACK_THEME_NAME = exports.VS_DARK_THEME_NAME = exports.VS_LIGHT_THEME_NAME = void 0;
    exports.VS_LIGHT_THEME_NAME = 'vs';
    exports.VS_DARK_THEME_NAME = 'vs-dark';
    exports.HC_BLACK_THEME_NAME = 'hc-black';
    exports.HC_LIGHT_THEME_NAME = 'hc-light';
    const colorRegistry = platform_1.Registry.as(colorRegistry_1.Extensions.ColorContribution);
    const themingRegistry = platform_1.Registry.as(themeService_1.Extensions.ThemingContribution);
    class StandaloneTheme {
        constructor(name, standaloneThemeData) {
            this.semanticHighlighting = false;
            this.themeData = standaloneThemeData;
            const base = standaloneThemeData.base;
            if (name.length > 0) {
                if (isBuiltinTheme(name)) {
                    this.id = name;
                }
                else {
                    this.id = base + ' ' + name;
                }
                this.themeName = name;
            }
            else {
                this.id = base;
                this.themeName = base;
            }
            this.colors = null;
            this.defaultColors = Object.create(null);
            this._tokenTheme = null;
        }
        get label() {
            return this.themeName;
        }
        get base() {
            return this.themeData.base;
        }
        notifyBaseUpdated() {
            if (this.themeData.inherit) {
                this.colors = null;
                this._tokenTheme = null;
            }
        }
        getColors() {
            if (!this.colors) {
                const colors = new Map();
                for (const id in this.themeData.colors) {
                    colors.set(id, color_1.Color.fromHex(this.themeData.colors[id]));
                }
                if (this.themeData.inherit) {
                    const baseData = getBuiltinRules(this.themeData.base);
                    for (const id in baseData.colors) {
                        if (!colors.has(id)) {
                            colors.set(id, color_1.Color.fromHex(baseData.colors[id]));
                        }
                    }
                }
                this.colors = colors;
            }
            return this.colors;
        }
        getColor(colorId, useDefault) {
            const color = this.getColors().get(colorId);
            if (color) {
                return color;
            }
            if (useDefault !== false) {
                return this.getDefault(colorId);
            }
            return undefined;
        }
        getDefault(colorId) {
            let color = this.defaultColors[colorId];
            if (color) {
                return color;
            }
            color = colorRegistry.resolveDefaultColor(colorId, this);
            this.defaultColors[colorId] = color;
            return color;
        }
        defines(colorId) {
            return this.getColors().has(colorId);
        }
        get type() {
            switch (this.base) {
                case exports.VS_LIGHT_THEME_NAME: return theme_1.ColorScheme.LIGHT;
                case exports.HC_BLACK_THEME_NAME: return theme_1.ColorScheme.HIGH_CONTRAST_DARK;
                case exports.HC_LIGHT_THEME_NAME: return theme_1.ColorScheme.HIGH_CONTRAST_LIGHT;
                default: return theme_1.ColorScheme.DARK;
            }
        }
        get tokenTheme() {
            if (!this._tokenTheme) {
                let rules = [];
                let encodedTokensColors = [];
                if (this.themeData.inherit) {
                    const baseData = getBuiltinRules(this.themeData.base);
                    rules = baseData.rules;
                    if (baseData.encodedTokensColors) {
                        encodedTokensColors = baseData.encodedTokensColors;
                    }
                }
                // Pick up default colors from `editor.foreground` and `editor.background` if available
                const editorForeground = this.themeData.colors['editor.foreground'];
                const editorBackground = this.themeData.colors['editor.background'];
                if (editorForeground || editorBackground) {
                    const rule = { token: '' };
                    if (editorForeground) {
                        rule.foreground = editorForeground;
                    }
                    if (editorBackground) {
                        rule.background = editorBackground;
                    }
                    rules.push(rule);
                }
                rules = rules.concat(this.themeData.rules);
                if (this.themeData.encodedTokensColors) {
                    encodedTokensColors = this.themeData.encodedTokensColors;
                }
                this._tokenTheme = tokenization_1.TokenTheme.createFromRawTokenTheme(rules, encodedTokensColors);
            }
            return this._tokenTheme;
        }
        getTokenStyleMetadata(type, modifiers, modelLanguage) {
            // use theme rules match
            const style = this.tokenTheme._match([type].concat(modifiers).join('.'));
            const metadata = style.metadata;
            const foreground = encodedTokenAttributes_1.TokenMetadata.getForeground(metadata);
            const fontStyle = encodedTokenAttributes_1.TokenMetadata.getFontStyle(metadata);
            return {
                foreground: foreground,
                italic: Boolean(fontStyle & 1 /* FontStyle.Italic */),
                bold: Boolean(fontStyle & 2 /* FontStyle.Bold */),
                underline: Boolean(fontStyle & 4 /* FontStyle.Underline */),
                strikethrough: Boolean(fontStyle & 8 /* FontStyle.Strikethrough */)
            };
        }
        get tokenColorMap() {
            return [];
        }
    }
    function isBuiltinTheme(themeName) {
        return (themeName === exports.VS_LIGHT_THEME_NAME
            || themeName === exports.VS_DARK_THEME_NAME
            || themeName === exports.HC_BLACK_THEME_NAME
            || themeName === exports.HC_LIGHT_THEME_NAME);
    }
    function getBuiltinRules(builtinTheme) {
        switch (builtinTheme) {
            case exports.VS_LIGHT_THEME_NAME:
                return themes_1.vs;
            case exports.VS_DARK_THEME_NAME:
                return themes_1.vs_dark;
            case exports.HC_BLACK_THEME_NAME:
                return themes_1.hc_black;
            case exports.HC_LIGHT_THEME_NAME:
                return themes_1.hc_light;
        }
    }
    function newBuiltInTheme(builtinTheme) {
        const themeData = getBuiltinRules(builtinTheme);
        return new StandaloneTheme(builtinTheme, themeData);
    }
    class StandaloneThemeService extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onColorThemeChange = this._register(new event_1.Emitter());
            this.onDidColorThemeChange = this._onColorThemeChange.event;
            this._onFileIconThemeChange = this._register(new event_1.Emitter());
            this.onDidFileIconThemeChange = this._onFileIconThemeChange.event;
            this._onProductIconThemeChange = this._register(new event_1.Emitter());
            this.onDidProductIconThemeChange = this._onProductIconThemeChange.event;
            this._environment = Object.create(null);
            this._builtInProductIconTheme = new iconsStyleSheet_1.UnthemedProductIconTheme();
            this._autoDetectHighContrast = true;
            this._knownThemes = new Map();
            this._knownThemes.set(exports.VS_LIGHT_THEME_NAME, newBuiltInTheme(exports.VS_LIGHT_THEME_NAME));
            this._knownThemes.set(exports.VS_DARK_THEME_NAME, newBuiltInTheme(exports.VS_DARK_THEME_NAME));
            this._knownThemes.set(exports.HC_BLACK_THEME_NAME, newBuiltInTheme(exports.HC_BLACK_THEME_NAME));
            this._knownThemes.set(exports.HC_LIGHT_THEME_NAME, newBuiltInTheme(exports.HC_LIGHT_THEME_NAME));
            const iconsStyleSheet = this._register((0, iconsStyleSheet_1.getIconsStyleSheet)(this));
            this._codiconCSS = iconsStyleSheet.getCSS();
            this._themeCSS = '';
            this._allCSS = `${this._codiconCSS}\n${this._themeCSS}`;
            this._globalStyleElement = null;
            this._styleElements = [];
            this._colorMapOverride = null;
            this.setTheme(exports.VS_LIGHT_THEME_NAME);
            this._onOSSchemeChanged();
            this._register(iconsStyleSheet.onDidChange(() => {
                this._codiconCSS = iconsStyleSheet.getCSS();
                this._updateCSS();
            }));
            (0, browser_1.addMatchMediaChangeListener)('(forced-colors: active)', () => {
                this._onOSSchemeChanged();
            });
        }
        registerEditorContainer(domNode) {
            if (dom.isInShadowDOM(domNode)) {
                return this._registerShadowDomContainer(domNode);
            }
            return this._registerRegularEditorContainer();
        }
        _registerRegularEditorContainer() {
            if (!this._globalStyleElement) {
                this._globalStyleElement = dom.createStyleSheet(undefined, style => {
                    style.className = 'monaco-colors';
                    style.textContent = this._allCSS;
                });
                this._styleElements.push(this._globalStyleElement);
            }
            return lifecycle_1.Disposable.None;
        }
        _registerShadowDomContainer(domNode) {
            const styleElement = dom.createStyleSheet(domNode, style => {
                style.className = 'monaco-colors';
                style.textContent = this._allCSS;
            });
            this._styleElements.push(styleElement);
            return {
                dispose: () => {
                    for (let i = 0; i < this._styleElements.length; i++) {
                        if (this._styleElements[i] === styleElement) {
                            this._styleElements.splice(i, 1);
                            return;
                        }
                    }
                }
            };
        }
        defineTheme(themeName, themeData) {
            if (!/^[a-z0-9\-]+$/i.test(themeName)) {
                throw new Error('Illegal theme name!');
            }
            if (!isBuiltinTheme(themeData.base) && !isBuiltinTheme(themeName)) {
                throw new Error('Illegal theme base!');
            }
            // set or replace theme
            this._knownThemes.set(themeName, new StandaloneTheme(themeName, themeData));
            if (isBuiltinTheme(themeName)) {
                this._knownThemes.forEach(theme => {
                    if (theme.base === themeName) {
                        theme.notifyBaseUpdated();
                    }
                });
            }
            if (this._theme.themeName === themeName) {
                this.setTheme(themeName); // refresh theme
            }
        }
        getColorTheme() {
            return this._theme;
        }
        setColorMapOverride(colorMapOverride) {
            this._colorMapOverride = colorMapOverride;
            this._updateThemeOrColorMap();
        }
        setTheme(themeName) {
            let theme;
            if (this._knownThemes.has(themeName)) {
                theme = this._knownThemes.get(themeName);
            }
            else {
                theme = this._knownThemes.get(exports.VS_LIGHT_THEME_NAME);
            }
            this._updateActualTheme(theme);
        }
        _updateActualTheme(desiredTheme) {
            if (!desiredTheme || this._theme === desiredTheme) {
                // Nothing to do
                return;
            }
            this._theme = desiredTheme;
            this._updateThemeOrColorMap();
        }
        _onOSSchemeChanged() {
            if (this._autoDetectHighContrast) {
                const wantsHighContrast = window.matchMedia(`(forced-colors: active)`).matches;
                if (wantsHighContrast !== (0, theme_1.isHighContrast)(this._theme.type)) {
                    // switch to high contrast or non-high contrast but stick to dark or light
                    let newThemeName;
                    if ((0, theme_1.isDark)(this._theme.type)) {
                        newThemeName = wantsHighContrast ? exports.HC_BLACK_THEME_NAME : exports.VS_DARK_THEME_NAME;
                    }
                    else {
                        newThemeName = wantsHighContrast ? exports.HC_LIGHT_THEME_NAME : exports.VS_LIGHT_THEME_NAME;
                    }
                    this._updateActualTheme(this._knownThemes.get(newThemeName));
                }
            }
        }
        setAutoDetectHighContrast(autoDetectHighContrast) {
            this._autoDetectHighContrast = autoDetectHighContrast;
            this._onOSSchemeChanged();
        }
        _updateThemeOrColorMap() {
            const cssRules = [];
            const hasRule = {};
            const ruleCollector = {
                addRule: (rule) => {
                    if (!hasRule[rule]) {
                        cssRules.push(rule);
                        hasRule[rule] = true;
                    }
                }
            };
            themingRegistry.getThemingParticipants().forEach(p => p(this._theme, ruleCollector, this._environment));
            const colorVariables = [];
            for (const item of colorRegistry.getColors()) {
                const color = this._theme.getColor(item.id, true);
                if (color) {
                    colorVariables.push(`${(0, colorRegistry_1.asCssVariableName)(item.id)}: ${color.toString()};`);
                }
            }
            ruleCollector.addRule(`.monaco-editor, .monaco-diff-editor { ${colorVariables.join('\n')} }`);
            const colorMap = this._colorMapOverride || this._theme.tokenTheme.getColorMap();
            ruleCollector.addRule((0, tokenization_1.generateTokensCSSForColorMap)(colorMap));
            this._themeCSS = cssRules.join('\n');
            this._updateCSS();
            languages_1.TokenizationRegistry.setColorMap(colorMap);
            this._onColorThemeChange.fire(this._theme);
        }
        _updateCSS() {
            this._allCSS = `${this._codiconCSS}\n${this._themeCSS}`;
            this._styleElements.forEach(styleElement => styleElement.textContent = this._allCSS);
        }
        getFileIconTheme() {
            return {
                hasFileIcons: false,
                hasFolderIcons: false,
                hidesExplorerArrows: false
            };
        }
        getProductIconTheme() {
            return this._builtInProductIconTheme;
        }
    }
    exports.StandaloneThemeService = StandaloneThemeService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZVRoZW1lU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9zdGFuZGFsb25lL2Jyb3dzZXIvc3RhbmRhbG9uZVRoZW1lU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQm5GLFFBQUEsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO0lBQzNCLFFBQUEsa0JBQWtCLEdBQUcsU0FBUyxDQUFDO0lBQy9CLFFBQUEsbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLFFBQUEsbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0lBRTlDLE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFpQiwwQkFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDaEYsTUFBTSxlQUFlLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQW1CLHlCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFFN0YsTUFBTSxlQUFlO1FBVXBCLFlBQVksSUFBWSxFQUFFLG1CQUF5QztZQTJJbkQseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1lBMUk1QyxJQUFJLENBQUMsU0FBUyxHQUFHLG1CQUFtQixDQUFDO1lBQ3JDLE1BQU0sSUFBSSxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQztZQUN0QyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNwQixJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDekIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7aUJBQ2Y7cUJBQU07b0JBQ04sSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQztpQkFDNUI7Z0JBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7YUFDdEI7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLEVBQUUsR0FBRyxJ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