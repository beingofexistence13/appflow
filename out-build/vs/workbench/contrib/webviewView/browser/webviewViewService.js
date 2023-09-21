/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, cancellation_1, event_1, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wlb = exports.$vlb = void 0;
    exports.$vlb = (0, instantiation_1.$Bh)('webviewViewService');
    class $wlb extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.a = new Map();
            this.b = new Map();
            this.c = this.B(new event_1.$fd());
            this.onNewResolverRegistered = this.c.event;
        }
        register(viewType, resolver) {
            if (this.a.has(viewType)) {
                throw new Error(`View resolver already registered for ${viewType}`);
            }
            this.a.set(viewType, resolver);
            this.c.fire({ viewType: viewType });
            const pending = this.b.get(viewType);
            if (pending) {
                resolver.resolve(pending.webview, cancellation_1.CancellationToken.None).then(() => {
                    this.b.delete(viewType);
                    pending.resolve();
                });
            }
            return (0, lifecycle_1.$ic)(() => {
                this.a.delete(viewType);
            });
        }
        resolve(viewType, webview, cancellation) {
            const resolver = this.a.get(viewType);
            if (!resolver) {
                if (this.b.has(viewType)) {
                    throw new Error('View already awaiting revival');
                }
                let resolve;
                const p = new Promise(r => resolve = r);
                this.b.set(viewType, { webview, resolve: resolve });
                return p;
            }
            return resolver.resolve(webview, cancellation);
        }
    }
    exports.$wlb = $wlb;
});
//# sourceMappingURL=webviewViewService.js.map