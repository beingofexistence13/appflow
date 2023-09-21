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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/types", "vs/platform/configuration/common/configuration", "vs/workbench/common/editor/editorModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, buffer_1, errors_1, event_1, lifecycle_1, network_1, objects_1, types_1, configuration_1, editorModel_1, notebookCommon_1, notebookService_1, filesConfigurationService_1) {
    "use strict";
    var $_rb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bsb = exports.$asb = exports.$_rb = void 0;
    //#region --- simple content provider
    let $_rb = $_rb_1 = class $_rb extends editorModel_1.$xA {
        constructor(resource, t, viewType, u, w) {
            super();
            this.resource = resource;
            this.t = t;
            this.viewType = viewType;
            this.u = u;
            this.w = w;
            this.a = this.B(new event_1.$fd());
            this.b = this.B(new event_1.$fd());
            this.c = this.B(new event_1.$fd());
            this.g = this.B(new event_1.$fd());
            this.m = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.a.event;
            this.onDidSave = this.b.event;
            this.onDidChangeOrphaned = this.c.event;
            this.onDidChangeReadonly = this.g.event;
            this.onDidRevertUntitled = this.m.event;
            this.r = this.B(new lifecycle_1.$jc());
            this.s = viewType === 'interactive';
        }
        dispose() {
            this.n?.dispose();
            super.dispose();
        }
        get notebook() {
            return this.n?.model?.notebookModel;
        }
        isResolved() {
            return Boolean(this.n?.model?.notebookModel);
        }
        async canDispose() {
            if (!this.n) {
                return true;
            }
            if ($_rb_1.y(this.n)) {
                return this.u.stored.canDispose(this.n);
            }
            else {
                return true;
            }
        }
        isDirty() {
            return this.n?.isDirty() ?? false;
        }
        isModified() {
            return this.n?.isModified() ?? false;
        }
        isOrphaned() {
            return $_rb_1.y(this.n) && this.n.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */);
        }
        hasAssociatedFilePath() {
            return !$_rb_1.y(this.n) && !!this.n?.hasAssociatedFilePath;
        }
        isReadonly() {
            if ($_rb_1.y(this.n)) {
                return this.n?.isReadonly();
            }
            else {
                return this.w.isReadonly(this.resource);
            }
        }
        get hasErrorState() {
            if (this.n && 'hasState' in this.n) {
                return this.n.hasState(5 /* StoredFileWorkingCopyState.ERROR */);
            }
            return false;
        }
        revert(options) {
            (0, types_1.$tf)(this.isResolved());
            return this.n.revert(options);
        }
        save(options) {
            (0, types_1.$tf)(this.isResolved());
            return this.n.save(options);
        }
        async load(options) {
            if (!this.n || !this.n.model) {
                if (this.resource.scheme === network_1.Schemas.untitled) {
                    if (this.t) {
                        this.n = await this.u.resolve({ associatedResource: this.resource });
                    }
                    else {
                        this.n = await this.u.resolve({ untitledResource: this.resource, isScratchpad: this.s });
                    }
                    this.n.onDidRevert(() => this.m.fire());
                }
                else {
                    this.n = await this.u.resolve(this.resource, options?.forceReadFromFile ? { reload: { async: false, force: true } } : undefined);
                    this.r.add(this.n.onDidSave(e => this.b.fire(e)));
                    this.r.add(this.n.onDidChangeOrphaned(() => this.c.fire()));
                    this.r.add(this.n.onDidChangeReadonly(() => this.g.fire()));
                }
                this.r.add(this.n.onDidChangeDirty(() => this.a.fire(), undefined));
                this.r.add(this.n.onWillDispose(() => {
                    this.r.clear();
                    this.n?.model?.dispose();
                }));
            }
            else {
                await this.u.resolve(this.resource, {
                    reload: {
                        async: !options?.forceReadFromFile,
                        force: options?.forceReadFromFile
                    }
                });
            }
            (0, types_1.$tf)(this.isResolved());
            return this;
        }
        async saveAs(target) {
            const newWorkingCopy = await this.u.saveAs(this.resource, target);
            if (!newWorkingCopy) {
                return undefined;
            }
            // this is a little hacky because we leave the new working copy alone. BUT
            // the newly created editor input will pick it up and claim ownership of it.
            return { resource: newWorkingCopy.resource };
        }
        static y(candidate) {
            const isUntitled = candidate && candidate.capabilities & 2 /* WorkingCopyCapabilities.Untitled */;
            return !isUntitled;
        }
    };
    exports.$_rb = $_rb;
    exports.$_rb = $_rb = $_rb_1 = __decorate([
        __param(4, filesConfigurationService_1.$yD)
    ], $_rb);
    class $asb extends lifecycle_1.$kc {
        constructor(b, c, f) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeContent = this.a.event;
            this.configuration = undefined;
            this.onWillDispose = b.onWillDispose.bind(b);
            this.B(b.onDidChangeContent(e => {
                for (const rawEvent of e.rawEvents) {
                    if (rawEvent.kind === notebookCommon_1.NotebookCellsChangeType.Initialize) {
                        continue;
                    }
                    if (rawEvent.transient) {
                        continue;
                    }
                    this.a.fire({
                        isRedoing: false,
                        isUndoing: false,
                        isInitial: false, //_notebookModel.cells.length === 0 // todo@jrieken non transient metadata?
                    });
                    break;
                }
            }));
            if (b.uri.scheme === network_1.Schemas.vscodeRemote) {
                this.configuration = {
                    // Intentionally pick a larger delay for triggering backups when
                    // we are connected to a remote. This saves us repeated roundtrips
                    // to the remote server when the content changes because the
                    // remote hosts the extension of the notebook with the contents truth
                    backupDelay: 10000
                };
                // Override save behavior to avoid transferring the buffer across the wire 3 times
                if (this.f.getValue(notebookCommon_1.$7H.remoteSaving)) {
                    this.save = async (options, token) => {
                        const serializer = await this.getNotebookSerializer();
                        if (token.isCancellationRequested) {
                            throw new errors_1.$3();
                        }
                        const stat = await serializer.save(this.b.uri, this.b.versionId, options, token);
                        return stat;
                    };
                }
            }
        }
        dispose() {
            this.b.dispose();
            super.dispose();
        }
        get notebookModel() {
            return this.b;
        }
        async snapshot(token) {
            const serializer = await this.getNotebookSerializer();
            const data = {
                metadata: (0, objects_1.$4m)(this.b.metadata, key => !serializer.options.transientDocumentMetadata[key]),
                cells: [],
            };
            for (const cell of this.b.cells) {
                const cellData = {
                    cellKind: cell.cellKind,
                    language: cell.language,
                    mime: cell.mime,
                    source: cell.getValue(),
                    outputs: [],
                    internalMetadata: cell.internalMetadata
                };
                cellData.outputs = !serializer.options.transientOutputs ? cell.outputs : [];
                cellData.metadata = (0, objects_1.$4m)(cell.metadata, key => !serializer.options.transientCellMetadata[key]);
                data.cells.push(cellData);
            }
            const bytes = await serializer.notebookToData(data);
            if (token.isCancellationRequested) {
                throw new errors_1.$3();
            }
            return (0, buffer_1.$Td)(bytes);
        }
        async update(stream, token) {
            const serializer = await this.getNotebookSerializer();
            const bytes = await (0, buffer_1.$Rd)(stream);
            const data = await serializer.dataToNotebook(bytes);
            if (token.isCancellationRequested) {
                throw new errors_1.$3();
            }
            this.b.reset(data.cells, data.metadata, serializer.options);
        }
        async getNotebookSerializer() {
            const info = await this.c.withNotebookDataProvider(this.notebookModel.viewType);
            if (!(info instanceof notebookService_1.$vbb)) {
                throw new Error('CANNOT open file notebook with this provider');
            }
            return info.serializer;
        }
        get versionId() {
            return this.b.alternativeVersionId;
        }
        pushStackElement() {
            this.b.pushStackElement('save', undefined, undefined);
        }
    }
    exports.$asb = $asb;
    let $bsb = class $bsb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async createModel(resource, stream, token) {
            const info = await this.b.withNotebookDataProvider(this.a);
            if (!(info instanceof notebookService_1.$vbb)) {
                throw new Error('CANNOT open file notebook with this provider');
            }
            const bytes = await (0, buffer_1.$Rd)(stream);
            const data = await info.serializer.dataToNotebook(bytes);
            if (token.isCancellationRequested) {
                throw new errors_1.$3();
            }
            const notebookModel = this.b.createNotebookTextModel(info.viewType, resource, data, info.serializer.options);
            return new $asb(notebookModel, this.b, this.c);
        }
    };
    exports.$bsb = $bsb;
    exports.$bsb = $bsb = __decorate([
        __param(1, notebookService_1.$ubb),
        __param(2, configuration_1.$8h)
    ], $bsb);
});
//#endregion
//# sourceMappingURL=notebookEditorModel.js.map