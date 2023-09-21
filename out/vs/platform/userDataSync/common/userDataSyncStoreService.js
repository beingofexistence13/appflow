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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/storage/common/storage", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, async_1, cancellation_1, errors_1, event_1, lifecycle_1, mime_1, platform_1, resources_1, types_1, uri_1, uuid_1, configuration_1, environment_1, files_1, productService_1, request_1, serviceMachineId_1, storage_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RequestsSession = exports.UserDataSyncStoreService = exports.UserDataSyncStoreClient = exports.UserDataSyncStoreManagementService = exports.AbstractUserDataSyncStoreManagementService = void 0;
    const CONFIGURATION_SYNC_STORE_KEY = 'configurationSync.store';
    const SYNC_PREVIOUS_STORE = 'sync.previous.store';
    const DONOT_MAKE_REQUESTS_UNTIL_KEY = 'sync.donot-make-requests-until';
    const USER_SESSION_ID_KEY = 'sync.user-session-id';
    const MACHINE_SESSION_ID_KEY = 'sync.machine-session-id';
    const REQUEST_SESSION_LIMIT = 100;
    const REQUEST_SESSION_INTERVAL = 1000 * 60 * 5; /* 5 minutes */
    let AbstractUserDataSyncStoreManagementService = class AbstractUserDataSyncStoreManagementService extends lifecycle_1.Disposable {
        get userDataSyncStore() { return this._userDataSyncStore; }
        get userDataSyncStoreType() {
            return this.storageService.get(userDataSync_1.SYNC_SERVICE_URL_TYPE, -1 /* StorageScope.APPLICATION */);
        }
        set userDataSyncStoreType(type) {
            this.storageService.store(userDataSync_1.SYNC_SERVICE_URL_TYPE, type, -1 /* StorageScope.APPLICATION */, platform_1.isWeb ? 0 /* StorageTarget.USER */ : 1 /* StorageTarget.MACHINE */);
        }
        constructor(productService, configurationService, storageService) {
            super();
            this.productService = productService;
            this.configurationService = configurationService;
            this.storageService = storageService;
            this._onDidChangeUserDataSyncStore = this._register(new event_1.Emitter());
            this.onDidChangeUserDataSyncStore = this._onDidChangeUserDataSyncStore.event;
            this.updateUserDataSyncStore();
            const disposable = this._register(new lifecycle_1.DisposableStore());
            this._register(event_1.Event.filter(storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, userDataSync_1.SYNC_SERVICE_URL_TYPE, disposable), () => this.userDataSyncStoreType !== this.userDataSyncStore?.type, disposable)(() => this.updateUserDataSyncStore()));
        }
        updateUserDataSyncStore() {
            this._userDataSyncStore = this.toUserDataSyncStore(this.productService[CONFIGURATION_SYNC_STORE_KEY]);
            this._onDidChangeUserDataSyncStore.fire();
        }
        toUserDataSyncStore(configurationSyncStore) {
            if (!configurationSyncStore) {
                return undefined;
            }
            // Check for web overrides for backward compatibility while reading previous store
            configurationSyncStore = platform_1.isWeb && configurationSyncStore.web ? { ...configurationSyncStore, ...configurationSyncStore.web } : configurationSyncStore;
            if ((0, types_1.isString)(configurationSyncStore.url)
                && (0, types_1.isObject)(configurationSyncStore.authenticationProviders)
                && Object.keys(configurationSyncStore.authenticationProviders).every(authenticationProviderId => Array.isArray(configurationSyncStore.authenticationProviders[authenticationProviderId].scopes))) {
                const syncStore = configurationSyncStore;
                const canSwitch = !!syncStore.canSwitch;
                const defaultType = syncStore.url === syncStore.insidersUrl ? 'insiders' : 'stable';
                const type = (canSwitch ? this.userDataSyncStoreType : undefined) || defaultType;
                const url = type === 'insiders' ? syncStore.insidersUrl
                    : type === 'stable' ? syncStore.stableUrl
                        : syncStore.url;
                return {
                    url: uri_1.URI.parse(url),
                    type,
                    defaultType,
                    defaultUrl: uri_1.URI.parse(syncStore.url),
                    stableUrl: uri_1.URI.parse(syncStore.stableUrl),
                    insidersUrl: uri_1.URI.parse(syncStore.insidersUrl),
                    canSwitch,
                    authenticationProviders: Object.keys(syncStore.authenticationProviders).reduce((result, id) => {
                        result.push({ id, scopes: syncStore.authenticationProviders[id].scopes });
                        return result;
                    }, [])
                };
            }
            return undefined;
        }
    };
    exports.AbstractUserDataSyncStoreManagementService = AbstractUserDataSyncStoreManagementService;
    exports.AbstractUserDataSyncStoreManagementService = AbstractUserDataSyncStoreManagementService = __decorate([
        __param(0, productService_1.IProductService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, storage_1.IStorageService)
    ], AbstractUserDataSyncStoreManagementService);
    let UserDataSyncStoreManagementService = class UserDataSyncStoreManagementService extends AbstractUserDataSyncStoreManagementService {
        constructor(productService, configurationService, storageService) {
            super(productService, configurationService, storageService);
            const previousConfigurationSyncStore = this.storageService.get(SYNC_PREVIOUS_STORE, -1 /* StorageScope.APPLICATION */);
            if (previousConfigurationSyncStore) {
                this.previousConfigurationSyncStore = JSON.parse(previousConfigurationSyncStore);
            }
            const syncStore = this.productService[CONFIGURATION_SYNC_STORE_KEY];
            if (syncStore) {
                this.storageService.store(SYNC_PREVIOUS_STORE, JSON.stringify(syncStore), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(SYNC_PREVIOUS_STORE, -1 /* StorageScope.APPLICATION */);
            }
        }
        async switch(type) {
            if (type !== this.userDataSyncStoreType) {
                this.userDataSyncStoreType = type;
                this.updateUserDataSyncStore();
            }
        }
        async getPreviousUserDataSyncStore() {
            return this.toUserDataSyncStore(this.previousConfigurationSyncStore);
        }
    };
    exports.UserDataSyncStoreManagementService = UserDataSyncStoreManagementService;
    exports.UserDataSyncStoreManagementService = UserDataSyncStoreManagementService = __decorate([
        __param(0, productService_1.IProductService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, storage_1.IStorageService)
    ], UserDataSyncStoreManagementService);
    let UserDataSyncStoreClient = class UserDataSyncStoreClient extends lifecycle_1.Disposable {
        get donotMakeRequestsUntil() { return this._donotMakeRequestsUntil; }
        constructor(userDataSyncStoreUrl, productService, requestService, logService, environmentService, fileService, storageService) {
            super();
            this.requestService = requestService;
            this.logService = logService;
            this.storageService = storageService;
            this._onTokenFailed = this._register(new event_1.Emitter());
            this.onTokenFailed = this._onTokenFailed.event;
            this._onTokenSucceed = this._register(new event_1.Emitter());
            this.onTokenSucceed = this._onTokenSucceed.event;
            this._donotMakeRequestsUntil = undefined;
            this._onDidChangeDonotMakeRequestsUntil = this._register(new event_1.Emitter());
            this.onDidChangeDonotMakeRequestsUntil = this._onDidChangeDonotMakeRequestsUntil.event;
            this.resetDonotMakeRequestsUntilPromise = undefined;
            this.updateUserDataSyncStoreUrl(userDataSyncStoreUrl);
            this.commonHeadersPromise = (0, serviceMachineId_1.getServiceMachineId)(environmentService, fileService, storageService)
                .then(uuid => {
                const headers = {
                    'X-Client-Name': `${productService.applicationName}${platform_1.isWeb ? '-web' : ''}`,
                    'X-Client-Version': productService.version,
                };
                if (productService.commit) {
                    headers['X-Client-Commit'] = productService.commit;
                }
                return headers;
            });
            /* A requests session that limits requests per sessions */
            this.session = new RequestsSession(REQUEST_SESSION_LIMIT, REQUEST_SESSION_INTERVAL, this.requestService, this.logService);
            this.initDonotMakeRequestsUntil();
            this._register((0, lifecycle_1.toDisposable)(() => {
                if (this.resetDonotMakeRequestsUntilPromise) {
                    this.resetDonotMakeRequestsUntilPromise.cancel();
                    this.resetDonotMakeRequestsUntilPromise = undefined;
                }
            }));
        }
        setAuthToken(token, type) {
            this.authToken = { token, type };
        }
        updateUserDataSyncStoreUrl(userDataSyncStoreUrl) {
            this.userDataSyncStoreUrl = userDataSyncStoreUrl ? (0, resources_1.joinPath)(userDataSyncStoreUrl, 'v1') : undefined;
        }
        initDonotMakeRequestsUntil() {
            const donotMakeRequestsUntil = this.storageService.getNumber(DONOT_MAKE_REQUESTS_UNTIL_KEY, -1 /* StorageScope.APPLICATION */);
            if (donotMakeRequestsUntil && Date.now() < donotMakeRequestsUntil) {
                this.setDonotMakeRequestsUntil(new Date(donotMakeRequestsUntil));
            }
        }
        setDonotMakeRequestsUntil(donotMakeRequestsUntil) {
            if (this._donotMakeRequestsUntil?.getTime() !== donotMakeRequestsUntil?.getTime()) {
                this._donotMakeRequestsUntil = donotMakeRequestsUntil;
                if (this.resetDonotMakeRequestsUntilPromise) {
                    this.resetDonotMakeRequestsUntilPromise.cancel();
                    this.resetDonotMakeRequestsUntilPromise = undefined;
                }
                if (this._donotMakeRequestsUntil) {
                    this.storageService.store(DONOT_MAKE_REQUESTS_UNTIL_KEY, this._donotMakeRequestsUntil.getTime(), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                    this.resetDonotMakeRequestsUntilPromise = (0, async_1.createCancelablePromise)(token => (0, async_1.timeout)(this._donotMakeRequestsUntil.getTime() - Date.now(), token).then(() => this.setDonotMakeRequestsUntil(undefined)));
                    this.resetDonotMakeRequestsUntilPromise.then(null, e => null /* ignore error */);
                }
                else {
                    this.storageService.remove(DONOT_MAKE_REQUESTS_UNTIL_KEY, -1 /* StorageScope.APPLICATION */);
                }
                this._onDidChangeDonotMakeRequestsUntil.fire();
            }
        }
        // #region Collection
        async getAllCollections(headers = {}) {
            if (!this.userDataSyncStoreUrl) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.joinPath)(this.userDataSyncStoreUrl, 'collection').toString();
            headers = { ...headers };
            headers['Content-Type'] = 'application/json';
            const context = await this.request(url, { type: 'GET', headers }, [], cancellation_1.CancellationToken.None);
            return (await (0, request_1.asJson)(context))?.map(({ id }) => id) || [];
        }
        async createCollection(headers = {}) {
            if (!this.userDataSyncStoreUrl) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.joinPath)(this.userDataSyncStoreUrl, 'collection').toString();
            headers = { ...headers };
            headers['Content-Type'] = mime_1.Mimes.text;
            const context = await this.request(url, { type: 'POST', headers }, [], cancellation_1.CancellationToken.None);
            const collectionId = await (0, request_1.asTextOrError)(context);
            if (!collectionId) {
                throw new userDataSync_1.UserDataSyncStoreError('Server did not return the collection id', url, "NoCollection" /* UserDataSyncErrorCode.NoCollection */, context.res.statusCode, context.res.headers[userDataSync_1.HEADER_OPERATION_ID]);
            }
            return collectionId;
        }
        async deleteCollection(collection, headers = {}) {
            if (!this.userDataSyncStoreUrl) {
                throw new Error('No settings sync store url configured.');
            }
            const url = collection ? (0, resources_1.joinPath)(this.userDataSyncStoreUrl, 'collection', collection).toString() : (0, resources_1.joinPath)(this.userDataSyncStoreUrl, 'collection').toString();
            headers = { ...headers };
            await this.request(url, { type: 'DELETE', headers }, [], cancellation_1.CancellationToken.None);
        }
        // #endregion
        // #region Resource
        async getAllResourceRefs(resource, collection) {
            if (!this.userDataSyncStoreUrl) {
                throw new Error('No settings sync store url configured.');
            }
            const uri = this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource);
            const headers = {};
            const context = await this.request(uri.toString(), { type: 'GET', headers }, [], cancellation_1.CancellationToken.None);
            const result = await (0, request_1.asJson)(context) || [];
            return result.map(({ url, created }) => ({ ref: (0, resources_1.relativePath)(uri, uri.with({ path: url })), created: created * 1000 /* Server returns in seconds */ }));
        }
        async resolveResourceContent(resource, ref, collection, headers = {}) {
            if (!this.userDataSyncStoreUrl) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.joinPath)(this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource), ref).toString();
            headers = { ...headers };
            headers['Cache-Control'] = 'no-cache';
            const context = await this.request(url, { type: 'GET', headers }, [], cancellation_1.CancellationToken.None);
            const content = await (0, request_1.asTextOrError)(context);
            return content;
        }
        async deleteResource(resource, ref, collection) {
            if (!this.userDataSyncStoreUrl) {
                throw new Error('No settings sync store url configured.');
            }
            const url = ref !== null ? (0, resources_1.joinPath)(this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource), ref).toString() : this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource).toString();
            const headers = {};
            await this.request(url, { type: 'DELETE', headers }, [], cancellation_1.CancellationToken.None);
        }
        async deleteResources() {
            if (!this.userDataSyncStoreUrl) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.joinPath)(this.userDataSyncStoreUrl, 'resource').toString();
            const headers = { 'Content-Type': mime_1.Mimes.text };
            await this.request(url, { type: 'DELETE', headers }, [], cancellation_1.CancellationToken.None);
        }
        async readResource(resource, oldValue, collection, headers = {}) {
            if (!this.userDataSyncStoreUrl) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.joinPath)(this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource), 'latest').toString();
            headers = { ...headers };
            // Disable caching as they are cached by synchronisers
            headers['Cache-Control'] = 'no-cache';
            if (oldValue) {
                headers['If-None-Match'] = oldValue.ref;
            }
            const context = await this.request(url, { type: 'GET', headers }, [304], cancellation_1.CancellationToken.None);
            let userData = null;
            if (context.res.statusCode === 304) {
                userData = oldValue;
            }
            if (userData === null) {
                const ref = context.res.headers['etag'];
                if (!ref) {
                    throw new userDataSync_1.UserDataSyncStoreError('Server did not return the ref', url, "NoRef" /* UserDataSyncErrorCode.NoRef */, context.res.statusCode, context.res.headers[userDataSync_1.HEADER_OPERATION_ID]);
                }
                const content = await (0, request_1.asTextOrError)(context);
                if (!content && context.res.statusCode === 304) {
                    throw new userDataSync_1.UserDataSyncStoreError('Empty response', url, "EmptyResponse" /* UserDataSyncErrorCode.EmptyResponse */, context.res.statusCode, context.res.headers[userDataSync_1.HEADER_OPERATION_ID]);
                }
                userData = { ref, content };
            }
            return userData;
        }
        async writeResource(resource, data, ref, collection, headers = {}) {
            if (!this.userDataSyncStoreUrl) {
                throw new Error('No settings sync store url configured.');
            }
            const url = this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource).toString();
            headers = { ...headers };
            headers['Content-Type'] = mime_1.Mimes.text;
            if (ref) {
                headers['If-Match'] = ref;
            }
            const context = await this.request(url, { type: 'POST', data, headers }, [], cancellation_1.CancellationToken.None);
            const newRef = context.res.headers['etag'];
            if (!newRef) {
                throw new userDataSync_1.UserDataSyncStoreError('Server did not return the ref', url, "NoRef" /* UserDataSyncErrorCode.NoRef */, context.res.statusCode, context.res.headers[userDataSync_1.HEADER_OPERATION_ID]);
            }
            return newRef;
        }
        // #endregion
        async manifest(oldValue, headers = {}) {
            if (!this.userDataSyncStoreUrl) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.joinPath)(this.userDataSyncStoreUrl, 'manifest').toString();
            headers = { ...headers };
            headers['Content-Type'] = 'application/json';
            if (oldValue) {
                headers['If-None-Match'] = oldValue.ref;
            }
            const context = await this.request(url, { type: 'GET', headers }, [304], cancellation_1.CancellationToken.None);
            let manifest = null;
            if (context.res.statusCode === 304) {
                manifest = oldValue;
            }
            if (!manifest) {
                const ref = context.res.headers['etag'];
                if (!ref) {
                    throw new userDataSync_1.UserDataSyncStoreError('Server did not return the ref', url, "NoRef" /* UserDataSyncErrorCode.NoRef */, context.res.statusCode, context.res.headers[userDataSync_1.HEADER_OPERATION_ID]);
                }
                const content = await (0, request_1.asTextOrError)(context);
                if (!content && context.res.statusCode === 304) {
                    throw new userDataSync_1.UserDataSyncStoreError('Empty response', url, "EmptyResponse" /* UserDataSyncErrorCode.EmptyResponse */, context.res.statusCode, context.res.headers[userDataSync_1.HEADER_OPERATION_ID]);
                }
                if (content) {
                    manifest = { ...JSON.parse(content), ref };
                }
            }
            const currentSessionId = this.storageService.get(USER_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
            if (currentSessionId && manifest && currentSessionId !== manifest.session) {
                // Server session is different from client session so clear cached session.
                this.clearSession();
            }
            if (manifest === null && currentSessionId) {
                // server session is cleared so clear cached session.
                this.clearSession();
            }
            if (manifest) {
                // update session
                this.storageService.store(USER_SESSION_ID_KEY, manifest.session, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            return manifest;
        }
        async clear() {
            if (!this.userDataSyncStoreUrl) {
                throw new Error('No settings sync store url configured.');
            }
            await this.deleteCollection();
            await this.deleteResources();
            // clear cached session.
            this.clearSession();
        }
        async getActivityData() {
            if (!this.userDataSyncStoreUrl) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.joinPath)(this.userDataSyncStoreUrl, 'download').toString();
            const headers = {};
            const context = await this.request(url, { type: 'GET', headers }, [], cancellation_1.CancellationToken.None);
            if (!(0, request_1.isSuccess)(context)) {
                throw new userDataSync_1.UserDataSyncStoreError('Server returned ' + context.res.statusCode, url, "EmptyResponse" /* UserDataSyncErrorCode.EmptyResponse */, context.res.statusCode, context.res.headers[userDataSync_1.HEADER_OPERATION_ID]);
            }
            if ((0, request_1.hasNoContent)(context)) {
                throw new userDataSync_1.UserDataSyncStoreError('Empty response', url, "EmptyResponse" /* UserDataSyncErrorCode.EmptyResponse */, context.res.statusCode, context.res.headers[userDataSync_1.HEADER_OPERATION_ID]);
            }
            return context.stream;
        }
        getResourceUrl(userDataSyncStoreUrl, collection, resource) {
            return collection ? (0, resources_1.joinPath)(userDataSyncStoreUrl, 'collection', collection, 'resource', resource) : (0, resources_1.joinPath)(userDataSyncStoreUrl, 'resource', resource);
        }
        clearSession() {
            this.storageService.remove(USER_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
            this.storageService.remove(MACHINE_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
        }
        async request(url, options, successCodes, token) {
            if (!this.authToken) {
                throw new userDataSync_1.UserDataSyncStoreError('No Auth Token Available', url, "Unauthorized" /* UserDataSyncErrorCode.Unauthorized */, undefined, undefined);
            }
            if (this._donotMakeRequestsUntil && Date.now() < this._donotMakeRequestsUntil.getTime()) {
                throw new userDataSync_1.UserDataSyncStoreError(`${options.type} request '${url}' failed because of too many requests (429).`, url, "TooManyRequestsAndRetryAfter" /* UserDataSyncErrorCode.TooManyRequestsAndRetryAfter */, undefined, undefined);
            }
            this.setDonotMakeRequestsUntil(undefined);
            const commonHeaders = await this.commonHeadersPromise;
            options.headers = {
                ...(options.headers || {}),
                ...commonHeaders,
                'X-Account-Type': this.authToken.type,
                'authorization': `Bearer ${this.authToken.token}`,
            };
            // Add session headers
            this.addSessionHeaders(options.headers);
            this.logService.trace('Sending request to server', { url, type: options.type, headers: { ...options.headers, ...{ authorization: undefined } } });
            let context;
            try {
                context = await this.session.request(url, options, token);
            }
            catch (e) {
                if (!(e instanceof userDataSync_1.UserDataSyncStoreError)) {
                    let code = "RequestFailed" /* UserDataSyncErrorCode.RequestFailed */;
                    const errorMessage = (0, errors_1.getErrorMessage)(e).toLowerCase();
                    // Request timed out
                    if (errorMessage.includes('xhr timeout')) {
                        code = "RequestTimeout" /* UserDataSyncErrorCode.RequestTimeout */;
                    }
                    // Request protocol not supported
                    else if (errorMessage.includes('protocol') && errorMessage.includes('not supported')) {
                        code = "RequestProtocolNotSupported" /* UserDataSyncErrorCode.RequestProtocolNotSupported */;
                    }
                    // Request path not escaped
                    else if (errorMessage.includes('request path contains unescaped characters')) {
                        code = "RequestPathNotEscaped" /* UserDataSyncErrorCode.RequestPathNotEscaped */;
                    }
                    // Request header not an object
                    else if (errorMessage.includes('headers must be an object')) {
                        code = "RequestHeadersNotObject" /* UserDataSyncErrorCode.RequestHeadersNotObject */;
                    }
                    // Request canceled
                    else if ((0, errors_1.isCancellationError)(e)) {
                        code = "RequestCanceled" /* UserDataSyncErrorCode.RequestCanceled */;
                    }
                    e = new userDataSync_1.UserDataSyncStoreError(`Connection refused for the request '${url}'.`, url, code, undefined, undefined);
                }
                this.logService.info('Request failed', url);
                throw e;
            }
            const operationId = context.res.headers[userDataSync_1.HEADER_OPERATION_ID];
            const requestInfo = { url, status: context.res.statusCode, 'execution-id': options.headers[userDataSync_1.HEADER_EXECUTION_ID], 'operation-id': operationId };
            const isSuccess = (0, request_1.isSuccess)(context) || (context.res.statusCode && successCodes.includes(context.res.statusCode));
            let failureMessage = '';
            if (isSuccess) {
                this.logService.trace('Request succeeded', requestInfo);
            }
            else {
                failureMessage = await (0, request_1.asText)(context) || '';
                this.logService.info('Request failed', requestInfo, failureMessage);
            }
            if (context.res.statusCode === 401 || context.res.statusCode === 403) {
                this.authToken = undefined;
                if (context.res.statusCode === 401) {
                    this._onTokenFailed.fire("Unauthorized" /* UserDataSyncErrorCode.Unauthorized */);
                    throw new userDataSync_1.UserDataSyncStoreError(`${options.type} request '${url}' failed because of Unauthorized (401).`, url, "Unauthorized" /* UserDataSyncErrorCode.Unauthorized */, context.res.statusCode, operationId);
                }
                if (context.res.statusCode === 403) {
                    this._onTokenFailed.fire("Forbidden" /* UserDataSyncErrorCode.Forbidden */);
                    throw new userDataSync_1.UserDataSyncStoreError(`${options.type} request '${url}' failed because the access is forbidden (403).`, url, "Forbidden" /* UserDataSyncErrorCode.Forbidden */, context.res.statusCode, operationId);
                }
            }
            this._onTokenSucceed.fire();
            if (context.res.statusCode === 404) {
                throw new userDataSync_1.UserDataSyncStoreError(`${options.type} request '${url}' failed because the requested resource is not found (404).`, url, "NotFound" /* UserDataSyncErrorCode.NotFound */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 405) {
                throw new userDataSync_1.UserDataSyncStoreError(`${options.type} request '${url}' failed because the requested endpoint is not found (405). ${failureMessage}`, url, "MethodNotFound" /* UserDataSyncErrorCode.MethodNotFound */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 409) {
                throw new userDataSync_1.UserDataSyncStoreError(`${options.type} request '${url}' failed because of Conflict (409). There is new data for this resource. Make the request again with latest data.`, url, "Conflict" /* UserDataSyncErrorCode.Conflict */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 410) {
                throw new userDataSync_1.UserDataSyncStoreError(`${options.type} request '${url}' failed because the requested resource is not longer available (410).`, url, "Gone" /* UserDataSyncErrorCode.Gone */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 412) {
                throw new userDataSync_1.UserDataSyncStoreError(`${options.type} request '${url}' failed because of Precondition Failed (412). There is new data for this resource. Make the request again with latest data.`, url, "PreconditionFailed" /* UserDataSyncErrorCode.PreconditionFailed */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 413) {
                throw new userDataSync_1.UserDataSyncStoreError(`${options.type} request '${url}' failed because of too large payload (413).`, url, "TooLarge" /* UserDataSyncErrorCode.TooLarge */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 426) {
                throw new userDataSync_1.UserDataSyncStoreError(`${options.type} request '${url}' failed with status Upgrade Required (426). Please upgrade the client and try again.`, url, "UpgradeRequired" /* UserDataSyncErrorCode.UpgradeRequired */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 429) {
                const retryAfter = context.res.headers['retry-after'];
                if (retryAfter) {
                    this.setDonotMakeRequestsUntil(new Date(Date.now() + (parseInt(retryAfter) * 1000)));
                    throw new userDataSync_1.UserDataSyncStoreError(`${options.type} request '${url}' failed because of too many requests (429).`, url, "TooManyRequestsAndRetryAfter" /* UserDataSyncErrorCode.TooManyRequestsAndRetryAfter */, context.res.statusCode, operationId);
                }
                else {
                    throw new userDataSync_1.UserDataSyncStoreError(`${options.type} request '${url}' failed because of too many requests (429).`, url, "RemoteTooManyRequests" /* UserDataSyncErrorCode.TooManyRequests */, context.res.statusCode, operationId);
                }
            }
            if (!isSuccess) {
                throw new userDataSync_1.UserDataSyncStoreError('Server returned ' + context.res.statusCode, url, "Unknown" /* UserDataSyncErrorCode.Unknown */, context.res.statusCode, operationId);
            }
            return context;
        }
        addSessionHeaders(headers) {
            let machineSessionId = this.storageService.get(MACHINE_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
            if (machineSessionId === undefined) {
                machineSessionId = (0, uuid_1.generateUuid)();
                this.storageService.store(MACHINE_SESSION_ID_KEY, machineSessionId, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            headers['X-Machine-Session-Id'] = machineSessionId;
            const userSessionId = this.storageService.get(USER_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
            if (userSessionId !== undefined) {
                headers['X-User-Session-Id'] = userSessionId;
            }
        }
    };
    exports.UserDataSyncStoreClient = UserDataSyncStoreClient;
    exports.UserDataSyncStoreClient = UserDataSyncStoreClient = __decorate([
        __param(1, productService_1.IProductService),
        __param(2, request_1.IRequestService),
        __param(3, userDataSync_1.IUserDataSyncLogService),
        __param(4, environment_1.IEnvironmentService),
        __param(5, files_1.IFileService),
        __param(6, storage_1.IStorageService)
    ], UserDataSyncStoreClient);
    let UserDataSyncStoreService = class UserDataSyncStoreService extends UserDataSyncStoreClient {
        constructor(userDataSyncStoreManagementService, productService, requestService, logService, environmentService, fileService, storageService) {
            super(userDataSyncStoreManagementService.userDataSyncStore?.url, productService, requestService, logService, environmentService, fileService, storageService);
            this._register(userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(() => this.updateUserDataSyncStoreUrl(userDataSyncStoreManagementService.userDataSyncStore?.url)));
        }
    };
    exports.UserDataSyncStoreService = UserDataSyncStoreService;
    exports.UserDataSyncStoreService = UserDataSyncStoreService = __decorate([
        __param(0, userDataSync_1.IUserDataSyncStoreManagementService),
        __param(1, productService_1.IProductService),
        __param(2, request_1.IRequestService),
        __param(3, userDataSync_1.IUserDataSyncLogService),
        __param(4, environment_1.IEnvironmentService),
        __param(5, files_1.IFileService),
        __param(6, storage_1.IStorageService)
    ], UserDataSyncStoreService);
    class RequestsSession {
        constructor(limit, interval, /* in ms */ requestService, logService) {
            this.limit = limit;
            this.interval = interval;
            this.requestService = requestService;
            this.logService = logService;
            this.requests = [];
            this.startTime = undefined;
        }
        request(url, options, token) {
            if (this.isExpired()) {
                this.reset();
            }
            options.url = url;
            if (this.requests.length >= this.limit) {
                this.logService.info('Too many requests', ...this.requests);
                throw new userDataSync_1.UserDataSyncStoreError(`Too many requests. Only ${this.limit} requests allowed in ${this.interval / (1000 * 60)} minutes.`, url, "LocalTooManyRequests" /* UserDataSyncErrorCode.LocalTooManyRequests */, undefined, undefined);
            }
            this.startTime = this.startTime || new Date();
            this.requests.push(url);
            return this.requestService.request(options, token);
        }
        isExpired() {
            return this.startTime !== undefined && new Date().getTime() - this.startTime.getTime() > this.interval;
        }
        reset() {
            this.requests = [];
            this.startTime = undefined;
        }
    }
    exports.RequestsSession = RequestsSession;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jU3RvcmVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFTeW5jL2NvbW1vbi91c2VyRGF0YVN5bmNTdG9yZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUJoRyxNQUFNLDRCQUE0QixHQUFHLHlCQUF5QixDQUFDO0lBQy9ELE1BQU0sbUJBQW1CLEdBQUcscUJBQXFCLENBQUM7SUFDbEQsTUFBTSw2QkFBNkIsR0FBRyxnQ0FBZ0MsQ0FBQztJQUN2RSxNQUFNLG1CQUFtQixHQUFHLHNCQUFzQixDQUFDO0lBQ25ELE1BQU0sc0JBQXNCLEdBQUcseUJBQXlCLENBQUM7SUFDekQsTUFBTSxxQkFBcUIsR0FBRyxHQUFHLENBQUM7SUFDbEMsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLGVBQWU7SUFJeEQsSUFBZSwwQ0FBMEMsR0FBekQsTUFBZSwwQ0FBMkMsU0FBUSxzQkFBVTtRQU9sRixJQUFJLGlCQUFpQixLQUFvQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFFMUYsSUFBYyxxQkFBcUI7WUFDbEMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxvQ0FBcUIsb0NBQW9ELENBQUM7UUFDMUcsQ0FBQztRQUNELElBQWMscUJBQXFCLENBQUMsSUFBdUM7WUFDMUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsb0NBQXFCLEVBQUUsSUFBSSxxQ0FBNEIsZ0JBQUssQ0FBQyxDQUFDLDRCQUFzQyxDQUFDLDhCQUFzQixDQUFDLENBQUM7UUFDeEosQ0FBQztRQUVELFlBQ2tCLGNBQWtELEVBQzVDLG9CQUE4RCxFQUNwRSxjQUFrRDtZQUVuRSxLQUFLLEVBQUUsQ0FBQztZQUo0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