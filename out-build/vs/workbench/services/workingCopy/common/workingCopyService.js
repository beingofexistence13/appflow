/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/base/common/event", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/base/common/map"], function (require, exports, instantiation_1, extensions_1, event_1, uri_1, lifecycle_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UC = exports.$TC = void 0;
    exports.$TC = (0, instantiation_1.$Bh)('workingCopyService');
    class $UC extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            //#region Events
            this.a = this.B(new event_1.$fd());
            this.onDidRegister = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidUnregister = this.b.event;
            this.f = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeContent = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidSave = this.h.event;
            this.j = new Set();
            this.m = new map_1.$zi();
            this.n = this.B(new lifecycle_1.$sc());
            //#endregion
        }
        //#endregion
        //#region Registry
        get workingCopies() { return Array.from(this.j.values()); }
        registerWorkingCopy(workingCopy) {
            let workingCopiesForResource = this.m.get(workingCopy.resource);
            if (workingCopiesForResource?.has(workingCopy.typeId)) {
                throw new Error(`Cannot register more than one working copy with the same resource ${workingCopy.resource.toString()} and type ${workingCopy.typeId}.`);
            }
            // Registry (all)
            this.j.add(workingCopy);
            // Registry (type based)
            if (!workingCopiesForResource) {
                workingCopiesForResource = new Map();
                this.m.set(workingCopy.resource, workingCopiesForResource);
            }
            workingCopiesForResource.set(workingCopy.typeId, workingCopy);
            // Wire in Events
            const disposables = new lifecycle_1.$jc();
            disposables.add(workingCopy.onDidChangeContent(() => this.g.fire(workingCopy)));
            disposables.add(workingCopy.onDidChangeDirty(() => this.f.fire(workingCopy)));
            disposables.add(workingCopy.onDidSave(e => this.h.fire({ workingCopy, ...e })));
            this.n.set(workingCopy, disposables);
            // Send some initial events
            this.a.fire(workingCopy);
            if (workingCopy.isDirty()) {
                this.f.fire(workingCopy);
            }
            return (0, lifecycle_1.$ic)(() => {
                // Unregister working copy
                this.r(workingCopy);
                // Signal as event
                this.b.fire(workingCopy);
            });
        }
        r(workingCopy) {
            // Registry (all)
            this.j.delete(workingCopy);
            // Registry (type based)
            const workingCopiesForResource = this.m.get(workingCopy.resource);
            if (workingCopiesForResource?.delete(workingCopy.typeId) && workingCopiesForResource.size === 0) {
                this.m.delete(workingCopy.resource);
            }
            // If copy is dirty, ensure to fire an event to signal the dirty change
            // (a disposed working copy cannot account for being dirty in our model)
            if (workingCopy.isDirty()) {
                this.f.fire(workingCopy);
            }
            // Remove all listeners associated to working copy
            this.n.deleteAndDispose(workingCopy);
        }
        has(resourceOrIdentifier) {
            if (uri_1.URI.isUri(resourceOrIdentifier)) {
                return this.m.has(resourceOrIdentifier);
            }
            return this.m.get(resourceOrIdentifier.resource)?.has(resourceOrIdentifier.typeId) ?? false;
        }
        get(identifier) {
            return this.m.get(identifier.resource)?.get(identifier.typeId);
        }
        getAll(resource) {
            const workingCopies = this.m.get(resource);
            if (!workingCopies) {
                return undefined;
            }
            return Array.from(workingCopies.values());
        }
        //#endregion
        //#region Dirty Tracking
        get hasDirty() {
            for (const workingCopy of this.j) {
                if (workingCopy.isDirty()) {
                    return true;
                }
            }
            return false;
        }
        get dirtyCount() {
            let totalDirtyCount = 0;
            for (const workingCopy of this.j) {
                if (workingCopy.isDirty()) {
                    totalDirtyCount++;
                }
            }
            return totalDirtyCount;
        }
        get dirtyWorkingCopies() {
            return this.workingCopies.filter(workingCopy => workingCopy.isDirty());
        }
        get modifiedCount() {
            let totalModifiedCount = 0;
            for (const workingCopy of this.j) {
                if (workingCopy.isModified()) {
                    totalModifiedCount++;
                }
            }
            return totalModifiedCount;
        }
        get modifiedWorkingCopies() {
            return this.workingCopies.filter(workingCopy => workingCopy.isModified());
        }
        isDirty(resource, typeId) {
            const workingCopies = this.m.get(resource);
            if (workingCopies) {
                // For a specific type
                if (typeof typeId === 'string') {
                    return workingCopies.get(typeId)?.isDirty() ?? false;
                }
                // Across all working copies
                else {
                    for (const [, workingCopy] of workingCopies) {
                        if (workingCopy.isDirty()) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    }
    exports.$UC = $UC;
    (0, extensions_1.$mr)(exports.$TC, $UC, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workingCopyService.js.map