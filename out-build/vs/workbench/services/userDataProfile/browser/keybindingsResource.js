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
define(["require", "exports", "vs/base/common/buffer", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/platform", "vs/workbench/common/views", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/instantiation/common/instantiation", "vs/nls!vs/workbench/services/userDataProfile/browser/keybindingsResource", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, buffer_1, files_1, log_1, userDataProfile_1, platform_1, views_1, editorCommands_1, instantiation_1, nls_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6zb = exports.$5zb = exports.$4zb = void 0;
    let $4zb = class $4zb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async initialize(content) {
            const keybindingsContent = JSON.parse(content);
            if (keybindingsContent.keybindings === null) {
                this.c.info(`Initializing Profile: No keybindings to apply...`);
                return;
            }
            await this.b.writeFile(this.a.currentProfile.keybindingsResource, buffer_1.$Fd.fromString(keybindingsContent.keybindings));
        }
    };
    exports.$4zb = $4zb;
    exports.$4zb = $4zb = __decorate([
        __param(0, userDataProfile_1.$CJ),
        __param(1, files_1.$6j),
        __param(2, log_1.$5i)
    ], $4zb);
    let $5zb = class $5zb {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        async getContent(profile) {
            const keybindingsContent = await this.getKeybindingsResourceContent(profile);
            return JSON.stringify(keybindingsContent);
        }
        async getKeybindingsResourceContent(profile) {
            const keybindings = await this.c(profile);
            return { keybindings, platform: platform_1.$t };
        }
        async apply(content, profile) {
            const keybindingsContent = JSON.parse(content);
            if (keybindingsContent.keybindings === null) {
                this.b.info(`Importing Profile (${profile.name}): No keybindings to apply...`);
                return;
            }
            await this.a.writeFile(profile.keybindingsResource, buffer_1.$Fd.fromString(keybindingsContent.keybindings));
        }
        async c(profile) {
            try {
                const content = await this.a.readFile(profile.keybindingsResource);
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
    exports.$5zb = $5zb;
    exports.$5zb = $5zb = __decorate([
        __param(0, files_1.$6j),
        __param(1, log_1.$5i)
    ], $5zb);
    let $6zb = class $6zb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.type = "keybindings" /* ProfileResourceType.Keybindings */;
            this.handle = "keybindings" /* ProfileResourceType.Keybindings */;
            this.label = { label: (0, nls_1.localize)(0, null) };
            this.collapsibleState = views_1.TreeItemCollapsibleState.Expanded;
        }
        isFromDefaultProfile() {
            return !this.a.isDefault && !!this.a.useDefaultFlags?.keybindings;
        }
        async getChildren() {
            return [{
                    handle: this.a.keybindingsResource.toString(),
                    resourceUri: this.a.keybindingsResource,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    parent: this,
                    accessibilityInformation: {
                        label: this.b.extUri.basename(this.a.settingsResource)
                    },
                    command: {
                        id: editorCommands_1.$Wub,
                        title: '',
                        arguments: [this.a.keybindingsResource, undefined, undefined]
                    }
                }];
        }
        async hasContent() {
            const keybindingsContent = await this.c.createInstance($5zb).getKeybindingsResourceContent(this.a);
            return keybindingsContent.keybindings !== null;
        }
        async getContent() {
            return this.c.createInstance($5zb).getContent(this.a);
        }
    };
    exports.$6zb = $6zb;
    exports.$6zb = $6zb = __decorate([
        __param(1, uriIdentity_1.$Ck),
        __param(2, instantiation_1.$Ah)
    ], $6zb);
});
//# sourceMappingURL=keybindingsResource.js.map