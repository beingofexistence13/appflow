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
    var $Abc_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Bbc = exports.$Abc = void 0;
    let $Abc = $Abc_1 = class $Abc {
        constructor(extHostRpc, fileSystemInfo) {
            this.b = new Map();
            this.c = new async_1.$Pg();
            this.a = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadFileSystem);
            const that = this;
            this.value = Object.freeze({
                async stat(uri) {
                    try {
                        let stat;
                        const provider = that.b.get(uri.scheme);
                        if (provider) {
                            // use shortcut
                            await that.a.$ensureActivation(uri.scheme);
                            stat = await provider.impl.stat(uri);
                        }
                        else {
                            stat = await that.a.$stat(uri);
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
                        $Abc_1.e(err);
                    }
                },
                async readDirectory(uri) {
                    try {
                        const provider = that.b.get(uri.scheme);
                        if (provider) {
                            // use shortcut
                            await that.a.$ensureActivation(uri.scheme);
                            return (await provider.impl.readDirectory(uri)).slice(); // safe-copy
                        }
                        else {
                            return await that.a.$readdir(uri);
                        }
                    }
                    catch (err) {
                        return $Abc_1.e(err);
                    }
                },
                async createDirectory(uri) {
                    try {
                        const provider = that.b.get(uri.scheme);
                        if (provider && !provider.isReadonly) {
                            // use shortcut
                            await that.a.$ensureActivation(uri.scheme);
                            return await that.d(provider.impl, provider.extUri, uri);
                        }
                        else {
                            return await that.a.$mkdir(uri);
                        }
                    }
                    catch (err) {
                        return $Abc_1.e(err);
                    }
                },
                async readFile(uri) {
                    try {
                        const provider = that.b.get(uri.scheme);
                        if (provider) {
                            // use shortcut
                            await that.a.$ensureActivation(uri.scheme);
                            return (await provider.impl.readFile(uri)).slice(); // safe-copy
                        }
                        else {
                            const buff = await that.a.$readFile(uri);
                            return buff.buffer;
                        }
                    }
                    catch (err) {
                        return $Abc_1.e(err);
                    }
                },
                async writeFile(uri, content) {
                    try {
                        const provider = that.b.get(uri.scheme);
                        if (provider && !provider.isReadonly) {
                            // use shortcut
                            await that.a.$ensureActivation(uri.scheme);
                            await that.d(provider.impl, provider.extUri, provider.extUri.dirname(uri));
                            return await that.c.queueFor(uri).queue(() => Promise.resolve(provider.impl.writeFile(uri, content, { create: true, overwrite: true })));
                        }
                        else {
                            return await that.a.$writeFile(uri, buffer_1.$Fd.wrap(content));
                        }
                    }
                    catch (err) {
                        return $Abc_1.e(err);
                    }
                },
                async delete(uri, options) {
                    try {
                        const provider = that.b.get(uri.scheme);
                        if (provider && !provider.isReadonly) {
                            // use shortcut
                            await that.a.$ensureActivation(uri.scheme);
                            return await provider.impl.delete(uri, { recursive: false, ...options });
                        }
                        else {
                            return await that.a.$delete(uri, { recursive: false, useTrash: false, atomic: false, ...options });
                        }
                    }
                    catch (err) {
                        return $Abc_1.e(err);
                    }
                },
                async rename(oldUri, newUri, options) {
                    try {
                        // no shortcut: potentially involves different schemes, does mkdirp
                        return await that.a.$rename(oldUri, newUri, { ...{ overwrite: false }, ...options });
                    }
                    catch (err) {
                        return $Abc_1.e(err);
                    }
                },
                async copy(source, destination, options) {
                    try {
                        // no shortcut: potentially involves different schemes, does mkdirp
                        return await that.a.$copy(source, destination, { ...{ overwrite: false }, ...options });
                    }
                    catch (err) {
                        return $Abc_1.e(err);
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
        async d(provider, providerExtUri, directory) {
            const directoriesToCreate = [];
            while (!providerExtUri.isEqual(directory, providerExtUri.dirname(directory))) {
                try {
                    const stat = await provider.stat(directory);
                    if ((stat.type & files.FileType.Directory) === 0) {
                        throw extHostTypes_1.$dL.FileExists(`Unable to create folder '${directory.scheme === network_1.Schemas.file ? directory.fsPath : directory.toString(true)}' that already exists but is not a directory`);
                    }
                    break; // we have hit a directory that exists -> good
                }
                catch (error) {
                    if (files.$ik(error) !== files.FileSystemProviderErrorCode.FileNotFound) {
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
                    if (files.$ik(error) !== files.FileSystemProviderErrorCode.FileExists) {
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
        static e(err) {
            // desired error type
            if (err instanceof extHostTypes_1.$dL) {
                throw err;
            }
            // file system provider error
            if (err instanceof files.$ek) {
                switch (err.code) {
                    case files.FileSystemProviderErrorCode.FileExists: throw extHostTypes_1.$dL.FileExists(err.message);
                    case files.FileSystemProviderErrorCode.FileNotFound: throw extHostTypes_1.$dL.FileNotFound(err.message);
                    case files.FileSystemProviderErrorCode.FileNotADirectory: throw extHostTypes_1.$dL.FileNotADirectory(err.message);
                    case files.FileSystemProviderErrorCode.FileIsADirectory: throw extHostTypes_1.$dL.FileIsADirectory(err.message);
                    case files.FileSystemProviderErrorCode.NoPermissions: throw extHostTypes_1.$dL.NoPermissions(err.message);
                    case files.FileSystemProviderErrorCode.Unavailable: throw extHostTypes_1.$dL.Unavailable(err.message);
                    default: throw new extHostTypes_1.$dL(err.message, err.name);
                }
            }
            // generic error
            if (!(err instanceof Error)) {
                throw new extHostTypes_1.$dL(String(err));
            }
            // no provider (unknown scheme) error
            if (err.name === 'ENOPRO' || err.message.includes('ENOPRO')) {
                throw extHostTypes_1.$dL.Unavailable(err.message);
            }
            // file system error
            switch (err.name) {
                case files.FileSystemProviderErrorCode.FileExists: throw extHostTypes_1.$dL.FileExists(err.message);
                case files.FileSystemProviderErrorCode.FileNotFound: throw extHostTypes_1.$dL.FileNotFound(err.message);
                case files.FileSystemProviderErrorCode.FileNotADirectory: throw extHostTypes_1.$dL.FileNotADirectory(err.message);
                case files.FileSystemProviderErrorCode.FileIsADirectory: throw extHostTypes_1.$dL.FileIsADirectory(err.message);
                case files.FileSystemProviderErrorCode.NoPermissions: throw extHostTypes_1.$dL.NoPermissions(err.message);
                case files.FileSystemProviderErrorCode.Unavailable: throw extHostTypes_1.$dL.Unavailable(err.message);
                default: throw new extHostTypes_1.$dL(err.message, err.name);
            }
        }
        // ---
        addFileSystemProvider(scheme, provider, options) {
            this.b.set(scheme, { impl: provider, extUri: options?.isCaseSensitive ? resources_1.$$f : resources_1.$ag, isReadonly: !!options?.isReadonly });
            return (0, lifecycle_1.$ic)(() => this.b.delete(scheme));
        }
        getFileSystemProviderExtUri(scheme) {
            return this.b.get(scheme)?.extUri ?? resources_1.$$f;
        }
    };
    exports.$Abc = $Abc;
    exports.$Abc = $Abc = $Abc_1 = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostFileSystemInfo_1.$9ac)
    ], $Abc);
    exports.$Bbc = (0, instantiation_1.$Bh)('IExtHostConsumerFileSystem');
});
//# sourceMappingURL=extHostFileSystemConsumer.js.map