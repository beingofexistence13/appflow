/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/nls!vs/platform/files/browser/indexedDBFileSystemProvider", "vs/platform/files/common/files", "vs/base/browser/indexedDB", "vs/base/browser/broadcast"], function (require, exports, async_1, buffer_1, event_1, lifecycle_1, resources_1, types_1, uri_1, nls_1, files_1, indexedDB_1, broadcast_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$B2b = void 0;
    // Standard FS Errors (expected to be thrown in production when invalid FS operations are requested)
    const ERR_FILE_NOT_FOUND = (0, files_1.$fk)((0, nls_1.localize)(0, null), files_1.FileSystemProviderErrorCode.FileNotFound);
    const ERR_FILE_IS_DIR = (0, files_1.$fk)((0, nls_1.localize)(1, null), files_1.FileSystemProviderErrorCode.FileIsADirectory);
    const ERR_FILE_NOT_DIR = (0, files_1.$fk)((0, nls_1.localize)(2, null), files_1.FileSystemProviderErrorCode.FileNotADirectory);
    const ERR_DIR_NOT_EMPTY = (0, files_1.$fk)((0, nls_1.localize)(3, null), files_1.FileSystemProviderErrorCode.Unknown);
    const ERR_FILE_EXCEEDS_STORAGE_QUOTA = (0, files_1.$fk)((0, nls_1.localize)(4, null), files_1.FileSystemProviderErrorCode.FileExceedsStorageQuota);
    // Arbitrary Internal Errors
    const ERR_UNKNOWN_INTERNAL = (message) => (0, files_1.$fk)((0, nls_1.localize)(5, null, message), files_1.FileSystemProviderErrorCode.Unknown);
    class IndexedDBFileSystemNode {
        constructor(a) {
            this.a = a;
            this.type = a.type;
        }
        read(path) {
            return this.b(path.split('/').filter(p => p.length));
        }
        b(pathParts) {
            if (pathParts.length === 0) {
                return this.a;
            }
            if (this.a.type !== files_1.FileType.Directory) {
                throw ERR_UNKNOWN_INTERNAL('Internal error reading from IndexedDBFSNode -- expected directory at ' + this.a.path);
            }
            const next = this.a.children.get(pathParts[0]);
            if (!next) {
                return undefined;
            }
            return next.b(pathParts.slice(1));
        }
        delete(path) {
            const toDelete = path.split('/').filter(p => p.length);
            if (toDelete.length === 0) {
                if (this.a.type !== files_1.FileType.Directory) {
                    throw ERR_UNKNOWN_INTERNAL(`Internal error deleting from IndexedDBFSNode. Expected root entry to be directory`);
                }
                this.a.children.clear();
            }
            else {
                return this.d(toDelete, path);
            }
        }
        d(pathParts, originalPath) {
            if (pathParts.length === 0) {
                throw ERR_UNKNOWN_INTERNAL(`Internal error deleting from IndexedDBFSNode -- got no deletion path parts (encountered while deleting ${originalPath})`);
            }
            else if (this.a.type !== files_1.FileType.Directory) {
                throw ERR_UNKNOWN_INTERNAL('Internal error deleting from IndexedDBFSNode -- expected directory at ' + this.a.path);
            }
            else if (pathParts.length === 1) {
                this.a.children.delete(pathParts[0]);
            }
            else {
                const next = this.a.children.get(pathParts[0]);
                if (!next) {
                    throw ERR_UNKNOWN_INTERNAL('Internal error deleting from IndexedDBFSNode -- expected entry at ' + this.a.path + '/' + next);
                }
                next.d(pathParts.slice(1), originalPath);
            }
        }
        add(path, entry) {
            this.f(path.split('/').filter(p => p.length), entry, path);
        }
        f(pathParts, entry, originalPath) {
            if (pathParts.length === 0) {
                throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- adding empty path (encountered while adding ${originalPath})`);
            }
            else if (this.a.type !== files_1.FileType.Directory) {
                throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- parent is not a directory (encountered while adding ${originalPath})`);
            }
            else if (pathParts.length === 1) {
                const next = pathParts[0];
                const existing = this.a.children.get(next);
                if (entry.type === 'dir') {
                    if (existing?.a.type === files_1.FileType.File) {
                        throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- overwriting file with directory: ${this.a.path}/${next} (encountered while adding ${originalPath})`);
                    }
                    this.a.children.set(next, existing ?? new IndexedDBFileSystemNode({
                        type: files_1.FileType.Directory,
                        path: this.a.path + '/' + next,
                        children: new Map(),
                    }));
                }
                else {
                    if (existing?.a.type === files_1.FileType.Directory) {
                        throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- overwriting directory with file: ${this.a.path}/${next} (encountered while adding ${originalPath})`);
                    }
                    this.a.children.set(next, new IndexedDBFileSystemNode({
                        type: files_1.FileType.File,
                        path: this.a.path + '/' + next,
                        size: entry.size,
                    }));
                }
            }
            else if (pathParts.length > 1) {
                const next = pathParts[0];
                let childNode = this.a.children.get(next);
                if (!childNode) {
                    childNode = new IndexedDBFileSystemNode({
                        children: new Map(),
                        path: this.a.path + '/' + next,
                        type: files_1.FileType.Directory
                    });
                    this.a.children.set(next, childNode);
                }
                else if (childNode.type === files_1.FileType.File) {
                    throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- overwriting file entry with directory: ${this.a.path}/${next} (encountered while adding ${originalPath})`);
                }
                childNode.f(pathParts.slice(1), entry, originalPath);
            }
        }
        print(indentation = '') {
            console.log(indentation + this.a.path);
            if (this.a.type === files_1.FileType.Directory) {
                this.a.children.forEach(child => child.print(indentation + ' '));
            }
        }
    }
    class $B2b extends lifecycle_1.$kc {
        constructor(scheme, n, r, watchCrossWindowChanges) {
            super();
            this.scheme = scheme;
            this.n = n;
            this.r = r;
            this.capabilities = 2 /* FileSystemProviderCapabilities.FileReadWrite */
                | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
            this.onDidChangeCapabilities = event_1.Event.None;
            this.a = new resources_1.$0f(() => false) /* Case Sensitive */;
            this.f = this.B(new event_1.$fd());
            this.onDidChangeFile = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onReportError = this.g.event;
            this.h = new Map();
            this.y = [];
            this.m = new async_1.$Ag();
            if (watchCrossWindowChanges) {
                this.b = this.B(new broadcast_1.$UN(`vscode.indexedDB.${scheme}.changes`));
                this.B(this.b.onDidReceiveData(changes => {
                    this.f.fire(changes.map(c => ({ type: c.type, resource: uri_1.URI.revive(c.resource) })));
                }));
            }
        }
        watch(resource, opts) {
            return lifecycle_1.$kc.None;
        }
        async mkdir(resource) {
            try {
                const resourceStat = await this.stat(resource);
                if (resourceStat.type === files_1.FileType.File) {
                    throw ERR_FILE_NOT_DIR;
                }
            }
            catch (error) { /* Ignore */ }
            (await this.u()).add(resource.path, { type: 'dir' });
        }
        async stat(resource) {
            const entry = (await this.u()).read(resource.path);
            if (entry?.type === files_1.FileType.File) {
                return {
                    type: files_1.FileType.File,
                    ctime: 0,
                    mtime: this.h.get(resource.toString()) || 0,
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
                const entry = (await this.u()).read(resource.path);
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
                this.D('readDir', error);
                throw error;
            }
        }
        async readFile(resource) {
            try {
                const result = await this.n.runInTransaction(this.r, 'readonly', objectStore => objectStore.get(resource.path));
                if (result === undefined) {
                    throw ERR_FILE_NOT_FOUND;
                }
                const buffer = result instanceof Uint8Array ? result : (0, types_1.$jf)(result) ? buffer_1.$Fd.fromString(result).buffer : undefined;
                if (buffer === undefined) {
                    throw ERR_UNKNOWN_INTERNAL(`IndexedDB entry at "${resource.path}" in unexpected format`);
                }
                // update cache
                const fileTree = await this.u();
                fileTree.add(resource.path, { type: 'file', size: buffer.byteLength });
                return buffer;
            }
            catch (error) {
                this.D('readFile', error);
                throw error;
            }
        }
        async writeFile(resource, content, opts) {
            try {
                const existing = await this.stat(resource).catch(() => undefined);
                if (existing?.type === files_1.FileType.Directory) {
                    throw ERR_FILE_IS_DIR;
                }
                await this.w([[resource, content]]);
            }
            catch (error) {
                this.D('writeFile', error);
                throw error;
            }
        }
        async rename(from, to, opts) {
            const fileTree = await this.u();
            const fromEntry = fileTree.read(from.path);
            if (!fromEntry) {
                throw ERR_FILE_NOT_FOUND;
            }
            const toEntry = fileTree.read(to.path);
            if (toEntry) {
                if (!opts.overwrite) {
                    throw (0, files_1.$fk)('file exists already', files_1.FileSystemProviderErrorCode.FileExists);
                }
                if (toEntry.type !== fromEntry.type) {
                    throw (0, files_1.$fk)('Cannot rename files with different types', files_1.FileSystemProviderErrorCode.Unknown);
                }
                // delete the target file if exists
                await this.delete(to, { recursive: true, useTrash: false, atomic: false });
            }
            const toTargetResource = (path) => this.a.joinPath(to, this.a.relativePath(from, from.with({ path })) || '');
            const sourceEntries = await this.s(from);
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
                const sourceFilesContents = await this.n.runInTransaction(this.r, 'readonly', objectStore => sourceFiles.map(([path]) => objectStore.get(path)));
                for (let index = 0; index < sourceFiles.length; index++) {
                    const content = sourceFilesContents[index] instanceof Uint8Array ? sourceFilesContents[index] : (0, types_1.$jf)(sourceFilesContents[index]) ? buffer_1.$Fd.fromString(sourceFilesContents[index]).buffer : undefined;
                    if (content) {
                        targetFiles.push([toTargetResource(sourceFiles[index][0]), content]);
                    }
                }
                await this.w(targetFiles);
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
                const tree = await this.s(resource);
                toDelete = tree.map(([path]) => path);
            }
            else {
                if (stat.type === files_1.FileType.Directory && (await this.readdir(resource)).length) {
                    throw ERR_DIR_NOT_EMPTY;
                }
                toDelete = [resource.path];
            }
            await this.C(toDelete);
            (await this.u()).delete(resource.path);
            toDelete.forEach(key => this.h.delete(key));
            this.t(toDelete.map(path => ({ resource: resource.with({ path }), type: 2 /* FileChangeType.DELETED */ })));
        }
        async s(resource) {
            const stat = await this.stat(resource);
            const allEntries = [[resource.path, stat.type]];
            if (stat.type === files_1.FileType.Directory) {
                const dirEntries = await this.readdir(resource);
                for (const [key, type] of dirEntries) {
                    const childResource = this.a.joinPath(resource, key);
                    allEntries.push([childResource.path, type]);
                    if (type === files_1.FileType.Directory) {
                        const childEntries = await this.s(childResource);
                        allEntries.push(...childEntries);
                    }
                }
            }
            return allEntries;
        }
        t(changes) {
            if (changes.length) {
                this.f.fire(changes);
                this.b?.postData(changes);
            }
        }
        u() {
            if (!this.j) {
                this.j = (async () => {
                    const rootNode = new IndexedDBFileSystemNode({
                        children: new Map(),
                        path: '',
                        type: files_1.FileType.Directory
                    });
                    const result = await this.n.runInTransaction(this.r, 'readonly', objectStore => objectStore.getAllKeys());
                    const keys = result.map(key => key.toString());
                    keys.forEach(key => rootNode.add(key, { type: 'file' }));
                    return rootNode;
                })();
            }
            return this.j;
        }
        async w(files) {
            files.forEach(([resource, content]) => this.y.push({ content, resource }));
            await this.m.queue(() => this.z());
            const fileTree = await this.u();
            for (const [resource, content] of files) {
                fileTree.add(resource.path, { type: 'file', size: content.byteLength });
                this.h.set(resource.toString(), Date.now());
            }
            this.t(files.map(([resource]) => ({ resource, type: 0 /* FileChangeType.UPDATED */ })));
        }
        async z() {
            if (this.y.length) {
                const fileBatch = this.y.splice(0, this.y.length);
                try {
                    await this.n.runInTransaction(this.r, 'readwrite', objectStore => fileBatch.map(entry => {
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
        async C(keys) {
            if (keys.length) {
                await this.n.runInTransaction(this.r, 'readwrite', objectStore => keys.map(key => objectStore.delete(key)));
            }
        }
        async reset() {
            await this.n.runInTransaction(this.r, 'readwrite', objectStore => objectStore.clear());
        }
        D(operation, error) {
            this.g.fire({ scheme: this.scheme, operation, code: error instanceof files_1.$ek || error instanceof indexedDB_1.$2Q ? error.code : 'unknown' });
        }
    }
    exports.$B2b = $B2b;
});
//# sourceMappingURL=indexedDBFileSystemProvider.js.map