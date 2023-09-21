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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/remoteTunnel/electron-sandbox/remoteTunnel.contribution", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/progress/common/progress", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/platform/remoteTunnel/common/remoteTunnel", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/workbench/common/contributions", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/output/common/output", "vs/workbench/services/preferences/common/preferences"], function (require, exports, actions_1, lifecycle_1, network_1, resources_1, types_1, uri_1, nls_1, actions_2, clipboardService_1, commands_1, configurationRegistry_1, contextkey_1, dialogs_1, environment_1, log_1, notification_1, opener_1, productService_1, progress_1, quickInput_1, platform_1, remoteTunnel_1, storage_1, workspace_1, contributions_1, authentication_1, extensions_1, output_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4ac = exports.$3ac = exports.$2ac = exports.$1ac = void 0;
    exports.$1ac = {
        original: 'Remote-Tunnels',
        value: (0, nls_1.localize)(0, null)
    };
    exports.$2ac = 'remoteTunnelConnection';
    exports.$3ac = new contextkey_1.$2i(exports.$2ac, 'disconnected');
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
        RemoteTunnelCommandLabels.turnOn = (0, nls_1.localize)(1, null);
        RemoteTunnelCommandLabels.turnOff = (0, nls_1.localize)(2, null);
        RemoteTunnelCommandLabels.showLog = (0, nls_1.localize)(3, null);
        RemoteTunnelCommandLabels.configure = (0, nls_1.localize)(4, null);
        RemoteTunnelCommandLabels.copyToClipboard = (0, nls_1.localize)(5, null);
        RemoteTunnelCommandLabels.learnMore = (0, nls_1.localize)(6, null);
    })(RemoteTunnelCommandLabels || (RemoteTunnelCommandLabels = {}));
    let $4ac = class $4ac extends lifecycle_1.$kc {
        constructor(j, m, n, r, productService, t, loggerService, u, w, y, z, C, D, F) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.h = new Set();
            this.g = this.B(loggerService.createLogger((0, resources_1.$ig)(w.logsHome, `${remoteTunnel_1.$b8b}.log`), { id: remoteTunnel_1.$b8b, name: remoteTunnel_1.$c8b }));
            this.a = exports.$3ac.bindTo(this.r);
            const serverConfiguration = productService.tunnelApplicationConfig;
            if (!serverConfiguration || !productService.tunnelApplicationName) {
                this.g.error('Missing \'tunnelApplicationConfig\' or \'tunnelApplicationName\' in product.json. Remote tunneling is not available.');
                this.b = { authenticationProviders: {}, editorWebUrl: '', extension: { extensionId: '', friendlyName: '' } };
                return;
            }
            this.b = serverConfiguration;
            this.B(this.y.onDidChangeTunnelStatus(s => this.G(s)));
            this.R();
            this.I();
            this.H();
        }
        G(status) {
            this.f = undefined;
            if (status.type === 'disconnected') {
                if (status.onTokenFailed) {
                    this.h.add(status.onTokenFailed.sessionId);
                }
                this.a.set('disconnected');
            }
            else if (status.type === 'connecting') {
                this.a.set('connecting');
            }
            else if (status.type === 'connected') {
                this.f = status.info;
                this.a.set('connected');
            }
        }
        async H() {
            await this.n.whenInstalledExtensionsRegistered();
            const remoteExtension = this.b.extension;
            const shouldRecommend = async () => {
                if (this.t.getBoolean(REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY, -1 /* StorageScope.APPLICATION */)) {
                    return false;
                }
                if (await this.n.getExtension(remoteExtension.extensionId)) {
                    return false;
                }
                const usedOnHostMessage = this.t.get(REMOTE_TUNNEL_USED_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
                if (!usedOnHostMessage) {
                    return false;
                }
                let usedTunnelName;
                try {
                    const message = JSON.parse(usedOnHostMessage);
                    if (!(0, types_1.$lf)(message)) {
                        return false;
                    }
                    const { hostName, timeStamp } = message;
                    if (!(0, types_1.$jf)(hostName) || !(0, types_1.$nf)(timeStamp) || new Date().getTime() > timeStamp + REMOTE_TUNNEL_EXTENSION_TIMEOUT) {
                        return false;
                    }
                    usedTunnelName = hostName;
                }
                catch (_) {
                    // problems parsing the message, likly the old message format
                    return false;
                }
                const currentTunnelName = await this.y.getTunnelName();
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
                this.F.notify({
                    severity: notification_1.Severity.Info,
                    message: (0, nls_1.localize)(7, null, usedOnHost, remoteExtension.friendlyName),



                    actions: {
                        primary: [
                            new actions_1.$gi('showExtension', (0, nls_1.localize)(8, null), undefined, true, () => {
                                return this.z.executeCommand('workbench.extensions.action.showExtensionsWithIds', [remoteExtension.extensionId]);
                            }),
                            new actions_1.$gi('doNotShowAgain', (0, nls_1.localize)(9, null), undefined, true, () => {
                                this.t.store(REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                            }),
                        ]
                    }
                });
                return true;
            };
            if (await shouldRecommend()) {
                const disposables = this.B(new lifecycle_1.$jc());
                disposables.add(this.t.onDidChangeValue(-1 /* StorageScope.APPLICATION */, REMOTE_TUNNEL_USED_STORAGE_KEY, disposables)(async () => {
                    const success = await recommed();
                    if (success) {
                        disposables.dispose();
                    }
                }));
            }
        }
        async I() {
            const [mode, status] = await Promise.all([
                this.y.getMode(),
                this.y.getTunnelStatus(),
            ]);
            this.G(status);
            if (mode.active && mode.session.token) {
                return; // already initialized, token available
            }
            return await this.D.withProgress({
                location: 10 /* ProgressLocation.Window */,
                title: (0, nls_1.localize)(10, null, RemoteTunnelCommandIds.showLog),
            }, async (progress) => {
                const listener = this.y.onDidChangeTunnelStatus(status => {
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
                    const token = await this.P(mode.session);
                    if (token) {
                        newSession = { ...mode.session, token };
                    }
                }
                const status = await this.y.initialize(mode.active && newSession ? { ...mode, session: newSession } : remoteTunnel_1.$07b);
                listener.dispose();
                if (status.type === 'connected') {
                    this.f = status.info;
                    this.a.set('connected');
                    return;
                }
            });
        }
        async J(asService) {
            if (this.f) {
                return this.f;
            }
            let tokenProblems = false;
            for (let i = 0; i < INVALID_TOKEN_RETRIES; i++) {
                tokenProblems = false;
                const authenticationSession = await this.L();
                if (authenticationSession === undefined) {
                    this.g.info('No authentication session available, not starting tunnel');
                    return undefined;
                }
                const result = await this.D.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    title: (0, nls_1.localize)(11, null, RemoteTunnelCommandIds.showLog),
                }, (progress) => {
                    return new Promise((s, e) => {
                        let completed = false;
                        const listener = this.y.onDidChangeTunnelStatus(status => {
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
                                        this.F.notify({
                                            severity: notification_1.Severity.Warning,
                                            message: (0, nls_1.localize)(12, null, RemoteTunnelCommandIds.showLog),



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
                        this.y.startTunnel({ active: true, asService, session: account }).then(status => {
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
        async L() {
            const sessions = await this.O();
            if (sessions.length === 1) {
                return sessions[0];
            }
            const quickpick = this.u.createQuickPick();
            quickpick.ok = false;
            quickpick.placeholder = (0, nls_1.localize)(13, null);
            quickpick.ignoreFocusOut = true;
            quickpick.items = await this.N(sessions);
            return new Promise((resolve, reject) => {
                quickpick.onDidHide((e) => {
                    resolve(undefined);
                    quickpick.dispose();
                });
                quickpick.onDidAccept(async (e) => {
                    const selection = quickpick.selectedItems[0];
                    if ('provider' in selection) {
                        const session = await this.j.createSession(selection.provider.id, selection.provider.scopes);
                        resolve(this.M(session, selection.provider.id));
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
        M(session, providerId) {
            return {
                label: session.account.label,
                description: this.j.getLabel(providerId),
                session,
                providerId
            };
        }
        async N(sessions) {
            const options = [];
            if (sessions.length) {
                options.push({ type: 'separator', label: (0, nls_1.localize)(14, null) });
                options.push(...sessions);
                options.push({ type: 'separator', label: (0, nls_1.localize)(15, null) });
            }
            for (const authenticationProvider of (await this.Q())) {
                const signedInForProvider = sessions.some(account => account.providerId === authenticationProvider.id);
                if (!signedInForProvider || this.j.supportsMultipleAccounts(authenticationProvider.id)) {
                    const providerName = this.j.getLabel(authenticationProvider.id);
                    options.push({ label: (0, nls_1.localize)(16, null, providerName), provider: authenticationProvider });
                }
            }
            return options;
        }
        /**
         * Returns all authentication sessions available from {@link Q}.
         */
        async O() {
            const authenticationProviders = await this.Q();
            const accounts = new Map();
            const currentAccount = await this.y.getMode();
            let currentSession;
            for (const provider of authenticationProviders) {
                const sessions = await this.j.getSessions(provider.id, provider.scopes);
                for (const session of sessions) {
                    if (!this.h.has(session.id)) {
                        const item = this.M(session, provider.id);
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
        async P(session) {
            if (session) {
                const sessionItem = (await this.O()).find(s => s.session.id === session.sessionId);
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
        async Q() {
            // Get the list of authentication providers configured in product.json
            const authenticationProviders = this.b.authenticationProviders;
            const configuredAuthenticationProviders = Object.keys(authenticationProviders).reduce((result, id) => {
                result.push({ id, scopes: authenticationProviders[id].scopes });
                return result;
            }, []);
            // Filter out anything that isn't currently available through the authenticationService
            const availableAuthenticationProviders = this.j.declaredProviders;
            return configuredAuthenticationProviders.filter(({ id }) => availableAuthenticationProviders.some(provider => provider.id === id));
        }
        R() {
            const that = this;
            this.B((0, actions_2.$Xu)(class extends actions_2.$Wu {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.turnOn,
                        title: RemoteTunnelCommandLabels.turnOn,
                        category: exports.$1ac,
                        precondition: contextkey_1.$Ii.equals(exports.$2ac, 'disconnected'),
                        menu: [{
                                id: actions_2.$Ru.CommandPalette,
                            },
                            {
                                id: actions_2.$Ru.AccountsContext,
                                group: '2_remoteTunnel',
                                when: contextkey_1.$Ii.equals(exports.$2ac, 'disconnected'),
                            }]
                    });
                }
                async run(accessor) {
                    const notificationService = accessor.get(notification_1.$Yu);
                    const clipboardService = accessor.get(clipboardService_1.$UZ);
                    const commandService = accessor.get(commands_1.$Fr);
                    const storageService = accessor.get(storage_1.$Vo);
                    const dialogService = accessor.get(dialogs_1.$oA);
                    const quickInputService = accessor.get(quickInput_1.$Gq);
                    const productService = accessor.get(productService_1.$kj);
                    const didNotifyPreview = storageService.getBoolean(REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY, -1 /* StorageScope.APPLICATION */, false);
                    if (!didNotifyPreview) {
                        const { confirmed } = await dialogService.confirm({
                            message: (0, nls_1.localize)(17, null),
                            primaryButton: (0, nls_1.localize)(18, null)
                        });
                        if (!confirmed) {
                            return;
                        }
                        storageService.store(REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    }
                    const disposables = new lifecycle_1.$jc();
                    const quickPick = quickInputService.createQuickPick();
                    quickPick.placeholder = (0, nls_1.localize)(19, null);
                    quickPick.items = [
                        { service: false, label: (0, nls_1.localize)(20, null), description: (0, nls_1.localize)(21, null, productService.nameShort) },
                        { service: true, label: (0, nls_1.localize)(22, null), description: (0, nls_1.localize)(23, null) }
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
                    const connectionInfo = await that.J(/* installAsService= */ asService);
                    if (connectionInfo) {
                        const linkToOpen = that.S(connectionInfo);
                        const remoteExtension = that.b.extension;
                        const linkToOpenForMarkdown = linkToOpen.toString(false).replace(/\)/g, '%29');
                        notificationService.notify({
                            severity: notification_1.Severity.Info,
                            message: (0, nls_1.localize)(24, null, connectionInfo.tunnelName, connectionInfo.domain, linkToOpenForMarkdown, RemoteTunnelCommandIds.manage, RemoteTunnelCommandIds.configure, RemoteTunnelCommandIds.turnOff, remoteExtension.friendlyName, 'https://code.visualstudio.com/docs/remote/tunnels'),



                            actions: {
                                primary: [
                                    new actions_1.$gi('copyToClipboard', (0, nls_1.localize)(25, null), undefined, true, () => clipboardService.writeText(linkToOpen.toString(true))),
                                    new actions_1.$gi('showExtension', (0, nls_1.localize)(26, null), undefined, true, () => {
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
                            message: (0, nls_1.localize)(27, null),
                        });
                        await commandService.executeCommand(RemoteTunnelCommandIds.showLog);
                    }
                }
            }));
            this.B((0, actions_2.$Xu)(class extends actions_2.$Wu {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.manage,
                        title: (0, nls_1.localize)(28, null),
                        category: exports.$1ac,
                        menu: [{
                                id: actions_2.$Ru.AccountsContext,
                                group: '2_remoteTunnel',
                                when: contextkey_1.$Ii.equals(exports.$2ac, 'connected'),
                            }]
                    });
                }
                async run() {
                    that.U();
                }
            }));
            this.B((0, actions_2.$Xu)(class extends actions_2.$Wu {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.connecting,
                        title: (0, nls_1.localize)(29, null),
                        category: exports.$1ac,
                        menu: [{
                                id: actions_2.$Ru.AccountsContext,
                                group: '2_remoteTunnel',
                                when: contextkey_1.$Ii.equals(exports.$2ac, 'connecting'),
                            }]
                    });
                }
                async run() {
                    that.U();
                }
            }));
            this.B((0, actions_2.$Xu)(class extends actions_2.$Wu {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.turnOff,
                        title: RemoteTunnelCommandLabels.turnOff,
                        category: exports.$1ac,
                        precondition: contextkey_1.$Ii.notEquals(exports.$2ac, 'disconnected'),
                        menu: [{
                                id: actions_2.$Ru.CommandPalette,
                                when: contextkey_1.$Ii.notEquals(exports.$2ac, ''),
                            }]
                    });
                }
                async run() {
                    const message = that.f?.isAttached ?
                        (0, nls_1.localize)(30, null) :
                        (0, nls_1.localize)(31, null);
                    const { confirmed } = await that.m.confirm({ message });
                    if (confirmed) {
                        that.y.stopTunnel();
                    }
                }
            }));
            this.B((0, actions_2.$Xu)(class extends actions_2.$Wu {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.showLog,
                        title: RemoteTunnelCommandLabels.showLog,
                        category: exports.$1ac,
                        menu: [{
                                id: actions_2.$Ru.CommandPalette,
                                when: contextkey_1.$Ii.notEquals(exports.$2ac, ''),
                            }]
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.$eJ);
                    outputService.showChannel(remoteTunnel_1.$b8b);
                }
            }));
            this.B((0, actions_2.$Xu)(class extends actions_2.$Wu {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.configure,
                        title: RemoteTunnelCommandLabels.configure,
                        category: exports.$1ac,
                        menu: [{
                                id: actions_2.$Ru.CommandPalette,
                                when: contextkey_1.$Ii.notEquals(exports.$2ac, ''),
                            }]
                    });
                }
                async run(accessor) {
                    const preferencesService = accessor.get(preferences_1.$BE);
                    preferencesService.openSettings({ query: remoteTunnel_1.$$7b });
                }
            }));
            this.B((0, actions_2.$Xu)(class extends actions_2.$Wu {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.copyToClipboard,
                        title: RemoteTunnelCommandLabels.copyToClipboard,
                        category: exports.$1ac,
                        precondition: contextkey_1.$Ii.equals(exports.$2ac, 'connected'),
                        menu: [{
                                id: actions_2.$Ru.CommandPalette,
                                when: contextkey_1.$Ii.equals(exports.$2ac, 'connected'),
                            }]
                    });
                }
                async run(accessor) {
                    const clipboardService = accessor.get(clipboardService_1.$UZ);
                    if (that.f) {
                        const linkToOpen = that.S(that.f);
                        clipboardService.writeText(linkToOpen.toString(true));
                    }
                }
            }));
            this.B((0, actions_2.$Xu)(class extends actions_2.$Wu {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.learnMore,
                        title: RemoteTunnelCommandLabels.learnMore,
                        category: exports.$1ac,
                        menu: []
                    });
                }
                async run(accessor) {
                    const openerService = accessor.get(opener_1.$NT);
                    await openerService.open('https://aka.ms/vscode-server-doc');
                }
            }));
        }
        S(connectionInfo) {
            const workspace = this.C.getWorkspace();
            const folders = workspace.folders;
            let resource;
            if (folders.length === 1) {
                resource = folders[0].uri;
            }
            else if (workspace.configuration && !(0, workspace_1.$2h)(workspace.configuration, this.w)) {
                resource = workspace.configuration;
            }
            const link = uri_1.URI.parse(connectionInfo.link);
            if (resource?.scheme === network_1.Schemas.file) {
                return (0, resources_1.$ig)(link, resource.path);
            }
            return (0, resources_1.$ig)(link, this.w.userHome.path);
        }
        async U() {
            const account = await this.y.getMode();
            return new Promise((c, e) => {
                const disposables = new lifecycle_1.$jc();
                const quickPick = this.u.createQuickPick();
                quickPick.placeholder = (0, nls_1.localize)(32, null);
                disposables.add(quickPick);
                const items = [];
                items.push({ id: RemoteTunnelCommandIds.learnMore, label: RemoteTunnelCommandLabels.learnMore });
                if (this.f) {
                    quickPick.title =
                        this.f.isAttached ?
                            (0, nls_1.localize)(33, null, this.f.tunnelName) :
                            (0, nls_1.localize)(34, null, this.f.tunnelName);
                    items.push({ id: RemoteTunnelCommandIds.copyToClipboard, label: RemoteTunnelCommandLabels.copyToClipboard, description: this.f.domain });
                }
                else {
                    quickPick.title = (0, nls_1.localize)(35, null);
                }
                items.push({ id: RemoteTunnelCommandIds.showLog, label: (0, nls_1.localize)(36, null) });
                items.push({ type: 'separator' });
                items.push({ id: RemoteTunnelCommandIds.configure, label: (0, nls_1.localize)(37, null), description: this.f?.tunnelName });
                items.push({ id: RemoteTunnelCommandIds.turnOff, label: RemoteTunnelCommandLabels.turnOff, description: account.active ? `${account.session.accountLabel} (${account.session.providerId})` : undefined });
                quickPick.items = items;
                disposables.add(quickPick.onDidAccept(() => {
                    if (quickPick.selectedItems[0] && quickPick.selectedItems[0].id) {
                        this.z.executeCommand(quickPick.selectedItems[0].id);
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
    exports.$4ac = $4ac;
    exports.$4ac = $4ac = __decorate([
        __param(0, authentication_1.$3I),
        __param(1, dialogs_1.$oA),
        __param(2, extensions_1.$MF),
        __param(3, contextkey_1.$3i),
        __param(4, productService_1.$kj),
        __param(5, storage_1.$Vo),
        __param(6, log_1.$6i),
        __param(7, quickInput_1.$Gq),
        __param(8, environment_1.$Jh),
        __param(9, remoteTunnel_1.$97b),
        __param(10, commands_1.$Fr),
        __param(11, workspace_1.$Kh),
        __param(12, progress_1.$2u),
        __param(13, notification_1.$Yu)
    ], $4ac);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution($4ac, 3 /* LifecyclePhase.Restored */);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        type: 'object',
        properties: {
            [remoteTunnel_1.$_7b]: {
                description: (0, nls_1.localize)(38, null),
                type: 'string',
                scope: 1 /* ConfigurationScope.APPLICATION */,
                pattern: '^(\\w[\\w-]*)?$',
                patternErrorMessage: (0, nls_1.localize)(39, null),
                maxLength: 20,
                default: ''
            },
            [remoteTunnel_1.$a8b]: {
                description: (0, nls_1.localize)(40, null),
                type: 'boolean',
                scope: 1 /* ConfigurationScope.APPLICATION */,
                default: false,
            }
        }
    });
});
//# sourceMappingURL=remoteTunnel.contribution.js.map