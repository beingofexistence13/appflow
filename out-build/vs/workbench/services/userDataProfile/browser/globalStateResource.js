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
define(["require", "exports", "vs/nls!vs/workbench/services/userDataProfile/browser/globalStateResource", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/common/views"], function (require, exports, nls_1, instantiation_1, log_1, storage_1, uriIdentity_1, userDataProfileStorageService_1, editorCommands_1, views_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qAb = exports.$pAb = exports.$oAb = exports.$nAb = exports.$mAb = void 0;
    let $mAb = class $mAb {
        constructor(a) {
            this.a = a;
        }
        async initialize(content) {
            const globalState = JSON.parse(content);
            const storageKeys = Object.keys(globalState.storage);
            if (storageKeys.length) {
                const storageEntries = [];
                for (const key of storageKeys) {
                    storageEntries.push({ key, value: globalState.storage[key], scope: 0 /* StorageScope.PROFILE */, target: 0 /* StorageTarget.USER */ });
                }
                this.a.storeAll(storageEntries, true);
            }
        }
    };
    exports.$mAb = $mAb;
    exports.$mAb = $mAb = __decorate([
        __param(0, storage_1.$Vo)
    ], $mAb);
    let $nAb = class $nAb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async getContent(profile) {
            const globalState = await this.getGlobalState(profile);
            return JSON.stringify(globalState);
        }
        async apply(content, profile) {
            const globalState = JSON.parse(content);
            await this.d(globalState, profile);
        }
        async getGlobalState(profile) {
            const storage = {};
            const storageData = await this.b.readStorageData(profile);
            for (const [key, value] of storageData) {
                if (value.value !== undefined && value.target === 0 /* StorageTarget.USER */) {
                    storage[key] = value.value;
                }
            }
            return { storage };
        }
        async d(globalState, profile) {
            const storageKeys = Object.keys(globalState.storage);
            if (storageKeys.length) {
                const updatedStorage = new Map();
                const nonProfileKeys = [
                    // Do not include application scope user target keys because they also include default profile user target keys
                    ...this.a.keys(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */),
                    ...this.a.keys(1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */),
                    ...this.a.keys(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */),
                ];
                for (const key of storageKeys) {
                    if (nonProfileKeys.includes(key)) {
                        this.c.info(`Importing Profile (${profile.name}): Ignoring global state key '${key}' because it is not a profile key.`);
                    }
                    else {
                        updatedStorage.set(key, globalState.storage[key]);
                    }
                }
                await this.b.updateStorageData(profile, updatedStorage, 0 /* StorageTarget.USER */);
            }
        }
    };
    exports.$nAb = $nAb;
    exports.$nAb = $nAb = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, userDataProfileStorageService_1.$eAb),
        __param(2, log_1.$5i)
    ], $nAb);
    class $oAb {
        constructor(a, b) {
            this.a = a;
            this.b = b;
            this.type = "globalState" /* ProfileResourceType.GlobalState */;
            this.handle = "globalState" /* ProfileResourceType.GlobalState */;
            this.label = { label: (0, nls_1.localize)(0, null) };
            this.collapsibleState = views_1.TreeItemCollapsibleState.Collapsed;
        }
        async getChildren() {
            return [{
                    handle: this.a.toString(),
                    resourceUri: this.a,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    accessibilityInformation: {
                        label: this.b.extUri.basename(this.a)
                    },
                    parent: this,
                    command: {
                        id: editorCommands_1.$Wub,
                        title: '',
                        arguments: [this.a, undefined, undefined]
                    }
                }];
        }
    }
    exports.$oAb = $oAb;
    let $pAb = class $pAb extends $oAb {
        constructor(c, resource, uriIdentityService, d) {
            super(resource, uriIdentityService);
            this.c = c;
            this.d = d;
        }
        async hasContent() {
            const globalState = await this.d.createInstance($nAb).getGlobalState(this.c);
            return Object.keys(globalState.storage).length > 0;
        }
        async getContent() {
            return this.d.createInstance($nAb).getContent(this.c);
        }
        isFromDefaultProfile() {
            return !this.c.isDefault && !!this.c.useDefaultFlags?.globalState;
        }
    };
    exports.$pAb = $pAb;
    exports.$pAb = $pAb = __decorate([
        __param(2, uriIdentity_1.$Ck),
        __param(3, instantiation_1.$Ah)
    ], $pAb);
    let $qAb = class $qAb extends $oAb {
        constructor(c, resource, uriIdentityService) {
            super(resource, uriIdentityService);
            this.c = c;
        }
        async getContent() {
            return this.c;
        }
        isFromDefaultProfile() {
            return false;
        }
    };
    exports.$qAb = $qAb;
    exports.$qAb = $qAb = __decorate([
        __param(2, uriIdentity_1.$Ck)
    ], $qAb);
});
//# sourceMappingURL=globalStateResource.js.map