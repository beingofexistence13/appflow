/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalCapabilityStoreMultiplexer = exports.TerminalCapabilityStore = void 0;
    class TerminalCapabilityStore extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._map = new Map();
            this._onDidRemoveCapabilityType = this._register(new event_1.Emitter());
            this.onDidRemoveCapabilityType = this._onDidRemoveCapabilityType.event;
            this._onDidAddCapabilityType = this._register(new event_1.Emitter());
            this.onDidAddCapabilityType = this._onDidAddCapabilityType.event;
            this._onDidRemoveCapability = this._register(new event_1.Emitter());
            this.onDidRemoveCapability = this._onDidRemoveCapability.event;
            this._onDidAddCapability = this._register(new event_1.Emitter());
            this.onDidAddCapability = this._onDidAddCapability.event;
        }
        get items() {
            return this._map.keys();
        }
        add(capability, impl) {
            this._map.set(capability, impl);
            this._onDidAddCapabilityType.fire(capability);
            this._onDidAddCapability.fire({ id: capability, capability: impl });
        }
        get(capability) {
            // HACK: This isn't totally safe since the Map key and value are not connected
            return this._map.get(capability);
        }
        remove(capability) {
            const impl = this._map.get(capability);
            if (!impl) {
                return;
            }
            this._map.delete(capability);
            this._onDidRemoveCapabilityType.fire(capability);
            this._onDidAddCapability.fire({ id: capability, capability: impl });
        }
        has(capability) {
            return this._map.has(capability);
        }
    }
    exports.TerminalCapabilityStore = TerminalCapabilityStore;
    class TerminalCapabilityStoreMultiplexer extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._stores = [];
            this._onDidRemoveCapabilityType = this._register(new event_1.Emitter());
            this.onDidRemoveCapabilityType = this._onDidRemoveCapabilityType.event;
            this._onDidAddCapabilityType = this._register(new event_1.Emitter());
            this.onDidAddCapabilityType = this._onDidAddCapabilityType.event;
            this._onDidRemoveCapability = this._register(new event_1.Emitter());
            this.onDidRemoveCapability = this._onDidRemoveCapability.event;
            this._onDidAddCapability = this._register(new event_1.Emitter());
            this.onDidAddCapability = this._onDidAddCapability.event;
        }
        get items() {
            return this._items();
        }
        *_items() {
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
                this._onDidAddCapabilityType.fire(capability);
                this._onDidAddCapability.fire({ id: capability, capability: store.get(capability) });
            }
            this._register(store.onDidAddCapabilityType(e => this._onDidAddCapabilityType.fire(e)));
            this._register(store.onDidAddCapability(e => this._onDidAddCapability.fire(e)));
            this._register(store.onDidRemoveCapabilityType(e => this._onDidRemoveCapabilityType.fire(e)));
            this._register(store.onDidRemoveCapability(e => this._onDidRemoveCapability.fire(e)));
        }
    }
    exports.TerminalCapabilityStoreMultiplexer = TerminalCapabilityStoreMultiplexer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxDYXBhYmlsaXR5U3RvcmUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZXJtaW5hbC9jb21tb24vY2FwYWJpbGl0aWVzL3Rlcm1pbmFsQ2FwYWJpbGl0eVN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxNQUFhLHVCQUF3QixTQUFRLHNCQUFVO1FBQXZEOztZQUNTLFNBQUksR0FBMEQsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUUvRCwrQkFBMEIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFzQixDQUFDLENBQUM7WUFDdkYsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQztZQUMxRCw0QkFBdUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFzQixDQUFDLENBQUM7WUFDcEYsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQztZQUVwRCwyQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFzQyxDQUFDLENBQUM7WUFDbkcsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQUNsRCx3QkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFzQyxDQUFDLENBQUM7WUFDaEcsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztRQThCOUQsQ0FBQztRQTVCQSxJQUFJLEtBQUs7WUFDUixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDekIsQ0FBQztRQUVELEdBQUcsQ0FBK0IsVUFBYSxFQUFFLElBQW1DO1lBQ25GLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVB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