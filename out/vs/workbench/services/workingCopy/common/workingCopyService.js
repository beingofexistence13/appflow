/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/base/common/event", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/base/common/map"], function (require, exports, instantiation_1, extensions_1, event_1, uri_1, lifecycle_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkingCopyService = exports.IWorkingCopyService = void 0;
    exports.IWorkingCopyService = (0, instantiation_1.createDecorator)('workingCopyService');
    class WorkingCopyService extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            //#region Events
            this._onDidRegister = this._register(new event_1.Emitter());
            this.onDidRegister = this._onDidRegister.event;
            this._onDidUnregister = this._register(new event_1.Emitter());
            this.onDidUnregister = this._onDidUnregister.event;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._onDidSave = this._register(new event_1.Emitter());
            this.onDidSave = this._onDidSave.event;
            this._workingCopies = new Set();
            this.mapResourceToWorkingCopies = new map_1.ResourceMap();
            this.mapWorkingCopyToListeners = this._register(new lifecycle_1.DisposableMap());
            //#endregion
        }
        //#endregion
        //#region Registry
        get workingCopies() { return Array.from(this._workingCopies.values()); }
        registerWorkingCopy(workingCopy) {
            let workingCopiesForResource = this.mapResourceToWorkingCopies.get(workingCopy.resource);
            if (workingCopiesForResource?.has(workingCopy.typeId)) {
                throw new Error(`Cannot register more than one working copy with the same resource ${workingCopy.resource.toString()} and type ${workingCopy.typeId}.`);
            }
            // Registry (all)
            this._workingCopies.add(workingCopy);
            // Registry (type based)
            if (!workingCopiesForResource) {
                workingCopiesForResource = new Map();
                this.mapResourceToWorkingCopies.set(workingCopy.resource, workingCopiesForResource);
            }
            workingCopiesForResource.set(workingCopy.typeId, workingCopy);
            // Wire in Events
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(workingCopy.onDidChangeContent(() => this._onDidChangeContent.fire(workingCopy)));
            disposables.add(workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(workingCopy)));
            disposables.add(workingCopy.onDidSave(e => this._onDidSave.fire({ workingCopy, ...e })));
            this.mapWorkingCopyToListeners.set(workingCopy, disposables);
            // Send some initial events
            this._onDidRegister.fire(workingCopy);
            if (workingCopy.isDirty()) {
                this._onDidChangeDirty.fire(workingCopy);
            }
            return (0, lifecycle_1.toDisposable)(() => {
                // Unregister working copy
                this.unregisterWorkingCopy(workingCopy);
                // Signal as event
                this._onDidUnregister.fire(workingCopy);
            });
        }
        unregisterWorkingCopy(workingCopy) {
            // Registry (all)
            this._workingCopies.delete(workingCopy);
            // Registry (type based)
            const workingCopiesForResource = this.mapResourceToWorkingCopies.get(workingCopy.resource);
            if (workingCopiesForResource?.delete(workingCopy.typeId) && workingCopiesForResource.size === 0) {
                this.mapResourceToWorkingCopies.delete(workingCopy.resource);
            }
            // If copy is dirty, ensure to fire an event to signal the dirty change
            // (a disposed working copy cannot account for being dirty in our model)
            if (workingCopy.isDirty()) {
                this._onDidChangeDirty.fire(workingCopy);
            }
            // Remove all listeners associated to working copy
            this.mapWorkingCopyToListeners.deleteAndDispose(workingCopy);
        }
        has(resourceOrIdentifier) {
            if (uri_1.URI.isUri(resourceOrIdentifier)) {
                return this.mapResourceToWorkingCopies.has(resourceOrIdentifier);
            }
            return this.mapResourceToWorkingCopies.get(resourceOrIdentifier.resource)?.has(resourceOrIdentifier.typeId) ?? false;
        }
        get(identifier) {
            return this.mapResourceToWorkingCopies.get(identifier.resource)?.get(identifier.typeId);
        }
        getAll(resource) {
            const workingCopies = this.mapResourceToWorkingCopies.get(resource);
            if (!workingCopies) {
                return undefined;
            }
            return Array.from(workingCopies.values());
        }
        //#endregion
        //#region Dirty Tracking
        get hasDirty() {
            for (const workingCopy of this._workingCopies) {
                if (workingCopy.isDirty()) {
                    return true;
                }
            }
            return false;
        }
        get dirtyCount() {
            let totalDirtyCount = 0;
            for (const workingCopy of this._workingCopies) {
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
            for (const workingCopy of this._workingCopies) {
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
            const workingCopies = this.mapResourceToWorkingCopies.get(resource);
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
    exports.WorkingCopyService = WorkingCopyService;
    (0, extensions_1.registerSingleton)(exports.IWorkingCopyService, WorkingCopyService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtpbmdDb3B5L2NvbW1vbi93b3JraW5nQ29weVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVW5GLFFBQUEsbUJBQW1CLEdBQUcsSUFBQSwrQkFBZSxFQUFzQixvQkFBb0IsQ0FBQyxDQUFDO0lBOEg5RixNQUFhLGtCQUFtQixTQUFRLHNCQUFVO1FBQWxEOztZQUlDLGdCQUFnQjtZQUVDLG1CQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZ0IsQ0FBQyxDQUFDO1lBQ3JFLGtCQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUM7WUFFbEMscUJBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZ0IsQ0FBQyxDQUFDO1lBQ3ZFLG9CQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztZQUV0QyxzQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFnQixDQUFDLENBQUM7WUFDeEUscUJBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQztZQUV4Qyx3QkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFnQixDQUFDLENBQUM7WUFDMUUsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztZQUU1QyxlQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBeUIsQ0FBQyxDQUFDO1lBQzFFLGNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztZQVFuQyxtQkFBYyxHQUFHLElBQUksR0FBRyxF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