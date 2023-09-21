/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/severity", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/platform/notification/common/notification", "vs/platform/undoRedo/common/undoRedo"], function (require, exports, errors_1, lifecycle_1, network_1, severity_1, nls, dialogs_1, extensions_1, notification_1, undoRedo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UndoRedoService = void 0;
    const DEBUG = false;
    function getResourceLabel(resource) {
        return resource.scheme === network_1.Schemas.file ? resource.fsPath : resource.path;
    }
    let stackElementCounter = 0;
    class ResourceStackElement {
        constructor(actual, resourceLabel, strResource, groupId, groupOrder, sourceId, sourceOrder) {
            this.id = (++stackElementCounter);
            this.type = 0 /* UndoRedoElementType.Resource */;
            this.actual = actual;
            this.label = actual.label;
            this.confirmBeforeUndo = actual.confirmBeforeUndo || false;
            this.resourceLabel = resourceLabel;
            this.strResource = strResource;
            this.resourceLabels = [this.resourceLabel];
            this.strResources = [this.strResource];
            this.groupId = groupId;
            this.groupOrder = groupOrder;
            this.sourceId = sourceId;
            this.sourceOrder = sourceOrder;
            this.isValid = true;
        }
        setValid(isValid) {
            this.isValid = isValid;
        }
        toString() {
            return `[id:${this.id}] [group:${this.groupId}] [${this.isValid ? '  VALID' : 'INVALID'}] ${this.actual.constructor.name} - ${this.actual}`;
        }
    }
    var RemovedResourceReason;
    (function (RemovedResourceReason) {
        RemovedResourceReason[RemovedResourceReason["ExternalRemoval"] = 0] = "ExternalRemoval";
        RemovedResourceReason[RemovedResourceReason["NoParallelUniverses"] = 1] = "NoParallelUniverses";
    })(RemovedResourceReason || (RemovedResourceReason = {}));
    class ResourceReasonPair {
        constructor(resourceLabel, reason) {
            this.resourceLabel = resourceLabel;
            this.reason = reason;
        }
    }
    class RemovedResources {
        constructor() {
            this.elements = new Map();
        }
        createMessage() {
            const externalRemoval = [];
            const noParallelUniverses = [];
            for (const [, element] of this.elements) {
                const dest = (element.reason === 0 /* RemovedResourceReason.ExternalRemoval */
                    ? externalRemoval
                    : noParallelUniverses);
                dest.push(element.resourceLabel);
            }
            const messages = [];
            if (externalRemoval.length > 0) {
                messages.push(nls.localize({ key: 'externalRemoval', comment: ['{0} is a list of filenames'] }, "The following files have been closed and modified on disk: {0}.", externalRemoval.join(', ')));
            }
            if (noParallelUniverses.length > 0) {
                messages.push(nls.localize({ key: 'noParallelUniverses', comment: ['{0} is a list of filenames'] }, "The following files have been modified in an incompatible way: {0}.", noParallelUniverses.join(', ')));
            }
            return messages.join('\n');
        }
        get size() {
            return this.elements.size;
        }
        has(strResource) {
            return this.elements.has(strResource);
        }
        set(strResource, value) {
            this.elements.set(strResource, value);
        }
        delete(strResource) {
            return this.elements.delete(strResource);
        }
    }
    class WorkspaceStackElement {
        constructor(actual, resourceLabels, strResources, groupId, groupOrder, sourceId, sourceOrder) {
            this.id = (++stackElementCounter);
            this.type = 1 /* UndoRedoElementType.Workspace */;
            this.actual = actual;
            this.label = actual.label;
            this.confirmBeforeUndo = actual.confirmBeforeUndo || false;
            this.resourceLabels = resourceLabels;
            this.strResources = strResources;
            this.groupId = groupId;
            this.groupOrder = groupOrder;
            this.sourceId = sourceId;
            this.sourceOrder = sourceOrder;
            this.removedResources = null;
            this.invalidatedResources = null;
        }
        canSplit() {
            return (typeof this.actual.split === 'function');
        }
        removeResource(resourceLabel, strResource, reason) {
            if (!this.removedResources) {
                this.removedResources = new RemovedResources();
            }
            if (!this.removedResources.has(strResource)) {
                this.removedResources.set(strResource, new ResourceReasonPair(resourceLabel, reason));
            }
        }
        setValid(resourceLabel, strResource, isValid) {
            if (isValid) {
                if (this.invalidatedResources) {
                    this.invalidatedResources.delete(strResource);
                    if (this.invalidatedResources.size === 0) {
                        this.invalidatedResources = null;
                    }
                }
            }
            else {
                if (!this.invalidatedResources) {
                    this.invalidatedResources = new RemovedResources();
                }
                if (!this.invalidatedResources.has(strResource)) {
                    this.invalidatedResources.set(strResource, new ResourceReasonPair(resourceLabel, 0 /* RemovedResourceReason.ExternalRemoval */));
                }
            }
        }
        toString() {
            return `[id:${this.id}] [group:${this.groupId}] [${this.invalidatedResources ? 'INVALID' : '  VALID'}] ${this.actual.constructor.name} - ${this.actual}`;
        }
    }
    class ResourceEditStack {
        constructor(resourceLabel, strResource) {
            this.resourceLabel = resourceLabel;
            this.strResource = strResource;
            this._past = [];
            this._future = [];
            this.locked = false;
            this.versionId = 1;
        }
        dispose() {
            for (const element of this._past) {
                if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                    element.removeResource(this.resourceLabel, this.strResource, 0 /* RemovedResourceReason.ExternalRemoval */);
                }
            }
            for (const element of this._future) {
                if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                    element.removeResource(this.resourceLabel, this.strResource, 0 /* RemovedResourceReason.ExternalRemoval */);
                }
            }
            this.versionId++;
        }
        toString() {
            const result = [];
            result.push(`* ${this.strResource}:`);
            for (let i = 0; i < this._past.length; i++) {
                result.push(`   * [UNDO] ${this._past[i]}`);
            }
            for (let i = this._future.length - 1; i >= 0; i--) {
                result.push(`   * [REDO] ${this._future[i]}`);
            }
            return result.join('\n');
        }
        flushAllElements() {
            this._past = [];
            this._future = [];
            this.versionId++;
        }
        setElementsIsValid(isValid) {
            for (const element of this._past) {
                if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                    element.setValid(this.resourceLabel, this.strResource, isValid);
                }
                else {
                    element.setValid(isValid);
                }
            }
            for (const element of this._future) {
                if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                    element.setValid(this.resourceLabel, this.strResource, isValid);
                }
                else {
                    element.setValid(isValid);
                }
            }
        }
        _setElementValidFlag(element, isValid) {
            if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                element.setValid(this.resourceLabel, this.strResource, isValid);
            }
            else {
                element.setValid(isValid);
            }
        }
        setElementsValidFlag(isValid, filter) {
            for (const element of this._past) {
                if (filter(element.actual)) {
                    this._setElementValidFlag(element, isValid);
                }
            }
            for (const element of this._future) {
                if (filter(element.actual)) {
                    this._setElementValidFlag(element, isValid);
                }
            }
        }
        pushElement(element) {
            // remove the future
            for (const futureElement of this._future) {
                if (futureElement.type === 1 /* UndoRedoElementType.Workspace */) {
                    futureElement.removeResource(this.resourceLabel, this.strResource, 1 /* RemovedResourceReason.NoParallelUniverses */);
                }
            }
            this._future = [];
            this._past.push(element);
            this.versionId++;
        }
        createSnapshot(resource) {
            const elements = [];
            for (let i = 0, len = this._past.length; i < len; i++) {
                elements.push(this._past[i].id);
            }
            for (let i = this._future.length - 1; i >= 0; i--) {
                elements.push(this._future[i].id);
            }
            return new undoRedo_1.ResourceEditStackSnapshot(resource, elements);
        }
        restoreSnapshot(snapshot) {
            const snapshotLength = snapshot.elements.length;
            let isOK = true;
            let snapshotIndex = 0;
            let removePastAfter = -1;
            for (let i = 0, len = this._past.length; i < len; i++, snapshotIndex++) {
                const element = this._past[i];
                if (isOK && (snapshotIndex >= snapshotLength || element.id !== snapshot.elements[snapshotIndex])) {
                    isOK = false;
                    removePastAfter = 0;
                }
                if (!isOK && element.type === 1 /* UndoRedoElementType.Workspace */) {
                    element.removeResource(this.resourceLabel, this.strResource, 0 /* RemovedResourceReason.ExternalRemoval */);
                }
            }
            let removeFutureBefore = -1;
            for (let i = this._future.length - 1; i >= 0; i--, snapshotIndex++) {
                const element = this._future[i];
                if (isOK && (snapshotIndex >= snapshotLength || element.id !== snapshot.elements[snapshotIndex])) {
                    isOK = false;
                    removeFutureBefore = i;
                }
                if (!isOK && element.type === 1 /* UndoRedoElementType.Workspace */) {
                    element.removeResource(this.resourceLabel, this.strResource, 0 /* RemovedResourceReason.ExternalRemoval */);
                }
            }
            if (removePastAfter !== -1) {
                this._past = this._past.slice(0, removePastAfter);
            }
            if (removeFutureBefore !== -1) {
                this._future = this._future.slice(removeFutureBefore + 1);
            }
            this.versionId++;
        }
        getElements() {
            const past = [];
            const future = [];
            for (const element of this._past) {
                past.push(element.actual);
            }
            for (const element of this._future) {
                future.push(element.actual);
            }
            return { past, future };
        }
        getClosestPastElement() {
            if (this._past.length === 0) {
                return null;
            }
            return this._past[this._past.length - 1];
        }
        getSecondClosestPastElement() {
            if (this._past.length < 2) {
                return null;
            }
            return this._past[this._past.length - 2];
        }
        getClosestFutureElement() {
            if (this._future.length === 0) {
                return null;
            }
            return this._future[this._future.length - 1];
        }
        hasPastElements() {
            return (this._past.length > 0);
        }
        hasFutureElements() {
            return (this._future.length > 0);
        }
        splitPastWorkspaceElement(toRemove, individualMap) {
            for (let j = this._past.length - 1; j >= 0; j--) {
                if (this._past[j] === toRemove) {
                    if (individualMap.has(this.strResource)) {
                        // gets replaced
                        this._past[j] = individualMap.get(this.strResource);
                    }
                    else {
                        // gets deleted
                        this._past.splice(j, 1);
                    }
                    break;
                }
            }
            this.versionId++;
        }
        splitFutureWorkspaceElement(toRemove, individualMap) {
            for (let j = this._future.length - 1; j >= 0; j--) {
                if (this._future[j] === toRemove) {
                    if (individualMap.has(this.strResource)) {
                        // gets replaced
                        this._future[j] = individualMap.get(this.strResource);
                    }
                    else {
                        // gets deleted
                        this._future.splice(j, 1);
                    }
                    break;
                }
            }
            this.versionId++;
        }
        moveBackward(element) {
            this._past.pop();
            this._future.push(element);
            this.versionId++;
        }
        moveForward(element) {
            this._future.pop();
            this._past.push(element);
            this.versionId++;
        }
    }
    class EditStackSnapshot {
        constructor(editStacks) {
            this.editStacks = editStacks;
            this._versionIds = [];
            for (let i = 0, len = this.editStacks.length; i < len; i++) {
                this._versionIds[i] = this.editStacks[i].versionId;
            }
        }
        isValid() {
            for (let i = 0, len = this.editStacks.length; i < len; i++) {
                if (this._versionIds[i] !== this.editStacks[i].versionId) {
                    return false;
                }
            }
            return true;
        }
    }
    const missingEditStack = new ResourceEditStack('', '');
    missingEditStack.locked = true;
    let UndoRedoService = class UndoRedoService {
        constructor(_dialogService, _notificationService) {
            this._dialogService = _dialogService;
            this._notificationService = _notificationService;
            this._editStacks = new Map();
            this._uriComparisonKeyComputers = [];
        }
        registerUriComparisonKeyComputer(scheme, uriComparisonKeyComputer) {
            this._uriComparisonKeyComputers.push([scheme, uriComparisonKeyComputer]);
            return {
                dispose: () => {
                    for (let i = 0, len = this._uriComparisonKeyComputers.length; i < len; i++) {
                        if (this._uriComparisonKeyComputers[i][1] === uriComparisonKeyComputer) {
                            this._uriComparisonKeyComputers.splice(i, 1);
                            return;
                        }
                    }
                }
            };
        }
        getUriComparisonKey(resource) {
            for (const uriComparisonKeyComputer of this._uriComparisonKeyComputers) {
                if (uriComparisonKeyComputer[0] === resource.scheme) {
                    return uriComparisonKeyComputer[1].getComparisonKey(resource);
                }
            }
            return resource.toString();
        }
        _print(label) {
            console.log(`------------------------------------`);
            console.log(`AFTER ${label}: `);
            const str = [];
            for (const element of this._editStacks) {
                str.push(element[1].toString());
            }
            console.log(str.join('\n'));
        }
        pushElement(element, group = undoRedo_1.UndoRedoGroup.None, source = undoRedo_1.UndoRedoSource.None) {
            if (element.type === 0 /* UndoRedoElementType.Resource */) {
                const resourceLabel = getResourceLabel(element.resource);
                const strResource = this.getUriComparisonKey(element.resource);
                this._pushElement(new ResourceStackElement(element, resourceLabel, strResource, group.id, group.nextOrder(), source.id, source.nextOrder()));
            }
            else {
                const seen = new Set();
                const resourceLabels = [];
                const strResources = [];
                for (const resource of element.resources) {
                    const resourceLabel = getResourceLabel(resource);
                    const strResource = this.getUriComparisonKey(resource);
                    if (seen.has(strResource)) {
                        continue;
                    }
                    seen.add(strResource);
                    resourceLabels.push(resourceLabel);
                    strResources.push(strResource);
                }
                if (resourceLabels.length === 1) {
                    this._pushElement(new ResourceStackElement(element, resourceLabels[0], strResources[0], group.id, group.nextOrder(), source.id, source.nextOrder()));
                }
                else {
                    this._pushElement(new WorkspaceStackElement(element, resourceLabels, strResources, group.id, group.nextOrder(), source.id, source.nextOrder()));
                }
            }
            if (DEBUG) {
                this._print('pushElement');
            }
        }
        _pushElement(element) {
            for (let i = 0, len = element.strResources.length; i < len; i++) {
                const resourceLabel = element.resourceLabels[i];
                const strResource = element.strResources[i];
                let editStack;
                if (this._editStacks.has(strResource)) {
                    editStack = this._editStacks.get(strResource);
                }
                else {
                    editStack = new ResourceEditStack(resourceLabel, strResource);
                    this._editStacks.set(strResource, editStack);
                }
                editStack.pushElement(element);
            }
        }
        getLastElement(resource) {
            const strResource = this.getUriComparisonKey(resource);
            if (this._editStacks.has(strResource)) {
                const editStack = this._editStacks.get(strResource);
                if (editStack.hasFutureElements()) {
                    return null;
                }
                const closestPastElement = editStack.getClosestPastElement();
                return closestPastElement ? closestPastElement.actual : null;
            }
            return null;
        }
        _splitPastWorkspaceElement(toRemove, ignoreResources) {
            const individualArr = toRemove.actual.split();
            const individualMap = new Map();
            for (const _element of individualArr) {
                const resourceLabel = getResourceLabel(_element.resource);
                const strResource = this.getUriComparisonKey(_element.resource);
                const element = new ResourceStackElement(_element, resourceLabel, strResource, 0, 0, 0, 0);
                individualMap.set(element.strResource, element);
            }
            for (const strResource of toRemove.strResources) {
                if (ignoreResources && ignoreResources.has(strResource)) {
                    continue;
                }
                const editStack = this._editStacks.get(strResource);
                editStack.splitPastWorkspaceElement(toRemove, individualMap);
            }
        }
        _splitFutureWorkspaceElement(toRemove, ignoreResources) {
            const individualArr = toRemove.actual.split();
            const individualMap = new Map();
            for (const _element of individualArr) {
                const resourceLabel = getResourceLabel(_element.resource);
                const strResource = this.getUriComparisonKey(_element.resource);
                const element = new ResourceStackElement(_element, resourceLabel, strResource, 0, 0, 0, 0);
                individualMap.set(element.strResource, element);
            }
            for (const strResource of toRemove.strResources) {
                if (ignoreResources && ignoreResources.has(strResource)) {
                    continue;
                }
                const editStack = this._editStacks.get(strResource);
                editStack.splitFutureWorkspaceElement(toRemove, individualMap);
            }
        }
        removeElements(resource) {
            const strResource = typeof resource === 'string' ? resource : this.getUriComparisonKey(resource);
            if (this._editStacks.has(strResource)) {
                const editStack = this._editStacks.get(strResource);
                editStack.dispose();
                this._editStacks.delete(strResource);
            }
            if (DEBUG) {
                this._print('removeElements');
            }
        }
        setElementsValidFlag(resource, isValid, filter) {
            const strResource = this.getUriComparisonKey(resource);
            if (this._editStacks.has(strResource)) {
                const editStack = this._editStacks.get(strResource);
                editStack.setElementsValidFlag(isValid, filter);
            }
            if (DEBUG) {
                this._print('setElementsValidFlag');
            }
        }
        hasElements(resource) {
            const strResource = this.getUriComparisonKey(resource);
            if (this._editStacks.has(strResource)) {
                const editStack = this._editStacks.get(strResource);
                return (editStack.hasPastElements() || editStack.hasFutureElements());
            }
            return false;
        }
        createSnapshot(resource) {
            const strResource = this.getUriComparisonKey(resource);
            if (this._editStacks.has(strResource)) {
                const editStack = this._editStacks.get(strResource);
                return editStack.createSnapshot(resource);
            }
            return new undoRedo_1.ResourceEditStackSnapshot(resource, []);
        }
        restoreSnapshot(snapshot) {
            const strResource = this.getUriComparisonKey(snapshot.resource);
            if (this._editStacks.has(strResource)) {
                const editStack = this._editStacks.get(strResource);
                editStack.restoreSnapshot(snapshot);
                if (!editStack.hasPastElements() && !editStack.hasFutureElements()) {
                    // the edit stack is now empty, just remove it entirely
                    editStack.dispose();
                    this._editStacks.delete(strResource);
                }
            }
            if (DEBUG) {
                this._print('restoreSnapshot');
            }
        }
        getElements(resource) {
            const strResource = this.getUriComparisonKey(resource);
            if (this._editStacks.has(strResource)) {
                const editStack = this._editStacks.get(strResource);
                return editStack.getElements();
            }
            return { past: [], future: [] };
        }
        _findClosestUndoElementWithSource(sourceId) {
            if (!sourceId) {
                return [null, null];
            }
            // find an element with the sourceId and with the highest sourceOrder ready to be undone
            let matchedElement = null;
            let matchedStrResource = null;
            for (const [strResource, editStack] of this._editStacks) {
                const candidate = editStack.getClosestPastElement();
                if (!candidate) {
                    continue;
                }
                if (candidate.sourceId === sourceId) {
                    if (!matchedElement || candidate.sourceOrder > matchedElement.sourceOrder) {
                        matchedElement = candidate;
                        matchedStrResource = strResource;
                    }
                }
            }
            return [matchedElement, matchedStrResource];
        }
        canUndo(resourceOrSource) {
            if (resourceOrSource instanceof undoRedo_1.UndoRedoSource) {
                const [, matchedStrResource] = this._findClosestUndoElementWithSource(resourceOrSource.id);
                return matchedStrResource ? true : false;
            }
            const strResource = this.getUriComparisonKey(resourceOrSource);
            if (this._editStacks.has(strResource)) {
                const editStack = this._editStacks.get(strResource);
                return editStack.hasPastElements();
            }
            return false;
        }
        _onError(err, element) {
            (0, errors_1.onUnexpectedError)(err);
            // An error occurred while undoing or redoing => drop the undo/redo stack for all affected resources
            for (const strResource of element.strResources) {
                this.removeElements(strResource);
            }
            this._notificationService.error(err);
        }
        _acquireLocks(editStackSnapshot) {
            // first, check if all locks can be acquired
            for (const editStack of editStackSnapshot.editStacks) {
                if (editStack.locked) {
                    throw new Error('Cannot acquire edit stack lock');
                }
            }
            // can acquire all locks
            for (const editStack of editStackSnapshot.editStacks) {
                editStack.locked = true;
            }
            return () => {
                // release all locks
                for (const editStack of editStackSnapshot.editStacks) {
                    editStack.locked = false;
                }
            };
        }
        _safeInvokeWithLocks(element, invoke, editStackSnapshot, cleanup, continuation) {
            const releaseLocks = this._acquireLocks(editStackSnapshot);
            let result;
            try {
                result = invoke();
            }
            catch (err) {
                releaseLocks();
                cleanup.dispose();
                return this._onError(err, element);
            }
            if (result) {
                // result is Promise<void>
                return result.then(() => {
                    releaseLocks();
                    cleanup.dispose();
                    return continuation();
                }, (err) => {
                    releaseLocks();
                    cleanup.dispose();
                    return this._onError(err, element);
                });
            }
            else {
                // result is void
                releaseLocks();
                cleanup.dispose();
                return continuation();
            }
        }
        async _invokeWorkspacePrepare(element) {
            if (typeof element.actual.prepareUndoRedo === 'undefined') {
                return lifecycle_1.Disposable.None;
            }
            const result = element.actual.prepareUndoRedo();
            if (typeof result === 'undefined') {
                return lifecycle_1.Disposable.None;
            }
            return result;
        }
        _invokeResourcePrepare(element, callback) {
            if (element.actual.type !== 1 /* UndoRedoElementType.Workspace */ || typeof element.actual.prepareUndoRedo === 'undefined') {
                // no preparation needed
                return callback(lifecycle_1.Disposable.None);
            }
            const r = element.actual.prepareUndoRedo();
            if (!r) {
                // nothing to clean up
                return callback(lifecycle_1.Disposable.None);
            }
            if ((0, lifecycle_1.isDisposable)(r)) {
                return callback(r);
            }
            return r.then((disposable) => {
                return callback(disposable);
            });
        }
        _getAffectedEditStacks(element) {
            const affectedEditStacks = [];
            for (const strResource of element.strResources) {
                affectedEditStacks.push(this._editStacks.get(strResource) || missingEditStack);
            }
            return new EditStackSnapshot(affectedEditStacks);
        }
        _tryToSplitAndUndo(strResource, element, ignoreResources, message) {
            if (element.canSplit()) {
                this._splitPastWorkspaceElement(element, ignoreResources);
                this._notificationService.warn(message);
                return new WorkspaceVerificationError(this._undo(strResource, 0, true));
            }
            else {
                // Cannot safely split this workspace element => flush all undo/redo stacks
                for (const strResource of element.strResources) {
                    this.removeElements(strResource);
                }
                this._notificationService.warn(message);
                return new WorkspaceVerificationError();
            }
        }
        _checkWorkspaceUndo(strResource, element, editStackSnapshot, checkInvalidatedResources) {
            if (element.removedResources) {
                return this._tryToSplitAndUndo(strResource, element, element.removedResources, nls.localize({ key: 'cannotWorkspaceUndo', comment: ['{0} is a label for an operation. {1} is another message.'] }, "Could not undo '{0}' across all files. {1}", element.label, element.removedResources.createMessage()));
            }
            if (checkInvalidatedResources && element.invalidatedResources) {
                return this._tryToSplitAndUndo(strResource, element, element.invalidatedResources, nls.localize({ key: 'cannotWorkspaceUndo', comment: ['{0} is a label for an operation. {1} is another message.'] }, "Could not undo '{0}' across all files. {1}", element.label, element.invalidatedResources.createMessage()));
            }
            // this must be the last past element in all the impacted resources!
            const cannotUndoDueToResources = [];
            for (const editStack of editStackSnapshot.editStacks) {
                if (editStack.getClosestPastElement() !== element) {
                    cannotUndoDueToResources.push(editStack.resourceLabel);
                }
            }
            if (cannotUndoDueToResources.length > 0) {
                return this._tryToSplitAndUndo(strResource, element, null, nls.localize({ key: 'cannotWorkspaceUndoDueToChanges', comment: ['{0} is a label for an operation. {1} is a list of filenames.'] }, "Could not undo '{0}' across all files because changes were made to {1}", element.label, cannotUndoDueToResources.join(', ')));
            }
            const cannotLockDueToResources = [];
            for (const editStack of editStackSnapshot.editStacks) {
                if (editStack.locked) {
                    cannotLockDueToResources.push(editStack.resourceLabel);
                }
            }
            if (cannotLockDueToResources.length > 0) {
                return this._tryToSplitAndUndo(strResource, element, null, nls.localize({ key: 'cannotWorkspaceUndoDueToInProgressUndoRedo', comment: ['{0} is a label for an operation. {1} is a list of filenames.'] }, "Could not undo '{0}' across all files because there is already an undo or redo operation running on {1}", element.label, cannotLockDueToResources.join(', ')));
            }
            // check if new stack elements were added in the meantime...
            if (!editStackSnapshot.isValid()) {
                return this._tryToSplitAndUndo(strResource, element, null, nls.localize({ key: 'cannotWorkspaceUndoDueToInMeantimeUndoRedo', comment: ['{0} is a label for an operation. {1} is a list of filenames.'] }, "Could not undo '{0}' across all files because an undo or redo operation occurred in the meantime", element.label));
            }
            return null;
        }
        _workspaceUndo(strResource, element, undoConfirmed) {
            const affectedEditStacks = this._getAffectedEditStacks(element);
            const verificationError = this._checkWorkspaceUndo(strResource, element, affectedEditStacks, /*invalidated resources will be checked after the prepare call*/ false);
            if (verificationError) {
                return verificationError.returnValue;
            }
            return this._confirmAndExecuteWorkspaceUndo(strResource, element, affectedEditStacks, undoConfirmed);
        }
        _isPartOfUndoGroup(element) {
            if (!element.groupId) {
                return false;
            }
            // check that there is at least another element with the same groupId ready to be undone
            for (const [, editStack] of this._editStacks) {
                const pastElement = editStack.getClosestPastElement();
                if (!pastElement) {
                    continue;
                }
                if (pastElement === element) {
                    const secondPastElement = editStack.getSecondClosestPastElement();
                    if (secondPastElement && secondPastElement.groupId === element.groupId) {
                        // there is another element with the same group id in the same stack!
                        return true;
                    }
                }
                if (pastElement.groupId === element.groupId) {
                    // there is another element with the same group id in another stack!
                    return true;
                }
            }
            return false;
        }
        async _confirmAndExecuteWorkspaceUndo(strResource, element, editStackSnapshot, undoConfirmed) {
            if (element.canSplit() && !this._isPartOfUndoGroup(element)) {
                // this element can be split
                let UndoChoice;
                (function (UndoChoice) {
                    UndoChoice[UndoChoice["All"] = 0] = "All";
                    UndoChoice[UndoChoice["This"] = 1] = "This";
                    UndoChoice[UndoChoice["Cancel"] = 2] = "Cancel";
                })(UndoChoice || (UndoChoice = {}));
                const { result } = await this._dialogService.prompt({
                    type: severity_1.default.Info,
                    message: nls.localize('confirmWorkspace', "Would you like to undo '{0}' across all files?", element.label),
                    buttons: [
                        {
                            label: nls.localize({ key: 'ok', comment: ['{0} denotes a number that is > 1, && denotes a mnemonic'] }, "&&Undo in {0} Files", editStackSnapshot.editStacks.length),
                            run: () => UndoChoice.All
                        },
                        {
                            label: nls.localize({ key: 'nok', comment: ['&& denotes a mnemonic'] }, "Undo this &&File"),
                            run: () => UndoChoice.This
                        }
                    ],
                    cancelButton: {
                        run: () => UndoChoice.Cancel
                    }
                });
                if (result === UndoChoice.Cancel) {
                    // choice: cancel
                    return;
                }
                if (result === UndoChoice.This) {
                    // choice: undo this file
                    this._splitPastWorkspaceElement(element, null);
                    return this._undo(strResource, 0, true);
                }
                // choice: undo in all files
                // At this point, it is possible that the element has been made invalid in the meantime (due to the confirmation await)
                const verificationError1 = this._checkWorkspaceUndo(strResource, element, editStackSnapshot, /*invalidated resources will be checked after the prepare call*/ false);
                if (verificationError1) {
                    return verificationError1.returnValue;
                }
                undoConfirmed = true;
            }
            // prepare
            let cleanup;
            try {
                cleanup = await this._invokeWorkspacePrepare(element);
            }
            catch (err) {
                return this._onError(err, element);
            }
            // At this point, it is possible that the element has been made invalid in the meantime (due to the prepare await)
            const verificationError2 = this._checkWorkspaceUndo(strResource, element, editStackSnapshot, /*now also check that there are no more invalidated resources*/ true);
            if (verificationError2) {
                cleanup.dispose();
                return verificationError2.returnValue;
            }
            for (const editStack of editStackSnapshot.editStacks) {
                editStack.moveBackward(element);
            }
            return this._safeInvokeWithLocks(element, () => element.actual.undo(), editStackSnapshot, cleanup, () => this._continueUndoInGroup(element.groupId, undoConfirmed));
        }
        _resourceUndo(editStack, element, undoConfirmed) {
            if (!element.isValid) {
                // invalid element => immediately flush edit stack!
                editStack.flushAllElements();
                return;
            }
            if (editStack.locked) {
                const message = nls.localize({ key: 'cannotResourceUndoDueToInProgressUndoRedo', comment: ['{0} is a label for an operation.'] }, "Could not undo '{0}' because there is already an undo or redo operation running.", element.label);
                this._notificationService.warn(message);
                return;
            }
            return this._invokeResourcePrepare(element, (cleanup) => {
                editStack.moveBackward(element);
                return this._safeInvokeWithLocks(element, () => element.actual.undo(), new EditStackSnapshot([editStack]), cleanup, () => this._continueUndoInGroup(element.groupId, undoConfirmed));
            });
        }
        _findClosestUndoElementInGroup(groupId) {
            if (!groupId) {
                return [null, null];
            }
            // find another element with the same groupId and with the highest groupOrder ready to be undone
            let matchedElement = null;
            let matchedStrResource = null;
            for (const [strResource, editStack] of this._editStacks) {
                const candidate = editStack.getClosestPastElement();
                if (!candidate) {
                    continue;
                }
                if (candidate.groupId === groupId) {
                    if (!matchedElement || candidate.groupOrder > matchedElement.groupOrder) {
                        matchedElement = candidate;
                        matchedStrResource = strResource;
                    }
                }
            }
            return [matchedElement, matchedStrResource];
        }
        _continueUndoInGroup(groupId, undoConfirmed) {
            if (!groupId) {
                return;
            }
            const [, matchedStrResource] = this._findClosestUndoElementInGroup(groupId);
            if (matchedStrResource) {
                return this._undo(matchedStrResource, 0, undoConfirmed);
            }
        }
        undo(resourceOrSource) {
            if (resourceOrSource instanceof undoRedo_1.UndoRedoSource) {
                const [, matchedStrResource] = this._findClosestUndoElementWithSource(resourceOrSource.id);
                return matchedStrResource ? this._undo(matchedStrResource, resourceOrSource.id, false) : undefined;
            }
            if (typeof resourceOrSource === 'string') {
                return this._undo(resourceOrSource, 0, false);
            }
            return this._undo(this.getUriComparisonKey(resourceOrSource), 0, false);
        }
        _undo(strResource, sourceId = 0, undoConfirmed) {
            if (!this._editStacks.has(strResource)) {
                return;
            }
            const editStack = this._editStacks.get(strResource);
            const element = editStack.getClosestPastElement();
            if (!element) {
                return;
            }
            if (element.groupId) {
                // this element is a part of a group, we need to make sure undoing in a group is in order
                const [matchedElement, matchedStrResource] = this._findClosestUndoElementInGroup(element.groupId);
                if (element !== matchedElement && matchedStrResource) {
                    // there is an element in the same group that should be undone before this one
                    return this._undo(matchedStrResource, sourceId, undoConfirmed);
                }
            }
            const shouldPromptForConfirmation = (element.sourceId !== sourceId || element.confirmBeforeUndo);
            if (shouldPromptForConfirmation && !undoConfirmed) {
                // Hit a different source or the element asks for prompt before undo, prompt for confirmation
                return this._confirmAndContinueUndo(strResource, sourceId, element);
            }
            try {
                if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                    return this._workspaceUndo(strResource, element, undoConfirmed);
                }
                else {
                    return this._resourceUndo(editStack, element, undoConfirmed);
                }
            }
            finally {
                if (DEBUG) {
                    this._print('undo');
                }
            }
        }
        async _confirmAndContinueUndo(strResource, sourceId, element) {
            const result = await this._dialogService.confirm({
                message: nls.localize('confirmDifferentSource', "Would you like to undo '{0}'?", element.label),
                primaryButton: nls.localize({ key: 'confirmDifferentSource.yes', comment: ['&& denotes a mnemonic'] }, "&&Yes"),
                cancelButton: nls.localize('confirmDifferentSource.no', "No")
            });
            if (!result.confirmed) {
                return;
            }
            return this._undo(strResource, sourceId, true);
        }
        _findClosestRedoElementWithSource(sourceId) {
            if (!sourceId) {
                return [null, null];
            }
            // find an element with sourceId and with the lowest sourceOrder ready to be redone
            let matchedElement = null;
            let matchedStrResource = null;
            for (const [strResource, editStack] of this._editStacks) {
                const candidate = editStack.getClosestFutureElement();
                if (!candidate) {
                    continue;
                }
                if (candidate.sourceId === sourceId) {
                    if (!matchedElement || candidate.sourceOrder < matchedElement.sourceOrder) {
                        matchedElement = candidate;
                        matchedStrResource = strResource;
                    }
                }
            }
            return [matchedElement, matchedStrResource];
        }
        canRedo(resourceOrSource) {
            if (resourceOrSource instanceof undoRedo_1.UndoRedoSource) {
                const [, matchedStrResource] = this._findClosestRedoElementWithSource(resourceOrSource.id);
                return matchedStrResource ? true : false;
            }
            const strResource = this.getUriComparisonKey(resourceOrSource);
            if (this._editStacks.has(strResource)) {
                const editStack = this._editStacks.get(strResource);
                return editStack.hasFutureElements();
            }
            return false;
        }
        _tryToSplitAndRedo(strResource, element, ignoreResources, message) {
            if (element.canSplit()) {
                this._splitFutureWorkspaceElement(element, ignoreResources);
                this._notificationService.warn(message);
                return new WorkspaceVerificationError(this._redo(strResource));
            }
            else {
                // Cannot safely split this workspace element => flush all undo/redo stacks
                for (const strResource of element.strResources) {
                    this.removeElements(strResource);
                }
                this._notificationService.warn(message);
                return new WorkspaceVerificationError();
            }
        }
        _checkWorkspaceRedo(strResource, element, editStackSnapshot, checkInvalidatedResources) {
            if (element.removedResources) {
                return this._tryToSplitAndRedo(strResource, element, element.removedResources, nls.localize({ key: 'cannotWorkspaceRedo', comment: ['{0} is a label for an operation. {1} is another message.'] }, "Could not redo '{0}' across all files. {1}", element.label, element.removedResources.createMessage()));
            }
            if (checkInvalidatedResources && element.invalidatedResources) {
                return this._tryToSplitAndRedo(strResource, element, element.invalidatedResources, nls.localize({ key: 'cannotWorkspaceRedo', comment: ['{0} is a label for an operation. {1} is another message.'] }, "Could not redo '{0}' across all files. {1}", element.label, element.invalidatedResources.createMessage()));
            }
            // this must be the last future element in all the impacted resources!
            const cannotRedoDueToResources = [];
            for (const editStack of editStackSnapshot.editStacks) {
                if (editStack.getClosestFutureElement() !== element) {
                    cannotRedoDueToResources.push(editStack.resourceLabel);
                }
            }
            if (cannotRedoDueToResources.length > 0) {
                return this._tryToSplitAndRedo(strResource, element, null, nls.localize({ key: 'cannotWorkspaceRedoDueToChanges', comment: ['{0} is a label for an operation. {1} is a list of filenames.'] }, "Could not redo '{0}' across all files because changes were made to {1}", element.label, cannotRedoDueToResources.join(', ')));
            }
            const cannotLockDueToResources = [];
            for (const editStack of editStackSnapshot.editStacks) {
                if (editStack.locked) {
                    cannotLockDueToResources.push(editStack.resourceLabel);
                }
            }
            if (cannotLockDueToResources.length > 0) {
                return this._tryToSplitAndRedo(strResource, element, null, nls.localize({ key: 'cannotWorkspaceRedoDueToInProgressUndoRedo', comment: ['{0} is a label for an operation. {1} is a list of filenames.'] }, "Could not redo '{0}' across all files because there is already an undo or redo operation running on {1}", element.label, cannotLockDueToResources.join(', ')));
            }
            // check if new stack elements were added in the meantime...
            if (!editStackSnapshot.isValid()) {
                return this._tryToSplitAndRedo(strResource, element, null, nls.localize({ key: 'cannotWorkspaceRedoDueToInMeantimeUndoRedo', comment: ['{0} is a label for an operation. {1} is a list of filenames.'] }, "Could not redo '{0}' across all files because an undo or redo operation occurred in the meantime", element.label));
            }
            return null;
        }
        _workspaceRedo(strResource, element) {
            const affectedEditStacks = this._getAffectedEditStacks(element);
            const verificationError = this._checkWorkspaceRedo(strResource, element, affectedEditStacks, /*invalidated resources will be checked after the prepare call*/ false);
            if (verificationError) {
                return verificationError.returnValue;
            }
            return this._executeWorkspaceRedo(strResource, element, affectedEditStacks);
        }
        async _executeWorkspaceRedo(strResource, element, editStackSnapshot) {
            // prepare
            let cleanup;
            try {
                cleanup = await this._invokeWorkspacePrepare(element);
            }
            catch (err) {
                return this._onError(err, element);
            }
            // At this point, it is possible that the element has been made invalid in the meantime (due to the prepare await)
            const verificationError = this._checkWorkspaceRedo(strResource, element, editStackSnapshot, /*now also check that there are no more invalidated resources*/ true);
            if (verificationError) {
                cleanup.dispose();
                return verificationError.returnValue;
            }
            for (const editStack of editStackSnapshot.editStacks) {
                editStack.moveForward(element);
            }
            return this._safeInvokeWithLocks(element, () => element.actual.redo(), editStackSnapshot, cleanup, () => this._continueRedoInGroup(element.groupId));
        }
        _resourceRedo(editStack, element) {
            if (!element.isValid) {
                // invalid element => immediately flush edit stack!
                editStack.flushAllElements();
                return;
            }
            if (editStack.locked) {
                const message = nls.localize({ key: 'cannotResourceRedoDueToInProgressUndoRedo', comment: ['{0} is a label for an operation.'] }, "Could not redo '{0}' because there is already an undo or redo operation running.", element.label);
                this._notificationService.warn(message);
                return;
            }
            return this._invokeResourcePrepare(element, (cleanup) => {
                editStack.moveForward(element);
                return this._safeInvokeWithLocks(element, () => element.actual.redo(), new EditStackSnapshot([editStack]), cleanup, () => this._continueRedoInGroup(element.groupId));
            });
        }
        _findClosestRedoElementInGroup(groupId) {
            if (!groupId) {
                return [null, null];
            }
            // find another element with the same groupId and with the lowest groupOrder ready to be redone
            let matchedElement = null;
            let matchedStrResource = null;
            for (const [strResource, editStack] of this._editStacks) {
                const candidate = editStack.getClosestFutureElement();
                if (!candidate) {
                    continue;
                }
                if (candidate.groupId === groupId) {
                    if (!matchedElement || candidate.groupOrder < matchedElement.groupOrder) {
                        matchedElement = candidate;
                        matchedStrResource = strResource;
                    }
                }
            }
            return [matchedElement, matchedStrResource];
        }
        _continueRedoInGroup(groupId) {
            if (!groupId) {
                return;
            }
            const [, matchedStrResource] = this._findClosestRedoElementInGroup(groupId);
            if (matchedStrResource) {
                return this._redo(matchedStrResource);
            }
        }
        redo(resourceOrSource) {
            if (resourceOrSource instanceof undoRedo_1.UndoRedoSource) {
                const [, matchedStrResource] = this._findClosestRedoElementWithSource(resourceOrSource.id);
                return matchedStrResource ? this._redo(matchedStrResource) : undefined;
            }
            if (typeof resourceOrSource === 'string') {
                return this._redo(resourceOrSource);
            }
            return this._redo(this.getUriComparisonKey(resourceOrSource));
        }
        _redo(strResource) {
            if (!this._editStacks.has(strResource)) {
                return;
            }
            const editStack = this._editStacks.get(strResource);
            const element = editStack.getClosestFutureElement();
            if (!element) {
                return;
            }
            if (element.groupId) {
                // this element is a part of a group, we need to make sure redoing in a group is in order
                const [matchedElement, matchedStrResource] = this._findClosestRedoElementInGroup(element.groupId);
                if (element !== matchedElement && matchedStrResource) {
                    // there is an element in the same group that should be redone before this one
                    return this._redo(matchedStrResource);
                }
            }
            try {
                if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                    return this._workspaceRedo(strResource, element);
                }
                else {
                    return this._resourceRedo(editStack, element);
                }
            }
            finally {
                if (DEBUG) {
                    this._print('redo');
                }
            }
        }
    };
    exports.UndoRedoService = UndoRedoService;
    exports.UndoRedoService = UndoRedoService = __decorate([
        __param(0, dialogs_1.IDialogService),
        __param(1, notification_1.INotificationService)
    ], UndoRedoService);
    class WorkspaceVerificationError {
        constructor(returnValue) {
            this.returnValue = returnValue;
        }
    }
    (0, extensions_1.registerSingleton)(undoRedo_1.IUndoRedoService, UndoRedoService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5kb1JlZG9TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdW5kb1JlZG8vY29tbW9uL3VuZG9SZWRvU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhaEcsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBRXBCLFNBQVMsZ0JBQWdCLENBQUMsUUFBYTtRQUN0QyxPQUFPLFFBQVEsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFDM0UsQ0FBQztJQUVELElBQUksbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0lBRTVCLE1BQU0sb0JBQW9CO1FBaUJ6QixZQUFZLE1BQXdCLEVBQUUsYUFBcUIsRUFBRSxXQUFtQixFQUFFLE9BQWUsRUFBRSxVQUFrQixFQUFFLFFBQWdCLEVBQUUsV0FBbUI7WUFoQjVJLE9BQUUsR0FBRyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUM3QixTQUFJLHdDQUFnQztZQWdCbkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUMsaUJBQWlCLElBQUksS0FBSyxDQUFDO1lBQzNELElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1lBQ25DLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1lBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FB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