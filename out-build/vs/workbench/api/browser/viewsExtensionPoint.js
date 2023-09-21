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
define(["require", "exports", "vs/base/common/resources", "vs/base/common/strings", "vs/nls!vs/workbench/api/browser/viewsExtensionPoint", "vs/platform/contextkey/common/contextkey", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/base/common/themables", "vs/workbench/browser/panecomposite", "vs/workbench/browser/parts/views/treeView", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/remote/browser/remoteExplorer", "vs/workbench/contrib/scm/common/scm", "vs/workbench/contrib/webviewView/browser/webviewViewPane", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/keyCodes", "vs/platform/list/browser/listService", "vs/workbench/services/hover/browser/hover", "vs/base/common/cancellation", "vs/base/browser/ui/tree/asyncDataTree", "vs/workbench/services/views/browser/treeViewsService", "vs/platform/log/common/log"], function (require, exports, resources, strings_1, nls_1, contextkey_1, extensions_1, descriptors_1, instantiation_1, platform_1, themables_1, panecomposite_1, treeView_1, viewPaneContainer_1, contributions_1, views_1, debug_1, files_1, remoteExplorer_1, scm_1, webviewViewPane_1, extensions_2, extensionsRegistry_1, keybindingsRegistry_1, keyCodes_1, listService_1, hover_1, cancellation_1, asyncDataTree_1, treeViewsService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Avb = void 0;
    const viewsContainerSchema = {
        type: 'object',
        properties: {
            id: {
                description: (0, nls_1.localize)(0, null),
                type: 'string',
                pattern: '^[a-zA-Z0-9_-]+$'
            },
            title: {
                description: (0, nls_1.localize)(1, null),
                type: 'string'
            },
            icon: {
                description: (0, nls_1.localize)(2, null),
                type: 'string'
            }
        },
        required: ['id', 'title', 'icon']
    };
    exports.$Avb = {
        description: (0, nls_1.localize)(3, null),
        type: 'object',
        properties: {
            'activitybar': {
                description: (0, nls_1.localize)(4, null),
                type: 'array',
                items: viewsContainerSchema
            },
            'panel': {
                description: (0, nls_1.localize)(5, null),
                type: 'array',
                items: viewsContainerSchema
            }
        }
    };
    var ViewType;
    (function (ViewType) {
        ViewType["Tree"] = "tree";
        ViewType["Webview"] = "webview";
    })(ViewType || (ViewType = {}));
    var InitialVisibility;
    (function (InitialVisibility) {
        InitialVisibility["Visible"] = "visible";
        InitialVisibility["Hidden"] = "hidden";
        InitialVisibility["Collapsed"] = "collapsed";
    })(InitialVisibility || (InitialVisibility = {}));
    const viewDescriptor = {
        type: 'object',
        required: ['id', 'name'],
        defaultSnippets: [{ body: { id: '${1:id}', name: '${2:name}' } }],
        properties: {
            type: {
                markdownDescription: (0, nls_1.localize)(6, null),
                type: 'string',
                enum: [
                    'tree',
                    'webview',
                ],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)(7, null),
                    (0, nls_1.localize)(8, null),
                ]
            },
            id: {
                markdownDescription: (0, nls_1.localize)(9, null),
                type: 'string'
            },
            name: {
                description: (0, nls_1.localize)(10, null),
                type: 'string'
            },
            when: {
                description: (0, nls_1.localize)(11, null),
                type: 'string'
            },
            icon: {
                description: (0, nls_1.localize)(12, null),
                type: 'string'
            },
            contextualTitle: {
                description: (0, nls_1.localize)(13, null),
                type: 'string'
            },
            visibility: {
                description: (0, nls_1.localize)(14, null),
                type: 'string',
                enum: [
                    'visible',
                    'hidden',
                    'collapsed'
                ],
                default: 'visible',
                enumDescriptions: [
                    (0, nls_1.localize)(15, null),
                    (0, nls_1.localize)(16, null),
                    (0, nls_1.localize)(17, null)
                ]
            },
            initialSize: {
                type: 'number',
                description: (0, nls_1.localize)(18, null),
            }
        }
    };
    const remoteViewDescriptor = {
        type: 'object',
        required: ['id', 'name'],
        properties: {
            id: {
                description: (0, nls_1.localize)(19, null),
                type: 'string'
            },
            name: {
                description: (0, nls_1.localize)(20, null),
                type: 'string'
            },
            when: {
                description: (0, nls_1.localize)(21, null),
                type: 'string'
            },
            group: {
                description: (0, nls_1.localize)(22, null),
                type: 'string'
            },
            remoteName: {
                description: (0, nls_1.localize)(23, null),
                type: ['string', 'array'],
                items: {
                    type: 'string'
                }
            }
        }
    };
    const viewsContribution = {
        description: (0, nls_1.localize)(24, null),
        type: 'object',
        properties: {
            'explorer': {
                description: (0, nls_1.localize)(25, null),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'debug': {
                description: (0, nls_1.localize)(26, null),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'scm': {
                description: (0, nls_1.localize)(27, null),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'test': {
                description: (0, nls_1.localize)(28, null),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'remote': {
                description: (0, nls_1.localize)(29, null),
                type: 'array',
                items: remoteViewDescriptor,
                default: []
            }
        },
        additionalProperties: {
            description: (0, nls_1.localize)(30, null),
            type: 'array',
            items: viewDescriptor,
            default: []
        }
    };
    const viewsContainersExtensionPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'viewsContainers',
        jsonSchema: exports.$Avb
    });
    const viewsExtensionPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'views',
        deps: [viewsContainersExtensionPoint],
        jsonSchema: viewsContribution,
        activationEventsGenerator: (viewExtensionPointTypeArray, result) => {
            for (const viewExtensionPointType of viewExtensionPointTypeArray) {
                for (const viewDescriptors of Object.values(viewExtensionPointType)) {
                    for (const viewDescriptor of viewDescriptors) {
                        if (viewDescriptor.id) {
                            result.push(`onView:${viewDescriptor.id}`);
                        }
                    }
                }
            }
        }
    });
    const CUSTOM_VIEWS_START_ORDER = 7;
    let ViewsExtensionHandler = class ViewsExtensionHandler {
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.a = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry);
            this.b = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
            this.f();
            this.m();
            let showTreeHoverCancellation = new cancellation_1.$pd();
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: 'workbench.action.showTreeHover',
                handler: async (accessor, ...args) => {
                    showTreeHoverCancellation.cancel();
                    showTreeHoverCancellation = new cancellation_1.$pd();
                    const listService = accessor.get(listService_1.$03);
                    const treeViewsService = accessor.get(treeViewsService_1.$4ub);
                    const hoverService = accessor.get(hover_1.$zib);
                    const lastFocusedList = listService.lastFocusedList;
                    if (!(lastFocusedList instanceof asyncDataTree_1.$oS)) {
                        return;
                    }
                    const focus = lastFocusedList.getFocus();
                    if (!focus || (focus.length === 0)) {
                        return;
                    }
                    const treeItem = focus[0];
                    if (treeItem instanceof views_1.$aF) {
                        await treeItem.resolve(showTreeHoverCancellation.token);
                    }
                    if (!treeItem.tooltip) {
                        return;
                    }
                    const element = treeViewsService.getRenderedTreeElement(treeItem);
                    if (!element) {
                        return;
                    }
                    hoverService.showHover({
                        content: treeItem.tooltip,
                        target: element,
                        hoverPosition: 2 /* HoverPosition.BELOW */,
                        hideOnHover: false
                    }, true);
                },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                when: contextkey_1.$Ii.and(treeView_1.$8ub, listService_1.$e4)
            });
        }
        f() {
            viewsContainersExtensionPoint.setHandler((extensions, { added, removed }) => {
                if (removed.length) {
                    this.h(removed);
                }
                if (added.length) {
                    this.g(added, this.a.all);
                }
            });
        }
        g(extensionPoints, existingViewContainers) {
            const viewContainersRegistry = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry);
            let activityBarOrder = CUSTOM_VIEWS_START_ORDER + viewContainersRegistry.all.filter(v => !!v.extensionId && viewContainersRegistry.getViewContainerLocation(v) === 0 /* ViewContainerLocation.Sidebar */).length;
            let panelOrder = 5 + viewContainersRegistry.all.filter(v => !!v.extensionId && viewContainersRegistry.getViewContainerLocation(v) === 1 /* ViewContainerLocation.Panel */).length + 1;
            for (const { value, collector, description } of extensionPoints) {
                Object.entries(value).forEach(([key, value]) => {
                    if (!this.i(value, collector)) {
                        return;
                    }
                    switch (key) {
                        case 'activitybar':
                            activityBarOrder = this.j(value, description, activityBarOrder, existingViewContainers, 0 /* ViewContainerLocation.Sidebar */);
                            break;
                        case 'panel':
                            panelOrder = this.j(value, description, panelOrder, existingViewContainers, 1 /* ViewContainerLocation.Panel */);
                            break;
                    }
                });
            }
        }
        h(extensionPoints) {
            const viewContainersRegistry = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry);
            const removedExtensions = extensionPoints.reduce((result, e) => { result.add(e.description.identifier); return result; }, new extensions_1.$Wl());
            for (const viewContainer of viewContainersRegistry.all) {
                if (viewContainer.extensionId && removedExtensions.has(viewContainer.extensionId)) {
                    // move all views in this container into default view container
                    const views = this.b.getViews(viewContainer);
                    if (views.length) {
                        this.b.moveViews(views, this.p());
                    }
                    this.l(viewContainer);
                }
            }
        }
        i(viewsContainersDescriptors, collector) {
            if (!Array.isArray(viewsContainersDescriptors)) {
                collector.error((0, nls_1.localize)(31, null));
                return false;
            }
            for (const descriptor of viewsContainersDescriptors) {
                if (typeof descriptor.id !== 'string' && (0, strings_1.$me)(descriptor.id)) {
                    collector.error((0, nls_1.localize)(32, null, 'id'));
                    return false;
                }
                if (!(/^[a-z0-9_-]+$/i.test(descriptor.id))) {
                    collector.error((0, nls_1.localize)(33, null, 'id'));
                    return false;
                }
                if (typeof descriptor.title !== 'string') {
                    collector.error((0, nls_1.localize)(34, null, 'title'));
                    return false;
                }
                if (typeof descriptor.icon !== 'string') {
                    collector.error((0, nls_1.localize)(35, null, 'icon'));
                    return false;
                }
                if ((0, strings_1.$me)(descriptor.title)) {
                    collector.warn((0, nls_1.localize)(36, null, 'title'));
                    return true;
                }
            }
            return true;
        }
        j(containers, extension, order, existingViewContainers, location) {
            containers.forEach(descriptor => {
                const themeIcon = themables_1.ThemeIcon.fromString(descriptor.icon);
                const icon = themeIcon || resources.$ig(extension.extensionLocation, descriptor.icon);
                const id = `workbench.view.extension.${descriptor.id}`;
                const title = descriptor.title || id;
                const viewContainer = this.k(id, title, icon, order++, extension.identifier, location);
                // Move those views that belongs to this container
                if (existingViewContainers.length) {
                    const viewsToMove = [];
                    for (const existingViewContainer of existingViewContainers) {
                        if (viewContainer !== existingViewContainer) {
                            viewsToMove.push(...this.b.getViews(existingViewContainer).filter(view => view.originalContainerId === descriptor.id));
                        }
                    }
                    if (viewsToMove.length) {
                        this.b.moveViews(viewsToMove, viewContainer);
                    }
                }
            });
            return order;
        }
        k(id, title, icon, order, extensionId, location) {
            let viewContainer = this.a.get(id);
            if (!viewContainer) {
                viewContainer = this.a.registerViewContainer({
                    id,
                    title: { value: title, original: title },
                    extensionId,
                    ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, [id, { mergeViewWithContainerWhenSingleView: true }]),
                    hideIfEmpty: true,
                    order,
                    icon,
                }, location);
            }
            return viewContainer;
        }
        l(viewContainer) {
            this.a.deregisterViewContainer(viewContainer);
            platform_1.$8m.as(panecomposite_1.$Web.Viewlets).deregisterPaneComposite(viewContainer.id);
        }
        m() {
            viewsExtensionPoint.setHandler((extensions, { added, removed }) => {
                if (removed.length) {
                    this.q(removed);
                }
                if (added.length) {
                    this.n(added);
                }
            });
        }
        n(extensions) {
            const viewIds = new Set();
            const allViewDescriptors = [];
            for (const extension of extensions) {
                const { value, collector } = extension;
                Object.entries(value).forEach(([key, value]) => {
                    if (!this.s(value, collector)) {
                        return;
                    }
                    if (key === 'remote' && !(0, extensions_2.$PF)(extension.description, 'contribViewsRemote')) {
                        collector.warn((0, nls_1.localize)(37, null, key));
                        return;
                    }
                    const viewContainer = this.t(key);
                    if (!viewContainer) {
                        collector.warn((0, nls_1.localize)(38, null, key));
                    }
                    const container = viewContainer || this.p();
                    const viewDescriptors = [];
                    for (let index = 0; index < value.length; index++) {
                        const item = value[index];
                        // validate
                        if (viewIds.has(item.id)) {
                            collector.error((0, nls_1.localize)(39, null, item.id));
                            continue;
                        }
                        if (this.b.getView(item.id) !== null) {
                            collector.error((0, nls_1.localize)(40, null, item.id));
                            continue;
                        }
                        const order = extensions_1.$Vl.equals(extension.description.identifier, container.extensionId)
                            ? index + 1
                            : container.viewOrderDelegate
                                ? container.viewOrderDelegate.getOrder(item.group)
                                : undefined;
                        let icon;
                        if (typeof item.icon === 'string') {
                            icon = themables_1.ThemeIcon.fromString(item.icon) || resources.$ig(extension.description.extensionLocation, item.icon);
                        }
                        const initialVisibility = this.r(item.visibility);
                        const type = this.o(item.type);
                        if (!type) {
                            collector.error((0, nls_1.localize)(41, null, item.type));
                            continue;
                        }
                        let weight = undefined;
                        if (typeof item.initialSize === 'number') {
                            if (container.extensionId?.value === extension.description.identifier.value) {
                                weight = item.initialSize;
                            }
                            else {
                                this.d.warn(`${extension.description.identifier.value} tried to set the view size of ${item.id} but it was ignored because the view container does not belong to it.`);
                            }
                        }
                        const viewDescriptor = {
                            type: type,
                            ctorDescriptor: type === ViewType.Tree ? new descriptors_1.$yh(treeView_1.$7ub) : new descriptors_1.$yh(webviewViewPane_1.$zvb),
                            id: item.id,
                            name: item.name,
                            when: contextkey_1.$Ii.deserialize(item.when),
                            containerIcon: icon || viewContainer?.icon,
                            containerTitle: item.contextualTitle || (viewContainer && (typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.value)),
                            canToggleVisibility: true,
                            canMoveView: viewContainer?.id !== remoteExplorer_1.$vvb,
                            treeView: type === ViewType.Tree ? this.c.createInstance(treeView_1.$9ub, item.id, item.name, extension.description.identifier.value) : undefined,
                            collapsed: this.u(container) || initialVisibility === InitialVisibility.Collapsed,
                            order: order,
                            extensionId: extension.description.identifier,
                            originalContainerId: key,
                            group: item.group,
                            remoteAuthority: item.remoteName || item.remoteAuthority,
                            virtualWorkspace: item.virtualWorkspace,
                            hideByDefault: initialVisibility === InitialVisibility.Hidden,
                            workspace: viewContainer?.id === remoteExplorer_1.$vvb ? true : undefined,
                            weight
                        };
                        viewIds.add(viewDescriptor.id);
                        viewDescriptors.push(viewDescriptor);
                    }
                    allViewDescriptors.push({ viewContainer: container, views: viewDescriptors });
                });
            }
            this.b.registerViews2(allViewDescriptors);
        }
        o(type) {
            if (type === ViewType.Webview) {
                return ViewType.Webview;
            }
            if (!type || type === ViewType.Tree) {
                return ViewType.Tree;
            }
            return undefined;
        }
        p() {
            return this.a.get(files_1.$Mdb);
        }
        q(extensions) {
            const removedExtensions = extensions.reduce((result, e) => { result.add(e.description.identifier); return result; }, new extensions_1.$Wl());
            for (const viewContainer of this.a.all) {
                const removedViews = this.b.getViews(viewContainer).filter(v => v.extensionId && removedExtensions.has(v.extensionId));
                if (removedViews.length) {
                    this.b.deregisterViews(removedViews, viewContainer);
                    for (const view of removedViews) {
                        const anyView = view;
                        if (anyView.treeView) {
                            anyView.treeView.dispose();
                        }
                    }
                }
            }
        }
        r(value) {
            if (Object.values(InitialVisibility).includes(value)) {
                return value;
            }
            return undefined;
        }
        s(viewDescriptors, collector) {
            if (!Array.isArray(viewDescriptors)) {
                collector.error((0, nls_1.localize)(42, null));
                return false;
            }
            for (const descriptor of viewDescriptors) {
                if (typeof descriptor.id !== 'string') {
                    collector.error((0, nls_1.localize)(43, null, 'id'));
                    return false;
                }
                if (typeof descriptor.name !== 'string') {
                    collector.error((0, nls_1.localize)(44, null, 'name'));
                    return false;
                }
                if (descriptor.when && typeof descriptor.when !== 'string') {
                    collector.error((0, nls_1.localize)(45, null, 'when'));
                    return false;
                }
                if (descriptor.icon && typeof descriptor.icon !== 'string') {
                    collector.error((0, nls_1.localize)(46, null, 'icon'));
                    return false;
                }
                if (descriptor.contextualTitle && typeof descriptor.contextualTitle !== 'string') {
                    collector.error((0, nls_1.localize)(47, null, 'contextualTitle'));
                    return false;
                }
                if (descriptor.visibility && !this.r(descriptor.visibility)) {
                    collector.error((0, nls_1.localize)(48, null, 'visibility', Object.values(InitialVisibility).join(', ')));
                    return false;
                }
            }
            return true;
        }
        t(value) {
            switch (value) {
                case 'explorer': return this.a.get(files_1.$Mdb);
                case 'debug': return this.a.get(debug_1.$jG);
                case 'scm': return this.a.get(scm_1.$bI);
                case 'remote': return this.a.get(remoteExplorer_1.$vvb);
                default: return this.a.get(`workbench.view.extension.${value}`);
            }
        }
        u(container) {
            switch (container.id) {
                case files_1.$Mdb:
                case scm_1.$bI:
                case debug_1.$jG:
                    return true;
            }
            return false;
        }
    };
    ViewsExtensionHandler = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, log_1.$5i)
    ], ViewsExtensionHandler);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ViewsExtensionHandler, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=viewsExtensionPoint.js.map