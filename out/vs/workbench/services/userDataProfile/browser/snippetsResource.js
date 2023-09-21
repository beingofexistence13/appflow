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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/map", "vs/nls", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/common/views", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, buffer_1, map_1, nls_1, files_1, instantiation_1, uriIdentity_1, editorCommands_1, views_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnippetsResourceTreeItem = exports.SnippetsResource = exports.SnippetsResourceInitializer = void 0;
    let SnippetsResourceInitializer = class SnippetsResourceInitializer {
        constructor(userDataProfileService, fileService, uriIdentityService) {
            this.userDataProfileService = userDataProfileService;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
        }
        async initialize(content) {
            const snippetsContent = JSON.parse(content);
            for (const key in snippetsContent.snippets) {
                const resource = this.uriIdentityService.extUri.joinPath(this.userDataProfileService.currentProfile.snippetsHome, key);
                await this.fileService.writeFile(resource, buffer_1.VSBuffer.fromString(snippetsContent.snippets[key]));
            }
        }
    };
    exports.SnippetsResourceInitializer = SnippetsResourceInitializer;
    exports.SnippetsResourceInitializer = SnippetsResourceInitializer = __decorate([
        __param(0, userDataProfile_1.IUserDataProfileService),
        __param(1, files_1.IFileService),
        __param(2, uriIdentity_1.IUriIdentityService)
    ], SnippetsResourceInitializer);
    let SnippetsResource = class SnippetsResource {
        constructor(fileService, uriIdentityService) {
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
        }
        async getContent(profile, excluded) {
            const snippets = await this.getSnippets(profile, excluded);
            return JSON.stringify({ snippets });
        }
        async apply(content, profile) {
            const snippetsContent = JSON.parse(content);
            for (const key in snippetsContent.snippets) {
                const resource = this.uriIdentityService.extUri.joinPath(profile.snippetsHome, key);
                await this.fileService.writeFile(resource, buffer_1.VSBuffer.fromString(snippetsContent.snippets[key]));
            }
        }
        async getSnippets(profile, excluded) {
            const snippets = {};
            const snippetsResources = await this.getSnippetsResources(profile, excluded);
            for (const resource of snippetsResources) {
                const key = this.uriIdentityService.extUri.relativePath(profile.snippetsHome, resource);
                const content = await this.fileService.readFile(resource);
                snippets[key] = content.value.toString();
            }
            return snippets;
        }
        async getSnippetsResources(profile, excluded) {
            const snippets = [];
            let stat;
            try {
                stat = await this.fileService.resolve(profile.snippetsHome);
            }
            catch (e) {
                // No snippets
                if (e instanceof files_1.FileOperationError && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    return snippets;
                }
                else {
                    throw e;
                }
            }
            for (const { resource } of stat.children || []) {
                if (excluded?.has(resource)) {
                    continue;
                }
                const extension = this.uriIdentityService.extUri.extname(resource);
                if (extension === '.json' || extension === '.code-snippets') {
                    snippets.push(resource);
                }
            }
            return snippets;
        }
    };
    exports.SnippetsResource = SnippetsResource;
    exports.SnippetsResource = SnippetsResource = __decorate([
        __param(0, files_1.IFileService),
        __param(1, uriIdentity_1.IUriIdentityService)
    ], SnippetsResource);
    let SnippetsResourceTreeItem = class SnippetsResourceTreeItem {
        constructor(profile, instantiationService, uriIdentityService) {
            this.profile = profile;
            this.instantiationService = instantiationService;
            this.uriIdentityService = uriIdentityService;
            this.type = "snippets" /* ProfileResourceType.Snippets */;
            this.handle = this.profile.snippetsHome.toString();
            this.label = { label: (0, nls_1.localize)('snippets', "Snippets") };
            this.collapsibleState = views_1.TreeItemCollapsibleState.Collapsed;
            this.excludedSnippets = new map_1.ResourceSet();
        }
        async getChildren() {
            const snippetsResources = await this.instantiationService.createInstance(SnippetsResource).getSnippetsResources(this.profile);
            const that = this;
            return snippetsResources.map(resource => ({
                handle: resource.toString(),
                parent: that,
                resourceUri: resource,
                collapsibleState: views_1.TreeItemCollapsibleState.None,
                accessibilityInformation: {
                    label: this.uriIdentityService.extUri.basename(resource),
                },
                checkbox: that.checkbox ? {
                    get isChecked() { return !that.excludedSnippets.has(resource); },
                    set isChecked(value) {
                        if (value) {
                            that.excludedSnippets.delete(resource);
                        }
                        else {
                            that.excludedSnippets.add(resource);
                        }
                    },
                    accessibilityInformation: {
                        label: (0, nls_1.localize)('exclude', "Select Snippet {0}", this.uriIdentityService.extUri.basename(resource)),
                    }
                } : undefined,
                command: {
                    id: editorCommands_1.API_OPEN_EDITOR_COMMAND_ID,
                    title: '',
                    arguments: [resource, undefined, undefined]
                }
            }));
        }
        async hasContent() {
            const snippetsResources = await this.instantiationService.createInstance(SnippetsResource).getSnippetsResources(this.profile);
            return snippetsResources.length > 0;
        }
        async getContent() {
            return this.instantiationService.createInstance(SnippetsResource).getContent(this.profile, this.excludedSnippets);
        }
        isFromDefaultProfile() {
            return !this.profile.isDefault && !!this.profile.useDefaultFlags?.snippets;
        }
    };
    exports.SnippetsResourceTreeItem = SnippetsResourceTreeItem;
    exports.SnippetsResourceTreeItem = SnippetsResourceTreeItem = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, uriIdentity_1.IUriIdentityService)
    ], SnippetsResourceTreeItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldHNSZXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVByb2ZpbGUvYnJvd3Nlci9zbmlwcGV0c1Jlc291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW1CekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBMkI7UUFFdkMsWUFDMkMsc0JBQStDLEVBQzFELFdBQXlCLEVBQ2xCLGtCQUF1QztZQUZuQywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQzFELGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2xCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7UUFFOUUsQ0FBQztRQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZTtZQUMvQixNQUFNLGVBQWUsR0FBcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5RCxLQUFLLE1BQU0sR0FBRyxJQUFJLGVBQWUsQ0FBQyxRQUFRLEVBQUU7Z0JBQzNDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN2SCxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMvRjtRQUNGLENBQUM7S0FDRCxDQUFBO0lBaEJZLGtFQUEyQjswQ0FBM0IsMkJBQTJCO1FBR3JDLFdBQUEseUNBQXVCLENBQUE7UUFDdkIsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSxpQ0FBbUIsQ0FBQTtPQUxULDJC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