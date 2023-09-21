/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/base/parts/storage/common/storage", "vs/base/test/common/testUtils", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/platform/files/common/fileService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/log/common/log", "vs/platform/storage/test/common/storageService.test", "vs/workbench/services/storage/browser/storageService", "vs/workbench/services/userDataProfile/common/userDataProfileService"], function (require, exports, assert_1, lifecycle_1, network_1, resources_1, uri_1, storage_1, testUtils_1, timeTravelScheduler_1, utils_1, fileService_1, inMemoryFilesystemProvider_1, log_1, storageService_test_1, storageService_1, userDataProfileService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function createStorageService() {
        const disposables = new lifecycle_1.$jc();
        const logService = new log_1.$fj();
        const fileService = disposables.add(new fileService_1.$Dp(logService));
        const userDataProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
        disposables.add(fileService.registerProvider(network_1.Schemas.vscodeUserData, userDataProvider));
        const profilesRoot = uri_1.URI.file('/profiles').with({ scheme: network_1.Schemas.inMemory });
        const inMemoryExtraProfileRoot = (0, resources_1.$ig)(profilesRoot, 'extra');
        const inMemoryExtraProfile = {
            id: 'id',
            name: 'inMemory',
            shortName: 'inMemory',
            isDefault: false,
            location: inMemoryExtraProfileRoot,
            globalStorageHome: (0, resources_1.$ig)(inMemoryExtraProfileRoot, 'globalStorageHome'),
            settingsResource: (0, resources_1.$ig)(inMemoryExtraProfileRoot, 'settingsResource'),
            keybindingsResource: (0, resources_1.$ig)(inMemoryExtraProfileRoot, 'keybindingsResource'),
            tasksResource: (0, resources_1.$ig)(inMemoryExtraProfileRoot, 'tasksResource'),
            snippetsHome: (0, resources_1.$ig)(inMemoryExtraProfileRoot, 'snippetsHome'),
            extensionsResource: (0, resources_1.$ig)(inMemoryExtraProfileRoot, 'extensionsResource'),
            cacheHome: (0, resources_1.$ig)(inMemoryExtraProfileRoot, 'cache')
        };
        const storageService = disposables.add(new storageService_1.$z2b({ id: 'workspace-storage-test' }, disposables.add(new userDataProfileService_1.$I2b(inMemoryExtraProfile)), logService));
        await storageService.initialize();
        return [disposables, storageService];
    }
    (0, testUtils_1.$hT)('StorageService (browser)', function () {
        const disposables = new lifecycle_1.$jc();
        let storageService;
        (0, storageService_test_1.$K$b)({
            setup: async () => {
                const res = await createStorageService();
                disposables.add(res[0]);
                storageService = res[1];
                return storageService;
            },
            teardown: async () => {
                await storageService.clear();
                disposables.clear();
            }
        });
        (0, utils_1.$bT)();
    });
    (0, testUtils_1.$hT)('StorageService (browser specific)', () => {
        const disposables = new lifecycle_1.$jc();
        let storageService;
        setup(async () => {
            const res = await createStorageService();
            disposables.add(res[0]);
            storageService = res[1];
        });
        teardown(async () => {
            await storageService.clear();
            disposables.clear();
        });
        test.skip('clear', () => {
            return (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                storageService.store('bar', 'foo', -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                storageService.store('bar', 3, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                storageService.store('bar', 'foo', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                storageService.store('bar', 3, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                storageService.store('bar', 'foo', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                storageService.store('bar', 3, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
                await storageService.clear();
                for (const scope of [-1 /* StorageScope.APPLICATION */, 0 /* StorageScope.PROFILE */, 1 /* StorageScope.WORKSPACE */]) {
                    for (const target of [0 /* StorageTarget.USER */, 1 /* StorageTarget.MACHINE */]) {
                        (0, assert_1.strictEqual)(storageService.get('bar', scope), undefined);
                        (0, assert_1.strictEqual)(storageService.keys(scope, target).length, 0);
                    }
                }
            });
        });
        (0, utils_1.$bT)();
    });
    (0, testUtils_1.$hT)('IndexDBStorageDatabase (browser)', () => {
        const id = 'workspace-storage-db-test';
        const logService = new log_1.$fj();
        const disposables = new lifecycle_1.$jc();
        teardown(async () => {
            const storage = disposables.add(await storageService_1.$A2b.create({ id }, logService));
            await storage.clear();
            disposables.clear();
        });
        test('Basics', async () => {
            let storage = disposables.add(new storage_1.$Ro(disposables.add(await storageService_1.$A2b.create({ id }, logService))));
            await storage.init();
            // Insert initial data
            storage.set('bar', 'foo');
            storage.set('barNumber', 55);
            storage.set('barBoolean', true);
            storage.set('barUndefined', undefined);
            storage.set('barNull', null);
            (0, assert_1.strictEqual)(storage.get('bar'), 'foo');
            (0, assert_1.strictEqual)(storage.get('barNumber'), '55');
            (0, assert_1.strictEqual)(storage.get('barBoolean'), 'true');
            (0, assert_1.strictEqual)(storage.get('barUndefined'), undefined);
            (0, assert_1.strictEqual)(storage.get('barNull'), undefined);
            (0, assert_1.strictEqual)(storage.size, 3);
            (0, assert_1.strictEqual)(storage.items.size, 3);
            await storage.close();
            storage = disposables.add(new storage_1.$Ro(disposables.add(await storageService_1.$A2b.create({ id }, logService))));
            await storage.init();
            // Check initial data still there
            (0, assert_1.strictEqual)(storage.get('bar'), 'foo');
            (0, assert_1.strictEqual)(storage.get('barNumber'), '55');
            (0, assert_1.strictEqual)(storage.get('barBoolean'), 'true');
            (0, assert_1.strictEqual)(storage.get('barUndefined'), undefined);
            (0, assert_1.strictEqual)(storage.get('barNull'), undefined);
            (0, assert_1.strictEqual)(storage.size, 3);
            (0, assert_1.strictEqual)(storage.items.size, 3);
            // Update data
            storage.set('bar', 'foo2');
            storage.set('barNumber', 552);
            (0, assert_1.strictEqual)(storage.get('bar'), 'foo2');
            (0, assert_1.strictEqual)(storage.get('barNumber'), '552');
            await storage.close();
            storage = disposables.add(new storage_1.$Ro(disposables.add(await storageService_1.$A2b.create({ id }, logService))));
            await storage.init();
            // Check initial data still there
            (0, assert_1.strictEqual)(storage.get('bar'), 'foo2');
            (0, assert_1.strictEqual)(storage.get('barNumber'), '552');
            (0, assert_1.strictEqual)(storage.get('barBoolean'), 'true');
            (0, assert_1.strictEqual)(storage.get('barUndefined'), undefined);
            (0, assert_1.strictEqual)(storage.get('barNull'), undefined);
            (0, assert_1.strictEqual)(storage.size, 3);
            (0, assert_1.strictEqual)(storage.items.size, 3);
            // Delete data
            storage.delete('bar');
            storage.delete('barNumber');
            storage.delete('barBoolean');
            (0, assert_1.strictEqual)(storage.get('bar', 'undefined'), 'undefined');
            (0, assert_1.strictEqual)(storage.get('barNumber', 'undefinedNumber'), 'undefinedNumber');
            (0, assert_1.strictEqual)(storage.get('barBoolean', 'undefinedBoolean'), 'undefinedBoolean');
            (0, assert_1.strictEqual)(storage.size, 0);
            (0, assert_1.strictEqual)(storage.items.size, 0);
            await storage.close();
            storage = disposables.add(new storage_1.$Ro(disposables.add(await storageService_1.$A2b.create({ id }, logService))));
            await storage.init();
            (0, assert_1.strictEqual)(storage.get('bar', 'undefined'), 'undefined');
            (0, assert_1.strictEqual)(storage.get('barNumber', 'undefinedNumber'), 'undefinedNumber');
            (0, assert_1.strictEqual)(storage.get('barBoolean', 'undefinedBoolean'), 'undefinedBoolean');
            (0, assert_1.strictEqual)(storage.size, 0);
            (0, assert_1.strictEqual)(storage.items.size, 0);
        });
        test('Clear', async () => {
            let storage = disposables.add(new storage_1.$Ro(disposables.add(await storageService_1.$A2b.create({ id }, logService))));
            await storage.init();
            storage.set('bar', 'foo');
            storage.set('barNumber', 55);
            storage.set('barBoolean', true);
            await storage.close();
            const db = disposables.add(await storageService_1.$A2b.create({ id }, logService));
            storage = disposables.add(new storage_1.$Ro(db));
            await storage.init();
            await db.clear();
            storage = disposables.add(new storage_1.$Ro(disposables.add(await storageService_1.$A2b.create({ id }, logService))));
            await storage.init();
            (0, assert_1.strictEqual)(storage.get('bar'), undefined);
            (0, assert_1.strictEqual)(storage.get('barNumber'), undefined);
            (0, assert_1.strictEqual)(storage.get('barBoolean'), undefined);
            (0, assert_1.strictEqual)(storage.size, 0);
            (0, assert_1.strictEqual)(storage.items.size, 0);
        });
        test('Inserts and Deletes at the same time', async () => {
            let storage = disposables.add(new storage_1.$Ro(disposables.add(await storageService_1.$A2b.create({ id }, logService))));
            await storage.init();
            storage.set('bar', 'foo');
            storage.set('barNumber', 55);
            storage.set('barBoolean', true);
            await storage.close();
            storage = disposables.add(new storage_1.$Ro(disposables.add(await storageService_1.$A2b.create({ id }, logService))));
            await storage.init();
            storage.set('bar', 'foobar');
            const largeItem = JSON.stringify({ largeItem: 'Hello World'.repeat(1000) });
            storage.set('largeItem', largeItem);
            storage.delete('barNumber');
            storage.delete('barBoolean');
            await storage.close();
            storage = disposables.add(new storage_1.$Ro(disposables.add(await storageService_1.$A2b.create({ id }, logService))));
            await storage.init();
            (0, assert_1.strictEqual)(storage.get('bar'), 'foobar');
            (0, assert_1.strictEqual)(storage.get('largeItem'), largeItem);
            (0, assert_1.strictEqual)(storage.get('barNumber'), undefined);
            (0, assert_1.strictEqual)(storage.get('barBoolean'), undefined);
        });
        test('Storage change event', async () => {
            const storage = disposables.add(new storage_1.$Ro(disposables.add(await storageService_1.$A2b.create({ id }, logService))));
            let storageChangeEvents = [];
            disposables.add(storage.onDidChangeStorage(e => storageChangeEvents.push(e)));
            await storage.init();
            storage.set('notExternal', 42);
            let storageValueChangeEvent = storageChangeEvents.find(e => e.key === 'notExternal');
            (0, assert_1.strictEqual)(storageValueChangeEvent?.external, false);
            storageChangeEvents = [];
            storage.set('isExternal', 42, true);
            storageValueChangeEvent = storageChangeEvents.find(e => e.key === 'isExternal');
            (0, assert_1.strictEqual)(storageValueChangeEvent?.external, true);
            storage.delete('notExternal');
            storageValueChangeEvent = storageChangeEvents.find(e => e.key === 'notExternal');
            (0, assert_1.strictEqual)(storageValueChangeEvent?.external, false);
            storage.delete('isExternal', true);
            storageValueChangeEvent = storageChangeEvents.find(e => e.key === 'isExternal');
            (0, assert_1.strictEqual)(storageValueChangeEvent?.external, true);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=storageService.test.js.map