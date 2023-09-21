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
define(["require", "exports", "vs/nls", "vs/platform/quickinput/browser/commandsQuickAccess", "vs/workbench/services/editor/common/editorService", "vs/platform/actions/common/actions", "vs/workbench/services/extensions/common/extensions", "vs/base/common/async", "vs/editor/contrib/quickAccess/browser/commandsQuickAccess", "vs/base/common/platform", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/commands/common/commands", "vs/platform/telemetry/common/telemetry", "vs/platform/dialogs/common/dialogs", "vs/platform/quickinput/common/quickAccess", "vs/platform/configuration/common/configuration", "vs/base/common/codicons", "vs/base/common/themables", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/workbench/services/preferences/common/preferences", "vs/base/common/iconLabels", "vs/base/browser/browser", "vs/platform/product/common/productService", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/browser/actions/chatQuickInputActions", "vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation", "vs/workbench/contrib/chat/browser/actions/chatActions"], function (require, exports, nls_1, commandsQuickAccess_1, editorService_1, actions_1, extensions_1, async_1, commandsQuickAccess_2, platform_1, instantiation_1, keybinding_1, commands_1, telemetry_1, dialogs_1, quickAccess_1, configuration_1, codicons_1, themables_1, quickInput_1, storage_1, editorGroupsService_1, pickerQuickAccess_1, preferences_1, iconLabels_1, browser_1, productService_1, chatService_1, chatQuickInputActions_1, aiRelatedInformation_1, chatActions_1) {
    "use strict";
    var CommandsQuickAccessProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClearCommandHistoryAction = exports.ShowAllCommandsAction = exports.CommandsQuickAccessProvider = void 0;
    let CommandsQuickAccessProvider = class CommandsQuickAccessProvider extends commandsQuickAccess_2.AbstractEditorCommandsQuickAccessProvider {
        static { CommandsQuickAccessProvider_1 = this; }
        static { this.AI_RELATED_INFORMATION_MAX_PICKS = 5; }
        static { this.AI_RELATED_INFORMATION_THRESHOLD = 0.8; }
        static { this.AI_RELATED_INFORMATION_DEBOUNCE = 200; }
        get activeTextEditorControl() { return this.editorService.activeTextEditorControl; }
        get defaultFilterValue() {
            if (this.configuration.preserveInput) {
                return quickAccess_1.DefaultQuickAccessFilterValue.LAST;
            }
            return undefined;
        }
        constructor(editorService, menuService, extensionService, instantiationService, keybindingService, commandService, telemetryService, dialogService, configurationService, editorGroupService, preferencesService, productService, aiRelatedInformationService, chatService) {
            super({
                showAlias: !platform_1.Language.isDefaultVariant(),
                noResultsPick: () => ({
                    label: (0, nls_1.localize)('noCommandResults', "No matching commands"),
                    commandId: ''
                }),
            }, instantiationService, keybindingService, commandService, telemetryService, dialogService);
            this.editorService = editorService;
            this.menuService = menuService;
            this.extensionService = extensionService;
            this.configurationService = configurationService;
            this.editorGroupService = editorGroupService;
            this.preferencesService = preferencesService;
            this.productService = productService;
            this.aiRelatedInformationService = aiRelatedInformationService;
            this.chatService = chatService;
            // If extensions are not yet registered, we wait for a little moment to give them
            // a chance to register so that the complete set of commands shows up as result
            // We do not want to delay functionality beyond that time though to keep the commands
            // functional.
            this.extensionRegistrationRace = (0, async_1.raceTimeout)(this.extensionService.whenInstalledExtensionsRegistered(), 800);
            this.useAiRelatedInfo = false;
            this._register(configurationService.onDidChangeConfiguration((e) => this.updateOptions(e)));
            this.updateOptions();
        }
        get configuration() {
            const commandPaletteConfig = this.configurationService.getValue().workbench.commandPalette;
            return {
                preserveInput: commandPaletteConfig.preserveInput,
                experimental: commandPaletteConfig.experimental
            };
        }
        updateOptions(e) {
            if (e && !e.affectsConfiguration('workbench.commandPalette.experimental')) {
                return;
            }
            const config = this.configuration;
            const suggestedCommandIds = config.experimental.suggestCommands && this.productService.commandPaletteSuggestedCommandIds?.length
                ? new Set(this.productService.commandPaletteSuggestedCommandIds)
                : undefined;
            this.options.suggestedCommandIds = suggestedCommandIds;
            this.useAiRelatedInfo = config.experimental.enableNaturalLanguageSearch;
        }
        async getCommandPicks(token) {
            // wait for extensions registration or 800ms once
            await this.extensionRegistrationRace;
            if (token.isCancellationRequested) {
                return [];
            }
            return [
                ...this.getCodeEditorCommandPicks(),
                ...this.getGlobalCommandPicks()
            ].map(picks => ({
                ...picks,
                buttons: [{
                        iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.gear),
                        tooltip: (0, nls_1.localize)('configure keybinding', "Configure Keybinding"),
                    }],
                trigger: () => {
                    this.preferencesService.openGlobalKeybindingSettings(false, { query: `@command:${picks.commandId}` });
                    return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                },
            }));
        }
        hasAdditionalCommandPicks(filter, token) {
            if (!this.useAiRelatedInfo
                || token.isCancellationRequested
                || filter === ''
                || !this.aiRelatedInformationService.isEnabled()) {
                return false;
            }
            return true;
        }
        async getAdditionalCommandPicks(allPicks, picksSoFar, filter, token) {
            if (!this.hasAdditionalCommandPicks(filter, token)) {
                return [];
            }
            let additionalPicks;
            try {
                // Wait a bit to see if the user is still typing
                await (0, async_1.timeout)(CommandsQuickAccessProvider_1.AI_RELATED_INFORMATION_DEBOUNCE, token);
                additionalPicks = await this.getRelatedInformationPicks(allPicks, picksSoFar, filter, token);
            }
            catch (e) {
                return [];
            }
            if (picksSoFar.length || additionalPicks.length) {
                additionalPicks.push({
                    type: 'separator'
                });
            }
            const info = this.chatService.getProviderInfos()[0];
            if (info) {
                additionalPicks.push({
                    label: (0, nls_1.localize)('askXInChat', "Ask {0}: {1}", info.displayName, filter),
                    commandId: this.configuration.experimental.askChatLocation === 'quickChat' ? chatQuickInputActions_1.ASK_QUICK_QUESTION_ACTION_ID : chatActions_1.CHAT_OPEN_ACTION_ID,
                    args: [filter]
                });
            }
            return additionalPicks;
        }
        async getRelatedInformationPicks(allPicks, picksSoFar, filter, token) {
            const relatedInformation = await this.aiRelatedInformationService.getRelatedInformation(filter, [aiRelatedInformation_1.RelatedInformationType.CommandInformation], token);
            // Sort by weight descending to get the most relevant results first
            relatedInformation.sort((a, b) => b.weight - a.weight);
            const setOfPicksSoFar = new Set(picksSoFar.map(p => p.commandId));
            const additionalPicks = new Array();
            for (const info of relatedInformation) {
                if (info.weight < CommandsQuickAccessProvider_1.AI_RELATED_INFORMATION_THRESHOLD || additionalPicks.length === CommandsQuickAccessProvider_1.AI_RELATED_INFORMATION_MAX_PICKS) {
                    break;
                }
                const pick = allPicks.find(p => p.commandId === info.command && !setOfPicksSoFar.has(p.commandId));
                if (pick) {
                    additionalPicks.push(pick);
                }
            }
            return additionalPicks;
        }
        getGlobalCommandPicks() {
            const globalCommandPicks = [];
            const scopedContextKeyService = this.editorService.activeEditorPane?.scopedContextKeyService || this.editorGroupService.activeGroup.scopedContextKeyService;
            const globalCommandsMenu = this.menuService.createMenu(actions_1.MenuId.CommandPalette, scopedContextKeyService);
            const globalCommandsMenuActions = globalCommandsMenu.getActions()
                .reduce((r, [, actions]) => [...r, ...actions], [])
                .filter(action => action instanceof actions_1.MenuItemAction && action.enabled);
            for (const action of globalCommandsMenuActions) {
                // Label
                let label = (typeof action.item.title === 'string' ? action.item.title : action.item.title.value) || action.item.id;
                // Category
                const category = typeof action.item.category === 'string' ? action.item.category : action.item.category?.value;
                if (category) {
                    label = (0, nls_1.localize)('commandWithCategory', "{0}: {1}", category, label);
                }
                // Alias
                const aliasLabel = typeof action.item.title !== 'string' ? action.item.title.original : undefined;
                const aliasCategory = (category && action.item.category && typeof action.item.category !== 'string') ? action.item.category.original : undefined;
                const commandAlias = (aliasLabel && category) ?
                    aliasCategory ? `${aliasCategory}: ${aliasLabel}` : `${category}: ${aliasLabel}` :
                    aliasLabel;
                globalCommandPicks.push({
                    commandId: action.item.id,
                    commandAlias,
                    label: (0, iconLabels_1.stripIcons)(label)
                });
            }
            // Cleanup
            globalCommandsMenu.dispose();
            return globalCommandPicks;
        }
    };
    exports.CommandsQuickAccessProvider = CommandsQuickAccessProvider;
    exports.CommandsQuickAccessProvider = CommandsQuickAccessProvider = CommandsQuickAccessProvider_1 = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, actions_1.IMenuService),
        __param(2, extensions_1.IExtensionService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, commands_1.ICommandService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, dialogs_1.IDialogService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, editorGroupsService_1.IEditorGroupsService),
        __param(10, preferences_1.IPreferencesService),
        __param(11, productService_1.IProductService),
        __param(12, aiRelatedInformation_1.IAiRelatedInformationService),
        __param(13, chatService_1.IChatService)
    ], CommandsQuickAccessProvider);
    //#region Actions
    class ShowAllCommandsAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.showCommands'; }
        constructor() {
            super({
                id: ShowAllCommandsAction.ID,
                title: { value: (0, nls_1.localize)('showTriggerActions', "Show All Commands"), original: 'Show All Commands' },
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: undefined,
                    primary: !browser_1.isFirefox ? (2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 46 /* KeyCode.KeyP */) : undefined,
                    secondary: [59 /* KeyCode.F1 */]
                },
                f1: true
            });
        }
        async run(accessor) {
            accessor.get(quickInput_1.IQuickInputService).quickAccess.show(CommandsQuickAccessProvider.PREFIX);
        }
    }
    exports.ShowAllCommandsAction = ShowAllCommandsAction;
    class ClearCommandHistoryAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.clearCommandHistory',
                title: { value: (0, nls_1.localize)('clearCommandHistory', "Clear Command History"), original: 'Clear Command History' },
                f1: true
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const storageService = accessor.get(storage_1.IStorageService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const commandHistoryLength = commandsQuickAccess_1.CommandsHistory.getConfiguredCommandHistoryLength(configurationService);
            if (commandHistoryLength > 0) {
                // Ask for confirmation
                const { confirmed } = await dialogService.confirm({
                    type: 'warning',
                    message: (0, nls_1.localize)('confirmClearMessage', "Do you want to clear the history of recently used commands?"),
                    detail: (0, nls_1.localize)('confirmClearDetail', "This action is irreversible!"),
                    primaryButton: (0, nls_1.localize)({ key: 'clearButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Clear")
                });
                if (!confirmed) {
                    return;
                }
                commandsQuickAccess_1.CommandsHistory.clearHistory(configurationService, storageService);
            }
        }
    }
    exports.ClearCommandHistoryAction = ClearCommandHistoryAction;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHNRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3F1aWNrYWNjZXNzL2Jyb3dzZXIvY29tbWFuZHNRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcUN6RixJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLCtEQUF5Qzs7aUJBRTFFLHFDQUFnQyxHQUFHLENBQUMsQUFBSixDQUFLO2lCQUNyQyxxQ0FBZ0MsR0FBRyxHQUFHLEFBQU4sQ0FBTztpQkFDdkMsb0NBQStCLEdBQUcsR0FBRyxBQUFOLENBQU87UUFVckQsSUFBYyx1QkFBdUIsS0FBMEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztRQUVuSCxJQUFJLGtCQUFrQjtZQUNyQixJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFO2dCQUNyQyxPQUFPLDJDQUE2QixDQUFDLElBQUksQ0FBQzthQUMxQztZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxZQUNpQixhQUE4QyxFQUNoRCxXQUEwQyxFQUNyQyxnQkFBb0QsRUFDaEQsb0JBQTJDLEVBQzlDLGlCQUFxQyxFQUN4QyxjQUErQixFQUM3QixnQkFBbUMsRUFDdEMsYUFBNkIsRUFDdEIsb0JBQTRELEVBQzdELGtCQUF5RCxFQUMxRCxrQkFBd0QsRUFDNUQsY0FBZ0QsRUFDbkMsMkJBQTBFLEVBQzFGLFdBQTBDO1lBRXhELEtBQUssQ0FBQztnQkFDTCxTQUFTLEVBQUUsQ0FBQyxtQkFBUSxDQUFDLGdCQUFnQixFQUFFO2dCQUN2QyxhQUFhLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztvQkFDckIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLHNCQUFz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