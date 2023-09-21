/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/observableInternal/autorun", "vs/base/common/observableInternal/base", "vs/base/common/observableInternal/derived", "vs/base/common/observableInternal/logging"], function (require, exports, lifecycle_1, autorun_1, base_1, derived_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.derivedObservableWithWritableCache = exports.derivedObservableWithCache = exports.recomputeInitiallyAndOnChange = exports.keepObserved = exports.wasEventTriggeredRecently = exports.debouncedObservable = exports.observableSignal = exports.observableSignalFromEvent = exports.FromEventObservable = exports.observableFromEvent = exports.waitForState = exports.observableFromPromise = exports.constObservable = void 0;
    /**
     * Represents an efficient observable whose value never changes.
     */
    function constObservable(value) {
        return new ConstObservable(value);
    }
    exports.constObservable = constObservable;
    class ConstObservable extends base_1.ConvenientObservable {
        constructor(value) {
            super();
            this.value = value;
        }
        get debugName() {
            return this.toString();
        }
        get() {
            return this.value;
        }
        addObserver(observer) {
            // NO OP
        }
        removeObserver(observer) {
            // NO OP
        }
        toString() {
            return `Const: ${this.value}`;
        }
    }
    function observableFromPromise(promise) {
        const observable = (0, base_1.observableValue)('promiseValue', {});
        promise.then((value) => {
            observable.set({ value }, undefined);
        });
        return observable;
    }
    exports.observableFromPromise = observableFromPromise;
    function waitForState(observable, predicate) {
        return new Promise(resolve => {
            let didRun = false;
            let shouldDispose = false;
            const d = (0, autorun_1.autorun)(reader => {
                /** @description waitForState */
                const currentState = observable.read(reader);
                if (predicate(currentState)) {
                    if (!didRun) {
                        shouldDispose = true;
                    }
                    else {
                        d.dispose();
                    }
                    resolve(currentState);
                }
            });
            didRun = true;
            if (shouldDispose) {
                d.dispose();
            }
        });
    }
    exports.waitForState = waitForState;
    function observableFromEvent(event, getValue) {
        return new FromEventObservable(event, getValue);
    }
    exports.observableFromEvent = observableFromEvent;
    class FromEventObservable extends base_1.BaseObservable {
        constructor(event, _getValue) {
            super();
            this.event = event;
            this._getValue = _getValue;
            this.hasValue = false;
            this.handleEvent = (args) => {
                const newValue = this._getValue(args);
                const didChange = !this.hasValue || this.value !== newValue;
                (0, logging_1.getLogger)()?.handleFromEventObservableTriggered(this, { oldValue: this.value, newValue, change: undefined, didChange, hadValue: this.hasValue });
                if (didChange) {
                    this.value = newValue;
                    if (this.hasValue) {
                        (0, base_1.transaction)((tx) => {
                            for (const o of this.observers) {
                                tx.updateObserver(o, this);
                                o.handleChange(this, undefined);
                            }
                        }, () => {
                            const name = this.getDebugName();
                            return 'Event fired' + (name ? `: ${name}` : '');
                        });
                    }
                    this.hasValue = true;
                }
            };
        }
        getDebugName() {
            return (0, base_1.getFunctionName)(this._getValue);
        }
        get debugName() {
            const name = this.getDebugName();
            return 'From Event' + (name ? `: ${name}` : '');
        }
        onFirstObserverAdded() {
            this.subscription = this.event(this.handleEvent);
        }
        onLastObserverRemoved() {
            this.subscription.dispose();
            this.subscription = undefined;
            this.hasValue = false;
            this.value = undefined;
        }
        get() {
            if (this.subscription) {
                if (!this.hasValue) {
                    this.handleEvent(undefined);
                }
                return this.value;
            }
            else {
                // no cache, as there are no subscribers to keep it updated
                return this._getValue(undefined);
            }
        }
    }
    exports.FromEventObservable = FromEventObservable;
    (function (observableFromEvent) {
        observableFromEvent.Observer = FromEventObservable;
    })(observableFromEvent || (exports.observableFromEvent = observableFromEvent = {}));
    function observableSignalFromEvent(debugName, event) {
        return new FromEventObservableSignal(debugName, event);
    }
    exports.observableSignalFromEvent = observableSignalFromEvent;
    class FromEventObservableSignal extends base_1.BaseObservable {
        constructor(debugName, event) {
            super();
            this.debugName = debugName;
            this.event = event;
            this.handleEvent = () => {
                (0, base_1.transaction)((tx) => {
                    for (const o of this.observers) {
                        tx.updateObserver(o, this);
                        o.handleChange(this, undefined);
                    }
                }, () => this.debugName);
            };
        }
        onFirstObserverAdded() {
            this.subscription = this.event(this.handleEvent);
        }
        onLastObserverRemoved() {
            this.subscription.dispose();
            this.subscription = undefined;
        }
        get() {
            // NO OP
        }
    }
    function observableSignal(debugNameOrOwner) {
        if (typeof debugNameOrOwner === 'string') {
            return new ObservableSignal(debugNameOrOwner);
        }
        else {
            return new ObservableSignal(undefined, debugNameOrOwner);
        }
    }
    exports.observableSignal = observableSignal;
    class ObservableSignal extends base_1.BaseObservable {
        get debugName() {
            return (0, base_1.getDebugName)(this._debugName, undefined, this._owner, this) ?? 'Observable Signal';
        }
        constructor(_debugName, _owner) {
            super();
            this._debugName = _debugName;
            this._owner = _owner;
        }
        trigger(tx, change) {
            if (!tx) {
                (0, base_1.transaction)(tx => {
                    this.trigger(tx, change);
                }, () => `Trigger signal ${this.debugName}`);
                return;
            }
            for (const o of this.observers) {
                tx.updateObserver(o, this);
                o.handleChange(this, change);
            }
        }
        get() {
            // NO OP
        }
    }
    function debouncedObservable(observable, debounceMs, disposableStore) {
        const debouncedObservable = (0, base_1.observableValue)('debounced', undefined);
        let timeout = undefined;
        disposableStore.add((0, autorun_1.autorun)(reader => {
            /** @description debounce */
            const value = observable.read(reader);
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                (0, base_1.transaction)(tx => {
                    debouncedObservable.set(value, tx);
                });
            }, debounceMs);
        }));
        return debouncedObservable;
    }
    exports.debouncedObservable = debouncedObservable;
    function wasEventTriggeredRecently(event, timeoutMs, disposableStore) {
        const observable = (0, base_1.observableValue)('triggeredRecently', false);
        let timeout = undefined;
        disposableStore.add(event(() => {
            observable.set(true, undefined);
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                observable.set(false, undefined);
            }, timeoutMs);
        }));
        return observable;
    }
    exports.wasEventTriggeredRecently = wasEventTriggeredRecently;
    /**
     * This makes sure the observable is being observed and keeps its cache alive.
     */
    function keepObserved(observable) {
        const o = new KeepAliveObserver(false);
        observable.addObserver(o);
        return (0, lifecycle_1.toDisposable)(() => {
            observable.removeObserver(o);
        });
    }
    exports.keepObserved = keepObserved;
    /**
     * This converts the given observable into an autorun.
     */
    function recomputeInitiallyAndOnChange(observable) {
        const o = new KeepAliveObserver(true);
        observable.addObserver(o);
        observable.reportChanges();
        return (0, lifecycle_1.toDisposable)(() => {
            observable.removeObserver(o);
        });
    }
    exports.recomputeInitiallyAndOnChange = recomputeInitiallyAndOnChange;
    class KeepAliveObserver {
        constructor(forceRecompute) {
            this.forceRecompute = forceRecompute;
            this.counter = 0;
        }
        beginUpdate(observable) {
            this.counter++;
        }
        endUpdate(observable) {
            this.counter--;
            if (this.counter === 0 && this.forceRecompute) {
                observable.reportChanges();
            }
        }
        handlePossibleChange(observable) {
            // NO OP
        }
        handleChange(observable, change) {
            // NO OP
        }
    }
    function derivedObservableWithCache(computeFn) {
        let lastValue = undefined;
        const observable = (0, derived_1.derived)(reader => {
            lastValue = computeFn(reader, lastValue);
            return lastValue;
        });
        return observable;
    }
    exports.derivedObservableWithCache = derivedObservableWithCache;
    function derivedObservableWithWritableCache(owner, computeFn) {
        let lastValue = undefined;
        const counter = (0, base_1.observableValue)('derivedObservableWithWritableCache.counter', 0);
        const observable = (0, derived_1.derived)(owner, reader => {
            counter.read(reader);
            lastValue = computeFn(reader, lastValue);
            return lastValue;
        });
        return Object.assign(observable, {
            clearCache: (transaction) => {
                lastValue = undefined;
                counter.set(counter.get() + 1, transaction);
            },
        });
    }
    exports.derivedObservableWithWritableCache = derivedObservableWithWritableCache;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9vYnNlcnZhYmxlSW50ZXJuYWwvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHOztPQUVHO0lBQ0gsU0FBZ0IsZUFBZSxDQUFJLEtBQVE7UUFDMUMsT0FBTyxJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRkQsMENBRUM7SUFFRCxNQUFNLGVBQW1CLFNBQVEsMkJBQTZCO1FBQzdELFlBQTZCLEtBQVE7WUFDcEMsS0FBSyxFQUFFLENBQUM7WUFEb0IsVUFBSyxHQUFMLEtBQUssQ0FBRztRQUVyQyxDQUFDO1FBRUQsSUFBb0IsU0FBUztZQUM1QixPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBRU0sR0FBRztZQUNULE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBQ00sV0FBVyxDQUFDLFFBQW1CO1lBQ3JDLFFBQVE7UUFDVCxDQUFDO1FBQ00sY0FBYyxDQUFDLFFBQW1CO1lBQ3hDLFFBQVE7UUFDVCxDQUFDO1FBRVEsUUFBUTtZQUNoQixPQUFPLFVBQVUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQy9CLENBQUM7S0FDRDtJQUdELFNBQWdCLHFCQUFxQixDQUFJLE9BQW1CO1FBQzNELE1BQU0sVUFBVSxHQUFHLElBQUEsc0JBQWUsRUFBZ0IsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUN0QixVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLFVBQVUsQ0FBQztJQUNuQixDQUFDO0lBTkQs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