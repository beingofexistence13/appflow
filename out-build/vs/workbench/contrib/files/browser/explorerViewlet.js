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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/explorerViewlet", "vs/base/common/performance", "vs/workbench/contrib/files/common/files", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/files/browser/views/explorerView", "vs/workbench/contrib/files/browser/views/emptyView", "vs/workbench/contrib/files/browser/views/openEditorsView", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extensions", "vs/platform/workspace/common/workspace", "vs/platform/telemetry/common/telemetry", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/themeService", "vs/workbench/common/views", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/base/common/keyCodes", "vs/platform/registry/common/platform", "vs/platform/progress/common/progress", "vs/platform/instantiation/common/descriptors", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkeys", "vs/workbench/browser/actions/workspaceActions", "vs/workbench/browser/actions/windowActions", "vs/base/common/platform", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/css!./media/explorerviewlet"], function (require, exports, nls_1, performance_1, files_1, configuration_1, explorerView_1, emptyView_1, openEditorsView_1, storage_1, instantiation_1, extensions_1, workspace_1, telemetry_1, contextkey_1, themeService_1, views_1, contextView_1, lifecycle_1, layoutService_1, viewPaneContainer_1, keyCodes_1, platform_1, progress_1, descriptors_1, contextkeys_1, contextkeys_2, workspaceActions_1, windowActions_1, platform_2, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$TLb = exports.$SLb = exports.$RLb = void 0;
    const explorerViewIcon = (0, iconRegistry_1.$9u)('explorer-view-icon', codicons_1.$Pj.files, (0, nls_1.localize)(0, null));
    const openEditorsViewIcon = (0, iconRegistry_1.$9u)('open-editors-view-icon', codicons_1.$Pj.book, (0, nls_1.localize)(1, null));
    let $RLb = class $RLb extends lifecycle_1.$kc {
        constructor(a, progressService) {
            super();
            this.a = a;
            progressService.withProgress({ location: 1 /* ProgressLocation.Explorer */ }, () => a.getCompleteWorkspace()).finally(() => {
                this.b();
                this.B(a.onDidChangeWorkbenchState(() => this.b()));
                this.B(a.onDidChangeWorkspaceFolders(() => this.b()));
            });
        }
        b() {
            (0, performance_1.mark)('code/willRegisterExplorerViews');
            const viewDescriptors = viewsRegistry.getViews(exports.$TLb);
            const viewDescriptorsToRegister = [];
            const viewDescriptorsToDeregister = [];
            const openEditorsViewDescriptor = this.c();
            if (!viewDescriptors.some(v => v.id === openEditorsViewDescriptor.id)) {
                viewDescriptorsToRegister.push(openEditorsViewDescriptor);
            }
            const explorerViewDescriptor = this.g();
            const registeredExplorerViewDescriptor = viewDescriptors.find(v => v.id === explorerViewDescriptor.id);
            const emptyViewDescriptor = this.f();
            const registeredEmptyViewDescriptor = viewDescriptors.find(v => v.id === emptyViewDescriptor.id);
            if (this.a.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ || this.a.getWorkspace().folders.length === 0) {
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
                viewsRegistry.registerViews(viewDescriptorsToRegister, exports.$TLb);
            }
            if (viewDescriptorsToDeregister.length) {
                viewsRegistry.deregisterViews(viewDescriptorsToDeregister, exports.$TLb);
            }
            (0, performance_1.mark)('code/didRegisterExplorerViews');
        }
        c() {
            return {
                id: openEditorsView_1.$QLb.ID,
                name: openEditorsView_1.$QLb.NAME,
                ctorDescriptor: new descriptors_1.$yh(openEditorsView_1.$QLb),
                containerIcon: openEditorsViewIcon,
                order: 0,
                canToggleVisibility: true,
                canMoveView: true,
                collapsed: false,
                hideByDefault: true,
                focusCommand: {
                    id: 'workbench.files.action.focusOpenEditorsView',
                    keybindings: { primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 35 /* KeyCode.KeyE */) }
                }
            };
        }
        f() {
            return {
                id: emptyView_1.$PLb.ID,
                name: emptyView_1.$PLb.NAME,
                containerIcon: explorerViewIcon,
                ctorDescriptor: new descriptors_1.$yh(emptyView_1.$PLb),
                order: 1,
                canToggleVisibility: true,
                focusCommand: {
                    id: 'workbench.explorer.fileView.focus'
                }
            };
        }
        g() {
            return {
                id: files_1.$Ndb,
                name: (0, nls_1.localize)(2, null),
                containerIcon: explorerViewIcon,
                ctorDescriptor: new descriptors_1.$yh(explorerView_1.$sIb),
                order: 1,
                canMoveView: true,
                canToggleVisibility: false,
                focusCommand: {
                    id: 'workbench.explorer.fileView.focus'
                }
            };
        }
    };
    exports.$RLb = $RLb;
    exports.$RLb = $RLb = __decorate([
        __param(0, workspace_1.$Kh),
        __param(1, progress_1.$2u)
    ], $RLb);
    let $SLb = class $SLb extends viewPaneContainer_1.$Seb {
        constructor(layoutService, telemetryService, contextService, storageService, configurationService, instantiationService, contextKeyService, themeService, contextMenuService, extensionService, viewDescriptorService) {
            super(files_1.$Mdb, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService);
            this.r = files_1.$Odb.bindTo(contextKeyService);
            this.B(this.gb.onDidChangeWorkspaceName(e => this.kb()));
        }
        create(parent) {
            super.create(parent);
            parent.classList.add('explorer-viewlet');
        }
        lb(viewDescriptor, options) {
            if (viewDescriptor.id === files_1.$Ndb) {
                return this.Z.createInstance(explorerView_1.$sIb, {
                    ...options, delegate: {
                        willOpenElement: e => {
                            if (!(e instanceof MouseEvent)) {
                                return; // only delay when user clicks
                            }
                            const openEditorsView = this.getOpenEditorsView();
                            if (openEditorsView) {
                                let delay = 0;
                                const config = this.ab.getValue();
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
            return super.lb(viewDescriptor, options);
        }
        getExplorerView() {
            return this.getView(files_1.$Ndb);
        }
        getOpenEditorsView() {
            return this.getView(openEditorsView_1.$QLb.ID);
        }
        setVisible(visible) {
            this.r.set(visible);
            super.setVisible(visible);
        }
        focus() {
            const explorerView = this.getView(files_1.$Ndb);
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
    exports.$SLb = $SLb;
    exports.$SLb = $SLb = __decorate([
        __param(0, layoutService_1.$Meb),
        __param(1, telemetry_1.$9k),
        __param(2, workspace_1.$Kh),
        __param(3, storage_1.$Vo),
        __param(4, configuration_1.$8h),
        __param(5, instantiation_1.$Ah),
        __param(6, contextkey_1.$3i),
        __param(7, themeService_1.$gv),
        __param(8, contextView_1.$WZ),
        __param(9, extensions_1.$MF),
        __param(10, views_1.$_E)
    ], $SLb);
    const viewContainerRegistry = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry);
    /**
     * Explorer viewlet container.
     */
    exports.$TLb = viewContainerRegistry.registerViewContainer({
        id: files_1.$Mdb,
        title: { value: (0, nls_1.localize)(3, null), original: 'Explorer' },
        ctorDescriptor: new descriptors_1.$yh($SLb),
        storageId: 'workbench.explorer.views.state',
        icon: explorerViewIcon,
        alwaysUseContainerInfo: true,
        hideIfEmpty: true,
        order: 0,
        openCommandActionDescriptor: {
            id: files_1.$Mdb,
            title: { value: (0, nls_1.localize)(4, null), original: 'Explorer' },
            mnemonicTitle: (0, nls_1.localize)(5, null),
            keybindings: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 35 /* KeyCode.KeyE */ },
            order: 0
        },
    }, 0 /* ViewContainerLocation.Sidebar */, { isDefault: true });
    const openFolder = (0, nls_1.localize)(6, null);
    const addAFolder = (0, nls_1.localize)(7, null);
    const openRecent = (0, nls_1.localize)(8, null);
    const addRootFolderButton = `[${openFolder}](command:${workspaceActions_1.$7tb.ID})`;
    const addAFolderButton = `[${addAFolder}](command:${workspaceActions_1.$7tb.ID})`;
    const openFolderButton = `[${openFolder}](command:${(platform_2.$j && !platform_2.$o) ? workspaceActions_1.$6tb.ID : workspaceActions_1.$4tb.ID})`;
    const openFolderViaWorkspaceButton = `[${openFolder}](command:${workspaceActions_1.$5tb.ID})`;
    const openRecentButton = `[${openRecent}](command:${windowActions_1.$1tb.ID})`;
    const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
    viewsRegistry.registerViewWelcomeContent(emptyView_1.$PLb.ID, {
        content: (0, nls_1.localize)(9, null, addRootFolderButton),
        when: contextkey_1.$Ii.and(
        // inside a .code-workspace
        contextkeys_1.$Pcb.isEqualTo('workspace'), 
        // unless we cannot enter or open workspaces (e.g. web serverless)
        contextkeys_1.$Rcb),
        group: views_1.ViewContentGroups.Open,
        order: 1
    });
    viewsRegistry.registerViewWelcomeContent(emptyView_1.$PLb.ID, {
        content: (0, nls_1.localize)(10, null, openFolderViaWorkspaceButton, openRecentButton),
        when: contextkey_1.$Ii.and(
        // inside a .code-workspace
        contextkeys_1.$Pcb.isEqualTo('workspace'), 
        // we cannot enter workspaces (e.g. web serverless)
        contextkeys_1.$Rcb.toNegated()),
        group: views_1.ViewContentGroups.Open,
        order: 1
    });
    viewsRegistry.registerViewWelcomeContent(emptyView_1.$PLb.ID, {
        content: (0, nls_1.localize)(11, null, openFolderButton),
        when: contextkey_1.$Ii.and(
        // not inside a .code-workspace
        contextkeys_1.$Pcb.notEqualsTo('workspace'), 
        // connected to a remote
        contextkeys_1.$Vcb.notEqualsTo(''), 
        // but not in web
        contextkeys_2.$23.toNegated()),
        group: views_1.ViewContentGroups.Open,
        order: 1
    });
    viewsRegistry.registerViewWelcomeContent(emptyView_1.$PLb.ID, {
        content: (0, nls_1.localize)(12, null, openFolderButton, addAFolderButton),
        when: contextkey_1.$Ii.and(
        // editors are opened
        contextkey_1.$Ii.has('editorIsOpen'), contextkey_1.$Ii.or(
        // not inside a .code-workspace and local
        contextkey_1.$Ii.and(contextkeys_1.$Pcb.notEqualsTo('workspace'), contextkeys_1.$Vcb.isEqualTo('')), 
        // not inside a .code-workspace and web
        contextkey_1.$Ii.and(contextkeys_1.$Pcb.notEqualsTo('workspace'), contextkeys_2.$23))),
        group: views_1.ViewContentGroups.Open,
        order: 1
    });
    viewsRegistry.registerViewWelcomeContent(emptyView_1.$PLb.ID, {
        content: (0, nls_1.localize)(13, null, openFolderButton),
        when: contextkey_1.$Ii.and(
        // no editor is open
        contextkey_1.$Ii.has('editorIsOpen')?.negate(), contextkey_1.$Ii.or(
        // not inside a .code-workspace and local
        contextkey_1.$Ii.and(contextkeys_1.$Pcb.notEqualsTo('workspace'), contextkeys_1.$Vcb.isEqualTo('')), 
        // not inside a .code-workspace and web
        contextkey_1.$Ii.and(contextkeys_1.$Pcb.notEqualsTo('workspace'), contextkeys_2.$23))),
        group: views_1.ViewContentGroups.Open,
        order: 1
    });
});
//# sourceMappingURL=explorerViewlet.js.map