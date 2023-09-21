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
define(["require", "exports", "vs/nls", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/contrib/scm/common/scm", "vs/workbench/services/activity/common/activity", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/workbench/common/editor", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/network", "vs/base/common/iterator"], function (require, exports, nls_1, resources_1, lifecycle_1, event_1, scm_1, activity_1, contextkey_1, statusbar_1, editorService_1, configuration_1, editor_1, uriIdentity_1, network_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SCMActiveResourceContextKeyController = exports.SCMStatusController = void 0;
    function getCount(repository) {
        if (typeof repository.provider.count === 'number') {
            return repository.provider.count;
        }
        else {
            return repository.provider.groups.elements.reduce((r, g) => r + g.elements.length, 0);
        }
    }
    let SCMStatusController = class SCMStatusController {
        constructor(scmService, scmViewService, statusbarService, activityService, editorService, configurationService, uriIdentityService) {
            this.scmService = scmService;
            this.scmViewService = scmViewService;
            this.statusbarService = statusbarService;
            this.activityService = activityService;
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.uriIdentityService = uriIdentityService;
            this.statusBarDisposable = lifecycle_1.Disposable.None;
            this.focusDisposable = lifecycle_1.Disposable.None;
            this.focusedRepository = undefined;
            this.badgeDisposable = new lifecycle_1.MutableDisposable();
            this.disposables = new lifecycle_1.DisposableStore();
            this.repositoryDisposables = new Set();
            this.scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
            this.scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
            const onDidChangeSCMCountBadge = event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.countBadge'));
            onDidChangeSCMCountBadge(this.renderActivityCount, this, this.disposables);
            for (const repository of this.scmService.repositories) {
                this.onDidAddRepository(repository);
            }
            this.scmViewService.onDidFocusRepository(this.focusRepository, this, this.disposables);
            this.focusRepository(this.scmViewService.focusedRepository);
            editorService.onDidActiveEditorChange(() => this.tryFocusRepositoryBasedOnActiveEditor(), this, this.disposables);
            this.renderActivityCount();
        }
        tryFocusRepositoryBasedOnActiveEditor(repositories = this.scmService.repositories) {
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor);
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
                const path = this.uriIdentityService.extUri.relativePath(root, resource);
                if (path && !/^\.\./.test(path) && path.length < bestMatchLength) {
                    bestRepository = repository;
                    bestMatchLength = path.length;
                }
            }
            if (!bestRepository) {
                return false;
            }
            this.focusRepository(bestRepository);
            return true;
        }
        onDidAddRepository(repository) {
            const onDidChange = event_1.Event.any(repository.provider.onDidChange, repository.provider.onDidChangeResources);
            const changeDisposable = onDidChange(() => this.renderActivityCount());
            const onDidRemove = event_1.Event.filter(this.scmService.onDidRemoveRepository, e => e === repository);
            const removeDisposable = onDidRemove(() => {
                disposable.dispose();
                this.repositoryDisposables.delete(disposable);
                this.renderActivityCount();
            });
            const disposable = (0, lifecycle_1.combinedDisposable)(changeDisposable, removeDisposable);
            this.repositoryDisposables.add(disposable);
            this.tryFocusRepositoryBasedOnActiveEditor(iterator_1.Iterable.single(repository));
        }
        onDidRemoveRepository(repository) {
            if (this.focusedRepository !== repository) {
                return;
            }
            this.focusRepository(iterator_1.Iterable.first(this.scmService.repositories));
        }
        focusRepository(repository) {
            if (this.focusedRepository === repository) {
                return;
            }
            this.focusDisposable.dispose();
            this.focusedRepository = repository;
            if (repository && repository.provider.onDidChangeStatusBarCommands) {
                this.focusDisposable = repository.provider.onDidChangeStatusBarCommands(() => this.renderStatusBar(repository));
            }
            this.renderStatusBar(repository);
            this.renderActivityCount();
        }
        renderStatusBar(repository) {
            this.statusBarDisposable.dispose();
            if (!repository) {
                return;
            }
            const commands = repository.provider.statusBarCommands || [];
            const label = repository.provider.rootUri
                ? `${(0, resources_1.basename)(repository.provider.rootUri)} (${repository.provider.label})`
                : repository.provider.label;
            const disposables = new lifecycle_1.DisposableStore();
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
                    name: (0, nls_1.localize)('status.scm', "Source Control") + (repoAgnosticActionName ? ` ${repoAgnosticActionName}` : ''),
                    text: command.title,
                    ariaLabel: tooltip,
                    tooltip,
                    command: command.id ? command : undefined
                };
                disposables.add(index === 0 ?
                    this.statusbarService.addEntry(statusbarEntry, `status.scm.${index}`, 0 /* MainThreadStatusBarAlignment.LEFT */, 10000) :
                    this.statusbarService.addEntry(statusbarEntry, `status.scm.${index}`, 0 /* MainThreadStatusBarAlignment.LEFT */, { id: `status.scm.${index - 1}`, alignment: 1 /* MainThreadStatusBarAlignment.RIGHT */, compact: true }));
            }
            this.statusBarDisposable = disposables;
        }
        renderActivityCount() {
            const countBadgeType = this.configurationService.getValue('scm.countBadge');
            let count = 0;
            if (countBadgeType === 'all') {
                count = iterator_1.Iterable.reduce(this.scmService.repositories, (r, repository) => r + getCount(repository), 0);
            }
            else if (countBadgeType === 'focused' && this.focusedRepository) {
                count = getCount(this.focusedRepository);
            }
            if (count > 0) {
                const badge = new activity_1.NumberBadge(count, num => (0, nls_1.localize)('scmPendingChangesBadge', '{0} pending changes', num));
                this.badgeDisposable.value = this.activityService.showViewActivity(scm_1.VIEW_PANE_ID, { badge, clazz: 'scm-viewlet-label' });
            }
            else {
                this.badgeDisposable.value = undefined;
            }
        }
        dispose() {
            this.focusDisposable.dispose();
            this.statusBarDisposable.dispose();
            this.badgeDisposable.dispose();
            this.disposables.dispose();
            (0, lifecycle_1.dispose)(this.repositoryDisposables.values());
            this.repositoryDisposables.clear();
        }
    };
    exports.SCMStatusController = SCMStatusController;
    exports.SCMStatusController = SCMStatusController = __decorate([
        __param(0, scm_1.ISCMService),
        __param(1, scm_1.ISCMViewService),
        __param(2, statusbar_1.IStatusbarService),
        __param(3, activity_1.IActivityService),
        __param(4, editorService_1.IEditorService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, uriIdentity_1.IUriIdentityService)
    ], SCMStatusController);
    let SCMActiveResourceContextKeyController = class SCMActiveResourceContextKeyController {
        constructor(contextKeyService, editorService, scmService, uriIdentityService) {
            this.editorService = editorService;
            this.scmService = scmService;
            this.uriIdentityService = uriIdentityService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.repositoryDisposables = new Set();
            this.activeResourceHasChangesContextKey = contextKeyService.createKey('scmActiveResourceHasChanges', false);
            this.activeResourceRepositoryContextKey = contextKeyService.createKey('scmActiveResourceRepository', undefined);
            this.scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
            for (const repository of this.scmService.repositories) {
                this.onDidAddRepository(repository);
            }
            editorService.onDidActiveEditorChange(this.updateContextKey, this, this.disposables);
        }
        onDidAddRepository(repository) {
            const onDidChange = event_1.Event.any(repository.provider.onDidChange, repository.provider.onDidChangeResources);
            const changeDisposable = onDidChange(() => this.updateContextKey());
            const onDidRemove = event_1.Event.filter(this.scmService.onDidRemoveRepository, e => e === repository);
            const removeDisposable = onDidRemove(() => {
                disposable.dispose();
                this.repositoryDisposables.delete(disposable);
                this.updateContextKey();
            });
            const disposable = (0, lifecycle_1.combinedDisposable)(changeDisposable, removeDisposable);
            this.repositoryDisposables.add(disposable);
        }
        updateContextKey() {
            const activeResource = editor_1.EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor);
            if (activeResource?.scheme === network_1.Schemas.file || activeResource?.scheme === network_1.Schemas.vscodeRemote) {
                const activeResourceRepository = iterator_1.Iterable.find(this.scmService.repositories, r => Boolean(r.provider.rootUri && this.uriIdentityService.extUri.isEqualOrParent(activeResource, r.provider.rootUri)));
                this.activeResourceRepositoryContextKey.set(activeResourceRepository?.id);
                for (const resourceGroup of activeResourceRepository?.provider.groups.elements ?? []) {
                    if (resourceGroup.elements
                        .some(scmResource => this.uriIdentityService.extUri.isEqual(activeResource, scmResource.sourceUri))) {
                        this.activeResourceHasChangesContextKey.set(true);
                        return;
                    }
                }
                this.activeResourceHasChangesContextKey.set(false);
            }
            else {
                this.activeResourceHasChangesContextKey.set(false);
                this.activeResourceRepositoryContextKey.set(undefined);
            }
        }
        dispose() {
            this.disposables.dispose();
            (0, lifecycle_1.dispose)(this.repositoryDisposables.values());
            this.repositoryDisposables.clear();
        }
    };
    exports.SCMActiveResourceContextKeyController = SCMActiveResourceContextKeyController;
    exports.SCMActiveResourceContextKeyController = SCMActiveResourceContextKeyController = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, editorService_1.IEditorService),
        __param(2, scm_1.ISCMService),
        __param(3, uriIdentity_1.IUriIdentityService)
    ], SCMActiveResourceContextKeyController);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zY20vYnJvd3Nlci9hY3Rpdml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQmhHLFNBQVMsUUFBUSxDQUFDLFVBQTBCO1FBQzNDLElBQUksT0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7WUFDbEQsT0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztTQUNqQzthQUFNO1lBQ04sT0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzlGO0lBQ0YsQ0FBQztJQUVNLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW1CO1FBUy9CLFlBQ2MsVUFBd0MsRUFDcEMsY0FBZ0QsRUFDOUMsZ0JBQW9ELEVBQ3JELGVBQWtELEVBQ3BELGFBQThDLEVBQ3ZDLG9CQUE0RCxFQUM5RCxrQkFBd0Q7WUFOL0MsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNuQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDN0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNwQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDbkMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ3RCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDN0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQWR0RSx3QkFBbUIsR0FBZ0Isc0JBQVUsQ0FBQyxJQUFJLENBQUM7WUFDbkQsb0JBQWUsR0FBZ0Isc0JBQVUsQ0FBQyxJQUFJLENB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