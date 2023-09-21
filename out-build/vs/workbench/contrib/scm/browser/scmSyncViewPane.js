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
define(["require", "exports", "vs/base/common/path", "vs/base/browser/dom", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/workbench/browser/labels", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/scm/browser/scmRepositoryRenderer", "vs/workbench/contrib/scm/browser/scmViewPane", "vs/workbench/contrib/scm/browser/util", "vs/workbench/contrib/scm/common/scm", "vs/base/common/comparers", "vs/nls!vs/workbench/contrib/scm/browser/scmSyncViewPane", "vs/base/common/iterator"], function (require, exports, path, dom_1, countBadge_1, iconLabel_1, lifecycle_1, themables_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, listService_1, opener_1, telemetry_1, defaultStyles_1, themeService_1, labels_1, editorCommands_1, viewPane_1, views_1, scmRepositoryRenderer_1, scmViewPane_1, util_1, scm_1, comparers_1, nls_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1Pb = void 0;
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
        const basename = path.$ae(uri.fsPath);
        const originalQuery = JSON.parse(originalUri.query);
        const modifiedQuery = JSON.parse(modifiedUri.query);
        const originalShortRef = originalQuery.ref.substring(0, 8).concat(originalQuery.ref.endsWith('^') ? '^' : '');
        const modifiedShortRef = modifiedQuery.ref.substring(0, 8).concat(modifiedQuery.ref.endsWith('^') ? '^' : '');
        return [originalUri, modifiedUri, `${basename} (${originalShortRef}) ↔ ${basename} (${modifiedShortRef})`];
    }
    function getSCMResourceId(element) {
        if ((0, util_1.$zPb)(element)) {
            const provider = element.provider;
            return `repo:${provider.id}`;
        }
        else if ((0, util_1.$BPb)(element)) {
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
            if ((0, util_1.$BPb)(element)) {
                return scmViewPane_1.$PPb.DEFAULT_HEIGHT + 10;
            }
            else {
                return 22;
            }
        }
        getTemplateId(element) {
            if ((0, util_1.$zPb)(element)) {
                return scmRepositoryRenderer_1.$JPb.TEMPLATE_ID;
            }
            else if ((0, util_1.$BPb)(element)) {
                return scmViewPane_1.$PPb.TEMPLATE_ID;
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
            const element = (0, dom_1.$0O)(container, (0, dom_1.$)('.history-item-group'));
            const label = new iconLabel_1.$KR(element, { supportIcons: true });
            const countContainer = (0, dom_1.$0O)(element, (0, dom_1.$)('.count'));
            const count = new countBadge_1.$nR(countContainer, {}, defaultStyles_1.$v2);
            return { label, count, disposables: new lifecycle_1.$jc() };
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
            const element = (0, dom_1.$0O)(container, (0, dom_1.$)('.history-item'));
            const iconLabel = new iconLabel_1.$KR(element, { supportIcons: true });
            const iconContainer = (0, dom_1.$$O)(iconLabel.element, (0, dom_1.$)('.icon-container'));
            // const avatarImg = append(iconContainer, $('img.avatar')) as HTMLImageElement;
            const timestampContainer = (0, dom_1.$0O)(iconLabel.element, (0, dom_1.$)('.timestamp-container'));
            const timestamp = (0, dom_1.$0O)(timestampContainer, (0, dom_1.$)('span.timestamp'));
            return { iconContainer, iconLabel, timestampContainer, timestamp, disposables: new lifecycle_1.$jc() };
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
        constructor(a) {
            this.a = a;
        }
        renderTemplate(container) {
            const element = (0, dom_1.$0O)(container, (0, dom_1.$)('.change'));
            const name = (0, dom_1.$0O)(element, (0, dom_1.$)('.name'));
            const fileLabel = this.a.create(name, { supportDescriptionHighlights: true, supportHighlights: true });
            const decorationIcon = (0, dom_1.$0O)(element, (0, dom_1.$)('.decoration-icon'));
            return { element, name, fileLabel, decorationIcon, disposables: new lifecycle_1.$jc() };
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
            return (0, nls_1.localize)(0, null);
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
            if ((0, util_1.$zPb)(element)) {
                if (!(0, util_1.$zPb)(otherElement)) {
                    throw new Error('Invalid comparison');
                }
                return 0;
            }
            // Action button
            if ((0, util_1.$BPb)(element)) {
                return -1;
            }
            else if ((0, util_1.$BPb)(otherElement)) {
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
            return (0, comparers_1.$hq)(elementPath, otherElementPath);
        }
    }
    let $1Pb = class $1Pb extends viewPane_1.$Ieb {
        get viewModel() { return this.c; }
        constructor(options, g, keybindingService, contextMenuService, instantiationService, viewDescriptorService, contextKeyService, configurationService, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.g = g;
            this.f = new lifecycle_1.$jc();
        }
        U(container) {
            super.U(container);
            const treeContainer = (0, dom_1.$0O)(container, (0, dom_1.$)('.scm-view.scm-sync-view.file-icon-themable-tree'));
            this.a = this.Bb.createInstance(labels_1.$Llb, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this.B(this.a);
            this.b = this.Bb.createInstance(listService_1.$w4, 'SCM Sync View', treeContainer, new ListDelegate(), [
                this.Bb.createInstance(scmRepositoryRenderer_1.$JPb, (0, util_1.$IPb)(this.Bb)),
                this.Bb.createInstance(scmViewPane_1.$PPb),
                this.Bb.createInstance(HistoryItemGroupRenderer),
                this.Bb.createInstance(HistoryItemRenderer),
                this.Bb.createInstance(HistoryItemChangeRenderer, this.a),
            ], this.Bb.createInstance(SCMSyncDataSource), {
                horizontalScrolling: false,
                accessibilityProvider: new SCMSyncViewPaneAccessibilityProvider(),
                identityProvider: new SCMSyncViewPaneTreeIdentityProvider(),
                sorter: new SCMSyncViewPaneTreeSorter(),
            });
            this.B(this.b);
            this.B(this.b.onDidOpen(this.m, this));
            this.c = this.Bb.createInstance(SCMSyncPaneViewModel, this.b);
        }
        W(height, width) {
            super.W(height, width);
            this.b.layout(height, width);
        }
        async m(e) {
            if (!e.element) {
                return;
            }
            else if (isSCMHistoryItemChangeTreeElement(e.element)) {
                if (e.element.originalUri && e.element.modifiedUri) {
                    await this.g.executeCommand(editorCommands_1.$Xub, ...toDiffEditorArguments(e.element.uri, e.element.originalUri, e.element.modifiedUri));
                }
            }
        }
        dispose() {
            this.f.dispose();
            super.dispose();
        }
    };
    exports.$1Pb = $1Pb;
    exports.$1Pb = $1Pb = __decorate([
        __param(1, commands_1.$Fr),
        __param(2, keybinding_1.$2D),
        __param(3, contextView_1.$WZ),
        __param(4, instantiation_1.$Ah),
        __param(5, views_1.$_E),
        __param(6, contextkey_1.$3i),
        __param(7, configuration_1.$8h),
        __param(8, opener_1.$NT),
        __param(9, themeService_1.$gv),
        __param(10, telemetry_1.$9k)
    ], $1Pb);
    let SCMSyncPaneViewModel = class SCMSyncPaneViewModel {
        constructor(f, scmViewService, g) {
            this.f = f;
            this.g = g;
            this.a = new Map();
            this.b = new Map();
            this.c = false;
            this.d = new lifecycle_1.$jc();
            g.onDidChangeConfiguration(this.h, this, this.d);
            this.h();
            scmViewService.onDidChangeVisibleRepositories(this.i, this, this.d);
            this.i({ added: scmViewService.visibleRepositories, removed: [] });
        }
        h(e) {
            if (!e || e.affectsConfiguration('scm.alwaysShowRepositories')) {
                this.c = this.g.getValue('scm.alwaysShowRepositories');
                this.k();
            }
        }
        i({ added, removed }) {
            for (const repository of added) {
                const repositoryDisposable = repository.provider.onDidChangeHistoryProvider(() => this.j(repository));
                this.j(repository);
                this.a.set(repository, { dispose() { repositoryDisposable.dispose(); } });
            }
            for (const repository of removed) {
                this.a.get(repository)?.dispose();
                this.a.delete(repository);
            }
            this.k();
        }
        j(repository) {
            if (repository.provider.historyProvider) {
                const historyProviderDisposable = (0, lifecycle_1.$hc)(repository.provider.historyProvider.onDidChangeActionButton(() => this.k(repository)), repository.provider.historyProvider.onDidChangeCurrentHistoryItemGroup(() => this.k(repository)));
                this.b.set(repository, historyProviderDisposable);
            }
            else {
                this.b.get(repository)?.dispose();
                this.b.delete(repository);
            }
        }
        async k(repository) {
            if (this.a.size === 0) {
                return;
            }
            if (repository) {
                // Particular repository
                await this.f.updateChildren(repository);
            }
            else if (this.a.size === 1 && !this.c) {
                // Single repository and not always show repositories
                await this.f.setInput(iterator_1.Iterable.first(this.a.keys()));
            }
            else {
                // Expand repository nodes
                const expanded = Array.from(this.a.keys())
                    .map(repository => `repo:${repository.provider.id}`);
                // Multiple repositories or always show repositories
                await this.f.setInput([...this.a.keys()], { expanded });
            }
        }
    };
    SCMSyncPaneViewModel = __decorate([
        __param(1, scm_1.$gI),
        __param(2, configuration_1.$8h)
    ], SCMSyncPaneViewModel);
    class SCMSyncDataSource {
        hasChildren(element) {
            if ((0, util_1.$yPb)(element)) {
                return true;
            }
            else if ((0, util_1.$zPb)(element)) {
                return true;
            }
            else if ((0, util_1.$BPb)(element)) {
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
            if ((0, util_1.$yPb)(element)) {
                children.push(...element);
            }
            else if ((0, util_1.$zPb)(element)) {
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
                        label: (0, nls_1.localize)(1, null),
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
                        label: (0, nls_1.localize)(2, null),
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
//# sourceMappingURL=scmSyncViewPane.js.map