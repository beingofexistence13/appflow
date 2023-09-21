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
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/loadedScriptsView", "vs/base/common/path", "vs/workbench/browser/parts/views/viewPane", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/workbench/contrib/debug/common/debug", "vs/platform/workspace/common/workspace", "vs/platform/contextkey/common/contextkey", "vs/base/common/labels", "vs/base/common/platform", "vs/base/common/uri", "vs/base/common/strings", "vs/base/common/async", "vs/workbench/browser/labels", "vs/platform/files/common/files", "vs/workbench/services/editor/common/editorService", "vs/platform/list/browser/listService", "vs/base/common/lifecycle", "vs/base/common/filters", "vs/workbench/contrib/debug/common/debugContentProvider", "vs/platform/label/common/label", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/path/common/pathService", "vs/base/browser/ui/tree/abstractTree"], function (require, exports, nls, path_1, viewPane_1, contextView_1, keybinding_1, instantiation_1, configuration_1, baseDebugView_1, debug_1, workspace_1, contextkey_1, labels_1, platform_1, uri_1, strings_1, async_1, labels_2, files_1, editorService_1, listService_1, lifecycle_1, filters_1, debugContentProvider_1, label_1, views_1, opener_1, themeService_1, telemetry_1, pathService_1, abstractTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5Rb = void 0;
    const NEW_STYLE_COMPRESS = true;
    // RFC 2396, Appendix A: https://www.ietf.org/rfc/rfc2396.txt
    const URI_SCHEMA_PATTERN = /^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/;
    class BaseTreeItem {
        constructor(h, j, isIncompressible = false) {
            this.h = h;
            this.j = j;
            this.isIncompressible = isIncompressible;
            this.d = new Map();
            this.c = false;
        }
        updateLabel(label) {
            this.j = label;
        }
        isLeaf() {
            return this.d.size === 0;
        }
        getSession() {
            if (this.h) {
                return this.h.getSession();
            }
            return undefined;
        }
        setSource(session, source) {
            this.g = source;
            this.d.clear();
            if (source.raw && source.raw.sources) {
                for (const src of source.raw.sources) {
                    if (src.name && src.path) {
                        const s = new BaseTreeItem(this, src.name);
                        this.d.set(src.path, s);
                        const ss = session.getSource(src);
                        s.setSource(session, ss);
                    }
                }
            }
        }
        createIfNeeded(key, factory) {
            let child = this.d.get(key);
            if (!child) {
                child = factory(this, key);
                this.d.set(key, child);
            }
            return child;
        }
        getChild(key) {
            return this.d.get(key);
        }
        remove(key) {
            this.d.delete(key);
        }
        removeFromParent() {
            if (this.h) {
                this.h.remove(this.j);
                if (this.h.d.size === 0) {
                    this.h.removeFromParent();
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
            return this.j;
        }
        // skips intermediate single-child nodes
        getParent() {
            if (this.h) {
                if (this.h.isSkipped()) {
                    return this.h.getParent();
                }
                return this.h;
            }
            return undefined;
        }
        isSkipped() {
            if (this.h) {
                if (this.h.m()) {
                    return true; // skipped if I'm the only child of my parents
                }
                return false;
            }
            return true; // roots are never skipped
        }
        // skips intermediate single-child nodes
        hasChildren() {
            const child = this.m();
            if (child) {
                return child.hasChildren();
            }
            return this.d.size > 0;
        }
        // skips intermediate single-child nodes
        getChildren() {
            const child = this.m();
            if (child) {
                return child.getChildren();
            }
            const array = [];
            for (const child of this.d.values()) {
                array.push(child);
            }
            return array.sort((a, b) => this.k(a, b));
        }
        // skips intermediate single-child nodes
        getLabel(separateRootFolder = true) {
            const child = this.m();
            if (child) {
                const sep = (this instanceof RootFolderTreeItem && separateRootFolder) ? ' • ' : path_1.$6d.sep;
                return `${this.j}${sep}${child.getLabel()}`;
            }
            return this.j;
        }
        // skips intermediate single-child nodes
        getHoverLabel() {
            if (this.g && this.h && this.h.g) {
                return this.g.raw.path || this.g.raw.name;
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
            const child = this.m();
            if (child) {
                return child.getSource();
            }
            return this.g;
        }
        k(a, b) {
            if (a.j && b.j) {
                return a.j.localeCompare(b.j);
            }
            return 0;
        }
        m() {
            if (!this.g && !this.c && this.n()) {
                if (this.d.size === 1) {
                    return this.d.values().next().value;
                }
                // if a node had more than one child once, it will never be skipped again
                if (this.d.size > 1) {
                    this.c = true;
                }
            }
            return undefined;
        }
        n() {
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
        constructor(o, p, q) {
            super(undefined, 'Root');
            this.o = o;
            this.p = p;
            this.q = q;
        }
        add(session) {
            return this.createIfNeeded(session.getId(), () => new SessionTreeItem(this.q, this, session, this.o, this.p));
        }
        find(session) {
            return this.getChild(session.getId());
        }
    }
    class SessionTreeItem extends BaseTreeItem {
        static { this.o = /^(https?:\/\/[^/]+)(\/.*)$/; }
        constructor(labelService, parent, session, t, u) {
            super(parent, session.getLabel(), true);
            this.t = t;
            this.u = u;
            this.q = new Map();
            this.r = labelService;
            this.p = session;
        }
        getInternalId() {
            return this.p.getId();
        }
        getSession() {
            return this.p;
        }
        getHoverLabel() {
            return undefined;
        }
        hasChildren() {
            return true;
        }
        k(a, b) {
            const acat = this.w(a);
            const bcat = this.w(b);
            if (acat !== bcat) {
                return acat - bcat;
            }
            return super.k(a, b);
        }
        w(item) {
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
            if (this.r && URI_SCHEMA_PATTERN.test(path)) {
                path = this.r.getUriLabel(uri_1.URI.parse(path));
            }
            const match = SessionTreeItem.o.exec(path);
            if (match && match.length === 3) {
                url = match[1];
                path = decodeURI(match[2]);
            }
            else {
                if ((0, path_1.$8d)(path)) {
                    const resource = uri_1.URI.file(path);
                    // return early if we can resolve a relative path label from the root folder
                    folder = this.u ? this.u.getWorkspaceFolder(resource) : null;
                    if (folder) {
                        // strip off the root folder path
                        path = (0, path_1.$7d)((0, strings_1.$ue)(resource.path.substring(folder.uri.path.length), path_1.$6d.sep));
                        const hasMultipleRoots = this.u.getWorkspace().folders.length > 1;
                        if (hasMultipleRoots) {
                            path = path_1.$6d.sep + path;
                        }
                        else {
                            // don't show root folder
                            folder = null;
                        }
                    }
                    else {
                        // on unix try to tildify absolute paths
                        path = (0, path_1.$7d)(path);
                        if (platform_1.$i) {
                            path = (0, labels_1.$fA)(path);
                        }
                        else {
                            path = (0, labels_1.$gA)(path, (await this.t.userHome()).fsPath);
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
            leaf.setSource(this.p, source);
            if (source.raw.path) {
                this.q.set(source.raw.path, leaf);
            }
        }
        removePath(source) {
            if (source.raw.path) {
                const leaf = this.q.get(source.raw.path);
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
    let $5Rb = class $5Rb extends viewPane_1.$Ieb {
        constructor(options, contextMenuService, keybindingService, instantiationService, viewDescriptorService, configurationService, t, contextKeyService, L, ab, sb, Wb, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.t = t;
            this.L = L;
            this.ab = ab;
            this.sb = sb;
            this.Wb = Wb;
            this.n = false;
            this.g = debug_1.$RG.bindTo(contextKeyService);
        }
        U(container) {
            super.U(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-loaded-scripts');
            container.classList.add('show-file-icons');
            this.c = (0, baseDebugView_1.$0Pb)(container);
            this.r = new LoadedScriptsFilter();
            const root = new RootTreeItem(this.Wb, this.L, this.sb);
            this.j = this.Bb.createInstance(labels_2.$Llb, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this.B(this.j);
            this.h = this.Bb.createInstance(listService_1.$u4, 'LoadedScriptsView', this.c, new LoadedScriptsDelegate(), [new LoadedScriptsRenderer(this.j)], {
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
                filter: this.r,
                accessibilityProvider: new LoadedSciptsAccessibilityProvider(),
                overrideStyles: {
                    listBackground: this.Rb()
                }
            });
            const updateView = (viewState) => this.h.setChildren(null, asTreeElement(root, viewState).children);
            updateView();
            this.m = new async_1.$Sg(() => {
                this.n = false;
                if (this.h) {
                    updateView();
                }
            }, 300);
            this.B(this.m);
            this.B(this.h.onDidOpen(e => {
                if (e.element instanceof BaseTreeItem) {
                    const source = e.element.getSource();
                    if (source && source.available) {
                        const nullRange = { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 };
                        source.openInEditor(this.t, nullRange, e.editorOptions.preserveFocus, e.sideBySide, e.editorOptions.pinned);
                    }
                }
            }));
            this.B(this.h.onDidChangeFocus(() => {
                const focus = this.h.getFocus();
                if (focus instanceof SessionTreeItem) {
                    this.g.set('session');
                }
                else {
                    this.g.reset();
                }
            }));
            const scheduleRefreshOnVisible = () => {
                if (this.isBodyVisible()) {
                    this.m.schedule();
                }
                else {
                    this.n = true;
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
                this.B(session.onDidChangeName(async () => {
                    const sessionRoot = root.find(session);
                    if (sessionRoot) {
                        sessionRoot.updateLabel(session.getLabel());
                        scheduleRefreshOnVisible();
                    }
                }));
                this.B(session.onDidLoadedSource(async (event) => {
                    let sessionRoot;
                    switch (event.reason) {
                        case 'new':
                        case 'changed':
                            sessionRoot = root.add(session);
                            await sessionRoot.addPath(event.source);
                            scheduleRefreshOnVisible();
                            if (event.reason === 'changed') {
                                debugContentProvider_1.$4Rb.refreshDebugContent(event.source.uri);
                            }
                            break;
                        case 'removed':
                            sessionRoot = root.find(session);
                            if (sessionRoot && sessionRoot.removePath(event.source)) {
                                scheduleRefreshOnVisible();
                            }
                            break;
                        default:
                            this.r.setFilter(event.source.name);
                            this.h.refilter();
                            break;
                    }
                }));
            };
            this.B(this.ab.onDidNewSession(registerSessionListeners));
            this.ab.getModel().getSessions().forEach(registerSessionListeners);
            this.B(this.ab.onDidEndSession(session => {
                root.remove(session.getId());
                this.m.schedule();
            }));
            this.m.schedule(0);
            this.B(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.n) {
                    this.m.schedule();
                }
            }));
            // feature: expand all nodes when filtering (not when finding)
            let viewState;
            this.B(this.h.onDidChangeFindPattern(pattern => {
                if (this.h.findMode === abstractTree_1.TreeFindMode.Highlight) {
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
                    visit(this.h.getNode());
                    viewState = { expanded };
                    this.h.expandAll();
                }
                else if (!pattern && viewState) {
                    this.h.setFocus([]);
                    updateView(viewState);
                    viewState = undefined;
                }
            }));
            // populate tree model with source paths from all debug sessions
            this.ab.getModel().getSessions().forEach(session => addSourcePathsToSession(session));
        }
        W(height, width) {
            super.W(height, width);
            this.h.layout(height, width);
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.h);
            (0, lifecycle_1.$fc)(this.j);
            super.dispose();
        }
    };
    exports.$5Rb = $5Rb;
    exports.$5Rb = $5Rb = __decorate([
        __param(1, contextView_1.$WZ),
        __param(2, keybinding_1.$2D),
        __param(3, instantiation_1.$Ah),
        __param(4, views_1.$_E),
        __param(5, configuration_1.$8h),
        __param(6, editorService_1.$9C),
        __param(7, contextkey_1.$3i),
        __param(8, workspace_1.$Kh),
        __param(9, debug_1.$nH),
        __param(10, label_1.$Vz),
        __param(11, pathService_1.$yJ),
        __param(12, opener_1.$NT),
        __param(13, themeService_1.$gv),
        __param(14, telemetry_1.$9k)
    ], $5Rb);
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
        constructor(c) {
            this.c = c;
        }
        get templateId() {
            return LoadedScriptsRenderer.ID;
        }
        renderTemplate(container) {
            const label = this.c.create(container, { supportHighlights: true });
            return { label };
        }
        renderElement(node, index, data) {
            const element = node.element;
            const label = element.getLabel();
            this.d(element, label, data, node.filterData);
        }
        renderCompressedElements(node, index, data, height) {
            const element = node.element.elements[node.element.elements.length - 1];
            const labels = node.element.elements.map(e => e.getLabel());
            this.d(element, labels, data, node.filterData);
        }
        d(element, labels, data, filterData) {
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
                options.title = nls.localize(0, null);
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
            options.matches = (0, filters_1.$Hj)(filterData);
            data.label.setResource(label, options);
        }
        disposeTemplate(templateData) {
            templateData.label.dispose();
        }
    }
    class LoadedSciptsAccessibilityProvider {
        getWidgetAriaLabel() {
            return nls.localize(1, null);
        }
        getAriaLabel(element) {
            if (element instanceof RootFolderTreeItem) {
                return nls.localize(2, null, element.getLabel());
            }
            if (element instanceof SessionTreeItem) {
                return nls.localize(3, null, element.getLabel());
            }
            if (element.hasChildren()) {
                return nls.localize(4, null, element.getLabel());
            }
            else {
                return nls.localize(5, null, element.getLabel());
            }
        }
    }
    class LoadedScriptsFilter {
        setFilter(filterText) {
            this.c = filterText;
        }
        filter(element, parentVisibility) {
            if (!this.c) {
                return 1 /* TreeVisibility.Visible */;
            }
            if (element.isLeaf()) {
                const name = element.getLabel();
                if (name.indexOf(this.c) >= 0) {
                    return 1 /* TreeVisibility.Visible */;
                }
                return 0 /* TreeVisibility.Hidden */;
            }
            return 2 /* TreeVisibility.Recurse */;
        }
    }
});
//# sourceMappingURL=loadedScriptsView.js.map