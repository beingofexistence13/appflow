/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects", "vs/base/common/semver/semver", "vs/base/common/types"], function (require, exports, objects_1, semver, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.merge = void 0;
    function merge(localExtensions, remoteExtensions, lastSyncExtensions, skippedExtensions, ignoredExtensions, lastSyncBuiltinExtensions) {
        const added = [];
        const removed = [];
        const updated = [];
        if (!remoteExtensions) {
            const remote = localExtensions.filter(({ identifier }) => ignoredExtensions.every(id => id.toLowerCase() !== identifier.id.toLowerCase()));
            return {
                local: {
                    added,
                    removed,
                    updated,
                },
                remote: remote.length > 0 ? {
                    added: remote,
                    updated: [],
                    removed: [],
                    all: remote
                } : null
            };
        }
        localExtensions = localExtensions.map(massageIncomingExtension);
        remoteExtensions = remoteExtensions.map(massageIncomingExtension);
        lastSyncExtensions = lastSyncExtensions ? lastSyncExtensions.map(massageIncomingExtension) : null;
        const uuids = new Map();
        const addUUID = (identifier) => { if (identifier.uuid) {
            uuids.set(identifier.id.toLowerCase(), identifier.uuid);
        } };
        localExtensions.forEach(({ identifier }) => addUUID(identifier));
        remoteExtensions.forEach(({ identifier }) => addUUID(identifier));
        lastSyncExtensions?.forEach(({ identifier }) => addUUID(identifier));
        const getKey = (extension) => {
            const uuid = extension.identifier.uuid || uuids.get(extension.identifier.id.toLowerCase());
            return uuid ? `uuid:${uuid}` : `id:${extension.identifier.id.toLowerCase()}`;
        };
        const addExtensionToMap = (map, extension) => {
            map.set(getKey(extension), extension);
            return map;
        };
        const localExtensionsMap = localExtensions.reduce(addExtensionToMap, new Map());
        const remoteExtensionsMap = remoteExtensions.reduce(addExtensionToMap, new Map());
        const newRemoteExtensionsMap = remoteExtensions.reduce((map, extension) => addExtensionToMap(map, (0, objects_1.deepClone)(extension)), new Map());
        const lastSyncExtensionsMap = lastSyncExtensions ? lastSyncExtensions.reduce(addExtensionToMap, new Map()) : null;
        const skippedExtensionsMap = skippedExtensions.reduce(addExtensionToMap, new Map());
        const ignoredExtensionsSet = ignoredExtensions.reduce((set, id) => {
            const uuid = uuids.get(id.toLowerCase());
            return set.add(uuid ? `uuid:${uuid}` : `id:${id.toLowerCase()}`);
        }, new Set());
        const lastSyncBuiltinExtensionsSet = lastSyncBuiltinExtensions ? lastSyncBuiltinExtensions.reduce((set, { id, uuid }) => {
            uuid = uuid ?? uuids.get(id.toLowerCase());
            return set.add(uuid ? `uuid:${uuid}` : `id:${id.toLowerCase()}`);
        }, new Set()) : null;
        const localToRemote = compare(localExtensionsMap, remoteExtensionsMap, ignoredExtensionsSet, false);
        if (localToRemote.added.size > 0 || localToRemote.removed.size > 0 || localToRemote.updated.size > 0) {
            const baseToLocal = compare(lastSyncExtensionsMap, localExtensionsMap, ignoredExtensionsSet, false);
            const baseToRemote = compare(lastSyncExtensionsMap, remoteExtensionsMap, ignoredExtensionsSet, true);
            const merge = (key, localExtension, remoteExtension, preferred) => {
                let pinned, version, preRelease;
                if (localExtension.installed) {
                    pinned = preferred.pinned;
                    preRelease = preferred.preRelease;
                    if (pinned) {
                        version = preferred.version;
                    }
                }
                else {
                    pinned = remoteExtension.pinned;
                    preRelease = remoteExtension.preRelease;
                    if (pinned) {
                        version = remoteExtension.version;
                    }
                }
                if (pinned === undefined /* from older client*/) {
                    pinned = localExtension.pinned;
                    if (pinned) {
                        version = localExtension.version;
                    }
                }
                if (preRelease === undefined /* from older client*/) {
                    preRelease = localExtension.preRelease;
                }
                return {
                    ...preferred,
                    installed: localExtension.installed || remoteExtension.installed,
                    pinned,
                    preRelease,
                    version: version ?? (remoteExtension.version && (!localExtension.installed || semver.gt(remoteExtension.version, localExtension.version)) ? remoteExtension.version : localExtension.version),
                    state: mergeExtensionState(localExtension, remoteExtension, lastSyncExtensionsMap?.get(key)),
                };
            };
            // Remotely removed extension => exist in base and does not in remote
            for (const key of baseToRemote.removed.values()) {
                const localExtension = localExtensionsMap.get(key);
                if (!localExtension) {
                    continue;
                }
                const baseExtension = (0, types_1.assertIsDefined)(lastSyncExtensionsMap?.get(key));
                const wasAnInstalledExtensionDuringLastSync = lastSyncBuiltinExtensionsSet && !lastSyncBuiltinExtensionsSet.has(key) && baseExtension.installed;
                if (localExtension.installed && wasAnInstalledExtensionDuringLastSync /* It is an installed extension now and during last sync */) {
                    // Installed extension is removed from remote. Remove it from local.
                    removed.push(localExtension.identifier);
                }
                else {
                    // Add to remote: It is a builtin extenision or got installed after last sync
                    newRemoteExtensionsMap.set(key, localExtension);
                }
            }
            // Remotely added extension => does not exist in base and exist in remote
            for (const key of baseToRemote.added.values()) {
                const remoteExtension = (0, types_1.assertIsDefined)(remoteExtensionsMap.get(key));
                const localExtension = localExtensionsMap.get(key);
                // Also exist in local
                if (localExtension) {
                    // Is different from local to remote
                    if (localToRemote.updated.has(key)) {
                        const mergedExtension = merge(key, localExtension, remoteExtension, remoteExtension);
                        // Update locally only when the extension has changes in properties other than installed poperty
                        if (!areSame(localExtension, remoteExtension, false, false)) {
                            updated.push(massageOutgoingExtension(mergedExtension, key));
                        }
                        newRemoteExtensionsMap.set(key, mergedExtension);
                    }
                }
                else {
                    // Add only if the extension is an installed extension
                    if (remoteExtension.installed) {
                        added.push(massageOutgoingExtension(remoteExtension, key));
                    }
                }
            }
            // Remotely updated extension => exist in base and remote
            for (const key of baseToRemote.updated.values()) {
                const remoteExtension = (0, types_1.assertIsDefined)(remoteExtensionsMap.get(key));
                const baseExtension = (0, types_1.assertIsDefined)(lastSyncExtensionsMap?.get(key));
                const localExtension = localExtensionsMap.get(key);
                // Also exist in local
                if (localExtension) {
                    const wasAnInstalledExtensionDuringLastSync = lastSyncBuiltinExtensionsSet && !lastSyncBuiltinExtensionsSet.has(key) && baseExtension.installed;
                    if (wasAnInstalledExtensionDuringLastSync && localExtension.installed && !remoteExtension.installed) {
                        // Remove it locally if it is installed locally and not remotely
                        removed.push(localExtension.identifier);
                    }
                    else {
                        // Update in local always
                        const mergedExtension = merge(key, localExtension, remoteExtension, remoteExtension);
                        updated.push(massageOutgoingExtension(mergedExtension, key));
                        newRemoteExtensionsMap.set(key, mergedExtension);
                    }
                }
                // Add it locally if does not exist locally and installed remotely
                else if (remoteExtension.installed) {
                    added.push(massageOutgoingExtension(remoteExtension, key));
                }
            }
            // Locally added extension => does not exist in base and exist in local
            for (const key of baseToLocal.added.values()) {
                // If added in remote (already handled)
                if (baseToRemote.added.has(key)) {
                    continue;
                }
                newRemoteExtensionsMap.set(key, (0, types_1.assertIsDefined)(localExtensionsMap.get(key)));
            }
            // Locally updated extension => exist in base and local
            for (const key of baseToLocal.updated.values()) {
                // If removed in remote (already handled)
                if (baseToRemote.removed.has(key)) {
                    continue;
                }
                // If updated in remote (already handled)
                if (baseToRemote.updated.has(key)) {
                    continue;
                }
                const localExtension = (0, types_1.assertIsDefined)(localExtensionsMap.get(key));
                const remoteExtension = (0, types_1.assertIsDefined)(remoteExtensionsMap.get(key));
                // Update remotely
                newRemoteExtensionsMap.set(key, merge(key, localExtension, remoteExtension, localExtension));
            }
            // Locally removed extensions => exist in base and does not exist in local
            for (const key of baseToLocal.removed.values()) {
                // If updated in remote (already handled)
                if (baseToRemote.updated.has(key)) {
                    continue;
                }
                // If removed in remote (already handled)
                if (baseToRemote.removed.has(key)) {
                    continue;
                }
                // Skipped
                if (skippedExtensionsMap.has(key)) {
                    continue;
                }
                // Skip if it is a builtin extension
                if (!(0, types_1.assertIsDefined)(remoteExtensionsMap.get(key)).installed) {
                    continue;
                }
                // Skip if last sync builtin extensions set is not available
                if (!lastSyncBuiltinExtensionsSet) {
                    continue;
                }
                // Skip if it was a builtin extension during last sync
                if (lastSyncBuiltinExtensionsSet.has(key) || !(0, types_1.assertIsDefined)(lastSyncExtensionsMap?.get(key)).installed) {
                    continue;
                }
                newRemoteExtensionsMap.delete(key);
            }
        }
        const remote = [];
        const remoteChanges = compare(remoteExtensionsMap, newRemoteExtensionsMap, new Set(), true);
        const hasRemoteChanges = remoteChanges.added.size > 0 || remoteChanges.updated.size > 0 || remoteChanges.removed.size > 0;
        if (hasRemoteChanges) {
            newRemoteExtensionsMap.forEach((value, key) => remote.push(massageOutgoingExtension(value, key)));
        }
        return {
            local: { added, removed, updated },
            remote: hasRemoteChanges ? {
                added: [...remoteChanges.added].map(id => newRemoteExtensionsMap.get(id)),
                updated: [...remoteChanges.updated].map(id => newRemoteExtensionsMap.get(id)),
                removed: [...remoteChanges.removed].map(id => remoteExtensionsMap.get(id)),
                all: remote
            } : null
        };
    }
    exports.merge = merge;
    function compare(from, to, ignoredExtensions, checkVersionProperty) {
        const fromKeys = from ? [...from.keys()].filter(key => !ignoredExtensions.has(key)) : [];
        const toKeys = [...to.keys()].filter(key => !ignoredExtensions.has(key));
        const added = toKeys.filter(key => !fromKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
        const removed = fromKeys.filter(key => !toKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
        const updated = new Set();
        for (const key of fromKeys) {
            if (removed.has(key)) {
                continue;
            }
            const fromExtension = from.get(key);
            const toExtension = to.get(key);
            if (!toExtension || !areSame(fromExtension, toExtension, checkVersionProperty, true)) {
                updated.add(key);
            }
        }
        return { added, removed, updated };
    }
    function areSame(fromExtension, toExtension, checkVersionProperty, checkInstalledProperty) {
        if (fromExtension.disabled !== toExtension.disabled) {
            /* extension enablement changed */
            return false;
        }
        if (!!fromExtension.isApplicationScoped !== !!toExtension.isApplicationScoped) {
            /* extension application scope has changed */
            return false;
        }
        if (checkInstalledProperty && fromExtension.installed !== toExtension.installed) {
            /* extension installed property changed */
            return false;
        }
        if (fromExtension.installed && toExtension.installed) {
            if (fromExtension.preRelease !== toExtension.preRelease) {
                /* installed extension's pre-release version changed */
                return false;
            }
            if (fromExtension.pinned !== toExtension.pinned) {
                /* installed extension's pinning changed */
                return false;
            }
            if (toExtension.pinned && fromExtension.version !== toExtension.version) {
                /* installed extension's pinned version changed */
                return false;
            }
        }
        if (!isSameExtensionState(fromExtension.state, toExtension.state)) {
            /* extension state changed */
            return false;
        }
        if ((checkVersionProperty && fromExtension.version !== toExtension.version)) {
            /* extension version changed */
            return false;
        }
        return true;
    }
    function mergeExtensionState(localExtension, remoteExtension, lastSyncExtension) {
        const localState = localExtension.state;
        const remoteState = remoteExtension.state;
        const baseState = lastSyncExtension?.state;
        // If remote extension has no version, use local state
        if (!remoteExtension.version) {
            return localState;
        }
        // If local state exists and local extension is latest then use local state
        if (localState && semver.gt(localExtension.version, remoteExtension.version)) {
            return localState;
        }
        // If remote state exists and remote extension is latest, use remote state
        if (remoteState && semver.gt(remoteExtension.version, localExtension.version)) {
            return remoteState;
        }
        /* Remote and local are on same version */
        // If local state is not yet set, use remote state
        if (!localState) {
            return remoteState;
        }
        // If remote state is not yet set, use local state
        if (!remoteState) {
            return localState;
        }
        const mergedState = (0, objects_1.deepClone)(localState);
        const baseToRemote = baseState ? compareExtensionState(baseState, remoteState) : { added: Object.keys(remoteState).reduce((r, k) => { r.add(k); return r; }, new Set()), removed: new Set(), updated: new Set() };
        const baseToLocal = baseState ? compareExtensionState(baseState, localState) : { added: Object.keys(localState).reduce((r, k) => { r.add(k); return r; }, new Set()), removed: new Set(), updated: new Set() };
        // Added/Updated in remote
        for (const key of [...baseToRemote.added.values(), ...baseToRemote.updated.values()]) {
            mergedState[key] = remoteState[key];
        }
        // Removed in remote
        for (const key of baseToRemote.removed.values()) {
            // Not updated in local
            if (!baseToLocal.updated.has(key)) {
                delete mergedState[key];
            }
        }
        return mergedState;
    }
    function compareExtensionState(from, to) {
        const fromKeys = Object.keys(from);
        const toKeys = Object.keys(to);
        const added = toKeys.filter(key => !fromKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
        const removed = fromKeys.filter(key => !toKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
        const updated = new Set();
        for (const key of fromKeys) {
            if (removed.has(key)) {
                continue;
            }
            const value1 = from[key];
            const value2 = to[key];
            if (!(0, objects_1.equals)(value1, value2)) {
                updated.add(key);
            }
        }
        return { added, removed, updated };
    }
    function isSameExtensionState(a = {}, b = {}) {
        const { added, removed, updated } = compareExtensionState(a, b);
        return added.size === 0 && removed.size === 0 && updated.size === 0;
    }
    // massage incoming extension - add optional properties
    function massageIncomingExtension(extension) {
        return { ...extension, ...{ disabled: !!extension.disabled, installed: !!extension.installed } };
    }
    // massage outgoing extension - remove optional properties
    function massageOutgoingExtension(extension, key) {
        const massagedExtension = {
            ...extension,
            identifier: {
                id: extension.identifier.id,
                uuid: key.startsWith('uuid:') ? key.substring('uuid:'.length) : undefined
            },
            /* set following always so that to differentiate with older clients */
            preRelease: !!extension.preRelease,
            pinned: !!extension.pinned,
        };
        if (!extension.disabled) {
            delete massagedExtension.disabled;
        }
        if (!extension.installed) {
            delete massagedExtension.installed;
        }
        if (!extension.state) {
            delete massagedExtension.state;
        }
        if (!extension.isApplicationScoped) {
            delete massagedExtension.isApplicationScoped;
        }
        return massagedExtension;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc01lcmdlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFTeW5jL2NvbW1vbi9leHRlbnNpb25zTWVyZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLFNBQWdCLEtBQUssQ0FBQyxlQUFzQyxFQUFFLGdCQUErQyxFQUFFLGtCQUFpRCxFQUFFLGlCQUFtQyxFQUFFLGlCQUEyQixFQUFFLHlCQUF3RDtRQUMzUixNQUFNLEtBQUssR0FBcUIsRUFBRSxDQUFDO1FBQ25DLE1BQU0sT0FBTyxHQUEyQixFQUFFLENBQUM7UUFDM0MsTUFBTSxPQUFPLEdBQXFCLEVBQUUsQ0FBQztRQUVyQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDdEIsTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzSSxPQUFPO2dCQUNOLEtBQUssRUFBRTtvQkFDTixLQUFLO29CQUNMLE9BQU87b0JBQ1AsT0FBTztpQkFDUDtnQkFDRCxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQixLQUFLLEVBQUUsTUFBTTtvQkFDYixPQUFPLEVBQUUsRUFBRTtvQkFDWCxPQUFPLEVBQUUsRUFBRTtvQkFDWCxHQUFHLEVBQUUsTUFBTTtpQkFDWCxDQUFDLENBQUMsQ0FBQyxJQUFJO2FBQ1IsQ0FBQztTQUNGO1FBRUQsZUFBZSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQTBCLENBQUM7UUFDekYs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