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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostInitDataService", "vs/platform/log/common/log", "vs/workbench/api/common/extHostFileSystemConsumer", "vs/base/common/uri"], function (require, exports, instantiation_1, extHostInitDataService_1, log_1, extHostFileSystemConsumer_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionStoragePaths = exports.IExtensionStoragePaths = void 0;
    exports.IExtensionStoragePaths = (0, instantiation_1.createDecorator)('IExtensionStoragePaths');
    let ExtensionStoragePaths = class ExtensionStoragePaths {
        constructor(initData, _logService, _extHostFileSystem) {
            this._logService = _logService;
            this._extHostFileSystem = _extHostFileSystem;
            this._workspace = initData.workspace ?? undefined;
            this._environment = initData.environment;
            this.whenReady = this._getOrCreateWorkspaceStoragePath().then(value => this._value = value);
        }
        async _getWorkspaceStorageURI(storageName) {
            return uri_1.URI.joinPath(this._environment.workspaceStorageHome, storageName);
        }
        async _getOrCreateWorkspaceStoragePath() {
            if (!this._workspace) {
                return Promise.resolve(undefined);
            }
            const storageName = this._workspace.id;
            const storageUri = await this._getWorkspaceStorageURI(storageName);
            try {
                await this._extHostFileSystem.value.stat(storageUri);
                this._logService.trace('[ExtHostStorage] storage dir already exists', storageUri);
                return storageUri;
            }
            catch {
                // doesn't exist, that's OK
            }
            try {
                this._logService.trace('[ExtHostStorage] creating dir and metadata-file', storageUri);
                await this._extHostFileSystem.value.createDirectory(storageUri);
                await this._extHostFileSystem.value.writeFile(uri_1.URI.joinPath(storageUri, 'meta.json'), new TextEncoder().encode(JSON.stringify({
                    id: this._workspace.id,
                    configuration: uri_1.URI.revive(this._workspace.configuration)?.toString(),
                    name: this._workspace.name
                }, undefined, 2)));
                return storageUri;
            }
            catch (e) {
                this._logService.error('[ExtHostStorage]', e);
                return undefined;
            }
        }
        workspaceValue(extension) {
            if (this._value) {
                return uri_1.URI.joinPath(this._value, extension.identifier.value);
            }
            return undefined;
        }
        globalValue(extension) {
            return uri_1.URI.joinPath(this._environment.globalStorageHome, extension.identifier.value.toLowerCase());
        }
        onWillDeactivateAll() {
        }
    };
    exports.ExtensionStoragePaths = ExtensionStoragePaths;
    exports.ExtensionStoragePaths = ExtensionStoragePaths = __decorate([
        __param(0, extHostInitDataService_1.IExtHostInitDataService),
        __param(1, log_1.ILogService),
        __param(2, extHostFileSystemConsumer_1.IExtHostConsumerFileSystem)
    ], ExtensionStoragePaths);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFN0b3JhZ2VQYXRocy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RTdG9yYWdlUGF0aHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBVW5GLFFBQUEsc0JBQXNCLEdBQUcsSUFBQSwrQkFBZSxFQUF5Qix3QkFBd0IsQ0FBQyxDQUFDO0lBVWpHLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXFCO1FBVWpDLFlBQzBCLFFBQWlDLEVBQzFCLFdBQXdCLEVBQ1gsa0JBQThDO1lBRDNELGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ1gsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE0QjtZQUUzRixJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDO1lBQ2xELElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUN6QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUVTLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxXQUFtQjtZQUMxRCxPQUFPLFNBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBRU8sS0FBSyxDQUFDLGdDQUFnQztZQUM3QyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDckIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ2xDO1lBQ0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDdkMsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFbkUsSUFBSTtnQkFDSCxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyw2Q0FBNkMsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDbEYsT0FBTyxVQUFVLENBQUM7YUFDbEI7WUFBQyxNQUFNO2dCQUNQLDJCQUEyQjthQUMzQjtZQUVELElBQUk7Z0JBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsaURBQWlELEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3RGLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2hFLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxTQUFTLENBQzVDLFNBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxFQUNyQyxJQUFJLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUN2QyxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUN0QixhQUFhLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxFQUFFLFFBQVEsRUFBRTtvQkFDcEUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSTtpQkFDMUIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FDakIsQ0FBQztnQkFDRixPQUFPLFVBQVUsQ0FBQzthQUVsQjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNYLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxPQUFPLFNBQVMsQ0FBQzthQUNqQjtRQUNGLENBQUM7UUFFRCxjQUFjLENBQUMsU0FBZ0M7WUFDOUMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNoQixPQUFPLFNBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzdEO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELFdBQVcsQ0FBQyxTQUFnQztZQUMzQyxPQUFPLFNBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ3BHLENBQUM7UUFFRCxtQkFBbUI7UUFDbkIsQ0FBQztLQUNELENBQUE7SUF2RVksc0RBQXFCO29DQUFyQixxQkFBcUI7UUFXL0IsV0FBQSxnREFBdUIsQ0FBQTtRQUN2QixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLHNEQUEwQixDQUFBO09BYmhCLHFCQUFxQixDQXVFakMifQ==