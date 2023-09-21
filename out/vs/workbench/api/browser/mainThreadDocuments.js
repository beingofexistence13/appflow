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
define(["require", "exports", "vs/base/common/errorMessage", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/editor/common/model", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/platform/files/common/files", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/environment/common/environmentService", "vs/base/common/resources", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/event", "vs/workbench/services/path/common/pathService", "vs/base/common/map", "vs/base/common/errors"], function (require, exports, errorMessage_1, lifecycle_1, network_1, uri_1, model_1, model_2, resolverService_1, files_1, extHost_protocol_1, textfiles_1, environmentService_1, resources_1, workingCopyFileService_1, uriIdentity_1, event_1, pathService_1, map_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadDocuments = exports.BoundModelReferenceCollection = void 0;
    class BoundModelReferenceCollection {
        constructor(_extUri, _maxAge = 1000 * 60 * 3, // auto-dispse by age
        _maxLength = 1024 * 1024 * 80, // auto-dispose by total length
        _maxSize = 50 // auto-dispose by number of references
        ) {
            this._extUri = _extUri;
            this._maxAge = _maxAge;
            this._maxLength = _maxLength;
            this._maxSize = _maxSize;
            this._data = new Array();
            this._length = 0;
            //
        }
        dispose() {
            this._data = (0, lifecycle_1.dispose)(this._data);
        }
        remove(uri) {
            for (const entry of [...this._data] /* copy array because dispose will modify it */) {
                if (this._extUri.isEqualOrParent(entry.uri, uri)) {
                    entry.dispose();
                }
            }
        }
        add(uri, ref, length = 0) {
            // const length = ref.object.textEditorModel.getValueLength();
            const dispose = () => {
                const idx = this._data.indexOf(entry);
                if (idx >= 0) {
                    this._length -= length;
                    ref.dispose();
                    clearTimeout(handle);
                    this._data.splice(idx, 1);
                }
            };
            const handle = setTimeout(dispose, this._maxAge);
            const entry = { uri, length, dispose };
            this._data.push(entry);
            this._length += length;
            this._cleanup();
        }
        _cleanup() {
            // clean-up wrt total length
            while (this._length > this._maxLength) {
                this._data[0].dispose();
            }
            // clean-up wrt number of documents
            const extraSize = Math.ceil(this._maxSize * 1.2);
            if (this._data.length >= extraSize) {
                (0, lifecycle_1.dispose)(this._data.slice(0, extraSize - this._maxSize));
            }
        }
    }
    exports.BoundModelReferenceCollection = BoundModelReferenceCollection;
    class ModelTracker extends lifecycle_1.Disposable {
        constructor(_model, _onIsCaughtUpWithContentChanges, _proxy, _textFileService) {
            super();
            this._model = _model;
            this._onIsCaughtUpWithContentChanges = _onIsCaughtUpWithContentChanges;
            this._proxy = _proxy;
            this._textFileService = _textFileService;
            this._knownVersionId = this._model.getVersionId();
            this._store.add(this._model.onDidChangeContent((e) => {
                this._knownVersionId = e.versionId;
                this._proxy.$acceptModelChanged(this._model.uri, e, this._textFileService.isDirty(this._model.uri));
                if (this.isCaughtUpWithContentChanges()) {
                    this._onIsCaughtUpWithContentChanges.fire(this._model.uri);
                }
            }));
        }
        isCaughtUpWithContentChanges() {
            return (this._model.getVersionId() === this._knownVersionId);
        }
    }
    let MainThreadDocuments = class MainThreadDocuments extends lifecycle_1.Disposable {
        constructor(extHostContext, _modelService, _textFileService, _fileService, _textModelResolverService, _environmentService, _uriIdentityService, workingCopyFileService, _pathService) {
            super();
            this._modelService = _modelService;
            this._textFileService = _textFileService;
            this._fileService = _fileService;
            this._textModelResolverService = _textModelResolverService;
            this._environmentService = _environmentService;
            this._uriIdentityService = _uriIdentityService;
            this._pathService = _pathService;
            this._onIsCaughtUpWithContentChanges = this._store.add(new event_1.Emitter());
            this.onIsCaughtUpWithContentChanges = this._onIsCaughtUpWithContentChanges.event;
            this._modelTrackers = new map_1.ResourceMap();
            this._modelReferenceCollection = this._store.add(new BoundModelReferenceCollection(_uriIdentityService.extUri));
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostDocuments);
            this._store.add(_modelService.onModelLanguageChanged(this._onModelModeChanged, this));
            this._store.add(_textFileService.files.onDidSave(e => {
                if (this._shouldHandleFileEvent(e.model.resource)) {
                    this._proxy.$acceptModelSaved(e.model.resource);
                }
            }));
            this._store.add(_textFileService.files.onDidChangeDirty(m => {
                if (this._shouldHandleFileEvent(m.resource)) {
                    this._proxy.$acceptDirtyStateChanged(m.resource, m.isDirty());
                }
            }));
            this._store.add(workingCopyFileService.onDidRunWorkingCopyFileOperation(e => {
                const isMove = e.operation === 2 /* FileOperation.MOVE */;
                if (isMove || e.operation === 1 /* FileOperation.DELETE */) {
                    for (const pair of e.files) {
                        const removed = isMove ? pair.source : pair.target;
                        if (removed) {
                            this._modelReferenceCollection.remove(removed);
                        }
                    }
                }
            }));
        }
        dispose() {
            (0, lifecycle_1.dispose)(this._modelTrackers.values());
            this._modelTrackers.clear();
            super.dispose();
        }
        isCaughtUpWithContentChanges(resource) {
            const tracker = this._modelTrackers.get(resource);
            if (tracker) {
                return tracker.isCaughtUpWithContentChanges();
            }
            return true;
        }
        _shouldHandleFileEvent(resource) {
            const model = this._modelService.getModel(resource);
            return !!model && (0, model_1.shouldSynchronizeModel)(model);
        }
        handleModelAdded(model) {
            // Same filter as in mainThreadEditorsTracker
            if (!(0, model_1.shouldSynchronizeModel)(model)) {
                // don't synchronize too large models
                return;
            }
            this._modelTrackers.set(model.uri, new ModelTracker(model, this._onIsCaughtUpWithContentChanges, this._proxy, this._textFileService));
        }
        _onModelModeChanged(event) {
            const { model } = event;
            if (!this._modelTrackers.has(model.uri)) {
                return;
            }
            this._proxy.$acceptModelLanguageChanged(model.uri, model.getLanguageId());
        }
        handleModelRemoved(modelUrl) {
            if (!this._modelTrackers.has(modelUrl)) {
                return;
            }
            this._modelTrackers.get(modelUrl).dispose();
            this._modelTrackers.delete(modelUrl);
        }
        // --- from extension host process
        async $trySaveDocument(uri) {
            const target = await this._textFileService.save(uri_1.URI.revive(uri));
            return Boolean(target);
        }
        async $tryOpenDocument(uriData) {
            const inputUri = uri_1.URI.revive(uriData);
            if (!inputUri.scheme || !(inputUri.fsPath || inputUri.authority)) {
                throw new errors_1.ErrorNoTelemetry(`Invalid uri. Scheme and authority or path must be set.`);
            }
            const canonicalUri = this._uriIdentityService.asCanonicalUri(inputUri);
            let promise;
            switch (canonicalUri.scheme) {
                case network_1.Schemas.untitled:
                    promise = this._handleUntitledScheme(canonicalUri);
                    break;
                case network_1.Schemas.file:
                default:
                    promise = this._handleAsResourceInput(canonicalUri);
                    break;
            }
            let documentUri;
            try {
                documentUri = await promise;
            }
            catch (err) {
                throw new errors_1.ErrorNoTelemetry(`cannot open ${canonicalUri.toString()}. Detail: ${(0, errorMessage_1.toErrorMessage)(err)}`);
            }
            if (!documentUri) {
                throw new errors_1.ErrorNoTelemetry(`cannot open ${canonicalUri.toString()}`);
            }
            else if (!resources_1.extUri.isEqual(documentUri, canonicalUri)) {
                throw new errors_1.ErrorNoTelemetry(`cannot open ${canonicalUri.toString()}. Detail: Actual document opened as ${documentUri.toString()}`);
            }
            else if (!this._modelTrackers.has(canonicalUri)) {
                throw new errors_1.ErrorNoTelemetry(`cannot open ${canonicalUri.toString()}. Detail: Files above 50MB cannot be synchronized with extensions.`);
            }
            else {
                return canonicalUri;
            }
        }
        $tryCreateDocument(options) {
            return this._doCreateUntitled(undefined, options ? options.language : undefined, options ? options.content : undefined);
        }
        async _handleAsResourceInput(uri) {
            const ref = await this._textModelResolverService.createModelReference(uri);
            this._modelReferenceCollection.add(uri, ref, ref.object.textEditorModel.getValueLength());
            return ref.object.textEditorModel.uri;
        }
        async _handleUntitledScheme(uri) {
            const asLocalUri = (0, resources_1.toLocalResource)(uri, this._environmentService.remoteAuthority, this._pathService.defaultUriScheme);
            const exists = await this._fileService.exists(asLocalUri);
            if (exists) {
                // don't create a new file ontop of an existing file
                return Promise.reject(new Error('file already exists'));
            }
            return await this._doCreateUntitled(Boolean(uri.path) ? uri : undefined);
        }
        async _doCreateUntitled(associatedResource, languageId, initialValue) {
            const model = await this._textFileService.untitled.resolve({
                associatedResource,
                languageId,
                initialValue
            });
            const resource = model.resource;
            if (!this._modelTrackers.has(resource)) {
                throw new Error(`expected URI ${resource.toString()} to have come to LIFE`);
            }
            this._proxy.$acceptDirtyStateChanged(resource, true); // mark as dirty
            return resource;
        }
    };
    exports.MainThreadDocuments = MainThreadDocuments;
    exports.MainThreadDocuments = MainThreadDocuments = __decorate([
        __param(1, model_2.IModelService),
        __param(2, textfiles_1.ITextFileService),
        __param(3, files_1.IFileService),
        __param(4, resolverService_1.ITextModelService),
        __param(5, environmentService_1.IWorkbenchEnvironmentService),
        __param(6, uriIdentity_1.IUriIdentityService),
        __param(7, workingCopyFileService_1.IWorkingCopyFileService),
        __param(8, pathService_1.IPathService)
    ], MainThreadDocuments);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZERvY3VtZW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkRG9jdW1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXNCaEcsTUFBYSw2QkFBNkI7UUFLekMsWUFDa0IsT0FBZ0IsRUFDaEIsVUFBa0IsSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUscUJBQXFCO1FBQ3RELGFBQXFCLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxFQUFFLCtCQUErQjtRQUN0RSxXQUFtQixFQUFFLENBQUMsdUNBQXVDOztZQUg3RCxZQUFPLEdBQVAsT0FBTyxDQUFTO1lBQ2hCLFlBQU8sR0FBUCxPQUFPLENBQXdCO1lBQy9CLGVBQVUsR0FBVixVQUFVLENBQTJCO1lBQ3JDLGFBQVEsR0FBUixRQUFRLENBQWE7WUFQL0IsVUFBSyxHQUFHLElBQUksS0FBSyxFQUFpRCxDQUFDO1lBQ25FLFlBQU8sR0FBRyxDQUFDLENBQUM7WUFRbkIsRUFBRTtRQUNILENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFRCxNQUFNLENBQUMsR0FBUTtZQUNkLEtBQUssTUFBTSxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQywrQ0FBK0MsRUFBRTtnQkFDcEYsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFO29CQUNqRCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQ2hCO2FBQ0Q7UUFDRixDQUFDO1FBRUQsR0FBRyxDQUFDLEdBQVEsRUFBRSxHQUFvQixF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