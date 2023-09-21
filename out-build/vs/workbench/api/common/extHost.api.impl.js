/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/severity", "vs/base/common/uri", "vs/editor/common/config/editorOptions", "vs/editor/common/model", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languageSelector", "vs/platform/files/common/files", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extensionHostProtocol", "vs/workbench/api/common/extHostApiCommands", "vs/workbench/api/common/extHostClipboard", "vs/workbench/api/common/extHostCommands", "vs/workbench/api/common/extHostComments", "vs/workbench/api/common/extHostConfiguration", "vs/workbench/api/common/extHostDiagnostics", "vs/workbench/api/common/extHostDialogs", "vs/workbench/api/common/extHostDocumentContentProviders", "vs/workbench/api/common/extHostDocumentSaveParticipant", "vs/workbench/api/common/extHostDocuments", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostFileSystem", "vs/workbench/api/common/extHostFileSystemEventService", "vs/workbench/api/common/extHostLanguageFeatures", "vs/workbench/api/common/extHostLanguages", "vs/workbench/api/common/extHostMessageService", "vs/workbench/api/common/extHostOutput", "vs/workbench/api/common/extHostProgress", "vs/workbench/api/common/extHostQuickOpen", "vs/workbench/api/common/extHostSCM", "vs/workbench/api/common/extHostStatusBar", "vs/workbench/api/common/extHostStorage", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostTextEditors", "vs/workbench/api/common/extHostTreeViews", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/api/common/extHostUrls", "vs/workbench/api/common/extHostWebview", "vs/workbench/api/common/extHostWindow", "vs/workbench/api/common/extHostWorkspace", "vs/platform/extensions/common/extensions", "vs/workbench/api/common/extHostCodeInsets", "vs/workbench/api/common/extHostLabelService", "vs/platform/remote/common/remoteHosts", "vs/workbench/api/common/extHostDecorations", "vs/workbench/api/common/extHostTask", "vs/workbench/api/common/extHostDebugService", "vs/workbench/api/common/extHostSearch", "vs/platform/log/common/log", "vs/workbench/api/common/extHostUriTransformerService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostNotebook", "vs/workbench/api/common/extHostTheming", "vs/workbench/api/common/extHostTunnelService", "vs/workbench/api/common/extHostApiDeprecationService", "vs/workbench/api/common/extHostAuthentication", "vs/workbench/api/common/extHostTimeline", "vs/workbench/api/common/extHostStoragePaths", "vs/workbench/api/common/extHostFileSystemConsumer", "vs/workbench/api/common/extHostWebviewView", "vs/workbench/api/common/extHostCustomEditors", "vs/workbench/api/common/extHostWebviewPanels", "vs/workbench/api/common/extHostBulkEdits", "vs/workbench/api/common/extHostFileSystemInfo", "vs/workbench/api/common/extHostTesting", "vs/workbench/api/common/extHostUriOpener", "vs/workbench/api/common/extHostSecretState", "vs/workbench/api/common/extHostEditorTabs", "vs/workbench/api/common/extHostTelemetry", "vs/workbench/api/common/extHostNotebookKernels", "vs/workbench/services/search/common/searchExtTypes", "vs/workbench/api/common/extHostNotebookRenderers", "vs/base/common/network", "vs/platform/opener/common/opener", "vs/workbench/api/common/extHostNotebookEditors", "vs/workbench/api/common/extHostNotebookDocuments", "vs/workbench/api/common/extHostInteractive", "vs/base/common/lifecycle", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/debug/common/debug", "vs/workbench/api/common/extHostLocalizationService", "vs/platform/workspace/common/editSessions", "vs/workbench/api/common/extHostProfileContentHandler", "vs/workbench/api/common/extHostQuickDiff", "vs/workbench/api/common/extHostChat", "vs/workbench/api/common/extHostInlineChat", "vs/workbench/api/common/extHostNotebookDocumentSaveParticipant", "vs/workbench/api/common/extHostIssueReporter", "vs/workbench/api/common/extHostManagedSockets", "vs/workbench/api/common/extHostShare", "vs/workbench/api/common/extHostChatProvider", "vs/workbench/api/common/extHostChatSlashCommand", "vs/workbench/api/common/extHostChatVariables", "vs/workbench/api/common/extHostAiRelatedInformation", "vs/workbench/api/common/extHostEmbeddingVector", "vs/workbench/api/common/extHostChatAgents"], function (require, exports, cancellation_1, errors, event_1, severity_1, uri_1, editorOptions_1, model_1, languageConfiguration, languageSelector_1, files, extHost_protocol_1, extensionHostProtocol_1, extHostApiCommands_1, extHostClipboard_1, extHostCommands_1, extHostComments_1, extHostConfiguration_1, extHostDiagnostics_1, extHostDialogs_1, extHostDocumentContentProviders_1, extHostDocumentSaveParticipant_1, extHostDocuments_1, extHostDocumentsAndEditors_1, extHostExtensionService_1, extHostFileSystem_1, extHostFileSystemEventService_1, extHostLanguageFeatures_1, extHostLanguages_1, extHostMessageService_1, extHostOutput_1, extHostProgress_1, extHostQuickOpen_1, extHostSCM_1, extHostStatusBar_1, extHostStorage_1, extHostTerminalService_1, extHostTextEditors_1, extHostTreeViews_1, typeConverters, extHostTypes, telemetryUtils_1, extHostUrls_1, extHostWebview_1, extHostWindow_1, extHostWorkspace_1, extensions_1, extHostCodeInsets_1, extHostLabelService_1, remoteHosts_1, extHostDecorations_1, extHostTask_1, extHostDebugService_1, extHostSearch_1, log_1, extHostUriTransformerService_1, extHostRpcService_1, extHostInitDataService_1, extHostNotebook_1, extHostTheming_1, extHostTunnelService_1, extHostApiDeprecationService_1, extHostAuthentication_1, extHostTimeline_1, extHostStoragePaths_1, extHostFileSystemConsumer_1, extHostWebviewView_1, extHostCustomEditors_1, extHostWebviewPanels_1, extHostBulkEdits_1, extHostFileSystemInfo_1, extHostTesting_1, extHostUriOpener_1, extHostSecretState_1, extHostEditorTabs_1, extHostTelemetry_1, extHostNotebookKernels_1, searchExtTypes_1, extHostNotebookRenderers_1, network_1, opener_1, extHostNotebookEditors_1, extHostNotebookDocuments_1, extHostInteractive_1, lifecycle_1, extensions_2, debug_1, extHostLocalizationService_1, editSessions_1, extHostProfileContentHandler_1, extHostQuickDiff_1, extHostChat_1, extHostInlineChat_1, extHostNotebookDocumentSaveParticipant_1, extHostIssueReporter_1, extHostManagedSockets_1, extHostShare_1, extHostChatProvider_1, extHostChatSlashCommand_1, extHostChatVariables_1, extHostAiRelatedInformation_1, extHostEmbeddingVector_1, extHostChatAgents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$adc = void 0;
    /**
     * This method instantiates and returns the extension API surface
     */
    function $adc(accessor) {
        // services
        const initData = accessor.get(extHostInitDataService_1.$fM);
        const extHostFileSystemInfo = accessor.get(extHostFileSystemInfo_1.$9ac);
        const extHostConsumerFileSystem = accessor.get(extHostFileSystemConsumer_1.$Bbc);
        const extensionService = accessor.get(extHostExtensionService_1.$Rbc);
        const extHostWorkspace = accessor.get(extHostWorkspace_1.$jbc);
        const extHostTelemetry = accessor.get(extHostTelemetry_1.$jM);
        const extHostConfiguration = accessor.get(extHostConfiguration_1.$mbc);
        const uriTransformer = accessor.get(extHostUriTransformerService_1.$gbc);
        const rpcProtocol = accessor.get(extHostRpcService_1.$2L);
        const extHostStorage = accessor.get(extHostStorage_1.$xbc);
        const extensionStoragePaths = accessor.get(extHostStoragePaths_1.$Cbc);
        const extHostLoggerService = accessor.get(log_1.$6i);
        const extHostLogService = accessor.get(log_1.$5i);
        const extHostTunnelService = accessor.get(extHostTunnelService_1.$rsb);
        const extHostApiDeprecation = accessor.get(extHostApiDeprecationService_1.$_ac);
        const extHostWindow = accessor.get(extHostWindow_1.$dcc);
        const extHostSecretState = accessor.get(extHostSecretState_1.$Jbc);
        const extHostEditorTabs = accessor.get(extHostEditorTabs_1.$lcc);
        const extHostManagedSockets = accessor.get(extHostManagedSockets_1.$Nbc);
        // register addressable instances
        rpcProtocol.set(extHost_protocol_1.$2J.ExtHostFileSystemInfo, extHostFileSystemInfo);
        rpcProtocol.set(extHost_protocol_1.$2J.ExtHostLogLevelServiceShape, extHostLoggerService);
        rpcProtocol.set(extHost_protocol_1.$2J.ExtHostWorkspace, extHostWorkspace);
        rpcProtocol.set(extHost_protocol_1.$2J.ExtHostConfiguration, extHostConfiguration);
        rpcProtocol.set(extHost_protocol_1.$2J.ExtHostExtensionService, extensionService);
        rpcProtocol.set(extHost_protocol_1.$2J.ExtHostStorage, extHostStorage);
        rpcProtocol.set(extHost_protocol_1.$2J.ExtHostTunnelService, extHostTunnelService);
        rpcProtocol.set(extHost_protocol_1.$2J.ExtHostWindow, extHostWindow);
        rpcProtocol.set(extHost_protocol_1.$2J.ExtHostSecretState, extHostSecretState);
        rpcProtocol.set(extHost_protocol_1.$2J.ExtHostTelemetry, extHostTelemetry);
        rpcProtocol.set(extHost_protocol_1.$2J.ExtHostEditorTabs, extHostEditorTabs);
        rpcProtocol.set(extHost_protocol_1.$2J.ExtHostManagedSockets, extHostManagedSockets);
        // automatically create and register addressable instances
        const extHostDecorations = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostDecorations, accessor.get(extHostDecorations_1.$hcc));
        const extHostDocumentsAndEditors = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostDocumentsAndEditors, accessor.get(extHostDocumentsAndEditors_1.$aM));
        const extHostCommands = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostCommands, accessor.get(extHostCommands_1.$lM));
        const extHostTerminalService = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostTerminalService, accessor.get(extHostTerminalService_1.$Ebc));
        const extHostDebugService = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostDebugService, accessor.get(extHostDebugService_1.$pcc));
        const extHostSearch = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostSearch, accessor.get(extHostSearch_1.$zcc));
        const extHostTask = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostTask, accessor.get(extHostTask_1.$kcc));
        const extHostOutputService = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostOutputService, accessor.get(extHostOutput_1.$Zbc));
        const extHostLocalization = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostLocalization, accessor.get(extHostLocalizationService_1.$Mbc));
        // manually create and register addressable instances
        const extHostUrls = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostUrls, new extHostUrls_1.$9bc(rpcProtocol));
        const extHostDocuments = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostDocuments, new extHostDocuments_1.$7ac(rpcProtocol, extHostDocumentsAndEditors));
        const extHostDocumentContentProviders = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostDocumentContentProviders, new extHostDocumentContentProviders_1.$obc(rpcProtocol, extHostDocumentsAndEditors, extHostLogService));
        const extHostDocumentSaveParticipant = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostDocumentSaveParticipant, new extHostDocumentSaveParticipant_1.$pbc(extHostLogService, extHostDocuments, rpcProtocol.getProxy(extHost_protocol_1.$1J.MainThreadBulkEdits)));
        const extHostNotebook = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostNotebook, new extHostNotebook_1.$Fcc(rpcProtocol, extHostCommands, extHostDocumentsAndEditors, extHostDocuments, extHostConsumerFileSystem));
        const extHostNotebookDocuments = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostNotebookDocuments, new extHostNotebookDocuments_1.$Xcc(extHostNotebook));
        const extHostNotebookEditors = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostNotebookEditors, new extHostNotebookEditors_1.$Wcc(extHostLogService, extHostNotebook));
        const extHostNotebookKernels = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostNotebookKernels, new extHostNotebookKernels_1.$Tcc(rpcProtocol, initData, extHostNotebook, extHostCommands, extHostLogService));
        const extHostNotebookRenderers = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostNotebookRenderers, new extHostNotebookRenderers_1.$Vcc(rpcProtocol, extHostNotebook));
        const extHostNotebookDocumentSaveParticipant = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostNotebookDocumentSaveParticipant, new extHostNotebookDocumentSaveParticipant_1.$4cc(extHostLogService, extHostNotebook, rpcProtocol.getProxy(extHost_protocol_1.$1J.MainThreadBulkEdits)));
        const extHostEditors = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostEditors, new extHostTextEditors_1.$7bc(rpcProtocol, extHostDocumentsAndEditors));
        const extHostTreeViews = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostTreeViews, new extHostTreeViews_1.$8bc(rpcProtocol.getProxy(extHost_protocol_1.$1J.MainThreadTreeViews), extHostCommands, extHostLogService));
        const extHostEditorInsets = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostEditorInsets, new extHostCodeInsets_1.$ecc(rpcProtocol.getProxy(extHost_protocol_1.$1J.MainThreadEditorInsets), extHostEditors, initData.remote));
        const extHostDiagnostics = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostDiagnostics, new extHostDiagnostics_1.$$ac(rpcProtocol, extHostLogService, extHostFileSystemInfo, extHostDocumentsAndEditors));
        const extHostLanguages = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostLanguages, new extHostLanguages_1.$Wbc(rpcProtocol, extHostDocuments, extHostCommands.converter, uriTransformer));
        const extHostLanguageFeatures = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostLanguageFeatures, new extHostLanguageFeatures_1.$cbc(rpcProtocol, uriTransformer, extHostDocuments, extHostCommands, extHostDiagnostics, extHostLogService, extHostApiDeprecation, extHostTelemetry));
        const extHostFileSystem = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostFileSystem, new extHostFileSystem_1.$Ubc(rpcProtocol, extHostLanguageFeatures));
        const extHostFileSystemEvent = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostFileSystemEventService, new extHostFileSystemEventService_1.$Vbc(rpcProtocol, extHostLogService, extHostDocumentsAndEditors));
        const extHostQuickOpen = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostQuickOpen, (0, extHostQuickOpen_1.$2bc)(rpcProtocol, extHostWorkspace, extHostCommands));
        const extHostSCM = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostSCM, new extHostSCM_1.$4bc(rpcProtocol, extHostCommands, extHostDocuments, extHostLogService));
        const extHostQuickDiff = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostQuickDiff, new extHostQuickDiff_1.$1cc(rpcProtocol, uriTransformer));
        const extHostShare = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostShare, new extHostShare_1.$6cc(rpcProtocol, uriTransformer));
        const extHostComment = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostComments, (0, extHostComments_1.$fbc)(rpcProtocol, extHostCommands, extHostDocuments));
        const extHostProgress = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostProgress, new extHostProgress_1.$1bc(rpcProtocol.getProxy(extHost_protocol_1.$1J.MainThreadProgress)));
        const extHostLabelService = rpcProtocol.set(extHost_protocol_1.$2J.ExtHosLabelService, new extHostLabelService_1.$fcc(rpcProtocol));
        const extHostTheming = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostTheming, new extHostTheming_1.$Gcc(rpcProtocol));
        const extHostAuthentication = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostAuthentication, new extHostAuthentication_1.$Hcc(rpcProtocol));
        const extHostTimeline = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostTimeline, new extHostTimeline_1.$Jcc(rpcProtocol, extHostCommands));
        const extHostWebviews = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostWebviews, new extHostWebview_1.$_bc(rpcProtocol, initData.remote, extHostWorkspace, extHostLogService, extHostApiDeprecation));
        const extHostWebviewPanels = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostWebviewPanels, new extHostWebviewPanels_1.$Lcc(rpcProtocol, extHostWebviews, extHostWorkspace));
        const extHostCustomEditors = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostCustomEditors, new extHostCustomEditors_1.$Mcc(rpcProtocol, extHostDocuments, extensionStoragePaths, extHostWebviews, extHostWebviewPanels));
        const extHostWebviewViews = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostWebviewViews, new extHostWebviewView_1.$Kcc(rpcProtocol, extHostWebviews));
        const extHostTesting = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostTesting, new extHostTesting_1.$Occ(rpcProtocol, extHostCommands, extHostDocumentsAndEditors));
        const extHostUriOpeners = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostUriOpeners, new extHostUriOpener_1.$Scc(rpcProtocol));
        const extHostProfileContentHandlers = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostProfileContentHandlers, new extHostProfileContentHandler_1.$Zcc(rpcProtocol));
        rpcProtocol.set(extHost_protocol_1.$2J.ExtHostInteractive, new extHostInteractive_1.$Ycc(rpcProtocol, extHostNotebook, extHostDocumentsAndEditors, extHostCommands, extHostLogService));
        const extHostInteractiveEditor = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostInlineChat, new extHostInlineChat_1.$3cc(rpcProtocol, extHostCommands, extHostDocuments, extHostLogService));
        const extHostChatProvider = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostChatProvider, new extHostChatProvider_1.$7cc(rpcProtocol, extHostLogService));
        const extHostChatSlashCommands = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostChatSlashCommands, new extHostChatSlashCommand_1.$8cc(rpcProtocol, extHostChatProvider, extHostLogService));
        const extHostChatAgents = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostChatAgents, new extHostChatAgents_1.$_cc(rpcProtocol, extHostChatProvider, extHostLogService));
        const extHostChatVariables = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostChatVariables, new extHostChatVariables_1.$9cc(rpcProtocol));
        const extHostChat = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostChat, new extHostChat_1.$2cc(rpcProtocol, extHostLogService));
        const extHostAiRelatedInformation = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostAiRelatedInformation, new extHostAiRelatedInformation_1.$0cc(rpcProtocol));
        const extHostAiEmbeddingVector = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostAiEmbeddingVector, new extHostEmbeddingVector_1.$$cc(rpcProtocol));
        const extHostIssueReporter = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostIssueReporter, new extHostIssueReporter_1.$5cc(rpcProtocol));
        const extHostStatusBar = rpcProtocol.set(extHost_protocol_1.$2J.ExtHostStatusBar, new extHostStatusBar_1.$6bc(rpcProtocol, extHostCommands.converter));
        // Check that no named customers are missing
        const expected = Object.values(extHost_protocol_1.$2J);
        rpcProtocol.assertRegistered(expected);
        // Other instances
        const extHostBulkEdits = new extHostBulkEdits_1.$Ncc(rpcProtocol, extHostDocumentsAndEditors);
        const extHostClipboard = new extHostClipboard_1.$ebc(rpcProtocol);
        const extHostMessageService = new extHostMessageService_1.$Xbc(rpcProtocol, extHostLogService);
        const extHostDialogs = new extHostDialogs_1.$nbc(rpcProtocol);
        // Register API-ish commands
        extHostApiCommands_1.$dbc.register(extHostCommands);
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
                            (0, extensions_2.$QF)(extension, 'documentFiltersExclusive');
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
                    (0, extensions_2.$QF)(extension, 'authGetSessions');
                    return extHostAuthentication.getSessions(extension, providerId, scopes);
                },
                // TODO: remove this after GHPR and Codespaces move off of it
                async hasSession(providerId, scopes) {
                    (0, extensions_2.$QF)(extension, 'authSession');
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
                    (0, extensions_2.$QF)(extension, 'diffCommand');
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
                    (0, extensions_2.$QF)(extension, 'telemetry');
                    return extHostTelemetry.getTelemetryDetails();
                },
                get onDidChangeTelemetryConfiguration() {
                    (0, extensions_2.$QF)(extension, 'telemetry');
                    return extHostTelemetry.onDidChangeTelemetryConfiguration;
                },
                get isNewAppInstall() {
                    return (0, extHostTelemetry_1.$iM)(initData.telemetryInfo.firstSessionDate);
                },
                createTelemetryLogger(sender, options) {
                    extHostTelemetry_1.$hM.validateSender(sender);
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
                        if ((0, opener_1.$OT)(uri, network_1.Schemas.http) || (0, opener_1.$OT)(uri, network_1.Schemas.https)) {
                            return uri;
                        }
                        throw err;
                    }
                },
                get remoteName() {
                    return (0, remoteHosts_1.$Pk)(initData.remote.authority);
                },
                get remoteAuthority() {
                    (0, extensions_2.$QF)(extension, 'resolvers');
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
                    (0, extensions_2.$QF)(extension, 'handleIssueUri');
                    return extHostIssueReporter.registerIssueUriRequestHandler(extension, handler);
                },
                get appQuality() {
                    (0, extensions_2.$QF)(extension, 'resolvers');
                    return initData.quality;
                },
                get appCommit() {
                    (0, extensions_2.$QF)(extension, 'resolvers');
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
                    (0, extensions_2.$QF)(extension, 'testObserver');
                    return extHostTesting.createTestObserver();
                },
                runTests(provider) {
                    (0, extensions_2.$QF)(extension, 'testObserver');
                    return extHostTesting.runTests(provider);
                },
                get onDidChangeTestResults() {
                    (0, extensions_2.$QF)(extension, 'testObserver');
                    return extHostTesting.onResultsChanged;
                },
                get testResults() {
                    (0, extensions_2.$QF)(extension, 'testObserver');
                    return extHostTesting.results;
                },
            };
            // namespace: extensions
            const extensionKind = initData.remote.isRemote
                ? extHostTypes.ExtensionKind.Workspace
                : extHostTypes.ExtensionKind.UI;
            const extensions = {
                getExtension(extensionId, includeFromDifferentExtensionHosts) {
                    if (!(0, extensions_2.$PF)(extension, 'extensionsAny')) {
                        includeFromDifferentExtensionHosts = false;
                    }
                    const mine = extensionInfo.mine.getExtensionDescription(extensionId);
                    if (mine) {
                        return new extHostExtensionService_1.$Sbc(extensionService, extension.identifier, mine, extensionKind, false);
                    }
                    if (includeFromDifferentExtensionHosts) {
                        const foreign = extensionInfo.all.getExtensionDescription(extensionId);
                        if (foreign) {
                            return new extHostExtensionService_1.$Sbc(extensionService, extension.identifier, foreign, extensionKind /* TODO@alexdima THIS IS WRONG */, true);
                        }
                    }
                    return undefined;
                },
                get all() {
                    const result = [];
                    for (const desc of extensionInfo.mine.getAllExtensionDescriptions()) {
                        result.push(new extHostExtensionService_1.$Sbc(extensionService, extension.identifier, desc, extensionKind, false));
                    }
                    return result;
                },
                get allAcrossExtensionHosts() {
                    (0, extensions_2.$QF)(extension, 'extensionsAny');
                    const local = new extensions_1.$Wl(extensionInfo.mine.getAllExtensionDescriptions().map(desc => desc.identifier));
                    const result = [];
                    for (const desc of extensionInfo.all.getAllExtensionDescriptions()) {
                        const isFromDifferentExtensionHost = !local.has(desc.identifier);
                        result.push(new extHostExtensionService_1.$Sbc(extensionService, extension.identifier, desc, extensionKind /* TODO@alexdima THIS IS WRONG */, isFromDifferentExtensionHost));
                    }
                    return result;
                },
                get onDidChange() {
                    if ((0, extensions_2.$PF)(extension, 'extensionsAny')) {
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
                    return (0, languageSelector_1.$cF)(typeConverters.LanguageSelector.from(selector), document.uri, document.languageId, true, notebook?.uri, notebook?.notebookType);
                },
                registerCodeActionsProvider(selector, provider, metadata) {
                    return extHostLanguageFeatures.registerCodeActionProvider(extension, checkSelector(selector), provider, metadata);
                },
                registerDocumentPasteEditProvider(selector, provider, metadata) {
                    (0, extensions_2.$QF)(extension, 'documentPaste');
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
                        (0, extensions_2.$QF)(extension, 'inlineCompletionsAdditions');
                    }
                    if (provider.handleDidPartiallyAcceptCompletionItem) {
                        (0, extensions_2.$QF)(extension, 'inlineCompletionsAdditions');
                    }
                    if (metadata) {
                        (0, extensions_2.$QF)(extension, 'inlineCompletionsAdditions');
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
                    (0, extensions_2.$QF)(extension, 'tokenInformation');
                    return extHostLanguages.tokenAtPosition(doc, pos);
                },
                registerInlayHintsProvider(selector, provider) {
                    return extHostLanguageFeatures.registerInlayHintsProvider(extension, selector, provider);
                },
                createLanguageStatusItem(id, selector) {
                    return extHostLanguages.createLanguageStatusItem(extension, id, selector);
                },
                registerDocumentDropEditProvider(selector, provider, metadata) {
                    return extHostLanguageFeatures.registerDocumentOnDropEditProvider(extension, selector, provider, (0, extensions_2.$PF)(extension, 'dropMetadata') ? metadata : undefined);
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
                    (0, extensions_2.$QF)(extension, 'terminalDimensions');
                    return extHostTerminalService.onDidChangeTerminalDimensions(listener, thisArg, disposables);
                },
                onDidChangeTerminalState(listener, thisArg, disposables) {
                    return extHostTerminalService.onDidChangeTerminalState(listener, thisArg, disposables);
                },
                onDidWriteTerminalData(listener, thisArg, disposables) {
                    (0, extensions_2.$QF)(extension, 'terminalDataWriteEvent');
                    return extHostTerminalService.onDidWriteTerminalData(listener, thisArg, disposables);
                },
                onDidExecuteTerminalCommand(listener, thisArg, disposables) {
                    (0, extensions_2.$QF)(extension, 'terminalExecuteCommandEvent');
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
                    (0, extensions_2.$QF)(extension, 'editorInsets');
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
                    (0, extensions_2.$QF)(extension, 'terminalQuickFixProvider');
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
                    (0, extensions_2.$QF)(extension, 'externalUriOpener');
                    return extHostUriOpeners.registerExternalUriOpener(extension.identifier, id, opener, metadata);
                },
                registerProfileContentHandler(id, handler) {
                    (0, extensions_2.$QF)(extension, 'profileContentHandlers');
                    return extHostProfileContentHandlers.registrProfileContentHandler(extension, id, handler);
                },
                registerQuickDiffProvider(selector, quickDiffProvider, label, rootUri) {
                    (0, extensions_2.$QF)(extension, 'quickDiffProvider');
                    return extHostQuickDiff.registerQuickDiffProvider(checkSelector(selector), quickDiffProvider, label, rootUri);
                },
                get tabGroups() {
                    return extHostEditorTabs.tabGroups;
                },
                registerShareProvider(selector, provider) {
                    (0, extensions_2.$QF)(extension, 'shareProvider');
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
                    throw new errors.$7('rootPath');
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
                    throw new errors.$7('name');
                },
                get workspaceFile() {
                    return extHostWorkspace.workspaceFile;
                },
                set workspaceFile(value) {
                    throw new errors.$7('workspaceFile');
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
                    (0, extensions_2.$QF)(extension, 'findTextInFiles');
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
                    (0, extensions_2.$QF)(extension, 'saveEditor');
                    return extHostWorkspace.save(uri);
                },
                saveAs: (uri) => {
                    (0, extensions_2.$QF)(extension, 'saveEditor');
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
                    throw new errors.$7('textDocuments');
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
                    return extHostNotebook.registerNotebookSerializer(extension, viewType, serializer, options, (0, extensions_2.$PF)(extension, 'notebookLiveShare') ? registration : undefined);
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
                    return (0, lifecycle_1.$hc)(extHostFileSystem.registerFileSystemProvider(extension, scheme, provider, options), extHostConsumerFileSystem.addFileSystemProvider(scheme, provider, options));
                },
                get fs() {
                    return extHostConsumerFileSystem.value;
                },
                registerFileSearchProvider: (scheme, provider) => {
                    (0, extensions_2.$QF)(extension, 'fileSearchProvider');
                    return extHostSearch.registerFileSearchProvider(scheme, provider);
                },
                registerTextSearchProvider: (scheme, provider) => {
                    (0, extensions_2.$QF)(extension, 'textSearchProvider');
                    return extHostSearch.registerTextSearchProvider(scheme, provider);
                },
                registerRemoteAuthorityResolver: (authorityPrefix, resolver) => {
                    (0, extensions_2.$QF)(extension, 'resolvers');
                    return extensionService.registerRemoteAuthorityResolver(authorityPrefix, resolver);
                },
                registerResourceLabelFormatter: (formatter) => {
                    (0, extensions_2.$QF)(extension, 'resolvers');
                    return extHostLabelService.$registerResourceLabelFormatter(formatter);
                },
                getRemoteExecServer: (authority) => {
                    (0, extensions_2.$QF)(extension, 'resolvers');
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
                    (0, extensions_2.$QF)(extension, 'tunnels');
                    return extHostTunnelService.openTunnel(extension, forward).then(value => {
                        if (!value) {
                            throw new Error('cannot open tunnel');
                        }
                        return value;
                    });
                },
                get tunnels() {
                    (0, extensions_2.$QF)(extension, 'tunnels');
                    return extHostTunnelService.getTunnels();
                },
                onDidChangeTunnels: (listener, thisArg, disposables) => {
                    (0, extensions_2.$QF)(extension, 'tunnels');
                    return extHostTunnelService.onDidChangeTunnels(listener, thisArg, disposables);
                },
                registerPortAttributesProvider: (portSelector, provider) => {
                    (0, extensions_2.$QF)(extension, 'portsAttributes');
                    return extHostTunnelService.registerPortsAttributesProvider(portSelector, provider);
                },
                registerTunnelProvider: (tunnelProvider, information) => {
                    (0, extensions_2.$QF)(extension, 'tunnelFactory');
                    return extHostTunnelService.registerTunnelProvider(tunnelProvider, information);
                },
                registerTimelineProvider: (scheme, provider) => {
                    (0, extensions_2.$QF)(extension, 'timeline');
                    return extHostTimeline.registerTimelineProvider(scheme, provider, extension.identifier, extHostCommands.converter);
                },
                get isTrusted() {
                    return extHostWorkspace.trusted;
                },
                requestWorkspaceTrust: (options) => {
                    (0, extensions_2.$QF)(extension, 'workspaceTrust');
                    return extHostWorkspace.requestWorkspaceTrust(options);
                },
                onDidGrantWorkspaceTrust: (listener, thisArgs, disposables) => {
                    return extHostWorkspace.onDidGrantWorkspaceTrust(listener, thisArgs, disposables);
                },
                registerEditSessionIdentityProvider: (scheme, provider) => {
                    (0, extensions_2.$QF)(extension, 'editSessionIdentityProvider');
                    return extHostWorkspace.registerEditSessionIdentityProvider(scheme, provider);
                },
                onWillCreateEditSessionIdentity: (listener, thisArgs, disposables) => {
                    (0, extensions_2.$QF)(extension, 'editSessionIdentityProvider');
                    return extHostWorkspace.getOnWillCreateEditSessionIdentityEvent(extension)(listener, thisArgs, disposables);
                },
                registerCanonicalUriProvider: (scheme, provider) => {
                    (0, extensions_2.$QF)(extension, 'canonicalUriProvider');
                    return extHostWorkspace.registerCanonicalUriProvider(scheme, provider);
                },
                getCanonicalUri: (uri, options, token) => {
                    (0, extensions_2.$QF)(extension, 'canonicalUriProvider');
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
                    (0, extensions_2.$QF)(extension, 'debugFocus');
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
                    return extHostNotebookKernels.createNotebookController(extension, id, notebookType, label, handler, (0, extensions_2.$PF)(extension, 'notebookMessaging') ? rendererScripts : undefined);
                },
                registerNotebookCellStatusBarItemProvider: (notebookType, provider) => {
                    return extHostNotebook.registerNotebookCellStatusBarItemProvider(extension, notebookType, provider);
                },
                createRendererMessaging(rendererId) {
                    return extHostNotebookRenderers.createRendererMessaging(extension, rendererId);
                },
                createNotebookControllerDetectionTask(notebookType) {
                    (0, extensions_2.$QF)(extension, 'notebookKernelSource');
                    return extHostNotebookKernels.createNotebookControllerDetectionTask(extension, notebookType);
                },
                registerKernelSourceActionProvider(notebookType, provider) {
                    (0, extensions_2.$QF)(extension, 'notebookKernelSource');
                    return extHostNotebookKernels.registerKernelSourceActionProvider(extension, notebookType, provider);
                },
                onDidChangeNotebookCellExecutionState(listener, thisArgs, disposables) {
                    (0, extensions_2.$QF)(extension, 'notebookCellExecutionState');
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
                    (0, extensions_2.$QF)(extension, 'interactive');
                    return extHostInteractiveEditor.registerProvider(extension, provider, metadata = { label: metadata?.label ?? extension.displayName ?? extension.name });
                },
                registerInteractiveSessionProvider(id, provider) {
                    (0, extensions_2.$QF)(extension, 'interactive');
                    return extHostChat.registerChatProvider(extension, id, provider);
                },
                addInteractiveRequest(context) {
                    (0, extensions_2.$QF)(extension, 'interactive');
                    return extHostChat.addChatRequest(context);
                },
                sendInteractiveRequestToProvider(providerId, message) {
                    (0, extensions_2.$QF)(extension, 'interactive');
                    return extHostChat.sendInteractiveRequestToProvider(providerId, message);
                },
                get onDidPerformUserAction() {
                    (0, extensions_2.$QF)(extension, 'interactiveUserActions');
                    return extHostChat.onDidPerformUserAction;
                },
                transferChatSession(session, toWorkspace) {
                    (0, extensions_2.$QF)(extension, 'interactive');
                    return extHostChat.transferChatSession(session, toWorkspace);
                }
            };
            // namespace: ai
            const ai = {
                getRelatedInformation(query, types) {
                    (0, extensions_2.$QF)(extension, 'aiRelatedInformation');
                    return extHostAiRelatedInformation.getRelatedInformation(extension, query, types);
                },
                registerRelatedInformationProvider(type, provider) {
                    (0, extensions_2.$QF)(extension, 'aiRelatedInformation');
                    return extHostAiRelatedInformation.registerRelatedInformationProvider(extension, type, provider);
                },
                registerEmbeddingVectorProvider(model, provider) {
                    (0, extensions_2.$QF)(extension, 'aiRelatedInformation');
                    return extHostAiEmbeddingVector.registerEmbeddingVectorProvider(extension, model, provider);
                }
            };
            // namespace: llm
            const chat = {
                registerChatResponseProvider(id, provider, metadata) {
                    (0, extensions_2.$QF)(extension, 'chatProvider');
                    return extHostChatProvider.registerProvider(extension.identifier, id, provider, metadata);
                },
                registerSlashCommand(name, command, metadata) {
                    (0, extensions_2.$QF)(extension, 'chatSlashCommands');
                    return extHostChatSlashCommands.registerCommand(extension.identifier, name, command, metadata ?? { description: '' });
                },
                requestChatAccess(id) {
                    (0, extensions_2.$QF)(extension, 'chatRequestAccess');
                    return extHostChatProvider.requestChatResponseProvider(extension.identifier, id);
                },
                registerVariable(name, description, resolver) {
                    (0, extensions_2.$QF)(extension, 'chatVariables');
                    return extHostChatVariables.registerVariableResolver(extension, name, description, resolver);
                },
                registerMappedEditsProvider(selector, provider) {
                    (0, extensions_2.$QF)(extension, 'mappedEditsProvider');
                    return extHostLanguageFeatures.registerMappedEditsProvider(extension, selector, provider);
                },
                registerAgent(name, agent, metadata) {
                    (0, extensions_2.$QF)(extension, 'chatAgents');
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
                Breakpoint: extHostTypes.$1K,
                TerminalOutputAnchor: extHostTypes.TerminalOutputAnchor,
                ChatMessage: extHostTypes.$QL,
                ChatMessageRole: extHostTypes.ChatMessageRole,
                ChatVariableLevel: extHostTypes.ChatVariableLevel,
                CallHierarchyIncomingCall: extHostTypes.$nK,
                CallHierarchyItem: extHostTypes.$mK,
                CallHierarchyOutgoingCall: extHostTypes.$oK,
                CancellationError: errors.$3,
                CancellationTokenSource: cancellation_1.$pd,
                CandidatePortSource: extHost_protocol_1.CandidatePortSource,
                CodeAction: extHostTypes.$jK,
                CodeActionKind: extHostTypes.$kK,
                CodeActionTriggerKind: extHostTypes.CodeActionTriggerKind,
                CodeLens: extHostTypes.$pK,
                Color: extHostTypes.$CK,
                ColorInformation: extHostTypes.$DK,
                ColorPresentation: extHostTypes.$EK,
                ColorThemeKind: extHostTypes.ColorThemeKind,
                CommentMode: extHostTypes.CommentMode,
                CommentState: extHostTypes.CommentState,
                CommentThreadCollapsibleState: extHostTypes.CommentThreadCollapsibleState,
                CommentThreadState: extHostTypes.CommentThreadState,
                CompletionItem: extHostTypes.$wK,
                CompletionItemKind: extHostTypes.CompletionItemKind,
                CompletionItemTag: extHostTypes.CompletionItemTag,
                CompletionList: extHostTypes.$xK,
                CompletionTriggerKind: extHostTypes.CompletionTriggerKind,
                ConfigurationTarget: extHostTypes.ConfigurationTarget,
                CustomExecution: extHostTypes.$MK,
                DebugAdapterExecutable: extHostTypes.$5K,
                DebugAdapterInlineImplementation: extHostTypes.$8K,
                DebugAdapterNamedPipeServer: extHostTypes.$7K,
                DebugAdapterServer: extHostTypes.$6K,
                DebugConfigurationProviderTriggerKind: debug_1.DebugConfigurationProviderTriggerKind,
                DebugConsoleMode: extHostTypes.DebugConsoleMode,
                DecorationRangeBehavior: extHostTypes.DecorationRangeBehavior,
                Diagnostic: extHostTypes.$eK,
                DiagnosticRelatedInformation: extHostTypes.$dK,
                DiagnosticSeverity: extHostTypes.DiagnosticSeverity,
                DiagnosticTag: extHostTypes.DiagnosticTag,
                Disposable: extHostTypes.$3J,
                DocumentHighlight: extHostTypes.$gK,
                DocumentHighlightKind: extHostTypes.DocumentHighlightKind,
                DocumentLink: extHostTypes.$BK,
                DocumentSymbol: extHostTypes.$iK,
                EndOfLine: extHostTypes.EndOfLine,
                EnvironmentVariableMutatorType: extHostTypes.EnvironmentVariableMutatorType,
                EvaluatableExpression: extHostTypes.$$K,
                InlineValueText: extHostTypes.$_K,
                InlineValueVariableLookup: extHostTypes.$aL,
                InlineValueEvaluatableExpression: extHostTypes.$bL,
                InlineCompletionTriggerKind: extHostTypes.InlineCompletionTriggerKind,
                EventEmitter: event_1.$fd,
                ExtensionKind: extHostTypes.ExtensionKind,
                ExtensionMode: extHostTypes.ExtensionMode,
                ExternalUriOpenerPriority: extHostTypes.ExternalUriOpenerPriority,
                FileChangeType: extHostTypes.FileChangeType,
                FileDecoration: extHostTypes.$lL,
                FileDecoration2: extHostTypes.$lL,
                FileSystemError: extHostTypes.$dL,
                FileType: files.FileType,
                FilePermission: files.FilePermission,
                FoldingRange: extHostTypes.$eL,
                FoldingRangeKind: extHostTypes.FoldingRangeKind,
                FunctionBreakpoint: extHostTypes.$3K,
                InlineCompletionItem: extHostTypes.$yK,
                InlineCompletionList: extHostTypes.$zK,
                Hover: extHostTypes.$fK,
                IndentAction: languageConfiguration.IndentAction,
                Location: extHostTypes.$cK,
                MarkdownString: extHostTypes.$qK,
                OverviewRulerLane: model_1.OverviewRulerLane,
                ParameterInformation: extHostTypes.$rK,
                PortAutoForwardAction: extHostTypes.PortAutoForwardAction,
                Position: extHostTypes.$4J,
                ProcessExecution: extHostTypes.$KK,
                ProgressLocation: extHostTypes.ProgressLocation,
                QuickInputButtons: extHostTypes.$kL,
                Range: extHostTypes.$5J,
                RelativePattern: extHostTypes.$YK,
                Selection: extHostTypes.$6J,
                SelectionRange: extHostTypes.$lK,
                SemanticTokens: extHostTypes.$hL,
                SemanticTokensBuilder: extHostTypes.$gL,
                SemanticTokensEdit: extHostTypes.$iL,
                SemanticTokensEdits: extHostTypes.$jL,
                SemanticTokensLegend: extHostTypes.$fL,
                ShellExecution: extHostTypes.$LK,
                ShellQuoting: extHostTypes.ShellQuoting,
                SignatureHelp: extHostTypes.$tK,
                SignatureHelpTriggerKind: extHostTypes.SignatureHelpTriggerKind,
                SignatureInformation: extHostTypes.$sK,
                SnippetString: extHostTypes.$bK,
                SourceBreakpoint: extHostTypes.$2K,
                StandardTokenType: extHostTypes.StandardTokenType,
                StatusBarAlignment: extHostTypes.StatusBarAlignment,
                SymbolInformation: extHostTypes.$hK,
                SymbolKind: extHostTypes.SymbolKind,
                SymbolTag: extHostTypes.SymbolTag,
                Task: extHostTypes.$NK,
                TaskGroup: extHostTypes.$JK,
                TaskPanelKind: extHostTypes.TaskPanelKind,
                TaskRevealKind: extHostTypes.TaskRevealKind,
                TaskScope: extHostTypes.TaskScope,
                TerminalLink: extHostTypes.$FK,
                TerminalQuickFixExecuteTerminalCommand: extHostTypes.$HK,
                TerminalQuickFixOpener: extHostTypes.$GK,
                TerminalLocation: extHostTypes.TerminalLocation,
                TerminalProfile: extHostTypes.$IK,
                TerminalExitReason: extHostTypes.TerminalExitReason,
                TextDocumentSaveReason: extHostTypes.TextDocumentSaveReason,
                TextEdit: extHostTypes.$0J,
                SnippetTextEdit: extHostTypes.$_J,
                TextEditorCursorStyle: editorOptions_1.TextEditorCursorStyle,
                TextEditorLineNumbersStyle: extHostTypes.TextEditorLineNumbersStyle,
                TextEditorRevealType: extHostTypes.TextEditorRevealType,
                TextEditorSelectionChangeKind: extHostTypes.TextEditorSelectionChangeKind,
                SyntaxTokenType: extHostTypes.SyntaxTokenType,
                TextDocumentChangeReason: extHostTypes.TextDocumentChangeReason,
                ThemeColor: extHostTypes.$XK,
                ThemeIcon: extHostTypes.$WK,
                TreeItem: extHostTypes.$OK,
                TreeItemCheckboxState: extHostTypes.TreeItemCheckboxState,
                TreeItemCollapsibleState: extHostTypes.TreeItemCollapsibleState,
                TypeHierarchyItem: extHostTypes.$GL,
                UIKind: extensionHostProtocol_1.UIKind,
                Uri: uri_1.URI,
                ViewColumn: extHostTypes.ViewColumn,
                WorkspaceEdit: extHostTypes.$aK,
                // proposed api types
                DocumentDropEdit: extHostTypes.$UK,
                DocumentPasteEdit: extHostTypes.$VK,
                InlayHint: extHostTypes.$vK,
                InlayHintLabelPart: extHostTypes.$uK,
                InlayHintKind: extHostTypes.InlayHintKind,
                RemoteAuthorityResolverError: extHostTypes.$9J,
                ResolvedAuthority: extHostTypes.$7J,
                ManagedResolvedAuthority: extHostTypes.$8J,
                SourceControlInputBoxValidationType: extHostTypes.SourceControlInputBoxValidationType,
                ExtensionRuntime: extHostTypes.ExtensionRuntime,
                TimelineItem: extHostTypes.$vL,
                NotebookRange: extHostTypes.$nL,
                NotebookCellKind: extHostTypes.NotebookCellKind,
                NotebookCellExecutionState: extHostTypes.NotebookCellExecutionState,
                NotebookCellData: extHostTypes.$oL,
                NotebookData: extHostTypes.$pL,
                NotebookRendererScript: extHostTypes.$tL,
                NotebookCellStatusBarAlignment: extHostTypes.NotebookCellStatusBarAlignment,
                NotebookEditorRevealType: extHostTypes.NotebookEditorRevealType,
                NotebookCellOutput: extHostTypes.$rL,
                NotebookCellOutputItem: extHostTypes.$qL,
                NotebookCellStatusBarItem: extHostTypes.$sL,
                NotebookControllerAffinity: extHostTypes.NotebookControllerAffinity,
                NotebookControllerAffinity2: extHostTypes.NotebookControllerAffinity2,
                NotebookEdit: extHostTypes.$$J,
                NotebookKernelSourceAction: extHostTypes.$uL,
                PortAttributes: extHostTypes.$xL,
                LinkedEditingRanges: extHostTypes.$wL,
                TestResultState: extHostTypes.TestResultState,
                TestRunRequest: extHostTypes.$yL,
                TestMessage: extHostTypes.$zL,
                TestMessage2: extHostTypes.$zL,
                TestTag: extHostTypes.$AL,
                TestRunProfileKind: extHostTypes.TestRunProfileKind,
                TextSearchCompleteMessageType: searchExtTypes_1.TextSearchCompleteMessageType,
                DataTransfer: extHostTypes.$TK,
                DataTransferItem: extHostTypes.$PK,
                CoveredCount: extHostTypes.$BL,
                FileCoverage: extHostTypes.$CL,
                StatementCoverage: extHostTypes.$DL,
                BranchCoverage: extHostTypes.$EL,
                FunctionCoverage: extHostTypes.$FL,
                WorkspaceTrustState: extHostTypes.WorkspaceTrustState,
                LanguageStatusSeverity: extHostTypes.LanguageStatusSeverity,
                QuickPickItemKind: extHostTypes.QuickPickItemKind,
                InputBoxValidationSeverity: extHostTypes.InputBoxValidationSeverity,
                TabInputText: extHostTypes.$HL,
                TabInputTextDiff: extHostTypes.$IL,
                TabInputTextMerge: extHostTypes.$JL,
                TabInputCustom: extHostTypes.$KL,
                TabInputNotebook: extHostTypes.$ML,
                TabInputNotebookDiff: extHostTypes.$NL,
                TabInputWebview: extHostTypes.$LL,
                TabInputTerminal: extHostTypes.$OL,
                TabInputInteractiveWindow: extHostTypes.$PL,
                TelemetryTrustedValue: telemetryUtils_1.$_n,
                LogLevel: log_1.LogLevel,
                EditSessionIdentityMatch: editSessions_1.EditSessionIdentityMatch,
                InteractiveSessionVoteDirection: extHostTypes.InteractiveSessionVoteDirection,
                InteractiveSessionCopyKind: extHostTypes.InteractiveSessionCopyKind,
                InteractiveEditorResponseFeedbackKind: extHostTypes.InteractiveEditorResponseFeedbackKind,
                StackFrameFocus: extHostTypes.$9K,
                ThreadFocus: extHostTypes.$0K,
                RelatedInformationType: extHostTypes.RelatedInformationType
            };
        };
    }
    exports.$adc = $adc;
});
//# sourceMappingURL=extHost.api.impl.js.map