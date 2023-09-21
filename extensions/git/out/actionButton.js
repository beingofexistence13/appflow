"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncActionButton = exports.CommitActionButton = void 0;
const vscode_1 = require("vscode");
const util_1 = require("./util");
class AbstractActionButton {
    get onDidChange() { return this._onDidChange.event; }
    get state() { return this._state; }
    set state(state) {
        if (JSON.stringify(this._state) !== JSON.stringify(state)) {
            this._state = state;
            this._onDidChange.fire();
        }
    }
    constructor(repository) {
        this.repository = repository;
        this._onDidChange = new vscode_1.EventEmitter();
        this.disposables = [];
        this._state = {
            HEAD: undefined,
            isCheckoutInProgress: false,
            isCommitInProgress: false,
            isMergeInProgress: false,
            isRebaseInProgress: false,
            isSyncInProgress: false,
            repositoryHasChangesToCommit: false
        };
        repository.onDidRunGitStatus(this.onDidRunGitStatus, this, this.disposables);
        repository.onDidChangeOperations(this.onDidChangeOperations, this, this.disposables);
    }
    getPublishBranchActionButton() {
        const icon = this.state.isSyncInProgress ? '$(sync~spin)' : '$(cloud-upload)';
        return {
            command: {
                command: 'git.publish',
                title: vscode_1.l10n.t({ message: '{0} Publish Branch', args: [icon], comment: ['{Locked="Branch"}', 'Do not translate "Branch" as it is a git term'] }),
                tooltip: this.state.isSyncInProgress ?
                    (this.state.HEAD?.name ?
                        vscode_1.l10n.t({ message: 'Publishing Branch "{0}"...', args: [this.state.HEAD.name], comment: ['{Locked="Branch"}', 'Do not translate "Branch" as it is a git term'] }) :
                        vscode_1.l10n.t({ message: 'Publishing Branch...', comment: ['{Locked="Branch"}', 'Do not translate "Branch" as it is a git term'] })) :
                    (this.repository.HEAD?.name ?
                        vscode_1.l10n.t({ message: 'Publish Branch "{0}"', args: [this.state.HEAD?.name], comment: ['{Locked="Branch"}', 'Do not translate "Branch" as it is a git term'] }) :
                        vscode_1.l10n.t({ message: 'Publish Branch', comment: ['{Locked="Branch"}', 'Do not translate "Branch" as it is a git term'] })),
                arguments: [this.repository.sourceControl],
            },
            enabled: !this.state.isCheckoutInProgress && !this.state.isSyncInProgress && !this.state.isCommitInProgress && !this.state.isMergeInProgress && !this.state.isRebaseInProgress
        };
    }
    getSyncChangesActionButton() {
        const branchIsAheadOrBehind = (this.state.HEAD?.behind ?? 0) > 0 || (this.state.HEAD?.ahead ?? 0) > 0;
        const ahead = this.state.HEAD?.ahead ? ` ${this.state.HEAD.ahead}$(arrow-up)` : '';
        const behind = this.state.HEAD?.behind ? ` ${this.state.HEAD.behind}$(arrow-down)` : '';
        const icon = this.state.isSyncInProgress ? '$(sync~spin)' : '$(sync)';
        return {
            command: {
                command: 'git.sync',
                title: vscode_1.l10n.t('{0} Sync Changes{1}{2}', icon, behind, ahead),
                tooltip: this.state.isSyncInProgress ?
                    vscode_1.l10n.t('Synchronizing Changes...')
                    : this.repository.syncTooltip,
                arguments: [this.repository.sourceControl],
            },
            description: `${icon}${behind}${ahead}`,
            enabled: !this.state.isCheckoutInProgress && !this.state.isSyncInProgress && !this.state.isCommitInProgress && !this.state.isMergeInProgress && !this.state.isRebaseInProgress && branchIsAheadOrBehind
        };
    }
    onDidChangeOperations() {
        const isCheckoutInProgress = this.repository.operations.isRunning("Checkout" /* OperationKind.Checkout */) ||
            this.repository.operations.isRunning("CheckoutTracking" /* OperationKind.CheckoutTracking */);
        const isCommitInProgress = this.repository.operations.isRunning("Commit" /* OperationKind.Commit */) ||
            this.repository.operations.isRunning("PostCommitCommand" /* OperationKind.PostCommitCommand */) ||
            this.repository.operations.isRunning("RebaseContinue" /* OperationKind.RebaseContinue */);
        const isSyncInProgress = this.repository.operations.isRunning("Sync" /* OperationKind.Sync */) ||
            this.repository.operations.isRunning("Push" /* OperationKind.Push */) ||
            this.repository.operations.isRunning("Pull" /* OperationKind.Pull */);
        this.state = { ...this.state, isCheckoutInProgress, isCommitInProgress, isSyncInProgress };
    }
    onDidRunGitStatus() {
        this.state = {
            ...this.state,
            HEAD: this.repository.HEAD,
            isMergeInProgress: this.repository.mergeGroup.resourceStates.length !== 0,
            isRebaseInProgress: !!this.repository.rebaseCommit,
            repositoryHasChangesToCommit: this.repositoryHasChangesToCommit()
        };
    }
    repositoryHasChangesToCommit() {
        const config = vscode_1.workspace.getConfiguration('git', vscode_1.Uri.file(this.repository.root));
        const enableSmartCommit = config.get('enableSmartCommit') === true;
        const suggestSmartCommit = config.get('suggestSmartCommit') === true;
        const smartCommitChanges = config.get('smartCommitChanges', 'all');
        const resources = [...this.repository.indexGroup.resourceStates];
        if (
        // Smart commit enabled (all)
        (enableSmartCommit && smartCommitChanges === 'all') ||
            // Smart commit disabled, smart suggestion enabled
            (!enableSmartCommit && suggestSmartCommit)) {
            resources.push(...this.repository.workingTreeGroup.resourceStates);
        }
        // Smart commit enabled (tracked only)
        if (enableSmartCommit && smartCommitChanges === 'tracked') {
            resources.push(...this.repository.workingTreeGroup.resourceStates.filter(r => r.type !== 7 /* Status.UNTRACKED */));
        }
        return resources.length !== 0;
    }
    dispose() {
        this.disposables = (0, util_1.dispose)(this.disposables);
    }
}
class CommitActionButton extends AbstractActionButton {
    get button() {
        if (!this.state.HEAD) {
            return undefined;
        }
        let actionButton;
        if (this.state.repositoryHasChangesToCommit) {
            // Commit Changes (enabled)
            actionButton = this.getCommitActionButton();
        }
        // Commit Changes (enabled) -> Publish Branch -> Sync Changes -> Commit Changes (disabled)
        return actionButton ?? this.getPublishBranchActionButton() ?? this.getSyncChangesActionButton() ?? this.getCommitActionButton();
    }
    constructor(repository, postCommitCommandCenter) {
        super(repository);
        this.postCommitCommandCenter = postCommitCommandCenter;
        this.disposables.push(repository.onDidChangeBranchProtection(() => this._onDidChange.fire()));
        this.disposables.push(postCommitCommandCenter.onDidChange(() => this._onDidChange.fire()));
        const root = vscode_1.Uri.file(repository.root);
        this.disposables.push(vscode_1.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('git.enableSmartCommit', root) ||
                e.affectsConfiguration('git.smartCommitChanges', root) ||
                e.affectsConfiguration('git.suggestSmartCommit', root)) {
                this.onDidChangeSmartCommitSettings();
            }
            if (e.affectsConfiguration('scm.experimental.showSyncView') ||
                e.affectsConfiguration('git.branchProtectionPrompt', root) ||
                e.affectsConfiguration('git.postCommitCommand', root) ||
                e.affectsConfiguration('git.rememberPostCommitCommand', root) ||
                e.affectsConfiguration('git.showActionButton', root)) {
                this._onDidChange.fire();
            }
        }));
    }
    getCommitActionButton() {
        const config = vscode_1.workspace.getConfiguration('git', vscode_1.Uri.file(this.repository.root));
        const showActionButton = config.get('showActionButton', { commit: true });
        // The button is disabled
        if (!showActionButton.commit) {
            return undefined;
        }
        const primaryCommand = this.getCommitActionButtonPrimaryCommand();
        return {
            command: primaryCommand,
            secondaryCommands: this.getCommitActionButtonSecondaryCommands(),
            enabled: (this.state.repositoryHasChangesToCommit || this.state.isRebaseInProgress) && !this.state.isCommitInProgress && !this.state.isMergeInProgress
        };
    }
    getCommitActionButtonPrimaryCommand() {
        // Rebase Continue
        if (this.state.isRebaseInProgress) {
            return {
                command: 'git.commit',
                title: vscode_1.l10n.t('{0} Continue', '$(check)'),
                tooltip: this.state.isCommitInProgress ? vscode_1.l10n.t('Continuing Rebase...') : vscode_1.l10n.t('Continue Rebase'),
                arguments: [this.repository.sourceControl, '']
            };
        }
        // Commit
        return this.postCommitCommandCenter.getPrimaryCommand();
    }
    getCommitActionButtonSecondaryCommands() {
        // Rebase Continue
        if (this.state.isRebaseInProgress) {
            return [];
        }
        // Commit
        const commandGroups = [];
        for (const commands of this.postCommitCommandCenter.getSecondaryCommands()) {
            commandGroups.push(commands.map(c => {
                return { command: c.command, title: c.title, tooltip: c.tooltip, arguments: c.arguments };
            }));
        }
        return commandGroups;
    }
    getPublishBranchActionButton() {
        const scmConfig = vscode_1.workspace.getConfiguration('scm');
        if (scmConfig.get('experimental.showSyncView', false)) {
            return undefined;
        }
        const config = vscode_1.workspace.getConfiguration('git', vscode_1.Uri.file(this.repository.root));
        const showActionButton = config.get('showActionButton', { publish: true });
        // Not a branch (tag, detached), branch does have an upstream, commit/merge/rebase is in progress, or the button is disabled
        if (this.state.HEAD?.type === 2 /* RefType.Tag */ || !this.state.HEAD?.name || this.state.HEAD?.upstream || this.state.isCommitInProgress || this.state.isMergeInProgress || this.state.isRebaseInProgress || !showActionButton.publish) {
            return undefined;
        }
        return super.getPublishBranchActionButton();
    }
    getSyncChangesActionButton() {
        const scmConfig = vscode_1.workspace.getConfiguration('scm');
        if (scmConfig.get('experimental.showSyncView', false)) {
            return undefined;
        }
        const config = vscode_1.workspace.getConfiguration('git', vscode_1.Uri.file(this.repository.root));
        const showActionButton = config.get('showActionButton', { sync: true });
        const branchIsAheadOrBehind = (this.state.HEAD?.behind ?? 0) > 0 || (this.state.HEAD?.ahead ?? 0) > 0;
        // Branch does not have an upstream, branch is not ahead/behind the remote branch, commit/merge/rebase is in progress, or the button is disabled
        if (!this.state.HEAD?.upstream || !branchIsAheadOrBehind || this.state.isCommitInProgress || this.state.isMergeInProgress || this.state.isRebaseInProgress || !showActionButton.sync) {
            return undefined;
        }
        return super.getSyncChangesActionButton();
    }
    onDidChangeSmartCommitSettings() {
        this.state = {
            ...this.state,
            repositoryHasChangesToCommit: this.repositoryHasChangesToCommit()
        };
    }
}
exports.CommitActionButton = CommitActionButton;
class SyncActionButton extends AbstractActionButton {
    get button() {
        if (!this.state.HEAD) {
            return undefined;
        }
        // Publish Branch -> Sync Changes
        return this.getPublishBranchActionButton() ?? this.getSyncChangesActionButton();
    }
    constructor(repository) {
        super(repository);
        this.disposables.push(vscode_1.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('scm.experimental.showSyncView')) {
                this._onDidChange.fire();
            }
        }));
    }
    getPublishBranchActionButton() {
        // Not a branch (tag, detached), branch does have an upstream
        if (this.state.HEAD?.type === 2 /* RefType.Tag */ || this.state.HEAD?.upstream) {
            return undefined;
        }
        return super.getPublishBranchActionButton();
    }
}
exports.SyncActionButton = SyncActionButton;
//# sourceMappingURL=actionButton.js.map