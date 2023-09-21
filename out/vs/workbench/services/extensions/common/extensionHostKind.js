/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensions/common/extensions"], function (require, exports, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.determineExtensionHostKinds = exports.extensionRunningPreferenceToString = exports.ExtensionRunningPreference = exports.extensionHostKindToString = exports.ExtensionHostKind = void 0;
    var ExtensionHostKind;
    (function (ExtensionHostKind) {
        ExtensionHostKind[ExtensionHostKind["LocalProcess"] = 1] = "LocalProcess";
        ExtensionHostKind[ExtensionHostKind["LocalWebWorker"] = 2] = "LocalWebWorker";
        ExtensionHostKind[ExtensionHostKind["Remote"] = 3] = "Remote";
    })(ExtensionHostKind || (exports.ExtensionHostKind = ExtensionHostKind = {}));
    function extensionHostKindToString(kind) {
        if (kind === null) {
            return 'None';
        }
        switch (kind) {
            case 1 /* ExtensionHostKind.LocalProcess */: return 'LocalProcess';
            case 2 /* ExtensionHostKind.LocalWebWorker */: return 'LocalWebWorker';
            case 3 /* ExtensionHostKind.Remote */: return 'Remote';
        }
    }
    exports.extensionHostKindToString = extensionHostKindToString;
    var ExtensionRunningPreference;
    (function (ExtensionRunningPreference) {
        ExtensionRunningPreference[ExtensionRunningPreference["None"] = 0] = "None";
        ExtensionRunningPreference[ExtensionRunningPreference["Local"] = 1] = "Local";
        ExtensionRunningPreference[ExtensionRunningPreference["Remote"] = 2] = "Remote";
    })(ExtensionRunningPreference || (exports.ExtensionRunningPreference = ExtensionRunningPreference = {}));
    function extensionRunningPreferenceToString(preference) {
        switch (preference) {
            case 0 /* ExtensionRunningPreference.None */:
                return 'None';
            case 1 /* ExtensionRunningPreference.Local */:
                return 'Local';
            case 2 /* ExtensionRunningPreference.Remote */:
                return 'Remote';
        }
    }
    exports.extensionRunningPreferenceToString = extensionRunningPreferenceToString;
    function determineExtensionHostKinds(_localExtensions, _remoteExtensions, getExtensionKind, pickExtensionHostKind) {
        const localExtensions = toExtensionWithKind(_localExtensions, getExtensionKind);
        const remoteExtensions = toExtensionWithKind(_remoteExtensions, getExtensionKind);
        const allExtensions = new Map();
        const collectExtension = (ext) => {
            if (allExtensions.has(ext.key)) {
                return;
            }
            const local = localExtensions.get(ext.key) || null;
            const remote = remoteExtensions.get(ext.key) || null;
            const info = new ExtensionInfo(local, remote);
            allExtensions.set(info.key, info);
        };
        localExtensions.forEach((ext) => collectExtension(ext));
        remoteExtensions.forEach((ext) => collectExtension(ext));
        const extensionHostKinds = new Map();
        allExtensions.forEach((ext) => {
            const isInstalledLocally = Boolean(ext.local);
            const isInstalledRemotely = Boolean(ext.remote);
            const isLocallyUnderDevelopment = Boolean(ext.local && ext.local.isUnderDevelopment);
            const isRemotelyUnderDevelopment = Boolean(ext.remote && ext.remote.isUnderDevelopment);
            let preference = 0 /* ExtensionRunningPreference.None */;
            if (isLocallyUnderDevelopment && !isRemotelyUnderDevelopment) {
                preference = 1 /* ExtensionRunningPreference.Local */;
            }
            else if (isRemotelyUnderDevelopment && !isLocallyUnderDevelopment) {
                preference = 2 /* ExtensionRunningPreference.Remote */;
            }
            extensionHostKinds.set(ext.key, pickExtensionHostKind(ext.identifier, ext.kind, isInstalledLocally, isInstalledRemotely, preference));
        });
        return extensionHostKinds;
    }
    exports.determineExtensionHostKinds = determineExtensionHostKinds;
    function toExtensionWithKind(extensions, getExtensionKind) {
        const result = new Map();
        extensions.forEach((desc) => {
            const ext = new ExtensionWithKind(desc, getExtensionKind(desc));
            result.set(ext.key, ext);
        });
        return result;
    }
    class ExtensionWithKind {
        constructor(desc, kind) {
            this.desc = desc;
            this.kind = kind;
        }
        get key() {
            return extensions_1.ExtensionIdentifier.toKey(this.desc.identifier);
        }
        get isUnderDevelopment() {
            return this.desc.isUnderDevelopment;
        }
    }
    class ExtensionInfo {
        constructor(local, remote) {
            this.local = local;
            this.remote = remote;
        }
        get key() {
            if (this.local) {
                return this.local.key;
            }
            return this.remote.key;
        }
        get identifier() {
            if (this.local) {
                return this.local.desc.identifier;
            }
            return this.remote.desc.identifier;
        }
        get kind() {
            // in case of disagreements between extension kinds, it is always
            // better to pick the local extension because it has a much higher
            // chance of being up-to-date
            if (this.local) {
                return this.local.kind;
            }
            return this.remote.kind;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdEtpbmQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9ucy9jb21tb24vZXh0ZW5zaW9uSG9zdEtpbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLElBQWtCLGlCQUlqQjtJQUpELFdBQWtCLGlCQUFpQjtRQUNsQyx5RUFBZ0IsQ0FBQTtRQUNoQiw2RUFBa0IsQ0FBQTtRQUNsQiw2REFBVSxDQUFBO0lBQ1gsQ0FBQyxFQUppQixpQkFBaUIsaUNBQWpCLGlCQUFpQixRQUlsQztJQUVELFNBQWdCLHlCQUF5QixDQUFDLElBQThCO1FBQ3ZFLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtZQUNsQixPQUFPLE1BQU0sQ0FBQztTQUNkO1FBQ0QsUUFBUSxJQUFJLEVBQUU7WUFDYiwyQ0FBbUMsQ0FBQyxDQUFDLE9BQU8sY0FBYyxDQUFDO1lBQzNELDZDQUFxQyxDQUFDLENBQUMsT0FBTyxnQkFBZ0IsQ0FBQztZQUMvRCxxQ0FBNkIsQ0FBQyxDQUFDLE9BQU8sUUFBUSxDQUFDO1NBQy9DO0lBQ0YsQ0FBQztJQVRELDhEQVNDO0lBRUQsSUFBa0IsMEJBSWpCO0lBSkQsV0FBa0IsMEJBQTBCO1FBQzNDLDJFQUFJLENBQUE7UUFDSiw2RUFBSyxDQUFBO1FBQ0wsK0VBQU0sQ0FBQTtJQUNQLENBQUMsRUFKaUIsMEJBQTBCLDBDQUExQiwwQkFBMEIsUUFJM0M7SUFFRCxTQUFnQixrQ0FBa0MsQ0FBQyxVQUFzQztRQUN4RixRQUFRLFVBQVUsRUFBRTtZQUNuQjtnQkFDQyxPQUFPLE1BQU0sQ0FBQztZQUNmO2dCQUNDLE9BQU8sT0FBTyxDQUFDO1lBQ2hCO2dCQUNDLE9BQU8sUUFBUSxDQUFDO1NBQ2pCO0lBQ0YsQ0FBQztJQVRELGdGQVNDO0lBTUQsU0FBZ0IsMkJBQTJCLENBQzFDLGdCQUF5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