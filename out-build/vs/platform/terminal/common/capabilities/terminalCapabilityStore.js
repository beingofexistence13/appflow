/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fib = exports.$eib = void 0;
    class $eib extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.a = new Map();
            this.b = this.B(new event_1.$fd());
            this.onDidRemoveCapabilityType = this.b.event;
            this.f = this.B(new event_1.$fd());
            this.onDidAddCapabilityType = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidRemoveCapability = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidAddCapability = this.h.event;
        }
        get items() {
            return this.a.keys();
        }
        add(capability, impl) {
            this.a.set(capability, impl);
            this.f.fire(capability);
            this.h.fire({ id: capability, capability: impl });
        }
        get(capability) {
            // HACK: This isn't totally safe since the Map key and value are not connected
            return this.a.get(capability);
        }
        remove(capability) {
            const impl = this.a.get(capability);
            if (!impl) {
                return;
            }
            this.a.delete(capability);
            this.b.fire(capability);
            this.h.fire({ id: capability, capability: impl });
        }
        has(capability) {
            return this.a.has(capability);
        }
    }
    exports.$eib = $eib;
    class $fib extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this._stores = [];
            this.a = this.B(new event_1.$fd());
            this.onDidRemoveCapabilityType = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidAddCapabilityType = this.b.event;
            this.f = this.B(new event_1.$fd());
            this.onDidRemoveCapability = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidAddCapability = this.g.event;
        }
        get items() {
            return this.h();
        }
        *h() {
            for (const store of this._stores) {
                for (const c of store.items) {
                    yield c;
                }
            }
        }
        has(capability) {
            for (const store of this._stores) {
                for (const c of store.items) {
                    if (c === capability) {
                        return true;
                    }
                }
            }
            return false;
        }
        get(capability) {
            for (const store of this._stores) {
                const c = store.get(capability);
                if (c) {
                    return c;
                }
            }
            return undefined;
        }
        add(store) {
            this._stores.push(store);
            for (const capability of store.items) {
                this.b.fire(capability);
                this.g.fire({ id: capability, capability: store.get(capability) });
            }
            this.B(store.onDidAddCapabilityType(e => this.b.fire(e)));
            this.B(store.onDidAddCapability(e => this.g.fire(e)));
            this.B(store.onDidRemoveCapabilityType(e => this.a.fire(e)));
            this.B(store.onDidRemoveCapability(e => this.f.fire(e)));
        }
    }
    exports.$fib = $fib;
});
//# sourceMappingURL=terminalCapabilityStore.js.map