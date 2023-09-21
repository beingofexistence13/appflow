/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/themes/common/themeConfiguration", "vs/base/common/types", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/services/themes/common/colorThemeSchema", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/tokenClassificationRegistry", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/common/platform"], function (require, exports, nls, types, platform_1, configurationRegistry_1, colorThemeSchema_1, colorRegistry_1, tokenClassificationRegistry_1, workbenchThemeService_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ezb = exports.$dzb = exports.$czb = exports.$bzb = void 0;
    // Configuration: Themes
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    const colorThemeSettingEnum = [];
    const colorThemeSettingEnumItemLabels = [];
    const colorThemeSettingEnumDescriptions = [];
    function formatSettingAsLink(str) {
        return `\`#${str}#\``;
    }
    const colorThemeSettingSchema = {
        type: 'string',
        description: nls.localize(0, null),
        default: platform_2.$o ? workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT : workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK,
        enum: colorThemeSettingEnum,
        enumDescriptions: colorThemeSettingEnumDescriptions,
        enumItemLabels: colorThemeSettingEnumItemLabels,
        errorMessage: nls.localize(1, null),
    };
    const preferredDarkThemeSettingSchema = {
        type: 'string',
        markdownDescription: nls.localize(2, null, formatSettingAsLink(workbenchThemeService_1.ThemeSettings.DETECT_COLOR_SCHEME)),
        default: workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK,
        enum: colorThemeSettingEnum,
        enumDescriptions: colorThemeSettingEnumDescriptions,
        enumItemLabels: colorThemeSettingEnumItemLabels,
        errorMessage: nls.localize(3, null),
    };
    const preferredLightThemeSettingSchema = {
        type: 'string',
        markdownDescription: nls.localize(4, null, formatSettingAsLink(workbenchThemeService_1.ThemeSettings.DETECT_COLOR_SCHEME)),
        default: workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT,
        enum: colorThemeSettingEnum,
        enumDescriptions: colorThemeSettingEnumDescriptions,
        enumItemLabels: colorThemeSettingEnumItemLabels,
        errorMessage: nls.localize(5, null),
    };
    const preferredHCDarkThemeSettingSchema = {
        type: 'string',
        markdownDescription: nls.localize(6, null, formatSettingAsLink(workbenchThemeService_1.ThemeSettings.DETECT_HC)),
        default: workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_HC_DARK,
        enum: colorThemeSettingEnum,
        enumDescriptions: colorThemeSettingEnumDescriptions,
        enumItemLabels: colorThemeSettingEnumItemLabels,
        errorMessage: nls.localize(7, null),
    };
    const preferredHCLightThemeSettingSchema = {
        type: 'string',
        markdownDescription: nls.localize(8, null, formatSettingAsLink(workbenchThemeService_1.ThemeSettings.DETECT_HC)),
        default: workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_HC_LIGHT,
        enum: colorThemeSettingEnum,
        enumDescriptions: colorThemeSettingEnumDescriptions,
        enumItemLabels: colorThemeSettingEnumItemLabels,
        errorMessage: nls.localize(9, null),
    };
    const detectColorSchemeSettingSchema = {
        type: 'boolean',
        markdownDescription: nls.localize(10, null, formatSettingAsLink(workbenchThemeService_1.ThemeSettings.PREFERRED_DARK_THEME), formatSettingAsLink(workbenchThemeService_1.ThemeSettings.PREFERRED_LIGHT_THEME)),
        default: false
    };
    const colorCustomizationsSchema = {
        type: 'object',
        description: nls.localize(11, null),
        allOf: [{ $ref: colorRegistry_1.$6y }],
        default: {},
        defaultSnippets: [{
                body: {}
            }]
    };
    const fileIconThemeSettingSchema = {
        type: ['string', 'null'],
        default: workbenchThemeService_1.ThemeSettingDefaults.FILE_ICON_THEME,
        description: nls.localize(12, null),
        enum: [null],
        enumItemLabels: [nls.localize(13, null)],
        enumDescriptions: [nls.localize(14, null)],
        errorMessage: nls.localize(15, null)
    };
    const productIconThemeSettingSchema = {
        type: ['string', 'null'],
        default: workbenchThemeService_1.ThemeSettingDefaults.PRODUCT_ICON_THEME,
        description: nls.localize(16, null),
        enum: [workbenchThemeService_1.ThemeSettingDefaults.PRODUCT_ICON_THEME],
        enumItemLabels: [nls.localize(17, null)],
        enumDescriptions: [nls.localize(18, null)],
        errorMessage: nls.localize(19, null)
    };
    const detectHCSchemeSettingSchema = {
        type: 'boolean',
        default: true,
        markdownDescription: nls.localize(20, null, formatSettingAsLink(workbenchThemeService_1.ThemeSettings.PREFERRED_HC_DARK_THEME), formatSettingAsLink(workbenchThemeService_1.ThemeSettings.PREFERRED_HC_LIGHT_THEME)),
        scope: 1 /* ConfigurationScope.APPLICATION */
    };
    const themeSettingsConfiguration = {
        id: 'workbench',
        order: 7.1,
        type: 'object',
        properties: {
            [workbenchThemeService_1.ThemeSettings.COLOR_THEME]: colorThemeSettingSchema,
            [workbenchThemeService_1.ThemeSettings.PREFERRED_DARK_THEME]: preferredDarkThemeSettingSchema,
            [workbenchThemeService_1.ThemeSettings.PREFERRED_LIGHT_THEME]: preferredLightThemeSettingSchema,
            [workbenchThemeService_1.ThemeSettings.PREFERRED_HC_DARK_THEME]: preferredHCDarkThemeSettingSchema,
            [workbenchThemeService_1.ThemeSettings.PREFERRED_HC_LIGHT_THEME]: preferredHCLightThemeSettingSchema,
            [workbenchThemeService_1.ThemeSettings.FILE_ICON_THEME]: fileIconThemeSettingSchema,
            [workbenchThemeService_1.ThemeSettings.COLOR_CUSTOMIZATIONS]: colorCustomizationsSchema,
            [workbenchThemeService_1.ThemeSettings.PRODUCT_ICON_THEME]: productIconThemeSettingSchema
        }
    };
    configurationRegistry.registerConfiguration(themeSettingsConfiguration);
    const themeSettingsWindowConfiguration = {
        id: 'window',
        order: 8.1,
        type: 'object',
        properties: {
            [workbenchThemeService_1.ThemeSettings.DETECT_HC]: detectHCSchemeSettingSchema,
            [workbenchThemeService_1.ThemeSettings.DETECT_COLOR_SCHEME]: detectColorSchemeSettingSchema,
        }
    };
    configurationRegistry.registerConfiguration(themeSettingsWindowConfiguration);
    function tokenGroupSettings(description) {
        return {
            description,
            $ref: colorThemeSchema_1.$$yb
        };
    }
    const themeSpecificSettingKey = '^\\[[^\\]]*(\\]\\s*\\[[^\\]]*)*\\]$';
    const tokenColorSchema = {
        type: 'object',
        properties: {
            comments: tokenGroupSettings(nls.localize(21, null)),
            strings: tokenGroupSettings(nls.localize(22, null)),
            keywords: tokenGroupSettings(nls.localize(23, null)),
            numbers: tokenGroupSettings(nls.localize(24, null)),
            types: tokenGroupSettings(nls.localize(25, null)),
            functions: tokenGroupSettings(nls.localize(26, null)),
            variables: tokenGroupSettings(nls.localize(27, null)),
            textMateRules: {
                description: nls.localize(28, null),
                $ref: colorThemeSchema_1.$0yb
            },
            semanticHighlighting: {
                description: nls.localize(29, null),
                deprecationMessage: nls.localize(30, null),
                markdownDeprecationMessage: nls.localize(31, null, formatSettingAsLink('editor.semanticTokenColorCustomizations')),
                type: 'boolean'
            }
        },
        additionalProperties: false
    };
    const tokenColorCustomizationSchema = {
        description: nls.localize(32, null),
        default: {},
        allOf: [{ ...tokenColorSchema, patternProperties: { '^\\[': {} } }]
    };
    const semanticTokenColorSchema = {
        type: 'object',
        properties: {
            enabled: {
                type: 'boolean',
                description: nls.localize(33, null),
                suggestSortText: '0_enabled'
            },
            rules: {
                $ref: tokenClassificationRegistry_1.$Z$,
                description: nls.localize(34, null),
                suggestSortText: '0_rules'
            }
        },
        additionalProperties: false
    };
    const semanticTokenColorCustomizationSchema = {
        description: nls.localize(35, null),
        default: {},
        allOf: [{ ...semanticTokenColorSchema, patternProperties: { '^\\[': {} } }]
    };
    const tokenColorCustomizationConfiguration = {
        id: 'editor',
        order: 7.2,
        type: 'object',
        properties: {
            [workbenchThemeService_1.ThemeSettings.TOKEN_COLOR_CUSTOMIZATIONS]: tokenColorCustomizationSchema,
            [workbenchThemeService_1.ThemeSettings.SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS]: semanticTokenColorCustomizationSchema
        }
    };
    configurationRegistry.registerConfiguration(tokenColorCustomizationConfiguration);
    function $bzb(themes) {
        // updates enum for the 'workbench.colorTheme` setting
        themes.sort((a, b) => a.label.localeCompare(b.label));
        colorThemeSettingEnum.splice(0, colorThemeSettingEnum.length, ...themes.map(t => t.settingsId));
        colorThemeSettingEnumDescriptions.splice(0, colorThemeSettingEnumDescriptions.length, ...themes.map(t => t.description || ''));
        colorThemeSettingEnumItemLabels.splice(0, colorThemeSettingEnumItemLabels.length, ...themes.map(t => t.label || ''));
        const themeSpecificWorkbenchColors = { properties: {} };
        const themeSpecificTokenColors = { properties: {} };
        const themeSpecificSemanticTokenColors = { properties: {} };
        const workbenchColors = { $ref: colorRegistry_1.$6y, additionalProperties: false };
        const tokenColors = { properties: tokenColorSchema.properties, additionalProperties: false };
        for (const t of themes) {
            // add theme specific color customization ("[Abyss]":{ ... })
            const themeId = `[${t.settingsId}]`;
            themeSpecificWorkbenchColors.properties[themeId] = workbenchColors;
            themeSpecificTokenColors.properties[themeId] = tokenColors;
            themeSpecificSemanticTokenColors.properties[themeId] = semanticTokenColorSchema;
        }
        themeSpecificWorkbenchColors.patternProperties = { [themeSpecificSettingKey]: workbenchColors };
        themeSpecificTokenColors.patternProperties = { [themeSpecificSettingKey]: tokenColors };
        themeSpecificSemanticTokenColors.patternProperties = { [themeSpecificSettingKey]: semanticTokenColorSchema };
        colorCustomizationsSchema.allOf[1] = themeSpecificWorkbenchColors;
        tokenColorCustomizationSchema.allOf[1] = themeSpecificTokenColors;
        semanticTokenColorCustomizationSchema.allOf[1] = themeSpecificSemanticTokenColors;
        configurationRegistry.notifyConfigurationSchemaUpdated(themeSettingsConfiguration, tokenColorCustomizationConfiguration);
    }
    exports.$bzb = $bzb;
    function $czb(themes) {
        fileIconThemeSettingSchema.enum.splice(1, Number.MAX_VALUE, ...themes.map(t => t.settingsId));
        fileIconThemeSettingSchema.enumItemLabels.splice(1, Number.MAX_VALUE, ...themes.map(t => t.label));
        fileIconThemeSettingSchema.enumDescriptions.splice(1, Number.MAX_VALUE, ...themes.map(t => t.description || ''));
        configurationRegistry.notifyConfigurationSchemaUpdated(themeSettingsConfiguration);
    }
    exports.$czb = $czb;
    function $dzb(themes) {
        productIconThemeSettingSchema.enum.splice(1, Number.MAX_VALUE, ...themes.map(t => t.settingsId));
        productIconThemeSettingSchema.enumItemLabels.splice(1, Number.MAX_VALUE, ...themes.map(t => t.label));
        productIconThemeSettingSchema.enumDescriptions.splice(1, Number.MAX_VALUE, ...themes.map(t => t.description || ''));
        configurationRegistry.notifyConfigurationSchemaUpdated(themeSettingsConfiguration);
    }
    exports.$dzb = $dzb;
    class $ezb {
        constructor(c) {
            this.c = c;
        }
        get colorTheme() {
            return this.c.getValue(workbenchThemeService_1.ThemeSettings.COLOR_THEME);
        }
        get fileIconTheme() {
            return this.c.getValue(workbenchThemeService_1.ThemeSettings.FILE_ICON_THEME);
        }
        get productIconTheme() {
            return this.c.getValue(workbenchThemeService_1.ThemeSettings.PRODUCT_ICON_THEME);
        }
        get colorCustomizations() {
            return this.c.getValue(workbenchThemeService_1.ThemeSettings.COLOR_CUSTOMIZATIONS) || {};
        }
        get tokenColorCustomizations() {
            return this.c.getValue(workbenchThemeService_1.ThemeSettings.TOKEN_COLOR_CUSTOMIZATIONS) || {};
        }
        get semanticTokenColorCustomizations() {
            return this.c.getValue(workbenchThemeService_1.ThemeSettings.SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS);
        }
        async setColorTheme(theme, settingsTarget) {
            await this.d(workbenchThemeService_1.ThemeSettings.COLOR_THEME, theme.settingsId, settingsTarget);
            return theme;
        }
        async setFileIconTheme(theme, settingsTarget) {
            await this.d(workbenchThemeService_1.ThemeSettings.FILE_ICON_THEME, theme.settingsId, settingsTarget);
            return theme;
        }
        async setProductIconTheme(theme, settingsTarget) {
            await this.d(workbenchThemeService_1.ThemeSettings.PRODUCT_ICON_THEME, theme.settingsId, settingsTarget);
            return theme;
        }
        isDefaultColorTheme() {
            const settings = this.c.inspect(workbenchThemeService_1.ThemeSettings.COLOR_THEME);
            return settings && settings.default?.value === settings.value;
        }
        findAutoConfigurationTarget(key) {
            const settings = this.c.inspect(key);
            if (!types.$qf(settings.workspaceFolderValue)) {
                return 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
            }
            else if (!types.$qf(settings.workspaceValue)) {
                return 5 /* ConfigurationTarget.WORKSPACE */;
            }
            else if (!types.$qf(settings.userRemote)) {
                return 4 /* ConfigurationTarget.USER_REMOTE */;
            }
            return 2 /* ConfigurationTarget.USER */;
        }
        async d(key, value, settingsTarget) {
            if (settingsTarget === undefined || settingsTarget === 'preview') {
                return;
            }
            const settings = this.c.inspect(key);
            if (settingsTarget === 'auto') {
                return this.c.updateValue(key, value);
            }
            if (settingsTarget === 2 /* ConfigurationTarget.USER */) {
                if (value === settings.userValue) {
                    return Promise.resolve(undefined); // nothing to do
                }
                else if (value === settings.defaultValue) {
                    if (types.$qf(settings.userValue)) {
                        return Promise.resolve(undefined); // nothing to do
                    }
                    value = undefined; // remove configuration from user settings
                }
            }
            else if (settingsTarget === 5 /* ConfigurationTarget.WORKSPACE */ || settingsTarget === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */ || settingsTarget === 4 /* ConfigurationTarget.USER_REMOTE */) {
                if (value === settings.value) {
                    return Promise.resolve(undefined); // nothing to do
                }
            }
            return this.c.updateValue(key, value, settingsTarget);
        }
    }
    exports.$ezb = $ezb;
});
//# sourceMappingURL=themeConfiguration.js.map