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
define(["require", "exports", "vs/workbench/common/views", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/base/common/arrays", "vs/base/common/types", "vs/base/common/resources", "vs/base/common/themables", "vs/nls", "vs/platform/log/common/log", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/output/common/output", "vs/base/common/map"], function (require, exports, views_1, contextkey_1, storage_1, platform_1, lifecycle_1, event_1, instantiation_1, uri_1, arrays_1, types_1, resources_1, themables_1, nls_1, log_1, actions_1, actionCommonCategories_1, output_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewContainerModel = exports.getViewsStateStorageId = void 0;
    const VIEWS_LOG_ID = 'views';
    const VIEWS_LOG_NAME = (0, nls_1.localize)('views log', "Views");
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: '_workbench.output.showViewsLog',
                title: { value: 'Show Views Log', original: 'Show Views Log' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        async run(servicesAccessor) {
            const loggerService = servicesAccessor.get(log_1.ILoggerService);
            const outputService = servicesAccessor.get(output_1.IOutputService);
            loggerService.setVisibility(VIEWS_LOG_ID, true);
            outputService.showChannel(VIEWS_LOG_ID);
        }
    });
    function getViewsStateStorageId(viewContainerStorageId) { return `${viewContainerStorageId}.hidden`; }
    exports.getViewsStateStorageId = getViewsStateStorageId;
    let ViewDescriptorsState = class ViewDescriptorsState extends lifecycle_1.Disposable {
        constructor(viewContainerStorageId, viewContainerName, storageService, loggerService) {
            super();
            this.viewContainerName = viewContainerName;
            this.storageService = storageService;
            this._onDidChangeStoredState = this._register(new event_1.Emitter());
            this.onDidChangeStoredState = this._onDidChangeStoredState.event;
            this.logger = loggerService.createLogger(VIEWS_LOG_ID, { name: VIEWS_LOG_NAME, hidden: true });
            this.globalViewsStateStorageId = getViewsStateStorageId(viewContainerStorageId);
            this.workspaceViewsStateStorageId = viewContainerStorageId;
            this._register(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, this.globalViewsStateStorageId, this._register(new lifecycle_1.DisposableStore()))(() => this.onDidStorageChange()));
            this.state = this.initialize();
        }
        set(id, state) {
            this.state.set(id, state);
        }
        get(id) {
            return this.state.get(id);
        }
        updateState(viewDescriptors) {
            this.updateWorkspaceState(viewDescriptors);
            this.updateGlobalState(viewDescriptors);
        }
        updateWorkspaceState(viewDescriptors) {
            const storedViewsStates = this.getStoredWorkspaceState();
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
                this.storageService.store(this.workspaceViewsStateStorageId, JSON.stringify(storedViewsStates), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(this.workspaceViewsStateStorageId, 1 /* StorageScope.WORKSPACE */);
            }
        }
        updateGlobalState(viewDescriptors) {
            const storedGlobalState = this.getStoredGlobalState();
            for (const viewDescriptor of viewDescriptors) {
                const state = this.get(viewDescriptor.id);
                storedGlobalState.set(viewDescriptor.id, {
                    id: viewDescriptor.id,
                    isHidden: state && viewDescriptor.canToggleVisibility ? !state.visibleGlobal : false,
                    order: !viewDescriptor.workspace && state ? state.order : undefined
                });
            }
            this.setStoredGlobalState(storedGlobalState);
        }
        onDidStorageChange() {
            if (this.globalViewsStatesValue !== this.getStoredGlobalViewsStatesValue() /* This checks if current window changed the value or not */) {
                this._globalViewsStatesValue = undefined;
                const storedViewsVisibilityStates = this.getStoredGlobalState();
                const storedWorkspaceViewsStates = this.getStoredWorkspaceState();
                const changedStates = [];
                for (const [id, storedState] of storedViewsVisibilityStates) {
                    const state = this.get(id);
                    if (state) {
                        if (state.visibleGlobal !== !storedState.isHidden) {
                            if (!storedState.isHidden) {
                                this.logger.info(`View visibility state changed: ${id} is now visible`, this.viewContainerName);
                            }
                            changedStates.push({ id, visible: !storedState.isHidden });
                        }
                    }
                    else {
                        const workspaceViewState = storedWorkspaceViewsStates[id];
                        this.set(id, {
                            active: false,
                            visibleGlobal: !storedState.isHidden,
                            visibleWorkspace: (0, types_1.isUndefined)(workspaceViewState?.isHidden) ? undefined : !workspaceViewState?.isHidden,
                            collapsed: workspaceViewState?.collapsed,
                            order: workspaceViewState?.order,
                            size: workspaceViewState?.size,
                        });
                    }
                }
                if (changedStates.length) {
                    this._onDidChangeStoredState.fire(changedStates);
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
        initialize() {
            const viewStates = new Map();
            const workspaceViewsStates = this.getStoredWorkspaceState();
            for (const id of Object.keys(workspaceViewsStates)) {
                const workspaceViewState = workspaceViewsStates[id];
                viewStates.set(id, {
                    active: false,
                    visibleGlobal: undefined,
                    visibleWorkspace: (0, types_1.isUndefined)(workspaceViewState.isHidden) ? undefined : !workspaceViewState.isHidden,
                    collapsed: workspaceViewState.collapsed,
                    order: workspaceViewState.order,
                    size: workspaceViewState.size,
                });
            }
            // Migrate to `viewletStateStorageId`
            const value = this.storageService.get(this.globalViewsStateStorageId, 1 /* StorageScope.WORKSPACE */, '[]');
            const { state: workspaceVisibilityStates } = this.parseStoredGlobalState(value);
            if (workspaceVisibilityStates.size > 0) {
                for (const { id, isHidden } of workspaceVisibilityStates.values()) {
                    const viewState = viewStates.get(id);
                    // Not migrated to `viewletStateStorageId`
                    if (viewState) {
                        if ((0, types_1.isUndefined)(viewState.visibleWorkspace)) {
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
                this.storageService.remove(this.globalViewsStateStorageId, 1 /* StorageScope.WORKSPACE */);
            }
            const { state, hasDuplicates } = this.parseStoredGlobalState(this.globalViewsStatesValue);
            if (hasDuplicates) {
                this.setStoredGlobalState(state);
            }
            for (const { id, isHidden, order } of state.values()) {
                const viewState = viewStates.get(id);
                if (viewState) {
                    viewState.visibleGlobal = !isHidden;
                    if (!(0, types_1.isUndefined)(order)) {
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
        getStoredWorkspaceState() {
            return JSON.parse(this.storageService.get(this.workspaceViewsStateStorageId, 1 /* StorageScope.WORKSPACE */, '{}'));
        }
        getStoredGlobalState() {
            return this.parseStoredGlobalState(this.globalViewsStatesValue).state;
        }
        setStoredGlobalState(storedGlobalState) {
            this.globalViewsStatesValue = JSON.stringify([...storedGlobalState.values()]);
        }
        parseStoredGlobalState(value) {
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
        get globalViewsStatesValue() {
            if (!this._globalViewsStatesValue) {
                this._globalViewsStatesValue = this.getStoredGlobalViewsStatesValue();
            }
            return this._globalViewsStatesValue;
        }
        set globalViewsStatesValue(globalViewsStatesValue) {
            if (this.globalViewsStatesValue !== globalViewsStatesValue) {
                this._globalViewsStatesValue = globalViewsStatesValue;
                this.setStoredGlobalViewsStatesValue(globalViewsStatesValue);
            }
        }
        getStoredGlobalViewsStatesValue() {
            return this.storageService.get(this.globalViewsStateStorageId, 0 /* StorageScope.PROFILE */, '[]');
        }
        setStoredGlobalViewsStatesValue(value) {
            this.storageService.store(this.globalViewsStateStorageId, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    ViewDescriptorsState = __decorate([
        __param(2, storage_1.IStorageService),
        __param(3, log_1.ILoggerService)
    ], ViewDescriptorsState);
    let ViewContainerModel = class ViewContainerModel extends lifecycle_1.Disposable {
        get title() { return this._title; }
        get icon() { return this._icon; }
        get keybindingId() { return this._keybindingId; }
        // All View Descriptors
        get allViewDescriptors() { return this.viewDescriptorItems.map(item => item.viewDescriptor); }
        // Active View Descriptors
        get activeViewDescriptors() { return this.viewDescriptorItems.filter(item => item.state.active).map(item => item.viewDescriptor); }
        // Visible View Descriptors
        get visibleViewDescriptors() { return this.viewDescriptorItems.filter(item => this.isViewDescriptorVisible(item)).map(item => item.viewDescriptor); }
        constructor(viewContainer, instantiationService, contextKeyService, loggerService) {
            super();
            this.viewContainer = viewContainer;
            this.contextKeyService = contextKeyService;
            this.contextKeys = new map_1.CounterSet();
            this.viewDescriptorItems = [];
            this._onDidChangeContainerInfo = this._register(new event_1.Emitter());
            this.onDidChangeContainerInfo = this._onDidChangeContainerInfo.event;
            this._onDidChangeAllViewDescriptors = this._register(new event_1.Emitter());
            this.onDidChangeAllViewDescriptors = this._onDidChangeAllViewDescriptors.event;
            this._onDidChangeActiveViewDescriptors = this._register(new event_1.Emitter());
            this.onDidChangeActiveViewDescriptors = this._onDidChangeActiveViewDescriptors.event;
            this._onDidAddVisibleViewDescriptors = this._register(new event_1.Emitter());
            this.onDidAddVisibleViewDescriptors = this._onDidAddVisibleViewDescriptors.event;
            this._onDidRemoveVisibleViewDescriptors = this._register(new event_1.Emitter());
            this.onDidRemoveVisibleViewDescriptors = this._onDidRemoveVisibleViewDescriptors.event;
            this._onDidMoveVisibleViewDescriptors = this._register(new event_1.Emitter());
            this.onDidMoveVisibleViewDescriptors = this._onDidMoveVisibleViewDescriptors.event;
            this.logger = loggerService.createLogger(VIEWS_LOG_ID, { name: VIEWS_LOG_NAME, hidden: true });
            this._register(event_1.Event.filter(contextKeyService.onDidChangeContext, e => e.affectsSome(this.contextKeys))(() => this.onDidChangeContext()));
            this.viewDescriptorsState = this._register(instantiationService.createInstance(ViewDescriptorsState, viewContainer.storageId || `${viewContainer.id}.state`, typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.original));
            this._register(this.viewDescriptorsState.onDidChangeStoredState(items => this.updateVisibility(items)));
            this.updateContainerInfo();
        }
        updateContainerInfo() {
            /* Use default container info if one of the visible view descriptors belongs to the current container by default */
            const useDefaultContainerInfo = this.viewContainer.alwaysUseContainerInfo || this.visibleViewDescriptors.length === 0 || this.visibleViewDescriptors.some(v => platform_1.Registry.as(views_1.Extensions.ViewsRegistry).getViewContainer(v.id) === this.viewContainer);
            const title = useDefaultContainerInfo ? (typeof this.viewContainer.title === 'string' ? this.viewContainer.title : this.viewContainer.title.value) : this.visibleViewDescriptors[0]?.containerTitle || this.visibleViewDescriptors[0]?.name || '';
            let titleChanged = false;
            if (this._title !== title) {
                this._title = title;
                titleChanged = true;
            }
            const icon = useDefaultContainerInfo ? this.viewContainer.icon : this.visibleViewDescriptors[0]?.containerIcon || views_1.defaultViewIcon;
            let iconChanged = false;
            if (!this.isEqualIcon(icon)) {
                this._icon = icon;
                iconChanged = true;
            }
            const keybindingId = this.viewContainer.openCommandActionDescriptor?.id ?? this.activeViewDescriptors.find(v => v.openCommandActionDescriptor)?.openCommandActionDescriptor?.id;
            let keybindingIdChanged = false;
            if (this._keybindingId !== keybindingId) {
                this._keybindingId = keybindingId;
                keybindingIdChanged = true;
            }
            if (titleChanged || iconChanged || keybindingIdChanged) {
                this._onDidChangeContainerInfo.fire({ title: titleChanged, icon: iconChanged, keybindingId: keybindingIdChanged });
            }
        }
        isEqualIcon(icon) {
            if (uri_1.URI.isUri(icon)) {
                return uri_1.URI.isUri(this._icon) && (0, resources_1.isEqual)(icon, this._icon);
            }
            else if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                return themables_1.ThemeIcon.isThemeIcon(this._icon) && themables_1.ThemeIcon.isEqual(icon, this._icon);
            }
            return icon === this._icon;
        }
        isVisible(id) {
            const viewDescriptorItem = this.viewDescriptorItems.find(v => v.viewDescriptor.id === id);
            if (!viewDescriptorItem) {
                throw new Error(`Unknown view ${id}`);
            }
            return this.isViewDescriptorVisible(viewDescriptorItem);
        }
        setVisible(id, visible) {
            this.updateVisibility([{ id, visible }]);
        }
        updateVisibility(viewDescriptors) {
            // First: Update and remove the view descriptors which are asked to be hidden
            const viewDescriptorItemsToHide = (0, arrays_1.coalesce)(viewDescriptors.filter(({ visible }) => !visible)
                .map(({ id }) => this.findAndIgnoreIfNotFound(id)));
            const removed = [];
            for (const { viewDescriptorItem, visibleIndex } of viewDescriptorItemsToHide) {
                if (this.updateViewDescriptorItemVisibility(viewDescriptorItem, false)) {
                    removed.push({ viewDescriptor: viewDescriptorItem.viewDescriptor, index: visibleIndex });
                }
            }
            if (removed.length) {
                this.broadCastRemovedVisibleViewDescriptors(removed);
            }
            // Second: Update and add the view descriptors which are asked to be shown
            const added = [];
            for (const { id, visible } of viewDescriptors) {
                if (!visible) {
                    continue;
                }
                const foundViewDescriptor = this.findAndIgnoreIfNotFound(id);
                if (!foundViewDescriptor) {
                    continue;
                }
                const { viewDescriptorItem, visibleIndex } = foundViewDescriptor;
                if (this.updateViewDescriptorItemVisibility(viewDescriptorItem, true)) {
                    added.push({ index: visibleIndex, viewDescriptor: viewDescriptorItem.viewDescriptor, size: viewDescriptorItem.state.size, collapsed: !!viewDescriptorItem.state.collapsed });
                }
            }
            if (added.length) {
                this.broadCastAddedVisibleViewDescriptors(added);
            }
        }
        updateViewDescriptorItemVisibility(viewDescriptorItem, visible) {
            if (!viewDescriptorItem.viewDescriptor.canToggleVisibility) {
                return false;
            }
            if (this.isViewDescriptorVisibleWhenActive(viewDescriptorItem) === visible) {
                return false;
            }
            // update visibility
            if (viewDescriptorItem.viewDescriptor.workspace) {
                viewDescriptorItem.state.visibleWorkspace = visible;
            }
            else {
                viewDescriptorItem.state.visibleGlobal = visible;
                if (visible) {
                    this.logger.info(`Showing view ${viewDescriptorItem.viewDescriptor.id} in the container ${this.viewContainer.id}`);
                }
            }
            // return `true` only if visibility is changed
            return this.isViewDescriptorVisible(viewDescriptorItem) === visible;
        }
        isCollapsed(id) {
            return !!this.find(id).viewDescriptorItem.state.collapsed;
        }
        setCollapsed(id, collapsed) {
            const { viewDescriptorItem } = this.find(id);
            if (viewDescriptorItem.state.collapsed !== collapsed) {
                viewDescriptorItem.state.collapsed = collapsed;
            }
            this.viewDescriptorsState.updateState(this.allViewDescriptors);
        }
        getSize(id) {
            return this.find(id).viewDescriptorItem.state.size;
        }
        setSizes(newSizes) {
            for (const { id, size } of newSizes) {
                const { viewDescriptorItem } = this.find(id);
                if (viewDescriptorItem.state.size !== size) {
                    viewDescriptorItem.state.size = size;
                }
            }
            this.viewDescriptorsState.updateState(this.allViewDescriptors);
        }
        move(from, to) {
            const fromIndex = this.viewDescriptorItems.findIndex(v => v.viewDescriptor.id === from);
            const toIndex = this.viewDescriptorItems.findIndex(v => v.viewDescriptor.id === to);
            const fromViewDescriptor = this.viewDescriptorItems[fromIndex];
            const toViewDescriptor = this.viewDescriptorItems[toIndex];
            (0, arrays_1.move)(this.viewDescriptorItems, fromIndex, toIndex);
            for (let index = 0; index < this.viewDescriptorItems.length; index++) {
                this.viewDescriptorItems[index].state.order = index;
            }
            this.broadCastMovedViewDescriptors({ index: fromIndex, viewDescriptor: fromViewDescriptor.viewDescriptor }, { index: toIndex, viewDescriptor: toViewDescriptor.viewDescriptor });
        }
        add(addedViewDescriptorStates) {
            const addedItems = [];
            for (const addedViewDescriptorState of addedViewDescriptorStates) {
                const viewDescriptor = addedViewDescriptorState.viewDescriptor;
                if (viewDescriptor.when) {
                    for (const key of viewDescriptor.when.keys()) {
                        this.contextKeys.add(key);
                    }
                }
                let state = this.viewDescriptorsState.get(viewDescriptor.id);
                if (state) {
                    // set defaults if not set
                    if (viewDescriptor.workspace) {
                        state.visibleWorkspace = (0, types_1.isUndefinedOrNull)(addedViewDescriptorState.visible) ? ((0, types_1.isUndefinedOrNull)(state.visibleWorkspace) ? !viewDescriptor.hideByDefault : state.visibleWorkspace) : addedViewDescriptorState.visible;
                    }
                    else {
                        const isVisible = state.visibleGlobal;
                        state.visibleGlobal = (0, types_1.isUndefinedOrNull)(addedViewDescriptorState.visible) ? ((0, types_1.isUndefinedOrNull)(state.visibleGlobal) ? !viewDescriptor.hideByDefault : state.visibleGlobal) : addedViewDescriptorState.visible;
                        if (state.visibleGlobal && !isVisible) {
                            this.logger.info(`Added view ${viewDescriptor.id} in the container ${this.viewContainer.id} and showing it.`, `${isVisible}`, `${viewDescriptor.hideByDefault}`, `${addedViewDescriptorState.visible}`);
                        }
                    }
                    state.collapsed = (0, types_1.isUndefinedOrNull)(addedViewDescriptorState.collapsed) ? ((0, types_1.isUndefinedOrNull)(state.collapsed) ? !!viewDescriptor.collapsed : state.collapsed) : addedViewDescriptorState.collapsed;
                }
                else {
                    state = {
                        active: false,
                        visibleGlobal: (0, types_1.isUndefinedOrNull)(addedViewDescriptorState.visible) ? !viewDescriptor.hideByDefault : addedViewDescriptorState.visible,
                        visibleWorkspace: (0, types_1.isUndefinedOrNull)(addedViewDescriptorState.visible) ? !viewDescriptor.hideByDefault : addedViewDescriptorState.visible,
                        collapsed: (0, types_1.isUndefinedOrNull)(addedViewDescriptorState.collapsed) ? !!viewDescriptor.collapsed : addedViewDescriptorState.collapsed,
                    };
                }
                this.viewDescriptorsState.set(viewDescriptor.id, state);
                state.active = this.contextKeyService.contextMatchesRules(viewDescriptor.when);
                addedItems.push({ viewDescriptor, state });
            }
            this.viewDescriptorItems.push(...addedItems);
            this.viewDescriptorItems.sort(this.compareViewDescriptors.bind(this));
            this._onDidChangeAllViewDescriptors.fire({ added: addedItems.map(({ viewDescriptor }) => viewDescriptor), removed: [] });
            const addedActiveItems = [];
            for (const viewDescriptorItem of addedItems) {
                if (viewDescriptorItem.state.active) {
                    addedActiveItems.push({ viewDescriptorItem, visible: this.isViewDescriptorVisible(viewDescriptorItem) });
                }
            }
            if (addedActiveItems.length) {
                this._onDidChangeActiveViewDescriptors.fire(({ added: addedActiveItems.map(({ viewDescriptorItem }) => viewDescriptorItem.viewDescriptor), removed: [] }));
            }
            const addedVisibleDescriptors = [];
            for (const { viewDescriptorItem, visible } of addedActiveItems) {
                if (visible && this.isViewDescriptorVisible(viewDescriptorItem)) {
                    const { visibleIndex } = this.find(viewDescriptorItem.viewDescriptor.id);
                    addedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: viewDescriptorItem.viewDescriptor, size: viewDescriptorItem.state.size, collapsed: !!viewDescriptorItem.state.collapsed });
                }
            }
            this.broadCastAddedVisibleViewDescriptors(addedVisibleDescriptors);
        }
        remove(viewDescriptors) {
            const removed = [];
            const removedItems = [];
            const removedActiveDescriptors = [];
            const removedVisibleDescriptors = [];
            for (const viewDescriptor of viewDescriptors) {
                if (viewDescriptor.when) {
                    for (const key of viewDescriptor.when.keys()) {
                        this.contextKeys.delete(key);
                    }
                }
                const index = this.viewDescriptorItems.findIndex(i => i.viewDescriptor.id === viewDescriptor.id);
                if (index !== -1) {
                    removed.push(viewDescriptor);
                    const viewDescriptorItem = this.viewDescriptorItems[index];
                    if (viewDescriptorItem.state.active) {
                        removedActiveDescriptors.push(viewDescriptorItem.viewDescriptor);
                    }
                    if (this.isViewDescriptorVisible(viewDescriptorItem)) {
                        const { visibleIndex } = this.find(viewDescriptorItem.viewDescriptor.id);
                        removedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: viewDescriptorItem.viewDescriptor });
                    }
                    removedItems.push(viewDescriptorItem);
                }
            }
            // update state
            removedItems.forEach(item => this.viewDescriptorItems.splice(this.viewDescriptorItems.indexOf(item), 1));
            this.broadCastRemovedVisibleViewDescriptors(removedVisibleDescriptors);
            if (removedActiveDescriptors.length) {
                this._onDidChangeActiveViewDescriptors.fire(({ added: [], removed: removedActiveDescriptors }));
            }
            if (removed.length) {
                this._onDidChangeAllViewDescriptors.fire({ added: [], removed });
            }
        }
        onDidChangeContext() {
            const addedActiveItems = [];
            const removedActiveItems = [];
            for (const item of this.viewDescriptorItems) {
                const wasActive = item.state.active;
                const isActive = this.contextKeyService.contextMatchesRules(item.viewDescriptor.when);
                if (wasActive !== isActive) {
                    if (isActive) {
                        addedActiveItems.push({ item, visibleWhenActive: this.isViewDescriptorVisibleWhenActive(item) });
                    }
                    else {
                        removedActiveItems.push(item);
                    }
                }
            }
            const removedVisibleDescriptors = [];
            for (const item of removedActiveItems) {
                if (this.isViewDescriptorVisible(item)) {
                    const { visibleIndex } = this.find(item.viewDescriptor.id);
                    removedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: item.viewDescriptor });
                }
            }
            // Update the State
            removedActiveItems.forEach(item => item.state.active = false);
            addedActiveItems.forEach(({ item }) => item.state.active = true);
            this.broadCastRemovedVisibleViewDescriptors(removedVisibleDescriptors);
            if (addedActiveItems.length || removedActiveItems.length) {
                this._onDidChangeActiveViewDescriptors.fire(({ added: addedActiveItems.map(({ item }) => item.viewDescriptor), removed: removedActiveItems.map(item => item.viewDescriptor) }));
            }
            const addedVisibleDescriptors = [];
            for (const { item, visibleWhenActive } of addedActiveItems) {
                if (visibleWhenActive && this.isViewDescriptorVisible(item)) {
                    const { visibleIndex } = this.find(item.viewDescriptor.id);
                    addedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: item.viewDescriptor, size: item.state.size, collapsed: !!item.state.collapsed });
                }
            }
            this.broadCastAddedVisibleViewDescriptors(addedVisibleDescriptors);
        }
        broadCastAddedVisibleViewDescriptors(added) {
            if (added.length) {
                this._onDidAddVisibleViewDescriptors.fire(added.sort((a, b) => a.index - b.index));
                this.updateState(`Added views:${added.map(v => v.viewDescriptor.id).join(',')} in ${this.viewContainer.id}`);
            }
        }
        broadCastRemovedVisibleViewDescriptors(removed) {
            if (removed.length) {
                this._onDidRemoveVisibleViewDescriptors.fire(removed.sort((a, b) => b.index - a.index));
                this.updateState(`Removed views:${removed.map(v => v.viewDescriptor.id).join(',')} from ${this.viewContainer.id}`);
            }
        }
        broadCastMovedViewDescriptors(from, to) {
            this._onDidMoveVisibleViewDescriptors.fire({ from, to });
            this.updateState(`Moved view ${from.viewDescriptor.id} to ${to.viewDescriptor.id} in ${this.viewContainer.id}`);
        }
        updateState(reason) {
            this.logger.info(reason);
            this.viewDescriptorsState.updateState(this.allViewDescriptors);
            this.updateContainerInfo();
        }
        isViewDescriptorVisible(viewDescriptorItem) {
            if (!viewDescriptorItem.state.active) {
                return false;
            }
            return this.isViewDescriptorVisibleWhenActive(viewDescriptorItem);
        }
        isViewDescriptorVisibleWhenActive(viewDescriptorItem) {
            if (viewDescriptorItem.viewDescriptor.workspace) {
                return !!viewDescriptorItem.state.visibleWorkspace;
            }
            return !!viewDescriptorItem.state.visibleGlobal;
        }
        find(id) {
            const result = this.findAndIgnoreIfNotFound(id);
            if (result) {
                return result;
            }
            throw new Error(`view descriptor ${id} not found`);
        }
        findAndIgnoreIfNotFound(id) {
            for (let i = 0, visibleIndex = 0; i < this.viewDescriptorItems.length; i++) {
                const viewDescriptorItem = this.viewDescriptorItems[i];
                if (viewDescriptorItem.viewDescriptor.id === id) {
                    return { index: i, visibleIndex, viewDescriptorItem: viewDescriptorItem };
                }
                if (this.isViewDescriptorVisible(viewDescriptorItem)) {
                    visibleIndex++;
                }
            }
            return undefined;
        }
        compareViewDescriptors(a, b) {
            if (a.viewDescriptor.id === b.viewDescriptor.id) {
                return 0;
            }
            return (this.getViewOrder(a) - this.getViewOrder(b)) || this.getGroupOrderResult(a.viewDescriptor, b.viewDescriptor);
        }
        getViewOrder(viewDescriptorItem) {
            const viewOrder = typeof viewDescriptorItem.state.order === 'number' ? viewDescriptorItem.state.order : viewDescriptorItem.viewDescriptor.order;
            return typeof viewOrder === 'number' ? viewOrder : Number.MAX_VALUE;
        }
        getGroupOrderResult(a, b) {
            if (!a.group || !b.group) {
                return 0;
            }
            if (a.group === b.group) {
                return 0;
            }
            return a.group < b.group ? -1 : 1;
        }
    };
    exports.ViewContainerModel = ViewContainerModel;
    exports.ViewContainerModel = ViewContainerModel = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, log_1.ILoggerService)
    ], ViewContainerModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0NvbnRhaW5lck1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3ZpZXdzL2NvbW1vbi92aWV3Q29udGFpbmVyTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0JoRyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUM7SUFDN0IsTUFBTSxjQUFjLEdBQUcsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXRELElBQUEseUJBQWUsRUFBQyxLQUFNLFNBQVEsaUJBQU87UUFDcEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGdDQUFnQztnQkFDcEMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRTtnQkFDOUQsUUFBUSxFQUFFLG1DQUFVLENBQUMsU0FBUztnQkFDOUIsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBa0M7WUFDM0MsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLG9CQUFjLENBQUMsQ0FBQztZQUMzRCxNQUFNLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsdUJBQWMsQ0FBQyxDQUFDO1lBQzNELGFBQWEsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2hELGFBQWEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDekMsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILFNBQWdCLHNCQUFzQixDQUFDLHNCQUE4QixJQUFZLE9BQU8sR0FBRyxzQkFBc0IsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUE3SCx3REFBNkg7SUF3QjdILElBQU0sb0JB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