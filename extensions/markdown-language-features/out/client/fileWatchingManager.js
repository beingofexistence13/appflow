"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileWatcherManager = void 0;
const vscode = require("vscode");
const vscode_uri_1 = require("vscode-uri");
const dispose_1 = require("../util/dispose");
const resourceMap_1 = require("../util/resourceMap");
const schemes_1 = require("../util/schemes");
class FileWatcherManager {
    constructor() {
        this._fileWatchers = new Map();
        this._dirWatchers = new resourceMap_1.ResourceMap();
    }
    create(id, uri, watchParentDirs, listeners) {
        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(uri, '*'), !listeners.create, !listeners.change, !listeners.delete);
        const parentDirWatchers = [];
        this._fileWatchers.set(id, { watcher, dirWatchers: parentDirWatchers });
        if (listeners.create) {
            watcher.onDidCreate(listeners.create);
        }
        if (listeners.change) {
            watcher.onDidChange(listeners.change);
        }
        if (listeners.delete) {
            watcher.onDidDelete(listeners.delete);
        }
        if (watchParentDirs && uri.scheme !== schemes_1.Schemes.untitled) {
            // We need to watch the parent directories too for when these are deleted / created
            for (let dirUri = vscode_uri_1.Utils.dirname(uri); dirUri.path.length > 1; dirUri = vscode_uri_1.Utils.dirname(dirUri)) {
                const dirWatcher = { uri: dirUri, listeners: [] };
                let parentDirWatcher = this._dirWatchers.get(dirUri);
                if (!parentDirWatcher) {
                    const glob = new vscode.RelativePattern(vscode_uri_1.Utils.dirname(dirUri), vscode_uri_1.Utils.basename(dirUri));
                    const parentWatcher = vscode.workspace.createFileSystemWatcher(glob, !listeners.create, true, !listeners.delete);
                    parentDirWatcher = { refCount: 0, watcher: parentWatcher };
                    this._dirWatchers.set(dirUri, parentDirWatcher);
                }
                parentDirWatcher.refCount++;
                if (listeners.create) {
                    dirWatcher.listeners.push(parentDirWatcher.watcher.onDidCreate(async () => {
                        // Just because the parent dir was created doesn't mean our file was created
                        try {
                            const stat = await vscode.workspace.fs.stat(uri);
                            if (stat.type === vscode.FileType.File) {
                                listeners.create();
                            }
                        }
                        catch {
                            // Noop
                        }
                    }));
                }
                if (listeners.delete) {
                    // When the parent dir is deleted, consider our file deleted too
                    // TODO: this fires if the file previously did not exist and then the parent is deleted
                    dirWatcher.listeners.push(parentDirWatcher.watcher.onDidDelete(listeners.delete));
                }
                parentDirWatchers.push(dirWatcher);
            }
        }
    }
    delete(id) {
        const entry = this._fileWatchers.get(id);
        if (entry) {
            for (const dirWatcher of entry.dirWatchers) {
                (0, dispose_1.disposeAll)(dirWatcher.listeners);
                const dirWatcherEntry = this._dirWatchers.get(dirWatcher.uri);
                if (dirWatcherEntry) {
                    if (--dirWatcherEntry.refCount <= 0) {
                        dirWatcherEntry.watcher.dispose();
                        this._dirWatchers.delete(dirWatcher.uri);
                    }
                }
            }
            entry.watcher.dispose();
        }
        this._fileWatchers.delete(id);
    }
}
exports.FileWatcherManager = FileWatcherManager;
//# sourceMappingURL=fileWatchingManager.js.map