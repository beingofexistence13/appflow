"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitTimelineProvider = exports.GitTimelineItem = void 0;
const vscode_1 = require("vscode");
const repository_1 = require("./repository");
const decorators_1 = require("./decorators");
const emoji_1 = require("./emoji");
class GitTimelineItem extends vscode_1.TimelineItem {
    static is(item) {
        return item instanceof GitTimelineItem;
    }
    constructor(ref, previousRef, message, timestamp, id, contextValue) {
        const index = message.indexOf('\n');
        const label = index !== -1 ? `${message.substring(0, index)} \u2026` : message;
        super(label, timestamp);
        this.ref = ref;
        this.previousRef = previousRef;
        this.message = message;
        this.id = id;
        this.contextValue = contextValue;
    }
    get shortRef() {
        return this.shortenRef(this.ref);
    }
    get shortPreviousRef() {
        return this.shortenRef(this.previousRef);
    }
    setItemDetails(author, email, date, message) {
        this.tooltip = new vscode_1.MarkdownString('', true);
        if (email) {
            const emailTitle = vscode_1.l10n.t('Email');
            this.tooltip.appendMarkdown(`$(account) [**${author}**](mailto:${email} "${emailTitle} ${author}")\n\n`);
        }
        else {
            this.tooltip.appendMarkdown(`$(account) **${author}**\n\n`);
        }
        this.tooltip.appendMarkdown(`$(history) ${date}\n\n`);
        this.tooltip.appendMarkdown(message);
    }
    shortenRef(ref) {
        if (ref === '' || ref === '~' || ref === 'HEAD') {
            return ref;
        }
        return ref.endsWith('^') ? `${ref.substr(0, 8)}^` : ref.substr(0, 8);
    }
}
exports.GitTimelineItem = GitTimelineItem;
class GitTimelineProvider {
    get onDidChange() {
        return this._onDidChange.event;
    }
    constructor(model, commands) {
        this.model = model;
        this.commands = commands;
        this._onDidChange = new vscode_1.EventEmitter();
        this.id = 'git-history';
        this.label = vscode_1.l10n.t('Git History');
        this.disposable = vscode_1.Disposable.from(model.onDidOpenRepository(this.onRepositoriesChanged, this), vscode_1.workspace.onDidChangeConfiguration(this.onConfigurationChanged, this));
        if (model.repositories.length) {
            this.ensureProviderRegistration();
        }
    }
    dispose() {
        this.providerDisposable?.dispose();
        this.disposable.dispose();
    }
    async provideTimeline(uri, options, _token) {
        // console.log(`GitTimelineProvider.provideTimeline: uri=${uri}`);
        const repo = this.model.getRepository(uri);
        if (!repo) {
            this.repoDisposable?.dispose();
            this.repoOperationDate = undefined;
            this.repo = undefined;
            return { items: [] };
        }
        if (this.repo?.root !== repo.root) {
            this.repoDisposable?.dispose();
            this.repo = repo;
            this.repoOperationDate = new Date();
            this.repoDisposable = vscode_1.Disposable.from(repo.onDidChangeRepository(uri => this.onRepositoryChanged(repo, uri)), repo.onDidRunGitStatus(() => this.onRepositoryStatusChanged(repo)), repo.onDidRunOperation(result => this.onRepositoryOperationRun(repo, result)));
        }
        const config = vscode_1.workspace.getConfiguration('git.timeline');
        // TODO@eamodio: Ensure that the uri is a file -- if not we could get the history of the repo?
        let limit;
        if (options.limit !== undefined && typeof options.limit !== 'number') {
            try {
                const result = await this.model.git.exec(repo.root, ['rev-list', '--count', `${options.limit.id}..`, '--', uri.fsPath]);
                if (!result.exitCode) {
                    // Ask for 2 more (1 for the limit commit and 1 for the next commit) than so we can determine if there are more commits
                    limit = Number(result.stdout) + 2;
                }
            }
            catch {
                limit = undefined;
            }
        }
        else {
            // If we are not getting everything, ask for 1 more than so we can determine if there are more commits
            limit = options.limit === undefined ? undefined : options.limit + 1;
        }
        await (0, emoji_1.ensureEmojis)();
        const commits = await repo.logFile(uri, {
            maxEntries: limit,
            hash: options.cursor,
            // sortByAuthorDate: true
        });
        const paging = commits.length ? {
            cursor: limit === undefined ? undefined : (commits.length >= limit ? commits[commits.length - 1]?.hash : undefined)
        } : undefined;
        // If we asked for an extra commit, strip it off
        if (limit !== undefined && commits.length >= limit) {
            commits.splice(commits.length - 1, 1);
        }
        const dateFormatter = new Intl.DateTimeFormat(vscode_1.env.language, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        const dateType = config.get('date');
        const showAuthor = config.get('showAuthor');
        const showUncommitted = config.get('showUncommitted');
        const openComparison = vscode_1.l10n.t('Open Comparison');
        const items = commits.map((c, i) => {
            const date = dateType === 'authored' ? c.authorDate : c.commitDate;
            const message = (0, emoji_1.emojify)(c.message);
            const item = new GitTimelineItem(c.hash, commits[i + 1]?.hash ?? `${c.hash}^`, message, date?.getTime() ?? 0, c.hash, 'git:file:commit');
            item.iconPath = new vscode_1.ThemeIcon('git-commit');
            if (showAuthor) {
                item.description = c.authorName;
            }
            item.setItemDetails(c.authorName, c.authorEmail, dateFormatter.format(date), message);
            const cmd = this.commands.resolveTimelineOpenDiffCommand(item, uri);
            if (cmd) {
                item.command = {
                    title: openComparison,
                    command: cmd.command,
                    arguments: cmd.arguments,
                };
            }
            return item;
        });
        if (options.cursor === undefined) {
            const you = vscode_1.l10n.t('You');
            const index = repo.indexGroup.resourceStates.find(r => r.resourceUri.fsPath === uri.fsPath);
            if (index) {
                const date = this.repoOperationDate ?? new Date();
                const item = new GitTimelineItem('~', 'HEAD', vscode_1.l10n.t('Staged Changes'), date.getTime(), 'index', 'git:file:index');
                // TODO@eamodio: Replace with a better icon -- reflecting its status maybe?
                item.iconPath = new vscode_1.ThemeIcon('git-commit');
                item.description = '';
                item.setItemDetails(you, undefined, dateFormatter.format(date), repository_1.Resource.getStatusText(index.type));
                const cmd = this.commands.resolveTimelineOpenDiffCommand(item, uri);
                if (cmd) {
                    item.command = {
                        title: openComparison,
                        command: cmd.command,
                        arguments: cmd.arguments,
                    };
                }
                items.splice(0, 0, item);
            }
            if (showUncommitted) {
                const working = repo.workingTreeGroup.resourceStates.find(r => r.resourceUri.fsPath === uri.fsPath);
                if (working) {
                    const date = new Date();
                    const item = new GitTimelineItem('', index ? '~' : 'HEAD', vscode_1.l10n.t('Uncommitted Changes'), date.getTime(), 'working', 'git:file:working');
                    item.iconPath = new vscode_1.ThemeIcon('circle-outline');
                    item.description = '';
                    item.setItemDetails(you, undefined, dateFormatter.format(date), repository_1.Resource.getStatusText(working.type));
                    const cmd = this.commands.resolveTimelineOpenDiffCommand(item, uri);
                    if (cmd) {
                        item.command = {
                            title: openComparison,
                            command: cmd.command,
                            arguments: cmd.arguments,
                        };
                    }
                    items.splice(0, 0, item);
                }
            }
        }
        return {
            items: items,
            paging: paging
        };
    }
    ensureProviderRegistration() {
        if (this.providerDisposable === undefined) {
            this.providerDisposable = vscode_1.workspace.registerTimelineProvider(['file', 'git', 'vscode-remote', 'vscode-local-history'], this);
        }
    }
    onConfigurationChanged(e) {
        if (e.affectsConfiguration('git.timeline.date') || e.affectsConfiguration('git.timeline.showAuthor') || e.affectsConfiguration('git.timeline.showUncommitted')) {
            this.fireChanged();
        }
    }
    onRepositoriesChanged(_repo) {
        // console.log(`GitTimelineProvider.onRepositoriesChanged`);
        this.ensureProviderRegistration();
        // TODO@eamodio: Being naive for now and just always refreshing each time there is a new repository
        this.fireChanged();
    }
    onRepositoryChanged(_repo, _uri) {
        // console.log(`GitTimelineProvider.onRepositoryChanged: uri=${uri.toString(true)}`);
        this.fireChanged();
    }
    onRepositoryStatusChanged(_repo) {
        // console.log(`GitTimelineProvider.onRepositoryStatusChanged`);
        const config = vscode_1.workspace.getConfiguration('git.timeline');
        const showUncommitted = config.get('showUncommitted') === true;
        if (showUncommitted) {
            this.fireChanged();
        }
    }
    onRepositoryOperationRun(_repo, _result) {
        // console.log(`GitTimelineProvider.onRepositoryOperationRun`);
        // Successful operations that are not read-only and not status operations
        if (!_result.error && !_result.operation.readOnly && _result.operation.kind !== "Status" /* OperationKind.Status */) {
            // This is less than ideal, but for now just save the last time an
            // operation was run and use that as the timestamp for staged items
            this.repoOperationDate = new Date();
            this.fireChanged();
        }
    }
    fireChanged() {
        this._onDidChange.fire(undefined);
    }
}
exports.GitTimelineProvider = GitTimelineProvider;
__decorate([
    (0, decorators_1.debounce)(500)
], GitTimelineProvider.prototype, "fireChanged", null);
//# sourceMappingURL=timelineProvider.js.map