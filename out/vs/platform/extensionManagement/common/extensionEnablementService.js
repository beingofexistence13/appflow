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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/types", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/storage/common/storage"], function (require, exports, event_1, lifecycle_1, types_1, extensionManagement_1, extensionManagementUtil_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StorageManager = exports.GlobalExtensionEnablementService = void 0;
    let GlobalExtensionEnablementService = class GlobalExtensionEnablementService extends lifecycle_1.Disposable {
        constructor(storageService, extensionManagementService) {
            super();
            this._onDidChangeEnablement = new event_1.Emitter();
            this.onDidChangeEnablement = this._onDidChangeEnablement.event;
            this.storageManger = this._register(new StorageManager(storageService));
            this._register(this.storageManger.onDidChange(extensions => this._onDidChangeEnablement.fire({ extensions, source: 'storage' })));
            this._register(extensionManagementService.onDidInstallExtensions(e => e.forEach(({ local, operation }) => {
                if (local && operation === 4 /* InstallOperation.Migrate */) {
                    this._removeFromDisabledExtensions(local.identifier); /* Reset migrated extensions */
                }
            })));
        }
        async enableExtension(extension, source) {
            if (this._removeFromDisabledExtensions(extension)) {
                this._onDidChangeEnablement.fire({ extensions: [extension], source });
                return true;
            }
            return false;
        }
        async disableExtension(extension, source) {
            if (this._addToDisabledExtensions(extension)) {
                this._onDidChangeEnablement.fire({ extensions: [extension], source });
                return true;
            }
            return false;
        }
        getDisabledExtensions() {
            return this._getExtensions(extensionManagement_1.DISABLED_EXTENSIONS_STORAGE_PATH);
        }
        async getDisabledExtensionsAsync() {
            return this.getDisabledExtensions();
        }
        _addToDisabledExtensions(identifier) {
            const disabledExtensions = this.getDisabledExtensions();
            if (disabledExtensions.every(e => !(0, extensionManagementUtil_1.areSameExtensions)(e, identifier))) {
                disabledExtensions.push(identifier);
                this._setDisabledExtensions(disabledExtensions);
                return true;
            }
            return false;
        }
        _removeFromDisabledExtensions(identifier) {
            const disabledExtensions = this.getDisabledExtensions();
            for (let index = 0; index < disabledExtensions.length; index++) {
                const disabledExtension = disabledExtensions[index];
                if ((0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, identifier)) {
                    disabledExtensions.splice(index, 1);
                    this._setDisabledExtensions(disabledExtensions);
                    return true;
                }
            }
            return false;
        }
        _setDisabledExtensions(disabledExtensions) {
            this._setExtensions(extensionManagement_1.DISABLED_EXTENSIONS_STORAGE_PATH, disabledExtensions);
        }
        _getExtensions(storageId) {
            return this.storageManger.get(storageId, 0 /* StorageScope.PROFILE */);
        }
        _setExtensions(storageId, extensions) {
            this.storageManger.set(storageId, extensions, 0 /* StorageScope.PROFILE */);
        }
    };
    exports.GlobalExtensionEnablementService = GlobalExtensionEnablementService;
    exports.GlobalExtensionEnablementService = GlobalExtensionEnablementService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, extensionManagement_1.IExtensionManagementService)
    ], GlobalExtensionEnablementService);
    class StorageManager extends lifecycle_1.Disposable {
        constructor(storageService) {
            super();
            this.storageService = storageService;
            this.storage = Object.create(null);
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._register(storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, undefined, this._register(new lifecycle_1.DisposableStore()))(e => this.onDidStorageChange(e)));
        }
        get(key, scope) {
            let value;
            if (scope === 0 /* StorageScope.PROFILE */) {
                if ((0, types_1.isUndefinedOrNull)(this.storage[key])) {
                    this.storage[key] = this._get(key, scope);
                }
                value = this.storage[key];
            }
            else {
                value = this._get(key, scope);
            }
            return JSON.parse(value);
        }
        set(key, value, scope) {
            const newValue = JSON.stringify(value.map(({ id, uuid }) => ({ id, uuid })));
            const oldValue = this._get(key, scope);
            if (oldValue !== newValue) {
                if (scope === 0 /* StorageScope.PROFILE */) {
                    if (value.length) {
                        this.storage[key] = newValue;
                    }
                    else {
                        delete this.storage[key];
                    }
                }
                this._set(key, value.length ? newValue : undefined, scope);
            }
        }
        onDidStorageChange(storageChangeEvent) {
            if (!(0, types_1.isUndefinedOrNull)(this.storage[storageChangeEvent.key])) {
                const newValue = this._get(storageChangeEvent.key, storageChangeEvent.scope);
                if (newValue !== this.storage[storageChangeEvent.key]) {
                    const oldValues = this.get(storageChangeEvent.key, storageChangeEvent.scope);
                    delete this.storage[storageChangeEvent.key];
                    const newValues = this.get(storageChangeEvent.key, storageChangeEvent.scope);
                    const added = oldValues.filter(oldValue => !newValues.some(newValue => (0, extensionManagementUtil_1.areSameExtensions)(oldValue, newValue)));
                    const removed = newValues.filter(newValue => !oldValues.some(oldValue => (0, extensionManagementUtil_1.areSameExtensions)(oldValue, newValue)));
                    if (added.length || removed.length) {
                        this._onDidChange.fire([...added, ...removed]);
                    }
                }
            }
        }
        _get(key, scope) {
            return this.storageService.get(key, scope, '[]');
        }
        _set(key, value, scope) {
            if (value) {
                // Enablement state is synced separately through extensions
                this.storageService.store(key, value, scope, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(key, scope);
            }
        }
    }
    exports.StorageManager = StorageManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uRW5hYmxlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25NYW5hZ2VtZW50L2NvbW1vbi9leHRlbnNpb25FbmFibGVtZW50U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFTekYsSUFBTSxnQ0FBZ0MsR0FBdEMsTUFBTSxnQ0FBaUMsU0FBUSxzQkFBVTtRQVEvRCxZQUNrQixjQUErQixFQUNuQiwwQkFBdUQ7WUFFcEYsS0FBSyxFQUFFLENBQUM7WUFSRCwyQkFBc0IsR0FBRyxJQUFJLGVBQU8sRUFBNkUsQ0FBQztZQUNqSCwwQkFBcUIsR0FBcUYsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQVFwSixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEksSUFBSSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO2dCQUN4RyxJQUFJLEtBQUssSUFBSSxTQUFTLHFDQUE2QixFQUFFO29CQUNwRCxJQUFJLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsK0JBQStCO2lCQUNyRjtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNOLENBQUM7UUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLFNBQStCLEVBQUUsTUFBZTtZQUNyRSxJQUFJLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDbEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBQ3RFLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBK0IsRUFBRSxNQUFlO1lBQ3RFLElBQUksSUFBSSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUM3QyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztnQkFDdEUsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELHFCQUFxQjtZQUNwQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsc0RBQWdDLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQsS0FBSyxDQUFDLDBCQUEwQjtZQUMvQixPQUFPLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3JDLENBQUM7UUFFTyx3QkFBd0IsQ0FBQyxVQUFnQztZQUNoRSxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ3hELElBQUksa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFBLDJDQUFpQixFQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUFFO2dCQUNyRSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUNoRCxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU8sNkJBQTZCLENBQUMsVUFBZ0M7WUFDckUsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUN4RCxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUMvRCxNQUFNLGlCQUFpQixHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLElBQUEsMkNBQWlCLEVBQUMsaUJBQWlCLEVBQUUsVUFBVSxDQUFDLEVBQUU7b0JBQ3JELGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3BDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUNoRCxPQUFPLElBQUksQ0FBQztpQkFDWjthQUNEO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU8sc0JBQXNCLENBQUMsa0JBQTBDO1lBQ3hFLElBQUksQ0FBQyxjQUFjLENBQUMsc0RBQWdDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRU8sY0FBYyxDQUFDLFNBQWlCO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUywrQkFBdUIsQ0FBQztRQUNoRSxDQUFDO1FBRU8sY0FBYyxDQUFDLFNBQWlCLEVBQUUsVUFBa0M7WUFDM0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFVBQVUsK0JBQXVCLENBQUM7UUFDckUsQ0FBQztLQUVELENBQUE7SUFqRlksNEVBQWdDOytDQUFoQyxnQ0FBZ0M7UUFTMUMsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSxpREFBMkIsQ0FBQTtPQVZqQixnQ0FBZ0MsQ0FpRjVDO0lBRUQsTUFBYSxjQUFlLFNBQVEsc0JBQVU7UUFPN0MsWUFBb0IsY0FBK0I7WUFDbEQsS0FBSyxFQUFFLENBQUM7WUFEVyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFMM0MsWUFBTyxHQUE4QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXpELGlCQUFZLEdBQW9DLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTBCLENBQUMsQ0FBQztZQUNyRyxnQkFBVyxHQUFrQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUk3RSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsK0JBQXVCLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUosQ0FBQztRQUVELEdBQUcsQ0FBQyxHQUFXLEVBQUUsS0FBbUI7WUFDbkMsSUFBSSxLQUFhLENBQUM7WUFDbEIsSUFBSSxLQUFLLGlDQUF5QixFQUFFO2dCQUNuQyxJQUFJLElBQUEseUJBQWlCLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO29CQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUMxQztnQkFDRCxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUMxQjtpQkFBTTtnQkFDTixLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDOUI7WUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVELEdBQUcsQ0FBQyxHQUFXLEVBQUUsS0FBNkIsRUFBRSxLQUFtQjtZQUNsRSxNQUFNLFFBQVEsR0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBdUIsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFHLENBQUEsQ0FBQyxDQUFDLENBQUM7WUFDM0csTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkMsSUFBSSxRQUFRLEtBQUssUUFBUSxFQUFFO2dCQUMxQixJQUFJLEtBQUssaUNBQXlCLEVBQUU7b0JBQ25DLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTt3QkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7cUJBQzdCO3lCQUFNO3dCQUNOLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDekI7aUJBQ0Q7Z0JBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDM0Q7UUFDRixDQUFDO1FBRU8sa0JBQWtCLENBQUMsa0JBQW1EO1lBQzdFLElBQUksQ0FBQyxJQUFBLHlCQUFpQixFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDN0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzdFLElBQUksUUFBUSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3RELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM3RSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM3RSxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBQSwyQ0FBaUIsRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvRyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBQSwyQ0FBaUIsRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqSCxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTt3QkFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7cUJBQy9DO2lCQUNEO2FBQ0Q7UUFDRixDQUFDO1FBRU8sSUFBSSxDQUFDLEdBQVcsRUFBRSxLQUFtQjtZQUM1QyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVPLElBQUksQ0FBQyxHQUFXLEVBQUUsS0FBeUIsRUFBRSxLQUFtQjtZQUN2RSxJQUFJLEtBQUssRUFBRTtnQkFDViwyREFBMkQ7Z0JBQzNELElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxnQ0FBd0IsQ0FBQzthQUNwRTtpQkFBTTtnQkFDTixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDdkM7UUFDRixDQUFDO0tBQ0Q7SUFwRUQsd0NBb0VDIn0=