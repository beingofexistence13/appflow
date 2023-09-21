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
define(["require", "exports", "vs/nls", "vs/base/common/performance", "vs/workbench/contrib/files/common/files", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/files/browser/views/explorerView", "vs/workbench/contrib/files/browser/views/emptyView", "vs/workbench/contrib/files/browser/views/openEditorsView", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extensions", "vs/platform/workspace/common/workspace", "vs/platform/telemetry/common/telemetry", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/themeService", "vs/workbench/common/views", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/base/common/keyCodes", "vs/platform/registry/common/platform", "vs/platform/progress/common/progress", "vs/platform/instantiation/common/descriptors", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkeys", "vs/workbench/browser/actions/workspaceActions", "vs/workbench/browser/actions/windowActions", "vs/base/common/platform", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/css!./media/explorerviewlet"], function (require, exports, nls_1, performance_1, files_1, configuration_1, explorerView_1, emptyView_1, openEditorsView_1, storage_1, instantiation_1, extensions_1, workspace_1, telemetry_1, contextkey_1, themeService_1, views_1, contextView_1, lifecycle_1, layoutService_1, viewPaneContainer_1, keyCodes_1, platform_1, progress_1, descriptors_1, contextkeys_1, contextkeys_2, workspaceActions_1, windowActions_1, platform_2, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VIEW_CONTAINER = exports.ExplorerViewPaneContainer = exports.ExplorerViewletViewsContribution = void 0;
    const explorerViewIcon = (0, iconRegistry_1.registerIcon)('explorer-view-icon', codicons_1.Codicon.files, (0, nls_1.localize)('explorerViewIcon', 'View icon of the explorer view.'));
    const openEditorsViewIcon = (0, iconRegistry_1.registerIcon)('open-editors-view-icon', codicons_1.Codicon.book, (0, nls_1.localize)('openEditorsIcon', 'View icon of the open editors view.'));
    let ExplorerViewletViewsContribution = class ExplorerViewletViewsContribution extends lifecycle_1.Disposable {
        constructor(workspaceContextService, progressService) {
            super();
            this.workspaceContextService = workspaceContextService;
            progressService.withProgress({ location: 1 /* ProgressLocation.Explorer */ }, () => workspaceContextService.getCompleteWorkspace()).finally(() => {
                this.registerViews();
                this._register(workspaceContextService.onDidChangeWorkbenchState(() => this.registerViews()));
                this._register(workspaceContextService.onDidChangeWorkspaceFolders(() => this.registerViews()));
            });
        }
        registerViews() {
            (0, performance_1.mark)('code/willRegisterExplorerViews');
            const viewDescriptors = viewsRegistry.getViews(exports.VIEW_CONTAINER);
            const viewDescriptorsToRegister = [];
            const viewDescriptorsToDeregister = [];
            const openEditorsViewDescriptor = this.createOpenEditorsViewDescriptor();
            if (!viewDescriptors.some(v => v.id === openEditorsViewDescriptor.id)) {
                viewDescriptorsToRegister.push(openEditorsViewDescriptor);
            }
            const explorerViewDescriptor = this.createExplorerViewDescriptor();
            const registeredExplorerViewDescriptor = viewDescriptors.find(v => v.id === explorerViewDescriptor.id);
            const emptyViewDescriptor = this.createEmptyViewDescriptor();
            const registeredEmptyViewDescriptor = viewDescriptors.find(v => v.id === emptyViewDescriptor.id);
            if (this.workspaceContextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ || this.workspaceContextService.getWorkspace().folders.length === 0) {
                if (registeredExplorerViewDescriptor) {
                    viewDescriptorsToDeregister.push(registeredExplorerViewDescriptor);
                }
                if (!registeredEmptyViewDescriptor) {
                    viewDescriptorsToRegister.push(emptyViewDescriptor);
                }
            }
            else {
                if (registeredEmptyViewDescriptor) {
                    viewDescriptorsToDeregister.push(registeredEmptyViewDescriptor);
                }
                if (!registeredExplorerViewDescriptor) {
                    viewDescriptorsToRegister.push(explorerViewDescriptor);
                }
            }
            if (viewDescriptorsToRegister.length) {
                viewsRegistry.registerViews(viewDescriptorsToRegister, exports.VIEW_CONTAINER);
            }
            if (viewDescriptorsToDeregister.length) {
                viewsRegistry.deregisterViews(viewDescriptorsToDeregister, exports.VIEW_CONTAINER);
            }
            (0, performance_1.mark)('code/didRegisterExplorerViews');
        }
        createOpenEditorsViewDescriptor() {
            return {
                id: openEditorsView_1.OpenEditorsView.ID,
                name: openEditorsView_1.OpenEditorsView.NAME,
                ctorDescriptor: new descriptors_1.SyncDescriptor(openEditorsView_1.OpenEditorsView),
                containerIcon: openEditorsViewIcon,
                order: 0,
                canToggleVisibility: true,
                canMoveView: true,
                collapsed: false,
                hideByDefault: true,
                focusCommand: {
                    id: 'workbench.files.action.focusOpenEditorsView',
                    keybindings: { primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 35 /* KeyCode.KeyE */) }
                }
            };
        }
        createEmptyViewDescriptor() {
            return {
                id: emptyView_1.EmptyView.ID,
                name: emptyView_1.EmptyView.NAME,
                containerIcon: explorerViewIcon,
                ctorDescriptor: new descriptors_1.SyncDescriptor(emptyView_1.EmptyView),
                order: 1,
                canToggleVisibility: true,
                focusCommand: {
                    id: 'workbench.explorer.fileView.focus'
                }
            };
        }
        createExplorerViewDescriptor() {
            return {
                id: files_1.VIEW_ID,
                name: (0, nls_1.localize)('folders', "Folders"),
                containerIcon: explorerViewIcon,
                ctorDescriptor: new descriptors_1.SyncDescriptor(explorerView_1.ExplorerView),
                order: 1,
                canMoveView: true,
                canToggleVisibility: false,
                focusCommand: {
                    id: 'workbench.explorer.fileView.focus'
                }
            };
        }
    };
    exports.ExplorerViewletViewsContribution = ExplorerViewletViewsContribution;
    exports.ExplorerViewletViewsContribution = ExplorerViewletViewsContribution = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, progress_1.IProgressService)
    ], ExplorerViewletViewsContribution);
    let ExplorerViewPaneContainer = class ExplorerViewPaneContainer extends viewPaneContainer_1.ViewPaneContainer {
        constructor(layoutService, telemetryService, contextService, storageService, configurationService, instantiationService, contextKeyService, themeService, contextMenuService, extensionService, viewDescriptorService) {
            super(files_1.VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService);
            this.viewletVisibleContextKey = files_1.ExplorerViewletVisibleContext.bindTo(contextKeyService);
            this._register(this.contextService.onDidChangeWorkspaceName(e => this.updateTitleArea()));
        }
        create(parent) {
            super.create(parent);
            parent.classList.add('explorer-viewlet');
        }
        createView(viewDescriptor, options) {
            if (viewDescriptor.id === files_1.VIEW_ID) {
                return this.instantiationService.createInstance(explorerView_1.ExplorerView, {
                    ...options, delegate: {
                        willOpenElement: e => {
                            if (!(e instanceof MouseEvent)) {
                                return; // only delay when user clicks
                            }
                            const openEditorsView = this.getOpenEditorsView();
                            if (openEditorsView) {
                                let delay = 0;
                                const config = this.configurationService.getValue();
                                if (!!config.workbench?.editor?.enablePreview) {
                                    // delay open editors view when preview is enabled
                                    // to accomodate for the user doing a double click
                                    // to pin the editor.
                                    // without this delay a double click would be not
                                    // possible because the next element would move
                                    // under the mouse after the first click.
                                    delay = 250;
                                }
                                openEditorsView.setStructuralRefreshDelay(delay);
                            }
                        },
                        didOpenElement: e => {
                            if (!(e instanceof MouseEvent)) {
                                return; // only delay when user clicks
                            }
                            const openEditorsView = this.getOpenEditorsView();
                            openEditorsView?.setStructuralRefreshDelay(0);
                        }
                    }
                });
            }
            return super.createView(viewDescriptor, options);
        }
        getExplorerView() {
            return this.getView(files_1.VIEW_ID);
        }
        getOpenEditorsView() {
            return this.getView(openEditorsView_1.OpenEditorsView.ID);
        }
        setVisible(visible) {
            this.viewletVisibleContextKey.set(visible);
            super.setVisible(visible);
        }
        focus() {
            const explorerView = this.getView(files_1.VIEW_ID);
            if (explorerView && this.panes.every(p => !p.isExpanded())) {
                explorerView.setExpanded(true);
            }
            if (explorerView?.isExpanded()) {
                explorerView.focus();
            }
            else {
                super.focus();
            }
        }
    };
    exports.ExplorerViewPaneContainer = ExplorerViewPaneContainer;
    exports.ExplorerViewPaneContainer = ExplorerViewPaneContainer = __decorate([
        __param(0, layoutService_1.IWorkbenchLayoutService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, storage_1.IStorageService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, themeService_1.IThemeService),
        __param(8, contextView_1.IContextMenuService),
        __param(9, extensions_1.IExtensionService),
        __param(10, views_1.IViewDescriptorService)
    ], ExplorerViewPaneContainer);
    const viewContainerRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
    /**
     * Explorer viewlet container.
     */
    exports.VIEW_CONTAINER = viewContainerRegistry.registerViewContainer({
        id: files_1.VIEWLET_ID,
        title: { value: (0, nls_1.localize)('explore', "Explorer"), original: 'Explorer' },
        ctorDescriptor: new descriptors_1.SyncDescriptor(ExplorerViewPaneContainer),
        storageId: 'workbench.explorer.views.state',
        icon: explorerViewIcon,
        alwaysUseContainerInfo: true,
        hideIfEmpty: true,
        order: 0,
        openCommandActionDescriptor: {
            id: files_1.VIEWLET_ID,
            title: { value: (0, nls_1.localize)('explore', "Explorer"), original: 'Explorer' },
            mnemonicTitle: (0, nls_1.localize)({ key: 'miViewExplorer', comment: ['&& denotes a mnemonic'] }, "&&Explorer"),
            keybindings: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 35 /* KeyCode.KeyE */ },
            order: 0
        },
    }, 0 /* ViewContainerLocation.Sidebar */, { isDefault: true });
    const openFolder = (0, nls_1.localize)('openFolder', "Open Folder");
    const addAFolder = (0, nls_1.localize)('addAFolder', "add a folder");
    const openRecent = (0, nls_1.localize)('openRecent', "Open Recent");
    const addRootFolderButton = `[${openFolder}](command:${workspaceActions_1.AddRootFolderAction.ID})`;
    const addAFolderButton = `[${addAFolder}](command:${workspaceActions_1.AddRootFolderAction.ID})`;
    const openFolderButton = `[${openFolder}](command:${(platform_2.isMacintosh && !platform_2.isWeb) ? workspaceActions_1.OpenFileFolderAction.ID : workspaceActions_1.OpenFolderAction.ID})`;
    const openFolderViaWorkspaceButton = `[${openFolder}](command:${workspaceActions_1.OpenFolderViaWorkspaceAction.ID})`;
    const openRecentButton = `[${openRecent}](command:${windowActions_1.OpenRecentAction.ID})`;
    const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
    viewsRegistry.registerViewWelcomeContent(emptyView_1.EmptyView.ID, {
        content: (0, nls_1.localize)({ key: 'noWorkspaceHelp', comment: ['Please do not translate the word "commmand", it is part of our internal syntax which must not change'] }, "You have not yet added a folder to the workspace.\n{0}", addRootFolderButton),
        when: contextkey_1.ContextKeyExpr.and(
        // inside a .code-workspace
        contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'), 
        // unless we cannot enter or open workspaces (e.g. web serverless)
        contextkeys_1.OpenFolderWorkspaceSupportContext),
        group: views_1.ViewContentGroups.Open,
        order: 1
    });
    viewsRegistry.registerViewWelcomeContent(emptyView_1.EmptyView.ID, {
        content: (0, nls_1.localize)({ key: 'noFolderHelpWeb', comment: ['Please do not translate the word "commmand", it is part of our internal syntax which must not change'] }, "You have not yet opened a folder.\n{0}\n{1}", openFolderViaWorkspaceButton, openRecentButton),
        when: contextkey_1.ContextKeyExpr.and(
        // inside a .code-workspace
        contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'), 
        // we cannot enter workspaces (e.g. web serverless)
        contextkeys_1.OpenFolderWorkspaceSupportContext.toNegated()),
        group: views_1.ViewContentGroups.Open,
        order: 1
    });
    viewsRegistry.registerViewWelcomeContent(emptyView_1.EmptyView.ID, {
        content: (0, nls_1.localize)({ key: 'remoteNoFolderHelp', comment: ['Please do not translate the word "commmand", it is part of our internal syntax which must not change'] }, "Connected to remote.\n{0}", openFolderButton),
        when: contextkey_1.ContextKeyExpr.and(
        // not inside a .code-workspace
        contextkeys_1.WorkbenchStateContext.notEqualsTo('workspace'), 
        // connected to a remote
        contextkeys_1.RemoteNameContext.notEqualsTo(''), 
        // but not in web
        contextkeys_2.IsWebContext.toNegated()),
        group: views_1.ViewContentGroups.Open,
        order: 1
    });
    viewsRegistry.registerViewWelcomeContent(emptyView_1.EmptyView.ID, {
        content: (0, nls_1.localize)({ key: 'noFolderButEditorsHelp', comment: ['Please do not translate the word "commmand", it is part of our internal syntax which must not change'] }, "You have not yet opened a folder.\n{0}\nOpening a folder will close all currently open editors. To keep them open, {1} instead.", openFolderButton, addAFolderButton),
        when: contextkey_1.ContextKeyExpr.and(
        // editors are opened
        contextkey_1.ContextKeyExpr.has('editorIsOpen'), contextkey_1.ContextKeyExpr.or(
        // not inside a .code-workspace and local
        contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('workspace'), contextkeys_1.RemoteNameContext.isEqualTo('')), 
        // not inside a .code-workspace and web
        contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('workspace'), contextkeys_2.IsWebContext))),
        group: views_1.ViewContentGroups.Open,
        order: 1
    });
    viewsRegistry.registerViewWelcomeContent(emptyView_1.EmptyView.ID, {
        content: (0, nls_1.localize)({ key: 'noFolderHelp', comment: ['Please do not translate the word "commmand", it is part of our internal syntax which must not change'] }, "You have not yet opened a folder.\n{0}", openFolderButton),
        when: contextkey_1.ContextKeyExpr.and(
        // no editor is open
        contextkey_1.ContextKeyExpr.has('editorIsOpen')?.negate(), contextkey_1.ContextKeyExpr.or(
        // not inside a .code-workspace and local
        contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('workspace'), contextkeys_1.RemoteNameContext.isEqualTo('')), 
        // not inside a .code-workspace and web
        contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('workspace'), contextkeys_2.IsWebContext))),
        group: views_1.ViewContentGroups.Open,
        order: 1
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwbG9yZXJWaWV3bGV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvYnJvd3Nlci9leHBsb3JlclZpZXdsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUNoRyxNQUFNLGdCQUFnQixHQUFHLElBQUEsMkJBQVksRUFBQyxvQkFBb0IsRUFBRSxrQkFBTyxDQUFDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDLENBQUM7SUFDNUksTUFBTSxtQkFBbUIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsd0JBQXdCLEVBQUUsa0JBQU8sQ0FBQyxJQUFJLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUscUNBQXFDLENBQUMsQ0FBQyxDQUFDO0lBRTlJLElBQU0sZ0NBQWdDLEdBQXRDLE1BQU0sZ0NBQWlDLFNBQVEsc0JBQVU7UUFFL0QsWUFDNEMsdUJBQWlELEVBQzFFLGVBQWlDO1lBRW5ELEtBQUssRUFBRSxDQUFDO1lBSG1DLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFLNUYsZUFBZSxDQUFDLFlBQVksQ0FBQyxFQUFFLFFBQVEsbUNBQTJCLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDeEksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUVyQixJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLHlCQUF5QixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzlGLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFLENBQUMs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