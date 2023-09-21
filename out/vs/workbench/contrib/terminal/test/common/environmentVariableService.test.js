/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/contrib/terminal/common/environmentVariableService", "vs/platform/terminal/common/environmentVariable", "vs/platform/storage/common/storage", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/services/extensions/common/extensions", "vs/base/common/event", "vs/workbench/services/history/common/history", "vs/base/common/uri", "vs/base/test/common/utils"], function (require, exports, assert_1, workbenchTestServices_1, environmentVariableService_1, environmentVariable_1, storage_1, instantiationServiceMock_1, extensions_1, event_1, history_1, uri_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestEnvironmentVariableService extends environmentVariableService_1.EnvironmentVariableService {
        persistCollections() { this._persistCollections(); }
        notifyCollectionUpdates() { this._notifyCollectionUpdates(); }
    }
    suite('EnvironmentVariable - EnvironmentVariableService', () => {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let instantiationService;
        let environmentVariableService;
        let storageService;
        let historyService;
        let changeExtensionsEvent;
        setup(() => {
            changeExtensionsEvent = store.add(new event_1.Emitter());
            instantiationService = store.add(new instantiationServiceMock_1.TestInstantiationService());
            instantiationService.stub(extensions_1.IExtensionService, workbenchTestServices_1.TestExtensionService);
            storageService = store.add(new workbenchTestServices_1.TestStorageService());
            historyService = new workbenchTestServices_1.TestHistoryService();
            instantiationService.stub(storage_1.IStorageService, storageService);
            instantiationService.stub(extensions_1.IExtensionService, workbenchTestServices_1.TestExtensionService);
            instantiationService.stub(extensions_1.IExtensionService, 'onDidChangeExtensions', changeExtensionsEvent.event);
            instantiationService.stub(extensions_1.IExtensionService, 'extensions', [
                { identifier: { value: 'ext1' } },
                { identifier: { value: 'ext2' } },
                { identifier: { value: 'ext3' } }
            ]);
            instantiationService.stub(history_1.IHistoryService, historyService);
            environmentVariableService = store.add(instantiationService.createInstance(TestEnvironmentVariableService));
        });
        test('should persist collections to the storage service and be able to restore from them', () => {
            const collection = new Map();
            collection.set('A-key', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' });
            collection.set('B-key', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'B' });
            collection.set('C-key', { value: 'c', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'C', options: { applyAtProcessCreation: true, applyAtShellIntegration: true } });
            environmentVariableService.set('ext1', { map: collection, persistent: true });
            (0, assert_1.deepStrictEqual)([...environmentVariableService.mergedCollection.getVariableMap(undefined).entries()], [
                ['A', [{ extensionIdentifier: 'ext1', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, value: 'a', variable: 'A', options: undefined }]],
                ['B', [{ extensionIdentifier: 'ext1', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, value: 'b', variable: 'B', options: undefined }]],
                ['C', [{ extensionIdentifier: 'ext1', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, value: 'c', variable: 'C', options: { applyAtProcessCreation: true, applyAtShellIntegration: true } }]]
            ]);
            // Persist with old service, create a new service with the same storage service to verify restore
            environmentVariableService.persistCollections();
            const service2 = store.add(instantiationService.createInstance(TestEnvironmentVariableService));
            (0, assert_1.deepStrictEqual)([...service2.mergedCollection.getVariableMap(undefined).entries()], [
                ['A', [{ extensionIdentifier: 'ext1', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, value: 'a', variable: 'A', options: undefined }]],
                ['B', [{ extensionIdentifier: 'ext1', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, value: 'b', variable: 'B', options: undefined }]],
                ['C', [{ extensionIdentifier: 'ext1', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, value: 'c', variable: 'C', options: { applyAtProcessCreation: true, applyAtShellIntegration: true } }]]
            ]);
        });
        suite('mergedCollection', () => {
            test('should overwrite any other variable with the first extension that replaces', () => {
                const collection1 = new Map();
                const collection2 = new Map();
                const collection3 = new Map();
                collection1.set('A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' });
                collection1.set('B-key', { value: 'b1', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'B' });
                collection2.set('A-key', { value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' });
                collection2.set('B-key', { value: 'b2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'B' });
                collection3.set('A-key', { value: 'a3', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'A' });
                collection3.set('B-key', { value: 'b3', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'B' });
                environmentVariableService.set('ext1', { map: collection1, persistent: true });
                environmentVariableService.set('ext2', { map: collection2, persistent: true });
                environmentVariableService.set('ext3', { map: collection3, persistent: true });
                (0, assert_1.deepStrictEqual)([...environmentVariableService.mergedCollection.getVariableMap(undefined).entries()], [
                    ['A', [
                            { extensionIdentifier: 'ext2', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, value: 'a2', variable: 'A', options: undefined },
                            { extensionIdentifier: 'ext1', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, value: 'a1', variable: 'A', options: undefined }
                        ]],
                    ['B', [{ extensionIdentifier: 'ext1', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, value: 'b1', variable: 'B', options: undefined }]]
                ]);
            });
            test('should correctly apply the environment values from multiple extension contributions in the correct order', async () => {
                const collection1 = new Map();
                const collection2 = new Map();
                const collection3 = new Map();
                collection1.set('A-key', { value: ':a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' });
                collection2.set('A-key', { value: 'a2:', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'A' });
                collection3.set('A-key', { value: 'a3', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' });
                environmentVariableService.set('ext1', { map: collection1, persistent: true });
                environmentVariableService.set('ext2', { map: collection2, persistent: true });
                environmentVariableService.set('ext3', { map: collection3, persistent: true });
                // The entries should be ordered in the order they are applied
                (0, assert_1.deepStrictEqual)([...environmentVariableService.mergedCollection.getVariableMap(undefined).entries()], [
                    ['A', [
                            { extensionIdentifier: 'ext3', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, value: 'a3', variable: 'A', options: undefined },
                            { extensionIdentifier: 'ext2', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, value: 'a2:', variable: 'A', options: undefined },
                            { extensionIdentifier: 'ext1', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, value: ':a1', variable: 'A', options: undefined }
                        ]]
                ]);
                // Verify the entries get applied to the environment as expected
                const env = { A: 'foo' };
                await environmentVariableService.mergedCollection.applyToProcessEnvironment(env, undefined);
                (0, assert_1.deepStrictEqual)(env, { A: 'a2:a3:a1' });
            });
            test('should correctly apply the workspace specific environment values from multiple extension contributions in the correct order', async () => {
                const scope1 = { workspaceFolder: { uri: uri_1.URI.file('workspace1'), name: 'workspace1', index: 0 } };
                const scope2 = { workspaceFolder: { uri: uri_1.URI.file('workspace2'), name: 'workspace2', index: 3 } };
                const collection1 = new Map();
                const collection2 = new Map();
                const collection3 = new Map();
                collection1.set('A-key', { value: ':a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, scope: scope1, variable: 'A' });
                collection2.set('A-key', { value: 'a2:', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'A' });
                collection3.set('A-key', { value: 'a3', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, scope: scope2, variable: 'A' });
                environmentVariableService.set('ext1', { map: collection1, persistent: true });
                environmentVariableService.set('ext2', { map: collection2, persistent: true });
                environmentVariableService.set('ext3', { map: collection3, persistent: true });
                // The entries should be ordered in the order they are applied
                (0, assert_1.deepStrictEqual)([...environmentVariableService.mergedCollection.getVariableMap(scope1).entries()], [
                    ['A', [
                            { extensionIdentifier: 'ext2', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, value: 'a2:', variable: 'A', options: undefined },
                            { extensionIdentifier: 'ext1', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, value: ':a1', scope: scope1, variable: 'A', options: undefined }
                        ]]
                ]);
                // Verify the entries get applied to the environment as expected
                const env = { A: 'foo' };
                await environmentVariableService.mergedCollection.applyToProcessEnvironment(env, scope1);
                (0, assert_1.deepStrictEqual)(env, { A: 'a2:foo:a1' });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRWYXJpYWJsZVNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL3Rlc3QvY29tbW9uL2Vudmlyb25tZW50VmFyaWFibGVTZXJ2aWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFlaEcsTUFBTSw4QkFBK0IsU0FBUSx1REFBMEI7UUFDdEUsa0JBQWtCLEtBQVcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFELHVCQUF1QixLQUFXLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNwRTtJQUVELEtBQUssQ0FBQyxrREFBa0QsRUFBRSxHQUFHLEVBQUU7UUFDOUQsTUFBTSxLQUFLLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRXhELElBQUksb0JBQThDLENBQUM7UUFDbkQsSUFBSSwwQkFBMEQsQ0FBQztRQUMvRCxJQUFJLGNBQWtDLENBQUM7UUFDdkMsSUFBSSxjQUFrQyxDQUFDO1FBQ3ZDLElBQUkscUJBQW9DLENBQUM7UUFFekMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBRXZELG9CQUFvQixHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxtREFBd0IsRUFBRSxDQUFDLENBQUM7WUFDakUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDhCQUFpQixFQUFFLDRDQUFvQixDQUFDLENBQUM7WUFDbkUsY0FBYyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSwwQ0FBa0IsRUFBRSxDQUFDLENBQUM7WUFDckQsY0FBYyxHQUFHLElBQUksMENBQWtCLEVBQUUsQ0FBQztZQUMxQyxvQkFBb0IsQ0FB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