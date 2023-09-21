/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/workbench/common/memento", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, lifecycle_1, utils_1, memento_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Memento', () => {
        const disposables = new lifecycle_1.$jc();
        let storage;
        setup(() => {
            storage = disposables.add(new workbenchTestServices_1.$7dc());
            memento_1.$YT.clear(-1 /* StorageScope.APPLICATION */);
            memento_1.$YT.clear(0 /* StorageScope.PROFILE */);
            memento_1.$YT.clear(1 /* StorageScope.WORKSPACE */);
        });
        teardown(() => {
            disposables.clear();
        });
        test('Loading and Saving Memento with Scopes', () => {
            const myMemento = new memento_1.$YT('memento.test', storage);
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
            const myMemento = new memento_1.$YT('memento.test', storage);
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
            const myMemento = new memento_1.$YT('memento.test', storage);
            const myMemento2 = new memento_1.$YT('memento.test', storage);
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
            let myMemento = new memento_1.$YT('memento.test', storage);
            // Profile
            let profileMemento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            profileMemento.foo = 'Hello World';
            // Workspace
            let workspaceMemento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            workspaceMemento.bar = 'Hello World';
            myMemento.saveMemento();
            // Clear
            storage = disposables.add(new workbenchTestServices_1.$7dc());
            memento_1.$YT.clear(0 /* StorageScope.PROFILE */);
            memento_1.$YT.clear(1 /* StorageScope.WORKSPACE */);
            myMemento = new memento_1.$YT('memento.test', storage);
            profileMemento = myMemento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            workspaceMemento = myMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            assert.deepStrictEqual(profileMemento, {});
            assert.deepStrictEqual(workspaceMemento, {});
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=memento.test.js.map