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
    var $zJ_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zJ = exports.$yJ = void 0;
    exports.$yJ = (0, instantiation_1.$Bh)('pathService');
    let $zJ = $zJ_1 = class $zJ {
        constructor(d, e, f, g) {
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            // OS
            this.a = (async () => {
                const env = await this.e.getEnvironment();
                return env?.os || platform_1.OS;
            })();
            // User Home
            this.b = (async () => {
                const env = await this.e.getEnvironment();
                const userHome = this.c = env?.userHome ?? d;
                return userHome;
            })();
        }
        hasValidBasename(resource, arg2, basename) {
            // async version
            if (typeof arg2 === 'string' || typeof arg2 === 'undefined') {
                return this.a.then(os => this.h(resource, os, arg2));
            }
            // sync version
            return this.h(resource, arg2, basename);
        }
        h(resource, os, name) {
            // Our `isValidBasename` method only works with our
            // standard schemes for files on disk, either locally
            // or remote.
            if (resource.scheme === network_1.Schemas.file || resource.scheme === network_1.Schemas.vscodeRemote) {
                return (0, extpath_1.$Gf)(name ?? (0, resources_1.$fg)(resource), os === 1 /* OperatingSystem.Windows */);
            }
            return true;
        }
        get defaultUriScheme() {
            return $zJ_1.findDefaultUriScheme(this.f, this.g);
        }
        static findDefaultUriScheme(environmentService, contextService) {
            if (environmentService.remoteAuthority) {
                return network_1.Schemas.vscodeRemote;
            }
            const virtualWorkspace = (0, virtualWorkspace_1.$vJ)(contextService.getWorkspace());
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
            return options?.preferLocal ? this.d : this.b;
        }
        get resolvedUserHome() {
            return this.c;
        }
        get path() {
            return this.a.then(os => {
                return os === 1 /* OperatingSystem.Windows */ ?
                    path_1.$5d :
                    path_1.$6d;
            });
        }
        async fileURI(_path) {
            let authority = '';
            // normalize to fwd-slashes on windows,
            // on other systems bwd-slashes are valid
            // filename character, eg /f\oo/ba\r.txt
            const os = await this.a;
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
    exports.$zJ = $zJ;
    exports.$zJ = $zJ = $zJ_1 = __decorate([
        __param(1, remoteAgentService_1.$jm),
        __param(2, environmentService_1.$hJ),
        __param(3, workspace_1.$Kh)
    ], $zJ);
});
//# sourceMappingURL=pathService.js.map