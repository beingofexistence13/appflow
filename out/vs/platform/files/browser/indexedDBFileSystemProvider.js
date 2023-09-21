/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/nls", "vs/platform/files/common/files", "vs/base/browser/indexedDB", "vs/base/browser/broadcast"], function (require, exports, async_1, buffer_1, event_1, lifecycle_1, resources_1, types_1, uri_1, nls_1, files_1, indexedDB_1, broadcast_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IndexedDBFileSystemProvider = void 0;
    // Standard FS Errors (expected to be thrown in production when invalid FS operations are requested)
    const ERR_FILE_NOT_FOUND = (0, files_1.createFileSystemProviderError)((0, nls_1.localize)('fileNotExists', "File does not exist"), files_1.FileSystemProviderErrorCode.FileNotFound);
    const ERR_FILE_IS_DIR = (0, files_1.createFileSystemProviderError)((0, nls_1.localize)('fileIsDirectory', "File is Directory"), files_1.FileSystemProviderErrorCode.FileIsADirectory);
    const ERR_FILE_NOT_DIR = (0, files_1.createFileSystemProviderError)((0, nls_1.localize)('fileNotDirectory', "File is not a directory"), files_1.FileSystemProviderErrorCode.FileNotADirectory);
    const ERR_DIR_NOT_EMPTY = (0, files_1.createFileSystemProviderError)((0, nls_1.localize)('dirIsNotEmpty', "Directory is not empty"), files_1.FileSystemProviderErrorCode.Unknown);
    const ERR_FILE_EXCEEDS_STORAGE_QUOTA = (0, files_1.createFileSystemProviderError)((0, nls_1.localize)('fileExceedsStorageQuota', "File exceeds available storage quota"), files_1.FileSystemProviderErrorCode.FileExceedsStorageQuota);
    // Arbitrary Internal Errors
    const ERR_UNKNOWN_INTERNAL = (message) => (0, files_1.createFileSystemProviderError)((0, nls_1.localize)('internal', "Internal error occurred in IndexedDB File System Provider. ({0})", message), files_1.FileSystemProviderErrorCode.Unknown);
    class IndexedDBFileSystemNode {
        constructor(entry) {
            this.entry = entry;
            this.type = entry.type;
        }
        read(path) {
            return this.doRead(path.split('/').filter(p => p.length));
        }
        doRead(pathParts) {
            if (pathParts.length === 0) {
                return this.entry;
            }
            if (this.entry.type !== files_1.FileType.Directory) {
                throw ERR_UNKNOWN_INTERNAL('Internal error reading from IndexedDBFSNode -- expected directory at ' + this.entry.path);
            }
            const next = this.entry.children.get(pathParts[0]);
            if (!next) {
                return undefined;
            }
            return next.doRead(pathParts.slice(1));
        }
        delete(path) {
            const toDelete = path.split('/').filter(p => p.length);
            if (toDelete.length === 0) {
                if (this.entry.type !== files_1.FileType.Directory) {
                    throw ERR_UNKNOWN_INTERNAL(`Internal error deleting from IndexedDBFSNode. Expected root entry to be directory`);
                }
                this.entry.children.clear();
            }
            else {
                return this.doDelete(toDelete, path);
            }
        }
        doDelete(pathParts, originalPath) {
            if (pathParts.length === 0) {
                throw ERR_UNKNOWN_INTERNAL(`Internal error deleting from IndexedDBFSNode -- got no deletion path parts (encountered while deleting ${originalPath})`);
            }
            else if (this.entry.type !== files_1.FileType.Directory) {
                throw ERR_UNKNOWN_INTERNAL('Internal error deleting from IndexedDBFSNode -- expected directory at ' + this.entry.path);
            }
            else if (pathParts.length === 1) {
                this.entry.children.delete(pathParts[0]);
            }
            else {
                const next = this.entry.children.get(pathParts[0]);
                if (!next) {
                    throw ERR_UNKNOWN_INTERNAL('Internal error deleting from IndexedDBFSNode -- expected entry at ' + this.entry.path + '/' + next);
                }
                next.doDelete(pathParts.slice(1), originalPath);
            }
        }
        add(path, entry) {
            this.doAdd(path.split('/').filter(p => p.length), entry, path);
        }
        doAdd(pathParts, entry, originalPath) {
            if (pathParts.length === 0) {
                throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- adding empty path (encountered while adding ${originalPath})`);
            }
            else if (this.entry.type !== files_1.FileType.Directory) {
                throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- parent is not a directory (encountered while adding ${originalPath})`);
            }
            else if (pathParts.length === 1) {
                const next = pathParts[0];
                const existing = this.entry.children.get(next);
                if (entry.type === 'dir') {
                    if (existing?.entry.type === files_1.FileType.File) {
                        throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- overwriting file with directory: ${this.entry.path}/${next} (encountered while adding ${originalPath})`);
                    }
                    this.entry.children.set(next, existing ?? new IndexedDBFileSystemNode({
                        type: files_1.FileType.Directory,
                        path: this.entry.path + '/' + next,
                        children: new Map(),
                    }));
                }
                else {
                    if (existing?.entry.type === files_1.FileType.Directory) {
                        throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- overwriting directory with file: ${this.entry.path}/${next} (encountered while adding ${originalPath})`);
                    }
                    this.entry.children.set(next, new IndexedDBFileSystemNode({
                        type: files_1.FileType.File,
                        path: this.entry.path + '/' + next,
                        size: entry.size,
                    }));
                }
            }
            else if (pathParts.length > 1) {
                const next = pathParts[0];
                let childNode = this.entry.children.get(next);
                if (!childNode) {
                    childNode = new IndexedDBFileSystemNode({
                        children: new Map(),
                        path: this.entry.path + '/' + next,
                        type: files_1.FileType.Directory
                    });
                    this.entry.children.set(next, childNode);
                }
                else if (childNode.type === files_1.FileType.File) {
                    throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- overwriting file entry with directory: ${this.entry.path}/${next} (encountered while adding ${originalPath})`);
                }
                childNode.doAdd(pathParts.slice(1), entry, originalPath);
            }
        }
        print(indentation = '') {
            console.log(indentation + this.entry.path);
            if (this.entry.type === files_1.FileType.Directory) {
                this.entry.children.forEach(child => child.print(indentation + ' '));
            }
        }
    }
    class IndexedDBFileSystemProvider extends lifecycle_1.Disposable {
        constructor(scheme, indexedDB, store, watchCrossWindowChanges) {
            super();
            this.scheme = scheme;
            this.indexedDB = indexedDB;
            this.store = store;
            this.capabilities = 2 /* FileSystemProviderCapabilities.FileReadWrite */
                | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
            this.onDidChangeCapabilities = event_1.Event.None;
            this.extUri = new resources_1.ExtUri(() => false) /* Case Sensitive */;
            this._onDidChangeFile = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChangeFile.event;
            this._onReportError = this._register(new event_1.Emitter());
            this.onReportError = this._onReportError.event;
            this.mtimes = new Map();
            this.fileWriteBatch = [];
            this.writeManyThrottler = new async_1.Throttler();
            if (watchCrossWindowChanges) {
                this.changesBroadcastChannel = this._register(new broadcast_1.BroadcastDataChannel(`vscode.indexedDB.${scheme}.changes`));
                this._register(this.changesBroadcastChannel.onDidReceiveData(changes => {
                    this._onDidChangeFile.fire(changes.map(c => ({ type: c.type, resource: uri_1.URI.revive(c.resource) })));
                }));
            }
        }
        watch(resource, opts) {
            return lifecycle_1.Disposable.None;
        }
        async mkdir(resource) {
            try {
                const resourceStat = await this.stat(resource);
                if (resourceStat.type === files_1.FileType.File) {
                    throw ERR_FILE_NOT_DIR;
                }
            }
            catch (error) { /* Ignore */ }
            (await this.getFiletree()).add(resource.path, { type: 'dir' });
        }
        async stat(resource) {
            const entry = (await this.getFiletree()).read(resource.path);
            if (entry?.type === files_1.FileType.File) {
                return {
                    type: files_1.FileType.File,
                    ctime: 0,
                    mtime: this.mtimes.get(resource.toString()) || 0,
                    size: entry.size ?? (await this.readFile(resource)).byteLength
                };
            }
            if (entry?.type === files_1.FileType.Directory) {
                return {
                    type: files_1.FileType.Directory,
                    ctime: 0,
                    mtime: 0,
                    size: 0
                };
            }
            throw ERR_FILE_NOT_FOUND;
        }
        async readdir(resource) {
            try {
                const entry = (await this.getFiletree()).read(resource.path);
                if (!entry) {
                    // Dirs aren't saved to disk, so empty dirs will be lost on reload.
                    // Thus we have two options for what happens when you try to read a dir and nothing is found:
                    // - Throw FileSystemProviderErrorCode.FileNotFound
                    // - Return []
                    // We choose to return [] as creating a dir then reading it (even after reload) should not throw an error.
                    return [];
                }
                if (entry.type !== files_1.FileType.Directory) {
                    throw ERR_FILE_NOT_DIR;
                }
                else {
                    return [...entry.children.entries()].map(([name, node]) => [name, node.type]);
                }
            }
            catch (error) {
                this.reportError('readDir', error);
                throw error;
            }
        }
        async readFile(resource) {
            try {
                const result = await this.indexedDB.runInTransaction(this.store, 'readonly', objectStore => objectStore.get(resource.path));
                if (result === undefined) {
                    throw ERR_FILE_NOT_FOUND;
                }
                const buffer = result instanceof Uint8Array ? result : (0, types_1.isString)(result) ? buffer_1.VSBuffer.fromString(result).buffer : undefined;
                if (buffer === undefined) {
                    throw ERR_UNKNOWN_INTERNAL(`IndexedDB entry at "${resource.path}" in unexpected format`);
                }
                // update cache
                const fileTree = await this.getFiletree();
                fileTree.add(resource.path, { type: 'file', size: buffer.byteLength });
                return buffer;
            }
            catch (error) {
                this.reportError('readFile', error);
                throw error;
            }
        }
        async writeFile(resource, content, opts) {
            try {
                const existing = await this.stat(resource).catch(() => undefined);
                if (existing?.type === files_1.FileType.Directory) {
                    throw ERR_FILE_IS_DIR;
                }
                await this.bulkWrite([[resource, content]]);
            }
            catch (error) {
                this.reportError('writeFile', error);
                throw error;
            }
        }
        async rename(from, to, opts) {
            const fileTree = await this.getFiletree();
            const fromEntry = fileTree.read(from.path);
            if (!fromEntry) {
                throw ERR_FILE_NOT_FOUND;
            }
            const toEntry = fileTree.read(to.path);
            if (toEntry) {
                if (!opts.overwrite) {
                    throw (0, files_1.createFileSystemProviderError)('file exists already', files_1.FileSystemProviderErrorCode.FileExists);
                }
                if (toEntry.type !== fromEntry.type) {
                    throw (0, files_1.createFileSystemProviderError)('Cannot rename files with different types', files_1.FileSystemProviderErrorCode.Unknown);
                }
                // delete the target file if exists
                await this.delete(to, { recursive: true, useTrash: false, atomic: false });
            }
            const toTargetResource = (path) => this.extUri.joinPath(to, this.extUri.relativePath(from, from.with({ path })) || '');
            const sourceEntries = await this.tree(from);
            const sourceFiles = [];
            for (const sourceEntry of sourceEntries) {
                if (sourceEntry[1] === files_1.FileType.File) {
                    sourceFiles.push(sourceEntry);
                }
                else if (sourceEntry[1] === files_1.FileType.Directory) {
                    // add directories to the tree
                    fileTree.add(toTargetResource(sourceEntry[0]).path, { type: 'dir' });
                }
            }
            if (sourceFiles.length) {
                const targetFiles = [];
                const sourceFilesContents = await this.indexedDB.runInTransaction(this.store, 'readonly', objectStore => sourceFiles.map(([path]) => objectStore.get(path)));
                for (let index = 0; index < sourceFiles.length; index++) {
                    const content = sourceFilesContents[index] instanceof Uint8Array ? sourceFilesContents[index] : (0, types_1.isString)(sourceFilesContents[index]) ? buffer_1.VSBuffer.fromString(sourceFilesContents[index]).buffer : undefined;
                    if (content) {
                        targetFiles.push([toTargetResource(sourceFiles[index][0]), content]);
                    }
                }
                await this.bulkWrite(targetFiles);
            }
            await this.delete(from, { recursive: true, useTrash: false, atomic: false });
        }
        async delete(resource, opts) {
            let stat;
            try {
                stat = await this.stat(resource);
            }
            catch (e) {
                if (e.code === files_1.FileSystemProviderErrorCode.FileNotFound) {
                    return;
                }
                throw e;
            }
            let toDelete;
            if (opts.recursive) {
                const tree = await this.tree(resource);
                toDelete = tree.map(([path]) => path);
            }
            else {
                if (stat.type === files_1.FileType.Directory && (await this.readdir(resource)).length) {
                    throw ERR_DIR_NOT_EMPTY;
                }
                toDelete = [resource.path];
            }
            await this.deleteKeys(toDelete);
            (await this.getFiletree()).delete(resource.path);
            toDelete.forEach(key => this.mtimes.delete(key));
            this.triggerChanges(toDelete.map(path => ({ resource: resource.with({ path }), type: 2 /* FileChangeType.DELETED */ })));
        }
        async tree(resource) {
            const stat = await this.stat(resource);
            const allEntries = [[resource.path, stat.type]];
            if (stat.type === files_1.FileType.Directory) {
                const dirEntries = await this.readdir(resource);
                for (const [key, type] of dirEntries) {
                    const childResource = this.extUri.joinPath(resource, key);
                    allEntries.push([childResource.path, type]);
                    if (type === files_1.FileType.Directory) {
                        const childEntries = await this.tree(childResource);
                        allEntries.push(...childEntries);
                    }
                }
            }
            return allEntries;
        }
        triggerChanges(changes) {
            if (changes.length) {
                this._onDidChangeFile.fire(changes);
                this.changesBroadcastChannel?.postData(changes);
            }
        }
        getFiletree() {
            if (!this.cachedFiletree) {
                this.cachedFiletree = (async () => {
                    const rootNode = new IndexedDBFileSystemNode({
                        children: new Map(),
                        path: '',
                        type: files_1.FileType.Directory
                    });
                    const result = await this.indexedDB.runInTransaction(this.store, 'readonly', objectStore => objectStore.getAllKeys());
                    const keys = result.map(key => key.toString());
                    keys.forEach(key => rootNode.add(key, { type: 'file' }));
                    return rootNode;
                })();
            }
            return this.cachedFiletree;
        }
        async bulkWrite(files) {
            files.forEach(([resource, content]) => this.fileWriteBatch.push({ content, resource }));
            await this.writeManyThrottler.queue(() => this.writeMany());
            const fileTree = await this.getFiletree();
            for (const [resource, content] of files) {
                fileTree.add(resource.path, { type: 'file', size: content.byteLength });
                this.mtimes.set(resource.toString(), Date.now());
            }
            this.triggerChanges(files.map(([resource]) => ({ resource, type: 0 /* FileChangeType.UPDATED */ })));
        }
        async writeMany() {
            if (this.fileWriteBatch.length) {
                const fileBatch = this.fileWriteBatch.splice(0, this.fileWriteBatch.length);
                try {
                    await this.indexedDB.runInTransaction(this.store, 'readwrite', objectStore => fileBatch.map(entry => {
                        return objectStore.put(entry.content, entry.resource.path);
                    }));
                }
                catch (ex) {
                    if (ex instanceof DOMException && ex.name === 'QuotaExceededError') {
                        throw ERR_FILE_EXCEEDS_STORAGE_QUOTA;
                    }
                    throw ex;
                }
            }
        }
        async deleteKeys(keys) {
            if (keys.length) {
                await this.indexedDB.runInTransaction(this.store, 'readwrite', objectStore => keys.map(key => objectStore.delete(key)));
            }
        }
        async reset() {
            await this.indexedDB.runInTransaction(this.store, 'readwrite', objectStore => objectStore.clear());
        }
        reportError(operation, error) {
            this._onReportError.fire({ scheme: this.scheme, operation, code: error instanceof files_1.FileSystemProviderError || error instanceof indexedDB_1.DBClosedError ? error.code : 'unknown' });
        }
    }
    exports.IndexedDBFileSystemProvider = IndexedDBFileSystemProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhlZERCRmlsZVN5c3RlbVByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZmlsZXMvYnJvd3Nlci9pbmRleGVkREJGaWxlU3lzdGVtUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBNEJoRyxvR0FBb0c7SUFDcEcsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLHFDQUE2QixFQUFDLElBQUEsY0FBUSxFQUFDLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQyxFQUFFLG1DQUEyQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3JKLE1BQU0sZUFBZSxHQUFHLElBQUEscUNBQTZCLEVBQUMsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUsbUJBQW1CLENBQUMsRUFBRSxtQ0FBMkIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3RKLE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSxxQ0FBNkIsRUFBQyxJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSx5QkFBeUIsQ0FBQyxFQUFFLG1DQUEyQixDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDL0osTUFBTSxpQkFBaUIsR0FBRyxJQUFBLHFDQUE2QixFQUFDLElBQUEsY0FBUSxFQUFDLGVBQWUsRUFBRSx3QkFBd0IsQ0FBQyxFQUFFLG1DQUEyQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2xKLE1BQU0sOEJBQThCLEdBQUcsSUFBQSxxQ0FBNkIsRUFBQyxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSxzQ0FBc0MsQ0FBQyxFQUFFLG1DQUEyQixDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFFdk0sNEJBQTRCO0lBQzVCLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxPQUFlLEVBQUUsRUFBRSxDQUFDLElBQUEscUNBQTZCLEVBQUMsSUFBQSxjQUFRLEVBQUMsVUFBVSxFQUFFLGtFQUFrRSxFQUFFLE9BQU8s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