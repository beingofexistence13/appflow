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
define(["require", "exports", "vs/nls!vs/workbench/contrib/remote/browser/remoteIndicator", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/label/common/label", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/base/common/network", "vs/workbench/services/extensions/common/extensions", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/environment/browser/environmentService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/host/browser/host", "vs/base/common/platform", "vs/base/common/functional", "vs/base/common/strings", "vs/platform/workspace/common/workspace", "vs/platform/remote/common/remoteHosts", "vs/platform/workspace/common/virtualWorkspace", "vs/base/common/iconLabels", "vs/platform/log/common/log", "vs/workbench/browser/actions/windowActions", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/contrib/extensions/common/extensions", "vs/base/common/htmlContent", "vs/workbench/common/contextkeys", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/telemetry/common/telemetry", "vs/platform/product/common/productService", "vs/base/browser/event", "vs/platform/extensions/common/extensions", "vs/base/common/cancellation", "vs/base/common/themables", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/opener/common/opener", "vs/base/common/uri"], function (require, exports, nls, remoteAgentService_1, async_1, event_1, lifecycle_1, actions_1, statusbar_1, label_1, contextkey_1, commands_1, network_1, extensions_1, quickInput_1, environmentService_1, remoteAuthorityResolver_1, host_1, platform_1, functional_1, strings_1, workspace_1, remoteHosts_1, virtualWorkspace_1, iconLabels_1, log_1, windowActions_1, extensionManagement_1, extensions_2, htmlContent_1, contextkeys_1, panecomposite_1, telemetry_1, productService_1, event_2, extensions_3, cancellation_1, themables_1, extensionsIcons_1, opener_1, uri_1) {
    "use strict";
    var $5Xb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5Xb = void 0;
    let $5Xb = class $5Xb extends lifecycle_1.$kc {
        static { $5Xb_1 = this; }
        static { this.b = 'workbench.action.remote.showMenu'; }
        static { this.c = 'workbench.action.remote.close'; }
        static { this.f = !platform_1.$o; } // web does not have a "Close Remote" command
        static { this.g = 'workbench.action.remote.extensions'; }
        static { this.h = 40; }
        static { this.j = 60 * 1000; }
        static { this.m = 10 * 1000; }
        constructor(M, N, O, P, Q, R, S, U, W, X, Y, Z, $, ab, bb, cb, db, eb) {
            super();
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
            this.db = db;
            this.eb = eb;
            this.r = this.B(this.Q.createMenu(actions_1.$Ru.StatusBarWindowIndicatorMenu, this.P)); // to be removed once migration completed
            this.s = this.B(this.Q.createMenu(actions_1.$Ru.StatusBarRemoteIndicatorMenu, this.P));
            this.u = this.N.remoteAuthority;
            this.w = undefined;
            this.y = undefined;
            this.z = undefined;
            this.C = new contextkey_1.$2i('remoteConnectionState', '').bindTo(this.P);
            this.D = undefined;
            this.F = undefined;
            this.G = Object.create(null);
            this.I = false;
            this.J = this.B(new event_1.$fd());
            this.L = this.J.event;
            const remoteExtensionTips = { ...this.cb.remoteExtensionTips, ...this.cb.virtualWorkspaceExtensionTips };
            this.H = Object.values(remoteExtensionTips).filter(value => value.startEntry !== undefined).map(value => {
                return {
                    id: value.extensionId,
                    installed: false,
                    friendlyName: value.friendlyName,
                    isPlatformCompatible: false,
                    dependencies: [],
                    helpLink: value.startEntry?.helpLink ?? '',
                    startConnectLabel: value.startEntry?.startConnectLabel ?? '',
                    startCommand: value.startEntry?.startCommand ?? '',
                    priority: value.startEntry?.priority ?? 10,
                    supportedPlatforms: value.supportedPlatforms
                };
            });
            this.H.sort((ext1, ext2) => ext1.priority - ext2.priority);
            // Set initial connection state
            if (this.u) {
                this.y = 'initializing';
                this.C.set(this.y);
            }
            else {
                this.ib();
            }
            this.fb();
            this.gb();
            this.jb();
            this.rb();
        }
        fb() {
            const category = { value: nls.localize(0, null), original: 'Remote' };
            // Show Remote Menu
            const that = this;
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: $5Xb_1.b,
                        category,
                        title: { value: nls.localize(1, null), original: 'Show Remote Menu' },
                        f1: true,
                        keybinding: {
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 45 /* KeyCode.KeyO */,
                        }
                    });
                    this.run = () => that.xb();
                }
            });
            // Close Remote Connection
            if ($5Xb_1.f) {
                (0, actions_1.$Xu)(class extends actions_1.$Wu {
                    constructor() {
                        super({
                            id: $5Xb_1.c,
                            category,
                            title: { value: nls.localize(2, null), original: 'Close Remote Connection' },
                            f1: true,
                            precondition: contextkey_1.$Ii.or(contextkeys_1.$Vcb, contextkeys_1.$Wcb)
                        });
                        this.run = () => that.Y.openWindow({ forceReuseWindow: true, remoteAuthority: null });
                    }
                });
                if (this.u) {
                    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
                        group: '6_close',
                        command: {
                            id: $5Xb_1.c,
                            title: nls.localize(3, null)
                        },
                        order: 3.5
                    });
                }
            }
            if (this.ab.isEnabled()) {
                (0, actions_1.$Xu)(class extends actions_1.$Wu {
                    constructor() {
                        super({
                            id: $5Xb_1.g,
                            category,
                            title: { value: nls.localize(4, null), original: 'Install Remote Development Extensions' },
                            f1: true
                        });
                        this.run = (accessor, input) => {
                            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
                            return paneCompositeService.openPaneComposite(extensions_2.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true).then(viewlet => {
                                if (viewlet) {
                                    (viewlet?.getViewPaneContainer()).search(`@recommended:remotes`);
                                    viewlet.focus();
                                }
                            });
                        };
                    }
                });
            }
        }
        gb() {
            // Menu changes
            const updateRemoteActions = () => {
                this.t = undefined;
                this.rb();
            };
            this.B(this.r.onDidChange(updateRemoteActions));
            this.B(this.s.onDidChange(updateRemoteActions));
            // Update indicator when formatter changes as it may have an impact on the remote label
            this.B(this.O.onDidChangeFormatters(() => this.rb()));
            // Update based on remote indicator changes if any
            const remoteIndicator = this.N.options?.windowIndicator;
            if (remoteIndicator && remoteIndicator.onDidChange) {
                this.B(remoteIndicator.onDidChange(() => this.rb()));
            }
            // Listen to changes of the connection
            if (this.u) {
                const connection = this.W.getConnection();
                if (connection) {
                    this.B(connection.onDidStateChange((e) => {
                        switch (e.type) {
                            case 0 /* PersistentConnectionEventType.ConnectionLost */:
                            case 2 /* PersistentConnectionEventType.ReconnectionRunning */:
                            case 1 /* PersistentConnectionEventType.ReconnectionWait */:
                                this.kb('reconnecting');
                                break;
                            case 3 /* PersistentConnectionEventType.ReconnectionPermanentFailure */:
                                this.kb('disconnected');
                                break;
                            case 4 /* PersistentConnectionEventType.ConnectionGain */:
                                this.kb('connected');
                                break;
                        }
                    }));
                }
            }
            else {
                this.B(this.Z.onDidChangeWorkbenchState(() => {
                    this.ib();
                    this.rb();
                }));
            }
            // Online / Offline changes (web only)
            if (platform_1.$o) {
                this.B(event_1.Event.any(this.B(new event_2.$9P(window, 'online')).event, this.B(new event_2.$9P(window, 'offline')).event)(() => this.nb(navigator.onLine ? 'online' : 'offline')));
            }
            this.B(this.U.onDidChangeExtensions(async (result) => {
                for (const ext of result.added) {
                    const index = this.H.findIndex(value => extensions_3.$Vl.equals(value.id, ext.identifier));
                    if (index > -1) {
                        this.H[index].installed = true;
                    }
                }
            }));
            this.B(this.db.onDidUninstallExtension(async (result) => {
                const index = this.H.findIndex(value => extensions_3.$Vl.equals(value.id, result.identifier.id));
                if (index > -1) {
                    this.H[index].installed = false;
                }
            }));
        }
        async hb() {
            if (this.I) {
                return;
            }
            const currentPlatform = (0, platform_1.$h)(platform_1.$t);
            for (let i = 0; i < this.H.length; i++) {
                const extensionId = this.H[i].id;
                const supportedPlatforms = this.H[i].supportedPlatforms;
                const isInstalled = (await this.db.getInstalled()).find(value => extensions_3.$Vl.equals(value.identifier.id, extensionId)) ? true : false;
                this.H[i].installed = isInstalled;
                if (isInstalled) {
                    this.H[i].isPlatformCompatible = true;
                }
                else if (supportedPlatforms && !supportedPlatforms.includes(currentPlatform)) {
                    this.H[i].isPlatformCompatible = false;
                }
                else {
                    this.H[i].isPlatformCompatible = true;
                }
            }
            this.I = true;
            this.J.fire();
            this.rb();
        }
        ib() {
            this.w = (0, virtualWorkspace_1.$uJ)(this.Z.getWorkspace());
        }
        async jb() {
            await this.U.whenInstalledExtensionsRegistered();
            const remoteAuthority = this.u;
            if (remoteAuthority) {
                // Try to resolve the authority to figure out connection state
                (async () => {
                    try {
                        const { authority } = await this.X.resolveAuthority(remoteAuthority);
                        this.z = authority.connectionToken;
                        this.kb('connected');
                    }
                    catch (error) {
                        this.kb('disconnected');
                    }
                })();
            }
            this.rb();
            this.hb();
        }
        kb(newState) {
            if (this.y !== newState) {
                this.y = newState;
                // simplify context key which doesn't support `connecting`
                if (this.y === 'reconnecting') {
                    this.C.set('disconnected');
                }
                else {
                    this.C.set(this.y);
                }
                // indicate status
                this.rb();
                // start measuring connection latency once connected
                if (newState === 'connected') {
                    this.lb();
                }
            }
        }
        lb() {
            if (!this.u || // only when having a remote connection
                this.F // already scheduled
            ) {
                return;
            }
            this.F = this.B(new async_1.$Sg(() => this.mb(), $5Xb_1.j));
            this.F.schedule($5Xb_1.m);
        }
        async mb() {
            // Measure latency if we are online
            // but only when the window has focus to prevent constantly
            // waking up the connection to the remote
            if (this.Y.hasFocus && this.D !== 'offline') {
                const measurement = await remoteAgentService_1.$km.measure(this.W);
                if (measurement) {
                    if (measurement.high) {
                        this.nb('high-latency');
                    }
                    else if (this.D === 'high-latency') {
                        this.nb('online');
                    }
                }
            }
            this.F?.schedule();
        }
        nb(newState) {
            if (this.D !== newState) {
                const oldState = this.D;
                this.D = newState;
                if (newState === 'high-latency') {
                    this.$.warn(`Remote network connection appears to have high latency (${remoteAgentService_1.$km.latency?.current?.toFixed(2)}ms last, ${remoteAgentService_1.$km.latency?.average?.toFixed(2)}ms average)`);
                }
                if (this.z) {
                    if (newState === 'online' && oldState === 'high-latency') {
                        this.ob(this.z, 'good');
                    }
                    else if (newState === 'high-latency' && oldState === 'online') {
                        this.ob(this.z, 'poor');
                    }
                }
                // update status
                this.rb();
            }
        }
        ob(connectionToken, connectionHealth) {
            this.bb.publicLog2('remoteConnectionHealth', {
                remoteName: (0, remoteHosts_1.$Pk)(this.u),
                reconnectionToken: connectionToken,
                connectionHealth
            });
        }
        pb(group) {
            if (!group.match(/^(remote|virtualfs)_(\d\d)_(([a-z][a-z0-9+.-]*)_(.*))$/)) {
                if (!this.G[group]) {
                    this.G[group] = true;
                    this.$.warn(`Invalid group name used in "statusBar/remoteIndicator" menu contribution: ${group}. Entries ignored. Expected format: 'remote_$ORDER_$REMOTENAME_$GROUPING or 'virtualfs_$ORDER_$FILESCHEME_$GROUPING.`);
                }
                return false;
            }
            return true;
        }
        qb(doNotUseCache) {
            if (!this.t || doNotUseCache) {
                this.t = this.s.getActions().filter(a => this.pb(a[0])).concat(this.r.getActions());
            }
            return this.t;
        }
        rb() {
            // Remote Indicator: show if provided via options, e.g. by the web embedder API
            const remoteIndicator = this.N.options?.windowIndicator;
            if (remoteIndicator) {
                let remoteIndicatorLabel = remoteIndicator.label.trim();
                if (!remoteIndicatorLabel.startsWith('$(')) {
                    remoteIndicatorLabel = `$(remote) ${remoteIndicatorLabel}`; // ensure the indicator has a codicon
                }
                this.sb((0, strings_1.$se)(remoteIndicatorLabel, $5Xb_1.h), remoteIndicator.tooltip, remoteIndicator.command);
                return;
            }
            // Show for remote windows on the desktop
            if (this.u) {
                const hostLabel = this.O.getHostLabel(network_1.Schemas.vscodeRemote, this.u) || this.u;
                switch (this.y) {
                    case 'initializing':
                        this.sb(nls.localize(5, null), nls.localize(6, null), undefined, true /* progress */);
                        break;
                    case 'reconnecting':
                        this.sb(`${nls.localize(7, null, (0, strings_1.$se)(hostLabel, $5Xb_1.h))}`, undefined, undefined, true /* progress */);
                        break;
                    case 'disconnected':
                        this.sb(`$(alert) ${nls.localize(8, null, (0, strings_1.$se)(hostLabel, $5Xb_1.h))}`);
                        break;
                    default: {
                        const tooltip = new htmlContent_1.$Xj('', { isTrusted: true, supportThemeIcons: true });
                        const hostNameTooltip = this.O.getHostTooltip(network_1.Schemas.vscodeRemote, this.u);
                        if (hostNameTooltip) {
                            tooltip.appendMarkdown(hostNameTooltip);
                        }
                        else {
                            tooltip.appendText(nls.localize(9, null, hostLabel));
                        }
                        this.sb(`$(remote) ${(0, strings_1.$se)(hostLabel, $5Xb_1.h)}`, tooltip);
                    }
                }
                return;
            }
            // Show when in a virtual workspace
            if (this.w) {
                // Workspace with label: indicate editing source
                const workspaceLabel = this.O.getHostLabel(this.w.scheme, this.w.authority);
                if (workspaceLabel) {
                    const tooltip = new htmlContent_1.$Xj('', { isTrusted: true, supportThemeIcons: true });
                    const hostNameTooltip = this.O.getHostTooltip(this.w.scheme, this.w.authority);
                    if (hostNameTooltip) {
                        tooltip.appendMarkdown(hostNameTooltip);
                    }
                    else {
                        tooltip.appendText(nls.localize(10, null, workspaceLabel));
                    }
                    if (!platform_1.$o || this.u) {
                        tooltip.appendMarkdown('\n\n');
                        tooltip.appendMarkdown(nls.localize(11, null, `command:${extensions_2.$1fb}`));
                    }
                    this.sb(`$(remote) ${(0, strings_1.$se)(workspaceLabel, $5Xb_1.h)}`, tooltip);
                    return;
                }
            }
            this.sb(`$(remote)`, nls.localize(12, null));
            return;
        }
        sb(initialText, initialTooltip, command, showProgress) {
            const { text, tooltip, ariaLabel } = this.tb(initialText, initialTooltip, showProgress);
            const properties = {
                name: nls.localize(13, null),
                kind: this.D === 'offline' ? 'offline' : 'remote',
                ariaLabel,
                text,
                showProgress,
                tooltip,
                command: command ?? $5Xb_1.b
            };
            if (this.n) {
                this.n.update(properties);
            }
            else {
                this.n = this.M.addEntry(properties, 'status.host', 0 /* StatusbarAlignment.LEFT */, Number.MAX_VALUE /* first entry */);
            }
        }
        tb(initialText, initialTooltip, showProgress) {
            let text = initialText;
            let tooltip = initialTooltip;
            let ariaLabel = (0, iconLabels_1.$Uj)(text);
            function textWithAlert() {
                // `initialText` can have a codicon in the beginning that already
                // indicates some kind of status, or we may have been asked to
                // show progress, where a spinning codicon appears. we only want
                // to replace with an alert icon for when a normal remote indicator
                // is shown.
                if (!showProgress && initialText.startsWith('$(remote)')) {
                    return initialText.replace('$(remote)', '$(alert)');
                }
                return initialText;
            }
            switch (this.D) {
                case 'offline': {
                    const offlineMessage = nls.localize(14, null);
                    text = textWithAlert();
                    tooltip = this.ub(tooltip, offlineMessage);
                    ariaLabel = `${ariaLabel}, ${offlineMessage}`;
                    break;
                }
                case 'high-latency':
                    text = textWithAlert();
                    tooltip = this.ub(tooltip, nls.localize(15, null, remoteAgentService_1.$km.latency?.current?.toFixed(2), remoteAgentService_1.$km.latency?.average?.toFixed(2)));
                    break;
            }
            return { text, tooltip, ariaLabel };
        }
        ub(tooltip, line) {
            let markdownTooltip;
            if (typeof tooltip === 'string') {
                markdownTooltip = new htmlContent_1.$Xj(tooltip, { isTrusted: true, supportThemeIcons: true });
            }
            else {
                markdownTooltip = tooltip ?? new htmlContent_1.$Xj('', { isTrusted: true, supportThemeIcons: true });
            }
            if (markdownTooltip.value.length > 0) {
                markdownTooltip.appendMarkdown('\n\n');
            }
            markdownTooltip.appendMarkdown(line);
            return markdownTooltip;
        }
        async vb(extensionId) {
            const galleryExtension = (await this.ab.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
            await this.db.installFromGallery(galleryExtension, {
                isMachineScoped: false,
                donotIncludePackAndDependencies: false,
                context: { [extensionManagement_1.$Pn]: true }
            });
        }
        async wb(extensionId, startCommand) {
            // check to ensure the extension is installed
            await (0, async_1.$Yg)(async () => {
                const ext = await this.U.getExtension(extensionId);
                if (!ext) {
                    throw Error('Failed to find installed remote extension');
                }
                return ext;
            }, 300, 10);
            this.S.executeCommand(startCommand);
            this.bb.publicLog2('workbenchActionExecuted', {
                id: 'remoteInstallAndRun',
                detail: extensionId,
                from: 'remote indicator'
            });
        }
        xb() {
            const getCategoryLabel = (action) => {
                if (action.item.category) {
                    return typeof action.item.category === 'string' ? action.item.category : action.item.category.value;
                }
                return undefined;
            };
            const matchCurrentRemote = () => {
                if (this.u) {
                    return new RegExp(`^remote_\\d\\d_${(0, remoteHosts_1.$Pk)(this.u)}_`);
                }
                else if (this.w) {
                    return new RegExp(`^virtualfs_\\d\\d_${this.w.scheme}_`);
                }
                return undefined;
            };
            const computeItems = () => {
                let actionGroups = this.qb(true);
                const items = [];
                const currentRemoteMatcher = matchCurrentRemote();
                if (currentRemoteMatcher) {
                    // commands for the current remote go first
                    actionGroups = actionGroups.sort((g1, g2) => {
                        const isCurrentRemote1 = currentRemoteMatcher.test(g1[0]);
                        const isCurrentRemote2 = currentRemoteMatcher.test(g2[0]);
                        if (isCurrentRemote1 !== isCurrentRemote2) {
                            return isCurrentRemote1 ? -1 : 1;
                        }
                        // legacy indicator commands go last
                        if (g1[0] !== '' && g2[0] === '') {
                            return -1;
                        }
                        else if (g1[0] === '' && g2[0] !== '') {
                            return 1;
                        }
                        return g1[0].localeCompare(g2[0]);
                    });
                }
                let lastCategoryName = undefined;
                for (const actionGroup of actionGroups) {
                    let hasGroupCategory = false;
                    for (const action of actionGroup[1]) {
                        if (action instanceof actions_1.$Vu) {
                            if (!hasGroupCategory) {
                                const category = getCategoryLabel(action);
                                if (category !== lastCategoryName) {
                                    items.push({ type: 'separator', label: category });
                                    lastCategoryName = category;
                                }
                                hasGroupCategory = true;
                            }
                            const label = typeof action.item.title === 'string' ? action.item.title : action.item.title.value;
                            items.push({
                                type: 'item',
                                id: action.item.id,
                                label
                            });
                        }
                    }
                }
                if (this.ab.isEnabled() && this.I) {
                    const notInstalledItems = [];
                    for (const metadata of this.H) {
                        if (!metadata.installed && metadata.isPlatformCompatible) {
                            // Create Install QuickPick with a help link
                            const label = metadata.startConnectLabel;
                            const buttons = [{
                                    iconClass: themables_1.ThemeIcon.asClassName(extensionsIcons_1.$hhb),
                                    tooltip: nls.localize(16, null)
                                }];
                            notInstalledItems.push({ type: 'item', id: metadata.id, label: label, buttons: buttons });
                        }
                    }
                    items.push({
                        type: 'separator', label: nls.localize(17, null)
                    });
                    items.push(...notInstalledItems);
                }
                items.push({
                    type: 'separator'
                });
                const entriesBeforeConfig = items.length;
                if ($5Xb_1.f) {
                    if (this.u) {
                        items.push({
                            type: 'item',
                            id: $5Xb_1.c,
                            label: nls.localize(18, null)
                        });
                        if (this.y === 'disconnected') {
                            items.push({
                                type: 'item',
                                id: windowActions_1.$2tb.ID,
                                label: nls.localize(19, null)
                            });
                        }
                    }
                    else if (this.w) {
                        items.push({
                            type: 'item',
                            id: $5Xb_1.c,
                            label: nls.localize(20, null)
                        });
                    }
                }
                if (items.length === entriesBeforeConfig) {
                    items.pop(); // remove the separator again
                }
                return items;
            };
            const quickPick = this.R.createQuickPick();
            quickPick.placeholder = nls.localize(21, null);
            quickPick.items = computeItems();
            quickPick.sortByLabel = false;
            quickPick.canSelectMany = false;
            (0, functional_1.$bb)(quickPick.onDidAccept)((async (_) => {
                const selectedItems = quickPick.selectedItems;
                if (selectedItems.length === 1) {
                    const commandId = selectedItems[0].id;
                    const remoteExtension = this.H.find(value => extensions_3.$Vl.equals(value.id, commandId));
                    if (remoteExtension) {
                        quickPick.items = [];
                        quickPick.busy = true;
                        quickPick.placeholder = nls.localize(22, null);
                        await this.vb(remoteExtension.id);
                        quickPick.hide();
                        await this.wb(remoteExtension.id, remoteExtension.startCommand);
                    }
                    else {
                        this.bb.publicLog2('workbenchActionExecuted', {
                            id: commandId,
                            from: 'remote indicator'
                        });
                        this.S.executeCommand(commandId);
                        quickPick.hide();
                    }
                }
            }));
            (0, functional_1.$bb)(quickPick.onDidTriggerItemButton)(async (e) => {
                const remoteExtension = this.H.find(value => extensions_3.$Vl.equals(value.id, e.item.id));
                if (remoteExtension) {
                    await this.eb.open(uri_1.URI.parse(remoteExtension.helpLink));
                }
            });
            // refresh the items when actions change
            const legacyItemUpdater = this.r.onDidChange(() => quickPick.items = computeItems());
            quickPick.onDidHide(legacyItemUpdater.dispose);
            const itemUpdater = this.s.onDidChange(() => quickPick.items = computeItems());
            quickPick.onDidHide(itemUpdater.dispose);
            if (!this.I) {
                quickPick.busy = true;
                this.B(this.L(() => {
                    // If quick pick is open, update the quick pick items after initialization.
                    quickPick.busy = false;
                    quickPick.items = computeItems();
                }));
            }
            quickPick.show();
        }
    };
    exports.$5Xb = $5Xb;
    exports.$5Xb = $5Xb = $5Xb_1 = __decorate([
        __param(0, statusbar_1.$6$),
        __param(1, environmentService_1.$LT),
        __param(2, label_1.$Vz),
        __param(3, contextkey_1.$3i),
        __param(4, actions_1.$Su),
        __param(5, quickInput_1.$Gq),
        __param(6, commands_1.$Fr),
        __param(7, extensions_1.$MF),
        __param(8, remoteAgentService_1.$jm),
        __param(9, remoteAuthorityResolver_1.$Jk),
        __param(10, host_1.$VT),
        __param(11, workspace_1.$Kh),
        __param(12, log_1.$5i),
        __param(13, extensionManagement_1.$Zn),
        __param(14, telemetry_1.$9k),
        __param(15, productService_1.$kj),
        __param(16, extensionManagement_1.$2n),
        __param(17, opener_1.$NT)
    ], $5Xb);
});
//# sourceMappingURL=remoteIndicator.js.map