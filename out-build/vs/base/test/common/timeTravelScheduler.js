/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform"], function (require, exports, event_1, lifecycle_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lT = exports.$kT = exports.$jT = exports.$iT = void 0;
    class SimplePriorityQueue {
        constructor(items, f) {
            this.f = f;
            this.c = false;
            this.d = items;
        }
        get length() {
            return this.d.length;
        }
        add(value) {
            this.d.push(value);
            this.c = false;
        }
        remove(value) {
            this.d.splice(this.d.indexOf(value), 1);
            this.c = false;
        }
        removeMin() {
            this.g();
            return this.d.shift();
        }
        getMin() {
            this.g();
            return this.d[0];
        }
        toSortedArray() {
            this.g();
            return [...this.d];
        }
        g() {
            if (!this.c) {
                this.d.sort(this.f);
                this.c = true;
            }
        }
    }
    function compareScheduledTasks(a, b) {
        if (a.time !== b.time) {
            // Prefer lower time
            return a.time - b.time;
        }
        if (a.id !== b.id) {
            // Prefer lower id
            return a.id - b.id;
        }
        return 0;
    }
    class $iT {
        constructor() {
            this.c = 0;
            this.d = 0;
            this.f = new SimplePriorityQueue([], compareScheduledTasks);
            this.g = new event_1.$fd();
            this.onTaskScheduled = this.g.event;
        }
        schedule(task) {
            if (task.time < this.d) {
                throw new Error(`Scheduled time (${task.time}) must be equal to or greater than the current time (${this.d}).`);
            }
            const extendedTask = { ...task, id: this.c++ };
            this.f.add(extendedTask);
            this.g.fire({ task });
            return { dispose: () => this.f.remove(extendedTask) };
        }
        get now() {
            return this.d;
        }
        get hasScheduledTasks() {
            return this.f.length > 0;
        }
        getScheduledTasks() {
            return this.f.toSortedArray();
        }
        runNext() {
            const task = this.f.removeMin();
            if (task) {
                this.d = task.time;
                task.run();
            }
            return task;
        }
        installGlobally() {
            return overwriteGlobals(this);
        }
    }
    exports.$iT = $iT;
    class $jT extends lifecycle_1.$kc {
        get history() { return this.f; }
        constructor(r, options) {
            super();
            this.r = r;
            this.c = false;
            this.f = new Array();
            this.m = new event_1.$fd();
            this.onTaskQueueEmpty = this.m.event;
            this.g = options && options.maxTaskCount ? options.maxTaskCount : 100;
            this.j = options && options.useSetImmediate ? options.useSetImmediate : false;
            this.B(r.onTaskScheduled(() => {
                if (this.c) {
                    return;
                }
                else {
                    this.c = true;
                    this.s();
                }
            }));
        }
        s() {
            // This allows promises created by a previous task to settle and schedule tasks before the next task is run.
            // Tasks scheduled in those promises might have to run before the current next task.
            Promise.resolve().then(() => {
                if (this.j) {
                    exports.$lT.setImmediate(() => this.t());
                }
                else if (platform_1.$z) {
                    (0, platform_1.$A)(() => this.t());
                }
                else {
                    exports.$lT.setTimeout(() => this.t());
                }
            });
        }
        t() {
            const executedTask = this.r.runNext();
            if (executedTask) {
                this.f.push(executedTask);
                if (this.history.length >= this.g && this.r.hasScheduledTasks) {
                    const lastTasks = this.f.slice(Math.max(0, this.history.length - 10)).map(h => `${h.source.toString()}: ${h.source.stackTrace}`);
                    const e = new Error(`Queue did not get empty after processing ${this.history.length} items. These are the last ${lastTasks.length} scheduled tasks:\n${lastTasks.join('\n\n\n')}`);
                    this.n = e;
                    throw e;
                }
            }
            if (this.r.hasScheduledTasks) {
                this.s();
            }
            else {
                this.c = false;
                this.m.fire();
            }
        }
        waitForEmptyQueue() {
            if (this.n) {
                const error = this.n;
                this.n = undefined;
                throw error;
            }
            if (!this.c) {
                return Promise.resolve();
            }
            else {
                return event_1.Event.toPromise(this.onTaskQueueEmpty).then(() => {
                    if (this.n) {
                        throw this.n;
                    }
                });
            }
        }
    }
    exports.$jT = $jT;
    async function $kT(options, fn) {
        const useFakeTimers = options.useFakeTimers === undefined ? true : options.useFakeTimers;
        if (!useFakeTimers) {
            return fn();
        }
        const scheduler = new $iT();
        const schedulerProcessor = new $jT(scheduler, { useSetImmediate: options.useSetImmediate, maxTaskCount: options.maxTaskCount });
        const globalInstallDisposable = scheduler.installGlobally();
        let result;
        try {
            result = await fn();
        }
        finally {
            globalInstallDisposable.dispose();
            try {
                // We process the remaining scheduled tasks.
                // The global override is no longer active, so during this, no more tasks will be scheduled.
                await schedulerProcessor.waitForEmptyQueue();
            }
            finally {
                schedulerProcessor.dispose();
            }
        }
        return result;
    }
    exports.$kT = $kT;
    exports.$lT = {
        setTimeout: globalThis.setTimeout.bind(globalThis),
        clearTimeout: globalThis.clearTimeout.bind(globalThis),
        setInterval: globalThis.setInterval.bind(globalThis),
        clearInterval: globalThis.clearInterval.bind(globalThis),
        setImmediate: globalThis.setImmediate?.bind(globalThis),
        clearImmediate: globalThis.clearImmediate?.bind(globalThis),
        requestAnimationFrame: globalThis.requestAnimationFrame?.bind(globalThis),
        cancelAnimationFrame: globalThis.cancelAnimationFrame?.bind(globalThis),
        Date: globalThis.Date,
    };
    function setTimeout(scheduler, handler, timeout = 0) {
        if (typeof handler === 'string') {
            throw new Error('String handler args should not be used and are not supported');
        }
        return scheduler.schedule({
            time: scheduler.now + timeout,
            run: () => {
                handler();
            },
            source: {
                toString() { return 'setTimeout'; },
                stackTrace: new Error().stack,
            }
        });
    }
    function setInterval(scheduler, handler, interval) {
        if (typeof handler === 'string') {
            throw new Error('String handler args should not be used and are not supported');
        }
        const validatedHandler = handler;
        let iterCount = 0;
        const stackTrace = new Error().stack;
        let disposed = false;
        let lastDisposable;
        function schedule() {
            iterCount++;
            const curIter = iterCount;
            lastDisposable = scheduler.schedule({
                time: scheduler.now + interval,
                run() {
                    if (!disposed) {
                        schedule();
                        validatedHandler();
                    }
                },
                source: {
                    toString() { return `setInterval (iteration ${curIter})`; },
                    stackTrace,
                }
            });
        }
        schedule();
        return {
            dispose: () => {
                if (disposed) {
                    return;
                }
                disposed = true;
                lastDisposable.dispose();
            }
        };
    }
    function overwriteGlobals(scheduler) {
        globalThis.setTimeout = ((handler, timeout) => setTimeout(scheduler, handler, timeout));
        globalThis.clearTimeout = (timeoutId) => {
            if (typeof timeoutId === 'object' && timeoutId && 'dispose' in timeoutId) {
                timeoutId.dispose();
            }
            else {
                exports.$lT.clearTimeout(timeoutId);
            }
        };
        globalThis.setInterval = ((handler, timeout) => setInterval(scheduler, handler, timeout));
        globalThis.clearInterval = (timeoutId) => {
            if (typeof timeoutId === 'object' && timeoutId && 'dispose' in timeoutId) {
                timeoutId.dispose();
            }
            else {
                exports.$lT.clearInterval(timeoutId);
            }
        };
        globalThis.Date = createDateClass(scheduler);
        return {
            dispose: () => {
                Object.assign(globalThis, exports.$lT);
            }
        };
    }
    function createDateClass(scheduler) {
        const OriginalDate = exports.$lT.Date;
        function SchedulerDate(...args) {
            // the Date constructor called as a function, ref Ecma-262 Edition 5.1, section 15.9.2.
            // This remains so in the 10th edition of 2019 as well.
            if (!(this instanceof SchedulerDate)) {
                return new OriginalDate(scheduler.now).toString();
            }
            // if Date is called as a constructor with 'new' keyword
            if (args.length === 0) {
                return new OriginalDate(scheduler.now);
            }
            return new OriginalDate(...args);
        }
        for (const prop in OriginalDate) {
            if (OriginalDate.hasOwnProperty(prop)) {
                SchedulerDate[prop] = OriginalDate[prop];
            }
        }
        SchedulerDate.now = function now() {
            return scheduler.now;
        };
        SchedulerDate.toString = function toString() {
            return OriginalDate.toString();
        };
        SchedulerDate.prototype = OriginalDate.prototype;
        SchedulerDate.parse = OriginalDate.parse;
        SchedulerDate.UTC = OriginalDate.UTC;
        SchedulerDate.prototype.toUTCString = OriginalDate.prototype.toUTCString;
        return SchedulerDate;
    }
});
//# sourceMappingURL=timeTravelScheduler.js.map