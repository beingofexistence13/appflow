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
    exports.$C5b = void 0;
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
    let $C5b = class $C5b extends lifecycle_1.$kc {
        constructor(g, h, j, m) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = 'proxy-credentials://';
            this.b = undefined;
            this.c = ProxyAuthState.Initial;
            this.f = undefined;
            this.n();
        }
        n() {
            const onLogin = event_1.Event.fromNodeEventEmitter(electron_1.app, 'login', (event, webContents, req, authInfo, callback) => ({ event, webContents, req, authInfo, callback }));
            this.B(onLogin(this.r, this));
        }
        async r({ event, authInfo, req, callback }) {
            if (!authInfo.isProxy) {
                return; // only for proxy
            }
            if (!this.b && this.c === ProxyAuthState.LoginDialogShown && req.firstAuthAttempt) {
                this.g.trace('auth#onLogin (proxy) - exit - proxy dialog already shown');
                return; // only one dialog per session at max (except when firstAuthAttempt: false which indicates a login problem)
            }
            // Signal we handle this event on our own, otherwise
            // Electron will ignore our provided credentials.
            event.preventDefault();
            let credentials = undefined;
            if (!this.b) {
                this.g.trace('auth#onLogin (proxy) - no pending proxy handling found, starting new');
                this.b = this.s(authInfo);
                try {
                    credentials = await this.b;
                }
                finally {
                    this.b = undefined;
                }
            }
            else {
                this.g.trace('auth#onLogin (proxy) - pending proxy handling found');
                credentials = await this.b;
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
        async s(authInfo) {
            this.g.trace('auth#resolveProxyCredentials (proxy) - enter');
            try {
                const credentials = await this.t(authInfo);
                if (credentials) {
                    this.g.trace('auth#resolveProxyCredentials (proxy) - got credentials');
                    return credentials;
                }
                else {
                    this.g.trace('auth#resolveProxyCredentials (proxy) - did not get credentials');
                }
            }
            finally {
                this.g.trace('auth#resolveProxyCredentials (proxy) - exit');
            }
            return undefined;
        }
        async t(authInfo) {
            this.g.trace('auth#doResolveProxyCredentials - enter', authInfo);
            // Compute a hash over the authentication info to be used
            // with the credentials store to return the right credentials
            // given the properties of the auth request
            // (see https://github.com/microsoft/vscode/issues/109497)
            const authInfoHash = String((0, hash_1.$pi)({ scheme: authInfo.scheme, host: authInfo.host, port: authInfo.port }));
            let storedUsername;
            let storedPassword;
            try {
                // Try to find stored credentials for the given auth info
                const encryptedValue = this.m.get(this.a + authInfoHash, -1 /* StorageScope.APPLICATION */);
                if (encryptedValue) {
                    const credentials = JSON.parse(await this.j.decrypt(encryptedValue));
                    storedUsername = credentials.username;
                    storedPassword = credentials.password;
                }
            }
            catch (error) {
                this.g.error(error); // handle errors by asking user for login via dialog
            }
            // Reply with stored credentials unless we used them already.
            // In that case we need to show a login dialog again because
            // they seem invalid.
            if (this.c !== ProxyAuthState.StoredCredentialsUsed && typeof storedUsername === 'string' && typeof storedPassword === 'string') {
                this.g.trace('auth#doResolveProxyCredentials (proxy) - exit - found stored credentials to use');
                this.c = ProxyAuthState.StoredCredentialsUsed;
                return { username: storedUsername, password: storedPassword };
            }
            // Find suitable window to show dialog: prefer to show it in the
            // active window because any other network request will wait on
            // the credentials and we want the user to present the dialog.
            const window = this.h.getFocusedWindow() || this.h.getLastActiveWindow();
            if (!window) {
                this.g.trace('auth#doResolveProxyCredentials (proxy) - exit - no opened window found to show dialog in');
                return undefined; // unexpected
            }
            this.g.trace(`auth#doResolveProxyCredentials (proxy) - asking window ${window.id} to handle proxy login`);
            // Open proxy dialog
            const payload = {
                authInfo,
                username: this.f?.username ?? storedUsername,
                password: this.f?.password ?? storedPassword,
                replyChannel: `vscode:proxyAuthResponse:${(0, uuid_1.$4f)()}`
            };
            window.sendWhenReady('vscode:openProxyAuthenticationDialog', cancellation_1.CancellationToken.None, payload);
            this.c = ProxyAuthState.LoginDialogShown;
            // Handle reply
            const loginDialogCredentials = await new Promise(resolve => {
                const proxyAuthResponseHandler = async (event, channel, reply /* canceled */) => {
                    if (channel === payload.replyChannel) {
                        this.g.trace(`auth#doResolveProxyCredentials - exit - received credentials from window ${window.id}`);
                        window.win?.webContents.off('ipc-message', proxyAuthResponseHandler);
                        // We got credentials from the window
                        if (reply) {
                            const credentials = { username: reply.username, password: reply.password };
                            // Update stored credentials based on `remember` flag
                            try {
                                if (reply.remember) {
                                    const encryptedSerializedCredentials = await this.j.encrypt(JSON.stringify(credentials));
                                    this.m.store(this.a + authInfoHash, encryptedSerializedCredentials, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                                }
                                else {
                                    this.m.remove(this.a + authInfoHash, -1 /* StorageScope.APPLICATION */);
                                }
                            }
                            catch (error) {
                                this.g.error(error); // handle gracefully
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
            this.f = loginDialogCredentials;
            return loginDialogCredentials;
        }
    };
    exports.$C5b = $C5b;
    exports.$C5b = $C5b = __decorate([
        __param(0, log_1.$5i),
        __param(1, windows_1.$B5b),
        __param(2, encryptionService_1.$CT),
        __param(3, storageMainService_1.$z5b)
    ], $C5b);
});
//# sourceMappingURL=auth.js.map