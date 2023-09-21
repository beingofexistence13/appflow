/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/base/common/stopwatch"], function (require, exports, errors_1, functional_1, lifecycle_1, linkedList_1, stopwatch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Relay = exports.EventBufferer = exports.DynamicListEventMultiplexer = exports.EventMultiplexer = exports.MicrotaskEmitter = exports.DebounceEmitter = exports.PauseableEmitter = exports.AsyncEmitter = exports.createEventDeliveryQueue = exports.Emitter = exports.setGlobalLeakWarningThreshold = exports.EventProfiling = exports.Event = void 0;
    // -----------------------------------------------------------------------------------------------------------------------
    // Uncomment the next line to print warnings whenever an emitter with listeners is disposed. That is a sign of code smell.
    // -----------------------------------------------------------------------------------------------------------------------
    const _enableDisposeWithListenerWarning = false;
    // _enableDisposeWithListenerWarning = Boolean("TRUE"); // causes a linter warning so that it cannot be pushed
    // -----------------------------------------------------------------------------------------------------------------------
    // Uncomment the next line to print warnings whenever a snapshotted event is used repeatedly without cleanup.
    // See https://github.com/microsoft/vscode/issues/142851
    // -----------------------------------------------------------------------------------------------------------------------
    const _enableSnapshotPotentialLeakWarning = false;
    var Event;
    (function (Event) {
        Event.None = () => lifecycle_1.Disposable.None;
        function _addLeakageTraceLogic(options) {
            if (_enableSnapshotPotentialLeakWarning) {
                const { onDidAddListener: origListenerDidAdd } = options;
                const stack = Stacktrace.create();
                let count = 0;
                options.onDidAddListener = () => {
                    if (++count === 2) {
                        console.warn('snapshotted emitter LIKELY used public and SHOULD HAVE BEEN created with DisposableStore. snapshotted here');
                        stack.print();
                    }
                    origListenerDidAdd?.();
                };
            }
        }
        /**
         * Given an event, returns another event which debounces calls and defers the listeners to a later task via a shared
         * `setTimeout`. The event is converted into a signal (`Event<void>`) to avoid additional object creation as a
         * result of merging events and to try prevent race conditions that could arise when using related deferred and
         * non-deferred events.
         *
         * This is useful for deferring non-critical work (eg. general UI updates) to ensure it does not block critical work
         * (eg. latency of keypress to text rendered).
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param disposable A disposable store to add the new EventEmitter to.
         */
        function defer(event, disposable) {
            return debounce(event, () => void 0, 0, undefined, true, undefined, disposable);
        }
        Event.defer = defer;
        /**
         * Given an event, returns another event which only fires once.
         *
         * @param event The event source for the new event.
         */
        function once(event) {
            return (listener, thisArgs = null, disposables) => {
                // we need this, in case the event fires during the listener call
                let didFire = false;
                let result = undefined;
                result = event(e => {
                    if (didFire) {
                        return;
                    }
                    else if (result) {
                        result.dispose();
                    }
                    else {
                        didFire = true;
                    }
                    return listener.call(thisArgs, e);
                }, null, disposables);
                if (didFire) {
                    result.dispose();
                }
                return result;
            };
        }
        Event.once = once;
        /**
         * Maps an event of one type into an event of another type using a mapping function, similar to how
         * `Array.prototype.map` works.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param map The mapping function.
         * @param disposable A disposable store to add the new EventEmitter to.
         */
        function map(event, map, disposable) {
            return snapshot((listener, thisArgs = null, disposables) => event(i => listener.call(thisArgs, map(i)), null, disposables), disposable);
        }
        Event.map = map;
        /**
         * Wraps an event in another event that performs some function on the event object before firing.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param each The function to perform on the event object.
         * @param disposable A disposable store to add the new EventEmitter to.
         */
        function forEach(event, each, disposable) {
            return snapshot((listener, thisArgs = null, disposables) => event(i => { each(i); listener.call(thisArgs, i); }, null, disposables), disposable);
        }
        Event.forEach = forEach;
        function filter(event, filter, disposable) {
            return snapshot((listener, thisArgs = null, disposables) => event(e => filter(e) && listener.call(thisArgs, e), null, disposables), disposable);
        }
        Event.filter = filter;
        /**
         * Given an event, returns the same event but typed as `Event<void>`.
         */
        function signal(event) {
            return event;
        }
        Event.signal = signal;
        function any(...events) {
            return (listener, thisArgs = null, disposables) => {
                const disposable = (0, lifecycle_1.combinedDisposable)(...events.map(event => event(e => listener.call(thisArgs, e))));
                return addAndReturnDisposable(disposable, disposables);
            };
        }
        Event.any = any;
        /**
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         */
        function reduce(event, merge, initial, disposable) {
            let output = initial;
            return map(event, e => {
                output = merge(output, e);
                return output;
            }, disposable);
        }
        Event.reduce = reduce;
        function snapshot(event, disposable) {
            let listener;
            const options = {
                onWillAddFirstListener() {
                    listener = event(emitter.fire, emitter);
                },
                onDidRemoveLastListener() {
                    listener?.dispose();
                }
            };
            if (!disposable) {
                _addLeakageTraceLogic(options);
            }
            const emitter = new Emitter(options);
            disposable?.add(emitter);
            return emitter.event;
        }
        /**
         * Adds the IDisposable to the store if it's set, and returns it. Useful to
         * Event function implementation.
         */
        function addAndReturnDisposable(d, store) {
            if (store instanceof Array) {
                store.push(d);
            }
            else if (store) {
                store.add(d);
            }
            return d;
        }
        function debounce(event, merge, delay = 100, leading = false, flushOnListenerRemove = false, leakWarningThreshold, disposable) {
            let subscription;
            let output = undefined;
            let handle = undefined;
            let numDebouncedCalls = 0;
            let doFire;
            const options = {
                leakWarningThreshold,
                onWillAddFirstListener() {
                    subscription = event(cur => {
                        numDebouncedCalls++;
                        output = merge(output, cur);
                        if (leading && !handle) {
                            emitter.fire(output);
                            output = undefined;
                        }
                        doFire = () => {
                            const _output = output;
                            output = undefined;
                            handle = undefined;
                            if (!leading || numDebouncedCalls > 1) {
                                emitter.fire(_output);
                            }
                            numDebouncedCalls = 0;
                        };
                        if (typeof delay === 'number') {
                            clearTimeout(handle);
                            handle = setTimeout(doFire, delay);
                        }
                        else {
                            if (handle === undefined) {
                                handle = 0;
                                queueMicrotask(doFire);
                            }
                        }
                    });
                },
                onWillRemoveListener() {
                    if (flushOnListenerRemove && numDebouncedCalls > 0) {
                        doFire?.();
                    }
                },
                onDidRemoveLastListener() {
                    doFire = undefined;
                    subscription.dispose();
                }
            };
            if (!disposable) {
                _addLeakageTraceLogic(options);
            }
            const emitter = new Emitter(options);
            disposable?.add(emitter);
            return emitter.event;
        }
        Event.debounce = debounce;
        /**
         * Debounces an event, firing after some delay (default=0) with an array of all event original objects.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         */
        function accumulate(event, delay = 0, disposable) {
            return Event.debounce(event, (last, e) => {
                if (!last) {
                    return [e];
                }
                last.push(e);
                return last;
            }, delay, undefined, true, undefined, disposable);
        }
        Event.accumulate = accumulate;
        /**
         * Filters an event such that some condition is _not_ met more than once in a row, effectively ensuring duplicate
         * event objects from different sources do not fire the same event object.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param equals The equality condition.
         * @param disposable A disposable store to add the new EventEmitter to.
         *
         * @example
         * ```
         * // Fire only one time when a single window is opened or focused
         * Event.latch(Event.any(onDidOpenWindow, onDidFocusWindow))
         * ```
         */
        function latch(event, equals = (a, b) => a === b, disposable) {
            let firstCall = true;
            let cache;
            return filter(event, value => {
                const shouldEmit = firstCall || !equals(value, cache);
                firstCall = false;
                cache = value;
                return shouldEmit;
            }, disposable);
        }
        Event.latch = latch;
        /**
         * Splits an event whose parameter is a union type into 2 separate events for each type in the union.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @example
         * ```
         * const event = new EventEmitter<number | undefined>().event;
         * const [numberEvent, undefinedEvent] = Event.split(event, isUndefined);
         * ```
         *
         * @param event The event source for the new event.
         * @param isT A function that determines what event is of the first type.
         * @param disposable A disposable store to add the new EventEmitter to.
         */
        function split(event, isT, disposable) {
            return [
                Event.filter(event, isT, disposable),
                Event.filter(event, e => !isT(e), disposable),
            ];
        }
        Event.split = split;
        /**
         * Buffers an event until it has a listener attached.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param flushAfterTimeout Determines whether to flush the buffer after a timeout immediately or after a
         * `setTimeout` when the first event listener is added.
         * @param _buffer Internal: A source event array used for tests.
         *
         * @example
         * ```
         * // Start accumulating events, when the first listener is attached, flush
         * // the event after a timeout such that multiple listeners attached before
         * // the timeout would receive the event
         * this.onInstallExtension = Event.buffer(service.onInstallExtension, true);
         * ```
         */
        function buffer(event, flushAfterTimeout = false, _buffer = [], disposable) {
            let buffer = _buffer.slice();
            let listener = event(e => {
                if (buffer) {
                    buffer.push(e);
                }
                else {
                    emitter.fire(e);
                }
            });
            if (disposable) {
                disposable.add(listener);
            }
            const flush = () => {
                buffer?.forEach(e => emitter.fire(e));
                buffer = null;
            };
            const emitter = new Emitter({
                onWillAddFirstListener() {
                    if (!listener) {
                        listener = event(e => emitter.fire(e));
                        if (disposable) {
                            disposable.add(listener);
                        }
                    }
                },
                onDidAddFirstListener() {
                    if (buffer) {
                        if (flushAfterTimeout) {
                            setTimeout(flush);
                        }
                        else {
                            flush();
                        }
                    }
                },
                onDidRemoveLastListener() {
                    if (listener) {
                        listener.dispose();
                    }
                    listener = null;
                }
            });
            if (disposable) {
                disposable.add(emitter);
            }
            return emitter.event;
        }
        Event.buffer = buffer;
        /**
         * Wraps the event in an {@link IChainableEvent}, allowing a more functional programming style.
         *
         * @example
         * ```
         * // Normal
         * const onEnterPressNormal = Event.filter(
         *   Event.map(onKeyPress.event, e => new StandardKeyboardEvent(e)),
         *   e.keyCode === KeyCode.Enter
         * ).event;
         *
         * // Using chain
         * const onEnterPressChain = Event.chain(onKeyPress.event, $ => $
         *   .map(e => new StandardKeyboardEvent(e))
         *   .filter(e => e.keyCode === KeyCode.Enter)
         * );
         * ```
         */
        function chain(event, sythensize) {
            const fn = (listener, thisArgs, disposables) => {
                const cs = sythensize(new ChainableSynthesis());
                return event(function (value) {
                    const result = cs.evaluate(value);
                    if (result !== HaltChainable) {
                        listener.call(thisArgs, result);
                    }
                }, undefined, disposables);
            };
            return fn;
        }
        Event.chain = chain;
        const HaltChainable = Symbol('HaltChainable');
        class ChainableSynthesis {
            constructor() {
                this.steps = [];
            }
            map(fn) {
                this.steps.push(fn);
                return this;
            }
            forEach(fn) {
                this.steps.push(v => {
                    fn(v);
                    return v;
                });
                return this;
            }
            filter(fn) {
                this.steps.push(v => fn(v) ? v : HaltChainable);
                return this;
            }
            reduce(merge, initial) {
                let last = initial;
                this.steps.push(v => {
                    last = merge(last, v);
                    return last;
                });
                return this;
            }
            latch(equals = (a, b) => a === b) {
                let firstCall = true;
                let cache;
                this.steps.push(value => {
                    const shouldEmit = firstCall || !equals(value, cache);
                    firstCall = false;
                    cache = value;
                    return shouldEmit ? value : HaltChainable;
                });
                return this;
            }
            evaluate(value) {
                for (const step of this.steps) {
                    value = step(value);
                    if (value === HaltChainable) {
                        break;
                    }
                }
                return value;
            }
        }
        /**
         * Creates an {@link Event} from a node event emitter.
         */
        function fromNodeEventEmitter(emitter, eventName, map = id => id) {
            const fn = (...args) => result.fire(map(...args));
            const onFirstListenerAdd = () => emitter.on(eventName, fn);
            const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
            const result = new Emitter({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });
            return result.event;
        }
        Event.fromNodeEventEmitter = fromNodeEventEmitter;
        /**
         * Creates an {@link Event} from a DOM event emitter.
         */
        function fromDOMEventEmitter(emitter, eventName, map = id => id) {
            const fn = (...args) => result.fire(map(...args));
            const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);
            const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);
            const result = new Emitter({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });
            return result.event;
        }
        Event.fromDOMEventEmitter = fromDOMEventEmitter;
        /**
         * Creates a promise out of an event, using the {@link Event.once} helper.
         */
        function toPromise(event) {
            return new Promise(resolve => once(event)(resolve));
        }
        Event.toPromise = toPromise;
        /**
         * Creates an event out of a promise that fires once when the promise is
         * resolved with the result of the promise or `undefined`.
         */
        function fromPromise(promise) {
            const result = new Emitter();
            promise.then(res => {
                result.fire(res);
            }, () => {
                result.fire(undefined);
            }).finally(() => {
                result.dispose();
            });
            return result.event;
        }
        Event.fromPromise = fromPromise;
        /**
         * Adds a listener to an event and calls the listener immediately with undefined as the event object.
         *
         * @example
         * ```
         * // Initialize the UI and update it when dataChangeEvent fires
         * runAndSubscribe(dataChangeEvent, () => this._updateUI());
         * ```
         */
        function runAndSubscribe(event, handler) {
            handler(undefined);
            return event(e => handler(e));
        }
        Event.runAndSubscribe = runAndSubscribe;
        /**
         * Adds a listener to an event and calls the listener immediately with undefined as the event object. A new
         * {@link DisposableStore} is passed to the listener which is disposed when the returned disposable is disposed.
         */
        function runAndSubscribeWithStore(event, handler) {
            let store = null;
            function run(e) {
                store?.dispose();
                store = new lifecycle_1.DisposableStore();
                handler(e, store);
            }
            run(undefined);
            const disposable = event(e => run(e));
            return (0, lifecycle_1.toDisposable)(() => {
                disposable.dispose();
                store?.dispose();
            });
        }
        Event.runAndSubscribeWithStore = runAndSubscribeWithStore;
        class EmitterObserver {
            constructor(_observable, store) {
                this._observable = _observable;
                this._counter = 0;
                this._hasChanged = false;
                const options = {
                    onWillAddFirstListener: () => {
                        _observable.addObserver(this);
                    },
                    onDidRemoveLastListener: () => {
                        _observable.removeObserver(this);
                    }
                };
                if (!store) {
                    _addLeakageTraceLogic(options);
                }
                this.emitter = new Emitter(options);
                if (store) {
                    store.add(this.emitter);
                }
            }
            beginUpdate(_observable) {
                // assert(_observable === this.obs);
                this._counter++;
            }
            handlePossibleChange(_observable) {
                // assert(_observable === this.obs);
            }
            handleChange(_observable, _change) {
                // assert(_observable === this.obs);
                this._hasChanged = true;
            }
            endUpdate(_observable) {
                // assert(_observable === this.obs);
                this._counter--;
                if (this._counter === 0) {
                    this._observable.reportChanges();
                    if (this._hasChanged) {
                        this._hasChanged = false;
                        this.emitter.fire(this._observable.get());
                    }
                }
            }
        }
        /**
         * Creates an event emitter that is fired when the observable changes.
         * Each listeners subscribes to the emitter.
         */
        function fromObservable(obs, store) {
            const observer = new EmitterObserver(obs, store);
            return observer.emitter.event;
        }
        Event.fromObservable = fromObservable;
        /**
         * Each listener is attached to the observable directly.
         */
        function fromObservableLight(observable) {
            return (listener) => {
                let count = 0;
                let didChange = false;
                const observer = {
                    beginUpdate() {
                        count++;
                    },
                    endUpdate() {
                        count--;
                        if (count === 0) {
                            observable.reportChanges();
                            if (didChange) {
                                didChange = false;
                                listener();
                            }
                        }
                    },
                    handlePossibleChange() {
                        // noop
                    },
                    handleChange() {
                        didChange = true;
                    }
                };
                observable.addObserver(observer);
                observable.reportChanges();
                return {
                    dispose() {
                        observable.removeObserver(observer);
                    }
                };
            };
        }
        Event.fromObservableLight = fromObservableLight;
    })(Event || (exports.Event = Event = {}));
    class EventProfiling {
        static { this.all = new Set(); }
        static { this._idPool = 0; }
        constructor(name) {
            this.listenerCount = 0;
            this.invocationCount = 0;
            this.elapsedOverall = 0;
            this.durations = [];
            this.name = `${name}_${EventProfiling._idPool++}`;
            EventProfiling.all.add(this);
        }
        start(listenerCount) {
            this._stopWatch = new stopwatch_1.StopWatch();
            this.listenerCount = listenerCount;
        }
        stop() {
            if (this._stopWatch) {
                const elapsed = this._stopWatch.elapsed();
                this.durations.push(elapsed);
                this.elapsedOverall += elapsed;
                this.invocationCount += 1;
                this._stopWatch = undefined;
            }
        }
    }
    exports.EventProfiling = EventProfiling;
    let _globalLeakWarningThreshold = -1;
    function setGlobalLeakWarningThreshold(n) {
        const oldValue = _globalLeakWarningThreshold;
        _globalLeakWarningThreshold = n;
        return {
            dispose() {
                _globalLeakWarningThreshold = oldValue;
            }
        };
    }
    exports.setGlobalLeakWarningThreshold = setGlobalLeakWarningThreshold;
    class LeakageMonitor {
        constructor(threshold, name = Math.random().toString(18).slice(2, 5)) {
            this.threshold = threshold;
            this.name = name;
            this._warnCountdown = 0;
        }
        dispose() {
            this._stacks?.clear();
        }
        check(stack, listenerCount) {
            const threshold = this.threshold;
            if (threshold <= 0 || listenerCount < threshold) {
                return undefined;
            }
            if (!this._stacks) {
                this._stacks = new Map();
            }
            const count = (this._stacks.get(stack.value) || 0);
            this._stacks.set(stack.value, count + 1);
            this._warnCountdown -= 1;
            if (this._warnCountdown <= 0) {
                // only warn on first exceed and then every time the limit
                // is exceeded by 50% again
                this._warnCountdown = threshold * 0.5;
                // find most frequent listener and print warning
                let topStack;
                let topCount = 0;
                for (const [stack, count] of this._stacks) {
                    if (!topStack || topCount < count) {
                        topStack = stack;
                        topCount = count;
                    }
                }
                console.warn(`[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`);
                console.warn(topStack);
            }
            return () => {
                const count = (this._stacks.get(stack.value) || 0);
                this._stacks.set(stack.value, count - 1);
            };
        }
    }
    class Stacktrace {
        static create() {
            return new Stacktrace(new Error().stack ?? '');
        }
        constructor(value) {
            this.value = value;
        }
        print() {
            console.warn(this.value.split('\n').slice(2).join('\n'));
        }
    }
    let id = 0;
    class UniqueContainer {
        constructor(value) {
            this.value = value;
            this.id = id++;
        }
    }
    const compactionThreshold = 2;
    const forEachListener = (listeners, fn) => {
        if (listeners instanceof UniqueContainer) {
            fn(listeners);
        }
        else {
            for (let i = 0; i < listeners.length; i++) {
                const l = listeners[i];
                if (l) {
                    fn(l);
                }
            }
        }
    };
    /**
     * The Emitter can be used to expose an Event to the public
     * to fire it from the insides.
     * Sample:
        class Document {
    
            private readonly _onDidChange = new Emitter<(value:string)=>any>();
    
            public onDidChange = this._onDidChange.event;
    
            // getter-style
            // get onDidChange(): Event<(value:string)=>any> {
            // 	return this._onDidChange.event;
            // }
    
            private _doIt() {
                //...
                this._onDidChange.fire(value);
            }
        }
     */
    class Emitter {
        constructor(options) {
            this._size = 0;
            this._options = options;
            this._leakageMon = _globalLeakWarningThreshold > 0 || this._options?.leakWarningThreshold ? new LeakageMonitor(this._options?.leakWarningThreshold ?? _globalLeakWarningThreshold) : undefined;
            this._perfMon = this._options?._profName ? new EventProfiling(this._options._profName) : undefined;
            this._deliveryQueue = this._options?.deliveryQueue;
        }
        dispose() {
            if (!this._disposed) {
                this._disposed = true;
                // It is bad to have listeners at the time of disposing an emitter, it is worst to have listeners keep the emitter
                // alive via the reference that's embedded in their disposables. Therefore we loop over all remaining listeners and
                // unset their subscriptions/disposables. Looping and blaming remaining listeners is done on next tick because the
                // the following programming pattern is very popular:
                //
                // const someModel = this._disposables.add(new ModelObject()); // (1) create and register model
                // this._disposables.add(someModel.onDidChange(() => { ... }); // (2) subscribe and register model-event listener
                // ...later...
                // this._disposables.dispose(); disposes (1) then (2): don't warn after (1) but after the "overall dispose" is done
                if (this._deliveryQueue?.current === this) {
                    this._deliveryQueue.reset();
                }
                if (this._listeners) {
                    if (_enableDisposeWithListenerWarning) {
                        const listeners = this._listeners;
                        queueMicrotask(() => {
                            forEachListener(listeners, l => l.stack?.print());
                        });
                    }
                    this._listeners = undefined;
                    this._size = 0;
                }
                this._options?.onDidRemoveLastListener?.();
                this._leakageMon?.dispose();
            }
        }
        /**
         * For the public to allow to subscribe
         * to events from this Emitter
         */
        get event() {
            this._event ??= (callback, thisArgs, disposables) => {
                if (this._leakageMon && this._size > this._leakageMon.threshold * 3) {
                    console.warn(`[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far`);
                    return lifecycle_1.Disposable.None;
                }
                if (this._disposed) {
                    // todo: should we warn if a listener is added to a disposed emitter? This happens often
                    return lifecycle_1.Disposable.None;
                }
                if (thisArgs) {
                    callback = callback.bind(thisArgs);
                }
                const contained = new UniqueContainer(callback);
                let removeMonitor;
                let stack;
                if (this._leakageMon && this._size >= Math.ceil(this._leakageMon.threshold * 0.2)) {
                    // check and record this emitter for potential leakage
                    contained.stack = Stacktrace.create();
                    removeMonitor = this._leakageMon.check(contained.stack, this._size + 1);
                }
                if (_enableDisposeWithListenerWarning) {
                    contained.stack = stack ?? Stacktrace.create();
                }
                if (!this._listeners) {
                    this._options?.onWillAddFirstListener?.(this);
                    this._listeners = contained;
                    this._options?.onDidAddFirstListener?.(this);
                }
                else if (this._listeners instanceof UniqueContainer) {
                    this._deliveryQueue ??= new EventDeliveryQueuePrivate();
                    this._listeners = [this._listeners, contained];
                }
                else {
                    this._listeners.push(contained);
                }
                this._size++;
                const result = (0, lifecycle_1.toDisposable)(() => { removeMonitor?.(); this._removeListener(contained); });
                if (disposables instanceof lifecycle_1.DisposableStore) {
                    disposables.add(result);
                }
                else if (Array.isArray(disposables)) {
                    disposables.push(result);
                }
                return result;
            };
            return this._event;
        }
        _removeListener(listener) {
            this._options?.onWillRemoveListener?.(this);
            if (!this._listeners) {
                return; // expected if a listener gets disposed
            }
            if (this._size === 1) {
                this._listeners = undefined;
                this._options?.onDidRemoveLastListener?.(this);
                this._size = 0;
                return;
            }
            // size > 1 which requires that listeners be a list:
            const listeners = this._listeners;
            const index = listeners.indexOf(listener);
            if (index === -1) {
                console.log('disposed?', this._disposed);
                console.log('size?', this._size);
                console.log('arr?', JSON.stringify(this._listeners));
                throw new Error('Attempted to dispose unknown listener');
            }
            this._size--;
            listeners[index] = undefined;
            const adjustDeliveryQueue = this._deliveryQueue.current === this;
            if (this._size * compactionThreshold <= listeners.length) {
                let n = 0;
                for (let i = 0; i < listeners.length; i++) {
                    if (listeners[i]) {
                        listeners[n++] = listeners[i];
                    }
                    else if (adjustDeliveryQueue) {
                        this._deliveryQueue.end--;
                        if (n < this._deliveryQueue.i) {
                            this._deliveryQueue.i--;
                        }
                    }
                }
                listeners.length = n;
            }
        }
        _deliver(listener, value) {
            if (!listener) {
                return;
            }
            const errorHandler = this._options?.onListenerError || errors_1.onUnexpectedError;
            if (!errorHandler) {
                listener.value(value);
                return;
            }
            try {
                listener.value(value);
            }
            catch (e) {
                errorHandler(e);
            }
        }
        /** Delivers items in the queue. Assumes the queue is ready to go. */
        _deliverQueue(dq) {
            const listeners = dq.current._listeners;
            while (dq.i < dq.end) {
                // important: dq.i is incremented before calling deliver() because it might reenter deliverQueue()
                this._deliver(listeners[dq.i++], dq.value);
            }
            dq.reset();
        }
        /**
         * To be kept private to fire an event to
         * subscribers
         */
        fire(event) {
            if (this._deliveryQueue?.current) {
                this._deliverQueue(this._deliveryQueue);
                this._perfMon?.stop(); // last fire() will have starting perfmon, stop it before starting the next dispatch
            }
            this._perfMon?.start(this._size);
            if (!this._listeners) {
                // no-op
            }
            else if (this._listeners instanceof UniqueContainer) {
                this._deliver(this._listeners, event);
            }
            else {
                const dq = this._deliveryQueue;
                dq.enqueue(this, event, this._listeners.length);
                this._deliverQueue(dq);
            }
            this._perfMon?.stop();
        }
        hasListeners() {
            return this._size > 0;
        }
    }
    exports.Emitter = Emitter;
    const createEventDeliveryQueue = () => new EventDeliveryQueuePrivate();
    exports.createEventDeliveryQueue = createEventDeliveryQueue;
    class EventDeliveryQueuePrivate {
        constructor() {
            /**
             * Index in current's listener list.
             */
            this.i = -1;
            /**
             * The last index in the listener's list to deliver.
             */
            this.end = 0;
        }
        enqueue(emitter, value, end) {
            this.i = 0;
            this.end = end;
            this.current = emitter;
            this.value = value;
        }
        reset() {
            this.i = this.end; // force any current emission loop to stop, mainly for during dispose
            this.current = undefined;
            this.value = undefined;
        }
    }
    class AsyncEmitter extends Emitter {
        async fireAsync(data, token, promiseJoin) {
            if (!this._listeners) {
                return;
            }
            if (!this._asyncDeliveryQueue) {
                this._asyncDeliveryQueue = new linkedList_1.LinkedList();
            }
            forEachListener(this._listeners, listener => this._asyncDeliveryQueue.push([listener.value, data]));
            while (this._asyncDeliveryQueue.size > 0 && !token.isCancellationRequested) {
                const [listener, data] = this._asyncDeliveryQueue.shift();
                const thenables = [];
                const event = {
                    ...data,
                    token,
                    waitUntil: (p) => {
                        if (Object.isFrozen(thenables)) {
                            throw new Error('waitUntil can NOT be called asynchronous');
                        }
                        if (promiseJoin) {
                            p = promiseJoin(p, listener);
                        }
                        thenables.push(p);
                    }
                };
                try {
                    listener(event);
                }
                catch (e) {
                    (0, errors_1.onUnexpectedError)(e);
                    continue;
                }
                // freeze thenables-collection to enforce sync-calls to
                // wait until and then wait for all thenables to resolve
                Object.freeze(thenables);
                await Promise.allSettled(thenables).then(values => {
                    for (const value of values) {
                        if (value.status === 'rejected') {
                            (0, errors_1.onUnexpectedError)(value.reason);
                        }
                    }
                });
            }
        }
    }
    exports.AsyncEmitter = AsyncEmitter;
    class PauseableEmitter extends Emitter {
        get isPaused() {
            return this._isPaused !== 0;
        }
        constructor(options) {
            super(options);
            this._isPaused = 0;
            this._eventQueue = new linkedList_1.LinkedList();
            this._mergeFn = options?.merge;
        }
        pause() {
            this._isPaused++;
        }
        resume() {
            if (this._isPaused !== 0 && --this._isPaused === 0) {
                if (this._mergeFn) {
                    // use the merge function to create a single composite
                    // event. make a copy in case firing pauses this emitter
                    if (this._eventQueue.size > 0) {
                        const events = Array.from(this._eventQueue);
                        this._eventQueue.clear();
                        super.fire(this._mergeFn(events));
                    }
                }
                else {
                    // no merging, fire each event individually and test
                    // that this emitter isn't paused halfway through
                    while (!this._isPaused && this._eventQueue.size !== 0) {
                        super.fire(this._eventQueue.shift());
                    }
                }
            }
        }
        fire(event) {
            if (this._size) {
                if (this._isPaused !== 0) {
                    this._eventQueue.push(event);
                }
                else {
                    super.fire(event);
                }
            }
        }
    }
    exports.PauseableEmitter = PauseableEmitter;
    class DebounceEmitter extends PauseableEmitter {
        constructor(options) {
            super(options);
            this._delay = options.delay ?? 100;
        }
        fire(event) {
            if (!this._handle) {
                this.pause();
                this._handle = setTimeout(() => {
                    this._handle = undefined;
                    this.resume();
                }, this._delay);
            }
            super.fire(event);
        }
    }
    exports.DebounceEmitter = DebounceEmitter;
    /**
     * An emitter which queue all events and then process them at the
     * end of the event loop.
     */
    class MicrotaskEmitter extends Emitter {
        constructor(options) {
            super(options);
            this._queuedEvents = [];
            this._mergeFn = options?.merge;
        }
        fire(event) {
            if (!this.hasListeners()) {
                return;
            }
            this._queuedEvents.push(event);
            if (this._queuedEvents.length === 1) {
                queueMicrotask(() => {
                    if (this._mergeFn) {
                        super.fire(this._mergeFn(this._queuedEvents));
                    }
                    else {
                        this._queuedEvents.forEach(e => super.fire(e));
                    }
                    this._queuedEvents = [];
                });
            }
        }
    }
    exports.MicrotaskEmitter = MicrotaskEmitter;
    /**
     * An event emitter that multiplexes many events into a single event.
     *
     * @example Listen to the `onData` event of all `Thing`s, dynamically adding and removing `Thing`s
     * to the multiplexer as needed.
     *
     * ```typescript
     * const anythingDataMultiplexer = new EventMultiplexer<{ data: string }>();
     *
     * const thingListeners = DisposableMap<Thing, IDisposable>();
     *
     * thingService.onDidAddThing(thing => {
     *   thingListeners.set(thing, anythingDataMultiplexer.add(thing.onData);
     * });
     * thingService.onDidRemoveThing(thing => {
     *   thingListeners.deleteAndDispose(thing);
     * });
     *
     * anythingDataMultiplexer.event(e => {
     *   console.log('Something fired data ' + e.data)
     * });
     * ```
     */
    class EventMultiplexer {
        constructor() {
            this.hasListeners = false;
            this.events = [];
            this.emitter = new Emitter({
                onWillAddFirstListener: () => this.onFirstListenerAdd(),
                onDidRemoveLastListener: () => this.onLastListenerRemove()
            });
        }
        get event() {
            return this.emitter.event;
        }
        add(event) {
            const e = { event: event, listener: null };
            this.events.push(e);
            if (this.hasListeners) {
                this.hook(e);
            }
            const dispose = () => {
                if (this.hasListeners) {
                    this.unhook(e);
                }
                const idx = this.events.indexOf(e);
                this.events.splice(idx, 1);
            };
            return (0, lifecycle_1.toDisposable)((0, functional_1.once)(dispose));
        }
        onFirstListenerAdd() {
            this.hasListeners = true;
            this.events.forEach(e => this.hook(e));
        }
        onLastListenerRemove() {
            this.hasListeners = false;
            this.events.forEach(e => this.unhook(e));
        }
        hook(e) {
            e.listener = e.event(r => this.emitter.fire(r));
        }
        unhook(e) {
            if (e.listener) {
                e.listener.dispose();
            }
            e.listener = null;
        }
        dispose() {
            this.emitter.dispose();
        }
    }
    exports.EventMultiplexer = EventMultiplexer;
    class DynamicListEventMultiplexer {
        constructor(items, onAddItem, onRemoveItem, getEvent) {
            this._store = new lifecycle_1.DisposableStore();
            const multiplexer = this._store.add(new EventMultiplexer());
            const itemListeners = this._store.add(new lifecycle_1.DisposableMap());
            function addItem(instance) {
                itemListeners.set(instance, multiplexer.add(getEvent(instance)));
            }
            // Existing items
            for (const instance of items) {
                addItem(instance);
            }
            // Added items
            this._store.add(onAddItem(instance => {
                addItem(instance);
            }));
            // Removed items
            this._store.add(onRemoveItem(instance => {
                itemListeners.deleteAndDispose(instance);
            }));
            this.event = multiplexer.event;
        }
        dispose() {
            this._store.dispose();
        }
    }
    exports.DynamicListEventMultiplexer = DynamicListEventMultiplexer;
    /**
     * The EventBufferer is useful in situations in which you want
     * to delay firing your events during some code.
     * You can wrap that code and be sure that the event will not
     * be fired during that wrap.
     *
     * ```
     * const emitter: Emitter;
     * const delayer = new EventDelayer();
     * const delayedEvent = delayer.wrapEvent(emitter.event);
     *
     * delayedEvent(console.log);
     *
     * delayer.bufferEvents(() => {
     *   emitter.fire(); // event will not be fired yet
     * });
     *
     * // event will only be fired at this point
     * ```
     */
    class EventBufferer {
        constructor() {
            this.buffers = [];
        }
        wrapEvent(event) {
            return (listener, thisArgs, disposables) => {
                return event(i => {
                    const buffer = this.buffers[this.buffers.length - 1];
                    if (buffer) {
                        buffer.push(() => listener.call(thisArgs, i));
                    }
                    else {
                        listener.call(thisArgs, i);
                    }
                }, undefined, disposables);
            };
        }
        bufferEvents(fn) {
            const buffer = [];
            this.buffers.push(buffer);
            const r = fn();
            this.buffers.pop();
            buffer.forEach(flush => flush());
            return r;
        }
    }
    exports.EventBufferer = EventBufferer;
    /**
     * A Relay is an event forwarder which functions as a replugabble event pipe.
     * Once created, you can connect an input event to it and it will simply forward
     * events from that input event through its own `event` property. The `input`
     * can be changed at any point in time.
     */
    class Relay {
        constructor() {
            this.listening = false;
            this.inputEvent = Event.None;
            this.inputEventListener = lifecycle_1.Disposable.None;
            this.emitter = new Emitter({
                onDidAddFirstListener: () => {
                    this.listening = true;
                    this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
                },
                onDidRemoveLastListener: () => {
                    this.listening = false;
                    this.inputEventListener.dispose();
                }
            });
            this.event = this.emitter.event;
        }
        set input(event) {
            this.inputEvent = event;
            if (this.listening) {
                this.inputEventListener.dispose();
                this.inputEventListener = event(this.emitter.fire, this.emitter);
            }
        }
        dispose() {
            this.inputEventListener.dispose();
            this.emitter.dispose();
        }
    }
    exports.Relay = Relay;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9ldmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsMEhBQTBIO0lBQzFILDBIQUEwSDtJQUMxSCwwSEFBMEg7SUFDMUgsTUFBTSxpQ0FBaUMsR0FBRyxLQUFLLENBQUM7SUFDaEQsOEdBQThHO0lBRzlHLDBIQUEwSDtJQUMxSCw2R0FBNkc7SUFDN0csd0RBQXdEO0lBQ3hELDBIQUEwSDtJQUMxSCxNQUFNLG1DQUFtQyxHQUFHLEtBQUssQ0FBQztJQVVsRCxJQUFpQixLQUFLLENBaXNCckI7SUFqc0JELFdBQWlCLEtBQUs7UUFDUixVQUFJLEdBQWUsR0FBRyxFQUFFLENBQUMsc0JBQVUsQ0FBQyxJQUFJLENBQUM7UUFFdEQsU0FBUyxxQkFBcUIsQ0FBQyxPQUF1QjtZQUNyRCxJQUFJLG1DQUFtQyxFQUFFO2dCQUN4QyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxPQUFPLENBQUM7Z0JBQ3pELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUNkLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLEVBQUU7b0JBQy9CLElBQUksRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFO3dCQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLDRHQUE0RyxDQUFDLENBQUM7d0JBQzNILEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztxQkFDZDtvQkFDRCxrQkFBa0IsRUFBRSxFQUFFLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQzthQUNGO1FBQ0YsQ0FBQztRQUVEOzs7Ozs7Ozs7Ozs7Ozs7V0FlRztRQUNILFNBQWdCLEtBQUssQ0FBQyxLQUFxQixFQUFFLFVBQTRCO1lBQ3hFLE9BQU8sUUFB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