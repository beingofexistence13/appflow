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
define(["require", "exports", "electron", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/platform/encryption/common/encryptionService", "vs/platform/log/common/log", "vs/platform/storage/electron-main/storageMainService", "vs/platform/windows/electron-main/windows"], function (require, exports, electron_1, cancellation_1, event_1, hash_1, lifecycle_1, uuid_1, encryptionService_1, log_1, storageMainService_1, windows_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProxyAuthHandler = void 0;
    var ProxyAuthState;
    (function (ProxyAuthState) {
        /**
         * Initial state: we will try to use stored credentials
         * first to reply to the auth challenge.
         */
        ProxyAuthState[ProxyAuthState["Initial"] = 1] = "Initial";
        /**
         * We used stored credentials and are still challenged,
         * so we will show a login dialog next.
         */
        ProxyAuthState[ProxyAuthState["StoredCredentialsUsed"] = 2] = "StoredCredentialsUsed";
        /**
         * Finally, if we showed a login dialog already, we will
         * not show any more login dialogs until restart to reduce
         * the UI noise.
         */
        ProxyAuthState[ProxyAuthState["LoginDialogShown"] = 3] = "LoginDialogShown";
    })(ProxyAuthState || (ProxyAuthState = {}));
    let ProxyAuthHandler = class ProxyAuthHandler extends lifecycle_1.Disposable {
        constructor(logService, windowsMainService, encryptionMainService, applicationStorageMainService) {
            super();
            this.logService = logService;
            this.windowsMainService = windowsMainService;
            this.encryptionMainService = encryptionMainService;
            this.applicationStorageMainService = applicationStorageMainService;
            this.PROXY_CREDENTIALS_SERVICE_KEY = 'proxy-credentials://';
            this.pendingProxyResolve = undefined;
            this.state = ProxyAuthState.Initial;
            this.sessionCredentials = undefined;
            this.registerListeners();
        }
        registerListeners() {
            const onLogin = event_1.Event.fromNodeEventEmitter(electron_1.app, 'login', (event, webContents, req, authInfo, callback) => ({ event, webContents, req, authInfo, callback }));
            this._register(onLogin(this.onLogin, this));
        }
        async onLogin({ event, authInfo, req, callback }) {
            if (!authInfo.isProxy) {
                return; // only for proxy
            }
            if (!this.pendingProxyResolve && this.state === ProxyAuthState.LoginDialogShown && req.firstAuthAttempt) {
                this.logService.trace('auth#onLogin (proxy) - exit - proxy dialog already shown');
                return; // only one dialog per session at max (except when firstAuthAttempt: false which indicates a login problem)
            }
            // Signal we handle this event on our own, otherwise
            // Electron will ignore our provided credentials.
            event.preventDefault();
            let credentials = undefined;
            if (!this.pendingProxyResolve) {
                this.logService.trace('auth#onLogin (proxy) - no pending proxy handling found, starting new');
                this.pendingProxyResolve = this.resolveProxyCredentials(authInfo);
                try {
                    credentials = await this.pendingProxyResolve;
                }
                finally {
                    this.pendingProxyResolve = undefined;
                }
            }
            else {
                this.logService.trace('auth#onLogin (proxy) - pending proxy handling found');
                credentials = await this.pendingProxyResolve;
            }
            // According to Electron docs, it is fine to call back without
            // username or password to signal that the authentication was handled
            // by us, even though without having credentials received:
            //
            // > If `callback` is called without a username or password, the authentication
            // > request will be cancelled and the authentication error will be returned to the
            // > page.
            callback(credentials?.username, credentials?.password);
        }
        async resolveProxyCredentials(authInfo) {
            this.logService.trace('auth#resolveProxyCredentials (proxy) - enter');
            try {
                const credentials = await this.doResolveProxyCredentials(authInfo);
                if (credentials) {
                    this.logService.trace('auth#resolveProxyCredentials (proxy) - got credentials');
                    return credentials;
                }
                else {
                    this.logService.trace('auth#resolveProxyCredentials (proxy) - did not get credentials');
                }
            }
            finally {
                this.logService.trace('auth#resolveProxyCredentials (proxy) - exit');
            }
            return undefined;
        }
        async doResolveProxyCredentials(authInfo) {
            this.logService.trace('auth#doResolveProxyCredentials - enter', authInfo);
            // Compute a hash over the authentication info to be used
            // with the credentials store to return the right credentials
            // given the properties of the auth request
            // (see https://github.com/microsoft/vscode/issues/109497)
            const authInfoHash = String((0, hash_1.hash)({ scheme: authInfo.scheme, host: authInfo.host, port: authInfo.port }));
            let storedUsername;
            let storedPassword;
            try {
                // Try to find stored credentials for the given auth info
                const encryptedValue = this.applicationStorageMainService.get(this.PROXY_CREDENTIALS_SERVICE_KEY + authInfoHash, -1 /* StorageScope.APPLICATION */);
                if (encryptedValue) {
                    const credentials = JSON.parse(await this.encryptionMainService.decrypt(encryptedValue));
                    storedUsername = credentials.username;
                    storedPassword = credentials.password;
                }
            }
            catch (error) {
                this.logService.error(error); // handle errors by asking user for login via dialog
            }
            // Reply with stored credentials unless we used them already.
            // In that case we need to show a login dialog again because
            // they seem invalid.
            if (this.state !== ProxyAuthState.StoredCredentialsUsed && typeof storedUsername === 'string' && typeof storedPassword === 'string') {
                this.logService.trace('auth#doResolveProxyCredentials (proxy) - exit - found stored credentials to use');
                this.state = ProxyAuthState.StoredCredentialsUsed;
                return { username: storedUsername, password: storedPassword };
            }
            // Find suitable window to show dialog: prefer to show it in the
            // active window because any other network request will wait on
            // the credentials and we want the user to present the dialog.
            const window = this.windowsMainService.getFocusedWindow() || this.windowsMainService.getLastActiveWindow();
            if (!window) {
                this.logService.trace('auth#doResolveProxyCredentials (proxy) - exit - no opened window found to show dialog in');
                return undefined; // unexpected
            }
            this.logService.trace(`auth#doResolveProxyCredentials (proxy) - asking window ${window.id} to handle proxy login`);
            // Open proxy dialog
            const payload = {
                authInfo,
                username: this.sessionCredentials?.username ?? storedUsername,
                password: this.sessionCredentials?.password ?? storedPassword,
                replyChannel: `vscode:proxyAuthResponse:${(0, uuid_1.generateUuid)()}`
            };
            window.sendWhenReady('vscode:openProxyAuthenticationDialog', cancellation_1.CancellationToken.None, payload);
            this.state = ProxyAuthState.LoginDialogShown;
            // Handle reply
            const loginDialogCredentials = await new Promise(resolve => {
                const proxyAuthResponseHandler = async (event, channel, reply /* canceled */) => {
                    if (channel === payload.replyChannel) {
                        this.logService.trace(`auth#doResolveProxyCredentials - exit - received credentials from window ${window.id}`);
                        window.win?.webContents.off('ipc-message', proxyAuthResponseHandler);
                        // We got credentials from the window
                        if (reply) {
                            const credentials = { username: reply.username, password: reply.password };
                            // Update stored credentials based on `remember` flag
                            try {
                                if (reply.remember) {
                                    const encryptedSerializedCredentials = await this.encryptionMainService.encrypt(JSON.stringify(credentials));
                                    this.applicationStorageMainService.store(this.PROXY_CREDENTIALS_SERVICE_KEY + authInfoHash, encryptedSerializedCredentials, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                                }
                                else {
                                    this.applicationStorageMainService.remove(this.PROXY_CREDENTIALS_SERVICE_KEY + authInfoHash, -1 /* StorageScope.APPLICATION */);
                                }
                            }
                            catch (error) {
                                this.logService.error(error); // handle gracefully
                            }
                            resolve({ username: credentials.username, password: credentials.password });
                        }
                        // We did not get any credentials from the window (e.g. cancelled)
                        else {
                            resolve(undefined);
                        }
                    }
                };
                window.win?.webContents.on('ipc-message', proxyAuthResponseHandler);
            });
            // Remember credentials for the session in case
            // the credentials are wrong and we show the dialog
            // again
            this.sessionCredentials = loginDialogCredentials;
            return loginDialogCredentials;
        }
    };
    exports.ProxyAuthHandler = ProxyAuthHandler;
    exports.ProxyAuthHandler = ProxyAuthHandler = __decorate([
        __param(0, log_1.ILogService),
        __param(1, windows_1.IWindowsMainService),
        __param(2, encryptionService_1.IEncryptionMainService),
        __param(3, storageMainService_1.IApplicationStorageMainService)
    ], ProxyAuthHandler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2NvZGUvZWxlY3Ryb24tbWFpbi9hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQStCaEcsSUFBSyxjQW9CSjtJQXBCRCxXQUFLLGNBQWM7UUFFbEI7OztXQUdHO1FBQ0gseURBQVcsQ0FBQTtRQUVYOzs7V0FHRztRQUNILHFGQUFxQixDQUFBO1FBRXJCOzs7O1dBSUc7UUFDSCwyRUFBZ0IsQ0FBQTtJQUNqQixDQUFDLEVBcEJJLGNBQWMsS0FBZCxjQUFjLFFBb0JsQjtJQUVNLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWlCLFNBQVEsc0JBQVU7UUFVL0MsWUFDYyxVQUF3QyxFQUNoQyxrQkFBd0QsRUFDckQscUJBQThELEVBQ3RELDZCQUE4RTtZQUU5RyxLQUFLLEVBQUUsQ0FBQztZQUxzQixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ2YsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUNwQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQ3JDLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBZ0M7WUFaOUYsa0NBQTZCLEdBQUcsc0JBQXNCLENBQUM7WUFFaEUsd0JBQW1CLEdBQWlELFNBQVMsQ0FBQztZQUU5RSxVQUFLLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQztZQUUvQix1QkFBa0IsR0FBNEIsU0FBUyxDQUFDO1lBVS9ELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxpQkFBaUI7WUFDeEIsTUFBTSxPQUFPLEdBQUcsYUFBSyxDQUFDLG9CQUFvQixDQUFhLGNBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQyxLQUFvQixFQUFFLFdBQXdCLEVBQUUsR0FBMEMsRUFBRSxRQUFrQixFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEtB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