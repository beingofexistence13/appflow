/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/files/common/files"], function (require, exports, event_1, lifecycle_1, resources, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rAb = void 0;
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
    class $rAb extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.a = this.B(new event_1.$fd());
            this.onDidChangeCapabilities = this.a.event;
            this.b = 2 /* FileSystemProviderCapabilities.FileReadWrite */ | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
            this.root = new Directory('');
            // --- manage file events
            this.m = this.B(new event_1.$fd());
            this.onDidChangeFile = this.m.event;
            this.n = [];
        }
        get capabilities() { return this.b; }
        setReadOnly(readonly) {
            const isReadonly = !!(this.b & 2048 /* FileSystemProviderCapabilities.Readonly */);
            if (readonly !== isReadonly) {
                this.b = readonly ? 2048 /* FileSystemProviderCapabilities.Readonly */ | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */ | 2 /* FileSystemProviderCapabilities.FileReadWrite */
                    : 2 /* FileSystemProviderCapabilities.FileReadWrite */ | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
                this.a.fire();
            }
        }
        // --- manage file metadata
        async stat(resource) {
            return this.f(resource, false);
        }
        async readdir(resource) {
            const entry = this.g(resource, false);
            const result = [];
            entry.entries.forEach((child, name) => result.push([name, child.type]));
            return result;
        }
        // --- manage file contents
        async readFile(resource) {
            const data = this.h(resource, false).data;
            if (data) {
                return data;
            }
            throw (0, files_1.$fk)('file not found', files_1.FileSystemProviderErrorCode.FileNotFound);
        }
        async writeFile(resource, content, opts) {
            const basename = resources.$fg(resource);
            const parent = this.j(resource);
            let entry = parent.entries.get(basename);
            if (entry instanceof Directory) {
                throw (0, files_1.$fk)('file is directory', files_1.FileSystemProviderErrorCode.FileIsADirectory);
            }
            if (!entry && !opts.create) {
                throw (0, files_1.$fk)('file not found', files_1.FileSystemProviderErrorCode.FileNotFound);
            }
            if (entry && opts.create && !opts.overwrite) {
                throw (0, files_1.$fk)('file exists already', files_1.FileSystemProviderErrorCode.FileExists);
            }
            if (!entry) {
                entry = new File(basename);
                parent.entries.set(basename, entry);
                this.s({ type: 1 /* FileChangeType.ADDED */, resource });
            }
            entry.mtime = Date.now();
            entry.size = content.byteLength;
            entry.data = content;
            this.s({ type: 0 /* FileChangeType.UPDATED */, resource });
        }
        // --- manage files/folders
        async rename(from, to, opts) {
            if (!opts.overwrite && this.f(to, true)) {
                throw (0, files_1.$fk)('file exists already', files_1.FileSystemProviderErrorCode.FileExists);
            }
            const entry = this.f(from, false);
            const oldParent = this.j(from);
            const newParent = this.j(to);
            const newName = resources.$fg(to);
            oldParent.entries.delete(entry.name);
            entry.name = newName;
            newParent.entries.set(newName, entry);
            this.s({ type: 2 /* FileChangeType.DELETED */, resource: from }, { type: 1 /* FileChangeType.ADDED */, resource: to });
        }
        async delete(resource, opts) {
            const dirname = resources.$hg(resource);
            const basename = resources.$fg(resource);
            const parent = this.g(dirname, false);
            if (parent.entries.has(basename)) {
                parent.entries.delete(basename);
                parent.mtime = Date.now();
                parent.size -= 1;
                this.s({ type: 0 /* FileChangeType.UPDATED */, resource: dirname }, { resource, type: 2 /* FileChangeType.DELETED */ });
            }
        }
        async mkdir(resource) {
            if (this.f(resource, true)) {
                throw (0, files_1.$fk)('file exists already', files_1.FileSystemProviderErrorCode.FileExists);
            }
            const basename = resources.$fg(resource);
            const dirname = resources.$hg(resource);
            const parent = this.g(dirname, false);
            const entry = new Directory(basename);
            parent.entries.set(entry.name, entry);
            parent.mtime = Date.now();
            parent.size += 1;
            this.s({ type: 0 /* FileChangeType.UPDATED */, resource: dirname }, { type: 1 /* FileChangeType.ADDED */, resource });
        }
        f(uri, silent) {
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
                        throw (0, files_1.$fk)('file not found', files_1.FileSystemProviderErrorCode.FileNotFound);
                    }
                    else {
                        return undefined;
                    }
                }
                entry = child;
            }
            return entry;
        }
        g(uri, silent) {
            const entry = this.f(uri, silent);
            if (entry instanceof Directory) {
                return entry;
            }
            throw (0, files_1.$fk)('file not a directory', files_1.FileSystemProviderErrorCode.FileNotADirectory);
        }
        h(uri, silent) {
            const entry = this.f(uri, silent);
            if (entry instanceof File) {
                return entry;
            }
            throw (0, files_1.$fk)('file is a directory', files_1.FileSystemProviderErrorCode.FileIsADirectory);
        }
        j(uri) {
            const dirname = resources.$hg(uri);
            return this.g(dirname, false);
        }
        watch(resource, opts) {
            // ignore, fires for all changes...
            return lifecycle_1.$kc.None;
        }
        s(...changes) {
            this.n.push(...changes);
            if (this.r) {
                clearTimeout(this.r);
            }
            this.r = setTimeout(() => {
                this.m.fire(this.n);
                this.n.length = 0;
            }, 5);
        }
    }
    exports.$rAb = $rAb;
});
//# sourceMappingURL=inMemoryFilesystemProvider.js.map