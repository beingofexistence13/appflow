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
define(["require", "exports", "vs/base/common/path", "vs/base/browser/dom", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/workbench/browser/labels", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/scm/browser/scmRepositoryRenderer", "vs/workbench/contrib/scm/browser/scmViewPane", "vs/workbench/contrib/scm/browser/util", "vs/workbench/contrib/scm/common/scm", "vs/base/common/comparers", "vs/nls", "vs/base/common/iterator"], function (require, exports, path, dom_1, countBadge_1, iconLabel_1, lifecycle_1, themables_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, listService_1, opener_1, telemetry_1, defaultStyles_1, themeService_1, labels_1, editorCommands_1, viewPane_1, views_1, scmRepositoryRenderer_1, scmViewPane_1, util_1, scm_1, comparers_1, nls_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SCMSyncViewPane = void 0;
    function isSCMHistoryItemGroupTreeElement(obj) {
        return obj.type === 'historyItemGroup';
    }
    function isSCMHistoryItemTreeElement(obj) {
        return obj.type === 'historyItem';
    }
    function isSCMHistoryItemChangeTreeElement(obj) {
        return obj.type === 'historyItemChange';
    }
    function toDiffEditorArguments(uri, originalUri, modifiedUri) {
        const basename = path.basename(uri.fsPath);
        const originalQuery = JSON.parse(originalUri.query);
        const modifiedQuery = JSON.parse(modifiedUri.query);
        const originalShortRef = originalQuery.ref.substring(0, 8).concat(originalQuery.ref.endsWith('^') ? '^' : '');
        const modifiedShortRef = modifiedQuery.ref.substring(0, 8).concat(modifiedQuery.ref.endsWith('^') ? '^' : '');
        return [originalUri, modifiedUri, `${basename} (${originalShortRef}) ↔ ${basename} (${modifiedShortRef})`];
    }
    function getSCMResourceId(element) {
        if ((0, util_1.isSCMRepository)(element)) {
            const provider = element.provider;
            return `repo:${provider.id}`;
        }
        else if ((0, util_1.isSCMActionButton)(element)) {
            const provider = element.repository.provider;
            return `actionButton:${provider.id}`;
        }
        else if (isSCMHistoryItemGroupTreeElement(element)) {
            const provider = element.repository.provider;
            return `historyItemGroup:${provider.id}/${element.id}`;
        }
        else if (isSCMHistoryItemTreeElement(element)) {
            const historyItemGroup = element.historyItemGroup;
            const provider = historyItemGroup.repository.provider;
            return `historyItem:${provider.id}/${historyItemGroup.id}/${element.id}`;
        }
        else if (isSCMHistoryItemChangeTreeElement(element)) {
            const historyItem = element.historyItem;
            const historyItemGroup = historyItem.historyItemGroup;
            const provider = historyItemGroup.repository.provider;
            return `historyItemChange:${provider.id}/${historyItemGroup.id}/${historyItem.id}/${element.uri.toString()}`;
        }
        else {
            throw new Error('Invalid tree element');
        }
    }
    class ListDelegate {
        getHeight(element) {
            if ((0, util_1.isSCMActionButton)(element)) {
                return scmViewPane_1.ActionButtonRenderer.DEFAULT_HEIGHT + 10;
            }
            else {
                return 22;
            }
        }
        getTemplateId(element) {
            if ((0, util_1.isSCMRepository)(element)) {
                return scmRepositoryRenderer_1.RepositoryRenderer.TEMPLATE_ID;
            }
            else if ((0, util_1.isSCMActionButton)(element)) {
                return scmViewPane_1.ActionButtonRenderer.TEMPLATE_ID;
            }
            else if (isSCMHistoryItemGroupTreeElement(element)) {
                return HistoryItemGroupRenderer.TEMPLATE_ID;
            }
            else if (isSCMHistoryItemTreeElement(element)) {
                return HistoryItemRenderer.TEMPLATE_ID;
            }
            else if (isSCMHistoryItemChangeTreeElement(element)) {
                return HistoryItemChangeRenderer.TEMPLATE_ID;
            }
            else {
                throw new Error('Invalid tree element');
            }
        }
    }
    class HistoryItemGroupRenderer {
        static { this.TEMPLATE_ID = 'history-item-group'; }
        get templateId() { return HistoryItemGroupRenderer.TEMPLATE_ID; }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.history-item-group'));
            const label = new iconLabel_1.IconLabel(element, { supportIcons: true });
            const countContainer = (0, dom_1.append)(element, (0, dom_1.$)('.count'));
            const count = new countBadge_1.CountBadge(countContainer, {}, defaultStyles_1.defaultCountBadgeStyles);
            return { label, count, disposables: new lifecycle_1.DisposableStore() };
        }
        renderElement(node, index, templateData, height) {
            const historyItemGroup = node.element;
            templateData.label.setLabel(historyItemGroup.label, historyItemGroup.description);
            templateData.count.setCount(historyItemGroup.count ?? 0);
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    }
    class HistoryItemRenderer {
        static { this.TEMPLATE_ID = 'history-item'; }
        get templateId() { return HistoryItemRenderer.TEMPLATE_ID; }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.history-item'));
            const iconLabel = new iconLabel_1.IconLabel(element, { supportIcons: true });
            const iconContainer = (0, dom_1.prepend)(iconLabel.element, (0, dom_1.$)('.icon-container'));
            // const avatarImg = append(iconContainer, $('img.avatar')) as HTMLImageElement;
            const timestampContainer = (0, dom_1.append)(iconLabel.element, (0, dom_1.$)('.timestamp-container'));
            const timestamp = (0, dom_1.append)(timestampContainer, (0, dom_1.$)('span.timestamp'));
            return { iconContainer, iconLabel, timestampContainer, timestamp, disposables: new lifecycle_1.DisposableStore() };
        }
        renderElement(node, index, templateData, height) {
            const historyItem = node.element;
            templateData.iconContainer.className = 'icon-container';
            if (historyItem.icon && themables_1.ThemeIcon.isThemeIcon(historyItem.icon)) {
                templateData.iconContainer.classList.add(...themables_1.ThemeIcon.asClassNameArray(historyItem.icon));
            }
            // if (commit.authorAvatar) {
            // 	templateData.avatarImg.src = commit.authorAvatar;
            // 	templateData.avatarImg.style.display = 'block';
            // 	templateData.iconContainer.classList.remove(...ThemeIcon.asClassNameArray(Codicon.account));
            // } else {
            // 	templateData.avatarImg.style.display = 'none';
            // 	templateData.iconContainer.classList.add(...ThemeIcon.asClassNameArray(Codicon.account));
            // }
            templateData.iconLabel.setLabel(historyItem.label, historyItem.description);
            // templateData.timestampContainer.classList.toggle('timestamp-duplicate', commit.hideTimestamp === true);
            // templateData.timestamp.textContent = fromNow(commit.timestamp);
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    }
    class HistoryItemChangeRenderer {
        static { this.TEMPLATE_ID = 'historyItemChange'; }
        get templateId() { return HistoryItemChangeRenderer.TEMPLATE_ID; }
        constructor(labels) {
            this.labels = labels;
        }
        renderTemplate(container) {
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.change'));
            const name = (0, dom_1.append)(element, (0, dom_1.$)('.name'));
            const fileLabel = this.labels.create(name, { supportDescriptionHighlights: true, supportHighlights: true });
            const decorationIcon = (0, dom_1.append)(element, (0, dom_1.$)('.decoration-icon'));
            return { element, name, fileLabel, decorationIcon, disposables: new lifecycle_1.DisposableStore() };
        }
        renderElement(node, index, templateData, height) {
            templateData.fileLabel.setFile(node.element.uri, {
                fileDecorations: { colors: false, badges: true },
                hidePath: false,
            });
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    }
    class SCMSyncViewPaneAccessibilityProvider {
        getAriaLabel(element) {
            // TODO - add aria labels
            return '';
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('scmSync', 'Source Control Sync');
        }
    }
    class SCMSyncViewPaneTreeIdentityProvider {
        getId(element) {
            return getSCMResourceId(element);
        }
    }
    class SCMSyncViewPaneTreeSorter {
        compare(element, otherElement) {
            // Repository
            if ((0, util_1.isSCMRepository)(element)) {
                if (!(0, util_1.isSCMRepository)(otherElement)) {
                    throw new Error('Invalid comparison');
                }
                return 0;
            }
            // Action button
            if ((0, util_1.isSCMActionButton)(element)) {
                return -1;
            }
            else if ((0, util_1.isSCMActionButton)(otherElement)) {
                return 1;
            }
            // History item group
            if (isSCMHistoryItemGroupTreeElement(element)) {
                if (!isSCMHistoryItemGroupTreeElement(otherElement)) {
                    throw new Error('Invalid comparison');
                }
                return 0;
            }
            // History item
            if (isSCMHistoryItemTreeElement(element)) {
                if (!isSCMHistoryItemTreeElement(otherElement)) {
                    throw new Error('Invalid comparison');
                }
                return 0;
            }
            // History item change
            const elementPath = element.uri.fsPath;
            const otherElementPath = otherElement.uri.fsPath;
            return (0, comparers_1.comparePaths)(elementPath, otherElementPath);
        }
    }
    let SCMSyncViewPane = class SCMSyncViewPane extends viewPane_1.ViewPane {
        get viewModel() { return this._viewModel; }
        constructor(options, commandService, keybindingService, contextMenuService, instantiationService, viewDescriptorService, contextKeyService, configurationService, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.commandService = commandService;
            this.disposables = new lifecycle_1.DisposableStore();
        }
        renderBody(container) {
            super.renderBody(container);
            const treeContainer = (0, dom_1.append)(container, (0, dom_1.$)('.scm-view.scm-sync-view.file-icon-themable-tree'));
            this.listLabels = this.instantiationService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this._register(this.listLabels);
            this._tree = this.instantiationService.createInstance(listService_1.WorkbenchAsyncDataTree, 'SCM Sync View', treeContainer, new ListDelegate(), [
                this.instantiationService.createInstance(scmRepositoryRenderer_1.RepositoryRenderer, (0, util_1.getActionViewItemProvider)(this.instantiationService)),
                this.instantiationService.createInstance(scmViewPane_1.ActionButtonRenderer),
                this.instantiationService.createInstance(HistoryItemGroupRenderer),
                this.instantiationService.createInstance(HistoryItemRenderer),
                this.instantiationService.createInstance(HistoryItemChangeRenderer, this.listLabels),
            ], this.instantiationService.createInstance(SCMSyncDataSource), {
                horizontalScrolling: false,
                accessibilityProvider: new SCMSyncViewPaneAccessibilityProvider(),
                identityProvider: new SCMSyncViewPaneTreeIdentityProvider(),
                sorter: new SCMSyncViewPaneTreeSorter(),
            });
            this._register(this._tree);
            this._register(this._tree.onDidOpen(this.onDidOpen, this));
            this._viewModel = this.instantiationService.createInstance(SCMSyncPaneViewModel, this._tree);
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this._tree.layout(height, width);
        }
        async onDidOpen(e) {
            if (!e.element) {
                return;
            }
            else if (isSCMHistoryItemChangeTreeElement(e.element)) {
                if (e.element.originalUri && e.element.modifiedUri) {
                    await this.commandService.executeCommand(editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID, ...toDiffEditorArguments(e.element.uri, e.element.originalUri, e.element.modifiedUri));
                }
            }
        }
        dispose() {
            this.disposables.dispose();
            super.dispose();
        }
    };
    exports.SCMSyncViewPane = SCMSyncViewPane;
    exports.SCMSyncViewPane = SCMSyncViewPane = __decorate([
        __param(1, commands_1.ICommandService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, opener_1.IOpenerService),
        __param(9, themeService_1.IThemeService),
        __param(10, telemetry_1.ITelemetryService)
    ], SCMSyncViewPane);
    let SCMSyncPaneViewModel = class SCMSyncPaneViewModel {
        constructor(tree, scmViewService, configurationService) {
            this.tree = tree;
            this.configurationService = configurationService;
            this.repositories = new Map();
            this.historyProviders = new Map();
            this.alwaysShowRepositories = false;
            this.disposables = new lifecycle_1.DisposableStore();
            configurationService.onDidChangeConfiguration(this.onDidChangeConfiguration, this, this.disposables);
            this.onDidChangeConfiguration();
            scmViewService.onDidChangeVisibleRepositories(this._onDidChangeVisibleRepositories, this, this.disposables);
            this._onDidChangeVisibleRepositories({ added: scmViewService.visibleRepositories, removed: [] });
        }
        onDidChangeConfiguration(e) {
            if (!e || e.affectsConfiguration('scm.alwaysShowRepositories')) {
                this.alwaysShowRepositories = this.configurationService.getValue('scm.alwaysShowRepositories');
                this.refresh();
            }
        }
        _onDidChangeVisibleRepositories({ added, removed }) {
            for (const repository of added) {
                const repositoryDisposable = repository.provider.onDidChangeHistoryProvider(() => this._onDidChangeHistoryProvider(repository));
                this._onDidChangeHistoryProvider(repository);
                this.repositories.set(repository, { dispose() { repositoryDisposable.dispose(); } });
            }
            for (const repository of removed) {
                this.repositories.get(repository)?.dispose();
                this.repositories.delete(repository);
            }
            this.refresh();
        }
        _onDidChangeHistoryProvider(repository) {
            if (repository.provider.historyProvider) {
                const historyProviderDisposable = (0, lifecycle_1.combinedDisposable)(repository.provider.historyProvider.onDidChangeActionButton(() => this.refresh(repository)), repository.provider.historyProvider.onDidChangeCurrentHistoryItemGroup(() => this.refresh(repository)));
                this.historyProviders.set(repository, historyProviderDisposable);
            }
            else {
                this.historyProviders.get(repository)?.dispose();
                this.historyProviders.delete(repository);
            }
        }
        async refresh(repository) {
            if (this.repositories.size === 0) {
                return;
            }
            if (repository) {
                // Particular repository
                await this.tree.updateChildren(repository);
            }
            else if (this.repositories.size === 1 && !this.alwaysShowRepositories) {
                // Single repository and not always show repositories
                await this.tree.setInput(iterator_1.Iterable.first(this.repositories.keys()));
            }
            else {
                // Expand repository nodes
                const expanded = Array.from(this.repositories.keys())
                    .map(repository => `repo:${repository.provider.id}`);
                // Multiple repositories or always show repositories
                await this.tree.setInput([...this.repositories.keys()], { expanded });
            }
        }
    };
    SCMSyncPaneViewModel = __decorate([
        __param(1, scm_1.ISCMViewService),
        __param(2, configuration_1.IConfigurationService)
    ], SCMSyncPaneViewModel);
    class SCMSyncDataSource {
        hasChildren(element) {
            if ((0, util_1.isSCMRepositoryArray)(element)) {
                return true;
            }
            else if ((0, util_1.isSCMRepository)(element)) {
                return true;
            }
            else if ((0, util_1.isSCMActionButton)(element)) {
                return false;
            }
            else if (isSCMHistoryItemGroupTreeElement(element)) {
                return true;
            }
            else if (isSCMHistoryItemTreeElement(element)) {
                return true;
            }
            else if (isSCMHistoryItemChangeTreeElement(element)) {
                return false;
            }
            else {
                throw new Error('hasChildren not implemented.');
            }
        }
        async getChildren(element) {
            const children = [];
            if ((0, util_1.isSCMRepositoryArray)(element)) {
                children.push(...element);
            }
            else if ((0, util_1.isSCMRepository)(element)) {
                const scmProvider = element.provider;
                const historyProvider = scmProvider.historyProvider;
                const historyItemGroup = historyProvider?.currentHistoryItemGroup;
                if (!historyProvider || !historyItemGroup) {
                    return children;
                }
                // Action Button
                const actionButton = historyProvider.actionButton;
                if (actionButton) {
                    children.push({
                        type: 'actionButton',
                        repository: element,
                        button: actionButton
                    });
                }
                // History item group base
                const historyItemGroupBase = await historyProvider.resolveHistoryItemGroupBase(historyItemGroup.id);
                if (!historyItemGroupBase) {
                    return children;
                }
                // Common ancestor, ahead, behind
                const ancestor = await historyProvider.resolveHistoryItemGroupCommonAncestor(historyItemGroup.id, historyItemGroupBase.id);
                // Incoming
                if (historyItemGroupBase) {
                    children.push({
                        id: historyItemGroupBase.id,
                        label: (0, nls_1.localize)('incoming', "$(cloud-download) Incoming Changes"),
                        description: historyItemGroupBase.label,
                        ancestor: ancestor?.id,
                        count: ancestor?.behind ?? 0,
                        repository: element,
                        type: 'historyItemGroup'
                    });
                }
                // Outgoing
                if (historyItemGroup) {
                    children.push({
                        id: historyItemGroup.id,
                        label: (0, nls_1.localize)('outgoing', "$(cloud-upload) Outgoing Changes"),
                        description: historyItemGroup.label,
                        ancestor: ancestor?.id,
                        count: ancestor?.ahead ?? 0,
                        repository: element,
                        type: 'historyItemGroup'
                    });
                }
            }
            else if (isSCMHistoryItemGroupTreeElement(element)) {
                const scmProvider = element.repository.provider;
                const historyProvider = scmProvider.historyProvider;
                if (!historyProvider) {
                    return children;
                }
                const historyItems = await historyProvider.provideHistoryItems(element.id, { limit: { id: element.ancestor } }) ?? [];
                children.push(...historyItems.map(historyItem => ({
                    id: historyItem.id,
                    label: historyItem.label,
                    description: historyItem.description,
                    icon: historyItem.icon,
                    historyItemGroup: element,
                    type: 'historyItem'
                })));
            }
            else if (isSCMHistoryItemTreeElement(element)) {
                const repository = element.historyItemGroup.repository;
                const historyProvider = repository.provider.historyProvider;
                if (!historyProvider) {
                    return children;
                }
                // History Item Changes
                const changes = await historyProvider.provideHistoryItemChanges(element.id) ?? [];
                children.push(...changes.map(change => ({
                    uri: change.uri,
                    originalUri: change.originalUri,
                    modifiedUri: change.modifiedUri,
                    renameUri: change.renameUri,
                    historyItem: element,
                    type: 'historyItemChange'
                })));
            }
            else {
                throw new Error('getChildren Method not implemented.');
            }
            return children;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NtU3luY1ZpZXdQYW5lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2NtL2Jyb3dzZXIvc2NtU3luY1ZpZXdQYW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXNDaEcsU0FBUyxnQ0FBZ0MsQ0FBQyxHQUFRO1FBQ2pELE9BQVEsR0FBc0MsQ0FBQyxJQUFJLEtBQUssa0JBQWtCLENBQUM7SUFDNUUsQ0FBQztJQUVELFNBQVMsMkJBQTJCLENBQUMsR0FBUTtRQUM1QyxPQUFRLEdBQWlDLENBQUMsSUFBSSxLQUFLLGFBQWEsQ0FBQztJQUNsRSxDQUFDO0lBRUQsU0FBUyxpQ0FBaUMsQ0FBQyxHQUFRO1FBQ2xELE9BQVEsR0FBdUMsQ0FBQyxJQUFJLEtBQUssbUJBQW1CLENBQUM7SUFDOUUsQ0FBQztJQUVELFNBQVMscUJBQXFCLENBQUMsR0FBUSxFQUFFLFdBQWdCLEVBQUUsV0FBZ0I7UUFDMUUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFrQyxDQUFDO1FBQ3JGLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBa0MsQ0FBQztRQUVyRixNQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUcsTUFBTSxnQkFBZ0IsR0FBRyxh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