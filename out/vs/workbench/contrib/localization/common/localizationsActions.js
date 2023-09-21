/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/platform/languagePacks/common/languagePacks", "vs/workbench/services/localization/common/locale", "vs/workbench/contrib/extensions/common/extensions"], function (require, exports, nls_1, quickInput_1, cancellation_1, lifecycle_1, actions_1, languagePacks_1, locale_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClearDisplayLanguageAction = exports.ConfigureDisplayLanguageAction = void 0;
    class ConfigureDisplayLanguageAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.configureLocale'; }
        static { this.LABEL = (0, nls_1.localize)('configureLocale', "Configure Display Language"); }
        constructor() {
            super({
                id: ConfigureDisplayLanguageAction.ID,
                title: { original: 'Configure Display Language', value: ConfigureDisplayLanguageAction.LABEL },
                menu: {
                    id: actions_1.MenuId.CommandPalette
                }
            });
        }
        async run(accessor) {
            const languagePackService = accessor.get(languagePacks_1.ILanguagePackService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const localeService = accessor.get(locale_1.ILocaleService);
            const extensionWorkbenchService = accessor.get(extensions_1.IExtensionsWorkbenchService);
            const installedLanguages = await languagePackService.getInstalledLanguages();
            const qp = quickInputService.createQuickPick();
            qp.matchOnDescription = true;
            qp.placeholder = (0, nls_1.localize)('chooseLocale', "Select Display Language");
            if (installedLanguages?.length) {
                const items = [{ type: 'separator', label: (0, nls_1.localize)('installed', "Installed") }];
                qp.items = items.concat(this.withMoreInfoButton(installedLanguages));
            }
            const disposables = new lifecycle_1.DisposableStore();
            const source = new cancellation_1.CancellationTokenSource();
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
                        { type: 'separator', label: (0, nls_1.localize)('available', "Available") },
                        ...this.withMoreInfoButton(newLanguages)
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
        withMoreInfoButton(items) {
            for (const item of items) {
                if (item.extensionId) {
                    item.buttons = [{
                            tooltip: (0, nls_1.localize)('moreInfo', "More Info"),
                            iconClass: 'codicon-info'
                        }];
                }
            }
            return items;
        }
    }
    exports.ConfigureDisplayLanguageAction = ConfigureDisplayLanguageAction;
    class ClearDisplayLanguageAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.clearLocalePreference'; }
        static { this.LABEL = (0, nls_1.localize)('clearDisplayLanguage', "Clear Display Language Preference"); }
        constructor() {
            super({
                id: ClearDisplayLanguageAction.ID,
                title: { original: 'Clear Display Language Preference', value: ClearDisplayLanguageAction.LABEL },
                menu: {
                    id: actions_1.MenuId.CommandPalette
                }
            });
        }
        async run(accessor) {
            const localeService = accessor.get(locale_1.ILocaleService);
            await localeService.clearLocalePreference();
        }
    }
    exports.ClearDisplayLanguageAction = ClearDisplayLanguageAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uc0FjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9sb2NhbGl6YXRpb24vY29tbW9uL2xvY2FsaXphdGlvbnNBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFhLDhCQUErQixTQUFRLGlCQUFPO2lCQUNuQyxPQUFFLEdBQUcsa0NBQWtDLENBQUM7aUJBQ3hDLFVBQUssR0FBRyxJQUFBLGNBQVEsRUFBQyxpQkFBaUIsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1FBRXpGO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw4QkFBOEIsQ0FBQyxFQUFFO2dCQUNyQyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsNEJBQTRCLEVBQUUsS0FBSyxFQUFFLDhCQUE4QixDQUFDLEtBQUssRUFBRTtnQkFDOUYsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGNBQWM7aUJBQ3pCO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDMUMsTUFBTSxtQkFBbUIsR0FBeUIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0IsQ0FBQyxDQUFDO1lBQ3JGLE1BQU0saUJBQWlCLEdBQXVCLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUMvRSxNQUFNLGFBQWEsR0FBbUIsUUFBUSxDQUFDLEdBQUcsQ0FBQyx1QkFBYyxDQUFDLENBQUM7WUFDbkUsTUFBTSx5QkFBeUIsR0FBZ0MsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3Q0FBMkIsQ0FBQyxDQUFDO1lBRXpHLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBRTdFLE1BQU0sRUFBRSxHQUFHLGlCQUFpQixDQUFDLGVBQWUsRUFBcUIsQ0FBQztZQUNsRSxFQUFFLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1lBQzdCLEVBQUUsQ0FBQyxXQUFXLEdBQUcsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLHlCQUF5QixDQUFDLENBQUM7WUFFckUsSUFBSSxrQkFBa0IsRUFBRSxNQUFNLEVBQUU7Z0JBQy9CLE1BQU0sS0FBSyxHQUFtRCxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDakksRUFBRSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7YUFDckU7WUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUMxQyxNQUFNLE1BQU0sR0FBRyxJQUFJLHNDQUF1QixFQUFFLENBQUM7WUFDN0MsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDakMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNoQixXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxDQUFTLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUM5RixtQkFBbUIsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO2dCQUNyRSxNQUFNLFlBQVksR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckYsSUFBSSxZQUFZLENBQUMsTUFBTSxFQUFFO29CQUN4QixFQUFFLENBQUMsS0FBSyxHQUFHO3dCQUNWLEdBQUcsRUFBRSxDQUFDLEtBQUs7d0JBQ1gsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLEVBQUU7d0JBQ2hFLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQztxQkFDeEMsQ0FBQztpQkFDRjtnQkFDRCxFQUFFLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQztZQUVILFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDekMsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1YsTUFBTSxhQUFhLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDakQsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsRUFBRTtnQkFDbkQsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNWLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ3ZCLE1BQU0seUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQ3pEO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNWLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFTyxrQkFBa0IsQ0FBQyxLQUEwQjtZQUNwRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDekIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUM7NEJBQ2YsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSxXQUFXLENBQUM7NEJBQzFDLFNBQVMsRUFBRSxjQUFjO3lCQUN6QixDQUFDLENBQUM7aUJBQ0g7YUFDRDtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQzs7SUE5RUYsd0VBK0VDO0lBRUQsTUFBYSwwQkFBMkIsU0FBUSxpQkFBTztpQkFDL0IsT0FBRSxHQUFHLHdDQUF3QyxDQUFDO2lCQUM5QyxVQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsc0JBQXNCLEVBQUUsbUNBQW1DLENBQUMsQ0FBQztRQUVyRztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsMEJBQTBCLENBQUMsRUFBRTtnQkFDakMsS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLG1DQUFtQyxFQUFFLEtBQUssRUFBRSwwQkFBMEIsQ0FBQyxLQUFLLEVBQUU7Z0JBQ2pHLElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxjQUFjO2lCQUN6QjthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQzFDLE1BQU0sYUFBYSxHQUFtQixRQUFRLENBQUMsR0FBRyxDQUFDLHVCQUFjLENBQUMsQ0FBQztZQUNuRSxNQUFNLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzdDLENBQUM7O0lBakJGLGdFQWtCQyJ9