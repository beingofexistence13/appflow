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
    exports.ExtHostDiskFileSystemProvider = void 0;
    let ExtHostDiskFileSystemProvider = class ExtHostDiskFileSystemProvider {
        constructor(extHostConsumerFileSystem, logService) {
            // Register disk file system provider so that certain
            // file operations can execute fast within the extension
            // host without roundtripping.
            extHostConsumerFileSystem.addFileSystemProvider(network_1.Schemas.file, new DiskFileSystemProviderAdapter(logService), { isCaseSensitive: platform_1.isLinux });
        }
    };
    exports.ExtHostDiskFileSystemProvider = ExtHostDiskFileSystemProvider;
    exports.ExtHostDiskFileSystemProvider = ExtHostDiskFileSystemProvider = __decorate([
        __param(0, extHostFileSystemConsumer_1.IExtHostConsumerFileSystem),
        __param(1, log_1.ILogService)
    ], ExtHostDiskFileSystemProvider);
    class DiskFileSystemProviderAdapter {
        constructor(logService) {
            this.logService = logService;
            this.impl = new diskFileSystemProvider_1.DiskFileSystemProvider(this.logService);
        }
        async stat(uri) {
            const stat = await this.impl.stat(uri);
            return {
                type: stat.type,
                ctime: stat.ctime,
                mtime: stat.mtime,
                size: stat.size,
                permissions: stat.permissions === files_1.FilePermission.Readonly ? 1 : undefined
            };
        }
        readDirectory(uri) {
            return this.impl.readdir(uri);
        }
        createDirectory(uri) {
            return this.impl.mkdir(uri);
        }
        readFile(uri) {
            return this.impl.readFile(uri);
        }
        writeFile(uri, content, options) {
            return this.impl.writeFile(uri, content, { ...options, unlock: false, atomic: false });
        }
        delete(uri, options) {
            return this.impl.delete(uri, { ...options, useTrash: false, atomic: false });
        }
        rename(oldUri, newUri, options) {
            return this.impl.rename(oldUri, newUri, options);
        }
        copy(source, destination, options) {
            return this.impl.copy(source, destination, options);
        }
        // --- Not Implemented ---
        get onDidChangeFile() { throw new Error('Method not implemented.'); }
        watch(uri, options) { throw new Error('Method not implemented.'); }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERpc2tGaWxlU3lzdGVtUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL25vZGUvZXh0SG9zdERpc2tGaWxlU3lzdGVtUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBVXpGLElBQU0sNkJBQTZCLEdBQW5DLE1BQU0sNkJBQTZCO1FBRXpDLFlBQzZCLHlCQUFxRCxFQUNwRSxVQUF1QjtZQUdwQyxxREFBcUQ7WUFDckQsd0RBQXdEO1lBQ3hELDhCQUE4QjtZQUM5Qix5QkFBeUIsQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBTyxDQUFDLElBQUksRUFBRSxJQUFJLDZCQUE2QixDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLGtCQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzVJLENBQUM7S0FDRCxDQUFBO0lBWlksc0VBQTZCOzRDQUE3Qiw2QkFBNkI7UUFHdkMsV0FBQSxzREFBMEIsQ0FBQTtRQUMxQixXQUFBLGlCQUFXLENBQUE7T0FKRCw2QkFBNkIsQ0FZekM7SUFFRCxNQUFNLDZCQUE2QjtRQUlsQyxZQUE2QixVQUF1QjtZQUF2QixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBRm5DLFNBQUksR0FBRyxJQUFJLCtDQUFzQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVaLENBQUM7UUFFekQsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFlO1lBQ3pCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFdkMsT0FBTztnQkFDTixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ2YsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNqQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7Z0JBQ2pCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsS0FBSyxzQkFBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2FBQ3pFLENBQUM7UUFDSCxDQUFDO1FBRUQsYUFBYSxDQUFDLEdBQWU7WUFDNUIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQsZUFBZSxDQUFDLEdBQWU7WUFDOUIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRUQsUUFBUSxDQUFDLEdBQWU7WUFDdkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRUQsU0FBUyxDQUFDLEdBQWUsRUFBRSxPQUFtQixFQUFFLE9BQWtFO1lBQ2pILE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFLEdBQUcsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDeEYsQ0FBQztRQUVELE1BQU0sQ0FBQyxHQUFlLEVBQUUsT0FBd0M7WUFDL0QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFRCxNQUFNLENBQUMsTUFBa0IsRUFBRSxNQUFrQixFQUFFLE9BQXdDO1lBQ3RGLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsSUFBSSxDQUFDLE1BQWtCLEVBQUUsV0FBdUIsRUFBRSxPQUF3QztZQUN6RixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVELDBCQUEwQjtRQUUxQixJQUFJLGVBQWUsS0FBWSxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLEtBQUssQ0FBQyxHQUFlLEVBQUUsT0FBOEUsSUFBdUIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN6SyJ9