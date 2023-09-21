/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/json", "vs/base/common/color", "vs/workbench/services/themes/common/workbenchThemeService", "vs/workbench/services/themes/common/themeCompatibility", "vs/nls!vs/workbench/services/themes/common/colorThemeData", "vs/base/common/types", "vs/base/common/resources", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/registry/common/platform", "vs/base/common/jsonErrorMessages", "vs/workbench/services/themes/common/plistParser", "vs/platform/theme/common/tokenClassificationRegistry", "vs/workbench/services/themes/common/textMateScopeMatcher", "vs/platform/theme/common/theme"], function (require, exports, path_1, Json, color_1, workbenchThemeService_1, themeCompatibility_1, nls, types, resources, colorRegistry_1, themeService_1, platform_1, jsonErrorMessages_1, plistParser_1, tokenClassificationRegistry_1, textMateScopeMatcher_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fzb = void 0;
    const colorRegistry = platform_1.$8m.as(colorRegistry_1.$rv.ColorContribution);
    const tokenClassificationRegistry = (0, tokenClassificationRegistry_1.$Y$)();
    const tokenGroupToScopesMap = {
        comments: ['comment', 'punctuation.definition.comment'],
        strings: ['string', 'meta.embedded.assembly'],
        keywords: ['keyword - keyword.operator', 'keyword.control', 'storage', 'storage.type'],
        numbers: ['constant.numeric'],
        types: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'],
        functions: ['entity.name.function', 'support.function'],
        variables: ['variable', 'entity.name.variable']
    };
    class $fzb {
        static { this.STORAGE_KEY = 'colorThemeData'; }
        constructor(id, label, settingsId) {
            this.h = [];
            this.j = [];
            this.l = {};
            this.m = {};
            this.n = [];
            this.o = [];
            this.u = undefined; // created on demand
            this.v = undefined; // created on demand
            this.id = id;
            this.label = label;
            this.settingsId = settingsId;
            this.isLoaded = false;
        }
        get semanticHighlighting() {
            if (this.c !== undefined) {
                return this.c;
            }
            if (this.g !== undefined) {
                return this.g;
            }
            return !!this.b;
        }
        get tokenColors() {
            if (!this.u) {
                const result = [];
                // the default rule (scope empty) is always the first rule. Ignore all other default rules.
                const foreground = this.getColor(colorRegistry_1.$xw) || this.getDefault(colorRegistry_1.$xw);
                const background = this.getColor(colorRegistry_1.$ww) || this.getDefault(colorRegistry_1.$ww);
                result.push({
                    settings: {
                        foreground: normalizeColor(foreground),
                        background: normalizeColor(background)
                    }
                });
                let hasDefaultTokens = false;
                function addRule(rule) {
                    if (rule.scope && rule.settings) {
                        if (rule.scope === 'token.info-token') {
                            hasDefaultTokens = true;
                        }
                        result.push({ scope: rule.scope, settings: { foreground: normalizeColor(rule.settings.foreground), background: normalizeColor(rule.settings.background), fontStyle: rule.settings.fontStyle } });
                    }
                }
                this.h.forEach(addRule);
                // Add the custom colors after the theme colors
                // so that they will override them
                this.j.forEach(addRule);
                if (!hasDefaultTokens) {
                    defaultThemeColors[this.type].forEach(addRule);
                }
                this.u = result;
            }
            return this.u;
        }
        getColor(colorId, useDefault) {
            let color = this.m[colorId];
            if (color) {
                return color;
            }
            color = this.l[colorId];
            if (useDefault !== false && types.$qf(color)) {
                color = this.getDefault(colorId);
            }
            return color;
        }
        w(type, modifiers, language, useDefault = true, definitions = {}) {
            const result = {
                foreground: undefined,
                bold: undefined,
                underline: undefined,
                strikethrough: undefined,
                italic: undefined
            };
            const score = {
                foreground: -1,
                bold: -1,
                underline: -1,
                strikethrough: -1,
                italic: -1
            };
            function _processStyle(matchScore, style, definition) {
                if (style.foreground && score.foreground <= matchScore) {
                    score.foreground = matchScore;
                    result.foreground = style.foreground;
                    definitions.foreground = definition;
                }
                for (const p of ['bold', 'underline', 'strikethrough', 'italic']) {
                    const property = p;
                    const info = style[property];
                    if (info !== undefined) {
                        if (score[property] <= matchScore) {
                            score[property] = matchScore;
                            result[property] = info;
                            definitions[property] = definition;
                        }
                    }
                }
            }
            function _processSemanticTokenRule(rule) {
                const matchScore = rule.selector.match(type, modifiers, language);
                if (matchScore >= 0) {
                    _processStyle(matchScore, rule.style, rule);
                }
            }
            this.n.forEach(_processSemanticTokenRule);
            this.o.forEach(_processSemanticTokenRule);
            let hasUndefinedStyleProperty = false;
            for (const k in score) {
                const key = k;
                if (score[key] === -1) {
                    hasUndefinedStyleProperty = true;
                }
                else {
                    score[key] = Number.MAX_VALUE; // set it to the max, so it won't be replaced by a default
                }
            }
            if (hasUndefinedStyleProperty) {
                for (const rule of tokenClassificationRegistry.getTokenStylingDefaultRules()) {
                    const matchScore = rule.selector.match(type, modifiers, language);
                    if (matchScore >= 0) {
                        let style;
                        if (rule.defaults.scopesToProbe) {
                            style = this.resolveScopes(rule.defaults.scopesToProbe);
                            if (style) {
                                _processStyle(matchScore, style, rule.defaults.scopesToProbe);
                            }
                        }
                        if (!style && useDefault !== false) {
                            const tokenStyleValue = rule.defaults[this.type];
                            style = this.resolveTokenStyleValue(tokenStyleValue);
                            if (style) {
                                _processStyle(matchScore, style, tokenStyleValue);
                            }
                        }
                    }
                }
            }
            return tokenClassificationRegistry_1.$W$.fromData(result);
        }
        /**
         * @param tokenStyleValue Resolve a tokenStyleValue in the context of a theme
         */
        resolveTokenStyleValue(tokenStyleValue) {
            if (tokenStyleValue === undefined) {
                return undefined;
            }
            else if (typeof tokenStyleValue === 'string') {
                const { type, modifiers, language } = (0, tokenClassificationRegistry_1.$X$)(tokenStyleValue, '');
                return this.w(type, modifiers, language);
            }
            else if (typeof tokenStyleValue === 'object') {
                return tokenStyleValue;
            }
            return undefined;
        }
        x() {
            // collect all colors that tokens can have
            if (!this.v) {
                const index = new TokenColorIndex();
                this.tokenColors.forEach(rule => {
                    index.add(rule.settings.foreground);
                    index.add(rule.settings.background);
                });
                this.n.forEach(r => index.add(r.style.foreground));
                tokenClassificationRegistry.getTokenStylingDefaultRules().forEach(r => {
                    const defaultColor = r.defaults[this.type];
                    if (defaultColor && typeof defaultColor === 'object') {
                        index.add(defaultColor.foreground);
                    }
                });
                this.o.forEach(r => index.add(r.style.foreground));
                this.v = index;
            }
            return this.v;
        }
        get tokenColorMap() {
            return this.x().asArray();
        }
        getTokenStyleMetadata(typeWithLanguage, modifiers, defaultLanguage, useDefault = true, definitions = {}) {
            const { type, language } = (0, tokenClassificationRegistry_1.$X$)(typeWithLanguage, defaultLanguage);
            const style = this.w(type, modifiers, language, useDefault, definitions);
            if (!style) {
                return undefined;
            }
            return {
                foreground: this.x().get(style.foreground),
                bold: style.bold,
                underline: style.underline,
                strikethrough: style.strikethrough,
                italic: style.italic,
            };
        }
        getTokenStylingRuleScope(rule) {
            if (this.o.indexOf(rule) !== -1) {
                return 'setting';
            }
            if (this.n.indexOf(rule) !== -1) {
                return 'theme';
            }
            return undefined;
        }
        getDefault(colorId) {
            return colorRegistry.resolveDefaultColor(colorId, this);
        }
        resolveScopes(scopes, definitions) {
            if (!this.q) {
                this.q = this.h.map(getScopeMatcher);
            }
            if (!this.t) {
                this.t = this.j.map(getScopeMatcher);
            }
            for (const scope of scopes) {
                let foreground = undefined;
                let fontStyle = undefined;
                let foregroundScore = -1;
                let fontStyleScore = -1;
                let fontStyleThemingRule = undefined;
                let foregroundThemingRule = undefined;
                function findTokenStyleForScopeInScopes(scopeMatchers, themingRules) {
                    for (let i = 0; i < scopeMatchers.length; i++) {
                        const score = scopeMatchers[i](scope);
                        if (score >= 0) {
                            const themingRule = themingRules[i];
                            const settings = themingRules[i].settings;
                            if (score >= foregroundScore && settings.foreground) {
                                foreground = settings.foreground;
                                foregroundScore = score;
                                foregroundThemingRule = themingRule;
                            }
                            if (score >= fontStyleScore && types.$jf(settings.fontStyle)) {
                                fontStyle = settings.fontStyle;
                                fontStyleScore = score;
                                fontStyleThemingRule = themingRule;
                            }
                        }
                    }
                }
                findTokenStyleForScopeInScopes(this.q, this.h);
                findTokenStyleForScopeInScopes(this.t, this.j);
                if (foreground !== undefined || fontStyle !== undefined) {
                    if (definitions) {
                        definitions.foreground = foregroundThemingRule;
                        definitions.bold = definitions.italic = definitions.underline = definitions.strikethrough = fontStyleThemingRule;
                        definitions.scope = scope;
                    }
                    return tokenClassificationRegistry_1.$W$.fromSettings(foreground, fontStyle);
                }
            }
            return undefined;
        }
        defines(colorId) {
            return this.m.hasOwnProperty(colorId) || this.l.hasOwnProperty(colorId);
        }
        setCustomizations(settings) {
            this.setCustomColors(settings.colorCustomizations);
            this.setCustomTokenColors(settings.tokenColorCustomizations);
            this.setCustomSemanticTokenColors(settings.semanticTokenColorCustomizations);
        }
        setCustomColors(colors) {
            this.m = {};
            this.y(colors);
            const themeSpecificColors = this.getThemeSpecificColors(colors);
            if (types.$lf(themeSpecificColors)) {
                this.y(themeSpecificColors);
            }
            this.v = undefined;
            this.u = undefined;
            this.t = undefined;
        }
        y(colors) {
            for (const id in colors) {
                const colorVal = colors[id];
                if (typeof colorVal === 'string') {
                    this.m[id] = color_1.$Os.fromHex(colorVal);
                }
            }
        }
        setCustomTokenColors(customTokenColors) {
            this.j = [];
            this.g = undefined;
            // first add the non-theme specific settings
            this.B(customTokenColors);
            // append theme specific settings. Last rules will win.
            const themeSpecificTokenColors = this.getThemeSpecificColors(customTokenColors);
            if (types.$lf(themeSpecificTokenColors)) {
                this.B(themeSpecificTokenColors);
            }
            this.v = undefined;
            this.u = undefined;
            this.t = undefined;
        }
        setCustomSemanticTokenColors(semanticTokenColors) {
            this.o = [];
            this.c = undefined;
            if (semanticTokenColors) {
                this.c = semanticTokenColors.enabled;
                if (semanticTokenColors.rules) {
                    this.z(semanticTokenColors.rules);
                }
                const themeSpecificColors = this.getThemeSpecificColors(semanticTokenColors);
                if (types.$lf(themeSpecificColors)) {
                    if (themeSpecificColors.enabled !== undefined) {
                        this.c = themeSpecificColors.enabled;
                    }
                    if (themeSpecificColors.rules) {
                        this.z(themeSpecificColors.rules);
                    }
                }
            }
            this.v = undefined;
            this.u = undefined;
        }
        isThemeScope(key) {
            return key.charAt(0) === workbenchThemeService_1.$jgb && key.charAt(key.length - 1) === workbenchThemeService_1.$kgb;
        }
        isThemeScopeMatch(themeId) {
            const themeIdFirstChar = themeId.charAt(0);
            const themeIdLastChar = themeId.charAt(themeId.length - 1);
            const themeIdPrefix = themeId.slice(0, -1);
            const themeIdInfix = themeId.slice(1, -1);
            const themeIdSuffix = themeId.slice(1);
            return themeId === this.settingsId
                || (this.settingsId.includes(themeIdInfix) && themeIdFirstChar === workbenchThemeService_1.$lgb && themeIdLastChar === workbenchThemeService_1.$lgb)
                || (this.settingsId.startsWith(themeIdPrefix) && themeIdLastChar === workbenchThemeService_1.$lgb)
                || (this.settingsId.endsWith(themeIdSuffix) && themeIdFirstChar === workbenchThemeService_1.$lgb);
        }
        getThemeSpecificColors(colors) {
            let themeSpecificColors;
            for (const key in colors) {
                const scopedColors = colors[key];
                if (this.isThemeScope(key) && scopedColors instanceof Object && !Array.isArray(scopedColors)) {
                    const themeScopeList = key.match(workbenchThemeService_1.$mgb) || [];
                    for (const themeScope of themeScopeList) {
                        const themeId = themeScope.substring(1, themeScope.length - 1);
                        if (this.isThemeScopeMatch(themeId)) {
                            if (!themeSpecificColors) {
                                themeSpecificColors = {};
                            }
                            const scopedThemeSpecificColors = scopedColors;
                            for (const subkey in scopedThemeSpecificColors) {
                                const originalColors = themeSpecificColors[subkey];
                                const overrideColors = scopedThemeSpecificColors[subkey];
                                if (Array.isArray(originalColors) && Array.isArray(overrideColors)) {
                                    themeSpecificColors[subkey] = originalColors.concat(overrideColors);
                                }
                                else if (overrideColors) {
                                    themeSpecificColors[subkey] = overrideColors;
                                }
                            }
                        }
                    }
                }
            }
            return themeSpecificColors;
        }
        z(tokenStylingRuleSection) {
            for (const key in tokenStylingRuleSection) {
                if (!this.isThemeScope(key)) { // still do this test until experimental settings are gone
                    try {
                        const rule = readSemanticTokenRule(key, tokenStylingRuleSection[key]);
                        if (rule) {
                            this.o.push(rule);
                        }
                    }
                    catch (e) {
                        // invalid selector, ignore
                    }
                }
            }
        }
        B(customTokenColors) {
            // Put the general customizations such as comments, strings, etc. first so that
            // they can be overridden by specific customizations like "string.interpolated"
            for (const tokenGroup in tokenGroupToScopesMap) {
                const group = tokenGroup; // TS doesn't type 'tokenGroup' properly
                const value = customTokenColors[group];
                if (value) {
                    const settings = typeof value === 'string' ? { foreground: value } : value;
                    const scopes = tokenGroupToScopesMap[group];
                    for (const scope of scopes) {
                        this.j.push({ scope, settings });
                    }
                }
            }
            // specific customizations
            if (Array.isArray(customTokenColors.textMateRules)) {
                for (const rule of customTokenColors.textMateRules) {
                    if (rule.scope && rule.settings) {
                        this.j.push(rule);
                    }
                }
            }
            if (customTokenColors.semanticHighlighting !== undefined) {
                this.g = customTokenColors.semanticHighlighting;
            }
        }
        ensureLoaded(extensionResourceLoaderService) {
            return !this.isLoaded ? this.C(extensionResourceLoaderService) : Promise.resolve(undefined);
        }
        reload(extensionResourceLoaderService) {
            return this.C(extensionResourceLoaderService);
        }
        C(extensionResourceLoaderService) {
            if (!this.location) {
                return Promise.resolve(undefined);
            }
            this.h = [];
            this.clearCaches();
            const result = {
                colors: {},
                textMateRules: [],
                semanticTokenRules: [],
                semanticHighlighting: false
            };
            return _loadColorTheme(extensionResourceLoaderService, this.location, result).then(_ => {
                this.isLoaded = true;
                this.n = result.semanticTokenRules;
                this.l = result.colors;
                this.h = result.textMateRules;
                this.b = result.semanticHighlighting;
            });
        }
        clearCaches() {
            this.v = undefined;
            this.u = undefined;
            this.q = undefined;
            this.t = undefined;
        }
        toStorage(storageService) {
            const colorMapData = {};
            for (const key in this.l) {
                colorMapData[key] = color_1.$Os.Format.CSS.formatHexA(this.l[key], true);
            }
            // no need to persist custom colors, they will be taken from the settings
            const value = JSON.stringify({
                id: this.id,
                label: this.label,
                settingsId: this.settingsId,
                themeTokenColors: this.h.map(tc => ({ settings: tc.settings, scope: tc.scope })),
                semanticTokenRules: this.n.map(tokenClassificationRegistry_1.SemanticTokenRule.toJSONObject),
                extensionData: workbenchThemeService_1.ExtensionData.toJSONObject(this.extensionData),
                themeSemanticHighlighting: this.b,
                colorMap: colorMapData,
                watch: this.watch
            });
            // roam persisted color theme colors. Don't enable for icons as they contain references to fonts and images.
            storageService.store($fzb.STORAGE_KEY, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        get baseTheme() {
            return this.classNames[0];
        }
        get classNames() {
            return this.id.split(' ');
        }
        get type() {
            switch (this.baseTheme) {
                case workbenchThemeService_1.$fgb: return theme_1.ColorScheme.LIGHT;
                case workbenchThemeService_1.$hgb: return theme_1.ColorScheme.HIGH_CONTRAST_DARK;
                case workbenchThemeService_1.$igb: return theme_1.ColorScheme.HIGH_CONTRAST_LIGHT;
                default: return theme_1.ColorScheme.DARK;
            }
        }
        // constructors
        static createUnloadedThemeForThemeType(themeType, colorMap) {
            return $fzb.createUnloadedTheme((0, themeService_1.$kv)(themeType), colorMap);
        }
        static createUnloadedTheme(id, colorMap) {
            const themeData = new $fzb(id, '', '__' + id);
            themeData.isLoaded = false;
            themeData.h = [];
            themeData.watch = false;
            if (colorMap) {
                for (const id in colorMap) {
                    themeData.l[id] = color_1.$Os.fromHex(colorMap[id]);
                }
            }
            return themeData;
        }
        static createLoadedEmptyTheme(id, settingsId) {
            const themeData = new $fzb(id, '', settingsId);
            themeData.isLoaded = true;
            themeData.h = [];
            themeData.watch = false;
            return themeData;
        }
        static fromStorageData(storageService) {
            const input = storageService.get($fzb.STORAGE_KEY, 0 /* StorageScope.PROFILE */);
            if (!input) {
                return undefined;
            }
            try {
                const data = JSON.parse(input);
                const theme = new $fzb('', '', '');
                for (const key in data) {
                    switch (key) {
                        case 'colorMap': {
                            const colorMapData = data[key];
                            for (const id in colorMapData) {
                                theme.l[id] = color_1.$Os.fromHex(colorMapData[id]);
                            }
                            break;
                        }
                        case 'themeTokenColors':
                        case 'id':
                        case 'label':
                        case 'settingsId':
                        case 'watch':
                        case 'themeSemanticHighlighting':
                            theme[key] = data[key];
                            break;
                        case 'semanticTokenRules': {
                            const rulesData = data[key];
                            if (Array.isArray(rulesData)) {
                                for (const d of rulesData) {
                                    const rule = tokenClassificationRegistry_1.SemanticTokenRule.fromJSONObject(tokenClassificationRegistry, d);
                                    if (rule) {
                                        theme.n.push(rule);
                                    }
                                }
                            }
                            break;
                        }
                        case 'location':
                            // ignore, no longer restore
                            break;
                        case 'extensionData':
                            theme.extensionData = workbenchThemeService_1.ExtensionData.fromJSONObject(data.extensionData);
                            break;
                    }
                }
                if (!theme.id || !theme.settingsId) {
                    return undefined;
                }
                return theme;
            }
            catch (e) {
                return undefined;
            }
        }
        static fromExtensionTheme(theme, colorThemeLocation, extensionData) {
            const baseTheme = theme['uiTheme'] || 'vs-dark';
            const themeSelector = toCSSSelector(extensionData.extensionId, theme.path);
            const id = `${baseTheme} ${themeSelector}`;
            const label = theme.label || (0, path_1.$ae)(theme.path);
            const settingsId = theme.id || label;
            const themeData = new $fzb(id, label, settingsId);
            themeData.description = theme.description;
            themeData.watch = theme._watch === true;
            themeData.location = colorThemeLocation;
            themeData.extensionData = extensionData;
            themeData.isLoaded = false;
            return themeData;
        }
    }
    exports.$fzb = $fzb;
    function toCSSSelector(extensionId, path) {
        if (path.startsWith('./')) {
            path = path.substr(2);
        }
        let str = `${extensionId}-${path}`;
        //remove all characters that are not allowed in css
        str = str.replace(/[^_a-zA-Z0-9-]/g, '-');
        if (str.charAt(0).match(/[0-9-]/)) {
            str = '_' + str;
        }
        return str;
    }
    async function _loadColorTheme(extensionResourceLoaderService, themeLocation, result) {
        if (resources.$gg(themeLocation) === '.json') {
            const content = await extensionResourceLoaderService.readExtensionResource(themeLocation);
            const errors = [];
            const contentValue = Json.$Lm(content, errors);
            if (errors.length > 0) {
                return Promise.reject(new Error(nls.localize(0, null, errors.map(e => (0, jsonErrorMessages_1.$mp)(e.error)).join(', '))));
            }
            else if (Json.$Um(contentValue) !== 'object') {
                return Promise.reject(new Error(nls.localize(1, null)));
            }
            if (contentValue.include) {
                await _loadColorTheme(extensionResourceLoaderService, resources.$ig(resources.$hg(themeLocation), contentValue.include), result);
            }
            if (Array.isArray(contentValue.settings)) {
                (0, themeCompatibility_1.$7yb)(contentValue.settings, result);
                return null;
            }
            result.semanticHighlighting = result.semanticHighlighting || contentValue.semanticHighlighting;
            const colors = contentValue.colors;
            if (colors) {
                if (typeof colors !== 'object') {
                    return Promise.reject(new Error(nls.localize(2, null, themeLocation.toString())));
                }
                // new JSON color themes format
                for (const colorId in colors) {
                    const colorHex = colors[colorId];
                    if (typeof colorHex === 'string') { // ignore colors tht are null
                        result.colors[colorId] = color_1.$Os.fromHex(colors[colorId]);
                    }
                }
            }
            const tokenColors = contentValue.tokenColors;
            if (tokenColors) {
                if (Array.isArray(tokenColors)) {
                    result.textMateRules.push(...tokenColors);
                }
                else if (typeof tokenColors === 'string') {
                    await _loadSyntaxTokens(extensionResourceLoaderService, resources.$ig(resources.$hg(themeLocation), tokenColors), result);
                }
                else {
                    return Promise.reject(new Error(nls.localize(3, null, themeLocation.toString())));
                }
            }
            const semanticTokenColors = contentValue.semanticTokenColors;
            if (semanticTokenColors && typeof semanticTokenColors === 'object') {
                for (const key in semanticTokenColors) {
                    try {
                        const rule = readSemanticTokenRule(key, semanticTokenColors[key]);
                        if (rule) {
                            result.semanticTokenRules.push(rule);
                        }
                    }
                    catch (e) {
                        return Promise.reject(new Error(nls.localize(4, null, themeLocation.toString())));
                    }
                }
            }
        }
        else {
            return _loadSyntaxTokens(extensionResourceLoaderService, themeLocation, result);
        }
    }
    function _loadSyntaxTokens(extensionResourceLoaderService, themeLocation, result) {
        return extensionResourceLoaderService.readExtensionResource(themeLocation).then(content => {
            try {
                const contentValue = (0, plistParser_1.$8yb)(content);
                const settings = contentValue.settings;
                if (!Array.isArray(settings)) {
                    return Promise.reject(new Error(nls.localize(5, null)));
                }
                (0, themeCompatibility_1.$7yb)(settings, result);
                return Promise.resolve(null);
            }
            catch (e) {
                return Promise.reject(new Error(nls.localize(6, null, e.message)));
            }
        }, error => {
            return Promise.reject(new Error(nls.localize(7, null, themeLocation.toString(), error.message)));
        });
    }
    const defaultThemeColors = {
        'light': [
            { scope: 'token.info-token', settings: { foreground: '#316bcd' } },
            { scope: 'token.warn-token', settings: { foreground: '#cd9731' } },
            { scope: 'token.error-token', settings: { foreground: '#cd3131' } },
            { scope: 'token.debug-token', settings: { foreground: '#800080' } }
        ],
        'dark': [
            { scope: 'token.info-token', settings: { foreground: '#6796e6' } },
            { scope: 'token.warn-token', settings: { foreground: '#cd9731' } },
            { scope: 'token.error-token', settings: { foreground: '#f44747' } },
            { scope: 'token.debug-token', settings: { foreground: '#b267e6' } }
        ],
        'hcLight': [
            { scope: 'token.info-token', settings: { foreground: '#316bcd' } },
            { scope: 'token.warn-token', settings: { foreground: '#cd9731' } },
            { scope: 'token.error-token', settings: { foreground: '#cd3131' } },
            { scope: 'token.debug-token', settings: { foreground: '#800080' } }
        ],
        'hcDark': [
            { scope: 'token.info-token', settings: { foreground: '#6796e6' } },
            { scope: 'token.warn-token', settings: { foreground: '#008000' } },
            { scope: 'token.error-token', settings: { foreground: '#FF0000' } },
            { scope: 'token.debug-token', settings: { foreground: '#b267e6' } }
        ]
    };
    const noMatch = (_scope) => -1;
    function nameMatcher(identifers, scope) {
        function findInIdents(s, lastIndent) {
            for (let i = lastIndent - 1; i >= 0; i--) {
                if (scopesAreMatching(s, identifers[i])) {
                    return i;
                }
            }
            return -1;
        }
        if (scope.length < identifers.length) {
            return -1;
        }
        let lastScopeIndex = scope.length - 1;
        let lastIdentifierIndex = findInIdents(scope[lastScopeIndex--], identifers.length);
        if (lastIdentifierIndex >= 0) {
            const score = (lastIdentifierIndex + 1) * 0x10000 + identifers[lastIdentifierIndex].length;
            while (lastScopeIndex >= 0) {
                lastIdentifierIndex = findInIdents(scope[lastScopeIndex--], lastIdentifierIndex);
                if (lastIdentifierIndex === -1) {
                    return -1;
                }
            }
            return score;
        }
        return -1;
    }
    function scopesAreMatching(thisScopeName, scopeName) {
        if (!thisScopeName) {
            return false;
        }
        if (thisScopeName === scopeName) {
            return true;
        }
        const len = scopeName.length;
        return thisScopeName.length > len && thisScopeName.substr(0, len) === scopeName && thisScopeName[len] === '.';
    }
    function getScopeMatcher(rule) {
        const ruleScope = rule.scope;
        if (!ruleScope || !rule.settings) {
            return noMatch;
        }
        const matchers = [];
        if (Array.isArray(ruleScope)) {
            for (const rs of ruleScope) {
                (0, textMateScopeMatcher_1.$9yb)(rs, nameMatcher, matchers);
            }
        }
        else {
            (0, textMateScopeMatcher_1.$9yb)(ruleScope, nameMatcher, matchers);
        }
        if (matchers.length === 0) {
            return noMatch;
        }
        return (scope) => {
            let max = matchers[0].matcher(scope);
            for (let i = 1; i < matchers.length; i++) {
                max = Math.max(max, matchers[i].matcher(scope));
            }
            return max;
        };
    }
    function readSemanticTokenRule(selectorString, settings) {
        const selector = tokenClassificationRegistry.parseTokenSelector(selectorString);
        let style;
        if (typeof settings === 'string') {
            style = tokenClassificationRegistry_1.$W$.fromSettings(settings, undefined);
        }
        else if (isSemanticTokenColorizationSetting(settings)) {
            style = tokenClassificationRegistry_1.$W$.fromSettings(settings.foreground, settings.fontStyle, settings.bold, settings.underline, settings.strikethrough, settings.italic);
        }
        if (style) {
            return { selector, style };
        }
        return undefined;
    }
    function isSemanticTokenColorizationSetting(style) {
        return style && (types.$jf(style.foreground) || types.$jf(style.fontStyle) || types.$pf(style.italic)
            || types.$pf(style.underline) || types.$pf(style.strikethrough) || types.$pf(style.bold));
    }
    class TokenColorIndex {
        constructor() {
            this.b = 0;
            this.c = [];
            this.g = Object.create(null);
        }
        add(color) {
            color = normalizeColor(color);
            if (color === undefined) {
                return 0;
            }
            let value = this.g[color];
            if (value) {
                return value;
            }
            value = ++this.b;
            this.g[color] = value;
            this.c[value] = color;
            return value;
        }
        get(color) {
            color = normalizeColor(color);
            if (color === undefined) {
                return 0;
            }
            const value = this.g[color];
            if (value) {
                return value;
            }
            console.log(`Color ${color} not in index.`);
            return 0;
        }
        asArray() {
            return this.c.slice(0);
        }
    }
    function normalizeColor(color) {
        if (!color) {
            return undefined;
        }
        if (typeof color !== 'string') {
            color = color_1.$Os.Format.CSS.formatHexA(color, true);
        }
        const len = color.length;
        if (color.charCodeAt(0) !== 35 /* CharCode.Hash */ || (len !== 4 && len !== 5 && len !== 7 && len !== 9)) {
            return undefined;
        }
        const result = [35 /* CharCode.Hash */];
        for (let i = 1; i < len; i++) {
            const upper = hexUpper(color.charCodeAt(i));
            if (!upper) {
                return undefined;
            }
            result.push(upper);
            if (len === 4 || len === 5) {
                result.push(upper);
            }
        }
        if (result.length === 9 && result[7] === 70 /* CharCode.F */ && result[8] === 70 /* CharCode.F */) {
            result.length = 7;
        }
        return String.fromCharCode(...result);
    }
    function hexUpper(charCode) {
        if (charCode >= 48 /* CharCode.Digit0 */ && charCode <= 57 /* CharCode.Digit9 */ || charCode >= 65 /* CharCode.A */ && charCode <= 70 /* CharCode.F */) {
            return charCode;
        }
        else if (charCode >= 97 /* CharCode.a */ && charCode <= 102 /* CharCode.f */) {
            return charCode - 97 /* CharCode.a */ + 65 /* CharCode.A */;
        }
        return 0;
    }
});
//# sourceMappingURL=colorThemeData.js.map