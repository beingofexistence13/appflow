/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "vs/nls", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/path", "vs/platform/files/node/diskFileSystemProviderServer", "vs/base/common/uriIpc"], function (require, exports, electron_1, nls_1, platform_1, uri_1, files_1, path_1, diskFileSystemProviderServer_1, uriIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiskFileSystemProviderChannel = void 0;
    class DiskFileSystemProviderChannel extends diskFileSystemProviderServer_1.AbstractDiskFileSystemProviderChannel {
        constructor(provider, logService, environmentService) {
            super(provider, logService);
            this.environmentService = environmentService;
        }
        getUriTransformer(ctx) {
            return uriIpc_1.DefaultURITransformer;
        }
        transformIncoming(uriTransformer, _resource) {
            return uri_1.URI.revive(_resource);
        }
        //#region Delete: override to support Electron's trash support
        async delete(uriTransformer, _resource, opts) {
            if (!opts.useTrash) {
                return super.delete(uriTransformer, _resource, opts);
            }
            const resource = this.transformIncoming(uriTransformer, _resource);
            const filePath = (0, path_1.normalize)(resource.fsPath);
            try {
                await electron_1.shell.trashItem(filePath);
            }
            catch (error) {
                throw (0, files_1.createFileSystemProviderError)(platform_1.isWindows ? (0, nls_1.localize)('binFailed', "Failed to move '{0}' to the recycle bin", (0, path_1.basename)(filePath)) : (0, nls_1.localize)('trashFailed', "Failed to move '{0}' to the trash", (0, path_1.basename)(filePath)), files_1.FileSystemProviderErrorCode.Unknown);
            }
        }
        //#endregion
        //#region File Watching
        createSessionFileWatcher(uriTransformer, emitter) {
            return new SessionFileWatcher(uriTransformer, emitter, this.logService, this.environmentService);
        }
    }
    exports.DiskFileSystemProviderChannel = DiskFileSystemProviderChannel;
    class SessionFileWatcher extends diskFileSystemProviderServer_1.AbstractSessionFileWatcher {
        watch(req, resource, opts) {
            if (opts.recursive) {
                throw (0, files_1.createFileSystemProviderError)('Recursive file watching is not supported from main process for performance reasons.', files_1.FileSystemProviderErrorCode.Unavailable);
            }
            return super.watch(req, resource, opts);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlza0ZpbGVTeXN0ZW1Qcm92aWRlclNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL2VsZWN0cm9uLW1haW4vZGlza0ZpbGVTeXN0ZW1Qcm92aWRlclNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLE1BQWEsNkJBQThCLFNBQVEsb0VBQThDO1FBRWhHLFlBQ0MsUUFBZ0MsRUFDaEMsVUFBdUIsRUFDTixrQkFBdUM7WUFFeEQsS0FBSyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUZYLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7UUFHekQsQ0FBQztRQUVrQixpQkFBaUIsQ0FBQyxHQUFZO1lBQ2hELE9BQU8sOEJBQXFCLENBQUM7UUFDOUIsQ0FBQztRQUVrQixpQkFBaUIsQ0FBQyxjQUErQixFQUFFLFNBQXdCO1lBQzdGLE9BQU8sU0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQsOERBQThEO1FBRTNDLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBK0IsRUFBRSxTQUF3QixFQUFFLElBQXdCO1lBQ2xILElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNuQixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNyRDtZQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDbkUsTUFBTSxRQUFRLEdBQUcsSUFBQSxnQkFBUyxFQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1QyxJQUFJO2dCQUNILE1BQU0sZ0JBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDaEM7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixNQUFNLElBQUEscUNBQTZCLEVBQUMsb0JBQVMsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLHlDQUF5QyxFQUFFLElBQUEsZUFBUSxFQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSxtQ0FBbUMsRUFBRSxJQUFBLGVBQVEsRUFBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLG1DQUEyQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzlQO1FBQ0YsQ0FBQztRQUVELFlBQVk7UUFFWix1QkFBdUI7UUFFYix3QkFBd0IsQ0FBQyxjQUErQixFQUFFLE9BQXdDO1lBQzNHLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDbEcsQ0FBQztLQUlEO0lBNUNELHNFQTRDQztJQUVELE1BQU0sa0JBQW1CLFNBQVEseURBQTBCO1FBRWpELEtBQUssQ0FBQyxHQUFXLEVBQUUsUUFBYSxFQUFFLElBQW1CO1lBQzdELElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbkIsTUFBTSxJQUFBLHFDQUE2QixFQUFDLHFGQUFxRixFQUFFLG1DQUEyQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3BLO1lBRUQsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDekMsQ0FBQztLQUNEIn0=