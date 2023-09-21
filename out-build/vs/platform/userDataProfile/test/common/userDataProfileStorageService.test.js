/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/uri", "vs/base/parts/storage/common/storage", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/platform/storage/common/storage", "vs/platform/userDataProfile/common/userDataProfile", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, event_1, uri_1, storage_1, userDataProfileStorageService_1, storage_2, userDataProfile_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$V$b = void 0;
    class TestStorageDatabase extends storage_1.$So {
        constructor() {
            super(...arguments);
            this.b = new event_1.$fd();
            this.onDidChangeItemsExternal = this.b.event;
        }
        async updateItems(request) {
            await super.updateItems(request);
            if (request.insert || request.delete) {
                this.b.fire({ changed: request.insert, deleted: request.delete });
            }
        }
    }
    class $V$b extends userDataProfileStorageService_1.$fAb {
        constructor() {
            super(...arguments);
            this.onDidChange = event_1.Event.None;
            this.h = new Map();
        }
        async g(profile) {
            let database = this.h.get(profile.id);
            if (!database) {
                this.h.set(profile.id, database = new TestStorageDatabase());
            }
            return database;
        }
        setupStorageDatabase(profile) {
            return this.g(profile);
        }
        async f() { }
    }
    exports.$V$b = $V$b;
    suite('ProfileStorageService', () => {
        const disposables = (0, utils_1.$bT)();
        const profile = (0, userDataProfile_1.$Gk)('test', 'test', uri_1.URI.file('foo'), uri_1.URI.file('cache'));
        let testObject;
        let storage;
        setup(async () => {
            testObject = disposables.add(new $V$b(disposables.add(new storage_2.$Zo())));
            storage = disposables.add(new storage_1.$Ro(await testObject.setupStorageDatabase(profile)));
            await storage.init();
        });
        test('read empty storage', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const actual = await testObject.readStorageData(profile);
            assert.strictEqual(actual.size, 0);
        }));
        test('read storage with data', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            storage.set('foo', 'bar');
            storage.set(storage_2.$Uo, JSON.stringify({ foo: 0 /* StorageTarget.USER */ }));
            await storage.flush();
            const actual = await testObject.readStorageData(profile);
            assert.strictEqual(actual.size, 1);
            assert.deepStrictEqual(actual.get('foo'), { 'value': 'bar', 'target': 0 /* StorageTarget.USER */ });
        }));
        test('write in empty storage', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const data = new Map();
            data.set('foo', 'bar');
            await testObject.updateStorageData(profile, data, 0 /* StorageTarget.USER */);
            assert.strictEqual(storage.items.size, 2);
            assert.deepStrictEqual((0, storage_2.$Wo)(storage), { foo: 0 /* StorageTarget.USER */ });
            assert.strictEqual(storage.get('foo'), 'bar');
        }));
        test('write in storage with data', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            storage.set('foo', 'bar');
            storage.set(storage_2.$Uo, JSON.stringify({ foo: 0 /* StorageTarget.USER */ }));
            await storage.flush();
            const data = new Map();
            data.set('abc', 'xyz');
            await testObject.updateStorageData(profile, data, 1 /* StorageTarget.MACHINE */);
            assert.strictEqual(storage.items.size, 3);
            assert.deepStrictEqual((0, storage_2.$Wo)(storage), { foo: 0 /* StorageTarget.USER */, abc: 1 /* StorageTarget.MACHINE */ });
            assert.strictEqual(storage.get('foo'), 'bar');
            assert.strictEqual(storage.get('abc'), 'xyz');
        }));
        test('write in storage with data (insert, update, remove)', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            storage.set('foo', 'bar');
            storage.set('abc', 'xyz');
            storage.set(storage_2.$Uo, JSON.stringify({ foo: 0 /* StorageTarget.USER */, abc: 1 /* StorageTarget.MACHINE */ }));
            await storage.flush();
            const data = new Map();
            data.set('foo', undefined);
            data.set('abc', 'def');
            data.set('var', 'const');
            await testObject.updateStorageData(profile, data, 0 /* StorageTarget.USER */);
            assert.strictEqual(storage.items.size, 3);
            assert.deepStrictEqual((0, storage_2.$Wo)(storage), { abc: 0 /* StorageTarget.USER */, var: 0 /* StorageTarget.USER */ });
            assert.strictEqual(storage.get('abc'), 'def');
            assert.strictEqual(storage.get('var'), 'const');
        }));
    });
});
//# sourceMappingURL=userDataProfileStorageService.test.js.map