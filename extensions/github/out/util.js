"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositoryHasGitHubRemote = exports.getRepositoryFromQuery = exports.getRepositoryFromUrl = exports.DisposableStore = void 0;
class DisposableStore {
    constructor() {
        this.disposables = new Set();
    }
    add(disposable) {
        this.disposables.add(disposable);
    }
    dispose() {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables.clear();
    }
}
exports.DisposableStore = DisposableStore;
function getRepositoryFromUrl(url) {
    const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/i.exec(url)
        || /^git@github\.com:([^/]+)\/([^/]+?)(\.git)?$/i.exec(url);
    return match ? { owner: match[1], repo: match[2] } : undefined;
}
exports.getRepositoryFromUrl = getRepositoryFromUrl;
function getRepositoryFromQuery(query) {
    const match = /^([^/]+)\/([^/]+)$/i.exec(query);
    return match ? { owner: match[1], repo: match[2] } : undefined;
}
exports.getRepositoryFromQuery = getRepositoryFromQuery;
function repositoryHasGitHubRemote(repository) {
    return !!repository.state.remotes.find(remote => remote.fetchUrl ? getRepositoryFromUrl(remote.fetchUrl) : undefined);
}
exports.repositoryHasGitHubRemote = repositoryHasGitHubRemote;
//# sourceMappingURL=util.js.map