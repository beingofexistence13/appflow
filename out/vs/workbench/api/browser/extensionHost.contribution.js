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
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/jsonValidationExtensionPoint", "vs/workbench/services/themes/common/colorExtensionPoint", "vs/workbench/services/themes/common/iconExtensionPoint", "vs/workbench/services/themes/common/tokenClassificationExtensionPoint", "vs/workbench/contrib/codeEditor/browser/languageConfigurationExtensionPoint", "vs/workbench/api/browser/statusBarExtensionPoint", "./mainThreadLocalization", "./mainThreadBulkEdits", "./mainThreadChatProvider", "./mainThreadChatSlashCommands", "./mainThreadChatAgents", "./mainThreadChatVariables", "./mainThreadCodeInsets", "./mainThreadCLICommands", "./mainThreadClipboard", "./mainThreadCommands", "./mainThreadConfiguration", "./mainThreadConsole", "./mainThreadDebugService", "./mainThreadDecorations", "./mainThreadDiagnostics", "./mainThreadDialogs", "./mainThreadDocumentContentProviders", "./mainThreadDocuments", "./mainThreadDocumentsAndEditors", "./mainThreadEditor", "./mainThreadEditors", "./mainThreadEditorTabs", "./mainThreadErrors", "./mainThreadExtensionService", "./mainThreadFileSystem", "./mainThreadFileSystemEventService", "./mainThreadLanguageFeatures", "./mainThreadLanguages", "./mainThreadLogService", "./mainThreadMessageService", "./mainThreadManagedSockets", "./mainThreadOutputService", "./mainThreadProgress", "./mainThreadQuickDiff", "./mainThreadQuickOpen", "./mainThreadRemoteConnectionData", "./mainThreadSaveParticipant", "./mainThreadEditSessionIdentityParticipant", "./mainThreadSCM", "./mainThreadSearch", "./mainThreadStatusBar", "./mainThreadStorage", "./mainThreadTelemetry", "./mainThreadTerminalService", "./mainThreadTheming", "./mainThreadTreeViews", "./mainThreadDownloadService", "./mainThreadUrls", "./mainThreadUriOpeners", "./mainThreadWindow", "./mainThreadWebviewManager", "./mainThreadWorkspace", "./mainThreadComments", "./mainThreadNotebook", "./mainThreadNotebookKernels", "./mainThreadNotebookDocumentsAndEditors", "./mainThreadNotebookRenderers", "./mainThreadNotebookSaveParticipant", "./mainThreadInteractive", "./mainThreadInlineChat", "./mainThreadChat", "./mainThreadTask", "./mainThreadLabelService", "./mainThreadTunnelService", "./mainThreadAuthentication", "./mainThreadTimeline", "./mainThreadTesting", "./mainThreadSecretState", "./mainThreadShare", "./mainThreadProfilContentHandlers", "./mainThreadAiRelatedInformation", "./mainThreadAiEmbeddingVector", "./mainThreadIssueReporter"], function (require, exports, contributions_1, platform_1, instantiation_1, jsonValidationExtensionPoint_1, colorExtensionPoint_1, iconExtensionPoint_1, tokenClassificationExtensionPoint_1, languageConfigurationExtensionPoint_1, statusBarExtensionPoint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionPoints = void 0;
    let ExtensionPoints = class ExtensionPoints {
        constructor(instantiationService) {
            this.instantiationService = instantiationService;
            // Classes that handle extension points...
            this.instantiationService.createInstance(jsonValidationExtensionPoint_1.JSONValidationExtensionPoint);
            this.instantiationService.createInstance(colorExtensionPoint_1.ColorExtensionPoint);
            this.instantiationService.createInstance(iconExtensionPoint_1.IconExtensionPoint);
            this.instantiationService.createInstance(tokenClassificationExtensionPoint_1.TokenClassificationExtensionPoints);
            this.instantiationService.createInstance(languageConfigurationExtensionPoint_1.LanguageConfigurationFileHandler);
            this.instantiationService.createInstance(statusBarExtensionPoint_1.StatusBarItemsExtensionPoint);
        }
    };
    exports.ExtensionPoints = ExtensionPoints;
    exports.ExtensionPoints = ExtensionPoints = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], ExtensionPoints);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ExtensionPoints, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdC5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvZXh0ZW5zaW9uSG9zdC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMEZ6RixJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFlO1FBRTNCLFlBQ3lDLG9CQUEyQztZQUEzQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBRW5GLDBDQUEwQztZQUMxQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDJEQUE0QixDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx5Q0FBbUIsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsdUNBQWtCLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHNFQUFrQyxDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxzRUFBZ0MsQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsc0RBQTRCLENBQUMsQ0FBQztRQUN4RSxDQUFDO0tBQ0QsQ0FBQTtJQWJZLDBDQUFlOzhCQUFmLGVBQWU7UUFHekIsV0FBQSxxQ0FBcUIsQ0FBQTtPQUhYLGVBQWUsQ0FhM0I7SUFFRCxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsZUFBZSxrQ0FBMEIsQ0FBQyJ9