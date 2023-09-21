/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/nls!vs/workbench/common/views", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/base/common/map", "vs/platform/registry/common/platform", "vs/base/common/arrays", "vs/base/common/collections", "vs/base/common/objects", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, event_1, nls_1, instantiation_1, lifecycle_1, map_1, platform_1, arrays_1, collections_1, objects_1, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bF = exports.$aF = exports.TreeItemCollapsibleState = exports.ViewVisibilityState = exports.$_E = exports.$$E = exports.ViewContentGroups = exports.$0E = exports.$9E = exports.ViewContainerLocation = exports.Extensions = exports.$8E = void 0;
    exports.$8E = (0, iconRegistry_1.$9u)('default-view-icon', codicons_1.$Pj.window, (0, nls_1.localize)(0, null));
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
    exports.$9E = [0 /* ViewContainerLocation.Sidebar */, 1 /* ViewContainerLocation.Panel */, 2 /* ViewContainerLocation.AuxiliaryBar */];
    function $0E(viewContainerLocation) {
        switch (viewContainerLocation) {
            case 0 /* ViewContainerLocation.Sidebar */: return 'sidebar';
            case 1 /* ViewContainerLocation.Panel */: return 'panel';
            case 2 /* ViewContainerLocation.AuxiliaryBar */: return 'auxiliarybar';
        }
    }
    exports.$0E = $0E;
    class ViewContainersRegistryImpl extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.c = this.B(new event_1.$fd());
            this.onDidRegister = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidDeregister = this.f.event;
            this.g = new Map();
            this.h = [];
        }
        get all() {
            return (0, arrays_1.$Pb)([...this.g.values()]);
        }
        registerViewContainer(viewContainerDescriptor, viewContainerLocation, options) {
            const existing = this.get(viewContainerDescriptor.id);
            if (existing) {
                return existing;
            }
            const viewContainer = viewContainerDescriptor;
            viewContainer.openCommandActionDescriptor = options?.doNotRegisterOpenCommand ? undefined : (viewContainer.openCommandActionDescriptor ?? { id: viewContainer.id });
            const viewContainers = (0, map_1.$wi)(this.g, viewContainerLocation, []);
            viewContainers.push(viewContainer);
            if (options?.isDefault) {
                this.h.push(viewContainer);
            }
            this.c.fire({ viewContainer, viewContainerLocation });
            return viewContainer;
        }
        deregisterViewContainer(viewContainer) {
            for (const viewContainerLocation of this.g.keys()) {
                const viewContainers = this.g.get(viewContainerLocation);
                const index = viewContainers?.indexOf(viewContainer);
                if (index !== -1) {
                    viewContainers?.splice(index, 1);
                    if (viewContainers.length === 0) {
                        this.g.delete(viewContainerLocation);
                    }
                    this.f.fire({ viewContainer, viewContainerLocation });
                    return;
                }
            }
        }
        get(id) {
            return this.all.filter(viewContainer => viewContainer.id === id)[0];
        }
        getViewContainers(location) {
            return [...(this.g.get(location) || [])];
        }
        getViewContainerLocation(container) {
            return [...this.g.keys()].filter(location => this.getViewContainers(location).filter(viewContainer => viewContainer?.id === container.id).length > 0)[0];
        }
        getDefaultViewContainer(location) {
            return this.h.find(viewContainer => this.getViewContainerLocation(viewContainer) === location);
        }
    }
    platform_1.$8m.add(Extensions.ViewContainersRegistry, new ViewContainersRegistryImpl());
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
    class ViewsRegistry extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.c = this.B(new event_1.$fd());
            this.onViewsRegistered = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onViewsDeregistered = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeContainer = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidChangeViewWelcomeContent = this.h.event;
            this.j = [];
            this.m = new Map();
            this.n = new collections_1.$L();
        }
        registerViews(views, viewContainer) {
            this.registerViews2([{ views, viewContainer }]);
        }
        registerViews2(views) {
            views.forEach(({ views, viewContainer }) => this.r(views, viewContainer));
            this.c.fire(views);
        }
        deregisterViews(viewDescriptors, viewContainer) {
            const views = this.s(viewDescriptors, viewContainer);
            if (views.length) {
                this.f.fire({ views, viewContainer });
            }
        }
        moveViews(viewsToMove, viewContainer) {
            for (const container of this.m.keys()) {
                if (container !== viewContainer) {
                    const views = this.s(viewsToMove, container);
                    if (views.length) {
                        this.r(views, viewContainer);
                        this.g.fire({ views, from: container, to: viewContainer });
                    }
                }
            }
        }
        getViews(loc) {
            return this.m.get(loc) || [];
        }
        getView(id) {
            for (const viewContainer of this.j) {
                const viewDescriptor = (this.m.get(viewContainer) || []).filter(v => v.id === id)[0];
                if (viewDescriptor) {
                    return viewDescriptor;
                }
            }
            return null;
        }
        getViewContainer(viewId) {
            for (const viewContainer of this.j) {
                const viewDescriptor = (this.m.get(viewContainer) || []).filter(v => v.id === viewId)[0];
                if (viewDescriptor) {
                    return viewContainer;
                }
            }
            return null;
        }
        registerViewWelcomeContent(id, viewContent) {
            this.n.add(id, viewContent);
            this.h.fire(id);
            return (0, lifecycle_1.$ic)(() => {
                this.n.delete(id, viewContent);
                this.h.fire(id);
            });
        }
        registerViewWelcomeContent2(id, viewContentMap) {
            const disposables = new Map();
            for (const [key, content] of viewContentMap) {
                this.n.add(id, content);
                disposables.set(key, (0, lifecycle_1.$ic)(() => {
                    this.n.delete(id, content);
                    this.h.fire(id);
                }));
            }
            this.h.fire(id);
            return disposables;
        }
        getViewWelcomeContent(id) {
            const result = [];
            this.n.forEach(id, descriptor => result.push(descriptor));
            return result.sort(compareViewContentDescriptors);
        }
        r(viewDescriptors, viewContainer) {
            let views = this.m.get(viewContainer);
            if (!views) {
                views = [];
                this.m.set(viewContainer, views);
                this.j.push(viewContainer);
            }
            for (const viewDescriptor of viewDescriptors) {
                if (this.getView(viewDescriptor.id) !== null) {
                    throw new Error((0, nls_1.localize)(1, null, viewDescriptor.id));
                }
                views.push(viewDescriptor);
            }
        }
        s(viewDescriptors, viewContainer) {
            const views = this.m.get(viewContainer);
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
                    this.m.set(viewContainer, remaningViews);
                }
                else {
                    this.m.delete(viewContainer);
                    this.j.splice(this.j.indexOf(viewContainer), 1);
                }
            }
            return viewsToDeregister;
        }
    }
    platform_1.$8m.add(Extensions.ViewsRegistry, new ViewsRegistry());
    exports.$$E = (0, instantiation_1.$Bh)('viewsService');
    exports.$_E = (0, instantiation_1.$Bh)('viewDescriptorService');
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
    class $aF {
        constructor(treeItem, resolve) {
            this.c = false;
            this.d = false;
            (0, objects_1.$Ym)(this, treeItem);
            this.d = !!resolve;
            this.resolve = async (token) => {
                if (resolve && !this.c) {
                    const resolvedItem = await resolve(token);
                    if (resolvedItem) {
                        // Resolvable elements. Currently tooltip and command.
                        this.tooltip = this.tooltip ?? resolvedItem.tooltip;
                        this.command = this.command ?? resolvedItem.command;
                    }
                }
                if (!token.isCancellationRequested) {
                    this.c = true;
                }
            };
        }
        get hasResolve() {
            return this.d;
        }
        resetResolve() {
            this.c = false;
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
    exports.$aF = $aF;
    class $bF extends Error {
        constructor(treeViewId) {
            super((0, nls_1.localize)(2, null, treeViewId));
            this.name = 'NoTreeViewError';
        }
        static is(err) {
            return err.name === 'NoTreeViewError';
        }
    }
    exports.$bF = $bF;
});
//# sourceMappingURL=views.js.map