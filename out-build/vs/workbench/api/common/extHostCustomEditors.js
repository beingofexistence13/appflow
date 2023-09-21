/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostWebview", "./cache", "./extHost.protocol", "./extHostTypes"], function (require, exports, cancellation_1, hash_1, lifecycle_1, network_1, resources_1, uri_1, typeConverters, extHostWebview_1, cache_1, extHostProtocol, extHostTypes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Mcc = void 0;
    class CustomDocumentStoreEntry {
        constructor(document, b) {
            this.document = document;
            this.b = b;
            this.a = 1;
            this.c = new cache_1.$6ac('custom documents');
        }
        addEdit(item) {
            return this.c.add([item]);
        }
        async undo(editId, isDirty) {
            await this.f(editId).undo();
            if (!isDirty) {
                this.disposeBackup();
            }
        }
        async redo(editId, isDirty) {
            await this.f(editId).redo();
            if (!isDirty) {
                this.disposeBackup();
            }
        }
        disposeEdits(editIds) {
            for (const id of editIds) {
                this.c.delete(id);
            }
        }
        getNewBackupUri() {
            if (!this.b) {
                throw new Error('Backup requires a valid storage path');
            }
            const fileName = hashPath(this.document.uri) + (this.a++);
            return (0, resources_1.$ig)(this.b, fileName);
        }
        updateBackup(backup) {
            this.d?.delete();
            this.d = backup;
        }
        disposeBackup() {
            this.d?.delete();
            this.d = undefined;
        }
        f(editId) {
            const edit = this.c.get(editId, 0);
            if (!edit) {
                throw new Error('No edit found');
            }
            return edit;
        }
    }
    class CustomDocumentStore {
        constructor() {
            this.a = new Map();
        }
        get(viewType, resource) {
            return this.a.get(this.b(viewType, resource));
        }
        add(viewType, document, storagePath) {
            const key = this.b(viewType, document.uri);
            if (this.a.has(key)) {
                throw new Error(`Document already exists for viewType:${viewType} resource:${document.uri}`);
            }
            const entry = new CustomDocumentStoreEntry(document, storagePath);
            this.a.set(key, entry);
            return entry;
        }
        delete(viewType, document) {
            const key = this.b(viewType, document.uri);
            this.a.delete(key);
        }
        b(viewType, resource) {
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
            this.a = new Map();
        }
        addTextProvider(viewType, extension, provider) {
            return this.b(0 /* CustomEditorType.Text */, viewType, extension, provider);
        }
        addCustomProvider(viewType, extension, provider) {
            return this.b(1 /* CustomEditorType.Custom */, viewType, extension, provider);
        }
        get(viewType) {
            return this.a.get(viewType);
        }
        b(type, viewType, extension, provider) {
            if (this.a.has(viewType)) {
                throw new Error(`Provider for viewType:${viewType} already registered`);
            }
            this.a.set(viewType, { type, extension, provider });
            return new extHostTypes.$3J(() => this.a.delete(viewType));
        }
    }
    class $Mcc {
        constructor(mainContext, d, f, g, h) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.b = new EditorProviderStore();
            this.c = new CustomDocumentStore();
            this.a = mainContext.getProxy(extHostProtocol.$1J.MainThreadCustomEditors);
        }
        registerCustomEditorProvider(extension, viewType, provider, options) {
            const disposables = new lifecycle_1.$jc();
            if (isCustomTextEditorProvider(provider)) {
                disposables.add(this.b.addTextProvider(viewType, extension, provider));
                this.a.$registerTextEditorProvider((0, extHostWebview_1.$acc)(extension), viewType, options.webviewOptions || {}, {
                    supportsMove: !!provider.moveCustomTextEditor,
                }, (0, extHostWebview_1.$$bc)(extension));
            }
            else {
                disposables.add(this.b.addCustomProvider(viewType, extension, provider));
                if (isCustomEditorProviderWithEditingCapability(provider)) {
                    disposables.add(provider.onDidChangeCustomDocument(e => {
                        const entry = this.i(viewType, e.document.uri);
                        if (isEditEvent(e)) {
                            const editId = entry.addEdit(e);
                            this.a.$onDidEdit(e.document.uri, viewType, editId, e.label);
                        }
                        else {
                            this.a.$onContentChange(e.document.uri, viewType);
                        }
                    }));
                }
                this.a.$registerCustomEditorProvider((0, extHostWebview_1.$acc)(extension), viewType, options.webviewOptions || {}, !!options.supportsMultipleEditorsPerDocument, (0, extHostWebview_1.$$bc)(extension));
            }
            return extHostTypes.$3J.from(disposables, new extHostTypes.$3J(() => {
                this.a.$unregisterEditorProvider(viewType);
            }));
        }
        async $createCustomDocument(resource, viewType, backupId, untitledDocumentData, cancellation) {
            const entry = this.b.get(viewType);
            if (!entry) {
                throw new Error(`No provider found for '${viewType}'`);
            }
            if (entry.type !== 1 /* CustomEditorType.Custom */) {
                throw new Error(`Invalid provide type for '${viewType}'`);
            }
            const revivedResource = uri_1.URI.revive(resource);
            const document = await entry.provider.openCustomDocument(revivedResource, { backupId, untitledDocumentData: untitledDocumentData?.buffer }, cancellation);
            let storageRoot;
            if (isCustomEditorProviderWithEditingCapability(entry.provider) && this.f) {
                storageRoot = this.f.workspaceValue(entry.extension) ?? this.f.globalValue(entry.extension);
            }
            this.c.add(viewType, document, storageRoot);
            return { editable: isCustomEditorProviderWithEditingCapability(entry.provider) };
        }
        async $disposeCustomDocument(resource, viewType) {
            const entry = this.b.get(viewType);
            if (!entry) {
                throw new Error(`No provider found for '${viewType}'`);
            }
            if (entry.type !== 1 /* CustomEditorType.Custom */) {
                throw new Error(`Invalid provider type for '${viewType}'`);
            }
            const revivedResource = uri_1.URI.revive(resource);
            const { document } = this.i(viewType, revivedResource);
            this.c.delete(viewType, document);
            document.dispose();
        }
        async $resolveCustomEditor(resource, handle, viewType, initData, position, cancellation) {
            const entry = this.b.get(viewType);
            if (!entry) {
                throw new Error(`No provider found for '${viewType}'`);
            }
            const viewColumn = typeConverters.ViewColumn.to(position);
            const webview = this.g.createNewWebview(handle, initData.contentOptions, entry.extension);
            const panel = this.h.createNewWebviewPanel(handle, viewType, initData.title, viewColumn, initData.options, webview, initData.active);
            const revivedResource = uri_1.URI.revive(resource);
            switch (entry.type) {
                case 1 /* CustomEditorType.Custom */: {
                    const { document } = this.i(viewType, revivedResource);
                    return entry.provider.resolveCustomEditor(document, panel, cancellation);
                }
                case 0 /* CustomEditorType.Text */: {
                    const document = this.d.getDocument(revivedResource);
                    return entry.provider.resolveCustomTextEditor(document, panel, cancellation);
                }
                default: {
                    throw new Error('Unknown webview provider type');
                }
            }
        }
        $disposeEdits(resourceComponents, viewType, editIds) {
            const document = this.i(viewType, resourceComponents);
            document.disposeEdits(editIds);
        }
        async $onMoveCustomEditor(handle, newResourceComponents, viewType) {
            const entry = this.b.get(viewType);
            if (!entry) {
                throw new Error(`No provider found for '${viewType}'`);
            }
            if (!entry.provider.moveCustomTextEditor) {
                throw new Error(`Provider does not implement move '${viewType}'`);
            }
            const webview = this.h.getWebviewPanel(handle);
            if (!webview) {
                throw new Error(`No webview found`);
            }
            const resource = uri_1.URI.revive(newResourceComponents);
            const document = this.d.getDocument(resource);
            await entry.provider.moveCustomTextEditor(document, webview, cancellation_1.CancellationToken.None);
        }
        async $undo(resourceComponents, viewType, editId, isDirty) {
            const entry = this.i(viewType, resourceComponents);
            return entry.undo(editId, isDirty);
        }
        async $redo(resourceComponents, viewType, editId, isDirty) {
            const entry = this.i(viewType, resourceComponents);
            return entry.redo(editId, isDirty);
        }
        async $revert(resourceComponents, viewType, cancellation) {
            const entry = this.i(viewType, resourceComponents);
            const provider = this.j(viewType);
            await provider.revertCustomDocument(entry.document, cancellation);
            entry.disposeBackup();
        }
        async $onSave(resourceComponents, viewType, cancellation) {
            const entry = this.i(viewType, resourceComponents);
            const provider = this.j(viewType);
            await provider.saveCustomDocument(entry.document, cancellation);
            entry.disposeBackup();
        }
        async $onSaveAs(resourceComponents, viewType, targetResource, cancellation) {
            const entry = this.i(viewType, resourceComponents);
            const provider = this.j(viewType);
            return provider.saveCustomDocumentAs(entry.document, uri_1.URI.revive(targetResource), cancellation);
        }
        async $backup(resourceComponents, viewType, cancellation) {
            const entry = this.i(viewType, resourceComponents);
            const provider = this.j(viewType);
            const backup = await provider.backupCustomDocument(entry.document, {
                destination: entry.getNewBackupUri(),
            }, cancellation);
            entry.updateBackup(backup);
            return backup.id;
        }
        i(viewType, resource) {
            const entry = this.c.get(viewType, uri_1.URI.revive(resource));
            if (!entry) {
                throw new Error('No custom document found');
            }
            return entry;
        }
        j(viewType) {
            const entry = this.b.get(viewType);
            const provider = entry?.provider;
            if (!provider || !isCustomEditorProviderWithEditingCapability(provider)) {
                throw new Error('Custom document is not editable');
            }
            return provider;
        }
    }
    exports.$Mcc = $Mcc;
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
        return (0, hash_1.$pi)(str) + '';
    }
});
//# sourceMappingURL=extHostCustomEditors.js.map