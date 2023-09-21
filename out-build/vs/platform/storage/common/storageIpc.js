/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dAb = exports.$cAb = exports.$bAb = exports.$aAb = void 0;
    class BaseStorageDatabaseClient extends lifecycle_1.$kc {
        constructor(a, b, c) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async getItems() {
            const serializableRequest = { profile: this.b, workspace: this.c };
            const items = await this.a.call('getItems', serializableRequest);
            return new Map(items);
        }
        updateItems(request) {
            const serializableRequest = { profile: this.b, workspace: this.c };
            if (request.insert) {
                serializableRequest.insert = Array.from(request.insert.entries());
            }
            if (request.delete) {
                serializableRequest.delete = Array.from(request.delete.values());
            }
            return this.a.call('updateItems', serializableRequest);
        }
        optimize() {
            const serializableRequest = { profile: this.b, workspace: this.c };
            return this.a.call('optimize', serializableRequest);
        }
    }
    class BaseProfileAwareStorageDatabaseClient extends BaseStorageDatabaseClient {
        constructor(channel, profile) {
            super(channel, profile, undefined);
            this.f = this.B(new event_1.$fd());
            this.onDidChangeItemsExternal = this.f.event;
            this.g();
        }
        g() {
            this.B(this.a.listen('onDidChangeStorage', { profile: this.b })((e) => this.h(e)));
        }
        h(e) {
            if (Array.isArray(e.changed) || Array.isArray(e.deleted)) {
                this.f.fire({
                    changed: e.changed ? new Map(e.changed) : undefined,
                    deleted: e.deleted ? new Set(e.deleted) : undefined
                });
            }
        }
    }
    class $aAb extends BaseProfileAwareStorageDatabaseClient {
        constructor(channel) {
            super(channel, undefined);
        }
        async close() {
            // The application storage database is shared across all instances so
            // we do not close it from the window. However we dispose the
            // listener for external changes because we no longer interested in it.
            this.dispose();
        }
    }
    exports.$aAb = $aAb;
    class $bAb extends BaseProfileAwareStorageDatabaseClient {
        constructor(channel, profile) {
            super(channel, profile);
        }
        async close() {
            // The profile storage database is shared across all instances of
            // the same profile so we do not close it from the window.
            // However we dispose the listener for external changes because
            // we no longer interested in it.
            this.dispose();
        }
    }
    exports.$bAb = $bAb;
    class $cAb extends BaseStorageDatabaseClient {
        constructor(channel, workspace) {
            super(channel, undefined, workspace);
            this.onDidChangeItemsExternal = event_1.Event.None; // unsupported for workspace storage because we only ever write from one window
        }
        async close() {
            // The workspace storage database is only used in this instance
            // but we do not need to close it from here, the main process
            // can take care of that.
            this.dispose();
        }
    }
    exports.$cAb = $cAb;
    class $dAb {
        constructor(a) {
            this.a = a;
        }
        isUsed(path) {
            const serializableRequest = { payload: path, profile: undefined, workspace: undefined };
            return this.a.call('isUsed', serializableRequest);
        }
    }
    exports.$dAb = $dAb;
});
//# sourceMappingURL=storageIpc.js.map