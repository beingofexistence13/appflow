"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const vscode = __importStar(require("vscode"));
const api_1 = require("../tsServer/api");
const protocol_const_1 = require("../tsServer/protocol/protocol.const");
const typeConverters = __importStar(require("../typeConverters"));
const typescriptService_1 = require("../typescriptService");
const cancellation_1 = require("../utils/cancellation");
const dependentRegistration_1 = require("./util/dependentRegistration");
const organizeImportsCommand = {
    ids: ['typescript.organizeImports'],
    title: vscode.l10n.t("Organize Imports"),
    kind: vscode.CodeActionKind.SourceOrganizeImports,
    mode: protocol_const_1.OrganizeImportsMode.All,
};
const sortImportsCommand = {
    ids: ['typescript.sortImports', 'javascript.sortImports'],
    minVersion: api_1.API.v430,
    title: vscode.l10n.t("Sort Imports"),
    kind: vscode.CodeActionKind.Source.append('sortImports'),
    mode: protocol_const_1.OrganizeImportsMode.SortAndCombine,
};
const removeUnusedImportsCommand = {
    ids: ['typescript.removeUnusedImports', 'javascript.removeUnusedImports'],
    minVersion: api_1.API.v490,
    title: vscode.l10n.t("Remove Unused Imports"),
    kind: vscode.CodeActionKind.Source.append('removeUnusedImports'),
    mode: protocol_const_1.OrganizeImportsMode.RemoveUnused,
};
class OrganizeImportsCommand {
    constructor(id, commandMetadata, client, telemetryReporter) {
        this.id = id;
        this.commandMetadata = commandMetadata;
        this.client = client;
        this.telemetryReporter = telemetryReporter;
    }
    async execute(file) {
        /* __GDPR__
            "organizeImports.execute" : {
                "owner": "mjbvz",
                "${include}": [
                    "${TypeScriptCommonProperties}"
                ]
            }
        */
        this.telemetryReporter.logTelemetry('organizeImports.execute', {});
        if (!file) {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showErrorMessage(vscode.l10n.t("Organize Imports failed. No resource provided."));
                return;
            }
            const resource = activeEditor.document.uri;
            const document = await vscode.workspace.openTextDocument(resource);
            const openedFiledPath = this.client.toOpenTsFilePath(document);
            if (!openedFiledPath) {
                vscode.window.showErrorMessage(vscode.l10n.t("Organize Imports failed. Unknown file type."));
                return;
            }
            file = openedFiledPath;
        }
        const args = {
            scope: {
                type: 'file',
                args: {
                    file
                }
            },
            // Deprecated in 4.9; `mode` takes priority
            skipDestructiveCodeActions: this.commandMetadata.mode === protocol_const_1.OrganizeImportsMode.SortAndCombine,
            mode: typeConverters.OrganizeImportsMode.toProtocolOrganizeImportsMode(this.commandMetadata.mode),
        };
        const response = await this.client.interruptGetErr(() => this.client.execute('organizeImports', args, cancellation_1.nulToken));
        if (response.type !== 'response' || !response.body) {
            return;
        }
        if (response.body.length) {
            const edits = typeConverters.WorkspaceEdit.fromFileCodeEdits(this.client, response.body);
            return vscode.workspace.applyEdit(edits);
        }
    }
}
class ImportsCodeActionProvider {
    constructor(client, commandMetadata, commandManager, fileConfigManager, telemetryReporter) {
        this.client = client;
        this.commandMetadata = commandMetadata;
        this.fileConfigManager = fileConfigManager;
        for (const id of commandMetadata.ids) {
            commandManager.register(new OrganizeImportsCommand(id, commandMetadata, client, telemetryReporter));
        }
    }
    provideCodeActions(document, _range, context, token) {
        const file = this.client.toOpenTsFilePath(document);
        if (!file) {
            return [];
        }
        if (!context.only?.contains(this.commandMetadata.kind)) {
            return [];
        }
        this.fileConfigManager.ensureConfigurationForDocument(document, token);
        const action = new vscode.CodeAction(this.commandMetadata.title, this.commandMetadata.kind);
        action.command = { title: '', command: this.commandMetadata.ids[0], arguments: [file] };
        return [action];
    }
}
function register(selector, client, commandManager, fileConfigurationManager, telemetryReporter) {
    const disposables = [];
    for (const command of [organizeImportsCommand, sortImportsCommand, removeUnusedImportsCommand]) {
        disposables.push((0, dependentRegistration_1.conditionalRegistration)([
            (0, dependentRegistration_1.requireMinVersion)(client, command.minVersion ?? api_1.API.defaultVersion),
            (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.Semantic),
        ], () => {
            const provider = new ImportsCodeActionProvider(client, command, commandManager, fileConfigurationManager, telemetryReporter);
            return vscode.languages.registerCodeActionsProvider(selector.semantic, provider, {
                providedCodeActionKinds: [command.kind]
            });
        }));
    }
    return vscode.Disposable.from(...disposables);
}
exports.register = register;
//# sourceMappingURL=organizeImports.js.map