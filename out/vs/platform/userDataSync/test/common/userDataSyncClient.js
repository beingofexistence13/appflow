/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uuid", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/userDataSync/common/ignoredExtensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataSyncLocalStoreService", "vs/platform/userDataSync/common/userDataSyncMachines", "vs/platform/userDataSync/common/userDataSyncEnablementService", "vs/platform/userDataSync/common/userDataSyncService", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/policy/common/policy", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/platform/userDataProfile/test/common/userDataProfileStorageService.test"], function (require, exports, buffer_1, event_1, lifecycle_1, network_1, resources_1, uri_1, uuid_1, configuration_1, configurationService_1, environment_1, extensionEnablementService_1, extensionManagement_1, files_1, fileService_1, inMemoryFilesystemProvider_1, instantiationServiceMock_1, log_1, product_1, productService_1, request_1, storage_1, telemetry_1, telemetryUtils_1, uriIdentity_1, uriIdentityService_1, extensionStorage_1, ignoredExtensions_1, userDataSync_1, userDataSyncAccount_1, userDataSyncLocalStoreService_1, userDataSyncMachines_1, userDataSyncEnablementService_1, userDataSyncService_1, userDataSyncStoreService_1, userDataProfile_1, policy_1, userDataProfileStorageService_1, userDataProfileStorageService_test_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestUserDataSyncUtilService = exports.UserDataSyncTestServer = exports.UserDataSyncClient = void 0;
    class UserDataSyncClient extends lifecycle_1.Disposable {
        constructor(testServer = new UserDataSyncTestServer()) {
            super();
            this.testServer = testServer;
            this.instantiationService = this._register(new instantiationServiceMock_1.TestInstantiationService());
        }
        async setUp(empty = false) {
            this._register((0, userDataSync_1.registerConfiguration)());
            const logService = this.instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
            const userRoamingDataHome = uri_1.URI.file('userdata').with({ scheme: network_1.Schemas.inMemory });
            const userDataSyncHome = (0, resources_1.joinPath)(userRoamingDataHome, '.sync');
            const environmentService = this.instantiationService.stub(environment_1.IEnvironmentService, {
                userDataSyncHome,
                userRoamingDataHome,
                cacheHome: (0, resources_1.joinPath)(userRoamingDataHome, 'cache'),
                argvResource: (0, resources_1.joinPath)(userRoamingDataHome, 'argv.json'),
                sync: 'on',
            });
            this.instantiationService.stub(productService_1.IProductService, {
                _serviceBrand: undefined, ...product_1.default, ...{
                    'configurationSync.store': {
                        url: this.testServer.url,
                        stableUrl: this.testServer.url,
                        insidersUrl: this.testServer.url,
                        canSwitch: false,
                        authenticationProviders: { 'test': { scopes: [] } }
                    }
                }
            });
            const fileService = this._register(new fileService_1.FileService(logService));
            this._register(fileService.registerProvider(network_1.Schemas.inMemory, this._register(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider())));
            this._register(fileService.registerProvider(userDataSync_1.USER_DATA_SYNC_SCHEME, this._register(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider())));
            this.instantiationService.stub(files_1.IFileService, fileService);
            const uriIdentityService = this._register(this.instantiationService.createInstance(uriIdentityService_1.UriIdentityService));
            this.instantiationService.stub(uriIdentity_1.IUriIdentityService, uriIdentityService);
            const userDataProfilesService = this._register(new userDataProfile_1.InMemoryUserDataProfilesService(environmentService, fileService, uriIdentityService, logService));
            this.instantiationService.stub(userDataProfile_1.IUserDataProfilesService, userDataProfilesService);
            const storageService = this._register(new TestStorageService(userDataProfilesService.defaultProfile));
            this.instantiationService.stub(storage_1.IStorageService, this._register(storageService));
            this.instantiationService.stub(userDataProfileStorageService_1.IUserDataProfileStorageService, this._register(new userDataProfileStorageService_test_1.TestUserDataProfileStorageService(storageService)));
            const configurationService = this._register(new configurationService_1.ConfigurationService(userDataProfilesService.defaultProfile.settingsResource, fileService, new policy_1.NullPolicyService(), logService));
            await configurationService.initialize();
            this.instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            this.instantiationService.stub(request_1.IRequestService, this.testServer);
            this.instantiationService.stub(userDataSync_1.IUserDataSyncLogService, logService);
            this.instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            this.instantiationService.stub(userDataSync_1.IUserDataSyncStoreManagementService, this._register(this.instantiationService.createInstance(userDataSyncStoreService_1.UserDataSyncStoreManagementService)));
            this.instantiationService.stub(userDataSync_1.IUserDataSyncStoreService, this._register(this.instantiationService.createInstance(userDataSyncStoreService_1.UserDataSyncStoreService)));
            const userDataSyncAccountService = this._register(this.instantiationService.createInstance(userDataSyncAccount_1.UserDataSyncAccountService));
            await userDataSyncAccountService.updateAccount({ authenticationProviderId: 'authenticationProviderId', token: 'token' });
            this.instantiationService.stub(userDataSyncAccount_1.IUserDataSyncAccountService, userDataSyncAccountService);
            this.instantiationService.stub(userDataSyncMachines_1.IUserDataSyncMachinesService, this._register(this.instantiationService.createInstance(userDataSyncMachines_1.UserDataSyncMachinesService)));
            this.instantiationService.stub(userDataSync_1.IUserDataSyncLocalStoreService, this._register(this.instantiationService.createInstance(userDataSyncLocalStoreService_1.UserDataSyncLocalStoreService)));
            this.instantiationService.stub(userDataSync_1.IUserDataSyncUtilService, new TestUserDataSyncUtilService());
            this.instantiationService.stub(userDataSync_1.IUserDataSyncEnablementService, this._register(this.instantiationService.createInstance(userDataSyncEnablementService_1.UserDataSyncEnablementService)));
            this.instantiationService.stub(extensionManagement_1.IExtensionManagementService, {
                async getInstalled() { return []; },
                onDidInstallExtensions: new event_1.Emitter().event,
                onDidUninstallExtension: new event_1.Emitter().event,
            });
            this.instantiationService.stub(extensionManagement_1.IGlobalExtensionEnablementService, this._register(this.instantiationService.createInstance(extensionEnablementService_1.GlobalExtensionEnablementService)));
            this.instantiationService.stub(extensionStorage_1.IExtensionStorageService, this._register(this.instantiationService.createInstance(extensionStorage_1.ExtensionStorageService)));
            this.instantiationService.stub(ignoredExtensions_1.IIgnoredExtensionsManagementService, this.instantiationService.createInstance(ignoredExtensions_1.IgnoredExtensionsManagementService));
            this.instantiationService.stub(extensionManagement_1.IExtensionGalleryService, {
                isEnabled() { return true; },
                async getCompatibleExtension() { return null; }
            });
            this.instantiationService.stub(userDataSync_1.IUserDataSyncService, this._register(this.instantiationService.createInstance(userDataSyncService_1.UserDataSyncService)));
            if (!empty) {
                await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.VSBuffer.fromString(JSON.stringify({})));
                await fileService.writeFile(userDataProfilesService.defaultProfile.keybindingsResource, buffer_1.VSBuffer.fromString(JSON.stringify([])));
                await fileService.writeFile((0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'c.json'), buffer_1.VSBuffer.fromString(`{}`));
                await fileService.writeFile(userDataProfilesService.defaultProfile.tasksResource, buffer_1.VSBuffer.fromString(`{}`));
                await fileService.writeFile(environmentService.argvResource, buffer_1.VSBuffer.fromString(JSON.stringify({ 'locale': 'en' })));
            }
            await configurationService.reloadConfiguration();
        }
        async sync() {
            await (await this.instantiationService.get(userDataSync_1.IUserDataSyncService).createSyncTask(null)).run();
        }
        read(resource, collection) {
            return this.instantiationService.get(userDataSync_1.IUserDataSyncStoreService).readResource(resource, null, collection);
        }
        async getResourceManifest() {
            const manifest = await this.instantiationService.get(userDataSync_1.IUserDataSyncStoreService).manifest(null);
            return manifest?.latest ?? null;
        }
        getSynchronizer(source) {
            return this.instantiationService.get(userDataSync_1.IUserDataSyncService).getOrCreateActiveProfileSynchronizer(this.instantiationService.get(userDataProfile_1.IUserDataProfilesService).defaultProfile, undefined).enabled.find(s => s.resource === source);
        }
    }
    exports.UserDataSyncClient = UserDataSyncClient;
    const ALL_SERVER_RESOURCES = [...userDataSync_1.ALL_SYNC_RESOURCES, 'machines'];
    class UserDataSyncTestServer {
        get requests() { return this._requests; }
        get requestsWithAllHeaders() { return this._requestsWithAllHeaders; }
        get responses() { return this._responses; }
        reset() { this._requests = []; this._responses = []; this._requestsWithAllHeaders = []; }
        constructor(rateLimit = Number.MAX_SAFE_INTEGER, retryAfter) {
            this.rateLimit = rateLimit;
            this.retryAfter = retryAfter;
            this.url = 'http://host:3000';
            this.session = null;
            this.collections = new Map();
            this.data = new Map();
            this._requests = [];
            this._requestsWithAllHeaders = [];
            this._responses = [];
            this.manifestRef = 0;
            this.collectionCounter = 0;
        }
        async resolveProxy(url) { return url; }
        async request(options, token) {
            if (this._requests.length === this.rateLimit) {
                return this.toResponse(429, this.retryAfter ? { 'retry-after': `${this.retryAfter}` } : undefined);
            }
            const headers = {};
            if (options.headers) {
                if (options.headers['If-None-Match']) {
                    headers['If-None-Match'] = options.headers['If-None-Match'];
                }
                if (options.headers['If-Match']) {
                    headers['If-Match'] = options.headers['If-Match'];
                }
            }
            this._requests.push({ url: options.url, type: options.type, headers });
            this._requestsWithAllHeaders.push({ url: options.url, type: options.type, headers: options.headers });
            const requestContext = await this.doRequest(options);
            this._responses.push({ status: requestContext.res.statusCode });
            return requestContext;
        }
        async doRequest(options) {
            const versionUrl = `${this.url}/v1/`;
            const relativePath = options.url.indexOf(versionUrl) === 0 ? options.url.substring(versionUrl.length) : undefined;
            const segments = relativePath ? relativePath.split('/') : [];
            if (options.type === 'GET' && segments.length === 1 && segments[0] === 'manifest') {
                return this.getManifest(options.headers);
            }
            if (options.type === 'GET' && segments.length === 3 && segments[0] === 'resource') {
                return this.getResourceData(undefined, segments[1], segments[2] === 'latest' ? undefined : segments[2], options.headers);
            }
            if (options.type === 'POST' && segments.length === 2 && segments[0] === 'resource') {
                return this.writeData(undefined, segments[1], options.data, options.headers);
            }
            // resources in collection
            if (options.type === 'GET' && segments.length === 5 && segments[0] === 'collection' && segments[2] === 'resource') {
                return this.getResourceData(segments[1], segments[3], segments[4] === 'latest' ? undefined : segments[4], options.headers);
            }
            if (options.type === 'POST' && segments.length === 4 && segments[0] === 'collection' && segments[2] === 'resource') {
                return this.writeData(segments[1], segments[3], options.data, options.headers);
            }
            if (options.type === 'DELETE' && segments.length === 2 && segments[0] === 'resource') {
                return this.deleteResourceData(undefined, segments[1]);
            }
            if (options.type === 'DELETE' && segments.length === 1 && segments[0] === 'resource') {
                return this.clear(options.headers);
            }
            if (options.type === 'DELETE' && segments[0] === 'collection') {
                return this.toResponse(204);
            }
            if (options.type === 'POST' && segments.length === 1 && segments[0] === 'collection') {
                return this.createCollection();
            }
            return this.toResponse(501);
        }
        async getManifest(headers) {
            if (this.session) {
                const latest = Object.create({});
                this.data.forEach((value, key) => latest[key] = value.ref);
                let collection = undefined;
                if (this.collectionCounter) {
                    collection = {};
                    for (let collectionId = 1; collectionId <= this.collectionCounter; collectionId++) {
                        const collectionData = this.collections.get(`${collectionId}`);
                        if (collectionData) {
                            const latest = Object.create({});
                            collectionData.forEach((value, key) => latest[key] = value.ref);
                            collection[`${collectionId}`] = { latest };
                        }
                    }
                }
                const manifest = { session: this.session, latest, collection };
                return this.toResponse(200, { 'Content-Type': 'application/json', etag: `${this.manifestRef++}` }, JSON.stringify(manifest));
            }
            return this.toResponse(204, { etag: `${this.manifestRef++}` });
        }
        async getResourceData(collection, resource, ref, headers = {}) {
            const collectionData = collection ? this.collections.get(collection) : this.data;
            if (!collectionData) {
                return this.toResponse(501);
            }
            const resourceKey = ALL_SERVER_RESOURCES.find(key => key === resource);
            if (resourceKey) {
                const data = collectionData.get(resourceKey);
                if (ref && data?.ref !== ref) {
                    return this.toResponse(404);
                }
                if (!data) {
                    return this.toResponse(204, { etag: '0' });
                }
                if (headers['If-None-Match'] === data.ref) {
                    return this.toResponse(304);
                }
                return this.toResponse(200, { etag: data.ref }, data.content || '');
            }
            return this.toResponse(204);
        }
        async writeData(collection, resource, content = '', headers = {}) {
            if (!this.session) {
                this.session = (0, uuid_1.generateUuid)();
            }
            const collectionData = collection ? this.collections.get(collection) : this.data;
            if (!collectionData) {
                return this.toResponse(501);
            }
            const resourceKey = ALL_SERVER_RESOURCES.find(key => key === resource);
            if (resourceKey) {
                const data = collectionData.get(resourceKey);
                if (headers['If-Match'] !== undefined && headers['If-Match'] !== (data ? data.ref : '0')) {
                    return this.toResponse(412);
                }
                const ref = `${parseInt(data?.ref || '0') + 1}`;
                collectionData.set(resourceKey, { ref, content });
                return this.toResponse(200, { etag: ref });
            }
            return this.toResponse(204);
        }
        async deleteResourceData(collection, resource, headers = {}) {
            const collectionData = collection ? this.collections.get(collection) : this.data;
            if (!collectionData) {
                return this.toResponse(501);
            }
            const resourceKey = ALL_SERVER_RESOURCES.find(key => key === resource);
            if (resourceKey) {
                collectionData.delete(resourceKey);
                return this.toResponse(200);
            }
            return this.toResponse(404);
        }
        async createCollection() {
            const collectionId = `${++this.collectionCounter}`;
            this.collections.set(collectionId, new Map());
            return this.toResponse(200, {}, collectionId);
        }
        async clear(headers) {
            this.collections.clear();
            this.data.clear();
            this.session = null;
            this.collectionCounter = 0;
            return this.toResponse(204);
        }
        toResponse(statusCode, headers, data) {
            return {
                res: {
                    headers: headers || {},
                    statusCode
                },
                stream: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString(data || ''))
            };
        }
    }
    exports.UserDataSyncTestServer = UserDataSyncTestServer;
    class TestUserDataSyncUtilService {
        async resolveDefaultIgnoredSettings() {
            return (0, userDataSync_1.getDefaultIgnoredSettings)();
        }
        async resolveUserBindings(userbindings) {
            const keys = {};
            for (const keybinding of userbindings) {
                keys[keybinding] = keybinding;
            }
            return keys;
        }
        async resolveFormattingOptions(file) {
            return { eol: '\n', insertSpaces: false, tabSize: 4 };
        }
    }
    exports.TestUserDataSyncUtilService = TestUserDataSyncUtilService;
    class TestStorageService extends storage_1.InMemoryStorageService {
        constructor(profileStorageProfile) {
            super();
            this.profileStorageProfile = profileStorageProfile;
        }
        hasScope(profile) {
            return this.profileStorageProfile.id === profile.id;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jQ2xpZW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFTeW5jL3Rlc3QvY29tbW9uL3VzZXJEYXRhU3luY0NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE2Q2hHLE1BQWEsa0JBQW1CLFNBQVEsc0JBQVU7UUFJakQsWUFBcUIsYUFBcUMsSUFBSSxzQkFBc0IsRUFBRTtZQUNyRixLQUFLLEVBQUUsQ0FBQztZQURZLGVBQVUsR0FBVixVQUFVLENBQXVEO1lBRXJGLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksbURBQXdCLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQWlCLEtBQUs7WUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLG9DQUFxQixHQUFFLENBQUMsQ0FBQztZQUV4QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFXLEVBQUUsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQztZQUVyRixNQUFNLG1CQUFtQixHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLGlCQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNwRixNQUFNLGdCQUFnQixHQUFHLElBQUEsb0JBQVEsRUFBQyxtQkFBbUIsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNoRSxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsaUNBQW1CLEVBQWdDO2dCQUM1RyxnQkFBZ0I7Z0JBQ2hCLG1CQUFtQjtnQkFDbkIsU0FBUyxFQUFFLElBQUEsb0JBQVEsRUFBQyxtQkFBbUIsRUFB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