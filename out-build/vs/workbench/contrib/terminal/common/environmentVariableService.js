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
define(["require", "exports", "vs/base/common/event", "vs/base/common/decorators", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/platform/terminal/common/environmentVariableCollection", "vs/platform/terminal/common/environmentVariableShared", "vs/base/common/lifecycle"], function (require, exports, event_1, decorators_1, storage_1, extensions_1, environmentVariableCollection_1, environmentVariableShared_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sWb = void 0;
    /**
     * Tracks and persists environment variable collections as defined by extensions.
     */
    let $sWb = class $sWb extends lifecycle_1.$kc {
        get onDidChangeCollections() { return this.a.event; }
        constructor(b, f) {
            super();
            this.b = b;
            this.f = f;
            this.collections = new Map();
            this.a = this.B(new event_1.$fd());
            this.f.remove("terminal.integrated.environmentVariableCollections" /* TerminalStorageKeys.DeprecatedEnvironmentVariableCollections */, 1 /* StorageScope.WORKSPACE */);
            const serializedPersistedCollections = this.f.get("terminal.integrated.environmentVariableCollectionsV2" /* TerminalStorageKeys.EnvironmentVariableCollections */, 1 /* StorageScope.WORKSPACE */);
            if (serializedPersistedCollections) {
                const collectionsJson = JSON.parse(serializedPersistedCollections);
                collectionsJson.forEach(c => this.collections.set(c.extensionIdentifier, {
                    persistent: true,
                    map: (0, environmentVariableShared_1.$cr)(c.collection),
                    descriptionMap: (0, environmentVariableShared_1.$dr)(c.description)
                }));
                // Asynchronously invalidate collections where extensions have been uninstalled, this is
                // async to avoid making all functions on the service synchronous and because extensions
                // being uninstalled is rare.
                this.t();
            }
            this.mergedCollection = this.s();
            // Listen for uninstalled/disabled extensions
            this.B(this.b.onDidChangeExtensions(() => this.t()));
        }
        set(extensionIdentifier, collection) {
            this.collections.set(extensionIdentifier, collection);
            this.g();
        }
        delete(extensionIdentifier) {
            this.collections.delete(extensionIdentifier);
            this.g();
        }
        g() {
            this.h();
            this.mergedCollection = this.s();
            this.m();
        }
        h() {
            this.j();
        }
        j() {
            const collectionsJson = [];
            this.collections.forEach((collection, extensionIdentifier) => {
                if (collection.persistent) {
                    collectionsJson.push({
                        extensionIdentifier,
                        collection: (0, environmentVariableShared_1.$ar)(this.collections.get(extensionIdentifier).map),
                        description: (0, environmentVariableShared_1.$br)(collection.descriptionMap)
                    });
                }
            });
            const stringifiedJson = JSON.stringify(collectionsJson);
            this.f.store("terminal.integrated.environmentVariableCollectionsV2" /* TerminalStorageKeys.EnvironmentVariableCollections */, stringifiedJson, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        m() {
            this.n();
        }
        n() {
            this.a.fire(this.mergedCollection);
        }
        s() {
            return new environmentVariableCollection_1.$gr(this.collections);
        }
        async t() {
            await this.b.whenInstalledExtensionsRegistered();
            const registeredExtensions = this.b.extensions;
            let changes = false;
            this.collections.forEach((_, extensionIdentifier) => {
                const isExtensionRegistered = registeredExtensions.some(r => r.identifier.value === extensionIdentifier);
                if (!isExtensionRegistered) {
                    this.collections.delete(extensionIdentifier);
                    changes = true;
                }
            });
            if (changes) {
                this.g();
            }
        }
    };
    exports.$sWb = $sWb;
    __decorate([
        (0, decorators_1.$8g)(1000)
    ], $sWb.prototype, "h", null);
    __decorate([
        (0, decorators_1.$7g)(1000)
    ], $sWb.prototype, "m", null);
    exports.$sWb = $sWb = __decorate([
        __param(0, extensions_1.$MF),
        __param(1, storage_1.$Vo)
    ], $sWb);
});
//# sourceMappingURL=environmentVariableService.js.map