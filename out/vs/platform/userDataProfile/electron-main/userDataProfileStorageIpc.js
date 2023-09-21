/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/storage/common/storage"], function (require, exports, event_1, lifecycle_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProfileStorageChangesListenerChannel = void 0;
    class ProfileStorageChangesListenerChannel extends lifecycle_1.Disposable {
        constructor(storageMainService, userDataProfilesService, logService) {
            super();
            this.storageMainService = storageMainService;
            this.userDataProfilesService = userDataProfilesService;
            this.logService = logService;
            const disposable = this._register(new lifecycle_1.MutableDisposable());
            this._onDidChange = this._register(new event_1.Emitter({
                // Start listening to profile storage changes only when someone is listening
                onWillAddFirstListener: () => disposable.value = this.registerStorageChangeListeners(),
                // Stop listening to profile storage changes when no one is listening
                onDidRemoveLastListener: () => disposable.value = undefined
            }));
        }
        registerStorageChangeListeners() {
            this.logService.debug('ProfileStorageChangesListenerChannel#registerStorageChangeListeners');
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(event_1.Event.debounce(this.storageMainService.applicationStorage.onDidChangeStorage, (keys, e) => {
                if (keys) {
                    keys.push(e.key);
                }
                else {
                    keys = [e.key];
                }
                return keys;
            }, 100)(keys => this.onDidChangeApplicationStorage(keys)));
            disposables.add(event_1.Event.debounce(this.storageMainService.onDidChangeProfileStorage, (changes, e) => {
                if (!changes) {
                    changes = new Map();
                }
                let profileChanges = changes.get(e.profile.id);
                if (!profileChanges) {
                    changes.set(e.profile.id, profileChanges = { profile: e.profile, keys: [], storage: e.storage });
                }
                profileChanges.keys.push(e.key);
                return changes;
            }, 100)(keys => this.onDidChangeProfileStorage(keys)));
            return disposables;
        }
        onDidChangeApplicationStorage(keys) {
            const targetChangedProfiles = keys.includes(storage_1.TARGET_KEY) ? [this.userDataProfilesService.defaultProfile] : [];
            const profileStorageValueChanges = [];
            keys = keys.filter(key => key !== storage_1.TARGET_KEY);
            if (keys.length) {
                const keyTargets = (0, storage_1.loadKeyTargets)(this.storageMainService.applicationStorage.storage);
                profileStorageValueChanges.push({ profile: this.userDataProfilesService.defaultProfile, changes: keys.map(key => ({ key, scope: 0 /* StorageScope.PROFILE */, target: keyTargets[key] })) });
            }
            this.triggerEvents(targetChangedProfiles, profileStorageValueChanges);
        }
        onDidChangeProfileStorage(changes) {
            const targetChangedProfiles = [];
            const profileStorageValueChanges = new Map();
            for (const [profileId, profileChanges] of changes.entries()) {
                if (profileChanges.keys.includes(storage_1.TARGET_KEY)) {
                    targetChangedProfiles.push(profileChanges.profile);
                }
                const keys = profileChanges.keys.filter(key => key !== storage_1.TARGET_KEY);
                if (keys.length) {
                    const keyTargets = (0, storage_1.loadKeyTargets)(profileChanges.storage.storage);
                    profileStorageValueChanges.set(profileId, { profile: profileChanges.profile, changes: keys.map(key => ({ key, scope: 0 /* StorageScope.PROFILE */, target: keyTargets[key] })) });
                }
            }
            this.triggerEvents(targetChangedProfiles, [...profileStorageValueChanges.values()]);
        }
        triggerEvents(targetChanges, valueChanges) {
            if (targetChanges.length || valueChanges.length) {
                this._onDidChange.fire({ valueChanges, targetChanges });
            }
        }
        listen(_, event, arg) {
            switch (event) {
                case 'onDidChange': return this._onDidChange.event;
            }
            throw new Error(`Event not found: ${event}`);
        }
        async call(_, command) {
            throw new Error(`Call not found: ${command}`);
        }
    }
    exports.ProfileStorageChangesListenerChannel = ProfileStorageChangesListenerChannel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlU3RvcmFnZUlwYy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VzZXJEYXRhUHJvZmlsZS9lbGVjdHJvbi1tYWluL3VzZXJEYXRhUHJvZmlsZVN0b3JhZ2VJcGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQWEsb0NBQXFDLFNBQVEsc0JBQVU7UUFJbkUsWUFDa0Isa0JBQXVDLEVBQ3ZDLHVCQUFpRCxFQUNqRCxVQUF1QjtZQUV4QyxLQUFLLEVBQUUsQ0FBQztZQUpTLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDdkMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUNqRCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBR3hDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBZSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxDQUM3QztnQkFDQyw0RUFBNEU7Z0JBQzVFLHNCQUFzQixFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLDhCQUE4QixFQUFFO2dCQUN0RixxRUFBcUU7Z0JBQ3JFLHVCQUF1QixFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsU0FBUzthQUMzRCxDQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyw4QkFBOEI7WUFDckMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMscUVBQXFFLENBQUMsQ0FBQztZQUM3RixNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUMxQyxXQUFXLENBQUMsR0FBRyxDQUFDLGFBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixD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