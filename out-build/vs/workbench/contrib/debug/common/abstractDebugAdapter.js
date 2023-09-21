/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/async", "vs/nls!vs/workbench/contrib/debug/common/abstractDebugAdapter"], function (require, exports, event_1, async_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ecb = void 0;
    /**
     * Abstract implementation of the low level API for a debug adapter.
     * Missing is how this API communicates with the debug adapter.
     */
    class $Ecb {
        constructor() {
            this.f = new Map();
            this.k = [];
            this.m = new event_1.$fd();
            this.n = new event_1.$fd();
            this.d = 1;
        }
        get onError() {
            return this.m.event;
        }
        get onExit() {
            return this.n.event;
        }
        onMessage(callback) {
            if (this.j) {
                this.m.fire(new Error(`attempt to set more than one 'Message' callback`));
            }
            this.j = callback;
        }
        onEvent(callback) {
            if (this.i) {
                this.m.fire(new Error(`attempt to set more than one 'Event' callback`));
            }
            this.i = callback;
        }
        onRequest(callback) {
            if (this.g) {
                this.m.fire(new Error(`attempt to set more than one 'Request' callback`));
            }
            this.g = callback;
        }
        sendResponse(response) {
            if (response.seq > 0) {
                this.m.fire(new Error(`attempt to send more than one response for command ${response.command}`));
            }
            else {
                this.s('response', response);
            }
        }
        sendRequest(command, args, clb, timeout) {
            const request = {
                command: command
            };
            if (args && Object.keys(args).length > 0) {
                request.arguments = args;
            }
            this.s('request', request);
            if (typeof timeout === 'number') {
                const timer = setTimeout(() => {
                    clearTimeout(timer);
                    const clb = this.f.get(request.seq);
                    if (clb) {
                        this.f.delete(request.seq);
                        const err = {
                            type: 'response',
                            seq: 0,
                            request_seq: request.seq,
                            success: false,
                            command,
                            message: (0, nls_1.localize)(0, null, timeout, command)
                        };
                        clb(err);
                    }
                }, timeout);
            }
            if (clb) {
                // store callback for this request
                this.f.set(request.seq, clb);
            }
            return request.seq;
        }
        acceptMessage(message) {
            if (this.j) {
                this.j(message);
            }
            else {
                this.k.push(message);
                if (this.k.length === 1) {
                    // first item = need to start processing loop
                    this.q();
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
        o(messageA, messageB) {
            return messageA.type !== 'event' || messageB.type !== 'event';
        }
        /**
         * Reads and dispatches items from the queue until it is empty.
         */
        async q() {
            let message;
            while (this.k.length) {
                if (!message || this.o(this.k[0], message)) {
                    await (0, async_1.$Hg)(0);
                }
                message = this.k.shift();
                if (!message) {
                    return; // may have been disposed of
                }
                switch (message.type) {
                    case 'event':
                        this.i?.(message);
                        break;
                    case 'request':
                        this.g?.(message);
                        break;
                    case 'response': {
                        const response = message;
                        const clb = this.f.get(response.request_seq);
                        if (clb) {
                            this.f.delete(response.request_seq);
                            clb(response);
                        }
                        break;
                    }
                }
            }
        }
        s(typ, message) {
            message.type = typ;
            message.seq = this.d++;
            this.sendMessage(message);
        }
        async u() {
            if (this.f.size === 0) {
                return Promise.resolve();
            }
            const pending = new Map();
            this.f.forEach((value, key) => pending.set(key, value));
            await (0, async_1.$Hg)(500);
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
                this.f.delete(request_seq);
            });
        }
        getPendingRequestIds() {
            return Array.from(this.f.keys());
        }
        dispose() {
            this.k = [];
        }
    }
    exports.$Ecb = $Ecb;
});
//# sourceMappingURL=abstractDebugAdapter.js.map