/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/localization/common/localizationsActions", "vs/platform/quickinput/common/quickInput", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/platform/languagePacks/common/languagePacks", "vs/workbench/services/localization/common/locale", "vs/workbench/contrib/extensions/common/extensions"], function (require, exports, nls_1, quickInput_1, cancellation_1, lifecycle_1, actions_1, languagePacks_1, locale_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$T4b = exports.$S4b = void 0;
    class $S4b extends actions_1.$Wu {
        static { this.ID = 'workbench.action.configureLocale'; }
        static { this.LABEL = (0, nls_1.localize)(0, null); }
        constructor() {
            super({
                id: $S4b.ID,
                title: { original: 'Configure Display Language', value: $S4b.LABEL },
                menu: {
                    id: actions_1.$Ru.CommandPalette
                }
            });
        }
        async run(accessor) {
            const languagePackService = accessor.get(languagePacks_1.$Iq);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const localeService = accessor.get(locale_1.$khb);
            const extensionWorkbenchService = accessor.get(extensions_1.$Pfb);
            const installedLanguages = await languagePackService.getInstalledLanguages();
            const qp = quickInputService.createQuickPick();
            qp.matchOnDescription = true;
            qp.placeholder = (0, nls_1.localize)(1, null);
            if (installedLanguages?.length) {
                const items = [{ type: 'separator', label: (0, nls_1.localize)(2, null) }];
                qp.items = items.concat(this.a(installedLanguages));
            }
            const disposables = new lifecycle_1.$jc();
            const source = new cancellation_1.$pd();
            disposables.add(qp.onDispose(() => {
                source.cancel();
                disposables.dispose();
            }));
            const installedSet = new Set(installedLanguages?.map(language => language.id) ?? []);
            languagePackService.getAvailableLanguages().then(availableLanguages => {
                const newLanguages = availableLanguages.filter(l => l.id && !installedSet.has(l.id));
                if (newLanguages.length) {
                    qp.items = [
                        ...qp.items,
                        { type: 'separator', label: (0, nls_1.localize)(3, null) },
                        ...this.a(newLanguages)
                    ];
                }
                qp.busy = false;
            });
            disposables.add(qp.onDidAccept(async () => {
                const selectedLanguage = qp.activeItems[0];
                qp.hide();
                await localeService.setLocale(selectedLanguage);
            }));
            disposables.add(qp.onDidTriggerItemButton(async (e) => {
                qp.hide();
                if (e.item.extensionId) {
                    await extensionWorkbenchService.open(e.item.extensionId);
                }
            }));
            qp.show();
            qp.busy = true;
        }
        a(items) {
            for (const item of items) {
                if (item.extensionId) {
                    item.buttons = [{
                            tooltip: (0, nls_1.localize)(4, null),
                            iconClass: 'codicon-info'
                        }];
                }
            }
            return items;
        }
    }
    exports.$S4b = $S4b;
    class $T4b extends actions_1.$Wu {
        static { this.ID = 'workbench.action.clearLocalePreference'; }
        static { this.LABEL = (0, nls_1.localize)(5, null); }
        constructor() {
            super({
                id: $T4b.ID,
                title: { original: 'Clear Display Language Preference', value: $T4b.LABEL },
                menu: {
                    id: actions_1.$Ru.CommandPalette
                }
            });
        }
        async run(accessor) {
            const localeService = accessor.get(locale_1.$khb);
            await localeService.clearLocalePreference();
        }
    }
    exports.$T4b = $T4b;
});
//# sourceMappingURL=localizationsActions.js.map