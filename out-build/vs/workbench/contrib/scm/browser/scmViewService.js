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
    exports.$OPb = exports.$NPb = void 0;
    function getProviderStorageKey(provider) {
        return `${provider.contextValue}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ''}`;
    }
    function getRepositoryName(workspaceContextService, repository) {
        if (!repository.provider.rootUri) {
            return repository.provider.label;
        }
        const folder = workspaceContextService.getWorkspaceFolder(repository.provider.rootUri);
        return folder?.uri.toString() === repository.provider.rootUri.toString() ? folder.name : (0, resources_1.$fg)(repository.provider.rootUri);
    }
    exports.$NPb = {
        RepositorySortKey: new contextkey_1.$2i('scmRepositorySortKey', "discoveryTime" /* ISCMRepositorySortKey.DiscoveryTime */),
    };
    let $OPb = class $OPb {
        get repositories() {
            return this.f.map(r => r.repository);
        }
        get visibleRepositories() {
            // In order to match the legacy behaviour, when the repositories are sorted by discovery time,
            // the visible repositories are sorted by the selection index instead of the discovery time.
            if (this.j === "discoveryTime" /* ISCMRepositorySortKey.DiscoveryTime */) {
                return this.f.filter(r => r.selectionIndex !== -1)
                    .sort((r1, r2) => r1.selectionIndex - r2.selectionIndex)
                    .map(r => r.repository);
            }
            return this.f
                .filter(r => r.selectionIndex !== -1)
                .map(r => r.repository);
        }
        set visibleRepositories(visibleRepositories) {
            const set = new Set(visibleRepositories);
            const added = new Set();
            const removed = new Set();
            for (const repositoryView of this.f) {
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
            this.h.fire({ added, removed });
            // Update focus if the focused repository is not visible anymore
            if (this.f.find(r => r.focused && r.selectionIndex === -1)) {
                this.focus(this.f.find(r => r.selectionIndex !== -1)?.repository);
            }
        }
        get focusedRepository() {
            return this.f.find(r => r.focused)?.repository;
        }
        constructor(scmService, contextKeyService, instantiationService, l, m, n) {
            this.l = l;
            this.m = m;
            this.n = n;
            this.a = false;
            this.b = false;
            this.d = new lifecycle_1.$jc();
            this.f = [];
            this.g = new event_1.$fd();
            this.onDidChangeRepositories = this.g.event;
            this.h = new event_1.$fd();
            this.onDidChangeVisibleRepositories = event_1.Event.any(this.h.event, event_1.Event.debounce(this.g.event, (last, e) => {
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
            }, 0, undefined, undefined, undefined, this.d));
            this.i = new event_1.$fd();
            this.onDidFocusRepository = this.i.event;
            this.menus = instantiationService.createInstance(menus_1.$MPb);
            try {
                this.c = JSON.parse(m.get('scm:view:visibleRepositories', 1 /* StorageScope.WORKSPACE */, ''));
            }
            catch {
                // noop
            }
            this.j = this.c?.sortKey ?? this.t();
            this.k = exports.$NPb.RepositorySortKey.bindTo(contextKeyService);
            this.k.set(this.j);
            scmService.onDidAddRepository(this.o, this, this.d);
            scmService.onDidRemoveRepository(this.p, this, this.d);
            for (const repository of scmService.repositories) {
                this.o(repository);
            }
            m.onWillSaveState(this.v, this, this.d);
        }
        o(repository) {
            if (!this.a) {
                this.w();
            }
            const repositoryView = {
                repository, discoveryTime: Date.now(), focused: false, selectionIndex: -1
            };
            let removed = iterator_1.Iterable.empty();
            if (this.c) {
                const index = this.c.all.indexOf(getProviderStorageKey(repository.provider));
                if (index === -1) {
                    // This repository is not part of the previous state which means that it
                    // was either manually closed in the previous session, or the repository
                    // was added after the previous session.In this case, we should select all
                    // of the repositories.
                    const added = [];
                    this.u(this.f, repositoryView);
                    this.f.forEach((repositoryView, index) => {
                        if (repositoryView.selectionIndex === -1) {
                            added.push(repositoryView.repository);
                        }
                        repositoryView.selectionIndex = index;
                    });
                    this.g.fire({ added, removed: iterator_1.Iterable.empty() });
                    this.b = false;
                    return;
                }
                if (this.c.visible.indexOf(index) === -1) {
                    // Explicit selection started
                    if (this.b) {
                        this.u(this.f, repositoryView);
                        this.g.fire({ added: iterator_1.Iterable.empty(), removed: iterator_1.Iterable.empty() });
                        return;
                    }
                }
                else {
                    // First visible repository
                    if (!this.b) {
                        removed = [...this.visibleRepositories];
                        this.f.forEach(r => {
                            r.focused = false;
                            r.selectionIndex = -1;
                        });
                        this.b = true;
                    }
                }
            }
            const maxSelectionIndex = this.s();
            this.u(this.f, { ...repositoryView, selectionIndex: maxSelectionIndex + 1 });
            this.g.fire({ added: [repositoryView.repository], removed });
            if (!this.f.find(r => r.focused)) {
                this.focus(repository);
            }
        }
        p(repository) {
            if (!this.a) {
                this.w();
            }
            const repositoriesIndex = this.f.findIndex(r => r.repository === repository);
            if (repositoriesIndex === -1) {
                return;
            }
            let added = iterator_1.Iterable.empty();
            const repositoryView = this.f.splice(repositoriesIndex, 1);
            if (this.f.length > 0 && this.visibleRepositories.length === 0) {
                this.f[0].selectionIndex = 0;
                added = [this.f[0].repository];
            }
            this.g.fire({ added, removed: repositoryView.map(r => r.repository) });
            if (repositoryView.length === 1 && repositoryView[0].focused && this.visibleRepositories.length > 0) {
                this.focus(this.visibleRepositories[0]);
            }
        }
        isVisible(repository) {
            return this.f.find(r => r.repository === repository)?.selectionIndex !== -1;
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
            this.j = sortKey;
            this.k.set(this.j);
            this.f.sort(this.q.bind(this));
            this.g.fire({ added: iterator_1.Iterable.empty(), removed: iterator_1.Iterable.empty() });
        }
        focus(repository) {
            if (repository && !this.isVisible(repository)) {
                return;
            }
            this.f.forEach(r => r.focused = r.repository === repository);
            if (this.f.find(r => r.focused)) {
                this.i.fire(repository);
            }
        }
        q(op1, op2) {
            // Sort by discovery time
            if (this.j === "discoveryTime" /* ISCMRepositorySortKey.DiscoveryTime */) {
                return op1.discoveryTime - op2.discoveryTime;
            }
            // Sort by path
            if (this.j === 'path' && op1.repository.provider.rootUri && op2.repository.provider.rootUri) {
                return (0, comparers_1.$hq)(op1.repository.provider.rootUri.fsPath, op2.repository.provider.rootUri.fsPath);
            }
            // Sort by name, path
            const name1 = getRepositoryName(this.n, op1.repository);
            const name2 = getRepositoryName(this.n, op2.repository);
            const nameComparison = (0, comparers_1.$0p)(name1, name2);
            if (nameComparison === 0 && op1.repository.provider.rootUri && op2.repository.provider.rootUri) {
                return (0, comparers_1.$hq)(op1.repository.provider.rootUri.fsPath, op2.repository.provider.rootUri.fsPath);
            }
            return nameComparison;
        }
        s() {
            return this.f.length === 0 ? -1 :
                Math.max(...this.f.map(r => r.selectionIndex));
        }
        t() {
            const sortOder = this.l.getValue('scm.repositories.sortOrder');
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
        u(repositories, repositoryView) {
            const index = (0, arrays_1.$ub)(repositories, repositoryView, this.q.bind(this));
            repositories.splice(index < 0 ? ~index : index, 0, repositoryView);
        }
        v() {
            if (!this.a) { // don't remember state, if the workbench didn't really finish loading
                return;
            }
            const all = this.repositories.map(r => getProviderStorageKey(r.provider));
            const visible = this.visibleRepositories.map(r => all.indexOf(getProviderStorageKey(r.provider)));
            const raw = JSON.stringify({ all, sortKey: this.j, visible });
            this.m.store('scm:view:visibleRepositories', raw, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        w() {
            this.x();
        }
        x() {
            if (this.a) {
                return;
            }
            this.a = true;
            this.c = undefined;
        }
        dispose() {
            this.d.dispose();
            this.g.dispose();
            this.h.dispose();
        }
    };
    exports.$OPb = $OPb;
    __decorate([
        (0, decorators_1.$7g)(5000)
    ], $OPb.prototype, "w", null);
    exports.$OPb = $OPb = __decorate([
        __param(0, scm_1.$fI),
        __param(1, contextkey_1.$3i),
        __param(2, instantiation_1.$Ah),
        __param(3, configuration_1.$8h),
        __param(4, storage_1.$Vo),
        __param(5, workspace_1.$Kh)
    ], $OPb);
});
//# sourceMappingURL=scmViewService.js.map