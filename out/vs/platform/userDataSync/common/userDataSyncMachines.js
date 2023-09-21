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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/product/common/productService", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/storage/common/storage", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, event_1, lifecycle_1, platform_1, strings_1, nls_1, environment_1, files_1, instantiation_1, productService_1, serviceMachineId_1, storage_1, userDataSync_1) {
    "use strict";
    var UserDataSyncMachinesService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncMachinesService = exports.isWebPlatform = exports.IUserDataSyncMachinesService = void 0;
    exports.IUserDataSyncMachinesService = (0, instantiation_1.createDecorator)('IUserDataSyncMachinesService');
    const currentMachineNameKey = 'sync.currentMachineName';
    const Safari = 'Safari';
    const Chrome = 'Chrome';
    const Edge = 'Edge';
    const Firefox = 'Firefox';
    const Android = 'Android';
    function isWebPlatform(platform) {
        switch (platform) {
            case Safari:
            case Chrome:
            case Edge:
            case Firefox:
            case Android:
            case (0, platform_1.PlatformToString)(0 /* Platform.Web */):
                return true;
        }
        return false;
    }
    exports.isWebPlatform = isWebPlatform;
    function getPlatformName() {
        if (platform_1.isSafari) {
            return Safari;
        }
        if (platform_1.isChrome) {
            return Chrome;
        }
        if (platform_1.isEdge) {
            return Edge;
        }
        if (platform_1.isFirefox) {
            return Firefox;
        }
        if (platform_1.isAndroid) {
            return Android;
        }
        return (0, platform_1.PlatformToString)(platform_1.isWeb ? 0 /* Platform.Web */ : platform_1.platform);
    }
    let UserDataSyncMachinesService = class UserDataSyncMachinesService extends lifecycle_1.Disposable {
        static { UserDataSyncMachinesService_1 = this; }
        static { this.VERSION = 1; }
        static { this.RESOURCE = 'machines'; }
        constructor(environmentService, fileService, storageService, userDataSyncStoreService, logService, productService) {
            super();
            this.storageService = storageService;
            this.userDataSyncStoreService = userDataSyncStoreService;
            this.logService = logService;
            this.productService = productService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.userData = null;
            this.currentMachineIdPromise = (0, serviceMachineId_1.getServiceMachineId)(environmentService, fileService, storageService);
        }
        async getMachines(manifest) {
            const currentMachineId = await this.currentMachineIdPromise;
            const machineData = await this.readMachinesData(manifest);
            return machineData.machines.map(machine => ({ ...machine, ...{ isCurrent: machine.id === currentMachineId } }));
        }
        async addCurrentMachine(manifest) {
            const currentMachineId = await this.currentMachineIdPromise;
            const machineData = await this.readMachinesData(manifest);
            if (!machineData.machines.some(({ id }) => id === currentMachineId)) {
                machineData.machines.push({ id: currentMachineId, name: this.computeCurrentMachineName(machineData.machines), platform: getPlatformName() });
                await this.writeMachinesData(machineData);
            }
        }
        async removeCurrentMachine(manifest) {
            const currentMachineId = await this.currentMachineIdPromise;
            const machineData = await this.readMachinesData(manifest);
            const updatedMachines = machineData.machines.filter(({ id }) => id !== currentMachineId);
            if (updatedMachines.length !== machineData.machines.length) {
                machineData.machines = updatedMachines;
                await this.writeMachinesData(machineData);
            }
        }
        async renameMachine(machineId, name, manifest) {
            const machineData = await this.readMachinesData(manifest);
            const machine = machineData.machines.find(({ id }) => id === machineId);
            if (machine) {
                machine.name = name;
                await this.writeMachinesData(machineData);
                const currentMachineId = await this.currentMachineIdPromise;
                if (machineId === currentMachineId) {
                    this.storageService.store(currentMachineNameKey, name, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                }
            }
        }
        async setEnablements(enablements) {
            const machineData = await this.readMachinesData();
            for (const [machineId, enabled] of enablements) {
                const machine = machineData.machines.find(machine => machine.id === machineId);
                if (machine) {
                    machine.disabled = enabled ? undefined : true;
                }
            }
            await this.writeMachinesData(machineData);
        }
        computeCurrentMachineName(machines) {
            const previousName = this.storageService.get(currentMachineNameKey, -1 /* StorageScope.APPLICATION */);
            if (previousName) {
                return previousName;
            }
            const namePrefix = `${this.productService.embedderIdentifier ? `${this.productService.embedderIdentifier} - ` : ''}${getPlatformName()} (${this.productService.nameShort})`;
            const nameRegEx = new RegExp(`${(0, strings_1.escapeRegExpCharacters)(namePrefix)}\\s#(\\d+)`);
            let nameIndex = 0;
            for (const machine of machines) {
                const matches = nameRegEx.exec(machine.name);
                const index = matches ? parseInt(matches[1]) : 0;
                nameIndex = index > nameIndex ? index : nameIndex;
            }
            return `${namePrefix} #${nameIndex + 1}`;
        }
        async readMachinesData(manifest) {
            this.userData = await this.readUserData(manifest);
            const machinesData = this.parse(this.userData);
            if (machinesData.version !== UserDataSyncMachinesService_1.VERSION) {
                throw new Error((0, nls_1.localize)('error incompatible', "Cannot read machines data as the current version is incompatible. Please update {0} and try again.", this.productService.nameLong));
            }
            return machinesData;
        }
        async writeMachinesData(machinesData) {
            const content = JSON.stringify(machinesData);
            const ref = await this.userDataSyncStoreService.writeResource(UserDataSyncMachinesService_1.RESOURCE, content, this.userData?.ref || null);
            this.userData = { ref, content };
            this._onDidChange.fire();
        }
        async readUserData(manifest) {
            if (this.userData) {
                const latestRef = manifest && manifest.latest ? manifest.latest[UserDataSyncMachinesService_1.RESOURCE] : undefined;
                // Last time synced resource and latest resource on server are same
                if (this.userData.ref === latestRef) {
                    return this.userData;
                }
                // There is no resource on server and last time it was synced with no resource
                if (latestRef === undefined && this.userData.content === null) {
                    return this.userData;
                }
            }
            return this.userDataSyncStoreService.readResource(UserDataSyncMachinesService_1.RESOURCE, this.userData);
        }
        parse(userData) {
            if (userData.content !== null) {
                try {
                    return JSON.parse(userData.content);
                }
                catch (e) {
                    this.logService.error(e);
                }
            }
            return {
                version: UserDataSyncMachinesService_1.VERSION,
                machines: []
            };
        }
    };
    exports.UserDataSyncMachinesService = UserDataSyncMachinesService;
    exports.UserDataSyncMachinesService = UserDataSyncMachinesService = UserDataSyncMachinesService_1 = __decorate([
        __param(0, environment_1.IEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, storage_1.IStorageService),
        __param(3, userDataSync_1.IUserDataSyncStoreService),
        __param(4, userDataSync_1.IUserDataSyncLogService),
        __param(5, productService_1.IProductService)
    ], UserDataSyncMachinesService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jTWFjaGluZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvY29tbW9uL3VzZXJEYXRhU3luY01hY2hpbmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE2Qm5GLFFBQUEsNEJBQTRCLEdBQUcsSUFBQSwrQkFBZSxFQUErQiw4QkFBOEIsQ0FBQyxDQUFDO0lBYzFILE1BQU0scUJBQXFCLEdBQUcseUJBQXlCLENBQUM7SUFFeEQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0lBQ3hCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQztJQUN4QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUM7SUFDcEIsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDO0lBQzFCLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQztJQUUxQixTQUFnQixhQUFhLENBQUMsUUFBZ0I7UUFDN0MsUUFBUSxRQUFRLEVBQUU7WUFDakIsS0FBSyxNQUFNLENBQUM7WUFDWixLQUFLLE1BQU0sQ0FBQztZQUNaLEtBQUssSUFBSSxDQUFDO1lBQ1YsS0FBSyxPQUFPLENBQUM7WUFDYixLQUFLLE9BQU8sQ0FBQztZQUNiLEtBQUssSUFBQSwyQkFBZ0IsdUJBQWM7Z0JBQ2xDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFYRCxzQ0FXQztJQUVELFNBQVMsZUFBZTtRQUN2QixJQUFJLG1CQUFRLEVBQUU7WUFBRSxPQUFPLE1BQU0sQ0FBQztTQUFFO1FBQ2hDLElBQUksbUJBQVEsRUFBRTtZQUFFLE9BQU8sTUFBTSxDQUFDO1NBQUU7UUFDaEMsSUFBSSxpQkFBTSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7U0FBRTtRQUM1QixJQUFJLG9CQUFTLEVBQUU7WUFBRSxPQUFPLE9BQU8sQ0FBQztTQUFFO1FBQ2xDLElBQUksb0JBQVMsRUFBRTtZQUFFLE9BQU8sT0FBTyxDQUFDO1NBQUU7UUFDbEMsT0FBTyxJQUFBLDJCQUFnQixFQUFDLGdCQUFLLENBQUMsQ0FBQyxzQkFBYyxDQUFDLENBQUMsbUJBQVEsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFTSxJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHNCQUFVOztpQkFFbEMsWUFBTyxHQUFHLENBQUMsQUFBSixDQUFLO2lCQUNaLGFBQVEsR0FBRyxVQUFVLEFBQWIsQ0FBYztRQVU5QyxZQUNzQixrQkFBdUMsRUFDOUMsV0FBeUIsRUFDdEIsY0FBZ0QsRUFDdEMsd0JBQW9FLEVBQ3RFLFVBQW9ELEVBQzVELGNBQWdEO1lBRWpFLEtBQUssRUFBRSxDQUFDO1lBTDBCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNyQiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTJCO1lBQ3JELGVBQVUsR0FBVixVQUFVLENBQXlCO1lBQzNDLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQVpqRCxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzNELGdCQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFHdkMsYUFBUSxHQUFxQixJQUFJLENBQUM7WUFXekMsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUEsc0NBQW1CLEVBQUMsa0JBQWtCLEVBQUUsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3JHLENBQUM7UUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQTRCO1lBQzdDLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUM7WUFDNUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUQsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBdUIsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxPQUFPLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFBRSxLQUFLLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdkksQ0FBQztRQUVELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxRQUE0QjtZQUNuRCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDO1lBQzVELE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUNwRSxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUM3SSxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUMxQztRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsb0JBQW9CLENBQUMsUUFBNEI7WUFDdEQsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztZQUM1RCxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxRCxNQUFNLGVBQWUsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3pGLElBQUksZUFBZSxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtnQkFDM0QsV0FBVyxDQUFDLFFBQVEsR0FBRyxlQUFlLENBQUM7Z0JBQ3ZDLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQzFDO1FBQ0YsQ0FBQztRQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBaUIsRUFBRSxJQUFZLEVBQUUsUUFBNEI7WUFDaEYsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUQsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssU0FBUyxDQUFDLENBQUM7WUFDeEUsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ3BCLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUMxQyxNQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDO2dCQUM1RCxJQUFJLFNBQVMsS0FBSyxnQkFBZ0IsRUFBRTtvQkFDbkMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMscUJBQXFCLEVBQUUsSUFBSSxtRUFBa0QsQ0FBQztpQkFDeEc7YUFDRDtRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLFdBQWdDO1lBQ3BELE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDbEQsS0FBSyxNQUFNLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxJQUFJLFdBQVcsRUFBRTtnQkFDL0MsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxDQUFDO2dCQUMvRSxJQUFJLE9BQU8sRUFBRTtvQkFDWixPQUFPLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7aUJBQzlDO2FBQ0Q7WUFDRCxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRU8seUJBQXlCLENBQUMsUUFBd0I7WUFDekQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLG9DQUEyQixDQUFDO1lBQzlGLElBQUksWUFBWSxFQUFFO2dCQUNqQixPQUFPLFlBQVksQ0FBQzthQUNwQjtZQUVELE1BQU0sVUFBVSxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxlQUFlLEVBQUUsS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsR0FBRyxDQUFDO1lBQzVLLE1BQU0sU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBQSxnQ0FBc0IsRUFBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEYsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFO2dCQUMvQixNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0MsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakQsU0FBUyxHQUFHLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2FBQ2xEO1lBQ0QsT0FBTyxHQUFHLFVBQVUsS0FBSyxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDMUMsQ0FBQztRQUVPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUE0QjtZQUMxRCxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvQyxJQUFJLFlBQVksQ0FBQyxPQUFPLEtBQUssNkJBQTJCLENBQUMsT0FBTyxFQUFFO2dCQUNqRSxNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsY0FBUSxFQUFDLG9CQUFvQixFQUFFLG9HQUFvRyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUNwTDtZQUNELE9BQU8sWUFBWSxDQUFDO1FBQ3JCLENBQUM7UUFFTyxLQUFLLENBQUMsaUJBQWlCLENBQUMsWUFBMkI7WUFDMUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM3QyxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxhQUFhLENBQUMsNkJBQTJCLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUN6SSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLEtBQUssQ0FBQyxZQUFZLENBQUMsUUFBNEI7WUFDdEQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUVsQixNQUFNLFNBQVMsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyw2QkFBMkIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUVsSCxtRUFBbUU7Z0JBQ25FLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssU0FBUyxFQUFFO29CQUNwQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7aUJBQ3JCO2dCQUVELDhFQUE4RTtnQkFDOUUsSUFBSSxTQUFTLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxLQUFLLElBQUksRUFBRTtvQkFDOUQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO2lCQUNyQjthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsWUFBWSxDQUFDLDZCQUEyQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEcsQ0FBQztRQUVPLEtBQUssQ0FBQyxRQUFtQjtZQUNoQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFO2dCQUM5QixJQUFJO29CQUNILE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ3BDO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNYLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN6QjthQUNEO1lBQ0QsT0FBTztnQkFDTixPQUFPLEVBQUUsNkJBQTJCLENBQUMsT0FBTztnQkFDNUMsUUFBUSxFQUFFLEVBQUU7YUFDWixDQUFDO1FBQ0gsQ0FBQzs7SUExSVcsa0VBQTJCOzBDQUEzQiwyQkFBMkI7UUFjckMsV0FBQSxpQ0FBbUIsQ0FBQTtRQUNuQixXQUFBLG9CQUFZLENBQUE7UUFDWixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLHdDQUF5QixDQUFBO1FBQ3pCLFdBQUEsc0NBQXVCLENBQUE7UUFDdkIsV0FBQSxnQ0FBZSxDQUFBO09BbkJMLDJCQUEyQixDQTJJdkMifQ==