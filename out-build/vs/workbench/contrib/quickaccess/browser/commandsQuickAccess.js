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
define(["require", "exports", "vs/nls!vs/workbench/contrib/quickaccess/browser/commandsQuickAccess", "vs/platform/quickinput/browser/commandsQuickAccess", "vs/workbench/services/editor/common/editorService", "vs/platform/actions/common/actions", "vs/workbench/services/extensions/common/extensions", "vs/base/common/async", "vs/editor/contrib/quickAccess/browser/commandsQuickAccess", "vs/base/common/platform", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/commands/common/commands", "vs/platform/telemetry/common/telemetry", "vs/platform/dialogs/common/dialogs", "vs/platform/quickinput/common/quickAccess", "vs/platform/configuration/common/configuration", "vs/base/common/codicons", "vs/base/common/themables", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/workbench/services/preferences/common/preferences", "vs/base/common/iconLabels", "vs/base/browser/browser", "vs/platform/product/common/productService", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/browser/actions/chatQuickInputActions", "vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation", "vs/workbench/contrib/chat/browser/actions/chatActions"], function (require, exports, nls_1, commandsQuickAccess_1, editorService_1, actions_1, extensions_1, async_1, commandsQuickAccess_2, platform_1, instantiation_1, keybinding_1, commands_1, telemetry_1, dialogs_1, quickAccess_1, configuration_1, codicons_1, themables_1, quickInput_1, storage_1, editorGroupsService_1, pickerQuickAccess_1, preferences_1, iconLabels_1, browser_1, productService_1, chatService_1, chatQuickInputActions_1, aiRelatedInformation_1, chatActions_1) {
    "use strict";
    var $MLb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OLb = exports.$NLb = exports.$MLb = void 0;
    let $MLb = class $MLb extends commandsQuickAccess_2.$LLb {
        static { $MLb_1 = this; }
        static { this.L = 5; }
        static { this.M = 0.8; }
        static { this.N = 200; }
        get I() { return this.R.activeTextEditorControl; }
        get defaultFilterValue() {
            if (this.bb.preserveInput) {
                return quickAccess_1.DefaultQuickAccessFilterValue.LAST;
            }
            return undefined;
        }
        constructor(R, S, U, instantiationService, keybindingService, commandService, telemetryService, dialogService, W, X, Y, Z, $, ab) {
            super({
                showAlias: !platform_1.Language.isDefaultVariant(),
                noResultsPick: () => ({
                    label: (0, nls_1.localize)(0, null),
                    commandId: ''
                }),
            }, instantiationService, keybindingService, commandService, telemetryService, dialogService);
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            // If extensions are not yet registered, we wait for a little moment to give them
            // a chance to register so that the complete set of commands shows up as result
            // We do not want to delay functionality beyond that time though to keep the commands
            // functional.
            this.O = (0, async_1.$yg)(this.U.whenInstalledExtensionsRegistered(), 800);
            this.P = false;
            this.B(W.onDidChangeConfiguration((e) => this.cb(e)));
            this.cb();
        }
        get bb() {
            const commandPaletteConfig = this.W.getValue().workbench.commandPalette;
            return {
                preserveInput: commandPaletteConfig.preserveInput,
                experimental: commandPaletteConfig.experimental
            };
        }
        cb(e) {
            if (e && !e.affectsConfiguration('workbench.commandPalette.experimental')) {
                return;
            }
            const config = this.bb;
            const suggestedCommandIds = config.experimental.suggestCommands && this.Z.commandPaletteSuggestedCommandIds?.length
                ? new Set(this.Z.commandPaletteSuggestedCommandIds)
                : undefined;
            this.f.suggestedCommandIds = suggestedCommandIds;
            this.P = config.experimental.enableNaturalLanguageSearch;
        }
        async F(token) {
            // wait for extensions registration or 800ms once
            await this.O;
            if (token.isCancellationRequested) {
                return [];
            }
            return [
                ...this.J(),
                ...this.hb()
            ].map(picks => ({
                ...picks,
                buttons: [{
                        iconClass: themables_1.ThemeIcon.asClassName(codicons_1.$Pj.gear),
                        tooltip: (0, nls_1.localize)(1, null),
                    }],
                trigger: () => {
                    this.Y.openGlobalKeybindingSettings(false, { query: `@command:${picks.commandId}` });
                    return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                },
            }));
        }
        G(filter, token) {
            if (!this.P
                || token.isCancellationRequested
                || filter === ''
                || !this.$.isEnabled()) {
                return false;
            }
            return true;
        }
        async H(allPicks, picksSoFar, filter, token) {
            if (!this.G(filter, token)) {
                return [];
            }
            let additionalPicks;
            try {
                // Wait a bit to see if the user is still typing
                await (0, async_1.$Hg)($MLb_1.N, token);
                additionalPicks = await this.gb(allPicks, picksSoFar, filter, token);
            }
            catch (e) {
                return [];
            }
            if (picksSoFar.length || additionalPicks.length) {
                additionalPicks.push({
                    type: 'separator'
                });
            }
            const info = this.ab.getProviderInfos()[0];
            if (info) {
                additionalPicks.push({
                    label: (0, nls_1.localize)(2, null, info.displayName, filter),
                    commandId: this.bb.experimental.askChatLocation === 'quickChat' ? chatQuickInputActions_1.$JIb : chatActions_1.$EIb,
                    args: [filter]
                });
            }
            return additionalPicks;
        }
        async gb(allPicks, picksSoFar, filter, token) {
            const relatedInformation = await this.$.getRelatedInformation(filter, [aiRelatedInformation_1.RelatedInformationType.CommandInformation], token);
            // Sort by weight descending to get the most relevant results first
            relatedInformation.sort((a, b) => b.weight - a.weight);
            const setOfPicksSoFar = new Set(picksSoFar.map(p => p.commandId));
            const additionalPicks = new Array();
            for (const info of relatedInformation) {
                if (info.weight < $MLb_1.M || additionalPicks.length === $MLb_1.L) {
                    break;
                }
                const pick = allPicks.find(p => p.commandId === info.command && !setOfPicksSoFar.has(p.commandId));
                if (pick) {
                    additionalPicks.push(pick);
                }
            }
            return additionalPicks;
        }
        hb() {
            const globalCommandPicks = [];
            const scopedContextKeyService = this.R.activeEditorPane?.scopedContextKeyService || this.X.activeGroup.scopedContextKeyService;
            const globalCommandsMenu = this.S.createMenu(actions_1.$Ru.CommandPalette, scopedContextKeyService);
            const globalCommandsMenuActions = globalCommandsMenu.getActions()
                .reduce((r, [, actions]) => [...r, ...actions], [])
                .filter(action => action instanceof actions_1.$Vu && action.enabled);
            for (const action of globalCommandsMenuActions) {
                // Label
                let label = (typeof action.item.title === 'string' ? action.item.title : action.item.title.value) || action.item.id;
                // Category
                const category = typeof action.item.category === 'string' ? action.item.category : action.item.category?.value;
                if (category) {
                    label = (0, nls_1.localize)(3, null, category, label);
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
                    label: (0, iconLabels_1.$Tj)(label)
                });
            }
            // Cleanup
            globalCommandsMenu.dispose();
            return globalCommandPicks;
        }
    };
    exports.$MLb = $MLb;
    exports.$MLb = $MLb = $MLb_1 = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, actions_1.$Su),
        __param(2, extensions_1.$MF),
        __param(3, instantiation_1.$Ah),
        __param(4, keybinding_1.$2D),
        __param(5, commands_1.$Fr),
        __param(6, telemetry_1.$9k),
        __param(7, dialogs_1.$oA),
        __param(8, configuration_1.$8h),
        __param(9, editorGroupsService_1.$5C),
        __param(10, preferences_1.$BE),
        __param(11, productService_1.$kj),
        __param(12, aiRelatedInformation_1.$YJ),
        __param(13, chatService_1.$FH)
    ], $MLb);
    //#region Actions
    class $NLb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.showCommands'; }
        constructor() {
            super({
                id: $NLb.ID,
                title: { value: (0, nls_1.localize)(4, null), original: 'Show All Commands' },
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: undefined,
                    primary: !browser_1.$5N ? (2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 46 /* KeyCode.KeyP */) : undefined,
                    secondary: [59 /* KeyCode.F1 */]
                },
                f1: true
            });
        }
        async run(accessor) {
            accessor.get(quickInput_1.$Gq).quickAccess.show($MLb.PREFIX);
        }
    }
    exports.$NLb = $NLb;
    class $OLb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.clearCommandHistory',
                title: { value: (0, nls_1.localize)(5, null), original: 'Clear Command History' },
                f1: true
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.$8h);
            const storageService = accessor.get(storage_1.$Vo);
            const dialogService = accessor.get(dialogs_1.$oA);
            const commandHistoryLength = commandsQuickAccess_1.$KLb.getConfiguredCommandHistoryLength(configurationService);
            if (commandHistoryLength > 0) {
                // Ask for confirmation
                const { confirmed } = await dialogService.confirm({
                    type: 'warning',
                    message: (0, nls_1.localize)(6, null),
                    detail: (0, nls_1.localize)(7, null),
                    primaryButton: (0, nls_1.localize)(8, null)
                });
                if (!confirmed) {
                    return;
                }
                commandsQuickAccess_1.$KLb.clearHistory(configurationService, storageService);
            }
        }
    }
    exports.$OLb = $OLb;
});
//#endregion
//# sourceMappingURL=commandsQuickAccess.js.map