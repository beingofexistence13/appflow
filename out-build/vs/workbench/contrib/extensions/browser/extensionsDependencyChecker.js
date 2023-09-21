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
define(["require", "exports", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/extensions/common/extensions", "vs/platform/commands/common/commands", "vs/platform/actions/common/actions", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsDependencyChecker", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/notification/common/notification", "vs/base/common/actions", "vs/workbench/services/host/browser/host", "vs/base/common/lifecycle", "vs/base/common/cancellation", "vs/base/common/async"], function (require, exports, extensions_1, extensions_2, commands_1, actions_1, nls_1, extensionManagementUtil_1, notification_1, actions_2, host_1, lifecycle_1, cancellation_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MUb = void 0;
    let $MUb = class $MUb extends lifecycle_1.$kc {
        constructor(a, b, c, f) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            commands_1.$Gr.registerCommand('workbench.extensions.installMissingDependencies', () => this.j());
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
                command: {
                    id: 'workbench.extensions.installMissingDependencies',
                    category: (0, nls_1.localize)(0, null),
                    title: (0, nls_1.localize)(1, null)
                }
            });
        }
        async g() {
            const allMissingDependencies = await this.h();
            const localExtensions = await this.b.queryLocal();
            return allMissingDependencies.filter(id => localExtensions.every(l => !(0, extensionManagementUtil_1.$po)(l.identifier, { id })));
        }
        async h() {
            await this.a.whenInstalledExtensionsRegistered();
            const runningExtensionsIds = this.a.extensions.reduce((result, r) => { result.add(r.identifier.value.toLowerCase()); return result; }, new Set());
            const missingDependencies = new Set();
            for (const extension of this.a.extensions) {
                if (extension.extensionDependencies) {
                    extension.extensionDependencies.forEach(dep => {
                        if (!runningExtensionsIds.has(dep.toLowerCase())) {
                            missingDependencies.add(dep);
                        }
                    });
                }
            }
            return [...missingDependencies.values()];
        }
        async j() {
            const missingDependencies = await this.g();
            if (missingDependencies.length) {
                const extensions = await this.b.getExtensions(missingDependencies.map(id => ({ id })), cancellation_1.CancellationToken.None);
                if (extensions.length) {
                    await async_1.Promises.settled(extensions.map(extension => this.b.install(extension)));
                    this.c.notify({
                        severity: notification_1.Severity.Info,
                        message: (0, nls_1.localize)(2, null),
                        actions: {
                            primary: [new actions_2.$gi('realod', (0, nls_1.localize)(3, null), '', true, () => this.f.reload())]
                        }
                    });
                }
            }
            else {
                this.c.info((0, nls_1.localize)(4, null));
            }
        }
    };
    exports.$MUb = $MUb;
    exports.$MUb = $MUb = __decorate([
        __param(0, extensions_2.$MF),
        __param(1, extensions_1.$Pfb),
        __param(2, notification_1.$Yu),
        __param(3, host_1.$VT)
    ], $MUb);
});
//# sourceMappingURL=extensionsDependencyChecker.js.map