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
    exports.$4Ab = exports.$3Ab = exports.$2Ab = exports.$1Ab = exports.$ZAb = void 0;
    const CONFIGURATION_SYNC_STORE_KEY = 'configurationSync.store';
    const SYNC_PREVIOUS_STORE = 'sync.previous.store';
    const DONOT_MAKE_REQUESTS_UNTIL_KEY = 'sync.donot-make-requests-until';
    const USER_SESSION_ID_KEY = 'sync.user-session-id';
    const MACHINE_SESSION_ID_KEY = 'sync.machine-session-id';
    const REQUEST_SESSION_LIMIT = 100;
    const REQUEST_SESSION_INTERVAL = 1000 * 60 * 5; /* 5 minutes */
    let $ZAb = class $ZAb extends lifecycle_1.$kc {
        get userDataSyncStore() { return this.b; }
        get c() {
            return this.h.get(userDataSync_1.$Ngb, -1 /* StorageScope.APPLICATION */);
        }
        set c(type) {
            this.h.store(userDataSync_1.$Ngb, type, -1 /* StorageScope.APPLICATION */, platform_1.$o ? 0 /* StorageTarget.USER */ : 1 /* StorageTarget.MACHINE */);
        }
        constructor(f, g, h) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeUserDataSyncStore = this.a.event;
            this.j();
            const disposable = this.B(new lifecycle_1.$jc());
            this.B(event_1.Event.filter(h.onDidChangeValue(-1 /* StorageScope.APPLICATION */, userDataSync_1.$Ngb, disposable), () => this.c !== this.userDataSyncStore?.type, disposable)(() => this.j()));
        }
        j() {
            this.b = this.m(this.f[CONFIGURATION_SYNC_STORE_KEY]);
            this.a.fire();
        }
        m(configurationSyncStore) {
            if (!configurationSyncStore) {
                return undefined;
            }
            // Check for web overrides for backward compatibility while reading previous store
            configurationSyncStore = platform_1.$o && configurationSyncStore.web ? { ...configurationSyncStore, ...configurationSyncStore.web } : configurationSyncStore;
            if ((0, types_1.$jf)(configurationSyncStore.url)
                && (0, types_1.$lf)(configurationSyncStore.authenticationProviders)
                && Object.keys(configurationSyncStore.authenticationProviders).every(authenticationProviderId => Array.isArray(configurationSyncStore.authenticationProviders[authenticationProviderId].scopes))) {
                const syncStore = configurationSyncStore;
                const canSwitch = !!syncStore.canSwitch;
                const defaultType = syncStore.url === syncStore.insidersUrl ? 'insiders' : 'stable';
                const type = (canSwitch ? this.c : undefined) || defaultType;
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
    exports.$ZAb = $ZAb;
    exports.$ZAb = $ZAb = __decorate([
        __param(0, productService_1.$kj),
        __param(1, configuration_1.$8h),
        __param(2, storage_1.$Vo)
    ], $ZAb);
    let $1Ab = class $1Ab extends $ZAb {
        constructor(productService, configurationService, storageService) {
            super(productService, configurationService, storageService);
            const previousConfigurationSyncStore = this.h.get(SYNC_PREVIOUS_STORE, -1 /* StorageScope.APPLICATION */);
            if (previousConfigurationSyncStore) {
                this.n = JSON.parse(previousConfigurationSyncStore);
            }
            const syncStore = this.f[CONFIGURATION_SYNC_STORE_KEY];
            if (syncStore) {
                this.h.store(SYNC_PREVIOUS_STORE, JSON.stringify(syncStore), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.h.remove(SYNC_PREVIOUS_STORE, -1 /* StorageScope.APPLICATION */);
            }
        }
        async switch(type) {
            if (type !== this.c) {
                this.c = type;
                this.j();
            }
        }
        async getPreviousUserDataSyncStore() {
            return this.m(this.n);
        }
    };
    exports.$1Ab = $1Ab;
    exports.$1Ab = $1Ab = __decorate([
        __param(0, productService_1.$kj),
        __param(1, configuration_1.$8h),
        __param(2, storage_1.$Vo)
    ], $1Ab);
    let $2Ab = class $2Ab extends lifecycle_1.$kc {
        get donotMakeRequestsUntil() { return this.j; }
        constructor(userDataSyncStoreUrl, productService, n, r, environmentService, fileService, s) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.g = this.B(new event_1.$fd());
            this.onTokenFailed = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onTokenSucceed = this.h.event;
            this.j = undefined;
            this.m = this.B(new event_1.$fd());
            this.onDidChangeDonotMakeRequestsUntil = this.m.event;
            this.w = undefined;
            this.t(userDataSyncStoreUrl);
            this.c = (0, serviceMachineId_1.$2o)(environmentService, fileService, s)
                .then(uuid => {
                const headers = {
                    'X-Client-Name': `${productService.applicationName}${platform_1.$o ? '-web' : ''}`,
                    'X-Client-Version': productService.version,
                };
                if (productService.commit) {
                    headers['X-Client-Commit'] = productService.commit;
                }
                return headers;
            });
            /* A requests session that limits requests per sessions */
            this.f = new $4Ab(REQUEST_SESSION_LIMIT, REQUEST_SESSION_INTERVAL, this.n, this.r);
            this.u();
            this.B((0, lifecycle_1.$ic)(() => {
                if (this.w) {
                    this.w.cancel();
                    this.w = undefined;
                }
            }));
        }
        setAuthToken(token, type) {
            this.b = { token, type };
        }
        t(userDataSyncStoreUrl) {
            this.a = userDataSyncStoreUrl ? (0, resources_1.$ig)(userDataSyncStoreUrl, 'v1') : undefined;
        }
        u() {
            const donotMakeRequestsUntil = this.s.getNumber(DONOT_MAKE_REQUESTS_UNTIL_KEY, -1 /* StorageScope.APPLICATION */);
            if (donotMakeRequestsUntil && Date.now() < donotMakeRequestsUntil) {
                this.y(new Date(donotMakeRequestsUntil));
            }
        }
        y(donotMakeRequestsUntil) {
            if (this.j?.getTime() !== donotMakeRequestsUntil?.getTime()) {
                this.j = donotMakeRequestsUntil;
                if (this.w) {
                    this.w.cancel();
                    this.w = undefined;
                }
                if (this.j) {
                    this.s.store(DONOT_MAKE_REQUESTS_UNTIL_KEY, this.j.getTime(), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                    this.w = (0, async_1.$ug)(token => (0, async_1.$Hg)(this.j.getTime() - Date.now(), token).then(() => this.y(undefined)));
                    this.w.then(null, e => null /* ignore error */);
                }
                else {
                    this.s.remove(DONOT_MAKE_REQUESTS_UNTIL_KEY, -1 /* StorageScope.APPLICATION */);
                }
                this.m.fire();
            }
        }
        // #region Collection
        async getAllCollections(headers = {}) {
            if (!this.a) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.$ig)(this.a, 'collection').toString();
            headers = { ...headers };
            headers['Content-Type'] = 'application/json';
            const context = await this.D(url, { type: 'GET', headers }, [], cancellation_1.CancellationToken.None);
            return (await (0, request_1.$Oo)(context))?.map(({ id }) => id) || [];
        }
        async createCollection(headers = {}) {
            if (!this.a) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.$ig)(this.a, 'collection').toString();
            headers = { ...headers };
            headers['Content-Type'] = mime_1.$Hr.text;
            const context = await this.D(url, { type: 'POST', headers }, [], cancellation_1.CancellationToken.None);
            const collectionId = await (0, request_1.$No)(context);
            if (!collectionId) {
                throw new userDataSync_1.$Lgb('Server did not return the collection id', url, "NoCollection" /* UserDataSyncErrorCode.NoCollection */, context.res.statusCode, context.res.headers[userDataSync_1.$Hgb]);
            }
            return collectionId;
        }
        async deleteCollection(collection, headers = {}) {
            if (!this.a) {
                throw new Error('No settings sync store url configured.');
            }
            const url = collection ? (0, resources_1.$ig)(this.a, 'collection', collection).toString() : (0, resources_1.$ig)(this.a, 'collection').toString();
            headers = { ...headers };
            await this.D(url, { type: 'DELETE', headers }, [], cancellation_1.CancellationToken.None);
        }
        // #endregion
        // #region Resource
        async getAllResourceRefs(resource, collection) {
            if (!this.a) {
                throw new Error('No settings sync store url configured.');
            }
            const uri = this.z(this.a, collection, resource);
            const headers = {};
            const context = await this.D(uri.toString(), { type: 'GET', headers }, [], cancellation_1.CancellationToken.None);
            const result = await (0, request_1.$Oo)(context) || [];
            return result.map(({ url, created }) => ({ ref: (0, resources_1.$kg)(uri, uri.with({ path: url })), created: created * 1000 /* Server returns in seconds */ }));
        }
        async resolveResourceContent(resource, ref, collection, headers = {}) {
            if (!this.a) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.$ig)(this.z(this.a, collection, resource), ref).toString();
            headers = { ...headers };
            headers['Cache-Control'] = 'no-cache';
            const context = await this.D(url, { type: 'GET', headers }, [], cancellation_1.CancellationToken.None);
            const content = await (0, request_1.$No)(context);
            return content;
        }
        async deleteResource(resource, ref, collection) {
            if (!this.a) {
                throw new Error('No settings sync store url configured.');
            }
            const url = ref !== null ? (0, resources_1.$ig)(this.z(this.a, collection, resource), ref).toString() : this.z(this.a, collection, resource).toString();
            const headers = {};
            await this.D(url, { type: 'DELETE', headers }, [], cancellation_1.CancellationToken.None);
        }
        async deleteResources() {
            if (!this.a) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.$ig)(this.a, 'resource').toString();
            const headers = { 'Content-Type': mime_1.$Hr.text };
            await this.D(url, { type: 'DELETE', headers }, [], cancellation_1.CancellationToken.None);
        }
        async readResource(resource, oldValue, collection, headers = {}) {
            if (!this.a) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.$ig)(this.z(this.a, collection, resource), 'latest').toString();
            headers = { ...headers };
            // Disable caching as they are cached by synchronisers
            headers['Cache-Control'] = 'no-cache';
            if (oldValue) {
                headers['If-None-Match'] = oldValue.ref;
            }
            const context = await this.D(url, { type: 'GET', headers }, [304], cancellation_1.CancellationToken.None);
            let userData = null;
            if (context.res.statusCode === 304) {
                userData = oldValue;
            }
            if (userData === null) {
                const ref = context.res.headers['etag'];
                if (!ref) {
                    throw new userDataSync_1.$Lgb('Server did not return the ref', url, "NoRef" /* UserDataSyncErrorCode.NoRef */, context.res.statusCode, context.res.headers[userDataSync_1.$Hgb]);
                }
                const content = await (0, request_1.$No)(context);
                if (!content && context.res.statusCode === 304) {
                    throw new userDataSync_1.$Lgb('Empty response', url, "EmptyResponse" /* UserDataSyncErrorCode.EmptyResponse */, context.res.statusCode, context.res.headers[userDataSync_1.$Hgb]);
                }
                userData = { ref, content };
            }
            return userData;
        }
        async writeResource(resource, data, ref, collection, headers = {}) {
            if (!this.a) {
                throw new Error('No settings sync store url configured.');
            }
            const url = this.z(this.a, collection, resource).toString();
            headers = { ...headers };
            headers['Content-Type'] = mime_1.$Hr.text;
            if (ref) {
                headers['If-Match'] = ref;
            }
            const context = await this.D(url, { type: 'POST', data, headers }, [], cancellation_1.CancellationToken.None);
            const newRef = context.res.headers['etag'];
            if (!newRef) {
                throw new userDataSync_1.$Lgb('Server did not return the ref', url, "NoRef" /* UserDataSyncErrorCode.NoRef */, context.res.statusCode, context.res.headers[userDataSync_1.$Hgb]);
            }
            return newRef;
        }
        // #endregion
        async manifest(oldValue, headers = {}) {
            if (!this.a) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.$ig)(this.a, 'manifest').toString();
            headers = { ...headers };
            headers['Content-Type'] = 'application/json';
            if (oldValue) {
                headers['If-None-Match'] = oldValue.ref;
            }
            const context = await this.D(url, { type: 'GET', headers }, [304], cancellation_1.CancellationToken.None);
            let manifest = null;
            if (context.res.statusCode === 304) {
                manifest = oldValue;
            }
            if (!manifest) {
                const ref = context.res.headers['etag'];
                if (!ref) {
                    throw new userDataSync_1.$Lgb('Server did not return the ref', url, "NoRef" /* UserDataSyncErrorCode.NoRef */, context.res.statusCode, context.res.headers[userDataSync_1.$Hgb]);
                }
                const content = await (0, request_1.$No)(context);
                if (!content && context.res.statusCode === 304) {
                    throw new userDataSync_1.$Lgb('Empty response', url, "EmptyResponse" /* UserDataSyncErrorCode.EmptyResponse */, context.res.statusCode, context.res.headers[userDataSync_1.$Hgb]);
                }
                if (content) {
                    manifest = { ...JSON.parse(content), ref };
                }
            }
            const currentSessionId = this.s.get(USER_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
            if (currentSessionId && manifest && currentSessionId !== manifest.session) {
                // Server session is different from client session so clear cached session.
                this.C();
            }
            if (manifest === null && currentSessionId) {
                // server session is cleared so clear cached session.
                this.C();
            }
            if (manifest) {
                // update session
                this.s.store(USER_SESSION_ID_KEY, manifest.session, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            return manifest;
        }
        async clear() {
            if (!this.a) {
                throw new Error('No settings sync store url configured.');
            }
            await this.deleteCollection();
            await this.deleteResources();
            // clear cached session.
            this.C();
        }
        async getActivityData() {
            if (!this.a) {
                throw new Error('No settings sync store url configured.');
            }
            const url = (0, resources_1.$ig)(this.a, 'download').toString();
            const headers = {};
            const context = await this.D(url, { type: 'GET', headers }, [], cancellation_1.CancellationToken.None);
            if (!(0, request_1.$Ko)(context)) {
                throw new userDataSync_1.$Lgb('Server returned ' + context.res.statusCode, url, "EmptyResponse" /* UserDataSyncErrorCode.EmptyResponse */, context.res.statusCode, context.res.headers[userDataSync_1.$Hgb]);
            }
            if ((0, request_1.$Lo)(context)) {
                throw new userDataSync_1.$Lgb('Empty response', url, "EmptyResponse" /* UserDataSyncErrorCode.EmptyResponse */, context.res.statusCode, context.res.headers[userDataSync_1.$Hgb]);
            }
            return context.stream;
        }
        z(userDataSyncStoreUrl, collection, resource) {
            return collection ? (0, resources_1.$ig)(userDataSyncStoreUrl, 'collection', collection, 'resource', resource) : (0, resources_1.$ig)(userDataSyncStoreUrl, 'resource', resource);
        }
        C() {
            this.s.remove(USER_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
            this.s.remove(MACHINE_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
        }
        async D(url, options, successCodes, token) {
            if (!this.b) {
                throw new userDataSync_1.$Lgb('No Auth Token Available', url, "Unauthorized" /* UserDataSyncErrorCode.Unauthorized */, undefined, undefined);
            }
            if (this.j && Date.now() < this.j.getTime()) {
                throw new userDataSync_1.$Lgb(`${options.type} request '${url}' failed because of too many requests (429).`, url, "TooManyRequestsAndRetryAfter" /* UserDataSyncErrorCode.TooManyRequestsAndRetryAfter */, undefined, undefined);
            }
            this.y(undefined);
            const commonHeaders = await this.c;
            options.headers = {
                ...(options.headers || {}),
                ...commonHeaders,
                'X-Account-Type': this.b.type,
                'authorization': `Bearer ${this.b.token}`,
            };
            // Add session headers
            this.F(options.headers);
            this.r.trace('Sending request to server', { url, type: options.type, headers: { ...options.headers, ...{ authorization: undefined } } });
            let context;
            try {
                context = await this.f.request(url, options, token);
            }
            catch (e) {
                if (!(e instanceof userDataSync_1.$Lgb)) {
                    let code = "RequestFailed" /* UserDataSyncErrorCode.RequestFailed */;
                    const errorMessage = (0, errors_1.$8)(e).toLowerCase();
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
                    else if ((0, errors_1.$2)(e)) {
                        code = "RequestCanceled" /* UserDataSyncErrorCode.RequestCanceled */;
                    }
                    e = new userDataSync_1.$Lgb(`Connection refused for the request '${url}'.`, url, code, undefined, undefined);
                }
                this.r.info('Request failed', url);
                throw e;
            }
            const operationId = context.res.headers[userDataSync_1.$Hgb];
            const requestInfo = { url, status: context.res.statusCode, 'execution-id': options.headers[userDataSync_1.$Igb], 'operation-id': operationId };
            const isSuccess = (0, request_1.$Ko)(context) || (context.res.statusCode && successCodes.includes(context.res.statusCode));
            let failureMessage = '';
            if (isSuccess) {
                this.r.trace('Request succeeded', requestInfo);
            }
            else {
                failureMessage = await (0, request_1.$Mo)(context) || '';
                this.r.info('Request failed', requestInfo, failureMessage);
            }
            if (context.res.statusCode === 401 || context.res.statusCode === 403) {
                this.b = undefined;
                if (context.res.statusCode === 401) {
                    this.g.fire("Unauthorized" /* UserDataSyncErrorCode.Unauthorized */);
                    throw new userDataSync_1.$Lgb(`${options.type} request '${url}' failed because of Unauthorized (401).`, url, "Unauthorized" /* UserDataSyncErrorCode.Unauthorized */, context.res.statusCode, operationId);
                }
                if (context.res.statusCode === 403) {
                    this.g.fire("Forbidden" /* UserDataSyncErrorCode.Forbidden */);
                    throw new userDataSync_1.$Lgb(`${options.type} request '${url}' failed because the access is forbidden (403).`, url, "Forbidden" /* UserDataSyncErrorCode.Forbidden */, context.res.statusCode, operationId);
                }
            }
            this.h.fire();
            if (context.res.statusCode === 404) {
                throw new userDataSync_1.$Lgb(`${options.type} request '${url}' failed because the requested resource is not found (404).`, url, "NotFound" /* UserDataSyncErrorCode.NotFound */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 405) {
                throw new userDataSync_1.$Lgb(`${options.type} request '${url}' failed because the requested endpoint is not found (405). ${failureMessage}`, url, "MethodNotFound" /* UserDataSyncErrorCode.MethodNotFound */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 409) {
                throw new userDataSync_1.$Lgb(`${options.type} request '${url}' failed because of Conflict (409). There is new data for this resource. Make the request again with latest data.`, url, "Conflict" /* UserDataSyncErrorCode.Conflict */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 410) {
                throw new userDataSync_1.$Lgb(`${options.type} request '${url}' failed because the requested resource is not longer available (410).`, url, "Gone" /* UserDataSyncErrorCode.Gone */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 412) {
                throw new userDataSync_1.$Lgb(`${options.type} request '${url}' failed because of Precondition Failed (412). There is new data for this resource. Make the request again with latest data.`, url, "PreconditionFailed" /* UserDataSyncErrorCode.PreconditionFailed */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 413) {
                throw new userDataSync_1.$Lgb(`${options.type} request '${url}' failed because of too large payload (413).`, url, "TooLarge" /* UserDataSyncErrorCode.TooLarge */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 426) {
                throw new userDataSync_1.$Lgb(`${options.type} request '${url}' failed with status Upgrade Required (426). Please upgrade the client and try again.`, url, "UpgradeRequired" /* UserDataSyncErrorCode.UpgradeRequired */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 429) {
                const retryAfter = context.res.headers['retry-after'];
                if (retryAfter) {
                    this.y(new Date(Date.now() + (parseInt(retryAfter) * 1000)));
                    throw new userDataSync_1.$Lgb(`${options.type} request '${url}' failed because of too many requests (429).`, url, "TooManyRequestsAndRetryAfter" /* UserDataSyncErrorCode.TooManyRequestsAndRetryAfter */, context.res.statusCode, operationId);
                }
                else {
                    throw new userDataSync_1.$Lgb(`${options.type} request '${url}' failed because of too many requests (429).`, url, "RemoteTooManyRequests" /* UserDataSyncErrorCode.TooManyRequests */, context.res.statusCode, operationId);
                }
            }
            if (!isSuccess) {
                throw new userDataSync_1.$Lgb('Server returned ' + context.res.statusCode, url, "Unknown" /* UserDataSyncErrorCode.Unknown */, context.res.statusCode, operationId);
            }
            return context;
        }
        F(headers) {
            let machineSessionId = this.s.get(MACHINE_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
            if (machineSessionId === undefined) {
                machineSessionId = (0, uuid_1.$4f)();
                this.s.store(MACHINE_SESSION_ID_KEY, machineSessionId, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            headers['X-Machine-Session-Id'] = machineSessionId;
            const userSessionId = this.s.get(USER_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
            if (userSessionId !== undefined) {
                headers['X-User-Session-Id'] = userSessionId;
            }
        }
    };
    exports.$2Ab = $2Ab;
    exports.$2Ab = $2Ab = __decorate([
        __param(1, productService_1.$kj),
        __param(2, request_1.$Io),
        __param(3, userDataSync_1.$Ugb),
        __param(4, environment_1.$Ih),
        __param(5, files_1.$6j),
        __param(6, storage_1.$Vo)
    ], $2Ab);
    let $3Ab = class $3Ab extends $2Ab {
        constructor(userDataSyncStoreManagementService, productService, requestService, logService, environmentService, fileService, storageService) {
            super(userDataSyncStoreManagementService.userDataSyncStore?.url, productService, requestService, logService, environmentService, fileService, storageService);
            this.B(userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(() => this.t(userDataSyncStoreManagementService.userDataSyncStore?.url)));
        }
    };
    exports.$3Ab = $3Ab;
    exports.$3Ab = $3Ab = __decorate([
        __param(0, userDataSync_1.$Egb),
        __param(1, productService_1.$kj),
        __param(2, request_1.$Io),
        __param(3, userDataSync_1.$Ugb),
        __param(4, environment_1.$Ih),
        __param(5, files_1.$6j),
        __param(6, storage_1.$Vo)
    ], $3Ab);
    class $4Ab {
        constructor(c, d, /* in ms */ f, g) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.a = [];
            this.b = undefined;
        }
        request(url, options, token) {
            if (this.h()) {
                this.i();
            }
            options.url = url;
            if (this.a.length >= this.c) {
                this.g.info('Too many requests', ...this.a);
                throw new userDataSync_1.$Lgb(`Too many requests. Only ${this.c} requests allowed in ${this.d / (1000 * 60)} minutes.`, url, "LocalTooManyRequests" /* UserDataSyncErrorCode.LocalTooManyRequests */, undefined, undefined);
            }
            this.b = this.b || new Date();
            this.a.push(url);
            return this.f.request(options, token);
        }
        h() {
            return this.b !== undefined && new Date().getTime() - this.b.getTime() > this.d;
        }
        i() {
            this.a = [];
            this.b = undefined;
        }
    }
    exports.$4Ab = $4Ab;
});
//# sourceMappingURL=userDataSyncStoreService.js.map