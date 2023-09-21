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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/types", "vs/nls!vs/workbench/contrib/deprecatedExtensionMigrator/browser/deprecatedExtensionMigrator.contribution", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/workbench/common/contributions", "vs/workbench/contrib/extensions/common/extensions"], function (require, exports, actions_1, errors_1, types_1, nls_1, configuration_1, notification_1, opener_1, platform_1, storage_1, contributions_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let DeprecatedExtensionMigratorContribution = class DeprecatedExtensionMigratorContribution {
        constructor(a, b, c, f, g) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.i = 'deprecatedExtensionMigrator.state';
            this.h().catch(errors_1.$Y);
        }
        async h() {
            const bracketPairColorizerId = 'coenraads.bracket-pair-colorizer';
            await this.b.queryLocal();
            const extension = this.b.installed.find(e => e.identifier.id === bracketPairColorizerId);
            if (!extension ||
                ((extension.enablementState !== 8 /* EnablementState.EnabledGlobally */) &&
                    (extension.enablementState !== 9 /* EnablementState.EnabledWorkspace */))) {
                return;
            }
            const state = await this.j();
            const disablementLogEntry = state.disablementLog.some(d => d.extensionId === bracketPairColorizerId);
            if (disablementLogEntry) {
                return;
            }
            state.disablementLog.push({ extensionId: bracketPairColorizerId, disablementDateTime: new Date().getTime() });
            await this.k(state);
            await this.b.setEnablement(extension, 6 /* EnablementState.DisabledGlobally */);
            const nativeBracketPairColorizationEnabledKey = 'editor.bracketPairColorization.enabled';
            const bracketPairColorizationEnabled = !!this.a.inspect(nativeBracketPairColorizationEnabledKey).user;
            this.f.notify({
                message: (0, nls_1.localize)(0, null),
                severity: notification_1.Severity.Info,
                actions: {
                    primary: [
                        new actions_1.$gi('', (0, nls_1.localize)(1, null), undefined, undefined, () => {
                            this.b.uninstall(extension);
                        }),
                    ],
                    secondary: [
                        !bracketPairColorizationEnabled ? new actions_1.$gi('', (0, nls_1.localize)(2, null), undefined, undefined, () => {
                            this.a.updateValue(nativeBracketPairColorizationEnabledKey, true, 2 /* ConfigurationTarget.USER */);
                        }) : undefined,
                        new actions_1.$gi('', (0, nls_1.localize)(3, null), undefined, undefined, () => {
                            this.g.open('https://github.com/microsoft/vscode/issues/155179');
                        }),
                    ].filter(types_1.$rf),
                }
            });
        }
        async j() {
            const jsonStr = await this.c.get(this.i, -1 /* StorageScope.APPLICATION */, '');
            if (jsonStr === '') {
                return { disablementLog: [] };
            }
            return JSON.parse(jsonStr);
        }
        async k(state) {
            const json = JSON.stringify(state);
            await this.c.store(this.i, json, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
    };
    DeprecatedExtensionMigratorContribution = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, extensions_1.$Pfb),
        __param(2, storage_1.$Vo),
        __param(3, notification_1.$Yu),
        __param(4, opener_1.$NT)
    ], DeprecatedExtensionMigratorContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(DeprecatedExtensionMigratorContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=deprecatedExtensionMigrator.contribution.js.map