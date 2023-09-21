/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/observable", "vs/base/common/observableInternal/base"], function (require, exports, assert, event_1, observable_1, base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LoggingObservableValue = exports.LoggingObserver = void 0;
    suite('observables', () => {
        /**
         * Reads these tests to understand how to use observables.
         */
        suite('tutorial', () => {
            test('observable + autorun', () => {
                const log = new Log();
                const myObservable = (0, observable_1.observableValue)('myObservable', 0);
                (0, observable_1.autorun)(reader => {
                    /** @description myAutorun */
                    log.log(`myAutorun.run(myObservable: ${myObservable.read(reader)})`);
                });
                // The autorun runs immediately
                assert.deepStrictEqual(log.getAndClearEntries(), ['myAutorun.run(myObservable: 0)']);
                myObservable.set(1, undefined);
                // The autorun runs again when any read observable changed
                assert.deepStrictEqual(log.getAndClearEntries(), ['myAutorun.run(myObservable: 1)']);
                myObservable.set(1, undefined);
                // But only if the value changed
                assert.deepStrictEqual(log.getAndClearEntries(), []);
                // Transactions batch autorun runs
                (0, observable_1.transaction)((tx) => {
                    myObservable.set(2, tx);
                    // No auto-run ran yet, even though the value changed
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    myObservable.set(3, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                // Only at the end of the transaction the autorun re-runs
                assert.deepStrictEqual(log.getAndClearEntries(), ['myAutorun.run(myObservable: 3)']);
            });
            test('computed + autorun', () => {
                const log = new Log();
                const observable1 = (0, observable_1.observableValue)('myObservable1', 0);
                const observable2 = (0, observable_1.observableValue)('myObservable2', 0);
                const myDerived = (0, observable_1.derived)(reader => {
                    /** @description myDerived */
                    const value1 = observable1.read(reader);
                    const value2 = observable2.read(reader);
                    const sum = value1 + value2;
                    log.log(`myDerived.recompute: ${value1} + ${value2} = ${sum}`);
                    return sum;
                });
                (0, observable_1.autorun)(reader => {
                    /** @description myAutorun */
                    log.log(`myAutorun(myDerived: ${myDerived.read(reader)})`);
                });
                // autorun runs immediately
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.recompute: 0 + 0 = 0",
                    "myAutorun(myDerived: 0)",
                ]);
                observable1.set(1, undefined);
                // and on changes...
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.recompute: 1 + 0 = 1",
                    "myAutorun(myDerived: 1)",
                ]);
                observable2.set(1, undefined);
                // ... of any dependency.
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.recompute: 1 + 1 = 2",
                    "myAutorun(myDerived: 2)",
                ]);
                (0, observable_1.transaction)((tx) => {
                    observable1.set(5, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    observable2.set(5, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                // When changing multiple observables in a transaction,
                // deriveds are only recomputed on demand.
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.recompute: 5 + 5 = 10",
                    "myAutorun(myDerived: 10)",
                ]);
                (0, observable_1.transaction)((tx) => {
                    observable1.set(6, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    observable2.set(4, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                // Now the autorun didn't run again, because its dependency changed from 10 to 10 (= no change).
                assert.deepStrictEqual(log.getAndClearEntries(), (["myDerived.recompute: 6 + 4 = 10"]));
            });
            test('read during transaction', () => {
                const log = new Log();
                const observable1 = (0, observable_1.observableValue)('myObservable1', 0);
                const observable2 = (0, observable_1.observableValue)('myObservable2', 0);
                const myDerived = (0, observable_1.derived)((reader) => {
                    /** @description myDerived */
                    const value1 = observable1.read(reader);
                    const value2 = observable2.read(reader);
                    const sum = value1 + value2;
                    log.log(`myDerived.recompute: ${value1} + ${value2} = ${sum}`);
                    return sum;
                });
                (0, observable_1.autorun)(reader => {
                    /** @description myAutorun */
                    log.log(`myAutorun(myDerived: ${myDerived.read(reader)})`);
                });
                // autorun runs immediately
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.recompute: 0 + 0 = 0",
                    "myAutorun(myDerived: 0)",
                ]);
                (0, observable_1.transaction)((tx) => {
                    observable1.set(-10, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    myDerived.get(); // This forces a (sync) recomputation of the current value
                    assert.deepStrictEqual(log.getAndClearEntries(), (["myDerived.recompute: -10 + 0 = -10"]));
                    observable2.set(10, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                // This autorun runs again, because its dependency changed from 0 to -10 and then back to 0.
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.recompute: -10 + 10 = 0",
                    "myAutorun(myDerived: 0)",
                ]);
            });
            test('get without observers', () => {
                const log = new Log();
                const observable1 = (0, observable_1.observableValue)('myObservableValue1', 0);
                const computed1 = (0, observable_1.derived)((reader) => {
                    /** @description computed */
                    const value1 = observable1.read(reader);
                    const result = value1 % 3;
                    log.log(`recompute1: ${value1} % 3 = ${result}`);
                    return result;
                });
                const computed2 = (0, observable_1.derived)((reader) => {
                    /** @description computed */
                    const value1 = computed1.read(reader);
                    const result = value1 * 2;
                    log.log(`recompute2: ${value1} * 2 = ${result}`);
                    return result;
                });
                const computed3 = (0, observable_1.derived)((reader) => {
                    /** @description computed */
                    const value1 = computed1.read(reader);
                    const result = value1 * 3;
                    log.log(`recompute3: ${value1} * 3 = ${result}`);
                    return result;
                });
                const computedSum = (0, observable_1.derived)((reader) => {
                    /** @description computed */
                    const value1 = computed2.read(reader);
                    const value2 = computed3.read(reader);
                    const result = value1 + value2;
                    log.log(`recompute4: ${value1} + ${value2} = ${result}`);
                    return result;
                });
                assert.deepStrictEqual(log.getAndClearEntries(), []);
                observable1.set(1, undefined);
                assert.deepStrictEqual(log.getAndClearEntries(), []);
                log.log(`value: ${computedSum.get()}`);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'recompute1: 1 % 3 = 1',
                    'recompute2: 1 * 2 = 2',
                    'recompute3: 1 * 3 = 3',
                    'recompute4: 2 + 3 = 5',
                    'value: 5',
                ]);
                log.log(`value: ${computedSum.get()}`);
                // Because there are no observers, the derived values are not cached, but computed from scratch.
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'recompute1: 1 % 3 = 1',
                    'recompute2: 1 * 2 = 2',
                    'recompute3: 1 * 3 = 3',
                    'recompute4: 2 + 3 = 5',
                    'value: 5',
                ]);
                const disposable = (0, observable_1.keepObserved)(computedSum); // Use keepAlive to keep the cache
                log.log(`value: ${computedSum.get()}`);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'recompute1: 1 % 3 = 1',
                    'recompute2: 1 * 2 = 2',
                    'recompute3: 1 * 3 = 3',
                    'recompute4: 2 + 3 = 5',
                    'value: 5',
                ]);
                log.log(`value: ${computedSum.get()}`);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'value: 5',
                ]);
                observable1.set(2, undefined);
                // The keep alive does not force deriveds to be recomputed
                assert.deepStrictEqual(log.getAndClearEntries(), ([]));
                log.log(`value: ${computedSum.get()}`);
                // Those deriveds are recomputed on demand
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "recompute1: 2 % 3 = 2",
                    "recompute2: 2 * 2 = 4",
                    "recompute3: 2 * 3 = 6",
                    "recompute4: 4 + 6 = 10",
                    "value: 10",
                ]);
                log.log(`value: ${computedSum.get()}`);
                // ... and then cached again
                assert.deepStrictEqual(log.getAndClearEntries(), (["value: 10"]));
                disposable.dispose(); // Don't forget to dispose the keepAlive to prevent memory leaks
                log.log(`value: ${computedSum.get()}`);
                // Which disables the cache again
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "recompute1: 2 % 3 = 2",
                    "recompute2: 2 * 2 = 4",
                    "recompute3: 2 * 3 = 6",
                    "recompute4: 4 + 6 = 10",
                    "value: 10",
                ]);
                log.log(`value: ${computedSum.get()}`);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "recompute1: 2 % 3 = 2",
                    "recompute2: 2 * 2 = 4",
                    "recompute3: 2 * 3 = 6",
                    "recompute4: 4 + 6 = 10",
                    "value: 10",
                ]);
            });
        });
        test('topological order', () => {
            const log = new Log();
            const myObservable1 = (0, observable_1.observableValue)('myObservable1', 0);
            const myObservable2 = (0, observable_1.observableValue)('myObservable2', 0);
            const myComputed1 = (0, observable_1.derived)(reader => {
                /** @description myComputed1 */
                const value1 = myObservable1.read(reader);
                const value2 = myObservable2.read(reader);
                const sum = value1 + value2;
                log.log(`myComputed1.recompute(myObservable1: ${value1} + myObservable2: ${value2} = ${sum})`);
                return sum;
            });
            const myComputed2 = (0, observable_1.derived)(reader => {
                /** @description myComputed2 */
                const value1 = myComputed1.read(reader);
                const value2 = myObservable1.read(reader);
                const value3 = myObservable2.read(reader);
                const sum = value1 + value2 + value3;
                log.log(`myComputed2.recompute(myComputed1: ${value1} + myObservable1: ${value2} + myObservable2: ${value3} = ${sum})`);
                return sum;
            });
            const myComputed3 = (0, observable_1.derived)(reader => {
                /** @description myComputed3 */
                const value1 = myComputed2.read(reader);
                const value2 = myObservable1.read(reader);
                const value3 = myObservable2.read(reader);
                const sum = value1 + value2 + value3;
                log.log(`myComputed3.recompute(myComputed2: ${value1} + myObservable1: ${value2} + myObservable2: ${value3} = ${sum})`);
                return sum;
            });
            (0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                log.log(`myAutorun.run(myComputed3: ${myComputed3.read(reader)})`);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myComputed1.recompute(myObservable1: 0 + myObservable2: 0 = 0)",
                "myComputed2.recompute(myComputed1: 0 + myObservable1: 0 + myObservable2: 0 = 0)",
                "myComputed3.recompute(myComputed2: 0 + myObservable1: 0 + myObservable2: 0 = 0)",
                "myAutorun.run(myComputed3: 0)",
            ]);
            myObservable1.set(1, undefined);
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myComputed1.recompute(myObservable1: 1 + myObservable2: 0 = 1)",
                "myComputed2.recompute(myComputed1: 1 + myObservable1: 1 + myObservable2: 0 = 2)",
                "myComputed3.recompute(myComputed2: 2 + myObservable1: 1 + myObservable2: 0 = 3)",
                "myAutorun.run(myComputed3: 3)",
            ]);
            (0, observable_1.transaction)((tx) => {
                myObservable1.set(2, tx);
                myComputed2.get();
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myComputed1.recompute(myObservable1: 2 + myObservable2: 0 = 2)",
                    "myComputed2.recompute(myComputed1: 2 + myObservable1: 2 + myObservable2: 0 = 4)",
                ]);
                myObservable1.set(3, tx);
                myComputed2.get();
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myComputed1.recompute(myObservable1: 3 + myObservable2: 0 = 3)",
                    "myComputed2.recompute(myComputed1: 3 + myObservable1: 3 + myObservable2: 0 = 6)",
                ]);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myComputed3.recompute(myComputed2: 6 + myObservable1: 3 + myObservable2: 0 = 9)",
                "myAutorun.run(myComputed3: 9)",
            ]);
        });
        suite('from event', () => {
            function init() {
                const log = new Log();
                let value = 0;
                const eventEmitter = new event_1.Emitter();
                let id = 0;
                const observable = (0, observable_1.observableFromEvent)((handler) => {
                    const curId = id++;
                    log.log(`subscribed handler ${curId}`);
                    const disposable = eventEmitter.event(handler);
                    return {
                        dispose: () => {
                            log.log(`unsubscribed handler ${curId}`);
                            disposable.dispose();
                        },
                    };
                }, () => {
                    log.log(`compute value ${value}`);
                    return value;
                });
                return {
                    log,
                    setValue: (newValue) => {
                        value = newValue;
                        eventEmitter.fire();
                    },
                    observable,
                };
            }
            test('Handle undefined', () => {
                const { log, setValue, observable } = init();
                setValue(undefined);
                const autorunDisposable = (0, observable_1.autorun)(reader => {
                    /** @description MyAutorun */
                    observable.read(reader);
                    log.log(`autorun, value: ${observable.read(reader)}`);
                });
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "subscribed handler 0",
                    "compute value undefined",
                    "autorun, value: undefined",
                ]);
                setValue(1);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "compute value 1",
                    "autorun, value: 1"
                ]);
                autorunDisposable.dispose();
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "unsubscribed handler 0"
                ]);
            });
            test('basic', () => {
                const { log, setValue, observable } = init();
                const shouldReadObservable = (0, observable_1.observableValue)('shouldReadObservable', true);
                const autorunDisposable = (0, observable_1.autorun)(reader => {
                    /** @description MyAutorun */
                    if (shouldReadObservable.read(reader)) {
                        observable.read(reader);
                        log.log(`autorun, should read: true, value: ${observable.read(reader)}`);
                    }
                    else {
                        log.log(`autorun, should read: false`);
                    }
                });
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'subscribed handler 0',
                    'compute value 0',
                    'autorun, should read: true, value: 0',
                ]);
                // Cached get
                log.log(`get value: ${observable.get()}`);
                assert.deepStrictEqual(log.getAndClearEntries(), ['get value: 0']);
                setValue(1);
                // Trigger autorun, no unsub/sub
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'compute value 1',
                    'autorun, should read: true, value: 1',
                ]);
                // Unsubscribe when not read
                shouldReadObservable.set(false, undefined);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'autorun, should read: false',
                    'unsubscribed handler 0',
                ]);
                shouldReadObservable.set(true, undefined);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'subscribed handler 1',
                    'compute value 1',
                    'autorun, should read: true, value: 1',
                ]);
                autorunDisposable.dispose();
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'unsubscribed handler 1',
                ]);
            });
            test('get without observers', () => {
                const { log, observable } = init();
                assert.deepStrictEqual(log.getAndClearEntries(), []);
                log.log(`get value: ${observable.get()}`);
                // Not cached or subscribed
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'compute value 0',
                    'get value: 0',
                ]);
                log.log(`get value: ${observable.get()}`);
                // Still not cached or subscribed
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'compute value 0',
                    'get value: 0',
                ]);
            });
        });
        test('reading derived in transaction unsubscribes unnecessary observables', () => {
            const log = new Log();
            const shouldReadObservable = (0, observable_1.observableValue)('shouldReadMyObs1', true);
            const myObs1 = new LoggingObservableValue('myObs1', 0, log);
            const myComputed = (0, observable_1.derived)(reader => {
                /** @description myComputed */
                log.log('myComputed.recompute');
                if (shouldReadObservable.read(reader)) {
                    return myObs1.read(reader);
                }
                return 1;
            });
            (0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const value = myComputed.read(reader);
                log.log(`myAutorun: ${value}`);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myComputed.recompute",
                "myObs1.firstObserverAdded",
                "myObs1.get",
                "myAutorun: 0",
            ]);
            (0, observable_1.transaction)(tx => {
                myObs1.set(1, tx);
                assert.deepStrictEqual(log.getAndClearEntries(), (["myObs1.set (value 1)"]));
                shouldReadObservable.set(false, tx);
                assert.deepStrictEqual(log.getAndClearEntries(), ([]));
                myComputed.get();
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myComputed.recompute",
                    "myObs1.lastObserverRemoved",
                ]);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), (["myAutorun: 1"]));
        });
        test('avoid recomputation of deriveds that are no longer read', () => {
            const log = new Log();
            const myObsShouldRead = new LoggingObservableValue('myObsShouldRead', true, log);
            const myObs1 = new LoggingObservableValue('myObs1', 0, log);
            const myComputed1 = (0, observable_1.derived)(reader => {
                /** @description myComputed1 */
                const myObs1Val = myObs1.read(reader);
                const result = myObs1Val % 10;
                log.log(`myComputed1(myObs1: ${myObs1Val}): Computed ${result}`);
                return myObs1Val;
            });
            (0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const shouldRead = myObsShouldRead.read(reader);
                if (shouldRead) {
                    const v = myComputed1.read(reader);
                    log.log(`myAutorun(shouldRead: true, myComputed1: ${v}): run`);
                }
                else {
                    log.log(`myAutorun(shouldRead: false): run`);
                }
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObsShouldRead.firstObserverAdded",
                "myObsShouldRead.get",
                "myObs1.firstObserverAdded",
                "myObs1.get",
                "myComputed1(myObs1: 0): Computed 0",
                "myAutorun(shouldRead: true, myComputed1: 0): run",
            ]);
            (0, observable_1.transaction)(tx => {
                myObsShouldRead.set(false, tx);
                myObs1.set(1, tx);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObsShouldRead.set (value false)",
                    "myObs1.set (value 1)",
                ]);
            });
            // myComputed1 should not be recomputed here, even though its dependency myObs1 changed!
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObsShouldRead.get",
                "myAutorun(shouldRead: false): run",
                "myObs1.lastObserverRemoved",
            ]);
            (0, observable_1.transaction)(tx => {
                myObsShouldRead.set(true, tx);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObsShouldRead.set (value true)",
                ]);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObsShouldRead.get",
                "myObs1.firstObserverAdded",
                "myObs1.get",
                "myComputed1(myObs1: 1): Computed 1",
                "myAutorun(shouldRead: true, myComputed1: 1): run",
            ]);
        });
        suite('autorun rerun on neutral change', () => {
            test('autorun reruns on neutral observable double change', () => {
                const log = new Log();
                const myObservable = (0, observable_1.observableValue)('myObservable', 0);
                (0, observable_1.autorun)(reader => {
                    /** @description myAutorun */
                    log.log(`myAutorun.run(myObservable: ${myObservable.read(reader)})`);
                });
                assert.deepStrictEqual(log.getAndClearEntries(), ['myAutorun.run(myObservable: 0)']);
                (0, observable_1.transaction)((tx) => {
                    myObservable.set(2, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    myObservable.set(0, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                assert.deepStrictEqual(log.getAndClearEntries(), ['myAutorun.run(myObservable: 0)']);
            });
            test('autorun does not rerun on indirect neutral observable double change', () => {
                const log = new Log();
                const myObservable = (0, observable_1.observableValue)('myObservable', 0);
                const myDerived = (0, observable_1.derived)(reader => {
                    /** @description myDerived */
                    const val = myObservable.read(reader);
                    log.log(`myDerived.read(myObservable: ${val})`);
                    return val;
                });
                (0, observable_1.autorun)(reader => {
                    /** @description myAutorun */
                    log.log(`myAutorun.run(myDerived: ${myDerived.read(reader)})`);
                });
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.read(myObservable: 0)",
                    "myAutorun.run(myDerived: 0)"
                ]);
                (0, observable_1.transaction)((tx) => {
                    myObservable.set(2, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    myObservable.set(0, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.read(myObservable: 0)"
                ]);
            });
            test('autorun reruns on indirect neutral observable double change when changes propagate', () => {
                const log = new Log();
                const myObservable = (0, observable_1.observableValue)('myObservable', 0);
                const myDerived = (0, observable_1.derived)(reader => {
                    /** @description myDerived */
                    const val = myObservable.read(reader);
                    log.log(`myDerived.read(myObservable: ${val})`);
                    return val;
                });
                (0, observable_1.autorun)(reader => {
                    /** @description myAutorun */
                    log.log(`myAutorun.run(myDerived: ${myDerived.read(reader)})`);
                });
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.read(myObservable: 0)",
                    "myAutorun.run(myDerived: 0)"
                ]);
                (0, observable_1.transaction)((tx) => {
                    myObservable.set(2, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    myDerived.get(); // This marks the auto-run as changed
                    assert.deepStrictEqual(log.getAndClearEntries(), [
                        "myDerived.read(myObservable: 2)"
                    ]);
                    myObservable.set(0, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.read(myObservable: 0)",
                    "myAutorun.run(myDerived: 0)"
                ]);
            });
        });
        test('self-disposing autorun', () => {
            const log = new Log();
            const observable1 = new LoggingObservableValue('myObservable1', 0, log);
            const myObservable2 = new LoggingObservableValue('myObservable2', 0, log);
            const myObservable3 = new LoggingObservableValue('myObservable3', 0, log);
            const d = (0, observable_1.autorun)(reader => {
                /** @description autorun */
                if (observable1.read(reader) >= 2) {
                    assert.deepStrictEqual(log.getAndClearEntries(), [
                        "myObservable1.set (value 2)",
                        "myObservable1.get",
                    ]);
                    myObservable2.read(reader);
                    // First time this observable is read
                    assert.deepStrictEqual(log.getAndClearEntries(), [
                        "myObservable2.firstObserverAdded",
                        "myObservable2.get",
                    ]);
                    d.dispose();
                    // Disposing removes all observers
                    assert.deepStrictEqual(log.getAndClearEntries(), [
                        "myObservable1.lastObserverRemoved",
                        "myObservable2.lastObserverRemoved",
                    ]);
                    myObservable3.read(reader);
                    // This does not subscribe the observable, because the autorun is disposed
                    assert.deepStrictEqual(log.getAndClearEntries(), [
                        "myObservable3.get",
                    ]);
                }
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                'myObservable1.firstObserverAdded',
                'myObservable1.get',
            ]);
            observable1.set(1, undefined);
            assert.deepStrictEqual(log.getAndClearEntries(), [
                'myObservable1.set (value 1)',
                'myObservable1.get',
            ]);
            observable1.set(2, undefined);
            // See asserts in the autorun
            assert.deepStrictEqual(log.getAndClearEntries(), ([]));
        });
        test('changing observables in endUpdate', () => {
            const log = new Log();
            const myObservable1 = new LoggingObservableValue('myObservable1', 0, log);
            const myObservable2 = new LoggingObservableValue('myObservable2', 0, log);
            const myDerived1 = (0, observable_1.derived)(reader => {
                /** @description myDerived1 */
                const val = myObservable1.read(reader);
                log.log(`myDerived1.read(myObservable: ${val})`);
                return val;
            });
            const myDerived2 = (0, observable_1.derived)(reader => {
                /** @description myDerived2 */
                const val = myObservable2.read(reader);
                if (val === 1) {
                    myDerived1.read(reader);
                }
                log.log(`myDerived2.read(myObservable: ${val})`);
                return val;
            });
            (0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const myDerived1Val = myDerived1.read(reader);
                const myDerived2Val = myDerived2.read(reader);
                log.log(`myAutorun.run(myDerived1: ${myDerived1Val}, myDerived2: ${myDerived2Val})`);
            });
            (0, observable_1.transaction)(tx => {
                myObservable2.set(1, tx);
                // end update of this observable will trigger endUpdate of myDerived1 and
                // the autorun and the autorun will add myDerived2 as observer to myDerived1
                myObservable1.set(1, tx);
            });
        });
        test('set dependency in derived', () => {
            const log = new Log();
            const myObservable = new LoggingObservableValue('myObservable', 0, log);
            const myComputed = (0, observable_1.derived)(reader => {
                /** @description myComputed */
                let value = myObservable.read(reader);
                const origValue = value;
                log.log(`myComputed(myObservable: ${origValue}): start computing`);
                if (value % 3 !== 0) {
                    value++;
                    myObservable.set(value, undefined);
                }
                log.log(`myComputed(myObservable: ${origValue}): finished computing`);
                return value;
            });
            (0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const value = myComputed.read(reader);
                log.log(`myAutorun(myComputed: ${value})`);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable.firstObserverAdded",
                "myObservable.get",
                "myComputed(myObservable: 0): start computing",
                "myComputed(myObservable: 0): finished computing",
                "myAutorun(myComputed: 0)"
            ]);
            myObservable.set(1, undefined);
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable.set (value 1)",
                "myObservable.get",
                "myComputed(myObservable: 1): start computing",
                "myObservable.set (value 2)",
                "myComputed(myObservable: 1): finished computing",
                "myObservable.get",
                "myComputed(myObservable: 2): start computing",
                "myObservable.set (value 3)",
                "myComputed(myObservable: 2): finished computing",
                "myObservable.get",
                "myComputed(myObservable: 3): start computing",
                "myComputed(myObservable: 3): finished computing",
                "myAutorun(myComputed: 3)",
            ]);
        });
        test('set dependency in autorun', () => {
            const log = new Log();
            const myObservable = new LoggingObservableValue('myObservable', 0, log);
            (0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const value = myObservable.read(reader);
                log.log(`myAutorun(myObservable: ${value}): start`);
                if (value !== 0 && value < 4) {
                    myObservable.set(value + 1, undefined);
                }
                log.log(`myAutorun(myObservable: ${value}): end`);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable.firstObserverAdded",
                "myObservable.get",
                "myAutorun(myObservable: 0): start",
                "myAutorun(myObservable: 0): end",
            ]);
            myObservable.set(1, undefined);
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable.set (value 1)",
                "myObservable.get",
                "myAutorun(myObservable: 1): start",
                "myObservable.set (value 2)",
                "myAutorun(myObservable: 1): end",
                "myObservable.get",
                "myAutorun(myObservable: 2): start",
                "myObservable.set (value 3)",
                "myAutorun(myObservable: 2): end",
                "myObservable.get",
                "myAutorun(myObservable: 3): start",
                "myObservable.set (value 4)",
                "myAutorun(myObservable: 3): end",
                "myObservable.get",
                "myAutorun(myObservable: 4): start",
                "myAutorun(myObservable: 4): end",
            ]);
        });
        test('get in transaction between sets', () => {
            const log = new Log();
            const myObservable = new LoggingObservableValue('myObservable', 0, log);
            const myDerived1 = (0, observable_1.derived)(reader => {
                /** @description myDerived1 */
                const value = myObservable.read(reader);
                log.log(`myDerived1(myObservable: ${value}): start computing`);
                return value;
            });
            const myDerived2 = (0, observable_1.derived)(reader => {
                /** @description myDerived2 */
                const value = myDerived1.read(reader);
                log.log(`myDerived2(myDerived1: ${value}): start computing`);
                return value;
            });
            (0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const value = myDerived2.read(reader);
                log.log(`myAutorun(myDerived2: ${value})`);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable.firstObserverAdded",
                "myObservable.get",
                "myDerived1(myObservable: 0): start computing",
                "myDerived2(myDerived1: 0): start computing",
                "myAutorun(myDerived2: 0)",
            ]);
            (0, observable_1.transaction)(tx => {
                myObservable.set(1, tx);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObservable.set (value 1)",
                ]);
                myDerived2.get();
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObservable.get",
                    "myDerived1(myObservable: 1): start computing",
                    "myDerived2(myDerived1: 1): start computing",
                ]);
                myObservable.set(2, tx);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObservable.set (value 2)",
                ]);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable.get",
                "myDerived1(myObservable: 2): start computing",
                "myDerived2(myDerived1: 2): start computing",
                "myAutorun(myDerived2: 2)",
            ]);
        });
        test('bug: Dont reset states', () => {
            const log = new Log();
            const myObservable1 = new LoggingObservableValue('myObservable1', 0, log);
            const myObservable2 = new LoggingObservableValue('myObservable2', 0, log);
            const myDerived2 = (0, observable_1.derived)(reader => {
                /** @description myDerived2 */
                const val = myObservable2.read(reader);
                log.log(`myDerived2.computed(myObservable2: ${val})`);
                return val % 10;
            });
            const myDerived3 = (0, observable_1.derived)(reader => {
                /** @description myDerived3 */
                const val1 = myObservable1.read(reader);
                const val2 = myDerived2.read(reader);
                log.log(`myDerived3.computed(myDerived1: ${val1}, myDerived2: ${val2})`);
                return `${val1} + ${val2}`;
            });
            (0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const val = myDerived3.read(reader);
                log.log(`myAutorun(myDerived3: ${val})`);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable1.firstObserverAdded",
                "myObservable1.get",
                "myObservable2.firstObserverAdded",
                "myObservable2.get",
                "myDerived2.computed(myObservable2: 0)",
                "myDerived3.computed(myDerived1: 0, myDerived2: 0)",
                "myAutorun(myDerived3: 0 + 0)",
            ]);
            (0, observable_1.transaction)(tx => {
                myObservable1.set(1, tx); // Mark myDerived 3 as stale
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObservable1.set (value 1)",
                ]);
                myObservable2.set(10, tx); // This is a non-change. myDerived3 should not be marked as possibly-depedency-changed!
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObservable2.set (value 10)",
                ]);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable1.get",
                "myObservable2.get",
                "myDerived2.computed(myObservable2: 10)",
                'myDerived3.computed(myDerived1: 1, myDerived2: 0)',
                'myAutorun(myDerived3: 1 + 0)',
            ]);
        });
        test('bug: Add observable in endUpdate', () => {
            const myObservable1 = (0, observable_1.observableValue)('myObservable1', 0);
            const myObservable2 = (0, observable_1.observableValue)('myObservable2', 0);
            const myDerived1 = (0, observable_1.derived)(reader => {
                /** @description myDerived1 */
                return myObservable1.read(reader);
            });
            const myDerived2 = (0, observable_1.derived)(reader => {
                /** @description myDerived2 */
                return myObservable2.read(reader);
            });
            const myDerivedA1 = (0, observable_1.derived)(reader => /** @description myDerivedA1 */ {
                const d1 = myDerived1.read(reader);
                if (d1 === 1) {
                    // This adds an observer while myDerived is still in update mode.
                    // When myDerived exits update mode, the observer shouldn't receive
                    // more endUpdate than beginUpdate calls.
                    myDerived2.read(reader);
                }
            });
            (0, observable_1.autorun)(reader => {
                /** @description myAutorun1 */
                myDerivedA1.read(reader);
            });
            (0, observable_1.autorun)(reader => {
                /** @description myAutorun2 */
                myDerived2.read(reader);
            });
            (0, observable_1.transaction)(tx => {
                myObservable1.set(1, tx);
                myObservable2.set(1, tx);
            });
        });
        test('bug: fromObservableLight doesnt subscribe', () => {
            const log = new Log();
            const myObservable = new LoggingObservableValue('myObservable', 0, log);
            const myDerived = (0, observable_1.derived)(reader => /** @description myDerived */ {
                const val = myObservable.read(reader);
                log.log(`myDerived.computed(myObservable2: ${val})`);
                return val % 10;
            });
            const e = event_1.Event.fromObservableLight(myDerived);
            log.log('event created');
            e(() => {
                log.log('event fired');
            });
            myObservable.set(1, undefined);
            assert.deepStrictEqual(log.getAndClearEntries(), [
                'event created',
                'myObservable.firstObserverAdded',
                'myObservable.get',
                'myDerived.computed(myObservable2: 0)',
                'myObservable.set (value 1)',
                'myObservable.get',
                'myDerived.computed(myObservable2: 1)',
                'event fired',
            ]);
        });
        test('dont run autorun after dispose', () => {
            const log = new Log();
            const myObservable = new LoggingObservableValue('myObservable', 0, log);
            const d = (0, observable_1.autorun)(reader => {
                /** @description update */
                const v = myObservable.read(reader);
                log.log('autorun, myObservable:' + v);
            });
            (0, observable_1.transaction)(tx => {
                myObservable.set(1, tx);
                d.dispose();
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                'myObservable.firstObserverAdded',
                'myObservable.get',
                'autorun, myObservable:0',
                'myObservable.set (value 1)',
                'myObservable.lastObserverRemoved',
            ]);
        });
    });
    class LoggingObserver {
        constructor(debugName, log) {
            this.debugName = debugName;
            this.log = log;
            this.count = 0;
        }
        beginUpdate(observable) {
            this.count++;
            this.log.log(`${this.debugName}.beginUpdate (count ${this.count})`);
        }
        endUpdate(observable) {
            this.log.log(`${this.debugName}.endUpdate (count ${this.count})`);
            this.count--;
        }
        handleChange(observable, change) {
            this.log.log(`${this.debugName}.handleChange (count ${this.count})`);
        }
        handlePossibleChange(observable) {
            this.log.log(`${this.debugName}.handlePossibleChange`);
        }
    }
    exports.LoggingObserver = LoggingObserver;
    class LoggingObservableValue extends base_1.BaseObservable {
        constructor(debugName, initialValue, log) {
            super();
            this.debugName = debugName;
            this.log = log;
            this.value = initialValue;
        }
        onFirstObserverAdded() {
            this.log.log(`${this.debugName}.firstObserverAdded`);
        }
        onLastObserverRemoved() {
            this.log.log(`${this.debugName}.lastObserverRemoved`);
        }
        get() {
            this.log.log(`${this.debugName}.get`);
            return this.value;
        }
        set(value, tx, change) {
            if (this.value === value) {
                return;
            }
            if (!tx) {
                (0, observable_1.transaction)((tx) => {
                    this.set(value, tx, change);
                }, () => `Setting ${this.debugName}`);
                return;
            }
            this.log.log(`${this.debugName}.set (value ${value})`);
            this.value = value;
            for (const observer of this.observers) {
                tx.updateObserver(observer, this);
                observer.handleChange(this, change);
            }
        }
        toString() {
            return `${this.debugName}: ${this.value}`;
        }
    }
    exports.LoggingObservableValue = LoggingObservableValue;
    class Log {
        constructor() {
            this.entries = [];
        }
        log(message) {
            this.entries.push(message);
        }
        getAndClearEntries() {
            const entries = [...this.entries];
            this.entries.length = 0;
            return entries;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2YWJsZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9vYnNlcnZhYmxlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO1FBQ3pCOztXQUVHO1FBQ0gsS0FBSyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7WUFDdEIsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtnQkFDakMsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDdEIsTUFBTSxZQUFZLEdBQUcsSUFBQSw0QkFBZSxFQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFeEQsSUFBQSxvQkFBTyxFQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUNoQiw2QkFBNkI7b0JBQzdCLEdBQUcsQ0FBQyxHQUFHLENBQUMsK0JBQStCLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0RSxDQUFDLENBQUMsQ0FBQztnQkFDSCwrQkFBK0I7Z0JBQy9CLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7Z0JBRXJGLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUMvQiwwREFBMEQ7Z0JBQzFELE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7Z0JBRXJGLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUMvQixnQ0FBZ0M7Z0JBQ2hDLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxD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