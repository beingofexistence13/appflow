"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaPreview = exports.reopenAsText = void 0;
const vscode = require("vscode");
const vscode_uri_1 = require("vscode-uri");
const dispose_1 = require("./util/dispose");
function reopenAsText(resource, viewColumn) {
    vscode.commands.executeCommand('vscode.openWith', resource, 'default', viewColumn);
}
exports.reopenAsText = reopenAsText;
class MediaPreview extends dispose_1.Disposable {
    constructor(extensionRoot, resource, webviewEditor, binarySizeStatusBarEntry) {
        super();
        this.resource = resource;
        this.webviewEditor = webviewEditor;
        this.binarySizeStatusBarEntry = binarySizeStatusBarEntry;
        this.previewState = 1 /* PreviewState.Visible */;
        webviewEditor.webview.options = {
            enableScripts: true,
            enableForms: false,
            localResourceRoots: [
                vscode_uri_1.Utils.dirname(resource),
                extensionRoot,
            ]
        };
        this._register(webviewEditor.onDidChangeViewState(() => {
            this.updateState();
        }));
        this._register(webviewEditor.onDidDispose(() => {
            this.previewState = 0 /* PreviewState.Disposed */;
            this.dispose();
        }));
        const watcher = this._register(vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(resource, '*')));
        this._register(watcher.onDidChange(e => {
            if (e.toString() === this.resource.toString()) {
                this.updateBinarySize();
                this.render();
            }
        }));
        this._register(watcher.onDidDelete(e => {
            if (e.toString() === this.resource.toString()) {
                this.webviewEditor.dispose();
            }
        }));
    }
    dispose() {
        super.dispose();
        this.binarySizeStatusBarEntry.hide(this);
    }
    updateBinarySize() {
        vscode.workspace.fs.stat(this.resource).then(({ size }) => {
            this._binarySize = size;
            this.updateState();
        });
    }
    async render() {
        if (this.previewState === 0 /* PreviewState.Disposed */) {
            return;
        }
        const content = await this.getWebviewContents();
        if (this.previewState === 0 /* PreviewState.Disposed */) {
            return;
        }
        this.webviewEditor.webview.html = content;
    }
    updateState() {
        if (this.previewState === 0 /* PreviewState.Disposed */) {
            return;
        }
        if (this.webviewEditor.active) {
            this.previewState = 2 /* PreviewState.Active */;
            this.binarySizeStatusBarEntry.show(this, this._binarySize);
        }
        else {
            this.binarySizeStatusBarEntry.hide(this);
            this.previewState = 1 /* PreviewState.Visible */;
        }
    }
}
exports.MediaPreview = MediaPreview;
//# sourceMappingURL=mediaPreview.js.map