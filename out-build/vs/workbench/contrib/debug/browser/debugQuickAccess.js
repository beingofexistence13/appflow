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
define(["require", "exports", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/nls!vs/workbench/contrib/debug/browser/debugQuickAccess", "vs/platform/notification/common/notification", "vs/workbench/contrib/debug/common/debug", "vs/platform/workspace/common/workspace", "vs/platform/commands/common/commands", "vs/base/common/filters", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugIcons", "vs/base/common/themables"], function (require, exports, pickerQuickAccess_1, nls_1, notification_1, debug_1, workspace_1, commands_1, filters_1, debugCommands_1, debugIcons_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FRb = void 0;
    let $FRb = class $FRb extends pickerQuickAccess_1.$sqb {
        constructor(a, b, h, j) {
            super(debugCommands_1.$aRb, {
                noResultsPick: {
                    label: (0, nls_1.localize)(0, null)
                }
            });
            this.a = a;
            this.b = b;
            this.h = h;
            this.j = j;
        }
        async g(filter) {
            const picks = [];
            if (!this.a.getAdapterManager().hasEnabledDebuggers()) {
                return [];
            }
            picks.push({ type: 'separator', label: 'launch.json' });
            const configManager = this.a.getConfigurationManager();
            // Entries: configs
            let lastGroup;
            for (const config of configManager.getAllConfigurations()) {
                const highlights = (0, filters_1.$Ej)(filter, config.name, true);
                if (highlights) {
                    // Separator
                    if (lastGroup !== config.presentation?.group) {
                        picks.push({ type: 'separator' });
                        lastGroup = config.presentation?.group;
                    }
                    // Launch entry
                    picks.push({
                        label: config.name,
                        description: this.b.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ? config.launch.name : '',
                        highlights: { label: highlights },
                        buttons: [{
                                iconClass: themables_1.ThemeIcon.asClassName(debugIcons_1.$mnb),
                                tooltip: (0, nls_1.localize)(1, null)
                            }],
                        trigger: () => {
                            config.launch.openConfigFile({ preserveFocus: false });
                            return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                        },
                        accept: async () => {
                            await configManager.selectConfiguration(config.launch, config.name);
                            try {
                                await this.a.startDebugging(config.launch, undefined, { startedByUser: true });
                            }
                            catch (error) {
                                this.j.error(error);
                            }
                        }
                    });
                }
            }
            // Entries detected configurations
            const dynamicProviders = await configManager.getDynamicProviders();
            if (dynamicProviders.length > 0) {
                picks.push({
                    type: 'separator', label: (0, nls_1.localize)(2, null)



                });
            }
            configManager.getRecentDynamicConfigurations().forEach(({ name, type }) => {
                const highlights = (0, filters_1.$Ej)(filter, name, true);
                if (highlights) {
                    picks.push({
                        label: name,
                        highlights: { label: highlights },
                        buttons: [{
                                iconClass: themables_1.ThemeIcon.asClassName(debugIcons_1.$onb),
                                tooltip: (0, nls_1.localize)(3, null)
                            }],
                        trigger: () => {
                            configManager.removeRecentDynamicConfigurations(name, type);
                            return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                        },
                        accept: async () => {
                            await configManager.selectConfiguration(undefined, name, undefined, { type });
                            try {
                                const { launch, getConfig } = configManager.selectedConfiguration;
                                const config = await getConfig();
                                await this.a.startDebugging(launch, config, { startedByUser: true });
                            }
                            catch (error) {
                                this.j.error(error);
                            }
                        }
                    });
                }
            });
            dynamicProviders.forEach(provider => {
                picks.push({
                    label: `$(folder) ${provider.label}...`,
                    ariaLabel: (0, nls_1.localize)(4, null, provider.label),
                    accept: async () => {
                        const pick = await provider.pick();
                        if (pick) {
                            // Use the type of the provider, not of the config since config sometimes have subtypes (for example "node-terminal")
                            await configManager.selectConfiguration(pick.launch, pick.config.name, pick.config, { type: provider.type });
                            this.a.startDebugging(pick.launch, pick.config, { startedByUser: true });
                        }
                    }
                });
            });
            // Entries: launches
            const visibleLaunches = configManager.getLaunches().filter(launch => !launch.hidden);
            // Separator
            if (visibleLaunches.length > 0) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)(5, null) });
            }
            for (const launch of visibleLaunches) {
                const label = this.b.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ?
                    (0, nls_1.localize)(6, null, launch.name) :
                    (0, nls_1.localize)(7, null);
                // Add Config entry
                picks.push({
                    label,
                    description: this.b.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ? launch.name : '',
                    highlights: { label: (0, filters_1.$Ej)(filter, label, true) ?? undefined },
                    accept: () => this.h.executeCommand(debugCommands_1.$dQb, launch.uri.toString())
                });
            }
            return picks;
        }
    };
    exports.$FRb = $FRb;
    exports.$FRb = $FRb = __decorate([
        __param(0, debug_1.$nH),
        __param(1, workspace_1.$Kh),
        __param(2, commands_1.$Fr),
        __param(3, notification_1.$Yu)
    ], $FRb);
});
//# sourceMappingURL=debugQuickAccess.js.map