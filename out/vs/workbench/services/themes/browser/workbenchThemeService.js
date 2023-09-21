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
define(["require", "exports", "vs/nls", "vs/base/common/types", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/themes/common/workbenchThemeService", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/registry/common/platform", "vs/base/common/errors", "vs/platform/configuration/common/configuration", "vs/workbench/services/themes/common/colorThemeData", "vs/platform/theme/common/themeService", "vs/base/common/event", "vs/workbench/services/themes/common/fileIconThemeSchema", "vs/base/common/lifecycle", "vs/workbench/services/themes/browser/fileIconThemeData", "vs/base/browser/dom", "vs/workbench/services/environment/browser/environmentService", "vs/platform/files/common/files", "vs/base/common/resources", "vs/workbench/services/themes/common/colorThemeSchema", "vs/platform/instantiation/common/extensions", "vs/platform/remote/common/remoteHosts", "vs/workbench/services/layout/browser/layoutService", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/workbench/services/themes/common/themeExtensionPoints", "vs/workbench/services/themes/common/themeConfiguration", "vs/workbench/services/themes/browser/productIconThemeData", "vs/workbench/services/themes/common/productIconThemeSchema", "vs/platform/log/common/log", "vs/base/common/platform", "vs/platform/theme/common/theme", "vs/workbench/services/themes/common/hostColorSchemeService", "vs/base/common/async", "vs/workbench/services/userData/browser/userDataInit", "vs/platform/theme/browser/iconsStyleSheet", "vs/platform/theme/common/colorRegistry", "vs/editor/common/languages/language"], function (require, exports, nls, types, extensions_1, workbenchThemeService_1, storage_1, telemetry_1, platform_1, errors, configuration_1, colorThemeData_1, themeService_1, event_1, fileIconThemeSchema_1, lifecycle_1, fileIconThemeData_1, dom_1, environmentService_1, files_1, resources, colorThemeSchema_1, extensions_2, remoteHosts_1, layoutService_1, extensionResourceLoader_1, themeExtensionPoints_1, themeConfiguration_1, productIconThemeData_1, productIconThemeSchema_1, log_1, platform_2, theme_1, hostColorSchemeService_1, async_1, userDataInit_1, iconsStyleSheet_1, colorRegistry_1, language_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchThemeService = void 0;
    // implementation
    const PERSISTED_OS_COLOR_SCHEME = 'osColorScheme';
    const PERSISTED_OS_COLOR_SCHEME_SCOPE = -1 /* StorageScope.APPLICATION */; // the OS scheme depends on settings in the OS
    const defaultThemeExtensionId = 'vscode-theme-defaults';
    const DEFAULT_FILE_ICON_THEME_ID = 'vscode.vscode-theme-seti-vs-seti';
    const fileIconsEnabledClass = 'file-icons-enabled';
    const colorThemeRulesClassName = 'contributedColorTheme';
    const fileIconThemeRulesClassName = 'contributedFileIconTheme';
    const productIconThemeRulesClassName = 'contributedProductIconTheme';
    const themingRegistry = platform_1.Registry.as(themeService_1.Extensions.ThemingContribution);
    function validateThemeId(theme) {
        // migrations
        switch (theme) {
            case workbenchThemeService_1.VS_LIGHT_THEME: return `vs ${defaultThemeExtensionId}-themes-light_vs-json`;
            case workbenchThemeService_1.VS_DARK_THEME: return `vs-dark ${defaultThemeExtensionId}-themes-dark_vs-json`;
            case workbenchThemeService_1.VS_HC_THEME: return `hc-black ${defaultThemeExtensionId}-themes-hc_black-json`;
            case workbenchThemeService_1.VS_HC_LIGHT_THEME: return `hc-light ${defaultThemeExtensionId}-themes-hc_light-json`;
        }
        return theme;
    }
    const colorThemesExtPoint = (0, themeExtensionPoints_1.registerColorThemeExtensionPoint)();
    const fileIconThemesExtPoint = (0, themeExtensionPoints_1.registerFileIconThemeExtensionPoint)();
    const productIconThemesExtPoint = (0, themeExtensionPoints_1.registerProductIconThemeExtensionPoint)();
    let WorkbenchThemeService = class WorkbenchThemeService {
        constructor(extensionService, storageService, configurationService, telemetryService, environmentService, fileService, extensionResourceLoaderService, layoutService, logService, hostColorService, userDataInitializationService, languageService) {
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.telemetryService = telemetryService;
            this.environmentService = environmentService;
            this.extensionResourceLoaderService = extensionResourceLoaderService;
            this.logService = logService;
            this.hostColorService = hostColorService;
            this.userDataInitializationService = userDataInitializationService;
            this.hasDefaultUpdated = false;
            this.themeExtensionsActivated = new Map();
            this.container = layoutService.container;
            this.settings = new themeConfiguration_1.ThemeConfiguration(configurationService);
            this.colorThemeRegistry = new themeExtensionPoints_1.ThemeRegistry(colorThemesExtPoint, colorThemeData_1.ColorThemeData.fromExtensionTheme);
            this.colorThemeWatcher = new ThemeFileWatcher(fileService, environmentService, this.reloadCurrentColorTheme.bind(this));
            this.onColorThemeChange = new event_1.Emitter({ leakWarningThreshold: 400 });
            this.currentColorTheme = colorThemeData_1.ColorThemeData.createUnloadedTheme('');
            this.colorThemeSequencer = new async_1.Sequencer();
            this.fileIconThemeWatcher = new ThemeFileWatcher(fileService, environmentService, this.reloadCurrentFileIconTheme.bind(this));
            this.fileIconThemeRegistry = new themeExtensionPoints_1.ThemeRegistry(fileIconThemesExtPoint, fileIconThemeData_1.FileIconThemeData.fromExtensionTheme, true, fileIconThemeData_1.FileIconThemeData.noIconTheme);
            this.fileIconThemeLoader = new fileIconThemeData_1.FileIconThemeLoader(extensionResourceLoaderService, languageService);
            this.onFileIconThemeChange = new event_1.Emitter({ leakWarningThreshold: 400 });
            this.currentFileIconTheme = fileIconThemeData_1.FileIconThemeData.createUnloadedTheme('');
            this.fileIconThemeSequencer = new async_1.Sequencer();
            this.productIconThemeWatcher = new ThemeFileWatcher(fileService, environmentService, this.reloadCurrentProductIconTheme.bind(this));
            this.productIconThemeRegistry = new themeExtensionPoints_1.ThemeRegistry(productIconThemesExtPoint, productIconThemeData_1.ProductIconThemeData.fromExtensionTheme, true, productIconThemeData_1.ProductIconThemeData.defaultTheme);
            this.onProductIconThemeChange = new event_1.Emitter();
            this.currentProductIconTheme = productIconThemeData_1.ProductIconThemeData.createUnloadedTheme('');
            this.productIconThemeSequencer = new async_1.Sequencer();
            // In order to avoid paint flashing for tokens, because
            // themes are loaded asynchronously, we need to initialize
            // a color theme document with good defaults until the theme is loaded
            let themeData = colorThemeData_1.ColorThemeData.fromStorageData(this.storageService);
            const colorThemeSetting = this.settings.colorTheme;
            if (themeData && colorThemeSetting !== themeData.settingsId && this.settings.isDefaultColorTheme()) {
                this.hasDefaultUpdated = themeData.settingsId === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK_OLD || themeData.settingsId === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT_OLD;
                // the web has different defaults than the desktop, therefore do not restore when the setting is the default theme and the storage doesn't match that.
                themeData = undefined;
            }
            // the preferred color scheme (high contrast, light, dark) has changed since the last start
            const preferredColorScheme = this.getPreferredColorScheme();
            const defaultColorMap = colorThemeSetting === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT ? workbenchThemeService_1.COLOR_THEME_LIGHT_INITIAL_COLORS : colorThemeSetting === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK ? workbenchThemeService_1.COLOR_THEME_DARK_INITIAL_COLORS : undefined;
            if (preferredColorScheme && themeData?.type !== preferredColorScheme && this.storageService.get(PERSISTED_OS_COLOR_SCHEME, PERSISTED_OS_COLOR_SCHEME_SCOPE) !== preferredColorScheme) {
                themeData = colorThemeData_1.ColorThemeData.createUnloadedThemeForThemeType(preferredColorScheme, undefined);
            }
            if (!themeData) {
                const initialColorTheme = environmentService.options?.initialColorTheme;
                if (initialColorTheme) {
                    themeData = colorThemeData_1.ColorThemeData.createUnloadedThemeForThemeType(initialColorTheme.themeType, initialColorTheme.colors ?? defaultColorMap);
                }
            }
            if (!themeData) {
                themeData = colorThemeData_1.ColorThemeData.createUnloadedThemeForThemeType(platform_2.isWeb ? theme_1.ColorScheme.LIGHT : theme_1.ColorScheme.DARK, defaultColorMap);
            }
            themeData.setCustomizations(this.settings);
            this.applyTheme(themeData, undefined, true);
            const fileIconData = fileIconThemeData_1.FileIconThemeData.fromStorageData(this.storageService);
            if (fileIconData) {
                this.applyAndSetFileIconTheme(fileIconData, true);
            }
            const productIconData = productIconThemeData_1.ProductIconThemeData.fromStorageData(this.storageService);
            if (productIconData) {
                this.applyAndSetProductIconTheme(productIconData, true);
            }
            extensionService.whenInstalledExtensionsRegistered().then(_ => {
                this.installConfigurationListener();
                this.installPreferredSchemeListener();
                this.installRegistryListeners();
                this.initialize().catch(errors.onUnexpectedError);
            });
            const codiconStyleSheet = (0, dom_1.createStyleSheet)();
            codiconStyleSheet.id = 'codiconStyles';
            const iconsStyleSheet = (0, iconsStyleSheet_1.getIconsStyleSheet)(this);
            function updateAll() {
                codiconStyleSheet.textContent = iconsStyleSheet.getCSS();
            }
            const delayer = new async_1.RunOnceScheduler(updateAll, 0);
            iconsStyleSheet.onDidChange(() => delayer.schedule());
            delayer.schedule();
        }
        initialize() {
            const extDevLocs = this.environmentService.extensionDevelopmentLocationURI;
            const extDevLoc = extDevLocs && extDevLocs.length === 1 ? extDevLocs[0] : undefined; // in dev mode, switch to a theme provided by the extension under dev.
            const initializeColorTheme = async () => {
                const devThemes = this.colorThemeRegistry.findThemeByExtensionLocation(extDevLoc);
                if (devThemes.length) {
                    return this.setColorTheme(devThemes[0].id, 8 /* ConfigurationTarget.MEMORY */);
                }
                const preferredColorScheme = this.getPreferredColorScheme();
                const prevScheme = this.storageService.get(PERSISTED_OS_COLOR_SCHEME, PERSISTED_OS_COLOR_SCHEME_SCOPE);
                if (preferredColorScheme !== prevScheme) {
                    this.storageService.store(PERSISTED_OS_COLOR_SCHEME, preferredColorScheme, PERSISTED_OS_COLOR_SCHEME_SCOPE, 0 /* StorageTarget.USER */);
                    if (preferredColorScheme && this.currentColorTheme.type !== preferredColorScheme) {
                        return this.applyPreferredColorTheme(preferredColorScheme);
                    }
                }
                let theme = this.colorThemeRegistry.findThemeBySettingsId(this.settings.colorTheme, undefined);
                if (!theme) {
                    // If the current theme is not available, first make sure setting sync is complete
                    await this.userDataInitializationService.whenInitializationFinished();
                    // try to get the theme again, now with a fallback to the default themes
                    const fallbackTheme = this.currentColorTheme.type === theme_1.ColorScheme.LIGHT ? workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT : workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK;
                    theme = this.colorThemeRegistry.findThemeBySettingsId(this.settings.colorTheme, fallbackTheme);
                }
                return this.setColorTheme(theme && theme.id, undefined);
            };
            const initializeFileIconTheme = async () => {
                const devThemes = this.fileIconThemeRegistry.findThemeByExtensionLocation(extDevLoc);
                if (devThemes.length) {
                    return this.setFileIconTheme(devThemes[0].id, 8 /* ConfigurationTarget.MEMORY */);
                }
                let theme = this.fileIconThemeRegistry.findThemeBySettingsId(this.settings.fileIconTheme);
                if (!theme) {
                    // If the current theme is not available, first make sure setting sync is complete
                    await this.userDataInitializationService.whenInitializationFinished();
                    theme = this.fileIconThemeRegistry.findThemeBySettingsId(this.settings.fileIconTheme);
                }
                return this.setFileIconTheme(theme ? theme.id : DEFAULT_FILE_ICON_THEME_ID, undefined);
            };
            const initializeProductIconTheme = async () => {
                const devThemes = this.productIconThemeRegistry.findThemeByExtensionLocation(extDevLoc);
                if (devThemes.length) {
                    return this.setProductIconTheme(devThemes[0].id, 8 /* ConfigurationTarget.MEMORY */);
                }
                let theme = this.productIconThemeRegistry.findThemeBySettingsId(this.settings.productIconTheme);
                if (!theme) {
                    // If the current theme is not available, first make sure setting sync is complete
                    await this.userDataInitializationService.whenInitializationFinished();
                    theme = this.productIconThemeRegistry.findThemeBySettingsId(this.settings.productIconTheme);
                }
                return this.setProductIconTheme(theme ? theme.id : productIconThemeData_1.DEFAULT_PRODUCT_ICON_THEME_ID, undefined);
            };
            return Promise.all([initializeColorTheme(), initializeFileIconTheme(), initializeProductIconTheme()]);
        }
        installConfigurationListener() {
            this.configurationService.onDidChangeConfiguration(e => {
                let lazyPreferredColorScheme = null;
                const getPreferredColorScheme = () => {
                    if (lazyPreferredColorScheme === null) {
                        lazyPreferredColorScheme = this.getPreferredColorScheme();
                    }
                    return lazyPreferredColorScheme;
                };
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.COLOR_THEME)) {
                    this.restoreColorTheme();
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.DETECT_COLOR_SCHEME) || e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.DETECT_HC)) {
                    this.handlePreferredSchemeUpdated();
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.PREFERRED_DARK_THEME) && getPreferredColorScheme() === theme_1.ColorScheme.DARK) {
                    this.applyPreferredColorTheme(theme_1.ColorScheme.DARK);
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.PREFERRED_LIGHT_THEME) && getPreferredColorScheme() === theme_1.ColorScheme.LIGHT) {
                    this.applyPreferredColorTheme(theme_1.ColorScheme.LIGHT);
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.PREFERRED_HC_DARK_THEME) && getPreferredColorScheme() === theme_1.ColorScheme.HIGH_CONTRAST_DARK) {
                    this.applyPreferredColorTheme(theme_1.ColorScheme.HIGH_CONTRAST_DARK);
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.PREFERRED_HC_LIGHT_THEME) && getPreferredColorScheme() === theme_1.ColorScheme.HIGH_CONTRAST_LIGHT) {
                    this.applyPreferredColorTheme(theme_1.ColorScheme.HIGH_CONTRAST_LIGHT);
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.FILE_ICON_THEME)) {
                    this.restoreFileIconTheme();
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.PRODUCT_ICON_THEME)) {
                    this.restoreProductIconTheme();
                }
                if (this.currentColorTheme) {
                    let hasColorChanges = false;
                    if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.COLOR_CUSTOMIZATIONS)) {
                        this.currentColorTheme.setCustomColors(this.settings.colorCustomizations);
                        hasColorChanges = true;
                    }
                    if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.TOKEN_COLOR_CUSTOMIZATIONS)) {
                        this.currentColorTheme.setCustomTokenColors(this.settings.tokenColorCustomizations);
                        hasColorChanges = true;
                    }
                    if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS)) {
                        this.currentColorTheme.setCustomSemanticTokenColors(this.settings.semanticTokenColorCustomizations);
                        hasColorChanges = true;
                    }
                    if (hasColorChanges) {
                        this.updateDynamicCSSRules(this.currentColorTheme);
                        this.onColorThemeChange.fire(this.currentColorTheme);
                    }
                }
            });
        }
        installRegistryListeners() {
            let prevColorId = undefined;
            // update settings schema setting for theme specific settings
            this.colorThemeRegistry.onDidChange(async (event) => {
                (0, themeConfiguration_1.updateColorThemeConfigurationSchemas)(event.themes);
                if (await this.restoreColorTheme()) { // checks if theme from settings exists and is set
                    // restore theme
                    if (this.currentColorTheme.settingsId === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK && !types.isUndefined(prevColorId) && await this.colorThemeRegistry.findThemeById(prevColorId)) {
                        await this.setColorTheme(prevColorId, 'auto');
                        prevColorId = undefined;
                    }
                    else if (event.added.some(t => t.settingsId === this.currentColorTheme.settingsId)) {
                        await this.reloadCurrentColorTheme();
                    }
                }
                else if (event.removed.some(t => t.settingsId === this.currentColorTheme.settingsId)) {
                    // current theme is no longer available
                    prevColorId = this.currentColorTheme.id;
                    const defaultTheme = this.colorThemeRegistry.findThemeBySettingsId(workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK);
                    await this.setColorTheme(defaultTheme, 'auto');
                }
            });
            let prevFileIconId = undefined;
            this.fileIconThemeRegistry.onDidChange(async (event) => {
                (0, themeConfiguration_1.updateFileIconThemeConfigurationSchemas)(event.themes);
                if (await this.restoreFileIconTheme()) { // checks if theme from settings exists and is set
                    // restore theme
                    if (this.currentFileIconTheme.id === DEFAULT_FILE_ICON_THEME_ID && !types.isUndefined(prevFileIconId) && this.fileIconThemeRegistry.findThemeById(prevFileIconId)) {
                        await this.setFileIconTheme(prevFileIconId, 'auto');
                        prevFileIconId = undefined;
                    }
                    else if (event.added.some(t => t.settingsId === this.currentFileIconTheme.settingsId)) {
                        await this.reloadCurrentFileIconTheme();
                    }
                }
                else if (event.removed.some(t => t.settingsId === this.currentFileIconTheme.settingsId)) {
                    // current theme is no longer available
                    prevFileIconId = this.currentFileIconTheme.id;
                    await this.setFileIconTheme(DEFAULT_FILE_ICON_THEME_ID, 'auto');
                }
            });
            let prevProductIconId = undefined;
            this.productIconThemeRegistry.onDidChange(async (event) => {
                (0, themeConfiguration_1.updateProductIconThemeConfigurationSchemas)(event.themes);
                if (await this.restoreProductIconTheme()) { // checks if theme from settings exists and is set
                    // restore theme
                    if (this.currentProductIconTheme.id === productIconThemeData_1.DEFAULT_PRODUCT_ICON_THEME_ID && !types.isUndefined(prevProductIconId) && this.productIconThemeRegistry.findThemeById(prevProductIconId)) {
                        await this.setProductIconTheme(prevProductIconId, 'auto');
                        prevProductIconId = undefined;
                    }
                    else if (event.added.some(t => t.settingsId === this.currentProductIconTheme.settingsId)) {
                        await this.reloadCurrentProductIconTheme();
                    }
                }
                else if (event.removed.some(t => t.settingsId === this.currentProductIconTheme.settingsId)) {
                    // current theme is no longer available
                    prevProductIconId = this.currentProductIconTheme.id;
                    await this.setProductIconTheme(productIconThemeData_1.DEFAULT_PRODUCT_ICON_THEME_ID, 'auto');
                }
            });
            return Promise.all([this.getColorThemes(), this.getFileIconThemes(), this.getProductIconThemes()]).then(([ct, fit, pit]) => {
                (0, themeConfiguration_1.updateColorThemeConfigurationSchemas)(ct);
                (0, themeConfiguration_1.updateFileIconThemeConfigurationSchemas)(fit);
                (0, themeConfiguration_1.updateProductIconThemeConfigurationSchemas)(pit);
            });
        }
        // preferred scheme handling
        installPreferredSchemeListener() {
            this.hostColorService.onDidChangeColorScheme(() => this.handlePreferredSchemeUpdated());
        }
        async handlePreferredSchemeUpdated() {
            const scheme = this.getPreferredColorScheme();
            const prevScheme = this.storageService.get(PERSISTED_OS_COLOR_SCHEME, PERSISTED_OS_COLOR_SCHEME_SCOPE);
            if (scheme !== prevScheme) {
                this.storageService.store(PERSISTED_OS_COLOR_SCHEME, scheme, PERSISTED_OS_COLOR_SCHEME_SCOPE, 1 /* StorageTarget.MACHINE */);
                if (scheme) {
                    if (!prevScheme) {
                        // remember the theme before scheme switching
                        this.themeSettingIdBeforeSchemeSwitch = this.settings.colorTheme;
                    }
                    return this.applyPreferredColorTheme(scheme);
                }
                else if (prevScheme && this.themeSettingIdBeforeSchemeSwitch) {
                    // reapply the theme before scheme switching
                    const theme = this.colorThemeRegistry.findThemeBySettingsId(this.themeSettingIdBeforeSchemeSwitch, undefined);
                    if (theme) {
                        this.setColorTheme(theme.id, 'auto');
                    }
                }
            }
            return undefined;
        }
        getPreferredColorScheme() {
            if (this.configurationService.getValue(workbenchThemeService_1.ThemeSettings.DETECT_HC) && this.hostColorService.highContrast) {
                return this.hostColorService.dark ? theme_1.ColorScheme.HIGH_CONTRAST_DARK : theme_1.ColorScheme.HIGH_CONTRAST_LIGHT;
            }
            if (this.configurationService.getValue(workbenchThemeService_1.ThemeSettings.DETECT_COLOR_SCHEME)) {
                return this.hostColorService.dark ? theme_1.ColorScheme.DARK : theme_1.ColorScheme.LIGHT;
            }
            return undefined;
        }
        async applyPreferredColorTheme(type) {
            let settingId;
            switch (type) {
                case theme_1.ColorScheme.LIGHT:
                    settingId = workbenchThemeService_1.ThemeSettings.PREFERRED_LIGHT_THEME;
                    break;
                case theme_1.ColorScheme.HIGH_CONTRAST_DARK:
                    settingId = workbenchThemeService_1.ThemeSettings.PREFERRED_HC_DARK_THEME;
                    break;
                case theme_1.ColorScheme.HIGH_CONTRAST_LIGHT:
                    settingId = workbenchThemeService_1.ThemeSettings.PREFERRED_HC_LIGHT_THEME;
                    break;
                default:
                    settingId = workbenchThemeService_1.ThemeSettings.PREFERRED_DARK_THEME;
            }
            const themeSettingId = this.configurationService.getValue(settingId);
            if (themeSettingId && typeof themeSettingId === 'string') {
                const theme = this.colorThemeRegistry.findThemeBySettingsId(themeSettingId, undefined);
                if (theme) {
                    const configurationTarget = this.settings.findAutoConfigurationTarget(settingId);
                    return this.setColorTheme(theme.id, configurationTarget);
                }
            }
            return null;
        }
        hasUpdatedDefaultThemes() {
            return this.hasDefaultUpdated;
        }
        getColorTheme() {
            return this.currentColorTheme;
        }
        async getColorThemes() {
            return this.colorThemeRegistry.getThemes();
        }
        async getMarketplaceColorThemes(publisher, name, version) {
            const extensionLocation = this.extensionResourceLoaderService.getExtensionGalleryResourceURL({ publisher, name, version }, 'extension');
            if (extensionLocation) {
                try {
                    const manifestContent = await this.extensionResourceLoaderService.readExtensionResource(resources.joinPath(extensionLocation, 'package.json'));
                    return this.colorThemeRegistry.getMarketplaceThemes(JSON.parse(manifestContent), extensionLocation, workbenchThemeService_1.ExtensionData.fromName(publisher, name));
                }
                catch (e) {
                    this.logService.error('Problem loading themes from marketplace', e);
                }
            }
            return [];
        }
        get onDidColorThemeChange() {
            return this.onColorThemeChange.event;
        }
        setColorTheme(themeIdOrTheme, settingsTarget) {
            return this.colorThemeSequencer.queue(async () => {
                return this.internalSetColorTheme(themeIdOrTheme, settingsTarget);
            });
        }
        async internalSetColorTheme(themeIdOrTheme, settingsTarget) {
            if (!themeIdOrTheme) {
                return null;
            }
            const themeId = types.isString(themeIdOrTheme) ? validateThemeId(themeIdOrTheme) : themeIdOrTheme.id;
            if (this.currentColorTheme.isLoaded && themeId === this.currentColorTheme.id) {
                if (settingsTarget !== 'preview') {
                    this.currentColorTheme.toStorage(this.storageService);
                }
                return this.settings.setColorTheme(this.currentColorTheme, settingsTarget);
            }
            let themeData = this.colorThemeRegistry.findThemeById(themeId);
            if (!themeData) {
                if (themeIdOrTheme instanceof colorThemeData_1.ColorThemeData) {
                    themeData = themeIdOrTheme;
                }
                else {
                    return null;
                }
            }
            try {
                await themeData.ensureLoaded(this.extensionResourceLoaderService);
                themeData.setCustomizations(this.settings);
                return this.applyTheme(themeData, settingsTarget);
            }
            catch (error) {
                throw new Error(nls.localize('error.cannotloadtheme', "Unable to load {0}: {1}", themeData.location?.toString(), error.message));
            }
        }
        reloadCurrentColorTheme() {
            return this.colorThemeSequencer.queue(async () => {
                try {
                    const theme = this.colorThemeRegistry.findThemeBySettingsId(this.currentColorTheme.settingsId) || this.currentColorTheme;
                    await theme.reload(this.extensionResourceLoaderService);
                    theme.setCustomizations(this.settings);
                    await this.applyTheme(theme, undefined, false);
                }
                catch (error) {
                    this.logService.info('Unable to reload {0}: {1}', this.currentColorTheme.location?.toString());
                }
            });
        }
        async restoreColorTheme() {
            return this.colorThemeSequencer.queue(async () => {
                const settingId = this.settings.colorTheme;
                const theme = this.colorThemeRegistry.findThemeBySettingsId(settingId);
                if (theme) {
                    if (settingId !== this.currentColorTheme.settingsId) {
                        await this.internalSetColorTheme(theme.id, undefined);
                    }
                    else if (theme !== this.currentColorTheme) {
                        await theme.ensureLoaded(this.extensionResourceLoaderService);
                        theme.setCustomizations(this.settings);
                        await this.applyTheme(theme, undefined, true);
                    }
                    return true;
                }
                return false;
            });
        }
        updateDynamicCSSRules(themeData) {
            const cssRules = new Set();
            const ruleCollector = {
                addRule: (rule) => {
                    if (!cssRules.has(rule)) {
                        cssRules.add(rule);
                    }
                }
            };
            ruleCollector.addRule(`.monaco-workbench { forced-color-adjust: none; }`);
            themingRegistry.getThemingParticipants().forEach(p => p(themeData, ruleCollector, this.environmentService));
            const colorVariables = [];
            for (const item of (0, colorRegistry_1.getColorRegistry)().getColors()) {
                const color = themeData.getColor(item.id, true);
                if (color) {
                    colorVariables.push(`${(0, colorRegistry_1.asCssVariableName)(item.id)}: ${color.toString()};`);
                }
            }
            ruleCollector.addRule(`.monaco-workbench { ${colorVariables.join('\n')} }`);
            _applyRules([...cssRules].join('\n'), colorThemeRulesClassName);
        }
        applyTheme(newTheme, settingsTarget, silent = false) {
            this.updateDynamicCSSRules(newTheme);
            if (this.currentColorTheme.id) {
                this.container.classList.remove(...this.currentColorTheme.classNames);
            }
            else {
                this.container.classList.remove(workbenchThemeService_1.VS_DARK_THEME, workbenchThemeService_1.VS_LIGHT_THEME, workbenchThemeService_1.VS_HC_THEME, workbenchThemeService_1.VS_HC_LIGHT_THEME);
            }
            this.container.classList.add(...newTheme.classNames);
            this.currentColorTheme.clearCaches();
            this.currentColorTheme = newTheme;
            if (!this.colorThemingParticipantChangeListener) {
                this.colorThemingParticipantChangeListener = themingRegistry.onThemingParticipantAdded(_ => this.updateDynamicCSSRules(this.currentColorTheme));
            }
            this.colorThemeWatcher.update(newTheme);
            this.sendTelemetry(newTheme.id, newTheme.extensionData, 'color');
            if (silent) {
                return Promise.resolve(null);
            }
            this.onColorThemeChange.fire(this.currentColorTheme);
            // remember theme data for a quick restore
            if (newTheme.isLoaded && settingsTarget !== 'preview') {
                newTheme.toStorage(this.storageService);
            }
            return this.settings.setColorTheme(this.currentColorTheme, settingsTarget);
        }
        sendTelemetry(themeId, themeData, themeType) {
            if (themeData) {
                const key = themeType + themeData.extensionId;
                if (!this.themeExtensionsActivated.get(key)) {
                    this.telemetryService.publicLog2('activatePlugin', {
                        id: themeData.extensionId,
                        name: themeData.extensionName,
                        isBuiltin: themeData.extensionIsBuiltin,
                        publisherDisplayName: themeData.extensionPublisher,
                        themeId: themeId
                    });
                    this.themeExtensionsActivated.set(key, true);
                }
            }
        }
        async getFileIconThemes() {
            return this.fileIconThemeRegistry.getThemes();
        }
        getFileIconTheme() {
            return this.currentFileIconTheme;
        }
        get onDidFileIconThemeChange() {
            return this.onFileIconThemeChange.event;
        }
        async setFileIconTheme(iconThemeOrId, settingsTarget) {
            return this.fileIconThemeSequencer.queue(async () => {
                return this.internalSetFileIconTheme(iconThemeOrId, settingsTarget);
            });
        }
        async internalSetFileIconTheme(iconThemeOrId, settingsTarget) {
            if (iconThemeOrId === undefined) {
                iconThemeOrId = '';
            }
            const themeId = types.isString(iconThemeOrId) ? iconThemeOrId : iconThemeOrId.id;
            if (themeId !== this.currentFileIconTheme.id || !this.currentFileIconTheme.isLoaded) {
                let newThemeData = this.fileIconThemeRegistry.findThemeById(themeId);
                if (!newThemeData && iconThemeOrId instanceof fileIconThemeData_1.FileIconThemeData) {
                    newThemeData = iconThemeOrId;
                }
                if (!newThemeData) {
                    newThemeData = fileIconThemeData_1.FileIconThemeData.noIconTheme;
                }
                await newThemeData.ensureLoaded(this.fileIconThemeLoader);
                this.applyAndSetFileIconTheme(newThemeData); // updates this.currentFileIconTheme
            }
            const themeData = this.currentFileIconTheme;
            // remember theme data for a quick restore
            if (themeData.isLoaded && settingsTarget !== 'preview' && (!themeData.location || !(0, remoteHosts_1.getRemoteAuthority)(themeData.location))) {
                themeData.toStorage(this.storageService);
            }
            await this.settings.setFileIconTheme(this.currentFileIconTheme, settingsTarget);
            return themeData;
        }
        async getMarketplaceFileIconThemes(publisher, name, version) {
            const extensionLocation = this.extensionResourceLoaderService.getExtensionGalleryResourceURL({ publisher, name, version }, 'extension');
            if (extensionLocation) {
                try {
                    const manifestContent = await this.extensionResourceLoaderService.readExtensionResource(resources.joinPath(extensionLocation, 'package.json'));
                    return this.fileIconThemeRegistry.getMarketplaceThemes(JSON.parse(manifestContent), extensionLocation, workbenchThemeService_1.ExtensionData.fromName(publisher, name));
                }
                catch (e) {
                    this.logService.error('Problem loading themes from marketplace', e);
                }
            }
            return [];
        }
        async reloadCurrentFileIconTheme() {
            return this.fileIconThemeSequencer.queue(async () => {
                await this.currentFileIconTheme.reload(this.fileIconThemeLoader);
                this.applyAndSetFileIconTheme(this.currentFileIconTheme);
            });
        }
        async restoreFileIconTheme() {
            return this.fileIconThemeSequencer.queue(async () => {
                const settingId = this.settings.fileIconTheme;
                const theme = this.fileIconThemeRegistry.findThemeBySettingsId(settingId);
                if (theme) {
                    if (settingId !== this.currentFileIconTheme.settingsId) {
                        await this.internalSetFileIconTheme(theme.id, undefined);
                    }
                    else if (theme !== this.currentFileIconTheme) {
                        await theme.ensureLoaded(this.fileIconThemeLoader);
                        this.applyAndSetFileIconTheme(theme, true);
                    }
                    return true;
                }
                return false;
            });
        }
        applyAndSetFileIconTheme(iconThemeData, silent = false) {
            this.currentFileIconTheme = iconThemeData;
            _applyRules(iconThemeData.styleSheetContent, fileIconThemeRulesClassName);
            if (iconThemeData.id) {
                this.container.classList.add(fileIconsEnabledClass);
            }
            else {
                this.container.classList.remove(fileIconsEnabledClass);
            }
            this.fileIconThemeWatcher.update(iconThemeData);
            if (iconThemeData.id) {
                this.sendTelemetry(iconThemeData.id, iconThemeData.extensionData, 'fileIcon');
            }
            if (!silent) {
                this.onFileIconThemeChange.fire(this.currentFileIconTheme);
            }
        }
        async getProductIconThemes() {
            return this.productIconThemeRegistry.getThemes();
        }
        getProductIconTheme() {
            return this.currentProductIconTheme;
        }
        get onDidProductIconThemeChange() {
            return this.onProductIconThemeChange.event;
        }
        async setProductIconTheme(iconThemeOrId, settingsTarget) {
            return this.productIconThemeSequencer.queue(async () => {
                return this.internalSetProductIconTheme(iconThemeOrId, settingsTarget);
            });
        }
        async internalSetProductIconTheme(iconThemeOrId, settingsTarget) {
            if (iconThemeOrId === undefined) {
                iconThemeOrId = '';
            }
            const themeId = types.isString(iconThemeOrId) ? iconThemeOrId : iconThemeOrId.id;
            if (themeId !== this.currentProductIconTheme.id || !this.currentProductIconTheme.isLoaded) {
                let newThemeData = this.productIconThemeRegistry.findThemeById(themeId);
                if (!newThemeData && iconThemeOrId instanceof productIconThemeData_1.ProductIconThemeData) {
                    newThemeData = iconThemeOrId;
                }
                if (!newThemeData) {
                    newThemeData = productIconThemeData_1.ProductIconThemeData.defaultTheme;
                }
                await newThemeData.ensureLoaded(this.extensionResourceLoaderService, this.logService);
                this.applyAndSetProductIconTheme(newThemeData); // updates this.currentProductIconTheme
            }
            const themeData = this.currentProductIconTheme;
            // remember theme data for a quick restore
            if (themeData.isLoaded && settingsTarget !== 'preview' && (!themeData.location || !(0, remoteHosts_1.getRemoteAuthority)(themeData.location))) {
                themeData.toStorage(this.storageService);
            }
            await this.settings.setProductIconTheme(this.currentProductIconTheme, settingsTarget);
            return themeData;
        }
        async getMarketplaceProductIconThemes(publisher, name, version) {
            const extensionLocation = this.extensionResourceLoaderService.getExtensionGalleryResourceURL({ publisher, name, version }, 'extension');
            if (extensionLocation) {
                try {
                    const manifestContent = await this.extensionResourceLoaderService.readExtensionResource(resources.joinPath(extensionLocation, 'package.json'));
                    return this.productIconThemeRegistry.getMarketplaceThemes(JSON.parse(manifestContent), extensionLocation, workbenchThemeService_1.ExtensionData.fromName(publisher, name));
                }
                catch (e) {
                    this.logService.error('Problem loading themes from marketplace', e);
                }
            }
            return [];
        }
        async reloadCurrentProductIconTheme() {
            return this.productIconThemeSequencer.queue(async () => {
                await this.currentProductIconTheme.reload(this.extensionResourceLoaderService, this.logService);
                this.applyAndSetProductIconTheme(this.currentProductIconTheme);
            });
        }
        async restoreProductIconTheme() {
            return this.productIconThemeSequencer.queue(async () => {
                const settingId = this.settings.productIconTheme;
                const theme = this.productIconThemeRegistry.findThemeBySettingsId(settingId);
                if (theme) {
                    if (settingId !== this.currentProductIconTheme.settingsId) {
                        await this.internalSetProductIconTheme(theme.id, undefined);
                    }
                    else if (theme !== this.currentProductIconTheme) {
                        await theme.ensureLoaded(this.extensionResourceLoaderService, this.logService);
                        this.applyAndSetProductIconTheme(theme, true);
                    }
                    return true;
                }
                return false;
            });
        }
        applyAndSetProductIconTheme(iconThemeData, silent = false) {
            this.currentProductIconTheme = iconThemeData;
            _applyRules(iconThemeData.styleSheetContent, productIconThemeRulesClassName);
            this.productIconThemeWatcher.update(iconThemeData);
            if (iconThemeData.id) {
                this.sendTelemetry(iconThemeData.id, iconThemeData.extensionData, 'productIcon');
            }
            if (!silent) {
                this.onProductIconThemeChange.fire(this.currentProductIconTheme);
            }
        }
    };
    exports.WorkbenchThemeService = WorkbenchThemeService;
    exports.WorkbenchThemeService = WorkbenchThemeService = __decorate([
        __param(0, extensions_1.IExtensionService),
        __param(1, storage_1.IStorageService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(5, files_1.IFileService),
        __param(6, extensionResourceLoader_1.IExtensionResourceLoaderService),
        __param(7, layoutService_1.IWorkbenchLayoutService),
        __param(8, log_1.ILogService),
        __param(9, hostColorSchemeService_1.IHostColorSchemeService),
        __param(10, userDataInit_1.IUserDataInitializationService),
        __param(11, language_1.ILanguageService)
    ], WorkbenchThemeService);
    class ThemeFileWatcher {
        constructor(fileService, environmentService, onUpdate) {
            this.fileService = fileService;
            this.environmentService = environmentService;
            this.onUpdate = onUpdate;
        }
        update(theme) {
            if (!resources.isEqual(theme.location, this.watchedLocation)) {
                this.dispose();
                if (theme.location && (theme.watch || this.environmentService.isExtensionDevelopment)) {
                    this.watchedLocation = theme.location;
                    this.watcherDisposable = this.fileService.watch(theme.location);
                    this.fileService.onDidFilesChange(e => {
                        if (this.watchedLocation && e.contains(this.watchedLocation, 0 /* FileChangeType.UPDATED */)) {
                            this.onUpdate();
                        }
                    });
                }
            }
        }
        dispose() {
            this.watcherDisposable = (0, lifecycle_1.dispose)(this.watcherDisposable);
            this.fileChangeListener = (0, lifecycle_1.dispose)(this.fileChangeListener);
            this.watchedLocation = undefined;
        }
    }
    function _applyRules(styleSheetContent, rulesClassName) {
        const themeStyles = document.head.getElementsByClassName(rulesClassName);
        if (themeStyles.length === 0) {
            const elStyle = document.createElement('style');
            elStyle.type = 'text/css';
            elStyle.className = rulesClassName;
            elStyle.textContent = styleSheetContent;
            document.head.appendChild(elStyle);
        }
        else {
            themeStyles[0].textContent = styleSheetContent;
        }
    }
    (0, colorThemeSchema_1.registerColorThemeSchemas)();
    (0, fileIconThemeSchema_1.registerFileIconThemeSchemas)();
    (0, productIconThemeSchema_1.registerProductIconThemeSchemas)();
    // The WorkbenchThemeService should stay eager as the constructor restores the
    // last used colors / icons from storage. This needs to happen as quickly as possible
    // for a flicker-free startup experience.
    (0, extensions_2.registerSingleton)(workbenchThemeService_1.IWorkbenchThemeService, WorkbenchThemeService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoVGhlbWVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RoZW1lcy9icm93c2VyL3dvcmtiZW5jaFRoZW1lU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF5Q2hHLGlCQUFpQjtJQUVqQixNQUFNLHlCQUF5QixHQUFHLGVBQWUsQ0FBQztJQUNsRCxNQUFNLCtCQUErQixvQ0FBMkIsQ0FBQyxDQUFDLDhDQUE4QztJQUVoSCxNQUFNLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBRXhELE1BQU0sMEJBQTBCLEdBQUcsa0NBQWtDLENBQUM7SUFDdEUsTUFBTSxxQkFBcUIsR0FBRyxvQkFBb0IsQ0FBQztJQUVuRCxNQUFNLHdCQUF3QixHQUFHLHVCQUF1QixDQUFDO0lBQ3pELE1BQU0sMkJBQTJCLEdBQUcsMEJBQTBCLENBQUM7SUFDL0QsTUFBTSw4QkFBOEIsR0FBRyw2QkFBNkIsQ0FBQztJQUVyRSxNQUFNLGVBQWUsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBbUIseUJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUU3RixTQUFTLGVBQWUsQ0FBQyxLQUFhO1FBQ3JDLGFBQWE7UUFDYixRQUFRLEtBQUssRUFBRTtZQUNkLEtBQUssc0NBQWMsQ0FBQyxDQUFDLE9BQU8sTUFBTSx1QkFBdUIsdUJBQXVCLENBQUM7WUFDakYsS0FBSyxxQ0FBYSxDQUFDLENBQUMsT0FBTyxXQUFXLHVCQUF1QixzQkFBc0IsQ0FBQztZQUNwRixLQUFLLG1DQUFXLENBQUMsQ0FBQyxPQUFPLFlBQVksdUJBQXVCLHVCQUF1QixDQUFDO1lBQ3BGLEtBQUsseUNBQWlCLENBQUMsQ0FBQyxPQUFPLFlBQVksdUJBQXVCLHVCQUF1QixDQUFDO1NBQzFGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFD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