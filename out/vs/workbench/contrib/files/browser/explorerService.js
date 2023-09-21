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
    var ExplorerService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExplorerService = exports.UNDO_REDO_SOURCE = void 0;
    exports.UNDO_REDO_SOURCE = new undoRedo_1.UndoRedoSource();
    let ExplorerService = class ExplorerService {
        static { ExplorerService_1 = this; }
        static { this.EXPLORER_FILE_CHANGES_REACT_DELAY = 500; } // delay in ms to react to file changes to give our internal events a chance to react first
        constructor(fileService, configurationService, contextService, clipboardService, editorService, uriIdentityService, bulkEditService, progressService, hostService, filesConfigurationService, telemetryService) {
            this.fileService = fileService;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.clipboardService = clipboardService;
            this.editorService = editorService;
            this.uriIdentityService = uriIdentityService;
            this.bulkEditService = bulkEditService;
            this.progressService = progressService;
            this.filesConfigurationService = filesConfigurationService;
            this.telemetryService = telemetryService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.fileChangeEvents = [];
            this.config = this.configurationService.getValue('explorer');
            this.model = new explorerModel_1.ExplorerModel(this.contextService, this.uriIdentityService, this.fileService, this.configurationService, this.filesConfigurationService);
            this.disposables.add(this.model);
            this.disposables.add(this.fileService.onDidRunOperation(e => this.onDidRunOperation(e)));
            this.onFileChangesScheduler = new async_1.RunOnceScheduler(async () => {
                const events = this.fileChangeEvents;
                this.fileChangeEvents = [];
                // Filter to the ones we care
                const types = [2 /* FileChangeType.DELETED */];
                if (this.config.sortOrder === "modified" /* SortOrder.Modified */) {
                    types.push(0 /* FileChangeType.UPDATED */);
                }
                let shouldRefresh = false;
                // For DELETED and UPDATED events go through the explorer model and check if any of the items got affected
                this.roots.forEach(r => {
                    if (this.view && !shouldRefresh) {
                        shouldRefresh = doesFileEventAffect(r, this.view, events, types);
                    }
                });
                // For ADDED events we need to go through all the events and check if the explorer is already aware of some of them
                // Or if they affect not yet resolved parts of the explorer. If that is the case we will not refresh.
                events.forEach(e => {
                    if (!shouldRefresh) {
                        for (const resource of e.rawAdded) {
                            const parent = this.model.findClosest((0, resources_1.dirname)(resource));
                            // Parent of the added resource is resolved and the explorer model is not aware of the added resource - we need to refresh
                            if (parent && !parent.getChild((0, resources_1.basename)(resource))) {
                                shouldRefresh = true;
                                break;
                            }
                        }
                    }
                });
                if (shouldRefresh) {
                    await this.refresh(false);
                }
            }, ExplorerService_1.EXPLORER_FILE_CHANGES_REACT_DELAY);
            this.disposables.add(this.fileService.onDidFilesChange(e => {
                this.fileChangeEvents.push(e);
                // Don't mess with the file tree while in the process of editing. #112293
                if (this.editable) {
                    return;
                }
                if (!this.onFileChangesScheduler.isScheduled()) {
                    this.onFileChangesScheduler.schedule();
                }
            }));
            this.disposables.add(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
            this.disposables.add(event_1.Event.any(this.fileService.onDidChangeFileSystemProviderRegistrations, this.fileService.onDidChangeFileSystemProviderCapabilities)(async (e) => {
                let affected = false;
                this.model.roots.forEach(r => {
                    if (r.resource.scheme === e.scheme) {
                        affected = true;
                        r.forgetChildren();
                    }
                });
                if (affected) {
                    if (this.view) {
                        await this.view.setTreeInput();
                    }
                }
            }));
            this.disposables.add(this.model.onDidChangeRoots(() => {
                this.view?.setTreeInput();
            }));
            // Refresh explorer when window gets focus to compensate for missing file events #126817
            this.disposables.add(hostService.onDidChangeFocus(hasFocus => {
                if (hasFocus) {
                    this.refresh(false);
                }
            }));
            this.revealExcludeMatcher = new resources_2.ResourceGlobMatcher((uri) => getRevealExcludes(configurationService.getValue({ resource: uri })), (event) => event.affectsConfiguration('explorer.autoRevealExclude'), contextService, configurationService);
            this.disposables.add(this.revealExcludeMatcher);
        }
        get roots() {
            return this.model.roots;
        }
        get sortOrderConfiguration() {
            return {
                sortOrder: this.config.sortOrder,
                lexicographicOptions: this.config.sortOrderLexicographicOptions,
            };
        }
        registerView(contextProvider) {
            this.view = contextProvider;
        }
        getContext(respectMultiSelection, ignoreNestedChildren = false) {
            if (!this.view) {
                return [];
            }
            const items = new Set(this.view.getContext(respectMultiSelection));
            items.forEach(item => {
                try {
                    if (respectMultiSelection && !ignoreNestedChildren && this.view?.isItemCollapsed(item) && item.nestedChildren) {
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
            const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
            const promise = this.progressService.withProgress({
                location: options.progressLocation || 10 /* ProgressLocation.Window */,
                title: options.progressLabel,
                cancellable: edit.length > 1,
                delay: 500,
            }, async (progress) => {
                await this.bulkEditService.apply(edit, {
                    undoRedoSource: exports.UNDO_REDO_SOURCE,
                    label: options.undoLabel,
                    code: 'undoredo.explorerOperation',
                    progress,
                    token: cancellationTokenSource.token,
                    confirmBeforeUndo: options.confirmBeforeUndo
                });
            }, () => cancellationTokenSource.cancel());
            await this.progressService.withProgress({ location: 1 /* ProgressLocation.Explorer */, delay: 500 }, () => promise);
            cancellationTokenSource.dispose();
        }
        hasViewFocus() {
            return !!this.view && this.view.hasFocus();
        }
        // IExplorerService methods
        findClosest(resource) {
            return this.model.findClosest(resource);
        }
        findClosestRoot(resource) {
            const parentRoots = this.model.roots.filter(r => this.uriIdentityService.extUri.isEqualOrParent(resource, r.resource))
                .sort((first, second) => second.resource.path.length - first.resource.path.length);
            return parentRoots.length ? parentRoots[0] : null;
        }
        async setEditable(stat, data) {
            if (!this.view) {
                return;
            }
            if (!data) {
                this.editable = undefined;
            }
            else {
                this.editable = { stat, data };
            }
            const isEditing = this.isEditable(stat);
            try {
                await this.view.setEditable(stat, isEditing);
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
                this.telemetryService.publicLogError2('explorerView.setEditableError', errorData);
                return;
            }
            if (!this.editable && this.fileChangeEvents.length && !this.onFileChangesScheduler.isScheduled()) {
                this.onFileChangesScheduler.schedule();
            }
        }
        async setToCopy(items, cut) {
            const previouslyCutItems = this.cutItems;
            this.cutItems = cut ? items : undefined;
            await this.clipboardService.writeResources(items.map(s => s.resource));
            this.view?.itemsCopied(items, cut, previouslyCutItems);
        }
        isCut(item) {
            return !!this.cutItems && this.cutItems.some(i => this.uriIdentityService.extUri.isEqual(i.resource, item.resource));
        }
        getEditable() {
            return this.editable;
        }
        getEditableData(stat) {
            return this.editable && this.editable.stat === stat ? this.editable.data : undefined;
        }
        isEditable(stat) {
            return !!this.editable && (this.editable.stat === stat || !stat);
        }
        async select(resource, reveal) {
            if (!this.view) {
                return;
            }
            // If file or parent matches exclude patterns, do not reveal unless reveal argument is 'force'
            const ignoreRevealExcludes = reveal === 'force';
            const fileStat = this.findClosest(resource);
            if (fileStat) {
                if (!this.shouldAutoRevealItem(fileStat, ignoreRevealExcludes)) {
                    return;
                }
                await this.view.selectResource(fileStat.resource, reveal);
                return Promise.resolve(undefined);
            }
            // Stat needs to be resolved first and then revealed
            const options = { resolveTo: [resource], resolveMetadata: this.config.sortOrder === "modified" /* SortOrder.Modified */ };
            const root = this.findClosestRoot(resource);
            if (!root) {
                return undefined;
            }
            try {
                const stat = await this.fileService.resolve(root.resource, options);
                // Convert to model
                const modelStat = explorerModel_1.ExplorerItem.create(this.fileService, this.configurationService, this.filesConfigurationService, stat, undefined, options.resolveTo);
                // Update Input with disk Stat
                explorerModel_1.ExplorerItem.mergeLocalWithDisk(modelStat, root);
                const item = root.find(resource);
                await this.view.refresh(true, root);
                // Once item is resolved, check again if folder should be expanded
                if (item && !this.shouldAutoRevealItem(item, ignoreRevealExcludes)) {
                    return;
                }
                await this.view.selectResource(item ? item.resource : undefined, reveal);
            }
            catch (error) {
                root.error = error;
                await this.view.refresh(false, root);
            }
        }
        async refresh(reveal = true) {
            this.model.roots.forEach(r => r.forgetChildren());
            if (this.view) {
                await this.view.refresh(true);
                const resource = this.editorService.activeEditor?.resource;
                const autoReveal = this.configurationService.getValue().explorer.autoReveal;
                if (reveal && resource && autoReveal) {
                    // We did a top level refresh, reveal the active file #67118
                    this.select(resource, autoReveal);
                }
            }
        }
        // File events
        async onDidRunOperation(e) {
            // When nesting, changes to one file in a folder may impact the rendered structure
            // of all the folder's immediate children, thus a recursive refresh is needed.
            // Ideally the tree would be able to recusively refresh just one level but that does not yet exist.
            const shouldDeepRefresh = this.config.fileNesting.enabled;
            // Add
            if (e.isOperation(0 /* FileOperation.CREATE */) || e.isOperation(3 /* FileOperation.COPY */)) {
                const addedElement = e.target;
                const parentResource = (0, resources_1.dirname)(addedElement.resource);
                const parents = this.model.findAll(parentResource);
                if (parents.length) {
                    // Add the new file to its parent (Model)
                    await Promise.all(parents.map(async (p) => {
                        // We have to check if the parent is resolved #29177
                        const resolveMetadata = this.config.sortOrder === `modified`;
                        if (!p.isDirectoryResolved) {
                            const stat = await this.fileService.resolve(p.resource, { resolveMetadata });
                            if (stat) {
                                const modelStat = explorerModel_1.ExplorerItem.create(this.fileService, this.configurationService, this.filesConfigurationService, stat, p.parent);
                                explorerModel_1.ExplorerItem.mergeLocalWithDisk(modelStat, p);
                            }
                        }
                        const childElement = explorerModel_1.ExplorerItem.create(this.fileService, this.configurationService, this.filesConfigurationService, addedElement, p.parent);
                        // Make sure to remove any previous version of the file if any
                        p.removeChild(childElement);
                        p.addChild(childElement);
                        // Refresh the Parent (View)
                        await this.view?.refresh(shouldDeepRefresh, p);
                    }));
                }
            }
            // Move (including Rename)
            else if (e.isOperation(2 /* FileOperation.MOVE */)) {
                const oldResource = e.resource;
                const newElement = e.target;
                const oldParentResource = (0, resources_1.dirname)(oldResource);
                const newParentResource = (0, resources_1.dirname)(newElement.resource);
                const modelElements = this.model.findAll(oldResource);
                const sameParentMove = modelElements.every(e => !e.nestedParent) && this.uriIdentityService.extUri.isEqual(oldParentResource, newParentResource);
                // Handle Rename
                if (sameParentMove) {
                    await Promise.all(modelElements.map(async (modelElement) => {
                        // Rename File (Model)
                        modelElement.rename(newElement);
                        await this.view?.refresh(shouldDeepRefresh, modelElement.parent);
                    }));
                }
                // Handle Move
                else {
                    const newParents = this.model.findAll(newParentResource);
                    if (newParents.length && modelElements.length) {
                        // Move in Model
                        await Promise.all(modelElements.map(async (modelElement, index) => {
                            const oldParent = modelElement.parent;
                            const oldNestedParent = modelElement.nestedParent;
                            modelElement.move(newParents[index]);
                            if (oldNestedParent) {
                                await this.view?.refresh(false, oldNestedParent);
                            }
                            await this.view?.refresh(false, oldParent);
                            await this.view?.refresh(shouldDeepRefresh, newParents[index]);
                        }));
                    }
                }
            }
            // Delete
            else if (e.isOperation(1 /* FileOperation.DELETE */)) {
                const modelElements = this.model.findAll(e.resource);
                await Promise.all(modelElements.map(async (modelElement) => {
                    if (modelElement.parent) {
                        // Remove Element from Parent (Model)
                        const parent = modelElement.parent;
                        parent.removeChild(modelElement);
                        const oldNestedParent = modelElement.nestedParent;
                        if (oldNestedParent) {
                            oldNestedParent.removeChild(modelElement);
                            await this.view?.refresh(false, oldNestedParent);
                        }
                        // Refresh Parent (View)
                        await this.view?.refresh(shouldDeepRefresh, parent);
                    }
                }));
            }
        }
        // Check if an item matches a explorer.autoRevealExclude pattern
        shouldAutoRevealItem(item, ignore) {
            if (item === undefined || ignore) {
                return true;
            }
            if (this.revealExcludeMatcher.matches(item.resource, name => !!(item.parent && item.parent.getChild(name)))) {
                return false;
            }
            const root = item.root;
            let currentItem = item.parent;
            while (currentItem !== root) {
                if (currentItem === undefined) {
                    return true;
                }
                if (this.revealExcludeMatcher.matches(currentItem.resource)) {
                    return false;
                }
                currentItem = currentItem.parent;
            }
            return true;
        }
        async onConfigurationUpdated(event) {
            if (!event.affectsConfiguration('explorer')) {
                return;
            }
            let shouldRefresh = false;
            if (event.affectsConfiguration('explorer.fileNesting')) {
                shouldRefresh = true;
            }
            const configuration = this.configurationService.getValue();
            const configSortOrder = configuration?.explorer?.sortOrder || "default" /* SortOrder.Default */;
            if (this.config.sortOrder !== configSortOrder) {
                shouldRefresh = this.config.sortOrder !== undefined;
            }
            const configLexicographicOptions = configuration?.explorer?.sortOrderLexicographicOptions || "default" /* LexicographicOptions.Default */;
            if (this.config.sortOrderLexicographicOptions !== configLexicographicOptions) {
                shouldRefresh = shouldRefresh || this.config.sortOrderLexicographicOptions !== undefined;
            }
            this.config = configuration.explorer;
            if (shouldRefresh) {
                await this.refresh();
            }
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    exports.ExplorerService = ExplorerService;
    exports.ExplorerService = ExplorerService = ExplorerService_1 = __decorate([
        __param(0, files_1.IFileService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, clipboardService_1.IClipboardService),
        __param(4, editorService_1.IEditorService),
        __param(5, uriIdentity_1.IUriIdentityService),
        __param(6, bulkEditService_1.IBulkEditService),
        __param(7, progress_1.IProgressService),
        __param(8, host_1.IHostService),
        __param(9, filesConfigurationService_1.IFilesConfigurationService),
        __param(10, telemetry_1.ITelemetryService)
    ], ExplorerService);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwbG9yZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvYnJvd3Nlci9leHBsb3JlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTJCbkYsUUFBQSxnQkFBZ0IsR0FBRyxJQUFJLHlCQUFjLEVBQUUsQ0FBQztJQUU5QyxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFlOztpQkFHSCxzQ0FBaUMsR0FBRyxHQUFHLEFBQU4sQ0FBTyxHQUFDLDJGQUEyRjtRQVk1SixZQUNlLFdBQWlDLEVBQ3hCLG9CQUFtRCxFQUNoRCxjQUFnRCxFQUN2RCxnQkFBMkMsRUFDOUMsYUFBcUMsRUFDaEMsa0JBQXdELEVBQzNELGVBQWtELEVBQ2xELGVBQWtELEVBQ3RELFdBQXlCLEVBQ1gseUJBQXNFLEVBQy9FLGdCQUFvRDtZQVZqRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNoQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3hDLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUMvQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3RDLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUNmLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDMUMsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQ2pDLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUV2Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTRCO1lBQzlELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFyQnZELGdCQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFPN0MscUJBQWdCLEdBQXVCLEVBQUUsQ0FBQztZQWdCakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLFVBQVUs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