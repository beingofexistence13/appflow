/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/severity", "vs/base/common/uri", "vs/editor/common/config/editorOptions", "vs/editor/common/model", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languageSelector", "vs/platform/files/common/files", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extensionHostProtocol", "vs/workbench/api/common/extHostApiCommands", "vs/workbench/api/common/extHostClipboard", "vs/workbench/api/common/extHostCommands", "vs/workbench/api/common/extHostComments", "vs/workbench/api/common/extHostConfiguration", "vs/workbench/api/common/extHostDiagnostics", "vs/workbench/api/common/extHostDialogs", "vs/workbench/api/common/extHostDocumentContentProviders", "vs/workbench/api/common/extHostDocumentSaveParticipant", "vs/workbench/api/common/extHostDocuments", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostFileSystem", "vs/workbench/api/common/extHostFileSystemEventService", "vs/workbench/api/common/extHostLanguageFeatures", "vs/workbench/api/common/extHostLanguages", "vs/workbench/api/common/extHostMessageService", "vs/workbench/api/common/extHostOutput", "vs/workbench/api/common/extHostProgress", "vs/workbench/api/common/extHostQuickOpen", "vs/workbench/api/common/extHostSCM", "vs/workbench/api/common/extHostStatusBar", "vs/workbench/api/common/extHostStorage", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostTextEditors", "vs/workbench/api/common/extHostTreeViews", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/api/common/extHostUrls", "vs/workbench/api/common/extHostWebview", "vs/workbench/api/common/extHostWindow", "vs/workbench/api/common/extHostWorkspace", "vs/platform/extensions/common/extensions", "vs/workbench/api/common/extHostCodeInsets", "vs/workbench/api/common/extHostLabelService", "vs/platform/remote/common/remoteHosts", "vs/workbench/api/common/extHostDecorations", "vs/workbench/api/common/extHostTask", "vs/workbench/api/common/extHostDebugService", "vs/workbench/api/common/extHostSearch", "vs/platform/log/common/log", "vs/workbench/api/common/extHostUriTransformerService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostNotebook", "vs/workbench/api/common/extHostTheming", "vs/workbench/api/common/extHostTunnelService", "vs/workbench/api/common/extHostApiDeprecationService", "vs/workbench/api/common/extHostAuthentication", "vs/workbench/api/common/extHostTimeline", "vs/workbench/api/common/extHostStoragePaths", "vs/workbench/api/common/extHostFileSystemConsumer", "vs/workbench/api/common/extHostWebviewView", "vs/workbench/api/common/extHostCustomEditors", "vs/workbench/api/common/extHostWebviewPanels", "vs/workbench/api/common/extHostBulkEdits", "vs/workbench/api/common/extHostFileSystemInfo", "vs/workbench/api/common/extHostTesting", "vs/workbench/api/common/extHostUriOpener", "vs/workbench/api/common/extHostSecretState", "vs/workbench/api/common/extHostEditorTabs", "vs/workbench/api/common/extHostTelemetry", "vs/workbench/api/common/extHostNotebookKernels", "vs/workbench/services/search/common/searchExtTypes", "vs/workbench/api/common/extHostNotebookRenderers", "vs/base/common/network", "vs/platform/opener/common/opener", "vs/workbench/api/common/extHostNotebookEditors", "vs/workbench/api/common/extHostNotebookDocuments", "vs/workbench/api/common/extHostInteractive", "vs/base/common/lifecycle", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/debug/common/debug", "vs/workbench/api/common/extHostLocalizationService", "vs/platform/workspace/common/editSessions", "vs/workbench/api/common/extHostProfileContentHandler", "vs/workbench/api/common/extHostQuickDiff", "vs/workbench/api/common/extHostChat", "vs/workbench/api/common/extHostInlineChat", "vs/workbench/api/common/extHostNotebookDocumentSaveParticipant", "vs/workbench/api/common/extHostIssueReporter", "vs/workbench/api/common/extHostManagedSockets", "vs/workbench/api/common/extHostShare", "vs/workbench/api/common/extHostChatProvider", "vs/workbench/api/common/extHostChatSlashCommand", "vs/workbench/api/common/extHostChatVariables", "vs/workbench/api/common/extHostAiRelatedInformation", "vs/workbench/api/common/extHostEmbeddingVector", "vs/workbench/api/common/extHostChatAgents"], function (require, exports, cancellation_1, errors, event_1, severity_1, uri_1, editorOptions_1, model_1, languageConfiguration, languageSelector_1, files, extHost_protocol_1, extensionHostProtocol_1, extHostApiCommands_1, extHostClipboard_1, extHostCommands_1, extHostComments_1, extHostConfiguration_1, extHostDiagnostics_1, extHostDialogs_1, extHostDocumentContentProviders_1, extHostDocumentSaveParticipant_1, extHostDocuments_1, extHostDocumentsAndEditors_1, extHostExtensionService_1, extHostFileSystem_1, extHostFileSystemEventService_1, extHostLanguageFeatures_1, extHostLanguages_1, extHostMessageService_1, extHostOutput_1, extHostProgress_1, extHostQuickOpen_1, extHostSCM_1, extHostStatusBar_1, extHostStorage_1, extHostTerminalService_1, extHostTextEditors_1, extHostTreeViews_1, typeConverters, extHostTypes, telemetryUtils_1, extHostUrls_1, extHostWebview_1, extHostWindow_1, extHostWorkspace_1, extensions_1, extHostCodeInsets_1, extHostLabelService_1, remoteHosts_1, extHostDecorations_1, extHostTask_1, extHostDebugService_1, extHostSearch_1, log_1, extHostUriTransformerService_1, extHostRpcService_1, extHostInitDataService_1, extHostNotebook_1, extHostTheming_1, extHostTunnelService_1, extHostApiDeprecationService_1, extHostAuthentication_1, extHostTimeline_1, extHostStoragePaths_1, extHostFileSystemConsumer_1, extHostWebviewView_1, extHostCustomEditors_1, extHostWebviewPanels_1, extHostBulkEdits_1, extHostFileSystemInfo_1, extHostTesting_1, extHostUriOpener_1, extHostSecretState_1, extHostEditorTabs_1, extHostTelemetry_1, extHostNotebookKernels_1, searchExtTypes_1, extHostNotebookRenderers_1, network_1, opener_1, extHostNotebookEditors_1, extHostNotebookDocuments_1, extHostInteractive_1, lifecycle_1, extensions_2, debug_1, extHostLocalizationService_1, editSessions_1, extHostProfileContentHandler_1, extHostQuickDiff_1, extHostChat_1, extHostInlineChat_1, extHostNotebookDocumentSaveParticipant_1, extHostIssueReporter_1, extHostManagedSockets_1, extHostShare_1, extHostChatProvider_1, extHostChatSlashCommand_1, extHostChatVariables_1, extHostAiRelatedInformation_1, extHostEmbeddingVector_1, extHostChatAgents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createApiFactoryAndRegisterActors = void 0;
    /**
     * This method instantiates and returns the extension API surface
     */
    function createApiFactoryAndRegisterActors(accessor) {
        // services
        const initData = accessor.get(extHostInitDataService_1.IExtHostInitDataService);
        const extHostFileSystemInfo = accessor.get(extHostFileSystemInfo_1.IExtHostFileSystemInfo);
        const extHostConsumerFileSystem = accessor.get(extHostFileSystemConsumer_1.IExtHostConsumerFileSystem);
        const extensionService = accessor.get(extHostExtensionService_1.IExtHostExtensionService);
        const extHostWorkspace = accessor.get(extHostWorkspace_1.IExtHostWorkspace);
        const extHostTelemetry = accessor.get(extHostTelemetry_1.IExtHostTelemetry);
        const extHostConfiguration = accessor.get(extHostConfiguration_1.IExtHostConfiguration);
        const uriTransformer = accessor.get(extHostUriTransformerService_1.IURITransformerService);
        const rpcProtocol = accessor.get(extHostRpcService_1.IExtHostRpcService);
        const extHostStorage = accessor.get(extHostStorage_1.IExtHostStorage);
        const extensionStoragePaths = accessor.get(extHostStoragePaths_1.IExtensionStoragePaths);
        const extHostLoggerService = accessor.get(log_1.ILoggerService);
        const extHostLogService = accessor.get(log_1.ILogService);
        const extHostTunnelService = accessor.get(extHostTunnelService_1.IExtHostTunnelService);
        const extHostApiDeprecation = accessor.get(extHostApiDeprecationService_1.IExtHostApiDeprecationService);
        const extHostWindow = accessor.get(extHostWindow_1.IExtHostWindow);
        const extHostSecretState = accessor.get(extHostSecretState_1.IExtHostSecretState);
        const extHostEditorTabs = accessor.get(extHostEditorTabs_1.IExtHostEditorTabs);
        const extHostManagedSockets = accessor.get(extHostManagedSockets_1.IExtHostManagedSockets);
        // register addressable instances
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostFileSystemInfo, extHostFileSystemInfo);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostLogLevelServiceShape, extHostLoggerService);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostWorkspace, extHostWorkspace);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostConfiguration, extHostConfiguration);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostExtensionService, extensionService);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostStorage, extHostStorage);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTunnelService, extHostTunnelService);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostWindow, extHostWindow);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostSecretState, extHostSecretState);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTelemetry, extHostTelemetry);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostEditorTabs, extHostEditorTabs);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostManagedSockets, extHostManagedSockets);
        // automatically create and register addressable instances
        const extHostDecorations = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDecorations, accessor.get(extHostDecorations_1.IExtHostDecorations));
        const extHostDocumentsAndEditors = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocumentsAndEditors, accessor.get(extHostDocumentsAndEditors_1.IExtHostDocumentsAndEditors));
        const extHostCommands = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostCommands, accessor.get(extHostCommands_1.IExtHostCommands));
        const extHostTerminalService = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTerminalService, accessor.get(extHostTerminalService_1.IExtHostTerminalService));
        const extHostDebugService = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDebugService, accessor.get(extHostDebugService_1.IExtHostDebugService));
        const extHostSearch = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostSearch, accessor.get(extHostSearch_1.IExtHostSearch));
        const extHostTask = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTask, accessor.get(extHostTask_1.IExtHostTask));
        const extHostOutputService = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostOutputService, accessor.get(extHostOutput_1.IExtHostOutputService));
        const extHostLocalization = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostLocalization, accessor.get(extHostLocalizationService_1.IExtHostLocalizationService));
        // manually create and register addressable instances
        const extHostUrls = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostUrls, new extHostUrls_1.ExtHostUrls(rpcProtocol));
        const extHostDocuments = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocuments, new extHostDocuments_1.ExtHostDocuments(rpcProtocol, extHostDocumentsAndEditors));
        const extHostDocumentContentProviders = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocumentContentProviders, new extHostDocumentContentProviders_1.ExtHostDocumentContentProvider(rpcProtocol, extHostDocumentsAndEditors, extHostLogService));
        const extHostDocumentSaveParticipant = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocumentSaveParticipant, new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(extHostLogService, extHostDocuments, rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadBulkEdits)));
        const extHostNotebook = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostNotebook, new extHostNotebook_1.ExtHostNotebookController(rpcProtocol, extHostCommands, extHostDocumentsAndEditors, extHostDocuments, extHostConsumerFileSystem));
        const extHostNotebookDocuments = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostNotebookDocuments, new extHostNotebookDocuments_1.ExtHostNotebookDocuments(extHostNotebook));
        const extHostNotebookEditors = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostNotebookEditors, new extHostNotebookEditors_1.ExtHostNotebookEditors(extHostLogService, extHostNotebook));
        const extHostNotebookKernels = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostNotebookKernels, new extHostNotebookKernels_1.ExtHostNotebookKernels(rpcProtocol, initData, extHostNotebook, extHostCommands, extHostLogService));
        const extHostNotebookRenderers = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostNotebookRenderers, new extHostNotebookRenderers_1.ExtHostNotebookRenderers(rpcProtocol, extHostNotebook));
        const extHostNotebookDocumentSaveParticipant = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostNotebookDocumentSaveParticipant, new extHostNotebookDocumentSaveParticipant_1.ExtHostNotebookDocumentSaveParticipant(extHostLogService, extHostNotebook, rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadBulkEdits)));
        const extHostEditors = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostEditors, new extHostTextEditors_1.ExtHostEditors(rpcProtocol, extHostDocumentsAndEditors));
        const extHostTreeViews = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTreeViews, new extHostTreeViews_1.ExtHostTreeViews(rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadTreeViews), extHostCommands, extHostLogService));
        const extHostEditorInsets = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostEditorInsets, new extHostCodeInsets_1.ExtHostEditorInsets(rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadEditorInsets), extHostEditors, initData.remote));
        const extHostDiagnostics = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDiagnostics, new extHostDiagnostics_1.ExtHostDiagnostics(rpcProtocol, extHostLogService, extHostFileSystemInfo, extHostDocumentsAndEditors));
        const extHostLanguages = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostLanguages, new extHostLanguages_1.ExtHostLanguages(rpcProtocol, extHostDocuments, extHostCommands.converter, uriTransformer));
        const extHostLanguageFeatures = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostLanguageFeatures, new extHostLanguageFeatures_1.ExtHostLanguageFeatures(rpcProtocol, uriTransformer, extHostDocuments, extHostCommands, extHostDiagnostics, extHostLogService, extHostApiDeprecation, extHostTelemetry));
        const extHostFileSystem = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostFileSystem, new extHostFileSystem_1.ExtHostFileSystem(rpcProtocol, extHostLanguageFeatures));
        const extHostFileSystemEvent = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostFileSystemEventService, new extHostFileSystemEventService_1.ExtHostFileSystemEventService(rpcProtocol, extHostLogService, extHostDocumentsAndEditors));
        const extHostQuickOpen = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostQuickOpen, (0, extHostQuickOpen_1.createExtHostQuickOpen)(rpcProtocol, extHostWorkspace, extHostCommands));
        const extHostSCM = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostSCM, new extHostSCM_1.ExtHostSCM(rpcProtocol, extHostCommands, extHostDocuments, extHostLogService));
        const extHostQuickDiff = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostQuickDiff, new extHostQuickDiff_1.ExtHostQuickDiff(rpcProtocol, uriTransformer));
        const extHostShare = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostShare, new extHostShare_1.ExtHostShare(rpcProtocol, uriTransformer));
        const extHostComment = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostComments, (0, extHostComments_1.createExtHostComments)(rpcProtocol, extHostCommands, extHostDocuments));
        const extHostProgress = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostProgress, new extHostProgress_1.ExtHostProgress(rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadProgress)));
        const extHostLabelService = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHosLabelService, new extHostLabelService_1.ExtHostLabelService(rpcProtocol));
        const extHostTheming = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTheming, new extHostTheming_1.ExtHostTheming(rpcProtocol));
        const extHostAuthentication = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostAuthentication, new extHostAuthentication_1.ExtHostAuthentication(rpcProtocol));
        const extHostTimeline = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTimeline, new extHostTimeline_1.ExtHostTimeline(rpcProtocol, extHostCommands));
        const extHostWebviews = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostWebviews, new extHostWebview_1.ExtHostWebviews(rpcProtocol, initData.remote, extHostWorkspace, extHostLogService, extHostApiDeprecation));
        const extHostWebviewPanels = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostWebviewPanels, new extHostWebviewPanels_1.ExtHostWebviewPanels(rpcProtocol, extHostWebviews, extHostWorkspace));
        const extHostCustomEditors = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostCustomEditors, new extHostCustomEditors_1.ExtHostCustomEditors(rpcProtocol, extHostDocuments, extensionStoragePaths, extHostWebviews, extHostWebviewPanels));
        const extHostWebviewViews = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostWebviewViews, new extHostWebviewView_1.ExtHostWebviewViews(rpcProtocol, extHostWebviews));
        const extHostTesting = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTesting, new extHostTesting_1.ExtHostTesting(rpcProtocol, extHostCommands, extHostDocumentsAndEditors));
        const extHostUriOpeners = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostUriOpeners, new extHostUriOpener_1.ExtHostUriOpeners(rpcProtocol));
        const extHostProfileContentHandlers = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostProfileContentHandlers, new extHostProfileContentHandler_1.ExtHostProfileContentHandlers(rpcProtocol));
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostInteractive, new extHostInteractive_1.ExtHostInteractive(rpcProtocol, extHostNotebook, extHostDocumentsAndEditors, extHostCommands, extHostLogService));
        const extHostInteractiveEditor = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostInlineChat, new extHostInlineChat_1.ExtHostInteractiveEditor(rpcProtocol, extHostCommands, extHostDocuments, extHostLogService));
        const extHostChatProvider = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostChatProvider, new extHostChatProvider_1.ExtHostChatProvider(rpcProtocol, extHostLogService));
        const extHostChatSlashCommands = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostChatSlashCommands, new extHostChatSlashCommand_1.ExtHostChatSlashCommands(rpcProtocol, extHostChatProvider, extHostLogService));
        const extHostChatAgents = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostChatAgents, new extHostChatAgents_1.ExtHostChatAgents(rpcProtocol, extHostChatProvider, extHostLogService));
        const extHostChatVariables = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostChatVariables, new extHostChatVariables_1.ExtHostChatVariables(rpcProtocol));
        const extHostChat = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostChat, new extHostChat_1.ExtHostChat(rpcProtocol, extHostLogService));
        const extHostAiRelatedInformation = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostAiRelatedInformation, new extHostAiRelatedInformation_1.ExtHostRelatedInformation(rpcProtocol));
        const extHostAiEmbeddingVector = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostAiEmbeddingVector, new extHostEmbeddingVector_1.ExtHostAiEmbeddingVector(rpcProtocol));
        const extHostIssueReporter = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostIssueReporter, new extHostIssueReporter_1.ExtHostIssueReporter(rpcProtocol));
        const extHostStatusBar = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostStatusBar, new extHostStatusBar_1.ExtHostStatusBar(rpcProtocol, extHostCommands.converter));
        // Check that no named customers are missing
        const expected = Object.values(extHost_protocol_1.ExtHostContext);
        rpcProtocol.assertRegistered(expected);
        // Other instances
        const extHostBulkEdits = new extHostBulkEdits_1.ExtHostBulkEdits(rpcProtocol, extHostDocumentsAndEditors);
        const extHostClipboard = new extHostClipboard_1.ExtHostClipboard(rpcProtocol);
        const extHostMessageService = new extHostMessageService_1.ExtHostMessageService(rpcProtocol, extHostLogService);
        const extHostDialogs = new extHostDialogs_1.ExtHostDialogs(rpcProtocol);
        // Register API-ish commands
        extHostApiCommands_1.ExtHostApiCommands.register(extHostCommands);
        return function (extension, extensionInfo, configProvider) {
            // Check document selectors for being overly generic. Technically this isn't a problem but
            // in practice many extensions say they support `fooLang` but need fs-access to do so. Those
            // extension should specify then the `file`-scheme, e.g. `{ scheme: 'fooLang', language: 'fooLang' }`
            // We only inform once, it is not a warning because we just want to raise awareness and because
            // we cannot say if the extension is doing it right or wrong...
            const checkSelector = (function () {
                let done = !extension.isUnderDevelopment;
                function informOnce() {
                    if (!done) {
                        extHostLogService.info(`Extension '${extension.identifier.value}' uses a document selector without scheme. Learn more about this: https://go.microsoft.com/fwlink/?linkid=872305`);
                        done = true;
                    }
                }
                return function perform(selector) {
                    if (Array.isArray(selector)) {
                        selector.forEach(perform);
                    }
                    else if (typeof selector === 'string') {
                        informOnce();
                    }
                    else {
                        const filter = selector; // TODO: microsoft/TypeScript#42768
                        if (typeof filter.scheme === 'undefined') {
                            informOnce();
                        }
                        if (typeof filter.exclusive === 'boolean') {
                            (0, extensions_2.checkProposedApiEnabled)(extension, 'documentFiltersExclusive');
                        }
                    }
                    return selector;
                };
            })();
            const authentication = {
                getSession(providerId, scopes, options) {
                    return extHostAuthentication.getSession(extension, providerId, scopes, options);
                },
                getSessions(providerId, scopes) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'authGetSessions');
                    return extHostAuthentication.getSessions(extension, providerId, scopes);
                },
                // TODO: remove this after GHPR and Codespaces move off of it
                async hasSession(providerId, scopes) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'authSession');
                    return !!(await extHostAuthentication.getSession(extension, providerId, scopes, { silent: true }));
                },
                get onDidChangeSessions() {
                    return extHostAuthentication.onDidChangeSessions;
                },
                registerAuthenticationProvider(id, label, provider, options) {
                    return extHostAuthentication.registerAuthenticationProvider(id, label, provider, options);
                }
            };
            // namespace: commands
            const commands = {
                registerCommand(id, command, thisArgs) {
                    return extHostCommands.registerCommand(true, id, command, thisArgs, undefined, extension);
                },
                registerTextEditorCommand(id, callback, thisArg) {
                    return extHostCommands.registerCommand(true, id, (...args) => {
                        const activeTextEditor = extHostEditors.getActiveTextEditor();
                        if (!activeTextEditor) {
                            extHostLogService.warn('Cannot execute ' + id + ' because there is no active text editor.');
                            return undefined;
                        }
                        return activeTextEditor.edit((edit) => {
                            callback.apply(thisArg, [activeTextEditor, edit, ...args]);
                        }).then((result) => {
                            if (!result) {
                                extHostLogService.warn('Edits from command ' + id + ' were not applied.');
                            }
                        }, (err) => {
                            extHostLogService.warn('An error occurred while running command ' + id, err);
                        });
                    }, undefined, undefined, extension);
                },
                registerDiffInformationCommand: (id, callback, thisArg) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'diffCommand');
                    return extHostCommands.registerCommand(true, id, async (...args) => {
                        const activeTextEditor = extHostDocumentsAndEditors.activeEditor(true);
                        if (!activeTextEditor) {
                            extHostLogService.warn('Cannot execute ' + id + ' because there is no active text editor.');
                            return undefined;
                        }
                        const diff = await extHostEditors.getDiffInformation(activeTextEditor.id);
                        callback.apply(thisArg, [diff, ...args]);
                    }, undefined, undefined, extension);
                },
                executeCommand(id, ...args) {
                    return extHostCommands.executeCommand(id, ...args);
                },
                getCommands(filterInternal = false) {
                    return extHostCommands.getCommands(filterInternal);
                }
            };
            // namespace: env
            const env = {
                get machineId() { return initData.telemetryInfo.machineId; },
                get sessionId() { return initData.telemetryInfo.sessionId; },
                get language() { return initData.environment.appLanguage; },
                get appName() { return initData.environment.appName; },
                get appRoot() { return initData.environment.appRoot?.fsPath ?? ''; },
                get appHost() { return initData.environment.appHost; },
                get uriScheme() { return initData.environment.appUriScheme; },
                get clipboard() { return extHostClipboard.value; },
                get shell() {
                    return extHostTerminalService.getDefaultShell(false);
                },
                get onDidChangeShell() {
                    return extHostTerminalService.onDidChangeShell;
                },
                get isTelemetryEnabled() {
                    return extHostTelemetry.getTelemetryConfiguration();
                },
                get onDidChangeTelemetryEnabled() {
                    return extHostTelemetry.onDidChangeTelemetryEnabled;
                },
                get telemetryConfiguration() {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'telemetry');
                    return extHostTelemetry.getTelemetryDetails();
                },
                get onDidChangeTelemetryConfiguration() {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'telemetry');
                    return extHostTelemetry.onDidChangeTelemetryConfiguration;
                },
                get isNewAppInstall() {
                    return (0, extHostTelemetry_1.isNewAppInstall)(initData.telemetryInfo.firstSessionDate);
                },
                createTelemetryLogger(sender, options) {
                    extHostTelemetry_1.ExtHostTelemetryLogger.validateSender(sender);
                    return extHostTelemetry.instantiateLogger(extension, sender, options);
                },
                openExternal(uri, options) {
                    return extHostWindow.openUri(uri, {
                        allowTunneling: !!initData.remote.authority,
                        allowContributedOpeners: options?.allowContributedOpeners,
                    });
                },
                async asExternalUri(uri) {
                    if (uri.scheme === initData.environment.appUriScheme) {
                        return extHostUrls.createAppUri(uri);
                    }
                    try {
                        return await extHostWindow.asExternalUri(uri, { allowTunneling: !!initData.remote.authority });
                    }
                    catch (err) {
                        if ((0, opener_1.matchesScheme)(uri, network_1.Schemas.http) || (0, opener_1.matchesScheme)(uri, network_1.Schemas.https)) {
                            return uri;
                        }
                        throw err;
                    }
                },
                get remoteName() {
                    return (0, remoteHosts_1.getRemoteName)(initData.remote.authority);
                },
                get remoteAuthority() {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'resolvers');
                    return initData.remote.authority;
                },
                get uiKind() {
                    return initData.uiKind;
                },
                get logLevel() {
                    return extHostLogService.getLevel();
                },
                get onDidChangeLogLevel() {
                    return extHostLogService.onDidChangeLogLevel;
                },
                registerIssueUriRequestHandler(handler) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'handleIssueUri');
                    return extHostIssueReporter.registerIssueUriRequestHandler(extension, handler);
                },
                get appQuality() {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'resolvers');
                    return initData.quality;
                },
                get appCommit() {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'resolvers');
                    return initData.commit;
                },
            };
            if (!initData.environment.extensionTestsLocationURI) {
                // allow to patch env-function when running tests
                Object.freeze(env);
            }
            // namespace: tests
            const tests = {
                createTestController(provider, label, refreshHandler) {
                    return extHostTesting.createTestController(extension, provider, label, refreshHandler);
                },
                createTestObserver() {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'testObserver');
                    return extHostTesting.createTestObserver();
                },
                runTests(provider) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'testObserver');
                    return extHostTesting.runTests(provider);
                },
                get onDidChangeTestResults() {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'testObserver');
                    return extHostTesting.onResultsChanged;
                },
                get testResults() {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'testObserver');
                    return extHostTesting.results;
                },
            };
            // namespace: extensions
            const extensionKind = initData.remote.isRemote
                ? extHostTypes.ExtensionKind.Workspace
                : extHostTypes.ExtensionKind.UI;
            const extensions = {
                getExtension(extensionId, includeFromDifferentExtensionHosts) {
                    if (!(0, extensions_2.isProposedApiEnabled)(extension, 'extensionsAny')) {
                        includeFromDifferentExtensionHosts = false;
                    }
                    const mine = extensionInfo.mine.getExtensionDescription(extensionId);
                    if (mine) {
                        return new extHostExtensionService_1.Extension(extensionService, extension.identifier, mine, extensionKind, false);
                    }
                    if (includeFromDifferentExtensionHosts) {
                        const foreign = extensionInfo.all.getExtensionDescription(extensionId);
                        if (foreign) {
                            return new extHostExtensionService_1.Extension(extensionService, extension.identifier, foreign, extensionKind /* TODO@alexdima THIS IS WRONG */, true);
                        }
                    }
                    return undefined;
                },
                get all() {
                    const result = [];
                    for (const desc of extensionInfo.mine.getAllExtensionDescriptions()) {
                        result.push(new extHostExtensionService_1.Extension(extensionService, extension.identifier, desc, extensionKind, false));
                    }
                    return result;
                },
                get allAcrossExtensionHosts() {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'extensionsAny');
                    const local = new extensions_1.ExtensionIdentifierSet(extensionInfo.mine.getAllExtensionDescriptions().map(desc => desc.identifier));
                    const result = [];
                    for (const desc of extensionInfo.all.getAllExtensionDescriptions()) {
                        const isFromDifferentExtensionHost = !local.has(desc.identifier);
                        result.push(new extHostExtensionService_1.Extension(extensionService, extension.identifier, desc, extensionKind /* TODO@alexdima THIS IS WRONG */, isFromDifferentExtensionHost));
                    }
                    return result;
                },
                get onDidChange() {
                    if ((0, extensions_2.isProposedApiEnabled)(extension, 'extensionsAny')) {
                        return event_1.Event.any(extensionInfo.mine.onDidChange, extensionInfo.all.onDidChange);
                    }
                    return extensionInfo.mine.onDidChange;
                }
            };
            // namespace: languages
            const languages = {
                createDiagnosticCollection(name) {
                    return extHostDiagnostics.createDiagnosticCollection(extension.identifier, name);
                },
                get onDidChangeDiagnostics() {
                    return extHostDiagnostics.onDidChangeDiagnostics;
                },
                getDiagnostics: (resource) => {
                    return extHostDiagnostics.getDiagnostics(resource);
                },
                getLanguages() {
                    return extHostLanguages.getLanguages();
                },
                setTextDocumentLanguage(document, languageId) {
                    return extHostLanguages.changeLanguage(document.uri, languageId);
                },
                match(selector, document) {
                    const notebook = extHostDocuments.getDocumentData(document.uri)?.notebook;
                    return (0, languageSelector_1.score)(typeConverters.LanguageSelector.from(selector), document.uri, document.languageId, true, notebook?.uri, notebook?.notebookType);
                },
                registerCodeActionsProvider(selector, provider, metadata) {
                    return extHostLanguageFeatures.registerCodeActionProvider(extension, checkSelector(selector), provider, metadata);
                },
                registerDocumentPasteEditProvider(selector, provider, metadata) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'documentPaste');
                    return extHostLanguageFeatures.registerDocumentPasteEditProvider(extension, checkSelector(selector), provider, metadata);
                },
                registerCodeLensProvider(selector, provider) {
                    return extHostLanguageFeatures.registerCodeLensProvider(extension, checkSelector(selector), provider);
                },
                registerDefinitionProvider(selector, provider) {
                    return extHostLanguageFeatures.registerDefinitionProvider(extension, checkSelector(selector), provider);
                },
                registerDeclarationProvider(selector, provider) {
                    return extHostLanguageFeatures.registerDeclarationProvider(extension, checkSelector(selector), provider);
                },
                registerImplementationProvider(selector, provider) {
                    return extHostLanguageFeatures.registerImplementationProvider(extension, checkSelector(selector), provider);
                },
                registerTypeDefinitionProvider(selector, provider) {
                    return extHostLanguageFeatures.registerTypeDefinitionProvider(extension, checkSelector(selector), provider);
                },
                registerHoverProvider(selector, provider) {
                    return extHostLanguageFeatures.registerHoverProvider(extension, checkSelector(selector), provider, extension.identifier);
                },
                registerEvaluatableExpressionProvider(selector, provider) {
                    return extHostLanguageFeatures.registerEvaluatableExpressionProvider(extension, checkSelector(selector), provider, extension.identifier);
                },
                registerInlineValuesProvider(selector, provider) {
                    return extHostLanguageFeatures.registerInlineValuesProvider(extension, checkSelector(selector), provider, extension.identifier);
                },
                registerDocumentHighlightProvider(selector, provider) {
                    return extHostLanguageFeatures.registerDocumentHighlightProvider(extension, checkSelector(selector), provider);
                },
                registerLinkedEditingRangeProvider(selector, provider) {
                    return extHostLanguageFeatures.registerLinkedEditingRangeProvider(extension, checkSelector(selector), provider);
                },
                registerReferenceProvider(selector, provider) {
                    return extHostLanguageFeatures.registerReferenceProvider(extension, checkSelector(selector), provider);
                },
                registerRenameProvider(selector, provider) {
                    return extHostLanguageFeatures.registerRenameProvider(extension, checkSelector(selector), provider);
                },
                registerDocumentSymbolProvider(selector, provider, metadata) {
                    return extHostLanguageFeatures.registerDocumentSymbolProvider(extension, checkSelector(selector), provider, metadata);
                },
                registerWorkspaceSymbolProvider(provider) {
                    return extHostLanguageFeatures.registerWorkspaceSymbolProvider(extension, provider);
                },
                registerDocumentFormattingEditProvider(selector, provider) {
                    return extHostLanguageFeatures.registerDocumentFormattingEditProvider(extension, checkSelector(selector), provider);
                },
                registerDocumentRangeFormattingEditProvider(selector, provider) {
                    return extHostLanguageFeatures.registerDocumentRangeFormattingEditProvider(extension, checkSelector(selector), provider);
                },
                registerOnTypeFormattingEditProvider(selector, provider, firstTriggerCharacter, ...moreTriggerCharacters) {
                    return extHostLanguageFeatures.registerOnTypeFormattingEditProvider(extension, checkSelector(selector), provider, [firstTriggerCharacter].concat(moreTriggerCharacters));
                },
                registerDocumentSemanticTokensProvider(selector, provider, legend) {
                    return extHostLanguageFeatures.registerDocumentSemanticTokensProvider(extension, checkSelector(selector), provider, legend);
                },
                registerDocumentRangeSemanticTokensProvider(selector, provider, legend) {
                    return extHostLanguageFeatures.registerDocumentRangeSemanticTokensProvider(extension, checkSelector(selector), provider, legend);
                },
                registerSignatureHelpProvider(selector, provider, firstItem, ...remaining) {
                    if (typeof firstItem === 'object') {
                        return extHostLanguageFeatures.registerSignatureHelpProvider(extension, checkSelector(selector), provider, firstItem);
                    }
                    return extHostLanguageFeatures.registerSignatureHelpProvider(extension, checkSelector(selector), provider, typeof firstItem === 'undefined' ? [] : [firstItem, ...remaining]);
                },
                registerCompletionItemProvider(selector, provider, ...triggerCharacters) {
                    return extHostLanguageFeatures.registerCompletionItemProvider(extension, checkSelector(selector), provider, triggerCharacters);
                },
                registerInlineCompletionItemProvider(selector, provider, metadata) {
                    if (provider.handleDidShowCompletionItem) {
                        (0, extensions_2.checkProposedApiEnabled)(extension, 'inlineCompletionsAdditions');
                    }
                    if (provider.handleDidPartiallyAcceptCompletionItem) {
                        (0, extensions_2.checkProposedApiEnabled)(extension, 'inlineCompletionsAdditions');
                    }
                    if (metadata) {
                        (0, extensions_2.checkProposedApiEnabled)(extension, 'inlineCompletionsAdditions');
                    }
                    return extHostLanguageFeatures.registerInlineCompletionsProvider(extension, checkSelector(selector), provider, metadata);
                },
                registerDocumentLinkProvider(selector, provider) {
                    return extHostLanguageFeatures.registerDocumentLinkProvider(extension, checkSelector(selector), provider);
                },
                registerColorProvider(selector, provider) {
                    return extHostLanguageFeatures.registerColorProvider(extension, checkSelector(selector), provider);
                },
                registerFoldingRangeProvider(selector, provider) {
                    return extHostLanguageFeatures.registerFoldingRangeProvider(extension, checkSelector(selector), provider);
                },
                registerSelectionRangeProvider(selector, provider) {
                    return extHostLanguageFeatures.registerSelectionRangeProvider(extension, selector, provider);
                },
                registerCallHierarchyProvider(selector, provider) {
                    return extHostLanguageFeatures.registerCallHierarchyProvider(extension, selector, provider);
                },
                registerTypeHierarchyProvider(selector, provider) {
                    return extHostLanguageFeatures.registerTypeHierarchyProvider(extension, selector, provider);
                },
                setLanguageConfiguration: (language, configuration) => {
                    return extHostLanguageFeatures.setLanguageConfiguration(extension, language, configuration);
                },
                getTokenInformationAtPosition(doc, pos) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'tokenInformation');
                    return extHostLanguages.tokenAtPosition(doc, pos);
                },
                registerInlayHintsProvider(selector, provider) {
                    return extHostLanguageFeatures.registerInlayHintsProvider(extension, selector, provider);
                },
                createLanguageStatusItem(id, selector) {
                    return extHostLanguages.createLanguageStatusItem(extension, id, selector);
                },
                registerDocumentDropEditProvider(selector, provider, metadata) {
                    return extHostLanguageFeatures.registerDocumentOnDropEditProvider(extension, selector, provider, (0, extensions_2.isProposedApiEnabled)(extension, 'dropMetadata') ? metadata : undefined);
                }
            };
            // namespace: window
            const window = {
                get activeTextEditor() {
                    return extHostEditors.getActiveTextEditor();
                },
                get visibleTextEditors() {
                    return extHostEditors.getVisibleTextEditors();
                },
                get activeTerminal() {
                    return extHostTerminalService.activeTerminal;
                },
                get terminals() {
                    return extHostTerminalService.terminals;
                },
                async showTextDocument(documentOrUri, columnOrOptions, preserveFocus) {
                    const document = await (uri_1.URI.isUri(documentOrUri)
                        ? Promise.resolve(workspace.openTextDocument(documentOrUri))
                        : Promise.resolve(documentOrUri));
                    return extHostEditors.showTextDocument(document, columnOrOptions, preserveFocus);
                },
                createTextEditorDecorationType(options) {
                    return extHostEditors.createTextEditorDecorationType(extension, options);
                },
                onDidChangeActiveTextEditor(listener, thisArg, disposables) {
                    return extHostEditors.onDidChangeActiveTextEditor(listener, thisArg, disposables);
                },
                onDidChangeVisibleTextEditors(listener, thisArg, disposables) {
                    return extHostEditors.onDidChangeVisibleTextEditors(listener, thisArg, disposables);
                },
                onDidChangeTextEditorSelection(listener, thisArgs, disposables) {
                    return extHostEditors.onDidChangeTextEditorSelection(listener, thisArgs, disposables);
                },
                onDidChangeTextEditorOptions(listener, thisArgs, disposables) {
                    return extHostEditors.onDidChangeTextEditorOptions(listener, thisArgs, disposables);
                },
                onDidChangeTextEditorVisibleRanges(listener, thisArgs, disposables) {
                    return extHostEditors.onDidChangeTextEditorVisibleRanges(listener, thisArgs, disposables);
                },
                onDidChangeTextEditorViewColumn(listener, thisArg, disposables) {
                    return extHostEditors.onDidChangeTextEditorViewColumn(listener, thisArg, disposables);
                },
                onDidCloseTerminal(listener, thisArg, disposables) {
                    return extHostTerminalService.onDidCloseTerminal(listener, thisArg, disposables);
                },
                onDidOpenTerminal(listener, thisArg, disposables) {
                    return extHostTerminalService.onDidOpenTerminal(listener, thisArg, disposables);
                },
                onDidChangeActiveTerminal(listener, thisArg, disposables) {
                    return extHostTerminalService.onDidChangeActiveTerminal(listener, thisArg, disposables);
                },
                onDidChangeTerminalDimensions(listener, thisArg, disposables) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'terminalDimensions');
                    return extHostTerminalService.onDidChangeTerminalDimensions(listener, thisArg, disposables);
                },
                onDidChangeTerminalState(listener, thisArg, disposables) {
                    return extHostTerminalService.onDidChangeTerminalState(listener, thisArg, disposables);
                },
                onDidWriteTerminalData(listener, thisArg, disposables) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'terminalDataWriteEvent');
                    return extHostTerminalService.onDidWriteTerminalData(listener, thisArg, disposables);
                },
                onDidExecuteTerminalCommand(listener, thisArg, disposables) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'terminalExecuteCommandEvent');
                    return extHostTerminalService.onDidExecuteTerminalCommand(listener, thisArg, disposables);
                },
                get state() {
                    return extHostWindow.getState(extension);
                },
                onDidChangeWindowState(listener, thisArg, disposables) {
                    return extHostWindow.onDidChangeWindowState(listener, thisArg, disposables);
                },
                showInformationMessage(message, ...rest) {
                    return extHostMessageService.showMessage(extension, severity_1.default.Info, message, rest[0], rest.slice(1));
                },
                showWarningMessage(message, ...rest) {
                    return extHostMessageService.showMessage(extension, severity_1.default.Warning, message, rest[0], rest.slice(1));
                },
                showErrorMessage(message, ...rest) {
                    return extHostMessageService.showMessage(extension, severity_1.default.Error, message, rest[0], rest.slice(1));
                },
                showQuickPick(items, options, token) {
                    return extHostQuickOpen.showQuickPick(extension, items, options, token);
                },
                showWorkspaceFolderPick(options) {
                    return extHostQuickOpen.showWorkspaceFolderPick(options);
                },
                showInputBox(options, token) {
                    return extHostQuickOpen.showInput(options, token);
                },
                showOpenDialog(options) {
                    return extHostDialogs.showOpenDialog(extension, options);
                },
                showSaveDialog(options) {
                    return extHostDialogs.showSaveDialog(options);
                },
                createStatusBarItem(alignmentOrId, priorityOrAlignment, priorityArg) {
                    let id;
                    let alignment;
                    let priority;
                    if (typeof alignmentOrId === 'string') {
                        id = alignmentOrId;
                        alignment = priorityOrAlignment;
                        priority = priorityArg;
                    }
                    else {
                        alignment = alignmentOrId;
                        priority = priorityOrAlignment;
                    }
                    return extHostStatusBar.createStatusBarEntry(extension, id, alignment, priority);
                },
                setStatusBarMessage(text, timeoutOrThenable) {
                    return extHostStatusBar.setStatusBarMessage(text, timeoutOrThenable);
                },
                withScmProgress(task) {
                    extHostApiDeprecation.report('window.withScmProgress', extension, `Use 'withProgress' instead.`);
                    return extHostProgress.withProgress(extension, { location: extHostTypes.ProgressLocation.SourceControl }, (progress, token) => task({ report(n) { } }));
                },
                withProgress(options, task) {
                    return extHostProgress.withProgress(extension, options, task);
                },
                createOutputChannel(name, options) {
                    return extHostOutputService.createOutputChannel(name, options, extension);
                },
                createWebviewPanel(viewType, title, showOptions, options) {
                    return extHostWebviewPanels.createWebviewPanel(extension, viewType, title, showOptions, options);
                },
                createWebviewTextEditorInset(editor, line, height, options) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'editorInsets');
                    return extHostEditorInsets.createWebviewEditorInset(editor, line, height, options, extension);
                },
                createTerminal(nameOrOptions, shellPath, shellArgs) {
                    if (typeof nameOrOptions === 'object') {
                        if ('pty' in nameOrOptions) {
                            return extHostTerminalService.createExtensionTerminal(nameOrOptions);
                        }
                        return extHostTerminalService.createTerminalFromOptions(nameOrOptions);
                    }
                    return extHostTerminalService.createTerminal(nameOrOptions, shellPath, shellArgs);
                },
                registerTerminalLinkProvider(provider) {
                    return extHostTerminalService.registerLinkProvider(provider);
                },
                registerTerminalProfileProvider(id, provider) {
                    return extHostTerminalService.registerProfileProvider(extension, id, provider);
                },
                registerTerminalQuickFixProvider(id, provider) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'terminalQuickFixProvider');
                    return extHostTerminalService.registerTerminalQuickFixProvider(id, extension.identifier.value, provider);
                },
                registerTreeDataProvider(viewId, treeDataProvider) {
                    return extHostTreeViews.registerTreeDataProvider(viewId, treeDataProvider, extension);
                },
                createTreeView(viewId, options) {
                    return extHostTreeViews.createTreeView(viewId, options, extension);
                },
                registerWebviewPanelSerializer: (viewType, serializer) => {
                    return extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializer);
                },
                registerCustomEditorProvider: (viewType, provider, options = {}) => {
                    return extHostCustomEditors.registerCustomEditorProvider(extension, viewType, provider, options);
                },
                registerFileDecorationProvider(provider) {
                    return extHostDecorations.registerFileDecorationProvider(provider, extension);
                },
                registerUriHandler(handler) {
                    return extHostUrls.registerUriHandler(extension, handler);
                },
                createQuickPick() {
                    return extHostQuickOpen.createQuickPick(extension);
                },
                createInputBox() {
                    return extHostQuickOpen.createInputBox(extension);
                },
                get activeColorTheme() {
                    return extHostTheming.activeColorTheme;
                },
                onDidChangeActiveColorTheme(listener, thisArg, disposables) {
                    return extHostTheming.onDidChangeActiveColorTheme(listener, thisArg, disposables);
                },
                registerWebviewViewProvider(viewId, provider, options) {
                    return extHostWebviewViews.registerWebviewViewProvider(extension, viewId, provider, options?.webviewOptions);
                },
                get activeNotebookEditor() {
                    return extHostNotebook.activeNotebookEditor;
                },
                onDidChangeActiveNotebookEditor(listener, thisArgs, disposables) {
                    return extHostNotebook.onDidChangeActiveNotebookEditor(listener, thisArgs, disposables);
                },
                get visibleNotebookEditors() {
                    return extHostNotebook.visibleNotebookEditors;
                },
                get onDidChangeVisibleNotebookEditors() {
                    return extHostNotebook.onDidChangeVisibleNotebookEditors;
                },
                onDidChangeNotebookEditorSelection(listener, thisArgs, disposables) {
                    return extHostNotebookEditors.onDidChangeNotebookEditorSelection(listener, thisArgs, disposables);
                },
                onDidChangeNotebookEditorVisibleRanges(listener, thisArgs, disposables) {
                    return extHostNotebookEditors.onDidChangeNotebookEditorVisibleRanges(listener, thisArgs, disposables);
                },
                showNotebookDocument(document, options) {
                    return extHostNotebook.showNotebookDocument(document, options);
                },
                registerExternalUriOpener(id, opener, metadata) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'externalUriOpener');
                    return extHostUriOpeners.registerExternalUriOpener(extension.identifier, id, opener, metadata);
                },
                registerProfileContentHandler(id, handler) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'profileContentHandlers');
                    return extHostProfileContentHandlers.registrProfileContentHandler(extension, id, handler);
                },
                registerQuickDiffProvider(selector, quickDiffProvider, label, rootUri) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'quickDiffProvider');
                    return extHostQuickDiff.registerQuickDiffProvider(checkSelector(selector), quickDiffProvider, label, rootUri);
                },
                get tabGroups() {
                    return extHostEditorTabs.tabGroups;
                },
                registerShareProvider(selector, provider) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'shareProvider');
                    return extHostShare.registerShareProvider(checkSelector(selector), provider);
                }
            };
            // namespace: workspace
            const workspace = {
                get rootPath() {
                    extHostApiDeprecation.report('workspace.rootPath', extension, `Please use 'workspace.workspaceFolders' instead. More details: https://aka.ms/vscode-eliminating-rootpath`);
                    return extHostWorkspace.getPath();
                },
                set rootPath(value) {
                    throw new errors.ReadonlyError('rootPath');
                },
                getWorkspaceFolder(resource) {
                    return extHostWorkspace.getWorkspaceFolder(resource);
                },
                get workspaceFolders() {
                    return extHostWorkspace.getWorkspaceFolders();
                },
                get name() {
                    return extHostWorkspace.name;
                },
                set name(value) {
                    throw new errors.ReadonlyError('name');
                },
                get workspaceFile() {
                    return extHostWorkspace.workspaceFile;
                },
                set workspaceFile(value) {
                    throw new errors.ReadonlyError('workspaceFile');
                },
                updateWorkspaceFolders: (index, deleteCount, ...workspaceFoldersToAdd) => {
                    return extHostWorkspace.updateWorkspaceFolders(extension, index, deleteCount || 0, ...workspaceFoldersToAdd);
                },
                onDidChangeWorkspaceFolders: function (listener, thisArgs, disposables) {
                    return extHostWorkspace.onDidChangeWorkspace(listener, thisArgs, disposables);
                },
                asRelativePath: (pathOrUri, includeWorkspace) => {
                    return extHostWorkspace.getRelativePath(pathOrUri, includeWorkspace);
                },
                findFiles: (include, exclude, maxResults, token) => {
                    // Note, undefined/null have different meanings on "exclude"
                    return extHostWorkspace.findFiles(include, exclude, maxResults, extension.identifier, token);
                },
                findTextInFiles: (query, optionsOrCallback, callbackOrToken, token) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'findTextInFiles');
                    let options;
                    let callback;
                    if (typeof optionsOrCallback === 'object') {
                        options = optionsOrCallback;
                        callback = callbackOrToken;
                    }
                    else {
                        options = {};
                        callback = optionsOrCallback;
                        token = callbackOrToken;
                    }
                    return extHostWorkspace.findTextInFiles(query, options || {}, callback, extension.identifier, token);
                },
                save: (uri) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'saveEditor');
                    return extHostWorkspace.save(uri);
                },
                saveAs: (uri) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'saveEditor');
                    return extHostWorkspace.saveAs(uri);
                },
                saveAll: (includeUntitled) => {
                    return extHostWorkspace.saveAll(includeUntitled);
                },
                applyEdit(edit, metadata) {
                    return extHostBulkEdits.applyWorkspaceEdit(edit, extension, metadata);
                },
                createFileSystemWatcher: (pattern, ignoreCreate, ignoreChange, ignoreDelete) => {
                    return extHostFileSystemEvent.createFileSystemWatcher(extHostWorkspace, extension, pattern, ignoreCreate, ignoreChange, ignoreDelete);
                },
                get textDocuments() {
                    return extHostDocuments.getAllDocumentData().map(data => data.document);
                },
                set textDocuments(value) {
                    throw new errors.ReadonlyError('textDocuments');
                },
                openTextDocument(uriOrFileNameOrOptions) {
                    let uriPromise;
                    const options = uriOrFileNameOrOptions;
                    if (typeof uriOrFileNameOrOptions === 'string') {
                        uriPromise = Promise.resolve(uri_1.URI.file(uriOrFileNameOrOptions));
                    }
                    else if (uri_1.URI.isUri(uriOrFileNameOrOptions)) {
                        uriPromise = Promise.resolve(uriOrFileNameOrOptions);
                    }
                    else if (!options || typeof options === 'object') {
                        uriPromise = extHostDocuments.createDocumentData(options);
                    }
                    else {
                        throw new Error('illegal argument - uriOrFileNameOrOptions');
                    }
                    return uriPromise.then(uri => {
                        return extHostDocuments.ensureDocumentData(uri).then(documentData => {
                            return documentData.document;
                        });
                    });
                },
                onDidOpenTextDocument: (listener, thisArgs, disposables) => {
                    return extHostDocuments.onDidAddDocument(listener, thisArgs, disposables);
                },
                onDidCloseTextDocument: (listener, thisArgs, disposables) => {
                    return extHostDocuments.onDidRemoveDocument(listener, thisArgs, disposables);
                },
                onDidChangeTextDocument: (listener, thisArgs, disposables) => {
                    return extHostDocuments.onDidChangeDocument(listener, thisArgs, disposables);
                },
                onDidSaveTextDocument: (listener, thisArgs, disposables) => {
                    return extHostDocuments.onDidSaveDocument(listener, thisArgs, disposables);
                },
                onWillSaveTextDocument: (listener, thisArgs, disposables) => {
                    return extHostDocumentSaveParticipant.getOnWillSaveTextDocumentEvent(extension)(listener, thisArgs, disposables);
                },
                get notebookDocuments() {
                    return extHostNotebook.notebookDocuments.map(d => d.apiNotebook);
                },
                async openNotebookDocument(uriOrType, content) {
                    let uri;
                    if (uri_1.URI.isUri(uriOrType)) {
                        uri = uriOrType;
                        await extHostNotebook.openNotebookDocument(uriOrType);
                    }
                    else if (typeof uriOrType === 'string') {
                        uri = uri_1.URI.revive(await extHostNotebook.createNotebookDocument({ viewType: uriOrType, content }));
                    }
                    else {
                        throw new Error('Invalid arguments');
                    }
                    return extHostNotebook.getNotebookDocument(uri).apiNotebook;
                },
                onDidSaveNotebookDocument(listener, thisArg, disposables) {
                    return extHostNotebookDocuments.onDidSaveNotebookDocument(listener, thisArg, disposables);
                },
                onDidChangeNotebookDocument(listener, thisArg, disposables) {
                    return extHostNotebookDocuments.onDidChangeNotebookDocument(listener, thisArg, disposables);
                },
                onWillSaveNotebookDocument(listener, thisArg, disposables) {
                    return extHostNotebookDocumentSaveParticipant.getOnWillSaveNotebookDocumentEvent(extension)(listener, thisArg, disposables);
                },
                get onDidOpenNotebookDocument() {
                    return extHostNotebook.onDidOpenNotebookDocument;
                },
                get onDidCloseNotebookDocument() {
                    return extHostNotebook.onDidCloseNotebookDocument;
                },
                registerNotebookSerializer(viewType, serializer, options, registration) {
                    return extHostNotebook.registerNotebookSerializer(extension, viewType, serializer, options, (0, extensions_2.isProposedApiEnabled)(extension, 'notebookLiveShare') ? registration : undefined);
                },
                onDidChangeConfiguration: (listener, thisArgs, disposables) => {
                    return configProvider.onDidChangeConfiguration(listener, thisArgs, disposables);
                },
                getConfiguration(section, scope) {
                    scope = arguments.length === 1 ? undefined : scope;
                    return configProvider.getConfiguration(section, scope, extension);
                },
                registerTextDocumentContentProvider(scheme, provider) {
                    return extHostDocumentContentProviders.registerTextDocumentContentProvider(scheme, provider);
                },
                registerTaskProvider: (type, provider) => {
                    extHostApiDeprecation.report('window.registerTaskProvider', extension, `Use the corresponding function on the 'tasks' namespace instead`);
                    return extHostTask.registerTaskProvider(extension, type, provider);
                },
                registerFileSystemProvider(scheme, provider, options) {
                    return (0, lifecycle_1.combinedDisposable)(extHostFileSystem.registerFileSystemProvider(extension, scheme, provider, options), extHostConsumerFileSystem.addFileSystemProvider(scheme, provider, options));
                },
                get fs() {
                    return extHostConsumerFileSystem.value;
                },
                registerFileSearchProvider: (scheme, provider) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'fileSearchProvider');
                    return extHostSearch.registerFileSearchProvider(scheme, provider);
                },
                registerTextSearchProvider: (scheme, provider) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'textSearchProvider');
                    return extHostSearch.registerTextSearchProvider(scheme, provider);
                },
                registerRemoteAuthorityResolver: (authorityPrefix, resolver) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'resolvers');
                    return extensionService.registerRemoteAuthorityResolver(authorityPrefix, resolver);
                },
                registerResourceLabelFormatter: (formatter) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'resolvers');
                    return extHostLabelService.$registerResourceLabelFormatter(formatter);
                },
                getRemoteExecServer: (authority) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'resolvers');
                    return extensionService.getRemoteExecServer(authority);
                },
                onDidCreateFiles: (listener, thisArg, disposables) => {
                    return extHostFileSystemEvent.onDidCreateFile(listener, thisArg, disposables);
                },
                onDidDeleteFiles: (listener, thisArg, disposables) => {
                    return extHostFileSystemEvent.onDidDeleteFile(listener, thisArg, disposables);
                },
                onDidRenameFiles: (listener, thisArg, disposables) => {
                    return extHostFileSystemEvent.onDidRenameFile(listener, thisArg, disposables);
                },
                onWillCreateFiles: (listener, thisArg, disposables) => {
                    return extHostFileSystemEvent.getOnWillCreateFileEvent(extension)(listener, thisArg, disposables);
                },
                onWillDeleteFiles: (listener, thisArg, disposables) => {
                    return extHostFileSystemEvent.getOnWillDeleteFileEvent(extension)(listener, thisArg, disposables);
                },
                onWillRenameFiles: (listener, thisArg, disposables) => {
                    return extHostFileSystemEvent.getOnWillRenameFileEvent(extension)(listener, thisArg, disposables);
                },
                openTunnel: (forward) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'tunnels');
                    return extHostTunnelService.openTunnel(extension, forward).then(value => {
                        if (!value) {
                            throw new Error('cannot open tunnel');
                        }
                        return value;
                    });
                },
                get tunnels() {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'tunnels');
                    return extHostTunnelService.getTunnels();
                },
                onDidChangeTunnels: (listener, thisArg, disposables) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'tunnels');
                    return extHostTunnelService.onDidChangeTunnels(listener, thisArg, disposables);
                },
                registerPortAttributesProvider: (portSelector, provider) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'portsAttributes');
                    return extHostTunnelService.registerPortsAttributesProvider(portSelector, provider);
                },
                registerTunnelProvider: (tunnelProvider, information) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'tunnelFactory');
                    return extHostTunnelService.registerTunnelProvider(tunnelProvider, information);
                },
                registerTimelineProvider: (scheme, provider) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'timeline');
                    return extHostTimeline.registerTimelineProvider(scheme, provider, extension.identifier, extHostCommands.converter);
                },
                get isTrusted() {
                    return extHostWorkspace.trusted;
                },
                requestWorkspaceTrust: (options) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'workspaceTrust');
                    return extHostWorkspace.requestWorkspaceTrust(options);
                },
                onDidGrantWorkspaceTrust: (listener, thisArgs, disposables) => {
                    return extHostWorkspace.onDidGrantWorkspaceTrust(listener, thisArgs, disposables);
                },
                registerEditSessionIdentityProvider: (scheme, provider) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'editSessionIdentityProvider');
                    return extHostWorkspace.registerEditSessionIdentityProvider(scheme, provider);
                },
                onWillCreateEditSessionIdentity: (listener, thisArgs, disposables) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'editSessionIdentityProvider');
                    return extHostWorkspace.getOnWillCreateEditSessionIdentityEvent(extension)(listener, thisArgs, disposables);
                },
                registerCanonicalUriProvider: (scheme, provider) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'canonicalUriProvider');
                    return extHostWorkspace.registerCanonicalUriProvider(scheme, provider);
                },
                getCanonicalUri: (uri, options, token) => {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'canonicalUriProvider');
                    return extHostWorkspace.provideCanonicalUri(uri, options, token);
                }
            };
            // namespace: scm
            const scm = {
                get inputBox() {
                    extHostApiDeprecation.report('scm.inputBox', extension, `Use 'SourceControl.inputBox' instead`);
                    return extHostSCM.getLastInputBox(extension); // Strict null override - Deprecated api
                },
                createSourceControl(id, label, rootUri) {
                    return extHostSCM.createSourceControl(extension, id, label, rootUri);
                }
            };
            // namespace: comments
            const comments = {
                createCommentController(id, label) {
                    return extHostComment.createCommentController(extension, id, label);
                }
            };
            // namespace: debug
            const debug = {
                get activeDebugSession() {
                    return extHostDebugService.activeDebugSession;
                },
                get activeDebugConsole() {
                    return extHostDebugService.activeDebugConsole;
                },
                get breakpoints() {
                    return extHostDebugService.breakpoints;
                },
                get stackFrameFocus() {
                    return extHostDebugService.stackFrameFocus;
                },
                onDidStartDebugSession(listener, thisArg, disposables) {
                    return extHostDebugService.onDidStartDebugSession(listener, thisArg, disposables);
                },
                onDidTerminateDebugSession(listener, thisArg, disposables) {
                    return extHostDebugService.onDidTerminateDebugSession(listener, thisArg, disposables);
                },
                onDidChangeActiveDebugSession(listener, thisArg, disposables) {
                    return extHostDebugService.onDidChangeActiveDebugSession(listener, thisArg, disposables);
                },
                onDidReceiveDebugSessionCustomEvent(listener, thisArg, disposables) {
                    return extHostDebugService.onDidReceiveDebugSessionCustomEvent(listener, thisArg, disposables);
                },
                onDidChangeBreakpoints(listener, thisArgs, disposables) {
                    return extHostDebugService.onDidChangeBreakpoints(listener, thisArgs, disposables);
                },
                onDidChangeStackFrameFocus(listener, thisArg, disposables) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'debugFocus');
                    return extHostDebugService.onDidChangeStackFrameFocus(listener, thisArg, disposables);
                },
                registerDebugConfigurationProvider(debugType, provider, triggerKind) {
                    return extHostDebugService.registerDebugConfigurationProvider(debugType, provider, triggerKind || debug_1.DebugConfigurationProviderTriggerKind.Initial);
                },
                registerDebugAdapterDescriptorFactory(debugType, factory) {
                    return extHostDebugService.registerDebugAdapterDescriptorFactory(extension, debugType, factory);
                },
                registerDebugAdapterTrackerFactory(debugType, factory) {
                    return extHostDebugService.registerDebugAdapterTrackerFactory(debugType, factory);
                },
                startDebugging(folder, nameOrConfig, parentSessionOrOptions) {
                    if (!parentSessionOrOptions || (typeof parentSessionOrOptions === 'object' && 'configuration' in parentSessionOrOptions)) {
                        return extHostDebugService.startDebugging(folder, nameOrConfig, { parentSession: parentSessionOrOptions });
                    }
                    return extHostDebugService.startDebugging(folder, nameOrConfig, parentSessionOrOptions || {});
                },
                stopDebugging(session) {
                    return extHostDebugService.stopDebugging(session);
                },
                addBreakpoints(breakpoints) {
                    return extHostDebugService.addBreakpoints(breakpoints);
                },
                removeBreakpoints(breakpoints) {
                    return extHostDebugService.removeBreakpoints(breakpoints);
                },
                asDebugSourceUri(source, session) {
                    return extHostDebugService.asDebugSourceUri(source, session);
                }
            };
            const tasks = {
                registerTaskProvider: (type, provider) => {
                    return extHostTask.registerTaskProvider(extension, type, provider);
                },
                fetchTasks: (filter) => {
                    return extHostTask.fetchTasks(filter);
                },
                executeTask: (task) => {
                    return extHostTask.executeTask(extension, task);
                },
                get taskExecutions() {
                    return extHostTask.taskExecutions;
                },
                onDidStartTask: (listeners, thisArgs, disposables) => {
                    return extHostTask.onDidStartTask(listeners, thisArgs, disposables);
                },
                onDidEndTask: (listeners, thisArgs, disposables) => {
                    return extHostTask.onDidEndTask(listeners, thisArgs, disposables);
                },
                onDidStartTaskProcess: (listeners, thisArgs, disposables) => {
                    return extHostTask.onDidStartTaskProcess(listeners, thisArgs, disposables);
                },
                onDidEndTaskProcess: (listeners, thisArgs, disposables) => {
                    return extHostTask.onDidEndTaskProcess(listeners, thisArgs, disposables);
                }
            };
            // namespace: notebook
            const notebooks = {
                createNotebookController(id, notebookType, label, handler, rendererScripts) {
                    return extHostNotebookKernels.createNotebookController(extension, id, notebookType, label, handler, (0, extensions_2.isProposedApiEnabled)(extension, 'notebookMessaging') ? rendererScripts : undefined);
                },
                registerNotebookCellStatusBarItemProvider: (notebookType, provider) => {
                    return extHostNotebook.registerNotebookCellStatusBarItemProvider(extension, notebookType, provider);
                },
                createRendererMessaging(rendererId) {
                    return extHostNotebookRenderers.createRendererMessaging(extension, rendererId);
                },
                createNotebookControllerDetectionTask(notebookType) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'notebookKernelSource');
                    return extHostNotebookKernels.createNotebookControllerDetectionTask(extension, notebookType);
                },
                registerKernelSourceActionProvider(notebookType, provider) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'notebookKernelSource');
                    return extHostNotebookKernels.registerKernelSourceActionProvider(extension, notebookType, provider);
                },
                onDidChangeNotebookCellExecutionState(listener, thisArgs, disposables) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'notebookCellExecutionState');
                    return extHostNotebookKernels.onDidChangeNotebookCellExecutionState(listener, thisArgs, disposables);
                }
            };
            // namespace: l10n
            const l10n = {
                t(...params) {
                    if (typeof params[0] === 'string') {
                        const key = params.shift();
                        // We have either rest args which are Array<string | number | boolean> or an array with a single Record<string, any>.
                        // This ensures we get a Record<string | number, any> which will be formatted correctly.
                        const argsFormatted = !params || typeof params[0] !== 'object' ? params : params[0];
                        return extHostLocalization.getMessage(extension.identifier.value, { message: key, args: argsFormatted });
                    }
                    return extHostLocalization.getMessage(extension.identifier.value, params[0]);
                },
                get bundle() {
                    return extHostLocalization.getBundle(extension.identifier.value);
                },
                get uri() {
                    return extHostLocalization.getBundleUri(extension.identifier.value);
                }
            };
            // namespace: interactive
            const interactive = {
                // IMPORTANT
                // this needs to be updated whenever the API proposal changes
                _version: 1,
                registerInteractiveEditorSessionProvider(provider, metadata) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'interactive');
                    return extHostInteractiveEditor.registerProvider(extension, provider, metadata = { label: metadata?.label ?? extension.displayName ?? extension.name });
                },
                registerInteractiveSessionProvider(id, provider) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'interactive');
                    return extHostChat.registerChatProvider(extension, id, provider);
                },
                addInteractiveRequest(context) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'interactive');
                    return extHostChat.addChatRequest(context);
                },
                sendInteractiveRequestToProvider(providerId, message) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'interactive');
                    return extHostChat.sendInteractiveRequestToProvider(providerId, message);
                },
                get onDidPerformUserAction() {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'interactiveUserActions');
                    return extHostChat.onDidPerformUserAction;
                },
                transferChatSession(session, toWorkspace) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'interactive');
                    return extHostChat.transferChatSession(session, toWorkspace);
                }
            };
            // namespace: ai
            const ai = {
                getRelatedInformation(query, types) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'aiRelatedInformation');
                    return extHostAiRelatedInformation.getRelatedInformation(extension, query, types);
                },
                registerRelatedInformationProvider(type, provider) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'aiRelatedInformation');
                    return extHostAiRelatedInformation.registerRelatedInformationProvider(extension, type, provider);
                },
                registerEmbeddingVectorProvider(model, provider) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'aiRelatedInformation');
                    return extHostAiEmbeddingVector.registerEmbeddingVectorProvider(extension, model, provider);
                }
            };
            // namespace: llm
            const chat = {
                registerChatResponseProvider(id, provider, metadata) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'chatProvider');
                    return extHostChatProvider.registerProvider(extension.identifier, id, provider, metadata);
                },
                registerSlashCommand(name, command, metadata) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'chatSlashCommands');
                    return extHostChatSlashCommands.registerCommand(extension.identifier, name, command, metadata ?? { description: '' });
                },
                requestChatAccess(id) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'chatRequestAccess');
                    return extHostChatProvider.requestChatResponseProvider(extension.identifier, id);
                },
                registerVariable(name, description, resolver) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'chatVariables');
                    return extHostChatVariables.registerVariableResolver(extension, name, description, resolver);
                },
                registerMappedEditsProvider(selector, provider) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'mappedEditsProvider');
                    return extHostLanguageFeatures.registerMappedEditsProvider(extension, selector, provider);
                },
                registerAgent(name, agent, metadata) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'chatAgents');
                    return extHostChatAgents.registerAgent(extension.identifier, name, agent, metadata);
                }
            };
            return {
                version: initData.version,
                // namespaces
                ai,
                authentication,
                commands,
                comments,
                chat,
                debug,
                env,
                extensions,
                interactive,
                l10n,
                languages,
                notebooks,
                scm,
                tasks,
                tests,
                window,
                workspace,
                // types
                Breakpoint: extHostTypes.Breakpoint,
                TerminalOutputAnchor: extHostTypes.TerminalOutputAnchor,
                ChatMessage: extHostTypes.ChatMessage,
                ChatMessageRole: extHostTypes.ChatMessageRole,
                ChatVariableLevel: extHostTypes.ChatVariableLevel,
                CallHierarchyIncomingCall: extHostTypes.CallHierarchyIncomingCall,
                CallHierarchyItem: extHostTypes.CallHierarchyItem,
                CallHierarchyOutgoingCall: extHostTypes.CallHierarchyOutgoingCall,
                CancellationError: errors.CancellationError,
                CancellationTokenSource: cancellation_1.CancellationTokenSource,
                CandidatePortSource: extHost_protocol_1.CandidatePortSource,
                CodeAction: extHostTypes.CodeAction,
                CodeActionKind: extHostTypes.CodeActionKind,
                CodeActionTriggerKind: extHostTypes.CodeActionTriggerKind,
                CodeLens: extHostTypes.CodeLens,
                Color: extHostTypes.Color,
                ColorInformation: extHostTypes.ColorInformation,
                ColorPresentation: extHostTypes.ColorPresentation,
                ColorThemeKind: extHostTypes.ColorThemeKind,
                CommentMode: extHostTypes.CommentMode,
                CommentState: extHostTypes.CommentState,
                CommentThreadCollapsibleState: extHostTypes.CommentThreadCollapsibleState,
                CommentThreadState: extHostTypes.CommentThreadState,
                CompletionItem: extHostTypes.CompletionItem,
                CompletionItemKind: extHostTypes.CompletionItemKind,
                CompletionItemTag: extHostTypes.CompletionItemTag,
                CompletionList: extHostTypes.CompletionList,
                CompletionTriggerKind: extHostTypes.CompletionTriggerKind,
                ConfigurationTarget: extHostTypes.ConfigurationTarget,
                CustomExecution: extHostTypes.CustomExecution,
                DebugAdapterExecutable: extHostTypes.DebugAdapterExecutable,
                DebugAdapterInlineImplementation: extHostTypes.DebugAdapterInlineImplementation,
                DebugAdapterNamedPipeServer: extHostTypes.DebugAdapterNamedPipeServer,
                DebugAdapterServer: extHostTypes.DebugAdapterServer,
                DebugConfigurationProviderTriggerKind: debug_1.DebugConfigurationProviderTriggerKind,
                DebugConsoleMode: extHostTypes.DebugConsoleMode,
                DecorationRangeBehavior: extHostTypes.DecorationRangeBehavior,
                Diagnostic: extHostTypes.Diagnostic,
                DiagnosticRelatedInformation: extHostTypes.DiagnosticRelatedInformation,
                DiagnosticSeverity: extHostTypes.DiagnosticSeverity,
                DiagnosticTag: extHostTypes.DiagnosticTag,
                Disposable: extHostTypes.Disposable,
                DocumentHighlight: extHostTypes.DocumentHighlight,
                DocumentHighlightKind: extHostTypes.DocumentHighlightKind,
                DocumentLink: extHostTypes.DocumentLink,
                DocumentSymbol: extHostTypes.DocumentSymbol,
                EndOfLine: extHostTypes.EndOfLine,
                EnvironmentVariableMutatorType: extHostTypes.EnvironmentVariableMutatorType,
                EvaluatableExpression: extHostTypes.EvaluatableExpression,
                InlineValueText: extHostTypes.InlineValueText,
                InlineValueVariableLookup: extHostTypes.InlineValueVariableLookup,
                InlineValueEvaluatableExpression: extHostTypes.InlineValueEvaluatableExpression,
                InlineCompletionTriggerKind: extHostTypes.InlineCompletionTriggerKind,
                EventEmitter: event_1.Emitter,
                ExtensionKind: extHostTypes.ExtensionKind,
                ExtensionMode: extHostTypes.ExtensionMode,
                ExternalUriOpenerPriority: extHostTypes.ExternalUriOpenerPriority,
                FileChangeType: extHostTypes.FileChangeType,
                FileDecoration: extHostTypes.FileDecoration,
                FileDecoration2: extHostTypes.FileDecoration,
                FileSystemError: extHostTypes.FileSystemError,
                FileType: files.FileType,
                FilePermission: files.FilePermission,
                FoldingRange: extHostTypes.FoldingRange,
                FoldingRangeKind: extHostTypes.FoldingRangeKind,
                FunctionBreakpoint: extHostTypes.FunctionBreakpoint,
                InlineCompletionItem: extHostTypes.InlineSuggestion,
                InlineCompletionList: extHostTypes.InlineSuggestionList,
                Hover: extHostTypes.Hover,
                IndentAction: languageConfiguration.IndentAction,
                Location: extHostTypes.Location,
                MarkdownString: extHostTypes.MarkdownString,
                OverviewRulerLane: model_1.OverviewRulerLane,
                ParameterInformation: extHostTypes.ParameterInformation,
                PortAutoForwardAction: extHostTypes.PortAutoForwardAction,
                Position: extHostTypes.Position,
                ProcessExecution: extHostTypes.ProcessExecution,
                ProgressLocation: extHostTypes.ProgressLocation,
                QuickInputButtons: extHostTypes.QuickInputButtons,
                Range: extHostTypes.Range,
                RelativePattern: extHostTypes.RelativePattern,
                Selection: extHostTypes.Selection,
                SelectionRange: extHostTypes.SelectionRange,
                SemanticTokens: extHostTypes.SemanticTokens,
                SemanticTokensBuilder: extHostTypes.SemanticTokensBuilder,
                SemanticTokensEdit: extHostTypes.SemanticTokensEdit,
                SemanticTokensEdits: extHostTypes.SemanticTokensEdits,
                SemanticTokensLegend: extHostTypes.SemanticTokensLegend,
                ShellExecution: extHostTypes.ShellExecution,
                ShellQuoting: extHostTypes.ShellQuoting,
                SignatureHelp: extHostTypes.SignatureHelp,
                SignatureHelpTriggerKind: extHostTypes.SignatureHelpTriggerKind,
                SignatureInformation: extHostTypes.SignatureInformation,
                SnippetString: extHostTypes.SnippetString,
                SourceBreakpoint: extHostTypes.SourceBreakpoint,
                StandardTokenType: extHostTypes.StandardTokenType,
                StatusBarAlignment: extHostTypes.StatusBarAlignment,
                SymbolInformation: extHostTypes.SymbolInformation,
                SymbolKind: extHostTypes.SymbolKind,
                SymbolTag: extHostTypes.SymbolTag,
                Task: extHostTypes.Task,
                TaskGroup: extHostTypes.TaskGroup,
                TaskPanelKind: extHostTypes.TaskPanelKind,
                TaskRevealKind: extHostTypes.TaskRevealKind,
                TaskScope: extHostTypes.TaskScope,
                TerminalLink: extHostTypes.TerminalLink,
                TerminalQuickFixExecuteTerminalCommand: extHostTypes.TerminalQuickFixCommand,
                TerminalQuickFixOpener: extHostTypes.TerminalQuickFixOpener,
                TerminalLocation: extHostTypes.TerminalLocation,
                TerminalProfile: extHostTypes.TerminalProfile,
                TerminalExitReason: extHostTypes.TerminalExitReason,
                TextDocumentSaveReason: extHostTypes.TextDocumentSaveReason,
                TextEdit: extHostTypes.TextEdit,
                SnippetTextEdit: extHostTypes.SnippetTextEdit,
                TextEditorCursorStyle: editorOptions_1.TextEditorCursorStyle,
                TextEditorLineNumbersStyle: extHostTypes.TextEditorLineNumbersStyle,
                TextEditorRevealType: extHostTypes.TextEditorRevealType,
                TextEditorSelectionChangeKind: extHostTypes.TextEditorSelectionChangeKind,
                SyntaxTokenType: extHostTypes.SyntaxTokenType,
                TextDocumentChangeReason: extHostTypes.TextDocumentChangeReason,
                ThemeColor: extHostTypes.ThemeColor,
                ThemeIcon: extHostTypes.ThemeIcon,
                TreeItem: extHostTypes.TreeItem,
                TreeItemCheckboxState: extHostTypes.TreeItemCheckboxState,
                TreeItemCollapsibleState: extHostTypes.TreeItemCollapsibleState,
                TypeHierarchyItem: extHostTypes.TypeHierarchyItem,
                UIKind: extensionHostProtocol_1.UIKind,
                Uri: uri_1.URI,
                ViewColumn: extHostTypes.ViewColumn,
                WorkspaceEdit: extHostTypes.WorkspaceEdit,
                // proposed api types
                DocumentDropEdit: extHostTypes.DocumentDropEdit,
                DocumentPasteEdit: extHostTypes.DocumentPasteEdit,
                InlayHint: extHostTypes.InlayHint,
                InlayHintLabelPart: extHostTypes.InlayHintLabelPart,
                InlayHintKind: extHostTypes.InlayHintKind,
                RemoteAuthorityResolverError: extHostTypes.RemoteAuthorityResolverError,
                ResolvedAuthority: extHostTypes.ResolvedAuthority,
                ManagedResolvedAuthority: extHostTypes.ManagedResolvedAuthority,
                SourceControlInputBoxValidationType: extHostTypes.SourceControlInputBoxValidationType,
                ExtensionRuntime: extHostTypes.ExtensionRuntime,
                TimelineItem: extHostTypes.TimelineItem,
                NotebookRange: extHostTypes.NotebookRange,
                NotebookCellKind: extHostTypes.NotebookCellKind,
                NotebookCellExecutionState: extHostTypes.NotebookCellExecutionState,
                NotebookCellData: extHostTypes.NotebookCellData,
                NotebookData: extHostTypes.NotebookData,
                NotebookRendererScript: extHostTypes.NotebookRendererScript,
                NotebookCellStatusBarAlignment: extHostTypes.NotebookCellStatusBarAlignment,
                NotebookEditorRevealType: extHostTypes.NotebookEditorRevealType,
                NotebookCellOutput: extHostTypes.NotebookCellOutput,
                NotebookCellOutputItem: extHostTypes.NotebookCellOutputItem,
                NotebookCellStatusBarItem: extHostTypes.NotebookCellStatusBarItem,
                NotebookControllerAffinity: extHostTypes.NotebookControllerAffinity,
                NotebookControllerAffinity2: extHostTypes.NotebookControllerAffinity2,
                NotebookEdit: extHostTypes.NotebookEdit,
                NotebookKernelSourceAction: extHostTypes.NotebookKernelSourceAction,
                PortAttributes: extHostTypes.PortAttributes,
                LinkedEditingRanges: extHostTypes.LinkedEditingRanges,
                TestResultState: extHostTypes.TestResultState,
                TestRunRequest: extHostTypes.TestRunRequest,
                TestMessage: extHostTypes.TestMessage,
                TestMessage2: extHostTypes.TestMessage,
                TestTag: extHostTypes.TestTag,
                TestRunProfileKind: extHostTypes.TestRunProfileKind,
                TextSearchCompleteMessageType: searchExtTypes_1.TextSearchCompleteMessageType,
                DataTransfer: extHostTypes.DataTransfer,
                DataTransferItem: extHostTypes.DataTransferItem,
                CoveredCount: extHostTypes.CoveredCount,
                FileCoverage: extHostTypes.FileCoverage,
                StatementCoverage: extHostTypes.StatementCoverage,
                BranchCoverage: extHostTypes.BranchCoverage,
                FunctionCoverage: extHostTypes.FunctionCoverage,
                WorkspaceTrustState: extHostTypes.WorkspaceTrustState,
                LanguageStatusSeverity: extHostTypes.LanguageStatusSeverity,
                QuickPickItemKind: extHostTypes.QuickPickItemKind,
                InputBoxValidationSeverity: extHostTypes.InputBoxValidationSeverity,
                TabInputText: extHostTypes.TextTabInput,
                TabInputTextDiff: extHostTypes.TextDiffTabInput,
                TabInputTextMerge: extHostTypes.TextMergeTabInput,
                TabInputCustom: extHostTypes.CustomEditorTabInput,
                TabInputNotebook: extHostTypes.NotebookEditorTabInput,
                TabInputNotebookDiff: extHostTypes.NotebookDiffEditorTabInput,
                TabInputWebview: extHostTypes.WebviewEditorTabInput,
                TabInputTerminal: extHostTypes.TerminalEditorTabInput,
                TabInputInteractiveWindow: extHostTypes.InteractiveWindowInput,
                TelemetryTrustedValue: telemetryUtils_1.TelemetryTrustedValue,
                LogLevel: log_1.LogLevel,
                EditSessionIdentityMatch: editSessions_1.EditSessionIdentityMatch,
                InteractiveSessionVoteDirection: extHostTypes.InteractiveSessionVoteDirection,
                InteractiveSessionCopyKind: extHostTypes.InteractiveSessionCopyKind,
                InteractiveEditorResponseFeedbackKind: extHostTypes.InteractiveEditorResponseFeedbackKind,
                StackFrameFocus: extHostTypes.StackFrameFocus,
                ThreadFocus: extHostTypes.ThreadFocus,
                RelatedInformationType: extHostTypes.RelatedInformationType
            };
        };
    }
    exports.createApiFactoryAndRegisterActors = createApiFactoryAndRegisterActors;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdC5hcGkuaW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3QuYXBpLmltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0hoRzs7T0FFRztJQUNILFNBQWdCLGlDQUFpQyxDQUFDLFFBQTBCO1FBRTNFLFdBQVc7UUFDWCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGdEQUF1QixDQUFDLENBQUM7UUFDdkQsTUFBTSxxQkFBcUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhDQUFzQixDQUFDLENBQUM7UUFDbkUsTUFBTSx5QkFBeUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHNEQUEwQixDQUFDLENBQUM7UUFDM0UsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGtEQUF3QixDQUFDLENBQUM7UUFDaEUsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUFpQixDQUFDLENBQUM7UUFDekQsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUFpQixDQUFDLENBQUM7UUFDekQsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDRDQUFxQixDQUFDLENBQUM7UUFDakUsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxREFBc0IsQ0FBQyxDQUFDO1FBQzVELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsc0NBQWtCLENBQUMsQ0FBQztRQUNyRCxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGdDQUFlLENBQUMsQ0FBQztRQUNyRCxNQUFNLHFCQUFxQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsNENBQXNCLENBQUMsQ0FBQztRQUNuRSxNQUFN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