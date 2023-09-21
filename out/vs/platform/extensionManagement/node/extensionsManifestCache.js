/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/extensions/common/extensions", "vs/platform/files/common/files"], function (require, exports, lifecycle_1, extensions_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsManifestCache = void 0;
    class ExtensionsManifestCache extends lifecycle_1.Disposable {
        constructor(userDataProfilesService, fileService, uriIdentityService, extensionsManagementService, logService) {
            super();
            this.userDataProfilesService = userDataProfilesService;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this._register(extensionsManagementService.onDidInstallExtensions(e => this.onDidInstallExtensions(e)));
            this._register(extensionsManagementService.onDidUninstallExtension(e => this.onDidUnInstallExtension(e)));
        }
        onDidInstallExtensions(results) {
            for (const r of results) {
                if (r.local) {
                    this.invalidate(r.profileLocation);
                }
            }
        }
        onDidUnInstallExtension(e) {
            if (!e.error) {
                this.invalidate(e.profileLocation);
            }
        }
        async invalidate(extensionsManifestLocation) {
            if (extensionsManifestLocation) {
                for (const profile of this.userDataProfilesService.profiles) {
                    if (this.uriIdentityService.extUri.isEqual(profile.extensionsResource, extensionsManifestLocation)) {
                        await this.deleteUserCacheFile(profile);
                    }
                }
            }
            else {
                await this.deleteUserCacheFile(this.userDataProfilesService.defaultProfile);
            }
        }
        async deleteUserCacheFile(profile) {
            try {
                await this.fileService.del(this.uriIdentityService.extUri.joinPath(profile.cacheHome, extensions_1.USER_MANIFEST_CACHE_FILE));
            }
            catch (error) {
                if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.logService.error(error);
                }
            }
        }
    }
    exports.ExtensionsManifestCache = ExtensionsManifestCache;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc01hbmlmZXN0Q2FjaGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25NYW5hZ2VtZW50L25vZGUvZXh0ZW5zaW9uc01hbmlmZXN0Q2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLE1BQWEsdUJBQXdCLFNBQVEsc0JBQVU7UUFFdEQsWUFDa0IsdUJBQWlELEVBQ2pELFdBQXlCLEVBQ3pCLGtCQUF1QyxFQUN4RCwyQkFBd0QsRUFDdkMsVUFBdUI7WUFFeEMsS0FBSyxFQUFFLENBQUM7WUFOUyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQ2pELGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3pCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFFdkMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUd4QyxJQUFJLENBQUMsU0FBUyxDQUFDLDJCQUEyQixDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RyxJQUFJLENBQUMsU0FBUyxDQUFDLDJCQUEyQixDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRyxDQUFDO1FBRU8sc0JBQXNCLENBQUMsT0FBMEM7WUFDeEUsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRTtvQkFDWixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztpQkFDbkM7YUFDRDtRQUNGLENBQUM7UUFFTyx1QkFBdUIsQ0FBQyxDQUE2QjtZQUM1RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRTtnQkFDYixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUNuQztRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLDBCQUEyQztZQUMzRCxJQUFJLDBCQUEwQixFQUFFO2dCQUMvQixLQUFLLE1BQU0sT0FBTyxJQUFJLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUU7b0JBQzVELElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLDBCQUEwQixDQUFDLEVBQUU7d0JBQ25HLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUN4QztpQkFDRDthQUNEO2lCQUFNO2dCQUNOLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUM1RTtRQUNGLENBQUM7UUFFTyxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBeUI7WUFDMUQsSUFBSTtnQkFDSCxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUscUNBQXdCLENBQUMsQ0FBQyxDQUFDO2FBQ2pIO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsSUFBSSxJQUFBLDZCQUFxQixFQUFDLEtBQUssQ0FBQywrQ0FBdUMsRUFBRTtvQkFDeEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQzdCO2FBQ0Q7UUFDRixDQUFDO0tBQ0Q7SUFqREQsMERBaURDIn0=