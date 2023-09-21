"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFindFileReferenceSupport = exports.convertRange = exports.FindFileReferencesCommand = void 0;
const vscode = require("vscode");
class FindFileReferencesCommand {
    constructor(_client) {
        this._client = _client;
        this.id = 'markdown.findAllFileReferences';
    }
    async execute(resource) {
        resource ?? (resource = vscode.window.activeTextEditor?.document.uri);
        if (!resource) {
            vscode.window.showErrorMessage(vscode.l10n.t("Find file references failed. No resource provided."));
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: vscode.l10n.t("Finding file references")
        }, async (_progress, token) => {
            const locations = (await this._client.getReferencesToFileInWorkspace(resource, token)).map(loc => {
                return new vscode.Location(vscode.Uri.parse(loc.uri), convertRange(loc.range));
            });
            const config = vscode.workspace.getConfiguration('references');
            const existingSetting = config.inspect('preferredLocation');
            await config.update('preferredLocation', 'view');
            try {
                await vscode.commands.executeCommand('editor.action.showReferences', resource, new vscode.Position(0, 0), locations);
            }
            finally {
                await config.update('preferredLocation', existingSetting?.workspaceFolderValue ?? existingSetting?.workspaceValue);
            }
        });
    }
}
exports.FindFileReferencesCommand = FindFileReferencesCommand;
function convertRange(range) {
    return new vscode.Range(range.start.line, range.start.character, range.end.line, range.end.character);
}
exports.convertRange = convertRange;
function registerFindFileReferenceSupport(commandManager, client) {
    return commandManager.register(new FindFileReferencesCommand(client));
}
exports.registerFindFileReferenceSupport = registerFindFileReferenceSupport;
//# sourceMappingURL=fileReferences.js.map