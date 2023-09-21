/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/storage/common/storage"], function (require, exports, event_1, lifecycle_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$46b = void 0;
    class $46b extends lifecycle_1.$kc {
        constructor(b, c, f) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            const disposable = this.B(new lifecycle_1.$lc());
            this.a = this.B(new event_1.$fd({
                // Start listening to profile storage changes only when someone is listening
                onWillAddFirstListener: () => disposable.value = this.g(),
                // Stop listening to profile storage changes when no one is listening
                onDidRemoveLastListener: () => disposable.value = undefined
            }));
        }
        g() {
            this.f.debug('ProfileStorageChangesListenerChannel#registerStorageChangeListeners');
            const disposables = new lifecycle_1.$jc();
            disposables.add(event_1.Event.debounce(this.b.applicationStorage.onDidChangeStorage, (keys, e) => {
                if (keys) {
                    keys.push(e.key);
                }
                else {
                    keys = [e.key];
                }
                return keys;
            }, 100)(keys => this.h(keys)));
            disposables.add(event_1.Event.debounce(this.b.onDidChangeProfileStorage, (changes, e) => {
                if (!changes) {
                    changes = new Map();
                }
                let profileChanges = changes.get(e.profile.id);
                if (!profileChanges) {
                    changes.set(e.profile.id, profileChanges = { profile: e.profile, keys: [], storage: e.storage });
                }
                profileChanges.keys.push(e.key);
                return changes;
            }, 100)(keys => this.j(keys)));
            return disposables;
        }
        h(keys) {
            const targetChangedProfiles = keys.includes(storage_1.$Uo) ? [this.c.defaultProfile] : [];
            const profileStorageValueChanges = [];
            keys = keys.filter(key => key !== storage_1.$Uo);
            if (keys.length) {
                const keyTargets = (0, storage_1.$Wo)(this.b.applicationStorage.storage);
                profileStorageValueChanges.push({ profile: this.c.defaultProfile, changes: keys.map(key => ({ key, scope: 0 /* StorageScope.PROFILE */, target: keyTargets[key] })) });
            }
            this.m(targetChangedProfiles, profileStorageValueChanges);
        }
        j(changes) {
            const targetChangedProfiles = [];
            const profileStorageValueChanges = new Map();
            for (const [profileId, profileChanges] of changes.entries()) {
                if (profileChanges.keys.includes(storage_1.$Uo)) {
                    targetChangedProfiles.push(profileChanges.profile);
                }
                const keys = profileChanges.keys.filter(key => key !== storage_1.$Uo);
                if (keys.length) {
                    const keyTargets = (0, storage_1.$Wo)(profileChanges.storage.storage);
                    profileStorageValueChanges.set(profileId, { profile: profileChanges.profile, changes: keys.map(key => ({ key, scope: 0 /* StorageScope.PROFILE */, target: keyTargets[key] })) });
                }
            }
            this.m(targetChangedProfiles, [...profileStorageValueChanges.values()]);
        }
        m(targetChanges, valueChanges) {
            if (targetChanges.length || valueChanges.length) {
                this.a.fire({ valueChanges, targetChanges });
            }
        }
        listen(_, event, arg) {
            switch (event) {
                case 'onDidChange': return this.a.event;
            }
            throw new Error(`Event not found: ${event}`);
        }
        async call(_, command) {
            throw new Error(`Call not found: ${command}`);
        }
    }
    exports.$46b = $46b;
});
//# sourceMappingURL=userDataProfileStorageIpc.js.map