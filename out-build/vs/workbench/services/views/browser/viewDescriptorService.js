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
define(["require", "exports", "vs/workbench/common/views", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/base/common/uuid", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/views/common/viewContainerModel", "vs/platform/actions/common/actions", "vs/nls!vs/workbench/services/views/browser/viewDescriptorService"], function (require, exports, views_1, contextkey_1, storage_1, extensions_1, platform_1, lifecycle_1, viewPaneContainer_1, descriptors_1, extensions_2, event_1, telemetry_1, uuid_1, instantiation_1, viewContainerModel_1, actions_1, nls_1) {
    "use strict";
    var $xAb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xAb = void 0;
    function getViewContainerStorageId(viewContainerId) { return `${viewContainerId}.state`; }
    let $xAb = class $xAb extends lifecycle_1.$kc {
        static { $xAb_1 = this; }
        static { this.a = 'views.customizations'; }
        static { this.b = 'workbench.views.service'; }
        get viewContainers() { return this.u.all; }
        constructor(D, F, G, H, I) {
            super();
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeContainer = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidChangeLocation = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeContainerLocation = this.g.event;
            this.h = this.B(new lifecycle_1.$sc());
            this.j = this.B(new lifecycle_1.$sc());
            this.C = this.B(new event_1.$fd());
            this.onDidChangeViewContainers = this.C.event;
            this.m = new Map();
            this.n = new Map();
            this.r = new Map();
            this.s = new Map();
            this.u = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry);
            this.t = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
            this.J();
            this.w = new Map(Object.entries(this.eb.viewContainerLocations));
            this.y = new Map(Object.entries(this.eb.viewLocations));
            this.z = new Map(Object.entries(this.eb.viewContainerBadgeEnablementStates));
            // Register all containers that were registered before this ctor
            this.viewContainers.forEach(viewContainer => this.ib(viewContainer));
            this.B(this.t.onViewsRegistered(views => this.O(views)));
            this.B(this.t.onViewsDeregistered(({ views, viewContainer }) => this.Q(views, viewContainer)));
            this.B(this.t.onDidChangeContainer(({ views, from, to }) => this.S(views, from, to)));
            this.B(this.u.onDidRegister(({ viewContainer }) => {
                this.ib(viewContainer);
                this.C.fire({ added: [{ container: viewContainer, location: this.getViewContainerLocation(viewContainer) }], removed: [] });
            }));
            this.B(this.u.onDidDeregister(({ viewContainer }) => {
                this.kb(viewContainer);
                this.C.fire({ removed: [{ container: viewContainer, location: this.getViewContainerLocation(viewContainer) }], added: [] });
            }));
            this.B(this.G.onDidChangeValue(0 /* StorageScope.PROFILE */, $xAb_1.a, this.B(new lifecycle_1.$jc()))(() => this.$()));
            this.H.whenInstalledExtensionsRegistered().then(() => this.whenExtensionsRegistered());
        }
        J() {
            if (this.G.get($xAb_1.a, 0 /* StorageScope.PROFILE */)) {
                return;
            }
            const viewContainerLocationsValue = this.G.get('views.cachedViewContainerLocations', 0 /* StorageScope.PROFILE */);
            const viewDescriptorLocationsValue = this.G.get('views.cachedViewPositions', 0 /* StorageScope.PROFILE */);
            if (!viewContainerLocationsValue && !viewDescriptorLocationsValue) {
                return;
            }
            const viewContainerLocations = viewContainerLocationsValue ? JSON.parse(viewContainerLocationsValue) : [];
            const viewDescriptorLocations = viewDescriptorLocationsValue ? JSON.parse(viewDescriptorLocationsValue) : [];
            const viewsCustomizations = {
                viewContainerLocations: viewContainerLocations.reduce((result, [id, location]) => { result[id] = location; return result; }, {}),
                viewLocations: viewDescriptorLocations.reduce((result, [id, { containerId }]) => { result[id] = containerId; return result; }, {}),
                viewContainerBadgeEnablementStates: {}
            };
            this.G.store($xAb_1.a, JSON.stringify(viewsCustomizations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            this.G.remove('views.cachedViewContainerLocations', 0 /* StorageScope.PROFILE */);
            this.G.remove('views.cachedViewPositions', 0 /* StorageScope.PROFILE */);
        }
        L(groupedViews) {
            for (const [containerId, views] of groupedViews.entries()) {
                const viewContainer = this.u.get(containerId);
                // The container has not been registered yet
                if (!viewContainer || !this.h.has(viewContainer)) {
                    // Register if the container is a genarated container
                    if (this.P(containerId)) {
                        const viewContainerLocation = this.w.get(containerId);
                        if (viewContainerLocation !== undefined) {
                            this.Z(viewContainerLocation, containerId);
                        }
                    }
                    // Registration of the container handles registration of its views
                    continue;
                }
                // Filter out views that have already been added to the view container model
                // This is needed when statically-registered views are moved to
                // other statically registered containers as they will both try to add on startup
                const viewsToAdd = views.filter(view => this.getViewContainerModel(viewContainer).allViewDescriptors.filter(vd => vd.id === view.id).length === 0);
                this.qb(viewContainer, viewsToAdd);
            }
        }
        M(groupedViews) {
            for (const [viewContainerId, views] of groupedViews.entries()) {
                const viewContainer = this.u.get(viewContainerId);
                // The container has not been registered yet
                if (!viewContainer || !this.h.has(viewContainer)) {
                    continue;
                }
                this.rb(viewContainer, views);
            }
        }
        N() {
            for (const [viewId, containerId] of this.y.entries()) {
                // check if the view container exists
                if (this.u.get(containerId)) {
                    continue;
                }
                // check if view has been registered to default location
                const viewContainer = this.t.getViewContainer(viewId);
                const viewDescriptor = this.getViewDescriptorById(viewId);
                if (viewContainer && viewDescriptor) {
                    this.qb(viewContainer, [viewDescriptor]);
                }
            }
        }
        whenExtensionsRegistered() {
            // Handle those views whose custom parent view container does not exist anymore
            // May be the extension contributing this view container is no longer installed
            // Or the parent view container is generated and no longer available.
            this.N();
            // Clean up empty generated view containers
            for (const viewContainerId of [...this.w.keys()]) {
                this.Y(viewContainerId);
            }
            // Save updated view customizations after cleanup
            this.cb();
            // Register visibility actions for all views
            this.nb();
        }
        O(views) {
            this.F.bufferChangeEvents(() => {
                views.forEach(({ views, viewContainer }) => {
                    // When views are registered, we need to regroup them based on the customizations
                    const regroupedViews = this.R(viewContainer.id, views);
                    // Once they are grouped, try registering them which occurs
                    // if the container has already been registered within this service
                    // or we can generate the container from the source view id
                    this.L(regroupedViews);
                    views.forEach(viewDescriptor => this.ub(viewDescriptor).set(!!viewDescriptor.canMoveView));
                });
            });
        }
        P(id) {
            return id.startsWith($xAb_1.b);
        }
        Q(views, viewContainer) {
            // When views are registered, we need to regroup them based on the customizations
            const regroupedViews = this.R(viewContainer.id, views);
            this.M(regroupedViews);
            this.F.bufferChangeEvents(() => {
                views.forEach(viewDescriptor => this.ub(viewDescriptor).set(false));
            });
        }
        R(containerId, views) {
            const viewsByContainer = new Map();
            for (const viewDescriptor of views) {
                const correctContainerId = this.y.get(viewDescriptor.id) ?? containerId;
                let containerViews = viewsByContainer.get(correctContainerId);
                if (!containerViews) {
                    viewsByContainer.set(correctContainerId, containerViews = []);
                }
                containerViews.push(viewDescriptor);
            }
            return viewsByContainer;
        }
        getViewDescriptorById(viewId) {
            return this.t.getView(viewId);
        }
        getViewLocationById(viewId) {
            const container = this.getViewContainerByViewId(viewId);
            if (container === null) {
                return null;
            }
            return this.getViewContainerLocation(container);
        }
        getViewContainerByViewId(viewId) {
            const containerId = this.y.get(viewId);
            return containerId ?
                this.u.get(containerId) ?? null :
                this.getDefaultContainerById(viewId);
        }
        getViewContainerLocation(viewContainer) {
            return this.w.get(viewContainer.id) ?? this.getDefaultViewContainerLocation(viewContainer);
        }
        getDefaultViewContainerLocation(viewContainer) {
            return this.u.getViewContainerLocation(viewContainer);
        }
        getDefaultContainerById(viewId) {
            return this.t.getViewContainer(viewId) ?? null;
        }
        getViewContainerModel(container) {
            return this.jb(container);
        }
        getViewContainerById(id) {
            return this.u.get(id) || null;
        }
        getViewContainersByLocation(location) {
            return this.viewContainers.filter(v => this.getViewContainerLocation(v) === location);
        }
        getDefaultViewContainer(location) {
            return this.u.getDefaultViewContainer(location);
        }
        moveViewContainerToLocation(viewContainer, location, requestedIndex) {
            this.X(viewContainer, location, requestedIndex);
            this.cb();
        }
        getViewContainerBadgeEnablementState(id) {
            return this.z.get(id) ?? true;
        }
        setViewContainerBadgeEnablementState(id, badgesEnabled) {
            this.z.set(id, badgesEnabled);
            this.cb();
        }
        moveViewToLocation(view, location) {
            const container = this.Z(location);
            this.moveViewsToContainer([view], container);
        }
        moveViewsToContainer(views, viewContainer, visibilityState) {
            if (!views.length) {
                return;
            }
            const from = this.getViewContainerByViewId(views[0].id);
            const to = viewContainer;
            if (from && to && from !== to) {
                // Move views
                this.W(views, from, to, visibilityState);
                this.Y(from.id);
                // Save new locations
                this.cb();
                // Log to telemetry
                this.U(views, from, to);
            }
        }
        reset() {
            for (const viewContainer of this.viewContainers) {
                const viewContainerModel = this.getViewContainerModel(viewContainer);
                for (const viewDescriptor of viewContainerModel.allViewDescriptors) {
                    const defaultContainer = this.getDefaultContainerById(viewDescriptor.id);
                    const currentContainer = this.getViewContainerByViewId(viewDescriptor.id);
                    if (currentContainer && defaultContainer && currentContainer !== defaultContainer) {
                        this.W([viewDescriptor], currentContainer, defaultContainer);
                    }
                }
                const defaultContainerLocation = this.getDefaultViewContainerLocation(viewContainer);
                const currentContainerLocation = this.getViewContainerLocation(viewContainer);
                if (defaultContainerLocation !== null && currentContainerLocation !== defaultContainerLocation) {
                    this.X(viewContainer, defaultContainerLocation);
                }
                this.Y(viewContainer.id);
            }
            this.w.clear();
            this.y.clear();
            this.cb();
        }
        isViewContainerRemovedPermanently(viewContainerId) {
            return this.P(viewContainerId) && !this.w.has(viewContainerId);
        }
        S(views, from, to) {
            const viewsToMove = views.filter(view => !this.y.has(view.id) // Move views which are not already moved
                || (!this.viewContainers.includes(from) && this.y.get(view.id) === from.id) // Move views which are moved from a removed container
            );
            if (viewsToMove.length) {
                this.W(viewsToMove, from, to);
            }
        }
        U(views, from, to) {
            const containerToString = (container) => {
                if (container.id.startsWith($xAb_1.b)) {
                    return 'custom';
                }
                if (!container.extensionId) {
                    return container.id;
                }
                return 'extension';
            };
            const oldLocation = this.getViewContainerLocation(from);
            const newLocation = this.getViewContainerLocation(to);
            const viewCount = views.length;
            const fromContainer = containerToString(from);
            const toContainer = containerToString(to);
            const fromLocation = oldLocation === 1 /* ViewContainerLocation.Panel */ ? 'panel' : 'sidebar';
            const toLocation = newLocation === 1 /* ViewContainerLocation.Panel */ ? 'panel' : 'sidebar';
            this.I.publicLog2('viewDescriptorService.moveViews', { viewCount, fromContainer, toContainer, fromLocation, toLocation });
        }
        W(views, from, to, visibilityState = views_1.ViewVisibilityState.Expand) {
            this.rb(from, views);
            this.qb(to, views, visibilityState);
            const oldLocation = this.getViewContainerLocation(from);
            const newLocation = this.getViewContainerLocation(to);
            if (oldLocation !== newLocation) {
                this.f.fire({ views, from: oldLocation, to: newLocation });
            }
            this.c.fire({ views, from, to });
        }
        X(viewContainer, location, requestedIndex) {
            const from = this.getViewContainerLocation(viewContainer);
            const to = location;
            if (from !== to) {
                const isGeneratedViewContainer = this.P(viewContainer.id);
                const isDefaultViewContainerLocation = to === this.getDefaultViewContainerLocation(viewContainer);
                if (isGeneratedViewContainer || !isDefaultViewContainerLocation) {
                    this.w.set(viewContainer.id, to);
                }
                else {
                    this.w.delete(viewContainer.id);
                }
                this.wb(viewContainer).set(isGeneratedViewContainer || isDefaultViewContainerLocation);
                viewContainer.requestedIndex = requestedIndex;
                this.g.fire({ viewContainer, from, to });
                const views = this.hb(viewContainer);
                this.f.fire({ views, from, to });
            }
        }
        Y(viewContainerId) {
            // Skip if container is not generated
            if (!this.P(viewContainerId)) {
                return;
            }
            // Skip if container has views registered
            const viewContainer = this.getViewContainerById(viewContainerId);
            if (viewContainer && this.getViewContainerModel(viewContainer)?.allViewDescriptors.length) {
                return;
            }
            // Skip if container has moved views
            if ([...this.y.values()].includes(viewContainerId)) {
                return;
            }
            // Deregister the container
            if (viewContainer) {
                this.u.deregisterViewContainer(viewContainer);
            }
            this.w.delete(viewContainerId);
            this.z.delete(viewContainerId);
            // Clean up caches of container
            this.G.remove((0, viewContainerModel_1.$vAb)(viewContainer?.storageId || getViewContainerStorageId(viewContainerId)), 0 /* StorageScope.PROFILE */);
        }
        Z(location, existingId) {
            const id = existingId || this.bb(location);
            const container = this.u.registerViewContainer({
                id,
                ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, [id, { mergeViewWithContainerWhenSingleView: true }]),
                title: { value: id, original: id },
                icon: location === 0 /* ViewContainerLocation.Sidebar */ ? views_1.$8E : undefined,
                storageId: getViewContainerStorageId(id),
                hideIfEmpty: true
            }, location, { doNotRegisterOpenCommand: true });
            if (this.w.get(container.id) !== location) {
                this.w.set(container.id, location);
            }
            this.wb(container).set(true);
            return container;
        }
        $() {
            if (JSON.stringify(this.eb) !== this.fb() /* This checks if current window changed the value or not */) {
                this.ab();
            }
        }
        ab() {
            this.db = undefined;
            const newViewContainerCustomizations = new Map(Object.entries(this.eb.viewContainerLocations));
            const newViewDescriptorCustomizations = new Map(Object.entries(this.eb.viewLocations));
            const viewContainersToMove = [];
            const viewsToMove = [];
            for (const [containerId, location] of newViewContainerCustomizations.entries()) {
                const container = this.getViewContainerById(containerId);
                if (container) {
                    if (location !== this.getViewContainerLocation(container)) {
                        viewContainersToMove.push([container, location]);
                    }
                }
                // If the container is generated and not registered, we register it now
                else if (this.P(containerId)) {
                    this.Z(location, containerId);
                }
            }
            for (const viewContainer of this.viewContainers) {
                if (!newViewContainerCustomizations.has(viewContainer.id)) {
                    const currentLocation = this.getViewContainerLocation(viewContainer);
                    const defaultLocation = this.getDefaultViewContainerLocation(viewContainer);
                    if (currentLocation !== defaultLocation) {
                        viewContainersToMove.push([viewContainer, defaultLocation]);
                    }
                }
            }
            for (const [viewId, viewContainerId] of newViewDescriptorCustomizations.entries()) {
                const viewDescriptor = this.getViewDescriptorById(viewId);
                if (viewDescriptor) {
                    const prevViewContainer = this.getViewContainerByViewId(viewId);
                    const newViewContainer = this.u.get(viewContainerId);
                    if (prevViewContainer && newViewContainer && newViewContainer !== prevViewContainer) {
                        viewsToMove.push({ views: [viewDescriptor], from: prevViewContainer, to: newViewContainer });
                    }
                }
            }
            // If a value is not present in the cache, it must be reset to default
            for (const viewContainer of this.viewContainers) {
                const viewContainerModel = this.getViewContainerModel(viewContainer);
                for (const viewDescriptor of viewContainerModel.allViewDescriptors) {
                    if (!newViewDescriptorCustomizations.has(viewDescriptor.id)) {
                        const currentContainer = this.getViewContainerByViewId(viewDescriptor.id);
                        const defaultContainer = this.getDefaultContainerById(viewDescriptor.id);
                        if (currentContainer && defaultContainer && currentContainer !== defaultContainer) {
                            viewsToMove.push({ views: [viewDescriptor], from: currentContainer, to: defaultContainer });
                        }
                    }
                }
            }
            // Execute View Container Movements
            for (const [container, location] of viewContainersToMove) {
                this.X(container, location);
            }
            // Execute View Movements
            for (const { views, from, to } of viewsToMove) {
                this.W(views, from, to, views_1.ViewVisibilityState.Default);
            }
            this.w = newViewContainerCustomizations;
            this.y = newViewDescriptorCustomizations;
        }
        // Generated Container Id Format
        // {Common Prefix}.{Location}.{Uniqueness Id}
        // Old Format (deprecated)
        // {Common Prefix}.{Uniqueness Id}.{Source View Id}
        bb(location) {
            return `${$xAb_1.b}.${(0, views_1.$0E)(location)}.${(0, uuid_1.$4f)()}`;
        }
        cb() {
            const viewCustomizations = { viewContainerLocations: {}, viewLocations: {}, viewContainerBadgeEnablementStates: {} };
            for (const [containerId, location] of this.w) {
                const container = this.getViewContainerById(containerId);
                // Skip if the view container is not a generated container and in default location
                if (container && !this.P(containerId) && location === this.getDefaultViewContainerLocation(container)) {
                    continue;
                }
                viewCustomizations.viewContainerLocations[containerId] = location;
            }
            for (const [viewId, viewContainerId] of this.y) {
                const viewContainer = this.getViewContainerById(viewContainerId);
                if (viewContainer) {
                    const defaultContainer = this.getDefaultContainerById(viewId);
                    // Skip if the view is at default location
                    // https://github.com/microsoft/vscode/issues/90414
                    if (defaultContainer?.id === viewContainer.id) {
                        continue;
                    }
                }
                viewCustomizations.viewLocations[viewId] = viewContainerId;
            }
            // Loop through viewContainerBadgeEnablementStates and save only the ones that are disabled
            for (const [viewContainerId, badgeEnablementState] of this.z) {
                if (badgeEnablementState === false) {
                    viewCustomizations.viewContainerBadgeEnablementStates[viewContainerId] = badgeEnablementState;
                }
            }
            this.eb = viewCustomizations;
        }
        get eb() {
            if (!this.db) {
                this.db = JSON.parse(this.fb());
                this.db.viewContainerLocations = this.db.viewContainerLocations ?? {};
                this.db.viewLocations = this.db.viewLocations ?? {};
                this.db.viewContainerBadgeEnablementStates = this.db.viewContainerBadgeEnablementStates ?? {};
            }
            return this.db;
        }
        set eb(viewCustomizations) {
            const value = JSON.stringify(viewCustomizations);
            if (JSON.stringify(this.eb) !== value) {
                this.db = viewCustomizations;
                this.gb(value);
            }
        }
        fb() {
            return this.G.get($xAb_1.a, 0 /* StorageScope.PROFILE */, '{}');
        }
        gb(value) {
            this.G.store($xAb_1.a, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        hb(viewContainer) {
            const result = this.t.getViews(viewContainer).filter(viewDescriptor => {
                const viewDescriptorViewContainerId = this.y.get(viewDescriptor.id) ?? viewContainer.id;
                return viewDescriptorViewContainerId === viewContainer.id;
            });
            for (const [viewId, viewContainerId] of this.y.entries()) {
                if (viewContainerId !== viewContainer.id) {
                    continue;
                }
                if (this.t.getViewContainer(viewId) === viewContainer) {
                    continue;
                }
                const viewDescriptor = this.getViewDescriptorById(viewId);
                if (viewDescriptor) {
                    result.push(viewDescriptor);
                }
            }
            return result;
        }
        ib(viewContainer) {
            const defaultLocation = this.P(viewContainer.id) ? true : this.getViewContainerLocation(viewContainer) === this.getDefaultViewContainerLocation(viewContainer);
            this.wb(viewContainer).set(defaultLocation);
            this.jb(viewContainer);
        }
        jb(viewContainer) {
            let viewContainerModel = this.h.get(viewContainer)?.viewContainerModel;
            if (!viewContainerModel) {
                const disposables = new lifecycle_1.$jc();
                viewContainerModel = disposables.add(this.D.createInstance(viewContainerModel_1.$wAb, viewContainer));
                this.lb({ added: viewContainerModel.activeViewDescriptors, removed: [] });
                viewContainerModel.onDidChangeActiveViewDescriptors(changed => this.lb(changed), this, disposables);
                this.mb({ added: [...viewContainerModel.visibleViewDescriptors], removed: [] });
                viewContainerModel.onDidAddVisibleViewDescriptors(added => this.mb({ added: added.map(({ viewDescriptor }) => viewDescriptor), removed: [] }), this, disposables);
                viewContainerModel.onDidRemoveVisibleViewDescriptors(removed => this.mb({ added: [], removed: removed.map(({ viewDescriptor }) => viewDescriptor) }), this, disposables);
                disposables.add((0, lifecycle_1.$ic)(() => this.j.deleteAndDispose(viewContainer)));
                disposables.add(this.pb(viewContainer));
                this.h.set(viewContainer, { viewContainerModel: viewContainerModel, disposables, dispose: () => disposables.dispose() });
                // Register all views that were statically registered to this container
                // Potentially, this is registering something that was handled by another container
                // addViews() handles this by filtering views that are already registered
                this.O([{ views: this.t.getViews(viewContainer), viewContainer }]);
                // Add views that were registered prior to this view container
                const viewsToRegister = this.hb(viewContainer).filter(view => this.getDefaultContainerById(view.id) !== viewContainer);
                if (viewsToRegister.length) {
                    this.qb(viewContainer, viewsToRegister);
                    this.F.bufferChangeEvents(() => {
                        viewsToRegister.forEach(viewDescriptor => this.ub(viewDescriptor).set(!!viewDescriptor.canMoveView));
                    });
                }
            }
            return viewContainerModel;
        }
        kb(viewContainer) {
            this.h.deleteAndDispose(viewContainer);
        }
        lb({ added, removed }) {
            this.F.bufferChangeEvents(() => {
                added.forEach(viewDescriptor => this.sb(viewDescriptor).set(true));
                removed.forEach(viewDescriptor => this.sb(viewDescriptor).set(false));
            });
        }
        mb({ added, removed }) {
            this.F.bufferChangeEvents(() => {
                added.forEach(viewDescriptor => this.tb(viewDescriptor).set(true));
                removed.forEach(viewDescriptor => this.tb(viewDescriptor).set(false));
            });
        }
        nb() {
            for (const [viewContainer, { viewContainerModel, disposables }] of this.h) {
                this.j.set(viewContainer, this.ob(viewContainerModel));
                disposables.add(event_1.Event.any(viewContainerModel.onDidChangeActiveViewDescriptors, viewContainerModel.onDidAddVisibleViewDescriptors, viewContainerModel.onDidRemoveVisibleViewDescriptors, viewContainerModel.onDidMoveVisibleViewDescriptors)(e => this.j.set(viewContainer, this.ob(viewContainerModel))));
            }
        }
        ob(viewContainerModel) {
            const disposables = new lifecycle_1.$jc();
            viewContainerModel.activeViewDescriptors.forEach((viewDescriptor, index) => {
                if (!viewDescriptor.remoteAuthority) {
                    disposables.add((0, actions_1.$Xu)(class extends viewPaneContainer_1.$Teb {
                        constructor() {
                            super({
                                id: `${viewDescriptor.id}.toggleVisibility`,
                                viewPaneContainerId: viewContainerModel.viewContainer.id,
                                precondition: viewDescriptor.canToggleVisibility && (!viewContainerModel.isVisible(viewDescriptor.id) || viewContainerModel.visibleViewDescriptors.length > 1) ? contextkey_1.$Ii.true() : contextkey_1.$Ii.false(),
                                toggled: contextkey_1.$Ii.has(`${viewDescriptor.id}.visible`),
                                title: viewDescriptor.name,
                                menu: [{
                                        id: viewPaneContainer_1.$Reb,
                                        group: '1_toggleViews',
                                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('viewContainer', viewContainerModel.viewContainer.id), contextkey_1.$Ii.equals('viewContainerLocation', (0, views_1.$0E)(0 /* ViewContainerLocation.Sidebar */))),
                                        order: index,
                                    }, {
                                        id: actions_1.$Ru.ViewContainerTitleContext,
                                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('viewContainer', viewContainerModel.viewContainer.id)),
                                        order: index,
                                        group: '1_toggleVisibility'
                                    }, {
                                        id: actions_1.$Ru.ViewTitleContext,
                                        when: contextkey_1.$Ii.and(viewContainerModel.visibleViewDescriptors.length > 1 ? contextkey_1.$Ii.or(...viewContainerModel.visibleViewDescriptors.map(v => contextkey_1.$Ii.equals('view', v.id))) : contextkey_1.$Ii.false()),
                                        order: index,
                                        group: '2_toggleVisibility'
                                    }]
                            });
                        }
                        async runInViewPaneContainer(serviceAccessor, viewPaneContainer) {
                            viewPaneContainer.toggleViewVisibility(viewDescriptor.id);
                        }
                    }));
                    disposables.add((0, actions_1.$Xu)(class extends viewPaneContainer_1.$Teb {
                        constructor() {
                            super({
                                id: `${viewDescriptor.id}.removeView`,
                                viewPaneContainerId: viewContainerModel.viewContainer.id,
                                title: (0, nls_1.localize)(0, null, viewDescriptor.name),
                                precondition: viewDescriptor.canToggleVisibility && (!viewContainerModel.isVisible(viewDescriptor.id) || viewContainerModel.visibleViewDescriptors.length > 1) ? contextkey_1.$Ii.true() : contextkey_1.$Ii.false(),
                                menu: [{
                                        id: actions_1.$Ru.ViewTitleContext,
                                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', viewDescriptor.id), contextkey_1.$Ii.has(`${viewDescriptor.id}.visible`)),
                                        group: '1_hide',
                                        order: 1
                                    }]
                            });
                        }
                        async runInViewPaneContainer(serviceAccessor, viewPaneContainer) {
                            viewPaneContainer.toggleViewVisibility(viewDescriptor.id);
                        }
                    }));
                }
            });
            return disposables;
        }
        pb(viewContainer) {
            const that = this;
            return (0, actions_1.$Xu)(class ResetViewLocationAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `${viewContainer.id}.resetViewContainerLocation`,
                        title: {
                            original: 'Reset Location',
                            value: (0, nls_1.localize)(1, null)
                        },
                        menu: [{
                                id: actions_1.$Ru.ViewContainerTitleContext,
                                when: contextkey_1.$Ii.or(contextkey_1.$Ii.and(contextkey_1.$Ii.equals('viewContainer', viewContainer.id), contextkey_1.$Ii.equals(`${viewContainer.id}.defaultViewContainerLocation`, false)))
                            }],
                    });
                }
                run() {
                    that.moveViewContainerToLocation(viewContainer, that.getDefaultViewContainerLocation(viewContainer));
                }
            });
        }
        qb(container, views, visibilityState = views_1.ViewVisibilityState.Default) {
            this.F.bufferChangeEvents(() => {
                views.forEach(view => {
                    const isDefaultContainer = this.getDefaultContainerById(view.id) === container;
                    this.vb(view).set(isDefaultContainer);
                    if (isDefaultContainer) {
                        this.y.delete(view.id);
                    }
                    else {
                        this.y.set(view.id, container.id);
                    }
                });
            });
            this.getViewContainerModel(container).add(views.map(view => {
                return {
                    viewDescriptor: view,
                    collapsed: visibilityState === views_1.ViewVisibilityState.Default ? undefined : false,
                    visible: visibilityState === views_1.ViewVisibilityState.Default ? undefined : true
                };
            }));
        }
        rb(container, views) {
            // Set view default location keys to false
            this.F.bufferChangeEvents(() => {
                views.forEach(view => {
                    if (this.y.get(view.id) === container.id) {
                        this.y.delete(view.id);
                    }
                    this.vb(view).set(false);
                });
            });
            // Remove the views
            this.getViewContainerModel(container).remove(views);
        }
        sb(viewDescriptor) {
            const activeContextKeyId = `${viewDescriptor.id}.active`;
            let contextKey = this.m.get(activeContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.$2i(activeContextKeyId, false).bindTo(this.F);
                this.m.set(activeContextKeyId, contextKey);
            }
            return contextKey;
        }
        tb(viewDescriptor) {
            const activeContextKeyId = `${viewDescriptor.id}.visible`;
            let contextKey = this.m.get(activeContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.$2i(activeContextKeyId, false).bindTo(this.F);
                this.m.set(activeContextKeyId, contextKey);
            }
            return contextKey;
        }
        ub(viewDescriptor) {
            const movableViewContextKeyId = `${viewDescriptor.id}.canMove`;
            let contextKey = this.n.get(movableViewContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.$2i(movableViewContextKeyId, false).bindTo(this.F);
                this.n.set(movableViewContextKeyId, contextKey);
            }
            return contextKey;
        }
        vb(viewDescriptor) {
            const defaultViewLocationContextKeyId = `${viewDescriptor.id}.defaultViewLocation`;
            let contextKey = this.r.get(defaultViewLocationContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.$2i(defaultViewLocationContextKeyId, false).bindTo(this.F);
                this.r.set(defaultViewLocationContextKeyId, contextKey);
            }
            return contextKey;
        }
        wb(viewContainer) {
            const defaultViewContainerLocationContextKeyId = `${viewContainer.id}.defaultViewContainerLocation`;
            let contextKey = this.s.get(defaultViewContainerLocationContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.$2i(defaultViewContainerLocationContextKeyId, false).bindTo(this.F);
                this.s.set(defaultViewContainerLocationContextKeyId, contextKey);
            }
            return contextKey;
        }
    };
    exports.$xAb = $xAb;
    exports.$xAb = $xAb = $xAb_1 = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, contextkey_1.$3i),
        __param(2, storage_1.$Vo),
        __param(3, extensions_1.$MF),
        __param(4, telemetry_1.$9k)
    ], $xAb);
    (0, extensions_2.$mr)(views_1.$_E, $xAb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=viewDescriptorService.js.map