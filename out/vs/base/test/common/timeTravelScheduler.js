/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform"], function (require, exports, event_1, lifecycle_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.originalGlobalValues = exports.runWithFakedTimers = exports.AsyncSchedulerProcessor = exports.TimeTravelScheduler = void 0;
    class SimplePriorityQueue {
        constructor(items, compare) {
            this.compare = compare;
            this.isSorted = false;
            this.items = items;
        }
        get length() {
            return this.items.length;
        }
        add(value) {
            this.items.push(value);
            this.isSorted = false;
        }
        remove(value) {
            this.items.splice(this.items.indexOf(value), 1);
            this.isSorted = false;
        }
        removeMin() {
            this.ensureSorted();
            return this.items.shift();
        }
        getMin() {
            this.ensureSorted();
            return this.items[0];
        }
        toSortedArray() {
            this.ensureSorted();
            return [...this.items];
        }
        ensureSorted() {
            if (!this.isSorted) {
                this.items.sort(this.compare);
                this.isSorted = true;
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
    class TimeTravelScheduler {
        constructor() {
            this.taskCounter = 0;
            this._now = 0;
            this.queue = new SimplePriorityQueue([], compareScheduledTasks);
            this.taskScheduledEmitter = new event_1.Emitter();
            this.onTaskScheduled = this.taskScheduledEmitter.event;
        }
        schedule(task) {
            if (task.time < this._now) {
                throw new Error(`Scheduled time (${task.time}) must be equal to or greater than the current time (${this._now}).`);
            }
            const extendedTask = { ...task, id: this.taskCounter++ };
            this.queue.add(extendedTask);
            this.taskScheduledEmitter.fire({ task });
            return { dispose: () => this.queue.remove(extendedTask) };
        }
        get now() {
            return this._now;
        }
        get hasScheduledTasks() {
            return this.queue.length > 0;
        }
        getScheduledTasks() {
            return this.queue.toSortedArray();
        }
        runNext() {
            const task = this.queue.removeMin();
            if (task) {
                this._now = task.time;
                task.run();
            }
            return task;
        }
        installGlobally() {
            return overwriteGlobals(this);
        }
    }
    exports.TimeTravelScheduler = TimeTravelScheduler;
    class AsyncSchedulerProcessor extends lifecycle_1.Disposable {
        get history() { return this._history; }
        constructor(scheduler, options) {
            super();
            this.scheduler = scheduler;
            this.isProcessing = false;
            this._history = new Array();
            this.queueEmptyEmitter = new event_1.Emitter();
            this.onTaskQueueEmpty = this.queueEmptyEmitter.event;
            this.maxTaskCount = options && options.maxTaskCount ? options.maxTaskCount : 100;
            this.useSetImmediate = options && options.useSetImmediate ? options.useSetImmediate : false;
            this._register(scheduler.onTaskScheduled(() => {
                if (this.isProcessing) {
                    return;
                }
                else {
                    this.isProcessing = true;
                    this.schedule();
                }
            }));
        }
        schedule() {
            // This allows promises created by a previous task to settle and schedule tasks before the next task is run.
            // Tasks scheduled in those promises might have to run before the current next task.
            Promise.resolve().then(() => {
                if (this.useSetImmediate) {
                    exports.originalGlobalValues.setImmediate(() => this.process());
                }
                else if (platform_1.setTimeout0IsFaster) {
                    (0, platform_1.setTimeout0)(() => this.process());
                }
                else {
                    exports.originalGlobalValues.setTimeout(() => this.process());
                }
            });
        }
        process() {
            const executedTask = this.scheduler.runNext();
            if (executedTask) {
                this._history.push(executedTask);
                if (this.history.length >= this.maxTaskCount && this.scheduler.hasScheduledTasks) {
                    const lastTasks = this._history.slice(Math.max(0, this.history.length - 10)).map(h => `${h.source.toString()}: ${h.source.stackTrace}`);
                    const e = new Error(`Queue did not get empty after processing ${this.history.length} items. These are the last ${lastTasks.length} scheduled tasks:\n${lastTasks.join('\n\n\n')}`);
                    this.lastError = e;
                    throw e;
                }
            }
            if (this.scheduler.hasScheduledTasks) {
                this.schedule();
            }
            else {
                this.isProcessing = false;
                this.queueEmptyEmitter.fire();
            }
        }
        waitForEmptyQueue() {
            if (this.lastError) {
                const error = this.lastError;
                this.lastError = undefined;
                throw error;
            }
            if (!this.isProcessing) {
                return Promise.resolve();
            }
            else {
                return event_1.Event.toPromise(this.onTaskQueueEmpty).then(() => {
                    if (this.lastError) {
                        throw this.lastError;
                    }
                });
            }
        }
    }
    exports.AsyncSchedulerProcessor = AsyncSchedulerProcessor;
    async function runWithFakedTimers(options, fn) {
        const useFakeTimers = options.useFakeTimers === undefined ? true : options.useFakeTimers;
        if (!useFakeTimers) {
            return fn();
        }
        const scheduler = new TimeTravelScheduler();
        const schedulerProcessor = new AsyncSchedulerProcessor(scheduler, { useSetImmediate: options.useSetImmediate, maxTaskCount: options.maxTaskCount });
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
    exports.runWithFakedTimers = runWithFakedTimers;
    exports.originalGlobalValues = {
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
                exports.originalGlobalValues.clearTimeout(timeoutId);
            }
        };
        globalThis.setInterval = ((handler, timeout) => setInterval(scheduler, handler, timeout));
        globalThis.clearInterval = (timeoutId) => {
            if (typeof timeoutId === 'object' && timeoutId && 'dispose' in timeoutId) {
                timeoutId.dispose();
            }
            else {
                exports.originalGlobalValues.clearInterval(timeoutId);
            }
        };
        globalThis.Date = createDateClass(scheduler);
        return {
            dispose: () => {
                Object.assign(globalThis, exports.originalGlobalValues);
            }
        };
    }
    function createDateClass(scheduler) {
        const OriginalDate = exports.originalGlobalValues.Date;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZVRyYXZlbFNjaGVkdWxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvdGVzdC9jb21tb24vdGltZVRyYXZlbFNjaGVkdWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBTSxtQkFBbUI7UUFJeEIsWUFBWSxLQUFVLEVBQW1CLE9BQStCO1lBQS9CLFlBQU8sR0FBUCxPQUFPLENBQXdCO1lBSGhFLGFBQVEsR0FBRyxLQUFLLENBQUM7WUFJeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDcEIsQ0FBQztRQUVELElBQUksTUFBTTtZQUNULE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDMUIsQ0FBQztRQUVELEdBQUcsQ0FBQyxLQUFRO1lBQ1gsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdkIsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFRO1lBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdkIsQ0FBQztRQUVELFNBQVM7WUFDUixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDcEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFRCxNQUFNO1lBQ0wsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixDQUFDO1FBRUQsYUFBYTtZQUNaLElBQUksQ0FBQyxZ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