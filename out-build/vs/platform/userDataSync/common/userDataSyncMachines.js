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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/nls!vs/platform/userDataSync/common/userDataSyncMachines", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/product/common/productService", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/storage/common/storage", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, event_1, lifecycle_1, platform_1, strings_1, nls_1, environment_1, files_1, instantiation_1, productService_1, serviceMachineId_1, storage_1, userDataSync_1) {
    "use strict";
    var $ugb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ugb = exports.$tgb = exports.$sgb = void 0;
    exports.$sgb = (0, instantiation_1.$Bh)('IUserDataSyncMachinesService');
    const currentMachineNameKey = 'sync.currentMachineName';
    const Safari = 'Safari';
    const Chrome = 'Chrome';
    const Edge = 'Edge';
    const Firefox = 'Firefox';
    const Android = 'Android';
    function $tgb(platform) {
        switch (platform) {
            case Safari:
            case Chrome:
            case Edge:
            case Firefox:
            case Android:
            case (0, platform_1.$h)(0 /* Platform.Web */):
                return true;
        }
        return false;
    }
    exports.$tgb = $tgb;
    function getPlatformName() {
        if (platform_1.$F) {
            return Safari;
        }
        if (platform_1.$D) {
            return Chrome;
        }
        if (platform_1.$G) {
            return Edge;
        }
        if (platform_1.$E) {
            return Firefox;
        }
        if (platform_1.$H) {
            return Android;
        }
        return (0, platform_1.$h)(platform_1.$o ? 0 /* Platform.Web */ : platform_1.$t);
    }
    let $ugb = class $ugb extends lifecycle_1.$kc {
        static { $ugb_1 = this; }
        static { this.a = 1; }
        static { this.b = 'machines'; }
        constructor(environmentService, fileService, h, j, m, n) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.c = this.B(new event_1.$fd());
            this.onDidChange = this.c.event;
            this.g = null;
            this.f = (0, serviceMachineId_1.$2o)(environmentService, fileService, h);
        }
        async getMachines(manifest) {
            const currentMachineId = await this.f;
            const machineData = await this.s(manifest);
            return machineData.machines.map(machine => ({ ...machine, ...{ isCurrent: machine.id === currentMachineId } }));
        }
        async addCurrentMachine(manifest) {
            const currentMachineId = await this.f;
            const machineData = await this.s(manifest);
            if (!machineData.machines.some(({ id }) => id === currentMachineId)) {
                machineData.machines.push({ id: currentMachineId, name: this.r(machineData.machines), platform: getPlatformName() });
                await this.t(machineData);
            }
        }
        async removeCurrentMachine(manifest) {
            const currentMachineId = await this.f;
            const machineData = await this.s(manifest);
            const updatedMachines = machineData.machines.filter(({ id }) => id !== currentMachineId);
            if (updatedMachines.length !== machineData.machines.length) {
                machineData.machines = updatedMachines;
                await this.t(machineData);
            }
        }
        async renameMachine(machineId, name, manifest) {
            const machineData = await this.s(manifest);
            const machine = machineData.machines.find(({ id }) => id === machineId);
            if (machine) {
                machine.name = name;
                await this.t(machineData);
                const currentMachineId = await this.f;
                if (machineId === currentMachineId) {
                    this.h.store(currentMachineNameKey, name, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                }
            }
        }
        async setEnablements(enablements) {
            const machineData = await this.s();
            for (const [machineId, enabled] of enablements) {
                const machine = machineData.machines.find(machine => machine.id === machineId);
                if (machine) {
                    machine.disabled = enabled ? undefined : true;
                }
            }
            await this.t(machineData);
        }
        r(machines) {
            const previousName = this.h.get(currentMachineNameKey, -1 /* StorageScope.APPLICATION */);
            if (previousName) {
                return previousName;
            }
            const namePrefix = `${this.n.embedderIdentifier ? `${this.n.embedderIdentifier} - ` : ''}${getPlatformName()} (${this.n.nameShort})`;
            const nameRegEx = new RegExp(`${(0, strings_1.$qe)(namePrefix)}\\s#(\\d+)`);
            let nameIndex = 0;
            for (const machine of machines) {
                const matches = nameRegEx.exec(machine.name);
                const index = matches ? parseInt(matches[1]) : 0;
                nameIndex = index > nameIndex ? index : nameIndex;
            }
            return `${namePrefix} #${nameIndex + 1}`;
        }
        async s(manifest) {
            this.g = await this.u(manifest);
            const machinesData = this.w(this.g);
            if (machinesData.version !== $ugb_1.a) {
                throw new Error((0, nls_1.localize)(0, null, this.n.nameLong));
            }
            return machinesData;
        }
        async t(machinesData) {
            const content = JSON.stringify(machinesData);
            const ref = await this.j.writeResource($ugb_1.b, content, this.g?.ref || null);
            this.g = { ref, content };
            this.c.fire();
        }
        async u(manifest) {
            if (this.g) {
                const latestRef = manifest && manifest.latest ? manifest.latest[$ugb_1.b] : undefined;
                // Last time synced resource and latest resource on server are same
                if (this.g.ref === latestRef) {
                    return this.g;
                }
                // There is no resource on server and last time it was synced with no resource
                if (latestRef === undefined && this.g.content === null) {
                    return this.g;
                }
            }
            return this.j.readResource($ugb_1.b, this.g);
        }
        w(userData) {
            if (userData.content !== null) {
                try {
                    return JSON.parse(userData.content);
                }
                catch (e) {
                    this.m.error(e);
                }
            }
            return {
                version: $ugb_1.a,
                machines: []
            };
        }
    };
    exports.$ugb = $ugb;
    exports.$ugb = $ugb = $ugb_1 = __decorate([
        __param(0, environment_1.$Ih),
        __param(1, files_1.$6j),
        __param(2, storage_1.$Vo),
        __param(3, userDataSync_1.$Fgb),
        __param(4, userDataSync_1.$Ugb),
        __param(5, productService_1.$kj)
    ], $ugb);
});
//# sourceMappingURL=userDataSyncMachines.js.map