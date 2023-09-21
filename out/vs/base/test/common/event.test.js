define(["require", "exports", "assert", "sinon", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/symbols", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, sinon_1, async_1, cancellation_1, errors_1, event_1, lifecycle_1, observable_1, symbols_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Samples;
    (function (Samples) {
        class EventCounter {
            constructor() {
                this.count = 0;
            }
            reset() {
                this.count = 0;
            }
            onEvent() {
                this.count += 1;
            }
        }
        Samples.EventCounter = EventCounter;
        class Document3 {
            constructor() {
                this._onDidChange = new event_1.Emitter();
                this.onDidChange = this._onDidChange.event;
            }
            setText(value) {
                //...
                this._onDidChange.fire(value);
            }
        }
        Samples.Document3 = Document3;
    })(Samples || (Samples = {}));
    suite('Event utils dispose', function () {
        let tracker = new lifecycle_1.DisposableTracker();
        function assertDisposablesCount(expected) {
            if (Array.isArray(expected)) {
                const instances = new Set(expected);
                const actualInstances = tracker.getTrackedDisposables();
                assert.strictEqual(actualInstances.length, expected.length);
                for (const item of actualInstances) {
                    assert.ok(instances.has(item));
                }
            }
            else {
                assert.strictEqual(tracker.getTrackedDisposables().length, expected);
            }
        }
        setup(() => {
            tracker = new lifecycle_1.DisposableTracker();
            (0, lifecycle_1.setDisposableTracker)(tracker);
        });
        teardown(function () {
            (0, lifecycle_1.setDisposableTracker)(null);
        });
        test('no leak with snapshot-utils', function () {
            const store = new lifecycle_1.DisposableStore();
            const emitter = new event_1.Emitter();
            const evens = event_1.Event.filter(emitter.event, n => n % 2 === 0, store);
            assertDisposablesCount(1); // snaphot only listen when `evens` is being listened on
            let all = 0;
            const leaked = evens(n => all += n);
            assert.ok((0, lifecycle_1.isDisposable)(leaked));
            assertDisposablesCount(3);
            emitter.dispose();
            store.dispose();
            assertDisposablesCount([leaked]); // leaked is still there
        });
        test('no leak with debounce-util', function () {
            const store = new lifecycle_1.DisposableStore();
            const emitter = new event_1.Emitter();
            const debounced = event_1.Event.debounce(emitter.event, (l) => 0, undefined, undefined, undefined, undefined, store);
            assertDisposablesCount(1); // debounce only listens when `debounce` is being listened on
            let all = 0;
            const leaked = debounced(n => all += n);
            assert.ok((0, lifecycle_1.isDisposable)(leaked));
            assertDisposablesCount(3);
            emitter.dispose();
            store.dispose();
            assertDisposablesCount([leaked]); // leaked is still there
        });
    });
    suite('Event', function () {
        const counter = new Samples.EventCounter();
        setup(() => counter.reset());
        test('Emitter plain', function () {
            const doc = new Samples.Document3();
            const subscription = doc.onDidChange(counter.onEvent, counter);
            doc.setText('far');
            doc.setText('boo');
            // unhook listener
            subscription.dispose();
            doc.setText('boo');
            assert.strictEqual(counter.count, 2);
        });
        test('Emitter duplicate functions', () => {
            const calls = [];
            const a = (v) => calls.push(`a${v}`);
            const b = (v) => calls.push(`b${v}`);
            const emitter = new event_1.Emitter();
            emitter.event(a);
            emitter.event(b);
            const s2 = emitter.event(a);
            emitter.fire('1');
            assert.deepStrictEqual(calls, ['a1', 'b1', 'a1']);
            s2.dispose();
            calls.length = 0;
            emitter.fire('2');
            assert.deepStrictEqual(calls, ['a2', 'b2']);
        });
        test('Emitter, dispose listener during emission', () => {
            for (let keepFirstMod = 1; keepFirstMod < 4; keepFirstMod++) {
                const emitter = new event_1.Emitter();
                const calls = [];
                const disposables = Array.from({ length: 25 }, (_, n) => emitter.event(() => {
                    if (n % keepFirstMod === 0) {
                        disposables[n].dispose();
                    }
                    calls.push(n);
                }));
                emitter.fire();
                assert.deepStrictEqual(calls, Array.from({ length: 25 }, (_, n) => n));
            }
        });
        test('Emitter, dispose emitter during emission', () => {
            const emitter = new event_1.Emitter();
            const calls = [];
            const disposables = Array.from({ length: 25 }, (_, n) => emitter.event(() => {
                if (n === 10) {
                    emitter.dispose();
                }
                calls.push(n);
            }));
            emitter.fire();
            disposables.forEach(d => d.dispose());
            assert.deepStrictEqual(calls, Array.from({ length: 11 }, (_, n) => n));
        });
        test('Emitter, shared delivery queue', () => {
            const deliveryQueue = (0, event_1.createEventDeliveryQueue)();
            const emitter1 = new event_1.Emitter({ deliveryQueue });
            const emitter2 = new event_1.Emitter({ deliveryQueue });
            const calls = [];
            emitter1.event(d => { calls.push(`${d}a`); if (d === 1) {
                emitter2.fire(2);
            } });
            emitter1.event(d => { calls.push(`${d}b`); });
            emitter2.event(d => { calls.push(`${d}c`); emitter1.dispose(); });
            emitter2.event(d => { calls.push(`${d}d`); });
            emitter1.fire(1);
            // 1. Check that 2 is not delivered before 1 finishes
            // 2. Check that 2 finishes getting delivered even if one emitter is disposed
            assert.deepStrictEqual(calls, ['1a', '1b', '2c', '2d']);
        });
        test('Emitter, handles removal during 3', () => {
            const fn1 = (0, sinon_1.stub)();
            const fn2 = (0, sinon_1.stub)();
            const emitter = new event_1.Emitter();
            emitter.event(fn1);
            const h = emitter.event(() => {
                h.dispose();
            });
            emitter.event(fn2);
            emitter.fire('foo');
            assert.deepStrictEqual(fn2.args, [['foo']]);
            assert.deepStrictEqual(fn1.args, [['foo']]);
        });
        test('Emitter, handles removal during 2', () => {
            const fn1 = (0, sinon_1.stub)();
            const emitter = new event_1.Emitter();
            emitter.event(fn1);
            const h = emitter.event(() => {
                h.dispose();
            });
            emitter.fire('foo');
            assert.deepStrictEqual(fn1.args, [['foo']]);
        });
        test('Emitter, bucket', function () {
            const bucket = [];
            const doc = new Samples.Document3();
            const subscription = doc.onDidChange(counter.onEvent, counter, bucket);
            doc.setText('far');
            doc.setText('boo');
            // unhook listener
            while (bucket.length) {
                bucket.pop().dispose();
            }
            doc.setText('boo');
            // noop
            subscription.dispose();
            doc.setText('boo');
            assert.strictEqual(counter.count, 2);
        });
        test('Emitter, store', function () {
            const bucket = new lifecycle_1.DisposableStore();
            const doc = new Samples.Document3();
            const subscription = doc.onDidChange(counter.onEvent, counter, bucket);
            doc.setText('far');
            doc.setText('boo');
            // unhook listener
            bucket.clear();
            doc.setText('boo');
            // noop
            subscription.dispose();
            doc.setText('boo');
            assert.strictEqual(counter.count, 2);
        });
        test('onFirstAdd|onLastRemove', () => {
            let firstCount = 0;
            let lastCount = 0;
            const a = new event_1.Emitter({
                onWillAddFirstListener() { firstCount += 1; },
                onDidRemoveLastListener() { lastCount += 1; }
            });
            assert.strictEqual(firstCount, 0);
            assert.strictEqual(lastCount, 0);
            let subscription1 = a.event(function () { });
            const subscription2 = a.event(function () { });
            assert.strictEqual(firstCount, 1);
            assert.strictEqual(lastCount, 0);
            subscription1.dispose();
            assert.strictEqual(firstCount, 1);
            assert.strictEqual(lastCount, 0);
            subscription2.dispose();
            assert.strictEqual(firstCount, 1);
            assert.strictEqual(lastCount, 1);
            subscription1 = a.event(function () { });
            assert.strictEqual(firstCount, 2);
            assert.strictEqual(lastCount, 1);
        });
        test('onWillRemoveListener', () => {
            let count = 0;
            const a = new event_1.Emitter({
                onWillRemoveListener() { count += 1; }
            });
            assert.strictEqual(count, 0);
            let subscription = a.event(function () { });
            assert.strictEqual(count, 0);
            subscription.dispose();
            assert.strictEqual(count, 1);
            subscription = a.event(function () { });
            assert.strictEqual(count, 1);
        });
        test('throwingListener', () => {
            const origErrorHandler = errors_1.errorHandler.getUnexpectedErrorHandler();
            (0, errors_1.setUnexpectedErrorHandler)(() => null);
            try {
                const a = new event_1.Emitter();
                let hit = false;
                a.event(function () {
                    // eslint-disable-next-line no-throw-literal
                    throw 9;
                });
                a.event(function () {
                    hit = true;
                });
                a.fire(undefined);
                assert.strictEqual(hit, true);
            }
            finally {
                (0, errors_1.setUnexpectedErrorHandler)(origErrorHandler);
            }
        });
        test('throwingListener (custom handler)', () => {
            const allError = [];
            const a = new event_1.Emitter({
                onListenerError(e) { allError.push(e); }
            });
            let hit = false;
            a.event(function () {
                // eslint-disable-next-line no-throw-literal
                throw 9;
            });
            a.event(function () {
                hit = true;
            });
            a.fire(undefined);
            assert.strictEqual(hit, true);
            assert.deepStrictEqual(allError, [9]);
        });
        test('reusing event function and context', function () {
            let counter = 0;
            function listener() {
                counter += 1;
            }
            const context = {};
            const emitter = new event_1.Emitter();
            const reg1 = emitter.event(listener, context);
            const reg2 = emitter.event(listener, context);
            emitter.fire(undefined);
            assert.strictEqual(counter, 2);
            reg1.dispose();
            emitter.fire(undefined);
            assert.strictEqual(counter, 3);
            reg2.dispose();
            emitter.fire(undefined);
            assert.strictEqual(counter, 3);
        });
        test('DebounceEmitter', async function () {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async function () {
                let callCount = 0;
                let sum = 0;
                const emitter = new event_1.DebounceEmitter({
                    merge: arr => {
                        callCount += 1;
                        return arr.reduce((p, c) => p + c);
                    }
                });
                emitter.event(e => { sum = e; });
                const p = event_1.Event.toPromise(emitter.event);
                emitter.fire(1);
                emitter.fire(2);
                await p;
                assert.strictEqual(callCount, 1);
                assert.strictEqual(sum, 3);
            });
        });
        test('Microtask Emitter', (done) => {
            let count = 0;
            assert.strictEqual(count, 0);
            const emitter = new event_1.MicrotaskEmitter();
            const listener = emitter.event(() => {
                count++;
            });
            emitter.fire();
            assert.strictEqual(count, 0);
            emitter.fire();
            assert.strictEqual(count, 0);
            // Should wait until the event loop ends and therefore be the last thing called
            setTimeout(() => {
                assert.strictEqual(count, 3);
                done();
            }, 0);
            queueMicrotask(() => {
                assert.strictEqual(count, 2);
                count++;
                listener.dispose();
            });
        });
        test('Emitter - In Order Delivery', function () {
            const a = new event_1.Emitter();
            const listener2Events = [];
            a.event(function listener1(event) {
                if (event === 'e1') {
                    a.fire('e2');
                    // assert that all events are delivered at this point
                    assert.deepStrictEqual(listener2Events, ['e1', 'e2']);
                }
            });
            a.event(function listener2(event) {
                listener2Events.push(event);
            });
            a.fire('e1');
            // assert that all events are delivered in order
            assert.deepStrictEqual(listener2Events, ['e1', 'e2']);
        });
        test('Emitter, - In Order Delivery 3x', function () {
            const a = new event_1.Emitter();
            const listener2Events = [];
            a.event(function listener1(event) {
                if (event === 'e2') {
                    a.fire('e3');
                    // assert that all events are delivered at this point
                    assert.deepStrictEqual(listener2Events, ['e1', 'e2', 'e3']);
                }
            });
            a.event(function listener1(event) {
                if (event === 'e1') {
                    a.fire('e2');
                    // assert that all events are delivered at this point
                    assert.deepStrictEqual(listener2Events, ['e1', 'e2', 'e3']);
                }
            });
            a.event(function listener2(event) {
                listener2Events.push(event);
            });
            a.fire('e1');
            // assert that all events are delivered in order
            assert.deepStrictEqual(listener2Events, ['e1', 'e2', 'e3']);
        });
        test('Cannot read property \'_actual\' of undefined #142204', function () {
            const e = new event_1.Emitter();
            const dispo = e.event(() => { });
            dispo.dispose.call(undefined); // assert that disposable can be called with this
        });
    });
    suite('AsyncEmitter', function () {
        test('event has waitUntil-function', async function () {
            const emitter = new event_1.AsyncEmitter();
            emitter.event(e => {
                assert.strictEqual(e.foo, true);
                assert.strictEqual(e.bar, 1);
                assert.strictEqual(typeof e.waitUntil, 'function');
            });
            emitter.fireAsync({ foo: true, bar: 1, }, cancellation_1.CancellationToken.None);
            emitter.dispose();
        });
        test('sequential delivery', async function () {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async function () {
                let globalState = 0;
                const emitter = new event_1.AsyncEmitter();
                emitter.event(e => {
                    e.waitUntil((0, async_1.timeout)(10).then(_ => {
                        assert.strictEqual(globalState, 0);
                        globalState += 1;
                    }));
                });
                emitter.event(e => {
                    e.waitUntil((0, async_1.timeout)(1).then(_ => {
                        assert.strictEqual(globalState, 1);
                        globalState += 1;
                    }));
                });
                await emitter.fireAsync({ foo: true }, cancellation_1.CancellationToken.None);
                assert.strictEqual(globalState, 2);
            });
        });
        test('sequential, in-order delivery', async function () {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async function () {
                const events = [];
                let done = false;
                const emitter = new event_1.AsyncEmitter();
                // e1
                emitter.event(e => {
                    e.waitUntil((0, async_1.timeout)(10).then(async (_) => {
                        if (e.foo === 1) {
                            await emitter.fireAsync({ foo: 2 }, cancellation_1.CancellationToken.None);
                            assert.deepStrictEqual(events, [1, 2]);
                            done = true;
                        }
                    }));
                });
                // e2
                emitter.event(e => {
                    events.push(e.foo);
                    e.waitUntil((0, async_1.timeout)(7));
                });
                await emitter.fireAsync({ foo: 1 }, cancellation_1.CancellationToken.None);
                assert.ok(done);
            });
        });
        test('catch errors', async function () {
            const origErrorHandler = errors_1.errorHandler.getUnexpectedErrorHandler();
            (0, errors_1.setUnexpectedErrorHandler)(() => null);
            let globalState = 0;
            const emitter = new event_1.AsyncEmitter();
            emitter.event(e => {
                globalState += 1;
                e.waitUntil(new Promise((_r, reject) => reject(new Error())));
            });
            emitter.event(e => {
                globalState += 1;
                e.waitUntil((0, async_1.timeout)(10));
                e.waitUntil((0, async_1.timeout)(20).then(() => globalState++)); // multiple `waitUntil` are supported and awaited on
            });
            await emitter.fireAsync({ foo: true }, cancellation_1.CancellationToken.None).then(() => {
                assert.strictEqual(globalState, 3);
            }).catch(e => {
                console.log(e);
                assert.ok(false);
            });
            (0, errors_1.setUnexpectedErrorHandler)(origErrorHandler);
        });
    });
    suite('PausableEmitter', function () {
        test('basic', function () {
            const data = [];
            const emitter = new event_1.PauseableEmitter();
            emitter.event(e => data.push(e));
            emitter.fire(1);
            emitter.fire(2);
            assert.deepStrictEqual(data, [1, 2]);
        });
        test('pause/resume - no merge', function () {
            const data = [];
            const emitter = new event_1.PauseableEmitter();
            emitter.event(e => data.push(e));
            emitter.fire(1);
            emitter.fire(2);
            assert.deepStrictEqual(data, [1, 2]);
            emitter.pause();
            emitter.fire(3);
            emitter.fire(4);
            assert.deepStrictEqual(data, [1, 2]);
            emitter.resume();
            assert.deepStrictEqual(data, [1, 2, 3, 4]);
            emitter.fire(5);
            assert.deepStrictEqual(data, [1, 2, 3, 4, 5]);
        });
        test('pause/resume - merge', function () {
            const data = [];
            const emitter = new event_1.PauseableEmitter({ merge: (a) => a.reduce((p, c) => p + c, 0) });
            emitter.event(e => data.push(e));
            emitter.fire(1);
            emitter.fire(2);
            assert.deepStrictEqual(data, [1, 2]);
            emitter.pause();
            emitter.fire(3);
            emitter.fire(4);
            assert.deepStrictEqual(data, [1, 2]);
            emitter.resume();
            assert.deepStrictEqual(data, [1, 2, 7]);
            emitter.fire(5);
            assert.deepStrictEqual(data, [1, 2, 7, 5]);
        });
        test('double pause/resume', function () {
            const data = [];
            const emitter = new event_1.PauseableEmitter();
            emitter.event(e => data.push(e));
            emitter.fire(1);
            emitter.fire(2);
            assert.deepStrictEqual(data, [1, 2]);
            emitter.pause();
            emitter.pause();
            emitter.fire(3);
            emitter.fire(4);
            assert.deepStrictEqual(data, [1, 2]);
            emitter.resume();
            assert.deepStrictEqual(data, [1, 2]);
            emitter.resume();
            assert.deepStrictEqual(data, [1, 2, 3, 4]);
            emitter.resume();
            assert.deepStrictEqual(data, [1, 2, 3, 4]);
        });
        test('resume, no pause', function () {
            const data = [];
            const emitter = new event_1.PauseableEmitter();
            emitter.event(e => data.push(e));
            emitter.fire(1);
            emitter.fire(2);
            assert.deepStrictEqual(data, [1, 2]);
            emitter.resume();
            emitter.fire(3);
            assert.deepStrictEqual(data, [1, 2, 3]);
        });
        test('nested pause', function () {
            const data = [];
            const emitter = new event_1.PauseableEmitter();
            let once = true;
            emitter.event(e => {
                data.push(e);
                if (once) {
                    emitter.pause();
                    once = false;
                }
            });
            emitter.event(e => {
                data.push(e);
            });
            emitter.pause();
            emitter.fire(1);
            emitter.fire(2);
            assert.deepStrictEqual(data, []);
            emitter.resume();
            assert.deepStrictEqual(data, [1, 1]); // paused after first event
            emitter.resume();
            assert.deepStrictEqual(data, [1, 1, 2, 2]); // remaing event delivered
            emitter.fire(3);
            assert.deepStrictEqual(data, [1, 1, 2, 2, 3, 3]);
        });
        test('empty pause with merge', function () {
            const data = [];
            const emitter = new event_1.PauseableEmitter({ merge: a => a[0] });
            emitter.event(e => data.push(1));
            emitter.pause();
            emitter.resume();
            assert.deepStrictEqual(data, []);
        });
    });
    suite('Event utils - ensureNoDisposablesAreLeakedInTestSuite', function () {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('fromObservable', function () {
            const obs = (0, observable_1.observableValue)('test', 12);
            const event = event_1.Event.fromObservable(obs);
            const values = [];
            const d = event(n => { values.push(n); });
            obs.set(3, undefined);
            obs.set(13, undefined);
            obs.set(3, undefined);
            obs.set(33, undefined);
            obs.set(1, undefined);
            (0, observable_1.transaction)(tx => {
                obs.set(334, tx);
                obs.set(99, tx);
            });
            assert.deepStrictEqual(values, ([3, 13, 3, 33, 1, 99]));
            d.dispose();
        });
    });
    suite('Event utils', () => {
        suite('EventBufferer', () => {
            test('should not buffer when not wrapped', () => {
                const bufferer = new event_1.EventBufferer();
                const counter = new Samples.EventCounter();
                const emitter = new event_1.Emitter();
                const event = bufferer.wrapEvent(emitter.event);
                const listener = event(counter.onEvent, counter);
                assert.strictEqual(counter.count, 0);
                emitter.fire();
                assert.strictEqual(counter.count, 1);
                emitter.fire();
                assert.strictEqual(counter.count, 2);
                emitter.fire();
                assert.strictEqual(counter.count, 3);
                listener.dispose();
            });
            test('should buffer when wrapped', () => {
                const bufferer = new event_1.EventBufferer();
                const counter = new Samples.EventCounter();
                const emitter = new event_1.Emitter();
                const event = bufferer.wrapEvent(emitter.event);
                const listener = event(counter.onEvent, counter);
                assert.strictEqual(counter.count, 0);
                emitter.fire();
                assert.strictEqual(counter.count, 1);
                bufferer.bufferEvents(() => {
                    emitter.fire();
                    assert.strictEqual(counter.count, 1);
                    emitter.fire();
                    assert.strictEqual(counter.count, 1);
                });
                assert.strictEqual(counter.count, 3);
                emitter.fire();
                assert.strictEqual(counter.count, 4);
                listener.dispose();
            });
            test('once', () => {
                const emitter = new event_1.Emitter();
                let counter1 = 0, counter2 = 0, counter3 = 0;
                const listener1 = emitter.event(() => counter1++);
                const listener2 = event_1.Event.once(emitter.event)(() => counter2++);
                const listener3 = event_1.Event.once(emitter.event)(() => counter3++);
                assert.strictEqual(counter1, 0);
                assert.strictEqual(counter2, 0);
                assert.strictEqual(counter3, 0);
                listener3.dispose();
                emitter.fire();
                assert.strictEqual(counter1, 1);
                assert.strictEqual(counter2, 1);
                assert.strictEqual(counter3, 0);
                emitter.fire();
                assert.strictEqual(counter1, 2);
                assert.strictEqual(counter2, 1);
                assert.strictEqual(counter3, 0);
                listener1.dispose();
                listener2.dispose();
            });
        });
        suite('buffer', () => {
            test('should buffer events', () => {
                const result = [];
                const emitter = new event_1.Emitter();
                const event = emitter.event;
                const bufferedEvent = event_1.Event.buffer(event);
                emitter.fire(1);
                emitter.fire(2);
                emitter.fire(3);
                assert.deepStrictEqual(result, []);
                const listener = bufferedEvent(num => result.push(num));
                assert.deepStrictEqual(result, [1, 2, 3]);
                emitter.fire(4);
                assert.deepStrictEqual(result, [1, 2, 3, 4]);
                listener.dispose();
                emitter.fire(5);
                assert.deepStrictEqual(result, [1, 2, 3, 4]);
            });
            test('should buffer events on next tick', async () => {
                const result = [];
                const emitter = new event_1.Emitter();
                const event = emitter.event;
                const bufferedEvent = event_1.Event.buffer(event, true);
                emitter.fire(1);
                emitter.fire(2);
                emitter.fire(3);
                assert.deepStrictEqual(result, []);
                const listener = bufferedEvent(num => result.push(num));
                assert.deepStrictEqual(result, []);
                await (0, async_1.timeout)(10);
                emitter.fire(4);
                assert.deepStrictEqual(result, [1, 2, 3, 4]);
                listener.dispose();
                emitter.fire(5);
                assert.deepStrictEqual(result, [1, 2, 3, 4]);
            });
            test('should fire initial buffer events', () => {
                const result = [];
                const emitter = new event_1.Emitter();
                const event = emitter.event;
                const bufferedEvent = event_1.Event.buffer(event, false, [-2, -1, 0]);
                emitter.fire(1);
                emitter.fire(2);
                emitter.fire(3);
                assert.deepStrictEqual(result, []);
                bufferedEvent(num => result.push(num));
                assert.deepStrictEqual(result, [-2, -1, 0, 1, 2, 3]);
            });
        });
        suite('EventMultiplexer', () => {
            test('works', () => {
                const result = [];
                const m = new event_1.EventMultiplexer();
                m.event(r => result.push(r));
                const e1 = new event_1.Emitter();
                m.add(e1.event);
                assert.deepStrictEqual(result, []);
                e1.fire(0);
                assert.deepStrictEqual(result, [0]);
            });
            test('multiplexer dispose works', () => {
                const result = [];
                const m = new event_1.EventMultiplexer();
                m.event(r => result.push(r));
                const e1 = new event_1.Emitter();
                m.add(e1.event);
                assert.deepStrictEqual(result, []);
                e1.fire(0);
                assert.deepStrictEqual(result, [0]);
                m.dispose();
                assert.deepStrictEqual(result, [0]);
                e1.fire(0);
                assert.deepStrictEqual(result, [0]);
            });
            test('event dispose works', () => {
                const result = [];
                const m = new event_1.EventMultiplexer();
                m.event(r => result.push(r));
                const e1 = new event_1.Emitter();
                m.add(e1.event);
                assert.deepStrictEqual(result, []);
                e1.fire(0);
                assert.deepStrictEqual(result, [0]);
                e1.dispose();
                assert.deepStrictEqual(result, [0]);
                e1.fire(0);
                assert.deepStrictEqual(result, [0]);
            });
            test('mutliplexer event dispose works', () => {
                const result = [];
                const m = new event_1.EventMultiplexer();
                m.event(r => result.push(r));
                const e1 = new event_1.Emitter();
                const l1 = m.add(e1.event);
                assert.deepStrictEqual(result, []);
                e1.fire(0);
                assert.deepStrictEqual(result, [0]);
                l1.dispose();
                assert.deepStrictEqual(result, [0]);
                e1.fire(0);
                assert.deepStrictEqual(result, [0]);
            });
            test('hot start works', () => {
                const result = [];
                const m = new event_1.EventMultiplexer();
                m.event(r => result.push(r));
                const e1 = new event_1.Emitter();
                m.add(e1.event);
                const e2 = new event_1.Emitter();
                m.add(e2.event);
                const e3 = new event_1.Emitter();
                m.add(e3.event);
                e1.fire(1);
                e2.fire(2);
                e3.fire(3);
                assert.deepStrictEqual(result, [1, 2, 3]);
            });
            test('cold start works', () => {
                const result = [];
                const m = new event_1.EventMultiplexer();
                const e1 = new event_1.Emitter();
                m.add(e1.event);
                const e2 = new event_1.Emitter();
                m.add(e2.event);
                const e3 = new event_1.Emitter();
                m.add(e3.event);
                m.event(r => result.push(r));
                e1.fire(1);
                e2.fire(2);
                e3.fire(3);
                assert.deepStrictEqual(result, [1, 2, 3]);
            });
            test('late add works', () => {
                const result = [];
                const m = new event_1.EventMultiplexer();
                const e1 = new event_1.Emitter();
                m.add(e1.event);
                const e2 = new event_1.Emitter();
                m.add(e2.event);
                m.event(r => result.push(r));
                e1.fire(1);
                e2.fire(2);
                const e3 = new event_1.Emitter();
                m.add(e3.event);
                e3.fire(3);
                assert.deepStrictEqual(result, [1, 2, 3]);
            });
            test('add dispose works', () => {
                const result = [];
                const m = new event_1.EventMultiplexer();
                const e1 = new event_1.Emitter();
                m.add(e1.event);
                const e2 = new event_1.Emitter();
                m.add(e2.event);
                m.event(r => result.push(r));
                e1.fire(1);
                e2.fire(2);
                const e3 = new event_1.Emitter();
                const l3 = m.add(e3.event);
                e3.fire(3);
                assert.deepStrictEqual(result, [1, 2, 3]);
                l3.dispose();
                e3.fire(4);
                assert.deepStrictEqual(result, [1, 2, 3]);
                e2.fire(4);
                e1.fire(5);
                assert.deepStrictEqual(result, [1, 2, 3, 4, 5]);
            });
        });
        suite('DynamicListEventMultiplexer', () => {
            const recordedEvents = [];
            const addEmitter = new event_1.Emitter();
            const removeEmitter = new event_1.Emitter();
            class TestItem {
                constructor() {
                    this.onTestEventEmitter = new event_1.Emitter();
                    this.onTestEvent = this.onTestEventEmitter.event;
                }
            }
            let items;
            let m;
            setup(() => {
                items = [new TestItem(), new TestItem()];
                for (const [i, item] of items.entries()) {
                    item.onTestEvent(e => `${i}:${e}`);
                }
                m = new event_1.DynamicListEventMultiplexer(items, addEmitter.event, removeEmitter.event, e => e.onTestEvent);
                m.event(e => recordedEvents.push(e));
                recordedEvents.length = 0;
            });
            teardown(() => m.dispose());
            test('should fire events for initial items', () => {
                items[0].onTestEventEmitter.fire(1);
                items[1].onTestEventEmitter.fire(2);
                items[0].onTestEventEmitter.fire(3);
                items[1].onTestEventEmitter.fire(4);
                assert.deepStrictEqual(recordedEvents, [1, 2, 3, 4]);
            });
            test('should fire events for added items', () => {
                const addedItem = new TestItem();
                addEmitter.fire(addedItem);
                addedItem.onTestEventEmitter.fire(1);
                items[0].onTestEventEmitter.fire(2);
                items[1].onTestEventEmitter.fire(3);
                addedItem.onTestEventEmitter.fire(4);
                assert.deepStrictEqual(recordedEvents, [1, 2, 3, 4]);
            });
            test('should not fire events for removed items', () => {
                removeEmitter.fire(items[0]);
                items[0].onTestEventEmitter.fire(1);
                items[1].onTestEventEmitter.fire(2);
                items[0].onTestEventEmitter.fire(3);
                items[1].onTestEventEmitter.fire(4);
                assert.deepStrictEqual(recordedEvents, [2, 4]);
            });
        });
        test('latch', () => {
            const emitter = new event_1.Emitter();
            const event = event_1.Event.latch(emitter.event);
            const result = [];
            const listener = event(num => result.push(num));
            assert.deepStrictEqual(result, []);
            emitter.fire(1);
            assert.deepStrictEqual(result, [1]);
            emitter.fire(2);
            assert.deepStrictEqual(result, [1, 2]);
            emitter.fire(2);
            assert.deepStrictEqual(result, [1, 2]);
            emitter.fire(1);
            assert.deepStrictEqual(result, [1, 2, 1]);
            emitter.fire(1);
            assert.deepStrictEqual(result, [1, 2, 1]);
            emitter.fire(3);
            assert.deepStrictEqual(result, [1, 2, 1, 3]);
            emitter.fire(3);
            assert.deepStrictEqual(result, [1, 2, 1, 3]);
            emitter.fire(3);
            assert.deepStrictEqual(result, [1, 2, 1, 3]);
            listener.dispose();
        });
        test('dispose is reentrant', () => {
            const emitter = new event_1.Emitter({
                onDidRemoveLastListener: () => {
                    emitter.dispose();
                }
            });
            const listener = emitter.event(() => undefined);
            listener.dispose(); // should not crash
        });
        suite('fromPromise', () => {
            test('not yet resolved', async function () {
                return new Promise(resolve => {
                    let promise = new async_1.DeferredPromise();
                    event_1.Event.fromPromise(promise.p)(e => {
                        assert.strictEqual(e, 1);
                        promise = new async_1.DeferredPromise();
                        event_1.Event.fromPromise(promise.p)(() => {
                            resolve();
                        });
                        promise.error(undefined);
                    });
                    promise.complete(1);
                });
            });
            test('already resolved', async function () {
                return new Promise(resolve => {
                    let promise = new async_1.DeferredPromise();
                    promise.complete(1);
                    event_1.Event.fromPromise(promise.p)(e => {
                        assert.strictEqual(e, 1);
                        promise = new async_1.DeferredPromise();
                        promise.error(undefined);
                        event_1.Event.fromPromise(promise.p)(() => {
                            resolve();
                        });
                    });
                });
            });
        });
        suite('Relay', () => {
            test('should input work', () => {
                const e1 = new event_1.Emitter();
                const e2 = new event_1.Emitter();
                const relay = new event_1.Relay();
                const result = [];
                const listener = (num) => result.push(num);
                const subscription = relay.event(listener);
                e1.fire(1);
                assert.deepStrictEqual(result, []);
                relay.input = e1.event;
                e1.fire(2);
                assert.deepStrictEqual(result, [2]);
                relay.input = e2.event;
                e1.fire(3);
                e2.fire(4);
                assert.deepStrictEqual(result, [2, 4]);
                subscription.dispose();
                e1.fire(5);
                e2.fire(6);
                assert.deepStrictEqual(result, [2, 4]);
            });
            test('should Relay dispose work', () => {
                const e1 = new event_1.Emitter();
                const e2 = new event_1.Emitter();
                const relay = new event_1.Relay();
                const result = [];
                const listener = (num) => result.push(num);
                relay.event(listener);
                e1.fire(1);
                assert.deepStrictEqual(result, []);
                relay.input = e1.event;
                e1.fire(2);
                assert.deepStrictEqual(result, [2]);
                relay.input = e2.event;
                e1.fire(3);
                e2.fire(4);
                assert.deepStrictEqual(result, [2, 4]);
                relay.dispose();
                e1.fire(5);
                e2.fire(6);
                assert.deepStrictEqual(result, [2, 4]);
            });
        });
        test('runAndSubscribeWithStore', () => {
            const eventEmitter = new event_1.Emitter();
            const event = eventEmitter.event;
            let i = 0;
            const log = new Array();
            const disposable = event_1.Event.runAndSubscribeWithStore(event, (e, disposables) => {
                const idx = i++;
                log.push({ label: 'handleEvent', data: e || null, idx });
                disposables.add((0, lifecycle_1.toDisposable)(() => {
                    log.push({ label: 'dispose', idx });
                }));
            });
            log.push({ label: 'fire' });
            eventEmitter.fire('someEventData');
            log.push({ label: 'disposeAll' });
            disposable.dispose();
            assert.deepStrictEqual(log, [
                { label: 'handleEvent', data: null, idx: 0 },
                { label: 'fire' },
                { label: 'dispose', idx: 0 },
                { label: 'handleEvent', data: 'someEventData', idx: 1 },
                { label: 'disposeAll' },
                { label: 'dispose', idx: 1 },
            ]);
        });
        suite('accumulate', () => {
            test('should not fire after a listener is disposed with undefined or []', async () => {
                const eventEmitter = new event_1.Emitter();
                const event = eventEmitter.event;
                const accumulated = event_1.Event.accumulate(event, 0);
                const calls1 = [];
                const calls2 = [];
                const listener1 = accumulated((e) => calls1.push(e));
                accumulated((e) => calls2.push(e));
                eventEmitter.fire(1);
                await (0, async_1.timeout)(1);
                assert.deepStrictEqual(calls1, [[1]]);
                assert.deepStrictEqual(calls2, [[1]]);
                listener1.dispose();
                await (0, async_1.timeout)(1);
                assert.deepStrictEqual(calls1, [[1]]);
                assert.deepStrictEqual(calls2, [[1]], 'should not fire after a listener is disposed with undefined or []');
            });
            test('should accumulate a single event', async () => {
                const eventEmitter = new event_1.Emitter();
                const event = eventEmitter.event;
                const accumulated = event_1.Event.accumulate(event, 0);
                const results1 = await new Promise(r => {
                    accumulated(r);
                    eventEmitter.fire(1);
                });
                assert.deepStrictEqual(results1, [1]);
                const results2 = await new Promise(r => {
                    accumulated(r);
                    eventEmitter.fire(2);
                });
                assert.deepStrictEqual(results2, [2]);
            });
            test('should accumulate multiple events', async () => {
                const eventEmitter = new event_1.Emitter();
                const event = eventEmitter.event;
                const accumulated = event_1.Event.accumulate(event, 0);
                const results1 = await new Promise(r => {
                    accumulated(r);
                    eventEmitter.fire(1);
                    eventEmitter.fire(2);
                    eventEmitter.fire(3);
                });
                assert.deepStrictEqual(results1, [1, 2, 3]);
                const results2 = await new Promise(r => {
                    accumulated(r);
                    eventEmitter.fire(4);
                    eventEmitter.fire(5);
                    eventEmitter.fire(6);
                    eventEmitter.fire(7);
                    eventEmitter.fire(8);
                });
                assert.deepStrictEqual(results2, [4, 5, 6, 7, 8]);
            });
        });
        suite('debounce', () => {
            test('simple', function (done) {
                const doc = new Samples.Document3();
                const onDocDidChange = event_1.Event.debounce(doc.onDidChange, (prev, cur) => {
                    if (!prev) {
                        prev = [cur];
                    }
                    else if (prev.indexOf(cur) < 0) {
                        prev.push(cur);
                    }
                    return prev;
                }, 10);
                let count = 0;
                onDocDidChange(keys => {
                    count++;
                    assert.ok(keys, 'was not expecting keys.');
                    if (count === 1) {
                        doc.setText('4');
                        assert.deepStrictEqual(keys, ['1', '2', '3']);
                    }
                    else if (count === 2) {
                        assert.deepStrictEqual(keys, ['4']);
                        done();
                    }
                });
                doc.setText('1');
                doc.setText('2');
                doc.setText('3');
            });
            test('microtask', function (done) {
                const doc = new Samples.Document3();
                const onDocDidChange = event_1.Event.debounce(doc.onDidChange, (prev, cur) => {
                    if (!prev) {
                        prev = [cur];
                    }
                    else if (prev.indexOf(cur) < 0) {
                        prev.push(cur);
                    }
                    return prev;
                }, symbols_1.MicrotaskDelay);
                let count = 0;
                onDocDidChange(keys => {
                    count++;
                    assert.ok(keys, 'was not expecting keys.');
                    if (count === 1) {
                        doc.setText('4');
                        assert.deepStrictEqual(keys, ['1', '2', '3']);
                    }
                    else if (count === 2) {
                        assert.deepStrictEqual(keys, ['4']);
                        done();
                    }
                });
                doc.setText('1');
                doc.setText('2');
                doc.setText('3');
            });
            test('leading', async function () {
                const emitter = new event_1.Emitter();
                const debounced = event_1.Event.debounce(emitter.event, (l, e) => e, 0, /*leading=*/ true);
                let calls = 0;
                debounced(() => {
                    calls++;
                });
                // If the source event is fired once, the debounced (on the leading edge) event should be fired only once
                emitter.fire();
                await (0, async_1.timeout)(1);
                assert.strictEqual(calls, 1);
            });
            test('leading (2)', async function () {
                const emitter = new event_1.Emitter();
                const debounced = event_1.Event.debounce(emitter.event, (l, e) => e, 0, /*leading=*/ true);
                let calls = 0;
                debounced(() => {
                    calls++;
                });
                // If the source event is fired multiple times, the debounced (on the leading edge) event should be fired twice
                emitter.fire();
                emitter.fire();
                emitter.fire();
                await (0, async_1.timeout)(1);
                assert.strictEqual(calls, 2);
            });
            test('leading reset', async function () {
                const emitter = new event_1.Emitter();
                const debounced = event_1.Event.debounce(emitter.event, (l, e) => l ? l + 1 : 1, 0, /*leading=*/ true);
                const calls = [];
                debounced((e) => calls.push(e));
                emitter.fire(1);
                emitter.fire(1);
                await (0, async_1.timeout)(1);
                assert.deepStrictEqual(calls, [1, 1]);
            });
            test('should not flush events when a listener is disposed', async () => {
                const emitter = new event_1.Emitter();
                const debounced = event_1.Event.debounce(emitter.event, (l, e) => l ? l + 1 : 1, 0);
                const calls = [];
                const listener = debounced((e) => calls.push(e));
                emitter.fire(1);
                listener.dispose();
                emitter.fire(1);
                await (0, async_1.timeout)(1);
                assert.deepStrictEqual(calls, []);
            });
            test('flushOnListenerRemove - should flush events when a listener is disposed', async () => {
                const emitter = new event_1.Emitter();
                const debounced = event_1.Event.debounce(emitter.event, (l, e) => l ? l + 1 : 1, 0, undefined, true);
                const calls = [];
                const listener = debounced((e) => calls.push(e));
                emitter.fire(1);
                listener.dispose();
                emitter.fire(1);
                await (0, async_1.timeout)(1);
                assert.deepStrictEqual(calls, [1], 'should fire with the first event, not the second (after listener dispose)');
            });
            test('should flush events when the emitter is disposed', async () => {
                const emitter = new event_1.Emitter();
                const debounced = event_1.Event.debounce(emitter.event, (l, e) => l ? l + 1 : 1, 0);
                const calls = [];
                debounced((e) => calls.push(e));
                emitter.fire(1);
                emitter.dispose();
                await (0, async_1.timeout)(1);
                assert.deepStrictEqual(calls, [1]);
            });
        });
        suite('chain2', () => {
            let store;
            let em;
            let calls;
            teardown(() => {
                store.dispose();
            });
            (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
            setup(() => {
                store = new lifecycle_1.DisposableStore();
                em = new event_1.Emitter();
                store.add(em);
                calls = [];
            });
            test('maps', () => {
                const ev = event_1.Event.chain(em.event, $ => $.map(v => v * 2));
                store.add(ev(v => calls.push(v)));
                em.fire(1);
                em.fire(2);
                em.fire(3);
                assert.deepStrictEqual(calls, [2, 4, 6]);
            });
            test('filters', () => {
                const ev = event_1.Event.chain(em.event, $ => $.filter(v => v % 2 === 0));
                store.add(ev(v => calls.push(v)));
                em.fire(1);
                em.fire(2);
                em.fire(3);
                em.fire(4);
                assert.deepStrictEqual(calls, [2, 4]);
            });
            test('reduces', () => {
                const ev = event_1.Event.chain(em.event, $ => $.reduce((acc, v) => acc + v, 0));
                store.add(ev(v => calls.push(v)));
                em.fire(1);
                em.fire(2);
                em.fire(3);
                em.fire(4);
                assert.deepStrictEqual(calls, [1, 3, 6, 10]);
            });
            test('latches', () => {
                const ev = event_1.Event.chain(em.event, $ => $.latch());
                store.add(ev(v => calls.push(v)));
                em.fire(1);
                em.fire(1);
                em.fire(2);
                em.fire(2);
                em.fire(3);
                em.fire(3);
                em.fire(1);
                assert.deepStrictEqual(calls, [1, 2, 3, 1]);
            });
            test('does everything', () => {
                const ev = event_1.Event.chain(em.event, $ => $
                    .filter(v => v % 2 === 0)
                    .map(v => v * 2)
                    .reduce((acc, v) => acc + v, 0)
                    .latch());
                store.add(ev(v => calls.push(v)));
                em.fire(1);
                em.fire(2);
                em.fire(3);
                em.fire(4);
                em.fire(0);
                assert.deepStrictEqual(calls, [4, 12]);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvdGVzdC9jb21tb24vZXZlbnQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFnQkEsSUFBVSxPQUFPLENBMkJoQjtJQTNCRCxXQUFVLE9BQU87UUFFaEIsTUFBYSxZQUFZO1lBQXpCO2dCQUVDLFVBQUssR0FBRyxDQUFDLENBQUM7WUFTWCxDQUFDO1lBUEEsS0FBSztnQkFDSixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNoQixDQUFDO1lBRUQsT0FBTztnQkFDTixJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztZQUNqQixDQUFDO1NBQ0Q7UUFYWSxvQkFBWSxlQVd4QixDQUFBO1FBRUQsTUFBYSxTQUFTO1lBQXRCO2dCQUVrQixpQkFBWSxHQUFHLElBQUksZUFBTyxFQUFVLENBQUM7Z0JBRXRELGdCQUFXLEdBQWtCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBT3RELENBQUM7WUFMQSxPQUFPLENBQUMsS0FBYTtnQkFDcEIsS0FBSztnQkFDTCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixDQUFDO1NBRUQ7UUFYWSxpQkFBUyxZQVdyQixDQUFBO0lBQ0YsQ0FBQyxFQTNCUyxPQUFPLEtBQVAsT0FBTyxRQTJCaEI7SUFFRCxLQUFLLENBQUMscUJBQXFCLEVBQUU7UUFFNUIsSUFBSSxPQUFPLEdBQUcsSUFBSSw2QkFBaUIsRUFBRSxDQUFDO1FBRXRDLFNBQVMsc0JBQXNCLENBQUMsUUFBcUM7WUFDcEUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUM1QixNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDcEMsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFD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Q0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUMsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtnQkFDcEIsTUFBTSxFQUFFLEdBQUcsYUFBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7Z0JBQ3BCLE1BQU0sRUFBRSxHQUFHLGFBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlDLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7Z0JBQ3BCLE1BQU0sRUFBRSxHQUFHLGFBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7Z0JBQzVCLE1BQU0sRUFBRSxHQUFHLGFBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNmLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUM5QixLQUFLLEVBQUUsQ0FDUixDQUFDO2dCQUVGLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9