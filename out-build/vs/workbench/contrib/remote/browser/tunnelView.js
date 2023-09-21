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
define(["require", "exports", "vs/nls!vs/workbench/contrib/remote/browser/tunnelView", "vs/base/browser/dom", "vs/workbench/common/views", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/commands/common/commands", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/actions", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/workbench/services/remote/common/remoteExplorerService", "vs/platform/clipboard/common/clipboardService", "vs/platform/notification/common/notification", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/functional", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/browser/parts/views/viewPane", "vs/base/common/uri", "vs/platform/tunnel/common/tunnel", "vs/platform/instantiation/common/descriptors", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/actionbar/actionViewItems", "vs/workbench/contrib/remote/browser/remoteIcons", "vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService", "vs/base/common/cancellation", "vs/base/common/platform", "vs/platform/list/browser/listService", "vs/base/browser/ui/button/button", "vs/platform/theme/common/colorRegistry", "vs/base/common/htmlContent", "vs/workbench/services/hover/browser/hover", "vs/workbench/common/theme", "vs/base/common/codicons", "vs/platform/theme/browser/defaultStyles", "vs/workbench/services/remote/common/tunnelModel", "vs/css!./media/tunnelView"], function (require, exports, nls, dom, views_1, keybinding_1, contextView_1, contextkey_1, configuration_1, instantiation_1, opener_1, quickInput_1, commands_1, event_1, lifecycle_1, actionbar_1, iconLabel_1, actions_1, actions_2, menuEntryActionViewItem_1, remoteExplorerService_1, clipboardService_1, notification_1, inputBox_1, functional_1, themeService_1, themables_1, viewPane_1, uri_1, tunnel_1, descriptors_1, keybindingsRegistry_1, telemetry_1, actionViewItems_1, remoteIcons_1, externalUriOpenerService_1, cancellation_1, platform_1, listService_1, button_1, colorRegistry_1, htmlContent_1, hover_1, theme_1, codicons_1, defaultStyles_1, tunnelModel_1) {
    "use strict";
    var $svb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenPortInPreviewAction = exports.OpenPortInBrowserAction = exports.ForwardPortAction = exports.$tvb = exports.$svb = exports.$rvb = exports.$qvb = void 0;
    exports.$qvb = new contextkey_1.$2i('openPreviewEnabled', false);
    class TunnelTreeVirtualDelegate {
        constructor(c) {
            this.c = c;
            this.headerRowHeight = 22;
        }
        getHeight(row) {
            return (row.tunnelType === remoteExplorerService_1.TunnelType.Add && !this.c.getEditableData(undefined)) ? 30 : 22;
        }
    }
    let $rvb = class $rvb {
        constructor(f, g) {
            this.f = f;
            this.g = g;
            this.d = new Map();
            this.input = {
                label: nls.localize(0, null),
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
                    themeIcon: remoteIcons_1.$hvb.id,
                    label: nls.localize(1, null)
                },
                strip: () => undefined
            };
            this.c = f.tunnelModel;
            this.onForwardedPortsChanged = event_1.Event.any(this.c.onForwardPort, this.c.onClosePort, this.c.onPortName, this.c.onCandidatesChanged);
        }
        get all() {
            const result = [];
            this.d = new Map();
            this.c.candidates.forEach(candidate => {
                this.d.set((0, tunnelModel_1.$pJ)(candidate.host, candidate.port), candidate);
            });
            if ((this.c.forwarded.size > 0) || this.f.getEditableData(undefined)) {
                result.push(...this.i);
            }
            if (this.c.detected.size > 0) {
                result.push(...this.j);
            }
            result.push(this.input);
            return result;
        }
        h(tunnelItem) {
            const key = (0, tunnelModel_1.$pJ)(tunnelItem.remoteHost, tunnelItem.remotePort);
            if (this.d.has(key)) {
                tunnelItem.processDescription = this.d.get(key).detail;
            }
        }
        get i() {
            const forwarded = Array.from(this.c.forwarded.values()).map(tunnel => {
                const tunnelItem = TunnelItem.createFromTunnel(this.f, this.g, tunnel);
                this.h(tunnelItem);
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
        get j() {
            return Array.from(this.c.detected.values()).map(tunnel => {
                const tunnelItem = TunnelItem.createFromTunnel(this.f, this.g, tunnel, remoteExplorerService_1.TunnelType.Detected, false);
                this.h(tunnelItem);
                return tunnelItem;
            });
        }
        isEmpty() {
            return (this.j.length === 0) &&
                ((this.i.length === 0) || (this.i.length === 1 &&
                    (this.i[0].tunnelType === remoteExplorerService_1.TunnelType.Add) && !this.f.getEditableData(undefined)));
        }
    };
    exports.$rvb = $rvb;
    exports.$rvb = $rvb = __decorate([
        __param(0, remoteExplorerService_1.$tsb),
        __param(1, tunnel_1.$Wz)
    ], $rvb);
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
            const icon = row.processDescription ? remoteIcons_1.$pvb : remoteIcons_1.$ovb;
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
            this.label = nls.localize(2, null);
            this.tooltip = nls.localize(3, null);
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
                label, tunnel: row, menuId: actions_2.$Ru.TunnelPortInline,
                editId: row.tunnelType === remoteExplorerService_1.TunnelType.Add ? remoteExplorerService_1.TunnelEditId.New : remoteExplorerService_1.TunnelEditId.Label, tooltip
            };
        }
    }
    class LocalAddressColumn {
        constructor() {
            this.label = nls.localize(4, null);
            this.tooltip = nls.localize(5, null);
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
                menuId: actions_2.$Ru.TunnelLocalAddressInline,
                tunnel: row,
                editId: remoteExplorerService_1.TunnelEditId.LocalPort,
                tooltip,
                markdownTooltip: label ? LocalAddressColumn.c(label) : undefined
            };
        }
        static c(localAddress) {
            return function (configurationService) {
                const editorConf = configurationService.getValue('editor');
                let clickLabel = '';
                if (editorConf.multiCursorModifier === 'ctrlCmd') {
                    if (platform_1.$j) {
                        clickLabel = nls.localize(6, null);
                    }
                    else {
                        clickLabel = nls.localize(7, null);
                    }
                }
                else {
                    if (platform_1.$j) {
                        clickLabel = nls.localize(8, null);
                    }
                    else {
                        clickLabel = nls.localize(9, null);
                    }
                }
                const markdown = new htmlContent_1.$Xj('', true);
                const uri = localAddress.startsWith('http') ? localAddress : `http://${localAddress}`;
                return markdown.appendLink(uri, 'Follow link').appendMarkdown(` (${clickLabel})`);
            };
        }
    }
    class RunningProcessColumn {
        constructor() {
            this.label = nls.localize(10, null);
            this.tooltip = nls.localize(11, null);
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
            this.label = nls.localize(12, null);
            this.tooltip = nls.localize(13, null);
            this.weight = 1;
            this.templateId = 'actionbar';
        }
        project(row) {
            if (row.tunnelType === remoteExplorerService_1.TunnelType.Add) {
                return emptyCell(row);
            }
            const label = row.source.description;
            const tooltip = `${row instanceof TunnelItem ? row.originTooltip : ''}. ${row instanceof TunnelItem ? row.tooltipPostfix : ''}`;
            return { label, menuId: actions_2.$Ru.TunnelOriginInline, tunnel: row, editId: remoteExplorerService_1.TunnelEditId.None, tooltip };
        }
    }
    class PrivacyColumn {
        constructor() {
            this.label = nls.localize(14, null);
            this.tooltip = nls.localize(15, null);
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
    let ActionBarRenderer = class ActionBarRenderer extends lifecycle_1.$kc {
        constructor(g, h, j, m, n, r, s, t) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.templateId = 'actionbar';
        }
        set actionRunner(actionRunner) {
            this.f = actionRunner;
        }
        renderTemplate(container) {
            const cell = dom.$0O(container, dom.$('.ports-view-actionbar-cell'));
            const icon = dom.$0O(cell, dom.$('.ports-view-actionbar-cell-icon'));
            const label = new iconLabel_1.$KR(cell, {
                supportHighlights: true,
                hoverDelegate: {
                    showHover: (options) => this.t.showHover(options),
                    delay: this.s.getValue('workbench.hover.delay')
                }
            });
            const actionsContainer = dom.$0O(cell, dom.$('.actions'));
            const actionBar = new actionbar_1.$1P(actionsContainer, {
                actionViewItemProvider: menuEntryActionViewItem_1.$F3.bind(undefined, this.g)
            });
            return { label, icon, actionBar, container: cell, elementDisposable: lifecycle_1.$kc.None };
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
            if (element.editId === remoteExplorerService_1.TunnelEditId.New && (editableData = this.n.getEditableData(undefined))) {
                this.w(templateData.container, editableData);
            }
            else {
                editableData = this.n.getEditableData(element.tunnel, element.editId);
                if (editableData) {
                    this.w(templateData.container, editableData);
                }
                else if ((element.tunnel.tunnelType === remoteExplorerService_1.TunnelType.Add) && (element.menuId === actions_2.$Ru.TunnelPortInline)) {
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
            templateData.button = this.B(new button_1.$7Q(templateData.container, defaultStyles_1.$i2));
            templateData.button.label = element.label;
            templateData.button.element.title = element.tooltip;
            this.B(templateData.button.onDidClick(() => {
                this.r.executeCommand(ForwardPortAction.INLINE_ID);
            }));
        }
        u(tunnel) {
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
                    { markdown: element.markdownTooltip(this.s), markdownNotSupportedFallback: element.tooltip }
                    : element.tooltip,
                extraClasses: element.menuId === actions_2.$Ru.TunnelLocalAddressInline ? ['ports-view-actionbar-cell-localaddress'] : undefined
            });
            templateData.actionBar.context = this.u(element.tunnel);
            templateData.container.style.paddingLeft = '10px';
            const context = [
                ['view', remoteExplorerService_1.$vsb],
                [TunnelTypeContextKey.key, element.tunnel.tunnelType],
                [TunnelCloseableContextKey.key, element.tunnel.closeable],
                [TunnelPrivacyContextKey.key, element.tunnel.privacy.id],
                [TunnelProtocolContextKey.key, element.tunnel.protocol]
            ];
            const contextKeyService = this.h.createOverlay(context);
            const disposableStore = new lifecycle_1.$jc();
            templateData.elementDisposable = disposableStore;
            if (element.menuId) {
                const menu = disposableStore.add(this.j.createMenu(element.menuId, contextKeyService));
                let actions = [];
                (0, menuEntryActionViewItem_1.$B3)(menu, { shouldForwardArgs: true }, actions);
                if (actions) {
                    const labelActions = actions.filter(action => action.id.toLowerCase().indexOf('label') >= 0);
                    if (labelActions.length > 1) {
                        labelActions.sort((a, b) => a.label.length - b.label.length);
                        labelActions.pop();
                        actions = actions.filter(action => labelActions.indexOf(action) < 0);
                    }
                    templateData.actionBar.push(actions, { icon: true, label: false });
                    if (this.f) {
                        templateData.actionBar.actionRunner = this.f;
                    }
                }
            }
            if (element.icon) {
                templateData.icon.className = `ports-view-actionbar-cell-icon ${themables_1.ThemeIcon.asClassName(element.icon)}`;
                templateData.icon.title = element.tooltip;
                templateData.icon.style.display = 'inline';
            }
        }
        w(container, editableData) {
            // Required for FireFox. The blur event doesn't fire on FireFox when you just mash the "+" button to forward a port.
            if (this.c) {
                this.c(false, false);
                this.c = undefined;
            }
            container.style.paddingLeft = '5px';
            const value = editableData.startingValue || '';
            const inputBox = new inputBox_1.$sR(container, this.m, {
                ariaLabel: nls.localize(16, null),
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
                inputBoxStyles: defaultStyles_1.$s2
            });
            inputBox.value = value;
            inputBox.focus();
            inputBox.select({ start: 0, end: editableData.startingValue ? editableData.startingValue.length : 0 });
            const done = (0, functional_1.$bb)(async (success, finishEditing) => {
                (0, lifecycle_1.$fc)(toDispose);
                if (this.c) {
                    this.c = undefined;
                }
                inputBox.element.style.display = 'none';
                const inputValue = inputBox.value;
                if (finishEditing) {
                    return editableData.onFinish(inputValue, success);
                }
            });
            this.c = done;
            const toDispose = [
                inputBox,
                dom.$oO(inputBox.inputElement, dom.$3O.KEY_DOWN, async (e) => {
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
                dom.$nO(inputBox.inputElement, dom.$3O.BLUR, () => {
                    return done(inputBox.validate() !== 3 /* MessageType.ERROR */, true);
                })
            ];
            return (0, lifecycle_1.$ic)(() => {
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
        __param(0, instantiation_1.$Ah),
        __param(1, contextkey_1.$3i),
        __param(2, actions_2.$Su),
        __param(3, contextView_1.$VZ),
        __param(4, remoteExplorerService_1.$tsb),
        __param(5, commands_1.$Fr),
        __param(6, configuration_1.$8h),
        __param(7, hover_1.$zib)
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
            return new TunnelItem(this.tunnelType, this.remoteHost, this.remotePort, this.source, this.hasRunningProcess, this.protocol, this.localUri, this.localAddress, this.localPort, this.closeable, this.name, this.c, this.d, this.f);
        }
        constructor(tunnelType, remoteHost, remotePort, source, hasRunningProcess, protocol, localUri, localAddress, localPort, closeable, name, c, d, f, g, h) {
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
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
        }
        get label() {
            if (this.tunnelType === remoteExplorerService_1.TunnelType.Add && this.name) {
                return this.name;
            }
            const portNumberLabel = ((0, tunnel_1.$2z)(this.remoteHost) || (0, tunnel_1.$4z)(this.remoteHost))
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
            this.c = description;
        }
        get processDescription() {
            let description = '';
            if (this.c) {
                if (this.d && this.g?.namedProcesses.has(this.d)) {
                    // This is a known process. Give it a friendly name.
                    description = this.g.namedProcesses.get(this.d);
                }
                else {
                    description = this.c.replace(/\0/g, ' ').trim();
                }
                if (this.d) {
                    description += ` (${this.d})`;
                }
            }
            else if (this.hasRunningProcess) {
                description = nls.localize(17, null);
            }
            return description;
        }
        get tooltipPostfix() {
            let information;
            if (this.localAddress) {
                information = nls.localize(18, null, this.remoteHost, this.remotePort, this.localAddress);
            }
            else {
                information = nls.localize(19, null, this.remoteHost, this.remotePort);
            }
            return information;
        }
        get iconTooltip() {
            const isAdd = this.tunnelType === remoteExplorerService_1.TunnelType.Add;
            if (!isAdd) {
                return `${this.processDescription ? nls.localize(20, null) :
                    nls.localize(21, null)}`;
            }
            else {
                return this.label;
            }
        }
        get portTooltip() {
            const isAdd = this.tunnelType === remoteExplorerService_1.TunnelType.Add;
            if (!isAdd) {
                return `${this.name ? nls.localize(22, null, this.name) : ''}`;
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
            if (this.h?.privacyOptions) {
                return this.h?.privacyOptions.find(element => element.id === this.f) ??
                    {
                        id: '',
                        themeIcon: codicons_1.$Pj.question.id,
                        label: nls.localize(23, null)
                    };
            }
            else {
                return {
                    id: tunnel_1.TunnelPrivacyId.Private,
                    themeIcon: remoteIcons_1.$hvb.id,
                    label: nls.localize(24, null)
                };
            }
        }
    }
    const TunnelTypeContextKey = new contextkey_1.$2i('tunnelType', remoteExplorerService_1.TunnelType.Add, true);
    const TunnelCloseableContextKey = new contextkey_1.$2i('tunnelCloseable', false, true);
    const TunnelPrivacyContextKey = new contextkey_1.$2i('tunnelPrivacy', undefined, true);
    const TunnelPrivacyEnabledContextKey = new contextkey_1.$2i('tunnelPrivacyEnabled', false, true);
    const TunnelProtocolContextKey = new contextkey_1.$2i('tunnelProtocol', tunnel_1.TunnelProtocol.Http, true);
    const TunnelViewFocusContextKey = new contextkey_1.$2i('tunnelViewFocus', false, nls.localize(25, null));
    const TunnelViewSelectionKeyName = 'tunnelViewSelection';
    // host:port
    const TunnelViewSelectionContextKey = new contextkey_1.$2i(TunnelViewSelectionKeyName, undefined, true);
    const TunnelViewMultiSelectionKeyName = 'tunnelViewMultiSelection';
    // host:port[]
    const TunnelViewMultiSelectionContextKey = new contextkey_1.$2i(TunnelViewMultiSelectionKeyName, undefined, true);
    const PortChangableContextKey = new contextkey_1.$2i('portChangable', false, true);
    let $svb = class $svb extends viewPane_1.$Ieb {
        static { $svb_1 = this; }
        static { this.ID = remoteExplorerService_1.$vsb; }
        static { this.TITLE = nls.localize(26, null); }
        constructor(Yb, options, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, Zb, $b, ac, themeService, bc, telemetryService, cc, dc, ec) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.Yb = Yb;
            this.Zb = Zb;
            this.$b = $b;
            this.ac = ac;
            this.bc = bc;
            this.cc = cc;
            this.dc = dc;
            this.ec = ec;
            this.g = this.B(new lifecycle_1.$jc());
            this.sb = false;
            this.Wb = [];
            this.Xb = [];
            this.nc = 0;
            this.oc = 0;
            this.h = TunnelTypeContextKey.bindTo(contextKeyService);
            this.j = TunnelCloseableContextKey.bindTo(contextKeyService);
            this.m = TunnelPrivacyContextKey.bindTo(contextKeyService);
            this.n = TunnelPrivacyEnabledContextKey.bindTo(contextKeyService);
            this.n.set(cc.canChangePrivacy);
            this.r = TunnelProtocolContextKey.bindTo(contextKeyService);
            this.s = TunnelViewFocusContextKey.bindTo(contextKeyService);
            this.t = TunnelViewSelectionContextKey.bindTo(contextKeyService);
            this.L = TunnelViewMultiSelectionContextKey.bindTo(contextKeyService);
            this.ab = PortChangableContextKey.bindTo(contextKeyService);
            const overlayContextKeyService = this.zb.createOverlay([['view', $svb_1.ID]]);
            const titleMenu = this.B(this.ac.createMenu(actions_2.$Ru.TunnelTitle, overlayContextKeyService));
            const updateActions = () => {
                this.Wb = [];
                (0, menuEntryActionViewItem_1.$B3)(titleMenu, undefined, this.Wb);
                this.Ub();
            };
            this.B(titleMenu.onDidChange(updateActions));
            updateActions();
            this.B((0, lifecycle_1.$ic)(() => {
                this.Wb = [];
            }));
            this.fc();
            this.B(event_1.Event.once(this.cc.onAddedTunnelProvider)(() => {
                if (this.n.get() === false) {
                    this.n.set(cc.canChangePrivacy);
                    updateActions();
                    this.fc();
                    this.gc();
                    this.f.layout(this.nc, this.oc);
                }
            }));
        }
        fc() {
            for (const privacyOption of this.cc.privacyOptions) {
                const optionId = `remote.tunnel.privacy${privacyOption.id}`;
                commands_1.$Gr.registerCommand(optionId, ChangeTunnelPrivacyAction.handler(privacyOption.id));
                actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelPrivacy, ({
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
            return this.bc.tunnelModel.forwarded.size + this.bc.tunnelModel.detected.size;
        }
        gc() {
            if (!this.c) {
                return;
            }
            this.g.clear();
            dom.$lO(this.c);
            const widgetContainer = dom.$0O(this.c, dom.$('.customview-tree'));
            widgetContainer.classList.add('ports-view');
            widgetContainer.classList.add('file-icon-themable-tree', 'show-file-icons');
            const actionBarRenderer = new ActionBarRenderer(this.Bb, this.zb, this.ac, this.dc, this.bc, this.$b, this.yb, this.ec);
            const columns = [new IconColumn(), new PortColumn(), new LocalAddressColumn(), new RunningProcessColumn()];
            if (this.cc.canChangePrivacy) {
                columns.push(new PrivacyColumn());
            }
            columns.push(new OriginColumn());
            this.f = this.Bb.createInstance(listService_1.$r4, 'RemoteTunnels', widgetContainer, new TunnelTreeVirtualDelegate(this.bc), columns, [actionBarRenderer], {
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (item) => {
                        return item.label;
                    }
                },
                multipleSelectionSupport: true,
                accessibilityProvider: {
                    getAriaLabel: (item) => {
                        if (item instanceof TunnelItem) {
                            return `${item.tooltipPostfix} ${item.portTooltip} ${item.iconTooltip} ${item.processTooltip} ${item.originTooltip} ${this.cc.canChangePrivacy ? item.privacy.label : ''}`;
                        }
                        else {
                            return item.label;
                        }
                    },
                    getWidgetAriaLabel: () => nls.localize(27, null)
                },
                openOnSingleClick: true
            });
            const actionRunner = new actions_1.$hi();
            actionBarRenderer.actionRunner = actionRunner;
            this.g.add(this.f);
            this.g.add(this.f.onContextMenu(e => this.lc(e, actionRunner)));
            this.g.add(this.f.onMouseDblClick(e => this.mc(e)));
            this.g.add(this.f.onDidChangeFocus(e => this.ic(e)));
            this.g.add(this.f.onDidChangeSelection(e => this.kc(e)));
            this.g.add(this.f.onDidFocus(() => this.s.set(true)));
            this.g.add(this.f.onDidBlur(() => this.s.set(false)));
            const rerender = () => this.f.splice(0, Number.POSITIVE_INFINITY, this.Yb.all);
            rerender();
            let lastPortCount = this.portCount;
            this.g.add(event_1.Event.debounce(this.Yb.onForwardedPortsChanged, (_last, e) => e, 50)(() => {
                const newPortCount = this.portCount;
                if (((lastPortCount === 0) || (newPortCount === 0)) && (lastPortCount !== newPortCount)) {
                    this.db.fire();
                }
                lastPortCount = newPortCount;
                rerender();
            }));
            this.g.add(this.f.onMouseClick(e => {
                if (this.jc(e.browserEvent)) {
                    const selection = this.f.getSelectedElements();
                    if ((selection.length === 0) ||
                        ((selection.length === 1) && (selection[0] === e.element))) {
                        this.$b.executeCommand(OpenPortInBrowserAction.ID, e.element);
                    }
                }
            }));
            this.g.add(this.f.onDidOpen(e => {
                if (!e.element || (e.element.tunnelType !== remoteExplorerService_1.TunnelType.Forwarded)) {
                    return;
                }
                if (e.browserEvent?.type === 'dblclick') {
                    this.$b.executeCommand(LabelTunnelAction.ID);
                }
            }));
            this.g.add(this.bc.onDidChangeEditable(e => {
                this.sb = !!this.bc.getEditableData(e?.tunnel, e?.editId);
                this.db.fire();
                if (!this.sb) {
                    widgetContainer.classList.remove('highlight');
                }
                rerender();
                if (this.sb) {
                    widgetContainer.classList.add('highlight');
                    if (!e) {
                        // When we are in editing mode for a new forward, rather than updating an existing one we need to reveal the input box since it might be out of view.
                        this.f.reveal(this.f.indexOf(this.Yb.input));
                    }
                }
                else {
                    if (e && (e.tunnel.tunnelType !== remoteExplorerService_1.TunnelType.Add)) {
                        this.f.setFocus(this.Xb);
                    }
                    this.focus();
                }
            }));
        }
        U(container) {
            super.U(container);
            this.c = dom.$0O(container, dom.$('.tree-explorer-viewlet-tree-view'));
            this.gc();
        }
        shouldShowWelcome() {
            return this.Yb.isEmpty() && !this.sb;
        }
        focus() {
            super.focus();
            this.f.domFocus();
        }
        ic(event) {
            if (event.indexes.length > 0 && event.elements.length > 0) {
                this.Xb = [...event.indexes];
            }
            const elements = event.elements;
            const item = elements && elements.length ? elements[0] : undefined;
            if (item) {
                this.t.set((0, tunnelModel_1.$pJ)(item.remoteHost, item.remotePort));
                this.h.set(item.tunnelType);
                this.j.set(!!item.closeable);
                this.m.set(item.privacy.id);
                this.r.set(item.protocol === tunnel_1.TunnelProtocol.Https ? tunnel_1.TunnelProtocol.Https : tunnel_1.TunnelProtocol.Https);
                this.ab.set(!!item.localPort);
            }
            else {
                this.h.reset();
                this.t.reset();
                this.j.reset();
                this.m.reset();
                this.r.reset();
                this.ab.reset();
            }
        }
        jc(e) {
            const editorConf = this.yb.getValue('editor');
            let modifierKey = false;
            if (editorConf.multiCursorModifier === 'ctrlCmd') {
                modifierKey = e.altKey;
            }
            else {
                if (platform_1.$j) {
                    modifierKey = e.metaKey;
                }
                else {
                    modifierKey = e.ctrlKey;
                }
            }
            return modifierKey;
        }
        kc(event) {
            const elements = event.elements;
            if (elements.length > 1) {
                this.L.set(elements.map(element => (0, tunnelModel_1.$pJ)(element.remoteHost, element.remotePort)));
            }
            else {
                this.L.set(undefined);
            }
        }
        lc(event, actionRunner) {
            if ((event.element !== undefined) && !(event.element instanceof TunnelItem)) {
                return;
            }
            event.browserEvent.preventDefault();
            event.browserEvent.stopPropagation();
            const node = event.element;
            if (node) {
                this.f.setFocus([this.f.indexOf(node)]);
                this.h.set(node.tunnelType);
                this.j.set(!!node.closeable);
                this.m.set(node.privacy.id);
                this.r.set(node.protocol);
                this.ab.set(!!node.localPort);
            }
            else {
                this.h.set(remoteExplorerService_1.TunnelType.Add);
                this.j.set(false);
                this.m.set(undefined);
                this.r.set(undefined);
                this.ab.set(false);
            }
            this.xb.showContextMenu({
                menuId: actions_2.$Ru.TunnelContext,
                menuActionOptions: { shouldForwardArgs: true },
                contextKeyService: this.f.contextKeyService,
                getAnchor: () => event.anchor,
                getActionViewItem: (action) => {
                    const keybinding = this.wb.lookupKeybinding(action.id);
                    if (keybinding) {
                        return new actionViewItems_1.$NQ(action, action, { label: true, keybinding: keybinding.getLabel() });
                    }
                    return undefined;
                },
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.f.domFocus();
                    }
                },
                getActionsContext: () => node?.strip(),
                actionRunner
            });
        }
        mc(e) {
            if (!e.element) {
                this.$b.executeCommand(ForwardPortAction.INLINE_ID);
            }
        }
        W(height, width) {
            this.nc = height;
            this.oc = width;
            super.W(height, width);
            this.f.layout(height, width);
        }
    };
    exports.$svb = $svb;
    exports.$svb = $svb = $svb_1 = __decorate([
        __param(2, keybinding_1.$2D),
        __param(3, contextView_1.$WZ),
        __param(4, contextkey_1.$3i),
        __param(5, configuration_1.$8h),
        __param(6, instantiation_1.$Ah),
        __param(7, views_1.$_E),
        __param(8, opener_1.$NT),
        __param(9, quickInput_1.$Gq),
        __param(10, commands_1.$Fr),
        __param(11, actions_2.$Su),
        __param(12, themeService_1.$gv),
        __param(13, remoteExplorerService_1.$tsb),
        __param(14, telemetry_1.$9k),
        __param(15, tunnel_1.$Wz),
        __param(16, contextView_1.$VZ),
        __param(17, hover_1.$zib)
    ], $svb);
    class $tvb {
        constructor(viewModel, environmentService) {
            this.id = $svb.ID;
            this.name = $svb.TITLE;
            this.canToggleVisibility = true;
            this.hideByDefault = false;
            // group is not actually used for views that are not extension contributed. Use order instead.
            this.group = 'details@0';
            // -500 comes from the remote explorer viewOrderDelegate
            this.order = -500;
            this.canMoveView = true;
            this.containerIcon = remoteIcons_1.$fvb;
            this.ctorDescriptor = new descriptors_1.$yh($svb, [viewModel]);
            this.remoteAuthority = environmentService.remoteAuthority ? environmentService.remoteAuthority.split('+')[0] : undefined;
        }
    }
    exports.$tvb = $tvb;
    function isITunnelItem(item) {
        return item && item.tunnelType && item.remoteHost && item.source;
    }
    var LabelTunnelAction;
    (function (LabelTunnelAction) {
        LabelTunnelAction.ID = 'remote.tunnel.label';
        LabelTunnelAction.LABEL = nls.localize(28, null);
        LabelTunnelAction.COMMAND_ID_KEYWORD = 'label';
        function handler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.$tsb);
                let tunnelContext;
                if (isITunnelItem(arg)) {
                    tunnelContext = arg;
                }
                else {
                    const context = accessor.get(contextkey_1.$3i).getContextKeyValue(TunnelViewSelectionKeyName);
                    const tunnel = context ? remoteExplorerService.tunnelModel.forwarded.get(context) : undefined;
                    if (tunnel) {
                        const tunnelService = accessor.get(tunnel_1.$Wz);
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
                            placeholder: nls.localize(29, null),
                            startingValue
                        });
                    });
                }
                return undefined;
            };
        }
        LabelTunnelAction.handler = handler;
    })(LabelTunnelAction || (LabelTunnelAction = {}));
    const invalidPortString = nls.localize(30, null);
    const maxPortNumber = 65536;
    const invalidPortNumberString = nls.localize(31, null, maxPortNumber);
    const requiresSudoString = nls.localize(32, null);
    const alreadyForwarded = nls.localize(33, null);
    var ForwardPortAction;
    (function (ForwardPortAction) {
        ForwardPortAction.INLINE_ID = 'remote.tunnel.forwardInline';
        ForwardPortAction.COMMANDPALETTE_ID = 'remote.tunnel.forwardCommandPalette';
        ForwardPortAction.LABEL = { value: nls.localize(34, null), original: 'Forward a Port' };
        ForwardPortAction.TREEITEM_LABEL = nls.localize(35, null);
        const forwardPrompt = nls.localize(36, null);
        function validateInput(remoteExplorerService, tunnelService, value, canElevate) {
            const parsed = (0, tunnelModel_1.$kJ)(value);
            if (!parsed) {
                return { content: invalidPortString, severity: notification_1.Severity.Error };
            }
            else if (parsed.port >= maxPortNumber) {
                return { content: invalidPortNumberString, severity: notification_1.Severity.Error };
            }
            else if (canElevate && tunnelService.isPortPrivileged(parsed.port)) {
                return { content: requiresSudoString, severity: notification_1.Severity.Info };
            }
            else if ((0, tunnelModel_1.$oJ)(remoteExplorerService.tunnelModel.forwarded, parsed.host, parsed.port)) {
                return { content: alreadyForwarded, severity: notification_1.Severity.Error };
            }
            return null;
        }
        function error(notificationService, tunnelOrError, host, port) {
            if (!tunnelOrError) {
                notificationService.warn(nls.localize(37, null, host, port));
            }
            else if (typeof tunnelOrError === 'string') {
                notificationService.warn(nls.localize(38, null, host, port, tunnelOrError));
            }
        }
        function inlineHandler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.$tsb);
                const notificationService = accessor.get(notification_1.$Yu);
                const tunnelService = accessor.get(tunnel_1.$Wz);
                remoteExplorerService.setEditable(undefined, remoteExplorerService_1.TunnelEditId.New, {
                    onFinish: async (value, success) => {
                        remoteExplorerService.setEditable(undefined, remoteExplorerService_1.TunnelEditId.New, null);
                        let parsed;
                        if (success && (parsed = (0, tunnelModel_1.$kJ)(value))) {
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
                const remoteExplorerService = accessor.get(remoteExplorerService_1.$tsb);
                const notificationService = accessor.get(notification_1.$Yu);
                const viewsService = accessor.get(views_1.$$E);
                const quickInputService = accessor.get(quickInput_1.$Gq);
                const tunnelService = accessor.get(tunnel_1.$Wz);
                await viewsService.openView($svb.ID, true);
                const value = await quickInputService.input({
                    prompt: forwardPrompt,
                    validateInput: (value) => Promise.resolve(validateInput(remoteExplorerService, tunnelService, value, tunnelService.canElevate))
                });
                let parsed;
                if (value && (parsed = (0, tunnelModel_1.$kJ)(value))) {
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
                label: nls.localize(39, null, ForwardPortAction.LABEL.value)
            });
        }
        return picks;
    }
    var ClosePortAction;
    (function (ClosePortAction) {
        ClosePortAction.INLINE_ID = 'remote.tunnel.closeInline';
        ClosePortAction.COMMANDPALETTE_ID = 'remote.tunnel.closeCommandPalette';
        ClosePortAction.LABEL = { value: nls.localize(40, null), original: 'Stop Forwarding Port' };
        function inlineHandler() {
            return async (accessor, arg) => {
                const contextKeyService = accessor.get(contextkey_1.$3i);
                const remoteExplorerService = accessor.get(remoteExplorerService_1.$tsb);
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
                const quickInputService = accessor.get(quickInput_1.$Gq);
                const remoteExplorerService = accessor.get(remoteExplorerService_1.$tsb);
                const tunnelService = accessor.get(tunnel_1.$Wz);
                const commandService = accessor.get(commands_1.$Fr);
                const picks = makeTunnelPicks(Array.from(remoteExplorerService.tunnelModel.forwarded.values()).filter(tunnel => tunnel.closeable), remoteExplorerService, tunnelService);
                const result = await quickInputService.pick(picks, { placeHolder: nls.localize(41, null) });
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
        OpenPortInBrowserAction.LABEL = nls.localize(42, null);
        function handler() {
            return async (accessor, arg) => {
                let key;
                if (isITunnelItem(arg)) {
                    key = (0, tunnelModel_1.$pJ)(arg.remoteHost, arg.remotePort);
                }
                else if (arg.tunnelRemoteHost && arg.tunnelRemotePort) {
                    key = (0, tunnelModel_1.$pJ)(arg.tunnelRemoteHost, arg.tunnelRemotePort);
                }
                if (key) {
                    const model = accessor.get(remoteExplorerService_1.$tsb).tunnelModel;
                    const openerService = accessor.get(opener_1.$NT);
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
        OpenPortInPreviewAction.LABEL = nls.localize(43, null);
        function handler() {
            return async (accessor, arg) => {
                let key;
                if (isITunnelItem(arg)) {
                    key = (0, tunnelModel_1.$pJ)(arg.remoteHost, arg.remotePort);
                }
                else if (arg.tunnelRemoteHost && arg.tunnelRemotePort) {
                    key = (0, tunnelModel_1.$pJ)(arg.tunnelRemoteHost, arg.tunnelRemotePort);
                }
                if (key) {
                    const model = accessor.get(remoteExplorerService_1.$tsb).tunnelModel;
                    const openerService = accessor.get(opener_1.$NT);
                    const externalOpenerService = accessor.get(externalUriOpenerService_1.$flb);
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
                const opener = await externalOpenerService.getOpener(tunnel.localUri, { sourceUri }, new cancellation_1.$pd().token);
                if (opener) {
                    return opener.openExternalUri(tunnel.localUri, { sourceUri }, new cancellation_1.$pd().token);
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
        OpenPortInBrowserCommandPaletteAction.LABEL = nls.localize(44, null);
        function handler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.$tsb);
                const tunnelService = accessor.get(tunnel_1.$Wz);
                const model = remoteExplorerService.tunnelModel;
                const quickPickService = accessor.get(quickInput_1.$Gq);
                const openerService = accessor.get(opener_1.$NT);
                const commandService = accessor.get(commands_1.$Fr);
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
                        label: nls.localize(45, null)
                    });
                }
                else {
                    options.push({
                        label: nls.localize(46, null)
                    });
                }
                const picked = await quickPickService.pick(options, { placeHolder: nls.localize(47, null) });
                if (picked && picked.tunnel) {
                    return OpenPortInBrowserAction.run(model, openerService, (0, tunnelModel_1.$pJ)(picked.tunnel.remoteHost, picked.tunnel.remotePort));
                }
                else if (picked) {
                    return commandService.executeCommand(`${remoteExplorerService_1.$vsb}.focus`);
                }
            };
        }
        OpenPortInBrowserCommandPaletteAction.handler = handler;
    })(OpenPortInBrowserCommandPaletteAction || (OpenPortInBrowserCommandPaletteAction = {}));
    var CopyAddressAction;
    (function (CopyAddressAction) {
        CopyAddressAction.INLINE_ID = 'remote.tunnel.copyAddressInline';
        CopyAddressAction.COMMANDPALETTE_ID = 'remote.tunnel.copyAddressCommandPalette';
        CopyAddressAction.INLINE_LABEL = nls.localize(48, null);
        CopyAddressAction.COMMANDPALETTE_LABEL = nls.localize(49, null);
        async function copyAddress(remoteExplorerService, clipboardService, tunnelItem) {
            const address = remoteExplorerService.tunnelModel.address(tunnelItem.remoteHost, tunnelItem.remotePort);
            if (address) {
                await clipboardService.writeText(address.toString());
            }
        }
        function inlineHandler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.$tsb);
                let tunnelItem;
                if (isITunnelItem(arg)) {
                    tunnelItem = arg;
                }
                else {
                    const context = accessor.get(contextkey_1.$3i).getContextKeyValue(TunnelViewSelectionKeyName);
                    tunnelItem = context ? remoteExplorerService.tunnelModel.forwarded.get(context) : undefined;
                }
                if (tunnelItem) {
                    return copyAddress(remoteExplorerService, accessor.get(clipboardService_1.$UZ), tunnelItem);
                }
            };
        }
        CopyAddressAction.inlineHandler = inlineHandler;
        function commandPaletteHandler() {
            return async (accessor, arg) => {
                const quickInputService = accessor.get(quickInput_1.$Gq);
                const remoteExplorerService = accessor.get(remoteExplorerService_1.$tsb);
                const tunnelService = accessor.get(tunnel_1.$Wz);
                const commandService = accessor.get(commands_1.$Fr);
                const clipboardService = accessor.get(clipboardService_1.$UZ);
                const tunnels = Array.from(remoteExplorerService.tunnelModel.forwarded.values()).concat(Array.from(remoteExplorerService.tunnelModel.detected.values()));
                const result = await quickInputService.pick(makeTunnelPicks(tunnels, remoteExplorerService, tunnelService), { placeHolder: nls.localize(50, null) });
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
        ChangeLocalPortAction.LABEL = nls.localize(51, null);
        function validateInput(tunnelService, value, canElevate) {
            if (!value.match(/^[0-9]+$/)) {
                return { content: nls.localize(52, null), severity: notification_1.Severity.Error };
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
                const remoteExplorerService = accessor.get(remoteExplorerService_1.$tsb);
                const notificationService = accessor.get(notification_1.$Yu);
                const tunnelService = accessor.get(tunnel_1.$Wz);
                let tunnelContext;
                if (isITunnelItem(arg)) {
                    tunnelContext = arg;
                }
                else {
                    const context = accessor.get(contextkey_1.$3i).getContextKeyValue(TunnelViewSelectionKeyName);
                    const tunnel = context ? remoteExplorerService.tunnelModel.forwarded.get(context) : undefined;
                    if (tunnel) {
                        const tunnelService = accessor.get(tunnel_1.$Wz);
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
                                    notificationService.warn(nls.localize(53, null, value, newForward.tunnelLocalPort ?? newForward.localAddress));
                                }
                            }
                        },
                        validationMessage: (value) => validateInput(tunnelService, value, tunnelService.canElevate),
                        placeholder: nls.localize(54, null)
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
                    const remoteExplorerService = accessor.get(remoteExplorerService_1.$tsb);
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
        SetTunnelProtocolAction.LABEL_HTTP = nls.localize(55, null);
        SetTunnelProtocolAction.LABEL_HTTPS = nls.localize(56, null);
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
                return handler(arg, tunnel_1.TunnelProtocol.Http, accessor.get(remoteExplorerService_1.$tsb));
            };
        }
        SetTunnelProtocolAction.handlerHttp = handlerHttp;
        function handlerHttps() {
            return async (accessor, arg) => {
                return handler(arg, tunnel_1.TunnelProtocol.Https, accessor.get(remoteExplorerService_1.$tsb));
            };
        }
        SetTunnelProtocolAction.handlerHttps = handlerHttps;
    })(SetTunnelProtocolAction || (SetTunnelProtocolAction = {}));
    const tunnelViewCommandsWeightBonus = 10; // give our commands a little bit more weight over other default list/tree commands
    const isForwardedExpr = TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Forwarded);
    const isForwardedOrDetectedExpr = contextkey_1.$Ii.or(isForwardedExpr, TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Detected));
    const isNotMultiSelectionExpr = TunnelViewMultiSelectionContextKey.isEqualTo(undefined);
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: LabelTunnelAction.ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + tunnelViewCommandsWeightBonus,
        when: contextkey_1.$Ii.and(TunnelViewFocusContextKey, isForwardedExpr, isNotMultiSelectionExpr),
        primary: 60 /* KeyCode.F2 */,
        mac: {
            primary: 3 /* KeyCode.Enter */
        },
        handler: LabelTunnelAction.handler()
    });
    commands_1.$Gr.registerCommand(ForwardPortAction.INLINE_ID, ForwardPortAction.inlineHandler());
    commands_1.$Gr.registerCommand(ForwardPortAction.COMMANDPALETTE_ID, ForwardPortAction.commandPaletteHandler());
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: ClosePortAction.INLINE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + tunnelViewCommandsWeightBonus,
        when: contextkey_1.$Ii.and(TunnelCloseableContextKey, TunnelViewFocusContextKey),
        primary: 20 /* KeyCode.Delete */,
        mac: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
            secondary: [20 /* KeyCode.Delete */]
        },
        handler: ClosePortAction.inlineHandler()
    });
    commands_1.$Gr.registerCommand(ClosePortAction.COMMANDPALETTE_ID, ClosePortAction.commandPaletteHandler());
    commands_1.$Gr.registerCommand(OpenPortInBrowserAction.ID, OpenPortInBrowserAction.handler());
    commands_1.$Gr.registerCommand(OpenPortInPreviewAction.ID, OpenPortInPreviewAction.handler());
    commands_1.$Gr.registerCommand(OpenPortInBrowserCommandPaletteAction.ID, OpenPortInBrowserCommandPaletteAction.handler());
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: CopyAddressAction.INLINE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + tunnelViewCommandsWeightBonus,
        when: contextkey_1.$Ii.and(TunnelViewFocusContextKey, isForwardedOrDetectedExpr, isNotMultiSelectionExpr),
        primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
        handler: CopyAddressAction.inlineHandler()
    });
    commands_1.$Gr.registerCommand(CopyAddressAction.COMMANDPALETTE_ID, CopyAddressAction.commandPaletteHandler());
    commands_1.$Gr.registerCommand(ChangeLocalPortAction.ID, ChangeLocalPortAction.handler());
    commands_1.$Gr.registerCommand(SetTunnelProtocolAction.ID_HTTP, SetTunnelProtocolAction.handlerHttp());
    commands_1.$Gr.registerCommand(SetTunnelProtocolAction.ID_HTTPS, SetTunnelProtocolAction.handlerHttps());
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.CommandPalette, ({
        command: {
            id: ClosePortAction.COMMANDPALETTE_ID,
            title: ClosePortAction.LABEL
        },
        when: tunnelModel_1.$jJ
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.CommandPalette, ({
        command: {
            id: ForwardPortAction.COMMANDPALETTE_ID,
            title: ForwardPortAction.LABEL
        },
        when: tunnelModel_1.$jJ
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.CommandPalette, ({
        command: {
            id: CopyAddressAction.COMMANDPALETTE_ID,
            title: CopyAddressAction.COMMANDPALETTE_LABEL
        },
        when: tunnelModel_1.$jJ
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.CommandPalette, ({
        command: {
            id: OpenPortInBrowserCommandPaletteAction.ID,
            title: OpenPortInBrowserCommandPaletteAction.LABEL
        },
        when: tunnelModel_1.$jJ
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelContext, ({
        group: '._open',
        order: 0,
        command: {
            id: OpenPortInBrowserAction.ID,
            title: OpenPortInBrowserAction.LABEL,
        },
        when: contextkey_1.$Ii.and(isForwardedOrDetectedExpr, isNotMultiSelectionExpr)
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelContext, ({
        group: '._open',
        order: 1,
        command: {
            id: OpenPortInPreviewAction.ID,
            title: OpenPortInPreviewAction.LABEL,
        },
        when: contextkey_1.$Ii.and(isForwardedOrDetectedExpr, isNotMultiSelectionExpr)
    }));
    // The group 0_manage is used by extensions, so try not to change it
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelContext, ({
        group: '0_manage',
        order: 1,
        command: {
            id: LabelTunnelAction.ID,
            title: LabelTunnelAction.LABEL,
            icon: remoteIcons_1.$nvb
        },
        when: contextkey_1.$Ii.and(isForwardedExpr, isNotMultiSelectionExpr)
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelContext, ({
        group: '2_localaddress',
        order: 0,
        command: {
            id: CopyAddressAction.INLINE_ID,
            title: CopyAddressAction.INLINE_LABEL,
        },
        when: contextkey_1.$Ii.and(isForwardedOrDetectedExpr, isNotMultiSelectionExpr)
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelContext, ({
        group: '2_localaddress',
        order: 1,
        command: {
            id: ChangeLocalPortAction.ID,
            title: ChangeLocalPortAction.LABEL,
        },
        when: contextkey_1.$Ii.and(isForwardedExpr, PortChangableContextKey, isNotMultiSelectionExpr)
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelContext, ({
        group: '2_localaddress',
        order: 2,
        submenu: actions_2.$Ru.TunnelPrivacy,
        title: nls.localize(57, null),
        when: contextkey_1.$Ii.and(isForwardedExpr, TunnelPrivacyEnabledContextKey)
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelContext, ({
        group: '2_localaddress',
        order: 3,
        submenu: actions_2.$Ru.TunnelProtocol,
        title: nls.localize(58, null),
        when: contextkey_1.$Ii.and(isForwardedExpr, isNotMultiSelectionExpr)
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelContext, ({
        group: '3_forward',
        order: 0,
        command: {
            id: ClosePortAction.INLINE_ID,
            title: ClosePortAction.LABEL,
        },
        when: TunnelCloseableContextKey
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelContext, ({
        group: '3_forward',
        order: 1,
        command: {
            id: ForwardPortAction.INLINE_ID,
            title: ForwardPortAction.LABEL,
        },
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelProtocol, ({
        order: 0,
        command: {
            id: SetTunnelProtocolAction.ID_HTTP,
            title: SetTunnelProtocolAction.LABEL_HTTP,
            toggled: TunnelProtocolContextKey.isEqualTo(tunnel_1.TunnelProtocol.Http)
        }
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelProtocol, ({
        order: 1,
        command: {
            id: SetTunnelProtocolAction.ID_HTTPS,
            title: SetTunnelProtocolAction.LABEL_HTTPS,
            toggled: TunnelProtocolContextKey.isEqualTo(tunnel_1.TunnelProtocol.Https)
        }
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelPortInline, ({
        group: '0_manage',
        order: 0,
        command: {
            id: ForwardPortAction.INLINE_ID,
            title: ForwardPortAction.TREEITEM_LABEL,
            icon: remoteIcons_1.$ivb
        },
        when: TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Candidate)
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelPortInline, ({
        group: '0_manage',
        order: 4,
        command: {
            id: LabelTunnelAction.ID,
            title: LabelTunnelAction.LABEL,
            icon: remoteIcons_1.$nvb
        },
        when: isForwardedExpr
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelPortInline, ({
        group: '0_manage',
        order: 5,
        command: {
            id: ClosePortAction.INLINE_ID,
            title: ClosePortAction.LABEL,
            icon: remoteIcons_1.$jvb
        },
        when: TunnelCloseableContextKey
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelLocalAddressInline, ({
        order: -1,
        command: {
            id: CopyAddressAction.INLINE_ID,
            title: CopyAddressAction.INLINE_LABEL,
            icon: remoteIcons_1.$mvb
        },
        when: isForwardedOrDetectedExpr
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelLocalAddressInline, ({
        order: 0,
        command: {
            id: OpenPortInBrowserAction.ID,
            title: OpenPortInBrowserAction.LABEL,
            icon: remoteIcons_1.$kvb
        },
        when: isForwardedOrDetectedExpr
    }));
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.TunnelLocalAddressInline, ({
        order: 1,
        command: {
            id: OpenPortInPreviewAction.ID,
            title: OpenPortInPreviewAction.LABEL,
            icon: remoteIcons_1.$lvb
        },
        when: isForwardedOrDetectedExpr
    }));
    (0, colorRegistry_1.$sv)('ports.iconRunningProcessForeground', {
        light: theme_1.$yab,
        dark: theme_1.$yab,
        hcDark: theme_1.$yab,
        hcLight: theme_1.$yab
    }, nls.localize(59, null));
});
//# sourceMappingURL=tunnelView.js.map