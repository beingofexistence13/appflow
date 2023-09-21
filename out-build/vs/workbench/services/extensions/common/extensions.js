/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/uri", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionManagement/common/implicitActivationEvents", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, uri_1, extensionManagementUtil_1, implicitActivationEvents_1, extensions_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$VF = exports.$UF = exports.$TF = exports.ActivationKind = exports.$SF = exports.$RF = exports.$QF = exports.$PF = exports.$OF = exports.ExtensionHostStartup = exports.$NF = exports.$MF = exports.$LF = exports.$KF = void 0;
    exports.$KF = Object.freeze({
        identifier: new extensions_1.$Vl('nullExtensionDescription'),
        name: 'Null Extension Description',
        version: '0.0.0',
        publisher: 'vscode',
        engines: { vscode: '' },
        extensionLocation: uri_1.URI.parse('void:location'),
        isBuiltin: false,
        targetPlatform: "undefined" /* TargetPlatform.UNDEFINED */,
        isUserBuiltin: false,
        isUnderDevelopment: false,
    });
    exports.$LF = 'extensions.webWorker';
    exports.$MF = (0, instantiation_1.$Bh)('extensionService');
    class $NF {
        constructor(dependency) {
            this.dependency = dependency;
        }
    }
    exports.$NF = $NF;
    var ExtensionHostStartup;
    (function (ExtensionHostStartup) {
        /**
         * The extension host should be launched immediately and doesn't require a `$startExtensionHost` call.
         */
        ExtensionHostStartup[ExtensionHostStartup["EagerAutoStart"] = 1] = "EagerAutoStart";
        /**
         * The extension host should be launched immediately and needs a `$startExtensionHost` call.
         */
        ExtensionHostStartup[ExtensionHostStartup["EagerManualStart"] = 2] = "EagerManualStart";
        /**
         * The extension host should be launched lazily and only when it has extensions it needs to host. It needs a `$startExtensionHost` call.
         */
        ExtensionHostStartup[ExtensionHostStartup["Lazy"] = 3] = "Lazy";
    })(ExtensionHostStartup || (exports.ExtensionHostStartup = ExtensionHostStartup = {}));
    class $OF {
        get versionId() {
            return this.c;
        }
        get allExtensions() {
            return this.d;
        }
        get myExtensions() {
            return this.e;
        }
        constructor(versionId, allExtensions, myExtensions) {
            this.c = versionId;
            this.d = allExtensions.slice(0);
            this.e = myExtensions.slice(0);
        }
        toSnapshot() {
            return {
                versionId: this.c,
                allExtensions: this.d,
                myExtensions: this.e,
                activationEvents: implicitActivationEvents_1.$BF.createActivationEventsMap(this.d)
            };
        }
        set(versionId, allExtensions, myExtensions) {
            if (this.c > versionId) {
                throw new Error(`ExtensionHostExtensions: invalid versionId ${versionId} (current: ${this.c})`);
            }
            const toRemove = [];
            const toAdd = [];
            const myToRemove = [];
            const myToAdd = [];
            const oldExtensionsMap = extensionDescriptionArrayToMap(this.d);
            const newExtensionsMap = extensionDescriptionArrayToMap(allExtensions);
            const extensionsAreTheSame = (a, b) => {
                return ((a.extensionLocation.toString() === b.extensionLocation.toString())
                    || (a.isBuiltin === b.isBuiltin)
                    || (a.isUserBuiltin === b.isUserBuiltin)
                    || (a.isUnderDevelopment === b.isUnderDevelopment));
            };
            for (const oldExtension of this.d) {
                const newExtension = newExtensionsMap.get(oldExtension.identifier);
                if (!newExtension) {
                    toRemove.push(oldExtension.identifier);
                    oldExtensionsMap.delete(oldExtension.identifier);
                    continue;
                }
                if (!extensionsAreTheSame(oldExtension, newExtension)) {
                    // The new extension is different than the old one
                    // (e.g. maybe it executes in a different location)
                    toRemove.push(oldExtension.identifier);
                    oldExtensionsMap.delete(oldExtension.identifier);
                    continue;
                }
            }
            for (const newExtension of allExtensions) {
                const oldExtension = oldExtensionsMap.get(newExtension.identifier);
                if (!oldExtension) {
                    toAdd.push(newExtension);
                    continue;
                }
                if (!extensionsAreTheSame(oldExtension, newExtension)) {
                    // The new extension is different than the old one
                    // (e.g. maybe it executes in a different location)
                    toRemove.push(oldExtension.identifier);
                    oldExtensionsMap.delete(oldExtension.identifier);
                    continue;
                }
            }
            const myOldExtensionsSet = new extensions_1.$Wl(this.e);
            const myNewExtensionsSet = new extensions_1.$Wl(myExtensions);
            for (const oldExtensionId of this.e) {
                if (!myNewExtensionsSet.has(oldExtensionId)) {
                    myToRemove.push(oldExtensionId);
                }
            }
            for (const newExtensionId of myExtensions) {
                if (!myOldExtensionsSet.has(newExtensionId)) {
                    myToAdd.push(newExtensionId);
                }
            }
            const addActivationEvents = implicitActivationEvents_1.$BF.createActivationEventsMap(toAdd);
            const delta = { versionId, toRemove, toAdd, addActivationEvents, myToRemove, myToAdd };
            this.delta(delta);
            return delta;
        }
        delta(extensionsDelta) {
            if (this.c >= extensionsDelta.versionId) {
                // ignore older deltas
                return null;
            }
            const { toRemove, toAdd, myToRemove, myToAdd } = extensionsDelta;
            // First handle removals
            const toRemoveSet = new extensions_1.$Wl(toRemove);
            const myToRemoveSet = new extensions_1.$Wl(myToRemove);
            for (let i = 0; i < this.d.length; i++) {
                if (toRemoveSet.has(this.d[i].identifier)) {
                    this.d.splice(i, 1);
                    i--;
                }
            }
            for (let i = 0; i < this.e.length; i++) {
                if (myToRemoveSet.has(this.e[i])) {
                    this.e.splice(i, 1);
                    i--;
                }
            }
            // Then handle additions
            for (const extension of toAdd) {
                this.d.push(extension);
            }
            for (const extensionId of myToAdd) {
                this.e.push(extensionId);
            }
            return extensionsDelta;
        }
        containsExtension(extensionId) {
            for (const myExtensionId of this.e) {
                if (extensions_1.$Vl.equals(myExtensionId, extensionId)) {
                    return true;
                }
            }
            return false;
        }
    }
    exports.$OF = $OF;
    function extensionDescriptionArrayToMap(extensions) {
        const result = new extensions_1.$Xl();
        for (const extension of extensions) {
            result.set(extension.identifier, extension);
        }
        return result;
    }
    function $PF(extension, proposal) {
        if (!extension.enabledApiProposals) {
            return false;
        }
        return extension.enabledApiProposals.includes(proposal);
    }
    exports.$PF = $PF;
    function $QF(extension, proposal) {
        if (!$PF(extension, proposal)) {
            throw new Error(`Extension '${extension.identifier.value}' CANNOT use API proposal: ${proposal}.\nIts package.json#enabledApiProposals-property declares: ${extension.enabledApiProposals?.join(', ') ?? '[]'} but NOT ${proposal}.\n The missing proposal MUST be added and you must start in extension development mode or use the following command line switch: --enable-proposed-api ${extension.identifier.value}`);
        }
    }
    exports.$QF = $QF;
    class $RF {
        constructor(codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
            this.codeLoadingTime = codeLoadingTime;
            this.activateCallTime = activateCallTime;
            this.activateResolvedTime = activateResolvedTime;
            this.activationReason = activationReason;
        }
    }
    exports.$RF = $RF;
    class $SF {
        constructor(description, value) {
            this.description = description;
            this.value = value;
        }
    }
    exports.$SF = $SF;
    var ActivationKind;
    (function (ActivationKind) {
        ActivationKind[ActivationKind["Normal"] = 0] = "Normal";
        ActivationKind[ActivationKind["Immediate"] = 1] = "Immediate";
    })(ActivationKind || (exports.ActivationKind = ActivationKind = {}));
    function $TF(extensionDescription) {
        return {
            type: extensionDescription.isBuiltin ? 0 /* ExtensionType.System */ : 1 /* ExtensionType.User */,
            isBuiltin: extensionDescription.isBuiltin || extensionDescription.isUserBuiltin,
            identifier: { id: (0, extensionManagementUtil_1.$uo)(extensionDescription.publisher, extensionDescription.name), uuid: extensionDescription.uuid },
            manifest: extensionDescription,
            location: extensionDescription.extensionLocation,
            targetPlatform: extensionDescription.targetPlatform,
            validations: [],
            isValid: true
        };
    }
    exports.$TF = $TF;
    function $UF(extension, isUnderDevelopment) {
        return {
            identifier: new extensions_1.$Vl((0, extensionManagementUtil_1.$so)(extension.manifest.publisher, extension.manifest.name)),
            isBuiltin: extension.type === 0 /* ExtensionType.System */,
            isUserBuiltin: extension.type === 1 /* ExtensionType.User */ && extension.isBuiltin,
            isUnderDevelopment: !!isUnderDevelopment,
            extensionLocation: extension.location,
            ...extension.manifest,
            uuid: extension.identifier.uuid,
            targetPlatform: extension.targetPlatform
        };
    }
    exports.$UF = $UF;
    class $VF {
        constructor() {
            this.onDidRegisterExtensions = event_1.Event.None;
            this.onDidChangeExtensionsStatus = event_1.Event.None;
            this.onDidChangeExtensions = event_1.Event.None;
            this.onWillActivateByEvent = event_1.Event.None;
            this.onDidChangeResponsiveChange = event_1.Event.None;
            this.onWillStop = event_1.Event.None;
            this.extensions = [];
        }
        activateByEvent(_activationEvent) { return Promise.resolve(undefined); }
        activationEventIsDone(_activationEvent) { return false; }
        whenInstalledExtensionsRegistered() { return Promise.resolve(true); }
        getExtension() { return Promise.resolve(undefined); }
        readExtensionPointContributions(_extPoint) { return Promise.resolve(Object.create(null)); }
        getExtensionsStatus() { return Object.create(null); }
        getInspectPorts(_extensionHostKind, _tryEnableInspector) { return Promise.resolve([]); }
        stopExtensionHosts() { }
        async startExtensionHosts() { }
        async setRemoteEnvironment(_env) { }
        canAddExtension() { return false; }
        canRemoveExtension() { return false; }
    }
    exports.$VF = $VF;
});
//# sourceMappingURL=extensions.js.map