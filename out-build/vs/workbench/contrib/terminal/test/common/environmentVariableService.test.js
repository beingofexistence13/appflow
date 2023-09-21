/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/contrib/terminal/common/environmentVariableService", "vs/platform/terminal/common/environmentVariable", "vs/platform/storage/common/storage", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/services/extensions/common/extensions", "vs/base/common/event", "vs/workbench/services/history/common/history", "vs/base/common/uri", "vs/base/test/common/utils"], function (require, exports, assert_1, workbenchTestServices_1, environmentVariableService_1, environmentVariable_1, storage_1, instantiationServiceMock_1, extensions_1, event_1, history_1, uri_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestEnvironmentVariableService extends environmentVariableService_1.$sWb {
        persistCollections() { this.j(); }
        notifyCollectionUpdates() { this.n(); }
    }
    suite('EnvironmentVariable - EnvironmentVariableService', () => {
        const store = (0, utils_1.$bT)();
        let instantiationService;
        let environmentVariableService;
        let storageService;
        let historyService;
        let changeExtensionsEvent;
        setup(() => {
            changeExtensionsEvent = store.add(new event_1.$fd());
            instantiationService = store.add(new instantiationServiceMock_1.$L0b());
            instantiationService.stub(extensions_1.$MF, workbenchTestServices_1.$aec);
            storageService = store.add(new workbenchTestServices_1.$7dc());
            historyService = new workbenchTestServices_1.$8dc();
            instantiationService.stub(storage_1.$Vo, storageService);
            instantiationService.stub(extensions_1.$MF, workbenchTestServices_1.$aec);
            instantiationService.stub(extensions_1.$MF, 'onDidChangeExtensions', changeExtensionsEvent.event);
            instantiationService.stub(extensions_1.$MF, 'extensions', [
                { identifier: { value: 'ext1' } },
                { identifier: { value: 'ext2' } },
                { identifier: { value: 'ext3' } }
            ]);
            instantiationService.stub(history_1.$SM, historyService);
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
//# sourceMappingURL=environmentVariableService.test.js.map