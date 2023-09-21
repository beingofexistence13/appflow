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
define(["require", "exports", "vs/base/common/buffer", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/platform", "vs/workbench/common/views", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/instantiation/common/instantiation", "vs/nls", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, buffer_1, files_1, log_1, userDataProfile_1, platform_1, views_1, editorCommands_1, instantiation_1, nls_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeybindingsResourceTreeItem = exports.KeybindingsResource = exports.KeybindingsResourceInitializer = void 0;
    let KeybindingsResourceInitializer = class KeybindingsResourceInitializer {
        constructor(userDataProfileService, fileService, logService) {
            this.userDataProfileService = userDataProfileService;
            this.fileService = fileService;
            this.logService = logService;
        }
        async initialize(content) {
            const keybindingsContent = JSON.parse(content);
            if (keybindingsContent.keybindings === null) {
                this.logService.info(`Initializing Profile: No keybindings to apply...`);
                return;
            }
            await this.fileService.writeFile(this.userDataProfileService.currentProfile.keybindingsResource, buffer_1.VSBuffer.fromString(keybindingsContent.keybindings));
        }
    };
    exports.KeybindingsResourceInitializer = KeybindingsResourceInitializer;
    exports.KeybindingsResourceInitializer = KeybindingsResourceInitializer = __decorate([
        __param(0, userDataProfile_1.IUserDataProfileService),
        __param(1, files_1.IFileService),
        __param(2, log_1.ILogService)
    ], KeybindingsResourceInitializer);
    let KeybindingsResource = class KeybindingsResource {
        constructor(fileService, logService) {
            this.fileService = fileService;
            this.logService = logService;
        }
        async getContent(profile) {
            const keybindingsContent = await this.getKeybindingsResourceContent(profile);
            return JSON.stringify(keybindingsContent);
        }
        async getKeybindingsResourceContent(profile) {
            const keybindings = await this.getKeybindingsContent(profile);
            return { keybindings, platform: platform_1.platform };
        }
        async apply(content, profile) {
            const keybindingsContent = JSON.parse(content);
            if (keybindingsContent.keybindings === null) {
                this.logService.info(`Importing Profile (${profile.name}): No keybindings to apply...`);
                return;
            }
            await this.fileService.writeFile(profile.keybindingsResource, buffer_1.VSBuffer.fromString(keybindingsContent.keybindings));
        }
        async getKeybindingsContent(profile) {
            try {
                const content = await this.fileService.readFile(profile.keybindingsResource);
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
    exports.KeybindingsResource = KeybindingsResource;
    exports.KeybindingsResource = KeybindingsResource = __decorate([
        __param(0, files_1.IFileService),
        __param(1, log_1.ILogService)
    ], KeybindingsResource);
    let KeybindingsResourceTreeItem = class KeybindingsResourceTreeItem {
        constructor(profile, uriIdentityService, instantiationService) {
            this.profile = profile;
            this.uriIdentityService = uriIdentityService;
            this.instantiationService = instantiationService;
            this.type = "keybindings" /* ProfileResourceType.Keybindings */;
            this.handle = "keybindings" /* ProfileResourceType.Keybindings */;
            this.label = { label: (0, nls_1.localize)('keybindings', "Keyboard Shortcuts") };
            this.collapsibleState = views_1.TreeItemCollapsibleState.Expanded;
        }
        isFromDefaultProfile() {
            return !this.profile.isDefault && !!this.profile.useDefaultFlags?.keybindings;
        }
        async getChildren() {
            return [{
                    handle: this.profile.keybindingsResource.toString(),
                    resourceUri: this.profile.keybindingsResource,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    parent: this,
                    accessibilityInformation: {
                        label: this.uriIdentityService.extUri.basename(this.profile.settingsResource)
                    },
                    command: {
                        id: editorCommands_1.API_OPEN_EDITOR_COMMAND_ID,
                        title: '',
                        arguments: [this.profile.keybindingsResource, undefined, undefined]
                    }
                }];
        }
        async hasContent() {
            const keybindingsContent = await this.instantiationService.createInstance(KeybindingsResource).getKeybindingsResourceContent(this.profile);
            return keybindingsContent.keybindings !== null;
        }
        async getContent() {
            return this.instantiationService.createInstance(KeybindingsResource).getContent(this.profile);
        }
    };
    exports.KeybindingsResourceTreeItem = KeybindingsResourceTreeItem;
    exports.KeybindingsResourceTreeItem = KeybindingsResourceTreeItem = __decorate([
        __param(1, uriIdentity_1.IUriIdentityService),
        __param(2, instantiation_1.IInstantiationService)
    ], KeybindingsResourceTreeItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ3NSZXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVByb2ZpbGUvYnJvd3Nlci9rZXliaW5kaW5nc1Jlc291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW1CekYsSUFBTSw4QkFBOEIsR0FBcEMsTUFBTSw4QkFBOEI7UUFFMUMsWUFDMkMsc0JBQStDLEVBQzFELFdBQXlCLEVBQzFCLFVBQXVCO1lBRlgsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUMxRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUMxQixlQUFVLEdBQVYsVUFBVSxDQUFhO1FBRXRELENBQUM7UUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQWU7WUFDL0IsTUFBTSxrQkFBa0IsR0FBZ0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1RSxJQUFJLGtCQUFrQixDQUFDLFdBQVcsS0FBSyxJQUFJLEVBQUU7Z0JBQzVDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGtEQUFrRCxDQUFDLENBQUM7Z0JBQ3pFLE9BQU87YUFDUDtZQUNELE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3ZKLENBQUM7S0FDRCxDQUFBO0lBakJZLHdFQUE4Qjs2Q0FBOUIsOEJBQThCO1FBR3hDLFdBQUEseUNBQXVCLENBQUE7UUFDdkIsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSxpQkFBVyxDQUFBO09BTEQsOEJBQThCLENBaUIxQztJQUVNLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0s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