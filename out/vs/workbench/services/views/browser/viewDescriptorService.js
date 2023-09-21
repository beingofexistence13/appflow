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
define(["require", "exports", "vs/workbench/common/views", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/base/common/uuid", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/views/common/viewContainerModel", "vs/platform/actions/common/actions", "vs/nls"], function (require, exports, views_1, contextkey_1, storage_1, extensions_1, platform_1, lifecycle_1, viewPaneContainer_1, descriptors_1, extensions_2, event_1, telemetry_1, uuid_1, instantiation_1, viewContainerModel_1, actions_1, nls_1) {
    "use strict";
    var ViewDescriptorService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewDescriptorService = void 0;
    function getViewContainerStorageId(viewContainerId) { return `${viewContainerId}.state`; }
    let ViewDescriptorService = class ViewDescriptorService extends lifecycle_1.Disposable {
        static { ViewDescriptorService_1 = this; }
        static { this.VIEWS_CUSTOMIZATIONS = 'views.customizations'; }
        static { this.COMMON_CONTAINER_ID_PREFIX = 'workbench.views.service'; }
        get viewContainers() { return this.viewContainersRegistry.all; }
        constructor(instantiationService, contextKeyService, storageService, extensionService, telemetryService) {
            super();
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this.telemetryService = telemetryService;
            this._onDidChangeContainer = this._register(new event_1.Emitter());
            this.onDidChangeContainer = this._onDidChangeContainer.event;
            this._onDidChangeLocation = this._register(new event_1.Emitter());
            this.onDidChangeLocation = this._onDidChangeLocation.event;
            this._onDidChangeContainerLocation = this._register(new event_1.Emitter());
            this.onDidChangeContainerLocation = this._onDidChangeContainerLocation.event;
            this.viewContainerModels = this._register(new lifecycle_1.DisposableMap());
            this.viewsVisibilityActionDisposables = this._register(new lifecycle_1.DisposableMap());
            this._onDidChangeViewContainers = this._register(new event_1.Emitter());
            this.onDidChangeViewContainers = this._onDidChangeViewContainers.event;
            this.activeViewContextKeys = new Map();
            this.movableViewContextKeys = new Map();
            this.defaultViewLocationContextKeys = new Map();
            this.defaultViewContainerLocationContextKeys = new Map();
            this.viewContainersRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
            this.viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
            this.migrateToViewsCustomizationsStorage();
            this.viewContainersCustomLocations = new Map(Object.entries(this.viewCustomizations.viewContainerLocations));
            this.viewDescriptorsCustomLocations = new Map(Object.entries(this.viewCustomizations.viewLocations));
            this.viewContainerBadgeEnablementStates = new Map(Object.entries(this.viewCustomizations.viewContainerBadgeEnablementStates));
            // Register all containers that were registered before this ctor
            this.viewContainers.forEach(viewContainer => this.onDidRegisterViewContainer(viewContainer));
            this._register(this.viewsRegistry.onViewsRegistered(views => this.onDidRegisterViews(views)));
            this._register(this.viewsRegistry.onViewsDeregistered(({ views, viewContainer }) => this.onDidDeregisterViews(views, viewContainer)));
            this._register(this.viewsRegistry.onDidChangeContainer(({ views, from, to }) => this.onDidChangeDefaultContainer(views, from, to)));
            this._register(this.viewContainersRegistry.onDidRegister(({ viewContainer }) => {
                this.onDidRegisterViewContainer(viewContainer);
                this._onDidChangeViewContainers.fire({ added: [{ container: viewContainer, location: this.getViewContainerLocation(viewContainer) }], removed: [] });
            }));
            this._register(this.viewContainersRegistry.onDidDeregister(({ viewContainer }) => {
                this.onDidDeregisterViewContainer(viewContainer);
                this._onDidChangeViewContainers.fire({ removed: [{ container: viewContainer, location: this.getViewContainerLocation(viewContainer) }], added: [] });
            }));
            this._register(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, ViewDescriptorService_1.VIEWS_CUSTOMIZATIONS, this._register(new lifecycle_1.DisposableStore()))(() => this.onDidStorageChange()));
            this.extensionService.whenInstalledExtensionsRegistered().then(() => this.whenExtensionsRegistered());
        }
        migrateToViewsCustomizationsStorage() {
            if (this.storageService.get(ViewDescriptorService_1.VIEWS_CUSTOMIZATIONS, 0 /* StorageScope.PROFILE */)) {
                return;
            }
            const viewContainerLocationsValue = this.storageService.get('views.cachedViewContainerLocations', 0 /* StorageScope.PROFILE */);
            const viewDescriptorLocationsValue = this.storageService.get('views.cachedViewPositions', 0 /* StorageScope.PROFILE */);
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
            this.storageService.store(ViewDescriptorService_1.VIEWS_CUSTOMIZATIONS, JSON.stringify(viewsCustomizations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            this.storageService.remove('views.cachedViewContainerLocations', 0 /* StorageScope.PROFILE */);
            this.storageService.remove('views.cachedViewPositions', 0 /* StorageScope.PROFILE */);
        }
        registerGroupedViews(groupedViews) {
            for (const [containerId, views] of groupedViews.entries()) {
                const viewContainer = this.viewContainersRegistry.get(containerId);
                // The container has not been registered yet
                if (!viewContainer || !this.viewContainerModels.has(viewContainer)) {
                    // Register if the container is a genarated container
                    if (this.isGeneratedContainerId(containerId)) {
                        const viewContainerLocation = this.viewContainersCustomLocations.get(containerId);
                        if (viewContainerLocation !== undefined) {
                            this.registerGeneratedViewContainer(viewContainerLocation, containerId);
                        }
                    }
                    // Registration of the container handles registration of its views
                    continue;
                }
                // Filter out views that have already been added to the view container model
                // This is needed when statically-registered views are moved to
                // other statically registered containers as they will both try to add on startup
                const viewsToAdd = views.filter(view => this.getViewContainerModel(viewContainer).allViewDescriptors.filter(vd => vd.id === view.id).length === 0);
                this.addViews(viewContainer, viewsToAdd);
            }
        }
        deregisterGroupedViews(groupedViews) {
            for (const [viewContainerId, views] of groupedViews.entries()) {
                const viewContainer = this.viewContainersRegistry.get(viewContainerId);
                // The container has not been registered yet
                if (!viewContainer || !this.viewContainerModels.has(viewContainer)) {
                    continue;
                }
                this.removeViews(viewContainer, views);
            }
        }
        moveOrphanViewsToDefaultLocation() {
            for (const [viewId, containerId] of this.viewDescriptorsCustomLocations.entries()) {
                // check if the view container exists
                if (this.viewContainersRegistry.get(containerId)) {
                    continue;
                }
                // check if view has been registered to default location
                const viewContainer = this.viewsRegistry.getViewContainer(viewId);
                const viewDescriptor = this.getViewDescriptorById(viewId);
                if (viewContainer && viewDescriptor) {
                    this.addViews(viewContainer, [viewDescriptor]);
                }
            }
        }
        whenExtensionsRegistered() {
            // Handle those views whose custom parent view container does not exist anymore
            // May be the extension contributing this view container is no longer installed
            // Or the parent view container is generated and no longer available.
            this.moveOrphanViewsToDefaultLocation();
            // Clean up empty generated view containers
            for (const viewContainerId of [...this.viewContainersCustomLocations.keys()]) {
                this.cleanUpGeneratedViewContainer(viewContainerId);
            }
            // Save updated view customizations after cleanup
            this.saveViewCustomizations();
            // Register visibility actions for all views
            this.registerViewsVisibilityActions();
        }
        onDidRegisterViews(views) {
            this.contextKeyService.bufferChangeEvents(() => {
                views.forEach(({ views, viewContainer }) => {
                    // When views are registered, we need to regroup them based on the customizations
                    const regroupedViews = this.regroupViews(viewContainer.id, views);
                    // Once they are grouped, try registering them which occurs
                    // if the container has already been registered within this service
                    // or we can generate the container from the source view id
                    this.registerGroupedViews(regroupedViews);
                    views.forEach(viewDescriptor => this.getOrCreateMovableViewContextKey(viewDescriptor).set(!!viewDescriptor.canMoveView));
                });
            });
        }
        isGeneratedContainerId(id) {
            return id.startsWith(ViewDescriptorService_1.COMMON_CONTAINER_ID_PREFIX);
        }
        onDidDeregisterViews(views, viewContainer) {
            // When views are registered, we need to regroup them based on the customizations
            const regroupedViews = this.regroupViews(viewContainer.id, views);
            this.deregisterGroupedViews(regroupedViews);
            this.contextKeyService.bufferChangeEvents(() => {
                views.forEach(viewDescriptor => this.getOrCreateMovableViewContextKey(viewDescriptor).set(false));
            });
        }
        regroupViews(containerId, views) {
            const viewsByContainer = new Map();
            for (const viewDescriptor of views) {
                const correctContainerId = this.viewDescriptorsCustomLocations.get(viewDescriptor.id) ?? containerId;
                let containerViews = viewsByContainer.get(correctContainerId);
                if (!containerViews) {
                    viewsByContainer.set(correctContainerId, containerViews = []);
                }
                containerViews.push(viewDescriptor);
            }
            return viewsByContainer;
        }
        getViewDescriptorById(viewId) {
            return this.viewsRegistry.getView(viewId);
        }
        getViewLocationById(viewId) {
            const container = this.getViewContainerByViewId(viewId);
            if (container === null) {
                return null;
            }
            return this.getViewContainerLocation(container);
        }
        getViewContainerByViewId(viewId) {
            const containerId = this.viewDescriptorsCustomLocations.get(viewId);
            return containerId ?
                this.viewContainersRegistry.get(containerId) ?? null :
                this.getDefaultContainerById(viewId);
        }
        getViewContainerLocation(viewContainer) {
            return this.viewContainersCustomLocations.get(viewContainer.id) ?? this.getDefaultViewContainerLocation(viewContainer);
        }
        getDefaultViewContainerLocation(viewContainer) {
            return this.viewContainersRegistry.getViewContainerLocation(viewContainer);
        }
        getDefaultContainerById(viewId) {
            return this.viewsRegistry.getViewContainer(viewId) ?? null;
        }
        getViewContainerModel(container) {
            return this.getOrRegisterViewContainerModel(container);
        }
        getViewContainerById(id) {
            return this.viewContainersRegistry.get(id) || null;
        }
        getViewContainersByLocation(location) {
            return this.viewContainers.filter(v => this.getViewContainerLocation(v) === location);
        }
        getDefaultViewContainer(location) {
            return this.viewContainersRegistry.getDefaultViewContainer(location);
        }
        moveViewContainerToLocation(viewContainer, location, requestedIndex) {
            this.moveViewContainerToLocationWithoutSaving(viewContainer, location, requestedIndex);
            this.saveViewCustomizations();
        }
        getViewContainerBadgeEnablementState(id) {
            return this.viewContainerBadgeEnablementStates.get(id) ?? true;
        }
        setViewContainerBadgeEnablementState(id, badgesEnabled) {
            this.viewContainerBadgeEnablementStates.set(id, badgesEnabled);
            this.saveViewCustomizations();
        }
        moveViewToLocation(view, location) {
            const container = this.registerGeneratedViewContainer(location);
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
                this.moveViewsWithoutSaving(views, from, to, visibilityState);
                this.cleanUpGeneratedViewContainer(from.id);
                // Save new locations
                this.saveViewCustomizations();
                // Log to telemetry
                this.reportMovedViews(views, from, to);
            }
        }
        reset() {
            for (const viewContainer of this.viewContainers) {
                const viewContainerModel = this.getViewContainerModel(viewContainer);
                for (const viewDescriptor of viewContainerModel.allViewDescriptors) {
                    const defaultContainer = this.getDefaultContainerById(viewDescriptor.id);
                    const currentContainer = this.getViewContainerByViewId(viewDescriptor.id);
                    if (currentContainer && defaultContainer && currentContainer !== defaultContainer) {
                        this.moveViewsWithoutSaving([viewDescriptor], currentContainer, defaultContainer);
                    }
                }
                const defaultContainerLocation = this.getDefaultViewContainerLocation(viewContainer);
                const currentContainerLocation = this.getViewContainerLocation(viewContainer);
                if (defaultContainerLocation !== null && currentContainerLocation !== defaultContainerLocation) {
                    this.moveViewContainerToLocationWithoutSaving(viewContainer, defaultContainerLocation);
                }
                this.cleanUpGeneratedViewContainer(viewContainer.id);
            }
            this.viewContainersCustomLocations.clear();
            this.viewDescriptorsCustomLocations.clear();
            this.saveViewCustomizations();
        }
        isViewContainerRemovedPermanently(viewContainerId) {
            return this.isGeneratedContainerId(viewContainerId) && !this.viewContainersCustomLocations.has(viewContainerId);
        }
        onDidChangeDefaultContainer(views, from, to) {
            const viewsToMove = views.filter(view => !this.viewDescriptorsCustomLocations.has(view.id) // Move views which are not already moved
                || (!this.viewContainers.includes(from) && this.viewDescriptorsCustomLocations.get(view.id) === from.id) // Move views which are moved from a removed container
            );
            if (viewsToMove.length) {
                this.moveViewsWithoutSaving(viewsToMove, from, to);
            }
        }
        reportMovedViews(views, from, to) {
            const containerToString = (container) => {
                if (container.id.startsWith(ViewDescriptorService_1.COMMON_CONTAINER_ID_PREFIX)) {
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
            this.telemetryService.publicLog2('viewDescriptorService.moveViews', { viewCount, fromContainer, toContainer, fromLocation, toLocation });
        }
        moveViewsWithoutSaving(views, from, to, visibilityState = views_1.ViewVisibilityState.Expand) {
            this.removeViews(from, views);
            this.addViews(to, views, visibilityState);
            const oldLocation = this.getViewContainerLocation(from);
            const newLocation = this.getViewContainerLocation(to);
            if (oldLocation !== newLocation) {
                this._onDidChangeLocation.fire({ views, from: oldLocation, to: newLocation });
            }
            this._onDidChangeContainer.fire({ views, from, to });
        }
        moveViewContainerToLocationWithoutSaving(viewContainer, location, requestedIndex) {
            const from = this.getViewContainerLocation(viewContainer);
            const to = location;
            if (from !== to) {
                const isGeneratedViewContainer = this.isGeneratedContainerId(viewContainer.id);
                const isDefaultViewContainerLocation = to === this.getDefaultViewContainerLocation(viewContainer);
                if (isGeneratedViewContainer || !isDefaultViewContainerLocation) {
                    this.viewContainersCustomLocations.set(viewContainer.id, to);
                }
                else {
                    this.viewContainersCustomLocations.delete(viewContainer.id);
                }
                this.getOrCreateDefaultViewContainerLocationContextKey(viewContainer).set(isGeneratedViewContainer || isDefaultViewContainerLocation);
                viewContainer.requestedIndex = requestedIndex;
                this._onDidChangeContainerLocation.fire({ viewContainer, from, to });
                const views = this.getViewsByContainer(viewContainer);
                this._onDidChangeLocation.fire({ views, from, to });
            }
        }
        cleanUpGeneratedViewContainer(viewContainerId) {
            // Skip if container is not generated
            if (!this.isGeneratedContainerId(viewContainerId)) {
                return;
            }
            // Skip if container has views registered
            const viewContainer = this.getViewContainerById(viewContainerId);
            if (viewContainer && this.getViewContainerModel(viewContainer)?.allViewDescriptors.length) {
                return;
            }
            // Skip if container has moved views
            if ([...this.viewDescriptorsCustomLocations.values()].includes(viewContainerId)) {
                return;
            }
            // Deregister the container
            if (viewContainer) {
                this.viewContainersRegistry.deregisterViewContainer(viewContainer);
            }
            this.viewContainersCustomLocations.delete(viewContainerId);
            this.viewContainerBadgeEnablementStates.delete(viewContainerId);
            // Clean up caches of container
            this.storageService.remove((0, viewContainerModel_1.getViewsStateStorageId)(viewContainer?.storageId || getViewContainerStorageId(viewContainerId)), 0 /* StorageScope.PROFILE */);
        }
        registerGeneratedViewContainer(location, existingId) {
            const id = existingId || this.generateContainerId(location);
            const container = this.viewContainersRegistry.registerViewContainer({
                id,
                ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [id, { mergeViewWithContainerWhenSingleView: true }]),
                title: { value: id, original: id },
                icon: location === 0 /* ViewContainerLocation.Sidebar */ ? views_1.defaultViewIcon : undefined,
                storageId: getViewContainerStorageId(id),
                hideIfEmpty: true
            }, location, { doNotRegisterOpenCommand: true });
            if (this.viewContainersCustomLocations.get(container.id) !== location) {
                this.viewContainersCustomLocations.set(container.id, location);
            }
            this.getOrCreateDefaultViewContainerLocationContextKey(container).set(true);
            return container;
        }
        onDidStorageChange() {
            if (JSON.stringify(this.viewCustomizations) !== this.getStoredViewCustomizationsValue() /* This checks if current window changed the value or not */) {
                this.onDidViewCustomizationsStorageChange();
            }
        }
        onDidViewCustomizationsStorageChange() {
            this._viewCustomizations = undefined;
            const newViewContainerCustomizations = new Map(Object.entries(this.viewCustomizations.viewContainerLocations));
            const newViewDescriptorCustomizations = new Map(Object.entries(this.viewCustomizations.viewLocations));
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
                else if (this.isGeneratedContainerId(containerId)) {
                    this.registerGeneratedViewContainer(location, containerId);
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
                    const newViewContainer = this.viewContainersRegistry.get(viewContainerId);
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
                this.moveViewContainerToLocationWithoutSaving(container, location);
            }
            // Execute View Movements
            for (const { views, from, to } of viewsToMove) {
                this.moveViewsWithoutSaving(views, from, to, views_1.ViewVisibilityState.Default);
            }
            this.viewContainersCustomLocations = newViewContainerCustomizations;
            this.viewDescriptorsCustomLocations = newViewDescriptorCustomizations;
        }
        // Generated Container Id Format
        // {Common Prefix}.{Location}.{Uniqueness Id}
        // Old Format (deprecated)
        // {Common Prefix}.{Uniqueness Id}.{Source View Id}
        generateContainerId(location) {
            return `${ViewDescriptorService_1.COMMON_CONTAINER_ID_PREFIX}.${(0, views_1.ViewContainerLocationToString)(location)}.${(0, uuid_1.generateUuid)()}`;
        }
        saveViewCustomizations() {
            const viewCustomizations = { viewContainerLocations: {}, viewLocations: {}, viewContainerBadgeEnablementStates: {} };
            for (const [containerId, location] of this.viewContainersCustomLocations) {
                const container = this.getViewContainerById(containerId);
                // Skip if the view container is not a generated container and in default location
                if (container && !this.isGeneratedContainerId(containerId) && location === this.getDefaultViewContainerLocation(container)) {
                    continue;
                }
                viewCustomizations.viewContainerLocations[containerId] = location;
            }
            for (const [viewId, viewContainerId] of this.viewDescriptorsCustomLocations) {
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
            for (const [viewContainerId, badgeEnablementState] of this.viewContainerBadgeEnablementStates) {
                if (badgeEnablementState === false) {
                    viewCustomizations.viewContainerBadgeEnablementStates[viewContainerId] = badgeEnablementState;
                }
            }
            this.viewCustomizations = viewCustomizations;
        }
        get viewCustomizations() {
            if (!this._viewCustomizations) {
                this._viewCustomizations = JSON.parse(this.getStoredViewCustomizationsValue());
                this._viewCustomizations.viewContainerLocations = this._viewCustomizations.viewContainerLocations ?? {};
                this._viewCustomizations.viewLocations = this._viewCustomizations.viewLocations ?? {};
                this._viewCustomizations.viewContainerBadgeEnablementStates = this._viewCustomizations.viewContainerBadgeEnablementStates ?? {};
            }
            return this._viewCustomizations;
        }
        set viewCustomizations(viewCustomizations) {
            const value = JSON.stringify(viewCustomizations);
            if (JSON.stringify(this.viewCustomizations) !== value) {
                this._viewCustomizations = viewCustomizations;
                this.setStoredViewCustomizationsValue(value);
            }
        }
        getStoredViewCustomizationsValue() {
            return this.storageService.get(ViewDescriptorService_1.VIEWS_CUSTOMIZATIONS, 0 /* StorageScope.PROFILE */, '{}');
        }
        setStoredViewCustomizationsValue(value) {
            this.storageService.store(ViewDescriptorService_1.VIEWS_CUSTOMIZATIONS, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        getViewsByContainer(viewContainer) {
            const result = this.viewsRegistry.getViews(viewContainer).filter(viewDescriptor => {
                const viewDescriptorViewContainerId = this.viewDescriptorsCustomLocations.get(viewDescriptor.id) ?? viewContainer.id;
                return viewDescriptorViewContainerId === viewContainer.id;
            });
            for (const [viewId, viewContainerId] of this.viewDescriptorsCustomLocations.entries()) {
                if (viewContainerId !== viewContainer.id) {
                    continue;
                }
                if (this.viewsRegistry.getViewContainer(viewId) === viewContainer) {
                    continue;
                }
                const viewDescriptor = this.getViewDescriptorById(viewId);
                if (viewDescriptor) {
                    result.push(viewDescriptor);
                }
            }
            return result;
        }
        onDidRegisterViewContainer(viewContainer) {
            const defaultLocation = this.isGeneratedContainerId(viewContainer.id) ? true : this.getViewContainerLocation(viewContainer) === this.getDefaultViewContainerLocation(viewContainer);
            this.getOrCreateDefaultViewContainerLocationContextKey(viewContainer).set(defaultLocation);
            this.getOrRegisterViewContainerModel(viewContainer);
        }
        getOrRegisterViewContainerModel(viewContainer) {
            let viewContainerModel = this.viewContainerModels.get(viewContainer)?.viewContainerModel;
            if (!viewContainerModel) {
                const disposables = new lifecycle_1.DisposableStore();
                viewContainerModel = disposables.add(this.instantiationService.createInstance(viewContainerModel_1.ViewContainerModel, viewContainer));
                this.onDidChangeActiveViews({ added: viewContainerModel.activeViewDescriptors, removed: [] });
                viewContainerModel.onDidChangeActiveViewDescriptors(changed => this.onDidChangeActiveViews(changed), this, disposables);
                this.onDidChangeVisibleViews({ added: [...viewContainerModel.visibleViewDescriptors], removed: [] });
                viewContainerModel.onDidAddVisibleViewDescriptors(added => this.onDidChangeVisibleViews({ added: added.map(({ viewDescriptor }) => viewDescriptor), removed: [] }), this, disposables);
                viewContainerModel.onDidRemoveVisibleViewDescriptors(removed => this.onDidChangeVisibleViews({ added: [], removed: removed.map(({ viewDescriptor }) => viewDescriptor) }), this, disposables);
                disposables.add((0, lifecycle_1.toDisposable)(() => this.viewsVisibilityActionDisposables.deleteAndDispose(viewContainer)));
                disposables.add(this.registerResetViewContainerAction(viewContainer));
                this.viewContainerModels.set(viewContainer, { viewContainerModel: viewContainerModel, disposables, dispose: () => disposables.dispose() });
                // Register all views that were statically registered to this container
                // Potentially, this is registering something that was handled by another container
                // addViews() handles this by filtering views that are already registered
                this.onDidRegisterViews([{ views: this.viewsRegistry.getViews(viewContainer), viewContainer }]);
                // Add views that were registered prior to this view container
                const viewsToRegister = this.getViewsByContainer(viewContainer).filter(view => this.getDefaultContainerById(view.id) !== viewContainer);
                if (viewsToRegister.length) {
                    this.addViews(viewContainer, viewsToRegister);
                    this.contextKeyService.bufferChangeEvents(() => {
                        viewsToRegister.forEach(viewDescriptor => this.getOrCreateMovableViewContextKey(viewDescriptor).set(!!viewDescriptor.canMoveView));
                    });
                }
            }
            return viewContainerModel;
        }
        onDidDeregisterViewContainer(viewContainer) {
            this.viewContainerModels.deleteAndDispose(viewContainer);
        }
        onDidChangeActiveViews({ added, removed }) {
            this.contextKeyService.bufferChangeEvents(() => {
                added.forEach(viewDescriptor => this.getOrCreateActiveViewContextKey(viewDescriptor).set(true));
                removed.forEach(viewDescriptor => this.getOrCreateActiveViewContextKey(viewDescriptor).set(false));
            });
        }
        onDidChangeVisibleViews({ added, removed }) {
            this.contextKeyService.bufferChangeEvents(() => {
                added.forEach(viewDescriptor => this.getOrCreateVisibleViewContextKey(viewDescriptor).set(true));
                removed.forEach(viewDescriptor => this.getOrCreateVisibleViewContextKey(viewDescriptor).set(false));
            });
        }
        registerViewsVisibilityActions() {
            for (const [viewContainer, { viewContainerModel, disposables }] of this.viewContainerModels) {
                this.viewsVisibilityActionDisposables.set(viewContainer, this.registerViewsVisibilityActionsForContainer(viewContainerModel));
                disposables.add(event_1.Event.any(viewContainerModel.onDidChangeActiveViewDescriptors, viewContainerModel.onDidAddVisibleViewDescriptors, viewContainerModel.onDidRemoveVisibleViewDescriptors, viewContainerModel.onDidMoveVisibleViewDescriptors)(e => this.viewsVisibilityActionDisposables.set(viewContainer, this.registerViewsVisibilityActionsForContainer(viewContainerModel))));
            }
        }
        registerViewsVisibilityActionsForContainer(viewContainerModel) {
            const disposables = new lifecycle_1.DisposableStore();
            viewContainerModel.activeViewDescriptors.forEach((viewDescriptor, index) => {
                if (!viewDescriptor.remoteAuthority) {
                    disposables.add((0, actions_1.registerAction2)(class extends viewPaneContainer_1.ViewPaneContainerAction {
                        constructor() {
                            super({
                                id: `${viewDescriptor.id}.toggleVisibility`,
                                viewPaneContainerId: viewContainerModel.viewContainer.id,
                                precondition: viewDescriptor.canToggleVisibility && (!viewContainerModel.isVisible(viewDescriptor.id) || viewContainerModel.visibleViewDescriptors.length > 1) ? contextkey_1.ContextKeyExpr.true() : contextkey_1.ContextKeyExpr.false(),
                                toggled: contextkey_1.ContextKeyExpr.has(`${viewDescriptor.id}.visible`),
                                title: viewDescriptor.name,
                                menu: [{
                                        id: viewPaneContainer_1.ViewsSubMenu,
                                        group: '1_toggleViews',
                                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', viewContainerModel.viewContainer.id), contextkey_1.ContextKeyExpr.equals('viewContainerLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */))),
                                        order: index,
                                    }, {
                                        id: actions_1.MenuId.ViewContainerTitleContext,
                                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', viewContainerModel.viewContainer.id)),
                                        order: index,
                                        group: '1_toggleVisibility'
                                    }, {
                                        id: actions_1.MenuId.ViewTitleContext,
                                        when: contextkey_1.ContextKeyExpr.and(viewContainerModel.visibleViewDescriptors.length > 1 ? contextkey_1.ContextKeyExpr.or(...viewContainerModel.visibleViewDescriptors.map(v => contextkey_1.ContextKeyExpr.equals('view', v.id))) : contextkey_1.ContextKeyExpr.false()),
                                        order: index,
                                        group: '2_toggleVisibility'
                                    }]
                            });
                        }
                        async runInViewPaneContainer(serviceAccessor, viewPaneContainer) {
                            viewPaneContainer.toggleViewVisibility(viewDescriptor.id);
                        }
                    }));
                    disposables.add((0, actions_1.registerAction2)(class extends viewPaneContainer_1.ViewPaneContainerAction {
                        constructor() {
                            super({
                                id: `${viewDescriptor.id}.removeView`,
                                viewPaneContainerId: viewContainerModel.viewContainer.id,
                                title: (0, nls_1.localize)('hideView', "Hide '{0}'", viewDescriptor.name),
                                precondition: viewDescriptor.canToggleVisibility && (!viewContainerModel.isVisible(viewDescriptor.id) || viewContainerModel.visibleViewDescriptors.length > 1) ? contextkey_1.ContextKeyExpr.true() : contextkey_1.ContextKeyExpr.false(),
                                menu: [{
                                        id: actions_1.MenuId.ViewTitleContext,
                                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', viewDescriptor.id), contextkey_1.ContextKeyExpr.has(`${viewDescriptor.id}.visible`)),
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
        registerResetViewContainerAction(viewContainer) {
            const that = this;
            return (0, actions_1.registerAction2)(class ResetViewLocationAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `${viewContainer.id}.resetViewContainerLocation`,
                        title: {
                            original: 'Reset Location',
                            value: (0, nls_1.localize)('resetViewLocation', "Reset Location")
                        },
                        menu: [{
                                id: actions_1.MenuId.ViewContainerTitleContext,
                                when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', viewContainer.id), contextkey_1.ContextKeyExpr.equals(`${viewContainer.id}.defaultViewContainerLocation`, false)))
                            }],
                    });
                }
                run() {
                    that.moveViewContainerToLocation(viewContainer, that.getDefaultViewContainerLocation(viewContainer));
                }
            });
        }
        addViews(container, views, visibilityState = views_1.ViewVisibilityState.Default) {
            this.contextKeyService.bufferChangeEvents(() => {
                views.forEach(view => {
                    const isDefaultContainer = this.getDefaultContainerById(view.id) === container;
                    this.getOrCreateDefaultViewLocationContextKey(view).set(isDefaultContainer);
                    if (isDefaultContainer) {
                        this.viewDescriptorsCustomLocations.delete(view.id);
                    }
                    else {
                        this.viewDescriptorsCustomLocations.set(view.id, container.id);
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
        removeViews(container, views) {
            // Set view default location keys to false
            this.contextKeyService.bufferChangeEvents(() => {
                views.forEach(view => {
                    if (this.viewDescriptorsCustomLocations.get(view.id) === container.id) {
                        this.viewDescriptorsCustomLocations.delete(view.id);
                    }
                    this.getOrCreateDefaultViewLocationContextKey(view).set(false);
                });
            });
            // Remove the views
            this.getViewContainerModel(container).remove(views);
        }
        getOrCreateActiveViewContextKey(viewDescriptor) {
            const activeContextKeyId = `${viewDescriptor.id}.active`;
            let contextKey = this.activeViewContextKeys.get(activeContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.RawContextKey(activeContextKeyId, false).bindTo(this.contextKeyService);
                this.activeViewContextKeys.set(activeContextKeyId, contextKey);
            }
            return contextKey;
        }
        getOrCreateVisibleViewContextKey(viewDescriptor) {
            const activeContextKeyId = `${viewDescriptor.id}.visible`;
            let contextKey = this.activeViewContextKeys.get(activeContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.RawContextKey(activeContextKeyId, false).bindTo(this.contextKeyService);
                this.activeViewContextKeys.set(activeContextKeyId, contextKey);
            }
            return contextKey;
        }
        getOrCreateMovableViewContextKey(viewDescriptor) {
            const movableViewContextKeyId = `${viewDescriptor.id}.canMove`;
            let contextKey = this.movableViewContextKeys.get(movableViewContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.RawContextKey(movableViewContextKeyId, false).bindTo(this.contextKeyService);
                this.movableViewContextKeys.set(movableViewContextKeyId, contextKey);
            }
            return contextKey;
        }
        getOrCreateDefaultViewLocationContextKey(viewDescriptor) {
            const defaultViewLocationContextKeyId = `${viewDescriptor.id}.defaultViewLocation`;
            let contextKey = this.defaultViewLocationContextKeys.get(defaultViewLocationContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.RawContextKey(defaultViewLocationContextKeyId, false).bindTo(this.contextKeyService);
                this.defaultViewLocationContextKeys.set(defaultViewLocationContextKeyId, contextKey);
            }
            return contextKey;
        }
        getOrCreateDefaultViewContainerLocationContextKey(viewContainer) {
            const defaultViewContainerLocationContextKeyId = `${viewContainer.id}.defaultViewContainerLocation`;
            let contextKey = this.defaultViewContainerLocationContextKeys.get(defaultViewContainerLocationContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.RawContextKey(defaultViewContainerLocationContextKeyId, false).bindTo(this.contextKeyService);
                this.defaultViewContainerLocationContextKeys.set(defaultViewContainerLocationContextKeyId, contextKey);
            }
            return contextKey;
        }
    };
    exports.ViewDescriptorService = ViewDescriptorService;
    exports.ViewDescriptorService = ViewDescriptorService = ViewDescriptorService_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, storage_1.IStorageService),
        __param(3, extensions_1.IExtensionService),
        __param(4, telemetry_1.ITelemetryService)
    ], ViewDescriptorService);
    (0, extensions_2.registerSingleton)(views_1.IViewDescriptorService, ViewDescriptorService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0Rlc2NyaXB0b3JTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3ZpZXdzL2Jyb3dzZXIvdmlld0Rlc2NyaXB0b3JTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEwQmhHLFNBQVMseUJBQXlCLENBQUMsZUFBdUIsSUFBWSxPQUFPLEdBQUcsZUFBZSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBRW5HLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsc0JBQVU7O2lCQUk1Qix5QkFBb0IsR0FBRyxzQkFBc0IsQUFBekIsQ0FBMEI7aUJBQzlDLCtCQUEwQixHQUFHLHlCQUF5QixBQUE1QixDQUE2QjtRQTJCL0UsSUFBSSxjQUFjLEtBQW1DLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFOUYsWUFDd0Isb0JBQTRELEVBQy9ELGlCQUFzRCxFQUN6RCxjQUFnRCxFQUM5QyxnQkFBb0QsRUFDcEQsZ0JBQW9EO1lBRXZFLEtBQUssRUFBRSxDQUFDO1lBTmdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDOUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUN4QyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDN0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNuQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBaEN2RCwwQkFBcUIsR0FBa0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBd0UsQ0FBQyxDQUFDO1lBQ25OLHlCQUFvQixHQUFnRixJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDO1lBRTdILHlCQUFvQixHQUFrRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUF3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