/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/api/node/uriTransformer", "vs/platform/files/node/diskFileSystemProvider", "vs/base/common/path", "vs/platform/files/node/diskFileSystemProviderServer"], function (require, exports, uri_1, uriTransformer_1, diskFileSystemProvider_1, path_1, diskFileSystemProviderServer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteAgentFileSystemProviderChannel = void 0;
    class RemoteAgentFileSystemProviderChannel extends diskFileSystemProviderServer_1.AbstractDiskFileSystemProviderChannel {
        constructor(logService, environmentService) {
            super(new diskFileSystemProvider_1.DiskFileSystemProvider(logService), logService);
            this.environmentService = environmentService;
            this.uriTransformerCache = new Map();
            this._register(this.provider);
        }
        getUriTransformer(ctx) {
            let transformer = this.uriTransformerCache.get(ctx.remoteAuthority);
            if (!transformer) {
                transformer = (0, uriTransformer_1.createURITransformer)(ctx.remoteAuthority);
                this.uriTransformerCache.set(ctx.remoteAuthority, transformer);
            }
            return transformer;
        }
        transformIncoming(uriTransformer, _resource, supportVSCodeResource = false) {
            if (supportVSCodeResource && _resource.path === '/vscode-resource' && _resource.query) {
                const requestResourcePath = JSON.parse(_resource.query).requestResourcePath;
                return uri_1.URI.from({ scheme: 'file', path: requestResourcePath });
            }
            return uri_1.URI.revive(uriTransformer.transformIncoming(_resource));
        }
        //#region File Watching
        createSessionFileWatcher(uriTransformer, emitter) {
            return new SessionFileWatcher(uriTransformer, emitter, this.logService, this.environmentService);
        }
    }
    exports.RemoteAgentFileSystemProviderChannel = RemoteAgentFileSystemProviderChannel;
    class SessionFileWatcher extends diskFileSystemProviderServer_1.AbstractSessionFileWatcher {
        constructor(uriTransformer, sessionEmitter, logService, environmentService) {
            super(uriTransformer, sessionEmitter, logService, environmentService);
        }
        getRecursiveWatcherOptions(environmentService) {
            const fileWatcherPolling = environmentService.args['file-watcher-polling'];
            if (fileWatcherPolling) {
                const segments = fileWatcherPolling.split(path_1.delimiter);
                const pollingInterval = Number(segments[0]);
                if (pollingInterval > 0) {
                    const usePolling = segments.length > 1 ? segments.slice(1) : true;
                    return { usePolling, pollingInterval };
                }
            }
            return undefined;
        }
        getExtraExcludes(environmentService) {
            if (environmentService.extensionsPath) {
                // when opening the $HOME folder, we end up watching the extension folder
                // so simply exclude watching the extensions folder
                return [path_1.posix.join(environmentService.extensionsPath, '**')];
            }
            return undefined;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRmlsZVN5c3RlbVByb3ZpZGVyU2VydmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvc2VydmVyL25vZGUvcmVtb3RlRmlsZVN5c3RlbVByb3ZpZGVyU2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWVoRyxNQUFhLG9DQUFxQyxTQUFRLG9FQUFtRTtRQUk1SCxZQUNDLFVBQXVCLEVBQ04sa0JBQTZDO1lBRTlELEtBQUssQ0FBQyxJQUFJLCtDQUFzQixDQUFDLFVBQVUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRnpDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBMkI7WUFKOUMsd0JBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQTJCLENBQUM7WUFRekUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVrQixpQkFBaUIsQ0FBQyxHQUFpQztZQUNyRSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNqQixXQUFXLEdBQUcsSUFBQSxxQ0FBb0IsRUFBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3hELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQzthQUMvRDtZQUVELE9BQU8sV0FBVyxDQUFDO1FBQ3BCLENBQUM7UUFFa0IsaUJBQWlCLENBQUMsY0FBK0IsRUFBRSxTQUF3QixFQUFFLHFCQUFxQixHQUFHLEtBQUs7WUFDNUgsSUFBSSxxQkFBcUIsSUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLGtCQUFrQixJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3RGLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsbUJBQW1CLENBQUM7Z0JBRTVFLE9BQU8sU0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQzthQUMvRDtZQUVELE9BQU8sU0FBRyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRUQsdUJBQXVCO1FBRWIsd0JBQXdCLENBQUMsY0FBK0IsRUFBRSxPQUF3QztZQUMzRyxPQUFPLElBQUksa0JBQWtCLENBQUMsY0FBYyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2xHLENBQUM7S0FHRDtJQXhDRCxvRkF3Q0M7SUFFRCxNQUFNLGtCQUFtQixTQUFRLHlEQUEwQjtRQUUxRCxZQUNDLGNBQStCLEVBQy9CLGNBQStDLEVBQy9DLFVBQXVCLEVBQ3ZCLGtCQUE2QztZQUU3QyxLQUFLLENBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRWtCLDBCQUEwQixDQUFDLGtCQUE2QztZQUMxRixNQUFNLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQzNFLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3ZCLE1BQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxnQkFBUyxDQUFDLENBQUM7Z0JBQ3JELE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxFQUFFO29CQUN4QixNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNsRSxPQUFPLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxDQUFDO2lCQUN2QzthQUNEO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVrQixnQkFBZ0IsQ0FBQyxrQkFBNkM7WUFDaEYsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLEVBQUU7Z0JBQ3RDLHlFQUF5RTtnQkFDekUsbURBQW1EO2dCQUNuRCxPQUFPLENBQUMsWUFBSyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUM3RDtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7S0FDRCJ9