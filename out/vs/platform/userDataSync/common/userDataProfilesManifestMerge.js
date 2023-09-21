/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects"], function (require, exports, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.merge = void 0;
    function merge(local, remote, lastSync, ignored) {
        const localResult = { added: [], removed: [], updated: [] };
        let remoteResult = { added: [], removed: [], updated: [] };
        if (!remote) {
            const added = local.filter(({ id }) => !ignored.includes(id));
            if (added.length) {
                remoteResult.added = added;
            }
            else {
                remoteResult = null;
            }
            return {
                local: localResult,
                remote: remoteResult
            };
        }
        const localToRemote = compare(local, remote, ignored);
        if (localToRemote.added.length > 0 || localToRemote.removed.length > 0 || localToRemote.updated.length > 0) {
            const baseToLocal = compare(lastSync, local, ignored);
            const baseToRemote = compare(lastSync, remote, ignored);
            // Remotely removed profiles
            for (const id of baseToRemote.removed) {
                const e = local.find(profile => profile.id === id);
                if (e) {
                    localResult.removed.push(e);
                }
            }
            // Remotely added profiles
            for (const id of baseToRemote.added) {
                const remoteProfile = remote.find(profile => profile.id === id);
                // Got added in local
                if (baseToLocal.added.includes(id)) {
                    // Is different from local to remote
                    if (localToRemote.updated.includes(id)) {
                        // Remote wins always
                        localResult.updated.push(remoteProfile);
                    }
                }
                else {
                    localResult.added.push(remoteProfile);
                }
            }
            // Remotely updated profiles
            for (const id of baseToRemote.updated) {
                // Remote wins always
                localResult.updated.push(remote.find(profile => profile.id === id));
            }
            // Locally added profiles
            for (const id of baseToLocal.added) {
                // Not there in remote
                if (!baseToRemote.added.includes(id)) {
                    remoteResult.added.push(local.find(profile => profile.id === id));
                }
            }
            // Locally updated profiles
            for (const id of baseToLocal.updated) {
                // If removed in remote
                if (baseToRemote.removed.includes(id)) {
                    continue;
                }
                // If not updated in remote
                if (!baseToRemote.updated.includes(id)) {
                    remoteResult.updated.push(local.find(profile => profile.id === id));
                }
            }
            // Locally removed profiles
            for (const id of baseToLocal.removed) {
                const removedProfile = remote.find(profile => profile.id === id);
                if (removedProfile) {
                    remoteResult.removed.push(removedProfile);
                }
            }
        }
        if (remoteResult.added.length === 0 && remoteResult.removed.length === 0 && remoteResult.updated.length === 0) {
            remoteResult = null;
        }
        return { local: localResult, remote: remoteResult };
    }
    exports.merge = merge;
    function compare(from, to, ignoredProfiles) {
        from = from ? from.filter(({ id }) => !ignoredProfiles.includes(id)) : [];
        to = to.filter(({ id }) => !ignoredProfiles.includes(id));
        const fromKeys = from.map(({ id }) => id);
        const toKeys = to.map(({ id }) => id);
        const added = toKeys.filter(key => !fromKeys.includes(key));
        const removed = fromKeys.filter(key => !toKeys.includes(key));
        const updated = [];
        for (const { id, name, shortName, useDefaultFlags } of from) {
            if (removed.includes(id)) {
                continue;
            }
            const toProfile = to.find(p => p.id === id);
            if (!toProfile
                || toProfile.name !== name
                || toProfile.shortName !== shortName
                || !(0, objects_1.equals)(toProfile.useDefaultFlags, useDefaultFlags)) {
                updated.push(id);
            }
        }
        return { added, removed, updated };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlc01hbmlmZXN0TWVyZ2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvY29tbW9uL3VzZXJEYXRhUHJvZmlsZXNNYW5pZmVzdE1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW9CaEcsU0FBZ0IsS0FBSyxDQUFDLEtBQXlCLEVBQUUsTUFBcUMsRUFBRSxRQUF1QyxFQUFFLE9BQWlCO1FBQ2pKLE1BQU0sV0FBVyxHQUFvRyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDN0osSUFBSSxZQUFZLEdBQXVHLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUUvSixJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1osTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlELElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFDakIsWUFBWSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7YUFDM0I7aUJBQU07Z0JBQ04sWUFBWSxHQUFHLElBQUksQ0FBQzthQUNwQjtZQUNELE9BQU87Z0JBQ04sS0FBSyxFQUFFLFdBQVc7Z0JBQ2xCLE1BQU0sRUFBRSxZQUFZO2FBQ3BCLENBQUM7U0FDRjtRQUVELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcs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