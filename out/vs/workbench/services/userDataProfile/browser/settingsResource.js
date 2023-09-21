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
define(["require", "exports", "vs/base/common/buffer", "vs/platform/configuration/common/configurationRegistry", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/registry/common/platform", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/settingsMerge", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/common/views", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/instantiation/common/instantiation", "vs/nls", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, buffer_1, configurationRegistry_1, files_1, log_1, platform_1, userDataProfile_1, settingsMerge_1, userDataSync_1, views_1, editorCommands_1, instantiation_1, nls_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SettingsResourceTreeItem = exports.SettingsResource = exports.SettingsResourceInitializer = void 0;
    let SettingsResourceInitializer = class SettingsResourceInitializer {
        constructor(userDataProfileService, fileService, logService) {
            this.userDataProfileService = userDataProfileService;
            this.fileService = fileService;
            this.logService = logService;
        }
        async initialize(content) {
            const settingsContent = JSON.parse(content);
            if (settingsContent.settings === null) {
                this.logService.info(`Initializing Profile: No settings to apply...`);
                return;
            }
            await this.fileService.writeFile(this.userDataProfileService.currentProfile.settingsResource, buffer_1.VSBuffer.fromString(settingsContent.settings));
        }
    };
    exports.SettingsResourceInitializer = SettingsResourceInitializer;
    exports.SettingsResourceInitializer = SettingsResourceInitializer = __decorate([
        __param(0, userDataProfile_1.IUserDataProfileService),
        __param(1, files_1.IFileService),
        __param(2, log_1.ILogService)
    ], SettingsResourceInitializer);
    let SettingsResource = class SettingsResource {
        constructor(fileService, userDataSyncUtilService, logService) {
            this.fileService = fileService;
            this.userDataSyncUtilService = userDataSyncUtilService;
            this.logService = logService;
        }
        async getContent(profile) {
            const settingsContent = await this.getSettingsContent(profile);
            return JSON.stringify(settingsContent);
        }
        async getSettingsContent(profile) {
            const localContent = await this.getLocalFileContent(profile);
            if (localContent === null) {
                return { settings: null };
            }
            else {
                const ignoredSettings = this.getIgnoredSettings();
                const formattingOptions = await this.userDataSyncUtilService.resolveFormattingOptions(profile.settingsResource);
                const settings = (0, settingsMerge_1.updateIgnoredSettings)(localContent || '{}', '{}', ignoredSettings, formattingOptions);
                return { settings };
            }
        }
        async apply(content, profile) {
            const settingsContent = JSON.parse(content);
            if (settingsContent.settings === null) {
                this.logService.info(`Importing Profile (${profile.name}): No settings to apply...`);
                return;
            }
            const localSettingsContent = await this.getLocalFileContent(profile);
            const formattingOptions = await this.userDataSyncUtilService.resolveFormattingOptions(profile.settingsResource);
            const contentToUpdate = (0, settingsMerge_1.updateIgnoredSettings)(settingsContent.settings, localSettingsContent || '{}', this.getIgnoredSettings(), formattingOptions);
            await this.fileService.writeFile(profile.settingsResource, buffer_1.VSBuffer.fromString(contentToUpdate));
        }
        getIgnoredSettings() {
            const allSettings = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            const ignoredSettings = Object.keys(allSettings).filter(key => allSettings[key]?.scope === 2 /* ConfigurationScope.MACHINE */ || allSettings[key]?.scope === 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */);
            return ignoredSettings;
        }
        async getLocalFileContent(profile) {
            try {
                const content = await this.fileService.readFile(profile.settingsResource);
                return content.value.toString();
            }
            catch (error) {
                // File not found
                if (error instanceof files_1.FileOperationError && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    return null;
                }
                else {
                    throw error;
                }
            }
        }
    };
    exports.SettingsResource = SettingsResource;
    exports.SettingsResource = SettingsResource = __decorate([
        __param(0, files_1.IFileService),
        __param(1, userDataSync_1.IUserDataSyncUtilService),
        __param(2, log_1.ILogService)
    ], SettingsResource);
    let SettingsResourceTreeItem = class SettingsResourceTreeItem {
        constructor(profile, uriIdentityService, instantiationService) {
            this.profile = profile;
            this.uriIdentityService = uriIdentityService;
            this.instantiationService = instantiationService;
            this.type = "settings" /* ProfileResourceType.Settings */;
            this.handle = "settings" /* ProfileResourceType.Settings */;
            this.label = { label: (0, nls_1.localize)('settings', "Settings") };
            this.collapsibleState = views_1.TreeItemCollapsibleState.Expanded;
        }
        async getChildren() {
            return [{
                    handle: this.profile.settingsResource.toString(),
                    resourceUri: this.profile.settingsResource,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    parent: this,
                    accessibilityInformation: {
                        label: this.uriIdentityService.extUri.basename(this.profile.settingsResource)
                    },
                    command: {
                        id: editorCommands_1.API_OPEN_EDITOR_COMMAND_ID,
                        title: '',
                        arguments: [this.profile.settingsResource, undefined, undefined]
                    }
                }];
        }
        async hasContent() {
            const settingsContent = await this.instantiationService.createInstance(SettingsResource).getSettingsContent(this.profile);
            return settingsContent.settings !== null;
        }
        async getContent() {
            return this.instantiationService.createInstance(SettingsResource).getContent(this.profile);
        }
        isFromDefaultProfile() {
            return !this.profile.isDefault && !!this.profile.useDefaultFlags?.settings;
        }
    };
    exports.SettingsResourceTreeItem = SettingsResourceTreeItem;
    exports.SettingsResourceTreeItem = SettingsResourceTreeItem = __decorate([
        __param(1, uriIdentity_1.IUriIdentityService),
        __param(2, instantiation_1.IInstantiationService)
    ], SettingsResourceTreeItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NSZXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVByb2ZpbGUvYnJvd3Nlci9zZXR0aW5nc1Jlc291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXFCekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBMkI7UUFFdkMsWUFDMkMsc0JBQStDLEVBQzFELFdBQXlCLEVBQzFCLFVBQXVCO1lBRlgsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUMxRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUMxQixlQUFVLEdBQVYsVUFBVSxDQUFhO1FBRXRELENBQUM7UUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQWU7WUFDL0IsTUFBTSxlQUFlLEdBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUQsSUFBSSxlQUFlLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtnQkFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsK0NBQStDLENBQUMsQ0FBQztnQkFDdEUsT0FBTzthQUNQO1lBQ0QsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsY0FBYyxDQUFDLGdCQUFnQixFQUFFLGlCQUFRLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzlJLENBQUM7S0FDRCxDQUFBO0lBakJZLGtFQUEyQjswQ0FBM0IsMkJBQTJCO1FBR3JDLFdBQUEseUNBQXVCLENBQUE7UUFDdkIsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSxpQkFBVyxDQUFBO09BTEQsMkJBQTJCLENBaUJ2QztJQUVNLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWdCO1FBRTVC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