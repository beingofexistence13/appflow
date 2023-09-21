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
    var $Sxb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Sxb = void 0;
    class GridWidgetView {
        constructor() {
            this.element = (0, dom_1.$)('.grid-view-container');
            this.a = new event_1.$od();
            this.onDidChange = this.a.event;
        }
        get minimumWidth() { return this.gridWidget ? this.gridWidget.minimumWidth : 0; }
        get maximumWidth() { return this.gridWidget ? this.gridWidget.maximumWidth : Number.POSITIVE_INFINITY; }
        get minimumHeight() { return this.gridWidget ? this.gridWidget.minimumHeight : 0; }
        get maximumHeight() { return this.gridWidget ? this.gridWidget.maximumHeight : Number.POSITIVE_INFINITY; }
        get gridWidget() {
            return this.b;
        }
        set gridWidget(grid) {
            this.element.innerText = '';
            if (grid) {
                this.element.appendChild(grid.element);
                this.a.input = grid.onDidChange;
            }
            else {
                this.a.input = event_1.Event.None;
            }
            this.b = grid;
        }
        layout(width, height, top, left) {
            this.gridWidget?.layout(width, height, top, left);
        }
        dispose() {
            this.a.dispose();
        }
    }
    let $Sxb = class $Sxb extends part_1.Part {
        static { $Sxb_1 = this; }
        static { this.a = 'editorpart.state'; }
        static { this.b = 'editorpart.centeredview'; }
        constructor(kb, themeService, lb, storageService, layoutService) {
            super("workbench.parts.editor" /* Parts.EDITOR_PART */, { hasTitle: false }, themeService, storageService, layoutService);
            this.kb = kb;
            this.lb = lb;
            //#region Events
            this.y = this.B(new event_1.$fd());
            this.onDidLayout = this.y.event;
            this.P = this.B(new event_1.$fd());
            this.onDidChangeActiveGroup = this.P.event;
            this.Q = this.B(new event_1.$fd());
            this.onDidChangeGroupIndex = this.Q.event;
            this.R = this.B(new event_1.$fd());
            this.onDidChangeGroupLocked = this.R.event;
            this.S = this.B(new event_1.$fd());
            this.onDidActivateGroup = this.S.event;
            this.U = this.B(new event_1.$fd());
            this.onDidAddGroup = this.U.event;
            this.W = this.B(new event_1.$fd());
            this.onDidRemoveGroup = this.W.event;
            this.X = this.B(new event_1.$fd());
            this.onDidMoveGroup = this.X.event;
            this.Y = this.B(new event_1.$fd());
            this.Z = this.B(new event_1.$od());
            this.onDidChangeSizeConstraints = event_1.Event.any(this.Y.event, this.Z.event);
            this.ab = this.B(new event_1.$od());
            this.onDidScroll = event_1.Event.any(this.Y.event, this.ab.event);
            this.bb = this.B(new event_1.$fd());
            this.onDidChangeEditorPartOptions = this.bb.event;
            //#endregion
            this.cb = this.F(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this.db = this.F(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            this.eb = new Map();
            this.fb = [];
            this.jb = this.B(new GridWidgetView());
            //#region IEditorGroupsService
            this.pb = [];
            this.qb = (0, editor_1.$8T)(this.lb, this.n);
            this.rb = 0;
            this.sb = 0;
            this.sideGroup = {
                openEditor: (editor, options) => {
                    const [group] = this.kb.invokeFunction(accessor => (0, editorGroupFinder_1.$Rxb)(accessor, { editor, options }, editorService_1.$$C));
                    return group.openEditor(editor, options);
                }
            };
            this.vb = false;
            this.wb = new async_1.$2g();
            this.whenReady = this.wb.p;
            this.xb = new async_1.$2g();
            this.whenRestored = this.xb.p;
            this.priority = 2 /* LayoutPriority.High */;
            this.mb();
        }
        mb() {
            this.B(this.lb.onDidChangeConfiguration(e => this.nb(e)));
            this.B(this.n.onDidFileIconThemeChange(() => this.ob()));
        }
        nb(event) {
            if ((0, editor_1.$7T)(event)) {
                this.ob();
            }
        }
        ob() {
            const oldPartOptions = this.qb;
            const newPartOptions = (0, editor_1.$8T)(this.lb, this.n);
            for (const enforcedPartOptions of this.pb) {
                Object.assign(newPartOptions, enforcedPartOptions); // check for overrides
            }
            this.qb = newPartOptions;
            this.bb.fire({ oldPartOptions, newPartOptions });
        }
        get partOptions() { return this.qb; }
        enforcePartOptions(options) {
            this.pb.push(options);
            this.ob();
            return (0, lifecycle_1.$ic)(() => {
                this.pb.splice(this.pb.indexOf(options), 1);
                this.ob();
            });
        }
        get contentDimension() { return this.tb; }
        get activeGroup() {
            return this.ub;
        }
        get groups() {
            return Array.from(this.eb.values());
        }
        get count() {
            return this.eb.size;
        }
        get orientation() {
            return (this.ib && this.ib.orientation === 0 /* Orientation.VERTICAL */) ? 1 /* GroupOrientation.VERTICAL */ : 0 /* GroupOrientation.HORIZONTAL */;
        }
        get isReady() { return this.vb; }
        get hasRestorableState() {
            return !!this.cb[$Sxb_1.a];
        }
        getGroups(order = 0 /* GroupsOrder.CREATION_TIME */) {
            switch (order) {
                case 0 /* GroupsOrder.CREATION_TIME */:
                    return this.groups;
                case 1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */: {
                    const mostRecentActive = (0, arrays_1.$Fb)(this.fb.map(groupId => this.getGroup(groupId)));
                    // there can be groups that got never active, even though they exist. in this case
                    // make sure to just append them at the end so that all groups are returned properly
                    return (0, arrays_1.$Kb)([...mostRecentActive, ...this.groups]);
                }
                case 2 /* GroupsOrder.GRID_APPEARANCE */: {
                    const views = [];
                    if (this.ib) {
                        this.yb(views, this.ib.getViews());
                    }
                    return views;
                }
            }
        }
        yb(target, node) {
            if ((0, grid_1.$fR)(node)) {
                node.children.forEach(child => this.yb(target, child));
            }
            else {
                target.push(node.view);
            }
        }
        getGroup(identifier) {
            return this.eb.get(identifier);
        }
        findGroup(scope, source = this.activeGroup, wrap) {
            // by direction
            if (typeof scope.direction === 'number') {
                return this.zb(scope.direction, source, wrap);
            }
            // by location
            if (typeof scope.location === 'number') {
                return this.Ab(scope.location, source, wrap);
            }
            throw new Error('invalid arguments');
        }
        zb(direction, source, wrap) {
            const sourceGroupView = this.Ob(source);
            // Find neighbours and sort by our MRU list
            const neighbours = this.ib.getNeighborViews(sourceGroupView, this.Kb(direction), wrap);
            neighbours.sort(((n1, n2) => this.fb.indexOf(n1.id) - this.fb.indexOf(n2.id)));
            return neighbours[0];
        }
        Ab(location, source, wrap) {
            const sourceGroupView = this.Ob(source);
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
                        nextGroup = this.Ab(0 /* GroupLocation.FIRST */, source);
                    }
                    return nextGroup;
                }
                case 3 /* GroupLocation.PREVIOUS */: {
                    let previousGroup = groups[index - 1];
                    if (!previousGroup && wrap) {
                        previousGroup = this.Ab(1 /* GroupLocation.LAST */, source);
                    }
                    return previousGroup;
                }
            }
        }
        activateGroup(group) {
            const groupView = this.Ob(group);
            this.Hb(groupView);
            return groupView;
        }
        restoreGroup(group) {
            const groupView = this.Ob(group);
            this.Ib(groupView);
            return groupView;
        }
        getSize(group) {
            const groupView = this.Ob(group);
            return this.ib.getViewSize(groupView);
        }
        setSize(group, size) {
            const groupView = this.Ob(group);
            this.ib.resizeView(groupView, size);
        }
        arrangeGroups(arrangement, target = this.activeGroup) {
            if (this.count < 2) {
                return; // require at least 2 groups to show
            }
            if (!this.ib) {
                return; // we have not been created yet
            }
            switch (arrangement) {
                case 1 /* GroupsArrangement.EVEN */:
                    this.ib.distributeViewSizes();
                    break;
                case 0 /* GroupsArrangement.MAXIMIZE */:
                    this.ib.maximizeViewSize(target);
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
            return this.ib.isViewSizeMaximized(targetGroup);
        }
        setGroupOrientation(orientation) {
            if (!this.ib) {
                return; // we have not been created yet
            }
            const newOrientation = (orientation === 0 /* GroupOrientation.HORIZONTAL */) ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
            if (this.ib.orientation !== newOrientation) {
                this.ib.orientation = newOrientation;
            }
        }
        applyLayout(layout) {
            const restoreFocus = this.Cb(this.gb);
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
            const gridDescriptor = (0, grid_1.$kR)({
                orientation: this.Lb(layout.orientation, this.Db() ?
                    this.ib.orientation : // preserve original orientation for 2-dimensional grids
                    (0, grid_1.orthogonal)(this.ib.orientation) // otherwise flip (fix https://github.com/microsoft/vscode/issues/52975)
                ),
                groups: layout.groups
            });
            // Recreate gridwidget with descriptor
            this.Ub(gridDescriptor, activeGroup.id, currentGroupViews);
            // Layout
            this.Zb(this.tb);
            // Update container
            this.Wb();
            // Events for groups that got added
            for (const groupView of this.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)) {
                if (!currentGroupViews.includes(groupView)) {
                    this.U.fire(groupView);
                }
            }
            // Notify group index change given layout has changed
            this.Xb();
            // Restore focus as needed
            if (restoreFocus) {
                this.ub.focus();
            }
        }
        getLayout() {
            // Example return value:
            // { orientation: 0, groups: [ { groups: [ { size: 0.4 }, { size: 0.6 } ], size: 0.5 }, { groups: [ {}, {} ], size: 0.5 } ] }
            const serializedGrid = this.ib.serialize();
            const orientation = serializedGrid.orientation === 1 /* Orientation.HORIZONTAL */ ? 0 /* GroupOrientation.HORIZONTAL */ : 1 /* GroupOrientation.VERTICAL */;
            const root = this.Bb(serializedGrid.root);
            return {
                orientation,
                groups: root.groups
            };
        }
        Bb(serializedNode) {
            if (serializedNode.type === 'branch') {
                return {
                    size: serializedNode.size,
                    groups: serializedNode.data.map(node => this.Bb(node))
                };
            }
            return { size: serializedNode.size };
        }
        Cb(target) {
            if (!target) {
                return false;
            }
            const activeElement = document.activeElement;
            if (activeElement === document.body) {
                return true; // always restore focus if nothing is focused currently
            }
            // otherwise check for the active element being an ancestor of the target
            return (0, dom_1.$NO)(activeElement, target);
        }
        Db() {
            const views = this.ib.getViews();
            if ((0, grid_1.$fR)(views)) {
                // the grid is 2-dimensional if any children
                // of the grid is a branch node
                return views.children.some(child => (0, grid_1.$fR)(child));
            }
            return false;
        }
        addGroup(location, direction) {
            const locationView = this.Ob(location);
            const restoreFocus = this.Cb(locationView.element);
            const group = this.Eb(locationView, direction);
            // Restore focus if we had it previously after completing the grid
            // operation. That operation might cause reparenting of grid views
            // which moves focus to the <body> element otherwise.
            if (restoreFocus) {
                locationView.focus();
            }
            return group;
        }
        Eb(locationView, direction, groupToCopy) {
            const shouldMaximize = this.eb.size > 1 && this.isGroupMaximized(locationView);
            const newGroupView = this.Gb(groupToCopy);
            // Add to grid widget
            this.ib.addView(newGroupView, this.Fb(), locationView, this.Kb(direction));
            // Update container
            this.Wb();
            // Event
            this.U.fire(newGroupView);
            // Notify group index change given a new group was added
            this.Xb();
            // Maximize new group, if the reference view was previously maximized
            if (shouldMaximize) {
                this.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */, newGroupView);
            }
            return newGroupView;
        }
        Fb() {
            switch (this.qb.splitSizing) {
                case 'distribute':
                    return grid_1.Sizing.Distribute;
                case 'split':
                    return grid_1.Sizing.Split;
                default:
                    return grid_1.Sizing.Auto;
            }
        }
        Gb(from) {
            // Create group view
            let groupView;
            if (from instanceof editorGroupView_1.$Qxb) {
                groupView = editorGroupView_1.$Qxb.createCopy(from, this, this.count, this.kb);
            }
            else if ((0, editorGroupModel_1.$YC)(from)) {
                groupView = editorGroupView_1.$Qxb.createFromSerialized(from, this, this.count, this.kb);
            }
            else {
                groupView = editorGroupView_1.$Qxb.createNew(this, this.count, this.kb);
            }
            // Keep in map
            this.eb.set(groupView.id, groupView);
            // Track focus
            const groupDisposables = new lifecycle_1.$jc();
            groupDisposables.add(groupView.onDidFocus(() => {
                this.Hb(groupView);
            }));
            // Track group changes
            groupDisposables.add(groupView.onDidModelChange(e => {
                switch (e.kind) {
                    case 2 /* GroupModelChangeKind.GROUP_LOCKED */:
                        this.R.fire(groupView);
                        break;
                    case 1 /* GroupModelChangeKind.GROUP_INDEX */:
                        this.Q.fire(groupView);
                        break;
                }
            }));
            // Track active editor change after it occurred
            groupDisposables.add(groupView.onDidActiveEditorChange(() => {
                this.Wb();
            }));
            // Track dispose
            event_1.Event.once(groupView.onWillDispose)(() => {
                (0, lifecycle_1.$fc)(groupDisposables);
                this.eb.delete(groupView.id);
                this.Jb(groupView);
            });
            return groupView;
        }
        Hb(group) {
            if (this.ub !== group) {
                const previousActiveGroup = this.ub;
                this.ub = group;
                // Update list of most recently active groups
                this.Jb(group, true);
                // Mark previous one as inactive
                previousActiveGroup?.setActive(false);
                // Mark group as new active
                group.setActive(true);
                // Maximize the group if it is currently minimized
                this.Ib(group);
                // Event
                this.P.fire(group);
            }
            // Always fire the event that a group has been activated
            // even if its the same group that is already active to
            // signal the intent even when nothing has changed.
            this.S.fire(group);
        }
        Ib(group) {
            if (this.ib) {
                const viewSize = this.ib.getViewSize(group);
                if (viewSize.width === group.minimumWidth || viewSize.height === group.minimumHeight) {
                    this.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */, group);
                }
            }
        }
        Jb(group, makeMostRecentlyActive) {
            const index = this.fb.indexOf(group.id);
            // Remove from MRU list
            if (index !== -1) {
                this.fb.splice(index, 1);
            }
            // Add to front as needed
            if (makeMostRecentlyActive) {
                this.fb.unshift(group.id);
            }
        }
        Kb(direction) {
            switch (direction) {
                case 0 /* GroupDirection.UP */: return 0 /* Direction.Up */;
                case 1 /* GroupDirection.DOWN */: return 1 /* Direction.Down */;
                case 2 /* GroupDirection.LEFT */: return 2 /* Direction.Left */;
                case 3 /* GroupDirection.RIGHT */: return 3 /* Direction.Right */;
            }
        }
        Lb(orientation, fallback) {
            if (typeof orientation === 'number') {
                return orientation === 0 /* GroupOrientation.HORIZONTAL */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
            }
            return fallback;
        }
        removeGroup(group) {
            const groupView = this.Ob(group);
            if (this.count === 1) {
                return; // Cannot remove the last root group
            }
            // Remove empty group
            if (groupView.isEmpty) {
                return this.Nb(groupView);
            }
            // Remove group with editors
            this.Mb(groupView);
        }
        Mb(groupView) {
            const mostRecentlyActiveGroups = this.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            let lastActiveGroup;
            if (this.ub === groupView) {
                lastActiveGroup = mostRecentlyActiveGroups[1];
            }
            else {
                lastActiveGroup = mostRecentlyActiveGroups[0];
            }
            // Removing a group with editors should merge these editors into the
            // last active group and then remove this group.
            this.mergeGroup(groupView, lastActiveGroup);
        }
        Nb(groupView) {
            const restoreFocus = this.Cb(this.gb);
            // Activate next group if the removed one was active
            if (this.ub === groupView) {
                const mostRecentlyActiveGroups = this.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
                const nextActiveGroup = mostRecentlyActiveGroups[1]; // [0] will be the current group we are about to dispose
                this.activateGroup(nextActiveGroup);
            }
            // Remove from grid widget & dispose
            this.ib.removeView(groupView, this.Fb());
            groupView.dispose();
            // Restore focus if we had it previously after completing the grid
            // operation. That operation might cause reparenting of grid views
            // which moves focus to the <body> element otherwise.
            if (restoreFocus) {
                this.ub.focus();
            }
            // Notify group index change given a group was removed
            this.Xb();
            // Update container
            this.Wb();
            // Update locked state: clear when we are at just 1 group
            if (this.count === 1) {
                (0, arrays_1.$Mb)(this.groups)?.lock(false);
            }
            // Event
            this.W.fire(groupView);
        }
        moveGroup(group, location, direction) {
            const sourceView = this.Ob(group);
            const targetView = this.Ob(location);
            if (sourceView.id === targetView.id) {
                throw new Error('Cannot move group into its own');
            }
            const restoreFocus = this.Cb(sourceView.element);
            // Move through grid widget API
            this.ib.moveView(sourceView, this.Fb(), targetView, this.Kb(direction));
            // Restore focus if we had it previously after completing the grid
            // operation. That operation might cause reparenting of grid views
            // which moves focus to the <body> element otherwise.
            if (restoreFocus) {
                sourceView.focus();
            }
            // Event
            this.X.fire(sourceView);
            // Notify group index change given a group was moved
            this.Xb();
            return sourceView;
        }
        copyGroup(group, location, direction) {
            const groupView = this.Ob(group);
            const locationView = this.Ob(location);
            const restoreFocus = this.Cb(groupView.element);
            // Copy the group view
            const copiedGroupView = this.Eb(locationView, direction, groupView);
            // Restore focus if we had it
            if (restoreFocus) {
                copiedGroupView.focus();
            }
            return copiedGroupView;
        }
        mergeGroup(group, target, options) {
            const sourceView = this.Ob(group);
            const targetView = this.Ob(target);
            // Collect editors to move/copy
            const editors = [];
            let index = (options && typeof options.index === 'number') ? options.index : targetView.count;
            for (const editor of sourceView.editors) {
                const inactive = !sourceView.isActive(editor) || this.ub !== sourceView;
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
        Ob(group) {
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
            return this.kb.createInstance(editorDropTarget_1.$dfb, this, container, delegate);
        }
        //#endregion
        //#region Part
        // TODO @sbatten @joao find something better to prevent editor taking over #79897
        get minimumWidth() { return Math.min(this.hb.minimumWidth, this.u.getMaximumEditorDimensions().width); }
        get maximumWidth() { return this.hb.maximumWidth; }
        get minimumHeight() { return Math.min(this.hb.minimumHeight, this.u.getMaximumEditorDimensions().height); }
        get maximumHeight() { return this.hb.maximumHeight; }
        get snap() { return this.u.getPanelAlignment() === 'center'; }
        get onDidChange() { return event_1.Event.any(this.hb.onDidChange, this.Y.event); }
        get Pb() {
            return this.h.getColor(theme_1.$E_) || this.h.getColor(colorRegistry_1.$Av) || color_1.$Os.transparent;
        }
        updateStyles() {
            const container = (0, types_1.$uf)(this.gb);
            container.style.backgroundColor = this.z(colorRegistry_1.$ww) || '';
            const separatorBorderStyle = { separatorBorder: this.Pb, background: this.h.getColor(theme_1.$x_) || color_1.$Os.transparent };
            this.ib.style(separatorBorderStyle);
            this.hb.styles(separatorBorderStyle);
        }
        L(parent, options) {
            // Container
            this.element = parent;
            this.gb = document.createElement('div');
            this.gb.classList.add('content');
            parent.appendChild(this.gb);
            // Grid control
            this.Sb(options);
            // Centered layout widget
            this.hb = this.B(new centeredViewLayout_1.$lR(this.gb, this.jb, this.db[$Sxb_1.b]));
            this.B(this.onDidChangeEditorPartOptions(e => this.hb.setFixedWidth(e.newPartOptions.centeredLayoutFixedWidth ?? false)));
            // Drag & Drop support
            this.Rb(parent, this.gb);
            // Signal ready
            this.wb.complete();
            this.vb = true;
            // Signal restored
            async_1.Promises.settled(this.groups.map(group => group.whenRestored)).finally(() => {
                this.xb.complete();
            });
            return this.gb;
        }
        Rb(parent, container) {
            // Editor drop target
            this.B(this.createEditorDropTarget(container, Object.create(null)));
            // No drop in the editor
            const overlay = document.createElement('div');
            overlay.classList.add('drop-block-overlay');
            parent.appendChild(overlay);
            // Hide the block if a mouse down event occurs #99065
            this.B((0, dom_1.$rO)(overlay, () => overlay.classList.remove('visible')));
            this.B(dnd_1.$zeb.INSTANCE.registerTarget(this.element, {
                onDragStart: e => overlay.classList.add('visible'),
                onDragEnd: e => overlay.classList.remove('visible')
            }));
            let horizontalOpenerTimeout;
            let verticalOpenerTimeout;
            let lastOpenHorizontalPosition;
            let lastOpenVerticalPosition;
            const openPartAtPosition = (position) => {
                if (!this.u.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) && position === this.u.getPanelPosition()) {
                    this.u.setPartHidden(false, "workbench.parts.panel" /* Parts.PANEL_PART */);
                }
                else if (!this.u.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) && position === (this.u.getSideBarPosition() === 1 /* Position.RIGHT */ ? 0 /* Position.LEFT */ : 1 /* Position.RIGHT */)) {
                    this.u.setPartHidden(false, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
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
            this.B(dnd_1.$zeb.INSTANCE.registerTarget(overlay, {
                onDragOver: e => {
                    dom_1.$5O.stop(e.eventData, true);
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
            this.hb.activate(active);
            this.ub.focus();
        }
        isLayoutCentered() {
            if (this.hb) {
                return this.hb.isActive();
            }
            return false;
        }
        Sb(options) {
            // Grid Widget (with previous UI state)
            let restoreError = false;
            if (!options || options.restorePreviousState) {
                restoreError = !this.Tb();
            }
            // Grid Widget (no previous UI state or failed to restore)
            if (!this.ib || restoreError) {
                const initialGroup = this.Gb();
                this.Vb(new grid_1.$iR(initialGroup));
                // Ensure a group is active
                this.Hb(initialGroup);
            }
            // Update container
            this.Wb();
            // Notify group index change we created the entire grid
            this.Xb();
        }
        Tb() {
            const uiState = this.cb[$Sxb_1.a];
            if (uiState?.serializedGrid) {
                try {
                    // MRU
                    this.fb = uiState.mostRecentActiveGroups;
                    // Grid Widget
                    this.Ub(uiState.serializedGrid, uiState.activeGroup);
                    // Ensure last active group has focus
                    this.ub.focus();
                }
                catch (error) {
                    // Log error
                    (0, errors_1.$Y)(new Error(`Error restoring editor grid widget: ${error} (with state: ${JSON.stringify(uiState)})`));
                    // Clear any state we have from the failing restore
                    this.eb.forEach(group => group.dispose());
                    this.eb.clear();
                    this.fb = [];
                    return false; // failure
                }
            }
            return true; // success
        }
        Ub(serializedGrid, activeGroupId, editorGroupViewsToReuse) {
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
            const gridWidget = grid_1.$iR.deserialize(serializedGrid, {
                fromJSON: (serializedEditorGroup) => {
                    let groupView;
                    if (reuseGroupViews.length > 0) {
                        groupView = reuseGroupViews.shift();
                    }
                    else {
                        groupView = this.Gb(serializedEditorGroup);
                    }
                    groupViews.push(groupView);
                    if (groupView.id === activeGroupId) {
                        this.Hb(groupView);
                    }
                    return groupView;
                }
            }, { styles: { separatorBorder: this.Pb } });
            // If the active group was not found when restoring the grid
            // make sure to make at least one group active. We always need
            // an active group.
            if (!this.ub) {
                this.Hb(groupViews[0]);
            }
            // Validate MRU group views matches grid widget state
            if (this.fb.some(groupId => !this.getGroup(groupId))) {
                this.fb = groupViews.map(group => group.id);
            }
            // Set it
            this.Vb(gridWidget);
        }
        Vb(gridWidget) {
            let boundarySashes = {};
            if (this.ib) {
                boundarySashes = this.ib.boundarySashes;
                this.ib.dispose();
            }
            this.ib = gridWidget;
            this.ib.boundarySashes = boundarySashes;
            this.jb.gridWidget = gridWidget;
            this.Z.input = gridWidget.onDidChange;
            this.ab.input = gridWidget.onDidScroll;
            this.Y.fire(undefined);
        }
        Wb() {
            const container = (0, types_1.$uf)(this.gb);
            container.classList.toggle('empty', this.Yb);
        }
        Xb() {
            this.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */).forEach((group, index) => group.notifyIndexChanged(index));
        }
        get Yb() {
            return this.count === 1 && this.ub.isEmpty;
        }
        setBoundarySashes(sashes) {
            this.ib.boundarySashes = sashes;
            this.hb.boundarySashes = sashes;
        }
        layout(width, height, top, left) {
            this.rb = top;
            this.sb = left;
            // Layout contents
            const contentAreaSize = super.N(width, height).contentSize;
            // Layout editor container
            this.Zb(dom_1.$BO.lift(contentAreaSize), top, left);
        }
        Zb(dimension, top = this.rb, left = this.sb) {
            this.tb = dimension;
            // Layout Grid
            this.hb.layout(this.tb.width, this.tb.height, top, left);
            // Event
            this.y.fire(dimension);
        }
        G() {
            // Persist grid UI state
            if (this.ib) {
                const uiState = {
                    serializedGrid: this.ib.serialize(),
                    activeGroup: this.ub.id,
                    mostRecentActiveGroups: this.fb
                };
                if (this.Yb) {
                    delete this.cb[$Sxb_1.a];
                }
                else {
                    this.cb[$Sxb_1.a] = uiState;
                }
            }
            // Persist centered view state
            if (this.hb) {
                const centeredLayoutState = this.hb.state;
                if (this.hb.isDefault(centeredLayoutState)) {
                    delete this.db[$Sxb_1.b];
                }
                else {
                    this.db[$Sxb_1.b] = centeredLayoutState;
                }
            }
            super.G();
        }
        toJSON() {
            return {
                type: "workbench.parts.editor" /* Parts.EDITOR_PART */
            };
        }
        dispose() {
            // Forward to all groups
            this.eb.forEach(group => group.dispose());
            this.eb.clear();
            // Grid widget
            this.ib?.dispose();
            super.dispose();
        }
    };
    exports.$Sxb = $Sxb;
    exports.$Sxb = $Sxb = $Sxb_1 = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, themeService_1.$gv),
        __param(2, configuration_1.$8h),
        __param(3, storage_1.$Vo),
        __param(4, layoutService_1.$Meb)
    ], $Sxb);
    let EditorDropService = class EditorDropService {
        constructor(a) {
            this.a = a;
        }
        createEditorDropTarget(container, delegate) {
            return this.a.createEditorDropTarget(container, delegate);
        }
    };
    EditorDropService = __decorate([
        __param(0, editorGroupsService_1.$5C)
    ], EditorDropService);
    (0, extensions_1.$mr)(editorGroupsService_1.$5C, $Sxb, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(editorDropService_1.$efb, EditorDropService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=editorPart.js.map