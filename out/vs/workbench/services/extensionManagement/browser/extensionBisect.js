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
define(["require", "exports", "vs/nls", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/storage/common/storage", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/extensions", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/commands/common/commands", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/workbench/services/issue/common/issue", "vs/workbench/services/environment/common/environmentService", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/extensionManagement/common/extensionManagement"], function (require, exports, nls_1, extensionManagement_1, storage_1, extensions_1, extensions_2, notification_1, host_1, instantiation_1, actions_1, contextkey_1, dialogs_1, platform_1, contributions_1, commands_1, log_1, productService_1, issue_1, environmentService_1, extensionManagementUtil_1, actionCommonCategories_1, extensionManagement_2) {
    "use strict";
    var ExtensionBisectService_1, ExtensionBisectUi_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtensionBisectService = void 0;
    // --- bisect service
    exports.IExtensionBisectService = (0, instantiation_1.createDecorator)('IExtensionBisectService');
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
        static { this._storageKey = 'extensionBisectState'; }
        constructor(logService, _storageService, _envService) {
            this._storageService = _storageService;
            this._envService = _envService;
            this._disabled = new Map();
            const raw = _storageService.get(ExtensionBisectService_1._storageKey, -1 /* StorageScope.APPLICATION */);
            this._state = BisectState.fromJSON(raw);
            if (this._state) {
                const { mid, high } = this._state;
                for (let i = 0; i < this._state.extensions.length; i++) {
                    const isDisabled = i >= mid && i < high;
                    this._disabled.set(this._state.extensions[i], isDisabled);
                }
                logService.warn('extension BISECT active', [...this._disabled]);
            }
        }
        get isActive() {
            return !!this._state;
        }
        get disabledCount() {
            return this._state ? this._state.high - this._state.mid : -1;
        }
        isDisabledByBisect(extension) {
            if (!this._state) {
                // bisect isn't active
                return false;
            }
            if ((0, extensions_1.isResolverExtension)(extension.manifest, this._envService.remoteAuthority)) {
                // the current remote resolver extension cannot be disabled
                return false;
            }
            if (this._isEnabledInEnv(extension)) {
                // Extension enabled in env cannot be disabled
                return false;
            }
            const disabled = this._disabled.get(extension.identifier.id);
            return disabled ?? false;
        }
        _isEnabledInEnv(extension) {
            return Array.isArray(this._envService.enableExtensions) && this._envService.enableExtensions.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier));
        }
        async start(extensions) {
            if (this._state) {
                throw new Error('invalid state');
            }
            const extensionIds = extensions.map(ext => ext.identifier.id);
            const newState = new BisectState(extensionIds, 0, extensionIds.length, 0);
            this._storageService.store(ExtensionBisectService_1._storageKey, JSON.stringify(newState), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            await this._storageService.flush();
        }
        async next(seeingBad) {
            if (!this._state) {
                throw new Error('invalid state');
            }
            // check if bad when all extensions are disabled
            if (seeingBad && this._state.mid === 0 && this._state.high === this._state.extensions.length) {
                return { bad: true, id: '' };
            }
            // check if there is only one left
            if (this._state.low === this._state.high - 1) {
                await this.reset();
                return { id: this._state.extensions[this._state.low], bad: seeingBad };
            }
            // the second half is disabled so if there is still bad it must be
            // in the first half
            const nextState = new BisectState(this._state.extensions, seeingBad ? this._state.low : this._state.mid, seeingBad ? this._state.mid : this._state.high);
            this._storageService.store(ExtensionBisectService_1._storageKey, JSON.stringify(nextState), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            await this._storageService.flush();
            return undefined;
        }
        async reset() {
            this._storageService.remove(ExtensionBisectService_1._storageKey, -1 /* StorageScope.APPLICATION */);
            await this._storageService.flush();
        }
    };
    ExtensionBisectService = ExtensionBisectService_1 = __decorate([
        __param(0, log_1.ILogService),
        __param(1, storage_1.IStorageService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService)
    ], ExtensionBisectService);
    (0, extensions_2.registerSingleton)(exports.IExtensionBisectService, ExtensionBisectService, 1 /* InstantiationType.Delayed */);
    // --- bisect UI
    let ExtensionBisectUi = class ExtensionBisectUi {
        static { ExtensionBisectUi_1 = this; }
        static { this.ctxIsBisectActive = new contextkey_1.RawContextKey('isExtensionBisectActive', false); }
        constructor(contextKeyService, _extensionBisectService, _notificationService, _commandService) {
            this._extensionBisectService = _extensionBisectService;
            this._notificationService = _notificationService;
            this._commandService = _commandService;
            if (_extensionBisectService.isActive) {
                ExtensionBisectUi_1.ctxIsBisectActive.bindTo(contextKeyService).set(true);
                this._showBisectPrompt();
            }
        }
        _showBisectPrompt() {
            const goodPrompt = {
                label: (0, nls_1.localize)('I cannot reproduce', "I can't reproduce"),
                run: () => this._commandService.executeCommand('extension.bisect.next', false)
            };
            const badPrompt = {
                label: (0, nls_1.localize)('This is Bad', "I can reproduce"),
                run: () => this._commandService.executeCommand('extension.bisect.next', true)
            };
            const stop = {
                label: 'Stop Bisect',
                run: () => this._commandService.executeCommand('extension.bisect.stop')
            };
            const message = this._extensionBisectService.disabledCount === 1
                ? (0, nls_1.localize)('bisect.singular', "Extension Bisect is active and has disabled 1 extension. Check if you can still reproduce the problem and proceed by selecting from these options.")
                : (0, nls_1.localize)('bisect.plural', "Extension Bisect is active and has disabled {0} extensions. Check if you can still reproduce the problem and proceed by selecting from these options.", this._extensionBisectService.disabledCount);
            this._notificationService.prompt(notification_1.Severity.Info, message, [goodPrompt, badPrompt, stop], { sticky: true, priority: notification_1.NotificationPriority.URGENT });
        }
    };
    ExtensionBisectUi = ExtensionBisectUi_1 = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, exports.IExtensionBisectService),
        __param(2, notification_1.INotificationService),
        __param(3, commands_1.ICommandService)
    ], ExtensionBisectUi);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ExtensionBisectUi, 3 /* LifecyclePhase.Restored */);
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'extension.bisect.start',
                title: { value: (0, nls_1.localize)('title.start', "Start Extension Bisect"), original: 'Start Extension Bisect' },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                precondition: ExtensionBisectUi.ctxIsBisectActive.negate(),
                menu: {
                    id: actions_1.MenuId.ViewContainerTitle,
                    when: contextkey_1.ContextKeyExpr.equals('viewContainer', 'workbench.view.extensions'),
                    group: '2_enablement',
                    order: 4
                }
            });
        }
        async run(accessor) {
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const hostService = accessor.get(host_1.IHostService);
            const extensionManagement = accessor.get(extensionManagement_1.IExtensionManagementService);
            const extensionEnablementService = accessor.get(extensionManagement_2.IWorkbenchExtensionEnablementService);
            const extensionsBisect = accessor.get(exports.IExtensionBisectService);
            const extensions = (await extensionManagement.getInstalled(1 /* ExtensionType.User */)).filter(ext => extensionEnablementService.isEnabled(ext));
            const res = await dialogService.confirm({
                message: (0, nls_1.localize)('msg.start', "Extension Bisect"),
                detail: (0, nls_1.localize)('detail.start', "Extension Bisect will use binary search to find an extension that causes a problem. During the process the window reloads repeatedly (~{0} times). Each time you must confirm if you are still seeing problems.", 2 + Math.log2(extensions.length) | 0),
                primaryButton: (0, nls_1.localize)({ key: 'msg2', comment: ['&& denotes a mnemonic'] }, "&&Start Extension Bisect")
            });
            if (res.confirmed) {
                await extensionsBisect.start(extensions);
                hostService.reload();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'extension.bisect.next',
                title: { value: (0, nls_1.localize)('title.isBad', "Continue Extension Bisect"), original: 'Continue Extension Bisect' },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                precondition: ExtensionBisectUi.ctxIsBisectActive
            });
        }
        async run(accessor, seeingBad) {
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const hostService = accessor.get(host_1.IHostService);
            const bisectService = accessor.get(exports.IExtensionBisectService);
            const productService = accessor.get(productService_1.IProductService);
            const extensionEnablementService = accessor.get(extensionManagement_1.IGlobalExtensionEnablementService);
            const issueService = accessor.get(issue_1.IWorkbenchIssueService);
            if (!bisectService.isActive) {
                return;
            }
            if (seeingBad === undefined) {
                const goodBadStopCancel = await this._checkForBad(dialogService, bisectService);
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
                await dialogService.info((0, nls_1.localize)('done.msg', "Extension Bisect"), (0, nls_1.localize)('done.detail2', "Extension Bisect is done but no extension has been identified. This might be a problem with {0}.", productService.nameShort));
            }
            else {
                // DONE and identified extension
                const res = await dialogService.confirm({
                    type: notification_1.Severity.Info,
                    message: (0, nls_1.localize)('done.msg', "Extension Bisect"),
                    primaryButton: (0, nls_1.localize)({ key: 'report', comment: ['&& denotes a mnemonic'] }, "&&Report Issue & Continue"),
                    cancelButton: (0, nls_1.localize)('continue', "Continue"),
                    detail: (0, nls_1.localize)('done.detail', "Extension Bisect is done and has identified {0} as the extension causing the problem.", done.id),
                    checkbox: { label: (0, nls_1.localize)('done.disbale', "Keep this extension disabled"), checked: true }
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
        async _checkForBad(dialogService, bisectService) {
            const { result } = await dialogService.prompt({
                type: notification_1.Severity.Info,
                message: (0, nls_1.localize)('msg.next', "Extension Bisect"),
                detail: (0, nls_1.localize)('bisect', "Extension Bisect is active and has disabled {0} extensions. Check if you can still reproduce the problem and proceed by selecting from these options.", bisectService.disabledCount),
                buttons: [
                    {
                        label: (0, nls_1.localize)({ key: 'next.good', comment: ['&& denotes a mnemonic'] }, "I ca&&n't reproduce"),
                        run: () => false // good now
                    },
                    {
                        label: (0, nls_1.localize)({ key: 'next.bad', comment: ['&& denotes a mnemonic'] }, "I can &&reproduce"),
                        run: () => true // bad
                    },
                    {
                        label: (0, nls_1.localize)({ key: 'next.stop', comment: ['&& denotes a mnemonic'] }, "&&Stop Bisect"),
                        run: () => undefined // stop
                    }
                ],
                cancelButton: {
                    label: (0, nls_1.localize)({ key: 'next.cancel', comment: ['&& denotes a mnemonic'] }, "&&Cancel Bisect"),
                    run: () => null // cancel
                }
            });
            return result;
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'extension.bisect.stop',
                title: { value: (0, nls_1.localize)('title.stop', "Stop Extension Bisect"), original: 'Stop Extension Bisect' },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                precondition: ExtensionBisectUi.ctxIsBisectActive
            });
        }
        async run(accessor) {
            const extensionsBisect = accessor.get(exports.IExtensionBisectService);
            const hostService = accessor.get(host_1.IHostService);
            await extensionsBisect.reset();
            hostService.reload();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uQmlzZWN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbk1hbmFnZW1lbnQvYnJvd3Nlci9leHRlbnNpb25CaXNlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXlCaEcscUJBQXFCO0lBRVIsUUFBQSx1QkFBdUIsR0FBRyxJQUFBLCtCQUFlLEVBQTBCLHlCQUF5QixDQUFDLENBQUM7SUFjM0csTUFBTSxXQUFXO1FBRWhCLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBdUI7WUFDdEMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDVCxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELElBQUk7Z0JBRUgsTUFBTSxJQUFJLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbEMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdkU7WUFBQyxNQUFNO2dCQUNQLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1FBQ0YsQ0FBQztRQUVELFlBQ1UsVUFBb0IsRUFDcEIsR0FBVyxFQUNYLElBQVksRUFDWixNQUFjLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUhwQyxlQUFVLEdBQVYsVUFBVSxDQUFVO1lBQ3BCLFFBQUcsR0FBSCxHQUFHLENBQVE7WUFDWCxTQUFJLEdBQUosSUFBSSxDQUFRO1lBQ1osUUFBRyxHQUFILEdBQUcsQ0FBaUM7UUFDMUMsQ0FBQztLQUNMO0lBRUQsSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBc0I7O2lCQUlILGdCQUFXLEdBQUcsc0JB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