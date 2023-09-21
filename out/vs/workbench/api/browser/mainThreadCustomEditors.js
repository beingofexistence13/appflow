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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uuid", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/storage/common/storage", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/api/browser/mainThreadWebviews", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/customEditor/browser/customEditorInput", "vs/workbench/contrib/customEditor/common/customEditor", "vs/workbench/contrib/customEditor/common/customTextEditorModel", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/path/common/pathService", "vs/workbench/services/workingCopy/common/resourceWorkingCopy", "vs/workbench/services/workingCopy/common/workingCopy", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/workingCopy/common/workingCopyService"], function (require, exports, dom_1, async_1, cancellation_1, errors_1, event_1, lifecycle_1, network_1, path_1, resources_1, uri_1, uuid_1, nls_1, dialogs_1, files_1, instantiation_1, label_1, storage_1, undoRedo_1, mainThreadWebviews_1, extHostProtocol, customEditorInput_1, customEditor_1, customTextEditorModel_1, webview_1, webviewWorkbenchService_1, editorGroupColumn_1, editorGroupsService_1, editorService_1, environmentService_1, extensions_1, pathService_1, resourceWorkingCopy_1, workingCopy_1, workingCopyFileService_1, workingCopyService_1) {
    "use strict";
    var MainThreadCustomEditorModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadCustomEditors = void 0;
    var CustomEditorModelType;
    (function (CustomEditorModelType) {
        CustomEditorModelType[CustomEditorModelType["Custom"] = 0] = "Custom";
        CustomEditorModelType[CustomEditorModelType["Text"] = 1] = "Text";
    })(CustomEditorModelType || (CustomEditorModelType = {}));
    let MainThreadCustomEditors = class MainThreadCustomEditors extends lifecycle_1.Disposable {
        constructor(context, mainThreadWebview, mainThreadWebviewPanels, extensionService, storageService, workingCopyService, workingCopyFileService, _customEditorService, _editorGroupService, _editorService, _instantiationService, _webviewWorkbenchService) {
            super();
            this.mainThreadWebview = mainThreadWebview;
            this.mainThreadWebviewPanels = mainThreadWebviewPanels;
            this._customEditorService = _customEditorService;
            this._editorGroupService = _editorGroupService;
            this._editorService = _editorService;
            this._instantiationService = _instantiationService;
            this._webviewWorkbenchService = _webviewWorkbenchService;
            this._editorProviders = this._register(new lifecycle_1.DisposableMap());
            this._editorRenameBackups = new Map();
            this._webviewOriginStore = new webview_1.ExtensionKeyedWebviewOriginStore('mainThreadCustomEditors.origins', storageService);
            this._proxyCustomEditors = context.getProxy(extHostProtocol.ExtHostContext.ExtHostCustomEditors);
            this._register(workingCopyFileService.registerWorkingCopyProvider((editorResource) => {
                const matchedWorkingCopies = [];
                for (const workingCopy of workingCopyService.workingCopies) {
                    if (workingCopy instanceof MainThreadCustomEditorModel) {
                        if ((0, resources_1.isEqualOrParent)(editorResource, workingCopy.editorResource)) {
                            matchedWorkingCopies.push(workingCopy);
                        }
                    }
                }
                return matchedWorkingCopies;
            }));
            // This reviver's only job is to activate custom editor extensions.
            this._register(_webviewWorkbenchService.registerResolver({
                canResolve: (webview) => {
                    if (webview instanceof customEditorInput_1.CustomEditorInput) {
                        extensionService.activateByEvent(`onCustomEditor:${webview.viewType}`);
                    }
                    return false;
                },
                resolveWebview: () => { throw new Error('not implemented'); }
            }));
            // Working copy operations
            this._register(workingCopyFileService.onWillRunWorkingCopyFileOperation(async (e) => this.onWillRunWorkingCopyFileOperation(e)));
        }
        $registerTextEditorProvider(extensionData, viewType, options, capabilities, serializeBuffersForPostMessage) {
            this.registerEditorProvider(1 /* CustomEditorModelType.Text */, (0, mainThreadWebviews_1.reviveWebviewExtension)(extensionData), viewType, options, capabilities, true, serializeBuffersForPostMessage);
        }
        $registerCustomEditorProvider(extensionData, viewType, options, supportsMultipleEditorsPerDocument, serializeBuffersForPostMessage) {
            this.registerEditorProvider(0 /* CustomEditorModelType.Custom */, (0, mainThreadWebviews_1.reviveWebviewExtension)(extensionData), viewType, options, {}, supportsMultipleEditorsPerDocument, serializeBuffersForPostMessage);
        }
        registerEditorProvider(modelType, extension, viewType, options, capabilities, supportsMultipleEditorsPerDocument, serializeBuffersForPostMessage) {
            if (this._editorProviders.has(viewType)) {
                throw new Error(`Provider for ${viewType} already registered`);
            }
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(this._customEditorService.registerCustomEditorCapabilities(viewType, {
                supportsMultipleEditorsPerDocument
            }));
            disposables.add(this._webviewWorkbenchService.registerResolver({
                canResolve: (webviewInput) => {
                    return webviewInput instanceof customEditorInput_1.CustomEditorInput && webviewInput.viewType === viewType;
                },
                resolveWebview: async (webviewInput, cancellation) => {
                    const handle = (0, uuid_1.generateUuid)();
                    const resource = webviewInput.resource;
                    webviewInput.webview.origin = this._webviewOriginStore.getOrigin(viewType, extension.id);
                    this.mainThreadWebviewPanels.addWebviewInput(handle, webviewInput, { serializeBuffersForPostMessage });
                    webviewInput.webview.options = options;
                    webviewInput.webview.extension = extension;
                    // If there's an old resource this was a move and we must resolve the backup at the same time as the webview
                    // This is because the backup must be ready upon model creation, and the input resolve method comes after
                    let backupId = webviewInput.backupId;
                    if (webviewInput.oldResource && !webviewInput.backupId) {
                        const backup = this._editorRenameBackups.get(webviewInput.oldResource.toString());
                        backupId = backup?.backupId;
                        this._editorRenameBackups.delete(webviewInput.oldResource.toString());
                    }
                    let modelRef;
                    try {
                        modelRef = await this.getOrCreateCustomEditorModel(modelType, resource, viewType, { backupId }, cancellation);
                    }
                    catch (error) {
                        (0, errors_1.onUnexpectedError)(error);
                        webviewInput.webview.setHtml(this.mainThreadWebview.getWebviewResolvedFailedContent(viewType));
                        return;
                    }
                    if (cancellation.isCancellationRequested) {
                        modelRef.dispose();
                        return;
                    }
                    webviewInput.webview.onDidDispose(() => {
                        // If the model is still dirty, make sure we have time to save it
                        if (modelRef.object.isDirty()) {
                            const sub = modelRef.object.onDidChangeDirty(() => {
                                if (!modelRef.object.isDirty()) {
                                    sub.dispose();
                                    modelRef.dispose();
                                }
                            });
                            return;
                        }
                        modelRef.dispose();
                    });
                    if (capabilities.supportsMove) {
                        webviewInput.onMove(async (newResource) => {
                            const oldModel = modelRef;
                            modelRef = await this.getOrCreateCustomEditorModel(modelType, newResource, viewType, {}, cancellation_1.CancellationToken.None);
                            this._proxyCustomEditors.$onMoveCustomEditor(handle, newResource, viewType);
                            oldModel.dispose();
                        });
                    }
                    try {
                        await this._proxyCustomEditors.$resolveCustomEditor(resource, handle, viewType, {
                            title: webviewInput.getTitle(),
                            contentOptions: webviewInput.webview.contentOptions,
                            options: webviewInput.webview.options,
                            active: webviewInput === this._editorService.activeEditor,
                        }, (0, editorGroupColumn_1.editorGroupToColumn)(this._editorGroupService, webviewInput.group || 0), cancellation);
                    }
                    catch (error) {
                        (0, errors_1.onUnexpectedError)(error);
                        webviewInput.webview.setHtml(this.mainThreadWebview.getWebviewResolvedFailedContent(viewType));
                        modelRef.dispose();
                        return;
                    }
                }
            }));
            this._editorProviders.set(viewType, disposables);
        }
        $unregisterEditorProvider(viewType) {
            if (!this._editorProviders.has(viewType)) {
                throw new Error(`No provider for ${viewType} registered`);
            }
            this._editorProviders.deleteAndDispose(viewType);
            this._customEditorService.models.disposeAllModelsForView(viewType);
        }
        async getOrCreateCustomEditorModel(modelType, resource, viewType, options, cancellation) {
            const existingModel = this._customEditorService.models.tryRetain(resource, viewType);
            if (existingModel) {
                return existingModel;
            }
            switch (modelType) {
                case 1 /* CustomEditorModelType.Text */:
                    {
                        const model = customTextEditorModel_1.CustomTextEditorModel.create(this._instantiationService, viewType, resource);
                        return this._customEditorService.models.add(resource, viewType, model);
                    }
                case 0 /* CustomEditorModelType.Custom */:
                    {
                        const model = MainThreadCustomEditorModel.create(this._instantiationService, this._proxyCustomEditors, viewType, resource, options, () => {
                            return Array.from(this.mainThreadWebviewPanels.webviewInputs)
                                .filter(editor => editor instanceof customEditorInput_1.CustomEditorInput && (0, resources_1.isEqual)(editor.resource, resource));
                        }, cancellation);
                        return this._customEditorService.models.add(resource, viewType, model);
                    }
            }
        }
        async $onDidEdit(resourceComponents, viewType, editId, label) {
            const model = await this.getCustomEditorModel(resourceComponents, viewType);
            model.pushEdit(editId, label);
        }
        async $onContentChange(resourceComponents, viewType) {
            const model = await this.getCustomEditorModel(resourceComponents, viewType);
            model.changeContent();
        }
        async getCustomEditorModel(resourceComponents, viewType) {
            const resource = uri_1.URI.revive(resourceComponents);
            const model = await this._customEditorService.models.get(resource, viewType);
            if (!model || !(model instanceof MainThreadCustomEditorModel)) {
                throw new Error('Could not find model for webview editor');
            }
            return model;
        }
        //#region Working Copy
        async onWillRunWorkingCopyFileOperation(e) {
            if (e.operation !== 2 /* FileOperation.MOVE */) {
                return;
            }
            e.waitUntil((async () => {
                const models = [];
                for (const file of e.files) {
                    if (file.source) {
                        models.push(...(await this._customEditorService.models.getAllModels(file.source)));
                    }
                }
                for (const model of models) {
                    if (model instanceof MainThreadCustomEditorModel && model.isDirty()) {
                        const workingCopy = await model.backup(cancellation_1.CancellationToken.None);
                        if (workingCopy.meta) {
                            // This cast is safe because we do an instanceof check above and a custom document backup data is always returned
                            this._editorRenameBackups.set(model.editorResource.toString(), workingCopy.meta);
                        }
                    }
                }
            })());
        }
    };
    exports.MainThreadCustomEditors = MainThreadCustomEditors;
    exports.MainThreadCustomEditors = MainThreadCustomEditors = __decorate([
        __param(3, extensions_1.IExtensionService),
        __param(4, storage_1.IStorageService),
        __param(5, workingCopyService_1.IWorkingCopyService),
        __param(6, workingCopyFileService_1.IWorkingCopyFileService),
        __param(7, customEditor_1.ICustomEditorService),
        __param(8, editorGroupsService_1.IEditorGroupsService),
        __param(9, editorService_1.IEditorService),
        __param(10, instantiation_1.IInstantiationService),
        __param(11, webviewWorkbenchService_1.IWebviewWorkbenchService)
    ], MainThreadCustomEditors);
    var HotExitState;
    (function (HotExitState) {
        let Type;
        (function (Type) {
            Type[Type["Allowed"] = 0] = "Allowed";
            Type[Type["NotAllowed"] = 1] = "NotAllowed";
            Type[Type["Pending"] = 2] = "Pending";
        })(Type = HotExitState.Type || (HotExitState.Type = {}));
        HotExitState.Allowed = Object.freeze({ type: 0 /* Type.Allowed */ });
        HotExitState.NotAllowed = Object.freeze({ type: 1 /* Type.NotAllowed */ });
        class Pending {
            constructor(operation) {
                this.operation = operation;
                this.type = 2 /* Type.Pending */;
            }
        }
        HotExitState.Pending = Pending;
    })(HotExitState || (HotExitState = {}));
    let MainThreadCustomEditorModel = MainThreadCustomEditorModel_1 = class MainThreadCustomEditorModel extends resourceWorkingCopy_1.ResourceWorkingCopy {
        static async create(instantiationService, proxy, viewType, resource, options, getEditors, cancellation) {
            const editors = getEditors();
            let untitledDocumentData;
            if (editors.length !== 0) {
                untitledDocumentData = editors[0].untitledDocumentData;
            }
            const { editable } = await proxy.$createCustomDocument(resource, viewType, options.backupId, untitledDocumentData, cancellation);
            return instantiationService.createInstance(MainThreadCustomEditorModel_1, proxy, viewType, resource, !!options.backupId, editable, !!untitledDocumentData, getEditors);
        }
        constructor(_proxy, _viewType, _editorResource, fromBackup, _editable, startDirty, _getEditors, _fileDialogService, fileService, _labelService, _undoService, _environmentService, workingCopyService, _pathService, extensionService) {
            super(MainThreadCustomEditorModel_1.toWorkingCopyResource(_viewType, _editorResource), fileService);
            this._proxy = _proxy;
            this._viewType = _viewType;
            this._editorResource = _editorResource;
            this._editable = _editable;
            this._getEditors = _getEditors;
            this._fileDialogService = _fileDialogService;
            this._labelService = _labelService;
            this._undoService = _undoService;
            this._environmentService = _environmentService;
            this._pathService = _pathService;
            this._fromBackup = false;
            this._hotExitState = HotExitState.Allowed;
            this._currentEditIndex = -1;
            this._savePoint = -1;
            this._edits = [];
            this._isDirtyFromContentChange = false;
            // TODO@mjbvz consider to enable a `typeId` that is specific for custom
            // editors. Using a distinct `typeId` allows the working copy to have
            // any resource (including file based resources) even if other working
            // copies exist with the same resource.
            //
            // IMPORTANT: changing the `typeId` has an impact on backups for this
            // working copy. Any value that is not the empty string will be used
            // as seed to the backup. Only change the `typeId` if you have implemented
            // a fallback solution to resolve any existing backups that do not have
            // this seed.
            this.typeId = workingCopy_1.NO_TYPE_ID;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._onDidSave = this._register(new event_1.Emitter());
            this.onDidSave = this._onDidSave.event;
            this.onDidChangeReadonly = event_1.Event.None;
            this._fromBackup = fromBackup;
            if (_editable) {
                this._register(workingCopyService.registerWorkingCopy(this));
                this._register(extensionService.onWillStop(e => {
                    if (!this.isDirty()) {
                        return;
                    }
                    e.veto((async () => {
                        const didSave = await this.save();
                        if (!didSave) {
                            // Veto
                            return true;
                        }
                        return false; // Don't veto
                    })(), (0, nls_1.localize)('vetoExtHostRestart', "Custom editor '{0}' could not be saved.", this.name));
                }));
            }
            // Normally means we're re-opening an untitled file
            if (startDirty) {
                this._isDirtyFromContentChange = true;
            }
        }
        get editorResource() {
            return this._editorResource;
        }
        dispose() {
            if (this._editable) {
                this._undoService.removeElements(this._editorResource);
            }
            this._proxy.$disposeCustomDocument(this._editorResource, this._viewType);
            super.dispose();
        }
        //#region IWorkingCopy
        // Make sure each custom editor has a unique resource for backup and edits
        static toWorkingCopyResource(viewType, resource) {
            const authority = viewType.replace(/[^a-z0-9\-_]/gi, '-');
            const path = `/${(0, dom_1.multibyteAwareBtoa)(resource.with({ query: null, fragment: null }).toString(true))}`;
            return uri_1.URI.from({
                scheme: network_1.Schemas.vscodeCustomEditor,
                authority: authority,
                path: path,
                query: JSON.stringify(resource.toJSON()),
            });
        }
        get name() {
            return (0, path_1.basename)(this._labelService.getUriLabel(this._editorResource));
        }
        get capabilities() {
            return this.isUntitled() ? 2 /* WorkingCopyCapabilities.Untitled */ : 0 /* WorkingCopyCapabilities.None */;
        }
        isDirty() {
            if (this._isDirtyFromContentChange) {
                return true;
            }
            if (this._edits.length > 0) {
                return this._savePoint !== this._currentEditIndex;
            }
            return this._fromBackup;
        }
        isUntitled() {
            return this._editorResource.scheme === network_1.Schemas.untitled;
        }
        //#endregion
        isReadonly() {
            return !this._editable;
        }
        get viewType() {
            return this._viewType;
        }
        get backupId() {
            return this._backupId;
        }
        pushEdit(editId, label) {
            if (!this._editable) {
                throw new Error('Document is not editable');
            }
            this.change(() => {
                this.spliceEdits(editId);
                this._currentEditIndex = this._edits.length - 1;
            });
            this._undoService.pushElement({
                type: 0 /* UndoRedoElementType.Resource */,
                resource: this._editorResource,
                label: label ?? (0, nls_1.localize)('defaultEditLabel', "Edit"),
                code: 'undoredo.customEditorEdit',
                undo: () => this.undo(),
                redo: () => this.redo(),
            });
        }
        changeContent() {
            this.change(() => {
                this._isDirtyFromContentChange = true;
            });
        }
        async undo() {
            if (!this._editable) {
                return;
            }
            if (this._currentEditIndex < 0) {
                // nothing to undo
                return;
            }
            const undoneEdit = this._edits[this._currentEditIndex];
            this.change(() => {
                --this._currentEditIndex;
            });
            await this._proxy.$undo(this._editorResource, this.viewType, undoneEdit, this.isDirty());
        }
        async redo() {
            if (!this._editable) {
                return;
            }
            if (this._currentEditIndex >= this._edits.length - 1) {
                // nothing to redo
                return;
            }
            const redoneEdit = this._edits[this._currentEditIndex + 1];
            this.change(() => {
                ++this._currentEditIndex;
            });
            await this._proxy.$redo(this._editorResource, this.viewType, redoneEdit, this.isDirty());
        }
        spliceEdits(editToInsert) {
            const start = this._currentEditIndex + 1;
            const toRemove = this._edits.length - this._currentEditIndex;
            const removedEdits = typeof editToInsert === 'number'
                ? this._edits.splice(start, toRemove, editToInsert)
                : this._edits.splice(start, toRemove);
            if (removedEdits.length) {
                this._proxy.$disposeEdits(this._editorResource, this._viewType, removedEdits);
            }
        }
        change(makeEdit) {
            const wasDirty = this.isDirty();
            makeEdit();
            this._onDidChangeContent.fire();
            if (this.isDirty() !== wasDirty) {
                this._onDidChangeDirty.fire();
            }
        }
        async revert(options) {
            if (!this._editable) {
                return;
            }
            if (this._currentEditIndex === this._savePoint && !this._isDirtyFromContentChange && !this._fromBackup) {
                return;
            }
            if (!options?.soft) {
                this._proxy.$revert(this._editorResource, this.viewType, cancellation_1.CancellationToken.None);
            }
            this.change(() => {
                this._isDirtyFromContentChange = false;
                this._fromBackup = false;
                this._currentEditIndex = this._savePoint;
                this.spliceEdits();
            });
        }
        async save(options) {
            const result = !!await this.saveCustomEditor(options);
            // Emit Save Event
            if (result) {
                this._onDidSave.fire({ reason: options?.reason, source: options?.source });
            }
            return result;
        }
        async saveCustomEditor(options) {
            if (!this._editable) {
                return undefined;
            }
            if (this.isUntitled()) {
                const targetUri = await this.suggestUntitledSavePath(options);
                if (!targetUri) {
                    return undefined;
                }
                await this.saveCustomEditorAs(this._editorResource, targetUri, options);
                return targetUri;
            }
            const savePromise = (0, async_1.createCancelablePromise)(token => this._proxy.$onSave(this._editorResource, this.viewType, token));
            this._ongoingSave?.cancel();
            this._ongoingSave = savePromise;
            try {
                await savePromise;
                if (this._ongoingSave === savePromise) { // Make sure we are still doing the same save
                    this.change(() => {
                        this._isDirtyFromContentChange = false;
                        this._savePoint = this._currentEditIndex;
                        this._fromBackup = false;
                    });
                }
            }
            finally {
                if (this._ongoingSave === savePromise) { // Make sure we are still doing the same save
                    this._ongoingSave = undefined;
                }
            }
            return this._editorResource;
        }
        suggestUntitledSavePath(options) {
            if (!this.isUntitled()) {
                throw new Error('Resource is not untitled');
            }
            const remoteAuthority = this._environmentService.remoteAuthority;
            const localResource = (0, resources_1.toLocalResource)(this._editorResource, remoteAuthority, this._pathService.defaultUriScheme);
            return this._fileDialogService.pickFileToSave(localResource, options?.availableFileSystems);
        }
        async saveCustomEditorAs(resource, targetResource, _options) {
            if (this._editable) {
                // TODO: handle cancellation
                await (0, async_1.createCancelablePromise)(token => this._proxy.$onSaveAs(this._editorResource, this.viewType, targetResource, token));
                this.change(() => {
                    this._savePoint = this._currentEditIndex;
                });
                return true;
            }
            else {
                // Since the editor is readonly, just copy the file over
                await this.fileService.copy(resource, targetResource, false /* overwrite */);
                return true;
            }
        }
        async backup(token) {
            const editors = this._getEditors();
            if (!editors.length) {
                throw new Error('No editors found for resource, cannot back up');
            }
            const primaryEditor = editors[0];
            const backupMeta = {
                viewType: this.viewType,
                editorResource: this._editorResource,
                backupId: '',
                extension: primaryEditor.extension ? {
                    id: primaryEditor.extension.id.value,
                    location: primaryEditor.extension.location,
                } : undefined,
                webview: {
                    origin: primaryEditor.webview.origin,
                    options: primaryEditor.webview.options,
                    state: primaryEditor.webview.state,
                }
            };
            const backupData = {
                meta: backupMeta
            };
            if (!this._editable) {
                return backupData;
            }
            if (this._hotExitState.type === 2 /* HotExitState.Type.Pending */) {
                this._hotExitState.operation.cancel();
            }
            const pendingState = new HotExitState.Pending((0, async_1.createCancelablePromise)(token => this._proxy.$backup(this._editorResource.toJSON(), this.viewType, token)));
            this._hotExitState = pendingState;
            token.onCancellationRequested(() => {
                pendingState.operation.cancel();
            });
            let errorMessage = '';
            try {
                const backupId = await pendingState.operation;
                // Make sure state has not changed in the meantime
                if (this._hotExitState === pendingState) {
                    this._hotExitState = HotExitState.Allowed;
                    backupData.meta.backupId = backupId;
                    this._backupId = backupId;
                }
            }
            catch (e) {
                if ((0, errors_1.isCancellationError)(e)) {
                    // This is expected
                    throw e;
                }
                // Otherwise it could be a real error. Make sure state has not changed in the meantime.
                if (this._hotExitState === pendingState) {
                    this._hotExitState = HotExitState.NotAllowed;
                }
                if (e.message) {
                    errorMessage = e.message;
                }
            }
            if (this._hotExitState === HotExitState.Allowed) {
                return backupData;
            }
            throw new Error(`Cannot back up in this state: ${errorMessage}`);
        }
    };
    MainThreadCustomEditorModel = MainThreadCustomEditorModel_1 = __decorate([
        __param(7, dialogs_1.IFileDialogService),
        __param(8, files_1.IFileService),
        __param(9, label_1.ILabelService),
        __param(10, undoRedo_1.IUndoRedoService),
        __param(11, environmentService_1.IWorkbenchEnvironmentService),
        __param(12, workingCopyService_1.IWorkingCopyService),
        __param(13, pathService_1.IPathService),
        __param(14, extensions_1.IExtensionService)
    ], MainThreadCustomEditorModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEN1c3RvbUVkaXRvcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZEN1c3RvbUVkaXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTRDaEcsSUFBVyxxQkFHVjtJQUhELFdBQVcscUJBQXFCO1FBQy9CLHFFQUFNLENBQUE7UUFDTixpRUFBSSxDQUFBO0lBQ0wsQ0FBQyxFQUhVLHFCQUFxQixLQUFyQixxQkFBcUIsUUFHL0I7SUFFTSxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLHNCQUFVO1FBVXRELFlBQ0MsT0FBd0IsRUFDUCxpQkFBcUMsRUFDckMsdUJBQWdELEVBQzlDLGdCQUFtQyxFQUNyQyxjQUErQixFQUMzQixrQkFBdUMsRUFDbkMsc0JBQStDLEVBQ2xELG9CQUEyRCxFQUMzRCxtQkFBMEQsRUFDaEUsY0FBK0MsRUFDeEMscUJBQTZELEVBQzFELHdCQUFtRTtZQUU3RixLQUFLLEVBQUUsQ0FBQztZQVpTLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDckMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUF5QjtZQUsxQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQzFDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDL0MsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQ3ZCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDekMsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQWxCN0UscUJBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHlCQUFhLEVBQVUsQ0FBQyxDQUFDO1lBRS9ELHlCQUFvQixHQUFHLElBQUksR0FBRyxFQUFvQyxDQUFDO1lBb0JuRixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFB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