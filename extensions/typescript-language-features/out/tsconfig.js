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
exports.openProjectConfigForFile = exports.openProjectConfigOrPromptToCreate = exports.openOrCreateConfig = exports.inferredProjectCompilerOptions = exports.isImplicitProjectConfigFile = void 0;
const vscode = __importStar(require("vscode"));
const cancellation_1 = require("./utils/cancellation");
function isImplicitProjectConfigFile(configFileName) {
    return configFileName.startsWith('/dev/null/');
}
exports.isImplicitProjectConfigFile = isImplicitProjectConfigFile;
const defaultProjectConfig = Object.freeze({
    module: 'ESNext',
    moduleResolution: 'Node',
    target: 'ES2020',
    jsx: 'react',
});
function inferredProjectCompilerOptions(projectType, serviceConfig) {
    const projectConfig = { ...defaultProjectConfig };
    if (serviceConfig.implicitProjectConfiguration.checkJs) {
        projectConfig.checkJs = true;
        if (projectType === 0 /* ProjectType.TypeScript */) {
            projectConfig.allowJs = true;
        }
    }
    if (serviceConfig.implicitProjectConfiguration.experimentalDecorators) {
        projectConfig.experimentalDecorators = true;
    }
    if (serviceConfig.implicitProjectConfiguration.strictNullChecks) {
        projectConfig.strictNullChecks = true;
    }
    if (serviceConfig.implicitProjectConfiguration.strictFunctionTypes) {
        projectConfig.strictFunctionTypes = true;
    }
    if (serviceConfig.implicitProjectConfiguration.module) {
        projectConfig.module = serviceConfig.implicitProjectConfiguration.module;
    }
    if (serviceConfig.implicitProjectConfiguration.target) {
        projectConfig.target = serviceConfig.implicitProjectConfiguration.target;
    }
    if (projectType === 0 /* ProjectType.TypeScript */) {
        projectConfig.sourceMap = true;
    }
    return projectConfig;
}
exports.inferredProjectCompilerOptions = inferredProjectCompilerOptions;
function inferredProjectConfigSnippet(projectType, config) {
    const baseConfig = inferredProjectCompilerOptions(projectType, config);
    const compilerOptions = Object.keys(baseConfig).map(key => `"${key}": ${JSON.stringify(baseConfig[key])}`);
    return new vscode.SnippetString(`{
	"compilerOptions": {
		${compilerOptions.join(',\n\t\t')}$0
	},
	"exclude": [
		"node_modules",
		"**/node_modules/*"
	]
}`);
}
async function openOrCreateConfig(projectType, rootPath, configuration) {
    const configFile = vscode.Uri.joinPath(rootPath, projectType === 0 /* ProjectType.TypeScript */ ? 'tsconfig.json' : 'jsconfig.json');
    const col = vscode.window.activeTextEditor?.viewColumn;
    try {
        const doc = await vscode.workspace.openTextDocument(configFile);
        return vscode.window.showTextDocument(doc, col);
    }
    catch {
        const doc = await vscode.workspace.openTextDocument(configFile.with({ scheme: 'untitled' }));
        const editor = await vscode.window.showTextDocument(doc, col);
        if (editor.document.getText().length === 0) {
            await editor.insertSnippet(inferredProjectConfigSnippet(projectType, configuration));
        }
        return editor;
    }
}
exports.openOrCreateConfig = openOrCreateConfig;
async function openProjectConfigOrPromptToCreate(projectType, client, rootPath, configFilePath) {
    if (!isImplicitProjectConfigFile(configFilePath)) {
        const doc = await vscode.workspace.openTextDocument(client.toResource(configFilePath));
        vscode.window.showTextDocument(doc, vscode.window.activeTextEditor?.viewColumn);
        return;
    }
    const CreateConfigItem = {
        title: projectType === 0 /* ProjectType.TypeScript */
            ? vscode.l10n.t("Configure tsconfig.json")
            : vscode.l10n.t("Configure jsconfig.json"),
    };
    const selected = await vscode.window.showInformationMessage((projectType === 0 /* ProjectType.TypeScript */
        ? vscode.l10n.t("File is not part of a TypeScript project. View the [tsconfig.json documentation]({0}) to learn more.", 'https://go.microsoft.com/fwlink/?linkid=841896')
        : vscode.l10n.t("File is not part of a JavaScript project. View the [jsconfig.json documentation]({0}) to learn more.", 'https://go.microsoft.com/fwlink/?linkid=759670')), CreateConfigItem);
    switch (selected) {
        case CreateConfigItem:
            openOrCreateConfig(projectType, rootPath, client.configuration);
            return;
    }
}
exports.openProjectConfigOrPromptToCreate = openProjectConfigOrPromptToCreate;
async function openProjectConfigForFile(projectType, client, resource) {
    const rootPath = client.getWorkspaceRootForResource(resource);
    if (!rootPath) {
        vscode.window.showInformationMessage(vscode.l10n.t("Please open a folder in VS Code to use a TypeScript or JavaScript project"));
        return;
    }
    const file = client.toTsFilePath(resource);
    // TSServer errors when 'projectInfo' is invoked on a non js/ts file
    if (!file || !client.toTsFilePath(resource)) {
        vscode.window.showWarningMessage(vscode.l10n.t("Could not determine TypeScript or JavaScript project. Unsupported file type"));
        return;
    }
    let res;
    try {
        res = await client.execute('projectInfo', { file, needFileNameList: false }, cancellation_1.nulToken);
    }
    catch {
        // noop
    }
    if (res?.type !== 'response' || !res.body) {
        vscode.window.showWarningMessage(vscode.l10n.t("Could not determine TypeScript or JavaScript project"));
        return;
    }
    return openProjectConfigOrPromptToCreate(projectType, client, rootPath, res.body.configFileName);
}
exports.openProjectConfigForFile = openProjectConfigForFile;
//# sourceMappingURL=tsconfig.js.map