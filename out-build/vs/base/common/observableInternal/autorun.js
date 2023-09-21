/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/lifecycle", "vs/base/common/observableInternal/base", "vs/base/common/observableInternal/logging"], function (require, exports, assert_1, lifecycle_1, base_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Fc = exports.$Ec = exports.$Dc = exports.$Cc = exports.$Bc = exports.$Ac = exports.$zc = void 0;
    function $zc(options, fn) {
        return new $Ec(options.debugName, fn, undefined, undefined);
    }
    exports.$zc = $zc;
    function $Ac(fn) {
        return new $Ec(undefined, fn, undefined, undefined);
    }
    exports.$Ac = $Ac;
    function $Bc(options, fn) {
        return new $Ec(options.debugName, fn, options.createEmptyChangeSummary, options.handleChange);
    }
    exports.$Bc = $Bc;
    function $Cc(options, fn) {
        const store = new lifecycle_1.$jc();
        const disposable = $Bc({
            debugName: options.debugName ?? (() => (0, base_1.$9c)(fn)),
            createEmptyChangeSummary: options.createEmptyChangeSummary,
            handleChange: options.handleChange,
        }, (reader, changeSummary) => {
            store.clear();
            fn(reader, changeSummary, store);
        });
        return (0, lifecycle_1.$ic)(() => {
            disposable.dispose();
            store.dispose();
        });
    }
    exports.$Cc = $Cc;
    function $Dc(fn) {
        const store = new lifecycle_1.$jc();
        const disposable = $zc({
            debugName: () => (0, base_1.$9c)(fn) || '(anonymous)',
        }, reader => {
            store.clear();
            fn(reader, store);
        });
        return (0, lifecycle_1.$ic)(() => {
            disposable.dispose();
            store.dispose();
        });
    }
    exports.$Dc = $Dc;
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
    class $Ec {
        get debugName() {
            if (typeof this.h === 'string') {
                return this.h;
            }
            if (typeof this.h === 'function') {
                const name = this.h();
                if (name !== undefined) {
                    return name;
                }
            }
            const name = (0, base_1.$9c)(this._runFn);
            if (name !== undefined) {
                return name;
            }
            return '(anonymous)';
        }
        constructor(h, _runFn, i, j) {
            this.h = h;
            this._runFn = _runFn;
            this.i = i;
            this.j = j;
            this.a = 2 /* AutorunState.stale */;
            this.b = 0;
            this.c = false;
            this.e = new Set();
            this.f = new Set();
            this.g = this.i?.();
            (0, logging_1.$Uc)()?.handleAutorunCreated(this);
            this.k();
            (0, lifecycle_1.$bc)(this);
        }
        dispose() {
            this.c = true;
            for (const o of this.e) {
                o.removeObserver(this);
            }
            this.e.clear();
            (0, lifecycle_1.$cc)(this);
        }
        k() {
            if (this.a === 3 /* AutorunState.upToDate */) {
                return;
            }
            const emptySet = this.f;
            this.f = this.e;
            this.e = emptySet;
            this.a = 3 /* AutorunState.upToDate */;
            try {
                if (!this.c) {
                    (0, logging_1.$Uc)()?.handleAutorunTriggered(this);
                    const changeSummary = this.g;
                    this.g = this.i?.();
                    this._runFn(this, changeSummary);
                }
            }
            finally {
                (0, logging_1.$Uc)()?.handleAutorunFinished(this);
                // We don't want our observed observables to think that they are (not even temporarily) not being observed.
                // Thus, we only unsubscribe from observables that are definitely not read anymore.
                for (const o of this.f) {
                    o.removeObserver(this);
                }
                this.f.clear();
            }
        }
        toString() {
            return `Autorun<${this.debugName}>`;
        }
        // IObserver implementation
        beginUpdate() {
            if (this.a === 3 /* AutorunState.upToDate */) {
                this.a = 1 /* AutorunState.dependenciesMightHaveChanged */;
            }
            this.b++;
        }
        endUpdate() {
            if (this.b === 1) {
                do {
                    if (this.a === 1 /* AutorunState.dependenciesMightHaveChanged */) {
                        this.a = 3 /* AutorunState.upToDate */;
                        for (const d of this.e) {
                            d.reportChanges();
                            if (this.a === 2 /* AutorunState.stale */) {
                                // The other dependencies will refresh on demand
                                break;
                            }
                        }
                    }
                    this.k();
                } while (this.a !== 3 /* AutorunState.upToDate */);
            }
            this.b--;
            (0, assert_1.$xc)(() => this.b >= 0);
        }
        handlePossibleChange(observable) {
            if (this.a === 3 /* AutorunState.upToDate */ && this.e.has(observable) && !this.f.has(observable)) {
                this.a = 1 /* AutorunState.dependenciesMightHaveChanged */;
            }
        }
        handleChange(observable, change) {
            if (this.e.has(observable) && !this.f.has(observable)) {
                const shouldReact = this.j ? this.j({
                    changedObservable: observable,
                    change,
                    didChange: o => o === observable,
                }, this.g) : true;
                if (shouldReact) {
                    this.a = 2 /* AutorunState.stale */;
                }
            }
        }
        // IReader implementation
        readObservable(observable) {
            // In case the run action disposes the autorun
            if (this.c) {
                return observable.get();
            }
            observable.addObserver(this);
            const value = observable.get();
            this.e.add(observable);
            this.f.delete(observable);
            return value;
        }
    }
    exports.$Ec = $Ec;
    (function ($Ac) {
        $Ac.Observer = $Ec;
    })($Ac || (exports.$Ac = $Ac = {}));
    function $Fc(observable, handler) {
        let _lastValue;
        return $zc({ debugName: () => (0, base_1.$9c)(handler) }, (reader) => {
            const newValue = observable.read(reader);
            const lastValue = _lastValue;
            _lastValue = newValue;
            handler({ lastValue, newValue });
        });
    }
    exports.$Fc = $Fc;
});
//# sourceMappingURL=autorun.js.map