/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/api/node/uriTransformer", "vs/platform/files/node/diskFileSystemProvider", "vs/base/common/path", "vs/platform/files/node/diskFileSystemProviderServer"], function (require, exports, uri_1, uriTransformer_1, diskFileSystemProvider_1, path_1, diskFileSystemProviderServer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ar = void 0;
    class $Ar extends diskFileSystemProviderServer_1.$yr {
        constructor(logService, N) {
            super(new diskFileSystemProvider_1.$3p(logService), logService);
            this.N = N;
            this.M = new Map();
            this.B(this.a);
        }
        c(ctx) {
            let transformer = this.M.get(ctx.remoteAuthority);
            if (!transformer) {
                transformer = (0, uriTransformer_1.$qr)(ctx.remoteAuthority);
                this.M.set(ctx.remoteAuthority, transformer);
            }
            return transformer;
        }
        f(uriTransformer, _resource, supportVSCodeResource = false) {
            if (supportVSCodeResource && _resource.path === '/vscode-resource' && _resource.query) {
                const requestResourcePath = JSON.parse(_resource.query).requestResourcePath;
                return uri_1.URI.from({ scheme: 'file', path: requestResourcePath });
            }
            return uri_1.URI.revive(uriTransformer.transformIncoming(_resource));
        }
        //#region File Watching
        L(uriTransformer, emitter) {
            return new SessionFileWatcher(uriTransformer, emitter, this.b, this.N);
        }
    }
    exports.$Ar = $Ar;
    class SessionFileWatcher extends diskFileSystemProviderServer_1.$zr {
        constructor(uriTransformer, sessionEmitter, logService, environmentService) {
            super(uriTransformer, sessionEmitter, logService, environmentService);
        }
        j(environmentService) {
            const fileWatcherPolling = environmentService.args['file-watcher-polling'];
            if (fileWatcherPolling) {
                const segments = fileWatcherPolling.split(path_1.$ge);
                const pollingInterval = Number(segments[0]);
                if (pollingInterval > 0) {
                    const usePolling = segments.length > 1 ? segments.slice(1) : true;
                    return { usePolling, pollingInterval };
                }
            }
            return undefined;
        }
        m(environmentService) {
            if (environmentService.extensionsPath) {
                // when opening the $HOME folder, we end up watching the extension folder
                // so simply exclude watching the extensions folder
                return [path_1.$6d.join(environmentService.extensionsPath, '**')];
            }
            return undefined;
        }
    }
});
//# sourceMappingURL=remoteFileSystemProviderServer.js.map