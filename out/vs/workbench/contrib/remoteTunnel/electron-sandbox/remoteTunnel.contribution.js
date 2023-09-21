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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/progress/common/progress", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/platform/remoteTunnel/common/remoteTunnel", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/workbench/common/contributions", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/output/common/output", "vs/workbench/services/preferences/common/preferences"], function (require, exports, actions_1, lifecycle_1, network_1, resources_1, types_1, uri_1, nls_1, actions_2, clipboardService_1, commands_1, configurationRegistry_1, contextkey_1, dialogs_1, environment_1, log_1, notification_1, opener_1, productService_1, progress_1, quickInput_1, platform_1, remoteTunnel_1, storage_1, workspace_1, contributions_1, authentication_1, extensions_1, output_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteTunnelWorkbenchContribution = exports.REMOTE_TUNNEL_CONNECTION_STATE = exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY = exports.REMOTE_TUNNEL_CATEGORY = void 0;
    exports.REMOTE_TUNNEL_CATEGORY = {
        original: 'Remote-Tunnels',
        value: (0, nls_1.localize)('remoteTunnel.category', 'Remote Tunnels')
    };
    exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY = 'remoteTunnelConnection';
    exports.REMOTE_TUNNEL_CONNECTION_STATE = new contextkey_1.RawContextKey(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'disconnected');
    const REMOTE_TUNNEL_USED_STORAGE_KEY = 'remoteTunnelServiceUsed';
    const REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY = 'remoteTunnelServicePromptedPreview';
    const REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY = 'remoteTunnelExtensionRecommended';
    const REMOTE_TUNNEL_EXTENSION_TIMEOUT = 4 * 60 * 1000; // show the recommendation that a machine started using tunnels if it joined less than 4 minutes ago
    const INVALID_TOKEN_RETRIES = 2;
    var RemoteTunnelCommandIds;
    (function (RemoteTunnelCommandIds) {
        RemoteTunnelCommandIds["turnOn"] = "workbench.remoteTunnel.actions.turnOn";
        RemoteTunnelCommandIds["turnOff"] = "workbench.remoteTunnel.actions.turnOff";
        RemoteTunnelCommandIds["connecting"] = "workbench.remoteTunnel.actions.connecting";
        RemoteTunnelCommandIds["manage"] = "workbench.remoteTunnel.actions.manage";
        RemoteTunnelCommandIds["showLog"] = "workbench.remoteTunnel.actions.showLog";
        RemoteTunnelCommandIds["configure"] = "workbench.remoteTunnel.actions.configure";
        RemoteTunnelCommandIds["copyToClipboard"] = "workbench.remoteTunnel.actions.copyToClipboard";
        RemoteTunnelCommandIds["learnMore"] = "workbench.remoteTunnel.actions.learnMore";
    })(RemoteTunnelCommandIds || (RemoteTunnelCommandIds = {}));
    // name shown in nofications
    var RemoteTunnelCommandLabels;
    (function (RemoteTunnelCommandLabels) {
        RemoteTunnelCommandLabels.turnOn = (0, nls_1.localize)('remoteTunnel.actions.turnOn', 'Turn on Remote Tunnel Access...');
        RemoteTunnelCommandLabels.turnOff = (0, nls_1.localize)('remoteTunnel.actions.turnOff', 'Turn off Remote Tunnel Access...');
        RemoteTunnelCommandLabels.showLog = (0, nls_1.localize)('remoteTunnel.actions.showLog', 'Show Remote Tunnel Service Log');
        RemoteTunnelCommandLabels.configure = (0, nls_1.localize)('remoteTunnel.actions.configure', 'Configure Tunnel Name...');
        RemoteTunnelCommandLabels.copyToClipboard = (0, nls_1.localize)('remoteTunnel.actions.copyToClipboard', 'Copy Browser URI to Clipboard');
        RemoteTunnelCommandLabels.learnMore = (0, nls_1.localize)('remoteTunnel.actions.learnMore', 'Get Started with Tunnels');
    })(RemoteTunnelCommandLabels || (RemoteTunnelCommandLabels = {}));
    let RemoteTunnelWorkbenchContribution = class RemoteTunnelWorkbenchContribution extends lifecycle_1.Disposable {
        constructor(authenticationService, dialogService, extensionService, contextKeyService, productService, storageService, loggerService, quickInputService, environmentService, remoteTunnelService, commandService, workspaceContextService, progressService, notificationService) {
            super();
            this.authenticationService = authenticationService;
            this.dialogService = dialogService;
            this.extensionService = extensionService;
            this.contextKeyService = contextKeyService;
            this.storageService = storageService;
            this.quickInputService = quickInputService;
            this.environmentService = environmentService;
            this.remoteTunnelService = remoteTunnelService;
            this.commandService = commandService;
            this.workspaceContextService = workspaceContextService;
            this.progressService = progressService;
            this.notificationService = notificationService;
            this.expiredSessions = new Set();
            this.logger = this._register(loggerService.createLogger((0, resources_1.joinPath)(environmentService.logsHome, `${remoteTunnel_1.LOG_ID}.log`), { id: remoteTunnel_1.LOG_ID, name: remoteTunnel_1.LOGGER_NAME }));
            this.connectionStateContext = exports.REMOTE_TUNNEL_CONNECTION_STATE.bindTo(this.contextKeyService);
            const serverConfiguration = productService.tunnelApplicationConfig;
            if (!serverConfiguration || !productService.tunnelApplicationName) {
                this.logger.error('Missing \'tunnelApplicationConfig\' or \'tunnelApplicationName\' in product.json. Remote tunneling is not available.');
                this.serverConfiguration = { authenticationProviders: {}, editorWebUrl: '', extension: { extensionId: '', friendlyName: '' } };
                return;
            }
            this.serverConfiguration = serverConfiguration;
            this._register(this.remoteTunnelService.onDidChangeTunnelStatus(s => this.handleTunnelStatusUpdate(s)));
            this.registerCommands();
            this.initialize();
            this.recommendRemoteExtensionIfNeeded();
        }
        handleTunnelStatusUpdate(status) {
            this.connectionInfo = undefined;
            if (status.type === 'disconnected') {
                if (status.onTokenFailed) {
                    this.expiredSessions.add(status.onTokenFailed.sessionId);
                }
                this.connectionStateContext.set('disconnected');
            }
            else if (status.type === 'connecting') {
                this.connectionStateContext.set('connecting');
            }
            else if (status.type === 'connected') {
                this.connectionInfo = status.info;
                this.connectionStateContext.set('connected');
            }
        }
        async recommendRemoteExtensionIfNeeded() {
            await this.extensionService.whenInstalledExtensionsRegistered();
            const remoteExtension = this.serverConfiguration.extension;
            const shouldRecommend = async () => {
                if (this.storageService.getBoolean(REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY, -1 /* StorageScope.APPLICATION */)) {
                    return false;
                }
                if (await this.extensionService.getExtension(remoteExtension.extensionId)) {
                    return false;
                }
                const usedOnHostMessage = this.storageService.get(REMOTE_TUNNEL_USED_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
                if (!usedOnHostMessage) {
                    return false;
                }
                let usedTunnelName;
                try {
                    const message = JSON.parse(usedOnHostMessage);
                    if (!(0, types_1.isObject)(message)) {
                        return false;
                    }
                    const { hostName, timeStamp } = message;
                    if (!(0, types_1.isString)(hostName) || !(0, types_1.isNumber)(timeStamp) || new Date().getTime() > timeStamp + REMOTE_TUNNEL_EXTENSION_TIMEOUT) {
                        return false;
                    }
                    usedTunnelName = hostName;
                }
                catch (_) {
                    // problems parsing the message, likly the old message format
                    return false;
                }
                const currentTunnelName = await this.remoteTunnelService.getTunnelName();
                if (!currentTunnelName || currentTunnelName === usedTunnelName) {
                    return false;
                }
                return usedTunnelName;
            };
            const recommed = async () => {
                const usedOnHost = await shouldRecommend();
                if (!usedOnHost) {
                    return false;
                }
                this.notificationService.notify({
                    severity: notification_1.Severity.Info,
                    message: (0, nls_1.localize)({
                        key: 'recommend.remoteExtension',
                        comment: ['{0} will be a tunnel name, {1} will the link address to the web UI, {6} an extension name. [label](command:commandId) is a markdown link. Only translate the label, do not modify the format']
                    }, "Tunnel '{0}' is avaiable for remote access. The {1} extension can be used to connect to it.", usedOnHost, remoteExtension.friendlyName),
                    actions: {
                        primary: [
                            new actions_1.Action('showExtension', (0, nls_1.localize)('action.showExtension', "Show Extension"), undefined, true, () => {
                                return this.commandService.executeCommand('workbench.extensions.action.showExtensionsWithIds', [remoteExtension.extensionId]);
                            }),
                            new actions_1.Action('doNotShowAgain', (0, nls_1.localize)('action.doNotShowAgain', "Do not show again"), undefined, true, () => {
                                this.storageService.store(REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                            }),
                        ]
                    }
                });
                return true;
            };
            if (await shouldRecommend()) {
                const disposables = this._register(new lifecycle_1.DisposableStore());
                disposables.add(this.storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, REMOTE_TUNNEL_USED_STORAGE_KEY, disposables)(async () => {
                    const success = await recommed();
                    if (success) {
                        disposables.dispose();
                    }
                }));
            }
        }
        async initialize() {
            const [mode, status] = await Promise.all([
                this.remoteTunnelService.getMode(),
                this.remoteTunnelService.getTunnelStatus(),
            ]);
            this.handleTunnelStatusUpdate(status);
            if (mode.active && mode.session.token) {
                return; // already initialized, token available
            }
            return await this.progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                title: (0, nls_1.localize)({ key: 'initialize.progress.title', comment: ['Only translate \'Looking for remote tunnel\', do not change the format of the rest (markdown link format)'] }, "[Looking for remote tunnel](command:{0})", RemoteTunnelCommandIds.showLog),
            }, async (progress) => {
                const listener = this.remoteTunnelService.onDidChangeTunnelStatus(status => {
                    switch (status.type) {
                        case 'connecting':
                            if (status.progress) {
                                progress.report({ message: status.progress });
                            }
                            break;
                    }
                });
                let newSession;
                if (mode.active) {
                    const token = await this.getSessionToken(mode.session);
                    if (token) {
                        newSession = { ...mode.session, token };
                    }
                }
                const status = await this.remoteTunnelService.initialize(mode.active && newSession ? { ...mode, session: newSession } : remoteTunnel_1.INACTIVE_TUNNEL_MODE);
                listener.dispose();
                if (status.type === 'connected') {
                    this.connectionInfo = status.info;
                    this.connectionStateContext.set('connected');
                    return;
                }
            });
        }
        async startTunnel(asService) {
            if (this.connectionInfo) {
                return this.connectionInfo;
            }
            let tokenProblems = false;
            for (let i = 0; i < INVALID_TOKEN_RETRIES; i++) {
                tokenProblems = false;
                const authenticationSession = await this.getAuthenticationSession();
                if (authenticationSession === undefined) {
                    this.logger.info('No authentication session available, not starting tunnel');
                    return undefined;
                }
                const result = await this.progressService.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    title: (0, nls_1.localize)({ key: 'startTunnel.progress.title', comment: ['Only translate \'Starting remote tunnel\', do not change the format of the rest (markdown link format)'] }, "[Starting remote tunnel](command:{0})", RemoteTunnelCommandIds.showLog),
                }, (progress) => {
                    return new Promise((s, e) => {
                        let completed = false;
                        const listener = this.remoteTunnelService.onDidChangeTunnelStatus(status => {
                            switch (status.type) {
                                case 'connecting':
                                    if (status.progress) {
                                        progress.report({ message: status.progress });
                                    }
                                    break;
                                case 'connected':
                                    listener.dispose();
                                    completed = true;
                                    s(status.info);
                                    if (status.serviceInstallFailed) {
                                        this.notificationService.notify({
                                            severity: notification_1.Severity.Warning,
                                            message: (0, nls_1.localize)({
                                                key: 'remoteTunnel.serviceInstallFailed',
                                                comment: ['{Locked="](command:{0})"}']
                                            }, "Installation as a service failed, and we fell back to running the tunnel for this session. See the [error log](command:{0}) for details.", RemoteTunnelCommandIds.showLog),
                                        });
                                    }
                                    break;
                                case 'disconnected':
                                    listener.dispose();
                                    completed = true;
                                    tokenProblems = !!status.onTokenFailed;
                                    s(undefined);
                                    break;
                            }
                        });
                        const token = authenticationSession.session.idToken ?? authenticationSession.session.accessToken;
                        const account = { sessionId: authenticationSession.session.id, token, providerId: authenticationSession.providerId, accountLabel: authenticationSession.session.account.label };
                        this.remoteTunnelService.startTunnel({ active: true, asService, session: account }).then(status => {
                            if (!completed && (status.type === 'connected' || status.type === 'disconnected')) {
                                listener.dispose();
                                if (status.type === 'connected') {
                                    s(status.info);
                                }
                                else {
                                    tokenProblems = !!status.onTokenFailed;
                                    s(undefined);
                                }
                            }
                        });
                    });
                });
                if (result || !tokenProblems) {
                    return result;
                }
            }
            return undefined;
        }
        async getAuthenticationSession() {
            const sessions = await this.getAllSessions();
            if (sessions.length === 1) {
                return sessions[0];
            }
            const quickpick = this.quickInputService.createQuickPick();
            quickpick.ok = false;
            quickpick.placeholder = (0, nls_1.localize)('accountPreference.placeholder', "Sign in to an account to enable remote access");
            quickpick.ignoreFocusOut = true;
            quickpick.items = await this.createQuickpickItems(sessions);
            return new Promise((resolve, reject) => {
                quickpick.onDidHide((e) => {
                    resolve(undefined);
                    quickpick.dispose();
                });
                quickpick.onDidAccept(async (e) => {
                    const selection = quickpick.selectedItems[0];
                    if ('provider' in selection) {
                        const session = await this.authenticationService.createSession(selection.provider.id, selection.provider.scopes);
                        resolve(this.createExistingSessionItem(session, selection.provider.id));
                    }
                    else if ('session' in selection) {
                        resolve(selection);
                    }
                    else {
                        resolve(undefined);
                    }
                    quickpick.hide();
                });
                quickpick.show();
            });
        }
        createExistingSessionItem(session, providerId) {
            return {
                label: session.account.label,
                description: this.authenticationService.getLabel(providerId),
                session,
                providerId
            };
        }
        async createQuickpickItems(sessions) {
            const options = [];
            if (sessions.length) {
                options.push({ type: 'separator', label: (0, nls_1.localize)('signed in', "Signed In") });
                options.push(...sessions);
                options.push({ type: 'separator', label: (0, nls_1.localize)('others', "Others") });
            }
            for (const authenticationProvider of (await this.getAuthenticationProviders())) {
                const signedInForProvider = sessions.some(account => account.providerId === authenticationProvider.id);
                if (!signedInForProvider || this.authenticationService.supportsMultipleAccounts(authenticationProvider.id)) {
                    const providerName = this.authenticationService.getLabel(authenticationProvider.id);
                    options.push({ label: (0, nls_1.localize)({ key: 'sign in using account', comment: ['{0} will be a auth provider (e.g. Github)'] }, "Sign in with {0}", providerName), provider: authenticationProvider });
                }
            }
            return options;
        }
        /**
         * Returns all authentication sessions available from {@link getAuthenticationProviders}.
         */
        async getAllSessions() {
            const authenticationProviders = await this.getAuthenticationProviders();
            const accounts = new Map();
            const currentAccount = await this.remoteTunnelService.getMode();
            let currentSession;
            for (const provider of authenticationProviders) {
                const sessions = await this.authenticationService.getSessions(provider.id, provider.scopes);
                for (const session of sessions) {
                    if (!this.expiredSessions.has(session.id)) {
                        const item = this.createExistingSessionItem(session, provider.id);
                        accounts.set(item.session.account.id, item);
                        if (currentAccount.active && currentAccount.session.sessionId === session.id) {
                            currentSession = item;
                        }
                    }
                }
            }
            if (currentSession !== undefined) {
                accounts.set(currentSession.session.account.id, currentSession);
            }
            return [...accounts.values()];
        }
        async getSessionToken(session) {
            if (session) {
                const sessionItem = (await this.getAllSessions()).find(s => s.session.id === session.sessionId);
                if (sessionItem) {
                    return sessionItem.session.idToken ?? sessionItem.session.accessToken;
                }
            }
            return undefined;
        }
        /**
         * Returns all authentication providers which can be used to authenticate
         * to the remote storage service, based on product.json configuration
         * and registered authentication providers.
         */
        async getAuthenticationProviders() {
            // Get the list of authentication providers configured in product.json
            const authenticationProviders = this.serverConfiguration.authenticationProviders;
            const configuredAuthenticationProviders = Object.keys(authenticationProviders).reduce((result, id) => {
                result.push({ id, scopes: authenticationProviders[id].scopes });
                return result;
            }, []);
            // Filter out anything that isn't currently available through the authenticationService
            const availableAuthenticationProviders = this.authenticationService.declaredProviders;
            return configuredAuthenticationProviders.filter(({ id }) => availableAuthenticationProviders.some(provider => provider.id === id));
        }
        registerCommands() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.turnOn,
                        title: RemoteTunnelCommandLabels.turnOn,
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        precondition: contextkey_1.ContextKeyExpr.equals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'disconnected'),
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                            },
                            {
                                id: actions_2.MenuId.AccountsContext,
                                group: '2_remoteTunnel',
                                when: contextkey_1.ContextKeyExpr.equals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'disconnected'),
                            }]
                    });
                }
                async run(accessor) {
                    const notificationService = accessor.get(notification_1.INotificationService);
                    const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                    const commandService = accessor.get(commands_1.ICommandService);
                    const storageService = accessor.get(storage_1.IStorageService);
                    const dialogService = accessor.get(dialogs_1.IDialogService);
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const productService = accessor.get(productService_1.IProductService);
                    const didNotifyPreview = storageService.getBoolean(REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY, -1 /* StorageScope.APPLICATION */, false);
                    if (!didNotifyPreview) {
                        const { confirmed } = await dialogService.confirm({
                            message: (0, nls_1.localize)('tunnel.preview', 'Remote Tunnels is currently in preview. Please report any problems using the "Help: Report Issue" command.'),
                            primaryButton: (0, nls_1.localize)({ key: 'enable', comment: ['&& denotes a mnemonic'] }, '&&Enable')
                        });
                        if (!confirmed) {
                            return;
                        }
                        storageService.store(REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    }
                    const disposables = new lifecycle_1.DisposableStore();
                    const quickPick = quickInputService.createQuickPick();
                    quickPick.placeholder = (0, nls_1.localize)('tunnel.enable.placeholder', 'Select how you want to enable access');
                    quickPick.items = [
                        { service: false, label: (0, nls_1.localize)('tunnel.enable.session', 'Turn on for this session'), description: (0, nls_1.localize)('tunnel.enable.session.description', 'Run whenever {0} is open', productService.nameShort) },
                        { service: true, label: (0, nls_1.localize)('tunnel.enable.service', 'Install as a service'), description: (0, nls_1.localize)('tunnel.enable.service.description', 'Run whenever you\'re logged in') }
                    ];
                    const asService = await new Promise(resolve => {
                        disposables.add(quickPick.onDidAccept(() => resolve(quickPick.selectedItems[0]?.service)));
                        disposables.add(quickPick.onDidHide(() => resolve(undefined)));
                        quickPick.show();
                    });
                    quickPick.dispose();
                    if (asService === undefined) {
                        return; // no-op
                    }
                    const connectionInfo = await that.startTunnel(/* installAsService= */ asService);
                    if (connectionInfo) {
                        const linkToOpen = that.getLinkToOpen(connectionInfo);
                        const remoteExtension = that.serverConfiguration.extension;
                        const linkToOpenForMarkdown = linkToOpen.toString(false).replace(/\)/g, '%29');
                        notificationService.notify({
                            severity: notification_1.Severity.Info,
                            message: (0, nls_1.localize)({
                                key: 'progress.turnOn.final',
                                comment: ['{0} will be the tunnel name, {1} will the link address to the web UI, {6} an extension name, {7} a link to the extension documentation. [label](command:commandId) is a markdown link. Only translate the label, do not modify the format']
                            }, "You can now access this machine anywhere via the secure tunnel [{0}](command:{4}). To connect via a different machine, use the generated [{1}]({2}) link or use the [{6}]({7}) extension in the desktop or web. You can [configure](command:{3}) or [turn off](command:{5}) this access via the VS Code Accounts menu.", connectionInfo.tunnelName, connectionInfo.domain, linkToOpenForMarkdown, RemoteTunnelCommandIds.manage, RemoteTunnelCommandIds.configure, RemoteTunnelCommandIds.turnOff, remoteExtension.friendlyName, 'https://code.visualstudio.com/docs/remote/tunnels'),
                            actions: {
                                primary: [
                                    new actions_1.Action('copyToClipboard', (0, nls_1.localize)('action.copyToClipboard', "Copy Browser Link to Clipboard"), undefined, true, () => clipboardService.writeText(linkToOpen.toString(true))),
                                    new actions_1.Action('showExtension', (0, nls_1.localize)('action.showExtension', "Show Extension"), undefined, true, () => {
                                        return commandService.executeCommand('workbench.extensions.action.showExtensionsWithIds', [remoteExtension.extensionId]);
                                    })
                                ]
                            }
                        });
                        const usedOnHostMessage = { hostName: connectionInfo.tunnelName, timeStamp: new Date().getTime() };
                        storageService.store(REMOTE_TUNNEL_USED_STORAGE_KEY, JSON.stringify(usedOnHostMessage), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    }
                    else {
                        notificationService.notify({
                            severity: notification_1.Severity.Info,
                            message: (0, nls_1.localize)('progress.turnOn.failed', "Unable to turn on the remote tunnel access. Check the Remote Tunnel Service log for details."),
                        });
                        await commandService.executeCommand(RemoteTunnelCommandIds.showLog);
                    }
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.manage,
                        title: (0, nls_1.localize)('remoteTunnel.actions.manage.on.v2', 'Remote Tunnel Access is On'),
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        menu: [{
                                id: actions_2.MenuId.AccountsContext,
                                group: '2_remoteTunnel',
                                when: contextkey_1.ContextKeyExpr.equals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'connected'),
                            }]
                    });
                }
                async run() {
                    that.showManageOptions();
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.connecting,
                        title: (0, nls_1.localize)('remoteTunnel.actions.manage.connecting', 'Remote Tunnel Access is Connecting'),
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        menu: [{
                                id: actions_2.MenuId.AccountsContext,
                                group: '2_remoteTunnel',
                                when: contextkey_1.ContextKeyExpr.equals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'connecting'),
                            }]
                    });
                }
                async run() {
                    that.showManageOptions();
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.turnOff,
                        title: RemoteTunnelCommandLabels.turnOff,
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        precondition: contextkey_1.ContextKeyExpr.notEquals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'disconnected'),
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                                when: contextkey_1.ContextKeyExpr.notEquals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, ''),
                            }]
                    });
                }
                async run() {
                    const message = that.connectionInfo?.isAttached ?
                        (0, nls_1.localize)('remoteTunnel.turnOffAttached.confirm', 'Do you want to turn off Remote Tunnel Access? This will also stop the service that was started externally.') :
                        (0, nls_1.localize)('remoteTunnel.turnOff.confirm', 'Do you want to turn off Remote Tunnel Access?');
                    const { confirmed } = await that.dialogService.confirm({ message });
                    if (confirmed) {
                        that.remoteTunnelService.stopTunnel();
                    }
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.showLog,
                        title: RemoteTunnelCommandLabels.showLog,
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                                when: contextkey_1.ContextKeyExpr.notEquals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, ''),
                            }]
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.IOutputService);
                    outputService.showChannel(remoteTunnel_1.LOG_ID);
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.configure,
                        title: RemoteTunnelCommandLabels.configure,
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                                when: contextkey_1.ContextKeyExpr.notEquals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, ''),
                            }]
                    });
                }
                async run(accessor) {
                    const preferencesService = accessor.get(preferences_1.IPreferencesService);
                    preferencesService.openSettings({ query: remoteTunnel_1.CONFIGURATION_KEY_PREFIX });
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.copyToClipboard,
                        title: RemoteTunnelCommandLabels.copyToClipboard,
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        precondition: contextkey_1.ContextKeyExpr.equals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'connected'),
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                                when: contextkey_1.ContextKeyExpr.equals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'connected'),
                            }]
                    });
                }
                async run(accessor) {
                    const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                    if (that.connectionInfo) {
                        const linkToOpen = that.getLinkToOpen(that.connectionInfo);
                        clipboardService.writeText(linkToOpen.toString(true));
                    }
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.learnMore,
                        title: RemoteTunnelCommandLabels.learnMore,
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        menu: []
                    });
                }
                async run(accessor) {
                    const openerService = accessor.get(opener_1.IOpenerService);
                    await openerService.open('https://aka.ms/vscode-server-doc');
                }
            }));
        }
        getLinkToOpen(connectionInfo) {
            const workspace = this.workspaceContextService.getWorkspace();
            const folders = workspace.folders;
            let resource;
            if (folders.length === 1) {
                resource = folders[0].uri;
            }
            else if (workspace.configuration && !(0, workspace_1.isUntitledWorkspace)(workspace.configuration, this.environmentService)) {
                resource = workspace.configuration;
            }
            const link = uri_1.URI.parse(connectionInfo.link);
            if (resource?.scheme === network_1.Schemas.file) {
                return (0, resources_1.joinPath)(link, resource.path);
            }
            return (0, resources_1.joinPath)(link, this.environmentService.userHome.path);
        }
        async showManageOptions() {
            const account = await this.remoteTunnelService.getMode();
            return new Promise((c, e) => {
                const disposables = new lifecycle_1.DisposableStore();
                const quickPick = this.quickInputService.createQuickPick();
                quickPick.placeholder = (0, nls_1.localize)('manage.placeholder', 'Select a command to invoke');
                disposables.add(quickPick);
                const items = [];
                items.push({ id: RemoteTunnelCommandIds.learnMore, label: RemoteTunnelCommandLabels.learnMore });
                if (this.connectionInfo) {
                    quickPick.title =
                        this.connectionInfo.isAttached ?
                            (0, nls_1.localize)({ key: 'manage.title.attached', comment: ['{0} is the tunnel name'] }, 'Remote Tunnel Access enabled for {0} (launched externally)', this.connectionInfo.tunnelName) :
                            (0, nls_1.localize)({ key: 'manage.title.orunning', comment: ['{0} is the tunnel name'] }, 'Remote Tunnel Access enabled for {0}', this.connectionInfo.tunnelName);
                    items.push({ id: RemoteTunnelCommandIds.copyToClipboard, label: RemoteTunnelCommandLabels.copyToClipboard, description: this.connectionInfo.domain });
                }
                else {
                    quickPick.title = (0, nls_1.localize)('manage.title.off', 'Remote Tunnel Access not enabled');
                }
                items.push({ id: RemoteTunnelCommandIds.showLog, label: (0, nls_1.localize)('manage.showLog', 'Show Log') });
                items.push({ type: 'separator' });
                items.push({ id: RemoteTunnelCommandIds.configure, label: (0, nls_1.localize)('manage.tunnelName', 'Change Tunnel Name'), description: this.connectionInfo?.tunnelName });
                items.push({ id: RemoteTunnelCommandIds.turnOff, label: RemoteTunnelCommandLabels.turnOff, description: account.active ? `${account.session.accountLabel} (${account.session.providerId})` : undefined });
                quickPick.items = items;
                disposables.add(quickPick.onDidAccept(() => {
                    if (quickPick.selectedItems[0] && quickPick.selectedItems[0].id) {
                        this.commandService.executeCommand(quickPick.selectedItems[0].id);
                    }
                    quickPick.hide();
                }));
                disposables.add(quickPick.onDidHide(() => {
                    disposables.dispose();
                    c();
                }));
                quickPick.show();
            });
        }
    };
    exports.RemoteTunnelWorkbenchContribution = RemoteTunnelWorkbenchContribution;
    exports.RemoteTunnelWorkbenchContribution = RemoteTunnelWorkbenchContribution = __decorate([
        __param(0, authentication_1.IAuthenticationService),
        __param(1, dialogs_1.IDialogService),
        __param(2, extensions_1.IExtensionService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, productService_1.IProductService),
        __param(5, storage_1.IStorageService),
        __param(6, log_1.ILoggerService),
        __param(7, quickInput_1.IQuickInputService),
        __param(8, environment_1.INativeEnvironmentService),
        __param(9, remoteTunnel_1.IRemoteTunnelService),
        __param(10, commands_1.ICommandService),
        __param(11, workspace_1.IWorkspaceContextService),
        __param(12, progress_1.IProgressService),
        __param(13, notification_1.INotificationService)
    ], RemoteTunnelWorkbenchContribution);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(RemoteTunnelWorkbenchContribution, 3 /* LifecyclePhase.Restored */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        type: 'object',
        properties: {
            [remoteTunnel_1.CONFIGURATION_KEY_HOST_NAME]: {
                description: (0, nls_1.localize)('remoteTunnelAccess.machineName', "The name under which the remote tunnel access is registered. If not set, the host name is used."),
                type: 'string',
                scope: 1 /* ConfigurationScope.APPLICATION */,
                pattern: '^(\\w[\\w-]*)?$',
                patternErrorMessage: (0, nls_1.localize)('remoteTunnelAccess.machineNameRegex', "The name must only consist of letters, numbers, underscore and dash. It must not start with a dash."),
                maxLength: 20,
                default: ''
            },
            [remoteTunnel_1.CONFIGURATION_KEY_PREVENT_SLEEP]: {
                description: (0, nls_1.localize)('remoteTunnelAccess.preventSleep', "Prevent the computer from sleeping when remote tunnel access is turned on."),
                type: 'boolean',
                scope: 1 /* ConfigurationScope.APPLICATION */,
                default: false,
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVHVubmVsLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3JlbW90ZVR1bm5lbC9lbGVjdHJvbi1zYW5kYm94L3JlbW90ZVR1bm5lbC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0NuRixRQUFBLHNCQUFzQixHQUFxQjtRQUN2RCxRQUFRLEVBQUUsZ0JBQWdCO1FBQzFCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyx1QkFBdUIsRUFBRSxnQkFBZ0IsQ0FBQztLQUMxRCxDQUFDO0lBSVcsUUFBQSxrQ0FBa0MsR0FBRyx3QkFBd0IsQ0FBQztJQUM5RCxRQUFBLDhCQUE4QixHQUFHLElBQUksMEJBQWEsQ0FBcUIsMENBQWtDLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFFeEksTUFBTSw4QkFBOEIsR0FBRyx5QkFBeUIsQ0FBQztJQUNqRSxNQUFNLDBDQUEwQyxHQUFHLG9DQUFvQyxDQUFDO0lBQ3hGLE1BQU0sdUNBQXVDLEdBQUcsa0NBQWtDLENBQUM7SUFDbkYsTUFBTSwrQkFBK0IsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLG9HQUFvRztJQUUzSixNQUFNLHFCQUFxQixHQUFHLENBQUMsQ0FBQztJQVFoQyxJQUFLLHNCQVNKO0lBVEQsV0FBSyxzQkFBc0I7UUFDMUIsMEVBQWdELENBQUE7UUFDaEQsNEVBQWtELENBQUE7UUFDbEQsa0ZBQXdELENBQUE7UUFDeEQsMEVBQWdELENBQUE7UUFDaEQsNEVBQWtELENBQUE7UUFDbEQsZ0ZBQXNELENBQUE7UUFDdEQsNEZBQWtFLENBQUE7UUFDbEUsZ0ZBQXNELENBQUE7SUFDdkQsQ0FBQyxFQVRJLHNCQUFzQixLQUF0QixzQkFBc0IsUUFTMUI7SUFFRCw0QkFBNEI7SUFDNUIsSUFB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