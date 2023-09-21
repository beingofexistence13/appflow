/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, cancellation_1, event_1, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewViewService = exports.IWebviewViewService = void 0;
    exports.IWebviewViewService = (0, instantiation_1.createDecorator)('webviewViewService');
    class WebviewViewService extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._resolvers = new Map();
            this._awaitingRevival = new Map();
            this._onNewResolverRegistered = this._register(new event_1.Emitter());
            this.onNewResolverRegistered = this._onNewResolverRegistered.event;
        }
        register(viewType, resolver) {
            if (this._resolvers.has(viewType)) {
                throw new Error(`View resolver already registered for ${viewType}`);
            }
            this._resolvers.set(viewType, resolver);
            this._onNewResolverRegistered.fire({ viewType: viewType });
            const pending = this._awaitingRevival.get(viewType);
            if (pending) {
                resolver.resolve(pending.webview, cancellation_1.CancellationToken.None).then(() => {
                    this._awaitingRevival.delete(viewType);
                    pending.resolve();
                });
            }
            return (0, lifecycle_1.toDisposable)(() => {
                this._resolvers.delete(viewType);
            });
        }
        resolve(viewType, webview, cancellation) {
            const resolver = this._resolvers.get(viewType);
            if (!resolver) {
                if (this._awaitingRevival.has(viewType)) {
                    throw new Error('View already awaiting revival');
                }
                let resolve;
                const p = new Promise(r => resolve = r);
                this._awaitingRevival.set(viewType, { webview, resolve: resolve });
                return p;
            }
            return resolver.resolve(webview, cancellation);
        }
    }
    exports.WebviewViewService = WebviewViewService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld1ZpZXdTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2Vidmlld1ZpZXcvYnJvd3Nlci93ZWJ2aWV3Vmlld1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUVuRixRQUFBLG1CQUFtQixHQUFHLElBQUEsK0JBQWUsRUFBc0Isb0JBQW9CLENBQUMsQ0FBQztJQXVCOUYsTUFBYSxrQkFBbUIsU0FBUSxzQkFBVTtRQUFsRDs7WUFJa0IsZUFBVSxHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1lBRXJELHFCQUFnQixHQUFHLElBQUksR0FBRyxFQUEyRSxDQUFDO1lBRXRHLDZCQUF3QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWlDLENBQUMsQ0FBQztZQUN6Riw0QkFBdUIsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDO1FBc0MvRSxDQUFDO1FBcENBLFFBQVEsQ0FBQyxRQUFnQixFQUFFLFFBQThCO1lBQ3hELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLFFBQVEsRUFBRSxDQUFDLENBQUM7YUFDcEU7WUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBRTNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEQsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ25FLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3ZDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbkIsQ0FBQyxDQUFDLENBQUM7YUFDSDtZQUVELE9BQU8sSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsT0FBTyxDQUFDLFFBQWdCLEVBQUUsT0FBb0IsRUFBRSxZQUErQjtZQUM5RSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNkLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDeEMsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2lCQUNqRDtnQkFFRCxJQUFJLE9BQW1CLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBUSxFQUFFLENBQUMsQ0FBQztnQkFDcEUsT0FBTyxDQUFDLENBQUM7YUFDVDtZQUVELE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDaEQsQ0FBQztLQUNEO0lBL0NELGdEQStDQyJ9