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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/parts/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/base/common/event", "vs/platform/storage/common/storageIpc", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, lifecycle_1, storage_1, instantiation_1, storage_2, event_1, storageIpc_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gAb = exports.$fAb = exports.$eAb = void 0;
    exports.$eAb = (0, instantiation_1.$Bh)('IUserDataProfileStorageService');
    let $fAb = class $fAb extends lifecycle_1.$kc {
        constructor(a) {
            super();
            this.a = a;
        }
        async readStorageData(profile) {
            return this.withProfileScopedStorageService(profile, async (storageService) => this.b(storageService));
        }
        async updateStorageData(profile, data, target) {
            return this.withProfileScopedStorageService(profile, async (storageService) => this.c(storageService, data, target));
        }
        async withProfileScopedStorageService(profile, fn) {
            if (this.a.hasScope(profile)) {
                return fn(this.a);
            }
            const storageDatabase = await this.g(profile);
            const storageService = new StorageService(storageDatabase);
            try {
                await storageService.initialize();
                const result = await fn(storageService);
                await storageService.flush();
                return result;
            }
            finally {
                storageService.dispose();
                await this.f(storageDatabase);
            }
        }
        b(storageService) {
            const result = new Map();
            const populate = (target) => {
                for (const key of storageService.keys(0 /* StorageScope.PROFILE */, target)) {
                    result.set(key, { value: storageService.get(key, 0 /* StorageScope.PROFILE */), target });
                }
            };
            populate(0 /* StorageTarget.USER */);
            populate(1 /* StorageTarget.MACHINE */);
            return result;
        }
        c(storageService, items, target) {
            storageService.storeAll(Array.from(items.entries()).map(([key, value]) => ({ key, value, scope: 0 /* StorageScope.PROFILE */, target })), true);
        }
        async f(storageDatabase) {
            try {
                await storageDatabase.close();
            }
            finally {
                if ((0, lifecycle_1.$ec)(storageDatabase)) {
                    storageDatabase.dispose();
                }
            }
        }
    };
    exports.$fAb = $fAb;
    exports.$fAb = $fAb = __decorate([
        __param(0, storage_2.$Vo)
    ], $fAb);
    class $gAb extends $fAb {
        constructor(j, userDataProfilesService, storageService, logService) {
            super(storageService);
            this.j = j;
            const channel = j.getChannel('profileStorageListener');
            const disposable = this.B(new lifecycle_1.$lc());
            this.h = this.B(new event_1.$fd({
                // Start listening to profile storage changes only when someone is listening
                onWillAddFirstListener: () => {
                    disposable.value = channel.listen('onDidChange')(e => {
                        logService.trace('profile storage changes', e);
                        this.h.fire({
                            targetChanges: e.targetChanges.map(profile => (0, userDataProfile_1.$Fk)(profile, userDataProfilesService.profilesHome.scheme)),
                            valueChanges: e.valueChanges.map(e => ({ ...e, profile: (0, userDataProfile_1.$Fk)(e.profile, userDataProfilesService.profilesHome.scheme) }))
                        });
                    });
                },
                // Stop listening to profile storage changes when no one is listening
                onDidRemoveLastListener: () => disposable.value = undefined
            }));
            this.onDidChange = this.h.event;
        }
        async g(profile) {
            const storageChannel = this.j.getChannel('storage');
            return (0, storage_2.$Yo)(profile) ? new storageIpc_1.$aAb(storageChannel) : new storageIpc_1.$bAb(storageChannel, profile);
        }
    }
    exports.$gAb = $gAb;
    class StorageService extends storage_2.$Xo {
        constructor(profileStorageDatabase) {
            super({ flushInterval: 100 });
            this.s = this.B(new storage_1.$Ro(profileStorageDatabase));
        }
        O() {
            return this.s.init();
        }
        P(scope) {
            return scope === 0 /* StorageScope.PROFILE */ ? this.s : undefined;
        }
        Q() { return undefined; }
        async R() { }
        async S() { }
        hasScope() { return false; }
    }
});
//# sourceMappingURL=userDataProfileStorageService.js.map