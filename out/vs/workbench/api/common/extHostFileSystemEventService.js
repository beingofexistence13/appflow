/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/glob", "vs/base/common/uri", "./extHost.protocol", "./extHostTypeConverters", "./extHostTypes"], function (require, exports, event_1, glob_1, uri_1, extHost_protocol_1, typeConverter, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostFileSystemEventService = void 0;
    class FileSystemWatcher {
        get ignoreCreateEvents() {
            return Boolean(this._config & 0b001);
        }
        get ignoreChangeEvents() {
            return Boolean(this._config & 0b010);
        }
        get ignoreDeleteEvents() {
            return Boolean(this._config & 0b100);
        }
        constructor(mainContext, workspace, extension, dispatcher, globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
            this._onDidCreate = new event_1.Emitter();
            this._onDidChange = new event_1.Emitter();
            this._onDidDelete = new event_1.Emitter();
            const watcherDisposable = this.ensureWatching(mainContext, extension, globPattern);
            this._config = 0;
            if (ignoreCreateEvents) {
                this._config += 0b001;
            }
            if (ignoreChangeEvents) {
                this._config += 0b010;
            }
            if (ignoreDeleteEvents) {
                this._config += 0b100;
            }
            const parsedPattern = (0, glob_1.parse)(globPattern);
            // 1.64.x behaviour change: given the new support to watch any folder
            // we start to ignore events outside the workspace when only a string
            // pattern is provided to avoid sending events to extensions that are
            // unexpected.
            // https://github.com/microsoft/vscode/issues/3025
            const excludeOutOfWorkspaceEvents = typeof globPattern === 'string';
            const subscription = dispatcher(events => {
                if (!ignoreCreateEvents) {
                    for (const created of events.created) {
                        const uri = uri_1.URI.revive(created);
                        if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
                            this._onDidCreate.fire(uri);
                        }
                    }
                }
                if (!ignoreChangeEvents) {
                    for (const changed of events.changed) {
                        const uri = uri_1.URI.revive(changed);
                        if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
                            this._onDidChange.fire(uri);
                        }
                    }
                }
                if (!ignoreDeleteEvents) {
                    for (const deleted of events.deleted) {
                        const uri = uri_1.URI.revive(deleted);
                        if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
                            this._onDidDelete.fire(uri);
                        }
                    }
                }
            });
            this._disposable = extHostTypes_1.Disposable.from(watcherDisposable, this._onDidCreate, this._onDidChange, this._onDidDelete, subscription);
        }
        ensureWatching(mainContext, extension, globPattern) {
            const disposable = extHostTypes_1.Disposable.from();
            if (typeof globPattern === 'string') {
                return disposable; // a pattern alone does not carry sufficient information to start watching anything
            }
            const proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadFileSystem);
            let recursive = false;
            if (globPattern.pattern.includes(glob_1.GLOBSTAR) || globPattern.pattern.includes(glob_1.GLOB_SPLIT)) {
                recursive = true; // only watch recursively if pattern indicates the need for it
            }
            const session = Math.random();
            proxy.$watch(extension.identifier.value, session, globPattern.baseUri, { recursive, excludes: [] /* excludes are not yet surfaced in the API */ });
            return extHostTypes_1.Disposable.from({ dispose: () => proxy.$unwatch(session) });
        }
        dispose() {
            this._disposable.dispose();
        }
        get onDidCreate() {
            return this._onDidCreate.event;
        }
        get onDidChange() {
            return this._onDidChange.event;
        }
        get onDidDelete() {
            return this._onDidDelete.event;
        }
    }
    class ExtHostFileSystemEventService {
        constructor(_mainContext, _logService, _extHostDocumentsAndEditors) {
            this._mainContext = _mainContext;
            this._logService = _logService;
            this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
            this._onFileSystemEvent = new event_1.Emitter();
            this._onDidRenameFile = new event_1.Emitter();
            this._onDidCreateFile = new event_1.Emitter();
            this._onDidDeleteFile = new event_1.Emitter();
            this._onWillRenameFile = new event_1.AsyncEmitter();
            this._onWillCreateFile = new event_1.AsyncEmitter();
            this._onWillDeleteFile = new event_1.AsyncEmitter();
            this.onDidRenameFile = this._onDidRenameFile.event;
            this.onDidCreateFile = this._onDidCreateFile.event;
            this.onDidDeleteFile = this._onDidDeleteFile.event;
            //
        }
        //--- file events
        createFileSystemWatcher(workspace, extension, globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
            return new FileSystemWatcher(this._mainContext, workspace, extension, this._onFileSystemEvent.event, typeConverter.GlobPattern.from(globPattern), ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents);
        }
        $onFileEvent(events) {
            this._onFileSystemEvent.fire(events);
        }
        //--- file operations
        $onDidRunFileOperation(operation, files) {
            switch (operation) {
                case 2 /* FileOperation.MOVE */:
                    this._onDidRenameFile.fire(Object.freeze({ files: files.map(f => ({ oldUri: uri_1.URI.revive(f.source), newUri: uri_1.URI.revive(f.target) })) }));
                    break;
                case 1 /* FileOperation.DELETE */:
                    this._onDidDeleteFile.fire(Object.freeze({ files: files.map(f => uri_1.URI.revive(f.target)) }));
                    break;
                case 0 /* FileOperation.CREATE */:
                case 3 /* FileOperation.COPY */:
                    this._onDidCreateFile.fire(Object.freeze({ files: files.map(f => uri_1.URI.revive(f.target)) }));
                    break;
                default:
                //ignore, dont send
            }
        }
        getOnWillRenameFileEvent(extension) {
            return this._createWillExecuteEvent(extension, this._onWillRenameFile);
        }
        getOnWillCreateFileEvent(extension) {
            return this._createWillExecuteEvent(extension, this._onWillCreateFile);
        }
        getOnWillDeleteFileEvent(extension) {
            return this._createWillExecuteEvent(extension, this._onWillDeleteFile);
        }
        _createWillExecuteEvent(extension, emitter) {
            return (listener, thisArg, disposables) => {
                const wrappedListener = function wrapped(e) { listener.call(thisArg, e); };
                wrappedListener.extension = extension;
                return emitter.event(wrappedListener, undefined, disposables);
            };
        }
        async $onWillRunFileOperation(operation, files, timeout, token) {
            switch (operation) {
                case 2 /* FileOperation.MOVE */:
                    return await this._fireWillEvent(this._onWillRenameFile, { files: files.map(f => ({ oldUri: uri_1.URI.revive(f.source), newUri: uri_1.URI.revive(f.target) })) }, timeout, token);
                case 1 /* FileOperation.DELETE */:
                    return await this._fireWillEvent(this._onWillDeleteFile, { files: files.map(f => uri_1.URI.revive(f.target)) }, timeout, token);
                case 0 /* FileOperation.CREATE */:
                case 3 /* FileOperation.COPY */:
                    return await this._fireWillEvent(this._onWillCreateFile, { files: files.map(f => uri_1.URI.revive(f.target)) }, timeout, token);
            }
            return undefined;
        }
        async _fireWillEvent(emitter, data, timeout, token) {
            const extensionNames = new Set();
            const edits = [];
            await emitter.fireAsync(data, token, async (thenable, listener) => {
                // ignore all results except for WorkspaceEdits. Those are stored in an array.
                const now = Date.now();
                const result = await Promise.resolve(thenable);
                if (result instanceof extHostTypes_1.WorkspaceEdit) {
                    edits.push([listener.extension, result]);
                    extensionNames.add(listener.extension.displayName ?? listener.extension.identifier.value);
                }
                if (Date.now() - now > timeout) {
                    this._logService.warn('SLOW file-participant', listener.extension.identifier);
                }
            });
            if (token.isCancellationRequested) {
                return undefined;
            }
            if (edits.length === 0) {
                return undefined;
            }
            // concat all WorkspaceEdits collected via waitUntil-call and send them over to the renderer
            const dto = { edits: [] };
            for (const [, edit] of edits) {
                const { edits } = typeConverter.WorkspaceEdit.from(edit, {
                    getTextDocumentVersion: uri => this._extHostDocumentsAndEditors.getDocument(uri)?.version,
                    getNotebookDocumentVersion: () => undefined,
                });
                dto.edits = dto.edits.concat(edits);
            }
            return { edit: dto, extensionNames: Array.from(extensionNames) };
        }
    }
    exports.ExtHostFileSystemEventService = ExtHostFileSystemEventService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEZpbGVTeXN0ZW1FdmVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0RmlsZVN5c3RlbUV2ZW50U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLE1BQU0saUJBQWlCO1FBU3RCLElBQUksa0JBQWtCO1lBQ3JCLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELElBQUksa0JBQWtCO1lBQ3JCLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELElBQUksa0JBQWtCO1lBQ3JCLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELFlBQVksV0FBeUIsRUFBRSxTQUE0QixFQUFFLFNBQWdDLEVBQUUsVUFBbUMsRUFBRSxXQUF5QyxFQUFFLGtCQUE0QixFQUFFLGtCQUE0QixFQUFFLGtCQUE0QjtZQW5COVAsaUJBQVksR0FBRyxJQUFJLGVBQU8sRUFBYyxDQUFDO1lBQ3pDLGlCQUFZLEdBQUcsSUFBSSxlQUFPLEVBQWMsQ0FBQztZQUN6QyxpQkFBWSxHQUFHLElBQUksZUFBTyxFQUFjLENBQUM7WUFrQnpELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBRW5GLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDO2FBQ3RCO1lBQ0QsSUFBSSxrQkFBa0IsRUFBRTtnQkFD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