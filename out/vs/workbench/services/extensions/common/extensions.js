/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/uri", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionManagement/common/implicitActivationEvents", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, uri_1, extensionManagementUtil_1, implicitActivationEvents_1, extensions_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NullExtensionService = exports.toExtensionDescription = exports.toExtension = exports.ActivationKind = exports.ExtensionPointContribution = exports.ActivationTimes = exports.checkProposedApiEnabled = exports.isProposedApiEnabled = exports.ExtensionHostExtensions = exports.ExtensionHostStartup = exports.MissingExtensionDependency = exports.IExtensionService = exports.webWorkerExtHostConfig = exports.nullExtensionDescription = void 0;
    exports.nullExtensionDescription = Object.freeze({
        identifier: new extensions_1.ExtensionIdentifier('nullExtensionDescription'),
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
    exports.webWorkerExtHostConfig = 'extensions.webWorker';
    exports.IExtensionService = (0, instantiation_1.createDecorator)('extensionService');
    class MissingExtensionDependency {
        constructor(dependency) {
            this.dependency = dependency;
        }
    }
    exports.MissingExtensionDependency = MissingExtensionDependency;
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
    class ExtensionHostExtensions {
        get versionId() {
            return this._versionId;
        }
        get allExtensions() {
            return this._allExtensions;
        }
        get myExtensions() {
            return this._myExtensions;
        }
        constructor(versionId, allExtensions, myExtensions) {
            this._versionId = versionId;
            this._allExtensions = allExtensions.slice(0);
            this._myExtensions = myExtensions.slice(0);
        }
        toSnapshot() {
            return {
                versionId: this._versionId,
                allExtensions: this._allExtensions,
                myExtensions: this._myExtensions,
                activationEvents: implicitActivationEvents_1.ImplicitActivationEvents.createActivationEventsMap(this._allExtensions)
            };
        }
        set(versionId, allExtensions, myExtensions) {
            if (this._versionId > versionId) {
                throw new Error(`ExtensionHostExtensions: invalid versionId ${versionId} (current: ${this._versionId})`);
            }
            const toRemove = [];
            const toAdd = [];
            const myToRemove = [];
            const myToAdd = [];
            const oldExtensionsMap = extensionDescriptionArrayToMap(this._allExtensions);
            const newExtensionsMap = extensionDescriptionArrayToMap(allExtensions);
            const extensionsAreTheSame = (a, b) => {
                return ((a.extensionLocation.toString() === b.extensionLocation.toString())
                    || (a.isBuiltin === b.isBuiltin)
                    || (a.isUserBuiltin === b.isUserBuiltin)
                    || (a.isUnderDevelopment === b.isUnderDevelopment));
            };
            for (const oldExtension of this._allExtensions) {
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
            const myOldExtensionsSet = new extensions_1.ExtensionIdentifierSet(this._myExtensions);
            const myNewExtensionsSet = new extensions_1.ExtensionIdentifierSet(myExtensions);
            for (const oldExtensionId of this._myExtensions) {
                if (!myNewExtensionsSet.has(oldExtensionId)) {
                    myToRemove.push(oldExtensionId);
                }
            }
            for (const newExtensionId of myExtensions) {
                if (!myOldExtensionsSet.has(newExtensionId)) {
                    myToAdd.push(newExtensionId);
                }
            }
            const addActivationEvents = implicitActivationEvents_1.ImplicitActivationEvents.createActivationEventsMap(toAdd);
            const delta = { versionId, toRemove, toAdd, addActivationEvents, myToRemove, myToAdd };
            this.delta(delta);
            return delta;
        }
        delta(extensionsDelta) {
            if (this._versionId >= extensionsDelta.versionId) {
                // ignore older deltas
                return null;
            }
            const { toRemove, toAdd, myToRemove, myToAdd } = extensionsDelta;
            // First handle removals
            const toRemoveSet = new extensions_1.ExtensionIdentifierSet(toRemove);
            const myToRemoveSet = new extensions_1.ExtensionIdentifierSet(myToRemove);
            for (let i = 0; i < this._allExtensions.length; i++) {
                if (toRemoveSet.has(this._allExtensions[i].identifier)) {
                    this._allExtensions.splice(i, 1);
                    i--;
                }
            }
            for (let i = 0; i < this._myExtensions.length; i++) {
                if (myToRemoveSet.has(this._myExtensions[i])) {
                    this._myExtensions.splice(i, 1);
                    i--;
                }
            }
            // Then handle additions
            for (const extension of toAdd) {
                this._allExtensions.push(extension);
            }
            for (const extensionId of myToAdd) {
                this._myExtensions.push(extensionId);
            }
            return extensionsDelta;
        }
        containsExtension(extensionId) {
            for (const myExtensionId of this._myExtensions) {
                if (extensions_1.ExtensionIdentifier.equals(myExtensionId, extensionId)) {
                    return true;
                }
            }
            return false;
        }
    }
    exports.ExtensionHostExtensions = ExtensionHostExtensions;
    function extensionDescriptionArrayToMap(extensions) {
        const result = new extensions_1.ExtensionIdentifierMap();
        for (const extension of extensions) {
            result.set(extension.identifier, extension);
        }
        return result;
    }
    function isProposedApiEnabled(extension, proposal) {
        if (!extension.enabledApiProposals) {
            return false;
        }
        return extension.enabledApiProposals.includes(proposal);
    }
    exports.isProposedApiEnabled = isProposedApiEnabled;
    function checkProposedApiEnabled(extension, proposal) {
        if (!isProposedApiEnabled(extension, proposal)) {
            throw new Error(`Extension '${extension.identifier.value}' CANNOT use API proposal: ${proposal}.\nIts package.json#enabledApiProposals-property declares: ${extension.enabledApiProposals?.join(', ') ?? '[]'} but NOT ${proposal}.\n The missing proposal MUST be added and you must start in extension development mode or use the following command line switch: --enable-proposed-api ${extension.identifier.value}`);
        }
    }
    exports.checkProposedApiEnabled = checkProposedApiEnabled;
    class ActivationTimes {
        constructor(codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
            this.codeLoadingTime = codeLoadingTime;
            this.activateCallTime = activateCallTime;
            this.activateResolvedTime = activateResolvedTime;
            this.activationReason = activationReason;
        }
    }
    exports.ActivationTimes = ActivationTimes;
    class ExtensionPointContribution {
        constructor(description, value) {
            this.description = description;
            this.value = value;
        }
    }
    exports.ExtensionPointContribution = ExtensionPointContribution;
    var ActivationKind;
    (function (ActivationKind) {
        ActivationKind[ActivationKind["Normal"] = 0] = "Normal";
        ActivationKind[ActivationKind["Immediate"] = 1] = "Immediate";
    })(ActivationKind || (exports.ActivationKind = ActivationKind = {}));
    function toExtension(extensionDescription) {
        return {
            type: extensionDescription.isBuiltin ? 0 /* ExtensionType.System */ : 1 /* ExtensionType.User */,
            isBuiltin: extensionDescription.isBuiltin || extensionDescription.isUserBuiltin,
            identifier: { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(extensionDescription.publisher, extensionDescription.name), uuid: extensionDescription.uuid },
            manifest: extensionDescription,
            location: extensionDescription.extensionLocation,
            targetPlatform: extensionDescription.targetPlatform,
            validations: [],
            isValid: true
        };
    }
    exports.toExtension = toExtension;
    function toExtensionDescription(extension, isUnderDevelopment) {
        return {
            identifier: new extensions_1.ExtensionIdentifier((0, extensionManagementUtil_1.getExtensionId)(extension.manifest.publisher, extension.manifest.name)),
            isBuiltin: extension.type === 0 /* ExtensionType.System */,
            isUserBuiltin: extension.type === 1 /* ExtensionType.User */ && extension.isBuiltin,
            isUnderDevelopment: !!isUnderDevelopment,
            extensionLocation: extension.location,
            ...extension.manifest,
            uuid: extension.identifier.uuid,
            targetPlatform: extension.targetPlatform
        };
    }
    exports.toExtensionDescription = toExtensionDescription;
    class NullExtensionService {
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
    exports.NullExtensionService = NullExtensionService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2NvbW1vbi9leHRlbnNpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlCbkYsUUFBQSx3QkFBd0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUF3QjtRQUM1RSxVQUFVLEVBQUUsSUFBSSxnQ0FBbUIsQ0FBQywwQkFBMEIsQ0FBQztRQUMvRCxJQUFJLEVBQUUsNEJBQTRCO1FBQ2xDLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLFNBQVMsRUFBRSxRQUFRO1FBQ25CLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7UUFDdkIsaUJBQWlCLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7UUFDN0MsU0FBUyxFQUFFLEtBQUs7UUFDaEIsY0FBYyw0Q0FBMEI7UUFDeEMsYUFBYSxFQUFFLEtBQUs7UUFDcEIsa0JBQWtCLEVBQUUsS0FBSztLQUN6QixDQUFDLENBQUM7SUFHVSxRQUFBLHNCQUFzQixHQUFHLHNCQUFzQixDQUFDO0lBRWhELFFBQUEsaUJBQWlCLEdBQUcsSUFBQSwrQkFBZSxFQUFvQixrQkFBa0IsQ0FBQyxDQUFDO0lBa0J4RixNQUFhLDBCQUEwQjtRQUN0QyxZQUFxQixVQUFrQjtZQUFsQixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQUksQ0FBQztLQUM1QztJQUZELGdFQUVDO0lBMENELElBQWtCLG9CQWFqQjtJQWJELFdBQWtCLG9CQUFvQjtRQUNyQzs7V0FFRztRQUNILG1GQUFrQixDQUFBO1FBQ2xCOztXQUVHO1FBQ0gsdUZBQW9CLENBQUE7UUFDcEI7O1dBRUc7UUFDSCwrREFBUSxDQUFBO0lBQ1QsQ0FBQyxFQWJpQixvQkFBb0Isb0NBQXBCLG9CQUFvQixRQWFyQztJQW9CRCxNQUFhLHVCQUF1QjtR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