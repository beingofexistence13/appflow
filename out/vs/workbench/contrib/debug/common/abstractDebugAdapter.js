/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/async", "vs/nls"], function (require, exports, event_1, async_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractDebugAdapter = void 0;
    /**
     * Abstract implementation of the low level API for a debug adapter.
     * Missing is how this API communicates with the debug adapter.
     */
    class AbstractDebugAdapter {
        constructor() {
            this.pendingRequests = new Map();
            this.queue = [];
            this._onError = new event_1.Emitter();
            this._onExit = new event_1.Emitter();
            this.sequence = 1;
        }
        get onError() {
            return this._onError.event;
        }
        get onExit() {
            return this._onExit.event;
        }
        onMessage(callback) {
            if (this.messageCallback) {
                this._onError.fire(new Error(`attempt to set more than one 'Message' callback`));
            }
            this.messageCallback = callback;
        }
        onEvent(callback) {
            if (this.eventCallback) {
                this._onError.fire(new Error(`attempt to set more than one 'Event' callback`));
            }
            this.eventCallback = callback;
        }
        onRequest(callback) {
            if (this.requestCallback) {
                this._onError.fire(new Error(`attempt to set more than one 'Request' callback`));
            }
            this.requestCallback = callback;
        }
        sendResponse(response) {
            if (response.seq > 0) {
                this._onError.fire(new Error(`attempt to send more than one response for command ${response.command}`));
            }
            else {
                this.internalSend('response', response);
            }
        }
        sendRequest(command, args, clb, timeout) {
            const request = {
                command: command
            };
            if (args && Object.keys(args).length > 0) {
                request.arguments = args;
            }
            this.internalSend('request', request);
            if (typeof timeout === 'number') {
                const timer = setTimeout(() => {
                    clearTimeout(timer);
                    const clb = this.pendingRequests.get(request.seq);
                    if (clb) {
                        this.pendingRequests.delete(request.seq);
                        const err = {
                            type: 'response',
                            seq: 0,
                            request_seq: request.seq,
                            success: false,
                            command,
                            message: (0, nls_1.localize)('timeout', "Timeout after {0} ms for '{1}'", timeout, command)
                        };
                        clb(err);
                    }
                }, timeout);
            }
            if (clb) {
                // store callback for this request
                this.pendingRequests.set(request.seq, clb);
            }
            return request.seq;
        }
        acceptMessage(message) {
            if (this.messageCallback) {
                this.messageCallback(message);
            }
            else {
                this.queue.push(message);
                if (this.queue.length === 1) {
                    // first item = need to start processing loop
                    this.processQueue();
                }
            }
        }
        /**
         * Returns whether we should insert a timeout between processing messageA
         * and messageB. Artificially queueing protocol messages guarantees that any
         * microtasks for previous message finish before next message is processed.
         * This is essential ordering when using promises anywhere along the call path.
         *
         * For example, take the following, where `chooseAndSendGreeting` returns
         * a person name and then emits a greeting event:
         *
         * ```
         * let person: string;
         * adapter.onGreeting(() => console.log('hello', person));
         * person = await adapter.chooseAndSendGreeting();
         * ```
         *
         * Because the event is dispatched synchronously, it may fire before person
         * is assigned if they're processed in the same task. Inserting a task
         * boundary avoids this issue.
         */
        needsTaskBoundaryBetween(messageA, messageB) {
            return messageA.type !== 'event' || messageB.type !== 'event';
        }
        /**
         * Reads and dispatches items from the queue until it is empty.
         */
        async processQueue() {
            let message;
            while (this.queue.length) {
                if (!message || this.needsTaskBoundaryBetween(this.queue[0], message)) {
                    await (0, async_1.timeout)(0);
                }
                message = this.queue.shift();
                if (!message) {
                    return; // may have been disposed of
                }
                switch (message.type) {
                    case 'event':
                        this.eventCallback?.(message);
                        break;
                    case 'request':
                        this.requestCallback?.(message);
                        break;
                    case 'response': {
                        const response = message;
                        const clb = this.pendingRequests.get(response.request_seq);
                        if (clb) {
                            this.pendingRequests.delete(response.request_seq);
                            clb(response);
                        }
                        break;
                    }
                }
            }
        }
        internalSend(typ, message) {
            message.type = typ;
            message.seq = this.sequence++;
            this.sendMessage(message);
        }
        async cancelPendingRequests() {
            if (this.pendingRequests.size === 0) {
                return Promise.resolve();
            }
            const pending = new Map();
            this.pendingRequests.forEach((value, key) => pending.set(key, value));
            await (0, async_1.timeout)(500);
            pending.forEach((callback, request_seq) => {
                const err = {
                    type: 'response',
                    seq: 0,
                    request_seq,
                    success: false,
                    command: 'canceled',
                    message: 'canceled'
                };
                callback(err);
                this.pendingRequests.delete(request_seq);
            });
        }
        getPendingRequestIds() {
            return Array.from(this.pendingRequests.keys());
        }
        dispose() {
            this.queue = [];
        }
    }
    exports.AbstractDebugAdapter = AbstractDebugAdapter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3REZWJ1Z0FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9jb21tb24vYWJzdHJhY3REZWJ1Z0FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHOzs7T0FHRztJQUNILE1BQXNCLG9CQUFvQjtRQVV6QztZQVJRLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQStDLENBQUM7WUFJekUsVUFBSyxHQUFvQyxFQUFFLENBQUM7WUFDakMsYUFBUSxHQUFHLElBQUksZUFBTyxFQUFTLENBQUM7WUFDaEMsWUFBTyxHQUFHLElBQUksZUFBTyxFQUFpQixDQUFDO1lBR3pELElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLENBQUM7UUFRRCxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQzVCLENBQUM7UUFFRCxJQUFJLE1BQU07WUFDVCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQzNCLENBQUM7UUFFRCxTQUFTLENBQUMsUUFBMEQ7WUFDbkUsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDLENBQUM7YUFDakY7WUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQztRQUNqQyxDQUFDO1FBRUQsT0FBTyxDQUFDLFFBQThDO1lBQ3JELElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FBQyxDQUFDO2FBQy9FO1lBQ0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENB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