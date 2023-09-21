/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/base/common/event", "vs/base/common/path", "vs/base/common/lifecycle"], function (require, exports, extensions_1, event_1, path, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$C3b = exports.$B3b = exports.$A3b = exports.$z3b = exports.$y3b = exports.$x3b = void 0;
    class $x3b {
        constructor(versionId, removedDueToLooping) {
            this.versionId = versionId;
            this.removedDueToLooping = removedDueToLooping;
        }
    }
    exports.$x3b = $x3b;
    class $y3b {
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
        constructor(j, extensionDescriptions) {
            this.j = j;
            this.c = new event_1.$fd();
            this.onDidChange = this.c.event;
            this.d = 0;
            this.e = extensionDescriptions;
            this.k();
        }
        k() {
            // Ensure extensions are stored in the order: builtin, user, under development
            this.e.sort(extensionCmp);
            this.f = new extensions_1.$Xl();
            this.g = [];
            this.h = new Map();
            for (const extensionDescription of this.e) {
                if (this.f.has(extensionDescription.identifier)) {
                    // No overwriting allowed!
                    console.error('Extension `' + extensionDescription.identifier.value + '` is already registered');
                    continue;
                }
                this.f.set(extensionDescription.identifier, extensionDescription);
                this.g.push(extensionDescription);
                const activationEvents = this.j.readActivationEvents(extensionDescription);
                if (Array.isArray(activationEvents)) {
                    for (let activationEvent of activationEvents) {
                        // TODO@joao: there's no easy way to contribute this
                        if (activationEvent === 'onUri') {
                            activationEvent = `onUri:${extensions_1.$Vl.toKey(extensionDescription.identifier)}`;
                        }
                        if (!this.h.has(activationEvent)) {
                            this.h.set(activationEvent, []);
                        }
                        this.h.get(activationEvent).push(extensionDescription);
                    }
                }
            }
        }
        set(extensionDescriptions) {
            this.e = extensionDescriptions;
            this.k();
            this.d++;
            this.c.fire(undefined);
            return {
                versionId: this.d
            };
        }
        deltaExtensions(toAdd, toRemove) {
            // It is possible that an extension is removed, only to be added again at a different version
            // so we will first handle removals
            this.e = removeExtensions(this.e, toRemove);
            // Then, handle the extensions to add
            this.e = this.e.concat(toAdd);
            // Immediately remove looping extensions!
            const looping = $y3b.l(this.e);
            this.e = removeExtensions(this.e, looping.map(ext => ext.identifier));
            this.k();
            this.d++;
            this.c.fire(undefined);
            return new $x3b(this.d, looping);
        }
        static l(extensionDescriptions) {
            const G = new class {
                constructor() {
                    this.c = new Map();
                    this.d = new Set();
                    this.e = [];
                }
                addNode(id) {
                    if (!this.d.has(id)) {
                        this.d.add(id);
                        this.e.push(id);
                    }
                }
                addArc(from, to) {
                    this.addNode(from);
                    this.addNode(to);
                    if (this.c.has(from)) {
                        this.c.get(from).push(to);
                    }
                    else {
                        this.c.set(from, [to]);
                    }
                }
                getArcs(id) {
                    if (this.c.has(id)) {
                        return this.c.get(id);
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
                    return this.e;
                }
            };
            const descs = new extensions_1.$Xl();
            for (const extensionDescription of extensionDescriptions) {
                descs.set(extensionDescription.identifier, extensionDescription);
                if (extensionDescription.extensionDependencies) {
                    for (const depId of extensionDescription.extensionDependencies) {
                        G.addArc(extensions_1.$Vl.toKey(extensionDescription.identifier), extensions_1.$Vl.toKey(depId));
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
            return this.h.has(activationEvent);
        }
        containsExtension(extensionId) {
            return this.f.has(extensionId);
        }
        getExtensionDescriptionsForActivationEvent(activationEvent) {
            const extensions = this.h.get(activationEvent);
            return extensions ? extensions.slice(0) : [];
        }
        getAllExtensionDescriptions() {
            return this.g.slice(0);
        }
        getSnapshot() {
            return new $z3b(this.d, this.getAllExtensionDescriptions());
        }
        getExtensionDescription(extensionId) {
            const extension = this.f.get(extensionId);
            return extension ? extension : undefined;
        }
        getExtensionDescriptionByUUID(uuid) {
            for (const extensionDescription of this.g) {
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
    exports.$y3b = $y3b;
    class $z3b {
        constructor(versionId, extensions) {
            this.versionId = versionId;
            this.extensions = extensions;
        }
    }
    exports.$z3b = $z3b;
    exports.$A3b = {
        readActivationEvents: (extensionDescription) => {
            return extensionDescription.activationEvents;
        }
    };
    class $B3b {
        constructor(activationEventsReader) {
            this.d = new Lock();
            this.c = new $y3b(activationEventsReader, []);
        }
        async acquireLock(customerName) {
            const lock = await this.d.acquire(customerName);
            return new $C3b(this, lock);
        }
        deltaExtensions(acquiredLock, toAdd, toRemove) {
            if (!acquiredLock.isAcquiredFor(this)) {
                throw new Error('Lock is not held');
            }
            return this.c.deltaExtensions(toAdd, toRemove);
        }
        containsActivationEvent(activationEvent) {
            return this.c.containsActivationEvent(activationEvent);
        }
        containsExtension(extensionId) {
            return this.c.containsExtension(extensionId);
        }
        getExtensionDescriptionsForActivationEvent(activationEvent) {
            return this.c.getExtensionDescriptionsForActivationEvent(activationEvent);
        }
        getAllExtensionDescriptions() {
            return this.c.getAllExtensionDescriptions();
        }
        getSnapshot() {
            return this.c.getSnapshot();
        }
        getExtensionDescription(extensionId) {
            return this.c.getExtensionDescription(extensionId);
        }
        getExtensionDescriptionByUUID(uuid) {
            return this.c.getExtensionDescriptionByUUID(uuid);
        }
        getExtensionDescriptionByIdOrUUID(extensionId, uuid) {
            return this.c.getExtensionDescriptionByIdOrUUID(extensionId, uuid);
        }
    }
    exports.$B3b = $B3b;
    class $C3b extends lifecycle_1.$kc {
        constructor(f, lock) {
            super();
            this.f = f;
            this.c = false;
            this.B(lock);
        }
        isAcquiredFor(registry) {
            return !this.c && this.f === registry;
        }
    }
    exports.$C3b = $C3b;
    class LockCustomer {
        constructor(name) {
            this.name = name;
            this.promise = new Promise((resolve, reject) => {
                this.c = resolve;
            });
        }
        resolve(value) {
            this.c(value);
        }
    }
    class Lock {
        constructor() {
            this.c = [];
            this.d = false;
        }
        async acquire(customerName) {
            const customer = new LockCustomer(customerName);
            this.c.push(customer);
            this.e();
            return customer.promise;
        }
        e() {
            if (this.d) {
                // cannot advance yet
                return;
            }
            if (this.c.length === 0) {
                // no more waiting customers
                return;
            }
            const customer = this.c.shift();
            this.d = true;
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
                this.d = false;
                this.e();
            };
            customer.resolve((0, lifecycle_1.$ic)(releaseLock));
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
        const aLastSegment = path.$6d.basename(a.extensionLocation.path);
        const bLastSegment = path.$6d.basename(b.extensionLocation.path);
        if (aLastSegment < bLastSegment) {
            return -1;
        }
        if (aLastSegment > bLastSegment) {
            return 1;
        }
        return 0;
    }
    function removeExtensions(arr, toRemove) {
        const toRemoveSet = new extensions_1.$Wl(toRemove);
        return arr.filter(extension => !toRemoveSet.has(extension.identifier));
    }
});
//# sourceMappingURL=extensionDescriptionRegistry.js.map