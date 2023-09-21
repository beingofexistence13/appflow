/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observableInternal/logging"], function (require, exports, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DisposableObservableValue = exports.disposableObservableValue = exports.ObservableValue = exports.observableValue = exports.getFunctionName = exports.getDebugName = exports.TransactionImpl = exports.subtransaction = exports.transaction = exports.BaseObservable = exports.ConvenientObservable = exports._setDerivedOpts = void 0;
    let _derived;
    /**
     * @internal
     * This is to allow splitting files.
    */
    function _setDerivedOpts(derived) {
        _derived = derived;
    }
    exports._setDerivedOpts = _setDerivedOpts;
    class ConvenientObservable {
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
                    const name = getFunctionName(fn);
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
    exports.ConvenientObservable = ConvenientObservable;
    class BaseObservable extends ConvenientObservable {
        constructor() {
            super(...arguments);
            this.observers = new Set();
        }
        addObserver(observer) {
            const len = this.observers.size;
            this.observers.add(observer);
            if (len === 0) {
                this.onFirstObserverAdded();
            }
        }
        removeObserver(observer) {
            const deleted = this.observers.delete(observer);
            if (deleted && this.observers.size === 0) {
                this.onLastObserverRemoved();
            }
        }
        onFirstObserverAdded() { }
        onLastObserverRemoved() { }
    }
    exports.BaseObservable = BaseObservable;
    function transaction(fn, getDebugName) {
        const tx = new TransactionImpl(fn, getDebugName);
        try {
            fn(tx);
        }
        finally {
            tx.finish();
        }
    }
    exports.transaction = transaction;
    function subtransaction(tx, fn, getDebugName) {
        if (!tx) {
            transaction(fn, getDebugName);
        }
        else {
            fn(tx);
        }
    }
    exports.subtransaction = subtransaction;
    class TransactionImpl {
        constructor(_fn, _getDebugName) {
            this._fn = _fn;
            this._getDebugName = _getDebugName;
            this.updatingObservers = [];
            (0, logging_1.getLogger)()?.handleBeginTransaction(this);
        }
        getDebugName() {
            if (this._getDebugName) {
                return this._getDebugName();
            }
            return getFunctionName(this._fn);
        }
        updateObserver(observer, observable) {
            this.updatingObservers.push({ observer, observable });
            observer.beginUpdate(observable);
        }
        finish() {
            const updatingObservers = this.updatingObservers;
            // Prevent anyone from updating observers from now on.
            this.updatingObservers = null;
            for (const { observer, observable } of updatingObservers) {
                observer.endUpdate(observable);
            }
            (0, logging_1.getLogger)()?.handleEndTransaction();
        }
    }
    exports.TransactionImpl = TransactionImpl;
    function getDebugName(debugNameFn, fn, owner, self) {
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
            result = getFunctionName(fn);
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
    exports.getDebugName = getDebugName;
    function getFunctionName(fn) {
        const fnSrc = fn.toString();
        // Pattern: /** @description ... */
        const regexp = /\/\*\*\s*@description\s*([^*]*)\*\//;
        const match = regexp.exec(fnSrc);
        const result = match ? match[1] : undefined;
        return result?.trim();
    }
    exports.getFunctionName = getFunctionName;
    function observableValue(nameOrOwner, initialValue) {
        if (typeof nameOrOwner === 'string') {
            return new ObservableValue(undefined, nameOrOwner, initialValue);
        }
        else {
            return new ObservableValue(nameOrOwner, undefined, initialValue);
        }
    }
    exports.observableValue = observableValue;
    class ObservableValue extends BaseObservable {
        get debugName() {
            return getDebugName(this._debugName, undefined, this._owner, this) ?? 'ObservableValue';
        }
        constructor(_owner, _debugName, initialValue) {
            super();
            this._owner = _owner;
            this._debugName = _debugName;
            this._value = initialValue;
        }
        get() {
            return this._value;
        }
        set(value, tx, change) {
            if (this._value === value) {
                return;
            }
            let _tx;
            if (!tx) {
                tx = _tx = new TransactionImpl(() => { }, () => `Setting ${this.debugName}`);
            }
            try {
                const oldValue = this._value;
                this._setValue(value);
                (0, logging_1.getLogger)()?.handleObservableChanged(this, { oldValue, newValue: value, change, didChange: true, hadValue: true });
                for (const observer of this.observers) {
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
            return `${this.debugName}: ${this._value}`;
        }
        _setValue(newValue) {
            this._value = newValue;
        }
    }
    exports.ObservableValue = ObservableValue;
    function disposableObservableValue(nameOrOwner, initialValue) {
        if (typeof nameOrOwner === 'string') {
            return new DisposableObservableValue(undefined, nameOrOwner, initialValue);
        }
        else {
            return new DisposableObservableValue(nameOrOwner, undefined, initialValue);
        }
    }
    exports.disposableObservableValue = disposableObservableValue;
    class DisposableObservableValue extends ObservableValue {
        _setValue(newValue) {
            if (this._value === newValue) {
                return;
            }
            if (this._value) {
                this._value.dispose();
            }
            this._value = newValue;
        }
        dispose() {
            this._value?.dispose();
        }
    }
    exports.DisposableObservableValue = DisposableObservableValue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL29ic2VydmFibGVJbnRlcm5hbC9iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXNJaEcsSUFBSSxRQUE0QixDQUFDO0lBQ2pDOzs7TUFHRTtJQUNGLFNBQWdCLGVBQWUsQ0FBQyxPQUF3QjtRQUN2RCxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBQ3BCLENBQUM7SUFGRCwwQ0FFQztJQUVELE1BQXNCLG9CQUFvQjtRQUN6QyxJQUFJLE9BQU8sS0FBYyxPQUFPLElBQUssQ0FBQyxDQUFDLENBQUM7UUFJakMsYUFBYTtZQUNuQixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDWixDQUFDO1FBS0QsY0FBYztRQUNQLElBQUksQ0FBQyxNQUEyQjtZQUN0QyxJQUFJLE1BQU0sRUFBRTtnQkFDWCxPQUFPLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbkM7aUJBQU07Z0JBQ04sT0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDbEI7UUFDRixDQUFDO1FBS00sR0FBRyxDQUFPLFNBQXlELEVBQUUsYUFBbUQ7WUFDOUgsTUFBTSxLQUFLLEdBQUcsYUFBYSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFtQixDQUFDO1lBQzVFLE1BQU0sRUFBRSxHQUFHLGFBQWEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQWdELENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQztZQUUxRyxPQUFPLFFBQVEsQ0FDZDtnQkFDQyxLQUFLO2dCQUNMLFNBQVMsRUFBRSxHQUFHLEVBQUU7b0JBQ2YsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNqQyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7d0JBQ3ZC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