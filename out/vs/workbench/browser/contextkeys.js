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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/workbench/common/contextkeys", "vs/workbench/common/editor", "vs/base/browser/dom", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/configuration/common/configuration", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/editor/common/editorService", "vs/platform/workspace/common/workspace", "vs/workbench/services/layout/browser/layoutService", "vs/platform/remote/common/remoteHosts", "vs/platform/workspace/common/virtualWorkspace", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/platform", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/files/browser/webFileSystemAccess", "vs/platform/product/common/productService", "vs/platform/files/common/files"], function (require, exports, event_1, lifecycle_1, contextkey_1, contextkeys_1, contextkeys_2, editor_1, dom_1, editorGroupsService_1, configuration_1, environmentService_1, editorService_1, workspace_1, layoutService_1, remoteHosts_1, virtualWorkspace_1, workingCopyService_1, platform_1, editorResolverService_1, panecomposite_1, webFileSystemAccess_1, productService_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchContextKeysHandler = void 0;
    let WorkbenchContextKeysHandler = class WorkbenchContextKeysHandler extends lifecycle_1.Disposable {
        constructor(contextKeyService, contextService, configurationService, environmentService, productService, editorService, editorResolverService, editorGroupService, layoutService, paneCompositeService, workingCopyService, fileService) {
            super();
            this.contextKeyService = contextKeyService;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            this.productService = productService;
            this.editorService = editorService;
            this.editorResolverService = editorResolverService;
            this.editorGroupService = editorGroupService;
            this.layoutService = layoutService;
            this.paneCompositeService = paneCompositeService;
            this.workingCopyService = workingCopyService;
            this.fileService = fileService;
            // Platform
            contextkeys_1.IsMacContext.bindTo(this.contextKeyService);
            contextkeys_1.IsLinuxContext.bindTo(this.contextKeyService);
            contextkeys_1.IsWindowsContext.bindTo(this.contextKeyService);
            contextkeys_1.IsWebContext.bindTo(this.contextKeyService);
            contextkeys_1.IsMacNativeContext.bindTo(this.contextKeyService);
            contextkeys_1.IsIOSContext.bindTo(this.contextKeyService);
            contextkeys_1.IsMobileContext.bindTo(this.contextKeyService);
            contextkeys_2.RemoteNameContext.bindTo(this.contextKeyService).set((0, remoteHosts_1.getRemoteName)(this.environmentService.remoteAuthority) || '');
            this.virtualWorkspaceContext = contextkeys_2.VirtualWorkspaceContext.bindTo(this.contextKeyService);
            this.temporaryWorkspaceContext = contextkeys_2.TemporaryWorkspaceContext.bindTo(this.contextKeyService);
            this.updateWorkspaceContextKeys();
            // Capabilities
            contextkeys_2.HasWebFileSystemAccess.bindTo(this.contextKeyService).set(webFileSystemAccess_1.WebFileSystemAccess.supported(window));
            // Development
            const isDevelopment = !this.environmentService.isBuilt || this.environmentService.isExtensionDevelopment;
            contextkeys_1.IsDevelopmentContext.bindTo(this.contextKeyService).set(isDevelopment);
            (0, contextkey_1.setConstant)(contextkeys_1.IsDevelopmentContext.key, isDevelopment);
            // Product Service
            contextkeys_1.ProductQualityContext.bindTo(this.contextKeyService).set(this.productService.quality || '');
            contextkeys_2.EmbedderIdentifierContext.bindTo(this.contextKeyService).set(productService.embedderIdentifier);
            // Editors
            this.activeEditorContext = contextkeys_2.ActiveEditorContext.bindTo(this.contextKeyService);
            this.activeEditorIsReadonly = contextkeys_2.ActiveEditorReadonlyContext.bindTo(this.contextKeyService);
            this.activeEditorCanToggleReadonly = contextkeys_2.ActiveEditorCanToggleReadonlyContext.bindTo(this.contextKeyService);
            this.activeEditorCanRevert = contextkeys_2.ActiveEditorCanRevertContext.bindTo(this.contextKeyService);
            this.activeEditorCanSplitInGroup = contextkeys_2.ActiveEditorCanSplitInGroupContext.bindTo(this.contextKeyService);
            this.activeEditorAvailableEditorIds = contextkeys_2.ActiveEditorAvailableEditorIdsContext.bindTo(this.contextKeyService);
            this.editorsVisibleContext = contextkeys_2.EditorsVisibleContext.bindTo(this.contextKeyService);
            this.textCompareEditorVisibleContext = contextkeys_2.TextCompareEditorVisibleContext.bindTo(this.contextKeyService);
            this.textCompareEditorActiveContext = contextkeys_2.TextCompareEditorActiveContext.bindTo(this.contextKeyService);
            this.sideBySideEditorActiveContext = contextkeys_2.SideBySideEditorActiveContext.bindTo(this.contextKeyService);
            this.activeEditorGroupEmpty = contextkeys_2.ActiveEditorGroupEmptyContext.bindTo(this.contextKeyService);
            this.activeEditorGroupIndex = contextkeys_2.ActiveEditorGroupIndexContext.bindTo(this.contextKeyService);
            this.activeEditorGroupLast = contextkeys_2.ActiveEditorGroupLastContext.bindTo(this.contextKeyService);
            this.activeEditorGroupLocked = contextkeys_2.ActiveEditorGroupLockedContext.bindTo(this.contextKeyService);
            this.multipleEditorGroupsContext = contextkeys_2.MultipleEditorGroupsContext.bindTo(this.contextKeyService);
            // Working Copies
            this.dirtyWorkingCopiesContext = contextkeys_2.DirtyWorkingCopiesContext.bindTo(this.contextKeyService);
            this.dirtyWorkingCopiesContext.set(this.workingCopyService.hasDirty);
            // Inputs
            this.inputFocusedContext = contextkeys_1.InputFocusedContext.bindTo(this.contextKeyService);
            // Workbench State
            this.workbenchStateContext = contextkeys_2.WorkbenchStateContext.bindTo(this.contextKeyService);
            this.updateWorkbenchStateContextKey();
            // Workspace Folder Count
            this.workspaceFolderCountContext = contextkeys_2.WorkspaceFolderCountContext.bindTo(this.contextKeyService);
            this.updateWorkspaceFolderCountContextKey();
            // Opening folder support: support for opening a folder workspace
            // (e.g. "Open Folder...") is limited in web when not connected
            // to a remote.
            this.openFolderWorkspaceSupportContext = contextkeys_2.OpenFolderWorkspaceSupportContext.bindTo(this.contextKeyService);
            this.openFolderWorkspaceSupportContext.set(platform_1.isNative || typeof this.environmentService.remoteAuthority === 'string');
            // Empty workspace support: empty workspaces require built-in file system
            // providers to be available that allow to enter a workspace or open loose
            // files. This condition is met:
            // - desktop: always
            // -     web: only when connected to a remote
            this.emptyWorkspaceSupportContext = contextkeys_2.EmptyWorkspaceSupportContext.bindTo(this.contextKeyService);
            this.emptyWorkspaceSupportContext.set(platform_1.isNative || typeof this.environmentService.remoteAuthority === 'string');
            // Entering a multi root workspace support: support for entering a multi-root
            // workspace (e.g. "Open Workspace from File...", "Duplicate Workspace", "Save Workspace")
            // is driven by the ability to resolve a workspace configuration file (*.code-workspace)
            // with a built-in file system provider.
            // This condition is met:
            // - desktop: always
            // -     web: only when connected to a remote
            this.enterMultiRootWorkspaceSupportContext = contextkeys_2.EnterMultiRootWorkspaceSupportContext.bindTo(this.contextKeyService);
            this.enterMultiRootWorkspaceSupportContext.set(platform_1.isNative || typeof this.environmentService.remoteAuthority === 'string');
            // Editor Layout
            this.splitEditorsVerticallyContext = contextkeys_2.SplitEditorsVertically.bindTo(this.contextKeyService);
            this.updateSplitEditorsVerticallyContext();
            // Fullscreen
            this.isFullscreenContext = contextkeys_2.IsFullscreenContext.bindTo(this.contextKeyService);
            // Zen Mode
            this.inZenModeContext = contextkeys_2.InEditorZenModeContext.bindTo(this.contextKeyService);
            // Centered Layout
            this.isCenteredLayoutContext = contextkeys_2.IsCenteredLayoutContext.bindTo(this.contextKeyService);
            // Editor Area
            this.editorAreaVisibleContext = contextkeys_2.EditorAreaVisibleContext.bindTo(this.contextKeyService);
            this.editorTabsVisibleContext = contextkeys_2.EditorTabsVisibleContext.bindTo(this.contextKeyService);
            // Sidebar
            this.sideBarVisibleContext = contextkeys_2.SideBarVisibleContext.bindTo(this.contextKeyService);
            // Panel
            this.panelPositionContext = contextkeys_2.PanelPositionContext.bindTo(this.contextKeyService);
            this.panelPositionContext.set((0, layoutService_1.positionToString)(this.layoutService.getPanelPosition()));
            this.panelVisibleContext = contextkeys_2.PanelVisibleContext.bindTo(this.contextKeyService);
            this.panelVisibleContext.set(this.layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */));
            this.panelMaximizedContext = contextkeys_2.PanelMaximizedContext.bindTo(this.contextKeyService);
            this.panelMaximizedContext.set(this.layoutService.isPanelMaximized());
            this.panelAlignmentContext = contextkeys_2.PanelAlignmentContext.bindTo(this.contextKeyService);
            this.panelAlignmentContext.set(this.layoutService.getPanelAlignment());
            // Auxiliary Bar
            this.auxiliaryBarVisibleContext = contextkeys_2.AuxiliaryBarVisibleContext.bindTo(this.contextKeyService);
            this.auxiliaryBarVisibleContext.set(this.layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */));
            this.registerListeners();
        }
        registerListeners() {
            this.editorGroupService.whenReady.then(() => {
                this.updateEditorAreaContextKeys();
                this.updateEditorContextKeys();
            });
            this._register(this.editorService.onDidActiveEditorChange(() => this.updateEditorContextKeys()));
            this._register(this.editorService.onDidVisibleEditorsChange(() => this.updateEditorContextKeys()));
            this._register(this.editorGroupService.onDidAddGroup(() => this.updateEditorContextKeys()));
            this._register(this.editorGroupService.onDidRemoveGroup(() => this.updateEditorContextKeys()));
            this._register(this.editorGroupService.onDidChangeGroupIndex(() => this.updateEditorContextKeys()));
            this._register(this.editorGroupService.onDidChangeActiveGroup(() => this.updateEditorGroupContextKeys()));
            this._register(this.editorGroupService.onDidChangeGroupLocked(() => this.updateEditorGroupContextKeys()));
            this._register(this.editorGroupService.onDidChangeEditorPartOptions(() => this.updateEditorAreaContextKeys()));
            this._register((0, dom_1.addDisposableListener)(window, dom_1.EventType.FOCUS_IN, () => this.updateInputContextKeys(), true));
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.updateWorkbenchStateContextKey()));
            this._register(this.contextService.onDidChangeWorkspaceFolders(() => {
                this.updateWorkspaceFolderCountContextKey();
                this.updateWorkspaceContextKeys();
            }));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('workbench.editor.openSideBySideDirection')) {
                    this.updateSplitEditorsVerticallyContext();
                }
            }));
            this._register(this.layoutService.onDidChangeZenMode(enabled => this.inZenModeContext.set(enabled)));
            this._register(this.layoutService.onDidChangeFullscreen(fullscreen => this.isFullscreenContext.set(fullscreen)));
            this._register(this.layoutService.onDidChangeCenteredLayout(centered => this.isCenteredLayoutContext.set(centered)));
            this._register(this.layoutService.onDidChangePanelPosition(position => this.panelPositionContext.set(position)));
            this._register(this.layoutService.onDidChangePanelAlignment(alignment => this.panelAlignmentContext.set(alignment)));
            this._register(this.paneCompositeService.onDidPaneCompositeClose(() => this.updateSideBarContextKeys()));
            this._register(this.paneCompositeService.onDidPaneCompositeOpen(() => this.updateSideBarContextKeys()));
            this._register(this.layoutService.onDidChangePartVisibility(() => {
                this.editorAreaVisibleContext.set(this.layoutService.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */));
                this.panelVisibleContext.set(this.layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */));
                this.panelMaximizedContext.set(this.layoutService.isPanelMaximized());
                this.auxiliaryBarVisibleContext.set(this.layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */));
            }));
            this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.dirtyWorkingCopiesContext.set(workingCopy.isDirty() || this.workingCopyService.hasDirty)));
        }
        updateEditorAreaContextKeys() {
            this.editorTabsVisibleContext.set(!!this.editorGroupService.partOptions.showTabs);
        }
        updateEditorContextKeys() {
            const activeEditorPane = this.editorService.activeEditorPane;
            const visibleEditorPanes = this.editorService.visibleEditorPanes;
            this.textCompareEditorActiveContext.set(activeEditorPane?.getId() === editor_1.TEXT_DIFF_EDITOR_ID);
            this.textCompareEditorVisibleContext.set(visibleEditorPanes.some(editorPane => editorPane.getId() === editor_1.TEXT_DIFF_EDITOR_ID));
            this.sideBySideEditorActiveContext.set(activeEditorPane?.getId() === editor_1.SIDE_BY_SIDE_EDITOR_ID);
            if (visibleEditorPanes.length > 0) {
                this.editorsVisibleContext.set(true);
            }
            else {
                this.editorsVisibleContext.reset();
            }
            if (!this.editorService.activeEditor) {
                this.activeEditorGroupEmpty.set(true);
            }
            else {
                this.activeEditorGroupEmpty.reset();
            }
            this.updateEditorGroupContextKeys();
            if (activeEditorPane) {
                this.activeEditorContext.set(activeEditorPane.getId());
                this.activeEditorCanRevert.set(!activeEditorPane.input.hasCapability(4 /* EditorInputCapabilities.Untitled */));
                this.activeEditorCanSplitInGroup.set(activeEditorPane.input.hasCapability(32 /* EditorInputCapabilities.CanSplitInGroup */));
                (0, contextkeys_2.applyAvailableEditorIds)(this.activeEditorAvailableEditorIds, activeEditorPane.input, this.editorResolverService);
                this.activeEditorIsReadonly.set(!!activeEditorPane.input.isReadonly());
                const primaryEditorResource = editor_1.EditorResourceAccessor.getOriginalUri(activeEditorPane.input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                this.activeEditorCanToggleReadonly.set(!!primaryEditorResource && this.fileService.hasProvider(primaryEditorResource) && !this.fileService.hasCapability(primaryEditorResource, 2048 /* FileSystemProviderCapabilities.Readonly */));
            }
            else {
                this.activeEditorContext.reset();
                this.activeEditorIsReadonly.reset();
                this.activeEditorCanToggleReadonly.reset();
                this.activeEditorCanRevert.reset();
                this.activeEditorCanSplitInGroup.reset();
                this.activeEditorAvailableEditorIds.reset();
            }
        }
        updateEditorGroupContextKeys() {
            const groupCount = this.editorGroupService.count;
            if (groupCount > 1) {
                this.multipleEditorGroupsContext.set(true);
            }
            else {
                this.multipleEditorGroupsContext.reset();
            }
            const activeGroup = this.editorGroupService.activeGroup;
            this.activeEditorGroupIndex.set(activeGroup.index + 1); // not zero-indexed
            this.activeEditorGroupLast.set(activeGroup.index === groupCount - 1);
            this.activeEditorGroupLocked.set(activeGroup.isLocked);
        }
        updateInputContextKeys() {
            function activeElementIsInput() {
                return !!document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA');
            }
            const isInputFocused = activeElementIsInput();
            this.inputFocusedContext.set(isInputFocused);
            if (isInputFocused) {
                const tracker = (0, dom_1.trackFocus)(document.activeElement);
                event_1.Event.once(tracker.onDidBlur)(() => {
                    this.inputFocusedContext.set(activeElementIsInput());
                    tracker.dispose();
                });
            }
        }
        updateWorkbenchStateContextKey() {
            this.workbenchStateContext.set(this.getWorkbenchStateString());
        }
        updateWorkspaceFolderCountContextKey() {
            this.workspaceFolderCountContext.set(this.contextService.getWorkspace().folders.length);
        }
        updateSplitEditorsVerticallyContext() {
            const direction = (0, editorGroupsService_1.preferredSideBySideGroupDirection)(this.configurationService);
            this.splitEditorsVerticallyContext.set(direction === 1 /* GroupDirection.DOWN */);
        }
        getWorkbenchStateString() {
            switch (this.contextService.getWorkbenchState()) {
                case 1 /* WorkbenchState.EMPTY */: return 'empty';
                case 2 /* WorkbenchState.FOLDER */: return 'folder';
                case 3 /* WorkbenchState.WORKSPACE */: return 'workspace';
            }
        }
        updateSideBarContextKeys() {
            this.sideBarVisibleContext.set(this.layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */));
        }
        updateWorkspaceContextKeys() {
            this.virtualWorkspaceContext.set((0, virtualWorkspace_1.getVirtualWorkspaceScheme)(this.contextService.getWorkspace()) || '');
            this.temporaryWorkspaceContext.set((0, workspace_1.isTemporaryWorkspace)(this.contextService.getWorkspace()));
        }
    };
    exports.WorkbenchContextKeysHandler = WorkbenchContextKeysHandler;
    exports.WorkbenchContextKeysHandler = WorkbenchContextKeysHandler = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, productService_1.IProductService),
        __param(5, editorService_1.IEditorService),
        __param(6, editorResolverService_1.IEditorResolverService),
        __param(7, editorGroupsService_1.IEditorGroupsService),
        __param(8, layoutService_1.IWorkbenchLayoutService),
        __param(9, panecomposite_1.IPaneCompositePartService),
        __param(10, workingCopyService_1.IWorkingCopyService),
        __param(11, files_1.IFileService)
    ], WorkbenchContextKeysHandler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dGtleXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9jb250ZXh0a2V5cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF5QnpGLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTRCLFNBQVEsc0JBQVU7UUFpRDFELFlBQ3NDLGlCQUFxQyxFQUMvQixjQUF3QyxFQUMzQyxvQkFBMkMsRUFDcEMsa0JBQWdELEVBQzdELGNBQStCLEVBQ2hDLGFBQTZCLEVBQ3JCLHFCQUE2QyxFQUMvQyxrQkFBd0MsRUFDckMsYUFBc0MsRUFDcEMsb0JBQStDLEVBQ3JELGtCQUF1QyxFQUM5QyxXQUF5QjtZQUV4RCxLQUFLLEVBQUUsQ0FBQztZQWI2QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQy9CLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUMzQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3BDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBOEI7WUFDN0QsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ2hDLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUNyQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQy9DLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBc0I7WUFDckMsa0JBQWEsR0FBYixhQUFhLENBQXlCO1lBQ3BDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBMkI7WUFDckQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUM5QyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUl4RCxXQUFXO1lBQ1gsMEJBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDNUMsNEJBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDOUMsOEJB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