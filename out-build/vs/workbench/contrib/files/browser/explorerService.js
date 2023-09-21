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
define(["require", "exports", "vs/base/common/event", "vs/platform/workspace/common/workspace", "vs/base/common/lifecycle", "vs/workbench/contrib/files/common/explorerModel", "vs/platform/files/common/files", "vs/base/common/resources", "vs/platform/configuration/common/configuration", "vs/platform/clipboard/common/clipboardService", "vs/workbench/services/editor/common/editorService", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/browser/services/bulkEditService", "vs/platform/undoRedo/common/undoRedo", "vs/platform/progress/common/progress", "vs/base/common/cancellation", "vs/base/common/async", "vs/workbench/services/host/browser/host", "vs/workbench/common/resources", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/telemetry/common/telemetry"], function (require, exports, event_1, workspace_1, lifecycle_1, explorerModel_1, files_1, resources_1, configuration_1, clipboardService_1, editorService_1, uriIdentity_1, bulkEditService_1, undoRedo_1, progress_1, cancellation_1, async_1, host_1, resources_2, filesConfigurationService_1, telemetry_1) {
    "use strict";
    var $8Lb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8Lb = exports.$7Lb = void 0;
    exports.$7Lb = new undoRedo_1.$zu();
    let $8Lb = class $8Lb {
        static { $8Lb_1 = this; }
        static { this.a = 500; } // delay in ms to react to file changes to give our internal events a chance to react first
        constructor(m, n, o, q, t, u, v, w, hostService, x, y) {
            this.m = m;
            this.n = n;
            this.o = o;
            this.q = q;
            this.t = t;
            this.u = u;
            this.v = v;
            this.w = w;
            this.x = x;
            this.y = y;
            this.b = new lifecycle_1.$jc();
            this.k = [];
            this.d = this.n.getValue('explorer');
            this.h = new explorerModel_1.$uHb(this.o, this.u, this.m, this.n, this.x);
            this.b.add(this.h);
            this.b.add(this.m.onDidRunOperation(e => this.z(e)));
            this.j = new async_1.$Sg(async () => {
                const events = this.k;
                this.k = [];
                // Filter to the ones we care
                const types = [2 /* FileChangeType.DELETED */];
                if (this.d.sortOrder === "modified" /* SortOrder.Modified */) {
                    types.push(0 /* FileChangeType.UPDATED */);
                }
                let shouldRefresh = false;
                // For DELETED and UPDATED events go through the explorer model and check if any of the items got affected
                this.roots.forEach(r => {
                    if (this.g && !shouldRefresh) {
                        shouldRefresh = doesFileEventAffect(r, this.g, events, types);
                    }
                });
                // For ADDED events we need to go through all the events and check if the explorer is already aware of some of them
                // Or if they affect not yet resolved parts of the explorer. If that is the case we will not refresh.
                events.forEach(e => {
                    if (!shouldRefresh) {
                        for (const resource of e.rawAdded) {
                            const parent = this.h.findClosest((0, resources_1.$hg)(resource));
                            // Parent of the added resource is resolved and the explorer model is not aware of the added resource - we need to refresh
                            if (parent && !parent.getChild((0, resources_1.$fg)(resource))) {
                                shouldRefresh = true;
                                break;
                            }
                        }
                    }
                });
                if (shouldRefresh) {
                    await this.refresh(false);
                }
            }, $8Lb_1.a);
            this.b.add(this.m.onDidFilesChange(e => {
                this.k.push(e);
                // Don't mess with the file tree while in the process of editing. #112293
                if (this.c) {
                    return;
                }
                if (!this.j.isScheduled()) {
                    this.j.schedule();
                }
            }));
            this.b.add(this.n.onDidChangeConfiguration(e => this.B(e)));
            this.b.add(event_1.Event.any(this.m.onDidChangeFileSystemProviderRegistrations, this.m.onDidChangeFileSystemProviderCapabilities)(async (e) => {
                let affected = false;
                this.h.roots.forEach(r => {
                    if (r.resource.scheme === e.scheme) {
                        affected = true;
                        r.forgetChildren();
                    }
                });
                if (affected) {
                    if (this.g) {
                        await this.g.setTreeInput();
                    }
                }
            }));
            this.b.add(this.h.onDidChangeRoots(() => {
                this.g?.setTreeInput();
            }));
            // Refresh explorer when window gets focus to compensate for missing file events #126817
            this.b.add(hostService.onDidChangeFocus(hasFocus => {
                if (hasFocus) {
                    this.refresh(false);
                }
            }));
            this.l = new resources_2.$wD((uri) => getRevealExcludes(n.getValue({ resource: uri })), (event) => event.affectsConfiguration('explorer.autoRevealExclude'), o, n);
            this.b.add(this.l);
        }
        get roots() {
            return this.h.roots;
        }
        get sortOrderConfiguration() {
            return {
                sortOrder: this.d.sortOrder,
                lexicographicOptions: this.d.sortOrderLexicographicOptions,
            };
        }
        registerView(contextProvider) {
            this.g = contextProvider;
        }
        getContext(respectMultiSelection, ignoreNestedChildren = false) {
            if (!this.g) {
                return [];
            }
            const items = new Set(this.g.getContext(respectMultiSelection));
            items.forEach(item => {
                try {
                    if (respectMultiSelection && !ignoreNestedChildren && this.g?.isItemCollapsed(item) && item.nestedChildren) {
                        for (const child of item.nestedChildren) {
                            items.add(child);
                        }
                    }
                }
                catch {
                    // We will error out trying to resolve collapsed nodes that have not yet been resolved.
                    // So we catch and ignore them in the multiSelect context
                    return;
                }
            });
            return [...items];
        }
        async applyBulkEdit(edit, options) {
            const cancellationTokenSource = new cancellation_1.$pd();
            const promise = this.w.withProgress({
                location: options.progressLocation || 10 /* ProgressLocation.Window */,
                title: options.progressLabel,
                cancellable: edit.length > 1,
                delay: 500,
            }, async (progress) => {
                await this.v.apply(edit, {
                    undoRedoSource: exports.$7Lb,
                    label: options.undoLabel,
                    code: 'undoredo.explorerOperation',
                    progress,
                    token: cancellationTokenSource.token,
                    confirmBeforeUndo: options.confirmBeforeUndo
                });
            }, () => cancellationTokenSource.cancel());
            await this.w.withProgress({ location: 1 /* ProgressLocation.Explorer */, delay: 500 }, () => promise);
            cancellationTokenSource.dispose();
        }
        hasViewFocus() {
            return !!this.g && this.g.hasFocus();
        }
        // IExplorerService methods
        findClosest(resource) {
            return this.h.findClosest(resource);
        }
        findClosestRoot(resource) {
            const parentRoots = this.h.roots.filter(r => this.u.extUri.isEqualOrParent(resource, r.resource))
                .sort((first, second) => second.resource.path.length - first.resource.path.length);
            return parentRoots.length ? parentRoots[0] : null;
        }
        async setEditable(stat, data) {
            if (!this.g) {
                return;
            }
            if (!data) {
                this.c = undefined;
            }
            else {
                this.c = { stat, data };
            }
            const isEditing = this.isEditable(stat);
            try {
                await this.g.setEditable(stat, isEditing);
            }
            catch {
                const parent = stat.parent;
                const errorData = {
                    parentIsDirectory: parent?.isDirectory,
                    isDirectory: stat.isDirectory,
                    isReadonly: !!stat.isReadonly,
                    parentIsReadonly: !!parent?.isReadonly,
                    parentIsExcluded: parent?.isExcluded,
                    isExcluded: stat.isExcluded,
                    parentIsRoot: parent?.isRoot,
                    isRoot: stat.isRoot,
                    parentHasNests: parent?.hasNests,
                    hasNests: stat.hasNests,
                };
                this.y.publicLogError2('explorerView.setEditableError', errorData);
                return;
            }
            if (!this.c && this.k.length && !this.j.isScheduled()) {
                this.j.schedule();
            }
        }
        async setToCopy(items, cut) {
            const previouslyCutItems = this.f;
            this.f = cut ? items : undefined;
            await this.q.writeResources(items.map(s => s.resource));
            this.g?.itemsCopied(items, cut, previouslyCutItems);
        }
        isCut(item) {
            return !!this.f && this.f.some(i => this.u.extUri.isEqual(i.resource, item.resource));
        }
        getEditable() {
            return this.c;
        }
        getEditableData(stat) {
            return this.c && this.c.stat === stat ? this.c.data : undefined;
        }
        isEditable(stat) {
            return !!this.c && (this.c.stat === stat || !stat);
        }
        async select(resource, reveal) {
            if (!this.g) {
                return;
            }
            // If file or parent matches exclude patterns, do not reveal unless reveal argument is 'force'
            const ignoreRevealExcludes = reveal === 'force';
            const fileStat = this.findClosest(resource);
            if (fileStat) {
                if (!this.A(fileStat, ignoreRevealExcludes)) {
                    return;
                }
                await this.g.selectResource(fileStat.resource, reveal);
                return Promise.resolve(undefined);
            }
            // Stat needs to be resolved first and then revealed
            const options = { resolveTo: [resource], resolveMetadata: this.d.sortOrder === "modified" /* SortOrder.Modified */ };
            const root = this.findClosestRoot(resource);
            if (!root) {
                return undefined;
            }
            try {
                const stat = await this.m.resolve(root.resource, options);
                // Convert to model
                const modelStat = explorerModel_1.$vHb.create(this.m, this.n, this.x, stat, undefined, options.resolveTo);
                // Update Input with disk Stat
                explorerModel_1.$vHb.mergeLocalWithDisk(modelStat, root);
                const item = root.find(resource);
                await this.g.refresh(true, root);
                // Once item is resolved, check again if folder should be expanded
                if (item && !this.A(item, ignoreRevealExcludes)) {
                    return;
                }
                await this.g.selectResource(item ? item.resource : undefined, reveal);
            }
            catch (error) {
                root.error = error;
                await this.g.refresh(false, root);
            }
        }
        async refresh(reveal = true) {
            this.h.roots.forEach(r => r.forgetChildren());
            if (this.g) {
                await this.g.refresh(true);
                const resource = this.t.activeEditor?.resource;
                const autoReveal = this.n.getValue().explorer.autoReveal;
                if (reveal && resource && autoReveal) {
                    // We did a top level refresh, reveal the active file #67118
                    this.select(resource, autoReveal);
                }
            }
        }
        // File events
        async z(e) {
            // When nesting, changes to one file in a folder may impact the rendered structure
            // of all the folder's immediate children, thus a recursive refresh is needed.
            // Ideally the tree would be able to recusively refresh just one level but that does not yet exist.
            const shouldDeepRefresh = this.d.fileNesting.enabled;
            // Add
            if (e.isOperation(0 /* FileOperation.CREATE */) || e.isOperation(3 /* FileOperation.COPY */)) {
                const addedElement = e.target;
                const parentResource = (0, resources_1.$hg)(addedElement.resource);
                const parents = this.h.findAll(parentResource);
                if (parents.length) {
                    // Add the new file to its parent (Model)
                    await Promise.all(parents.map(async (p) => {
                        // We have to check if the parent is resolved #29177
                        const resolveMetadata = this.d.sortOrder === `modified`;
                        if (!p.isDirectoryResolved) {
                            const stat = await this.m.resolve(p.resource, { resolveMetadata });
                            if (stat) {
                                const modelStat = explorerModel_1.$vHb.create(this.m, this.n, this.x, stat, p.parent);
                                explorerModel_1.$vHb.mergeLocalWithDisk(modelStat, p);
                            }
                        }
                        const childElement = explorerModel_1.$vHb.create(this.m, this.n, this.x, addedElement, p.parent);
                        // Make sure to remove any previous version of the file if any
                        p.removeChild(childElement);
                        p.addChild(childElement);
                        // Refresh the Parent (View)
                        await this.g?.refresh(shouldDeepRefresh, p);
                    }));
                }
            }
            // Move (including Rename)
            else if (e.isOperation(2 /* FileOperation.MOVE */)) {
                const oldResource = e.resource;
                const newElement = e.target;
                const oldParentResource = (0, resources_1.$hg)(oldResource);
                const newParentResource = (0, resources_1.$hg)(newElement.resource);
                const modelElements = this.h.findAll(oldResource);
                const sameParentMove = modelElements.every(e => !e.nestedParent) && this.u.extUri.isEqual(oldParentResource, newParentResource);
                // Handle Rename
                if (sameParentMove) {
                    await Promise.all(modelElements.map(async (modelElement) => {
                        // Rename File (Model)
                        modelElement.rename(newElement);
                        await this.g?.refresh(shouldDeepRefresh, modelElement.parent);
                    }));
                }
                // Handle Move
                else {
                    const newParents = this.h.findAll(newParentResource);
                    if (newParents.length && modelElements.length) {
                        // Move in Model
                        await Promise.all(modelElements.map(async (modelElement, index) => {
                            const oldParent = modelElement.parent;
                            const oldNestedParent = modelElement.nestedParent;
                            modelElement.move(newParents[index]);
                            if (oldNestedParent) {
                                await this.g?.refresh(false, oldNestedParent);
                            }
                            await this.g?.refresh(false, oldParent);
                            await this.g?.refresh(shouldDeepRefresh, newParents[index]);
                        }));
                    }
                }
            }
            // Delete
            else if (e.isOperation(1 /* FileOperation.DELETE */)) {
                const modelElements = this.h.findAll(e.resource);
                await Promise.all(modelElements.map(async (modelElement) => {
                    if (modelElement.parent) {
                        // Remove Element from Parent (Model)
                        const parent = modelElement.parent;
                        parent.removeChild(modelElement);
                        const oldNestedParent = modelElement.nestedParent;
                        if (oldNestedParent) {
                            oldNestedParent.removeChild(modelElement);
                            await this.g?.refresh(false, oldNestedParent);
                        }
                        // Refresh Parent (View)
                        await this.g?.refresh(shouldDeepRefresh, parent);
                    }
                }));
            }
        }
        // Check if an item matches a explorer.autoRevealExclude pattern
        A(item, ignore) {
            if (item === undefined || ignore) {
                return true;
            }
            if (this.l.matches(item.resource, name => !!(item.parent && item.parent.getChild(name)))) {
                return false;
            }
            const root = item.root;
            let currentItem = item.parent;
            while (currentItem !== root) {
                if (currentItem === undefined) {
                    return true;
                }
                if (this.l.matches(currentItem.resource)) {
                    return false;
                }
                currentItem = currentItem.parent;
            }
            return true;
        }
        async B(event) {
            if (!event.affectsConfiguration('explorer')) {
                return;
            }
            let shouldRefresh = false;
            if (event.affectsConfiguration('explorer.fileNesting')) {
                shouldRefresh = true;
            }
            const configuration = this.n.getValue();
            const configSortOrder = configuration?.explorer?.sortOrder || "default" /* SortOrder.Default */;
            if (this.d.sortOrder !== configSortOrder) {
                shouldRefresh = this.d.sortOrder !== undefined;
            }
            const configLexicographicOptions = configuration?.explorer?.sortOrderLexicographicOptions || "default" /* LexicographicOptions.Default */;
            if (this.d.sortOrderLexicographicOptions !== configLexicographicOptions) {
                shouldRefresh = shouldRefresh || this.d.sortOrderLexicographicOptions !== undefined;
            }
            this.d = configuration.explorer;
            if (shouldRefresh) {
                await this.refresh();
            }
        }
        dispose() {
            this.b.dispose();
        }
    };
    exports.$8Lb = $8Lb;
    exports.$8Lb = $8Lb = $8Lb_1 = __decorate([
        __param(0, files_1.$6j),
        __param(1, configuration_1.$8h),
        __param(2, workspace_1.$Kh),
        __param(3, clipboardService_1.$UZ),
        __param(4, editorService_1.$9C),
        __param(5, uriIdentity_1.$Ck),
        __param(6, bulkEditService_1.$n1),
        __param(7, progress_1.$2u),
        __param(8, host_1.$VT),
        __param(9, filesConfigurationService_1.$yD),
        __param(10, telemetry_1.$9k)
    ], $8Lb);
    function doesFileEventAffect(item, view, events, types) {
        for (const [_name, child] of item.children) {
            if (view.isItemVisible(child)) {
                if (events.some(e => e.contains(child.resource, ...types))) {
                    return true;
                }
                if (child.isDirectory && child.isDirectoryResolved) {
                    if (doesFileEventAffect(child, view, events, types)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    function getRevealExcludes(configuration) {
        const revealExcludes = configuration && configuration.explorer && configuration.explorer.autoRevealExclude;
        if (!revealExcludes) {
            return {};
        }
        return revealExcludes;
    }
});
//# sourceMappingURL=explorerService.js.map