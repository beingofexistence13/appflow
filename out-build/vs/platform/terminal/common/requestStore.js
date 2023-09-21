/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/log/common/log"], function (require, exports, async_1, cancellation_1, event_1, lifecycle_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4q = void 0;
    /**
     * A helper class to track requests that have replies. Using this it's easy to implement an event
     * that accepts a reply.
     */
    let $4q = class $4q extends lifecycle_1.$kc {
        /**
         * @param timeout How long in ms to allow requests to go unanswered for, undefined will use the
         * default (15 seconds).
         */
        constructor(timeout, h) {
            super();
            this.h = h;
            this.a = 0;
            this.c = new Map();
            this.f = new Map();
            this.g = this.B(new event_1.$fd());
            this.onCreateRequest = this.g.event;
            this.b = timeout === undefined ? 15000 : timeout;
            this.B((0, lifecycle_1.$ic)(() => {
                for (const d of this.f.values()) {
                    (0, lifecycle_1.$fc)(d);
                }
            }));
        }
        /**
         * Creates a request.
         * @param args The arguments to pass to the onCreateRequest event.
         */
        createRequest(args) {
            return new Promise((resolve, reject) => {
                const requestId = ++this.a;
                this.c.set(requestId, resolve);
                this.g.fire({ requestId, ...args });
                const tokenSource = new cancellation_1.$pd();
                (0, async_1.$Hg)(this.b, tokenSource.token).then(() => reject(`Request ${requestId} timed out (${this.b}ms)`));
                this.f.set(requestId, [(0, lifecycle_1.$ic)(() => tokenSource.cancel())]);
            });
        }
        /**
         * Accept a reply to a request.
         * @param requestId The request ID originating from the onCreateRequest event.
         * @param data The reply data.
         */
        acceptReply(requestId, data) {
            const resolveRequest = this.c.get(requestId);
            if (resolveRequest) {
                this.c.delete(requestId);
                (0, lifecycle_1.$fc)(this.f.get(requestId) || []);
                this.f.delete(requestId);
                resolveRequest(data);
            }
            else {
                this.h.warn(`RequestStore#acceptReply was called without receiving a matching request ${requestId}`);
            }
        }
    };
    exports.$4q = $4q;
    exports.$4q = $4q = __decorate([
        __param(1, log_1.$5i)
    ], $4q);
});
//# sourceMappingURL=requestStore.js.map