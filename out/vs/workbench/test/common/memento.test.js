/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/workbench/common/memento", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, lifecycle_1, utils_1, memento_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Memento', () => {
        const disposables = new lifecycle_1.DisposableStore();
        let storage;
        setup(() => {
            storage = disposables.add(new workbenchTestServices_1.TestStorageService());
            memento_1.Memento.clear(-1 /* StorageScope.APPLICATION */);
            memento_1.Memento.clear(0 /* StorageScope.PROFILE */);
            memento_1.Memento.clear(1 /* StorageScope.WORKSPACE */);
        });
        teardown(() => {
            disposables.clear();
        });
        test('Loading and Saving Memento with Scopes', () => {
            const myMemento = new memento_1.Memento('memento.test', storage);
            // Application
            let memento = myMemento.getMemento(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            memento.foo = [1, 2, 3];
            let applicationMemento = myMemento.getMemento(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(applicationMemento, memento);
            // Profile
            memento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            memento.foo = [4, 5, 6];
            let profileMemento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(profileMemento, memento);
            // Workspace
            memento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert(memento);
            memento.foo = 'Hello World';
            myMemento.saveMemento();
            // Application
            memento = myMemento.getMemento(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, { foo: [1, 2, 3] });
            applicationMemento = myMemento.getMemento(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(applicationMemento, memento);
            // Profile
            memento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, { foo: [4, 5, 6] });
            profileMemento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(profileMemento, memento);
            // Workspace
            memento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, { foo: 'Hello World' });
            // Assert the Mementos are stored properly in storage
            assert.deepStrictEqual(JSON.parse(storage.get('memento/memento.test', -1 /* StorageScope.APPLICATION */)), { foo: [1, 2, 3] });
            assert.deepStrictEqual(JSON.parse(storage.get('memento/memento.test', 0 /* StorageScope.PROFILE */)), { foo: [4, 5, 6] });
            assert.deepStrictEqual(JSON.parse(storage.get('memento/memento.test', 1 /* StorageScope.WORKSPACE */)), { foo: 'Hello World' });
            // Delete Application
            memento = myMemento.getMemento(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            delete memento.foo;
            // Delete Profile
            memento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            delete memento.foo;
            // Delete Workspace
            memento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            delete memento.foo;
            myMemento.saveMemento();
            // Application
            memento = myMemento.getMemento(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, {});
            // Profile
            memento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, {});
            // Workspace
            memento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, {});
            // Assert the Mementos are also removed from storage
            assert.strictEqual(storage.get('memento/memento.test', -1 /* StorageScope.APPLICATION */, null), null);
            assert.strictEqual(storage.get('memento/memento.test', 0 /* StorageScope.PROFILE */, null), null);
            assert.strictEqual(storage.get('memento/memento.test', 1 /* StorageScope.WORKSPACE */, null), null);
        });
        test('Save and Load', () => {
            const myMemento = new memento_1.Memento('memento.test', storage);
            // Profile
            let memento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            memento.foo = [1, 2, 3];
            // Workspace
            memento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert(memento);
            memento.foo = 'Hello World';
            myMemento.saveMemento();
            // Profile
            memento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, { foo: [1, 2, 3] });
            let profileMemento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(profileMemento, memento);
            // Workspace
            memento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, { foo: 'Hello World' });
            // Profile
            memento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            memento.foo = [4, 5, 6];
            // Workspace
            memento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert(memento);
            memento.foo = 'World Hello';
            myMemento.saveMemento();
            // Profile
            memento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, { foo: [4, 5, 6] });
            profileMemento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(profileMemento, memento);
            // Workspace
            memento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, { foo: 'World Hello' });
            // Delete Profile
            memento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            delete memento.foo;
            // Delete Workspace
            memento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            delete memento.foo;
            myMemento.saveMemento();
            // Profile
            memento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, {});
            // Workspace
            memento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, {});
        });
        test('Save and Load - 2 Components with same id', () => {
            const myMemento = new memento_1.Memento('memento.test', storage);
            const myMemento2 = new memento_1.Memento('memento.test', storage);
            // Profile
            let memento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            memento.foo = [1, 2, 3];
            memento = myMemento2.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            memento.bar = [1, 2, 3];
            // Workspace
            memento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert(memento);
            memento.foo = 'Hello World';
            memento = myMemento2.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert(memento);
            memento.bar = 'Hello World';
            myMemento.saveMemento();
            myMemento2.saveMemento();
            // Profile
            memento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, { foo: [1, 2, 3], bar: [1, 2, 3] });
            let profileMemento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(profileMemento, memento);
            memento = myMemento2.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, { foo: [1, 2, 3], bar: [1, 2, 3] });
            profileMemento = myMemento2.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(profileMemento, memento);
            // Workspace
            memento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, { foo: 'Hello World', bar: 'Hello World' });
            memento = myMemento2.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(memento, { foo: 'Hello World', bar: 'Hello World' });
        });
        test('Clear Memento', () => {
            let myMemento = new memento_1.Memento('memento.test', storage);
            // Profile
            let profileMemento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            profileMemento.foo = 'Hello World';
            // Workspace
            let workspaceMemento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            workspaceMemento.bar = 'Hello World';
            myMemento.saveMemento();
            // Clear
            storage = disposables.add(new workbenchTestServices_1.TestStorageService());
            memento_1.Memento.clear(0 /* StorageScope.PROFILE */);
            memento_1.Memento.clear(1 /* StorageScope.WORKSPACE */);
            myMemento = new memento_1.Memento('memento.test', storage);
            profileMemento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            workspaceMemento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(profileMemento, {});
            assert.deepStrictEqual(workspaceMemento, {});
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtZW50by50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3Rlc3QvY29tbW9uL21lbWVudG8udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVNoRyxLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtRQUNyQixNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUMxQyxJQUFJLE9BQXdCLENBQUM7UUFFN0IsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLE9BQU8sR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksMENBQWtCLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELGlCQUFPLENBQUMsS0FBSyxtQ0FBMEIsQ0FBQztZQUN4QyxpQkFBTyxDQUFDLEtBQUssOEJBQXNCLENBQUM7WUFDcEMsaUJBQU8sQ0FBQyxLQUFLLGdDQUF3QixDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7WUFDbkQsTUFBTSxTQUFTLEdBQUcsSUFBSSxpQkFBTyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV2RCxjQUFjO1lBQ2QsSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLFVBQVUsa0VBQWlELENBQUM7WUFDcEYsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsVUFBVSxrRUFBaUQsQ0FBQztZQUMvRixNQUFNLENBQUMsZUFBZSxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRXBELFVB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