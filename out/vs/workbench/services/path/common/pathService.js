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
define(["require", "exports", "vs/base/common/extpath", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, extpath_1, network_1, path_1, platform_1, resources_1, uri_1, instantiation_1, virtualWorkspace_1, workspace_1, environmentService_1, remoteAgentService_1) {
    "use strict";
    var AbstractPathService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractPathService = exports.IPathService = void 0;
    exports.IPathService = (0, instantiation_1.createDecorator)('pathService');
    let AbstractPathService = AbstractPathService_1 = class AbstractPathService {
        constructor(localUserHome, remoteAgentService, environmentService, contextService) {
            this.localUserHome = localUserHome;
            this.remoteAgentService = remoteAgentService;
            this.environmentService = environmentService;
            this.contextService = contextService;
            // OS
            this.resolveOS = (async () => {
                const env = await this.remoteAgentService.getEnvironment();
                return env?.os || platform_1.OS;
            })();
            // User Home
            this.resolveUserHome = (async () => {
                const env = await this.remoteAgentService.getEnvironment();
                const userHome = this.maybeUnresolvedUserHome = env?.userHome ?? localUserHome;
                return userHome;
            })();
        }
        hasValidBasename(resource, arg2, basename) {
            // async version
            if (typeof arg2 === 'string' || typeof arg2 === 'undefined') {
                return this.resolveOS.then(os => this.doHasValidBasename(resource, os, arg2));
            }
            // sync version
            return this.doHasValidBasename(resource, arg2, basename);
        }
        doHasValidBasename(resource, os, name) {
            // Our `isValidBasename` method only works with our
            // standard schemes for files on disk, either locally
            // or remote.
            if (resource.scheme === network_1.Schemas.file || resource.scheme === network_1.Schemas.vscodeRemote) {
                return (0, extpath_1.isValidBasename)(name ?? (0, resources_1.basename)(resource), os === 1 /* OperatingSystem.Windows */);
            }
            return true;
        }
        get defaultUriScheme() {
            return AbstractPathService_1.findDefaultUriScheme(this.environmentService, this.contextService);
        }
        static findDefaultUriScheme(environmentService, contextService) {
            if (environmentService.remoteAuthority) {
                return network_1.Schemas.vscodeRemote;
            }
            const virtualWorkspace = (0, virtualWorkspace_1.getVirtualWorkspaceScheme)(contextService.getWorkspace());
            if (virtualWorkspace) {
                return virtualWorkspace;
            }
            const firstFolder = contextService.getWorkspace().folders[0];
            if (firstFolder) {
                return firstFolder.uri.scheme;
            }
            const configuration = contextService.getWorkspace().configuration;
            if (configuration) {
                return configuration.scheme;
            }
            return network_1.Schemas.file;
        }
        userHome(options) {
            return options?.preferLocal ? this.localUserHome : this.resolveUserHome;
        }
        get resolvedUserHome() {
            return this.maybeUnresolvedUserHome;
        }
        get path() {
            return this.resolveOS.then(os => {
                return os === 1 /* OperatingSystem.Windows */ ?
                    path_1.win32 :
                    path_1.posix;
            });
        }
        async fileURI(_path) {
            let authority = '';
            // normalize to fwd-slashes on windows,
            // on other systems bwd-slashes are valid
            // filename character, eg /f\oo/ba\r.txt
            const os = await this.resolveOS;
            if (os === 1 /* OperatingSystem.Windows */) {
                _path = _path.replace(/\\/g, '/');
            }
            // check for authority as used in UNC shares
            // or use the path as given
            if (_path[0] === '/' && _path[1] === '/') {
                const idx = _path.indexOf('/', 2);
                if (idx === -1) {
                    authority = _path.substring(2);
                    _path = '/';
                }
                else {
                    authority = _path.substring(2, idx);
                    _path = _path.substring(idx) || '/';
                }
            }
            return uri_1.URI.from({
                scheme: network_1.Schemas.file,
                authority,
                path: _path,
                query: '',
                fragment: ''
            });
        }
    };
    exports.AbstractPathService = AbstractPathService;
    exports.AbstractPathService = AbstractPathService = AbstractPathService_1 = __decorate([
        __param(1, remoteAgentService_1.IRemoteAgentService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, workspace_1.IWorkspaceContextService)
    ], AbstractPathService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvcGF0aC9jb21tb24vcGF0aFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWNuRixRQUFBLFlBQVksR0FBRyxJQUFBLCtCQUFlLEVBQWUsYUFBYSxDQUFDLENBQUM7SUErRGxFLElBQWUsbUJBQW1CLDJCQUFsQyxNQUFlLG1CQUFtQjtRQVN4QyxZQUNTLGFBQWtCLEVBQ1ksa0JBQXVDLEVBQzlCLGtCQUFnRCxFQUM3RCxjQUF3QztZQUhsRSxrQkFBYSxHQUFiLGFBQWEsQ0FBSztZQUNZLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDOUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE4QjtZQUM3RCxtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFHMUUsS0FBSztZQUNMLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDNUIsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBRTNELE9BQU8sR0FBRyxFQUFFLEVBQUUsSUFBSSxhQUFFLENBQUM7WUFDdEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVMLFlBQVk7WUFDWixJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ2xDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUMzRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsR0FBRyxFQUFFLFFBQVEsSUFBSSxhQUFhLENBQUM7Z0JBRS9FLE9BQU8sUUFBUSxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDTixDQUFDO1FB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