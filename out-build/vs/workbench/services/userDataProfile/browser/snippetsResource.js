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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/map", "vs/nls!vs/workbench/services/userDataProfile/browser/snippetsResource", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/common/views", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, buffer_1, map_1, nls_1, files_1, instantiation_1, uriIdentity_1, editorCommands_1, views_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9zb = exports.$8zb = exports.$7zb = void 0;
    let $7zb = class $7zb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async initialize(content) {
            const snippetsContent = JSON.parse(content);
            for (const key in snippetsContent.snippets) {
                const resource = this.c.extUri.joinPath(this.a.currentProfile.snippetsHome, key);
                await this.b.writeFile(resource, buffer_1.$Fd.fromString(snippetsContent.snippets[key]));
            }
        }
    };
    exports.$7zb = $7zb;
    exports.$7zb = $7zb = __decorate([
        __param(0, userDataProfile_1.$CJ),
        __param(1, files_1.$6j),
        __param(2, uriIdentity_1.$Ck)
    ], $7zb);
    let $8zb = class $8zb {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        async getContent(profile, excluded) {
            const snippets = await this.c(profile, excluded);
            return JSON.stringify({ snippets });
        }
        async apply(content, profile) {
            const snippetsContent = JSON.parse(content);
            for (const key in snippetsContent.snippets) {
                const resource = this.b.extUri.joinPath(profile.snippetsHome, key);
                await this.a.writeFile(resource, buffer_1.$Fd.fromString(snippetsContent.snippets[key]));
            }
        }
        async c(profile, excluded) {
            const snippets = {};
            const snippetsResources = await this.getSnippetsResources(profile, excluded);
            for (const resource of snippetsResources) {
                const key = this.b.extUri.relativePath(profile.snippetsHome, resource);
                const content = await this.a.readFile(resource);
                snippets[key] = content.value.toString();
            }
            return snippets;
        }
        async getSnippetsResources(profile, excluded) {
            const snippets = [];
            let stat;
            try {
                stat = await this.a.resolve(profile.snippetsHome);
            }
            catch (e) {
                // No snippets
                if (e instanceof files_1.$nk && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
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
                const extension = this.b.extUri.extname(resource);
                if (extension === '.json' || extension === '.code-snippets') {
                    snippets.push(resource);
                }
            }
            return snippets;
        }
    };
    exports.$8zb = $8zb;
    exports.$8zb = $8zb = __decorate([
        __param(0, files_1.$6j),
        __param(1, uriIdentity_1.$Ck)
    ], $8zb);
    let $9zb = class $9zb {
        constructor(b, c, d) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.type = "snippets" /* ProfileResourceType.Snippets */;
            this.handle = this.b.snippetsHome.toString();
            this.label = { label: (0, nls_1.localize)(0, null) };
            this.collapsibleState = views_1.TreeItemCollapsibleState.Collapsed;
            this.a = new map_1.$Ai();
        }
        async getChildren() {
            const snippetsResources = await this.c.createInstance($8zb).getSnippetsResources(this.b);
            const that = this;
            return snippetsResources.map(resource => ({
                handle: resource.toString(),
                parent: that,
                resourceUri: resource,
                collapsibleState: views_1.TreeItemCollapsibleState.None,
                accessibilityInformation: {
                    label: this.d.extUri.basename(resource),
                },
                checkbox: that.checkbox ? {
                    get isChecked() { return !that.a.has(resource); },
                    set isChecked(value) {
                        if (value) {
                            that.a.delete(resource);
                        }
                        else {
                            that.a.add(resource);
                        }
                    },
                    accessibilityInformation: {
                        label: (0, nls_1.localize)(1, null, this.d.extUri.basename(resource)),
                    }
                } : undefined,
                command: {
                    id: editorCommands_1.$Wub,
                    title: '',
                    arguments: [resource, undefined, undefined]
                }
            }));
        }
        async hasContent() {
            const snippetsResources = await this.c.createInstance($8zb).getSnippetsResources(this.b);
            return snippetsResources.length > 0;
        }
        async getContent() {
            return this.c.createInstance($8zb).getContent(this.b, this.a);
        }
        isFromDefaultProfile() {
            return !this.b.isDefault && !!this.b.useDefaultFlags?.snippets;
        }
    };
    exports.$9zb = $9zb;
    exports.$9zb = $9zb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, uriIdentity_1.$Ck)
    ], $9zb);
});
//# sourceMappingURL=snippetsResource.js.map