/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/api/common/extHostNotebook", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/platform/files/common/files", "vs/workbench/api/common/cache", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostCommands", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/services/extensions/common/proxyIdentifier", "./extHostNotebookDocument", "./extHostNotebookEditor", "vs/base/common/errors", "vs/base/common/objects", "vs/base/common/network"], function (require, exports, nls_1, buffer_1, event_1, lifecycle_1, map_1, strings_1, types_1, uri_1, files, cache_1, extHost_protocol_1, extHostCommands_1, typeConverters, extHostTypes, proxyIdentifier_1, extHostNotebookDocument_1, extHostNotebookEditor_1, errors_1, objects_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Fcc = void 0;
    class $Fcc {
        static { this.a = 0; }
        get activeNotebookEditor() {
            return this.k?.apiEditor;
        }
        get visibleNotebookEditors() {
            return this.l.map(editor => editor.apiEditor);
        }
        constructor(mainContext, commands, q, r, s) {
            this.q = q;
            this.r = r;
            this.s = s;
            this.f = new Map();
            this.g = new map_1.$zi();
            this.h = new Map();
            this.j = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.onDidChangeActiveNotebookEditor = this.j.event;
            this.l = [];
            this.m = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.onDidOpenNotebookDocument = this.m.event;
            this.n = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.onDidCloseNotebookDocument = this.n.event;
            this.o = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.onDidChangeVisibleNotebookEditors = this.o.event;
            this.p = new cache_1.$6ac('NotebookCellStatusBarCache');
            // --- serialize/deserialize
            this.u = 0;
            this.w = new Map();
            this.b = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadNotebook);
            this.c = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadNotebookDocuments);
            this.d = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadNotebookEditors);
            this.i = commands.converter;
            commands.registerArgumentProcessor({
                // Serialized INotebookCellActionContext
                processArgument: (arg) => {
                    if (arg && arg.$mid === 13 /* MarshalledId.NotebookCellActionContext */) {
                        const notebookUri = arg.notebookEditor?.notebookUri;
                        const cellHandle = arg.cell.handle;
                        const data = this.g.get(notebookUri);
                        const cell = data?.getCell(cellHandle);
                        if (cell) {
                            return cell.apiCell;
                        }
                    }
                    if (arg && arg.$mid === 14 /* MarshalledId.NotebookActionContext */) {
                        const notebookUri = arg.uri;
                        const data = this.g.get(notebookUri);
                        if (data) {
                            return data.apiNotebook;
                        }
                    }
                    return arg;
                }
            });
            $Fcc.A(commands);
        }
        getEditorById(editorId) {
            const editor = this.h.get(editorId);
            if (!editor) {
                throw new Error(`unknown text editor: ${editorId}. known editors: ${[...this.h.keys()]} `);
            }
            return editor;
        }
        getIdByEditor(editor) {
            for (const [id, candidate] of this.h) {
                if (candidate.apiEditor === editor) {
                    return id;
                }
            }
            return undefined;
        }
        get notebookDocuments() {
            return [...this.g.values()];
        }
        getNotebookDocument(uri, relaxed) {
            const result = this.g.get(uri);
            if (!result && !relaxed) {
                throw new Error(`NO notebook document for '${uri}'`);
            }
            return result;
        }
        static t(extension, registration) {
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
            const handle = $Fcc.a++;
            const eventHandle = typeof provider.onDidChangeCellStatusBarItems === 'function' ? $Fcc.a++ : undefined;
            this.f.set(handle, provider);
            this.b.$registerNotebookCellStatusBarItemProvider(handle, eventHandle, notebookType);
            let subscription;
            if (eventHandle !== undefined) {
                subscription = provider.onDidChangeCellStatusBarItems(_ => this.b.$emitCellStatusBarEvent(eventHandle));
            }
            return new extHostTypes.$3J(() => {
                this.f.delete(handle);
                this.b.$unregisterNotebookCellStatusBarItemProvider(handle, eventHandle);
                subscription?.dispose();
            });
        }
        async createNotebookDocument(options) {
            const canonicalUri = await this.c.$tryCreateNotebook({
                viewType: options.viewType,
                content: options.content && typeConverters.NotebookData.from(options.content)
            });
            return uri_1.URI.revive(canonicalUri);
        }
        async openNotebookDocument(uri) {
            const cached = this.g.get(uri);
            if (cached) {
                return cached.apiNotebook;
            }
            const canonicalUri = await this.c.$tryOpenNotebook(uri);
            const document = this.g.get(uri_1.URI.revive(canonicalUri));
            return (0, types_1.$uf)(document?.apiNotebook);
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
            const editorId = await this.d.$tryShowNotebookDocument(notebookOrUri.uri, notebookOrUri.notebookType, resolvedOptions);
            const editor = editorId && this.h.get(editorId)?.apiEditor;
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
            const provider = this.f.get(handle);
            const revivedUri = uri_1.URI.revive(uri);
            const document = this.g.get(revivedUri);
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
            const disposables = new lifecycle_1.$jc();
            const cacheId = this.p.add([disposables]);
            const resultArr = Array.isArray(result) ? result : [result];
            const items = resultArr.map(item => typeConverters.NotebookStatusBarItem.from(item, this.i, disposables));
            return {
                cacheId,
                items
            };
        }
        $releaseNotebookCellStatusBarItems(cacheId) {
            this.p.delete(cacheId);
        }
        registerNotebookSerializer(extension, viewType, serializer, options, registration) {
            if ((0, strings_1.$me)(viewType)) {
                throw new Error(`viewType cannot be empty or just whitespace`);
            }
            const handle = this.u++;
            this.w.set(handle, { viewType, serializer, options });
            this.b.$registerNotebookSerializer(handle, { id: extension.identifier, location: extension.extensionLocation }, viewType, typeConverters.NotebookDocumentContentOptions.from(options), $Fcc.t(extension, registration));
            return (0, lifecycle_1.$ic)(() => {
                this.b.$unregisterNotebookSerializer(handle);
            });
        }
        async $dataToNotebook(handle, bytes, token) {
            const serializer = this.w.get(handle);
            if (!serializer) {
                throw new Error('NO serializer found');
            }
            const data = await serializer.serializer.deserializeNotebook(bytes.buffer, token);
            return new proxyIdentifier_1.$dA(typeConverters.NotebookData.from(data));
        }
        async $notebookToData(handle, data, token) {
            const serializer = this.w.get(handle);
            if (!serializer) {
                throw new Error('NO serializer found');
            }
            const bytes = await serializer.serializer.serializeNotebook(typeConverters.NotebookData.to(data.value), token);
            return buffer_1.$Fd.wrap(bytes);
        }
        async $saveNotebook(handle, uriComponents, versionId, options, token) {
            const uri = uri_1.URI.revive(uriComponents);
            const serializer = this.w.get(handle);
            if (!serializer) {
                throw new Error('NO serializer found');
            }
            const document = this.g.get(uri);
            if (!document) {
                throw new Error('Document NOT found');
            }
            if (document.versionId !== versionId) {
                throw new Error('Document version mismatch');
            }
            if (!this.s.value.isWritableFileSystem(uri.scheme)) {
                throw new files.$nk((0, nls_1.localize)(0, null, this.y(uri)), 6 /* files.FileOperationResult.FILE_PERMISSION_DENIED */);
            }
            // validate write
            await this.x(uri, options);
            const data = {
                metadata: (0, objects_1.$4m)(document.apiNotebook.metadata, key => !(serializer.options?.transientDocumentMetadata ?? {})[key]),
                cells: [],
            };
            for (const cell of document.apiNotebook.getCells()) {
                const cellData = new extHostTypes.$oL(cell.kind, cell.document.getText(), cell.document.languageId, cell.mime, !(serializer.options?.transientOutputs) ? [...cell.outputs] : [], cell.metadata, cell.executionSummary);
                cellData.metadata = (0, objects_1.$4m)(cell.metadata, key => !(serializer.options?.transientCellMetadata ?? {})[key]);
                data.cells.push(cellData);
            }
            const bytes = await serializer.serializer.serializeNotebook(data, token);
            await this.s.value.writeFile(uri, bytes);
            const providerExtUri = this.s.getFileSystemProviderExtUri(uri.scheme);
            const stat = await this.s.value.stat(uri);
            const fileStats = {
                name: providerExtUri.basename(uri),
                isFile: (stat.type & files.FileType.File) !== 0,
                isDirectory: (stat.type & files.FileType.Directory) !== 0,
                isSymbolicLink: (stat.type & files.FileType.SymbolicLink) !== 0,
                mtime: stat.mtime,
                ctime: stat.ctime,
                size: stat.size,
                readonly: Boolean((stat.permissions ?? 0) & files.FilePermission.Readonly) || !this.s.value.isWritableFileSystem(uri.scheme),
                locked: Boolean((stat.permissions ?? 0) & files.FilePermission.Locked),
                etag: files.$yk({ mtime: stat.mtime, size: stat.size }),
                children: undefined
            };
            return fileStats;
        }
        async x(uri, options) {
            const stat = await this.s.value.stat(uri);
            // Dirty write prevention
            if (typeof options?.mtime === 'number' && typeof options.etag === 'string' && options.etag !== files.$xk &&
                typeof stat.mtime === 'number' && typeof stat.size === 'number' &&
                options.mtime < stat.mtime && options.etag !== files.$yk({ mtime: options.mtime /* not using stat.mtime for a reason, see above */, size: stat.size })) {
                throw new files.$nk((0, nls_1.localize)(1, null), 3 /* files.FileOperationResult.FILE_MODIFIED_SINCE */, options);
            }
            return;
        }
        y(uri) {
            return uri.scheme === network_1.Schemas.file ? uri.fsPath : uri.toString();
        }
        // --- open, save, saveAs, backup
        z(document, editorId, data) {
            if (this.h.has(editorId)) {
                throw new Error(`editor with id ALREADY EXSIST: ${editorId}`);
            }
            const editor = new extHostNotebookEditor_1.$Ecc(editorId, this.d, document, data.visibleRanges.map(typeConverters.NotebookRange.to), data.selections.map(typeConverters.NotebookRange.to), typeof data.viewColumn === 'number' ? typeConverters.ViewColumn.to(data.viewColumn) : undefined);
            this.h.set(editorId, editor);
        }
        $acceptDocumentAndEditorsDelta(delta) {
            if (delta.value.removedDocuments) {
                for (const uri of delta.value.removedDocuments) {
                    const revivedUri = uri_1.URI.revive(uri);
                    const document = this.g.get(revivedUri);
                    if (document) {
                        document.dispose();
                        this.g.delete(revivedUri);
                        this.q.$acceptDocumentsAndEditorsDelta({ removedDocuments: document.apiNotebook.getCells().map(cell => cell.document.uri) });
                        this.n.fire(document.apiNotebook);
                    }
                    for (const editor of this.h.values()) {
                        if (editor.notebookData.uri.toString() === revivedUri.toString()) {
                            this.h.delete(editor.id);
                        }
                    }
                }
            }
            if (delta.value.addedDocuments) {
                const addedCellDocuments = [];
                for (const modelData of delta.value.addedDocuments) {
                    const uri = uri_1.URI.revive(modelData.uri);
                    if (this.g.has(uri)) {
                        throw new Error(`adding EXISTING notebook ${uri} `);
                    }
                    const document = new extHostNotebookDocument_1.$Dcc(this.c, this.q, this.r, uri, modelData);
                    // add cell document as vscode.TextDocument
                    addedCellDocuments.push(...modelData.cells.map(cell => extHostNotebookDocument_1.$Ccc.asModelAddData(document.apiNotebook, cell)));
                    this.g.get(uri)?.dispose();
                    this.g.set(uri, document);
                    this.q.$acceptDocumentsAndEditorsDelta({ addedDocuments: addedCellDocuments });
                    this.m.fire(document.apiNotebook);
                }
            }
            if (delta.value.addedEditors) {
                for (const editorModelData of delta.value.addedEditors) {
                    if (this.h.has(editorModelData.id)) {
                        return;
                    }
                    const revivedUri = uri_1.URI.revive(editorModelData.documentUri);
                    const document = this.g.get(revivedUri);
                    if (document) {
                        this.z(document, editorModelData.id, editorModelData);
                    }
                }
            }
            const removedEditors = [];
            if (delta.value.removedEditors) {
                for (const editorid of delta.value.removedEditors) {
                    const editor = this.h.get(editorid);
                    if (editor) {
                        this.h.delete(editorid);
                        if (this.k?.id === editor.id) {
                            this.k = undefined;
                        }
                        removedEditors.push(editor);
                    }
                }
            }
            if (delta.value.visibleEditors) {
                this.l = delta.value.visibleEditors.map(id => this.h.get(id)).filter(editor => !!editor);
                const visibleEditorsSet = new Set();
                this.l.forEach(editor => visibleEditorsSet.add(editor.id));
                for (const editor of this.h.values()) {
                    const newValue = visibleEditorsSet.has(editor.id);
                    editor._acceptVisibility(newValue);
                }
                this.l = [...this.h.values()].map(e => e).filter(e => e.visible);
                this.o.fire(this.visibleNotebookEditors);
            }
            if (delta.value.newActiveEditor === null) {
                // clear active notebook as current active editor is non-notebook editor
                this.k = undefined;
            }
            else if (delta.value.newActiveEditor) {
                const activeEditor = this.h.get(delta.value.newActiveEditor);
                if (!activeEditor) {
                    console.error(`FAILED to find active notebook editor ${delta.value.newActiveEditor}`);
                }
                this.k = this.h.get(delta.value.newActiveEditor);
            }
            if (delta.value.newActiveEditor !== undefined) {
                this.j.fire(this.k?.apiEditor);
            }
        }
        static A(extHostCommands) {
            const notebookTypeArg = extHostCommands_1.$nM.String.with('notebookType', 'A notebook type');
            const commandDataToNotebook = new extHostCommands_1.$pM('vscode.executeDataToNotebook', '_executeDataToNotebook', 'Invoke notebook serializer', [notebookTypeArg, new extHostCommands_1.$nM('data', 'Bytes to convert to data', v => v instanceof Uint8Array, v => buffer_1.$Fd.wrap(v))], new extHostCommands_1.$oM('Notebook Data', data => typeConverters.NotebookData.to(data.value)));
            const commandNotebookToData = new extHostCommands_1.$pM('vscode.executeNotebookToData', '_executeNotebookToData', 'Invoke notebook serializer', [notebookTypeArg, new extHostCommands_1.$nM('NotebookData', 'Notebook data to convert to bytes', v => true, v => new proxyIdentifier_1.$dA(typeConverters.NotebookData.from(v)))], new extHostCommands_1.$oM('Bytes', dto => dto.buffer));
            extHostCommands.registerApiCommand(commandDataToNotebook);
            extHostCommands.registerApiCommand(commandNotebookToData);
        }
    }
    exports.$Fcc = $Fcc;
});
//# sourceMappingURL=extHostNotebook.js.map