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
define(["require", "exports", "vs/nls!vs/workbench/contrib/scm/browser/activity", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/contrib/scm/common/scm", "vs/workbench/services/activity/common/activity", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/workbench/common/editor", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/network", "vs/base/common/iterator"], function (require, exports, nls_1, resources_1, lifecycle_1, event_1, scm_1, activity_1, contextkey_1, statusbar_1, editorService_1, configuration_1, editor_1, uriIdentity_1, network_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vPb = exports.$uPb = void 0;
    function getCount(repository) {
        if (typeof repository.provider.count === 'number') {
            return repository.provider.count;
        }
        else {
            return repository.provider.groups.elements.reduce((r, g) => r + g.elements.length, 0);
        }
    }
    let $uPb = class $uPb {
        constructor(i, j, k, l, m, n, o) {
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.a = lifecycle_1.$kc.None;
            this.b = lifecycle_1.$kc.None;
            this.c = undefined;
            this.d = new lifecycle_1.$lc();
            this.f = new lifecycle_1.$jc();
            this.h = new Set();
            this.i.onDidAddRepository(this.q, this, this.f);
            this.i.onDidRemoveRepository(this.s, this, this.f);
            const onDidChangeSCMCountBadge = event_1.Event.filter(n.onDidChangeConfiguration, e => e.affectsConfiguration('scm.countBadge'));
            onDidChangeSCMCountBadge(this.v, this, this.f);
            for (const repository of this.i.repositories) {
                this.q(repository);
            }
            this.j.onDidFocusRepository(this.t, this, this.f);
            this.t(this.j.focusedRepository);
            m.onDidActiveEditorChange(() => this.p(), this, this.f);
            this.v();
        }
        p(repositories = this.i.repositories) {
            const resource = editor_1.$3E.getOriginalUri(this.m.activeEditor);
            if (!resource) {
                return false;
            }
            let bestRepository = null;
            let bestMatchLength = Number.POSITIVE_INFINITY;
            for (const repository of repositories) {
                const root = repository.provider.rootUri;
                if (!root) {
                    continue;
                }
                const path = this.o.extUri.relativePath(root, resource);
                if (path && !/^\.\./.test(path) && path.length < bestMatchLength) {
                    bestRepository = repository;
                    bestMatchLength = path.length;
                }
            }
            if (!bestRepository) {
                return false;
            }
            this.t(bestRepository);
            return true;
        }
        q(repository) {
            const onDidChange = event_1.Event.any(repository.provider.onDidChange, repository.provider.onDidChangeResources);
            const changeDisposable = onDidChange(() => this.v());
            const onDidRemove = event_1.Event.filter(this.i.onDidRemoveRepository, e => e === repository);
            const removeDisposable = onDidRemove(() => {
                disposable.dispose();
                this.h.delete(disposable);
                this.v();
            });
            const disposable = (0, lifecycle_1.$hc)(changeDisposable, removeDisposable);
            this.h.add(disposable);
            this.p(iterator_1.Iterable.single(repository));
        }
        s(repository) {
            if (this.c !== repository) {
                return;
            }
            this.t(iterator_1.Iterable.first(this.i.repositories));
        }
        t(repository) {
            if (this.c === repository) {
                return;
            }
            this.b.dispose();
            this.c = repository;
            if (repository && repository.provider.onDidChangeStatusBarCommands) {
                this.b = repository.provider.onDidChangeStatusBarCommands(() => this.u(repository));
            }
            this.u(repository);
            this.v();
        }
        u(repository) {
            this.a.dispose();
            if (!repository) {
                return;
            }
            const commands = repository.provider.statusBarCommands || [];
            const label = repository.provider.rootUri
                ? `${(0, resources_1.$fg)(repository.provider.rootUri)} (${repository.provider.label})`
                : repository.provider.label;
            const disposables = new lifecycle_1.$jc();
            for (let index = 0; index < commands.length; index++) {
                const command = commands[index];
                const tooltip = `${label}${command.tooltip ? ` - ${command.tooltip}` : ''}`;
                // Get a repository agnostic name for the status bar action, derive this from the
                // first command argument which is in the form "git.<command>/<number>"
                let repoAgnosticActionName = command.arguments?.[0];
                if (repoAgnosticActionName && typeof repoAgnosticActionName === 'string') {
                    repoAgnosticActionName = repoAgnosticActionName
                        .substring(0, repoAgnosticActionName.lastIndexOf('/'))
                        .replace(/^git\./, '');
                    if (repoAgnosticActionName.length > 1) {
                        repoAgnosticActionName = repoAgnosticActionName[0].toLocaleUpperCase() + repoAgnosticActionName.slice(1);
                    }
                }
                else {
                    repoAgnosticActionName = '';
                }
                const statusbarEntry = {
                    name: (0, nls_1.localize)(0, null) + (repoAgnosticActionName ? ` ${repoAgnosticActionName}` : ''),
                    text: command.title,
                    ariaLabel: tooltip,
                    tooltip,
                    command: command.id ? command : undefined
                };
                disposables.add(index === 0 ?
                    this.k.addEntry(statusbarEntry, `status.scm.${index}`, 0 /* MainThreadStatusBarAlignment.LEFT */, 10000) :
                    this.k.addEntry(statusbarEntry, `status.scm.${index}`, 0 /* MainThreadStatusBarAlignment.LEFT */, { id: `status.scm.${index - 1}`, alignment: 1 /* MainThreadStatusBarAlignment.RIGHT */, compact: true }));
            }
            this.a = disposables;
        }
        v() {
            const countBadgeType = this.n.getValue('scm.countBadge');
            let count = 0;
            if (countBadgeType === 'all') {
                count = iterator_1.Iterable.reduce(this.i.repositories, (r, repository) => r + getCount(repository), 0);
            }
            else if (countBadgeType === 'focused' && this.c) {
                count = getCount(this.c);
            }
            if (count > 0) {
                const badge = new activity_1.$IV(count, num => (0, nls_1.localize)(1, null, num));
                this.d.value = this.l.showViewActivity(scm_1.$cI, { badge, clazz: 'scm-viewlet-label' });
            }
            else {
                this.d.value = undefined;
            }
        }
        dispose() {
            this.b.dispose();
            this.a.dispose();
            this.d.dispose();
            this.f.dispose();
            (0, lifecycle_1.$fc)(this.h.values());
            this.h.clear();
        }
    };
    exports.$uPb = $uPb;
    exports.$uPb = $uPb = __decorate([
        __param(0, scm_1.$fI),
        __param(1, scm_1.$gI),
        __param(2, statusbar_1.$6$),
        __param(3, activity_1.$HV),
        __param(4, editorService_1.$9C),
        __param(5, configuration_1.$8h),
        __param(6, uriIdentity_1.$Ck)
    ], $uPb);
    let $vPb = class $vPb {
        constructor(contextKeyService, f, h, i) {
            this.f = f;
            this.h = h;
            this.i = i;
            this.c = new lifecycle_1.$jc();
            this.d = new Set();
            this.a = contextKeyService.createKey('scmActiveResourceHasChanges', false);
            this.b = contextKeyService.createKey('scmActiveResourceRepository', undefined);
            this.h.onDidAddRepository(this.j, this, this.c);
            for (const repository of this.h.repositories) {
                this.j(repository);
            }
            f.onDidActiveEditorChange(this.k, this, this.c);
        }
        j(repository) {
            const onDidChange = event_1.Event.any(repository.provider.onDidChange, repository.provider.onDidChangeResources);
            const changeDisposable = onDidChange(() => this.k());
            const onDidRemove = event_1.Event.filter(this.h.onDidRemoveRepository, e => e === repository);
            const removeDisposable = onDidRemove(() => {
                disposable.dispose();
                this.d.delete(disposable);
                this.k();
            });
            const disposable = (0, lifecycle_1.$hc)(changeDisposable, removeDisposable);
            this.d.add(disposable);
        }
        k() {
            const activeResource = editor_1.$3E.getOriginalUri(this.f.activeEditor);
            if (activeResource?.scheme === network_1.Schemas.file || activeResource?.scheme === network_1.Schemas.vscodeRemote) {
                const activeResourceRepository = iterator_1.Iterable.find(this.h.repositories, r => Boolean(r.provider.rootUri && this.i.extUri.isEqualOrParent(activeResource, r.provider.rootUri)));
                this.b.set(activeResourceRepository?.id);
                for (const resourceGroup of activeResourceRepository?.provider.groups.elements ?? []) {
                    if (resourceGroup.elements
                        .some(scmResource => this.i.extUri.isEqual(activeResource, scmResource.sourceUri))) {
                        this.a.set(true);
                        return;
                    }
                }
                this.a.set(false);
            }
            else {
                this.a.set(false);
                this.b.set(undefined);
            }
        }
        dispose() {
            this.c.dispose();
            (0, lifecycle_1.$fc)(this.d.values());
            this.d.clear();
        }
    };
    exports.$vPb = $vPb;
    exports.$vPb = $vPb = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, editorService_1.$9C),
        __param(2, scm_1.$fI),
        __param(3, uriIdentity_1.$Ck)
    ], $vPb);
});
//# sourceMappingURL=activity.js.map