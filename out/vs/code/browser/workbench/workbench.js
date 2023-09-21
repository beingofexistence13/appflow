/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uri", "vs/platform/product/common/product", "vs/platform/window/common/window", "vs/workbench/workbench.web.main"], function (require, exports, browser_1, buffer_1, event_1, lifecycle_1, marshalling_1, network_1, path_1, resources_1, strings_1, uri_1, product_1, window_1, workbench_web_main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalStorageSecretStorageProvider = void 0;
    class TransparentCrypto {
        async seal(data) {
            return data;
        }
        async unseal(data) {
            return data;
        }
    }
    var AESConstants;
    (function (AESConstants) {
        AESConstants["ALGORITHM"] = "AES-GCM";
        AESConstants[AESConstants["KEY_LENGTH"] = 256] = "KEY_LENGTH";
        AESConstants[AESConstants["IV_LENGTH"] = 12] = "IV_LENGTH";
    })(AESConstants || (AESConstants = {}));
    class ServerKeyedAESCrypto {
        /** Gets whether the algorithm is supported; requires a secure context */
        static supported() {
            return !!crypto.subtle;
        }
        constructor(authEndpoint) {
            this.authEndpoint = authEndpoint;
        }
        async seal(data) {
            // Get a new key and IV on every change, to avoid the risk of reusing the same key and IV pair with AES-GCM
            // (see also: https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams#properties)
            const iv = window.crypto.getRandomValues(new Uint8Array(12 /* AESConstants.IV_LENGTH */));
            // crypto.getRandomValues isn't a good-enough PRNG to generate crypto keys, so we need to use crypto.subtle.generateKey and export the key instead
            const clientKeyObj = await window.crypto.subtle.generateKey({ name: "AES-GCM" /* AESConstants.ALGORITHM */, length: 256 /* AESConstants.KEY_LENGTH */ }, true, ['encrypt', 'decrypt']);
            const clientKey = new Uint8Array(await window.crypto.subtle.exportKey('raw', clientKeyObj));
            const key = await this.getKey(clientKey);
            const dataUint8Array = new TextEncoder().encode(data);
            const cipherText = await window.crypto.subtle.encrypt({ name: "AES-GCM" /* AESConstants.ALGORITHM */, iv }, key, dataUint8Array);
            // Base64 encode the result and store the ciphertext, the key, and the IV in localStorage
            // Note that the clientKey and IV don't need to be secret
            const result = new Uint8Array([...clientKey, ...iv, ...new Uint8Array(cipherText)]);
            return (0, buffer_1.encodeBase64)(buffer_1.VSBuffer.wrap(result));
        }
        async unseal(data) {
            // encrypted should contain, in order: the key (32-byte), the IV for AES-GCM (12-byte) and the ciphertext (which has the GCM auth tag at the end)
            // Minimum length must be 44 (key+IV length) + 16 bytes (1 block encrypted with AES - regardless of key size)
            const dataUint8Array = (0, buffer_1.decodeBase64)(data);
            if (dataUint8Array.byteLength < 60) {
                throw Error('Invalid length for the value for credentials.crypto');
            }
            const keyLength = 256 /* AESConstants.KEY_LENGTH */ / 8;
            const clientKey = dataUint8Array.slice(0, keyLength);
            const iv = dataUint8Array.slice(keyLength, keyLength + 12 /* AESConstants.IV_LENGTH */);
            const cipherText = dataUint8Array.slice(keyLength + 12 /* AESConstants.IV_LENGTH */);
            // Do the decryption and parse the result as JSON
            const key = await this.getKey(clientKey.buffer);
            const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM" /* AESConstants.ALGORITHM */, iv: iv.buffer }, key, cipherText.buffer);
            return new TextDecoder().decode(new Uint8Array(decrypted));
        }
        /**
         * Given a clientKey, returns the CryptoKey object that is used to encrypt/decrypt the data.
         * The actual key is (clientKey XOR serverKey)
         */
        async getKey(clientKey) {
            if (!clientKey || clientKey.byteLength !== 256 /* AESConstants.KEY_LENGTH */ / 8) {
                throw Error('Invalid length for clientKey');
            }
            const serverKey = await this.getServerKeyPart();
            const keyData = new Uint8Array(256 /* AESConstants.KEY_LENGTH */ / 8);
            for (let i = 0; i < keyData.byteLength; i++) {
                keyData[i] = clientKey[i] ^ serverKey[i];
            }
            return window.crypto.subtle.importKey('raw', keyData, {
                name: "AES-GCM" /* AESConstants.ALGORITHM */,
                length: 256 /* AESConstants.KEY_LENGTH */,
            }, true, ['encrypt', 'decrypt']);
        }
        async getServerKeyPart() {
            if (this._serverKey) {
                return this._serverKey;
            }
            let attempt = 0;
            let lastError;
            while (attempt <= 3) {
                try {
                    const res = await fetch(this.authEndpoint, { credentials: 'include', method: 'POST' });
                    if (!res.ok) {
                        throw new Error(res.statusText);
                    }
                    const serverKey = new Uint8Array(await await res.arrayBuffer());
                    if (serverKey.byteLength !== 256 /* AESConstants.KEY_LENGTH */ / 8) {
                        throw Error(`The key retrieved by the server is not ${256 /* AESConstants.KEY_LENGTH */} bit long.`);
                    }
                    this._serverKey = serverKey;
                    return this._serverKey;
                }
                catch (e) {
                    lastError = e;
                    attempt++;
                    // exponential backoff
                    await new Promise(resolve => setTimeout(resolve, attempt * attempt * 100));
                }
            }
            throw lastError;
        }
    }
    class LocalStorageSecretStorageProvider {
        constructor(crypto) {
            this.crypto = crypto;
            this._storageKey = 'secrets.provider';
            this._secretsPromise = this.load();
            this.type = 'persisted';
        }
        async load() {
            const record = this.loadAuthSessionFromElement();
            // Get the secrets from localStorage
            const encrypted = window.localStorage.getItem(this._storageKey);
            if (encrypted) {
                try {
                    const decrypted = JSON.parse(await this.crypto.unseal(encrypted));
                    return { ...record, ...decrypted };
                }
                catch (err) {
                    // TODO: send telemetry
                    console.error('Failed to decrypt secrets from localStorage', err);
                    window.localStorage.removeItem(this._storageKey);
                }
            }
            return record;
        }
        loadAuthSessionFromElement() {
            let authSessionInfo;
            const authSessionElement = document.getElementById('vscode-workbench-auth-session');
            const authSessionElementAttribute = authSessionElement ? authSessionElement.getAttribute('data-settings') : undefined;
            if (authSessionElementAttribute) {
                try {
                    authSessionInfo = JSON.parse(authSessionElementAttribute);
                }
                catch (error) { /* Invalid session is passed. Ignore. */ }
            }
            if (!authSessionInfo) {
                return {};
            }
            const record = {};
            // Settings Sync Entry
            record[`${product_1.default.urlProtocol}.loginAccount`] = JSON.stringify(authSessionInfo);
            // Auth extension Entry
            if (authSessionInfo.providerId !== 'github') {
                console.error(`Unexpected auth provider: ${authSessionInfo.providerId}. Expected 'github'.`);
                return record;
            }
            const authAccount = JSON.stringify({ extensionId: 'vscode.github-authentication', key: 'github.auth' });
            record[authAccount] = JSON.stringify(authSessionInfo.scopes.map(scopes => ({
                id: authSessionInfo.id,
                scopes,
                accessToken: authSessionInfo.accessToken
            })));
            return record;
        }
        async get(key) {
            const secrets = await this._secretsPromise;
            return secrets[key];
        }
        async set(key, value) {
            const secrets = await this._secretsPromise;
            secrets[key] = value;
            this._secretsPromise = Promise.resolve(secrets);
            this.save();
        }
        async delete(key) {
            const secrets = await this._secretsPromise;
            delete secrets[key];
            this._secretsPromise = Promise.resolve(secrets);
            this.save();
        }
        async save() {
            try {
                const encrypted = await this.crypto.seal(JSON.stringify(await this._secretsPromise));
                window.localStorage.setItem(this._storageKey, encrypted);
            }
            catch (err) {
                console.error(err);
            }
        }
    }
    exports.LocalStorageSecretStorageProvider = LocalStorageSecretStorageProvider;
    class LocalStorageURLCallbackProvider extends lifecycle_1.Disposable {
        static { this.REQUEST_ID = 0; }
        static { this.QUERY_KEYS = [
            'scheme',
            'authority',
            'path',
            'query',
            'fragment'
        ]; }
        constructor(_callbackRoute) {
            super();
            this._callbackRoute = _callbackRoute;
            this._onCallback = this._register(new event_1.Emitter());
            this.onCallback = this._onCallback.event;
            this.pendingCallbacks = new Set();
            this.lastTimeChecked = Date.now();
            this.checkCallbacksTimeout = undefined;
        }
        create(options = {}) {
            const id = ++LocalStorageURLCallbackProvider.REQUEST_ID;
            const queryParams = [`vscode-reqid=${id}`];
            for (const key of LocalStorageURLCallbackProvider.QUERY_KEYS) {
                const value = options[key];
                if (value) {
                    queryParams.push(`vscode-${key}=${encodeURIComponent(value)}`);
                }
            }
            // TODO@joao remove eventually
            // https://github.com/microsoft/vscode-dev/issues/62
            // https://github.com/microsoft/vscode/blob/159479eb5ae451a66b5dac3c12d564f32f454796/extensions/github-authentication/src/githubServer.ts#L50-L50
            if (!(options.authority === 'vscode.github-authentication' && options.path === '/dummy')) {
                const key = `vscode-web.url-callbacks[${id}]`;
                window.localStorage.removeItem(key);
                this.pendingCallbacks.add(id);
                this.startListening();
            }
            return uri_1.URI.parse(window.location.href).with({ path: this._callbackRoute, query: queryParams.join('&') });
        }
        startListening() {
            if (this.onDidChangeLocalStorageDisposable) {
                return;
            }
            const fn = () => this.onDidChangeLocalStorage();
            window.addEventListener('storage', fn);
            this.onDidChangeLocalStorageDisposable = { dispose: () => window.removeEventListener('storage', fn) };
        }
        stopListening() {
            this.onDidChangeLocalStorageDisposable?.dispose();
            this.onDidChangeLocalStorageDisposable = undefined;
        }
        // this fires every time local storage changes, but we
        // don't want to check more often than once a second
        async onDidChangeLocalStorage() {
            const ellapsed = Date.now() - this.lastTimeChecked;
            if (ellapsed > 1000) {
                this.checkCallbacks();
            }
            else if (this.checkCallbacksTimeout === undefined) {
                this.checkCallbacksTimeout = setTimeout(() => {
                    this.checkCallbacksTimeout = undefined;
                    this.checkCallbacks();
                }, 1000 - ellapsed);
            }
        }
        checkCallbacks() {
            let pendingCallbacks;
            for (const id of this.pendingCallbacks) {
                const key = `vscode-web.url-callbacks[${id}]`;
                const result = window.localStorage.getItem(key);
                if (result !== null) {
                    try {
                        this._onCallback.fire(uri_1.URI.revive(JSON.parse(result)));
                    }
                    catch (error) {
                        console.error(error);
                    }
                    pendingCallbacks = pendingCallbacks ?? new Set(this.pendingCallbacks);
                    pendingCallbacks.delete(id);
                    window.localStorage.removeItem(key);
                }
            }
            if (pendingCallbacks) {
                this.pendingCallbacks = pendingCallbacks;
                if (this.pendingCallbacks.size === 0) {
                    this.stopListening();
                }
            }
            this.lastTimeChecked = Date.now();
        }
    }
    class WorkspaceProvider {
        static { this.QUERY_PARAM_EMPTY_WINDOW = 'ew'; }
        static { this.QUERY_PARAM_FOLDER = 'folder'; }
        static { this.QUERY_PARAM_WORKSPACE = 'workspace'; }
        static { this.QUERY_PARAM_PAYLOAD = 'payload'; }
        static create(config) {
            let foundWorkspace = false;
            let workspace;
            let payload = Object.create(null);
            const query = new URL(document.location.href).searchParams;
            query.forEach((value, key) => {
                switch (key) {
                    // Folder
                    case WorkspaceProvider.QUERY_PARAM_FOLDER:
                        if (config.remoteAuthority && value.startsWith(path_1.posix.sep)) {
                            // when connected to a remote and having a value
                            // that is a path (begins with a `/`), assume this
                            // is a vscode-remote resource as simplified URL.
                            workspace = { folderUri: uri_1.URI.from({ scheme: network_1.Schemas.vscodeRemote, path: value, authority: config.remoteAuthority }) };
                        }
                        else {
                            workspace = { folderUri: uri_1.URI.parse(value) };
                        }
                        foundWorkspace = true;
                        break;
                    // Workspace
                    case WorkspaceProvider.QUERY_PARAM_WORKSPACE:
                        if (config.remoteAuthority && value.startsWith(path_1.posix.sep)) {
                            // when connected to a remote and having a value
                            // that is a path (begins with a `/`), assume this
                            // is a vscode-remote resource as simplified URL.
                            workspace = { workspaceUri: uri_1.URI.from({ scheme: network_1.Schemas.vscodeRemote, path: value, authority: config.remoteAuthority }) };
                        }
                        else {
                            workspace = { workspaceUri: uri_1.URI.parse(value) };
                        }
                        foundWorkspace = true;
                        break;
                    // Empty
                    case WorkspaceProvider.QUERY_PARAM_EMPTY_WINDOW:
                        workspace = undefined;
                        foundWorkspace = true;
                        break;
                    // Payload
                    case WorkspaceProvider.QUERY_PARAM_PAYLOAD:
                        try {
                            payload = (0, marshalling_1.parse)(value); // use marshalling#parse() to revive potential URIs
                        }
                        catch (error) {
                            console.error(error); // possible invalid JSON
                        }
                        break;
                }
            });
            // If no workspace is provided through the URL, check for config
            // attribute from server
            if (!foundWorkspace) {
                if (config.folderUri) {
                    workspace = { folderUri: uri_1.URI.revive(config.folderUri) };
                }
                else if (config.workspaceUri) {
                    workspace = { workspaceUri: uri_1.URI.revive(config.workspaceUri) };
                }
            }
            return new WorkspaceProvider(workspace, payload, config);
        }
        constructor(workspace, payload, config) {
            this.workspace = workspace;
            this.payload = payload;
            this.config = config;
            this.trusted = true;
        }
        async open(workspace, options) {
            if (options?.reuse && !options.payload && this.isSame(this.workspace, workspace)) {
                return true; // return early if workspace and environment is not changing and we are reusing window
            }
            const targetHref = this.createTargetUrl(workspace, options);
            if (targetHref) {
                if (options?.reuse) {
                    window.location.href = targetHref;
                    return true;
                }
                else {
                    let result;
                    if ((0, browser_1.isStandalone)()) {
                        result = window.open(targetHref, '_blank', 'toolbar=no'); // ensures to open another 'standalone' window!
                    }
                    else {
                        result = window.open(targetHref);
                    }
                    return !!result;
                }
            }
            return false;
        }
        createTargetUrl(workspace, options) {
            // Empty
            let targetHref = undefined;
            if (!workspace) {
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_EMPTY_WINDOW}=true`;
            }
            // Folder
            else if ((0, window_1.isFolderToOpen)(workspace)) {
                const queryParamFolder = this.encodeWorkspacePath(workspace.folderUri);
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_FOLDER}=${queryParamFolder}`;
            }
            // Workspace
            else if ((0, window_1.isWorkspaceToOpen)(workspace)) {
                const queryParamWorkspace = this.encodeWorkspacePath(workspace.workspaceUri);
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_WORKSPACE}=${queryParamWorkspace}`;
            }
            // Append payload if any
            if (options?.payload) {
                targetHref += `&${WorkspaceProvider.QUERY_PARAM_PAYLOAD}=${encodeURIComponent(JSON.stringify(options.payload))}`;
            }
            return targetHref;
        }
        encodeWorkspacePath(uri) {
            if (this.config.remoteAuthority && uri.scheme === network_1.Schemas.vscodeRemote) {
                // when connected to a remote and having a folder
                // or workspace for that remote, only use the path
                // as query value to form shorter, nicer URLs.
                // however, we still need to `encodeURIComponent`
                // to ensure to preserve special characters, such
                // as `+` in the path.
                return encodeURIComponent(`${path_1.posix.sep}${(0, strings_1.ltrim)(uri.path, path_1.posix.sep)}`).replaceAll('%2F', '/');
            }
            return encodeURIComponent(uri.toString(true));
        }
        isSame(workspaceA, workspaceB) {
            if (!workspaceA || !workspaceB) {
                return workspaceA === workspaceB; // both empty
            }
            if ((0, window_1.isFolderToOpen)(workspaceA) && (0, window_1.isFolderToOpen)(workspaceB)) {
                return (0, resources_1.isEqual)(workspaceA.folderUri, workspaceB.folderUri); // same workspace
            }
            if ((0, window_1.isWorkspaceToOpen)(workspaceA) && (0, window_1.isWorkspaceToOpen)(workspaceB)) {
                return (0, resources_1.isEqual)(workspaceA.workspaceUri, workspaceB.workspaceUri); // same workspace
            }
            return false;
        }
        hasRemote() {
            if (this.workspace) {
                if ((0, window_1.isFolderToOpen)(this.workspace)) {
                    return this.workspace.folderUri.scheme === network_1.Schemas.vscodeRemote;
                }
                if ((0, window_1.isWorkspaceToOpen)(this.workspace)) {
                    return this.workspace.workspaceUri.scheme === network_1.Schemas.vscodeRemote;
                }
            }
            return true;
        }
    }
    function readCookie(name) {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
            if (cookie.startsWith(name + '=')) {
                return cookie.substring(name.length + 1);
            }
        }
        return undefined;
    }
    (function () {
        // Find config by checking for DOM
        const configElement = document.getElementById('vscode-workbench-web-configuration');
        const configElementAttribute = configElement ? configElement.getAttribute('data-settings') : undefined;
        if (!configElement || !configElementAttribute) {
            throw new Error('Missing web configuration element');
        }
        const originalConfig = JSON.parse(configElementAttribute);
        const secretStorageKeyPath = readCookie('vscode-secret-key-path');
        const secretStorageCrypto = secretStorageKeyPath && ServerKeyedAESCrypto.supported()
            ? new ServerKeyedAESCrypto(secretStorageKeyPath) : new TransparentCrypto();
        const config = {
            ...originalConfig,
            remoteAuthority: window.location.host,
        };
        // Create workbench
        (0, workbench_web_main_1.create)(document.body, {
            ...config,
            windowIndicator: config.windowIndicator ?? { label: '$(remote)', tooltip: `${product_1.default.nameShort} Web` },
            settingsSyncOptions: config.settingsSyncOptions ? { enabled: config.settingsSyncOptions.enabled, } : undefined,
            workspaceProvider: WorkspaceProvider.create(config),
            urlCallbackProvider: new LocalStorageURLCallbackProvider(config.callbackRoute),
            secretStorageProvider: config.remoteAuthority && !secretStorageKeyPath
                ? undefined /* with a remote without embedder-preferred storage, store on the remote */
                : new LocalStorageSecretStorageProvider(secretStorageCrypto),
        });
    })();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvY29kZS9icm93c2VyL3dvcmtiZW5jaC93b3JrYmVuY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMEJoRyxNQUFNLGlCQUFpQjtRQUN0QixLQUFLLENBQUMsSUFBSSxDQUFDLElBQVk7WUFDdEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFZO1lBQ3hCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztLQUNEO0lBRUQsSUFBVyxZQUlWO0lBSkQsV0FBVyxZQUFZO1FBQ3RCLHFDQUFxQixDQUFBO1FBQ3JCLDZEQUFnQixDQUFBO1FBQ2hCLDBEQUFjLENBQUE7SUFDZixDQUFDLEVBSlUsWUFBWSxLQUFaLFlBQVksUUFJdEI7SUFFRCxNQUFNLG9CQUFvQjtRQUd6Qix5RUFBeUU7UUFDbEUsTUFBTSxDQUFDLFNBQVM7WUFDdEIsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN4QixDQUFDO1FBRUQsWUFBNkIsWUFBb0I7WUFBcEIsaUJBQVksR0FBWixZQUFZLENBQVE7UUFBSSxDQUFDO1FBRXRELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBWTtZQUN0QiwyR0FBMkc7WUFDM0csdUZBQXVGO1lBQ3ZGLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksVUFBVSxpQ0FBd0IsQ0FBQyxDQUFDO1lBQ2pGLGtKQUFrSjtZQUNsSixNQUFNLFlBQVksR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FDMUQsRUFBRSxJQUFJLEVBQUUsc0NBQStCLEVBQUUsTUFBTSxFQUFFLGlDQUFnQyxFQUFFLEVBQ25GLElBQUksRUFDSixDQUFDLFNBQVMsRUFBRSxTQUFTLENB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