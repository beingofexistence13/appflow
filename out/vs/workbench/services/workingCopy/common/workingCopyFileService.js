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
    exports.WorkingCopyFileService = exports.IWorkingCopyFileService = void 0;
    exports.IWorkingCopyFileService = (0, instantiation_1.createDecorator)('workingCopyFileService');
    let WorkingCopyFileService = class WorkingCopyFileService extends lifecycle_1.Disposable {
        constructor(fileService, workingCopyService, instantiationService, uriIdentityService) {
            super();
            this.fileService = fileService;
            this.workingCopyService = workingCopyService;
            this.instantiationService = instantiationService;
            this.uriIdentityService = uriIdentityService;
            //#region Events
            this._onWillRunWorkingCopyFileOperation = this._register(new event_1.AsyncEmitter());
            this.onWillRunWorkingCopyFileOperation = this._onWillRunWorkingCopyFileOperation.event;
            this._onDidFailWorkingCopyFileOperation = this._register(new event_1.AsyncEmitter());
            this.onDidFailWorkingCopyFileOperation = this._onDidFailWorkingCopyFileOperation.event;
            this._onDidRunWorkingCopyFileOperation = this._register(new event_1.AsyncEmitter());
            this.onDidRunWorkingCopyFileOperation = this._onDidRunWorkingCopyFileOperation.event;
            //#endregion
            this.correlationIds = 0;
            //#endregion
            //#region File operation participants
            this.fileOperationParticipants = this._register(this.instantiationService.createInstance(workingCopyFileOperationParticipant_1.WorkingCopyFileOperationParticipant));
            //#endregion
            //#region Save participants (stored file working copies only)
            this.saveParticipants = this._register(this.instantiationService.createInstance(storedFileWorkingCopySaveParticipant_1.StoredFileWorkingCopySaveParticipant));
            //#endregion
            //#region Path related
            this.workingCopyProviders = [];
            // register a default working copy provider that uses the working copy service
            this._register(this.registerWorkingCopyProvider(resource => {
                return this.workingCopyService.workingCopies.filter(workingCopy => {
                    if (this.fileService.hasProvider(resource)) {
                        // only check for parents if the resource can be handled
                        // by the file system where we then assume a folder like
                        // path structure
                        return this.uriIdentityService.extUri.isEqualOrParent(workingCopy.resource, resource);
                    }
                    return this.uriIdentityService.extUri.isEqual(workingCopy.resource, resource);
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
                const validateCreates = await async_1.Promises.settled(operations.map(operation => this.fileService.canCreateFile(operation.resource, { overwrite: operation.overwrite })));
                const error = validateCreates.find(validateCreate => validateCreate instanceof Error);
                if (error instanceof Error) {
                    throw error;
                }
            }
            // file operation participant
            const files = operations.map(operation => ({ target: operation.resource }));
            await this.runFileOperationParticipants(files, 0 /* FileOperation.CREATE */, undoInfo, token);
            // before events
            const event = { correlationId: this.correlationIds++, operation: 0 /* FileOperation.CREATE */, files };
            await this._onWillRunWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            // now actually create on disk
            let stats;
            try {
                if (isFile) {
                    stats = await async_1.Promises.settled(operations.map(operation => this.fileService.createFile(operation.resource, operation.contents, { overwrite: operation.overwrite })));
                }
                else {
                    stats = await async_1.Promises.settled(operations.map(operation => this.fileService.createFolder(operation.resource)));
                }
            }
            catch (error) {
                // error event
                await this._onDidFailWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
                throw error;
            }
            // after event
            await this._onDidRunWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            return stats;
        }
        async move(operations, token, undoInfo) {
            return this.doMoveOrCopy(operations, true, token, undoInfo);
        }
        async copy(operations, token, undoInfo) {
            return this.doMoveOrCopy(operations, false, token, undoInfo);
        }
        async doMoveOrCopy(operations, move, token, undoInfo) {
            const stats = [];
            // validate move/copy operation before starting
            for (const { file: { source, target }, overwrite } of operations) {
                const validateMoveOrCopy = await (move ? this.fileService.canMove(source, target, overwrite) : this.fileService.canCopy(source, target, overwrite));
                if (validateMoveOrCopy instanceof Error) {
                    throw validateMoveOrCopy;
                }
            }
            // file operation participant
            const files = operations.map(o => o.file);
            await this.runFileOperationParticipants(files, move ? 2 /* FileOperation.MOVE */ : 3 /* FileOperation.COPY */, undoInfo, token);
            // before event
            const event = { correlationId: this.correlationIds++, operation: move ? 2 /* FileOperation.MOVE */ : 3 /* FileOperation.COPY */, files };
            await this._onWillRunWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            try {
                for (const { file: { source, target }, overwrite } of operations) {
                    // if source and target are not equal, handle dirty working copies
                    // depending on the operation:
                    // - move: revert both source and target (if any)
                    // - copy: revert target (if any)
                    if (!this.uriIdentityService.extUri.isEqual(source, target)) {
                        const dirtyWorkingCopies = (move ? [...this.getDirty(source), ...this.getDirty(target)] : this.getDirty(target));
                        await async_1.Promises.settled(dirtyWorkingCopies.map(dirtyWorkingCopy => dirtyWorkingCopy.revert({ soft: true })));
                    }
                    // now we can rename the source to target via file operation
                    if (move) {
                        stats.push(await this.fileService.move(source, target, overwrite));
                    }
                    else {
                        stats.push(await this.fileService.copy(source, target, overwrite));
                    }
                }
            }
            catch (error) {
                // error event
                await this._onDidFailWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
                throw error;
            }
            // after event
            await this._onDidRunWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            return stats;
        }
        async delete(operations, token, undoInfo) {
            // validate delete operation before starting
            for (const operation of operations) {
                const validateDelete = await this.fileService.canDelete(operation.resource, { recursive: operation.recursive, useTrash: operation.useTrash });
                if (validateDelete instanceof Error) {
                    throw validateDelete;
                }
            }
            // file operation participant
            const files = operations.map(operation => ({ target: operation.resource }));
            await this.runFileOperationParticipants(files, 1 /* FileOperation.DELETE */, undoInfo, token);
            // before events
            const event = { correlationId: this.correlationIds++, operation: 1 /* FileOperation.DELETE */, files };
            await this._onWillRunWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
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
                    await this.fileService.del(operation.resource, { recursive: operation.recursive, useTrash: operation.useTrash });
                }
            }
            catch (error) {
                // error event
                await this._onDidFailWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
                throw error;
            }
            // after event
            await this._onDidRunWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
        }
        addFileOperationParticipant(participant) {
            return this.fileOperationParticipants.addFileOperationParticipant(participant);
        }
        runFileOperationParticipants(files, operation, undoInfo, token) {
            return this.fileOperationParticipants.participate(files, operation, undoInfo, token);
        }
        get hasSaveParticipants() { return this.saveParticipants.length > 0; }
        addSaveParticipant(participant) {
            return this.saveParticipants.addSaveParticipant(participant);
        }
        runSaveParticipants(workingCopy, context, token) {
            return this.saveParticipants.participate(workingCopy, context, token);
        }
        registerWorkingCopyProvider(provider) {
            const remove = (0, arrays_1.insert)(this.workingCopyProviders, provider);
            return (0, lifecycle_1.toDisposable)(remove);
        }
        getDirty(resource) {
            const dirtyWorkingCopies = new Set();
            for (const provider of this.workingCopyProviders) {
                for (const workingCopy of provider(resource)) {
                    if (workingCopy.isDirty()) {
                        dirtyWorkingCopies.add(workingCopy);
                    }
                }
            }
            return Array.from(dirtyWorkingCopies);
        }
    };
    exports.WorkingCopyFileService = WorkingCopyFileService;
    exports.WorkingCopyFileService = WorkingCopyFileService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, workingCopyService_1.IWorkingCopyService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, uriIdentity_1.IUriIdentityService)
    ], WorkingCopyFileService);
    (0, extensions_1.registerSingleton)(exports.IWorkingCopyFileService, WorkingCopyFileService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlGaWxlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy93b3JraW5nQ29weS9jb21tb24vd29ya2luZ0NvcHlGaWxlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFxQm5GLFFBQUEsdUJBQXVCLEdBQUcsSUFBQSwrQkFBZSxFQUEwQix3QkFBd0IsQ0FBQyxDQUFDO0lBb1BuRyxJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLHNCQUFVO1FBbUJyRCxZQUNlLFdBQTBDLEVBQ25DLGtCQUF3RCxFQUN0RCxvQkFBNEQsRUFDOUQsa0JBQXdEO1lBRTdFLEtBQUssRUFBRSxDQUFDO1lBTHVCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2xCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDckMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUM3Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBbkI5RSxnQkFBZ0I7WUFFQyx1Q0FBa0MsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksb0JBQVksRUFBd0IsQ0FBQyxDQUFDO1lBQ3RHLHNDQUFpQyxHQUFHLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxLQUFLLENBQUM7WUFFMUUsdUNBQWtDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLG9CQUFZLEVBQXdCLENBQUMsQ0FBQztZQUN0RyxzQ0FBaUMsR0FBRyxJQUFJLENBQUMsa0NBQWtDLENBQUMsS0FBSyxDQUFDO1lBRTFFLHNDQUFpQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxvQkFBWSxFQUF3QixDQUFDLENBQUM7WUFDckcscUNBQWdDLEdBQUcsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEtBQUssQ0FBQztZQUV6RixZQUFZ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