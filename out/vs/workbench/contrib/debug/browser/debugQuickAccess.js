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
define(["require", "exports", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/nls", "vs/platform/notification/common/notification", "vs/workbench/contrib/debug/common/debug", "vs/platform/workspace/common/workspace", "vs/platform/commands/common/commands", "vs/base/common/filters", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugIcons", "vs/base/common/themables"], function (require, exports, pickerQuickAccess_1, nls_1, notification_1, debug_1, workspace_1, commands_1, filters_1, debugCommands_1, debugIcons_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StartDebugQuickAccessProvider = void 0;
    let StartDebugQuickAccessProvider = class StartDebugQuickAccessProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
        constructor(debugService, contextService, commandService, notificationService) {
            super(debugCommands_1.DEBUG_QUICK_ACCESS_PREFIX, {
                noResultsPick: {
                    label: (0, nls_1.localize)('noDebugResults', "No matching launch configurations")
                }
            });
            this.debugService = debugService;
            this.contextService = contextService;
            this.commandService = commandService;
            this.notificationService = notificationService;
        }
        async _getPicks(filter) {
            const picks = [];
            if (!this.debugService.getAdapterManager().hasEnabledDebuggers()) {
                return [];
            }
            picks.push({ type: 'separator', label: 'launch.json' });
            const configManager = this.debugService.getConfigurationManager();
            // Entries: configs
            let lastGroup;
            for (const config of configManager.getAllConfigurations()) {
                const highlights = (0, filters_1.matchesFuzzy)(filter, config.name, true);
                if (highlights) {
                    // Separator
                    if (lastGroup !== config.presentation?.group) {
                        picks.push({ type: 'separator' });
                        lastGroup = config.presentation?.group;
                    }
                    // Launch entry
                    picks.push({
                        label: config.name,
                        description: this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ? config.launch.name : '',
                        highlights: { label: highlights },
                        buttons: [{
                                iconClass: themables_1.ThemeIcon.asClassName(debugIcons_1.debugConfigure),
                                tooltip: (0, nls_1.localize)('customizeLaunchConfig', "Configure Launch Configuration")
                            }],
                        trigger: () => {
                            config.launch.openConfigFile({ preserveFocus: false });
                            return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                        },
                        accept: async () => {
                            await configManager.selectConfiguration(config.launch, config.name);
                            try {
                                await this.debugService.startDebugging(config.launch, undefined, { startedByUser: true });
                            }
                            catch (error) {
                                this.notificationService.error(error);
                            }
                        }
                    });
                }
            }
            // Entries detected configurations
            const dynamicProviders = await configManager.getDynamicProviders();
            if (dynamicProviders.length > 0) {
                picks.push({
                    type: 'separator', label: (0, nls_1.localize)({
                        key: 'contributed',
                        comment: ['contributed is lower case because it looks better like that in UI. Nothing preceeds it. It is a name of the grouping of debug configurations.']
                    }, "contributed")
                });
            }
            configManager.getRecentDynamicConfigurations().forEach(({ name, type }) => {
                const highlights = (0, filters_1.matchesFuzzy)(filter, name, true);
                if (highlights) {
                    picks.push({
                        label: name,
                        highlights: { label: highlights },
                        buttons: [{
                                iconClass: themables_1.ThemeIcon.asClassName(debugIcons_1.debugRemoveConfig),
                                tooltip: (0, nls_1.localize)('removeLaunchConfig', "Remove Launch Configuration")
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
                                await this.debugService.startDebugging(launch, config, { startedByUser: true });
                            }
                            catch (error) {
                                this.notificationService.error(error);
                            }
                        }
                    });
                }
            });
            dynamicProviders.forEach(provider => {
                picks.push({
                    label: `$(folder) ${provider.label}...`,
                    ariaLabel: (0, nls_1.localize)({ key: 'providerAriaLabel', comment: ['Placeholder stands for the provider label. For example "NodeJS".'] }, "{0} contributed configurations", provider.label),
                    accept: async () => {
                        const pick = await provider.pick();
                        if (pick) {
                            // Use the type of the provider, not of the config since config sometimes have subtypes (for example "node-terminal")
                            await configManager.selectConfiguration(pick.launch, pick.config.name, pick.config, { type: provider.type });
                            this.debugService.startDebugging(pick.launch, pick.config, { startedByUser: true });
                        }
                    }
                });
            });
            // Entries: launches
            const visibleLaunches = configManager.getLaunches().filter(launch => !launch.hidden);
            // Separator
            if (visibleLaunches.length > 0) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)('configure', "configure") });
            }
            for (const launch of visibleLaunches) {
                const label = this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ?
                    (0, nls_1.localize)("addConfigTo", "Add Config ({0})...", launch.name) :
                    (0, nls_1.localize)('addConfiguration', "Add Configuration...");
                // Add Config entry
                picks.push({
                    label,
                    description: this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ? launch.name : '',
                    highlights: { label: (0, filters_1.matchesFuzzy)(filter, label, true) ?? undefined },
                    accept: () => this.commandService.executeCommand(debugCommands_1.ADD_CONFIGURATION_ID, launch.uri.toString())
                });
            }
            return picks;
        }
    };
    exports.StartDebugQuickAccessProvider = StartDebugQuickAccessProvider;
    exports.StartDebugQuickAccessProvider = StartDebugQuickAccessProvider = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, commands_1.ICommandService),
        __param(3, notification_1.INotificationService)
    ], StartDebugQuickAccessProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvZGVidWdRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFjekYsSUFBTSw2QkFBNkIsR0FBbkMsTUFBTSw2QkFBOEIsU0FBUSw2Q0FBaUQ7UUFFbkcsWUFDaUMsWUFBMkIsRUFDaEIsY0FBd0MsRUFDakQsY0FBK0IsRUFDMUIsbUJBQXlDO1lBRWhGLEtBQUssQ0FBQyx5Q0FBeUIsRUFBRTtnQkFDaEMsYUFBYSxFQUFFO29CQUNkLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxtQ0FBbUMsQ0FBQztpQkFDdEU7YUFDRCxDQUFDLENBQUM7WUFUNkIsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDaEIsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQ2pELG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUMxQix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1FBT2pGLENBQUM7UUFFUyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQWM7WUFDdkMsTUFBTSxLQUFLLEdBQXdELEVBQUUsQ0FBQztZQUN0RSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLG1CQUFtQixFQUFFLEVBQUU7Z0JBQ2pFLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztZQUV4RCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFFbEUsbUJBQW1CO1lBQ25CLElBQUksU0FBNkIsQ0FBQztZQUNsQyxLQUFL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