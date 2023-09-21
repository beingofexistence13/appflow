"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const simpleBrowserManager_1 = require("./simpleBrowserManager");
const simpleBrowserView_1 = require("./simpleBrowserView");
const openApiCommand = 'simpleBrowser.api.open';
const showCommand = 'simpleBrowser.show';
const enabledHosts = new Set([
    'localhost',
    // localhost IPv4
    '127.0.0.1',
    // localhost IPv6
    '[0:0:0:0:0:0:0:1]',
    '[::1]',
    // all interfaces IPv4
    '0.0.0.0',
    // all interfaces IPv6
    '[0:0:0:0:0:0:0:0]',
    '[::]'
]);
const openerId = 'simpleBrowser.open';
function activate(context) {
    const manager = new simpleBrowserManager_1.SimpleBrowserManager(context.extensionUri);
    context.subscriptions.push(manager);
    context.subscriptions.push(vscode.window.registerWebviewPanelSerializer(simpleBrowserView_1.SimpleBrowserView.viewType, {
        deserializeWebviewPanel: async (panel, state) => {
            manager.restore(panel, state);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand(showCommand, async (url) => {
        if (!url) {
            url = await vscode.window.showInputBox({
                placeHolder: vscode.l10n.t("https://example.com"),
                prompt: vscode.l10n.t("Enter url to visit")
            });
        }
        if (url) {
            manager.show(url);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand(openApiCommand, (url, showOptions) => {
        manager.show(url, showOptions);
    }));
    context.subscriptions.push(vscode.window.registerExternalUriOpener(openerId, {
        canOpenExternalUri(uri) {
            // We have to replace the IPv6 hosts with IPv4 because URL can't handle IPv6.
            const originalUri = new URL(uri.toString(true));
            if (enabledHosts.has(originalUri.hostname)) {
                return isWeb()
                    ? vscode.ExternalUriOpenerPriority.Default
                    : vscode.ExternalUriOpenerPriority.Option;
            }
            return vscode.ExternalUriOpenerPriority.None;
        },
        openExternalUri(resolveUri) {
            return manager.show(resolveUri, {
                viewColumn: vscode.window.activeTextEditor ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active
            });
        }
    }, {
        schemes: ['http', 'https'],
        label: vscode.l10n.t("Open in simple browser"),
    }));
}
exports.activate = activate;
function isWeb() {
    // @ts-expect-error
    return typeof navigator !== 'undefined' && vscode.env.uiKind === vscode.UIKind.Web;
}
//# sourceMappingURL=extension.js.map