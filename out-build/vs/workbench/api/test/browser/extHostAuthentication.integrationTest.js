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
            this.a = listener;
        }
        onDidHide(listener) {
        }
        dispose() {
        }
        show() {
            this.a({
                inBackground: false
            });
        }
    }
    class AuthTestQuickInputService extends workbenchTestServices_1.$afc {
        createQuickPick() {
            return new AuthQuickPick();
        }
    }
    class TestAuthProvider {
        constructor(c) {
            this.c = c;
            this.a = 1;
            this.b = new Map();
            this.onDidChangeSessions = () => { return { dispose() { } }; };
        }
        async getSessions(scopes) {
            if (!scopes) {
                return [...this.b.values()];
            }
            if (scopes[0] === 'return multiple') {
                return [...this.b.values()];
            }
            const sessions = this.b.get(scopes.join(' '));
            return sessions ? [sessions] : [];
        }
        async createSession(scopes) {
            const scopesStr = scopes.join(' ');
            const session = {
                scopes,
                id: `${this.a}`,
                account: {
                    label: this.c,
                    id: `${this.a}`,
                },
                accessToken: Math.random() + '',
            };
            this.b.set(scopesStr, session);
            this.a++;
            return session;
        }
        async removeSession(sessionId) {
            this.b.delete(sessionId);
        }
    }
    suite('ExtHostAuthentication', () => {
        let disposables;
        let extHostAuthentication;
        let instantiationService;
        suiteSetup(async () => {
            instantiationService = new instantiationServiceMock_1.$L0b();
            instantiationService.stub(dialogs_1.$oA, new testDialogService_1.$H0b({ confirmed: true }));
            instantiationService.stub(storage_1.$Vo, new workbenchTestServices_2.$7dc());
            instantiationService.stub(quickInput_1.$Gq, new AuthTestQuickInputService());
            instantiationService.stub(extensions_1.$MF, new workbenchTestServices_2.$aec());
            instantiationService.stub(activity_1.$HV, new workbenchTestServices_2.$cec());
            instantiationService.stub(remoteAgentService_1.$jm, new workbenchTestServices_1.$bfc());
            instantiationService.stub(notification_1.$Yu, new testNotificationService_1.$I0b());
            instantiationService.stub(telemetry_1.$9k, telemetryUtils_1.$bo);
            const rpcProtocol = new testRPCProtocol_1.$3dc();
            instantiationService.stub(authentication_1.$3I, instantiationService.createInstance(authenticationService_1.$SV));
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadAuthentication, instantiationService.createInstance(mainThreadAuthentication_1.$Esb, rpcProtocol));
            extHostAuthentication = new extHostAuthentication_1.$Hcc(rpcProtocol);
            rpcProtocol.set(extHost_protocol_1.$2J.ExtHostAuthentication, extHostAuthentication);
        });
        setup(async () => {
            disposables = new lifecycle_1.$jc();
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
            const session = await extHostAuthentication.getSession(extensions_1.$KF, 'test', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
        });
        test('createIfNone - false', async () => {
            const scopes = ['foo'];
            const nosession = await extHostAuthentication.getSession(extensions_1.$KF, 'test', scopes, {});
            assert.strictEqual(nosession, undefined);
            // Now create the session
            const session = await extHostAuthentication.getSession(extensions_1.$KF, 'test', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
            const session2 = await extHostAuthentication.getSession(extensions_1.$KF, 'test', scopes, {});
            assert.strictEqual(session2?.id, session.id);
            assert.strictEqual(session2?.scopes[0], session.scopes[0]);
            assert.strictEqual(session2?.accessToken, session.accessToken);
        });
        // should behave the same as createIfNone: false
        test('silent - true', async () => {
            const scopes = ['foo'];
            const nosession = await extHostAuthentication.getSession(extensions_1.$KF, 'test', scopes, {
                silent: true
            });
            assert.strictEqual(nosession, undefined);
            // Now create the session
            const session = await extHostAuthentication.getSession(extensions_1.$KF, 'test', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
            const session2 = await extHostAuthentication.getSession(extensions_1.$KF, 'test', scopes, {
                silent: true
            });
            assert.strictEqual(session.id, session2?.id);
            assert.strictEqual(session.scopes[0], session2?.scopes[0]);
        });
        test('forceNewSession - true - existing session', async () => {
            const scopes = ['foo'];
            const session1 = await extHostAuthentication.getSession(extensions_1.$KF, 'test', scopes, {
                createIfNone: true
            });
            // Now create the session
            const session2 = await extHostAuthentication.getSession(extensions_1.$KF, 'test', scopes, {
                forceNewSession: true
            });
            assert.strictEqual(session2?.id, '2');
            assert.strictEqual(session2?.scopes[0], 'foo');
            assert.notStrictEqual(session1.accessToken, session2?.accessToken);
        });
        // Should behave like createIfNone: true
        test('forceNewSession - true - no existing session', async () => {
            const scopes = ['foo'];
            const session = await extHostAuthentication.getSession(extensions_1.$KF, 'test', scopes, {
                forceNewSession: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
        });
        test('forceNewSession - detail', async () => {
            const scopes = ['foo'];
            const session1 = await extHostAuthentication.getSession(extensions_1.$KF, 'test', scopes, {
                createIfNone: true
            });
            // Now create the session
            const session2 = await extHostAuthentication.getSession(extensions_1.$KF, 'test', scopes, {
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
            const session = await extHostAuthentication.getSession(extensions_1.$KF, 'test-multiple', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], scopes[0]);
            const scopes2 = ['bar'];
            const session2 = await extHostAuthentication.getSession(extensions_1.$KF, 'test-multiple', scopes2, {
                createIfNone: true
            });
            assert.strictEqual(session2?.id, '2');
            assert.strictEqual(session2?.scopes[0], scopes2[0]);
            const session3 = await extHostAuthentication.getSession(extensions_1.$KF, 'test-multiple', ['return multiple'], {
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
            const session = await extHostAuthentication.getSession(extensions_1.$KF, 'test-multiple', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], scopes[0]);
            const scopes2 = ['bar'];
            const session2 = await extHostAuthentication.getSession(extensions_1.$KF, 'test-multiple', scopes2, {
                createIfNone: true
            });
            assert.strictEqual(session2?.id, '2');
            assert.strictEqual(session2?.scopes[0], scopes2[0]);
            const shouldBeSession1 = await extHostAuthentication.getSession(extensions_1.$KF, 'test-multiple', scopes, {});
            assert.strictEqual(shouldBeSession1?.id, session.id);
            assert.strictEqual(shouldBeSession1?.scopes[0], session.scopes[0]);
            assert.strictEqual(shouldBeSession1?.accessToken, session.accessToken);
            const shouldBeSession2 = await extHostAuthentication.getSession(extensions_1.$KF, 'test-multiple', scopes2, {});
            assert.strictEqual(shouldBeSession2?.id, session2.id);
            assert.strictEqual(shouldBeSession2?.scopes[0], session2.scopes[0]);
            assert.strictEqual(shouldBeSession2?.accessToken, session2.accessToken);
        });
        //#endregion
        //#region error cases
        test('createIfNone and forceNewSession', async () => {
            try {
                await extHostAuthentication.getSession(extensions_1.$KF, 'test', ['foo'], {
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
                await extHostAuthentication.getSession(extensions_1.$KF, 'test', ['foo'], {
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
                await extHostAuthentication.getSession(extensions_1.$KF, 'test', ['foo'], {
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
            let session = await extHostAuthentication.getSession(extensions_1.$KF, 'test-multiple', ['foo'], {
                createIfNone: true
            });
            session = await extHostAuthentication.getSession(extensions_1.$KF, 'test-multiple', ['bar'], {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '2');
            assert.strictEqual(session?.scopes[0], 'bar');
            session = await extHostAuthentication.getSession(extensions_1.$KF, 'test-multiple', ['foo'], {
                createIfNone: false
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
        });
        test('Can get multiple sessions (from different providers) in one extension', async () => {
            let session = await extHostAuthentication.getSession(extensions_1.$KF, 'test-multiple', ['foo'], {
                createIfNone: true
            });
            session = await extHostAuthentication.getSession(extensions_1.$KF, 'test', ['foo'], {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
            assert.strictEqual(session?.account.label, 'test');
            const session2 = await extHostAuthentication.getSession(extensions_1.$KF, 'test-multiple', ['foo'], {
                createIfNone: false
            });
            assert.strictEqual(session2?.id, '1');
            assert.strictEqual(session2?.scopes[0], 'foo');
            assert.strictEqual(session2?.account.label, 'test-multiple');
        });
        test('Can get multiple sessions (from different providers) in one extension at the same time', async () => {
            const sessionP = extHostAuthentication.getSession(extensions_1.$KF, 'test', ['foo'], {
                createIfNone: true
            });
            const session2P = extHostAuthentication.getSession(extensions_1.$KF, 'test-multiple', ['foo'], {
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
//# sourceMappingURL=extHostAuthentication.integrationTest.js.map