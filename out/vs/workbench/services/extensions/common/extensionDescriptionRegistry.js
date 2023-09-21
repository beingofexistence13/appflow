/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/base/common/event", "vs/base/common/path", "vs/base/common/lifecycle"], function (require, exports, extensions_1, event_1, path, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionDescriptionRegistryLock = exports.LockableExtensionDescriptionRegistry = exports.basicActivationEventsReader = exports.ExtensionDescriptionRegistrySnapshot = exports.ExtensionDescriptionRegistry = exports.DeltaExtensionsResult = void 0;
    class DeltaExtensionsResult {
        constructor(versionId, removedDueToLooping) {
            this.versionId = versionId;
            this.removedDueToLooping = removedDueToLooping;
        }
    }
    exports.DeltaExtensionsResult = DeltaExtensionsResult;
    class ExtensionDescriptionRegistry {
        static isHostExtension(extensionId, myRegistry, globalRegistry) {
            if (myRegistry.getExtensionDescription(extensionId)) {
                // I have this extension
                return false;
            }
            const extensionDescription = globalRegistry.getExtensionDescription(extensionId);
            if (!extensionDescription) {
                // unknown extension
                return false;
            }
            if ((extensionDescription.main || extensionDescription.browser) && extensionDescription.api === 'none') {
                return true;
            }
            return false;
        }
        constructor(_activationEventsReader, extensionDescriptions) {
            this._activationEventsReader = _activationEventsReader;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._versionId = 0;
            this._extensionDescriptions = extensionDescriptions;
            this._initialize();
        }
        _initialize() {
            // Ensure extensions are stored in the order: builtin, user, under development
            this._extensionDescriptions.sort(extensionCmp);
            this._extensionsMap = new extensions_1.ExtensionIdentifierMap();
            this._extensionsArr = [];
            this._activationMap = new Map();
            for (const extensionDescription of this._extensionDescriptions) {
                if (this._extensionsMap.has(extensionDescription.identifier)) {
                    // No overwriting allowed!
                    console.error('Extension `' + extensionDescription.identifier.value + '` is already registered');
                    continue;
                }
                this._extensionsMap.set(extensionDescription.identifier, extensionDescription);
                this._extensionsArr.push(extensionDescription);
                const activationEvents = this._activationEventsReader.readActivationEvents(extensionDescription);
                if (Array.isArray(activationEvents)) {
                    for (let activationEvent of activationEvents) {
                        // TODO@joao: there's no easy way to contribute this
                        if (activationEvent === 'onUri') {
                            activationEvent = `onUri:${extensions_1.ExtensionIdentifier.toKey(extensionDescription.identifier)}`;
                        }
                        if (!this._activationMap.has(activationEvent)) {
                            this._activationMap.set(activationEvent, []);
                        }
                        this._activationMap.get(activationEvent).push(extensionDescription);
                    }
                }
            }
        }
        set(extensionDescriptions) {
            this._extensionDescriptions = extensionDescriptions;
            this._initialize();
            this._versionId++;
            this._onDidChange.fire(undefined);
            return {
                versionId: this._versionId
            };
        }
        deltaExtensions(toAdd, toRemove) {
            // It is possible that an extension is removed, only to be added again at a different version
            // so we will first handle removals
            this._extensionDescriptions = removeExtensions(this._extensionDescriptions, toRemove);
            // Then, handle the extensions to add
            this._extensionDescriptions = this._extensionDescriptions.concat(toAdd);
            // Immediately remove looping extensions!
            const looping = ExtensionDescriptionRegistry._findLoopingExtensions(this._extensionDescriptions);
            this._extensionDescriptions = removeExtensions(this._extensionDescriptions, looping.map(ext => ext.identifier));
            this._initialize();
            this._versionId++;
            this._onDidChange.fire(undefined);
            return new DeltaExtensionsResult(this._versionId, looping);
        }
        static _findLoopingExtensions(extensionDescriptions) {
            const G = new class {
                constructor() {
                    this._arcs = new Map();
                    this._nodesSet = new Set();
                    this._nodesArr = [];
                }
                addNode(id) {
                    if (!this._nodesSet.has(id)) {
                        this._nodesSet.add(id);
                        this._nodesArr.push(id);
                    }
                }
                addArc(from, to) {
                    this.addNode(from);
                    this.addNode(to);
                    if (this._arcs.has(from)) {
                        this._arcs.get(from).push(to);
                    }
                    else {
                        this._arcs.set(from, [to]);
                    }
                }
                getArcs(id) {
                    if (this._arcs.has(id)) {
                        return this._arcs.get(id);
                    }
                    return [];
                }
                hasOnlyGoodArcs(id, good) {
                    const dependencies = G.getArcs(id);
                    for (let i = 0; i < dependencies.length; i++) {
                        if (!good.has(dependencies[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                getNodes() {
                    return this._nodesArr;
                }
            };
            const descs = new extensions_1.ExtensionIdentifierMap();
            for (const extensionDescription of extensionDescriptions) {
                descs.set(extensionDescription.identifier, extensionDescription);
                if (extensionDescription.extensionDependencies) {
                    for (const depId of extensionDescription.extensionDependencies) {
                        G.addArc(extensions_1.ExtensionIdentifier.toKey(extensionDescription.identifier), extensions_1.ExtensionIdentifier.toKey(depId));
                    }
                }
            }
            // initialize with all extensions with no dependencies.
            const good = new Set();
            G.getNodes().filter(id => G.getArcs(id).length === 0).forEach(id => good.add(id));
            // all other extensions will be processed below.
            const nodes = G.getNodes().filter(id => !good.has(id));
            let madeProgress;
            do {
                madeProgress = false;
                // find one extension which has only good deps
                for (let i = 0; i < nodes.length; i++) {
                    const id = nodes[i];
                    if (G.hasOnlyGoodArcs(id, good)) {
                        nodes.splice(i, 1);
                        i--;
                        good.add(id);
                        madeProgress = true;
                    }
                }
            } while (madeProgress);
            // The remaining nodes are bad and have loops
            return nodes.map(id => descs.get(id));
        }
        containsActivationEvent(activationEvent) {
            return this._activationMap.has(activationEvent);
        }
        containsExtension(extensionId) {
            return this._extensionsMap.has(extensionId);
        }
        getExtensionDescriptionsForActivationEvent(activationEvent) {
            const extensions = this._activationMap.get(activationEvent);
            return extensions ? extensions.slice(0) : [];
        }
        getAllExtensionDescriptions() {
            return this._extensionsArr.slice(0);
        }
        getSnapshot() {
            return new ExtensionDescriptionRegistrySnapshot(this._versionId, this.getAllExtensionDescriptions());
        }
        getExtensionDescription(extensionId) {
            const extension = this._extensionsMap.get(extensionId);
            return extension ? extension : undefined;
        }
        getExtensionDescriptionByUUID(uuid) {
            for (const extensionDescription of this._extensionsArr) {
                if (extensionDescription.uuid === uuid) {
                    return extensionDescription;
                }
            }
            return undefined;
        }
        getExtensionDescriptionByIdOrUUID(extensionId, uuid) {
            return (this.getExtensionDescription(extensionId)
                ?? (uuid ? this.getExtensionDescriptionByUUID(uuid) : undefined));
        }
    }
    exports.ExtensionDescriptionRegistry = ExtensionDescriptionRegistry;
    class ExtensionDescriptionRegistrySnapshot {
        constructor(versionId, extensions) {
            this.versionId = versionId;
            this.extensions = extensions;
        }
    }
    exports.ExtensionDescriptionRegistrySnapshot = ExtensionDescriptionRegistrySnapshot;
    exports.basicActivationEventsReader = {
        readActivationEvents: (extensionDescription) => {
            return extensionDescription.activationEvents;
        }
    };
    class LockableExtensionDescriptionRegistry {
        constructor(activationEventsReader) {
            this._lock = new Lock();
            this._actual = new ExtensionDescriptionRegistry(activationEventsReader, []);
        }
        async acquireLock(customerName) {
            const lock = await this._lock.acquire(customerName);
            return new ExtensionDescriptionRegistryLock(this, lock);
        }
        deltaExtensions(acquiredLock, toAdd, toRemove) {
            if (!acquiredLock.isAcquiredFor(this)) {
                throw new Error('Lock is not held');
            }
            return this._actual.deltaExtensions(toAdd, toRemove);
        }
        containsActivationEvent(activationEvent) {
            return this._actual.containsActivationEvent(activationEvent);
        }
        containsExtension(extensionId) {
            return this._actual.containsExtension(extensionId);
        }
        getExtensionDescriptionsForActivationEvent(activationEvent) {
            return this._actual.getExtensionDescriptionsForActivationEvent(activationEvent);
        }
        getAllExtensionDescriptions() {
            return this._actual.getAllExtensionDescriptions();
        }
        getSnapshot() {
            return this._actual.getSnapshot();
        }
        getExtensionDescription(extensionId) {
            return this._actual.getExtensionDescription(extensionId);
        }
        getExtensionDescriptionByUUID(uuid) {
            return this._actual.getExtensionDescriptionByUUID(uuid);
        }
        getExtensionDescriptionByIdOrUUID(extensionId, uuid) {
            return this._actual.getExtensionDescriptionByIdOrUUID(extensionId, uuid);
        }
    }
    exports.LockableExtensionDescriptionRegistry = LockableExtensionDescriptionRegistry;
    class ExtensionDescriptionRegistryLock extends lifecycle_1.Disposable {
        constructor(_registry, lock) {
            super();
            this._registry = _registry;
            this._isDisposed = false;
            this._register(lock);
        }
        isAcquiredFor(registry) {
            return !this._isDisposed && this._registry === registry;
        }
    }
    exports.ExtensionDescriptionRegistryLock = ExtensionDescriptionRegistryLock;
    class LockCustomer {
        constructor(name) {
            this.name = name;
            this.promise = new Promise((resolve, reject) => {
                this._resolve = resolve;
            });
        }
        resolve(value) {
            this._resolve(value);
        }
    }
    class Lock {
        constructor() {
            this._pendingCustomers = [];
            this._isLocked = false;
        }
        async acquire(customerName) {
            const customer = new LockCustomer(customerName);
            this._pendingCustomers.push(customer);
            this._advance();
            return customer.promise;
        }
        _advance() {
            if (this._isLocked) {
                // cannot advance yet
                return;
            }
            if (this._pendingCustomers.length === 0) {
                // no more waiting customers
                return;
            }
            const customer = this._pendingCustomers.shift();
            this._isLocked = true;
            let customerHoldsLock = true;
            const logLongRunningCustomerTimeout = setTimeout(() => {
                if (customerHoldsLock) {
                    console.warn(`The customer named ${customer.name} has been holding on to the lock for 30s. This might be a problem.`);
                }
            }, 30 * 1000 /* 30 seconds */);
            const releaseLock = () => {
                if (!customerHoldsLock) {
                    return;
                }
                clearTimeout(logLongRunningCustomerTimeout);
                customerHoldsLock = false;
                this._isLocked = false;
                this._advance();
            };
            customer.resolve((0, lifecycle_1.toDisposable)(releaseLock));
        }
    }
    var SortBucket;
    (function (SortBucket) {
        SortBucket[SortBucket["Builtin"] = 0] = "Builtin";
        SortBucket[SortBucket["User"] = 1] = "User";
        SortBucket[SortBucket["Dev"] = 2] = "Dev";
    })(SortBucket || (SortBucket = {}));
    /**
     * Ensure that:
     * - first are builtin extensions
     * - second are user extensions
     * - third are extensions under development
     *
     * In each bucket, extensions must be sorted alphabetically by their folder name.
     */
    function extensionCmp(a, b) {
        const aSortBucket = (a.isBuiltin ? 0 /* SortBucket.Builtin */ : a.isUnderDevelopment ? 2 /* SortBucket.Dev */ : 1 /* SortBucket.User */);
        const bSortBucket = (b.isBuiltin ? 0 /* SortBucket.Builtin */ : b.isUnderDevelopment ? 2 /* SortBucket.Dev */ : 1 /* SortBucket.User */);
        if (aSortBucket !== bSortBucket) {
            return aSortBucket - bSortBucket;
        }
        const aLastSegment = path.posix.basename(a.extensionLocation.path);
        const bLastSegment = path.posix.basename(b.extensionLocation.path);
        if (aLastSegment < bLastSegment) {
            return -1;
        }
        if (aLastSegment > bLastSegment) {
            return 1;
        }
        return 0;
    }
    function removeExtensions(arr, toRemove) {
        const toRemoveSet = new extensions_1.ExtensionIdentifierSet(toRemove);
        return arr.filter(extension => !toRemoveSet.has(extension.identifier));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uRGVzY3JpcHRpb25SZWdpc3RyeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2NvbW1vbi9leHRlbnNpb25EZXNjcmlwdGlvblJlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxNQUFhLHFCQUFxQjtRQUNqQyxZQUNpQixTQUFpQixFQUNqQixtQkFBNEM7WUFENUMsY0FBUyxHQUFULFNBQVMsQ0FBUTtZQUNqQix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXlCO1FBQ3pELENBQUM7S0FDTDtJQUxELHNEQUtDO0lBWUQsTUFBYSw0QkFBNEI7UUFFakMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxXQUF5QyxFQUFFLFVBQXdDLEVBQUUsY0FBNEM7WUFDOUosSUFBSSxVQUFVLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ3BELHdCQUF3QjtnQkFDeEIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELE1BQU0sb0JBQW9CLEdBQUcsY0FBYyxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2pGLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtnQkFDMUIsb0JBQW9CO2dCQUNwQixPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksSUFBSSxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxHQUFHLEtBQUssTUFBTSxFQUFFO2dCQUN2RyxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBV0QsWUFDa0IsdUJBQWdELEVBQ2pFLHFCQUE4QztZQUQ3Qiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1lBVmpELGlCQUFZLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FB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