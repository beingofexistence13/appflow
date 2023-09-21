/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, event_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Disposable {
        constructor() {
            this.isDisposed = false;
        }
        dispose() { this.isDisposed = true; }
    }
    suite('Lifecycle', () => {
        test('dispose single disposable', () => {
            const disposable = new Disposable();
            assert(!disposable.isDisposed);
            (0, lifecycle_1.dispose)(disposable);
            assert(disposable.isDisposed);
        });
        test('dispose disposable array', () => {
            const disposable = new Disposable();
            const disposable2 = new Disposable();
            assert(!disposable.isDisposed);
            assert(!disposable2.isDisposed);
            (0, lifecycle_1.dispose)([disposable, disposable2]);
            assert(disposable.isDisposed);
            assert(disposable2.isDisposed);
        });
        test('dispose disposables', () => {
            const disposable = new Disposable();
            const disposable2 = new Disposable();
            assert(!disposable.isDisposed);
            assert(!disposable2.isDisposed);
            (0, lifecycle_1.dispose)(disposable);
            (0, lifecycle_1.dispose)(disposable2);
            assert(disposable.isDisposed);
            assert(disposable2.isDisposed);
        });
        test('dispose array should dispose all if a child throws on dispose', () => {
            const disposedValues = new Set();
            let thrownError;
            try {
                (0, lifecycle_1.dispose)([
                    (0, lifecycle_1.toDisposable)(() => { disposedValues.add(1); }),
                    (0, lifecycle_1.toDisposable)(() => { throw new Error('I am error'); }),
                    (0, lifecycle_1.toDisposable)(() => { disposedValues.add(3); }),
                ]);
            }
            catch (e) {
                thrownError = e;
            }
            assert.ok(disposedValues.has(1));
            assert.ok(disposedValues.has(3));
            assert.strictEqual(thrownError.message, 'I am error');
        });
        test('dispose array should rethrow composite error if multiple entries throw on dispose', () => {
            const disposedValues = new Set();
            let thrownError;
            try {
                (0, lifecycle_1.dispose)([
                    (0, lifecycle_1.toDisposable)(() => { disposedValues.add(1); }),
                    (0, lifecycle_1.toDisposable)(() => { throw new Error('I am error 1'); }),
                    (0, lifecycle_1.toDisposable)(() => { throw new Error('I am error 2'); }),
                    (0, lifecycle_1.toDisposable)(() => { disposedValues.add(4); }),
                ]);
            }
            catch (e) {
                thrownError = e;
            }
            assert.ok(disposedValues.has(1));
            assert.ok(disposedValues.has(4));
            assert.ok(thrownError instanceof AggregateError);
            assert.strictEqual(thrownError.errors.length, 2);
            assert.strictEqual(thrownError.errors[0].message, 'I am error 1');
            assert.strictEqual(thrownError.errors[1].message, 'I am error 2');
        });
        test('Action bar has broken accessibility #100273', function () {
            const array = [{ dispose() { } }, { dispose() { } }];
            const array2 = (0, lifecycle_1.dispose)(array);
            assert.strictEqual(array.length, 2);
            assert.strictEqual(array2.length, 0);
            assert.ok(array !== array2);
            const set = new Set([{ dispose() { } }, { dispose() { } }]);
            const setValues = set.values();
            const setValues2 = (0, lifecycle_1.dispose)(setValues);
            assert.ok(setValues === setValues2);
        });
        test('SafeDisposable, dispose', function () {
            let disposed = 0;
            const actual = () => disposed += 1;
            const d = new lifecycle_1.SafeDisposable();
            d.set(actual);
            d.dispose();
            assert.strictEqual(disposed, 1);
        });
        test('SafeDisposable, unset', function () {
            let disposed = 0;
            const actual = () => disposed += 1;
            const d = new lifecycle_1.SafeDisposable();
            d.set(actual);
            d.unset();
            d.dispose();
            assert.strictEqual(disposed, 0);
        });
    });
    suite('DisposableStore', () => {
        test('dispose should call all child disposes even if a child throws on dispose', () => {
            const disposedValues = new Set();
            const store = new lifecycle_1.DisposableStore();
            store.add((0, lifecycle_1.toDisposable)(() => { disposedValues.add(1); }));
            store.add((0, lifecycle_1.toDisposable)(() => { throw new Error('I am error'); }));
            store.add((0, lifecycle_1.toDisposable)(() => { disposedValues.add(3); }));
            let thrownError;
            try {
                store.dispose();
            }
            catch (e) {
                thrownError = e;
            }
            assert.ok(disposedValues.has(1));
            assert.ok(disposedValues.has(3));
            assert.strictEqual(thrownError.message, 'I am error');
        });
        test('dispose should throw composite error if multiple children throw on dispose', () => {
            const disposedValues = new Set();
            const store = new lifecycle_1.DisposableStore();
            store.add((0, lifecycle_1.toDisposable)(() => { disposedValues.add(1); }));
            store.add((0, lifecycle_1.toDisposable)(() => { throw new Error('I am error 1'); }));
            store.add((0, lifecycle_1.toDisposable)(() => { throw new Error('I am error 2'); }));
            store.add((0, lifecycle_1.toDisposable)(() => { disposedValues.add(4); }));
            let thrownError;
            try {
                store.dispose();
            }
            catch (e) {
                thrownError = e;
            }
            assert.ok(disposedValues.has(1));
            assert.ok(disposedValues.has(4));
            assert.ok(thrownError instanceof AggregateError);
            assert.strictEqual(thrownError.errors.length, 2);
            assert.strictEqual(thrownError.errors[0].message, 'I am error 1');
            assert.strictEqual(thrownError.errors[1].message, 'I am error 2');
        });
    });
    suite('Reference Collection', () => {
        class Collection extends lifecycle_1.ReferenceCollection {
            constructor() {
                super(...arguments);
                this._count = 0;
            }
            get count() { return this._count; }
            createReferencedObject(key) { this._count++; return key.length; }
            destroyReferencedObject(key, object) { this._count--; }
        }
        test('simple', () => {
            const collection = new Collection();
            const ref1 = collection.acquire('test');
            assert(ref1);
            assert.strictEqual(ref1.object, 4);
            assert.strictEqual(collection.count, 1);
            ref1.dispose();
            assert.strictEqual(collection.count, 0);
            const ref2 = collection.acquire('test');
            const ref3 = collection.acquire('test');
            assert.strictEqual(ref2.object, ref3.object);
            assert.strictEqual(collection.count, 1);
            const ref4 = collection.acquire('monkey');
            assert.strictEqual(ref4.object, 6);
            assert.strictEqual(collection.count, 2);
            ref2.dispose();
            assert.strictEqual(collection.count, 2);
            ref3.dispose();
            assert.strictEqual(collection.count, 1);
            ref4.dispose();
            assert.strictEqual(collection.count, 0);
        });
    });
    function assertThrows(fn, test) {
        try {
            fn();
            assert.fail('Expected function to throw, but it did not.');
        }
        catch (e) {
            assert.ok(test(e));
        }
    }
    suite('No Leakage Utilities', () => {
        suite('throwIfDisposablesAreLeaked', () => {
            test('throws if an event subscription is not cleaned up', () => {
                const eventEmitter = new event_1.Emitter();
                assertThrows(() => {
                    (0, utils_1.throwIfDisposablesAreLeaked)(() => {
                        eventEmitter.event(() => {
                            // noop
                        });
                    }, false);
                }, e => e.message.indexOf('undisposed disposables') !== -1);
            });
            test('throws if a disposable is not disposed', () => {
                assertThrows(() => {
                    (0, utils_1.throwIfDisposablesAreLeaked)(() => {
                        new lifecycle_1.DisposableStore();
                    }, false);
                }, e => e.message.indexOf('undisposed disposables') !== -1);
            });
            test('does not throw if all event subscriptions are cleaned up', () => {
                const eventEmitter = new event_1.Emitter();
                (0, utils_1.throwIfDisposablesAreLeaked)(() => {
                    eventEmitter.event(() => {
                        // noop
                    }).dispose();
                });
            });
            test('does not throw if all disposables are disposed', () => {
                // This disposable is reported before the test and not tracked.
                (0, lifecycle_1.toDisposable)(() => { });
                (0, utils_1.throwIfDisposablesAreLeaked)(() => {
                    // This disposable is marked as singleton
                    (0, lifecycle_1.markAsSingleton)((0, lifecycle_1.toDisposable)(() => { }));
                    // These disposables are also marked as singleton
                    const disposableStore = new lifecycle_1.DisposableStore();
                    disposableStore.add((0, lifecycle_1.toDisposable)(() => { }));
                    (0, lifecycle_1.markAsSingleton)(disposableStore);
                    (0, lifecycle_1.toDisposable)(() => { }).dispose();
                });
            });
        });
        suite('ensureNoDisposablesAreLeakedInTest', () => {
            (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
            test('Basic Test', () => {
                (0, lifecycle_1.toDisposable)(() => { }).dispose();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3QvY29tbW9uL2xpZmVjeWNsZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBT2hHLE1BQU0sVUFBVTtRQUFoQjtZQUNDLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFFcEIsQ0FBQztRQURBLE9BQU8sS0FBSyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDckM7SUFFRCxLQUFLLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtRQUV2QixJQUFJLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO1lBQ3RDLE1BQU0sVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7WUFFcEMsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRS9CLElBQUEsbUJBQU8sRUFBQyxVQUFVLENBQUMsQ0FBQztZQUVwQixNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtZQUNyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ3BDLE1BQU0sV0FBVyxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7WUFFckMsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUVoQyxJQUFBLG1CQUFPLEVBQUMsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUVuQyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFD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