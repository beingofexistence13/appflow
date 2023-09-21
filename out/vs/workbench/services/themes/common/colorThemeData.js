/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/json", "vs/base/common/color", "vs/workbench/services/themes/common/workbenchThemeService", "vs/workbench/services/themes/common/themeCompatibility", "vs/nls", "vs/base/common/types", "vs/base/common/resources", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/registry/common/platform", "vs/base/common/jsonErrorMessages", "vs/workbench/services/themes/common/plistParser", "vs/platform/theme/common/tokenClassificationRegistry", "vs/workbench/services/themes/common/textMateScopeMatcher", "vs/platform/theme/common/theme"], function (require, exports, path_1, Json, color_1, workbenchThemeService_1, themeCompatibility_1, nls, types, resources, colorRegistry_1, themeService_1, platform_1, jsonErrorMessages_1, plistParser_1, tokenClassificationRegistry_1, textMateScopeMatcher_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ColorThemeData = void 0;
    const colorRegistry = platform_1.Registry.as(colorRegistry_1.Extensions.ColorContribution);
    const tokenClassificationRegistry = (0, tokenClassificationRegistry_1.getTokenClassificationRegistry)();
    const tokenGroupToScopesMap = {
        comments: ['comment', 'punctuation.definition.comment'],
        strings: ['string', 'meta.embedded.assembly'],
        keywords: ['keyword - keyword.operator', 'keyword.control', 'storage', 'storage.type'],
        numbers: ['constant.numeric'],
        types: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'],
        functions: ['entity.name.function', 'support.function'],
        variables: ['variable', 'entity.name.variable']
    };
    class ColorThemeData {
        static { this.STORAGE_KEY = 'colorThemeData'; }
        constructor(id, label, settingsId) {
            this.themeTokenColors = [];
            this.customTokenColors = [];
            this.colorMap = {};
            this.customColorMap = {};
            this.semanticTokenRules = [];
            this.customSemanticTokenRules = [];
            this.textMateThemingRules = undefined; // created on demand
            this.tokenColorIndex = undefined; // created on demand
            this.id = id;
            this.label = label;
            this.settingsId = settingsId;
            this.isLoaded = false;
        }
        get semanticHighlighting() {
            if (this.customSemanticHighlighting !== undefined) {
                return this.customSemanticHighlighting;
            }
            if (this.customSemanticHighlightingDeprecated !== undefined) {
                return this.customSemanticHighlightingDeprecated;
            }
            return !!this.themeSemanticHighlighting;
        }
        get tokenColors() {
            if (!this.textMateThemingRules) {
                const result = [];
                // the default rule (scope empty) is always the first rule. Ignore all other default rules.
                const foreground = this.getColor(colorRegistry_1.editorForeground) || this.getDefault(colorRegistry_1.editorForeground);
                const background = this.getColor(colorRegistry_1.editorBackground) || this.getDefault(colorRegistry_1.editorBackground);
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
                this.themeTokenColors.forEach(addRule);
                // Add the custom colors after the theme colors
                // so that they will override them
                this.customTokenColors.forEach(addRule);
                if (!hasDefaultTokens) {
                    defaultThemeColors[this.type].forEach(addRule);
                }
                this.textMateThemingRules = result;
            }
            return this.textMateThemingRules;
        }
        getColor(colorId, useDefault) {
            let color = this.customColorMap[colorId];
            if (color) {
                return color;
            }
            color = this.colorMap[colorId];
            if (useDefault !== false && types.isUndefined(color)) {
                color = this.getDefault(colorId);
            }
            return color;
        }
        getTokenStyle(type, modifiers, language, useDefault = true, definitions = {}) {
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
            this.semanticTokenRules.forEach(_processSemanticTokenRule);
            this.customSemanticTokenRules.forEach(_processSemanticTokenRule);
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
            return tokenClassificationRegistry_1.TokenStyle.fromData(result);
        }
        /**
         * @param tokenStyleValue Resolve a tokenStyleValue in the context of a theme
         */
        resolveTokenStyleValue(tokenStyleValue) {
            if (tokenStyleValue === undefined) {
                return undefined;
            }
            else if (typeof tokenStyleValue === 'string') {
                const { type, modifiers, language } = (0, tokenClassificationRegistry_1.parseClassifierString)(tokenStyleValue, '');
                return this.getTokenStyle(type, modifiers, language);
            }
            else if (typeof tokenStyleValue === 'object') {
                return tokenStyleValue;
            }
            return undefined;
        }
        getTokenColorIndex() {
            // collect all colors that tokens can have
            if (!this.tokenColorIndex) {
                const index = new TokenColorIndex();
                this.tokenColors.forEach(rule => {
                    index.add(rule.settings.foreground);
                    index.add(rule.settings.background);
                });
                this.semanticTokenRules.forEach(r => index.add(r.style.foreground));
                tokenClassificationRegistry.getTokenStylingDefaultRules().forEach(r => {
                    const defaultColor = r.defaults[this.type];
                    if (defaultColor && typeof defaultColor === 'object') {
                        index.add(defaultColor.foreground);
                    }
                });
                this.customSemanticTokenRules.forEach(r => index.add(r.style.foreground));
                this.tokenColorIndex = index;
            }
            return this.tokenColorIndex;
        }
        get tokenColorMap() {
            return this.getTokenColorIndex().asArray();
        }
        getTokenStyleMetadata(typeWithLanguage, modifiers, defaultLanguage, useDefault = true, definitions = {}) {
            const { type, language } = (0, tokenClassificationRegistry_1.parseClassifierString)(typeWithLanguage, defaultLanguage);
            const style = this.getTokenStyle(type, modifiers, language, useDefault, definitions);
            if (!style) {
                return undefined;
            }
            return {
                foreground: this.getTokenColorIndex().get(style.foreground),
                bold: style.bold,
                underline: style.underline,
                strikethrough: style.strikethrough,
                italic: style.italic,
            };
        }
        getTokenStylingRuleScope(rule) {
            if (this.customSemanticTokenRules.indexOf(rule) !== -1) {
                return 'setting';
            }
            if (this.semanticTokenRules.indexOf(rule) !== -1) {
                return 'theme';
            }
            return undefined;
        }
        getDefault(colorId) {
            return colorRegistry.resolveDefaultColor(colorId, this);
        }
        resolveScopes(scopes, definitions) {
            if (!this.themeTokenScopeMatchers) {
                this.themeTokenScopeMatchers = this.themeTokenColors.map(getScopeMatcher);
            }
            if (!this.customTokenScopeMatchers) {
                this.customTokenScopeMatchers = this.customTokenColors.map(getScopeMatcher);
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
                            if (score >= fontStyleScore && types.isString(settings.fontStyle)) {
                                fontStyle = settings.fontStyle;
                                fontStyleScore = score;
                                fontStyleThemingRule = themingRule;
                            }
                        }
                    }
                }
                findTokenStyleForScopeInScopes(this.themeTokenScopeMatchers, this.themeTokenColors);
                findTokenStyleForScopeInScopes(this.customTokenScopeMatchers, this.customTokenColors);
                if (foreground !== undefined || fontStyle !== undefined) {
                    if (definitions) {
                        definitions.foreground = foregroundThemingRule;
                        definitions.bold = definitions.italic = definitions.underline = definitions.strikethrough = fontStyleThemingRule;
                        definitions.scope = scope;
                    }
                    return tokenClassificationRegistry_1.TokenStyle.fromSettings(foreground, fontStyle);
                }
            }
            return undefined;
        }
        defines(colorId) {
            return this.customColorMap.hasOwnProperty(colorId) || this.colorMap.hasOwnProperty(colorId);
        }
        setCustomizations(settings) {
            this.setCustomColors(settings.colorCustomizations);
            this.setCustomTokenColors(settings.tokenColorCustomizations);
            this.setCustomSemanticTokenColors(settings.semanticTokenColorCustomizations);
        }
        setCustomColors(colors) {
            this.customColorMap = {};
            this.overwriteCustomColors(colors);
            const themeSpecificColors = this.getThemeSpecificColors(colors);
            if (types.isObject(themeSpecificColors)) {
                this.overwriteCustomColors(themeSpecificColors);
            }
            this.tokenColorIndex = undefined;
            this.textMateThemingRules = undefined;
            this.customTokenScopeMatchers = undefined;
        }
        overwriteCustomColors(colors) {
            for (const id in colors) {
                const colorVal = colors[id];
                if (typeof colorVal === 'string') {
                    this.customColorMap[id] = color_1.Color.fromHex(colorVal);
                }
            }
        }
        setCustomTokenColors(customTokenColors) {
            this.customTokenColors = [];
            this.customSemanticHighlightingDeprecated = undefined;
            // first add the non-theme specific settings
            this.addCustomTokenColors(customTokenColors);
            // append theme specific settings. Last rules will win.
            const themeSpecificTokenColors = this.getThemeSpecificColors(customTokenColors);
            if (types.isObject(themeSpecificTokenColors)) {
                this.addCustomTokenColors(themeSpecificTokenColors);
            }
            this.tokenColorIndex = undefined;
            this.textMateThemingRules = undefined;
            this.customTokenScopeMatchers = undefined;
        }
        setCustomSemanticTokenColors(semanticTokenColors) {
            this.customSemanticTokenRules = [];
            this.customSemanticHighlighting = undefined;
            if (semanticTokenColors) {
                this.customSemanticHighlighting = semanticTokenColors.enabled;
                if (semanticTokenColors.rules) {
                    this.readSemanticTokenRules(semanticTokenColors.rules);
                }
                const themeSpecificColors = this.getThemeSpecificColors(semanticTokenColors);
                if (types.isObject(themeSpecificColors)) {
                    if (themeSpecificColors.enabled !== undefined) {
                        this.customSemanticHighlighting = themeSpecificColors.enabled;
                    }
                    if (themeSpecificColors.rules) {
                        this.readSemanticTokenRules(themeSpecificColors.rules);
                    }
                }
            }
            this.tokenColorIndex = undefined;
            this.textMateThemingRules = undefined;
        }
        isThemeScope(key) {
            return key.charAt(0) === workbenchThemeService_1.THEME_SCOPE_OPEN_PAREN && key.charAt(key.length - 1) === workbenchThemeService_1.THEME_SCOPE_CLOSE_PAREN;
        }
        isThemeScopeMatch(themeId) {
            const themeIdFirstChar = themeId.charAt(0);
            const themeIdLastChar = themeId.charAt(themeId.length - 1);
            const themeIdPrefix = themeId.slice(0, -1);
            const themeIdInfix = themeId.slice(1, -1);
            const themeIdSuffix = themeId.slice(1);
            return themeId === this.settingsId
                || (this.settingsId.includes(themeIdInfix) && themeIdFirstChar === workbenchThemeService_1.THEME_SCOPE_WILDCARD && themeIdLastChar === workbenchThemeService_1.THEME_SCOPE_WILDCARD)
                || (this.settingsId.startsWith(themeIdPrefix) && themeIdLastChar === workbenchThemeService_1.THEME_SCOPE_WILDCARD)
                || (this.settingsId.endsWith(themeIdSuffix) && themeIdFirstChar === workbenchThemeService_1.THEME_SCOPE_WILDCARD);
        }
        getThemeSpecificColors(colors) {
            let themeSpecificColors;
            for (const key in colors) {
                const scopedColors = colors[key];
                if (this.isThemeScope(key) && scopedColors instanceof Object && !Array.isArray(scopedColors)) {
                    const themeScopeList = key.match(workbenchThemeService_1.themeScopeRegex) || [];
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
        readSemanticTokenRules(tokenStylingRuleSection) {
            for (const key in tokenStylingRuleSection) {
                if (!this.isThemeScope(key)) { // still do this test until experimental settings are gone
                    try {
                        const rule = readSemanticTokenRule(key, tokenStylingRuleSection[key]);
                        if (rule) {
                            this.customSemanticTokenRules.push(rule);
                        }
                    }
                    catch (e) {
                        // invalid selector, ignore
                    }
                }
            }
        }
        addCustomTokenColors(customTokenColors) {
            // Put the general customizations such as comments, strings, etc. first so that
            // they can be overridden by specific customizations like "string.interpolated"
            for (const tokenGroup in tokenGroupToScopesMap) {
                const group = tokenGroup; // TS doesn't type 'tokenGroup' properly
                const value = customTokenColors[group];
                if (value) {
                    const settings = typeof value === 'string' ? { foreground: value } : value;
                    const scopes = tokenGroupToScopesMap[group];
                    for (const scope of scopes) {
                        this.customTokenColors.push({ scope, settings });
                    }
                }
            }
            // specific customizations
            if (Array.isArray(customTokenColors.textMateRules)) {
                for (const rule of customTokenColors.textMateRules) {
                    if (rule.scope && rule.settings) {
                        this.customTokenColors.push(rule);
                    }
                }
            }
            if (customTokenColors.semanticHighlighting !== undefined) {
                this.customSemanticHighlightingDeprecated = customTokenColors.semanticHighlighting;
            }
        }
        ensureLoaded(extensionResourceLoaderService) {
            return !this.isLoaded ? this.load(extensionResourceLoaderService) : Promise.resolve(undefined);
        }
        reload(extensionResourceLoaderService) {
            return this.load(extensionResourceLoaderService);
        }
        load(extensionResourceLoaderService) {
            if (!this.location) {
                return Promise.resolve(undefined);
            }
            this.themeTokenColors = [];
            this.clearCaches();
            const result = {
                colors: {},
                textMateRules: [],
                semanticTokenRules: [],
                semanticHighlighting: false
            };
            return _loadColorTheme(extensionResourceLoaderService, this.location, result).then(_ => {
                this.isLoaded = true;
                this.semanticTokenRules = result.semanticTokenRules;
                this.colorMap = result.colors;
                this.themeTokenColors = result.textMateRules;
                this.themeSemanticHighlighting = result.semanticHighlighting;
            });
        }
        clearCaches() {
            this.tokenColorIndex = undefined;
            this.textMateThemingRules = undefined;
            this.themeTokenScopeMatchers = undefined;
            this.customTokenScopeMatchers = undefined;
        }
        toStorage(storageService) {
            const colorMapData = {};
            for (const key in this.colorMap) {
                colorMapData[key] = color_1.Color.Format.CSS.formatHexA(this.colorMap[key], true);
            }
            // no need to persist custom colors, they will be taken from the settings
            const value = JSON.stringify({
                id: this.id,
                label: this.label,
                settingsId: this.settingsId,
                themeTokenColors: this.themeTokenColors.map(tc => ({ settings: tc.settings, scope: tc.scope })),
                semanticTokenRules: this.semanticTokenRules.map(tokenClassificationRegistry_1.SemanticTokenRule.toJSONObject),
                extensionData: workbenchThemeService_1.ExtensionData.toJSONObject(this.extensionData),
                themeSemanticHighlighting: this.themeSemanticHighlighting,
                colorMap: colorMapData,
                watch: this.watch
            });
            // roam persisted color theme colors. Don't enable for icons as they contain references to fonts and images.
            storageService.store(ColorThemeData.STORAGE_KEY, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        get baseTheme() {
            return this.classNames[0];
        }
        get classNames() {
            return this.id.split(' ');
        }
        get type() {
            switch (this.baseTheme) {
                case workbenchThemeService_1.VS_LIGHT_THEME: return theme_1.ColorScheme.LIGHT;
                case workbenchThemeService_1.VS_HC_THEME: return theme_1.ColorScheme.HIGH_CONTRAST_DARK;
                case workbenchThemeService_1.VS_HC_LIGHT_THEME: return theme_1.ColorScheme.HIGH_CONTRAST_LIGHT;
                default: return theme_1.ColorScheme.DARK;
            }
        }
        // constructors
        static createUnloadedThemeForThemeType(themeType, colorMap) {
            return ColorThemeData.createUnloadedTheme((0, themeService_1.getThemeTypeSelector)(themeType), colorMap);
        }
        static createUnloadedTheme(id, colorMap) {
            const themeData = new ColorThemeData(id, '', '__' + id);
            themeData.isLoaded = false;
            themeData.themeTokenColors = [];
            themeData.watch = false;
            if (colorMap) {
                for (const id in colorMap) {
                    themeData.colorMap[id] = color_1.Color.fromHex(colorMap[id]);
                }
            }
            return themeData;
        }
        static createLoadedEmptyTheme(id, settingsId) {
            const themeData = new ColorThemeData(id, '', settingsId);
            themeData.isLoaded = true;
            themeData.themeTokenColors = [];
            themeData.watch = false;
            return themeData;
        }
        static fromStorageData(storageService) {
            const input = storageService.get(ColorThemeData.STORAGE_KEY, 0 /* StorageScope.PROFILE */);
            if (!input) {
                return undefined;
            }
            try {
                const data = JSON.parse(input);
                const theme = new ColorThemeData('', '', '');
                for (const key in data) {
                    switch (key) {
                        case 'colorMap': {
                            const colorMapData = data[key];
                            for (const id in colorMapData) {
                                theme.colorMap[id] = color_1.Color.fromHex(colorMapData[id]);
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
                                        theme.semanticTokenRules.push(rule);
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
            const label = theme.label || (0, path_1.basename)(theme.path);
            const settingsId = theme.id || label;
            const themeData = new ColorThemeData(id, label, settingsId);
            themeData.description = theme.description;
            themeData.watch = theme._watch === true;
            themeData.location = colorThemeLocation;
            themeData.extensionData = extensionData;
            themeData.isLoaded = false;
            return themeData;
        }
    }
    exports.ColorThemeData = ColorThemeData;
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
        if (resources.extname(themeLocation) === '.json') {
            const content = await extensionResourceLoaderService.readExtensionResource(themeLocation);
            const errors = [];
            const contentValue = Json.parse(content, errors);
            if (errors.length > 0) {
                return Promise.reject(new Error(nls.localize('error.cannotparsejson', "Problems parsing JSON theme file: {0}", errors.map(e => (0, jsonErrorMessages_1.getParseErrorMessage)(e.error)).join(', '))));
            }
            else if (Json.getNodeType(contentValue) !== 'object') {
                return Promise.reject(new Error(nls.localize('error.invalidformat', "Invalid format for JSON theme file: Object expected.")));
            }
            if (contentValue.include) {
                await _loadColorTheme(extensionResourceLoaderService, resources.joinPath(resources.dirname(themeLocation), contentValue.include), result);
            }
            if (Array.isArray(contentValue.settings)) {
                (0, themeCompatibility_1.convertSettings)(contentValue.settings, result);
                return null;
            }
            result.semanticHighlighting = result.semanticHighlighting || contentValue.semanticHighlighting;
            const colors = contentValue.colors;
            if (colors) {
                if (typeof colors !== 'object') {
                    return Promise.reject(new Error(nls.localize({ key: 'error.invalidformat.colors', comment: ['{0} will be replaced by a path. Values in quotes should not be translated.'] }, "Problem parsing color theme file: {0}. Property 'colors' is not of type 'object'.", themeLocation.toString())));
                }
                // new JSON color themes format
                for (const colorId in colors) {
                    const colorHex = colors[colorId];
                    if (typeof colorHex === 'string') { // ignore colors tht are null
                        result.colors[colorId] = color_1.Color.fromHex(colors[colorId]);
                    }
                }
            }
            const tokenColors = contentValue.tokenColors;
            if (tokenColors) {
                if (Array.isArray(tokenColors)) {
                    result.textMateRules.push(...tokenColors);
                }
                else if (typeof tokenColors === 'string') {
                    await _loadSyntaxTokens(extensionResourceLoaderService, resources.joinPath(resources.dirname(themeLocation), tokenColors), result);
                }
                else {
                    return Promise.reject(new Error(nls.localize({ key: 'error.invalidformat.tokenColors', comment: ['{0} will be replaced by a path. Values in quotes should not be translated.'] }, "Problem parsing color theme file: {0}. Property 'tokenColors' should be either an array specifying colors or a path to a TextMate theme file", themeLocation.toString())));
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
                        return Promise.reject(new Error(nls.localize({ key: 'error.invalidformat.semanticTokenColors', comment: ['{0} will be replaced by a path. Values in quotes should not be translated.'] }, "Problem parsing color theme file: {0}. Property 'semanticTokenColors' contains a invalid selector", themeLocation.toString())));
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
                const contentValue = (0, plistParser_1.parse)(content);
                const settings = contentValue.settings;
                if (!Array.isArray(settings)) {
                    return Promise.reject(new Error(nls.localize('error.plist.invalidformat', "Problem parsing tmTheme file: {0}. 'settings' is not array.")));
                }
                (0, themeCompatibility_1.convertSettings)(settings, result);
                return Promise.resolve(null);
            }
            catch (e) {
                return Promise.reject(new Error(nls.localize('error.cannotparse', "Problems parsing tmTheme file: {0}", e.message)));
            }
        }, error => {
            return Promise.reject(new Error(nls.localize('error.cannotload', "Problems loading tmTheme file {0}: {1}", themeLocation.toString(), error.message)));
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
                (0, textMateScopeMatcher_1.createMatchers)(rs, nameMatcher, matchers);
            }
        }
        else {
            (0, textMateScopeMatcher_1.createMatchers)(ruleScope, nameMatcher, matchers);
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
            style = tokenClassificationRegistry_1.TokenStyle.fromSettings(settings, undefined);
        }
        else if (isSemanticTokenColorizationSetting(settings)) {
            style = tokenClassificationRegistry_1.TokenStyle.fromSettings(settings.foreground, settings.fontStyle, settings.bold, settings.underline, settings.strikethrough, settings.italic);
        }
        if (style) {
            return { selector, style };
        }
        return undefined;
    }
    function isSemanticTokenColorizationSetting(style) {
        return style && (types.isString(style.foreground) || types.isString(style.fontStyle) || types.isBoolean(style.italic)
            || types.isBoolean(style.underline) || types.isBoolean(style.strikethrough) || types.isBoolean(style.bold));
    }
    class TokenColorIndex {
        constructor() {
            this._lastColorId = 0;
            this._id2color = [];
            this._color2id = Object.create(null);
        }
        add(color) {
            color = normalizeColor(color);
            if (color === undefined) {
                return 0;
            }
            let value = this._color2id[color];
            if (value) {
                return value;
            }
            value = ++this._lastColorId;
            this._color2id[color] = value;
            this._id2color[value] = color;
            return value;
        }
        get(color) {
            color = normalizeColor(color);
            if (color === undefined) {
                return 0;
            }
            const value = this._color2id[color];
            if (value) {
                return value;
            }
            console.log(`Color ${color} not in index.`);
            return 0;
        }
        asArray() {
            return this._id2color.slice(0);
        }
    }
    function normalizeColor(color) {
        if (!color) {
            return undefined;
        }
        if (typeof color !== 'string') {
            color = color_1.Color.Format.CSS.formatHexA(color, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JUaGVtZURhdGEuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGhlbWVzL2NvbW1vbi9jb2xvclRoZW1lRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF3QmhHLE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFpQiwwQkFBdUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRTdGLE1BQU0sMkJBQTJCLEdBQUcsSUFBQSw0REFBOEIsR0FBRSxDQUFDO0lBRXJFLE1BQU0scUJBQXFCLEdBQUc7UUFDN0IsUUFBUSxFQUFFLENBQUMsU0FBUyxFQUFFLGdDQUFnQyxDQUFDO1FBQ3ZELE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSx3QkFBd0IsQ0FBQztRQUM3QyxRQUFRLEVBQUUsQ0FBQyw0QkFBNEIsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDO1FBQ3RGLE9BQU8sRUFBRSxDQUFDLGtCQUFrQixDQUFDO1FBQzdCLEtBQUssRUFBRSxDQUFDLGtCQUFrQixFQUFFLG1CQUFtQixFQUFFLGNBQWMsRUFBRSxlQUFlLENBQUM7UUFDakYsU0FBUyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsa0JBQWtCLENBQUM7UUFDdkQsU0FBUyxFQUFFLENBQUMsVUFBVSxFQUFFLHNCQUFzQixDQUFDO0tBQy9DLENBQUM7SUFRRixNQUFhLGNBQWM7aUJBRVYsZ0JBQVcsR0FBRyxnQkFBZ0IsQUFBbkIsQ0FBb0I7UUE2Qi9DLFlBQW9CLEVBQVUsRUFBRSxLQUFhLEVBQUUsVUFBa0I7WUFkekQscUJBQWdCLEdBQTJCLEVBQUUsQ0FBQztZQUM5QyxzQkFBaUIsR0FBMkIsRUFBRSxDQUFDO1lBQy9DLGFBQVEsR0FBYyxFQUFFLENBQUM7WUFDekIsbUJBQWMsR0FBYyxFQUFFLENBQUM7WUFFL0IsdUJBQWtCLEdB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