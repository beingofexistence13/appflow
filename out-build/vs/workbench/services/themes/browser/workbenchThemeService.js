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
define(["require", "exports", "vs/nls!vs/workbench/services/themes/browser/workbenchThemeService", "vs/base/common/types", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/themes/common/workbenchThemeService", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/registry/common/platform", "vs/base/common/errors", "vs/platform/configuration/common/configuration", "vs/workbench/services/themes/common/colorThemeData", "vs/platform/theme/common/themeService", "vs/base/common/event", "vs/workbench/services/themes/common/fileIconThemeSchema", "vs/base/common/lifecycle", "vs/workbench/services/themes/browser/fileIconThemeData", "vs/base/browser/dom", "vs/workbench/services/environment/browser/environmentService", "vs/platform/files/common/files", "vs/base/common/resources", "vs/workbench/services/themes/common/colorThemeSchema", "vs/platform/instantiation/common/extensions", "vs/platform/remote/common/remoteHosts", "vs/workbench/services/layout/browser/layoutService", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/workbench/services/themes/common/themeExtensionPoints", "vs/workbench/services/themes/common/themeConfiguration", "vs/workbench/services/themes/browser/productIconThemeData", "vs/workbench/services/themes/common/productIconThemeSchema", "vs/platform/log/common/log", "vs/base/common/platform", "vs/platform/theme/common/theme", "vs/workbench/services/themes/common/hostColorSchemeService", "vs/base/common/async", "vs/workbench/services/userData/browser/userDataInit", "vs/platform/theme/browser/iconsStyleSheet", "vs/platform/theme/common/colorRegistry", "vs/editor/common/languages/language"], function (require, exports, nls, types, extensions_1, workbenchThemeService_1, storage_1, telemetry_1, platform_1, errors, configuration_1, colorThemeData_1, themeService_1, event_1, fileIconThemeSchema_1, lifecycle_1, fileIconThemeData_1, dom_1, environmentService_1, files_1, resources, colorThemeSchema_1, extensions_2, remoteHosts_1, layoutService_1, extensionResourceLoader_1, themeExtensionPoints_1, themeConfiguration_1, productIconThemeData_1, productIconThemeSchema_1, log_1, platform_2, theme_1, hostColorSchemeService_1, async_1, userDataInit_1, iconsStyleSheet_1, colorRegistry_1, language_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Azb = void 0;
    // implementation
    const PERSISTED_OS_COLOR_SCHEME = 'osColorScheme';
    const PERSISTED_OS_COLOR_SCHEME_SCOPE = -1 /* StorageScope.APPLICATION */; // the OS scheme depends on settings in the OS
    const defaultThemeExtensionId = 'vscode-theme-defaults';
    const DEFAULT_FILE_ICON_THEME_ID = 'vscode.vscode-theme-seti-vs-seti';
    const fileIconsEnabledClass = 'file-icons-enabled';
    const colorThemeRulesClassName = 'contributedColorTheme';
    const fileIconThemeRulesClassName = 'contributedFileIconTheme';
    const productIconThemeRulesClassName = 'contributedProductIconTheme';
    const themingRegistry = platform_1.$8m.as(themeService_1.$lv.ThemingContribution);
    function validateThemeId(theme) {
        // migrations
        switch (theme) {
            case workbenchThemeService_1.$fgb: return `vs ${defaultThemeExtensionId}-themes-light_vs-json`;
            case workbenchThemeService_1.$ggb: return `vs-dark ${defaultThemeExtensionId}-themes-dark_vs-json`;
            case workbenchThemeService_1.$hgb: return `hc-black ${defaultThemeExtensionId}-themes-hc_black-json`;
            case workbenchThemeService_1.$igb: return `hc-light ${defaultThemeExtensionId}-themes-hc_light-json`;
        }
        return theme;
    }
    const colorThemesExtPoint = (0, themeExtensionPoints_1.$pzb)();
    const fileIconThemesExtPoint = (0, themeExtensionPoints_1.$qzb)();
    const productIconThemesExtPoint = (0, themeExtensionPoints_1.$rzb)();
    let $Azb = class $Azb {
        constructor(extensionService, y, z, A, B, fileService, C, layoutService, D, E, F, languageService) {
            this.y = y;
            this.z = z;
            this.A = A;
            this.B = B;
            this.C = C;
            this.D = D;
            this.E = E;
            this.F = F;
            this.x = false;
            this.R = new Map();
            this.a = layoutService.container;
            this.b = new themeConfiguration_1.$ezb(z);
            this.c = new themeExtensionPoints_1.$szb(colorThemesExtPoint, colorThemeData_1.$fzb.fromExtensionTheme);
            this.g = new ThemeFileWatcher(fileService, B, this.O.bind(this));
            this.f = new event_1.$fd({ leakWarningThreshold: 400 });
            this.d = colorThemeData_1.$fzb.createUnloadedTheme('');
            this.i = new async_1.$Bg();
            this.n = new ThemeFileWatcher(fileService, B, this.U.bind(this));
            this.j = new themeExtensionPoints_1.$szb(fileIconThemesExtPoint, fileIconThemeData_1.$nzb.fromExtensionTheme, true, fileIconThemeData_1.$nzb.noIconTheme);
            this.m = new fileIconThemeData_1.$ozb(C, languageService);
            this.l = new event_1.$fd({ leakWarningThreshold: 400 });
            this.k = fileIconThemeData_1.$nzb.createUnloadedTheme('');
            this.o = new async_1.$Bg();
            this.u = new ThemeFileWatcher(fileService, B, this.X.bind(this));
            this.q = new themeExtensionPoints_1.$szb(productIconThemesExtPoint, productIconThemeData_1.$uzb.fromExtensionTheme, true, productIconThemeData_1.$uzb.defaultTheme);
            this.s = new event_1.$fd();
            this.r = productIconThemeData_1.$uzb.createUnloadedTheme('');
            this.v = new async_1.$Bg();
            // In order to avoid paint flashing for tokens, because
            // themes are loaded asynchronously, we need to initialize
            // a color theme document with good defaults until the theme is loaded
            let themeData = colorThemeData_1.$fzb.fromStorageData(this.y);
            const colorThemeSetting = this.b.colorTheme;
            if (themeData && colorThemeSetting !== themeData.settingsId && this.b.isDefaultColorTheme()) {
                this.x = themeData.settingsId === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK_OLD || themeData.settingsId === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT_OLD;
                // the web has different defaults than the desktop, therefore do not restore when the setting is the default theme and the storage doesn't match that.
                themeData = undefined;
            }
            // the preferred color scheme (high contrast, light, dark) has changed since the last start
            const preferredColorScheme = this.L();
            const defaultColorMap = colorThemeSetting === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT ? workbenchThemeService_1.$ogb : colorThemeSetting === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK ? workbenchThemeService_1.$ngb : undefined;
            if (preferredColorScheme && themeData?.type !== preferredColorScheme && this.y.get(PERSISTED_OS_COLOR_SCHEME, PERSISTED_OS_COLOR_SCHEME_SCOPE) !== preferredColorScheme) {
                themeData = colorThemeData_1.$fzb.createUnloadedThemeForThemeType(preferredColorScheme, undefined);
            }
            if (!themeData) {
                const initialColorTheme = B.options?.initialColorTheme;
                if (initialColorTheme) {
                    themeData = colorThemeData_1.$fzb.createUnloadedThemeForThemeType(initialColorTheme.themeType, initialColorTheme.colors ?? defaultColorMap);
                }
            }
            if (!themeData) {
                themeData = colorThemeData_1.$fzb.createUnloadedThemeForThemeType(platform_2.$o ? theme_1.ColorScheme.LIGHT : theme_1.ColorScheme.DARK, defaultColorMap);
            }
            themeData.setCustomizations(this.b);
            this.Q(themeData, undefined, true);
            const fileIconData = fileIconThemeData_1.$nzb.fromStorageData(this.y);
            if (fileIconData) {
                this.V(fileIconData, true);
            }
            const productIconData = productIconThemeData_1.$uzb.fromStorageData(this.y);
            if (productIconData) {
                this.Y(productIconData, true);
            }
            extensionService.whenInstalledExtensionsRegistered().then(_ => {
                this.H();
                this.J();
                this.I();
                this.G().catch(errors.$Y);
            });
            const codiconStyleSheet = (0, dom_1.$XO)();
            codiconStyleSheet.id = 'codiconStyles';
            const iconsStyleSheet = (0, iconsStyleSheet_1.$yzb)(this);
            function updateAll() {
                codiconStyleSheet.textContent = iconsStyleSheet.getCSS();
            }
            const delayer = new async_1.$Sg(updateAll, 0);
            iconsStyleSheet.onDidChange(() => delayer.schedule());
            delayer.schedule();
        }
        G() {
            const extDevLocs = this.B.extensionDevelopmentLocationURI;
            const extDevLoc = extDevLocs && extDevLocs.length === 1 ? extDevLocs[0] : undefined; // in dev mode, switch to a theme provided by the extension under dev.
            const initializeColorTheme = async () => {
                const devThemes = this.c.findThemeByExtensionLocation(extDevLoc);
                if (devThemes.length) {
                    return this.setColorTheme(devThemes[0].id, 8 /* ConfigurationTarget.MEMORY */);
                }
                const preferredColorScheme = this.L();
                const prevScheme = this.y.get(PERSISTED_OS_COLOR_SCHEME, PERSISTED_OS_COLOR_SCHEME_SCOPE);
                if (preferredColorScheme !== prevScheme) {
                    this.y.store(PERSISTED_OS_COLOR_SCHEME, preferredColorScheme, PERSISTED_OS_COLOR_SCHEME_SCOPE, 0 /* StorageTarget.USER */);
                    if (preferredColorScheme && this.d.type !== preferredColorScheme) {
                        return this.M(preferredColorScheme);
                    }
                }
                let theme = this.c.findThemeBySettingsId(this.b.colorTheme, undefined);
                if (!theme) {
                    // If the current theme is not available, first make sure setting sync is complete
                    await this.F.whenInitializationFinished();
                    // try to get the theme again, now with a fallback to the default themes
                    const fallbackTheme = this.d.type === theme_1.ColorScheme.LIGHT ? workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT : workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK;
                    theme = this.c.findThemeBySettingsId(this.b.colorTheme, fallbackTheme);
                }
                return this.setColorTheme(theme && theme.id, undefined);
            };
            const initializeFileIconTheme = async () => {
                const devThemes = this.j.findThemeByExtensionLocation(extDevLoc);
                if (devThemes.length) {
                    return this.setFileIconTheme(devThemes[0].id, 8 /* ConfigurationTarget.MEMORY */);
                }
                let theme = this.j.findThemeBySettingsId(this.b.fileIconTheme);
                if (!theme) {
                    // If the current theme is not available, first make sure setting sync is complete
                    await this.F.whenInitializationFinished();
                    theme = this.j.findThemeBySettingsId(this.b.fileIconTheme);
                }
                return this.setFileIconTheme(theme ? theme.id : DEFAULT_FILE_ICON_THEME_ID, undefined);
            };
            const initializeProductIconTheme = async () => {
                const devThemes = this.q.findThemeByExtensionLocation(extDevLoc);
                if (devThemes.length) {
                    return this.setProductIconTheme(devThemes[0].id, 8 /* ConfigurationTarget.MEMORY */);
                }
                let theme = this.q.findThemeBySettingsId(this.b.productIconTheme);
                if (!theme) {
                    // If the current theme is not available, first make sure setting sync is complete
                    await this.F.whenInitializationFinished();
                    theme = this.q.findThemeBySettingsId(this.b.productIconTheme);
                }
                return this.setProductIconTheme(theme ? theme.id : productIconThemeData_1.$tzb, undefined);
            };
            return Promise.all([initializeColorTheme(), initializeFileIconTheme(), initializeProductIconTheme()]);
        }
        H() {
            this.z.onDidChangeConfiguration(e => {
                let lazyPreferredColorScheme = null;
                const getPreferredColorScheme = () => {
                    if (lazyPreferredColorScheme === null) {
                        lazyPreferredColorScheme = this.L();
                    }
                    return lazyPreferredColorScheme;
                };
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.COLOR_THEME)) {
                    this.restoreColorTheme();
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.DETECT_COLOR_SCHEME) || e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.DETECT_HC)) {
                    this.K();
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.PREFERRED_DARK_THEME) && getPreferredColorScheme() === theme_1.ColorScheme.DARK) {
                    this.M(theme_1.ColorScheme.DARK);
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.PREFERRED_LIGHT_THEME) && getPreferredColorScheme() === theme_1.ColorScheme.LIGHT) {
                    this.M(theme_1.ColorScheme.LIGHT);
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.PREFERRED_HC_DARK_THEME) && getPreferredColorScheme() === theme_1.ColorScheme.HIGH_CONTRAST_DARK) {
                    this.M(theme_1.ColorScheme.HIGH_CONTRAST_DARK);
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.PREFERRED_HC_LIGHT_THEME) && getPreferredColorScheme() === theme_1.ColorScheme.HIGH_CONTRAST_LIGHT) {
                    this.M(theme_1.ColorScheme.HIGH_CONTRAST_LIGHT);
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.FILE_ICON_THEME)) {
                    this.restoreFileIconTheme();
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.PRODUCT_ICON_THEME)) {
                    this.restoreProductIconTheme();
                }
                if (this.d) {
                    let hasColorChanges = false;
                    if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.COLOR_CUSTOMIZATIONS)) {
                        this.d.setCustomColors(this.b.colorCustomizations);
                        hasColorChanges = true;
                    }
                    if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.TOKEN_COLOR_CUSTOMIZATIONS)) {
                        this.d.setCustomTokenColors(this.b.tokenColorCustomizations);
                        hasColorChanges = true;
                    }
                    if (e.affectsConfiguration(workbenchThemeService_1.ThemeSettings.SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS)) {
                        this.d.setCustomSemanticTokenColors(this.b.semanticTokenColorCustomizations);
                        hasColorChanges = true;
                    }
                    if (hasColorChanges) {
                        this.P(this.d);
                        this.f.fire(this.d);
                    }
                }
            });
        }
        I() {
            let prevColorId = undefined;
            // update settings schema setting for theme specific settings
            this.c.onDidChange(async (event) => {
                (0, themeConfiguration_1.$bzb)(event.themes);
                if (await this.restoreColorTheme()) { // checks if theme from settings exists and is set
                    // restore theme
                    if (this.d.settingsId === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK && !types.$qf(prevColorId) && await this.c.findThemeById(prevColorId)) {
                        await this.setColorTheme(prevColorId, 'auto');
                        prevColorId = undefined;
                    }
                    else if (event.added.some(t => t.settingsId === this.d.settingsId)) {
                        await this.O();
                    }
                }
                else if (event.removed.some(t => t.settingsId === this.d.settingsId)) {
                    // current theme is no longer available
                    prevColorId = this.d.id;
                    const defaultTheme = this.c.findThemeBySettingsId(workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK);
                    await this.setColorTheme(defaultTheme, 'auto');
                }
            });
            let prevFileIconId = undefined;
            this.j.onDidChange(async (event) => {
                (0, themeConfiguration_1.$czb)(event.themes);
                if (await this.restoreFileIconTheme()) { // checks if theme from settings exists and is set
                    // restore theme
                    if (this.k.id === DEFAULT_FILE_ICON_THEME_ID && !types.$qf(prevFileIconId) && this.j.findThemeById(prevFileIconId)) {
                        await this.setFileIconTheme(prevFileIconId, 'auto');
                        prevFileIconId = undefined;
                    }
                    else if (event.added.some(t => t.settingsId === this.k.settingsId)) {
                        await this.U();
                    }
                }
                else if (event.removed.some(t => t.settingsId === this.k.settingsId)) {
                    // current theme is no longer available
                    prevFileIconId = this.k.id;
                    await this.setFileIconTheme(DEFAULT_FILE_ICON_THEME_ID, 'auto');
                }
            });
            let prevProductIconId = undefined;
            this.q.onDidChange(async (event) => {
                (0, themeConfiguration_1.$dzb)(event.themes);
                if (await this.restoreProductIconTheme()) { // checks if theme from settings exists and is set
                    // restore theme
                    if (this.r.id === productIconThemeData_1.$tzb && !types.$qf(prevProductIconId) && this.q.findThemeById(prevProductIconId)) {
                        await this.setProductIconTheme(prevProductIconId, 'auto');
                        prevProductIconId = undefined;
                    }
                    else if (event.added.some(t => t.settingsId === this.r.settingsId)) {
                        await this.X();
                    }
                }
                else if (event.removed.some(t => t.settingsId === this.r.settingsId)) {
                    // current theme is no longer available
                    prevProductIconId = this.r.id;
                    await this.setProductIconTheme(productIconThemeData_1.$tzb, 'auto');
                }
            });
            return Promise.all([this.getColorThemes(), this.getFileIconThemes(), this.getProductIconThemes()]).then(([ct, fit, pit]) => {
                (0, themeConfiguration_1.$bzb)(ct);
                (0, themeConfiguration_1.$czb)(fit);
                (0, themeConfiguration_1.$dzb)(pit);
            });
        }
        // preferred scheme handling
        J() {
            this.E.onDidChangeColorScheme(() => this.K());
        }
        async K() {
            const scheme = this.L();
            const prevScheme = this.y.get(PERSISTED_OS_COLOR_SCHEME, PERSISTED_OS_COLOR_SCHEME_SCOPE);
            if (scheme !== prevScheme) {
                this.y.store(PERSISTED_OS_COLOR_SCHEME, scheme, PERSISTED_OS_COLOR_SCHEME_SCOPE, 1 /* StorageTarget.MACHINE */);
                if (scheme) {
                    if (!prevScheme) {
                        // remember the theme before scheme switching
                        this.w = this.b.colorTheme;
                    }
                    return this.M(scheme);
                }
                else if (prevScheme && this.w) {
                    // reapply the theme before scheme switching
                    const theme = this.c.findThemeBySettingsId(this.w, undefined);
                    if (theme) {
                        this.setColorTheme(theme.id, 'auto');
                    }
                }
            }
            return undefined;
        }
        L() {
            if (this.z.getValue(workbenchThemeService_1.ThemeSettings.DETECT_HC) && this.E.highContrast) {
                return this.E.dark ? theme_1.ColorScheme.HIGH_CONTRAST_DARK : theme_1.ColorScheme.HIGH_CONTRAST_LIGHT;
            }
            if (this.z.getValue(workbenchThemeService_1.ThemeSettings.DETECT_COLOR_SCHEME)) {
                return this.E.dark ? theme_1.ColorScheme.DARK : theme_1.ColorScheme.LIGHT;
            }
            return undefined;
        }
        async M(type) {
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
            const themeSettingId = this.z.getValue(settingId);
            if (themeSettingId && typeof themeSettingId === 'string') {
                const theme = this.c.findThemeBySettingsId(themeSettingId, undefined);
                if (theme) {
                    const configurationTarget = this.b.findAutoConfigurationTarget(settingId);
                    return this.setColorTheme(theme.id, configurationTarget);
                }
            }
            return null;
        }
        hasUpdatedDefaultThemes() {
            return this.x;
        }
        getColorTheme() {
            return this.d;
        }
        async getColorThemes() {
            return this.c.getThemes();
        }
        async getMarketplaceColorThemes(publisher, name, version) {
            const extensionLocation = this.C.getExtensionGalleryResourceURL({ publisher, name, version }, 'extension');
            if (extensionLocation) {
                try {
                    const manifestContent = await this.C.readExtensionResource(resources.$ig(extensionLocation, 'package.json'));
                    return this.c.getMarketplaceThemes(JSON.parse(manifestContent), extensionLocation, workbenchThemeService_1.ExtensionData.fromName(publisher, name));
                }
                catch (e) {
                    this.D.error('Problem loading themes from marketplace', e);
                }
            }
            return [];
        }
        get onDidColorThemeChange() {
            return this.f.event;
        }
        setColorTheme(themeIdOrTheme, settingsTarget) {
            return this.i.queue(async () => {
                return this.N(themeIdOrTheme, settingsTarget);
            });
        }
        async N(themeIdOrTheme, settingsTarget) {
            if (!themeIdOrTheme) {
                return null;
            }
            const themeId = types.$jf(themeIdOrTheme) ? validateThemeId(themeIdOrTheme) : themeIdOrTheme.id;
            if (this.d.isLoaded && themeId === this.d.id) {
                if (settingsTarget !== 'preview') {
                    this.d.toStorage(this.y);
                }
                return this.b.setColorTheme(this.d, settingsTarget);
            }
            let themeData = this.c.findThemeById(themeId);
            if (!themeData) {
                if (themeIdOrTheme instanceof colorThemeData_1.$fzb) {
                    themeData = themeIdOrTheme;
                }
                else {
                    return null;
                }
            }
            try {
                await themeData.ensureLoaded(this.C);
                themeData.setCustomizations(this.b);
                return this.Q(themeData, settingsTarget);
            }
            catch (error) {
                throw new Error(nls.localize(0, null, themeData.location?.toString(), error.message));
            }
        }
        O() {
            return this.i.queue(async () => {
                try {
                    const theme = this.c.findThemeBySettingsId(this.d.settingsId) || this.d;
                    await theme.reload(this.C);
                    theme.setCustomizations(this.b);
                    await this.Q(theme, undefined, false);
                }
                catch (error) {
                    this.D.info('Unable to reload {0}: {1}', this.d.location?.toString());
                }
            });
        }
        async restoreColorTheme() {
            return this.i.queue(async () => {
                const settingId = this.b.colorTheme;
                const theme = this.c.findThemeBySettingsId(settingId);
                if (theme) {
                    if (settingId !== this.d.settingsId) {
                        await this.N(theme.id, undefined);
                    }
                    else if (theme !== this.d) {
                        await theme.ensureLoaded(this.C);
                        theme.setCustomizations(this.b);
                        await this.Q(theme, undefined, true);
                    }
                    return true;
                }
                return false;
            });
        }
        P(themeData) {
            const cssRules = new Set();
            const ruleCollector = {
                addRule: (rule) => {
                    if (!cssRules.has(rule)) {
                        cssRules.add(rule);
                    }
                }
            };
            ruleCollector.addRule(`.monaco-workbench { forced-color-adjust: none; }`);
            themingRegistry.getThemingParticipants().forEach(p => p(themeData, ruleCollector, this.B));
            const colorVariables = [];
            for (const item of (0, colorRegistry_1.$tv)().getColors()) {
                const color = themeData.getColor(item.id, true);
                if (color) {
                    colorVariables.push(`${(0, colorRegistry_1.$ov)(item.id)}: ${color.toString()};`);
                }
            }
            ruleCollector.addRule(`.monaco-workbench { ${colorVariables.join('\n')} }`);
            _applyRules([...cssRules].join('\n'), colorThemeRulesClassName);
        }
        Q(newTheme, settingsTarget, silent = false) {
            this.P(newTheme);
            if (this.d.id) {
                this.a.classList.remove(...this.d.classNames);
            }
            else {
                this.a.classList.remove(workbenchThemeService_1.$ggb, workbenchThemeService_1.$fgb, workbenchThemeService_1.$hgb, workbenchThemeService_1.$igb);
            }
            this.a.classList.add(...newTheme.classNames);
            this.d.clearCaches();
            this.d = newTheme;
            if (!this.h) {
                this.h = themingRegistry.onThemingParticipantAdded(_ => this.P(this.d));
            }
            this.g.update(newTheme);
            this.S(newTheme.id, newTheme.extensionData, 'color');
            if (silent) {
                return Promise.resolve(null);
            }
            this.f.fire(this.d);
            // remember theme data for a quick restore
            if (newTheme.isLoaded && settingsTarget !== 'preview') {
                newTheme.toStorage(this.y);
            }
            return this.b.setColorTheme(this.d, settingsTarget);
        }
        S(themeId, themeData, themeType) {
            if (themeData) {
                const key = themeType + themeData.extensionId;
                if (!this.R.get(key)) {
                    this.A.publicLog2('activatePlugin', {
                        id: themeData.extensionId,
                        name: themeData.extensionName,
                        isBuiltin: themeData.extensionIsBuiltin,
                        publisherDisplayName: themeData.extensionPublisher,
                        themeId: themeId
                    });
                    this.R.set(key, true);
                }
            }
        }
        async getFileIconThemes() {
            return this.j.getThemes();
        }
        getFileIconTheme() {
            return this.k;
        }
        get onDidFileIconThemeChange() {
            return this.l.event;
        }
        async setFileIconTheme(iconThemeOrId, settingsTarget) {
            return this.o.queue(async () => {
                return this.T(iconThemeOrId, settingsTarget);
            });
        }
        async T(iconThemeOrId, settingsTarget) {
            if (iconThemeOrId === undefined) {
                iconThemeOrId = '';
            }
            const themeId = types.$jf(iconThemeOrId) ? iconThemeOrId : iconThemeOrId.id;
            if (themeId !== this.k.id || !this.k.isLoaded) {
                let newThemeData = this.j.findThemeById(themeId);
                if (!newThemeData && iconThemeOrId instanceof fileIconThemeData_1.$nzb) {
                    newThemeData = iconThemeOrId;
                }
                if (!newThemeData) {
                    newThemeData = fileIconThemeData_1.$nzb.noIconTheme;
                }
                await newThemeData.ensureLoaded(this.m);
                this.V(newThemeData); // updates this.currentFileIconTheme
            }
            const themeData = this.k;
            // remember theme data for a quick restore
            if (themeData.isLoaded && settingsTarget !== 'preview' && (!themeData.location || !(0, remoteHosts_1.$Ok)(themeData.location))) {
                themeData.toStorage(this.y);
            }
            await this.b.setFileIconTheme(this.k, settingsTarget);
            return themeData;
        }
        async getMarketplaceFileIconThemes(publisher, name, version) {
            const extensionLocation = this.C.getExtensionGalleryResourceURL({ publisher, name, version }, 'extension');
            if (extensionLocation) {
                try {
                    const manifestContent = await this.C.readExtensionResource(resources.$ig(extensionLocation, 'package.json'));
                    return this.j.getMarketplaceThemes(JSON.parse(manifestContent), extensionLocation, workbenchThemeService_1.ExtensionData.fromName(publisher, name));
                }
                catch (e) {
                    this.D.error('Problem loading themes from marketplace', e);
                }
            }
            return [];
        }
        async U() {
            return this.o.queue(async () => {
                await this.k.reload(this.m);
                this.V(this.k);
            });
        }
        async restoreFileIconTheme() {
            return this.o.queue(async () => {
                const settingId = this.b.fileIconTheme;
                const theme = this.j.findThemeBySettingsId(settingId);
                if (theme) {
                    if (settingId !== this.k.settingsId) {
                        await this.T(theme.id, undefined);
                    }
                    else if (theme !== this.k) {
                        await theme.ensureLoaded(this.m);
                        this.V(theme, true);
                    }
                    return true;
                }
                return false;
            });
        }
        V(iconThemeData, silent = false) {
            this.k = iconThemeData;
            _applyRules(iconThemeData.styleSheetContent, fileIconThemeRulesClassName);
            if (iconThemeData.id) {
                this.a.classList.add(fileIconsEnabledClass);
            }
            else {
                this.a.classList.remove(fileIconsEnabledClass);
            }
            this.n.update(iconThemeData);
            if (iconThemeData.id) {
                this.S(iconThemeData.id, iconThemeData.extensionData, 'fileIcon');
            }
            if (!silent) {
                this.l.fire(this.k);
            }
        }
        async getProductIconThemes() {
            return this.q.getThemes();
        }
        getProductIconTheme() {
            return this.r;
        }
        get onDidProductIconThemeChange() {
            return this.s.event;
        }
        async setProductIconTheme(iconThemeOrId, settingsTarget) {
            return this.v.queue(async () => {
                return this.W(iconThemeOrId, settingsTarget);
            });
        }
        async W(iconThemeOrId, settingsTarget) {
            if (iconThemeOrId === undefined) {
                iconThemeOrId = '';
            }
            const themeId = types.$jf(iconThemeOrId) ? iconThemeOrId : iconThemeOrId.id;
            if (themeId !== this.r.id || !this.r.isLoaded) {
                let newThemeData = this.q.findThemeById(themeId);
                if (!newThemeData && iconThemeOrId instanceof productIconThemeData_1.$uzb) {
                    newThemeData = iconThemeOrId;
                }
                if (!newThemeData) {
                    newThemeData = productIconThemeData_1.$uzb.defaultTheme;
                }
                await newThemeData.ensureLoaded(this.C, this.D);
                this.Y(newThemeData); // updates this.currentProductIconTheme
            }
            const themeData = this.r;
            // remember theme data for a quick restore
            if (themeData.isLoaded && settingsTarget !== 'preview' && (!themeData.location || !(0, remoteHosts_1.$Ok)(themeData.location))) {
                themeData.toStorage(this.y);
            }
            await this.b.setProductIconTheme(this.r, settingsTarget);
            return themeData;
        }
        async getMarketplaceProductIconThemes(publisher, name, version) {
            const extensionLocation = this.C.getExtensionGalleryResourceURL({ publisher, name, version }, 'extension');
            if (extensionLocation) {
                try {
                    const manifestContent = await this.C.readExtensionResource(resources.$ig(extensionLocation, 'package.json'));
                    return this.q.getMarketplaceThemes(JSON.parse(manifestContent), extensionLocation, workbenchThemeService_1.ExtensionData.fromName(publisher, name));
                }
                catch (e) {
                    this.D.error('Problem loading themes from marketplace', e);
                }
            }
            return [];
        }
        async X() {
            return this.v.queue(async () => {
                await this.r.reload(this.C, this.D);
                this.Y(this.r);
            });
        }
        async restoreProductIconTheme() {
            return this.v.queue(async () => {
                const settingId = this.b.productIconTheme;
                const theme = this.q.findThemeBySettingsId(settingId);
                if (theme) {
                    if (settingId !== this.r.settingsId) {
                        await this.W(theme.id, undefined);
                    }
                    else if (theme !== this.r) {
                        await theme.ensureLoaded(this.C, this.D);
                        this.Y(theme, true);
                    }
                    return true;
                }
                return false;
            });
        }
        Y(iconThemeData, silent = false) {
            this.r = iconThemeData;
            _applyRules(iconThemeData.styleSheetContent, productIconThemeRulesClassName);
            this.u.update(iconThemeData);
            if (iconThemeData.id) {
                this.S(iconThemeData.id, iconThemeData.extensionData, 'productIcon');
            }
            if (!silent) {
                this.s.fire(this.r);
            }
        }
    };
    exports.$Azb = $Azb;
    exports.$Azb = $Azb = __decorate([
        __param(0, extensions_1.$MF),
        __param(1, storage_1.$Vo),
        __param(2, configuration_1.$8h),
        __param(3, telemetry_1.$9k),
        __param(4, environmentService_1.$LT),
        __param(5, files_1.$6j),
        __param(6, extensionResourceLoader_1.$2$),
        __param(7, layoutService_1.$Meb),
        __param(8, log_1.$5i),
        __param(9, hostColorSchemeService_1.$vzb),
        __param(10, userDataInit_1.$wzb),
        __param(11, language_1.$ct)
    ], $Azb);
    class ThemeFileWatcher {
        constructor(d, f, g) {
            this.d = d;
            this.f = f;
            this.g = g;
        }
        update(theme) {
            if (!resources.$bg(theme.location, this.a)) {
                this.dispose();
                if (theme.location && (theme.watch || this.f.isExtensionDevelopment)) {
                    this.a = theme.location;
                    this.b = this.d.watch(theme.location);
                    this.d.onDidFilesChange(e => {
                        if (this.a && e.contains(this.a, 0 /* FileChangeType.UPDATED */)) {
                            this.g();
                        }
                    });
                }
            }
        }
        dispose() {
            this.b = (0, lifecycle_1.$fc)(this.b);
            this.c = (0, lifecycle_1.$fc)(this.c);
            this.a = undefined;
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
    (0, colorThemeSchema_1.$azb)();
    (0, fileIconThemeSchema_1.$mzb)();
    (0, productIconThemeSchema_1.$lzb)();
    // The WorkbenchThemeService should stay eager as the constructor restores the
    // last used colors / icons from storage. This needs to happen as quickly as possible
    // for a flicker-free startup experience.
    (0, extensions_2.$mr)(workbenchThemeService_1.$egb, $Azb, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=workbenchThemeService.js.map