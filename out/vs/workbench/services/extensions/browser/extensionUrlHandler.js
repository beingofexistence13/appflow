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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/url/common/url", "vs/workbench/services/host/browser/host", "vs/workbench/services/extensions/common/extensions", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/actions/common/actions", "vs/platform/quickinput/common/quickInput", "vs/platform/progress/common/progress", "vs/platform/contextkey/common/contextkeys", "vs/platform/extensionManagement/common/extensionUrlTrust", "vs/base/common/cancellation", "vs/platform/telemetry/common/telemetry"], function (require, exports, nls_1, lifecycle_1, uri_1, configuration_1, dialogs_1, extensionManagement_1, extensionManagement_2, extensionManagementUtil_1, instantiation_1, notification_1, storage_1, url_1, host_1, extensions_1, extensions_2, extensions_3, platform_1, contributions_1, actions_1, quickInput_1, progress_1, contextkeys_1, extensionUrlTrust_1, cancellation_1, telemetry_1) {
    "use strict";
    var ExtensionUrlBootstrapHandler_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtensionUrlHandler = void 0;
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
            const userTrustedExtensionIdsJson = this.storageService.get(USER_TRUSTED_EXTENSIONS_STORAGE_KEY, 0 /* StorageScope.PROFILE */, '[]');
            try {
                return JSON.parse(userTrustedExtensionIdsJson);
            }
            catch {
                return [];
            }
        }
        constructor(storageService) {
            this.storageService = storageService;
        }
        has(id) {
            return this.extensions.indexOf(id) > -1;
        }
        add(id) {
            this.set([...this.extensions, id]);
        }
        set(ids) {
            this.storageService.store(USER_TRUSTED_EXTENSIONS_STORAGE_KEY, JSON.stringify(ids), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
    }
    exports.IExtensionUrlHandler = (0, instantiation_1.createDecorator)('extensionUrlHandler');
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
        constructor(urlService, extensionService, dialogService, notificationService, extensionManagementService, extensionEnablementService, hostService, galleryService, storageService, configurationService, progressService, telemetryService, extensionUrlTrustService) {
            this.extensionService = extensionService;
            this.dialogService = dialogService;
            this.notificationService = notificationService;
            this.extensionManagementService = extensionManagementService;
            this.extensionEnablementService = extensionEnablementService;
            this.hostService = hostService;
            this.galleryService = galleryService;
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.progressService = progressService;
            this.telemetryService = telemetryService;
            this.extensionUrlTrustService = extensionUrlTrustService;
            this.extensionHandlers = new Map();
            this.uriBuffer = new Map();
            this.userTrustedExtensionsStorage = new UserTrustedExtensionIdStorage(storageService);
            const interval = setInterval(() => this.garbageCollect(), THIRTY_SECONDS);
            const urlToHandleValue = this.storageService.get(URL_TO_HANDLE, 1 /* StorageScope.WORKSPACE */);
            if (urlToHandleValue) {
                this.storageService.remove(URL_TO_HANDLE, 1 /* StorageScope.WORKSPACE */);
                this.handleURL(uri_1.URI.revive(JSON.parse(urlToHandleValue)), { trusted: true });
            }
            this.disposable = (0, lifecycle_1.combinedDisposable)(urlService.registerHandler(this), (0, lifecycle_1.toDisposable)(() => clearInterval(interval)));
            const cache = ExtensionUrlBootstrapHandler.cache;
            setTimeout(() => cache.forEach(([uri, option]) => this.handleURL(uri, option)));
        }
        async handleURL(uri, options) {
            if (!isExtensionId(uri.authority)) {
                return false;
            }
            const extensionId = uri.authority;
            this.telemetryService.publicLog2('uri_invoked/start', { extensionId });
            const initialHandler = this.extensionHandlers.get(extensions_2.ExtensionIdentifier.toKey(extensionId));
            let extensionDisplayName;
            if (!initialHandler) {
                // The extension is not yet activated, so let's check if it is installed and enabled
                const extension = await this.extensionService.getExtension(extensionId);
                if (!extension) {
                    await this.handleUnhandledURL(uri, { id: extensionId }, options);
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
                || (options?.originalUrl ? await this.extensionUrlTrustService.isExtensionUrlTrusted(extensionId, options.originalUrl) : false)
                || this.didUserTrustExtension(extensions_2.ExtensionIdentifier.toKey(extensionId));
            if (!trusted) {
                let uriString = uri.toString(false);
                if (uriString.length > 40) {
                    uriString = `${uriString.substring(0, 30)}...${uriString.substring(uriString.length - 5)}`;
                }
                const result = await this.dialogService.confirm({
                    message: (0, nls_1.localize)('confirmUrl', "Allow an extension to open this URI?", extensionId),
                    checkbox: {
                        label: (0, nls_1.localize)('rememberConfirmUrl', "Don't ask again for this extension."),
                    },
                    detail: `${extensionDisplayName} (${extensionId}) wants to open a URI:\n\n${uriString}`,
                    primaryButton: (0, nls_1.localize)({ key: 'open', comment: ['&& denotes a mnemonic'] }, "&&Open")
                });
                if (!result.confirmed) {
                    this.telemetryService.publicLog2('uri_invoked/cancel', { extensionId });
                    return true;
                }
                if (result.checkboxChecked) {
                    this.userTrustedExtensionsStorage.add(extensions_2.ExtensionIdentifier.toKey(extensionId));
                }
            }
            const handler = this.extensionHandlers.get(extensions_2.ExtensionIdentifier.toKey(extensionId));
            if (handler) {
                if (!initialHandler) {
                    // forward it directly
                    return await this.handleURLByExtension(extensionId, handler, uri, options);
                }
                // let the ExtensionUrlHandler instance handle this
                return false;
            }
            // collect URI for eventual extension activation
            const timestamp = new Date().getTime();
            let uris = this.uriBuffer.get(extensions_2.ExtensionIdentifier.toKey(extensionId));
            if (!uris) {
                uris = [];
                this.uriBuffer.set(extensions_2.ExtensionIdentifier.toKey(extensionId), uris);
            }
            uris.push({ timestamp, uri });
            // activate the extension using ActivationKind.Immediate because URI handling might be part
            // of resolving authorities (via authentication extensions)
            await this.extensionService.activateByEvent(`onUri:${extensions_2.ExtensionIdentifier.toKey(extensionId)}`, 1 /* ActivationKind.Immediate */);
            return true;
        }
        registerExtensionHandler(extensionId, handler) {
            this.extensionHandlers.set(extensions_2.ExtensionIdentifier.toKey(extensionId), handler);
            const uris = this.uriBuffer.get(extensions_2.ExtensionIdentifier.toKey(extensionId)) || [];
            for (const { uri } of uris) {
                this.handleURLByExtension(extensionId, handler, uri);
            }
            this.uriBuffer.delete(extensions_2.ExtensionIdentifier.toKey(extensionId));
        }
        unregisterExtensionHandler(extensionId) {
            this.extensionHandlers.delete(extensions_2.ExtensionIdentifier.toKey(extensionId));
        }
        async handleURLByExtension(extensionId, handler, uri, options) {
            this.telemetryService.publicLog2('uri_invoked/end', { extensionId: extensions_2.ExtensionIdentifier.toKey(extensionId) });
            return await handler.handleURL(uri, options);
        }
        async handleUnhandledURL(uri, extensionIdentifier, options) {
            const installedExtensions = await this.extensionManagementService.getInstalled();
            let extension = installedExtensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extensionIdentifier));
            // Extension is not installed
            if (!extension) {
                let galleryExtension;
                try {
                    galleryExtension = (await this.galleryService.getExtensions([extensionIdentifier], cancellation_1.CancellationToken.None))[0] ?? undefined;
                }
                catch (err) {
                    return;
                }
                if (!galleryExtension) {
                    return;
                }
                this.telemetryService.publicLog2('uri_invoked/install_extension/start', { extensionId: extensionIdentifier.id });
                // Install the Extension and reload the window to handle.
                const result = await this.dialogService.confirm({
                    message: (0, nls_1.localize)('installAndHandle', "Extension '{0}' is not installed. Would you like to install the extension and open this URL?", galleryExtension.displayName || galleryExtension.name),
                    detail: `${galleryExtension.displayName || galleryExtension.name} (${extensionIdentifier.id}) wants to open a URL:\n\n${uri.toString()}`,
                    primaryButton: (0, nls_1.localize)({ key: 'install and open', comment: ['&& denotes a mnemonic'] }, "&&Install and Open")
                });
                if (!result.confirmed) {
                    this.telemetryService.publicLog2('uri_invoked/install_extension/cancel', { extensionId: extensionIdentifier.id });
                    return;
                }
                this.telemetryService.publicLog2('uri_invoked/install_extension/accept', { extensionId: extensionIdentifier.id });
                try {
                    extension = await this.progressService.withProgress({
                        location: 15 /* ProgressLocation.Notification */,
                        title: (0, nls_1.localize)('Installing', "Installing Extension '{0}'...", galleryExtension.displayName || galleryExtension.name)
                    }, () => this.extensionManagementService.installFromGallery(galleryExtension));
                }
                catch (error) {
                    this.notificationService.error(error);
                    return;
                }
            }
            // Extension is installed but not enabled
            if (!this.extensionEnablementService.isEnabled(extension)) {
                this.telemetryService.publicLog2('uri_invoked/enable_extension/start', { extensionId: extensionIdentifier.id });
                const result = await this.dialogService.confirm({
                    message: (0, nls_1.localize)('enableAndHandle', "Extension '{0}' is disabled. Would you like to enable the extension and open the URL?", extension.manifest.displayName || extension.manifest.name),
                    detail: `${extension.manifest.displayName || extension.manifest.name} (${extensionIdentifier.id}) wants to open a URL:\n\n${uri.toString()}`,
                    primaryButton: (0, nls_1.localize)({ key: 'enableAndReload', comment: ['&& denotes a mnemonic'] }, "&&Enable and Open")
                });
                if (!result.confirmed) {
                    this.telemetryService.publicLog2('uri_invoked/enable_extension/cancel', { extensionId: extensionIdentifier.id });
                    return;
                }
                this.telemetryService.publicLog2('uri_invoked/enable_extension/accept', { extensionId: extensionIdentifier.id });
                await this.extensionEnablementService.setEnablement([extension], 8 /* EnablementState.EnabledGlobally */);
            }
            if (this.extensionService.canAddExtension((0, extensions_1.toExtensionDescription)(extension))) {
                await this.waitUntilExtensionIsAdded(extensionIdentifier);
                await this.handleURL(uri, { ...options, trusted: true });
            }
            /* Extension cannot be added and require window reload */
            else {
                this.telemetryService.publicLog2('uri_invoked/activate_extension/start', { extensionId: extensionIdentifier.id });
                const result = await this.dialogService.confirm({
                    message: (0, nls_1.localize)('reloadAndHandle', "Extension '{0}' is not loaded. Would you like to reload the window to load the extension and open the URL?", extension.manifest.displayName || extension.manifest.name),
                    detail: `${extension.manifest.displayName || extension.manifest.name} (${extensionIdentifier.id}) wants to open a URL:\n\n${uri.toString()}`,
                    primaryButton: (0, nls_1.localize)({ key: 'reloadAndOpen', comment: ['&& denotes a mnemonic'] }, "&&Reload Window and Open")
                });
                if (!result.confirmed) {
                    this.telemetryService.publicLog2('uri_invoked/activate_extension/cancel', { extensionId: extensionIdentifier.id });
                    return;
                }
                this.telemetryService.publicLog2('uri_invoked/activate_extension/accept', { extensionId: extensionIdentifier.id });
                this.storageService.store(URL_TO_HANDLE, JSON.stringify(uri.toJSON()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                await this.hostService.reload();
            }
        }
        async waitUntilExtensionIsAdded(extensionId) {
            if (!(await this.extensionService.getExtension(extensionId.id))) {
                await new Promise((c, e) => {
                    const disposable = this.extensionService.onDidChangeExtensions(async () => {
                        try {
                            if (await this.extensionService.getExtension(extensionId.id)) {
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
        garbageCollect() {
            const now = new Date().getTime();
            const uriBuffer = new Map();
            this.uriBuffer.forEach((uris, extensionId) => {
                uris = uris.filter(({ timestamp }) => now - timestamp < FIVE_MINUTES);
                if (uris.length > 0) {
                    uriBuffer.set(extensionId, uris);
                }
            });
            this.uriBuffer = uriBuffer;
        }
        didUserTrustExtension(id) {
            if (this.userTrustedExtensionsStorage.has(id)) {
                return true;
            }
            return this.getConfirmedTrustedExtensionIdsFromConfiguration().indexOf(id) > -1;
        }
        getConfirmedTrustedExtensionIdsFromConfiguration() {
            const trustedExtensionIds = this.configurationService.getValue(USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY);
            if (!Array.isArray(trustedExtensionIds)) {
                return [];
            }
            return trustedExtensionIds;
        }
        dispose() {
            this.disposable.dispose();
            this.extensionHandlers.clear();
            this.uriBuffer.clear();
        }
    };
    ExtensionUrlHandler = __decorate([
        __param(0, url_1.IURLService),
        __param(1, extensions_1.IExtensionService),
        __param(2, dialogs_1.IDialogService),
        __param(3, notification_1.INotificationService),
        __param(4, extensionManagement_1.IExtensionManagementService),
        __param(5, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(6, host_1.IHostService),
        __param(7, extensionManagement_1.IExtensionGalleryService),
        __param(8, storage_1.IStorageService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, progress_1.IProgressService),
        __param(11, telemetry_1.ITelemetryService),
        __param(12, extensionUrlTrust_1.IExtensionUrlTrustService)
    ], ExtensionUrlHandler);
    (0, extensions_3.registerSingleton)(exports.IExtensionUrlHandler, ExtensionUrlHandler, 0 /* InstantiationType.Eager */);
    /**
     * This class handles URLs before `ExtensionUrlHandler` is instantiated.
     * More info: https://github.com/microsoft/vscode/issues/73101
     */
    let ExtensionUrlBootstrapHandler = class ExtensionUrlBootstrapHandler {
        static { ExtensionUrlBootstrapHandler_1 = this; }
        static { this._cache = []; }
        static get cache() {
            ExtensionUrlBootstrapHandler_1.disposable.dispose();
            const result = ExtensionUrlBootstrapHandler_1._cache;
            ExtensionUrlBootstrapHandler_1._cache = [];
            return result;
        }
        constructor(urlService) {
            ExtensionUrlBootstrapHandler_1.disposable = urlService.registerHandler(this);
        }
        async handleURL(uri, options) {
            if (!isExtensionId(uri.authority)) {
                return false;
            }
            ExtensionUrlBootstrapHandler_1._cache.push([uri, options]);
            return true;
        }
    };
    ExtensionUrlBootstrapHandler = ExtensionUrlBootstrapHandler_1 = __decorate([
        __param(0, url_1.IURLService)
    ], ExtensionUrlBootstrapHandler);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ExtensionUrlBootstrapHandler, 2 /* LifecyclePhase.Ready */);
    class ManageAuthorizedExtensionURIsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.extensions.action.manageAuthorizedExtensionURIs',
                title: { value: (0, nls_1.localize)('manage', "Manage Authorized Extension URIs..."), original: 'Manage Authorized Extension URIs...' },
                category: { value: (0, nls_1.localize)('extensions', "Extensions"), original: 'Extensions' },
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkeys_1.IsWebContext.toNegated()
                }
            });
        }
        async run(accessor) {
            const storageService = accessor.get(storage_1.IStorageService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const storage = new UserTrustedExtensionIdStorage(storageService);
            const items = storage.extensions.map(label => ({ label, picked: true }));
            if (items.length === 0) {
                await quickInputService.pick([{ label: (0, nls_1.localize)('no', 'There are currently no authorized extension URIs.') }]);
                return;
            }
            const result = await quickInputService.pick(items, { canPickMany: true });
            if (!result) {
                return;
            }
            storage.set(result.map(item => item.label));
        }
    }
    (0, actions_1.registerAction2)(ManageAuthorizedExtensionURIsAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uVXJsSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2Jyb3dzZXIvZXh0ZW5zaW9uVXJsSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBOEJoRyxNQUFNLFlBQVksR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztJQUNuQyxNQUFNLGNBQWMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBQ2pDLE1BQU0sYUFBYSxHQUFHLGlDQUFpQyxDQUFDO0lBQ3hELE1BQU0seUNBQXlDLEdBQUcsNENBQTRDLENBQUM7SUFDL0YsTUFBTSxtQ0FBbUMsR0FBRyx5Q0FBeUMsQ0FBQztJQUV0RixTQUFTLGFBQWEsQ0FBQyxLQUFhO1FBQ25DLE9BQU8sNkNBQTZDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFRCxNQUFNLDZCQUE2QjtRQUVsQyxJQUFJLFVBQVU7WUFDYixNQUFNLDJCQUEyQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxnQ0FBd0IsSUFBSSxDQUFDLENBQUM7WUFFN0gsSUFBSTtnQkFDSCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQzthQUMvQztZQUFDLE1BQU07Z0JBQ1AsT0FBTyxFQUFFLENBQUM7YUFDVjtRQUNGLENBQUM7UUFFRCxZQUFvQixjQUErQjtZQUEvQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7UUFBSSxDQUFDO1FBRXhELEdBQUcsQ0FBQyxFQUFVO1lBQ2IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRUQsR0FBRyxDQUFDLEVB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