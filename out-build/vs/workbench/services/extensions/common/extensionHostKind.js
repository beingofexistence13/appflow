/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensions/common/extensions"], function (require, exports, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FF = exports.$EF = exports.ExtensionRunningPreference = exports.$DF = exports.ExtensionHostKind = void 0;
    var ExtensionHostKind;
    (function (ExtensionHostKind) {
        ExtensionHostKind[ExtensionHostKind["LocalProcess"] = 1] = "LocalProcess";
        ExtensionHostKind[ExtensionHostKind["LocalWebWorker"] = 2] = "LocalWebWorker";
        ExtensionHostKind[ExtensionHostKind["Remote"] = 3] = "Remote";
    })(ExtensionHostKind || (exports.ExtensionHostKind = ExtensionHostKind = {}));
    function $DF(kind) {
        if (kind === null) {
            return 'None';
        }
        switch (kind) {
            case 1 /* ExtensionHostKind.LocalProcess */: return 'LocalProcess';
            case 2 /* ExtensionHostKind.LocalWebWorker */: return 'LocalWebWorker';
            case 3 /* ExtensionHostKind.Remote */: return 'Remote';
        }
    }
    exports.$DF = $DF;
    var ExtensionRunningPreference;
    (function (ExtensionRunningPreference) {
        ExtensionRunningPreference[ExtensionRunningPreference["None"] = 0] = "None";
        ExtensionRunningPreference[ExtensionRunningPreference["Local"] = 1] = "Local";
        ExtensionRunningPreference[ExtensionRunningPreference["Remote"] = 2] = "Remote";
    })(ExtensionRunningPreference || (exports.ExtensionRunningPreference = ExtensionRunningPreference = {}));
    function $EF(preference) {
        switch (preference) {
            case 0 /* ExtensionRunningPreference.None */:
                return 'None';
            case 1 /* ExtensionRunningPreference.Local */:
                return 'Local';
            case 2 /* ExtensionRunningPreference.Remote */:
                return 'Remote';
        }
    }
    exports.$EF = $EF;
    function $FF(_localExtensions, _remoteExtensions, getExtensionKind, pickExtensionHostKind) {
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
    exports.$FF = $FF;
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
            return extensions_1.$Vl.toKey(this.desc.identifier);
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
//# sourceMappingURL=extensionHostKind.js.map