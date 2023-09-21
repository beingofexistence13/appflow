/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/platform", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataSync/test/common/userDataSyncClient"], function (require, exports, assert, async_1, buffer_1, cancellation_1, event_1, platform_1, timeTravelScheduler_1, utils_1, log_1, productService_1, userDataSync_1, userDataSyncStoreService_1, userDataSyncClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('UserDataSyncStoreService', () => {
        const disposableStore = (0, utils_1.$bT)();
        test('test read manifest for the first time', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            const productService = client.instantiationService.get(productService_1.$kj);
            await testObject.manifest(null);
            assert.strictEqual(target.requestsWithAllHeaders.length, 1);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-Client-Name'], `${productService.applicationName}${platform_1.$o ? '-web' : ''}`);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-Client-Version'], productService.version);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], undefined);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], undefined);
        });
        test('test read manifest for the second time when session is not yet created', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            await testObject.manifest(null);
            const machineSessionId = target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'];
            target.reset();
            await testObject.manifest(null);
            assert.strictEqual(target.requestsWithAllHeaders.length, 1);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], machineSessionId);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], undefined);
        });
        test('test session id header is not set in the first manifest request after session is created', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            await testObject.manifest(null);
            const machineSessionId = target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'];
            await testObject.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            target.reset();
            await testObject.manifest(null);
            assert.strictEqual(target.requestsWithAllHeaders.length, 1);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], machineSessionId);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], undefined);
        });
        test('test session id header is set from the second manifest request after session is created', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            await testObject.manifest(null);
            const machineSessionId = target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'];
            await testObject.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            await testObject.manifest(null);
            target.reset();
            await testObject.manifest(null);
            assert.strictEqual(target.requestsWithAllHeaders.length, 1);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], machineSessionId);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], undefined);
        });
        test('test headers are send for write request', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            await testObject.manifest(null);
            const machineSessionId = target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'];
            await testObject.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            await testObject.manifest(null);
            await testObject.manifest(null);
            target.reset();
            await testObject.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            assert.strictEqual(target.requestsWithAllHeaders.length, 1);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], machineSessionId);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], undefined);
        });
        test('test headers are send for read request', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            await testObject.manifest(null);
            const machineSessionId = target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'];
            await testObject.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            await testObject.manifest(null);
            await testObject.manifest(null);
            target.reset();
            await testObject.readResource("settings" /* SyncResource.Settings */, null);
            assert.strictEqual(target.requestsWithAllHeaders.length, 1);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], machineSessionId);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], undefined);
        });
        test('test headers are reset after session is cleared ', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            await testObject.manifest(null);
            const machineSessionId = target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'];
            await testObject.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            await testObject.manifest(null);
            await testObject.manifest(null);
            await testObject.clear();
            target.reset();
            await testObject.manifest(null);
            assert.strictEqual(target.requestsWithAllHeaders.length, 1);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], undefined);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], machineSessionId);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], undefined);
        });
        test('test old headers are sent after session is changed on server ', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            await testObject.manifest(null);
            await testObject.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            await testObject.manifest(null);
            target.reset();
            await testObject.manifest(null);
            const machineSessionId = target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'];
            const userSessionId = target.requestsWithAllHeaders[0].headers['X-User-Session-Id'];
            await target.clear();
            // client 2
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client2.setUp();
            const testObject2 = client2.instantiationService.get(userDataSync_1.$Fgb);
            await testObject2.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            target.reset();
            await testObject.manifest(null);
            assert.strictEqual(target.requestsWithAllHeaders.length, 1);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], undefined);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], machineSessionId);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], undefined);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], userSessionId);
        });
        test('test old headers are reset from second request after session is changed on server ', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            await testObject.manifest(null);
            await testObject.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            await testObject.manifest(null);
            target.reset();
            await testObject.manifest(null);
            const machineSessionId = target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'];
            const userSessionId = target.requestsWithAllHeaders[0].headers['X-User-Session-Id'];
            await target.clear();
            // client 2
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client2.setUp();
            const testObject2 = client2.instantiationService.get(userDataSync_1.$Fgb);
            await testObject2.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            await testObject.manifest(null);
            target.reset();
            await testObject.manifest(null);
            assert.strictEqual(target.requestsWithAllHeaders.length, 1);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], undefined);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], machineSessionId);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], undefined);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], userSessionId);
        });
        test('test old headers are sent after session is cleared from another server ', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            await testObject.manifest(null);
            await testObject.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            await testObject.manifest(null);
            target.reset();
            await testObject.manifest(null);
            const machineSessionId = target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'];
            const userSessionId = target.requestsWithAllHeaders[0].headers['X-User-Session-Id'];
            // client 2
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client2.setUp();
            const testObject2 = client2.instantiationService.get(userDataSync_1.$Fgb);
            await testObject2.clear();
            target.reset();
            await testObject.manifest(null);
            assert.strictEqual(target.requestsWithAllHeaders.length, 1);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], undefined);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], machineSessionId);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], undefined);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], userSessionId);
        });
        test('test headers are reset after session is cleared from another server ', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            await testObject.manifest(null);
            await testObject.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            await testObject.manifest(null);
            target.reset();
            await testObject.manifest(null);
            const machineSessionId = target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'];
            // client 2
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client2.setUp();
            const testObject2 = client2.instantiationService.get(userDataSync_1.$Fgb);
            await testObject2.clear();
            await testObject.manifest(null);
            target.reset();
            await testObject.manifest(null);
            assert.strictEqual(target.requestsWithAllHeaders.length, 1);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], undefined);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], machineSessionId);
            assert.strictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], undefined);
        });
        test('test headers are reset after session is cleared from another server - started syncing again', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            await testObject.manifest(null);
            await testObject.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            await testObject.manifest(null);
            target.reset();
            await testObject.manifest(null);
            const machineSessionId = target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'];
            const userSessionId = target.requestsWithAllHeaders[0].headers['X-User-Session-Id'];
            // client 2
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client2.setUp();
            const testObject2 = client2.instantiationService.get(userDataSync_1.$Fgb);
            await testObject2.clear();
            await testObject.manifest(null);
            await testObject.writeResource("settings" /* SyncResource.Settings */, 'some content', null);
            await testObject.manifest(null);
            target.reset();
            await testObject.manifest(null);
            assert.strictEqual(target.requestsWithAllHeaders.length, 1);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], undefined);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-Machine-Session-Id'], machineSessionId);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], userSessionId);
            assert.notStrictEqual(target.requestsWithAllHeaders[0].headers['X-User-Session-Id'], undefined);
        });
        test('test rate limit on server with retry after', async () => {
            const target = new userDataSyncClient_1.$X$b(1, 1);
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            await testObject.manifest(null);
            const promise = event_1.Event.toPromise(testObject.onDidChangeDonotMakeRequestsUntil);
            try {
                await testObject.manifest(null);
                assert.fail('should fail');
            }
            catch (e) {
                assert.ok(e instanceof userDataSync_1.$Lgb);
                assert.deepStrictEqual(e.code, "TooManyRequestsAndRetryAfter" /* UserDataSyncErrorCode.TooManyRequestsAndRetryAfter */);
                await promise;
                assert.ok(!!testObject.donotMakeRequestsUntil);
            }
        });
        test('test donotMakeRequestsUntil is reset after retry time is finished', async () => {
            return (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                const client = disposableStore.add(new userDataSyncClient_1.$W$b(new userDataSyncClient_1.$X$b(1, 0.25)));
                await client.setUp();
                const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
                await testObject.manifest(null);
                try {
                    await testObject.manifest(null);
                    assert.fail('should fail');
                }
                catch (e) { }
                const promise = event_1.Event.toPromise(testObject.onDidChangeDonotMakeRequestsUntil);
                await (0, async_1.$Hg)(300);
                await promise;
                assert.ok(!testObject.donotMakeRequestsUntil);
            });
        });
        test('test donotMakeRequestsUntil is retrieved', async () => {
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(new userDataSyncClient_1.$X$b(1, 1)));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            await testObject.manifest(null);
            try {
                await testObject.manifest(null);
            }
            catch (e) { }
            const target = disposableStore.add(client.instantiationService.createInstance(userDataSyncStoreService_1.$3Ab));
            assert.strictEqual(target.donotMakeRequestsUntil?.getTime(), testObject.donotMakeRequestsUntil?.getTime());
        });
        test('test donotMakeRequestsUntil is checked and reset after retreived', async () => {
            return (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                const client = disposableStore.add(new userDataSyncClient_1.$W$b(new userDataSyncClient_1.$X$b(1, 0.25)));
                await client.setUp();
                const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
                await testObject.manifest(null);
                try {
                    await testObject.manifest(null);
                    assert.fail('should fail');
                }
                catch (e) { }
                await (0, async_1.$Hg)(300);
                const target = disposableStore.add(client.instantiationService.createInstance(userDataSyncStoreService_1.$3Ab));
                assert.ok(!target.donotMakeRequestsUntil);
            });
        });
        test('test read resource request handles 304', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            await client.sync();
            const testObject = client.instantiationService.get(userDataSync_1.$Fgb);
            const expected = await testObject.readResource("settings" /* SyncResource.Settings */, null);
            const actual = await testObject.readResource("settings" /* SyncResource.Settings */, expected);
            assert.strictEqual(actual, expected);
        });
    });
    suite('UserDataSyncRequestsSession', () => {
        const requestService = {
            _serviceBrand: undefined,
            async request() { return { res: { headers: {} }, stream: (0, buffer_1.$Vd)() }; },
            async resolveProxy() { return undefined; }
        };
        test('too many requests are thrown when limit exceeded', async () => {
            const testObject = new userDataSyncStoreService_1.$4Ab(1, 500, requestService, new log_1.$fj());
            await testObject.request('url', {}, cancellation_1.CancellationToken.None);
            try {
                await testObject.request('url', {}, cancellation_1.CancellationToken.None);
            }
            catch (error) {
                assert.ok(error instanceof userDataSync_1.$Lgb);
                assert.strictEqual(error.code, "LocalTooManyRequests" /* UserDataSyncErrorCode.LocalTooManyRequests */);
                return;
            }
            assert.fail('Should fail with limit exceeded');
        });
        test('requests are handled after session is expired', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = new userDataSyncStoreService_1.$4Ab(1, 100, requestService, new log_1.$fj());
            await testObject.request('url', {}, cancellation_1.CancellationToken.None);
            await (0, async_1.$Hg)(125);
            await testObject.request('url', {}, cancellation_1.CancellationToken.None);
        }));
        test('too many requests are thrown after session is expired', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = new userDataSyncStoreService_1.$4Ab(1, 100, requestService, new log_1.$fj());
            await testObject.request('url', {}, cancellation_1.CancellationToken.None);
            await (0, async_1.$Hg)(125);
            await testObject.request('url', {}, cancellation_1.CancellationToken.None);
            try {
                await testObject.request('url', {}, cancellation_1.CancellationToken.None);
            }
            catch (error) {
                assert.ok(error instanceof userDataSync_1.$Lgb);
                assert.strictEqual(error.code, "LocalTooManyRequests" /* UserDataSyncErrorCode.LocalTooManyRequests */);
                return;
            }
            assert.fail('Should fail with limit exceeded');
        }));
    });
});
//# sourceMappingURL=userDataSyncStoreService.test.js.map