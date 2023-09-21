"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateShared = void 0;
const vscode = require("vscode");
const commandManager_1 = require("./commandManager");
const index_1 = require("./commands/index");
const pasteResourceProvider_1 = require("./languageFeatures/copyFiles/pasteResourceProvider");
const pasteUrlProvider_1 = require("./languageFeatures/copyFiles/pasteUrlProvider");
const diagnostics_1 = require("./languageFeatures/diagnostics");
const dropResourceProvider_1 = require("./languageFeatures/copyFiles/dropResourceProvider");
const fileReferences_1 = require("./languageFeatures/fileReferences");
const linkUpdater_1 = require("./languageFeatures/linkUpdater");
const documentRenderer_1 = require("./preview/documentRenderer");
const previewManager_1 = require("./preview/previewManager");
const security_1 = require("./preview/security");
const telemetryReporter_1 = require("./telemetryReporter");
const openDocumentLink_1 = require("./util/openDocumentLink");
function activateShared(context, client, engine, logger, contributions) {
    const telemetryReporter = (0, telemetryReporter_1.loadDefaultTelemetryReporter)();
    context.subscriptions.push(telemetryReporter);
    const cspArbiter = new security_1.ExtensionContentSecurityPolicyArbiter(context.globalState, context.workspaceState);
    const commandManager = new commandManager_1.CommandManager();
    const opener = new openDocumentLink_1.MdLinkOpener(client);
    const contentProvider = new documentRenderer_1.MdDocumentRenderer(engine, context, cspArbiter, contributions, logger);
    const previewManager = new previewManager_1.MarkdownPreviewManager(contentProvider, logger, contributions, opener);
    context.subscriptions.push(previewManager);
    context.subscriptions.push(registerMarkdownLanguageFeatures(client, commandManager));
    context.subscriptions.push((0, index_1.registerMarkdownCommands)(commandManager, previewManager, telemetryReporter, cspArbiter, engine));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
        previewManager.updateConfiguration();
    }));
}
exports.activateShared = activateShared;
function registerMarkdownLanguageFeatures(client, commandManager) {
    const selector = { language: 'markdown', scheme: '*' };
    return vscode.Disposable.from(
    // Language features
    (0, diagnostics_1.registerDiagnosticSupport)(selector, commandManager), (0, dropResourceProvider_1.registerDropIntoEditorSupport)(selector), (0, fileReferences_1.registerFindFileReferenceSupport)(commandManager, client), (0, pasteResourceProvider_1.registerPasteSupport)(selector), (0, pasteUrlProvider_1.registerLinkPasteSupport)(selector), (0, linkUpdater_1.registerUpdateLinksOnRename)(client));
}
//# sourceMappingURL=extension.shared.js.map