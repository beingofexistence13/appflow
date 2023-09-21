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
define(["require", "exports", "vs/nls!vs/workbench/services/extensions/browser/extensionUrlHandler", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/url/common/url", "vs/workbench/services/host/browser/host", "vs/workbench/services/extensions/common/extensions", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/actions/common/actions", "vs/platform/quickinput/common/quickInput", "vs/platform/progress/common/progress", "vs/platform/contextkey/common/contextkeys", "vs/platform/extensionManagement/common/extensionUrlTrust", "vs/base/common/cancellation", "vs/platform/telemetry/common/telemetry"], function (require, exports, nls_1, lifecycle_1, uri_1, configuration_1, dialogs_1, extensionManagement_1, extensionManagement_2, extensionManagementUtil_1, instantiation_1, notification_1, storage_1, url_1, host_1, extensions_1, extensions_2, extensions_3, platform_1, contributions_1, actions_1, quickInput_1, progress_1, contextkeys_1, extensionUrlTrust_1, cancellation_1, telemetry_1) {
    "use strict";
    var ExtensionUrlBootstrapHandler_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0kb = void 0;
    const FIVE_MINUTES = 5 * 60 * 1000;
    const THIRTY_SECONDS = 30 * 1000;
    const URL_TO_HANDLE = 'extensionUrlHandler.urlToHandle';
    const USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY = 'extensions.confirmedUriHandlerExtensionIds';
    const USER_TRUSTED_EXTENSIONS_STORAGE_KEY = 'extensionUrlHandler.confirmedExtensions';
    function isExtensionId(value) {
        return /^[a-z0-9][a-z0-9\-]*\.[a-z0-9][a-z0-9\-]*$/i.test(value);
    }
    class UserTrustedExtensionIdStorage {
        get extensions() {
            const userTrustedExtensionIdsJson = this.a.get(USER_TRUSTED_EXTENSIONS_STORAGE_KEY, 0 /* StorageScope.PROFILE */, '[]');
            try {
                return JSON.parse(userTrustedExtensionIdsJson);
            }
            catch {
                return [];
            }
        }
        constructor(a) {
            this.a = a;
        }
        has(id) {
            return this.extensions.indexOf(id) > -1;
        }
        add(id) {
            this.set([...this.extensions, id]);
        }
        set(ids) {
            this.a.store(USER_TRUSTED_EXTENSIONS_STORAGE_KEY, JSON.stringify(ids), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
    }
    exports.$0kb = (0, instantiation_1.$Bh)('extensionUrlHandler');
    /**
     * This class handles URLs which are directed towards extensions.
     * If a URL is directed towards an inactive extension, it buffers it,
     * activates the extension and re-opens the URL once the extension registers
     * a URL handler. If the extension never registers a URL handler, the urls
     * will eventually be garbage collected.
     *
     * It also makes sure the user confirms opening URLs directed towards extensions.
     */
    let ExtensionUrlHandler = class ExtensionUrlHandler {
        constructor(urlService, g, h, i, j, k, l, m, n, o, p, q, r) {
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.r = r;
            this.a = new Map();
            this.b = new Map();
            this.d = new UserTrustedExtensionIdStorage(n);
            const interval = setInterval(() => this.v(), THIRTY_SECONDS);
            const urlToHandleValue = this.n.get(URL_TO_HANDLE, 1 /* StorageScope.WORKSPACE */);
            if (urlToHandleValue) {
                this.n.remove(URL_TO_HANDLE, 1 /* StorageScope.WORKSPACE */);
                this.handleURL(uri_1.URI.revive(JSON.parse(urlToHandleValue)), { trusted: true });
            }
            this.f = (0, lifecycle_1.$hc)(urlService.registerHandler(this), (0, lifecycle_1.$ic)(() => clearInterval(interval)));
            const cache = ExtensionUrlBootstrapHandler.cache;
            setTimeout(() => cache.forEach(([uri, option]) => this.handleURL(uri, option)));
        }
        async handleURL(uri, options) {
            if (!isExtensionId(uri.authority)) {
                return false;
            }
            const extensionId = uri.authority;
            this.q.publicLog2('uri_invoked/start', { extensionId });
            const initialHandler = this.a.get(extensions_2.$Vl.toKey(extensionId));
            let extensionDisplayName;
            if (!initialHandler) {
                // The extension is not yet activated, so let's check if it is installed and enabled
                const extension = await this.g.getExtension(extensionId);
                if (!extension) {
                    await this.t(uri, { id: extensionId }, options);
                    return true;
                }
                else {
                    extensionDisplayName = extension.displayName || extension.name;
                }
            }
            else {
                extensionDisplayName = initialHandler.extensionDisplayName;
            }
            const trusted = options?.trusted
                || (options?.originalUrl ? await this.r.isExtensionUrlTrusted(extensionId, options.originalUrl) : false)
                || this.w(extensions_2.$Vl.toKey(extensionId));
            if (!trusted) {
                let uriString = uri.toString(false);
                if (uriString.length > 40) {
                    uriString = `${uriString.substring(0, 30)}...${uriString.substring(uriString.length - 5)}`;
                }
                const result = await this.h.confirm({
                    message: (0, nls_1.localize)(0, null, extensionId),
                    checkbox: {
                        label: (0, nls_1.localize)(1, null),
                    },
                    detail: `${extensionDisplayName} (${extensionId}) wants to open a URI:\n\n${uriString}`,
                    primaryButton: (0, nls_1.localize)(2, null)
                });
                if (!result.confirmed) {
                    this.q.publicLog2('uri_invoked/cancel', { extensionId });
                    return true;
                }
                if (result.checkboxChecked) {
                    this.d.add(extensions_2.$Vl.toKey(extensionId));
                }
            }
            const handler = this.a.get(extensions_2.$Vl.toKey(extensionId));
            if (handler) {
                if (!initialHandler) {
                    // forward it directly
                    return await this.s(extensionId, handler, uri, options);
                }
                // let the ExtensionUrlHandler instance handle this
                return false;
            }
            // collect URI for eventual extension activation
            const timestamp = new Date().getTime();
            let uris = this.b.get(extensions_2.$Vl.toKey(extensionId));
            if (!uris) {
                uris = [];
                this.b.set(extensions_2.$Vl.toKey(extensionId), uris);
            }
            uris.push({ timestamp, uri });
            // activate the extension using ActivationKind.Immediate because URI handling might be part
            // of resolving authorities (via authentication extensions)
            await this.g.activateByEvent(`onUri:${extensions_2.$Vl.toKey(extensionId)}`, 1 /* ActivationKind.Immediate */);
            return true;
        }
        registerExtensionHandler(extensionId, handler) {
            this.a.set(extensions_2.$Vl.toKey(extensionId), handler);
            const uris = this.b.get(extensions_2.$Vl.toKey(extensionId)) || [];
            for (const { uri } of uris) {
                this.s(extensionId, handler, uri);
            }
            this.b.delete(extensions_2.$Vl.toKey(extensionId));
        }
        unregisterExtensionHandler(extensionId) {
            this.a.delete(extensions_2.$Vl.toKey(extensionId));
        }
        async s(extensionId, handler, uri, options) {
            this.q.publicLog2('uri_invoked/end', { extensionId: extensions_2.$Vl.toKey(extensionId) });
            return await handler.handleURL(uri, options);
        }
        async t(uri, extensionIdentifier, options) {
            const installedExtensions = await this.j.getInstalled();
            let extension = installedExtensions.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, extensionIdentifier));
            // Extension is not installed
            if (!extension) {
                let galleryExtension;
                try {
                    galleryExtension = (await this.m.getExtensions([extensionIdentifier], cancellation_1.CancellationToken.None))[0] ?? undefined;
                }
                catch (err) {
                    return;
                }
                if (!galleryExtension) {
                    return;
                }
                this.q.publicLog2('uri_invoked/install_extension/start', { extensionId: extensionIdentifier.id });
                // Install the Extension and reload the window to handle.
                const result = await this.h.confirm({
                    message: (0, nls_1.localize)(3, null, galleryExtension.displayName || galleryExtension.name),
                    detail: `${galleryExtension.displayName || galleryExtension.name} (${extensionIdentifier.id}) wants to open a URL:\n\n${uri.toString()}`,
                    primaryButton: (0, nls_1.localize)(4, null)
                });
                if (!result.confirmed) {
                    this.q.publicLog2('uri_invoked/install_extension/cancel', { extensionId: extensionIdentifier.id });
                    return;
                }
                this.q.publicLog2('uri_invoked/install_extension/accept', { extensionId: extensionIdentifier.id });
                try {
                    extension = await this.p.withProgress({
                        location: 15 /* ProgressLocation.Notification */,
                        title: (0, nls_1.localize)(5, null, galleryExtension.displayName || galleryExtension.name)
                    }, () => this.j.installFromGallery(galleryExtension));
                }
                catch (error) {
                    this.i.error(error);
                    return;
                }
            }
            // Extension is installed but not enabled
            if (!this.k.isEnabled(extension)) {
                this.q.publicLog2('uri_invoked/enable_extension/start', { extensionId: extensionIdentifier.id });
                const result = await this.h.confirm({
                    message: (0, nls_1.localize)(6, null, extension.manifest.displayName || extension.manifest.name),
                    detail: `${extension.manifest.displayName || extension.manifest.name} (${extensionIdentifier.id}) wants to open a URL:\n\n${uri.toString()}`,
                    primaryButton: (0, nls_1.localize)(7, null)
                });
                if (!result.confirmed) {
                    this.q.publicLog2('uri_invoked/enable_extension/cancel', { extensionId: extensionIdentifier.id });
                    return;
                }
                this.q.publicLog2('uri_invoked/enable_extension/accept', { extensionId: extensionIdentifier.id });
                await this.k.setEnablement([extension], 8 /* EnablementState.EnabledGlobally */);
            }
            if (this.g.canAddExtension((0, extensions_1.$UF)(extension))) {
                await this.u(extensionIdentifier);
                await this.handleURL(uri, { ...options, trusted: true });
            }
            /* Extension cannot be added and require window reload */
            else {
                this.q.publicLog2('uri_invoked/activate_extension/start', { extensionId: extensionIdentifier.id });
                const result = await this.h.confirm({
                    message: (0, nls_1.localize)(8, null, extension.manifest.displayName || extension.manifest.name),
                    detail: `${extension.manifest.displayName || extension.manifest.name} (${extensionIdentifier.id}) wants to open a URL:\n\n${uri.toString()}`,
                    primaryButton: (0, nls_1.localize)(9, null)
                });
                if (!result.confirmed) {
                    this.q.publicLog2('uri_invoked/activate_extension/cancel', { extensionId: extensionIdentifier.id });
                    return;
                }
                this.q.publicLog2('uri_invoked/activate_extension/accept', { extensionId: extensionIdentifier.id });
                this.n.store(URL_TO_HANDLE, JSON.stringify(uri.toJSON()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                await this.l.reload();
            }
        }
        async u(extensionId) {
            if (!(await this.g.getExtension(extensionId.id))) {
                await new Promise((c, e) => {
                    const disposable = this.g.onDidChangeExtensions(async () => {
                        try {
                            if (await this.g.getExtension(extensionId.id)) {
                                disposable.dispose();
                                c();
                            }
                        }
                        catch (error) {
                            e(error);
                        }
                    });
                });
            }
        }
        // forget about all uris buffered more than 5 minutes ago
        v() {
            const now = new Date().getTime();
            const uriBuffer = new Map();
            this.b.forEach((uris, extensionId) => {
                uris = uris.filter(({ timestamp }) => now - timestamp < FIVE_MINUTES);
                if (uris.length > 0) {
                    uriBuffer.set(extensionId, uris);
                }
            });
            this.b = uriBuffer;
        }
        w(id) {
            if (this.d.has(id)) {
                return true;
            }
            return this.x().indexOf(id) > -1;
        }
        x() {
            const trustedExtensionIds = this.o.getValue(USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY);
            if (!Array.isArray(trustedExtensionIds)) {
                return [];
            }
            return trustedExtensionIds;
        }
        dispose() {
            this.f.dispose();
            this.a.clear();
            this.b.clear();
        }
    };
    ExtensionUrlHandler = __decorate([
        __param(0, url_1.$IT),
        __param(1, extensions_1.$MF),
        __param(2, dialogs_1.$oA),
        __param(3, notification_1.$Yu),
        __param(4, extensionManagement_1.$2n),
        __param(5, extensionManagement_2.$icb),
        __param(6, host_1.$VT),
        __param(7, extensionManagement_1.$Zn),
        __param(8, storage_1.$Vo),
        __param(9, configuration_1.$8h),
        __param(10, progress_1.$2u),
        __param(11, telemetry_1.$9k),
        __param(12, extensionUrlTrust_1.$9kb)
    ], ExtensionUrlHandler);
    (0, extensions_3.$mr)(exports.$0kb, ExtensionUrlHandler, 0 /* InstantiationType.Eager */);
    /**
     * This class handles URLs before `ExtensionUrlHandler` is instantiated.
     * More info: https://github.com/microsoft/vscode/issues/73101
     */
    let ExtensionUrlBootstrapHandler = class ExtensionUrlBootstrapHandler {
        static { ExtensionUrlBootstrapHandler_1 = this; }
        static { this.a = []; }
        static get cache() {
            ExtensionUrlBootstrapHandler_1.b.dispose();
            const result = ExtensionUrlBootstrapHandler_1.a;
            ExtensionUrlBootstrapHandler_1.a = [];
            return result;
        }
        constructor(urlService) {
            ExtensionUrlBootstrapHandler_1.b = urlService.registerHandler(this);
        }
        async handleURL(uri, options) {
            if (!isExtensionId(uri.authority)) {
                return false;
            }
            ExtensionUrlBootstrapHandler_1.a.push([uri, options]);
            return true;
        }
    };
    ExtensionUrlBootstrapHandler = ExtensionUrlBootstrapHandler_1 = __decorate([
        __param(0, url_1.$IT)
    ], ExtensionUrlBootstrapHandler);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ExtensionUrlBootstrapHandler, 2 /* LifecyclePhase.Ready */);
    class ManageAuthorizedExtensionURIsAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.extensions.action.manageAuthorizedExtensionURIs',
                title: { value: (0, nls_1.localize)(10, null), original: 'Manage Authorized Extension URIs...' },
                category: { value: (0, nls_1.localize)(11, null), original: 'Extensions' },
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkeys_1.$23.toNegated()
                }
            });
        }
        async run(accessor) {
            const storageService = accessor.get(storage_1.$Vo);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const storage = new UserTrustedExtensionIdStorage(storageService);
            const items = storage.extensions.map(label => ({ label, picked: true }));
            if (items.length === 0) {
                await quickInputService.pick([{ label: (0, nls_1.localize)(12, null) }]);
                return;
            }
            const result = await quickInputService.pick(items, { canPickMany: true });
            if (!result) {
                return;
            }
            storage.set(result.map(item => item.label));
        }
    }
    (0, actions_1.$Xu)(ManageAuthorizedExtensionURIsAction);
});
//# sourceMappingURL=extensionUrlHandler.js.map