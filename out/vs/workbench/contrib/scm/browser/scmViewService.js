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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/contrib/scm/common/scm", "vs/base/common/iterator", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/scm/browser/menus", "vs/platform/storage/common/storage", "vs/base/common/decorators", "vs/platform/workspace/common/workspace", "vs/base/common/comparers", "vs/base/common/resources", "vs/base/common/arrays", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey"], function (require, exports, lifecycle_1, event_1, scm_1, iterator_1, instantiation_1, menus_1, storage_1, decorators_1, workspace_1, comparers_1, resources_1, arrays_1, configuration_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SCMViewService = exports.RepositoryContextKeys = void 0;
    function getProviderStorageKey(provider) {
        return `${provider.contextValue}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ''}`;
    }
    function getRepositoryName(workspaceContextService, repository) {
        if (!repository.provider.rootUri) {
            return repository.provider.label;
        }
        const folder = workspaceContextService.getWorkspaceFolder(repository.provider.rootUri);
        return folder?.uri.toString() === repository.provider.rootUri.toString() ? folder.name : (0, resources_1.basename)(repository.provider.rootUri);
    }
    exports.RepositoryContextKeys = {
        RepositorySortKey: new contextkey_1.RawContextKey('scmRepositorySortKey', "discoveryTime" /* ISCMRepositorySortKey.DiscoveryTime */),
    };
    let SCMViewService = class SCMViewService {
        get repositories() {
            return this._repositories.map(r => r.repository);
        }
        get visibleRepositories() {
            // In order to match the legacy behaviour, when the repositories are sorted by discovery time,
            // the visible repositories are sorted by the selection index instead of the discovery time.
            if (this._repositoriesSortKey === "discoveryTime" /* ISCMRepositorySortKey.DiscoveryTime */) {
                return this._repositories.filter(r => r.selectionIndex !== -1)
                    .sort((r1, r2) => r1.selectionIndex - r2.selectionIndex)
                    .map(r => r.repository);
            }
            return this._repositories
                .filter(r => r.selectionIndex !== -1)
                .map(r => r.repository);
        }
        set visibleRepositories(visibleRepositories) {
            const set = new Set(visibleRepositories);
            const added = new Set();
            const removed = new Set();
            for (const repositoryView of this._repositories) {
                // Selected -> !Selected
                if (!set.has(repositoryView.repository) && repositoryView.selectionIndex !== -1) {
                    repositoryView.selectionIndex = -1;
                    removed.add(repositoryView.repository);
                }
                // Selected | !Selected -> Selected
                if (set.has(repositoryView.repository)) {
                    if (repositoryView.selectionIndex === -1) {
                        added.add(repositoryView.repository);
                    }
                    repositoryView.selectionIndex = visibleRepositories.indexOf(repositoryView.repository);
                }
            }
            if (added.size === 0 && removed.size === 0) {
                return;
            }
            this._onDidSetVisibleRepositories.fire({ added, removed });
            // Update focus if the focused repository is not visible anymore
            if (this._repositories.find(r => r.focused && r.selectionIndex === -1)) {
                this.focus(this._repositories.find(r => r.selectionIndex !== -1)?.repository);
            }
        }
        get focusedRepository() {
            return this._repositories.find(r => r.focused)?.repository;
        }
        constructor(scmService, contextKeyService, instantiationService, configurationService, storageService, workspaceContextService) {
            this.configurationService = configurationService;
            this.storageService = storageService;
            this.workspaceContextService = workspaceContextService;
            this.didFinishLoading = false;
            this.didSelectRepository = false;
            this.disposables = new lifecycle_1.DisposableStore();
            this._repositories = [];
            this._onDidChangeRepositories = new event_1.Emitter();
            this.onDidChangeRepositories = this._onDidChangeRepositories.event;
            this._onDidSetVisibleRepositories = new event_1.Emitter();
            this.onDidChangeVisibleRepositories = event_1.Event.any(this._onDidSetVisibleRepositories.event, event_1.Event.debounce(this._onDidChangeRepositories.event, (last, e) => {
                if (!last) {
                    return e;
                }
                const added = new Set(last.added);
                const removed = new Set(last.removed);
                for (const repository of e.added) {
                    if (removed.has(repository)) {
                        removed.delete(repository);
                    }
                    else {
                        added.add(repository);
                    }
                }
                for (const repository of e.removed) {
                    if (added.has(repository)) {
                        added.delete(repository);
                    }
                    else {
                        removed.add(repository);
                    }
                }
                return { added, removed };
            }, 0, undefined, undefined, undefined, this.disposables));
            this._onDidFocusRepository = new event_1.Emitter();
            this.onDidFocusRepository = this._onDidFocusRepository.event;
            this.menus = instantiationService.createInstance(menus_1.SCMMenus);
            try {
                this.previousState = JSON.parse(storageService.get('scm:view:visibleRepositories', 1 /* StorageScope.WORKSPACE */, ''));
            }
            catch {
                // noop
            }
            this._repositoriesSortKey = this.previousState?.sortKey ?? this.getViewSortOrder();
            this._sortKeyContextKey = exports.RepositoryContextKeys.RepositorySortKey.bindTo(contextKeyService);
            this._sortKeyContextKey.set(this._repositoriesSortKey);
            scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
            scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
            for (const repository of scmService.repositories) {
                this.onDidAddRepository(repository);
            }
            storageService.onWillSaveState(this.onWillSaveState, this, this.disposables);
        }
        onDidAddRepository(repository) {
            if (!this.didFinishLoading) {
                this.eventuallyFinishLoading();
            }
            const repositoryView = {
                repository, discoveryTime: Date.now(), focused: false, selectionIndex: -1
            };
            let removed = iterator_1.Iterable.empty();
            if (this.previousState) {
                const index = this.previousState.all.indexOf(getProviderStorageKey(repository.provider));
                if (index === -1) {
                    // This repository is not part of the previous state which means that it
                    // was either manually closed in the previous session, or the repository
                    // was added after the previous session.In this case, we should select all
                    // of the repositories.
                    const added = [];
                    this.insertRepositoryView(this._repositories, repositoryView);
                    this._repositories.forEach((repositoryView, index) => {
                        if (repositoryView.selectionIndex === -1) {
                            added.push(repositoryView.repository);
                        }
                        repositoryView.selectionIndex = index;
                    });
                    this._onDidChangeRepositories.fire({ added, removed: iterator_1.Iterable.empty() });
                    this.didSelectRepository = false;
                    return;
                }
                if (this.previousState.visible.indexOf(index) === -1) {
                    // Explicit selection started
                    if (this.didSelectRepository) {
                        this.insertRepositoryView(this._repositories, repositoryView);
                        this._onDidChangeRepositories.fire({ added: iterator_1.Iterable.empty(), removed: iterator_1.Iterable.empty() });
                        return;
                    }
                }
                else {
                    // First visible repository
                    if (!this.didSelectRepository) {
                        removed = [...this.visibleRepositories];
                        this._repositories.forEach(r => {
                            r.focused = false;
                            r.selectionIndex = -1;
                        });
                        this.didSelectRepository = true;
                    }
                }
            }
            const maxSelectionIndex = this.getMaxSelectionIndex();
            this.insertRepositoryView(this._repositories, { ...repositoryView, selectionIndex: maxSelectionIndex + 1 });
            this._onDidChangeRepositories.fire({ added: [repositoryView.repository], removed });
            if (!this._repositories.find(r => r.focused)) {
                this.focus(repository);
            }
        }
        onDidRemoveRepository(repository) {
            if (!this.didFinishLoading) {
                this.eventuallyFinishLoading();
            }
            const repositoriesIndex = this._repositories.findIndex(r => r.repository === repository);
            if (repositoriesIndex === -1) {
                return;
            }
            let added = iterator_1.Iterable.empty();
            const repositoryView = this._repositories.splice(repositoriesIndex, 1);
            if (this._repositories.length > 0 && this.visibleRepositories.length === 0) {
                this._repositories[0].selectionIndex = 0;
                added = [this._repositories[0].repository];
            }
            this._onDidChangeRepositories.fire({ added, removed: repositoryView.map(r => r.repository) });
            if (repositoryView.length === 1 && repositoryView[0].focused && this.visibleRepositories.length > 0) {
                this.focus(this.visibleRepositories[0]);
            }
        }
        isVisible(repository) {
            return this._repositories.find(r => r.repository === repository)?.selectionIndex !== -1;
        }
        toggleVisibility(repository, visible) {
            if (typeof visible === 'undefined') {
                visible = !this.isVisible(repository);
            }
            else if (this.isVisible(repository) === visible) {
                return;
            }
            if (visible) {
                this.visibleRepositories = [...this.visibleRepositories, repository];
            }
            else {
                const index = this.visibleRepositories.indexOf(repository);
                if (index > -1) {
                    this.visibleRepositories = [
                        ...this.visibleRepositories.slice(0, index),
                        ...this.visibleRepositories.slice(index + 1)
                    ];
                }
            }
        }
        toggleSortKey(sortKey) {
            this._repositoriesSortKey = sortKey;
            this._sortKeyContextKey.set(this._repositoriesSortKey);
            this._repositories.sort(this.compareRepositories.bind(this));
            this._onDidChangeRepositories.fire({ added: iterator_1.Iterable.empty(), removed: iterator_1.Iterable.empty() });
        }
        focus(repository) {
            if (repository && !this.isVisible(repository)) {
                return;
            }
            this._repositories.forEach(r => r.focused = r.repository === repository);
            if (this._repositories.find(r => r.focused)) {
                this._onDidFocusRepository.fire(repository);
            }
        }
        compareRepositories(op1, op2) {
            // Sort by discovery time
            if (this._repositoriesSortKey === "discoveryTime" /* ISCMRepositorySortKey.DiscoveryTime */) {
                return op1.discoveryTime - op2.discoveryTime;
            }
            // Sort by path
            if (this._repositoriesSortKey === 'path' && op1.repository.provider.rootUri && op2.repository.provider.rootUri) {
                return (0, comparers_1.comparePaths)(op1.repository.provider.rootUri.fsPath, op2.repository.provider.rootUri.fsPath);
            }
            // Sort by name, path
            const name1 = getRepositoryName(this.workspaceContextService, op1.repository);
            const name2 = getRepositoryName(this.workspaceContextService, op2.repository);
            const nameComparison = (0, comparers_1.compareFileNames)(name1, name2);
            if (nameComparison === 0 && op1.repository.provider.rootUri && op2.repository.provider.rootUri) {
                return (0, comparers_1.comparePaths)(op1.repository.provider.rootUri.fsPath, op2.repository.provider.rootUri.fsPath);
            }
            return nameComparison;
        }
        getMaxSelectionIndex() {
            return this._repositories.length === 0 ? -1 :
                Math.max(...this._repositories.map(r => r.selectionIndex));
        }
        getViewSortOrder() {
            const sortOder = this.configurationService.getValue('scm.repositories.sortOrder');
            switch (sortOder) {
                case 'discovery time':
                    return "discoveryTime" /* ISCMRepositorySortKey.DiscoveryTime */;
                case 'name':
                    return "name" /* ISCMRepositorySortKey.Name */;
                case 'path':
                    return "path" /* ISCMRepositorySortKey.Path */;
                default:
                    return "discoveryTime" /* ISCMRepositorySortKey.DiscoveryTime */;
            }
        }
        insertRepositoryView(repositories, repositoryView) {
            const index = (0, arrays_1.binarySearch)(repositories, repositoryView, this.compareRepositories.bind(this));
            repositories.splice(index < 0 ? ~index : index, 0, repositoryView);
        }
        onWillSaveState() {
            if (!this.didFinishLoading) { // don't remember state, if the workbench didn't really finish loading
                return;
            }
            const all = this.repositories.map(r => getProviderStorageKey(r.provider));
            const visible = this.visibleRepositories.map(r => all.indexOf(getProviderStorageKey(r.provider)));
            const raw = JSON.stringify({ all, sortKey: this._repositoriesSortKey, visible });
            this.storageService.store('scm:view:visibleRepositories', raw, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        eventuallyFinishLoading() {
            this.finishLoading();
        }
        finishLoading() {
            if (this.didFinishLoading) {
                return;
            }
            this.didFinishLoading = true;
            this.previousState = undefined;
        }
        dispose() {
            this.disposables.dispose();
            this._onDidChangeRepositories.dispose();
            this._onDidSetVisibleRepositories.dispose();
        }
    };
    exports.SCMViewService = SCMViewService;
    __decorate([
        (0, decorators_1.debounce)(5000)
    ], SCMViewService.prototype, "eventuallyFinishLoading", null);
    exports.SCMViewService = SCMViewService = __decorate([
        __param(0, scm_1.ISCMService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, storage_1.IStorageService),
        __param(5, workspace_1.IWorkspaceContextService)
    ], SCMViewService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NtVmlld1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zY20vYnJvd3Nlci9zY21WaWV3U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpQmhHLFNBQVMscUJBQXFCLENBQUMsUUFBc0I7UUFDcEQsT0FBTyxHQUFHLFFBQVEsQ0FBQyxZQUFZLElBQUksUUFBUSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDakgsQ0FBQztJQUVELFNBQVMsaUJBQWlCLENBQUMsdUJBQWlELEVBQUUsVUFBMEI7UUFDdkcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFO1lBQ2pDLE9BQU8sVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7U0FDakM7UUFFRCxNQUFNLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZGLE9BQU8sTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBQSxvQkFBUSxFQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEksQ0FBQztJQUVZLFFBQUEscUJBQXFCLEdBQUc7UUFDcEMsaUJBQWlCLEVBQUUsSUFBSSwwQkFBYSxDQUF3QixzQkFBc0IsNERBQXNDO0tBQ3hILENBQUM7SUFlSyxJQUFNLGNBQWMs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