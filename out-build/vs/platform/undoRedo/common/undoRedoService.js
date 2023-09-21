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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/severity", "vs/nls!vs/platform/undoRedo/common/undoRedoService", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/platform/notification/common/notification", "vs/platform/undoRedo/common/undoRedo"], function (require, exports, errors_1, lifecycle_1, network_1, severity_1, nls, dialogs_1, extensions_1, notification_1, undoRedo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$myb = void 0;
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
            this.a = new Map();
        }
        createMessage() {
            const externalRemoval = [];
            const noParallelUniverses = [];
            for (const [, element] of this.a) {
                const dest = (element.reason === 0 /* RemovedResourceReason.ExternalRemoval */
                    ? externalRemoval
                    : noParallelUniverses);
                dest.push(element.resourceLabel);
            }
            const messages = [];
            if (externalRemoval.length > 0) {
                messages.push(nls.localize(0, null, externalRemoval.join(', ')));
            }
            if (noParallelUniverses.length > 0) {
                messages.push(nls.localize(1, null, noParallelUniverses.join(', ')));
            }
            return messages.join('\n');
        }
        get size() {
            return this.a.size;
        }
        has(strResource) {
            return this.a.has(strResource);
        }
        set(strResource, value) {
            this.a.set(strResource, value);
        }
        delete(strResource) {
            return this.a.delete(strResource);
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
            this.a = strResource;
            this.b = [];
            this.c = [];
            this.locked = false;
            this.versionId = 1;
        }
        dispose() {
            for (const element of this.b) {
                if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                    element.removeResource(this.resourceLabel, this.a, 0 /* RemovedResourceReason.ExternalRemoval */);
                }
            }
            for (const element of this.c) {
                if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                    element.removeResource(this.resourceLabel, this.a, 0 /* RemovedResourceReason.ExternalRemoval */);
                }
            }
            this.versionId++;
        }
        toString() {
            const result = [];
            result.push(`* ${this.a}:`);
            for (let i = 0; i < this.b.length; i++) {
                result.push(`   * [UNDO] ${this.b[i]}`);
            }
            for (let i = this.c.length - 1; i >= 0; i--) {
                result.push(`   * [REDO] ${this.c[i]}`);
            }
            return result.join('\n');
        }
        flushAllElements() {
            this.b = [];
            this.c = [];
            this.versionId++;
        }
        setElementsIsValid(isValid) {
            for (const element of this.b) {
                if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                    element.setValid(this.resourceLabel, this.a, isValid);
                }
                else {
                    element.setValid(isValid);
                }
            }
            for (const element of this.c) {
                if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                    element.setValid(this.resourceLabel, this.a, isValid);
                }
                else {
                    element.setValid(isValid);
                }
            }
        }
        d(element, isValid) {
            if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                element.setValid(this.resourceLabel, this.a, isValid);
            }
            else {
                element.setValid(isValid);
            }
        }
        setElementsValidFlag(isValid, filter) {
            for (const element of this.b) {
                if (filter(element.actual)) {
                    this.d(element, isValid);
                }
            }
            for (const element of this.c) {
                if (filter(element.actual)) {
                    this.d(element, isValid);
                }
            }
        }
        pushElement(element) {
            // remove the future
            for (const futureElement of this.c) {
                if (futureElement.type === 1 /* UndoRedoElementType.Workspace */) {
                    futureElement.removeResource(this.resourceLabel, this.a, 1 /* RemovedResourceReason.NoParallelUniverses */);
                }
            }
            this.c = [];
            this.b.push(element);
            this.versionId++;
        }
        createSnapshot(resource) {
            const elements = [];
            for (let i = 0, len = this.b.length; i < len; i++) {
                elements.push(this.b[i].id);
            }
            for (let i = this.c.length - 1; i >= 0; i--) {
                elements.push(this.c[i].id);
            }
            return new undoRedo_1.$xu(resource, elements);
        }
        restoreSnapshot(snapshot) {
            const snapshotLength = snapshot.elements.length;
            let isOK = true;
            let snapshotIndex = 0;
            let removePastAfter = -1;
            for (let i = 0, len = this.b.length; i < len; i++, snapshotIndex++) {
                const element = this.b[i];
                if (isOK && (snapshotIndex >= snapshotLength || element.id !== snapshot.elements[snapshotIndex])) {
                    isOK = false;
                    removePastAfter = 0;
                }
                if (!isOK && element.type === 1 /* UndoRedoElementType.Workspace */) {
                    element.removeResource(this.resourceLabel, this.a, 0 /* RemovedResourceReason.ExternalRemoval */);
                }
            }
            let removeFutureBefore = -1;
            for (let i = this.c.length - 1; i >= 0; i--, snapshotIndex++) {
                const element = this.c[i];
                if (isOK && (snapshotIndex >= snapshotLength || element.id !== snapshot.elements[snapshotIndex])) {
                    isOK = false;
                    removeFutureBefore = i;
                }
                if (!isOK && element.type === 1 /* UndoRedoElementType.Workspace */) {
                    element.removeResource(this.resourceLabel, this.a, 0 /* RemovedResourceReason.ExternalRemoval */);
                }
            }
            if (removePastAfter !== -1) {
                this.b = this.b.slice(0, removePastAfter);
            }
            if (removeFutureBefore !== -1) {
                this.c = this.c.slice(removeFutureBefore + 1);
            }
            this.versionId++;
        }
        getElements() {
            const past = [];
            const future = [];
            for (const element of this.b) {
                past.push(element.actual);
            }
            for (const element of this.c) {
                future.push(element.actual);
            }
            return { past, future };
        }
        getClosestPastElement() {
            if (this.b.length === 0) {
                return null;
            }
            return this.b[this.b.length - 1];
        }
        getSecondClosestPastElement() {
            if (this.b.length < 2) {
                return null;
            }
            return this.b[this.b.length - 2];
        }
        getClosestFutureElement() {
            if (this.c.length === 0) {
                return null;
            }
            return this.c[this.c.length - 1];
        }
        hasPastElements() {
            return (this.b.length > 0);
        }
        hasFutureElements() {
            return (this.c.length > 0);
        }
        splitPastWorkspaceElement(toRemove, individualMap) {
            for (let j = this.b.length - 1; j >= 0; j--) {
                if (this.b[j] === toRemove) {
                    if (individualMap.has(this.a)) {
                        // gets replaced
                        this.b[j] = individualMap.get(this.a);
                    }
                    else {
                        // gets deleted
                        this.b.splice(j, 1);
                    }
                    break;
                }
            }
            this.versionId++;
        }
        splitFutureWorkspaceElement(toRemove, individualMap) {
            for (let j = this.c.length - 1; j >= 0; j--) {
                if (this.c[j] === toRemove) {
                    if (individualMap.has(this.a)) {
                        // gets replaced
                        this.c[j] = individualMap.get(this.a);
                    }
                    else {
                        // gets deleted
                        this.c.splice(j, 1);
                    }
                    break;
                }
            }
            this.versionId++;
        }
        moveBackward(element) {
            this.b.pop();
            this.c.push(element);
            this.versionId++;
        }
        moveForward(element) {
            this.c.pop();
            this.b.push(element);
            this.versionId++;
        }
    }
    class EditStackSnapshot {
        constructor(editStacks) {
            this.editStacks = editStacks;
            this.a = [];
            for (let i = 0, len = this.editStacks.length; i < len; i++) {
                this.a[i] = this.editStacks[i].versionId;
            }
        }
        isValid() {
            for (let i = 0, len = this.editStacks.length; i < len; i++) {
                if (this.a[i] !== this.editStacks[i].versionId) {
                    return false;
                }
            }
            return true;
        }
    }
    const missingEditStack = new ResourceEditStack('', '');
    missingEditStack.locked = true;
    let $myb = class $myb {
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.a = new Map();
            this.b = [];
        }
        registerUriComparisonKeyComputer(scheme, uriComparisonKeyComputer) {
            this.b.push([scheme, uriComparisonKeyComputer]);
            return {
                dispose: () => {
                    for (let i = 0, len = this.b.length; i < len; i++) {
                        if (this.b[i][1] === uriComparisonKeyComputer) {
                            this.b.splice(i, 1);
                            return;
                        }
                    }
                }
            };
        }
        getUriComparisonKey(resource) {
            for (const uriComparisonKeyComputer of this.b) {
                if (uriComparisonKeyComputer[0] === resource.scheme) {
                    return uriComparisonKeyComputer[1].getComparisonKey(resource);
                }
            }
            return resource.toString();
        }
        e(label) {
            console.log(`------------------------------------`);
            console.log(`AFTER ${label}: `);
            const str = [];
            for (const element of this.a) {
                str.push(element[1].toString());
            }
            console.log(str.join('\n'));
        }
        pushElement(element, group = undoRedo_1.$yu.None, source = undoRedo_1.$zu.None) {
            if (element.type === 0 /* UndoRedoElementType.Resource */) {
                const resourceLabel = getResourceLabel(element.resource);
                const strResource = this.getUriComparisonKey(element.resource);
                this.f(new ResourceStackElement(element, resourceLabel, strResource, group.id, group.nextOrder(), source.id, source.nextOrder()));
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
                    this.f(new ResourceStackElement(element, resourceLabels[0], strResources[0], group.id, group.nextOrder(), source.id, source.nextOrder()));
                }
                else {
                    this.f(new WorkspaceStackElement(element, resourceLabels, strResources, group.id, group.nextOrder(), source.id, source.nextOrder()));
                }
            }
            if (DEBUG) {
                this.e('pushElement');
            }
        }
        f(element) {
            for (let i = 0, len = element.strResources.length; i < len; i++) {
                const resourceLabel = element.resourceLabels[i];
                const strResource = element.strResources[i];
                let editStack;
                if (this.a.has(strResource)) {
                    editStack = this.a.get(strResource);
                }
                else {
                    editStack = new ResourceEditStack(resourceLabel, strResource);
                    this.a.set(strResource, editStack);
                }
                editStack.pushElement(element);
            }
        }
        getLastElement(resource) {
            const strResource = this.getUriComparisonKey(resource);
            if (this.a.has(strResource)) {
                const editStack = this.a.get(strResource);
                if (editStack.hasFutureElements()) {
                    return null;
                }
                const closestPastElement = editStack.getClosestPastElement();
                return closestPastElement ? closestPastElement.actual : null;
            }
            return null;
        }
        g(toRemove, ignoreResources) {
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
                const editStack = this.a.get(strResource);
                editStack.splitPastWorkspaceElement(toRemove, individualMap);
            }
        }
        h(toRemove, ignoreResources) {
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
                const editStack = this.a.get(strResource);
                editStack.splitFutureWorkspaceElement(toRemove, individualMap);
            }
        }
        removeElements(resource) {
            const strResource = typeof resource === 'string' ? resource : this.getUriComparisonKey(resource);
            if (this.a.has(strResource)) {
                const editStack = this.a.get(strResource);
                editStack.dispose();
                this.a.delete(strResource);
            }
            if (DEBUG) {
                this.e('removeElements');
            }
        }
        setElementsValidFlag(resource, isValid, filter) {
            const strResource = this.getUriComparisonKey(resource);
            if (this.a.has(strResource)) {
                const editStack = this.a.get(strResource);
                editStack.setElementsValidFlag(isValid, filter);
            }
            if (DEBUG) {
                this.e('setElementsValidFlag');
            }
        }
        hasElements(resource) {
            const strResource = this.getUriComparisonKey(resource);
            if (this.a.has(strResource)) {
                const editStack = this.a.get(strResource);
                return (editStack.hasPastElements() || editStack.hasFutureElements());
            }
            return false;
        }
        createSnapshot(resource) {
            const strResource = this.getUriComparisonKey(resource);
            if (this.a.has(strResource)) {
                const editStack = this.a.get(strResource);
                return editStack.createSnapshot(resource);
            }
            return new undoRedo_1.$xu(resource, []);
        }
        restoreSnapshot(snapshot) {
            const strResource = this.getUriComparisonKey(snapshot.resource);
            if (this.a.has(strResource)) {
                const editStack = this.a.get(strResource);
                editStack.restoreSnapshot(snapshot);
                if (!editStack.hasPastElements() && !editStack.hasFutureElements()) {
                    // the edit stack is now empty, just remove it entirely
                    editStack.dispose();
                    this.a.delete(strResource);
                }
            }
            if (DEBUG) {
                this.e('restoreSnapshot');
            }
        }
        getElements(resource) {
            const strResource = this.getUriComparisonKey(resource);
            if (this.a.has(strResource)) {
                const editStack = this.a.get(strResource);
                return editStack.getElements();
            }
            return { past: [], future: [] };
        }
        k(sourceId) {
            if (!sourceId) {
                return [null, null];
            }
            // find an element with the sourceId and with the highest sourceOrder ready to be undone
            let matchedElement = null;
            let matchedStrResource = null;
            for (const [strResource, editStack] of this.a) {
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
            if (resourceOrSource instanceof undoRedo_1.$zu) {
                const [, matchedStrResource] = this.k(resourceOrSource.id);
                return matchedStrResource ? true : false;
            }
            const strResource = this.getUriComparisonKey(resourceOrSource);
            if (this.a.has(strResource)) {
                const editStack = this.a.get(strResource);
                return editStack.hasPastElements();
            }
            return false;
        }
        l(err, element) {
            (0, errors_1.$Y)(err);
            // An error occurred while undoing or redoing => drop the undo/redo stack for all affected resources
            for (const strResource of element.strResources) {
                this.removeElements(strResource);
            }
            this.d.error(err);
        }
        m(editStackSnapshot) {
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
        n(element, invoke, editStackSnapshot, cleanup, continuation) {
            const releaseLocks = this.m(editStackSnapshot);
            let result;
            try {
                result = invoke();
            }
            catch (err) {
                releaseLocks();
                cleanup.dispose();
                return this.l(err, element);
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
                    return this.l(err, element);
                });
            }
            else {
                // result is void
                releaseLocks();
                cleanup.dispose();
                return continuation();
            }
        }
        async o(element) {
            if (typeof element.actual.prepareUndoRedo === 'undefined') {
                return lifecycle_1.$kc.None;
            }
            const result = element.actual.prepareUndoRedo();
            if (typeof result === 'undefined') {
                return lifecycle_1.$kc.None;
            }
            return result;
        }
        p(element, callback) {
            if (element.actual.type !== 1 /* UndoRedoElementType.Workspace */ || typeof element.actual.prepareUndoRedo === 'undefined') {
                // no preparation needed
                return callback(lifecycle_1.$kc.None);
            }
            const r = element.actual.prepareUndoRedo();
            if (!r) {
                // nothing to clean up
                return callback(lifecycle_1.$kc.None);
            }
            if ((0, lifecycle_1.$ec)(r)) {
                return callback(r);
            }
            return r.then((disposable) => {
                return callback(disposable);
            });
        }
        q(element) {
            const affectedEditStacks = [];
            for (const strResource of element.strResources) {
                affectedEditStacks.push(this.a.get(strResource) || missingEditStack);
            }
            return new EditStackSnapshot(affectedEditStacks);
        }
        s(strResource, element, ignoreResources, message) {
            if (element.canSplit()) {
                this.g(element, ignoreResources);
                this.d.warn(message);
                return new WorkspaceVerificationError(this.A(strResource, 0, true));
            }
            else {
                // Cannot safely split this workspace element => flush all undo/redo stacks
                for (const strResource of element.strResources) {
                    this.removeElements(strResource);
                }
                this.d.warn(message);
                return new WorkspaceVerificationError();
            }
        }
        t(strResource, element, editStackSnapshot, checkInvalidatedResources) {
            if (element.removedResources) {
                return this.s(strResource, element, element.removedResources, nls.localize(2, null, element.label, element.removedResources.createMessage()));
            }
            if (checkInvalidatedResources && element.invalidatedResources) {
                return this.s(strResource, element, element.invalidatedResources, nls.localize(3, null, element.label, element.invalidatedResources.createMessage()));
            }
            // this must be the last past element in all the impacted resources!
            const cannotUndoDueToResources = [];
            for (const editStack of editStackSnapshot.editStacks) {
                if (editStack.getClosestPastElement() !== element) {
                    cannotUndoDueToResources.push(editStack.resourceLabel);
                }
            }
            if (cannotUndoDueToResources.length > 0) {
                return this.s(strResource, element, null, nls.localize(4, null, element.label, cannotUndoDueToResources.join(', ')));
            }
            const cannotLockDueToResources = [];
            for (const editStack of editStackSnapshot.editStacks) {
                if (editStack.locked) {
                    cannotLockDueToResources.push(editStack.resourceLabel);
                }
            }
            if (cannotLockDueToResources.length > 0) {
                return this.s(strResource, element, null, nls.localize(5, null, element.label, cannotLockDueToResources.join(', ')));
            }
            // check if new stack elements were added in the meantime...
            if (!editStackSnapshot.isValid()) {
                return this.s(strResource, element, null, nls.localize(6, null, element.label));
            }
            return null;
        }
        u(strResource, element, undoConfirmed) {
            const affectedEditStacks = this.q(element);
            const verificationError = this.t(strResource, element, affectedEditStacks, /*invalidated resources will be checked after the prepare call*/ false);
            if (verificationError) {
                return verificationError.returnValue;
            }
            return this.w(strResource, element, affectedEditStacks, undoConfirmed);
        }
        v(element) {
            if (!element.groupId) {
                return false;
            }
            // check that there is at least another element with the same groupId ready to be undone
            for (const [, editStack] of this.a) {
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
        async w(strResource, element, editStackSnapshot, undoConfirmed) {
            if (element.canSplit() && !this.v(element)) {
                // this element can be split
                let UndoChoice;
                (function (UndoChoice) {
                    UndoChoice[UndoChoice["All"] = 0] = "All";
                    UndoChoice[UndoChoice["This"] = 1] = "This";
                    UndoChoice[UndoChoice["Cancel"] = 2] = "Cancel";
                })(UndoChoice || (UndoChoice = {}));
                const { result } = await this.c.prompt({
                    type: severity_1.default.Info,
                    message: nls.localize(7, null, element.label),
                    buttons: [
                        {
                            label: nls.localize(8, null, editStackSnapshot.editStacks.length),
                            run: () => UndoChoice.All
                        },
                        {
                            label: nls.localize(9, null),
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
                    this.g(element, null);
                    return this.A(strResource, 0, true);
                }
                // choice: undo in all files
                // At this point, it is possible that the element has been made invalid in the meantime (due to the confirmation await)
                const verificationError1 = this.t(strResource, element, editStackSnapshot, /*invalidated resources will be checked after the prepare call*/ false);
                if (verificationError1) {
                    return verificationError1.returnValue;
                }
                undoConfirmed = true;
            }
            // prepare
            let cleanup;
            try {
                cleanup = await this.o(element);
            }
            catch (err) {
                return this.l(err, element);
            }
            // At this point, it is possible that the element has been made invalid in the meantime (due to the prepare await)
            const verificationError2 = this.t(strResource, element, editStackSnapshot, /*now also check that there are no more invalidated resources*/ true);
            if (verificationError2) {
                cleanup.dispose();
                return verificationError2.returnValue;
            }
            for (const editStack of editStackSnapshot.editStacks) {
                editStack.moveBackward(element);
            }
            return this.n(element, () => element.actual.undo(), editStackSnapshot, cleanup, () => this.z(element.groupId, undoConfirmed));
        }
        x(editStack, element, undoConfirmed) {
            if (!element.isValid) {
                // invalid element => immediately flush edit stack!
                editStack.flushAllElements();
                return;
            }
            if (editStack.locked) {
                const message = nls.localize(10, null, element.label);
                this.d.warn(message);
                return;
            }
            return this.p(element, (cleanup) => {
                editStack.moveBackward(element);
                return this.n(element, () => element.actual.undo(), new EditStackSnapshot([editStack]), cleanup, () => this.z(element.groupId, undoConfirmed));
            });
        }
        y(groupId) {
            if (!groupId) {
                return [null, null];
            }
            // find another element with the same groupId and with the highest groupOrder ready to be undone
            let matchedElement = null;
            let matchedStrResource = null;
            for (const [strResource, editStack] of this.a) {
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
        z(groupId, undoConfirmed) {
            if (!groupId) {
                return;
            }
            const [, matchedStrResource] = this.y(groupId);
            if (matchedStrResource) {
                return this.A(matchedStrResource, 0, undoConfirmed);
            }
        }
        undo(resourceOrSource) {
            if (resourceOrSource instanceof undoRedo_1.$zu) {
                const [, matchedStrResource] = this.k(resourceOrSource.id);
                return matchedStrResource ? this.A(matchedStrResource, resourceOrSource.id, false) : undefined;
            }
            if (typeof resourceOrSource === 'string') {
                return this.A(resourceOrSource, 0, false);
            }
            return this.A(this.getUriComparisonKey(resourceOrSource), 0, false);
        }
        A(strResource, sourceId = 0, undoConfirmed) {
            if (!this.a.has(strResource)) {
                return;
            }
            const editStack = this.a.get(strResource);
            const element = editStack.getClosestPastElement();
            if (!element) {
                return;
            }
            if (element.groupId) {
                // this element is a part of a group, we need to make sure undoing in a group is in order
                const [matchedElement, matchedStrResource] = this.y(element.groupId);
                if (element !== matchedElement && matchedStrResource) {
                    // there is an element in the same group that should be undone before this one
                    return this.A(matchedStrResource, sourceId, undoConfirmed);
                }
            }
            const shouldPromptForConfirmation = (element.sourceId !== sourceId || element.confirmBeforeUndo);
            if (shouldPromptForConfirmation && !undoConfirmed) {
                // Hit a different source or the element asks for prompt before undo, prompt for confirmation
                return this.B(strResource, sourceId, element);
            }
            try {
                if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                    return this.u(strResource, element, undoConfirmed);
                }
                else {
                    return this.x(editStack, element, undoConfirmed);
                }
            }
            finally {
                if (DEBUG) {
                    this.e('undo');
                }
            }
        }
        async B(strResource, sourceId, element) {
            const result = await this.c.confirm({
                message: nls.localize(11, null, element.label),
                primaryButton: nls.localize(12, null),
                cancelButton: nls.localize(13, null)
            });
            if (!result.confirmed) {
                return;
            }
            return this.A(strResource, sourceId, true);
        }
        C(sourceId) {
            if (!sourceId) {
                return [null, null];
            }
            // find an element with sourceId and with the lowest sourceOrder ready to be redone
            let matchedElement = null;
            let matchedStrResource = null;
            for (const [strResource, editStack] of this.a) {
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
            if (resourceOrSource instanceof undoRedo_1.$zu) {
                const [, matchedStrResource] = this.C(resourceOrSource.id);
                return matchedStrResource ? true : false;
            }
            const strResource = this.getUriComparisonKey(resourceOrSource);
            if (this.a.has(strResource)) {
                const editStack = this.a.get(strResource);
                return editStack.hasFutureElements();
            }
            return false;
        }
        D(strResource, element, ignoreResources, message) {
            if (element.canSplit()) {
                this.h(element, ignoreResources);
                this.d.warn(message);
                return new WorkspaceVerificationError(this.K(strResource));
            }
            else {
                // Cannot safely split this workspace element => flush all undo/redo stacks
                for (const strResource of element.strResources) {
                    this.removeElements(strResource);
                }
                this.d.warn(message);
                return new WorkspaceVerificationError();
            }
        }
        E(strResource, element, editStackSnapshot, checkInvalidatedResources) {
            if (element.removedResources) {
                return this.D(strResource, element, element.removedResources, nls.localize(14, null, element.label, element.removedResources.createMessage()));
            }
            if (checkInvalidatedResources && element.invalidatedResources) {
                return this.D(strResource, element, element.invalidatedResources, nls.localize(15, null, element.label, element.invalidatedResources.createMessage()));
            }
            // this must be the last future element in all the impacted resources!
            const cannotRedoDueToResources = [];
            for (const editStack of editStackSnapshot.editStacks) {
                if (editStack.getClosestFutureElement() !== element) {
                    cannotRedoDueToResources.push(editStack.resourceLabel);
                }
            }
            if (cannotRedoDueToResources.length > 0) {
                return this.D(strResource, element, null, nls.localize(16, null, element.label, cannotRedoDueToResources.join(', ')));
            }
            const cannotLockDueToResources = [];
            for (const editStack of editStackSnapshot.editStacks) {
                if (editStack.locked) {
                    cannotLockDueToResources.push(editStack.resourceLabel);
                }
            }
            if (cannotLockDueToResources.length > 0) {
                return this.D(strResource, element, null, nls.localize(17, null, element.label, cannotLockDueToResources.join(', ')));
            }
            // check if new stack elements were added in the meantime...
            if (!editStackSnapshot.isValid()) {
                return this.D(strResource, element, null, nls.localize(18, null, element.label));
            }
            return null;
        }
        F(strResource, element) {
            const affectedEditStacks = this.q(element);
            const verificationError = this.E(strResource, element, affectedEditStacks, /*invalidated resources will be checked after the prepare call*/ false);
            if (verificationError) {
                return verificationError.returnValue;
            }
            return this.G(strResource, element, affectedEditStacks);
        }
        async G(strResource, element, editStackSnapshot) {
            // prepare
            let cleanup;
            try {
                cleanup = await this.o(element);
            }
            catch (err) {
                return this.l(err, element);
            }
            // At this point, it is possible that the element has been made invalid in the meantime (due to the prepare await)
            const verificationError = this.E(strResource, element, editStackSnapshot, /*now also check that there are no more invalidated resources*/ true);
            if (verificationError) {
                cleanup.dispose();
                return verificationError.returnValue;
            }
            for (const editStack of editStackSnapshot.editStacks) {
                editStack.moveForward(element);
            }
            return this.n(element, () => element.actual.redo(), editStackSnapshot, cleanup, () => this.J(element.groupId));
        }
        H(editStack, element) {
            if (!element.isValid) {
                // invalid element => immediately flush edit stack!
                editStack.flushAllElements();
                return;
            }
            if (editStack.locked) {
                const message = nls.localize(19, null, element.label);
                this.d.warn(message);
                return;
            }
            return this.p(element, (cleanup) => {
                editStack.moveForward(element);
                return this.n(element, () => element.actual.redo(), new EditStackSnapshot([editStack]), cleanup, () => this.J(element.groupId));
            });
        }
        I(groupId) {
            if (!groupId) {
                return [null, null];
            }
            // find another element with the same groupId and with the lowest groupOrder ready to be redone
            let matchedElement = null;
            let matchedStrResource = null;
            for (const [strResource, editStack] of this.a) {
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
        J(groupId) {
            if (!groupId) {
                return;
            }
            const [, matchedStrResource] = this.I(groupId);
            if (matchedStrResource) {
                return this.K(matchedStrResource);
            }
        }
        redo(resourceOrSource) {
            if (resourceOrSource instanceof undoRedo_1.$zu) {
                const [, matchedStrResource] = this.C(resourceOrSource.id);
                return matchedStrResource ? this.K(matchedStrResource) : undefined;
            }
            if (typeof resourceOrSource === 'string') {
                return this.K(resourceOrSource);
            }
            return this.K(this.getUriComparisonKey(resourceOrSource));
        }
        K(strResource) {
            if (!this.a.has(strResource)) {
                return;
            }
            const editStack = this.a.get(strResource);
            const element = editStack.getClosestFutureElement();
            if (!element) {
                return;
            }
            if (element.groupId) {
                // this element is a part of a group, we need to make sure redoing in a group is in order
                const [matchedElement, matchedStrResource] = this.I(element.groupId);
                if (element !== matchedElement && matchedStrResource) {
                    // there is an element in the same group that should be redone before this one
                    return this.K(matchedStrResource);
                }
            }
            try {
                if (element.type === 1 /* UndoRedoElementType.Workspace */) {
                    return this.F(strResource, element);
                }
                else {
                    return this.H(editStack, element);
                }
            }
            finally {
                if (DEBUG) {
                    this.e('redo');
                }
            }
        }
    };
    exports.$myb = $myb;
    exports.$myb = $myb = __decorate([
        __param(0, dialogs_1.$oA),
        __param(1, notification_1.$Yu)
    ], $myb);
    class WorkspaceVerificationError {
        constructor(returnValue) {
            this.returnValue = returnValue;
        }
    }
    (0, extensions_1.$mr)(undoRedo_1.$wu, $myb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=undoRedoService.js.map