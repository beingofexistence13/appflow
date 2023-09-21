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
define(["require", "exports", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/nls!vs/workbench/contrib/extensions/browser/deprecatedExtensionsChecker", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil"], function (require, exports, extensions_1, notification_1, storage_1, nls_1, instantiation_1, extensionsActions_1, arrays_1, lifecycle_1, extensionManagement_1, extensionManagementUtil_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_Ub = void 0;
    let $_Ub = class $_Ub extends lifecycle_1.$kc {
        constructor(a, extensionManagementService, b, c, f) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g();
            this.B(extensionManagementService.onDidInstallExtensions(e => {
                const ids = [];
                for (const { local } of e) {
                    if (local && a.local.find(extension => (0, extensionManagementUtil_1.$po)(extension.identifier, local.identifier))?.deprecationInfo) {
                        ids.push(local.identifier.id.toLowerCase());
                    }
                }
                if (ids.length) {
                    this.j(ids);
                }
            }));
        }
        async g() {
            if (this.b.getBoolean('extensionsAssistant/doNotCheckDeprecated', 0 /* StorageScope.PROFILE */, false)) {
                return;
            }
            const local = await this.a.queryLocal();
            const previouslyNotified = this.h();
            const toNotify = local.filter(e => !!e.deprecationInfo).filter(e => !previouslyNotified.includes(e.identifier.id.toLowerCase()));
            if (toNotify.length) {
                this.c.prompt(notification_1.Severity.Warning, (0, nls_1.localize)(0, null), [{
                        label: (0, nls_1.localize)(1, null),
                        run: async () => {
                            this.j(toNotify.map(e => e.identifier.id.toLowerCase()));
                            const action = this.f.createInstance(extensionsActions_1.$3hb, toNotify.map(extension => `@id:${extension.identifier.id}`).join(' '));
                            try {
                                await action.run();
                            }
                            finally {
                                action.dispose();
                            }
                        }
                    }, {
                        label: (0, nls_1.localize)(2, null),
                        isSecondary: true,
                        run: () => this.b.store('extensionsAssistant/doNotCheckDeprecated', true, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */)
                    }]);
            }
        }
        h() {
            return JSON.parse(this.b.get('extensionsAssistant/deprecated', 0 /* StorageScope.PROFILE */, '[]'));
        }
        j(notified) {
            this.b.store('extensionsAssistant/deprecated', JSON.stringify((0, arrays_1.$Kb)([...this.h(), ...notified])), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    exports.$_Ub = $_Ub;
    exports.$_Ub = $_Ub = __decorate([
        __param(0, extensions_1.$Pfb),
        __param(1, extensionManagement_1.$2n),
        __param(2, storage_1.$Vo),
        __param(3, notification_1.$Yu),
        __param(4, instantiation_1.$Ah)
    ], $_Ub);
});
//# sourceMappingURL=deprecatedExtensionsChecker.js.map