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
define(["require", "exports", "vs/nls", "vs/base/common/path", "vs/workbench/browser/parts/views/viewPane", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/workbench/contrib/debug/common/debug", "vs/platform/workspace/common/workspace", "vs/platform/contextkey/common/contextkey", "vs/base/common/labels", "vs/base/common/platform", "vs/base/common/uri", "vs/base/common/strings", "vs/base/common/async", "vs/workbench/browser/labels", "vs/platform/files/common/files", "vs/workbench/services/editor/common/editorService", "vs/platform/list/browser/listService", "vs/base/common/lifecycle", "vs/base/common/filters", "vs/workbench/contrib/debug/common/debugContentProvider", "vs/platform/label/common/label", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/path/common/pathService", "vs/base/browser/ui/tree/abstractTree"], function (require, exports, nls, path_1, viewPane_1, contextView_1, keybinding_1, instantiation_1, configuration_1, baseDebugView_1, debug_1, workspace_1, contextkey_1, labels_1, platform_1, uri_1, strings_1, async_1, labels_2, files_1, editorService_1, listService_1, lifecycle_1, filters_1, debugContentProvider_1, label_1, views_1, opener_1, themeService_1, telemetry_1, pathService_1, abstractTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LoadedScriptsView = void 0;
    const NEW_STYLE_COMPRESS = true;
    // RFC 2396, Appendix A: https://www.ietf.org/rfc/rfc2396.txt
    const URI_SCHEMA_PATTERN = /^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/;
    class BaseTreeItem {
        constructor(_parent, _label, isIncompressible = false) {
            this._parent = _parent;
            this._label = _label;
            this.isIncompressible = isIncompressible;
            this._children = new Map();
            this._showedMoreThanOne = false;
        }
        updateLabel(label) {
            this._label = label;
        }
        isLeaf() {
            return this._children.size === 0;
        }
        getSession() {
            if (this._parent) {
                return this._parent.getSession();
            }
            return undefined;
        }
        setSource(session, source) {
            this._source = source;
            this._children.clear();
            if (source.raw && source.raw.sources) {
                for (const src of source.raw.sources) {
                    if (src.name && src.path) {
                        const s = new BaseTreeItem(this, src.name);
                        this._children.set(src.path, s);
                        const ss = session.getSource(src);
                        s.setSource(session, ss);
                    }
                }
            }
        }
        createIfNeeded(key, factory) {
            let child = this._children.get(key);
            if (!child) {
                child = factory(this, key);
                this._children.set(key, child);
            }
            return child;
        }
        getChild(key) {
            return this._children.get(key);
        }
        remove(key) {
            this._children.delete(key);
        }
        removeFromParent() {
            if (this._parent) {
                this._parent.remove(this._label);
                if (this._parent._children.size === 0) {
                    this._parent.removeFromParent();
                }
            }
        }
        getTemplateId() {
            return 'id';
        }
        // a dynamic ID based on the parent chain; required for reparenting (see #55448)
        getId() {
            const parent = this.getParent();
            return parent ? `${parent.getId()}/${this.getInternalId()}` : this.getInternalId();
        }
        getInternalId() {
            return this._label;
        }
        // skips intermediate single-child nodes
        getParent() {
            if (this._parent) {
                if (this._parent.isSkipped()) {
                    return this._parent.getParent();
                }
                return this._parent;
            }
            return undefined;
        }
        isSkipped() {
            if (this._parent) {
                if (this._parent.oneChild()) {
                    return true; // skipped if I'm the only child of my parents
                }
                return false;
            }
            return true; // roots are never skipped
        }
        // skips intermediate single-child nodes
        hasChildren() {
            const child = this.oneChild();
            if (child) {
                return child.hasChildren();
            }
            return this._children.size > 0;
        }
        // skips intermediate single-child nodes
        getChildren() {
            const child = this.oneChild();
            if (child) {
                return child.getChildren();
            }
            const array = [];
            for (const child of this._children.values()) {
                array.push(child);
            }
            return array.sort((a, b) => this.compare(a, b));
        }
        // skips intermediate single-child nodes
        getLabel(separateRootFolder = true) {
            const child = this.oneChild();
            if (child) {
                const sep = (this instanceof RootFolderTreeItem && separateRootFolder) ? ' • ' : path_1.posix.sep;
                return `${this._label}${sep}${child.getLabel()}`;
            }
            return this._label;
        }
        // skips intermediate single-child nodes
        getHoverLabel() {
            if (this._source && this._parent && this._parent._source) {
                return this._source.raw.path || this._source.raw.name;
            }
            const label = this.getLabel(false);
            const parent = this.getParent();
            if (parent) {
                const hover = parent.getHoverLabel();
                if (hover) {
                    return `${hover}/${label}`;
                }
            }
            return label;
        }
        // skips intermediate single-child nodes
        getSource() {
            const child = this.oneChild();
            if (child) {
                return child.getSource();
            }
            return this._source;
        }
        compare(a, b) {
            if (a._label && b._label) {
                return a._label.localeCompare(b._label);
            }
            return 0;
        }
        oneChild() {
            if (!this._source && !this._showedMoreThanOne && this.skipOneChild()) {
                if (this._children.size === 1) {
                    return this._children.values().next().value;
                }
                // if a node had more than one child once, it will never be skipped again
                if (this._children.size > 1) {
                    this._showedMoreThanOne = true;
                }
            }
            return undefined;
        }
        skipOneChild() {
            if (NEW_STYLE_COMPRESS) {
                // if the root node has only one Session, don't show the session
                return this instanceof RootTreeItem;
            }
            else {
                return !(this instanceof RootFolderTreeItem) && !(this instanceof SessionTreeItem);
            }
        }
    }
    class RootFolderTreeItem extends BaseTreeItem {
        constructor(parent, folder) {
            super(parent, folder.name, true);
            this.folder = folder;
        }
    }
    class RootTreeItem extends BaseTreeItem {
        constructor(_pathService, _contextService, _labelService) {
            super(undefined, 'Root');
            this._pathService = _pathService;
            this._contextService = _contextService;
            this._labelService = _labelService;
        }
        add(session) {
            return this.createIfNeeded(session.getId(), () => new SessionTreeItem(this._labelService, this, session, this._pathService, this._contextService));
        }
        find(session) {
            return this.getChild(session.getId());
        }
    }
    class SessionTreeItem extends BaseTreeItem {
        static { this.URL_REGEXP = /^(https?:\/\/[^/]+)(\/.*)$/; }
        constructor(labelService, parent, session, _pathService, rootProvider) {
            super(parent, session.getLabel(), true);
            this._pathService = _pathService;
            this.rootProvider = rootProvider;
            this._map = new Map();
            this._labelService = labelService;
            this._session = session;
        }
        getInternalId() {
            return this._session.getId();
        }
        getSession() {
            return this._session;
        }
        getHoverLabel() {
            return undefined;
        }
        hasChildren() {
            return true;
        }
        compare(a, b) {
            const acat = this.category(a);
            const bcat = this.category(b);
            if (acat !== bcat) {
                return acat - bcat;
            }
            return super.compare(a, b);
        }
        category(item) {
            // workspace scripts come at the beginning in "folder" order
            if (item instanceof RootFolderTreeItem) {
                return item.folder.index;
            }
            // <...> come at the very end
            const l = item.getLabel();
            if (l && /^<.+>$/.test(l)) {
                return 1000;
            }
            // everything else in between
            return 999;
        }
        async addPath(source) {
            let folder;
            let url;
            let path = source.raw.path;
            if (!path) {
                return;
            }
            if (this._labelService && URI_SCHEMA_PATTERN.test(path)) {
                path = this._labelService.getUriLabel(uri_1.URI.parse(path));
            }
            const match = SessionTreeItem.URL_REGEXP.exec(path);
            if (match && match.length === 3) {
                url = match[1];
                path = decodeURI(match[2]);
            }
            else {
                if ((0, path_1.isAbsolute)(path)) {
                    const resource = uri_1.URI.file(path);
                    // return early if we can resolve a relative path label from the root folder
                    folder = this.rootProvider ? this.rootProvider.getWorkspaceFolder(resource) : null;
                    if (folder) {
                        // strip off the root folder path
                        path = (0, path_1.normalize)((0, strings_1.ltrim)(resource.path.substring(folder.uri.path.length), path_1.posix.sep));
                        const hasMultipleRoots = this.rootProvider.getWorkspace().folders.length > 1;
                        if (hasMultipleRoots) {
                            path = path_1.posix.sep + path;
                        }
                        else {
                            // don't show root folder
                            folder = null;
                        }
                    }
                    else {
                        // on unix try to tildify absolute paths
                        path = (0, path_1.normalize)(path);
                        if (platform_1.isWindows) {
                            path = (0, labels_1.normalizeDriveLetter)(path);
                        }
                        else {
                            path = (0, labels_1.tildify)(path, (await this._pathService.userHome()).fsPath);
                        }
                    }
                }
            }
            let leaf = this;
            path.split(/[\/\\]/).forEach((segment, i) => {
                if (i === 0 && folder) {
                    const f = folder;
                    leaf = leaf.createIfNeeded(folder.name, parent => new RootFolderTreeItem(parent, f));
                }
                else if (i === 0 && url) {
                    leaf = leaf.createIfNeeded(url, parent => new BaseTreeItem(parent, url));
                }
                else {
                    leaf = leaf.createIfNeeded(segment, parent => new BaseTreeItem(parent, segment));
                }
            });
            leaf.setSource(this._session, source);
            if (source.raw.path) {
                this._map.set(source.raw.path, leaf);
            }
        }
        removePath(source) {
            if (source.raw.path) {
                const leaf = this._map.get(source.raw.path);
                if (leaf) {
                    leaf.removeFromParent();
                    return true;
                }
            }
            return false;
        }
    }
    /**
     * This maps a model item into a view model item.
     */
    function asTreeElement(item, viewState) {
        const children = item.getChildren();
        const collapsed = viewState ? !viewState.expanded.has(item.getId()) : !(item instanceof SessionTreeItem);
        return {
            element: item,
            collapsed,
            collapsible: item.hasChildren(),
            children: children.map(i => asTreeElement(i, viewState))
        };
    }
    let LoadedScriptsView = class LoadedScriptsView extends viewPane_1.ViewPane {
        constructor(options, contextMenuService, keybindingService, instantiationService, viewDescriptorService, configurationService, editorService, contextKeyService, contextService, debugService, labelService, pathService, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.editorService = editorService;
            this.contextService = contextService;
            this.debugService = debugService;
            this.labelService = labelService;
            this.pathService = pathService;
            this.treeNeedsRefreshOnVisible = false;
            this.loadedScriptsItemType = debug_1.CONTEXT_LOADED_SCRIPTS_ITEM_TYPE.bindTo(contextKeyService);
        }
        renderBody(container) {
            super.renderBody(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-loaded-scripts');
            container.classList.add('show-file-icons');
            this.treeContainer = (0, baseDebugView_1.renderViewTree)(container);
            this.filter = new LoadedScriptsFilter();
            const root = new RootTreeItem(this.pathService, this.contextService, this.labelService);
            this.treeLabels = this.instantiationService.createInstance(labels_2.ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this._register(this.treeLabels);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchCompressibleObjectTree, 'LoadedScriptsView', this.treeContainer, new LoadedScriptsDelegate(), [new LoadedScriptsRenderer(this.treeLabels)], {
                compressionEnabled: NEW_STYLE_COMPRESS,
                collapseByDefault: true,
                hideTwistiesOfChildlessElements: true,
                identityProvider: {
                    getId: (element) => element.getId()
                },
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (element) => {
                        return element.getLabel();
                    },
                    getCompressedNodeKeyboardNavigationLabel: (elements) => {
                        return elements.map(e => e.getLabel()).join('/');
                    }
                },
                filter: this.filter,
                accessibilityProvider: new LoadedSciptsAccessibilityProvider(),
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                }
            });
            const updateView = (viewState) => this.tree.setChildren(null, asTreeElement(root, viewState).children);
            updateView();
            this.changeScheduler = new async_1.RunOnceScheduler(() => {
                this.treeNeedsRefreshOnVisible = false;
                if (this.tree) {
                    updateView();
                }
            }, 300);
            this._register(this.changeScheduler);
            this._register(this.tree.onDidOpen(e => {
                if (e.element instanceof BaseTreeItem) {
                    const source = e.element.getSource();
                    if (source && source.available) {
                        const nullRange = { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 };
                        source.openInEditor(this.editorService, nullRange, e.editorOptions.preserveFocus, e.sideBySide, e.editorOptions.pinned);
                    }
                }
            }));
            this._register(this.tree.onDidChangeFocus(() => {
                const focus = this.tree.getFocus();
                if (focus instanceof SessionTreeItem) {
                    this.loadedScriptsItemType.set('session');
                }
                else {
                    this.loadedScriptsItemType.reset();
                }
            }));
            const scheduleRefreshOnVisible = () => {
                if (this.isBodyVisible()) {
                    this.changeScheduler.schedule();
                }
                else {
                    this.treeNeedsRefreshOnVisible = true;
                }
            };
            const addSourcePathsToSession = async (session) => {
                if (session.capabilities.supportsLoadedSourcesRequest) {
                    const sessionNode = root.add(session);
                    const paths = await session.getLoadedSources();
                    for (const path of paths) {
                        await sessionNode.addPath(path);
                    }
                    scheduleRefreshOnVisible();
                }
            };
            const registerSessionListeners = (session) => {
                this._register(session.onDidChangeName(async () => {
                    const sessionRoot = root.find(session);
                    if (sessionRoot) {
                        sessionRoot.updateLabel(session.getLabel());
                        scheduleRefreshOnVisible();
                    }
                }));
                this._register(session.onDidLoadedSource(async (event) => {
                    let sessionRoot;
                    switch (event.reason) {
                        case 'new':
                        case 'changed':
                            sessionRoot = root.add(session);
                            await sessionRoot.addPath(event.source);
                            scheduleRefreshOnVisible();
                            if (event.reason === 'changed') {
                                debugContentProvider_1.DebugContentProvider.refreshDebugContent(event.source.uri);
                            }
                            break;
                        case 'removed':
                            sessionRoot = root.find(session);
                            if (sessionRoot && sessionRoot.removePath(event.source)) {
                                scheduleRefreshOnVisible();
                            }
                            break;
                        default:
                            this.filter.setFilter(event.source.name);
                            this.tree.refilter();
                            break;
                    }
                }));
            };
            this._register(this.debugService.onDidNewSession(registerSessionListeners));
            this.debugService.getModel().getSessions().forEach(registerSessionListeners);
            this._register(this.debugService.onDidEndSession(session => {
                root.remove(session.getId());
                this.changeScheduler.schedule();
            }));
            this.changeScheduler.schedule(0);
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.treeNeedsRefreshOnVisible) {
                    this.changeScheduler.schedule();
                }
            }));
            // feature: expand all nodes when filtering (not when finding)
            let viewState;
            this._register(this.tree.onDidChangeFindPattern(pattern => {
                if (this.tree.findMode === abstractTree_1.TreeFindMode.Highlight) {
                    return;
                }
                if (!viewState && pattern) {
                    const expanded = new Set();
                    const visit = (node) => {
                        if (node.element && !node.collapsed) {
                            expanded.add(node.element.getId());
                        }
                        for (const child of node.children) {
                            visit(child);
                        }
                    };
                    visit(this.tree.getNode());
                    viewState = { expanded };
                    this.tree.expandAll();
                }
                else if (!pattern && viewState) {
                    this.tree.setFocus([]);
                    updateView(viewState);
                    viewState = undefined;
                }
            }));
            // populate tree model with source paths from all debug sessions
            this.debugService.getModel().getSessions().forEach(session => addSourcePathsToSession(session));
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.tree.layout(height, width);
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.tree);
            (0, lifecycle_1.dispose)(this.treeLabels);
            super.dispose();
        }
    };
    exports.LoadedScriptsView = LoadedScriptsView;
    exports.LoadedScriptsView = LoadedScriptsView = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, views_1.IViewDescriptorService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, editorService_1.IEditorService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, debug_1.IDebugService),
        __param(10, label_1.ILabelService),
        __param(11, pathService_1.IPathService),
        __param(12, opener_1.IOpenerService),
        __param(13, themeService_1.IThemeService),
        __param(14, telemetry_1.ITelemetryService)
    ], LoadedScriptsView);
    class LoadedScriptsDelegate {
        getHeight(element) {
            return 22;
        }
        getTemplateId(element) {
            return LoadedScriptsRenderer.ID;
        }
    }
    class LoadedScriptsRenderer {
        static { this.ID = 'lsrenderer'; }
        constructor(labels) {
            this.labels = labels;
        }
        get templateId() {
            return LoadedScriptsRenderer.ID;
        }
        renderTemplate(container) {
            const label = this.labels.create(container, { supportHighlights: true });
            return { label };
        }
        renderElement(node, index, data) {
            const element = node.element;
            const label = element.getLabel();
            this.render(element, label, data, node.filterData);
        }
        renderCompressedElements(node, index, data, height) {
            const element = node.element.elements[node.element.elements.length - 1];
            const labels = node.element.elements.map(e => e.getLabel());
            this.render(element, labels, data, node.filterData);
        }
        render(element, labels, data, filterData) {
            const label = {
                name: labels
            };
            const options = {
                title: element.getHoverLabel()
            };
            if (element instanceof RootFolderTreeItem) {
                options.fileKind = files_1.FileKind.ROOT_FOLDER;
            }
            else if (element instanceof SessionTreeItem) {
                options.title = nls.localize('loadedScriptsSession', "Debug Session");
                options.hideIcon = true;
            }
            else if (element instanceof BaseTreeItem) {
                const src = element.getSource();
                if (src && src.uri) {
                    label.resource = src.uri;
                    options.fileKind = files_1.FileKind.FILE;
                }
                else {
                    options.fileKind = files_1.FileKind.FOLDER;
                }
            }
            options.matches = (0, filters_1.createMatches)(filterData);
            data.label.setResource(label, options);
        }
        disposeTemplate(templateData) {
            templateData.label.dispose();
        }
    }
    class LoadedSciptsAccessibilityProvider {
        getWidgetAriaLabel() {
            return nls.localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'loadedScriptsAriaLabel' }, "Debug Loaded Scripts");
        }
        getAriaLabel(element) {
            if (element instanceof RootFolderTreeItem) {
                return nls.localize('loadedScriptsRootFolderAriaLabel', "Workspace folder {0}, loaded script, debug", element.getLabel());
            }
            if (element instanceof SessionTreeItem) {
                return nls.localize('loadedScriptsSessionAriaLabel', "Session {0}, loaded script, debug", element.getLabel());
            }
            if (element.hasChildren()) {
                return nls.localize('loadedScriptsFolderAriaLabel', "Folder {0}, loaded script, debug", element.getLabel());
            }
            else {
                return nls.localize('loadedScriptsSourceAriaLabel', "{0}, loaded script, debug", element.getLabel());
            }
        }
    }
    class LoadedScriptsFilter {
        setFilter(filterText) {
            this.filterText = filterText;
        }
        filter(element, parentVisibility) {
            if (!this.filterText) {
                return 1 /* TreeVisibility.Visible */;
            }
            if (element.isLeaf()) {
                const name = element.getLabel();
                if (name.indexOf(this.filterText) >= 0) {
                    return 1 /* TreeVisibility.Visible */;
                }
                return 0 /* TreeVisibility.Hidden */;
            }
            return 2 /* TreeVisibility.Recurse */;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVkU2NyaXB0c1ZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2xvYWRlZFNjcmlwdHNWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXdDaEcsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUM7SUFFaEMsNkRBQTZEO0lBQzdELE1BQU0sa0JBQWtCLEdBQUcsOEJBQThCLENBQUM7SUFJMUQsTUFBTSxZQUFZO1FBTWpCLFlBQW9CLE9BQWlDLEVBQVUsTUFBYyxFQUFrQixtQkFBbUIsS0FBSztZQUFuRyxZQUFPLEdBQVAsT0FBTyxDQUEwQjtZQUFVLFdBQU0sR0FBTixNQUFNLENBQVE7WUFBa0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFRO1lBSC9HLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztZQUluRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxXQUFXLENBQUMsS0FBYTtZQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNyQixDQUFDO1FBRUQsTUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFRCxVQUFVO1lBQ1QsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDakM7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsU0FBUyxDQUFDLE9BQXNCLEVBQUUsTUFBYztZQUMvQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3ZCLElB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