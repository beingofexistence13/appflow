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
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/common/views"], function (require, exports, nls_1, instantiation_1, log_1, storage_1, uriIdentity_1, userDataProfileStorageService_1, editorCommands_1, views_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GlobalStateResourceImportTreeItem = exports.GlobalStateResourceExportTreeItem = exports.GlobalStateResourceTreeItem = exports.GlobalStateResource = exports.GlobalStateResourceInitializer = void 0;
    let GlobalStateResourceInitializer = class GlobalStateResourceInitializer {
        constructor(storageService) {
            this.storageService = storageService;
        }
        async initialize(content) {
            const globalState = JSON.parse(content);
            const storageKeys = Object.keys(globalState.storage);
            if (storageKeys.length) {
                const storageEntries = [];
                for (const key of storageKeys) {
                    storageEntries.push({ key, value: globalState.storage[key], scope: 0 /* StorageScope.PROFILE */, target: 0 /* StorageTarget.USER */ });
                }
                this.storageService.storeAll(storageEntries, true);
            }
        }
    };
    exports.GlobalStateResourceInitializer = GlobalStateResourceInitializer;
    exports.GlobalStateResourceInitializer = GlobalStateResourceInitializer = __decorate([
        __param(0, storage_1.IStorageService)
    ], GlobalStateResourceInitializer);
    let GlobalStateResource = class GlobalStateResource {
        constructor(storageService, userDataProfileStorageService, logService) {
            this.storageService = storageService;
            this.userDataProfileStorageService = userDataProfileStorageService;
            this.logService = logService;
        }
        async getContent(profile) {
            const globalState = await this.getGlobalState(profile);
            return JSON.stringify(globalState);
        }
        async apply(content, profile) {
            const globalState = JSON.parse(content);
            await this.writeGlobalState(globalState, profile);
        }
        async getGlobalState(profile) {
            const storage = {};
            const storageData = await this.userDataProfileStorageService.readStorageData(profile);
            for (const [key, value] of storageData) {
                if (value.value !== undefined && value.target === 0 /* StorageTarget.USER */) {
                    storage[key] = value.value;
                }
            }
            return { storage };
        }
        async writeGlobalState(globalState, profile) {
            const storageKeys = Object.keys(globalState.storage);
            if (storageKeys.length) {
                const updatedStorage = new Map();
                const nonProfileKeys = [
                    // Do not include application scope user target keys because they also include default profile user target keys
                    ...this.storageService.keys(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */),
                    ...this.storageService.keys(1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */),
                    ...this.storageService.keys(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */),
                ];
                for (const key of storageKeys) {
                    if (nonProfileKeys.includes(key)) {
                        this.logService.info(`Importing Profile (${profile.name}): Ignoring global state key '${key}' because it is not a profile key.`);
                    }
                    else {
                        updatedStorage.set(key, globalState.storage[key]);
                    }
                }
                await this.userDataProfileStorageService.updateStorageData(profile, updatedStorage, 0 /* StorageTarget.USER */);
            }
        }
    };
    exports.GlobalStateResource = GlobalStateResource;
    exports.GlobalStateResource = GlobalStateResource = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, userDataProfileStorageService_1.IUserDataProfileStorageService),
        __param(2, log_1.ILogService)
    ], GlobalStateResource);
    class GlobalStateResourceTreeItem {
        constructor(resource, uriIdentityService) {
            this.resource = resource;
            this.uriIdentityService = uriIdentityService;
            this.type = "globalState" /* ProfileResourceType.GlobalState */;
            this.handle = "globalState" /* ProfileResourceType.GlobalState */;
            this.label = { label: (0, nls_1.localize)('globalState', "UI State") };
            this.collapsibleState = views_1.TreeItemCollapsibleState.Collapsed;
        }
        async getChildren() {
            return [{
                    handle: this.resource.toString(),
                    resourceUri: this.resource,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    accessibilityInformation: {
                        label: this.uriIdentityService.extUri.basename(this.resource)
                    },
                    parent: this,
                    command: {
                        id: editorCommands_1.API_OPEN_EDITOR_COMMAND_ID,
                        title: '',
                        arguments: [this.resource, undefined, undefined]
                    }
                }];
        }
    }
    exports.GlobalStateResourceTreeItem = GlobalStateResourceTreeItem;
    let GlobalStateResourceExportTreeItem = class GlobalStateResourceExportTreeItem extends GlobalStateResourceTreeItem {
        constructor(profile, resource, uriIdentityService, instantiationService) {
            super(resource, uriIdentityService);
            this.profile = profile;
            this.instantiationService = instantiationService;
        }
        async hasContent() {
            const globalState = await this.instantiationService.createInstance(GlobalStateResource).getGlobalState(this.profile);
            return Object.keys(globalState.storage).length > 0;
        }
        async getContent() {
            return this.instantiationService.createInstance(GlobalStateResource).getContent(this.profile);
        }
        isFromDefaultProfile() {
            return !this.profile.isDefault && !!this.profile.useDefaultFlags?.globalState;
        }
    };
    exports.GlobalStateResourceExportTreeItem = GlobalStateResourceExportTreeItem;
    exports.GlobalStateResourceExportTreeItem = GlobalStateResourceExportTreeItem = __decorate([
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, instantiation_1.IInstantiationService)
    ], GlobalStateResourceExportTreeItem);
    let GlobalStateResourceImportTreeItem = class GlobalStateResourceImportTreeItem extends GlobalStateResourceTreeItem {
        constructor(content, resource, uriIdentityService) {
            super(resource, uriIdentityService);
            this.content = content;
        }
        async getContent() {
            return this.content;
        }
        isFromDefaultProfile() {
            return false;
        }
    };
    exports.GlobalStateResourceImportTreeItem = GlobalStateResourceImportTreeItem;
    exports.GlobalStateResourceImportTreeItem = GlobalStateResourceImportTreeItem = __decorate([
        __param(2, uriIdentity_1.IUriIdentityService)
    ], GlobalStateResourceImportTreeItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU3RhdGVSZXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVByb2ZpbGUvYnJvd3Nlci9nbG9iYWxTdGF0ZVJlc291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW1CekYsSUFBTSw4QkFBOEIsR0FBcEMsTUFBTSw4QkFBOEI7UUFFMUMsWUFBOEMsY0FBK0I7WUFBL0IsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1FBQzdFLENBQUM7UUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQWU7WUFDL0IsTUFBTSxXQUFXLEdBQWlCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckQsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO2dCQUN2QixNQUFNLGNBQWMsR0FBeUIsRUFBRSxDQUFDO2dCQUNoRCxLQUFLLE1BQU0sR0FBRyxJQUFJLFdBQVcsRUFBRTtvQkFDOUIsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLDhCQUFzQixFQUFFLE1BQU0sNEJBQW9CLEVBQUUsQ0FBQyxDQUFDO2lCQUN2SDtnQkFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDbkQ7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQWhCWSx3RUFBOEI7NkNBQTlCLDhCQUE4QjtRQUU3QixXQUFBLHlCQUFlLENBQUE7T0FGaEIsOEJBQThCLENBZ0IxQztJQUVNLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW1C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