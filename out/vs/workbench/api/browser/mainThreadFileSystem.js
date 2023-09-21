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
    var MainThreadFileSystem_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadFileSystem = void 0;
    let MainThreadFileSystem = MainThreadFileSystem_1 = class MainThreadFileSystem {
        constructor(extHostContext, _fileService, _contextService, _logService, _configurationService) {
            this._fileService = _fileService;
            this._contextService = _contextService;
            this._logService = _logService;
            this._configurationService = _configurationService;
            this._fileProvider = new lifecycle_1.DisposableMap();
            this._disposables = new lifecycle_1.DisposableStore();
            this._watches = new lifecycle_1.DisposableMap();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostFileSystem);
            const infoProxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostFileSystemInfo);
            for (const entry of _fileService.listCapabilities()) {
                infoProxy.$acceptProviderInfos(uri_1.URI.from({ scheme: entry.scheme, path: '/dummy' }), entry.capabilities);
            }
            this._disposables.add(_fileService.onDidChangeFileSystemProviderRegistrations(e => infoProxy.$acceptProviderInfos(uri_1.URI.from({ scheme: e.scheme, path: '/dummy' }), e.provider?.capabilities ?? null)));
            this._disposables.add(_fileService.onDidChangeFileSystemProviderCapabilities(e => infoProxy.$acceptProviderInfos(uri_1.URI.from({ scheme: e.scheme, path: '/dummy' }), e.provider.capabilities)));
        }
        dispose() {
            this._disposables.dispose();
            this._fileProvider.dispose();
            this._watches.dispose();
        }
        async $registerFileSystemProvider(handle, scheme, capabilities, readonlyMessage) {
            this._fileProvider.set(handle, new RemoteFileSystemProvider(this._fileService, scheme, capabilities, readonlyMessage, handle, this._proxy));
        }
        $unregisterProvider(handle) {
            this._fileProvider.deleteAndDispose(handle);
        }
        $onFileSystemChange(handle, changes) {
            const fileProvider = this._fileProvider.get(handle);
            if (!fileProvider) {
                throw new Error('Unknown file provider');
            }
            fileProvider.$onFileSystemChange(changes);
        }
        // --- consumer fs, vscode.workspace.fs
        $stat(uri) {
            return this._fileService.stat(uri_1.URI.revive(uri)).then(stat => {
                return {
                    ctime: stat.ctime,
                    mtime: stat.mtime,
                    size: stat.size,
                    permissions: stat.readonly ? files_1.FilePermission.Readonly : undefined,
                    type: MainThreadFileSystem_1._asFileType(stat)
                };
            }).catch(MainThreadFileSystem_1._handleError);
        }
        $readdir(uri) {
            return this._fileService.resolve(uri_1.URI.revive(uri), { resolveMetadata: false }).then(stat => {
                if (!stat.isDirectory) {
                    const err = new Error(stat.name);
                    err.name = files_1.FileSystemProviderErrorCode.FileNotADirectory;
                    throw err;
                }
                return !stat.children ? [] : stat.children.map(child => [child.name, MainThreadFileSystem_1._asFileType(child)]);
            }).catch(MainThreadFileSystem_1._handleError);
        }
        static _asFileType(stat) {
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
            return this._fileService.readFile(uri_1.URI.revive(uri)).then(file => file.value).catch(MainThreadFileSystem_1._handleError);
        }
        $writeFile(uri, content) {
            return this._fileService.writeFile(uri_1.URI.revive(uri), content)
                .then(() => undefined).catch(MainThreadFileSystem_1._handleError);
        }
        $rename(source, target, opts) {
            return this._fileService.move(uri_1.URI.revive(source), uri_1.URI.revive(target), opts.overwrite)
                .then(() => undefined).catch(MainThreadFileSystem_1._handleError);
        }
        $copy(source, target, opts) {
            return this._fileService.copy(uri_1.URI.revive(source), uri_1.URI.revive(target), opts.overwrite)
                .then(() => undefined).catch(MainThreadFileSystem_1._handleError);
        }
        $mkdir(uri) {
            return this._fileService.createFolder(uri_1.URI.revive(uri))
                .then(() => undefined).catch(MainThreadFileSystem_1._handleError);
        }
        $delete(uri, opts) {
            return this._fileService.del(uri_1.URI.revive(uri), opts).catch(MainThreadFileSystem_1._handleError);
        }
        static _handleError(err) {
            if (err instanceof files_1.FileOperationError) {
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
                const code = (0, files_1.toFileSystemProviderErrorCode)(err);
                if (code !== files_1.FileSystemProviderErrorCode.Unknown) {
                    err.name = code;
                }
            }
            throw err;
        }
        $ensureActivation(scheme) {
            return this._fileService.activateProvider(scheme);
        }
        async $watch(extensionId, session, resource, unvalidatedOpts) {
            const uri = uri_1.URI.revive(resource);
            const workspaceFolder = this._contextService.getWorkspaceFolder(uri);
            const opts = { ...unvalidatedOpts };
            // Convert a recursive watcher to a flat watcher if the path
            // turns out to not be a folder. Recursive watching is only
            // possible on folders, so we help all file watchers by checking
            // early.
            if (opts.recursive) {
                try {
                    const stat = await this._fileService.stat(uri);
                    if (!stat.isDirectory) {
                        opts.recursive = false;
                    }
                }
                catch (error) {
                    this._logService.error(`MainThreadFileSystem#$watch(): failed to stat a resource for file watching (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session}): ${error}`);
                }
            }
            // Refuse to watch anything that is already watched via
            // our workspace watchers in case the request is a
            // recursive file watcher.
            // Still allow for non-recursive watch requests as a way
            // to bypass configured exclude rules though
            // (see https://github.com/microsoft/vscode/issues/146066)
            if (workspaceFolder && opts.recursive) {
                this._logService.trace(`MainThreadFileSystem#$watch(): ignoring request to start watching because path is inside workspace (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session})`);
                return;
            }
            this._logService.trace(`MainThreadFileSystem#$watch(): request to start watching (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session})`);
            // Automatically add `files.watcherExclude` patterns when watching
            // recursively to give users a chance to configure exclude rules
            // for reducing the overhead of watching recursively
            if (opts.recursive) {
                const config = this._configurationService.getValue();
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
                const config = this._configurationService.getValue();
                if (config.files?.watcherExclude) {
                    for (const key in config.files.watcherExclude) {
                        if (config.files.watcherExclude[key] === true) {
                            if (!opts.includes) {
                                opts.includes = [];
                            }
                            const includePattern = `${(0, strings_1.rtrim)(key, '/')}/${glob_1.GLOBSTAR}`;
                            opts.includes.push((0, watcher_1.normalizeWatcherPattern)(workspaceFolder.uri.fsPath, includePattern));
                        }
                    }
                }
                // Still ignore watch request if there are actually no configured
                // exclude rules, because in that case our default recursive watcher
                // should be able to take care of all events.
                if (!opts.includes || opts.includes.length === 0) {
                    this._logService.trace(`MainThreadFileSystem#$watch(): ignoring request to start watching because path is inside workspace and no excludes are configured (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session})`);
                    return;
                }
            }
            const subscription = this._fileService.watch(uri, opts);
            this._watches.set(session, subscription);
        }
        $unwatch(session) {
            if (this._watches.has(session)) {
                this._logService.trace(`MainThreadFileSystem#$unwatch(): request to stop watching (session: ${session})`);
                this._watches.deleteAndDispose(session);
            }
        }
    };
    exports.MainThreadFileSystem = MainThreadFileSystem;
    exports.MainThreadFileSystem = MainThreadFileSystem = MainThreadFileSystem_1 = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadFileSystem),
        __param(1, files_2.IWorkbenchFileService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, log_1.ILogService),
        __param(4, configuration_1.IConfigurationService)
    ], MainThreadFileSystem);
    class RemoteFileSystemProvider {
        constructor(fileService, scheme, capabilities, readOnlyMessage, _handle, _proxy) {
            this.readOnlyMessage = readOnlyMessage;
            this._handle = _handle;
            this._proxy = _proxy;
            this._onDidChange = new event_1.Emitter();
            this.onDidChangeFile = this._onDidChange.event;
            this.onDidChangeCapabilities = event_1.Event.None;
            this.capabilities = capabilities;
            this._registration = fileService.registerProvider(scheme, this);
        }
        dispose() {
            this._registration.dispose();
            this._onDidChange.dispose();
        }
        watch(resource, opts) {
            const session = Math.random();
            this._proxy.$watch(this._handle, session, resource, opts);
            return (0, lifecycle_1.toDisposable)(() => {
                this._proxy.$unwatch(this._handle, session);
            });
        }
        $onFileSystemChange(changes) {
            this._onDidChange.fire(changes.map(RemoteFileSystemProvider._createFileChange));
        }
        static _createFileChange(dto) {
            return { resource: uri_1.URI.revive(dto.resource), type: dto.type };
        }
        // --- forwarding calls
        stat(resource) {
            return this._proxy.$stat(this._handle, resource).then(undefined, err => {
                throw err;
            });
        }
        readFile(resource) {
            return this._proxy.$readFile(this._handle, resource).then(buffer => buffer.buffer);
        }
        writeFile(resource, content, opts) {
            return this._proxy.$writeFile(this._handle, resource, buffer_1.VSBuffer.wrap(content), opts);
        }
        delete(resource, opts) {
            return this._proxy.$delete(this._handle, resource, opts);
        }
        mkdir(resource) {
            return this._proxy.$mkdir(this._handle, resource);
        }
        readdir(resource) {
            return this._proxy.$readdir(this._handle, resource);
        }
        rename(resource, target, opts) {
            return this._proxy.$rename(this._handle, resource, target, opts);
        }
        copy(resource, target, opts) {
            return this._proxy.$copy(this._handle, resource, target, opts);
        }
        open(resource, opts) {
            return this._proxy.$open(this._handle, resource, opts);
        }
        close(fd) {
            return this._proxy.$close(this._handle, fd);
        }
        read(fd, pos, data, offset, length) {
            return this._proxy.$read(this._handle, fd, pos, length).then(readData => {
                data.set(readData.buffer, offset);
                return readData.byteLength;
            });
        }
        write(fd, pos, data, offset, length) {
            return this._proxy.$write(this._handle, fd, pos, buffer_1.VSBuffer.wrap(data).slice(offset, offset + length));
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEZpbGVTeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZEZpbGVTeXN0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW1CekYsSUFBTSxvQkFBb0IsNEJBQTFCLE1BQU0sb0JBQW9CO1FBT2hDLFlBQ0MsY0FBK0IsRUFDUixZQUFvRCxFQUNqRCxlQUEwRCxFQUN2RSxXQUF5QyxFQUMvQixxQkFBNkQ7WUFINUMsaUJBQVksR0FBWixZQUFZLENBQXVCO1lBQ2hDLG9CQUFlLEdBQWYsZUFBZSxDQUEwQjtZQUN0RCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUNkLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFUcEUsa0JBQWEsR0FBRyxJQUFJLHlCQUFhLEVBQW9DLENBQUM7WUFDdEUsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNyQyxhQUFRLEdBQUcsSUFBSSx5QkFBYSxFQUFVLENBQUM7WUFTdkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUV4RSxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUVoRixLQUFLLE1BQU0sS0FBSyxJQUFJLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO2dCQUNwRCxTQUFTLENBQUMsb0JBQW9CLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUN2RztZQUNELElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxZQUFZLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RNLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0wsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBRUQsS0FBSyxDQUFDLDJCQUEyQixDQUFDLE1BQWMsRUFBRSxNQUFjLEVBQUUsWUFBNEMsRUFBRSxlQUFpQztZQUNoSixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM3SSxDQUFDO1FBRUQsbUJBQW1CLENBQUMsTUFBYztZQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFFRCxtQkFBbUIsQ0FBQyxNQUFjLEVBQUUsT0FBeUI7WUFDNUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2FBQ3pDO1lBQ0QsWUFBWSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFHRCx1Q0FBdUM7UUFFdkMsS0FBSyxDQUFDLEdBQWtCO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDMUQsT0FBTztvQkFDTixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7b0JBQ2pCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztvQkFDakIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO29CQUNmLFdBQVcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxzQkFBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUztvQkFDaEUsSUFBSSxFQUFFLHNCQUFvQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7aUJBQzVDLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsc0JBQW9CLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELFFBQVEsQ0FBQyxHQUFrQjtZQUMxQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3pGLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUN0QixNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2pDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsbUNBQTJCLENBQUMsaUJBQWlCLENBQUM7b0JBQ3pELE1BQU0sR0FBRyxDQUFDO2lCQUNWO2dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLHNCQUFvQixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBdUIsQ0FBQyxDQUFDO1lBQ3RJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxzQkFBb0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRU8sTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUE4QztZQUN4RSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDWixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hCLEdBQUcsSUFBSSxnQkFBUSxDQUFDLElBQUksQ0FBQzthQUVyQjtpQkFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQzVCLEdBQUcsSUFBSSxnQkFBUSxDQUFDLFNBQVMsQ0FBQzthQUMxQjtZQUNELElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDeEIsR0FBRyxJQUFJLGdCQUFRLENBQUMsWUFBWSxDQUFDO2FBQzdCO1lBQ0QsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDO1FBRUQsU0FBUyxDQUFDLEdBQWtCO1lBQzNCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsc0JBQW9CLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdEgsQ0FBQztRQUVELFVBQVUsQ0FBQyxHQUFrQixFQUFFLE9BQWlCO1lBQy9DLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUM7aUJBQzFELElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsc0JBQW9CLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUVELE9BQU8sQ0FBQyxNQUFxQixFQUFFLE1BQXFCLEVBQUUsSUFBMkI7WUFDaEYsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztpQkFDbkYsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxzQkFBb0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRUQsS0FBSyxDQUFDLE1BQXFCLEVBQUUsTUFBcUIsRUFBRSxJQUEyQjtZQUM5RSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2lCQUNuRixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLHNCQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFRCxNQUFNLENBQUMsR0FBa0I7WUFDeEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNwRCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLHNCQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFRCxPQUFPLENBQUMsR0FBa0IsRUFBRSxJQUF3QjtZQUNuRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLHNCQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFFTyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQVE7WUFDbkMsSUFBSSxHQUFHLFlBQVksMEJBQWtCLEVBQUU7Z0JBQ3RDLFFBQVEsR0FBRyxDQUFDLG1CQUFtQixFQUFFO29CQUNoQzt3QkFDQyxHQUFHLENBQUMsSUFBSSxHQUFHLG1DQUEyQixDQUFDLFlBQVksQ0FBQzt3QkFDcEQsTUFBTTtvQkFDUDt3QkFDQyxHQUFHLENBQUMsSUFBSSxHQUFHLG1DQUEyQixDQUFDLGdCQUFnQixDQUFDO3dCQUN4RCxNQUFNO29CQUNQO3dCQUNDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsbUNBQTJCLENBQUMsYUFBYSxDQUFDO3dCQUNyRCxNQUFNO29CQUNQO3dCQUNDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsbUNBQTJCLENBQUMsVUFBVSxDQUFDO3dCQUNsRCxNQUFNO2lCQUNQO2FBQ0Q7aUJBQU0sSUFBSSxHQUFHLFlBQVksS0FBSyxFQUFFO2dCQUNoQyxNQUFNLElBQUksR0FBRyxJQUFBLHFDQUE2QixFQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLElBQUksS0FBSyxtQ0FBMkIsQ0FBQyxPQUFPLEVBQUU7b0JBQ2pELEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2lCQUNoQjthQUNEO1lBRUQsTUFBTSxHQUFHLENBQUM7UUFDWCxDQUFDO1FBRUQsaUJBQWlCLENBQUMsTUFBYztZQUMvQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBbUIsRUFBRSxPQUFlLEVBQUUsUUFBdUIsRUFBRSxlQUE4QjtZQUN6RyxNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFckUsTUFBTSxJQUFJLEdBQUcsRUFBRSxHQUFHLGVBQWUsRUFBRSxDQUFDO1lBRXBDLDREQUE0RDtZQUM1RCwyREFBMkQ7WUFDM0QsZ0VBQWdFO1lBQ2hFLFNBQVM7WUFDVCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ25CLElBQUk7b0JBQ0gsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7d0JBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO3FCQUN2QjtpQkFDRDtnQkFBQyxPQUFPLEtBQUssRUFBRTtvQkFDZixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQywwRkFBMEYsV0FBVyxXQUFXLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsU0FBUyxjQUFjLE9BQU8sTUFBTSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2lCQUMzTjthQUNEO1lBRUQsdURBQXVEO1lBQ3ZELGtEQUFrRDtZQUNsRCwwQkFBMEI7WUFDMUIsd0RBQXdEO1lBQ3hELDRDQUE0QztZQUM1QywwREFBMEQ7WUFDMUQsSUFBSSxlQUFlLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsa0hBQWtILFdBQVcsV0FBVyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLFNBQVMsY0FBYyxPQUFPLEdBQUcsQ0FBQyxDQUFDO2dCQUN6TyxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyx3RUFBd0UsV0FBVyxXQUFXLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsU0FBUyxjQUFjLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFFL0wsa0VBQWtFO1lBQ2xFLGdFQUFnRTtZQUNoRSxvREFBb0Q7WUFDcEQsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNuQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxFQUF1QixDQUFDO2dCQUMxRSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFO29CQUNqQyxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFO3dCQUM5QyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksRUFBRTs0QkFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7eUJBQ3hCO3FCQUNEO2lCQUNEO2FBQ0Q7WUFFRCxnRUFBZ0U7WUFDaEUsZ0VBQWdFO1lBQ2hFLDhEQUE4RDtZQUM5RCw2REFBNkQ7WUFDN0QsZ0VBQWdFO1lBQ2hFLG1EQUFtRDtZQUNuRCxtRUFBbUU7WUFDbkUsMkRBQTJEO1lBQzNELHVFQUF1RTtZQUN2RSwyQ0FBMkM7WUFDM0Msc0RBQXNEO2lCQUNqRCxJQUFJLGVBQWUsRUFBRTtnQkFDekIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBdUIsQ0FBQztnQkFDMUUsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRTtvQkFDakMsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRTt3QkFDOUMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLEVBQUU7NEJBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO2dDQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQzs2QkFDbkI7NEJBRUQsTUFBTSxjQUFjLEdBQUcsR0FBRyxJQUFBLGVBQUssRUFBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksZUFBUSxFQUFFLENBQUM7NEJBQ3hELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUEsaUNBQXVCLEVBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQzt5QkFDeEY7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsaUVBQWlFO2dCQUNqRSxvRUFBb0U7Z0JBQ3BFLDZDQUE2QztnQkFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNqRCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxpSkFBaUosV0FBVyxXQUFXLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsU0FBUyxjQUFjLE9BQU8sR0FBRyxDQUFDLENBQUM7b0JBQ3hRLE9BQU87aUJBQ1A7YUFDRDtZQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVELFFBQVEsQ0FBQyxPQUFlO1lBQ3ZCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLHVFQUF1RSxPQUFPLEdBQUcsQ0FBQyxDQUFDO2dCQUMxRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3hDO1FBQ0YsQ0FBQztLQUNELENBQUE7SUE5T1ksb0RBQW9CO21DQUFwQixvQkFBb0I7UUFEaEMsSUFBQSx1Q0FBb0IsRUFBQyw4QkFBVyxDQUFDLG9CQUFvQixDQUFDO1FBVXBELFdBQUEsNkJBQXFCLENBQUE7UUFDckIsV0FBQSxvQ0FBd0IsQ0FBQTtRQUN4QixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLHFDQUFxQixDQUFBO09BWlgsb0JBQW9CLENBOE9oQztJQUVELE1BQU0sd0JBQXdCO1FBVTdCLFlBQ0MsV0FBeUIsRUFDekIsTUFBYyxFQUNkLFlBQTRDLEVBQzVCLGVBQTRDLEVBQzNDLE9BQWUsRUFDZixNQUE4QjtZQUYvQixvQkFBZSxHQUFmLGVBQWUsQ0FBNkI7WUFDM0MsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUNmLFdBQU0sR0FBTixNQUFNLENBQXdCO1lBZC9CLGlCQUFZLEdBQUcsSUFBSSxlQUFPLEVBQTBCLENBQUM7WUFHN0Qsb0JBQWUsR0FBa0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFHekUsNEJBQXVCLEdBQWdCLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFVMUQsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7WUFDakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFRCxLQUFLLENBQUMsUUFBYSxFQUFFLElBQW1CO1lBQ3ZDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUQsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzdDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELG1CQUFtQixDQUFDLE9BQXlCO1lBQzVDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7UUFFTyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBbUI7WUFDbkQsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQy9ELENBQUM7UUFFRCx1QkFBdUI7UUFFdkIsSUFBSSxDQUFDLFFBQWE7WUFDakIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ3RFLE1BQU0sR0FBRyxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsUUFBUSxDQUFDLFFBQWE7WUFDckIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBRUQsU0FBUyxDQUFDLFFBQWEsRUFBRSxPQUFtQixFQUFFLElBQXVCO1lBQ3BFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsaUJBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFhLEVBQUUsSUFBd0I7WUFDN0MsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsS0FBSyxDQUFDLFFBQWE7WUFDbEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxPQUFPLENBQUMsUUFBYTtZQUNwQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFhLEVBQUUsTUFBVyxFQUFFLElBQTJCO1lBQzdELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFRCxJQUFJLENBQUMsUUFBYSxFQUFFLE1BQVcsRUFBRSxJQUEyQjtZQUMzRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRUQsSUFBSSxDQUFDLFFBQWEsRUFBRSxJQUFzQjtZQUN6QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxLQUFLLENBQUMsRUFBVTtZQUNmLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQsSUFBSSxDQUFDLEVBQVUsRUFBRSxHQUFXLEVBQUUsSUFBZ0IsRUFBRSxNQUFjLEVBQUUsTUFBYztZQUM3RSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3ZFLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDbEMsT0FBTyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxFQUFVLEVBQUUsR0FBVyxFQUFFLElBQWdCLEVBQUUsTUFBYyxFQUFFLE1BQWM7WUFDOUUsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsaUJBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN0RyxDQUFDO0tBQ0QifQ==