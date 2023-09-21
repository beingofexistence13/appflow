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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/types", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/workbench/common/contributions", "vs/workbench/contrib/extensions/common/extensions"], function (require, exports, actions_1, errors_1, types_1, nls_1, configuration_1, notification_1, opener_1, platform_1, storage_1, contributions_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let DeprecatedExtensionMigratorContribution = class DeprecatedExtensionMigratorContribution {
        constructor(configurationService, extensionsWorkbenchService, storageService, notificationService, openerService) {
            this.configurationService = configurationService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.storageService = storageService;
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.storageKey = 'deprecatedExtensionMigrator.state';
            this.init().catch(errors_1.onUnexpectedError);
        }
        async init() {
            const bracketPairColorizerId = 'coenraads.bracket-pair-colorizer';
            await this.extensionsWorkbenchService.queryLocal();
            const extension = this.extensionsWorkbenchService.installed.find(e => e.identifier.id === bracketPairColorizerId);
            if (!extension ||
                ((extension.enablementState !== 8 /* EnablementState.EnabledGlobally */) &&
                    (extension.enablementState !== 9 /* EnablementState.EnabledWorkspace */))) {
                return;
            }
            const state = await this.getState();
            const disablementLogEntry = state.disablementLog.some(d => d.extensionId === bracketPairColorizerId);
            if (disablementLogEntry) {
                return;
            }
            state.disablementLog.push({ extensionId: bracketPairColorizerId, disablementDateTime: new Date().getTime() });
            await this.setState(state);
            await this.extensionsWorkbenchService.setEnablement(extension, 6 /* EnablementState.DisabledGlobally */);
            const nativeBracketPairColorizationEnabledKey = 'editor.bracketPairColorization.enabled';
            const bracketPairColorizationEnabled = !!this.configurationService.inspect(nativeBracketPairColorizationEnabledKey).user;
            this.notificationService.notify({
                message: (0, nls_1.localize)('bracketPairColorizer.notification', "The extension 'Bracket pair Colorizer' got disabled because it was deprecated."),
                severity: notification_1.Severity.Info,
                actions: {
                    primary: [
                        new actions_1.Action('', (0, nls_1.localize)('bracketPairColorizer.notification.action.uninstall', "Uninstall Extension"), undefined, undefined, () => {
                            this.extensionsWorkbenchService.uninstall(extension);
                        }),
                    ],
                    secondary: [
                        !bracketPairColorizationEnabled ? new actions_1.Action('', (0, nls_1.localize)('bracketPairColorizer.notification.action.enableNative', "Enable Native Bracket Pair Colorization"), undefined, undefined, () => {
                            this.configurationService.updateValue(nativeBracketPairColorizationEnabledKey, true, 2 /* ConfigurationTarget.USER */);
                        }) : undefined,
                        new actions_1.Action('', (0, nls_1.localize)('bracketPairColorizer.notification.action.showMoreInfo', "More Info"), undefined, undefined, () => {
                            this.openerService.open('https://github.com/microsoft/vscode/issues/155179');
                        }),
                    ].filter(types_1.isDefined),
                }
            });
        }
        async getState() {
            const jsonStr = await this.storageService.get(this.storageKey, -1 /* StorageScope.APPLICATION */, '');
            if (jsonStr === '') {
                return { disablementLog: [] };
            }
            return JSON.parse(jsonStr);
        }
        async setState(state) {
            const json = JSON.stringify(state);
            await this.storageService.store(this.storageKey, json, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
    };
    DeprecatedExtensionMigratorContribution = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, storage_1.IStorageService),
        __param(3, notification_1.INotificationService),
        __param(4, opener_1.IOpenerService)
    ], DeprecatedExtensionMigratorContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(DeprecatedExtensionMigratorContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwcmVjYXRlZEV4dGVuc2lvbk1pZ3JhdG9yLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlcHJlY2F0ZWRFeHRlbnNpb25NaWdyYXRvci9icm93c2VyL2RlcHJlY2F0ZWRFeHRlbnNpb25NaWdyYXRvci5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFnQmhHLElBQU0sdUNBQXVDLEdBQTdDLE1BQU0sdUNBQXVDO1FBQzVDLFlBQ3dCLG9CQUE0RCxFQUN0RCwwQkFBd0UsRUFDcEYsY0FBZ0QsRUFDM0MsbUJBQTBELEVBQ2hFLGFBQThDO1lBSnRCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDckMsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE2QjtZQUNuRSxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDMUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUMvQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFzRDlDLGVBQVUsR0FBRyxtQ0FBbUMsQ0FBQztZQXBEakUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQywwQkFBaUIsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFTyxLQUFLLENBQUMsSUFBSTtZQUNqQixNQUFNLHNCQUFzQixHQUFHLGtDQUFrQyxDQUFDO1lBRWxFLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ25ELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssc0JBQXNCLENBQUMsQ0FBQztZQUNsSCxJQUNDLENBQUMsU0FBUztnQkFDVixDQUFDLENB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