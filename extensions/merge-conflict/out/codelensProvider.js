"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class MergeConflictCodeLensProvider {
    constructor(trackerService) {
        this.tracker = trackerService.createTracker('codelens');
    }
    begin(config) {
        this.config = config;
        if (this.config.enableCodeLens) {
            this.registerCodeLensProvider();
        }
    }
    configurationUpdated(updatedConfig) {
        if (updatedConfig.enableCodeLens === false && this.codeLensRegistrationHandle) {
            this.codeLensRegistrationHandle.dispose();
            this.codeLensRegistrationHandle = null;
        }
        else if (updatedConfig.enableCodeLens === true && !this.codeLensRegistrationHandle) {
            this.registerCodeLensProvider();
        }
        this.config = updatedConfig;
    }
    dispose() {
        if (this.codeLensRegistrationHandle) {
            this.codeLensRegistrationHandle.dispose();
            this.codeLensRegistrationHandle = null;
        }
    }
    async provideCodeLenses(document, _token) {
        if (!this.config || !this.config.enableCodeLens) {
            return null;
        }
        const conflicts = await this.tracker.getConflicts(document);
        const conflictsCount = conflicts?.length ?? 0;
        vscode.commands.executeCommand('setContext', 'mergeConflictsCount', conflictsCount);
        if (!conflictsCount) {
            return null;
        }
        const items = [];
        conflicts.forEach(conflict => {
            const acceptCurrentCommand = {
                command: 'merge-conflict.accept.current',
                title: vscode.l10n.t("Accept Current Change"),
                arguments: ['known-conflict', conflict]
            };
            const acceptIncomingCommand = {
                command: 'merge-conflict.accept.incoming',
                title: vscode.l10n.t("Accept Incoming Change"),
                arguments: ['known-conflict', conflict]
            };
            const acceptBothCommand = {
                command: 'merge-conflict.accept.both',
                title: vscode.l10n.t("Accept Both Changes"),
                arguments: ['known-conflict', conflict]
            };
            const diffCommand = {
                command: 'merge-conflict.compare',
                title: vscode.l10n.t("Compare Changes"),
                arguments: [conflict]
            };
            const range = document.lineAt(conflict.range.start.line).range;
            items.push(new vscode.CodeLens(range, acceptCurrentCommand), new vscode.CodeLens(range, acceptIncomingCommand), new vscode.CodeLens(range, acceptBothCommand), new vscode.CodeLens(range, diffCommand));
        });
        return items;
    }
    registerCodeLensProvider() {
        this.codeLensRegistrationHandle = vscode.languages.registerCodeLensProvider([
            { scheme: 'file' },
            { scheme: 'vscode-vfs' },
            { scheme: 'untitled' },
            { scheme: 'vscode-userdata' },
        ], this);
    }
}
exports.default = MergeConflictCodeLensProvider;
//# sourceMappingURL=codelensProvider.js.map