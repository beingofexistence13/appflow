/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uuid", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/userDataSync/common/ignoredExtensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataSyncLocalStoreService", "vs/platform/userDataSync/common/userDataSyncMachines", "vs/platform/userDataSync/common/userDataSyncEnablementService", "vs/platform/userDataSync/common/userDataSyncService", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/policy/common/policy", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/platform/userDataProfile/test/common/userDataProfileStorageService.test"], function (require, exports, buffer_1, event_1, lifecycle_1, network_1, resources_1, uri_1, uuid_1, configuration_1, configurationService_1, environment_1, extensionEnablementService_1, extensionManagement_1, files_1, fileService_1, inMemoryFilesystemProvider_1, instantiationServiceMock_1, log_1, product_1, productService_1, request_1, storage_1, telemetry_1, telemetryUtils_1, uriIdentity_1, uriIdentityService_1, extensionStorage_1, ignoredExtensions_1, userDataSync_1, userDataSyncAccount_1, userDataSyncLocalStoreService_1, userDataSyncMachines_1, userDataSyncEnablementService_1, userDataSyncService_1, userDataSyncStoreService_1, userDataProfile_1, policy_1, userDataProfileStorageService_1, userDataProfileStorageService_test_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Y$b = exports.$X$b = exports.$W$b = void 0;
    class $W$b extends lifecycle_1.$kc {
        constructor(testServer = new $X$b()) {
            super();
            this.testServer = testServer;
            this.instantiationService = this.B(new instantiationServiceMock_1.$L0b());
        }
        async setUp(empty = false) {
            this.B((0, userDataSync_1.$zgb)());
            const logService = this.instantiationService.stub(log_1.$5i, new log_1.$fj());
            const userRoamingDataHome = uri_1.URI.file('userdata').with({ scheme: network_1.Schemas.inMemory });
            const userDataSyncHome = (0, resources_1.$ig)(userRoamingDataHome, '.sync');
            const environmentService = this.instantiationService.stub(environment_1.$Ih, {
                userDataSyncHome,
                userRoamingDataHome,
                cacheHome: (0, resources_1.$ig)(userRoamingDataHome, 'cache'),
                argvResource: (0, resources_1.$ig)(userRoamingDataHome, 'argv.json'),
                sync: 'on',
            });
            this.instantiationService.stub(productService_1.$kj, {
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
            const fileService = this.B(new fileService_1.$Dp(logService));
            this.B(fileService.registerProvider(network_1.Schemas.inMemory, this.B(new inMemoryFilesystemProvider_1.$rAb())));
            this.B(fileService.registerProvider(userDataSync_1.$Wgb, this.B(new inMemoryFilesystemProvider_1.$rAb())));
            this.instantiationService.stub(files_1.$6j, fileService);
            const uriIdentityService = this.B(this.instantiationService.createInstance(uriIdentityService_1.$pr));
            this.instantiationService.stub(uriIdentity_1.$Ck, uriIdentityService);
            const userDataProfilesService = this.B(new userDataProfile_1.$Ik(environmentService, fileService, uriIdentityService, logService));
            this.instantiationService.stub(userDataProfile_1.$Ek, userDataProfilesService);
            const storageService = this.B(new TestStorageService(userDataProfilesService.defaultProfile));
            this.instantiationService.stub(storage_1.$Vo, this.B(storageService));
            this.instantiationService.stub(userDataProfileStorageService_1.$eAb, this.B(new userDataProfileStorageService_test_1.$V$b(storageService)));
            const configurationService = this.B(new configurationService_1.$zn(userDataProfilesService.defaultProfile.settingsResource, fileService, new policy_1.$_m(), logService));
            await configurationService.initialize();
            this.instantiationService.stub(configuration_1.$8h, configurationService);
            this.instantiationService.stub(request_1.$Io, this.testServer);
            this.instantiationService.stub(userDataSync_1.$Ugb, logService);
            this.instantiationService.stub(telemetry_1.$9k, telemetryUtils_1.$bo);
            this.instantiationService.stub(userDataSync_1.$Egb, this.B(this.instantiationService.createInstance(userDataSyncStoreService_1.$1Ab)));
            this.instantiationService.stub(userDataSync_1.$Fgb, this.B(this.instantiationService.createInstance(userDataSyncStoreService_1.$3Ab)));
            const userDataSyncAccountService = this.B(this.instantiationService.createInstance(userDataSyncAccount_1.$Fzb));
            await userDataSyncAccountService.updateAccount({ authenticationProviderId: 'authenticationProviderId', token: 'token' });
            this.instantiationService.stub(userDataSyncAccount_1.$Ezb, userDataSyncAccountService);
            this.instantiationService.stub(userDataSyncMachines_1.$sgb, this.B(this.instantiationService.createInstance(userDataSyncMachines_1.$ugb)));
            this.instantiationService.stub(userDataSync_1.$Ggb, this.B(this.instantiationService.createInstance(userDataSyncLocalStoreService_1.$F4b)));
            this.instantiationService.stub(userDataSync_1.$Tgb, new $Y$b());
            this.instantiationService.stub(userDataSync_1.$Pgb, this.B(this.instantiationService.createInstance(userDataSyncEnablementService_1.$u4b)));
            this.instantiationService.stub(extensionManagement_1.$2n, {
                async getInstalled() { return []; },
                onDidInstallExtensions: new event_1.$fd().event,
                onDidUninstallExtension: new event_1.$fd().event,
            });
            this.instantiationService.stub(extensionManagement_1.$5n, this.B(this.instantiationService.createInstance(extensionEnablementService_1.$Czb)));
            this.instantiationService.stub(extensionStorage_1.$Tz, this.B(this.instantiationService.createInstance(extensionStorage_1.$Uz)));
            this.instantiationService.stub(ignoredExtensions_1.$PBb, this.instantiationService.createInstance(ignoredExtensions_1.$QBb));
            this.instantiationService.stub(extensionManagement_1.$Zn, {
                isEnabled() { return true; },
                async getCompatibleExtension() { return null; }
            });
            this.instantiationService.stub(userDataSync_1.$Qgb, this.B(this.instantiationService.createInstance(userDataSyncService_1.$K4b)));
            if (!empty) {
                await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({})));
                await fileService.writeFile(userDataProfilesService.defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(JSON.stringify([])));
                await fileService.writeFile((0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'c.json'), buffer_1.$Fd.fromString(`{}`));
                await fileService.writeFile(userDataProfilesService.defaultProfile.tasksResource, buffer_1.$Fd.fromString(`{}`));
                await fileService.writeFile(environmentService.argvResource, buffer_1.$Fd.fromString(JSON.stringify({ 'locale': 'en' })));
            }
            await configurationService.reloadConfiguration();
        }
        async sync() {
            await (await this.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
        }
        read(resource, collection) {
            return this.instantiationService.get(userDataSync_1.$Fgb).readResource(resource, null, collection);
        }
        async getResourceManifest() {
            const manifest = await this.instantiationService.get(userDataSync_1.$Fgb).manifest(null);
            return manifest?.latest ?? null;
        }
        getSynchronizer(source) {
            return this.instantiationService.get(userDataSync_1.$Qgb).getOrCreateActiveProfileSynchronizer(this.instantiationService.get(userDataProfile_1.$Ek).defaultProfile, undefined).enabled.find(s => s.resource === source);
        }
    }
    exports.$W$b = $W$b;
    const ALL_SERVER_RESOURCES = [...userDataSync_1.$Bgb, 'machines'];
    class $X$b {
        get requests() { return this.d; }
        get requestsWithAllHeaders() { return this.e; }
        get responses() { return this.f; }
        reset() { this.d = []; this.f = []; this.e = []; }
        constructor(i = Number.MAX_SAFE_INTEGER, j) {
            this.i = i;
            this.j = j;
            this.url = 'http://host:3000';
            this.a = null;
            this.b = new Map();
            this.c = new Map();
            this.d = [];
            this.e = [];
            this.f = [];
            this.g = 0;
            this.h = 0;
        }
        async resolveProxy(url) { return url; }
        async request(options, token) {
            if (this.d.length === this.i) {
                return this.q(429, this.j ? { 'retry-after': `${this.j}` } : undefined);
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
            this.d.push({ url: options.url, type: options.type, headers });
            this.e.push({ url: options.url, type: options.type, headers: options.headers });
            const requestContext = await this.k(options);
            this.f.push({ status: requestContext.res.statusCode });
            return requestContext;
        }
        async k(options) {
            const versionUrl = `${this.url}/v1/`;
            const relativePath = options.url.indexOf(versionUrl) === 0 ? options.url.substring(versionUrl.length) : undefined;
            const segments = relativePath ? relativePath.split('/') : [];
            if (options.type === 'GET' && segments.length === 1 && segments[0] === 'manifest') {
                return this.l(options.headers);
            }
            if (options.type === 'GET' && segments.length === 3 && segments[0] === 'resource') {
                return this.m(undefined, segments[1], segments[2] === 'latest' ? undefined : segments[2], options.headers);
            }
            if (options.type === 'POST' && segments.length === 2 && segments[0] === 'resource') {
                return this.n(undefined, segments[1], options.data, options.headers);
            }
            // resources in collection
            if (options.type === 'GET' && segments.length === 5 && segments[0] === 'collection' && segments[2] === 'resource') {
                return this.m(segments[1], segments[3], segments[4] === 'latest' ? undefined : segments[4], options.headers);
            }
            if (options.type === 'POST' && segments.length === 4 && segments[0] === 'collection' && segments[2] === 'resource') {
                return this.n(segments[1], segments[3], options.data, options.headers);
            }
            if (options.type === 'DELETE' && segments.length === 2 && segments[0] === 'resource') {
                return this.o(undefined, segments[1]);
            }
            if (options.type === 'DELETE' && segments.length === 1 && segments[0] === 'resource') {
                return this.clear(options.headers);
            }
            if (options.type === 'DELETE' && segments[0] === 'collection') {
                return this.q(204);
            }
            if (options.type === 'POST' && segments.length === 1 && segments[0] === 'collection') {
                return this.p();
            }
            return this.q(501);
        }
        async l(headers) {
            if (this.a) {
                const latest = Object.create({});
                this.c.forEach((value, key) => latest[key] = value.ref);
                let collection = undefined;
                if (this.h) {
                    collection = {};
                    for (let collectionId = 1; collectionId <= this.h; collectionId++) {
                        const collectionData = this.b.get(`${collectionId}`);
                        if (collectionData) {
                            const latest = Object.create({});
                            collectionData.forEach((value, key) => latest[key] = value.ref);
                            collection[`${collectionId}`] = { latest };
                        }
                    }
                }
                const manifest = { session: this.a, latest, collection };
                return this.q(200, { 'Content-Type': 'application/json', etag: `${this.g++}` }, JSON.stringify(manifest));
            }
            return this.q(204, { etag: `${this.g++}` });
        }
        async m(collection, resource, ref, headers = {}) {
            const collectionData = collection ? this.b.get(collection) : this.c;
            if (!collectionData) {
                return this.q(501);
            }
            const resourceKey = ALL_SERVER_RESOURCES.find(key => key === resource);
            if (resourceKey) {
                const data = collectionData.get(resourceKey);
                if (ref && data?.ref !== ref) {
                    return this.q(404);
                }
                if (!data) {
                    return this.q(204, { etag: '0' });
                }
                if (headers['If-None-Match'] === data.ref) {
                    return this.q(304);
                }
                return this.q(200, { etag: data.ref }, data.content || '');
            }
            return this.q(204);
        }
        async n(collection, resource, content = '', headers = {}) {
            if (!this.a) {
                this.a = (0, uuid_1.$4f)();
            }
            const collectionData = collection ? this.b.get(collection) : this.c;
            if (!collectionData) {
                return this.q(501);
            }
            const resourceKey = ALL_SERVER_RESOURCES.find(key => key === resource);
            if (resourceKey) {
                const data = collectionData.get(resourceKey);
                if (headers['If-Match'] !== undefined && headers['If-Match'] !== (data ? data.ref : '0')) {
                    return this.q(412);
                }
                const ref = `${parseInt(data?.ref || '0') + 1}`;
                collectionData.set(resourceKey, { ref, content });
                return this.q(200, { etag: ref });
            }
            return this.q(204);
        }
        async o(collection, resource, headers = {}) {
            const collectionData = collection ? this.b.get(collection) : this.c;
            if (!collectionData) {
                return this.q(501);
            }
            const resourceKey = ALL_SERVER_RESOURCES.find(key => key === resource);
            if (resourceKey) {
                collectionData.delete(resourceKey);
                return this.q(200);
            }
            return this.q(404);
        }
        async p() {
            const collectionId = `${++this.h}`;
            this.b.set(collectionId, new Map());
            return this.q(200, {}, collectionId);
        }
        async clear(headers) {
            this.b.clear();
            this.c.clear();
            this.a = null;
            this.h = 0;
            return this.q(204);
        }
        q(statusCode, headers, data) {
            return {
                res: {
                    headers: headers || {},
                    statusCode
                },
                stream: (0, buffer_1.$Td)(buffer_1.$Fd.fromString(data || ''))
            };
        }
    }
    exports.$X$b = $X$b;
    class $Y$b {
        async resolveDefaultIgnoredSettings() {
            return (0, userDataSync_1.$wgb)();
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
    exports.$Y$b = $Y$b;
    class TestStorageService extends storage_1.$Zo {
        constructor(db) {
            super();
            this.db = db;
        }
        hasScope(profile) {
            return this.db.id === profile.id;
        }
    }
});
//# sourceMappingURL=userDataSyncClient.js.map