"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitEditor = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const path = require("path");
const vscode_1 = require("vscode");
const util_1 = require("./util");
class GitEditor {
    constructor(ipc) {
        this.disposable = util_1.EmptyDisposable;
        this.featureDescription = 'git editor';
        if (ipc) {
            this.disposable = ipc.registerHandler('git-editor', this);
        }
        this.env = {
            GIT_EDITOR: `"${path.join(__dirname, ipc ? 'git-editor.sh' : 'git-editor-empty.sh')}"`,
            VSCODE_GIT_EDITOR_NODE: process.execPath,
            VSCODE_GIT_EDITOR_EXTRA_ARGS: (process.versions['electron'] && process.versions['microsoft-build']) ? '--ms-enable-electron-run-as-node' : '',
            VSCODE_GIT_EDITOR_MAIN: path.join(__dirname, 'git-editor-main.js')
        };
    }
    async handle({ commitMessagePath }) {
        if (commitMessagePath) {
            const uri = vscode_1.Uri.file(commitMessagePath);
            const doc = await vscode_1.workspace.openTextDocument(uri);
            await vscode_1.window.showTextDocument(doc, { preview: false });
            return new Promise((c) => {
                const onDidClose = vscode_1.window.tabGroups.onDidChangeTabs(async (tabs) => {
                    if (tabs.closed.some(t => t.input instanceof vscode_1.TabInputText && t.input.uri.toString() === uri.toString())) {
                        onDidClose.dispose();
                        return c(true);
                    }
                });
            });
        }
    }
    getEnv() {
        const config = vscode_1.workspace.getConfiguration('git');
        return config.get('useEditorAsCommitInput') ? this.env : {};
    }
    getTerminalEnv() {
        const config = vscode_1.workspace.getConfiguration('git');
        return config.get('useEditorAsCommitInput') && config.get('terminalGitEditor') ? this.env : {};
    }
    dispose() {
        this.disposable.dispose();
    }
}
exports.GitEditor = GitEditor;
//# sourceMappingURL=gitEditor.js.map