/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/collections", "vs/base/common/functional", "vs/base/common/iterator"], function (require, exports, arrays_1, collections_1, functional_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DisposableMap = exports.disposeOnReturn = exports.ImmortalReference = exports.AsyncReferenceCollection = exports.ReferenceCollection = exports.SafeDisposable = exports.RefCountedDisposable = exports.MutableDisposable = exports.Disposable = exports.DisposableStore = exports.toDisposable = exports.combinedDisposable = exports.disposeIfDisposable = exports.dispose = exports.isDisposable = exports.markAsSingleton = exports.markAsDisposed = exports.trackDisposable = exports.setDisposableTracker = exports.DisposableTracker = void 0;
    // #region Disposable Tracking
    /**
     * Enables logging of potentially leaked disposables.
     *
     * A disposable is considered leaked if it is not disposed or not registered as the child of
     * another disposable. This tracking is very simple an only works for classes that either
     * extend Disposable or use a DisposableStore. This means there are a lot of false positives.
     */
    const TRACK_DISPOSABLES = false;
    let disposableTracker = null;
    class DisposableTracker {
        constructor() {
            this.livingDisposables = new Map();
        }
        static { this.idx = 0; }
        getDisposableData(d) {
            let val = this.livingDisposables.get(d);
            if (!val) {
                val = { parent: null, source: null, isSingleton: false, value: d, idx: DisposableTracker.idx++ };
                this.livingDisposables.set(d, val);
            }
            return val;
        }
        trackDisposable(d) {
            const data = this.getDisposableData(d);
            if (!data.source) {
                data.source =
                    new Error().stack;
            }
        }
        setParent(child, parent) {
            const data = this.getDisposableData(child);
            data.parent = parent;
        }
        markAsDisposed(x) {
            this.livingDisposables.delete(x);
        }
        markAsSingleton(disposable) {
            this.getDisposableData(disposable).isSingleton = true;
        }
        getRootParent(data, cache) {
            const cacheValue = cache.get(data);
            if (cacheValue) {
                return cacheValue;
            }
            const result = data.parent ? this.getRootParent(this.getDisposableData(data.parent), cache) : data;
            cache.set(data, result);
            return result;
        }
        getTrackedDisposables() {
            const rootParentCache = new Map();
            const leaking = [...this.livingDisposables.entries()]
                .filter(([, v]) => v.source !== null && !this.getRootParent(v, rootParentCache).isSingleton)
                .map(([k]) => k)
                .flat();
            return leaking;
        }
        computeLeakingDisposables(maxReported = 10, preComputedLeaks) {
            let uncoveredLeakingObjs;
            if (preComputedLeaks) {
                uncoveredLeakingObjs = preComputedLeaks;
            }
            else {
                const rootParentCache = new Map();
                const leakingObjects = [...this.livingDisposables.values()]
                    .filter((info) => info.source !== null && !this.getRootParent(info, rootParentCache).isSingleton);
                if (leakingObjects.length === 0) {
                    return;
                }
                const leakingObjsSet = new Set(leakingObjects.map(o => o.value));
                // Remove all objects that are a child of other leaking objects. Assumes there are no cycles.
                uncoveredLeakingObjs = leakingObjects.filter(l => {
                    return !(l.parent && leakingObjsSet.has(l.parent));
                });
                if (uncoveredLeakingObjs.length === 0) {
                    throw new Error('There are cyclic diposable chains!');
                }
            }
            if (!uncoveredLeakingObjs) {
                return undefined;
            }
            function getStackTracePath(leaking) {
                function removePrefix(array, linesToRemove) {
                    while (array.length > 0 && linesToRemove.some(regexp => typeof regexp === 'string' ? regexp === array[0] : array[0].match(regexp))) {
                        array.shift();
                    }
                }
                const lines = leaking.source.split('\n').map(p => p.trim().replace('at ', '')).filter(l => l !== '');
                removePrefix(lines, ['Error', /^trackDisposable \(.*\)$/, /^DisposableTracker.trackDisposable \(.*\)$/]);
                return lines.reverse();
            }
            const stackTraceStarts = new collections_1.SetMap();
            for (const leaking of uncoveredLeakingObjs) {
                const stackTracePath = getStackTracePath(leaking);
                for (let i = 0; i <= stackTracePath.length; i++) {
                    stackTraceStarts.add(stackTracePath.slice(0, i).join('\n'), leaking);
                }
            }
            // Put earlier leaks first
            uncoveredLeakingObjs.sort((0, arrays_1.compareBy)(l => l.idx, arrays_1.numberComparator));
            let message = '';
            let i = 0;
            for (const leaking of uncoveredLeakingObjs.slice(0, maxReported)) {
                i++;
                const stackTracePath = getStackTracePath(leaking);
                const stackTraceFormattedLines = [];
                for (let i = 0; i < stackTracePath.length; i++) {
                    let line = stackTracePath[i];
                    const starts = stackTraceStarts.get(stackTracePath.slice(0, i + 1).join('\n'));
                    line = `(shared with ${starts.size}/${uncoveredLeakingObjs.length} leaks) at ${line}`;
                    const prevStarts = stackTraceStarts.get(stackTracePath.slice(0, i).join('\n'));
                    const continuations = (0, collections_1.groupBy)([...prevStarts].map(d => getStackTracePath(d)[i]), v => v);
                    delete continuations[stackTracePath[i]];
                    for (const [cont, set] of Object.entries(continuations)) {
                        stackTraceFormattedLines.unshift(`    - stacktraces of ${set.length} other leaks continue with ${cont}`);
                    }
                    stackTraceFormattedLines.unshift(line);
                }
                message += `\n\n\n==================== Leaking disposable ${i}/${uncoveredLeakingObjs.length}: ${leaking.value.constructor.name} ====================\n${stackTraceFormattedLines.join('\n')}\n============================================================\n\n`;
            }
            if (uncoveredLeakingObjs.length > maxReported) {
                message += `\n\n\n... and ${uncoveredLeakingObjs.length - maxReported} more leaking disposables\n\n`;
            }
            return { leaks: uncoveredLeakingObjs, details: message };
        }
    }
    exports.DisposableTracker = DisposableTracker;
    function setDisposableTracker(tracker) {
        disposableTracker = tracker;
    }
    exports.setDisposableTracker = setDisposableTracker;
    if (TRACK_DISPOSABLES) {
        const __is_disposable_tracked__ = '__is_disposable_tracked__';
        setDisposableTracker(new class {
            trackDisposable(x) {
                const stack = new Error('Potentially leaked disposable').stack;
                setTimeout(() => {
                    if (!x[__is_disposable_tracked__]) {
                        console.log(stack);
                    }
                }, 3000);
            }
            setParent(child, parent) {
                if (child && child !== Disposable.None) {
                    try {
                        child[__is_disposable_tracked__] = true;
                    }
                    catch {
                        // noop
                    }
                }
            }
            markAsDisposed(disposable) {
                if (disposable && disposable !== Disposable.None) {
                    try {
                        disposable[__is_disposable_tracked__] = true;
                    }
                    catch {
                        // noop
                    }
                }
            }
            markAsSingleton(disposable) { }
        });
    }
    function trackDisposable(x) {
        disposableTracker?.trackDisposable(x);
        return x;
    }
    exports.trackDisposable = trackDisposable;
    function markAsDisposed(disposable) {
        disposableTracker?.markAsDisposed(disposable);
    }
    exports.markAsDisposed = markAsDisposed;
    function setParentOfDisposable(child, parent) {
        disposableTracker?.setParent(child, parent);
    }
    function setParentOfDisposables(children, parent) {
        if (!disposableTracker) {
            return;
        }
        for (const child of children) {
            disposableTracker.setParent(child, parent);
        }
    }
    /**
     * Indicates that the given object is a singleton which does not need to be disposed.
    */
    function markAsSingleton(singleton) {
        disposableTracker?.markAsSingleton(singleton);
        return singleton;
    }
    exports.markAsSingleton = markAsSingleton;
    /**
     * Check if `thing` is {@link IDisposable disposable}.
     */
    function isDisposable(thing) {
        return typeof thing.dispose === 'function' && thing.dispose.length === 0;
    }
    exports.isDisposable = isDisposable;
    function dispose(arg) {
        if (iterator_1.Iterable.is(arg)) {
            const errors = [];
            for (const d of arg) {
                if (d) {
                    try {
                        d.dispose();
                    }
                    catch (e) {
                        errors.push(e);
                    }
                }
            }
            if (errors.length === 1) {
                throw errors[0];
            }
            else if (errors.length > 1) {
                throw new AggregateError(errors, 'Encountered errors while disposing of store');
            }
            return Array.isArray(arg) ? [] : arg;
        }
        else if (arg) {
            arg.dispose();
            return arg;
        }
    }
    exports.dispose = dispose;
    function disposeIfDisposable(disposables) {
        for (const d of disposables) {
            if (isDisposable(d)) {
                d.dispose();
            }
        }
        return [];
    }
    exports.disposeIfDisposable = disposeIfDisposable;
    /**
     * Combine multiple disposable values into a single {@link IDisposable}.
     */
    function combinedDisposable(...disposables) {
        const parent = toDisposable(() => dispose(disposables));
        setParentOfDisposables(disposables, parent);
        return parent;
    }
    exports.combinedDisposable = combinedDisposable;
    /**
     * Turn a function that implements dispose into an {@link IDisposable}.
     *
     * @param fn Clean up function, guaranteed to be called only **once**.
     */
    function toDisposable(fn) {
        const self = trackDisposable({
            dispose: (0, functional_1.once)(() => {
                markAsDisposed(self);
                fn();
            })
        });
        return self;
    }
    exports.toDisposable = toDisposable;
    /**
     * Manages a collection of disposable values.
     *
     * This is the preferred way to manage multiple disposables. A `DisposableStore` is safer to work with than an
     * `IDisposable[]` as it considers edge cases, such as registering the same value multiple times or adding an item to a
     * store that has already been disposed of.
     */
    class DisposableStore {
        static { this.DISABLE_DISPOSED_WARNING = false; }
        constructor() {
            this._toDispose = new Set();
            this._isDisposed = false;
            trackDisposable(this);
        }
        /**
         * Dispose of all registered disposables and mark this object as disposed.
         *
         * Any future disposables added to this object will be disposed of on `add`.
         */
        dispose() {
            if (this._isDisposed) {
                return;
            }
            markAsDisposed(this);
            this._isDisposed = true;
            this.clear();
        }
        /**
         * @return `true` if this object has been disposed of.
         */
        get isDisposed() {
            return this._isDisposed;
        }
        /**
         * Dispose of all registered disposables but do not mark this object as disposed.
         */
        clear() {
            if (this._toDispose.size === 0) {
                return;
            }
            try {
                dispose(this._toDispose);
            }
            finally {
                this._toDispose.clear();
            }
        }
        /**
         * Add a new {@link IDisposable disposable} to the collection.
         */
        add(o) {
            if (!o) {
                return o;
            }
            if (o === this) {
                throw new Error('Cannot register a disposable on itself!');
            }
            setParentOfDisposable(o, this);
            if (this._isDisposed) {
                if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
                    console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
                }
            }
            else {
                this._toDispose.add(o);
            }
            return o;
        }
    }
    exports.DisposableStore = DisposableStore;
    /**
     * Abstract base class for a {@link IDisposable disposable} object.
     *
     * Subclasses can {@linkcode _register} disposables that will be automatically cleaned up when this object is disposed of.
     */
    class Disposable {
        /**
         * A disposable that does nothing when it is disposed of.
         *
         * TODO: This should not be a static property.
         */
        static { this.None = Object.freeze({ dispose() { } }); }
        constructor() {
            this._store = new DisposableStore();
            trackDisposable(this);
            setParentOfDisposable(this._store, this);
        }
        dispose() {
            markAsDisposed(this);
            this._store.dispose();
        }
        /**
         * Adds `o` to the collection of disposables managed by this object.
         */
        _register(o) {
            if (o === this) {
                throw new Error('Cannot register a disposable on itself!');
            }
            return this._store.add(o);
        }
    }
    exports.Disposable = Disposable;
    /**
     * Manages the lifecycle of a disposable value that may be changed.
     *
     * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
     * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
     */
    class MutableDisposable {
        constructor() {
            this._isDisposed = false;
            trackDisposable(this);
        }
        get value() {
            return this._isDisposed ? undefined : this._value;
        }
        set value(value) {
            if (this._isDisposed || value === this._value) {
                return;
            }
            this._value?.dispose();
            if (value) {
                setParentOfDisposable(value, this);
            }
            this._value = value;
        }
        /**
         * Resets the stored value and disposed of the previously stored value.
         */
        clear() {
            this.value = undefined;
        }
        dispose() {
            this._isDisposed = true;
            markAsDisposed(this);
            this._value?.dispose();
            this._value = undefined;
        }
        /**
         * Clears the value, but does not dispose it.
         * The old value is returned.
        */
        clearAndLeak() {
            const oldValue = this._value;
            this._value = undefined;
            if (oldValue) {
                setParentOfDisposable(oldValue, null);
            }
            return oldValue;
        }
    }
    exports.MutableDisposable = MutableDisposable;
    class RefCountedDisposable {
        constructor(_disposable) {
            this._disposable = _disposable;
            this._counter = 1;
        }
        acquire() {
            this._counter++;
            return this;
        }
        release() {
            if (--this._counter === 0) {
                this._disposable.dispose();
            }
            return this;
        }
    }
    exports.RefCountedDisposable = RefCountedDisposable;
    /**
     * A safe disposable can be `unset` so that a leaked reference (listener)
     * can be cut-off.
     */
    class SafeDisposable {
        constructor() {
            this.dispose = () => { };
            this.unset = () => { };
            this.isset = () => false;
            trackDisposable(this);
        }
        set(fn) {
            let callback = fn;
            this.unset = () => callback = undefined;
            this.isset = () => callback !== undefined;
            this.dispose = () => {
                if (callback) {
                    callback();
                    callback = undefined;
                    markAsDisposed(this);
                }
            };
            return this;
        }
    }
    exports.SafeDisposable = SafeDisposable;
    class ReferenceCollection {
        constructor() {
            this.references = new Map();
        }
        acquire(key, ...args) {
            let reference = this.references.get(key);
            if (!reference) {
                reference = { counter: 0, object: this.createReferencedObject(key, ...args) };
                this.references.set(key, reference);
            }
            const { object } = reference;
            const dispose = (0, functional_1.once)(() => {
                if (--reference.counter === 0) {
                    this.destroyReferencedObject(key, reference.object);
                    this.references.delete(key);
                }
            });
            reference.counter++;
            return { object, dispose };
        }
    }
    exports.ReferenceCollection = ReferenceCollection;
    /**
     * Unwraps a reference collection of promised values. Makes sure
     * references are disposed whenever promises get rejected.
     */
    class AsyncReferenceCollection {
        constructor(referenceCollection) {
            this.referenceCollection = referenceCollection;
        }
        async acquire(key, ...args) {
            const ref = this.referenceCollection.acquire(key, ...args);
            try {
                const object = await ref.object;
                return {
                    object,
                    dispose: () => ref.dispose()
                };
            }
            catch (error) {
                ref.dispose();
                throw error;
            }
        }
    }
    exports.AsyncReferenceCollection = AsyncReferenceCollection;
    class ImmortalReference {
        constructor(object) {
            this.object = object;
        }
        dispose() { }
    }
    exports.ImmortalReference = ImmortalReference;
    function disposeOnReturn(fn) {
        const store = new DisposableStore();
        try {
            fn(store);
        }
        finally {
            store.dispose();
        }
    }
    exports.disposeOnReturn = disposeOnReturn;
    /**
     * A map the manages the lifecycle of the values that it stores.
     */
    class DisposableMap {
        constructor() {
            this._store = new Map();
            this._isDisposed = false;
            trackDisposable(this);
        }
        /**
         * Disposes of all stored values and mark this object as disposed.
         *
         * Trying to use this object after it has been disposed of is an error.
         */
        dispose() {
            markAsDisposed(this);
            this._isDisposed = true;
            this.clearAndDisposeAll();
        }
        /**
         * Disposes of all stored values and clear the map, but DO NOT mark this object as disposed.
         */
        clearAndDisposeAll() {
            if (!this._store.size) {
                return;
            }
            try {
                dispose(this._store.values());
            }
            finally {
                this._store.clear();
            }
        }
        has(key) {
            return this._store.has(key);
        }
        get size() {
            return this._store.size;
        }
        get(key) {
            return this._store.get(key);
        }
        set(key, value, skipDisposeOnOverwrite = false) {
            if (this._isDisposed) {
                console.warn(new Error('Trying to add a disposable to a DisposableMap that has already been disposed of. The added object will be leaked!').stack);
            }
            if (!skipDisposeOnOverwrite) {
                this._store.get(key)?.dispose();
            }
            this._store.set(key, value);
        }
        /**
         * Delete the value stored for `key` from this map and also dispose of it.
         */
        deleteAndDispose(key) {
            this._store.get(key)?.dispose();
            this._store.delete(key);
        }
        [Symbol.iterator]() {
            return this._store[Symbol.iterator]();
        }
    }
    exports.DisposableMap = DisposableMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyw4QkFBOEI7SUFFOUI7Ozs7OztPQU1HO0lBQ0gsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUM7SUFDaEMsSUFBSSxpQkFBaUIsR0FBOEIsSUFBSSxDQUFDO0lBaUN4RCxNQUFhLGlCQUFpQjtRQUE5QjtZQUdrQixzQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBK0IsQ0FBQztRQTBJN0UsQ0FBQztpQkE1SWUsUUFBRyxHQUFHLENBQUMsQUFBSixDQUFLO1FBSWYsaUJBQWlCLENBQUMsQ0FBYztZQUN2QyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1QsR0FBRyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsaUJBQWlCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztnQkFDakcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDbkM7WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFRCxlQUFlLENBQUMsQ0FBYztZQUM3QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxNQUFNO29CQUNWLElBQUksS0FBSyxFQUFFLENBQUMsS0FBTSxDQUFDO2FB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