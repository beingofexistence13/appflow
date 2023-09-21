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
define(["require", "exports", "./extHost.protocol", "vs/platform/files/common/files", "vs/workbench/api/common/extHostTypes", "vs/base/common/buffer", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostFileSystemInfo", "vs/base/common/lifecycle", "vs/base/common/async", "vs/base/common/resources", "vs/base/common/network"], function (require, exports, extHost_protocol_1, files, extHostTypes_1, buffer_1, instantiation_1, extHostRpcService_1, extHostFileSystemInfo_1, lifecycle_1, async_1, resources_1, network_1) {
    "use strict";
    var ExtHostConsumerFileSystem_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtHostConsumerFileSystem = exports.ExtHostConsumerFileSystem = void 0;
    let ExtHostConsumerFileSystem = ExtHostConsumerFileSystem_1 = class ExtHostConsumerFileSystem {
        constructor(extHostRpc, fileSystemInfo) {
            this._fileSystemProvider = new Map();
            this._writeQueue = new async_1.ResourceQueue();
            this._proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadFileSystem);
            const that = this;
            this.value = Object.freeze({
                async stat(uri) {
                    try {
                        let stat;
                        const provider = that._fileSystemProvider.get(uri.scheme);
                        if (provider) {
                            // use shortcut
                            await that._proxy.$ensureActivation(uri.scheme);
                            stat = await provider.impl.stat(uri);
                        }
                        else {
                            stat = await that._proxy.$stat(uri);
                        }
                        return {
                            type: stat.type,
                            ctime: stat.ctime,
                            mtime: stat.mtime,
                            size: stat.size,
                            permissions: stat.permissions === files.FilePermission.Readonly ? 1 : undefined
                        };
                    }
                    catch (err) {
                        ExtHostConsumerFileSystem_1._handleError(err);
                    }
                },
                async readDirectory(uri) {
                    try {
                        const provider = that._fileSystemProvider.get(uri.scheme);
                        if (provider) {
                            // use shortcut
                            await that._proxy.$ensureActivation(uri.scheme);
                            return (await provider.impl.readDirectory(uri)).slice(); // safe-copy
                        }
                        else {
                            return await that._proxy.$readdir(uri);
                        }
                    }
                    catch (err) {
                        return ExtHostConsumerFileSystem_1._handleError(err);
                    }
                },
                async createDirectory(uri) {
                    try {
                        const provider = that._fileSystemProvider.get(uri.scheme);
                        if (provider && !provider.isReadonly) {
                            // use shortcut
                            await that._proxy.$ensureActivation(uri.scheme);
                            return await that.mkdirp(provider.impl, provider.extUri, uri);
                        }
                        else {
                            return await that._proxy.$mkdir(uri);
                        }
                    }
                    catch (err) {
                        return ExtHostConsumerFileSystem_1._handleError(err);
                    }
                },
                async readFile(uri) {
                    try {
                        const provider = that._fileSystemProvider.get(uri.scheme);
                        if (provider) {
                            // use shortcut
                            await that._proxy.$ensureActivation(uri.scheme);
                            return (await provider.impl.readFile(uri)).slice(); // safe-copy
                        }
                        else {
                            const buff = await that._proxy.$readFile(uri);
                            return buff.buffer;
                        }
                    }
                    catch (err) {
                        return ExtHostConsumerFileSystem_1._handleError(err);
                    }
                },
                async writeFile(uri, content) {
                    try {
                        const provider = that._fileSystemProvider.get(uri.scheme);
                        if (provider && !provider.isReadonly) {
                            // use shortcut
                            await that._proxy.$ensureActivation(uri.scheme);
                            await that.mkdirp(provider.impl, provider.extUri, provider.extUri.dirname(uri));
                            return await that._writeQueue.queueFor(uri).queue(() => Promise.resolve(provider.impl.writeFile(uri, content, { create: true, overwrite: true })));
                        }
                        else {
                            return await that._proxy.$writeFile(uri, buffer_1.VSBuffer.wrap(content));
                        }
                    }
                    catch (err) {
                        return ExtHostConsumerFileSystem_1._handleError(err);
                    }
                },
                async delete(uri, options) {
                    try {
                        const provider = that._fileSystemProvider.get(uri.scheme);
                        if (provider && !provider.isReadonly) {
                            // use shortcut
                            await that._proxy.$ensureActivation(uri.scheme);
                            return await provider.impl.delete(uri, { recursive: false, ...options });
                        }
                        else {
                            return await that._proxy.$delete(uri, { recursive: false, useTrash: false, atomic: false, ...options });
                        }
                    }
                    catch (err) {
                        return ExtHostConsumerFileSystem_1._handleError(err);
                    }
                },
                async rename(oldUri, newUri, options) {
                    try {
                        // no shortcut: potentially involves different schemes, does mkdirp
                        return await that._proxy.$rename(oldUri, newUri, { ...{ overwrite: false }, ...options });
                    }
                    catch (err) {
                        return ExtHostConsumerFileSystem_1._handleError(err);
                    }
                },
                async copy(source, destination, options) {
                    try {
                        // no shortcut: potentially involves different schemes, does mkdirp
                        return await that._proxy.$copy(source, destination, { ...{ overwrite: false }, ...options });
                    }
                    catch (err) {
                        return ExtHostConsumerFileSystem_1._handleError(err);
                    }
                },
                isWritableFileSystem(scheme) {
                    const capabilities = fileSystemInfo.getCapabilities(scheme);
                    if (typeof capabilities === 'number') {
                        return !(capabilities & 2048 /* files.FileSystemProviderCapabilities.Readonly */);
                    }
                    return undefined;
                }
            });
        }
        async mkdirp(provider, providerExtUri, directory) {
            const directoriesToCreate = [];
            while (!providerExtUri.isEqual(directory, providerExtUri.dirname(directory))) {
                try {
                    const stat = await provider.stat(directory);
                    if ((stat.type & files.FileType.Directory) === 0) {
                        throw extHostTypes_1.FileSystemError.FileExists(`Unable to create folder '${directory.scheme === network_1.Schemas.file ? directory.fsPath : directory.toString(true)}' that already exists but is not a directory`);
                    }
                    break; // we have hit a directory that exists -> good
                }
                catch (error) {
                    if (files.toFileSystemProviderErrorCode(error) !== files.FileSystemProviderErrorCode.FileNotFound) {
                        throw error;
                    }
                    // further go up and remember to create this directory
                    directoriesToCreate.push(providerExtUri.basename(directory));
                    directory = providerExtUri.dirname(directory);
                }
            }
            for (let i = directoriesToCreate.length - 1; i >= 0; i--) {
                directory = providerExtUri.joinPath(directory, directoriesToCreate[i]);
                try {
                    await provider.createDirectory(directory);
                }
                catch (error) {
                    if (files.toFileSystemProviderErrorCode(error) !== files.FileSystemProviderErrorCode.FileExists) {
                        // For mkdirp() we tolerate that the mkdir() call fails
                        // in case the folder already exists. This follows node.js
                        // own implementation of fs.mkdir({ recursive: true }) and
                        // reduces the chances of race conditions leading to errors
                        // if multiple calls try to create the same folders
                        // As such, we only throw an error here if it is other than
                        // the fact that the file already exists.
                        // (see also https://github.com/microsoft/vscode/issues/89834)
                        throw error;
                    }
                }
            }
        }
        static _handleError(err) {
            // desired error type
            if (err instanceof extHostTypes_1.FileSystemError) {
                throw err;
            }
            // file system provider error
            if (err instanceof files.FileSystemProviderError) {
                switch (err.code) {
                    case files.FileSystemProviderErrorCode.FileExists: throw extHostTypes_1.FileSystemError.FileExists(err.message);
                    case files.FileSystemProviderErrorCode.FileNotFound: throw extHostTypes_1.FileSystemError.FileNotFound(err.message);
                    case files.FileSystemProviderErrorCode.FileNotADirectory: throw extHostTypes_1.FileSystemError.FileNotADirectory(err.message);
                    case files.FileSystemProviderErrorCode.FileIsADirectory: throw extHostTypes_1.FileSystemError.FileIsADirectory(err.message);
                    case files.FileSystemProviderErrorCode.NoPermissions: throw extHostTypes_1.FileSystemError.NoPermissions(err.message);
                    case files.FileSystemProviderErrorCode.Unavailable: throw extHostTypes_1.FileSystemError.Unavailable(err.message);
                    default: throw new extHostTypes_1.FileSystemError(err.message, err.name);
                }
            }
            // generic error
            if (!(err instanceof Error)) {
                throw new extHostTypes_1.FileSystemError(String(err));
            }
            // no provider (unknown scheme) error
            if (err.name === 'ENOPRO' || err.message.includes('ENOPRO')) {
                throw extHostTypes_1.FileSystemError.Unavailable(err.message);
            }
            // file system error
            switch (err.name) {
                case files.FileSystemProviderErrorCode.FileExists: throw extHostTypes_1.FileSystemError.FileExists(err.message);
                case files.FileSystemProviderErrorCode.FileNotFound: throw extHostTypes_1.FileSystemError.FileNotFound(err.message);
                case files.FileSystemProviderErrorCode.FileNotADirectory: throw extHostTypes_1.FileSystemError.FileNotADirectory(err.message);
                case files.FileSystemProviderErrorCode.FileIsADirectory: throw extHostTypes_1.FileSystemError.FileIsADirectory(err.message);
                case files.FileSystemProviderErrorCode.NoPermissions: throw extHostTypes_1.FileSystemError.NoPermissions(err.message);
                case files.FileSystemProviderErrorCode.Unavailable: throw extHostTypes_1.FileSystemError.Unavailable(err.message);
                default: throw new extHostTypes_1.FileSystemError(err.message, err.name);
            }
        }
        // ---
        addFileSystemProvider(scheme, provider, options) {
            this._fileSystemProvider.set(scheme, { impl: provider, extUri: options?.isCaseSensitive ? resources_1.extUri : resources_1.extUriIgnorePathCase, isReadonly: !!options?.isReadonly });
            return (0, lifecycle_1.toDisposable)(() => this._fileSystemProvider.delete(scheme));
        }
        getFileSystemProviderExtUri(scheme) {
            return this._fileSystemProvider.get(scheme)?.extUri ?? resources_1.extUri;
        }
    };
    exports.ExtHostConsumerFileSystem = ExtHostConsumerFileSystem;
    exports.ExtHostConsumerFileSystem = ExtHostConsumerFileSystem = ExtHostConsumerFileSystem_1 = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostFileSystemInfo_1.IExtHostFileSystemInfo)
    ], ExtHostConsumerFileSystem);
    exports.IExtHostConsumerFileSystem = (0, instantiation_1.createDecorator)('IExtHostConsumerFileSystem');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEZpbGVTeXN0ZW1Db25zdW1lci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RGaWxlU3lzdGVtQ29uc3VtZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWdCekYsSUFBTSx5QkFBeUIsaUNBQS9CLE1BQU0seUJBQXlCO1FBV3JDLFlBQ3FCLFVBQThCLEVBQzFCLGNBQXNDO1lBTjlDLHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUFxRixDQUFDO1lBRW5ILGdCQUFXLEdBQUcsSUFBSSxxQkFBYSxFQUFFLENBQUM7WUFNbEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLDhCQUFXLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNwRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7WUFFbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUMxQixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQWU7b0JBQ3pCLElBQUk7d0JBQ0gsSUFBSSxJQUFJLENBQUM7d0JBRVQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQzFELElBQUksUUFBUSxFQUFFOzRCQUNiLGVBQWU7NEJBQ2YsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDaEQsSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7eUJBQ3JDOzZCQUFNOzRCQUNOLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFD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