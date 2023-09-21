"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDiagnosticSupport = exports.DiagnosticCode = void 0;
const vscode = require("vscode");
// Copied from markdown language service
var DiagnosticCode;
(function (DiagnosticCode) {
    DiagnosticCode["link_noSuchReferences"] = "link.no-such-reference";
    DiagnosticCode["link_noSuchHeaderInOwnFile"] = "link.no-such-header-in-own-file";
    DiagnosticCode["link_noSuchFile"] = "link.no-such-file";
    DiagnosticCode["link_noSuchHeaderInFile"] = "link.no-such-header-in-file";
})(DiagnosticCode || (exports.DiagnosticCode = DiagnosticCode = {}));
class AddToIgnoreLinksQuickFixProvider {
    static register(selector, commandManager) {
        const reg = vscode.languages.registerCodeActionsProvider(selector, new AddToIgnoreLinksQuickFixProvider(), AddToIgnoreLinksQuickFixProvider._metadata);
        const commandReg = commandManager.register({
            id: AddToIgnoreLinksQuickFixProvider._addToIgnoreLinksCommandId,
            execute(resource, path) {
                const settingId = 'validate.ignoredLinks';
                const config = vscode.workspace.getConfiguration('markdown', resource);
                const paths = new Set(config.get(settingId, []));
                paths.add(path);
                config.update(settingId, [...paths], vscode.ConfigurationTarget.WorkspaceFolder);
            }
        });
        return vscode.Disposable.from(reg, commandReg);
    }
    provideCodeActions(document, _range, context, _token) {
        const fixes = [];
        for (const diagnostic of context.diagnostics) {
            switch (diagnostic.code) {
                case DiagnosticCode.link_noSuchReferences:
                case DiagnosticCode.link_noSuchHeaderInOwnFile:
                case DiagnosticCode.link_noSuchFile:
                case DiagnosticCode.link_noSuchHeaderInFile: {
                    const hrefText = diagnostic.data?.hrefText;
                    if (hrefText) {
                        const fix = new vscode.CodeAction(vscode.l10n.t("Exclude '{0}' from link validation.", hrefText), vscode.CodeActionKind.QuickFix);
                        fix.command = {
                            command: AddToIgnoreLinksQuickFixProvider._addToIgnoreLinksCommandId,
                            title: '',
                            arguments: [document.uri, hrefText],
                        };
                        fixes.push(fix);
                    }
                    break;
                }
            }
        }
        return fixes;
    }
}
AddToIgnoreLinksQuickFixProvider._addToIgnoreLinksCommandId = '_markdown.addToIgnoreLinks';
AddToIgnoreLinksQuickFixProvider._metadata = {
    providedCodeActionKinds: [
        vscode.CodeActionKind.QuickFix
    ],
};
function registerDiagnosticSupport(selector, commandManager) {
    return AddToIgnoreLinksQuickFixProvider.register(selector, commandManager);
}
exports.registerDiagnosticSupport = registerDiagnosticSupport;
//# sourceMappingURL=diagnostics.js.map