"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const github_1 = require("./github");
function initGHES(context, uriHandler) {
    const settingValue = vscode.workspace.getConfiguration().get('github-enterprise.uri');
    if (!settingValue) {
        return undefined;
    }
    // validate user value
    let uri;
    try {
        uri = vscode.Uri.parse(settingValue, true);
    }
    catch (e) {
        vscode.window.showErrorMessage(vscode.l10n.t('GitHub Enterprise Server URI is not a valid URI: {0}', e.message ?? e));
        return;
    }
    const githubEnterpriseAuthProvider = new github_1.GitHubAuthenticationProvider(context, uriHandler, uri);
    context.subscriptions.push(githubEnterpriseAuthProvider);
    return githubEnterpriseAuthProvider;
}
function activate(context) {
    const uriHandler = new github_1.UriEventHandler();
    context.subscriptions.push(uriHandler);
    context.subscriptions.push(vscode.window.registerUriHandler(uriHandler));
    context.subscriptions.push(new github_1.GitHubAuthenticationProvider(context, uriHandler));
    let githubEnterpriseAuthProvider = initGHES(context, uriHandler);
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('github-enterprise.uri')) {
            if (vscode.workspace.getConfiguration().get('github-enterprise.uri')) {
                githubEnterpriseAuthProvider?.dispose();
                githubEnterpriseAuthProvider = initGHES(context, uriHandler);
            }
        }
    }));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map