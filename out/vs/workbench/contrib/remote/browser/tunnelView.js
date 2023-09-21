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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/workbench/common/views", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/commands/common/commands", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/actions", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/workbench/services/remote/common/remoteExplorerService", "vs/platform/clipboard/common/clipboardService", "vs/platform/notification/common/notification", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/functional", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/browser/parts/views/viewPane", "vs/base/common/uri", "vs/platform/tunnel/common/tunnel", "vs/platform/instantiation/common/descriptors", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/actionbar/actionViewItems", "vs/workbench/contrib/remote/browser/remoteIcons", "vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService", "vs/base/common/cancellation", "vs/base/common/platform", "vs/platform/list/browser/listService", "vs/base/browser/ui/button/button", "vs/platform/theme/common/colorRegistry", "vs/base/common/htmlContent", "vs/workbench/services/hover/browser/hover", "vs/workbench/common/theme", "vs/base/common/codicons", "vs/platform/theme/browser/defaultStyles", "vs/workbench/services/remote/common/tunnelModel", "vs/css!./media/tunnelView"], function (require, exports, nls, dom, views_1, keybinding_1, contextView_1, contextkey_1, configuration_1, instantiation_1, opener_1, quickInput_1, commands_1, event_1, lifecycle_1, actionbar_1, iconLabel_1, actions_1, actions_2, menuEntryActionViewItem_1, remoteExplorerService_1, clipboardService_1, notification_1, inputBox_1, functional_1, themeService_1, themables_1, viewPane_1, uri_1, tunnel_1, descriptors_1, keybindingsRegistry_1, telemetry_1, actionViewItems_1, remoteIcons_1, externalUriOpenerService_1, cancellation_1, platform_1, listService_1, button_1, colorRegistry_1, htmlContent_1, hover_1, theme_1, codicons_1, defaultStyles_1, tunnelModel_1) {
    "use strict";
    var TunnelPanel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenPortInPreviewAction = exports.OpenPortInBrowserAction = exports.ForwardPortAction = exports.TunnelPanelDescriptor = exports.TunnelPanel = exports.TunnelViewModel = exports.openPreviewEnabledContext = void 0;
    exports.openPreviewEnabledContext = new contextkey_1.RawContextKey('openPreviewEnabled', false);
    class TunnelTreeVirtualDelegate {
        constructor(remoteExplorerService) {
            this.remoteExplorerService = remoteExplorerService;
            this.headerRowHeight = 22;
        }
        getHeight(row) {
            return (row.tunnelType === remoteExplorerService_1.TunnelType.Add && !this.remoteExplorerService.getEditableData(undefined)) ? 30 : 22;
        }
    }
    let TunnelViewModel = class TunnelViewModel {
        constructor(remoteExplorerService, tunnelService) {
            this.remoteExplorerService = remoteExplorerService;
            this.tunnelService = tunnelService;
            this._candidates = new Map();
            this.input = {
                label: nls.localize('remote.tunnelsView.addPort', "Add Port"),
                icon: undefined,
                tunnelType: remoteExplorerService_1.TunnelType.Add,
                hasRunningProcess: false,
                remoteHost: '',
                remotePort: 0,
                processDescription: '',
                tooltipPostfix: '',
                iconTooltip: '',
                portTooltip: '',
                processTooltip: '',
                originTooltip: '',
                privacyTooltip: '',
                source: { source: tunnelModel_1.TunnelSource.User, description: '' },
                protocol: tunnel_1.TunnelProtocol.Http,
                privacy: {
                    id: tunnel_1.TunnelPrivacyId.Private,
                    themeIcon: remoteIcons_1.privatePortIcon.id,
                    label: nls.localize('tunnelPrivacy.private', "Private")
                },
                strip: () => undefined
            };
            this.model = remoteExplorerService.tunnelModel;
            this.onForwardedPortsChanged = event_1.Event.any(this.model.onForwardPort, this.model.onClosePort, this.model.onPortName, this.model.onCandidatesChanged);
        }
        get all() {
            const result = [];
            this._candidates = new Map();
            this.model.candidates.forEach(candidate => {
                this._candidates.set((0, tunnelModel_1.makeAddress)(candidate.host, candidate.port), candidate);
            });
            if ((this.model.forwarded.size > 0) || this.remoteExplorerService.getEditableData(undefined)) {
                result.push(...this.forwarded);
            }
            if (this.model.detected.size > 0) {
                result.push(...this.detected);
            }
            result.push(this.input);
            return result;
        }
        addProcessInfoFromCandidate(tunnelItem) {
            const key = (0, tunnelModel_1.makeAddress)(tunnelItem.remoteHost, tunnelItem.remotePort);
            if (this._candidates.has(key)) {
                tunnelItem.processDescription = this._candidates.get(key).detail;
            }
        }
        get forwarded() {
            const forwarded = Array.from(this.model.forwarded.values()).map(tunnel => {
                const tunnelItem = TunnelItem.createFromTunnel(this.remoteExplorerService, this.tunnelService, tunnel);
                this.addProcessInfoFromCandidate(tunnelItem);
                return tunnelItem;
            }).sort((a, b) => {
                if (a.remotePort === b.remotePort) {
                    return a.remoteHost < b.remoteHost ? -1 : 1;
                }
                else {
                    return a.remotePort < b.remotePort ? -1 : 1;
                }
            });
            return forwarded;
        }
        get detected() {
            return Array.from(this.model.detected.values()).map(tunnel => {
                const tunnelItem = TunnelItem.createFromTunnel(this.remoteExplorerService, this.tunnelService, tunnel, remoteExplorerService_1.TunnelType.Detected, false);
                this.addProcessInfoFromCandidate(tunnelItem);
                return tunnelItem;
            });
        }
        isEmpty() {
            return (this.detected.length === 0) &&
                ((this.forwarded.length === 0) || (this.forwarded.length === 1 &&
                    (this.forwarded[0].tunnelType === remoteExplorerService_1.TunnelType.Add) && !this.remoteExplorerService.getEditableData(undefined)));
        }
    };
    exports.TunnelViewModel = TunnelViewModel;
    exports.TunnelViewModel = TunnelViewModel = __decorate([
        __param(0, remoteExplorerService_1.IRemoteExplorerService),
        __param(1, tunnel_1.ITunnelService)
    ], TunnelViewModel);
    function emptyCell(item) {
        return { label: '', tunnel: item, editId: remoteExplorerService_1.TunnelEditId.None, tooltip: '' };
    }
    class IconColumn {
        constructor() {
            this.label = '';
            this.tooltip = '';
            this.weight = 1;
            this.minimumWidth = 40;
            this.maximumWidth = 40;
            this.templateId = 'actionbar';
        }
        project(row) {
            if (row.tunnelType === remoteExplorerService_1.TunnelType.Add) {
                return emptyCell(row);
            }
            const icon = row.processDescription ? remoteIcons_1.forwardedPortWithProcessIcon : remoteIcons_1.forwardedPortWithoutProcessIcon;
            let tooltip = '';
            if (row instanceof TunnelItem) {
                tooltip = `${row.iconTooltip} ${row.tooltipPostfix}`;
            }
            return {
                label: '', icon, tunnel: row, editId: remoteExplorerService_1.TunnelEditId.None, tooltip
            };
        }
    }
    class PortColumn {
        constructor() {
            this.label = nls.localize('tunnel.portColumn.label', "Port");
            this.tooltip = nls.localize('tunnel.portColumn.tooltip', "The label and remote port number of the forwarded port.");
            this.weight = 1;
            this.templateId = 'actionbar';
        }
        project(row) {
            const isAdd = row.tunnelType === remoteExplorerService_1.TunnelType.Add;
            const label = row.label;
            let tooltip = '';
            if (row instanceof TunnelItem && !isAdd) {
                tooltip = `${row.portTooltip} ${row.tooltipPostfix}`;
            }
            else {
                tooltip = label;
            }
            return {
                label, tunnel: row, menuId: actions_2.MenuId.TunnelPortInline,
                editId: row.tunnelType === remoteExplorerService_1.TunnelType.Add ? remoteExplorerService_1.TunnelEditId.New : remoteExplorerService_1.TunnelEditId.Label, tooltip
            };
        }
    }
    class LocalAddressColumn {
        constructor() {
            this.label = nls.localize('tunnel.addressColumn.label', "Forwarded Address");
            this.tooltip = nls.localize('tunnel.addressColumn.tooltip', "The address that the forwarded port is available at.");
            this.weight = 1;
            this.templateId = 'actionbar';
        }
        project(row) {
            if (row.tunnelType === remoteExplorerService_1.TunnelType.Add) {
                return emptyCell(row);
            }
            const label = row.localAddress ?? '';
            let tooltip = label;
            if (row instanceof TunnelItem) {
                tooltip = row.tooltipPostfix;
            }
            return {
                label,
                menuId: actions_2.MenuId.TunnelLocalAddressInline,
                tunnel: row,
                editId: remoteExplorerService_1.TunnelEditId.LocalPort,
                tooltip,
                markdownTooltip: label ? LocalAddressColumn.getHoverText(label) : undefined
            };
        }
        static getHoverText(localAddress) {
            return function (configurationService) {
                const editorConf = configurationService.getValue('editor');
                let clickLabel = '';
                if (editorConf.multiCursorModifier === 'ctrlCmd') {
                    if (platform_1.isMacintosh) {
                        clickLabel = nls.localize('portsLink.followLinkAlt.mac', "option + click");
                    }
                    else {
                        clickLabel = nls.localize('portsLink.followLinkAlt', "alt + click");
                    }
                }
                else {
                    if (platform_1.isMacintosh) {
                        clickLabel = nls.localize('portsLink.followLinkCmd', "cmd + click");
                    }
                    else {
                        clickLabel = nls.localize('portsLink.followLinkCtrl', "ctrl + click");
                    }
                }
                const markdown = new htmlContent_1.MarkdownString('', true);
                const uri = localAddress.startsWith('http') ? localAddress : `http://${localAddress}`;
                return markdown.appendLink(uri, 'Follow link').appendMarkdown(` (${clickLabel})`);
            };
        }
    }
    class RunningProcessColumn {
        constructor() {
            this.label = nls.localize('tunnel.processColumn.label', "Running Process");
            this.tooltip = nls.localize('tunnel.processColumn.tooltip', "The command line of the process that is using the port.");
            this.weight = 2;
            this.templateId = 'actionbar';
        }
        project(row) {
            if (row.tunnelType === remoteExplorerService_1.TunnelType.Add) {
                return emptyCell(row);
            }
            const label = row.processDescription ?? '';
            return { label, tunnel: row, editId: remoteExplorerService_1.TunnelEditId.None, tooltip: row instanceof TunnelItem ? row.processTooltip : '' };
        }
    }
    class OriginColumn {
        constructor() {
            this.label = nls.localize('tunnel.originColumn.label', "Origin");
            this.tooltip = nls.localize('tunnel.originColumn.tooltip', "The source that a forwarded port originates from. Can be an extension, user forwarded, statically forwarded, or automatically forwarded.");
            this.weight = 1;
            this.templateId = 'actionbar';
        }
        project(row) {
            if (row.tunnelType === remoteExplorerService_1.TunnelType.Add) {
                return emptyCell(row);
            }
            const label = row.source.description;
            const tooltip = `${row instanceof TunnelItem ? row.originTooltip : ''}. ${row instanceof TunnelItem ? row.tooltipPostfix : ''}`;
            return { label, menuId: actions_2.MenuId.TunnelOriginInline, tunnel: row, editId: remoteExplorerService_1.TunnelEditId.None, tooltip };
        }
    }
    class PrivacyColumn {
        constructor() {
            this.label = nls.localize('tunnel.privacyColumn.label', "Visibility");
            this.tooltip = nls.localize('tunnel.privacyColumn.tooltip', "The availability of the forwarded port.");
            this.weight = 1;
            this.templateId = 'actionbar';
        }
        project(row) {
            if (row.tunnelType === remoteExplorerService_1.TunnelType.Add) {
                return emptyCell(row);
            }
            const label = row.privacy?.label;
            let tooltip = '';
            if (row instanceof TunnelItem) {
                tooltip = `${row.privacy.label} ${row.tooltipPostfix}`;
            }
            return { label, tunnel: row, icon: { id: row.privacy.themeIcon }, editId: remoteExplorerService_1.TunnelEditId.None, tooltip };
        }
    }
    let ActionBarRenderer = class ActionBarRenderer extends lifecycle_1.Disposable {
        constructor(instantiationService, contextKeyService, menuService, contextViewService, remoteExplorerService, commandService, configurationService, hoverService) {
            super();
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this.contextViewService = contextViewService;
            this.remoteExplorerService = remoteExplorerService;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.hoverService = hoverService;
            this.templateId = 'actionbar';
        }
        set actionRunner(actionRunner) {
            this._actionRunner = actionRunner;
        }
        renderTemplate(container) {
            const cell = dom.append(container, dom.$('.ports-view-actionbar-cell'));
            const icon = dom.append(cell, dom.$('.ports-view-actionbar-cell-icon'));
            const label = new iconLabel_1.IconLabel(cell, {
                supportHighlights: true,
                hoverDelegate: {
                    showHover: (options) => this.hoverService.showHover(options),
                    delay: this.configurationService.getValue('workbench.hover.delay')
                }
            });
            const actionsContainer = dom.append(cell, dom.$('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionsContainer, {
                actionViewItemProvider: menuEntryActionViewItem_1.createActionViewItem.bind(undefined, this.instantiationService)
            });
            return { label, icon, actionBar, container: cell, elementDisposable: lifecycle_1.Disposable.None };
        }
        renderElement(element, index, templateData) {
            // reset
            templateData.actionBar.clear();
            templateData.icon.className = 'ports-view-actionbar-cell-icon';
            templateData.icon.style.display = 'none';
            templateData.label.setLabel('');
            templateData.label.element.style.display = 'none';
            templateData.container.style.height = '22px';
            if (templateData.button) {
                templateData.button.element.style.display = 'none';
                templateData.button.dispose();
            }
            templateData.container.style.paddingLeft = '0px';
            templateData.elementDisposable.dispose();
            let editableData;
            if (element.editId === remoteExplorerService_1.TunnelEditId.New && (editableData = this.remoteExplorerService.getEditableData(undefined))) {
                this.renderInputBox(templateData.container, editableData);
            }
            else {
                editableData = this.remoteExplorerService.getEditableData(element.tunnel, element.editId);
                if (editableData) {
                    this.renderInputBox(templateData.container, editableData);
                }
                else if ((element.tunnel.tunnelType === remoteExplorerService_1.TunnelType.Add) && (element.menuId === actions_2.MenuId.TunnelPortInline)) {
                    this.renderButton(element, templateData);
                }
                else {
                    this.renderActionBarItem(element, templateData);
                }
            }
        }
        renderButton(element, templateData) {
            templateData.container.style.paddingLeft = '7px';
            templateData.container.style.height = '28px';
            templateData.button = this._register(new button_1.Button(templateData.container, defaultStyles_1.defaultButtonStyles));
            templateData.button.label = element.label;
            templateData.button.element.title = element.tooltip;
            this._register(templateData.button.onDidClick(() => {
                this.commandService.executeCommand(ForwardPortAction.INLINE_ID);
            }));
        }
        tunnelContext(tunnel) {
            let context;
            if (tunnel instanceof TunnelItem) {
                context = tunnel.strip();
            }
            if (!context) {
                context = {
                    tunnelType: tunnel.tunnelType,
                    remoteHost: tunnel.remoteHost,
                    remotePort: tunnel.remotePort,
                    localAddress: tunnel.localAddress,
                    protocol: tunnel.protocol,
                    localUri: tunnel.localUri,
                    localPort: tunnel.localPort,
                    name: tunnel.name,
                    closeable: tunnel.closeable,
                    source: tunnel.source,
                    privacy: tunnel.privacy,
                    processDescription: tunnel.processDescription,
                    label: tunnel.label
                };
            }
            return context;
        }
        renderActionBarItem(element, templateData) {
            templateData.label.element.style.display = 'flex';
            templateData.label.setLabel(element.label, undefined, {
                title: element.markdownTooltip ?
                    { markdown: element.markdownTooltip(this.configurationService), markdownNotSupportedFallback: element.tooltip }
                    : element.tooltip,
                extraClasses: element.menuId === actions_2.MenuId.TunnelLocalAddressInline ? ['ports-view-actionbar-cell-localaddress'] : undefined
            });
            templateData.actionBar.context = this.tunnelContext(element.tunnel);
            templateData.container.style.paddingLeft = '10px';
            const context = [
                ['view', remoteExplorerService_1.TUNNEL_VIEW_ID],
                [TunnelTypeContextKey.key, element.tunnel.tunnelType],
                [TunnelCloseableContextKey.key, element.tunnel.closeable],
                [TunnelPrivacyContextKey.key, element.tunnel.privacy.id],
                [TunnelProtocolContextKey.key, element.tunnel.protocol]
            ];
            const contextKeyService = this.contextKeyService.createOverlay(context);
            const disposableStore = new lifecycle_1.DisposableStore();
            templateData.elementDisposable = disposableStore;
            if (element.menuId) {
                const menu = disposableStore.add(this.menuService.createMenu(element.menuId, contextKeyService));
                let actions = [];
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, actions);
                if (actions) {
                    const labelActions = actions.filter(action => action.id.toLowerCase().indexOf('label') >= 0);
                    if (labelActions.length > 1) {
                        labelActions.sort((a, b) => a.label.length - b.label.length);
                        labelActions.pop();
                        actions = actions.filter(action => labelActions.indexOf(action) < 0);
                    }
                    templateData.actionBar.push(actions, { icon: true, label: false });
                    if (this._actionRunner) {
                        templateData.actionBar.actionRunner = this._actionRunner;
                    }
                }
            }
            if (element.icon) {
                templateData.icon.className = `ports-view-actionbar-cell-icon ${themables_1.ThemeIcon.asClassName(element.icon)}`;
                templateData.icon.title = element.tooltip;
                templateData.icon.style.display = 'inline';
            }
        }
        renderInputBox(container, editableData) {
            // Required for FireFox. The blur event doesn't fire on FireFox when you just mash the "+" button to forward a port.
            if (this.inputDone) {
                this.inputDone(false, false);
                this.inputDone = undefined;
            }
            container.style.paddingLeft = '5px';
            const value = editableData.startingValue || '';
            const inputBox = new inputBox_1.InputBox(container, this.contextViewService, {
                ariaLabel: nls.localize('remote.tunnelsView.input', "Press Enter to confirm or Escape to cancel."),
                validationOptions: {
                    validation: (value) => {
                        const message = editableData.validationMessage(value);
                        if (!message) {
                            return null;
                        }
                        return {
                            content: message.content,
                            formatContent: true,
                            type: message.severity === notification_1.Severity.Error ? 3 /* MessageType.ERROR */ : 1 /* MessageType.INFO */
                        };
                    }
                },
                placeholder: editableData.placeholder || '',
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles
            });
            inputBox.value = value;
            inputBox.focus();
            inputBox.select({ start: 0, end: editableData.startingValue ? editableData.startingValue.length : 0 });
            const done = (0, functional_1.once)(async (success, finishEditing) => {
                (0, lifecycle_1.dispose)(toDispose);
                if (this.inputDone) {
                    this.inputDone = undefined;
                }
                inputBox.element.style.display = 'none';
                const inputValue = inputBox.value;
                if (finishEditing) {
                    return editableData.onFinish(inputValue, success);
                }
            });
            this.inputDone = done;
            const toDispose = [
                inputBox,
                dom.addStandardDisposableListener(inputBox.inputElement, dom.EventType.KEY_DOWN, async (e) => {
                    if (e.equals(3 /* KeyCode.Enter */)) {
                        e.stopPropagation();
                        if (inputBox.validate() !== 3 /* MessageType.ERROR */) {
                            return done(true, true);
                        }
                        else {
                            return done(false, true);
                        }
                    }
                    else if (e.equals(9 /* KeyCode.Escape */)) {
                        e.preventDefault();
                        e.stopPropagation();
                        return done(false, true);
                    }
                }),
                dom.addDisposableListener(inputBox.inputElement, dom.EventType.BLUR, () => {
                    return done(inputBox.validate() !== 3 /* MessageType.ERROR */, true);
                })
            ];
            return (0, lifecycle_1.toDisposable)(() => {
                done(false, false);
            });
        }
        disposeElement(element, index, templateData, height) {
            templateData.elementDisposable.dispose();
        }
        disposeTemplate(templateData) {
            templateData.label.dispose();
            templateData.actionBar.dispose();
            templateData.elementDisposable.dispose();
            templateData.button?.dispose();
        }
    };
    ActionBarRenderer = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, actions_2.IMenuService),
        __param(3, contextView_1.IContextViewService),
        __param(4, remoteExplorerService_1.IRemoteExplorerService),
        __param(5, commands_1.ICommandService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, hover_1.IHoverService)
    ], ActionBarRenderer);
    class TunnelItem {
        static createFromTunnel(remoteExplorerService, tunnelService, tunnel, type = remoteExplorerService_1.TunnelType.Forwarded, closeable) {
            return new TunnelItem(type, tunnel.remoteHost, tunnel.remotePort, tunnel.source, !!tunnel.hasRunningProcess, tunnel.protocol, tunnel.localUri, tunnel.localAddress, tunnel.localPort, closeable === undefined ? tunnel.closeable : closeable, tunnel.name, tunnel.runningProcess, tunnel.pid, tunnel.privacy, remoteExplorerService, tunnelService);
        }
        /**
         * Removes all non-serializable properties from the tunnel
         * @returns A new TunnelItem without any services
         */
        strip() {
            return new TunnelItem(this.tunnelType, this.remoteHost, this.remotePort, this.source, this.hasRunningProcess, this.protocol, this.localUri, this.localAddress, this.localPort, this.closeable, this.name, this.runningProcess, this.pid, this._privacy);
        }
        constructor(tunnelType, remoteHost, remotePort, source, hasRunningProcess, protocol, localUri, localAddress, localPort, closeable, name, runningProcess, pid, _privacy, remoteExplorerService, tunnelService) {
            this.tunnelType = tunnelType;
            this.remoteHost = remoteHost;
            this.remotePort = remotePort;
            this.source = source;
            this.hasRunningProcess = hasRunningProcess;
            this.protocol = protocol;
            this.localUri = localUri;
            this.localAddress = localAddress;
            this.localPort = localPort;
            this.closeable = closeable;
            this.name = name;
            this.runningProcess = runningProcess;
            this.pid = pid;
            this._privacy = _privacy;
            this.remoteExplorerService = remoteExplorerService;
            this.tunnelService = tunnelService;
        }
        get label() {
            if (this.tunnelType === remoteExplorerService_1.TunnelType.Add && this.name) {
                return this.name;
            }
            const portNumberLabel = ((0, tunnel_1.isLocalhost)(this.remoteHost) || (0, tunnel_1.isAllInterfaces)(this.remoteHost))
                ? `${this.remotePort}`
                : `${this.remoteHost}:${this.remotePort}`;
            if (this.name) {
                return `${this.name} (${portNumberLabel})`;
            }
            else {
                return portNumberLabel;
            }
        }
        set processDescription(description) {
            this.runningProcess = description;
        }
        get processDescription() {
            let description = '';
            if (this.runningProcess) {
                if (this.pid && this.remoteExplorerService?.namedProcesses.has(this.pid)) {
                    // This is a known process. Give it a friendly name.
                    description = this.remoteExplorerService.namedProcesses.get(this.pid);
                }
                else {
                    description = this.runningProcess.replace(/\0/g, ' ').trim();
                }
                if (this.pid) {
                    description += ` (${this.pid})`;
                }
            }
            else if (this.hasRunningProcess) {
                description = nls.localize('tunnelView.runningProcess.inacessable', "Process information unavailable");
            }
            return description;
        }
        get tooltipPostfix() {
            let information;
            if (this.localAddress) {
                information = nls.localize('remote.tunnel.tooltipForwarded', "Remote port {0}:{1} forwarded to local address {2}. ", this.remoteHost, this.remotePort, this.localAddress);
            }
            else {
                information = nls.localize('remote.tunnel.tooltipCandidate', "Remote port {0}:{1} not forwarded. ", this.remoteHost, this.remotePort);
            }
            return information;
        }
        get iconTooltip() {
            const isAdd = this.tunnelType === remoteExplorerService_1.TunnelType.Add;
            if (!isAdd) {
                return `${this.processDescription ? nls.localize('tunnel.iconColumn.running', "Port has running process.") :
                    nls.localize('tunnel.iconColumn.notRunning', "No running process.")}`;
            }
            else {
                return this.label;
            }
        }
        get portTooltip() {
            const isAdd = this.tunnelType === remoteExplorerService_1.TunnelType.Add;
            if (!isAdd) {
                return `${this.name ? nls.localize('remote.tunnel.tooltipName', "Port labeled {0}. ", this.name) : ''}`;
            }
            else {
                return '';
            }
        }
        get processTooltip() {
            return this.processDescription ?? '';
        }
        get originTooltip() {
            return this.source.description;
        }
        get privacy() {
            if (this.tunnelService?.privacyOptions) {
                return this.tunnelService?.privacyOptions.find(element => element.id === this._privacy) ??
                    {
                        id: '',
                        themeIcon: codicons_1.Codicon.question.id,
                        label: nls.localize('tunnelPrivacy.unknown', "Unknown")
                    };
            }
            else {
                return {
                    id: tunnel_1.TunnelPrivacyId.Private,
                    themeIcon: remoteIcons_1.privatePortIcon.id,
                    label: nls.localize('tunnelPrivacy.private', "Private")
                };
            }
        }
    }
    const TunnelTypeContextKey = new contextkey_1.RawContextKey('tunnelType', remoteExplorerService_1.TunnelType.Add, true);
    const TunnelCloseableContextKey = new contextkey_1.RawContextKey('tunnelCloseable', false, true);
    const TunnelPrivacyContextKey = new contextkey_1.RawContextKey('tunnelPrivacy', undefined, true);
    const TunnelPrivacyEnabledContextKey = new contextkey_1.RawContextKey('tunnelPrivacyEnabled', false, true);
    const TunnelProtocolContextKey = new contextkey_1.RawContextKey('tunnelProtocol', tunnel_1.TunnelProtocol.Http, true);
    const TunnelViewFocusContextKey = new contextkey_1.RawContextKey('tunnelViewFocus', false, nls.localize('tunnel.focusContext', "Whether the Ports view has focus."));
    const TunnelViewSelectionKeyName = 'tunnelViewSelection';
    // host:port
    const TunnelViewSelectionContextKey = new contextkey_1.RawContextKey(TunnelViewSelectionKeyName, undefined, true);
    const TunnelViewMultiSelectionKeyName = 'tunnelViewMultiSelection';
    // host:port[]
    const TunnelViewMultiSelectionContextKey = new contextkey_1.RawContextKey(TunnelViewMultiSelectionKeyName, undefined, true);
    const PortChangableContextKey = new contextkey_1.RawContextKey('portChangable', false, true);
    let TunnelPanel = class TunnelPanel extends viewPane_1.ViewPane {
        static { TunnelPanel_1 = this; }
        static { this.ID = remoteExplorerService_1.TUNNEL_VIEW_ID; }
        static { this.TITLE = nls.localize('remote.tunnel', "Ports"); }
        constructor(viewModel, options, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, quickInputService, commandService, menuService, themeService, remoteExplorerService, telemetryService, tunnelService, contextViewService, hoverService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.viewModel = viewModel;
            this.quickInputService = quickInputService;
            this.commandService = commandService;
            this.menuService = menuService;
            this.remoteExplorerService = remoteExplorerService;
            this.tunnelService = tunnelService;
            this.contextViewService = contextViewService;
            this.hoverService = hoverService;
            this.tableDisposables = this._register(new lifecycle_1.DisposableStore());
            this.isEditing = false;
            this.titleActions = [];
            this.lastFocus = [];
            this.height = 0;
            this.width = 0;
            this.tunnelTypeContext = TunnelTypeContextKey.bindTo(contextKeyService);
            this.tunnelCloseableContext = TunnelCloseableContextKey.bindTo(contextKeyService);
            this.tunnelPrivacyContext = TunnelPrivacyContextKey.bindTo(contextKeyService);
            this.tunnelPrivacyEnabledContext = TunnelPrivacyEnabledContextKey.bindTo(contextKeyService);
            this.tunnelPrivacyEnabledContext.set(tunnelService.canChangePrivacy);
            this.tunnelProtocolContext = TunnelProtocolContextKey.bindTo(contextKeyService);
            this.tunnelViewFocusContext = TunnelViewFocusContextKey.bindTo(contextKeyService);
            this.tunnelViewSelectionContext = TunnelViewSelectionContextKey.bindTo(contextKeyService);
            this.tunnelViewMultiSelectionContext = TunnelViewMultiSelectionContextKey.bindTo(contextKeyService);
            this.portChangableContextKey = PortChangableContextKey.bindTo(contextKeyService);
            const overlayContextKeyService = this.contextKeyService.createOverlay([['view', TunnelPanel_1.ID]]);
            const titleMenu = this._register(this.menuService.createMenu(actions_2.MenuId.TunnelTitle, overlayContextKeyService));
            const updateActions = () => {
                this.titleActions = [];
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(titleMenu, undefined, this.titleActions);
                this.updateActions();
            };
            this._register(titleMenu.onDidChange(updateActions));
            updateActions();
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.titleActions = [];
            }));
            this.registerPrivacyActions();
            this._register(event_1.Event.once(this.tunnelService.onAddedTunnelProvider)(() => {
                if (this.tunnelPrivacyEnabledContext.get() === false) {
                    this.tunnelPrivacyEnabledContext.set(tunnelService.canChangePrivacy);
                    updateActions();
                    this.registerPrivacyActions();
                    this.createTable();
                    this.table.layout(this.height, this.width);
                }
            }));
        }
        registerPrivacyActions() {
            for (const privacyOption of this.tunnelService.privacyOptions) {
                const optionId = `remote.tunnel.privacy${privacyOption.id}`;
                commands_1.CommandsRegistry.registerCommand(optionId, ChangeTunnelPrivacyAction.handler(privacyOption.id));
                actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelPrivacy, ({
                    order: 0,
                    command: {
                        id: optionId,
                        title: privacyOption.label,
                        toggled: TunnelPrivacyContextKey.isEqualTo(privacyOption.id)
                    }
                }));
            }
        }
        get portCount() {
            return this.remoteExplorerService.tunnelModel.forwarded.size + this.remoteExplorerService.tunnelModel.detected.size;
        }
        createTable() {
            if (!this.panelContainer) {
                return;
            }
            this.tableDisposables.clear();
            dom.clearNode(this.panelContainer);
            const widgetContainer = dom.append(this.panelContainer, dom.$('.customview-tree'));
            widgetContainer.classList.add('ports-view');
            widgetContainer.classList.add('file-icon-themable-tree', 'show-file-icons');
            const actionBarRenderer = new ActionBarRenderer(this.instantiationService, this.contextKeyService, this.menuService, this.contextViewService, this.remoteExplorerService, this.commandService, this.configurationService, this.hoverService);
            const columns = [new IconColumn(), new PortColumn(), new LocalAddressColumn(), new RunningProcessColumn()];
            if (this.tunnelService.canChangePrivacy) {
                columns.push(new PrivacyColumn());
            }
            columns.push(new OriginColumn());
            this.table = this.instantiationService.createInstance(listService_1.WorkbenchTable, 'RemoteTunnels', widgetContainer, new TunnelTreeVirtualDelegate(this.remoteExplorerService), columns, [actionBarRenderer], {
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (item) => {
                        return item.label;
                    }
                },
                multipleSelectionSupport: true,
                accessibilityProvider: {
                    getAriaLabel: (item) => {
                        if (item instanceof TunnelItem) {
                            return `${item.tooltipPostfix} ${item.portTooltip} ${item.iconTooltip} ${item.processTooltip} ${item.originTooltip} ${this.tunnelService.canChangePrivacy ? item.privacy.label : ''}`;
                        }
                        else {
                            return item.label;
                        }
                    },
                    getWidgetAriaLabel: () => nls.localize('tunnelView', "Tunnel View")
                },
                openOnSingleClick: true
            });
            const actionRunner = new actions_1.ActionRunner();
            actionBarRenderer.actionRunner = actionRunner;
            this.tableDisposables.add(this.table);
            this.tableDisposables.add(this.table.onContextMenu(e => this.onContextMenu(e, actionRunner)));
            this.tableDisposables.add(this.table.onMouseDblClick(e => this.onMouseDblClick(e)));
            this.tableDisposables.add(this.table.onDidChangeFocus(e => this.onFocusChanged(e)));
            this.tableDisposables.add(this.table.onDidChangeSelection(e => this.onSelectionChanged(e)));
            this.tableDisposables.add(this.table.onDidFocus(() => this.tunnelViewFocusContext.set(true)));
            this.tableDisposables.add(this.table.onDidBlur(() => this.tunnelViewFocusContext.set(false)));
            const rerender = () => this.table.splice(0, Number.POSITIVE_INFINITY, this.viewModel.all);
            rerender();
            let lastPortCount = this.portCount;
            this.tableDisposables.add(event_1.Event.debounce(this.viewModel.onForwardedPortsChanged, (_last, e) => e, 50)(() => {
                const newPortCount = this.portCount;
                if (((lastPortCount === 0) || (newPortCount === 0)) && (lastPortCount !== newPortCount)) {
                    this._onDidChangeViewWelcomeState.fire();
                }
                lastPortCount = newPortCount;
                rerender();
            }));
            this.tableDisposables.add(this.table.onMouseClick(e => {
                if (this.hasOpenLinkModifier(e.browserEvent)) {
                    const selection = this.table.getSelectedElements();
                    if ((selection.length === 0) ||
                        ((selection.length === 1) && (selection[0] === e.element))) {
                        this.commandService.executeCommand(OpenPortInBrowserAction.ID, e.element);
                    }
                }
            }));
            this.tableDisposables.add(this.table.onDidOpen(e => {
                if (!e.element || (e.element.tunnelType !== remoteExplorerService_1.TunnelType.Forwarded)) {
                    return;
                }
                if (e.browserEvent?.type === 'dblclick') {
                    this.commandService.executeCommand(LabelTunnelAction.ID);
                }
            }));
            this.tableDisposables.add(this.remoteExplorerService.onDidChangeEditable(e => {
                this.isEditing = !!this.remoteExplorerService.getEditableData(e?.tunnel, e?.editId);
                this._onDidChangeViewWelcomeState.fire();
                if (!this.isEditing) {
                    widgetContainer.classList.remove('highlight');
                }
                rerender();
                if (this.isEditing) {
                    widgetContainer.classList.add('highlight');
                    if (!e) {
                        // When we are in editing mode for a new forward, rather than updating an existing one we need to reveal the input box since it might be out of view.
                        this.table.reveal(this.table.indexOf(this.viewModel.input));
                    }
                }
                else {
                    if (e && (e.tunnel.tunnelType !== remoteExplorerService_1.TunnelType.Add)) {
                        this.table.setFocus(this.lastFocus);
                    }
                    this.focus();
                }
            }));
        }
        renderBody(container) {
            super.renderBody(container);
            this.panelContainer = dom.append(container, dom.$('.tree-explorer-viewlet-tree-view'));
            this.createTable();
        }
        shouldShowWelcome() {
            return this.viewModel.isEmpty() && !this.isEditing;
        }
        focus() {
            super.focus();
            this.table.domFocus();
        }
        onFocusChanged(event) {
            if (event.indexes.length > 0 && event.elements.length > 0) {
                this.lastFocus = [...event.indexes];
            }
            const elements = event.elements;
            const item = elements && elements.length ? elements[0] : undefined;
            if (item) {
                this.tunnelViewSelectionContext.set((0, tunnelModel_1.makeAddress)(item.remoteHost, item.remotePort));
                this.tunnelTypeContext.set(item.tunnelType);
                this.tunnelCloseableContext.set(!!item.closeable);
                this.tunnelPrivacyContext.set(item.privacy.id);
                this.tunnelProtocolContext.set(item.protocol === tunnel_1.TunnelProtocol.Https ? tunnel_1.TunnelProtocol.Https : tunnel_1.TunnelProtocol.Https);
                this.portChangableContextKey.set(!!item.localPort);
            }
            else {
                this.tunnelTypeContext.reset();
                this.tunnelViewSelectionContext.reset();
                this.tunnelCloseableContext.reset();
                this.tunnelPrivacyContext.reset();
                this.tunnelProtocolContext.reset();
                this.portChangableContextKey.reset();
            }
        }
        hasOpenLinkModifier(e) {
            const editorConf = this.configurationService.getValue('editor');
            let modifierKey = false;
            if (editorConf.multiCursorModifier === 'ctrlCmd') {
                modifierKey = e.altKey;
            }
            else {
                if (platform_1.isMacintosh) {
                    modifierKey = e.metaKey;
                }
                else {
                    modifierKey = e.ctrlKey;
                }
            }
            return modifierKey;
        }
        onSelectionChanged(event) {
            const elements = event.elements;
            if (elements.length > 1) {
                this.tunnelViewMultiSelectionContext.set(elements.map(element => (0, tunnelModel_1.makeAddress)(element.remoteHost, element.remotePort)));
            }
            else {
                this.tunnelViewMultiSelectionContext.set(undefined);
            }
        }
        onContextMenu(event, actionRunner) {
            if ((event.element !== undefined) && !(event.element instanceof TunnelItem)) {
                return;
            }
            event.browserEvent.preventDefault();
            event.browserEvent.stopPropagation();
            const node = event.element;
            if (node) {
                this.table.setFocus([this.table.indexOf(node)]);
                this.tunnelTypeContext.set(node.tunnelType);
                this.tunnelCloseableContext.set(!!node.closeable);
                this.tunnelPrivacyContext.set(node.privacy.id);
                this.tunnelProtocolContext.set(node.protocol);
                this.portChangableContextKey.set(!!node.localPort);
            }
            else {
                this.tunnelTypeContext.set(remoteExplorerService_1.TunnelType.Add);
                this.tunnelCloseableContext.set(false);
                this.tunnelPrivacyContext.set(undefined);
                this.tunnelProtocolContext.set(undefined);
                this.portChangableContextKey.set(false);
            }
            this.contextMenuService.showContextMenu({
                menuId: actions_2.MenuId.TunnelContext,
                menuActionOptions: { shouldForwardArgs: true },
                contextKeyService: this.table.contextKeyService,
                getAnchor: () => event.anchor,
                getActionViewItem: (action) => {
                    const keybinding = this.keybindingService.lookupKeybinding(action.id);
                    if (keybinding) {
                        return new actionViewItems_1.ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
                    }
                    return undefined;
                },
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.table.domFocus();
                    }
                },
                getActionsContext: () => node?.strip(),
                actionRunner
            });
        }
        onMouseDblClick(e) {
            if (!e.element) {
                this.commandService.executeCommand(ForwardPortAction.INLINE_ID);
            }
        }
        layoutBody(height, width) {
            this.height = height;
            this.width = width;
            super.layoutBody(height, width);
            this.table.layout(height, width);
        }
    };
    exports.TunnelPanel = TunnelPanel;
    exports.TunnelPanel = TunnelPanel = TunnelPanel_1 = __decorate([
        __param(2, keybinding_1.IKeybindingService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, views_1.IViewDescriptorService),
        __param(8, opener_1.IOpenerService),
        __param(9, quickInput_1.IQuickInputService),
        __param(10, commands_1.ICommandService),
        __param(11, actions_2.IMenuService),
        __param(12, themeService_1.IThemeService),
        __param(13, remoteExplorerService_1.IRemoteExplorerService),
        __param(14, telemetry_1.ITelemetryService),
        __param(15, tunnel_1.ITunnelService),
        __param(16, contextView_1.IContextViewService),
        __param(17, hover_1.IHoverService)
    ], TunnelPanel);
    class TunnelPanelDescriptor {
        constructor(viewModel, environmentService) {
            this.id = TunnelPanel.ID;
            this.name = TunnelPanel.TITLE;
            this.canToggleVisibility = true;
            this.hideByDefault = false;
            // group is not actually used for views that are not extension contributed. Use order instead.
            this.group = 'details@0';
            // -500 comes from the remote explorer viewOrderDelegate
            this.order = -500;
            this.canMoveView = true;
            this.containerIcon = remoteIcons_1.portsViewIcon;
            this.ctorDescriptor = new descriptors_1.SyncDescriptor(TunnelPanel, [viewModel]);
            this.remoteAuthority = environmentService.remoteAuthority ? environmentService.remoteAuthority.split('+')[0] : undefined;
        }
    }
    exports.TunnelPanelDescriptor = TunnelPanelDescriptor;
    function isITunnelItem(item) {
        return item && item.tunnelType && item.remoteHost && item.source;
    }
    var LabelTunnelAction;
    (function (LabelTunnelAction) {
        LabelTunnelAction.ID = 'remote.tunnel.label';
        LabelTunnelAction.LABEL = nls.localize('remote.tunnel.label', "Set Port Label");
        LabelTunnelAction.COMMAND_ID_KEYWORD = 'label';
        function handler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                let tunnelContext;
                if (isITunnelItem(arg)) {
                    tunnelContext = arg;
                }
                else {
                    const context = accessor.get(contextkey_1.IContextKeyService).getContextKeyValue(TunnelViewSelectionKeyName);
                    const tunnel = context ? remoteExplorerService.tunnelModel.forwarded.get(context) : undefined;
                    if (tunnel) {
                        const tunnelService = accessor.get(tunnel_1.ITunnelService);
                        tunnelContext = TunnelItem.createFromTunnel(remoteExplorerService, tunnelService, tunnel);
                    }
                }
                if (tunnelContext) {
                    const tunnelItem = tunnelContext;
                    return new Promise(resolve => {
                        const startingValue = tunnelItem.name ? tunnelItem.name : `${tunnelItem.remotePort}`;
                        remoteExplorerService.setEditable(tunnelItem, remoteExplorerService_1.TunnelEditId.Label, {
                            onFinish: async (value, success) => {
                                value = value.trim();
                                remoteExplorerService.setEditable(tunnelItem, remoteExplorerService_1.TunnelEditId.Label, null);
                                const changed = success && (value !== startingValue);
                                if (changed) {
                                    await remoteExplorerService.tunnelModel.name(tunnelItem.remoteHost, tunnelItem.remotePort, value);
                                }
                                resolve(changed ? { port: tunnelItem.remotePort, label: value } : undefined);
                            },
                            validationMessage: () => null,
                            placeholder: nls.localize('remote.tunnelsView.labelPlaceholder', "Port label"),
                            startingValue
                        });
                    });
                }
                return undefined;
            };
        }
        LabelTunnelAction.handler = handler;
    })(LabelTunnelAction || (LabelTunnelAction = {}));
    const invalidPortString = nls.localize('remote.tunnelsView.portNumberValid', "Forwarded port should be a number or a host:port.");
    const maxPortNumber = 65536;
    const invalidPortNumberString = nls.localize('remote.tunnelsView.portNumberToHigh', "Port number must be \u2265 0 and < {0}.", maxPortNumber);
    const requiresSudoString = nls.localize('remote.tunnelView.inlineElevationMessage', "May Require Sudo");
    const alreadyForwarded = nls.localize('remote.tunnelView.alreadyForwarded', "Port is already forwarded");
    var ForwardPortAction;
    (function (ForwardPortAction) {
        ForwardPortAction.INLINE_ID = 'remote.tunnel.forwardInline';
        ForwardPortAction.COMMANDPALETTE_ID = 'remote.tunnel.forwardCommandPalette';
        ForwardPortAction.LABEL = { value: nls.localize('remote.tunnel.forward', "Forward a Port"), original: 'Forward a Port' };
        ForwardPortAction.TREEITEM_LABEL = nls.localize('remote.tunnel.forwardItem', "Forward Port");
        const forwardPrompt = nls.localize('remote.tunnel.forwardPrompt', "Port number or address (eg. 3000 or 10.10.10.10:2000).");
        function validateInput(remoteExplorerService, tunnelService, value, canElevate) {
            const parsed = (0, tunnelModel_1.parseAddress)(value);
            if (!parsed) {
                return { content: invalidPortString, severity: notification_1.Severity.Error };
            }
            else if (parsed.port >= maxPortNumber) {
                return { content: invalidPortNumberString, severity: notification_1.Severity.Error };
            }
            else if (canElevate && tunnelService.isPortPrivileged(parsed.port)) {
                return { content: requiresSudoString, severity: notification_1.Severity.Info };
            }
            else if ((0, tunnelModel_1.mapHasAddressLocalhostOrAllInterfaces)(remoteExplorerService.tunnelModel.forwarded, parsed.host, parsed.port)) {
                return { content: alreadyForwarded, severity: notification_1.Severity.Error };
            }
            return null;
        }
        function error(notificationService, tunnelOrError, host, port) {
            if (!tunnelOrError) {
                notificationService.warn(nls.localize('remote.tunnel.forwardError', "Unable to forward {0}:{1}. The host may not be available or that remote port may already be forwarded", host, port));
            }
            else if (typeof tunnelOrError === 'string') {
                notificationService.warn(nls.localize('remote.tunnel.forwardErrorProvided', "Unable to forward {0}:{1}. {2}", host, port, tunnelOrError));
            }
        }
        function inlineHandler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const tunnelService = accessor.get(tunnel_1.ITunnelService);
                remoteExplorerService.setEditable(undefined, remoteExplorerService_1.TunnelEditId.New, {
                    onFinish: async (value, success) => {
                        remoteExplorerService.setEditable(undefined, remoteExplorerService_1.TunnelEditId.New, null);
                        let parsed;
                        if (success && (parsed = (0, tunnelModel_1.parseAddress)(value))) {
                            remoteExplorerService.forward({
                                remote: { host: parsed.host, port: parsed.port },
                                elevateIfNeeded: true
                            }).then(tunnelOrError => error(notificationService, tunnelOrError, parsed.host, parsed.port));
                        }
                    },
                    validationMessage: (value) => validateInput(remoteExplorerService, tunnelService, value, tunnelService.canElevate),
                    placeholder: forwardPrompt
                });
            };
        }
        ForwardPortAction.inlineHandler = inlineHandler;
        function commandPaletteHandler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const viewsService = accessor.get(views_1.IViewsService);
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const tunnelService = accessor.get(tunnel_1.ITunnelService);
                await viewsService.openView(TunnelPanel.ID, true);
                const value = await quickInputService.input({
                    prompt: forwardPrompt,
                    validateInput: (value) => Promise.resolve(validateInput(remoteExplorerService, tunnelService, value, tunnelService.canElevate))
                });
                let parsed;
                if (value && (parsed = (0, tunnelModel_1.parseAddress)(value))) {
                    remoteExplorerService.forward({
                        remote: { host: parsed.host, port: parsed.port },
                        elevateIfNeeded: true
                    }).then(tunnel => error(notificationService, tunnel, parsed.host, parsed.port));
                }
            };
        }
        ForwardPortAction.commandPaletteHandler = commandPaletteHandler;
    })(ForwardPortAction || (exports.ForwardPortAction = ForwardPortAction = {}));
    function makeTunnelPicks(tunnels, remoteExplorerService, tunnelService) {
        const picks = tunnels.map(forwarded => {
            const item = TunnelItem.createFromTunnel(remoteExplorerService, tunnelService, forwarded);
            return {
                label: item.label,
                description: item.processDescription,
                tunnel: item
            };
        });
        if (picks.length === 0) {
            picks.push({
                label: nls.localize('remote.tunnel.closeNoPorts', "No ports currently forwarded. Try running the {0} command", ForwardPortAction.LABEL.value)
            });
        }
        return picks;
    }
    var ClosePortAction;
    (function (ClosePortAction) {
        ClosePortAction.INLINE_ID = 'remote.tunnel.closeInline';
        ClosePortAction.COMMANDPALETTE_ID = 'remote.tunnel.closeCommandPalette';
        ClosePortAction.LABEL = { value: nls.localize('remote.tunnel.close', "Stop Forwarding Port"), original: 'Stop Forwarding Port' };
        function inlineHandler() {
            return async (accessor, arg) => {
                const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                let ports = [];
                const multiSelectContext = contextKeyService.getContextKeyValue(TunnelViewMultiSelectionKeyName);
                if (multiSelectContext) {
                    multiSelectContext.forEach(context => {
                        const tunnel = remoteExplorerService.tunnelModel.forwarded.get(context);
                        if (tunnel) {
                            ports?.push(tunnel);
                        }
                    });
                }
                else if (isITunnelItem(arg)) {
                    ports = [arg];
                }
                else {
                    const context = contextKeyService.getContextKeyValue(TunnelViewSelectionKeyName);
                    const tunnel = context ? remoteExplorerService.tunnelModel.forwarded.get(context) : undefined;
                    if (tunnel) {
                        ports = [tunnel];
                    }
                }
                if (!ports || ports.length === 0) {
                    return;
                }
                return Promise.all(ports.map(port => remoteExplorerService.close({ host: port.remoteHost, port: port.remotePort }, tunnelModel_1.TunnelCloseReason.User)));
            };
        }
        ClosePortAction.inlineHandler = inlineHandler;
        function commandPaletteHandler() {
            return async (accessor) => {
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const tunnelService = accessor.get(tunnel_1.ITunnelService);
                const commandService = accessor.get(commands_1.ICommandService);
                const picks = makeTunnelPicks(Array.from(remoteExplorerService.tunnelModel.forwarded.values()).filter(tunnel => tunnel.closeable), remoteExplorerService, tunnelService);
                const result = await quickInputService.pick(picks, { placeHolder: nls.localize('remote.tunnel.closePlaceholder', "Choose a port to stop forwarding") });
                if (result && result.tunnel) {
                    await remoteExplorerService.close({ host: result.tunnel.remoteHost, port: result.tunnel.remotePort }, tunnelModel_1.TunnelCloseReason.User);
                }
                else if (result) {
                    await commandService.executeCommand(ForwardPortAction.COMMANDPALETTE_ID);
                }
            };
        }
        ClosePortAction.commandPaletteHandler = commandPaletteHandler;
    })(ClosePortAction || (ClosePortAction = {}));
    var OpenPortInBrowserAction;
    (function (OpenPortInBrowserAction) {
        OpenPortInBrowserAction.ID = 'remote.tunnel.open';
        OpenPortInBrowserAction.LABEL = nls.localize('remote.tunnel.open', "Open in Browser");
        function handler() {
            return async (accessor, arg) => {
                let key;
                if (isITunnelItem(arg)) {
                    key = (0, tunnelModel_1.makeAddress)(arg.remoteHost, arg.remotePort);
                }
                else if (arg.tunnelRemoteHost && arg.tunnelRemotePort) {
                    key = (0, tunnelModel_1.makeAddress)(arg.tunnelRemoteHost, arg.tunnelRemotePort);
                }
                if (key) {
                    const model = accessor.get(remoteExplorerService_1.IRemoteExplorerService).tunnelModel;
                    const openerService = accessor.get(opener_1.IOpenerService);
                    return run(model, openerService, key);
                }
            };
        }
        OpenPortInBrowserAction.handler = handler;
        function run(model, openerService, key) {
            const tunnel = model.forwarded.get(key) || model.detected.get(key);
            if (tunnel) {
                return openerService.open(tunnel.localUri, { allowContributedOpeners: false });
            }
            return Promise.resolve();
        }
        OpenPortInBrowserAction.run = run;
    })(OpenPortInBrowserAction || (exports.OpenPortInBrowserAction = OpenPortInBrowserAction = {}));
    var OpenPortInPreviewAction;
    (function (OpenPortInPreviewAction) {
        OpenPortInPreviewAction.ID = 'remote.tunnel.openPreview';
        OpenPortInPreviewAction.LABEL = nls.localize('remote.tunnel.openPreview', "Preview in Editor");
        function handler() {
            return async (accessor, arg) => {
                let key;
                if (isITunnelItem(arg)) {
                    key = (0, tunnelModel_1.makeAddress)(arg.remoteHost, arg.remotePort);
                }
                else if (arg.tunnelRemoteHost && arg.tunnelRemotePort) {
                    key = (0, tunnelModel_1.makeAddress)(arg.tunnelRemoteHost, arg.tunnelRemotePort);
                }
                if (key) {
                    const model = accessor.get(remoteExplorerService_1.IRemoteExplorerService).tunnelModel;
                    const openerService = accessor.get(opener_1.IOpenerService);
                    const externalOpenerService = accessor.get(externalUriOpenerService_1.IExternalUriOpenerService);
                    return run(model, openerService, externalOpenerService, key);
                }
            };
        }
        OpenPortInPreviewAction.handler = handler;
        async function run(model, openerService, externalOpenerService, key) {
            const tunnel = model.forwarded.get(key) || model.detected.get(key);
            if (tunnel) {
                const remoteHost = tunnel.remoteHost.includes(':') ? `[${tunnel.remoteHost}]` : tunnel.remoteHost;
                const sourceUri = uri_1.URI.parse(`http://${remoteHost}:${tunnel.remotePort}`);
                const opener = await externalOpenerService.getOpener(tunnel.localUri, { sourceUri }, new cancellation_1.CancellationTokenSource().token);
                if (opener) {
                    return opener.openExternalUri(tunnel.localUri, { sourceUri }, new cancellation_1.CancellationTokenSource().token);
                }
                return openerService.open(tunnel.localUri);
            }
            return Promise.resolve();
        }
        OpenPortInPreviewAction.run = run;
    })(OpenPortInPreviewAction || (exports.OpenPortInPreviewAction = OpenPortInPreviewAction = {}));
    var OpenPortInBrowserCommandPaletteAction;
    (function (OpenPortInBrowserCommandPaletteAction) {
        OpenPortInBrowserCommandPaletteAction.ID = 'remote.tunnel.openCommandPalette';
        OpenPortInBrowserCommandPaletteAction.LABEL = nls.localize('remote.tunnel.openCommandPalette', "Open Port in Browser");
        function handler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const tunnelService = accessor.get(tunnel_1.ITunnelService);
                const model = remoteExplorerService.tunnelModel;
                const quickPickService = accessor.get(quickInput_1.IQuickInputService);
                const openerService = accessor.get(opener_1.IOpenerService);
                const commandService = accessor.get(commands_1.ICommandService);
                const options = [...model.forwarded, ...model.detected].map(value => {
                    const tunnelItem = TunnelItem.createFromTunnel(remoteExplorerService, tunnelService, value[1]);
                    return {
                        label: tunnelItem.label,
                        description: tunnelItem.processDescription,
                        tunnel: tunnelItem
                    };
                });
                if (options.length === 0) {
                    options.push({
                        label: nls.localize('remote.tunnel.openCommandPaletteNone', "No ports currently forwarded. Open the Ports view to get started.")
                    });
                }
                else {
                    options.push({
                        label: nls.localize('remote.tunnel.openCommandPaletteView', "Open the Ports view...")
                    });
                }
                const picked = await quickPickService.pick(options, { placeHolder: nls.localize('remote.tunnel.openCommandPalettePick', "Choose the port to open") });
                if (picked && picked.tunnel) {
                    return OpenPortInBrowserAction.run(model, openerService, (0, tunnelModel_1.makeAddress)(picked.tunnel.remoteHost, picked.tunnel.remotePort));
                }
                else if (picked) {
                    return commandService.executeCommand(`${remoteExplorerService_1.TUNNEL_VIEW_ID}.focus`);
                }
            };
        }
        OpenPortInBrowserCommandPaletteAction.handler = handler;
    })(OpenPortInBrowserCommandPaletteAction || (OpenPortInBrowserCommandPaletteAction = {}));
    var CopyAddressAction;
    (function (CopyAddressAction) {
        CopyAddressAction.INLINE_ID = 'remote.tunnel.copyAddressInline';
        CopyAddressAction.COMMANDPALETTE_ID = 'remote.tunnel.copyAddressCommandPalette';
        CopyAddressAction.INLINE_LABEL = nls.localize('remote.tunnel.copyAddressInline', "Copy Local Address");
        CopyAddressAction.COMMANDPALETTE_LABEL = nls.localize('remote.tunnel.copyAddressCommandPalette', "Copy Forwarded Port Address");
        async function copyAddress(remoteExplorerService, clipboardService, tunnelItem) {
            const address = remoteExplorerService.tunnelModel.address(tunnelItem.remoteHost, tunnelItem.remotePort);
            if (address) {
                await clipboardService.writeText(address.toString());
            }
        }
        function inlineHandler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                let tunnelItem;
                if (isITunnelItem(arg)) {
                    tunnelItem = arg;
                }
                else {
                    const context = accessor.get(contextkey_1.IContextKeyService).getContextKeyValue(TunnelViewSelectionKeyName);
                    tunnelItem = context ? remoteExplorerService.tunnelModel.forwarded.get(context) : undefined;
                }
                if (tunnelItem) {
                    return copyAddress(remoteExplorerService, accessor.get(clipboardService_1.IClipboardService), tunnelItem);
                }
            };
        }
        CopyAddressAction.inlineHandler = inlineHandler;
        function commandPaletteHandler() {
            return async (accessor, arg) => {
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const tunnelService = accessor.get(tunnel_1.ITunnelService);
                const commandService = accessor.get(commands_1.ICommandService);
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                const tunnels = Array.from(remoteExplorerService.tunnelModel.forwarded.values()).concat(Array.from(remoteExplorerService.tunnelModel.detected.values()));
                const result = await quickInputService.pick(makeTunnelPicks(tunnels, remoteExplorerService, tunnelService), { placeHolder: nls.localize('remote.tunnel.copyAddressPlaceholdter', "Choose a forwarded port") });
                if (result && result.tunnel) {
                    await copyAddress(remoteExplorerService, clipboardService, result.tunnel);
                }
                else if (result) {
                    await commandService.executeCommand(ForwardPortAction.COMMANDPALETTE_ID);
                }
            };
        }
        CopyAddressAction.commandPaletteHandler = commandPaletteHandler;
    })(CopyAddressAction || (CopyAddressAction = {}));
    var ChangeLocalPortAction;
    (function (ChangeLocalPortAction) {
        ChangeLocalPortAction.ID = 'remote.tunnel.changeLocalPort';
        ChangeLocalPortAction.LABEL = nls.localize('remote.tunnel.changeLocalPort', "Change Local Address Port");
        function validateInput(tunnelService, value, canElevate) {
            if (!value.match(/^[0-9]+$/)) {
                return { content: nls.localize('remote.tunnelsView.portShouldBeNumber', "Local port should be a number."), severity: notification_1.Severity.Error };
            }
            else if (Number(value) >= maxPortNumber) {
                return { content: invalidPortNumberString, severity: notification_1.Severity.Error };
            }
            else if (canElevate && tunnelService.isPortPrivileged(Number(value))) {
                return { content: requiresSudoString, severity: notification_1.Severity.Info };
            }
            return null;
        }
        function handler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const tunnelService = accessor.get(tunnel_1.ITunnelService);
                let tunnelContext;
                if (isITunnelItem(arg)) {
                    tunnelContext = arg;
                }
                else {
                    const context = accessor.get(contextkey_1.IContextKeyService).getContextKeyValue(TunnelViewSelectionKeyName);
                    const tunnel = context ? remoteExplorerService.tunnelModel.forwarded.get(context) : undefined;
                    if (tunnel) {
                        const tunnelService = accessor.get(tunnel_1.ITunnelService);
                        tunnelContext = TunnelItem.createFromTunnel(remoteExplorerService, tunnelService, tunnel);
                    }
                }
                if (tunnelContext) {
                    const tunnelItem = tunnelContext;
                    remoteExplorerService.setEditable(tunnelItem, remoteExplorerService_1.TunnelEditId.LocalPort, {
                        onFinish: async (value, success) => {
                            remoteExplorerService.setEditable(tunnelItem, remoteExplorerService_1.TunnelEditId.LocalPort, null);
                            if (success) {
                                await remoteExplorerService.close({ host: tunnelItem.remoteHost, port: tunnelItem.remotePort }, tunnelModel_1.TunnelCloseReason.Other);
                                const numberValue = Number(value);
                                const newForward = await remoteExplorerService.forward({
                                    remote: { host: tunnelItem.remoteHost, port: tunnelItem.remotePort },
                                    local: numberValue,
                                    name: tunnelItem.name,
                                    elevateIfNeeded: true,
                                    source: tunnelItem.source
                                });
                                if (newForward && (typeof newForward !== 'string') && newForward.tunnelLocalPort !== numberValue) {
                                    notificationService.warn(nls.localize('remote.tunnel.changeLocalPortNumber', "The local port {0} is not available. Port number {1} has been used instead", value, newForward.tunnelLocalPort ?? newForward.localAddress));
                                }
                            }
                        },
                        validationMessage: (value) => validateInput(tunnelService, value, tunnelService.canElevate),
                        placeholder: nls.localize('remote.tunnelsView.changePort', "New local port")
                    });
                }
            };
        }
        ChangeLocalPortAction.handler = handler;
    })(ChangeLocalPortAction || (ChangeLocalPortAction = {}));
    var ChangeTunnelPrivacyAction;
    (function (ChangeTunnelPrivacyAction) {
        function handler(privacyId) {
            return async (accessor, arg) => {
                if (isITunnelItem(arg)) {
                    const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                    await remoteExplorerService.close({ host: arg.remoteHost, port: arg.remotePort }, tunnelModel_1.TunnelCloseReason.Other);
                    return remoteExplorerService.forward({
                        remote: { host: arg.remoteHost, port: arg.remotePort },
                        local: arg.localPort,
                        name: arg.name,
                        elevateIfNeeded: true,
                        privacy: privacyId,
                        source: arg.source
                    });
                }
                return undefined;
            };
        }
        ChangeTunnelPrivacyAction.handler = handler;
    })(ChangeTunnelPrivacyAction || (ChangeTunnelPrivacyAction = {}));
    var SetTunnelProtocolAction;
    (function (SetTunnelProtocolAction) {
        SetTunnelProtocolAction.ID_HTTP = 'remote.tunnel.setProtocolHttp';
        SetTunnelProtocolAction.ID_HTTPS = 'remote.tunnel.setProtocolHttps';
        SetTunnelProtocolAction.LABEL_HTTP = nls.localize('remote.tunnel.protocolHttp', "HTTP");
        SetTunnelProtocolAction.LABEL_HTTPS = nls.localize('remote.tunnel.protocolHttps', "HTTPS");
        async function handler(arg, protocol, remoteExplorerService) {
            if (isITunnelItem(arg)) {
                const attributes = {
                    protocol
                };
                return remoteExplorerService.tunnelModel.configPortsAttributes.addAttributes(arg.remotePort, attributes, 4 /* ConfigurationTarget.USER_REMOTE */);
            }
        }
        function handlerHttp() {
            return async (accessor, arg) => {
                return handler(arg, tunnel_1.TunnelProtocol.Http, accessor.get(remoteExplorerService_1.IRemoteExplorerService));
            };
        }
        SetTunnelProtocolAction.handlerHttp = handlerHttp;
        function handlerHttps() {
            return async (accessor, arg) => {
                return handler(arg, tunnel_1.TunnelProtocol.Https, accessor.get(remoteExplorerService_1.IRemoteExplorerService));
            };
        }
        SetTunnelProtocolAction.handlerHttps = handlerHttps;
    })(SetTunnelProtocolAction || (SetTunnelProtocolAction = {}));
    const tunnelViewCommandsWeightBonus = 10; // give our commands a little bit more weight over other default list/tree commands
    const isForwardedExpr = TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Forwarded);
    const isForwardedOrDetectedExpr = contextkey_1.ContextKeyExpr.or(isForwardedExpr, TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Detected));
    const isNotMultiSelectionExpr = TunnelViewMultiSelectionContextKey.isEqualTo(undefined);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: LabelTunnelAction.ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + tunnelViewCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(TunnelViewFocusContextKey, isForwardedExpr, isNotMultiSelectionExpr),
        primary: 60 /* KeyCode.F2 */,
        mac: {
            primary: 3 /* KeyCode.Enter */
        },
        handler: LabelTunnelAction.handler()
    });
    commands_1.CommandsRegistry.registerCommand(ForwardPortAction.INLINE_ID, ForwardPortAction.inlineHandler());
    commands_1.CommandsRegistry.registerCommand(ForwardPortAction.COMMANDPALETTE_ID, ForwardPortAction.commandPaletteHandler());
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: ClosePortAction.INLINE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + tunnelViewCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(TunnelCloseableContextKey, TunnelViewFocusContextKey),
        primary: 20 /* KeyCode.Delete */,
        mac: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
            secondary: [20 /* KeyCode.Delete */]
        },
        handler: ClosePortAction.inlineHandler()
    });
    commands_1.CommandsRegistry.registerCommand(ClosePortAction.COMMANDPALETTE_ID, ClosePortAction.commandPaletteHandler());
    commands_1.CommandsRegistry.registerCommand(OpenPortInBrowserAction.ID, OpenPortInBrowserAction.handler());
    commands_1.CommandsRegistry.registerCommand(OpenPortInPreviewAction.ID, OpenPortInPreviewAction.handler());
    commands_1.CommandsRegistry.registerCommand(OpenPortInBrowserCommandPaletteAction.ID, OpenPortInBrowserCommandPaletteAction.handler());
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CopyAddressAction.INLINE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + tunnelViewCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(TunnelViewFocusContextKey, isForwardedOrDetectedExpr, isNotMultiSelectionExpr),
        primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
        handler: CopyAddressAction.inlineHandler()
    });
    commands_1.CommandsRegistry.registerCommand(CopyAddressAction.COMMANDPALETTE_ID, CopyAddressAction.commandPaletteHandler());
    commands_1.CommandsRegistry.registerCommand(ChangeLocalPortAction.ID, ChangeLocalPortAction.handler());
    commands_1.CommandsRegistry.registerCommand(SetTunnelProtocolAction.ID_HTTP, SetTunnelProtocolAction.handlerHttp());
    commands_1.CommandsRegistry.registerCommand(SetTunnelProtocolAction.ID_HTTPS, SetTunnelProtocolAction.handlerHttps());
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, ({
        command: {
            id: ClosePortAction.COMMANDPALETTE_ID,
            title: ClosePortAction.LABEL
        },
        when: tunnelModel_1.forwardedPortsViewEnabled
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, ({
        command: {
            id: ForwardPortAction.COMMANDPALETTE_ID,
            title: ForwardPortAction.LABEL
        },
        when: tunnelModel_1.forwardedPortsViewEnabled
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, ({
        command: {
            id: CopyAddressAction.COMMANDPALETTE_ID,
            title: CopyAddressAction.COMMANDPALETTE_LABEL
        },
        when: tunnelModel_1.forwardedPortsViewEnabled
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, ({
        command: {
            id: OpenPortInBrowserCommandPaletteAction.ID,
            title: OpenPortInBrowserCommandPaletteAction.LABEL
        },
        when: tunnelModel_1.forwardedPortsViewEnabled
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '._open',
        order: 0,
        command: {
            id: OpenPortInBrowserAction.ID,
            title: OpenPortInBrowserAction.LABEL,
        },
        when: contextkey_1.ContextKeyExpr.and(isForwardedOrDetectedExpr, isNotMultiSelectionExpr)
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '._open',
        order: 1,
        command: {
            id: OpenPortInPreviewAction.ID,
            title: OpenPortInPreviewAction.LABEL,
        },
        when: contextkey_1.ContextKeyExpr.and(isForwardedOrDetectedExpr, isNotMultiSelectionExpr)
    }));
    // The group 0_manage is used by extensions, so try not to change it
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '0_manage',
        order: 1,
        command: {
            id: LabelTunnelAction.ID,
            title: LabelTunnelAction.LABEL,
            icon: remoteIcons_1.labelPortIcon
        },
        when: contextkey_1.ContextKeyExpr.and(isForwardedExpr, isNotMultiSelectionExpr)
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '2_localaddress',
        order: 0,
        command: {
            id: CopyAddressAction.INLINE_ID,
            title: CopyAddressAction.INLINE_LABEL,
        },
        when: contextkey_1.ContextKeyExpr.and(isForwardedOrDetectedExpr, isNotMultiSelectionExpr)
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '2_localaddress',
        order: 1,
        command: {
            id: ChangeLocalPortAction.ID,
            title: ChangeLocalPortAction.LABEL,
        },
        when: contextkey_1.ContextKeyExpr.and(isForwardedExpr, PortChangableContextKey, isNotMultiSelectionExpr)
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '2_localaddress',
        order: 2,
        submenu: actions_2.MenuId.TunnelPrivacy,
        title: nls.localize('tunnelContext.privacyMenu', "Port Visibility"),
        when: contextkey_1.ContextKeyExpr.and(isForwardedExpr, TunnelPrivacyEnabledContextKey)
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '2_localaddress',
        order: 3,
        submenu: actions_2.MenuId.TunnelProtocol,
        title: nls.localize('tunnelContext.protocolMenu', "Change Port Protocol"),
        when: contextkey_1.ContextKeyExpr.and(isForwardedExpr, isNotMultiSelectionExpr)
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '3_forward',
        order: 0,
        command: {
            id: ClosePortAction.INLINE_ID,
            title: ClosePortAction.LABEL,
        },
        when: TunnelCloseableContextKey
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '3_forward',
        order: 1,
        command: {
            id: ForwardPortAction.INLINE_ID,
            title: ForwardPortAction.LABEL,
        },
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelProtocol, ({
        order: 0,
        command: {
            id: SetTunnelProtocolAction.ID_HTTP,
            title: SetTunnelProtocolAction.LABEL_HTTP,
            toggled: TunnelProtocolContextKey.isEqualTo(tunnel_1.TunnelProtocol.Http)
        }
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelProtocol, ({
        order: 1,
        command: {
            id: SetTunnelProtocolAction.ID_HTTPS,
            title: SetTunnelProtocolAction.LABEL_HTTPS,
            toggled: TunnelProtocolContextKey.isEqualTo(tunnel_1.TunnelProtocol.Https)
        }
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelPortInline, ({
        group: '0_manage',
        order: 0,
        command: {
            id: ForwardPortAction.INLINE_ID,
            title: ForwardPortAction.TREEITEM_LABEL,
            icon: remoteIcons_1.forwardPortIcon
        },
        when: TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Candidate)
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelPortInline, ({
        group: '0_manage',
        order: 4,
        command: {
            id: LabelTunnelAction.ID,
            title: LabelTunnelAction.LABEL,
            icon: remoteIcons_1.labelPortIcon
        },
        when: isForwardedExpr
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelPortInline, ({
        group: '0_manage',
        order: 5,
        command: {
            id: ClosePortAction.INLINE_ID,
            title: ClosePortAction.LABEL,
            icon: remoteIcons_1.stopForwardIcon
        },
        when: TunnelCloseableContextKey
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelLocalAddressInline, ({
        order: -1,
        command: {
            id: CopyAddressAction.INLINE_ID,
            title: CopyAddressAction.INLINE_LABEL,
            icon: remoteIcons_1.copyAddressIcon
        },
        when: isForwardedOrDetectedExpr
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelLocalAddressInline, ({
        order: 0,
        command: {
            id: OpenPortInBrowserAction.ID,
            title: OpenPortInBrowserAction.LABEL,
            icon: remoteIcons_1.openBrowserIcon
        },
        when: isForwardedOrDetectedExpr
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelLocalAddressInline, ({
        order: 1,
        command: {
            id: OpenPortInPreviewAction.ID,
            title: OpenPortInPreviewAction.LABEL,
            icon: remoteIcons_1.openPreviewIcon
        },
        when: isForwardedOrDetectedExpr
    }));
    (0, colorRegistry_1.registerColor)('ports.iconRunningProcessForeground', {
        light: theme_1.STATUS_BAR_REMOTE_ITEM_BACKGROUND,
        dark: theme_1.STATUS_BAR_REMOTE_ITEM_BACKGROUND,
        hcDark: theme_1.STATUS_BAR_REMOTE_ITEM_BACKGROUND,
        hcLight: theme_1.STATUS_BAR_REMOTE_ITEM_BACKGROUND
    }, nls.localize('portWithRunningProcess.foreground', "The color of the icon for a port that has an associated running process."));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVubmVsVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3JlbW90ZS9icm93c2VyL3R1bm5lbFZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXdEbkYsUUFBQSx5QkFBeUIsR0FBRyxJQUFJLDBCQUFhLENBQVUsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFakcsTUFBTSx5QkFBeUI7UUFJOUIsWUFBNkIscUJBQTZDO1lBQTdDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFGakUsb0JBQWUsR0FBVyxFQUFFLENBQUM7UUFFd0MsQ0FBQztRQUUvRSxTQUFTLENBQUMsR0FBZ0I7WUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEtBQUssa0NBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2hILENBQUM7S0FDRDtJQVNNLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWU7UUE4QjNCLFlBQ3lCLHFCQUE4RCxFQUN0RSxhQUE4QztZQURyQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQ3JELGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQTVCdkQsZ0JBQVcsR0FBK0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUVuRCxVQUFLLEdBQUc7Z0JBQ2hCLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDRCQUE0QixFQUFFLFVBQVUsQ0FBQztnQkFDN0QsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsVUFBVSxFQUFFLGtDQUFVLENBQUMsR0FBRztnQkFDMUIsaUJBQWlCLEVBQUUsS0FBSztnQkFDeEIsVUFBVSxFQUFFLEVBQUU7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