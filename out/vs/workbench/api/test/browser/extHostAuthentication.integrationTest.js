/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/api/browser/mainThreadAuthentication", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostAuthentication", "vs/workbench/services/activity/common/activity", "vs/workbench/services/authentication/browser/authenticationService", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/api/test/common/testRPCProtocol", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, lifecycle_1, dialogs_1, testDialogService_1, instantiationServiceMock_1, notification_1, testNotificationService_1, quickInput_1, storage_1, telemetry_1, telemetryUtils_1, mainThreadAuthentication_1, extHost_protocol_1, extHostAuthentication_1, activity_1, authenticationService_1, authentication_1, extensions_1, remoteAgentService_1, testRPCProtocol_1, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AuthQuickPick {
        constructor() {
            this.items = [];
        }
        get selectedItems() {
            return this.items;
        }
        onDidAccept(listener) {
            this.listener = listener;
        }
        onDidHide(listener) {
        }
        dispose() {
        }
        show() {
            this.listener({
                inBackground: false
            });
        }
    }
    class AuthTestQuickInputService extends workbenchTestServices_1.TestQuickInputService {
        createQuickPick() {
            return new AuthQuickPick();
        }
    }
    class TestAuthProvider {
        constructor(authProviderName) {
            this.authProviderName = authProviderName;
            this.id = 1;
            this.sessions = new Map();
            this.onDidChangeSessions = () => { return { dispose() { } }; };
        }
        async getSessions(scopes) {
            if (!scopes) {
                return [...this.sessions.values()];
            }
            if (scopes[0] === 'return multiple') {
                return [...this.sessions.values()];
            }
            const sessions = this.sessions.get(scopes.join(' '));
            return sessions ? [sessions] : [];
        }
        async createSession(scopes) {
            const scopesStr = scopes.join(' ');
            const session = {
                scopes,
                id: `${this.id}`,
                account: {
                    label: this.authProviderName,
                    id: `${this.id}`,
                },
                accessToken: Math.random() + '',
            };
            this.sessions.set(scopesStr, session);
            this.id++;
            return session;
        }
        async removeSession(sessionId) {
            this.sessions.delete(sessionId);
        }
    }
    suite('ExtHostAuthentication', () => {
        let disposables;
        let extHostAuthentication;
        let instantiationService;
        suiteSetup(async () => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(dialogs_1.IDialogService, new testDialogService_1.TestDialogService({ confirmed: true }));
            instantiationService.stub(storage_1.IStorageService, new workbenchTestServices_2.TestStorageService());
            instantiationService.stub(quickInput_1.IQuickInputService, new AuthTestQuickInputService());
            instantiationService.stub(extensions_1.IExtensionService, new workbenchTestServices_2.TestExtensionService());
            instantiationService.stub(activity_1.IActivityService, new workbenchTestServices_2.TestActivityService());
            instantiationService.stub(remoteAgentService_1.IRemoteAgentService, new workbenchTestServices_1.TestRemoteAgentService());
            instantiationService.stub(notification_1.INotificationService, new testNotificationService_1.TestNotificationService());
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            instantiationService.stub(authentication_1.IAuthenticationService, instantiationService.createInstance(authenticationService_1.AuthenticationService));
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadAuthentication, instantiationService.createInstance(mainThreadAuthentication_1.MainThreadAuthentication, rpcProtocol));
            extHostAuthentication = new extHostAuthentication_1.ExtHostAuthentication(rpcProtocol);
            rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostAuthentication, extHostAuthentication);
        });
        setup(async () => {
            disposables = new lifecycle_1.DisposableStore();
            disposables.add(extHostAuthentication.registerAuthenticationProvider('test', 'test provider', new TestAuthProvider('test')));
            disposables.add(extHostAuthentication.registerAuthenticationProvider('test-multiple', 'test multiple provider', new TestAuthProvider('test-multiple'), { supportsMultipleAccounts: true }));
        });
        suiteTeardown(() => {
            instantiationService.dispose();
        });
        teardown(() => {
            disposables.dispose();
        });
        test('createIfNone - true', async () => {
            const scopes = ['foo'];
            const session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
        });
        test('createIfNone - false', async () => {
            const scopes = ['foo'];
            const nosession = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {});
            assert.strictEqual(nosession, undefined);
            // Now create the session
            const session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {});
            assert.strictEqual(session2?.id, session.id);
            assert.strictEqual(session2?.scopes[0], session.scopes[0]);
            assert.strictEqual(session2?.accessToken, session.accessToken);
        });
        // should behave the same as createIfNone: false
        test('silent - true', async () => {
            const scopes = ['foo'];
            const nosession = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                silent: true
            });
            assert.strictEqual(nosession, undefined);
            // Now create the session
            const session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                silent: true
            });
            assert.strictEqual(session.id, session2?.id);
            assert.strictEqual(session.scopes[0], session2?.scopes[0]);
        });
        test('forceNewSession - true - existing session', async () => {
            const scopes = ['foo'];
            const session1 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                createIfNone: true
            });
            // Now create the session
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                forceNewSession: true
            });
            assert.strictEqual(session2?.id, '2');
            assert.strictEqual(session2?.scopes[0], 'foo');
            assert.notStrictEqual(session1.accessToken, session2?.accessToken);
        });
        // Should behave like createIfNone: true
        test('forceNewSession - true - no existing session', async () => {
            const scopes = ['foo'];
            const session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                forceNewSession: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
        });
        test('forceNewSession - detail', async () => {
            const scopes = ['foo'];
            const session1 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                createIfNone: true
            });
            // Now create the session
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                forceNewSession: { detail: 'bar' }
            });
            assert.strictEqual(session2?.id, '2');
            assert.strictEqual(session2?.scopes[0], 'foo');
            assert.notStrictEqual(session1.accessToken, session2?.accessToken);
        });
        //#region Multi-Account AuthProvider
        test('clearSessionPreference - true', async () => {
            const scopes = ['foo'];
            // Now create the session
            const session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], scopes[0]);
            const scopes2 = ['bar'];
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', scopes2, {
                createIfNone: true
            });
            assert.strictEqual(session2?.id, '2');
            assert.strictEqual(session2?.scopes[0], scopes2[0]);
            const session3 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['return multiple'], {
                clearSessionPreference: true,
                createIfNone: true
            });
            // clearing session preference causes us to get the first session
            // because it would normally show a quick pick for the user to choose
            assert.strictEqual(session3?.id, session.id);
            assert.strictEqual(session3?.scopes[0], session.scopes[0]);
            assert.strictEqual(session3?.accessToken, session.accessToken);
        });
        test('silently getting session should return a session (if any) regardless of preference - fixes #137819', async () => {
            const scopes = ['foo'];
            // Now create the session
            const session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], scopes[0]);
            const scopes2 = ['bar'];
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', scopes2, {
                createIfNone: true
            });
            assert.strictEqual(session2?.id, '2');
            assert.strictEqual(session2?.scopes[0], scopes2[0]);
            const shouldBeSession1 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', scopes, {});
            assert.strictEqual(shouldBeSession1?.id, session.id);
            assert.strictEqual(shouldBeSession1?.scopes[0], session.scopes[0]);
            assert.strictEqual(shouldBeSession1?.accessToken, session.accessToken);
            const shouldBeSession2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', scopes2, {});
            assert.strictEqual(shouldBeSession2?.id, session2.id);
            assert.strictEqual(shouldBeSession2?.scopes[0], session2.scopes[0]);
            assert.strictEqual(shouldBeSession2?.accessToken, session2.accessToken);
        });
        //#endregion
        //#region error cases
        test('createIfNone and forceNewSession', async () => {
            try {
                await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', ['foo'], {
                    createIfNone: true,
                    forceNewSession: true
                });
                assert.fail('should have thrown an Error.');
            }
            catch (e) {
                assert.ok(e);
            }
        });
        test('forceNewSession and silent', async () => {
            try {
                await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', ['foo'], {
                    forceNewSession: true,
                    silent: true
                });
                assert.fail('should have thrown an Error.');
            }
            catch (e) {
                assert.ok(e);
            }
        });
        test('createIfNone and silent', async () => {
            try {
                await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', ['foo'], {
                    createIfNone: true,
                    silent: true
                });
                assert.fail('should have thrown an Error.');
            }
            catch (e) {
                assert.ok(e);
            }
        });
        test('Can get multiple sessions (with different scopes) in one extension', async () => {
            let session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['foo'], {
                createIfNone: true
            });
            session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['bar'], {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '2');
            assert.strictEqual(session?.scopes[0], 'bar');
            session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['foo'], {
                createIfNone: false
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
        });
        test('Can get multiple sessions (from different providers) in one extension', async () => {
            let session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['foo'], {
                createIfNone: true
            });
            session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', ['foo'], {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
            assert.strictEqual(session?.account.label, 'test');
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['foo'], {
                createIfNone: false
            });
            assert.strictEqual(session2?.id, '1');
            assert.strictEqual(session2?.scopes[0], 'foo');
            assert.strictEqual(session2?.account.label, 'test-multiple');
        });
        test('Can get multiple sessions (from different providers) in one extension at the same time', async () => {
            const sessionP = extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', ['foo'], {
                createIfNone: true
            });
            const session2P = extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['foo'], {
                createIfNone: true
            });
            const session = await sessionP;
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
            assert.strictEqual(session?.account.label, 'test');
            const session2 = await session2P;
            assert.strictEqual(session2?.id, '1');
            assert.strictEqual(session2?.scopes[0], 'foo');
            assert.strictEqual(session2?.account.label, 'test-multiple');
        });
        //#endregion
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEF1dGhlbnRpY2F0aW9uLmludGVncmF0aW9uVGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvdGVzdC9icm93c2VyL2V4dEhvc3RBdXRoZW50aWNhdGlvbi5pbnRlZ3JhdGlvblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUEwQmhHLE1BQU0sYUFBYTtRQUFuQjtZQUVRLFVBQUssR0FBRyxFQUFFLENBQUM7UUFtQm5CLENBQUM7UUFsQkEsSUFBVyxhQUFhO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBRUQsV0FBVyxDQUFDLFFBQThDO1lBQ3pELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzFCLENBQUM7UUFDRCxTQUFTLENBQUMsUUFBMEM7UUFFcEQsQ0FBQztRQUNELE9BQU87UUFFUCxDQUFDO1FBQ0QsSUFBSTtZQUNILElBQUksQ0FBQyxRQUFTLENBQUM7Z0JBQ2QsWUFBWSxFQUFFLEtBQUs7YUFDbkIsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNEO0lBQ0QsTUFBTSx5QkFBMEIsU0FBUSw2Q0FBcUI7UUFDbkQsZUFBZTtZQUN2QixPQUFZLElBQUksYUFBYSxFQUFFLENBQUM7UUFDakMsQ0FBQztLQUNEO0lBRUQsTUFBTSxnQkFBZ0I7UUFJckIsWUFBNkIsZ0JBQXdCO1lBQXhCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBUTtZQUg3QyxPQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ1AsYUFBUSxHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFDO1lBQzVELHdCQUFtQixHQUFHLEdBQUcsRUFBRSxHQUFHLE9BQU8sRUFBRSxPQUFPLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDRCxDQUFDO1FBQzFELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBMEI7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