/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/base/test/common/utils", "vs/platform/log/common/log", "vs/platform/secrets/common/secrets", "vs/platform/storage/common/storage"], function (require, exports, assert, sinon, utils_1, log_1, secrets_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestEncryptionService {
        constructor() {
            this.encryptedPrefix = 'encrypted+'; // prefix to simulate encryption
        }
        setUsePlainTextEncryption() {
            return Promise.resolve();
        }
        getKeyStorageProvider() {
            return Promise.resolve("basic_text" /* KnownStorageProvider.basicText */);
        }
        encrypt(value) {
            return Promise.resolve(this.encryptedPrefix + value);
        }
        decrypt(value) {
            return Promise.resolve(value.substring(this.encryptedPrefix.length));
        }
        isEncryptionAvailable() {
            return Promise.resolve(true);
        }
    }
    class TestNoEncryptionService {
        setUsePlainTextEncryption() {
            throw new Error('Method not implemented.');
        }
        getKeyStorageProvider() {
            throw new Error('Method not implemented.');
        }
        encrypt(value) {
            throw new Error('Method not implemented.');
        }
        decrypt(value) {
            throw new Error('Method not implemented.');
        }
        isEncryptionAvailable() {
            return Promise.resolve(false);
        }
    }
    suite('secrets', () => {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('BaseSecretStorageService useInMemoryStorage=true', () => {
            let service;
            let spyEncryptionService;
            let sandbox;
            setup(() => {
                sandbox = sinon.createSandbox();
                spyEncryptionService = sandbox.spy(new TestEncryptionService());
                service = store.add(new secrets_1.BaseSecretStorageService(true, store.add(new storage_1.InMemoryStorageService()), spyEncryptionService, store.add(new log_1.NullLogService())));
            });
            teardown(() => {
                sandbox.restore();
            });
            test('type', async () => {
                assert.strictEqual(service.type, 'unknown');
                // trigger lazy initialization
                await service.set('my-secret', 'my-secret-value');
                assert.strictEqual(service.type, 'in-memory');
            });
            test('set and get', async () => {
                const key = 'my-secret';
                const value = 'my-secret-value';
                await service.set(key, value);
                const result = await service.get(key);
                assert.strictEqual(result, value);
                // Additionally ensure the encryptionservice was not used
                assert.strictEqual(spyEncryptionService.encrypt.callCount, 0);
                assert.strictEqual(spyEncryptionService.decrypt.callCount, 0);
            });
            test('delete', async () => {
                const key = 'my-secret';
                const value = 'my-secret-value';
                await service.set(key, value);
                await service.delete(key);
                const result = await service.get(key);
                assert.strictEqual(result, undefined);
            });
            test('onDidChangeSecret', async () => {
                const key = 'my-secret';
                const value = 'my-secret-value';
                let eventFired = false;
                store.add(service.onDidChangeSecret((changedKey) => {
                    assert.strictEqual(changedKey, key);
                    eventFired = true;
                }));
                await service.set(key, value);
                assert.strictEqual(eventFired, true);
            });
        });
        suite('BaseSecretStorageService useInMemoryStorage=false', () => {
            let service;
            let spyEncryptionService;
            let sandbox;
            setup(() => {
                sandbox = sinon.createSandbox();
                spyEncryptionService = sandbox.spy(new TestEncryptionService());
                service = store.add(new secrets_1.BaseSecretStorageService(false, store.add(new storage_1.InMemoryStorageService()), spyEncryptionService, store.add(new log_1.NullLogService())));
            });
            teardown(() => {
                sandbox.restore();
            });
            test('type', async () => {
                assert.strictEqual(service.type, 'unknown');
                // trigger lazy initialization
                await service.set('my-secret', 'my-secret-value');
                assert.strictEqual(service.type, 'persisted');
            });
            test('set and get', async () => {
                const key = 'my-secret';
                const value = 'my-secret-value';
                await service.set(key, value);
                const result = await service.get(key);
                assert.strictEqual(result, value);
                // Additionally ensure the encryptionservice was not used
                assert.strictEqual(spyEncryptionService.encrypt.callCount, 1);
                assert.strictEqual(spyEncryptionService.decrypt.callCount, 1);
            });
            test('delete', async () => {
                const key = 'my-secret';
                const value = 'my-secret-value';
                await service.set(key, value);
                await service.delete(key);
                const result = await service.get(key);
                assert.strictEqual(result, undefined);
            });
            test('onDidChangeSecret', async () => {
                const key = 'my-secret';
                const value = 'my-secret-value';
                let eventFired = false;
                store.add(service.onDidChangeSecret((changedKey) => {
                    assert.strictEqual(changedKey, key);
                    eventFired = true;
                }));
                await service.set(key, value);
                assert.strictEqual(eventFired, true);
            });
        });
        suite('BaseSecretStorageService useInMemoryStorage=false, encryption not available', () => {
            let service;
            let spyNoEncryptionService;
            let sandbox;
            setup(() => {
                sandbox = sinon.createSandbox();
                spyNoEncryptionService = sandbox.spy(new TestNoEncryptionService());
                service = store.add(new secrets_1.BaseSecretStorageService(false, store.add(new storage_1.InMemoryStorageService()), spyNoEncryptionService, store.add(new log_1.NullLogService())));
            });
            teardown(() => {
                sandbox.restore();
            });
            test('type', async () => {
                assert.strictEqual(service.type, 'unknown');
                // trigger lazy initialization
                await service.set('my-secret', 'my-secret-value');
                assert.strictEqual(service.type, 'in-memory');
            });
            test('set and get', async () => {
                const key = 'my-secret';
                const value = 'my-secret-value';
                await service.set(key, value);
                const result = await service.get(key);
                assert.strictEqual(result, value);
                // Additionally ensure the encryptionservice was not used
                assert.strictEqual(spyNoEncryptionService.encrypt.callCount, 0);
                assert.strictEqual(spyNoEncryptionService.decrypt.callCount, 0);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0cy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vc2VjcmV0cy90ZXN0L2NvbW1vbi9zZWNyZXRzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFVaEcsTUFBTSxxQkFBcUI7UUFBM0I7WUFFUyxvQkFBZSxHQUFHLFlBQVksQ0FBQyxDQUFDLGdDQUFnQztRQWdCekUsQ0FBQztRQWZBLHlCQUF5QjtZQUN4QixPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBQ0QscUJBQXFCO1lBQ3BCLE9BQU8sT0FBTyxDQUFDLE9BQU8sbURBQWdDLENBQUM7UUFDeEQsQ0FBQztRQUNELE9BQU8sQ0FBQyxLQUFhO1lBQ3BCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFDRCxPQUFPLENBQUMsS0FBYTtZQUNwQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUNELHFCQUFxQjtZQUNwQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsQ0FBQztLQUNEO0lBRUQsTUFBTSx1QkFBdUI7UUFFNUIseUJBQXlCO1lBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBQ0QscUJBQXFCO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBQ0QsT0FBTyxDQUFDLEtBQWE7WUFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFD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