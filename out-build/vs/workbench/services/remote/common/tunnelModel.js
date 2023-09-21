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
define(["require", "exports", "vs/nls!vs/workbench/services/remote/common/tunnelModel", "vs/base/common/arrays", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/log/common/log", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/storage/common/storage", "vs/platform/tunnel/common/tunnel", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/base/common/cancellation", "vs/base/common/types", "vs/base/common/objects", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, arrays_1, decorators_1, event_1, hash_1, lifecycle_1, uri_1, configuration_1, dialogs_1, log_1, remoteAuthorityResolver_1, storage_1, tunnel_1, workspace_1, environmentService_1, extensions_1, cancellation_1, types_1, objects_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sJ = exports.$rJ = exports.$qJ = exports.OnPortForward = exports.$pJ = exports.$oJ = exports.$nJ = exports.$mJ = exports.$lJ = exports.TunnelSource = exports.TunnelCloseReason = exports.$kJ = exports.$jJ = exports.$iJ = void 0;
    const MISMATCH_LOCAL_PORT_COOLDOWN = 10 * 1000; // 10 seconds
    const TUNNELS_TO_RESTORE = 'remote.tunnels.toRestore';
    exports.$iJ = 'onTunnel';
    exports.$jJ = new contextkey_1.$2i('forwardedPortsViewEnabled', false, nls.localize(0, null));
    function $kJ(address) {
        const matches = address.match(/^([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*:)?([0-9]+)$/);
        if (!matches) {
            return undefined;
        }
        return { host: matches[1]?.substring(0, matches[1].length - 1) || 'localhost', port: Number(matches[2]) };
    }
    exports.$kJ = $kJ;
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
    exports.$lJ = {
        source: TunnelSource.User,
        description: nls.localize(1, null)
    };
    exports.$mJ = {
        source: TunnelSource.Auto,
        description: nls.localize(2, null)
    };
    function $nJ(map, host, port) {
        const initialAddress = map.get($pJ(host, port));
        if (initialAddress) {
            return initialAddress;
        }
        if ((0, tunnel_1.$2z)(host)) {
            // Do localhost checks
            for (const testHost of tunnel_1.$1z) {
                const testAddress = $pJ(testHost, port);
                if (map.has(testAddress)) {
                    return map.get(testAddress);
                }
            }
        }
        else if ((0, tunnel_1.$4z)(host)) {
            // Do all interfaces checks
            for (const testHost of tunnel_1.$3z) {
                const testAddress = $pJ(testHost, port);
                if (map.has(testAddress)) {
                    return map.get(testAddress);
                }
            }
        }
        return undefined;
    }
    exports.$nJ = $nJ;
    function $oJ(map, host, port) {
        const originalAddress = $nJ(map, host, port);
        if (originalAddress) {
            return originalAddress;
        }
        const otherHost = (0, tunnel_1.$4z)(host) ? 'localhost' : ((0, tunnel_1.$2z)(host) ? '0.0.0.0' : undefined);
        if (otherHost) {
            return $nJ(map, otherHost, port);
        }
        return undefined;
    }
    exports.$oJ = $oJ;
    function $pJ(host, port) {
        return host + ':' + port;
    }
    exports.$pJ = $pJ;
    var OnPortForward;
    (function (OnPortForward) {
        OnPortForward["Notify"] = "notify";
        OnPortForward["OpenBrowser"] = "openBrowser";
        OnPortForward["OpenBrowserOnce"] = "openBrowserOnce";
        OnPortForward["OpenPreview"] = "openPreview";
        OnPortForward["Silent"] = "silent";
        OnPortForward["Ignore"] = "ignore";
    })(OnPortForward || (exports.OnPortForward = OnPortForward = {}));
    function $qJ(candidate) {
        return candidate && 'host' in candidate && typeof candidate.host === 'string'
            && 'port' in candidate && typeof candidate.port === 'number'
            && (!('detail' in candidate) || typeof candidate.detail === 'string')
            && (!('pid' in candidate) || typeof candidate.pid === 'string');
    }
    exports.$qJ = $qJ;
    class $rJ extends lifecycle_1.$kc {
        static { this.c = 'remote.portsAttributes'; }
        static { this.f = 'remote.otherPortsAttributes'; }
        static { this.g = /^(\d+)\-(\d+)$/; }
        static { this.h = /^([a-z0-9\-]+):(\d{1,5})$/; }
        constructor(r) {
            super();
            this.r = r;
            this.j = [];
            this.n = new event_1.$fd();
            this.onDidChangeAttributes = this.n.event;
            this.B(r.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration($rJ.c) || e.affectsConfiguration($rJ.f)) {
                    this.s();
                }
            }));
            this.s();
        }
        s() {
            this.j = this.y();
            this.n.fire();
        }
        getAttributes(port, host, commandLine) {
            let index = this.w(port, host, commandLine, this.j, 0);
            const attributes = {
                label: undefined,
                onAutoForward: undefined,
                elevateIfNeeded: undefined,
                requireLocalPort: undefined,
                protocol: undefined
            };
            while (index >= 0) {
                const found = this.j[index];
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
                index = this.w(port, host, commandLine, this.j, index + 1);
            }
            if (attributes.onAutoForward !== undefined || attributes.elevateIfNeeded !== undefined
                || attributes.label !== undefined || attributes.requireLocalPort !== undefined
                || attributes.protocol !== undefined) {
                return attributes;
            }
            // If we find no matches, then use the other port attributes.
            return this.C();
        }
        t(value) {
            return (value.start !== undefined) && (value.end !== undefined);
        }
        u(value) {
            return (value.host !== undefined) && (value.port !== undefined)
                && (0, types_1.$jf)(value.host) && (0, types_1.$nf)(value.port);
        }
        w(port, host, commandLine, attributes, fromIndex) {
            if (fromIndex >= attributes.length) {
                return -1;
            }
            const shouldUseHost = !(0, tunnel_1.$2z)(host) && !(0, tunnel_1.$4z)(host);
            const sliced = attributes.slice(fromIndex);
            const foundIndex = sliced.findIndex((value) => {
                if ((0, types_1.$nf)(value.key)) {
                    return shouldUseHost ? false : value.key === port;
                }
                else if (this.t(value.key)) {
                    return shouldUseHost ? false : (port >= value.key.start && port <= value.key.end);
                }
                else if (this.u(value.key)) {
                    return (port === value.key.port) && (host === value.key.host);
                }
                else {
                    return commandLine ? value.key.test(commandLine) : false;
                }
            });
            return foundIndex >= 0 ? foundIndex + fromIndex : -1;
        }
        y() {
            const settingValue = this.r.getValue($rJ.c);
            if (!settingValue || !(0, types_1.$lf)(settingValue)) {
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
                else if ((0, types_1.$jf)(attributesKey)) {
                    if ($rJ.g.test(attributesKey)) {
                        const match = attributesKey.match($rJ.g);
                        key = { start: Number(match[1]), end: Number(match[2]) };
                    }
                    else if ($rJ.h.test(attributesKey)) {
                        const match = attributesKey.match($rJ.h);
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
            const defaults = this.r.getValue($rJ.f);
            if (defaults) {
                this.m = {
                    elevateIfNeeded: defaults.elevateIfNeeded,
                    label: defaults.label,
                    onAutoForward: defaults.onAutoForward,
                    requireLocalPort: defaults.requireLocalPort,
                    protocol: defaults.protocol
                };
            }
            return this.z(attributes);
        }
        z(attributes) {
            function getVal(item, thisRef) {
                if ((0, types_1.$nf)(item.key)) {
                    return item.key;
                }
                else if (thisRef.t(item.key)) {
                    return item.key.start;
                }
                else if (thisRef.u(item.key)) {
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
        C() {
            return this.m;
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
            const settingValue = this.r.inspect($rJ.c);
            const remoteValue = settingValue.userRemoteValue;
            let newRemoteValue;
            if (!remoteValue || !(0, types_1.$lf)(remoteValue)) {
                newRemoteValue = {};
            }
            else {
                newRemoteValue = (0, objects_1.$Vm)(remoteValue);
            }
            if (!newRemoteValue[`${port}`]) {
                newRemoteValue[`${port}`] = {};
            }
            for (const attribute in attributes) {
                newRemoteValue[`${port}`][attribute] = attributes[attribute];
            }
            return this.r.updateValue($rJ.c, newRemoteValue, target);
        }
    }
    exports.$rJ = $rJ;
    let $sJ = class $sJ extends lifecycle_1.$kc {
        constructor(H, I, J, L, M, N, O, P, Q, R) {
            super();
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.c = new Map();
            this.g = new event_1.$fd();
            this.onForwardPort = this.g.event;
            this.h = new event_1.$fd();
            this.onClosePort = this.h.event;
            this.j = new event_1.$fd();
            this.onPortName = this.j.event;
            this.n = new event_1.$fd();
            // onCandidateChanged returns the removed candidates
            this.onCandidatesChanged = this.n.event;
            this.t = new event_1.$fd();
            this.onEnvironmentTunnelsSet = this.t.event;
            this.u = false;
            this.w = undefined;
            this.z = false;
            this.C = new event_1.$fd();
            this.D = new Map();
            this.F = new Map();
            this.G = [];
            this.ab = new Date();
            this.configPortsAttributes = new $rJ(J);
            this.s = this.Z();
            this.B(this.configPortsAttributes.onDidChangeAttributes(this.gb, this));
            this.forwarded = new Map();
            this.f = new Map();
            this.H.tunnels.then(async (tunnels) => {
                const attributes = await this.getAttributes(tunnels.map(tunnel => {
                    return { port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost };
                }));
                for (const tunnel of tunnels) {
                    if (tunnel.localAddress) {
                        const key = $pJ(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        const matchingCandidate = $oJ(this.m ?? new Map(), tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        this.forwarded.set(key, {
                            remotePort: tunnel.tunnelRemotePort,
                            remoteHost: tunnel.tunnelRemoteHost,
                            localAddress: tunnel.localAddress,
                            protocol: attributes?.get(tunnel.tunnelRemotePort)?.protocol ?? tunnel_1.TunnelProtocol.Http,
                            localUri: await this.X(tunnel.localAddress, attributes?.get(tunnel.tunnelRemotePort)),
                            localPort: tunnel.tunnelLocalPort,
                            runningProcess: matchingCandidate?.detail,
                            hasRunningProcess: !!matchingCandidate,
                            pid: matchingCandidate?.pid,
                            privacy: tunnel.privacy,
                            source: exports.$lJ,
                        });
                        this.f.set(key, tunnel);
                    }
                }
            });
            this.detected = new Map();
            this.B(this.H.onTunnelOpened(async (tunnel) => {
                const key = $pJ(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                if (!$oJ(this.forwarded, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort)
                    && !$oJ(this.detected, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort)
                    && !$oJ(this.c, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort)
                    && tunnel.localAddress) {
                    const matchingCandidate = $oJ(this.m ?? new Map(), tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                    const attributes = (await this.getAttributes([{ port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost }]))?.get(tunnel.tunnelRemotePort);
                    this.forwarded.set(key, {
                        remoteHost: tunnel.tunnelRemoteHost,
                        remotePort: tunnel.tunnelRemotePort,
                        localAddress: tunnel.localAddress,
                        protocol: attributes?.protocol ?? tunnel_1.TunnelProtocol.Http,
                        localUri: await this.X(tunnel.localAddress, attributes),
                        localPort: tunnel.tunnelLocalPort,
                        closeable: true,
                        runningProcess: matchingCandidate?.detail,
                        hasRunningProcess: !!matchingCandidate,
                        pid: matchingCandidate?.pid,
                        privacy: tunnel.privacy,
                        source: exports.$lJ,
                    });
                }
                await this.$();
                this.f.set(key, tunnel);
                this.g.fire(this.forwarded.get(key));
            }));
            this.B(this.H.onTunnelClosed(address => {
                return this.W(address, TunnelCloseReason.Other);
            }));
            this.U();
        }
        S() {
            if (this.Q.extensions.find(extension => extension.activationEvents?.includes(exports.$iJ))) {
                this.R.createKey(exports.$jJ.key, true);
                return true;
            }
            return false;
        }
        U() {
            if (this.S()) {
                return;
            }
            const activationDisposable = this.B(this.Q.onDidRegisterExtensions(() => {
                if (this.S()) {
                    activationDisposable.dispose();
                }
            }));
        }
        async W(address, reason) {
            const key = $pJ(address.host, address.port);
            if (this.forwarded.has(key)) {
                this.forwarded.delete(key);
                await this.$();
                this.h.fire(address);
            }
        }
        X(localAddress, attributes) {
            if (localAddress.startsWith('http')) {
                return uri_1.URI.parse(localAddress);
            }
            const protocol = attributes?.protocol ?? 'http';
            return uri_1.URI.parse(`${protocol}://${localAddress}`);
        }
        async Y() {
            const workspace = this.N.getWorkspace();
            const workspaceHash = workspace.configuration ? (0, hash_1.$pi)(workspace.configuration.path) : (workspace.folders.length > 0 ? (0, hash_1.$pi)(workspace.folders[0].uri.path) : undefined);
            if (workspaceHash === undefined) {
                this.O.debug('Could not get workspace hash for forwarded ports storage key.');
                return undefined;
            }
            return `${TUNNELS_TO_RESTORE}.${this.L.remoteAuthority}.${workspaceHash}`;
        }
        async Z() {
            const deprecatedValue = this.I.get(TUNNELS_TO_RESTORE, 1 /* StorageScope.WORKSPACE */);
            if (deprecatedValue) {
                this.I.remove(TUNNELS_TO_RESTORE, 1 /* StorageScope.WORKSPACE */);
                await this.$();
                return deprecatedValue;
            }
            const storageKey = await this.Y();
            if (!storageKey) {
                return undefined;
            }
            return this.I.get(storageKey, 0 /* StorageScope.PROFILE */);
        }
        async restoreForwarded() {
            if (this.J.getValue('remote.restoreForwardedPorts')) {
                const tunnelRestoreValue = await this.s;
                if (tunnelRestoreValue && (tunnelRestoreValue !== this.y)) {
                    const tunnels = JSON.parse(tunnelRestoreValue) ?? [];
                    this.O.trace(`ForwardedPorts: (TunnelModel) restoring ports ${tunnels.map(tunnel => tunnel.remotePort).join(', ')}`);
                    for (const tunnel of tunnels) {
                        const alreadyForwarded = $oJ(this.detected, tunnel.remoteHost, tunnel.remotePort);
                        // Extension forwarded ports should only be updated, not restored.
                        if ((tunnel.source.source !== TunnelSource.Extension && !alreadyForwarded) || (tunnel.source.source === TunnelSource.Extension && alreadyForwarded)) {
                            await this.cb({
                                remote: { host: tunnel.remoteHost, port: tunnel.remotePort },
                                local: tunnel.localPort,
                                name: tunnel.name,
                                privacy: tunnel.privacy,
                                elevateIfNeeded: true,
                                source: tunnel.source
                            });
                        }
                        else if (tunnel.source.source === TunnelSource.Extension && !alreadyForwarded) {
                            this.D.set($pJ(tunnel.remoteHost, tunnel.remotePort), tunnel);
                        }
                    }
                }
            }
            this.z = true;
            this.C.fire();
            if (!this.w) {
                // It's possible that at restore time the value hasn't synced.
                const key = await this.Y();
                this.w = this.B(new lifecycle_1.$jc());
                this.w.add(this.I.onDidChangeValue(0 /* StorageScope.PROFILE */, undefined, this.w)(async (e) => {
                    if (e.key === key) {
                        this.s = Promise.resolve(this.I.get(key, 0 /* StorageScope.PROFILE */));
                        await this.restoreForwarded();
                    }
                }));
            }
        }
        async $() {
            if (this.J.getValue('remote.restoreForwardedPorts')) {
                const valueToStore = JSON.stringify(Array.from(this.forwarded.values()));
                if (valueToStore !== this.y) {
                    this.y = valueToStore;
                    const key = await this.Y();
                    if (key) {
                        this.I.store(key, this.y, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                    }
                }
            }
        }
        async bb(tunnel, expectedLocal, attributes) {
            if (!tunnel.tunnelLocalPort || !attributes?.requireLocalPort) {
                return;
            }
            if (tunnel.tunnelLocalPort === expectedLocal) {
                return;
            }
            const newCooldown = new Date();
            if ((this.ab.getTime() + MISMATCH_LOCAL_PORT_COOLDOWN) > newCooldown.getTime()) {
                return;
            }
            this.ab = newCooldown;
            const mismatchString = nls.localize(3, null, expectedLocal, tunnel.tunnelRemotePort, tunnel.tunnelLocalPort);
            return this.P.info(mismatchString);
        }
        async forward(tunnelProperties, attributes) {
            if (!this.z && this.L.remoteAuthority) {
                await event_1.Event.toPromise(this.C.event);
            }
            return this.cb(tunnelProperties, attributes);
        }
        async cb(tunnelProperties, attributes) {
            await this.Q.activateByEvent(exports.$iJ);
            const existingTunnel = $oJ(this.forwarded, tunnelProperties.remote.host, tunnelProperties.remote.port);
            attributes = attributes ??
                ((attributes !== null)
                    ? (await this.getAttributes([tunnelProperties.remote]))?.get(tunnelProperties.remote.port)
                    : undefined);
            const localPort = (tunnelProperties.local !== undefined) ? tunnelProperties.local : tunnelProperties.remote.port;
            let noTunnelValue;
            if (!existingTunnel) {
                const authority = this.L.remoteAuthority;
                const addressProvider = authority ? {
                    getAddress: async () => { return (await this.M.resolveAuthority(authority)).authority; }
                } : undefined;
                const key = $pJ(tunnelProperties.remote.host, tunnelProperties.remote.port);
                this.c.set(key, true);
                tunnelProperties = this.db(key, tunnelProperties);
                const tunnel = await this.H.openTunnel(addressProvider, tunnelProperties.remote.host, tunnelProperties.remote.port, undefined, localPort, (!tunnelProperties.elevateIfNeeded) ? attributes?.elevateIfNeeded : tunnelProperties.elevateIfNeeded, tunnelProperties.privacy, attributes?.protocol);
                if (typeof tunnel === 'string') {
                    // There was an error  while creating the tunnel.
                    noTunnelValue = tunnel;
                }
                else if (tunnel && tunnel.localAddress) {
                    const matchingCandidate = $oJ(this.m ?? new Map(), tunnelProperties.remote.host, tunnelProperties.remote.port);
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
                        localUri: await this.X(tunnel.localAddress, attributes),
                        runningProcess: matchingCandidate?.detail,
                        hasRunningProcess: !!matchingCandidate,
                        pid: matchingCandidate?.pid,
                        source: tunnelProperties.source ?? exports.$lJ,
                        privacy: tunnel.privacy,
                    };
                    this.forwarded.set(key, newForward);
                    this.f.set(key, tunnel);
                    this.c.delete(key);
                    await this.$();
                    await this.bb(tunnel, localPort, attributes);
                    this.g.fire(newForward);
                    return tunnel;
                }
                this.c.delete(key);
            }
            else {
                return this.eb(existingTunnel, tunnelProperties, attributes);
            }
            return noTunnelValue;
        }
        db(key, tunnelProperties) {
            const map = this.D.has(key) ? this.D : (this.F.has(key) ? this.F : undefined);
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
        async eb(existingTunnel, tunnelProperties, attributes) {
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
                    this.g.fire();
                    break;
                }
                case MergedAttributeAction.Reopen: {
                    await this.close(existingTunnel.remoteHost, existingTunnel.remotePort, TunnelCloseReason.User);
                    await this.cb(tunnelProperties, attributes);
                }
            }
            return $oJ(this.f, tunnelProperties.remote.host, tunnelProperties.remote.port);
        }
        async name(host, port, name) {
            const existingForwarded = $oJ(this.forwarded, host, port);
            const key = $pJ(host, port);
            if (existingForwarded) {
                existingForwarded.name = name;
                await this.$();
                this.j.fire({ host, port });
                return;
            }
            else if (this.detected.has(key)) {
                this.detected.get(key).name = name;
                this.j.fire({ host, port });
            }
        }
        async close(host, port, reason) {
            const key = $pJ(host, port);
            const oldTunnel = this.forwarded.get(key);
            if ((reason === TunnelCloseReason.AutoForwardEnd) && oldTunnel && (oldTunnel.source.source === TunnelSource.Auto)) {
                this.F.set(key, {
                    local: oldTunnel.localPort,
                    name: oldTunnel.name,
                    privacy: oldTunnel.privacy,
                });
            }
            await this.H.closeTunnel(host, port);
            return this.W({ host, port }, reason);
        }
        address(host, port) {
            const key = $pJ(host, port);
            return (this.forwarded.get(key) || this.detected.get(key))?.localAddress;
        }
        get environmentTunnelsSet() {
            return this.u;
        }
        addEnvironmentTunnels(tunnels) {
            if (tunnels) {
                for (const tunnel of tunnels) {
                    const matchingCandidate = $oJ(this.m ?? new Map(), tunnel.remoteAddress.host, tunnel.remoteAddress.port);
                    const localAddress = typeof tunnel.localAddress === 'string' ? tunnel.localAddress : $pJ(tunnel.localAddress.host, tunnel.localAddress.port);
                    this.detected.set($pJ(tunnel.remoteAddress.host, tunnel.remoteAddress.port), {
                        remoteHost: tunnel.remoteAddress.host,
                        remotePort: tunnel.remoteAddress.port,
                        localAddress: localAddress,
                        protocol: tunnel_1.TunnelProtocol.Http,
                        localUri: this.X(localAddress),
                        closeable: false,
                        runningProcess: matchingCandidate?.detail,
                        hasRunningProcess: !!matchingCandidate,
                        pid: matchingCandidate?.pid,
                        privacy: tunnel_1.TunnelPrivacyId.ConstantPrivate,
                        source: {
                            source: TunnelSource.Extension,
                            description: nls.localize(4, null)
                        }
                    });
                    this.H.setEnvironmentTunnel(tunnel.remoteAddress.host, tunnel.remoteAddress.port, localAddress, tunnel_1.TunnelPrivacyId.ConstantPrivate, tunnel_1.TunnelProtocol.Http);
                }
            }
            this.u = true;
            this.t.fire();
            this.g.fire();
        }
        setCandidateFilter(filter) {
            this.r = filter;
        }
        async setCandidates(candidates) {
            let processedCandidates = candidates;
            if (this.r) {
                // When an extension provides a filter, we do the filtering on the extension host before the candidates are set here.
                // However, when the filter doesn't come from an extension we filter here.
                processedCandidates = await this.r(candidates);
            }
            const removedCandidates = this.fb(processedCandidates);
            this.O.trace(`ForwardedPorts: (TunnelModel) removed candidates ${Array.from(removedCandidates.values()).map(candidate => candidate.port).join(', ')}`);
            this.n.fire(removedCandidates);
        }
        // Returns removed candidates
        fb(candidates) {
            const removedCandidates = this.m ?? new Map();
            const candidatesMap = new Map();
            this.m = candidatesMap;
            candidates.forEach(value => {
                const addressKey = $pJ(value.host, value.port);
                candidatesMap.set(addressKey, {
                    host: value.host,
                    port: value.port,
                    detail: value.detail,
                    pid: value.pid
                });
                if (removedCandidates.has(addressKey)) {
                    removedCandidates.delete(addressKey);
                }
                const forwardedValue = $oJ(this.forwarded, value.host, value.port);
                if (forwardedValue) {
                    forwardedValue.runningProcess = value.detail;
                    forwardedValue.hasRunningProcess = true;
                    forwardedValue.pid = value.pid;
                }
            });
            removedCandidates.forEach((_value, key) => {
                const parsedAddress = $kJ(key);
                if (!parsedAddress) {
                    return;
                }
                const forwardedValue = $oJ(this.forwarded, parsedAddress.host, parsedAddress.port);
                if (forwardedValue) {
                    forwardedValue.runningProcess = undefined;
                    forwardedValue.hasRunningProcess = false;
                    forwardedValue.pid = undefined;
                }
                const detectedValue = $oJ(this.detected, parsedAddress.host, parsedAddress.port);
                if (detectedValue) {
                    detectedValue.runningProcess = undefined;
                    detectedValue.hasRunningProcess = false;
                    detectedValue.pid = undefined;
                }
            });
            return removedCandidates;
        }
        get candidates() {
            return this.m ? Array.from(this.m.values()) : [];
        }
        get candidatesOrUndefined() {
            return this.m ? this.candidates : undefined;
        }
        async gb() {
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
                    await this.cb({
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
                const matchingCandidate = $oJ(this.m ?? new Map(), tunnel_1.$1z[0], forwardedPort.port) ?? forwardedPort;
                if (matchingCandidate) {
                    matchingCandidates.set(forwardedPort.port, matchingCandidate);
                    const pid = $qJ(matchingCandidate) ? matchingCandidate.pid : undefined;
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
            if ((this.G.length === 0) || !checkProviders) {
                return (configAttributes.size > 0) ? configAttributes : undefined;
            }
            // Group calls to provide attributes by pid.
            const allProviderResults = await Promise.all((0, arrays_1.$Pb)(this.G.map(provider => {
                return Array.from(pidToPortsMapping.entries()).map(entry => {
                    const portGroup = entry[1];
                    const matchingCandidate = matchingCandidates.get(portGroup[0]);
                    return provider.providePortAttributes(portGroup, matchingCandidate?.pid, matchingCandidate?.detail, new cancellation_1.$pd().token);
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
                    onAutoForward: config?.onAutoForward ?? $rJ.providedActionToAction(provider?.autoForwardAction),
                    requireLocalPort: config?.requireLocalPort,
                    protocol: config?.protocol
                });
            });
            return mergedAttributes;
        }
        addAttributesProvider(provider) {
            this.G.push(provider);
        }
    };
    exports.$sJ = $sJ;
    __decorate([
        (0, decorators_1.$7g)(1000)
    ], $sJ.prototype, "$", null);
    exports.$sJ = $sJ = __decorate([
        __param(0, tunnel_1.$Wz),
        __param(1, storage_1.$Vo),
        __param(2, configuration_1.$8h),
        __param(3, environmentService_1.$hJ),
        __param(4, remoteAuthorityResolver_1.$Jk),
        __param(5, workspace_1.$Kh),
        __param(6, log_1.$5i),
        __param(7, dialogs_1.$oA),
        __param(8, extensions_1.$MF),
        __param(9, contextkey_1.$3i)
    ], $sJ);
});
//# sourceMappingURL=tunnelModel.js.map