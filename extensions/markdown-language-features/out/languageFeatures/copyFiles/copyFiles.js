"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveCopyDestination = exports.NewFilePathGenerator = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const picomatch = require("picomatch");
const vscode = require("vscode");
const vscode_uri_1 = require("vscode-uri");
const document_1 = require("../../util/document");
function getCopyFileConfiguration(document) {
    const config = vscode.workspace.getConfiguration('markdown', document);
    return {
        destination: config.get('copyFiles.destination') ?? {},
        overwriteBehavior: readOverwriteBehavior(config),
    };
}
function readOverwriteBehavior(config) {
    switch (config.get('copyFiles.overwriteBehavior')) {
        case 'overwrite': return 'overwrite';
        default: return 'nameIncrementally';
    }
}
class NewFilePathGenerator {
    constructor() {
        this._usedPaths = new Set();
    }
    async getNewFilePath(document, file, token) {
        const config = getCopyFileConfiguration(document);
        const desiredPath = getDesiredNewFilePath(config, document, file);
        const root = vscode_uri_1.Utils.dirname(desiredPath);
        const ext = vscode_uri_1.Utils.extname(desiredPath);
        let baseName = vscode_uri_1.Utils.basename(desiredPath);
        baseName = baseName.slice(0, baseName.length - ext.length);
        for (let i = 0;; ++i) {
            if (token.isCancellationRequested) {
                return undefined;
            }
            const name = i === 0 ? baseName : `${baseName}-${i}`;
            const uri = vscode.Uri.joinPath(root, name + ext);
            if (this._wasPathAlreadyUsed(uri)) {
                continue;
            }
            // Try overwriting if it already exists
            if (config.overwriteBehavior === 'overwrite') {
                this._usedPaths.add(uri.toString());
                return { uri, overwrite: true };
            }
            // Otherwise we need to check the fs to see if it exists
            try {
                await vscode.workspace.fs.stat(uri);
            }
            catch {
                if (!this._wasPathAlreadyUsed(uri)) {
                    // Does not exist
                    this._usedPaths.add(uri.toString());
                    return { uri, overwrite: false };
                }
            }
        }
    }
    _wasPathAlreadyUsed(uri) {
        return this._usedPaths.has(uri.toString());
    }
}
exports.NewFilePathGenerator = NewFilePathGenerator;
function getDesiredNewFilePath(config, document, file) {
    const docUri = (0, document_1.getParentDocumentUri)(document.uri);
    for (const [rawGlob, rawDest] of Object.entries(config.destination)) {
        for (const glob of parseGlob(rawGlob)) {
            if (picomatch.isMatch(docUri.path, glob, { dot: true })) {
                return resolveCopyDestination(docUri, file.name, rawDest, uri => vscode.workspace.getWorkspaceFolder(uri)?.uri);
            }
        }
    }
    // Default to next to current file
    return vscode.Uri.joinPath(vscode_uri_1.Utils.dirname(docUri), file.name);
}
function parseGlob(rawGlob) {
    if (rawGlob.startsWith('/')) {
        // Anchor to workspace folders
        return (vscode.workspace.workspaceFolders ?? []).map(folder => vscode.Uri.joinPath(folder.uri, rawGlob).path);
    }
    // Relative path, so implicitly track on ** to match everything
    if (!rawGlob.startsWith('**')) {
        return ['**/' + rawGlob];
    }
    return [rawGlob];
}
function resolveCopyDestination(documentUri, fileName, dest, getWorkspaceFolder) {
    const resolvedDest = resolveCopyDestinationSetting(documentUri, fileName, dest, getWorkspaceFolder);
    if (resolvedDest.startsWith('/')) {
        // Absolute path
        return vscode_uri_1.Utils.resolvePath(documentUri, resolvedDest);
    }
    // Relative to document
    const dirName = vscode_uri_1.Utils.dirname(documentUri);
    return vscode_uri_1.Utils.resolvePath(dirName, resolvedDest);
}
exports.resolveCopyDestination = resolveCopyDestination;
function resolveCopyDestinationSetting(documentUri, fileName, dest, getWorkspaceFolder) {
    let outDest = dest.trim();
    if (!outDest) {
        outDest = '${fileName}';
    }
    // Destination that start with `/` implicitly means go to workspace root
    if (outDest.startsWith('/')) {
        outDest = '${documentWorkspaceFolder}/' + outDest.slice(1);
    }
    // Destination that ends with `/` implicitly needs a fileName
    if (outDest.endsWith('/')) {
        outDest += '${fileName}';
    }
    const documentDirName = vscode_uri_1.Utils.dirname(documentUri);
    const documentBaseName = vscode_uri_1.Utils.basename(documentUri);
    const documentExtName = vscode_uri_1.Utils.extname(documentUri);
    const workspaceFolder = getWorkspaceFolder(documentUri);
    const vars = new Map([
        ['documentDirName', documentDirName.path],
        ['documentFileName', documentBaseName],
        ['documentBaseName', documentBaseName.slice(0, documentBaseName.length - documentExtName.length)],
        ['documentExtName', documentExtName.replace('.', '')],
        // Workspace
        ['documentWorkspaceFolder', (workspaceFolder ?? documentDirName).path],
        // File
        ['fileName', fileName], // Full file name
    ]);
    return outDest.replaceAll(/\$\{(\w+)(?:\/([^\}]+?)\/([^\}]+?)\/)?\}/g, (_, name, pattern, replacement) => {
        const entry = vars.get(name);
        if (!entry) {
            return '';
        }
        if (pattern && replacement) {
            return entry.replace(new RegExp(pattern), replacement);
        }
        return entry;
    });
}
//# sourceMappingURL=copyFiles.js.map