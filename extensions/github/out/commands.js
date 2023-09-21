"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const vscode = require("vscode");
const publish_1 = require("./publish");
const util_1 = require("./util");
const links_1 = require("./links");
async function copyVscodeDevLink(gitAPI, useSelection, context, includeRange = true) {
    try {
        const permalink = await (0, links_1.getLink)(gitAPI, useSelection, true, (0, links_1.getVscodeDevHost)(), 'headlink', context, includeRange);
        if (permalink) {
            return vscode.env.clipboard.writeText(permalink);
        }
    }
    catch (err) {
        if (!(err instanceof vscode.CancellationError)) {
            vscode.window.showErrorMessage(err.message);
        }
    }
}
async function openVscodeDevLink(gitAPI) {
    try {
        const headlink = await (0, links_1.getLink)(gitAPI, true, false, (0, links_1.getVscodeDevHost)(), 'headlink');
        return headlink ? vscode.Uri.parse(headlink) : undefined;
    }
    catch (err) {
        if (!(err instanceof vscode.CancellationError)) {
            vscode.window.showErrorMessage(err.message);
        }
        return undefined;
    }
}
function registerCommands(gitAPI) {
    const disposables = new util_1.DisposableStore();
    disposables.add(vscode.commands.registerCommand('github.publish', async () => {
        try {
            (0, publish_1.publishRepository)(gitAPI);
        }
        catch (err) {
            vscode.window.showErrorMessage(err.message);
        }
    }));
    disposables.add(vscode.commands.registerCommand('github.copyVscodeDevLink', async (context) => {
        return copyVscodeDevLink(gitAPI, true, context);
    }));
    disposables.add(vscode.commands.registerCommand('github.copyVscodeDevLinkFile', async (context) => {
        return copyVscodeDevLink(gitAPI, false, context);
    }));
    disposables.add(vscode.commands.registerCommand('github.copyVscodeDevLinkWithoutRange', async (context) => {
        return copyVscodeDevLink(gitAPI, true, context, false);
    }));
    disposables.add(vscode.commands.registerCommand('github.openOnVscodeDev', async () => {
        return openVscodeDevLink(gitAPI);
    }));
    return disposables;
}
exports.registerCommands = registerCommands;
//# sourceMappingURL=commands.js.map