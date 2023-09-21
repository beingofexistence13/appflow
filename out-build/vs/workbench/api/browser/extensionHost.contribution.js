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
    exports.$ttb = void 0;
    let $ttb = class $ttb {
        constructor(a) {
            this.a = a;
            // Classes that handle extension points...
            this.a.createInstance(jsonValidationExtensionPoint_1.$S$);
            this.a.createInstance(colorExtensionPoint_1.$T$);
            this.a.createInstance(iconExtensionPoint_1.$U$);
            this.a.createInstance(tokenClassificationExtensionPoint_1.$1$);
            this.a.createInstance(languageConfigurationExtensionPoint_1.$5$);
            this.a.createInstance(statusBarExtensionPoint_1.$ibb);
        }
    };
    exports.$ttb = $ttb;
    exports.$ttb = $ttb = __decorate([
        __param(0, instantiation_1.$Ah)
    ], $ttb);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($ttb, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=extensionHost.contribution.js.map