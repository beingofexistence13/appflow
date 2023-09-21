/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/platform/files/common/files", "vs/workbench/api/common/cache", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostCommands", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/services/extensions/common/proxyIdentifier", "./extHostNotebookDocument", "./extHostNotebookEditor", "vs/base/common/errors", "vs/base/common/objects", "vs/base/common/network"], function (require, exports, nls_1, buffer_1, event_1, lifecycle_1, map_1, strings_1, types_1, uri_1, files, cache_1, extHost_protocol_1, extHostCommands_1, typeConverters, extHostTypes, proxyIdentifier_1, extHostNotebookDocument_1, extHostNotebookEditor_1, errors_1, objects_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostNotebookController = void 0;
    class ExtHostNotebookController {
        static { this._notebookStatusBarItemProviderHandlePool = 0; }
        get activeNotebookEditor() {
            return this._activeNotebookEditor?.apiEditor;
        }
        get visibleNotebookEditors() {
            return this._visibleNotebookEditors.map(editor => editor.apiEditor);
        }
        constructor(mainContext, commands, _textDocumentsAndEditors, _textDocuments, _extHostFileSystem) {
            this._textDocumentsAndEditors = _textDocumentsAndEditors;
            this._textDocuments = _textDocuments;
            this._extHostFileSystem = _extHostFileSystem;
            this._notebookStatusBarItemProviders = new Map();
            this._documents = new map_1.ResourceMap();
            this._editors = new Map();
            this._onDidChangeActiveNotebookEditor = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this.onDidChangeActiveNotebookEditor = this._onDidChangeActiveNotebookEditor.event;
            this._visibleNotebookEditors = [];
            this._onDidOpenNotebookDocument = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this.onDidOpenNotebookDocument = this._onDidOpenNotebookDocument.event;
            this._onDidCloseNotebookDocument = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this.onDidCloseNotebookDocument = this._onDidCloseNotebookDocument.event;
            this._onDidChangeVisibleNotebookEditors = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this.onDidChangeVisibleNotebookEditors = this._onDidChangeVisibleNotebookEditors.event;
            this._statusBarCache = new cache_1.Cache('NotebookCellStatusBarCache');
            // --- serialize/deserialize
            this._handlePool = 0;
            this._notebookSerializer = new Map();
            this._notebookProxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadNotebook);
            this._notebookDocumentsProxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadNotebookDocuments);
            this._notebookEditorsProxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadNotebookEditors);
            this._commandsConverter = commands.converter;
            commands.registerArgumentProcessor({
                // Serialized INotebookCellActionContext
                processArgument: (arg) => {
                    if (arg && arg.$mid === 13 /* MarshalledId.NotebookCellActionContext */) {
                        const notebookUri = arg.notebookEditor?.notebookUri;
                        const cellHandle = arg.cell.handle;
                        const data = this._documents.get(notebookUri);
                        const cell = data?.getCell(cellHandle);
                        if (cell) {
                            return cell.apiCell;
                        }
                    }
                    if (arg && arg.$mid === 14 /* MarshalledId.NotebookActionContext */) {
                        const notebookUri = arg.uri;
                        const data = this._documents.get(notebookUri);
                        if (data) {
                            return data.apiNotebook;
                        }
                    }
                    return arg;
                }
            });
            ExtHostNotebookController._registerApiCommands(commands);
        }
        getEditorById(editorId) {
            const editor = this._editors.get(editorId);
            if (!editor) {
                throw new Error(`unknown text editor: ${editorId}. known editors: ${[...this._editors.keys()]} `);
            }
            return editor;
        }
        getIdByEditor(editor) {
            for (const [id, candidate] of this._editors) {
                if (candidate.apiEditor === editor) {
                    return id;
                }
            }
            return undefined;
        }
        get notebookDocuments() {
            return [...this._documents.values()];
        }
        getNotebookDocument(uri, relaxed) {
            const result = this._documents.get(uri);
            if (!result && !relaxed) {
                throw new Error(`NO notebook document for '${uri}'`);
            }
            return result;
        }
        static _convertNotebookRegistrationData(extension, registration) {
            if (!registration) {
                return;
            }
            const viewOptionsFilenamePattern = registration.filenamePattern
                .map(pattern => typeConverters.NotebookExclusiveDocumentPattern.from(pattern))
                .filter(pattern => pattern !== undefined);
            if (registration.filenamePattern && !viewOptionsFilenamePattern) {
                console.warn(`Notebook content provider view options file name pattern is invalid ${registration.filenamePattern}`);
                return undefined;
            }
            return {
                extension: extension.identifier,
                providerDisplayName: extension.displayName || extension.name,
                displayName: registration.displayName,
                filenamePattern: viewOptionsFilenamePattern,
                exclusive: registration.exclusive || false
            };
        }
        registerNotebookCellStatusBarItemProvider(extension, notebookType, provider) {
            const handle = ExtHostNotebookController._notebookStatusBarItemProviderHandlePool++;
            const eventHandle = typeof provider.onDidChangeCellStatusBarItems === 'function' ? ExtHostNotebookController._notebookStatusBarItemProviderHandlePool++ : undefined;
            this._notebookStatusBarItemProviders.set(handle, provider);
            this._notebookProxy.$registerNotebookCellStatusBarItemProvider(handle, eventHandle, notebookType);
            let subscription;
            if (eventHandle !== undefined) {
                subscription = provider.onDidChangeCellStatusBarItems(_ => this._notebookProxy.$emitCellStatusBarEvent(eventHandle));
            }
            return new extHostTypes.Disposable(() => {
                this._notebookStatusBarItemProviders.delete(handle);
                this._notebookProxy.$unregisterNotebookCellStatusBarItemProvider(handle, eventHandle);
                subscription?.dispose();
            });
        }
        async createNotebookDocument(options) {
            const canonicalUri = await this._notebookDocumentsProxy.$tryCreateNotebook({
                viewType: options.viewType,
                content: options.content && typeConverters.NotebookData.from(options.content)
            });
            return uri_1.URI.revive(canonicalUri);
        }
        async openNotebookDocument(uri) {
            const cached = this._documents.get(uri);
            if (cached) {
                return cached.apiNotebook;
            }
            const canonicalUri = await this._notebookDocumentsProxy.$tryOpenNotebook(uri);
            const document = this._documents.get(uri_1.URI.revive(canonicalUri));
            return (0, types_1.assertIsDefined)(document?.apiNotebook);
        }
        async showNotebookDocument(notebookOrUri, options) {
            if (uri_1.URI.isUri(notebookOrUri)) {
                notebookOrUri = await this.openNotebookDocument(notebookOrUri);
            }
            let resolvedOptions;
            if (typeof options === 'object') {
                resolvedOptions = {
                    position: typeConverters.ViewColumn.from(options.viewColumn),
                    preserveFocus: options.preserveFocus,
                    selections: options.selections && options.selections.map(typeConverters.NotebookRange.from),
                    pinned: typeof options.preview === 'boolean' ? !options.preview : undefined
                };
            }
            else {
                resolvedOptions = {
                    preserveFocus: false
                };
            }
            const editorId = await this._notebookEditorsProxy.$tryShowNotebookDocument(notebookOrUri.uri, notebookOrUri.notebookType, resolvedOptions);
            const editor = editorId && this._editors.get(editorId)?.apiEditor;
            if (editor) {
                return editor;
            }
            if (editorId) {
                throw new Error(`Could NOT open editor for "${notebookOrUri.uri.toString()}" because another editor opened in the meantime.`);
            }
            else {
                throw new Error(`Could NOT open editor for "${notebookOrUri.uri.toString()}".`);
            }
        }
        async $provideNotebookCellStatusBarItems(handle, uri, index, token) {
            const provider = this._notebookStatusBarItemProviders.get(handle);
            const revivedUri = uri_1.URI.revive(uri);
            const document = this._documents.get(revivedUri);
            if (!document || !provider) {
                return;
            }
            const cell = document.getCellFromIndex(index);
            if (!cell) {
                return;
            }
            const result = await provider.provideCellStatusBarItems(cell.apiCell, token);
            if (!result) {
                return undefined;
            }
            const disposables = new lifecycle_1.DisposableStore();
            const cacheId = this._statusBarCache.add([disposables]);
            const resultArr = Array.isArray(result) ? result : [result];
            const items = resultArr.map(item => typeConverters.NotebookStatusBarItem.from(item, this._commandsConverter, disposables));
            return {
                cacheId,
                items
            };
        }
        $releaseNotebookCellStatusBarItems(cacheId) {
            this._statusBarCache.delete(cacheId);
        }
        registerNotebookSerializer(extension, viewType, serializer, options, registration) {
            if ((0, strings_1.isFalsyOrWhitespace)(viewType)) {
                throw new Error(`viewType cannot be empty or just whitespace`);
            }
            const handle = this._handlePool++;
            this._notebookSerializer.set(handle, { viewType, serializer, options });
            this._notebookProxy.$registerNotebookSerializer(handle, { id: extension.identifier, location: extension.extensionLocation }, viewType, typeConverters.NotebookDocumentContentOptions.from(options), ExtHostNotebookController._convertNotebookRegistrationData(extension, registration));
            return (0, lifecycle_1.toDisposable)(() => {
                this._notebookProxy.$unregisterNotebookSerializer(handle);
            });
        }
        async $dataToNotebook(handle, bytes, token) {
            const serializer = this._notebookSerializer.get(handle);
            if (!serializer) {
                throw new Error('NO serializer found');
            }
            const data = await serializer.serializer.deserializeNotebook(bytes.buffer, token);
            return new proxyIdentifier_1.SerializableObjectWithBuffers(typeConverters.NotebookData.from(data));
        }
        async $notebookToData(handle, data, token) {
            const serializer = this._notebookSerializer.get(handle);
            if (!serializer) {
                throw new Error('NO serializer found');
            }
            const bytes = await serializer.serializer.serializeNotebook(typeConverters.NotebookData.to(data.value), token);
            return buffer_1.VSBuffer.wrap(bytes);
        }
        async $saveNotebook(handle, uriComponents, versionId, options, token) {
            const uri = uri_1.URI.revive(uriComponents);
            const serializer = this._notebookSerializer.get(handle);
            if (!serializer) {
                throw new Error('NO serializer found');
            }
            const document = this._documents.get(uri);
            if (!document) {
                throw new Error('Document NOT found');
            }
            if (document.versionId !== versionId) {
                throw new Error('Document version mismatch');
            }
            if (!this._extHostFileSystem.value.isWritableFileSystem(uri.scheme)) {
                throw new files.FileOperationError((0, nls_1.localize)('err.readonly', "Unable to modify read-only file '{0}'", this._resourceForError(uri)), 6 /* files.FileOperationResult.FILE_PERMISSION_DENIED */);
            }
            // validate write
            await this._validateWriteFile(uri, options);
            const data = {
                metadata: (0, objects_1.filter)(document.apiNotebook.metadata, key => !(serializer.options?.transientDocumentMetadata ?? {})[key]),
                cells: [],
            };
            for (const cell of document.apiNotebook.getCells()) {
                const cellData = new extHostTypes.NotebookCellData(cell.kind, cell.document.getText(), cell.document.languageId, cell.mime, !(serializer.options?.transientOutputs) ? [...cell.outputs] : [], cell.metadata, cell.executionSummary);
                cellData.metadata = (0, objects_1.filter)(cell.metadata, key => !(serializer.options?.transientCellMetadata ?? {})[key]);
                data.cells.push(cellData);
            }
            const bytes = await serializer.serializer.serializeNotebook(data, token);
            await this._extHostFileSystem.value.writeFile(uri, bytes);
            const providerExtUri = this._extHostFileSystem.getFileSystemProviderExtUri(uri.scheme);
            const stat = await this._extHostFileSystem.value.stat(uri);
            const fileStats = {
                name: providerExtUri.basename(uri),
                isFile: (stat.type & files.FileType.File) !== 0,
                isDirectory: (stat.type & files.FileType.Directory) !== 0,
                isSymbolicLink: (stat.type & files.FileType.SymbolicLink) !== 0,
                mtime: stat.mtime,
                ctime: stat.ctime,
                size: stat.size,
                readonly: Boolean((stat.permissions ?? 0) & files.FilePermission.Readonly) || !this._extHostFileSystem.value.isWritableFileSystem(uri.scheme),
                locked: Boolean((stat.permissions ?? 0) & files.FilePermission.Locked),
                etag: files.etag({ mtime: stat.mtime, size: stat.size }),
                children: undefined
            };
            return fileStats;
        }
        async _validateWriteFile(uri, options) {
            const stat = await this._extHostFileSystem.value.stat(uri);
            // Dirty write prevention
            if (typeof options?.mtime === 'number' && typeof options.etag === 'string' && options.etag !== files.ETAG_DISABLED &&
                typeof stat.mtime === 'number' && typeof stat.size === 'number' &&
                options.mtime < stat.mtime && options.etag !== files.etag({ mtime: options.mtime /* not using stat.mtime for a reason, see above */, size: stat.size })) {
                throw new files.FileOperationError((0, nls_1.localize)('fileModifiedError', "File Modified Since"), 3 /* files.FileOperationResult.FILE_MODIFIED_SINCE */, options);
            }
            return;
        }
        _resourceForError(uri) {
            return uri.scheme === network_1.Schemas.file ? uri.fsPath : uri.toString();
        }
        // --- open, save, saveAs, backup
        _createExtHostEditor(document, editorId, data) {
            if (this._editors.has(editorId)) {
                throw new Error(`editor with id ALREADY EXSIST: ${editorId}`);
            }
            const editor = new extHostNotebookEditor_1.ExtHostNotebookEditor(editorId, this._notebookEditorsProxy, document, data.visibleRanges.map(typeConverters.NotebookRange.to), data.selections.map(typeConverters.NotebookRange.to), typeof data.viewColumn === 'number' ? typeConverters.ViewColumn.to(data.viewColumn) : undefined);
            this._editors.set(editorId, editor);
        }
        $acceptDocumentAndEditorsDelta(delta) {
            if (delta.value.removedDocuments) {
                for (const uri of delta.value.removedDocuments) {
                    const revivedUri = uri_1.URI.revive(uri);
                    const document = this._documents.get(revivedUri);
                    if (document) {
                        document.dispose();
                        this._documents.delete(revivedUri);
                        this._textDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({ removedDocuments: document.apiNotebook.getCells().map(cell => cell.document.uri) });
                        this._onDidCloseNotebookDocument.fire(document.apiNotebook);
                    }
                    for (const editor of this._editors.values()) {
                        if (editor.notebookData.uri.toString() === revivedUri.toString()) {
                            this._editors.delete(editor.id);
                        }
                    }
                }
            }
            if (delta.value.addedDocuments) {
                const addedCellDocuments = [];
                for (const modelData of delta.value.addedDocuments) {
                    const uri = uri_1.URI.revive(modelData.uri);
                    if (this._documents.has(uri)) {
                        throw new Error(`adding EXISTING notebook ${uri} `);
                    }
                    const document = new extHostNotebookDocument_1.ExtHostNotebookDocument(this._notebookDocumentsProxy, this._textDocumentsAndEditors, this._textDocuments, uri, modelData);
                    // add cell document as vscode.TextDocument
                    addedCellDocuments.push(...modelData.cells.map(cell => extHostNotebookDocument_1.ExtHostCell.asModelAddData(document.apiNotebook, cell)));
                    this._documents.get(uri)?.dispose();
                    this._documents.set(uri, document);
                    this._textDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({ addedDocuments: addedCellDocuments });
                    this._onDidOpenNotebookDocument.fire(document.apiNotebook);
                }
            }
            if (delta.value.addedEditors) {
                for (const editorModelData of delta.value.addedEditors) {
                    if (this._editors.has(editorModelData.id)) {
                        return;
                    }
                    const revivedUri = uri_1.URI.revive(editorModelData.documentUri);
                    const document = this._documents.get(revivedUri);
                    if (document) {
                        this._createExtHostEditor(document, editorModelData.id, editorModelData);
                    }
                }
            }
            const removedEditors = [];
            if (delta.value.removedEditors) {
                for (const editorid of delta.value.removedEditors) {
                    const editor = this._editors.get(editorid);
                    if (editor) {
                        this._editors.delete(editorid);
                        if (this._activeNotebookEditor?.id === editor.id) {
                            this._activeNotebookEditor = undefined;
                        }
                        removedEditors.push(editor);
                    }
                }
            }
            if (delta.value.visibleEditors) {
                this._visibleNotebookEditors = delta.value.visibleEditors.map(id => this._editors.get(id)).filter(editor => !!editor);
                const visibleEditorsSet = new Set();
                this._visibleNotebookEditors.forEach(editor => visibleEditorsSet.add(editor.id));
                for (const editor of this._editors.values()) {
                    const newValue = visibleEditorsSet.has(editor.id);
                    editor._acceptVisibility(newValue);
                }
                this._visibleNotebookEditors = [...this._editors.values()].map(e => e).filter(e => e.visible);
                this._onDidChangeVisibleNotebookEditors.fire(this.visibleNotebookEditors);
            }
            if (delta.value.newActiveEditor === null) {
                // clear active notebook as current active editor is non-notebook editor
                this._activeNotebookEditor = undefined;
            }
            else if (delta.value.newActiveEditor) {
                const activeEditor = this._editors.get(delta.value.newActiveEditor);
                if (!activeEditor) {
                    console.error(`FAILED to find active notebook editor ${delta.value.newActiveEditor}`);
                }
                this._activeNotebookEditor = this._editors.get(delta.value.newActiveEditor);
            }
            if (delta.value.newActiveEditor !== undefined) {
                this._onDidChangeActiveNotebookEditor.fire(this._activeNotebookEditor?.apiEditor);
            }
        }
        static _registerApiCommands(extHostCommands) {
            const notebookTypeArg = extHostCommands_1.ApiCommandArgument.String.with('notebookType', 'A notebook type');
            const commandDataToNotebook = new extHostCommands_1.ApiCommand('vscode.executeDataToNotebook', '_executeDataToNotebook', 'Invoke notebook serializer', [notebookTypeArg, new extHostCommands_1.ApiCommandArgument('data', 'Bytes to convert to data', v => v instanceof Uint8Array, v => buffer_1.VSBuffer.wrap(v))], new extHostCommands_1.ApiCommandResult('Notebook Data', data => typeConverters.NotebookData.to(data.value)));
            const commandNotebookToData = new extHostCommands_1.ApiCommand('vscode.executeNotebookToData', '_executeNotebookToData', 'Invoke notebook serializer', [notebookTypeArg, new extHostCommands_1.ApiCommandArgument('NotebookData', 'Notebook data to convert to bytes', v => true, v => new proxyIdentifier_1.SerializableObjectWithBuffers(typeConverters.NotebookData.from(v)))], new extHostCommands_1.ApiCommandResult('Bytes', dto => dto.buffer));
            extHostCommands.registerApiCommand(commandDataToNotebook);
            extHostCommands.registerApiCommand(commandNotebookToData);
        }
    }
    exports.ExtHostNotebookController = ExtHostNotebookController;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE5vdGVib29rLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdE5vdGVib29rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtDaEcsTUFBYSx5QkFBeUI7aUJBQ3RCLDZDQUF3QyxHQUFXLENBQUMsQUFBWixDQUFhO1FBZXBFLElBQUksb0JBQW9CO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQztRQUM5QyxDQUFDO1FBRUQsSUFBSSxzQkFBc0I7WUFDekIsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFZRCxZQUNDLFdBQXlCLEVBQ3pCLFFBQXlCLEVBQ2pCLHdCQUFvRCxFQUNwRCxjQUFnQyxFQUNoQyxrQkFBOEM7WUFGOUMsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUE0QjtZQUNwRCxtQkFBYyxHQUFkLGNBQWMsQ0FBa0I7WUFDaEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE0QjtZQWhDdEMsb0NBQStCLEdBQUcsSUFBSSxHQUFHLEVBQW9ELENBQUM7WUFDOUYsZUFBVSxHQUFHLElBQUksaUJBQVcsRUFBMkIsQ0FBQztZQUN4RCxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7WUFHcEQscUNBQWdDLEdBQUcsSUFBSSxlQUFPLENBQW9DLEVBQUUsZUFBZSxFQUFFLGtDQUF5QixFQUFFLENBQUMsQ0FBQztZQUMxSSxvQ0FBK0IsR0FBRyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsS0FBSyxDQUFDO1lBTS9FLDRCQUF1QixHQUE0QixFQUFFLENBQUM7WUFLdEQsK0JBQTBCLEdBQUcsSUFBSSxlQUFPLENBQTBCLEVBQUUsZUFBZSxFQUFFLGtD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