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
exports.CommandCenter = void 0;
const os = require("os");
const path = require("path");
const vscode_1 = require("vscode");
const unique_names_generator_1 = require("@joaomoreno/unique-names-generator");
const repository_1 = require("./repository");
const staging_1 = require("./staging");
const uri_1 = require("./uri");
const util_1 = require("./util");
const timelineProvider_1 = require("./timelineProvider");
const api1_1 = require("./api/api1");
const remoteSource_1 = require("./remoteSource");
class CheckoutItem {
    get shortCommit() { return (this.ref.commit || '').substr(0, 8); }
    get label() { return `${this.repository.isBranchProtected(this.ref) ? '$(lock)' : '$(git-branch)'} ${this.ref.name || this.shortCommit}`; }
    get description() { return this.shortCommit; }
    get refName() { return this.ref.name; }
    get refRemote() { return this.ref.remote; }
    get buttons() { return this._buttons; }
    set buttons(newButtons) { this._buttons = newButtons; }
    constructor(repository, ref, _buttons) {
        this.repository = repository;
        this.ref = ref;
        this._buttons = _buttons;
    }
    async run(opts) {
        if (!this.ref.name) {
            return;
        }
        const config = vscode_1.workspace.getConfiguration('git', vscode_1.Uri.file(this.repository.root));
        const pullBeforeCheckout = config.get('pullBeforeCheckout', false) === true;
        const treeish = opts?.detached ? this.ref.commit ?? this.ref.name : this.ref.name;
        await this.repository.checkout(treeish, { ...opts, pullBeforeCheckout });
    }
}
class CheckoutTagItem extends CheckoutItem {
    get label() { return `$(tag) ${this.ref.name || this.shortCommit}`; }
    get description() {
        return vscode_1.l10n.t('Tag at {0}', this.shortCommit);
    }
    async run(opts) {
        if (!this.ref.name) {
            return;
        }
        await this.repository.checkout(this.ref.name, opts);
    }
}
class CheckoutRemoteHeadItem extends CheckoutItem {
    get label() { return `$(cloud) ${this.ref.name || this.shortCommit}`; }
    get description() {
        return vscode_1.l10n.t('Remote branch at {0}', this.shortCommit);
    }
    async run(opts) {
        if (!this.ref.name) {
            return;
        }
        if (opts?.detached) {
            await this.repository.checkout(this.ref.commit ?? this.ref.name, opts);
            return;
        }
        const branches = await this.repository.findTrackingBranches(this.ref.name);
        if (branches.length > 0) {
            await this.repository.checkout(branches[0].name, opts);
        }
        else {
            await this.repository.checkoutTracking(this.ref.name, opts);
        }
    }
}
class BranchDeleteItem {
    get shortCommit() { return (this.ref.commit || '').substr(0, 8); }
    get branchName() { return this.ref.name; }
    get label() { return this.branchName || ''; }
    get description() { return this.shortCommit; }
    constructor(ref) {
        this.ref = ref;
    }
    async run(repository, force) {
        if (!this.branchName) {
            return;
        }
        await repository.deleteBranch(this.branchName, force);
    }
}
class MergeItem {
    get label() { return this.ref.name || ''; }
    get description() { return this.ref.name || ''; }
    constructor(ref) {
        this.ref = ref;
    }
    async run(repository) {
        await repository.merge(this.ref.name || this.ref.commit);
    }
}
class RebaseItem {
    get label() { return this.ref.name || ''; }
    constructor(ref) {
        this.ref = ref;
        this.description = '';
    }
    async run(repository) {
        if (this.ref?.name) {
            await repository.rebase(this.ref.name);
        }
    }
}
class CreateBranchItem {
    get label() { return '$(plus) ' + vscode_1.l10n.t('Create new branch...'); }
    get description() { return ''; }
    get alwaysShow() { return true; }
}
class CreateBranchFromItem {
    get label() { return '$(plus) ' + vscode_1.l10n.t('Create new branch from...'); }
    get description() { return ''; }
    get alwaysShow() { return true; }
}
class CheckoutDetachedItem {
    get label() { return '$(debug-disconnect) ' + vscode_1.l10n.t('Checkout detached...'); }
    get description() { return ''; }
    get alwaysShow() { return true; }
}
class HEADItem {
    constructor(repository) {
        this.repository = repository;
    }
    get label() { return 'HEAD'; }
    get description() { return (this.repository.HEAD && this.repository.HEAD.commit || '').substr(0, 8); }
    get alwaysShow() { return true; }
    get refName() { return 'HEAD'; }
}
class AddRemoteItem {
    constructor(cc) {
        this.cc = cc;
    }
    get label() { return '$(plus) ' + vscode_1.l10n.t('Add a new remote...'); }
    get description() { return ''; }
    get alwaysShow() { return true; }
    async run(repository) {
        await this.cc.addRemote(repository);
    }
}
class RemoteItem {
    get label() { return `$(cloud) ${this.remote.name}`; }
    get description() { return this.remote.fetchUrl; }
    get remoteName() { return this.remote.name; }
    constructor(repository, remote) {
        this.repository = repository;
        this.remote = remote;
    }
    async run() {
        await this.repository.fetch({ remote: this.remote.name });
    }
}
class FetchAllRemotesItem {
    get label() { return vscode_1.l10n.t('{0} Fetch all remotes', '$(cloud-download)'); }
    constructor(repository) {
        this.repository = repository;
    }
    async run() {
        await this.repository.fetch({ all: true });
    }
}
class RepositoryItem {
    get label() { return `$(repo) ${getRepositoryLabel(this.path)}`; }
    get description() { return this.path; }
    constructor(path) {
        this.path = path;
    }
}
const Commands = [];
function command(commandId, options = {}) {
    return (_target, key, descriptor) => {
        if (!(typeof descriptor.value === 'function')) {
            throw new Error('not supported');
        }
        Commands.push({ commandId, key, method: descriptor.value, options });
    };
}
// const ImageMimetypes = [
// 	'image/png',
// 	'image/gif',
// 	'image/jpeg',
// 	'image/webp',
// 	'image/tiff',
// 	'image/bmp'
// ];
async function categorizeResourceByResolution(resources) {
    const selection = resources.filter(s => s instanceof repository_1.Resource);
    const merge = selection.filter(s => s.resourceGroupType === 0 /* ResourceGroupType.Merge */);
    const isBothAddedOrModified = (s) => s.type === 18 /* Status.BOTH_MODIFIED */ || s.type === 16 /* Status.BOTH_ADDED */;
    const isAnyDeleted = (s) => s.type === 15 /* Status.DELETED_BY_THEM */ || s.type === 14 /* Status.DELETED_BY_US */;
    const possibleUnresolved = merge.filter(isBothAddedOrModified);
    const promises = possibleUnresolved.map(s => (0, util_1.grep)(s.resourceUri.fsPath, /^<{7}|^={7}|^>{7}/));
    const unresolvedBothModified = await Promise.all(promises);
    const resolved = possibleUnresolved.filter((_s, i) => !unresolvedBothModified[i]);
    const deletionConflicts = merge.filter(s => isAnyDeleted(s));
    const unresolved = [
        ...merge.filter(s => !isBothAddedOrModified(s) && !isAnyDeleted(s)),
        ...possibleUnresolved.filter((_s, i) => unresolvedBothModified[i])
    ];
    return { merge, resolved, unresolved, deletionConflicts };
}
async function createCheckoutItems(repository, detached = false) {
    const config = vscode_1.workspace.getConfiguration('git');
    const checkoutTypeConfig = config.get('checkoutType');
    let checkoutTypes;
    if (checkoutTypeConfig === 'all' || !checkoutTypeConfig || checkoutTypeConfig.length === 0) {
        checkoutTypes = ['local', 'remote', 'tags'];
    }
    else if (typeof checkoutTypeConfig === 'string') {
        checkoutTypes = [checkoutTypeConfig];
    }
    else {
        checkoutTypes = checkoutTypeConfig;
    }
    if (detached) {
        // Remove tags when in detached mode
        checkoutTypes = checkoutTypes.filter(t => t !== 'tags');
    }
    const refs = await repository.getRefs();
    const processors = checkoutTypes.map(type => getCheckoutProcessor(repository, type))
        .filter(p => !!p);
    for (const ref of refs) {
        for (const processor of processors) {
            processor.onRef(ref);
        }
    }
    const buttons = await getRemoteRefItemButtons(repository);
    let fallbackRemoteButtons = [];
    const remote = repository.remotes.find(r => r.pushUrl === repository.HEAD?.remote || r.fetchUrl === repository.HEAD?.remote) ?? repository.remotes[0];
    const remoteUrl = remote?.pushUrl ?? remote?.fetchUrl;
    if (remoteUrl) {
        fallbackRemoteButtons = buttons.get(remoteUrl);
    }
    return processors.reduce((r, p) => r.concat(...p.items.map((item) => {
        if (item.refRemote) {
            const matchingRemote = repository.remotes.find((remote) => remote.name === item.refRemote);
            const remoteUrl = matchingRemote?.pushUrl ?? matchingRemote?.fetchUrl;
            if (remoteUrl) {
                item.buttons = buttons.get(item.refRemote);
            }
        }
        item.buttons = fallbackRemoteButtons;
        return item;
    })), []);
}
async function getRemoteRefItemButtons(repository) {
    // Compute actions for all known remotes
    const remoteUrlsToActions = new Map();
    const getButtons = async (remoteUrl) => (await (0, remoteSource_1.getRemoteSourceActions)(remoteUrl)).map((action) => ({ iconPath: new vscode_1.ThemeIcon(action.icon), tooltip: action.label, actual: action }));
    for (const remote of repository.remotes) {
        if (remote.fetchUrl) {
            const actions = remoteUrlsToActions.get(remote.fetchUrl) ?? [];
            actions.push(...await getButtons(remote.fetchUrl));
            remoteUrlsToActions.set(remote.fetchUrl, actions);
        }
        if (remote.pushUrl && remote.pushUrl !== remote.fetchUrl) {
            const actions = remoteUrlsToActions.get(remote.pushUrl) ?? [];
            actions.push(...await getButtons(remote.pushUrl));
            remoteUrlsToActions.set(remote.pushUrl, actions);
        }
    }
    return remoteUrlsToActions;
}
class CheckoutProcessor {
    get items() { return this.refs.map(r => new this.ctor(this.repository, r)); }
    constructor(repository, type, ctor) {
        this.repository = repository;
        this.type = type;
        this.ctor = ctor;
        this.refs = [];
    }
    onRef(ref) {
        if (ref.type === this.type) {
            this.refs.push(ref);
        }
    }
}
function getCheckoutProcessor(repository, type) {
    switch (type) {
        case 'local':
            return new CheckoutProcessor(repository, 0 /* RefType.Head */, CheckoutItem);
        case 'remote':
            return new CheckoutProcessor(repository, 1 /* RefType.RemoteHead */, CheckoutRemoteHeadItem);
        case 'tags':
            return new CheckoutProcessor(repository, 2 /* RefType.Tag */, CheckoutTagItem);
    }
    return undefined;
}
function getRepositoryLabel(repositoryRoot) {
    const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.file(repositoryRoot));
    return workspaceFolder?.uri.toString() === repositoryRoot ? workspaceFolder.name : path.basename(repositoryRoot);
}
function compareRepositoryLabel(repositoryRoot1, repositoryRoot2) {
    return getRepositoryLabel(repositoryRoot1).localeCompare(getRepositoryLabel(repositoryRoot2));
}
function sanitizeBranchName(name, whitespaceChar) {
    return name ? name.trim().replace(/^-+/, '').replace(/^\.|\/\.|\.\.|~|\^|:|\/$|\.lock$|\.lock\/|\\|\*|\s|^\s*$|\.$|\[|\]$/g, whitespaceChar) : name;
}
function sanitizeRemoteName(name) {
    name = name.trim();
    return name && name.replace(/^\.|\/\.|\.\.|~|\^|:|\/$|\.lock$|\.lock\/|\\|\*|\s|^\s*$|\.$|\[|\]$/g, '-');
}
class TagItem {
    get label() { return `$(tag) ${this.ref.name ?? ''}`; }
    get description() { return this.ref.commit?.substr(0, 8) ?? ''; }
    constructor(ref) {
        this.ref = ref;
    }
}
var PushType;
(function (PushType) {
    PushType[PushType["Push"] = 0] = "Push";
    PushType[PushType["PushTo"] = 1] = "PushTo";
    PushType[PushType["PushFollowTags"] = 2] = "PushFollowTags";
    PushType[PushType["PushTags"] = 3] = "PushTags";
})(PushType || (PushType = {}));
class CommandErrorOutputTextDocumentContentProvider {
    constructor() {
        this.items = new Map();
    }
    set(uri, contents) {
        this.items.set(uri.path, contents);
    }
    delete(uri) {
        this.items.delete(uri.path);
    }
    provideTextDocumentContent(uri) {
        return this.items.get(uri.path);
    }
}
class CommandCenter {
    constructor(git, model, globalState, logger, telemetryReporter) {
        this.git = git;
        this.model = model;
        this.globalState = globalState;
        this.logger = logger;
        this.telemetryReporter = telemetryReporter;
        this.commandErrors = new CommandErrorOutputTextDocumentContentProvider();
        this.disposables = Commands.map(({ commandId, key, method, options }) => {
            const command = this.createCommand(commandId, key, method, options);
            if (options.diff) {
                return vscode_1.commands.registerDiffInformationCommand(commandId, command);
            }
            else {
                return vscode_1.commands.registerCommand(commandId, command);
            }
        });
        this.disposables.push(vscode_1.workspace.registerTextDocumentContentProvider('git-output', this.commandErrors));
    }
    showOutput() {
        this.logger.show();
    }
    async refresh(repository) {
        await repository.status();
    }
    async openResource(resource) {
        const repository = this.model.getRepository(resource.resourceUri);
        if (!repository) {
            return;
        }
        await resource.open();
    }
    async openChanges(repository) {
        for (const resource of [...repository.workingTreeGroup.resourceStates, ...repository.untrackedGroup.resourceStates]) {
            if (resource.type === 6 /* Status.DELETED */ || resource.type === 15 /* Status.DELETED_BY_THEM */ ||
                resource.type === 14 /* Status.DELETED_BY_US */ || resource.type === 17 /* Status.BOTH_DELETED */) {
                continue;
            }
            void vscode_1.commands.executeCommand('vscode.open', resource.resourceUri, { background: true, preview: false, });
        }
    }
    async openMergeEditor(uri) {
        if (uri === undefined) {
            // fallback to active editor...
            if (vscode_1.window.tabGroups.activeTabGroup.activeTab?.input instanceof vscode_1.TabInputText) {
                uri = vscode_1.window.tabGroups.activeTabGroup.activeTab.input.uri;
            }
        }
        if (!(uri instanceof vscode_1.Uri)) {
            return;
        }
        const repo = this.model.getRepository(uri);
        if (!repo) {
            return;
        }
        const isRebasing = Boolean(repo.rebaseCommit);
        const mergeUris = (0, uri_1.toMergeUris)(uri);
        let isStashConflict = false;
        try {
            // Look at the conflict markers to check if this is a stash conflict
            const document = await vscode_1.workspace.openTextDocument(uri);
            const firstConflictInfo = findFirstConflictMarker(document);
            isStashConflict = firstConflictInfo?.incomingChangeLabel === 'Stashed changes';
        }
        catch (error) {
            console.error(error);
        }
        const current = { uri: mergeUris.ours, title: vscode_1.l10n.t('Current') };
        const incoming = { uri: mergeUris.theirs, title: vscode_1.l10n.t('Incoming') };
        if (isStashConflict) {
            incoming.title = vscode_1.l10n.t('Stashed Changes');
        }
        try {
            const [head, rebaseOrMergeHead] = await Promise.all([
                repo.getCommit('HEAD'),
                isRebasing ? repo.getCommit('REBASE_HEAD') : repo.getCommit('MERGE_HEAD')
            ]);
            // ours (current branch and commit)
            current.detail = head.refNames.map(s => s.replace(/^HEAD ->/, '')).join(', ');
            current.description = '$(git-commit) ' + head.hash.substring(0, 7);
            current.uri = (0, uri_1.toGitUri)(uri, head.hash);
            // theirs
            incoming.detail = rebaseOrMergeHead.refNames.join(', ');
            incoming.description = '$(git-commit) ' + rebaseOrMergeHead.hash.substring(0, 7);
            incoming.uri = (0, uri_1.toGitUri)(uri, rebaseOrMergeHead.hash);
        }
        catch (error) {
            // not so bad, can continue with just uris
            console.error('FAILED to read HEAD, MERGE_HEAD commits');
            console.error(error);
        }
        const options = {
            base: mergeUris.base,
            input1: isRebasing ? current : incoming,
            input2: isRebasing ? incoming : current,
            output: uri
        };
        await vscode_1.commands.executeCommand('_open.mergeEditor', options);
        function findFirstConflictMarker(doc) {
            const conflictMarkerStart = '<<<<<<<';
            const conflictMarkerEnd = '>>>>>>>';
            let inConflict = false;
            let currentChangeLabel = '';
            let incomingChangeLabel = '';
            let hasConflict = false;
            for (let lineIdx = 0; lineIdx < doc.lineCount; lineIdx++) {
                const lineStr = doc.lineAt(lineIdx).text;
                if (!inConflict) {
                    if (lineStr.startsWith(conflictMarkerStart)) {
                        currentChangeLabel = lineStr.substring(conflictMarkerStart.length).trim();
                        inConflict = true;
                        hasConflict = true;
                    }
                }
                else {
                    if (lineStr.startsWith(conflictMarkerEnd)) {
                        incomingChangeLabel = lineStr.substring(conflictMarkerStart.length).trim();
                        inConflict = false;
                        break;
                    }
                }
            }
            if (hasConflict) {
                return {
                    currentChangeLabel,
                    incomingChangeLabel
                };
            }
            return undefined;
        }
    }
    async cloneRepository(url, parentPath, options = {}) {
        if (!url || typeof url !== 'string') {
            url = await (0, remoteSource_1.pickRemoteSource)({
                providerLabel: provider => vscode_1.l10n.t('Clone from {0}', provider.name),
                urlLabel: vscode_1.l10n.t('Clone from URL')
            });
        }
        if (!url) {
            /* __GDPR__
                "clone" : {
                    "owner": "lszomoru",
                    "outcome" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "comment": "The outcome of the git operation" }
                }
            */
            this.telemetryReporter.sendTelemetryEvent('clone', { outcome: 'no_URL' });
            return;
        }
        url = url.trim().replace(/^git\s+clone\s+/, '');
        if (!parentPath) {
            const config = vscode_1.workspace.getConfiguration('git');
            let defaultCloneDirectory = config.get('defaultCloneDirectory') || os.homedir();
            defaultCloneDirectory = defaultCloneDirectory.replace(/^~/, os.homedir());
            const uris = await vscode_1.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                defaultUri: vscode_1.Uri.file(defaultCloneDirectory),
                title: vscode_1.l10n.t('Choose a folder to clone {0} into', url),
                openLabel: vscode_1.l10n.t('Select as Repository Destination')
            });
            if (!uris || uris.length === 0) {
                /* __GDPR__
                    "clone" : {
                        "owner": "lszomoru",
                        "outcome" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "comment": "The outcome of the git operation" }
                    }
                */
                this.telemetryReporter.sendTelemetryEvent('clone', { outcome: 'no_directory' });
                return;
            }
            const uri = uris[0];
            parentPath = uri.fsPath;
        }
        try {
            const opts = {
                location: vscode_1.ProgressLocation.Notification,
                title: vscode_1.l10n.t('Cloning git repository "{0}"...', url),
                cancellable: true
            };
            const repositoryPath = await vscode_1.window.withProgress(opts, (progress, token) => this.git.clone(url, { parentPath: parentPath, progress, recursive: options.recursive, ref: options.ref }, token));
            const config = vscode_1.workspace.getConfiguration('git');
            const openAfterClone = config.get('openAfterClone');
            let PostCloneAction;
            (function (PostCloneAction) {
                PostCloneAction[PostCloneAction["Open"] = 0] = "Open";
                PostCloneAction[PostCloneAction["OpenNewWindow"] = 1] = "OpenNewWindow";
                PostCloneAction[PostCloneAction["AddToWorkspace"] = 2] = "AddToWorkspace";
            })(PostCloneAction || (PostCloneAction = {}));
            let action = undefined;
            if (openAfterClone === 'always') {
                action = PostCloneAction.Open;
            }
            else if (openAfterClone === 'alwaysNewWindow') {
                action = PostCloneAction.OpenNewWindow;
            }
            else if (openAfterClone === 'whenNoFolderOpen' && !vscode_1.workspace.workspaceFolders) {
                action = PostCloneAction.Open;
            }
            if (action === undefined) {
                let message = vscode_1.l10n.t('Would you like to open the cloned repository?');
                const open = vscode_1.l10n.t('Open');
                const openNewWindow = vscode_1.l10n.t('Open in New Window');
                const choices = [open, openNewWindow];
                const addToWorkspace = vscode_1.l10n.t('Add to Workspace');
                if (vscode_1.workspace.workspaceFolders) {
                    message = vscode_1.l10n.t('Would you like to open the cloned repository, or add it to the current workspace?');
                    choices.push(addToWorkspace);
                }
                const result = await vscode_1.window.showInformationMessage(message, { modal: true }, ...choices);
                action = result === open ? PostCloneAction.Open
                    : result === openNewWindow ? PostCloneAction.OpenNewWindow
                        : result === addToWorkspace ? PostCloneAction.AddToWorkspace : undefined;
            }
            /* __GDPR__
                "clone" : {
                    "owner": "lszomoru",
                    "outcome" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "comment": "The outcome of the git operation" },
                    "openFolder": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true, "comment": "Indicates whether the folder is opened following the clone operation" }
                }
            */
            this.telemetryReporter.sendTelemetryEvent('clone', { outcome: 'success' }, { openFolder: action === PostCloneAction.Open || action === PostCloneAction.OpenNewWindow ? 1 : 0 });
            const uri = vscode_1.Uri.file(repositoryPath);
            if (action === PostCloneAction.Open) {
                vscode_1.commands.executeCommand('vscode.openFolder', uri, { forceReuseWindow: true });
            }
            else if (action === PostCloneAction.AddToWorkspace) {
                vscode_1.workspace.updateWorkspaceFolders(vscode_1.workspace.workspaceFolders.length, 0, { uri });
            }
            else if (action === PostCloneAction.OpenNewWindow) {
                vscode_1.commands.executeCommand('vscode.openFolder', uri, { forceNewWindow: true });
            }
        }
        catch (err) {
            if (/already exists and is not an empty directory/.test(err && err.stderr || '')) {
                /* __GDPR__
                    "clone" : {
                        "owner": "lszomoru",
                        "outcome" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "comment": "The outcome of the git operation" }
                    }
                */
                this.telemetryReporter.sendTelemetryEvent('clone', { outcome: 'directory_not_empty' });
            }
            else if (/Cancelled/i.test(err && (err.message || err.stderr || ''))) {
                return;
            }
            else {
                /* __GDPR__
                    "clone" : {
                        "owner": "lszomoru",
                        "outcome" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "comment": "The outcome of the git operation" }
                    }
                */
                this.telemetryReporter.sendTelemetryEvent('clone', { outcome: 'error' });
            }
            throw err;
        }
    }
    async continueInLocalClone() {
        if (this.model.repositories.length === 0) {
            return;
        }
        // Pick a single repository to continue working on in a local clone if there's more than one
        const items = this.model.repositories.reduce((items, repository) => {
            const remote = repository.remotes.find((r) => r.name === repository.HEAD?.upstream?.remote);
            if (remote?.pushUrl) {
                items.push({ repository: repository, label: remote.pushUrl });
            }
            return items;
        }, []);
        let selection = items[0];
        if (items.length > 1) {
            const pick = await vscode_1.window.showQuickPick(items, { canPickMany: false, placeHolder: vscode_1.l10n.t('Choose which repository to clone') });
            if (pick === undefined) {
                return;
            }
            selection = pick;
        }
        const uri = selection.label;
        const ref = selection.repository.HEAD?.upstream?.name;
        if (uri !== undefined) {
            let target = `${vscode_1.env.uriScheme}://vscode.git/clone?url=${encodeURIComponent(uri)}`;
            const isWeb = vscode_1.env.uiKind === vscode_1.UIKind.Web;
            const isRemote = vscode_1.env.remoteName !== undefined;
            if (isWeb || isRemote) {
                if (ref !== undefined) {
                    target += `&ref=${encodeURIComponent(ref)}`;
                }
                if (isWeb) {
                    // Launch desktop client if currently in web
                    return vscode_1.Uri.parse(target);
                }
                if (isRemote) {
                    // If already in desktop client but in a remote window, we need to force a new window
                    // so that the git extension can access the local filesystem for cloning
                    target += `&windowId=_blank`;
                    return vscode_1.Uri.parse(target);
                }
            }
            // Otherwise, directly clone
            void this.clone(uri, undefined, { ref: ref });
        }
    }
    async clone(url, parentPath, options) {
        await this.cloneRepository(url, parentPath, options);
    }
    async cloneRecursive(url, parentPath) {
        await this.cloneRepository(url, parentPath, { recursive: true });
    }
    async init(skipFolderPrompt = false) {
        let repositoryPath = undefined;
        let askToOpen = true;
        if (vscode_1.workspace.workspaceFolders) {
            if (skipFolderPrompt && vscode_1.workspace.workspaceFolders.length === 1) {
                repositoryPath = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
                askToOpen = false;
            }
            else {
                const placeHolder = vscode_1.l10n.t('Pick workspace folder to initialize git repo in');
                const pick = { label: vscode_1.l10n.t('Choose Folder...') };
                const items = [
                    ...vscode_1.workspace.workspaceFolders.map(folder => ({ label: folder.name, description: folder.uri.fsPath, folder })),
                    pick
                ];
                const item = await vscode_1.window.showQuickPick(items, { placeHolder, ignoreFocusOut: true });
                if (!item) {
                    return;
                }
                else if (item.folder) {
                    repositoryPath = item.folder.uri.fsPath;
                    askToOpen = false;
                }
            }
        }
        if (!repositoryPath) {
            const homeUri = vscode_1.Uri.file(os.homedir());
            const defaultUri = vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders.length > 0
                ? vscode_1.Uri.file(vscode_1.workspace.workspaceFolders[0].uri.fsPath)
                : homeUri;
            const result = await vscode_1.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                defaultUri,
                openLabel: vscode_1.l10n.t('Initialize Repository')
            });
            if (!result || result.length === 0) {
                return;
            }
            const uri = result[0];
            if (homeUri.toString().startsWith(uri.toString())) {
                const yes = vscode_1.l10n.t('Initialize Repository');
                const answer = await vscode_1.window.showWarningMessage(vscode_1.l10n.t('This will create a Git repository in "{0}". Are you sure you want to continue?', uri.fsPath), yes);
                if (answer !== yes) {
                    return;
                }
            }
            repositoryPath = uri.fsPath;
            if (vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders.some(w => w.uri.toString() === uri.toString())) {
                askToOpen = false;
            }
        }
        const config = vscode_1.workspace.getConfiguration('git');
        const defaultBranchName = config.get('defaultBranchName', 'main');
        const branchWhitespaceChar = config.get('branchWhitespaceChar', '-');
        await this.git.init(repositoryPath, { defaultBranch: sanitizeBranchName(defaultBranchName, branchWhitespaceChar) });
        let message = vscode_1.l10n.t('Would you like to open the initialized repository?');
        const open = vscode_1.l10n.t('Open');
        const openNewWindow = vscode_1.l10n.t('Open in New Window');
        const choices = [open, openNewWindow];
        if (!askToOpen) {
            return;
        }
        const addToWorkspace = vscode_1.l10n.t('Add to Workspace');
        if (vscode_1.workspace.workspaceFolders) {
            message = vscode_1.l10n.t('Would you like to open the initialized repository, or add it to the current workspace?');
            choices.push(addToWorkspace);
        }
        const result = await vscode_1.window.showInformationMessage(message, ...choices);
        const uri = vscode_1.Uri.file(repositoryPath);
        if (result === open) {
            vscode_1.commands.executeCommand('vscode.openFolder', uri);
        }
        else if (result === addToWorkspace) {
            vscode_1.workspace.updateWorkspaceFolders(vscode_1.workspace.workspaceFolders.length, 0, { uri });
        }
        else if (result === openNewWindow) {
            vscode_1.commands.executeCommand('vscode.openFolder', uri, true);
        }
        else {
            await this.model.openRepository(repositoryPath);
        }
    }
    async openRepository(path) {
        if (!path) {
            const result = await vscode_1.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                defaultUri: vscode_1.Uri.file(os.homedir()),
                openLabel: vscode_1.l10n.t('Open Repository')
            });
            if (!result || result.length === 0) {
                return;
            }
            path = result[0].fsPath;
        }
        await this.model.openRepository(path, true);
    }
    async reopenClosedRepositories() {
        if (this.model.closedRepositories.length === 0) {
            return;
        }
        const closedRepositories = [];
        const title = vscode_1.l10n.t('Reopen Closed Repositories');
        const placeHolder = vscode_1.l10n.t('Pick a repository to reopen');
        const allRepositoriesLabel = vscode_1.l10n.t('All Repositories');
        const allRepositoriesQuickPickItem = { label: allRepositoriesLabel };
        const repositoriesQuickPickItems = this.model.closedRepositories
            .sort(compareRepositoryLabel).map(r => new RepositoryItem(r));
        const items = this.model.closedRepositories.length === 1 ? [...repositoriesQuickPickItems] :
            [...repositoriesQuickPickItems, { label: '', kind: vscode_1.QuickPickItemKind.Separator }, allRepositoriesQuickPickItem];
        const repositoryItem = await vscode_1.window.showQuickPick(items, { title, placeHolder });
        if (!repositoryItem) {
            return;
        }
        if (repositoryItem === allRepositoriesQuickPickItem) {
            // All Repositories
            closedRepositories.push(...this.model.closedRepositories.values());
        }
        else {
            // One Repository
            closedRepositories.push(repositoryItem.path);
        }
        for (const repository of closedRepositories) {
            await this.model.openRepository(repository, true);
        }
    }
    async close(repository) {
        this.model.close(repository);
    }
    async openFile(arg, ...resourceStates) {
        const preserveFocus = arg instanceof repository_1.Resource;
        let uris;
        if (arg instanceof vscode_1.Uri) {
            if ((0, uri_1.isGitUri)(arg)) {
                uris = [vscode_1.Uri.file((0, uri_1.fromGitUri)(arg).path)];
            }
            else if (arg.scheme === 'file') {
                uris = [arg];
            }
        }
        else {
            let resource = arg;
            if (!(resource instanceof repository_1.Resource)) {
                // can happen when called from a keybinding
                resource = this.getSCMResource();
            }
            if (resource) {
                uris = [resource, ...resourceStates]
                    .filter(r => r.type !== 6 /* Status.DELETED */ && r.type !== 2 /* Status.INDEX_DELETED */)
                    .map(r => r.resourceUri);
            }
            else if (vscode_1.window.activeTextEditor) {
                uris = [vscode_1.window.activeTextEditor.document.uri];
            }
        }
        if (!uris) {
            return;
        }
        const activeTextEditor = vscode_1.window.activeTextEditor;
        // Must extract these now because opening a new document will change the activeTextEditor reference
        const previousVisibleRange = activeTextEditor?.visibleRanges[0];
        const previousURI = activeTextEditor?.document.uri;
        const previousSelection = activeTextEditor?.selection;
        for (const uri of uris) {
            const opts = {
                preserveFocus,
                preview: false,
                viewColumn: vscode_1.ViewColumn.Active
            };
            await vscode_1.commands.executeCommand('vscode.open', uri, {
                ...opts,
                override: arg instanceof repository_1.Resource && arg.type === 18 /* Status.BOTH_MODIFIED */ ? false : undefined
            });
            const document = vscode_1.window.activeTextEditor?.document;
            // If the document doesn't match what we opened then don't attempt to select the range
            // Additionally if there was no previous document we don't have information to select a range
            if (document?.uri.toString() !== uri.toString() || !activeTextEditor || !previousURI || !previousSelection) {
                continue;
            }
            // Check if active text editor has same path as other editor. we cannot compare via
            // URI.toString() here because the schemas can be different. Instead we just go by path.
            if (previousURI.path === uri.path && document) {
                // preserve not only selection but also visible range
                opts.selection = previousSelection;
                const editor = await vscode_1.window.showTextDocument(document, opts);
                // This should always be defined but just in case
                if (previousVisibleRange) {
                    editor.revealRange(previousVisibleRange);
                }
            }
        }
    }
    async openFile2(arg, ...resourceStates) {
        this.openFile(arg, ...resourceStates);
    }
    async openHEADFile(arg) {
        let resource = undefined;
        const preview = !(arg instanceof repository_1.Resource);
        if (arg instanceof repository_1.Resource) {
            resource = arg;
        }
        else if (arg instanceof vscode_1.Uri) {
            resource = this.getSCMResource(arg);
        }
        else {
            resource = this.getSCMResource();
        }
        if (!resource) {
            return;
        }
        const HEAD = resource.leftUri;
        const basename = path.basename(resource.resourceUri.fsPath);
        const title = `${basename} (HEAD)`;
        if (!HEAD) {
            vscode_1.window.showWarningMessage(vscode_1.l10n.t('HEAD version of "{0}" is not available.', path.basename(resource.resourceUri.fsPath)));
            return;
        }
        const opts = {
            preview
        };
        return await vscode_1.commands.executeCommand('vscode.open', HEAD, opts, title);
    }
    async openChange(arg, ...resourceStates) {
        let resources = undefined;
        if (arg instanceof vscode_1.Uri) {
            const resource = this.getSCMResource(arg);
            if (resource !== undefined) {
                resources = [resource];
            }
        }
        else {
            let resource = undefined;
            if (arg instanceof repository_1.Resource) {
                resource = arg;
            }
            else {
                resource = this.getSCMResource();
            }
            if (resource) {
                resources = [...resourceStates, resource];
            }
        }
        if (!resources) {
            return;
        }
        for (const resource of resources) {
            await resource.openChange();
        }
    }
    async rename(repository, fromUri) {
        fromUri = fromUri ?? vscode_1.window.activeTextEditor?.document.uri;
        if (!fromUri) {
            return;
        }
        const from = (0, util_1.relativePath)(repository.root, fromUri.fsPath);
        let to = await vscode_1.window.showInputBox({
            value: from,
            valueSelection: [from.length - path.basename(from).length, from.length]
        });
        to = to?.trim();
        if (!to) {
            return;
        }
        await repository.move(from, to);
    }
    async stage(...resourceStates) {
        this.logger.debug(`git.stage ${resourceStates.length} `);
        resourceStates = resourceStates.filter(s => !!s);
        if (resourceStates.length === 0 || (resourceStates[0] && !(resourceStates[0].resourceUri instanceof vscode_1.Uri))) {
            const resource = this.getSCMResource();
            this.logger.debug(`git.stage.getSCMResource ${resource ? resource.resourceUri.toString() : null} `);
            if (!resource) {
                return;
            }
            resourceStates = [resource];
        }
        const selection = resourceStates.filter(s => s instanceof repository_1.Resource);
        const { resolved, unresolved, deletionConflicts } = await categorizeResourceByResolution(selection);
        if (unresolved.length > 0) {
            const message = unresolved.length > 1
                ? vscode_1.l10n.t('Are you sure you want to stage {0} files with merge conflicts?', unresolved.length)
                : vscode_1.l10n.t('Are you sure you want to stage {0} with merge conflicts?', path.basename(unresolved[0].resourceUri.fsPath));
            const yes = vscode_1.l10n.t('Yes');
            const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yes);
            if (pick !== yes) {
                return;
            }
        }
        try {
            await this.runByRepository(deletionConflicts.map(r => r.resourceUri), async (repository, resources) => {
                for (const resource of resources) {
                    await this._stageDeletionConflict(repository, resource);
                }
            });
        }
        catch (err) {
            if (/Cancelled/.test(err.message)) {
                return;
            }
            throw err;
        }
        const workingTree = selection.filter(s => s.resourceGroupType === 2 /* ResourceGroupType.WorkingTree */);
        const untracked = selection.filter(s => s.resourceGroupType === 3 /* ResourceGroupType.Untracked */);
        const scmResources = [...workingTree, ...untracked, ...resolved, ...unresolved];
        this.logger.debug(`git.stage.scmResources ${scmResources.length} `);
        if (!scmResources.length) {
            return;
        }
        const resources = scmResources.map(r => r.resourceUri);
        await this.runByRepository(resources, async (repository, resources) => repository.add(resources));
    }
    async stageAll(repository) {
        const resources = [...repository.workingTreeGroup.resourceStates, ...repository.untrackedGroup.resourceStates];
        const uris = resources.map(r => r.resourceUri);
        if (uris.length > 0) {
            const config = vscode_1.workspace.getConfiguration('git', vscode_1.Uri.file(repository.root));
            const untrackedChanges = config.get('untrackedChanges');
            await repository.add(uris, untrackedChanges === 'mixed' ? undefined : { update: true });
        }
    }
    async _stageDeletionConflict(repository, uri) {
        const uriString = uri.toString();
        const resource = repository.mergeGroup.resourceStates.filter(r => r.resourceUri.toString() === uriString)[0];
        if (!resource) {
            return;
        }
        if (resource.type === 15 /* Status.DELETED_BY_THEM */) {
            const keepIt = vscode_1.l10n.t('Keep Our Version');
            const deleteIt = vscode_1.l10n.t('Delete File');
            const result = await vscode_1.window.showInformationMessage(vscode_1.l10n.t('File "{0}" was deleted by them and modified by us.\n\nWhat would you like to do?', path.basename(uri.fsPath)), { modal: true }, keepIt, deleteIt);
            if (result === keepIt) {
                await repository.add([uri]);
            }
            else if (result === deleteIt) {
                await repository.rm([uri]);
            }
            else {
                throw new Error('Cancelled');
            }
        }
        else if (resource.type === 14 /* Status.DELETED_BY_US */) {
            const keepIt = vscode_1.l10n.t('Keep Their Version');
            const deleteIt = vscode_1.l10n.t('Delete File');
            const result = await vscode_1.window.showInformationMessage(vscode_1.l10n.t('File "{0}" was deleted by us and modified by them.\n\nWhat would you like to do?', path.basename(uri.fsPath)), { modal: true }, keepIt, deleteIt);
            if (result === keepIt) {
                await repository.add([uri]);
            }
            else if (result === deleteIt) {
                await repository.rm([uri]);
            }
            else {
                throw new Error('Cancelled');
            }
        }
    }
    async stageAllTracked(repository) {
        const resources = repository.workingTreeGroup.resourceStates
            .filter(r => r.type !== 7 /* Status.UNTRACKED */ && r.type !== 8 /* Status.IGNORED */);
        const uris = resources.map(r => r.resourceUri);
        await repository.add(uris);
    }
    async stageAllUntracked(repository) {
        const resources = [...repository.workingTreeGroup.resourceStates, ...repository.untrackedGroup.resourceStates]
            .filter(r => r.type === 7 /* Status.UNTRACKED */ || r.type === 8 /* Status.IGNORED */);
        const uris = resources.map(r => r.resourceUri);
        await repository.add(uris);
    }
    async stageAllMerge(repository) {
        const resources = repository.mergeGroup.resourceStates.filter(s => s instanceof repository_1.Resource);
        const { merge, unresolved, deletionConflicts } = await categorizeResourceByResolution(resources);
        try {
            for (const deletionConflict of deletionConflicts) {
                await this._stageDeletionConflict(repository, deletionConflict.resourceUri);
            }
        }
        catch (err) {
            if (/Cancelled/.test(err.message)) {
                return;
            }
            throw err;
        }
        if (unresolved.length > 0) {
            const message = unresolved.length > 1
                ? vscode_1.l10n.t('Are you sure you want to stage {0} files with merge conflicts?', merge.length)
                : vscode_1.l10n.t('Are you sure you want to stage {0} with merge conflicts?', path.basename(merge[0].resourceUri.fsPath));
            const yes = vscode_1.l10n.t('Yes');
            const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yes);
            if (pick !== yes) {
                return;
            }
        }
        const uris = resources.map(r => r.resourceUri);
        if (uris.length > 0) {
            await repository.add(uris);
        }
    }
    async stageChange(uri, changes, index) {
        if (!uri) {
            return;
        }
        const textEditor = vscode_1.window.visibleTextEditors.filter(e => e.document.uri.toString() === uri.toString())[0];
        if (!textEditor) {
            return;
        }
        await this._stageChanges(textEditor, [changes[index]]);
        const firstStagedLine = changes[index].modifiedStartLineNumber;
        textEditor.selections = [new vscode_1.Selection(firstStagedLine, 0, firstStagedLine, 0)];
    }
    async stageSelectedChanges(changes) {
        const textEditor = vscode_1.window.activeTextEditor;
        if (!textEditor) {
            return;
        }
        const modifiedDocument = textEditor.document;
        const selectedLines = (0, staging_1.toLineRanges)(textEditor.selections, modifiedDocument);
        const selectedChanges = changes
            .map(diff => selectedLines.reduce((result, range) => result || (0, staging_1.intersectDiffWithRange)(modifiedDocument, diff, range), null))
            .filter(d => !!d);
        if (!selectedChanges.length) {
            vscode_1.window.showInformationMessage(vscode_1.l10n.t('The selection range does not contain any changes.'));
            return;
        }
        await this._stageChanges(textEditor, selectedChanges);
    }
    async acceptMerge(_uri) {
        const { activeTab } = vscode_1.window.tabGroups.activeTabGroup;
        if (!activeTab) {
            return;
        }
        if (!(activeTab.input instanceof vscode_1.TabInputTextMerge)) {
            return;
        }
        const uri = activeTab.input.result;
        const repository = this.model.getRepository(uri);
        if (!repository) {
            console.log(`FAILED to complete merge because uri ${uri.toString()} doesn't belong to any repository`);
            return;
        }
        const result = await vscode_1.commands.executeCommand('mergeEditor.acceptMerge');
        if (result.successful) {
            await repository.add([uri]);
            await vscode_1.commands.executeCommand('workbench.view.scm');
        }
        /*
        if (!(uri instanceof Uri)) {
            return;
        }




        // make sure to save the merged document
        const doc = workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
        if (!doc) {
            console.log(`FAILED to complete merge because uri ${uri.toString()} doesn't match a document`);
            return;
        }
        if (doc.isDirty) {
            await doc.save();
        }

        // find the merge editor tabs for the resource in question and close them all
        let didCloseTab = false;
        const mergeEditorTabs = window.tabGroups.all.map(group => group.tabs.filter(tab => tab.input instanceof TabInputTextMerge && tab.input.result.toString() === uri.toString())).flat();
        if (mergeEditorTabs.includes(activeTab)) {
            didCloseTab = await window.tabGroups.close(mergeEditorTabs, true);
        }

        // Only stage if the merge editor has been successfully closed. That means all conflicts have been
        // handled or unhandled conflicts are OK by the user.
        if (didCloseTab) {
            await repository.add([uri]);
            await commands.executeCommand('workbench.view.scm');
        }*/
    }
    async runGitMergeNoDiff3() {
        await this.runGitMerge(false);
    }
    async runGitMergeDiff3() {
        await this.runGitMerge(true);
    }
    async runGitMerge(diff3) {
        const { activeTab } = vscode_1.window.tabGroups.activeTabGroup;
        if (!activeTab) {
            return;
        }
        const input = activeTab.input;
        if (!(input instanceof vscode_1.TabInputTextMerge)) {
            return;
        }
        const result = await this.git.mergeFile({
            basePath: input.base.fsPath,
            input1Path: input.input1.fsPath,
            input2Path: input.input2.fsPath,
            diff3,
        });
        const doc = vscode_1.workspace.textDocuments.find(doc => doc.uri.toString() === input.result.toString());
        if (!doc) {
            return;
        }
        const e = new vscode_1.WorkspaceEdit();
        e.replace(input.result, new vscode_1.Range(new vscode_1.Position(0, 0), new vscode_1.Position(doc.lineCount, 0)), result);
        await vscode_1.workspace.applyEdit(e);
    }
    async _stageChanges(textEditor, changes) {
        const modifiedDocument = textEditor.document;
        const modifiedUri = modifiedDocument.uri;
        if (modifiedUri.scheme !== 'file') {
            return;
        }
        const originalUri = (0, uri_1.toGitUri)(modifiedUri, '~');
        const originalDocument = await vscode_1.workspace.openTextDocument(originalUri);
        const result = (0, staging_1.applyLineChanges)(originalDocument, modifiedDocument, changes);
        await this.runByRepository(modifiedUri, async (repository, resource) => await repository.stage(resource, result));
    }
    async revertChange(uri, changes, index) {
        if (!uri) {
            return;
        }
        const textEditor = vscode_1.window.visibleTextEditors.filter(e => e.document.uri.toString() === uri.toString())[0];
        if (!textEditor) {
            return;
        }
        await this._revertChanges(textEditor, [...changes.slice(0, index), ...changes.slice(index + 1)]);
        const firstStagedLine = changes[index].modifiedStartLineNumber;
        textEditor.selections = [new vscode_1.Selection(firstStagedLine, 0, firstStagedLine, 0)];
    }
    async revertSelectedRanges(changes) {
        const textEditor = vscode_1.window.activeTextEditor;
        if (!textEditor) {
            return;
        }
        const modifiedDocument = textEditor.document;
        const selections = textEditor.selections;
        const selectedChanges = changes.filter(change => {
            const modifiedRange = (0, staging_1.getModifiedRange)(modifiedDocument, change);
            return selections.every(selection => !selection.intersection(modifiedRange));
        });
        if (selectedChanges.length === changes.length) {
            vscode_1.window.showInformationMessage(vscode_1.l10n.t('The selection range does not contain any changes.'));
            return;
        }
        const selectionsBeforeRevert = textEditor.selections;
        await this._revertChanges(textEditor, selectedChanges);
        textEditor.selections = selectionsBeforeRevert;
    }
    async _revertChanges(textEditor, changes) {
        const modifiedDocument = textEditor.document;
        const modifiedUri = modifiedDocument.uri;
        if (modifiedUri.scheme !== 'file') {
            return;
        }
        const originalUri = (0, uri_1.toGitUri)(modifiedUri, '~');
        const originalDocument = await vscode_1.workspace.openTextDocument(originalUri);
        const visibleRangesBeforeRevert = textEditor.visibleRanges;
        const result = (0, staging_1.applyLineChanges)(originalDocument, modifiedDocument, changes);
        const edit = new vscode_1.WorkspaceEdit();
        edit.replace(modifiedUri, new vscode_1.Range(new vscode_1.Position(0, 0), modifiedDocument.lineAt(modifiedDocument.lineCount - 1).range.end), result);
        vscode_1.workspace.applyEdit(edit);
        await modifiedDocument.save();
        textEditor.revealRange(visibleRangesBeforeRevert[0]);
    }
    async unstage(...resourceStates) {
        resourceStates = resourceStates.filter(s => !!s);
        if (resourceStates.length === 0 || (resourceStates[0] && !(resourceStates[0].resourceUri instanceof vscode_1.Uri))) {
            const resource = this.getSCMResource();
            if (!resource) {
                return;
            }
            resourceStates = [resource];
        }
        const scmResources = resourceStates
            .filter(s => s instanceof repository_1.Resource && s.resourceGroupType === 1 /* ResourceGroupType.Index */);
        if (!scmResources.length) {
            return;
        }
        const resources = scmResources.map(r => r.resourceUri);
        await this.runByRepository(resources, async (repository, resources) => repository.revert(resources));
    }
    async unstageAll(repository) {
        await repository.revert([]);
    }
    async unstageSelectedRanges(diffs) {
        const textEditor = vscode_1.window.activeTextEditor;
        if (!textEditor) {
            return;
        }
        const modifiedDocument = textEditor.document;
        const modifiedUri = modifiedDocument.uri;
        if (!(0, uri_1.isGitUri)(modifiedUri)) {
            return;
        }
        const { ref } = (0, uri_1.fromGitUri)(modifiedUri);
        if (ref !== '') {
            return;
        }
        const originalUri = (0, uri_1.toGitUri)(modifiedUri, 'HEAD');
        const originalDocument = await vscode_1.workspace.openTextDocument(originalUri);
        const selectedLines = (0, staging_1.toLineRanges)(textEditor.selections, modifiedDocument);
        const selectedDiffs = diffs
            .map(diff => selectedLines.reduce((result, range) => result || (0, staging_1.intersectDiffWithRange)(modifiedDocument, diff, range), null))
            .filter(d => !!d);
        if (!selectedDiffs.length) {
            vscode_1.window.showInformationMessage(vscode_1.l10n.t('The selection range does not contain any changes.'));
            return;
        }
        const invertedDiffs = selectedDiffs.map(staging_1.invertLineChange);
        const result = (0, staging_1.applyLineChanges)(modifiedDocument, originalDocument, invertedDiffs);
        await this.runByRepository(modifiedUri, async (repository, resource) => await repository.stage(resource, result));
    }
    async clean(...resourceStates) {
        // Remove duplicate resources
        const resourceUris = new Set();
        resourceStates = resourceStates.filter(s => {
            if (s === undefined) {
                return false;
            }
            if (resourceUris.has(s.resourceUri.toString())) {
                return false;
            }
            resourceUris.add(s.resourceUri.toString());
            return true;
        });
        if (resourceStates.length === 0 || (resourceStates[0] && !(resourceStates[0].resourceUri instanceof vscode_1.Uri))) {
            const resource = this.getSCMResource();
            if (!resource) {
                return;
            }
            resourceStates = [resource];
        }
        const scmResources = resourceStates.filter(s => s instanceof repository_1.Resource
            && (s.resourceGroupType === 2 /* ResourceGroupType.WorkingTree */ || s.resourceGroupType === 3 /* ResourceGroupType.Untracked */));
        if (!scmResources.length) {
            return;
        }
        const untrackedCount = scmResources.reduce((s, r) => s + (r.type === 7 /* Status.UNTRACKED */ ? 1 : 0), 0);
        let message;
        let yes = vscode_1.l10n.t('Discard Changes');
        if (scmResources.length === 1) {
            if (untrackedCount > 0) {
                message = vscode_1.l10n.t('Are you sure you want to DELETE {0}?\nThis is IRREVERSIBLE!\nThis file will be FOREVER LOST if you proceed.', path.basename(scmResources[0].resourceUri.fsPath));
                yes = vscode_1.l10n.t('Delete file');
            }
            else {
                if (scmResources[0].type === 6 /* Status.DELETED */) {
                    yes = vscode_1.l10n.t('Restore file');
                    message = vscode_1.l10n.t('Are you sure you want to restore {0}?', path.basename(scmResources[0].resourceUri.fsPath));
                }
                else {
                    message = vscode_1.l10n.t('Are you sure you want to discard changes in {0}?', path.basename(scmResources[0].resourceUri.fsPath));
                }
            }
        }
        else {
            if (scmResources.every(resource => resource.type === 6 /* Status.DELETED */)) {
                yes = vscode_1.l10n.t('Restore files');
                message = vscode_1.l10n.t('Are you sure you want to restore {0} files?', scmResources.length);
            }
            else {
                message = vscode_1.l10n.t('Are you sure you want to discard changes in {0} files?', scmResources.length);
            }
            if (untrackedCount > 0) {
                message = `${message}\n\n${vscode_1.l10n.t('This will DELETE {0} untracked files!\nThis is IRREVERSIBLE!\nThese files will be FOREVER LOST.', untrackedCount)}`;
            }
        }
        const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yes);
        if (pick !== yes) {
            return;
        }
        const resources = scmResources.map(r => r.resourceUri);
        await this.runByRepository(resources, async (repository, resources) => repository.clean(resources));
    }
    async cleanAll(repository) {
        let resources = repository.workingTreeGroup.resourceStates;
        if (resources.length === 0) {
            return;
        }
        const trackedResources = resources.filter(r => r.type !== 7 /* Status.UNTRACKED */ && r.type !== 8 /* Status.IGNORED */);
        const untrackedResources = resources.filter(r => r.type === 7 /* Status.UNTRACKED */ || r.type === 8 /* Status.IGNORED */);
        if (untrackedResources.length === 0) {
            await this._cleanTrackedChanges(repository, resources);
        }
        else if (resources.length === 1) {
            await this._cleanUntrackedChange(repository, resources[0]);
        }
        else if (trackedResources.length === 0) {
            await this._cleanUntrackedChanges(repository, resources);
        }
        else { // resources.length > 1 && untrackedResources.length > 0 && trackedResources.length > 0
            const untrackedMessage = untrackedResources.length === 1
                ? vscode_1.l10n.t('The following untracked file will be DELETED FROM DISK if discarded: {0}.', path.basename(untrackedResources[0].resourceUri.fsPath))
                : vscode_1.l10n.t('There are {0} untracked files which will be DELETED FROM DISK if discarded.', untrackedResources.length);
            const message = vscode_1.l10n.t('{0}\n\nThis is IRREVERSIBLE, your current working set will be FOREVER LOST.', untrackedMessage, resources.length);
            const yesTracked = trackedResources.length === 1
                ? vscode_1.l10n.t('Discard 1 Tracked File', trackedResources.length)
                : vscode_1.l10n.t('Discard {0} Tracked Files', trackedResources.length);
            const yesAll = vscode_1.l10n.t('Discard All {0} Files', resources.length);
            const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yesTracked, yesAll);
            if (pick === yesTracked) {
                resources = trackedResources;
            }
            else if (pick !== yesAll) {
                return;
            }
            await repository.clean(resources.map(r => r.resourceUri));
        }
    }
    async cleanAllTracked(repository) {
        const resources = repository.workingTreeGroup.resourceStates
            .filter(r => r.type !== 7 /* Status.UNTRACKED */ && r.type !== 8 /* Status.IGNORED */);
        if (resources.length === 0) {
            return;
        }
        await this._cleanTrackedChanges(repository, resources);
    }
    async cleanAllUntracked(repository) {
        const resources = [...repository.workingTreeGroup.resourceStates, ...repository.untrackedGroup.resourceStates]
            .filter(r => r.type === 7 /* Status.UNTRACKED */ || r.type === 8 /* Status.IGNORED */);
        if (resources.length === 0) {
            return;
        }
        if (resources.length === 1) {
            await this._cleanUntrackedChange(repository, resources[0]);
        }
        else {
            await this._cleanUntrackedChanges(repository, resources);
        }
    }
    async _cleanTrackedChanges(repository, resources) {
        const message = resources.length === 1
            ? vscode_1.l10n.t('Are you sure you want to discard changes in {0}?', path.basename(resources[0].resourceUri.fsPath))
            : vscode_1.l10n.t('Are you sure you want to discard ALL changes in {0} files?\nThis is IRREVERSIBLE!\nYour current working set will be FOREVER LOST if you proceed.', resources.length);
        const yes = resources.length === 1
            ? vscode_1.l10n.t('Discard 1 File')
            : vscode_1.l10n.t('Discard All {0} Files', resources.length);
        const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yes);
        if (pick !== yes) {
            return;
        }
        await repository.clean(resources.map(r => r.resourceUri));
    }
    async _cleanUntrackedChange(repository, resource) {
        const message = vscode_1.l10n.t('Are you sure you want to DELETE {0}?\nThis is IRREVERSIBLE!\nThis file will be FOREVER LOST if you proceed.', path.basename(resource.resourceUri.fsPath));
        const yes = vscode_1.l10n.t('Delete file');
        const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yes);
        if (pick !== yes) {
            return;
        }
        await repository.clean([resource.resourceUri]);
    }
    async _cleanUntrackedChanges(repository, resources) {
        const message = vscode_1.l10n.t('Are you sure you want to DELETE {0} files?\nThis is IRREVERSIBLE!\nThese files will be FOREVER LOST if you proceed.', resources.length);
        const yes = vscode_1.l10n.t('Delete Files');
        const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yes);
        if (pick !== yes) {
            return;
        }
        await repository.clean(resources.map(r => r.resourceUri));
    }
    async smartCommit(repository, getCommitMessage, opts) {
        const config = vscode_1.workspace.getConfiguration('git', vscode_1.Uri.file(repository.root));
        let promptToSaveFilesBeforeCommit = config.get('promptToSaveFilesBeforeCommit');
        // migration
        if (promptToSaveFilesBeforeCommit === true) {
            promptToSaveFilesBeforeCommit = 'always';
        }
        else if (promptToSaveFilesBeforeCommit === false) {
            promptToSaveFilesBeforeCommit = 'never';
        }
        const enableSmartCommit = config.get('enableSmartCommit') === true;
        const enableCommitSigning = config.get('enableCommitSigning') === true;
        let noStagedChanges = repository.indexGroup.resourceStates.length === 0;
        let noUnstagedChanges = repository.workingTreeGroup.resourceStates.length === 0;
        if (promptToSaveFilesBeforeCommit !== 'never') {
            let documents = vscode_1.workspace.textDocuments
                .filter(d => !d.isUntitled && d.isDirty && (0, util_1.isDescendant)(repository.root, d.uri.fsPath));
            if (promptToSaveFilesBeforeCommit === 'staged' || repository.indexGroup.resourceStates.length > 0) {
                documents = documents
                    .filter(d => repository.indexGroup.resourceStates.some(s => (0, util_1.pathEquals)(s.resourceUri.fsPath, d.uri.fsPath)));
            }
            if (documents.length > 0) {
                const message = documents.length === 1
                    ? vscode_1.l10n.t('The following file has unsaved changes which won\'t be included in the commit if you proceed: {0}.\n\nWould you like to save it before committing?', path.basename(documents[0].uri.fsPath))
                    : vscode_1.l10n.t('There are {0} unsaved files.\n\nWould you like to save them before committing?', documents.length);
                const saveAndCommit = vscode_1.l10n.t('Save All & Commit Changes');
                const commit = vscode_1.l10n.t('Commit Changes');
                const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, saveAndCommit, commit);
                if (pick === saveAndCommit) {
                    await Promise.all(documents.map(d => d.save()));
                    // After saving the dirty documents, if there are any documents that are part of the
                    // index group we have to add them back in order for the saved changes to be committed
                    documents = documents
                        .filter(d => repository.indexGroup.resourceStates.some(s => (0, util_1.pathEquals)(s.resourceUri.fsPath, d.uri.fsPath)));
                    await repository.add(documents.map(d => d.uri));
                    noStagedChanges = repository.indexGroup.resourceStates.length === 0;
                    noUnstagedChanges = repository.workingTreeGroup.resourceStates.length === 0;
                }
                else if (pick !== commit) {
                    return; // do not commit on cancel
                }
            }
        }
        // no changes, and the user has not configured to commit all in this case
        if (!noUnstagedChanges && noStagedChanges && !enableSmartCommit && !opts.empty && !opts.all) {
            const suggestSmartCommit = config.get('suggestSmartCommit') === true;
            if (!suggestSmartCommit) {
                return;
            }
            // prompt the user if we want to commit all or not
            const message = vscode_1.l10n.t('There are no staged changes to commit.\n\nWould you like to stage all your changes and commit them directly?');
            const yes = vscode_1.l10n.t('Yes');
            const always = vscode_1.l10n.t('Always');
            const never = vscode_1.l10n.t('Never');
            const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yes, always, never);
            if (pick === always) {
                config.update('enableSmartCommit', true, true);
            }
            else if (pick === never) {
                config.update('suggestSmartCommit', false, true);
                return;
            }
            else if (pick !== yes) {
                return; // do not commit on cancel
            }
        }
        if (opts.all === undefined) {
            opts = { ...opts, all: noStagedChanges };
        }
        else if (!opts.all && noStagedChanges && !opts.empty) {
            opts = { ...opts, all: true };
        }
        // enable signing of commits if configured
        opts.signCommit = enableCommitSigning;
        if (config.get('alwaysSignOff')) {
            opts.signoff = true;
        }
        if (config.get('useEditorAsCommitInput')) {
            opts.useEditor = true;
            if (config.get('verboseCommit')) {
                opts.verbose = true;
            }
        }
        const smartCommitChanges = config.get('smartCommitChanges');
        if ((
        // no changes
        (noStagedChanges && noUnstagedChanges)
            // or no staged changes and not `all`
            || (!opts.all && noStagedChanges)
            // no staged changes and no tracked unstaged changes
            || (noStagedChanges && smartCommitChanges === 'tracked' && repository.workingTreeGroup.resourceStates.every(r => r.type === 7 /* Status.UNTRACKED */)))
            // amend allows changing only the commit message
            && !opts.amend
            && !opts.empty
            // rebase not in progress
            && repository.rebaseCommit === undefined) {
            const commitAnyway = vscode_1.l10n.t('Create Empty Commit');
            const answer = await vscode_1.window.showInformationMessage(vscode_1.l10n.t('There are no changes to commit.'), commitAnyway);
            if (answer !== commitAnyway) {
                return;
            }
            opts.empty = true;
        }
        if (opts.noVerify) {
            if (!config.get('allowNoVerifyCommit')) {
                await vscode_1.window.showErrorMessage(vscode_1.l10n.t('Commits without verification are not allowed, please enable them with the "git.allowNoVerifyCommit" setting.'));
                return;
            }
            if (config.get('confirmNoVerifyCommit')) {
                const message = vscode_1.l10n.t('You are about to commit your changes without verification, this skips pre-commit hooks and can be undesirable.\n\nAre you sure to continue?');
                const yes = vscode_1.l10n.t('OK');
                const neverAgain = vscode_1.l10n.t('OK, Don\'t Ask Again');
                const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yes, neverAgain);
                if (pick === neverAgain) {
                    config.update('confirmNoVerifyCommit', false, true);
                }
                else if (pick !== yes) {
                    return;
                }
            }
        }
        const message = await getCommitMessage();
        if (!message && !opts.amend && !opts.useEditor) {
            return;
        }
        if (opts.all && smartCommitChanges === 'tracked') {
            opts.all = 'tracked';
        }
        if (opts.all && config.get('untrackedChanges') !== 'mixed') {
            opts.all = 'tracked';
        }
        // Branch protection
        const branchProtectionPrompt = config.get('branchProtectionPrompt');
        if (repository.isBranchProtected() && (branchProtectionPrompt === 'alwaysPrompt' || branchProtectionPrompt === 'alwaysCommitToNewBranch')) {
            const commitToNewBranch = vscode_1.l10n.t('Commit to a New Branch');
            let pick = commitToNewBranch;
            if (branchProtectionPrompt === 'alwaysPrompt') {
                const message = vscode_1.l10n.t('You are trying to commit to a protected branch and you might not have permission to push your commits to the remote.\n\nHow would you like to proceed?');
                const commit = vscode_1.l10n.t('Commit Anyway');
                pick = await vscode_1.window.showWarningMessage(message, { modal: true }, commitToNewBranch, commit);
            }
            if (!pick) {
                return;
            }
            else if (pick === commitToNewBranch) {
                const branchName = await this.promptForBranchName(repository);
                if (!branchName) {
                    return;
                }
                await repository.branch(branchName, true);
            }
        }
        await repository.commit(message, opts);
    }
    async commitWithAnyInput(repository, opts) {
        const message = repository.inputBox.value;
        const root = vscode_1.Uri.file(repository.root);
        const config = vscode_1.workspace.getConfiguration('git', root);
        const getCommitMessage = async () => {
            let _message = message;
            if (!_message && !config.get('useEditorAsCommitInput')) {
                const value = undefined;
                if (opts && opts.amend && repository.HEAD && repository.HEAD.commit) {
                    return undefined;
                }
                const branchName = repository.headShortName;
                let placeHolder;
                if (branchName) {
                    placeHolder = vscode_1.l10n.t('Message (commit on "{0}")', branchName);
                }
                else {
                    placeHolder = vscode_1.l10n.t('Commit message');
                }
                _message = await vscode_1.window.showInputBox({
                    value,
                    placeHolder,
                    prompt: vscode_1.l10n.t('Please provide a commit message'),
                    ignoreFocusOut: true
                });
            }
            return _message;
        };
        await this.smartCommit(repository, getCommitMessage, opts);
    }
    async commit(repository, postCommitCommand) {
        await this.commitWithAnyInput(repository, { postCommitCommand });
    }
    async commitAmend(repository) {
        await this.commitWithAnyInput(repository, { amend: true });
    }
    async commitSigned(repository) {
        await this.commitWithAnyInput(repository, { signoff: true });
    }
    async commitStaged(repository) {
        await this.commitWithAnyInput(repository, { all: false });
    }
    async commitStagedSigned(repository) {
        await this.commitWithAnyInput(repository, { all: false, signoff: true });
    }
    async commitStagedAmend(repository) {
        await this.commitWithAnyInput(repository, { all: false, amend: true });
    }
    async commitAll(repository) {
        await this.commitWithAnyInput(repository, { all: true });
    }
    async commitAllSigned(repository) {
        await this.commitWithAnyInput(repository, { all: true, signoff: true });
    }
    async commitAllAmend(repository) {
        await this.commitWithAnyInput(repository, { all: true, amend: true });
    }
    async commitMessageAccept(arg) {
        if (!arg && !vscode_1.window.activeTextEditor) {
            return;
        }
        arg ?? (arg = vscode_1.window.activeTextEditor.document.uri);
        // Close the tab
        this._closeEditorTab(arg);
    }
    async commitMessageDiscard(arg) {
        if (!arg && !vscode_1.window.activeTextEditor) {
            return;
        }
        arg ?? (arg = vscode_1.window.activeTextEditor.document.uri);
        // Clear the contents of the editor
        const editors = vscode_1.window.visibleTextEditors
            .filter(e => e.document.languageId === 'git-commit' && e.document.uri.toString() === arg.toString());
        if (editors.length !== 1) {
            return;
        }
        const commitMsgEditor = editors[0];
        const commitMsgDocument = commitMsgEditor.document;
        const editResult = await commitMsgEditor.edit(builder => {
            const firstLine = commitMsgDocument.lineAt(0);
            const lastLine = commitMsgDocument.lineAt(commitMsgDocument.lineCount - 1);
            builder.delete(new vscode_1.Range(firstLine.range.start, lastLine.range.end));
        });
        if (!editResult) {
            return;
        }
        // Save the document
        const saveResult = await commitMsgDocument.save();
        if (!saveResult) {
            return;
        }
        // Close the tab
        this._closeEditorTab(arg);
    }
    _closeEditorTab(uri) {
        const tabToClose = vscode_1.window.tabGroups.all.map(g => g.tabs).flat()
            .filter(t => t.input instanceof vscode_1.TabInputText && t.input.uri.toString() === uri.toString());
        vscode_1.window.tabGroups.close(tabToClose);
    }
    async _commitEmpty(repository, noVerify) {
        const root = vscode_1.Uri.file(repository.root);
        const config = vscode_1.workspace.getConfiguration('git', root);
        const shouldPrompt = config.get('confirmEmptyCommits') === true;
        if (shouldPrompt) {
            const message = vscode_1.l10n.t('Are you sure you want to create an empty commit?');
            const yes = vscode_1.l10n.t('Yes');
            const neverAgain = vscode_1.l10n.t('Yes, Don\'t Show Again');
            const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yes, neverAgain);
            if (pick === neverAgain) {
                await config.update('confirmEmptyCommits', false, true);
            }
            else if (pick !== yes) {
                return;
            }
        }
        await this.commitWithAnyInput(repository, { empty: true, noVerify });
    }
    async commitEmpty(repository) {
        await this._commitEmpty(repository);
    }
    async commitNoVerify(repository) {
        await this.commitWithAnyInput(repository, { noVerify: true });
    }
    async commitStagedNoVerify(repository) {
        await this.commitWithAnyInput(repository, { all: false, noVerify: true });
    }
    async commitStagedSignedNoVerify(repository) {
        await this.commitWithAnyInput(repository, { all: false, signoff: true, noVerify: true });
    }
    async commitAmendNoVerify(repository) {
        await this.commitWithAnyInput(repository, { amend: true, noVerify: true });
    }
    async commitSignedNoVerify(repository) {
        await this.commitWithAnyInput(repository, { signoff: true, noVerify: true });
    }
    async commitStagedAmendNoVerify(repository) {
        await this.commitWithAnyInput(repository, { all: false, amend: true, noVerify: true });
    }
    async commitAllNoVerify(repository) {
        await this.commitWithAnyInput(repository, { all: true, noVerify: true });
    }
    async commitAllSignedNoVerify(repository) {
        await this.commitWithAnyInput(repository, { all: true, signoff: true, noVerify: true });
    }
    async commitAllAmendNoVerify(repository) {
        await this.commitWithAnyInput(repository, { all: true, amend: true, noVerify: true });
    }
    async commitEmptyNoVerify(repository) {
        await this._commitEmpty(repository, true);
    }
    async restoreCommitTemplate(repository) {
        repository.inputBox.value = await repository.getCommitTemplate();
    }
    async undoCommit(repository) {
        const HEAD = repository.HEAD;
        if (!HEAD || !HEAD.commit) {
            vscode_1.window.showWarningMessage(vscode_1.l10n.t('Can\'t undo because HEAD doesn\'t point to any commit.'));
            return;
        }
        const commit = await repository.getCommit('HEAD');
        if (commit.parents.length > 1) {
            const yes = vscode_1.l10n.t('Undo merge commit');
            const result = await vscode_1.window.showWarningMessage(vscode_1.l10n.t('The last commit was a merge commit. Are you sure you want to undo it?'), { modal: true }, yes);
            if (result !== yes) {
                return;
            }
        }
        if (commit.parents.length > 0) {
            await repository.reset('HEAD~');
        }
        else {
            await repository.deleteRef('HEAD');
            await this.unstageAll(repository);
        }
        repository.inputBox.value = commit.message;
    }
    async checkout(repository, treeish) {
        return this._checkout(repository, { treeish });
    }
    async checkoutDetached(repository, treeish) {
        return this._checkout(repository, { detached: true, treeish });
    }
    async _checkout(repository, opts) {
        if (typeof opts?.treeish === 'string') {
            await repository.checkout(opts?.treeish, opts);
            return true;
        }
        const createBranch = new CreateBranchItem();
        const createBranchFrom = new CreateBranchFromItem();
        const checkoutDetached = new CheckoutDetachedItem();
        const picks = [];
        if (!opts?.detached) {
            picks.push(createBranch, createBranchFrom, checkoutDetached, { label: '', kind: vscode_1.QuickPickItemKind.Separator });
        }
        const quickpick = vscode_1.window.createQuickPick();
        quickpick.busy = true;
        quickpick.placeholder = opts?.detached
            ? vscode_1.l10n.t('Select a branch to checkout in detached mode')
            : vscode_1.l10n.t('Select a branch or tag to checkout');
        quickpick.show();
        picks.push(...await createCheckoutItems(repository, opts?.detached));
        quickpick.items = picks;
        quickpick.busy = false;
        const choice = await new Promise(c => {
            quickpick.onDidAccept(() => c(quickpick.activeItems[0]));
            quickpick.onDidTriggerItemButton((e) => {
                quickpick.hide();
                const button = e.button;
                const item = e.item;
                if (button.actual && item.refName) {
                    button.actual.run(item.refRemote ? item.refName.substring(item.refRemote.length + 1) : item.refName);
                }
            });
        });
        quickpick.hide();
        if (!choice) {
            return false;
        }
        if (choice === createBranch) {
            await this._branch(repository, quickpick.value);
        }
        else if (choice === createBranchFrom) {
            await this._branch(repository, quickpick.value, true);
        }
        else if (choice === checkoutDetached) {
            return this._checkout(repository, { detached: true });
        }
        else {
            const item = choice;
            try {
                await item.run(opts);
            }
            catch (err) {
                if (err.gitErrorCode !== "DirtyWorkTree" /* GitErrorCodes.DirtyWorkTree */) {
                    throw err;
                }
                const stash = vscode_1.l10n.t('Stash & Checkout');
                const migrate = vscode_1.l10n.t('Migrate Changes');
                const force = vscode_1.l10n.t('Force Checkout');
                const choice = await vscode_1.window.showWarningMessage(vscode_1.l10n.t('Your local changes would be overwritten by checkout.'), { modal: true }, stash, migrate, force);
                if (choice === force) {
                    await this.cleanAll(repository);
                    await item.run(opts);
                }
                else if (choice === stash || choice === migrate) {
                    if (await this._stash(repository)) {
                        await item.run(opts);
                        if (choice === migrate) {
                            await this.stashPopLatest(repository);
                        }
                    }
                }
            }
        }
        return true;
    }
    async branch(repository) {
        await this._branch(repository);
    }
    async branchFrom(repository) {
        await this._branch(repository, undefined, true);
    }
    async generateRandomBranchName(repository, separator) {
        const config = vscode_1.workspace.getConfiguration('git');
        const branchRandomNameDictionary = config.get('branchRandomName.dictionary');
        const dictionaries = [];
        for (const dictionary of branchRandomNameDictionary) {
            if (dictionary.toLowerCase() === 'adjectives') {
                dictionaries.push(unique_names_generator_1.adjectives);
            }
            if (dictionary.toLowerCase() === 'animals') {
                dictionaries.push(unique_names_generator_1.animals);
            }
            if (dictionary.toLowerCase() === 'colors') {
                dictionaries.push(unique_names_generator_1.colors);
            }
            if (dictionary.toLowerCase() === 'numbers') {
                dictionaries.push(unique_names_generator_1.NumberDictionary.generate({ length: 3 }));
            }
        }
        if (dictionaries.length === 0) {
            return '';
        }
        // 5 attempts to generate a random branch name
        for (let index = 0; index < 5; index++) {
            const randomName = (0, unique_names_generator_1.uniqueNamesGenerator)({
                dictionaries,
                length: dictionaries.length,
                separator
            });
            // Check for local ref conflict
            const refs = await repository.getRefs({ pattern: `refs/heads/${randomName}` });
            if (refs.length === 0) {
                return randomName;
            }
        }
        return '';
    }
    async promptForBranchName(repository, defaultName, initialValue) {
        const config = vscode_1.workspace.getConfiguration('git');
        const branchPrefix = config.get('branchPrefix');
        const branchWhitespaceChar = config.get('branchWhitespaceChar');
        const branchValidationRegex = config.get('branchValidationRegex');
        let rawBranchName = defaultName;
        if (!rawBranchName) {
            // Branch name
            if (!initialValue) {
                const branchRandomNameEnabled = config.get('branchRandomName.enable', false);
                const branchName = branchRandomNameEnabled ? await this.generateRandomBranchName(repository, branchWhitespaceChar) : '';
                initialValue = `${branchPrefix}${branchName}`;
            }
            // Branch name selection
            const initialValueSelection = initialValue.startsWith(branchPrefix) ? [branchPrefix.length, initialValue.length] : undefined;
            rawBranchName = await vscode_1.window.showInputBox({
                placeHolder: vscode_1.l10n.t('Branch name'),
                prompt: vscode_1.l10n.t('Please provide a new branch name'),
                value: initialValue,
                valueSelection: initialValueSelection,
                ignoreFocusOut: true,
                validateInput: (name) => {
                    const validateName = new RegExp(branchValidationRegex);
                    const sanitizedName = sanitizeBranchName(name, branchWhitespaceChar);
                    if (validateName.test(sanitizedName)) {
                        // If the sanitized name that we will use is different than what is
                        // in the input box, show an info message to the user informing them
                        // the branch name that will be used.
                        return name === sanitizedName
                            ? null
                            : {
                                message: vscode_1.l10n.t('The new branch will be "{0}"', sanitizedName),
                                severity: vscode_1.InputBoxValidationSeverity.Info
                            };
                    }
                    return vscode_1.l10n.t('Branch name needs to match regex: {0}', branchValidationRegex);
                }
            });
        }
        return sanitizeBranchName(rawBranchName || '', branchWhitespaceChar);
    }
    async _branch(repository, defaultName, from = false) {
        let target = 'HEAD';
        if (from) {
            const getRefPicks = async () => {
                return [new HEADItem(repository), ...await createCheckoutItems(repository)];
            };
            const placeHolder = vscode_1.l10n.t('Select a ref to create the branch from');
            const choice = await vscode_1.window.showQuickPick(getRefPicks(), { placeHolder });
            if (!choice) {
                return;
            }
            if (choice.refName) {
                target = choice.refName;
            }
        }
        const branchName = await this.promptForBranchName(repository, defaultName);
        if (!branchName) {
            return;
        }
        await repository.branch(branchName, true, target);
    }
    async deleteBranch(repository, name, force) {
        let run;
        if (typeof name === 'string') {
            run = force => repository.deleteBranch(name, force);
        }
        else {
            const getBranchPicks = async () => {
                const refs = await repository.getRefs({ pattern: 'refs/heads' });
                const currentHead = repository.HEAD && repository.HEAD.name;
                return refs.filter(ref => ref.name !== currentHead).map(ref => new BranchDeleteItem(ref));
            };
            const placeHolder = vscode_1.l10n.t('Select a branch to delete');
            const choice = await vscode_1.window.showQuickPick(getBranchPicks(), { placeHolder });
            if (!choice || !choice.branchName) {
                return;
            }
            name = choice.branchName;
            run = force => choice.run(repository, force);
        }
        try {
            await run(force);
        }
        catch (err) {
            if (err.gitErrorCode !== "BranchNotFullyMerged" /* GitErrorCodes.BranchNotFullyMerged */) {
                throw err;
            }
            const message = vscode_1.l10n.t('The branch "{0}" is not fully merged. Delete anyway?', name);
            const yes = vscode_1.l10n.t('Delete Branch');
            const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yes);
            if (pick === yes) {
                await run(true);
            }
        }
    }
    async renameBranch(repository) {
        const currentBranchName = repository.HEAD && repository.HEAD.name;
        const branchName = await this.promptForBranchName(repository, undefined, currentBranchName);
        if (!branchName) {
            return;
        }
        try {
            await repository.renameBranch(branchName);
        }
        catch (err) {
            switch (err.gitErrorCode) {
                case "InvalidBranchName" /* GitErrorCodes.InvalidBranchName */:
                    vscode_1.window.showErrorMessage(vscode_1.l10n.t('Invalid branch name'));
                    return;
                case "BranchAlreadyExists" /* GitErrorCodes.BranchAlreadyExists */:
                    vscode_1.window.showErrorMessage(vscode_1.l10n.t('A branch named "{0}" already exists', branchName));
                    return;
                default:
                    throw err;
            }
        }
    }
    async merge(repository) {
        const config = vscode_1.workspace.getConfiguration('git');
        const checkoutType = config.get('checkoutType');
        const includeRemotes = checkoutType === 'all' || checkoutType === 'remote' || checkoutType?.includes('remote');
        const getBranchPicks = async () => {
            const refs = await repository.getRefs();
            const heads = refs.filter(ref => ref.type === 0 /* RefType.Head */)
                .filter(ref => ref.name || ref.commit)
                .map(ref => new MergeItem(ref));
            const remoteHeads = (includeRemotes ? refs.filter(ref => ref.type === 1 /* RefType.RemoteHead */) : [])
                .filter(ref => ref.name || ref.commit)
                .map(ref => new MergeItem(ref));
            return [...heads, ...remoteHeads];
        };
        const placeHolder = vscode_1.l10n.t('Select a branch to merge from');
        const choice = await vscode_1.window.showQuickPick(getBranchPicks(), { placeHolder });
        if (!choice) {
            return;
        }
        await choice.run(repository);
    }
    async abortMerge(repository) {
        await repository.mergeAbort();
    }
    async rebase(repository) {
        const config = vscode_1.workspace.getConfiguration('git');
        const checkoutType = config.get('checkoutType');
        const includeRemotes = checkoutType === 'all' || checkoutType === 'remote' || checkoutType?.includes('remote');
        const getBranchPicks = async () => {
            const refs = await repository.getRefs();
            const heads = refs.filter(ref => ref.type === 0 /* RefType.Head */)
                .filter(ref => ref.name !== repository.HEAD?.name)
                .filter(ref => ref.name || ref.commit);
            const remoteHeads = (includeRemotes ? refs.filter(ref => ref.type === 1 /* RefType.RemoteHead */) : [])
                .filter(ref => ref.name || ref.commit);
            const picks = [...heads, ...remoteHeads].map(ref => new RebaseItem(ref));
            // set upstream branch as first
            if (repository.HEAD?.upstream) {
                const upstreamName = `${repository.HEAD?.upstream.remote}/${repository.HEAD?.upstream.name}`;
                const index = picks.findIndex(e => e.ref.name === upstreamName);
                if (index > -1) {
                    const [ref] = picks.splice(index, 1);
                    ref.description = '(upstream)';
                    picks.unshift(ref);
                }
            }
            return picks;
        };
        const placeHolder = vscode_1.l10n.t('Select a branch to rebase onto');
        const choice = await vscode_1.window.showQuickPick(getBranchPicks(), { placeHolder });
        if (!choice) {
            return;
        }
        await choice.run(repository);
    }
    async createTag(repository) {
        const inputTagName = await vscode_1.window.showInputBox({
            placeHolder: vscode_1.l10n.t('Tag name'),
            prompt: vscode_1.l10n.t('Please provide a tag name'),
            ignoreFocusOut: true
        });
        if (!inputTagName) {
            return;
        }
        const inputMessage = await vscode_1.window.showInputBox({
            placeHolder: vscode_1.l10n.t('Message'),
            prompt: vscode_1.l10n.t('Please provide a message to annotate the tag'),
            ignoreFocusOut: true
        });
        const name = inputTagName.replace(/^\.|\/\.|\.\.|~|\^|:|\/$|\.lock$|\.lock\/|\\|\*|\s|^\s*$|\.$/g, '-');
        await repository.tag(name, inputMessage);
    }
    async deleteTag(repository) {
        const tagPicks = async () => {
            const remoteTags = await repository.getRefs({ pattern: 'refs/tags' });
            return remoteTags.length === 0 ? [{ label: vscode_1.l10n.t('$(info) This repository has no tags.') }] : remoteTags.map(ref => new TagItem(ref));
        };
        const placeHolder = vscode_1.l10n.t('Select a tag to delete');
        const choice = await vscode_1.window.showQuickPick(tagPicks(), { placeHolder });
        if (choice && choice instanceof TagItem && choice.ref.name) {
            await repository.deleteTag(choice.ref.name);
        }
    }
    async deleteRemoteTag(repository) {
        const remotePicks = repository.remotes
            .filter(r => r.pushUrl !== undefined)
            .map(r => new RemoteItem(repository, r));
        if (remotePicks.length === 0) {
            vscode_1.window.showErrorMessage(vscode_1.l10n.t("Your repository has no remotes configured to push to."));
            return;
        }
        let remoteName = remotePicks[0].remoteName;
        if (remotePicks.length > 1) {
            const remotePickPlaceholder = vscode_1.l10n.t('Select a remote to delete a tag from');
            const remotePick = await vscode_1.window.showQuickPick(remotePicks, { placeHolder: remotePickPlaceholder });
            if (!remotePick) {
                return;
            }
            remoteName = remotePick.remoteName;
        }
        const remoteTagPicks = async () => {
            const remoteTagsRaw = await repository.getRemoteRefs(remoteName, { tags: true });
            // Deduplicate annotated and lightweight tags
            const remoteTagNames = new Set();
            const remoteTags = [];
            for (const tag of remoteTagsRaw) {
                const tagName = (tag.name ?? '').replace(/\^{}$/, '');
                if (!remoteTagNames.has(tagName)) {
                    remoteTags.push({ ...tag, name: tagName });
                    remoteTagNames.add(tagName);
                }
            }
            return remoteTags.length === 0 ? [{ label: vscode_1.l10n.t('$(info) Remote "{0}" has no tags.', remoteName) }] : remoteTags.map(ref => new TagItem(ref));
        };
        const tagPickPlaceholder = vscode_1.l10n.t('Select a tag to delete');
        const remoteTagPick = await vscode_1.window.showQuickPick(remoteTagPicks(), { placeHolder: tagPickPlaceholder });
        if (remoteTagPick && remoteTagPick instanceof TagItem && remoteTagPick.ref.name) {
            await repository.deleteRemoteTag(remoteName, remoteTagPick.ref.name);
        }
    }
    async fetch(repository) {
        if (repository.remotes.length === 0) {
            vscode_1.window.showWarningMessage(vscode_1.l10n.t('This repository has no remotes configured to fetch from.'));
            return;
        }
        if (repository.remotes.length === 1) {
            await repository.fetchDefault();
            return;
        }
        const remoteItems = repository.remotes.map(r => new RemoteItem(repository, r));
        if (repository.HEAD?.upstream?.remote) {
            // Move default remote to the top
            const defaultRemoteIndex = remoteItems
                .findIndex(r => r.remoteName === repository.HEAD.upstream.remote);
            if (defaultRemoteIndex !== -1) {
                remoteItems.splice(0, 0, ...remoteItems.splice(defaultRemoteIndex, 1));
            }
        }
        const quickpick = vscode_1.window.createQuickPick();
        quickpick.placeholder = vscode_1.l10n.t('Select a remote to fetch');
        quickpick.canSelectMany = false;
        quickpick.items = [...remoteItems, { label: '', kind: vscode_1.QuickPickItemKind.Separator }, new FetchAllRemotesItem(repository)];
        quickpick.show();
        const remoteItem = await new Promise(resolve => {
            quickpick.onDidAccept(() => resolve(quickpick.activeItems[0]));
            quickpick.onDidHide(() => resolve(undefined));
        });
        quickpick.hide();
        if (!remoteItem) {
            return;
        }
        await remoteItem.run();
    }
    async fetchPrune(repository) {
        if (repository.remotes.length === 0) {
            vscode_1.window.showWarningMessage(vscode_1.l10n.t('This repository has no remotes configured to fetch from.'));
            return;
        }
        await repository.fetchPrune();
    }
    async fetchAll(repository) {
        if (repository.remotes.length === 0) {
            vscode_1.window.showWarningMessage(vscode_1.l10n.t('This repository has no remotes configured to fetch from.'));
            return;
        }
        await repository.fetchAll();
    }
    async pullFrom(repository) {
        const remotes = repository.remotes;
        if (remotes.length === 0) {
            vscode_1.window.showWarningMessage(vscode_1.l10n.t('Your repository has no remotes configured to pull from.'));
            return;
        }
        let remoteName = remotes[0].name;
        if (remotes.length > 1) {
            const remotePicks = remotes.filter(r => r.fetchUrl !== undefined).map(r => ({ label: r.name, description: r.fetchUrl }));
            const placeHolder = vscode_1.l10n.t('Pick a remote to pull the branch from');
            const remotePick = await vscode_1.window.showQuickPick(remotePicks, { placeHolder });
            if (!remotePick) {
                return;
            }
            remoteName = remotePick.label;
        }
        const getBranchPicks = async () => {
            const remoteRefs = await repository.getRefs();
            const remoteRefsFiltered = remoteRefs.filter(r => (r.remote === remoteName));
            return remoteRefsFiltered.map(r => ({ label: r.name }));
        };
        const branchPlaceHolder = vscode_1.l10n.t('Pick a branch to pull from');
        const branchPick = await vscode_1.window.showQuickPick(getBranchPicks(), { placeHolder: branchPlaceHolder });
        if (!branchPick) {
            return;
        }
        const remoteCharCnt = remoteName.length;
        await repository.pullFrom(false, remoteName, branchPick.label.slice(remoteCharCnt + 1));
    }
    async pull(repository) {
        const remotes = repository.remotes;
        if (remotes.length === 0) {
            vscode_1.window.showWarningMessage(vscode_1.l10n.t('Your repository has no remotes configured to pull from.'));
            return;
        }
        await repository.pull(repository.HEAD);
    }
    async pullRebase(repository) {
        const remotes = repository.remotes;
        if (remotes.length === 0) {
            vscode_1.window.showWarningMessage(vscode_1.l10n.t('Your repository has no remotes configured to pull from.'));
            return;
        }
        await repository.pullWithRebase(repository.HEAD);
    }
    async _push(repository, pushOptions) {
        const remotes = repository.remotes;
        if (remotes.length === 0) {
            if (pushOptions.silent) {
                return;
            }
            const addRemote = vscode_1.l10n.t('Add Remote');
            const result = await vscode_1.window.showWarningMessage(vscode_1.l10n.t('Your repository has no remotes configured to push to.'), addRemote);
            if (result === addRemote) {
                await this.addRemote(repository);
            }
            return;
        }
        const config = vscode_1.workspace.getConfiguration('git', vscode_1.Uri.file(repository.root));
        let forcePushMode = undefined;
        if (pushOptions.forcePush) {
            if (!config.get('allowForcePush')) {
                await vscode_1.window.showErrorMessage(vscode_1.l10n.t('Force push is not allowed, please enable it with the "git.allowForcePush" setting.'));
                return;
            }
            forcePushMode = config.get('useForcePushWithLease') === true ? 1 /* ForcePushMode.ForceWithLease */ : 0 /* ForcePushMode.Force */;
            if (config.get('confirmForcePush')) {
                const message = vscode_1.l10n.t('You are about to force push your changes, this can be destructive and could inadvertently overwrite changes made by others.\n\nAre you sure to continue?');
                const yes = vscode_1.l10n.t('OK');
                const neverAgain = vscode_1.l10n.t('OK, Don\'t Ask Again');
                const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yes, neverAgain);
                if (pick === neverAgain) {
                    config.update('confirmForcePush', false, true);
                }
                else if (pick !== yes) {
                    return;
                }
            }
        }
        if (pushOptions.pushType === PushType.PushFollowTags) {
            await repository.pushFollowTags(undefined, forcePushMode);
            return;
        }
        if (pushOptions.pushType === PushType.PushTags) {
            await repository.pushTags(undefined, forcePushMode);
        }
        if (!repository.HEAD || !repository.HEAD.name) {
            if (!pushOptions.silent) {
                vscode_1.window.showWarningMessage(vscode_1.l10n.t('Please check out a branch to push to a remote.'));
            }
            return;
        }
        if (pushOptions.pushType === PushType.Push) {
            try {
                await repository.push(repository.HEAD, forcePushMode);
            }
            catch (err) {
                if (err.gitErrorCode !== "NoUpstreamBranch" /* GitErrorCodes.NoUpstreamBranch */) {
                    throw err;
                }
                if (pushOptions.silent) {
                    return;
                }
                if (this.globalState.get('confirmBranchPublish', true)) {
                    const branchName = repository.HEAD.name;
                    const message = vscode_1.l10n.t('The branch "{0}" has no remote branch. Would you like to publish this branch?', branchName);
                    const yes = vscode_1.l10n.t('OK');
                    const neverAgain = vscode_1.l10n.t('OK, Don\'t Ask Again');
                    const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yes, neverAgain);
                    if (pick === yes || pick === neverAgain) {
                        if (pick === neverAgain) {
                            this.globalState.update('confirmBranchPublish', false);
                        }
                        await this.publish(repository);
                    }
                }
                else {
                    await this.publish(repository);
                }
            }
        }
        else {
            const branchName = repository.HEAD.name;
            if (!pushOptions.pushTo?.remote) {
                const addRemote = new AddRemoteItem(this);
                const picks = [...remotes.filter(r => r.pushUrl !== undefined).map(r => ({ label: r.name, description: r.pushUrl })), addRemote];
                const placeHolder = vscode_1.l10n.t('Pick a remote to publish the branch "{0}" to:', branchName);
                const choice = await vscode_1.window.showQuickPick(picks, { placeHolder });
                if (!choice) {
                    return;
                }
                if (choice === addRemote) {
                    const newRemote = await this.addRemote(repository);
                    if (newRemote) {
                        await repository.pushTo(newRemote, branchName, undefined, forcePushMode);
                    }
                }
                else {
                    await repository.pushTo(choice.label, branchName, undefined, forcePushMode);
                }
            }
            else {
                await repository.pushTo(pushOptions.pushTo.remote, pushOptions.pushTo.refspec || branchName, pushOptions.pushTo.setUpstream, forcePushMode);
            }
        }
    }
    async push(repository) {
        await this._push(repository, { pushType: PushType.Push });
    }
    async pushForce(repository) {
        await this._push(repository, { pushType: PushType.Push, forcePush: true });
    }
    async pushFollowTags(repository) {
        await this._push(repository, { pushType: PushType.PushFollowTags });
    }
    async pushFollowTagsForce(repository) {
        await this._push(repository, { pushType: PushType.PushFollowTags, forcePush: true });
    }
    async cherryPick(repository) {
        const hash = await vscode_1.window.showInputBox({
            placeHolder: vscode_1.l10n.t('Commit Hash'),
            prompt: vscode_1.l10n.t('Please provide the commit hash'),
            ignoreFocusOut: true
        });
        if (!hash) {
            return;
        }
        await repository.cherryPick(hash);
    }
    async pushTo(repository, remote, refspec, setUpstream) {
        await this._push(repository, { pushType: PushType.PushTo, pushTo: { remote: remote, refspec: refspec, setUpstream: setUpstream } });
    }
    async pushToForce(repository, remote, refspec, setUpstream) {
        await this._push(repository, { pushType: PushType.PushTo, pushTo: { remote: remote, refspec: refspec, setUpstream: setUpstream }, forcePush: true });
    }
    async pushTags(repository) {
        await this._push(repository, { pushType: PushType.PushTags });
    }
    async addRemote(repository) {
        const url = await (0, remoteSource_1.pickRemoteSource)({
            providerLabel: provider => vscode_1.l10n.t('Add remote from {0}', provider.name),
            urlLabel: vscode_1.l10n.t('Add remote from URL')
        });
        if (!url) {
            return;
        }
        const resultName = await vscode_1.window.showInputBox({
            placeHolder: vscode_1.l10n.t('Remote name'),
            prompt: vscode_1.l10n.t('Please provide a remote name'),
            ignoreFocusOut: true,
            validateInput: (name) => {
                if (!sanitizeRemoteName(name)) {
                    return vscode_1.l10n.t('Remote name format invalid');
                }
                else if (repository.remotes.find(r => r.name === name)) {
                    return vscode_1.l10n.t('Remote "{0}" already exists.', name);
                }
                return null;
            }
        });
        const name = sanitizeRemoteName(resultName || '');
        if (!name) {
            return;
        }
        await repository.addRemote(name, url.trim());
        await repository.fetch({ remote: name });
        return name;
    }
    async removeRemote(repository) {
        const remotes = repository.remotes;
        if (remotes.length === 0) {
            vscode_1.window.showErrorMessage(vscode_1.l10n.t('Your repository has no remotes.'));
            return;
        }
        const picks = repository.remotes.map(r => new RemoteItem(repository, r));
        const placeHolder = vscode_1.l10n.t('Pick a remote to remove');
        const remote = await vscode_1.window.showQuickPick(picks, { placeHolder });
        if (!remote) {
            return;
        }
        await repository.removeRemote(remote.remoteName);
    }
    async _sync(repository, rebase) {
        const HEAD = repository.HEAD;
        if (!HEAD) {
            return;
        }
        else if (!HEAD.upstream) {
            this._push(repository, { pushType: PushType.Push });
            return;
        }
        const remoteName = HEAD.remote || HEAD.upstream.remote;
        const remote = repository.remotes.find(r => r.name === remoteName);
        const isReadonly = remote && remote.isReadOnly;
        const config = vscode_1.workspace.getConfiguration('git');
        const shouldPrompt = !isReadonly && config.get('confirmSync') === true;
        if (shouldPrompt) {
            const message = vscode_1.l10n.t('This action will pull and push commits from and to "{0}/{1}".', HEAD.upstream.remote, HEAD.upstream.name);
            const yes = vscode_1.l10n.t('OK');
            const neverAgain = vscode_1.l10n.t('OK, Don\'t Show Again');
            const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, yes, neverAgain);
            if (pick === neverAgain) {
                await config.update('confirmSync', false, true);
            }
            else if (pick !== yes) {
                return;
            }
        }
        await repository.sync(HEAD, rebase);
    }
    async sync(repository) {
        const config = vscode_1.workspace.getConfiguration('git', vscode_1.Uri.file(repository.root));
        const rebase = config.get('rebaseWhenSync', false) === true;
        try {
            await this._sync(repository, rebase);
        }
        catch (err) {
            if (/Cancelled/i.test(err && (err.message || err.stderr || ''))) {
                return;
            }
            throw err;
        }
    }
    async syncAll() {
        await Promise.all(this.model.repositories.map(async (repository) => {
            const config = vscode_1.workspace.getConfiguration('git', vscode_1.Uri.file(repository.root));
            const rebase = config.get('rebaseWhenSync', false) === true;
            const HEAD = repository.HEAD;
            if (!HEAD || !HEAD.upstream) {
                return;
            }
            await repository.sync(HEAD, rebase);
        }));
    }
    async syncRebase(repository) {
        try {
            await this._sync(repository, true);
        }
        catch (err) {
            if (/Cancelled/i.test(err && (err.message || err.stderr || ''))) {
                return;
            }
            throw err;
        }
    }
    async publish(repository) {
        const branchName = repository.HEAD && repository.HEAD.name || '';
        const remotes = repository.remotes;
        if (remotes.length === 0) {
            const publishers = this.model.getRemoteSourcePublishers();
            if (publishers.length === 0) {
                vscode_1.window.showWarningMessage(vscode_1.l10n.t('Your repository has no remotes configured to publish to.'));
                return;
            }
            let publisher;
            if (publishers.length === 1) {
                publisher = publishers[0];
            }
            else {
                const picks = publishers
                    .map(provider => ({ label: (provider.icon ? `$(${provider.icon}) ` : '') + vscode_1.l10n.t('Publish to {0}', provider.name), alwaysShow: true, provider }));
                const placeHolder = vscode_1.l10n.t('Pick a provider to publish the branch "{0}" to:', branchName);
                const choice = await vscode_1.window.showQuickPick(picks, { placeHolder });
                if (!choice) {
                    return;
                }
                publisher = choice.provider;
            }
            await publisher.publishRepository(new api1_1.ApiRepository(repository));
            this.model.firePublishEvent(repository, branchName);
            return;
        }
        if (remotes.length === 1) {
            await repository.pushTo(remotes[0].name, branchName, true);
            this.model.firePublishEvent(repository, branchName);
            return;
        }
        const addRemote = new AddRemoteItem(this);
        const picks = [...repository.remotes.map(r => ({ label: r.name, description: r.pushUrl })), addRemote];
        const placeHolder = vscode_1.l10n.t('Pick a remote to publish the branch "{0}" to:', branchName);
        const choice = await vscode_1.window.showQuickPick(picks, { placeHolder });
        if (!choice) {
            return;
        }
        if (choice === addRemote) {
            const newRemote = await this.addRemote(repository);
            if (newRemote) {
                await repository.pushTo(newRemote, branchName, true);
                this.model.firePublishEvent(repository, branchName);
            }
        }
        else {
            await repository.pushTo(choice.label, branchName, true);
            this.model.firePublishEvent(repository, branchName);
        }
    }
    async ignore(...resourceStates) {
        resourceStates = resourceStates.filter(s => !!s);
        if (resourceStates.length === 0 || (resourceStates[0] && !(resourceStates[0].resourceUri instanceof vscode_1.Uri))) {
            const resource = this.getSCMResource();
            if (!resource) {
                return;
            }
            resourceStates = [resource];
        }
        const resources = resourceStates
            .filter(s => s instanceof repository_1.Resource)
            .map(r => r.resourceUri);
        if (!resources.length) {
            return;
        }
        await this.runByRepository(resources, async (repository, resources) => repository.ignore(resources));
    }
    async revealInExplorer(resourceState) {
        if (!resourceState) {
            return;
        }
        if (!(resourceState.resourceUri instanceof vscode_1.Uri)) {
            return;
        }
        await vscode_1.commands.executeCommand('revealInExplorer', resourceState.resourceUri);
    }
    async revealFileInOS(resourceState) {
        if (!resourceState) {
            return;
        }
        if (!(resourceState.resourceUri instanceof vscode_1.Uri)) {
            return;
        }
        await vscode_1.commands.executeCommand('revealFileInOS', resourceState.resourceUri);
    }
    async _stash(repository, includeUntracked = false, staged = false) {
        const noUnstagedChanges = repository.workingTreeGroup.resourceStates.length === 0
            && (!includeUntracked || repository.untrackedGroup.resourceStates.length === 0);
        const noStagedChanges = repository.indexGroup.resourceStates.length === 0;
        if (staged) {
            if (noStagedChanges) {
                vscode_1.window.showInformationMessage(vscode_1.l10n.t('There are no staged changes to stash.'));
                return false;
            }
        }
        else {
            if (noUnstagedChanges && noStagedChanges) {
                vscode_1.window.showInformationMessage(vscode_1.l10n.t('There are no changes to stash.'));
                return false;
            }
        }
        const config = vscode_1.workspace.getConfiguration('git', vscode_1.Uri.file(repository.root));
        const promptToSaveFilesBeforeStashing = config.get('promptToSaveFilesBeforeStash');
        if (promptToSaveFilesBeforeStashing !== 'never') {
            let documents = vscode_1.workspace.textDocuments
                .filter(d => !d.isUntitled && d.isDirty && (0, util_1.isDescendant)(repository.root, d.uri.fsPath));
            if (promptToSaveFilesBeforeStashing === 'staged' || repository.indexGroup.resourceStates.length > 0) {
                documents = documents
                    .filter(d => repository.indexGroup.resourceStates.some(s => (0, util_1.pathEquals)(s.resourceUri.fsPath, d.uri.fsPath)));
            }
            if (documents.length > 0) {
                const message = documents.length === 1
                    ? vscode_1.l10n.t('The following file has unsaved changes which won\'t be included in the stash if you proceed: {0}.\n\nWould you like to save it before stashing?', path.basename(documents[0].uri.fsPath))
                    : vscode_1.l10n.t('There are {0} unsaved files.\n\nWould you like to save them before stashing?', documents.length);
                const saveAndStash = vscode_1.l10n.t('Save All & Stash');
                const stash = vscode_1.l10n.t('Stash Anyway');
                const pick = await vscode_1.window.showWarningMessage(message, { modal: true }, saveAndStash, stash);
                if (pick === saveAndStash) {
                    await Promise.all(documents.map(d => d.save()));
                }
                else if (pick !== stash) {
                    return false; // do not stash on cancel
                }
            }
        }
        let message;
        if (config.get('useCommitInputAsStashMessage') && (!repository.sourceControl.commitTemplate || repository.inputBox.value !== repository.sourceControl.commitTemplate)) {
            message = repository.inputBox.value;
        }
        message = await vscode_1.window.showInputBox({
            value: message,
            prompt: vscode_1.l10n.t('Optionally provide a stash message'),
            placeHolder: vscode_1.l10n.t('Stash message')
        });
        if (typeof message === 'undefined') {
            return false;
        }
        try {
            await repository.createStash(message, includeUntracked, staged);
            return true;
        }
        catch (err) {
            if (/You do not have the initial commit yet/.test(err.stderr || '')) {
                vscode_1.window.showInformationMessage(vscode_1.l10n.t('The repository does not have any commits. Please make an initial commit before creating a stash.'));
                return false;
            }
            throw err;
        }
    }
    async stash(repository) {
        await this._stash(repository);
    }
    async stashStaged(repository) {
        await this._stash(repository, false, true);
    }
    async stashIncludeUntracked(repository) {
        await this._stash(repository, true);
    }
    async stashPop(repository) {
        const placeHolder = vscode_1.l10n.t('Pick a stash to pop');
        const stash = await this.pickStash(repository, placeHolder);
        if (!stash) {
            return;
        }
        await repository.popStash(stash.index);
    }
    async stashPopLatest(repository) {
        const stashes = await repository.getStashes();
        if (stashes.length === 0) {
            vscode_1.window.showInformationMessage(vscode_1.l10n.t('There are no stashes in the repository.'));
            return;
        }
        await repository.popStash();
    }
    async stashApply(repository) {
        const placeHolder = vscode_1.l10n.t('Pick a stash to apply');
        const stash = await this.pickStash(repository, placeHolder);
        if (!stash) {
            return;
        }
        await repository.applyStash(stash.index);
    }
    async stashApplyLatest(repository) {
        const stashes = await repository.getStashes();
        if (stashes.length === 0) {
            vscode_1.window.showInformationMessage(vscode_1.l10n.t('There are no stashes in the repository.'));
            return;
        }
        await repository.applyStash();
    }
    async stashDrop(repository) {
        const placeHolder = vscode_1.l10n.t('Pick a stash to drop');
        const stash = await this.pickStash(repository, placeHolder);
        if (!stash) {
            return;
        }
        // request confirmation for the operation
        const yes = vscode_1.l10n.t('Yes');
        const result = await vscode_1.window.showWarningMessage(vscode_1.l10n.t('Are you sure you want to drop the stash: {0}?', stash.description), { modal: true }, yes);
        if (result !== yes) {
            return;
        }
        await repository.dropStash(stash.index);
    }
    async stashDropAll(repository) {
        const stashes = await repository.getStashes();
        if (stashes.length === 0) {
            vscode_1.window.showInformationMessage(vscode_1.l10n.t('There are no stashes in the repository.'));
            return;
        }
        // request confirmation for the operation
        const yes = vscode_1.l10n.t('Yes');
        const question = stashes.length === 1 ?
            vscode_1.l10n.t('Are you sure you want to drop ALL stashes? There is 1 stash that will be subject to pruning, and MAY BE IMPOSSIBLE TO RECOVER.') :
            vscode_1.l10n.t('Are you sure you want to drop ALL stashes? There are {0} stashes that will be subject to pruning, and MAY BE IMPOSSIBLE TO RECOVER.', stashes.length);
        const result = await vscode_1.window.showWarningMessage(question, { modal: true }, yes);
        if (result !== yes) {
            return;
        }
        await repository.dropStash();
    }
    async pickStash(repository, placeHolder) {
        const stashes = await repository.getStashes();
        if (stashes.length === 0) {
            vscode_1.window.showInformationMessage(vscode_1.l10n.t('There are no stashes in the repository.'));
            return;
        }
        const picks = stashes.map(stash => ({ label: `#${stash.index}:  ${stash.description}`, description: '', details: '', stash }));
        const result = await vscode_1.window.showQuickPick(picks, { placeHolder });
        return result && result.stash;
    }
    async timelineOpenDiff(item, uri, _source) {
        const cmd = this.resolveTimelineOpenDiffCommand(item, uri, {
            preserveFocus: true,
            preview: true,
            viewColumn: vscode_1.ViewColumn.Active
        });
        if (cmd === undefined) {
            return undefined;
        }
        return vscode_1.commands.executeCommand(cmd.command, ...(cmd.arguments ?? []));
    }
    resolveTimelineOpenDiffCommand(item, uri, options) {
        if (uri === undefined || uri === null || !timelineProvider_1.GitTimelineItem.is(item)) {
            return undefined;
        }
        const basename = path.basename(uri.fsPath);
        let title;
        if ((item.previousRef === 'HEAD' || item.previousRef === '~') && item.ref === '') {
            title = vscode_1.l10n.t('{0} (Working Tree)', basename);
        }
        else if (item.previousRef === 'HEAD' && item.ref === '~') {
            title = vscode_1.l10n.t('{0} (Index)', basename);
        }
        else {
            title = vscode_1.l10n.t('{0} ({1}) ↔ {0} ({2})', basename, item.shortPreviousRef, item.shortRef);
        }
        return {
            command: 'vscode.diff',
            title: vscode_1.l10n.t('Open Comparison'),
            arguments: [(0, uri_1.toGitUri)(uri, item.previousRef), item.ref === '' ? uri : (0, uri_1.toGitUri)(uri, item.ref), title, options]
        };
    }
    async timelineCopyCommitId(item, _uri, _source) {
        if (!timelineProvider_1.GitTimelineItem.is(item)) {
            return;
        }
        vscode_1.env.clipboard.writeText(item.ref);
    }
    async timelineCopyCommitMessage(item, _uri, _source) {
        if (!timelineProvider_1.GitTimelineItem.is(item)) {
            return;
        }
        vscode_1.env.clipboard.writeText(item.message);
    }
    async timelineSelectForCompare(item, uri, _source) {
        if (!timelineProvider_1.GitTimelineItem.is(item) || !uri) {
            return;
        }
        this._selectedForCompare = { uri, item };
        await vscode_1.commands.executeCommand('setContext', 'git.timeline.selectedForCompare', true);
    }
    async timelineCompareWithSelected(item, uri, _source) {
        if (!timelineProvider_1.GitTimelineItem.is(item) || !uri || !this._selectedForCompare || uri.toString() !== this._selectedForCompare.uri.toString()) {
            return;
        }
        const { item: selected } = this._selectedForCompare;
        const basename = path.basename(uri.fsPath);
        let leftTitle;
        if ((selected.previousRef === 'HEAD' || selected.previousRef === '~') && selected.ref === '') {
            leftTitle = vscode_1.l10n.t('{0} (Working Tree)', basename);
        }
        else if (selected.previousRef === 'HEAD' && selected.ref === '~') {
            leftTitle = vscode_1.l10n.t('{0} (Index)', basename);
        }
        else {
            leftTitle = vscode_1.l10n.t('{0} ({1})', basename, selected.shortRef);
        }
        let rightTitle;
        if ((item.previousRef === 'HEAD' || item.previousRef === '~') && item.ref === '') {
            rightTitle = vscode_1.l10n.t('{0} (Working Tree)', basename);
        }
        else if (item.previousRef === 'HEAD' && item.ref === '~') {
            rightTitle = vscode_1.l10n.t('{0} (Index)', basename);
        }
        else {
            rightTitle = vscode_1.l10n.t('{0} ({1})', basename, item.shortRef);
        }
        const title = vscode_1.l10n.t('{0} ↔ {1}', leftTitle, rightTitle);
        await vscode_1.commands.executeCommand('vscode.diff', selected.ref === '' ? uri : (0, uri_1.toGitUri)(uri, selected.ref), item.ref === '' ? uri : (0, uri_1.toGitUri)(uri, item.ref), title);
    }
    async rebaseAbort(repository) {
        if (repository.rebaseCommit) {
            await repository.rebaseAbort();
        }
        else {
            await vscode_1.window.showInformationMessage(vscode_1.l10n.t('No rebase in progress.'));
        }
    }
    closeDiffEditors(repository) {
        repository.closeDiffEditors(undefined, undefined, true);
    }
    async openRepositoriesInParentFolders() {
        const parentRepositories = [];
        const title = vscode_1.l10n.t('Open Repositories In Parent Folders');
        const placeHolder = vscode_1.l10n.t('Pick a repository to open');
        const allRepositoriesLabel = vscode_1.l10n.t('All Repositories');
        const allRepositoriesQuickPickItem = { label: allRepositoriesLabel };
        const repositoriesQuickPickItems = this.model.parentRepositories
            .sort(compareRepositoryLabel).map(r => new RepositoryItem(r));
        const items = this.model.parentRepositories.length === 1 ? [...repositoriesQuickPickItems] :
            [...repositoriesQuickPickItems, { label: '', kind: vscode_1.QuickPickItemKind.Separator }, allRepositoriesQuickPickItem];
        const repositoryItem = await vscode_1.window.showQuickPick(items, { title, placeHolder });
        if (!repositoryItem) {
            return;
        }
        if (repositoryItem === allRepositoriesQuickPickItem) {
            // All Repositories
            parentRepositories.push(...this.model.parentRepositories);
        }
        else {
            // One Repository
            parentRepositories.push(repositoryItem.path);
        }
        for (const parentRepository of parentRepositories) {
            await this.model.openParentRepository(parentRepository);
        }
    }
    async manageUnsafeRepositories() {
        const unsafeRepositories = [];
        const quickpick = vscode_1.window.createQuickPick();
        quickpick.title = vscode_1.l10n.t('Manage Unsafe Repositories');
        quickpick.placeholder = vscode_1.l10n.t('Pick a repository to mark as safe and open');
        const allRepositoriesLabel = vscode_1.l10n.t('All Repositories');
        const allRepositoriesQuickPickItem = { label: allRepositoriesLabel };
        const repositoriesQuickPickItems = this.model.unsafeRepositories
            .sort(compareRepositoryLabel).map(r => new RepositoryItem(r));
        quickpick.items = this.model.unsafeRepositories.length === 1 ? [...repositoriesQuickPickItems] :
            [...repositoriesQuickPickItems, { label: '', kind: vscode_1.QuickPickItemKind.Separator }, allRepositoriesQuickPickItem];
        quickpick.show();
        const repositoryItem = await new Promise(resolve => {
            quickpick.onDidAccept(() => resolve(quickpick.activeItems[0]));
            quickpick.onDidHide(() => resolve(undefined));
        });
        quickpick.hide();
        if (!repositoryItem) {
            return;
        }
        if (repositoryItem.label === allRepositoriesLabel) {
            // All Repositories
            unsafeRepositories.push(...this.model.unsafeRepositories);
        }
        else {
            // One Repository
            unsafeRepositories.push(repositoryItem.path);
        }
        for (const unsafeRepository of unsafeRepositories) {
            // Mark as Safe
            await this.git.addSafeDirectory(this.model.getUnsafeRepositoryPath(unsafeRepository));
            // Open Repository
            await this.model.openRepository(unsafeRepository);
            this.model.deleteUnsafeRepository(unsafeRepository);
        }
    }
    createCommand(id, key, method, options) {
        const result = (...args) => {
            let result;
            if (!options.repository) {
                result = Promise.resolve(method.apply(this, args));
            }
            else {
                // try to guess the repository based on the first argument
                const repository = this.model.getRepository(args[0]);
                let repositoryPromise;
                if (repository) {
                    repositoryPromise = Promise.resolve(repository);
                }
                else if (this.model.repositories.length === 1) {
                    repositoryPromise = Promise.resolve(this.model.repositories[0]);
                }
                else {
                    repositoryPromise = this.model.pickRepository();
                }
                result = repositoryPromise.then(repository => {
                    if (!repository) {
                        return Promise.resolve();
                    }
                    return Promise.resolve(method.apply(this, [repository, ...args.slice(1)]));
                });
            }
            /* __GDPR__
                "git.command" : {
                    "owner": "lszomoru",
                    "command" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "comment": "The command id of the command being executed" }
                }
            */
            this.telemetryReporter.sendTelemetryEvent('git.command', { command: id });
            return result.catch(err => {
                const options = {
                    modal: true
                };
                let message;
                let type = 'error';
                const choices = new Map();
                const openOutputChannelChoice = vscode_1.l10n.t('Open Git Log');
                const outputChannelLogger = this.logger;
                choices.set(openOutputChannelChoice, () => outputChannelLogger.show());
                const showCommandOutputChoice = vscode_1.l10n.t('Show Command Output');
                if (err.stderr) {
                    choices.set(showCommandOutputChoice, async () => {
                        const timestamp = new Date().getTime();
                        const uri = vscode_1.Uri.parse(`git-output:/git-error-${timestamp}`);
                        let command = 'git';
                        if (err.gitArgs) {
                            command = `${command} ${err.gitArgs.join(' ')}`;
                        }
                        else if (err.gitCommand) {
                            command = `${command} ${err.gitCommand}`;
                        }
                        this.commandErrors.set(uri, `> ${command}\n${err.stderr}`);
                        try {
                            const doc = await vscode_1.workspace.openTextDocument(uri);
                            await vscode_1.window.showTextDocument(doc);
                        }
                        finally {
                            this.commandErrors.delete(uri);
                        }
                    });
                }
                switch (err.gitErrorCode) {
                    case "DirtyWorkTree" /* GitErrorCodes.DirtyWorkTree */:
                        message = vscode_1.l10n.t('Please clean your repository working tree before checkout.');
                        break;
                    case "PushRejected" /* GitErrorCodes.PushRejected */:
                        message = vscode_1.l10n.t('Can\'t push refs to remote. Try running "Pull" first to integrate your changes.');
                        break;
                    case "Conflict" /* GitErrorCodes.Conflict */:
                        message = vscode_1.l10n.t('There are merge conflicts. Resolve them before committing.');
                        type = 'warning';
                        choices.set(vscode_1.l10n.t('Show Changes'), () => vscode_1.commands.executeCommand('workbench.view.scm'));
                        options.modal = false;
                        break;
                    case "StashConflict" /* GitErrorCodes.StashConflict */:
                        message = vscode_1.l10n.t('There were merge conflicts while applying the stash.');
                        choices.set(vscode_1.l10n.t('Show Changes'), () => vscode_1.commands.executeCommand('workbench.view.scm'));
                        type = 'warning';
                        options.modal = false;
                        break;
                    case "AuthenticationFailed" /* GitErrorCodes.AuthenticationFailed */: {
                        const regex = /Authentication failed for '(.*)'/i;
                        const match = regex.exec(err.stderr || String(err));
                        message = match
                            ? vscode_1.l10n.t('Failed to authenticate to git remote:\n\n{0}', match[1])
                            : vscode_1.l10n.t('Failed to authenticate to git remote.');
                        break;
                    }
                    case "NoUserNameConfigured" /* GitErrorCodes.NoUserNameConfigured */:
                    case "NoUserEmailConfigured" /* GitErrorCodes.NoUserEmailConfigured */:
                        message = vscode_1.l10n.t('Make sure you configure your "user.name" and "user.email" in git.');
                        choices.set(vscode_1.l10n.t('Learn More'), () => vscode_1.commands.executeCommand('vscode.open', vscode_1.Uri.parse('https://aka.ms/vscode-setup-git')));
                        break;
                    case "EmptyCommitMessage" /* GitErrorCodes.EmptyCommitMessage */:
                        message = vscode_1.l10n.t('Commit operation was cancelled due to empty commit message.');
                        choices.clear();
                        type = 'information';
                        options.modal = false;
                        break;
                    default: {
                        const hint = (err.stderr || err.message || String(err))
                            .replace(/^error: /mi, '')
                            .replace(/^> husky.*$/mi, '')
                            .split(/[\r\n]/)
                            .filter((line) => !!line)[0];
                        message = hint
                            ? vscode_1.l10n.t('Git: {0}', hint)
                            : vscode_1.l10n.t('Git error');
                        break;
                    }
                }
                if (!message) {
                    console.error(err);
                    return;
                }
                // We explicitly do not await this promise, because we do not
                // want the command execution to be stuck waiting for the user
                // to take action on the notification.
                this.showErrorNotification(type, message, options, choices);
            });
        };
        // patch this object, so people can call methods directly
        this[key] = result;
        return result;
    }
    async showErrorNotification(type, message, options, choices) {
        let result;
        const allChoices = Array.from(choices.keys());
        switch (type) {
            case 'error':
                result = await vscode_1.window.showErrorMessage(message, options, ...allChoices);
                break;
            case 'warning':
                result = await vscode_1.window.showWarningMessage(message, options, ...allChoices);
                break;
            case 'information':
                result = await vscode_1.window.showInformationMessage(message, options, ...allChoices);
                break;
        }
        if (result) {
            const resultFn = choices.get(result);
            resultFn?.();
        }
    }
    getSCMResource(uri) {
        uri = uri ? uri : (vscode_1.window.activeTextEditor && vscode_1.window.activeTextEditor.document.uri);
        this.logger.debug(`git.getSCMResource.uri ${uri && uri.toString()}`);
        for (const r of this.model.repositories.map(r => r.root)) {
            this.logger.debug(`repo root ${r}`);
        }
        if (!uri) {
            return undefined;
        }
        if ((0, uri_1.isGitUri)(uri)) {
            const { path } = (0, uri_1.fromGitUri)(uri);
            uri = vscode_1.Uri.file(path);
        }
        if (uri.scheme === 'file') {
            const uriString = uri.toString();
            const repository = this.model.getRepository(uri);
            if (!repository) {
                return undefined;
            }
            return repository.workingTreeGroup.resourceStates.filter(r => r.resourceUri.toString() === uriString)[0]
                || repository.indexGroup.resourceStates.filter(r => r.resourceUri.toString() === uriString)[0]
                || repository.mergeGroup.resourceStates.filter(r => r.resourceUri.toString() === uriString)[0];
        }
        return undefined;
    }
    async runByRepository(arg, fn) {
        const resources = arg instanceof vscode_1.Uri ? [arg] : arg;
        const isSingleResource = arg instanceof vscode_1.Uri;
        const groups = resources.reduce((result, resource) => {
            let repository = this.model.getRepository(resource);
            if (!repository) {
                console.warn('Could not find git repository for ', resource);
                return result;
            }
            // Could it be a submodule?
            if ((0, util_1.pathEquals)(resource.fsPath, repository.root)) {
                repository = this.model.getRepositoryForSubmodule(resource) || repository;
            }
            const tuple = result.filter(p => p.repository === repository)[0];
            if (tuple) {
                tuple.resources.push(resource);
            }
            else {
                result.push({ repository, resources: [resource] });
            }
            return result;
        }, []);
        const promises = groups
            .map(({ repository, resources }) => fn(repository, isSingleResource ? resources[0] : resources));
        return Promise.all(promises);
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.CommandCenter = CommandCenter;
__decorate([
    command('git.showOutput')
], CommandCenter.prototype, "showOutput", null);
__decorate([
    command('git.refresh', { repository: true })
], CommandCenter.prototype, "refresh", null);
__decorate([
    command('git.openResource')
], CommandCenter.prototype, "openResource", null);
__decorate([
    command('git.openAllChanges', { repository: true })
], CommandCenter.prototype, "openChanges", null);
__decorate([
    command('git.openMergeEditor')
], CommandCenter.prototype, "openMergeEditor", null);
__decorate([
    command('git.continueInLocalClone')
], CommandCenter.prototype, "continueInLocalClone", null);
__decorate([
    command('git.clone')
], CommandCenter.prototype, "clone", null);
__decorate([
    command('git.cloneRecursive')
], CommandCenter.prototype, "cloneRecursive", null);
__decorate([
    command('git.init')
], CommandCenter.prototype, "init", null);
__decorate([
    command('git.openRepository', { repository: false })
], CommandCenter.prototype, "openRepository", null);
__decorate([
    command('git.reopenClosedRepositories', { repository: false })
], CommandCenter.prototype, "reopenClosedRepositories", null);
__decorate([
    command('git.close', { repository: true })
], CommandCenter.prototype, "close", null);
__decorate([
    command('git.openFile')
], CommandCenter.prototype, "openFile", null);
__decorate([
    command('git.openFile2')
], CommandCenter.prototype, "openFile2", null);
__decorate([
    command('git.openHEADFile')
], CommandCenter.prototype, "openHEADFile", null);
__decorate([
    command('git.openChange')
], CommandCenter.prototype, "openChange", null);
__decorate([
    command('git.rename', { repository: true })
], CommandCenter.prototype, "rename", null);
__decorate([
    command('git.stage')
], CommandCenter.prototype, "stage", null);
__decorate([
    command('git.stageAll', { repository: true })
], CommandCenter.prototype, "stageAll", null);
__decorate([
    command('git.stageAllTracked', { repository: true })
], CommandCenter.prototype, "stageAllTracked", null);
__decorate([
    command('git.stageAllUntracked', { repository: true })
], CommandCenter.prototype, "stageAllUntracked", null);
__decorate([
    command('git.stageAllMerge', { repository: true })
], CommandCenter.prototype, "stageAllMerge", null);
__decorate([
    command('git.stageChange')
], CommandCenter.prototype, "stageChange", null);
__decorate([
    command('git.stageSelectedRanges', { diff: true })
], CommandCenter.prototype, "stageSelectedChanges", null);
__decorate([
    command('git.acceptMerge')
], CommandCenter.prototype, "acceptMerge", null);
__decorate([
    command('git.runGitMerge')
], CommandCenter.prototype, "runGitMergeNoDiff3", null);
__decorate([
    command('git.runGitMergeDiff3')
], CommandCenter.prototype, "runGitMergeDiff3", null);
__decorate([
    command('git.revertChange')
], CommandCenter.prototype, "revertChange", null);
__decorate([
    command('git.revertSelectedRanges', { diff: true })
], CommandCenter.prototype, "revertSelectedRanges", null);
__decorate([
    command('git.unstage')
], CommandCenter.prototype, "unstage", null);
__decorate([
    command('git.unstageAll', { repository: true })
], CommandCenter.prototype, "unstageAll", null);
__decorate([
    command('git.unstageSelectedRanges', { diff: true })
], CommandCenter.prototype, "unstageSelectedRanges", null);
__decorate([
    command('git.clean')
], CommandCenter.prototype, "clean", null);
__decorate([
    command('git.cleanAll', { repository: true })
], CommandCenter.prototype, "cleanAll", null);
__decorate([
    command('git.cleanAllTracked', { repository: true })
], CommandCenter.prototype, "cleanAllTracked", null);
__decorate([
    command('git.cleanAllUntracked', { repository: true })
], CommandCenter.prototype, "cleanAllUntracked", null);
__decorate([
    command('git.commit', { repository: true })
], CommandCenter.prototype, "commit", null);
__decorate([
    command('git.commitAmend', { repository: true })
], CommandCenter.prototype, "commitAmend", null);
__decorate([
    command('git.commitSigned', { repository: true })
], CommandCenter.prototype, "commitSigned", null);
__decorate([
    command('git.commitStaged', { repository: true })
], CommandCenter.prototype, "commitStaged", null);
__decorate([
    command('git.commitStagedSigned', { repository: true })
], CommandCenter.prototype, "commitStagedSigned", null);
__decorate([
    command('git.commitStagedAmend', { repository: true })
], CommandCenter.prototype, "commitStagedAmend", null);
__decorate([
    command('git.commitAll', { repository: true })
], CommandCenter.prototype, "commitAll", null);
__decorate([
    command('git.commitAllSigned', { repository: true })
], CommandCenter.prototype, "commitAllSigned", null);
__decorate([
    command('git.commitAllAmend', { repository: true })
], CommandCenter.prototype, "commitAllAmend", null);
__decorate([
    command('git.commitMessageAccept')
], CommandCenter.prototype, "commitMessageAccept", null);
__decorate([
    command('git.commitMessageDiscard')
], CommandCenter.prototype, "commitMessageDiscard", null);
__decorate([
    command('git.commitEmpty', { repository: true })
], CommandCenter.prototype, "commitEmpty", null);
__decorate([
    command('git.commitNoVerify', { repository: true })
], CommandCenter.prototype, "commitNoVerify", null);
__decorate([
    command('git.commitStagedNoVerify', { repository: true })
], CommandCenter.prototype, "commitStagedNoVerify", null);
__decorate([
    command('git.commitStagedSignedNoVerify', { repository: true })
], CommandCenter.prototype, "commitStagedSignedNoVerify", null);
__decorate([
    command('git.commitAmendNoVerify', { repository: true })
], CommandCenter.prototype, "commitAmendNoVerify", null);
__decorate([
    command('git.commitSignedNoVerify', { repository: true })
], CommandCenter.prototype, "commitSignedNoVerify", null);
__decorate([
    command('git.commitStagedAmendNoVerify', { repository: true })
], CommandCenter.prototype, "commitStagedAmendNoVerify", null);
__decorate([
    command('git.commitAllNoVerify', { repository: true })
], CommandCenter.prototype, "commitAllNoVerify", null);
__decorate([
    command('git.commitAllSignedNoVerify', { repository: true })
], CommandCenter.prototype, "commitAllSignedNoVerify", null);
__decorate([
    command('git.commitAllAmendNoVerify', { repository: true })
], CommandCenter.prototype, "commitAllAmendNoVerify", null);
__decorate([
    command('git.commitEmptyNoVerify', { repository: true })
], CommandCenter.prototype, "commitEmptyNoVerify", null);
__decorate([
    command('git.restoreCommitTemplate', { repository: true })
], CommandCenter.prototype, "restoreCommitTemplate", null);
__decorate([
    command('git.undoCommit', { repository: true })
], CommandCenter.prototype, "undoCommit", null);
__decorate([
    command('git.checkout', { repository: true })
], CommandCenter.prototype, "checkout", null);
__decorate([
    command('git.checkoutDetached', { repository: true })
], CommandCenter.prototype, "checkoutDetached", null);
__decorate([
    command('git.branch', { repository: true })
], CommandCenter.prototype, "branch", null);
__decorate([
    command('git.branchFrom', { repository: true })
], CommandCenter.prototype, "branchFrom", null);
__decorate([
    command('git.deleteBranch', { repository: true })
], CommandCenter.prototype, "deleteBranch", null);
__decorate([
    command('git.renameBranch', { repository: true })
], CommandCenter.prototype, "renameBranch", null);
__decorate([
    command('git.merge', { repository: true })
], CommandCenter.prototype, "merge", null);
__decorate([
    command('git.mergeAbort', { repository: true })
], CommandCenter.prototype, "abortMerge", null);
__decorate([
    command('git.rebase', { repository: true })
], CommandCenter.prototype, "rebase", null);
__decorate([
    command('git.createTag', { repository: true })
], CommandCenter.prototype, "createTag", null);
__decorate([
    command('git.deleteTag', { repository: true })
], CommandCenter.prototype, "deleteTag", null);
__decorate([
    command('git.deleteRemoteTag', { repository: true })
], CommandCenter.prototype, "deleteRemoteTag", null);
__decorate([
    command('git.fetch', { repository: true })
], CommandCenter.prototype, "fetch", null);
__decorate([
    command('git.fetchPrune', { repository: true })
], CommandCenter.prototype, "fetchPrune", null);
__decorate([
    command('git.fetchAll', { repository: true })
], CommandCenter.prototype, "fetchAll", null);
__decorate([
    command('git.pullFrom', { repository: true })
], CommandCenter.prototype, "pullFrom", null);
__decorate([
    command('git.pull', { repository: true })
], CommandCenter.prototype, "pull", null);
__decorate([
    command('git.pullRebase', { repository: true })
], CommandCenter.prototype, "pullRebase", null);
__decorate([
    command('git.push', { repository: true })
], CommandCenter.prototype, "push", null);
__decorate([
    command('git.pushForce', { repository: true })
], CommandCenter.prototype, "pushForce", null);
__decorate([
    command('git.pushWithTags', { repository: true })
], CommandCenter.prototype, "pushFollowTags", null);
__decorate([
    command('git.pushWithTagsForce', { repository: true })
], CommandCenter.prototype, "pushFollowTagsForce", null);
__decorate([
    command('git.cherryPick', { repository: true })
], CommandCenter.prototype, "cherryPick", null);
__decorate([
    command('git.pushTo', { repository: true })
], CommandCenter.prototype, "pushTo", null);
__decorate([
    command('git.pushToForce', { repository: true })
], CommandCenter.prototype, "pushToForce", null);
__decorate([
    command('git.pushTags', { repository: true })
], CommandCenter.prototype, "pushTags", null);
__decorate([
    command('git.addRemote', { repository: true })
], CommandCenter.prototype, "addRemote", null);
__decorate([
    command('git.removeRemote', { repository: true })
], CommandCenter.prototype, "removeRemote", null);
__decorate([
    command('git.sync', { repository: true })
], CommandCenter.prototype, "sync", null);
__decorate([
    command('git._syncAll')
], CommandCenter.prototype, "syncAll", null);
__decorate([
    command('git.syncRebase', { repository: true })
], CommandCenter.prototype, "syncRebase", null);
__decorate([
    command('git.publish', { repository: true })
], CommandCenter.prototype, "publish", null);
__decorate([
    command('git.ignore')
], CommandCenter.prototype, "ignore", null);
__decorate([
    command('git.revealInExplorer')
], CommandCenter.prototype, "revealInExplorer", null);
__decorate([
    command('git.revealFileInOS.linux'),
    command('git.revealFileInOS.mac'),
    command('git.revealFileInOS.windows')
], CommandCenter.prototype, "revealFileInOS", null);
__decorate([
    command('git.stash', { repository: true })
], CommandCenter.prototype, "stash", null);
__decorate([
    command('git.stashStaged', { repository: true })
], CommandCenter.prototype, "stashStaged", null);
__decorate([
    command('git.stashIncludeUntracked', { repository: true })
], CommandCenter.prototype, "stashIncludeUntracked", null);
__decorate([
    command('git.stashPop', { repository: true })
], CommandCenter.prototype, "stashPop", null);
__decorate([
    command('git.stashPopLatest', { repository: true })
], CommandCenter.prototype, "stashPopLatest", null);
__decorate([
    command('git.stashApply', { repository: true })
], CommandCenter.prototype, "stashApply", null);
__decorate([
    command('git.stashApplyLatest', { repository: true })
], CommandCenter.prototype, "stashApplyLatest", null);
__decorate([
    command('git.stashDrop', { repository: true })
], CommandCenter.prototype, "stashDrop", null);
__decorate([
    command('git.stashDropAll', { repository: true })
], CommandCenter.prototype, "stashDropAll", null);
__decorate([
    command('git.timeline.openDiff', { repository: false })
], CommandCenter.prototype, "timelineOpenDiff", null);
__decorate([
    command('git.timeline.copyCommitId', { repository: false })
], CommandCenter.prototype, "timelineCopyCommitId", null);
__decorate([
    command('git.timeline.copyCommitMessage', { repository: false })
], CommandCenter.prototype, "timelineCopyCommitMessage", null);
__decorate([
    command('git.timeline.selectForCompare', { repository: false })
], CommandCenter.prototype, "timelineSelectForCompare", null);
__decorate([
    command('git.timeline.compareWithSelected', { repository: false })
], CommandCenter.prototype, "timelineCompareWithSelected", null);
__decorate([
    command('git.rebaseAbort', { repository: true })
], CommandCenter.prototype, "rebaseAbort", null);
__decorate([
    command('git.closeAllDiffEditors', { repository: true })
], CommandCenter.prototype, "closeDiffEditors", null);
__decorate([
    command('git.openRepositoriesInParentFolders')
], CommandCenter.prototype, "openRepositoriesInParentFolders", null);
__decorate([
    command('git.manageUnsafeRepositories')
], CommandCenter.prototype, "manageUnsafeRepositories", null);
//# sourceMappingURL=commands.js.map