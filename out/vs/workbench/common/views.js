/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/base/common/map", "vs/platform/registry/common/platform", "vs/base/common/arrays", "vs/base/common/collections", "vs/base/common/objects", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, event_1, nls_1, instantiation_1, lifecycle_1, map_1, platform_1, arrays_1, collections_1, objects_1, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NoTreeViewError = exports.ResolvableTreeItem = exports.TreeItemCollapsibleState = exports.ViewVisibilityState = exports.IViewDescriptorService = exports.IViewsService = exports.ViewContentGroups = exports.ViewContainerLocationToString = exports.ViewContainerLocations = exports.ViewContainerLocation = exports.Extensions = exports.defaultViewIcon = void 0;
    exports.defaultViewIcon = (0, iconRegistry_1.registerIcon)('default-view-icon', codicons_1.Codicon.window, (0, nls_1.localize)('defaultViewIcon', 'Default view icon.'));
    var Extensions;
    (function (Extensions) {
        Extensions.ViewContainersRegistry = 'workbench.registry.view.containers';
        Extensions.ViewsRegistry = 'workbench.registry.view';
    })(Extensions || (exports.Extensions = Extensions = {}));
    var ViewContainerLocation;
    (function (ViewContainerLocation) {
        ViewContainerLocation[ViewContainerLocation["Sidebar"] = 0] = "Sidebar";
        ViewContainerLocation[ViewContainerLocation["Panel"] = 1] = "Panel";
        ViewContainerLocation[ViewContainerLocation["AuxiliaryBar"] = 2] = "AuxiliaryBar";
    })(ViewContainerLocation || (exports.ViewContainerLocation = ViewContainerLocation = {}));
    exports.ViewContainerLocations = [0 /* ViewContainerLocation.Sidebar */, 1 /* ViewContainerLocation.Panel */, 2 /* ViewContainerLocation.AuxiliaryBar */];
    function ViewContainerLocationToString(viewContainerLocation) {
        switch (viewContainerLocation) {
            case 0 /* ViewContainerLocation.Sidebar */: return 'sidebar';
            case 1 /* ViewContainerLocation.Panel */: return 'panel';
            case 2 /* ViewContainerLocation.AuxiliaryBar */: return 'auxiliarybar';
        }
    }
    exports.ViewContainerLocationToString = ViewContainerLocationToString;
    class ViewContainersRegistryImpl extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidRegister = this._register(new event_1.Emitter());
            this.onDidRegister = this._onDidRegister.event;
            this._onDidDeregister = this._register(new event_1.Emitter());
            this.onDidDeregister = this._onDidDeregister.event;
            this.viewContainers = new Map();
            this.defaultViewContainers = [];
        }
        get all() {
            return (0, arrays_1.flatten)([...this.viewContainers.values()]);
        }
        registerViewContainer(viewContainerDescriptor, viewContainerLocation, options) {
            const existing = this.get(viewContainerDescriptor.id);
            if (existing) {
                return existing;
            }
            const viewContainer = viewContainerDescriptor;
            viewContainer.openCommandActionDescriptor = options?.doNotRegisterOpenCommand ? undefined : (viewContainer.openCommandActionDescriptor ?? { id: viewContainer.id });
            const viewContainers = (0, map_1.getOrSet)(this.viewContainers, viewContainerLocation, []);
            viewContainers.push(viewContainer);
            if (options?.isDefault) {
                this.defaultViewContainers.push(viewContainer);
            }
            this._onDidRegister.fire({ viewContainer, viewContainerLocation });
            return viewContainer;
        }
        deregisterViewContainer(viewContainer) {
            for (const viewContainerLocation of this.viewContainers.keys()) {
                const viewContainers = this.viewContainers.get(viewContainerLocation);
                const index = viewContainers?.indexOf(viewContainer);
                if (index !== -1) {
                    viewContainers?.splice(index, 1);
                    if (viewContainers.length === 0) {
                        this.viewContainers.delete(viewContainerLocation);
                    }
                    this._onDidDeregister.fire({ viewContainer, viewContainerLocation });
                    return;
                }
            }
        }
        get(id) {
            return this.all.filter(viewContainer => viewContainer.id === id)[0];
        }
        getViewContainers(location) {
            return [...(this.viewContainers.get(location) || [])];
        }
        getViewContainerLocation(container) {
            return [...this.viewContainers.keys()].filter(location => this.getViewContainers(location).filter(viewContainer => viewContainer?.id === container.id).length > 0)[0];
        }
        getDefaultViewContainer(location) {
            return this.defaultViewContainers.find(viewContainer => this.getViewContainerLocation(viewContainer) === location);
        }
    }
    platform_1.Registry.add(Extensions.ViewContainersRegistry, new ViewContainersRegistryImpl());
    var ViewContentGroups;
    (function (ViewContentGroups) {
        ViewContentGroups["Open"] = "2_open";
        ViewContentGroups["Debug"] = "4_debug";
        ViewContentGroups["SCM"] = "5_scm";
        ViewContentGroups["More"] = "9_more";
    })(ViewContentGroups || (exports.ViewContentGroups = ViewContentGroups = {}));
    function compareViewContentDescriptors(a, b) {
        const aGroup = a.group ?? ViewContentGroups.More;
        const bGroup = b.group ?? ViewContentGroups.More;
        if (aGroup !== bGroup) {
            return aGroup.localeCompare(bGroup);
        }
        return (a.order ?? 5) - (b.order ?? 5);
    }
    class ViewsRegistry extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onViewsRegistered = this._register(new event_1.Emitter());
            this.onViewsRegistered = this._onViewsRegistered.event;
            this._onViewsDeregistered = this._register(new event_1.Emitter());
            this.onViewsDeregistered = this._onViewsDeregistered.event;
            this._onDidChangeContainer = this._register(new event_1.Emitter());
            this.onDidChangeContainer = this._onDidChangeContainer.event;
            this._onDidChangeViewWelcomeContent = this._register(new event_1.Emitter());
            this.onDidChangeViewWelcomeContent = this._onDidChangeViewWelcomeContent.event;
            this._viewContainers = [];
            this._views = new Map();
            this._viewWelcomeContents = new collections_1.SetMap();
        }
        registerViews(views, viewContainer) {
            this.registerViews2([{ views, viewContainer }]);
        }
        registerViews2(views) {
            views.forEach(({ views, viewContainer }) => this.addViews(views, viewContainer));
            this._onViewsRegistered.fire(views);
        }
        deregisterViews(viewDescriptors, viewContainer) {
            const views = this.removeViews(viewDescriptors, viewContainer);
            if (views.length) {
                this._onViewsDeregistered.fire({ views, viewContainer });
            }
        }
        moveViews(viewsToMove, viewContainer) {
            for (const container of this._views.keys()) {
                if (container !== viewContainer) {
                    const views = this.removeViews(viewsToMove, container);
                    if (views.length) {
                        this.addViews(views, viewContainer);
                        this._onDidChangeContainer.fire({ views, from: container, to: viewContainer });
                    }
                }
            }
        }
        getViews(loc) {
            return this._views.get(loc) || [];
        }
        getView(id) {
            for (const viewContainer of this._viewContainers) {
                const viewDescriptor = (this._views.get(viewContainer) || []).filter(v => v.id === id)[0];
                if (viewDescriptor) {
                    return viewDescriptor;
                }
            }
            return null;
        }
        getViewContainer(viewId) {
            for (const viewContainer of this._viewContainers) {
                const viewDescriptor = (this._views.get(viewContainer) || []).filter(v => v.id === viewId)[0];
                if (viewDescriptor) {
                    return viewContainer;
                }
            }
            return null;
        }
        registerViewWelcomeContent(id, viewContent) {
            this._viewWelcomeContents.add(id, viewContent);
            this._onDidChangeViewWelcomeContent.fire(id);
            return (0, lifecycle_1.toDisposable)(() => {
                this._viewWelcomeContents.delete(id, viewContent);
                this._onDidChangeViewWelcomeContent.fire(id);
            });
        }
        registerViewWelcomeContent2(id, viewContentMap) {
            const disposables = new Map();
            for (const [key, content] of viewContentMap) {
                this._viewWelcomeContents.add(id, content);
                disposables.set(key, (0, lifecycle_1.toDisposable)(() => {
                    this._viewWelcomeContents.delete(id, content);
                    this._onDidChangeViewWelcomeContent.fire(id);
                }));
            }
            this._onDidChangeViewWelcomeContent.fire(id);
            return disposables;
        }
        getViewWelcomeContent(id) {
            const result = [];
            this._viewWelcomeContents.forEach(id, descriptor => result.push(descriptor));
            return result.sort(compareViewContentDescriptors);
        }
        addViews(viewDescriptors, viewContainer) {
            let views = this._views.get(viewContainer);
            if (!views) {
                views = [];
                this._views.set(viewContainer, views);
                this._viewContainers.push(viewContainer);
            }
            for (const viewDescriptor of viewDescriptors) {
                if (this.getView(viewDescriptor.id) !== null) {
                    throw new Error((0, nls_1.localize)('duplicateId', "A view with id '{0}' is already registered", viewDescriptor.id));
                }
                views.push(viewDescriptor);
            }
        }
        removeViews(viewDescriptors, viewContainer) {
            const views = this._views.get(viewContainer);
            if (!views) {
                return [];
            }
            const viewsToDeregister = [];
            const remaningViews = [];
            for (const view of views) {
                if (!viewDescriptors.includes(view)) {
                    remaningViews.push(view);
                }
                else {
                    viewsToDeregister.push(view);
                }
            }
            if (viewsToDeregister.length) {
                if (remaningViews.length) {
                    this._views.set(viewContainer, remaningViews);
                }
                else {
                    this._views.delete(viewContainer);
                    this._viewContainers.splice(this._viewContainers.indexOf(viewContainer), 1);
                }
            }
            return viewsToDeregister;
        }
    }
    platform_1.Registry.add(Extensions.ViewsRegistry, new ViewsRegistry());
    exports.IViewsService = (0, instantiation_1.createDecorator)('viewsService');
    exports.IViewDescriptorService = (0, instantiation_1.createDecorator)('viewDescriptorService');
    var ViewVisibilityState;
    (function (ViewVisibilityState) {
        ViewVisibilityState[ViewVisibilityState["Default"] = 0] = "Default";
        ViewVisibilityState[ViewVisibilityState["Expand"] = 1] = "Expand";
    })(ViewVisibilityState || (exports.ViewVisibilityState = ViewVisibilityState = {}));
    var TreeItemCollapsibleState;
    (function (TreeItemCollapsibleState) {
        TreeItemCollapsibleState[TreeItemCollapsibleState["None"] = 0] = "None";
        TreeItemCollapsibleState[TreeItemCollapsibleState["Collapsed"] = 1] = "Collapsed";
        TreeItemCollapsibleState[TreeItemCollapsibleState["Expanded"] = 2] = "Expanded";
    })(TreeItemCollapsibleState || (exports.TreeItemCollapsibleState = TreeItemCollapsibleState = {}));
    class ResolvableTreeItem {
        constructor(treeItem, resolve) {
            this.resolved = false;
            this._hasResolve = false;
            (0, objects_1.mixin)(this, treeItem);
            this._hasResolve = !!resolve;
            this.resolve = async (token) => {
                if (resolve && !this.resolved) {
                    const resolvedItem = await resolve(token);
                    if (resolvedItem) {
                        // Resolvable elements. Currently tooltip and command.
                        this.tooltip = this.tooltip ?? resolvedItem.tooltip;
                        this.command = this.command ?? resolvedItem.command;
                    }
                }
                if (!token.isCancellationRequested) {
                    this.resolved = true;
                }
            };
        }
        get hasResolve() {
            return this._hasResolve;
        }
        resetResolve() {
            this.resolved = false;
        }
        asTreeItem() {
            return {
                handle: this.handle,
                parentHandle: this.parentHandle,
                collapsibleState: this.collapsibleState,
                label: this.label,
                description: this.description,
                icon: this.icon,
                iconDark: this.iconDark,
                themeIcon: this.themeIcon,
                resourceUri: this.resourceUri,
                tooltip: this.tooltip,
                contextValue: this.contextValue,
                command: this.command,
                children: this.children,
                accessibilityInformation: this.accessibilityInformation
            };
        }
    }
    exports.ResolvableTreeItem = ResolvableTreeItem;
    class NoTreeViewError extends Error {
        constructor(treeViewId) {
            super((0, nls_1.localize)('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', treeViewId));
            this.name = 'NoTreeViewError';
        }
        static is(err) {
            return err.name === 'NoTreeViewError';
        }
    }
    exports.NoTreeViewError = NoTreeViewError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29tbW9uL3ZpZXdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTZCbkYsUUFBQSxlQUFlLEdBQUcsSUFBQSwyQkFBWSxFQUFDLG1CQUFtQixFQUFFLGtCQUFPLENBQUMsTUFBTSxFQUFFLElBQUEsY0FBUSxFQUFDLGlCQUFpQixFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQztJQUVwSSxJQUFpQixVQUFVLENBRzFCO0lBSEQsV0FBaUIsVUFBVTtRQUNiLGlDQUFzQixHQUFHLG9DQUFvQyxDQUFDO1FBQzlELHdCQUFhLEdBQUcseUJBQXlCLENBQUM7SUFDeEQsQ0FBQyxFQUhnQixVQUFVLDBCQUFWLFVBQVUsUUFHMUI7SUFFRCxJQUFrQixxQkFJakI7SUFKRCxXQUFrQixxQkFBcUI7UUFDdEMsdUVBQU8sQ0FBQTtRQUNQLG1FQUFLLENBQUE7UUFDTCxpRkFBWSxDQUFBO0lBQ2IsQ0FBQyxFQUppQixxQkFBcUIscUNBQXJCLHFCQUFxQixRQUl0QztJQUVZLFFBQUEsc0JBQXNCLEdBQUcsd0hBQWdHLENBQUM7SUFFdkksU0FBZ0IsNkJBQTZCLENBQUMscUJBQTRDO1FBQ3pGLFFBQVEscUJBQXFCLEVBQUU7WUFDOUIsMENBQWtDLENBQUMsQ0FBQyxPQUFPLFNBQVMsQ0FBQztZQUNyRCx3Q0FBZ0MsQ0FBQyxDQUFDLE9BQU8sT0FBTyxDQUFDO1lBQ2pELCtDQUF1QyxDQUFDLENBQUMsT0FBTyxjQUFjLENBQUM7U0FDL0Q7SUFDRixDQUFDO0lBTkQsc0VBTUM7SUE2SUQsTUFBTSwwQkFBMkIsU0FBUSxzQkFBVTtRQUFuRDs7WUFFa0IsbUJBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFrRixDQUFDLENBQUM7WUFDdkksa0JBQWEsR0FBMEYsSUFBSSxDQUFD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