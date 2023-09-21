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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/storage/common/storage", "vs/workbench/services/environment/browser/environmentService", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/editor/browser/services/codeEditorService", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/workbench/contrib/welcomeDialog/browser/welcomeWidget", "vs/platform/telemetry/common/telemetry", "vs/platform/opener/common/opener", "vs/platform/configuration/common/configurationRegistry", "vs/nls!vs/workbench/contrib/welcomeDialog/browser/welcomeDialog.contribution", "vs/workbench/common/configuration", "vs/base/common/async", "vs/workbench/services/editor/common/editorService"], function (require, exports, platform_1, contributions_1, storage_1, environmentService_1, configuration_1, lifecycle_1, contextkey_1, codeEditorService_1, instantiation_1, commands_1, welcomeWidget_1, telemetry_1, opener_1, configurationRegistry_1, nls_1, configuration_2, async_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const configurationKey = 'workbench.welcome.experimental.dialog';
    let WelcomeDialogContribution = class WelcomeDialogContribution extends lifecycle_1.$kc {
        constructor(storageService, environmentService, configurationService, contextService, codeEditorService, instantiationService, commandService, telemetryService, openerService, editorService) {
            super();
            this.contextService = contextService;
            this.codeEditorService = codeEditorService;
            this.instantiationService = instantiationService;
            this.commandService = commandService;
            this.telemetryService = telemetryService;
            this.openerService = openerService;
            this.editorService = editorService;
            this.a = false;
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
            this.B(editorService.onDidActiveEditorChange(() => {
                if (!this.a) {
                    const codeEditor = codeEditorService.getActiveCodeEditor();
                    if (codeEditor?.hasModel()) {
                        const scheduler = new async_1.$Sg(() => {
                            const notificationsVisible = contextService.contextMatchesRules(contextkey_1.$Ii.deserialize('notificationCenterVisible')) ||
                                contextService.contextMatchesRules(contextkey_1.$Ii.deserialize('notificationToastsVisible'));
                            if (codeEditor === codeEditorService.getActiveCodeEditor() && !notificationsVisible) {
                                this.a = true;
                                const welcomeWidget = new welcomeWidget_1.$14b(codeEditor, instantiationService, commandService, telemetryService, openerService);
                                welcomeWidget.render(welcomeDialog.title, welcomeDialog.message, welcomeDialog.buttonText, welcomeDialog.buttonCommand);
                            }
                        }, 3000);
                        this.B(codeEditor.onDidChangeModelContent((e) => {
                            if (!this.a) {
                                scheduler.schedule();
                            }
                        }));
                    }
                }
            }));
        }
    };
    WelcomeDialogContribution = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, environmentService_1.$LT),
        __param(2, configuration_1.$8h),
        __param(3, contextkey_1.$3i),
        __param(4, codeEditorService_1.$nV),
        __param(5, instantiation_1.$Ah),
        __param(6, commands_1.$Fr),
        __param(7, telemetry_1.$9k),
        __param(8, opener_1.$NT),
        __param(9, editorService_1.$9C)
    ], WelcomeDialogContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(WelcomeDialogContribution, 4 /* LifecyclePhase.Eventually */);
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration({
        ...configuration_2.$0y,
        properties: {
            'workbench.welcome.experimental.dialog': {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                type: 'boolean',
                default: false,
                tags: ['experimental'],
                description: (0, nls_1.localize)(0, null)
            }
        }
    });
});
//# sourceMappingURL=welcomeDialog.contribution.js.map