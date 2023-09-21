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
define(["require", "exports", "vs/base/common/resources", "vs/base/common/strings", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/base/common/themables", "vs/workbench/browser/panecomposite", "vs/workbench/browser/parts/views/treeView", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/remote/browser/remoteExplorer", "vs/workbench/contrib/scm/common/scm", "vs/workbench/contrib/webviewView/browser/webviewViewPane", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/keyCodes", "vs/platform/list/browser/listService", "vs/workbench/services/hover/browser/hover", "vs/base/common/cancellation", "vs/base/browser/ui/tree/asyncDataTree", "vs/workbench/services/views/browser/treeViewsService", "vs/platform/log/common/log"], function (require, exports, resources, strings_1, nls_1, contextkey_1, extensions_1, descriptors_1, instantiation_1, platform_1, themables_1, panecomposite_1, treeView_1, viewPaneContainer_1, contributions_1, views_1, debug_1, files_1, remoteExplorer_1, scm_1, webviewViewPane_1, extensions_2, extensionsRegistry_1, keybindingsRegistry_1, keyCodes_1, listService_1, hover_1, cancellation_1, asyncDataTree_1, treeViewsService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.viewsContainersContribution = void 0;
    const viewsContainerSchema = {
        type: 'object',
        properties: {
            id: {
                description: (0, nls_1.localize)({ key: 'vscode.extension.contributes.views.containers.id', comment: ['Contribution refers to those that an extension contributes to VS Code through an extension/contribution point. '] }, "Unique id used to identify the container in which views can be contributed using 'views' contribution point"),
                type: 'string',
                pattern: '^[a-zA-Z0-9_-]+$'
            },
            title: {
                description: (0, nls_1.localize)('vscode.extension.contributes.views.containers.title', 'Human readable string used to render the container'),
                type: 'string'
            },
            icon: {
                description: (0, nls_1.localize)('vscode.extension.contributes.views.containers.icon', "Path to the container icon. Icons are 24x24 centered on a 50x40 block and have a fill color of 'rgb(215, 218, 224)' or '#d7dae0'. It is recommended that icons be in SVG, though any image file type is accepted."),
                type: 'string'
            }
        },
        required: ['id', 'title', 'icon']
    };
    exports.viewsContainersContribution = {
        description: (0, nls_1.localize)('vscode.extension.contributes.viewsContainers', 'Contributes views containers to the editor'),
        type: 'object',
        properties: {
            'activitybar': {
                description: (0, nls_1.localize)('views.container.activitybar', "Contribute views containers to Activity Bar"),
                type: 'array',
                items: viewsContainerSchema
            },
            'panel': {
                description: (0, nls_1.localize)('views.container.panel', "Contribute views containers to Panel"),
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
                markdownDescription: (0, nls_1.localize)('vscode.extension.contributes.view.type', "Type of the view. This can either be `tree` for a tree view based view or `webview` for a webview based view. The default is `tree`."),
                type: 'string',
                enum: [
                    'tree',
                    'webview',
                ],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)('vscode.extension.contributes.view.tree', "The view is backed by a `TreeView` created by `createTreeView`."),
                    (0, nls_1.localize)('vscode.extension.contributes.view.webview', "The view is backed by a `WebviewView` registered by `registerWebviewViewProvider`."),
                ]
            },
            id: {
                markdownDescription: (0, nls_1.localize)('vscode.extension.contributes.view.id', 'Identifier of the view. This should be unique across all views. It is recommended to include your extension id as part of the view id. Use this to register a data provider through `vscode.window.registerTreeDataProviderForView` API. Also to trigger activating your extension by registering `onView:${id}` event to `activationEvents`.'),
                type: 'string'
            },
            name: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.name', 'The human-readable name of the view. Will be shown'),
                type: 'string'
            },
            when: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.when', 'Condition which must be true to show this view'),
                type: 'string'
            },
            icon: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.icon', "Path to the view icon. View icons are displayed when the name of the view cannot be shown. It is recommended that icons be in SVG, though any image file type is accepted."),
                type: 'string'
            },
            contextualTitle: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.contextualTitle', "Human-readable context for when the view is moved out of its original location. By default, the view's container name will be used."),
                type: 'string'
            },
            visibility: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.initialState', "Initial state of the view when the extension is first installed. Once the user has changed the view state by collapsing, moving, or hiding the view, the initial state will not be used again."),
                type: 'string',
                enum: [
                    'visible',
                    'hidden',
                    'collapsed'
                ],
                default: 'visible',
                enumDescriptions: [
                    (0, nls_1.localize)('vscode.extension.contributes.view.initialState.visible', "The default initial state for the view. In most containers the view will be expanded, however; some built-in containers (explorer, scm, and debug) show all contributed views collapsed regardless of the `visibility`."),
                    (0, nls_1.localize)('vscode.extension.contributes.view.initialState.hidden', "The view will not be shown in the view container, but will be discoverable through the views menu and other view entry points and can be un-hidden by the user."),
                    (0, nls_1.localize)('vscode.extension.contributes.view.initialState.collapsed', "The view will show in the view container, but will be collapsed.")
                ]
            },
            initialSize: {
                type: 'number',
                description: (0, nls_1.localize)('vscode.extension.contributs.view.size', "The initial size of the view. The size will behave like the css 'flex' property, and will set the initial size when the view is first shown. In the side bar, this is the height of the view. This value is only respected when the same extension owns both the view and the view container."),
            }
        }
    };
    const remoteViewDescriptor = {
        type: 'object',
        required: ['id', 'name'],
        properties: {
            id: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.id', 'Identifier of the view. This should be unique across all views. It is recommended to include your extension id as part of the view id. Use this to register a data provider through `vscode.window.registerTreeDataProviderForView` API. Also to trigger activating your extension by registering `onView:${id}` event to `activationEvents`.'),
                type: 'string'
            },
            name: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.name', 'The human-readable name of the view. Will be shown'),
                type: 'string'
            },
            when: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.when', 'Condition which must be true to show this view'),
                type: 'string'
            },
            group: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.group', 'Nested group in the viewlet'),
                type: 'string'
            },
            remoteName: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.remoteName', 'The name of the remote type associated with this view'),
                type: ['string', 'array'],
                items: {
                    type: 'string'
                }
            }
        }
    };
    const viewsContribution = {
        description: (0, nls_1.localize)('vscode.extension.contributes.views', "Contributes views to the editor"),
        type: 'object',
        properties: {
            'explorer': {
                description: (0, nls_1.localize)('views.explorer', "Contributes views to Explorer container in the Activity bar"),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'debug': {
                description: (0, nls_1.localize)('views.debug', "Contributes views to Debug container in the Activity bar"),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'scm': {
                description: (0, nls_1.localize)('views.scm', "Contributes views to SCM container in the Activity bar"),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'test': {
                description: (0, nls_1.localize)('views.test', "Contributes views to Test container in the Activity bar"),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'remote': {
                description: (0, nls_1.localize)('views.remote', "Contributes views to Remote container in the Activity bar. To contribute to this container, enableProposedApi needs to be turned on"),
                type: 'array',
                items: remoteViewDescriptor,
                default: []
            }
        },
        additionalProperties: {
            description: (0, nls_1.localize)('views.contributed', "Contributes views to contributed views container"),
            type: 'array',
            items: viewDescriptor,
            default: []
        }
    };
    const viewsContainersExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'viewsContainers',
        jsonSchema: exports.viewsContainersContribution
    });
    const viewsExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
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
        constructor(instantiationService, logService) {
            this.instantiationService = instantiationService;
            this.logService = logService;
            this.viewContainersRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
            this.viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
            this.handleAndRegisterCustomViewContainers();
            this.handleAndRegisterCustomViews();
            let showTreeHoverCancellation = new cancellation_1.CancellationTokenSource();
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: 'workbench.action.showTreeHover',
                handler: async (accessor, ...args) => {
                    showTreeHoverCancellation.cancel();
                    showTreeHoverCancellation = new cancellation_1.CancellationTokenSource();
                    const listService = accessor.get(listService_1.IListService);
                    const treeViewsService = accessor.get(treeViewsService_1.ITreeViewsService);
                    const hoverService = accessor.get(hover_1.IHoverService);
                    const lastFocusedList = listService.lastFocusedList;
                    if (!(lastFocusedList instanceof asyncDataTree_1.AsyncDataTree)) {
                        return;
                    }
                    const focus = lastFocusedList.getFocus();
                    if (!focus || (focus.length === 0)) {
                        return;
                    }
                    const treeItem = focus[0];
                    if (treeItem instanceof views_1.ResolvableTreeItem) {
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
                primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                when: contextkey_1.ContextKeyExpr.and(treeView_1.RawCustomTreeViewContextKey, listService_1.WorkbenchListFocusContextKey)
            });
        }
        handleAndRegisterCustomViewContainers() {
            viewsContainersExtensionPoint.setHandler((extensions, { added, removed }) => {
                if (removed.length) {
                    this.removeCustomViewContainers(removed);
                }
                if (added.length) {
                    this.addCustomViewContainers(added, this.viewContainersRegistry.all);
                }
            });
        }
        addCustomViewContainers(extensionPoints, existingViewContainers) {
            const viewContainersRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
            let activityBarOrder = CUSTOM_VIEWS_START_ORDER + viewContainersRegistry.all.filter(v => !!v.extensionId && viewContainersRegistry.getViewContainerLocation(v) === 0 /* ViewContainerLocation.Sidebar */).length;
            let panelOrder = 5 + viewContainersRegistry.all.filter(v => !!v.extensionId && viewContainersRegistry.getViewContainerLocation(v) === 1 /* ViewContainerLocation.Panel */).length + 1;
            for (const { value, collector, description } of extensionPoints) {
                Object.entries(value).forEach(([key, value]) => {
                    if (!this.isValidViewsContainer(value, collector)) {
                        return;
                    }
                    switch (key) {
                        case 'activitybar':
                            activityBarOrder = this.registerCustomViewContainers(value, description, activityBarOrder, existingViewContainers, 0 /* ViewContainerLocation.Sidebar */);
                            break;
                        case 'panel':
                            panelOrder = this.registerCustomViewContainers(value, description, panelOrder, existingViewContainers, 1 /* ViewContainerLocation.Panel */);
                            break;
                    }
                });
            }
        }
        removeCustomViewContainers(extensionPoints) {
            const viewContainersRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
            const removedExtensions = extensionPoints.reduce((result, e) => { result.add(e.description.identifier); return result; }, new extensions_1.ExtensionIdentifierSet());
            for (const viewContainer of viewContainersRegistry.all) {
                if (viewContainer.extensionId && removedExtensions.has(viewContainer.extensionId)) {
                    // move all views in this container into default view container
                    const views = this.viewsRegistry.getViews(viewContainer);
                    if (views.length) {
                        this.viewsRegistry.moveViews(views, this.getDefaultViewContainer());
                    }
                    this.deregisterCustomViewContainer(viewContainer);
                }
            }
        }
        isValidViewsContainer(viewsContainersDescriptors, collector) {
            if (!Array.isArray(viewsContainersDescriptors)) {
                collector.error((0, nls_1.localize)('viewcontainer requirearray', "views containers must be an array"));
                return false;
            }
            for (const descriptor of viewsContainersDescriptors) {
                if (typeof descriptor.id !== 'string' && (0, strings_1.isFalsyOrWhitespace)(descriptor.id)) {
                    collector.error((0, nls_1.localize)('requireidstring', "property `{0}` is mandatory and must be of type `string` with non-empty value. Only alphanumeric characters, '_', and '-' are allowed.", 'id'));
                    return false;
                }
                if (!(/^[a-z0-9_-]+$/i.test(descriptor.id))) {
                    collector.error((0, nls_1.localize)('requireidstring', "property `{0}` is mandatory and must be of type `string` with non-empty value. Only alphanumeric characters, '_', and '-' are allowed.", 'id'));
                    return false;
                }
                if (typeof descriptor.title !== 'string') {
                    collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", 'title'));
                    return false;
                }
                if (typeof descriptor.icon !== 'string') {
                    collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", 'icon'));
                    return false;
                }
                if ((0, strings_1.isFalsyOrWhitespace)(descriptor.title)) {
                    collector.warn((0, nls_1.localize)('requirenonemptystring', "property `{0}` is mandatory and must be of type `string` with non-empty value", 'title'));
                    return true;
                }
            }
            return true;
        }
        registerCustomViewContainers(containers, extension, order, existingViewContainers, location) {
            containers.forEach(descriptor => {
                const themeIcon = themables_1.ThemeIcon.fromString(descriptor.icon);
                const icon = themeIcon || resources.joinPath(extension.extensionLocation, descriptor.icon);
                const id = `workbench.view.extension.${descriptor.id}`;
                const title = descriptor.title || id;
                const viewContainer = this.registerCustomViewContainer(id, title, icon, order++, extension.identifier, location);
                // Move those views that belongs to this container
                if (existingViewContainers.length) {
                    const viewsToMove = [];
                    for (const existingViewContainer of existingViewContainers) {
                        if (viewContainer !== existingViewContainer) {
                            viewsToMove.push(...this.viewsRegistry.getViews(existingViewContainer).filter(view => view.originalContainerId === descriptor.id));
                        }
                    }
                    if (viewsToMove.length) {
                        this.viewsRegistry.moveViews(viewsToMove, viewContainer);
                    }
                }
            });
            return order;
        }
        registerCustomViewContainer(id, title, icon, order, extensionId, location) {
            let viewContainer = this.viewContainersRegistry.get(id);
            if (!viewContainer) {
                viewContainer = this.viewContainersRegistry.registerViewContainer({
                    id,
                    title: { value: title, original: title },
                    extensionId,
                    ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [id, { mergeViewWithContainerWhenSingleView: true }]),
                    hideIfEmpty: true,
                    order,
                    icon,
                }, location);
            }
            return viewContainer;
        }
        deregisterCustomViewContainer(viewContainer) {
            this.viewContainersRegistry.deregisterViewContainer(viewContainer);
            platform_1.Registry.as(panecomposite_1.Extensions.Viewlets).deregisterPaneComposite(viewContainer.id);
        }
        handleAndRegisterCustomViews() {
            viewsExtensionPoint.setHandler((extensions, { added, removed }) => {
                if (removed.length) {
                    this.removeViews(removed);
                }
                if (added.length) {
                    this.addViews(added);
                }
            });
        }
        addViews(extensions) {
            const viewIds = new Set();
            const allViewDescriptors = [];
            for (const extension of extensions) {
                const { value, collector } = extension;
                Object.entries(value).forEach(([key, value]) => {
                    if (!this.isValidViewDescriptors(value, collector)) {
                        return;
                    }
                    if (key === 'remote' && !(0, extensions_2.isProposedApiEnabled)(extension.description, 'contribViewsRemote')) {
                        collector.warn((0, nls_1.localize)('ViewContainerRequiresProposedAPI', "View container '{0}' requires 'enabledApiProposals: [\"contribViewsRemote\"]' to be added to 'Remote'.", key));
                        return;
                    }
                    const viewContainer = this.getViewContainer(key);
                    if (!viewContainer) {
                        collector.warn((0, nls_1.localize)('ViewContainerDoesnotExist', "View container '{0}' does not exist and all views registered to it will be added to 'Explorer'.", key));
                    }
                    const container = viewContainer || this.getDefaultViewContainer();
                    const viewDescriptors = [];
                    for (let index = 0; index < value.length; index++) {
                        const item = value[index];
                        // validate
                        if (viewIds.has(item.id)) {
                            collector.error((0, nls_1.localize)('duplicateView1', "Cannot register multiple views with same id `{0}`", item.id));
                            continue;
                        }
                        if (this.viewsRegistry.getView(item.id) !== null) {
                            collector.error((0, nls_1.localize)('duplicateView2', "A view with id `{0}` is already registered.", item.id));
                            continue;
                        }
                        const order = extensions_1.ExtensionIdentifier.equals(extension.description.identifier, container.extensionId)
                            ? index + 1
                            : container.viewOrderDelegate
                                ? container.viewOrderDelegate.getOrder(item.group)
                                : undefined;
                        let icon;
                        if (typeof item.icon === 'string') {
                            icon = themables_1.ThemeIcon.fromString(item.icon) || resources.joinPath(extension.description.extensionLocation, item.icon);
                        }
                        const initialVisibility = this.convertInitialVisibility(item.visibility);
                        const type = this.getViewType(item.type);
                        if (!type) {
                            collector.error((0, nls_1.localize)('unknownViewType', "Unknown view type `{0}`.", item.type));
                            continue;
                        }
                        let weight = undefined;
                        if (typeof item.initialSize === 'number') {
                            if (container.extensionId?.value === extension.description.identifier.value) {
                                weight = item.initialSize;
                            }
                            else {
                                this.logService.warn(`${extension.description.identifier.value} tried to set the view size of ${item.id} but it was ignored because the view container does not belong to it.`);
                            }
                        }
                        const viewDescriptor = {
                            type: type,
                            ctorDescriptor: type === ViewType.Tree ? new descriptors_1.SyncDescriptor(treeView_1.TreeViewPane) : new descriptors_1.SyncDescriptor(webviewViewPane_1.WebviewViewPane),
                            id: item.id,
                            name: item.name,
                            when: contextkey_1.ContextKeyExpr.deserialize(item.when),
                            containerIcon: icon || viewContainer?.icon,
                            containerTitle: item.contextualTitle || (viewContainer && (typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.value)),
                            canToggleVisibility: true,
                            canMoveView: viewContainer?.id !== remoteExplorer_1.VIEWLET_ID,
                            treeView: type === ViewType.Tree ? this.instantiationService.createInstance(treeView_1.CustomTreeView, item.id, item.name, extension.description.identifier.value) : undefined,
                            collapsed: this.showCollapsed(container) || initialVisibility === InitialVisibility.Collapsed,
                            order: order,
                            extensionId: extension.description.identifier,
                            originalContainerId: key,
                            group: item.group,
                            remoteAuthority: item.remoteName || item.remoteAuthority,
                            virtualWorkspace: item.virtualWorkspace,
                            hideByDefault: initialVisibility === InitialVisibility.Hidden,
                            workspace: viewContainer?.id === remoteExplorer_1.VIEWLET_ID ? true : undefined,
                            weight
                        };
                        viewIds.add(viewDescriptor.id);
                        viewDescriptors.push(viewDescriptor);
                    }
                    allViewDescriptors.push({ viewContainer: container, views: viewDescriptors });
                });
            }
            this.viewsRegistry.registerViews2(allViewDescriptors);
        }
        getViewType(type) {
            if (type === ViewType.Webview) {
                return ViewType.Webview;
            }
            if (!type || type === ViewType.Tree) {
                return ViewType.Tree;
            }
            return undefined;
        }
        getDefaultViewContainer() {
            return this.viewContainersRegistry.get(files_1.VIEWLET_ID);
        }
        removeViews(extensions) {
            const removedExtensions = extensions.reduce((result, e) => { result.add(e.description.identifier); return result; }, new extensions_1.ExtensionIdentifierSet());
            for (const viewContainer of this.viewContainersRegistry.all) {
                const removedViews = this.viewsRegistry.getViews(viewContainer).filter(v => v.extensionId && removedExtensions.has(v.extensionId));
                if (removedViews.length) {
                    this.viewsRegistry.deregisterViews(removedViews, viewContainer);
                    for (const view of removedViews) {
                        const anyView = view;
                        if (anyView.treeView) {
                            anyView.treeView.dispose();
                        }
                    }
                }
            }
        }
        convertInitialVisibility(value) {
            if (Object.values(InitialVisibility).includes(value)) {
                return value;
            }
            return undefined;
        }
        isValidViewDescriptors(viewDescriptors, collector) {
            if (!Array.isArray(viewDescriptors)) {
                collector.error((0, nls_1.localize)('requirearray', "views must be an array"));
                return false;
            }
            for (const descriptor of viewDescriptors) {
                if (typeof descriptor.id !== 'string') {
                    collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", 'id'));
                    return false;
                }
                if (typeof descriptor.name !== 'string') {
                    collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", 'name'));
                    return false;
                }
                if (descriptor.when && typeof descriptor.when !== 'string') {
                    collector.error((0, nls_1.localize)('optstring', "property `{0}` can be omitted or must be of type `string`", 'when'));
                    return false;
                }
                if (descriptor.icon && typeof descriptor.icon !== 'string') {
                    collector.error((0, nls_1.localize)('optstring', "property `{0}` can be omitted or must be of type `string`", 'icon'));
                    return false;
                }
                if (descriptor.contextualTitle && typeof descriptor.contextualTitle !== 'string') {
                    collector.error((0, nls_1.localize)('optstring', "property `{0}` can be omitted or must be of type `string`", 'contextualTitle'));
                    return false;
                }
                if (descriptor.visibility && !this.convertInitialVisibility(descriptor.visibility)) {
                    collector.error((0, nls_1.localize)('optenum', "property `{0}` can be omitted or must be one of {1}", 'visibility', Object.values(InitialVisibility).join(', ')));
                    return false;
                }
            }
            return true;
        }
        getViewContainer(value) {
            switch (value) {
                case 'explorer': return this.viewContainersRegistry.get(files_1.VIEWLET_ID);
                case 'debug': return this.viewContainersRegistry.get(debug_1.VIEWLET_ID);
                case 'scm': return this.viewContainersRegistry.get(scm_1.VIEWLET_ID);
                case 'remote': return this.viewContainersRegistry.get(remoteExplorer_1.VIEWLET_ID);
                default: return this.viewContainersRegistry.get(`workbench.view.extension.${value}`);
            }
        }
        showCollapsed(container) {
            switch (container.id) {
                case files_1.VIEWLET_ID:
                case scm_1.VIEWLET_ID:
                case debug_1.VIEWLET_ID:
                    return true;
            }
            return false;
        }
    };
    ViewsExtensionHandler = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, log_1.ILogService)
    ], ViewsExtensionHandler);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ViewsExtensionHandler, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3NFeHRlbnNpb25Qb2ludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci92aWV3c0V4dGVuc2lvblBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTBDaEcsTUFBTSxvQkFBb0IsR0FBZ0I7UUFDekMsSUFBSSxFQUFFLFFBQVE7UUFDZCxVQUFVLEVBQUU7WUFDWCxFQUFFLEVBQUU7Z0JBQ0gsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLGtEQUFrRCxFQUFFLE9BQU8sRUFBRSxDQUFDLGlIQUFpSCxDQUFDLEVBQUUsRUFBRSw2R0FBNkcsQ0FBQztnQkFDL1QsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLGtCQUFrQjthQUMzQjtZQUNELEtBQUssRUFBRTtnQkFDTixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMscURBQXFELEVBQUUsb0RBQW9ELENBQUM7Z0JBQ2xJLElBQUksRUFBRSxRQUFRO2FBQ2Q7WUFDRCxJQUFJLEVBQUU7Z0JBQ0wsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLG9EQUFvRCxFQUFFLG1OQUFtTixDQUFDO2dCQUNoUyxJQUFJLEVBQUUsUUFBUTthQUNkO1NBQ0Q7UUFDRCxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQztLQUNqQyxDQUFDO0lBRVcsUUFBQSwyQkFBMkIsR0FBZ0I7UUFDdkQsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLDhDQUE4QyxFQUFFLDRDQUE0QyxDQUFDO1FBQ25ILElBQUksRUFBRSxRQUFRO1FBQ2QsVUFBVSxFQUFFO1lBQ1gsYUFBYSxFQUFFO2dCQUNkLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyw2QkFBNkIsRUFBRSw2Q0FBNkMsQ0FBQztnQkFDbkcsSUFBSSxFQUFFLE9B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