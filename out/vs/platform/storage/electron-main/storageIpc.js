/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/platform/workspace/common/workspace"], function (require, exports, event_1, lifecycle_1, marshalling_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StorageDatabaseChannel = void 0;
    class StorageDatabaseChannel extends lifecycle_1.Disposable {
        static { this.STORAGE_CHANGE_DEBOUNCE_TIME = 100; }
        constructor(logService, storageMainService) {
            super();
            this.logService = logService;
            this.storageMainService = storageMainService;
            this.onDidChangeApplicationStorageEmitter = this._register(new event_1.Emitter());
            this.mapProfileToOnDidChangeProfileStorageEmitter = new Map();
            this.registerStorageChangeListeners(storageMainService.applicationStorage, this.onDidChangeApplicationStorageEmitter);
        }
        //#region Storage Change Events
        registerStorageChangeListeners(storage, emitter) {
            // Listen for changes in provided storage to send to listeners
            // that are listening. Use a debouncer to reduce IPC traffic.
            this._register(event_1.Event.debounce(storage.onDidChangeStorage, (prev, cur) => {
                if (!prev) {
                    prev = [cur];
                }
                else {
                    prev.push(cur);
                }
                return prev;
            }, StorageDatabaseChannel.STORAGE_CHANGE_DEBOUNCE_TIME)(events => {
                if (events.length) {
                    emitter.fire(this.serializeStorageChangeEvents(events, storage));
                }
            }));
        }
        serializeStorageChangeEvents(events, storage) {
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
                    const profile = arg.profile ? (0, marshalling_1.revive)(arg.profile) : undefined;
                    // Without profile: application scope
                    if (!profile) {
                        return this.onDidChangeApplicationStorageEmitter.event;
                    }
                    // With profile: profile scope for the profile
                    let profileStorageChangeEmitter = this.mapProfileToOnDidChangeProfileStorageEmitter.get(profile.id);
                    if (!profileStorageChangeEmitter) {
                        profileStorageChangeEmitter = this._register(new event_1.Emitter());
                        this.registerStorageChangeListeners(this.storageMainService.profileStorage(profile), profileStorageChangeEmitter);
                        this.mapProfileToOnDidChangeProfileStorageEmitter.set(profile.id, profileStorageChangeEmitter);
                    }
                    return profileStorageChangeEmitter.event;
                }
            }
            throw new Error(`Event not found: ${event}`);
        }
        //#endregion
        async call(_, command, arg) {
            const profile = arg.profile ? (0, marshalling_1.revive)(arg.profile) : undefined;
            const workspace = (0, workspace_1.reviveIdentifier)(arg.workspace);
            // Get storage to be ready
            const storage = await this.withStorageInitialized(profile, workspace);
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
                        return this.storageMainService.isUsed(path);
                    }
                }
                default:
                    throw new Error(`Call not found: ${command}`);
            }
        }
        async withStorageInitialized(profile, workspace) {
            let storage;
            if (workspace) {
                storage = this.storageMainService.workspaceStorage(workspace);
            }
            else if (profile) {
                storage = this.storageMainService.profileStorage(profile);
            }
            else {
                storage = this.storageMainService.applicationStorage;
            }
            try {
                await storage.init();
            }
            catch (error) {
                this.logService.error(`StorageIPC#init: Unable to init ${workspace ? 'workspace' : profile ? 'profile' : 'application'} storage due to ${error}`);
            }
            return storage;
        }
    }
    exports.StorageDatabaseChannel = StorageDatabaseChannel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZUlwYy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3N0b3JhZ2UvZWxlY3Ryb24tbWFpbi9zdG9yYWdlSXBjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxNQUFhLHNCQUF1QixTQUFRLHNCQUFVO2lCQUU3QixpQ0FBNEIsR0FBRyxHQUFHLEFBQU4sQ0FBTztRQU0zRCxZQUNrQixVQUF1QixFQUN2QixrQkFBdUM7WUFFeEQsS0FBSyxFQUFFLENBQUM7WUFIUyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ3ZCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFOeEMseUNBQW9DLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBaUMsQ0FBQyxDQUFDO1lBRXBHLGlEQUE0QyxHQUFHLElBQUksR0FBRyxFQUFtRSxDQUFDO1lBUTFJLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUN2SCxDQUFDO1FBRUQsK0JBQStCO1FBRXZCLDhCQUE4QixDQUFDLE9BQXFCLEVBQUUsT0FBK0M7WUFFNUcsOERBQThEO1lBQzlELDZEQUE2RDtZQUU3RCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBdUMsRUFBRSxHQUF3QixFQUFFLEVBQUU7Z0JBQy9ILElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBQ1YsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2I7cUJBQU07b0JBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDZjtnQkFFRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUMsRUFBRSxzQkFBc0IsQ0FBQyw0QkFBNEIs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