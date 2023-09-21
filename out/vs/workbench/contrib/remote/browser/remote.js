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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/uri", "vs/workbench/services/layout/browser/layoutService", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/contextview/browser/contextView", "vs/workbench/services/extensions/common/extensions", "vs/workbench/browser/parts/views/viewsViewlet", "vs/workbench/contrib/remote/browser/remoteExplorer", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/views", "vs/platform/registry/common/platform", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/commands/common/commands", "vs/platform/actions/common/actions", "vs/platform/progress/common/progress", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/workbench/browser/actions/windowActions", "vs/base/common/lifecycle", "vs/workbench/contrib/remote/browser/explorerViewItems", "vs/base/common/types", "vs/workbench/services/remote/common/remoteExplorerService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/browser/parts/views/viewPane", "vs/platform/list/browser/listService", "vs/platform/keybinding/common/keybinding", "vs/base/common/event", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/instantiation/common/descriptors", "vs/workbench/contrib/remote/browser/remoteIcons", "vs/platform/log/common/log", "vs/workbench/services/timer/browser/timerService", "vs/platform/remote/common/remoteHosts", "vs/platform/workspace/common/virtualWorkspace", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService", "vs/base/common/network", "vs/css!./media/remoteViewlet"], function (require, exports, nls, dom, uri_1, layoutService_1, telemetry_1, workspace_1, storage_1, configuration_1, instantiation_1, themeService_1, themables_1, contextView_1, extensions_1, viewsViewlet_1, remoteExplorer_1, contextkey_1, views_1, platform_1, opener_1, quickInput_1, commands_1, actions_1, progress_1, remoteAgentService_1, dialogs_1, severity_1, windowActions_1, lifecycle_1, explorerViewItems_1, types_1, remoteExplorerService_1, environmentService_1, viewPane_1, listService_1, keybinding_1, event_1, extensionsRegistry_1, descriptors_1, icons, log_1, timerService_1, remoteHosts_1, virtualWorkspace_1, gettingStartedService_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteAgentConnectionStatusListener = exports.RemoteMarkers = void 0;
    const getStartedWalkthrough = {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                description: nls.localize('getStartedWalkthrough.id', 'The ID of a Get Started walkthrough to open.'),
                type: 'string'
            },
        }
    };
    const remoteHelpExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'remoteHelp',
        jsonSchema: {
            description: nls.localize('RemoteHelpInformationExtPoint', 'Contributes help information for Remote'),
            type: 'object',
            properties: {
                'getStarted': {
                    description: nls.localize('RemoteHelpInformationExtPoint.getStarted', "The url, or a command that returns the url, to your project's Getting Started page, or a walkthrough ID contributed by your project's extension"),
                    oneOf: [
                        { type: 'string' },
                        getStartedWalkthrough
                    ]
                },
                'documentation': {
                    description: nls.localize('RemoteHelpInformationExtPoint.documentation', "The url, or a command that returns the url, to your project's documentation page"),
                    type: 'string'
                },
                'feedback': {
                    description: nls.localize('RemoteHelpInformationExtPoint.feedback', "The url, or a command that returns the url, to your project's feedback reporter"),
                    type: 'string',
                    markdownDeprecationMessage: nls.localize('RemoteHelpInformationExtPoint.feedback.deprecated', "Use {0} instead", '`reportIssue`')
                },
                'reportIssue': {
                    description: nls.localize('RemoteHelpInformationExtPoint.reportIssue', "The url, or a command that returns the url, to your project's issue reporter"),
                    type: 'string'
                },
                'issues': {
                    description: nls.localize('RemoteHelpInformationExtPoint.issues', "The url, or a command that returns the url, to your project's issues list"),
                    type: 'string'
                }
            }
        }
    });
    class HelpTreeVirtualDelegate {
        getHeight(element) {
            return 22;
        }
        getTemplateId(element) {
            return 'HelpItemTemplate';
        }
    }
    class HelpTreeRenderer {
        constructor() {
            this.templateId = 'HelpItemTemplate';
        }
        renderTemplate(container) {
            container.classList.add('remote-help-tree-node-item');
            const icon = dom.append(container, dom.$('.remote-help-tree-node-item-icon'));
            const parent = container;
            return { parent, icon };
        }
        renderElement(element, index, templateData, height) {
            const container = templateData.parent;
            dom.append(container, templateData.icon);
            templateData.icon.classList.add(...element.element.iconClasses);
            const labelContainer = dom.append(container, dom.$('.help-item-label'));
            labelContainer.innerText = element.element.label;
        }
        disposeTemplate(templateData) {
        }
    }
    class HelpDataSource {
        hasChildren(element) {
            return element instanceof HelpModel;
        }
        getChildren(element) {
            if (element instanceof HelpModel && element.items) {
                return element.items;
            }
            return [];
        }
    }
    class HelpModel {
        constructor(viewModel, openerService, quickInputService, commandService, remoteExplorerService, environmentService, workspaceContextService, walkthroughsService) {
            this.viewModel = viewModel;
            this.openerService = openerService;
            this.quickInputService = quickInputService;
            this.commandService = commandService;
            this.remoteExplorerService = remoteExplorerService;
            this.environmentService = environmentService;
            this.workspaceContextService = workspaceContextService;
            this.walkthroughsService = walkthroughsService;
            this.updateItems();
            viewModel.onDidChangeHelpInformation(() => this.updateItems());
        }
        createHelpItemValue(info, infoKey) {
            return new HelpItemValue(this.commandService, this.walkthroughsService, info.extensionDescription, (typeof info.remoteName === 'string') ? [info.remoteName] : info.remoteName, info.virtualWorkspace, info[infoKey]);
        }
        updateItems() {
            const helpItems = [];
            const getStarted = this.viewModel.helpInformation.filter(info => info.getStarted);
            if (getStarted.length) {
                const helpItemValues = getStarted.map((info) => this.createHelpItemValue(info, 'getStarted'));
                const getStartedHelpItem = this.items?.find(item => item.icon === icons.getStartedIcon) ?? new GetStartedHelpItem(icons.getStartedIcon, nls.localize('remote.help.getStarted', "Get Started"), helpItemValues, this.quickInputService, this.environmentService, this.openerService, this.remoteExplorerService, this.workspaceContextService, this.commandService);
                getStartedHelpItem.values = helpItemValues;
                helpItems.push(getStartedHelpItem);
            }
            const documentation = this.viewModel.helpInformation.filter(info => info.documentation);
            if (documentation.length) {
                const helpItemValues = documentation.map((info) => this.createHelpItemValue(info, 'documentation'));
                const documentationHelpItem = this.items?.find(item => item.icon === icons.documentationIcon) ?? new HelpItem(icons.documentationIcon, nls.localize('remote.help.documentation', "Read Documentation"), helpItemValues, this.quickInputService, this.environmentService, this.openerService, this.remoteExplorerService, this.workspaceContextService);
                documentationHelpItem.values = helpItemValues;
                helpItems.push(documentationHelpItem);
            }
            const issues = this.viewModel.helpInformation.filter(info => info.issues);
            if (issues.length) {
                const helpItemValues = issues.map((info) => this.createHelpItemValue(info, 'issues'));
                const reviewIssuesHelpItem = this.items?.find(item => item.icon === icons.reviewIssuesIcon) ?? new HelpItem(icons.reviewIssuesIcon, nls.localize('remote.help.issues', "Review Issues"), helpItemValues, this.quickInputService, this.environmentService, this.openerService, this.remoteExplorerService, this.workspaceContextService);
                reviewIssuesHelpItem.values = helpItemValues;
                helpItems.push(reviewIssuesHelpItem);
            }
            if (helpItems.length) {
                const helpItemValues = this.viewModel.helpInformation.map(info => this.createHelpItemValue(info, 'reportIssue'));
                const issueReporterItem = this.items?.find(item => item.icon === icons.reportIssuesIcon) ?? new IssueReporterItem(icons.reportIssuesIcon, nls.localize('remote.help.report', "Report Issue"), helpItemValues, this.quickInputService, this.environmentService, this.commandService, this.openerService, this.remoteExplorerService, this.workspaceContextService);
                issueReporterItem.values = helpItemValues;
                helpItems.push(issueReporterItem);
            }
            if (helpItems.length) {
                this.items = helpItems;
            }
        }
    }
    class HelpItemValue {
        constructor(commandService, walkthroughService, extensionDescription, remoteAuthority, virtualWorkspace, urlOrCommandOrId) {
            this.commandService = commandService;
            this.walkthroughService = walkthroughService;
            this.extensionDescription = extensionDescription;
            this.remoteAuthority = remoteAuthority;
            this.virtualWorkspace = virtualWorkspace;
            this.urlOrCommandOrId = urlOrCommandOrId;
        }
        get description() {
            return this.getUrl().then(() => this._description);
        }
        get url() {
            return this.getUrl();
        }
        async getUrl() {
            if (this._url === undefined) {
                if (typeof this.urlOrCommandOrId === 'string') {
                    const url = uri_1.URI.parse(this.urlOrCommandOrId);
                    if (url.authority) {
                        this._url = this.urlOrCommandOrId;
                    }
                    else {
                        const urlCommand = this.commandService.executeCommand(this.urlOrCommandOrId).then((result) => {
                            // if executing this command times out, cache its value whenever it eventually resolves
                            this._url = result;
                            return this._url;
                        });
                        // We must be defensive. The command may never return, meaning that no help at all is ever shown!
                        const emptyString = new Promise(resolve => setTimeout(() => resolve(''), 500));
                        this._url = await Promise.race([urlCommand, emptyString]);
                    }
                }
                else if (this.urlOrCommandOrId?.id) {
                    try {
                        const walkthroughId = `${this.extensionDescription.id}#${this.urlOrCommandOrId.id}`;
                        const walkthrough = await this.walkthroughService.getWalkthrough(walkthroughId);
                        this._description = walkthrough.title;
                        this._url = walkthroughId;
                    }
                    catch { }
                }
            }
            if (this._url === undefined) {
                this._url = '';
            }
            return this._url;
        }
    }
    class HelpItemBase {
        constructor(icon, label, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService) {
            this.icon = icon;
            this.label = label;
            this.values = values;
            this.quickInputService = quickInputService;
            this.environmentService = environmentService;
            this.remoteExplorerService = remoteExplorerService;
            this.workspaceContextService = workspaceContextService;
            this.iconClasses = [];
            this.iconClasses.push(...themables_1.ThemeIcon.asClassNameArray(icon));
            this.iconClasses.push('remote-help-tree-node-item-icon');
        }
        async getActions() {
            return (await Promise.all(this.values.map(async (value) => {
                return {
                    label: value.extensionDescription.displayName || value.extensionDescription.identifier.value,
                    description: await value.description ?? await value.url,
                    url: await value.url,
                    extensionDescription: value.extensionDescription
                };
            }))).filter(item => item.description);
        }
        async handleClick() {
            const remoteAuthority = this.environmentService.remoteAuthority;
            if (remoteAuthority) {
                for (let i = 0; i < this.remoteExplorerService.targetType.length; i++) {
                    if (remoteAuthority.startsWith(this.remoteExplorerService.targetType[i])) {
                        for (const value of this.values) {
                            if (value.remoteAuthority) {
                                for (const authority of value.remoteAuthority) {
                                    if (remoteAuthority.startsWith(authority)) {
                                        await this.takeAction(value.extensionDescription, await value.url);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else {
                const virtualWorkspace = (0, virtualWorkspace_1.getVirtualWorkspaceLocation)(this.workspaceContextService.getWorkspace())?.scheme;
                if (virtualWorkspace) {
                    for (let i = 0; i < this.remoteExplorerService.targetType.length; i++) {
                        for (const value of this.values) {
                            if (value.virtualWorkspace && value.remoteAuthority) {
                                for (const authority of value.remoteAuthority) {
                                    if (this.remoteExplorerService.targetType[i].startsWith(authority) && virtualWorkspace.startsWith(value.virtualWorkspace)) {
                                        await this.takeAction(value.extensionDescription, await value.url);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (this.values.length > 1) {
                const actions = await this.getActions();
                if (actions.length) {
                    const action = await this.quickInputService.pick(actions, { placeHolder: nls.localize('pickRemoteExtension', "Select url to open") });
                    if (action) {
                        await this.takeAction(action.extensionDescription, action.url);
                    }
                }
            }
            else {
                await this.takeAction(this.values[0].extensionDescription, await this.values[0].url);
            }
        }
    }
    class GetStartedHelpItem extends HelpItemBase {
        constructor(icon, label, values, quickInputService, environmentService, openerService, remoteExplorerService, workspaceContextService, commandService) {
            super(icon, label, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService);
            this.openerService = openerService;
            this.commandService = commandService;
        }
        async takeAction(extensionDescription, urlOrWalkthroughId) {
            if ([network_1.Schemas.http, network_1.Schemas.https].includes(uri_1.URI.parse(urlOrWalkthroughId).scheme)) {
                this.openerService.open(urlOrWalkthroughId, { allowCommands: true });
                return;
            }
            this.commandService.executeCommand('workbench.action.openWalkthrough', urlOrWalkthroughId);
        }
    }
    class HelpItem extends HelpItemBase {
        constructor(icon, label, values, quickInputService, environmentService, openerService, remoteExplorerService, workspaceContextService) {
            super(icon, label, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService);
            this.openerService = openerService;
        }
        async takeAction(extensionDescription, url) {
            await this.openerService.open(uri_1.URI.parse(url), { allowCommands: true });
        }
    }
    class IssueReporterItem extends HelpItemBase {
        constructor(icon, label, values, quickInputService, environmentService, commandService, openerService, remoteExplorerService, workspaceContextService) {
            super(icon, label, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService);
            this.commandService = commandService;
            this.openerService = openerService;
        }
        async getActions() {
            return Promise.all(this.values.map(async (value) => {
                return {
                    label: value.extensionDescription.displayName || value.extensionDescription.identifier.value,
                    description: '',
                    url: await value.url,
                    extensionDescription: value.extensionDescription
                };
            }));
        }
        async takeAction(extensionDescription, url) {
            if (!url) {
                await this.commandService.executeCommand('workbench.action.openIssueReporter', [extensionDescription.identifier.value]);
            }
            else {
                await this.openerService.open(uri_1.URI.parse(url));
            }
        }
    }
    let HelpPanel = class HelpPanel extends viewPane_1.ViewPane {
        static { this.ID = '~remote.helpPanel'; }
        static { this.TITLE = nls.localize('remote.help', "Help and feedback"); }
        constructor(viewModel, options, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, quickInputService, commandService, remoteExplorerService, environmentService, themeService, telemetryService, workspaceContextService, walkthroughsService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.viewModel = viewModel;
            this.quickInputService = quickInputService;
            this.commandService = commandService;
            this.remoteExplorerService = remoteExplorerService;
            this.environmentService = environmentService;
            this.workspaceContextService = workspaceContextService;
            this.walkthroughsService = walkthroughsService;
        }
        renderBody(container) {
            super.renderBody(container);
            container.classList.add('remote-help');
            const treeContainer = document.createElement('div');
            treeContainer.classList.add('remote-help-content');
            container.appendChild(treeContainer);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchAsyncDataTree, 'RemoteHelp', treeContainer, new HelpTreeVirtualDelegate(), [new HelpTreeRenderer()], new HelpDataSource(), {
                accessibilityProvider: {
                    getAriaLabel: (item) => {
                        return item.label;
                    },
                    getWidgetAriaLabel: () => nls.localize('remotehelp', "Remote Help")
                }
            });
            const model = new HelpModel(this.viewModel, this.openerService, this.quickInputService, this.commandService, this.remoteExplorerService, this.environmentService, this.workspaceContextService, this.walkthroughsService);
            this.tree.setInput(model);
            this._register(event_1.Event.debounce(this.tree.onDidOpen, (last, event) => event, 75, true)(e => {
                e.element?.handleClick();
            }));
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.tree.layout(height, width);
        }
    };
    HelpPanel = __decorate([
        __param(2, keybinding_1.IKeybindingService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, views_1.IViewDescriptorService),
        __param(8, opener_1.IOpenerService),
        __param(9, quickInput_1.IQuickInputService),
        __param(10, commands_1.ICommandService),
        __param(11, remoteExplorerService_1.IRemoteExplorerService),
        __param(12, environmentService_1.IWorkbenchEnvironmentService),
        __param(13, themeService_1.IThemeService),
        __param(14, telemetry_1.ITelemetryService),
        __param(15, workspace_1.IWorkspaceContextService),
        __param(16, gettingStartedService_1.IWalkthroughsService)
    ], HelpPanel);
    class HelpPanelDescriptor {
        constructor(viewModel) {
            this.id = HelpPanel.ID;
            this.name = HelpPanel.TITLE;
            this.canToggleVisibility = true;
            this.hideByDefault = false;
            this.group = 'help@50';
            this.order = -10;
            this.ctorDescriptor = new descriptors_1.SyncDescriptor(HelpPanel, [viewModel]);
        }
    }
    let RemoteViewPaneContainer = class RemoteViewPaneContainer extends viewsViewlet_1.FilterViewPaneContainer {
        constructor(layoutService, telemetryService, contextService, storageService, configurationService, instantiationService, themeService, contextMenuService, extensionService, remoteExplorerService, contextKeyService, viewDescriptorService) {
            super(remoteExplorer_1.VIEWLET_ID, remoteExplorerService.onDidChangeTargetType, configurationService, layoutService, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService, viewDescriptorService);
            this.remoteExplorerService = remoteExplorerService;
            this.contextKeyService = contextKeyService;
            this.helpPanelDescriptor = new HelpPanelDescriptor(this);
            this.helpInformation = [];
            this._onDidChangeHelpInformation = new event_1.Emitter();
            this.onDidChangeHelpInformation = this._onDidChangeHelpInformation.event;
            this.hasSetSwitchForConnection = false;
            this.hasRegisteredHelpView = false;
            this.addConstantViewDescriptors([this.helpPanelDescriptor]);
            remoteHelpExtPoint.setHandler((extensions) => {
                const helpInformation = [];
                for (const extension of extensions) {
                    this._handleRemoteInfoExtensionPoint(extension, helpInformation);
                }
                this.helpInformation = helpInformation;
                this._onDidChangeHelpInformation.fire();
                const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
                if (this.helpInformation.length && !this.hasRegisteredHelpView) {
                    viewsRegistry.registerViews([this.helpPanelDescriptor], this.viewContainer);
                    this.hasRegisteredHelpView = true;
                }
                else if (this.hasRegisteredHelpView) {
                    viewsRegistry.deregisterViews([this.helpPanelDescriptor], this.viewContainer);
                    this.hasRegisteredHelpView = false;
                }
            });
        }
        _handleRemoteInfoExtensionPoint(extension, helpInformation) {
            if (!(0, extensions_1.isProposedApiEnabled)(extension.description, 'contribRemoteHelp')) {
                return;
            }
            if (!extension.value.documentation && !extension.value.getStarted && !extension.value.issues) {
                return;
            }
            helpInformation.push({
                extensionDescription: extension.description,
                getStarted: extension.value.getStarted,
                documentation: extension.value.documentation,
                reportIssue: extension.value.reportIssue,
                issues: extension.value.issues,
                remoteName: extension.value.remoteName,
                virtualWorkspace: extension.value.virtualWorkspace
            });
        }
        getFilterOn(viewDescriptor) {
            return (0, types_1.isStringArray)(viewDescriptor.remoteAuthority) ? viewDescriptor.remoteAuthority[0] : viewDescriptor.remoteAuthority;
        }
        setFilter(viewDescriptor) {
            this.remoteExplorerService.targetType = (0, types_1.isStringArray)(viewDescriptor.remoteAuthority) ? viewDescriptor.remoteAuthority : [viewDescriptor.remoteAuthority];
        }
        getActionViewItem(action) {
            if (action.id === explorerViewItems_1.SwitchRemoteAction.ID) {
                const optionItems = explorerViewItems_1.SwitchRemoteViewItem.createOptionItems(platform_1.Registry.as(views_1.Extensions.ViewsRegistry).getViews(this.viewContainer), this.contextKeyService);
                const item = this.instantiationService.createInstance(explorerViewItems_1.SwitchRemoteViewItem, action, optionItems);
                if (!this.hasSetSwitchForConnection) {
                    this.hasSetSwitchForConnection = item.setSelectionForConnection();
                }
                else {
                    item.setSelection();
                }
                return item;
            }
            return super.getActionViewItem(action);
        }
        getTitle() {
            const title = nls.localize('remote.explorer', "Remote Explorer");
            return title;
        }
    };
    RemoteViewPaneContainer = __decorate([
        __param(0, layoutService_1.IWorkbenchLayoutService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, storage_1.IStorageService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, themeService_1.IThemeService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, extensions_1.IExtensionService),
        __param(9, remoteExplorerService_1.IRemoteExplorerService),
        __param(10, contextkey_1.IContextKeyService),
        __param(11, views_1.IViewDescriptorService)
    ], RemoteViewPaneContainer);
    (0, actions_1.registerAction2)(explorerViewItems_1.SwitchRemoteAction);
    platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: remoteExplorer_1.VIEWLET_ID,
        title: { value: nls.localize('remote.explorer', "Remote Explorer"), original: 'Remote Explorer' },
        ctorDescriptor: new descriptors_1.SyncDescriptor(RemoteViewPaneContainer),
        hideIfEmpty: true,
        viewOrderDelegate: {
            getOrder: (group) => {
                if (!group) {
                    return;
                }
                let matches = /^targets@(\d+)$/.exec(group);
                if (matches) {
                    return -1000;
                }
                matches = /^details(@(\d+))?$/.exec(group);
                if (matches) {
                    return -500 + Number(matches[2]);
                }
                matches = /^help(@(\d+))?$/.exec(group);
                if (matches) {
                    return -10;
                }
                return;
            }
        },
        icon: icons.remoteExplorerViewIcon,
        order: 4
    }, 0 /* ViewContainerLocation.Sidebar */);
    let RemoteMarkers = class RemoteMarkers {
        constructor(remoteAgentService, timerService) {
            remoteAgentService.getEnvironment().then(remoteEnv => {
                if (remoteEnv) {
                    timerService.setPerformanceMarks('server', remoteEnv.marks);
                }
            });
        }
    };
    exports.RemoteMarkers = RemoteMarkers;
    exports.RemoteMarkers = RemoteMarkers = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, timerService_1.ITimerService)
    ], RemoteMarkers);
    class VisibleProgress {
        get lastReport() {
            return this._lastReport;
        }
        constructor(progressService, location, initialReport, buttons, onDidCancel) {
            this.location = location;
            this._isDisposed = false;
            this._lastReport = initialReport;
            this._currentProgressPromiseResolve = null;
            this._currentProgress = null;
            this._currentTimer = null;
            const promise = new Promise((resolve) => this._currentProgressPromiseResolve = resolve);
            progressService.withProgress({ location: location, buttons: buttons }, (progress) => { if (!this._isDisposed) {
                this._currentProgress = progress;
            } return promise; }, (choice) => onDidCancel(choice, this._lastReport));
            if (this._lastReport) {
                this.report();
            }
        }
        dispose() {
            this._isDisposed = true;
            if (this._currentProgressPromiseResolve) {
                this._currentProgressPromiseResolve();
                this._currentProgressPromiseResolve = null;
            }
            this._currentProgress = null;
            if (this._currentTimer) {
                this._currentTimer.dispose();
                this._currentTimer = null;
            }
        }
        report(message) {
            if (message) {
                this._lastReport = message;
            }
            if (this._lastReport && this._currentProgress) {
                this._currentProgress.report({ message: this._lastReport });
            }
        }
        startTimer(completionTime) {
            this.stopTimer();
            this._currentTimer = new ReconnectionTimer(this, completionTime);
        }
        stopTimer() {
            if (this._currentTimer) {
                this._currentTimer.dispose();
                this._currentTimer = null;
            }
        }
    }
    class ReconnectionTimer {
        constructor(parent, completionTime) {
            this._parent = parent;
            this._completionTime = completionTime;
            this._token = setInterval(() => this._render(), 1000);
            this._render();
        }
        dispose() {
            clearInterval(this._token);
        }
        _render() {
            const remainingTimeMs = this._completionTime - Date.now();
            if (remainingTimeMs < 0) {
                return;
            }
            const remainingTime = Math.ceil(remainingTimeMs / 1000);
            if (remainingTime === 1) {
                this._parent.report(nls.localize('reconnectionWaitOne', "Attempting to reconnect in {0} second...", remainingTime));
            }
            else {
                this._parent.report(nls.localize('reconnectionWaitMany', "Attempting to reconnect in {0} seconds...", remainingTime));
            }
        }
    }
    /**
     * The time when a prompt is shown to the user
     */
    const DISCONNECT_PROMPT_TIME = 40 * 1000; // 40 seconds
    let RemoteAgentConnectionStatusListener = class RemoteAgentConnectionStatusListener extends lifecycle_1.Disposable {
        constructor(remoteAgentService, progressService, dialogService, commandService, quickInputService, logService, environmentService, telemetryService) {
            super();
            this._reloadWindowShown = false;
            const connection = remoteAgentService.getConnection();
            if (connection) {
                let quickInputVisible = false;
                quickInputService.onShow(() => quickInputVisible = true);
                quickInputService.onHide(() => quickInputVisible = false);
                let visibleProgress = null;
                let reconnectWaitEvent = null;
                let disposableListener = null;
                function showProgress(location, buttons, initialReport = null) {
                    if (visibleProgress) {
                        visibleProgress.dispose();
                        visibleProgress = null;
                    }
                    if (!location) {
                        location = quickInputVisible ? 15 /* ProgressLocation.Notification */ : 20 /* ProgressLocation.Dialog */;
                    }
                    return new VisibleProgress(progressService, location, initialReport, buttons.map(button => button.label), (choice, lastReport) => {
                        // Handle choice from dialog
                        if (typeof choice !== 'undefined' && buttons[choice]) {
                            buttons[choice].callback();
                        }
                        else {
                            if (location === 20 /* ProgressLocation.Dialog */) {
                                visibleProgress = showProgress(15 /* ProgressLocation.Notification */, buttons, lastReport);
                            }
                            else {
                                hideProgress();
                            }
                        }
                    });
                }
                function hideProgress() {
                    if (visibleProgress) {
                        visibleProgress.dispose();
                        visibleProgress = null;
                    }
                }
                let reconnectionToken = '';
                let lastIncomingDataTime = 0;
                let reconnectionAttempts = 0;
                const reconnectButton = {
                    label: nls.localize('reconnectNow', "Reconnect Now"),
                    callback: () => {
                        reconnectWaitEvent?.skipWait();
                    }
                };
                const reloadButton = {
                    label: nls.localize('reloadWindow', "Reload Window"),
                    callback: () => {
                        telemetryService.publicLog2('remoteReconnectionReload', {
                            remoteName: (0, remoteHosts_1.getRemoteName)(environmentService.remoteAuthority),
                            reconnectionToken: reconnectionToken,
                            millisSinceLastIncomingData: Date.now() - lastIncomingDataTime,
                            attempt: reconnectionAttempts
                        });
                        commandService.executeCommand(windowActions_1.ReloadWindowAction.ID);
                    }
                };
                // Possible state transitions:
                // ConnectionGain      -> ConnectionLost
                // ConnectionLost      -> ReconnectionWait, ReconnectionRunning
                // ReconnectionWait    -> ReconnectionRunning
                // ReconnectionRunning -> ConnectionGain, ReconnectionPermanentFailure
                connection.onDidStateChange((e) => {
                    visibleProgress?.stopTimer();
                    if (disposableListener) {
                        disposableListener.dispose();
                        disposableListener = null;
                    }
                    switch (e.type) {
                        case 0 /* PersistentConnectionEventType.ConnectionLost */:
                            reconnectionToken = e.reconnectionToken;
                            lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
                            reconnectionAttempts = 0;
                            telemetryService.publicLog2('remoteConnectionLost', {
                                remoteName: (0, remoteHosts_1.getRemoteName)(environmentService.remoteAuthority),
                                reconnectionToken: e.reconnectionToken,
                            });
                            if (visibleProgress || e.millisSinceLastIncomingData > DISCONNECT_PROMPT_TIME) {
                                if (!visibleProgress) {
                                    visibleProgress = showProgress(null, [reconnectButton, reloadButton]);
                                }
                                visibleProgress.report(nls.localize('connectionLost', "Connection Lost"));
                            }
                            break;
                        case 1 /* PersistentConnectionEventType.ReconnectionWait */:
                            if (visibleProgress) {
                                reconnectWaitEvent = e;
                                visibleProgress = showProgress(null, [reconnectButton, reloadButton]);
                                visibleProgress.startTimer(Date.now() + 1000 * e.durationSeconds);
                            }
                            break;
                        case 2 /* PersistentConnectionEventType.ReconnectionRunning */:
                            reconnectionToken = e.reconnectionToken;
                            lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
                            reconnectionAttempts = e.attempt;
                            telemetryService.publicLog2('remoteReconnectionRunning', {
                                remoteName: (0, remoteHosts_1.getRemoteName)(environmentService.remoteAuthority),
                                reconnectionToken: e.reconnectionToken,
                                millisSinceLastIncomingData: e.millisSinceLastIncomingData,
                                attempt: e.attempt
                            });
                            if (visibleProgress || e.millisSinceLastIncomingData > DISCONNECT_PROMPT_TIME) {
                                visibleProgress = showProgress(null, [reloadButton]);
                                visibleProgress.report(nls.localize('reconnectionRunning', "Disconnected. Attempting to reconnect..."));
                                // Register to listen for quick input is opened
                                disposableListener = quickInputService.onShow(() => {
                                    // Need to move from dialog if being shown and user needs to type in a prompt
                                    if (visibleProgress && visibleProgress.location === 20 /* ProgressLocation.Dialog */) {
                                        visibleProgress = showProgress(15 /* ProgressLocation.Notification */, [reloadButton], visibleProgress.lastReport);
                                    }
                                });
                            }
                            break;
                        case 3 /* PersistentConnectionEventType.ReconnectionPermanentFailure */:
                            reconnectionToken = e.reconnectionToken;
                            lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
                            reconnectionAttempts = e.attempt;
                            telemetryService.publicLog2('remoteReconnectionPermanentFailure', {
                                remoteName: (0, remoteHosts_1.getRemoteName)(environmentService.remoteAuthority),
                                reconnectionToken: e.reconnectionToken,
                                millisSinceLastIncomingData: e.millisSinceLastIncomingData,
                                attempt: e.attempt,
                                handled: e.handled
                            });
                            hideProgress();
                            if (e.handled) {
                                logService.info(`Error handled: Not showing a notification for the error.`);
                                console.log(`Error handled: Not showing a notification for the error.`);
                            }
                            else if (!this._reloadWindowShown) {
                                this._reloadWindowShown = true;
                                dialogService.confirm({
                                    type: severity_1.default.Error,
                                    message: nls.localize('reconnectionPermanentFailure', "Cannot reconnect. Please reload the window."),
                                    primaryButton: nls.localize({ key: 'reloadWindow.dialog', comment: ['&& denotes a mnemonic'] }, "&&Reload Window")
                                }).then(result => {
                                    if (result.confirmed) {
                                        commandService.executeCommand(windowActions_1.ReloadWindowAction.ID);
                                    }
                                });
                            }
                            break;
                        case 4 /* PersistentConnectionEventType.ConnectionGain */:
                            reconnectionToken = e.reconnectionToken;
                            lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
                            reconnectionAttempts = e.attempt;
                            telemetryService.publicLog2('remoteConnectionGain', {
                                remoteName: (0, remoteHosts_1.getRemoteName)(environmentService.remoteAuthority),
                                reconnectionToken: e.reconnectionToken,
                                millisSinceLastIncomingData: e.millisSinceLastIncomingData,
                                attempt: e.attempt
                            });
                            hideProgress();
                            break;
                    }
                });
            }
        }
    };
    exports.RemoteAgentConnectionStatusListener = RemoteAgentConnectionStatusListener;
    exports.RemoteAgentConnectionStatusListener = RemoteAgentConnectionStatusListener = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, progress_1.IProgressService),
        __param(2, dialogs_1.IDialogService),
        __param(3, commands_1.ICommandService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, log_1.ILogService),
        __param(6, environmentService_1.IWorkbenchEnvironmentService),
        __param(7, telemetry_1.ITelemetryService)
    ], RemoteAgentConnectionStatusListener);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcmVtb3RlL2Jyb3dzZXIvcmVtb3RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW1FaEcsTUFBTSxxQkFBcUIsR0FBZ0I7UUFDMUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFDaEIsVUFBVSxFQUFFO1lBQ1gsRUFBRSxFQUFFO2dCQUNILFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLDhDQUE4QyxDQUFDO2dCQUNyRyxJQUFJLEVBQUUsUUFBUTthQUNkO1NBQ0Q7S0FDRCxDQUFDO0lBRUYsTUFBTSxrQkFBa0IsR0FBRyx1Q0FBa0IsQ0FBQyxzQkFBc0IsQ0FBa0I7UUFDckYsY0FBYyxFQUFFLFlBQVk7UUFDNUIsVUFBVSxFQUFFO1lBQ1gsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsK0JBQStCLEVBQUUseUNBQXlDLENBQUM7WUFDckcsSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUU7Z0JBQ1gsWUFBWSxFQUFFO29CQUNiLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDBDQUEwQyxFQUFFLGlKQUFpSixDQUFDO29CQUN4TixLQUFLLEVBQUU7d0JBQ04sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO3dCQUNsQixxQkFBcUI7cUJBQ3JCO2lCQUNEO2dCQUNELGVBQWUsRUFBRTtvQkFDaEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNkNBQTZDLEVBQUUsa0ZBQWtGLENBQUM7b0JBQzVKLElBQUksRUFBRSxRQUFRO2lCQUNkO2dCQUNELFVBQVUsRUFBRTtvQkFDWCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3Q0FBd0MsRUFBRSxpRkFB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