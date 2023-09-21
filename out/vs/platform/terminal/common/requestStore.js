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
    exports.RequestStore = void 0;
    /**
     * A helper class to track requests that have replies. Using this it's easy to implement an event
     * that accepts a reply.
     */
    let RequestStore = class RequestStore extends lifecycle_1.Disposable {
        /**
         * @param timeout How long in ms to allow requests to go unanswered for, undefined will use the
         * default (15 seconds).
         */
        constructor(timeout, _logService) {
            super();
            this._logService = _logService;
            this._lastRequestId = 0;
            this._pendingRequests = new Map();
            this._pendingRequestDisposables = new Map();
            this._onCreateRequest = this._register(new event_1.Emitter());
            this.onCreateRequest = this._onCreateRequest.event;
            this._timeout = timeout === undefined ? 15000 : timeout;
            this._register((0, lifecycle_1.toDisposable)(() => {
                for (const d of this._pendingRequestDisposables.values()) {
                    (0, lifecycle_1.dispose)(d);
                }
            }));
        }
        /**
         * Creates a request.
         * @param args The arguments to pass to the onCreateRequest event.
         */
        createRequest(args) {
            return new Promise((resolve, reject) => {
                const requestId = ++this._lastRequestId;
                this._pendingRequests.set(requestId, resolve);
                this._onCreateRequest.fire({ requestId, ...args });
                const tokenSource = new cancellation_1.CancellationTokenSource();
                (0, async_1.timeout)(this._timeout, tokenSource.token).then(() => reject(`Request ${requestId} timed out (${this._timeout}ms)`));
                this._pendingRequestDisposables.set(requestId, [(0, lifecycle_1.toDisposable)(() => tokenSource.cancel())]);
            });
        }
        /**
         * Accept a reply to a request.
         * @param requestId The request ID originating from the onCreateRequest event.
         * @param data The reply data.
         */
        acceptReply(requestId, data) {
            const resolveRequest = this._pendingRequests.get(requestId);
            if (resolveRequest) {
                this._pendingRequests.delete(requestId);
                (0, lifecycle_1.dispose)(this._pendingRequestDisposables.get(requestId) || []);
                this._pendingRequestDisposables.delete(requestId);
                resolveRequest(data);
            }
            else {
                this._logService.warn(`RequestStore#acceptReply was called without receiving a matching request ${requestId}`);
            }
        }
    };
    exports.RequestStore = RequestStore;
    exports.RequestStore = RequestStore = __decorate([
        __param(1, log_1.ILogService)
    ], RequestStore);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdFN0b3JlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvY29tbW9uL3JlcXVlc3RTdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFRaEc7OztPQUdHO0lBQ0ksSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBNkIsU0FBUSxzQkFBVTtRQVMzRDs7O1dBR0c7UUFDSCxZQUNDLE9BQTJCLEVBQ2QsV0FBeUM7WUFFdEQsS0FBSyxFQUFFLENBQUM7WUFGc0IsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFkL0MsbUJBQWMsR0FBRyxDQUFDLENBQUM7WUFFbkIscUJBQWdCLEdBQXVDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDakUsK0JBQTBCLEdBQStCLElBQUksR0FBRyxFQUFFLENBQUM7WUFFMUQscUJBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBdUMsQ0FBQyxDQUFDO1lBQzlGLG9CQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztZQVd0RCxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQ3hELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtnQkFDaEMsS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxFQUFFLEVBQUU7b0JBQ3pELElBQUEsbUJBQU8sRUFBQyxDQUFDLENBQUMsQ0FBQztpQkFDWDtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsYUFBYSxDQUFDLElBQWlCO1lBQzlCLE9BQU8sSUFBSSxPQUFPLENBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ3pDLE1BQU0sU0FBUyxHQUFHLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNuRCxNQUFNLFdBQVcsR0FBRyxJQUFJLHNDQUF1QixFQUFFLENBQUM7Z0JBQ2xELElBQUEsZUFBTyxFQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxTQUFTLGVBQWUsSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDcEgsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxXQUFXLENBQUMsU0FBaUIsRUFBRSxJQUFPO1lBQ3JDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUQsSUFBSSxjQUFjLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3hDLElBQUEsbUJBQU8sRUFBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUM5RCxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNsRCxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDckI7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsNEVBQTRFLFNBQVMsRUFBRSxDQUFDLENBQUM7YUFDL0c7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQXpEWSxvQ0FBWTsyQkFBWixZQUFZO1FBZXRCLFdBQUEsaUJBQVcsQ0FBQTtPQWZELFlBQVksQ0F5RHhCIn0=