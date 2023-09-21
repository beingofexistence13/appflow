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
define(["require", "exports", "vs/nls", "vs/base/common/arrays", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/log/common/log", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/storage/common/storage", "vs/platform/tunnel/common/tunnel", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/base/common/cancellation", "vs/base/common/types", "vs/base/common/objects", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, arrays_1, decorators_1, event_1, hash_1, lifecycle_1, uri_1, configuration_1, dialogs_1, log_1, remoteAuthorityResolver_1, storage_1, tunnel_1, workspace_1, environmentService_1, extensions_1, cancellation_1, types_1, objects_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TunnelModel = exports.PortsAttributes = exports.isCandidatePort = exports.OnPortForward = exports.makeAddress = exports.mapHasAddressLocalhostOrAllInterfaces = exports.mapHasAddress = exports.AutoTunnelSource = exports.UserTunnelSource = exports.TunnelSource = exports.TunnelCloseReason = exports.parseAddress = exports.forwardedPortsViewEnabled = exports.ACTIVATION_EVENT = void 0;
    const MISMATCH_LOCAL_PORT_COOLDOWN = 10 * 1000; // 10 seconds
    const TUNNELS_TO_RESTORE = 'remote.tunnels.toRestore';
    exports.ACTIVATION_EVENT = 'onTunnel';
    exports.forwardedPortsViewEnabled = new contextkey_1.RawContextKey('forwardedPortsViewEnabled', false, nls.localize('tunnel.forwardedPortsViewEnabled', "Whether the Ports view is enabled."));
    function parseAddress(address) {
        const matches = address.match(/^([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*:)?([0-9]+)$/);
        if (!matches) {
            return undefined;
        }
        return { host: matches[1]?.substring(0, matches[1].length - 1) || 'localhost', port: Number(matches[2]) };
    }
    exports.parseAddress = parseAddress;
    var TunnelCloseReason;
    (function (TunnelCloseReason) {
        TunnelCloseReason["Other"] = "Other";
        TunnelCloseReason["User"] = "User";
        TunnelCloseReason["AutoForwardEnd"] = "AutoForwardEnd";
    })(TunnelCloseReason || (exports.TunnelCloseReason = TunnelCloseReason = {}));
    var TunnelSource;
    (function (TunnelSource) {
        TunnelSource[TunnelSource["User"] = 0] = "User";
        TunnelSource[TunnelSource["Auto"] = 1] = "Auto";
        TunnelSource[TunnelSource["Extension"] = 2] = "Extension";
    })(TunnelSource || (exports.TunnelSource = TunnelSource = {}));
    exports.UserTunnelSource = {
        source: TunnelSource.User,
        description: nls.localize('tunnel.source.user', "User Forwarded")
    };
    exports.AutoTunnelSource = {
        source: TunnelSource.Auto,
        description: nls.localize('tunnel.source.auto', "Auto Forwarded")
    };
    function mapHasAddress(map, host, port) {
        const initialAddress = map.get(makeAddress(host, port));
        if (initialAddress) {
            return initialAddress;
        }
        if ((0, tunnel_1.isLocalhost)(host)) {
            // Do localhost checks
            for (const testHost of tunnel_1.LOCALHOST_ADDRESSES) {
                const testAddress = makeAddress(testHost, port);
                if (map.has(testAddress)) {
                    return map.get(testAddress);
                }
            }
        }
        else if ((0, tunnel_1.isAllInterfaces)(host)) {
            // Do all interfaces checks
            for (const testHost of tunnel_1.ALL_INTERFACES_ADDRESSES) {
                const testAddress = makeAddress(testHost, port);
                if (map.has(testAddress)) {
                    return map.get(testAddress);
                }
            }
        }
        return undefined;
    }
    exports.mapHasAddress = mapHasAddress;
    function mapHasAddressLocalhostOrAllInterfaces(map, host, port) {
        const originalAddress = mapHasAddress(map, host, port);
        if (originalAddress) {
            return originalAddress;
        }
        const otherHost = (0, tunnel_1.isAllInterfaces)(host) ? 'localhost' : ((0, tunnel_1.isLocalhost)(host) ? '0.0.0.0' : undefined);
        if (otherHost) {
            return mapHasAddress(map, otherHost, port);
        }
        return undefined;
    }
    exports.mapHasAddressLocalhostOrAllInterfaces = mapHasAddressLocalhostOrAllInterfaces;
    function makeAddress(host, port) {
        return host + ':' + port;
    }
    exports.makeAddress = makeAddress;
    var OnPortForward;
    (function (OnPortForward) {
        OnPortForward["Notify"] = "notify";
        OnPortForward["OpenBrowser"] = "openBrowser";
        OnPortForward["OpenBrowserOnce"] = "openBrowserOnce";
        OnPortForward["OpenPreview"] = "openPreview";
        OnPortForward["Silent"] = "silent";
        OnPortForward["Ignore"] = "ignore";
    })(OnPortForward || (exports.OnPortForward = OnPortForward = {}));
    function isCandidatePort(candidate) {
        return candidate && 'host' in candidate && typeof candidate.host === 'string'
            && 'port' in candidate && typeof candidate.port === 'number'
            && (!('detail' in candidate) || typeof candidate.detail === 'string')
            && (!('pid' in candidate) || typeof candidate.pid === 'string');
    }
    exports.isCandidatePort = isCandidatePort;
    class PortsAttributes extends lifecycle_1.Disposable {
        static { this.SETTING = 'remote.portsAttributes'; }
        static { this.DEFAULTS = 'remote.otherPortsAttributes'; }
        static { this.RANGE = /^(\d+)\-(\d+)$/; }
        static { this.HOST_AND_PORT = /^([a-z0-9\-]+):(\d{1,5})$/; }
        constructor(configurationService) {
            super();
            this.configurationService = configurationService;
            this.portsAttributes = [];
            this._onDidChangeAttributes = new event_1.Emitter();
            this.onDidChangeAttributes = this._onDidChangeAttributes.event;
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(PortsAttributes.SETTING) || e.affectsConfiguration(PortsAttributes.DEFAULTS)) {
                    this.updateAttributes();
                }
            }));
            this.updateAttributes();
        }
        updateAttributes() {
            this.portsAttributes = this.readSetting();
            this._onDidChangeAttributes.fire();
        }
        getAttributes(port, host, commandLine) {
            let index = this.findNextIndex(port, host, commandLine, this.portsAttributes, 0);
            const attributes = {
                label: undefined,
                onAutoForward: undefined,
                elevateIfNeeded: undefined,
                requireLocalPort: undefined,
                protocol: undefined
            };
            while (index >= 0) {
                const found = this.portsAttributes[index];
                if (found.key === port) {
                    attributes.onAutoForward = found.onAutoForward ?? attributes.onAutoForward;
                    attributes.elevateIfNeeded = (found.elevateIfNeeded !== undefined) ? found.elevateIfNeeded : attributes.elevateIfNeeded;
                    attributes.label = found.label ?? attributes.label;
                    attributes.requireLocalPort = found.requireLocalPort;
                    attributes.protocol = found.protocol;
                }
                else {
                    // It's a range or regex, which means that if the attribute is already set, we keep it
                    attributes.onAutoForward = attributes.onAutoForward ?? found.onAutoForward;
                    attributes.elevateIfNeeded = (attributes.elevateIfNeeded !== undefined) ? attributes.elevateIfNeeded : found.elevateIfNeeded;
                    attributes.label = attributes.label ?? found.label;
                    attributes.requireLocalPort = (attributes.requireLocalPort !== undefined) ? attributes.requireLocalPort : undefined;
                    attributes.protocol = attributes.protocol ?? found.protocol;
                }
                index = this.findNextIndex(port, host, commandLine, this.portsAttributes, index + 1);
            }
            if (attributes.onAutoForward !== undefined || attributes.elevateIfNeeded !== undefined
                || attributes.label !== undefined || attributes.requireLocalPort !== undefined
                || attributes.protocol !== undefined) {
                return attributes;
            }
            // If we find no matches, then use the other port attributes.
            return this.getOtherAttributes();
        }
        hasStartEnd(value) {
            return (value.start !== undefined) && (value.end !== undefined);
        }
        hasHostAndPort(value) {
            return (value.host !== undefined) && (value.port !== undefined)
                && (0, types_1.isString)(value.host) && (0, types_1.isNumber)(value.port);
        }
        findNextIndex(port, host, commandLine, attributes, fromIndex) {
            if (fromIndex >= attributes.length) {
                return -1;
            }
            const shouldUseHost = !(0, tunnel_1.isLocalhost)(host) && !(0, tunnel_1.isAllInterfaces)(host);
            const sliced = attributes.slice(fromIndex);
            const foundIndex = sliced.findIndex((value) => {
                if ((0, types_1.isNumber)(value.key)) {
                    return shouldUseHost ? false : value.key === port;
                }
                else if (this.hasStartEnd(value.key)) {
                    return shouldUseHost ? false : (port >= value.key.start && port <= value.key.end);
                }
                else if (this.hasHostAndPort(value.key)) {
                    return (port === value.key.port) && (host === value.key.host);
                }
                else {
                    return commandLine ? value.key.test(commandLine) : false;
                }
            });
            return foundIndex >= 0 ? foundIndex + fromIndex : -1;
        }
        readSetting() {
            const settingValue = this.configurationService.getValue(PortsAttributes.SETTING);
            if (!settingValue || !(0, types_1.isObject)(settingValue)) {
                return [];
            }
            const attributes = [];
            for (const attributesKey in settingValue) {
                if (attributesKey === undefined) {
                    continue;
                }
                const setting = settingValue[attributesKey];
                let key = undefined;
                if (Number(attributesKey)) {
                    key = Number(attributesKey);
                }
                else if ((0, types_1.isString)(attributesKey)) {
                    if (PortsAttributes.RANGE.test(attributesKey)) {
                        const match = attributesKey.match(PortsAttributes.RANGE);
                        key = { start: Number(match[1]), end: Number(match[2]) };
                    }
                    else if (PortsAttributes.HOST_AND_PORT.test(attributesKey)) {
                        const match = attributesKey.match(PortsAttributes.HOST_AND_PORT);
                        key = { host: match[1], port: Number(match[2]) };
                    }
                    else {
                        let regTest = undefined;
                        try {
                            regTest = RegExp(attributesKey);
                        }
                        catch (e) {
                            // The user entered an invalid regular expression.
                        }
                        if (regTest) {
                            key = regTest;
                        }
                    }
                }
                if (!key) {
                    continue;
                }
                attributes.push({
                    key: key,
                    elevateIfNeeded: setting.elevateIfNeeded,
                    onAutoForward: setting.onAutoForward,
                    label: setting.label,
                    requireLocalPort: setting.requireLocalPort,
                    protocol: setting.protocol
                });
            }
            const defaults = this.configurationService.getValue(PortsAttributes.DEFAULTS);
            if (defaults) {
                this.defaultPortAttributes = {
                    elevateIfNeeded: defaults.elevateIfNeeded,
                    label: defaults.label,
                    onAutoForward: defaults.onAutoForward,
                    requireLocalPort: defaults.requireLocalPort,
                    protocol: defaults.protocol
                };
            }
            return this.sortAttributes(attributes);
        }
        sortAttributes(attributes) {
            function getVal(item, thisRef) {
                if ((0, types_1.isNumber)(item.key)) {
                    return item.key;
                }
                else if (thisRef.hasStartEnd(item.key)) {
                    return item.key.start;
                }
                else if (thisRef.hasHostAndPort(item.key)) {
                    return item.key.port;
                }
                else {
                    return Number.MAX_VALUE;
                }
            }
            return attributes.sort((a, b) => {
                return getVal(a, this) - getVal(b, this);
            });
        }
        getOtherAttributes() {
            return this.defaultPortAttributes;
        }
        static providedActionToAction(providedAction) {
            switch (providedAction) {
                case tunnel_1.ProvidedOnAutoForward.Notify: return OnPortForward.Notify;
                case tunnel_1.ProvidedOnAutoForward.OpenBrowser: return OnPortForward.OpenBrowser;
                case tunnel_1.ProvidedOnAutoForward.OpenBrowserOnce: return OnPortForward.OpenBrowserOnce;
                case tunnel_1.ProvidedOnAutoForward.OpenPreview: return OnPortForward.OpenPreview;
                case tunnel_1.ProvidedOnAutoForward.Silent: return OnPortForward.Silent;
                case tunnel_1.ProvidedOnAutoForward.Ignore: return OnPortForward.Ignore;
                default: return undefined;
            }
        }
        async addAttributes(port, attributes, target) {
            const settingValue = this.configurationService.inspect(PortsAttributes.SETTING);
            const remoteValue = settingValue.userRemoteValue;
            let newRemoteValue;
            if (!remoteValue || !(0, types_1.isObject)(remoteValue)) {
                newRemoteValue = {};
            }
            else {
                newRemoteValue = (0, objects_1.deepClone)(remoteValue);
            }
            if (!newRemoteValue[`${port}`]) {
                newRemoteValue[`${port}`] = {};
            }
            for (const attribute in attributes) {
                newRemoteValue[`${port}`][attribute] = attributes[attribute];
            }
            return this.configurationService.updateValue(PortsAttributes.SETTING, newRemoteValue, target);
        }
    }
    exports.PortsAttributes = PortsAttributes;
    let TunnelModel = class TunnelModel extends lifecycle_1.Disposable {
        constructor(tunnelService, storageService, configurationService, environmentService, remoteAuthorityResolverService, workspaceContextService, logService, dialogService, extensionService, contextKeyService) {
            super();
            this.tunnelService = tunnelService;
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            this.remoteAuthorityResolverService = remoteAuthorityResolverService;
            this.workspaceContextService = workspaceContextService;
            this.logService = logService;
            this.dialogService = dialogService;
            this.extensionService = extensionService;
            this.contextKeyService = contextKeyService;
            this.inProgress = new Map();
            this._onForwardPort = new event_1.Emitter();
            this.onForwardPort = this._onForwardPort.event;
            this._onClosePort = new event_1.Emitter();
            this.onClosePort = this._onClosePort.event;
            this._onPortName = new event_1.Emitter();
            this.onPortName = this._onPortName.event;
            this._onCandidatesChanged = new event_1.Emitter();
            // onCandidateChanged returns the removed candidates
            this.onCandidatesChanged = this._onCandidatesChanged.event;
            this._onEnvironmentTunnelsSet = new event_1.Emitter();
            this.onEnvironmentTunnelsSet = this._onEnvironmentTunnelsSet.event;
            this._environmentTunnelsSet = false;
            this.restoreListener = undefined;
            this.restoreComplete = false;
            this.onRestoreComplete = new event_1.Emitter();
            this.unrestoredExtensionTunnels = new Map();
            this.sessionCachedProperties = new Map();
            this.portAttributesProviders = [];
            this.mismatchCooldown = new Date();
            this.configPortsAttributes = new PortsAttributes(configurationService);
            this.tunnelRestoreValue = this.getTunnelRestoreValue();
            this._register(this.configPortsAttributes.onDidChangeAttributes(this.updateAttributes, this));
            this.forwarded = new Map();
            this.remoteTunnels = new Map();
            this.tunnelService.tunnels.then(async (tunnels) => {
                const attributes = await this.getAttributes(tunnels.map(tunnel => {
                    return { port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost };
                }));
                for (const tunnel of tunnels) {
                    if (tunnel.localAddress) {
                        const key = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        this.forwarded.set(key, {
                            remotePort: tunnel.tunnelRemotePort,
                            remoteHost: tunnel.tunnelRemoteHost,
                            localAddress: tunnel.localAddress,
                            protocol: attributes?.get(tunnel.tunnelRemotePort)?.protocol ?? tunnel_1.TunnelProtocol.Http,
                            localUri: await this.makeLocalUri(tunnel.localAddress, attributes?.get(tunnel.tunnelRemotePort)),
                            localPort: tunnel.tunnelLocalPort,
                            runningProcess: matchingCandidate?.detail,
                            hasRunningProcess: !!matchingCandidate,
                            pid: matchingCandidate?.pid,
                            privacy: tunnel.privacy,
                            source: exports.UserTunnelSource,
                        });
                        this.remoteTunnels.set(key, tunnel);
                    }
                }
            });
            this.detected = new Map();
            this._register(this.tunnelService.onTunnelOpened(async (tunnel) => {
                const key = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                if (!mapHasAddressLocalhostOrAllInterfaces(this.forwarded, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort)
                    && !mapHasAddressLocalhostOrAllInterfaces(this.detected, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort)
                    && !mapHasAddressLocalhostOrAllInterfaces(this.inProgress, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort)
                    && tunnel.localAddress) {
                    const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                    const attributes = (await this.getAttributes([{ port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost }]))?.get(tunnel.tunnelRemotePort);
                    this.forwarded.set(key, {
                        remoteHost: tunnel.tunnelRemoteHost,
                        remotePort: tunnel.tunnelRemotePort,
                        localAddress: tunnel.localAddress,
                        protocol: attributes?.protocol ?? tunnel_1.TunnelProtocol.Http,
                        localUri: await this.makeLocalUri(tunnel.localAddress, attributes),
                        localPort: tunnel.tunnelLocalPort,
                        closeable: true,
                        runningProcess: matchingCandidate?.detail,
                        hasRunningProcess: !!matchingCandidate,
                        pid: matchingCandidate?.pid,
                        privacy: tunnel.privacy,
                        source: exports.UserTunnelSource,
                    });
                }
                await this.storeForwarded();
                this.remoteTunnels.set(key, tunnel);
                this._onForwardPort.fire(this.forwarded.get(key));
            }));
            this._register(this.tunnelService.onTunnelClosed(address => {
                return this.onTunnelClosed(address, TunnelCloseReason.Other);
            }));
            this.checkExtensionActivationEvents();
        }
        extensionHasActivationEvent() {
            if (this.extensionService.extensions.find(extension => extension.activationEvents?.includes(exports.ACTIVATION_EVENT))) {
                this.contextKeyService.createKey(exports.forwardedPortsViewEnabled.key, true);
                return true;
            }
            return false;
        }
        checkExtensionActivationEvents() {
            if (this.extensionHasActivationEvent()) {
                return;
            }
            const activationDisposable = this._register(this.extensionService.onDidRegisterExtensions(() => {
                if (this.extensionHasActivationEvent()) {
                    activationDisposable.dispose();
                }
            }));
        }
        async onTunnelClosed(address, reason) {
            const key = makeAddress(address.host, address.port);
            if (this.forwarded.has(key)) {
                this.forwarded.delete(key);
                await this.storeForwarded();
                this._onClosePort.fire(address);
            }
        }
        makeLocalUri(localAddress, attributes) {
            if (localAddress.startsWith('http')) {
                return uri_1.URI.parse(localAddress);
            }
            const protocol = attributes?.protocol ?? 'http';
            return uri_1.URI.parse(`${protocol}://${localAddress}`);
        }
        async getStorageKey() {
            const workspace = this.workspaceContextService.getWorkspace();
            const workspaceHash = workspace.configuration ? (0, hash_1.hash)(workspace.configuration.path) : (workspace.folders.length > 0 ? (0, hash_1.hash)(workspace.folders[0].uri.path) : undefined);
            if (workspaceHash === undefined) {
                this.logService.debug('Could not get workspace hash for forwarded ports storage key.');
                return undefined;
            }
            return `${TUNNELS_TO_RESTORE}.${this.environmentService.remoteAuthority}.${workspaceHash}`;
        }
        async getTunnelRestoreValue() {
            const deprecatedValue = this.storageService.get(TUNNELS_TO_RESTORE, 1 /* StorageScope.WORKSPACE */);
            if (deprecatedValue) {
                this.storageService.remove(TUNNELS_TO_RESTORE, 1 /* StorageScope.WORKSPACE */);
                await this.storeForwarded();
                return deprecatedValue;
            }
            const storageKey = await this.getStorageKey();
            if (!storageKey) {
                return undefined;
            }
            return this.storageService.get(storageKey, 0 /* StorageScope.PROFILE */);
        }
        async restoreForwarded() {
            if (this.configurationService.getValue('remote.restoreForwardedPorts')) {
                const tunnelRestoreValue = await this.tunnelRestoreValue;
                if (tunnelRestoreValue && (tunnelRestoreValue !== this.knownPortsRestoreValue)) {
                    const tunnels = JSON.parse(tunnelRestoreValue) ?? [];
                    this.logService.trace(`ForwardedPorts: (TunnelModel) restoring ports ${tunnels.map(tunnel => tunnel.remotePort).join(', ')}`);
                    for (const tunnel of tunnels) {
                        const alreadyForwarded = mapHasAddressLocalhostOrAllInterfaces(this.detected, tunnel.remoteHost, tunnel.remotePort);
                        // Extension forwarded ports should only be updated, not restored.
                        if ((tunnel.source.source !== TunnelSource.Extension && !alreadyForwarded) || (tunnel.source.source === TunnelSource.Extension && alreadyForwarded)) {
                            await this.doForward({
                                remote: { host: tunnel.remoteHost, port: tunnel.remotePort },
                                local: tunnel.localPort,
                                name: tunnel.name,
                                privacy: tunnel.privacy,
                                elevateIfNeeded: true,
                                source: tunnel.source
                            });
                        }
                        else if (tunnel.source.source === TunnelSource.Extension && !alreadyForwarded) {
                            this.unrestoredExtensionTunnels.set(makeAddress(tunnel.remoteHost, tunnel.remotePort), tunnel);
                        }
                    }
                }
            }
            this.restoreComplete = true;
            this.onRestoreComplete.fire();
            if (!this.restoreListener) {
                // It's possible that at restore time the value hasn't synced.
                const key = await this.getStorageKey();
                this.restoreListener = this._register(new lifecycle_1.DisposableStore());
                this.restoreListener.add(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, undefined, this.restoreListener)(async (e) => {
                    if (e.key === key) {
                        this.tunnelRestoreValue = Promise.resolve(this.storageService.get(key, 0 /* StorageScope.PROFILE */));
                        await this.restoreForwarded();
                    }
                }));
            }
        }
        async storeForwarded() {
            if (this.configurationService.getValue('remote.restoreForwardedPorts')) {
                const valueToStore = JSON.stringify(Array.from(this.forwarded.values()));
                if (valueToStore !== this.knownPortsRestoreValue) {
                    this.knownPortsRestoreValue = valueToStore;
                    const key = await this.getStorageKey();
                    if (key) {
                        this.storageService.store(key, this.knownPortsRestoreValue, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                    }
                }
            }
        }
        async showPortMismatchModalIfNeeded(tunnel, expectedLocal, attributes) {
            if (!tunnel.tunnelLocalPort || !attributes?.requireLocalPort) {
                return;
            }
            if (tunnel.tunnelLocalPort === expectedLocal) {
                return;
            }
            const newCooldown = new Date();
            if ((this.mismatchCooldown.getTime() + MISMATCH_LOCAL_PORT_COOLDOWN) > newCooldown.getTime()) {
                return;
            }
            this.mismatchCooldown = newCooldown;
            const mismatchString = nls.localize('remote.localPortMismatch.single', "Local port {0} could not be used for forwarding to remote port {1}.\n\nThis usually happens when there is already another process using local port {0}.\n\nPort number {2} has been used instead.", expectedLocal, tunnel.tunnelRemotePort, tunnel.tunnelLocalPort);
            return this.dialogService.info(mismatchString);
        }
        async forward(tunnelProperties, attributes) {
            if (!this.restoreComplete && this.environmentService.remoteAuthority) {
                await event_1.Event.toPromise(this.onRestoreComplete.event);
            }
            return this.doForward(tunnelProperties, attributes);
        }
        async doForward(tunnelProperties, attributes) {
            await this.extensionService.activateByEvent(exports.ACTIVATION_EVENT);
            const existingTunnel = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, tunnelProperties.remote.host, tunnelProperties.remote.port);
            attributes = attributes ??
                ((attributes !== null)
                    ? (await this.getAttributes([tunnelProperties.remote]))?.get(tunnelProperties.remote.port)
                    : undefined);
            const localPort = (tunnelProperties.local !== undefined) ? tunnelProperties.local : tunnelProperties.remote.port;
            let noTunnelValue;
            if (!existingTunnel) {
                const authority = this.environmentService.remoteAuthority;
                const addressProvider = authority ? {
                    getAddress: async () => { return (await this.remoteAuthorityResolverService.resolveAuthority(authority)).authority; }
                } : undefined;
                const key = makeAddress(tunnelProperties.remote.host, tunnelProperties.remote.port);
                this.inProgress.set(key, true);
                tunnelProperties = this.mergeCachedAndUnrestoredProperties(key, tunnelProperties);
                const tunnel = await this.tunnelService.openTunnel(addressProvider, tunnelProperties.remote.host, tunnelProperties.remote.port, undefined, localPort, (!tunnelProperties.elevateIfNeeded) ? attributes?.elevateIfNeeded : tunnelProperties.elevateIfNeeded, tunnelProperties.privacy, attributes?.protocol);
                if (typeof tunnel === 'string') {
                    // There was an error  while creating the tunnel.
                    noTunnelValue = tunnel;
                }
                else if (tunnel && tunnel.localAddress) {
                    const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnelProperties.remote.host, tunnelProperties.remote.port);
                    const protocol = (tunnel.protocol ?
                        ((tunnel.protocol === tunnel_1.TunnelProtocol.Https) ? tunnel_1.TunnelProtocol.Https : tunnel_1.TunnelProtocol.Http)
                        : (attributes?.protocol ?? tunnel_1.TunnelProtocol.Http));
                    const newForward = {
                        remoteHost: tunnel.tunnelRemoteHost,
                        remotePort: tunnel.tunnelRemotePort,
                        localPort: tunnel.tunnelLocalPort,
                        name: attributes?.label ?? tunnelProperties.name,
                        closeable: true,
                        localAddress: tunnel.localAddress,
                        protocol,
                        localUri: await this.makeLocalUri(tunnel.localAddress, attributes),
                        runningProcess: matchingCandidate?.detail,
                        hasRunningProcess: !!matchingCandidate,
                        pid: matchingCandidate?.pid,
                        source: tunnelProperties.source ?? exports.UserTunnelSource,
                        privacy: tunnel.privacy,
                    };
                    this.forwarded.set(key, newForward);
                    this.remoteTunnels.set(key, tunnel);
                    this.inProgress.delete(key);
                    await this.storeForwarded();
                    await this.showPortMismatchModalIfNeeded(tunnel, localPort, attributes);
                    this._onForwardPort.fire(newForward);
                    return tunnel;
                }
                this.inProgress.delete(key);
            }
            else {
                return this.mergeAttributesIntoExistingTunnel(existingTunnel, tunnelProperties, attributes);
            }
            return noTunnelValue;
        }
        mergeCachedAndUnrestoredProperties(key, tunnelProperties) {
            const map = this.unrestoredExtensionTunnels.has(key) ? this.unrestoredExtensionTunnels : (this.sessionCachedProperties.has(key) ? this.sessionCachedProperties : undefined);
            if (map) {
                const updateProps = map.get(key);
                map.delete(key);
                if (updateProps) {
                    tunnelProperties.name = updateProps.name ?? tunnelProperties.name;
                    tunnelProperties.local = (('local' in updateProps) ? updateProps.local : (('localPort' in updateProps) ? updateProps.localPort : undefined)) ?? tunnelProperties.local;
                    tunnelProperties.privacy = updateProps.privacy ?? tunnelProperties.privacy;
                }
            }
            return tunnelProperties;
        }
        async mergeAttributesIntoExistingTunnel(existingTunnel, tunnelProperties, attributes) {
            const newName = attributes?.label ?? tunnelProperties.name;
            let MergedAttributeAction;
            (function (MergedAttributeAction) {
                MergedAttributeAction[MergedAttributeAction["None"] = 0] = "None";
                MergedAttributeAction[MergedAttributeAction["Fire"] = 1] = "Fire";
                MergedAttributeAction[MergedAttributeAction["Reopen"] = 2] = "Reopen";
            })(MergedAttributeAction || (MergedAttributeAction = {}));
            let mergedAction = MergedAttributeAction.None;
            if (newName !== existingTunnel.name) {
                existingTunnel.name = newName;
                mergedAction = MergedAttributeAction.Fire;
            }
            // Source of existing tunnel wins so that original source is maintained
            if ((attributes?.protocol || (existingTunnel.protocol !== tunnel_1.TunnelProtocol.Http)) && (attributes?.protocol !== existingTunnel.protocol)) {
                tunnelProperties.source = existingTunnel.source;
                mergedAction = MergedAttributeAction.Reopen;
            }
            // New privacy value wins
            if (tunnelProperties.privacy && (existingTunnel.privacy !== tunnelProperties.privacy)) {
                mergedAction = MergedAttributeAction.Reopen;
            }
            switch (mergedAction) {
                case MergedAttributeAction.Fire: {
                    this._onForwardPort.fire();
                    break;
                }
                case MergedAttributeAction.Reopen: {
                    await this.close(existingTunnel.remoteHost, existingTunnel.remotePort, TunnelCloseReason.User);
                    await this.doForward(tunnelProperties, attributes);
                }
            }
            return mapHasAddressLocalhostOrAllInterfaces(this.remoteTunnels, tunnelProperties.remote.host, tunnelProperties.remote.port);
        }
        async name(host, port, name) {
            const existingForwarded = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, host, port);
            const key = makeAddress(host, port);
            if (existingForwarded) {
                existingForwarded.name = name;
                await this.storeForwarded();
                this._onPortName.fire({ host, port });
                return;
            }
            else if (this.detected.has(key)) {
                this.detected.get(key).name = name;
                this._onPortName.fire({ host, port });
            }
        }
        async close(host, port, reason) {
            const key = makeAddress(host, port);
            const oldTunnel = this.forwarded.get(key);
            if ((reason === TunnelCloseReason.AutoForwardEnd) && oldTunnel && (oldTunnel.source.source === TunnelSource.Auto)) {
                this.sessionCachedProperties.set(key, {
                    local: oldTunnel.localPort,
                    name: oldTunnel.name,
                    privacy: oldTunnel.privacy,
                });
            }
            await this.tunnelService.closeTunnel(host, port);
            return this.onTunnelClosed({ host, port }, reason);
        }
        address(host, port) {
            const key = makeAddress(host, port);
            return (this.forwarded.get(key) || this.detected.get(key))?.localAddress;
        }
        get environmentTunnelsSet() {
            return this._environmentTunnelsSet;
        }
        addEnvironmentTunnels(tunnels) {
            if (tunnels) {
                for (const tunnel of tunnels) {
                    const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnel.remoteAddress.host, tunnel.remoteAddress.port);
                    const localAddress = typeof tunnel.localAddress === 'string' ? tunnel.localAddress : makeAddress(tunnel.localAddress.host, tunnel.localAddress.port);
                    this.detected.set(makeAddress(tunnel.remoteAddress.host, tunnel.remoteAddress.port), {
                        remoteHost: tunnel.remoteAddress.host,
                        remotePort: tunnel.remoteAddress.port,
                        localAddress: localAddress,
                        protocol: tunnel_1.TunnelProtocol.Http,
                        localUri: this.makeLocalUri(localAddress),
                        closeable: false,
                        runningProcess: matchingCandidate?.detail,
                        hasRunningProcess: !!matchingCandidate,
                        pid: matchingCandidate?.pid,
                        privacy: tunnel_1.TunnelPrivacyId.ConstantPrivate,
                        source: {
                            source: TunnelSource.Extension,
                            description: nls.localize('tunnel.staticallyForwarded', "Statically Forwarded")
                        }
                    });
                    this.tunnelService.setEnvironmentTunnel(tunnel.remoteAddress.host, tunnel.remoteAddress.port, localAddress, tunnel_1.TunnelPrivacyId.ConstantPrivate, tunnel_1.TunnelProtocol.Http);
                }
            }
            this._environmentTunnelsSet = true;
            this._onEnvironmentTunnelsSet.fire();
            this._onForwardPort.fire();
        }
        setCandidateFilter(filter) {
            this._candidateFilter = filter;
        }
        async setCandidates(candidates) {
            let processedCandidates = candidates;
            if (this._candidateFilter) {
                // When an extension provides a filter, we do the filtering on the extension host before the candidates are set here.
                // However, when the filter doesn't come from an extension we filter here.
                processedCandidates = await this._candidateFilter(candidates);
            }
            const removedCandidates = this.updateInResponseToCandidates(processedCandidates);
            this.logService.trace(`ForwardedPorts: (TunnelModel) removed candidates ${Array.from(removedCandidates.values()).map(candidate => candidate.port).join(', ')}`);
            this._onCandidatesChanged.fire(removedCandidates);
        }
        // Returns removed candidates
        updateInResponseToCandidates(candidates) {
            const removedCandidates = this._candidates ?? new Map();
            const candidatesMap = new Map();
            this._candidates = candidatesMap;
            candidates.forEach(value => {
                const addressKey = makeAddress(value.host, value.port);
                candidatesMap.set(addressKey, {
                    host: value.host,
                    port: value.port,
                    detail: value.detail,
                    pid: value.pid
                });
                if (removedCandidates.has(addressKey)) {
                    removedCandidates.delete(addressKey);
                }
                const forwardedValue = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, value.host, value.port);
                if (forwardedValue) {
                    forwardedValue.runningProcess = value.detail;
                    forwardedValue.hasRunningProcess = true;
                    forwardedValue.pid = value.pid;
                }
            });
            removedCandidates.forEach((_value, key) => {
                const parsedAddress = parseAddress(key);
                if (!parsedAddress) {
                    return;
                }
                const forwardedValue = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, parsedAddress.host, parsedAddress.port);
                if (forwardedValue) {
                    forwardedValue.runningProcess = undefined;
                    forwardedValue.hasRunningProcess = false;
                    forwardedValue.pid = undefined;
                }
                const detectedValue = mapHasAddressLocalhostOrAllInterfaces(this.detected, parsedAddress.host, parsedAddress.port);
                if (detectedValue) {
                    detectedValue.runningProcess = undefined;
                    detectedValue.hasRunningProcess = false;
                    detectedValue.pid = undefined;
                }
            });
            return removedCandidates;
        }
        get candidates() {
            return this._candidates ? Array.from(this._candidates.values()) : [];
        }
        get candidatesOrUndefined() {
            return this._candidates ? this.candidates : undefined;
        }
        async updateAttributes() {
            // If the label changes in the attributes, we should update it.
            const tunnels = Array.from(this.forwarded.values());
            const allAttributes = await this.getAttributes(tunnels.map(tunnel => {
                return { port: tunnel.remotePort, host: tunnel.remoteHost };
            }), false);
            if (!allAttributes) {
                return;
            }
            for (const forwarded of tunnels) {
                const attributes = allAttributes.get(forwarded.remotePort);
                if ((attributes?.protocol || (forwarded.protocol !== tunnel_1.TunnelProtocol.Http)) && (attributes?.protocol !== forwarded.protocol)) {
                    await this.doForward({
                        remote: { host: forwarded.remoteHost, port: forwarded.remotePort },
                        local: forwarded.localPort,
                        name: forwarded.name,
                        source: forwarded.source
                    }, attributes);
                }
                if (!attributes) {
                    continue;
                }
                if (attributes.label && attributes.label !== forwarded.name) {
                    await this.name(forwarded.remoteHost, forwarded.remotePort, attributes.label);
                }
            }
        }
        async getAttributes(forwardedPorts, checkProviders = true) {
            const matchingCandidates = new Map();
            const pidToPortsMapping = new Map();
            forwardedPorts.forEach(forwardedPort => {
                const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnel_1.LOCALHOST_ADDRESSES[0], forwardedPort.port) ?? forwardedPort;
                if (matchingCandidate) {
                    matchingCandidates.set(forwardedPort.port, matchingCandidate);
                    const pid = isCandidatePort(matchingCandidate) ? matchingCandidate.pid : undefined;
                    if (!pidToPortsMapping.has(pid)) {
                        pidToPortsMapping.set(pid, []);
                    }
                    pidToPortsMapping.get(pid)?.push(forwardedPort.port);
                }
            });
            const configAttributes = new Map();
            forwardedPorts.forEach(forwardedPort => {
                const attributes = this.configPortsAttributes.getAttributes(forwardedPort.port, forwardedPort.host, matchingCandidates.get(forwardedPort.port)?.detail);
                if (attributes) {
                    configAttributes.set(forwardedPort.port, attributes);
                }
            });
            if ((this.portAttributesProviders.length === 0) || !checkProviders) {
                return (configAttributes.size > 0) ? configAttributes : undefined;
            }
            // Group calls to provide attributes by pid.
            const allProviderResults = await Promise.all((0, arrays_1.flatten)(this.portAttributesProviders.map(provider => {
                return Array.from(pidToPortsMapping.entries()).map(entry => {
                    const portGroup = entry[1];
                    const matchingCandidate = matchingCandidates.get(portGroup[0]);
                    return provider.providePortAttributes(portGroup, matchingCandidate?.pid, matchingCandidate?.detail, new cancellation_1.CancellationTokenSource().token);
                });
            })));
            const providedAttributes = new Map();
            allProviderResults.forEach(attributes => attributes.forEach(attribute => {
                if (attribute) {
                    providedAttributes.set(attribute.port, attribute);
                }
            }));
            if (!configAttributes && !providedAttributes) {
                return undefined;
            }
            // Merge. The config wins.
            const mergedAttributes = new Map();
            forwardedPorts.forEach(forwardedPorts => {
                const config = configAttributes.get(forwardedPorts.port);
                const provider = providedAttributes.get(forwardedPorts.port);
                mergedAttributes.set(forwardedPorts.port, {
                    elevateIfNeeded: config?.elevateIfNeeded,
                    label: config?.label,
                    onAutoForward: config?.onAutoForward ?? PortsAttributes.providedActionToAction(provider?.autoForwardAction),
                    requireLocalPort: config?.requireLocalPort,
                    protocol: config?.protocol
                });
            });
            return mergedAttributes;
        }
        addAttributesProvider(provider) {
            this.portAttributesProviders.push(provider);
        }
    };
    exports.TunnelModel = TunnelModel;
    __decorate([
        (0, decorators_1.debounce)(1000)
    ], TunnelModel.prototype, "storeForwarded", null);
    exports.TunnelModel = TunnelModel = __decorate([
        __param(0, tunnel_1.ITunnelService),
        __param(1, storage_1.IStorageService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, log_1.ILogService),
        __param(7, dialogs_1.IDialogService),
        __param(8, extensions_1.IExtensionService),
        __param(9, contextkey_1.IContextKeyService)
    ], TunnelModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVubmVsTW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvcmVtb3RlL2NvbW1vbi90dW5uZWxNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3QmhHLE1BQU0sNEJBQTRCLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLGFBQWE7SUFDN0QsTUFBTSxrQkFBa0IsR0FBRywwQkFBMEIsQ0FBQztJQUN6QyxRQUFBLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztJQUM5QixRQUFBLHlCQUF5QixHQUFHLElBQUksMEJBQWEsQ0FBVSwyQkFBMkIsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDLENBQUM7SUFxQmhNLFNBQWdCLFlBQVksQ0FBQyxPQUFlO1FBQzNDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQztRQUNuRixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2IsT0FBTyxTQUFTLENBQUM7U0FDakI7UUFDRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksV0FBVyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUMzRyxDQUFDO0lBTkQsb0NBTUM7SUFFRCxJQUFZLGlCQUlYO0lBSkQsV0FBWSxpQkFBaUI7UUFDNUIsb0NBQWUsQ0FBQTtRQUNmLGtDQUFhLENBQUE7UUFDYixzREFBaUMsQ0FBQTtJQUNsQyxDQUFDLEVBSlcsaUJBQWlCLGlDQUFqQixpQkFBaUIs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