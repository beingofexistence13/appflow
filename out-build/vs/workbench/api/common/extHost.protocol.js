/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/extensions/common/proxyIdentifier"], function (require, exports, proxyIdentifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2J = exports.$1J = exports.ExtHostTestingResource = exports.ISuggestResultDtoField = exports.ISuggestDataDtoField = exports.$ZJ = exports.CandidatePortSource = exports.NotebookEditorRevealType = exports.CellOutputKind = exports.WebviewMessageArrayBufferViewType = exports.WebviewEditorCapabilities = exports.TabModelOperationKind = exports.TabInputKind = exports.TextEditorRevealType = void 0;
    var TextEditorRevealType;
    (function (TextEditorRevealType) {
        TextEditorRevealType[TextEditorRevealType["Default"] = 0] = "Default";
        TextEditorRevealType[TextEditorRevealType["InCenter"] = 1] = "InCenter";
        TextEditorRevealType[TextEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
        TextEditorRevealType[TextEditorRevealType["AtTop"] = 3] = "AtTop";
    })(TextEditorRevealType || (exports.TextEditorRevealType = TextEditorRevealType = {}));
    //#region --- tabs model
    var TabInputKind;
    (function (TabInputKind) {
        TabInputKind[TabInputKind["UnknownInput"] = 0] = "UnknownInput";
        TabInputKind[TabInputKind["TextInput"] = 1] = "TextInput";
        TabInputKind[TabInputKind["TextDiffInput"] = 2] = "TextDiffInput";
        TabInputKind[TabInputKind["TextMergeInput"] = 3] = "TextMergeInput";
        TabInputKind[TabInputKind["NotebookInput"] = 4] = "NotebookInput";
        TabInputKind[TabInputKind["NotebookDiffInput"] = 5] = "NotebookDiffInput";
        TabInputKind[TabInputKind["CustomEditorInput"] = 6] = "CustomEditorInput";
        TabInputKind[TabInputKind["WebviewEditorInput"] = 7] = "WebviewEditorInput";
        TabInputKind[TabInputKind["TerminalEditorInput"] = 8] = "TerminalEditorInput";
        TabInputKind[TabInputKind["InteractiveEditorInput"] = 9] = "InteractiveEditorInput";
    })(TabInputKind || (exports.TabInputKind = TabInputKind = {}));
    var TabModelOperationKind;
    (function (TabModelOperationKind) {
        TabModelOperationKind[TabModelOperationKind["TAB_OPEN"] = 0] = "TAB_OPEN";
        TabModelOperationKind[TabModelOperationKind["TAB_CLOSE"] = 1] = "TAB_CLOSE";
        TabModelOperationKind[TabModelOperationKind["TAB_UPDATE"] = 2] = "TAB_UPDATE";
        TabModelOperationKind[TabModelOperationKind["TAB_MOVE"] = 3] = "TAB_MOVE";
    })(TabModelOperationKind || (exports.TabModelOperationKind = TabModelOperationKind = {}));
    var WebviewEditorCapabilities;
    (function (WebviewEditorCapabilities) {
        WebviewEditorCapabilities[WebviewEditorCapabilities["Editable"] = 0] = "Editable";
        WebviewEditorCapabilities[WebviewEditorCapabilities["SupportsHotExit"] = 1] = "SupportsHotExit";
    })(WebviewEditorCapabilities || (exports.WebviewEditorCapabilities = WebviewEditorCapabilities = {}));
    var WebviewMessageArrayBufferViewType;
    (function (WebviewMessageArrayBufferViewType) {
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Int8Array"] = 1] = "Int8Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Uint8Array"] = 2] = "Uint8Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Uint8ClampedArray"] = 3] = "Uint8ClampedArray";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Int16Array"] = 4] = "Int16Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Uint16Array"] = 5] = "Uint16Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Int32Array"] = 6] = "Int32Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Uint32Array"] = 7] = "Uint32Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Float32Array"] = 8] = "Float32Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Float64Array"] = 9] = "Float64Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["BigInt64Array"] = 10] = "BigInt64Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["BigUint64Array"] = 11] = "BigUint64Array";
    })(WebviewMessageArrayBufferViewType || (exports.WebviewMessageArrayBufferViewType = WebviewMessageArrayBufferViewType = {}));
    var CellOutputKind;
    (function (CellOutputKind) {
        CellOutputKind[CellOutputKind["Text"] = 1] = "Text";
        CellOutputKind[CellOutputKind["Error"] = 2] = "Error";
        CellOutputKind[CellOutputKind["Rich"] = 3] = "Rich";
    })(CellOutputKind || (exports.CellOutputKind = CellOutputKind = {}));
    var NotebookEditorRevealType;
    (function (NotebookEditorRevealType) {
        NotebookEditorRevealType[NotebookEditorRevealType["Default"] = 0] = "Default";
        NotebookEditorRevealType[NotebookEditorRevealType["InCenter"] = 1] = "InCenter";
        NotebookEditorRevealType[NotebookEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
        NotebookEditorRevealType[NotebookEditorRevealType["AtTop"] = 3] = "AtTop";
    })(NotebookEditorRevealType || (exports.NotebookEditorRevealType = NotebookEditorRevealType = {}));
    var CandidatePortSource;
    (function (CandidatePortSource) {
        CandidatePortSource[CandidatePortSource["None"] = 0] = "None";
        CandidatePortSource[CandidatePortSource["Process"] = 1] = "Process";
        CandidatePortSource[CandidatePortSource["Output"] = 2] = "Output";
    })(CandidatePortSource || (exports.CandidatePortSource = CandidatePortSource = {}));
    class $ZJ {
        static { this.a = 0; }
        static mixin(object) {
            object._id = $ZJ.a++;
            return object;
        }
    }
    exports.$ZJ = $ZJ;
    var ISuggestDataDtoField;
    (function (ISuggestDataDtoField) {
        ISuggestDataDtoField["label"] = "a";
        ISuggestDataDtoField["kind"] = "b";
        ISuggestDataDtoField["detail"] = "c";
        ISuggestDataDtoField["documentation"] = "d";
        ISuggestDataDtoField["sortText"] = "e";
        ISuggestDataDtoField["filterText"] = "f";
        ISuggestDataDtoField["preselect"] = "g";
        ISuggestDataDtoField["insertText"] = "h";
        ISuggestDataDtoField["insertTextRules"] = "i";
        ISuggestDataDtoField["range"] = "j";
        ISuggestDataDtoField["commitCharacters"] = "k";
        ISuggestDataDtoField["additionalTextEdits"] = "l";
        ISuggestDataDtoField["kindModifier"] = "m";
        ISuggestDataDtoField["commandIdent"] = "n";
        ISuggestDataDtoField["commandId"] = "o";
        ISuggestDataDtoField["commandArguments"] = "p";
    })(ISuggestDataDtoField || (exports.ISuggestDataDtoField = ISuggestDataDtoField = {}));
    var ISuggestResultDtoField;
    (function (ISuggestResultDtoField) {
        ISuggestResultDtoField["defaultRanges"] = "a";
        ISuggestResultDtoField["completions"] = "b";
        ISuggestResultDtoField["isIncomplete"] = "c";
        ISuggestResultDtoField["duration"] = "d";
    })(ISuggestResultDtoField || (exports.ISuggestResultDtoField = ISuggestResultDtoField = {}));
    var ExtHostTestingResource;
    (function (ExtHostTestingResource) {
        ExtHostTestingResource[ExtHostTestingResource["Workspace"] = 0] = "Workspace";
        ExtHostTestingResource[ExtHostTestingResource["TextDocument"] = 1] = "TextDocument";
    })(ExtHostTestingResource || (exports.ExtHostTestingResource = ExtHostTestingResource = {}));
    // --- proxy identifiers
    exports.$1J = {
        MainThreadAuthentication: (0, proxyIdentifier_1.$bA)('MainThreadAuthentication'),
        MainThreadBulkEdits: (0, proxyIdentifier_1.$bA)('MainThreadBulkEdits'),
        MainThreadChatProvider: (0, proxyIdentifier_1.$bA)('MainThreadChatProvider'),
        MainThreadChatSlashCommands: (0, proxyIdentifier_1.$bA)('MainThreadChatSlashCommands'),
        MainThreadChatAgents: (0, proxyIdentifier_1.$bA)('MainThreadChatAgents'),
        MainThreadChatVariables: (0, proxyIdentifier_1.$bA)('MainThreadChatVariables'),
        MainThreadClipboard: (0, proxyIdentifier_1.$bA)('MainThreadClipboard'),
        MainThreadCommands: (0, proxyIdentifier_1.$bA)('MainThreadCommands'),
        MainThreadComments: (0, proxyIdentifier_1.$bA)('MainThreadComments'),
        MainThreadConfiguration: (0, proxyIdentifier_1.$bA)('MainThreadConfiguration'),
        MainThreadConsole: (0, proxyIdentifier_1.$bA)('MainThreadConsole'),
        MainThreadDebugService: (0, proxyIdentifier_1.$bA)('MainThreadDebugService'),
        MainThreadDecorations: (0, proxyIdentifier_1.$bA)('MainThreadDecorations'),
        MainThreadDiagnostics: (0, proxyIdentifier_1.$bA)('MainThreadDiagnostics'),
        MainThreadDialogs: (0, proxyIdentifier_1.$bA)('MainThreadDiaglogs'),
        MainThreadDocuments: (0, proxyIdentifier_1.$bA)('MainThreadDocuments'),
        MainThreadDocumentContentProviders: (0, proxyIdentifier_1.$bA)('MainThreadDocumentContentProviders'),
        MainThreadTextEditors: (0, proxyIdentifier_1.$bA)('MainThreadTextEditors'),
        MainThreadEditorInsets: (0, proxyIdentifier_1.$bA)('MainThreadEditorInsets'),
        MainThreadEditorTabs: (0, proxyIdentifier_1.$bA)('MainThreadEditorTabs'),
        MainThreadErrors: (0, proxyIdentifier_1.$bA)('MainThreadErrors'),
        MainThreadTreeViews: (0, proxyIdentifier_1.$bA)('MainThreadTreeViews'),
        MainThreadDownloadService: (0, proxyIdentifier_1.$bA)('MainThreadDownloadService'),
        MainThreadLanguageFeatures: (0, proxyIdentifier_1.$bA)('MainThreadLanguageFeatures'),
        MainThreadLanguages: (0, proxyIdentifier_1.$bA)('MainThreadLanguages'),
        MainThreadLogger: (0, proxyIdentifier_1.$bA)('MainThreadLogger'),
        MainThreadMessageService: (0, proxyIdentifier_1.$bA)('MainThreadMessageService'),
        MainThreadOutputService: (0, proxyIdentifier_1.$bA)('MainThreadOutputService'),
        MainThreadProgress: (0, proxyIdentifier_1.$bA)('MainThreadProgress'),
        MainThreadQuickDiff: (0, proxyIdentifier_1.$bA)('MainThreadQuickDiff'),
        MainThreadQuickOpen: (0, proxyIdentifier_1.$bA)('MainThreadQuickOpen'),
        MainThreadStatusBar: (0, proxyIdentifier_1.$bA)('MainThreadStatusBar'),
        MainThreadSecretState: (0, proxyIdentifier_1.$bA)('MainThreadSecretState'),
        MainThreadStorage: (0, proxyIdentifier_1.$bA)('MainThreadStorage'),
        MainThreadTelemetry: (0, proxyIdentifier_1.$bA)('MainThreadTelemetry'),
        MainThreadTerminalService: (0, proxyIdentifier_1.$bA)('MainThreadTerminalService'),
        MainThreadWebviews: (0, proxyIdentifier_1.$bA)('MainThreadWebviews'),
        MainThreadWebviewPanels: (0, proxyIdentifier_1.$bA)('MainThreadWebviewPanels'),
        MainThreadWebviewViews: (0, proxyIdentifier_1.$bA)('MainThreadWebviewViews'),
        MainThreadCustomEditors: (0, proxyIdentifier_1.$bA)('MainThreadCustomEditors'),
        MainThreadUrls: (0, proxyIdentifier_1.$bA)('MainThreadUrls'),
        MainThreadUriOpeners: (0, proxyIdentifier_1.$bA)('MainThreadUriOpeners'),
        MainThreadProfileContentHandlers: (0, proxyIdentifier_1.$bA)('MainThreadProfileContentHandlers'),
        MainThreadWorkspace: (0, proxyIdentifier_1.$bA)('MainThreadWorkspace'),
        MainThreadFileSystem: (0, proxyIdentifier_1.$bA)('MainThreadFileSystem'),
        MainThreadExtensionService: (0, proxyIdentifier_1.$bA)('MainThreadExtensionService'),
        MainThreadSCM: (0, proxyIdentifier_1.$bA)('MainThreadSCM'),
        MainThreadSearch: (0, proxyIdentifier_1.$bA)('MainThreadSearch'),
        MainThreadShare: (0, proxyIdentifier_1.$bA)('MainThreadShare'),
        MainThreadTask: (0, proxyIdentifier_1.$bA)('MainThreadTask'),
        MainThreadWindow: (0, proxyIdentifier_1.$bA)('MainThreadWindow'),
        MainThreadLabelService: (0, proxyIdentifier_1.$bA)('MainThreadLabelService'),
        MainThreadNotebook: (0, proxyIdentifier_1.$bA)('MainThreadNotebook'),
        MainThreadNotebookDocuments: (0, proxyIdentifier_1.$bA)('MainThreadNotebookDocumentsShape'),
        MainThreadNotebookEditors: (0, proxyIdentifier_1.$bA)('MainThreadNotebookEditorsShape'),
        MainThreadNotebookKernels: (0, proxyIdentifier_1.$bA)('MainThreadNotebookKernels'),
        MainThreadNotebookRenderers: (0, proxyIdentifier_1.$bA)('MainThreadNotebookRenderers'),
        MainThreadInteractive: (0, proxyIdentifier_1.$bA)('MainThreadInteractive'),
        MainThreadChat: (0, proxyIdentifier_1.$bA)('MainThreadChat'),
        MainThreadInlineChat: (0, proxyIdentifier_1.$bA)('MainThreadInlineChatShape'),
        MainThreadTheming: (0, proxyIdentifier_1.$bA)('MainThreadTheming'),
        MainThreadTunnelService: (0, proxyIdentifier_1.$bA)('MainThreadTunnelService'),
        MainThreadManagedSockets: (0, proxyIdentifier_1.$bA)('MainThreadManagedSockets'),
        MainThreadTimeline: (0, proxyIdentifier_1.$bA)('MainThreadTimeline'),
        MainThreadTesting: (0, proxyIdentifier_1.$bA)('MainThreadTesting'),
        MainThreadLocalization: (0, proxyIdentifier_1.$bA)('MainThreadLocalizationShape'),
        MainThreadAiRelatedInformation: (0, proxyIdentifier_1.$bA)('MainThreadAiRelatedInformation'),
        MainThreadAiEmbeddingVector: (0, proxyIdentifier_1.$bA)('MainThreadAiEmbeddingVector'),
        MainThreadIssueReporter: (0, proxyIdentifier_1.$bA)('MainThreadIssueReporter'),
    };
    exports.$2J = {
        ExtHostCommands: (0, proxyIdentifier_1.$bA)('ExtHostCommands'),
        ExtHostConfiguration: (0, proxyIdentifier_1.$bA)('ExtHostConfiguration'),
        ExtHostDiagnostics: (0, proxyIdentifier_1.$bA)('ExtHostDiagnostics'),
        ExtHostDebugService: (0, proxyIdentifier_1.$bA)('ExtHostDebugService'),
        ExtHostDecorations: (0, proxyIdentifier_1.$bA)('ExtHostDecorations'),
        ExtHostDocumentsAndEditors: (0, proxyIdentifier_1.$bA)('ExtHostDocumentsAndEditors'),
        ExtHostDocuments: (0, proxyIdentifier_1.$bA)('ExtHostDocuments'),
        ExtHostDocumentContentProviders: (0, proxyIdentifier_1.$bA)('ExtHostDocumentContentProviders'),
        ExtHostDocumentSaveParticipant: (0, proxyIdentifier_1.$bA)('ExtHostDocumentSaveParticipant'),
        ExtHostEditors: (0, proxyIdentifier_1.$bA)('ExtHostEditors'),
        ExtHostTreeViews: (0, proxyIdentifier_1.$bA)('ExtHostTreeViews'),
        ExtHostFileSystem: (0, proxyIdentifier_1.$bA)('ExtHostFileSystem'),
        ExtHostFileSystemInfo: (0, proxyIdentifier_1.$bA)('ExtHostFileSystemInfo'),
        ExtHostFileSystemEventService: (0, proxyIdentifier_1.$bA)('ExtHostFileSystemEventService'),
        ExtHostLanguages: (0, proxyIdentifier_1.$bA)('ExtHostLanguages'),
        ExtHostLanguageFeatures: (0, proxyIdentifier_1.$bA)('ExtHostLanguageFeatures'),
        ExtHostQuickOpen: (0, proxyIdentifier_1.$bA)('ExtHostQuickOpen'),
        ExtHostQuickDiff: (0, proxyIdentifier_1.$bA)('ExtHostQuickDiff'),
        ExtHostStatusBar: (0, proxyIdentifier_1.$bA)('ExtHostStatusBar'),
        ExtHostShare: (0, proxyIdentifier_1.$bA)('ExtHostShare'),
        ExtHostExtensionService: (0, proxyIdentifier_1.$bA)('ExtHostExtensionService'),
        ExtHostLogLevelServiceShape: (0, proxyIdentifier_1.$bA)('ExtHostLogLevelServiceShape'),
        ExtHostTerminalService: (0, proxyIdentifier_1.$bA)('ExtHostTerminalService'),
        ExtHostSCM: (0, proxyIdentifier_1.$bA)('ExtHostSCM'),
        ExtHostSearch: (0, proxyIdentifier_1.$bA)('ExtHostSearch'),
        ExtHostTask: (0, proxyIdentifier_1.$bA)('ExtHostTask'),
        ExtHostWorkspace: (0, proxyIdentifier_1.$bA)('ExtHostWorkspace'),
        ExtHostWindow: (0, proxyIdentifier_1.$bA)('ExtHostWindow'),
        ExtHostWebviews: (0, proxyIdentifier_1.$bA)('ExtHostWebviews'),
        ExtHostWebviewPanels: (0, proxyIdentifier_1.$bA)('ExtHostWebviewPanels'),
        ExtHostCustomEditors: (0, proxyIdentifier_1.$bA)('ExtHostCustomEditors'),
        ExtHostWebviewViews: (0, proxyIdentifier_1.$bA)('ExtHostWebviewViews'),
        ExtHostEditorInsets: (0, proxyIdentifier_1.$bA)('ExtHostEditorInsets'),
        ExtHostEditorTabs: (0, proxyIdentifier_1.$bA)('ExtHostEditorTabs'),
        ExtHostProgress: (0, proxyIdentifier_1.$bA)('ExtHostProgress'),
        ExtHostComments: (0, proxyIdentifier_1.$bA)('ExtHostComments'),
        ExtHostSecretState: (0, proxyIdentifier_1.$bA)('ExtHostSecretState'),
        ExtHostStorage: (0, proxyIdentifier_1.$bA)('ExtHostStorage'),
        ExtHostUrls: (0, proxyIdentifier_1.$bA)('ExtHostUrls'),
        ExtHostUriOpeners: (0, proxyIdentifier_1.$bA)('ExtHostUriOpeners'),
        ExtHostProfileContentHandlers: (0, proxyIdentifier_1.$bA)('ExtHostProfileContentHandlers'),
        ExtHostOutputService: (0, proxyIdentifier_1.$bA)('ExtHostOutputService'),
        ExtHosLabelService: (0, proxyIdentifier_1.$bA)('ExtHostLabelService'),
        ExtHostNotebook: (0, proxyIdentifier_1.$bA)('ExtHostNotebook'),
        ExtHostNotebookDocuments: (0, proxyIdentifier_1.$bA)('ExtHostNotebookDocuments'),
        ExtHostNotebookEditors: (0, proxyIdentifier_1.$bA)('ExtHostNotebookEditors'),
        ExtHostNotebookKernels: (0, proxyIdentifier_1.$bA)('ExtHostNotebookKernels'),
        ExtHostNotebookRenderers: (0, proxyIdentifier_1.$bA)('ExtHostNotebookRenderers'),
        ExtHostNotebookDocumentSaveParticipant: (0, proxyIdentifier_1.$bA)('ExtHostNotebookDocumentSaveParticipant'),
        ExtHostInteractive: (0, proxyIdentifier_1.$bA)('ExtHostInteractive'),
        ExtHostInlineChat: (0, proxyIdentifier_1.$bA)('ExtHostInlineChatShape'),
        ExtHostChat: (0, proxyIdentifier_1.$bA)('ExtHostChat'),
        ExtHostChatSlashCommands: (0, proxyIdentifier_1.$bA)('ExtHostChatSlashCommands'),
        ExtHostChatAgents: (0, proxyIdentifier_1.$bA)('ExtHostChatAgents'),
        ExtHostChatVariables: (0, proxyIdentifier_1.$bA)('ExtHostChatVariables'),
        ExtHostChatProvider: (0, proxyIdentifier_1.$bA)('ExtHostChatProvider'),
        ExtHostAiRelatedInformation: (0, proxyIdentifier_1.$bA)('ExtHostAiRelatedInformation'),
        ExtHostAiEmbeddingVector: (0, proxyIdentifier_1.$bA)('ExtHostAiEmbeddingVector'),
        ExtHostTheming: (0, proxyIdentifier_1.$bA)('ExtHostTheming'),
        ExtHostTunnelService: (0, proxyIdentifier_1.$bA)('ExtHostTunnelService'),
        ExtHostManagedSockets: (0, proxyIdentifier_1.$bA)('ExtHostManagedSockets'),
        ExtHostAuthentication: (0, proxyIdentifier_1.$bA)('ExtHostAuthentication'),
        ExtHostTimeline: (0, proxyIdentifier_1.$bA)('ExtHostTimeline'),
        ExtHostTesting: (0, proxyIdentifier_1.$bA)('ExtHostTesting'),
        ExtHostTelemetry: (0, proxyIdentifier_1.$bA)('ExtHostTelemetry'),
        ExtHostLocalization: (0, proxyIdentifier_1.$bA)('ExtHostLocalization'),
        ExtHostIssueReporter: (0, proxyIdentifier_1.$bA)('ExtHostIssueReporter'),
    };
});
//# sourceMappingURL=extHost.protocol.js.map