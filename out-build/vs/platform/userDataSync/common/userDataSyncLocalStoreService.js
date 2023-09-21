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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/date", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, async_1, buffer_1, date_1, lifecycle_1, resources_1, configuration_1, environment_1, files_1, userDataProfile_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$F4b = void 0;
    let $F4b = class $F4b extends lifecycle_1.$kc {
        constructor(a, b, c, f, g) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h();
        }
        async h() {
            for (const profile of this.g.profiles) {
                for (const resource of userDataSync_1.$Bgb) {
                    try {
                        await this.m(this.j(resource, profile.isDefault ? undefined : profile.id));
                    }
                    catch (error) {
                        this.f.error(error);
                    }
                }
            }
            let stat;
            try {
                stat = await this.b.resolve(this.a.userDataSyncHome);
            }
            catch (error) {
                if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.f.error(error);
                }
                return;
            }
            if (stat.children) {
                for (const child of stat.children) {
                    if (child.isDirectory && !this.g.profiles.some(profile => profile.id === child.name)) {
                        try {
                            this.f.info('Deleting non existing profile from backup', child.resource.path);
                            await this.b.del(child.resource, { recursive: true });
                        }
                        catch (error) {
                            this.f.error(error);
                        }
                    }
                }
            }
        }
        async getAllResourceRefs(resource, collection, root) {
            const folder = this.j(resource, collection, root);
            try {
                const stat = await this.b.resolve(folder);
                if (stat.children) {
                    const all = stat.children.filter(stat => stat.isFile && !stat.name.startsWith('lastSync')).sort().reverse();
                    return all.map(stat => ({
                        ref: stat.name,
                        created: this.n(stat)
                    }));
                }
            }
            catch (error) {
                if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    throw error;
                }
            }
            return [];
        }
        async resolveResourceContent(resourceKey, ref, collection, root) {
            const folder = this.j(resourceKey, collection, root);
            const file = (0, resources_1.$ig)(folder, ref);
            try {
                const content = await this.b.readFile(file);
                return content.value.toString();
            }
            catch (error) {
                this.f.error(error);
                return null;
            }
        }
        async writeResource(resourceKey, content, cTime, collection, root) {
            const folder = this.j(resourceKey, collection, root);
            const resource = (0, resources_1.$ig)(folder, `${(0, date_1.$7l)(cTime).replace(/-|:|\.\d+Z$/g, '')}.json`);
            try {
                await this.b.writeFile(resource, buffer_1.$Fd.fromString(content));
            }
            catch (e) {
                this.f.error(e);
            }
        }
        j(resource, collection, root = this.a.userDataSyncHome) {
            return (0, resources_1.$ig)(root, ...(collection ? [collection, resource] : [resource]));
        }
        async m(folder) {
            try {
                try {
                    if (!(await this.b.exists(folder))) {
                        return;
                    }
                }
                catch (e) {
                    return;
                }
                const stat = await this.b.resolve(folder);
                if (stat.children) {
                    const all = stat.children.filter(stat => stat.isFile && /^\d{8}T\d{6}(\.json)?$/.test(stat.name)).sort();
                    const backUpMaxAge = 1000 * 60 * 60 * 24 * (this.c.getValue('sync.localBackupDuration') || 30 /* Default 30 days */);
                    let toDelete = all.filter(stat => Date.now() - this.n(stat) > backUpMaxAge);
                    const remaining = all.length - toDelete.length;
                    if (remaining < 10) {
                        toDelete = toDelete.slice(10 - remaining);
                    }
                    await async_1.Promises.settled(toDelete.map(async (stat) => {
                        this.f.info('Deleting from backup', stat.resource.path);
                        await this.b.del(stat.resource);
                    }));
                }
            }
            catch (e) {
                this.f.error(e);
            }
        }
        n(stat) {
            return new Date(parseInt(stat.name.substring(0, 4)), parseInt(stat.name.substring(4, 6)) - 1, parseInt(stat.name.substring(6, 8)), parseInt(stat.name.substring(9, 11)), parseInt(stat.name.substring(11, 13)), parseInt(stat.name.substring(13, 15))).getTime();
        }
    };
    exports.$F4b = $F4b;
    exports.$F4b = $F4b = __decorate([
        __param(0, environment_1.$Ih),
        __param(1, files_1.$6j),
        __param(2, configuration_1.$8h),
        __param(3, userDataSync_1.$Ugb),
        __param(4, userDataProfile_1.$Ek)
    ], $F4b);
});
//# sourceMappingURL=userDataSyncLocalStoreService.js.map