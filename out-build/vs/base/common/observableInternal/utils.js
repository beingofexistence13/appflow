/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/observableInternal/autorun", "vs/base/common/observableInternal/base", "vs/base/common/observableInternal/derived", "vs/base/common/observableInternal/logging"], function (require, exports, lifecycle_1, autorun_1, base_1, derived_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Sc = exports.$Rc = exports.$Qc = exports.$Pc = exports.$Oc = exports.$Nc = exports.$Mc = exports.$Lc = exports.$Kc = exports.$Jc = exports.$Ic = exports.$Hc = exports.$Gc = void 0;
    /**
     * Represents an efficient observable whose value never changes.
     */
    function $Gc(value) {
        return new ConstObservable(value);
    }
    exports.$Gc = $Gc;
    class ConstObservable extends base_1.$3c {
        constructor(a) {
            super();
            this.a = a;
        }
        get debugName() {
            return this.toString();
        }
        get() {
            return this.a;
        }
        addObserver(observer) {
            // NO OP
        }
        removeObserver(observer) {
            // NO OP
        }
        toString() {
            return `Const: ${this.a}`;
        }
    }
    function $Hc(promise) {
        const observable = (0, base_1.$0c)('promiseValue', {});
        promise.then((value) => {
            observable.set({ value }, undefined);
        });
        return observable;
    }
    exports.$Hc = $Hc;
    function $Ic(observable, predicate) {
        return new Promise(resolve => {
            let didRun = false;
            let shouldDispose = false;
            const d = (0, autorun_1.$Ac)(reader => {
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
    exports.$Ic = $Ic;
    function $Jc(event, getValue) {
        return new $Kc(event, getValue);
    }
    exports.$Jc = $Jc;
    class $Kc extends base_1.$4c {
        constructor(h, _getValue) {
            super();
            this.h = h;
            this._getValue = _getValue;
            this.b = false;
            this.k = (args) => {
                const newValue = this._getValue(args);
                const didChange = !this.b || this.a !== newValue;
                (0, logging_1.$Uc)()?.handleFromEventObservableTriggered(this, { oldValue: this.a, newValue, change: undefined, didChange, hadValue: this.b });
                if (didChange) {
                    this.a = newValue;
                    if (this.b) {
                        (0, base_1.$5c)((tx) => {
                            for (const o of this.c) {
                                tx.updateObserver(o, this);
                                o.handleChange(this, undefined);
                            }
                        }, () => {
                            const name = this.i();
                            return 'Event fired' + (name ? `: ${name}` : '');
                        });
                    }
                    this.b = true;
                }
            };
        }
        i() {
            return (0, base_1.$9c)(this._getValue);
        }
        get debugName() {
            const name = this.i();
            return 'From Event' + (name ? `: ${name}` : '');
        }
        f() {
            this.e = this.h(this.k);
        }
        g() {
            this.e.dispose();
            this.e = undefined;
            this.b = false;
            this.a = undefined;
        }
        get() {
            if (this.e) {
                if (!this.b) {
                    this.k(undefined);
                }
                return this.a;
            }
            else {
                // no cache, as there are no subscribers to keep it updated
                return this._getValue(undefined);
            }
        }
    }
    exports.$Kc = $Kc;
    (function ($Jc) {
        $Jc.Observer = $Kc;
    })($Jc || (exports.$Jc = $Jc = {}));
    function $Lc(debugName, event) {
        return new FromEventObservableSignal(debugName, event);
    }
    exports.$Lc = $Lc;
    class FromEventObservableSignal extends base_1.$4c {
        constructor(debugName, b) {
            super();
            this.debugName = debugName;
            this.b = b;
            this.h = () => {
                (0, base_1.$5c)((tx) => {
                    for (const o of this.c) {
                        tx.updateObserver(o, this);
                        o.handleChange(this, undefined);
                    }
                }, () => this.debugName);
            };
        }
        f() {
            this.a = this.b(this.h);
        }
        g() {
            this.a.dispose();
            this.a = undefined;
        }
        get() {
            // NO OP
        }
    }
    function $Mc(debugNameOrOwner) {
        if (typeof debugNameOrOwner === 'string') {
            return new ObservableSignal(debugNameOrOwner);
        }
        else {
            return new ObservableSignal(undefined, debugNameOrOwner);
        }
    }
    exports.$Mc = $Mc;
    class ObservableSignal extends base_1.$4c {
        get debugName() {
            return (0, base_1.$8c)(this.a, undefined, this.b, this) ?? 'Observable Signal';
        }
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
        }
        trigger(tx, change) {
            if (!tx) {
                (0, base_1.$5c)(tx => {
                    this.trigger(tx, change);
                }, () => `Trigger signal ${this.debugName}`);
                return;
            }
            for (const o of this.c) {
                tx.updateObserver(o, this);
                o.handleChange(this, change);
            }
        }
        get() {
            // NO OP
        }
    }
    function $Nc(observable, debounceMs, disposableStore) {
        const debouncedObservable = (0, base_1.$0c)('debounced', undefined);
        let timeout = undefined;
        disposableStore.add((0, autorun_1.$Ac)(reader => {
            /** @description debounce */
            const value = observable.read(reader);
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                (0, base_1.$5c)(tx => {
                    debouncedObservable.set(value, tx);
                });
            }, debounceMs);
        }));
        return debouncedObservable;
    }
    exports.$Nc = $Nc;
    function $Oc(event, timeoutMs, disposableStore) {
        const observable = (0, base_1.$0c)('triggeredRecently', false);
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
    exports.$Oc = $Oc;
    /**
     * This makes sure the observable is being observed and keeps its cache alive.
     */
    function $Pc(observable) {
        const o = new KeepAliveObserver(false);
        observable.addObserver(o);
        return (0, lifecycle_1.$ic)(() => {
            observable.removeObserver(o);
        });
    }
    exports.$Pc = $Pc;
    /**
     * This converts the given observable into an autorun.
     */
    function $Qc(observable) {
        const o = new KeepAliveObserver(true);
        observable.addObserver(o);
        observable.reportChanges();
        return (0, lifecycle_1.$ic)(() => {
            observable.removeObserver(o);
        });
    }
    exports.$Qc = $Qc;
    class KeepAliveObserver {
        constructor(b) {
            this.b = b;
            this.a = 0;
        }
        beginUpdate(observable) {
            this.a++;
        }
        endUpdate(observable) {
            this.a--;
            if (this.a === 0 && this.b) {
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
    function $Rc(computeFn) {
        let lastValue = undefined;
        const observable = (0, derived_1.$Wc)(reader => {
            lastValue = computeFn(reader, lastValue);
            return lastValue;
        });
        return observable;
    }
    exports.$Rc = $Rc;
    function $Sc(owner, computeFn) {
        let lastValue = undefined;
        const counter = (0, base_1.$0c)('derivedObservableWithWritableCache.counter', 0);
        const observable = (0, derived_1.$Wc)(owner, reader => {
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
    exports.$Sc = $Sc;
});
//# sourceMappingURL=utils.js.map