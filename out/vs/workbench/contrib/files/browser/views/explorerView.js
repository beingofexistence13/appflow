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
define(["require", "exports", "vs/nls", "vs/base/common/performance", "vs/base/common/decorators", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/files/browser/fileActions", "vs/base/browser/dom", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/contrib/files/browser/views/explorerDecorationsProvider", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/platform/keybinding/common/keybinding", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/contextkeys", "vs/workbench/services/decorations/common/decorations", "vs/platform/list/browser/listService", "vs/base/browser/dnd", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/views/viewPane", "vs/platform/label/common/label", "vs/workbench/contrib/files/browser/views/explorerViewer", "vs/platform/theme/common/themeService", "vs/platform/actions/common/actions", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/files/common/explorerModel", "vs/workbench/browser/labels", "vs/platform/storage/common/storage", "vs/platform/clipboard/common/clipboardService", "vs/platform/files/common/files", "vs/base/common/event", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/editor", "vs/workbench/contrib/files/browser/files", "vs/base/common/codicons", "vs/platform/commands/common/commands", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/editor/common/editor", "vs/base/common/map", "vs/base/browser/ui/list/listWidget"], function (require, exports, nls, perf, decorators_1, files_1, fileActions_1, DOM, layoutService_1, explorerDecorationsProvider_1, workspace_1, configuration_1, keybinding_1, instantiation_1, progress_1, contextView_1, contextkey_1, contextkeys_1, decorations_1, listService_1, dnd_1, editorService_1, viewPane_1, label_1, explorerViewer_1, themeService_1, actions_1, telemetry_1, explorerModel_1, labels_1, storage_1, clipboardService_1, files_2, event_1, theme_1, views_1, opener_1, uriIdentity_1, editor_1, files_3, codicons_1, commands_1, editorResolverService_1, panecomposite_1, editor_2, map_1, listWidget_1) {
    "use strict";
    var ExplorerView_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createFileIconThemableTreeContainerScope = exports.ExplorerView = exports.getContext = void 0;
    function hasExpandedRootChild(tree, treeInput) {
        for (const folder of treeInput) {
            if (tree.hasNode(folder) && !tree.isCollapsed(folder)) {
                for (const [, child] of folder.children.entries()) {
                    if (tree.hasNode(child) && tree.isCollapsible(child) && !tree.isCollapsed(child)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    /**
     * Whether or not any of the nodes in the tree are expanded
     */
    function hasExpandedNode(tree, treeInput) {
        for (const folder of treeInput) {
            if (tree.hasNode(folder) && !tree.isCollapsed(folder)) {
                return true;
            }
        }
        return false;
    }
    const identityProvider = {
        getId: (stat) => {
            if (stat instanceof explorerModel_1.NewExplorerItem) {
                return `new:${stat.getId()}`;
            }
            return stat.getId();
        }
    };
    function getContext(focus, selection, respectMultiSelection, compressedNavigationControllerProvider) {
        let focusedStat;
        focusedStat = focus.length ? focus[0] : undefined;
        // If we are respecting multi-select and we have a multi-selection we ignore focus as we want to act on the selection
        if (respectMultiSelection && selection.length > 1) {
            focusedStat = undefined;
        }
        const compressedNavigationController = focusedStat && compressedNavigationControllerProvider.getCompressedNavigationController(focusedStat);
        focusedStat = compressedNavigationController ? compressedNavigationController.current : focusedStat;
        const selectedStats = [];
        for (const stat of selection) {
            const controller = compressedNavigationControllerProvider.getCompressedNavigationController(stat);
            if (controller && focusedStat && controller === compressedNavigationController) {
                if (stat === focusedStat) {
                    selectedStats.push(stat);
                }
                // Ignore stats which are selected but are part of the same compact node as the focused stat
                continue;
            }
            if (controller) {
                selectedStats.push(...controller.items);
            }
            else {
                selectedStats.push(stat);
            }
        }
        if (!focusedStat) {
            if (respectMultiSelection) {
                return selectedStats;
            }
            else {
                return [];
            }
        }
        if (respectMultiSelection && selectedStats.indexOf(focusedStat) >= 0) {
            return selectedStats;
        }
        return [focusedStat];
    }
    exports.getContext = getContext;
    let ExplorerView = class ExplorerView extends viewPane_1.ViewPane {
        static { ExplorerView_1 = this; }
        static { this.TREE_VIEW_STATE_STORAGE_KEY = 'workbench.explorer.treeViewState'; }
        constructor(options, contextMenuService, viewDescriptorService, instantiationService, contextService, progressService, editorService, editorResolverService, layoutService, keybindingService, contextKeyService, configurationService, decorationService, labelService, themeService, telemetryService, explorerService, storageService, clipboardService, fileService, uriIdentityService, commandService, openerService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.contextService = contextService;
            this.progressService = progressService;
            this.editorService = editorService;
            this.editorResolverService = editorResolverService;
            this.layoutService = layoutService;
            this.decorationService = decorationService;
            this.labelService = labelService;
            this.explorerService = explorerService;
            this.storageService = storageService;
            this.clipboardService = clipboardService;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this.commandService = commandService;
            this.autoReveal = false;
            this.delegate = options.delegate;
            this.resourceContext = instantiationService.createInstance(contextkeys_1.ResourceContextKey);
            this._register(this.resourceContext);
            this.folderContext = files_1.ExplorerFolderContext.bindTo(contextKeyService);
            this.readonlyContext = files_1.ExplorerResourceReadonlyContext.bindTo(contextKeyService);
            this.availableEditorIdsContext = files_1.ExplorerResourceAvailableEditorIdsContext.bindTo(contextKeyService);
            this.rootContext = files_1.ExplorerRootContext.bindTo(contextKeyService);
            this.resourceMoveableToTrash = files_1.ExplorerResourceMoveableToTrash.bindTo(contextKeyService);
            this.compressedFocusContext = files_1.ExplorerCompressedFocusContext.bindTo(contextKeyService);
            this.compressedFocusFirstContext = files_1.ExplorerCompressedFirstFocusContext.bindTo(contextKeyService);
            this.compressedFocusLastContext = files_1.ExplorerCompressedLastFocusContext.bindTo(contextKeyService);
            this.viewHasSomeCollapsibleRootItem = files_1.ViewHasSomeCollapsibleRootItemContext.bindTo(contextKeyService);
            this.viewVisibleContextKey = files_1.FoldersViewVisibleContext.bindTo(contextKeyService);
            this.explorerService.registerView(this);
        }
        get name() {
            return this.labelService.getWorkspaceLabel(this.contextService.getWorkspace());
        }
        get title() {
            return this.name;
        }
        set title(_) {
            // noop
        }
        setVisible(visible) {
            this.viewVisibleContextKey.set(visible);
            super.setVisible(visible);
        }
        get fileCopiedContextKey() {
            return fileActions_1.FileCopiedContext.bindTo(this.contextKeyService);
        }
        get resourceCutContextKey() {
            return files_1.ExplorerResourceCut.bindTo(this.contextKeyService);
        }
        // Split view methods
        renderHeader(container) {
            super.renderHeader(container);
            // Expand on drag over
            this.dragHandler = new dnd_1.DelayedDragHandler(container, () => this.setExpanded(true));
            const titleElement = container.querySelector('.title');
            const setHeader = () => {
                const workspace = this.contextService.getWorkspace();
                const title = workspace.folders.map(folder => folder.name).join();
                titleElement.textContent = this.name;
                titleElement.title = title;
                this.ariaHeaderLabel = nls.localize('explorerSection', "Explorer Section: {0}", this.name);
                titleElement.setAttribute('aria-label', this.ariaHeaderLabel);
            };
            this._register(this.contextService.onDidChangeWorkspaceName(setHeader));
            this._register(this.labelService.onDidChangeFormatters(setHeader));
            setHeader();
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.tree.layout(height, width);
        }
        renderBody(container) {
            super.renderBody(container);
            this.container = container;
            this.treeContainer = DOM.append(container, DOM.$('.explorer-folders-view'));
            this.createTree(this.treeContainer);
            this._register(this.labelService.onDidChangeFormatters(() => {
                this._onDidChangeTitleArea.fire();
            }));
            // Update configuration
            this.onConfigurationUpdated(undefined);
            // When the explorer viewer is loaded, listen to changes to the editor input
            this._register(this.editorService.onDidActiveEditorChange(() => {
                this.selectActiveFile();
            }));
            // Also handle configuration updates
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
            this._register(this.onDidChangeBodyVisibility(async (visible) => {
                if (visible) {
                    // Always refresh explorer when it becomes visible to compensate for missing file events #126817
                    await this.setTreeInput();
                    // Update the collapse / expand  button state
                    this.updateAnyCollapsedContext();
                    // Find resource to focus from active editor input if set
                    this.selectActiveFile(true);
                }
            }));
        }
        focus() {
            this.tree.domFocus();
            const focused = this.tree.getFocus();
            if (focused.length === 1 && this.autoReveal) {
                this.tree.reveal(focused[0], 0.5);
            }
        }
        hasFocus() {
            return DOM.isAncestor(document.activeElement, this.container);
        }
        getContext(respectMultiSelection) {
            return getContext(this.tree.getFocus(), this.tree.getSelection(), respectMultiSelection, this.renderer);
        }
        isItemVisible(item) {
            // If filter is undefined it means the tree hasn't been rendered yet, so nothing is visible
            if (!this.filter) {
                return false;
            }
            return this.filter.filter(item, 1 /* TreeVisibility.Visible */);
        }
        isItemCollapsed(item) {
            return this.tree.isCollapsed(item);
        }
        async setEditable(stat, isEditing) {
            if (isEditing) {
                this.horizontalScrolling = this.tree.options.horizontalScrolling;
                if (this.horizontalScrolling) {
                    this.tree.updateOptions({ horizontalScrolling: false });
                }
                await this.tree.expand(stat.parent);
            }
            else {
                if (this.horizontalScrolling !== undefined) {
                    this.tree.updateOptions({ horizontalScrolling: this.horizontalScrolling });
                }
                this.horizontalScrolling = undefined;
                this.treeContainer.classList.remove('highlight');
            }
            await this.refresh(false, stat.parent, false);
            if (isEditing) {
                this.treeContainer.classList.add('highlight');
                this.tree.reveal(stat);
            }
            else {
                this.tree.domFocus();
            }
        }
        selectActiveFile(reveal = this.autoReveal) {
            if (this.autoReveal) {
                const activeFile = editor_1.EditorResourceAccessor.getCanonicalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                if (activeFile) {
                    const focus = this.tree.getFocus();
                    const selection = this.tree.getSelection();
                    if (focus.length === 1 && this.uriIdentityService.extUri.isEqual(focus[0].resource, activeFile) && selection.length === 1 && this.uriIdentityService.extUri.isEqual(selection[0].resource, activeFile)) {
                        // No action needed, active file is already focused and selected
                        return;
                    }
                    this.explorerService.select(activeFile, reveal);
                }
            }
        }
        createTree(container) {
            this.filter = this.instantiationService.createInstance(explorerViewer_1.FilesFilter);
            this._register(this.filter);
            this._register(this.filter.onDidChange(() => this.refresh(true)));
            const explorerLabels = this.instantiationService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this._register(explorerLabels);
            const updateWidth = (stat) => this.tree.updateWidth(stat);
            this.renderer = this.instantiationService.createInstance(explorerViewer_1.FilesRenderer, container, explorerLabels, updateWidth);
            this._register(this.renderer);
            this._register(createFileIconThemableTreeContainerScope(container, this.themeService));
            const isCompressionEnabled = () => this.configurationService.getValue('explorer.compactFolders');
            const getFileNestingSettings = (item) => this.configurationService.getValue({ resource: item?.root.resource }).explorer.fileNesting;
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchCompressibleAsyncDataTree, 'FileExplorer', container, new explorerViewer_1.ExplorerDelegate(), new explorerViewer_1.ExplorerCompressionDelegate(), [this.renderer], this.instantiationService.createInstance(explorerViewer_1.ExplorerDataSource, this.filter), {
                compressionEnabled: isCompressionEnabled(),
                accessibilityProvider: this.renderer,
                identityProvider,
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (stat) => {
                        if (this.explorerService.isEditable(stat)) {
                            return undefined;
                        }
                        return stat.name;
                    },
                    getCompressedNodeKeyboardNavigationLabel: (stats) => {
                        if (stats.some(stat => this.explorerService.isEditable(stat))) {
                            return undefined;
                        }
                        return stats.map(stat => stat.name).join('/');
                    }
                },
                multipleSelectionSupport: true,
                filter: this.filter,
                sorter: this.instantiationService.createInstance(explorerViewer_1.FileSorter),
                dnd: this.instantiationService.createInstance(explorerViewer_1.FileDragAndDrop, (item) => this.isItemCollapsed(item)),
                collapseByDefault: (e) => {
                    if (e instanceof explorerModel_1.ExplorerItem) {
                        if (e.hasNests && getFileNestingSettings(e).expand) {
                            return false;
                        }
                    }
                    return true;
                },
                autoExpandSingleChildren: true,
                expandOnlyOnTwistieClick: (e) => {
                    if (e instanceof explorerModel_1.ExplorerItem) {
                        if (e.hasNests) {
                            return true;
                        }
                        else if (this.configurationService.getValue('workbench.tree.expandMode') === 'doubleClick') {
                            return true;
                        }
                    }
                    return false;
                },
                paddingBottom: explorerViewer_1.ExplorerDelegate.ITEM_HEIGHT,
                overrideStyles: {
                    listBackground: theme_1.SIDE_BAR_BACKGROUND
                }
            });
            this._register(this.tree);
            this._register(this.themeService.onDidColorThemeChange(() => this.tree.rerender()));
            // Bind configuration
            const onDidChangeCompressionConfiguration = event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('explorer.compactFolders'));
            this._register(onDidChangeCompressionConfiguration(_ => this.tree.updateOptions({ compressionEnabled: isCompressionEnabled() })));
            // Bind context keys
            files_1.FilesExplorerFocusedContext.bindTo(this.tree.contextKeyService);
            files_1.ExplorerFocusedContext.bindTo(this.tree.contextKeyService);
            // Update resource context based on focused element
            this._register(this.tree.onDidChangeFocus(e => this.onFocusChanged(e.elements)));
            this.onFocusChanged([]);
            // Open when selecting via keyboard
            this._register(this.tree.onDidOpen(async (e) => {
                const element = e.element;
                if (!element) {
                    return;
                }
                // Do not react if the user is expanding selection via keyboard.
                // Check if the item was previously also selected, if yes the user is simply expanding / collapsing current selection #66589.
                const shiftDown = e.browserEvent instanceof KeyboardEvent && e.browserEvent.shiftKey;
                if (!shiftDown) {
                    if (element.isDirectory || this.explorerService.isEditable(undefined)) {
                        // Do not react if user is clicking on explorer items while some are being edited #70276
                        // Do not react if clicking on directories
                        return;
                    }
                    this.telemetryService.publicLog2('workbenchActionExecuted', { id: 'workbench.files.openFile', from: 'explorer' });
                    try {
                        this.delegate?.willOpenElement(e.browserEvent);
                        await this.editorService.openEditor({ resource: element.resource, options: { preserveFocus: e.editorOptions.preserveFocus, pinned: e.editorOptions.pinned, source: editor_2.EditorOpenSource.USER } }, e.sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
                    }
                    finally {
                        this.delegate?.didOpenElement();
                    }
                }
            }));
            this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
            this._register(this.tree.onDidScroll(async (e) => {
                const editable = this.explorerService.getEditable();
                if (e.scrollTopChanged && editable && this.tree.getRelativeTop(editable.stat) === null) {
                    await editable.data.onFinish('', false);
                }
            }));
            this._register(this.tree.onDidChangeCollapseState(e => {
                const element = e.node.element?.element;
                if (element) {
                    const navigationController = this.renderer.getCompressedNavigationController(element instanceof Array ? element[0] : element);
                    navigationController?.updateCollapsed(e.node.collapsed);
                }
                // Update showing expand / collapse button
                this.updateAnyCollapsedContext();
            }));
            this.updateAnyCollapsedContext();
            this._register(this.tree.onMouseDblClick(e => {
                // If empty space is clicked, and not scrolling by page enabled #173261
                const scrollingByPage = this.configurationService.getValue('workbench.list.scrollByPage');
                if (e.element === null && !scrollingByPage) {
                    // click in empty area -> create a new file #116676
                    this.commandService.executeCommand(fileActions_1.NEW_FILE_COMMAND_ID);
                }
            }));
            // save view state
            this._register(this.storageService.onWillSaveState(() => {
                this.storeTreeViewState();
            }));
        }
        // React on events
        onConfigurationUpdated(event) {
            if (!event || event.affectsConfiguration('explorer.autoReveal')) {
                const configuration = this.configurationService.getValue();
                this.autoReveal = configuration?.explorer?.autoReveal;
            }
            // Push down config updates to components of viewer
            if (event && (event.affectsConfiguration('explorer.decorations.colors') || event.affectsConfiguration('explorer.decorations.badges'))) {
                this.refresh(true);
            }
        }
        storeTreeViewState() {
            this.storageService.store(ExplorerView_1.TREE_VIEW_STATE_STORAGE_KEY, JSON.stringify(this.tree.getViewState()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        setContextKeys(stat) {
            const folders = this.contextService.getWorkspace().folders;
            const resource = stat ? stat.resource : folders[folders.length - 1].uri;
            stat = stat || this.explorerService.findClosest(resource);
            this.resourceContext.set(resource);
            this.folderContext.set(!!stat && stat.isDirectory);
            this.readonlyContext.set(!!stat && !!stat.isReadonly);
            this.rootContext.set(!!stat && stat.isRoot);
            if (resource) {
                const overrides = resource ? this.editorResolverService.getEditors(resource).map(editor => editor.id) : [];
                this.availableEditorIdsContext.set(overrides.join(','));
            }
            else {
                this.availableEditorIdsContext.reset();
            }
        }
        async onContextMenu(e) {
            if ((0, listWidget_1.isInputElement)(e.browserEvent.target)) {
                return;
            }
            const stat = e.element;
            let anchor = e.anchor;
            // Adjust for compressed folders (except when mouse is used)
            if (DOM.isHTMLElement(anchor)) {
                if (stat) {
                    const controller = this.renderer.getCompressedNavigationController(stat);
                    if (controller) {
                        if (e.browserEvent instanceof KeyboardEvent || (0, explorerViewer_1.isCompressedFolderName)(e.browserEvent.target)) {
                            anchor = controller.labels[controller.index];
                        }
                        else {
                            controller.last();
                        }
                    }
                }
            }
            // update dynamic contexts
            this.fileCopiedContextKey.set(await this.clipboardService.hasResources());
            this.setContextKeys(stat);
            const selection = this.tree.getSelection();
            const roots = this.explorerService.roots; // If the click is outside of the elements pass the root resource if there is only one root. If there are multiple roots pass empty object.
            let arg;
            if (stat instanceof explorerModel_1.ExplorerItem) {
                const compressedController = this.renderer.getCompressedNavigationController(stat);
                arg = compressedController ? compressedController.current.resource : stat.resource;
            }
            else {
                arg = roots.length === 1 ? roots[0].resource : {};
            }
            this.contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.ExplorerContext,
                menuActionOptions: { arg, shouldForwardArgs: true },
                contextKeyService: this.tree.contextKeyService,
                getAnchor: () => anchor,
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.tree.domFocus();
                    }
                },
                getActionsContext: () => stat && selection && selection.indexOf(stat) >= 0
                    ? selection.map((fs) => fs.resource)
                    : stat instanceof explorerModel_1.ExplorerItem ? [stat.resource] : []
            });
        }
        onFocusChanged(elements) {
            const stat = elements && elements.length ? elements[0] : undefined;
            this.setContextKeys(stat);
            if (stat) {
                const enableTrash = this.configurationService.getValue().files.enableTrash;
                const hasCapability = this.fileService.hasCapability(stat.resource, 4096 /* FileSystemProviderCapabilities.Trash */);
                this.resourceMoveableToTrash.set(enableTrash && hasCapability);
            }
            else {
                this.resourceMoveableToTrash.reset();
            }
            const compressedNavigationController = stat && this.renderer.getCompressedNavigationController(stat);
            if (!compressedNavigationController) {
                this.compressedFocusContext.set(false);
                return;
            }
            this.compressedFocusContext.set(true);
            this.updateCompressedNavigationContextKeys(compressedNavigationController);
        }
        // General methods
        /**
         * Refresh the contents of the explorer to get up to date data from the disk about the file structure.
         * If the item is passed we refresh only that level of the tree, otherwise we do a full refresh.
         */
        refresh(recursive, item, cancelEditing = true) {
            if (!this.tree || !this.isBodyVisible() || (item && !this.tree.hasNode(item))) {
                // Tree node doesn't exist yet, when it becomes visible we will refresh
                return Promise.resolve(undefined);
            }
            if (cancelEditing && this.explorerService.isEditable(undefined)) {
                this.tree.domFocus();
            }
            const toRefresh = item || this.tree.getInput();
            return this.tree.updateChildren(toRefresh, recursive, !!item, {
                diffIdentityProvider: identityProvider
            });
        }
        getOptimalWidth() {
            const parentNode = this.tree.getHTMLElement();
            const childNodes = [].slice.call(parentNode.querySelectorAll('.explorer-item .label-name')); // select all file labels
            return DOM.getLargestChildWidth(parentNode, childNodes);
        }
        async setTreeInput() {
            if (!this.isBodyVisible()) {
                return Promise.resolve(undefined);
            }
            // Wait for the last execution to complete before executing
            if (this.setTreeInputPromise) {
                await this.setTreeInputPromise;
            }
            const initialInputSetup = !this.tree.getInput();
            if (initialInputSetup) {
                perf.mark('code/willResolveExplorer');
            }
            const roots = this.explorerService.roots;
            let input = roots[0];
            if (this.contextService.getWorkbenchState() !== 2 /* WorkbenchState.FOLDER */ || roots[0].error) {
                // Display roots only when multi folder workspace
                input = roots;
            }
            let viewState;
            if (this.tree && this.tree.getInput()) {
                viewState = this.tree.getViewState();
            }
            else {
                const rawViewState = this.storageService.get(ExplorerView_1.TREE_VIEW_STATE_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
                if (rawViewState) {
                    viewState = JSON.parse(rawViewState);
                }
            }
            const previousInput = this.tree.getInput();
            const promise = this.setTreeInputPromise = this.tree.setInput(input, viewState).then(async () => {
                if (Array.isArray(input)) {
                    if (!viewState || previousInput instanceof explorerModel_1.ExplorerItem) {
                        // There is no view state for this workspace (we transitioned from a folder workspace?), expand up to five roots.
                        // If there are many roots in a workspace, expanding them all would can cause performance issues #176226
                        for (let i = 0; i < Math.min(input.length, 5); i++) {
                            try {
                                await this.tree.expand(input[i]);
                            }
                            catch (e) { }
                        }
                    }
                    // Reloaded or transitioned from an empty workspace, but only have a single folder in the workspace.
                    if (!previousInput && input.length === 1 && this.configurationService.getValue().explorer.expandSingleFolderWorkspaces) {
                        await this.tree.expand(input[0]).catch(() => { });
                    }
                    if (Array.isArray(previousInput)) {
                        const previousRoots = new map_1.ResourceMap();
                        previousInput.forEach(previousRoot => previousRoots.set(previousRoot.resource, true));
                        // Roots added to the explorer -> expand them.
                        await Promise.all(input.map(async (item) => {
                            if (!previousRoots.has(item.resource)) {
                                try {
                                    await this.tree.expand(item);
                                }
                                catch (e) { }
                            }
                        }));
                    }
                }
                if (initialInputSetup) {
                    perf.mark('code/didResolveExplorer');
                }
            });
            this.progressService.withProgress({
                location: 1 /* ProgressLocation.Explorer */,
                delay: this.layoutService.isRestored() ? 800 : 1500 // reduce progress visibility when still restoring
            }, _progress => promise);
            await promise;
            if (!this.decorationsProvider) {
                this.decorationsProvider = new explorerDecorationsProvider_1.ExplorerDecorationsProvider(this.explorerService, this.contextService);
                this._register(this.decorationService.registerDecorationsProvider(this.decorationsProvider));
            }
        }
        async selectResource(resource, reveal = this.autoReveal, retry = 0) {
            // do no retry more than once to prevent infinite loops in cases of inconsistent model
            if (retry === 2) {
                return;
            }
            if (!resource || !this.isBodyVisible()) {
                return;
            }
            // Expand all stats in the parent chain.
            let item = this.explorerService.findClosestRoot(resource);
            while (item && item.resource.toString() !== resource.toString()) {
                try {
                    await this.tree.expand(item);
                }
                catch (e) {
                    return this.selectResource(resource, reveal, retry + 1);
                }
                for (const child of item.children.values()) {
                    if (this.uriIdentityService.extUri.isEqualOrParent(resource, child.resource)) {
                        item = child;
                        break;
                    }
                    item = null;
                }
            }
            if (item) {
                if (item === this.tree.getInput()) {
                    this.tree.setFocus([]);
                    this.tree.setSelection([]);
                    return;
                }
                try {
                    // We must expand the nest to have it be populated in the tree
                    if (item.nestedParent) {
                        await this.tree.expand(item.nestedParent);
                    }
                    if ((reveal === true || reveal === 'force') && this.tree.getRelativeTop(item) === null) {
                        // Don't scroll to the item if it's already visible, or if set not to.
                        this.tree.reveal(item, 0.5);
                    }
                    this.tree.setFocus([item]);
                    this.tree.setSelection([item]);
                }
                catch (e) {
                    // Element might not be in the tree, try again and silently fail
                    return this.selectResource(resource, reveal, retry + 1);
                }
            }
        }
        itemsCopied(stats, cut, previousCut) {
            this.fileCopiedContextKey.set(stats.length > 0);
            this.resourceCutContextKey.set(cut && stats.length > 0);
            previousCut?.forEach(item => this.tree.rerender(item));
            if (cut) {
                stats.forEach(s => this.tree.rerender(s));
            }
        }
        expandAll() {
            if (this.explorerService.isEditable(undefined)) {
                this.tree.domFocus();
            }
            this.tree.expandAll();
        }
        collapseAll() {
            if (this.explorerService.isEditable(undefined)) {
                this.tree.domFocus();
            }
            const treeInput = this.tree.getInput();
            if (Array.isArray(treeInput)) {
                if (hasExpandedRootChild(this.tree, treeInput)) {
                    treeInput.forEach(folder => {
                        folder.children.forEach(child => this.tree.hasNode(child) && this.tree.collapse(child, true));
                    });
                    return;
                }
            }
            this.tree.collapseAll();
        }
        previousCompressedStat() {
            const focused = this.tree.getFocus();
            if (!focused.length) {
                return;
            }
            const compressedNavigationController = this.renderer.getCompressedNavigationController(focused[0]);
            compressedNavigationController.previous();
            this.updateCompressedNavigationContextKeys(compressedNavigationController);
        }
        nextCompressedStat() {
            const focused = this.tree.getFocus();
            if (!focused.length) {
                return;
            }
            const compressedNavigationController = this.renderer.getCompressedNavigationController(focused[0]);
            compressedNavigationController.next();
            this.updateCompressedNavigationContextKeys(compressedNavigationController);
        }
        firstCompressedStat() {
            const focused = this.tree.getFocus();
            if (!focused.length) {
                return;
            }
            const compressedNavigationController = this.renderer.getCompressedNavigationController(focused[0]);
            compressedNavigationController.first();
            this.updateCompressedNavigationContextKeys(compressedNavigationController);
        }
        lastCompressedStat() {
            const focused = this.tree.getFocus();
            if (!focused.length) {
                return;
            }
            const compressedNavigationController = this.renderer.getCompressedNavigationController(focused[0]);
            compressedNavigationController.last();
            this.updateCompressedNavigationContextKeys(compressedNavigationController);
        }
        updateCompressedNavigationContextKeys(controller) {
            this.compressedFocusFirstContext.set(controller.index === 0);
            this.compressedFocusLastContext.set(controller.index === controller.count - 1);
        }
        updateAnyCollapsedContext() {
            const treeInput = this.tree.getInput();
            if (treeInput === undefined) {
                return;
            }
            const treeInputArray = Array.isArray(treeInput) ? treeInput : Array.from(treeInput.children.values());
            // Has collapsible root when anything is expanded
            this.viewHasSomeCollapsibleRootItem.set(hasExpandedNode(this.tree, treeInputArray));
            // synchronize state to cache
            this.storeTreeViewState();
        }
        dispose() {
            this.dragHandler?.dispose();
            super.dispose();
        }
    };
    exports.ExplorerView = ExplorerView;
    __decorate([
        decorators_1.memoize
    ], ExplorerView.prototype, "fileCopiedContextKey", null);
    __decorate([
        decorators_1.memoize
    ], ExplorerView.prototype, "resourceCutContextKey", null);
    exports.ExplorerView = ExplorerView = ExplorerView_1 = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, views_1.IViewDescriptorService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, progress_1.IProgressService),
        __param(6, editorService_1.IEditorService),
        __param(7, editorResolverService_1.IEditorResolverService),
        __param(8, layoutService_1.IWorkbenchLayoutService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, contextkey_1.IContextKeyService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, decorations_1.IDecorationsService),
        __param(13, label_1.ILabelService),
        __param(14, themeService_1.IThemeService),
        __param(15, telemetry_1.ITelemetryService),
        __param(16, files_3.IExplorerService),
        __param(17, storage_1.IStorageService),
        __param(18, clipboardService_1.IClipboardService),
        __param(19, files_2.IFileService),
        __param(20, uriIdentity_1.IUriIdentityService),
        __param(21, commands_1.ICommandService),
        __param(22, opener_1.IOpenerService)
    ], ExplorerView);
    function createFileIconThemableTreeContainerScope(container, themeService) {
        container.classList.add('file-icon-themable-tree');
        container.classList.add('show-file-icons');
        const onDidChangeFileIconTheme = (theme) => {
            container.classList.toggle('align-icons-and-twisties', theme.hasFileIcons && !theme.hasFolderIcons);
            container.classList.toggle('hide-arrows', theme.hidesExplorerArrows === true);
        };
        onDidChangeFileIconTheme(themeService.getFileIconTheme());
        return themeService.onDidFileIconThemeChange(onDidChangeFileIconTheme);
    }
    exports.createFileIconThemableTreeContainerScope = createFileIconThemableTreeContainerScope;
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.files.action.createFileFromExplorer',
                title: nls.localize('createNewFile', "New File..."),
                f1: false,
                icon: codicons_1.Codicon.newFile,
                precondition: files_1.ExplorerResourceNotReadonlyContext,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', files_1.VIEW_ID),
                    order: 10
                }
            });
        }
        run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            commandService.executeCommand(fileActions_1.NEW_FILE_COMMAND_ID);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.files.action.createFolderFromExplorer',
                title: nls.localize('createNewFolder', "New Folder..."),
                f1: false,
                icon: codicons_1.Codicon.newFolder,
                precondition: files_1.ExplorerResourceNotReadonlyContext,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', files_1.VIEW_ID),
                    order: 20
                }
            });
        }
        run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            commandService.executeCommand(fileActions_1.NEW_FOLDER_COMMAND_ID);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.files.action.refreshFilesExplorer',
                title: { value: nls.localize('refreshExplorer', "Refresh Explorer"), original: 'Refresh Explorer' },
                f1: true,
                icon: codicons_1.Codicon.refresh,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', files_1.VIEW_ID),
                    order: 30
                }
            });
        }
        async run(accessor) {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const explorerService = accessor.get(files_3.IExplorerService);
            await paneCompositeService.openPaneComposite(files_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */);
            await explorerService.refresh();
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.files.action.collapseExplorerFolders',
                title: { value: nls.localize('collapseExplorerFolders', "Collapse Folders in Explorer"), original: 'Collapse Folders in Explorer' },
                f1: true,
                icon: codicons_1.Codicon.collapseAll,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', files_1.VIEW_ID),
                    order: 40
                }
            });
        }
        run(accessor) {
            const viewsService = accessor.get(views_1.IViewsService);
            const view = viewsService.getViewWithId(files_1.VIEW_ID);
            if (view !== null) {
                const explorerView = view;
                explorerView.collapseAll();
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwbG9yZXJWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvYnJvd3Nlci92aWV3cy9leHBsb3JlclZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXdEaEcsU0FBUyxvQkFBb0IsQ0FBQyxJQUFpRyxFQUFFLFNBQXlCO1FBQ3pKLEtBQUssTUFBTSxNQUFNLElBQUksU0FBUyxFQUFFO1lBQy9CLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3RELEtBQUssTUFBTSxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDbEQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUNqRixPQUFPLElBQUksQ0FBQztxQkFDWjtpQkFDRDthQUNEO1NBQ0Q7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsZUFBZSxDQUFDLElBQWlHLEVBQUUsU0FBeUI7UUFDcEosS0FBSyxNQUFNLE1BQU0sSUFBSSxTQUFTLEVBQUU7WUFDL0IsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDdEQsT0FBTyxJQUFJLENBQUM7YUFDWjtTQUNEO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsTUFBTSxnQkFBZ0IsR0FBRztRQUN4QixLQUFLLEVBQUUsQ0FBQyxJQUFrQixFQUFFLEVBQUU7WUFDN0IsSUFBSSxJQUFJLFlBQVksK0JBQWUsRUFBRTtnQkFDcEMsT0FBTyxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO2FBQzdCO1lBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUNELENBQUM7SUFFRixTQUFnQixVQUFVLENBQUMsS0FBcUIsRUFBRSxTQUF5QixFQUFFLHFCQUE4QixFQUMxRyxzQ0FBOEk7UUFFOUksSUFBSSxXQUFxQyxDQUFDO1FBQzFDLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUVsRCxxSEFBcUg7UUFDckgsSUFBSSxxQkFBcUIsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNsRCxXQUFXLEdBQUcsU0FBUyxDQUFDO1NBQ3hCO1FBRUQsTUFBTSw4QkFBOEIsR0FBRyxXQUFXLElBQUksc0NBQXNDLENBQUMsaUNBQWlDLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDNUksV0FBVyxHQUFHLDhCQUE4QixDQUFDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztRQUVwRyxNQUFNLGFBQWEsR0FBbUIsRUFBRSxDQUFDO1FBRXpDLEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxFQUFFO1lBQzdCLE1BQU0sVUFBVSxHQUFHLHNDQUFzQyxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xHLElBQUksVUFBVSxJQUFJLFdBQVcsSUFBSSxVQUFVLEtBQUssOEJBQThCLEVBQUU7Z0JBQy9FLElBQUksSUFBSSxLQUFLLFdBQVcsRUFBRTtvQkFDekIsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDekI7Z0JBQ0QsNEZBQTRGO2dCQUM1RixTQUFTO2FBQ1Q7WUFFRCxJQUFJLFVBQVUsRUFBRTtnQkFDZixhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3hDO2lCQUFNO2dCQUNOLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDekI7U0FDRDtRQUNELElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDakIsSUFBSSxxQkFBcUIsRUFBRTtnQkFDMUIsT0FBTyxhQUFhLENBQUM7YUFDckI7aUJBQU07Z0JBQ04sT0FBTyxFQUFFLENBQUM7YUFDVjtTQUNEO1FBRUQsSUFBSSxxQkFBcUIsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNyRSxPQUFPLGFBQWEsQ0FBQztTQUNyQjtRQUVELE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBN0NELGdDQTZDQztJQVdNLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQWEsU0FBUSxtQkFBUTs7aUJBQ3pCLGdDQUEyQixHQUFXLGtDQUFrQyxBQUE3QyxDQUE4QztRQWdDekYsWUFDQyxPQUFpQyxFQUNaLGtCQUF1QyxFQUNwQyxxQkFBNkMsRUFDOUMsb0JBQTJDLEVBQ3hDLGNBQXlELEVBQ2pFLGVBQWtELEVBQ3BELGFBQThDLEVBQ3RDLHFCQUE4RCxFQUM3RCxhQUF1RCxFQUM1RCxpQkFBcUMsRUFDckMsaUJBQXFDLEVBQ2xDLG9CQUEyQyxFQUM3QyxpQkFBdUQsRUFDN0QsWUFBNEMsRUFDNUMsWUFBb0MsRUFDaEMsZ0JBQW1DLEVBQ3BDLGVBQWtELEVBQ25ELGNBQWdELEVBQzlDLGdCQUEyQyxFQUNoRCxXQUEwQyxFQUNuQyxrQkFBd0QsRUFDNUQsY0FBZ0QsRUFDakQsYUFBNkI7WUFFN0MsS0FBSyxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBRSxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFwQmhKLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUNoRCxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDbkMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ3JCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQXlCO1lBSTFDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBcUI7WUFDNUMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFHeEIsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQ2xDLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUN0QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQy9CLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2xCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDM0MsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBMUIxRCxlQUFVLEdBQXdDLEtBQUssQ0FBQztZQStCL0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxlQUFlLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGdDQUFrQixDQUFDLENBQUM7WUFDL0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFckMsSUFBSSxDQUFDLGFBQWEsR0FBRyw2QkFBcUIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsZUFBZSxHQUFHLHVDQUErQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2pGLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxpREFBeUMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNyRyxJQUFJLENBQUMsV0FBVyxHQUFHLDJCQUFtQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyx1QkFBdUIsR0FBRyx1Q0FBK0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN6RixJQUFJLENBQUMsc0JBQXNCLEdBQUcsc0NBQThCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdkYsSUFBSSxDQUFDLDJCQUEyQixHQUFHLDJDQUFtQyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2pHLElBQUksQ0FBQywwQkFBMEIsR0FBRywwQ0FBa0MsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMvRixJQUFJLENBQUMsOEJBQThCLEdBQUcsNkNBQXFDLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdEcsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGlDQUF5QixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBR2pGLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFRCxJQUFJLElBQUk7WUFDUCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFRCxJQUFhLEtBQUs7WUFDakIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ2xCLENBQUM7UUFFRCxJQUFhLEtBQUssQ0FBQyxDQUFTO1lBQzNCLE9BQU87UUFDUixDQUFDO1FBRVEsVUFBVSxDQUFDLE9BQWdCO1lBQ25DLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRVEsSUFBWSxvQkFBb0I7WUFDeEMsT0FBTywrQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVRLElBQVkscUJBQXFCO1lBQ3pDLE9BQU8sMkJBQW1CLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFRCxxQkFBcUI7UUFFRixZQUFZLENBQUMsU0FBc0I7WUFDckQsS0FBSyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUU5QixzQkFBc0I7WUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLHdCQUFrQixDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFbkYsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQWdCLENBQUM7WUFDdEUsTUFBTSxTQUFTLEdBQUcsR0FBRyxFQUFFO2dCQUN0QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNyRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEUsWUFBWSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNyQyxZQUFZLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztnQkFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLHVCQUF1QixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDM0YsWUFBWSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQy9ELENBQUMsQ0FBQztZQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ25FLFNBQVMsRUFBRSxDQUFDO1FBQ2IsQ0FBQztRQUVrQixVQUFVLENBQUMsTUFBYyxFQUFFLEtBQWE7WUFDMUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFa0IsVUFBVSxDQUFDLFNBQXNCO1lBQ25ELEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFNUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFDM0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQztZQUU1RSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVwQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsR0FBRyxFQUFFO2dCQUMzRCxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLHVCQUF1QjtZQUN2QixJQUFJLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFdkMsNEVBQTRFO1lBQzVFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQzlELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixvQ0FBb0M7WUFDcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXhHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtnQkFDN0QsSUFBSSxPQUFPLEVBQUU7b0JBQ1osZ0dBQWdHO29CQUNoRyxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDMUIsNkNBQTZDO29CQUM3QyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztvQkFDakMseURBQXlEO29CQUN6RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzVCO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFUSxLQUFLO1lBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUVyQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ2xDO1FBQ0YsQ0FBQztRQUVELFFBQVE7WUFDUCxPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVELFVBQVUsQ0FBQyxxQkFBOEI7WUFDeEMsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLHFCQUFxQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6RyxDQUFDO1FBRUQsYUFBYSxDQUFDLElBQWtCO1lBQy9CLDJGQUEyRjtZQUMzRixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDakIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxpQ0FBeUIsQ0FBQztRQUN6RCxDQUFDO1FBRUQsZUFBZSxDQUFDLElBQWtCO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBa0IsRUFBRSxTQUFrQjtZQUN2RCxJQUFJLFNBQVMsRUFBRTtnQkFDZCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7Z0JBRWpFLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO29CQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLG1CQUFtQixFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7aUJBQ3hEO2dCQUVELE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxDQUFDO2FBQ3JDO2lCQUFNO2dCQUNOLElBQUksSUFBSSxDQUFDLG1CQUFtQixLQUFLLFNBQVMsRUFBRTtvQkFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO2lCQUMzRTtnQkFFRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDakQ7WUFFRCxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFOUMsSUFBSSxTQUFTLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN2QjtpQkFBTTtnQkFDTixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3JCO1FBQ0YsQ0FBQztRQUVPLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVTtZQUNoRCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3BCLE1BQU0sVUFBVSxHQUFHLCtCQUFzQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxFQUFFLGlCQUFpQixFQUFFLHlCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBRTVJLElBQUksVUFBVSxFQUFFO29CQUNmLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ25DLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQzNDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxFQUFFO3dCQUN2TSxnRUFBZ0U7d0JBQ2hFLE9BQU87cUJBQ1A7b0JBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2lCQUNoRDthQUNEO1FBQ0YsQ0FBQztRQUVPLFVBQVUsQ0FBQyxTQUFzQjtZQUN4QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsNEJBQVcsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx1QkFBYyxFQUFFLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQztZQUMzSSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRS9CLE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBa0IsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDhCQUFhLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNoSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU5QixJQUFJLENBQUMsU0FBUyxDQUFDLHdDQUF3QyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUV2RixNQUFNLG9CQUFvQixHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQVUseUJBQXlCLENBQUMsQ0FBQztZQUUxRyxNQUFNLHNCQUFzQixHQUFHLENBQUMsSUFBbUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBc0IsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFFeEssSUFBSSxDQUFDLElBQUksR0FBZ0csSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxnREFBa0MsRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLElBQUksaUNBQWdCLEVBQUUsRUFBRSxJQUFJLDRDQUEyQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQzFSLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsbUNBQWtCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMzRSxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRTtnQkFDMUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3BDLGdCQUFnQjtnQkFDaEIsK0JBQStCLEVBQUU7b0JBQ2hDLDBCQUEwQixFQUFFLENBQUMsSUFBa0IsRUFBRSxFQUFFO3dCQUNsRCxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUMxQyxPQUFPLFNBQVMsQ0FBQzt5QkFDakI7d0JBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUNsQixDQUFDO29CQUNELHdDQUF3QyxFQUFFLENBQUMsS0FBcUIsRUFBRSxFQUFFO3dCQUNuRSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFOzRCQUM5RCxPQUFPLFNBQVMsQ0FBQzt5QkFDakI7d0JBRUQsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDL0MsQ0FBQztpQkFDRDtnQkFDRCx3QkFBd0IsRUFBRSxJQUFJO2dCQUM5QixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07Z0JBQ25CLE1BQU0sRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDJCQUFVLENBQUM7Z0JBQzVELEdBQUcsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGdDQUFlLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BHLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxZQUFZLDRCQUFZLEVBQUU7d0JBQzlCLElBQUksQ0FBQyxDQUFDLFFBQVEsSUFBSSxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUU7NEJBQ25ELE9BQU8sS0FBSyxDQUFDO3lCQUNiO3FCQUNEO29CQUNELE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7Z0JBQ0Qsd0JBQXdCLEVBQUUsSUFBSTtnQkFDOUIsd0JBQXdCLEVBQUUsQ0FBQyxDQUFVLEVBQUUsRUFBRTtvQkFDeEMsSUFBSSxDQUFDLFlBQVksNEJBQVksRUFBRTt3QkFDOUIsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFOzRCQUNmLE9BQU8sSUFBSSxDQUFDO3lCQUNaOzZCQUNJLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBZ0MsMkJBQTJCLENBQUMsS0FBSyxhQUFhLEVBQUU7NEJBQzFILE9BQU8sSUFBSSxDQUFDO3lCQUNaO3FCQUNEO29CQUNELE9BQU8sS0FBSyxDQUFDO2dCQUNkLENBQUM7Z0JBQ0QsYUFBYSxFQUFFLGlDQUFnQixDQUFDLFdBQVc7Z0JBQzNDLGNBQWMsRUFBRTtvQkFDZixjQUFjLEVBQUUsMkJBQW1CO2lCQUNuQzthQUNELENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVwRixxQkFBcUI7WUFDckIsTUFBTSxtQ0FBbUMsR0FBRyxhQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7WUFDckssSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxJLG9CQUFvQjtZQUNwQixtQ0FBMkIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2hFLDhCQUFzQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFM0QsbURBQW1EO1lBQ25ELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hCLG1DQUFtQztZQUNuQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsRUFBRTtnQkFDNUMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztnQkFDMUIsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDYixPQUFPO2lCQUNQO2dCQUNELGdFQUFnRTtnQkFDaEUsNkhBQTZIO2dCQUM3SCxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsWUFBWSxZQUFZLGFBQWEsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQztnQkFDckYsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDZixJQUFJLE9BQU8sQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7d0JBQ3RFLHdGQUF3Rjt3QkFDeEYsMENBQTBDO3dCQUMxQyxPQUFPO3FCQUNQO29CQUNELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQXNFLHlCQUF5QixFQUFFLEVBQUUsRUFBRSxFQUFFLDBCQUEwQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO29CQUN2TCxJQUFJO3dCQUNILElBQUksQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFDL0MsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLHlCQUFnQixDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsMEJBQVUsQ0FBQyxDQUFDLENBQUMsNEJBQVksQ0FBQyxDQUFDO3FCQUN4Tzs0QkFBUzt3QkFDVCxJQUFJLENBQUMsUUFBUSxFQUFFLGNBQWMsRUFBRSxDQUFDO3FCQUNoQztpQkFDRDtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFcEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUU7Z0JBQzlDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3BELElBQUksQ0FBQyxDQUFDLGdCQUFnQixJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO29CQUN2RixNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDeEM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNyRCxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUM7Z0JBQ3hDLElBQUksT0FBTyxFQUFFO29CQUNaLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM5SCxvQkFBb0IsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDeEQ7Z0JBQ0QsMENBQTBDO2dCQUMxQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFFakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDNUMsdUVBQXVFO2dCQUN2RSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFVLDZCQUE2QixDQUFDLENBQUM7Z0JBQ25HLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7b0JBQzNDLG1EQUFtRDtvQkFDbkQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsaUNBQW1CLENBQUMsQ0FBQztpQkFDeEQ7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosa0JBQWtCO1lBQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFO2dCQUN2RCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELGtCQUFrQjtRQUVWLHNCQUFzQixDQUFDLEtBQTRDO1lBQzFFLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLHFCQUFxQixDQUFDLEVBQUU7Z0JBQ2hFLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQXVCLENBQUM7Z0JBQ2hGLElBQUksQ0FBQyxVQUFVLEdBQUcsYUFBYSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUM7YUFDdEQ7WUFFRCxtREFBbUQ7WUFDbkQsSUFBSSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsNkJBQTZCLENBQUMsSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFO2dCQUN0SSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25CO1FBQ0YsQ0FBQztRQUVPLGtCQUFrQjtZQUN6QixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxjQUFZLENBQUMsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLGdFQUFnRCxDQUFDO1FBQzlKLENBQUM7UUFFTyxjQUFjLENBQUMsSUFBcUM7WUFDM0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDM0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDeEUsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFNUMsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUMzRyxJQUFJLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUN4RDtpQkFBTTtnQkFDTixJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDdkM7UUFDRixDQUFDO1FBRU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFzQztZQUNqRSxJQUFJLElBQUEsMkJBQWMsRUFBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQXFCLENBQUMsRUFBRTtnQkFDekQsT0FBTzthQUNQO1lBRUQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUN2QixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBRXRCLDREQUE0RDtZQUM1RCxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzlCLElBQUksSUFBSSxFQUFFO29CQUNULE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRXpFLElBQUksVUFBVSxFQUFFO3dCQUNmLElBQUksQ0FBQyxDQUFDLFlBQVksWUFBWSxhQUFhLElBQUksSUFBQSx1Q0FBc0IsRUFBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFOzRCQUM3RixNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7eUJBQzdDOzZCQUFNOzRCQUNOLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt5QkFDbEI7cUJBQ0Q7aUJBQ0Q7YUFDRDtZQUVELDBCQUEwQjtZQUMxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDMUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUxQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRTNDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsMklBQTJJO1lBQ3JMLElBQUksR0FBYSxDQUFDO1lBQ2xCLElBQUksSUFBSSxZQUFZLDRCQUFZLEVBQUU7Z0JBQ2pDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbkYsR0FBRyxHQUFHLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2FBQ25GO2lCQUFNO2dCQUNOLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2FBQ2xEO1lBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztnQkFDdkMsTUFBTSxFQUFFLGdCQUFNLENBQUMsZUFBZTtnQkFDOUIsaUJBQWlCLEVBQUUsRUFBRSxHQUFHLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFO2dCQUNuRCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQjtnQkFDOUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU07Z0JBQ3ZCLE1BQU0sRUFBRSxDQUFDLFlBQXNCLEVBQUUsRUFBRTtvQkFDbEMsSUFBSSxZQUFZLEVBQUU7d0JBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7cUJBQ3JCO2dCQUNGLENBQUM7Z0JBQ0QsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQ3pFLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBZ0IsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQztvQkFDbEQsQ0FBQyxDQUFDLElBQUksWUFBWSw0QkFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTthQUN0RCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sY0FBYyxDQUFDLFFBQWlDO1lBQ3ZELE1BQU0sSUFBSSxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNuRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTFCLElBQUksSUFBSSxFQUFFO2dCQUNULE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQXVCLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztnQkFDaEcsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsa0RBQXVDLENBQUM7Z0JBQzFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLGFBQWEsQ0FBQyxDQUFDO2FBQy9EO2lCQUFNO2dCQUNOLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNyQztZQUVELE1BQU0sOEJBQThCLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFckcsSUFBSSxDQUFDLDhCQUE4QixFQUFFO2dCQUNwQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN2QyxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFFRCxrQkFBa0I7UUFFbEI7OztXQUdHO1FBQ0gsT0FBTyxDQUFDLFNBQWtCLEVBQUUsSUFBbUIsRUFBRSxnQkFBeUIsSUFBSTtZQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7Z0JBQzlFLHVFQUF1RTtnQkFDdkUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxhQUFhLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ2hFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDckI7WUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMvQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRTtnQkFDN0Qsb0JBQW9CLEVBQUUsZ0JBQWdCO2FBQ3RDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUSxlQUFlO1lBQ3ZCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDOUMsTUFBTSxVQUFVLEdBQUksRUFBb0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyx5QkFBeUI7WUFFekksT0FBTyxHQUFHLENBQUMsb0JBQW9CLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxLQUFLLENBQUMsWUFBWTtZQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFO2dCQUMxQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDbEM7WUFFRCwyREFBMkQ7WUFDM0QsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7Z0JBQzdCLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDO2FBQy9CO1lBRUQsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEQsSUFBSSxpQkFBaUIsRUFBRTtnQkFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO2FBQ3RDO1lBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUM7WUFDekMsSUFBSSxLQUFLLEdBQWtDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsa0NBQTBCLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRTtnQkFDeEYsaURBQWlEO2dCQUNqRCxLQUFLLEdBQUcsS0FBSyxDQUFDO2FBQ2Q7WUFFRCxJQUFJLFNBQThDLENBQUM7WUFDbkQsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ3RDLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3JDO2lCQUFNO2dCQUNOLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLGNBQVksQ0FBQywyQkFBMkIsaUNBQXlCLENBQUM7Z0JBQy9HLElBQUksWUFBWSxFQUFFO29CQUNqQixTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDckM7YUFDRDtZQUVELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDM0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQy9GLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDekIsSUFBSSxDQUFDLFNBQVMsSUFBSSxhQUFhLFlBQVksNEJBQVksRUFBRTt3QkFDeEQsaUhBQWlIO3dCQUNqSCx3R0FBd0c7d0JBQ3hHLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7NEJBQ25ELElBQUk7Z0NBQ0gsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs2QkFDakM7NEJBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRzt5QkFDZjtxQkFDRDtvQkFDRCxvR0FBb0c7b0JBQ3BHLElBQUksQ0FBQyxhQUFhLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBdUIsQ0FBQyxRQUFRLENBQUMsNEJBQTRCLEVBQUU7d0JBQzVJLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUNsRDtvQkFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7d0JBQ2pDLE1BQU0sYUFBYSxHQUFHLElBQUksaUJBQVcsRUFBUSxDQUFDO3dCQUM5QyxhQUFhLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBRXRGLDhDQUE4Qzt3QkFDOUMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLElBQUksRUFBQyxFQUFFOzRCQUN4QyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0NBQ3RDLElBQUk7b0NBQ0gsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztpQ0FDN0I7Z0NBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRzs2QkFDZjt3QkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNKO2lCQUNEO2dCQUNELElBQUksaUJBQWlCLEVBQUU7b0JBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztpQkFDckM7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDO2dCQUNqQyxRQUFRLG1DQUEyQjtnQkFDbkMsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtEQUFrRDthQUN0RyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFekIsTUFBTSxPQUFPLENBQUM7WUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO2dCQUM5QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSx5REFBMkIsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDdEcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQzthQUM3RjtRQUNGLENBQUM7UUFFTSxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQXlCLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxHQUFHLENBQUM7WUFDekYsc0ZBQXNGO1lBQ3RGLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtnQkFDaEIsT0FBTzthQUNQO1lBRUQsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRTtnQkFDdkMsT0FBTzthQUNQO1lBRUQsd0NBQXdDO1lBQ3hDLElBQUksSUFBSSxHQUF3QixJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUUvRSxPQUFPLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDaEUsSUFBSTtvQkFDSCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUM3QjtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDWCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ3hEO2dCQUVELEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRTtvQkFDM0MsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFO3dCQUM3RSxJQUFJLEdBQUcsS0FBSyxDQUFDO3dCQUNiLE1BQU07cUJBQ047b0JBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQztpQkFDWjthQUNEO1lBRUQsSUFBSSxJQUFJLEVBQUU7Z0JBQ1QsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUMzQixPQUFPO2lCQUNQO2dCQUVELElBQUk7b0JBQ0gsOERBQThEO29CQUM5RCxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7d0JBQ3RCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO3FCQUMxQztvQkFFRCxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksSUFBSSxNQUFNLEtBQUssT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO3dCQUN2RixzRUFBc0U7d0JBQ3RFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztxQkFDNUI7b0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQy9CO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNYLGdFQUFnRTtvQkFDaEUsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUN4RDthQUNEO1FBQ0YsQ0FBQztRQUVELFdBQVcsQ0FBQyxLQUFxQixFQUFFLEdBQVksRUFBRSxXQUF1QztZQUN2RixJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4RCxXQUFXLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN2RCxJQUFJLEdBQUcsRUFBRTtnQkFDUixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxQztRQUNGLENBQUM7UUFFRCxTQUFTO1lBQ1IsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNyQjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUVELFdBQVc7WUFDVixJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3JCO1lBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN2QyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQzdCLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsRUFBRTtvQkFDL0MsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDL0YsQ0FBQyxDQUFDLENBQUM7b0JBRUgsT0FBTztpQkFDUDthQUNEO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBRUQsc0JBQXNCO1lBQ3JCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BCLE9BQU87YUFDUDtZQUVELE1BQU0sOEJBQThCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQztZQUNwRyw4QkFBOEIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMscUNBQXFDLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRUQsa0JBQWtCO1lBQ2pCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BCLE9BQU87YUFDUDtZQUVELE1BQU0sOEJBQThCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQztZQUNwRyw4QkFBOEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMscUNBQXFDLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRUQsbUJBQW1CO1lBQ2xCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BCLE9BQU87YUFDUDtZQUVELE1BQU0sOEJBQThCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQztZQUNwRyw4QkFBOEIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMscUNBQXFDLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRUQsa0JBQWtCO1lBQ2pCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BCLE9BQU87YUFDUDtZQUVELE1BQU0sOEJBQThCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQztZQUNwRyw4QkFBOEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMscUNBQXFDLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRU8scUNBQXFDLENBQUMsVUFBMkM7WUFDeEYsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFTyx5QkFBeUI7WUFDaEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN2QyxJQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUU7Z0JBQzVCLE9BQU87YUFDUDtZQUNELE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDdEcsaURBQWlEO1lBQ2pELElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUNwRiw2QkFBNkI7WUFDN0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVRLE9BQU87WUFDZixJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQzVCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDOztJQXJ2Qlcsb0NBQVk7SUFnR2Y7UUFBUixvQkFBTzs0REFFUDtJQUVRO1FBQVIsb0JBQU87NkRBRVA7MkJBdEdXLFlBQVk7UUFtQ3RCLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSw4QkFBc0IsQ0FBQTtRQUN0QixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsb0NBQXdCLENBQUE7UUFDeEIsV0FBQSwyQkFBZ0IsQ0FBQTtRQUNoQixXQUFBLDhCQUFjLENBQUE7UUFDZCxXQUFBLDhDQUFzQixDQUFBO1FBQ3RCLFdBQUEsdUNBQXVCLENBQUE7UUFDdkIsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixZQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFlBQUEscUNBQXFCLENBQUE7UUFDckIsWUFBQSxpQ0FBbUIsQ0FBQTtRQUNuQixZQUFBLHFCQUFhLENBQUE7UUFDYixZQUFBLDRCQUFhLENBQUE7UUFDYixZQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFlBQUEsd0JBQWdCLENBQUE7UUFDaEIsWUFBQSx5QkFBZSxDQUFBO1FBQ2YsWUFBQSxvQ0FBaUIsQ0FBQTtRQUNqQixZQUFBLG9CQUFZLENBQUE7UUFDWixZQUFBLGlDQUFtQixDQUFBO1FBQ25CLFlBQUEsMEJBQWUsQ0FBQTtRQUNmLFlBQUEsdUJBQWMsQ0FBQTtPQXhESixZQUFZLENBc3ZCeEI7SUFFRCxTQUFnQix3Q0FBd0MsQ0FBQyxTQUFzQixFQUFFLFlBQTJCO1FBQzNHLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDbkQsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUUzQyxNQUFNLHdCQUF3QixHQUFHLENBQUMsS0FBcUIsRUFBRSxFQUFFO1lBQzFELFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxZQUFZLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDcEcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxtQkFBbUIsS0FBSyxJQUFJLENBQUMsQ0FBQztRQUMvRSxDQUFDLENBQUM7UUFFRix3QkFBd0IsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQzFELE9BQU8sWUFBWSxDQUFDLHdCQUF3QixDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDeEUsQ0FBQztJQVhELDRGQVdDO0lBRUQsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztRQUNwQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsK0NBQStDO2dCQUNuRCxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsYUFBYSxDQUFDO2dCQUNuRCxFQUFFLEVBQUUsS0FBSztnQkFDVCxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxPQUFPO2dCQUNyQixZQUFZLEVBQUUsMENBQWtDO2dCQUNoRCxJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsU0FBUztvQkFDcEIsS0FBSyxFQUFFLFlBQVk7b0JBQ25CLElBQUksRUFBRSwyQkFBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsZUFBTyxDQUFDO29CQUM1QyxLQUFLLEVBQUUsRUFBRTtpQkFDVDthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxHQUFHLENBQUMsUUFBMEI7WUFDN0IsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQkFBZSxDQUFDLENBQUM7WUFDckQsY0FBYyxDQUFDLGNBQWMsQ0FBQyxpQ0FBbUIsQ0FBQyxDQUFDO1FBQ3BELENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxJQUFBLHlCQUFlLEVBQUMsS0FBTSxTQUFRLGlCQUFPO1FBQ3BDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxpREFBaUQ7Z0JBQ3JELEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLGVBQWUsQ0FBQztnQkFDdkQsRUFBRSxFQUFFLEtBQUs7Z0JBQ1QsSUFBSSxFQUFFLGtCQUFPLENBQUMsU0FBUztnQkFDdkIsWUFBWSxFQUFFLDBDQUFrQztnQkFDaEQsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7b0JBQ3BCLEtBQUssRUFBRSxZQUFZO29CQUNuQixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGVBQU8sQ0FBQztvQkFDNUMsS0FBSyxFQUFFLEVBQUU7aUJBQ1Q7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQTBCO1lBQzdCLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQWUsQ0FBQyxDQUFDO1lBQ3JELGNBQWMsQ0FBQyxjQUFjLENBQUMsbUNBQXFCLENBQUMsQ0FBQztRQUN0RCxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztRQUNwQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsNkNBQTZDO2dCQUNqRCxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRTtnQkFDbkcsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsSUFBSSxFQUFFLGtCQUFPLENBQUMsT0FBTztnQkFDckIsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7b0JBQ3BCLEtBQUssRUFBRSxZQUFZO29CQUNuQixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGVBQU8sQ0FBQztvQkFDNUMsS0FBSyxFQUFFLEVBQUU7aUJBQ1Q7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUNuQyxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMseUNBQXlCLENBQUMsQ0FBQztZQUNyRSxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLENBQUM7WUFDdkQsTUFBTSxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBVSx3Q0FBZ0MsQ0FBQztZQUN4RixNQUFNLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQyxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztRQUNwQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsZ0RBQWdEO2dCQUNwRCxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSw4QkFBOEIsQ0FBQyxFQUFFLFFBQVEsRUFBRSw4QkFBOEIsRUFBRTtnQkFDbkksRUFBRSxFQUFFLElBQUk7Z0JBQ1IsSUFBSSxFQUFFLGtCQUFPLENBQUMsV0FBVztnQkFDekIsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7b0JBQ3BCLEtBQUssRUFBRSxZQUFZO29CQUNuQixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGVBQU8sQ0FBQztvQkFDNUMsS0FBSyxFQUFFLEVBQUU7aUJBQ1Q7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQTBCO1lBQzdCLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsZUFBTyxDQUFDLENBQUM7WUFDakQsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO2dCQUNsQixNQUFNLFlBQVksR0FBRyxJQUFvQixDQUFDO2dCQUMxQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDM0I7UUFDRixDQUFDO0tBQ0QsQ0FBQyxDQUFDIn0=