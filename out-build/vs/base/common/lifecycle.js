/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/collections", "vs/base/common/functional", "vs/base/common/iterator"], function (require, exports, arrays_1, collections_1, functional_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sc = exports.$rc = exports.$qc = exports.$pc = exports.$oc = exports.$nc = exports.$mc = exports.$lc = exports.$kc = exports.$jc = exports.$ic = exports.$hc = exports.$gc = exports.$fc = exports.$ec = exports.$dc = exports.$cc = exports.$bc = exports.$ac = exports.$_b = void 0;
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
    class $_b {
        constructor() {
            this.b = new Map();
        }
        static { this.a = 0; }
        c(d) {
            let val = this.b.get(d);
            if (!val) {
                val = { parent: null, source: null, isSingleton: false, value: d, idx: $_b.a++ };
                this.b.set(d, val);
            }
            return val;
        }
        trackDisposable(d) {
            const data = this.c(d);
            if (!data.source) {
                data.source =
                    new Error().stack;
            }
        }
        setParent(child, parent) {
            const data = this.c(child);
            data.parent = parent;
        }
        markAsDisposed(x) {
            this.b.delete(x);
        }
        markAsSingleton(disposable) {
            this.c(disposable).isSingleton = true;
        }
        f(data, cache) {
            const cacheValue = cache.get(data);
            if (cacheValue) {
                return cacheValue;
            }
            const result = data.parent ? this.f(this.c(data.parent), cache) : data;
            cache.set(data, result);
            return result;
        }
        getTrackedDisposables() {
            const rootParentCache = new Map();
            const leaking = [...this.b.entries()]
                .filter(([, v]) => v.source !== null && !this.f(v, rootParentCache).isSingleton)
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
                const leakingObjects = [...this.b.values()]
                    .filter((info) => info.source !== null && !this.f(info, rootParentCache).isSingleton);
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
            const stackTraceStarts = new collections_1.$L();
            for (const leaking of uncoveredLeakingObjs) {
                const stackTracePath = getStackTracePath(leaking);
                for (let i = 0; i <= stackTracePath.length; i++) {
                    stackTraceStarts.add(stackTracePath.slice(0, i).join('\n'), leaking);
                }
            }
            // Put earlier leaks first
            uncoveredLeakingObjs.sort((0, arrays_1.$5b)(l => l.idx, arrays_1.$7b));
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
                    const continuations = (0, collections_1.$I)([...prevStarts].map(d => getStackTracePath(d)[i]), v => v);
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
    exports.$_b = $_b;
    function $ac(tracker) {
        disposableTracker = tracker;
    }
    exports.$ac = $ac;
    if (TRACK_DISPOSABLES) {
        const __is_disposable_tracked__ = '__is_disposable_tracked__';
        $ac(new class {
            trackDisposable(x) {
                const stack = new Error('Potentially leaked disposable').stack;
                setTimeout(() => {
                    if (!x[__is_disposable_tracked__]) {
                        console.log(stack);
                    }
                }, 3000);
            }
            setParent(child, parent) {
                if (child && child !== $kc.None) {
                    try {
                        child[__is_disposable_tracked__] = true;
                    }
                    catch {
                        // noop
                    }
                }
            }
            markAsDisposed(disposable) {
                if (disposable && disposable !== $kc.None) {
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
    function $bc(x) {
        disposableTracker?.trackDisposable(x);
        return x;
    }
    exports.$bc = $bc;
    function $cc(disposable) {
        disposableTracker?.markAsDisposed(disposable);
    }
    exports.$cc = $cc;
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
    function $dc(singleton) {
        disposableTracker?.markAsSingleton(singleton);
        return singleton;
    }
    exports.$dc = $dc;
    /**
     * Check if `thing` is {@link IDisposable disposable}.
     */
    function $ec(thing) {
        return typeof thing.dispose === 'function' && thing.dispose.length === 0;
    }
    exports.$ec = $ec;
    function $fc(arg) {
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
    exports.$fc = $fc;
    function $gc(disposables) {
        for (const d of disposables) {
            if ($ec(d)) {
                d.dispose();
            }
        }
        return [];
    }
    exports.$gc = $gc;
    /**
     * Combine multiple disposable values into a single {@link IDisposable}.
     */
    function $hc(...disposables) {
        const parent = $ic(() => $fc(disposables));
        setParentOfDisposables(disposables, parent);
        return parent;
    }
    exports.$hc = $hc;
    /**
     * Turn a function that implements dispose into an {@link IDisposable}.
     *
     * @param fn Clean up function, guaranteed to be called only **once**.
     */
    function $ic(fn) {
        const self = $bc({
            dispose: (0, functional_1.$bb)(() => {
                $cc(self);
                fn();
            })
        });
        return self;
    }
    exports.$ic = $ic;
    /**
     * Manages a collection of disposable values.
     *
     * This is the preferred way to manage multiple disposables. A `DisposableStore` is safer to work with than an
     * `IDisposable[]` as it considers edge cases, such as registering the same value multiple times or adding an item to a
     * store that has already been disposed of.
     */
    class $jc {
        static { this.DISABLE_DISPOSED_WARNING = false; }
        constructor() {
            this.f = new Set();
            this.g = false;
            $bc(this);
        }
        /**
         * Dispose of all registered disposables and mark this object as disposed.
         *
         * Any future disposables added to this object will be disposed of on `add`.
         */
        dispose() {
            if (this.g) {
                return;
            }
            $cc(this);
            this.g = true;
            this.clear();
        }
        /**
         * @return `true` if this object has been disposed of.
         */
        get isDisposed() {
            return this.g;
        }
        /**
         * Dispose of all registered disposables but do not mark this object as disposed.
         */
        clear() {
            if (this.f.size === 0) {
                return;
            }
            try {
                $fc(this.f);
            }
            finally {
                this.f.clear();
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
            if (this.g) {
                if (!$jc.DISABLE_DISPOSED_WARNING) {
                    console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
                }
            }
            else {
                this.f.add(o);
            }
            return o;
        }
    }
    exports.$jc = $jc;
    /**
     * Abstract base class for a {@link IDisposable disposable} object.
     *
     * Subclasses can {@linkcode B} disposables that will be automatically cleaned up when this object is disposed of.
     */
    class $kc {
        /**
         * A disposable that does nothing when it is disposed of.
         *
         * TODO: This should not be a static property.
         */
        static { this.None = Object.freeze({ dispose() { } }); }
        constructor() {
            this.q = new $jc();
            $bc(this);
            setParentOfDisposable(this.q, this);
        }
        dispose() {
            $cc(this);
            this.q.dispose();
        }
        /**
         * Adds `o` to the collection of disposables managed by this object.
         */
        B(o) {
            if (o === this) {
                throw new Error('Cannot register a disposable on itself!');
            }
            return this.q.add(o);
        }
    }
    exports.$kc = $kc;
    /**
     * Manages the lifecycle of a disposable value that may be changed.
     *
     * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
     * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
     */
    class $lc {
        constructor() {
            this.b = false;
            $bc(this);
        }
        get value() {
            return this.b ? undefined : this.a;
        }
        set value(value) {
            if (this.b || value === this.a) {
                return;
            }
            this.a?.dispose();
            if (value) {
                setParentOfDisposable(value, this);
            }
            this.a = value;
        }
        /**
         * Resets the stored value and disposed of the previously stored value.
         */
        clear() {
            this.value = undefined;
        }
        dispose() {
            this.b = true;
            $cc(this);
            this.a?.dispose();
            this.a = undefined;
        }
        /**
         * Clears the value, but does not dispose it.
         * The old value is returned.
        */
        clearAndLeak() {
            const oldValue = this.a;
            this.a = undefined;
            if (oldValue) {
                setParentOfDisposable(oldValue, null);
            }
            return oldValue;
        }
    }
    exports.$lc = $lc;
    class $mc {
        constructor(b) {
            this.b = b;
            this.a = 1;
        }
        acquire() {
            this.a++;
            return this;
        }
        release() {
            if (--this.a === 0) {
                this.b.dispose();
            }
            return this;
        }
    }
    exports.$mc = $mc;
    /**
     * A safe disposable can be `unset` so that a leaked reference (listener)
     * can be cut-off.
     */
    class $nc {
        constructor() {
            this.dispose = () => { };
            this.unset = () => { };
            this.isset = () => false;
            $bc(this);
        }
        set(fn) {
            let callback = fn;
            this.unset = () => callback = undefined;
            this.isset = () => callback !== undefined;
            this.dispose = () => {
                if (callback) {
                    callback();
                    callback = undefined;
                    $cc(this);
                }
            };
            return this;
        }
    }
    exports.$nc = $nc;
    class $oc {
        constructor() {
            this.a = new Map();
        }
        acquire(key, ...args) {
            let reference = this.a.get(key);
            if (!reference) {
                reference = { counter: 0, object: this.b(key, ...args) };
                this.a.set(key, reference);
            }
            const { object } = reference;
            const dispose = (0, functional_1.$bb)(() => {
                if (--reference.counter === 0) {
                    this.c(key, reference.object);
                    this.a.delete(key);
                }
            });
            reference.counter++;
            return { object, dispose };
        }
    }
    exports.$oc = $oc;
    /**
     * Unwraps a reference collection of promised values. Makes sure
     * references are disposed whenever promises get rejected.
     */
    class $pc {
        constructor(a) {
            this.a = a;
        }
        async acquire(key, ...args) {
            const ref = this.a.acquire(key, ...args);
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
    exports.$pc = $pc;
    class $qc {
        constructor(object) {
            this.object = object;
        }
        dispose() { }
    }
    exports.$qc = $qc;
    function $rc(fn) {
        const store = new $jc();
        try {
            fn(store);
        }
        finally {
            store.dispose();
        }
    }
    exports.$rc = $rc;
    /**
     * A map the manages the lifecycle of the values that it stores.
     */
    class $sc {
        constructor() {
            this.a = new Map();
            this.b = false;
            $bc(this);
        }
        /**
         * Disposes of all stored values and mark this object as disposed.
         *
         * Trying to use this object after it has been disposed of is an error.
         */
        dispose() {
            $cc(this);
            this.b = true;
            this.clearAndDisposeAll();
        }
        /**
         * Disposes of all stored values and clear the map, but DO NOT mark this object as disposed.
         */
        clearAndDisposeAll() {
            if (!this.a.size) {
                return;
            }
            try {
                $fc(this.a.values());
            }
            finally {
                this.a.clear();
            }
        }
        has(key) {
            return this.a.has(key);
        }
        get size() {
            return this.a.size;
        }
        get(key) {
            return this.a.get(key);
        }
        set(key, value, skipDisposeOnOverwrite = false) {
            if (this.b) {
                console.warn(new Error('Trying to add a disposable to a DisposableMap that has already been disposed of. The added object will be leaked!').stack);
            }
            if (!skipDisposeOnOverwrite) {
                this.a.get(key)?.dispose();
            }
            this.a.set(key, value);
        }
        /**
         * Delete the value stored for `key` from this map and also dispose of it.
         */
        deleteAndDispose(key) {
            this.a.get(key)?.dispose();
            this.a.delete(key);
        }
        [Symbol.iterator]() {
            return this.a[Symbol.iterator]();
        }
    }
    exports.$sc = $sc;
});
//# sourceMappingURL=lifecycle.js.map