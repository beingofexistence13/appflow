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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/compositeBar", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/browser/parts/compositeBarActions", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/platform/contextview/browser/contextView", "vs/base/browser/ui/widget", "vs/base/common/types", "vs/base/common/event", "vs/workbench/common/views", "vs/workbench/browser/dnd", "vs/base/browser/touch"], function (require, exports, nls_1, actions_1, errors_1, lifecycle_1, instantiation_1, actionbar_1, compositeBarActions_1, dom_1, mouseEvent_1, contextView_1, widget_1, types_1, event_1, views_1, dnd_1, touch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1xb = exports.$Zxb = void 0;
    class $Zxb {
        constructor(a, b, d, f, g) {
            this.a = a;
            this.b = b;
            this.d = d;
            this.f = f;
            this.g = g;
        }
        drop(data, targetCompositeId, originalEvent, before) {
            const dragData = data.getData();
            if (dragData.type === 'composite') {
                const currentContainer = this.a.getViewContainerById(dragData.id);
                const currentLocation = this.a.getViewContainerLocation(currentContainer);
                // ... on the same composite bar
                if (currentLocation === this.b) {
                    if (targetCompositeId) {
                        this.f(dragData.id, targetCompositeId, before);
                    }
                }
                // ... on a different composite bar
                else {
                    const viewsToMove = this.a.getViewContainerModel(currentContainer).allViewDescriptors;
                    if (viewsToMove.some(v => !v.canMoveView)) {
                        return;
                    }
                    this.a.moveViewContainerToLocation(currentContainer, this.b, this.h(targetCompositeId, before));
                }
            }
            if (dragData.type === 'view') {
                const viewToMove = this.a.getViewDescriptorById(dragData.id);
                if (viewToMove && viewToMove.canMoveView) {
                    this.a.moveViewToLocation(viewToMove, this.b);
                    const newContainer = this.a.getViewContainerByViewId(viewToMove.id);
                    if (targetCompositeId) {
                        this.f(newContainer.id, targetCompositeId, before);
                    }
                    this.d(newContainer.id, true).then(composite => {
                        composite?.openView(viewToMove.id, true);
                    });
                }
            }
        }
        onDragEnter(data, targetCompositeId, originalEvent) {
            return this.j(data, targetCompositeId);
        }
        onDragOver(data, targetCompositeId, originalEvent) {
            return this.j(data, targetCompositeId);
        }
        h(targetId, before2d) {
            if (!targetId) {
                return undefined;
            }
            const items = this.g();
            const before = this.b === 1 /* ViewContainerLocation.Panel */ ? before2d?.horizontallyBefore : before2d?.verticallyBefore;
            return items.filter(item => item.visible).findIndex(item => item.id === targetId) + (before ? 0 : 1);
        }
        j(data, targetCompositeId) {
            const dragData = data.getData();
            if (dragData.type === 'composite') {
                // Dragging a composite
                const currentContainer = this.a.getViewContainerById(dragData.id);
                const currentLocation = this.a.getViewContainerLocation(currentContainer);
                // ... to the same composite location
                if (currentLocation === this.b) {
                    return dragData.id !== targetCompositeId;
                }
                // ... to another composite location
                const draggedViews = this.a.getViewContainerModel(currentContainer).allViewDescriptors;
                // ... all views must be movable
                return !draggedViews.some(view => !view.canMoveView);
            }
            else {
                // Dragging an individual view
                const viewDescriptor = this.a.getViewDescriptorById(dragData.id);
                // ... that cannot move
                if (!viewDescriptor || !viewDescriptor.canMoveView) {
                    return false;
                }
                // ... to create a view container
                return true;
            }
        }
    }
    exports.$Zxb = $Zxb;
    let $1xb = class $1xb extends widget_1.$IP {
        constructor(items, w, y, J, L) {
            super();
            this.w = w;
            this.y = y;
            this.J = J;
            this.L = L;
            this.a = this.B(new event_1.$fd());
            this.onDidChange = this.a.event;
            this.r = new CompositeBarModel(items, w);
            this.s = [];
            this.t = new Map();
            this.P(this.r.visibleItems);
        }
        getCompositeBarItems() {
            return [...this.r.items];
        }
        setCompositeBarItems(items) {
            if (this.r.setItems(items)) {
                this.Q();
            }
        }
        getPinnedComposites() {
            return this.r.pinnedItems;
        }
        getVisibleComposites() {
            return this.r.visibleItems;
        }
        create(parent) {
            const actionBarDiv = parent.appendChild((0, dom_1.$)('.composite-bar'));
            this.g = this.B(new actionbar_1.$1P(actionBarDiv, {
                actionViewItemProvider: action => {
                    if (action instanceof compositeBarActions_1.$Etb) {
                        return this.n;
                    }
                    const item = this.r.findItem(action.id);
                    return item && this.y.createInstance(compositeBarActions_1.$Gtb, { draggable: true, colors: this.w.colors, icon: this.w.icon, hoverOptions: this.w.activityHoverOptions }, action, item.pinnedAction, item.toggleBadgeAction, compositeId => this.w.getContextMenuActionsForComposite(compositeId), () => this.getContextMenuActions(), this.w.dndHandler, this);
                },
                orientation: this.w.orientation,
                ariaLabel: (0, nls_1.localize)(0, null),
                ariaRole: 'tablist',
                animated: false,
                preventLoopNavigation: this.w.preventLoopNavigation,
                triggerKeys: { keyDown: true }
            }));
            // Contextmenu for composites
            this.B((0, dom_1.$nO)(parent, dom_1.$3O.CONTEXT_MENU, e => this.S(e)));
            this.B(touch_1.$EP.addTarget(parent));
            this.B((0, dom_1.$nO)(parent, touch_1.EventType.Contextmenu, e => this.S(e)));
            // Register a drop target on the whole bar to prevent forbidden feedback
            let insertDropBefore = undefined;
            this.B(dnd_1.$zeb.INSTANCE.registerTarget(parent, {
                onDragOver: (e) => {
                    // don't add feedback if this is over the composite bar actions or there are no actions
                    const visibleItems = this.getVisibleComposites();
                    if (!visibleItems.length || (e.eventData.target && (0, dom_1.$NO)(e.eventData.target, actionBarDiv))) {
                        insertDropBefore = this.N(parent, false, false, true);
                        return;
                    }
                    const insertAtFront = this.M(actionBarDiv, e.eventData);
                    const target = insertAtFront ? visibleItems[0] : visibleItems[visibleItems.length - 1];
                    const validDropTarget = this.w.dndHandler.onDragOver(e.dragAndDropData, target.id, e.eventData);
                    (0, dnd_1.$Aeb)(e.eventData.dataTransfer, 'move', validDropTarget);
                    insertDropBefore = this.N(parent, validDropTarget, insertAtFront, true);
                },
                onDragLeave: (e) => {
                    insertDropBefore = this.N(parent, false, false, false);
                },
                onDragEnd: (e) => {
                    insertDropBefore = this.N(parent, false, false, false);
                },
                onDrop: (e) => {
                    const visibleItems = this.getVisibleComposites();
                    if (visibleItems.length) {
                        const target = this.M(actionBarDiv, e.eventData) ? visibleItems[0] : visibleItems[visibleItems.length - 1];
                        this.w.dndHandler.drop(e.dragAndDropData, target.id, e.eventData, insertDropBefore);
                    }
                    insertDropBefore = this.N(parent, false, false, false);
                }
            }));
            return actionBarDiv;
        }
        M(element, event) {
            const rect = element.getBoundingClientRect();
            const posX = event.clientX;
            const posY = event.clientY;
            switch (this.w.orientation) {
                case 0 /* ActionsOrientation.HORIZONTAL */:
                    return posX < rect.left;
                case 1 /* ActionsOrientation.VERTICAL */:
                    return posY < rect.top;
            }
        }
        N(element, showFeedback, front, isDragging) {
            element.classList.toggle('dragged-over', isDragging);
            element.classList.toggle('dragged-over-head', showFeedback && front);
            element.classList.toggle('dragged-over-tail', showFeedback && !front);
            if (!showFeedback) {
                return undefined;
            }
            return { verticallyBefore: front, horizontallyBefore: front };
        }
        focus(index) {
            this.g?.focus(index);
        }
        recomputeSizes() {
            this.P(this.r.visibleItems);
        }
        layout(dimension) {
            this.b = dimension;
            if (dimension.height === 0 || dimension.width === 0) {
                // Do not layout if not visible. Otherwise the size measurment would be computed wrongly
                return;
            }
            if (this.t.size === 0) {
                // Compute size of each composite by getting the size from the css renderer
                // Size is later used for overflow computation
                this.P(this.r.visibleItems);
            }
            this.Q();
        }
        addComposite({ id, name, order, requestedIndex }) {
            if (this.r.add(id, name, order, requestedIndex)) {
                this.P([this.r.findItem(id)]);
                this.Q();
            }
        }
        removeComposite(id) {
            // If it pinned, unpin it first
            if (this.isPinned(id)) {
                this.unpin(id);
            }
            // Remove from the model
            if (this.r.remove(id)) {
                this.Q();
            }
        }
        hideComposite(id) {
            if (this.r.hide(id)) {
                this.O(id);
                this.Q();
            }
        }
        activateComposite(id) {
            const previousActiveItem = this.r.activeItem;
            if (this.r.activate(id)) {
                // Update if current composite is neither visible nor pinned
                // or previous active composite is not pinned
                if (this.s.indexOf(id) === -1 || (!!this.r.activeItem && !this.r.activeItem.pinned) || (previousActiveItem && !previousActiveItem.pinned)) {
                    this.Q();
                }
            }
        }
        deactivateComposite(id) {
            const previousActiveItem = this.r.activeItem;
            if (this.r.deactivate()) {
                if (previousActiveItem && !previousActiveItem.pinned) {
                    this.Q();
                }
            }
        }
        showActivity(compositeId, badge, clazz, priority) {
            if (!badge) {
                throw (0, errors_1.$5)('badge');
            }
            if (typeof priority !== 'number') {
                priority = 0;
            }
            const activity = { badge, clazz, priority };
            this.r.addActivity(compositeId, activity);
            return (0, lifecycle_1.$ic)(() => this.r.removeActivity(compositeId, activity));
        }
        async pin(compositeId, open) {
            if (this.r.setPinned(compositeId, true)) {
                this.Q();
                if (open) {
                    await this.w.openComposite(compositeId);
                    this.activateComposite(compositeId); // Activate after opening
                }
            }
        }
        unpin(compositeId) {
            if (this.r.setPinned(compositeId, false)) {
                this.Q();
                this.O(compositeId);
            }
        }
        areBadgesEnabled(compositeId) {
            return this.L.getViewContainerBadgeEnablementState(compositeId);
        }
        toggleBadgeEnablement(compositeId) {
            this.L.setViewContainerBadgeEnablementState(compositeId, !this.areBadgesEnabled(compositeId));
            this.Q();
            const item = this.r.findItem(compositeId);
            if (item) {
                // TODO @lramos15 how do we tell the activity to re-render the badge? This triggers an onDidChange but isn't the right way to do it.
                // I could add another specific function like `activity.updateBadgeEnablement` would then the activity store the sate?
                item.activityAction.setBadge(item.activityAction.getBadge(), item.activityAction.getClass());
            }
        }
        O(compositeId) {
            const defaultCompositeId = this.w.getDefaultCompositeId();
            // Case: composite is not the active one or the active one is a different one
            // Solv: we do nothing
            if (!this.r.activeItem || this.r.activeItem.id !== compositeId) {
                return;
            }
            // Deactivate itself
            this.deactivateComposite(compositeId);
            // Case: composite is not the default composite and default composite is still showing
            // Solv: we open the default composite
            if (defaultCompositeId && defaultCompositeId !== compositeId && this.isPinned(defaultCompositeId)) {
                this.w.openComposite(defaultCompositeId, true);
            }
            // Case: we closed the default composite
            // Solv: we open the next visible composite from top
            else {
                this.w.openComposite(this.s.filter(cid => cid !== compositeId)[0]);
            }
        }
        isPinned(compositeId) {
            const item = this.r.findItem(compositeId);
            return item?.pinned;
        }
        move(compositeId, toCompositeId, before) {
            if (before !== undefined) {
                const fromIndex = this.r.items.findIndex(c => c.id === compositeId);
                let toIndex = this.r.items.findIndex(c => c.id === toCompositeId);
                if (fromIndex >= 0 && toIndex >= 0) {
                    if (!before && fromIndex > toIndex) {
                        toIndex++;
                    }
                    if (before && fromIndex < toIndex) {
                        toIndex--;
                    }
                    if (toIndex < this.r.items.length && toIndex >= 0 && toIndex !== fromIndex) {
                        if (this.r.move(this.r.items[fromIndex].id, this.r.items[toIndex].id)) {
                            // timeout helps to prevent artifacts from showing up
                            setTimeout(() => this.Q(), 0);
                        }
                    }
                }
            }
            else {
                if (this.r.move(compositeId, toCompositeId)) {
                    // timeout helps to prevent artifacts from showing up
                    setTimeout(() => this.Q(), 0);
                }
            }
        }
        getAction(compositeId) {
            const item = this.r.findItem(compositeId);
            return item?.activityAction;
        }
        P(items) {
            const size = this.w.compositeSize;
            if (size) {
                items.forEach(composite => this.t.set(composite.id, size));
            }
            else {
                const compositeSwitcherBar = this.g;
                if (compositeSwitcherBar && this.b && this.b.height !== 0 && this.b.width !== 0) {
                    // Compute sizes only if visible. Otherwise the size measurment would be computed wrongly.
                    const currentItemsLength = compositeSwitcherBar.viewItems.length;
                    compositeSwitcherBar.push(items.map(composite => composite.activityAction));
                    items.map((composite, index) => this.t.set(composite.id, this.w.orientation === 1 /* ActionsOrientation.VERTICAL */
                        ? compositeSwitcherBar.getHeight(currentItemsLength + index)
                        : compositeSwitcherBar.getWidth(currentItemsLength + index)));
                    items.forEach(() => compositeSwitcherBar.pull(compositeSwitcherBar.viewItems.length - 1));
                }
            }
        }
        Q() {
            const compositeSwitcherBar = this.g;
            if (!compositeSwitcherBar || !this.b) {
                return; // We have not been rendered yet so there is nothing to update.
            }
            let compositesToShow = this.r.visibleItems.filter(item => item.pinned
                || (this.r.activeItem && this.r.activeItem.id === item.id) /* Show the active composite even if it is not pinned */).map(item => item.id);
            // Ensure we are not showing more composites than we have height for
            let maxVisible = compositesToShow.length;
            const totalComposites = compositesToShow.length;
            let size = 0;
            const limit = this.w.orientation === 1 /* ActionsOrientation.VERTICAL */ ? this.b.height : this.b.width;
            // Add composites while they fit
            for (let i = 0; i < compositesToShow.length; i++) {
                const compositeSize = this.t.get(compositesToShow[i]);
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
            if (this.r.activeItem && compositesToShow.every(compositeId => !!this.r.activeItem && compositeId !== this.r.activeItem.id)) {
                size += this.t.get(this.r.activeItem.id);
                compositesToShow.push(this.r.activeItem.id);
            }
            // The active composite might have pushed us over the limit
            // Keep popping the composite before the active one until it fits
            // If even the active one doesn't fit, we will resort to overflow
            while (size > limit && compositesToShow.length) {
                const removedComposite = compositesToShow.length > 1 ? compositesToShow.splice(compositesToShow.length - 2, 1)[0] : compositesToShow.pop();
                size -= this.t.get(removedComposite);
            }
            // We are overflowing, add the overflow size
            if (totalComposites > compositesToShow.length) {
                size += this.w.overflowActionSize;
            }
            // Check if we need to make extra room for the overflow action
            while (size > limit && compositesToShow.length) {
                const removedComposite = compositesToShow.length > 1 && compositesToShow[compositesToShow.length - 1] === this.r.activeItem?.id ?
                    compositesToShow.splice(compositesToShow.length - 2, 1)[0] : compositesToShow.pop();
                size -= this.t.get(removedComposite);
            }
            // Remove the overflow action if there are no overflows
            if (totalComposites === compositesToShow.length && this.h) {
                compositeSwitcherBar.pull(compositeSwitcherBar.length() - 1);
                this.h.dispose();
                this.h = undefined;
                this.n?.dispose();
                this.n = undefined;
            }
            // Pull out composites that overflow or got hidden
            const compositesToRemove = [];
            this.s.forEach((compositeId, index) => {
                if (!compositesToShow.includes(compositeId)) {
                    compositesToRemove.push(index);
                }
            });
            compositesToRemove.reverse().forEach(index => {
                const actionViewItem = compositeSwitcherBar.viewItems[index];
                compositeSwitcherBar.pull(index);
                actionViewItem.dispose();
                this.s.splice(index, 1);
            });
            // Update the positions of the composites
            compositesToShow.forEach((compositeId, newIndex) => {
                const currentIndex = this.s.indexOf(compositeId);
                if (newIndex !== currentIndex) {
                    if (currentIndex !== -1) {
                        const actionViewItem = compositeSwitcherBar.viewItems[currentIndex];
                        compositeSwitcherBar.pull(currentIndex);
                        actionViewItem.dispose();
                        this.s.splice(currentIndex, 1);
                    }
                    compositeSwitcherBar.push(this.r.findItem(compositeId).activityAction, { label: true, icon: this.w.icon, index: newIndex });
                    this.s.splice(newIndex, 0, compositeId);
                }
            });
            // Add overflow action as needed
            if (totalComposites > compositesToShow.length && !this.h) {
                this.h = this.y.createInstance(compositeBarActions_1.$Etb, () => {
                    this.n?.showMenu();
                });
                this.n = this.y.createInstance(compositeBarActions_1.$Ftb, this.h, () => this.R(), () => this.r.activeItem ? this.r.activeItem.id : undefined, compositeId => {
                    const item = this.r.findItem(compositeId);
                    return item?.activity[0]?.badge;
                }, this.w.getOnCompositeClickAction, this.w.colors, this.w.activityHoverOptions);
                compositeSwitcherBar.push(this.h, { label: false, icon: true });
            }
            this.a.fire();
        }
        R() {
            let overflowingIds = this.r.visibleItems.filter(item => item.pinned).map(item => item.id);
            // Show the active composite even if it is not pinned
            if (this.r.activeItem && !this.r.activeItem.pinned) {
                overflowingIds.push(this.r.activeItem.id);
            }
            overflowingIds = overflowingIds.filter(compositeId => !this.s.includes(compositeId));
            return this.r.visibleItems.filter(c => overflowingIds.includes(c.id)).map(item => { return { id: item.id, name: this.getAction(item.id)?.label || item.name }; });
        }
        S(e) {
            dom_1.$5O.stop(e, true);
            const event = new mouseEvent_1.$eO(e);
            this.J.showContextMenu({
                getAnchor: () => event,
                getActions: () => this.getContextMenuActions(e)
            });
        }
        getContextMenuActions(e) {
            const actions = this.r.visibleItems
                .map(({ id, name, activityAction }) => ((0, actions_1.$li)({
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
            this.w.fillExtraContextMenuActions(actions, e);
            return actions;
        }
    };
    exports.$1xb = $1xb;
    exports.$1xb = $1xb = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, contextView_1.$WZ),
        __param(4, views_1.$_E)
    ], $1xb);
    class CompositeBarModel {
        get items() { return this.a; }
        constructor(items, options) {
            this.a = [];
            this.b = options;
            this.setItems(items);
        }
        setItems(items) {
            const result = [];
            let hasChanges = false;
            if (!this.items || this.items.length === 0) {
                this.a = items.map(i => this.d(i.id, i.name, i.order, i.pinned, i.visible));
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
                        result.push(this.d(newItem.id, newItem.name, newItem.order, newItem.pinned, newItem.visible));
                        hasChanges = true;
                    }
                }
                this.a = result;
            }
            return hasChanges;
        }
        get visibleItems() {
            return this.items.filter(item => item.visible);
        }
        get pinnedItems() {
            return this.items.filter(item => item.visible && item.pinned);
        }
        d(id, name, order, pinned, visible) {
            const options = this.b;
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
                if (!(0, types_1.$sf)(order)) {
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
                const item = this.d(id, name, order, true, true);
                if (!(0, types_1.$sf)(requestedIndex)) {
                    let index = 0;
                    let rIndex = requestedIndex;
                    while (rIndex > 0 && index < this.items.length) {
                        if (this.items[index++].visible) {
                            rIndex--;
                        }
                    }
                    this.items.splice(index, 0, item);
                }
                else if ((0, types_1.$sf)(order)) {
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
            const fromIndex = this.f(compositeId);
            const toIndex = this.f(toCompositeId);
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
        f(id) {
            for (let index = 0; index < this.items.length; index++) {
                if (this.items[index].id === id) {
                    return index;
                }
            }
            return -1;
        }
    }
});
//# sourceMappingURL=compositeBar.js.map