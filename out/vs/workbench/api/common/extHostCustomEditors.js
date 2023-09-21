/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostWebview", "./cache", "./extHost.protocol", "./extHostTypes"], function (require, exports, cancellation_1, hash_1, lifecycle_1, network_1, resources_1, uri_1, typeConverters, extHostWebview_1, cache_1, extHostProtocol, extHostTypes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostCustomEditors = void 0;
    class CustomDocumentStoreEntry {
        constructor(document, _storagePath) {
            this.document = document;
            this._storagePath = _storagePath;
            this._backupCounter = 1;
            this._edits = new cache_1.Cache('custom documents');
        }
        addEdit(item) {
            return this._edits.add([item]);
        }
        async undo(editId, isDirty) {
            await this.getEdit(editId).undo();
            if (!isDirty) {
                this.disposeBackup();
            }
        }
        async redo(editId, isDirty) {
            await this.getEdit(editId).redo();
            if (!isDirty) {
                this.disposeBackup();
            }
        }
        disposeEdits(editIds) {
            for (const id of editIds) {
                this._edits.delete(id);
            }
        }
        getNewBackupUri() {
            if (!this._storagePath) {
                throw new Error('Backup requires a valid storage path');
            }
            const fileName = hashPath(this.document.uri) + (this._backupCounter++);
            return (0, resources_1.joinPath)(this._storagePath, fileName);
        }
        updateBackup(backup) {
            this._backup?.delete();
            this._backup = backup;
        }
        disposeBackup() {
            this._backup?.delete();
            this._backup = undefined;
        }
        getEdit(editId) {
            const edit = this._edits.get(editId, 0);
            if (!edit) {
                throw new Error('No edit found');
            }
            return edit;
        }
    }
    class CustomDocumentStore {
        constructor() {
            this._documents = new Map();
        }
        get(viewType, resource) {
            return this._documents.get(this.key(viewType, resource));
        }
        add(viewType, document, storagePath) {
            const key = this.key(viewType, document.uri);
            if (this._documents.has(key)) {
                throw new Error(`Document already exists for viewType:${viewType} resource:${document.uri}`);
            }
            const entry = new CustomDocumentStoreEntry(document, storagePath);
            this._documents.set(key, entry);
            return entry;
        }
        delete(viewType, document) {
            const key = this.key(viewType, document.uri);
            this._documents.delete(key);
        }
        key(viewType, resource) {
            return `${viewType}@@@${resource}`;
        }
    }
    var CustomEditorType;
    (function (CustomEditorType) {
        CustomEditorType[CustomEditorType["Text"] = 0] = "Text";
        CustomEditorType[CustomEditorType["Custom"] = 1] = "Custom";
    })(CustomEditorType || (CustomEditorType = {}));
    class EditorProviderStore {
        constructor() {
            this._providers = new Map();
        }
        addTextProvider(viewType, extension, provider) {
            return this.add(0 /* CustomEditorType.Text */, viewType, extension, provider);
        }
        addCustomProvider(viewType, extension, provider) {
            return this.add(1 /* CustomEditorType.Custom */, viewType, extension, provider);
        }
        get(viewType) {
            return this._providers.get(viewType);
        }
        add(type, viewType, extension, provider) {
            if (this._providers.has(viewType)) {
                throw new Error(`Provider for viewType:${viewType} already registered`);
            }
            this._providers.set(viewType, { type, extension, provider });
            return new extHostTypes.Disposable(() => this._providers.delete(viewType));
        }
    }
    class ExtHostCustomEditors {
        constructor(mainContext, _extHostDocuments, _extensionStoragePaths, _extHostWebview, _extHostWebviewPanels) {
            this._extHostDocuments = _extHostDocuments;
            this._extensionStoragePaths = _extensionStoragePaths;
            this._extHostWebview = _extHostWebview;
            this._extHostWebviewPanels = _extHostWebviewPanels;
            this._editorProviders = new EditorProviderStore();
            this._documents = new CustomDocumentStore();
            this._proxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadCustomEditors);
        }
        registerCustomEditorProvider(extension, viewType, provider, options) {
            const disposables = new lifecycle_1.DisposableStore();
            if (isCustomTextEditorProvider(provider)) {
                disposables.add(this._editorProviders.addTextProvider(viewType, extension, provider));
                this._proxy.$registerTextEditorProvider((0, extHostWebview_1.toExtensionData)(extension), viewType, options.webviewOptions || {}, {
                    supportsMove: !!provider.moveCustomTextEditor,
                }, (0, extHostWebview_1.shouldSerializeBuffersForPostMessage)(extension));
            }
            else {
                disposables.add(this._editorProviders.addCustomProvider(viewType, extension, provider));
                if (isCustomEditorProviderWithEditingCapability(provider)) {
                    disposables.add(provider.onDidChangeCustomDocument(e => {
                        const entry = this.getCustomDocumentEntry(viewType, e.document.uri);
                        if (isEditEvent(e)) {
                            const editId = entry.addEdit(e);
                            this._proxy.$onDidEdit(e.document.uri, viewType, editId, e.label);
                        }
                        else {
                            this._proxy.$onContentChange(e.document.uri, viewType);
                        }
                    }));
                }
                this._proxy.$registerCustomEditorProvider((0, extHostWebview_1.toExtensionData)(extension), viewType, options.webviewOptions || {}, !!options.supportsMultipleEditorsPerDocument, (0, extHostWebview_1.shouldSerializeBuffersForPostMessage)(extension));
            }
            return extHostTypes.Disposable.from(disposables, new extHostTypes.Disposable(() => {
                this._proxy.$unregisterEditorProvider(viewType);
            }));
        }
        async $createCustomDocument(resource, viewType, backupId, untitledDocumentData, cancellation) {
            const entry = this._editorProviders.get(viewType);
            if (!entry) {
                throw new Error(`No provider found for '${viewType}'`);
            }
            if (entry.type !== 1 /* CustomEditorType.Custom */) {
                throw new Error(`Invalid provide type for '${viewType}'`);
            }
            const revivedResource = uri_1.URI.revive(resource);
            const document = await entry.provider.openCustomDocument(revivedResource, { backupId, untitledDocumentData: untitledDocumentData?.buffer }, cancellation);
            let storageRoot;
            if (isCustomEditorProviderWithEditingCapability(entry.provider) && this._extensionStoragePaths) {
                storageRoot = this._extensionStoragePaths.workspaceValue(entry.extension) ?? this._extensionStoragePaths.globalValue(entry.extension);
            }
            this._documents.add(viewType, document, storageRoot);
            return { editable: isCustomEditorProviderWithEditingCapability(entry.provider) };
        }
        async $disposeCustomDocument(resource, viewType) {
            const entry = this._editorProviders.get(viewType);
            if (!entry) {
                throw new Error(`No provider found for '${viewType}'`);
            }
            if (entry.type !== 1 /* CustomEditorType.Custom */) {
                throw new Error(`Invalid provider type for '${viewType}'`);
            }
            const revivedResource = uri_1.URI.revive(resource);
            const { document } = this.getCustomDocumentEntry(viewType, revivedResource);
            this._documents.delete(viewType, document);
            document.dispose();
        }
        async $resolveCustomEditor(resource, handle, viewType, initData, position, cancellation) {
            const entry = this._editorProviders.get(viewType);
            if (!entry) {
                throw new Error(`No provider found for '${viewType}'`);
            }
            const viewColumn = typeConverters.ViewColumn.to(position);
            const webview = this._extHostWebview.createNewWebview(handle, initData.contentOptions, entry.extension);
            const panel = this._extHostWebviewPanels.createNewWebviewPanel(handle, viewType, initData.title, viewColumn, initData.options, webview, initData.active);
            const revivedResource = uri_1.URI.revive(resource);
            switch (entry.type) {
                case 1 /* CustomEditorType.Custom */: {
                    const { document } = this.getCustomDocumentEntry(viewType, revivedResource);
                    return entry.provider.resolveCustomEditor(document, panel, cancellation);
                }
                case 0 /* CustomEditorType.Text */: {
                    const document = this._extHostDocuments.getDocument(revivedResource);
                    return entry.provider.resolveCustomTextEditor(document, panel, cancellation);
                }
                default: {
                    throw new Error('Unknown webview provider type');
                }
            }
        }
        $disposeEdits(resourceComponents, viewType, editIds) {
            const document = this.getCustomDocumentEntry(viewType, resourceComponents);
            document.disposeEdits(editIds);
        }
        async $onMoveCustomEditor(handle, newResourceComponents, viewType) {
            const entry = this._editorProviders.get(viewType);
            if (!entry) {
                throw new Error(`No provider found for '${viewType}'`);
            }
            if (!entry.provider.moveCustomTextEditor) {
                throw new Error(`Provider does not implement move '${viewType}'`);
            }
            const webview = this._extHostWebviewPanels.getWebviewPanel(handle);
            if (!webview) {
                throw new Error(`No webview found`);
            }
            const resource = uri_1.URI.revive(newResourceComponents);
            const document = this._extHostDocuments.getDocument(resource);
            await entry.provider.moveCustomTextEditor(document, webview, cancellation_1.CancellationToken.None);
        }
        async $undo(resourceComponents, viewType, editId, isDirty) {
            const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
            return entry.undo(editId, isDirty);
        }
        async $redo(resourceComponents, viewType, editId, isDirty) {
            const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
            return entry.redo(editId, isDirty);
        }
        async $revert(resourceComponents, viewType, cancellation) {
            const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
            const provider = this.getCustomEditorProvider(viewType);
            await provider.revertCustomDocument(entry.document, cancellation);
            entry.disposeBackup();
        }
        async $onSave(resourceComponents, viewType, cancellation) {
            const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
            const provider = this.getCustomEditorProvider(viewType);
            await provider.saveCustomDocument(entry.document, cancellation);
            entry.disposeBackup();
        }
        async $onSaveAs(resourceComponents, viewType, targetResource, cancellation) {
            const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
            const provider = this.getCustomEditorProvider(viewType);
            return provider.saveCustomDocumentAs(entry.document, uri_1.URI.revive(targetResource), cancellation);
        }
        async $backup(resourceComponents, viewType, cancellation) {
            const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
            const provider = this.getCustomEditorProvider(viewType);
            const backup = await provider.backupCustomDocument(entry.document, {
                destination: entry.getNewBackupUri(),
            }, cancellation);
            entry.updateBackup(backup);
            return backup.id;
        }
        getCustomDocumentEntry(viewType, resource) {
            const entry = this._documents.get(viewType, uri_1.URI.revive(resource));
            if (!entry) {
                throw new Error('No custom document found');
            }
            return entry;
        }
        getCustomEditorProvider(viewType) {
            const entry = this._editorProviders.get(viewType);
            const provider = entry?.provider;
            if (!provider || !isCustomEditorProviderWithEditingCapability(provider)) {
                throw new Error('Custom document is not editable');
            }
            return provider;
        }
    }
    exports.ExtHostCustomEditors = ExtHostCustomEditors;
    function isCustomEditorProviderWithEditingCapability(provider) {
        return !!provider.onDidChangeCustomDocument;
    }
    function isCustomTextEditorProvider(provider) {
        return typeof provider.resolveCustomTextEditor === 'function';
    }
    function isEditEvent(e) {
        return typeof e.undo === 'function'
            && typeof e.redo === 'function';
    }
    function hashPath(resource) {
        const str = resource.scheme === network_1.Schemas.file || resource.scheme === network_1.Schemas.untitled ? resource.fsPath : resource.toString();
        return (0, hash_1.hash)(str) + '';
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEN1c3RvbUVkaXRvcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0Q3VzdG9tRWRpdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFzQmhHLE1BQU0sd0JBQXdCO1FBSTdCLFlBQ2lCLFFBQStCLEVBQzlCLFlBQTZCO1lBRDlCLGFBQVEsR0FBUixRQUFRLENBQXVCO1lBQzlCLGlCQUFZLEdBQVosWUFBWSxDQUFpQjtZQUp2QyxtQkFBYyxHQUFHLENBQUMsQ0FBQztZQU9WLFdBQU0sR0FBRyxJQUFJLGFBQUssQ0FBaUMsa0JBQWtCLENBQUMsQ0FBQztRQUZwRixDQUFDO1FBTUwsT0FBTyxDQUFDLElBQW9DO1lBQzNDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQWMsRUFBRSxPQUFnQjtZQUMxQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7YUFDckI7UUFDRixDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFjLEVBQUUsT0FBZ0I7WUFDMUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2FBQ3JCO1FBQ0YsQ0FBQztRQUVELFlBQVksQ0FBQyxPQUFpQjtZQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLE9BQU8sRUFBRTtnQkFDekIsSUFB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