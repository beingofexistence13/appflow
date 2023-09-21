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
define(["require", "exports", "vs/workbench/common/views", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/base/common/arrays", "vs/base/common/types", "vs/base/common/resources", "vs/base/common/themables", "vs/nls!vs/workbench/services/views/common/viewContainerModel", "vs/platform/log/common/log", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/output/common/output", "vs/base/common/map"], function (require, exports, views_1, contextkey_1, storage_1, platform_1, lifecycle_1, event_1, instantiation_1, uri_1, arrays_1, types_1, resources_1, themables_1, nls_1, log_1, actions_1, actionCommonCategories_1, output_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wAb = exports.$vAb = void 0;
    const VIEWS_LOG_ID = 'views';
    const VIEWS_LOG_NAME = (0, nls_1.localize)(0, null);
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: '_workbench.output.showViewsLog',
                title: { value: 'Show Views Log', original: 'Show Views Log' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(servicesAccessor) {
            const loggerService = servicesAccessor.get(log_1.$6i);
            const outputService = servicesAccessor.get(output_1.$eJ);
            loggerService.setVisibility(VIEWS_LOG_ID, true);
            outputService.showChannel(VIEWS_LOG_ID);
        }
    });
    function $vAb(viewContainerStorageId) { return `${viewContainerStorageId}.hidden`; }
    exports.$vAb = $vAb;
    let ViewDescriptorsState = class ViewDescriptorsState extends lifecycle_1.$kc {
        constructor(viewContainerStorageId, m, n, loggerService) {
            super();
            this.m = m;
            this.n = n;
            this.h = this.B(new event_1.$fd());
            this.onDidChangeStoredState = this.h.event;
            this.j = loggerService.createLogger(VIEWS_LOG_ID, { name: VIEWS_LOG_NAME, hidden: true });
            this.f = $vAb(viewContainerStorageId);
            this.c = viewContainerStorageId;
            this.B(this.n.onDidChangeValue(0 /* StorageScope.PROFILE */, this.f, this.B(new lifecycle_1.$jc()))(() => this.t()));
            this.g = this.u();
        }
        set(id, state) {
            this.g.set(id, state);
        }
        get(id) {
            return this.g.get(id);
        }
        updateState(viewDescriptors) {
            this.r(viewDescriptors);
            this.s(viewDescriptors);
        }
        r(viewDescriptors) {
            const storedViewsStates = this.w();
            for (const viewDescriptor of viewDescriptors) {
                const viewState = this.get(viewDescriptor.id);
                if (viewState) {
                    storedViewsStates[viewDescriptor.id] = {
                        collapsed: !!viewState.collapsed,
                        isHidden: !viewState.visibleWorkspace,
                        size: viewState.size,
                        order: viewDescriptor.workspace && viewState ? viewState.order : undefined
                    };
                }
            }
            if (Object.keys(storedViewsStates).length > 0) {
                this.n.store(this.c, JSON.stringify(storedViewsStates), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.n.remove(this.c, 1 /* StorageScope.WORKSPACE */);
            }
        }
        s(viewDescriptors) {
            const storedGlobalState = this.y();
            for (const viewDescriptor of viewDescriptors) {
                const state = this.get(viewDescriptor.id);
                storedGlobalState.set(viewDescriptor.id, {
                    id: viewDescriptor.id,
                    isHidden: state && viewDescriptor.canToggleVisibility ? !state.visibleGlobal : false,
                    order: !viewDescriptor.workspace && state ? state.order : undefined
                });
            }
            this.z(storedGlobalState);
        }
        t() {
            if (this.F !== this.G() /* This checks if current window changed the value or not */) {
                this.D = undefined;
                const storedViewsVisibilityStates = this.y();
                const storedWorkspaceViewsStates = this.w();
                const changedStates = [];
                for (const [id, storedState] of storedViewsVisibilityStates) {
                    const state = this.get(id);
                    if (state) {
                        if (state.visibleGlobal !== !storedState.isHidden) {
                            if (!storedState.isHidden) {
                                this.j.info(`View visibility state changed: ${id} is now visible`, this.m);
                            }
                            changedStates.push({ id, visible: !storedState.isHidden });
                        }
                    }
                    else {
                        const workspaceViewState = storedWorkspaceViewsStates[id];
                        this.set(id, {
                            active: false,
                            visibleGlobal: !storedState.isHidden,
                            visibleWorkspace: (0, types_1.$qf)(workspaceViewState?.isHidden) ? undefined : !workspaceViewState?.isHidden,
                            collapsed: workspaceViewState?.collapsed,
                            order: workspaceViewState?.order,
                            size: workspaceViewState?.size,
                        });
                    }
                }
                if (changedStates.length) {
                    this.h.fire(changedStates);
                    // Update the in memory state after firing the event
                    // so that the views can update their state accordingly
                    for (const changedState of changedStates) {
                        const state = this.get(changedState.id);
                        if (state) {
                            state.visibleGlobal = changedState.visible;
                        }
                    }
                }
            }
        }
        u() {
            const viewStates = new Map();
            const workspaceViewsStates = this.w();
            for (const id of Object.keys(workspaceViewsStates)) {
                const workspaceViewState = workspaceViewsStates[id];
                viewStates.set(id, {
                    active: false,
                    visibleGlobal: undefined,
                    visibleWorkspace: (0, types_1.$qf)(workspaceViewState.isHidden) ? undefined : !workspaceViewState.isHidden,
                    collapsed: workspaceViewState.collapsed,
                    order: workspaceViewState.order,
                    size: workspaceViewState.size,
                });
            }
            // Migrate to `viewletStateStorageId`
            const value = this.n.get(this.f, 1 /* StorageScope.WORKSPACE */, '[]');
            const { state: workspaceVisibilityStates } = this.C(value);
            if (workspaceVisibilityStates.size > 0) {
                for (const { id, isHidden } of workspaceVisibilityStates.values()) {
                    const viewState = viewStates.get(id);
                    // Not migrated to `viewletStateStorageId`
                    if (viewState) {
                        if ((0, types_1.$qf)(viewState.visibleWorkspace)) {
                            viewState.visibleWorkspace = !isHidden;
                        }
                    }
                    else {
                        viewStates.set(id, {
                            active: false,
                            collapsed: undefined,
                            visibleGlobal: undefined,
                            visibleWorkspace: !isHidden,
                        });
                    }
                }
                this.n.remove(this.f, 1 /* StorageScope.WORKSPACE */);
            }
            const { state, hasDuplicates } = this.C(this.F);
            if (hasDuplicates) {
                this.z(state);
            }
            for (const { id, isHidden, order } of state.values()) {
                const viewState = viewStates.get(id);
                if (viewState) {
                    viewState.visibleGlobal = !isHidden;
                    if (!(0, types_1.$qf)(order)) {
                        viewState.order = order;
                    }
                }
                else {
                    viewStates.set(id, {
                        active: false,
                        visibleGlobal: !isHidden,
                        order,
                        collapsed: undefined,
                        visibleWorkspace: undefined,
                    });
                }
            }
            return viewStates;
        }
        w() {
            return JSON.parse(this.n.get(this.c, 1 /* StorageScope.WORKSPACE */, '{}'));
        }
        y() {
            return this.C(this.F).state;
        }
        z(storedGlobalState) {
            this.F = JSON.stringify([...storedGlobalState.values()]);
        }
        C(value) {
            const storedValue = JSON.parse(value);
            let hasDuplicates = false;
            const state = storedValue.reduce((result, storedState) => {
                if (typeof storedState === 'string' /* migration */) {
                    hasDuplicates = hasDuplicates || result.has(storedState);
                    result.set(storedState, { id: storedState, isHidden: true });
                }
                else {
                    hasDuplicates = hasDuplicates || result.has(storedState.id);
                    result.set(storedState.id, storedState);
                }
                return result;
            }, new Map());
            return { state, hasDuplicates };
        }
        get F() {
            if (!this.D) {
                this.D = this.G();
            }
            return this.D;
        }
        set F(globalViewsStatesValue) {
            if (this.F !== globalViewsStatesValue) {
                this.D = globalViewsStatesValue;
                this.H(globalViewsStatesValue);
            }
        }
        G() {
            return this.n.get(this.f, 0 /* StorageScope.PROFILE */, '[]');
        }
        H(value) {
            this.n.store(this.f, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    ViewDescriptorsState = __decorate([
        __param(2, storage_1.$Vo),
        __param(3, log_1.$6i)
    ], ViewDescriptorsState);
    let $wAb = class $wAb extends lifecycle_1.$kc {
        get title() { return this.h; }
        get icon() { return this.j; }
        get keybindingId() { return this.m; }
        // All View Descriptors
        get allViewDescriptors() { return this.f.map(item => item.viewDescriptor); }
        // Active View Descriptors
        get activeViewDescriptors() { return this.f.filter(item => item.state.active).map(item => item.viewDescriptor); }
        // Visible View Descriptors
        get visibleViewDescriptors() { return this.f.filter(item => this.N(item)).map(item => item.viewDescriptor); }
        constructor(viewContainer, instantiationService, z, loggerService) {
            super();
            this.viewContainer = viewContainer;
            this.z = z;
            this.c = new map_1.$Di();
            this.f = [];
            this.n = this.B(new event_1.$fd());
            this.onDidChangeContainerInfo = this.n.event;
            this.r = this.B(new event_1.$fd());
            this.onDidChangeAllViewDescriptors = this.r.event;
            this.s = this.B(new event_1.$fd());
            this.onDidChangeActiveViewDescriptors = this.s.event;
            this.t = this.B(new event_1.$fd());
            this.onDidAddVisibleViewDescriptors = this.t.event;
            this.u = this.B(new event_1.$fd());
            this.onDidRemoveVisibleViewDescriptors = this.u.event;
            this.w = this.B(new event_1.$fd());
            this.onDidMoveVisibleViewDescriptors = this.w.event;
            this.y = loggerService.createLogger(VIEWS_LOG_ID, { name: VIEWS_LOG_NAME, hidden: true });
            this.B(event_1.Event.filter(z.onDidChangeContext, e => e.affectsSome(this.c))(() => this.H()));
            this.g = this.B(instantiationService.createInstance(ViewDescriptorsState, viewContainer.storageId || `${viewContainer.id}.state`, typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.original));
            this.B(this.g.onDidChangeStoredState(items => this.F(items)));
            this.C();
        }
        C() {
            /* Use default container info if one of the visible view descriptors belongs to the current container by default */
            const useDefaultContainerInfo = this.viewContainer.alwaysUseContainerInfo || this.visibleViewDescriptors.length === 0 || this.visibleViewDescriptors.some(v => platform_1.$8m.as(views_1.Extensions.ViewsRegistry).getViewContainer(v.id) === this.viewContainer);
            const title = useDefaultContainerInfo ? (typeof this.viewContainer.title === 'string' ? this.viewContainer.title : this.viewContainer.title.value) : this.visibleViewDescriptors[0]?.containerTitle || this.visibleViewDescriptors[0]?.name || '';
            let titleChanged = false;
            if (this.h !== title) {
                this.h = title;
                titleChanged = true;
            }
            const icon = useDefaultContainerInfo ? this.viewContainer.icon : this.visibleViewDescriptors[0]?.containerIcon || views_1.$8E;
            let iconChanged = false;
            if (!this.D(icon)) {
                this.j = icon;
                iconChanged = true;
            }
            const keybindingId = this.viewContainer.openCommandActionDescriptor?.id ?? this.activeViewDescriptors.find(v => v.openCommandActionDescriptor)?.openCommandActionDescriptor?.id;
            let keybindingIdChanged = false;
            if (this.m !== keybindingId) {
                this.m = keybindingId;
                keybindingIdChanged = true;
            }
            if (titleChanged || iconChanged || keybindingIdChanged) {
                this.n.fire({ title: titleChanged, icon: iconChanged, keybindingId: keybindingIdChanged });
            }
        }
        D(icon) {
            if (uri_1.URI.isUri(icon)) {
                return uri_1.URI.isUri(this.j) && (0, resources_1.$bg)(icon, this.j);
            }
            else if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                return themables_1.ThemeIcon.isThemeIcon(this.j) && themables_1.ThemeIcon.isEqual(icon, this.j);
            }
            return icon === this.j;
        }
        isVisible(id) {
            const viewDescriptorItem = this.f.find(v => v.viewDescriptor.id === id);
            if (!viewDescriptorItem) {
                throw new Error(`Unknown view ${id}`);
            }
            return this.N(viewDescriptorItem);
        }
        setVisible(id, visible) {
            this.F([{ id, visible }]);
        }
        F(viewDescriptors) {
            // First: Update and remove the view descriptors which are asked to be hidden
            const viewDescriptorItemsToHide = (0, arrays_1.$Fb)(viewDescriptors.filter(({ visible }) => !visible)
                .map(({ id }) => this.Q(id)));
            const removed = [];
            for (const { viewDescriptorItem, visibleIndex } of viewDescriptorItemsToHide) {
                if (this.G(viewDescriptorItem, false)) {
                    removed.push({ viewDescriptor: viewDescriptorItem.viewDescriptor, index: visibleIndex });
                }
            }
            if (removed.length) {
                this.J(removed);
            }
            // Second: Update and add the view descriptors which are asked to be shown
            const added = [];
            for (const { id, visible } of viewDescriptors) {
                if (!visible) {
                    continue;
                }
                const foundViewDescriptor = this.Q(id);
                if (!foundViewDescriptor) {
                    continue;
                }
                const { viewDescriptorItem, visibleIndex } = foundViewDescriptor;
                if (this.G(viewDescriptorItem, true)) {
                    added.push({ index: visibleIndex, viewDescriptor: viewDescriptorItem.viewDescriptor, size: viewDescriptorItem.state.size, collapsed: !!viewDescriptorItem.state.collapsed });
                }
            }
            if (added.length) {
                this.I(added);
            }
        }
        G(viewDescriptorItem, visible) {
            if (!viewDescriptorItem.viewDescriptor.canToggleVisibility) {
                return false;
            }
            if (this.O(viewDescriptorItem) === visible) {
                return false;
            }
            // update visibility
            if (viewDescriptorItem.viewDescriptor.workspace) {
                viewDescriptorItem.state.visibleWorkspace = visible;
            }
            else {
                viewDescriptorItem.state.visibleGlobal = visible;
                if (visible) {
                    this.y.info(`Showing view ${viewDescriptorItem.viewDescriptor.id} in the container ${this.viewContainer.id}`);
                }
            }
            // return `true` only if visibility is changed
            return this.N(viewDescriptorItem) === visible;
        }
        isCollapsed(id) {
            return !!this.P(id).viewDescriptorItem.state.collapsed;
        }
        setCollapsed(id, collapsed) {
            const { viewDescriptorItem } = this.P(id);
            if (viewDescriptorItem.state.collapsed !== collapsed) {
                viewDescriptorItem.state.collapsed = collapsed;
            }
            this.g.updateState(this.allViewDescriptors);
        }
        getSize(id) {
            return this.P(id).viewDescriptorItem.state.size;
        }
        setSizes(newSizes) {
            for (const { id, size } of newSizes) {
                const { viewDescriptorItem } = this.P(id);
                if (viewDescriptorItem.state.size !== size) {
                    viewDescriptorItem.state.size = size;
                }
            }
            this.g.updateState(this.allViewDescriptors);
        }
        move(from, to) {
            const fromIndex = this.f.findIndex(v => v.viewDescriptor.id === from);
            const toIndex = this.f.findIndex(v => v.viewDescriptor.id === to);
            const fromViewDescriptor = this.f[fromIndex];
            const toViewDescriptor = this.f[toIndex];
            (0, arrays_1.$Hb)(this.f, fromIndex, toIndex);
            for (let index = 0; index < this.f.length; index++) {
                this.f[index].state.order = index;
            }
            this.L({ index: fromIndex, viewDescriptor: fromViewDescriptor.viewDescriptor }, { index: toIndex, viewDescriptor: toViewDescriptor.viewDescriptor });
        }
        add(addedViewDescriptorStates) {
            const addedItems = [];
            for (const addedViewDescriptorState of addedViewDescriptorStates) {
                const viewDescriptor = addedViewDescriptorState.viewDescriptor;
                if (viewDescriptor.when) {
                    for (const key of viewDescriptor.when.keys()) {
                        this.c.add(key);
                    }
                }
                let state = this.g.get(viewDescriptor.id);
                if (state) {
                    // set defaults if not set
                    if (viewDescriptor.workspace) {
                        state.visibleWorkspace = (0, types_1.$sf)(addedViewDescriptorState.visible) ? ((0, types_1.$sf)(state.visibleWorkspace) ? !viewDescriptor.hideByDefault : state.visibleWorkspace) : addedViewDescriptorState.visible;
                    }
                    else {
                        const isVisible = state.visibleGlobal;
                        state.visibleGlobal = (0, types_1.$sf)(addedViewDescriptorState.visible) ? ((0, types_1.$sf)(state.visibleGlobal) ? !viewDescriptor.hideByDefault : state.visibleGlobal) : addedViewDescriptorState.visible;
                        if (state.visibleGlobal && !isVisible) {
                            this.y.info(`Added view ${viewDescriptor.id} in the container ${this.viewContainer.id} and showing it.`, `${isVisible}`, `${viewDescriptor.hideByDefault}`, `${addedViewDescriptorState.visible}`);
                        }
                    }
                    state.collapsed = (0, types_1.$sf)(addedViewDescriptorState.collapsed) ? ((0, types_1.$sf)(state.collapsed) ? !!viewDescriptor.collapsed : state.collapsed) : addedViewDescriptorState.collapsed;
                }
                else {
                    state = {
                        active: false,
                        visibleGlobal: (0, types_1.$sf)(addedViewDescriptorState.visible) ? !viewDescriptor.hideByDefault : addedViewDescriptorState.visible,
                        visibleWorkspace: (0, types_1.$sf)(addedViewDescriptorState.visible) ? !viewDescriptor.hideByDefault : addedViewDescriptorState.visible,
                        collapsed: (0, types_1.$sf)(addedViewDescriptorState.collapsed) ? !!viewDescriptor.collapsed : addedViewDescriptorState.collapsed,
                    };
                }
                this.g.set(viewDescriptor.id, state);
                state.active = this.z.contextMatchesRules(viewDescriptor.when);
                addedItems.push({ viewDescriptor, state });
            }
            this.f.push(...addedItems);
            this.f.sort(this.R.bind(this));
            this.r.fire({ added: addedItems.map(({ viewDescriptor }) => viewDescriptor), removed: [] });
            const addedActiveItems = [];
            for (const viewDescriptorItem of addedItems) {
                if (viewDescriptorItem.state.active) {
                    addedActiveItems.push({ viewDescriptorItem, visible: this.N(viewDescriptorItem) });
                }
            }
            if (addedActiveItems.length) {
                this.s.fire(({ added: addedActiveItems.map(({ viewDescriptorItem }) => viewDescriptorItem.viewDescriptor), removed: [] }));
            }
            const addedVisibleDescriptors = [];
            for (const { viewDescriptorItem, visible } of addedActiveItems) {
                if (visible && this.N(viewDescriptorItem)) {
                    const { visibleIndex } = this.P(viewDescriptorItem.viewDescriptor.id);
                    addedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: viewDescriptorItem.viewDescriptor, size: viewDescriptorItem.state.size, collapsed: !!viewDescriptorItem.state.collapsed });
                }
            }
            this.I(addedVisibleDescriptors);
        }
        remove(viewDescriptors) {
            const removed = [];
            const removedItems = [];
            const removedActiveDescriptors = [];
            const removedVisibleDescriptors = [];
            for (const viewDescriptor of viewDescriptors) {
                if (viewDescriptor.when) {
                    for (const key of viewDescriptor.when.keys()) {
                        this.c.delete(key);
                    }
                }
                const index = this.f.findIndex(i => i.viewDescriptor.id === viewDescriptor.id);
                if (index !== -1) {
                    removed.push(viewDescriptor);
                    const viewDescriptorItem = this.f[index];
                    if (viewDescriptorItem.state.active) {
                        removedActiveDescriptors.push(viewDescriptorItem.viewDescriptor);
                    }
                    if (this.N(viewDescriptorItem)) {
                        const { visibleIndex } = this.P(viewDescriptorItem.viewDescriptor.id);
                        removedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: viewDescriptorItem.viewDescriptor });
                    }
                    removedItems.push(viewDescriptorItem);
                }
            }
            // update state
            removedItems.forEach(item => this.f.splice(this.f.indexOf(item), 1));
            this.J(removedVisibleDescriptors);
            if (removedActiveDescriptors.length) {
                this.s.fire(({ added: [], removed: removedActiveDescriptors }));
            }
            if (removed.length) {
                this.r.fire({ added: [], removed });
            }
        }
        H() {
            const addedActiveItems = [];
            const removedActiveItems = [];
            for (const item of this.f) {
                const wasActive = item.state.active;
                const isActive = this.z.contextMatchesRules(item.viewDescriptor.when);
                if (wasActive !== isActive) {
                    if (isActive) {
                        addedActiveItems.push({ item, visibleWhenActive: this.O(item) });
                    }
                    else {
                        removedActiveItems.push(item);
                    }
                }
            }
            const removedVisibleDescriptors = [];
            for (const item of removedActiveItems) {
                if (this.N(item)) {
                    const { visibleIndex } = this.P(item.viewDescriptor.id);
                    removedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: item.viewDescriptor });
                }
            }
            // Update the State
            removedActiveItems.forEach(item => item.state.active = false);
            addedActiveItems.forEach(({ item }) => item.state.active = true);
            this.J(removedVisibleDescriptors);
            if (addedActiveItems.length || removedActiveItems.length) {
                this.s.fire(({ added: addedActiveItems.map(({ item }) => item.viewDescriptor), removed: removedActiveItems.map(item => item.viewDescriptor) }));
            }
            const addedVisibleDescriptors = [];
            for (const { item, visibleWhenActive } of addedActiveItems) {
                if (visibleWhenActive && this.N(item)) {
                    const { visibleIndex } = this.P(item.viewDescriptor.id);
                    addedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: item.viewDescriptor, size: item.state.size, collapsed: !!item.state.collapsed });
                }
            }
            this.I(addedVisibleDescriptors);
        }
        I(added) {
            if (added.length) {
                this.t.fire(added.sort((a, b) => a.index - b.index));
                this.M(`Added views:${added.map(v => v.viewDescriptor.id).join(',')} in ${this.viewContainer.id}`);
            }
        }
        J(removed) {
            if (removed.length) {
                this.u.fire(removed.sort((a, b) => b.index - a.index));
                this.M(`Removed views:${removed.map(v => v.viewDescriptor.id).join(',')} from ${this.viewContainer.id}`);
            }
        }
        L(from, to) {
            this.w.fire({ from, to });
            this.M(`Moved view ${from.viewDescriptor.id} to ${to.viewDescriptor.id} in ${this.viewContainer.id}`);
        }
        M(reason) {
            this.y.info(reason);
            this.g.updateState(this.allViewDescriptors);
            this.C();
        }
        N(viewDescriptorItem) {
            if (!viewDescriptorItem.state.active) {
                return false;
            }
            return this.O(viewDescriptorItem);
        }
        O(viewDescriptorItem) {
            if (viewDescriptorItem.viewDescriptor.workspace) {
                return !!viewDescriptorItem.state.visibleWorkspace;
            }
            return !!viewDescriptorItem.state.visibleGlobal;
        }
        P(id) {
            const result = this.Q(id);
            if (result) {
                return result;
            }
            throw new Error(`view descriptor ${id} not found`);
        }
        Q(id) {
            for (let i = 0, visibleIndex = 0; i < this.f.length; i++) {
                const viewDescriptorItem = this.f[i];
                if (viewDescriptorItem.viewDescriptor.id === id) {
                    return { index: i, visibleIndex, viewDescriptorItem: viewDescriptorItem };
                }
                if (this.N(viewDescriptorItem)) {
                    visibleIndex++;
                }
            }
            return undefined;
        }
        R(a, b) {
            if (a.viewDescriptor.id === b.viewDescriptor.id) {
                return 0;
            }
            return (this.S(a) - this.S(b)) || this.U(a.viewDescriptor, b.viewDescriptor);
        }
        S(viewDescriptorItem) {
            const viewOrder = typeof viewDescriptorItem.state.order === 'number' ? viewDescriptorItem.state.order : viewDescriptorItem.viewDescriptor.order;
            return typeof viewOrder === 'number' ? viewOrder : Number.MAX_VALUE;
        }
        U(a, b) {
            if (!a.group || !b.group) {
                return 0;
            }
            if (a.group === b.group) {
                return 0;
            }
            return a.group < b.group ? -1 : 1;
        }
    };
    exports.$wAb = $wAb;
    exports.$wAb = $wAb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, contextkey_1.$3i),
        __param(3, log_1.$6i)
    ], $wAb);
});
//# sourceMappingURL=viewContainerModel.js.map