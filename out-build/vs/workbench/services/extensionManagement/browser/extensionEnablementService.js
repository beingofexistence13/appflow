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
define(["require", "exports", "vs/nls!vs/workbench/services/extensionManagement/browser/extensionEnablementService", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/workbench/services/environment/common/environmentService", "vs/platform/extensions/common/extensions", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/workbench/services/extensions/common/extensions", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/workbench/services/extensionManagement/browser/extensionBisect", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/log/common/log", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls_1, event_1, lifecycle_1, extensionManagement_1, extensionManagement_2, extensionManagementUtil_1, workspace_1, storage_1, environmentService_1, extensions_1, configuration_1, extensions_2, extensionEnablementService_1, extensions_3, userDataSyncAccount_1, userDataSync_1, lifecycle_2, notification_1, host_1, extensionBisect_1, workspaceTrust_1, extensionManifestPropertiesService_1, virtualWorkspace_1, log_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Hzb = void 0;
    const SOURCE = 'IWorkbenchExtensionEnablementService';
    let $Hzb = class $Hzb extends lifecycle_1.$kc {
        constructor(storageService, g, h, j, extensionManagementService, m, n, s, t, u, w, hostService, y, z, C, D, instantiationService) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.b = new event_1.$fd();
            this.onEnablementChanged = this.b.event;
            this.f = this.B(new extensionEnablementService_1.$Dzb(storageService));
            const uninstallDisposable = this.B(event_1.Event.filter(extensionManagementService.onDidUninstallExtension, e => !e.error)(({ identifier }) => this.ob(identifier)));
            let isDisposed = false;
            this.B((0, lifecycle_1.$ic)(() => isDisposed = true));
            this.c = this.B(instantiationService.createInstance(ExtensionsManager));
            this.c.whenInitialized().then(() => {
                if (!isDisposed) {
                    this.B(this.c.onDidChangeExtensions(({ added, removed, isProfileSwitch }) => this.mb(added, removed, isProfileSwitch)));
                    uninstallDisposable.dispose();
                }
            });
            this.B(this.g.onDidChangeEnablement(({ extensions, source }) => this.lb(extensions, source)));
            // delay notification for extensions disabled until workbench restored
            if (this.G) {
                this.u.when(4 /* LifecyclePhase.Eventually */).then(() => {
                    this.w.prompt(notification_1.Severity.Info, (0, nls_1.localize)(0, null), [{
                            label: (0, nls_1.localize)(1, null),
                            run: () => hostService.reload({ disableExtensions: false })
                        }], {
                        sticky: true,
                        priority: notification_1.NotificationPriority.URGENT
                    });
                });
            }
        }
        get F() {
            return this.h.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */;
        }
        get G() {
            return this.j.disableExtensions === true;
        }
        getEnablementState(extension) {
            return this.N(extension, this.c.extensions, this.nb());
        }
        getEnablementStates(extensions, workspaceTypeOverrides = {}) {
            const extensionsEnablements = new Map();
            const workspaceType = { ...this.nb(), ...workspaceTypeOverrides };
            return extensions.map(extension => this.N(extension, extensions, workspaceType, extensionsEnablements));
        }
        getDependenciesEnablementStates(extension) {
            return (0, extensionManagementUtil_1.$zo)(this.c.extensions, extension).map(e => [e, this.getEnablementState(e)]);
        }
        canChangeEnablement(extension) {
            try {
                this.H(extension);
                return true;
            }
            catch (error) {
                return false;
            }
        }
        canChangeWorkspaceEnablement(extension) {
            if (!this.canChangeEnablement(extension)) {
                return false;
            }
            try {
                this.J(extension);
                return true;
            }
            catch (error) {
                return false;
            }
        }
        H(extension, donotCheckDependencies) {
            if ((0, extensions_1.$Zl)(extension.manifest)) {
                throw new Error((0, nls_1.localize)(2, null, extension.manifest.displayName || extension.identifier.id));
            }
            if (this.s.isEnabled() && this.t.account &&
                (0, extensions_1.$1l)(extension.manifest) && extension.manifest.contributes.authentication.some(a => a.id === this.t.account.authenticationProviderId)) {
                throw new Error((0, nls_1.localize)(3, null, extension.manifest.displayName || extension.identifier.id));
            }
            if (this.P(extension)) {
                throw new Error((0, nls_1.localize)(4, null, extension.manifest.displayName || extension.identifier.id));
            }
            this.I(extension, this.getEnablementState(extension), donotCheckDependencies);
        }
        I(extension, enablementStateOfExtension, donotCheckDependencies) {
            switch (enablementStateOfExtension) {
                case 2 /* EnablementState.DisabledByEnvironment */:
                    throw new Error((0, nls_1.localize)(5, null, extension.manifest.displayName || extension.identifier.id));
                case 4 /* EnablementState.DisabledByVirtualWorkspace */:
                    throw new Error((0, nls_1.localize)(6, null, extension.manifest.displayName || extension.identifier.id));
                case 1 /* EnablementState.DisabledByExtensionKind */:
                    throw new Error((0, nls_1.localize)(7, null, extension.manifest.displayName || extension.identifier.id));
                case 5 /* EnablementState.DisabledByExtensionDependency */:
                    if (donotCheckDependencies) {
                        break;
                    }
                    // Can be changed only when all its dependencies enablements can be changed
                    for (const dependency of (0, extensionManagementUtil_1.$zo)(this.c.extensions, extension)) {
                        if (this.isEnabled(dependency)) {
                            continue;
                        }
                        try {
                            this.H(dependency, true);
                        }
                        catch (error) {
                            throw new Error((0, nls_1.localize)(8, null, extension.manifest.displayName || extension.identifier.id, dependency.manifest.displayName || dependency.identifier.id));
                        }
                    }
            }
        }
        J(extension) {
            if (!this.F) {
                throw new Error((0, nls_1.localize)(9, null));
            }
            if ((0, extensions_1.$1l)(extension.manifest)) {
                throw new Error((0, nls_1.localize)(10, null, extension.manifest.displayName || extension.identifier.id));
            }
        }
        async setEnablement(extensions, newState) {
            await this.c.whenInitialized();
            if (newState === 8 /* EnablementState.EnabledGlobally */ || newState === 9 /* EnablementState.EnabledWorkspace */) {
                extensions.push(...this.L(extensions, this.c.extensions, newState, { dependencies: true, pack: true }));
            }
            const workspace = newState === 7 /* EnablementState.DisabledWorkspace */ || newState === 9 /* EnablementState.EnabledWorkspace */;
            for (const extension of extensions) {
                if (workspace) {
                    this.J(extension);
                }
                else {
                    this.H(extension);
                }
            }
            const result = [];
            for (const extension of extensions) {
                const enablementState = this.getEnablementState(extension);
                if (enablementState === 0 /* EnablementState.DisabledByTrustRequirement */
                    /* All its disabled dependencies are disabled by Trust Requirement */
                    || (enablementState === 5 /* EnablementState.DisabledByExtensionDependency */ && this.getDependenciesEnablementStates(extension).every(([, e]) => this.isEnabledEnablementState(e) || e === 0 /* EnablementState.DisabledByTrustRequirement */))) {
                    const trustState = await this.C.requestWorkspaceTrust();
                    result.push(trustState ?? false);
                }
                else {
                    result.push(await this.M(extension, newState));
                }
            }
            const changedExtensions = extensions.filter((e, index) => result[index]);
            if (changedExtensions.length) {
                this.b.fire(changedExtensions);
            }
            return result;
        }
        L(extensions, allExtensions, enablementState, options, checked = []) {
            if (!options.dependencies && !options.pack) {
                return [];
            }
            const toCheck = extensions.filter(e => checked.indexOf(e) === -1);
            if (!toCheck.length) {
                return [];
            }
            for (const extension of toCheck) {
                checked.push(extension);
            }
            const extensionsToEnable = [];
            for (const extension of allExtensions) {
                // Extension is already checked
                if (checked.some(e => (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier))) {
                    continue;
                }
                const enablementStateOfExtension = this.getEnablementState(extension);
                // Extension is enabled
                if (this.isEnabledEnablementState(enablementStateOfExtension)) {
                    continue;
                }
                // Skip if dependency extension is disabled by extension kind
                if (enablementStateOfExtension === 1 /* EnablementState.DisabledByExtensionKind */) {
                    continue;
                }
                // Check if the extension is a dependency or in extension pack
                if (extensions.some(e => (options.dependencies && e.manifest.extensionDependencies?.some(id => (0, extensionManagementUtil_1.$po)({ id }, extension.identifier)))
                    || (options.pack && e.manifest.extensionPack?.some(id => (0, extensionManagementUtil_1.$po)({ id }, extension.identifier))))) {
                    const index = extensionsToEnable.findIndex(e => (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier));
                    // Extension is not added to the disablement list so add it
                    if (index === -1) {
                        extensionsToEnable.push(extension);
                    }
                    // Extension is there already in the disablement list.
                    else {
                        try {
                            // Replace only if the enablement state can be changed
                            this.I(extension, enablementStateOfExtension, true);
                            extensionsToEnable.splice(index, 1, extension);
                        }
                        catch (error) { /*Do not add*/ }
                    }
                }
            }
            if (extensionsToEnable.length) {
                extensionsToEnable.push(...this.L(extensionsToEnable, allExtensions, enablementState, options, checked));
            }
            return extensionsToEnable;
        }
        M(extension, newState) {
            const currentState = this.W(extension.identifier);
            if (currentState === newState) {
                return Promise.resolve(false);
            }
            switch (newState) {
                case 8 /* EnablementState.EnabledGlobally */:
                    this.Y(extension.identifier);
                    break;
                case 6 /* EnablementState.DisabledGlobally */:
                    this.Z(extension.identifier);
                    break;
                case 9 /* EnablementState.EnabledWorkspace */:
                    this.$(extension.identifier);
                    break;
                case 7 /* EnablementState.DisabledWorkspace */:
                    this.ab(extension.identifier);
                    break;
            }
            return Promise.resolve(true);
        }
        isEnabled(extension) {
            const enablementState = this.getEnablementState(extension);
            return this.isEnabledEnablementState(enablementState);
        }
        isEnabledEnablementState(enablementState) {
            return enablementState === 3 /* EnablementState.EnabledByEnvironment */ || enablementState === 9 /* EnablementState.EnabledWorkspace */ || enablementState === 8 /* EnablementState.EnabledGlobally */;
        }
        isDisabledGlobally(extension) {
            return this.X(extension.identifier);
        }
        N(extension, extensions, workspaceType, computedEnablementStates) {
            computedEnablementStates = computedEnablementStates ?? new Map();
            let enablementState = computedEnablementStates.get(extension);
            if (enablementState !== undefined) {
                return enablementState;
            }
            enablementState = this.W(extension.identifier);
            if (this.y.isDisabledByBisect(extension)) {
                enablementState = 2 /* EnablementState.DisabledByEnvironment */;
            }
            else if (this.O(extension)) {
                enablementState = 2 /* EnablementState.DisabledByEnvironment */;
            }
            else if (this.Q(extension, workspaceType)) {
                enablementState = 4 /* EnablementState.DisabledByVirtualWorkspace */;
            }
            else if (this.isEnabledEnablementState(enablementState) && this.S(extension, workspaceType)) {
                enablementState = 0 /* EnablementState.DisabledByTrustRequirement */;
            }
            else if (this.R(extension)) {
                enablementState = 1 /* EnablementState.DisabledByExtensionKind */;
            }
            else if (this.isEnabledEnablementState(enablementState) && this.U(extension, extensions, workspaceType, computedEnablementStates)) {
                enablementState = 5 /* EnablementState.DisabledByExtensionDependency */;
            }
            else if (!this.isEnabledEnablementState(enablementState) && this.P(extension)) {
                enablementState = 3 /* EnablementState.EnabledByEnvironment */;
            }
            computedEnablementStates.set(extension, enablementState);
            return enablementState;
        }
        O(extension) {
            if (this.G) {
                return !extension.isBuiltin && !(0, extensions_1.$2l)(extension.manifest, this.j.remoteAuthority);
            }
            const disabledExtensions = this.j.disableExtensions;
            if (Array.isArray(disabledExtensions)) {
                return disabledExtensions.some(id => (0, extensionManagementUtil_1.$po)({ id }, extension.identifier));
            }
            // Check if this is the better merge extension which was migrated to a built-in extension
            if ((0, extensionManagementUtil_1.$po)({ id: extensionManagementUtil_1.$yo.value }, extension.identifier)) {
                return true;
            }
            return false;
        }
        P(extension) {
            const enabledExtensions = this.j.enableExtensions;
            if (Array.isArray(enabledExtensions)) {
                return enabledExtensions.some(id => (0, extensionManagementUtil_1.$po)({ id }, extension.identifier));
            }
            return false;
        }
        Q(extension, workspaceType) {
            // Not a virtual workspace
            if (!workspaceType.virtual) {
                return false;
            }
            // Supports virtual workspace
            if (this.D.getExtensionVirtualWorkspaceSupportType(extension.manifest) !== false) {
                return false;
            }
            // Web extension from web extension management server
            if (this.n.getExtensionManagementServer(extension) === this.n.webExtensionManagementServer && this.D.canExecuteOnWeb(extension.manifest)) {
                return false;
            }
            return true;
        }
        R(extension) {
            if (this.n.remoteExtensionManagementServer || this.n.webExtensionManagementServer) {
                const installLocation = this.n.getExtensionInstallLocation(extension);
                for (const extensionKind of this.D.getExtensionKind(extension.manifest)) {
                    if (extensionKind === 'ui') {
                        if (installLocation === 1 /* ExtensionInstallLocation.Local */) {
                            return false;
                        }
                    }
                    if (extensionKind === 'workspace') {
                        if (installLocation === 2 /* ExtensionInstallLocation.Remote */) {
                            return false;
                        }
                    }
                    if (extensionKind === 'web') {
                        if (this.n.webExtensionManagementServer /* web */) {
                            if (installLocation === 3 /* ExtensionInstallLocation.Web */ || installLocation === 2 /* ExtensionInstallLocation.Remote */) {
                                return false;
                            }
                        }
                        else if (installLocation === 1 /* ExtensionInstallLocation.Local */) {
                            const enableLocalWebWorker = this.m.getValue(extensions_3.$LF);
                            if (enableLocalWebWorker === true || enableLocalWebWorker === 'auto') {
                                // Web extensions are enabled on all configurations
                                return false;
                            }
                        }
                    }
                }
                return true;
            }
            return false;
        }
        S(extension, workspaceType) {
            if (workspaceType.trusted) {
                return false;
            }
            return this.D.getExtensionUntrustedWorkspaceSupportType(extension.manifest) === false;
        }
        U(extension, extensions, workspaceType, computedEnablementStates) {
            // Find dependencies from the same server as of the extension
            const dependencyExtensions = extension.manifest.extensionDependencies
                ? extensions.filter(e => extension.manifest.extensionDependencies.some(id => (0, extensionManagementUtil_1.$po)(e.identifier, { id }) && this.n.getExtensionManagementServer(e) === this.n.getExtensionManagementServer(extension)))
                : [];
            if (!dependencyExtensions.length) {
                return false;
            }
            const hasEnablementState = computedEnablementStates.has(extension);
            if (!hasEnablementState) {
                // Placeholder to handle cyclic deps
                computedEnablementStates.set(extension, 8 /* EnablementState.EnabledGlobally */);
            }
            try {
                for (const dependencyExtension of dependencyExtensions) {
                    const enablementState = this.N(dependencyExtension, extensions, workspaceType, computedEnablementStates);
                    if (!this.isEnabledEnablementState(enablementState) && enablementState !== 1 /* EnablementState.DisabledByExtensionKind */) {
                        return true;
                    }
                }
            }
            finally {
                if (!hasEnablementState) {
                    // remove the placeholder
                    computedEnablementStates.delete(extension);
                }
            }
            return false;
        }
        W(identifier) {
            if (this.F) {
                if (this.fb().filter(e => (0, extensionManagementUtil_1.$po)(e, identifier))[0]) {
                    return 9 /* EnablementState.EnabledWorkspace */;
                }
                if (this.hb().filter(e => (0, extensionManagementUtil_1.$po)(e, identifier))[0]) {
                    return 7 /* EnablementState.DisabledWorkspace */;
                }
            }
            if (this.X(identifier)) {
                return 6 /* EnablementState.DisabledGlobally */;
            }
            return 8 /* EnablementState.EnabledGlobally */;
        }
        X(identifier) {
            return this.g.getDisabledExtensions().some(e => (0, extensionManagementUtil_1.$po)(e, identifier));
        }
        Y(identifier) {
            this.cb(identifier);
            this.eb(identifier);
            return this.g.enableExtension(identifier, SOURCE);
        }
        Z(identifier) {
            this.cb(identifier);
            this.eb(identifier);
            return this.g.disableExtension(identifier, SOURCE);
        }
        $(identifier) {
            this.cb(identifier);
            this.db(identifier);
        }
        ab(identifier) {
            this.bb(identifier);
            this.eb(identifier);
        }
        bb(identifier) {
            if (!this.F) {
                return Promise.resolve(false);
            }
            const disabledExtensions = this.hb();
            if (disabledExtensions.every(e => !(0, extensionManagementUtil_1.$po)(e, identifier))) {
                disabledExtensions.push(identifier);
                this.ib(disabledExtensions);
                return Promise.resolve(true);
            }
            return Promise.resolve(false);
        }
        async cb(identifier) {
            if (!this.F) {
                return false;
            }
            const disabledExtensions = this.hb();
            for (let index = 0; index < disabledExtensions.length; index++) {
                const disabledExtension = disabledExtensions[index];
                if ((0, extensionManagementUtil_1.$po)(disabledExtension, identifier)) {
                    disabledExtensions.splice(index, 1);
                    this.ib(disabledExtensions);
                    return true;
                }
            }
            return false;
        }
        db(identifier) {
            if (!this.F) {
                return false;
            }
            const enabledExtensions = this.fb();
            if (enabledExtensions.every(e => !(0, extensionManagementUtil_1.$po)(e, identifier))) {
                enabledExtensions.push(identifier);
                this.gb(enabledExtensions);
                return true;
            }
            return false;
        }
        eb(identifier) {
            if (!this.F) {
                return false;
            }
            const enabledExtensions = this.fb();
            for (let index = 0; index < enabledExtensions.length; index++) {
                const disabledExtension = enabledExtensions[index];
                if ((0, extensionManagementUtil_1.$po)(disabledExtension, identifier)) {
                    enabledExtensions.splice(index, 1);
                    this.gb(enabledExtensions);
                    return true;
                }
            }
            return false;
        }
        fb() {
            return this.jb(extensionManagement_1.$4n);
        }
        gb(enabledExtensions) {
            this.kb(extensionManagement_1.$4n, enabledExtensions);
        }
        hb() {
            return this.jb(extensionManagement_1.$3n);
        }
        ib(disabledExtensions) {
            this.kb(extensionManagement_1.$3n, disabledExtensions);
        }
        jb(storageId) {
            if (!this.F) {
                return [];
            }
            return this.f.get(storageId, 1 /* StorageScope.WORKSPACE */);
        }
        kb(storageId, extensions) {
            this.f.set(storageId, extensions, 1 /* StorageScope.WORKSPACE */);
        }
        async lb(extensionIdentifiers, source) {
            if (source !== SOURCE) {
                await this.c.whenInitialized();
                const extensions = this.c.extensions.filter(installedExtension => extensionIdentifiers.some(identifier => (0, extensionManagementUtil_1.$po)(identifier, installedExtension.identifier)));
                this.b.fire(extensions);
            }
        }
        mb(added, removed, isProfileSwitch) {
            const disabledExtensions = added.filter(e => !this.isEnabledEnablementState(this.getEnablementState(e)));
            if (disabledExtensions.length) {
                this.b.fire(disabledExtensions);
            }
            if (!isProfileSwitch) {
                removed.forEach(({ identifier }) => this.ob(identifier));
            }
        }
        async updateExtensionsEnablementsWhenWorkspaceTrustChanges() {
            await this.c.whenInitialized();
            const computeEnablementStates = (workspaceType) => {
                const extensionsEnablements = new Map();
                return this.c.extensions.map(extension => [extension, this.N(extension, this.c.extensions, workspaceType, extensionsEnablements)]);
            };
            const workspaceType = this.nb();
            const enablementStatesWithTrustedWorkspace = computeEnablementStates({ ...workspaceType, trusted: true });
            const enablementStatesWithUntrustedWorkspace = computeEnablementStates({ ...workspaceType, trusted: false });
            const enablementChangedExtensionsBecauseOfTrust = enablementStatesWithTrustedWorkspace.filter(([, enablementState], index) => enablementState !== enablementStatesWithUntrustedWorkspace[index][1]).map(([extension]) => extension);
            if (enablementChangedExtensionsBecauseOfTrust.length) {
                this.b.fire(enablementChangedExtensionsBecauseOfTrust);
            }
        }
        nb() {
            return { trusted: this.z.isWorkspaceTrusted(), virtual: (0, virtualWorkspace_1.$xJ)(this.h.getWorkspace()) };
        }
        ob(extension) {
            this.cb(extension);
            this.eb(extension);
            this.g.enableExtension(extension);
        }
    };
    exports.$Hzb = $Hzb;
    exports.$Hzb = $Hzb = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, extensionManagement_1.$5n),
        __param(2, workspace_1.$Kh),
        __param(3, environmentService_1.$hJ),
        __param(4, extensionManagement_1.$2n),
        __param(5, configuration_1.$8h),
        __param(6, extensionManagement_2.$fcb),
        __param(7, userDataSync_1.$Pgb),
        __param(8, userDataSyncAccount_1.$Ezb),
        __param(9, lifecycle_2.$7y),
        __param(10, notification_1.$Yu),
        __param(11, host_1.$VT),
        __param(12, extensionBisect_1.$Gzb),
        __param(13, workspaceTrust_1.$$z),
        __param(14, workspaceTrust_1.$_z),
        __param(15, extensionManifestPropertiesService_1.$vcb),
        __param(16, instantiation_1.$Ah)
    ], $Hzb);
    let ExtensionsManager = class ExtensionsManager extends lifecycle_1.$kc {
        get extensions() { return this.b; }
        constructor(h, j, m) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.b = [];
            this.c = this.B(new event_1.$fd());
            this.onDidChangeExtensions = this.c.event;
            this.g = false;
            this.B((0, lifecycle_1.$ic)(() => this.g = true));
            this.f = this.n();
        }
        whenInitialized() {
            return this.f;
        }
        async n() {
            try {
                this.b = await this.h.getInstalled();
                if (this.g) {
                    return;
                }
                this.c.fire({ added: this.extensions, removed: [], isProfileSwitch: false });
            }
            catch (error) {
                this.m.error(error);
            }
            this.B(this.h.onDidInstallExtensions(e => this.r(e.reduce((result, { local, operation }) => {
                if (local && operation !== 4 /* InstallOperation.Migrate */) {
                    result.push(local);
                }
                return result;
            }, []), [], undefined, false)));
            this.B(event_1.Event.filter(this.h.onDidUninstallExtension, (e => !e.error))(e => this.r([], [e.identifier], e.server, false)));
            this.B(this.h.onDidChangeProfile(({ added, removed, server }) => {
                this.r(added, removed.map(({ identifier }) => identifier), server, true);
            }));
        }
        r(added, identifiers, server, isProfileSwitch) {
            if (added.length) {
                this.b.push(...added);
            }
            const removed = [];
            for (const identifier of identifiers) {
                const index = this.b.findIndex(e => (0, extensionManagementUtil_1.$po)(e.identifier, identifier) && this.j.getExtensionManagementServer(e) === server);
                if (index !== -1) {
                    removed.push(...this.b.splice(index, 1));
                }
            }
            if (added.length || removed.length) {
                this.c.fire({ added, removed, isProfileSwitch });
            }
        }
    };
    ExtensionsManager = __decorate([
        __param(0, extensionManagement_2.$hcb),
        __param(1, extensionManagement_2.$fcb),
        __param(2, log_1.$5i)
    ], ExtensionsManager);
    (0, extensions_2.$mr)(extensionManagement_2.$icb, $Hzb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=extensionEnablementService.js.map