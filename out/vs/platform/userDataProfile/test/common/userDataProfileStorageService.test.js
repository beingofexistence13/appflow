/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/uri", "vs/base/parts/storage/common/storage", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/platform/storage/common/storage", "vs/platform/userDataProfile/common/userDataProfile", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, event_1, uri_1, storage_1, userDataProfileStorageService_1, storage_2, userDataProfile_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestUserDataProfileStorageService = void 0;
    class TestStorageDatabase extends storage_1.InMemoryStorageDatabase {
        constructor() {
            super(...arguments);
            this._onDidChangeItemsExternal = new event_1.Emitter();
            this.onDidChangeItemsExternal = this._onDidChangeItemsExternal.event;
        }
        async updateItems(request) {
            await super.updateItems(request);
            if (request.insert || request.delete) {
                this._onDidChangeItemsExternal.fire({ changed: request.insert, deleted: request.delete });
            }
        }
    }
    class TestUserDataProfileStorageService extends userDataProfileStorageService_1.AbstractUserDataProfileStorageService {
        constructor() {
            super(...arguments);
            this.onDidChange = event_1.Event.None;
            this.databases = new Map();
        }
        async createStorageDatabase(profile) {
            let database = this.databases.get(profile.id);
            if (!database) {
                this.databases.set(profile.id, database = new TestStorageDatabase());
            }
            return database;
        }
        setupStorageDatabase(profile) {
            return this.createStorageDatabase(profile);
        }
        async closeAndDispose() { }
    }
    exports.TestUserDataProfileStorageService = TestUserDataProfileStorageService;
    suite('ProfileStorageService', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const profile = (0, userDataProfile_1.toUserDataProfile)('test', 'test', uri_1.URI.file('foo'), uri_1.URI.file('cache'));
        let testObject;
        let storage;
        setup(async () => {
            testObject = disposables.add(new TestUserDataProfileStorageService(disposables.add(new storage_2.InMemoryStorageService())));
            storage = disposables.add(new storage_1.Storage(await testObject.setupStorageDatabase(profile)));
            await storage.init();
        });
        test('read empty storage', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            const actual = await testObject.readStorageData(profile);
            assert.strictEqual(actual.size, 0);
        }));
        test('read storage with data', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            storage.set('foo', 'bar');
            storage.set(storage_2.TARGET_KEY, JSON.stringify({ foo: 0 /* StorageTarget.USER */ }));
            await storage.flush();
            const actual = await testObject.readStorageData(profile);
            assert.strictEqual(actual.size, 1);
            assert.deepStrictEqual(actual.get('foo'), { 'value': 'bar', 'target': 0 /* StorageTarget.USER */ });
        }));
        test('write in empty storage', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            const data = new Map();
            data.set('foo', 'bar');
            await testObject.updateStorageData(profile, data, 0 /* StorageTarget.USER */);
            assert.strictEqual(storage.items.size, 2);
            assert.deepStrictEqual((0, storage_2.loadKeyTargets)(storage), { foo: 0 /* StorageTarget.USER */ });
            assert.strictEqual(storage.get('foo'), 'bar');
        }));
        test('write in storage with data', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            storage.set('foo', 'bar');
            storage.set(storage_2.TARGET_KEY, JSON.stringify({ foo: 0 /* StorageTarget.USER */ }));
            await storage.flush();
            const data = new Map();
            data.set('abc', 'xyz');
            await testObject.updateStorageData(profile, data, 1 /* StorageTarget.MACHINE */);
            assert.strictEqual(storage.items.size, 3);
            assert.deepStrictEqual((0, storage_2.loadKeyTargets)(storage), { foo: 0 /* StorageTarget.USER */, abc: 1 /* StorageTarget.MACHINE */ });
            assert.strictEqual(storage.get('foo'), 'bar');
            assert.strictEqual(storage.get('abc'), 'xyz');
        }));
        test('write in storage with data (insert, update, remove)', () => (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            storage.set('foo', 'bar');
            storage.set('abc', 'xyz');
            storage.set(storage_2.TARGET_KEY, JSON.stringify({ foo: 0 /* StorageTarget.USER */, abc: 1 /* StorageTarget.MACHINE */ }));
            await storage.flush();
            const data = new Map();
            data.set('foo', undefined);
            data.set('abc', 'def');
            data.set('var', 'const');
            await testObject.updateStorageData(profile, data, 0 /* StorageTarget.USER */);
            assert.strictEqual(storage.items.size, 3);
            assert.deepStrictEqual((0, storage_2.loadKeyTargets)(storage), { abc: 0 /* StorageTarget.USER */, var: 0 /* StorageTarget.USER */ });
            assert.strictEqual(storage.get('abc'), 'def');
            assert.strictEqual(storage.get('var'), 'const');
        }));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlU3RvcmFnZVNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VzZXJEYXRhUHJvZmlsZS90ZXN0L2NvbW1vbi91c2VyRGF0YVByb2ZpbGVTdG9yYWdlU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFNLG1CQUFvQixTQUFRLGlDQUF1QjtRQUF6RDs7WUFFa0IsOEJBQXlCLEdBQUcsSUFBSSxlQUFPLEVBQTRCLENBQUM7WUFDbkUsNkJBQXdCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQztRQVFuRixDQUFDO1FBTlMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUF1QjtZQUNqRCxNQUFNLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakMsSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDMUY7UUFDRixDQUFDO0tBQ0Q7SUFFRCxNQUFhLGlDQUFrQyxTQUFRLHFFQUFxQztRQUE1Rjs7WUFFVSxnQkFBVyxHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFDMUIsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1FBZWhFLENBQUM7UUFiVSxLQUFLLENBQUMscUJBQXFCLENBQUMsT0FBeUI7WUFDOUQsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2Qs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