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
define(["require", "exports", "vs/base/common/buffer", "vs/nls!vs/workbench/services/userDataProfile/browser/tasksResource", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/common/views", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, buffer_1, nls_1, files_1, instantiation_1, log_1, uriIdentity_1, editorCommands_1, views_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_zb = exports.$$zb = exports.$0zb = void 0;
    let $0zb = class $0zb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async initialize(content) {
            const tasksContent = JSON.parse(content);
            if (!tasksContent.tasks) {
                this.c.info(`Initializing Profile: No tasks to apply...`);
                return;
            }
            await this.b.writeFile(this.a.currentProfile.tasksResource, buffer_1.$Fd.fromString(tasksContent.tasks));
        }
    };
    exports.$0zb = $0zb;
    exports.$0zb = $0zb = __decorate([
        __param(0, userDataProfile_1.$CJ),
        __param(1, files_1.$6j),
        __param(2, log_1.$5i)
    ], $0zb);
    let $$zb = class $$zb {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        async getContent(profile) {
            const tasksContent = await this.getTasksResourceContent(profile);
            return JSON.stringify(tasksContent);
        }
        async getTasksResourceContent(profile) {
            const tasksContent = await this.c(profile);
            return { tasks: tasksContent };
        }
        async apply(content, profile) {
            const tasksContent = JSON.parse(content);
            if (!tasksContent.tasks) {
                this.b.info(`Importing Profile (${profile.name}): No tasks to apply...`);
                return;
            }
            await this.a.writeFile(profile.tasksResource, buffer_1.$Fd.fromString(tasksContent.tasks));
        }
        async c(profile) {
            try {
                const content = await this.a.readFile(profile.tasksResource);
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
    exports.$$zb = $$zb;
    exports.$$zb = $$zb = __decorate([
        __param(0, files_1.$6j),
        __param(1, log_1.$5i)
    ], $$zb);
    let $_zb = class $_zb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.type = "tasks" /* ProfileResourceType.Tasks */;
            this.handle = "tasks" /* ProfileResourceType.Tasks */;
            this.label = { label: (0, nls_1.localize)(0, null) };
            this.collapsibleState = views_1.TreeItemCollapsibleState.Expanded;
        }
        async getChildren() {
            return [{
                    handle: this.a.tasksResource.toString(),
                    resourceUri: this.a.tasksResource,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    parent: this,
                    accessibilityInformation: {
                        label: this.b.extUri.basename(this.a.settingsResource)
                    },
                    command: {
                        id: editorCommands_1.$Wub,
                        title: '',
                        arguments: [this.a.tasksResource, undefined, undefined]
                    }
                }];
        }
        async hasContent() {
            const tasksContent = await this.c.createInstance($$zb).getTasksResourceContent(this.a);
            return tasksContent.tasks !== null;
        }
        async getContent() {
            return this.c.createInstance($$zb).getContent(this.a);
        }
        isFromDefaultProfile() {
            return !this.a.isDefault && !!this.a.useDefaultFlags?.tasks;
        }
    };
    exports.$_zb = $_zb;
    exports.$_zb = $_zb = __decorate([
        __param(1, uriIdentity_1.$Ck),
        __param(2, instantiation_1.$Ah)
    ], $_zb);
});
//# sourceMappingURL=tasksResource.js.map