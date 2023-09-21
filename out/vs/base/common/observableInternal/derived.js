/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/observableInternal/base", "vs/base/common/observableInternal/logging"], function (require, exports, errors_1, lifecycle_1, base_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Derived = exports.derivedWithStore = exports.derivedHandleChanges = exports.derivedOpts = exports.derived = void 0;
    const defaultEqualityComparer = (a, b) => a === b;
    function derived(computeFnOrOwner, computeFn) {
        if (computeFn !== undefined) {
            return new Derived(computeFnOrOwner, undefined, computeFn, undefined, undefined, undefined, defaultEqualityComparer);
        }
        return new Derived(undefined, undefined, computeFnOrOwner, undefined, undefined, undefined, defaultEqualityComparer);
    }
    exports.derived = derived;
    function derivedOpts(options, computeFn) {
        return new Derived(options.owner, options.debugName, computeFn, undefined, undefined, undefined, options.equalityComparer ?? defaultEqualityComparer);
    }
    exports.derivedOpts = derivedOpts;
    function derivedHandleChanges(options, computeFn) {
        return new Derived(options.owner, options.debugName, computeFn, options.createEmptyChangeSummary, options.handleChange, undefined, options.equalityComparer ?? defaultEqualityComparer);
    }
    exports.derivedHandleChanges = derivedHandleChanges;
    function derivedWithStore(computeFnOrOwner, computeFnOrUndefined) {
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
        const store = new lifecycle_1.DisposableStore();
        return new Derived(owner, (() => (0, base_1.getFunctionName)(computeFn) ?? '(anonymous)'), r => {
            store.clear();
            return computeFn(r, store);
        }, undefined, undefined, () => store.dispose(), defaultEqualityComparer);
    }
    exports.derivedWithStore = derivedWithStore;
    (0, base_1._setDerivedOpts)(derived);
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
    class Derived extends base_1.BaseObservable {
        get debugName() {
            return (0, base_1.getDebugName)(this._debugName, this._computeFn, this._owner, this) ?? '(anonymous)';
        }
        constructor(_owner, _debugName, _computeFn, createChangeSummary, _handleChange, _handleLastObserverRemoved = undefined, _equalityComparator) {
            super();
            this._owner = _owner;
            this._debugName = _debugName;
            this._computeFn = _computeFn;
            this.createChangeSummary = createChangeSummary;
            this._handleChange = _handleChange;
            this._handleLastObserverRemoved = _handleLastObserverRemoved;
            this._equalityComparator = _equalityComparator;
            this.state = 0 /* DerivedState.initial */;
            this.value = undefined;
            this.updateCount = 0;
            this.dependencies = new Set();
            this.dependenciesToBeRemoved = new Set();
            this.changeSummary = undefined;
            this.changeSummary = this.createChangeSummary?.();
            (0, logging_1.getLogger)()?.handleDerivedCreated(this);
        }
        onLastObserverRemoved() {
            /**
             * We are not tracking changes anymore, thus we have to assume
             * that our cache is invalid.
             */
            this.state = 0 /* DerivedState.initial */;
            this.value = undefined;
            for (const d of this.dependencies) {
                d.removeObserver(this);
            }
            this.dependencies.clear();
            this._handleLastObserverRemoved?.();
        }
        get() {
            if (this.observers.size === 0) {
                // Without observers, we don't know when to clean up stuff.
                // Thus, we don't cache anything to prevent memory leaks.
                const result = this._computeFn(this, this.createChangeSummary?.());
                // Clear new dependencies
                this.onLastObserverRemoved();
                return result;
            }
            else {
                do {
                    // We might not get a notification for a dependency that changed while it is updating,
                    // thus we also have to ask all our depedencies if they changed in this case.
                    if (this.state === 1 /* DerivedState.dependenciesMightHaveChanged */) {
                        for (const d of this.dependencies) {
                            /** might call {@link handleChange} indirectly, which could make us stale */
                            d.reportChanges();
                            if (this.state === 2 /* DerivedState.stale */) {
                                // The other dependencies will refresh on demand, so early break
                                break;
                            }
                        }
                    }
                    // We called report changes of all dependencies.
                    // If we are still not stale, we can assume to be up to date again.
                    if (this.state === 1 /* DerivedState.dependenciesMightHaveChanged */) {
                        this.state = 3 /* DerivedState.upToDate */;
                    }
                    this._recomputeIfNeeded();
                    // In case recomputation changed one of our dependencies, we need to recompute again.
                } while (this.state !== 3 /* DerivedState.upToDate */);
                return this.value;
            }
        }
        _recomputeIfNeeded() {
            if (this.state === 3 /* DerivedState.upToDate */) {
                return;
            }
            const emptySet = this.dependenciesToBeRemoved;
            this.dependenciesToBeRemoved = this.dependencies;
            this.dependencies = emptySet;
            const hadValue = this.state !== 0 /* DerivedState.initial */;
            const oldValue = this.value;
            this.state = 3 /* DerivedState.upToDate */;
            const changeSummary = this.changeSummary;
            this.changeSummary = this.createChangeSummary?.();
            try {
                /** might call {@link handleChange} indirectly, which could invalidate us */
                this.value = this._computeFn(this, changeSummary);
            }
            finally {
                // We don't want our observed observables to think that they are (not even temporarily) not being observed.
                // Thus, we only unsubscribe from observables that are definitely not read anymore.
                for (const o of this.dependenciesToBeRemoved) {
                    o.removeObserver(this);
                }
                this.dependenciesToBeRemoved.clear();
            }
            const didChange = hadValue && !(this._equalityComparator(oldValue, this.value));
            (0, logging_1.getLogger)()?.handleDerivedRecomputed(this, {
                oldValue,
                newValue: this.value,
                change: undefined,
                didChange,
                hadValue,
            });
            if (didChange) {
                for (const r of this.observers) {
                    r.handleChange(this, undefined);
                }
            }
        }
        toString() {
            return `LazyDerived<${this.debugName}>`;
        }
        // IObserver Implementation
        beginUpdate(_observable) {
            this.updateCount++;
            const propagateBeginUpdate = this.updateCount === 1;
            if (this.state === 3 /* DerivedState.upToDate */) {
                this.state = 1 /* DerivedState.dependenciesMightHaveChanged */;
                // If we propagate begin update, that will already signal a possible change.
                if (!propagateBeginUpdate) {
                    for (const r of this.observers) {
                        r.handlePossibleChange(this);
                    }
                }
            }
            if (propagateBeginUpdate) {
                for (const r of this.observers) {
                    r.beginUpdate(this); // This signals a possible change
                }
            }
        }
        endUpdate(_observable) {
            this.updateCount--;
            if (this.updateCount === 0) {
                // End update could change the observer list.
                const observers = [...this.observers];
                for (const r of observers) {
                    r.endUpdate(this);
                }
            }
            if (this.updateCount < 0) {
                throw new errors_1.BugIndicatingError();
            }
        }
        handlePossibleChange(observable) {
            // In all other states, observers already know that we might have changed.
            if (this.state === 3 /* DerivedState.upToDate */ && this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
                this.state = 1 /* DerivedState.dependenciesMightHaveChanged */;
                for (const r of this.observers) {
                    r.handlePossibleChange(this);
                }
            }
        }
        handleChange(observable, change) {
            if (this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
                const shouldReact = this._handleChange ? this._handleChange({
                    changedObservable: observable,
                    change,
                    didChange: o => o === observable,
                }, this.changeSummary) : true;
                const wasUpToDate = this.state === 3 /* DerivedState.upToDate */;
                if (shouldReact && (this.state === 1 /* DerivedState.dependenciesMightHaveChanged */ || wasUpToDate)) {
                    this.state = 2 /* DerivedState.stale */;
                    if (wasUpToDate) {
                        for (const r of this.observers) {
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
            this.dependencies.add(observable);
            this.dependenciesToBeRemoved.delete(observable);
            return value;
        }
        addObserver(observer) {
            const shouldCallBeginUpdate = !this.observers.has(observer) && this.updateCount > 0;
            super.addObserver(observer);
            if (shouldCallBeginUpdate) {
                observer.beginUpdate(this);
            }
        }
        removeObserver(observer) {
            const shouldCallEndUpdate = this.observers.has(observer) && this.updateCount > 0;
            super.removeObserver(observer);
            if (shouldCallEndUpdate) {
                // Calling end update after removing the observer makes sure endUpdate cannot be called twice here.
                observer.endUpdate(this);
            }
        }
    }
    exports.Derived = Derived;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVyaXZlZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL29ic2VydmFibGVJbnRlcm5hbC9kZXJpdmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxNQUFNLHVCQUF1QixHQUEwQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFPekUsU0FBZ0IsT0FBTyxDQUFJLGdCQUFtRCxFQUFFLFNBQWdEO1FBQy9ILElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTtZQUM1QixPQUFPLElBQUksT0FBTyxDQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztTQUNySDtRQUNELE9BQU8sSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxnQkFBdUIsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0lBQzdILENBQUM7SUFMRCwwQkFLQztJQUVELFNBQWdCLFdBQVcsQ0FDMUIsT0FJQyxFQUNELFNBQWlDO1FBRWpDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLElBQUksdUJBQXVCLENBQUMsQ0FBQztJQUN2SixDQUFDO0lBVEQsa0NBU0M7SUFFRCxTQUFnQixvQkFBb0IsQ0FDbkMsT0FNQyxFQUNELFNBQWdFO1FBRWhFLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsd0JB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