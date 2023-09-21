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
define(["require", "exports", "vs/nls", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/label/common/label", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/base/common/network", "vs/workbench/services/extensions/common/extensions", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/environment/browser/environmentService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/host/browser/host", "vs/base/common/platform", "vs/base/common/functional", "vs/base/common/strings", "vs/platform/workspace/common/workspace", "vs/platform/remote/common/remoteHosts", "vs/platform/workspace/common/virtualWorkspace", "vs/base/common/iconLabels", "vs/platform/log/common/log", "vs/workbench/browser/actions/windowActions", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/contrib/extensions/common/extensions", "vs/base/common/htmlContent", "vs/workbench/common/contextkeys", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/telemetry/common/telemetry", "vs/platform/product/common/productService", "vs/base/browser/event", "vs/platform/extensions/common/extensions", "vs/base/common/cancellation", "vs/base/common/themables", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/opener/common/opener", "vs/base/common/uri"], function (require, exports, nls, remoteAgentService_1, async_1, event_1, lifecycle_1, actions_1, statusbar_1, label_1, contextkey_1, commands_1, network_1, extensions_1, quickInput_1, environmentService_1, remoteAuthorityResolver_1, host_1, platform_1, functional_1, strings_1, workspace_1, remoteHosts_1, virtualWorkspace_1, iconLabels_1, log_1, windowActions_1, extensionManagement_1, extensions_2, htmlContent_1, contextkeys_1, panecomposite_1, telemetry_1, productService_1, event_2, extensions_3, cancellation_1, themables_1, extensionsIcons_1, opener_1, uri_1) {
    "use strict";
    var RemoteStatusIndicator_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteStatusIndicator = void 0;
    let RemoteStatusIndicator = class RemoteStatusIndicator extends lifecycle_1.Disposable {
        static { RemoteStatusIndicator_1 = this; }
        static { this.REMOTE_ACTIONS_COMMAND_ID = 'workbench.action.remote.showMenu'; }
        static { this.CLOSE_REMOTE_COMMAND_ID = 'workbench.action.remote.close'; }
        static { this.SHOW_CLOSE_REMOTE_COMMAND_ID = !platform_1.isWeb; } // web does not have a "Close Remote" command
        static { this.INSTALL_REMOTE_EXTENSIONS_ID = 'workbench.action.remote.extensions'; }
        static { this.REMOTE_STATUS_LABEL_MAX_LENGTH = 40; }
        static { this.REMOTE_CONNECTION_LATENCY_SCHEDULER_DELAY = 60 * 1000; }
        static { this.REMOTE_CONNECTION_LATENCY_SCHEDULER_FIRST_RUN_DELAY = 10 * 1000; }
        constructor(statusbarService, environmentService, labelService, contextKeyService, menuService, quickInputService, commandService, extensionService, remoteAgentService, remoteAuthorityResolverService, hostService, workspaceContextService, logService, extensionGalleryService, telemetryService, productService, extensionManagementService, openerService) {
            super();
            this.statusbarService = statusbarService;
            this.environmentService = environmentService;
            this.labelService = labelService;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this.quickInputService = quickInputService;
            this.commandService = commandService;
            this.extensionService = extensionService;
            this.remoteAgentService = remoteAgentService;
            this.remoteAuthorityResolverService = remoteAuthorityResolverService;
            this.hostService = hostService;
            this.workspaceContextService = workspaceContextService;
            this.logService = logService;
            this.extensionGalleryService = extensionGalleryService;
            this.telemetryService = telemetryService;
            this.productService = productService;
            this.extensionManagementService = extensionManagementService;
            this.openerService = openerService;
            this.legacyIndicatorMenu = this._register(this.menuService.createMenu(actions_1.MenuId.StatusBarWindowIndicatorMenu, this.contextKeyService)); // to be removed once migration completed
            this.remoteIndicatorMenu = this._register(this.menuService.createMenu(actions_1.MenuId.StatusBarRemoteIndicatorMenu, this.contextKeyService));
            this.remoteAuthority = this.environmentService.remoteAuthority;
            this.virtualWorkspaceLocation = undefined;
            this.connectionState = undefined;
            this.connectionToken = undefined;
            this.connectionStateContextKey = new contextkey_1.RawContextKey('remoteConnectionState', '').bindTo(this.contextKeyService);
            this.networkState = undefined;
            this.measureNetworkConnectionLatencyScheduler = undefined;
            this.loggedInvalidGroupNames = Object.create(null);
            this.remoteMetadataInitialized = false;
            this._onDidChangeEntries = this._register(new event_1.Emitter());
            this.onDidChangeEntries = this._onDidChangeEntries.event;
            const remoteExtensionTips = { ...this.productService.remoteExtensionTips, ...this.productService.virtualWorkspaceExtensionTips };
            this.remoteExtensionMetadata = Object.values(remoteExtensionTips).filter(value => value.startEntry !== undefined).map(value => {
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
            this.remoteExtensionMetadata.sort((ext1, ext2) => ext1.priority - ext2.priority);
            // Set initial connection state
            if (this.remoteAuthority) {
                this.connectionState = 'initializing';
                this.connectionStateContextKey.set(this.connectionState);
            }
            else {
                this.updateVirtualWorkspaceLocation();
            }
            this.registerActions();
            this.registerListeners();
            this.updateWhenInstalledExtensionsRegistered();
            this.updateRemoteStatusIndicator();
        }
        registerActions() {
            const category = { value: nls.localize('remote.category', "Remote"), original: 'Remote' };
            // Show Remote Menu
            const that = this;
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: RemoteStatusIndicator_1.REMOTE_ACTIONS_COMMAND_ID,
                        category,
                        title: { value: nls.localize('remote.showMenu', "Show Remote Menu"), original: 'Show Remote Menu' },
                        f1: true,
                        keybinding: {
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 45 /* KeyCode.KeyO */,
                        }
                    });
                    this.run = () => that.showRemoteMenu();
                }
            });
            // Close Remote Connection
            if (RemoteStatusIndicator_1.SHOW_CLOSE_REMOTE_COMMAND_ID) {
                (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: RemoteStatusIndicator_1.CLOSE_REMOTE_COMMAND_ID,
                            category,
                            title: { value: nls.localize('remote.close', "Close Remote Connection"), original: 'Close Remote Connection' },
                            f1: true,
                            precondition: contextkey_1.ContextKeyExpr.or(contextkeys_1.RemoteNameContext, contextkeys_1.VirtualWorkspaceContext)
                        });
                        this.run = () => that.hostService.openWindow({ forceReuseWindow: true, remoteAuthority: null });
                    }
                });
                if (this.remoteAuthority) {
                    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
                        group: '6_close',
                        command: {
                            id: RemoteStatusIndicator_1.CLOSE_REMOTE_COMMAND_ID,
                            title: nls.localize({ key: 'miCloseRemote', comment: ['&& denotes a mnemonic'] }, "Close Re&&mote Connection")
                        },
                        order: 3.5
                    });
                }
            }
            if (this.extensionGalleryService.isEnabled()) {
                (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: RemoteStatusIndicator_1.INSTALL_REMOTE_EXTENSIONS_ID,
                            category,
                            title: { value: nls.localize('remote.install', "Install Remote Development Extensions"), original: 'Install Remote Development Extensions' },
                            f1: true
                        });
                        this.run = (accessor, input) => {
                            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
                            return paneCompositeService.openPaneComposite(extensions_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true).then(viewlet => {
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
        registerListeners() {
            // Menu changes
            const updateRemoteActions = () => {
                this.remoteMenuActionsGroups = undefined;
                this.updateRemoteStatusIndicator();
            };
            this._register(this.legacyIndicatorMenu.onDidChange(updateRemoteActions));
            this._register(this.remoteIndicatorMenu.onDidChange(updateRemoteActions));
            // Update indicator when formatter changes as it may have an impact on the remote label
            this._register(this.labelService.onDidChangeFormatters(() => this.updateRemoteStatusIndicator()));
            // Update based on remote indicator changes if any
            const remoteIndicator = this.environmentService.options?.windowIndicator;
            if (remoteIndicator && remoteIndicator.onDidChange) {
                this._register(remoteIndicator.onDidChange(() => this.updateRemoteStatusIndicator()));
            }
            // Listen to changes of the connection
            if (this.remoteAuthority) {
                const connection = this.remoteAgentService.getConnection();
                if (connection) {
                    this._register(connection.onDidStateChange((e) => {
                        switch (e.type) {
                            case 0 /* PersistentConnectionEventType.ConnectionLost */:
                            case 2 /* PersistentConnectionEventType.ReconnectionRunning */:
                            case 1 /* PersistentConnectionEventType.ReconnectionWait */:
                                this.setConnectionState('reconnecting');
                                break;
                            case 3 /* PersistentConnectionEventType.ReconnectionPermanentFailure */:
                                this.setConnectionState('disconnected');
                                break;
                            case 4 /* PersistentConnectionEventType.ConnectionGain */:
                                this.setConnectionState('connected');
                                break;
                        }
                    }));
                }
            }
            else {
                this._register(this.workspaceContextService.onDidChangeWorkbenchState(() => {
                    this.updateVirtualWorkspaceLocation();
                    this.updateRemoteStatusIndicator();
                }));
            }
            // Online / Offline changes (web only)
            if (platform_1.isWeb) {
                this._register(event_1.Event.any(this._register(new event_2.DomEmitter(window, 'online')).event, this._register(new event_2.DomEmitter(window, 'offline')).event)(() => this.setNetworkState(navigator.onLine ? 'online' : 'offline')));
            }
            this._register(this.extensionService.onDidChangeExtensions(async (result) => {
                for (const ext of result.added) {
                    const index = this.remoteExtensionMetadata.findIndex(value => extensions_3.ExtensionIdentifier.equals(value.id, ext.identifier));
                    if (index > -1) {
                        this.remoteExtensionMetadata[index].installed = true;
                    }
                }
            }));
            this._register(this.extensionManagementService.onDidUninstallExtension(async (result) => {
                const index = this.remoteExtensionMetadata.findIndex(value => extensions_3.ExtensionIdentifier.equals(value.id, result.identifier.id));
                if (index > -1) {
                    this.remoteExtensionMetadata[index].installed = false;
                }
            }));
        }
        async initializeRemoteMetadata() {
            if (this.remoteMetadataInitialized) {
                return;
            }
            const currentPlatform = (0, platform_1.PlatformToString)(platform_1.platform);
            for (let i = 0; i < this.remoteExtensionMetadata.length; i++) {
                const extensionId = this.remoteExtensionMetadata[i].id;
                const supportedPlatforms = this.remoteExtensionMetadata[i].supportedPlatforms;
                const isInstalled = (await this.extensionManagementService.getInstalled()).find(value => extensions_3.ExtensionIdentifier.equals(value.identifier.id, extensionId)) ? true : false;
                this.remoteExtensionMetadata[i].installed = isInstalled;
                if (isInstalled) {
                    this.remoteExtensionMetadata[i].isPlatformCompatible = true;
                }
                else if (supportedPlatforms && !supportedPlatforms.includes(currentPlatform)) {
                    this.remoteExtensionMetadata[i].isPlatformCompatible = false;
                }
                else {
                    this.remoteExtensionMetadata[i].isPlatformCompatible = true;
                }
            }
            this.remoteMetadataInitialized = true;
            this._onDidChangeEntries.fire();
            this.updateRemoteStatusIndicator();
        }
        updateVirtualWorkspaceLocation() {
            this.virtualWorkspaceLocation = (0, virtualWorkspace_1.getVirtualWorkspaceLocation)(this.workspaceContextService.getWorkspace());
        }
        async updateWhenInstalledExtensionsRegistered() {
            await this.extensionService.whenInstalledExtensionsRegistered();
            const remoteAuthority = this.remoteAuthority;
            if (remoteAuthority) {
                // Try to resolve the authority to figure out connection state
                (async () => {
                    try {
                        const { authority } = await this.remoteAuthorityResolverService.resolveAuthority(remoteAuthority);
                        this.connectionToken = authority.connectionToken;
                        this.setConnectionState('connected');
                    }
                    catch (error) {
                        this.setConnectionState('disconnected');
                    }
                })();
            }
            this.updateRemoteStatusIndicator();
            this.initializeRemoteMetadata();
        }
        setConnectionState(newState) {
            if (this.connectionState !== newState) {
                this.connectionState = newState;
                // simplify context key which doesn't support `connecting`
                if (this.connectionState === 'reconnecting') {
                    this.connectionStateContextKey.set('disconnected');
                }
                else {
                    this.connectionStateContextKey.set(this.connectionState);
                }
                // indicate status
                this.updateRemoteStatusIndicator();
                // start measuring connection latency once connected
                if (newState === 'connected') {
                    this.scheduleMeasureNetworkConnectionLatency();
                }
            }
        }
        scheduleMeasureNetworkConnectionLatency() {
            if (!this.remoteAuthority || // only when having a remote connection
                this.measureNetworkConnectionLatencyScheduler // already scheduled
            ) {
                return;
            }
            this.measureNetworkConnectionLatencyScheduler = this._register(new async_1.RunOnceScheduler(() => this.measureNetworkConnectionLatency(), RemoteStatusIndicator_1.REMOTE_CONNECTION_LATENCY_SCHEDULER_DELAY));
            this.measureNetworkConnectionLatencyScheduler.schedule(RemoteStatusIndicator_1.REMOTE_CONNECTION_LATENCY_SCHEDULER_FIRST_RUN_DELAY);
        }
        async measureNetworkConnectionLatency() {
            // Measure latency if we are online
            // but only when the window has focus to prevent constantly
            // waking up the connection to the remote
            if (this.hostService.hasFocus && this.networkState !== 'offline') {
                const measurement = await remoteAgentService_1.remoteConnectionLatencyMeasurer.measure(this.remoteAgentService);
                if (measurement) {
                    if (measurement.high) {
                        this.setNetworkState('high-latency');
                    }
                    else if (this.networkState === 'high-latency') {
                        this.setNetworkState('online');
                    }
                }
            }
            this.measureNetworkConnectionLatencyScheduler?.schedule();
        }
        setNetworkState(newState) {
            if (this.networkState !== newState) {
                const oldState = this.networkState;
                this.networkState = newState;
                if (newState === 'high-latency') {
                    this.logService.warn(`Remote network connection appears to have high latency (${remoteAgentService_1.remoteConnectionLatencyMeasurer.latency?.current?.toFixed(2)}ms last, ${remoteAgentService_1.remoteConnectionLatencyMeasurer.latency?.average?.toFixed(2)}ms average)`);
                }
                if (this.connectionToken) {
                    if (newState === 'online' && oldState === 'high-latency') {
                        this.logNetworkConnectionHealthTelemetry(this.connectionToken, 'good');
                    }
                    else if (newState === 'high-latency' && oldState === 'online') {
                        this.logNetworkConnectionHealthTelemetry(this.connectionToken, 'poor');
                    }
                }
                // update status
                this.updateRemoteStatusIndicator();
            }
        }
        logNetworkConnectionHealthTelemetry(connectionToken, connectionHealth) {
            this.telemetryService.publicLog2('remoteConnectionHealth', {
                remoteName: (0, remoteHosts_1.getRemoteName)(this.remoteAuthority),
                reconnectionToken: connectionToken,
                connectionHealth
            });
        }
        validatedGroup(group) {
            if (!group.match(/^(remote|virtualfs)_(\d\d)_(([a-z][a-z0-9+.-]*)_(.*))$/)) {
                if (!this.loggedInvalidGroupNames[group]) {
                    this.loggedInvalidGroupNames[group] = true;
                    this.logService.warn(`Invalid group name used in "statusBar/remoteIndicator" menu contribution: ${group}. Entries ignored. Expected format: 'remote_$ORDER_$REMOTENAME_$GROUPING or 'virtualfs_$ORDER_$FILESCHEME_$GROUPING.`);
                }
                return false;
            }
            return true;
        }
        getRemoteMenuActions(doNotUseCache) {
            if (!this.remoteMenuActionsGroups || doNotUseCache) {
                this.remoteMenuActionsGroups = this.remoteIndicatorMenu.getActions().filter(a => this.validatedGroup(a[0])).concat(this.legacyIndicatorMenu.getActions());
            }
            return this.remoteMenuActionsGroups;
        }
        updateRemoteStatusIndicator() {
            // Remote Indicator: show if provided via options, e.g. by the web embedder API
            const remoteIndicator = this.environmentService.options?.windowIndicator;
            if (remoteIndicator) {
                let remoteIndicatorLabel = remoteIndicator.label.trim();
                if (!remoteIndicatorLabel.startsWith('$(')) {
                    remoteIndicatorLabel = `$(remote) ${remoteIndicatorLabel}`; // ensure the indicator has a codicon
                }
                this.renderRemoteStatusIndicator((0, strings_1.truncate)(remoteIndicatorLabel, RemoteStatusIndicator_1.REMOTE_STATUS_LABEL_MAX_LENGTH), remoteIndicator.tooltip, remoteIndicator.command);
                return;
            }
            // Show for remote windows on the desktop
            if (this.remoteAuthority) {
                const hostLabel = this.labelService.getHostLabel(network_1.Schemas.vscodeRemote, this.remoteAuthority) || this.remoteAuthority;
                switch (this.connectionState) {
                    case 'initializing':
                        this.renderRemoteStatusIndicator(nls.localize('host.open', "Opening Remote..."), nls.localize('host.open', "Opening Remote..."), undefined, true /* progress */);
                        break;
                    case 'reconnecting':
                        this.renderRemoteStatusIndicator(`${nls.localize('host.reconnecting', "Reconnecting to {0}...", (0, strings_1.truncate)(hostLabel, RemoteStatusIndicator_1.REMOTE_STATUS_LABEL_MAX_LENGTH))}`, undefined, undefined, true /* progress */);
                        break;
                    case 'disconnected':
                        this.renderRemoteStatusIndicator(`$(alert) ${nls.localize('disconnectedFrom', "Disconnected from {0}", (0, strings_1.truncate)(hostLabel, RemoteStatusIndicator_1.REMOTE_STATUS_LABEL_MAX_LENGTH))}`);
                        break;
                    default: {
                        const tooltip = new htmlContent_1.MarkdownString('', { isTrusted: true, supportThemeIcons: true });
                        const hostNameTooltip = this.labelService.getHostTooltip(network_1.Schemas.vscodeRemote, this.remoteAuthority);
                        if (hostNameTooltip) {
                            tooltip.appendMarkdown(hostNameTooltip);
                        }
                        else {
                            tooltip.appendText(nls.localize({ key: 'host.tooltip', comment: ['{0} is a remote host name, e.g. Dev Container'] }, "Editing on {0}", hostLabel));
                        }
                        this.renderRemoteStatusIndicator(`$(remote) ${(0, strings_1.truncate)(hostLabel, RemoteStatusIndicator_1.REMOTE_STATUS_LABEL_MAX_LENGTH)}`, tooltip);
                    }
                }
                return;
            }
            // Show when in a virtual workspace
            if (this.virtualWorkspaceLocation) {
                // Workspace with label: indicate editing source
                const workspaceLabel = this.labelService.getHostLabel(this.virtualWorkspaceLocation.scheme, this.virtualWorkspaceLocation.authority);
                if (workspaceLabel) {
                    const tooltip = new htmlContent_1.MarkdownString('', { isTrusted: true, supportThemeIcons: true });
                    const hostNameTooltip = this.labelService.getHostTooltip(this.virtualWorkspaceLocation.scheme, this.virtualWorkspaceLocation.authority);
                    if (hostNameTooltip) {
                        tooltip.appendMarkdown(hostNameTooltip);
                    }
                    else {
                        tooltip.appendText(nls.localize({ key: 'workspace.tooltip', comment: ['{0} is a remote workspace name, e.g. GitHub'] }, "Editing on {0}", workspaceLabel));
                    }
                    if (!platform_1.isWeb || this.remoteAuthority) {
                        tooltip.appendMarkdown('\n\n');
                        tooltip.appendMarkdown(nls.localize({ key: 'workspace.tooltip2', comment: ['[features are not available]({1}) is a link. Only translate `features are not available`. Do not change brackets and parentheses or {0}'] }, "Some [features are not available]({0}) for resources located on a virtual file system.", `command:${extensions_2.LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`));
                    }
                    this.renderRemoteStatusIndicator(`$(remote) ${(0, strings_1.truncate)(workspaceLabel, RemoteStatusIndicator_1.REMOTE_STATUS_LABEL_MAX_LENGTH)}`, tooltip);
                    return;
                }
            }
            this.renderRemoteStatusIndicator(`$(remote)`, nls.localize('noHost.tooltip', "Open a Remote Window"));
            return;
        }
        renderRemoteStatusIndicator(initialText, initialTooltip, command, showProgress) {
            const { text, tooltip, ariaLabel } = this.withNetworkStatus(initialText, initialTooltip, showProgress);
            const properties = {
                name: nls.localize('remoteHost', "Remote Host"),
                kind: this.networkState === 'offline' ? 'offline' : 'remote',
                ariaLabel,
                text,
                showProgress,
                tooltip,
                command: command ?? RemoteStatusIndicator_1.REMOTE_ACTIONS_COMMAND_ID
            };
            if (this.remoteStatusEntry) {
                this.remoteStatusEntry.update(properties);
            }
            else {
                this.remoteStatusEntry = this.statusbarService.addEntry(properties, 'status.host', 0 /* StatusbarAlignment.LEFT */, Number.MAX_VALUE /* first entry */);
            }
        }
        withNetworkStatus(initialText, initialTooltip, showProgress) {
            let text = initialText;
            let tooltip = initialTooltip;
            let ariaLabel = (0, iconLabels_1.getCodiconAriaLabel)(text);
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
            switch (this.networkState) {
                case 'offline': {
                    const offlineMessage = nls.localize('networkStatusOfflineTooltip', "Network appears to be offline, certain features might be unavailable.");
                    text = textWithAlert();
                    tooltip = this.appendTooltipLine(tooltip, offlineMessage);
                    ariaLabel = `${ariaLabel}, ${offlineMessage}`;
                    break;
                }
                case 'high-latency':
                    text = textWithAlert();
                    tooltip = this.appendTooltipLine(tooltip, nls.localize('networkStatusHighLatencyTooltip', "Network appears to have high latency ({0}ms last, {1}ms average), certain features may be slow to respond.", remoteAgentService_1.remoteConnectionLatencyMeasurer.latency?.current?.toFixed(2), remoteAgentService_1.remoteConnectionLatencyMeasurer.latency?.average?.toFixed(2)));
                    break;
            }
            return { text, tooltip, ariaLabel };
        }
        appendTooltipLine(tooltip, line) {
            let markdownTooltip;
            if (typeof tooltip === 'string') {
                markdownTooltip = new htmlContent_1.MarkdownString(tooltip, { isTrusted: true, supportThemeIcons: true });
            }
            else {
                markdownTooltip = tooltip ?? new htmlContent_1.MarkdownString('', { isTrusted: true, supportThemeIcons: true });
            }
            if (markdownTooltip.value.length > 0) {
                markdownTooltip.appendMarkdown('\n\n');
            }
            markdownTooltip.appendMarkdown(line);
            return markdownTooltip;
        }
        async installExtension(extensionId) {
            const galleryExtension = (await this.extensionGalleryService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
            await this.extensionManagementService.installFromGallery(galleryExtension, {
                isMachineScoped: false,
                donotIncludePackAndDependencies: false,
                context: { [extensionManagement_1.EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true }
            });
        }
        async runRemoteStartCommand(extensionId, startCommand) {
            // check to ensure the extension is installed
            await (0, async_1.retry)(async () => {
                const ext = await this.extensionService.getExtension(extensionId);
                if (!ext) {
                    throw Error('Failed to find installed remote extension');
                }
                return ext;
            }, 300, 10);
            this.commandService.executeCommand(startCommand);
            this.telemetryService.publicLog2('workbenchActionExecuted', {
                id: 'remoteInstallAndRun',
                detail: extensionId,
                from: 'remote indicator'
            });
        }
        showRemoteMenu() {
            const getCategoryLabel = (action) => {
                if (action.item.category) {
                    return typeof action.item.category === 'string' ? action.item.category : action.item.category.value;
                }
                return undefined;
            };
            const matchCurrentRemote = () => {
                if (this.remoteAuthority) {
                    return new RegExp(`^remote_\\d\\d_${(0, remoteHosts_1.getRemoteName)(this.remoteAuthority)}_`);
                }
                else if (this.virtualWorkspaceLocation) {
                    return new RegExp(`^virtualfs_\\d\\d_${this.virtualWorkspaceLocation.scheme}_`);
                }
                return undefined;
            };
            const computeItems = () => {
                let actionGroups = this.getRemoteMenuActions(true);
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
                        if (action instanceof actions_1.MenuItemAction) {
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
                if (this.extensionGalleryService.isEnabled() && this.remoteMetadataInitialized) {
                    const notInstalledItems = [];
                    for (const metadata of this.remoteExtensionMetadata) {
                        if (!metadata.installed && metadata.isPlatformCompatible) {
                            // Create Install QuickPick with a help link
                            const label = metadata.startConnectLabel;
                            const buttons = [{
                                    iconClass: themables_1.ThemeIcon.asClassName(extensionsIcons_1.infoIcon),
                                    tooltip: nls.localize('remote.startActions.help', "Learn More")
                                }];
                            notInstalledItems.push({ type: 'item', id: metadata.id, label: label, buttons: buttons });
                        }
                    }
                    items.push({
                        type: 'separator', label: nls.localize('remote.startActions.install', 'Install')
                    });
                    items.push(...notInstalledItems);
                }
                items.push({
                    type: 'separator'
                });
                const entriesBeforeConfig = items.length;
                if (RemoteStatusIndicator_1.SHOW_CLOSE_REMOTE_COMMAND_ID) {
                    if (this.remoteAuthority) {
                        items.push({
                            type: 'item',
                            id: RemoteStatusIndicator_1.CLOSE_REMOTE_COMMAND_ID,
                            label: nls.localize('closeRemoteConnection.title', 'Close Remote Connection')
                        });
                        if (this.connectionState === 'disconnected') {
                            items.push({
                                type: 'item',
                                id: windowActions_1.ReloadWindowAction.ID,
                                label: nls.localize('reloadWindow', 'Reload Window')
                            });
                        }
                    }
                    else if (this.virtualWorkspaceLocation) {
                        items.push({
                            type: 'item',
                            id: RemoteStatusIndicator_1.CLOSE_REMOTE_COMMAND_ID,
                            label: nls.localize('closeVirtualWorkspace.title', 'Close Remote Workspace')
                        });
                    }
                }
                if (items.length === entriesBeforeConfig) {
                    items.pop(); // remove the separator again
                }
                return items;
            };
            const quickPick = this.quickInputService.createQuickPick();
            quickPick.placeholder = nls.localize('remoteActions', "Select an option to open a Remote Window");
            quickPick.items = computeItems();
            quickPick.sortByLabel = false;
            quickPick.canSelectMany = false;
            (0, functional_1.once)(quickPick.onDidAccept)((async (_) => {
                const selectedItems = quickPick.selectedItems;
                if (selectedItems.length === 1) {
                    const commandId = selectedItems[0].id;
                    const remoteExtension = this.remoteExtensionMetadata.find(value => extensions_3.ExtensionIdentifier.equals(value.id, commandId));
                    if (remoteExtension) {
                        quickPick.items = [];
                        quickPick.busy = true;
                        quickPick.placeholder = nls.localize('remote.startActions.installingExtension', 'Installing extension... ');
                        await this.installExtension(remoteExtension.id);
                        quickPick.hide();
                        await this.runRemoteStartCommand(remoteExtension.id, remoteExtension.startCommand);
                    }
                    else {
                        this.telemetryService.publicLog2('workbenchActionExecuted', {
                            id: commandId,
                            from: 'remote indicator'
                        });
                        this.commandService.executeCommand(commandId);
                        quickPick.hide();
                    }
                }
            }));
            (0, functional_1.once)(quickPick.onDidTriggerItemButton)(async (e) => {
                const remoteExtension = this.remoteExtensionMetadata.find(value => extensions_3.ExtensionIdentifier.equals(value.id, e.item.id));
                if (remoteExtension) {
                    await this.openerService.open(uri_1.URI.parse(remoteExtension.helpLink));
                }
            });
            // refresh the items when actions change
            const legacyItemUpdater = this.legacyIndicatorMenu.onDidChange(() => quickPick.items = computeItems());
            quickPick.onDidHide(legacyItemUpdater.dispose);
            const itemUpdater = this.remoteIndicatorMenu.onDidChange(() => quickPick.items = computeItems());
            quickPick.onDidHide(itemUpdater.dispose);
            if (!this.remoteMetadataInitialized) {
                quickPick.busy = true;
                this._register(this.onDidChangeEntries(() => {
                    // If quick pick is open, update the quick pick items after initialization.
                    quickPick.busy = false;
                    quickPick.items = computeItems();
                }));
            }
            quickPick.show();
        }
    };
    exports.RemoteStatusIndicator = RemoteStatusIndicator;
    exports.RemoteStatusIndicator = RemoteStatusIndicator = RemoteStatusIndicator_1 = __decorate([
        __param(0, statusbar_1.IStatusbarService),
        __param(1, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(2, label_1.ILabelService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, actions_1.IMenuService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, commands_1.ICommandService),
        __param(7, extensions_1.IExtensionService),
        __param(8, remoteAgentService_1.IRemoteAgentService),
        __param(9, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(10, host_1.IHostService),
        __param(11, workspace_1.IWorkspaceContextService),
        __param(12, log_1.ILogService),
        __param(13, extensionManagement_1.IExtensionGalleryService),
        __param(14, telemetry_1.ITelemetryService),
        __param(15, productService_1.IProductService),
        __param(16, extensionManagement_1.IExtensionManagementService),
        __param(17, opener_1.IOpenerService)
    ], RemoteStatusIndicator);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlSW5kaWNhdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcmVtb3RlL2Jyb3dzZXIvcmVtb3RlSW5kaWNhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUErRHpGLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsc0JBQVU7O2lCQUU1Qiw4QkFBeUIsR0FBRyxrQ0FBa0MsQUFBckMsQ0FBc0M7aUJBQy9ELDRCQUF1QixHQUFHLCtCQUErQixBQUFsQyxDQUFtQztpQkFDMUQsaUNBQTRCLEdBQUcsQ0FBQyxnQkFBSyxBQUFULENBQVUsR0FBQyw2Q0FBNkM7aUJBQ3BGLGlDQUE0QixHQUFHLG9DQUFvQyxBQUF2QyxDQUF3QztpQkFFcEUsbUNBQThCLEdBQUcsRUFBRSxBQUFMLENBQU07aUJBRXBDLDhDQUF5QyxHQUFHLEVBQUUsR0FBRyxJQUFJLEFBQVosQ0FBYTtpQkFDdEQsd0RBQW1ELEdBQUcsRUFBRSxHQUFHLElBQUksQUFBWixDQUFhO1FBMEJ4RixZQUNvQixnQkFBb0QsRUFDbEMsa0JBQXdFLEVBQzlGLFlBQTRDLEVBQ3ZDLGlCQUE2QyxFQUNuRCxXQUFpQyxFQUMzQixpQkFBc0QsRUFDekQsY0FBZ0QsRUFDOUMsZ0JBQW9ELEVBQ2xELGtCQUF3RCxFQUM1Qyw4QkFBZ0YsRUFDbkcsV0FBMEMsRUFDOUIsdUJBQWtFLEVBQy9FLFVBQXdDLEVBQzNCLHVCQUFrRSxFQUN6RSxnQkFBb0QsRUFDdEQsY0FBZ0QsRUFDcEMsMEJBQXdFLEVBQ3JGLGFBQThDO1lBRTlELEtBQUssRUFBRSxDQUFDO1lBbkI0QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ2pCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUM7WUFDN0UsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDL0Isc0JB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