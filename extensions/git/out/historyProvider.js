"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHistoryProvider = void 0;
const vscode_1 = require("vscode");
const uri_1 = require("./uri");
const actionButton_1 = require("./actionButton");
class GitHistoryProvider {
    get actionButton() { return this._actionButton; }
    set actionButton(button) {
        this._actionButton = button;
        this._onDidChangeActionButton.fire();
    }
    get currentHistoryItemGroup() { return this._currentHistoryItemGroup; }
    set currentHistoryItemGroup(value) {
        this._currentHistoryItemGroup = value;
        this._onDidChangeCurrentHistoryItemGroup.fire();
    }
    constructor(repository) {
        this.repository = repository;
        this._onDidChangeActionButton = new vscode_1.EventEmitter();
        this.onDidChangeActionButton = this._onDidChangeActionButton.event;
        this._onDidChangeCurrentHistoryItemGroup = new vscode_1.EventEmitter();
        this.onDidChangeCurrentHistoryItemGroup = this._onDidChangeCurrentHistoryItemGroup.event;
        this.disposables = [];
        const actionButton = new actionButton_1.SyncActionButton(repository);
        this.actionButton = actionButton.button;
        this.disposables.push(actionButton);
        this.disposables.push(repository.onDidRunGitStatus(this.onDidRunGitStatus, this));
        this.disposables.push(actionButton.onDidChange(() => this.actionButton = actionButton.button));
    }
    async onDidRunGitStatus() {
        if (!this.repository.HEAD?.name || !this.repository.HEAD?.commit) {
            return;
        }
        this.currentHistoryItemGroup = {
            id: `refs/heads/${this.repository.HEAD.name}`,
            label: this.repository.HEAD.name,
            upstream: this.repository.HEAD.upstream ?
                {
                    id: `refs/remotes/${this.repository.HEAD.upstream.remote}/${this.repository.HEAD.upstream.name}`,
                    label: `${this.repository.HEAD.upstream.remote}/${this.repository.HEAD.upstream.name}`,
                } : undefined
        };
    }
    async provideHistoryItems(historyItemGroupId, options) {
        //TODO@lszomoru - support limit and cursor
        if (typeof options.limit === 'number') {
            throw new Error('Unsupported options.');
        }
        if (typeof options.limit?.id !== 'string') {
            throw new Error('Unsupported options.');
        }
        const optionsRef = options.limit.id;
        const [commits, summary] = await Promise.all([
            this.repository.log({ range: `${optionsRef}..${historyItemGroupId}`, sortByAuthorDate: true }),
            this.getSummaryHistoryItem(optionsRef, historyItemGroupId)
        ]);
        const historyItems = commits.length === 0 ? [] : [summary];
        historyItems.push(...commits.map(commit => {
            const newLineIndex = commit.message.indexOf('\n');
            const subject = newLineIndex !== -1 ? commit.message.substring(0, newLineIndex) : commit.message;
            return {
                id: commit.hash,
                parentIds: commit.parents,
                label: subject,
                description: commit.authorName,
                icon: new vscode_1.ThemeIcon('account'),
                timestamp: commit.authorDate?.getTime()
            };
        }));
        return historyItems;
    }
    async provideHistoryItemChanges(historyItemId) {
        const [ref1, ref2] = historyItemId.includes('..')
            ? historyItemId.split('..')
            : [`${historyItemId}^`, historyItemId];
        const changes = await this.repository.diffBetween(ref1, ref2);
        return changes.map(change => ({
            uri: change.uri.with({ query: `ref=${historyItemId}` }),
            originalUri: (0, uri_1.toGitUri)(change.originalUri, ref1),
            modifiedUri: (0, uri_1.toGitUri)(change.originalUri, ref2),
            renameUri: change.renameUri,
        }));
    }
    async resolveHistoryItemGroupBase(historyItemGroupId) {
        // TODO - support for all history item groups
        if (historyItemGroupId !== this.currentHistoryItemGroup?.id) {
            return undefined;
        }
        if (this.currentHistoryItemGroup?.upstream) {
            return this.currentHistoryItemGroup.upstream;
        }
        // Default branch
        const defaultBranch = await this.repository.getDefaultBranch();
        return defaultBranch.name ? { id: `refs/heads/${defaultBranch.name}`, label: defaultBranch.name } : undefined;
    }
    async resolveHistoryItemGroupCommonAncestor(refId1, refId2) {
        const ancestor = await this.repository.getMergeBase(refId1, refId2);
        if (ancestor === '') {
            return undefined;
        }
        const commitCount = await this.repository.getCommitCount(`${refId1}...${refId2}`);
        return { id: ancestor, ahead: commitCount.ahead, behind: commitCount.behind };
    }
    async getSummaryHistoryItem(ref1, ref2) {
        const diffShortStat = await this.repository.diffBetweenShortStat(ref1, ref2);
        return { id: `${ref1}..${ref2}`, parentIds: [], icon: new vscode_1.ThemeIcon('files'), label: 'Changes', description: diffShortStat };
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.GitHistoryProvider = GitHistoryProvider;
//# sourceMappingURL=historyProvider.js.map