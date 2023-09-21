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
define(["require", "exports", "vs/nls", "vs/base/common/keyCodes", "vs/platform/actions/common/actions", "vs/base/common/strings", "vs/platform/registry/common/platform", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/themes/common/workbenchThemeService", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/editor/common/editorService", "vs/base/common/color", "vs/platform/theme/common/theme", "vs/workbench/services/themes/common/colorThemeSchema", "vs/base/common/errors", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/themes/browser/productIconThemeData", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/async", "vs/base/common/cancellation", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables", "vs/base/common/event", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/workbench/services/themes/browser/fileIconThemeData", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/workbench/common/contributions", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/base/common/platform", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/host/browser/host"], function (require, exports, nls_1, keyCodes_1, actions_1, strings_1, platform_1, actionCommonCategories_1, workbenchThemeService_1, extensions_1, extensionManagement_1, colorRegistry_1, editorService_1, color_1, theme_1, colorThemeSchema_1, errors_1, quickInput_1, productIconThemeData_1, panecomposite_1, async_1, cancellation_1, log_1, progress_1, codicons_1, iconRegistry_1, themables_1, event_1, extensionResourceLoader_1, instantiation_1, commands_1, fileIconThemeData_1, configuration_1, dialogs_1, contributions_1, notification_1, storage_1, platform_2, telemetry_1, host_1) {
    "use strict";
    var DefaultThemeUpdatedNotificationContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.manageExtensionIcon = void 0;
    exports.manageExtensionIcon = (0, iconRegistry_1.registerIcon)('theme-selection-manage-extension', codicons_1.Codicon.gear, (0, nls_1.localize)('manageExtensionIcon', 'Icon for the \'Manage\' action in the theme selection quick pick.'));
    let MarketplaceThemesPicker = class MarketplaceThemesPicker {
        constructor(getMarketplaceColorThemes, marketplaceQuery, extensionGalleryService, extensionManagementService, quickInputService, logService, progressService, paneCompositeService, dialogService) {
            this.getMarketplaceColorThemes = getMarketplaceColorThemes;
            this.marketplaceQuery = marketplaceQuery;
            this.extensionGalleryService = extensionGalleryService;
            this.extensionManagementService = extensionManagementService;
            this.quickInputService = quickInputService;
            this.logService = logService;
            this.progressService = progressService;
            this.paneCompositeService = paneCompositeService;
            this.dialogService = dialogService;
            this._marketplaceExtensions = new Set();
            this._marketplaceThemes = [];
            this._searchOngoing = false;
            this._searchError = undefined;
            this._onDidChange = new event_1.Emitter();
            this._queryDelayer = new async_1.ThrottledDelayer(200);
            this._installedExtensions = extensionManagementService.getInstalled().then(installed => {
                const result = new Set();
                for (const ext of installed) {
                    result.add(ext.identifier.id);
                }
                return result;
            });
        }
        get themes() {
            return this._marketplaceThemes;
        }
        get onDidChange() {
            return this._onDidChange.event;
        }
        trigger(value) {
            if (this._tokenSource) {
                this._tokenSource.cancel();
                this._tokenSource = undefined;
            }
            this._queryDelayer.trigger(() => {
                this._tokenSource = new cancellation_1.CancellationTokenSource();
                return this.doSearch(value, this._tokenSource.token);
            });
        }
        async doSearch(value, token) {
            this._searchOngoing = true;
            this._onDidChange.fire();
            try {
                const installedExtensions = await this._installedExtensions;
                const options = { text: `${this.marketplaceQuery} ${value}`, pageSize: 20 };
                const pager = await this.extensionGalleryService.query(options, token);
                for (let i = 0; i < pager.total && i < 1; i++) { // loading multiple pages is turned of for now to avoid flickering
                    if (token.isCancellationRequested) {
                        break;
                    }
                    const nThemes = this._marketplaceThemes.length;
                    const gallery = i === 0 ? pager.firstPage : await pager.getPage(i, token);
                    const promises = [];
                    const promisesGalleries = [];
                    for (let i = 0; i < gallery.length; i++) {
                        if (token.isCancellationRequested) {
                            break;
                        }
                        const ext = gallery[i];
                        if (!installedExtensions.has(ext.identifier.id) && !this._marketplaceExtensions.has(ext.identifier.id)) {
                            this._marketplaceExtensions.add(ext.identifier.id);
                            promises.push(this.getMarketplaceColorThemes(ext.publisher, ext.name, ext.version));
                            promisesGalleries.push(ext);
                        }
                    }
                    const allThemes = await Promise.all(promises);
                    for (let i = 0; i < allThemes.length; i++) {
                        const ext = promisesGalleries[i];
                        for (const theme of allThemes[i]) {
                            this._marketplaceThemes.push({ id: theme.id, theme: theme, label: theme.label, description: `${ext.displayName} · ${ext.publisherDisplayName}`, galleryExtension: ext, buttons: [configureButton] });
                        }
                    }
                    if (nThemes !== this._marketplaceThemes.length) {
                        this._marketplaceThemes.sort((t1, t2) => t1.label.localeCompare(t2.label));
                        this._onDidChange.fire();
                    }
                }
            }
            catch (e) {
                if (!(0, errors_1.isCancellationError)(e)) {
                    this.logService.error(`Error while searching for themes:`, e);
                    this._searchError = 'message' in e ? e.message : String(e);
                }
            }
            finally {
                this._searchOngoing = false;
                this._onDidChange.fire();
            }
        }
        openQuickPick(value, currentTheme, selectTheme) {
            let result = undefined;
            return new Promise((s, _) => {
                const quickpick = this.quickInputService.createQuickPick();
                quickpick.items = [];
                quickpick.sortByLabel = false;
                quickpick.matchOnDescription = true;
                quickpick.buttons = [this.quickInputService.backButton];
                quickpick.title = 'Marketplace Themes';
                quickpick.placeholder = (0, nls_1.localize)('themes.selectMarketplaceTheme', "Type to Search More. Select to Install. Up/Down Keys to Preview");
                quickpick.canSelectMany = false;
                quickpick.onDidChangeValue(() => this.trigger(quickpick.value));
                quickpick.onDidAccept(async (_) => {
                    const themeItem = quickpick.selectedItems[0];
                    if (themeItem?.galleryExtension) {
                        result = 'selected';
                        quickpick.hide();
                        const success = await this.installExtension(themeItem.galleryExtension);
                        if (success) {
                            selectTheme(themeItem.theme, true);
                        }
                        else {
                            selectTheme(currentTheme, true);
                        }
                    }
                });
                quickpick.onDidTriggerItemButton(e => {
                    if (isItem(e.item)) {
                        const extensionId = e.item.theme?.extensionData?.extensionId;
                        if (extensionId) {
                            openExtensionViewlet(this.paneCompositeService, `@id:${extensionId}`);
                        }
                        else {
                            openExtensionViewlet(this.paneCompositeService, `${this.marketplaceQuery} ${quickpick.value}`);
                        }
                    }
                });
                quickpick.onDidChangeActive(themes => {
                    if (result === undefined) {
                        selectTheme(themes[0]?.theme, false);
                    }
                });
                quickpick.onDidHide(() => {
                    if (result === undefined) {
                        selectTheme(currentTheme, true);
                        result = 'cancelled';
                    }
                    quickpick.dispose();
                    s(result);
                });
                quickpick.onDidTriggerButton(e => {
                    if (e === this.quickInputService.backButton) {
                        result = 'back';
                        quickpick.hide();
                    }
                });
                this.onDidChange(() => {
                    let items = this.themes;
                    if (this._searchOngoing) {
                        items = items.concat({ label: '$(sync~spin) Searching for themes...', id: undefined, alwaysShow: true });
                    }
                    else if (items.length === 0 && this._searchError) {
                        items = [{ label: `$(error) ${(0, nls_1.localize)('search.error', 'Error while searching for themes: {0}', this._searchError)}`, id: undefined, alwaysShow: true }];
                    }
                    const activeItemId = quickpick.activeItems[0]?.id;
                    const newActiveItem = activeItemId ? items.find(i => isItem(i) && i.id === activeItemId) : undefined;
                    quickpick.items = items;
                    if (newActiveItem) {
                        quickpick.activeItems = [newActiveItem];
                    }
                });
                this.trigger(value);
                quickpick.show();
            });
        }
        async installExtension(galleryExtension) {
            openExtensionViewlet(this.paneCompositeService, `@id:${galleryExtension.identifier.id}`);
            const result = await this.dialogService.confirm({
                message: (0, nls_1.localize)('installExtension.confirm', "This will install extension '{0}' published by '{1}'. Do you want to continue?", galleryExtension.displayName, galleryExtension.publisherDisplayName),
                primaryButton: (0, nls_1.localize)('installExtension.button.ok', "OK")
            });
            if (!result.confirmed) {
                return false;
            }
            try {
                await this.progressService.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    title: (0, nls_1.localize)('installing extensions', "Installing Extension {0}...", galleryExtension.displayName)
                }, async () => {
                    await this.extensionManagementService.installFromGallery(galleryExtension, {
                        // Setting this to false is how you get the extension to be synced with Settings Sync (if enabled).
                        isMachineScoped: false,
                    });
                });
                return true;
            }
            catch (e) {
                this.logService.error(`Problem installing extension ${galleryExtension.identifier.id}`, e);
                return false;
            }
        }
        dispose() {
            if (this._tokenSource) {
                this._tokenSource.cancel();
                this._tokenSource = undefined;
            }
            this._queryDelayer.dispose();
            this._marketplaceExtensions.clear();
            this._marketplaceThemes.length = 0;
        }
    };
    MarketplaceThemesPicker = __decorate([
        __param(2, extensionManagement_1.IExtensionGalleryService),
        __param(3, extensionManagement_1.IExtensionManagementService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, log_1.ILogService),
        __param(6, progress_1.IProgressService),
        __param(7, panecomposite_1.IPaneCompositePartService),
        __param(8, dialogs_1.IDialogService)
    ], MarketplaceThemesPicker);
    let InstalledThemesPicker = class InstalledThemesPicker {
        constructor(installMessage, browseMessage, placeholderMessage, marketplaceTag, setTheme, getMarketplaceColorThemes, quickInputService, extensionGalleryService, paneCompositeService, extensionResourceLoaderService, instantiationService) {
            this.installMessage = installMessage;
            this.browseMessage = browseMessage;
            this.placeholderMessage = placeholderMessage;
            this.marketplaceTag = marketplaceTag;
            this.setTheme = setTheme;
            this.getMarketplaceColorThemes = getMarketplaceColorThemes;
            this.quickInputService = quickInputService;
            this.extensionGalleryService = extensionGalleryService;
            this.paneCompositeService = paneCompositeService;
            this.extensionResourceLoaderService = extensionResourceLoaderService;
            this.instantiationService = instantiationService;
        }
        async openQuickPick(picks, currentTheme) {
            let marketplaceThemePicker;
            if (this.extensionGalleryService.isEnabled()) {
                if (this.extensionResourceLoaderService.supportsExtensionGalleryResources && this.browseMessage) {
                    marketplaceThemePicker = this.instantiationService.createInstance(MarketplaceThemesPicker, this.getMarketplaceColorThemes.bind(this), this.marketplaceTag);
                    picks = [...configurationEntries(this.browseMessage), ...picks];
                }
                else {
                    picks = [...picks, ...configurationEntries(this.installMessage)];
                }
            }
            let selectThemeTimeout;
            const selectTheme = (theme, applyTheme) => {
                if (selectThemeTimeout) {
                    clearTimeout(selectThemeTimeout);
                }
                selectThemeTimeout = window.setTimeout(() => {
                    selectThemeTimeout = undefined;
                    const newTheme = (theme ?? currentTheme);
                    this.setTheme(newTheme, applyTheme ? 'auto' : 'preview').then(undefined, err => {
                        (0, errors_1.onUnexpectedError)(err);
                        this.setTheme(currentTheme, undefined);
                    });
                }, applyTheme ? 0 : 200);
            };
            const pickInstalledThemes = (activeItemId) => {
                return new Promise((s, _) => {
                    let isCompleted = false;
                    const autoFocusIndex = picks.findIndex(p => isItem(p) && p.id === activeItemId);
                    const quickpick = this.quickInputService.createQuickPick();
                    quickpick.items = picks;
                    quickpick.placeholder = this.placeholderMessage;
                    quickpick.activeItems = [picks[autoFocusIndex]];
                    quickpick.canSelectMany = false;
                    quickpick.matchOnDescription = true;
                    quickpick.onDidAccept(async (_) => {
                        isCompleted = true;
                        const theme = quickpick.selectedItems[0];
                        if (!theme || typeof theme.id === 'undefined') { // 'pick in marketplace' entry
                            if (marketplaceThemePicker) {
                                const res = await marketplaceThemePicker.openQuickPick(quickpick.value, currentTheme, selectTheme);
                                if (res === 'back') {
                                    await pickInstalledThemes(undefined);
                                }
                            }
                            else {
                                openExtensionViewlet(this.paneCompositeService, `${this.marketplaceTag} ${quickpick.value}`);
                            }
                        }
                        else {
                            selectTheme(theme.theme, true);
                        }
                        quickpick.hide();
                        s();
                    });
                    quickpick.onDidChangeActive(themes => selectTheme(themes[0]?.theme, false));
                    quickpick.onDidHide(() => {
                        if (!isCompleted) {
                            selectTheme(currentTheme, true);
                            s();
                        }
                        quickpick.dispose();
                    });
                    quickpick.onDidTriggerItemButton(e => {
                        if (isItem(e.item)) {
                            const extensionId = e.item.theme?.extensionData?.extensionId;
                            if (extensionId) {
                                openExtensionViewlet(this.paneCompositeService, `@id:${extensionId}`);
                            }
                            else {
                                openExtensionViewlet(this.paneCompositeService, `${this.marketplaceTag} ${quickpick.value}`);
                            }
                        }
                    });
                    quickpick.show();
                });
            };
            await pickInstalledThemes(currentTheme.id);
            marketplaceThemePicker?.dispose();
        }
    };
    InstalledThemesPicker = __decorate([
        __param(6, quickInput_1.IQuickInputService),
        __param(7, extensionManagement_1.IExtensionGalleryService),
        __param(8, panecomposite_1.IPaneCompositePartService),
        __param(9, extensionResourceLoader_1.IExtensionResourceLoaderService),
        __param(10, instantiation_1.IInstantiationService)
    ], InstalledThemesPicker);
    const SelectColorThemeCommandId = 'workbench.action.selectTheme';
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: SelectColorThemeCommandId,
                title: { value: (0, nls_1.localize)('selectTheme.label', "Color Theme"), original: 'Color Theme' },
                category: actionCommonCategories_1.Categories.Preferences,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 50 /* KeyCode.KeyT */)
                }
            });
        }
        async run(accessor) {
            const themeService = accessor.get(workbenchThemeService_1.IWorkbenchThemeService);
            const installMessage = (0, nls_1.localize)('installColorThemes', "Install Additional Color Themes...");
            const browseMessage = '$(plus) ' + (0, nls_1.localize)('browseColorThemes', "Browse Additional Color Themes...");
            const placeholderMessage = (0, nls_1.localize)('themes.selectTheme', "Select Color Theme (Up/Down Keys to Preview)");
            const marketplaceTag = 'category:themes';
            const setTheme = (theme, settingsTarget) => themeService.setColorTheme(theme, settingsTarget);
            const getMarketplaceColorThemes = (publisher, name, version) => themeService.getMarketplaceColorThemes(publisher, name, version);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const picker = instantiationService.createInstance(InstalledThemesPicker, installMessage, browseMessage, placeholderMessage, marketplaceTag, setTheme, getMarketplaceColorThemes);
            const themes = await themeService.getColorThemes();
            const currentTheme = themeService.getColorTheme();
            const picks = [
                ...toEntries(themes.filter(t => t.type === theme_1.ColorScheme.LIGHT), (0, nls_1.localize)('themes.category.light', "light themes")),
                ...toEntries(themes.filter(t => t.type === theme_1.ColorScheme.DARK), (0, nls_1.localize)('themes.category.dark', "dark themes")),
                ...toEntries(themes.filter(t => (0, theme_1.isHighContrast)(t.type)), (0, nls_1.localize)('themes.category.hc', "high contrast themes")),
            ];
            await picker.openQuickPick(picks, currentTheme);
        }
    });
    const SelectFileIconThemeCommandId = 'workbench.action.selectIconTheme';
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: SelectFileIconThemeCommandId,
                title: { value: (0, nls_1.localize)('selectIconTheme.label', "File Icon Theme"), original: 'File Icon Theme' },
                category: actionCommonCategories_1.Categories.Preferences,
                f1: true
            });
        }
        async run(accessor) {
            const themeService = accessor.get(workbenchThemeService_1.IWorkbenchThemeService);
            const installMessage = (0, nls_1.localize)('installIconThemes', "Install Additional File Icon Themes...");
            const placeholderMessage = (0, nls_1.localize)('themes.selectIconTheme', "Select File Icon Theme (Up/Down Keys to Preview)");
            const marketplaceTag = 'tag:icon-theme';
            const setTheme = (theme, settingsTarget) => themeService.setFileIconTheme(theme, settingsTarget);
            const getMarketplaceColorThemes = (publisher, name, version) => themeService.getMarketplaceFileIconThemes(publisher, name, version);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const picker = instantiationService.createInstance(InstalledThemesPicker, installMessage, undefined, placeholderMessage, marketplaceTag, setTheme, getMarketplaceColorThemes);
            const picks = [
                { type: 'separator', label: (0, nls_1.localize)('fileIconThemeCategory', 'file icon themes') },
                { id: '', theme: fileIconThemeData_1.FileIconThemeData.noIconTheme, label: (0, nls_1.localize)('noIconThemeLabel', 'None'), description: (0, nls_1.localize)('noIconThemeDesc', 'Disable File Icons') },
                ...toEntries(await themeService.getFileIconThemes()),
            ];
            await picker.openQuickPick(picks, themeService.getFileIconTheme());
        }
    });
    const SelectProductIconThemeCommandId = 'workbench.action.selectProductIconTheme';
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: SelectProductIconThemeCommandId,
                title: { value: (0, nls_1.localize)('selectProductIconTheme.label', "Product Icon Theme"), original: 'Product Icon Theme' },
                category: actionCommonCategories_1.Categories.Preferences,
                f1: true
            });
        }
        async run(accessor) {
            const themeService = accessor.get(workbenchThemeService_1.IWorkbenchThemeService);
            const installMessage = (0, nls_1.localize)('installProductIconThemes', "Install Additional Product Icon Themes...");
            const browseMessage = '$(plus) ' + (0, nls_1.localize)('browseProductIconThemes', "Browse Additional Product Icon Themes...");
            const placeholderMessage = (0, nls_1.localize)('themes.selectProductIconTheme', "Select Product Icon Theme (Up/Down Keys to Preview)");
            const marketplaceTag = 'tag:product-icon-theme';
            const setTheme = (theme, settingsTarget) => themeService.setProductIconTheme(theme, settingsTarget);
            const getMarketplaceColorThemes = (publisher, name, version) => themeService.getMarketplaceProductIconThemes(publisher, name, version);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const picker = instantiationService.createInstance(InstalledThemesPicker, installMessage, browseMessage, placeholderMessage, marketplaceTag, setTheme, getMarketplaceColorThemes);
            const picks = [
                { type: 'separator', label: (0, nls_1.localize)('productIconThemeCategory', 'product icon themes') },
                { id: productIconThemeData_1.DEFAULT_PRODUCT_ICON_THEME_ID, theme: productIconThemeData_1.ProductIconThemeData.defaultTheme, label: (0, nls_1.localize)('defaultProductIconThemeLabel', 'Default') },
                ...toEntries(await themeService.getProductIconThemes()),
            ];
            await picker.openQuickPick(picks, themeService.getProductIconTheme());
        }
    });
    commands_1.CommandsRegistry.registerCommand('workbench.action.previewColorTheme', async function (accessor, extension, themeSettingsId) {
        const themeService = accessor.get(workbenchThemeService_1.IWorkbenchThemeService);
        let themes = findBuiltInThemes(await themeService.getColorThemes(), extension);
        if (themes.length === 0) {
            themes = await themeService.getMarketplaceColorThemes(extension.publisher, extension.name, extension.version);
        }
        for (const theme of themes) {
            if (!themeSettingsId || theme.settingsId === themeSettingsId) {
                await themeService.setColorTheme(theme, 'preview');
                return theme.settingsId;
            }
        }
        return undefined;
    });
    function findBuiltInThemes(themes, extension) {
        return themes.filter(({ extensionData }) => extensionData && extensionData.extensionIsBuiltin && (0, strings_1.equalsIgnoreCase)(extensionData.extensionPublisher, extension.publisher) && (0, strings_1.equalsIgnoreCase)(extensionData.extensionName, extension.name));
    }
    function configurationEntries(label) {
        return [
            {
                type: 'separator'
            },
            {
                id: undefined,
                label: label,
                alwaysShow: true,
                buttons: [configureButton]
            }
        ];
    }
    function openExtensionViewlet(paneCompositeService, query) {
        return paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true).then(viewlet => {
            if (viewlet) {
                (viewlet?.getViewPaneContainer()).search(query);
                viewlet.focus();
            }
        });
    }
    function isItem(i) {
        return i['type'] !== 'separator';
    }
    function toEntry(theme) {
        const settingId = theme.settingsId ?? undefined;
        const item = {
            id: theme.id,
            theme: theme,
            label: theme.label,
            description: theme.description || (theme.label === settingId ? undefined : settingId),
        };
        if (theme.extensionData) {
            item.buttons = [configureButton];
        }
        return item;
    }
    function toEntries(themes, label) {
        const sorter = (t1, t2) => t1.label.localeCompare(t2.label);
        const entries = themes.map(toEntry).sort(sorter);
        if (entries.length > 0 && label) {
            entries.unshift({ type: 'separator', label });
        }
        return entries;
    }
    const configureButton = {
        iconClass: themables_1.ThemeIcon.asClassName(exports.manageExtensionIcon),
        tooltip: (0, nls_1.localize)('manage extension', "Manage Extension"),
    };
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.generateColorTheme',
                title: { value: (0, nls_1.localize)('generateColorTheme.label', "Generate Color Theme From Current Settings"), original: 'Generate Color Theme From Current Settings' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run(accessor) {
            const themeService = accessor.get(workbenchThemeService_1.IWorkbenchThemeService);
            const theme = themeService.getColorTheme();
            const colors = platform_1.Registry.as(colorRegistry_1.Extensions.ColorContribution).getColors();
            const colorIds = colors.map(c => c.id).sort();
            const resultingColors = {};
            const inherited = [];
            for (const colorId of colorIds) {
                const color = theme.getColor(colorId, false);
                if (color) {
                    resultingColors[colorId] = color_1.Color.Format.CSS.formatHexA(color, true);
                }
                else {
                    inherited.push(colorId);
                }
            }
            const nullDefaults = [];
            for (const id of inherited) {
                const color = theme.getColor(id);
                if (color) {
                    resultingColors['__' + id] = color_1.Color.Format.CSS.formatHexA(color, true);
                }
                else {
                    nullDefaults.push(id);
                }
            }
            for (const id of nullDefaults) {
                resultingColors['__' + id] = null;
            }
            let contents = JSON.stringify({
                '$schema': colorThemeSchema_1.colorThemeSchemaId,
                type: theme.type,
                colors: resultingColors,
                tokenColors: theme.tokenColors.filter(t => !!t.scope)
            }, null, '\t');
            contents = contents.replace(/\"__/g, '//"');
            const editorService = accessor.get(editorService_1.IEditorService);
            return editorService.openEditor({ resource: undefined, contents, languageId: 'jsonc', options: { pinned: true } });
        }
    });
    const toggleLightDarkThemesCommandId = 'workbench.action.toggleLightDarkThemes';
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: toggleLightDarkThemesCommandId,
                title: { value: (0, nls_1.localize)('toggleLightDarkThemes.label', "Toggle between Light/Dark Themes"), original: 'Toggle between Light/Dark Themes' },
                category: actionCommonCategories_1.Categories.Preferences,
                f1: true,
            });
        }
        async run(accessor) {
            const themeService = accessor.get(workbenchThemeService_1.IWorkbenchThemeService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const currentTheme = themeService.getColorTheme();
            let newSettingsId = workbenchThemeService_1.ThemeSettings.PREFERRED_DARK_THEME;
            switch (currentTheme.type) {
                case theme_1.ColorScheme.LIGHT:
                    newSettingsId = workbenchThemeService_1.ThemeSettings.PREFERRED_DARK_THEME;
                    break;
                case theme_1.ColorScheme.DARK:
                    newSettingsId = workbenchThemeService_1.ThemeSettings.PREFERRED_LIGHT_THEME;
                    break;
                case theme_1.ColorScheme.HIGH_CONTRAST_LIGHT:
                    newSettingsId = workbenchThemeService_1.ThemeSettings.PREFERRED_HC_DARK_THEME;
                    break;
                case theme_1.ColorScheme.HIGH_CONTRAST_DARK:
                    newSettingsId = workbenchThemeService_1.ThemeSettings.PREFERRED_HC_LIGHT_THEME;
                    break;
            }
            const themeSettingId = configurationService.getValue(newSettingsId);
            if (themeSettingId && typeof themeSettingId === 'string') {
                const theme = (await themeService.getColorThemes()).find(t => t.settingsId === themeSettingId);
                if (theme) {
                    themeService.setColorTheme(theme.id, 'auto');
                }
            }
        }
    });
    const browseColorThemesInMarketplaceCommandId = 'workbench.action.browseColorThemesInMarketplace';
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: browseColorThemesInMarketplaceCommandId,
                title: { value: (0, nls_1.localize)('browseColorThemeInMarketPlace.label', "Browse Color Themes in Marketplace"), original: 'Browse Color Themes in Marketplace' },
                category: actionCommonCategories_1.Categories.Preferences,
                f1: true,
            });
        }
        async run(accessor) {
            const marketplaceTag = 'category:themes';
            const themeService = accessor.get(workbenchThemeService_1.IWorkbenchThemeService);
            const extensionGalleryService = accessor.get(extensionManagement_1.IExtensionGalleryService);
            const extensionResourceLoaderService = accessor.get(extensionResourceLoader_1.IExtensionResourceLoaderService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            if (!extensionGalleryService.isEnabled() || !extensionResourceLoaderService.supportsExtensionGalleryResources) {
                return;
            }
            const currentTheme = themeService.getColorTheme();
            const getMarketplaceColorThemes = (publisher, name, version) => themeService.getMarketplaceColorThemes(publisher, name, version);
            let selectThemeTimeout;
            const selectTheme = (theme, applyTheme) => {
                if (selectThemeTimeout) {
                    clearTimeout(selectThemeTimeout);
                }
                selectThemeTimeout = window.setTimeout(() => {
                    selectThemeTimeout = undefined;
                    const newTheme = (theme ?? currentTheme);
                    themeService.setColorTheme(newTheme, applyTheme ? 'auto' : 'preview').then(undefined, err => {
                        (0, errors_1.onUnexpectedError)(err);
                        themeService.setColorTheme(currentTheme, undefined);
                    });
                }, applyTheme ? 0 : 200);
            };
            const marketplaceThemePicker = instantiationService.createInstance(MarketplaceThemesPicker, getMarketplaceColorThemes, marketplaceTag);
            await marketplaceThemePicker.openQuickPick('', themeService.getColorTheme(), selectTheme).then(undefined, errors_1.onUnexpectedError);
        }
    });
    const ThemesSubMenu = new actions_1.MenuId('ThemesSubMenu');
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
        title: (0, nls_1.localize)('themes', "Themes"),
        submenu: ThemesSubMenu,
        group: '2_configuration',
        order: 7
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarPreferencesMenu, {
        title: (0, nls_1.localize)({ key: 'miSelectTheme', comment: ['&& denotes a mnemonic'] }, "&&Theme"),
        submenu: ThemesSubMenu,
        group: '2_configuration',
        order: 7
    });
    actions_1.MenuRegistry.appendMenuItem(ThemesSubMenu, {
        command: {
            id: SelectColorThemeCommandId,
            title: (0, nls_1.localize)('selectTheme.label', "Color Theme")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(ThemesSubMenu, {
        command: {
            id: SelectFileIconThemeCommandId,
            title: (0, nls_1.localize)('themes.selectIconTheme.label', "File Icon Theme")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(ThemesSubMenu, {
        command: {
            id: SelectProductIconThemeCommandId,
            title: (0, nls_1.localize)('themes.selectProductIconTheme.label', "Product Icon Theme")
        },
        order: 3
    });
    let DefaultThemeUpdatedNotificationContribution = class DefaultThemeUpdatedNotificationContribution {
        static { DefaultThemeUpdatedNotificationContribution_1 = this; }
        static { this.STORAGE_KEY = 'themeUpdatedNotificationShown'; }
        constructor(_notificationService, _workbenchThemeService, _storageService, _commandService, _telemetryService, _hostService) {
            this._notificationService = _notificationService;
            this._workbenchThemeService = _workbenchThemeService;
            this._storageService = _storageService;
            this._commandService = _commandService;
            this._telemetryService = _telemetryService;
            this._hostService = _hostService;
            if (_storageService.getBoolean(DefaultThemeUpdatedNotificationContribution_1.STORAGE_KEY, -1 /* StorageScope.APPLICATION */)) {
                return;
            }
            setTimeout(async () => {
                if (_storageService.getBoolean(DefaultThemeUpdatedNotificationContribution_1.STORAGE_KEY, -1 /* StorageScope.APPLICATION */)) {
                    return;
                }
                if (await this._hostService.hadLastFocus()) {
                    this._storageService.store(DefaultThemeUpdatedNotificationContribution_1.STORAGE_KEY, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    if (this._workbenchThemeService.hasUpdatedDefaultThemes()) {
                        this._showYouGotMigratedNotification();
                    }
                    else {
                        const currentTheme = this._workbenchThemeService.getColorTheme().settingsId;
                        if (currentTheme === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT_OLD || currentTheme === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK_OLD) {
                            this._tryNewThemeNotification();
                        }
                    }
                }
            }, 3000);
        }
        async _showYouGotMigratedNotification() {
            const usingLight = this._workbenchThemeService.getColorTheme().type === theme_1.ColorScheme.LIGHT;
            const newThemeSettingsId = usingLight ? workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT : workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK;
            const newTheme = (await this._workbenchThemeService.getColorThemes()).find(theme => theme.settingsId === newThemeSettingsId);
            if (newTheme) {
                const choices = [
                    {
                        label: (0, nls_1.localize)('button.keep', "Keep New Theme"),
                        run: () => {
                            this._writeTelemetry('keepNew');
                        }
                    },
                    {
                        label: (0, nls_1.localize)('button.browse', "Browse Themes"),
                        run: () => {
                            this._writeTelemetry('browse');
                            this._commandService.executeCommand(SelectColorThemeCommandId);
                        }
                    },
                    {
                        label: (0, nls_1.localize)('button.revert', "Revert"),
                        run: async () => {
                            this._writeTelemetry('keepOld');
                            const oldSettingsId = usingLight ? workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT_OLD : workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK_OLD;
                            const oldTheme = (await this._workbenchThemeService.getColorThemes()).find(theme => theme.settingsId === oldSettingsId);
                            if (oldTheme) {
                                this._workbenchThemeService.setColorTheme(oldTheme, 'auto');
                            }
                        }
                    }
                ];
                await this._notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)({ key: 'themeUpdatedNotification', comment: ['{0} is the name of the new default theme'] }, "Visual Studio Code now ships with a new default theme '{0}'. If you prefer, you can switch back to the old theme or try one of the many other color themes available.", newTheme.label), choices, {
                    onCancel: () => this._writeTelemetry('cancel')
                });
            }
        }
        async _tryNewThemeNotification() {
            const newThemeSettingsId = this._workbenchThemeService.getColorTheme().type === theme_1.ColorScheme.LIGHT ? workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT : workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK;
            const theme = (await this._workbenchThemeService.getColorThemes()).find(theme => theme.settingsId === newThemeSettingsId);
            if (theme) {
                const choices = [{
                        label: (0, nls_1.localize)('button.tryTheme', "Try New Theme"),
                        run: () => {
                            this._writeTelemetry('tryNew');
                            this._workbenchThemeService.setColorTheme(theme, 'auto');
                        }
                    },
                    {
                        label: (0, nls_1.localize)('button.cancel', "Cancel"),
                        run: () => {
                            this._writeTelemetry('cancel');
                        }
                    }];
                await this._notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)({ key: 'newThemeNotification', comment: ['{0} is the name of the new default theme'] }, "Visual Studio Code now ships with a new default theme '{0}'. Do you want to give it a try?", theme.label), choices, { onCancel: () => this._writeTelemetry('cancel') });
            }
        }
        _writeTelemetry(outcome) {
            this._telemetryService.publicLog2('themeUpdatedNotication', {
                web: platform_2.isWeb,
                reaction: outcome
            });
        }
    };
    DefaultThemeUpdatedNotificationContribution = DefaultThemeUpdatedNotificationContribution_1 = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, workbenchThemeService_1.IWorkbenchThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, commands_1.ICommandService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, host_1.IHostService)
    ], DefaultThemeUpdatedNotificationContribution);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(DefaultThemeUpdatedNotificationContribution, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWVzLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3RoZW1lcy9icm93c2VyL3RoZW1lcy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTRDbkYsUUFBQSxtQkFBbUIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsa0NBQWtDLEVBQUUsa0JBQU8sQ0FBQyxJQUFJLEVBQUUsSUFBQSxjQUFRLEVBQUMscUJBQXFCLEVBQUUsbUVBQW1FLENBQUMsQ0FBQyxDQUFDO0lBSXhNLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXVCO1FBWTVCLFlBQ2tCLHlCQUEyRyxFQUMzRyxnQkFBd0IsRUFFZix1QkFBa0UsRUFDL0QsMEJBQXdFLEVBQ2pGLGlCQUFzRCxFQUM3RCxVQUF3QyxFQUNuQyxlQUFrRCxFQUN6QyxvQkFBZ0UsRUFDM0UsYUFBOEM7WUFUN0MsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFrRjtZQUMzRyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQVE7WUFFRSw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQzlDLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDaEUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUM1QyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ2xCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUN4Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQTJCO1lBQzFELGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQXBCOUMsMkJBQXNCLEdBQWdCLElBQUksR0FBRyxFQUFFLENBQUM7WUFDaEQsdUJBQWtCLEdBQWdCLEVBQUUsQ0FBQztZQUU5QyxtQkFBYyxHQUFZLEtBQUssQ0FBQztZQUNoQyxpQkFBWSxHQUF1QixTQUFTLENBQUM7WUFDcEMsaUJBQVks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