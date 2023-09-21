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
define(["require", "exports", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/extensions/common/extensions", "vs/platform/commands/common/commands", "vs/platform/actions/common/actions", "vs/nls", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/notification/common/notification", "vs/base/common/actions", "vs/workbench/services/host/browser/host", "vs/base/common/lifecycle", "vs/base/common/cancellation", "vs/base/common/async"], function (require, exports, extensions_1, extensions_2, commands_1, actions_1, nls_1, extensionManagementUtil_1, notification_1, actions_2, host_1, lifecycle_1, cancellation_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionDependencyChecker = void 0;
    let ExtensionDependencyChecker = class ExtensionDependencyChecker extends lifecycle_1.Disposable {
        constructor(extensionService, extensionsWorkbenchService, notificationService, hostService) {
            super();
            this.extensionService = extensionService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.notificationService = notificationService;
            this.hostService = hostService;
            commands_1.CommandsRegistry.registerCommand('workbench.extensions.installMissingDependencies', () => this.installMissingDependencies());
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
                command: {
                    id: 'workbench.extensions.installMissingDependencies',
                    category: (0, nls_1.localize)('extensions', "Extensions"),
                    title: (0, nls_1.localize)('auto install missing deps', "Install Missing Dependencies")
                }
            });
        }
        async getUninstalledMissingDependencies() {
            const allMissingDependencies = await this.getAllMissingDependencies();
            const localExtensions = await this.extensionsWorkbenchService.queryLocal();
            return allMissingDependencies.filter(id => localExtensions.every(l => !(0, extensionManagementUtil_1.areSameExtensions)(l.identifier, { id })));
        }
        async getAllMissingDependencies() {
            await this.extensionService.whenInstalledExtensionsRegistered();
            const runningExtensionsIds = this.extensionService.extensions.reduce((result, r) => { result.add(r.identifier.value.toLowerCase()); return result; }, new Set());
            const missingDependencies = new Set();
            for (const extension of this.extensionService.extensions) {
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
        async installMissingDependencies() {
            const missingDependencies = await this.getUninstalledMissingDependencies();
            if (missingDependencies.length) {
                const extensions = await this.extensionsWorkbenchService.getExtensions(missingDependencies.map(id => ({ id })), cancellation_1.CancellationToken.None);
                if (extensions.length) {
                    await async_1.Promises.settled(extensions.map(extension => this.extensionsWorkbenchService.install(extension)));
                    this.notificationService.notify({
                        severity: notification_1.Severity.Info,
                        message: (0, nls_1.localize)('finished installing missing deps', "Finished installing missing dependencies. Please reload the window now."),
                        actions: {
                            primary: [new actions_2.Action('realod', (0, nls_1.localize)('reload', "Reload Window"), '', true, () => this.hostService.reload())]
                        }
                    });
                }
            }
            else {
                this.notificationService.info((0, nls_1.localize)('no missing deps', "There are no missing dependencies to install."));
            }
        }
    };
    exports.ExtensionDependencyChecker = ExtensionDependencyChecker;
    exports.ExtensionDependencyChecker = ExtensionDependencyChecker = __decorate([
        __param(0, extensions_2.IExtensionService),
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, notification_1.INotificationService),
        __param(3, host_1.IHostService)
    ], ExtensionDependencyChecker);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc0RlcGVuZGVuY3lDaGVja2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2V4dGVuc2lvbnNEZXBlbmRlbmN5Q2hlY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQnpGLElBQU0sMEJBQTBCLEdBQWhDLE1BQU0sMEJBQTJCLFNBQVEsc0JBQVU7UUFFekQsWUFDcUMsZ0JBQW1DLEVBQ3pCLDBCQUF1RCxFQUM5RCxtQkFBeUMsRUFDakQsV0FBeUI7WUFFeEQsS0FBSyxFQUFFLENBQUM7WUFMNEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN6QiwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTZCO1lBQzlELHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDakQsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFHeEQsMkJBQWdCLENBQUMsZUFBZSxDQUFDLGlEQUFpRCxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDLENBQUM7WUFDN0gsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxjQUFjLEVBQUU7Z0JBQ2xELE9BQU8sRUFBRTtvQkFDUixFQUFFLEVBQUUsaURBQWlEO29CQUNyRCxRQUFRLEVBQUUsSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQztvQkFDOUMsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLDhCQUE4QixDQUFDO2lCQUM1RTthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyxLQUFLLENBQUMsaUNBQWlDO1lBQzlDLE1BQU0sc0JBQXNCLEdBQUcsTUFBTSxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUN0RSxNQUFNLGVBQWUsR0FBRyxNQUFN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