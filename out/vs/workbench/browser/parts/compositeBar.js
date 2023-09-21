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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/browser/parts/compositeBarActions", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/platform/contextview/browser/contextView", "vs/base/browser/ui/widget", "vs/base/common/types", "vs/base/common/event", "vs/workbench/common/views", "vs/workbench/browser/dnd", "vs/base/browser/touch"], function (require, exports, nls_1, actions_1, errors_1, lifecycle_1, instantiation_1, actionbar_1, compositeBarActions_1, dom_1, mouseEvent_1, contextView_1, widget_1, types_1, event_1, views_1, dnd_1, touch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompositeBar = exports.CompositeDragAndDrop = void 0;
    class CompositeDragAndDrop {
        constructor(viewDescriptorService, targetContainerLocation, openComposite, moveComposite, getItems) {
            this.viewDescriptorService = viewDescriptorService;
            this.targetContainerLocation = targetContainerLocation;
            this.openComposite = openComposite;
            this.moveComposite = moveComposite;
            this.getItems = getItems;
        }
        drop(data, targetCompositeId, originalEvent, before) {
            const dragData = data.getData();
            if (dragData.type === 'composite') {
                const currentContainer = this.viewDescriptorService.getViewContainerById(dragData.id);
                const currentLocation = this.viewDescriptorService.getViewContainerLocation(currentContainer);
                // ... on the same composite bar
                if (currentLocation === this.targetContainerLocation) {
                    if (targetCompositeId) {
                        this.moveComposite(dragData.id, targetCompositeId, before);
                    }
                }
                // ... on a different composite bar
                else {
                    const viewsToMove = this.viewDescriptorService.getViewContainerModel(currentContainer).allViewDescriptors;
                    if (viewsToMove.some(v => !v.canMoveView)) {
                        return;
                    }
                    this.viewDescriptorService.moveViewContainerToLocation(currentContainer, this.targetContainerLocation, this.getTargetIndex(targetCompositeId, before));
                }
            }
            if (dragData.type === 'view') {
                const viewToMove = this.viewDescriptorService.getViewDescriptorById(dragData.id);
                if (viewToMove && viewToMove.canMoveView) {
                    this.viewDescriptorService.moveViewToLocation(viewToMove, this.targetContainerLocation);
                    const newContainer = this.viewDescriptorService.getViewContainerByViewId(viewToMove.id);
                    if (targetCompositeId) {
                        this.moveComposite(newContainer.id, targetCompositeId, before);
                    }
                    this.openComposite(newContainer.id, true).then(composite => {
                        composite?.openView(viewToMove.id, true);
                    });
                }
            }
        }
        onDragEnter(data, targetCompositeId, originalEvent) {
            return this.canDrop(data, targetCompositeId);
        }
        onDragOver(data, targetCompositeId, originalEvent) {
            return this.canDrop(data, targetCompositeId);
        }
        getTargetIndex(targetId, before2d) {
            if (!targetId) {
                return undefined;
            }
            const items = this.getItems();
            const before = this.targetContainerLocation === 1 /* ViewContainerLocation.Panel */ ? before2d?.horizontallyBefore : before2d?.verticallyBefore;
            return items.filter(item => item.visible).findIndex(item => item.id === targetId) + (before ? 0 : 1);
        }
        canDrop(data, targetCompositeId) {
            const dragData = data.getData();
            if (dragData.type === 'composite') {
                // Dragging a composite
                const currentContainer = this.viewDescriptorService.getViewContainerById(dragData.id);
                const currentLocation = this.viewDescriptorService.getViewContainerLocation(currentContainer);
                // ... to the same composite location
                if (currentLocation === this.targetContainerLocation) {
                    return dragData.id !== targetCompositeId;
                }
                // ... to another composite location
                const draggedViews = this.viewDescriptorService.getViewContainerModel(currentContainer).allViewDescriptors;
                // ... all views must be movable
                return !draggedViews.some(view => !view.canMoveView);
            }
            else {
                // Dragging an individual view
                const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(dragData.id);
                // ... that cannot move
                if (!viewDescriptor || !viewDescriptor.canMoveView) {
                    return false;
                }
                // ... to create a view container
                return true;
            }
        }
    }
    exports.CompositeDragAndDrop = CompositeDragAndDrop;
    let CompositeBar = class CompositeBar extends widget_1.Widget {
        constructor(items, options, instantiationService, contextMenuService, viewDescriptorService) {
            super();
            this.options = options;
            this.instantiationService = instantiationService;
            this.contextMenuService = contextMenuService;
            this.viewDescriptorService = viewDescriptorService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.model = new CompositeBarModel(items, options);
            this.visibleComposites = [];
            this.compositeSizeInBar = new Map();
            this.computeSizes(this.model.visibleItems);
        }
        getCompositeBarItems() {
            return [...this.model.items];
        }
        setCompositeBarItems(items) {
            if (this.model.setItems(items)) {
                this.updateCompositeSwitcher();
            }
        }
        getPinnedComposites() {
            return this.model.pinnedItems;
        }
        getVisibleComposites() {
            return this.model.visibleItems;
        }
        create(parent) {
            const actionBarDiv = parent.appendChild((0, dom_1.$)('.composite-bar'));
            this.compositeSwitcherBar = this._register(new actionbar_1.ActionBar(actionBarDiv, {
                actionViewItemProvider: action => {
                    if (action instanceof compositeBarActions_1.CompositeOverflowActivityAction) {
                        return this.compositeOverflowActionViewItem;
                    }
                    const item = this.model.findItem(action.id);
                    return item && this.instantiationService.createInstance(compositeBarActions_1.CompositeActionViewItem, { draggable: true, colors: this.options.colors, icon: this.options.icon, hoverOptions: this.options.activityHoverOptions }, action, item.pinnedAction, item.toggleBadgeAction, compositeId => this.options.getContextMenuActionsForComposite(compositeId), () => this.getContextMenuActions(), this.options.dndHandler, this);
                },
                orientation: this.options.orientation,
                ariaLabel: (0, nls_1.localize)('activityBarAriaLabel', "Active View Switcher"),
                ariaRole: 'tablist',
                animated: false,
                preventLoopNavigation: this.options.preventLoopNavigation,
                triggerKeys: { keyDown: true }
            }));
            // Contextmenu for composites
            this._register((0, dom_1.addDisposableListener)(parent, dom_1.EventType.CONTEXT_MENU, e => this.showContextMenu(e)));
            this._register(touch_1.Gesture.addTarget(parent));
            this._register((0, dom_1.addDisposableListener)(parent, touch_1.EventType.Contextmenu, e => this.showContextMenu(e)));
            // Register a drop target on the whole bar to prevent forbidden feedback
            let insertDropBefore = undefined;
            this._register(dnd_1.CompositeDragAndDropObserver.INSTANCE.registerTarget(parent, {
                onDragOver: (e) => {
                    // don't add feedback if this is over the composite bar actions or there are no actions
                    const visibleItems = this.getVisibleComposites();
                    if (!visibleItems.length || (e.eventData.target && (0, dom_1.isAncestor)(e.eventData.target, actionBarDiv))) {
                        insertDropBefore = this.updateFromDragging(parent, false, false, true);
                        return;
                    }
                    const insertAtFront = this.insertAtFront(actionBarDiv, e.eventData);
                    const target = insertAtFront ? visibleItems[0] : visibleItems[visibleItems.length - 1];
                    const validDropTarget = this.options.dndHandler.onDragOver(e.dragAndDropData, target.id, e.eventData);
                    (0, dnd_1.toggleDropEffect)(e.eventData.dataTransfer, 'move', validDropTarget);
                    insertDropBefore = this.updateFromDragging(parent, validDropTarget, insertAtFront, true);
                },
                onDragLeave: (e) => {
                    insertDropBefore = this.updateFromDragging(parent, false, false, false);
                },
                onDragEnd: (e) => {
                    insertDropBefore = this.updateFromDragging(parent, false, false, false);
                },
                onDrop: (e) => {
                    const visibleItems = this.getVisibleComposites();
                    if (visibleItems.length) {
                        const target = this.insertAtFront(actionBarDiv, e.eventData) ? visibleItems[0] : visibleItems[visibleItems.length - 1];
                        this.options.dndHandler.drop(e.dragAndDropData, target.id, e.eventData, insertDropBefore);
                    }
                    insertDropBefore = this.updateFromDragging(parent, false, false, false);
                }
            }));
            return actionBarDiv;
        }
        insertAtFront(element, event) {
            const rect = element.getBoundingClientRect();
            const posX = event.clientX;
            const posY = event.clientY;
            switch (this.options.orientation) {
                case 0 /* ActionsOrientation.HORIZONTAL */:
                    return posX < rect.left;
                case 1 /* ActionsOrientation.VERTICAL */:
                    return posY < rect.top;
            }
        }
        updateFromDragging(element, showFeedback, front, isDragging) {
            element.classList.toggle('dragged-over', isDragging);
            element.classList.toggle('dragged-over-head', showFeedback && front);
            element.classList.toggle('dragged-over-tail', showFeedback && !front);
            if (!showFeedback) {
                return undefined;
            }
            return { verticallyBefore: front, horizontallyBefore: front };
        }
        focus(index) {
            this.compositeSwitcherBar?.focus(index);
        }
        recomputeSizes() {
            this.computeSizes(this.model.visibleItems);
        }
        layout(dimension) {
            this.dimension = dimension;
            if (dimension.height === 0 || dimension.width === 0) {
                // Do not layout if not visible. Otherwise the size measurment would be computed wrongly
                return;
            }
            if (this.compositeSizeInBar.size === 0) {
                // Compute size of each composite by getting the size from the css renderer
                // Size is later used for overflow computation
                this.computeSizes(this.model.visibleItems);
            }
            this.updateCompositeSwitcher();
        }
        addComposite({ id, name, order, requestedIndex }) {
            if (this.model.add(id, name, order, requestedIndex)) {
                this.computeSizes([this.model.findItem(id)]);
                this.updateCompositeSwitcher();
            }
        }
        removeComposite(id) {
            // If it pinned, unpin it first
            if (this.isPinned(id)) {
                this.unpin(id);
            }
            // Remove from the model
            if (this.model.remove(id)) {
                this.updateCompositeSwitcher();
            }
        }
        hideComposite(id) {
            if (this.model.hide(id)) {
                this.resetActiveComposite(id);
                this.updateCompositeSwitcher();
            }
        }
        activateComposite(id) {
            const previousActiveItem = this.model.activeItem;
            if (this.model.activate(id)) {
                // Update if current composite is neither visible nor pinned
                // or previous active composite is not pinned
                if (this.visibleComposites.indexOf(id) === -1 || (!!this.model.activeItem && !this.model.activeItem.pinned) || (previousActiveItem && !previousActiveItem.pinned)) {
                    this.updateCompositeSwitcher();
                }
            }
        }
        deactivateComposite(id) {
            const previousActiveItem = this.model.activeItem;
            if (this.model.deactivate()) {
                if (previousActiveItem && !previousActiveItem.pinned) {
                    this.updateCompositeSwitcher();
                }
            }
        }
        showActivity(compositeId, badge, clazz, priority) {
            if (!badge) {
                throw (0, errors_1.illegalArgument)('badge');
            }
            if (typeof priority !== 'number') {
                priority = 0;
            }
            const activity = { badge, clazz, priority };
            this.model.addActivity(compositeId, activity);
            return (0, lifecycle_1.toDisposable)(() => this.model.removeActivity(compositeId, activity));
        }
        async pin(compositeId, open) {
            if (this.model.setPinned(compositeId, true)) {
                this.updateCompositeSwitcher();
                if (open) {
                    await this.options.openComposite(compositeId);
                    this.activateComposite(compositeId); // Activate after opening
                }
            }
        }
        unpin(compositeId) {
            if (this.model.setPinned(compositeId, false)) {
                this.updateCompositeSwitcher();
                this.resetActiveComposite(compositeId);
            }
        }
        areBadgesEnabled(compositeId) {
            return this.viewDescriptorService.getViewContainerBadgeEnablementState(compositeId);
        }
        toggleBadgeEnablement(compositeId) {
            this.viewDescriptorService.setViewContainerBadgeEnablementState(compositeId, !this.areBadgesEnabled(compositeId));
            this.updateCompositeSwitcher();
            const item = this.model.findItem(compositeId);
            if (item) {
                // TODO @lramos15 how do we tell the activity to re-render the badge? This triggers an onDidChange but isn't the right way to do it.
                // I could add another specific function like `activity.updateBadgeEnablement` would then the activity store the sate?
                item.activityAction.setBadge(item.activityAction.getBadge(), item.activityAction.getClass());
            }
        }
        resetActiveComposite(compositeId) {
            const defaultCompositeId = this.options.getDefaultCompositeId();
            // Case: composite is not the active one or the active one is a different one
            // Solv: we do nothing
            if (!this.model.activeItem || this.model.activeItem.id !== compositeId) {
                return;
            }
            // Deactivate itself
            this.deactivateComposite(compositeId);
            // Case: composite is not the default composite and default composite is still showing
            // Solv: we open the default composite
            if (defaultCompositeId && defaultCompositeId !== compositeId && this.isPinned(defaultCompositeId)) {
                this.options.openComposite(defaultCompositeId, true);
            }
            // Case: we closed the default composite
            // Solv: we open the next visible composite from top
            else {
                this.options.openComposite(this.visibleComposites.filter(cid => cid !== compositeId)[0]);
            }
        }
        isPinned(compositeId) {
            const item = this.model.findItem(compositeId);
            return item?.pinned;
        }
        move(compositeId, toCompositeId, before) {
            if (before !== undefined) {
                const fromIndex = this.model.items.findIndex(c => c.id === compositeId);
                let toIndex = this.model.items.findIndex(c => c.id === toCompositeId);
                if (fromIndex >= 0 && toIndex >= 0) {
                    if (!before && fromIndex > toIndex) {
                        toIndex++;
                    }
                    if (before && fromIndex < toIndex) {
                        toIndex--;
                    }
                    if (toIndex < this.model.items.length && toIndex >= 0 && toIndex !== fromIndex) {
                        if (this.model.move(this.model.items[fromIndex].id, this.model.items[toIndex].id)) {
                            // timeout helps to prevent artifacts from showing up
                            setTimeout(() => this.updateCompositeSwitcher(), 0);
                        }
                    }
                }
            }
            else {
                if (this.model.move(compositeId, toCompositeId)) {
                    // timeout helps to prevent artifacts from showing up
                    setTimeout(() => this.updateCompositeSwitcher(), 0);
                }
            }
        }
        getAction(compositeId) {
            const item = this.model.findItem(compositeId);
            return item?.activityAction;
        }
        computeSizes(items) {
            const size = this.options.compositeSize;
            if (size) {
                items.forEach(composite => this.compositeSizeInBar.set(composite.id, size));
            }
            else {
                const compositeSwitcherBar = this.compositeSwitcherBar;
                if (compositeSwitcherBar && this.dimension && this.dimension.height !== 0 && this.dimension.width !== 0) {
                    // Compute sizes only if visible. Otherwise the size measurment would be computed wrongly.
                    const currentItemsLength = compositeSwitcherBar.viewItems.length;
                    compositeSwitcherBar.push(items.map(composite => composite.activityAction));
                    items.map((composite, index) => this.compositeSizeInBar.set(composite.id, this.options.orientation === 1 /* ActionsOrientation.VERTICAL */
                        ? compositeSwitcherBar.getHeight(currentItemsLength + index)
                        : compositeSwitcherBar.getWidth(currentItemsLength + index)));
                    items.forEach(() => compositeSwitcherBar.pull(compositeSwitcherBar.viewItems.length - 1));
                }
            }
        }
        updateCompositeSwitcher() {
            const compositeSwitcherBar = this.compositeSwitcherBar;
            if (!compositeSwitcherBar || !this.dimension) {
                return; // We have not been rendered yet so there is nothing to update.
            }
            let compositesToShow = this.model.visibleItems.filter(item => item.pinned
                || (this.model.activeItem && this.model.activeItem.id === item.id) /* Show the active composite even if it is not pinned */).map(item => item.id);
            // Ensure we are not showing more composites than we have height for
            let maxVisible = compositesToShow.length;
            const totalComposites = compositesToShow.length;
            let size = 0;
            const limit = this.options.orientation === 1 /* ActionsOrientation.VERTICAL */ ? this.dimension.height : this.dimension.width;
            // Add composites while they fit
            for (let i = 0; i < compositesToShow.length; i++) {
                const compositeSize = this.compositeSizeInBar.get(compositesToShow[i]);
                // Adding this composite will overflow available size, so don't
                if (size + compositeSize > limit) {
                    maxVisible = i;
                    break;
                }
                size += compositeSize;
            }
            // Remove the tail of composites that did not fit
            if (totalComposites > maxVisible) {
                compositesToShow = compositesToShow.slice(0, maxVisible);
            }
            // We always try show the active composite, so re-add it if it was sliced out
            if (this.model.activeItem && compositesToShow.every(compositeId => !!this.model.activeItem && compositeId !== this.model.activeItem.id)) {
                size += this.compositeSizeInBar.get(this.model.activeItem.id);
                compositesToShow.push(this.model.activeItem.id);
            }
            // The active composite might have pushed us over the limit
            // Keep popping the composite before the active one until it fits
            // If even the active one doesn't fit, we will resort to overflow
            while (size > limit && compositesToShow.length) {
                const removedComposite = compositesToShow.length > 1 ? compositesToShow.splice(compositesToShow.length - 2, 1)[0] : compositesToShow.pop();
                size -= this.compositeSizeInBar.get(removedComposite);
            }
            // We are overflowing, add the overflow size
            if (totalComposites > compositesToShow.length) {
                size += this.options.overflowActionSize;
            }
            // Check if we need to make extra room for the overflow action
            while (size > limit && compositesToShow.length) {
                const removedComposite = compositesToShow.length > 1 && compositesToShow[compositesToShow.length - 1] === this.model.activeItem?.id ?
                    compositesToShow.splice(compositesToShow.length - 2, 1)[0] : compositesToShow.pop();
                size -= this.compositeSizeInBar.get(removedComposite);
            }
            // Remove the overflow action if there are no overflows
            if (totalComposites === compositesToShow.length && this.compositeOverflowAction) {
                compositeSwitcherBar.pull(compositeSwitcherBar.length() - 1);
                this.compositeOverflowAction.dispose();
                this.compositeOverflowAction = undefined;
                this.compositeOverflowActionViewItem?.dispose();
                this.compositeOverflowActionViewItem = undefined;
            }
            // Pull out composites that overflow or got hidden
            const compositesToRemove = [];
            this.visibleComposites.forEach((compositeId, index) => {
                if (!compositesToShow.includes(compositeId)) {
                    compositesToRemove.push(index);
                }
            });
            compositesToRemove.reverse().forEach(index => {
                const actionViewItem = compositeSwitcherBar.viewItems[index];
                compositeSwitcherBar.pull(index);
                actionViewItem.dispose();
                this.visibleComposites.splice(index, 1);
            });
            // Update the positions of the composites
            compositesToShow.forEach((compositeId, newIndex) => {
                const currentIndex = this.visibleComposites.indexOf(compositeId);
                if (newIndex !== currentIndex) {
                    if (currentIndex !== -1) {
                        const actionViewItem = compositeSwitcherBar.viewItems[currentIndex];
                        compositeSwitcherBar.pull(currentIndex);
                        actionViewItem.dispose();
                        this.visibleComposites.splice(currentIndex, 1);
                    }
                    compositeSwitcherBar.push(this.model.findItem(compositeId).activityAction, { label: true, icon: this.options.icon, index: newIndex });
                    this.visibleComposites.splice(newIndex, 0, compositeId);
                }
            });
            // Add overflow action as needed
            if (totalComposites > compositesToShow.length && !this.compositeOverflowAction) {
                this.compositeOverflowAction = this.instantiationService.createInstance(compositeBarActions_1.CompositeOverflowActivityAction, () => {
                    this.compositeOverflowActionViewItem?.showMenu();
                });
                this.compositeOverflowActionViewItem = this.instantiationService.createInstance(compositeBarActions_1.CompositeOverflowActivityActionViewItem, this.compositeOverflowAction, () => this.getOverflowingComposites(), () => this.model.activeItem ? this.model.activeItem.id : undefined, compositeId => {
                    const item = this.model.findItem(compositeId);
                    return item?.activity[0]?.badge;
                }, this.options.getOnCompositeClickAction, this.options.colors, this.options.activityHoverOptions);
                compositeSwitcherBar.push(this.compositeOverflowAction, { label: false, icon: true });
            }
            this._onDidChange.fire();
        }
        getOverflowingComposites() {
            let overflowingIds = this.model.visibleItems.filter(item => item.pinned).map(item => item.id);
            // Show the active composite even if it is not pinned
            if (this.model.activeItem && !this.model.activeItem.pinned) {
                overflowingIds.push(this.model.activeItem.id);
            }
            overflowingIds = overflowingIds.filter(compositeId => !this.visibleComposites.includes(compositeId));
            return this.model.visibleItems.filter(c => overflowingIds.includes(c.id)).map(item => { return { id: item.id, name: this.getAction(item.id)?.label || item.name }; });
        }
        showContextMenu(e) {
            dom_1.EventHelper.stop(e, true);
            const event = new mouseEvent_1.StandardMouseEvent(e);
            this.contextMenuService.showContextMenu({
                getAnchor: () => event,
                getActions: () => this.getContextMenuActions(e)
            });
        }
        getContextMenuActions(e) {
            const actions = this.model.visibleItems
                .map(({ id, name, activityAction }) => ((0, actions_1.toAction)({
                id,
                label: this.getAction(id).label || name || id,
                checked: this.isPinned(id),
                enabled: activityAction.enabled,
                run: () => {
                    if (this.isPinned(id)) {
                        this.unpin(id);
                    }
                    else {
                        this.pin(id, true);
                    }
                }
            })));
            this.options.fillExtraContextMenuActions(actions, e);
            return actions;
        }
    };
    exports.CompositeBar = CompositeBar;
    exports.CompositeBar = CompositeBar = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, views_1.IViewDescriptorService)
    ], CompositeBar);
    class CompositeBarModel {
        get items() { return this._items; }
        constructor(items, options) {
            this._items = [];
            this.options = options;
            this.setItems(items);
        }
        setItems(items) {
            const result = [];
            let hasChanges = false;
            if (!this.items || this.items.length === 0) {
                this._items = items.map(i => this.createCompositeBarItem(i.id, i.name, i.order, i.pinned, i.visible));
                hasChanges = true;
            }
            else {
                const existingItems = this.items;
                for (let index = 0; index < items.length; index++) {
                    const newItem = items[index];
                    const existingItem = existingItems.filter(({ id }) => id === newItem.id)[0];
                    if (existingItem) {
                        if (existingItem.pinned !== newItem.pinned ||
                            index !== existingItems.indexOf(existingItem)) {
                            existingItem.pinned = newItem.pinned;
                            result.push(existingItem);
                            hasChanges = true;
                        }
                        else {
                            result.push(existingItem);
                        }
                    }
                    else {
                        result.push(this.createCompositeBarItem(newItem.id, newItem.name, newItem.order, newItem.pinned, newItem.visible));
                        hasChanges = true;
                    }
                }
                this._items = result;
            }
            return hasChanges;
        }
        get visibleItems() {
            return this.items.filter(item => item.visible);
        }
        get pinnedItems() {
            return this.items.filter(item => item.visible && item.pinned);
        }
        createCompositeBarItem(id, name, order, pinned, visible) {
            const options = this.options;
            return {
                id, name, pinned, order, visible,
                activity: [],
                get activityAction() {
                    return options.getActivityAction(id);
                },
                get pinnedAction() {
                    return options.getCompositePinnedAction(id);
                },
                get toggleBadgeAction() {
                    return options.getCompositeBadgeAction(id);
                }
            };
        }
        add(id, name, order, requestedIndex) {
            const item = this.findItem(id);
            if (item) {
                let changed = false;
                item.name = name;
                if (!(0, types_1.isUndefinedOrNull)(order)) {
                    changed = item.order !== order;
                    item.order = order;
                }
                if (!item.visible) {
                    item.visible = true;
                    changed = true;
                }
                return changed;
            }
            else {
                const item = this.createCompositeBarItem(id, name, order, true, true);
                if (!(0, types_1.isUndefinedOrNull)(requestedIndex)) {
                    let index = 0;
                    let rIndex = requestedIndex;
                    while (rIndex > 0 && index < this.items.length) {
                        if (this.items[index++].visible) {
                            rIndex--;
                        }
                    }
                    this.items.splice(index, 0, item);
                }
                else if ((0, types_1.isUndefinedOrNull)(order)) {
                    this.items.push(item);
                }
                else {
                    let index = 0;
                    while (index < this.items.length && typeof this.items[index].order === 'number' && this.items[index].order < order) {
                        index++;
                    }
                    this.items.splice(index, 0, item);
                }
                return true;
            }
        }
        remove(id) {
            for (let index = 0; index < this.items.length; index++) {
                if (this.items[index].id === id) {
                    this.items.splice(index, 1);
                    return true;
                }
            }
            return false;
        }
        hide(id) {
            for (const item of this.items) {
                if (item.id === id) {
                    if (item.visible) {
                        item.visible = false;
                        return true;
                    }
                    return false;
                }
            }
            return false;
        }
        move(compositeId, toCompositeId) {
            const fromIndex = this.findIndex(compositeId);
            const toIndex = this.findIndex(toCompositeId);
            // Make sure both items are known to the model
            if (fromIndex === -1 || toIndex === -1) {
                return false;
            }
            const sourceItem = this.items.splice(fromIndex, 1)[0];
            this.items.splice(toIndex, 0, sourceItem);
            // Make sure a moved composite gets pinned
            sourceItem.pinned = true;
            return true;
        }
        setPinned(id, pinned) {
            for (const item of this.items) {
                if (item.id === id) {
                    if (item.pinned !== pinned) {
                        item.pinned = pinned;
                        return true;
                    }
                    return false;
                }
            }
            return false;
        }
        addActivity(id, activity) {
            const item = this.findItem(id);
            if (item) {
                const stack = item.activity;
                for (let i = 0; i <= stack.length; i++) {
                    if (i === stack.length) {
                        stack.push(activity);
                        break;
                    }
                    else if (stack[i].priority <= activity.priority) {
                        stack.splice(i, 0, activity);
                        break;
                    }
                }
                this.updateActivity(id);
                return true;
            }
            return false;
        }
        removeActivity(id, activity) {
            const item = this.findItem(id);
            if (item) {
                const index = item.activity.indexOf(activity);
                if (index !== -1) {
                    item.activity.splice(index, 1);
                    this.updateActivity(id);
                    return true;
                }
            }
            return false;
        }
        updateActivity(id) {
            const item = this.findItem(id);
            if (item) {
                if (item.activity.length) {
                    const [{ badge, clazz }] = item.activity;
                    item.activityAction.setBadge(badge, clazz);
                }
                else {
                    item.activityAction.setBadge(undefined);
                }
            }
        }
        activate(id) {
            if (!this.activeItem || this.activeItem.id !== id) {
                if (this.activeItem) {
                    this.deactivate();
                }
                for (const item of this.items) {
                    if (item.id === id) {
                        this.activeItem = item;
                        this.activeItem.activityAction.activate();
                        return true;
                    }
                }
            }
            return false;
        }
        deactivate() {
            if (this.activeItem) {
                this.activeItem.activityAction.deactivate();
                this.activeItem = undefined;
                return true;
            }
            return false;
        }
        findItem(id) {
            return this.items.filter(item => item.id === id)[0];
        }
        findIndex(id) {
            for (let index = 0; index < this.items.length; index++) {
                if (this.items[index].id === id) {
                    return index;
                }
            }
            return -1;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9zaXRlQmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvY29tcG9zaXRlQmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlDaEcsTUFBYSxvQkFBb0I7UUFFaEMsWUFDUyxxQkFBNkMsRUFDN0MsdUJBQThDLEVBQzlDLGFBQThFLEVBQzlFLGFBQW9FLEVBQ3BFLFFBQW1DO1lBSm5DLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDN0MsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUF1QjtZQUM5QyxrQkFBYSxHQUFiLGFBQWEsQ0FBaUU7WUFDOUUsa0JBQWEsR0FBYixhQUFhLENBQXVEO1lBQ3BFLGFBQVEsR0FBUixRQUFRLENBQTJCO1FBQ3hDLENBQUM7UUFFTCxJQUFJLENBQUMsSUFBOEIsRUFBRSxpQkFBcUMsRUFBRSxhQUF3QixFQUFFLE1BQWlCO1lBQ3RILE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUVoQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFO2dCQUNsQyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFFLENBQUM7Z0JBQ3ZGLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyx3QkFBd0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUU5RixnQ0FBZ0M7Z0JBQ2hDLElBQUksZUFBZSxLQUFLLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtvQkFDckQsSUFBSSxpQkFBaUIsRUFBRTt3QkFDdEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxDQUFDO3FCQUMzRDtpQkFD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