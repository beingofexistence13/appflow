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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/platform/product/common/productService", "vs/platform/actions/common/actions", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/telemetry/common/telemetry", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, lifecycle_1, commands_1, productService_1, actions_1, extensionManagement_1, telemetry_1, extensions_1, extensionManagement_2, contextkey_1) {
    "use strict";
    var RemoteStartEntry_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteStartEntry = exports.showStartEntryInWeb = void 0;
    exports.showStartEntryInWeb = new contextkey_1.RawContextKey('showRemoteStartEntryInWeb', false);
    let RemoteStartEntry = class RemoteStartEntry extends lifecycle_1.Disposable {
        static { RemoteStartEntry_1 = this; }
        static { this.REMOTE_WEB_START_ENTRY_ACTIONS_COMMAND_ID = 'workbench.action.remote.showWebStartEntryActions'; }
        constructor(commandService, productService, extensionManagementService, extensionEnablementService, telemetryService, contextKeyService) {
            super();
            this.commandService = commandService;
            this.productService = productService;
            this.extensionManagementService = extensionManagementService;
            this.extensionEnablementService = extensionEnablementService;
            this.telemetryService = telemetryService;
            this.contextKeyService = contextKeyService;
            const remoteExtensionTips = this.productService.remoteExtensionTips?.['tunnel'];
            this.startCommand = remoteExtensionTips?.startEntry?.startCommand ?? '';
            this.remoteExtensionId = remoteExtensionTips?.extensionId ?? '';
            this._init();
            this.registerActions();
            this.registerListeners();
        }
        registerActions() {
            const category = { value: nls.localize('remote.category', "Remote"), original: 'Remote' };
            // Show Remote Start Action
            const startEntry = this;
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: RemoteStartEntry_1.REMOTE_WEB_START_ENTRY_ACTIONS_COMMAND_ID,
                        category,
                        title: { value: nls.localize('remote.showWebStartEntryActions', "Show Remote Start Entry for web"), original: 'Show Remote Start Entry for web' },
                        f1: false
                    });
                }
                async run() {
                    await startEntry.showWebRemoteStartActions();
                }
            });
        }
        registerListeners() {
            this._register(this.extensionEnablementService.onEnablementChanged(async (result) => {
                for (const ext of result) {
                    if (extensions_1.ExtensionIdentifier.equals(this.remoteExtensionId, ext.identifier.id)) {
                        if (this.extensionEnablementService.isEnabled(ext)) {
                            exports.showStartEntryInWeb.bindTo(this.contextKeyService).set(true);
                        }
                        else {
                            exports.showStartEntryInWeb.bindTo(this.contextKeyService).set(false);
                        }
                    }
                }
            }));
        }
        async _init() {
            // Check if installed and enabled
            const installed = (await this.extensionManagementService.getInstalled()).find(value => extensions_1.ExtensionIdentifier.equals(value.identifier.id, this.remoteExtensionId));
            if (installed) {
                if (this.extensionEnablementService.isEnabled(installed)) {
                    exports.showStartEntryInWeb.bindTo(this.contextKeyService).set(true);
                }
            }
        }
        async showWebRemoteStartActions() {
            this.commandService.executeCommand(this.startCommand);
            this.telemetryService.publicLog2('workbenchActionExecuted', {
                id: this.startCommand,
                from: 'remote start entry'
            });
        }
    };
    exports.RemoteStartEntry = RemoteStartEntry;
    exports.RemoteStartEntry = RemoteStartEntry = RemoteStartEntry_1 = __decorate([
        __param(0, commands_1.ICommandService),
        __param(1, productService_1.IProductService),
        __param(2, extensionManagement_1.IExtensionManagementService),
        __param(3, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, contextkey_1.IContextKeyService)
    ], RemoteStartEntry);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlU3RhcnRFbnRyeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3JlbW90ZS9icm93c2VyL3JlbW90ZVN0YXJ0RW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWVuRixRQUFBLG1CQUFtQixHQUFHLElBQUksMEJBQWEsQ0FBVSwyQkFBMkIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMzRixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLHNCQUFVOztpQkFFdkIsOENBQXlDLEdBQUcsa0RBQWtELEFBQXJELENBQXNEO1FBS3ZILFlBQ21DLGNBQStCLEVBQy9CLGNBQStCLEVBQ25CLDBCQUF1RCxFQUM5QywwQkFBZ0UsRUFDbkYsZ0JBQW1DLEVBQ2xDLGlCQUFxQztZQUUxRSxLQUFLLEVBQUUsQ0FBQztZQVAwQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDL0IsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ25CLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDOUMsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUFzQztZQUNuRixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ2xDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFJMUUsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLG1CQUFtQixFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLFlBQVksR0FBRyxtQkFBbUIsRUFBRSxVQUFVLEVBQUUsWUFBWSxJQUFJLEVBQUUsQ0FBQztZQUN4RSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsbUJBQW1CLEVBQUUsV0FBVyxJQUFJLEVBQUUsQ0FBQztZQUVoRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDYixJQUFJLENBQUMsZUFB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