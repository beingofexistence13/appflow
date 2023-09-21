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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/performance", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/stopwatch", "vs/nls!vs/workbench/services/extensions/common/abstractExtensionService", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/extensionManagement/common/implicitActivationEvents", "vs/platform/extensions/common/extensions", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/remoteExtensionsScanner", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensionDescriptionRegistry", "vs/workbench/services/extensions/common/extensionDevOptions", "vs/workbench/services/extensions/common/extensionHostKind", "vs/workbench/services/extensions/common/extensionHostManager", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/services/extensions/common/extensionRunningLocation", "vs/workbench/services/extensions/common/extensionRunningLocationTracker", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/extensions/common/workspaceContains", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, async_1, errorMessage_1, event_1, lifecycle_1, network_1, perf, platform_1, resources_1, stopwatch_1, nls, configuration_1, dialogs_1, implicitActivationEvents_1, extensions_1, files_1, instantiation_1, lifecycle_2, log_1, notification_1, productService_1, remoteAuthorityResolver_1, remoteExtensionsScanner_1, telemetry_1, workspace_1, environmentService_1, extensionManagement_1, extensionDescriptionRegistry_1, extensionDevOptions_1, extensionHostKind_1, extensionHostManager_1, extensionManifestPropertiesService_1, extensionRunningLocation_1, extensionRunningLocationTracker_1, extensions_2, extensionsRegistry_1, workspaceContains_1, lifecycle_3, remoteAgentService_1) {
    "use strict";
    var $N3b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$T3b = exports.$S3b = exports.$R3b = exports.$Q3b = exports.$P3b = exports.$O3b = exports.$N3b = void 0;
    const hasOwnProperty = Object.hasOwnProperty;
    const NO_OP_VOID_PROMISE = Promise.resolve(undefined);
    let $N3b = $N3b_1 = class $N3b extends lifecycle_1.$kc {
        constructor(F, G, H, I, J, L, M, N, O, P, Q, R, S, U, W, X, Y, Z, $, ab) {
            super();
            this.F = F;
            this.G = G;
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
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.a = this.B(new event_1.$fd());
            this.onDidRegisterExtensions = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeExtensionsStatus = this.b.event;
            this.c = this.B(new event_1.$fd({ leakWarningThreshold: 400 }));
            this.onDidChangeExtensions = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onWillActivateByEvent = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeResponsiveChange = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onWillStop = this.h.event;
            this.j = new ImplicitActivationAwareReader();
            this.m = new extensionDescriptionRegistry_1.$B3b(this.j);
            this.n = new async_1.$Fg();
            this.s = new extensions_1.$Xl();
            this.t = new Set();
            this.w = new $T3b();
            this.y = [];
            this.z = false;
            this.C = [];
            this.D = 0;
            // help the file service to activate providers by activating extensions by file system event
            this.B(this.O.onWillActivateFileSystemProvider(e => {
                if (e.scheme !== network_1.Schemas.vscodeRemote) {
                    e.join(this.activateByEvent(`onFileSystem:${e.scheme}`));
                }
            }));
            this.u = new extensionRunningLocationTracker_1.$J3b(this.m, this.H, this.L, this.S, this.W, this.U);
            this.B(this.N.onEnablementChanged((extensions) => {
                const toAdd = [];
                const toRemove = [];
                for (const extension of extensions) {
                    if (this.Eb(extension)) {
                        // an extension has been enabled
                        toAdd.push(extension);
                    }
                    else {
                        // an extension has been disabled
                        toRemove.push(extension);
                    }
                }
                if (platform_1.$s) {
                    this.W.info(`AbstractExtensionService.onEnablementChanged fired for ${extensions.map(e => e.identifier.id).join(', ')}`);
                }
                this.db(new DeltaExtensionsQueueItem(toAdd, toRemove));
            }));
            this.B(this.Q.onDidChangeProfile(({ added, removed }) => {
                if (added.length || removed.length) {
                    if (platform_1.$s) {
                        this.W.info(`AbstractExtensionService.onDidChangeProfile fired`);
                    }
                    this.db(new DeltaExtensionsQueueItem(added, removed));
                }
            }));
            this.B(this.Q.onDidInstallExtensions((result) => {
                const extensions = [];
                for (const { local, operation } of result) {
                    if (local && operation !== 4 /* InstallOperation.Migrate */ && this.Eb(local)) {
                        extensions.push(local);
                    }
                }
                if (extensions.length) {
                    if (platform_1.$s) {
                        this.W.info(`AbstractExtensionService.onDidInstallExtensions fired for ${extensions.map(e => e.identifier.id).join(', ')}`);
                    }
                    this.db(new DeltaExtensionsQueueItem(extensions, []));
                }
            }));
            this.B(this.Q.onDidUninstallExtension((event) => {
                if (!event.error) {
                    // an extension has been uninstalled
                    if (platform_1.$s) {
                        this.W.info(`AbstractExtensionService.onDidUninstallExtension fired for ${event.identifier.id}`);
                    }
                    this.db(new DeltaExtensionsQueueItem([], [event.identifier.id]));
                }
            }));
            this.B(this.Z.onDidShutdown(() => {
                // We need to disconnect the management connection before killing the local extension host.
                // Otherwise, the local extension host might terminate the underlying tunnel before the
                // management connection has a chance to send its disconnection message.
                const connection = this.X.getConnection();
                connection?.dispose();
                this.sb();
            }));
        }
        bb(kind) {
            return this.C.filter(extHostManager => extHostManager.kind === kind);
        }
        cb(runningLocation) {
            for (const extensionHostManager of this.C) {
                if (extensionHostManager.representsRunningLocation(runningLocation)) {
                    return extensionHostManager;
                }
            }
            return null;
        }
        //#region deltaExtensions
        async db(item) {
            this.y.push(item);
            if (this.z) {
                // Let the current item finish, the new one will be picked up
                return;
            }
            let lock = null;
            try {
                this.z = true;
                // wait for _initialize to finish before hanlding any delta extension events
                await this.n.wait();
                lock = await this.m.acquireLock('handleDeltaExtensions');
                while (this.y.length > 0) {
                    const item = this.y.shift();
                    await this.eb(lock, item.toAdd, item.toRemove);
                }
            }
            finally {
                this.z = false;
                lock?.dispose();
            }
        }
        async eb(lock, _toAdd, _toRemove) {
            if (platform_1.$s) {
                this.W.info(`AbstractExtensionService._deltaExtensions: toAdd: [${_toAdd.map(e => e.identifier.id).join(',')}] toRemove: [${_toRemove.map(e => typeof e === 'string' ? e : e.identifier.id).join(',')}]`);
            }
            let toRemove = [];
            for (let i = 0, len = _toRemove.length; i < len; i++) {
                const extensionOrId = _toRemove[i];
                const extensionId = (typeof extensionOrId === 'string' ? extensionOrId : extensionOrId.identifier.id);
                const extension = (typeof extensionOrId === 'string' ? null : extensionOrId);
                const extensionDescription = this.m.getExtensionDescription(extensionId);
                if (!extensionDescription) {
                    // ignore disabling/uninstalling an extension which is not running
                    continue;
                }
                if (extension && extensionDescription.extensionLocation.scheme !== extension.location.scheme) {
                    // this event is for a different extension than mine (maybe for the local extension, while I have the remote extension)
                    continue;
                }
                if (!this.canRemoveExtension(extensionDescription)) {
                    // uses non-dynamic extension point or is activated
                    continue;
                }
                toRemove.push(extensionDescription);
            }
            const toAdd = [];
            for (let i = 0, len = _toAdd.length; i < len; i++) {
                const extension = _toAdd[i];
                const extensionDescription = await this.Pb(extension);
                if (!extensionDescription) {
                    // could not scan extension...
                    continue;
                }
                if (!this.hb(extensionDescription, toRemove)) {
                    continue;
                }
                toAdd.push(extensionDescription);
            }
            if (toAdd.length === 0 && toRemove.length === 0) {
                return;
            }
            // Update the local registry
            const result = this.m.deltaExtensions(lock, toAdd, toRemove.map(e => e.identifier));
            this.c.fire({ added: toAdd, removed: toRemove });
            toRemove = toRemove.concat(result.removedDueToLooping);
            if (result.removedDueToLooping.length > 0) {
                this.J.notify({
                    severity: notification_1.Severity.Error,
                    message: nls.localize(0, null, result.removedDueToLooping.map(e => `'${e.identifier.value}'`).join(', '))
                });
            }
            // enable or disable proposed API per extension
            this.F.updateEnabledApiProposals(toAdd);
            // Update extension points
            this.Fb([].concat(toAdd).concat(toRemove));
            // Update the extension host
            await this.fb(result.versionId, toAdd, toRemove.map(e => e.identifier));
            for (let i = 0; i < toAdd.length; i++) {
                this.ib(toAdd[i]);
            }
        }
        async fb(versionId, toAdd, toRemove) {
            const removedRunningLocation = this.u.deltaExtensions(toAdd, toRemove);
            const promises = this.C.map(extHostManager => this.gb(extHostManager, versionId, toAdd, toRemove, removedRunningLocation));
            await Promise.all(promises);
        }
        async gb(extensionHostManager, versionId, toAdd, toRemove, removedRunningLocation) {
            const myToAdd = this.u.filterByExtensionHostManager(toAdd, extensionHostManager);
            const myToRemove = (0, extensionRunningLocationTracker_1.$L3b)(toRemove, removedRunningLocation, extRunningLocation => extensionHostManager.representsRunningLocation(extRunningLocation));
            const addActivationEvents = implicitActivationEvents_1.$BF.createActivationEventsMap(toAdd);
            if (platform_1.$s) {
                const printExtIds = (extensions) => extensions.map(e => e.identifier.value).join(',');
                const printIds = (extensions) => extensions.map(e => e.value).join(',');
                this.W.info(`AbstractExtensionService: Calling deltaExtensions: toRemove: [${printIds(toRemove)}], toAdd: [${printExtIds(toAdd)}], myToRemove: [${printIds(myToRemove)}], myToAdd: [${printExtIds(myToAdd)}],`);
            }
            await extensionHostManager.deltaExtensions({ versionId, toRemove, toAdd, addActivationEvents, myToRemove, myToAdd: myToAdd.map(extension => extension.identifier) });
        }
        canAddExtension(extension) {
            return this.hb(extension, []);
        }
        hb(extension, extensionsBeingRemoved) {
            // (Also check for renamed extensions)
            const existing = this.m.getExtensionDescriptionByIdOrUUID(extension.identifier, extension.id);
            if (existing) {
                // This extension is already known (most likely at a different version)
                // so it cannot be added again unless it is removed first
                const isBeingRemoved = extensionsBeingRemoved.some((extensionDescription) => extensions_1.$Vl.equals(extension.identifier, extensionDescription.identifier));
                if (!isBeingRemoved) {
                    return false;
                }
            }
            const extensionKinds = this.u.readExtensionKinds(extension);
            const isRemote = extension.extensionLocation.scheme === network_1.Schemas.vscodeRemote;
            const extensionHostKind = this.H.pickExtensionHostKind(extension.identifier, extensionKinds, !isRemote, isRemote, 0 /* ExtensionRunningPreference.None */);
            if (extensionHostKind === null) {
                return false;
            }
            return true;
        }
        canRemoveExtension(extension) {
            const extensionDescription = this.m.getExtensionDescription(extension.identifier);
            if (!extensionDescription) {
                // Can't remove an extension that is unknown!
                return false;
            }
            if (this.s.get(extensionDescription.identifier)?.activationStarted) {
                // Extension is running, cannot remove it safely
                return false;
            }
            return true;
        }
        async ib(extensionDescription) {
            let shouldActivate = false;
            let shouldActivateReason = null;
            let hasWorkspaceContains = false;
            const activationEvents = this.j.readActivationEvents(extensionDescription);
            for (let activationEvent of activationEvents) {
                // TODO@joao: there's no easy way to contribute this
                if (activationEvent === 'onUri') {
                    activationEvent = `onUri:${extensions_1.$Vl.toKey(extensionDescription.identifier)}`;
                }
                if (this.t.has(activationEvent)) {
                    // This activation event was fired before the extension was added
                    shouldActivate = true;
                    shouldActivateReason = activationEvent;
                    break;
                }
                if (activationEvent === '*') {
                    shouldActivate = true;
                    shouldActivateReason = activationEvent;
                    break;
                }
                if (/^workspaceContains/.test(activationEvent)) {
                    hasWorkspaceContains = true;
                }
                if (activationEvent === 'onStartupFinished') {
                    shouldActivate = true;
                    shouldActivateReason = activationEvent;
                    break;
                }
            }
            if (shouldActivate) {
                await Promise.all(this.C.map(extHostManager => extHostManager.activate(extensionDescription.identifier, { startup: false, extensionId: extensionDescription.identifier, activationEvent: shouldActivateReason }))).then(() => { });
            }
            else if (hasWorkspaceContains) {
                const workspace = await this.R.getCompleteWorkspace();
                const forceUsingSearch = !!this.L.remoteAuthority;
                const host = {
                    logService: this.W,
                    folders: workspace.folders.map(folder => folder.uri),
                    forceUsingSearch: forceUsingSearch,
                    exists: (uri) => this.O.exists(uri),
                    checkExists: (folders, includes, token) => this.I.invokeFunction((accessor) => (0, workspaceContains_1.$Alb)(accessor, folders, includes, token))
                };
                const result = await (0, workspaceContains_1.$zlb)(host, extensionDescription);
                if (!result) {
                    return;
                }
                await Promise.all(this.C.map(extHostManager => extHostManager.activate(extensionDescription.identifier, { startup: false, extensionId: extensionDescription.identifier, activationEvent: result.activationEvent }))).then(() => { });
            }
        }
        //#endregion
        async jb() {
            perf.mark('code/willLoadExtensions');
            this.ub(true, []);
            const lock = await this.m.acquireLock('_initialize');
            try {
                const resolvedExtensions = await this.Ob();
                this.kb(lock, resolvedExtensions);
                // Start extension hosts which are not automatically started
                const snapshot = this.m.getSnapshot();
                for (const extHostManager of this.C) {
                    if (extHostManager.startup !== 1 /* ExtensionHostStartup.EagerAutoStart */) {
                        const extensions = this.u.filterByExtensionHostManager(snapshot.extensions, extHostManager);
                        extHostManager.start(snapshot.versionId, snapshot.extensions, extensions.map(extension => extension.identifier));
                    }
                }
            }
            finally {
                lock.dispose();
            }
            this.nb();
            perf.mark('code/didLoadExtensions');
            await this.lb();
        }
        kb(lock, resolvedExtensions) {
            const { allowRemoteExtensionsInLocalWebWorker, hasLocalProcess } = resolvedExtensions;
            const localExtensions = $P3b(this.W, this.N, this.F, resolvedExtensions.local, false);
            let remoteExtensions = $P3b(this.W, this.N, this.F, resolvedExtensions.remote, false);
            // `initializeRunningLocation` will look at the complete picture (e.g. an extension installed on both sides),
            // takes care of duplicates and picks a running location for each extension
            this.u.initializeRunningLocation(localExtensions, remoteExtensions);
            this.ub(true, []);
            // Some remote extensions could run locally in the web worker, so store them
            const remoteExtensionsThatNeedToRunLocally = (allowRemoteExtensionsInLocalWebWorker ? this.u.filterByExtensionHostKind(remoteExtensions, 2 /* ExtensionHostKind.LocalWebWorker */) : []);
            const localProcessExtensions = (hasLocalProcess ? this.u.filterByExtensionHostKind(localExtensions, 1 /* ExtensionHostKind.LocalProcess */) : []);
            const localWebWorkerExtensions = this.u.filterByExtensionHostKind(localExtensions, 2 /* ExtensionHostKind.LocalWebWorker */);
            remoteExtensions = this.u.filterByExtensionHostKind(remoteExtensions, 3 /* ExtensionHostKind.Remote */);
            // Add locally the remote extensions that need to run locally in the web worker
            for (const ext of remoteExtensionsThatNeedToRunLocally) {
                if (!includes(localWebWorkerExtensions, ext.identifier)) {
                    localWebWorkerExtensions.push(ext);
                }
            }
            const allExtensions = remoteExtensions.concat(localProcessExtensions).concat(localWebWorkerExtensions);
            const result = this.m.deltaExtensions(lock, allExtensions, []);
            if (result.removedDueToLooping.length > 0) {
                this.J.notify({
                    severity: notification_1.Severity.Error,
                    message: nls.localize(1, null, result.removedDueToLooping.map(e => `'${e.identifier.value}'`).join(', '))
                });
            }
            this.Fb(this.m.getAllExtensionDescriptions());
        }
        async lb() {
            if (!this.L.isExtensionDevelopment || !this.L.extensionTestsLocationURI) {
                return;
            }
            const extensionHostManager = this.mb(this.L.extensionTestsLocationURI);
            if (!extensionHostManager) {
                const msg = nls.localize(2, null, this.L.extensionTestsLocationURI.toString());
                console.error(msg);
                this.J.error(msg);
                return;
            }
            let exitCode;
            try {
                exitCode = await extensionHostManager.extensionTestsExecute();
                if (platform_1.$s) {
                    this.W.info(`Extension host test runner exit code: ${exitCode}`);
                }
            }
            catch (err) {
                if (platform_1.$s) {
                    this.W.error(`Extension host test runner error`, err);
                }
                console.error(err);
                exitCode = 1 /* ERROR */;
            }
            this.Qb(exitCode);
        }
        mb(testLocation) {
            let runningLocation = null;
            for (const extension of this.m.getAllExtensionDescriptions()) {
                if ((0, resources_1.$cg)(testLocation, extension.extensionLocation)) {
                    runningLocation = this.u.getRunningLocation(extension.identifier);
                    break;
                }
            }
            if (runningLocation === null) {
                // not sure if we should support that, but it was possible to have an test outside an extension
                if (testLocation.scheme === network_1.Schemas.vscodeRemote) {
                    runningLocation = new extensionRunningLocation_1.$IF();
                }
                else {
                    // When a debugger attaches to the extension host, it will surface all console.log messages from the extension host,
                    // but not necessarily from the window. So it would be best if any errors get printed to the console of the extension host.
                    // That is why here we use the local process extension host even for non-file URIs
                    runningLocation = new extensionRunningLocation_1.$GF(0);
                }
            }
            if (runningLocation !== null) {
                return this.cb(runningLocation);
            }
            return null;
        }
        nb() {
            this.n.open();
            this.a.fire(undefined);
            this.b.fire(this.m.getAllExtensionDescriptions().map(e => e.identifier));
        }
        //#region remote authority resolving
        async ob(remoteAuthority) {
            const MAX_ATTEMPTS = 5;
            for (let attempt = 1;; attempt++) {
                try {
                    return this.qb(remoteAuthority);
                }
                catch (err) {
                    if (remoteAuthorityResolver_1.$Mk.isNoResolverFound(err)) {
                        // There is no point in retrying if there is no resolver found
                        throw err;
                    }
                    if (remoteAuthorityResolver_1.$Mk.isNotAvailable(err)) {
                        // The resolver is not available and asked us to not retry
                        throw err;
                    }
                    if (attempt >= MAX_ATTEMPTS) {
                        // Too many failed attempts, give up
                        throw err;
                    }
                }
            }
        }
        async pb() {
            const remoteAuthority = this.L.remoteAuthority;
            if (!remoteAuthority) {
                return;
            }
            this.$._clearResolvedAuthority(remoteAuthority);
            try {
                const result = await this.qb(remoteAuthority);
                this.$._setResolvedAuthority(result.authority, result.options);
            }
            catch (err) {
                this.$._setResolvedAuthorityError(remoteAuthority, err);
            }
        }
        async qb(remoteAuthority) {
            const authorityPrefix = (0, remoteAuthorityResolver_1.$Nk)(remoteAuthority);
            const sw = stopwatch_1.$bd.create(false);
            this.W.info(`Invoking resolveAuthority(${authorityPrefix})...`);
            try {
                perf.mark(`code/willResolveAuthority/${authorityPrefix}`);
                const result = await this.Rb(remoteAuthority);
                perf.mark(`code/didResolveAuthorityOK/${authorityPrefix}`);
                this.W.info(`resolveAuthority(${authorityPrefix}) returned '${result.authority.connectTo}' after ${sw.elapsed()} ms`);
                return result;
            }
            catch (err) {
                perf.mark(`code/didResolveAuthorityError/${authorityPrefix}`);
                this.W.error(`resolveAuthority(${authorityPrefix}) returned an error after ${sw.elapsed()} ms`, err);
                throw err;
            }
        }
        async rb(kind, remoteAuthority) {
            const extensionHosts = this.bb(kind);
            if (extensionHosts.length === 0) {
                // no local process extension hosts
                throw new Error(`Cannot resolve authority`);
            }
            this.D++;
            const results = await Promise.all(extensionHosts.map(extHost => extHost.resolveAuthority(remoteAuthority, this.D)));
            let bestErrorResult = null;
            for (const result of results) {
                if (result.type === 'ok') {
                    return result.value;
                }
                if (!bestErrorResult) {
                    bestErrorResult = result;
                    continue;
                }
                const bestErrorIsUnknown = (bestErrorResult.error.code === remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.Unknown);
                const errorIsUnknown = (result.error.code === remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.Unknown);
                if (bestErrorIsUnknown && !errorIsUnknown) {
                    bestErrorResult = result;
                }
            }
            // we can only reach this if there is an error
            throw new remoteAuthorityResolver_1.$Mk(bestErrorResult.error.message, bestErrorResult.error.code, bestErrorResult.error.detail);
        }
        //#endregion
        //#region Stopping / Starting / Restarting
        stopExtensionHosts(reason) {
            return this.tb(reason);
        }
        sb() {
            const previouslyActivatedExtensionIds = [];
            for (const extensionStatus of this.s.values()) {
                if (extensionStatus.activationStarted) {
                    previouslyActivatedExtensionIds.push(extensionStatus.id);
                }
            }
            // See https://github.com/microsoft/vscode/issues/152204
            // Dispose extension hosts in reverse creation order because the local extension host
            // might be critical in sustaining a connection to the remote extension host
            for (let i = this.C.length - 1; i >= 0; i--) {
                this.C[i].dispose();
            }
            this.C = [];
            for (const extensionStatus of this.s.values()) {
                extensionStatus.clearRuntimeStatus();
            }
            if (previouslyActivatedExtensionIds.length > 0) {
                this.b.fire(previouslyActivatedExtensionIds);
            }
        }
        async tb(reason) {
            const vetos = [];
            const vetoReasons = new Set();
            this.h.fire({
                reason,
                veto(value, reason) {
                    vetos.push(value);
                    if (typeof value === 'boolean') {
                        if (value === true) {
                            vetoReasons.add(reason);
                        }
                    }
                    else {
                        value.then(value => {
                            if (value) {
                                vetoReasons.add(reason);
                            }
                        }).catch(error => {
                            vetoReasons.add(nls.localize(3, null, reason, (0, errorMessage_1.$mi)(error)));
                        });
                    }
                }
            });
            const veto = await (0, lifecycle_2.$w3b)(vetos, error => this.W.error(error));
            if (!veto) {
                this.sb();
            }
            else {
                const vetoReasonsArray = Array.from(vetoReasons);
                this.W.warn(`Extension host was not stopped because of veto (stop reason: ${reason}, veto reason: ${vetoReasonsArray.join(', ')})`);
                await this.ab.warn(nls.localize(4, null, reason), vetoReasonsArray.length === 1 ?
                    nls.localize(5, null, vetoReasonsArray[0]) :
                    nls.localize(6, null, vetoReasonsArray.join('\n -')));
            }
            return !veto;
        }
        ub(isInitialStart, initialActivationEvents) {
            const locations = [];
            for (let affinity = 0; affinity <= this.u.maxLocalProcessAffinity; affinity++) {
                locations.push(new extensionRunningLocation_1.$GF(affinity));
            }
            for (let affinity = 0; affinity <= this.u.maxLocalWebWorkerAffinity; affinity++) {
                locations.push(new extensionRunningLocation_1.$HF(affinity));
            }
            locations.push(new extensionRunningLocation_1.$IF());
            for (const location of locations) {
                if (this.cb(location)) {
                    // already running
                    continue;
                }
                const extHostManager = this.vb(location, isInitialStart, initialActivationEvents);
                if (extHostManager) {
                    this.C.push(extHostManager);
                }
            }
        }
        vb(runningLocation, isInitialStart, initialActivationEvents) {
            const extensionHost = this.G.createExtensionHost(this.u, runningLocation, isInitialStart);
            if (!extensionHost) {
                return null;
            }
            const processManager = this.wb(extensionHost, initialActivationEvents);
            processManager.onDidExit(([code, signal]) => this.xb(processManager, code, signal));
            processManager.onDidChangeResponsiveState((responsiveState) => {
                this.g.fire({
                    extensionHostKind: processManager.kind,
                    isResponsive: responsiveState === 0 /* ResponsiveState.Responsive */,
                    getInspectPort: (tryEnableInspector) => {
                        return processManager.getInspectPort(tryEnableInspector);
                    }
                });
            });
            return processManager;
        }
        wb(extensionHost, initialActivationEvents) {
            return (0, extensionHostManager_1.$I3b)(this.I, extensionHost, initialActivationEvents, this.Jb(extensionHost));
        }
        xb(extensionHost, code, signal) {
            // Unexpected termination
            const isExtensionDevHost = (0, extensionDevOptions_1.$Ccb)(this.L).isExtensionDevHost;
            if (!isExtensionDevHost) {
                this.yb(extensionHost, code, signal);
                return;
            }
            this.Qb(code);
        }
        yb(extensionHost, code, signal) {
            console.error(`Extension host (${(0, extensionHostKind_1.$DF)(extensionHost.kind)}) terminated unexpectedly. Code: ${code}, Signal: ${signal}`);
            if (extensionHost.kind === 1 /* ExtensionHostKind.LocalProcess */) {
                this.sb();
            }
            else if (extensionHost.kind === 3 /* ExtensionHostKind.Remote */) {
                if (signal) {
                    this.Ab(extensionHost, signal);
                }
                for (let i = 0; i < this.C.length; i++) {
                    if (this.C[i] === extensionHost) {
                        this.C[i].dispose();
                        this.C.splice(i, 1);
                        break;
                    }
                }
            }
        }
        zb(reconnectionToken) {
            return new Promise((resolve, reject) => {
                const timeoutHandle = setTimeout(() => {
                    reject(new Error('getExtensionHostExitInfo timed out'));
                }, 2000);
                this.X.getExtensionHostExitInfo(reconnectionToken).then((r) => {
                    clearTimeout(timeoutHandle);
                    resolve(r);
                }, reject);
            });
        }
        async Ab(extensionHost, reconnectionToken) {
            try {
                const info = await this.zb(reconnectionToken);
                if (info) {
                    this.W.error(`Extension host (${(0, extensionHostKind_1.$DF)(extensionHost.kind)}) terminated unexpectedly with code ${info.code}.`);
                }
                this.Bb(extensionHost);
                this.w.registerCrash();
                if (this.w.shouldAutomaticallyRestart()) {
                    this.W.info(`Automatically restarting the remote extension host.`);
                    this.J.status(nls.localize(7, null), { hideAfter: 5000 });
                    this.ub(false, Array.from(this.t.keys()));
                }
                else {
                    this.J.prompt(notification_1.Severity.Error, nls.localize(8, null), [{
                            label: nls.localize(9, null),
                            run: () => {
                                this.ub(false, Array.from(this.t.keys()));
                            }
                        }]);
                }
            }
            catch (err) {
                // maybe this wasn't an extension host crash and it was a permanent disconnection
            }
        }
        Bb(extensionHost) {
            const activatedExtensions = [];
            for (const extensionStatus of this.s.values()) {
                if (extensionStatus.activationStarted && extensionHost.containsExtension(extensionStatus.id)) {
                    activatedExtensions.push(extensionStatus.id);
                }
            }
            if (activatedExtensions.length > 0) {
                this.W.error(`Extension host (${(0, extensionHostKind_1.$DF)(extensionHost.kind)}) terminated unexpectedly. The following extensions were running: ${activatedExtensions.map(id => id.value).join(', ')}`);
            }
            else {
                this.W.error(`Extension host (${(0, extensionHostKind_1.$DF)(extensionHost.kind)}) terminated unexpectedly. No extensions were activated.`);
            }
        }
        async startExtensionHosts() {
            this.sb();
            const lock = await this.m.acquireLock('startExtensionHosts');
            try {
                this.ub(false, Array.from(this.t.keys()));
                const localProcessExtensionHosts = this.bb(1 /* ExtensionHostKind.LocalProcess */);
                await Promise.all(localProcessExtensionHosts.map(extHost => extHost.ready()));
            }
            finally {
                lock.dispose();
            }
        }
        //#endregion
        //#region IExtensionService
        activateByEvent(activationEvent, activationKind = 0 /* ActivationKind.Normal */) {
            if (this.n.isOpen()) {
                // Extensions have been scanned and interpreted
                // Record the fact that this activationEvent was requested (in case of a restart)
                this.t.add(activationEvent);
                if (!this.m.containsActivationEvent(activationEvent)) {
                    // There is no extension that is interested in this activation event
                    return NO_OP_VOID_PROMISE;
                }
                return this.Cb(activationEvent, activationKind);
            }
            else {
                // Extensions have not been scanned yet.
                // Record the fact that this activationEvent was requested (in case of a restart)
                this.t.add(activationEvent);
                if (activationKind === 1 /* ActivationKind.Immediate */) {
                    // Do not wait for the normal start-up of the extension host(s)
                    return this.Cb(activationEvent, activationKind);
                }
                return this.n.wait().then(() => this.Cb(activationEvent, activationKind));
            }
        }
        Cb(activationEvent, activationKind) {
            const result = Promise.all(this.C.map(extHostManager => extHostManager.activateByEvent(activationEvent, activationKind))).then(() => { });
            this.f.fire({
                event: activationEvent,
                activation: result
            });
            return result;
        }
        activationEventIsDone(activationEvent) {
            if (!this.n.isOpen()) {
                return false;
            }
            if (!this.m.containsActivationEvent(activationEvent)) {
                // There is no extension that is interested in this activation event
                return true;
            }
            return this.C.every(manager => manager.activationEventIsDone(activationEvent));
        }
        whenInstalledExtensionsRegistered() {
            return this.n.wait();
        }
        get extensions() {
            return this.m.getAllExtensionDescriptions();
        }
        Db() {
            return this.n.wait().then(() => this.m.getSnapshot());
        }
        getExtension(id) {
            return this.n.wait().then(() => {
                return this.m.getExtensionDescription(id);
            });
        }
        readExtensionPointContributions(extPoint) {
            return this.n.wait().then(() => {
                const availableExtensions = this.m.getAllExtensionDescriptions();
                const result = [];
                for (const desc of availableExtensions) {
                    if (desc.contributes && hasOwnProperty.call(desc.contributes, extPoint.name)) {
                        result.push(new extensions_2.$SF(desc, desc.contributes[extPoint.name]));
                    }
                }
                return result;
            });
        }
        getExtensionsStatus() {
            const result = Object.create(null);
            if (this.m) {
                const extensions = this.m.getAllExtensionDescriptions();
                for (const extension of extensions) {
                    const extensionStatus = this.s.get(extension.identifier);
                    result[extension.identifier.value] = {
                        id: extension.identifier,
                        messages: extensionStatus?.messages ?? [],
                        activationStarted: extensionStatus?.activationStarted ?? false,
                        activationTimes: extensionStatus?.activationTimes ?? undefined,
                        runtimeErrors: extensionStatus?.runtimeErrors ?? [],
                        runningLocation: this.u.getRunningLocation(extension.identifier),
                    };
                }
            }
            return result;
        }
        async getInspectPorts(extensionHostKind, tryEnableInspector) {
            const result = await Promise.all(this.bb(extensionHostKind).map(extHost => extHost.getInspectPort(tryEnableInspector)));
            // remove 0s:
            return result.filter(element => Boolean(element));
        }
        async setRemoteEnvironment(env) {
            await this.C
                .map(manager => manager.setRemoteEnvironment(env));
        }
        //#endregion
        // --- impl
        Eb(extension) {
            try {
                return this.N.isEnabled(extension);
            }
            catch (err) {
                return false;
            }
        }
        Fb(affectedExtensions) {
            const affectedExtensionPoints = Object.create(null);
            for (const extensionDescription of affectedExtensions) {
                if (extensionDescription.contributes) {
                    for (const extPointName in extensionDescription.contributes) {
                        if (hasOwnProperty.call(extensionDescription.contributes, extPointName)) {
                            affectedExtensionPoints[extPointName] = true;
                        }
                    }
                }
            }
            const messageHandler = (msg) => this.Hb(msg);
            const availableExtensions = this.m.getAllExtensionDescriptions();
            const extensionPoints = extensionsRegistry_1.$2F.getExtensionPoints();
            perf.mark('code/willHandleExtensionPoints');
            for (const extensionPoint of extensionPoints) {
                if (affectedExtensionPoints[extensionPoint.name]) {
                    perf.mark(`code/willHandleExtensionPoint/${extensionPoint.name}`);
                    $N3b_1.Ib(extensionPoint, availableExtensions, messageHandler);
                    perf.mark(`code/didHandleExtensionPoint/${extensionPoint.name}`);
                }
            }
            perf.mark('code/didHandleExtensionPoints');
        }
        Gb(extensionId) {
            if (!this.s.has(extensionId)) {
                this.s.set(extensionId, new $S3b(extensionId));
            }
            return this.s.get(extensionId);
        }
        Hb(msg) {
            const extensionStatus = this.Gb(msg.extensionId);
            extensionStatus.addMessage(msg);
            const extension = this.m.getExtensionDescription(msg.extensionId);
            const strMsg = `[${msg.extensionId.value}]: ${msg.message}`;
            if (msg.type === notification_1.Severity.Error) {
                if (extension && extension.isUnderDevelopment) {
                    // This message is about the extension currently being developed
                    this.J.notify({ severity: notification_1.Severity.Error, message: strMsg });
                }
                this.W.error(strMsg);
            }
            else if (msg.type === notification_1.Severity.Warning) {
                if (extension && extension.isUnderDevelopment) {
                    // This message is about the extension currently being developed
                    this.J.notify({ severity: notification_1.Severity.Warning, message: strMsg });
                }
                this.W.warn(strMsg);
            }
            else {
                this.W.info(strMsg);
            }
            if (msg.extensionId && this.L.isBuilt && !this.L.isExtensionDevelopment) {
                const { type, extensionId, extensionPointId, message } = msg;
                this.M.publicLog2('extensionsMessage', {
                    type, extensionId: extensionId.value, extensionPointId, message
                });
            }
        }
        static Ib(extensionPoint, availableExtensions, messageHandler) {
            const users = [];
            for (const desc of availableExtensions) {
                if (desc.contributes && hasOwnProperty.call(desc.contributes, extensionPoint.name)) {
                    users.push({
                        description: desc,
                        value: desc.contributes[extensionPoint.name],
                        collector: new extensionsRegistry_1.$WF(messageHandler, desc, extensionPoint.name)
                    });
                }
            }
            extensionPoint.acceptUsers(users);
        }
        //#region Called by extension host
        Jb(extensionHost) {
            return {
                _activateById: (extensionId, reason) => {
                    return this._activateById(extensionId, reason);
                },
                _onWillActivateExtension: (extensionId) => {
                    return this.Kb(extensionId, extensionHost.runningLocation);
                },
                _onDidActivateExtension: (extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) => {
                    return this.Lb(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason);
                },
                _onDidActivateExtensionError: (extensionId, error) => {
                    return this.Mb(extensionId, error);
                },
                _onExtensionRuntimeError: (extensionId, err) => {
                    return this.Nb(extensionId, err);
                }
            };
        }
        async _activateById(extensionId, reason) {
            const results = await Promise.all(this.C.map(manager => manager.activate(extensionId, reason)));
            const activated = results.some(e => e);
            if (!activated) {
                throw new Error(`Unknown extension ${extensionId.value}`);
            }
        }
        Kb(extensionId, runningLocation) {
            this.u.set(extensionId, runningLocation);
            const extensionStatus = this.Gb(extensionId);
            extensionStatus.onWillActivate();
        }
        Lb(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
            const extensionStatus = this.Gb(extensionId);
            extensionStatus.setActivationTimes(new extensions_2.$RF(codeLoadingTime, activateCallTime, activateResolvedTime, activationReason));
            this.b.fire([extensionId]);
        }
        Mb(extensionId, error) {
            this.M.publicLog2('extensionActivationError', {
                extensionId: extensionId.value,
                error: error.message
            });
        }
        Nb(extensionId, err) {
            const extensionStatus = this.Gb(extensionId);
            extensionStatus.addRuntimeError(err);
            this.b.fire([extensionId]);
        }
    };
    exports.$N3b = $N3b;
    exports.$N3b = $N3b = $N3b_1 = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, notification_1.$Yu),
        __param(5, environmentService_1.$hJ),
        __param(6, telemetry_1.$9k),
        __param(7, extensionManagement_1.$icb),
        __param(8, files_1.$6j),
        __param(9, productService_1.$kj),
        __param(10, extensionManagement_1.$hcb),
        __param(11, workspace_1.$Kh),
        __param(12, configuration_1.$8h),
        __param(13, extensionManifestPropertiesService_1.$vcb),
        __param(14, log_1.$5i),
        __param(15, remoteAgentService_1.$jm),
        __param(16, remoteExtensionsScanner_1.$oN),
        __param(17, lifecycle_3.$7y),
        __param(18, remoteAuthorityResolver_1.$Jk),
        __param(19, dialogs_1.$oA)
    ], $N3b);
    class $O3b {
        constructor(local, remote, hasLocalProcess, allowRemoteExtensionsInLocalWebWorker) {
            this.local = local;
            this.remote = remote;
            this.hasLocalProcess = hasLocalProcess;
            this.allowRemoteExtensionsInLocalWebWorker = allowRemoteExtensionsInLocalWebWorker;
        }
    }
    exports.$O3b = $O3b;
    class DeltaExtensionsQueueItem {
        constructor(toAdd, toRemove) {
            this.toAdd = toAdd;
            this.toRemove = toRemove;
        }
    }
    /**
     * @argument extensions The extensions to be checked.
     * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
     */
    function $P3b(logService, extensionEnablementService, extensionsProposedApi, extensions, ignoreWorkspaceTrust) {
        // enable or disable proposed API per extension
        extensionsProposedApi.updateEnabledApiProposals(extensions);
        // keep only enabled extensions
        return $Q3b(logService, extensionEnablementService, extensions, ignoreWorkspaceTrust);
    }
    exports.$P3b = $P3b;
    /**
     * Return the subset of extensions that are enabled.
     * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
     */
    function $Q3b(logService, extensionEnablementService, extensions, ignoreWorkspaceTrust) {
        const enabledExtensions = [], extensionsToCheck = [], mappedExtensions = [];
        for (const extension of extensions) {
            if (extension.isUnderDevelopment) {
                // Never disable extensions under development
                enabledExtensions.push(extension);
            }
            else {
                extensionsToCheck.push(extension);
                mappedExtensions.push((0, extensions_2.$TF)(extension));
            }
        }
        const enablementStates = extensionEnablementService.getEnablementStates(mappedExtensions, ignoreWorkspaceTrust ? { trusted: true } : undefined);
        for (let index = 0; index < enablementStates.length; index++) {
            if (extensionEnablementService.isEnabledEnablementState(enablementStates[index])) {
                enabledExtensions.push(extensionsToCheck[index]);
            }
            else {
                if (platform_1.$s) {
                    logService.info(`filterEnabledExtensions: extension '${extensionsToCheck[index].identifier.value}' is disabled`);
                }
            }
        }
        return enabledExtensions;
    }
    exports.$Q3b = $Q3b;
    /**
     * @argument extension The extension to be checked.
     * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
     */
    function $R3b(logService, extensionEnablementService, extension, ignoreWorkspaceTrust) {
        return $Q3b(logService, extensionEnablementService, [extension], ignoreWorkspaceTrust).includes(extension);
    }
    exports.$R3b = $R3b;
    function includes(extensions, identifier) {
        for (const extension of extensions) {
            if (extensions_1.$Vl.equals(extension.identifier, identifier)) {
                return true;
            }
        }
        return false;
    }
    class $S3b {
        get messages() {
            return this.a;
        }
        get activationTimes() {
            return this.b;
        }
        get runtimeErrors() {
            return this.c;
        }
        get activationStarted() {
            return this.d;
        }
        constructor(id) {
            this.id = id;
            this.a = [];
            this.b = null;
            this.c = [];
            this.d = false;
        }
        clearRuntimeStatus() {
            this.d = false;
            this.b = null;
            this.c = [];
        }
        addMessage(msg) {
            this.a.push(msg);
        }
        setActivationTimes(activationTimes) {
            this.b = activationTimes;
        }
        addRuntimeError(err) {
            this.c.push(err);
        }
        onWillActivate() {
            this.d = true;
        }
    }
    exports.$S3b = $S3b;
    class $T3b {
        constructor() {
            this.c = [];
        }
        static { this.a = 5 * 60 * 1000; } // 5 minutes
        static { this.b = 3; }
        d() {
            const limit = Date.now() - $T3b.a;
            while (this.c.length > 0 && this.c[0].timestamp < limit) {
                this.c.shift();
            }
        }
        registerCrash() {
            this.d();
            this.c.push({ timestamp: Date.now() });
        }
        shouldAutomaticallyRestart() {
            this.d();
            return (this.c.length < $T3b.b);
        }
    }
    exports.$T3b = $T3b;
    /**
     * This can run correctly only on the renderer process because that is the only place
     * where all extension points and all implicit activation events generators are known.
     */
    class ImplicitActivationAwareReader {
        readActivationEvents(extensionDescription) {
            return implicitActivationEvents_1.$BF.readActivationEvents(extensionDescription);
        }
    }
});
//# sourceMappingURL=abstractExtensionService.js.map