/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/browser", "vs/base/common/color", "vs/base/common/event", "vs/editor/common/languages", "vs/editor/common/encodedTokenAttributes", "vs/editor/common/languages/supports/tokenization", "vs/editor/standalone/common/themes", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/lifecycle", "vs/platform/theme/common/theme", "vs/platform/theme/browser/iconsStyleSheet"], function (require, exports, dom, browser_1, color_1, event_1, languages_1, encodedTokenAttributes_1, tokenization_1, themes_1, platform_1, colorRegistry_1, themeService_1, lifecycle_1, theme_1, iconsStyleSheet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$T8b = exports.$S8b = exports.$R8b = exports.$Q8b = exports.$P8b = void 0;
    exports.$P8b = 'vs';
    exports.$Q8b = 'vs-dark';
    exports.$R8b = 'hc-black';
    exports.$S8b = 'hc-light';
    const colorRegistry = platform_1.$8m.as(colorRegistry_1.$rv.ColorContribution);
    const themingRegistry = platform_1.$8m.as(themeService_1.$lv.ThemingContribution);
    class StandaloneTheme {
        constructor(name, standaloneThemeData) {
            this.semanticHighlighting = false;
            this.a = standaloneThemeData;
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
            this.b = null;
            this.c = Object.create(null);
            this.d = null;
        }
        get label() {
            return this.themeName;
        }
        get base() {
            return this.a.base;
        }
        notifyBaseUpdated() {
            if (this.a.inherit) {
                this.b = null;
                this.d = null;
            }
        }
        e() {
            if (!this.b) {
                const colors = new Map();
                for (const id in this.a.colors) {
                    colors.set(id, color_1.$Os.fromHex(this.a.colors[id]));
                }
                if (this.a.inherit) {
                    const baseData = getBuiltinRules(this.a.base);
                    for (const id in baseData.colors) {
                        if (!colors.has(id)) {
                            colors.set(id, color_1.$Os.fromHex(baseData.colors[id]));
                        }
                    }
                }
                this.b = colors;
            }
            return this.b;
        }
        getColor(colorId, useDefault) {
            const color = this.e().get(colorId);
            if (color) {
                return color;
            }
            if (useDefault !== false) {
                return this.f(colorId);
            }
            return undefined;
        }
        f(colorId) {
            let color = this.c[colorId];
            if (color) {
                return color;
            }
            color = colorRegistry.resolveDefaultColor(colorId, this);
            this.c[colorId] = color;
            return color;
        }
        defines(colorId) {
            return this.e().has(colorId);
        }
        get type() {
            switch (this.base) {
                case exports.$P8b: return theme_1.ColorScheme.LIGHT;
                case exports.$R8b: return theme_1.ColorScheme.HIGH_CONTRAST_DARK;
                case exports.$S8b: return theme_1.ColorScheme.HIGH_CONTRAST_LIGHT;
                default: return theme_1.ColorScheme.DARK;
            }
        }
        get tokenTheme() {
            if (!this.d) {
                let rules = [];
                let encodedTokensColors = [];
                if (this.a.inherit) {
                    const baseData = getBuiltinRules(this.a.base);
                    rules = baseData.rules;
                    if (baseData.encodedTokensColors) {
                        encodedTokensColors = baseData.encodedTokensColors;
                    }
                }
                // Pick up default colors from `editor.foreground` and `editor.background` if available
                const editorForeground = this.a.colors['editor.foreground'];
                const editorBackground = this.a.colors['editor.background'];
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
                rules = rules.concat(this.a.rules);
                if (this.a.encodedTokensColors) {
                    encodedTokensColors = this.a.encodedTokensColors;
                }
                this.d = tokenization_1.$Lob.createFromRawTokenTheme(rules, encodedTokensColors);
            }
            return this.d;
        }
        getTokenStyleMetadata(type, modifiers, modelLanguage) {
            // use theme rules match
            const style = this.tokenTheme._match([type].concat(modifiers).join('.'));
            const metadata = style.metadata;
            const foreground = encodedTokenAttributes_1.$Us.getForeground(metadata);
            const fontStyle = encodedTokenAttributes_1.$Us.getFontStyle(metadata);
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
        return (themeName === exports.$P8b
            || themeName === exports.$Q8b
            || themeName === exports.$R8b
            || themeName === exports.$S8b);
    }
    function getBuiltinRules(builtinTheme) {
        switch (builtinTheme) {
            case exports.$P8b:
                return themes_1.vs;
            case exports.$Q8b:
                return themes_1.$M8b;
            case exports.$R8b:
                return themes_1.$N8b;
            case exports.$S8b:
                return themes_1.$O8b;
        }
    }
    function newBuiltInTheme(builtinTheme) {
        const themeData = getBuiltinRules(builtinTheme);
        return new StandaloneTheme(builtinTheme, themeData);
    }
    class $T8b extends lifecycle_1.$kc {
        constructor() {
            super();
            this.a = this.B(new event_1.$fd());
            this.onDidColorThemeChange = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidFileIconThemeChange = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidProductIconThemeChange = this.c.event;
            this.f = Object.create(null);
            this.w = new iconsStyleSheet_1.$zzb();
            this.h = true;
            this.g = new Map();
            this.g.set(exports.$P8b, newBuiltInTheme(exports.$P8b));
            this.g.set(exports.$Q8b, newBuiltInTheme(exports.$Q8b));
            this.g.set(exports.$R8b, newBuiltInTheme(exports.$R8b));
            this.g.set(exports.$S8b, newBuiltInTheme(exports.$S8b));
            const iconsStyleSheet = this.B((0, iconsStyleSheet_1.$yzb)(this));
            this.j = iconsStyleSheet.getCSS();
            this.m = '';
            this.n = `${this.j}\n${this.m}`;
            this.r = null;
            this.s = [];
            this.t = null;
            this.setTheme(exports.$P8b);
            this.D();
            this.B(iconsStyleSheet.onDidChange(() => {
                this.j = iconsStyleSheet.getCSS();
                this.G();
            }));
            (0, browser_1.$VN)('(forced-colors: active)', () => {
                this.D();
            });
        }
        registerEditorContainer(domNode) {
            if (dom.$TO(domNode)) {
                return this.z(domNode);
            }
            return this.y();
        }
        y() {
            if (!this.r) {
                this.r = dom.$XO(undefined, style => {
                    style.className = 'monaco-colors';
                    style.textContent = this.n;
                });
                this.s.push(this.r);
            }
            return lifecycle_1.$kc.None;
        }
        z(domNode) {
            const styleElement = dom.$XO(domNode, style => {
                style.className = 'monaco-colors';
                style.textContent = this.n;
            });
            this.s.push(styleElement);
            return {
                dispose: () => {
                    for (let i = 0; i < this.s.length; i++) {
                        if (this.s[i] === styleElement) {
                            this.s.splice(i, 1);
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
            this.g.set(themeName, new StandaloneTheme(themeName, themeData));
            if (isBuiltinTheme(themeName)) {
                this.g.forEach(theme => {
                    if (theme.base === themeName) {
                        theme.notifyBaseUpdated();
                    }
                });
            }
            if (this.u.themeName === themeName) {
                this.setTheme(themeName); // refresh theme
            }
        }
        getColorTheme() {
            return this.u;
        }
        setColorMapOverride(colorMapOverride) {
            this.t = colorMapOverride;
            this.F();
        }
        setTheme(themeName) {
            let theme;
            if (this.g.has(themeName)) {
                theme = this.g.get(themeName);
            }
            else {
                theme = this.g.get(exports.$P8b);
            }
            this.C(theme);
        }
        C(desiredTheme) {
            if (!desiredTheme || this.u === desiredTheme) {
                // Nothing to do
                return;
            }
            this.u = desiredTheme;
            this.F();
        }
        D() {
            if (this.h) {
                const wantsHighContrast = window.matchMedia(`(forced-colors: active)`).matches;
                if (wantsHighContrast !== (0, theme_1.$ev)(this.u.type)) {
                    // switch to high contrast or non-high contrast but stick to dark or light
                    let newThemeName;
                    if ((0, theme_1.$fv)(this.u.type)) {
                        newThemeName = wantsHighContrast ? exports.$R8b : exports.$Q8b;
                    }
                    else {
                        newThemeName = wantsHighContrast ? exports.$S8b : exports.$P8b;
                    }
                    this.C(this.g.get(newThemeName));
                }
            }
        }
        setAutoDetectHighContrast(autoDetectHighContrast) {
            this.h = autoDetectHighContrast;
            this.D();
        }
        F() {
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
            themingRegistry.getThemingParticipants().forEach(p => p(this.u, ruleCollector, this.f));
            const colorVariables = [];
            for (const item of colorRegistry.getColors()) {
                const color = this.u.getColor(item.id, true);
                if (color) {
                    colorVariables.push(`${(0, colorRegistry_1.$ov)(item.id)}: ${color.toString()};`);
                }
            }
            ruleCollector.addRule(`.monaco-editor, .monaco-diff-editor { ${colorVariables.join('\n')} }`);
            const colorMap = this.t || this.u.tokenTheme.getColorMap();
            ruleCollector.addRule((0, tokenization_1.$Rob)(colorMap));
            this.m = cssRules.join('\n');
            this.G();
            languages_1.$bt.setColorMap(colorMap);
            this.a.fire(this.u);
        }
        G() {
            this.n = `${this.j}\n${this.m}`;
            this.s.forEach(styleElement => styleElement.textContent = this.n);
        }
        getFileIconTheme() {
            return {
                hasFileIcons: false,
                hasFolderIcons: false,
                hidesExplorerArrows: false
            };
        }
        getProductIconTheme() {
            return this.w;
        }
    }
    exports.$T8b = $T8b;
});
//# sourceMappingURL=standaloneThemeService.js.map