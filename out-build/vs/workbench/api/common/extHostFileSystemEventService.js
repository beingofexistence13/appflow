/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/glob", "vs/base/common/uri", "./extHost.protocol", "./extHostTypeConverters", "./extHostTypes"], function (require, exports, event_1, glob_1, uri_1, extHost_protocol_1, typeConverter, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Vbc = void 0;
    class FileSystemWatcher {
        get ignoreCreateEvents() {
            return Boolean(this.g & 0b001);
        }
        get ignoreChangeEvents() {
            return Boolean(this.g & 0b010);
        }
        get ignoreDeleteEvents() {
            return Boolean(this.g & 0b100);
        }
        constructor(mainContext, workspace, extension, dispatcher, globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
            this.a = new event_1.$fd();
            this.b = new event_1.$fd();
            this.c = new event_1.$fd();
            const watcherDisposable = this.h(mainContext, extension, globPattern);
            this.g = 0;
            if (ignoreCreateEvents) {
                this.g += 0b001;
            }
            if (ignoreChangeEvents) {
                this.g += 0b010;
            }
            if (ignoreDeleteEvents) {
                this.g += 0b100;
            }
            const parsedPattern = (0, glob_1.$rj)(globPattern);
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
                            this.a.fire(uri);
                        }
                    }
                }
                if (!ignoreChangeEvents) {
                    for (const changed of events.changed) {
                        const uri = uri_1.URI.revive(changed);
                        if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
                            this.b.fire(uri);
                        }
                    }
                }
                if (!ignoreDeleteEvents) {
                    for (const deleted of events.deleted) {
                        const uri = uri_1.URI.revive(deleted);
                        if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
                            this.c.fire(uri);
                        }
                    }
                }
            });
            this.d = extHostTypes_1.$3J.from(watcherDisposable, this.a, this.b, this.c, subscription);
        }
        h(mainContext, extension, globPattern) {
            const disposable = extHostTypes_1.$3J.from();
            if (typeof globPattern === 'string') {
                return disposable; // a pattern alone does not carry sufficient information to start watching anything
            }
            const proxy = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadFileSystem);
            let recursive = false;
            if (globPattern.pattern.includes(glob_1.$nj) || globPattern.pattern.includes(glob_1.$oj)) {
                recursive = true; // only watch recursively if pattern indicates the need for it
            }
            const session = Math.random();
            proxy.$watch(extension.identifier.value, session, globPattern.baseUri, { recursive, excludes: [] /* excludes are not yet surfaced in the API */ });
            return extHostTypes_1.$3J.from({ dispose: () => proxy.$unwatch(session) });
        }
        dispose() {
            this.d.dispose();
        }
        get onDidCreate() {
            return this.a.event;
        }
        get onDidChange() {
            return this.b.event;
        }
        get onDidDelete() {
            return this.c.event;
        }
    }
    class $Vbc {
        constructor(j, k, l) {
            this.j = j;
            this.k = k;
            this.l = l;
            this.a = new event_1.$fd();
            this.b = new event_1.$fd();
            this.c = new event_1.$fd();
            this.d = new event_1.$fd();
            this.g = new event_1.$hd();
            this.h = new event_1.$hd();
            this.i = new event_1.$hd();
            this.onDidRenameFile = this.b.event;
            this.onDidCreateFile = this.c.event;
            this.onDidDeleteFile = this.d.event;
            //
        }
        //--- file events
        createFileSystemWatcher(workspace, extension, globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
            return new FileSystemWatcher(this.j, workspace, extension, this.a.event, typeConverter.GlobPattern.from(globPattern), ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents);
        }
        $onFileEvent(events) {
            this.a.fire(events);
        }
        //--- file operations
        $onDidRunFileOperation(operation, files) {
            switch (operation) {
                case 2 /* FileOperation.MOVE */:
                    this.b.fire(Object.freeze({ files: files.map(f => ({ oldUri: uri_1.URI.revive(f.source), newUri: uri_1.URI.revive(f.target) })) }));
                    break;
                case 1 /* FileOperation.DELETE */:
                    this.d.fire(Object.freeze({ files: files.map(f => uri_1.URI.revive(f.target)) }));
                    break;
                case 0 /* FileOperation.CREATE */:
                case 3 /* FileOperation.COPY */:
                    this.c.fire(Object.freeze({ files: files.map(f => uri_1.URI.revive(f.target)) }));
                    break;
                default:
                //ignore, dont send
            }
        }
        getOnWillRenameFileEvent(extension) {
            return this.m(extension, this.g);
        }
        getOnWillCreateFileEvent(extension) {
            return this.m(extension, this.h);
        }
        getOnWillDeleteFileEvent(extension) {
            return this.m(extension, this.i);
        }
        m(extension, emitter) {
            return (listener, thisArg, disposables) => {
                const wrappedListener = function wrapped(e) { listener.call(thisArg, e); };
                wrappedListener.extension = extension;
                return emitter.event(wrappedListener, undefined, disposables);
            };
        }
        async $onWillRunFileOperation(operation, files, timeout, token) {
            switch (operation) {
                case 2 /* FileOperation.MOVE */:
                    return await this.n(this.g, { files: files.map(f => ({ oldUri: uri_1.URI.revive(f.source), newUri: uri_1.URI.revive(f.target) })) }, timeout, token);
                case 1 /* FileOperation.DELETE */:
                    return await this.n(this.i, { files: files.map(f => uri_1.URI.revive(f.target)) }, timeout, token);
                case 0 /* FileOperation.CREATE */:
                case 3 /* FileOperation.COPY */:
                    return await this.n(this.h, { files: files.map(f => uri_1.URI.revive(f.target)) }, timeout, token);
            }
            return undefined;
        }
        async n(emitter, data, timeout, token) {
            const extensionNames = new Set();
            const edits = [];
            await emitter.fireAsync(data, token, async (thenable, listener) => {
                // ignore all results except for WorkspaceEdits. Those are stored in an array.
                const now = Date.now();
                const result = await Promise.resolve(thenable);
                if (result instanceof extHostTypes_1.$aK) {
                    edits.push([listener.extension, result]);
                    extensionNames.add(listener.extension.displayName ?? listener.extension.identifier.value);
                }
                if (Date.now() - now > timeout) {
                    this.k.warn('SLOW file-participant', listener.extension.identifier);
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
                    getTextDocumentVersion: uri => this.l.getDocument(uri)?.version,
                    getNotebookDocumentVersion: () => undefined,
                });
                dto.edits = dto.edits.concat(edits);
            }
            return { edit: dto, extensionNames: Array.from(extensionNames) };
        }
    }
    exports.$Vbc = $Vbc;
});
//# sourceMappingURL=extHostFileSystemEventService.js.map