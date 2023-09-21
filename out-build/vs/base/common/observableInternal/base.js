/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observableInternal/logging"], function (require, exports, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ad = exports.$_c = exports.$$c = exports.$0c = exports.$9c = exports.$8c = exports.$7c = exports.$6c = exports.$5c = exports.$4c = exports.$3c = exports.$2c = void 0;
    let _derived;
    /**
     * @internal
     * This is to allow splitting files.
    */
    function $2c(derived) {
        _derived = derived;
    }
    exports.$2c = $2c;
    class $3c {
        get TChange() { return null; }
        reportChanges() {
            this.get();
        }
        /** @sealed */
        read(reader) {
            if (reader) {
                return reader.readObservable(this);
            }
            else {
                return this.get();
            }
        }
        map(fnOrOwner, fnOrUndefined) {
            const owner = fnOrUndefined === undefined ? undefined : fnOrOwner;
            const fn = fnOrUndefined === undefined ? fnOrOwner : fnOrUndefined;
            return _derived({
                owner,
                debugName: () => {
                    const name = $9c(fn);
                    if (name !== undefined) {
                        return name;
                    }
                    // regexp to match `x => x.y` where x and y can be arbitrary identifiers (uses backref):
                    const regexp = /^\s*\(?\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*\)?\s*=>\s*\1\.([a-zA-Z_$][a-zA-Z_$0-9]*)\s*$/;
                    const match = regexp.exec(fn.toString());
                    if (match) {
                        return `${this.debugName}.${match[2]}`;
                    }
                    if (!owner) {
                        return `${this.debugName} (mapped)`;
                    }
                    return undefined;
                },
            }, (reader) => fn(this.read(reader), reader));
        }
    }
    exports.$3c = $3c;
    class $4c extends $3c {
        constructor() {
            super(...arguments);
            this.c = new Set();
        }
        addObserver(observer) {
            const len = this.c.size;
            this.c.add(observer);
            if (len === 0) {
                this.f();
            }
        }
        removeObserver(observer) {
            const deleted = this.c.delete(observer);
            if (deleted && this.c.size === 0) {
                this.g();
            }
        }
        f() { }
        g() { }
    }
    exports.$4c = $4c;
    function $5c(fn, getDebugName) {
        const tx = new $7c(fn, getDebugName);
        try {
            fn(tx);
        }
        finally {
            tx.finish();
        }
    }
    exports.$5c = $5c;
    function $6c(tx, fn, getDebugName) {
        if (!tx) {
            $5c(fn, getDebugName);
        }
        else {
            fn(tx);
        }
    }
    exports.$6c = $6c;
    class $7c {
        constructor(_fn, b) {
            this._fn = _fn;
            this.b = b;
            this.a = [];
            (0, logging_1.$Uc)()?.handleBeginTransaction(this);
        }
        getDebugName() {
            if (this.b) {
                return this.b();
            }
            return $9c(this._fn);
        }
        updateObserver(observer, observable) {
            this.a.push({ observer, observable });
            observer.beginUpdate(observable);
        }
        finish() {
            const updatingObservers = this.a;
            // Prevent anyone from updating observers from now on.
            this.a = null;
            for (const { observer, observable } of updatingObservers) {
                observer.endUpdate(observable);
            }
            (0, logging_1.$Uc)()?.handleEndTransaction();
        }
    }
    exports.$7c = $7c;
    function $8c(debugNameFn, fn, owner, self) {
        let result;
        if (debugNameFn !== undefined) {
            if (typeof debugNameFn === 'function') {
                result = debugNameFn();
                if (result !== undefined) {
                    return result;
                }
            }
            else {
                return debugNameFn;
            }
        }
        if (fn !== undefined) {
            result = $9c(fn);
            if (result !== undefined) {
                return result;
            }
        }
        if (owner !== undefined) {
            for (const key in owner) {
                if (owner[key] === self) {
                    return key;
                }
            }
        }
        return undefined;
    }
    exports.$8c = $8c;
    function $9c(fn) {
        const fnSrc = fn.toString();
        // Pattern: /** @description ... */
        const regexp = /\/\*\*\s*@description\s*([^*]*)\*\//;
        const match = regexp.exec(fnSrc);
        const result = match ? match[1] : undefined;
        return result?.trim();
    }
    exports.$9c = $9c;
    function $0c(nameOrOwner, initialValue) {
        if (typeof nameOrOwner === 'string') {
            return new $$c(undefined, nameOrOwner, initialValue);
        }
        else {
            return new $$c(nameOrOwner, undefined, initialValue);
        }
    }
    exports.$0c = $0c;
    class $$c extends $4c {
        get debugName() {
            return $8c(this.d, undefined, this.b, this) ?? 'ObservableValue';
        }
        constructor(b, d, initialValue) {
            super();
            this.b = b;
            this.d = d;
            this.a = initialValue;
        }
        get() {
            return this.a;
        }
        set(value, tx, change) {
            if (this.a === value) {
                return;
            }
            let _tx;
            if (!tx) {
                tx = _tx = new $7c(() => { }, () => `Setting ${this.debugName}`);
            }
            try {
                const oldValue = this.a;
                this.e(value);
                (0, logging_1.$Uc)()?.handleObservableChanged(this, { oldValue, newValue: value, change, didChange: true, hadValue: true });
                for (const observer of this.c) {
                    tx.updateObserver(observer, this);
                    observer.handleChange(this, change);
                }
            }
            finally {
                if (_tx) {
                    _tx.finish();
                }
            }
        }
        toString() {
            return `${this.debugName}: ${this.a}`;
        }
        e(newValue) {
            this.a = newValue;
        }
    }
    exports.$$c = $$c;
    function $_c(nameOrOwner, initialValue) {
        if (typeof nameOrOwner === 'string') {
            return new $ad(undefined, nameOrOwner, initialValue);
        }
        else {
            return new $ad(nameOrOwner, undefined, initialValue);
        }
    }
    exports.$_c = $_c;
    class $ad extends $$c {
        e(newValue) {
            if (this.a === newValue) {
                return;
            }
            if (this.a) {
                this.a.dispose();
            }
            this.a = newValue;
        }
        dispose() {
            this.a?.dispose();
        }
    }
    exports.$ad = $ad;
});
//# sourceMappingURL=base.js.map