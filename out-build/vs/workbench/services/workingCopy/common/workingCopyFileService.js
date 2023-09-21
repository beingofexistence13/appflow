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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/base/common/event", "vs/base/common/async", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/base/common/cancellation", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/workingCopy/common/workingCopyFileOperationParticipant", "vs/workbench/services/workingCopy/common/storedFileWorkingCopySaveParticipant"], function (require, exports, instantiation_1, extensions_1, event_1, async_1, arrays_1, lifecycle_1, files_1, cancellation_1, workingCopyService_1, uriIdentity_1, workingCopyFileOperationParticipant_1, storedFileWorkingCopySaveParticipant_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ID = exports.$HD = void 0;
    exports.$HD = (0, instantiation_1.$Bh)('workingCopyFileService');
    let $ID = class $ID extends lifecycle_1.$kc {
        constructor(g, h, j, m) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            //#region Events
            this.a = this.B(new event_1.$hd());
            this.onWillRunWorkingCopyFileOperation = this.a.event;
            this.b = this.B(new event_1.$hd());
            this.onDidFailWorkingCopyFileOperation = this.b.event;
            this.c = this.B(new event_1.$hd());
            this.onDidRunWorkingCopyFileOperation = this.c.event;
            //#endregion
            this.f = 0;
            //#endregion
            //#region File operation participants
            this.r = this.B(this.j.createInstance(workingCopyFileOperationParticipant_1.$vD));
            //#endregion
            //#region Save participants (stored file working copies only)
            this.t = this.B(this.j.createInstance(storedFileWorkingCopySaveParticipant_1.$GD));
            //#endregion
            //#region Path related
            this.u = [];
            // register a default working copy provider that uses the working copy service
            this.B(this.registerWorkingCopyProvider(resource => {
                return this.h.workingCopies.filter(workingCopy => {
                    if (this.g.hasProvider(resource)) {
                        // only check for parents if the resource can be handled
                        // by the file system where we then assume a folder like
                        // path structure
                        return this.m.extUri.isEqualOrParent(workingCopy.resource, resource);
                    }
                    return this.m.extUri.isEqual(workingCopy.resource, resource);
                });
            }));
        }
        //#region File operations
        create(operations, token, undoInfo) {
            return this.doCreateFileOrFolder(operations, true, token, undoInfo);
        }
        createFolder(operations, token, undoInfo) {
            return this.doCreateFileOrFolder(operations, false, token, undoInfo);
        }
        async doCreateFileOrFolder(operations, isFile, token, undoInfo) {
            if (operations.length === 0) {
                return [];
            }
            // validate create operation before starting
            if (isFile) {
                const validateCreates = await async_1.Promises.settled(operations.map(operation => this.g.canCreateFile(operation.resource, { overwrite: operation.overwrite })));
                const error = validateCreates.find(validateCreate => validateCreate instanceof Error);
                if (error instanceof Error) {
                    throw error;
                }
            }
            // file operation participant
            const files = operations.map(operation => ({ target: operation.resource }));
            await this.s(files, 0 /* FileOperation.CREATE */, undoInfo, token);
            // before events
            const event = { correlationId: this.f++, operation: 0 /* FileOperation.CREATE */, files };
            await this.a.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            // now actually create on disk
            let stats;
            try {
                if (isFile) {
                    stats = await async_1.Promises.settled(operations.map(operation => this.g.createFile(operation.resource, operation.contents, { overwrite: operation.overwrite })));
                }
                else {
                    stats = await async_1.Promises.settled(operations.map(operation => this.g.createFolder(operation.resource)));
                }
            }
            catch (error) {
                // error event
                await this.b.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
                throw error;
            }
            // after event
            await this.c.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            return stats;
        }
        async move(operations, token, undoInfo) {
            return this.n(operations, true, token, undoInfo);
        }
        async copy(operations, token, undoInfo) {
            return this.n(operations, false, token, undoInfo);
        }
        async n(operations, move, token, undoInfo) {
            const stats = [];
            // validate move/copy operation before starting
            for (const { file: { source, target }, overwrite } of operations) {
                const validateMoveOrCopy = await (move ? this.g.canMove(source, target, overwrite) : this.g.canCopy(source, target, overwrite));
                if (validateMoveOrCopy instanceof Error) {
                    throw validateMoveOrCopy;
                }
            }
            // file operation participant
            const files = operations.map(o => o.file);
            await this.s(files, move ? 2 /* FileOperation.MOVE */ : 3 /* FileOperation.COPY */, undoInfo, token);
            // before event
            const event = { correlationId: this.f++, operation: move ? 2 /* FileOperation.MOVE */ : 3 /* FileOperation.COPY */, files };
            await this.a.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            try {
                for (const { file: { source, target }, overwrite } of operations) {
                    // if source and target are not equal, handle dirty working copies
                    // depending on the operation:
                    // - move: revert both source and target (if any)
                    // - copy: revert target (if any)
                    if (!this.m.extUri.isEqual(source, target)) {
                        const dirtyWorkingCopies = (move ? [...this.getDirty(source), ...this.getDirty(target)] : this.getDirty(target));
                        await async_1.Promises.settled(dirtyWorkingCopies.map(dirtyWorkingCopy => dirtyWorkingCopy.revert({ soft: true })));
                    }
                    // now we can rename the source to target via file operation
                    if (move) {
                        stats.push(await this.g.move(source, target, overwrite));
                    }
                    else {
                        stats.push(await this.g.copy(source, target, overwrite));
                    }
                }
            }
            catch (error) {
                // error event
                await this.b.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
                throw error;
            }
            // after event
            await this.c.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            return stats;
        }
        async delete(operations, token, undoInfo) {
            // validate delete operation before starting
            for (const operation of operations) {
                const validateDelete = await this.g.canDelete(operation.resource, { recursive: operation.recursive, useTrash: operation.useTrash });
                if (validateDelete instanceof Error) {
                    throw validateDelete;
                }
            }
            // file operation participant
            const files = operations.map(operation => ({ target: operation.resource }));
            await this.s(files, 1 /* FileOperation.DELETE */, undoInfo, token);
            // before events
            const event = { correlationId: this.f++, operation: 1 /* FileOperation.DELETE */, files };
            await this.a.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            // check for any existing dirty working copies for the resource
            // and do a soft revert before deleting to be able to close
            // any opened editor with these working copies
            for (const operation of operations) {
                const dirtyWorkingCopies = this.getDirty(operation.resource);
                await async_1.Promises.settled(dirtyWorkingCopies.map(dirtyWorkingCopy => dirtyWorkingCopy.revert({ soft: true })));
            }
            // now actually delete from disk
            try {
                for (const operation of operations) {
                    await this.g.del(operation.resource, { recursive: operation.recursive, useTrash: operation.useTrash });
                }
            }
            catch (error) {
                // error event
                await this.b.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
                throw error;
            }
            // after event
            await this.c.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
        }
        addFileOperationParticipant(participant) {
            return this.r.addFileOperationParticipant(participant);
        }
        s(files, operation, undoInfo, token) {
            return this.r.participate(files, operation, undoInfo, token);
        }
        get hasSaveParticipants() { return this.t.length > 0; }
        addSaveParticipant(participant) {
            return this.t.addSaveParticipant(participant);
        }
        runSaveParticipants(workingCopy, context, token) {
            return this.t.participate(workingCopy, context, token);
        }
        registerWorkingCopyProvider(provider) {
            const remove = (0, arrays_1.$Sb)(this.u, provider);
            return (0, lifecycle_1.$ic)(remove);
        }
        getDirty(resource) {
            const dirtyWorkingCopies = new Set();
            for (const provider of this.u) {
                for (const workingCopy of provider(resource)) {
                    if (workingCopy.isDirty()) {
                        dirtyWorkingCopies.add(workingCopy);
                    }
                }
            }
            return Array.from(dirtyWorkingCopies);
        }
    };
    exports.$ID = $ID;
    exports.$ID = $ID = __decorate([
        __param(0, files_1.$6j),
        __param(1, workingCopyService_1.$TC),
        __param(2, instantiation_1.$Ah),
        __param(3, uriIdentity_1.$Ck)
    ], $ID);
    (0, extensions_1.$mr)(exports.$HD, $ID, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workingCopyFileService.js.map