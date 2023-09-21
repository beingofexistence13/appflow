/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/files/common/files"], function (require, exports, event_1, lifecycle_1, resources, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InMemoryFileSystemProvider = void 0;
    class File {
        constructor(name) {
            this.type = files_1.FileType.File;
            this.ctime = Date.now();
            this.mtime = Date.now();
            this.size = 0;
            this.name = name;
        }
    }
    class Directory {
        constructor(name) {
            this.type = files_1.FileType.Directory;
            this.ctime = Date.now();
            this.mtime = Date.now();
            this.size = 0;
            this.name = name;
            this.entries = new Map();
        }
    }
    class InMemoryFileSystemProvider extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeCapabilities = this._register(new event_1.Emitter());
            this.onDidChangeCapabilities = this._onDidChangeCapabilities.event;
            this._capabilities = 2 /* FileSystemProviderCapabilities.FileReadWrite */ | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
            this.root = new Directory('');
            // --- manage file events
            this._onDidChangeFile = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChangeFile.event;
            this._bufferedChanges = [];
        }
        get capabilities() { return this._capabilities; }
        setReadOnly(readonly) {
            const isReadonly = !!(this._capabilities & 2048 /* FileSystemProviderCapabilities.Readonly */);
            if (readonly !== isReadonly) {
                this._capabilities = readonly ? 2048 /* FileSystemProviderCapabilities.Readonly */ | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */ | 2 /* FileSystemProviderCapabilities.FileReadWrite */
                    : 2 /* FileSystemProviderCapabilities.FileReadWrite */ | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
                this._onDidChangeCapabilities.fire();
            }
        }
        // --- manage file metadata
        async stat(resource) {
            return this._lookup(resource, false);
        }
        async readdir(resource) {
            const entry = this._lookupAsDirectory(resource, false);
            const result = [];
            entry.entries.forEach((child, name) => result.push([name, child.type]));
            return result;
        }
        // --- manage file contents
        async readFile(resource) {
            const data = this._lookupAsFile(resource, false).data;
            if (data) {
                return data;
            }
            throw (0, files_1.createFileSystemProviderError)('file not found', files_1.FileSystemProviderErrorCode.FileNotFound);
        }
        async writeFile(resource, content, opts) {
            const basename = resources.basename(resource);
            const parent = this._lookupParentDirectory(resource);
            let entry = parent.entries.get(basename);
            if (entry instanceof Directory) {
                throw (0, files_1.createFileSystemProviderError)('file is directory', files_1.FileSystemProviderErrorCode.FileIsADirectory);
            }
            if (!entry && !opts.create) {
                throw (0, files_1.createFileSystemProviderError)('file not found', files_1.FileSystemProviderErrorCode.FileNotFound);
            }
            if (entry && opts.create && !opts.overwrite) {
                throw (0, files_1.createFileSystemProviderError)('file exists already', files_1.FileSystemProviderErrorCode.FileExists);
            }
            if (!entry) {
                entry = new File(basename);
                parent.entries.set(basename, entry);
                this._fireSoon({ type: 1 /* FileChangeType.ADDED */, resource });
            }
            entry.mtime = Date.now();
            entry.size = content.byteLength;
            entry.data = content;
            this._fireSoon({ type: 0 /* FileChangeType.UPDATED */, resource });
        }
        // --- manage files/folders
        async rename(from, to, opts) {
            if (!opts.overwrite && this._lookup(to, true)) {
                throw (0, files_1.createFileSystemProviderError)('file exists already', files_1.FileSystemProviderErrorCode.FileExists);
            }
            const entry = this._lookup(from, false);
            const oldParent = this._lookupParentDirectory(from);
            const newParent = this._lookupParentDirectory(to);
            const newName = resources.basename(to);
            oldParent.entries.delete(entry.name);
            entry.name = newName;
            newParent.entries.set(newName, entry);
            this._fireSoon({ type: 2 /* FileChangeType.DELETED */, resource: from }, { type: 1 /* FileChangeType.ADDED */, resource: to });
        }
        async delete(resource, opts) {
            const dirname = resources.dirname(resource);
            const basename = resources.basename(resource);
            const parent = this._lookupAsDirectory(dirname, false);
            if (parent.entries.has(basename)) {
                parent.entries.delete(basename);
                parent.mtime = Date.now();
                parent.size -= 1;
                this._fireSoon({ type: 0 /* FileChangeType.UPDATED */, resource: dirname }, { resource, type: 2 /* FileChangeType.DELETED */ });
            }
        }
        async mkdir(resource) {
            if (this._lookup(resource, true)) {
                throw (0, files_1.createFileSystemProviderError)('file exists already', files_1.FileSystemProviderErrorCode.FileExists);
            }
            const basename = resources.basename(resource);
            const dirname = resources.dirname(resource);
            const parent = this._lookupAsDirectory(dirname, false);
            const entry = new Directory(basename);
            parent.entries.set(entry.name, entry);
            parent.mtime = Date.now();
            parent.size += 1;
            this._fireSoon({ type: 0 /* FileChangeType.UPDATED */, resource: dirname }, { type: 1 /* FileChangeType.ADDED */, resource });
        }
        _lookup(uri, silent) {
            const parts = uri.path.split('/');
            let entry = this.root;
            for (const part of parts) {
                if (!part) {
                    continue;
                }
                let child;
                if (entry instanceof Directory) {
                    child = entry.entries.get(part);
                }
                if (!child) {
                    if (!silent) {
                        throw (0, files_1.createFileSystemProviderError)('file not found', files_1.FileSystemProviderErrorCode.FileNotFound);
                    }
                    else {
                        return undefined;
                    }
                }
                entry = child;
            }
            return entry;
        }
        _lookupAsDirectory(uri, silent) {
            const entry = this._lookup(uri, silent);
            if (entry instanceof Directory) {
                return entry;
            }
            throw (0, files_1.createFileSystemProviderError)('file not a directory', files_1.FileSystemProviderErrorCode.FileNotADirectory);
        }
        _lookupAsFile(uri, silent) {
            const entry = this._lookup(uri, silent);
            if (entry instanceof File) {
                return entry;
            }
            throw (0, files_1.createFileSystemProviderError)('file is a directory', files_1.FileSystemProviderErrorCode.FileIsADirectory);
        }
        _lookupParentDirectory(uri) {
            const dirname = resources.dirname(uri);
            return this._lookupAsDirectory(dirname, false);
        }
        watch(resource, opts) {
            // ignore, fires for all changes...
            return lifecycle_1.Disposable.None;
        }
        _fireSoon(...changes) {
            this._bufferedChanges.push(...changes);
            if (this._fireSoonHandle) {
                clearTimeout(this._fireSoonHandle);
            }
            this._fireSoonHandle = setTimeout(() => {
                this._onDidChangeFile.fire(this._bufferedChanges);
                this._bufferedChanges.length = 0;
            }, 5);
        }
    }
    exports.InMemoryFileSystemProvider = InMemoryFileSystemProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5NZW1vcnlGaWxlc3lzdGVtUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9maWxlcy9jb21tb24vaW5NZW1vcnlGaWxlc3lzdGVtUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQU0sSUFBSTtRQVVULFlBQVksSUFBWTtZQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFRLENBQUMsSUFBSSxDQUFDO1lBQzFCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDbEIsQ0FBQztLQUNEO0lBRUQsTUFBTSxTQUFTO1FBVWQsWUFBWSxJQUFZO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLEdBQUcsZ0JBQVEsQ0FBQyxTQUFTLENBQUM7WUFDL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7WUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDMUIsQ0FBQztLQUNEO0lBSUQsTUFBYSwwQkFBMkIsU0FBUSxzQkFBVTtRQUExRDs7WUFFUyw2QkFBd0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUM5RCw0QkFBdUIsR0FB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