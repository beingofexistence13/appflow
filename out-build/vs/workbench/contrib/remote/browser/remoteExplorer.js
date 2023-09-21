var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls!vs/workbench/contrib/remote/browser/remoteExplorer", "vs/base/common/lifecycle", "vs/workbench/common/views", "vs/workbench/services/remote/common/remoteExplorerService", "vs/workbench/services/remote/common/tunnelModel", "vs/workbench/contrib/remote/browser/tunnelView", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/environment/common/environmentService", "vs/platform/registry/common/platform", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/contrib/remote/browser/urlFinder", "vs/base/common/severity", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/platform", "vs/platform/tunnel/common/tunnel", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/services/activity/common/activity", "vs/workbench/contrib/remote/browser/remoteIcons", "vs/base/common/event", "vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService", "vs/workbench/services/host/browser/host", "vs/platform/configuration/common/configurationRegistry", "vs/platform/log/common/log", "vs/workbench/services/configuration/common/configuration"], function (require, exports, nls, lifecycle_1, views_1, remoteExplorerService_1, tunnelModel_1, tunnelView_1, contextkey_1, environmentService_1, platform_1, statusbar_1, urlFinder_1, severity_1, notification_1, opener_1, terminal_1, debug_1, remoteAgentService_1, platform_2, tunnel_1, descriptors_1, viewPaneContainer_1, activity_1, remoteIcons_1, event_1, externalUriOpenerService_1, host_1, configurationRegistry_1, log_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$yvb = exports.$xvb = exports.$wvb = exports.$vvb = void 0;
    exports.$vvb = 'workbench.view.remote';
    let $wvb = class $wvb extends lifecycle_1.$kc {
        constructor(h, j, m, r, s, t) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.r = r;
            this.s = s;
            this.t = t;
            this.B(platform_1.$8m.as(views_1.Extensions.ViewsRegistry).registerViewWelcomeContent(remoteExplorerService_1.$vsb, {
                content: this.j.remoteAuthority ? nls.localize(0, null, `command:${tunnelView_1.ForwardPortAction.INLINE_ID}`)
                    : nls.localize(1, null, `command:${tunnelView_1.ForwardPortAction.INLINE_ID}`),
            }));
            this.y();
            this.w();
        }
        async u() {
            return platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                id: remoteExplorerService_1.$wsb,
                title: { value: nls.localize(2, null), original: 'Ports' },
                icon: remoteIcons_1.$fvb,
                ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, [remoteExplorerService_1.$wsb, { mergeViewWithContainerWhenSingleView: true }]),
                storageId: remoteExplorerService_1.$wsb,
                hideIfEmpty: true,
                order: 5
            }, 1 /* ViewContainerLocation.Panel */);
        }
        async w() {
            if (this.c) {
                this.c.dispose();
                this.c = undefined;
            }
            const viewEnabled = !!tunnelModel_1.$jJ.getValue(this.h);
            if (viewEnabled) {
                const viewContainer = await this.u();
                const tunnelPanelDescriptor = new tunnelView_1.$tvb(new tunnelView_1.$rvb(this.m, this.r), this.j);
                const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
                if (viewContainer) {
                    this.m.enablePortsFeatures();
                    viewsRegistry.registerViews([tunnelPanelDescriptor], viewContainer);
                }
            }
            else {
                this.c = this.h.onDidChangeContext(e => {
                    if (e.affectsSome(new Set(tunnelModel_1.$jJ.keys()))) {
                        this.w();
                    }
                });
            }
        }
        y() {
            const disposable = platform_1.$8m.as(views_1.Extensions.ViewsRegistry).onViewsRegistered(e => {
                if (e.find(view => view.views.find(viewDescriptor => viewDescriptor.id === remoteExplorerService_1.$vsb))) {
                    this.B(event_1.Event.debounce(this.m.tunnelModel.onForwardPort, (_last, e) => e, 50)(() => {
                        this.z();
                        this.C();
                    }));
                    this.B(event_1.Event.debounce(this.m.tunnelModel.onClosePort, (_last, e) => e, 50)(() => {
                        this.z();
                        this.C();
                    }));
                    this.z();
                    this.C();
                    disposable.dispose();
                }
            });
        }
        async z() {
            this.f?.dispose();
            if (this.m.tunnelModel.forwarded.size > 0) {
                this.f = this.s.showViewActivity(remoteExplorerService_1.$vsb, {
                    badge: new activity_1.$IV(this.m.tunnelModel.forwarded.size, n => n === 1 ? nls.localize(3, null) : nls.localize(4, null, n))
                });
            }
        }
        C() {
            if (!this.g) {
                this.B(this.g = this.t.addEntry(this.D, 'status.forwardedPorts', 0 /* StatusbarAlignment.LEFT */, 40));
            }
            else {
                this.g.update(this.D);
            }
        }
        get D() {
            let tooltip;
            const count = this.m.tunnelModel.forwarded.size + this.m.tunnelModel.detected.size;
            const text = `${count}`;
            if (count === 0) {
                tooltip = nls.localize(5, null);
            }
            else {
                const allTunnels = Array.from(this.m.tunnelModel.forwarded.values());
                allTunnels.push(...Array.from(this.m.tunnelModel.detected.values()));
                tooltip = nls.localize(6, null, allTunnels.map(forwarded => forwarded.remotePort).join(', '));
            }
            return {
                name: nls.localize(7, null),
                text: `$(radio-tower) ${text}`,
                ariaLabel: tooltip,
                tooltip,
                command: `${remoteExplorerService_1.$vsb}.focus`
            };
        }
    };
    exports.$wvb = $wvb;
    exports.$wvb = $wvb = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, environmentService_1.$hJ),
        __param(2, remoteExplorerService_1.$tsb),
        __param(3, tunnel_1.$Wz),
        __param(4, activity_1.$HV),
        __param(5, statusbar_1.$6$)
    ], $wvb);
    let $xvb = class $xvb {
        constructor(c, d) {
            this.c = c;
            this.d = d;
            if (!this.c.tunnelModel.environmentTunnelsSet) {
                event_1.Event.once(this.c.tunnelModel.onEnvironmentTunnelsSet)(async () => {
                    await this.f();
                });
            }
            else {
                this.f();
            }
        }
        async f() {
            this.d.trace('ForwardedPorts: Doing first restore.');
            return this.c.restore();
        }
    };
    exports.$xvb = $xvb;
    exports.$xvb = $xvb = __decorate([
        __param(0, remoteExplorerService_1.$tsb),
        __param(1, log_1.$5i)
    ], $xvb);
    let $yvb = class $yvb extends lifecycle_1.$kc {
        constructor(terminalService, notificationService, openerService, externalOpenerService, remoteExplorerService, environmentService, contextKeyService, configurationService, debugService, remoteAgentService, tunnelService, hostService, logService) {
            super();
            if (!environmentService.remoteAuthority) {
                return;
            }
            configurationService.whenRemoteConfigurationLoaded().then(() => remoteAgentService.getEnvironment()).then(environment => {
                if (environment?.os !== 3 /* OperatingSystem.Linux */) {
                    platform_1.$8m.as(configurationRegistry_1.$an.Configuration)
                        .registerDefaultConfigurations([{ overrides: { 'remote.autoForwardPortsSource': remoteExplorerService_1.$Asb } }]);
                    this.B(new OutputAutomaticPortForwarding(terminalService, notificationService, openerService, externalOpenerService, remoteExplorerService, configurationService, debugService, tunnelService, hostService, logService, contextKeyService, () => false));
                }
                else {
                    const useProc = () => (configurationService.getValue(remoteExplorerService_1.$ysb) === remoteExplorerService_1.$zsb);
                    if (useProc()) {
                        this.B(new ProcAutomaticPortForwarding(false, configurationService, remoteExplorerService, notificationService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService));
                    }
                    else if (configurationService.getValue(remoteExplorerService_1.$ysb) === remoteExplorerService_1.$Bsb) {
                        this.B(new ProcAutomaticPortForwarding(true, configurationService, remoteExplorerService, notificationService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService));
                    }
                    this.B(new OutputAutomaticPortForwarding(terminalService, notificationService, openerService, externalOpenerService, remoteExplorerService, configurationService, debugService, tunnelService, hostService, logService, contextKeyService, useProc));
                }
            });
        }
    };
    exports.$yvb = $yvb;
    exports.$yvb = $yvb = __decorate([
        __param(0, terminal_1.$Mib),
        __param(1, notification_1.$Yu),
        __param(2, opener_1.$NT),
        __param(3, externalUriOpenerService_1.$flb),
        __param(4, remoteExplorerService_1.$tsb),
        __param(5, environmentService_1.$hJ),
        __param(6, contextkey_1.$3i),
        __param(7, configuration_1.$mE),
        __param(8, debug_1.$nH),
        __param(9, remoteAgentService_1.$jm),
        __param(10, tunnel_1.$Wz),
        __param(11, host_1.$VT),
        __param(12, log_1.$5i)
    ], $yvb);
    class OnAutoForwardedAction extends lifecycle_1.$kc {
        static { this.f = 5000; } // milliseconds
        constructor(r, s, t, u, w, y, z, C) {
            super();
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.m = new Set();
            this.c = new Date();
            this.c.setFullYear(this.c.getFullYear() - 1);
        }
        async doAction(tunnels) {
            this.z.trace(`ForwardedPorts: (OnAutoForwardedAction) Starting action for ${tunnels[0]?.tunnelRemotePort}`);
            this.j = tunnels;
            const tunnel = await this.F();
            this.z.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose ${tunnel?.tunnelRemotePort}`);
            if (tunnel) {
                const allAttributes = await this.s.tunnelModel.getAttributes([{ port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost }]);
                const attributes = allAttributes?.get(tunnel.tunnelRemotePort)?.onAutoForward;
                this.z.trace(`ForwardedPorts: (OnAutoForwardedAction) onAutoForward action is ${attributes}`);
                switch (attributes) {
                    case tunnelModel_1.OnPortForward.OpenBrowserOnce: {
                        if (this.m.has(tunnel.localAddress)) {
                            break;
                        }
                        this.m.add(tunnel.localAddress);
                        // Intentionally do not break so that the open browser path can be run.
                    }
                    case tunnelModel_1.OnPortForward.OpenBrowser: {
                        const address = (0, tunnelModel_1.$pJ)(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        await tunnelView_1.OpenPortInBrowserAction.run(this.s.tunnelModel, this.t, address);
                        break;
                    }
                    case tunnelModel_1.OnPortForward.OpenPreview: {
                        const address = (0, tunnelModel_1.$pJ)(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        await tunnelView_1.OpenPortInPreviewAction.run(this.s.tunnelModel, this.t, this.u, address);
                        break;
                    }
                    case tunnelModel_1.OnPortForward.Silent: break;
                    default: {
                        const elapsed = new Date().getTime() - this.c.getTime();
                        this.z.trace(`ForwardedPorts: (OnAutoForwardedAction) time elapsed since last notification ${elapsed} ms`);
                        if (elapsed > OnAutoForwardedAction.f) {
                            await this.I(tunnel);
                        }
                    }
                }
            }
        }
        hide(removedPorts) {
            if (this.j) {
                this.j = this.j.filter(value => !removedPorts.includes(value.tunnelRemotePort));
            }
            if (this.h && removedPorts.indexOf(this.h) >= 0) {
                this.g?.close();
            }
        }
        async F() {
            this.z.trace(`ForwardedPorts: (OnAutoForwardedAction) Starting heuristic delay`);
            if (!this.j || this.j.length === 0) {
                return;
            }
            this.j = this.j.sort((a, b) => a.tunnelRemotePort - b.tunnelRemotePort);
            const firstTunnel = this.j.shift();
            // Heuristic.
            if (firstTunnel.tunnelRemotePort % 1000 === 0) {
                this.z.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose tunnel because % 1000: ${firstTunnel.tunnelRemotePort}`);
                this.D = firstTunnel;
                return firstTunnel;
                // 9229 is the node inspect port
            }
            else if (firstTunnel.tunnelRemotePort < 10000 && firstTunnel.tunnelRemotePort !== 9229) {
                this.z.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose tunnel because < 10000: ${firstTunnel.tunnelRemotePort}`);
                this.D = firstTunnel;
                return firstTunnel;
            }
            this.z.trace(`ForwardedPorts: (OnAutoForwardedAction) Waiting for "better" tunnel than ${firstTunnel.tunnelRemotePort}`);
            this.D = undefined;
            return new Promise(resolve => {
                setTimeout(() => {
                    if (this.D) {
                        resolve(undefined);
                    }
                    else if (this.j?.includes(firstTunnel)) {
                        resolve(firstTunnel);
                    }
                    else {
                        resolve(undefined);
                    }
                }, 3000);
            });
        }
        G(tunnel) {
            return nls.localize(8, null, tunnel.tunnelRemotePort);
        }
        H() {
            return nls.localize(9, null, `command:${tunnelView_1.$svb.ID}.focus`);
        }
        async I(tunnel) {
            if (!await this.y.hadLastFocus()) {
                return;
            }
            this.g?.close();
            let message = this.G(tunnel);
            const choices = [this.L(tunnel)];
            if (!platform_2.$o || tunnelView_1.$qvb.getValue(this.C)) {
                choices.push(this.M(tunnel));
            }
            if ((tunnel.tunnelLocalPort !== tunnel.tunnelRemotePort) && this.w.canElevate && this.w.isPortPrivileged(tunnel.tunnelRemotePort)) {
                // Privileged ports are not on Windows, so it's safe to use "superuser"
                message += nls.localize(10, null, tunnel.tunnelRemotePort);
                choices.unshift(this.N(tunnel));
            }
            if (tunnel.privacy === tunnel_1.TunnelPrivacyId.Private && platform_2.$o && this.w.canChangePrivacy) {
                choices.push(this.J(tunnel));
            }
            message += this.H();
            this.g = this.r.prompt(severity_1.default.Info, message, choices, { neverShowAgain: { id: 'remote.tunnelsView.autoForwardNeverShow', isSecondary: true } });
            this.h = tunnel.tunnelRemotePort;
            this.c = new Date();
            this.g.onDidClose(() => {
                this.g = undefined;
                this.h = undefined;
            });
        }
        J(tunnel) {
            return {
                label: nls.localize(11, null),
                run: async () => {
                    const oldTunnelDetails = (0, tunnelModel_1.$oJ)(this.s.tunnelModel.forwarded, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                    await this.s.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }, tunnelModel_1.TunnelCloseReason.Other);
                    return this.s.forward({
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
        L(tunnel) {
            const address = (0, tunnelModel_1.$pJ)(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
            return {
                label: tunnelView_1.OpenPortInBrowserAction.LABEL,
                run: () => tunnelView_1.OpenPortInBrowserAction.run(this.s.tunnelModel, this.t, address)
            };
        }
        M(tunnel) {
            const address = (0, tunnelModel_1.$pJ)(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
            return {
                label: tunnelView_1.OpenPortInPreviewAction.LABEL,
                run: () => tunnelView_1.OpenPortInPreviewAction.run(this.s.tunnelModel, this.t, this.u, address)
            };
        }
        N(tunnel) {
            return {
                // Privileged ports are not on Windows, so it's ok to stick to just "sudo".
                label: nls.localize(12, null, tunnel.tunnelRemotePort),
                run: async () => {
                    await this.s.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }, tunnelModel_1.TunnelCloseReason.Other);
                    const newTunnel = await this.s.forward({
                        remote: { host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort },
                        local: tunnel.tunnelRemotePort,
                        elevateIfNeeded: true,
                        source: tunnelModel_1.$mJ
                    });
                    if (!newTunnel || (typeof newTunnel === 'string')) {
                        return;
                    }
                    this.g?.close();
                    this.h = newTunnel.tunnelRemotePort;
                    this.g = this.r.prompt(severity_1.default.Info, this.G(newTunnel) + this.H(), [this.L(newTunnel), this.M(tunnel)], { neverShowAgain: { id: 'remote.tunnelsView.autoForwardNeverShow', isSecondary: true } });
                    this.g.onDidClose(() => {
                        this.g = undefined;
                        this.h = undefined;
                    });
                }
            };
        }
    }
    class OutputAutomaticPortForwarding extends lifecycle_1.$kc {
        constructor(h, notificationService, openerService, externalOpenerService, j, m, r, tunnelService, hostService, logService, contextKeyService, privilegedOnly) {
            super();
            this.h = h;
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.externalOpenerService = externalOpenerService;
            this.j = j;
            this.m = m;
            this.r = r;
            this.tunnelService = tunnelService;
            this.hostService = hostService;
            this.logService = logService;
            this.contextKeyService = contextKeyService;
            this.privilegedOnly = privilegedOnly;
            this.g = new OnAutoForwardedAction(notificationService, j, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService);
            this.B(m.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration(remoteExplorerService_1.$xsb)) {
                    this.s();
                }
            }));
            this.c = this.B(this.j.onEnabledPortsFeatures(() => {
                this.s();
            }));
            this.s();
            if (m.getValue(remoteExplorerService_1.$ysb) === remoteExplorerService_1.$Bsb) {
                this.B(this.tunnelService.onTunnelClosed(tunnel => this.g.hide([tunnel.port])));
            }
        }
        s() {
            if (this.m.getValue(remoteExplorerService_1.$xsb)) {
                this.t();
            }
            else {
                this.u();
            }
        }
        t() {
            if (!this.f && !this.j.portsFeaturesEnabled) {
                return;
            }
            this.c?.dispose();
            this.f = this.B(new urlFinder_1.$uvb(this.h, this.r));
            this.B(this.f.onDidMatchLocalUrl(async (localUrl) => {
                if ((0, tunnelModel_1.$oJ)(this.j.tunnelModel.detected, localUrl.host, localUrl.port)) {
                    return;
                }
                const attributes = (await this.j.tunnelModel.getAttributes([localUrl]))?.get(localUrl.port);
                if (attributes?.onAutoForward === tunnelModel_1.OnPortForward.Ignore) {
                    return;
                }
                if (this.privilegedOnly() && !this.tunnelService.isPortPrivileged(localUrl.port)) {
                    return;
                }
                const forwarded = await this.j.forward({ remote: localUrl, source: tunnelModel_1.$mJ }, attributes ?? null);
                if (forwarded && (typeof forwarded !== 'string')) {
                    this.g.doAction([forwarded]);
                }
            }));
        }
        u() {
            if (this.f) {
                this.f.dispose();
                this.f = undefined;
            }
        }
    }
    class ProcAutomaticPortForwarding extends lifecycle_1.$kc {
        constructor(r, s, remoteExplorerService, notificationService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService) {
            super();
            this.r = r;
            this.s = s;
            this.remoteExplorerService = remoteExplorerService;
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.externalOpenerService = externalOpenerService;
            this.tunnelService = tunnelService;
            this.hostService = hostService;
            this.logService = logService;
            this.contextKeyService = contextKeyService;
            this.f = new Set();
            this.g = new Set();
            this.j = new Set();
            this.h = new OnAutoForwardedAction(notificationService, remoteExplorerService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService);
            this.t();
        }
        async t() {
            if (!this.remoteExplorerService.tunnelModel.environmentTunnelsSet) {
                await new Promise(resolve => this.remoteExplorerService.tunnelModel.onEnvironmentTunnelsSet(() => resolve()));
            }
            this.B(this.s.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration(remoteExplorerService_1.$xsb)) {
                    await this.u();
                }
            }));
            this.m = this.B(this.remoteExplorerService.onEnabledPortsFeatures(async () => {
                await this.u();
            }));
            this.u();
        }
        async u() {
            if (this.s.getValue(remoteExplorerService_1.$xsb)) {
                await this.y();
            }
            else {
                this.w();
            }
        }
        w() {
            if (this.c) {
                this.c.dispose();
                this.c = undefined;
            }
        }
        async y() {
            if (this.c || !this.remoteExplorerService.portsFeaturesEnabled) {
                return;
            }
            this.m?.dispose();
            // Capture list of starting candidates so we don't auto forward them later.
            await this.z();
            // Need to check the setting again, since it may have changed while we waited for the initial candidates to be set.
            if (this.s.getValue(remoteExplorerService_1.$xsb)) {
                this.c = this.B(this.remoteExplorerService.tunnelModel.onCandidatesChanged(this.D, this));
            }
        }
        async z() {
            let startingCandidates = this.remoteExplorerService.tunnelModel.candidatesOrUndefined;
            if (!startingCandidates) {
                await new Promise(resolve => this.remoteExplorerService.tunnelModel.onCandidatesChanged(() => resolve()));
                startingCandidates = this.remoteExplorerService.tunnelModel.candidates;
            }
            for (const value of startingCandidates) {
                this.j.add((0, tunnelModel_1.$pJ)(value.host, value.port));
            }
            this.logService.debug(`ForwardedPorts: (ProcForwarding) Initial candidates set to ${startingCandidates.map(candidate => candidate.port).join(', ')}`);
        }
        async C() {
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
                const address = (0, tunnelModel_1.$pJ)(value.host, value.port);
                if (this.j.has(address) && (portAttributes?.onAutoForward === undefined)) {
                    continue;
                }
                if (this.g.has(address) || this.f.has(address)) {
                    continue;
                }
                const alreadyForwarded = (0, tunnelModel_1.$oJ)(this.remoteExplorerService.tunnelModel.forwarded, value.host, value.port);
                if ((0, tunnelModel_1.$oJ)(this.remoteExplorerService.tunnelModel.detected, value.host, value.port)) {
                    continue;
                }
                if (portAttributes?.onAutoForward === tunnelModel_1.OnPortForward.Ignore) {
                    this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} is ignored`);
                    continue;
                }
                const forwarded = await this.remoteExplorerService.forward({ remote: value, source: tunnelModel_1.$mJ }, portAttributes ?? null);
                if (!alreadyForwarded && forwarded) {
                    this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} has been forwarded`);
                    this.f.add(address);
                }
                else if (forwarded) {
                    this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} has been notified`);
                    this.g.add(address);
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
        async D(removed) {
            const removedPorts = [];
            let autoForwarded;
            if (this.r) {
                autoForwarded = new Map();
                for (const entry of this.remoteExplorerService.tunnelModel.forwarded.entries()) {
                    if (entry[1].source.source === tunnelModel_1.TunnelSource.Auto) {
                        autoForwarded.set(entry[0], entry[1]);
                    }
                }
            }
            else {
                autoForwarded = new Map(this.f.entries());
            }
            for (const removedPort of removed) {
                const key = removedPort[0];
                let value = removedPort[1];
                const forwardedValue = (0, tunnelModel_1.$oJ)(autoForwarded, value.host, value.port);
                if (forwardedValue) {
                    if (typeof forwardedValue === 'string') {
                        this.f.delete(key);
                    }
                    else {
                        value = { host: forwardedValue.remoteHost, port: forwardedValue.remotePort };
                    }
                    await this.remoteExplorerService.close(value, tunnelModel_1.TunnelCloseReason.AutoForwardEnd);
                    removedPorts.push(value.port);
                }
                else if (this.g.has(key)) {
                    this.g.delete(key);
                    removedPorts.push(value.port);
                }
                else if (this.j.has(key)) {
                    this.j.delete(key);
                }
            }
            if (this.r) {
                return;
            }
            if (removedPorts.length > 0) {
                await this.h.hide(removedPorts);
            }
            const tunnels = await this.C();
            if (tunnels) {
                await this.h.doAction(tunnels);
            }
        }
    }
});
//# sourceMappingURL=remoteExplorer.js.map