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
define(["require", "exports", "vs/workbench/api/common/extHostFileSystemConsumer", "vs/base/common/network", "vs/platform/log/common/log", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/files/common/files", "vs/base/common/platform"], function (require, exports, extHostFileSystemConsumer_1, network_1, log_1, diskFileSystemProvider_1, files_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Odc = void 0;
    let $Odc = class $Odc {
        constructor(extHostConsumerFileSystem, logService) {
            // Register disk file system provider so that certain
            // file operations can execute fast within the extension
            // host without roundtripping.
            extHostConsumerFileSystem.addFileSystemProvider(network_1.Schemas.file, new DiskFileSystemProviderAdapter(logService), { isCaseSensitive: platform_1.$k });
        }
    };
    exports.$Odc = $Odc;
    exports.$Odc = $Odc = __decorate([
        __param(0, extHostFileSystemConsumer_1.$Bbc),
        __param(1, log_1.$5i)
    ], $Odc);
    class DiskFileSystemProviderAdapter {
        constructor(b) {
            this.b = b;
            this.a = new diskFileSystemProvider_1.$3p(this.b);
        }
        async stat(uri) {
            const stat = await this.a.stat(uri);
            return {
                type: stat.type,
                ctime: stat.ctime,
                mtime: stat.mtime,
                size: stat.size,
                permissions: stat.permissions === files_1.FilePermission.Readonly ? 1 : undefined
            };
        }
        readDirectory(uri) {
            return this.a.readdir(uri);
        }
        createDirectory(uri) {
            return this.a.mkdir(uri);
        }
        readFile(uri) {
            return this.a.readFile(uri);
        }
        writeFile(uri, content, options) {
            return this.a.writeFile(uri, content, { ...options, unlock: false, atomic: false });
        }
        delete(uri, options) {
            return this.a.delete(uri, { ...options, useTrash: false, atomic: false });
        }
        rename(oldUri, newUri, options) {
            return this.a.rename(oldUri, newUri, options);
        }
        copy(source, destination, options) {
            return this.a.copy(source, destination, options);
        }
        // --- Not Implemented ---
        get onDidChangeFile() { throw new Error('Method not implemented.'); }
        watch(uri, options) { throw new Error('Method not implemented.'); }
    }
});
//# sourceMappingURL=extHostDiskFileSystemProvider.js.map