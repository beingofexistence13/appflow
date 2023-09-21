/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/resources", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/platform/files/common/files", "vs/platform/storage/common/storage", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/test/common/userDataSyncClient"], function (require, exports, assert, async_1, buffer_1, event_1, resources_1, timeTravelScheduler_1, utils_1, files_1, storage_1, userDataProfile_1, abstractSynchronizer_1, userDataSync_1, userDataSyncClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestSynchroniser extends abstractSynchronizer_1.$8Ab {
        constructor() {
            super(...arguments);
            this.syncBarrier = new async_1.$Fg();
            this.syncResult = { hasConflicts: false, hasError: false };
            this.onDoSyncCall = this.B(new event_1.$fd());
            this.failWhenGettingLatestRemoteUserData = false;
            this.pb = 1;
            this.vb = false;
            this.localResource = (0, resources_1.$ig)(this.H.userRoamingDataHome, 'testResource.json');
            this.onDidTriggerLocalChangeCall = this.B(new event_1.$fd());
        }
        getMachineId() { return this.j; }
        getLastSyncResource() { return this.y; }
        X(manifest, lastSyncUserData) {
            if (this.failWhenGettingLatestRemoteUserData) {
                throw new Error();
            }
            return super.X(manifest, lastSyncUserData);
        }
        async Z(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration) {
            this.vb = false;
            this.onDoSyncCall.fire();
            await this.syncBarrier.wait();
            if (this.vb) {
                return "idle" /* SyncStatus.Idle */;
            }
            return super.Z(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration);
        }
        async qb(remoteUserData) {
            if (this.syncResult.hasError) {
                throw new Error('failed');
            }
            let fileContent = null;
            try {
                fileContent = await this.G.readFile(this.localResource);
            }
            catch (error) { }
            return [{
                    baseResource: this.localResource.with(({ scheme: userDataSync_1.$Wgb, authority: 'base' })),
                    baseContent: null,
                    localResource: this.localResource,
                    localContent: fileContent ? fileContent.value.toString() : null,
                    remoteResource: this.localResource.with(({ scheme: userDataSync_1.$Wgb, authority: 'remote' })),
                    remoteContent: remoteUserData.syncData ? remoteUserData.syncData.content : null,
                    previewResource: this.localResource.with(({ scheme: userDataSync_1.$Wgb, authority: 'preview' })),
                    ref: remoteUserData.ref,
                    localChange: 2 /* Change.Modified */,
                    remoteChange: 2 /* Change.Modified */,
                    acceptedResource: this.localResource.with(({ scheme: userDataSync_1.$Wgb, authority: 'accepted' })),
                }];
        }
        async ub(lastSyncUserData) {
            return true;
        }
        async rb(resourcePreview, token) {
            return {
                content: resourcePreview.ref,
                localChange: 2 /* Change.Modified */,
                remoteChange: 2 /* Change.Modified */,
                hasConflicts: this.syncResult.hasConflicts,
            };
        }
        async sb(resourcePreview, resource, content, token) {
            if ((0, resources_1.$bg)(resource, resourcePreview.localResource)) {
                return {
                    content: resourcePreview.localContent,
                    localChange: 0 /* Change.None */,
                    remoteChange: resourcePreview.localContent === null ? 3 /* Change.Deleted */ : 2 /* Change.Modified */,
                };
            }
            if ((0, resources_1.$bg)(resource, resourcePreview.remoteResource)) {
                return {
                    content: resourcePreview.remoteContent,
                    localChange: resourcePreview.remoteContent === null ? 3 /* Change.Deleted */ : 2 /* Change.Modified */,
                    remoteChange: 0 /* Change.None */,
                };
            }
            if ((0, resources_1.$bg)(resource, resourcePreview.previewResource)) {
                if (content === undefined) {
                    return {
                        content: resourcePreview.ref,
                        localChange: 2 /* Change.Modified */,
                        remoteChange: 2 /* Change.Modified */,
                    };
                }
                else {
                    return {
                        content,
                        localChange: content === null ? resourcePreview.localContent !== null ? 3 /* Change.Deleted */ : 0 /* Change.None */ : 2 /* Change.Modified */,
                        remoteChange: content === null ? resourcePreview.remoteContent !== null ? 3 /* Change.Deleted */ : 0 /* Change.None */ : 2 /* Change.Modified */,
                    };
                }
            }
            throw new Error(`Invalid Resource: ${resource.toString()}`);
        }
        async tb(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            if (resourcePreviews[0][1].localChange === 3 /* Change.Deleted */) {
                await this.G.del(this.localResource);
            }
            if (resourcePreviews[0][1].localChange === 1 /* Change.Added */ || resourcePreviews[0][1].localChange === 2 /* Change.Modified */) {
                await this.G.writeFile(this.localResource, buffer_1.$Fd.fromString(resourcePreviews[0][1].content));
            }
            if (resourcePreviews[0][1].remoteChange === 3 /* Change.Deleted */) {
                await this.applyRef(null, remoteUserData.ref);
            }
            if (resourcePreviews[0][1].remoteChange === 1 /* Change.Added */ || resourcePreviews[0][1].remoteChange === 2 /* Change.Modified */) {
                await this.applyRef(resourcePreviews[0][1].content, remoteUserData.ref);
            }
        }
        async applyRef(content, ref) {
            const remoteUserData = await this.mb(content === null ? '' : content, ref);
            await this.fb(remoteUserData);
        }
        async stop() {
            this.vb = true;
            this.syncBarrier.open();
            super.stop();
        }
        testTriggerLocalChange() {
            this.Q();
        }
        async R() {
            await super.R();
            this.onDidTriggerLocalChangeCall.fire();
        }
        hasLocalData() { throw new Error('not implemented'); }
        async resolveContent(uri) { return null; }
    }
    suite('TestSynchronizer - Auto Sync', () => {
        const server = new userDataSyncClient_1.$X$b();
        let client;
        teardown(async () => {
            await client.instantiationService.get(userDataSync_1.$Fgb).clear();
        });
        const disposableStore = (0, utils_1.$bT)();
        setup(async () => {
            client = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client.setUp();
        });
        test('status is syncing', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            const actual = [];
            disposableStore.add(testObject.onDidChangeStatus(status => actual.push(status)));
            const promise = event_1.Event.toPromise(testObject.onDoSyncCall.event);
            testObject.sync(await client.getResourceManifest());
            await promise;
            assert.deepStrictEqual(actual, ["syncing" /* SyncStatus.Syncing */]);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            testObject.stop();
        }));
        test('status is set correctly when sync is finished', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            const actual = [];
            disposableStore.add(testObject.onDidChangeStatus(status => actual.push(status)));
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(actual, ["syncing" /* SyncStatus.Syncing */, "idle" /* SyncStatus.Idle */]);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
        }));
        test('status is set correctly when sync has errors', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasError: true, hasConflicts: false };
            testObject.syncBarrier.open();
            const actual = [];
            disposableStore.add(testObject.onDidChangeStatus(status => actual.push(status)));
            try {
                await testObject.sync(await client.getResourceManifest());
                assert.fail('Should fail');
            }
            catch (e) {
                assert.deepStrictEqual(actual, ["syncing" /* SyncStatus.Syncing */, "idle" /* SyncStatus.Idle */]);
                assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            }
        }));
        test('status is set to hasConflicts when asked to sync if there are conflicts', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            assertConflicts(testObject.conflicts.conflicts, [testObject.localResource]);
        }));
        test('sync should not run if syncing already', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            const promise = event_1.Event.toPromise(testObject.onDoSyncCall.event);
            testObject.sync(await client.getResourceManifest());
            await promise;
            const actual = [];
            disposableStore.add(testObject.onDidChangeStatus(status => actual.push(status)));
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(actual, []);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            await testObject.stop();
        }));
        test('sync should not run if there are conflicts', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const actual = [];
            disposableStore.add(testObject.onDidChangeStatus(status => actual.push(status)));
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(actual, []);
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
        }));
        test('accept preview during conflicts', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            await testObject.accept(testObject.conflicts.conflicts[0].previewResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertConflicts(testObject.conflicts.conflicts, []);
            await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            const fileService = client.instantiationService.get(files_1.$6j);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, (await fileService.readFile(testObject.localResource)).value.toString());
        }));
        test('accept remote during conflicts', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const fileService = client.instantiationService.get(files_1.$6j);
            const currentRemoteContent = (await testObject.getRemoteUserData(null)).syncData?.content;
            const newLocalContent = 'conflict';
            await fileService.writeFile(testObject.localResource, buffer_1.$Fd.fromString(newLocalContent));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            await testObject.accept(testObject.conflicts.conflicts[0].remoteResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertConflicts(testObject.conflicts.conflicts, []);
            await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, currentRemoteContent);
            assert.strictEqual((await fileService.readFile(testObject.localResource)).value.toString(), currentRemoteContent);
        }));
        test('accept local during conflicts', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const fileService = client.instantiationService.get(files_1.$6j);
            const newLocalContent = 'conflict';
            await fileService.writeFile(testObject.localResource, buffer_1.$Fd.fromString(newLocalContent));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            await testObject.accept(testObject.conflicts.conflicts[0].localResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertConflicts(testObject.conflicts.conflicts, []);
            await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, newLocalContent);
            assert.strictEqual((await fileService.readFile(testObject.localResource)).value.toString(), newLocalContent);
        }));
        test('accept new content during conflicts', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const fileService = client.instantiationService.get(files_1.$6j);
            const newLocalContent = 'conflict';
            await fileService.writeFile(testObject.localResource, buffer_1.$Fd.fromString(newLocalContent));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            const mergeContent = 'newContent';
            await testObject.accept(testObject.conflicts.conflicts[0].previewResource, mergeContent);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertConflicts(testObject.conflicts.conflicts, []);
            await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, mergeContent);
            assert.strictEqual((await fileService.readFile(testObject.localResource)).value.toString(), mergeContent);
        }));
        test('accept delete during conflicts', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const fileService = client.instantiationService.get(files_1.$6j);
            const newLocalContent = 'conflict';
            await fileService.writeFile(testObject.localResource, buffer_1.$Fd.fromString(newLocalContent));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            await testObject.accept(testObject.conflicts.conflicts[0].previewResource, null);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertConflicts(testObject.conflicts.conflicts, []);
            await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, '');
            assert.ok(!(await fileService.exists(testObject.localResource)));
        }));
        test('accept deleted local during conflicts', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const fileService = client.instantiationService.get(files_1.$6j);
            await fileService.del(testObject.localResource);
            testObject.syncResult = { hasConflicts: true, hasError: false };
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            await testObject.accept(testObject.conflicts.conflicts[0].localResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertConflicts(testObject.conflicts.conflicts, []);
            await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, '');
            assert.ok(!(await fileService.exists(testObject.localResource)));
        }));
        test('accept deleted remote during conflicts', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            const fileService = client.instantiationService.get(files_1.$6j);
            await fileService.writeFile(testObject.localResource, buffer_1.$Fd.fromString('some content'));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            await testObject.accept(testObject.conflicts.conflicts[0].remoteResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertConflicts(testObject.conflicts.conflicts, []);
            await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData, null);
            assert.ok(!(await fileService.exists(testObject.localResource)));
        }));
        test('request latest data on precondition failure', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            // Sync once
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            testObject.syncBarrier = new async_1.$Fg();
            // update remote data before syncing so that 412 is thrown by server
            const disposable = testObject.onDoSyncCall.event(async () => {
                disposable.dispose();
                await testObject.applyRef(ref, ref);
                server.reset();
                testObject.syncBarrier.open();
            });
            // Start sycing
            const manifest = await client.getResourceManifest();
            const ref = manifest[testObject.resource];
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(server.requests, [
                { type: 'POST', url: `${server.url}/v1/resource/${testObject.resource}`, headers: { 'If-Match': ref } },
                { type: 'GET', url: `${server.url}/v1/resource/${testObject.resource}/latest`, headers: {} },
                { type: 'POST', url: `${server.url}/v1/resource/${testObject.resource}`, headers: { 'If-Match': `${parseInt(ref) + 1}` } },
            ]);
        }));
        test('no requests are made to server when local change is triggered', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            server.reset();
            const promise = event_1.Event.toPromise(testObject.onDidTriggerLocalChangeCall.event);
            testObject.testTriggerLocalChange();
            await promise;
            assert.deepStrictEqual(server.requests, []);
        })));
        test('status is reset when getting latest remote data fails', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.failWhenGettingLatestRemoteUserData = true;
            try {
                await testObject.sync(await client.getResourceManifest());
                assert.fail('Should throw an error');
            }
            catch (error) {
            }
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
        }));
    });
    suite('TestSynchronizer - Manual Sync', () => {
        const server = new userDataSyncClient_1.$X$b();
        let client;
        teardown(async () => {
            await client.instantiationService.get(userDataSync_1.$Fgb).clear();
        });
        const disposableStore = (0, utils_1.$bT)();
        setup(async () => {
            client = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client.setUp();
        });
        test('preview', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            const preview = await testObject.preview(await client.getResourceManifest(), {});
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('preview -> merge', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "accepted" /* MergeState.Accepted */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('preview -> accept', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "accepted" /* MergeState.Accepted */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('preview -> merge -> accept', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].localResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "accepted" /* MergeState.Accepted */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('preview -> merge -> apply', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const manifest = await client.getResourceManifest();
            let preview = await testObject.preview(manifest, {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual(preview, null);
            assertConflicts(testObject.conflicts.conflicts, []);
            const expectedContent = manifest[testObject.resource];
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, expectedContent);
            assert.strictEqual((await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString(), expectedContent);
        }));
        test('preview -> accept -> apply', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const manifest = await client.getResourceManifest();
            const expectedContent = manifest[testObject.resource];
            let preview = await testObject.preview(manifest, {});
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource);
            preview = await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual(preview, null);
            assertConflicts(testObject.conflicts.conflicts, []);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, expectedContent);
            assert.strictEqual((await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString(), expectedContent);
        }));
        test('preview -> merge -> accept -> apply', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const expectedContent = (await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].localResource);
            preview = await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual(preview, null);
            assertConflicts(testObject.conflicts.conflicts, []);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, expectedContent);
            assert.strictEqual((await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString(), expectedContent);
        }));
        test('preivew -> merge -> discard', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "preview" /* MergeState.Preview */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('preivew -> merge -> discard -> accept', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].remoteResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "accepted" /* MergeState.Accepted */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('preivew -> accept -> discard', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "preview" /* MergeState.Preview */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('preivew -> accept -> discard -> accept', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].remoteResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "accepted" /* MergeState.Accepted */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('preivew -> accept -> discard -> merge', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            preview = await testObject.merge(preview.resourcePreviews[0].remoteResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "accepted" /* MergeState.Accepted */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('preivew -> merge -> accept -> discard', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].remoteResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "preview" /* MergeState.Preview */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('preivew -> merge -> discard -> accept -> apply', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const expectedContent = (await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].localResource);
            preview = await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual(preview, null);
            assertConflicts(testObject.conflicts.conflicts, []);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, expectedContent);
            assert.strictEqual((await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString(), expectedContent);
        }));
        test('preivew -> accept -> discard -> accept -> apply', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const expectedContent = (await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].remoteResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].localResource);
            preview = await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual(preview, null);
            assertConflicts(testObject.conflicts.conflicts, []);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, expectedContent);
            assert.strictEqual((await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString(), expectedContent);
        }));
        test('preivew -> accept -> discard -> merge -> apply', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const manifest = await client.getResourceManifest();
            const expectedContent = manifest[testObject.resource];
            let preview = await testObject.preview(manifest, {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].remoteResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            preview = await testObject.merge(preview.resourcePreviews[0].localResource);
            preview = await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual(preview, null);
            assertConflicts(testObject.conflicts.conflicts, []);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, expectedContent);
            assert.strictEqual((await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString(), expectedContent);
        }));
        test('conflicts: preview', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            const preview = await testObject.preview(await client.getResourceManifest(), {});
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('conflicts: preview -> merge', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "conflict" /* MergeState.Conflict */);
            assertConflicts(testObject.conflicts.conflicts, [preview.resourcePreviews[0].localResource]);
        }));
        test('conflicts: preview -> merge -> discard', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            const preview = await testObject.preview(await client.getResourceManifest(), {});
            await testObject.merge(preview.resourcePreviews[0].previewResource);
            await testObject.discard(preview.resourcePreviews[0].previewResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "preview" /* MergeState.Preview */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('conflicts: preview -> accept', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            await testObject.merge(preview.resourcePreviews[0].previewResource);
            const content = await testObject.resolveContent(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource, content);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
        }));
        test('conflicts: preview -> merge -> accept -> apply', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            testObject.syncResult = { hasConflicts: true, hasError: false };
            const manifest = await client.getResourceManifest();
            const expectedContent = manifest[testObject.resource];
            let preview = await testObject.preview(manifest, {});
            await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource);
            preview = await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual(preview, null);
            assertConflicts(testObject.conflicts.conflicts, []);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, expectedContent);
            assert.strictEqual((await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString(), expectedContent);
        }));
        test('conflicts: preview -> accept 2', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            const content = await testObject.resolveContent(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource, content);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('conflicts: preview -> accept -> apply', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            testObject.syncResult = { hasConflicts: true, hasError: false };
            const manifest = await client.getResourceManifest();
            const expectedContent = manifest[testObject.resource];
            let preview = await testObject.preview(manifest, {});
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource);
            preview = await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual(preview, null);
            assertConflicts(testObject.conflicts.conflicts, []);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, expectedContent);
            assert.strictEqual((await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString(), expectedContent);
        }));
        test('conflicts: preivew -> merge -> discard', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "preview" /* MergeState.Preview */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('conflicts: preivew -> merge -> discard -> accept', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].remoteResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "accepted" /* MergeState.Accepted */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('conflicts: preivew -> accept -> discard', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "preview" /* MergeState.Preview */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('conflicts: preivew -> accept -> discard -> accept', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].remoteResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "accepted" /* MergeState.Accepted */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('conflicts: preivew -> accept -> discard -> merge', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            preview = await testObject.merge(preview.resourcePreviews[0].remoteResource);
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "conflict" /* MergeState.Conflict */);
            assertConflicts(testObject.conflicts.conflicts, [preview.resourcePreviews[0].localResource]);
        }));
        test('conflicts: preivew -> merge -> discard -> merge', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: true, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            preview = await testObject.merge(preview.resourcePreviews[0].remoteResource);
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "conflict" /* MergeState.Conflict */);
            assertConflicts(testObject.conflicts.conflicts, [preview.resourcePreviews[0].localResource]);
        }));
        test('conflicts: preivew -> merge -> accept -> discard', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].remoteResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            assert.deepStrictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            assertPreviews(preview.resourcePreviews, [testObject.localResource]);
            assert.strictEqual(preview.resourcePreviews[0].mergeState, "preview" /* MergeState.Preview */);
            assertConflicts(testObject.conflicts.conflicts, []);
        }));
        test('conflicts: preivew -> merge -> discard -> accept -> apply', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const expectedContent = (await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].localResource);
            preview = await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual(preview, null);
            assertConflicts(testObject.conflicts.conflicts, []);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, expectedContent);
            assert.strictEqual((await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString(), expectedContent);
        }));
        test('conflicts: preivew -> accept -> discard -> accept -> apply', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncResult = { hasConflicts: false, hasError: false };
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const expectedContent = (await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString();
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            preview = await testObject.merge(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].remoteResource);
            preview = await testObject.discard(preview.resourcePreviews[0].previewResource);
            preview = await testObject.accept(preview.resourcePreviews[0].localResource);
            preview = await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual(preview, null);
            assertConflicts(testObject.conflicts.conflicts, []);
            assert.strictEqual((await testObject.getRemoteUserData(null)).syncData?.content, expectedContent);
            assert.strictEqual((await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString(), expectedContent);
        }));
        test('remote is accepted if last sync state does not exists in server', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp();
            const synchronizer2 = disposableStore.add(client2.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            synchronizer2.syncBarrier.open();
            const manifest = await client2.getResourceManifest();
            const expectedContent = manifest[testObject.resource];
            await synchronizer2.sync(manifest);
            await fileService.del(testObject.getLastSyncResource());
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.strictEqual((await client.instantiationService.get(files_1.$6j).readFile(testObject.localResource)).value.toString(), expectedContent);
        }));
    });
    suite('TestSynchronizer - Last Sync Data', () => {
        const server = new userDataSyncClient_1.$X$b();
        let client;
        teardown(async () => {
            await client.instantiationService.get(userDataSync_1.$Fgb).clear();
        });
        const disposableStore = (0, utils_1.$bT)();
        setup(async () => {
            client = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client.setUp();
        });
        test('last sync data is null when not synced before', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            const actual = await testObject.getLastSyncUserData();
            assert.strictEqual(actual, null);
        }));
        test('last sync data is set after sync', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const storageService = client.instantiationService.get(storage_1.$Vo);
            const fileService = client.instantiationService.get(files_1.$6j);
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const machineId = await testObject.getMachineId();
            const actual = await testObject.getLastSyncUserData();
            assert.deepStrictEqual(storageService.get('settings.lastSyncUserData', -1 /* StorageScope.APPLICATION */), JSON.stringify({ ref: '1' }));
            assert.deepStrictEqual(JSON.parse((await fileService.readFile(testObject.getLastSyncResource())).value.toString()), { ref: '1', syncData: { version: 1, machineId, content: '0' } });
            assert.deepStrictEqual(actual, {
                ref: '1',
                syncData: {
                    content: '0',
                    machineId,
                    version: 1
                },
            });
        }));
        test('last sync data is read from server after sync if last sync resource is deleted', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const storageService = client.instantiationService.get(storage_1.$Vo);
            const fileService = client.instantiationService.get(files_1.$6j);
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const machineId = await testObject.getMachineId();
            await fileService.del(testObject.getLastSyncResource());
            const actual = await testObject.getLastSyncUserData();
            assert.deepStrictEqual(storageService.get('settings.lastSyncUserData', -1 /* StorageScope.APPLICATION */), JSON.stringify({ ref: '1' }));
            assert.deepStrictEqual(actual, {
                ref: '1',
                syncData: {
                    content: '0',
                    machineId,
                    version: 1
                },
            });
        }));
        test('last sync data is read from server after sync and sync data is invalid', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const storageService = client.instantiationService.get(storage_1.$Vo);
            const fileService = client.instantiationService.get(files_1.$6j);
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const machineId = await testObject.getMachineId();
            await fileService.writeFile(testObject.getLastSyncResource(), buffer_1.$Fd.fromString(JSON.stringify({
                ref: '1',
                version: 1,
                content: JSON.stringify({
                    content: '0',
                    machineId,
                    version: 1
                }),
                additionalData: {
                    foo: 'bar'
                }
            })));
            server.reset();
            const actual = await testObject.getLastSyncUserData();
            assert.deepStrictEqual(storageService.get('settings.lastSyncUserData', -1 /* StorageScope.APPLICATION */), JSON.stringify({ ref: '1' }));
            assert.deepStrictEqual(actual, {
                ref: '1',
                syncData: {
                    content: '0',
                    machineId,
                    version: 1
                },
            });
            assert.deepStrictEqual(server.requests, [{ headers: {}, type: 'GET', url: 'http://host:3000/v1/resource/settings/1' }]);
        }));
        test('last sync data is read from server after sync and stored sync data is tampered', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const storageService = client.instantiationService.get(storage_1.$Vo);
            const fileService = client.instantiationService.get(files_1.$6j);
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const machineId = await testObject.getMachineId();
            await fileService.writeFile(testObject.getLastSyncResource(), buffer_1.$Fd.fromString(JSON.stringify({
                ref: '2',
                syncData: {
                    content: '0',
                    machineId,
                    version: 1
                }
            })));
            server.reset();
            const actual = await testObject.getLastSyncUserData();
            assert.deepStrictEqual(storageService.get('settings.lastSyncUserData', -1 /* StorageScope.APPLICATION */), JSON.stringify({ ref: '1' }));
            assert.deepStrictEqual(actual, {
                ref: '1',
                syncData: {
                    content: '0',
                    machineId,
                    version: 1
                }
            });
            assert.deepStrictEqual(server.requests, [{ headers: {}, type: 'GET', url: 'http://host:3000/v1/resource/settings/1' }]);
        }));
        test('reading last sync data: no requests are made to server when sync data is invalid', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            const machineId = await testObject.getMachineId();
            await fileService.writeFile(testObject.getLastSyncResource(), buffer_1.$Fd.fromString(JSON.stringify({
                ref: '1',
                version: 1,
                content: JSON.stringify({
                    content: '0',
                    machineId,
                    version: 1
                }),
                additionalData: {
                    foo: 'bar'
                }
            })));
            await testObject.getLastSyncUserData();
            server.reset();
            await testObject.getLastSyncUserData();
            assert.deepStrictEqual(server.requests, []);
        }));
        test('reading last sync data: no requests are made to server when sync data is null', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            server.reset();
            await fileService.writeFile(testObject.getLastSyncResource(), buffer_1.$Fd.fromString(JSON.stringify({
                ref: '1',
                syncData: null,
            })));
            await testObject.getLastSyncUserData();
            assert.deepStrictEqual(server.requests, []);
        }));
        test('last sync data is null after sync if last sync state is deleted', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const storageService = client.instantiationService.get(storage_1.$Vo);
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            storageService.remove('settings.lastSyncUserData', -1 /* StorageScope.APPLICATION */);
            const actual = await testObject.getLastSyncUserData();
            assert.strictEqual(actual, null);
        }));
        test('last sync data is null after sync if last sync content is deleted everywhere', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const storageService = client.instantiationService.get(storage_1.$Vo);
            const fileService = client.instantiationService.get(files_1.$6j);
            const userDataSyncStoreService = client.instantiationService.get(userDataSync_1.$Fgb);
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            testObject.syncBarrier.open();
            await testObject.sync(await client.getResourceManifest());
            await fileService.del(testObject.getLastSyncResource());
            await userDataSyncStoreService.deleteResource(testObject.syncResource.syncResource, null);
            const actual = await testObject.getLastSyncUserData();
            assert.deepStrictEqual(storageService.get('settings.lastSyncUserData', -1 /* StorageScope.APPLICATION */), JSON.stringify({ ref: '1' }));
            assert.strictEqual(actual, null);
        }));
        test('last sync data is migrated', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const storageService = client.instantiationService.get(storage_1.$Vo);
            const fileService = client.instantiationService.get(files_1.$6j);
            const testObject = disposableStore.add(client.instantiationService.createInstance(TestSynchroniser, { syncResource: "settings" /* SyncResource.Settings */, profile: client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile }, undefined));
            const machineId = await testObject.getMachineId();
            await fileService.writeFile(testObject.getLastSyncResource(), buffer_1.$Fd.fromString(JSON.stringify({
                ref: '1',
                version: 1,
                content: JSON.stringify({
                    content: '0',
                    machineId,
                    version: 1
                }),
                additionalData: {
                    foo: 'bar'
                }
            })));
            const actual = await testObject.getLastSyncUserData();
            assert.deepStrictEqual(storageService.get('settings.lastSyncUserData', -1 /* StorageScope.APPLICATION */), JSON.stringify({
                ref: '1',
                version: 1,
                additionalData: {
                    foo: 'bar'
                }
            }));
            assert.deepStrictEqual(actual, {
                ref: '1',
                version: 1,
                syncData: {
                    content: '0',
                    machineId,
                    version: 1
                },
                additionalData: {
                    foo: 'bar'
                }
            });
        }));
    });
    function assertConflicts(actual, expected) {
        assert.deepStrictEqual(actual.map(({ localResource }) => localResource.toString()), expected.map(uri => uri.toString()));
    }
    function assertPreviews(actual, expected) {
        assert.deepStrictEqual(actual.map(({ localResource }) => localResource.toString()), expected.map(uri => uri.toString()));
    }
});
//# sourceMappingURL=synchronizer.test.js.map