/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/storage/common/storage"], function (require, exports, assert_1, lifecycle_1, utils_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createSuite = void 0;
    function createSuite(params) {
        let storageService;
        const disposables = new lifecycle_1.DisposableStore();
        setup(async () => {
            storageService = await params.setup();
        });
        teardown(() => {
            disposables.clear();
            return params.teardown(storageService);
        });
        test('Get Data, Integer, Boolean (application)', () => {
            storeData(-1 /* StorageScope.APPLICATION */);
        });
        test('Get Data, Integer, Boolean (profile)', () => {
            storeData(0 /* StorageScope.PROFILE */);
        });
        test('Get Data, Integer, Boolean, Object (workspace)', () => {
            storeData(1 /* StorageScope.WORKSPACE */);
        });
        test('Storage change source', () => {
            const storageValueChangeEvents = [];
            storageService.onDidChangeValue(1 /* StorageScope.WORKSPACE */, undefined, disposables)(e => storageValueChangeEvents.push(e), undefined, disposables);
            // Explicit external source
            storageService.storeAll([{ key: 'testExternalChange', value: 'foobar', scope: 1 /* StorageScope.WORKSPACE */, target: 1 /* StorageTarget.MACHINE */ }], true);
            let storageValueChangeEvent = storageValueChangeEvents.find(e => e.key === 'testExternalChange');
            (0, assert_1.strictEqual)(storageValueChangeEvent?.external, true);
            // Default source
            storageService.storeAll([{ key: 'testChange', value: 'barfoo', scope: 1 /* StorageScope.WORKSPACE */, target: 1 /* StorageTarget.MACHINE */ }], false);
            storageValueChangeEvent = storageValueChangeEvents.find(e => e.key === 'testChange');
            (0, assert_1.strictEqual)(storageValueChangeEvent?.external, false);
            storageService.store('testChange', 'foobar', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            storageValueChangeEvent = storageValueChangeEvents.find(e => e.key === 'testChange');
            (0, assert_1.strictEqual)(storageValueChangeEvent?.external, false);
        });
        test('Storage change event scope (all keys)', () => {
            const storageValueChangeEvents = [];
            storageService.onDidChangeValue(1 /* StorageScope.WORKSPACE */, undefined, disposables)(e => storageValueChangeEvents.push(e), undefined, disposables);
            storageService.store('testChange', 'foobar', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('testChange2', 'foobar', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('testChange', 'foobar', -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            storageService.store('testChange', 'foobar', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('testChange2', 'foobar', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            (0, assert_1.strictEqual)(storageValueChangeEvents.length, 2);
        });
        test('Storage change event scope (specific key)', () => {
            const storageValueChangeEvents = [];
            storageService.onDidChangeValue(1 /* StorageScope.WORKSPACE */, 'testChange', disposables)(e => storageValueChangeEvents.push(e), undefined, disposables);
            storageService.store('testChange', 'foobar', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            storageService.store('testChange', 'foobar', 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            storageService.store('testChange', 'foobar', -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            storageService.store('testChange2', 'foobar', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            const storageValueChangeEvent = storageValueChangeEvents.find(e => e.key === 'testChange');
            (0, assert_1.ok)(storageValueChangeEvent);
            (0, assert_1.strictEqual)(storageValueChangeEvents.length, 1);
        });
        function storeData(scope) {
            let storageValueChangeEvents = [];
            storageService.onDidChangeValue(scope, undefined, disposables)(e => storageValueChangeEvents.push(e), undefined, disposables);
            (0, assert_1.strictEqual)(storageService.get('test.get', scope, 'foobar'), 'foobar');
            (0, assert_1.strictEqual)(storageService.get('test.get', scope, ''), '');
            (0, assert_1.strictEqual)(storageService.getNumber('test.getNumber', scope, 5), 5);
            (0, assert_1.strictEqual)(storageService.getNumber('test.getNumber', scope, 0), 0);
            (0, assert_1.strictEqual)(storageService.getBoolean('test.getBoolean', scope, true), true);
            (0, assert_1.strictEqual)(storageService.getBoolean('test.getBoolean', scope, false), false);
            (0, assert_1.deepStrictEqual)(storageService.getObject('test.getObject', scope, { 'foo': 'bar' }), { 'foo': 'bar' });
            (0, assert_1.deepStrictEqual)(storageService.getObject('test.getObject', scope, {}), {});
            (0, assert_1.deepStrictEqual)(storageService.getObject('test.getObject', scope, []), []);
            storageService.store('test.get', 'foobar', scope, 1 /* StorageTarget.MACHINE */);
            (0, assert_1.strictEqual)(storageService.get('test.get', scope, (undefined)), 'foobar');
            let storageValueChangeEvent = storageValueChangeEvents.find(e => e.key === 'test.get');
            (0, assert_1.strictEqual)(storageValueChangeEvent?.scope, scope);
            (0, assert_1.strictEqual)(storageValueChangeEvent?.key, 'test.get');
            storageValueChangeEvents = [];
            storageService.store('test.get', '', scope, 1 /* StorageTarget.MACHINE */);
            (0, assert_1.strictEqual)(storageService.get('test.get', scope, (undefined)), '');
            storageValueChangeEvent = storageValueChangeEvents.find(e => e.key === 'test.get');
            (0, assert_1.strictEqual)(storageValueChangeEvent.scope, scope);
            (0, assert_1.strictEqual)(storageValueChangeEvent.key, 'test.get');
            storageService.store('test.getNumber', 5, scope, 1 /* StorageTarget.MACHINE */);
            (0, assert_1.strictEqual)(storageService.getNumber('test.getNumber', scope, (undefined)), 5);
            storageService.store('test.getNumber', 0, scope, 1 /* StorageTarget.MACHINE */);
            (0, assert_1.strictEqual)(storageService.getNumber('test.getNumber', scope, (undefined)), 0);
            storageService.store('test.getBoolean', true, scope, 1 /* StorageTarget.MACHINE */);
            (0, assert_1.strictEqual)(storageService.getBoolean('test.getBoolean', scope, (undefined)), true);
            storageService.store('test.getBoolean', false, scope, 1 /* StorageTarget.MACHINE */);
            (0, assert_1.strictEqual)(storageService.getBoolean('test.getBoolean', scope, (undefined)), false);
            storageService.store('test.getObject', {}, scope, 1 /* StorageTarget.MACHINE */);
            (0, assert_1.deepStrictEqual)(storageService.getObject('test.getObject', scope, (undefined)), {});
            storageService.store('test.getObject', [42], scope, 1 /* StorageTarget.MACHINE */);
            (0, assert_1.deepStrictEqual)(storageService.getObject('test.getObject', scope, (undefined)), [42]);
            storageService.store('test.getObject', { 'foo': {} }, scope, 1 /* StorageTarget.MACHINE */);
            (0, assert_1.deepStrictEqual)(storageService.getObject('test.getObject', scope, (undefined)), { 'foo': {} });
            (0, assert_1.strictEqual)(storageService.get('test.getDefault', scope, 'getDefault'), 'getDefault');
            (0, assert_1.strictEqual)(storageService.getNumber('test.getNumberDefault', scope, 5), 5);
            (0, assert_1.strictEqual)(storageService.getBoolean('test.getBooleanDefault', scope, true), true);
            (0, assert_1.deepStrictEqual)(storageService.getObject('test.getObjectDefault', scope, { 'foo': 42 }), { 'foo': 42 });
            storageService.storeAll([
                { key: 'test.storeAll1', value: 'foobar', scope, target: 1 /* StorageTarget.MACHINE */ },
                { key: 'test.storeAll2', value: 4, scope, target: 1 /* StorageTarget.MACHINE */ },
                { key: 'test.storeAll3', value: null, scope, target: 1 /* StorageTarget.MACHINE */ }
            ], false);
            (0, assert_1.strictEqual)(storageService.get('test.storeAll1', scope, 'foobar'), 'foobar');
            (0, assert_1.strictEqual)(storageService.get('test.storeAll2', scope, '4'), '4');
            (0, assert_1.strictEqual)(storageService.get('test.storeAll3', scope, 'null'), 'null');
        }
        test('Remove Data (application)', () => {
            removeData(-1 /* StorageScope.APPLICATION */);
        });
        test('Remove Data (profile)', () => {
            removeData(0 /* StorageScope.PROFILE */);
        });
        test('Remove Data (workspace)', () => {
            removeData(1 /* StorageScope.WORKSPACE */);
        });
        function removeData(scope) {
            const storageValueChangeEvents = [];
            storageService.onDidChangeValue(scope, undefined, disposables)(e => storageValueChangeEvents.push(e), undefined, disposables);
            storageService.store('test.remove', 'foobar', scope, 1 /* StorageTarget.MACHINE */);
            (0, assert_1.strictEqual)('foobar', storageService.get('test.remove', scope, (undefined)));
            storageService.remove('test.remove', scope);
            (0, assert_1.ok)(!storageService.get('test.remove', scope, (undefined)));
            const storageValueChangeEvent = storageValueChangeEvents.find(e => e.key === 'test.remove');
            (0, assert_1.strictEqual)(storageValueChangeEvent?.scope, scope);
            (0, assert_1.strictEqual)(storageValueChangeEvent?.key, 'test.remove');
        }
        test('Keys (in-memory)', () => {
            let storageTargetEvent = undefined;
            storageService.onDidChangeTarget(e => storageTargetEvent = e, undefined, disposables);
            // Empty
            for (const scope of [1 /* StorageScope.WORKSPACE */, 0 /* StorageScope.PROFILE */, -1 /* StorageScope.APPLICATION */]) {
                for (const target of [1 /* StorageTarget.MACHINE */, 0 /* StorageTarget.USER */]) {
                    (0, assert_1.strictEqual)(storageService.keys(scope, target).length, 0);
                }
            }
            let storageValueChangeEvent = undefined;
            // Add values
            for (const scope of [1 /* StorageScope.WORKSPACE */, 0 /* StorageScope.PROFILE */, -1 /* StorageScope.APPLICATION */]) {
                storageService.onDidChangeValue(scope, undefined, disposables)(e => storageValueChangeEvent = e, undefined, disposables);
                for (const target of [1 /* StorageTarget.MACHINE */, 0 /* StorageTarget.USER */]) {
                    storageTargetEvent = Object.create(null);
                    storageValueChangeEvent = Object.create(null);
                    storageService.store('test.target1', 'value1', scope, target);
                    (0, assert_1.strictEqual)(storageService.keys(scope, target).length, 1);
                    (0, assert_1.strictEqual)(storageTargetEvent?.scope, scope);
                    (0, assert_1.strictEqual)(storageValueChangeEvent?.key, 'test.target1');
                    (0, assert_1.strictEqual)(storageValueChangeEvent?.scope, scope);
                    (0, assert_1.strictEqual)(storageValueChangeEvent?.target, target);
                    storageTargetEvent = undefined;
                    storageValueChangeEvent = Object.create(null);
                    storageService.store('test.target1', 'otherValue1', scope, target);
                    (0, assert_1.strictEqual)(storageService.keys(scope, target).length, 1);
                    (0, assert_1.strictEqual)(storageTargetEvent, undefined);
                    (0, assert_1.strictEqual)(storageValueChangeEvent?.key, 'test.target1');
                    (0, assert_1.strictEqual)(storageValueChangeEvent?.scope, scope);
                    (0, assert_1.strictEqual)(storageValueChangeEvent?.target, target);
                    storageService.store('test.target2', 'value2', scope, target);
                    storageService.store('test.target3', 'value3', scope, target);
                    (0, assert_1.strictEqual)(storageService.keys(scope, target).length, 3);
                }
            }
            // Remove values
            for (const scope of [1 /* StorageScope.WORKSPACE */, 0 /* StorageScope.PROFILE */, -1 /* StorageScope.APPLICATION */]) {
                for (const target of [1 /* StorageTarget.MACHINE */, 0 /* StorageTarget.USER */]) {
                    const keysLength = storageService.keys(scope, target).length;
                    storageService.store('test.target4', 'value1', scope, target);
                    (0, assert_1.strictEqual)(storageService.keys(scope, target).length, keysLength + 1);
                    storageTargetEvent = Object.create(null);
                    storageValueChangeEvent = Object.create(null);
                    storageService.remove('test.target4', scope);
                    (0, assert_1.strictEqual)(storageService.keys(scope, target).length, keysLength);
                    (0, assert_1.strictEqual)(storageTargetEvent?.scope, scope);
                    (0, assert_1.strictEqual)(storageValueChangeEvent?.key, 'test.target4');
                    (0, assert_1.strictEqual)(storageValueChangeEvent?.scope, scope);
                }
            }
            // Remove all
            for (const scope of [1 /* StorageScope.WORKSPACE */, 0 /* StorageScope.PROFILE */, -1 /* StorageScope.APPLICATION */]) {
                for (const target of [1 /* StorageTarget.MACHINE */, 0 /* StorageTarget.USER */]) {
                    const keys = storageService.keys(scope, target);
                    for (const key of keys) {
                        storageService.remove(key, scope);
                    }
                    (0, assert_1.strictEqual)(storageService.keys(scope, target).length, 0);
                }
            }
            // Adding undefined or null removes value
            for (const scope of [1 /* StorageScope.WORKSPACE */, 0 /* StorageScope.PROFILE */, -1 /* StorageScope.APPLICATION */]) {
                for (const target of [1 /* StorageTarget.MACHINE */, 0 /* StorageTarget.USER */]) {
                    storageService.store('test.target1', 'value1', scope, target);
                    (0, assert_1.strictEqual)(storageService.keys(scope, target).length, 1);
                    storageTargetEvent = Object.create(null);
                    storageService.store('test.target1', undefined, scope, target);
                    (0, assert_1.strictEqual)(storageService.keys(scope, target).length, 0);
                    (0, assert_1.strictEqual)(storageTargetEvent?.scope, scope);
                    storageService.store('test.target1', '', scope, target);
                    (0, assert_1.strictEqual)(storageService.keys(scope, target).length, 1);
                    storageService.store('test.target1', null, scope, target);
                    (0, assert_1.strictEqual)(storageService.keys(scope, target).length, 0);
                }
            }
            // Target change
            for (const scope of [1 /* StorageScope.WORKSPACE */, 0 /* StorageScope.PROFILE */, -1 /* StorageScope.APPLICATION */]) {
                storageTargetEvent = undefined;
                storageService.store('test.target5', 'value1', scope, 1 /* StorageTarget.MACHINE */);
                (0, assert_1.ok)(storageTargetEvent);
                storageTargetEvent = undefined;
                storageService.store('test.target5', 'value1', scope, 0 /* StorageTarget.USER */);
                (0, assert_1.ok)(storageTargetEvent);
                storageTargetEvent = undefined;
                storageService.store('test.target5', 'value1', scope, 1 /* StorageTarget.MACHINE */);
                (0, assert_1.ok)(storageTargetEvent);
                storageTargetEvent = undefined;
                storageService.store('test.target5', 'value1', scope, 1 /* StorageTarget.MACHINE */);
                (0, assert_1.ok)(!storageTargetEvent); // no change in target
            }
        });
    }
    exports.createSuite = createSuite;
    suite('StorageService (in-memory)', function () {
        const disposables = new lifecycle_1.DisposableStore();
        teardown(() => {
            disposables.clear();
        });
        createSuite({
            setup: async () => disposables.add(new storage_1.InMemoryStorageService()),
            teardown: async () => { }
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZVNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3N0b3JhZ2UvdGVzdC9jb21tb24vc3RvcmFnZVNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsU0FBZ0IsV0FBVyxDQUE0QixNQUE0RTtRQUVsSSxJQUFJLGNBQWlCLENBQUM7UUFFdEIsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFFMUMsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ2hCLGNBQWMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDcEIsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDBDQUEwQyxFQUFFLEdBQUcsRUFBRTtZQUNyRCxTQUFTLG1DQUEwQixDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHNDQUFzQyxFQUFFLEdBQUcsRUFBRTtZQUNqRCxTQUFTLDhCQUFzQixDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdEQUFnRCxFQUFFLEdBQUcsRUFBRTtZQUMzRCxTQUFTLGdDQUF3QixDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtZQUNsQyxNQUFNLHdCQUF3QixHQUErQixFQUFFLENBQUM7WUFDaEUsY0FBYyxDQUFDLGdCQUFnQixpQ0FBeUIsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENB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