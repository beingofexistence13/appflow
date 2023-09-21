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
define(["require", "exports", "vs/platform/files/common/files", "vs/platform/configuration/common/configuration", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/undoRedo/common/undoRedo", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/base/common/cancellation", "vs/base/common/arrays", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/network"], function (require, exports, files_1, configuration_1, workingCopyFileService_1, undoRedo_1, instantiation_1, log_1, cancellation_1, arrays_1, textfiles_1, network_1) {
    "use strict";
    var RenameOperation_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BulkFileEdits = void 0;
    class Noop {
        constructor() {
            this.uris = [];
        }
        async perform() { return this; }
        toString() {
            return '(noop)';
        }
    }
    class RenameEdit {
        constructor(newUri, oldUri, options) {
            this.newUri = newUri;
            this.oldUri = oldUri;
            this.options = options;
            this.type = 'rename';
        }
    }
    let RenameOperation = RenameOperation_1 = class RenameOperation {
        constructor(_edits, _undoRedoInfo, _workingCopyFileService, _fileService) {
            this._edits = _edits;
            this._undoRedoInfo = _undoRedoInfo;
            this._workingCopyFileService = _workingCopyFileService;
            this._fileService = _fileService;
        }
        get uris() {
            return this._edits.map(edit => [edit.newUri, edit.oldUri]).flat();
        }
        async perform(token) {
            const moves = [];
            const undoes = [];
            for (const edit of this._edits) {
                // check: not overwriting, but ignoring, and the target file exists
                const skip = edit.options.overwrite === undefined && edit.options.ignoreIfExists && await this._fileService.exists(edit.newUri);
                if (!skip) {
                    moves.push({
                        file: { source: edit.oldUri, target: edit.newUri },
                        overwrite: edit.options.overwrite
                    });
                    // reverse edit
                    undoes.push(new RenameEdit(edit.oldUri, edit.newUri, edit.options));
                }
            }
            if (moves.length === 0) {
                return new Noop();
            }
            await this._workingCopyFileService.move(moves, token, this._undoRedoInfo);
            return new RenameOperation_1(undoes, { isUndoing: true }, this._workingCopyFileService, this._fileService);
        }
        toString() {
            return `(rename ${this._edits.map(edit => `${edit.oldUri} to ${edit.newUri}`).join(', ')})`;
        }
    };
    RenameOperation = RenameOperation_1 = __decorate([
        __param(2, workingCopyFileService_1.IWorkingCopyFileService),
        __param(3, files_1.IFileService)
    ], RenameOperation);
    class CopyEdit {
        constructor(newUri, oldUri, options) {
            this.newUri = newUri;
            this.oldUri = oldUri;
            this.options = options;
            this.type = 'copy';
        }
    }
    let CopyOperation = class CopyOperation {
        constructor(_edits, _undoRedoInfo, _workingCopyFileService, _fileService, _instaService) {
            this._edits = _edits;
            this._undoRedoInfo = _undoRedoInfo;
            this._workingCopyFileService = _workingCopyFileService;
            this._fileService = _fileService;
            this._instaService = _instaService;
        }
        get uris() {
            return this._edits.map(edit => [edit.newUri, edit.oldUri]).flat();
        }
        async perform(token) {
            // (1) create copy operations, remove noops
            const copies = [];
            for (const edit of this._edits) {
                //check: not overwriting, but ignoring, and the target file exists
                const skip = edit.options.overwrite === undefined && edit.options.ignoreIfExists && await this._fileService.exists(edit.newUri);
                if (!skip) {
                    copies.push({ file: { source: edit.oldUri, target: edit.newUri }, overwrite: edit.options.overwrite });
                }
            }
            if (copies.length === 0) {
                return new Noop();
            }
            // (2) perform the actual copy and use the return stats to build undo edits
            const stats = await this._workingCopyFileService.copy(copies, token, this._undoRedoInfo);
            const undoes = [];
            for (let i = 0; i < stats.length; i++) {
                const stat = stats[i];
                const edit = this._edits[i];
                undoes.push(new DeleteEdit(stat.resource, { recursive: true, folder: this._edits[i].options.folder || stat.isDirectory, ...edit.options }, false));
            }
            return this._instaService.createInstance(DeleteOperation, undoes, { isUndoing: true });
        }
        toString() {
            return `(copy ${this._edits.map(edit => `${edit.oldUri} to ${edit.newUri}`).join(', ')})`;
        }
    };
    CopyOperation = __decorate([
        __param(2, workingCopyFileService_1.IWorkingCopyFileService),
        __param(3, files_1.IFileService),
        __param(4, instantiation_1.IInstantiationService)
    ], CopyOperation);
    class CreateEdit {
        constructor(newUri, options, contents) {
            this.newUri = newUri;
            this.options = options;
            this.contents = contents;
            this.type = 'create';
        }
    }
    let CreateOperation = class CreateOperation {
        constructor(_edits, _undoRedoInfo, _fileService, _workingCopyFileService, _instaService, _textFileService) {
            this._edits = _edits;
            this._undoRedoInfo = _undoRedoInfo;
            this._fileService = _fileService;
            this._workingCopyFileService = _workingCopyFileService;
            this._instaService = _instaService;
            this._textFileService = _textFileService;
        }
        get uris() {
            return this._edits.map(edit => edit.newUri);
        }
        async perform(token) {
            const folderCreates = [];
            const fileCreates = [];
            const undoes = [];
            for (const edit of this._edits) {
                if (edit.newUri.scheme === network_1.Schemas.untitled) {
                    continue; // ignore, will be handled by a later edit
                }
                if (edit.options.overwrite === undefined && edit.options.ignoreIfExists && await this._fileService.exists(edit.newUri)) {
                    continue; // not overwriting, but ignoring, and the target file exists
                }
                if (edit.options.folder) {
                    folderCreates.push({ resource: edit.newUri });
                }
                else {
                    // If the contents are part of the edit they include the encoding, thus use them. Otherwise get the encoding for a new empty file.
                    const encodedReadable = typeof edit.contents !== 'undefined' ? edit.contents : await this._textFileService.getEncodedReadable(edit.newUri);
                    fileCreates.push({ resource: edit.newUri, contents: encodedReadable, overwrite: edit.options.overwrite });
                }
                undoes.push(new DeleteEdit(edit.newUri, edit.options, !edit.options.folder && !edit.contents));
            }
            if (folderCreates.length === 0 && fileCreates.length === 0) {
                return new Noop();
            }
            await this._workingCopyFileService.createFolder(folderCreates, token, this._undoRedoInfo);
            await this._workingCopyFileService.create(fileCreates, token, this._undoRedoInfo);
            return this._instaService.createInstance(DeleteOperation, undoes, { isUndoing: true });
        }
        toString() {
            return `(create ${this._edits.map(edit => edit.options.folder ? `folder ${edit.newUri}` : `file ${edit.newUri} with ${edit.contents?.byteLength || 0} bytes`).join(', ')})`;
        }
    };
    CreateOperation = __decorate([
        __param(2, files_1.IFileService),
        __param(3, workingCopyFileService_1.IWorkingCopyFileService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, textfiles_1.ITextFileService)
    ], CreateOperation);
    class DeleteEdit {
        constructor(oldUri, options, undoesCreate) {
            this.oldUri = oldUri;
            this.options = options;
            this.undoesCreate = undoesCreate;
            this.type = 'delete';
        }
    }
    let DeleteOperation = class DeleteOperation {
        constructor(_edits, _undoRedoInfo, _workingCopyFileService, _fileService, _configurationService, _instaService, _logService) {
            this._edits = _edits;
            this._undoRedoInfo = _undoRedoInfo;
            this._workingCopyFileService = _workingCopyFileService;
            this._fileService = _fileService;
            this._configurationService = _configurationService;
            this._instaService = _instaService;
            this._logService = _logService;
        }
        get uris() {
            return this._edits.map(edit => edit.oldUri);
        }
        async perform(token) {
            // delete file
            const deletes = [];
            const undoes = [];
            for (const edit of this._edits) {
                let fileStat;
                try {
                    fileStat = await this._fileService.resolve(edit.oldUri, { resolveMetadata: true });
                }
                catch (err) {
                    if (!edit.options.ignoreIfNotExists) {
                        throw new Error(`${edit.oldUri} does not exist and can not be deleted`);
                    }
                    continue;
                }
                deletes.push({
                    resource: edit.oldUri,
                    recursive: edit.options.recursive,
                    useTrash: !edit.options.skipTrashBin && this._fileService.hasCapability(edit.oldUri, 4096 /* FileSystemProviderCapabilities.Trash */) && this._configurationService.getValue('files.enableTrash')
                });
                // read file contents for undo operation. when a file is too large it won't be restored
                let fileContent;
                if (!edit.undoesCreate && !edit.options.folder && !(typeof edit.options.maxSize === 'number' && fileStat.size > edit.options.maxSize)) {
                    try {
                        fileContent = await this._fileService.readFile(edit.oldUri);
                    }
                    catch (err) {
                        this._logService.error(err);
                    }
                }
                if (fileContent !== undefined) {
                    undoes.push(new CreateEdit(edit.oldUri, edit.options, fileContent.value));
                }
            }
            if (deletes.length === 0) {
                return new Noop();
            }
            await this._workingCopyFileService.delete(deletes, token, this._undoRedoInfo);
            if (undoes.length === 0) {
                return new Noop();
            }
            return this._instaService.createInstance(CreateOperation, undoes, { isUndoing: true });
        }
        toString() {
            return `(delete ${this._edits.map(edit => edit.oldUri).join(', ')})`;
        }
    };
    DeleteOperation = __decorate([
        __param(2, workingCopyFileService_1.IWorkingCopyFileService),
        __param(3, files_1.IFileService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, log_1.ILogService)
    ], DeleteOperation);
    class FileUndoRedoElement {
        constructor(label, code, operations, confirmBeforeUndo) {
            this.label = label;
            this.code = code;
            this.operations = operations;
            this.confirmBeforeUndo = confirmBeforeUndo;
            this.type = 1 /* UndoRedoElementType.Workspace */;
            this.resources = operations.map(op => op.uris).flat();
        }
        async undo() {
            await this._reverse();
        }
        async redo() {
            await this._reverse();
        }
        async _reverse() {
            for (let i = 0; i < this.operations.length; i++) {
                const op = this.operations[i];
                const undo = await op.perform(cancellation_1.CancellationToken.None);
                this.operations[i] = undo;
            }
        }
        toString() {
            return this.operations.map(op => String(op)).join(', ');
        }
    }
    let BulkFileEdits = class BulkFileEdits {
        constructor(_label, _code, _undoRedoGroup, _undoRedoSource, _confirmBeforeUndo, _progress, _token, _edits, _instaService, _undoRedoService) {
            this._label = _label;
            this._code = _code;
            this._undoRedoGroup = _undoRedoGroup;
            this._undoRedoSource = _undoRedoSource;
            this._confirmBeforeUndo = _confirmBeforeUndo;
            this._progress = _progress;
            this._token = _token;
            this._edits = _edits;
            this._instaService = _instaService;
            this._undoRedoService = _undoRedoService;
        }
        async apply() {
            const undoOperations = [];
            const undoRedoInfo = { undoRedoGroupId: this._undoRedoGroup.id };
            const edits = [];
            for (const edit of this._edits) {
                if (edit.newResource && edit.oldResource && !edit.options?.copy) {
                    edits.push(new RenameEdit(edit.newResource, edit.oldResource, edit.options ?? {}));
                }
                else if (edit.newResource && edit.oldResource && edit.options?.copy) {
                    edits.push(new CopyEdit(edit.newResource, edit.oldResource, edit.options ?? {}));
                }
                else if (!edit.newResource && edit.oldResource) {
                    edits.push(new DeleteEdit(edit.oldResource, edit.options ?? {}, false));
                }
                else if (edit.newResource && !edit.oldResource) {
                    edits.push(new CreateEdit(edit.newResource, edit.options ?? {}, await edit.options.contents));
                }
            }
            if (edits.length === 0) {
                return [];
            }
            const groups = [];
            groups[0] = [edits[0]];
            for (let i = 1; i < edits.length; i++) {
                const edit = edits[i];
                const lastGroup = (0, arrays_1.tail)(groups);
                if (lastGroup[0].type === edit.type) {
                    lastGroup.push(edit);
                }
                else {
                    groups.push([edit]);
                }
            }
            for (const group of groups) {
                if (this._token.isCancellationRequested) {
                    break;
                }
                let op;
                switch (group[0].type) {
                    case 'rename':
                        op = this._instaService.createInstance(RenameOperation, group, undoRedoInfo);
                        break;
                    case 'copy':
                        op = this._instaService.createInstance(CopyOperation, group, undoRedoInfo);
                        break;
                    case 'delete':
                        op = this._instaService.createInstance(DeleteOperation, group, undoRedoInfo);
                        break;
                    case 'create':
                        op = this._instaService.createInstance(CreateOperation, group, undoRedoInfo);
                        break;
                }
                if (op) {
                    const undoOp = await op.perform(this._token);
                    undoOperations.push(undoOp);
                }
                this._progress.report(undefined);
            }
            const undoRedoElement = new FileUndoRedoElement(this._label, this._code, undoOperations, this._confirmBeforeUndo);
            this._undoRedoService.pushElement(undoRedoElement, this._undoRedoGroup, this._undoRedoSource);
            return undoRedoElement.resources;
        }
    };
    exports.BulkFileEdits = BulkFileEdits;
    exports.BulkFileEdits = BulkFileEdits = __decorate([
        __param(8, instantiation_1.IInstantiationService),
        __param(9, undoRedo_1.IUndoRedoService)
    ], BulkFileEdits);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVsa0ZpbGVFZGl0cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2J1bGtFZGl0L2Jyb3dzZXIvYnVsa0ZpbGVFZGl0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBd0JoRyxNQUFNLElBQUk7UUFBVjtZQUNVLFNBQUksR0FBRyxFQUFFLENBQUM7UUFLcEIsQ0FBQztRQUpBLEtBQUssQ0FBQyxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLFFBQVE7WUFDUCxPQUFPLFFBQVEsQ0FBQztRQUNqQixDQUFDO0tBQ0Q7SUFFRCxNQUFNLFVBQVU7UUFFZixZQUNVLE1BQVcsRUFDWCxNQUFXLEVBQ1gsT0FBaUM7WUFGakMsV0FBTSxHQUFOLE1BQU0sQ0FBSztZQUNYLFdBQU0sR0FBTixNQUFNLENBQUs7WUFDWCxZQUFPLEdBQVAsT0FBTyxDQUEwQjtZQUpsQyxTQUFJLEdBQUcsUUFBUSxDQUFDO1FBS3JCLENBQUM7S0FDTDtJQUVELElBQU0sZUFBZSx1QkFBckIsTUFBTSxlQUFlO1FBRXBCLFlBQ2tCLE1BQW9CLEVBQ3BCLGFBQXlDLEVBQ2hCLHVCQUFnRCxFQUMzRCxZQUEwQjtZQUh4QyxXQUFNLEdBQU4sTUFBTSxDQUFjO1lBQ3BCLGtCQUFhLEdBQWIsYUFBYSxDQUE0QjtZQUNoQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1lBQzNELGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQ3RELENBQUM7UUFFTCxJQUFJLElBQUk7WUFDUCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25FLENBQUM7UUFF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