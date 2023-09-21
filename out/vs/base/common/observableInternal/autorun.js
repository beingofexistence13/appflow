/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/lifecycle", "vs/base/common/observableInternal/base", "vs/base/common/observableInternal/logging"], function (require, exports, assert_1, lifecycle_1, base_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.autorunDelta = exports.AutorunObserver = exports.autorunWithStore = exports.autorunWithStoreHandleChanges = exports.autorunHandleChanges = exports.autorun = exports.autorunOpts = void 0;
    function autorunOpts(options, fn) {
        return new AutorunObserver(options.debugName, fn, undefined, undefined);
    }
    exports.autorunOpts = autorunOpts;
    function autorun(fn) {
        return new AutorunObserver(undefined, fn, undefined, undefined);
    }
    exports.autorun = autorun;
    function autorunHandleChanges(options, fn) {
        return new AutorunObserver(options.debugName, fn, options.createEmptyChangeSummary, options.handleChange);
    }
    exports.autorunHandleChanges = autorunHandleChanges;
    function autorunWithStoreHandleChanges(options, fn) {
        const store = new lifecycle_1.DisposableStore();
        const disposable = autorunHandleChanges({
            debugName: options.debugName ?? (() => (0, base_1.getFunctionName)(fn)),
            createEmptyChangeSummary: options.createEmptyChangeSummary,
            handleChange: options.handleChange,
        }, (reader, changeSummary) => {
            store.clear();
            fn(reader, changeSummary, store);
        });
        return (0, lifecycle_1.toDisposable)(() => {
            disposable.dispose();
            store.dispose();
        });
    }
    exports.autorunWithStoreHandleChanges = autorunWithStoreHandleChanges;
    function autorunWithStore(fn) {
        const store = new lifecycle_1.DisposableStore();
        const disposable = autorunOpts({
            debugName: () => (0, base_1.getFunctionName)(fn) || '(anonymous)',
        }, reader => {
            store.clear();
            fn(reader, store);
        });
        return (0, lifecycle_1.toDisposable)(() => {
            disposable.dispose();
            store.dispose();
        });
    }
    exports.autorunWithStore = autorunWithStore;
    var AutorunState;
    (function (AutorunState) {
        /**
         * A dependency could have changed.
         * We need to explicitly ask them if at least one dependency changed.
         */
        AutorunState[AutorunState["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
        /**
         * A dependency changed and we need to recompute.
         */
        AutorunState[AutorunState["stale"] = 2] = "stale";
        AutorunState[AutorunState["upToDate"] = 3] = "upToDate";
    })(AutorunState || (AutorunState = {}));
    class AutorunObserver {
        get debugName() {
            if (typeof this._debugName === 'string') {
                return this._debugName;
            }
            if (typeof this._debugName === 'function') {
                const name = this._debugName();
                if (name !== undefined) {
                    return name;
                }
            }
            const name = (0, base_1.getFunctionName)(this._runFn);
            if (name !== undefined) {
                return name;
            }
            return '(anonymous)';
        }
        constructor(_debugName, _runFn, createChangeSummary, _handleChange) {
            this._debugName = _debugName;
            this._runFn = _runFn;
            this.createChangeSummary = createChangeSummary;
            this._handleChange = _handleChange;
            this.state = 2 /* AutorunState.stale */;
            this.updateCount = 0;
            this.disposed = false;
            this.dependencies = new Set();
            this.dependenciesToBeRemoved = new Set();
            this.changeSummary = this.createChangeSummary?.();
            (0, logging_1.getLogger)()?.handleAutorunCreated(this);
            this._runIfNeeded();
            (0, lifecycle_1.trackDisposable)(this);
        }
        dispose() {
            this.disposed = true;
            for (const o of this.dependencies) {
                o.removeObserver(this);
            }
            this.dependencies.clear();
            (0, lifecycle_1.markAsDisposed)(this);
        }
        _runIfNeeded() {
            if (this.state === 3 /* AutorunState.upToDate */) {
                return;
            }
            const emptySet = this.dependenciesToBeRemoved;
            this.dependenciesToBeRemoved = this.dependencies;
            this.dependencies = emptySet;
            this.state = 3 /* AutorunState.upToDate */;
            try {
                if (!this.disposed) {
                    (0, logging_1.getLogger)()?.handleAutorunTriggered(this);
                    const changeSummary = this.changeSummary;
                    this.changeSummary = this.createChangeSummary?.();
                    this._runFn(this, changeSummary);
                }
            }
            finally {
                (0, logging_1.getLogger)()?.handleAutorunFinished(this);
                // We don't want our observed observables to think that they are (not even temporarily) not being observed.
                // Thus, we only unsubscribe from observables that are definitely not read anymore.
                for (const o of this.dependenciesToBeRemoved) {
                    o.removeObserver(this);
                }
                this.dependenciesToBeRemoved.clear();
            }
        }
        toString() {
            return `Autorun<${this.debugName}>`;
        }
        // IObserver implementation
        beginUpdate() {
            if (this.state === 3 /* AutorunState.upToDate */) {
                this.state = 1 /* AutorunState.dependenciesMightHaveChanged */;
            }
            this.updateCount++;
        }
        endUpdate() {
            if (this.updateCount === 1) {
                do {
                    if (this.state === 1 /* AutorunState.dependenciesMightHaveChanged */) {
                        this.state = 3 /* AutorunState.upToDate */;
                        for (const d of this.dependencies) {
                            d.reportChanges();
                            if (this.state === 2 /* AutorunState.stale */) {
                                // The other dependencies will refresh on demand
                                break;
                            }
                        }
                    }
                    this._runIfNeeded();
                } while (this.state !== 3 /* AutorunState.upToDate */);
            }
            this.updateCount--;
            (0, assert_1.assertFn)(() => this.updateCount >= 0);
        }
        handlePossibleChange(observable) {
            if (this.state === 3 /* AutorunState.upToDate */ && this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
                this.state = 1 /* AutorunState.dependenciesMightHaveChanged */;
            }
        }
        handleChange(observable, change) {
            if (this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
                const shouldReact = this._handleChange ? this._handleChange({
                    changedObservable: observable,
                    change,
                    didChange: o => o === observable,
                }, this.changeSummary) : true;
                if (shouldReact) {
                    this.state = 2 /* AutorunState.stale */;
                }
            }
        }
        // IReader implementation
        readObservable(observable) {
            // In case the run action disposes the autorun
            if (this.disposed) {
                return observable.get();
            }
            observable.addObserver(this);
            const value = observable.get();
            this.dependencies.add(observable);
            this.dependenciesToBeRemoved.delete(observable);
            return value;
        }
    }
    exports.AutorunObserver = AutorunObserver;
    (function (autorun) {
        autorun.Observer = AutorunObserver;
    })(autorun || (exports.autorun = autorun = {}));
    function autorunDelta(observable, handler) {
        let _lastValue;
        return autorunOpts({ debugName: () => (0, base_1.getFunctionName)(handler) }, (reader) => {
            const newValue = observable.read(reader);
            const lastValue = _lastValue;
            _lastValue = newValue;
            handler({ lastValue, newValue });
        });
    }
    exports.autorunDelta = autorunDelta;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3J1bi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL29ic2VydmFibGVJbnRlcm5hbC9hdXRvcnVuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxTQUFnQixXQUFXLENBQUMsT0FBMkQsRUFBRSxFQUE2QjtRQUNySCxPQUFPLElBQUksZUFBZSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRkQsa0NBRUM7SUFFRCxTQUFnQixPQUFPLENBQUMsRUFBNkI7UUFDcEQsT0FBTyxJQUFJLGVBQWUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRkQsMEJBRUM7SUFFRCxTQUFnQixvQkFBb0IsQ0FDbkMsT0FJQyxFQUNELEVBQTREO1FBRTVELE9BQU8sSUFBSSxlQUFlLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLHdCQUF3QixFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMzRyxDQUFDO0lBVEQsb0RBU0M7SUFFRCxTQUFnQiw2QkFBNkIsQ0FDNUMsT0FJQyxFQUNELEVBQW9GO1FBRXBGLE1BQU0sS0FBSyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBQ3BDLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUN0QztZQUNDLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBQSxzQkFBZSxFQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzNELHdCQUF3QixFQUFFLE9BQU8sQ0FBQyx3QkFBd0I7WUFDMUQsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO1NBQ2xDLEVBQ0QsQ0FBQyxNQUFNLEVBQUUs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