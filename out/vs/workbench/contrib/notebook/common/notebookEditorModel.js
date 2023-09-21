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
    var SimpleNotebookEditorModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookFileWorkingCopyModelFactory = exports.NotebookFileWorkingCopyModel = exports.SimpleNotebookEditorModel = void 0;
    //#region --- simple content provider
    let SimpleNotebookEditorModel = SimpleNotebookEditorModel_1 = class SimpleNotebookEditorModel extends editorModel_1.EditorModel {
        constructor(resource, _hasAssociatedFilePath, viewType, _workingCopyManager, _filesConfigurationService) {
            super();
            this.resource = resource;
            this._hasAssociatedFilePath = _hasAssociatedFilePath;
            this.viewType = viewType;
            this._workingCopyManager = _workingCopyManager;
            this._filesConfigurationService = _filesConfigurationService;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this._onDidSave = this._register(new event_1.Emitter());
            this._onDidChangeOrphaned = this._register(new event_1.Emitter());
            this._onDidChangeReadonly = this._register(new event_1.Emitter());
            this._onDidRevertUntitled = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this.onDidSave = this._onDidSave.event;
            this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
            this.onDidChangeReadonly = this._onDidChangeReadonly.event;
            this.onDidRevertUntitled = this._onDidRevertUntitled.event;
            this._workingCopyListeners = this._register(new lifecycle_1.DisposableStore());
            this.scratchPad = viewType === 'interactive';
        }
        dispose() {
            this._workingCopy?.dispose();
            super.dispose();
        }
        get notebook() {
            return this._workingCopy?.model?.notebookModel;
        }
        isResolved() {
            return Boolean(this._workingCopy?.model?.notebookModel);
        }
        async canDispose() {
            if (!this._workingCopy) {
                return true;
            }
            if (SimpleNotebookEditorModel_1._isStoredFileWorkingCopy(this._workingCopy)) {
                return this._workingCopyManager.stored.canDispose(this._workingCopy);
            }
            else {
                return true;
            }
        }
        isDirty() {
            return this._workingCopy?.isDirty() ?? false;
        }
        isModified() {
            return this._workingCopy?.isModified() ?? false;
        }
        isOrphaned() {
            return SimpleNotebookEditorModel_1._isStoredFileWorkingCopy(this._workingCopy) && this._workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */);
        }
        hasAssociatedFilePath() {
            return !SimpleNotebookEditorModel_1._isStoredFileWorkingCopy(this._workingCopy) && !!this._workingCopy?.hasAssociatedFilePath;
        }
        isReadonly() {
            if (SimpleNotebookEditorModel_1._isStoredFileWorkingCopy(this._workingCopy)) {
                return this._workingCopy?.isReadonly();
            }
            else {
                return this._filesConfigurationService.isReadonly(this.resource);
            }
        }
        get hasErrorState() {
            if (this._workingCopy && 'hasState' in this._workingCopy) {
                return this._workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */);
            }
            return false;
        }
        revert(options) {
            (0, types_1.assertType)(this.isResolved());
            return this._workingCopy.revert(options);
        }
        save(options) {
            (0, types_1.assertType)(this.isResolved());
            return this._workingCopy.save(options);
        }
        async load(options) {
            if (!this._workingCopy || !this._workingCopy.model) {
                if (this.resource.scheme === network_1.Schemas.untitled) {
                    if (this._hasAssociatedFilePath) {
                        this._workingCopy = await this._workingCopyManager.resolve({ associatedResource: this.resource });
                    }
                    else {
                        this._workingCopy = await this._workingCopyManager.resolve({ untitledResource: this.resource, isScratchpad: this.scratchPad });
                    }
                    this._workingCopy.onDidRevert(() => this._onDidRevertUntitled.fire());
                }
                else {
                    this._workingCopy = await this._workingCopyManager.resolve(this.resource, options?.forceReadFromFile ? { reload: { async: false, force: true } } : undefined);
                    this._workingCopyListeners.add(this._workingCopy.onDidSave(e => this._onDidSave.fire(e)));
                    this._workingCopyListeners.add(this._workingCopy.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire()));
                    this._workingCopyListeners.add(this._workingCopy.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
                }
                this._workingCopyListeners.add(this._workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(), undefined));
                this._workingCopyListeners.add(this._workingCopy.onWillDispose(() => {
                    this._workingCopyListeners.clear();
                    this._workingCopy?.model?.dispose();
                }));
            }
            else {
                await this._workingCopyManager.resolve(this.resource, {
                    reload: {
                        async: !options?.forceReadFromFile,
                        force: options?.forceReadFromFile
                    }
                });
            }
            (0, types_1.assertType)(this.isResolved());
            return this;
        }
        async saveAs(target) {
            const newWorkingCopy = await this._workingCopyManager.saveAs(this.resource, target);
            if (!newWorkingCopy) {
                return undefined;
            }
            // this is a little hacky because we leave the new working copy alone. BUT
            // the newly created editor input will pick it up and claim ownership of it.
            return { resource: newWorkingCopy.resource };
        }
        static _isStoredFileWorkingCopy(candidate) {
            const isUntitled = candidate && candidate.capabilities & 2 /* WorkingCopyCapabilities.Untitled */;
            return !isUntitled;
        }
    };
    exports.SimpleNotebookEditorModel = SimpleNotebookEditorModel;
    exports.SimpleNotebookEditorModel = SimpleNotebookEditorModel = SimpleNotebookEditorModel_1 = __decorate([
        __param(4, filesConfigurationService_1.IFilesConfigurationService)
    ], SimpleNotebookEditorModel);
    class NotebookFileWorkingCopyModel extends lifecycle_1.Disposable {
        constructor(_notebookModel, _notebookService, _configurationService) {
            super();
            this._notebookModel = _notebookModel;
            this._notebookService = _notebookService;
            this._configurationService = _configurationService;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this.configuration = undefined;
            this.onWillDispose = _notebookModel.onWillDispose.bind(_notebookModel);
            this._register(_notebookModel.onDidChangeContent(e => {
                for (const rawEvent of e.rawEvents) {
                    if (rawEvent.kind === notebookCommon_1.NotebookCellsChangeType.Initialize) {
                        continue;
                    }
                    if (rawEvent.transient) {
                        continue;
                    }
                    this._onDidChangeContent.fire({
                        isRedoing: false,
                        isUndoing: false,
                        isInitial: false, //_notebookModel.cells.length === 0 // todo@jrieken non transient metadata?
                    });
                    break;
                }
            }));
            if (_notebookModel.uri.scheme === network_1.Schemas.vscodeRemote) {
                this.configuration = {
                    // Intentionally pick a larger delay for triggering backups when
                    // we are connected to a remote. This saves us repeated roundtrips
                    // to the remote server when the content changes because the
                    // remote hosts the extension of the notebook with the contents truth
                    backupDelay: 10000
                };
                // Override save behavior to avoid transferring the buffer across the wire 3 times
                if (this._configurationService.getValue(notebookCommon_1.NotebookSetting.remoteSaving)) {
                    this.save = async (options, token) => {
                        const serializer = await this.getNotebookSerializer();
                        if (token.isCancellationRequested) {
                            throw new errors_1.CancellationError();
                        }
                        const stat = await serializer.save(this._notebookModel.uri, this._notebookModel.versionId, options, token);
                        return stat;
                    };
                }
            }
        }
        dispose() {
            this._notebookModel.dispose();
            super.dispose();
        }
        get notebookModel() {
            return this._notebookModel;
        }
        async snapshot(token) {
            const serializer = await this.getNotebookSerializer();
            const data = {
                metadata: (0, objects_1.filter)(this._notebookModel.metadata, key => !serializer.options.transientDocumentMetadata[key]),
                cells: [],
            };
            for (const cell of this._notebookModel.cells) {
                const cellData = {
                    cellKind: cell.cellKind,
                    language: cell.language,
                    mime: cell.mime,
                    source: cell.getValue(),
                    outputs: [],
                    internalMetadata: cell.internalMetadata
                };
                cellData.outputs = !serializer.options.transientOutputs ? cell.outputs : [];
                cellData.metadata = (0, objects_1.filter)(cell.metadata, key => !serializer.options.transientCellMetadata[key]);
                data.cells.push(cellData);
            }
            const bytes = await serializer.notebookToData(data);
            if (token.isCancellationRequested) {
                throw new errors_1.CancellationError();
            }
            return (0, buffer_1.bufferToStream)(bytes);
        }
        async update(stream, token) {
            const serializer = await this.getNotebookSerializer();
            const bytes = await (0, buffer_1.streamToBuffer)(stream);
            const data = await serializer.dataToNotebook(bytes);
            if (token.isCancellationRequested) {
                throw new errors_1.CancellationError();
            }
            this._notebookModel.reset(data.cells, data.metadata, serializer.options);
        }
        async getNotebookSerializer() {
            const info = await this._notebookService.withNotebookDataProvider(this.notebookModel.viewType);
            if (!(info instanceof notebookService_1.SimpleNotebookProviderInfo)) {
                throw new Error('CANNOT open file notebook with this provider');
            }
            return info.serializer;
        }
        get versionId() {
            return this._notebookModel.alternativeVersionId;
        }
        pushStackElement() {
            this._notebookModel.pushStackElement('save', undefined, undefined);
        }
    }
    exports.NotebookFileWorkingCopyModel = NotebookFileWorkingCopyModel;
    let NotebookFileWorkingCopyModelFactory = class NotebookFileWorkingCopyModelFactory {
        constructor(_viewType, _notebookService, _configurationService) {
            this._viewType = _viewType;
            this._notebookService = _notebookService;
            this._configurationService = _configurationService;
        }
        async createModel(resource, stream, token) {
            const info = await this._notebookService.withNotebookDataProvider(this._viewType);
            if (!(info instanceof notebookService_1.SimpleNotebookProviderInfo)) {
                throw new Error('CANNOT open file notebook with this provider');
            }
            const bytes = await (0, buffer_1.streamToBuffer)(stream);
            const data = await info.serializer.dataToNotebook(bytes);
            if (token.isCancellationRequested) {
                throw new errors_1.CancellationError();
            }
            const notebookModel = this._notebookService.createNotebookTextModel(info.viewType, resource, data, info.serializer.options);
            return new NotebookFileWorkingCopyModel(notebookModel, this._notebookService, this._configurationService);
        }
    };
    exports.NotebookFileWorkingCopyModelFactory = NotebookFileWorkingCopyModelFactory;
    exports.NotebookFileWorkingCopyModelFactory = NotebookFileWorkingCopyModelFactory = __decorate([
        __param(1, notebookService_1.INotebookService),
        __param(2, configuration_1.IConfigurationService)
    ], NotebookFileWorkingCopyModelFactory);
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2NvbW1vbi9ub3RlYm9va0VkaXRvck1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEwQmhHLHFDQUFxQztJQUU5QixJQUFNLHlCQUF5QixpQ0FBL0IsTUFBTSx5QkFBMEIsU0FBUSx5QkFBVztRQWtCekQsWUFDVSxRQUFhLEVBQ0wsc0JBQStCLEVBQ3ZDLFFBQWdCLEVBQ1IsbUJBQXdHLEVBQzdGLDBCQUF1RTtZQUVuRyxLQUFLLEVBQUUsQ0FBQztZQU5DLGFBQVEsR0FBUixRQUFRLENBQUs7WUFDTCwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQVM7WUFDdkMsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUNSLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUY7WUFDNUUsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE0QjtZQXJCbkYsc0JBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDeEQsZUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQW1DLENBQUMsQ0FBQztZQUM1RSx5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUMzRCx5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUMzRCx5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUVuRSxxQkFBZ0IsR0FBZ0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQztZQUM3RCxjQUFTLEdBQTJDLElBQUksQ0FB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