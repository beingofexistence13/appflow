/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/symbols", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/uri", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, async, MicrotaskDelay, cancellation_1, errors_1, event_1, uri_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Async', () => {
        const store = (0, utils_1.$bT)();
        suite('cancelablePromise', function () {
            test('set token, don\'t wait for inner promise', function () {
                let canceled = 0;
                const promise = async.$ug(token => {
                    store.add(token.onCancellationRequested(_ => { canceled += 1; }));
                    return new Promise(resolve => { });
                });
                const result = promise.then(_ => assert.ok(false), err => {
                    assert.strictEqual(canceled, 1);
                    assert.ok((0, errors_1.$2)(err));
                });
                promise.cancel();
                promise.cancel(); // cancel only once
                return result;
            });
            test('cancel despite inner promise being resolved', function () {
                let canceled = 0;
                const promise = async.$ug(token => {
                    store.add(token.onCancellationRequested(_ => { canceled += 1; }));
                    return Promise.resolve(1234);
                });
                const result = promise.then(_ => assert.ok(false), err => {
                    assert.strictEqual(canceled, 1);
                    assert.ok((0, errors_1.$2)(err));
                });
                promise.cancel();
                return result;
            });
            // Cancelling a sync cancelable promise will fire the cancelled token.
            // Also, every `then` callback runs in another execution frame.
            test('execution order (sync)', function () {
                const order = [];
                const cancellablePromise = async.$ug(token => {
                    order.push('in callback');
                    store.add(token.onCancellationRequested(_ => order.push('cancelled')));
                    return Promise.resolve(1234);
                });
                order.push('afterCreate');
                const promise = cancellablePromise
                    .then(undefined, err => null)
                    .then(() => order.push('finally'));
                cancellablePromise.cancel();
                order.push('afterCancel');
                return promise.then(() => assert.deepStrictEqual(order, ['in callback', 'afterCreate', 'cancelled', 'afterCancel', 'finally']));
            });
            // Cancelling an async cancelable promise is just the same as a sync cancellable promise.
            test('execution order (async)', function () {
                const order = [];
                const cancellablePromise = async.$ug(token => {
                    order.push('in callback');
                    store.add(token.onCancellationRequested(_ => order.push('cancelled')));
                    return new Promise(c => setTimeout(c.bind(1234), 0));
                });
                order.push('afterCreate');
                const promise = cancellablePromise
                    .then(undefined, err => null)
                    .then(() => order.push('finally'));
                cancellablePromise.cancel();
                order.push('afterCancel');
                return promise.then(() => assert.deepStrictEqual(order, ['in callback', 'afterCreate', 'cancelled', 'afterCancel', 'finally']));
            });
            test('get inner result', async function () {
                const promise = async.$ug(token => {
                    return async.$Hg(12).then(_ => 1234);
                });
                const result = await promise;
                assert.strictEqual(result, 1234);
            });
        });
        suite('Throttler', function () {
            test('non async', function () {
                let count = 0;
                const factory = () => {
                    return Promise.resolve(++count);
                };
                const throttler = new async.$Ag();
                return Promise.all([
                    throttler.queue(factory).then((result) => { assert.strictEqual(result, 1); }),
                    throttler.queue(factory).then((result) => { assert.strictEqual(result, 2); }),
                    throttler.queue(factory).then((result) => { assert.strictEqual(result, 2); }),
                    throttler.queue(factory).then((result) => { assert.strictEqual(result, 2); }),
                    throttler.queue(factory).then((result) => { assert.strictEqual(result, 2); })
                ]).then(() => assert.strictEqual(count, 2));
            });
            test('async', () => {
                let count = 0;
                const factory = () => async.$Hg(0).then(() => ++count);
                const throttler = new async.$Ag();
                return Promise.all([
                    throttler.queue(factory).then((result) => { assert.strictEqual(result, 1); }),
                    throttler.queue(factory).then((result) => { assert.strictEqual(result, 2); }),
                    throttler.queue(factory).then((result) => { assert.strictEqual(result, 2); }),
                    throttler.queue(factory).then((result) => { assert.strictEqual(result, 2); }),
                    throttler.queue(factory).then((result) => { assert.strictEqual(result, 2); })
                ]).then(() => {
                    return Promise.all([
                        throttler.queue(factory).then((result) => { assert.strictEqual(result, 3); }),
                        throttler.queue(factory).then((result) => { assert.strictEqual(result, 4); }),
                        throttler.queue(factory).then((result) => { assert.strictEqual(result, 4); }),
                        throttler.queue(factory).then((result) => { assert.strictEqual(result, 4); }),
                        throttler.queue(factory).then((result) => { assert.strictEqual(result, 4); })
                    ]);
                });
            });
            test('last factory should be the one getting called', function () {
                const factoryFactory = (n) => () => {
                    return async.$Hg(0).then(() => n);
                };
                const throttler = new async.$Ag();
                const promises = [];
                promises.push(throttler.queue(factoryFactory(1)).then((n) => { assert.strictEqual(n, 1); }));
                promises.push(throttler.queue(factoryFactory(2)).then((n) => { assert.strictEqual(n, 3); }));
                promises.push(throttler.queue(factoryFactory(3)).then((n) => { assert.strictEqual(n, 3); }));
                return Promise.all(promises);
            });
            test('disposal after queueing', async () => {
                let factoryCalls = 0;
                const factory = async () => {
                    factoryCalls++;
                    return async.$Hg(0);
                };
                const throttler = new async.$Ag();
                const promises = [];
                promises.push(throttler.queue(factory));
                promises.push(throttler.queue(factory));
                throttler.dispose();
                await Promise.all(promises);
                assert.strictEqual(factoryCalls, 1);
            });
            test('disposal before queueing', async () => {
                let factoryCalls = 0;
                const factory = async () => {
                    factoryCalls++;
                    return async.$Hg(0);
                };
                const throttler = new async.$Ag();
                const promises = [];
                throttler.dispose();
                promises.push(throttler.queue(factory));
                try {
                    await Promise.all(promises);
                    assert.fail('should fail');
                }
                catch (err) {
                    assert.strictEqual(factoryCalls, 0);
                }
            });
        });
        suite('Delayer', function () {
            test('simple', () => {
                let count = 0;
                const factory = () => {
                    return Promise.resolve(++count);
                };
                const delayer = new async.$Dg(0);
                const promises = [];
                assert(!delayer.isTriggered());
                promises.push(delayer.trigger(factory).then((result) => { assert.strictEqual(result, 1); assert(!delayer.isTriggered()); }));
                assert(delayer.isTriggered());
                promises.push(delayer.trigger(factory).then((result) => { assert.strictEqual(result, 1); assert(!delayer.isTriggered()); }));
                assert(delayer.isTriggered());
                promises.push(delayer.trigger(factory).then((result) => { assert.strictEqual(result, 1); assert(!delayer.isTriggered()); }));
                assert(delayer.isTriggered());
                return Promise.all(promises).then(() => {
                    assert(!delayer.isTriggered());
                });
            });
            test('microtask delay simple', () => {
                let count = 0;
                const factory = () => {
                    return Promise.resolve(++count);
                };
                const delayer = new async.$Dg(MicrotaskDelay.$cd);
                const promises = [];
                assert(!delayer.isTriggered());
                promises.push(delayer.trigger(factory).then((result) => { assert.strictEqual(result, 1); assert(!delayer.isTriggered()); }));
                assert(delayer.isTriggered());
                promises.push(delayer.trigger(factory).then((result) => { assert.strictEqual(result, 1); assert(!delayer.isTriggered()); }));
                assert(delayer.isTriggered());
                promises.push(delayer.trigger(factory).then((result) => { assert.strictEqual(result, 1); assert(!delayer.isTriggered()); }));
                assert(delayer.isTriggered());
                return Promise.all(promises).then(() => {
                    assert(!delayer.isTriggered());
                });
            });
            suite('ThrottledDelayer', () => {
                test('promise should resolve if disposed', async () => {
                    const throttledDelayer = new async.$Eg(100);
                    const promise = throttledDelayer.trigger(async () => { }, 0);
                    throttledDelayer.dispose();
                    try {
                        await promise;
                        assert.fail('SHOULD NOT BE HERE');
                    }
                    catch (err) {
                        // OK
                    }
                });
                test('trigger after dispose throws', async () => {
                    const throttledDelayer = new async.$Eg(100);
                    throttledDelayer.dispose();
                    await assert.rejects(() => throttledDelayer.trigger(async () => { }, 0));
                });
            });
            test('simple cancel', function () {
                let count = 0;
                const factory = () => {
                    return Promise.resolve(++count);
                };
                const delayer = new async.$Dg(0);
                assert(!delayer.isTriggered());
                const p = delayer.trigger(factory).then(() => {
                    assert(false);
                }, () => {
                    assert(true, 'yes, it was cancelled');
                });
                assert(delayer.isTriggered());
                delayer.cancel();
                assert(!delayer.isTriggered());
                return p;
            });
            test('simple cancel microtask', function () {
                let count = 0;
                const factory = () => {
                    return Promise.resolve(++count);
                };
                const delayer = new async.$Dg(MicrotaskDelay.$cd);
                assert(!delayer.isTriggered());
                const p = delayer.trigger(factory).then(() => {
                    assert(false);
                }, () => {
                    assert(true, 'yes, it was cancelled');
                });
                assert(delayer.isTriggered());
                delayer.cancel();
                assert(!delayer.isTriggered());
                return p;
            });
            test('cancel should cancel all calls to trigger', function () {
                let count = 0;
                const factory = () => {
                    return Promise.resolve(++count);
                };
                const delayer = new async.$Dg(0);
                const promises = [];
                assert(!delayer.isTriggered());
                promises.push(delayer.trigger(factory).then(undefined, () => { assert(true, 'yes, it was cancelled'); }));
                assert(delayer.isTriggered());
                promises.push(delayer.trigger(factory).then(undefined, () => { assert(true, 'yes, it was cancelled'); }));
                assert(delayer.isTriggered());
                promises.push(delayer.trigger(factory).then(undefined, () => { assert(true, 'yes, it was cancelled'); }));
                assert(delayer.isTriggered());
                delayer.cancel();
                return Promise.all(promises).then(() => {
                    assert(!delayer.isTriggered());
                });
            });
            test('trigger, cancel, then trigger again', function () {
                let count = 0;
                const factory = () => {
                    return Promise.resolve(++count);
                };
                const delayer = new async.$Dg(0);
                let promises = [];
                assert(!delayer.isTriggered());
                const p = delayer.trigger(factory).then((result) => {
                    assert.strictEqual(result, 1);
                    assert(!delayer.isTriggered());
                    promises.push(delayer.trigger(factory).then(undefined, () => { assert(true, 'yes, it was cancelled'); }));
                    assert(delayer.isTriggered());
                    promises.push(delayer.trigger(factory).then(undefined, () => { assert(true, 'yes, it was cancelled'); }));
                    assert(delayer.isTriggered());
                    delayer.cancel();
                    const p = Promise.all(promises).then(() => {
                        promises = [];
                        assert(!delayer.isTriggered());
                        promises.push(delayer.trigger(factory).then(() => { assert.strictEqual(result, 1); assert(!delayer.isTriggered()); }));
                        assert(delayer.isTriggered());
                        promises.push(delayer.trigger(factory).then(() => { assert.strictEqual(result, 1); assert(!delayer.isTriggered()); }));
                        assert(delayer.isTriggered());
                        const p = Promise.all(promises).then(() => {
                            assert(!delayer.isTriggered());
                        });
                        assert(delayer.isTriggered());
                        return p;
                    });
                    return p;
                });
                assert(delayer.isTriggered());
                return p;
            });
            test('last task should be the one getting called', function () {
                const factoryFactory = (n) => () => {
                    return Promise.resolve(n);
                };
                const delayer = new async.$Dg(0);
                const promises = [];
                assert(!delayer.isTriggered());
                promises.push(delayer.trigger(factoryFactory(1)).then((n) => { assert.strictEqual(n, 3); }));
                promises.push(delayer.trigger(factoryFactory(2)).then((n) => { assert.strictEqual(n, 3); }));
                promises.push(delayer.trigger(factoryFactory(3)).then((n) => { assert.strictEqual(n, 3); }));
                const p = Promise.all(promises).then(() => {
                    assert(!delayer.isTriggered());
                });
                assert(delayer.isTriggered());
                return p;
            });
        });
        suite('sequence', () => {
            test('simple', () => {
                const factoryFactory = (n) => () => {
                    return Promise.resolve(n);
                };
                return async.$Jg([
                    factoryFactory(1),
                    factoryFactory(2),
                    factoryFactory(3),
                    factoryFactory(4),
                    factoryFactory(5),
                ]).then((result) => {
                    assert.strictEqual(5, result.length);
                    assert.strictEqual(1, result[0]);
                    assert.strictEqual(2, result[1]);
                    assert.strictEqual(3, result[2]);
                    assert.strictEqual(4, result[3]);
                    assert.strictEqual(5, result[4]);
                });
            });
        });
        suite('Limiter', () => {
            test('assert degree of paralellism', function () {
                let activePromises = 0;
                const factoryFactory = (n) => () => {
                    activePromises++;
                    assert(activePromises < 6);
                    return async.$Hg(0).then(() => { activePromises--; return n; });
                };
                const limiter = new async.$Mg(5);
                const promises = [];
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(n => promises.push(limiter.queue(factoryFactory(n))));
                return Promise.all(promises).then((res) => {
                    assert.strictEqual(10, res.length);
                    assert.deepStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], res);
                });
            });
        });
        suite('Queue', () => {
            test('simple', function () {
                const queue = new async.$Ng();
                let syncPromise = false;
                const f1 = () => Promise.resolve(true).then(() => syncPromise = true);
                let asyncPromise = false;
                const f2 = () => async.$Hg(10).then(() => asyncPromise = true);
                assert.strictEqual(queue.size, 0);
                queue.queue(f1);
                assert.strictEqual(queue.size, 1);
                const p = queue.queue(f2);
                assert.strictEqual(queue.size, 2);
                return p.then(() => {
                    assert.strictEqual(queue.size, 0);
                    assert.ok(syncPromise);
                    assert.ok(asyncPromise);
                });
            });
            test('order is kept', function () {
                const queue = new async.$Ng();
                const res = [];
                const f1 = () => Promise.resolve(true).then(() => res.push(1));
                const f2 = () => async.$Hg(10).then(() => res.push(2));
                const f3 = () => Promise.resolve(true).then(() => res.push(3));
                const f4 = () => async.$Hg(20).then(() => res.push(4));
                const f5 = () => async.$Hg(0).then(() => res.push(5));
                queue.queue(f1);
                queue.queue(f2);
                queue.queue(f3);
                queue.queue(f4);
                return queue.queue(f5).then(() => {
                    assert.strictEqual(res[0], 1);
                    assert.strictEqual(res[1], 2);
                    assert.strictEqual(res[2], 3);
                    assert.strictEqual(res[3], 4);
                    assert.strictEqual(res[4], 5);
                });
            });
            test('errors bubble individually but not cause stop', function () {
                const queue = new async.$Ng();
                const res = [];
                let error = false;
                const f1 = () => Promise.resolve(true).then(() => res.push(1));
                const f2 = () => async.$Hg(10).then(() => res.push(2));
                const f3 = () => Promise.resolve(true).then(() => Promise.reject(new Error('error')));
                const f4 = () => async.$Hg(20).then(() => res.push(4));
                const f5 = () => async.$Hg(0).then(() => res.push(5));
                queue.queue(f1);
                queue.queue(f2);
                queue.queue(f3).then(undefined, () => error = true);
                queue.queue(f4);
                return queue.queue(f5).then(() => {
                    assert.strictEqual(res[0], 1);
                    assert.strictEqual(res[1], 2);
                    assert.ok(error);
                    assert.strictEqual(res[2], 4);
                    assert.strictEqual(res[3], 5);
                });
            });
            test('order is kept (chained)', function () {
                const queue = new async.$Ng();
                const res = [];
                const f1 = () => Promise.resolve(true).then(() => res.push(1));
                const f2 = () => async.$Hg(10).then(() => res.push(2));
                const f3 = () => Promise.resolve(true).then(() => res.push(3));
                const f4 = () => async.$Hg(20).then(() => res.push(4));
                const f5 = () => async.$Hg(0).then(() => res.push(5));
                return queue.queue(f1).then(() => {
                    return queue.queue(f2).then(() => {
                        return queue.queue(f3).then(() => {
                            return queue.queue(f4).then(() => {
                                return queue.queue(f5).then(() => {
                                    assert.strictEqual(res[0], 1);
                                    assert.strictEqual(res[1], 2);
                                    assert.strictEqual(res[2], 3);
                                    assert.strictEqual(res[3], 4);
                                    assert.strictEqual(res[4], 5);
                                });
                            });
                        });
                    });
                });
            });
            test('events', async function () {
                const queue = new async.$Ng();
                let drained = false;
                const onDrained = event_1.Event.toPromise(queue.onDrained).then(() => drained = true);
                const res = [];
                const f1 = () => async.$Hg(10).then(() => res.push(2));
                const f2 = () => async.$Hg(20).then(() => res.push(4));
                const f3 = () => async.$Hg(0).then(() => res.push(5));
                const q1 = queue.queue(f1);
                const q2 = queue.queue(f2);
                queue.queue(f3);
                q1.then(() => {
                    assert.ok(!drained);
                    q2.then(() => {
                        assert.ok(!drained);
                    });
                });
                await onDrained;
                assert.ok(drained);
            });
        });
        suite('ResourceQueue', () => {
            test('simple', async function () {
                const queue = new async.$Pg();
                await queue.whenDrained(); // returns immediately since empty
                const r1Queue = queue.queueFor(uri_1.URI.file('/some/path'));
                await queue.whenDrained(); // returns immediately since empty
                const r2Queue = queue.queueFor(uri_1.URI.file('/some/other/path'));
                await queue.whenDrained(); // returns immediately since empty
                assert.ok(r1Queue);
                assert.ok(r2Queue);
                assert.strictEqual(r1Queue, queue.queueFor(uri_1.URI.file('/some/path'))); // same queue returned
                // schedule some work
                const w1 = new async.$2g();
                r1Queue.queue(() => w1.p);
                let drained = false;
                queue.whenDrained().then(() => drained = true);
                assert.strictEqual(drained, false);
                await w1.complete();
                await async.$Hg(0);
                assert.strictEqual(drained, true);
                const r1Queue2 = queue.queueFor(uri_1.URI.file('/some/path'));
                assert.notStrictEqual(r1Queue, r1Queue2); // previous one got disposed after finishing
                // schedule some work
                const w2 = new async.$2g();
                const w3 = new async.$2g();
                r1Queue.queue(() => w2.p);
                r2Queue.queue(() => w3.p);
                drained = false;
                queue.whenDrained().then(() => drained = true);
                queue.dispose();
                await async.$Hg(0);
                assert.strictEqual(drained, true);
            });
        });
        suite('retry', () => {
            test('success case', async () => {
                return (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                    let counter = 0;
                    const res = await async.$Yg(() => {
                        counter++;
                        if (counter < 2) {
                            return Promise.reject(new Error('fail'));
                        }
                        return Promise.resolve(true);
                    }, 10, 3);
                    assert.strictEqual(res, true);
                });
            });
            test('error case', async () => {
                return (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                    const expectedError = new Error('fail');
                    try {
                        await async.$Yg(() => {
                            return Promise.reject(expectedError);
                        }, 10, 3);
                    }
                    catch (error) {
                        assert.strictEqual(error, error);
                    }
                });
            });
        });
        suite('TaskSequentializer', () => {
            test('execution basics', async function () {
                const sequentializer = new async.$Zg();
                assert.ok(!sequentializer.isRunning());
                assert.ok(!sequentializer.hasQueued());
                assert.ok(!sequentializer.isRunning(2323));
                assert.ok(!sequentializer.running);
                // pending removes itself after done
                await sequentializer.run(1, Promise.resolve());
                assert.ok(!sequentializer.isRunning());
                assert.ok(!sequentializer.isRunning(1));
                assert.ok(!sequentializer.running);
                assert.ok(!sequentializer.hasQueued());
                // pending removes itself after done (use async.timeout)
                sequentializer.run(2, async.$Hg(1));
                assert.ok(sequentializer.isRunning());
                assert.ok(sequentializer.isRunning(2));
                assert.ok(!sequentializer.hasQueued());
                assert.strictEqual(sequentializer.isRunning(1), false);
                assert.ok(sequentializer.running);
                await async.$Hg(2);
                assert.strictEqual(sequentializer.isRunning(), false);
                assert.strictEqual(sequentializer.isRunning(2), false);
                assert.ok(!sequentializer.running);
            });
            test('executing and queued (finishes instantly)', async function () {
                const sequentializer = new async.$Zg();
                let pendingDone = false;
                sequentializer.run(1, async.$Hg(1).then(() => { pendingDone = true; return; }));
                // queued finishes instantly
                let queuedDone = false;
                const res = sequentializer.queue(() => Promise.resolve(null).then(() => { queuedDone = true; return; }));
                assert.ok(sequentializer.hasQueued());
                await res;
                assert.ok(pendingDone);
                assert.ok(queuedDone);
                assert.ok(!sequentializer.hasQueued());
            });
            test('executing and queued (finishes after timeout)', async function () {
                const sequentializer = new async.$Zg();
                let pendingDone = false;
                sequentializer.run(1, async.$Hg(1).then(() => { pendingDone = true; return; }));
                // queued finishes after async.timeout
                let queuedDone = false;
                const res = sequentializer.queue(() => async.$Hg(1).then(() => { queuedDone = true; return; }));
                await res;
                assert.ok(pendingDone);
                assert.ok(queuedDone);
                assert.ok(!sequentializer.hasQueued());
            });
            test('join (without executing or queued)', async function () {
                const sequentializer = new async.$Zg();
                await sequentializer.join();
                assert.ok(!sequentializer.hasQueued());
            });
            test('join (without queued)', async function () {
                const sequentializer = new async.$Zg();
                let pendingDone = false;
                sequentializer.run(1, async.$Hg(1).then(() => { pendingDone = true; return; }));
                await sequentializer.join();
                assert.ok(pendingDone);
                assert.ok(!sequentializer.isRunning());
            });
            test('join (with executing and queued)', async function () {
                const sequentializer = new async.$Zg();
                let pendingDone = false;
                sequentializer.run(1, async.$Hg(1).then(() => { pendingDone = true; return; }));
                // queued finishes after async.timeout
                let queuedDone = false;
                sequentializer.queue(() => async.$Hg(1).then(() => { queuedDone = true; return; }));
                await sequentializer.join();
                assert.ok(pendingDone);
                assert.ok(queuedDone);
                assert.ok(!sequentializer.isRunning());
                assert.ok(!sequentializer.hasQueued());
            });
            test('executing and multiple queued (last one wins)', async function () {
                const sequentializer = new async.$Zg();
                let pendingDone = false;
                sequentializer.run(1, async.$Hg(1).then(() => { pendingDone = true; return; }));
                // queued finishes after async.timeout
                let firstDone = false;
                const firstRes = sequentializer.queue(() => async.$Hg(2).then(() => { firstDone = true; return; }));
                let secondDone = false;
                const secondRes = sequentializer.queue(() => async.$Hg(3).then(() => { secondDone = true; return; }));
                let thirdDone = false;
                const thirdRes = sequentializer.queue(() => async.$Hg(4).then(() => { thirdDone = true; return; }));
                await Promise.all([firstRes, secondRes, thirdRes]);
                assert.ok(pendingDone);
                assert.ok(!firstDone);
                assert.ok(!secondDone);
                assert.ok(thirdDone);
            });
            test('cancel executing', async function () {
                const sequentializer = new async.$Zg();
                const ctsTimeout = store.add(new cancellation_1.$pd());
                let pendingCancelled = false;
                const timeout = async.$Hg(1, ctsTimeout.token);
                sequentializer.run(1, timeout, () => pendingCancelled = true);
                sequentializer.cancelRunning();
                assert.ok(pendingCancelled);
                ctsTimeout.cancel();
            });
        });
        test('raceCancellation', async () => {
            const cts = store.add(new cancellation_1.$pd());
            const ctsTimeout = store.add(new cancellation_1.$pd());
            let triggered = false;
            const timeout = async.$Hg(100, ctsTimeout.token);
            const p = async.$vg(timeout.then(() => triggered = true), cts.token);
            cts.cancel();
            await p;
            assert.ok(!triggered);
            ctsTimeout.cancel();
        });
        test('raceTimeout', async () => {
            const cts = store.add(new cancellation_1.$pd());
            // timeout wins
            let timedout = false;
            let triggered = false;
            const ctsTimeout1 = store.add(new cancellation_1.$pd());
            const timeout1 = async.$Hg(100, ctsTimeout1.token);
            const p1 = async.$yg(timeout1.then(() => triggered = true), 1, () => timedout = true);
            cts.cancel();
            await p1;
            assert.ok(!triggered);
            assert.strictEqual(timedout, true);
            ctsTimeout1.cancel();
            // promise wins
            timedout = false;
            const ctsTimeout2 = store.add(new cancellation_1.$pd());
            const timeout2 = async.$Hg(1, ctsTimeout2.token);
            const p2 = async.$yg(timeout2.then(() => triggered = true), 100, () => timedout = true);
            cts.cancel();
            await p2;
            assert.ok(triggered);
            assert.strictEqual(timedout, false);
            ctsTimeout2.cancel();
        });
        test('SequencerByKey', async () => {
            const s = new async.$Cg();
            const r1 = await s.queue('key1', () => Promise.resolve('hello'));
            assert.strictEqual(r1, 'hello');
            await s.queue('key2', () => Promise.reject(new Error('failed'))).then(() => {
                throw new Error('should not be resolved');
            }, err => {
                // Expected error
                assert.strictEqual(err.message, 'failed');
            });
            // Still works after a queued promise is rejected
            const r3 = await s.queue('key2', () => Promise.resolve('hello'));
            assert.strictEqual(r3, 'hello');
        });
        test('IntervalCounter', async () => {
            let now = 0;
            const counter = new async.$1g(5, () => now);
            assert.strictEqual(counter.increment(), 1);
            assert.strictEqual(counter.increment(), 2);
            assert.strictEqual(counter.increment(), 3);
            now = 10;
            assert.strictEqual(counter.increment(), 1);
            assert.strictEqual(counter.increment(), 2);
            assert.strictEqual(counter.increment(), 3);
        });
        suite('firstParallel', () => {
            test('simple', async () => {
                const a = await async.$Lg([
                    Promise.resolve(1),
                    Promise.resolve(2),
                    Promise.resolve(3),
                ], v => v === 2);
                assert.strictEqual(a, 2);
            });
            test('uses null default', async () => {
                assert.strictEqual(await async.$Lg([Promise.resolve(1)], v => v === 2), null);
            });
            test('uses value default', async () => {
                assert.strictEqual(await async.$Lg([Promise.resolve(1)], v => v === 2, 4), 4);
            });
            test('empty', async () => {
                assert.strictEqual(await async.$Lg([], v => v === 2, 4), 4);
            });
            test('cancels', async () => {
                let ct1;
                const p1 = async.$ug(async (ct) => {
                    ct1 = ct;
                    await async.$Hg(200, ct);
                    return 1;
                });
                let ct2;
                const p2 = async.$ug(async (ct) => {
                    ct2 = ct;
                    await async.$Hg(2, ct);
                    return 2;
                });
                assert.strictEqual(await async.$Lg([p1, p2], v => v === 2, 4), 2);
                assert.strictEqual(ct1.isCancellationRequested, true, 'should cancel a');
                assert.strictEqual(ct2.isCancellationRequested, true, 'should cancel b');
            });
            test('rejection handling', async () => {
                let ct1;
                const p1 = async.$ug(async (ct) => {
                    ct1 = ct;
                    await async.$Hg(200, ct);
                    return 1;
                });
                let ct2;
                const p2 = async.$ug(async (ct) => {
                    ct2 = ct;
                    await async.$Hg(2, ct);
                    throw new Error('oh no');
                });
                assert.strictEqual(await async.$Lg([p1, p2], v => v === 2, 4).catch(() => 'ok'), 'ok');
                assert.strictEqual(ct1.isCancellationRequested, true, 'should cancel a');
                assert.strictEqual(ct2.isCancellationRequested, true, 'should cancel b');
            });
        });
        suite('DeferredPromise', () => {
            test('resolves', async () => {
                const deferred = new async.$2g();
                assert.strictEqual(deferred.isResolved, false);
                deferred.complete(42);
                assert.strictEqual(await deferred.p, 42);
                assert.strictEqual(deferred.isResolved, true);
            });
            test('rejects', async () => {
                const deferred = new async.$2g();
                assert.strictEqual(deferred.isRejected, false);
                const err = new Error('oh no!');
                deferred.error(err);
                assert.strictEqual(await deferred.p.catch(e => e), err);
                assert.strictEqual(deferred.isRejected, true);
            });
            test('cancels', async () => {
                const deferred = new async.$2g();
                assert.strictEqual(deferred.isRejected, false);
                deferred.cancel();
                assert.strictEqual((await deferred.p.catch(e => e)).name, 'Canceled');
                assert.strictEqual(deferred.isRejected, true);
            });
        });
        suite('Promises.settled', () => {
            test('resolves', async () => {
                const p1 = Promise.resolve(1);
                const p2 = async.$Hg(1).then(() => 2);
                const p3 = async.$Hg(2).then(() => 3);
                const result = await async.Promises.settled([p1, p2, p3]);
                assert.strictEqual(result.length, 3);
                assert.deepStrictEqual(result[0], 1);
                assert.deepStrictEqual(result[1], 2);
                assert.deepStrictEqual(result[2], 3);
            });
            test('resolves in order', async () => {
                const p1 = async.$Hg(2).then(() => 1);
                const p2 = async.$Hg(1).then(() => 2);
                const p3 = Promise.resolve(3);
                const result = await async.Promises.settled([p1, p2, p3]);
                assert.strictEqual(result.length, 3);
                assert.deepStrictEqual(result[0], 1);
                assert.deepStrictEqual(result[1], 2);
                assert.deepStrictEqual(result[2], 3);
            });
            test('rejects with first error but handles all promises (all errors)', async () => {
                const p1 = Promise.reject(1);
                let p2Handled = false;
                const p2Error = new Error('2');
                const p2 = async.$Hg(1).then(() => {
                    p2Handled = true;
                    throw p2Error;
                });
                let p3Handled = false;
                const p3Error = new Error('3');
                const p3 = async.$Hg(2).then(() => {
                    p3Handled = true;
                    throw p3Error;
                });
                let error = undefined;
                try {
                    await async.Promises.settled([p1, p2, p3]);
                }
                catch (e) {
                    error = e;
                }
                assert.ok(error);
                assert.notStrictEqual(error, p2Error);
                assert.notStrictEqual(error, p3Error);
                assert.ok(p2Handled);
                assert.ok(p3Handled);
            });
            test('rejects with first error but handles all promises (1 error)', async () => {
                const p1 = Promise.resolve(1);
                let p2Handled = false;
                const p2Error = new Error('2');
                const p2 = async.$Hg(1).then(() => {
                    p2Handled = true;
                    throw p2Error;
                });
                let p3Handled = false;
                const p3 = async.$Hg(2).then(() => {
                    p3Handled = true;
                    return 3;
                });
                let error = undefined;
                try {
                    await async.Promises.settled([p1, p2, p3]);
                }
                catch (e) {
                    error = e;
                }
                assert.strictEqual(error, p2Error);
                assert.ok(p2Handled);
                assert.ok(p3Handled);
            });
        });
        suite('Promises.withAsyncBody', () => {
            test('basics', async () => {
                const p1 = async.Promises.withAsyncBody(async (resolve, reject) => {
                    resolve(1);
                });
                const p2 = async.Promises.withAsyncBody(async (resolve, reject) => {
                    reject(new Error('error'));
                });
                const p3 = async.Promises.withAsyncBody(async (resolve, reject) => {
                    throw new Error('error');
                });
                const r1 = await p1;
                assert.strictEqual(r1, 1);
                let e2 = undefined;
                try {
                    await p2;
                }
                catch (error) {
                    e2 = error;
                }
                assert.ok(e2 instanceof Error);
                let e3 = undefined;
                try {
                    await p3;
                }
                catch (error) {
                    e3 = error;
                }
                assert.ok(e3 instanceof Error);
            });
        });
        suite('ThrottledWorker', () => {
            function assertArrayEquals(actual, expected) {
                assert.strictEqual(actual.length, expected.length);
                for (let i = 0; i < actual.length; i++) {
                    assert.strictEqual(actual[i], expected[i]);
                }
            }
            test('basics', async () => {
                let handled = [];
                let handledCallback;
                let handledPromise = new Promise(resolve => handledCallback = resolve);
                let handledCounterToResolve = 1;
                let currentHandledCounter = 0;
                const handler = (units) => {
                    handled.push(...units);
                    currentHandledCounter++;
                    if (currentHandledCounter === handledCounterToResolve) {
                        handledCallback();
                        handledPromise = new Promise(resolve => handledCallback = resolve);
                        currentHandledCounter = 0;
                    }
                };
                const worker = store.add(new async.$Vg({
                    maxWorkChunkSize: 5,
                    maxBufferedWork: undefined,
                    throttleDelay: 1
                }, handler));
                // Work less than chunk size
                let worked = worker.work([1, 2, 3]);
                assertArrayEquals(handled, [1, 2, 3]);
                assert.strictEqual(worker.pending, 0);
                assert.strictEqual(worked, true);
                worker.work([4, 5]);
                worked = worker.work([6]);
                assertArrayEquals(handled, [1, 2, 3, 4, 5, 6]);
                assert.strictEqual(worker.pending, 0);
                assert.strictEqual(worked, true);
                // Work more than chunk size (variant 1)
                handled = [];
                handledCounterToResolve = 2;
                worked = worker.work([1, 2, 3, 4, 5, 6, 7]);
                assertArrayEquals(handled, [1, 2, 3, 4, 5]);
                assert.strictEqual(worker.pending, 2);
                assert.strictEqual(worked, true);
                await handledPromise;
                assertArrayEquals(handled, [1, 2, 3, 4, 5, 6, 7]);
                handled = [];
                handledCounterToResolve = 4;
                worked = worker.work([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
                assertArrayEquals(handled, [1, 2, 3, 4, 5]);
                assert.strictEqual(worker.pending, 14);
                assert.strictEqual(worked, true);
                await handledPromise;
                assertArrayEquals(handled, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
                // Work more than chunk size (variant 2)
                handled = [];
                handledCounterToResolve = 2;
                worked = worker.work([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
                assertArrayEquals(handled, [1, 2, 3, 4, 5]);
                assert.strictEqual(worker.pending, 5);
                assert.strictEqual(worked, true);
                await handledPromise;
                assertArrayEquals(handled, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
                // Work more while throttled (variant 1)
                handled = [];
                handledCounterToResolve = 3;
                worked = worker.work([1, 2, 3, 4, 5, 6, 7]);
                assertArrayEquals(handled, [1, 2, 3, 4, 5]);
                assert.strictEqual(worker.pending, 2);
                assert.strictEqual(worked, true);
                worker.work([8]);
                worked = worker.work([9, 10, 11]);
                assertArrayEquals(handled, [1, 2, 3, 4, 5]);
                assert.strictEqual(worker.pending, 6);
                assert.strictEqual(worked, true);
                await handledPromise;
                assertArrayEquals(handled, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
                assert.strictEqual(worker.pending, 0);
                // Work more while throttled (variant 2)
                handled = [];
                handledCounterToResolve = 2;
                worked = worker.work([1, 2, 3, 4, 5, 6, 7]);
                assertArrayEquals(handled, [1, 2, 3, 4, 5]);
                assert.strictEqual(worked, true);
                worker.work([8]);
                worked = worker.work([9, 10]);
                assertArrayEquals(handled, [1, 2, 3, 4, 5]);
                assert.strictEqual(worked, true);
                await handledPromise;
                assertArrayEquals(handled, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            });
            test('do not accept too much work', async () => {
                const handled = [];
                const handler = (units) => handled.push(...units);
                const worker = store.add(new async.$Vg({
                    maxWorkChunkSize: 5,
                    maxBufferedWork: 5,
                    throttleDelay: 1
                }, handler));
                let worked = worker.work([1, 2, 3]);
                assert.strictEqual(worked, true);
                worked = worker.work([1, 2, 3, 4, 5, 6]);
                assert.strictEqual(worked, true);
                assert.strictEqual(worker.pending, 1);
                worked = worker.work([7]);
                assert.strictEqual(worked, true);
                assert.strictEqual(worker.pending, 2);
                worked = worker.work([8, 9, 10, 11]);
                assert.strictEqual(worked, false);
                assert.strictEqual(worker.pending, 2);
            });
            test('do not accept too much work (account for max chunk size', async () => {
                const handled = [];
                const handler = (units) => handled.push(...units);
                const worker = store.add(new async.$Vg({
                    maxWorkChunkSize: 5,
                    maxBufferedWork: 5,
                    throttleDelay: 1
                }, handler));
                let worked = worker.work([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
                assert.strictEqual(worked, false);
                assert.strictEqual(worker.pending, 0);
                worked = worker.work([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
                assert.strictEqual(worked, true);
                assert.strictEqual(worker.pending, 5);
            });
            test('disposed', async () => {
                const handled = [];
                const handler = (units) => handled.push(...units);
                const worker = store.add(new async.$Vg({
                    maxWorkChunkSize: 5,
                    maxBufferedWork: undefined,
                    throttleDelay: 1
                }, handler));
                worker.dispose();
                const worked = worker.work([1, 2, 3]);
                assertArrayEquals(handled, []);
                assert.strictEqual(worker.pending, 0);
                assert.strictEqual(worked, false);
            });
        });
        suite('LimitedQueue', () => {
            test('basics (with long running task)', async () => {
                const limitedQueue = new async.$Og();
                let counter = 0;
                const promises = [];
                for (let i = 0; i < 5; i++) {
                    promises.push(limitedQueue.queue(async () => {
                        counter = i;
                        await async.$Hg(1);
                    }));
                }
                await Promise.all(promises);
                // only the last task executed
                assert.strictEqual(counter, 4);
            });
            test('basics (with sync running task)', async () => {
                const limitedQueue = new async.$Og();
                let counter = 0;
                const promises = [];
                for (let i = 0; i < 5; i++) {
                    promises.push(limitedQueue.queue(async () => {
                        counter = i;
                    }));
                }
                await Promise.all(promises);
                // only the last task executed
                assert.strictEqual(counter, 4);
            });
        });
    });
});
//# sourceMappingURL=async.test.js.map