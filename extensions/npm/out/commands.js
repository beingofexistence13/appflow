"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectAndRunScriptFromFolder = exports.runSelectedScript = void 0;
const vscode = require("vscode");
const tasks_1 = require("./tasks");
function runSelectedScript(context) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const document = editor.document;
    const contents = document.getText();
    const script = (0, tasks_1.findScriptAtPosition)(editor.document, contents, editor.selection.anchor);
    if (script) {
        (0, tasks_1.runScript)(context, script, document);
    }
    else {
        const message = vscode.l10n.t("Could not find a valid npm script at the selection.");
        vscode.window.showErrorMessage(message);
    }
}
exports.runSelectedScript = runSelectedScript;
async function selectAndRunScriptFromFolder(context, selectedFolders) {
    if (selectedFolders.length === 0) {
        return;
    }
    const selectedFolder = selectedFolders[0];
    const taskList = await (0, tasks_1.detectNpmScriptsForFolder)(context, selectedFolder);
    if (taskList && taskList.length > 0) {
        const quickPick = vscode.window.createQuickPick();
        quickPick.placeholder = 'Select an npm script to run in folder';
        quickPick.items = taskList;
        const toDispose = [];
        const pickPromise = new Promise((c) => {
            toDispose.push(quickPick.onDidAccept(() => {
                toDispose.forEach(d => d.dispose());
                c(quickPick.selectedItems[0]);
            }));
            toDispose.push(quickPick.onDidHide(() => {
                toDispose.forEach(d => d.dispose());
                c(undefined);
            }));
        });
        quickPick.show();
        const result = await pickPromise;
        quickPick.dispose();
        if (result) {
            vscode.tasks.executeTask(result.task);
        }
    }
    else {
        vscode.window.showInformationMessage(`No npm scripts found in ${selectedFolder.fsPath}`, { modal: true });
    }
}
exports.selectAndRunScriptFromFolder = selectAndRunScriptFromFolder;
//# sourceMappingURL=commands.js.map