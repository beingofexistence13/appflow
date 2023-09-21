/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "vs/nls!vs/platform/files/electron-main/diskFileSystemProviderServer", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/path", "vs/platform/files/node/diskFileSystemProviderServer", "vs/base/common/uriIpc"], function (require, exports, electron_1, nls_1, platform_1, uri_1, files_1, path_1, diskFileSystemProviderServer_1, uriIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$95b = void 0;
    class $95b extends diskFileSystemProviderServer_1.$yr {
        constructor(provider, logService, M) {
            super(provider, logService);
            this.M = M;
        }
        c(ctx) {
            return uriIpc_1.$Cm;
        }
        f(uriTransformer, _resource) {
            return uri_1.URI.revive(_resource);
        }
        //#region Delete: override to support Electron's trash support
        async y(uriTransformer, _resource, opts) {
            if (!opts.useTrash) {
                return super.y(uriTransformer, _resource, opts);
            }
            const resource = this.f(uriTransformer, _resource);
            const filePath = (0, path_1.$7d)(resource.fsPath);
            try {
                await electron_1.shell.trashItem(filePath);
            }
            catch (error) {
                throw (0, files_1.$fk)(platform_1.$i ? (0, nls_1.localize)(0, null, (0, path_1.$ae)(filePath)) : (0, nls_1.localize)(1, null, (0, path_1.$ae)(filePath)), files_1.FileSystemProviderErrorCode.Unknown);
            }
        }
        //#endregion
        //#region File Watching
        L(uriTransformer, emitter) {
            return new SessionFileWatcher(uriTransformer, emitter, this.b, this.M);
        }
    }
    exports.$95b = $95b;
    class SessionFileWatcher extends diskFileSystemProviderServer_1.$zr {
        watch(req, resource, opts) {
            if (opts.recursive) {
                throw (0, files_1.$fk)('Recursive file watching is not supported from main process for performance reasons.', files_1.FileSystemProviderErrorCode.Unavailable);
            }
            return super.watch(req, resource, opts);
        }
    }
});
//# sourceMappingURL=diskFileSystemProviderServer.js.map