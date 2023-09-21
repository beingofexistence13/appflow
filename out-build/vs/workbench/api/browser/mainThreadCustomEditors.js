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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uuid", "vs/nls!vs/workbench/api/browser/mainThreadCustomEditors", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/storage/common/storage", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/api/browser/mainThreadWebviews", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/customEditor/browser/customEditorInput", "vs/workbench/contrib/customEditor/common/customEditor", "vs/workbench/contrib/customEditor/common/customTextEditorModel", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/path/common/pathService", "vs/workbench/services/workingCopy/common/resourceWorkingCopy", "vs/workbench/services/workingCopy/common/workingCopy", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/workingCopy/common/workingCopyService"], function (require, exports, dom_1, async_1, cancellation_1, errors_1, event_1, lifecycle_1, network_1, path_1, resources_1, uri_1, uuid_1, nls_1, dialogs_1, files_1, instantiation_1, label_1, storage_1, undoRedo_1, mainThreadWebviews_1, extHostProtocol, customEditorInput_1, customEditor_1, customTextEditorModel_1, webview_1, webviewWorkbenchService_1, editorGroupColumn_1, editorGroupsService_1, editorService_1, environmentService_1, extensions_1, pathService_1, resourceWorkingCopy_1, workingCopy_1, workingCopyFileService_1, workingCopyService_1) {
    "use strict";
    var MainThreadCustomEditorModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ulb = void 0;
    var CustomEditorModelType;
    (function (CustomEditorModelType) {
        CustomEditorModelType[CustomEditorModelType["Custom"] = 0] = "Custom";
        CustomEditorModelType[CustomEditorModelType["Text"] = 1] = "Text";
    })(CustomEditorModelType || (CustomEditorModelType = {}));
    let $ulb = class $ulb extends lifecycle_1.$kc {
        constructor(context, g, h, extensionService, storageService, workingCopyService, workingCopyFileService, j, m, n, r, s) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.b = this.B(new lifecycle_1.$sc());
            this.c = new Map();
            this.f = new webview_1.$Obb('mainThreadCustomEditors.origins', storageService);
            this.a = context.getProxy(extHostProtocol.$2J.ExtHostCustomEditors);
            this.B(workingCopyFileService.registerWorkingCopyProvider((editorResource) => {
                const matchedWorkingCopies = [];
                for (const workingCopy of workingCopyService.workingCopies) {
                    if (workingCopy instanceof MainThreadCustomEditorModel) {
                        if ((0, resources_1.$cg)(editorResource, workingCopy.editorResource)) {
                            matchedWorkingCopies.push(workingCopy);
                        }
                    }
                }
                return matchedWorkingCopies;
            }));
            // This reviver's only job is to activate custom editor extensions.
            this.B(s.registerResolver({
                canResolve: (webview) => {
                    if (webview instanceof customEditorInput_1.$kfb) {
                        extensionService.activateByEvent(`onCustomEditor:${webview.viewType}`);
                    }
                    return false;
                },
                resolveWebview: () => { throw new Error('not implemented'); }
            }));
            // Working copy operations
            this.B(workingCopyFileService.onWillRunWorkingCopyFileOperation(async (e) => this.y(e)));
        }
        $registerTextEditorProvider(extensionData, viewType, options, capabilities, serializeBuffersForPostMessage) {
            this.t(1 /* CustomEditorModelType.Text */, (0, mainThreadWebviews_1.$bcb)(extensionData), viewType, options, capabilities, true, serializeBuffersForPostMessage);
        }
        $registerCustomEditorProvider(extensionData, viewType, options, supportsMultipleEditorsPerDocument, serializeBuffersForPostMessage) {
            this.t(0 /* CustomEditorModelType.Custom */, (0, mainThreadWebviews_1.$bcb)(extensionData), viewType, options, {}, supportsMultipleEditorsPerDocument, serializeBuffersForPostMessage);
        }
        t(modelType, extension, viewType, options, capabilities, supportsMultipleEditorsPerDocument, serializeBuffersForPostMessage) {
            if (this.b.has(viewType)) {
                throw new Error(`Provider for ${viewType} already registered`);
            }
            const disposables = new lifecycle_1.$jc();
            disposables.add(this.j.registerCustomEditorCapabilities(viewType, {
                supportsMultipleEditorsPerDocument
            }));
            disposables.add(this.s.registerResolver({
                canResolve: (webviewInput) => {
                    return webviewInput instanceof customEditorInput_1.$kfb && webviewInput.viewType === viewType;
                },
                resolveWebview: async (webviewInput, cancellation) => {
                    const handle = (0, uuid_1.$4f)();
                    const resource = webviewInput.resource;
                    webviewInput.webview.origin = this.f.getOrigin(viewType, extension.id);
                    this.h.addWebviewInput(handle, webviewInput, { serializeBuffersForPostMessage });
                    webviewInput.webview.options = options;
                    webviewInput.webview.extension = extension;
                    // If there's an old resource this was a move and we must resolve the backup at the same time as the webview
                    // This is because the backup must be ready upon model creation, and the input resolve method comes after
                    let backupId = webviewInput.backupId;
                    if (webviewInput.oldResource && !webviewInput.backupId) {
                        const backup = this.c.get(webviewInput.oldResource.toString());
                        backupId = backup?.backupId;
                        this.c.delete(webviewInput.oldResource.toString());
                    }
                    let modelRef;
                    try {
                        modelRef = await this.u(modelType, resource, viewType, { backupId }, cancellation);
                    }
                    catch (error) {
                        (0, errors_1.$Y)(error);
                        webviewInput.webview.setHtml(this.g.getWebviewResolvedFailedContent(viewType));
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
                            modelRef = await this.u(modelType, newResource, viewType, {}, cancellation_1.CancellationToken.None);
                            this.a.$onMoveCustomEditor(handle, newResource, viewType);
                            oldModel.dispose();
                        });
                    }
                    try {
                        await this.a.$resolveCustomEditor(resource, handle, viewType, {
                            title: webviewInput.getTitle(),
                            contentOptions: webviewInput.webview.contentOptions,
                            options: webviewInput.webview.options,
                            active: webviewInput === this.n.activeEditor,
                        }, (0, editorGroupColumn_1.$5I)(this.m, webviewInput.group || 0), cancellation);
                    }
                    catch (error) {
                        (0, errors_1.$Y)(error);
                        webviewInput.webview.setHtml(this.g.getWebviewResolvedFailedContent(viewType));
                        modelRef.dispose();
                        return;
                    }
                }
            }));
            this.b.set(viewType, disposables);
        }
        $unregisterEditorProvider(viewType) {
            if (!this.b.has(viewType)) {
                throw new Error(`No provider for ${viewType} registered`);
            }
            this.b.deleteAndDispose(viewType);
            this.j.models.disposeAllModelsForView(viewType);
        }
        async u(modelType, resource, viewType, options, cancellation) {
            const existingModel = this.j.models.tryRetain(resource, viewType);
            if (existingModel) {
                return existingModel;
            }
            switch (modelType) {
                case 1 /* CustomEditorModelType.Text */:
                    {
                        const model = customTextEditorModel_1.$tlb.create(this.r, viewType, resource);
                        return this.j.models.add(resource, viewType, model);
                    }
                case 0 /* CustomEditorModelType.Custom */:
                    {
                        const model = MainThreadCustomEditorModel.create(this.r, this.a, viewType, resource, options, () => {
                            return Array.from(this.h.webviewInputs)
                                .filter(editor => editor instanceof customEditorInput_1.$kfb && (0, resources_1.$bg)(editor.resource, resource));
                        }, cancellation);
                        return this.j.models.add(resource, viewType, model);
                    }
            }
        }
        async $onDidEdit(resourceComponents, viewType, editId, label) {
            const model = await this.w(resourceComponents, viewType);
            model.pushEdit(editId, label);
        }
        async $onContentChange(resourceComponents, viewType) {
            const model = await this.w(resourceComponents, viewType);
            model.changeContent();
        }
        async w(resourceComponents, viewType) {
            const resource = uri_1.URI.revive(resourceComponents);
            const model = await this.j.models.get(resource, viewType);
            if (!model || !(model instanceof MainThreadCustomEditorModel)) {
                throw new Error('Could not find model for webview editor');
            }
            return model;
        }
        //#region Working Copy
        async y(e) {
            if (e.operation !== 2 /* FileOperation.MOVE */) {
                return;
            }
            e.waitUntil((async () => {
                const models = [];
                for (const file of e.files) {
                    if (file.source) {
                        models.push(...(await this.j.models.getAllModels(file.source)));
                    }
                }
                for (const model of models) {
                    if (model instanceof MainThreadCustomEditorModel && model.isDirty()) {
                        const workingCopy = await model.backup(cancellation_1.CancellationToken.None);
                        if (workingCopy.meta) {
                            // This cast is safe because we do an instanceof check above and a custom document backup data is always returned
                            this.c.set(model.editorResource.toString(), workingCopy.meta);
                        }
                    }
                }
            })());
        }
    };
    exports.$ulb = $ulb;
    exports.$ulb = $ulb = __decorate([
        __param(3, extensions_1.$MF),
        __param(4, storage_1.$Vo),
        __param(5, workingCopyService_1.$TC),
        __param(6, workingCopyFileService_1.$HD),
        __param(7, customEditor_1.$8eb),
        __param(8, editorGroupsService_1.$5C),
        __param(9, editorService_1.$9C),
        __param(10, instantiation_1.$Ah),
        __param(11, webviewWorkbenchService_1.$hfb)
    ], $ulb);
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
    let MainThreadCustomEditorModel = MainThreadCustomEditorModel_1 = class MainThreadCustomEditorModel extends resourceWorkingCopy_1.$DD {
        static async create(instantiationService, proxy, viewType, resource, options, getEditors, cancellation) {
            const editors = getEditors();
            let untitledDocumentData;
            if (editors.length !== 0) {
                untitledDocumentData = editors[0].untitledDocumentData;
            }
            const { editable } = await proxy.$createCustomDocument(resource, viewType, options.backupId, untitledDocumentData, cancellation);
            return instantiationService.createInstance(MainThreadCustomEditorModel_1, proxy, viewType, resource, !!options.backupId, editable, !!untitledDocumentData, getEditors);
        }
        constructor(z, C, D, fromBackup, F, startDirty, G, H, fileService, I, J, L, workingCopyService, M, extensionService) {
            super(MainThreadCustomEditorModel_1.N(C, D), fileService);
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.m = false;
            this.n = HotExitState.Allowed;
            this.s = -1;
            this.t = -1;
            this.u = [];
            this.w = false;
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
            this.typeId = workingCopy_1.$wA;
            this.P = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.P.event;
            this.Q = this.B(new event_1.$fd());
            this.onDidChangeContent = this.Q.event;
            this.R = this.B(new event_1.$fd());
            this.onDidSave = this.R.event;
            this.onDidChangeReadonly = event_1.Event.None;
            this.m = fromBackup;
            if (F) {
                this.B(workingCopyService.registerWorkingCopy(this));
                this.B(extensionService.onWillStop(e => {
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
                    })(), (0, nls_1.localize)(0, null, this.name));
                }));
            }
            // Normally means we're re-opening an untitled file
            if (startDirty) {
                this.w = true;
            }
        }
        get editorResource() {
            return this.D;
        }
        dispose() {
            if (this.F) {
                this.J.removeElements(this.D);
            }
            this.z.$disposeCustomDocument(this.D, this.C);
            super.dispose();
        }
        //#region IWorkingCopy
        // Make sure each custom editor has a unique resource for backup and edits
        static N(viewType, resource) {
            const authority = viewType.replace(/[^a-z0-9\-_]/gi, '-');
            const path = `/${(0, dom_1.$wP)(resource.with({ query: null, fragment: null }).toString(true))}`;
            return uri_1.URI.from({
                scheme: network_1.Schemas.vscodeCustomEditor,
                authority: authority,
                path: path,
                query: JSON.stringify(resource.toJSON()),
            });
        }
        get name() {
            return (0, path_1.$ae)(this.I.getUriLabel(this.D));
        }
        get capabilities() {
            return this.O() ? 2 /* WorkingCopyCapabilities.Untitled */ : 0 /* WorkingCopyCapabilities.None */;
        }
        isDirty() {
            if (this.w) {
                return true;
            }
            if (this.u.length > 0) {
                return this.t !== this.s;
            }
            return this.m;
        }
        O() {
            return this.D.scheme === network_1.Schemas.untitled;
        }
        //#endregion
        isReadonly() {
            return !this.F;
        }
        get viewType() {
            return this.C;
        }
        get backupId() {
            return this.r;
        }
        pushEdit(editId, label) {
            if (!this.F) {
                throw new Error('Document is not editable');
            }
            this.X(() => {
                this.W(editId);
                this.s = this.u.length - 1;
            });
            this.J.pushElement({
                type: 0 /* UndoRedoElementType.Resource */,
                resource: this.D,
                label: label ?? (0, nls_1.localize)(1, null),
                code: 'undoredo.customEditorEdit',
                undo: () => this.S(),
                redo: () => this.U(),
            });
        }
        changeContent() {
            this.X(() => {
                this.w = true;
            });
        }
        async S() {
            if (!this.F) {
                return;
            }
            if (this.s < 0) {
                // nothing to undo
                return;
            }
            const undoneEdit = this.u[this.s];
            this.X(() => {
                --this.s;
            });
            await this.z.$undo(this.D, this.viewType, undoneEdit, this.isDirty());
        }
        async U() {
            if (!this.F) {
                return;
            }
            if (this.s >= this.u.length - 1) {
                // nothing to redo
                return;
            }
            const redoneEdit = this.u[this.s + 1];
            this.X(() => {
                ++this.s;
            });
            await this.z.$redo(this.D, this.viewType, redoneEdit, this.isDirty());
        }
        W(editToInsert) {
            const start = this.s + 1;
            const toRemove = this.u.length - this.s;
            const removedEdits = typeof editToInsert === 'number'
                ? this.u.splice(start, toRemove, editToInsert)
                : this.u.splice(start, toRemove);
            if (removedEdits.length) {
                this.z.$disposeEdits(this.D, this.C, removedEdits);
            }
        }
        X(makeEdit) {
            const wasDirty = this.isDirty();
            makeEdit();
            this.Q.fire();
            if (this.isDirty() !== wasDirty) {
                this.P.fire();
            }
        }
        async revert(options) {
            if (!this.F) {
                return;
            }
            if (this.s === this.t && !this.w && !this.m) {
                return;
            }
            if (!options?.soft) {
                this.z.$revert(this.D, this.viewType, cancellation_1.CancellationToken.None);
            }
            this.X(() => {
                this.w = false;
                this.m = false;
                this.s = this.t;
                this.W();
            });
        }
        async save(options) {
            const result = !!await this.saveCustomEditor(options);
            // Emit Save Event
            if (result) {
                this.R.fire({ reason: options?.reason, source: options?.source });
            }
            return result;
        }
        async saveCustomEditor(options) {
            if (!this.F) {
                return undefined;
            }
            if (this.O()) {
                const targetUri = await this.Y(options);
                if (!targetUri) {
                    return undefined;
                }
                await this.saveCustomEditorAs(this.D, targetUri, options);
                return targetUri;
            }
            const savePromise = (0, async_1.$ug)(token => this.z.$onSave(this.D, this.viewType, token));
            this.y?.cancel();
            this.y = savePromise;
            try {
                await savePromise;
                if (this.y === savePromise) { // Make sure we are still doing the same save
                    this.X(() => {
                        this.w = false;
                        this.t = this.s;
                        this.m = false;
                    });
                }
            }
            finally {
                if (this.y === savePromise) { // Make sure we are still doing the same save
                    this.y = undefined;
                }
            }
            return this.D;
        }
        Y(options) {
            if (!this.O()) {
                throw new Error('Resource is not untitled');
            }
            const remoteAuthority = this.L.remoteAuthority;
            const localResource = (0, resources_1.$sg)(this.D, remoteAuthority, this.M.defaultUriScheme);
            return this.H.pickFileToSave(localResource, options?.availableFileSystems);
        }
        async saveCustomEditorAs(resource, targetResource, _options) {
            if (this.F) {
                // TODO: handle cancellation
                await (0, async_1.$ug)(token => this.z.$onSaveAs(this.D, this.viewType, targetResource, token));
                this.X(() => {
                    this.t = this.s;
                });
                return true;
            }
            else {
                // Since the editor is readonly, just copy the file over
                await this.a.copy(resource, targetResource, false /* overwrite */);
                return true;
            }
        }
        async backup(token) {
            const editors = this.G();
            if (!editors.length) {
                throw new Error('No editors found for resource, cannot back up');
            }
            const primaryEditor = editors[0];
            const backupMeta = {
                viewType: this.viewType,
                editorResource: this.D,
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
            if (!this.F) {
                return backupData;
            }
            if (this.n.type === 2 /* HotExitState.Type.Pending */) {
                this.n.operation.cancel();
            }
            const pendingState = new HotExitState.Pending((0, async_1.$ug)(token => this.z.$backup(this.D.toJSON(), this.viewType, token)));
            this.n = pendingState;
            token.onCancellationRequested(() => {
                pendingState.operation.cancel();
            });
            let errorMessage = '';
            try {
                const backupId = await pendingState.operation;
                // Make sure state has not changed in the meantime
                if (this.n === pendingState) {
                    this.n = HotExitState.Allowed;
                    backupData.meta.backupId = backupId;
                    this.r = backupId;
                }
            }
            catch (e) {
                if ((0, errors_1.$2)(e)) {
                    // This is expected
                    throw e;
                }
                // Otherwise it could be a real error. Make sure state has not changed in the meantime.
                if (this.n === pendingState) {
                    this.n = HotExitState.NotAllowed;
                }
                if (e.message) {
                    errorMessage = e.message;
                }
            }
            if (this.n === HotExitState.Allowed) {
                return backupData;
            }
            throw new Error(`Cannot back up in this state: ${errorMessage}`);
        }
    };
    MainThreadCustomEditorModel = MainThreadCustomEditorModel_1 = __decorate([
        __param(7, dialogs_1.$qA),
        __param(8, files_1.$6j),
        __param(9, label_1.$Vz),
        __param(10, undoRedo_1.$wu),
        __param(11, environmentService_1.$hJ),
        __param(12, workingCopyService_1.$TC),
        __param(13, pathService_1.$yJ),
        __param(14, extensions_1.$MF)
    ], MainThreadCustomEditorModel);
});
//# sourceMappingURL=mainThreadCustomEditors.js.map