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
                this.f = new event_1.$fd();
                this.onDidChange = this.f.event;
            }
            setText(value) {
                //...
                this.f.fire(value);
            }
        }
        Samples.Document3 = Document3;
    })(Samples || (Samples = {}));
    suite('Event utils dispose', function () {
        let tracker = new lifecycle_1.$_b();
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
            tracker = new lifecycle_1.$_b();
            (0, lifecycle_1.$ac)(tracker);
        });
        teardown(function () {
            (0, lifecycle_1.$ac)(null);
        });
        test('no leak with snapshot-utils', function () {
            const store = new lifecycle_1.$jc();
            const emitter = new event_1.$fd();
            const evens = event_1.Event.filter(emitter.event, n => n % 2 === 0, store);
            assertDisposablesCount(1); // snaphot only listen when `evens` is being listened on
            let all = 0;
            const leaked = evens(n => all += n);
            assert.ok((0, lifecycle_1.$ec)(leaked));
            assertDisposablesCount(3);
            emitter.dispose();
            store.dispose();
            assertDisposablesCount([leaked]); // leaked is still there
        });
        test('no leak with debounce-util', function () {
            const store = new lifecycle_1.$jc();
            const emitter = new event_1.$fd();
            const debounced = event_1.Event.debounce(emitter.event, (l) => 0, undefined, undefined, undefined, undefined, store);
            assertDisposablesCount(1); // debounce only listens when `debounce` is being listened on
            let all = 0;
            const leaked = debounced(n => all += n);
            assert.ok((0, lifecycle_1.$ec)(leaked));
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
            const emitter = new event_1.$fd();
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
                const emitter = new event_1.$fd();
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
            const emitter = new event_1.$fd();
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
            const deliveryQueue = (0, event_1.$gd)();
            const emitter1 = new event_1.$fd({ deliveryQueue });
            const emitter2 = new event_1.$fd({ deliveryQueue });
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
            const emitter = new event_1.$fd();
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
            const emitter = new event_1.$fd();
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
            const bucket = new lifecycle_1.$jc();
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
            const a = new event_1.$fd({
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
            const a = new event_1.$fd({
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
            const origErrorHandler = errors_1.$V.getUnexpectedErrorHandler();
            (0, errors_1.setUnexpectedErrorHandler)(() => null);
            try {
                const a = new event_1.$fd();
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
            const a = new event_1.$fd({
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
            const emitter = new event_1.$fd();
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
            return (0, timeTravelScheduler_1.$kT)({}, async function () {
                let callCount = 0;
                let sum = 0;
                const emitter = new event_1.$jd({
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
            const emitter = new event_1.$kd();
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
            const a = new event_1.$fd();
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
            const a = new event_1.$fd();
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
            const e = new event_1.$fd();
            const dispo = e.event(() => { });
            dispo.dispose.call(undefined); // assert that disposable can be called with this
        });
    });
    suite('AsyncEmitter', function () {
        test('event has waitUntil-function', async function () {
            const emitter = new event_1.$hd();
            emitter.event(e => {
                assert.strictEqual(e.foo, true);
                assert.strictEqual(e.bar, 1);
                assert.strictEqual(typeof e.waitUntil, 'function');
            });
            emitter.fireAsync({ foo: true, bar: 1, }, cancellation_1.CancellationToken.None);
            emitter.dispose();
        });
        test('sequential delivery', async function () {
            return (0, timeTravelScheduler_1.$kT)({}, async function () {
                let globalState = 0;
                const emitter = new event_1.$hd();
                emitter.event(e => {
                    e.waitUntil((0, async_1.$Hg)(10).then(_ => {
                        assert.strictEqual(globalState, 0);
                        globalState += 1;
                    }));
                });
                emitter.event(e => {
                    e.waitUntil((0, async_1.$Hg)(1).then(_ => {
                        assert.strictEqual(globalState, 1);
                        globalState += 1;
                    }));
                });
                await emitter.fireAsync({ foo: true }, cancellation_1.CancellationToken.None);
                assert.strictEqual(globalState, 2);
            });
        });
        test('sequential, in-order delivery', async function () {
            return (0, timeTravelScheduler_1.$kT)({}, async function () {
                const events = [];
                let done = false;
                const emitter = new event_1.$hd();
                // e1
                emitter.event(e => {
                    e.waitUntil((0, async_1.$Hg)(10).then(async (_) => {
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
                    e.waitUntil((0, async_1.$Hg)(7));
                });
                await emitter.fireAsync({ foo: 1 }, cancellation_1.CancellationToken.None);
                assert.ok(done);
            });
        });
        test('catch errors', async function () {
            const origErrorHandler = errors_1.$V.getUnexpectedErrorHandler();
            (0, errors_1.setUnexpectedErrorHandler)(() => null);
            let globalState = 0;
            const emitter = new event_1.$hd();
            emitter.event(e => {
                globalState += 1;
                e.waitUntil(new Promise((_r, reject) => reject(new Error())));
            });
            emitter.event(e => {
                globalState += 1;
                e.waitUntil((0, async_1.$Hg)(10));
                e.waitUntil((0, async_1.$Hg)(20).then(() => globalState++)); // multiple `waitUntil` are supported and awaited on
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
            const emitter = new event_1.$id();
            emitter.event(e => data.push(e));
            emitter.fire(1);
            emitter.fire(2);
            assert.deepStrictEqual(data, [1, 2]);
        });
        test('pause/resume - no merge', function () {
            const data = [];
            const emitter = new event_1.$id();
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
            const emitter = new event_1.$id({ merge: (a) => a.reduce((p, c) => p + c, 0) });
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
            const emitter = new event_1.$id();
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
            const emitter = new event_1.$id();
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
            const emitter = new event_1.$id();
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
            const emitter = new event_1.$id({ merge: a => a[0] });
            emitter.event(e => data.push(1));
            emitter.pause();
            emitter.resume();
            assert.deepStrictEqual(data, []);
        });
    });
    suite('Event utils - ensureNoDisposablesAreLeakedInTestSuite', function () {
        (0, utils_1.$bT)();
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
                const bufferer = new event_1.$nd();
                const counter = new Samples.EventCounter();
                const emitter = new event_1.$fd();
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
                const bufferer = new event_1.$nd();
                const counter = new Samples.EventCounter();
                const emitter = new event_1.$fd();
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
                const emitter = new event_1.$fd();
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
                const emitter = new event_1.$fd();
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
                const emitter = new event_1.$fd();
                const event = emitter.event;
                const bufferedEvent = event_1.Event.buffer(event, true);
                emitter.fire(1);
                emitter.fire(2);
                emitter.fire(3);
                assert.deepStrictEqual(result, []);
                const listener = bufferedEvent(num => result.push(num));
                assert.deepStrictEqual(result, []);
                await (0, async_1.$Hg)(10);
                emitter.fire(4);
                assert.deepStrictEqual(result, [1, 2, 3, 4]);
                listener.dispose();
                emitter.fire(5);
                assert.deepStrictEqual(result, [1, 2, 3, 4]);
            });
            test('should fire initial buffer events', () => {
                const result = [];
                const emitter = new event_1.$fd();
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
                const m = new event_1.$ld();
                m.event(r => result.push(r));
                const e1 = new event_1.$fd();
                m.add(e1.event);
                assert.deepStrictEqual(result, []);
                e1.fire(0);
                assert.deepStrictEqual(result, [0]);
            });
            test('multiplexer dispose works', () => {
                const result = [];
                const m = new event_1.$ld();
                m.event(r => result.push(r));
                const e1 = new event_1.$fd();
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
                const m = new event_1.$ld();
                m.event(r => result.push(r));
                const e1 = new event_1.$fd();
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
                const m = new event_1.$ld();
                m.event(r => result.push(r));
                const e1 = new event_1.$fd();
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
                const m = new event_1.$ld();
                m.event(r => result.push(r));
                const e1 = new event_1.$fd();
                m.add(e1.event);
                const e2 = new event_1.$fd();
                m.add(e2.event);
                const e3 = new event_1.$fd();
                m.add(e3.event);
                e1.fire(1);
                e2.fire(2);
                e3.fire(3);
                assert.deepStrictEqual(result, [1, 2, 3]);
            });
            test('cold start works', () => {
                const result = [];
                const m = new event_1.$ld();
                const e1 = new event_1.$fd();
                m.add(e1.event);
                const e2 = new event_1.$fd();
                m.add(e2.event);
                const e3 = new event_1.$fd();
                m.add(e3.event);
                m.event(r => result.push(r));
                e1.fire(1);
                e2.fire(2);
                e3.fire(3);
                assert.deepStrictEqual(result, [1, 2, 3]);
            });
            test('late add works', () => {
                const result = [];
                const m = new event_1.$ld();
                const e1 = new event_1.$fd();
                m.add(e1.event);
                const e2 = new event_1.$fd();
                m.add(e2.event);
                m.event(r => result.push(r));
                e1.fire(1);
                e2.fire(2);
                const e3 = new event_1.$fd();
                m.add(e3.event);
                e3.fire(3);
                assert.deepStrictEqual(result, [1, 2, 3]);
            });
            test('add dispose works', () => {
                const result = [];
                const m = new event_1.$ld();
                const e1 = new event_1.$fd();
                m.add(e1.event);
                const e2 = new event_1.$fd();
                m.add(e2.event);
                m.event(r => result.push(r));
                e1.fire(1);
                e2.fire(2);
                const e3 = new event_1.$fd();
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
            const addEmitter = new event_1.$fd();
            const removeEmitter = new event_1.$fd();
            class TestItem {
                constructor() {
                    this.onTestEventEmitter = new event_1.$fd();
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
                m = new event_1.$md(items, addEmitter.event, removeEmitter.event, e => e.onTestEvent);
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
            const emitter = new event_1.$fd();
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
            const emitter = new event_1.$fd({
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
                    let promise = new async_1.$2g();
                    event_1.Event.fromPromise(promise.p)(e => {
                        assert.strictEqual(e, 1);
                        promise = new async_1.$2g();
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
                    let promise = new async_1.$2g();
                    promise.complete(1);
                    event_1.Event.fromPromise(promise.p)(e => {
                        assert.strictEqual(e, 1);
                        promise = new async_1.$2g();
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
                const e1 = new event_1.$fd();
                const e2 = new event_1.$fd();
                const relay = new event_1.$od();
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
                const e1 = new event_1.$fd();
                const e2 = new event_1.$fd();
                const relay = new event_1.$od();
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
            const eventEmitter = new event_1.$fd();
            const event = eventEmitter.event;
            let i = 0;
            const log = new Array();
            const disposable = event_1.Event.runAndSubscribeWithStore(event, (e, disposables) => {
                const idx = i++;
                log.push({ label: 'handleEvent', data: e || null, idx });
                disposables.add((0, lifecycle_1.$ic)(() => {
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
                const eventEmitter = new event_1.$fd();
                const event = eventEmitter.event;
                const accumulated = event_1.Event.accumulate(event, 0);
                const calls1 = [];
                const calls2 = [];
                const listener1 = accumulated((e) => calls1.push(e));
                accumulated((e) => calls2.push(e));
                eventEmitter.fire(1);
                await (0, async_1.$Hg)(1);
                assert.deepStrictEqual(calls1, [[1]]);
                assert.deepStrictEqual(calls2, [[1]]);
                listener1.dispose();
                await (0, async_1.$Hg)(1);
                assert.deepStrictEqual(calls1, [[1]]);
                assert.deepStrictEqual(calls2, [[1]], 'should not fire after a listener is disposed with undefined or []');
            });
            test('should accumulate a single event', async () => {
                const eventEmitter = new event_1.$fd();
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
                const eventEmitter = new event_1.$fd();
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
                }, symbols_1.$cd);
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
                const emitter = new event_1.$fd();
                const debounced = event_1.Event.debounce(emitter.event, (l, e) => e, 0, /*leading=*/ true);
                let calls = 0;
                debounced(() => {
                    calls++;
                });
                // If the source event is fired once, the debounced (on the leading edge) event should be fired only once
                emitter.fire();
                await (0, async_1.$Hg)(1);
                assert.strictEqual(calls, 1);
            });
            test('leading (2)', async function () {
                const emitter = new event_1.$fd();
                const debounced = event_1.Event.debounce(emitter.event, (l, e) => e, 0, /*leading=*/ true);
                let calls = 0;
                debounced(() => {
                    calls++;
                });
                // If the source event is fired multiple times, the debounced (on the leading edge) event should be fired twice
                emitter.fire();
                emitter.fire();
                emitter.fire();
                await (0, async_1.$Hg)(1);
                assert.strictEqual(calls, 2);
            });
            test('leading reset', async function () {
                const emitter = new event_1.$fd();
                const debounced = event_1.Event.debounce(emitter.event, (l, e) => l ? l + 1 : 1, 0, /*leading=*/ true);
                const calls = [];
                debounced((e) => calls.push(e));
                emitter.fire(1);
                emitter.fire(1);
                await (0, async_1.$Hg)(1);
                assert.deepStrictEqual(calls, [1, 1]);
            });
            test('should not flush events when a listener is disposed', async () => {
                const emitter = new event_1.$fd();
                const debounced = event_1.Event.debounce(emitter.event, (l, e) => l ? l + 1 : 1, 0);
                const calls = [];
                const listener = debounced((e) => calls.push(e));
                emitter.fire(1);
                listener.dispose();
                emitter.fire(1);
                await (0, async_1.$Hg)(1);
                assert.deepStrictEqual(calls, []);
            });
            test('flushOnListenerRemove - should flush events when a listener is disposed', async () => {
                const emitter = new event_1.$fd();
                const debounced = event_1.Event.debounce(emitter.event, (l, e) => l ? l + 1 : 1, 0, undefined, true);
                const calls = [];
                const listener = debounced((e) => calls.push(e));
                emitter.fire(1);
                listener.dispose();
                emitter.fire(1);
                await (0, async_1.$Hg)(1);
                assert.deepStrictEqual(calls, [1], 'should fire with the first event, not the second (after listener dispose)');
            });
            test('should flush events when the emitter is disposed', async () => {
                const emitter = new event_1.$fd();
                const debounced = event_1.Event.debounce(emitter.event, (l, e) => l ? l + 1 : 1, 0);
                const calls = [];
                debounced((e) => calls.push(e));
                emitter.fire(1);
                emitter.dispose();
                await (0, async_1.$Hg)(1);
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
            (0, utils_1.$bT)();
            setup(() => {
                store = new lifecycle_1.$jc();
                em = new event_1.$fd();
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
//# sourceMappingURL=event.test.js.map