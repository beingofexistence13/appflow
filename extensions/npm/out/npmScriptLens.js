"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.NpmScriptLensProvider = void 0;
const path = require("path");
const vscode_1 = require("vscode");
const preferred_pm_1 = require("./preferred-pm");
const readScripts_1 = require("./readScripts");
const getFreshLensLocation = () => vscode_1.workspace.getConfiguration().get("debug.javascript.codelens.npmScripts" /* Constants.ConfigKey */);
/**
 * Npm script lens provider implementation. Can show a "Debug" text above any
 * npm script, or the npm scripts section.
 */
class NpmScriptLensProvider {
    constructor() {
        this.lensLocation = getFreshLensLocation();
        this.changeEmitter = new vscode_1.EventEmitter();
        this.subscriptions = [];
        /**
         * @inheritdoc
         */
        this.onDidChangeCodeLenses = this.changeEmitter.event;
        this.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(evt => {
            if (evt.affectsConfiguration("debug.javascript.codelens.npmScripts" /* Constants.ConfigKey */)) {
                this.lensLocation = getFreshLensLocation();
                this.changeEmitter.fire();
            }
        }), vscode_1.languages.registerCodeLensProvider({
            language: 'json',
            pattern: '**/package.json',
        }, this));
    }
    /**
     * @inheritdoc
     */
    async provideCodeLenses(document) {
        if (this.lensLocation === 'never') {
            return [];
        }
        const tokens = (0, readScripts_1.readScripts)(document);
        if (!tokens) {
            return [];
        }
        const title = '$(debug-start) ' + vscode_1.l10n.t("Debug");
        const cwd = path.dirname(document.uri.fsPath);
        if (this.lensLocation === 'top') {
            return [
                new vscode_1.CodeLens(tokens.location.range, {
                    title,
                    command: 'extension.js-debug.npmScript',
                    arguments: [cwd],
                }),
            ];
        }
        if (this.lensLocation === 'all') {
            const packageManager = await (0, preferred_pm_1.findPreferredPM)(vscode_1.Uri.joinPath(document.uri, '..').fsPath);
            return tokens.scripts.map(({ name, nameRange }) => new vscode_1.CodeLens(nameRange, {
                title,
                command: 'extension.js-debug.createDebuggerTerminal',
                arguments: [`${packageManager.name} run ${name}`, vscode_1.workspace.getWorkspaceFolder(document.uri), { cwd }],
            }));
        }
        return [];
    }
    /**
     * @inheritdoc
     */
    dispose() {
        this.subscriptions.forEach(s => s.dispose());
    }
}
exports.NpmScriptLensProvider = NpmScriptLensProvider;
//# sourceMappingURL=npmScriptLens.js.map