/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/observableInternal/base", "vs/base/common/observableInternal/logging"], function (require, exports, errors_1, lifecycle_1, base_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1c = exports.$Zc = exports.$Yc = exports.$Xc = exports.$Wc = void 0;
    const defaultEqualityComparer = (a, b) => a === b;
    function $Wc(computeFnOrOwner, computeFn) {
        if (computeFn !== undefined) {
            return new $1c(computeFnOrOwner, undefined, computeFn, undefined, undefined, undefined, defaultEqualityComparer);
        }
        return new $1c(undefined, undefined, computeFnOrOwner, undefined, undefined, undefined, defaultEqualityComparer);
    }
    exports.$Wc = $Wc;
    function $Xc(options, computeFn) {
        return new $1c(options.owner, options.debugName, computeFn, undefined, undefined, undefined, options.equalityComparer ?? defaultEqualityComparer);
    }
    exports.$Xc = $Xc;
    function $Yc(options, computeFn) {
        return new $1c(options.owner, options.debugName, computeFn, options.createEmptyChangeSummary, options.handleChange, undefined, options.equalityComparer ?? defaultEqualityComparer);
    }
    exports.$Yc = $Yc;
    function $Zc(computeFnOrOwner, computeFnOrUndefined) {
        let computeFn;
        let owner;
        if (computeFnOrUndefined === undefined) {
            computeFn = computeFnOrOwner;
            owner = undefined;
        }
        else {
            owner = computeFnOrOwner;
            computeFn = computeFnOrUndefined;
        }
        const store = new lifecycle_1.$jc();
        return new $1c(owner, (() => (0, base_1.$9c)(computeFn) ?? '(anonymous)'), r => {
            store.clear();
            return computeFn(r, store);
        }, undefined, undefined, () => store.dispose(), defaultEqualityComparer);
    }
    exports.$Zc = $Zc;
    (0, base_1.$2c)($Wc);
    var DerivedState;
    (function (DerivedState) {
        /** Initial state, no previous value, recomputation needed */
        DerivedState[DerivedState["initial"] = 0] = "initial";
        /**
         * A dependency could have changed.
         * We need to explicitly ask them if at least one dependency changed.
         */
        DerivedState[DerivedState["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
        /**
         * A dependency changed and we need to recompute.
         * After recomputation, we need to check the previous value to see if we changed as well.
         */
        DerivedState[DerivedState["stale"] = 2] = "stale";
        /**
         * No change reported, our cached value is up to date.
         */
        DerivedState[DerivedState["upToDate"] = 3] = "upToDate";
    })(DerivedState || (DerivedState = {}));
    class $1c extends base_1.$4c {
        get debugName() {
            return (0, base_1.$8c)(this.n, this._computeFn, this.m, this) ?? '(anonymous)';
        }
        constructor(m, n, _computeFn, p, q, s = undefined, t) {
            super();
            this.m = m;
            this.n = n;
            this._computeFn = _computeFn;
            this.p = p;
            this.q = q;
            this.s = s;
            this.t = t;
            this.e = 0 /* DerivedState.initial */;
            this.h = undefined;
            this.i = 0;
            this.j = new Set();
            this.k = new Set();
            this.l = undefined;
            this.l = this.p?.();
            (0, logging_1.$Uc)()?.handleDerivedCreated(this);
        }
        g() {
            /**
             * We are not tracking changes anymore, thus we have to assume
             * that our cache is invalid.
             */
            this.e = 0 /* DerivedState.initial */;
            this.h = undefined;
            for (const d of this.j) {
                d.removeObserver(this);
            }
            this.j.clear();
            this.s?.();
        }
        get() {
            if (this.c.size === 0) {
                // Without observers, we don't know when to clean up stuff.
                // Thus, we don't cache anything to prevent memory leaks.
                const result = this._computeFn(this, this.p?.());
                // Clear new dependencies
                this.g();
                return result;
            }
            else {
                do {
                    // We might not get a notification for a dependency that changed while it is updating,
                    // thus we also have to ask all our depedencies if they changed in this case.
                    if (this.e === 1 /* DerivedState.dependenciesMightHaveChanged */) {
                        for (const d of this.j) {
                            /** might call {@link handleChange} indirectly, which could make us stale */
                            d.reportChanges();
                            if (this.e === 2 /* DerivedState.stale */) {
                                // The other dependencies will refresh on demand, so early break
                                break;
                            }
                        }
                    }
                    // We called report changes of all dependencies.
                    // If we are still not stale, we can assume to be up to date again.
                    if (this.e === 1 /* DerivedState.dependenciesMightHaveChanged */) {
                        this.e = 3 /* DerivedState.upToDate */;
                    }
                    this.v();
                    // In case recomputation changed one of our dependencies, we need to recompute again.
                } while (this.e !== 3 /* DerivedState.upToDate */);
                return this.h;
            }
        }
        v() {
            if (this.e === 3 /* DerivedState.upToDate */) {
                return;
            }
            const emptySet = this.k;
            this.k = this.j;
            this.j = emptySet;
            const hadValue = this.e !== 0 /* DerivedState.initial */;
            const oldValue = this.h;
            this.e = 3 /* DerivedState.upToDate */;
            const changeSummary = this.l;
            this.l = this.p?.();
            try {
                /** might call {@link handleChange} indirectly, which could invalidate us */
                this.h = this._computeFn(this, changeSummary);
            }
            finally {
                // We don't want our observed observables to think that they are (not even temporarily) not being observed.
                // Thus, we only unsubscribe from observables that are definitely not read anymore.
                for (const o of this.k) {
                    o.removeObserver(this);
                }
                this.k.clear();
            }
            const didChange = hadValue && !(this.t(oldValue, this.h));
            (0, logging_1.$Uc)()?.handleDerivedRecomputed(this, {
                oldValue,
                newValue: this.h,
                change: undefined,
                didChange,
                hadValue,
            });
            if (didChange) {
                for (const r of this.c) {
                    r.handleChange(this, undefined);
                }
            }
        }
        toString() {
            return `LazyDerived<${this.debugName}>`;
        }
        // IObserver Implementation
        beginUpdate(_observable) {
            this.i++;
            const propagateBeginUpdate = this.i === 1;
            if (this.e === 3 /* DerivedState.upToDate */) {
                this.e = 1 /* DerivedState.dependenciesMightHaveChanged */;
                // If we propagate begin update, that will already signal a possible change.
                if (!propagateBeginUpdate) {
                    for (const r of this.c) {
                        r.handlePossibleChange(this);
                    }
                }
            }
            if (propagateBeginUpdate) {
                for (const r of this.c) {
                    r.beginUpdate(this); // This signals a possible change
                }
            }
        }
        endUpdate(_observable) {
            this.i--;
            if (this.i === 0) {
                // End update could change the observer list.
                const observers = [...this.c];
                for (const r of observers) {
                    r.endUpdate(this);
                }
            }
            if (this.i < 0) {
                throw new errors_1.$ab();
            }
        }
        handlePossibleChange(observable) {
            // In all other states, observers already know that we might have changed.
            if (this.e === 3 /* DerivedState.upToDate */ && this.j.has(observable) && !this.k.has(observable)) {
                this.e = 1 /* DerivedState.dependenciesMightHaveChanged */;
                for (const r of this.c) {
                    r.handlePossibleChange(this);
                }
            }
        }
        handleChange(observable, change) {
            if (this.j.has(observable) && !this.k.has(observable)) {
                const shouldReact = this.q ? this.q({
                    changedObservable: observable,
                    change,
                    didChange: o => o === observable,
                }, this.l) : true;
                const wasUpToDate = this.e === 3 /* DerivedState.upToDate */;
                if (shouldReact && (this.e === 1 /* DerivedState.dependenciesMightHaveChanged */ || wasUpToDate)) {
                    this.e = 2 /* DerivedState.stale */;
                    if (wasUpToDate) {
                        for (const r of this.c) {
                            r.handlePossibleChange(this);
                        }
                    }
                }
            }
        }
        // IReader Implementation
        readObservable(observable) {
            // Subscribe before getting the value to enable caching
            observable.addObserver(this);
            /** This might call {@link handleChange} indirectly, which could invalidate us */
            const value = observable.get();
            // Which is why we only add the observable to the dependencies now.
            this.j.add(observable);
            this.k.delete(observable);
            return value;
        }
        addObserver(observer) {
            const shouldCallBeginUpdate = !this.c.has(observer) && this.i > 0;
            super.addObserver(observer);
            if (shouldCallBeginUpdate) {
                observer.beginUpdate(this);
            }
        }
        removeObserver(observer) {
            const shouldCallEndUpdate = this.c.has(observer) && this.i > 0;
            super.removeObserver(observer);
            if (shouldCallEndUpdate) {
                // Calling end update after removing the observer makes sure endUpdate cannot be called twice here.
                observer.endUpdate(this);
            }
        }
    }
    exports.$1c = $1c;
});
//# sourceMappingURL=derived.js.map