/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/files/common/files", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/base/common/buffer", "vs/platform/workspace/common/workspace", "vs/platform/log/common/log", "vs/platform/configuration/common/configuration", "vs/workbench/services/files/common/files", "vs/platform/files/common/watcher", "vs/base/common/glob", "vs/base/common/strings"], function (require, exports, event_1, lifecycle_1, uri_1, files_1, extHostCustomers_1, extHost_protocol_1, buffer_1, workspace_1, log_1, configuration_1, files_2, watcher_1, glob_1, strings_1) {
    "use strict";
    var $pkb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pkb = void 0;
    let $pkb = $pkb_1 = class $pkb {
        constructor(extHostContext, f, g, h, i) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.b = new lifecycle_1.$sc();
            this.c = new lifecycle_1.$jc();
            this.d = new lifecycle_1.$sc();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostFileSystem);
            const infoProxy = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostFileSystemInfo);
            for (const entry of f.listCapabilities()) {
                infoProxy.$acceptProviderInfos(uri_1.URI.from({ scheme: entry.scheme, path: '/dummy' }), entry.capabilities);
            }
            this.c.add(f.onDidChangeFileSystemProviderRegistrations(e => infoProxy.$acceptProviderInfos(uri_1.URI.from({ scheme: e.scheme, path: '/dummy' }), e.provider?.capabilities ?? null)));
            this.c.add(f.onDidChangeFileSystemProviderCapabilities(e => infoProxy.$acceptProviderInfos(uri_1.URI.from({ scheme: e.scheme, path: '/dummy' }), e.provider.capabilities)));
        }
        dispose() {
            this.c.dispose();
            this.b.dispose();
            this.d.dispose();
        }
        async $registerFileSystemProvider(handle, scheme, capabilities, readonlyMessage) {
            this.b.set(handle, new RemoteFileSystemProvider(this.f, scheme, capabilities, readonlyMessage, handle, this.a));
        }
        $unregisterProvider(handle) {
            this.b.deleteAndDispose(handle);
        }
        $onFileSystemChange(handle, changes) {
            const fileProvider = this.b.get(handle);
            if (!fileProvider) {
                throw new Error('Unknown file provider');
            }
            fileProvider.$onFileSystemChange(changes);
        }
        // --- consumer fs, vscode.workspace.fs
        $stat(uri) {
            return this.f.stat(uri_1.URI.revive(uri)).then(stat => {
                return {
                    ctime: stat.ctime,
                    mtime: stat.mtime,
                    size: stat.size,
                    permissions: stat.readonly ? files_1.FilePermission.Readonly : undefined,
                    type: $pkb_1.j(stat)
                };
            }).catch($pkb_1.k);
        }
        $readdir(uri) {
            return this.f.resolve(uri_1.URI.revive(uri), { resolveMetadata: false }).then(stat => {
                if (!stat.isDirectory) {
                    const err = new Error(stat.name);
                    err.name = files_1.FileSystemProviderErrorCode.FileNotADirectory;
                    throw err;
                }
                return !stat.children ? [] : stat.children.map(child => [child.name, $pkb_1.j(child)]);
            }).catch($pkb_1.k);
        }
        static j(stat) {
            let res = 0;
            if (stat.isFile) {
                res += files_1.FileType.File;
            }
            else if (stat.isDirectory) {
                res += files_1.FileType.Directory;
            }
            if (stat.isSymbolicLink) {
                res += files_1.FileType.SymbolicLink;
            }
            return res;
        }
        $readFile(uri) {
            return this.f.readFile(uri_1.URI.revive(uri)).then(file => file.value).catch($pkb_1.k);
        }
        $writeFile(uri, content) {
            return this.f.writeFile(uri_1.URI.revive(uri), content)
                .then(() => undefined).catch($pkb_1.k);
        }
        $rename(source, target, opts) {
            return this.f.move(uri_1.URI.revive(source), uri_1.URI.revive(target), opts.overwrite)
                .then(() => undefined).catch($pkb_1.k);
        }
        $copy(source, target, opts) {
            return this.f.copy(uri_1.URI.revive(source), uri_1.URI.revive(target), opts.overwrite)
                .then(() => undefined).catch($pkb_1.k);
        }
        $mkdir(uri) {
            return this.f.createFolder(uri_1.URI.revive(uri))
                .then(() => undefined).catch($pkb_1.k);
        }
        $delete(uri, opts) {
            return this.f.del(uri_1.URI.revive(uri), opts).catch($pkb_1.k);
        }
        static k(err) {
            if (err instanceof files_1.$nk) {
                switch (err.fileOperationResult) {
                    case 1 /* FileOperationResult.FILE_NOT_FOUND */:
                        err.name = files_1.FileSystemProviderErrorCode.FileNotFound;
                        break;
                    case 0 /* FileOperationResult.FILE_IS_DIRECTORY */:
                        err.name = files_1.FileSystemProviderErrorCode.FileIsADirectory;
                        break;
                    case 6 /* FileOperationResult.FILE_PERMISSION_DENIED */:
                        err.name = files_1.FileSystemProviderErrorCode.NoPermissions;
                        break;
                    case 4 /* FileOperationResult.FILE_MOVE_CONFLICT */:
                        err.name = files_1.FileSystemProviderErrorCode.FileExists;
                        break;
                }
            }
            else if (err instanceof Error) {
                const code = (0, files_1.$ik)(err);
                if (code !== files_1.FileSystemProviderErrorCode.Unknown) {
                    err.name = code;
                }
            }
            throw err;
        }
        $ensureActivation(scheme) {
            return this.f.activateProvider(scheme);
        }
        async $watch(extensionId, session, resource, unvalidatedOpts) {
            const uri = uri_1.URI.revive(resource);
            const workspaceFolder = this.g.getWorkspaceFolder(uri);
            const opts = { ...unvalidatedOpts };
            // Convert a recursive watcher to a flat watcher if the path
            // turns out to not be a folder. Recursive watching is only
            // possible on folders, so we help all file watchers by checking
            // early.
            if (opts.recursive) {
                try {
                    const stat = await this.f.stat(uri);
                    if (!stat.isDirectory) {
                        opts.recursive = false;
                    }
                }
                catch (error) {
                    this.h.error(`MainThreadFileSystem#$watch(): failed to stat a resource for file watching (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session}): ${error}`);
                }
            }
            // Refuse to watch anything that is already watched via
            // our workspace watchers in case the request is a
            // recursive file watcher.
            // Still allow for non-recursive watch requests as a way
            // to bypass configured exclude rules though
            // (see https://github.com/microsoft/vscode/issues/146066)
            if (workspaceFolder && opts.recursive) {
                this.h.trace(`MainThreadFileSystem#$watch(): ignoring request to start watching because path is inside workspace (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session})`);
                return;
            }
            this.h.trace(`MainThreadFileSystem#$watch(): request to start watching (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session})`);
            // Automatically add `files.watcherExclude` patterns when watching
            // recursively to give users a chance to configure exclude rules
            // for reducing the overhead of watching recursively
            if (opts.recursive) {
                const config = this.i.getValue();
                if (config.files?.watcherExclude) {
                    for (const key in config.files.watcherExclude) {
                        if (config.files.watcherExclude[key] === true) {
                            opts.excludes.push(key);
                        }
                    }
                }
            }
            // Non-recursive watching inside the workspace will overlap with
            // our standard workspace watchers. To prevent duplicate events,
            // we only want to include events for files that are otherwise
            // excluded via `files.watcherExclude`. As such, we configure
            // to include each configured exclude pattern so that only those
            // events are reported that are otherwise excluded.
            // However, we cannot just use the pattern as is, because a pattern
            // such as `bar` for a exclude, will work to exclude any of
            // `<workspace path>/bar` but will not work as include for files within
            // `bar` unless a suffix of `/**` if added.
            // (https://github.com/microsoft/vscode/issues/148245)
            else if (workspaceFolder) {
                const config = this.i.getValue();
                if (config.files?.watcherExclude) {
                    for (const key in config.files.watcherExclude) {
                        if (config.files.watcherExclude[key] === true) {
                            if (!opts.includes) {
                                opts.includes = [];
                            }
                            const includePattern = `${(0, strings_1.$ve)(key, '/')}/${glob_1.$nj}`;
                            opts.includes.push((0, watcher_1.$Kp)(workspaceFolder.uri.fsPath, includePattern));
                        }
                    }
                }
                // Still ignore watch request if there are actually no configured
                // exclude rules, because in that case our default recursive watcher
                // should be able to take care of all events.
                if (!opts.includes || opts.includes.length === 0) {
                    this.h.trace(`MainThreadFileSystem#$watch(): ignoring request to start watching because path is inside workspace and no excludes are configured (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session})`);
                    return;
                }
            }
            const subscription = this.f.watch(uri, opts);
            this.d.set(session, subscription);
        }
        $unwatch(session) {
            if (this.d.has(session)) {
                this.h.trace(`MainThreadFileSystem#$unwatch(): request to stop watching (session: ${session})`);
                this.d.deleteAndDispose(session);
            }
        }
    };
    exports.$pkb = $pkb;
    exports.$pkb = $pkb = $pkb_1 = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadFileSystem),
        __param(1, files_2.$okb),
        __param(2, workspace_1.$Kh),
        __param(3, log_1.$5i),
        __param(4, configuration_1.$8h)
    ], $pkb);
    class RemoteFileSystemProvider {
        constructor(fileService, scheme, capabilities, readOnlyMessage, c, d) {
            this.readOnlyMessage = readOnlyMessage;
            this.c = c;
            this.d = d;
            this.a = new event_1.$fd();
            this.onDidChangeFile = this.a.event;
            this.onDidChangeCapabilities = event_1.Event.None;
            this.capabilities = capabilities;
            this.b = fileService.registerProvider(scheme, this);
        }
        dispose() {
            this.b.dispose();
            this.a.dispose();
        }
        watch(resource, opts) {
            const session = Math.random();
            this.d.$watch(this.c, session, resource, opts);
            return (0, lifecycle_1.$ic)(() => {
                this.d.$unwatch(this.c, session);
            });
        }
        $onFileSystemChange(changes) {
            this.a.fire(changes.map(RemoteFileSystemProvider.f));
        }
        static f(dto) {
            return { resource: uri_1.URI.revive(dto.resource), type: dto.type };
        }
        // --- forwarding calls
        stat(resource) {
            return this.d.$stat(this.c, resource).then(undefined, err => {
                throw err;
            });
        }
        readFile(resource) {
            return this.d.$readFile(this.c, resource).then(buffer => buffer.buffer);
        }
        writeFile(resource, content, opts) {
            return this.d.$writeFile(this.c, resource, buffer_1.$Fd.wrap(content), opts);
        }
        delete(resource, opts) {
            return this.d.$delete(this.c, resource, opts);
        }
        mkdir(resource) {
            return this.d.$mkdir(this.c, resource);
        }
        readdir(resource) {
            return this.d.$readdir(this.c, resource);
        }
        rename(resource, target, opts) {
            return this.d.$rename(this.c, resource, target, opts);
        }
        copy(resource, target, opts) {
            return this.d.$copy(this.c, resource, target, opts);
        }
        open(resource, opts) {
            return this.d.$open(this.c, resource, opts);
        }
        close(fd) {
            return this.d.$close(this.c, fd);
        }
        read(fd, pos, data, offset, length) {
            return this.d.$read(this.c, fd, pos, length).then(readData => {
                data.set(readData.buffer, offset);
                return readData.byteLength;
            });
        }
        write(fd, pos, data, offset, length) {
            return this.d.$write(this.c, fd, pos, buffer_1.$Fd.wrap(data).slice(offset, offset + length));
        }
    }
});
//# sourceMappingURL=mainThreadFileSystem.js.map