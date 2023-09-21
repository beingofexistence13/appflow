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
define(["require", "exports", "vs/nls!vs/workbench/contrib/remote/browser/remote", "vs/base/browser/dom", "vs/base/common/uri", "vs/workbench/services/layout/browser/layoutService", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/contextview/browser/contextView", "vs/workbench/services/extensions/common/extensions", "vs/workbench/browser/parts/views/viewsViewlet", "vs/workbench/contrib/remote/browser/remoteExplorer", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/views", "vs/platform/registry/common/platform", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/commands/common/commands", "vs/platform/actions/common/actions", "vs/platform/progress/common/progress", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/workbench/browser/actions/windowActions", "vs/base/common/lifecycle", "vs/workbench/contrib/remote/browser/explorerViewItems", "vs/base/common/types", "vs/workbench/services/remote/common/remoteExplorerService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/browser/parts/views/viewPane", "vs/platform/list/browser/listService", "vs/platform/keybinding/common/keybinding", "vs/base/common/event", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/instantiation/common/descriptors", "vs/workbench/contrib/remote/browser/remoteIcons", "vs/platform/log/common/log", "vs/workbench/services/timer/browser/timerService", "vs/platform/remote/common/remoteHosts", "vs/platform/workspace/common/virtualWorkspace", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService", "vs/base/common/network", "vs/css!./media/remoteViewlet"], function (require, exports, nls, dom, uri_1, layoutService_1, telemetry_1, workspace_1, storage_1, configuration_1, instantiation_1, themeService_1, themables_1, contextView_1, extensions_1, viewsViewlet_1, remoteExplorer_1, contextkey_1, views_1, platform_1, opener_1, quickInput_1, commands_1, actions_1, progress_1, remoteAgentService_1, dialogs_1, severity_1, windowActions_1, lifecycle_1, explorerViewItems_1, types_1, remoteExplorerService_1, environmentService_1, viewPane_1, listService_1, keybinding_1, event_1, extensionsRegistry_1, descriptors_1, icons, log_1, timerService_1, remoteHosts_1, virtualWorkspace_1, gettingStartedService_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4Xb = exports.$3Xb = void 0;
    const getStartedWalkthrough = {
        type: 'object',
        required: ['id'],
        properties: {
            id: {
                description: nls.localize(0, null),
                type: 'string'
            },
        }
    };
    const remoteHelpExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'remoteHelp',
        jsonSchema: {
            description: nls.localize(1, null),
            type: 'object',
            properties: {
                'getStarted': {
                    description: nls.localize(2, null),
                    oneOf: [
                        { type: 'string' },
                        getStartedWalkthrough
                    ]
                },
                'documentation': {
                    description: nls.localize(3, null),
                    type: 'string'
                },
                'feedback': {
                    description: nls.localize(4, null),
                    type: 'string',
                    markdownDeprecationMessage: nls.localize(5, null, '`reportIssue`')
                },
                'reportIssue': {
                    description: nls.localize(6, null),
                    type: 'string'
                },
                'issues': {
                    description: nls.localize(7, null),
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
            const icon = dom.$0O(container, dom.$('.remote-help-tree-node-item-icon'));
            const parent = container;
            return { parent, icon };
        }
        renderElement(element, index, templateData, height) {
            const container = templateData.parent;
            dom.$0O(container, templateData.icon);
            templateData.icon.classList.add(...element.element.iconClasses);
            const labelContainer = dom.$0O(container, dom.$('.help-item-label'));
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
        constructor(a, b, c, d, f, g, h, j) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.l();
            a.onDidChangeHelpInformation(() => this.l());
        }
        k(info, infoKey) {
            return new HelpItemValue(this.d, this.j, info.extensionDescription, (typeof info.remoteName === 'string') ? [info.remoteName] : info.remoteName, info.virtualWorkspace, info[infoKey]);
        }
        l() {
            const helpItems = [];
            const getStarted = this.a.helpInformation.filter(info => info.getStarted);
            if (getStarted.length) {
                const helpItemValues = getStarted.map((info) => this.k(info, 'getStarted'));
                const getStartedHelpItem = this.items?.find(item => item.icon === icons.$_ub) ?? new GetStartedHelpItem(icons.$_ub, nls.localize(8, null), helpItemValues, this.c, this.g, this.b, this.f, this.h, this.d);
                getStartedHelpItem.values = helpItemValues;
                helpItems.push(getStartedHelpItem);
            }
            const documentation = this.a.helpInformation.filter(info => info.documentation);
            if (documentation.length) {
                const helpItemValues = documentation.map((info) => this.k(info, 'documentation'));
                const documentationHelpItem = this.items?.find(item => item.icon === icons.$avb) ?? new HelpItem(icons.$avb, nls.localize(9, null), helpItemValues, this.c, this.g, this.b, this.f, this.h);
                documentationHelpItem.values = helpItemValues;
                helpItems.push(documentationHelpItem);
            }
            const issues = this.a.helpInformation.filter(info => info.issues);
            if (issues.length) {
                const helpItemValues = issues.map((info) => this.k(info, 'issues'));
                const reviewIssuesHelpItem = this.items?.find(item => item.icon === icons.$cvb) ?? new HelpItem(icons.$cvb, nls.localize(10, null), helpItemValues, this.c, this.g, this.b, this.f, this.h);
                reviewIssuesHelpItem.values = helpItemValues;
                helpItems.push(reviewIssuesHelpItem);
            }
            if (helpItems.length) {
                const helpItemValues = this.a.helpInformation.map(info => this.k(info, 'reportIssue'));
                const issueReporterItem = this.items?.find(item => item.icon === icons.$dvb) ?? new IssueReporterItem(icons.$dvb, nls.localize(11, null), helpItemValues, this.c, this.g, this.d, this.b, this.f, this.h);
                issueReporterItem.values = helpItemValues;
                helpItems.push(issueReporterItem);
            }
            if (helpItems.length) {
                this.items = helpItems;
            }
        }
    }
    class HelpItemValue {
        constructor(c, d, extensionDescription, remoteAuthority, virtualWorkspace, f) {
            this.c = c;
            this.d = d;
            this.extensionDescription = extensionDescription;
            this.remoteAuthority = remoteAuthority;
            this.virtualWorkspace = virtualWorkspace;
            this.f = f;
        }
        get description() {
            return this.g().then(() => this.b);
        }
        get url() {
            return this.g();
        }
        async g() {
            if (this.a === undefined) {
                if (typeof this.f === 'string') {
                    const url = uri_1.URI.parse(this.f);
                    if (url.authority) {
                        this.a = this.f;
                    }
                    else {
                        const urlCommand = this.c.executeCommand(this.f).then((result) => {
                            // if executing this command times out, cache its value whenever it eventually resolves
                            this.a = result;
                            return this.a;
                        });
                        // We must be defensive. The command may never return, meaning that no help at all is ever shown!
                        const emptyString = new Promise(resolve => setTimeout(() => resolve(''), 500));
                        this.a = await Promise.race([urlCommand, emptyString]);
                    }
                }
                else if (this.f?.id) {
                    try {
                        const walkthroughId = `${this.extensionDescription.id}#${this.f.id}`;
                        const walkthrough = await this.d.getWalkthrough(walkthroughId);
                        this.b = walkthrough.title;
                        this.a = walkthroughId;
                    }
                    catch { }
                }
            }
            if (this.a === undefined) {
                this.a = '';
            }
            return this.a;
        }
    }
    class HelpItemBase {
        constructor(icon, label, values, a, b, c, d) {
            this.icon = icon;
            this.label = label;
            this.values = values;
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.iconClasses = [];
            this.iconClasses.push(...themables_1.ThemeIcon.asClassNameArray(icon));
            this.iconClasses.push('remote-help-tree-node-item-icon');
        }
        async f() {
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
            const remoteAuthority = this.b.remoteAuthority;
            if (remoteAuthority) {
                for (let i = 0; i < this.c.targetType.length; i++) {
                    if (remoteAuthority.startsWith(this.c.targetType[i])) {
                        for (const value of this.values) {
                            if (value.remoteAuthority) {
                                for (const authority of value.remoteAuthority) {
                                    if (remoteAuthority.startsWith(authority)) {
                                        await this.g(value.extensionDescription, await value.url);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else {
                const virtualWorkspace = (0, virtualWorkspace_1.$uJ)(this.d.getWorkspace())?.scheme;
                if (virtualWorkspace) {
                    for (let i = 0; i < this.c.targetType.length; i++) {
                        for (const value of this.values) {
                            if (value.virtualWorkspace && value.remoteAuthority) {
                                for (const authority of value.remoteAuthority) {
                                    if (this.c.targetType[i].startsWith(authority) && virtualWorkspace.startsWith(value.virtualWorkspace)) {
                                        await this.g(value.extensionDescription, await value.url);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (this.values.length > 1) {
                const actions = await this.f();
                if (actions.length) {
                    const action = await this.a.pick(actions, { placeHolder: nls.localize(12, null) });
                    if (action) {
                        await this.g(action.extensionDescription, action.url);
                    }
                }
            }
            else {
                await this.g(this.values[0].extensionDescription, await this.values[0].url);
            }
        }
    }
    class GetStartedHelpItem extends HelpItemBase {
        constructor(icon, label, values, quickInputService, environmentService, h, remoteExplorerService, workspaceContextService, j) {
            super(icon, label, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService);
            this.h = h;
            this.j = j;
        }
        async g(extensionDescription, urlOrWalkthroughId) {
            if ([network_1.Schemas.http, network_1.Schemas.https].includes(uri_1.URI.parse(urlOrWalkthroughId).scheme)) {
                this.h.open(urlOrWalkthroughId, { allowCommands: true });
                return;
            }
            this.j.executeCommand('workbench.action.openWalkthrough', urlOrWalkthroughId);
        }
    }
    class HelpItem extends HelpItemBase {
        constructor(icon, label, values, quickInputService, environmentService, h, remoteExplorerService, workspaceContextService) {
            super(icon, label, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService);
            this.h = h;
        }
        async g(extensionDescription, url) {
            await this.h.open(uri_1.URI.parse(url), { allowCommands: true });
        }
    }
    class IssueReporterItem extends HelpItemBase {
        constructor(icon, label, values, quickInputService, environmentService, h, j, remoteExplorerService, workspaceContextService) {
            super(icon, label, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService);
            this.h = h;
            this.j = j;
        }
        async f() {
            return Promise.all(this.values.map(async (value) => {
                return {
                    label: value.extensionDescription.displayName || value.extensionDescription.identifier.value,
                    description: '',
                    url: await value.url,
                    extensionDescription: value.extensionDescription
                };
            }));
        }
        async g(extensionDescription, url) {
            if (!url) {
                await this.h.executeCommand('workbench.action.openIssueReporter', [extensionDescription.identifier.value]);
            }
            else {
                await this.j.open(uri_1.URI.parse(url));
            }
        }
    }
    let HelpPanel = class HelpPanel extends viewPane_1.$Ieb {
        static { this.ID = '~remote.helpPanel'; }
        static { this.TITLE = nls.localize(13, null); }
        constructor(b, options, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, c, f, g, h, themeService, telemetryService, j, m) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
        }
        U(container) {
            super.U(container);
            container.classList.add('remote-help');
            const treeContainer = document.createElement('div');
            treeContainer.classList.add('remote-help-content');
            container.appendChild(treeContainer);
            this.a = this.Bb.createInstance(listService_1.$w4, 'RemoteHelp', treeContainer, new HelpTreeVirtualDelegate(), [new HelpTreeRenderer()], new HelpDataSource(), {
                accessibilityProvider: {
                    getAriaLabel: (item) => {
                        return item.label;
                    },
                    getWidgetAriaLabel: () => nls.localize(14, null)
                }
            });
            const model = new HelpModel(this.b, this.Cb, this.c, this.f, this.g, this.h, this.j, this.m);
            this.a.setInput(model);
            this.B(event_1.Event.debounce(this.a.onDidOpen, (last, event) => event, 75, true)(e => {
                e.element?.handleClick();
            }));
        }
        W(height, width) {
            super.W(height, width);
            this.a.layout(height, width);
        }
    };
    HelpPanel = __decorate([
        __param(2, keybinding_1.$2D),
        __param(3, contextView_1.$WZ),
        __param(4, contextkey_1.$3i),
        __param(5, configuration_1.$8h),
        __param(6, instantiation_1.$Ah),
        __param(7, views_1.$_E),
        __param(8, opener_1.$NT),
        __param(9, quickInput_1.$Gq),
        __param(10, commands_1.$Fr),
        __param(11, remoteExplorerService_1.$tsb),
        __param(12, environmentService_1.$hJ),
        __param(13, themeService_1.$gv),
        __param(14, telemetry_1.$9k),
        __param(15, workspace_1.$Kh),
        __param(16, gettingStartedService_1.$XXb)
    ], HelpPanel);
    class HelpPanelDescriptor {
        constructor(viewModel) {
            this.id = HelpPanel.ID;
            this.name = HelpPanel.TITLE;
            this.canToggleVisibility = true;
            this.hideByDefault = false;
            this.group = 'help@50';
            this.order = -10;
            this.ctorDescriptor = new descriptors_1.$yh(HelpPanel, [viewModel]);
        }
    }
    let RemoteViewPaneContainer = class RemoteViewPaneContainer extends viewsViewlet_1.$Qeb {
        constructor(layoutService, telemetryService, contextService, storageService, configurationService, instantiationService, themeService, contextMenuService, extensionService, Lb, Mb, viewDescriptorService) {
            super(remoteExplorer_1.$vvb, Lb.onDidChangeTargetType, configurationService, layoutService, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService, viewDescriptorService);
            this.Lb = Lb;
            this.Mb = Mb;
            this.Hb = new HelpPanelDescriptor(this);
            this.helpInformation = [];
            this.Ib = new event_1.$fd();
            this.onDidChangeHelpInformation = this.Ib.event;
            this.Jb = false;
            this.Kb = false;
            this.Ab([this.Hb]);
            remoteHelpExtPoint.setHandler((extensions) => {
                const helpInformation = [];
                for (const extension of extensions) {
                    this.Nb(extension, helpInformation);
                }
                this.helpInformation = helpInformation;
                this.Ib.fire();
                const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
                if (this.helpInformation.length && !this.Kb) {
                    viewsRegistry.registerViews([this.Hb], this.viewContainer);
                    this.Kb = true;
                }
                else if (this.Kb) {
                    viewsRegistry.deregisterViews([this.Hb], this.viewContainer);
                    this.Kb = false;
                }
            });
        }
        Nb(extension, helpInformation) {
            if (!(0, extensions_1.$PF)(extension.description, 'contribRemoteHelp')) {
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
        Bb(viewDescriptor) {
            return (0, types_1.$kf)(viewDescriptor.remoteAuthority) ? viewDescriptor.remoteAuthority[0] : viewDescriptor.remoteAuthority;
        }
        Cb(viewDescriptor) {
            this.Lb.targetType = (0, types_1.$kf)(viewDescriptor.remoteAuthority) ? viewDescriptor.remoteAuthority : [viewDescriptor.remoteAuthority];
        }
        getActionViewItem(action) {
            if (action.id === explorerViewItems_1.$SXb.ID) {
                const optionItems = explorerViewItems_1.$RXb.createOptionItems(platform_1.$8m.as(views_1.Extensions.ViewsRegistry).getViews(this.viewContainer), this.Mb);
                const item = this.Z.createInstance(explorerViewItems_1.$RXb, action, optionItems);
                if (!this.Jb) {
                    this.Jb = item.setSelectionForConnection();
                }
                else {
                    item.setSelection();
                }
                return item;
            }
            return super.getActionViewItem(action);
        }
        getTitle() {
            const title = nls.localize(15, null);
            return title;
        }
    };
    RemoteViewPaneContainer = __decorate([
        __param(0, layoutService_1.$Meb),
        __param(1, telemetry_1.$9k),
        __param(2, workspace_1.$Kh),
        __param(3, storage_1.$Vo),
        __param(4, configuration_1.$8h),
        __param(5, instantiation_1.$Ah),
        __param(6, themeService_1.$gv),
        __param(7, contextView_1.$WZ),
        __param(8, extensions_1.$MF),
        __param(9, remoteExplorerService_1.$tsb),
        __param(10, contextkey_1.$3i),
        __param(11, views_1.$_E)
    ], RemoteViewPaneContainer);
    (0, actions_1.$Xu)(explorerViewItems_1.$SXb);
    platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: remoteExplorer_1.$vvb,
        title: { value: nls.localize(16, null), original: 'Remote Explorer' },
        ctorDescriptor: new descriptors_1.$yh(RemoteViewPaneContainer),
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
        icon: icons.$evb,
        order: 4
    }, 0 /* ViewContainerLocation.Sidebar */);
    let $3Xb = class $3Xb {
        constructor(remoteAgentService, timerService) {
            remoteAgentService.getEnvironment().then(remoteEnv => {
                if (remoteEnv) {
                    timerService.setPerformanceMarks('server', remoteEnv.marks);
                }
            });
        }
    };
    exports.$3Xb = $3Xb;
    exports.$3Xb = $3Xb = __decorate([
        __param(0, remoteAgentService_1.$jm),
        __param(1, timerService_1.$kkb)
    ], $3Xb);
    class VisibleProgress {
        get lastReport() {
            return this.b;
        }
        constructor(progressService, location, initialReport, buttons, onDidCancel) {
            this.location = location;
            this.a = false;
            this.b = initialReport;
            this.c = null;
            this.d = null;
            this.f = null;
            const promise = new Promise((resolve) => this.c = resolve);
            progressService.withProgress({ location: location, buttons: buttons }, (progress) => { if (!this.a) {
                this.d = progress;
            } return promise; }, (choice) => onDidCancel(choice, this.b));
            if (this.b) {
                this.report();
            }
        }
        dispose() {
            this.a = true;
            if (this.c) {
                this.c();
                this.c = null;
            }
            this.d = null;
            if (this.f) {
                this.f.dispose();
                this.f = null;
            }
        }
        report(message) {
            if (message) {
                this.b = message;
            }
            if (this.b && this.d) {
                this.d.report({ message: this.b });
            }
        }
        startTimer(completionTime) {
            this.stopTimer();
            this.f = new ReconnectionTimer(this, completionTime);
        }
        stopTimer() {
            if (this.f) {
                this.f.dispose();
                this.f = null;
            }
        }
    }
    class ReconnectionTimer {
        constructor(parent, completionTime) {
            this.a = parent;
            this.b = completionTime;
            this.c = setInterval(() => this.d(), 1000);
            this.d();
        }
        dispose() {
            clearInterval(this.c);
        }
        d() {
            const remainingTimeMs = this.b - Date.now();
            if (remainingTimeMs < 0) {
                return;
            }
            const remainingTime = Math.ceil(remainingTimeMs / 1000);
            if (remainingTime === 1) {
                this.a.report(nls.localize(17, null, remainingTime));
            }
            else {
                this.a.report(nls.localize(18, null, remainingTime));
            }
        }
    }
    /**
     * The time when a prompt is shown to the user
     */
    const DISCONNECT_PROMPT_TIME = 40 * 1000; // 40 seconds
    let $4Xb = class $4Xb extends lifecycle_1.$kc {
        constructor(remoteAgentService, progressService, dialogService, commandService, quickInputService, logService, environmentService, telemetryService) {
            super();
            this.a = false;
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
                    label: nls.localize(19, null),
                    callback: () => {
                        reconnectWaitEvent?.skipWait();
                    }
                };
                const reloadButton = {
                    label: nls.localize(20, null),
                    callback: () => {
                        telemetryService.publicLog2('remoteReconnectionReload', {
                            remoteName: (0, remoteHosts_1.$Pk)(environmentService.remoteAuthority),
                            reconnectionToken: reconnectionToken,
                            millisSinceLastIncomingData: Date.now() - lastIncomingDataTime,
                            attempt: reconnectionAttempts
                        });
                        commandService.executeCommand(windowActions_1.$2tb.ID);
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
                                remoteName: (0, remoteHosts_1.$Pk)(environmentService.remoteAuthority),
                                reconnectionToken: e.reconnectionToken,
                            });
                            if (visibleProgress || e.millisSinceLastIncomingData > DISCONNECT_PROMPT_TIME) {
                                if (!visibleProgress) {
                                    visibleProgress = showProgress(null, [reconnectButton, reloadButton]);
                                }
                                visibleProgress.report(nls.localize(21, null));
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
                                remoteName: (0, remoteHosts_1.$Pk)(environmentService.remoteAuthority),
                                reconnectionToken: e.reconnectionToken,
                                millisSinceLastIncomingData: e.millisSinceLastIncomingData,
                                attempt: e.attempt
                            });
                            if (visibleProgress || e.millisSinceLastIncomingData > DISCONNECT_PROMPT_TIME) {
                                visibleProgress = showProgress(null, [reloadButton]);
                                visibleProgress.report(nls.localize(22, null));
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
                                remoteName: (0, remoteHosts_1.$Pk)(environmentService.remoteAuthority),
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
                            else if (!this.a) {
                                this.a = true;
                                dialogService.confirm({
                                    type: severity_1.default.Error,
                                    message: nls.localize(23, null),
                                    primaryButton: nls.localize(24, null)
                                }).then(result => {
                                    if (result.confirmed) {
                                        commandService.executeCommand(windowActions_1.$2tb.ID);
                                    }
                                });
                            }
                            break;
                        case 4 /* PersistentConnectionEventType.ConnectionGain */:
                            reconnectionToken = e.reconnectionToken;
                            lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
                            reconnectionAttempts = e.attempt;
                            telemetryService.publicLog2('remoteConnectionGain', {
                                remoteName: (0, remoteHosts_1.$Pk)(environmentService.remoteAuthority),
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
    exports.$4Xb = $4Xb;
    exports.$4Xb = $4Xb = __decorate([
        __param(0, remoteAgentService_1.$jm),
        __param(1, progress_1.$2u),
        __param(2, dialogs_1.$oA),
        __param(3, commands_1.$Fr),
        __param(4, quickInput_1.$Gq),
        __param(5, log_1.$5i),
        __param(6, environmentService_1.$hJ),
        __param(7, telemetry_1.$9k)
    ], $4Xb);
});
//# sourceMappingURL=remote.js.map