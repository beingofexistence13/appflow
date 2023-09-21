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
define(["require", "exports", "vs/platform/theme/common/themeService", "vs/workbench/browser/part", "vs/base/browser/dom", "vs/base/common/event", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/instantiation/common/instantiation", "vs/base/browser/ui/grid/grid", "vs/workbench/common/theme", "vs/base/common/arrays", "vs/workbench/browser/parts/editor/editor", "vs/workbench/browser/parts/editor/editorGroupView", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/workbench/common/editor/editorGroupModel", "vs/workbench/browser/parts/editor/editorDropTarget", "vs/workbench/services/editor/browser/editorDropService", "vs/base/common/color", "vs/base/browser/ui/centered/centeredViewLayout", "vs/base/common/errors", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/extensions", "vs/base/common/types", "vs/workbench/browser/dnd", "vs/base/common/async", "vs/workbench/services/editor/common/editorGroupFinder", "vs/workbench/services/editor/common/editorService"], function (require, exports, themeService_1, part_1, dom_1, event_1, colorRegistry_1, editorGroupsService_1, instantiation_1, grid_1, theme_1, arrays_1, editor_1, editorGroupView_1, configuration_1, lifecycle_1, storage_1, editorGroupModel_1, editorDropTarget_1, editorDropService_1, color_1, centeredViewLayout_1, errors_1, layoutService_1, extensions_1, types_1, dnd_1, async_1, editorGroupFinder_1, editorService_1) {
    "use strict";
    var EditorPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorPart = void 0;
    class GridWidgetView {
        constructor() {
            this.element = (0, dom_1.$)('.grid-view-container');
            this._onDidChange = new event_1.Relay();
            this.onDidChange = this._onDidChange.event;
        }
        get minimumWidth() { return this.gridWidget ? this.gridWidget.minimumWidth : 0; }
        get maximumWidth() { return this.gridWidget ? this.gridWidget.maximumWidth : Number.POSITIVE_INFINITY; }
        get minimumHeight() { return this.gridWidget ? this.gridWidget.minimumHeight : 0; }
        get maximumHeight() { return this.gridWidget ? this.gridWidget.maximumHeight : Number.POSITIVE_INFINITY; }
        get gridWidget() {
            return this._gridWidget;
        }
        set gridWidget(grid) {
            this.element.innerText = '';
            if (grid) {
                this.element.appendChild(grid.element);
                this._onDidChange.input = grid.onDidChange;
            }
            else {
                this._onDidChange.input = event_1.Event.None;
            }
            this._gridWidget = grid;
        }
        layout(width, height, top, left) {
            this.gridWidget?.layout(width, height, top, left);
        }
        dispose() {
            this._onDidChange.dispose();
        }
    }
    let EditorPart = class EditorPart extends part_1.Part {
        static { EditorPart_1 = this; }
        static { this.EDITOR_PART_UI_STATE_STORAGE_KEY = 'editorpart.state'; }
        static { this.EDITOR_PART_CENTERED_VIEW_STORAGE_KEY = 'editorpart.centeredview'; }
        constructor(instantiationService, themeService, configurationService, storageService, layoutService) {
            super("workbench.parts.editor" /* Parts.EDITOR_PART */, { hasTitle: false }, themeService, storageService, layoutService);
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            //#region Events
            this._onDidLayout = this._register(new event_1.Emitter());
            this.onDidLayout = this._onDidLayout.event;
            this._onDidChangeActiveGroup = this._register(new event_1.Emitter());
            this.onDidChangeActiveGroup = this._onDidChangeActiveGroup.event;
            this._onDidChangeGroupIndex = this._register(new event_1.Emitter());
            this.onDidChangeGroupIndex = this._onDidChangeGroupIndex.event;
            this._onDidChangeGroupLocked = this._register(new event_1.Emitter());
            this.onDidChangeGroupLocked = this._onDidChangeGroupLocked.event;
            this._onDidActivateGroup = this._register(new event_1.Emitter());
            this.onDidActivateGroup = this._onDidActivateGroup.event;
            this._onDidAddGroup = this._register(new event_1.Emitter());
            this.onDidAddGroup = this._onDidAddGroup.event;
            this._onDidRemoveGroup = this._register(new event_1.Emitter());
            this.onDidRemoveGroup = this._onDidRemoveGroup.event;
            this._onDidMoveGroup = this._register(new event_1.Emitter());
            this.onDidMoveGroup = this._onDidMoveGroup.event;
            this.onDidSetGridWidget = this._register(new event_1.Emitter());
            this._onDidChangeSizeConstraints = this._register(new event_1.Relay());
            this.onDidChangeSizeConstraints = event_1.Event.any(this.onDidSetGridWidget.event, this._onDidChangeSizeConstraints.event);
            this._onDidScroll = this._register(new event_1.Relay());
            this.onDidScroll = event_1.Event.any(this.onDidSetGridWidget.event, this._onDidScroll.event);
            this._onDidChangeEditorPartOptions = this._register(new event_1.Emitter());
            this.onDidChangeEditorPartOptions = this._onDidChangeEditorPartOptions.event;
            //#endregion
            this.workspaceMemento = this.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this.profileMemento = this.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            this.groupViews = new Map();
            this.mostRecentActiveGroups = [];
            this.gridWidgetView = this._register(new GridWidgetView());
            //#region IEditorGroupsService
            this.enforcedPartOptions = [];
            this._partOptions = (0, editor_1.getEditorPartOptions)(this.configurationService, this.themeService);
            this._top = 0;
            this._left = 0;
            this.sideGroup = {
                openEditor: (editor, options) => {
                    const [group] = this.instantiationService.invokeFunction(accessor => (0, editorGroupFinder_1.findGroup)(accessor, { editor, options }, editorService_1.SIDE_GROUP));
                    return group.openEditor(editor, options);
                }
            };
            this._isReady = false;
            this.whenReadyPromise = new async_1.DeferredPromise();
            this.whenReady = this.whenReadyPromise.p;
            this.whenRestoredPromise = new async_1.DeferredPromise();
            this.whenRestored = this.whenRestoredPromise.p;
            this.priority = 2 /* LayoutPriority.High */;
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
            this._register(this.themeService.onDidFileIconThemeChange(() => this.handleChangedPartOptions()));
        }
        onConfigurationUpdated(event) {
            if ((0, editor_1.impactsEditorPartOptions)(event)) {
                this.handleChangedPartOptions();
            }
        }
        handleChangedPartOptions() {
            const oldPartOptions = this._partOptions;
            const newPartOptions = (0, editor_1.getEditorPartOptions)(this.configurationService, this.themeService);
            for (const enforcedPartOptions of this.enforcedPartOptions) {
                Object.assign(newPartOptions, enforcedPartOptions); // check for overrides
            }
            this._partOptions = newPartOptions;
            this._onDidChangeEditorPartOptions.fire({ oldPartOptions, newPartOptions });
        }
        get partOptions() { return this._partOptions; }
        enforcePartOptions(options) {
            this.enforcedPartOptions.push(options);
            this.handleChangedPartOptions();
            return (0, lifecycle_1.toDisposable)(() => {
                this.enforcedPartOptions.splice(this.enforcedPartOptions.indexOf(options), 1);
                this.handleChangedPartOptions();
            });
        }
        get contentDimension() { return this._contentDimension; }
        get activeGroup() {
            return this._activeGroup;
        }
        get groups() {
            return Array.from(this.groupViews.values());
        }
        get count() {
            return this.groupViews.size;
        }
        get orientation() {
            return (this.gridWidget && this.gridWidget.orientation === 0 /* Orientation.VERTICAL */) ? 1 /* GroupOrientation.VERTICAL */ : 0 /* GroupOrientation.HORIZONTAL */;
        }
        get isReady() { return this._isReady; }
        get hasRestorableState() {
            return !!this.workspaceMemento[EditorPart_1.EDITOR_PART_UI_STATE_STORAGE_KEY];
        }
        getGroups(order = 0 /* GroupsOrder.CREATION_TIME */) {
            switch (order) {
                case 0 /* GroupsOrder.CREATION_TIME */:
                    return this.groups;
                case 1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */: {
                    const mostRecentActive = (0, arrays_1.coalesce)(this.mostRecentActiveGroups.map(groupId => this.getGroup(groupId)));
                    // there can be groups that got never active, even though they exist. in this case
                    // make sure to just append them at the end so that all groups are returned properly
                    return (0, arrays_1.distinct)([...mostRecentActive, ...this.groups]);
                }
                case 2 /* GroupsOrder.GRID_APPEARANCE */: {
                    const views = [];
                    if (this.gridWidget) {
                        this.fillGridNodes(views, this.gridWidget.getViews());
                    }
                    return views;
                }
            }
        }
        fillGridNodes(target, node) {
            if ((0, grid_1.isGridBranchNode)(node)) {
                node.children.forEach(child => this.fillGridNodes(target, child));
            }
            else {
                target.push(node.view);
            }
        }
        getGroup(identifier) {
            return this.groupViews.get(identifier);
        }
        findGroup(scope, source = this.activeGroup, wrap) {
            // by direction
            if (typeof scope.direction === 'number') {
                return this.doFindGroupByDirection(scope.direction, source, wrap);
            }
            // by location
            if (typeof scope.location === 'number') {
                return this.doFindGroupByLocation(scope.location, source, wrap);
            }
            throw new Error('invalid arguments');
        }
        doFindGroupByDirection(direction, source, wrap) {
            const sourceGroupView = this.assertGroupView(source);
            // Find neighbours and sort by our MRU list
            const neighbours = this.gridWidget.getNeighborViews(sourceGroupView, this.toGridViewDirection(direction), wrap);
            neighbours.sort(((n1, n2) => this.mostRecentActiveGroups.indexOf(n1.id) - this.mostRecentActiveGroups.indexOf(n2.id)));
            return neighbours[0];
        }
        doFindGroupByLocation(location, source, wrap) {
            const sourceGroupView = this.assertGroupView(source);
            const groups = this.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
            const index = groups.indexOf(sourceGroupView);
            switch (location) {
                case 0 /* GroupLocation.FIRST */:
                    return groups[0];
                case 1 /* GroupLocation.LAST */:
                    return groups[groups.length - 1];
                case 2 /* GroupLocation.NEXT */: {
                    let nextGroup = groups[index + 1];
                    if (!nextGroup && wrap) {
                        nextGroup = this.doFindGroupByLocation(0 /* GroupLocation.FIRST */, source);
                    }
                    return nextGroup;
                }
                case 3 /* GroupLocation.PREVIOUS */: {
                    let previousGroup = groups[index - 1];
                    if (!previousGroup && wrap) {
                        previousGroup = this.doFindGroupByLocation(1 /* GroupLocation.LAST */, source);
                    }
                    return previousGroup;
                }
            }
        }
        activateGroup(group) {
            const groupView = this.assertGroupView(group);
            this.doSetGroupActive(groupView);
            return groupView;
        }
        restoreGroup(group) {
            const groupView = this.assertGroupView(group);
            this.doRestoreGroup(groupView);
            return groupView;
        }
        getSize(group) {
            const groupView = this.assertGroupView(group);
            return this.gridWidget.getViewSize(groupView);
        }
        setSize(group, size) {
            const groupView = this.assertGroupView(group);
            this.gridWidget.resizeView(groupView, size);
        }
        arrangeGroups(arrangement, target = this.activeGroup) {
            if (this.count < 2) {
                return; // require at least 2 groups to show
            }
            if (!this.gridWidget) {
                return; // we have not been created yet
            }
            switch (arrangement) {
                case 1 /* GroupsArrangement.EVEN */:
                    this.gridWidget.distributeViewSizes();
                    break;
                case 0 /* GroupsArrangement.MAXIMIZE */:
                    this.gridWidget.maximizeViewSize(target);
                    break;
                case 2 /* GroupsArrangement.TOGGLE */:
                    if (this.isGroupMaximized(target)) {
                        this.arrangeGroups(1 /* GroupsArrangement.EVEN */);
                    }
                    else {
                        this.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */);
                    }
                    break;
            }
        }
        isGroupMaximized(targetGroup) {
            return this.gridWidget.isViewSizeMaximized(targetGroup);
        }
        setGroupOrientation(orientation) {
            if (!this.gridWidget) {
                return; // we have not been created yet
            }
            const newOrientation = (orientation === 0 /* GroupOrientation.HORIZONTAL */) ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
            if (this.gridWidget.orientation !== newOrientation) {
                this.gridWidget.orientation = newOrientation;
            }
        }
        applyLayout(layout) {
            const restoreFocus = this.shouldRestoreFocus(this.container);
            // Determine how many groups we need overall
            let layoutGroupsCount = 0;
            function countGroups(groups) {
                for (const group of groups) {
                    if (Array.isArray(group.groups)) {
                        countGroups(group.groups);
                    }
                    else {
                        layoutGroupsCount++;
                    }
                }
            }
            countGroups(layout.groups);
            // If we currently have too many groups, merge them into the last one
            let currentGroupViews = this.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
            if (layoutGroupsCount < currentGroupViews.length) {
                const lastGroupInLayout = currentGroupViews[layoutGroupsCount - 1];
                currentGroupViews.forEach((group, index) => {
                    if (index >= layoutGroupsCount) {
                        this.mergeGroup(group, lastGroupInLayout);
                    }
                });
                currentGroupViews = this.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
            }
            const activeGroup = this.activeGroup;
            // Prepare grid descriptor to create new grid from
            const gridDescriptor = (0, grid_1.createSerializedGrid)({
                orientation: this.toGridViewOrientation(layout.orientation, this.isTwoDimensionalGrid() ?
                    this.gridWidget.orientation : // preserve original orientation for 2-dimensional grids
                    (0, grid_1.orthogonal)(this.gridWidget.orientation) // otherwise flip (fix https://github.com/microsoft/vscode/issues/52975)
                ),
                groups: layout.groups
            });
            // Recreate gridwidget with descriptor
            this.doCreateGridControlWithState(gridDescriptor, activeGroup.id, currentGroupViews);
            // Layout
            this.doLayout(this._contentDimension);
            // Update container
            this.updateContainer();
            // Events for groups that got added
            for (const groupView of this.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)) {
                if (!currentGroupViews.includes(groupView)) {
                    this._onDidAddGroup.fire(groupView);
                }
            }
            // Notify group index change given layout has changed
            this.notifyGroupIndexChange();
            // Restore focus as needed
            if (restoreFocus) {
                this._activeGroup.focus();
            }
        }
        getLayout() {
            // Example return value:
            // { orientation: 0, groups: [ { groups: [ { size: 0.4 }, { size: 0.6 } ], size: 0.5 }, { groups: [ {}, {} ], size: 0.5 } ] }
            const serializedGrid = this.gridWidget.serialize();
            const orientation = serializedGrid.orientation === 1 /* Orientation.HORIZONTAL */ ? 0 /* GroupOrientation.HORIZONTAL */ : 1 /* GroupOrientation.VERTICAL */;
            const root = this.serializedNodeToGroupLayoutArgument(serializedGrid.root);
            return {
                orientation,
                groups: root.groups
            };
        }
        serializedNodeToGroupLayoutArgument(serializedNode) {
            if (serializedNode.type === 'branch') {
                return {
                    size: serializedNode.size,
                    groups: serializedNode.data.map(node => this.serializedNodeToGroupLayoutArgument(node))
                };
            }
            return { size: serializedNode.size };
        }
        shouldRestoreFocus(target) {
            if (!target) {
                return false;
            }
            const activeElement = document.activeElement;
            if (activeElement === document.body) {
                return true; // always restore focus if nothing is focused currently
            }
            // otherwise check for the active element being an ancestor of the target
            return (0, dom_1.isAncestor)(activeElement, target);
        }
        isTwoDimensionalGrid() {
            const views = this.gridWidget.getViews();
            if ((0, grid_1.isGridBranchNode)(views)) {
                // the grid is 2-dimensional if any children
                // of the grid is a branch node
                return views.children.some(child => (0, grid_1.isGridBranchNode)(child));
            }
            return false;
        }
        addGroup(location, direction) {
            const locationView = this.assertGroupView(location);
            const restoreFocus = this.shouldRestoreFocus(locationView.element);
            const group = this.doAddGroup(locationView, direction);
            // Restore focus if we had it previously after completing the grid
            // operation. That operation might cause reparenting of grid views
            // which moves focus to the <body> element otherwise.
            if (restoreFocus) {
                locationView.focus();
            }
            return group;
        }
        doAddGroup(locationView, direction, groupToCopy) {
            const shouldMaximize = this.groupViews.size > 1 && this.isGroupMaximized(locationView);
            const newGroupView = this.doCreateGroupView(groupToCopy);
            // Add to grid widget
            this.gridWidget.addView(newGroupView, this.getSplitSizingStyle(), locationView, this.toGridViewDirection(direction));
            // Update container
            this.updateContainer();
            // Event
            this._onDidAddGroup.fire(newGroupView);
            // Notify group index change given a new group was added
            this.notifyGroupIndexChange();
            // Maximize new group, if the reference view was previously maximized
            if (shouldMaximize) {
                this.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */, newGroupView);
            }
            return newGroupView;
        }
        getSplitSizingStyle() {
            switch (this._partOptions.splitSizing) {
                case 'distribute':
                    return grid_1.Sizing.Distribute;
                case 'split':
                    return grid_1.Sizing.Split;
                default:
                    return grid_1.Sizing.Auto;
            }
        }
        doCreateGroupView(from) {
            // Create group view
            let groupView;
            if (from instanceof editorGroupView_1.EditorGroupView) {
                groupView = editorGroupView_1.EditorGroupView.createCopy(from, this, this.count, this.instantiationService);
            }
            else if ((0, editorGroupModel_1.isSerializedEditorGroupModel)(from)) {
                groupView = editorGroupView_1.EditorGroupView.createFromSerialized(from, this, this.count, this.instantiationService);
            }
            else {
                groupView = editorGroupView_1.EditorGroupView.createNew(this, this.count, this.instantiationService);
            }
            // Keep in map
            this.groupViews.set(groupView.id, groupView);
            // Track focus
            const groupDisposables = new lifecycle_1.DisposableStore();
            groupDisposables.add(groupView.onDidFocus(() => {
                this.doSetGroupActive(groupView);
            }));
            // Track group changes
            groupDisposables.add(groupView.onDidModelChange(e => {
                switch (e.kind) {
                    case 2 /* GroupModelChangeKind.GROUP_LOCKED */:
                        this._onDidChangeGroupLocked.fire(groupView);
                        break;
                    case 1 /* GroupModelChangeKind.GROUP_INDEX */:
                        this._onDidChangeGroupIndex.fire(groupView);
                        break;
                }
            }));
            // Track active editor change after it occurred
            groupDisposables.add(groupView.onDidActiveEditorChange(() => {
                this.updateContainer();
            }));
            // Track dispose
            event_1.Event.once(groupView.onWillDispose)(() => {
                (0, lifecycle_1.dispose)(groupDisposables);
                this.groupViews.delete(groupView.id);
                this.doUpdateMostRecentActive(groupView);
            });
            return groupView;
        }
        doSetGroupActive(group) {
            if (this._activeGroup !== group) {
                const previousActiveGroup = this._activeGroup;
                this._activeGroup = group;
                // Update list of most recently active groups
                this.doUpdateMostRecentActive(group, true);
                // Mark previous one as inactive
                previousActiveGroup?.setActive(false);
                // Mark group as new active
                group.setActive(true);
                // Maximize the group if it is currently minimized
                this.doRestoreGroup(group);
                // Event
                this._onDidChangeActiveGroup.fire(group);
            }
            // Always fire the event that a group has been activated
            // even if its the same group that is already active to
            // signal the intent even when nothing has changed.
            this._onDidActivateGroup.fire(group);
        }
        doRestoreGroup(group) {
            if (this.gridWidget) {
                const viewSize = this.gridWidget.getViewSize(group);
                if (viewSize.width === group.minimumWidth || viewSize.height === group.minimumHeight) {
                    this.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */, group);
                }
            }
        }
        doUpdateMostRecentActive(group, makeMostRecentlyActive) {
            const index = this.mostRecentActiveGroups.indexOf(group.id);
            // Remove from MRU list
            if (index !== -1) {
                this.mostRecentActiveGroups.splice(index, 1);
            }
            // Add to front as needed
            if (makeMostRecentlyActive) {
                this.mostRecentActiveGroups.unshift(group.id);
            }
        }
        toGridViewDirection(direction) {
            switch (direction) {
                case 0 /* GroupDirection.UP */: return 0 /* Direction.Up */;
                case 1 /* GroupDirection.DOWN */: return 1 /* Direction.Down */;
                case 2 /* GroupDirection.LEFT */: return 2 /* Direction.Left */;
                case 3 /* GroupDirection.RIGHT */: return 3 /* Direction.Right */;
            }
        }
        toGridViewOrientation(orientation, fallback) {
            if (typeof orientation === 'number') {
                return orientation === 0 /* GroupOrientation.HORIZONTAL */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
            }
            return fallback;
        }
        removeGroup(group) {
            const groupView = this.assertGroupView(group);
            if (this.count === 1) {
                return; // Cannot remove the last root group
            }
            // Remove empty group
            if (groupView.isEmpty) {
                return this.doRemoveEmptyGroup(groupView);
            }
            // Remove group with editors
            this.doRemoveGroupWithEditors(groupView);
        }
        doRemoveGroupWithEditors(groupView) {
            const mostRecentlyActiveGroups = this.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            let lastActiveGroup;
            if (this._activeGroup === groupView) {
                lastActiveGroup = mostRecentlyActiveGroups[1];
            }
            else {
                lastActiveGroup = mostRecentlyActiveGroups[0];
            }
            // Removing a group with editors should merge these editors into the
            // last active group and then remove this group.
            this.mergeGroup(groupView, lastActiveGroup);
        }
        doRemoveEmptyGroup(groupView) {
            const restoreFocus = this.shouldRestoreFocus(this.container);
            // Activate next group if the removed one was active
            if (this._activeGroup === groupView) {
                const mostRecentlyActiveGroups = this.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
                const nextActiveGroup = mostRecentlyActiveGroups[1]; // [0] will be the current group we are about to dispose
                this.activateGroup(nextActiveGroup);
            }
            // Remove from grid widget & dispose
            this.gridWidget.removeView(groupView, this.getSplitSizingStyle());
            groupView.dispose();
            // Restore focus if we had it previously after completing the grid
            // operation. That operation might cause reparenting of grid views
            // which moves focus to the <body> element otherwise.
            if (restoreFocus) {
                this._activeGroup.focus();
            }
            // Notify group index change given a group was removed
            this.notifyGroupIndexChange();
            // Update container
            this.updateContainer();
            // Update locked state: clear when we are at just 1 group
            if (this.count === 1) {
                (0, arrays_1.firstOrDefault)(this.groups)?.lock(false);
            }
            // Event
            this._onDidRemoveGroup.fire(groupView);
        }
        moveGroup(group, location, direction) {
            const sourceView = this.assertGroupView(group);
            const targetView = this.assertGroupView(location);
            if (sourceView.id === targetView.id) {
                throw new Error('Cannot move group into its own');
            }
            const restoreFocus = this.shouldRestoreFocus(sourceView.element);
            // Move through grid widget API
            this.gridWidget.moveView(sourceView, this.getSplitSizingStyle(), targetView, this.toGridViewDirection(direction));
            // Restore focus if we had it previously after completing the grid
            // operation. That operation might cause reparenting of grid views
            // which moves focus to the <body> element otherwise.
            if (restoreFocus) {
                sourceView.focus();
            }
            // Event
            this._onDidMoveGroup.fire(sourceView);
            // Notify group index change given a group was moved
            this.notifyGroupIndexChange();
            return sourceView;
        }
        copyGroup(group, location, direction) {
            const groupView = this.assertGroupView(group);
            const locationView = this.assertGroupView(location);
            const restoreFocus = this.shouldRestoreFocus(groupView.element);
            // Copy the group view
            const copiedGroupView = this.doAddGroup(locationView, direction, groupView);
            // Restore focus if we had it
            if (restoreFocus) {
                copiedGroupView.focus();
            }
            return copiedGroupView;
        }
        mergeGroup(group, target, options) {
            const sourceView = this.assertGroupView(group);
            const targetView = this.assertGroupView(target);
            // Collect editors to move/copy
            const editors = [];
            let index = (options && typeof options.index === 'number') ? options.index : targetView.count;
            for (const editor of sourceView.editors) {
                const inactive = !sourceView.isActive(editor) || this._activeGroup !== sourceView;
                const sticky = sourceView.isSticky(editor);
                const options = { index: !sticky ? index : undefined /* do not set index to preserve sticky flag */, inactive, preserveFocus: inactive };
                editors.push({ editor, options });
                index++;
            }
            // Move/Copy editors over into target
            if (options?.mode === 0 /* MergeGroupMode.COPY_EDITORS */) {
                sourceView.copyEditors(editors, targetView);
            }
            else {
                sourceView.moveEditors(editors, targetView);
            }
            // Remove source if the view is now empty and not already removed
            if (sourceView.isEmpty && !sourceView.disposed /* could have been disposed already via workbench.editor.closeEmptyGroups setting */) {
                this.removeGroup(sourceView);
            }
            return targetView;
        }
        mergeAllGroups(target = this.activeGroup) {
            for (const group of this.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
                if (group === target) {
                    continue; // keep target
                }
                this.mergeGroup(group, target);
            }
            return target;
        }
        assertGroupView(group) {
            let groupView;
            if (typeof group === 'number') {
                groupView = this.getGroup(group);
            }
            else {
                groupView = group;
            }
            if (!groupView) {
                throw new Error('Invalid editor group provided!');
            }
            return groupView;
        }
        //#endregion
        //#region IEditorDropService
        createEditorDropTarget(container, delegate) {
            return this.instantiationService.createInstance(editorDropTarget_1.EditorDropTarget, this, container, delegate);
        }
        //#endregion
        //#region Part
        // TODO @sbatten @joao find something better to prevent editor taking over #79897
        get minimumWidth() { return Math.min(this.centeredLayoutWidget.minimumWidth, this.layoutService.getMaximumEditorDimensions().width); }
        get maximumWidth() { return this.centeredLayoutWidget.maximumWidth; }
        get minimumHeight() { return Math.min(this.centeredLayoutWidget.minimumHeight, this.layoutService.getMaximumEditorDimensions().height); }
        get maximumHeight() { return this.centeredLayoutWidget.maximumHeight; }
        get snap() { return this.layoutService.getPanelAlignment() === 'center'; }
        get onDidChange() { return event_1.Event.any(this.centeredLayoutWidget.onDidChange, this.onDidSetGridWidget.event); }
        get gridSeparatorBorder() {
            return this.theme.getColor(theme_1.EDITOR_GROUP_BORDER) || this.theme.getColor(colorRegistry_1.contrastBorder) || color_1.Color.transparent;
        }
        updateStyles() {
            const container = (0, types_1.assertIsDefined)(this.container);
            container.style.backgroundColor = this.getColor(colorRegistry_1.editorBackground) || '';
            const separatorBorderStyle = { separatorBorder: this.gridSeparatorBorder, background: this.theme.getColor(theme_1.EDITOR_PANE_BACKGROUND) || color_1.Color.transparent };
            this.gridWidget.style(separatorBorderStyle);
            this.centeredLayoutWidget.styles(separatorBorderStyle);
        }
        createContentArea(parent, options) {
            // Container
            this.element = parent;
            this.container = document.createElement('div');
            this.container.classList.add('content');
            parent.appendChild(this.container);
            // Grid control
            this.doCreateGridControl(options);
            // Centered layout widget
            this.centeredLayoutWidget = this._register(new centeredViewLayout_1.CenteredViewLayout(this.container, this.gridWidgetView, this.profileMemento[EditorPart_1.EDITOR_PART_CENTERED_VIEW_STORAGE_KEY]));
            this._register(this.onDidChangeEditorPartOptions(e => this.centeredLayoutWidget.setFixedWidth(e.newPartOptions.centeredLayoutFixedWidth ?? false)));
            // Drag & Drop support
            this.setupDragAndDropSupport(parent, this.container);
            // Signal ready
            this.whenReadyPromise.complete();
            this._isReady = true;
            // Signal restored
            async_1.Promises.settled(this.groups.map(group => group.whenRestored)).finally(() => {
                this.whenRestoredPromise.complete();
            });
            return this.container;
        }
        setupDragAndDropSupport(parent, container) {
            // Editor drop target
            this._register(this.createEditorDropTarget(container, Object.create(null)));
            // No drop in the editor
            const overlay = document.createElement('div');
            overlay.classList.add('drop-block-overlay');
            parent.appendChild(overlay);
            // Hide the block if a mouse down event occurs #99065
            this._register((0, dom_1.addDisposableGenericMouseDownListener)(overlay, () => overlay.classList.remove('visible')));
            this._register(dnd_1.CompositeDragAndDropObserver.INSTANCE.registerTarget(this.element, {
                onDragStart: e => overlay.classList.add('visible'),
                onDragEnd: e => overlay.classList.remove('visible')
            }));
            let horizontalOpenerTimeout;
            let verticalOpenerTimeout;
            let lastOpenHorizontalPosition;
            let lastOpenVerticalPosition;
            const openPartAtPosition = (position) => {
                if (!this.layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) && position === this.layoutService.getPanelPosition()) {
                    this.layoutService.setPartHidden(false, "workbench.parts.panel" /* Parts.PANEL_PART */);
                }
                else if (!this.layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) && position === (this.layoutService.getSideBarPosition() === 1 /* Position.RIGHT */ ? 0 /* Position.LEFT */ : 1 /* Position.RIGHT */)) {
                    this.layoutService.setPartHidden(false, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
                }
            };
            const clearAllTimeouts = () => {
                if (horizontalOpenerTimeout) {
                    clearTimeout(horizontalOpenerTimeout);
                    horizontalOpenerTimeout = undefined;
                }
                if (verticalOpenerTimeout) {
                    clearTimeout(verticalOpenerTimeout);
                    verticalOpenerTimeout = undefined;
                }
            };
            this._register(dnd_1.CompositeDragAndDropObserver.INSTANCE.registerTarget(overlay, {
                onDragOver: e => {
                    dom_1.EventHelper.stop(e.eventData, true);
                    if (e.eventData.dataTransfer) {
                        e.eventData.dataTransfer.dropEffect = 'none';
                    }
                    const boundingRect = overlay.getBoundingClientRect();
                    let openHorizontalPosition = undefined;
                    let openVerticalPosition = undefined;
                    const proximity = 100;
                    if (e.eventData.clientX < boundingRect.left + proximity) {
                        openHorizontalPosition = 0 /* Position.LEFT */;
                    }
                    if (e.eventData.clientX > boundingRect.right - proximity) {
                        openHorizontalPosition = 1 /* Position.RIGHT */;
                    }
                    if (e.eventData.clientY > boundingRect.bottom - proximity) {
                        openVerticalPosition = 2 /* Position.BOTTOM */;
                    }
                    if (horizontalOpenerTimeout && openHorizontalPosition !== lastOpenHorizontalPosition) {
                        clearTimeout(horizontalOpenerTimeout);
                        horizontalOpenerTimeout = undefined;
                    }
                    if (verticalOpenerTimeout && openVerticalPosition !== lastOpenVerticalPosition) {
                        clearTimeout(verticalOpenerTimeout);
                        verticalOpenerTimeout = undefined;
                    }
                    if (!horizontalOpenerTimeout && openHorizontalPosition !== undefined) {
                        lastOpenHorizontalPosition = openHorizontalPosition;
                        horizontalOpenerTimeout = setTimeout(() => openPartAtPosition(openHorizontalPosition), 200);
                    }
                    if (!verticalOpenerTimeout && openVerticalPosition !== undefined) {
                        lastOpenVerticalPosition = openVerticalPosition;
                        verticalOpenerTimeout = setTimeout(() => openPartAtPosition(openVerticalPosition), 200);
                    }
                },
                onDragLeave: () => clearAllTimeouts(),
                onDragEnd: () => clearAllTimeouts(),
                onDrop: () => clearAllTimeouts()
            }));
        }
        centerLayout(active) {
            this.centeredLayoutWidget.activate(active);
            this._activeGroup.focus();
        }
        isLayoutCentered() {
            if (this.centeredLayoutWidget) {
                return this.centeredLayoutWidget.isActive();
            }
            return false;
        }
        doCreateGridControl(options) {
            // Grid Widget (with previous UI state)
            let restoreError = false;
            if (!options || options.restorePreviousState) {
                restoreError = !this.doCreateGridControlWithPreviousState();
            }
            // Grid Widget (no previous UI state or failed to restore)
            if (!this.gridWidget || restoreError) {
                const initialGroup = this.doCreateGroupView();
                this.doSetGridWidget(new grid_1.SerializableGrid(initialGroup));
                // Ensure a group is active
                this.doSetGroupActive(initialGroup);
            }
            // Update container
            this.updateContainer();
            // Notify group index change we created the entire grid
            this.notifyGroupIndexChange();
        }
        doCreateGridControlWithPreviousState() {
            const uiState = this.workspaceMemento[EditorPart_1.EDITOR_PART_UI_STATE_STORAGE_KEY];
            if (uiState?.serializedGrid) {
                try {
                    // MRU
                    this.mostRecentActiveGroups = uiState.mostRecentActiveGroups;
                    // Grid Widget
                    this.doCreateGridControlWithState(uiState.serializedGrid, uiState.activeGroup);
                    // Ensure last active group has focus
                    this._activeGroup.focus();
                }
                catch (error) {
                    // Log error
                    (0, errors_1.onUnexpectedError)(new Error(`Error restoring editor grid widget: ${error} (with state: ${JSON.stringify(uiState)})`));
                    // Clear any state we have from the failing restore
                    this.groupViews.forEach(group => group.dispose());
                    this.groupViews.clear();
                    this.mostRecentActiveGroups = [];
                    return false; // failure
                }
            }
            return true; // success
        }
        doCreateGridControlWithState(serializedGrid, activeGroupId, editorGroupViewsToReuse) {
            // Determine group views to reuse if any
            let reuseGroupViews;
            if (editorGroupViewsToReuse) {
                reuseGroupViews = editorGroupViewsToReuse.slice(0); // do not modify original array
            }
            else {
                reuseGroupViews = [];
            }
            // Create new
            const groupViews = [];
            const gridWidget = grid_1.SerializableGrid.deserialize(serializedGrid, {
                fromJSON: (serializedEditorGroup) => {
                    let groupView;
                    if (reuseGroupViews.length > 0) {
                        groupView = reuseGroupViews.shift();
                    }
                    else {
                        groupView = this.doCreateGroupView(serializedEditorGroup);
                    }
                    groupViews.push(groupView);
                    if (groupView.id === activeGroupId) {
                        this.doSetGroupActive(groupView);
                    }
                    return groupView;
                }
            }, { styles: { separatorBorder: this.gridSeparatorBorder } });
            // If the active group was not found when restoring the grid
            // make sure to make at least one group active. We always need
            // an active group.
            if (!this._activeGroup) {
                this.doSetGroupActive(groupViews[0]);
            }
            // Validate MRU group views matches grid widget state
            if (this.mostRecentActiveGroups.some(groupId => !this.getGroup(groupId))) {
                this.mostRecentActiveGroups = groupViews.map(group => group.id);
            }
            // Set it
            this.doSetGridWidget(gridWidget);
        }
        doSetGridWidget(gridWidget) {
            let boundarySashes = {};
            if (this.gridWidget) {
                boundarySashes = this.gridWidget.boundarySashes;
                this.gridWidget.dispose();
            }
            this.gridWidget = gridWidget;
            this.gridWidget.boundarySashes = boundarySashes;
            this.gridWidgetView.gridWidget = gridWidget;
            this._onDidChangeSizeConstraints.input = gridWidget.onDidChange;
            this._onDidScroll.input = gridWidget.onDidScroll;
            this.onDidSetGridWidget.fire(undefined);
        }
        updateContainer() {
            const container = (0, types_1.assertIsDefined)(this.container);
            container.classList.toggle('empty', this.isEmpty);
        }
        notifyGroupIndexChange() {
            this.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */).forEach((group, index) => group.notifyIndexChanged(index));
        }
        get isEmpty() {
            return this.count === 1 && this._activeGroup.isEmpty;
        }
        setBoundarySashes(sashes) {
            this.gridWidget.boundarySashes = sashes;
            this.centeredLayoutWidget.boundarySashes = sashes;
        }
        layout(width, height, top, left) {
            this._top = top;
            this._left = left;
            // Layout contents
            const contentAreaSize = super.layoutContents(width, height).contentSize;
            // Layout editor container
            this.doLayout(dom_1.Dimension.lift(contentAreaSize), top, left);
        }
        doLayout(dimension, top = this._top, left = this._left) {
            this._contentDimension = dimension;
            // Layout Grid
            this.centeredLayoutWidget.layout(this._contentDimension.width, this._contentDimension.height, top, left);
            // Event
            this._onDidLayout.fire(dimension);
        }
        saveState() {
            // Persist grid UI state
            if (this.gridWidget) {
                const uiState = {
                    serializedGrid: this.gridWidget.serialize(),
                    activeGroup: this._activeGroup.id,
                    mostRecentActiveGroups: this.mostRecentActiveGroups
                };
                if (this.isEmpty) {
                    delete this.workspaceMemento[EditorPart_1.EDITOR_PART_UI_STATE_STORAGE_KEY];
                }
                else {
                    this.workspaceMemento[EditorPart_1.EDITOR_PART_UI_STATE_STORAGE_KEY] = uiState;
                }
            }
            // Persist centered view state
            if (this.centeredLayoutWidget) {
                const centeredLayoutState = this.centeredLayoutWidget.state;
                if (this.centeredLayoutWidget.isDefault(centeredLayoutState)) {
                    delete this.profileMemento[EditorPart_1.EDITOR_PART_CENTERED_VIEW_STORAGE_KEY];
                }
                else {
                    this.profileMemento[EditorPart_1.EDITOR_PART_CENTERED_VIEW_STORAGE_KEY] = centeredLayoutState;
                }
            }
            super.saveState();
        }
        toJSON() {
            return {
                type: "workbench.parts.editor" /* Parts.EDITOR_PART */
            };
        }
        dispose() {
            // Forward to all groups
            this.groupViews.forEach(group => group.dispose());
            this.groupViews.clear();
            // Grid widget
            this.gridWidget?.dispose();
            super.dispose();
        }
    };
    exports.EditorPart = EditorPart;
    exports.EditorPart = EditorPart = EditorPart_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, themeService_1.IThemeService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, storage_1.IStorageService),
        __param(4, layoutService_1.IWorkbenchLayoutService)
    ], EditorPart);
    let EditorDropService = class EditorDropService {
        constructor(editorPart) {
            this.editorPart = editorPart;
        }
        createEditorDropTarget(container, delegate) {
            return this.editorPart.createEditorDropTarget(container, delegate);
        }
    };
    EditorDropService = __decorate([
        __param(0, editorGroupsService_1.IEditorGroupsService)
    ], EditorDropService);
    (0, extensions_1.registerSingleton)(editorGroupsService_1.IEditorGroupsService, EditorPart, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(editorDropService_1.IEditorDropService, EditorDropService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yUGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9lZGl0b3JQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF1Q2hHLE1BQU0sY0FBYztRQUFwQjtZQUVVLFlBQU8sR0FBZ0IsSUFBQSxPQUFDLEVBQUMsc0JBQXNCLENBQUMsQ0FBQztZQU9sRCxpQkFBWSxHQUFHLElBQUksYUFBSyxFQUFpRCxDQUFDO1lBQ3pFLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7UUE0QmhELENBQUM7UUFsQ0EsSUFBSSxZQUFZLEtBQWEsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RixJQUFJLFlBQVksS0FBYSxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBQ2hILElBQUksYUFBYSxLQUFhLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0YsSUFBSSxhQUFhLEtBQWEsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQU9sSCxJQUFJLFVBQVU7WUFDYixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7UUFD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