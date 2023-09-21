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
define(["require", "exports", "vs/base/common/buffer", "vs/platform/configuration/common/configurationRegistry", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/registry/common/platform", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/settingsMerge", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/common/views", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/instantiation/common/instantiation", "vs/nls!vs/workbench/services/userDataProfile/browser/settingsResource", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, buffer_1, configurationRegistry_1, files_1, log_1, platform_1, userDataProfile_1, settingsMerge_1, userDataSync_1, views_1, editorCommands_1, instantiation_1, nls_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3zb = exports.$2zb = exports.$1zb = void 0;
    let $1zb = class $1zb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async initialize(content) {
            const settingsContent = JSON.parse(content);
            if (settingsContent.settings === null) {
                this.c.info(`Initializing Profile: No settings to apply...`);
                return;
            }
            await this.b.writeFile(this.a.currentProfile.settingsResource, buffer_1.$Fd.fromString(settingsContent.settings));
        }
    };
    exports.$1zb = $1zb;
    exports.$1zb = $1zb = __decorate([
        __param(0, userDataProfile_1.$CJ),
        __param(1, files_1.$6j),
        __param(2, log_1.$5i)
    ], $1zb);
    let $2zb = class $2zb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async getContent(profile) {
            const settingsContent = await this.getSettingsContent(profile);
            return JSON.stringify(settingsContent);
        }
        async getSettingsContent(profile) {
            const localContent = await this.e(profile);
            if (localContent === null) {
                return { settings: null };
            }
            else {
                const ignoredSettings = this.d();
                const formattingOptions = await this.b.resolveFormattingOptions(profile.settingsResource);
                const settings = (0, settingsMerge_1.$Wzb)(localContent || '{}', '{}', ignoredSettings, formattingOptions);
                return { settings };
            }
        }
        async apply(content, profile) {
            const settingsContent = JSON.parse(content);
            if (settingsContent.settings === null) {
                this.c.info(`Importing Profile (${profile.name}): No settings to apply...`);
                return;
            }
            const localSettingsContent = await this.e(profile);
            const formattingOptions = await this.b.resolveFormattingOptions(profile.settingsResource);
            const contentToUpdate = (0, settingsMerge_1.$Wzb)(settingsContent.settings, localSettingsContent || '{}', this.d(), formattingOptions);
            await this.a.writeFile(profile.settingsResource, buffer_1.$Fd.fromString(contentToUpdate));
        }
        d() {
            const allSettings = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
            const ignoredSettings = Object.keys(allSettings).filter(key => allSettings[key]?.scope === 2 /* ConfigurationScope.MACHINE */ || allSettings[key]?.scope === 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */);
            return ignoredSettings;
        }
        async e(profile) {
            try {
                const content = await this.a.readFile(profile.settingsResource);
                return content.value.toString();
            }
            catch (error) {
                // File not found
                if (error instanceof files_1.$nk && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    return null;
                }
                else {
                    throw error;
                }
            }
        }
    };
    exports.$2zb = $2zb;
    exports.$2zb = $2zb = __decorate([
        __param(0, files_1.$6j),
        __param(1, userDataSync_1.$Tgb),
        __param(2, log_1.$5i)
    ], $2zb);
    let $3zb = class $3zb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.type = "settings" /* ProfileResourceType.Settings */;
            this.handle = "settings" /* ProfileResourceType.Settings */;
            this.label = { label: (0, nls_1.localize)(0, null) };
            this.collapsibleState = views_1.TreeItemCollapsibleState.Expanded;
        }
        async getChildren() {
            return [{
                    handle: this.a.settingsResource.toString(),
                    resourceUri: this.a.settingsResource,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    parent: this,
                    accessibilityInformation: {
                        label: this.b.extUri.basename(this.a.settingsResource)
                    },
                    command: {
                        id: editorCommands_1.$Wub,
                        title: '',
                        arguments: [this.a.settingsResource, undefined, undefined]
                    }
                }];
        }
        async hasContent() {
            const settingsContent = await this.c.createInstance($2zb).getSettingsContent(this.a);
            return settingsContent.settings !== null;
        }
        async getContent() {
            return this.c.createInstance($2zb).getContent(this.a);
        }
        isFromDefaultProfile() {
            return !this.a.isDefault && !!this.a.useDefaultFlags?.settings;
        }
    };
    exports.$3zb = $3zb;
    exports.$3zb = $3zb = __decorate([
        __param(1, uriIdentity_1.$Ck),
        __param(2, instantiation_1.$Ah)
    ], $3zb);
});
//# sourceMappingURL=settingsResource.js.map