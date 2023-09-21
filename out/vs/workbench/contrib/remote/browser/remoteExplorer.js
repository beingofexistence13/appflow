var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/workbench/common/views", "vs/workbench/services/remote/common/remoteExplorerService", "vs/workbench/services/remote/common/tunnelModel", "vs/workbench/contrib/remote/browser/tunnelView", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/environment/common/environmentService", "vs/platform/registry/common/platform", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/contrib/remote/browser/urlFinder", "vs/base/common/severity", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/platform", "vs/platform/tunnel/common/tunnel", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/services/activity/common/activity", "vs/workbench/contrib/remote/browser/remoteIcons", "vs/base/common/event", "vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService", "vs/workbench/services/host/browser/host", "vs/platform/configuration/common/configurationRegistry", "vs/platform/log/common/log", "vs/workbench/services/configuration/common/configuration"], function (require, exports, nls, lifecycle_1, views_1, remoteExplorerService_1, tunnelModel_1, tunnelView_1, contextkey_1, environmentService_1, platform_1, statusbar_1, urlFinder_1, severity_1, notification_1, opener_1, terminal_1, debug_1, remoteAgentService_1, platform_2, tunnel_1, descriptors_1, viewPaneContainer_1, activity_1, remoteIcons_1, event_1, externalUriOpenerService_1, host_1, configurationRegistry_1, log_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutomaticPortForwarding = exports.PortRestore = exports.ForwardedPortsView = exports.VIEWLET_ID = void 0;
    exports.VIEWLET_ID = 'workbench.view.remote';
    let ForwardedPortsView = class ForwardedPortsView extends lifecycle_1.Disposable {
        constructor(contextKeyService, environmentService, remoteExplorerService, tunnelService, activityService, statusbarService) {
            super();
            this.contextKeyService = contextKeyService;
            this.environmentService = environmentService;
            this.remoteExplorerService = remoteExplorerService;
            this.tunnelService = tunnelService;
            this.activityService = activityService;
            this.statusbarService = statusbarService;
            this._register(platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViewWelcomeContent(remoteExplorerService_1.TUNNEL_VIEW_ID, {
                content: this.environmentService.remoteAuthority ? nls.localize('remoteNoPorts', "No forwarded ports. Forward a port to access your running services locally.\n[Forward a Port]({0})", `command:${tunnelView_1.ForwardPortAction.INLINE_ID}`)
                    : nls.localize('noRemoteNoPorts', "No forwarded ports. Forward a port to access your locally running services over the internet.\n[Forward a Port]({0})", `command:${tunnelView_1.ForwardPortAction.INLINE_ID}`),
            }));
            this.enableBadgeAndStatusBar();
            this.enableForwardedPortsView();
        }
        async getViewContainer() {
            return platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                id: remoteExplorerService_1.TUNNEL_VIEW_CONTAINER_ID,
                title: { value: nls.localize('ports', "Ports"), original: 'Ports' },
                icon: remoteIcons_1.portsViewIcon,
                ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [remoteExplorerService_1.TUNNEL_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
                storageId: remoteExplorerService_1.TUNNEL_VIEW_CONTAINER_ID,
                hideIfEmpty: true,
                order: 5
            }, 1 /* ViewContainerLocation.Panel */);
        }
        async enableForwardedPortsView() {
            if (this.contextKeyListener) {
                this.contextKeyListener.dispose();
                this.contextKeyListener = undefined;
            }
            const viewEnabled = !!tunnelModel_1.forwardedPortsViewEnabled.getValue(this.contextKeyService);
            if (viewEnabled) {
                const viewContainer = await this.getViewContainer();
                const tunnelPanelDescriptor = new tunnelView_1.TunnelPanelDescriptor(new tunnelView_1.TunnelViewModel(this.remoteExplorerService, this.tunnelService), this.environmentService);
                const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
                if (viewContainer) {
                    this.remoteExplorerService.enablePortsFeatures();
                    viewsRegistry.registerViews([tunnelPanelDescriptor], viewContainer);
                }
            }
            else {
                this.contextKeyListener = this.contextKeyService.onDidChangeContext(e => {
                    if (e.affectsSome(new Set(tunnelModel_1.forwardedPortsViewEnabled.keys()))) {
                        this.enableForwardedPortsView();
                    }
                });
            }
        }
        enableBadgeAndStatusBar() {
            const disposable = platform_1.Registry.as(views_1.Extensions.ViewsRegistry).onViewsRegistered(e => {
                if (e.find(view => view.views.find(viewDescriptor => viewDescriptor.id === remoteExplorerService_1.TUNNEL_VIEW_ID))) {
                    this._register(event_1.Event.debounce(this.remoteExplorerService.tunnelModel.onForwardPort, (_last, e) => e, 50)(() => {
                        this.updateActivityBadge();
                        this.updateStatusBar();
                    }));
                    this._register(event_1.Event.debounce(this.remoteExplorerService.tunnelModel.onClosePort, (_last, e) => e, 50)(() => {
                        this.updateActivityBadge();
                        this.updateStatusBar();
                    }));
                    this.updateActivityBadge();
                    this.updateStatusBar();
                    disposable.dispose();
                }
            });
        }
        async updateActivityBadge() {
            this._activityBadge?.dispose();
            if (this.remoteExplorerService.tunnelModel.forwarded.size > 0) {
                this._activityBadge = this.activityService.showViewActivity(remoteExplorerService_1.TUNNEL_VIEW_ID, {
                    badge: new activity_1.NumberBadge(this.remoteExplorerService.tunnelModel.forwarded.size, n => n === 1 ? nls.localize('1forwardedPort', "1 forwarded port") : nls.localize('nForwardedPorts', "{0} forwarded ports", n))
                });
            }
        }
        updateStatusBar() {
            if (!this.entryAccessor) {
                this._register(this.entryAccessor = this.statusbarService.addEntry(this.entry, 'status.forwardedPorts', 0 /* StatusbarAlignment.LEFT */, 40));
            }
            else {
                this.entryAccessor.update(this.entry);
            }
        }
        get entry() {
            let tooltip;
            const count = this.remoteExplorerService.tunnelModel.forwarded.size + this.remoteExplorerService.tunnelModel.detected.size;
            const text = `${count}`;
            if (count === 0) {
                tooltip = nls.localize('remote.forwardedPorts.statusbarTextNone', "No Ports Forwarded");
            }
            else {
                const allTunnels = Array.from(this.remoteExplorerService.tunnelModel.forwarded.values());
                allTunnels.push(...Array.from(this.remoteExplorerService.tunnelModel.detected.values()));
                tooltip = nls.localize('remote.forwardedPorts.statusbarTooltip', "Forwarded Ports: {0}", allTunnels.map(forwarded => forwarded.remotePort).join(', '));
            }
            return {
                name: nls.localize('status.forwardedPorts', "Forwarded Ports"),
                text: `$(radio-tower) ${text}`,
                ariaLabel: tooltip,
                tooltip,
                command: `${remoteExplorerService_1.TUNNEL_VIEW_ID}.focus`
            };
        }
    };
    exports.ForwardedPortsView = ForwardedPortsView;
    exports.ForwardedPortsView = ForwardedPortsView = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, remoteExplorerService_1.IRemoteExplorerService),
        __param(3, tunnel_1.ITunnelService),
        __param(4, activity_1.IActivityService),
        __param(5, statusbar_1.IStatusbarService)
    ], ForwardedPortsView);
    let PortRestore = class PortRestore {
        constructor(remoteExplorerService, logService) {
            this.remoteExplorerService = remoteExplorerService;
            this.logService = logService;
            if (!this.remoteExplorerService.tunnelModel.environmentTunnelsSet) {
                event_1.Event.once(this.remoteExplorerService.tunnelModel.onEnvironmentTunnelsSet)(async () => {
                    await this.restore();
                });
            }
            else {
                this.restore();
            }
        }
        async restore() {
            this.logService.trace('ForwardedPorts: Doing first restore.');
            return this.remoteExplorerService.restore();
        }
    };
    exports.PortRestore = PortRestore;
    exports.PortRestore = PortRestore = __decorate([
        __param(0, remoteExplorerService_1.IRemoteExplorerService),
        __param(1, log_1.ILogService)
    ], PortRestore);
    let AutomaticPortForwarding = class AutomaticPortForwarding extends lifecycle_1.Disposable {
        constructor(terminalService, notificationService, openerService, externalOpenerService, remoteExplorerService, environmentService, contextKeyService, configurationService, debugService, remoteAgentService, tunnelService, hostService, logService) {
            super();
            if (!environmentService.remoteAuthority) {
                return;
            }
            configurationService.whenRemoteConfigurationLoaded().then(() => remoteAgentService.getEnvironment()).then(environment => {
                if (environment?.os !== 3 /* OperatingSystem.Linux */) {
                    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
                        .registerDefaultConfigurations([{ overrides: { 'remote.autoForwardPortsSource': remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING_OUTPUT } }]);
                    this._register(new OutputAutomaticPortForwarding(terminalService, notificationService, openerService, externalOpenerService, remoteExplorerService, configurationService, debugService, tunnelService, hostService, logService, contextKeyService, () => false));
                }
                else {
                    const useProc = () => (configurationService.getValue(remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING) === remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING_PROCESS);
                    if (useProc()) {
                        this._register(new ProcAutomaticPortForwarding(false, configurationService, remoteExplorerService, notificationService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService));
                    }
                    else if (configurationService.getValue(remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING) === remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING_HYBRID) {
                        this._register(new ProcAutomaticPortForwarding(true, configurationService, remoteExplorerService, notificationService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService));
                    }
                    this._register(new OutputAutomaticPortForwarding(terminalService, notificationService, openerService, externalOpenerService, remoteExplorerService, configurationService, debugService, tunnelService, hostService, logService, contextKeyService, useProc));
                }
            });
        }
    };
    exports.AutomaticPortForwarding = AutomaticPortForwarding;
    exports.AutomaticPortForwarding = AutomaticPortForwarding = __decorate([
        __param(0, terminal_1.ITerminalService),
        __param(1, notification_1.INotificationService),
        __param(2, opener_1.IOpenerService),
        __param(3, externalUriOpenerService_1.IExternalUriOpenerService),
        __param(4, remoteExplorerService_1.IRemoteExplorerService),
        __param(5, environmentService_1.IWorkbenchEnvironmentService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, configuration_1.IWorkbenchConfigurationService),
        __param(8, debug_1.IDebugService),
        __param(9, remoteAgentService_1.IRemoteAgentService),
        __param(10, tunnel_1.ITunnelService),
        __param(11, host_1.IHostService),
        __param(12, log_1.ILogService)
    ], AutomaticPortForwarding);
    class OnAutoForwardedAction extends lifecycle_1.Disposable {
        static { this.NOTIFY_COOL_DOWN = 5000; } // milliseconds
        constructor(notificationService, remoteExplorerService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService) {
            super();
            this.notificationService = notificationService;
            this.remoteExplorerService = remoteExplorerService;
            this.openerService = openerService;
            this.externalOpenerService = externalOpenerService;
            this.tunnelService = tunnelService;
            this.hostService = hostService;
            this.logService = logService;
            this.contextKeyService = contextKeyService;
            this.alreadyOpenedOnce = new Set();
            this.lastNotifyTime = new Date();
            this.lastNotifyTime.setFullYear(this.lastNotifyTime.getFullYear() - 1);
        }
        async doAction(tunnels) {
            this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Starting action for ${tunnels[0]?.tunnelRemotePort}`);
            this.doActionTunnels = tunnels;
            const tunnel = await this.portNumberHeuristicDelay();
            this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose ${tunnel?.tunnelRemotePort}`);
            if (tunnel) {
                const allAttributes = await this.remoteExplorerService.tunnelModel.getAttributes([{ port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost }]);
                const attributes = allAttributes?.get(tunnel.tunnelRemotePort)?.onAutoForward;
                this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) onAutoForward action is ${attributes}`);
                switch (attributes) {
                    case tunnelModel_1.OnPortForward.OpenBrowserOnce: {
                        if (this.alreadyOpenedOnce.has(tunnel.localAddress)) {
                            break;
                        }
                        this.alreadyOpenedOnce.add(tunnel.localAddress);
                        // Intentionally do not break so that the open browser path can be run.
                    }
                    case tunnelModel_1.OnPortForward.OpenBrowser: {
                        const address = (0, tunnelModel_1.makeAddress)(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        await tunnelView_1.OpenPortInBrowserAction.run(this.remoteExplorerService.tunnelModel, this.openerService, address);
                        break;
                    }
                    case tunnelModel_1.OnPortForward.OpenPreview: {
                        const address = (0, tunnelModel_1.makeAddress)(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        await tunnelView_1.OpenPortInPreviewAction.run(this.remoteExplorerService.tunnelModel, this.openerService, this.externalOpenerService, address);
                        break;
                    }
                    case tunnelModel_1.OnPortForward.Silent: break;
                    default: {
                        const elapsed = new Date().getTime() - this.lastNotifyTime.getTime();
                        this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) time elapsed since last notification ${elapsed} ms`);
                        if (elapsed > OnAutoForwardedAction.NOTIFY_COOL_DOWN) {
                            await this.showNotification(tunnel);
                        }
                    }
                }
            }
        }
        hide(removedPorts) {
            if (this.doActionTunnels) {
                this.doActionTunnels = this.doActionTunnels.filter(value => !removedPorts.includes(value.tunnelRemotePort));
            }
            if (this.lastShownPort && removedPorts.indexOf(this.lastShownPort) >= 0) {
                this.lastNotification?.close();
            }
        }
        async portNumberHeuristicDelay() {
            this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Starting heuristic delay`);
            if (!this.doActionTunnels || this.doActionTunnels.length === 0) {
                return;
            }
            this.doActionTunnels = this.doActionTunnels.sort((a, b) => a.tunnelRemotePort - b.tunnelRemotePort);
            const firstTunnel = this.doActionTunnels.shift();
            // Heuristic.
            if (firstTunnel.tunnelRemotePort % 1000 === 0) {
                this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose tunnel because % 1000: ${firstTunnel.tunnelRemotePort}`);
                this.newerTunnel = firstTunnel;
                return firstTunnel;
                // 9229 is the node inspect port
            }
            else if (firstTunnel.tunnelRemotePort < 10000 && firstTunnel.tunnelRemotePort !== 9229) {
                this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose tunnel because < 10000: ${firstTunnel.tunnelRemotePort}`);
                this.newerTunnel = firstTunnel;
                return firstTunnel;
            }
            this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Waiting for "better" tunnel than ${firstTunnel.tunnelRemotePort}`);
            this.newerTunnel = undefined;
            return new Promise(resolve => {
                setTimeout(() => {
                    if (this.newerTunnel) {
                        resolve(undefined);
                    }
                    else if (this.doActionTunnels?.includes(firstTunnel)) {
                        resolve(firstTunnel);
                    }
                    else {
                        resolve(undefined);
                    }
                }, 3000);
            });
        }
        basicMessage(tunnel) {
            return nls.localize('remote.tunnelsView.automaticForward', "Your application running on port {0} is available.  ", tunnel.tunnelRemotePort);
        }
        linkMessage() {
            return nls.localize({ key: 'remote.tunnelsView.notificationLink2', comment: ['[See all forwarded ports]({0}) is a link. Only translate `See all forwarded ports`. Do not change brackets and parentheses or {0}'] }, "[See all forwarded ports]({0})", `command:${tunnelView_1.TunnelPanel.ID}.focus`);
        }
        async showNotification(tunnel) {
            if (!await this.hostService.hadLastFocus()) {
                return;
            }
            this.lastNotification?.close();
            let message = this.basicMessage(tunnel);
            const choices = [this.openBrowserChoice(tunnel)];
            if (!platform_2.isWeb || tunnelView_1.openPreviewEnabledContext.getValue(this.contextKeyService)) {
                choices.push(this.openPreviewChoice(tunnel));
            }
            if ((tunnel.tunnelLocalPort !== tunnel.tunnelRemotePort) && this.tunnelService.canElevate && this.tunnelService.isPortPrivileged(tunnel.tunnelRemotePort)) {
                // Privileged ports are not on Windows, so it's safe to use "superuser"
                message += nls.localize('remote.tunnelsView.elevationMessage', "You'll need to run as superuser to use port {0} locally.  ", tunnel.tunnelRemotePort);
                choices.unshift(this.elevateChoice(tunnel));
            }
            if (tunnel.privacy === tunnel_1.TunnelPrivacyId.Private && platform_2.isWeb && this.tunnelService.canChangePrivacy) {
                choices.push(this.makePublicChoice(tunnel));
            }
            message += this.linkMessage();
            this.lastNotification = this.notificationService.prompt(severity_1.default.Info, message, choices, { neverShowAgain: { id: 'remote.tunnelsView.autoForwardNeverShow', isSecondary: true } });
            this.lastShownPort = tunnel.tunnelRemotePort;
            this.lastNotifyTime = new Date();
            this.lastNotification.onDidClose(() => {
                this.lastNotification = undefined;
                this.lastShownPort = undefined;
            });
        }
        makePublicChoice(tunnel) {
            return {
                label: nls.localize('remote.tunnelsView.makePublic', "Make Public"),
                run: async () => {
                    const oldTunnelDetails = (0, tunnelModel_1.mapHasAddressLocalhostOrAllInterfaces)(this.remoteExplorerService.tunnelModel.forwarded, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                    await this.remoteExplorerService.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }, tunnelModel_1.TunnelCloseReason.Other);
                    return this.remoteExplorerService.forward({
                        remote: { host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort },
                        local: tunnel.tunnelLocalPort,
                        name: oldTunnelDetails?.name,
                        elevateIfNeeded: true,
                        privacy: tunnel_1.TunnelPrivacyId.Public,
                        source: oldTunnelDetails?.source
                    });
                }
            };
        }
        openBrowserChoice(tunnel) {
            const address = (0, tunnelModel_1.makeAddress)(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
            return {
                label: tunnelView_1.OpenPortInBrowserAction.LABEL,
                run: () => tunnelView_1.OpenPortInBrowserAction.run(this.remoteExplorerService.tunnelModel, this.openerService, address)
            };
        }
        openPreviewChoice(tunnel) {
            const address = (0, tunnelModel_1.makeAddress)(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
            return {
                label: tunnelView_1.OpenPortInPreviewAction.LABEL,
                run: () => tunnelView_1.OpenPortInPreviewAction.run(this.remoteExplorerService.tunnelModel, this.openerService, this.externalOpenerService, address)
            };
        }
        elevateChoice(tunnel) {
            return {
                // Privileged ports are not on Windows, so it's ok to stick to just "sudo".
                label: nls.localize('remote.tunnelsView.elevationButton', "Use Port {0} as Sudo...", tunnel.tunnelRemotePort),
                run: async () => {
                    await this.remoteExplorerService.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }, tunnelModel_1.TunnelCloseReason.Other);
                    const newTunnel = await this.remoteExplorerService.forward({
                        remote: { host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort },
                        local: tunnel.tunnelRemotePort,
                        elevateIfNeeded: true,
                        source: tunnelModel_1.AutoTunnelSource
                    });
                    if (!newTunnel || (typeof newTunnel === 'string')) {
                        return;
                    }
                    this.lastNotification?.close();
                    this.lastShownPort = newTunnel.tunnelRemotePort;
                    this.lastNotification = this.notificationService.prompt(severity_1.default.Info, this.basicMessage(newTunnel) + this.linkMessage(), [this.openBrowserChoice(newTunnel), this.openPreviewChoice(tunnel)], { neverShowAgain: { id: 'remote.tunnelsView.autoForwardNeverShow', isSecondary: true } });
                    this.lastNotification.onDidClose(() => {
                        this.lastNotification = undefined;
                        this.lastShownPort = undefined;
                    });
                }
            };
        }
    }
    class OutputAutomaticPortForwarding extends lifecycle_1.Disposable {
        constructor(terminalService, notificationService, openerService, externalOpenerService, remoteExplorerService, configurationService, debugService, tunnelService, hostService, logService, contextKeyService, privilegedOnly) {
            super();
            this.terminalService = terminalService;
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.externalOpenerService = externalOpenerService;
            this.remoteExplorerService = remoteExplorerService;
            this.configurationService = configurationService;
            this.debugService = debugService;
            this.tunnelService = tunnelService;
            this.hostService = hostService;
            this.logService = logService;
            this.contextKeyService = contextKeyService;
            this.privilegedOnly = privilegedOnly;
            this.notifier = new OnAutoForwardedAction(notificationService, remoteExplorerService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService);
            this._register(configurationService.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration(remoteExplorerService_1.PORT_AUTO_FORWARD_SETTING)) {
                    this.tryStartStopUrlFinder();
                }
            }));
            this.portsFeatures = this._register(this.remoteExplorerService.onEnabledPortsFeatures(() => {
                this.tryStartStopUrlFinder();
            }));
            this.tryStartStopUrlFinder();
            if (configurationService.getValue(remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING) === remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING_HYBRID) {
                this._register(this.tunnelService.onTunnelClosed(tunnel => this.notifier.hide([tunnel.port])));
            }
        }
        tryStartStopUrlFinder() {
            if (this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_FORWARD_SETTING)) {
                this.startUrlFinder();
            }
            else {
                this.stopUrlFinder();
            }
        }
        startUrlFinder() {
            if (!this.urlFinder && !this.remoteExplorerService.portsFeaturesEnabled) {
                return;
            }
            this.portsFeatures?.dispose();
            this.urlFinder = this._register(new urlFinder_1.UrlFinder(this.terminalService, this.debugService));
            this._register(this.urlFinder.onDidMatchLocalUrl(async (localUrl) => {
                if ((0, tunnelModel_1.mapHasAddressLocalhostOrAllInterfaces)(this.remoteExplorerService.tunnelModel.detected, localUrl.host, localUrl.port)) {
                    return;
                }
                const attributes = (await this.remoteExplorerService.tunnelModel.getAttributes([localUrl]))?.get(localUrl.port);
                if (attributes?.onAutoForward === tunnelModel_1.OnPortForward.Ignore) {
                    return;
                }
                if (this.privilegedOnly() && !this.tunnelService.isPortPrivileged(localUrl.port)) {
                    return;
                }
                const forwarded = await this.remoteExplorerService.forward({ remote: localUrl, source: tunnelModel_1.AutoTunnelSource }, attributes ?? null);
                if (forwarded && (typeof forwarded !== 'string')) {
                    this.notifier.doAction([forwarded]);
                }
            }));
        }
        stopUrlFinder() {
            if (this.urlFinder) {
                this.urlFinder.dispose();
                this.urlFinder = undefined;
            }
        }
    }
    class ProcAutomaticPortForwarding extends lifecycle_1.Disposable {
        constructor(unforwardOnly, configurationService, remoteExplorerService, notificationService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService) {
            super();
            this.unforwardOnly = unforwardOnly;
            this.configurationService = configurationService;
            this.remoteExplorerService = remoteExplorerService;
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.externalOpenerService = externalOpenerService;
            this.tunnelService = tunnelService;
            this.hostService = hostService;
            this.logService = logService;
            this.contextKeyService = contextKeyService;
            this.autoForwarded = new Set();
            this.notifiedOnly = new Set();
            this.initialCandidates = new Set();
            this.notifier = new OnAutoForwardedAction(notificationService, remoteExplorerService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService);
            this.initialize();
        }
        async initialize() {
            if (!this.remoteExplorerService.tunnelModel.environmentTunnelsSet) {
                await new Promise(resolve => this.remoteExplorerService.tunnelModel.onEnvironmentTunnelsSet(() => resolve()));
            }
            this._register(this.configurationService.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration(remoteExplorerService_1.PORT_AUTO_FORWARD_SETTING)) {
                    await this.startStopCandidateListener();
                }
            }));
            this.portsFeatures = this._register(this.remoteExplorerService.onEnabledPortsFeatures(async () => {
                await this.startStopCandidateListener();
            }));
            this.startStopCandidateListener();
        }
        async startStopCandidateListener() {
            if (this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_FORWARD_SETTING)) {
                await this.startCandidateListener();
            }
            else {
                this.stopCandidateListener();
            }
        }
        stopCandidateListener() {
            if (this.candidateListener) {
                this.candidateListener.dispose();
                this.candidateListener = undefined;
            }
        }
        async startCandidateListener() {
            if (this.candidateListener || !this.remoteExplorerService.portsFeaturesEnabled) {
                return;
            }
            this.portsFeatures?.dispose();
            // Capture list of starting candidates so we don't auto forward them later.
            await this.setInitialCandidates();
            // Need to check the setting again, since it may have changed while we waited for the initial candidates to be set.
            if (this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_FORWARD_SETTING)) {
                this.candidateListener = this._register(this.remoteExplorerService.tunnelModel.onCandidatesChanged(this.handleCandidateUpdate, this));
            }
        }
        async setInitialCandidates() {
            let startingCandidates = this.remoteExplorerService.tunnelModel.candidatesOrUndefined;
            if (!startingCandidates) {
                await new Promise(resolve => this.remoteExplorerService.tunnelModel.onCandidatesChanged(() => resolve()));
                startingCandidates = this.remoteExplorerService.tunnelModel.candidates;
            }
            for (const value of startingCandidates) {
                this.initialCandidates.add((0, tunnelModel_1.makeAddress)(value.host, value.port));
            }
            this.logService.debug(`ForwardedPorts: (ProcForwarding) Initial candidates set to ${startingCandidates.map(candidate => candidate.port).join(', ')}`);
        }
        async forwardCandidates() {
            let attributes;
            const allTunnels = [];
            this.logService.trace(`ForwardedPorts: (ProcForwarding) Attempting to forward ${this.remoteExplorerService.tunnelModel.candidates.length} candidates`);
            for (const value of this.remoteExplorerService.tunnelModel.candidates) {
                if (!value.detail) {
                    this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} missing detail`);
                    continue;
                }
                if (!attributes) {
                    attributes = await this.remoteExplorerService.tunnelModel.getAttributes(this.remoteExplorerService.tunnelModel.candidates);
                }
                const portAttributes = attributes?.get(value.port);
                const address = (0, tunnelModel_1.makeAddress)(value.host, value.port);
                if (this.initialCandidates.has(address) && (portAttributes?.onAutoForward === undefined)) {
                    continue;
                }
                if (this.notifiedOnly.has(address) || this.autoForwarded.has(address)) {
                    continue;
                }
                const alreadyForwarded = (0, tunnelModel_1.mapHasAddressLocalhostOrAllInterfaces)(this.remoteExplorerService.tunnelModel.forwarded, value.host, value.port);
                if ((0, tunnelModel_1.mapHasAddressLocalhostOrAllInterfaces)(this.remoteExplorerService.tunnelModel.detected, value.host, value.port)) {
                    continue;
                }
                if (portAttributes?.onAutoForward === tunnelModel_1.OnPortForward.Ignore) {
                    this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} is ignored`);
                    continue;
                }
                const forwarded = await this.remoteExplorerService.forward({ remote: value, source: tunnelModel_1.AutoTunnelSource }, portAttributes ?? null);
                if (!alreadyForwarded && forwarded) {
                    this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} has been forwarded`);
                    this.autoForwarded.add(address);
                }
                else if (forwarded) {
                    this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} has been notified`);
                    this.notifiedOnly.add(address);
                }
                if (forwarded && (typeof forwarded !== 'string')) {
                    allTunnels.push(forwarded);
                }
            }
            this.logService.trace(`ForwardedPorts: (ProcForwarding) Forwarded ${allTunnels.length} candidates`);
            if (allTunnels.length === 0) {
                return undefined;
            }
            return allTunnels;
        }
        async handleCandidateUpdate(removed) {
            const removedPorts = [];
            let autoForwarded;
            if (this.unforwardOnly) {
                autoForwarded = new Map();
                for (const entry of this.remoteExplorerService.tunnelModel.forwarded.entries()) {
                    if (entry[1].source.source === tunnelModel_1.TunnelSource.Auto) {
                        autoForwarded.set(entry[0], entry[1]);
                    }
                }
            }
            else {
                autoForwarded = new Map(this.autoForwarded.entries());
            }
            for (const removedPort of removed) {
                const key = removedPort[0];
                let value = removedPort[1];
                const forwardedValue = (0, tunnelModel_1.mapHasAddressLocalhostOrAllInterfaces)(autoForwarded, value.host, value.port);
                if (forwardedValue) {
                    if (typeof forwardedValue === 'string') {
                        this.autoForwarded.delete(key);
                    }
                    else {
                        value = { host: forwardedValue.remoteHost, port: forwardedValue.remotePort };
                    }
                    await this.remoteExplorerService.close(value, tunnelModel_1.TunnelCloseReason.AutoForwardEnd);
                    removedPorts.push(value.port);
                }
                else if (this.notifiedOnly.has(key)) {
                    this.notifiedOnly.delete(key);
                    removedPorts.push(value.port);
                }
                else if (this.initialCandidates.has(key)) {
                    this.initialCandidates.delete(key);
                }
            }
            if (this.unforwardOnly) {
                return;
            }
            if (removedPorts.length > 0) {
                await this.notifier.hide(removedPorts);
            }
            const tunnels = await this.forwardCandidates();
            if (tunnels) {
                await this.notifier.doAction(tunnels);
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRXhwbG9yZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9yZW1vdGUvYnJvd3Nlci9yZW1vdGVFeHBsb3Jlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBb0NhLFFBQUEsVUFBVSxHQUFHLHVCQUF1QixDQUFDO0lBRTNDLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsc0JBQVU7UUFLakQsWUFDc0MsaUJBQXFDLEVBQzNCLGtCQUFnRCxFQUN0RCxxQkFBNkMsRUFDckQsYUFBNkIsRUFDM0IsZUFBaUMsRUFDaEMsZ0JBQW1DO1lBRXZFLEtBQUssRUFBRSxDQUFDO1lBUDZCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDM0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE4QjtZQUN0RCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQ3JELGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUMzQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDaEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUd2RSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFRLENBQUMsRUFBRSxDQUFpQixrQkFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLHNDQUFjLEVBQUU7Z0JBQy9HLE9BQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxvR0FBb0csRUFBRSxXQUFXLDhCQUFpQixDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUMvTixDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxzSEFBc0gsRUFBRSxXQUFXLDhCQUFpQixDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQ3BNLENBQUMsQ0FBQyxDQUFD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