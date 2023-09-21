/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/platform/workspace/common/workspace"], function (require, exports, event_1, lifecycle_1, marshalling_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$A6b = void 0;
    class $A6b extends lifecycle_1.$kc {
        static { this.a = 100; }
        constructor(f, g) {
            super();
            this.f = f;
            this.g = g;
            this.b = this.B(new event_1.$fd());
            this.c = new Map();
            this.h(g.applicationStorage, this.b);
        }
        //#region Storage Change Events
        h(storage, emitter) {
            // Listen for changes in provided storage to send to listeners
            // that are listening. Use a debouncer to reduce IPC traffic.
            this.B(event_1.Event.debounce(storage.onDidChangeStorage, (prev, cur) => {
                if (!prev) {
                    prev = [cur];
                }
                else {
                    prev.push(cur);
                }
                return prev;
            }, $A6b.a)(events => {
                if (events.length) {
                    emitter.fire(this.j(events, storage));
                }
            }));
        }
        j(events, storage) {
            const changed = new Map();
            const deleted = new Set();
            events.forEach(event => {
                const existing = storage.get(event.key);
                if (typeof existing === 'string') {
                    changed.set(event.key, existing);
                }
                else {
                    deleted.add(event.key);
                }
            });
            return {
                changed: Array.from(changed.entries()),
                deleted: Array.from(deleted.values())
            };
        }
        listen(_, event, arg) {
            switch (event) {
                case 'onDidChangeStorage': {
                    const profile = arg.profile ? (0, marshalling_1.$$g)(arg.profile) : undefined;
                    // Without profile: application scope
                    if (!profile) {
                        return this.b.event;
                    }
                    // With profile: profile scope for the profile
                    let profileStorageChangeEmitter = this.c.get(profile.id);
                    if (!profileStorageChangeEmitter) {
                        profileStorageChangeEmitter = this.B(new event_1.$fd());
                        this.h(this.g.profileStorage(profile), profileStorageChangeEmitter);
                        this.c.set(profile.id, profileStorageChangeEmitter);
                    }
                    return profileStorageChangeEmitter.event;
                }
            }
            throw new Error(`Event not found: ${event}`);
        }
        //#endregion
        async call(_, command, arg) {
            const profile = arg.profile ? (0, marshalling_1.$$g)(arg.profile) : undefined;
            const workspace = (0, workspace_1.$Rh)(arg.workspace);
            // Get storage to be ready
            const storage = await this.m(profile, workspace);
            // handle call
            switch (command) {
                case 'getItems': {
                    return Array.from(storage.items.entries());
                }
                case 'updateItems': {
                    const items = arg;
                    if (items.insert) {
                        for (const [key, value] of items.insert) {
                            storage.set(key, value);
                        }
                    }
                    items.delete?.forEach(key => storage.delete(key));
                    break;
                }
                case 'optimize': {
                    return storage.optimize();
                }
                case 'isUsed': {
                    const path = arg.payload;
                    if (typeof path === 'string') {
                        return this.g.isUsed(path);
                    }
                }
                default:
                    throw new Error(`Call not found: ${command}`);
            }
        }
        async m(profile, workspace) {
            let storage;
            if (workspace) {
                storage = this.g.workspaceStorage(workspace);
            }
            else if (profile) {
                storage = this.g.profileStorage(profile);
            }
            else {
                storage = this.g.applicationStorage;
            }
            try {
                await storage.init();
            }
            catch (error) {
                this.f.error(`StorageIPC#init: Unable to init ${workspace ? 'workspace' : profile ? 'profile' : 'application'} storage due to ${error}`);
            }
            return storage;
        }
    }
    exports.$A6b = $A6b;
});
//# sourceMappingURL=storageIpc.js.map