"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAPICommands = exports.ApiImpl = exports.ApiGit = exports.ApiRepository = exports.ApiRepositoryUIState = exports.ApiRepositoryState = exports.ApiChange = void 0;
const vscode_1 = require("vscode");
const util_1 = require("../util");
const uri_1 = require("../uri");
const git_base_1 = require("../git-base");
class ApiInputBox {
    set value(value) { this._inputBox.value = value; }
    get value() { return this._inputBox.value; }
    constructor(_inputBox) {
        this._inputBox = _inputBox;
    }
}
class ApiChange {
    get uri() { return this.resource.resourceUri; }
    get originalUri() { return this.resource.original; }
    get renameUri() { return this.resource.renameResourceUri; }
    get status() { return this.resource.type; }
    constructor(resource) {
        this.resource = resource;
    }
}
exports.ApiChange = ApiChange;
class ApiRepositoryState {
    get HEAD() { return this._repository.HEAD; }
    /**
     * @deprecated Use ApiRepository.getRefs() instead.
     */
    get refs() { console.warn('Deprecated. Use ApiRepository.getRefs() instead.'); return []; }
    get remotes() { return [...this._repository.remotes]; }
    get submodules() { return [...this._repository.submodules]; }
    get rebaseCommit() { return this._repository.rebaseCommit; }
    get mergeChanges() { return this._repository.mergeGroup.resourceStates.map(r => new ApiChange(r)); }
    get indexChanges() { return this._repository.indexGroup.resourceStates.map(r => new ApiChange(r)); }
    get workingTreeChanges() { return this._repository.workingTreeGroup.resourceStates.map(r => new ApiChange(r)); }
    constructor(_repository) {
        this._repository = _repository;
        this.onDidChange = this._repository.onDidRunGitStatus;
    }
}
exports.ApiRepositoryState = ApiRepositoryState;
class ApiRepositoryUIState {
    get selected() { return this._sourceControl.selected; }
    constructor(_sourceControl) {
        this._sourceControl = _sourceControl;
        this.onDidChange = (0, util_1.mapEvent)(this._sourceControl.onDidChangeSelection, () => null);
    }
}
exports.ApiRepositoryUIState = ApiRepositoryUIState;
class ApiRepository {
    constructor(repository) {
        this.repository = repository;
        this.rootUri = vscode_1.Uri.file(this.repository.root);
        this.inputBox = new ApiInputBox(this.repository.inputBox);
        this.state = new ApiRepositoryState(this.repository);
        this.ui = new ApiRepositoryUIState(this.repository.sourceControl);
    }
    apply(patch, reverse) {
        return this.repository.apply(patch, reverse);
    }
    getConfigs() {
        return this.repository.getConfigs();
    }
    getConfig(key) {
        return this.repository.getConfig(key);
    }
    setConfig(key, value) {
        return this.repository.setConfig(key, value);
    }
    getGlobalConfig(key) {
        return this.repository.getGlobalConfig(key);
    }
    getObjectDetails(treeish, path) {
        return this.repository.getObjectDetails(treeish, path);
    }
    detectObjectType(object) {
        return this.repository.detectObjectType(object);
    }
    buffer(ref, filePath) {
        return this.repository.buffer(ref, filePath);
    }
    show(ref, path) {
        return this.repository.show(ref, path);
    }
    getCommit(ref) {
        return this.repository.getCommit(ref);
    }
    add(paths) {
        return this.repository.add(paths.map(p => vscode_1.Uri.file(p)));
    }
    revert(paths) {
        return this.repository.revert(paths.map(p => vscode_1.Uri.file(p)));
    }
    clean(paths) {
        return this.repository.clean(paths.map(p => vscode_1.Uri.file(p)));
    }
    diff(cached) {
        return this.repository.diff(cached);
    }
    diffWithHEAD(path) {
        return this.repository.diffWithHEAD(path);
    }
    diffWith(ref, path) {
        return this.repository.diffWith(ref, path);
    }
    diffIndexWithHEAD(path) {
        return this.repository.diffIndexWithHEAD(path);
    }
    diffIndexWith(ref, path) {
        return this.repository.diffIndexWith(ref, path);
    }
    diffBlobs(object1, object2) {
        return this.repository.diffBlobs(object1, object2);
    }
    diffBetween(ref1, ref2, path) {
        return this.repository.diffBetween(ref1, ref2, path);
    }
    hashObject(data) {
        return this.repository.hashObject(data);
    }
    createBranch(name, checkout, ref) {
        return this.repository.branch(name, checkout, ref);
    }
    deleteBranch(name, force) {
        return this.repository.deleteBranch(name, force);
    }
    getBranch(name) {
        return this.repository.getBranch(name);
    }
    getBranches(query, cancellationToken) {
        return this.repository.getBranches(query, cancellationToken);
    }
    setBranchUpstream(name, upstream) {
        return this.repository.setBranchUpstream(name, upstream);
    }
    getRefs(query, cancellationToken) {
        return this.repository.getRefs(query, cancellationToken);
    }
    getMergeBase(ref1, ref2) {
        return this.repository.getMergeBase(ref1, ref2);
    }
    tag(name, upstream) {
        return this.repository.tag(name, upstream);
    }
    deleteTag(name) {
        return this.repository.deleteTag(name);
    }
    status() {
        return this.repository.status();
    }
    checkout(treeish) {
        return this.repository.checkout(treeish);
    }
    addRemote(name, url) {
        return this.repository.addRemote(name, url);
    }
    removeRemote(name) {
        return this.repository.removeRemote(name);
    }
    renameRemote(name, newName) {
        return this.repository.renameRemote(name, newName);
    }
    fetch(arg0, ref, depth, prune) {
        if (arg0 !== undefined && typeof arg0 !== 'string') {
            return this.repository.fetch(arg0);
        }
        return this.repository.fetch({ remote: arg0, ref, depth, prune });
    }
    pull(unshallow) {
        return this.repository.pull(undefined, unshallow);
    }
    push(remoteName, branchName, setUpstream = false, force) {
        return this.repository.pushTo(remoteName, branchName, setUpstream, force);
    }
    blame(path) {
        return this.repository.blame(path);
    }
    log(options) {
        return this.repository.log(options);
    }
    commit(message, opts) {
        return this.repository.commit(message, opts);
    }
}
exports.ApiRepository = ApiRepository;
class ApiGit {
    get path() { return this._model.git.path; }
    constructor(_model) {
        this._model = _model;
    }
}
exports.ApiGit = ApiGit;
class ApiImpl {
    get state() {
        return this._model.state;
    }
    get onDidChangeState() {
        return this._model.onDidChangeState;
    }
    get onDidPublish() {
        return this._model.onDidPublish;
    }
    get onDidOpenRepository() {
        return (0, util_1.mapEvent)(this._model.onDidOpenRepository, r => new ApiRepository(r));
    }
    get onDidCloseRepository() {
        return (0, util_1.mapEvent)(this._model.onDidCloseRepository, r => new ApiRepository(r));
    }
    get repositories() {
        return this._model.repositories.map(r => new ApiRepository(r));
    }
    toGitUri(uri, ref) {
        return (0, uri_1.toGitUri)(uri, ref);
    }
    getRepository(uri) {
        const result = this._model.getRepository(uri);
        return result ? new ApiRepository(result) : null;
    }
    async init(root, options) {
        const path = root.fsPath;
        await this._model.git.init(path, options);
        await this._model.openRepository(path);
        return this.getRepository(root) || null;
    }
    async openRepository(root) {
        await this._model.openRepository(root.fsPath);
        return this.getRepository(root) || null;
    }
    registerRemoteSourceProvider(provider) {
        const disposables = [];
        if (provider.publishRepository) {
            disposables.push(this._model.registerRemoteSourcePublisher(provider));
        }
        disposables.push(git_base_1.GitBaseApi.getAPI().registerRemoteSourceProvider(provider));
        return (0, util_1.combinedDisposable)(disposables);
    }
    registerRemoteSourcePublisher(publisher) {
        return this._model.registerRemoteSourcePublisher(publisher);
    }
    registerCredentialsProvider(provider) {
        return this._model.registerCredentialsProvider(provider);
    }
    registerPostCommitCommandsProvider(provider) {
        return this._model.registerPostCommitCommandsProvider(provider);
    }
    registerPushErrorHandler(handler) {
        return this._model.registerPushErrorHandler(handler);
    }
    registerBranchProtectionProvider(root, provider) {
        return this._model.registerBranchProtectionProvider(root, provider);
    }
    constructor(_model) {
        this._model = _model;
        this.git = new ApiGit(this._model);
    }
}
exports.ApiImpl = ApiImpl;
function getRefType(type) {
    switch (type) {
        case 0 /* RefType.Head */: return 'Head';
        case 1 /* RefType.RemoteHead */: return 'RemoteHead';
        case 2 /* RefType.Tag */: return 'Tag';
    }
    return 'unknown';
}
function getStatus(status) {
    switch (status) {
        case 0 /* Status.INDEX_MODIFIED */: return 'INDEX_MODIFIED';
        case 1 /* Status.INDEX_ADDED */: return 'INDEX_ADDED';
        case 2 /* Status.INDEX_DELETED */: return 'INDEX_DELETED';
        case 3 /* Status.INDEX_RENAMED */: return 'INDEX_RENAMED';
        case 4 /* Status.INDEX_COPIED */: return 'INDEX_COPIED';
        case 5 /* Status.MODIFIED */: return 'MODIFIED';
        case 6 /* Status.DELETED */: return 'DELETED';
        case 7 /* Status.UNTRACKED */: return 'UNTRACKED';
        case 8 /* Status.IGNORED */: return 'IGNORED';
        case 9 /* Status.INTENT_TO_ADD */: return 'INTENT_TO_ADD';
        case 10 /* Status.INTENT_TO_RENAME */: return 'INTENT_TO_RENAME';
        case 11 /* Status.TYPE_CHANGED */: return 'TYPE_CHANGED';
        case 12 /* Status.ADDED_BY_US */: return 'ADDED_BY_US';
        case 13 /* Status.ADDED_BY_THEM */: return 'ADDED_BY_THEM';
        case 14 /* Status.DELETED_BY_US */: return 'DELETED_BY_US';
        case 15 /* Status.DELETED_BY_THEM */: return 'DELETED_BY_THEM';
        case 16 /* Status.BOTH_ADDED */: return 'BOTH_ADDED';
        case 17 /* Status.BOTH_DELETED */: return 'BOTH_DELETED';
        case 18 /* Status.BOTH_MODIFIED */: return 'BOTH_MODIFIED';
    }
    return 'UNKNOWN';
}
function registerAPICommands(extension) {
    const disposables = [];
    disposables.push(vscode_1.commands.registerCommand('git.api.getRepositories', () => {
        const api = extension.getAPI(1);
        return api.repositories.map(r => r.rootUri.toString());
    }));
    disposables.push(vscode_1.commands.registerCommand('git.api.getRepositoryState', (uri) => {
        const api = extension.getAPI(1);
        const repository = api.getRepository(vscode_1.Uri.parse(uri));
        if (!repository) {
            return null;
        }
        const state = repository.state;
        const ref = (ref) => (ref && { ...ref, type: getRefType(ref.type) });
        const change = (change) => ({
            uri: change.uri.toString(),
            originalUri: change.originalUri.toString(),
            renameUri: change.renameUri?.toString(),
            status: getStatus(change.status)
        });
        return {
            HEAD: ref(state.HEAD),
            refs: state.refs.map(ref),
            remotes: state.remotes,
            submodules: state.submodules,
            rebaseCommit: state.rebaseCommit,
            mergeChanges: state.mergeChanges.map(change),
            indexChanges: state.indexChanges.map(change),
            workingTreeChanges: state.workingTreeChanges.map(change)
        };
    }));
    disposables.push(vscode_1.commands.registerCommand('git.api.getRemoteSources', (opts) => {
        return vscode_1.commands.executeCommand('git-base.api.getRemoteSources', opts);
    }));
    return vscode_1.Disposable.from(...disposables);
}
exports.registerAPICommands = registerAPICommands;
//# sourceMappingURL=api1.js.map