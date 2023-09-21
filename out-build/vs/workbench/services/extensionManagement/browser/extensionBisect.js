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
define(["require", "exports", "vs/nls!vs/workbench/services/extensionManagement/browser/extensionBisect", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/storage/common/storage", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/extensions", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/commands/common/commands", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/workbench/services/issue/common/issue", "vs/workbench/services/environment/common/environmentService", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/extensionManagement/common/extensionManagement"], function (require, exports, nls_1, extensionManagement_1, storage_1, extensions_1, extensions_2, notification_1, host_1, instantiation_1, actions_1, contextkey_1, dialogs_1, platform_1, contributions_1, commands_1, log_1, productService_1, issue_1, environmentService_1, extensionManagementUtil_1, actionCommonCategories_1, extensionManagement_2) {
    "use strict";
    var ExtensionBisectService_1, ExtensionBisectUi_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gzb = void 0;
    // --- bisect service
    exports.$Gzb = (0, instantiation_1.$Bh)('IExtensionBisectService');
    class BisectState {
        static fromJSON(raw) {
            if (!raw) {
                return undefined;
            }
            try {
                const data = JSON.parse(raw);
                return new BisectState(data.extensions, data.low, data.high, data.mid);
            }
            catch {
                return undefined;
            }
        }
        constructor(extensions, low, high, mid = ((low + high) / 2) | 0) {
            this.extensions = extensions;
            this.low = low;
            this.high = high;
            this.mid = mid;
        }
    }
    let ExtensionBisectService = class ExtensionBisectService {
        static { ExtensionBisectService_1 = this; }
        static { this.a = 'extensionBisectState'; }
        constructor(logService, d, e) {
            this.d = d;
            this.e = e;
            this.c = new Map();
            const raw = d.get(ExtensionBisectService_1.a, -1 /* StorageScope.APPLICATION */);
            this.b = BisectState.fromJSON(raw);
            if (this.b) {
                const { mid, high } = this.b;
                for (let i = 0; i < this.b.extensions.length; i++) {
                    const isDisabled = i >= mid && i < high;
                    this.c.set(this.b.extensions[i], isDisabled);
                }
                logService.warn('extension BISECT active', [...this.c]);
            }
        }
        get isActive() {
            return !!this.b;
        }
        get disabledCount() {
            return this.b ? this.b.high - this.b.mid : -1;
        }
        isDisabledByBisect(extension) {
            if (!this.b) {
                // bisect isn't active
                return false;
            }
            if ((0, extensions_1.$2l)(extension.manifest, this.e.remoteAuthority)) {
                // the current remote resolver extension cannot be disabled
                return false;
            }
            if (this.f(extension)) {
                // Extension enabled in env cannot be disabled
                return false;
            }
            const disabled = this.c.get(extension.identifier.id);
            return disabled ?? false;
        }
        f(extension) {
            return Array.isArray(this.e.enableExtensions) && this.e.enableExtensions.some(id => (0, extensionManagementUtil_1.$po)({ id }, extension.identifier));
        }
        async start(extensions) {
            if (this.b) {
                throw new Error('invalid state');
            }
            const extensionIds = extensions.map(ext => ext.identifier.id);
            const newState = new BisectState(extensionIds, 0, extensionIds.length, 0);
            this.d.store(ExtensionBisectService_1.a, JSON.stringify(newState), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            await this.d.flush();
        }
        async next(seeingBad) {
            if (!this.b) {
                throw new Error('invalid state');
            }
            // check if bad when all extensions are disabled
            if (seeingBad && this.b.mid === 0 && this.b.high === this.b.extensions.length) {
                return { bad: true, id: '' };
            }
            // check if there is only one left
            if (this.b.low === this.b.high - 1) {
                await this.reset();
                return { id: this.b.extensions[this.b.low], bad: seeingBad };
            }
            // the second half is disabled so if there is still bad it must be
            // in the first half
            const nextState = new BisectState(this.b.extensions, seeingBad ? this.b.low : this.b.mid, seeingBad ? this.b.mid : this.b.high);
            this.d.store(ExtensionBisectService_1.a, JSON.stringify(nextState), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            await this.d.flush();
            return undefined;
        }
        async reset() {
            this.d.remove(ExtensionBisectService_1.a, -1 /* StorageScope.APPLICATION */);
            await this.d.flush();
        }
    };
    ExtensionBisectService = ExtensionBisectService_1 = __decorate([
        __param(0, log_1.$5i),
        __param(1, storage_1.$Vo),
        __param(2, environmentService_1.$hJ)
    ], ExtensionBisectService);
    (0, extensions_2.$mr)(exports.$Gzb, ExtensionBisectService, 1 /* InstantiationType.Delayed */);
    // --- bisect UI
    let ExtensionBisectUi = class ExtensionBisectUi {
        static { ExtensionBisectUi_1 = this; }
        static { this.ctxIsBisectActive = new contextkey_1.$2i('isExtensionBisectActive', false); }
        constructor(contextKeyService, a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            if (a.isActive) {
                ExtensionBisectUi_1.ctxIsBisectActive.bindTo(contextKeyService).set(true);
                this.d();
            }
        }
        d() {
            const goodPrompt = {
                label: (0, nls_1.localize)(0, null),
                run: () => this.c.executeCommand('extension.bisect.next', false)
            };
            const badPrompt = {
                label: (0, nls_1.localize)(1, null),
                run: () => this.c.executeCommand('extension.bisect.next', true)
            };
            const stop = {
                label: 'Stop Bisect',
                run: () => this.c.executeCommand('extension.bisect.stop')
            };
            const message = this.a.disabledCount === 1
                ? (0, nls_1.localize)(2, null)
                : (0, nls_1.localize)(3, null, this.a.disabledCount);
            this.b.prompt(notification_1.Severity.Info, message, [goodPrompt, badPrompt, stop], { sticky: true, priority: notification_1.NotificationPriority.URGENT });
        }
    };
    ExtensionBisectUi = ExtensionBisectUi_1 = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, exports.$Gzb),
        __param(2, notification_1.$Yu),
        __param(3, commands_1.$Fr)
    ], ExtensionBisectUi);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ExtensionBisectUi, 3 /* LifecyclePhase.Restored */);
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'extension.bisect.start',
                title: { value: (0, nls_1.localize)(4, null), original: 'Start Extension Bisect' },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                precondition: ExtensionBisectUi.ctxIsBisectActive.negate(),
                menu: {
                    id: actions_1.$Ru.ViewContainerTitle,
                    when: contextkey_1.$Ii.equals('viewContainer', 'workbench.view.extensions'),
                    group: '2_enablement',
                    order: 4
                }
            });
        }
        async run(accessor) {
            const dialogService = accessor.get(dialogs_1.$oA);
            const hostService = accessor.get(host_1.$VT);
            const extensionManagement = accessor.get(extensionManagement_1.$2n);
            const extensionEnablementService = accessor.get(extensionManagement_2.$icb);
            const extensionsBisect = accessor.get(exports.$Gzb);
            const extensions = (await extensionManagement.getInstalled(1 /* ExtensionType.User */)).filter(ext => extensionEnablementService.isEnabled(ext));
            const res = await dialogService.confirm({
                message: (0, nls_1.localize)(5, null),
                detail: (0, nls_1.localize)(6, null, 2 + Math.log2(extensions.length) | 0),
                primaryButton: (0, nls_1.localize)(7, null)
            });
            if (res.confirmed) {
                await extensionsBisect.start(extensions);
                hostService.reload();
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'extension.bisect.next',
                title: { value: (0, nls_1.localize)(8, null), original: 'Continue Extension Bisect' },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                precondition: ExtensionBisectUi.ctxIsBisectActive
            });
        }
        async run(accessor, seeingBad) {
            const dialogService = accessor.get(dialogs_1.$oA);
            const hostService = accessor.get(host_1.$VT);
            const bisectService = accessor.get(exports.$Gzb);
            const productService = accessor.get(productService_1.$kj);
            const extensionEnablementService = accessor.get(extensionManagement_1.$5n);
            const issueService = accessor.get(issue_1.$rtb);
            if (!bisectService.isActive) {
                return;
            }
            if (seeingBad === undefined) {
                const goodBadStopCancel = await this.a(dialogService, bisectService);
                if (goodBadStopCancel === null) {
                    return;
                }
                seeingBad = goodBadStopCancel;
            }
            if (seeingBad === undefined) {
                await bisectService.reset();
                hostService.reload();
                return;
            }
            const done = await bisectService.next(seeingBad);
            if (!done) {
                hostService.reload();
                return;
            }
            if (done.bad) {
                // DONE but nothing found
                await dialogService.info((0, nls_1.localize)(9, null), (0, nls_1.localize)(10, null, productService.nameShort));
            }
            else {
                // DONE and identified extension
                const res = await dialogService.confirm({
                    type: notification_1.Severity.Info,
                    message: (0, nls_1.localize)(11, null),
                    primaryButton: (0, nls_1.localize)(12, null),
                    cancelButton: (0, nls_1.localize)(13, null),
                    detail: (0, nls_1.localize)(14, null, done.id),
                    checkbox: { label: (0, nls_1.localize)(15, null), checked: true }
                });
                if (res.checkboxChecked) {
                    await extensionEnablementService.disableExtension({ id: done.id }, undefined);
                }
                if (res.confirmed) {
                    await issueService.openReporter({ extensionId: done.id });
                }
            }
            await bisectService.reset();
            hostService.reload();
        }
        async a(dialogService, bisectService) {
            const { result } = await dialogService.prompt({
                type: notification_1.Severity.Info,
                message: (0, nls_1.localize)(16, null),
                detail: (0, nls_1.localize)(17, null, bisectService.disabledCount),
                buttons: [
                    {
                        label: (0, nls_1.localize)(18, null),
                        run: () => false // good now
                    },
                    {
                        label: (0, nls_1.localize)(19, null),
                        run: () => true // bad
                    },
                    {
                        label: (0, nls_1.localize)(20, null),
                        run: () => undefined // stop
                    }
                ],
                cancelButton: {
                    label: (0, nls_1.localize)(21, null),
                    run: () => null // cancel
                }
            });
            return result;
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'extension.bisect.stop',
                title: { value: (0, nls_1.localize)(22, null), original: 'Stop Extension Bisect' },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                precondition: ExtensionBisectUi.ctxIsBisectActive
            });
        }
        async run(accessor) {
            const extensionsBisect = accessor.get(exports.$Gzb);
            const hostService = accessor.get(host_1.$VT);
            await extensionsBisect.reset();
            hostService.reload();
        }
    });
});
//# sourceMappingURL=extensionBisect.js.map