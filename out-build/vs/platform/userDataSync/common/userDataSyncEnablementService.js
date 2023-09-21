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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/environment/common/environment", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, event_1, lifecycle_1, platform_1, environment_1, storage_1, telemetry_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$u4b = void 0;
    const enablementKey = 'sync.enable';
    let $u4b = class $u4b extends lifecycle_1.$kc {
        constructor(c, f, g, h) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = new event_1.$fd();
            this.onDidChangeEnablement = this.a.event;
            this.b = new event_1.$fd();
            this.onDidChangeResourceEnablement = this.b.event;
            this.B(c.onDidChangeValue(-1 /* StorageScope.APPLICATION */, undefined, this.B(new lifecycle_1.$jc()))(e => this.m(e)));
        }
        isEnabled() {
            switch (this.g.sync) {
                case 'on':
                    return true;
                case 'off':
                    return false;
            }
            return this.c.getBoolean(enablementKey, -1 /* StorageScope.APPLICATION */, false);
        }
        canToggleEnablement() {
            return this.h.userDataSyncStore !== undefined && this.g.sync === undefined;
        }
        setEnablement(enabled) {
            if (enabled && !this.canToggleEnablement()) {
                return;
            }
            this.f.publicLog2(enablementKey, { enabled });
            this.c.store(enablementKey, enabled, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        isResourceEnabled(resource) {
            return this.c.getBoolean((0, userDataSync_1.$Ogb)(resource), -1 /* StorageScope.APPLICATION */, true);
        }
        setResourceEnablement(resource, enabled) {
            if (this.isResourceEnabled(resource) !== enabled) {
                const resourceEnablementKey = (0, userDataSync_1.$Ogb)(resource);
                this.j(resourceEnablementKey, enabled);
            }
        }
        getResourceSyncStateVersion(resource) {
            return undefined;
        }
        j(resourceEnablementKey, enabled) {
            this.c.store(resourceEnablementKey, enabled, -1 /* StorageScope.APPLICATION */, platform_1.$o ? 0 /* StorageTarget.USER */ : 1 /* StorageTarget.MACHINE */);
        }
        m(storageChangeEvent) {
            if (enablementKey === storageChangeEvent.key) {
                this.a.fire(this.isEnabled());
                return;
            }
            const resourceKey = userDataSync_1.$Bgb.filter(resourceKey => (0, userDataSync_1.$Ogb)(resourceKey) === storageChangeEvent.key)[0];
            if (resourceKey) {
                this.b.fire([resourceKey, this.isResourceEnabled(resourceKey)]);
                return;
            }
        }
    };
    exports.$u4b = $u4b;
    exports.$u4b = $u4b = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, telemetry_1.$9k),
        __param(2, environment_1.$Ih),
        __param(3, userDataSync_1.$Egb)
    ], $u4b);
});
//# sourceMappingURL=userDataSyncEnablementService.js.map