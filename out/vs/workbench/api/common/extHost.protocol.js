/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/extensions/common/proxyIdentifier"], function (require, exports, proxyIdentifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostContext = exports.MainContext = exports.ExtHostTestingResource = exports.ISuggestResultDtoField = exports.ISuggestDataDtoField = exports.IdObject = exports.CandidatePortSource = exports.NotebookEditorRevealType = exports.CellOutputKind = exports.WebviewMessageArrayBufferViewType = exports.WebviewEditorCapabilities = exports.TabModelOperationKind = exports.TabInputKind = exports.TextEditorRevealType = void 0;
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
    class IdObject {
        static { this._n = 0; }
        static mixin(object) {
            object._id = IdObject._n++;
            return object;
        }
    }
    exports.IdObject = IdObject;
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
    exports.MainContext = {
        MainThreadAuthentication: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadAuthentication'),
        MainThreadBulkEdits: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadBulkEdits'),
        MainThreadChatProvider: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadChatProvider'),
        MainThreadChatSlashCommands: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadChatSlashCommands'),
        MainThreadChatAgents: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadChatAgents'),
        MainThreadChatVariables: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadChatVariables'),
        MainThreadClipboard: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadClipboard'),
        MainThreadCommands: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadCommands'),
        MainThreadComments: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadComments'),
        MainThreadConfiguration: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadConfiguration'),
        MainThreadConsole: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadConsole'),
        MainThreadDebugService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDebugService'),
        MainThreadDecorations: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDecorations'),
        MainThreadDiagnostics: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDiagnostics'),
        MainThreadDialogs: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDiaglogs'),
        MainThreadDocuments: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDocuments'),
        MainThreadDocumentContentProviders: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDocumentContentProviders'),
        MainThreadTextEditors: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTextEditors'),
        MainThreadEditorInsets: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadEditorInsets'),
        MainThreadEditorTabs: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadEditorTabs'),
        MainThreadErrors: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadErrors'),
        MainThreadTreeViews: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTreeViews'),
        MainThreadDownloadService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadDownloadService'),
        MainThreadLanguageFeatures: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadLanguageFeatures'),
        MainThreadLanguages: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadLanguages'),
        MainThreadLogger: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadLogger'),
        MainThreadMessageService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadMessageService'),
        MainThreadOutputService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadOutputService'),
        MainThreadProgress: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadProgress'),
        MainThreadQuickDiff: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadQuickDiff'),
        MainThreadQuickOpen: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadQuickOpen'),
        MainThreadStatusBar: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadStatusBar'),
        MainThreadSecretState: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadSecretState'),
        MainThreadStorage: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadStorage'),
        MainThreadTelemetry: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTelemetry'),
        MainThreadTerminalService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTerminalService'),
        MainThreadWebviews: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadWebviews'),
        MainThreadWebviewPanels: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadWebviewPanels'),
        MainThreadWebviewViews: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadWebviewViews'),
        MainThreadCustomEditors: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadCustomEditors'),
        MainThreadUrls: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadUrls'),
        MainThreadUriOpeners: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadUriOpeners'),
        MainThreadProfileContentHandlers: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadProfileContentHandlers'),
        MainThreadWorkspace: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadWorkspace'),
        MainThreadFileSystem: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadFileSystem'),
        MainThreadExtensionService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadExtensionService'),
        MainThreadSCM: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadSCM'),
        MainThreadSearch: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadSearch'),
        MainThreadShare: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadShare'),
        MainThreadTask: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTask'),
        MainThreadWindow: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadWindow'),
        MainThreadLabelService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadLabelService'),
        MainThreadNotebook: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadNotebook'),
        MainThreadNotebookDocuments: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadNotebookDocumentsShape'),
        MainThreadNotebookEditors: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadNotebookEditorsShape'),
        MainThreadNotebookKernels: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadNotebookKernels'),
        MainThreadNotebookRenderers: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadNotebookRenderers'),
        MainThreadInteractive: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadInteractive'),
        MainThreadChat: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadChat'),
        MainThreadInlineChat: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadInlineChatShape'),
        MainThreadTheming: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTheming'),
        MainThreadTunnelService: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTunnelService'),
        MainThreadManagedSockets: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadManagedSockets'),
        MainThreadTimeline: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTimeline'),
        MainThreadTesting: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadTesting'),
        MainThreadLocalization: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadLocalizationShape'),
        MainThreadAiRelatedInformation: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadAiRelatedInformation'),
        MainThreadAiEmbeddingVector: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadAiEmbeddingVector'),
        MainThreadIssueReporter: (0, proxyIdentifier_1.createProxyIdentifier)('MainThreadIssueReporter'),
    };
    exports.ExtHostContext = {
        ExtHostCommands: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostCommands'),
        ExtHostConfiguration: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostConfiguration'),
        ExtHostDiagnostics: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDiagnostics'),
        ExtHostDebugService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDebugService'),
        ExtHostDecorations: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDecorations'),
        ExtHostDocumentsAndEditors: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDocumentsAndEditors'),
        ExtHostDocuments: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDocuments'),
        ExtHostDocumentContentProviders: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDocumentContentProviders'),
        ExtHostDocumentSaveParticipant: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostDocumentSaveParticipant'),
        ExtHostEditors: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostEditors'),
        ExtHostTreeViews: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTreeViews'),
        ExtHostFileSystem: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostFileSystem'),
        ExtHostFileSystemInfo: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostFileSystemInfo'),
        ExtHostFileSystemEventService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostFileSystemEventService'),
        ExtHostLanguages: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostLanguages'),
        ExtHostLanguageFeatures: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostLanguageFeatures'),
        ExtHostQuickOpen: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostQuickOpen'),
        ExtHostQuickDiff: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostQuickDiff'),
        ExtHostStatusBar: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostStatusBar'),
        ExtHostShare: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostShare'),
        ExtHostExtensionService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostExtensionService'),
        ExtHostLogLevelServiceShape: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostLogLevelServiceShape'),
        ExtHostTerminalService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTerminalService'),
        ExtHostSCM: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostSCM'),
        ExtHostSearch: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostSearch'),
        ExtHostTask: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTask'),
        ExtHostWorkspace: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostWorkspace'),
        ExtHostWindow: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostWindow'),
        ExtHostWebviews: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostWebviews'),
        ExtHostWebviewPanels: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostWebviewPanels'),
        ExtHostCustomEditors: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostCustomEditors'),
        ExtHostWebviewViews: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostWebviewViews'),
        ExtHostEditorInsets: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostEditorInsets'),
        ExtHostEditorTabs: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostEditorTabs'),
        ExtHostProgress: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostProgress'),
        ExtHostComments: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostComments'),
        ExtHostSecretState: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostSecretState'),
        ExtHostStorage: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostStorage'),
        ExtHostUrls: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostUrls'),
        ExtHostUriOpeners: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostUriOpeners'),
        ExtHostProfileContentHandlers: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostProfileContentHandlers'),
        ExtHostOutputService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostOutputService'),
        ExtHosLabelService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostLabelService'),
        ExtHostNotebook: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostNotebook'),
        ExtHostNotebookDocuments: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostNotebookDocuments'),
        ExtHostNotebookEditors: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostNotebookEditors'),
        ExtHostNotebookKernels: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostNotebookKernels'),
        ExtHostNotebookRenderers: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostNotebookRenderers'),
        ExtHostNotebookDocumentSaveParticipant: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostNotebookDocumentSaveParticipant'),
        ExtHostInteractive: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostInteractive'),
        ExtHostInlineChat: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostInlineChatShape'),
        ExtHostChat: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostChat'),
        ExtHostChatSlashCommands: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostChatSlashCommands'),
        ExtHostChatAgents: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostChatAgents'),
        ExtHostChatVariables: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostChatVariables'),
        ExtHostChatProvider: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostChatProvider'),
        ExtHostAiRelatedInformation: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostAiRelatedInformation'),
        ExtHostAiEmbeddingVector: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostAiEmbeddingVector'),
        ExtHostTheming: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTheming'),
        ExtHostTunnelService: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTunnelService'),
        ExtHostManagedSockets: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostManagedSockets'),
        ExtHostAuthentication: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostAuthentication'),
        ExtHostTimeline: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTimeline'),
        ExtHostTesting: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTesting'),
        ExtHostTelemetry: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostTelemetry'),
        ExtHostLocalization: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostLocalization'),
        ExtHostIssueReporter: (0, proxyIdentifier_1.createProxyIdentifier)('ExtHostIssueReporter'),
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdC5wcm90b2NvbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3QucHJvdG9jb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBd09oRyxJQUFZLG9CQUtYO0lBTEQsV0FBWSxvQkFBb0I7UUFDL0IscUVBQVcsQ0FBQTtRQUNYLHVFQUFZLENBQUE7UUFDWix5R0FBNkIsQ0FBQTtRQUM3QixpRUFBUyxDQUFBO0lBQ1YsQ0FBQyxFQUxXLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBSy9CO0lBbWJELHdCQUF3QjtJQUV4QixJQUFrQixZQVdqQjtJQVhELFdBQWtCLFlBQVk7UUFDN0IsK0RBQVksQ0FBQTtRQUNaLHlEQUFTLENBQUE7UUFDVCxpRUFBYSxDQUFBO1FBQ2IsbUVBQWMsQ0FBQTtRQUNkLGlFQUFhLENBQUE7UUFDYix5RUFBaUIsQ0FBQTtRQUNqQix5RUFBaUIsQ0FBQTtRQUNqQiwyRUFBa0IsQ0FBQTtRQUNsQiw2RUFBbUIsQ0FBQTtRQUNuQixtRkFBc0IsQ0FBQTtJQUN2QixDQUFDLEVBWGlCLFlBQVksNEJBQVosWUFBWSxRQVc3QjtJQUVELElBQWtCLHFCQUtqQjtJQUxELFdBQWtCLHFCQUFxQjtRQUN0Qyx5RUFBUSxDQUFBO1FBQ1IsMkVBQVMsQ0FBQTtRQUNULDZFQUFVLENBQUE7UUFDVix5RUFBUSxDQUFBO0lBQ1QsQ0FBQyxFQUxpQixxQkFBcUIscUNBQXJCLHFCQUFxQixRQUt0QztJQXdIRCxJQUFZLHlCQUdYO0lBSEQsV0FBWSx5QkFBeUI7UUFDcEMsaUZBQVEsQ0FBQTtRQUNSLCtGQUFlLENBQUE7SUFDaEIsQ0FBQyxFQUhXLHlCQUF5Qix5Q0FBekIseUJBQXlCLFFBR3BDO0lBd0JELElBQWtCLGlDQVlqQjtJQVpELFdBQWtCLGlDQUFpQztRQUNsRCxtR0FBYSxDQUFBO1FBQ2Is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