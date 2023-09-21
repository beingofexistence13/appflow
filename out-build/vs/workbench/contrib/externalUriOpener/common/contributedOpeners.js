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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/workbench/contrib/externalUriOpener/common/configuration", "vs/workbench/services/extensions/common/extensions"], function (require, exports, lifecycle_1, storage_1, memento_1, configuration_1, extensions_1) {
    "use strict";
    var $dlb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dlb = void 0;
    let $dlb = class $dlb extends lifecycle_1.$kc {
        static { $dlb_1 = this; }
        static { this.a = 'externalUriOpeners'; }
        constructor(storageService, g) {
            super();
            this.g = g;
            this.b = new Map();
            this.c = new memento_1.$YT($dlb_1.a, storageService);
            this.f = this.c.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            for (const [id, value] of Object.entries(this.f || {})) {
                this.h(id, value.extensionId, { isCurrentlyRegistered: false });
            }
            this.j();
            this.B(this.g.onDidChangeExtensions(() => this.j()));
            this.B(this.g.onDidChangeExtensionsStatus(() => this.j()));
        }
        didRegisterOpener(id, extensionId) {
            this.h(id, extensionId, {
                isCurrentlyRegistered: true
            });
        }
        h(id, extensionId, options) {
            const existing = this.b.get(id);
            if (existing) {
                existing.isCurrentlyRegistered = existing.isCurrentlyRegistered || options.isCurrentlyRegistered;
                return;
            }
            const entry = {
                extensionId,
                isCurrentlyRegistered: options.isCurrentlyRegistered
            };
            this.b.set(id, entry);
            this.f[id] = entry;
            this.c.saveMemento();
            this.m();
        }
        delete(id) {
            this.b.delete(id);
            delete this.f[id];
            this.c.saveMemento();
            this.m();
        }
        async j() {
            await this.g.whenInstalledExtensionsRegistered();
            const registeredExtensions = this.g.extensions;
            for (const [id, entry] of this.b) {
                const extension = registeredExtensions.find(r => r.identifier.value === entry.extensionId);
                if (extension) {
                    if (!this.g.canRemoveExtension(extension)) {
                        // The extension is running. We should have registered openers at this point
                        if (!entry.isCurrentlyRegistered) {
                            this.delete(id);
                        }
                    }
                }
                else {
                    // The opener came from an extension that is no longer enabled/installed
                    this.delete(id);
                }
            }
        }
        m() {
            const ids = [];
            const descriptions = [];
            for (const [id, entry] of this.b) {
                ids.push(id);
                descriptions.push(entry.extensionId);
            }
            (0, configuration_1.$clb)(ids, descriptions);
        }
    };
    exports.$dlb = $dlb;
    exports.$dlb = $dlb = $dlb_1 = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, extensions_1.$MF)
    ], $dlb);
});
//# sourceMappingURL=contributedOpeners.js.map