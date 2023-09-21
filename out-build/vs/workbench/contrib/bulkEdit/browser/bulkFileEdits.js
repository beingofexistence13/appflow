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
    exports.$bMb = void 0;
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
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        get uris() {
            return this.a.map(edit => [edit.newUri, edit.oldUri]).flat();
        }
        async perform(token) {
            const moves = [];
            const undoes = [];
            for (const edit of this.a) {
                // check: not overwriting, but ignoring, and the target file exists
                const skip = edit.options.overwrite === undefined && edit.options.ignoreIfExists && await this.d.exists(edit.newUri);
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
            await this.c.move(moves, token, this.b);
            return new RenameOperation_1(undoes, { isUndoing: true }, this.c, this.d);
        }
        toString() {
            return `(rename ${this.a.map(edit => `${edit.oldUri} to ${edit.newUri}`).join(', ')})`;
        }
    };
    RenameOperation = RenameOperation_1 = __decorate([
        __param(2, workingCopyFileService_1.$HD),
        __param(3, files_1.$6j)
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
        constructor(a, b, c, d, e) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
        }
        get uris() {
            return this.a.map(edit => [edit.newUri, edit.oldUri]).flat();
        }
        async perform(token) {
            // (1) create copy operations, remove noops
            const copies = [];
            for (const edit of this.a) {
                //check: not overwriting, but ignoring, and the target file exists
                const skip = edit.options.overwrite === undefined && edit.options.ignoreIfExists && await this.d.exists(edit.newUri);
                if (!skip) {
                    copies.push({ file: { source: edit.oldUri, target: edit.newUri }, overwrite: edit.options.overwrite });
                }
            }
            if (copies.length === 0) {
                return new Noop();
            }
            // (2) perform the actual copy and use the return stats to build undo edits
            const stats = await this.c.copy(copies, token, this.b);
            const undoes = [];
            for (let i = 0; i < stats.length; i++) {
                const stat = stats[i];
                const edit = this.a[i];
                undoes.push(new DeleteEdit(stat.resource, { recursive: true, folder: this.a[i].options.folder || stat.isDirectory, ...edit.options }, false));
            }
            return this.e.createInstance(DeleteOperation, undoes, { isUndoing: true });
        }
        toString() {
            return `(copy ${this.a.map(edit => `${edit.oldUri} to ${edit.newUri}`).join(', ')})`;
        }
    };
    CopyOperation = __decorate([
        __param(2, workingCopyFileService_1.$HD),
        __param(3, files_1.$6j),
        __param(4, instantiation_1.$Ah)
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
        constructor(a, b, c, d, e, f) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
        }
        get uris() {
            return this.a.map(edit => edit.newUri);
        }
        async perform(token) {
            const folderCreates = [];
            const fileCreates = [];
            const undoes = [];
            for (const edit of this.a) {
                if (edit.newUri.scheme === network_1.Schemas.untitled) {
                    continue; // ignore, will be handled by a later edit
                }
                if (edit.options.overwrite === undefined && edit.options.ignoreIfExists && await this.c.exists(edit.newUri)) {
                    continue; // not overwriting, but ignoring, and the target file exists
                }
                if (edit.options.folder) {
                    folderCreates.push({ resource: edit.newUri });
                }
                else {
                    // If the contents are part of the edit they include the encoding, thus use them. Otherwise get the encoding for a new empty file.
                    const encodedReadable = typeof edit.contents !== 'undefined' ? edit.contents : await this.f.getEncodedReadable(edit.newUri);
                    fileCreates.push({ resource: edit.newUri, contents: encodedReadable, overwrite: edit.options.overwrite });
                }
                undoes.push(new DeleteEdit(edit.newUri, edit.options, !edit.options.folder && !edit.contents));
            }
            if (folderCreates.length === 0 && fileCreates.length === 0) {
                return new Noop();
            }
            await this.d.createFolder(folderCreates, token, this.b);
            await this.d.create(fileCreates, token, this.b);
            return this.e.createInstance(DeleteOperation, undoes, { isUndoing: true });
        }
        toString() {
            return `(create ${this.a.map(edit => edit.options.folder ? `folder ${edit.newUri}` : `file ${edit.newUri} with ${edit.contents?.byteLength || 0} bytes`).join(', ')})`;
        }
    };
    CreateOperation = __decorate([
        __param(2, files_1.$6j),
        __param(3, workingCopyFileService_1.$HD),
        __param(4, instantiation_1.$Ah),
        __param(5, textfiles_1.$JD)
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
        constructor(a, b, c, d, e, f, g) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
        }
        get uris() {
            return this.a.map(edit => edit.oldUri);
        }
        async perform(token) {
            // delete file
            const deletes = [];
            const undoes = [];
            for (const edit of this.a) {
                let fileStat;
                try {
                    fileStat = await this.d.resolve(edit.oldUri, { resolveMetadata: true });
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
                    useTrash: !edit.options.skipTrashBin && this.d.hasCapability(edit.oldUri, 4096 /* FileSystemProviderCapabilities.Trash */) && this.e.getValue('files.enableTrash')
                });
                // read file contents for undo operation. when a file is too large it won't be restored
                let fileContent;
                if (!edit.undoesCreate && !edit.options.folder && !(typeof edit.options.maxSize === 'number' && fileStat.size > edit.options.maxSize)) {
                    try {
                        fileContent = await this.d.readFile(edit.oldUri);
                    }
                    catch (err) {
                        this.g.error(err);
                    }
                }
                if (fileContent !== undefined) {
                    undoes.push(new CreateEdit(edit.oldUri, edit.options, fileContent.value));
                }
            }
            if (deletes.length === 0) {
                return new Noop();
            }
            await this.c.delete(deletes, token, this.b);
            if (undoes.length === 0) {
                return new Noop();
            }
            return this.f.createInstance(CreateOperation, undoes, { isUndoing: true });
        }
        toString() {
            return `(delete ${this.a.map(edit => edit.oldUri).join(', ')})`;
        }
    };
    DeleteOperation = __decorate([
        __param(2, workingCopyFileService_1.$HD),
        __param(3, files_1.$6j),
        __param(4, configuration_1.$8h),
        __param(5, instantiation_1.$Ah),
        __param(6, log_1.$5i)
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
            await this.a();
        }
        async redo() {
            await this.a();
        }
        async a() {
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
    let $bMb = class $bMb {
        constructor(a, b, c, d, e, f, g, h, j, k) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
        }
        async apply() {
            const undoOperations = [];
            const undoRedoInfo = { undoRedoGroupId: this.c.id };
            const edits = [];
            for (const edit of this.h) {
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
                const lastGroup = (0, arrays_1.$qb)(groups);
                if (lastGroup[0].type === edit.type) {
                    lastGroup.push(edit);
                }
                else {
                    groups.push([edit]);
                }
            }
            for (const group of groups) {
                if (this.g.isCancellationRequested) {
                    break;
                }
                let op;
                switch (group[0].type) {
                    case 'rename':
                        op = this.j.createInstance(RenameOperation, group, undoRedoInfo);
                        break;
                    case 'copy':
                        op = this.j.createInstance(CopyOperation, group, undoRedoInfo);
                        break;
                    case 'delete':
                        op = this.j.createInstance(DeleteOperation, group, undoRedoInfo);
                        break;
                    case 'create':
                        op = this.j.createInstance(CreateOperation, group, undoRedoInfo);
                        break;
                }
                if (op) {
                    const undoOp = await op.perform(this.g);
                    undoOperations.push(undoOp);
                }
                this.f.report(undefined);
            }
            const undoRedoElement = new FileUndoRedoElement(this.a, this.b, undoOperations, this.e);
            this.k.pushElement(undoRedoElement, this.c, this.d);
            return undoRedoElement.resources;
        }
    };
    exports.$bMb = $bMb;
    exports.$bMb = $bMb = __decorate([
        __param(8, instantiation_1.$Ah),
        __param(9, undoRedo_1.$wu)
    ], $bMb);
});
//# sourceMappingURL=bulkFileEdits.js.map