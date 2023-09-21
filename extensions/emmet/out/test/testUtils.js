"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRandomFileEditor = exports.closeAllEditors = exports.deleteFile = exports.pathEquals = exports.createRandomFile = exports.rndName = void 0;
const vscode = require("vscode");
const fs = require("fs");
const os = require("os");
const path_1 = require("path");
function rndName() {
    let name = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 10; i++) {
        name += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return name;
}
exports.rndName = rndName;
function createRandomFile(contents = '', fileExtension = 'txt') {
    return new Promise((resolve, reject) => {
        const tmpFile = (0, path_1.join)(os.tmpdir(), rndName() + '.' + fileExtension);
        fs.writeFile(tmpFile, contents, (error) => {
            if (error) {
                return reject(error);
            }
            resolve(vscode.Uri.file(tmpFile));
        });
    });
}
exports.createRandomFile = createRandomFile;
function pathEquals(path1, path2) {
    if (process.platform !== 'linux') {
        path1 = path1.toLowerCase();
        path2 = path2.toLowerCase();
    }
    return path1 === path2;
}
exports.pathEquals = pathEquals;
function deleteFile(file) {
    return new Promise((resolve, reject) => {
        fs.unlink(file.fsPath, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}
exports.deleteFile = deleteFile;
function closeAllEditors() {
    return vscode.commands.executeCommand('workbench.action.closeAllEditors');
}
exports.closeAllEditors = closeAllEditors;
function withRandomFileEditor(initialContents, fileExtension = 'txt', run) {
    return createRandomFile(initialContents, fileExtension).then(file => {
        return vscode.workspace.openTextDocument(file).then(doc => {
            return vscode.window.showTextDocument(doc).then((editor) => {
                return run(editor, doc).then(_ => {
                    if (doc.isDirty) {
                        return doc.save().then(() => {
                            return deleteFile(file);
                        });
                    }
                    else {
                        return deleteFile(file);
                    }
                });
            });
        });
    });
}
exports.withRandomFileEditor = withRandomFileEditor;
//# sourceMappingURL=testUtils.js.map