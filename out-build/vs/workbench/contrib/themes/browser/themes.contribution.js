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
define(["require", "exports", "vs/nls!vs/workbench/contrib/themes/browser/themes.contribution", "vs/base/common/keyCodes", "vs/platform/actions/common/actions", "vs/base/common/strings", "vs/platform/registry/common/platform", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/themes/common/workbenchThemeService", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/editor/common/editorService", "vs/base/common/color", "vs/platform/theme/common/theme", "vs/workbench/services/themes/common/colorThemeSchema", "vs/base/common/errors", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/themes/browser/productIconThemeData", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/async", "vs/base/common/cancellation", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables", "vs/base/common/event", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/workbench/services/themes/browser/fileIconThemeData", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/workbench/common/contributions", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/base/common/platform", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/host/browser/host"], function (require, exports, nls_1, keyCodes_1, actions_1, strings_1, platform_1, actionCommonCategories_1, workbenchThemeService_1, extensions_1, extensionManagement_1, colorRegistry_1, editorService_1, color_1, theme_1, colorThemeSchema_1, errors_1, quickInput_1, productIconThemeData_1, panecomposite_1, async_1, cancellation_1, log_1, progress_1, codicons_1, iconRegistry_1, themables_1, event_1, extensionResourceLoader_1, instantiation_1, commands_1, fileIconThemeData_1, configuration_1, dialogs_1, contributions_1, notification_1, storage_1, platform_2, telemetry_1, host_1) {
    "use strict";
    var DefaultThemeUpdatedNotificationContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qYb = void 0;
    exports.$qYb = (0, iconRegistry_1.$9u)('theme-selection-manage-extension', codicons_1.$Pj.gear, (0, nls_1.localize)(0, null));
    let MarketplaceThemesPicker = class MarketplaceThemesPicker {
        constructor(l, m, n, o, q, r, u, v, w) {
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.q = q;
            this.r = r;
            this.u = u;
            this.v = v;
            this.w = w;
            this.b = new Set();
            this.d = [];
            this.f = false;
            this.g = undefined;
            this.h = new event_1.$fd();
            this.k = new async_1.$Eg(200);
            this.a = o.getInstalled().then(installed => {
                const result = new Set();
                for (const ext of installed) {
                    result.add(ext.identifier.id);
                }
                return result;
            });
        }
        get themes() {
            return this.d;
        }
        get onDidChange() {
            return this.h.event;
        }
        trigger(value) {
            if (this.j) {
                this.j.cancel();
                this.j = undefined;
            }
            this.k.trigger(() => {
                this.j = new cancellation_1.$pd();
                return this.x(value, this.j.token);
            });
        }
        async x(value, token) {
            this.f = true;
            this.h.fire();
            try {
                const installedExtensions = await this.a;
                const options = { text: `${this.m} ${value}`, pageSize: 20 };
                const pager = await this.n.query(options, token);
                for (let i = 0; i < pager.total && i < 1; i++) { // loading multiple pages is turned of for now to avoid flickering
                    if (token.isCancellationRequested) {
                        break;
                    }
                    const nThemes = this.d.length;
                    const gallery = i === 0 ? pager.firstPage : await pager.getPage(i, token);
                    const promises = [];
                    const promisesGalleries = [];
                    for (let i = 0; i < gallery.length; i++) {
                        if (token.isCancellationRequested) {
                            break;
                        }
                        const ext = gallery[i];
                        if (!installedExtensions.has(ext.identifier.id) && !this.b.has(ext.identifier.id)) {
                            this.b.add(ext.identifier.id);
                            promises.push(this.l(ext.publisher, ext.name, ext.version));
                            promisesGalleries.push(ext);
                        }
                    }
                    const allThemes = await Promise.all(promises);
                    for (let i = 0; i < allThemes.length; i++) {
                        const ext = promisesGalleries[i];
                        for (const theme of allThemes[i]) {
                            this.d.push({ id: theme.id, theme: theme, label: theme.label, description: `${ext.displayName} · ${ext.publisherDisplayName}`, galleryExtension: ext, buttons: [configureButton] });
                        }
                    }
                    if (nThemes !== this.d.length) {
                        this.d.sort((t1, t2) => t1.label.localeCompare(t2.label));
                        this.h.fire();
                    }
                }
            }
            catch (e) {
                if (!(0, errors_1.$2)(e)) {
                    this.r.error(`Error while searching for themes:`, e);
                    this.g = 'message' in e ? e.message : String(e);
                }
            }
            finally {
                this.f = false;
                this.h.fire();
            }
        }
        openQuickPick(value, currentTheme, selectTheme) {
            let result = undefined;
            return new Promise((s, _) => {
                const quickpick = this.q.createQuickPick();
                quickpick.items = [];
                quickpick.sortByLabel = false;
                quickpick.matchOnDescription = true;
                quickpick.buttons = [this.q.backButton];
                quickpick.title = 'Marketplace Themes';
                quickpick.placeholder = (0, nls_1.localize)(1, null);
                quickpick.canSelectMany = false;
                quickpick.onDidChangeValue(() => this.trigger(quickpick.value));
                quickpick.onDidAccept(async (_) => {
                    const themeItem = quickpick.selectedItems[0];
                    if (themeItem?.galleryExtension) {
                        result = 'selected';
                        quickpick.hide();
                        const success = await this.y(themeItem.galleryExtension);
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
                            openExtensionViewlet(this.v, `@id:${extensionId}`);
                        }
                        else {
                            openExtensionViewlet(this.v, `${this.m} ${quickpick.value}`);
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
                    if (e === this.q.backButton) {
                        result = 'back';
                        quickpick.hide();
                    }
                });
                this.onDidChange(() => {
                    let items = this.themes;
                    if (this.f) {
                        items = items.concat({ label: '$(sync~spin) Searching for themes...', id: undefined, alwaysShow: true });
                    }
                    else if (items.length === 0 && this.g) {
                        items = [{ label: `$(error) ${(0, nls_1.localize)(2, null, this.g)}`, id: undefined, alwaysShow: true }];
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
        async y(galleryExtension) {
            openExtensionViewlet(this.v, `@id:${galleryExtension.identifier.id}`);
            const result = await this.w.confirm({
                message: (0, nls_1.localize)(3, null, galleryExtension.displayName, galleryExtension.publisherDisplayName),
                primaryButton: (0, nls_1.localize)(4, null)
            });
            if (!result.confirmed) {
                return false;
            }
            try {
                await this.u.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    title: (0, nls_1.localize)(5, null, galleryExtension.displayName)
                }, async () => {
                    await this.o.installFromGallery(galleryExtension, {
                        // Setting this to false is how you get the extension to be synced with Settings Sync (if enabled).
                        isMachineScoped: false,
                    });
                });
                return true;
            }
            catch (e) {
                this.r.error(`Problem installing extension ${galleryExtension.identifier.id}`, e);
                return false;
            }
        }
        dispose() {
            if (this.j) {
                this.j.cancel();
                this.j = undefined;
            }
            this.k.dispose();
            this.b.clear();
            this.d.length = 0;
        }
    };
    MarketplaceThemesPicker = __decorate([
        __param(2, extensionManagement_1.$Zn),
        __param(3, extensionManagement_1.$2n),
        __param(4, quickInput_1.$Gq),
        __param(5, log_1.$5i),
        __param(6, progress_1.$2u),
        __param(7, panecomposite_1.$Yeb),
        __param(8, dialogs_1.$oA)
    ], MarketplaceThemesPicker);
    let InstalledThemesPicker = class InstalledThemesPicker {
        constructor(a, b, d, f, g, h, j, k, l, m, n) {
            this.a = a;
            this.b = b;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
        }
        async openQuickPick(picks, currentTheme) {
            let marketplaceThemePicker;
            if (this.k.isEnabled()) {
                if (this.m.supportsExtensionGalleryResources && this.b) {
                    marketplaceThemePicker = this.n.createInstance(MarketplaceThemesPicker, this.h.bind(this), this.f);
                    picks = [...configurationEntries(this.b), ...picks];
                }
                else {
                    picks = [...picks, ...configurationEntries(this.a)];
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
                    this.g(newTheme, applyTheme ? 'auto' : 'preview').then(undefined, err => {
                        (0, errors_1.$Y)(err);
                        this.g(currentTheme, undefined);
                    });
                }, applyTheme ? 0 : 200);
            };
            const pickInstalledThemes = (activeItemId) => {
                return new Promise((s, _) => {
                    let isCompleted = false;
                    const autoFocusIndex = picks.findIndex(p => isItem(p) && p.id === activeItemId);
                    const quickpick = this.j.createQuickPick();
                    quickpick.items = picks;
                    quickpick.placeholder = this.d;
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
                                openExtensionViewlet(this.l, `${this.f} ${quickpick.value}`);
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
                                openExtensionViewlet(this.l, `@id:${extensionId}`);
                            }
                            else {
                                openExtensionViewlet(this.l, `${this.f} ${quickpick.value}`);
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
        __param(6, quickInput_1.$Gq),
        __param(7, extensionManagement_1.$Zn),
        __param(8, panecomposite_1.$Yeb),
        __param(9, extensionResourceLoader_1.$2$),
        __param(10, instantiation_1.$Ah)
    ], InstalledThemesPicker);
    const SelectColorThemeCommandId = 'workbench.action.selectTheme';
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: SelectColorThemeCommandId,
                title: { value: (0, nls_1.localize)(6, null), original: 'Color Theme' },
                category: actionCommonCategories_1.$Nl.Preferences,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 50 /* KeyCode.KeyT */)
                }
            });
        }
        async run(accessor) {
            const themeService = accessor.get(workbenchThemeService_1.$egb);
            const installMessage = (0, nls_1.localize)(7, null);
            const browseMessage = '$(plus) ' + (0, nls_1.localize)(8, null);
            const placeholderMessage = (0, nls_1.localize)(9, null);
            const marketplaceTag = 'category:themes';
            const setTheme = (theme, settingsTarget) => themeService.setColorTheme(theme, settingsTarget);
            const getMarketplaceColorThemes = (publisher, name, version) => themeService.getMarketplaceColorThemes(publisher, name, version);
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const picker = instantiationService.createInstance(InstalledThemesPicker, installMessage, browseMessage, placeholderMessage, marketplaceTag, setTheme, getMarketplaceColorThemes);
            const themes = await themeService.getColorThemes();
            const currentTheme = themeService.getColorTheme();
            const picks = [
                ...toEntries(themes.filter(t => t.type === theme_1.ColorScheme.LIGHT), (0, nls_1.localize)(10, null)),
                ...toEntries(themes.filter(t => t.type === theme_1.ColorScheme.DARK), (0, nls_1.localize)(11, null)),
                ...toEntries(themes.filter(t => (0, theme_1.$ev)(t.type)), (0, nls_1.localize)(12, null)),
            ];
            await picker.openQuickPick(picks, currentTheme);
        }
    });
    const SelectFileIconThemeCommandId = 'workbench.action.selectIconTheme';
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: SelectFileIconThemeCommandId,
                title: { value: (0, nls_1.localize)(13, null), original: 'File Icon Theme' },
                category: actionCommonCategories_1.$Nl.Preferences,
                f1: true
            });
        }
        async run(accessor) {
            const themeService = accessor.get(workbenchThemeService_1.$egb);
            const installMessage = (0, nls_1.localize)(14, null);
            const placeholderMessage = (0, nls_1.localize)(15, null);
            const marketplaceTag = 'tag:icon-theme';
            const setTheme = (theme, settingsTarget) => themeService.setFileIconTheme(theme, settingsTarget);
            const getMarketplaceColorThemes = (publisher, name, version) => themeService.getMarketplaceFileIconThemes(publisher, name, version);
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const picker = instantiationService.createInstance(InstalledThemesPicker, installMessage, undefined, placeholderMessage, marketplaceTag, setTheme, getMarketplaceColorThemes);
            const picks = [
                { type: 'separator', label: (0, nls_1.localize)(16, null) },
                { id: '', theme: fileIconThemeData_1.$nzb.noIconTheme, label: (0, nls_1.localize)(17, null), description: (0, nls_1.localize)(18, null) },
                ...toEntries(await themeService.getFileIconThemes()),
            ];
            await picker.openQuickPick(picks, themeService.getFileIconTheme());
        }
    });
    const SelectProductIconThemeCommandId = 'workbench.action.selectProductIconTheme';
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: SelectProductIconThemeCommandId,
                title: { value: (0, nls_1.localize)(19, null), original: 'Product Icon Theme' },
                category: actionCommonCategories_1.$Nl.Preferences,
                f1: true
            });
        }
        async run(accessor) {
            const themeService = accessor.get(workbenchThemeService_1.$egb);
            const installMessage = (0, nls_1.localize)(20, null);
            const browseMessage = '$(plus) ' + (0, nls_1.localize)(21, null);
            const placeholderMessage = (0, nls_1.localize)(22, null);
            const marketplaceTag = 'tag:product-icon-theme';
            const setTheme = (theme, settingsTarget) => themeService.setProductIconTheme(theme, settingsTarget);
            const getMarketplaceColorThemes = (publisher, name, version) => themeService.getMarketplaceProductIconThemes(publisher, name, version);
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const picker = instantiationService.createInstance(InstalledThemesPicker, installMessage, browseMessage, placeholderMessage, marketplaceTag, setTheme, getMarketplaceColorThemes);
            const picks = [
                { type: 'separator', label: (0, nls_1.localize)(23, null) },
                { id: productIconThemeData_1.$tzb, theme: productIconThemeData_1.$uzb.defaultTheme, label: (0, nls_1.localize)(24, null) },
                ...toEntries(await themeService.getProductIconThemes()),
            ];
            await picker.openQuickPick(picks, themeService.getProductIconTheme());
        }
    });
    commands_1.$Gr.registerCommand('workbench.action.previewColorTheme', async function (accessor, extension, themeSettingsId) {
        const themeService = accessor.get(workbenchThemeService_1.$egb);
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
        return themes.filter(({ extensionData }) => extensionData && extensionData.extensionIsBuiltin && (0, strings_1.$Me)(extensionData.extensionPublisher, extension.publisher) && (0, strings_1.$Me)(extensionData.extensionName, extension.name));
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
        return paneCompositeService.openPaneComposite(extensions_1.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true).then(viewlet => {
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
        iconClass: themables_1.ThemeIcon.asClassName(exports.$qYb),
        tooltip: (0, nls_1.localize)(25, null),
    };
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.generateColorTheme',
                title: { value: (0, nls_1.localize)(26, null), original: 'Generate Color Theme From Current Settings' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run(accessor) {
            const themeService = accessor.get(workbenchThemeService_1.$egb);
            const theme = themeService.getColorTheme();
            const colors = platform_1.$8m.as(colorRegistry_1.$rv.ColorContribution).getColors();
            const colorIds = colors.map(c => c.id).sort();
            const resultingColors = {};
            const inherited = [];
            for (const colorId of colorIds) {
                const color = theme.getColor(colorId, false);
                if (color) {
                    resultingColors[colorId] = color_1.$Os.Format.CSS.formatHexA(color, true);
                }
                else {
                    inherited.push(colorId);
                }
            }
            const nullDefaults = [];
            for (const id of inherited) {
                const color = theme.getColor(id);
                if (color) {
                    resultingColors['__' + id] = color_1.$Os.Format.CSS.formatHexA(color, true);
                }
                else {
                    nullDefaults.push(id);
                }
            }
            for (const id of nullDefaults) {
                resultingColors['__' + id] = null;
            }
            let contents = JSON.stringify({
                '$schema': colorThemeSchema_1.$_yb,
                type: theme.type,
                colors: resultingColors,
                tokenColors: theme.tokenColors.filter(t => !!t.scope)
            }, null, '\t');
            contents = contents.replace(/\"__/g, '//"');
            const editorService = accessor.get(editorService_1.$9C);
            return editorService.openEditor({ resource: undefined, contents, languageId: 'jsonc', options: { pinned: true } });
        }
    });
    const toggleLightDarkThemesCommandId = 'workbench.action.toggleLightDarkThemes';
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: toggleLightDarkThemesCommandId,
                title: { value: (0, nls_1.localize)(27, null), original: 'Toggle between Light/Dark Themes' },
                category: actionCommonCategories_1.$Nl.Preferences,
                f1: true,
            });
        }
        async run(accessor) {
            const themeService = accessor.get(workbenchThemeService_1.$egb);
            const configurationService = accessor.get(configuration_1.$8h);
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
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: browseColorThemesInMarketplaceCommandId,
                title: { value: (0, nls_1.localize)(28, null), original: 'Browse Color Themes in Marketplace' },
                category: actionCommonCategories_1.$Nl.Preferences,
                f1: true,
            });
        }
        async run(accessor) {
            const marketplaceTag = 'category:themes';
            const themeService = accessor.get(workbenchThemeService_1.$egb);
            const extensionGalleryService = accessor.get(extensionManagement_1.$Zn);
            const extensionResourceLoaderService = accessor.get(extensionResourceLoader_1.$2$);
            const instantiationService = accessor.get(instantiation_1.$Ah);
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
                        (0, errors_1.$Y)(err);
                        themeService.setColorTheme(currentTheme, undefined);
                    });
                }, applyTheme ? 0 : 200);
            };
            const marketplaceThemePicker = instantiationService.createInstance(MarketplaceThemesPicker, getMarketplaceColorThemes, marketplaceTag);
            await marketplaceThemePicker.openQuickPick('', themeService.getColorTheme(), selectTheme).then(undefined, errors_1.$Y);
        }
    });
    const ThemesSubMenu = new actions_1.$Ru('ThemesSubMenu');
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.GlobalActivity, {
        title: (0, nls_1.localize)(29, null),
        submenu: ThemesSubMenu,
        group: '2_configuration',
        order: 7
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarPreferencesMenu, {
        title: (0, nls_1.localize)(30, null),
        submenu: ThemesSubMenu,
        group: '2_configuration',
        order: 7
    });
    actions_1.$Tu.appendMenuItem(ThemesSubMenu, {
        command: {
            id: SelectColorThemeCommandId,
            title: (0, nls_1.localize)(31, null)
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(ThemesSubMenu, {
        command: {
            id: SelectFileIconThemeCommandId,
            title: (0, nls_1.localize)(32, null)
        },
        order: 2
    });
    actions_1.$Tu.appendMenuItem(ThemesSubMenu, {
        command: {
            id: SelectProductIconThemeCommandId,
            title: (0, nls_1.localize)(33, null)
        },
        order: 3
    });
    let DefaultThemeUpdatedNotificationContribution = class DefaultThemeUpdatedNotificationContribution {
        static { DefaultThemeUpdatedNotificationContribution_1 = this; }
        static { this.STORAGE_KEY = 'themeUpdatedNotificationShown'; }
        constructor(a, b, d, f, g, h) {
            this.a = a;
            this.b = b;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            if (d.getBoolean(DefaultThemeUpdatedNotificationContribution_1.STORAGE_KEY, -1 /* StorageScope.APPLICATION */)) {
                return;
            }
            setTimeout(async () => {
                if (d.getBoolean(DefaultThemeUpdatedNotificationContribution_1.STORAGE_KEY, -1 /* StorageScope.APPLICATION */)) {
                    return;
                }
                if (await this.h.hadLastFocus()) {
                    this.d.store(DefaultThemeUpdatedNotificationContribution_1.STORAGE_KEY, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    if (this.b.hasUpdatedDefaultThemes()) {
                        this.j();
                    }
                    else {
                        const currentTheme = this.b.getColorTheme().settingsId;
                        if (currentTheme === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT_OLD || currentTheme === workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK_OLD) {
                            this.k();
                        }
                    }
                }
            }, 3000);
        }
        async j() {
            const usingLight = this.b.getColorTheme().type === theme_1.ColorScheme.LIGHT;
            const newThemeSettingsId = usingLight ? workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT : workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK;
            const newTheme = (await this.b.getColorThemes()).find(theme => theme.settingsId === newThemeSettingsId);
            if (newTheme) {
                const choices = [
                    {
                        label: (0, nls_1.localize)(34, null),
                        run: () => {
                            this.l('keepNew');
                        }
                    },
                    {
                        label: (0, nls_1.localize)(35, null),
                        run: () => {
                            this.l('browse');
                            this.f.executeCommand(SelectColorThemeCommandId);
                        }
                    },
                    {
                        label: (0, nls_1.localize)(36, null),
                        run: async () => {
                            this.l('keepOld');
                            const oldSettingsId = usingLight ? workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT_OLD : workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK_OLD;
                            const oldTheme = (await this.b.getColorThemes()).find(theme => theme.settingsId === oldSettingsId);
                            if (oldTheme) {
                                this.b.setColorTheme(oldTheme, 'auto');
                            }
                        }
                    }
                ];
                await this.a.prompt(notification_1.Severity.Info, (0, nls_1.localize)(37, null, newTheme.label), choices, {
                    onCancel: () => this.l('cancel')
                });
            }
        }
        async k() {
            const newThemeSettingsId = this.b.getColorTheme().type === theme_1.ColorScheme.LIGHT ? workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_LIGHT : workbenchThemeService_1.ThemeSettingDefaults.COLOR_THEME_DARK;
            const theme = (await this.b.getColorThemes()).find(theme => theme.settingsId === newThemeSettingsId);
            if (theme) {
                const choices = [{
                        label: (0, nls_1.localize)(38, null),
                        run: () => {
                            this.l('tryNew');
                            this.b.setColorTheme(theme, 'auto');
                        }
                    },
                    {
                        label: (0, nls_1.localize)(39, null),
                        run: () => {
                            this.l('cancel');
                        }
                    }];
                await this.a.prompt(notification_1.Severity.Info, (0, nls_1.localize)(40, null, theme.label), choices, { onCancel: () => this.l('cancel') });
            }
        }
        l(outcome) {
            this.g.publicLog2('themeUpdatedNotication', {
                web: platform_2.$o,
                reaction: outcome
            });
        }
    };
    DefaultThemeUpdatedNotificationContribution = DefaultThemeUpdatedNotificationContribution_1 = __decorate([
        __param(0, notification_1.$Yu),
        __param(1, workbenchThemeService_1.$egb),
        __param(2, storage_1.$Vo),
        __param(3, commands_1.$Fr),
        __param(4, telemetry_1.$9k),
        __param(5, host_1.$VT)
    ], DefaultThemeUpdatedNotificationContribution);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(DefaultThemeUpdatedNotificationContribution, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=themes.contribution.js.map