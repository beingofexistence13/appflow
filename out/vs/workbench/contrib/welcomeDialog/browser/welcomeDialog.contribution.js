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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/storage/common/storage", "vs/workbench/services/environment/browser/environmentService", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/editor/browser/services/codeEditorService", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/workbench/contrib/welcomeDialog/browser/welcomeWidget", "vs/platform/telemetry/common/telemetry", "vs/platform/opener/common/opener", "vs/platform/configuration/common/configurationRegistry", "vs/nls", "vs/workbench/common/configuration", "vs/base/common/async", "vs/workbench/services/editor/common/editorService"], function (require, exports, platform_1, contributions_1, storage_1, environmentService_1, configuration_1, lifecycle_1, contextkey_1, codeEditorService_1, instantiation_1, commands_1, welcomeWidget_1, telemetry_1, opener_1, configurationRegistry_1, nls_1, configuration_2, async_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const configurationKey = 'workbench.welcome.experimental.dialog';
    let WelcomeDialogContribution = class WelcomeDialogContribution extends lifecycle_1.Disposable {
        constructor(storageService, environmentService, configurationService, contextService, codeEditorService, instantiationService, commandService, telemetryService, openerService, editorService) {
            super();
            this.contextService = contextService;
            this.codeEditorService = codeEditorService;
            this.instantiationService = instantiationService;
            this.commandService = commandService;
            this.telemetryService = telemetryService;
            this.openerService = openerService;
            this.editorService = editorService;
            this.isRendered = false;
            if (!storageService.isNew(-1 /* StorageScope.APPLICATION */)) {
                return; // do not show if this is not the first session
            }
            const setting = configurationService.inspect(configurationKey);
            if (!setting.value) {
                return;
            }
            const welcomeDialog = environmentService.options?.welcomeDialog;
            if (!welcomeDialog) {
                return;
            }
            this._register(editorService.onDidActiveEditorChange(() => {
                if (!this.isRendered) {
                    const codeEditor = codeEditorService.getActiveCodeEditor();
                    if (codeEditor?.hasModel()) {
                        const scheduler = new async_1.RunOnceScheduler(() => {
                            const notificationsVisible = contextService.contextMatchesRules(contextkey_1.ContextKeyExpr.deserialize('notificationCenterVisible')) ||
                                contextService.contextMatchesRules(contextkey_1.ContextKeyExpr.deserialize('notificationToastsVisible'));
                            if (codeEditor === codeEditorService.getActiveCodeEditor() && !notificationsVisible) {
                                this.isRendered = true;
                                const welcomeWidget = new welcomeWidget_1.WelcomeWidget(codeEditor, instantiationService, commandService, telemetryService, openerService);
                                welcomeWidget.render(welcomeDialog.title, welcomeDialog.message, welcomeDialog.buttonText, welcomeDialog.buttonCommand);
                            }
                        }, 3000);
                        this._register(codeEditor.onDidChangeModelContent((e) => {
                            if (!this.isRendered) {
                                scheduler.schedule();
                            }
                        }));
                    }
                }
            }));
        }
    };
    WelcomeDialogContribution = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, codeEditorService_1.ICodeEditorService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, commands_1.ICommandService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, opener_1.IOpenerService),
        __param(9, editorService_1.IEditorService)
    ], WelcomeDialogContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(WelcomeDialogContribution, 4 /* LifecyclePhase.Eventually */);
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        ...configuration_2.applicationConfigurationNodeBase,
        properties: {
            'workbench.welcome.experimental.dialog': {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                type: 'boolean',
                default: false,
                tags: ['experimental'],
                description: (0, nls_1.localize)('workbench.welcome.dialog', "When enabled, a welcome widget is shown in the editor")
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VsY29tZURpYWxvZy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWxjb21lRGlhbG9nL2Jyb3dzZXIvd2VsY29tZURpYWxvZy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLE1BQU0sZ0JBQWdCLEdBQUcsdUNBQXVDLENBQUM7SUFFakUsSUFBTSx5QkFBeUIsR0FBL0IsTUFBTSx5QkFBMEIsU0FBUSxzQkFBVTtRQUlqRCxZQUNrQixjQUErQixFQUNYLGtCQUF1RCxFQUNyRSxvQkFBMkMsRUFDOUMsY0FBMkMsRUFDM0MsaUJBQThDLEVBQzNDLG9CQUFvRCxFQUMxRCxjQUF3QyxFQUN0QyxnQkFBNEMsRUFDL0MsYUFBc0MsRUFDdEMsYUFBc0M7WUFFdEQsS0FBSyxFQUFFLENBQUM7WUFScUIsbUJBQWMsR0FBZCxjQUFjLENBQW9CO1lBQ2xDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNqRCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDN0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN0QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDN0Isa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBWi9DLGVBQVUsR0FBRyxLQUFLLENBQUM7WUFnQjFCLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxtQ0FBMEIsRUFBRTtnQkFDcEQsT0FBTyxDQUFDLCtDQUErQzthQUN2RDtZQUVELE1BQU0sT0FBTyxHQUFHLG9CQUFvQixDQUFDLE9BQU8sQ0FBVSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO2dCQUNuQixPQUFPO2FBQ1A7WUFFRCxNQUFNLGFB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