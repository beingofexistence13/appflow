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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/views/explorerView", "vs/base/common/performance", "vs/base/common/decorators", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/files/browser/fileActions", "vs/base/browser/dom", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/contrib/files/browser/views/explorerDecorationsProvider", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/platform/keybinding/common/keybinding", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/contextkeys", "vs/workbench/services/decorations/common/decorations", "vs/platform/list/browser/listService", "vs/base/browser/dnd", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/views/viewPane", "vs/platform/label/common/label", "vs/workbench/contrib/files/browser/views/explorerViewer", "vs/platform/theme/common/themeService", "vs/platform/actions/common/actions", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/files/common/explorerModel", "vs/workbench/browser/labels", "vs/platform/storage/common/storage", "vs/platform/clipboard/common/clipboardService", "vs/platform/files/common/files", "vs/base/common/event", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/editor", "vs/workbench/contrib/files/browser/files", "vs/base/common/codicons", "vs/platform/commands/common/commands", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/editor/common/editor", "vs/base/common/map", "vs/base/browser/ui/list/listWidget"], function (require, exports, nls, perf, decorators_1, files_1, fileActions_1, DOM, layoutService_1, explorerDecorationsProvider_1, workspace_1, configuration_1, keybinding_1, instantiation_1, progress_1, contextView_1, contextkey_1, contextkeys_1, decorations_1, listService_1, dnd_1, editorService_1, viewPane_1, label_1, explorerViewer_1, themeService_1, actions_1, telemetry_1, explorerModel_1, labels_1, storage_1, clipboardService_1, files_2, event_1, theme_1, views_1, opener_1, uriIdentity_1, editor_1, files_3, codicons_1, commands_1, editorResolverService_1, panecomposite_1, editor_2, map_1, listWidget_1) {
    "use strict";
    var $sIb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tIb = exports.$sIb = exports.$rIb = void 0;
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
            if (stat instanceof explorerModel_1.$wHb) {
                return `new:${stat.getId()}`;
            }
            return stat.getId();
        }
    };
    function $rIb(focus, selection, respectMultiSelection, compressedNavigationControllerProvider) {
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
    exports.$rIb = $rIb;
    let $sIb = class $sIb extends viewPane_1.$Ieb {
        static { $sIb_1 = this; }
        static { this.TREE_VIEW_STATE_STORAGE_KEY = 'workbench.explorer.treeViewState'; }
        constructor(options, contextMenuService, viewDescriptorService, instantiationService, dc, ec, fc, gc, hc, keybindingService, contextKeyService, configurationService, ic, jc, themeService, telemetryService, kc, lc, mc, nc, oc, pc, openerService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.dc = dc;
            this.ec = ec;
            this.fc = fc;
            this.gc = gc;
            this.hc = hc;
            this.ic = ic;
            this.jc = jc;
            this.kc = kc;
            this.lc = lc;
            this.mc = mc;
            this.nc = nc;
            this.oc = oc;
            this.pc = pc;
            this.ac = false;
            this.cc = options.delegate;
            this.c = instantiationService.createInstance(contextkeys_1.$Kdb);
            this.B(this.c);
            this.f = files_1.$Qdb.bindTo(contextKeyService);
            this.g = files_1.$Rdb.bindTo(contextKeyService);
            this.h = files_1.$Tdb.bindTo(contextKeyService);
            this.j = files_1.$Udb.bindTo(contextKeyService);
            this.m = files_1.$Wdb.bindTo(contextKeyService);
            this.L = files_1.$1db.bindTo(contextKeyService);
            this.ab = files_1.$2db.bindTo(contextKeyService);
            this.sb = files_1.$3db.bindTo(contextKeyService);
            this.Wb = files_1.$4db.bindTo(contextKeyService);
            this.Xb = files_1.$Pdb.bindTo(contextKeyService);
            this.kc.registerView(this);
        }
        get name() {
            return this.jc.getWorkspaceLabel(this.dc.getWorkspace());
        }
        get title() {
            return this.name;
        }
        set title(_) {
            // noop
        }
        setVisible(visible) {
            this.Xb.set(visible);
            super.setVisible(visible);
        }
        get qc() {
            return fileActions_1.$OHb.bindTo(this.zb);
        }
        get rc() {
            return files_1.$Vdb.bindTo(this.zb);
        }
        // Split view methods
        S(container) {
            super.S(container);
            // Expand on drag over
            this.$b = new dnd_1.$BP(container, () => this.setExpanded(true));
            const titleElement = container.querySelector('.title');
            const setHeader = () => {
                const workspace = this.dc.getWorkspace();
                const title = workspace.folders.map(folder => folder.name).join();
                titleElement.textContent = this.name;
                titleElement.title = title;
                this.ariaHeaderLabel = nls.localize(0, null, this.name);
                titleElement.setAttribute('aria-label', this.ariaHeaderLabel);
            };
            this.B(this.dc.onDidChangeWorkspaceName(setHeader));
            this.B(this.jc.onDidChangeFormatters(setHeader));
            setHeader();
        }
        W(height, width) {
            super.W(height, width);
            this.a.layout(height, width);
        }
        U(container) {
            super.U(container);
            this.t = container;
            this.r = DOM.$0O(container, DOM.$('.explorer-folders-view'));
            this.wc(this.r);
            this.B(this.jc.onDidChangeFormatters(() => {
                this.cb.fire();
            }));
            // Update configuration
            this.xc(undefined);
            // When the explorer viewer is loaded, listen to changes to the editor input
            this.B(this.fc.onDidActiveEditorChange(() => {
                this.vc();
            }));
            // Also handle configuration updates
            this.B(this.yb.onDidChangeConfiguration(e => this.xc(e)));
            this.B(this.onDidChangeBodyVisibility(async (visible) => {
                if (visible) {
                    // Always refresh explorer when it becomes visible to compensate for missing file events #126817
                    await this.setTreeInput();
                    // Update the collapse / expand  button state
                    this.Dc();
                    // Find resource to focus from active editor input if set
                    this.vc(true);
                }
            }));
        }
        focus() {
            this.a.domFocus();
            const focused = this.a.getFocus();
            if (focused.length === 1 && this.ac) {
                this.a.reveal(focused[0], 0.5);
            }
        }
        hasFocus() {
            return DOM.$NO(document.activeElement, this.t);
        }
        getContext(respectMultiSelection) {
            return $rIb(this.a.getFocus(), this.a.getSelection(), respectMultiSelection, this.n);
        }
        isItemVisible(item) {
            // If filter is undefined it means the tree hasn't been rendered yet, so nothing is visible
            if (!this.b) {
                return false;
            }
            return this.b.filter(item, 1 /* TreeVisibility.Visible */);
        }
        isItemCollapsed(item) {
            return this.a.isCollapsed(item);
        }
        async setEditable(stat, isEditing) {
            if (isEditing) {
                this.Zb = this.a.options.horizontalScrolling;
                if (this.Zb) {
                    this.a.updateOptions({ horizontalScrolling: false });
                }
                await this.a.expand(stat.parent);
            }
            else {
                if (this.Zb !== undefined) {
                    this.a.updateOptions({ horizontalScrolling: this.Zb });
                }
                this.Zb = undefined;
                this.r.classList.remove('highlight');
            }
            await this.refresh(false, stat.parent, false);
            if (isEditing) {
                this.r.classList.add('highlight');
                this.a.reveal(stat);
            }
            else {
                this.a.domFocus();
            }
        }
        vc(reveal = this.ac) {
            if (this.ac) {
                const activeFile = editor_1.$3E.getCanonicalUri(this.fc.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                if (activeFile) {
                    const focus = this.a.getFocus();
                    const selection = this.a.getSelection();
                    if (focus.length === 1 && this.oc.extUri.isEqual(focus[0].resource, activeFile) && selection.length === 1 && this.oc.extUri.isEqual(selection[0].resource, activeFile)) {
                        // No action needed, active file is already focused and selected
                        return;
                    }
                    this.kc.select(activeFile, reveal);
                }
            }
        }
        wc(container) {
            this.b = this.Bb.createInstance(explorerViewer_1.$kIb);
            this.B(this.b);
            this.B(this.b.onDidChange(() => this.refresh(true)));
            const explorerLabels = this.Bb.createInstance(labels_1.$Llb, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this.B(explorerLabels);
            const updateWidth = (stat) => this.a.updateWidth(stat);
            this.n = this.Bb.createInstance(explorerViewer_1.$jIb, container, explorerLabels, updateWidth);
            this.B(this.n);
            this.B($tIb(container, this.Db));
            const isCompressionEnabled = () => this.yb.getValue('explorer.compactFolders');
            const getFileNestingSettings = (item) => this.yb.getValue({ resource: item?.root.resource }).explorer.fileNesting;
            this.a = this.Bb.createInstance(listService_1.$x4, 'FileExplorer', container, new explorerViewer_1.$fIb(), new explorerViewer_1.$oIb(), [this.n], this.Bb.createInstance(explorerViewer_1.$hIb, this.b), {
                compressionEnabled: isCompressionEnabled(),
                accessibilityProvider: this.n,
                identityProvider,
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (stat) => {
                        if (this.kc.isEditable(stat)) {
                            return undefined;
                        }
                        return stat.name;
                    },
                    getCompressedNodeKeyboardNavigationLabel: (stats) => {
                        if (stats.some(stat => this.kc.isEditable(stat))) {
                            return undefined;
                        }
                        return stats.map(stat => stat.name).join('/');
                    }
                },
                multipleSelectionSupport: true,
                filter: this.b,
                sorter: this.Bb.createInstance(explorerViewer_1.$lIb),
                dnd: this.Bb.createInstance(explorerViewer_1.$mIb, (item) => this.isItemCollapsed(item)),
                collapseByDefault: (e) => {
                    if (e instanceof explorerModel_1.$vHb) {
                        if (e.hasNests && getFileNestingSettings(e).expand) {
                            return false;
                        }
                    }
                    return true;
                },
                autoExpandSingleChildren: true,
                expandOnlyOnTwistieClick: (e) => {
                    if (e instanceof explorerModel_1.$vHb) {
                        if (e.hasNests) {
                            return true;
                        }
                        else if (this.yb.getValue('workbench.tree.expandMode') === 'doubleClick') {
                            return true;
                        }
                    }
                    return false;
                },
                paddingBottom: explorerViewer_1.$fIb.ITEM_HEIGHT,
                overrideStyles: {
                    listBackground: theme_1.$Iab
                }
            });
            this.B(this.a);
            this.B(this.Db.onDidColorThemeChange(() => this.a.rerender()));
            // Bind configuration
            const onDidChangeCompressionConfiguration = event_1.Event.filter(this.yb.onDidChangeConfiguration, e => e.affectsConfiguration('explorer.compactFolders'));
            this.B(onDidChangeCompressionConfiguration(_ => this.a.updateOptions({ compressionEnabled: isCompressionEnabled() })));
            // Bind context keys
            files_1.$Xdb.bindTo(this.a.contextKeyService);
            files_1.$Zdb.bindTo(this.a.contextKeyService);
            // Update resource context based on focused element
            this.B(this.a.onDidChangeFocus(e => this.Bc(e.elements)));
            this.Bc([]);
            // Open when selecting via keyboard
            this.B(this.a.onDidOpen(async (e) => {
                const element = e.element;
                if (!element) {
                    return;
                }
                // Do not react if the user is expanding selection via keyboard.
                // Check if the item was previously also selected, if yes the user is simply expanding / collapsing current selection #66589.
                const shiftDown = e.browserEvent instanceof KeyboardEvent && e.browserEvent.shiftKey;
                if (!shiftDown) {
                    if (element.isDirectory || this.kc.isEditable(undefined)) {
                        // Do not react if user is clicking on explorer items while some are being edited #70276
                        // Do not react if clicking on directories
                        return;
                    }
                    this.Eb.publicLog2('workbenchActionExecuted', { id: 'workbench.files.openFile', from: 'explorer' });
                    try {
                        this.cc?.willOpenElement(e.browserEvent);
                        await this.fc.openEditor({ resource: element.resource, options: { preserveFocus: e.editorOptions.preserveFocus, pinned: e.editorOptions.pinned, source: editor_2.EditorOpenSource.USER } }, e.sideBySide ? editorService_1.$$C : editorService_1.$0C);
                    }
                    finally {
                        this.cc?.didOpenElement();
                    }
                }
            }));
            this.B(this.a.onContextMenu(e => this.Ac(e)));
            this.B(this.a.onDidScroll(async (e) => {
                const editable = this.kc.getEditable();
                if (e.scrollTopChanged && editable && this.a.getRelativeTop(editable.stat) === null) {
                    await editable.data.onFinish('', false);
                }
            }));
            this.B(this.a.onDidChangeCollapseState(e => {
                const element = e.node.element?.element;
                if (element) {
                    const navigationController = this.n.getCompressedNavigationController(element instanceof Array ? element[0] : element);
                    navigationController?.updateCollapsed(e.node.collapsed);
                }
                // Update showing expand / collapse button
                this.Dc();
            }));
            this.Dc();
            this.B(this.a.onMouseDblClick(e => {
                // If empty space is clicked, and not scrolling by page enabled #173261
                const scrollingByPage = this.yb.getValue('workbench.list.scrollByPage');
                if (e.element === null && !scrollingByPage) {
                    // click in empty area -> create a new file #116676
                    this.pc.executeCommand(fileActions_1.$GHb);
                }
            }));
            // save view state
            this.B(this.lc.onWillSaveState(() => {
                this.yc();
            }));
        }
        // React on events
        xc(event) {
            if (!event || event.affectsConfiguration('explorer.autoReveal')) {
                const configuration = this.yb.getValue();
                this.ac = configuration?.explorer?.autoReveal;
            }
            // Push down config updates to components of viewer
            if (event && (event.affectsConfiguration('explorer.decorations.colors') || event.affectsConfiguration('explorer.decorations.badges'))) {
                this.refresh(true);
            }
        }
        yc() {
            this.lc.store($sIb_1.TREE_VIEW_STATE_STORAGE_KEY, JSON.stringify(this.a.getViewState()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        zc(stat) {
            const folders = this.dc.getWorkspace().folders;
            const resource = stat ? stat.resource : folders[folders.length - 1].uri;
            stat = stat || this.kc.findClosest(resource);
            this.c.set(resource);
            this.f.set(!!stat && stat.isDirectory);
            this.g.set(!!stat && !!stat.isReadonly);
            this.j.set(!!stat && stat.isRoot);
            if (resource) {
                const overrides = resource ? this.gc.getEditors(resource).map(editor => editor.id) : [];
                this.h.set(overrides.join(','));
            }
            else {
                this.h.reset();
            }
        }
        async Ac(e) {
            if ((0, listWidget_1.$nQ)(e.browserEvent.target)) {
                return;
            }
            const stat = e.element;
            let anchor = e.anchor;
            // Adjust for compressed folders (except when mouse is used)
            if (DOM.$2O(anchor)) {
                if (stat) {
                    const controller = this.n.getCompressedNavigationController(stat);
                    if (controller) {
                        if (e.browserEvent instanceof KeyboardEvent || (0, explorerViewer_1.$nIb)(e.browserEvent.target)) {
                            anchor = controller.labels[controller.index];
                        }
                        else {
                            controller.last();
                        }
                    }
                }
            }
            // update dynamic contexts
            this.qc.set(await this.mc.hasResources());
            this.zc(stat);
            const selection = this.a.getSelection();
            const roots = this.kc.roots; // If the click is outside of the elements pass the root resource if there is only one root. If there are multiple roots pass empty object.
            let arg;
            if (stat instanceof explorerModel_1.$vHb) {
                const compressedController = this.n.getCompressedNavigationController(stat);
                arg = compressedController ? compressedController.current.resource : stat.resource;
            }
            else {
                arg = roots.length === 1 ? roots[0].resource : {};
            }
            this.xb.showContextMenu({
                menuId: actions_1.$Ru.ExplorerContext,
                menuActionOptions: { arg, shouldForwardArgs: true },
                contextKeyService: this.a.contextKeyService,
                getAnchor: () => anchor,
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.a.domFocus();
                    }
                },
                getActionsContext: () => stat && selection && selection.indexOf(stat) >= 0
                    ? selection.map((fs) => fs.resource)
                    : stat instanceof explorerModel_1.$vHb ? [stat.resource] : []
            });
        }
        Bc(elements) {
            const stat = elements && elements.length ? elements[0] : undefined;
            this.zc(stat);
            if (stat) {
                const enableTrash = this.yb.getValue().files.enableTrash;
                const hasCapability = this.nc.hasCapability(stat.resource, 4096 /* FileSystemProviderCapabilities.Trash */);
                this.m.set(enableTrash && hasCapability);
            }
            else {
                this.m.reset();
            }
            const compressedNavigationController = stat && this.n.getCompressedNavigationController(stat);
            if (!compressedNavigationController) {
                this.L.set(false);
                return;
            }
            this.L.set(true);
            this.Cc(compressedNavigationController);
        }
        // General methods
        /**
         * Refresh the contents of the explorer to get up to date data from the disk about the file structure.
         * If the item is passed we refresh only that level of the tree, otherwise we do a full refresh.
         */
        refresh(recursive, item, cancelEditing = true) {
            if (!this.a || !this.isBodyVisible() || (item && !this.a.hasNode(item))) {
                // Tree node doesn't exist yet, when it becomes visible we will refresh
                return Promise.resolve(undefined);
            }
            if (cancelEditing && this.kc.isEditable(undefined)) {
                this.a.domFocus();
            }
            const toRefresh = item || this.a.getInput();
            return this.a.updateChildren(toRefresh, recursive, !!item, {
                diffIdentityProvider: identityProvider
            });
        }
        getOptimalWidth() {
            const parentNode = this.a.getHTMLElement();
            const childNodes = [].slice.call(parentNode.querySelectorAll('.explorer-item .label-name')); // select all file labels
            return DOM.$MO(parentNode, childNodes);
        }
        async setTreeInput() {
            if (!this.isBodyVisible()) {
                return Promise.resolve(undefined);
            }
            // Wait for the last execution to complete before executing
            if (this.Yb) {
                await this.Yb;
            }
            const initialInputSetup = !this.a.getInput();
            if (initialInputSetup) {
                perf.mark('code/willResolveExplorer');
            }
            const roots = this.kc.roots;
            let input = roots[0];
            if (this.dc.getWorkbenchState() !== 2 /* WorkbenchState.FOLDER */ || roots[0].error) {
                // Display roots only when multi folder workspace
                input = roots;
            }
            let viewState;
            if (this.a && this.a.getInput()) {
                viewState = this.a.getViewState();
            }
            else {
                const rawViewState = this.lc.get($sIb_1.TREE_VIEW_STATE_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
                if (rawViewState) {
                    viewState = JSON.parse(rawViewState);
                }
            }
            const previousInput = this.a.getInput();
            const promise = this.Yb = this.a.setInput(input, viewState).then(async () => {
                if (Array.isArray(input)) {
                    if (!viewState || previousInput instanceof explorerModel_1.$vHb) {
                        // There is no view state for this workspace (we transitioned from a folder workspace?), expand up to five roots.
                        // If there are many roots in a workspace, expanding them all would can cause performance issues #176226
                        for (let i = 0; i < Math.min(input.length, 5); i++) {
                            try {
                                await this.a.expand(input[i]);
                            }
                            catch (e) { }
                        }
                    }
                    // Reloaded or transitioned from an empty workspace, but only have a single folder in the workspace.
                    if (!previousInput && input.length === 1 && this.yb.getValue().explorer.expandSingleFolderWorkspaces) {
                        await this.a.expand(input[0]).catch(() => { });
                    }
                    if (Array.isArray(previousInput)) {
                        const previousRoots = new map_1.$zi();
                        previousInput.forEach(previousRoot => previousRoots.set(previousRoot.resource, true));
                        // Roots added to the explorer -> expand them.
                        await Promise.all(input.map(async (item) => {
                            if (!previousRoots.has(item.resource)) {
                                try {
                                    await this.a.expand(item);
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
            this.ec.withProgress({
                location: 1 /* ProgressLocation.Explorer */,
                delay: this.hc.isRestored() ? 800 : 1500 // reduce progress visibility when still restoring
            }, _progress => promise);
            await promise;
            if (!this.bc) {
                this.bc = new explorerDecorationsProvider_1.$qIb(this.kc, this.dc);
                this.B(this.ic.registerDecorationsProvider(this.bc));
            }
        }
        async selectResource(resource, reveal = this.ac, retry = 0) {
            // do no retry more than once to prevent infinite loops in cases of inconsistent model
            if (retry === 2) {
                return;
            }
            if (!resource || !this.isBodyVisible()) {
                return;
            }
            // Expand all stats in the parent chain.
            let item = this.kc.findClosestRoot(resource);
            while (item && item.resource.toString() !== resource.toString()) {
                try {
                    await this.a.expand(item);
                }
                catch (e) {
                    return this.selectResource(resource, reveal, retry + 1);
                }
                for (const child of item.children.values()) {
                    if (this.oc.extUri.isEqualOrParent(resource, child.resource)) {
                        item = child;
                        break;
                    }
                    item = null;
                }
            }
            if (item) {
                if (item === this.a.getInput()) {
                    this.a.setFocus([]);
                    this.a.setSelection([]);
                    return;
                }
                try {
                    // We must expand the nest to have it be populated in the tree
                    if (item.nestedParent) {
                        await this.a.expand(item.nestedParent);
                    }
                    if ((reveal === true || reveal === 'force') && this.a.getRelativeTop(item) === null) {
                        // Don't scroll to the item if it's already visible, or if set not to.
                        this.a.reveal(item, 0.5);
                    }
                    this.a.setFocus([item]);
                    this.a.setSelection([item]);
                }
                catch (e) {
                    // Element might not be in the tree, try again and silently fail
                    return this.selectResource(resource, reveal, retry + 1);
                }
            }
        }
        itemsCopied(stats, cut, previousCut) {
            this.qc.set(stats.length > 0);
            this.rc.set(cut && stats.length > 0);
            previousCut?.forEach(item => this.a.rerender(item));
            if (cut) {
                stats.forEach(s => this.a.rerender(s));
            }
        }
        expandAll() {
            if (this.kc.isEditable(undefined)) {
                this.a.domFocus();
            }
            this.a.expandAll();
        }
        collapseAll() {
            if (this.kc.isEditable(undefined)) {
                this.a.domFocus();
            }
            const treeInput = this.a.getInput();
            if (Array.isArray(treeInput)) {
                if (hasExpandedRootChild(this.a, treeInput)) {
                    treeInput.forEach(folder => {
                        folder.children.forEach(child => this.a.hasNode(child) && this.a.collapse(child, true));
                    });
                    return;
                }
            }
            this.a.collapseAll();
        }
        previousCompressedStat() {
            const focused = this.a.getFocus();
            if (!focused.length) {
                return;
            }
            const compressedNavigationController = this.n.getCompressedNavigationController(focused[0]);
            compressedNavigationController.previous();
            this.Cc(compressedNavigationController);
        }
        nextCompressedStat() {
            const focused = this.a.getFocus();
            if (!focused.length) {
                return;
            }
            const compressedNavigationController = this.n.getCompressedNavigationController(focused[0]);
            compressedNavigationController.next();
            this.Cc(compressedNavigationController);
        }
        firstCompressedStat() {
            const focused = this.a.getFocus();
            if (!focused.length) {
                return;
            }
            const compressedNavigationController = this.n.getCompressedNavigationController(focused[0]);
            compressedNavigationController.first();
            this.Cc(compressedNavigationController);
        }
        lastCompressedStat() {
            const focused = this.a.getFocus();
            if (!focused.length) {
                return;
            }
            const compressedNavigationController = this.n.getCompressedNavigationController(focused[0]);
            compressedNavigationController.last();
            this.Cc(compressedNavigationController);
        }
        Cc(controller) {
            this.ab.set(controller.index === 0);
            this.sb.set(controller.index === controller.count - 1);
        }
        Dc() {
            const treeInput = this.a.getInput();
            if (treeInput === undefined) {
                return;
            }
            const treeInputArray = Array.isArray(treeInput) ? treeInput : Array.from(treeInput.children.values());
            // Has collapsible root when anything is expanded
            this.Wb.set(hasExpandedNode(this.a, treeInputArray));
            // synchronize state to cache
            this.yc();
        }
        dispose() {
            this.$b?.dispose();
            super.dispose();
        }
    };
    exports.$sIb = $sIb;
    __decorate([
        decorators_1.$6g
    ], $sIb.prototype, "qc", null);
    __decorate([
        decorators_1.$6g
    ], $sIb.prototype, "rc", null);
    exports.$sIb = $sIb = $sIb_1 = __decorate([
        __param(1, contextView_1.$WZ),
        __param(2, views_1.$_E),
        __param(3, instantiation_1.$Ah),
        __param(4, workspace_1.$Kh),
        __param(5, progress_1.$2u),
        __param(6, editorService_1.$9C),
        __param(7, editorResolverService_1.$pbb),
        __param(8, layoutService_1.$Meb),
        __param(9, keybinding_1.$2D),
        __param(10, contextkey_1.$3i),
        __param(11, configuration_1.$8h),
        __param(12, decorations_1.$Gcb),
        __param(13, label_1.$Vz),
        __param(14, themeService_1.$gv),
        __param(15, telemetry_1.$9k),
        __param(16, files_3.$xHb),
        __param(17, storage_1.$Vo),
        __param(18, clipboardService_1.$UZ),
        __param(19, files_2.$6j),
        __param(20, uriIdentity_1.$Ck),
        __param(21, commands_1.$Fr),
        __param(22, opener_1.$NT)
    ], $sIb);
    function $tIb(container, themeService) {
        container.classList.add('file-icon-themable-tree');
        container.classList.add('show-file-icons');
        const onDidChangeFileIconTheme = (theme) => {
            container.classList.toggle('align-icons-and-twisties', theme.hasFileIcons && !theme.hasFolderIcons);
            container.classList.toggle('hide-arrows', theme.hidesExplorerArrows === true);
        };
        onDidChangeFileIconTheme(themeService.getFileIconTheme());
        return themeService.onDidFileIconThemeChange(onDidChangeFileIconTheme);
    }
    exports.$tIb = $tIb;
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.files.action.createFileFromExplorer',
                title: nls.localize(1, null),
                f1: false,
                icon: codicons_1.$Pj.newFile,
                precondition: files_1.$Sdb,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.equals('view', files_1.$Ndb),
                    order: 10
                }
            });
        }
        run(accessor) {
            const commandService = accessor.get(commands_1.$Fr);
            commandService.executeCommand(fileActions_1.$GHb);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.files.action.createFolderFromExplorer',
                title: nls.localize(2, null),
                f1: false,
                icon: codicons_1.$Pj.newFolder,
                precondition: files_1.$Sdb,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.equals('view', files_1.$Ndb),
                    order: 20
                }
            });
        }
        run(accessor) {
            const commandService = accessor.get(commands_1.$Fr);
            commandService.executeCommand(fileActions_1.$IHb);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.files.action.refreshFilesExplorer',
                title: { value: nls.localize(3, null), original: 'Refresh Explorer' },
                f1: true,
                icon: codicons_1.$Pj.refresh,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.equals('view', files_1.$Ndb),
                    order: 30
                }
            });
        }
        async run(accessor) {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            const explorerService = accessor.get(files_3.$xHb);
            await paneCompositeService.openPaneComposite(files_1.$Mdb, 0 /* ViewContainerLocation.Sidebar */);
            await explorerService.refresh();
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.files.action.collapseExplorerFolders',
                title: { value: nls.localize(4, null), original: 'Collapse Folders in Explorer' },
                f1: true,
                icon: codicons_1.$Pj.collapseAll,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.equals('view', files_1.$Ndb),
                    order: 40
                }
            });
        }
        run(accessor) {
            const viewsService = accessor.get(views_1.$$E);
            const view = viewsService.getViewWithId(files_1.$Ndb);
            if (view !== null) {
                const explorerView = view;
                explorerView.collapseAll();
            }
        }
    });
});
//# sourceMappingURL=explorerView.js.map