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
    exports.$Dzb = exports.$Czb = void 0;
    let $Czb = class $Czb extends lifecycle_1.$kc {
        constructor(storageService, extensionManagementService) {
            super();
            this.a = new event_1.$fd();
            this.onDidChangeEnablement = this.a.event;
            this.b = this.B(new $Dzb(storageService));
            this.B(this.b.onDidChange(extensions => this.a.fire({ extensions, source: 'storage' })));
            this.B(extensionManagementService.onDidInstallExtensions(e => e.forEach(({ local, operation }) => {
                if (local && operation === 4 /* InstallOperation.Migrate */) {
                    this.f(local.identifier); /* Reset migrated extensions */
                }
            })));
        }
        async enableExtension(extension, source) {
            if (this.f(extension)) {
                this.a.fire({ extensions: [extension], source });
                return true;
            }
            return false;
        }
        async disableExtension(extension, source) {
            if (this.c(extension)) {
                this.a.fire({ extensions: [extension], source });
                return true;
            }
            return false;
        }
        getDisabledExtensions() {
            return this.h(extensionManagement_1.$3n);
        }
        async getDisabledExtensionsAsync() {
            return this.getDisabledExtensions();
        }
        c(identifier) {
            const disabledExtensions = this.getDisabledExtensions();
            if (disabledExtensions.every(e => !(0, extensionManagementUtil_1.$po)(e, identifier))) {
                disabledExtensions.push(identifier);
                this.g(disabledExtensions);
                return true;
            }
            return false;
        }
        f(identifier) {
            const disabledExtensions = this.getDisabledExtensions();
            for (let index = 0; index < disabledExtensions.length; index++) {
                const disabledExtension = disabledExtensions[index];
                if ((0, extensionManagementUtil_1.$po)(disabledExtension, identifier)) {
                    disabledExtensions.splice(index, 1);
                    this.g(disabledExtensions);
                    return true;
                }
            }
            return false;
        }
        g(disabledExtensions) {
            this.j(extensionManagement_1.$3n, disabledExtensions);
        }
        h(storageId) {
            return this.b.get(storageId, 0 /* StorageScope.PROFILE */);
        }
        j(storageId, extensions) {
            this.b.set(storageId, extensions, 0 /* StorageScope.PROFILE */);
        }
    };
    exports.$Czb = $Czb;
    exports.$Czb = $Czb = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, extensionManagement_1.$2n)
    ], $Czb);
    class $Dzb extends lifecycle_1.$kc {
        constructor(c) {
            super();
            this.c = c;
            this.a = Object.create(null);
            this.b = this.B(new event_1.$fd());
            this.onDidChange = this.b.event;
            this.B(c.onDidChangeValue(0 /* StorageScope.PROFILE */, undefined, this.B(new lifecycle_1.$jc()))(e => this.f(e)));
        }
        get(key, scope) {
            let value;
            if (scope === 0 /* StorageScope.PROFILE */) {
                if ((0, types_1.$sf)(this.a[key])) {
                    this.a[key] = this.g(key, scope);
                }
                value = this.a[key];
            }
            else {
                value = this.g(key, scope);
            }
            return JSON.parse(value);
        }
        set(key, value, scope) {
            const newValue = JSON.stringify(value.map(({ id, uuid }) => ({ id, uuid })));
            const oldValue = this.g(key, scope);
            if (oldValue !== newValue) {
                if (scope === 0 /* StorageScope.PROFILE */) {
                    if (value.length) {
                        this.a[key] = newValue;
                    }
                    else {
                        delete this.a[key];
                    }
                }
                this.h(key, value.length ? newValue : undefined, scope);
            }
        }
        f(storageChangeEvent) {
            if (!(0, types_1.$sf)(this.a[storageChangeEvent.key])) {
                const newValue = this.g(storageChangeEvent.key, storageChangeEvent.scope);
                if (newValue !== this.a[storageChangeEvent.key]) {
                    const oldValues = this.get(storageChangeEvent.key, storageChangeEvent.scope);
                    delete this.a[storageChangeEvent.key];
                    const newValues = this.get(storageChangeEvent.key, storageChangeEvent.scope);
                    const added = oldValues.filter(oldValue => !newValues.some(newValue => (0, extensionManagementUtil_1.$po)(oldValue, newValue)));
                    const removed = newValues.filter(newValue => !oldValues.some(oldValue => (0, extensionManagementUtil_1.$po)(oldValue, newValue)));
                    if (added.length || removed.length) {
                        this.b.fire([...added, ...removed]);
                    }
                }
            }
        }
        g(key, scope) {
            return this.c.get(key, scope, '[]');
        }
        h(key, value, scope) {
            if (value) {
                // Enablement state is synced separately through extensions
                this.c.store(key, value, scope, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.c.remove(key, scope);
            }
        }
    }
    exports.$Dzb = $Dzb;
});
//# sourceMappingURL=extensionEnablementService.js.map